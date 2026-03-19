import * as server from '../entries/pages/(app)/exercise/_id_/_page.server.ts.js';

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/(app)/exercise/_id_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/(app)/exercise/[id]/+page.server.ts";
export const imports = ["_app/immutable/nodes/4.GJsqjHue.js","_app/immutable/chunks/B34NZ5Dp.js","_app/immutable/chunks/Dd9TBFBo.js","_app/immutable/chunks/-7OWRX3Q.js","_app/immutable/chunks/CUaEtDQv.js","_app/immutable/chunks/Bkk7hIHX.js","_app/immutable/chunks/Cn3dNWBj.js","_app/immutable/chunks/C_J2X-DK.js","_app/immutable/chunks/eg4NF_oW.js","_app/immutable/chunks/vDBZjSmK.js","_app/immutable/chunks/DXT2tt3k.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/chunks/BVg2IIBS.js","_app/immutable/chunks/msCLaqp_.js","_app/immutable/chunks/GwsjP7xp.js","_app/immutable/chunks/DwH7-tUW.js","_app/immutable/chunks/CVwYl1wl.js","_app/immutable/chunks/Cf_9Uhhy.js"];
export const stylesheets = ["_app/immutable/assets/4.D1UbmdRm.css"];
export const fonts = [];
