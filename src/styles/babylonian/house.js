// The houses of Babylon's inner city (docs/settlements/babylon.md §5.3): the courtyard house of the Sumerian style
// (rooms round a paved court, baked-brick footing, plastered mud brick above, a flat roof with a parapet) given what
// makes a Babylonian lane: the ends of the palm-trunk roof beams standing out under the parapet, a brick bench and
// a storage jar at the door, on some a reed shade on palm posts over the door with the householder's wares on a
// counter (a shop: Herodotus saw the dates, jars and cloth of the city), on some a reed shelter on the roof for the
// hot nights (sleeping on the roof is attested by the houses' stairs), bread-oven vents, stacked fodder.
// All additions lie outside the lot's rectangle or on its roof, so the house's colliders stay valid.

import { STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import '../sumerian/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A closed hexahedron from four bottom and four top corners (any order, faces turned outward). */
export function hexa(c) {
  const f = [[0, 1, 2, 3], [4, 7, 6, 5], [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]], t = [];
  for (const [a, b, d, e] of f) t.push(...c[a], ...c[b], ...c[d], ...c[a], ...c[d], ...c[e]);
  return fromTriangles(orientOutward(t));
}
const JAR = [[0.07, 0], [0.15, 0.05], [0.26, 0.28], [0.27, 0.4], [0.17, 0.64], [0.1, 0.72], [0.12, 0.78], [0.001, 0.78]];       // a storage jar
const POT = [[0.06, 0], [0.12, 0.04], [0.17, 0.16], [0.11, 0.3], [0.08, 0.34], [0.1, 0.37], [0.001, 0.37]];                     // a small pot
const BASKET = [[0.15, 0], [0.2, 0.06], [0.22, 0.2], [0.2, 0.22], [0.001, 0.22]];

/** A palm-trunk log laid along u at height y on the wall (a pole of 0.11 m). */
const CLOTHS = ['cloth_ochre', 'cloth_indigo', 'cloth_red', 'cloth_white', 'cloth_brown', 'linen', 'cloth_white'];
const SACK = [[0.001, 0], [0.22, 0.02], [0.26, 0.25], [0.22, 0.5], [0.08, 0.6], [0.001, 0.6]];
const ZIR = [[0.001, 0], [0.12, 0], [0.2, 0.1], [0.3, 0.4], [0.28, 0.62], [0.2, 0.84], [0.14, 0.92], [0.17, 0.97], [0.12, 0.98], [0.001, 0.94]];   // a great water jar on its stand
const BUNDLE = [[0.001, 0], [0.16, 0], [0.15, 0.7], [0.1, 1.45], [0.03, 1.7], [0.001, 1.72]];                          // a bundle of reeds stood on end

function babylonHouse(el, ctx) {
  const base = STYLES.sumerian.elements.ur_house;
  base(el, ctx);
  const { bag } = ctx, [x0, z0, x1, z1] = el.rect, W = x1 - x0, D = z1 - z0, open = !!el.open;
  const faces = ['n', 's', 'w', 'e'];
  // the lot's own choices (ur_house's order: storeys, whitewash, footing, door side, door place)
  const r0 = rng(el.seed || 1), two = r0() < 0.45; r0(); r0();
  const side = Math.floor(r0() * 4), f = open ? el.door : (el.door && faces.indexOf(el.door) >= 0 ? el.door : faces[side]);
  const d = Math.min(3.8, Math.min(W, D) * 0.3), H = open ? 3.4 : two ? 6 : 3.4;
  const [s0, s1] = f === 'n' || f === 's' ? [x0 + 0.8, x1 - 0.8] : [z0 + d + 0.8, z1 - d - 0.8];
  let du = s0 + (r0() < 0.5 ? 0.25 : 0.75) * (s1 - s0);
  if (open) du = f === 'n' ? x0 + 1.275 : f === 's' ? x1 - 1.275 : f === 'w' ? z1 - 1.275 : z0 + 1.275;     // the street door of urHouseOpen: t + 0.725 from the corner
  const rand = rng((el.seed || 1) * 7 + 3);
  // the core takes the whole dressing, the outer city the beam ends and the weathering only
  const full = !el.lite;
  const X = (u, o) => (f === 'n' || f === 's' ? u : f === 'w' ? x0 - o : x1 + o), Z = (u, o) => (f === 'w' || f === 'e' ? u : f === 'n' ? z0 - o : z1 + o);
  const P = (u, o, y) => [X(u, o), y, Z(u, o)];
  const lbox = (u0, o0, u1, o1, y0, y1) => { const ax = X(u0, o0), az = Z(u0, o0), bx = X(u1, o1), bz = Z(u1, o1); return box(Math.min(ax, bx), y0, Math.min(az, bz), Math.max(ax, bx), y1, Math.max(az, bz)); };
  const turned = (prof, n, u, o, y) => lathe(prof, n, null, X(u, o), y, Z(u, o));
  const faceLen = f === 'n' || f === 's' ? [x0, x1] : [z0, z1];
  const sd = rand() < 0.5 ? 1 : -1, shop = !open && rand() < 0.36;
  // the ends of the palm-trunk roof beams under the parapet on the door's side and one other
  for (const ff of [f, faces[(faces.indexOf(f) + 2 + (rand() < 0.5 ? 0 : 1)) % 4]]) {
    const along = ff === 'n' || ff === 's', a0 = (along ? x0 : z0) + 0.9, a1 = (along ? x1 : z1) - 0.9, y = H - 0.42;
    for (let a = a0; a < a1; a += 0.95) {
      const o = ff === 'n' ? z0 - 0.22 : ff === 's' ? z1 : ff === 'w' ? x0 - 0.22 : x1;
      bag.add('palm_trunk', along ? box(a - 0.07, y, o, a + 0.07, y + 0.15, o + 0.22) : box(o, y, a - 0.07, o + 0.22, y + 0.15, a + 0.07));
    }
  }
  // the weathering of the street front: the plinth tarred with bitumen against the damp, mud brick showing where the
  // plaster has fallen, dark streaks under the gutters' spouts and the parapet, lighter patches of new plaster
  const fa = faceLen[0] + 0.3, fb = faceLen[1] - 0.3;
  for (const [a, b] of [[fa, du - 0.85], [du + 0.85, fb]]) if (b - a > 0.6) bag.add('bitumen', lbox(a, 0, b, 0.035, 0, 0.32));
  const nPatch = full ? 3 + Math.floor(rand() * 3) : 1;
  for (let k = 0; k < nPatch; k++) {
    const w = 0.5 + rand() * 1.1, h = 0.4 + rand() * 0.8, u = fa + 0.4 + rand() * Math.max(0.1, fb - fa - w - 0.8), y = 0.7 + rand() * (H - 2.4);
    if (Math.abs(u + w / 2 - du) < w / 2 + 0.8) continue;
    bag.add(k % 3 === 2 ? 'limewash_white' : 'mudbrick', lbox(u, 0, u + w, 0.024 + 0.004 * k, y, y + h));
  }
  for (let k = 0; k < (full ? 3 : 1); k++) {
    const u = fa + 0.5 + rand() * Math.max(0.1, fb - fa - 1), w = 0.22 + rand() * 0.3, h = 0.9 + rand() * 1.4;
    if (Math.abs(u - du) < 0.9) continue;
    bag.add('plaster_damp', lbox(u, 0, u + w, 0.008 + 0.004 * k, H - 0.5 - h, H - 0.5));
  }
  // the door: a lamp niche over it (a clay lamp black with soot), the cedar leaf's bronze studs
  bag.add('brick_baked', lbox(du - 0.62, 0, du + 0.62, 0.3, 0, 0.1));
  if (full) {
    bag.add('mud_plaster', lbox(du - 0.16, 0, du + 0.16, 0.12, 2.35, 2.62));
    bag.add('pottery_dark', lbox(du - 0.09, 0.02, du + 0.09, 0.115, 2.4, 2.5));
    for (const yy of [0.5, 0.95, 1.4, 1.85]) for (const dx of [-0.3, 0.3]) bag.add('bronze', lbox(du + dx - 0.03, 0.0, du + dx + 0.03, 0.03, yy, yy + 0.06));
  }
  // at the door: a brick bench, or the shop's counter; the water jar on its stand beside the door
  if (!shop && !open) bag.add('mudbrick', lbox(du + sd * 0.8, 0, du + sd * 2.1, 0.5, 0, 0.45));
  else if (open && full) bag.add('mudbrick', lbox(du + 1.0, 0, du + 2.2, 0.5, 0, 0.45));
  if (rand() < 0.5 || !full) {
    bag.add('pottery_dark', turned(JAR, 10, du - sd * 1.05, 0.28, 0));
  } else {
    // a ring of brick holds the great jar upright; a bowl over its mouth
    const u = du - sd * 1.15;
    bag.add('brick_baked', lbox(u - 0.33, 0.05, u + 0.33, 0.71, 0, 0.22));
    bag.add('terracotta', turned(ZIR, 12, u, 0.38, 0.22));
    bag.add('pottery_dark', turned([[0.001, 0.92], [0.12, 0.93], [0.17, 0.98], [0.001, 0.985]], 10, u, 0.38, 0.22));
  }
  if (!full) return;
  // the shop: a reed shade on two palm posts over the door and the wares on a counter at the side
  if (shop) {
    const u0 = du - 1.7, u1 = du + 1.7, o = 0.6, hi = 2.75, lo = 2.35;
    for (const u of [u0 + 0.1, u1 - 0.1]) bag.add('palm_trunk', lbox(u - 0.07, o - 0.1, u + 0.07, o + 0.04, 0, lo));
    bag.add('reed_mat', hexa([P(u0, 0.02, hi - 0.06), P(u1, 0.02, hi - 0.06), P(u1, o + 0.1, lo - 0.06), P(u0, o + 0.1, lo - 0.06), P(u0, 0.02, hi), P(u1, 0.02, hi), P(u1, o + 0.1, lo), P(u0, o + 0.1, lo)]));
    bag.add('palm_trunk', lbox(u0, o - 0.04, u1, o + 0.08, lo - 0.12, lo - 0.06));
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
  // against the front, away from the door: the householder's things — washing on a pole, a stack of palm logs, reed
  // bundles, sacks, firewood, a ladder to the roof
  const free = (w) => { const lo = faceLen[0] + 1.0, hi = faceLen[1] - 1.0 - w; for (let t = 0; t < 8; t++) { const u = lo + rand() * Math.max(0.1, hi - lo); if (Math.abs(u + w / 2 - du) > w / 2 + 1.3 && (!shop || Math.abs(u + w / 2 - (du + sd)) > w / 2 + 2.5)) return u; } return null; };
  const q = rand();
  if (q < 0.34) {                                     // washing on a pole thrust from the wall
    const u = free(1.7);
    if (u != null) {
      const y = H > 4 ? 3.0 : 2.9;
      bag.add('palm_trunk', lbox(u, 0.04, u + 1.7, 0.16, y, y + 0.1));
      for (const uu of [u + 0.1, u + 1.6]) bag.add('palm_trunk', lbox(uu - 0.04, 0, uu + 0.04, 0.12, y - 0.3, y + 0.05));
      for (let k = 0; k < 3; k++) { const cu = u + 0.15 + k * 0.52, ch = 0.7 + rand() * 0.45; bag.add(CLOTHS[Math.floor(rand() * CLOTHS.length)], lbox(cu, 0.12, cu + 0.4, 0.15, y - ch, y)); }
    }
  } else if (q < 0.52) {                              // palm logs stacked in a pyramid
    const u = free(1.7);
    if (u != null) for (let row = 0; row < 3; row++) for (let i = 0; i < 3 - row; i++) { const c = u + 0.2 + i * 0.26 + row * 0.13; bag.add('palm_trunk', lbox(c - 0.1, 0.05, c + 0.1, 0.62, 0.0 + row * 0.2, 0.2 + row * 0.2)); }
  } else if (q < 0.68) {                              // reed bundles standing against the wall
    const u = free(1.4);
    if (u != null) for (let i = 0; i < 4; i++) bag.add('reed_mat', turned(BUNDLE, 7, u + 0.2 + i * 0.3, 0.2 + (i % 2) * 0.1, 0));
  } else if (q < 0.82) {                              // sacks of grain
    const u = free(1.3);
    if (u != null) { for (let i = 0; i < 3; i++) bag.add('sacking', turned(SACK, 8, u + 0.3 + i * 0.45, 0.28, 0)); bag.add('sacking', turned(SACK, 8, u + 0.52, 0.3, 0.55)); }
  } else if (!open && !two) {                         // a ladder to the roof
    const u = free(0.6);
    if (u != null) {
      for (const dx of [0, 0.5]) { const T = []; beamTris(T, P(u + dx, 0.5, 0), P(u + dx, 0.02, H + 0.5), 0.035, 0.07); bag.add('palm_trunk', fromTriangles(T)); }
      for (let k = 0; k < 8; k++) { const t = (k + 0.7) / 9.4, o = 0.5 - 0.48 * t; bag.add('wood_dark', lbox(u, o - 0.025, u + 0.53, o + 0.025, t * (H + 0.5) - 0.02, t * (H + 0.5) + 0.03)); }
    }
  }
  if (!full || open) return;
  // a third storey on some two-storey houses (Herodotus 1.180: houses of three and four storeys): a set-back room over the
  // wing on the lane, its walls plastered, a parapet of the same, two lattice windows on the lane
  let third = false;
  if (two && rand() < 0.4) {
    const wing = { n: [x0, z0, x1, z0 + d], s: [x0, z1 - d, x1, z1], w: [x0, z0 + d, x0 + d, z1 - d], e: [x1 - d, z0 + d, x1, z1 - d] }[f];
    const ins = { n: [0.7, 0.7, 0.7, 0.15], s: [0.7, 0.15, 0.7, 0.7], w: [0.7, 0.7, 0.15, 0.7], e: [0.15, 0.7, 0.7, 0.7] }[f];
    const r = [wing[0] + ins[0], wing[1] + ins[1], wing[2] - ins[2], wing[3] - ins[3]];
    if (r[2] - r[0] > 3 && r[3] - r[1] > 1.8) {
      bag.add('mud_plaster', box(r[0], H, r[1], r[2], H + 2.8, r[3])); bag.add('mud_plaster', box(r[0] - 0.12, H + 2.8, r[1] - 0.12, r[2] + 0.12, H + 3.0, r[3] + 0.12));
      ctx.col.rect(r, H, H + 3.0); third = true;
      const o = f === 'n' ? z0 - r[1] : f === 's' ? r[3] - z1 : f === 'w' ? x0 - r[0] : r[2] - x1;     // the room's front face stands this far out of the lot's (negative: inside)
      const along = f === 'n' || f === 's' ? [r[0], r[2]] : [r[1], r[3]];
      for (const k of [0.3, 0.7]) { const u = along[0] + k * (along[1] - along[0]); bag.add('lattice', lbox(u - 0.3, o, u + 0.3, o + 0.05, H + 1.0, H + 1.8)); bag.add('cedar', lbox(u - 0.38, o, u + 0.38, o + 0.08, H + 0.9, H + 1.0)); }
    }
  }
  // on the roof: a reed shelter on palm posts for sleeping in the hot nights, on a wing of the house
  if (rand() < 0.4 && !third) {
    const alongX = rand() < 0.5, wing = alongX ? [x0, z0, x1, z0 + d] : [x0, z0 + d, x0 + d, z1 - d];
    const L = alongX ? W : D - 2 * d, cl = (alongX ? wing[0] + wing[2] : wing[1] + wing[3]) / 2 + (rand() - 0.5) * (L - 5), cz = alongX ? (wing[1] + wing[3]) / 2 : (wing[0] + wing[2]) / 2;
    if (L > 5.5 && d >= 2.4) {
      const hl = 1.2, hw = Math.min(1.0, d / 2 - 0.45), h0 = 1.8, h1 = 2.05;
      const Pt = (a, b, y) => (alongX ? [cl + a, H + y, cz + b] : [cz + b, H + y, cl + a]);
      for (const [a, b] of [[-hl, -hw], [-hl, hw], [hl, -hw], [hl, hw]]) { const p = Pt(a, b, 0); bag.add('palm_trunk', box(p[0] - 0.05, H, p[2] - 0.05, p[0] + 0.05, H + h0, p[2] + 0.05)); }
      bag.add('reed_mat', hexa([Pt(-hl - 0.2, -hw - 0.15, h0), Pt(hl + 0.2, -hw - 0.15, h0), Pt(hl + 0.2, hw + 0.15, h0), Pt(-hl - 0.2, hw + 0.15, h0), Pt(-hl - 0.2, -hw - 0.15, h0 + 0.06), Pt(hl + 0.2, -hw - 0.15, h0 + 0.06 + (h1 - h0)), Pt(hl + 0.2, hw + 0.15, h0 + 0.06 + (h1 - h0)), Pt(-hl - 0.2, hw + 0.15, h0 + 0.06)]));
      const m = Pt(0, 0, 0); bag.add('reed_mat', box(m[0] - (alongX ? 0.9 : 0.6), H, m[2] - (alongX ? 0.6 : 0.9), m[0] + (alongX ? 0.9 : 0.6), H + 0.07, m[2] + (alongX ? 0.6 : 0.9)));
    }
  }
  // the bread oven's vent: a small clay-capped chimney on the roof at a corner (houses of one storey; the oven is in the court)
  if (!two && rand() < 0.5) { const vx = x0 + 0.45 + rand() * (W - 0.9), vz = rand() < 0.5 ? z0 + 0.45 : z1 - 0.45; bag.add('mudbrick', box(vx - 0.25, H, vz - 0.25, vx + 0.25, H + 0.7, vz + 0.25)); bag.add('terracotta', box(vx - 0.3, H + 0.7, vz - 0.3, vx + 0.3, H + 0.82, vz + 0.3)); }
  // the roof's clutter: great jars set to catch the rain, a stack of bricks, a mat of dates drying
  for (let k = 0; k < 2; k++) {
    const rx = x0 + 1 + rand() * (W - 2), rz = z0 + 1 + rand() * (D - 2);
    if (rx > x0 + d + 0.4 && rx < x1 - d - 0.4 && rz > z0 + d + 0.4 && rz < z1 - d - 0.4) continue;      // (the court is open, not roof)
    const t = rand();
    if (t < 0.4) bag.add('terracotta', lathe(ZIR.map(([r, y]) => [r * 0.8, y * 0.8]), 10, null, rx, H, rz));
    else if (t < 0.7) bag.add('mudbrick', box(rx - 0.4, H, rz - 0.3, rx + 0.4, H + 0.4, rz + 0.3));
    else bag.add('reed_mat', box(rx - 0.6, H, rz - 0.4, rx + 0.6, H + 0.04, rz + 0.4));
  }
}

export function babylonianHouses() { return { babylon_house: babylonHouse }; }
