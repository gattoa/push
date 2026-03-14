import type { OnboardingData, PlannedDay, PlannedExercise, PlannedSet, InjuryArea, AgeRange } from '$lib/types';

export interface GeneratedPlan {
	days: PlannedDay[];
	exercises: PlannedExercise[];
	sets: PlannedSet[];
}

// Exercises excluded per injury area (hard-coded safety constraints)
const INJURY_EXCLUSIONS: Record<InjuryArea, string[]> = {
	shoulder: ['Shoulder Press', 'Lateral Raises', 'Dips'],
	back: ['Barbell Row', 'Romanian Deadlift', 'Barbell Squat'],
	knee: ['Barbell Squat', 'Leg Press', 'Calf Raises']
};

// Exercise pool organized by workout type
interface ExerciseTemplate {
	name: string;
	exercisedbId: string;
	isBodyweight: boolean;
	baseWeight: number; // intermediate baseline in lbs
	baseSets: { reps: number; weightMultiplier: number }[];
}

const PUSH_EXERCISES: ExerciseTemplate[] = [
	{
		name: 'Bench Press',
		exercisedbId: 'exr_41n2hxnFMotsXTj3',
		isBodyweight: false,
		baseWeight: 135,
		baseSets: [
			{ reps: 10, weightMultiplier: 1.0 },
			{ reps: 8, weightMultiplier: 1.15 },
			{ reps: 6, weightMultiplier: 1.3 }
		]
	},
	{
		name: 'Shoulder Press',
		exercisedbId: 'exr_41n2hs6camM22yBG',
		isBodyweight: false,
		baseWeight: 55,
		baseSets: [
			{ reps: 10, weightMultiplier: 1.0 },
			{ reps: 8, weightMultiplier: 1.18 },
			{ reps: 6, weightMultiplier: 1.36 }
		]
	},
	{
		name: 'Tricep Pushdown',
		exercisedbId: 'exr_41n2hMRXm49mM62z',
		isBodyweight: false,
		baseWeight: 40,
		baseSets: [
			{ reps: 12, weightMultiplier: 1.0 },
			{ reps: 10, weightMultiplier: 1.0 },
			{ reps: 8, weightMultiplier: 1.125 }
		]
	},
	{
		name: 'Incline Dumbbell Press',
		exercisedbId: 'exr_push2_1',
		isBodyweight: false,
		baseWeight: 45,
		baseSets: [
			{ reps: 10, weightMultiplier: 1.0 },
			{ reps: 8, weightMultiplier: 1.11 },
			{ reps: 6, weightMultiplier: 1.22 }
		]
	},
	{
		name: 'Lateral Raises',
		exercisedbId: 'exr_push2_2',
		isBodyweight: false,
		baseWeight: 15,
		baseSets: [
			{ reps: 15, weightMultiplier: 1.0 },
			{ reps: 12, weightMultiplier: 1.0 },
			{ reps: 12, weightMultiplier: 1.33 }
		]
	},
	{
		name: 'Dips',
		exercisedbId: 'exr_push2_3',
		isBodyweight: true,
		baseWeight: 0,
		baseSets: [
			{ reps: 12, weightMultiplier: 1.0 },
			{ reps: 10, weightMultiplier: 1.0 },
			{ reps: 8, weightMultiplier: 1.0 }
		]
	}
];

