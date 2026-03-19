import { json } from "@sveltejs/kit";
import { s as searchExercises } from "../../../../chunks/exercisedb.js";
async function GET({ url }) {
  const q = url.searchParams.get("q") || "push up";
  try {
    const data = await searchExercises(q);
    return json({ success: true, data });
  } catch (e) {
    return json({ success: false, error: e.message }, { status: 500 });
  }
}
export {
  GET
};
