import { a as attr, e as escape_html } from "./attributes.js";
function PhotoUpload($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { onupload } = $$props;
    let uploading = false;
    $$renderer2.push(`<button class="upload-btn svelte-1ijispd"${attr("disabled", uploading, true)}>${escape_html("+ Add")}</button> <input type="file" accept="image/*" capture="environment" hidden=""/>`);
  });
}
export {
  PhotoUpload as P
};
