export interface Exercise {
	id: string;
	name: string;
	description?: string;
	muscle_group?: string;
	video_url?: string;
	created_at?: string;
}

export interface WorkoutSet {
	id: string;
	exercise_id: string;
	reps: number;
	weight: number;
	date: string;
}

export interface User {
	id: string;
	email: string;
	full_name?: string;
	avatar_url?: string;
}

// === Future Supabase tables ===

export interface WeeklyPlan {
	id: string;
	user_id: string;
	week_start: string; // ISO date, always a Monday
	review_day: number; // 0=Sun, 1=Mon ... 6=Sat. Default 0
	created_at: string;
}

export interface PlannedDay {
	id: string;
	plan_id: string;
	day_of_week: number; // 0=Mon ... 6=Sun (display order)
	label: string; // e.g. "Push", "Pull", "Legs", "Rest", "Review"
	is_rest_day: boolean;
	is_review_day: boolean;
}

export interface PlannedExercise {
	id: string;
	planned_day_id: string;
	exercisedb_id: string;
	exercise_name: string; // denormalized for display
	order: number;
}

export interface PlannedSet {
	id: string;
	planned_exercise_id: string;
	set_number: number;
	target_reps: number;
	target_weight: number | null; // null = bodyweight
}

export interface WorkoutLog {
	id: string;
	user_id: string;
	planned_day_id: string;
	date: string;
	completed_at: string | null;
}

export interface SetLog {
	id: string;
	workout_log_id: string;
	planned_exercise_id: string;
	planned_set_id: string;
	set_number: number;
	actual_reps: number | null;
	actual_weight: number | null;
	completed: boolean;
}

// === Onboarding ===

export type AgeRange = 'under_35' | '35_50' | '50_plus';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type TrainingGoal = 'build_muscle' | 'lose_fat' | 'get_stronger' | 'general_fitness';
export type InjuryArea = 'shoulder' | 'back' | 'knee';

export interface OnboardingData {
	ageRange: AgeRange | null;
	experienceLevel: ExperienceLevel | null;
	trainingDays: number | null; // 3, 4, 5, or 6
	goals: TrainingGoal[];
	injuries: InjuryArea[]; // empty = no injuries
}

// === App Preferences ===

export type WeightUnit = 'lbs' | 'kg';
export type ReviewDay = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Mon ... 6=Sun
export type RestTimerSeconds = 60 | 90 | 120 | 180;

export interface AppPreferences {
	reviewDay: ReviewDay;
	units: WeightUnit;
	restTimerDefault: RestTimerSeconds;
}

// === ExerciseDB API types ===

export interface ExerciseDBSearchResult {
	exerciseId: string;
	name: string;
	imageUrl: string;
}

export interface ExerciseDBExercise {
	exerciseId: string;
	name: string;
	imageUrl: string;
	imageUrls: Record<string, string>;
	equipments: string[];
	bodyParts: string[];
	exerciseType: string;
	targetMuscles: string[];
	secondaryMuscles: string[];
	videoUrl: string;
	keywords: string[];
	overview: string;
	instructions: string[];
	exerciseTips: string[];
	variations: string[];
	relatedExerciseIds: string[];
}
