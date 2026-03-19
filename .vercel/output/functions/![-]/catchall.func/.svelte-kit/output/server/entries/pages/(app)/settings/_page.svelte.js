import { h as attr_style, e as ensure_array_like, c as attr_class, i as bind_props, d as derived, a as store_get, b as unsubscribe_stores } from "../../../../chunks/index.js";
import { e as escape_html, a as attr } from "../../../../chunks/attributes.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/root.js";
import "../../../../chunks/state.svelte.js";
import { p as page } from "../../../../chunks/stores.js";
import "../../../../chunks/supabase.js";
/* empty css                                                           */
function BottomSheet($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      open = void 0,
      title,
      options = [],
      value = null,
      values = [],
      multiSelect = false,
      onchange,
      children
    } = $$props;
    function isSelected(val) {
      if (multiSelect) {
        return values.includes(val);
      }
      return value === val;
    }
    if (open) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="backdrop svelte-1xhvrmi"><div class="sheet svelte-1xhvrmi" role="dialog" tabindex="-1"${attr_style("")}><div class="handle svelte-1xhvrmi"></div> <h3 class="sheet-title svelte-1xhvrmi">${escape_html(title)}</h3> `);
      if (children) {
        $$renderer2.push("<!--[0-->");
        children($$renderer2);
        $$renderer2.push(`<!---->`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<ul class="option-list svelte-1xhvrmi"><!--[-->`);
        const each_array = ensure_array_like(options);
        for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
          let opt = each_array[$$index];
          $$renderer2.push(`<li><button${attr_class("option-row svelte-1xhvrmi", void 0, { "selected": isSelected(opt.value) })}><span class="option-label svelte-1xhvrmi">${escape_html(opt.label)}</span> `);
          if (isSelected(opt.value)) {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<svg class="checkmark svelte-1xhvrmi" width="20" height="20" viewBox="0 0 20 20" fill="none"><polyline points="4,10 8,14 16,6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>`);
          } else {
            $$renderer2.push("<!--[-1-->");
          }
          $$renderer2.push(`<!--]--></button></li>`);
        }
        $$renderer2.push(`<!--]--></ul> `);
        if (multiSelect) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="done-wrapper svelte-1xhvrmi"><button class="done-btn svelte-1xhvrmi">Done</button></div>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { open, value, values });
  });
}
function SegmentedToggle($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { options, value = void 0, onchange } = $$props;
    $$renderer2.push(`<div class="segmented svelte-139c9rw"><!--[-->`);
    const each_array = ensure_array_like(options);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let opt = each_array[$$index];
      $$renderer2.push(`<button${attr_class("segment svelte-139c9rw", void 0, { "active": value === opt.value })}>${escape_html(opt.label)}</button>`);
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { value });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const session = derived(() => store_get($$store_subs ??= {}, "$page", page).data.session);
    const userEmail = derived(() => session()?.user?.email ?? "Not signed in");
    let data = {
      gender: null,
      experienceLevel: null,
      trainingDays: null,
      sessionDuration: null,
      equipment: [],
      goals: [],
      injuries: []
    };
    let prefs = { reviewDay: 6, units: "lbs", restTimerDefault: 90 };
    let sheetOpen = {
      gender: false,
      injuries: false,
      experience: false,
      days: false,
      sessionDuration: false,
      equipment: false,
      goals: false,
      reviewDay: false,
      restTimer: false
    };
    let hasChanges = false;
    let saved = false;
    function markChanged() {
      hasChanges = true;
      saved = false;
    }
    const genderLabels = {
      male: "Male",
      female: "Female",
      prefer_not_to_say: "Prefer not to say"
    };
    const experienceLabels = {
      beginner: "Beginner",
      intermediate: "Intermediate",
      advanced: "Advanced"
    };
    const goalLabels = {
      build_muscle: "Build Muscle",
      lose_fat: "Lose Fat",
      get_stronger: "Get Stronger",
      general_fitness: "General Fitness"
    };
    const injuryLabels = { shoulder: "Shoulder", back: "Back", knee: "Knee" };
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    let experienceDisplay = derived(() => data.experienceLevel ? experienceLabels[data.experienceLevel] : "Not set");
    let genderDisplay = derived(() => data.gender ? genderLabels[data.gender] : "Not set");
    let daysDisplay = derived(() => data.trainingDays ? `${data.trainingDays} days` : "Not set");
    let goalsDisplay = derived(() => data.goals.length > 0 ? data.goals.map((g) => goalLabels[g]).join(", ") : "Not set");
    let injuriesDisplay = derived(() => data.injuries.length > 0 ? data.injuries.map((i) => injuryLabels[i]).join(", ") : "None");
    let reviewDayDisplay = derived(() => dayNames[prefs.reviewDay] ?? "Sun");
    let restTimerDisplay = derived(() => prefs.restTimerDefault >= 120 ? `${prefs.restTimerDefault / 60} min` : `${prefs.restTimerDefault}s`);
    const equipmentLabels = {
      bodyweight: "Bodyweight",
      dumbbells: "Dumbbells",
      barbell: "Barbell & Rack",
      cable_machine: "Cable Machine",
      full_gym: "Full Gym"
    };
    let sessionDurationDisplay = derived(() => data.sessionDuration ? `${data.sessionDuration} min` : "Not set");
    let equipmentDisplay = derived(() => data.equipment.length > 0 ? data.equipment.includes("full_gym") ? "Full Gym" : data.equipment.map((e) => equipmentLabels[e]).join(", ") : "Not set");
    const genderOptions = [
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
      { value: "prefer_not_to_say", label: "Prefer not to say" }
    ];
    const experienceOptions = [
      { value: "beginner", label: "Beginner" },
      { value: "intermediate", label: "Intermediate" },
      { value: "advanced", label: "Advanced" }
    ];
    const daySheetOptions = [
      { value: 3, label: "3 days" },
      { value: 4, label: "4 days" },
      { value: 5, label: "5 days" },
      { value: 6, label: "6 days" }
    ];
    const goalSheetOptions = [
      { value: "build_muscle", label: "Build Muscle" },
      { value: "lose_fat", label: "Lose Fat" },
      { value: "get_stronger", label: "Get Stronger" },
      { value: "general_fitness", label: "General Fitness" }
    ];
    const injurySheetOptions = [
      { value: "__none__", label: "None" },
      { value: "shoulder", label: "Shoulder" },
      { value: "back", label: "Back" },
      { value: "knee", label: "Knee" }
    ];
    const reviewDaySheetOptions = [
      { value: 0, label: "Monday" },
      { value: 1, label: "Tuesday" },
      { value: 2, label: "Wednesday" },
      { value: 3, label: "Thursday" },
      { value: 4, label: "Friday" },
      { value: 5, label: "Saturday" },
      { value: 6, label: "Sunday" }
    ];
    const restTimerSheetOptions = [
      { value: 60, label: "60 seconds" },
      { value: 90, label: "90 seconds" },
      { value: 120, label: "2 minutes" },
      { value: 180, label: "3 minutes" }
    ];
    const sessionDurationSheetOptions = [
      { value: 30, label: "30 min" },
      { value: 45, label: "45 min" },
      { value: 60, label: "60 min" },
      { value: 75, label: "75 min" },
      { value: 90, label: "90 min" }
    ];
    const equipmentSheetOptions = [
      { value: "bodyweight", label: "Bodyweight Only" },
      { value: "dumbbells", label: "Dumbbells" },
      { value: "barbell", label: "Barbell & Rack" },
      { value: "cable_machine", label: "Cable Machine" },
      { value: "full_gym", label: "Full Gym" }
    ];
    const unitOptions = [{ value: "lbs", label: "lbs" }, { value: "kg", label: "kg" }];
    let injurySheetValues = derived(() => data.injuries.length === 0 ? ["__none__"] : data.injuries);
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="settings svelte-15kgmsr"><div class="settings-header svelte-15kgmsr"><button class="back-btn svelte-15kgmsr" aria-label="Back"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg></button> <h1 class="svelte-15kgmsr">Settings</h1> <div class="header-spacer svelte-15kgmsr"></div></div> <div class="card svelte-15kgmsr"><div class="row static svelte-15kgmsr"><span class="row-label svelte-15kgmsr">Email</span> <span class="row-value svelte-15kgmsr">${escape_html(userEmail())}</span></div></div> <div class="group svelte-15kgmsr"><p class="group-label svelte-15kgmsr">About You</p> <div class="card svelte-15kgmsr"><label class="row static svelte-15kgmsr"><span class="row-label svelte-15kgmsr">Date of birth</span> <input type="date" class="date-input svelte-15kgmsr"${attr("value", "")}/></label> <div class="divider svelte-15kgmsr"></div> <button class="row svelte-15kgmsr"><span class="row-label svelte-15kgmsr">Gender</span> <span class="row-value svelte-15kgmsr">${escape_html(genderDisplay())}</span></button> <div class="divider svelte-15kgmsr"></div> <button class="row svelte-15kgmsr"><span class="row-label svelte-15kgmsr">Injuries</span> <span class="row-value svelte-15kgmsr">${escape_html(injuriesDisplay())}</span></button></div></div> <div class="group svelte-15kgmsr"><p class="group-label svelte-15kgmsr">Training</p> <div class="card svelte-15kgmsr"><button class="row svelte-15kgmsr"><span class="row-label svelte-15kgmsr">Experience</span> <span class="row-value svelte-15kgmsr">${escape_html(experienceDisplay())}</span></button> <div class="divider svelte-15kgmsr"></div> <button class="row svelte-15kgmsr"><span class="row-label svelte-15kgmsr">Days per week</span> <span class="row-value svelte-15kgmsr">${escape_html(daysDisplay())}</span></button> <div class="divider svelte-15kgmsr"></div> <button class="row svelte-15kgmsr"><span class="row-label svelte-15kgmsr">Session duration</span> <span class="row-value svelte-15kgmsr">${escape_html(sessionDurationDisplay())}</span></button> <div class="divider svelte-15kgmsr"></div> <button class="row svelte-15kgmsr"><span class="row-label svelte-15kgmsr">Equipment</span> <span class="row-value truncate svelte-15kgmsr">${escape_html(equipmentDisplay())}</span></button> <div class="divider svelte-15kgmsr"></div> <button class="row svelte-15kgmsr"><span class="row-label svelte-15kgmsr">Goals</span> <span class="row-value truncate svelte-15kgmsr">${escape_html(goalsDisplay())}</span></button></div></div> <div class="group svelte-15kgmsr"><p class="group-label svelte-15kgmsr">Preferences</p> <div class="card svelte-15kgmsr"><button class="row svelte-15kgmsr"><span class="row-label svelte-15kgmsr">Review day</span> <span class="row-value svelte-15kgmsr">${escape_html(reviewDayDisplay())}</span></button> <div class="divider svelte-15kgmsr"></div> <div class="row static svelte-15kgmsr"><span class="row-label svelte-15kgmsr">Units</span> `);
      SegmentedToggle($$renderer3, {
        options: unitOptions,
        onchange: markChanged,
        get value() {
          return prefs.units;
        },
        set value($$value) {
          prefs.units = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div> <div class="divider svelte-15kgmsr"></div> <button class="row svelte-15kgmsr"><span class="row-label svelte-15kgmsr">Rest timer</span> <span class="row-value svelte-15kgmsr">${escape_html(restTimerDisplay())}</span></button></div></div> `);
      if (hasChanges) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<button class="save-btn svelte-15kgmsr">Save Changes</button>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
      if (saved && true) {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<p class="saved-msg svelte-15kgmsr">Saved</p>`);
      } else {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
      {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> `);
      {
        $$renderer3.push("<!--[-1-->");
      }
      $$renderer3.push(`<!--]--> <button class="logout-btn svelte-15kgmsr">Log out</button></div> `);
      BottomSheet($$renderer3, {
        title: "Gender",
        options: genderOptions,
        onchange: markChanged,
        get open() {
          return sheetOpen.gender;
        },
        set open($$value) {
          sheetOpen.gender = $$value;
          $$settled = false;
        },
        get value() {
          return data.gender;
        },
        set value($$value) {
          data.gender = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      BottomSheet($$renderer3, {
        title: "Experience Level",
        options: experienceOptions,
        onchange: markChanged,
        get open() {
          return sheetOpen.experience;
        },
        set open($$value) {
          sheetOpen.experience = $$value;
          $$settled = false;
        },
        get value() {
          return data.experienceLevel;
        },
        set value($$value) {
          data.experienceLevel = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      BottomSheet($$renderer3, {
        title: "Days per Week",
        options: daySheetOptions,
        onchange: markChanged,
        get open() {
          return sheetOpen.days;
        },
        set open($$value) {
          sheetOpen.days = $$value;
          $$settled = false;
        },
        get value() {
          return data.trainingDays;
        },
        set value($$value) {
          data.trainingDays = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      BottomSheet($$renderer3, {
        title: "Goals",
        options: goalSheetOptions,
        multiSelect: true,
        onchange: markChanged,
        get open() {
          return sheetOpen.goals;
        },
        set open($$value) {
          sheetOpen.goals = $$value;
          $$settled = false;
        },
        get values() {
          return data.goals;
        },
        set values($$value) {
          data.goals = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      BottomSheet($$renderer3, {
        title: "Injuries or Limitations",
        options: injurySheetOptions,
        values: injurySheetValues(),
        multiSelect: true,
        onchange: () => {
          if (injurySheetValues().includes("__none__") && injurySheetValues().length > 1) {
            data.injuries = injurySheetValues().filter((v) => v !== "__none__");
          } else if (injurySheetValues().includes("__none__")) {
            data.injuries = [];
          } else {
            data.injuries = injurySheetValues();
          }
          markChanged();
        },
        get open() {
          return sheetOpen.injuries;
        },
        set open($$value) {
          sheetOpen.injuries = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      BottomSheet($$renderer3, {
        title: "Review Day",
        options: reviewDaySheetOptions,
        onchange: markChanged,
        get open() {
          return sheetOpen.reviewDay;
        },
        set open($$value) {
          sheetOpen.reviewDay = $$value;
          $$settled = false;
        },
        get value() {
          return prefs.reviewDay;
        },
        set value($$value) {
          prefs.reviewDay = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      BottomSheet($$renderer3, {
        title: "Rest Timer",
        options: restTimerSheetOptions,
        onchange: markChanged,
        get open() {
          return sheetOpen.restTimer;
        },
        set open($$value) {
          sheetOpen.restTimer = $$value;
          $$settled = false;
        },
        get value() {
          return prefs.restTimerDefault;
        },
        set value($$value) {
          prefs.restTimerDefault = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      BottomSheet($$renderer3, {
        title: "Session Duration",
        options: sessionDurationSheetOptions,
        onchange: markChanged,
        get open() {
          return sheetOpen.sessionDuration;
        },
        set open($$value) {
          sheetOpen.sessionDuration = $$value;
          $$settled = false;
        },
        get value() {
          return data.sessionDuration;
        },
        set value($$value) {
          data.sessionDuration = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      BottomSheet($$renderer3, {
        title: "Equipment",
        options: equipmentSheetOptions,
        multiSelect: true,
        onchange: () => {
          if (data.equipment.includes("full_gym")) {
            data.equipment = [
              "bodyweight",
              "dumbbells",
              "barbell",
              "cable_machine",
              "full_gym"
            ];
          } else if (["bodyweight", "dumbbells", "barbell", "cable_machine"].every((e) => data.equipment.includes(e))) {
            data.equipment = [...data.equipment, "full_gym"];
          }
          markChanged();
        },
        get open() {
          return sheetOpen.equipment;
        },
        set open($$value) {
          sheetOpen.equipment = $$value;
          $$settled = false;
        },
        get values() {
          return data.equipment;
        },
        set values($$value) {
          data.equipment = $$value;
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
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
