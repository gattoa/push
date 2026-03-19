import { e as ensure_array_like, c as attr_class, i as bind_props, f as stringify } from "../../../../chunks/index.js";
import { e as escape_html, a as attr } from "../../../../chunks/attributes.js";
import { c as computeCalendarWeeks, a as computePersonalRecords, b as computeStreak, d as computeLifetimeStats, e as convertWeight } from "../../../../chunks/workout-stats.js";
import { P as PhotoUpload } from "../../../../chunks/PhotoUpload.js";
const DB_NAME = "push_photos";
const STORE_NAME = "progress_photos";
const DB_VERSION = 1;
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function getAllPhotos() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => {
      const photos = request.result.map(({ id, date, thumbnailUrl }) => ({ id, date, thumbnailUrl })).sort((a, b) => b.date.localeCompare(a.date));
      resolve(photos);
    };
    request.onerror = () => reject(request.error);
  });
}
function CalendarGrid($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];
    let { weeks, selectedDay = null } = $$props;
    function isSelected(day) {
      return selectedDay !== null && selectedDay.date === day.date;
    }
    $$renderer2.push(`<div class="calendar card svelte-1q5lr4u"><div class="calendar-header svelte-1q5lr4u"><!--[-->`);
    const each_array = ensure_array_like(DAY_LABELS);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let label = each_array[$$index];
      $$renderer2.push(`<span class="day-label svelte-1q5lr4u">${escape_html(label)}</span>`);
    }
    $$renderer2.push(`<!--]--></div> <!--[-->`);
    const each_array_1 = ensure_array_like(weeks);
    for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
      let week = each_array_1[$$index_2];
      $$renderer2.push(`<div${attr_class("calendar-row svelte-1q5lr4u", void 0, { "current": week.isCurrent })}><!--[-->`);
      const each_array_2 = ensure_array_like(week.days);
      for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
        let day = each_array_2[$$index_1];
        $$renderer2.push(`<button${attr_class("day-cell svelte-1q5lr4u", void 0, { "selected": isSelected(day) })}>`);
        if (day.isRestDay) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<span class="indicator rest svelte-1q5lr4u">·</span>`);
        } else if (day.isCompleted) {
          $$renderer2.push("<!--[1-->");
          $$renderer2.push(`<span class="indicator completed svelte-1q5lr4u">●</span>`);
        } else if (day.exercises.length > 0) {
          $$renderer2.push("<!--[2-->");
          $$renderer2.push(`<span class="indicator missed svelte-1q5lr4u">○</span>`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`<span class="indicator rest svelte-1q5lr4u">·</span>`);
        }
        $$renderer2.push(`<!--]--></button>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function PhotoViewer($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { photoId, date, open = false } = $$props;
    function formatDate(iso) {
      const d = /* @__PURE__ */ new Date(iso + "T00:00:00");
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
      return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    }
    if (open) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="overlay svelte-kr1xu" role="dialog" aria-label="Photo viewer" tabindex="-1"><div class="viewer svelte-kr1xu" role="presentation"><button class="close-btn svelte-kr1xu">✕</button> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <p class="date-caption svelte-kr1xu">${escape_html(formatDate(date))}</p></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { open });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let units = "lbs";
    let photos = [];
    let viewerOpen = false;
    let viewerPhotoId = "";
    let viewerDate = "";
    let selectedDay = null;
    let calendarWeeks = computeCalendarWeeks([]);
    let personalRecords = computePersonalRecords([]);
    let streak = computeStreak([]);
    let lifetimeStats = computeLifetimeStats([]);
    let prCount = 0;
    async function loadPhotos() {
      try {
        photos = await getAllPhotos();
      } catch {
      }
    }
    function w(lbs) {
      return `${convertWeight(lbs, units).toLocaleString()} ${units}`;
    }
    function formatDate(iso) {
      const d = /* @__PURE__ */ new Date(iso + "T00:00:00");
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
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="history svelte-pozi06"><div class="card stats-bar svelte-pozi06"><div class="stat svelte-pozi06"><span class="stat-value svelte-pozi06">${escape_html(lifetimeStats.totalWorkouts)}</span> <span class="stat-label svelte-pozi06">Workouts</span></div> <div class="stat-divider svelte-pozi06"></div> <div class="stat svelte-pozi06"><span class="stat-value svelte-pozi06">${escape_html(streak.best)}</span> <span class="stat-label svelte-pozi06">Best Streak</span></div> <div class="stat-divider svelte-pozi06"></div> <div class="stat svelte-pozi06"><span class="stat-value svelte-pozi06">${escape_html(prCount)}</span> <span class="stat-label svelte-pozi06">PRs</span></div></div> <div class="group svelte-pozi06"><p class="group-label svelte-pozi06">Activity</p> `);
      CalendarGrid($$renderer3, {
        weeks: calendarWeeks,
        selectedDay
      });
      $$renderer3.push(`<!----> `);
      {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--></div> <div class="group svelte-pozi06"><p class="group-label svelte-pozi06">Personal Records</p> `);
      if (personalRecords.length > 0) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="card svelte-pozi06"><!--[-->`);
        const each_array = ensure_array_like(personalRecords);
        for (let i = 0, $$length = each_array.length; i < $$length; i++) {
          let pr = each_array[i];
          if (i > 0) {
            $$renderer3.push("<!--[0-->");
            $$renderer3.push(`<div class="divider svelte-pozi06"></div>`);
          } else {
            $$renderer3.push("<!--[-1-->");
          }
          $$renderer3.push(`<!--]--> <div class="row static pr-row svelte-pozi06"><div class="pr-info svelte-pozi06"><span class="row-label svelte-pozi06">${escape_html(pr.exerciseName)}</span> <span class="pr-detail svelte-pozi06">${escape_html(w(pr.weight))} × ${escape_html(pr.reps)}</span></div> <span class="row-value pr-value svelte-pozi06">${escape_html(w(pr.estimated1RM))}</span></div>`);
        }
        $$renderer3.push(`<!--]--></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
        $$renderer3.push(`<div class="card empty-state svelte-pozi06"><p class="svelte-pozi06">Complete your first workout to start tracking personal records.</p></div>`);
      }
      $$renderer3.push(`<!--]--></div> <div class="group svelte-pozi06"><div class="group-header svelte-pozi06"><p class="group-label svelte-pozi06">Progress Photos</p> `);
      PhotoUpload($$renderer3, { onupload: loadPhotos });
      $$renderer3.push(`<!----></div> `);
      if (photos.length > 0) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="photo-grid svelte-pozi06"><!--[-->`);
        const each_array_1 = ensure_array_like(photos);
        for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
          let photo = each_array_1[$$index_1];
          $$renderer3.push(`<button class="photo-grid-item svelte-pozi06"><img${attr("src", photo.thumbnailUrl)}${attr("alt", `Progress ${stringify(photo.date)}`)} class="svelte-pozi06"/> <span class="photo-date svelte-pozi06">${escape_html(formatDate(photo.date))}</span></button>`);
        }
        $$renderer3.push(`<!--]--></div>`);
      } else {
        $$renderer3.push("<!--[-1-->");
        $$renderer3.push(`<div class="card empty-state svelte-pozi06"><p class="svelte-pozi06">Take your first progress photo to start tracking your transformation.</p></div>`);
      }
      $$renderer3.push(`<!--]--></div></div> `);
      PhotoViewer($$renderer3, {
        photoId: viewerPhotoId,
        date: viewerDate,
        get open() {
          return viewerOpen;
        },
        set open($$value) {
          viewerOpen = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!---->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
export {
  _page as default
};
