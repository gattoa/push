import { c as attr_class, e as ensure_array_like, d as derived } from "../../../../../chunks/index.js";
import { h as getExerciseByDbId, i as getSetsForExercise, j as getLogsForExercise } from "../../../../../chunks/workout.svelte.js";
import { g as getPreferences } from "../../../../../chunks/preferences.js";
import "../../../../../chunks/supabase.js";
import { e as escape_html, a as attr } from "../../../../../chunks/attributes.js";
function SetRow($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { plannedSet, setLog } = $$props;
    getPreferences().units;
    let isDrop = derived(() => plannedSet.set_type === "drop");
    let completed = derived(() => setLog.completed);
    let weight = derived(() => setLog.actual_weight ?? plannedSet.target_weight ?? 0);
    let reps = derived(() => setLog.actual_reps ?? plannedSet.target_reps);
    let weightChanged = derived(() => setLog.actual_weight !== null && setLog.actual_weight !== plannedSet.target_weight);
    let repsChanged = derived(() => setLog.actual_reps !== null && setLog.actual_reps !== plannedSet.target_reps);
    function wl(w) {
      return w === null ? "BW" : `${w}`;
    }
    $$renderer2.push(`<div${attr_class("row svelte-1d6mts4", void 0, {
      "completed": completed(),
      "warmup": plannedSet.set_type === "warmup"
    })}><span class="set-num svelte-1d6mts4">${escape_html(plannedSet.set_number)}</span> `);
    if (plannedSet.set_type === "warmup") {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="tag svelte-1d6mts4">warm</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="values svelte-1d6mts4">`);
    if (plannedSet.target_weight === null) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="bw svelte-1d6mts4">BW</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<input type="number"${attr("value", weight())} min="0"${attr_class("val svelte-1d6mts4", void 0, { "changed": weightChanged() })}/>`);
    }
    $$renderer2.push(`<!--]--> <span class="x svelte-1d6mts4">×</span> <input type="number"${attr("value", reps())} min="0"${attr_class("val reps-val svelte-1d6mts4", void 0, { "changed": repsChanged() })}/> `);
    if (weightChanged() || repsChanged()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="was svelte-1d6mts4">${escape_html(wl(plannedSet.target_weight))}×${escape_html(plannedSet.target_reps)}</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <button${attr_class("tog svelte-1d6mts4", void 0, { "done": completed() })}>`);
    if (completed()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="ck svelte-1d6mts4">✓</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></button></div> `);
    if (isDrop() && plannedSet.drops) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(plannedSet.drops);
      for (let i = 0, $$length = each_array.length; i < $$length; i++) {
        let drop = each_array[i];
        const dw = setLog.drop_logs?.[i]?.actual_weight ?? drop.target_weight ?? 0;
        const dr = setLog.drop_logs?.[i]?.actual_reps ?? drop.target_reps;
        $$renderer2.push(`<div${attr_class("row drop svelte-1d6mts4", void 0, { "completed": completed() })}><span class="tag svelte-1d6mts4">drop</span> <div class="values svelte-1d6mts4">`);
        if (drop.target_weight === null) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<span class="bw svelte-1d6mts4">BW</span>`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`<input type="number"${attr("value", dw)} min="0" class="val sm svelte-1d6mts4"/>`);
        }
        $$renderer2.push(`<!--]--> <span class="x svelte-1d6mts4">×</span> <input type="number"${attr("value", dr)} min="0" class="val reps-val sm svelte-1d6mts4"/></div> <span class="tog-spacer svelte-1d6mts4"></span></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function QuickComplete($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { setLogs } = $$props;
    let allDone = derived(() => setLogs.every((s) => s.completed));
    $$renderer2.push(`<button${attr_class("quick-complete svelte-1s3lnno", void 0, { "done": allDone() })}${attr("disabled", allDone(), true)}>${escape_html(allDone() ? "✓ All Complete" : "Complete All Sets")}</button>`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { data } = $$props;
    let exercise = derived(() => data.exercise);
    getPreferences().units;
    let exerciseHistoryData = null;
    let exerciseId = derived(() => data.exerciseId ?? "");
    let plannedExercise = derived(() => getExerciseByDbId(exerciseId()) ?? null);
    let plannedSets = derived(() => plannedExercise() ? getSetsForExercise(plannedExercise().id) : []);
    let setLogs = derived(() => plannedExercise() ? getLogsForExercise(plannedExercise().id) : []);
    let exerciseHistory = derived(() => exerciseHistoryData);
    let completedCount = derived(() => setLogs().filter((s) => s.completed).length);
    let allDone = derived(() => completedCount() === plannedSets().length && plannedSets().length > 0);
    const displayName = derived(() => plannedExercise()?.exercise_name ?? exercise()?.name ?? exerciseHistory()?.exerciseName ?? "Exercise");
    const equipments = derived(() => plannedExercise()?.equipments ?? exercise()?.equipments ?? []);
    const targetMuscles = derived(() => exercise()?.targetMuscles ?? []);
    const secondaryMuscles = derived(() => exercise()?.secondaryMuscles ?? []);
    let activeTab = "log";
    const hasGuide = derived(() => exercise() && (exercise().videoUrl || exercise().imageUrl || exercise().overview || exercise().instructions.length > 0 || exercise().exerciseTips.length > 0));
    const hasHistory = derived(() => exerciseHistory() && exerciseHistory().sessions.length > 0);
    const hasLog = derived(() => plannedExercise() && plannedSets().length > 0);
    const availableTabs = derived(() => () => {
      const tabs = [];
      if (hasLog()) tabs.push({ id: "log", label: "Log" });
      if (hasGuide()) tabs.push({ id: "guide", label: "Guide" });
      if (hasHistory()) tabs.push({ id: "history", label: "History" });
      return tabs;
    });
    const showTabs = derived(() => availableTabs()().length > 1);
    $$renderer2.push(`<div class="exercise-page svelte-p4702e"><button class="back-btn svelte-p4702e"><span class="back-arrow svelte-p4702e">‹</span> Back</button> <div class="exercise-identity svelte-p4702e"><div class="name-row svelte-p4702e"><h1 class="svelte-p4702e">${escape_html(displayName())}</h1> `);
    if (allDone()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="status-badge done svelte-p4702e">✓</span>`);
    } else if (completedCount() > 0) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<span class="status-badge partial svelte-p4702e">${escape_html(completedCount())}/${escape_html(plannedSets().length)}</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    if (targetMuscles().length > 0 || secondaryMuscles().length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="muscle-chips svelte-p4702e"><!--[-->`);
      const each_array = ensure_array_like(targetMuscles());
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let muscle = each_array[$$index];
        $$renderer2.push(`<span class="chip target svelte-p4702e">${escape_html(muscle)}</span>`);
      }
      $$renderer2.push(`<!--]--> <!--[-->`);
      const each_array_1 = ensure_array_like(secondaryMuscles());
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let muscle = each_array_1[$$index_1];
        $$renderer2.push(`<span class="chip secondary svelte-p4702e">${escape_html(muscle)}</span>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (plannedExercise()?.cue) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p class="cue svelte-p4702e">"${escape_html(plannedExercise().cue)}"</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (equipments().length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="equipment svelte-p4702e">${escape_html(equipments().join(" · "))}</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    if (showTabs()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="tab-bar svelte-p4702e"><!--[-->`);
      const each_array_2 = ensure_array_like(availableTabs()());
      for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
        let tab = each_array_2[$$index_2];
        $$renderer2.push(`<button${attr_class("tab-btn svelte-p4702e", void 0, { "active": activeTab === tab.id })}>${escape_html(tab.label)}</button>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="tab-content svelte-p4702e">`);
    if (hasLog() && plannedExercise()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="log-section svelte-p4702e"><div class="log-header svelte-p4702e"><span class="log-header-label set-col svelte-p4702e">SET</span> <span class="log-header-label svelte-p4702e">WEIGHT</span> <span class="log-header-label svelte-p4702e">REPS</span></div> <div class="sets-list svelte-p4702e"><!--[-->`);
      const each_array_3 = ensure_array_like(plannedSets());
      for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
        let ps = each_array_3[$$index_3];
        const log = setLogs().find((s) => s.planned_set_id === ps.id);
        if (log) {
          $$renderer2.push("<!--[0-->");
          SetRow($$renderer2, { plannedSet: ps, setLog: log });
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></div> `);
      QuickComplete($$renderer2, {
        plannedSets: plannedSets(),
        setLogs: setLogs(),
        exerciseId: plannedExercise().id
      });
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    if (!exercise() && !exerciseHistory() && !plannedExercise()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p class="not-found svelte-p4702e">Exercise not found.</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
