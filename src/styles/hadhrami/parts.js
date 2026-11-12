// Windows, doors and the bay of the Hadhrami tower house, built once at the origin facing +z (the wall's face at z = 0) and
// placed by matrix (instanced in the viewer). Each is a list of [material, geometry].
import { box, quad, fromTriangles, lathe, rod, orientOutward } from '../../core/geom.js';
/** A flat rectangle facing +z at depth z, from (xa, ya) to (xb, yb): two triangles. */
export const fq = (xa, ya, xb, yb, z) => { const o = []; quad(o, [xb, ya, z], [xb, yb, z], [xa, yb, z], [xa, ya, z]); return fromTriangles(o); };

const CACHE = {};
const W = { slit: [0.2, 0.5], small: [0.5, 0.8], big: [0.8, 1.25], white: [0.85, 1.3] };
/** A window: the dark opening, the two shutter leaves (the upper part left open), and for the larger a white lime frame and sill — flat quads at slightly different depths (14 triangles). */
export function windowPieces(kind) {
  if (CACHE[kind]) return CACHE[kind];
  const [w, h] = W[kind], hw = w / 2, out = [['opening', fq(-hw, 0, hw, h, 0.03)]];
  if (kind !== 'slit') {
    const lh = h * 0.74, g = 0.02;
    out.push(['timber', fq(-hw + 0.02, 0.02, -g, lh, 0.05)], ['timber', fq(g, 0.02, hw - 0.02, lh, 0.05)]);
  }
  if (kind === 'big' || kind === 'white') {
    const f = 0.1;
    out.push(['lime_plaster', fq(-hw - f, h, hw + f, h + f, 0.07)], ['lime_plaster', fq(-hw - f, 0, -hw, h, 0.06)], ['lime_plaster', fq(hw, 0, hw + f, h, 0.06)], ['lime_plaster', fq(-hw - f, -0.1, hw + f, 0, 0.1)]);
  } else if (kind === 'small') out.push(['timber', fq(-hw - 0.05, h, hw + 0.05, h + 0.07, 0.06)]);
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

/** A convex wedge or slab from eight corners: front (+z) and back (−z) edges at their own heights: x0..x1, the back at (zb, yb0..yb1), the front at (zf, yf0..yf1). */
export function wedge(x0, x1, zb, yb0, yb1, zf, yf0, yf1) {
  const c = [[x0, yb0, zb], [x1, yb0, zb], [x1, yb1, zb], [x0, yb1, zb], [x0, yf0, zf], [x1, yf0, zf], [x1, yf1, zf], [x0, yf1, zf]], out = [];
  for (const [a, b, d, e] of [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [3, 2, 6, 7], [0, 3, 7, 4], [1, 2, 6, 5]]) quad(out, c[a], c[b], c[d], c[e]);
  return fromTriangles(orientOutward(out));
}
/** The rain-and-lime streak under a sill or a spout: a tapering light stain down the plaster (len m). */
export function streakPieces(len) {
  const k = 'streak' + len;
  return (CACHE[k] ??= [['plaster_streak', fq(-0.12, -len, 0.12, 0, 0.034)], ['plaster_streak', fq(-0.05, -len * 1.3, 0.05, -len * 0.7, 0.036)]]);
}
/** A patch where the plaster has fallen and the courses of mudbrick show (variant 0..3), at the wall's foot; a darker rim of damp round the lower one. */
export function patchPieces(v) {
  const W = [[0.9, 0.6], [0.55, 0.8], [1.3, 0.45], [0.7, 0.55]][v & 3], k = 'patch' + (v & 3);
  return (CACHE[k] ??= [['mudbrick', box(-W[0] / 2, 0, 0, W[0] / 2, W[1], 0.02)], ['plaster_damp', fq(-W[0] / 2 - 0.12, -0.12, W[0] / 2 + 0.12, 0, 0.018)]]);
}
/** The mastaba: the low bench of mud and lime along the foot of the wall at the door, where the men sit (len m). */
export function benchPieces(len) {
  const k = 'bench' + len;
  return (CACHE[k] ??= [['mud_plaster', box(-len / 2, 0, 0, len / 2, 0.4, 0.42)], ['lime_plaster', box(-len / 2 - 0.03, 0.4, -0.01, len / 2 + 0.03, 0.45, 0.46)], ['schist_rubble', box(-len / 2, 0, 0.42, len / 2, 0.1, 0.5)]]);
}
const JARS = {
  zir: [[0.001, 0], [0.16, 0.02], [0.3, 0.2], [0.34, 0.42], [0.26, 0.72], [0.13, 0.88], [0.15, 0.94], [0.001, 0.92]],
  pot: [[0.001, 0], [0.1, 0.02], [0.2, 0.12], [0.23, 0.24], [0.19, 0.36], [0.12, 0.42], [0.125, 0.47], [0.001, 0.46]],
  gharra: [[0.001, 0], [0.09, 0.02], [0.17, 0.14], [0.19, 0.3], [0.12, 0.48], [0.07, 0.56], [0.09, 0.62], [0.001, 0.6]],
};
/** A jar of the street (a water jar on its ring of rubble, a gharra, a pot) standing on the ground, made once. */
export function jarGeom(kind, s = 1) {
  const k = 'jar' + kind + s;
  return (CACHE[k] ??= lathe(JARS[kind].map(([r, h]) => [r * s, h * s]), 9));
}
/** A water jar on a base of stones, with a lid of a flat stone: placed at the door of a house. */
export function jarPieces(kind) {
  const k = 'jarp' + kind;
  return (CACHE[k] ??= [[kind === 'pot' ? 'pottery_dark' : 'terracotta', jarGeom(kind, kind === 'zir' ? 1.0 : 1.2)], ['schist_rubble', box(-0.28, 0, -0.28, 0.28, 0.1, 0.28)]]);
}
/** A little niche in the wall beside the door with an oil lamp (glass) in it, a lime frame. */
export function nichePieces() {
  return (CACHE.niche ??= [['opening', fq(-0.15, 0, 0.15, 0.38, 0.03)], ['lime_plaster', fq(-0.2, 0.38, 0.2, 0.46, 0.05)], ['lime_plaster', fq(-0.2, -0.08, 0.2, 0, 0.05)], ['lamp_glass', box(-0.05, 0.02, 0.02, 0.05, 0.14, 0.1)]]);
}
/** A spout of palm trunk standing out of the parapet to throw the roof's water clear of the wall, leaning down (out along +z). */
export function spoutPieces() {
  return (CACHE.spout ??= [['palm_trunk', rod([0, 0.08, -0.1], [0, -0.14, 0.95], 0.065, 6)], ['wood_dark', box(-0.08, -0.22, 0.82, 0.08, -0.06, 0.98)]]);
}
/** A door of the street in one of four fashions: (0) the carved cedar leaf of the first, (1) a double leaf with iron studs, (2) a plank leaf under a lime arch's lintel, (3) a leaf with carved panels and a half door's bar. */
export function doorVariant(v) {
  if (v === 0) return doorPieces();
  const k = 'door' + v;
  if (CACHE[k]) return CACHE[k];
  const o = [['lime_plaster', box(-0.68, 0, 0, -0.5, 2.1, 0.1)], ['lime_plaster', box(0.5, 0, 0, 0.68, 2.1, 0.1)], ['lime_plaster', box(-0.68, 1.9, 0, 0.68, 2.1, 0.1)], ['timber', box(-0.78, 2.1, 0, 0.78, 2.22, 0.14)], ['schist_rubble', box(-0.85, 0, 0, 0.85, 0.2, 0.55)], ['schist_rubble', box(-0.75, 0, 0.55, 0.75, 0.1, 0.8)]];
  if (v === 1) {
    o.push(['cedar', box(-0.5, 0, 0, -0.01, 1.9, 0.07)], ['cedar', box(0.01, 0, 0, 0.5, 1.9, 0.07)]);
    for (const x of [-0.38, -0.2, 0.2, 0.38]) for (const y of [0.35, 0.8, 1.25, 1.7]) o.push(['iron', box(x - 0.025, y - 0.025, 0.07, x + 0.025, y + 0.025, 0.09)]);
    o.push(['wood_dark', box(0.08, 0.9, 0.07, 0.16, 1.0, 0.11)], ['wood_dark', box(-0.16, 0.9, 0.07, -0.08, 1.0, 0.11)]);
  } else if (v === 2) {
    o.push(['wood_dark', box(-0.5, 0, 0, 0.5, 1.9, 0.06)]);
    for (let b = 1; b < 6; b++) o.push(['timber', box(-0.5 + b * 0.1667 - 0.01, 0.02, 0.06, -0.5 + b * 0.1667 + 0.01, 1.88, 0.075)]);
    o.push(['iron', box(0.3, 0.9, 0.075, 0.42, 0.96, 0.1)], ['lime_plaster', box(-0.55, 2.2, 0, 0.55, 2.3, 0.12)], ['lime_plaster', box(-0.4, 2.3, 0, 0.4, 2.38, 0.1)]);
  } else {
    o.push(['cedar', box(-0.5, 0, 0, 0.5, 1.9, 0.07)]);
    for (const [x0, x1] of [[-0.4, -0.05], [0.05, 0.4]]) for (const [y0, y1] of [[0.12, 0.8], [1.0, 1.78]]) o.push(['wood_dark', box(x0, y0, 0.07, x1, y1, 0.095)], ['cedar', box(x0 + 0.05, y0 + 0.05, 0.095, x1 - 0.05, y1 - 0.05, 0.105)]);
    o.push(['bronze', box(-0.03, 0.95, 0.07, 0.03, 1.05, 0.13)]);
  }
  return (CACHE[k] = o);
}
/** The open front of a shop (width w): lime jambs and a timber lintel, the leaves of plank shutters folded to one side, the threshold, a canopy of palm mats on two poles out over the street. */
export function shopFront(w, awning = 'reed_mat') {
  const k = 'shopfront' + w + awning;
  if (CACHE[k]) return CACHE[k];
  const hw = w / 2, H = 2.35;
  const o = [['lime_plaster', box(-hw - 0.24, 0, 0, -hw, H + 0.1, 0.12)], ['lime_plaster', box(hw, 0, 0, hw + 0.24, H + 0.1, 0.12)], ['lime_plaster', box(-hw - 0.24, H, 0, hw + 0.24, H + 0.25, 0.12)],
    ['timber', box(-hw - 0.3, H + 0.25, 0, hw + 0.3, H + 0.37, 0.16)], ['schist_rubble', box(-hw - 0.2, 0, 0, hw + 0.2, 0.1, 0.6)],
    ['cedar', box(hw - 0.5, 0.1, 0.1, hw - 0.04, H - 0.05, 0.2)], ['wood_dark', box(hw - 0.5, 0.1, 0.2, hw - 0.04, H - 0.05, 0.215)]];
  for (let b = 1; b < 5; b++) o.push(['timber', box(hw - 0.5 + b * 0.09 - 0.008, 0.12, 0.215, hw - 0.5 + b * 0.09 + 0.008, H - 0.07, 0.225)]);
  // the canopy: a sloped mat on a pole at each end of the front, tied to the lintel
  o.push([awning, wedge(-hw - 0.4, hw + 0.4, 0.05, H + 0.4, H + 0.46, 1.55, H - 0.05, H + 0.01)]);
  for (const x of [-hw - 0.3, hw + 0.3]) o.push(['palm_trunk', rod([x, 0, 1.45], [x, H - 0.02, 1.45], 0.06, 6)]);
  o.push(['palm_trunk', rod([-hw - 0.38, H - 0.05, 1.5], [hw + 0.38, H - 0.05, 1.5], 0.04, 5)]);
  return (CACHE[k] = o);
}
