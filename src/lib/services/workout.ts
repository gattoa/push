import type { WeeklyPlan, PlannedDay, PlannedExercise, PlannedSet, SetLog, GeneratedPlan } from '$lib/types';
import {
	mockWeeklyPlan,
	mockPlannedDays,
	mockPlannedExercises,
	mockPlannedSets,
	mockSetLogs
} from '$lib/mock/workouts';

export interface CurrentWeekData {
	plan: WeeklyPlan;
	days: PlannedDay[];
	exercises: PlannedExercise[];
	plannedSets: PlannedSet[];
	setLogs: SetLog[];
}

const GENERATED_PLAN_KEY = 'push_generated_plan';
const SET_LOGS_KEY = 'push_set_logs';

/** Save a generated plan to localStorage. */
export function saveGeneratedPlan(generated: GeneratedPlan): void {
	localStorage.setItem(GENERATED_PLAN_KEY, JSON.stringify(generated));
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
function getCurrentWeekStart(): string {
	const now = new Date();
	const day = now.getDay(); // 0=Sun, 1=Mon...
	const diff = day === 0 ? 6 : day - 1; // days since Monday
	const monday = new Date(now);
	monday.setDate(now.getDate() - diff);
	return monday.toISOString().split('T')[0];
}

/** Fetch the current week's plan + logs. Uses generated plan if available, falls back to mock data. */
export async function getCurrentWeek(): Promise<CurrentWeekData> {
	if (typeof localStorage !== 'undefined') {
		const raw = localStorage.getItem(GENERATED_PLAN_KEY);
		if (raw) {
			try {
				const generated: GeneratedPlan = JSON.parse(raw);
				const weekStart = getCurrentWeekStart();
				const plan: WeeklyPlan = {
					id: 'gen-plan-1',
					user_id: 'user-1',
					week_start: weekStart,
					review_day: 6,
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

	return {
		plan: mockWeeklyPlan,
		days: mockPlannedDays,
		exercises: structuredClone(mockPlannedExercises),
		plannedSets: structuredClone(mockPlannedSets),
		setLogs: structuredClone(mockSetLogs)
	};
}

/** Persist all set logs to localStorage. */
export function persistSetLogs(logs: SetLog[]): void {
	if (typeof localStorage !== 'undefined') {
		localStorage.setItem(SET_LOGS_KEY, JSON.stringify(logs));
	}
}
