import type { WeeklyPlan, PlannedDay, PlannedExercise, PlannedSet, SetLog } from '$lib/types';
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

/** Fetch the current week's plan + logs. Returns mock data now; Supabase later. */
export async function getCurrentWeek(): Promise<CurrentWeekData> {
	return {
		plan: mockWeeklyPlan,
		days: mockPlannedDays,
		exercises: structuredClone(mockPlannedExercises),
		plannedSets: structuredClone(mockPlannedSets),
		setLogs: structuredClone(mockSetLogs)
	};
}

/** Persist a set log update. No-op for mock; writes to Supabase later. */
export async function saveSetLog(_setLog: SetLog): Promise<void> {
	// Mock: no-op. Supabase: upsert to set_logs table.
}
