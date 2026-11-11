// The houses and shops of Madurai about 1650 (docs/settlements/madurai.md §12): rows with continuous
// fronts on the temple streets — each house a raised pillared verandah (thinnai) under a lean-to of
// tiles, a front wall with its carved door, a red-ochre dado and a cream cornice, a gabled roof of
// country tiles with ridge and eaves; the shops of the temple streets as open fronts on a high
// platform under a palm-mat awning, with the goods of their trade; thatched huts on the outskirts.
// Everything is built in the lot's own frame (u along the street, v from the street front inwards)
// and mapped to the world by the lot's facing.

import { box, lathe, fromTriangles, disc, clothBox, addCloth } from '../../core/geom.js';
import * as IN from './interiors.js';

const G = 'granite_tamil';
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/** The lot's frame: the mapping (u, v) → world, boxes, colliders, planar polygons by material. */
export function frameOf(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, f = el.facing ?? 's', NS = f === 'n' || f === 's';
  const W = NS ? x1 - x0 : z1 - z0, D = NS ? z1 - z0 : x1 - x0;
  const map = f === 'n' ? (u, v) => [x0 + u, z0 + v] : f === 's' ? (u, v) => [x0 + u, z1 - v] : f === 'w' ? (u, v) => [x0 + v, z0 + u] : (u, v) => [x1 - v, z0 + u];
  const a0 = map(0, 0), au = map(1, 0), av = map(0, 1);
  const du = [au[0] - a0[0], au[1] - a0[1]], dv = [av[0] - a0[0], av[1] - a0[1]];
  const B = (m, u0, y0, v0, u1, y1, v1) => { const [a, b] = map(u0, v0), [c, d] = map(u1, v1); bag.add(m, box(Math.min(a, c), y0, Math.min(b, d), Math.max(a, c), y1, Math.max(b, d))); };
  const C = (u0, v0, u1, v1, y0, y1) => { const [a, b] = map(u0, v0), [c, d] = map(u1, v1); col.rect([a, b, c, d], y0, y1); };
  const Fl = (u0, v0, u1, v1, y) => { const [a, b] = map(u0, v0), [c, d] = map(u1, v1); col.floor([a, b, c, d], y); };
  const P = (u, y, v) => { const [a, b] = map(u, v); return [a, y, b]; };
  const tris = new Map();
  /** A convex planar polygon (local [u, y, v] points) turned to face the local direction `want`. */
  const poly = (m, pts, want) => {
    const w = pts.map(([u, y, v]) => P(u, y, v)), n = [want[0] * du[0] + want[2] * dv[0], want[1], want[0] * du[1] + want[2] * dv[1]];
    const e1 = [w[1][0] - w[0][0], w[1][1] - w[0][1], w[1][2] - w[0][2]], e2 = [w[2][0] - w[0][0], w[2][1] - w[0][1], w[2][2] - w[0][2]];
    const c = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    if (c[0] * n[0] + c[1] * n[1] + c[2] * n[2] < 0) w.reverse();
    let t = tris.get(m); if (!t) tris.set(m, t = []);
    for (let i = 1; i < w.length - 1; i++) t.push(...w[0], ...w[i], ...w[i + 1]);
  };
  const flush = () => { for (const [m, t] of tris) if (t.length) bag.add(m, fromTriangles(t)); tris.clear(); };
  return { W, D, map, B, C, Fl, P, poly, flush, du, dv, bag, col };
}

/** A wooden verandah post (octagonal shaft on a granite block, a bracket capital) from y0 to its beam at yb. */
export function post(F, u, v, y0, yb, s = 1) {
  const [x, , z] = F.P(u, 0, v), { bag } = F;
  F.B(G, u - 0.16, y0 - 0.06, v - 0.16, u + 0.16, y0 + 0.2, v + 0.16);
  bag.add('timber', lathe([[0.12 * s, 0], [0.105 * s, 0.1], [0.105 * s, yb - y0 - 0.45], [0.13 * s, yb - y0 - 0.38], [0.11 * s, yb - y0 - 0.3], [0.11 * s, yb - y0]], 8, null, x, y0 + 0.2, z));
  F.B('timber', u - 0.2, yb - 0.3, v - 0.1, u + 0.2, yb - 0.04, v + 0.1);
}

const WASHES = ['plaster_white', 'stucco_cream', 'limewash_white', 'limewash_yellow', 'stucco_saffron', 'stucco_sky'];
const pick = (r, a) => a[Math.floor(r() * a.length)];

