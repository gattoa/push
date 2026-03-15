import type { PlannedDay, PlannedExercise, PlannedSet, SetLog } from '$lib/types';

export interface WeekHistory {
	weekNumber: number;
	weekStart: string; // ISO date (Monday)
	days: PlannedDay[];
	exercises: PlannedExercise[];
	plannedSets: PlannedSet[];
	setLogs: SetLog[];
}

// Same PPL exercise template used across all weeks
// All IDs and body_parts sourced from ExerciseDB via exercises.json
const EXERCISE_TEMPLATE = [
	// Mon - Push
	{ dayIdx: 0, exercises: [
		{ name: 'Bench Press', exDbId: 'exr_41n2hxnFMotsXTj3', bodyParts: ['CHEST'] },
		{ name: 'Seated Shoulder Press', exDbId: 'exr_41n2hs6camM22yBG', bodyParts: ['SHOULDERS'] },
		{ name: 'Arnold Press', exDbId: 'exr_41n2hMRXm49mM62z', bodyParts: ['SHOULDERS'] }
	]},
	// Tue - Pull
	{ dayIdx: 1, exercises: [
		{ name: 'One Arm Bent-over Row', exDbId: 'exr_41n2hHdjQpnyNdie', bodyParts: ['BACK'] },
		{ name: 'Pull up', exDbId: 'exr_41n2hU4y6EaYXFhr', bodyParts: ['BACK'] },
		{ name: 'Hammer Curl', exDbId: 'exr_41n2hGioS8HumEF7', bodyParts: ['FOREARMS'] }
	]},
	// Wed - Legs
	{ dayIdx: 2, exercises: [
		{ name: 'Squat', exDbId: 'exr_41n2hmGR8WuVfe1U', bodyParts: ['QUADRICEPS', 'THIGHS'] },
		{ name: 'Romanian Deadlift', exDbId: 'exr_41n2hn8rpbYihzEW', bodyParts: ['HIPS'] },
		{ name: 'Bulgarian Split Squat', exDbId: 'exr_41n2hpLLs1uU5atr', bodyParts: ['QUADRICEPS', 'THIGHS'] },
		{ name: 'Seated Calf Raise', exDbId: 'exr_41n2hTs4q3ihihZs', bodyParts: ['CALVES'] }
	]},
	// Thu - Rest (no exercises)
	// Fri - Push
	{ dayIdx: 4, exercises: [
		{ name: 'Palms In Incline Bench Press', exDbId: 'exr_41n2hsVHu7B1MTdr', bodyParts: ['UPPER ARMS'] },
		{ name: 'Lateral Raise', exDbId: 'exr_41n2hjuGpcex14w7', bodyParts: ['SHOULDERS'] },
		{ name: 'Chest Dip', exDbId: 'exr_41n2hkK8hGAcSnW7', bodyParts: ['CHEST'] }
	]},
	// Sat - Pull
	{ dayIdx: 5, exercises: [
		{ name: 'Sliding Floor Pulldown on Towel', exDbId: 'exr_41n2hadPLLFRGvFk', bodyParts: ['BACK'] },
		{ name: 'Seated Row with Towel', exDbId: 'exr_41n2hcFJpBvAkXCP', bodyParts: ['BACK'] },
		{ name: 'Cross Body Hammer Curl', exDbId: 'exr_41n2hgCHNgtVLHna', bodyParts: ['FOREARMS'] }
	]}
];

// Base weights per exercise (week 1 baseline). Null = bodyweight.
const BASE_WEIGHTS: Record<string, (number | null)[]> = {
	'Bench Press':                    [125, 140, 160],
	'Seated Shoulder Press':          [50, 60, 70],
	'Arnold Press':                   [35, 35, 40],
	'One Arm Bent-over Row':          [105, 125, 145],
	'Pull up':                        [null, null, null],
	'Hammer Curl':                    [20, 20, 25],
	'Squat':                          [125, 170, 190, 210],
	'Romanian Deadlift':              [125, 145, 145],
	'Bulgarian Split Squat':          [40, 45, 50],
	'Seated Calf Raise':              [80, 80, 100],
	'Palms In Incline Bench Press':   [40, 45, 50],
	'Lateral Raise':                  [12, 12, 15],
	'Chest Dip':                      [null, null, null],
	'Sliding Floor Pulldown on Towel':[null, null, null],
	'Seated Row with Towel':          [null, null, null],
	'Cross Body Hammer Curl':         [20, 25, 30]
};

