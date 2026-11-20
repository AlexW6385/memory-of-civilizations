// The ration stall of the king's works (docs/settlements/giza.md §19): where the gangs drew their bread and beer. The workforce was fed
// from the king's grain, "distributed to create the beer and bread used to help feed this massive workforce" [AERA]; ours is a counter
// of plastered mudbrick under a shade of reed mats, the heaps of flat loaves and the conical loaves turned out of the bread pots, the
// tall beer jars stoppered with mud in their ring stands, a row of drinking bowls, sacks of grain behind, the keeper's stool.
// ok_ration { at: [x, z], y, rot, seed }: the counter lies along the frame's u (3.4 m), customers stand at v > 0 (rot 0: customers to the south).

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const BEER = [[0.04, 0], [0.12, 0.08], [0.17, 0.35], [0.14, 0.62], [0.07, 0.72], [0.08, 0.76], [0.001, 0.76]];
const LOAF = [[0.001, 0], [0.075, 0], [0.07, 0.07], [0.045, 0.14], [0.001, 0.17]];

/** The world place of a point (u, v) of the stall's frame. */
export function stallPoint(el, u, v) { const c = Math.cos(el.rot || 0), s = Math.sin(el.rot || 0); return [el.at[0] + c * u - s * v, el.at[1] + s * u + c * v]; }

export function rationStall(el, { bag, col }) {
  const [x, z] = el.at, y0 = el.y ?? 0, rot = el.rot || 0, rand = rng((el.seed || 1) * 7 + 3), c = Math.cos(rot), s = Math.sin(rot);
  const P = (u, v) => [x + c * u - s * v, z + s * u + c * v];
  /** a local box (u0, v0, u1, v1, h0, h1), turned with the frame */
  const B = (mat, u0, v0, u1, v1, h0, h1) => bag.add(mat, box(u0, h0, v0, u1, h1, v1).rotateY(-rot).translate(x, y0, z));
  // (every lathe piece's profile is scaled by a hash of its own place, so that no shape repeats twelve times and is made an instanced draw)
  const L = (mat, prof, u, v, h = 0, seg = 9) => { const [px, pz] = P(u, v), k = Math.abs(Math.sin(px * 12.9898 + pz * 78.233) * 43758.5453) % 1, a = 0.9 + 0.2 * k, b = 0.94 + 0.12 * ((k * 7.3) % 1); bag.add(mat, lathe(prof.map(([r, hh]) => [r * a, hh * b]), seg, null, px, y0 + h, pz)); };
  const C = (u0, v0, u1, v1, w, h0, h1) => col.segment(P(u0, v0), P(u1, v1), w, y0 + h0, y0 + h1);
  // the counter: plastered mudbrick with a limestone slab on it, a worn sill
  B('mud_plaster', -1.7, -0.36, 1.7, 0.36, 0, 0.92);
  B('limestone_core', -1.78, -0.44, 1.78, 0.44, 0.92, 0.97);
  B('mud_plaster', -1.78, 0.36, 1.78, 0.5, 0, 0.08);
  C(-1.76, 0, 1.76, 0, 0.9, 0, 0.97);
  // flat loaves in heaps, conical loaves turned out of the bread pots in rows, along the west half of the counter
  for (let k = 0; k < 4; k++) {
    const u = -1.5 + k * 0.42, n = 3 + Math.floor(rand() * 4);
    for (let i = 0; i < n; i++) L('cloth_ochre', [[0.001, 0], [0.11, 0.004], [0.115, 0.022], [0.09, 0.03], [0.001, 0.032]], u + (rand() - 0.5) * 0.04, -0.1 + (rand() - 0.5) * 0.06, 0.97 + i * 0.03, 9);
  }
  for (let r = 0; r < 2; r++) for (let k = 0; k < 4; k++) L('cloth_ochre', LOAF, -0.1 + k * 0.2, 0.08 + r * 0.17 - 0.12, 0.97, 7);
  // the beer: three tall jars in mud rings on the east half, a row of drinking bowls before them, a dipper
  for (let k = 0; k < 3; k++) {
    const u = 0.75 + k * 0.38;
    L('mud_plaster', [[0.17, 0], [0.17, 0.07], [0.1, 0.09], [0.001, 0.09]], u, -0.1, 0.97, 9);
    L('terracotta', BEER.map(([r, h]) => [r * 0.95, h * 0.95 + 0.04]), u, -0.1, 0.97, 9);
    L('mud_plaster', [[0.08, 0], [0.08, 0.03], [0.05, 0.08], [0.001, 0.1]], u, -0.1, 0.97 + 0.04 + 0.72, 7);
  }
  for (let k = 0; k < 5; k++) L('terracotta', [[0.001, 0], [0.035, 0], [0.06, 0.04], [0.065, 0.065], [0.055, 0.065], [0.05, 0.045], [0.001, 0.02]], 0.7 + k * 0.22, 0.2, 0.97, 8);
  // behind the counter: sacks of grain against the back, the keeper's stool, a basket of the bread-pot lids
  for (let k = 0; k < 5; k++) L('cloth_ochre', [[0.001, 0], [0.26, 0.02], [0.28, 0.2], [0.22, 0.36], [0.1, 0.44], [0.001, 0.46]], -1.35 + k * 0.52 + (rand() - 0.5) * 0.06, -1.15, 0, 8);
  C(-1.6, -1.15, 1.0, -1.15, 0.55, 0, 0.45);
  B('timber', 1.0, -0.95, 1.38, -0.62, 0.0, 0.34); B('reed_mat', 0.98, -0.97, 1.4, -0.6, 0.34, 0.38);
  L('reed_mat', [[0.2, 0], [0.26, 0.15], [0.25, 0.22], [0.001, 0.22]], 1.65, -0.9, 0, 8);
  // the shade: four palm posts, a ridge beam and the mats over rafters, higher at the front
  for (const [u, v, h] of [[-2.05, 0.95, 2.55], [2.05, 0.95, 2.55], [-2.05, -1.35, 2.2], [2.05, -1.35, 2.2]]) {
    const [px, pz] = P(u, v); bag.add('timber', lathe([[0.07, 0], [0.06, h], [0.001, h + 0.02]], 6, null, px, y0, pz)); col.circle(px, pz, 0.09, y0, y0 + h);
  }
  const R = [];
  for (const u of [-2.05, 2.05]) { const a = P(u, 0.95), b = P(u, -1.35); beamTris(R, [a[0], y0 + 2.55, a[1]], [b[0], y0 + 2.2, b[1]], 0.06, 0.08); }
  for (let u = -1.8; u <= 1.81; u += 0.6) { const a = P(u, 1.05), b = P(u, -1.45); beamTris(R, [a[0], y0 + 2.58, a[1]], [b[0], y0 + 2.2, b[1]], 0.03, 0.05); }
  bag.add('timber', fromTriangles(R));
  // the mats: one sloping sheet, thick enough to be a roof, from the front edge down to the back
  { const T = [], a = P(0, 1.1), b = P(0, -1.5); beamTris(T, [a[0], y0 + 2.62, a[1]], [b[0], y0 + 2.26, b[1]], 2.3, 0.06); bag.add('reed_mat', fromTriangles(T)); }
}