/** Little brass vessel (kudam): foot, belly, neck, flared lip. */
export const vessel = (bag, x, y, z, s = 1, mat = 'bronze') => bag.add(mat, lathe([[0.001, 0], [0.07 * s, 0], [0.1 * s, 0.05 * s], [0.17 * s, 0.17 * s], [0.18 * s, 0.26 * s], [0.12 * s, 0.38 * s], [0.07 * s, 0.44 * s], [0.1 * s, 0.5 * s], [0.07 * s, 0.5 * s]], 8, null, x, y, z));
/** A tall Tamil standing lamp (kuttuvilakku): a round foot, a slender stem with rings, a dish with a lit wick. */
export function lampStand(bag, x, y, z, h = 1.2) {
  bag.add('bronze', lathe([[0.001, 0], [0.12, 0], [0.13, 0.03], [0.07, 0.08], [0.04, 0.16], [0.05, 0.28], [0.035, 0.36], [0.035, h - 0.14], [0.06, h - 0.1], [0.1, h - 0.04], [0.12, h], [0.001, h]], 10, null, x, y, z));
  bag.add('lamp_glass', lathe([[0.001, 0], [0.03, 0.02], [0.001, 0.09]], 5, null, x, y + h, z));
}
const dome = (bag, mat, x, y, z, r, h) => bag.add(mat, lathe([[0.001, 0], [r, 0], [r * 0.92, h * 0.5], [r * 0.6, h * 0.88], [0.001, h]], 8, null, x, y, z));

/** The front step's kolam: the rice-flour dots of the morning on the street before the door. */
function kolam(F, u, v, rand) {
  const k = rand() < 0.5 ? 3 : 5, sp = 0.24;
  for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) {
    const half = (k - 1) / 2, r = Math.abs(i - half) + Math.abs(j - half);
    if (r > half + 0.2 || (r === half + 0 && false)) continue;
    const [x, , z] = F.P(u + (i - half) * sp, 0, v + (j - half) * sp);
    F.bag.add('chalk', disc(0.045, 0.012, 5, x, z));
  }
}

/** A hanging strip of cloth or flowers (swaying in the wind): u, y top, v, width, length, material. */
function strip(F, mat, u, ytop, v, w, len) {
  const [x, , z] = F.P(u, 0, v), [ax, , az] = F.P(u + w, 0, v + 0.04);
  addCloth(F.bag, mat, clothBox(Math.min(x, ax), ytop - len, Math.min(z, az), Math.max(x, ax), ytop, Math.max(z, az)), ytop);
}

