import type { WeeklyPlan, PlannedDay, PlannedExercise, PlannedSet, SetLog, WorkoutLog } from '$lib/types';
import {
	mockWeeklyPlan,
	mockPlannedDays,
	mockPlannedExercises,
	mockPlannedSets,
	mockSetLogs
} from '$lib/mock/workouts';

// Single source of truth for the current week's workout state.
// Both Today page and Exercise Detail read/write this store.
// Later: initialize from Supabase instead of mock data.

let plan = $state<WeeklyPlan>(mockWeeklyPlan);
let days = $state<PlannedDay[]>(mockPlannedDays);
let exercises = $state<PlannedExercise[]>(structuredClone(mockPlannedExercises));
let plannedSets = $state<PlannedSet[]>(structuredClone(mockPlannedSets));
let setLogs = $state<SetLog[]>(structuredClone(mockSetLogs));

// --- Getters ---

export function getPlan(): WeeklyPlan {
	return plan;
}

export function getDays(): PlannedDay[] {
	return days;
}

export function getDay(dayIndex: number): PlannedDay {
	return days[dayIndex];
}

export function getExercises(): PlannedExercise[] {
	return exercises;
}

export function getExercisesForDay(dayId: string): PlannedExercise[] {
	return exercises.filter(e => e.planned_day_id === dayId);
}

export function getExerciseByDbId(exercisedbId: string): PlannedExercise | undefined {
	return exercises.find(e => e.exercisedb_id === exercisedbId);
}

export function getSetsForExercise(exerciseId: string): PlannedSet[] {
	return plannedSets
		.filter(s => s.planned_exercise_id === exerciseId)
		.sort((a, b) => a.set_number - b.set_number);
}

export function getLogsForExercise(exerciseId: string): SetLog[] {
	return setLogs
		.filter(s => s.planned_exercise_id === exerciseId)
		.sort((a, b) => a.set_number - b.set_number);
}

export function getPlannedSetsForDay(dayId: string): PlannedSet[] {
	const dayExercises = getExercisesForDay(dayId);
	return plannedSets.filter(s => dayExercises.some(e => e.id === s.planned_exercise_id));
}

export function getSetLogsForDay(dayId: string): SetLog[] {
	const dayExercises = getExercisesForDay(dayId);
	return setLogs.filter(s => dayExercises.some(e => e.id === s.planned_exercise_id));
}

export function getAllSetLogs(): SetLog[] {
	return setLogs;
}

export function getAllPlannedSets(): PlannedSet[] {
	return plannedSets;
}

// --- Mutations ---

export function toggleSet(setLogId: string): void {
	const log = setLogs.find(s => s.id === setLogId);
	if (!log) return;

	const planned = plannedSets.find(ps => ps.id === log.planned_set_id);
	if (!planned) return;

	log.completed = !log.completed;

	if (log.completed) {
		log.actual_reps = planned.target_reps;
		log.actual_weight = planned.target_weight;
		if (planned.drops && log.drop_logs) {
			for (let i = 0; i < planned.drops.length; i++) {
				log.drop_logs[i] = {
					actual_reps: planned.drops[i].target_reps,
					actual_weight: planned.drops[i].target_weight
				};
			}
		}
	} else {
		log.actual_reps = null;
		log.actual_weight = null;
		if (log.drop_logs) {
			for (let i = 0; i < log.drop_logs.length; i++) {
				log.drop_logs[i] = { actual_reps: null, actual_weight: null };
			}
		}
	}
}

export function updateSet(setLogId: string, values: { actual_reps?: number | null; actual_weight?: number | null }): void {
	const log = setLogs.find(s => s.id === setLogId);
	if (!log) return;

	if (values.actual_reps !== undefined) log.actual_reps = values.actual_reps;
	if (values.actual_weight !== undefined) log.actual_weight = values.actual_weight;
}

export function updateDropLog(setLogId: string, dropIndex: number, values: { actual_reps?: number | null; actual_weight?: number | null }): void {
	const log = setLogs.find(s => s.id === setLogId);
	if (!log?.drop_logs?.[dropIndex]) return;

	if (values.actual_reps !== undefined) log.drop_logs[dropIndex].actual_reps = values.actual_reps;
	if (values.actual_weight !== undefined) log.drop_logs[dropIndex].actual_weight = values.actual_weight;
}

export function completeAllSets(exerciseId: string): void {
	const exerciseLogs = setLogs.filter(s => s.planned_exercise_id === exerciseId);
	for (const log of exerciseLogs) {
		if (log.completed) continue;
		const planned = plannedSets.find(ps => ps.id === log.planned_set_id);
		if (!planned) continue;

		log.completed = true;
		log.actual_reps = planned.target_reps;
		log.actual_weight = planned.target_weight;
		if (planned.drops && log.drop_logs) {
			for (let i = 0; i < planned.drops.length; i++) {
				log.drop_logs[i] = {
					actual_reps: planned.drops[i].target_reps,
					actual_weight: planned.drops[i].target_weight
				};
			}
		}
	}
}
