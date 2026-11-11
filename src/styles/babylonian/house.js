// The houses of Babylon's inner city (docs/settlements/babylon.md §5.3): the courtyard house of the Sumerian style
// (rooms round a paved court, baked-brick footing, plastered mud brick above, a flat roof with a parapet) given what
// makes a Babylonian lane: the ends of the palm-trunk roof beams standing out under the parapet, a brick bench and
// a storage jar at the door, on some a reed shade on palm posts over the door with the householder's wares on a
// counter (a shop: Herodotus saw the dates, jars and cloth of the city), on some a reed shelter on the roof for the
// hot nights (sleeping on the roof is attested by the houses' stairs), bread-oven vents, stacked fodder.
// All additions lie outside the lot's rectangle or on its roof, so the house's colliders stay valid.

import { STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import '../sumerian/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A closed hexahedron from four bottom and four top corners (any order, faces turned outward). */
function hexa(c) {
  const f = [[0, 1, 2, 3], [4, 7, 6, 5], [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]], t = [];
  for (const [a, b, d, e] of f) t.push(...c[a], ...c[b], ...c[d], ...c[a], ...c[d], ...c[e]);
  return fromTriangles(orientOutward(t));
}
const JAR = [[0.07, 0], [0.15, 0.05], [0.26, 0.28], [0.27, 0.4], [0.17, 0.64], [0.1, 0.72], [0.12, 0.78], [0.001, 0.78]];       // a storage jar
const POT = [[0.06, 0], [0.12, 0.04], [0.17, 0.16], [0.11, 0.3], [0.08, 0.34], [0.1, 0.37], [0.001, 0.37]];                     // a small pot
const BASKET = [[0.15, 0], [0.2, 0.06], [0.22, 0.2], [0.2, 0.22], [0.001, 0.22]];

function babylonHouse(el, ctx) {
  const base = STYLES.sumerian.elements.ur_house;
  base(el, ctx);
  if (el.open) return;
  const { bag } = ctx, [x0, z0, x1, z1] = el.rect, W = x1 - x0, D = z1 - z0;
  // ur_house's own choices, in its order (sumerian/index.js urHouse): storeys, whitewash, footing, door side, door place
  const r0 = rng(el.seed || 1), two = r0() < 0.45; r0(); r0();
  const side = Math.floor(r0() * 4), faces = ['n', 's', 'w', 'e'], f = faces[side], d = Math.min(3.8, Math.min(W, D) * 0.3);
  const [s0, s1] = f === 'n' || f === 's' ? [x0 + 0.8, x1 - 0.8] : [z0 + d + 0.8, z1 - d - 0.8];
  const du = s0 + (r0() < 0.5 ? 0.25 : 0.75) * (s1 - s0), H = two ? 6 : 3.4;
  const rand = rng((el.seed || 1) * 7 + 3);
  // local frame of the door's face: u along it, o outward from it
  const X = (u, o) => (f === 'n' || f === 's' ? u : f === 'w' ? x0 - o : x1 + o), Z = (u, o) => (f === 'w' || f === 'e' ? u : f === 'n' ? z0 - o : z1 + o);
  const P = (u, o, y) => [X(u, o), y, Z(u, o)];
  const lbox = (u0, o0, u1, o1, y0, y1) => { const ax = X(u0, o0), az = Z(u0, o0), bx = X(u1, o1), bz = Z(u1, o1); return box(Math.min(ax, bx), y0, Math.min(az, bz), Math.max(ax, bx), y1, Math.max(az, bz)); };
  const turned = (prof, n, u, o, y) => lathe(prof, n, null, X(u, o), y, Z(u, o));
  // a gap to the neighbour is at least a metre: the things at the door stand within 0.55 m of the wall
  // the ends of the palm-trunk roof beams under the parapet on the door's side and one other
  for (const ff of [f, faces[(side + 2 + (rand() < 0.5 ? 0 : 1)) % 4]]) {
    const along = ff === 'n' || ff === 's', a0 = (along ? x0 : z0) + 0.9, a1 = (along ? x1 : z1) - 0.9, y = H - 0.42;
    for (let a = a0; a < a1; a += 0.95) {
      const o = ff === 'n' ? z0 - 0.22 : ff === 's' ? z1 : ff === 'w' ? x0 - 0.22 : x1;
      bag.add('palm_trunk', along ? box(a - 0.07, y, o, a + 0.07, y + 0.15, o + 0.22) : box(o, y, a - 0.07, o + 0.22, y + 0.15, a + 0.07));
    }
  }
  // the door: a brick bench along the wall to one side, a jar beside it, the door's own post-and-lintel gets a threshold step
  const sd = rand() < 0.5 ? 1 : -1, shop = rand() < 0.36;
  if (!shop) bag.add('mudbrick', lbox(du + sd * 0.8, 0, du + sd * 2.1, 0.5, 0, 0.45));
  bag.add('brick_baked', lbox(du - 0.62, 0, du + 0.62, 0.3, 0, 0.1));
  bag.add('pottery_dark', turned(JAR, 10, du - sd * 1.05, 0.28, 0));
  // the shop: a reed shade on two palm posts over the door and the wares on a counter at the side
  if (shop) {
    const u0 = du - 1.7, u1 = du + 1.7, o = 0.6, hi = 2.75, lo = 2.35;
    // two posts at the front edge, the shade a thin sloping hexahedron, wall edge higher
    for (const u of [u0 + 0.1, u1 - 0.1]) bag.add('palm_trunk', lbox(u - 0.07, o - 0.1, u + 0.07, o + 0.04, 0, lo));
    bag.add('reed_mat', hexa([P(u0, 0.02, hi - 0.06), P(u1, 0.02, hi - 0.06), P(u1, o + 0.1, lo - 0.06), P(u0, o + 0.1, lo - 0.06), P(u0, 0.02, hi), P(u1, 0.02, hi), P(u1, o + 0.1, lo), P(u0, o + 0.1, lo)]));
    bag.add('palm_trunk', lbox(u0, o - 0.04, u1, o + 0.08, lo - 0.12, lo - 0.06));       // the front beam under the shade
    // the counter: a low brick table with its wares
    const cu = du + sd * 1.0;
    bag.add('mudbrick', lbox(cu - 0.9, 0.05, cu + 0.9, 0.5, 0, 0.95));
    const kind = Math.floor(rand() * 3);
    for (let i = 0; i < 5; i++) {
      const u = cu - 0.7 + i * 0.35;
      if (kind === 0) bag.add('pottery_dark', turned(POT, 8, u, 0.28, 0.95));
      else if (kind === 1) bag.add('hide_tan', turned(BASKET, 8, u, 0.28, 0.95));
      else bag.add(['cloth_ochre', 'cloth_indigo', 'cloth_red', 'cloth_white', 'cloth_brown'][i], lbox(u - 0.14, 0.12, u + 0.14, 0.44, 0.95, 1.07 + (i % 2) * 0.1));
    }
    if (kind === 0) bag.add('terracotta', turned(JAR, 10, cu + 1.3, 0.3, 0));
  }
  // on the roof: a reed shelter on palm posts for sleeping in the hot nights, on a wing of the house
  if (rand() < 0.4) {
    const alongX = rand() < 0.5, wing = alongX ? [x0, z0, x1, z0 + d] : [x0, z0 + d, x0 + d, z1 - d];
    const L = alongX ? W : D - 2 * d, cl = (alongX ? wing[0] + wing[2] : wing[1] + wing[3]) / 2 + (rand() - 0.5) * (L - 5), cz = alongX ? (wing[1] + wing[3]) / 2 : (wing[0] + wing[2]) / 2;
    if (L > 5.5 && d >= 2.4) {
      const hl = 1.2, hw = Math.min(1.0, d / 2 - 0.45), h0 = 1.8, h1 = 2.05;
      const Pt = (a, b, y) => (alongX ? [cl + a, H + y, cz + b] : [cz + b, H + y, cl + a]);
      for (const [a, b] of [[-hl, -hw], [-hl, hw], [hl, -hw], [hl, hw]]) { const p = Pt(a, b, 0); bag.add('palm_trunk', box(p[0] - 0.05, H, p[2] - 0.05, p[0] + 0.05, H + h0, p[2] + 0.05)); }
      bag.add('reed_mat', hexa([Pt(-hl - 0.2, -hw - 0.15, h0), Pt(hl + 0.2, -hw - 0.15, h0), Pt(hl + 0.2, hw + 0.15, h0), Pt(-hl - 0.2, hw + 0.15, h0), Pt(-hl - 0.2, -hw - 0.15, h0 + 0.06), Pt(hl + 0.2, -hw - 0.15, h0 + 0.06 + (h1 - h0)), Pt(hl + 0.2, hw + 0.15, h0 + 0.06 + (h1 - h0)), Pt(-hl - 0.2, hw + 0.15, h0 + 0.06)]));
      const m = Pt(0, 0, 0); bag.add('reed_mat', box(m[0] - (alongX ? 0.9 : 0.6), H, m[2] - (alongX ? 0.6 : 0.9), m[0] + (alongX ? 0.9 : 0.6), H + 0.07, m[2] + (alongX ? 0.6 : 0.9)));   // the sleeping mat
    }
  }
  // the bread oven's vent: a small clay-capped chimney on the roof at a corner (houses of one storey; the oven is in the court)
  if (!two && rand() < 0.5) { const vx = x0 + 0.45 + rand() * (W - 0.9), vz = rand() < 0.5 ? z0 + 0.45 : z1 - 0.45; bag.add('mudbrick', box(vx - 0.25, H, vz - 0.25, vx + 0.25, H + 0.7, vz + 0.25)); bag.add('terracotta', box(vx - 0.3, H + 0.7, vz - 0.3, vx + 0.3, H + 0.82, vz + 0.3)); }
}

export function babylonianHouses() { return { babylon_house: babylonHouse }; }