/** The goods of a shop's trade on its platform (v from the street front, y the platform's top). */
function goods(F, trade, y, W, ver, rand, T) {
  const { bag } = F, at = (u, v) => F.P(u, y, v);
  const span = (n, f) => { for (let i = 0; i < n; i++) f(0.5 + (i + 0.5) * (W - 1) / n, i); };
  if (trade === 'flowers') {
    // heaps of jasmine buds, red oleander and pink lotus on leaves and baskets, garlands hanging under the awning
    span(Math.max(2, Math.round(W / 1.5)), (u, i) => {
      const [x, yy, z] = at(u, 0.7 + rand() * 0.5);
      bag.add('wicker', lathe([[0.2, 0], [0.3, 0.12], [0.31, 0.16], [0.001, 0.16]], 8, null, x, yy, z));
      dome(bag, ['cloth_white', 'cloth_white', 'cloth_red', 'stucco_rose'][i % 4], x, yy + 0.12, z, 0.27, 0.2);
    });
    for (let i = 0; i < Math.round(W * 1.3); i++) strip(F, ['cloth_white', 'cloth_white', 'cloth_red', 'cloth_green'][i % 4], 0.3 + i * (W - 0.6) / Math.max(1, Math.round(W * 1.3) - 1), T.ay, -0.45 - (i % 2) * 0.12, 0.06, 0.95 + (i % 3) * 0.12);
  } else if (trade === 'brass') {
    // vessels in stacks and rows, standing lamps at the front, big pots behind
    span(Math.max(3, Math.round(W / 1.1)), (u, i) => {
      const [x, yy, z] = at(u, 0.5 + (i % 2) * 0.55);
      vessel(bag, x, yy, z, 1.1 - (i % 3) * 0.2, i % 4 === 3 ? 'gilt_bronze' : 'bronze');
      if (i % 3 === 0) vessel(bag, x, yy + 0.38, z, 0.6);
    });
    const [lx, ly, lz] = at(0.55, 0.35); lampStand(bag, lx, ly, lz, 1.25);
    const [lx2, ly2, lz2] = at(W - 0.55, 0.35); lampStand(bag, lx2, ly2, lz2, 1.05);
  } else if (trade === 'cloth') {
    // bolts of cloth on a white sheet, saris hung from the awning bar
    const [x, yy, z] = at(W / 2, 0.8);
    F.B('cloth_white', 0.4, y, 0.25, W - 0.4, y + 0.04, 1.35);
    const cols = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_green', 'cloth_maroon', 'cloth_white', 'cloth_blue'];
    span(Math.max(3, Math.round(W / 0.9)), (u, i) => F.B(cols[(i + Math.floor(rand() * 3)) % cols.length], u - 0.3, y + 0.04, 0.35 + (i % 2) * 0.3, u + 0.3, y + 0.04 + 0.12 + (i % 3) * 0.1, 0.35 + (i % 2) * 0.3 + 0.6));
    for (let i = 0; i < Math.round(W * 0.9); i++) {
      const c = cols[(i * 3 + 1) % cols.length], u = 0.4 + i * (W - 0.8) / Math.max(1, Math.round(W * 0.9) - 1);
      strip(F, c, u, T.ay, -0.5, 0.52, 1.35 + (i % 2) * 0.15);
      strip(F, 'cloth_white', u + 0.02, T.ay - 1.28 - (i % 2) * 0.15, -0.5, 0.48, 0.07);
    }
    void x; void yy; void z;
  } else if (trade === 'grain') {
    // open sacks and baskets of grain, pulses, chillies and turmeric, a balance on its beam
    span(Math.max(3, Math.round(W / 1.0)), (u, i) => {
      const [x, yy, z] = at(u, 0.6 + (i % 2) * 0.5);
      bag.add('wicker', lathe([[0.26, 0], [0.34, 0.14], [0.33, 0.3], [0.001, 0.3]], 8, null, x, yy, z));
      dome(bag, ['reed_mat', 'cloth_red', 'stucco_saffron', 'cloth_brown', 'reed_mat'][i % 5], x, yy + 0.24, z, 0.3, 0.2);
    });
    const [bx, by, bz] = at(W * 0.5, 0.2);
    F.B('timber', W * 0.5 - 0.02, by, 0.2, W * 0.5 + 0.02, by + 1.2, 0.24);
    F.B('bronze', W * 0.5 - 0.6, by + 1.18, 0.21, W * 0.5 + 0.6, by + 1.22, 0.23);
    for (const s of [-1, 1]) { const [px, , pz] = at(W * 0.5 + s * 0.55, 0.22); bag.add('bronze', lathe([[0.001, 0], [0.16, 0.0], [0.12, 0.05], [0.001, 0.06]], 8, null, px, by + 0.8, pz)); }
    void bx; void bz;
  } else if (trade === 'pooja') {
    // coconuts, bananas, incense bundles, camphor, small brass lamps: what is brought to the temple
    span(Math.max(2, Math.round(W / 1.4)), (u, i) => {
      for (let k = 0; k < 7; k++) { const [x, yy, z] = at(u - 0.3 + (k % 3) * 0.28, 0.5 + Math.floor(k / 3) * 0.26); bag.add('hide_brown', lathe([[0.001, 0], [0.1, 0.07], [0.001, 0.2]].concat([]), 6, null, x, yy + (k > 5 ? 0.18 : 0), z)); }
      const [x, yy, z] = at(u + 0.45, 0.6); vessel(bag, x, yy, z, 0.7, 'gilt_bronze'); void i;
    });
    for (let i = 0; i < Math.max(2, Math.round(W / 1.5)); i++) strip(F, 'cloth_green', 0.5 + i * (W - 1) / Math.max(1, Math.max(2, Math.round(W / 1.5)) - 1), T.ay, -0.4, 0.5, 0.75);
  } else if (trade === 'sweets') {
    // trays of sweets and fried things, a great brass cauldron on its fire
    span(Math.max(2, Math.round(W / 1.4)), (u, i) => {
      const [x, yy, z] = at(u, 0.45);
      F.B('bronze', u - 0.34, y + 0.5, 0.45 - 0.25, u + 0.34, y + 0.54, 0.45 + 0.25);
      F.B('timber', u - 0.3, y, 0.45 - 0.2, u + 0.3, y + 0.5, 0.45 + 0.2);
      for (let k = 0; k < 6; k++) { const [sx, , sz] = F.P(u - 0.22 + (k % 3) * 0.22, 0, 0.45 - 0.1 + Math.floor(k / 3) * 0.2); dome(bag, i % 2 ? 'stucco_saffron' : 'cloth_brown', sx, y + 0.54, sz, 0.08, 0.05); }
      void x; void yy; void z;
    });
    const [cx, cy, cz] = at(W - 0.8, 1.2);
    bag.add('bronze', lathe([[0.001, 0], [0.3, 0.12], [0.45, 0.35], [0.5, 0.5], [0.45, 0.5], [0.001, 0.3]], 10, null, cx, cy + 0.38, cz));
    F.B('brick', W - 1.2, y, 0.95, W - 0.4, y + 0.38, 1.55);
  } else {
    // coconuts (green and brown), heaped, with husks
    span(Math.max(2, Math.round(W / 1.3)), (u, i) => {
      for (let k = 0; k < 10; k++) { const a = k * 2.4, r = 0.1 + (k % 4) * 0.1, [x, yy, z] = at(u + Math.cos(a) * r * 1.6, 0.8 + Math.sin(a) * r); bag.add(i % 2 ? 'stucco_leaf' : 'hide_brown', lathe([[0.001, 0], [0.11, 0.08], [0.001, 0.22]], 6, null, x, yy + (k < 4 ? 0.12 : 0), z)); }
    });
  }
}

