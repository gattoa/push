import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/nodes/0.ISAvJj7v.js","_app/immutable/chunks/B34NZ5Dp.js","_app/immutable/chunks/Dd9TBFBo.js","_app/immutable/chunks/-7OWRX3Q.js","_app/immutable/chunks/lrOjgZbK.js","_app/immutable/chunks/C_J2X-DK.js","_app/immutable/chunks/C1-MU8a-.js","_app/immutable/chunks/Cn3dNWBj.js","_app/immutable/chunks/msCLaqp_.js"];
export const stylesheets = [];
export const fonts = [];
