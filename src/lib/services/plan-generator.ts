import type { OnboardingData, PlannedDay, PlannedExercise, PlannedSet, InjuryArea, GeneratedPlan } from '$lib/types';

// ============================================================
// Mock plan generator (will be replaced by Claude API)
// ============================================================

const INJURY_EXCLUSIONS: Record<InjuryArea, string[]> = {
	shoulder: ['Seated Shoulder Press', 'Lateral Raise', 'Chest Dip'],
	back: ['One Arm Bent-over Row', 'Romanian Deadlift', 'Squat'],
	knee: ['Squat', 'Bulgarian Split Squat', 'Seated Calf Raise']
};

interface ExerciseTemplate {
	name: string;
	exercisedbId: string;
	bodyParts: string[];
	targetMuscles: string[];
	isBodyweight: boolean;
	baseWeight: number;
	baseSets: { reps: number; weightMultiplier: number }[];
}

const PUSH_EXERCISES: ExerciseTemplate[] = [
	{
		name: 'Bench Press',
		exercisedbId: 'exr_41n2hxnFMotsXTj3',
		bodyParts: ['CHEST'],
		targetMuscles: ['Pectoralis Major Sternal Head'],
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
		targetMuscles: ['Anterior Deltoid'],
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
		targetMuscles: ['Anterior Deltoid'],
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
		targetMuscles: ['Triceps Brachii'],
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
		targetMuscles: ['Lateral Deltoid'],
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
		targetMuscles: ['Pectoralis Major Sternal Head'],
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
		targetMuscles: ['Triceps Brachii'],
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
		targetMuscles: ['Triceps Brachii'],
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
		targetMuscles: ['Latissimus Dorsi'],
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
		targetMuscles: ['Latissimus Dorsi'],
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
		targetMuscles: ['Brachioradialis'],
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
		targetMuscles: ['Latissimus Dorsi'],
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
		targetMuscles: ['Latissimus Dorsi'],
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
		targetMuscles: ['Brachioradialis'],
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
		targetMuscles: ['Latissimus Dorsi'],
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
		targetMuscles: ['Latissimus Dorsi'],
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
		targetMuscles: ['Quadriceps', 'Gluteus Maximus'],
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
		targetMuscles: ['Hamstrings', 'Gluteus Maximus'],
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
		targetMuscles: ['Gluteus Maximus', 'Quadriceps'],
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
		targetMuscles: ['Gastrocnemius'],
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
		targetMuscles: ['Quadriceps'],
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
		targetMuscles: ['Gastrocnemius'],
		isBodyweight: false,
		baseWeight: 100,
		baseSets: [
			{ reps: 15, weightMultiplier: 1.0 },
			{ reps: 12, weightMultiplier: 1.0 },
			{ reps: 10, weightMultiplier: 1.1 }
		]
	}
];

const SPLIT_PATTERNS: Record<number, string[]> = {
	3: ['Push', 'Pull', 'Legs', 'Rest', 'Rest', 'Rest', 'Rest'],
	4: ['Push', 'Pull', 'Legs', 'Rest', 'Push', 'Rest', 'Rest'],
	5: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Rest', 'Rest'],
	6: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', 'Rest']
};

function getExercisePool(label: string): ExerciseTemplate[] {
	switch (label) {
		case 'Push': return PUSH_EXERCISES;
		case 'Pull': return PULL_EXERCISES;
		case 'Legs': return LEG_EXERCISES;
		default: return [];
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

function generateMockPlan(data: OnboardingData): GeneratedPlan {
	const pattern = SPLIT_PATTERNS[data.trainingDays ?? 3] ?? SPLIT_PATTERNS[3];
	const experience = data.experienceLevel ?? 'intermediate';
	const goals = data.goals.length > 0 ? data.goals : ['build_muscle' as const];
	const primaryGoal = goals[0];

	let userAge = 25;
	if (data.dateOfBirth) {
		const birth = new Date(data.dateOfBirth + 'T00:00:00');
		const today = new Date();
		userAge = today.getFullYear() - birth.getFullYear();
		const m = today.getMonth() - birth.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) userAge--;
	}

	const weightMultiplier = experience === 'beginner' ? 0.6 : experience === 'advanced' ? 1.15 : 1.0;
	const maxSetsPerExercise = experience === 'beginner' ? 2 : experience === 'advanced' ? 4 : 3;

	const ageWeightMultiplier = userAge >= 50 ? 0.75 : userAge >= 35 ? 0.9 : 1.0;
	const ageMinReps = userAge >= 50 ? 8 : userAge >= 35 ? 5 : 1;

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

	const labelCount: Record<string, number> = {};

	for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
		const label = pattern[dayIdx];
		const isRest = label === 'Rest';
		const dayId = `gen-day-${dayIdx}`;

		days.push({
			id: dayId,
			plan_id: 'gen-plan-1',
			day_of_week: dayIdx,
			label,
			is_rest_day: isRest
		});

		if (isRest) continue;

		const count = (labelCount[label] ?? 0);
		labelCount[label] = count + 1;
		const pool = getExercisePool(label);
		const safePool = filterByInjuries(pool, data.injuries);

		const offset = count * 3;
		const picked = safePool.slice(offset, offset + 3);
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
				target_muscles: tmpl.targetMuscles,
				equipments: [],
				order: exIdx
			});

			const templateSets = tmpl.baseSets.slice(0, maxSetsPerExercise);
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

	return { days, exercises, sets, source: 'mock' as const };
}

// ============================================================
// Service API
// ============================================================

/** Generate a training plan from onboarding data via Claude API, with mock fallback. */
export async function generatePlan(data: OnboardingData): Promise<GeneratedPlan> {
	try {
		const response = await fetch('/api/generate-plan', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		});

		if (!response.ok) {
			const err = await response.json().catch(() => ({ error: 'Unknown error' }));
			console.warn('AI plan generation failed, using mock:', err.error ?? err.details);
			return generateMockPlan(data);
		}

		const result = await response.json();
		if (result.success && result.plan) {
			return { ...result.plan, source: 'ai' as const } as GeneratedPlan;
		}

		console.warn('AI plan generation returned unexpected shape, using mock');
		return generateMockPlan(data);
	} catch (e) {
		console.warn('AI plan generation error, using mock:', e);
		return generateMockPlan(data);
	}
}