/** The painted door: cream frame, dark leaves with brass studs, a lintel and a panel of the goddess above. */
function door(F, uc, ver, w = 1.0) {
  const { bag } = F;
  F.B('stucco_cream', uc - w / 2 - 0.25, 0.55, ver - 0.05, uc + w / 2 + 0.25, 2.55, ver);
  F.B('wood_dark', uc - w / 2, 0.58, ver - 0.09, uc - 0.02, 2.3, ver - 0.05);
  F.B('wood_dark', uc + 0.02, 0.58, ver - 0.09, uc + w / 2, 2.3, ver - 0.05);
  F.B('timber', uc - w / 2 - 0.35, 2.3, ver - 0.11, uc + w / 2 + 0.35, 2.55, ver - 0.05);
  for (const s of [-1, 1]) for (let r = 0; r < 3; r++) for (let q = 0; q < 2; q++) {
    const [x, , z] = F.P(uc + s * (0.14 + q * 0.2), 0, ver - 0.1);
    bag.add('gilt_bronze', lathe([[0.001, 0], [0.032, 0], [0.02, 0.02], [0.001, 0.025]], 5, null, x, 0.85 + r * 0.45, z));
  }
  // a panel of Gajalakshmi over the lintel: a rose field in a cream frame, a gilt disc
  F.B('stucco_cream', uc - 0.4, 2.62, ver - 0.06, uc + 0.4, 3.12, ver);
  F.B('stucco_rose', uc - 0.33, 2.68, ver - 0.09, uc + 0.33, 3.06, ver - 0.06);
  const [gx, , gz] = F.P(uc, 0, ver - 0.12); bag.add('gilt_bronze', disc(0.13, 2.87, 10, gx, gz));
}

/** A shuttered window: a timber frame, a dark opening with vertical bars. */
function window(F, uc, ver, w = 0.8, y0 = 1.35, h = 1.0) {
  F.B('stucco_cream', uc - w / 2 - 0.12, y0 - 0.12, ver - 0.05, uc + w / 2 + 0.12, y0 + h + 0.12, ver);
  F.B('wood_dark', uc - w / 2, y0, ver - 0.08, uc + w / 2, y0 + h, ver - 0.05);
  for (let k = 1; k < 5; k++) F.B('timber', uc - w / 2 + k * w / 5 - 0.02, y0, ver - 0.11, uc - w / 2 + k * w / 5 + 0.02, y0 + h, ver - 0.08);
}

