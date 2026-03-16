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
	label: string; // e.g. "Push", "Pull", "Legs", "Rest"
	is_rest_day: boolean;
}

export interface PlannedExercise {
	id: string;
	planned_day_id: string;
	exercisedb_id: string;
	exercise_name: string; // denormalized for display
	body_parts: string[]; // denormalized from ExerciseDB
	target_muscles: string[]; // denormalized from ExerciseDB (e.g., ["Pectoralis Major Sternal Head"])
	equipments: string[]; // denormalized from ExerciseDB (e.g., ["dumbbell", "bench"])
	cue?: string; // AI-prescribed modification (e.g., "slow eccentric", "neutral grip")
	superset_group?: string; // exercises sharing a group ID are supersetted
	order: number;
}

export interface DropTarget {
	target_reps: number;
	target_weight: number | null;
}

export interface PlannedSet {
	id: string;
	planned_exercise_id: string;
	set_number: number;
	set_type?: 'standard' | 'drop' | 'warmup'; // default: standard
	target_reps: number;
	target_weight: number | null; // null = bodyweight
	drops?: DropTarget[]; // only for set_type: 'drop'
}

export interface WorkoutLog {
	id: string;
	user_id: string;
	planned_day_id: string;
	date: string;
	completed_at: string | null;
}

export interface DropLog {
	actual_reps: number | null;
	actual_weight: number | null;
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
	drop_logs?: DropLog[]; // only for drop sets
}

// === Onboarding ===

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type TrainingGoal = 'build_muscle' | 'lose_fat' | 'get_stronger' | 'general_fitness';
export type InjuryArea = 'shoulder' | 'back' | 'knee';
export type Gender = 'male' | 'female' | 'prefer_not_to_say';

export interface OnboardingData {
	dateOfBirth: string | null; // ISO date string e.g. "1998-03-14"
	gender: Gender | null;
	experienceLevel: ExperienceLevel | null;
	trainingDays: number | null; // 3, 4, 5, or 6
	goals: TrainingGoal[];
	injuries: InjuryArea[]; // empty = no injuries
}

// === Check-in ===

export interface CheckInState {
	weekPlanId: string;
	photoIds: string[];         // photos uploaded during this check-in
	completedAt: string | null; // null = pending (window closes when new week starts)
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

// === Week History ===

export interface WeekHistory {
	weekNumber: number;
	weekStart: string; // ISO date (Monday)
	days: PlannedDay[];
	exercises: PlannedExercise[];
	plannedSets: PlannedSet[];
	setLogs: SetLog[];
}

// === Profile / Stats View Types ===

export interface WeekStats {
	workoutsCompleted: number;
	workoutsTotal: number;
	setsCompleted: number;
	setsTotal: number;
	volume: number;
}

export interface PersonalRecord {
	exerciseName: string;
	estimated1RM: number;
	weight: number;
	reps: number;
	weekStart: string;
}

export interface DayBreakdown {
	dayOfWeek: number;
	label: string;
	isRestDay: boolean;
	exercisesCompleted: number;
	exercisesTotal: number;
}

export interface WeekSummary {
	weekNumber: number;
	weekStart: string;
	dateRange: string;
	dayBreakdowns: DayBreakdown[];
	totalVolume: number;
	workoutsCompleted: number;
	workoutsTotal: number;
	prsHit: PersonalRecord[];
}

export interface LifetimeStats {
	totalWorkouts: number;
	totalVolume: number;
	longestStreak: number;
	weeksActive: number;
}

export interface SetResult {
	setNumber: number;
	weight: number | null;
	reps: number | null;
	completed: boolean;
}

export interface DayExerciseDetail {
	exerciseName: string;
	exercisedbId: string;
	sets: SetResult[];
	allCompleted: boolean;
}

export interface CalendarDay {
	dayOfWeek: number;
	date: string;
	label: string;
	isRestDay: boolean;
	isCompleted: boolean;
	exercises: DayExerciseDetail[];
}

export interface CalendarWeek {
	weekNumber: number;
	weekStart: string;
	isCurrent: boolean;
	days: CalendarDay[];
	totalVolume: number;
	prsHit: PersonalRecord[];
}

export interface ExerciseSession {
	date: string;
	weekNumber: number;
	dayLabel: string;
	sets: SetResult[];
	bestEstimated1RM: number | null;
	isPR: boolean;
}

export interface ExerciseHistorySummary {
	exerciseName: string;
	currentEstimated1RM: number | null;
	firstEstimated1RM: number | null;
	percentChange: number | null;
	sessions: ExerciseSession[];
}

export interface BodyPartExerciseDetail {
	exerciseName: string;
	sets: number;
	exercisedbId: string;
}

export interface BodyPartScheduledDetail {
	exerciseName: string;
	dayLabel: string;
	exercisedbId: string;
}

export interface WeekMomentum {
	weekStart: string;
	workoutsCompleted: number;
	workoutsTotal: number;
	bodyPartsHit: Map<string, number>;
	totalBodyParts: number;
	bodyPartsHitCount: number;
	bodyPartExercises: Map<string, BodyPartExerciseDetail[]>;
	bodyPartsScheduled: Map<string, BodyPartScheduledDetail[]>;
	unmappedExercises: string[];
	dayCompletions: { dayOfWeek: number; label: string; completed: boolean; bodyParts: string[]; volume: number; isRestDay: boolean; exerciseNames: string[] }[];
	streak: number;
	weekPRs: PersonalRecord[];
}

export interface LastSessionExercise {
	exerciseName: string;
	exercisedbId: string;
	currentSets: SetResult[];
	previousBestSet: { weight: number; reps: number } | null;
	currentBestSet: { weight: number; reps: number } | null;
	isPR: boolean;
}

export interface LastSessionData {
	date: string;
	dayLabel: string;
	exercises: LastSessionExercise[];
}

// === Plan Generation ===

export interface GeneratedPlan {
	days: PlannedDay[];
	exercises: PlannedExercise[];
	sets: PlannedSet[];
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
