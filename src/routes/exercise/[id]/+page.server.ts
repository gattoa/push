import { PUBLIC_YOUTUBE_API_KEY } from '$env/static/public';

export async function load() {
	const params = new URLSearchParams({
		part: 'snippet',
		q: 'workout exercise tutorial',
		type: 'video',
		maxResults: '1',
		key: PUBLIC_YOUTUBE_API_KEY
	});

	const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
	const data = await response.json();

	const video = data.items?.[0] ?? null;
	return { video };
}
