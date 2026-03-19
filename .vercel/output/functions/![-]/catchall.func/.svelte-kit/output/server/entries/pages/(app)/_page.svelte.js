import { c as attr_class, d as derived, e as ensure_array_like, f as stringify, h as attr_style } from "../../../chunks/index.js";
import { a as attr, e as escape_html } from "../../../chunks/attributes.js";
import { g as getTodayIndex } from "../../../chunks/date.js";
import { g as getPlan, a as getDay, b as getExercisesForDay, c as getPlannedSetsForDay, d as getSetLogsForDay, e as getDays, s as saveGeneratedPlan, r as reloadWorkoutStore, f as getAllSetLogs } from "../../../chunks/workout.svelte.js";
import { g as getPreferences } from "../../../chunks/preferences.js";
import "../../../chunks/supabase.js";
import { P as PhotoUpload } from "../../../chunks/PhotoUpload.js";
async function fetchCatalog(equipment) {
  const response = await fetch("/api/exercisedb-catalog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ equipment })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(`Failed to fetch exercise catalog: ${err.error ?? "Unknown error"}`);
  }
  const result = await response.json();
  if (!result.success || !Array.isArray(result.catalog)) {
    throw new Error("Exercise catalog returned unexpected response");
  }
  return result.catalog;
}
async function generatePlan(data) {
  const catalog = await fetchCatalog(data.equipment ?? []);
  if (catalog.length === 0) {
    throw new Error("No exercises available for your equipment selection");
  }
  const response = await fetch("/api/generate-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, catalog })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error ?? err.details ?? "Plan generation failed");
  }
  const result = await response.json();
  if (result.success && result.plan) {
    return { ...result.plan, source: "ai" };
  }
  throw new Error("Plan generation returned unexpected response");
}
function SetCheckbox($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { plannedSet, setLog } = $$props;
    const units = getPreferences().units;
    const weightLabel = derived(() => plannedSet.target_weight === null ? "BW" : `${plannedSet.target_weight}`);
    const hasWeight = derived(() => plannedSet.target_weight !== null);
    $$renderer2.push(`<button${attr_class("set-col svelte-63br3h", void 0, { "completed": setLog.completed })}${attr("aria-label", setLog.completed ? `Undo set ${plannedSet.set_number}` : `Complete set ${plannedSet.set_number}: ${weightLabel()} ${hasWeight() ? units : ""} × ${plannedSet.target_reps}`)}><span class="reps svelte-63br3h">`);
    if (setLog.completed) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="check svelte-63br3h">✓</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->${escape_html(plannedSet.target_reps)}</span> <span class="weight svelte-63br3h">${escape_html(weightLabel())}</span></button>`);
  });
}
function DropSetColumn($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { plannedSet, setLog } = $$props;
    getPreferences().units;
    function weightLabel(w) {
      return w === null ? "BW" : `${w}`;
    }
    const stacks = derived(() => () => {
      const result = [
        {
          reps: plannedSet.target_reps,
          weight: plannedSet.target_weight
        }
      ];
      if (plannedSet.drops) {
        for (const drop of plannedSet.drops) {
          result.push({ reps: drop.target_reps, weight: drop.target_weight });
        }
      }
      return result;
    });
    $$renderer2.push(`<button${attr_class("drop-container svelte-10n5hsx", void 0, { "completed": setLog.completed })}${attr("aria-label", setLog.completed ? `Undo drop set ${plannedSet.set_number}` : `Complete drop set ${plannedSet.set_number}`)}><span class="drop-label svelte-10n5hsx">drop</span> <div class="drop-stacks svelte-10n5hsx"><!--[-->`);
    const each_array = ensure_array_like(stacks()());
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let stack = each_array[i];
      if (i > 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span class="arrow svelte-10n5hsx">→</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <div class="stack svelte-10n5hsx"><span class="reps svelte-10n5hsx">`);
      if (setLog.completed && i === 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span class="check svelte-10n5hsx">✓</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->${escape_html(stack.reps)}</span> <span class="weight svelte-10n5hsx">${escape_html(weightLabel(stack.weight))}</span></div>`);
    }
    $$renderer2.push(`<!--]--></div></button>`);
  });
}
function ExerciseTile($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      exercise,
      plannedSets,
      setLogs,
      isActive = false
    } = $$props;
    const completedCount = derived(() => setLogs.filter((s) => s.completed).length);
    const allDone = derived(() => completedCount() === plannedSets.length && plannedSets.length > 0);
    const contextParts = derived(() => () => {
      const parts = [];
      if (exercise.cue) parts.push(exercise.cue);
      if (exercise.equipments.length > 0) parts.push(exercise.equipments.join(", "));
      if (exercise.target_muscles.length > 0) parts.push(exercise.target_muscles[0].toLowerCase());
      return parts.join(" · ");
    });
    $$renderer2.push(`<div${attr_class("tile svelte-1735sb2", void 0, { "done": allDone(), "active": isActive && !allDone() })}><div class="tile-header svelte-1735sb2"><a${attr("href", `/exercise/${stringify(exercise.exercisedb_id)}`)} class="exercise-name svelte-1735sb2">${escape_html(exercise.exercise_name)}</a> `);
    if (allDone()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="badge done-badge svelte-1735sb2">✓</span>`);
    } else if (completedCount() > 0) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<span class="badge progress-badge svelte-1735sb2">${escape_html(completedCount())}/${escape_html(plannedSets.length)}</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    if (contextParts()()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="context svelte-1735sb2">${escape_html(contextParts()())}</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="sets-row svelte-1735sb2"><!--[-->`);
    const each_array = ensure_array_like(plannedSets);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let ps = each_array[$$index];
      const log = setLogs.find((s) => s.planned_set_id === ps.id);
      if (log) {
        $$renderer2.push("<!--[0-->");
        if (ps.set_type === "drop") {
          $$renderer2.push("<!--[0-->");
          DropSetColumn($$renderer2, { plannedSet: ps, setLog: log });
        } else {
          $$renderer2.push("<!--[-1-->");
          SetCheckbox($$renderer2, { plannedSet: ps, setLog: log });
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
const today = {
  /** Progress bar text when all sets are done */
  workoutComplete: "Complete",
  /** Rest day with more training days ahead this week */
  restDay: {
    nextSessionLabel: (dayName, label) => `${dayName} · ${label}`
  },
  /** Rest day at end of week — no more training days ahead */
  weekComplete: "You're done for the week.",
  /** Check-in card */
  checkIn: {
    title: "Progress photos",
    subtitle: "Optional snapshot for your trainer"
  }
};
function DailyWorkout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      plannedDay,
      exercises,
      plannedSets,
      setLogs,
      nextSession
    } = $$props;
    const DAY_NAMES = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ];
    const activeExerciseId = derived(() => () => {
      for (const ex of exercises.toSorted((a, b) => a.order - b.order)) {
        const exLogs = setLogs.filter((s) => s.planned_exercise_id === ex.id);
        if (exLogs.length === 0 || !exLogs.every((s) => s.completed)) return ex.id;
      }
      return null;
    });
    const sorted = derived(() => exercises.toSorted((a, b) => a.order - b.order));
    if (plannedDay.is_rest_day) {
      $$renderer2.push("<!--[0-->");
      if (nextSession) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="next-session svelte-uagjhg"><span class="next-session-header svelte-uagjhg">${escape_html(today.restDay.nextSessionLabel(DAY_NAMES[nextSession.day.day_of_week], nextSession.day.label))}</span> <ul class="next-session-exercises svelte-uagjhg"><!--[-->`);
        const each_array = ensure_array_like(nextSession.exercises.toSorted((a, b) => a.order - b.order));
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let exercise = each_array[$$index];
          $$renderer2.push(`<li class="svelte-uagjhg"><span class="exercise-name svelte-uagjhg">${escape_html(exercise.exercise_name)}</span> <span class="exercise-body-parts svelte-uagjhg">${escape_html(exercise.target_muscles.length > 0 ? exercise.target_muscles[0].toLowerCase() : "")}</span></li>`);
        }
        $$renderer2.push(`<!--]--></ul></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<p class="week-done svelte-uagjhg">${escape_html(today.weekComplete)}</p>`);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="exercise-list svelte-uagjhg"><!--[-->`);
      const each_array_1 = ensure_array_like(sorted());
      for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
        let exercise = each_array_1[i];
        const exPlannedSets = plannedSets.filter((s) => s.planned_exercise_id === exercise.id);
        const exSetLogs = setLogs.filter((s) => s.planned_exercise_id === exercise.id);
        const prevExercise = i > 0 ? sorted()[i - 1] : null;
        const isContinuationOfSuperset = exercise.superset_group && prevExercise?.superset_group === exercise.superset_group;
        if (isContinuationOfSuperset) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="superset-connector svelte-uagjhg"><div class="connector-line svelte-uagjhg"></div> <span class="connector-label svelte-uagjhg">superset</span> <div class="connector-line svelte-uagjhg"></div></div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--> `);
        ExerciseTile($$renderer2, {
          exercise,
          plannedSets: exPlannedSets,
          setLogs: exSetLogs,
          isActive: activeExerciseId()() === exercise.id
        });
        $$renderer2.push(`<!---->`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
const STORAGE_KEY = "push_checkin";
function getCheckInState(weekPlanId) {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const state = JSON.parse(raw);
  return state.weekPlanId === weekPlanId ? state : null;
}
function isCheckInPending(weekPlanId) {
  if (typeof window === "undefined") return false;
  const state = getCheckInState(weekPlanId);
  if (!state) return true;
  return state.completedAt === null;
}
function addCheckInPhoto(weekPlanId, photoId) {
  const existing = getCheckInState(weekPlanId);
  const state = existing ?? {
    weekPlanId,
    photoIds: [],
    completedAt: null
  };
  state.photoIds.push(photoId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function CheckInCard($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { weekPlanId } = $$props;
    let uploadedPhotos = [];
    function handlePhotoUploaded(photo) {
      uploadedPhotos.push(photo);
      addCheckInPhoto(weekPlanId, photo.id);
    }
    $$renderer2.push(`<div class="checkin-card svelte-wx144l"><div class="checkin-header svelte-wx144l"><span class="checkin-title svelte-wx144l">${escape_html(today.checkIn.title)}</span> <span class="checkin-subtitle svelte-wx144l">${escape_html(today.checkIn.subtitle)}</span></div> `);
    if (uploadedPhotos.length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="photo-strip svelte-wx144l"><!--[-->`);
      const each_array = ensure_array_like(uploadedPhotos);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let photo = each_array[$$index];
        $$renderer2.push(`<img${attr("src", photo.thumbnailUrl)} alt="Progress" class="photo-thumb svelte-wx144l"/>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="checkin-actions svelte-wx144l">`);
    PhotoUpload($$renderer2, { onupload: handlePhotoUploaded });
    $$renderer2.push(`<!----> `);
    if (uploadedPhotos.length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<button class="done-btn svelte-wx144l">Done</button>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
function PlanLoading($$renderer, $$props) {
  let { error = false, onretry } = $$props;
  $$renderer.push(`<div class="plan-loading svelte-w6066p">`);
  if (error) {
    $$renderer.push("<!--[0-->");
    $$renderer.push(`<h1 class="title svelte-w6066p">Something went wrong</h1> <p class="subtitle svelte-w6066p">We couldn't build your plan. Check your connection and try again.</p> `);
    if (onretry) {
      $$renderer.push("<!--[0-->");
      $$renderer.push(`<button class="retry-btn svelte-w6066p">Try Again</button>`);
    } else {
      $$renderer.push("<!--[-1-->");
    }
    $$renderer.push(`<!--]-->`);
  } else {
    $$renderer.push("<!--[-1-->");
    $$renderer.push(`<h1 class="title pulse svelte-w6066p">Building your plan...</h1> <div class="skeletons svelte-w6066p"><div class="skeleton-card svelte-w6066p"><div class="skeleton-line wide svelte-w6066p"></div> <div class="skeleton-line narrow svelte-w6066p"></div> <div class="skeleton-sets svelte-w6066p"><div class="skeleton-pill svelte-w6066p"></div> <div class="skeleton-pill svelte-w6066p"></div> <div class="skeleton-pill svelte-w6066p"></div></div></div> <div class="skeleton-card svelte-w6066p"><div class="skeleton-line wide svelte-w6066p"></div> <div class="skeleton-line narrow svelte-w6066p"></div> <div class="skeleton-sets svelte-w6066p"><div class="skeleton-pill svelte-w6066p"></div> <div class="skeleton-pill svelte-w6066p"></div> <div class="skeleton-pill svelte-w6066p"></div></div></div> <div class="skeleton-card svelte-w6066p"><div class="skeleton-line wide svelte-w6066p"></div> <div class="skeleton-line narrow svelte-w6066p"></div> <div class="skeleton-sets svelte-w6066p"><div class="skeleton-pill svelte-w6066p"></div> <div class="skeleton-pill svelte-w6066p"></div></div></div></div>`);
  }
  $$renderer.push(`<!--]--></div>`);
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let dayIndex = getTodayIndex();
    let planSource = null;
    let buildingPlan = false;
    let generationError = false;
    async function triggerGeneration() {
      buildingPlan = true;
      generationError = false;
      const rawData = localStorage.getItem("push_onboarding_data");
      if (rawData) {
        try {
          const onboardingData = JSON.parse(rawData);
          const plan = await generatePlan(onboardingData);
          console.log(`[Push] Plan generated via ${plan.source} — ${plan.exercises.length} exercises, ${plan.sets.length} sets`);
          await saveGeneratedPlan(plan);
          await reloadWorkoutStore();
          planSource = plan.source;
        } catch (e) {
          console.error("[Push] Plan generation failed:", e);
          generationError = true;
        }
      } else {
        generationError = true;
      }
      buildingPlan = false;
    }
    function retryGeneration() {
      triggerGeneration();
    }
    const todayPlan = derived(() => getDay(dayIndex));
    const todayExercises = derived(() => todayPlan() ? getExercisesForDay(todayPlan().id) : []);
    const todayPlannedSets = derived(() => todayPlan() ? getPlannedSetsForDay(todayPlan().id) : []);
    const todaySetLogs = derived(() => todayPlan() ? getSetLogsForDay(todayPlan().id) : []);
    const isTrainingDay = derived(() => todayPlan() ? !todayPlan().is_rest_day : false);
    const allTrainingDaysComplete = derived(() => () => {
      const allDays = getDays();
      const allLogs = getAllSetLogs();
      for (const day of allDays) {
        if (day.is_rest_day) continue;
        const dayExercises = getExercisesForDay(day.id);
        if (dayExercises.length === 0) continue;
        const dayLogs = allLogs.filter((s) => dayExercises.some((e) => e.id === s.planned_exercise_id));
        if (!dayLogs.every((s) => s.completed)) return false;
      }
      return true;
    });
    const showCheckIn = derived(() => getPlan() && allTrainingDaysComplete()() && true && isCheckInPending(getPlan().id));
    const completedSets = derived(() => todaySetLogs().filter((s) => s.completed).length);
    const totalSets = derived(() => todayPlannedSets().length);
    const progressPct = derived(() => totalSets() > 0 ? completedSets() / totalSets() * 100 : 0);
    const bodyParts = derived(() => [...new Set(todayExercises().flatMap((e) => e.body_parts))]);
    const nextTrainingDay = derived(() => () => {
      const allDays = getDays();
      for (let idx = dayIndex + 1; idx < allDays.length; idx++) {
        const day = allDays[idx];
        if (day && !day.is_rest_day) {
          const exs = getExercisesForDay(day.id);
          return { day, exercises: exs };
        }
      }
      return null;
    });
    if (buildingPlan || generationError || !todayPlan()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="today-page svelte-h7bcrl">`);
      PlanLoading($$renderer2, { error: generationError, onretry: retryGeneration });
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="today-page svelte-h7bcrl"><div class="today-header svelte-h7bcrl"><a href="/plan" class="today-date svelte-h7bcrl">${escape_html((/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }))}</a> <h1 class="svelte-h7bcrl">${escape_html(todayPlan().label)}</h1> `);
      if (planSource) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span${attr_class("source-badge svelte-h7bcrl", void 0, { "ai": planSource === "ai" })}>${escape_html(planSource === "ai" ? "AI Plan" : "Mock Plan")}</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (isTrainingDay() && bodyParts().length > 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="body-parts svelte-h7bcrl"><!--[-->`);
        const each_array = ensure_array_like(bodyParts());
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let part = each_array[$$index];
          $$renderer2.push(`<span class="chip svelte-h7bcrl">${escape_html(part.toLowerCase())}</span>`);
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div> `);
      if (isTrainingDay() && totalSets() > 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="progress-section svelte-h7bcrl"><div class="progress-track svelte-h7bcrl"><div class="progress-fill svelte-h7bcrl"${attr_style(`width: ${stringify(progressPct())}%`)}></div></div> <span class="progress-text svelte-h7bcrl">`);
        if (progressPct() === 100) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`${escape_html(today.workoutComplete)}`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`${escape_html(completedSets())} of ${escape_html(totalSets())} sets`);
        }
        $$renderer2.push(`<!--]--></span></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (showCheckIn()) {
        $$renderer2.push("<!--[0-->");
        CheckInCard($$renderer2, {
          weekPlanId: getPlan().id
        });
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      DailyWorkout($$renderer2, {
        plannedDay: todayPlan(),
        exercises: todayExercises(),
        plannedSets: todayPlannedSets(),
        setLogs: todaySetLogs(),
        nextSession: nextTrainingDay()()
      });
      $$renderer2.push(`<!----></div>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
