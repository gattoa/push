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
	const response = await fetchExerciseDB(`/exercises/equipment/${encodeURIComponent(equipment)}?limit=0`);
	const result = await response.json();
	return result.data;
}
