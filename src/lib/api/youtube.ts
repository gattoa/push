import { PUBLIC_YOUTUBE_API_KEY } from '$env/static/public';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export async function searchExerciseVideos(exerciseName: string) {
	const params = new URLSearchParams({
		part: 'snippet',
		q: `${exerciseName} exercise tutorial`,
		type: 'video',
		maxResults: '1',
		key: PUBLIC_YOUTUBE_API_KEY
	});

	const response = await fetch(`${YOUTUBE_API_BASE}/search?${params}`);
	if (!response.ok) throw new Error(`YouTube API error: ${response.statusText}`);
	return await response.json();
}
