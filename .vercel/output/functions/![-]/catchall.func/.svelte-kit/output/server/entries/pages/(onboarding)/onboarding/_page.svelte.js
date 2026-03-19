import { e as ensure_array_like, c as attr_class, i as bind_props, d as derived } from "../../../../chunks/index.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/root.js";
import "../../../../chunks/state.svelte.js";
import "../../../../chunks/supabase.js";
import { e as escape_html, a as attr } from "../../../../chunks/attributes.js";
function ProgressBar($$renderer, $$props) {
  let { currentStep, totalSteps } = $$props;
  $$renderer.push(`<div class="progress svelte-1peoe4i"><!--[-->`);
  const each_array = ensure_array_like(Array(totalSteps));
  for (let i = 0, $$length = each_array.length; i < $$length; i++) {
    each_array[i];
    $$renderer.push(`<div${attr_class("dot svelte-1peoe4i", void 0, { "active": i <= currentStep })}></div>`);
  }
  $$renderer.push(`<!--]--></div>`);
}
function SelectionCard($$renderer, $$props) {
  let { label, subtitle = "", selected = false } = $$props;
  $$renderer.push(`<button${attr_class("card svelte-4raz56", void 0, { "selected": selected })}><span class="label svelte-4raz56">${escape_html(label)}</span> `);
  if (subtitle) {
    $$renderer.push("<!--[0-->");
    $$renderer.push(`<span class="subtitle svelte-4raz56">${escape_html(subtitle)}</span>`);
  } else {
    $$renderer.push("<!--[-1-->");
  }
  $$renderer.push(`<!--]--></button>`);
}
function StepExperience($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { value = void 0 } = $$props;
    const options = [
      {
        level: "beginner",
        label: "Beginner",
        subtitle: "Learning the basics and building form"
      },
      {
        level: "intermediate",
        label: "Intermediate",
        subtitle: "Confident with compound lifts"
      },
      {
        level: "advanced",
        label: "Advanced",
        subtitle: "Strong foundation, ready for heavier loads"
      }
    ];
    $$renderer2.push(`<div class="step svelte-uxgvks"><h2 class="svelte-uxgvks">What's your experience level?</h2> <div class="options svelte-uxgvks"><!--[-->`);
    const each_array = ensure_array_like(options);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let opt = each_array[$$index];
      SelectionCard($$renderer2, {
        label: opt.label,
        subtitle: opt.subtitle,
        selected: value === opt.level
      });
    }
    $$renderer2.push(`<!--]--></div></div>`);
    bind_props($$props, { value });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let currentStep = 0;
    let data = {
      experienceLevel: null
    };
    const TOTAL_STEPS = 7;
    let canContinue = derived(
      () => data.experienceLevel !== null
    );
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="onboarding svelte-8xercz"><div class="header svelte-8xercz"><h1 class="logo svelte-8xercz">Push</h1> `);
      {
        $$renderer3.push("<!--[0-->");
        ProgressBar($$renderer3, { currentStep, totalSteps: TOTAL_STEPS });
      }
      $$renderer3.push(`<!--]--></div> <div class="content svelte-8xercz"><!---->`);
      {
        {
          $$renderer3.push("<!--[0-->");
          StepExperience($$renderer3, {
            get value() {
              return data.experienceLevel;
            },
            set value($$value) {
              data.experienceLevel = $$value;
              $$settled = false;
            }
          });
        }
        $$renderer3.push(`<!--]-->`);
      }
      $$renderer3.push(`<!----></div> `);
      {
        $$renderer3.push("<!--[0-->");
        $$renderer3.push(`<div class="actions svelte-8xercz">`);
        {
          $$renderer3.push("<!--[-1-->");
          $$renderer3.push(`<div></div>`);
        }
        $$renderer3.push(`<!--]--> <button class="continue-btn svelte-8xercz"${attr("disabled", !canContinue(), true)}>Continue</button></div>`);
      }
      $$renderer3.push(`<!--]--></div>`);
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
