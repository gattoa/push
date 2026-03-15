import type { WeeklyPlan, PlannedDay, PlannedExercise, PlannedSet, SetLog } from '$lib/types';

export const mockWeeklyPlan: WeeklyPlan = {
	id: 'plan-1',
	user_id: 'user-1',
	week_start: '2026-03-09', // Monday
	review_day: 6, // Sunday
	created_at: '2026-03-09T00:00:00Z'
};

export const mockPlannedDays: PlannedDay[] = [
	{ id: 'day-0', plan_id: 'plan-1', day_of_week: 0, label: 'Push', is_rest_day: false, is_review_day: false },
	{ id: 'day-1', plan_id: 'plan-1', day_of_week: 1, label: 'Pull', is_rest_day: false, is_review_day: false },
	{ id: 'day-2', plan_id: 'plan-1', day_of_week: 2, label: 'Legs', is_rest_day: false, is_review_day: false },
	{ id: 'day-3', plan_id: 'plan-1', day_of_week: 3, label: 'Rest', is_rest_day: true, is_review_day: false },
	{ id: 'day-4', plan_id: 'plan-1', day_of_week: 4, label: 'Push', is_rest_day: false, is_review_day: false },
	{ id: 'day-5', plan_id: 'plan-1', day_of_week: 5, label: 'Pull', is_rest_day: false, is_review_day: false },
	{ id: 'day-6', plan_id: 'plan-1', day_of_week: 6, label: 'Review', is_rest_day: false, is_review_day: true }
];

export const mockPlannedExercises: PlannedExercise[] = [
	// Monday - Push
	{ id: 'ex-0-0', planned_day_id: 'day-0', exercisedb_id: 'exr_41n2hxnFMotsXTj3', exercise_name: 'Bench Press', body_parts: ['CHEST'], equipments: ['barbell', 'bench'], cue: 'slow eccentric', order: 0 },
	{ id: 'ex-0-1', planned_day_id: 'day-0', exercisedb_id: 'exr_41n2hs6camM22yBG', exercise_name: 'Seated Shoulder Press', body_parts: ['SHOULDERS'], equipments: ['dumbbell'], order: 1 },
	{ id: 'ex-0-2', planned_day_id: 'day-0', exercisedb_id: 'exr_41n2hMRXm49mM62z', exercise_name: 'Arnold Press', body_parts: ['SHOULDERS'], equipments: ['dumbbell'], cue: '2-sec pause at top', order: 2 },

	// Tuesday - Pull
	{ id: 'ex-1-0', planned_day_id: 'day-1', exercisedb_id: 'exr_41n2hHdjQpnyNdie', exercise_name: 'One Arm Bent-over Row', body_parts: ['BACK'], equipments: ['dumbbell'], order: 0 },
	{ id: 'ex-1-1', planned_day_id: 'day-1', exercisedb_id: 'exr_41n2hU4y6EaYXFhr', exercise_name: 'Pull up', body_parts: ['BACK'], equipments: ['body weight'], order: 1 },
	{ id: 'ex-1-2', planned_day_id: 'day-1', exercisedb_id: 'exr_41n2hGioS8HumEF7', exercise_name: 'Hammer Curl', body_parts: ['FOREARMS'], equipments: ['dumbbell'], order: 2 },

	// Wednesday - Legs
	{ id: 'ex-2-0', planned_day_id: 'day-2', exercisedb_id: 'exr_41n2hmGR8WuVfe1U', exercise_name: 'Squat', body_parts: ['QUADRICEPS', 'THIGHS'], equipments: ['barbell', 'squat rack'], order: 0 },
	{ id: 'ex-2-1', planned_day_id: 'day-2', exercisedb_id: 'exr_41n2hn8rpbYihzEW', exercise_name: 'Romanian Deadlift', body_parts: ['HIPS'], equipments: ['barbell'], cue: 'hinge at hips', order: 1 },
	{ id: 'ex-2-2', planned_day_id: 'day-2', exercisedb_id: 'exr_41n2hpLLs1uU5atr', exercise_name: 'Bulgarian Split Squat', body_parts: ['QUADRICEPS', 'THIGHS'], equipments: ['dumbbell', 'bench'], order: 2 },
	{ id: 'ex-2-3', planned_day_id: 'day-2', exercisedb_id: 'exr_41n2hTs4q3ihihZs', exercise_name: 'Seated Calf Raise', body_parts: ['CALVES'], equipments: ['machine'], order: 3 },

	// Thursday - Rest (no exercises)

	// Friday - Push
	{ id: 'ex-4-0', planned_day_id: 'day-4', exercisedb_id: 'exr_41n2hsVHu7B1MTdr', exercise_name: 'Palms In Incline Bench Press', body_parts: ['UPPER ARMS'], equipments: ['dumbbell', 'bench'], cue: 'neutral grip', order: 0 },
	{ id: 'ex-4-1', planned_day_id: 'day-4', exercisedb_id: 'exr_41n2hjuGpcex14w7', exercise_name: 'Lateral Raise', body_parts: ['SHOULDERS'], equipments: ['dumbbell'], order: 1 },
	{ id: 'ex-4-2', planned_day_id: 'day-4', exercisedb_id: 'exr_41n2hkK8hGAcSnW7', exercise_name: 'Chest Dip', body_parts: ['CHEST'], equipments: ['body weight'], order: 2 },

	// Saturday - Pull
	{ id: 'ex-5-0', planned_day_id: 'day-5', exercisedb_id: 'exr_41n2hadPLLFRGvFk', exercise_name: 'Sliding Floor Pulldown on Towel', body_parts: ['BACK'], equipments: ['towel'], order: 0 },
	{ id: 'ex-5-1', planned_day_id: 'day-5', exercisedb_id: 'exr_41n2hcFJpBvAkXCP', exercise_name: 'Seated Row with Towel', body_parts: ['BACK'], equipments: ['towel'], order: 1 },
	{ id: 'ex-5-2', planned_day_id: 'day-5', exercisedb_id: 'exr_41n2hgCHNgtVLHna', exercise_name: 'Cross Body Hammer Curl', body_parts: ['FOREARMS'], equipments: ['dumbbell'], order: 2 }
];