const PULL_EXERCISES: ExerciseTemplate[] = [
	{
		name: 'Barbell Row',
		exercisedbId: 'exr_pull_1',
		isBodyweight: false,
		baseWeight: 115,
		baseSets: [
			{ reps: 10, weightMultiplier: 1.0 },
			{ reps: 8, weightMultiplier: 1.17 },
			{ reps: 6, weightMultiplier: 1.35 }
		]
	},
	{
		name: 'Pull-ups',
		exercisedbId: 'exr_pull_2',
		isBodyweight: true,
		baseWeight: 0,
		baseSets: [
			{ reps: 10, weightMultiplier: 1.0 },
			{ reps: 8, weightMultiplier: 1.0 },
			{ reps: 6, weightMultiplier: 1.0 }
		]
	},
	{
		name: 'Bicep Curls',
		exercisedbId: 'exr_pull_3',
		isBodyweight: false,
		baseWeight: 25,
		baseSets: [
			{ reps: 12, weightMultiplier: 1.0 },
			{ reps: 10, weightMultiplier: 1.0 },
			{ reps: 8, weightMultiplier: 1.2 }
		]
	},
	{
		name: 'Lat Pulldown',
		exercisedbId: 'exr_pull2_1',
		isBodyweight: false,
		baseWeight: 100,
		baseSets: [
			{ reps: 10, weightMultiplier: 1.0 },
			{ reps: 8, weightMultiplier: 1.2 },
			{ reps: 6, weightMultiplier: 1.4 }
		]
	},
	{
		name: 'Seated Cable Row',
		exercisedbId: 'exr_pull2_2',
		isBodyweight: false,
		baseWeight: 85,
		baseSets: [
			{ reps: 10, weightMultiplier: 1.0 },
			{ reps: 10, weightMultiplier: 1.18 },
			{ reps: 8, weightMultiplier: 1.35 }
		]
	},
	{
		name: 'Hammer Curls',
		exercisedbId: 'exr_pull2_3',
		isBodyweight: false,
		baseWeight: 25,
		baseSets: [
			{ reps: 12, weightMultiplier: 1.0 },
			{ reps: 10, weightMultiplier: 1.2 },
			{ reps: 8, weightMultiplier: 1.4 }
		]
	}
];

const LEG_EXERCISES: ExerciseTemplate[] = [
	{
		name: 'Barbell Squat',
		exercisedbId: 'exr_legs_1',
		isBodyweight: false,
		baseWeight: 135,
		baseSets: [
			{ reps: 8, weightMultiplier: 1.0 },
			{ reps: 8, weightMultiplier: 1.37 },
			{ reps: 6, weightMultiplier: 1.52 },
			{ reps: 4, weightMultiplier: 1.67 }
		]
	},
	{
		name: 'Romanian Deadlift',
		exercisedbId: 'exr_legs_2',
		isBodyweight: false,
		baseWeight: 135,
		baseSets: [
			{ reps: 10, weightMultiplier: 1.0 },
			{ reps: 8, weightMultiplier: 1.15 },
			{ reps: 8, weightMultiplier: 1.15 }
		]
	},
	{
		name: 'Leg Press',
		exercisedbId: 'exr_legs_3',
		isBodyweight: false,
		baseWeight: 230,
		baseSets: [
			{ reps: 12, weightMultiplier: 1.0 },
			{ reps: 10, weightMultiplier: 1.17 },
			{ reps: 8, weightMultiplier: 1.35 }
		]
	},
	{
		name: 'Calf Raises',
		exercisedbId: 'exr_legs_4',
		isBodyweight: false,
		baseWeight: 90,
		baseSets: [
			{ reps: 15, weightMultiplier: 1.0 },
			{ reps: 15, weightMultiplier: 1.0 },
			{ reps: 12, weightMultiplier: 1.22 }
		]
	}
];

// PPL split patterns by training days
const SPLIT_PATTERNS: Record<number, string[]> = {
	3: ['Push', 'Pull', 'Legs', 'Rest', 'Rest', 'Rest', 'Review'],
	4: ['Push', 'Pull', 'Legs', 'Rest', 'Push', 'Rest', 'Review'],
	5: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Rest', 'Review'],
	6: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', 'Review']
};

function getExercisePool(label: string): ExerciseTemplate[] {
	switch (label) {
		case 'Push':
			return PUSH_EXERCISES;
		case 'Pull':
			return PULL_EXERCISES;
		case 'Legs':
			return LEG_EXERCISES;
		default:
			return [];
	}
}

function filterByInjuries(exercises: ExerciseTemplate[], injuries: InjuryArea[]): ExerciseTemplate[] {
	const excluded = new Set<string>();
	for (const injury of injuries) {
		for (const name of INJURY_EXCLUSIONS[injury]) {
			excluded.add(name);
		}
	}
	return exercises.filter((e) => !excluded.has(e.name));
}

function roundWeight(weight: number): number {
	return Math.round(weight / 5) * 5;
}

