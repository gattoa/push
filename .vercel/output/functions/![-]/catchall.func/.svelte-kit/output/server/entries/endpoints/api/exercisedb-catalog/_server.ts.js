import { json } from "@sveltejs/kit";
import { g as getExercisesByEquipment } from "../../../../chunks/exercisedb.js";
const EQUIPMENT_MAP = {
  bodyweight: ["body weight"],
  dumbbells: ["dumbbell"],
  barbell: ["barbell"],
  cable_machine: ["cable"],
  full_gym: ["body weight", "dumbbell", "barbell", "cable"]
};
async function POST({ request }) {
  try {
    const { equipment } = await request.json();
    const edbEquipment = /* @__PURE__ */ new Set(["body weight"]);
    for (const eq of equipment) {
      for (const mapped of EQUIPMENT_MAP[eq] ?? []) {
        edbEquipment.add(mapped);
      }
    }
    const fetchPromises = [...edbEquipment].map(async (eq) => {
      try {
        return await getExercisesByEquipment(eq);
      } catch (err) {
        console.error(`Failed to fetch exercises for equipment "${eq}":`, err);
        return [];
      }
    });
    const results = await Promise.all(fetchPromises);
    const seen = /* @__PURE__ */ new Set();
    const catalog = [];
    for (const exercises of results) {
      if (!Array.isArray(exercises)) continue;
      for (const ex of exercises) {
        if (seen.has(ex.exerciseId)) continue;
        seen.add(ex.exerciseId);
        catalog.push({
          exerciseId: ex.exerciseId,
          name: ex.name,
          bodyParts: ex.bodyParts ?? [],
          targetMuscles: ex.targetMuscles ?? [],
          secondaryMuscles: ex.secondaryMuscles ?? [],
          equipments: ex.equipments ?? []
        });
      }
    }
    return json({ success: true, catalog });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Catalog fetch error:", message);
    return json({ success: false, error: message }, { status: 500 });
  }
}
export {
  POST
};
