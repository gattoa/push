import { s as supabase } from "./supabase.js";
const DEVICE_KEY = "push_device_id";
function getDeviceId() {
  if (typeof localStorage === "undefined") return "";
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}
async function getUserId() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) return session.user.id;
  } catch {
  }
  return getDeviceId();
}
async function savePlanToSupabase(userId, generated, weekStart) {
  if (!userId) return;
  await supabase.from("weekly_plans").delete().eq("user_id", userId).eq("week_start", weekStart);
  const { error: planError } = await supabase.from("weekly_plans").insert({
    id: "gen-plan-1",
    user_id: userId,
    week_start: weekStart,
    review_day: 6,
    source: generated.source
  });
  if (planError) throw new Error(`weekly_plans insert: ${planError.message}`);
  if (generated.days.length > 0) {
    const { error: daysError } = await supabase.from("planned_days").insert(
      generated.days.map((d) => ({
        id: d.id,
        plan_id: d.plan_id,
        day_of_week: d.day_of_week,
        label: d.label,
        is_rest_day: d.is_rest_day
      }))
    );
    if (daysError) throw new Error(`planned_days insert: ${daysError.message}`);
  }
  if (generated.exercises.length > 0) {
    const { error: exError } = await supabase.from("planned_exercises").insert(
      generated.exercises.map((e) => ({
        id: e.id,
        planned_day_id: e.planned_day_id,
        exercisedb_id: e.exercisedb_id,
        exercise_name: e.exercise_name,
        body_parts: e.body_parts,
        target_muscles: e.target_muscles,
        equipments: e.equipments,
        cue: e.cue ?? null,
        superset_group: e.superset_group ?? null,
        order: e.order
      }))
    );
    if (exError) throw new Error(`planned_exercises insert: ${exError.message}`);
  }
  if (generated.sets.length > 0) {
    const { error: setsError } = await supabase.from("planned_sets").insert(
      generated.sets.map((s) => ({
        id: s.id,
        planned_exercise_id: s.planned_exercise_id,
        set_number: s.set_number,
        set_type: s.set_type ?? "standard",
        target_reps: s.target_reps,
        target_weight: s.target_weight,
        drops: s.drops ?? null
      }))
    );
    if (setsError) throw new Error(`planned_sets insert: ${setsError.message}`);
  }
  const emptyLogs = generated.sets.map((ps) => ({
    id: `log-${ps.id}`,
    workout_log_id: `wlog-${ps.planned_exercise_id}`,
    planned_exercise_id: ps.planned_exercise_id,
    planned_set_id: ps.id,
    set_number: ps.set_number,
    actual_reps: null,
    actual_weight: null,
    completed: false,
    drop_logs: null
  }));
  if (emptyLogs.length > 0) {
    const { error: logsError } = await supabase.from("set_logs").insert(emptyLogs);
    if (logsError) throw new Error(`set_logs insert: ${logsError.message}`);
  }
}
async function fetchCurrentPlan(userId, weekStart) {
  if (!userId) return null;
  const { data: planRow, error: planError } = await supabase.from("weekly_plans").select("*").eq("user_id", userId).eq("week_start", weekStart).maybeSingle();
  if (planError) throw new Error(`fetchCurrentPlan: ${planError.message}`);
  if (!planRow) return null;
  const plan2 = {
    id: planRow.id,
    user_id: planRow.user_id,
    week_start: planRow.week_start,
    review_day: planRow.review_day,
    source: planRow.source,
    created_at: planRow.created_at
  };
  const { data: dayRows } = await supabase.from("planned_days").select("*").eq("plan_id", plan2.id).order("day_of_week");
  const days2 = (dayRows ?? []).map((d) => ({
    id: d.id,
    plan_id: d.plan_id,
    day_of_week: d.day_of_week,
    label: d.label,
    is_rest_day: d.is_rest_day
  }));
  const dayIds = days2.map((d) => d.id);
  const { data: exRows } = await supabase.from("planned_exercises").select("*").in("planned_day_id", dayIds).order("order");
  const exercises2 = (exRows ?? []).map((e) => ({
    id: e.id,
    planned_day_id: e.planned_day_id,
    exercisedb_id: e.exercisedb_id,
    exercise_name: e.exercise_name,
    body_parts: e.body_parts,
    target_muscles: e.target_muscles,
    equipments: e.equipments,
    cue: e.cue ?? void 0,
    superset_group: e.superset_group ?? void 0,
    order: e.order
  }));
  const exIds = exercises2.map((e) => e.id);
  const { data: setRows } = await supabase.from("planned_sets").select("*").in("planned_exercise_id", exIds).order("set_number");
  const plannedSets2 = (setRows ?? []).map((s) => ({
    id: s.id,
    planned_exercise_id: s.planned_exercise_id,
    set_number: s.set_number,
    set_type: s.set_type,
    target_reps: s.target_reps,
    target_weight: s.target_weight,
    drops: s.drops
  }));
  const setIds = plannedSets2.map((s) => s.id);
  const { data: logRows } = await supabase.from("set_logs").select("*").in("planned_set_id", setIds).order("set_number");
  const setLogs2 = (logRows ?? []).map((l) => ({
    id: l.id,
    workout_log_id: l.workout_log_id,
    planned_exercise_id: l.planned_exercise_id,
    planned_set_id: l.planned_set_id,
    set_number: l.set_number,
    actual_reps: l.actual_reps,
    actual_weight: l.actual_weight,
    completed: l.completed,
    drop_logs: l.drop_logs
  }));
  return { plan: plan2, days: days2, exercises: exercises2, plannedSets: plannedSets2, setLogs: setLogs2 };
}
async function upsertSetLogs(logs) {
  if (logs.length === 0) return;
  const rows = logs.map((l) => ({
    id: l.id,
    workout_log_id: l.workout_log_id,
    planned_exercise_id: l.planned_exercise_id,
    planned_set_id: l.planned_set_id,
    set_number: l.set_number,
    actual_reps: l.actual_reps,
    actual_weight: l.actual_weight,
    completed: l.completed,
    drop_logs: l.drop_logs ?? null,
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }));
  const { error } = await supabase.from("set_logs").upsert(rows, { onConflict: "id" });
  if (error) throw new Error(`upsertSetLogs: ${error.message}`);
}
const STORAGE_KEYS = [
  { key: "push_device_id", scope: "session" },
  { key: "push_generated_plan", scope: "week" },
  { key: "push_set_logs", scope: "week" },
  { key: "push_onboarding_data", scope: "session" },
  { key: "push_preferences", scope: "session" },
  { key: "push_checkin", scope: "week" }
];
function clearWeekData() {
  if (typeof localStorage === "undefined") return;
  for (const { key, scope } of STORAGE_KEYS) {
    if (scope === "week") {
      localStorage.removeItem(key);
    }
  }
}
const GENERATED_PLAN_KEY = "push_generated_plan";
const SET_LOGS_KEY = "push_set_logs";
async function saveGeneratedPlan(generated) {
  localStorage.setItem(GENERATED_PLAN_KEY, JSON.stringify({ ...generated, week_start: getCurrentWeekStart() }));
  try {
    const userId = await getUserId();
    const weekStart = getCurrentWeekStart();
    await savePlanToSupabase(userId, generated, weekStart);
    console.log("[Push] Plan saved to Supabase");
  } catch (e) {
    console.warn("[Push] Supabase plan save failed:", e instanceof Error ? e.message : e);
  }
}
function createEmptySetLogs(sets) {
  return sets.map((ps) => ({
    id: `log-${ps.id}`,
    workout_log_id: `wlog-${ps.planned_exercise_id}`,
    planned_exercise_id: ps.planned_exercise_id,
    planned_set_id: ps.id,
    set_number: ps.set_number,
    actual_reps: null,
    actual_weight: null,
    completed: false
  }));
}
function mergeSavedLogs(emptyLogs) {
  if (typeof localStorage === "undefined") return emptyLogs;
  const raw = localStorage.getItem(SET_LOGS_KEY);
  if (!raw) return emptyLogs;
  try {
    const saved = JSON.parse(raw);
    const savedById = new Map(saved.map((s) => [s.id, s]));
    return emptyLogs.map((log) => {
      const s = savedById.get(log.id);
      if (!s) return log;
      return { ...log, actual_reps: s.actual_reps, actual_weight: s.actual_weight, completed: s.completed, drop_logs: s.drop_logs ?? log.drop_logs };
    });
  } catch {
    return emptyLogs;
  }
}
function getCurrentWeekStart() {
  const now = /* @__PURE__ */ new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  return monday.toISOString().split("T")[0];
}
function cacheToLocalStorage(data) {
  if (typeof localStorage === "undefined") return;
  const generated = {
    days: data.days,
    exercises: data.exercises,
    sets: data.plannedSets,
    source: data.plan.source ?? "ai"
  };
  localStorage.setItem(GENERATED_PLAN_KEY, JSON.stringify({ ...generated, week_start: data.plan.week_start }));
  localStorage.setItem(SET_LOGS_KEY, JSON.stringify(data.setLogs));
}
async function getCurrentWeek() {
  const userId = typeof localStorage !== "undefined" ? await getUserId() : "";
  const weekStart = getCurrentWeekStart();
  if (userId) {
    try {
      const supabaseData = await fetchCurrentPlan(userId, weekStart);
      if (supabaseData && supabaseData.days.length > 0) {
        cacheToLocalStorage(supabaseData);
        return supabaseData;
      }
    } catch (e) {
      console.warn("[Push] Supabase fetch failed, falling back to localStorage:", e instanceof Error ? e.message : e);
    }
  }
  if (typeof localStorage !== "undefined") {
    const raw = localStorage.getItem(GENERATED_PLAN_KEY);
    if (raw) {
      try {
        const generated = JSON.parse(raw);
        if (generated.week_start && generated.week_start !== weekStart) {
          console.log(`[Push] Week rollover: stored plan is from ${generated.week_start}, current week is ${weekStart}`);
          clearWeekData();
        } else {
          if (userId) {
            savePlanToSupabase(userId, generated, weekStart).then(() => {
              const logsRaw = localStorage.getItem(SET_LOGS_KEY);
              if (logsRaw) {
                const logs = JSON.parse(logsRaw);
                return upsertSetLogs(logs);
              }
            }).then(() => console.log("[Push] Backfilled plan + logs to Supabase")).catch((e) => console.warn("[Push] Backfill failed:", e instanceof Error ? e.message : e));
          }
          const plan2 = {
            id: "gen-plan-1",
            user_id: userId || "user-1",
            week_start: weekStart,
            review_day: 6,
            source: generated.source,
            created_at: (/* @__PURE__ */ new Date()).toISOString()
          };
          return {
            plan: plan2,
            days: generated.days,
            exercises: structuredClone(generated.exercises),
            plannedSets: structuredClone(generated.sets),
            setLogs: mergeSavedLogs(createEmptySetLogs(generated.sets))
          };
        }
      } catch {
      }
    }
  }
  return null;
}
let plan = null;
let days = [];
let exercises = [];
let plannedSets = [];
let setLogs = [];
let loaded = false;
async function reloadWorkoutStore() {
  const data = await getCurrentWeek();
  if (!data) return;
  plan = data.plan;
  days = data.days;
  exercises = data.exercises;
  plannedSets = data.plannedSets;
  setLogs = data.setLogs;
  loaded = true;
}
function getPlan() {
  return plan;
}
function getDays() {
  return days;
}
function getDay(dayIndex) {
  return days[dayIndex];
}
function getExercisesForDay(dayId) {
  return exercises.filter((e) => e.planned_day_id === dayId);
}
function getExerciseByDbId(exercisedbId) {
  return exercises.find((e) => e.exercisedb_id === exercisedbId);
}
function getSetsForExercise(exerciseId) {
  return plannedSets.filter((s) => s.planned_exercise_id === exerciseId).sort((a, b) => a.set_number - b.set_number);
}
function getLogsForExercise(exerciseId) {
  return setLogs.filter((s) => s.planned_exercise_id === exerciseId).sort((a, b) => a.set_number - b.set_number);
}
function getPlannedSetsForDay(dayId) {
  const dayExercises = getExercisesForDay(dayId);
  return plannedSets.filter((s) => dayExercises.some((e) => e.id === s.planned_exercise_id));
}
function getSetLogsForDay(dayId) {
  const dayExercises = getExercisesForDay(dayId);
  return setLogs.filter((s) => dayExercises.some((e) => e.id === s.planned_exercise_id));
}
function getAllSetLogs() {
  return setLogs;
}
function getCurrentWeekHistory() {
  if (!loaded || !plan) return null;
  return {
    weekNumber: 1,
    weekStart: plan.week_start,
    days,
    exercises,
    plannedSets,
    setLogs
  };
}
export {
  getDay as a,
  getExercisesForDay as b,
  getPlannedSetsForDay as c,
  getSetLogsForDay as d,
  getDays as e,
  getAllSetLogs as f,
  getPlan as g,
  getExerciseByDbId as h,
  getSetsForExercise as i,
  getLogsForExercise as j,
  getCurrentWeekHistory as k,
  reloadWorkoutStore as r,
  saveGeneratedPlan as s
};