const BASE_REPS: Record<string, number[]> = {
	'Bench Press':                    [10, 8, 6],
	'Seated Shoulder Press':          [10, 8, 6],
	'Arnold Press':                   [12, 10, 8],
	'One Arm Bent-over Row':          [10, 8, 6],
	'Pull up':                        [10, 8, 6],
	'Hammer Curl':                    [12, 10, 8],
	'Squat':                          [8, 8, 6, 4],
	'Romanian Deadlift':              [10, 8, 8],
	'Bulgarian Split Squat':          [10, 8, 6],
	'Seated Calf Raise':              [15, 15, 12],
	'Palms In Incline Bench Press':   [10, 8, 6],
	'Lateral Raise':                  [15, 12, 12],
	'Chest Dip':                      [12, 10, 8],
	'Sliding Floor Pulldown on Towel':[10, 8, 6],
	'Seated Row with Towel':          [10, 10, 8],
	'Cross Body Hammer Curl':         [12, 10, 8]
};

// Weight progression multiplier per week (simulates progressive overload)
const WEEK_MULTIPLIERS = [1.0, 1.05, 1.1, 1.1];

// Which days are completed per week (by day_of_week index)
// Week 1: 4/5 (missed Saturday pull)
// Week 2: 5/5
// Week 3: 4/5 (missed Friday push)
// Week 4: 3/5 (current week in progress - Mon/Tue/Wed done)
const COMPLETED_DAYS: number[][] = [
	[0, 1, 2, 4],       // Week 1
	[0, 1, 2, 4, 5],    // Week 2
	[0, 1, 2, 5],       // Week 3
	[0, 1, 2]            // Week 4 (in progress)
];

function roundWeight(w: number): number {
	return Math.round(w / 5) * 5; // Round to nearest 5
}

function generateWeek(weekNum: number, weekStart: string): WeekHistory {
	const prefix = `w${weekNum}`;
	const planId = `plan-${prefix}`;
	const multiplier = WEEK_MULTIPLIERS[weekNum - 1] ?? 1.0;
	const completedDays = COMPLETED_DAYS[weekNum - 1] ?? [];

	const days: PlannedDay[] = [
		{ id: `${prefix}-day-0`, plan_id: planId, day_of_week: 0, label: 'Push', is_rest_day: false, is_review_day: false },
		{ id: `${prefix}-day-1`, plan_id: planId, day_of_week: 1, label: 'Pull', is_rest_day: false, is_review_day: false },
		{ id: `${prefix}-day-2`, plan_id: planId, day_of_week: 2, label: 'Legs', is_rest_day: false, is_review_day: false },
		{ id: `${prefix}-day-3`, plan_id: planId, day_of_week: 3, label: 'Rest', is_rest_day: true, is_review_day: false },
		{ id: `${prefix}-day-4`, plan_id: planId, day_of_week: 4, label: 'Push', is_rest_day: false, is_review_day: false },
		{ id: `${prefix}-day-5`, plan_id: planId, day_of_week: 5, label: 'Pull', is_rest_day: false, is_review_day: false },
		{ id: `${prefix}-day-6`, plan_id: planId, day_of_week: 6, label: 'Review', is_rest_day: false, is_review_day: true }
	];

	const exercises: PlannedExercise[] = [];
	const plannedSets: PlannedSet[] = [];
	const setLogs: SetLog[] = [];

	for (const group of EXERCISE_TEMPLATE) {
		const dayId = `${prefix}-day-${group.dayIdx}`;
		const isDayCompleted = completedDays.includes(group.dayIdx);

		for (let eIdx = 0; eIdx < group.exercises.length; eIdx++) {
			const ex = group.exercises[eIdx];
			const exId = `${prefix}-ex-${group.dayIdx}-${eIdx}`;

			exercises.push({
				id: exId,
				planned_day_id: dayId,
				exercisedb_id: ex.exDbId,
				exercise_name: ex.name,
				body_parts: ex.bodyParts,
				order: eIdx
			});

			const baseWeights = BASE_WEIGHTS[ex.name] ?? [];
			const baseReps = BASE_REPS[ex.name] ?? [];
			const numSets = baseReps.length;

			for (let s = 0; s < numSets; s++) {
				const psId = `${prefix}-ps-${group.dayIdx}-${eIdx}-${s + 1}`;
				const baseW = baseWeights[s];
				const targetWeight = baseW !== null ? roundWeight(baseW * multiplier) : null;
				const targetReps = baseReps[s];

				plannedSets.push({
					id: psId,
					planned_exercise_id: exId,
					set_number: s + 1,
					target_reps: targetReps,
					target_weight: targetWeight
				});

				const completed = isDayCompleted;
				setLogs.push({
					id: `${prefix}-sl-${group.dayIdx}-${eIdx}-${s + 1}`,
					workout_log_id: `${prefix}-log-${dayId}`,
					planned_exercise_id: exId,
					planned_set_id: psId,
					set_number: s + 1,
					actual_reps: completed ? targetReps : null,
					actual_weight: completed ? targetWeight : null,
					completed
				});
			}
		}
	}

	return { weekNumber: weekNum, weekStart, days, exercises, plannedSets, setLogs };
}

export const mockWeekHistories: WeekHistory[] = [
	generateWeek(1, '2026-02-16'),
	generateWeek(2, '2026-02-23'),
	generateWeek(3, '2026-03-02'),
	generateWeek(4, '2026-03-09')
];
