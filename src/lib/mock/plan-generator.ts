import type { OnboardingData, PlannedDay, PlannedExercise, PlannedSet, InjuryArea } from '$lib/types';

export interface GeneratedPlan {
	days: PlannedDay[];
	exercises: PlannedExercise[];
	sets: PlannedSet[];
}

// Exercises excluded per injury area (hard-coded safety constraints)
const INJURY_EXCLUSIONS: Record<InjuryArea, string[]> = {
	shoulder: ['Seated Shoulder Press', 'Lateral Raise', 'Chest Dip'],
	back: ['One Arm Bent-over Row', 'Romanian Deadlift', 'Squat'],
	knee: ['Squat', 'Bulgarian Split Squat', 'Seated Calf Raise']
};

// Exercise pool organized by workout type
// All IDs and bodyParts sourced from ExerciseDB via exercises.json
interface ExerciseTemplate {
	name: string;
	exercisedbId: string;
	bodyParts: string[];
	isBodyweight: boolean;
	baseWeight: number; // intermediate baseline in lbs
	baseSets: { reps: number; weightMultiplier: number }[];
}

const PUSH_EXERCISES: ExerciseTemplate[] = [
	{
		name: 'Bench Press',
		exercisedbId: 'exr_41n2hxnFMotsXTj3',
		bodyParts: ['CHEST'],
		isBodyweight: false,
		baseWeight: 135,
		baseSets: [
			{ reps: 10, weightMultiplier: 1.0 },
			{ reps: 8, weightMultiplier: 1.15 },
			{ reps: 6, weightMultiplier: 1.3 }
		]
	},
	{
		name: 'Seated Shoulder Press',
		exercisedbId: 'exr_41n2hs6camM22yBG',
		bodyParts: ['SHOULDERS'],
		isBodyweight: false,
		baseWeight: 55,
		baseSets: [
			{ reps: 10, weightMultiplier: 1.0 },
			{ reps: 8, weightMultiplier: 1.18 },
			{ reps: 6, weightMultiplier: 1.36 }
		]
	},
	{
		name: 'Arnold Press',
		exercisedbId: 'exr_41n2hMRXm49mM62z',
		bodyParts: ['SHOULDERS'],
		isBodyweight: false,
		baseWeight: 40,
		baseSets: [
			{ reps: 12, weightMultiplier: 1.0 },
			{ reps: 10, weightMultiplier: 1.0 },
			{ reps: 8, weightMultiplier: 1.125 }
		]
	},
	{
		name: 'Palms In Incline Bench Press',
		exercisedbId: 'exr_41n2hsVHu7B1MTdr',
		bodyParts: ['UPPER ARMS'],
		isBodyweight: false,
		baseWeight: 45,
		baseSets: [
			{ reps: 10, weightMultiplier: 1.0 },
			{ reps: 8, weightMultiplier: 1.11 },
			{ reps: 6, weightMultiplier: 1.22 }
		]
	},
	{
		name: 'Lateral Raise',
		exercisedbId: 'exr_41n2hjuGpcex14w7',
		bodyParts: ['SHOULDERS'],
		isBodyweight: false,
		baseWeight: 15,
		baseSets: [
			{ reps: 15, weightMultiplier: 1.0 },
			{ reps: 12, weightMultiplier: 1.0 },
			{ reps: 12, weightMultiplier: 1.33 }
		]
	},
	{
		name: 'Chest Dip',
		exercisedbId: 'exr_41n2hkK8hGAcSnW7',
		bodyParts: ['CHEST'],
		isBodyweight: true,
		baseWeight: 0,
		baseSets: [
			{ reps: 12, weightMultiplier: 1.0 },
			{ reps: 10, weightMultiplier: 1.0 },
			{ reps: 8, weightMultiplier: 1.0 }
		]
	},
	{
		name: 'Triceps Dip',
		exercisedbId: 'exr_41n2hadQgEEX8wDN',
		bodyParts: ['TRICEPS', 'UPPER ARMS'],
		isBodyweight: true,
		baseWeight: 0,
		baseSets: [
			{ reps: 12, weightMultiplier: 1.0 },
			{ reps: 10, weightMultiplier: 1.0 },
			{ reps: 8, weightMultiplier: 1.0 }
		]
	},
	{
		name: 'Close-grip Push-up',
		exercisedbId: 'exr_41n2hPgRbN1KtJuD',
		bodyParts: ['TRICEPS', 'UPPER ARMS'],
		isBodyweight: true,
		baseWeight: 0,
		baseSets: [
			{ reps: 15, weightMultiplier: 1.0 },
			{ reps: 12, weightMultiplier: 1.0 },
			{ reps: 10, weightMultiplier: 1.0 }
		]
	}
];

