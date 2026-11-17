// Windows, doors and the bay of the Hadhrami tower house, built once at the origin facing +z (the wall's face at z = 0) and
// placed by matrix (instanced in the viewer). Each is a list of [material, geometry].
import { box, quad, fromTriangles, lathe, rod, orientOutward } from '../../core/geom.js';
/** A flat rectangle facing +z at depth z, from (xa, ya) to (xb, yb): two triangles. */
export const fq = (xa, ya, xb, yb, z) => { const o = []; quad(o, [xb, ya, z], [xb, yb, z], [xa, yb, z], [xa, ya, z]); return fromTriangles(o); };

const CACHE = {};
const W = { slit: [0.2, 0.5], small: [0.5, 0.8], big: [0.8, 1.25], white: [0.85, 1.3] };
/**
 * A window of the town, built facing +z with its sill at y = 0 (the wall's face at z = 0), the parts standing out of the wall as the lime
 * (nurah) frames of the real houses do: the dark opening; for the larger a frame of three lime boards with a sill that projects and a stepped
 * hood over the lintel, the lower part closed by two carved leaves with raised panels, the upper part a lattice of spindles (shade and privacy,
 * docs/settlements/shibam.md §12); the small ones a timber frame, two plain leaves and a lintel beam; the slit a sill and a lintel. Instanced.
 */