/** tamil_house: { rect, facing, seed, kind ('house' | 'agra' | 'shop' | 'hut'), trade, wash } — see the file's head. */
export function tamilHouse(el, ctx) {
  const F = frameOf(el, ctx), { W, D, B, C, Fl, poly } = F, { bag } = ctx;
  const rand = rng(el.seed || 1), kind = el.kind ?? 'house', shop = kind === 'shop', hut = kind === 'hut', agra = kind === 'agra';
  const ver = hut ? 1.3 : shop ? 2.3 : agra ? 1.7 : 1.9 + rand() * 0.3, py = hut ? 0.3 : shop ? 0.62 : agra ? 0.72 : 0.55;
  const h = hut ? 2.5 : shop ? 3.3 + rand() * 0.3 : 3.2 + rand() * 0.45, t = hut ? 0.62 : 0.4;
  const wash = hut ? 'mud_plaster' : el.wash ?? pick(rand, WASHES), roof = hut ? 'thatch_palm' : 'roof_tile', uc = W / 2 + (W > 6 ? (rand() - 0.5) * 0.6 : 0);
  const vm = (ver + D) / 2, fe = ver - 0.45, re = D + 0.45;
  // the platform (the thinnai) across the front, the core of the house behind it
  B(G, 0, -0.3, 0, W, py, ver); Fl(0, 0, W, ver, py);
  if (!shop) { B(G, uc - 0.85, -0.3, -0.38, uc + 0.85, py - 0.27, 0); Fl(uc - 0.85, -0.38, uc + 0.85, 0, py - 0.27); }
  else { B(G, 0.3, -0.3, -0.34, W - 0.3, 0.3, 0); Fl(0.3, -0.34, W - 0.3, 0, 0.3); }
  const rich = !!el.rich && !hut, pl = rich ? IN.plan(el, W, D, ver, rand) : null;
  let room = null;
  if (rich) room = IN.shell(F, { wash, h, ver, py, ...pl });
  else { B(wash, 0, -0.3, ver, W, h, D); C(0, ver, W, D, 0, h + 0.1); }
  if (!hut) { B('limewash_red', 0.02, py, ver - 0.03, W - 0.02, py + 0.45, ver); B('stucco_cream', 0, h - 0.16, ver - 0.06, W, h, ver); }
  // the lean-to over the platform on its posts
  const yb = shop ? 2.5 : 2.42, yEdge = shop ? 2.62 : 2.74, vf = shop ? -1.1 : -0.5;
  const yL = (v) => (h - 0.2) + (v - ver) * ((h - 0.2) - yEdge) / (ver - vf);
  poly(shop && rand() < 0.65 || hut ? 'thatch_palm' : roof, [[0, yL(ver), ver], [W, yL(ver), ver], [W, yEdge, vf], [0, yEdge, vf]], [0, 1, 0]);
  poly('timber', [[0, yL(ver) - 0.1, ver], [W, yL(ver) - 0.1, ver], [W, yEdge - 0.1, vf], [0, yEdge - 0.1, vf]], [0, -1, 0]);
  B('timber', -0.03, yEdge - 0.2, vf - 0.02, W + 0.03, yEdge + 0.03, vf + 0.05);
  const nb = Math.max(1, 2 * Math.round((W / (shop ? 3 : 2.5) - 1) / 2) + 1);
  const vp = shop ? -0.8 : 0.28;
  for (let i = 0; i <= nb; i++) {
    const u = 0.25 + i * (W - 0.5) / nb;
    if (hut) { B('timber', u - 0.07, py, vp - 0.07, u + 0.07, yb, vp + 0.07); C(u - 0.07, vp - 0.07, u + 0.07, vp + 0.07, py, yb); }
    else { post(F, u, vp, shop ? 0 : py, yb); C(u - 0.14, vp - 0.14, u + 0.14, vp + 0.14, 0, yb + 0.3); }
  }
  if (!hut) B('timber', 0.015, yb - 0.02, vp - 0.1, W - 0.015, yb + 0.22, vp + 0.1);
  // the roof
  const yF = (v) => h + 0.1 + (v - ver) * t * (v <= vm ? 1 : -1) + (v > vm ? 2 * (vm - ver) * t : 0);
  const ry = h + 0.1 + (vm - ver) * t, yFe = h + 0.1 - 0.45 * t;
  poly(roof, [[0, yFe, fe], [W, yFe, fe], [W, ry, vm], [0, ry, vm]], [0, 1, 0]);
  poly(roof, [[0, ry, vm], [W, ry, vm], [W, yFe, re], [0, yFe, re]], [0, 1, 0]);
  poly('timber', [[0, yFe - 0.1, fe], [W, yFe - 0.1, fe], [W, h, ver], [0, h, ver]], [0, -1, 0]);
  poly('timber', [[0, h, D], [W, h, D], [W, yFe - 0.1, re], [0, yFe - 0.1, re]], [0, -1, 0]);
  B('timber', -0.03, yFe - 0.14, fe - 0.02, W + 0.03, yFe + 0.04, fe + 0.04); B('timber', -0.03, yFe - 0.14, re - 0.04, W + 0.03, yFe + 0.04, re + 0.02);
  B(hut ? 'thatch_palm' : 'terracotta', -0.03, ry - 0.04, vm - 0.2, W + 0.03, ry + 0.17, vm + 0.2);
  for (const u of [0, W]) {
    poly(wash, [[u, h, ver], [u, h, D], [u, h + 0.1, D], [u, ry, vm], [u, h + 0.1, ver]], [u === 0 ? -1 : 1, 0, 0]);
  }
  void yF;
  // the front
  if (!shop) {
    if (rich) IN.openDoor(F, uc, ver); else door(F, uc, ver);
    if (W > 5.6) for (const u of [uc - Math.min(2.3, (uc - 0.4) * 0.62 + 0.5), uc + Math.min(2.3, (W - uc - 0.4) * 0.62 + 0.5)]) if (u > 0.7 && u < W - 0.7) window(F, u, ver);
    if (!hut && rand() < 0.5) kolam(F, uc, -1.05, rand);
    if (!hut) { const [lx, , lz] = F.P(uc + 1.0, 0, ver - 0.12); B('wood_dark', uc + 0.95, 1.5, ver - 0.12, uc + 1.2, 1.78, ver - 0.05); bag.add('lamp_glass', lathe([[0.001, 0], [0.03, 0.02], [0.001, 0.07]], 5, null, lx + (F.dv[0] * 0.0), 1.5, lz)); }
  } else {
    // the shop: the open front on the platform, shelves along the back wall with their goods, the shutter planks above
    const gs = rich ? [[0.2, pl.g0 - 0.1], [pl.g1 + 0.1, W - 0.2]] : [[0.2, W - 0.2]], inGap = (u) => rich && u > pl.g0 - 0.25 && u < pl.g1 + 0.25;
    for (const [a, b] of gs) { B('wood_dark', a, py, ver - 0.5, b, 2.2, ver - 0.04); for (const y of [0.95, 1.4, 1.85]) B('timber', a, y, ver - 0.55, b, y + 0.04, ver - 0.04); }
    if (rich) { B('stucco_cream', pl.g0 - 0.16, py, ver - 0.5, pl.g0 - 0.1, 2.2, ver - 0.04); B('stucco_cream', pl.g1 + 0.1, py, ver - 0.5, pl.g1 + 0.16, 2.2, ver - 0.04); B('wood_dark', pl.g0 - 0.1, 2.2, ver - 0.5, pl.g1 + 0.1, 2.35, ver - 0.04); }
    for (let i = 0; i < Math.round(W * 1.5); i++) { if (inGap(0.5 + i * (W - 1) / Math.max(1, Math.round(W * 1.5) - 1))) continue; const [x, , z] = F.P(0.5 + i * (W - 1) / Math.max(1, Math.round(W * 1.5) - 1), 0, ver - 0.3); vessel(bag, x, [py + 0.35, py + 0.82, py + 1.27][i % 3] + 0.04, z, 0.45, ['bronze', 'terracotta', 'bronze'][(i + el.seed) % 3]); }
    B('wood_dark', 0.2, 2.35, ver - 0.12, W - 0.2, 2.62, ver - 0.04);
    goods(F, el.trade ?? 'cloth', py, W, ver, rand, { ay: yb - 0.04 });
    if (!(shop && ['cloth', 'flowers'].includes(el.trade))) void 0;
  }
  if (rich) {
    const o = { W, py, ver, uc, yb, h, yEdge, vf, hut, shop, trade: el.trade, g0: pl.g0, g1: pl.g1 };
    IN.weather(F, o, rand); IN.thinnai(F, o, rand); if (shop) IN.nameBoard(F, o, rand);
    IN.furnish(F, { ...o, ...room, el, ctx }, rand, el.seed % 3 === 0);
  }
  F.flush();
  // the people stand in the street-life plans
}

export const houseElements = { tamil_house: tamilHouse };
