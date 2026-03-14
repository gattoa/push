import { getExerciseById } from '$lib/api/exercisedb';

export async function load({ params }) {
	try {
		const exercise = await getExerciseById(params.id);
		return { exercise, exerciseId: params.id };
	} catch (e: any) {
		return { exercise: null, exerciseId: params.id, error: e.message };
	}
}