export const mockPlannedSets: PlannedSet[] = [
	// Monday - Bench Press: pyramid
	{ id: 'ps-0-0-1', planned_exercise_id: 'ex-0-0', set_number: 1, target_reps: 10, target_weight: 135 },
	{ id: 'ps-0-0-2', planned_exercise_id: 'ex-0-0', set_number: 2, target_reps: 8, target_weight: 155 },
	{ id: 'ps-0-0-3', planned_exercise_id: 'ex-0-0', set_number: 3, target_reps: 6, target_weight: 175 },
	// Monday - Shoulder Press: ascending weight
	{ id: 'ps-0-1-1', planned_exercise_id: 'ex-0-1', set_number: 1, target_reps: 10, target_weight: 55 },
	{ id: 'ps-0-1-2', planned_exercise_id: 'ex-0-1', set_number: 2, target_reps: 8, target_weight: 65 },
	{ id: 'ps-0-1-3', planned_exercise_id: 'ex-0-1', set_number: 3, target_reps: 6, target_weight: 75 },
	// Monday - Tricep Pushdown: same weight, descending reps
	{ id: 'ps-0-2-1', planned_exercise_id: 'ex-0-2', set_number: 1, target_reps: 12, target_weight: 40 },
	{ id: 'ps-0-2-2', planned_exercise_id: 'ex-0-2', set_number: 2, target_reps: 10, target_weight: 40 },
	{ id: 'ps-0-2-3', planned_exercise_id: 'ex-0-2', set_number: 3, target_reps: 8, target_weight: 45 },

	// Tuesday - Barbell Row: pyramid
	{ id: 'ps-1-0-1', planned_exercise_id: 'ex-1-0', set_number: 1, target_reps: 10, target_weight: 115 },
	{ id: 'ps-1-0-2', planned_exercise_id: 'ex-1-0', set_number: 2, target_reps: 8, target_weight: 135 },
	{ id: 'ps-1-0-3', planned_exercise_id: 'ex-1-0', set_number: 3, target_reps: 6, target_weight: 155 },
	// Tuesday - Pull-ups: bodyweight
	{ id: 'ps-1-1-1', planned_exercise_id: 'ex-1-1', set_number: 1, target_reps: 10, target_weight: null },
	{ id: 'ps-1-1-2', planned_exercise_id: 'ex-1-1', set_number: 2, target_reps: 8, target_weight: null },
	{ id: 'ps-1-1-3', planned_exercise_id: 'ex-1-1', set_number: 3, target_reps: 6, target_weight: null },
	// Tuesday - Bicep Curls: same weight, descending reps
	{ id: 'ps-1-2-1', planned_exercise_id: 'ex-1-2', set_number: 1, target_reps: 12, target_weight: 25 },
	{ id: 'ps-1-2-2', planned_exercise_id: 'ex-1-2', set_number: 2, target_reps: 10, target_weight: 25 },
	{ id: 'ps-1-2-3', planned_exercise_id: 'ex-1-2', set_number: 3, target_reps: 8, target_weight: 30 },

	// Wednesday - Barbell Squat: warm-up + working sets
	{ id: 'ps-2-0-1', planned_exercise_id: 'ex-2-0', set_number: 1, target_reps: 8, target_weight: 135 },
	{ id: 'ps-2-0-2', planned_exercise_id: 'ex-2-0', set_number: 2, target_reps: 8, target_weight: 185 },
	{ id: 'ps-2-0-3', planned_exercise_id: 'ex-2-0', set_number: 3, target_reps: 6, target_weight: 205 },
	{ id: 'ps-2-0-4', planned_exercise_id: 'ex-2-0', set_number: 4, target_reps: 4, target_weight: 225 },
	// Wednesday - Romanian Deadlift
	{ id: 'ps-2-1-1', planned_exercise_id: 'ex-2-1', set_number: 1, target_reps: 10, target_weight: 135 },
	{ id: 'ps-2-1-2', planned_exercise_id: 'ex-2-1', set_number: 2, target_reps: 8, target_weight: 155 },
	{ id: 'ps-2-1-3', planned_exercise_id: 'ex-2-1', set_number: 3, target_reps: 8, target_weight: 155 },
	// Wednesday - Leg Press
	{ id: 'ps-2-2-1', planned_exercise_id: 'ex-2-2', set_number: 1, target_reps: 12, target_weight: 230 },
	{ id: 'ps-2-2-2', planned_exercise_id: 'ex-2-2', set_number: 2, target_reps: 10, target_weight: 270 },
	{ id: 'ps-2-2-3', planned_exercise_id: 'ex-2-2', set_number: 3, target_reps: 8, target_weight: 310 },
	// Wednesday - Calf Raises
	{ id: 'ps-2-3-1', planned_exercise_id: 'ex-2-3', set_number: 1, target_reps: 15, target_weight: 90 },
	{ id: 'ps-2-3-2', planned_exercise_id: 'ex-2-3', set_number: 2, target_reps: 15, target_weight: 90 },
	{ id: 'ps-2-3-3', planned_exercise_id: 'ex-2-3', set_number: 3, target_reps: 12, target_weight: 110 },

	// Friday - Incline Dumbbell Press
	{ id: 'ps-4-0-1', planned_exercise_id: 'ex-4-0', set_number: 1, target_reps: 10, target_weight: 45 },
	{ id: 'ps-4-0-2', planned_exercise_id: 'ex-4-0', set_number: 2, target_reps: 8, target_weight: 50 },
	{ id: 'ps-4-0-3', planned_exercise_id: 'ex-4-0', set_number: 3, target_reps: 6, target_weight: 55 },
	// Friday - Lateral Raises
	{ id: 'ps-4-1-1', planned_exercise_id: 'ex-4-1', set_number: 1, target_reps: 15, target_weight: 15 },
	{ id: 'ps-4-1-2', planned_exercise_id: 'ex-4-1', set_number: 2, target_reps: 12, target_weight: 15 },
	{ id: 'ps-4-1-3', planned_exercise_id: 'ex-4-1', set_number: 3, target_reps: 12, target_weight: 20 },
	// Friday - Dips: bodyweight
	{ id: 'ps-4-2-1', planned_exercise_id: 'ex-4-2', set_number: 1, target_reps: 12, target_weight: null },
	{ id: 'ps-4-2-2', planned_exercise_id: 'ex-4-2', set_number: 2, target_reps: 10, target_weight: null },
	{ id: 'ps-4-2-3', planned_exercise_id: 'ex-4-2', set_number: 3, target_reps: 8, target_weight: null },

	// Saturday - Lat Pulldown
	{ id: 'ps-5-0-1', planned_exercise_id: 'ex-5-0', set_number: 1, target_reps: 10, target_weight: 100 },
	{ id: 'ps-5-0-2', planned_exercise_id: 'ex-5-0', set_number: 2, target_reps: 8, target_weight: 120 },
	{ id: 'ps-5-0-3', planned_exercise_id: 'ex-5-0', set_number: 3, target_reps: 6, target_weight: 140 },
	// Saturday - Seated Cable Row
	{ id: 'ps-5-1-1', planned_exercise_id: 'ex-5-1', set_number: 1, target_reps: 10, target_weight: 85 },
	{ id: 'ps-5-1-2', planned_exercise_id: 'ex-5-1', set_number: 2, target_reps: 10, target_weight: 100 },
	{ id: 'ps-5-1-3', planned_exercise_id: 'ex-5-1', set_number: 3, target_reps: 8, target_weight: 115 },
	// Saturday - Hammer Curls
	{ id: 'ps-5-2-1', planned_exercise_id: 'ex-5-2', set_number: 1, target_reps: 12, target_weight: 25 },
	{ id: 'ps-5-2-2', planned_exercise_id: 'ex-5-2', set_number: 2, target_reps: 10, target_weight: 30 },
	{ id: 'ps-5-2-3', planned_exercise_id: 'ex-5-2', set_number: 3, target_reps: 8, target_weight: 35 }
];