const PULL_EXERCISES: ExerciseTemplate[] = [
	{
		name: 'One Arm Bent-over Row',
		exercisedbId: 'exr_41n2hHdjQpnyNdie',
		bodyParts: ['BACK'],
		isBodyweight: false,
		baseWeight: 115,
		baseSets: [
			{ reps: 10, weightMultiplier: 1.0 },
			{ reps: 8, weightMultiplier: 1.17 },
			{ reps: 6, weightMultiplier: 1.35 }
		]
	},
	{
		name: 'Pull up',
		exercisedbId: 'exr_41n2hU4y6EaYXFhr',
		bodyParts: ['BACK'],
		isBodyweight: true,
		baseWeight: 0,
		baseSets: [
			{ reps: 10, weightMultiplier: 1.0 },
			{ reps: 8, weightMultiplier: 1.0 },
			{ reps: 6, weightMultiplier: 1.0 }
		]
	},
	{
		name: 'Hammer Curl',
		exercisedbId: 'exr_41n2hGioS8HumEF7',
		bodyParts: ['FOREARMS'],
		isBodyweight: false,
		baseWeight: 25,
		baseSets: [
			{ reps: 12, weightMultiplier: 1.0 },
			{ reps: 10, weightMultiplier: 1.0 },
			{ reps: 8, weightMultiplier: 1.2 }
		]
	},
	{
		name: 'Sliding Floor Pulldown on Towel',
		exercisedbId: 'exr_41n2hadPLLFRGvFk',
		bodyParts: ['BACK'],
		isBodyweight: true,
		baseWeight: 0,
		baseSets: [
			{ reps: 10, weightMultiplier: 1.0 },
			{ reps: 8, weightMultiplier: 1.0 },
			{ reps: 6, weightMultiplier: 1.0 }
		]
	},
	{
		name: 'Seated Row with Towel',
		exercisedbId: 'exr_41n2hcFJpBvAkXCP',
		bodyParts: ['BACK'],
		isBodyweight: true,
		baseWeight: 0,
		baseSets: [
			{ reps: 10, weightMultiplier: 1.0 },
			{ reps: 10, weightMultiplier: 1.0 },
			{ reps: 8, weightMultiplier: 1.0 }
		]
	},
	{
		name: 'Cross Body Hammer Curl',
		exercisedbId: 'exr_41n2hgCHNgtVLHna',
		bodyParts: ['FOREARMS'],
		isBodyweight: false,
		baseWeight: 25,
		baseSets: [
			{ reps: 12, weightMultiplier: 1.0 },
			{ reps: 10, weightMultiplier: 1.2 },
			{ reps: 8, weightMultiplier: 1.4 }
		]
	},
	{
		name: 'Commando Pull-up',
		exercisedbId: 'exr_41n2hVCJfpAvJcdU',
		bodyParts: ['BACK', 'WAIST'],
		isBodyweight: true,
		baseWeight: 0,
		baseSets: [
			{ reps: 8, weightMultiplier: 1.0 },
			{ reps: 6, weightMultiplier: 1.0 },
			{ reps: 6, weightMultiplier: 1.0 }
		]
	},
	{
		name: 'Suspended Row',
		exercisedbId: 'exr_41n2hdkBpqwoDmVq',
		bodyParts: ['BACK'],
		isBodyweight: true,
		baseWeight: 0,
		baseSets: [
			{ reps: 10, weightMultiplier: 1.0 },
			{ reps: 8, weightMultiplier: 1.0 },
			{ reps: 8, weightMultiplier: 1.0 }
		]
	}
];

