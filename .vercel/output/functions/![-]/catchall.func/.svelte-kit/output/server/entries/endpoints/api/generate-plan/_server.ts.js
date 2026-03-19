import { json } from "@sveltejs/kit";
import Anthropic from "@anthropic-ai/sdk";
import { A as ANTHROPIC_API_KEY } from "../../../../chunks/private.js";
const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY
});
const INJURY_EXCLUSIONS = {
  shoulder: ["Seated Shoulder Press", "Lateral Raise", "Chest Dip", "Arnold Press"],
  back: ["One Arm Bent-over Row", "Romanian Deadlift", "Squat", "Suspended Row"],
  knee: ["Squat", "Bulgarian Split Squat", "Seated Calf Raise", "Goblet Squat", "Barbell Standing Calf Raise"]
};
const SPLIT_PATTERNS = {
  3: ["Push", "Pull", "Legs", "Rest", "Rest", "Rest", "Rest"],
  4: ["Push", "Pull", "Legs", "Rest", "Push", "Rest", "Rest"],
  5: ["Push", "Pull", "Legs", "Push", "Pull", "Rest", "Rest"],
  6: ["Push", "Pull", "Legs", "Push", "Pull", "Legs", "Rest"]
};
function getAvailableExercises(catalog, injuries) {
  const excluded = /* @__PURE__ */ new Set();
  for (const injury of injuries) {
    for (const name of INJURY_EXCLUSIONS[injury] ?? []) {
      excluded.add(name);
    }
  }
  return catalog.filter((e) => !excluded.has(e.name));
}
function classifyExercise(e) {
  const parts = e.bodyParts.map((p) => p.toUpperCase());
  const muscles = e.targetMuscles.map((m) => m.toUpperCase());
  if (parts.some((p) => ["CHEST", "SHOULDERS", "TRICEPS", "UPPER ARMS"].includes(p)) || muscles.some((m) => m.includes("DELTOID") || m.includes("PECTORAL") || m.includes("TRICEPS"))) {
    return "push";
  }
  if (parts.some((p) => ["BACK", "FOREARMS"].includes(p)) || muscles.some((m) => m.includes("LATISSIMUS") || m.includes("TRAPEZIUS") || m.includes("BRACHIORADIALIS") || m.includes("BICEP"))) {
    return "pull";
  }
  if (parts.some((p) => ["QUADRICEPS", "THIGHS", "HIPS", "CALVES"].includes(p)) || muscles.some((m) => m.includes("QUADRICEPS") || m.includes("GLUTEUS") || m.includes("HAMSTRING") || m.includes("GASTROCNEMIUS"))) {
    return "legs";
  }
  return "core";
}
function buildSystemPrompt(data, exercises) {
  const pushExercises = exercises.filter((e) => classifyExercise(e) === "push");
  const pullExercises = exercises.filter((e) => classifyExercise(e) === "pull");
  const legExercises = exercises.filter((e) => classifyExercise(e) === "legs");
  const coreExercises = exercises.filter((e) => classifyExercise(e) === "core");
  const formatPool = (pool) => pool.map((e) => `  - ${e.name} (id: ${e.exerciseId}, equipment: ${e.equipments.join(", ")}, targets: ${e.targetMuscles.join(", ")})`).join("\n");
  const pattern = SPLIT_PATTERNS[data.trainingDays ?? 3] ?? SPLIT_PATTERNS[3];
  const sessionMin = data.sessionDuration ?? 60;
  const equipmentDesc = data.equipment.length > 0 ? data.equipment.includes("full_gym") ? "Full gym (all equipment available)" : data.equipment.join(", ") : "bodyweight only";
  return `You are an expert strength and conditioning coach creating a Week 1 training plan.

## User Profile
- Experience: ${data.experienceLevel ?? "intermediate"}
- Age: ${data.dateOfBirth ? calculateAge(data.dateOfBirth) : "unknown"}
- Gender: ${data.gender ?? "prefer_not_to_say"}
- Training days per week: ${data.trainingDays ?? 3}
- Session duration: ${sessionMin} minutes (including warmup and rest between sets)
- Equipment: ${equipmentDesc}
- Goals: ${data.goals.length > 0 ? data.goals.join(", ") : "general_fitness"}
- Injuries: ${data.injuries.length > 0 ? data.injuries.join(", ") : "none"}

## Weekly Schedule (Monday=0 through Sunday=6)
${pattern.map((label, i) => `  Day ${i}: ${label}`).join("\n")}

## Available Exercise Pool
You MUST ONLY select exercises from this catalog. Do NOT invent exercises.
These exercises have already been filtered by the user's available equipment and injury restrictions.

### Push Exercises
${formatPool(pushExercises)}

### Pull Exercises
${formatPool(pullExercises)}

### Leg Exercises
${formatPool(legExercises)}

${coreExercises.length > 0 ? `### Core Exercises
${formatPool(coreExercises)}` : ""}

## Programming Rules

### Exercise Count (based on session duration)
Use the session duration to determine how many exercises per training day. Account for ~5 min warmup, ~90s rest between sets (longer for compound lifts), and ~3-4 min per set including rest.
- 30 min session: 2-3 exercises, fewer sets
- 45 min session: 3 exercises
- 60 min session: 3-4 exercises
- 75 min session: 4-5 exercises
- 90 min session: 5-6 exercises

### Sets Per Exercise
- Beginners: 2 sets per exercise
- Intermediate: 3 sets per exercise
- Advanced: 3-4 sets per exercise

### Rep Ranges (by primary goal)
- build_muscle: 8-12 reps
- get_stronger: 4-6 reps
- lose_fat: 12-15 reps
- general_fitness: 8-12 reps

### Weight Prescription (Week 1)
- Bodyweight exercises (equipment = "BODY WEIGHT"): set target_weight to null.
- Weighted exercises: prescribe conservative starting weights in lbs. For beginners, use very light weights. For intermediate, use moderate weights. For advanced, use challenging but safe weights. Round all weights to the nearest 5 lbs.

### Exercise Selection
1. Select exercises from the matching pool (Push exercises for Push days, Pull for Pull, Legs for Legs).
2. Use pyramid or reverse pyramid set schemes where reps decrease and weight increases across sets.
3. If a day appears twice (e.g., two Push days), select DIFFERENT exercises for the second occurrence to ensure variety.
4. Prioritize compound movements first, isolation movements last within each day.
5. Rest days have no exercises.

## Output Format
Call the generate_plan tool with the complete plan. Use these ID formats exactly:
- Day IDs: "gen-day-{dayIdx}" where dayIdx is 0-6
- Exercise IDs: "gen-ex-{dayIdx}-{exerciseOrder}" where exerciseOrder is 0-based
- Set IDs: "gen-ps-{dayIdx}-{exerciseOrder}-{setNumber}" where setNumber is 1-based
- plan_id for all days: "gen-plan-1"`;
}
function calculateAge(dateOfBirth) {
  const birth = /* @__PURE__ */ new Date(dateOfBirth + "T00:00:00");
  const today = /* @__PURE__ */ new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || m === 0 && today.getDate() < birth.getDate()) age--;
  return age;
}
const PLAN_TOOL = {
  name: "generate_plan",
  description: "Generate a structured weekly training plan",
  input_schema: {
    type: "object",
    properties: {
      days: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            plan_id: { type: "string" },
            day_of_week: { type: "number" },
            label: { type: "string" },
            is_rest_day: { type: "boolean" }
          },
          required: ["id", "plan_id", "day_of_week", "label", "is_rest_day"]
        }
      },
      exercises: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            planned_day_id: { type: "string" },
            exercisedb_id: { type: "string" },
            exercise_name: { type: "string" },
            body_parts: { type: "array", items: { type: "string" } },
            target_muscles: { type: "array", items: { type: "string" } },
            equipments: { type: "array", items: { type: "string" } },
            order: { type: "number" }
          },
          required: ["id", "planned_day_id", "exercisedb_id", "exercise_name", "body_parts", "target_muscles", "equipments", "order"]
        }
      },
      sets: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            planned_exercise_id: { type: "string" },
            set_number: { type: "number" },
            target_reps: { type: "number" },
            target_weight: { type: ["number", "null"] }
          },
          required: ["id", "planned_exercise_id", "set_number", "target_reps", "target_weight"]
        }
      }
    },
    required: ["days", "exercises", "sets"]
  }
};
function validatePlan(plan, data, availableExercises) {
  const errors = [];
  const availableIds = new Set(availableExercises.map((e) => e.exerciseId));
  if (plan.days.length !== 7) {
    errors.push(`Expected 7 days, got ${plan.days.length}`);
  }
  for (const ex of plan.exercises) {
    if (!availableIds.has(ex.exercisedb_id)) {
      errors.push(`Exercise "${ex.exercise_name}" (${ex.exercisedb_id}) not in available catalog`);
    }
  }
  const excluded = /* @__PURE__ */ new Set();
  for (const injury of data.injuries) {
    for (const name of INJURY_EXCLUSIONS[injury] ?? []) {
      excluded.add(name);
    }
  }
  for (const ex of plan.exercises) {
    if (excluded.has(ex.exercise_name)) {
      errors.push(`Exercise "${ex.exercise_name}" is excluded due to injury: ${data.injuries.join(", ")}`);
    }
  }
  for (const s of plan.sets) {
    if (s.target_reps < 1 || s.target_reps > 30) {
      errors.push(`Set ${s.id} has invalid reps: ${s.target_reps}`);
    }
    if (s.target_weight !== null && s.target_weight < 0) {
      errors.push(`Set ${s.id} has negative weight: ${s.target_weight}`);
    }
  }
  const exerciseIds = new Set(plan.exercises.map((e) => e.id));
  const exercisesWithSets = new Set(plan.sets.map((s) => s.planned_exercise_id));
  for (const exId of exerciseIds) {
    if (!exercisesWithSets.has(exId)) {
      errors.push(`Exercise ${exId} has no sets`);
    }
  }
  return errors;
}
async function POST({ request }) {
  try {
    const { data, catalog } = await request.json();
    if (!Array.isArray(catalog) || catalog.length === 0) {
      return json({ success: false, error: "No exercise catalog provided" }, { status: 400 });
    }
    const availableExercises = getAvailableExercises(catalog, data.injuries);
    const systemPrompt = buildSystemPrompt(data, availableExercises);
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 8192,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: "Generate my Week 1 training plan based on my profile. Call the generate_plan tool with the complete plan."
        }
      ],
      tools: [PLAN_TOOL],
      tool_choice: { type: "tool", name: "generate_plan" }
    });
    const toolBlock = response.content.find((b) => b.type === "tool_use");
    if (!toolBlock || toolBlock.type !== "tool_use") {
      return json({ success: false, error: "Claude did not return a plan" }, { status: 500 });
    }
    const raw = toolBlock.input;
    const plan = {
      days: Array.isArray(raw.days) ? raw.days : [],
      exercises: Array.isArray(raw.exercises) ? raw.exercises : [],
      sets: Array.isArray(raw.sets) ? raw.sets : [],
      source: "ai"
    };
    if (plan.days.length === 0 || plan.exercises.length === 0 || plan.sets.length === 0) {
      return json({ success: false, error: "Claude returned an incomplete plan" }, { status: 500 });
    }
    const catalogById = new Map(availableExercises.map((e) => [e.exerciseId, e]));
    for (const ex of plan.exercises) {
      const catalogEntry = catalogById.get(ex.exercisedb_id);
      if (catalogEntry) {
        ex.body_parts = catalogEntry.bodyParts;
        ex.target_muscles = catalogEntry.targetMuscles;
        ex.equipments = catalogEntry.equipments;
      }
    }
    const errors = validatePlan(plan, data, availableExercises);
    if (errors.length > 0) {
      console.error("Plan validation errors:", errors);
      return json({ success: false, error: "Plan validation failed", details: errors }, { status: 422 });
    }
    return json({ success: true, plan });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Plan generation error:", message);
    return json({ success: false, error: message }, { status: 500 });
  }
}
export {
  POST
};