export function windowPieces(kind) {
  if (CACHE[kind]) return CACHE[kind];
  const [w, h] = W[kind], hw = w / 2, out = [['opening', fq(-hw, 0, hw, h, 0.03)]];
  if (kind === 'slit') {
    out.push(['lime_plaster', box(-hw - 0.05, -0.05, 0, hw + 0.05, 0, 0.1)], ['timber', box(-hw - 0.06, h, 0, hw + 0.06, h + 0.07, 0.1)]);
  } else if (kind === 'small') {
    const lh = h * 0.78;
    out.push(['timber', box(-hw - 0.06, 0, 0, -hw, h, 0.09)], ['timber', box(hw, 0, 0, hw + 0.06, h, 0.09)], ['timber', box(-hw - 0.1, h, 0, hw + 0.1, h + 0.08, 0.12)]);
    out.push(['lime_plaster', box(-hw - 0.1, -0.06, 0, hw + 0.1, 0, 0.14)]);
    out.push(['timber', box(-hw + 0.005, 0.02, 0.04, -0.01, lh, 0.065)], ['timber', box(0.01, 0.02, 0.04, hw - 0.005, lh, 0.065)]);
    out.push(['wood_dark', fq(-hw + 0.05, 0.1, -0.06, lh - 0.08, 0.068)], ['wood_dark', fq(0.06, 0.1, hw - 0.05, lh - 0.08, 0.068)]);
    for (const x of [-hw * 0.5, 0, hw * 0.5]) out.push(['wood_dark', fq(x - 0.012, lh, x + 0.012, h - 0.02, 0.045)]);
  } else {
    const lh = h * 0.66, f = 0.11;
    // frame (jambs and lintel board) and the sill that projects, the stepped hood over them
    out.push(['lime_plaster', box(-hw - f, 0, 0, -hw, h, 0.12)], ['lime_plaster', box(hw, 0, 0, hw + f, h, 0.12)], ['lime_plaster', box(-hw - f, h, 0, hw + f, h + 0.1, 0.12)]);
    out.push(['lime_plaster', box(-hw - f - 0.04, -0.08, 0, hw + f + 0.04, 0, 0.2)]);
    out.push(['lime_plaster', box(-hw - f - 0.08, h + 0.1, 0, hw + f + 0.08, h + 0.16, 0.16)], ['lime_plaster', box(-hw - 0.02, h + 0.16, 0, hw + 0.02, h + 0.21, 0.11)]);
    // the two carved leaves with their raised panels, and the rail between leaves and lattice
    out.push(['cedar', box(-hw + 0.005, 0.02, 0.04, -0.012, lh, 0.075)], ['cedar', box(0.012, 0.02, 0.04, hw - 0.005, lh, 0.075)]);
    for (const [a, b] of [[-hw + 0.06, -0.07], [0.07, hw - 0.06]]) out.push(['wood_dark', fq(a, 0.08, b, lh * 0.46, 0.078)], ['wood_dark', fq(a, lh * 0.54, b, lh - 0.07, 0.078)]);
    out.push(['wood_dark', box(-hw, lh, 0.04, hw, lh + 0.045, 0.08)]);
    // the lattice: turned spindles between the rail and the frame, seen against the dark
    const n = kind === 'white' ? 6 : 5;
    for (let i = 1; i <= n; i++) { const x = -hw + (w * i) / (n + 1); out.push(['wood_dark', box(x - 0.014, lh + 0.045, 0.04, x + 0.014, h - 0.01, 0.07)]); }
  }
  return (CACHE[kind] = out);
}
/** The carved board over a door's lintel and the lime hood above it, in one of four patterns (docs/settlements/shibam.md §12): a row of dentils, a row of lozenge bars, three rosettes, a row of tall bars between two rails. */
function lintelCarving(v) {
  const o = [['cedar', box(-0.72, 2.22, 0, 0.72, 2.42, 0.09)], ['lime_plaster', box(-0.86, 2.42, 0, 0.86, 2.49, 0.17)], ['lime_plaster', box(-0.76, 2.49, 0, 0.76, 2.55, 0.12)]];
  if (v === 0) for (let i = 0; i < 7; i++) o.push(['wood_dark', box(-0.63 + i * 0.2, 2.26, 0.09, -0.53 + i * 0.2, 2.38, 0.115)]);
  else if (v === 1) for (let i = 0; i < 6; i++) o.push(['wood_dark', box(-0.6 + i * 0.24, i % 2 ? 2.25 : 2.3, 0.09, -0.52 + i * 0.24, i % 2 ? 2.39 : 2.34, 0.11)]);
  else if (v === 2) for (const x of [-0.42, 0, 0.42]) o.push(['bronze', lathe([[0.001, 0], [0.09, 0], [0.09, 0.02], [0.05, 0.035], [0.001, 0.04]], 8).rotateX(Math.PI / 2).translate(x, 2.32, 0.09)]);
  else { o.push(['wood_dark', box(-0.68, 2.25, 0.09, 0.68, 2.27, 0.105)], ['wood_dark', box(-0.68, 2.37, 0.09, 0.68, 2.39, 0.105)]); for (let i = 0; i < 9; i++) o.push(['wood_dark', box(-0.6 + i * 0.15, 2.27, 0.09, -0.57 + i * 0.15, 2.37, 0.105)]); }
  return o;
}
/** The chunky wooden lock of the leaf: a case with its sliding bolt and a key-plate (carved wooden locks are a mark of the Hadhrami doors [stated: Koryo Group]), on the leaf's face. */
const lockCase = (x) => [['wood_dark', box(x, 0.82, 0.07, x + 0.3, 1.0, 0.13)], ['wood_dark', box(x - 0.12, 0.89, 0.07, x + 0.42, 0.93, 0.1)], ['iron', box(x + 0.12, 0.88, 0.13, x + 0.16, 0.95, 0.14)]];
/** The street door: a carved leaf of cedar between lime jambs under a timber lintel with its carved board and hood, a stone step. */
export function doorPieces() {
  return (CACHE.door ??= [
    ['cedar', box(-0.5, 0, 0, 0.5, 1.9, 0.07)], ...lockCase(0.12),
    ['wood_dark', box(-0.42, 0.1, 0.07, -0.05, 0.9, 0.09)], ['wood_dark', box(0.05, 0.1, 0.07, 0.42, 0.7, 0.09)], ['wood_dark', box(-0.42, 1.05, 0.07, -0.05, 1.8, 0.09)], ['wood_dark', box(0.05, 1.05, 0.07, 0.42, 1.8, 0.09)],
    ['lime_plaster', box(-0.68, 0, 0, -0.5, 2.1, 0.1)], ['lime_plaster', box(0.5, 0, 0, 0.68, 2.1, 0.1)], ['lime_plaster', box(-0.68, 1.9, 0, 0.68, 2.1, 0.1)],
    ['timber', box(-0.78, 2.1, 0, 0.78, 2.22, 0.14)], ...lintelCarving(0),
    ['schist_rubble', box(-0.85, 0, 0, 0.85, 0.2, 0.55)], ['schist_rubble', box(-0.75, 0, 0.55, 0.75, 0.1, 0.8)],
  ]);
}
/** A bay of carved timber (a mashrabiya) standing out from an upper wall on three palm-trunk corbels, its two lattice panels of spindles in a frame, a limewashed roof with a drip. */
export function bayPieces() {
  if (CACHE.bay) return CACHE.bay;
  const o = [['wood_dark', box(-0.85, 0.08, 0, 0.85, 1.5, 0.5)], ['timber', box(-0.8, 0.1, 0.5, 0.8, 1.35, 0.56)], ['wood_dark', box(-0.84, 1.35, 0.5, 0.84, 1.42, 0.6)], ['wood_dark', box(-0.84, 0.1, 0.5, 0.84, 0.17, 0.6)]];
  for (const [x0, x1] of [[-0.74, -0.04], [0.04, 0.74]]) {
    o.push(['opening', box(x0, 0.2, 0.56, x1, 1.3, 0.575)]);
    for (let i = 0; i <= 7; i++) { const x = x0 + ((x1 - x0) * i) / 7; o.push(['cedar', box(x - 0.013, 0.2, 0.575, x + 0.013, 1.3, 0.6)]); }
    o.push(['cedar', box(x0, 0.74, 0.575, x1, 0.78, 0.6)]);
  }
  o.push(['wood_dark', box(-0.03, 0.17, 0.56, 0.03, 1.35, 0.62)]);
  for (const x of [-0.7, 0, 0.7]) o.push(['palm_trunk', rod([x, 0.1, 0.1], [x, -0.12, 0.62], 0.06, 6)]);
  o.push(['lime_plaster', box(-0.95, 1.5, -0.02, 0.95, 1.62, 0.66)], ['lime_plaster', box(-0.88, 1.62, 0.02, 0.88, 1.68, 0.6)]);
  return (CACHE.bay = o);
}

