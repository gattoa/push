import * as server from '../entries/pages/(app)/_layout.server.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/(app)/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/(app)/+layout.server.ts";
export const imports = ["_app/immutable/nodes/2.CrN77r0d.js","_app/immutable/chunks/B34NZ5Dp.js","_app/immutable/chunks/Dd9TBFBo.js","_app/immutable/chunks/-7OWRX3Q.js","_app/immutable/chunks/Bkk7hIHX.js","_app/immutable/chunks/Cn3dNWBj.js","_app/immutable/chunks/C_J2X-DK.js","_app/immutable/chunks/lrOjgZbK.js","_app/immutable/chunks/Cy-8xKM-.js","_app/immutable/chunks/vDBZjSmK.js","_app/immutable/chunks/k5HjOmxm.js","_app/immutable/chunks/C1-MU8a-.js","_app/immutable/chunks/DXT2tt3k.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/chunks/BVg2IIBS.js","_app/immutable/chunks/msCLaqp_.js"];
export const stylesheets = ["_app/immutable/assets/2._A3eTzfQ.css"];
export const fonts = [];
