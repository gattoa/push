import { EXERCISEDB_API_KEY, EXERCISEDB_API_HOST } from '$env/static/private';

const BASE_URL = `https://${EXERCISEDB_API_HOST}/api/v1`;

const headers: Record<string, string> = {
	'Content-Type': 'application/json',
	'x-rapidapi-key': EXERCISEDB_API_KEY,
	'x-rapidapi-host': EXERCISEDB_API_HOST
};

async function fetchExerciseDB(path: string): Promise<Response> {
	const response = await fetch(`${BASE_URL}${path}`, { headers });
	if (!response.ok) {
		throw new Error(`ExerciseDB API error: ${response.status} ${response.statusText}`);
	}
	return response;
}

export async function searchExercises(query: string) {
	const response = await fetchExerciseDB(`/exercises/search?search=${encodeURIComponent(query)}`);
	const result = await response.json();
	return result.data;
}

export async function getExerciseById(id: string) {
	const response = await fetchExerciseDB(`/exercises/${encodeURIComponent(id)}`);
	const result = await response.json();
	return result.data;
}

export async function getExercises() {
	const response = await fetchExerciseDB('/exercises');
	const result = await response.json();
	return result.data;
}

export async function getAllMuscles() {
	const response = await fetchExerciseDB('/exercises/muscles');
	const result = await response.json();
	return result.data;
}

export async function getAllBodyParts() {
	const response = await fetchExerciseDB('/exercises/bodyparts');
	const result = await response.json();
	return result.data;
}

export async function getAllEquipments() {
	const response = await fetchExerciseDB('/exercises/equipments');
	const result = await response.json();
	return result.data;
}

export async function getAllExerciseTypes() {
	const response = await fetchExerciseDB('/exercises/exerciseTypes');
	const result = await response.json();
	return result.data;
}

export async function getExercisesByEquipment(equipment: string) {
	const all: unknown[] = [];
	let cursor: string | null = null;
	const MAX_PAGES = 4; // Safety cap: 4 pages × 25 = 100 exercises max per equipment type

	for (let page = 0; page < MAX_PAGES; page++) {
		const params = new URLSearchParams({ equipment, limit: '25' });
		if (cursor) params.set('cursor', cursor);

		const response = await fetchExerciseDB(`/exercises?${params}`);
		const result = await response.json();

		if (Array.isArray(result.data)) {
			all.push(...result.data);
		}

		if (!result.meta?.hasNextPage || !result.meta?.nextCursor) break;
		cursor = result.meta.nextCursor;
	}

	return all;
}