// Pre-generate empty set logs for all planned sets
function generateSetLogs(): SetLog[] {
	const logs: SetLog[] = [];
	for (const ps of mockPlannedSets) {
		logs.push({
			id: `set-${ps.id}`,
			workout_log_id: `log-${mockPlannedExercises.find(e => e.id === ps.planned_exercise_id)?.planned_day_id}`,
			planned_exercise_id: ps.planned_exercise_id,
			planned_set_id: ps.id,
			set_number: ps.set_number,
			actual_reps: null,
			actual_weight: null,
			completed: false
		});
	}

	// Mark Monday bench press as partially completed (2 of 3 sets done)
	const mondayBenchSets = logs.filter(s => s.planned_exercise_id === 'ex-0-0');
	if (mondayBenchSets[0]) {
		mondayBenchSets[0].actual_reps = 10;
		mondayBenchSets[0].actual_weight = 135;
		mondayBenchSets[0].completed = true;
	}
	if (mondayBenchSets[1]) {
		mondayBenchSets[1].actual_reps = 8;
		mondayBenchSets[1].actual_weight = 155;
		mondayBenchSets[1].completed = true;
	}

	return logs;
}

export const mockSetLogs: SetLog[] = generateSetLogs();

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function getDayName(index: number): string {
	return DAY_NAMES[index] ?? '';
}

/** Returns 0=Mon ... 6=Sun based on current day */
export function getTodayIndex(): number {
	const jsDay = new Date().getDay(); // 0=Sun, 1=Mon ... 6=Sat
	return jsDay === 0 ? 6 : jsDay - 1; // Convert to 0=Mon ... 6=Sun
}

/** Get planned sets for an exercise */
export function getSetsForExercise(exerciseId: string): PlannedSet[] {
	return mockPlannedSets.filter(s => s.planned_exercise_id === exerciseId).sort((a, b) => a.set_number - b.set_number);
}

/** Get set logs for an exercise */
export function getLogsForExercise(exerciseId: string): SetLog[] {
	return mockSetLogs.filter(s => s.planned_exercise_id === exerciseId).sort((a, b) => a.set_number - b.set_number);
}
