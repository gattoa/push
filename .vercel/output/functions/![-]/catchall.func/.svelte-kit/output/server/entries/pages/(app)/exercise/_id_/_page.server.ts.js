import { a as getExerciseById } from "../../../../../chunks/exercisedb.js";
async function load({ params }) {
  try {
    const exercise = await getExerciseById(params.id);
    return { exercise, exerciseId: params.id };
  } catch (e) {
    return { exercise: null, exerciseId: params.id, error: e.message };
  }
}
export {
  load
};
