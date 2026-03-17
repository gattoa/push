import type { WeeklyPlan, PlannedDay, PlannedExercise, PlannedSet, SetLog, GeneratedPlan } from '$lib/types';
import { getUserId } from '$lib/utils/auth';
import { savePlanToSupabase, fetchCurrentPlan, upsertSetLogs } from '$lib/services/supabase-sync';
import { clearWeekData } from '$lib/utils/storage';

export interface CurrentWeekData {
	plan: WeeklyPlan;
	days: PlannedDay[];
	exercises: PlannedExercise[];
	plannedSets: PlannedSet[];
	setLogs: SetLog[];
}

const GENERATED_PLAN_KEY = 'push_generated_plan';
const SET_LOGS_KEY = 'push_set_logs';

/** Save a generated plan to localStorage + Supabase. */
export async function saveGeneratedPlan(generated: GeneratedPlan): Promise<void> {
	// localStorage first (synchronous, immediate) — embed week_start for rollover detection
	localStorage.setItem(GENERATED_PLAN_KEY, JSON.stringify({ ...generated, week_start: getCurrentWeekStart() }));

	// Supabase (async, best-effort)
	try {
		const userId = await getUserId();
		const weekStart = getCurrentWeekStart();
		await savePlanToSupabase(userId, generated, weekStart);
		console.log('[Push] Plan saved to Supabase');
	} catch (e) {
		console.warn('[Push] Supabase plan save failed:', e instanceof Error ? e.message : e);
	}
}

/** Build SetLogs (all uncompleted) from a generated plan's sets. */
function createEmptySetLogs(sets: PlannedSet[]): SetLog[] {
	return sets.map(ps => ({
		id: `log-${ps.id}`,
		workout_log_id: `wlog-${ps.planned_exercise_id}`,
		planned_exercise_id: ps.planned_exercise_id,
		planned_set_id: ps.id,
		set_number: ps.set_number,
		actual_reps: null,
		actual_weight: null,
		completed: false
	}));
}

/** Merge saved set logs from localStorage into freshly created empty logs. */
function mergeSavedLogs(emptyLogs: SetLog[]): SetLog[] {
	if (typeof localStorage === 'undefined') return emptyLogs;
	const raw = localStorage.getItem(SET_LOGS_KEY);
	if (!raw) return emptyLogs;
	try {
		const saved: SetLog[] = JSON.parse(raw);
		const savedById = new Map(saved.map(s => [s.id, s]));
		return emptyLogs.map(log => {
			const s = savedById.get(log.id);
			if (!s) return log;
			return { ...log, actual_reps: s.actual_reps, actual_weight: s.actual_weight, completed: s.completed, drop_logs: s.drop_logs ?? log.drop_logs };
		});
	} catch {
		return emptyLogs;
	}
}

/** Compute the Monday of the current week as ISO date. */
export function getCurrentWeekStart(): string {
	const now = new Date();
	const day = now.getDay(); // 0=Sun, 1=Mon...
	const diff = day === 0 ? 6 : day - 1; // days since Monday
	const monday = new Date(now);
	monday.setDate(now.getDate() - diff);
	return monday.toISOString().split('T')[0];
}

/** Update localStorage cache from Supabase data. */
function cacheToLocalStorage(data: CurrentWeekData): void {
	if (typeof localStorage === 'undefined') return;
	const generated: GeneratedPlan = {
		days: data.days,
		exercises: data.exercises,
		sets: data.plannedSets,
		source: data.plan.source ?? 'mock'
	};
	localStorage.setItem(GENERATED_PLAN_KEY, JSON.stringify({ ...generated, week_start: data.plan.week_start }));
	localStorage.setItem(SET_LOGS_KEY, JSON.stringify(data.setLogs));
}

