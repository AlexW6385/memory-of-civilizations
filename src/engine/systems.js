// Living additions to a settlement drawn and moved by the engine (boats and walkers, birds and fish,
// smoke...): each a system registered here, by its own module listed in systems-list.js.
//
// A system: {
//   attach(site, world)    once the settlement is built (site.state 'ready'): add its meshes to
//                          site.group (the settlement's frame: x east, y up, z south, metres) — the
//                          group is hidden with the settlement — and precompile them
//                          (world.r.precompile(list)) before they show;
//   detach(site, world)    when the settlement is let go of: dispose of what attach made;
//   update(dt, camera, world)  each frame (dt in s): move what it moves; for each site it attached
//                          to (site.state === 'ready' && site.group.visible), cheaply.
// }
// Budgets (DESIGN §8): a few draw calls each, under ~0.3 ms of this thread a frame, nothing
// allocated each frame, motion on the GPU where it can be.

export const SYSTEMS = [];

/** Register a system (called by its module when imported, from systems-list.js). */
export function registerSystem(s) { SYSTEMS.push(s); return s; }
