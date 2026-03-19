import { e as ensure_array_like, d as derived, a as store_get, b as unsubscribe_stores } from "../../../../chunks/index.js";
import { a as attr, e as escape_html } from "../../../../chunks/attributes.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/root.js";
import "../../../../chunks/state.svelte.js";
import { p as page } from "../../../../chunks/stores.js";
import "../../../../chunks/supabase.js";
/* empty css                                                           */
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const session = derived(() => store_get($$store_subs ??= {}, "$page", page).data.session);
    const userEmail = derived(() => session()?.user?.email ?? "");
    const userName = derived(() => session()?.user?.user_metadata?.full_name ?? "Push Athlete");
    const avatarUrl = derived(() => session()?.user?.user_metadata?.avatar_url ?? "");
    let data = {
      goals: []
    };
    const avatarInitial = derived(() => userEmail() ? userEmail()[0].toUpperCase() : "P");
    const goalLabels = {
      build_muscle: "Build Muscle",
      lose_fat: "Lose Fat",
      get_stronger: "Get Stronger",
      general_fitness: "General Fitness"
    };
    let experienceDisplay = derived(() => "");
    $$renderer2.push(`<div class="profile svelte-b6jup3"><div class="profile-header svelte-b6jup3"><button class="avatar-btn svelte-b6jup3">`);
    if (avatarUrl()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<img class="avatar-img svelte-b6jup3"${attr("src", avatarUrl())} alt=""/>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="avatar svelte-b6jup3"><span class="avatar-initial svelte-b6jup3">${escape_html(avatarInitial())}</span></div>`);
    }
    $$renderer2.push(`<!--]--></button> <h1 class="svelte-b6jup3">${escape_html(userName())}</h1> `);
    if (userEmail()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p class="subtitle svelte-b6jup3">${escape_html(userEmail())}</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (experienceDisplay() || data.goals.length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="identity-chips svelte-b6jup3">`);
      if (experienceDisplay()) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span class="chip svelte-b6jup3">${escape_html(experienceDisplay())}</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <!--[-->`);
      const each_array = ensure_array_like(data.goals);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let g = each_array[$$index];
        $$renderer2.push(`<span class="chip svelte-b6jup3">${escape_html(goalLabels[g])}</span>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <button class="history-link svelte-b6jup3"><span>Training History</span> <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg></button></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