/** Fetch the current week's plan + logs. Tries Supabase first, falls back to localStorage. Returns null if no plan exists. */
export async function getCurrentWeek(): Promise<CurrentWeekData | null> {
	const userId = typeof localStorage !== 'undefined' ? await getUserId() : '';
	const weekStart = getCurrentWeekStart();

	// 1. Try Supabase
	if (userId) {
		try {
			const supabaseData = await fetchCurrentPlan(userId, weekStart);
			if (supabaseData && supabaseData.days.length > 0) {
				cacheToLocalStorage(supabaseData);
				return supabaseData;
			}
		} catch (e) {
			console.warn('[Push] Supabase fetch failed, falling back to localStorage:', e instanceof Error ? e.message : e);
		}
	}

	// 2. Fall back to localStorage (and sync to Supabase if missing)
	if (typeof localStorage !== 'undefined') {
		const raw = localStorage.getItem(GENERATED_PLAN_KEY);
		if (raw) {
			try {
				const generated: GeneratedPlan & { week_start?: string } = JSON.parse(raw);

				// Week rollover: if stored plan is from a previous week, clear and regenerate
				if (generated.week_start && generated.week_start !== weekStart) {
					console.log(`[Push] Week rollover: stored plan is from ${generated.week_start}, current week is ${weekStart}`);
					clearWeekData();
					// Fall through — Today page will auto-trigger generation
				} else {
					// Backfill: sync localStorage plan to Supabase so foreign keys exist
					if (userId) {
						savePlanToSupabase(userId, generated, weekStart)
							.then(() => {
								// Also sync any existing set logs
								const logsRaw = localStorage.getItem(SET_LOGS_KEY);
								if (logsRaw) {
									const logs: SetLog[] = JSON.parse(logsRaw);
									return upsertSetLogs(logs);
								}
							})
							.then(() => console.log('[Push] Backfilled plan + logs to Supabase'))
							.catch(e => console.warn('[Push] Backfill failed:', e instanceof Error ? e.message : e));
					}

					const plan: WeeklyPlan = {
						id: 'gen-plan-1',
						user_id: userId || 'user-1',
						week_start: weekStart,
						review_day: 6,
						source: generated.source,
						created_at: new Date().toISOString()
					};
					return {
						plan,
						days: generated.days,
						exercises: structuredClone(generated.exercises),
						plannedSets: structuredClone(generated.sets),
						setLogs: mergeSavedLogs(createEmptySetLogs(generated.sets))
					};
				}
			} catch { /* fall through */ }
		}
	}

	// 3. No plan found — caller should trigger generation
	return null;
}

/** Persist a day swap to localStorage + Supabase. */
export function persistDaySwap(updatedDays: PlannedDay[], allExercises: PlannedExercise[], allSets: PlannedSet[]): void {
	if (typeof localStorage !== 'undefined') {
		const raw = localStorage.getItem(GENERATED_PLAN_KEY);
		if (raw) {
			try {
				const generated: GeneratedPlan = JSON.parse(raw);
				generated.days = updatedDays;
				generated.exercises = allExercises;
				generated.sets = allSets;
				localStorage.setItem(GENERATED_PLAN_KEY, JSON.stringify(generated));
			} catch { /* ignore */ }
		}
	}

	// Async Supabase update — just update day_of_week on each day
	import('$lib/api/supabase').then(({ supabase }) => {
		const updates = updatedDays.map(d =>
			supabase.from('planned_days').update({ day_of_week: d.day_of_week }).eq('id', d.id)
		);
		Promise.all(updates).catch(e =>
			console.warn('[Push] Supabase day swap failed:', e instanceof Error ? e.message : e)
		);
	});
}

/** Debounce timer for Supabase sync. */
let syncTimeout: ReturnType<typeof setTimeout> | null = null;

/** Persist all set logs to localStorage + debounced Supabase upsert. */
export function persistSetLogs(logs: SetLog[]): void {
	// localStorage first (synchronous, immediate)
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(SET_LOGS_KEY, JSON.stringify(logs));
	}

	// Debounced Supabase sync (300ms)
	if (syncTimeout) clearTimeout(syncTimeout);
	syncTimeout = setTimeout(() => {
		upsertSetLogs(logs).catch(err =>
			console.warn('[Push] Supabase set log sync failed:', err instanceof Error ? err.message : err)
		);
	}, 300);
}
