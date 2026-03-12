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

export interface YouTubeVideo {
	id: {
		videoId: string;
	};
	snippet: {
		title: string;
		description: string;
		thumbnails: {
			default: { url: string };
			medium: { url: string };
			high: { url: string };
		};
	};
}
