import { getExerciseById } from '$lib/api/exercisedb';

export async function load({ params }) {
	try {
		const exercise = await getExerciseById(params.id);
		return { exercise };
	} catch (e: any) {
		return { exercise: null, error: e.message };
	}
}
