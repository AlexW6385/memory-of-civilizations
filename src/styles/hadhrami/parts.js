// Windows, doors and the bay of the Hadhrami tower house, built once at the origin facing +z (the wall's face at z = 0) and
// placed by matrix (instanced in the viewer). Each is a list of [material, geometry].
import { box } from '../../core/geom.js';

const CACHE = {};
const W = { slit: [0.2, 0.5], small: [0.5, 0.8], big: [0.8, 1.25], white: [0.85, 1.3] };
/** A window: the dark opening, the two shutter leaves (the upper part left open), and for the larger a white lime frame and sill. */
export function windowPieces(kind) {
  if (CACHE[kind]) return CACHE[kind];
  const [w, h] = W[kind], hw = w / 2, out = [['opening', box(-hw, 0, 0, hw, h, 0.03)]];
  if (kind !== 'slit') {
    const lh = h * 0.74, g = 0.02;
    out.push(['timber', box(-hw + 0.02, 0.02, 0, -g, lh, 0.05)], ['timber', box(g, 0.02, 0, hw - 0.02, lh, 0.05)]);
  }
  if (kind === 'big' || kind === 'white') {
    const f = 0.1;
    out.push(['lime_plaster', box(-hw - f, h, 0, hw + f, h + f, 0.07)], ['lime_plaster', box(-hw - f, 0, 0, -hw, h, 0.06)], ['lime_plaster', box(hw, 0, 0, hw + f, h, 0.06)], ['lime_plaster', box(-hw - f, -0.1, 0, hw + f, 0, 0.1)]);
  } else if (kind === 'small') out.push(['timber', box(-hw - 0.05, h, 0, hw + 0.05, h + 0.07, 0.06)]);
  return (CACHE[kind] = out);
}
/** The street door: a carved leaf of cedar between lime jambs under a timber lintel, a stone step. */
export function doorPieces() {
  return (CACHE.door ??= [
    ['cedar', box(-0.5, 0, 0, 0.5, 1.9, 0.07)], ['wood_dark', box(-0.04, 0.9, 0.06, 0.04, 1.0, 0.1)],
    ['lime_plaster', box(-0.68, 0, 0, -0.5, 2.1, 0.1)], ['lime_plaster', box(0.5, 0, 0, 0.68, 2.1, 0.1)], ['lime_plaster', box(-0.68, 1.9, 0, 0.68, 2.1, 0.1)],
    ['timber', box(-0.78, 2.1, 0, 0.78, 2.22, 0.14)],
    ['schist_rubble', box(-0.85, 0, 0, 0.85, 0.2, 0.55)], ['schist_rubble', box(-0.75, 0, 0.55, 0.75, 0.1, 0.8)],
  ]);
}
/** A bay of carved timber (a mashrabiya) standing out from an upper wall, its roof limewashed. */
export function bayPieces() {
  return (CACHE.bay ??= [
    ['wood_dark', box(-0.85, 0, 0, 0.85, 1.5, 0.5)], ['timber', box(-0.8, 0.1, 0.5, 0.8, 1.35, 0.56)],
    ['opening', box(-0.7, 0.35, 0.56, -0.05, 1.15, 0.58)], ['opening', box(0.05, 0.35, 0.56, 0.7, 1.15, 0.58)],
    ['lime_plaster', box(-0.95, 1.5, -0.02, 0.95, 1.62, 0.62)],
  ]);
}
