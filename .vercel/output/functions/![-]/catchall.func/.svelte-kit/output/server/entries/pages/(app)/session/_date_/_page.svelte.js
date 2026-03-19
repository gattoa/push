import { e as ensure_array_like, f as stringify, c as attr_class, d as derived, a as store_get, b as unsubscribe_stores } from "../../../../../chunks/index.js";
import { p as page } from "../../../../../chunks/stores.js";
import { e as escape_html, a as attr } from "../../../../../chunks/attributes.js";
import { c as computeCalendarWeeks, e as convertWeight } from "../../../../../chunks/workout-stats.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let units = "lbs";
    let calendarWeeks = computeCalendarWeeks([]);
    const dateParam = derived(() => store_get($$store_subs ??= {}, "$page", page).params.date ?? "");
    const dayData = derived(() => {
      for (const week of calendarWeeks) {
        for (const day of week.days) {
          if (day.date === dateParam()) return day;
        }
      }
      return null;
    });
    const sessionStats = derived(() => {
      if (!dayData() || dayData().exercises.length === 0) return null;
      let totalSets = 0;
      let completedSets = 0;
      let volume = 0;
      for (const ex of dayData().exercises) {
        for (const s of ex.sets) {
          totalSets++;
          if (s.completed) {
            completedSets++;
            if (s.weight !== null && s.reps !== null) {
              volume += s.weight * s.reps;
            }
          }
        }
      }
      return {
        exerciseCount: dayData().exercises.length,
        completedSets,
        totalSets,
        volume: convertWeight(volume, units)
      };
    });
    function formatDate(iso) {
      const d = /* @__PURE__ */ new Date(iso + "T00:00:00");
      const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ];
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      const dow = d.getDay();
      const dayLabel = days[dow === 0 ? 6 : dow - 1];
      return `${dayLabel}, ${months[d.getMonth()]} ${d.getDate()}`;
    }
    function formatSet(weight, reps) {
      if (weight === null || weight === 0) {
        return reps !== null ? `BW×${reps}` : "—";
      }
      const w = convertWeight(weight, units);
      return reps !== null ? `${w}×${reps}` : `${w}`;
    }
    function formatVolume(v) {
      if (v >= 1e3) return `${(v / 1e3).toFixed(1).replace(/\.0$/, "")}k`;
      return v.toLocaleString();
    }
    $$renderer2.push(`<div class="session-page svelte-13ody1j">`);
    if (dayData()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="session-header svelte-13ody1j"><p class="session-date svelte-13ody1j">${escape_html(formatDate(dateParam()))}</p> `);
      if (!dayData().isRestDay) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<h1 class="svelte-13ody1j">${escape_html(dayData().label)}</h1>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<h1 class="svelte-13ody1j">Rest Day</h1>`);
      }
      $$renderer2.push(`<!--]--> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div> `);
      if (sessionStats()) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="card stats-bar svelte-13ody1j"><div class="stat svelte-13ody1j"><span class="stat-value svelte-13ody1j">${escape_html(sessionStats().exerciseCount)}</span> <span class="stat-label svelte-13ody1j">Exercises</span></div> <div class="stat-divider svelte-13ody1j"></div> <div class="stat svelte-13ody1j"><span class="stat-value svelte-13ody1j">${escape_html(sessionStats().completedSets)}/${escape_html(sessionStats().totalSets)}</span> <span class="stat-label svelte-13ody1j">Sets</span></div> <div class="stat-divider svelte-13ody1j"></div> <div class="stat svelte-13ody1j"><span class="stat-value svelte-13ody1j">${escape_html(formatVolume(sessionStats().volume))}</span> <span class="stat-label svelte-13ody1j">Volume <span class="stat-unit svelte-13ody1j">${escape_html(units)}</span></span></div></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (dayData().exercises.length > 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="group svelte-13ody1j"><p class="group-label svelte-13ody1j">Exercises</p> <div class="card svelte-13ody1j"><!--[-->`);
        const each_array = ensure_array_like(dayData().exercises);
        for (let i = 0, $$length = each_array.length; i < $$length; i++) {
          let ex = each_array[i];
          if (i > 0) {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<div class="divider svelte-13ody1j"></div>`);
          } else {
            $$renderer2.push("<!--[-1-->");
          }
          $$renderer2.push(`<!--]--> <div class="exercise-row svelte-13ody1j"><div class="exercise-header svelte-13ody1j"><a${attr("href", `/exercise/${stringify(ex.exercisedbId)}`)} class="exercise-name svelte-13ody1j">${escape_html(ex.exerciseName)}</a> `);
          if (ex.allCompleted) {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<span class="check svelte-13ody1j">✓</span>`);
          } else {
            $$renderer2.push("<!--[-1-->");
          }
          $$renderer2.push(`<!--]--></div> `);
          if (ex.sets.length > 0) {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<div class="sets svelte-13ody1j"><!--[-->`);
            const each_array_1 = ensure_array_like(ex.sets);
            for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
              let s = each_array_1[$$index];
              $$renderer2.push(`<span${attr_class("set svelte-13ody1j", void 0, { "incomplete": !s.completed })}>${escape_html(formatSet(s.weight, s.reps))}</span>`);
            }
            $$renderer2.push(`<!--]--></div>`);
          } else {
            $$renderer2.push("<!--[-1-->");
          }
          $$renderer2.push(`<!--]--></div>`);
        }
        $$renderer2.push(`<!--]--></div></div>`);
      } else if (dayData().isRestDay) {
        $$renderer2.push("<!--[1-->");
        $$renderer2.push(`<div class="card empty-state svelte-13ody1j"><p class="svelte-13ody1j">Rest day — no exercises scheduled.</p></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="session-header svelte-13ody1j"><h1 class="svelte-13ody1j">Session Not Found</h1> <p class="session-date svelte-13ody1j">No data for ${escape_html(dateParam())}</p></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