const LEG_EXERCISES: ExerciseTemplate[] = [
	{
		name: 'Squat',
		exercisedbId: 'exr_41n2hmGR8WuVfe1U',
		bodyParts: ['QUADRICEPS', 'THIGHS'],
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
		exercisedbId: 'exr_41n2hn8rpbYihzEW',
		bodyParts: ['HIPS'],
		isBodyweight: false,
		baseWeight: 135,
		baseSets: [
			{ reps: 10, weightMultiplier: 1.0 },
			{ reps: 8, weightMultiplier: 1.15 },
			{ reps: 8, weightMultiplier: 1.15 }
		]
	},
	{
		name: 'Bulgarian Split Squat',
		exercisedbId: 'exr_41n2hpLLs1uU5atr',
		bodyParts: ['QUADRICEPS', 'THIGHS'],
		isBodyweight: false,
		baseWeight: 45,
		baseSets: [
			{ reps: 10, weightMultiplier: 1.0 },
			{ reps: 8, weightMultiplier: 1.11 },
			{ reps: 6, weightMultiplier: 1.22 }
		]
	},
	{
		name: 'Seated Calf Raise',
		exercisedbId: 'exr_41n2hTs4q3ihihZs',
		bodyParts: ['CALVES'],
		isBodyweight: false,
		baseWeight: 90,
		baseSets: [
			{ reps: 15, weightMultiplier: 1.0 },
			{ reps: 15, weightMultiplier: 1.0 },
			{ reps: 12, weightMultiplier: 1.22 }
		]
	},
	{
		name: 'Goblet Squat',
		exercisedbId: 'exr_41n2hQDiSwTZXM4F',
		bodyParts: ['THIGHS'],
		isBodyweight: false,
		baseWeight: 50,
		baseSets: [
			{ reps: 12, weightMultiplier: 1.0 },
			{ reps: 10, weightMultiplier: 1.2 },
			{ reps: 8, weightMultiplier: 1.4 }
		]
	},
	{
		name: 'Barbell Standing Calf Raise',
		exercisedbId: 'exr_41n2hwoc6PkW1UJJ',
		bodyParts: ['CALVES'],
		isBodyweight: false,
		baseWeight: 100,
		baseSets: [
			{ reps: 15, weightMultiplier: 1.0 },
			{ reps: 12, weightMultiplier: 1.0 },
			{ reps: 10, weightMultiplier: 1.1 }
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

	// Derive age from DOB
	let userAge = 25; // default
	if (data.dateOfBirth) {
		const birth = new Date(data.dateOfBirth + 'T00:00:00');
		const today = new Date();
		userAge = today.getFullYear() - birth.getFullYear();
		const m = today.getMonth() - birth.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) userAge--;
	}

	// Experience multipliers
	const weightMultiplier = experience === 'beginner' ? 0.6 : experience === 'advanced' ? 1.15 : 1.0;
	const maxSetsPerExercise = experience === 'beginner' ? 2 : experience === 'advanced' ? 4 : 3;

	// Age adjustments — scale weight down and enforce minimum reps for older lifters
	const ageWeightMultiplier = userAge >= 50 ? 0.75 : userAge >= 35 ? 0.9 : 1.0;
	const ageMinReps = userAge >= 50 ? 8 : userAge >= 35 ? 5 : 1;

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
				body_parts: tmpl.bodyParts,
				order: exIdx
			});

			const templateSets = tmpl.baseSets.slice(0, maxSetsPerExercise);
			// Advanced: duplicate last set if we need a 4th and template only has 3
			if (maxSetsPerExercise === 4 && templateSets.length === 3) {
				templateSets.push(templateSets[templateSets.length - 1]);
			}

			for (let setIdx = 0; setIdx < templateSets.length; setIdx++) {
				const s = templateSets[setIdx];
				const adjustedReps = Math.max(ageMinReps, s.reps + repAdjust);
				const adjustedWeight = tmpl.isBodyweight
					? null
					: roundWeight(tmpl.baseWeight * s.weightMultiplier * weightMultiplier * goalWeightMultiplier * ageWeightMultiplier);

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
