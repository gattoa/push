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
