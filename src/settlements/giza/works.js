// Giza — the finishing works on the plateau's edge, north-east of the mortuary temple (docs/settlements/giza.md §13): the ramp of rubble
// and mud by which the casing stones were hauled up, half taken down, with the sleeper road that brings the sledges to its foot. Pure data
// (the arrival looks at it); positions in the settlement's frame, on the level plateau.
export const RAMP = { x0: 184, x1: 222, z: -64, w: 7, h: 4.8, sledge: 204 };
/** The ramp's top above the plateau at x. */
RAMP.heightAt = (x) => Math.max(0, Math.min(RAMP.h, RAMP.h * (RAMP.x1 - x) / (RAMP.x1 - RAMP.x0)));
/** The sleeper road from the causeway's plateau end to the ramp's foot: [[x, y, z]]. */
export function haulRoad() { return [[262, 0.02, -46], [248, 0.02, -54], [236, 0.02, -60], [228, 0.02, -64]]; }
