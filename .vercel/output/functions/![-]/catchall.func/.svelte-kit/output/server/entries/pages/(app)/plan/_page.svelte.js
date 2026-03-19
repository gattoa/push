import { e as escape_html, a as attr } from "../../../../chunks/attributes.js";
import { e as ensure_array_like, c as attr_class, f as stringify } from "../../../../chunks/index.js";
import { g as getTodayIndex } from "../../../../chunks/date.js";
import { f as computeWeekMomentum } from "../../../../chunks/workout-stats.js";
import { k as getCurrentWeekHistory } from "../../../../chunks/workout.svelte.js";
function WeekSchedule($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { momentum, editable = false } = $$props;
    const todayIndex = getTodayIndex();
    let selectedIndex = null;
    const DAY_LABELS = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday"
    ];
    function computeDayIso(dayOfWeek) {
      const d = /* @__PURE__ */ new Date(momentum.weekStart + "T00:00:00");
      d.setDate(d.getDate() + dayOfWeek);
      return d.toISOString().split("T")[0];
    }
    function computeDayDate(dayOfWeek) {
      const d = /* @__PURE__ */ new Date(momentum.weekStart + "T00:00:00");
      d.setDate(d.getDate() + dayOfWeek);
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ];
      return `${months[d.getMonth()]} ${d.getDate()}`;
    }
    function dayState(day, index) {
      const hasWorkout = day.exerciseNames.length > 0 && !day.isRestDay;
      if (day.completed && index === todayIndex) return "completed-today";
      if (day.completed) return "completed";
      if (index === todayIndex) return "today";
      if (day.isRestDay || !hasWorkout) return "rest";
      if (index < todayIndex) return "missed";
      return "future";
    }
    $$renderer2.push(`<div class="week-schedule svelte-19j16tn"><!--[-->`);
    const each_array = ensure_array_like(momentum.dayCompletions);
    for (let i = 0, $$length = each_array.length; i < $$length; i++) {
      let day = each_array[i];
      const state = dayState(day, i);
      const iso = computeDayIso(day.dayOfWeek);
      const dateStr = computeDayDate(day.dayOfWeek);
      const isSelected = editable && selectedIndex === i;
      if (editable) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<button${attr_class(`day-row ${stringify(state)}`, "svelte-19j16tn", { "swap-selected": isSelected, "swap-mode": editable })}><div class="day-header svelte-19j16tn"><div class="day-label-group svelte-19j16tn">`);
        if (isSelected) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<span class="swap-indicator svelte-19j16tn"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 6l4-4 4 4M4 10l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></span>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--> <span class="day-name svelte-19j16tn">${escape_html(DAY_LABELS[i])}</span> <span class="day-date svelte-19j16tn">${escape_html(dateStr)}</span></div> <div class="day-meta svelte-19j16tn">`);
        if (day.completed) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<svg class="check-icon svelte-19j16tn" width="14" height="14" viewBox="0 0 16 16" fill="none"><polyline points="3,8 6.5,11.5 13,4.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--> <span class="split-label svelte-19j16tn">${escape_html(day.label)}</span></div></div> `);
        if (!day.isRestDay && day.exerciseNames.length > 0) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="exercise-list svelte-19j16tn"><!--[-->`);
          const each_array_1 = ensure_array_like(day.exerciseNames);
          for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
            let name = each_array_1[$$index];
            $$renderer2.push(`<span class="exercise-name svelte-19j16tn">${escape_html(name)}</span>`);
          }
          $$renderer2.push(`<!--]--></div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></button>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<a${attr("href", `/session/${stringify(iso)}`)}${attr_class(`day-row ${stringify(state)}`, "svelte-19j16tn")}><div class="day-header svelte-19j16tn"><div class="day-label-group svelte-19j16tn"><span class="day-name svelte-19j16tn">${escape_html(DAY_LABELS[i])}</span> <span class="day-date svelte-19j16tn">${escape_html(dateStr)}</span></div> <div class="day-meta svelte-19j16tn">`);
        if (day.completed) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<svg class="check-icon svelte-19j16tn" width="14" height="14" viewBox="0 0 16 16" fill="none"><polyline points="3,8 6.5,11.5 13,4.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--> <span class="split-label svelte-19j16tn">${escape_html(day.label)}</span></div></div> `);
        if (!day.isRestDay && day.exerciseNames.length > 0) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="exercise-list svelte-19j16tn"><!--[-->`);
          const each_array_2 = ensure_array_like(day.exerciseNames);
          for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
            let name = each_array_2[$$index_1];
            $$renderer2.push(`<span class="exercise-name svelte-19j16tn">${escape_html(name)}</span>`);
          }
          $$renderer2.push(`<!--]--></div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></a>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let momentum = null;
    let editing = false;
    function recompute() {
      const current = getCurrentWeekHistory();
      if (!current) {
        momentum = null;
        return;
      }
      momentum = computeWeekMomentum([current], getTodayIndex());
    }
    recompute();
    if (momentum) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="plan svelte-15o7esh"><div class="plan-header svelte-15o7esh"><h1 class="svelte-15o7esh">This Week</h1> <button class="edit-btn svelte-15o7esh">${escape_html("Edit")}</button></div> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      WeekSchedule($$renderer2, { momentum, editable: editing });
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="plan svelte-15o7esh"><div class="plan-header svelte-15o7esh"><h1 class="svelte-15o7esh">This Week</h1></div> <p class="empty-state svelte-15o7esh">No plan yet. Head to Today to generate one.</p></div>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _page as default
};
