import { E as EXERCISEDB_API_HOST, a as EXERCISEDB_API_KEY } from "./private.js";
const BASE_URL = `https://${EXERCISEDB_API_HOST}/api/v1`;
const headers = {
  "Content-Type": "application/json",
  "x-rapidapi-key": EXERCISEDB_API_KEY,
  "x-rapidapi-host": EXERCISEDB_API_HOST
};
async function fetchExerciseDB(path) {
  const response = await fetch(`${BASE_URL}${path}`, { headers });
  if (!response.ok) {
    throw new Error(`ExerciseDB API error: ${response.status} ${response.statusText}`);
  }
  return response;
}
async function searchExercises(query) {
  const response = await fetchExerciseDB(`/exercises/search?search=${encodeURIComponent(query)}`);
  const result = await response.json();
  return result.data;
}
async function getExerciseById(id) {
  const response = await fetchExerciseDB(`/exercises/${encodeURIComponent(id)}`);
  const result = await response.json();
  return result.data;
}
async function getExercisesByEquipment(equipment) {
  const all = [];
  let cursor = null;
  while (true) {
    const params = new URLSearchParams({ equipment, limit: "25" });
    if (cursor) params.set("cursor", cursor);
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
export {
  getExerciseById as a,
  getExercisesByEquipment as g,
  searchExercises as s
};
