import { json } from '@sveltejs/kit';
import { searchExercises } from '$lib/api/exercisedb';

export async function GET({ url }) {
	const q = url.searchParams.get('q') || 'push up';

	try {
		const data = await searchExercises(q);
		return json({ success: true, data });
	} catch (e: any) {
		return json({ success: false, error: e.message }, { status: 500 });
	}
}
