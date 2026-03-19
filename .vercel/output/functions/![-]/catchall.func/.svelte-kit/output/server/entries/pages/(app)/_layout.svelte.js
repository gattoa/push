import { a as store_get, b as unsubscribe_stores } from "../../../chunks/index.js";
import { p as page } from "../../../chunks/stores.js";
import { a as attr } from "../../../chunks/attributes.js";
import "../../../chunks/supabase.js";
function Navigation($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let currentPath;
    currentPath = store_get($$store_subs ??= {}, "$page", page).url.pathname;
    $$renderer2.push(`<nav class="svelte-ocbj1u"><a href="/plan" class="nav-icon svelte-ocbj1u"${attr("aria-current", currentPath === "/plan" ? "page" : void 0)} aria-label="Plan"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svelte-ocbj1u"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></a> <a href="/" class="nav-date svelte-ocbj1u"${attr("aria-current", currentPath === "/" ? "page" : void 0)}>Today</a> <a href="/profile" class="nav-icon svelte-ocbj1u"${attr("aria-current", currentPath === "/profile" ? "page" : void 0)} aria-label="Profile"><span class="nav-avatar svelte-ocbj1u">P</span></a></nav>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function _layout($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { children } = $$props;
    Navigation($$renderer2);
    $$renderer2.push(`<!----> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]-->`);
  });
}
export {
  _layout as default
};
