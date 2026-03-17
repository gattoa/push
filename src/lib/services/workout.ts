import type { WeeklyPlan, PlannedDay, PlannedExercise, PlannedSet, SetLog, GeneratedPlan } from '$lib/types';
import {
	mockWeeklyPlan,
	mockPlannedDays,
	mockPlannedExercises,
	mockPlannedSets,
	mockSetLogs
} from '$lib/mock/workouts';
import { getDeviceId } from '$lib/utils/device';
import { savePlanToSupabase, fetchCurrentPlan, upsertSetLogs } from '$lib/services/supabase-sync';

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
	// localStorage first (synchronous, immediate)
	localStorage.setItem(GENERATED_PLAN_KEY, JSON.stringify(generated));

	// Supabase (async, best-effort)
	try {
		const deviceId = getDeviceId();
		const weekStart = getCurrentWeekStart();
		await savePlanToSupabase(deviceId, generated, weekStart);
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
	localStorage.setItem(GENERATED_PLAN_KEY, JSON.stringify(generated));
	localStorage.setItem(SET_LOGS_KEY, JSON.stringify(data.setLogs));
}

/** Fetch the current week's plan + logs. Tries Supabase first, falls back to localStorage, then mock. */
export async function getCurrentWeek(): Promise<CurrentWeekData> {
	const deviceId = typeof localStorage !== 'undefined' ? getDeviceId() : '';
	const weekStart = getCurrentWeekStart();

	// 1. Try Supabase
	if (deviceId) {
		try {
			const supabaseData = await fetchCurrentPlan(deviceId, weekStart);
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
				const generated: GeneratedPlan = JSON.parse(raw);

				// Backfill: sync localStorage plan to Supabase so foreign keys exist
				if (deviceId) {
					savePlanToSupabase(deviceId, generated, weekStart)
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
					user_id: deviceId || 'user-1',
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
			} catch { /* fall through to mock */ }
		}
	}

	// 3. Fall back to mock data
	return {
		plan: mockWeeklyPlan,
		days: mockPlannedDays,
		exercises: structuredClone(mockPlannedExercises),
		plannedSets: structuredClone(mockPlannedSets),
		setLogs: structuredClone(mockSetLogs)
	};
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