/** A little view port through the parapet (a square opening in the roof's wall, a lime sill and lintel) from which the women of the house watch the street unseen [stated: Architectural League]. */
export function viewPortPieces() {
  return (CACHE.viewport ??= [['opening', fq(-0.1, 0, 0.1, 0.22, 0.012)], ['lime_plaster', box(-0.15, -0.04, 0, 0.15, 0, 0.07)], ['lime_plaster', box(-0.15, 0.22, 0, 0.15, 0.27, 0.06)], ['lime_plaster', box(-0.15, 0, 0, -0.1, 0.22, 0.04)], ['lime_plaster', box(0.1, 0, 0, 0.15, 0.22, 0.04)]]);
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
    o.push(['iron', box(0.3, 0.9, 0.075, 0.42, 0.96, 0.1)]);
  } else {
    o.push(['cedar', box(-0.5, 0, 0, 0.5, 1.9, 0.07)]);
    for (const [x0, x1] of [[-0.4, -0.05], [0.05, 0.4]]) for (const [y0, y1] of [[0.12, 0.8], [1.0, 1.78]]) o.push(['wood_dark', box(x0, y0, 0.07, x1, y1, 0.095)], ['cedar', box(x0 + 0.05, y0 + 0.05, 0.095, x1 - 0.05, y1 - 0.05, 0.105)]);
    o.push(['bronze', box(-0.03, 0.95, 0.07, 0.03, 1.05, 0.13)], ...lockCase(0.12));
  }
  o.push(...lintelCarving(v));
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