export function generateMockPlan(data: OnboardingData): GeneratedPlan {
	const pattern = SPLIT_PATTERNS[data.trainingDays ?? 3] ?? SPLIT_PATTERNS[3];
	const experience = data.experienceLevel ?? 'intermediate';
	const goals = data.goals.length > 0 ? data.goals : ['build_muscle' as const];
	const primaryGoal = goals[0];

	const age = data.ageRange ?? 'under_35';

	// Experience multipliers
	const weightMultiplier = experience === 'beginner' ? 0.6 : experience === 'advanced' ? 1.15 : 1.0;
	const maxSetsPerExercise = experience === 'beginner' ? 2 : experience === 'advanced' ? 4 : 3;

	// Age adjustments — scale weight down and enforce minimum reps for older lifters
	const ageWeightMultiplier: Record<AgeRange, number> = {
		under_35: 1.0,
		'35_50': 0.9,
		'50_plus': 0.75
	};
	const ageMinReps: Record<AgeRange, number> = {
		under_35: 1,
		'35_50': 5,
		'50_plus': 8
	};

	// Goal adjustments
	let repAdjust = 0;
	let goalWeightMultiplier = 1.0;
	if (primaryGoal === 'lose_fat') {
		repAdjust = 3;
		goalWeightMultiplier = 0.9;
	} else if (primaryGoal === 'get_stronger') {
		repAdjust = -3;
		goalWeightMultiplier = 1.1;
	}

	const days: PlannedDay[] = [];
	const exercises: PlannedExercise[] = [];
	const sets: PlannedSet[] = [];

	// Track which push/pull/legs variant we're on to alternate exercise selection
	const labelCount: Record<string, number> = {};

	for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
		const label = pattern[dayIdx];
		const isRest = label === 'Rest';
		const isReview = label === 'Review';
		const dayId = `gen-day-${dayIdx}`;

		days.push({
			id: dayId,
			plan_id: 'gen-plan-1',
			day_of_week: dayIdx,
			label,
			is_rest_day: isRest,
			is_review_day: isReview
		});

		if (isRest || isReview) continue;

		// Get exercise pool, filter injuries, and pick 3
		const count = (labelCount[label] ?? 0);
		labelCount[label] = count + 1;
		const pool = getExercisePool(label);
		const safePool = filterByInjuries(pool, data.injuries);

		// Alternate: first occurrence takes first 3, second takes next 3
		const offset = count * 3;
		const picked = safePool.slice(offset, offset + 3);
		// If not enough, wrap around
		const finalExercises = picked.length >= 3
			? picked
			: [...picked, ...safePool.filter((e) => !picked.includes(e))].slice(0, 3);

		for (let exIdx = 0; exIdx < finalExercises.length; exIdx++) {
			const tmpl = finalExercises[exIdx];
			const exId = `gen-ex-${dayIdx}-${exIdx}`;

			exercises.push({
				id: exId,
				planned_day_id: dayId,
				exercisedb_id: tmpl.exercisedbId,
				exercise_name: tmpl.name,
				order: exIdx
			});

			const templateSets = tmpl.baseSets.slice(0, maxSetsPerExercise);
			// Advanced: duplicate last set if we need a 4th and template only has 3
			if (maxSetsPerExercise === 4 && templateSets.length === 3) {
				templateSets.push(templateSets[templateSets.length - 1]);
			}

			for (let setIdx = 0; setIdx < templateSets.length; setIdx++) {
				const s = templateSets[setIdx];
				const adjustedReps = Math.max(ageMinReps[age], s.reps + repAdjust);
				const adjustedWeight = tmpl.isBodyweight
					? null
					: roundWeight(tmpl.baseWeight * s.weightMultiplier * weightMultiplier * goalWeightMultiplier * ageWeightMultiplier[age]);

				sets.push({
					id: `gen-ps-${dayIdx}-${exIdx}-${setIdx + 1}`,
					planned_exercise_id: exId,
					set_number: setIdx + 1,
					target_reps: adjustedReps,
					target_weight: adjustedWeight
				});
			}
		}
	}

	return { days, exercises, sets };
}
