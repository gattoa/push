import { PUBLIC_YOUTUBE_API_KEY } from '$env/static/public';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
	const q = url.searchParams.get('q') || 'workout';
	const params = new URLSearchParams({
		part: 'snippet',
		q: `${q} exercise tutorial`,
		type: 'video',
		maxResults: '1',
		key: PUBLIC_YOUTUBE_API_KEY
	});

	const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
	const data = await response.json();
	return json(data);
}
