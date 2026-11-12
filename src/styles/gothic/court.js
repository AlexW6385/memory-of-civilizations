// The court of the Palais de la Cité about 1248 (docs/settlements/paris.md §1c, §5c): the paving of the Cour de Mai (flagged walks
// and cobbled patches, worn kerbs, mud and straw where carts stand, puddles' darkness at the drains), the May tree planted there
// each spring, the mounting blocks and hitching rails where the petitioners left their horses. Registered into the `gothic` style.

import { STYLES } from '../../core/build.js';
import { box, lathe, rod } from '../../core/geom.js';
import './index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const inR = (r, x, z, m = 0) => x > r[0] - m && x < r[2] + m && z > r[1] - m && z < r[3] + m;

/**
 * court_ground: { rect [x0, z0, x1, z1], y, seed, skip: [rects left alone (the chapel's footprint, the stair)], walks: [[x0, z0, x1, z1]
 * flagged strips] } — over the plain paving: a joint pattern of long flags in the walks, cobbled patches, darker wet stone at the
 * drain, worn mud and straw in the corners where carts stand. All thin, merged.
 */
function courtGround(el, { bag }) {
  const [X0, Z0, X1, Z1] = el.rect, y = el.y ?? 0, r = rng(el.seed || 7), skip = el.skip ?? [];
  const free = (a, b, c, d) => !skip.some((s) => a < s[2] && c > s[0] && b < s[3] && d > s[1]);
  // the flagged walks: courses of long flags with their joints
  for (const w of el.walks ?? []) {
    const [x0, z0, x1, z1] = w, alongX = x1 - x0 >= z1 - z0;
    bag.add('flagstone', box(x0, y + 0.012, z0, x1, y + 0.04, z1));
    const L = alongX ? x1 - x0 : z1 - z0, Wd = alongX ? z1 - z0 : x1 - x0;
    for (let u = 0.9 + r() * 0.5; u < L; u += 0.9 + r() * 1.1) {
      if (alongX) bag.add('limestone', box(x0 + u, y + 0.04, z0, x0 + u + 0.03, y + 0.046, z1)); else bag.add('limestone', box(x0, y + 0.04, z0 + u, x1, y + 0.046, z0 + u + 0.03));
    }
    for (let v = 1.3; v < Wd - 0.4; v += 1.2 + r() * 0.6) {
      if (alongX) bag.add('limestone', box(x0, y + 0.04, z0 + v, x1, y + 0.046, z0 + v + 0.03)); else bag.add('limestone', box(x0 + v, y + 0.04, z0, x0 + v + 0.03, y + 0.046, z1));
    }
    for (const e of [-1, 1]) { const q = alongX ? [x0, e < 0 ? z0 - 0.14 : z1 - 0.02, x1, e < 0 ? z0 + 0.02 : z1 + 0.14] : [e < 0 ? x0 - 0.14 : x1 - 0.02, z0, e < 0 ? x0 + 0.02 : x1 + 0.14, z1]; bag.add('limestone', box(q[0], y, q[1], q[2], y + 0.1, q[3])); }
  }
  // cobbled patches, mud and straw, dark wet stone
  const n = Math.round(((X1 - X0) * (Z1 - Z0)) / 220);
  for (let i = 0; i < n; i++) {
    const x = X0 + r() * (X1 - X0), z = Z0 + r() * (Z1 - Z0), k = r(), a = 1 + r() * 3.2, b = 0.8 + r() * 2.4;
    if (!free(x, z, x + a, z + b) || (el.walks ?? []).some((w) => inR(w, x, z, 0.5))) continue;
    if (k < 0.28) bag.add('pebbles', box(x, y + 0.006, z, x + a, y + 0.04, z + b));
    else if (k < 0.5) bag.add('silt', box(x, y + 0.006, z, x + a * 0.8, y + 0.03, z + b * 0.8));
    else if (k < 0.66) { for (let j = 0; j < 7; j++) bag.add('thatch', box(x + r() * a, y + 0.01, z + r() * b, x + r() * a + 0.5 + r() * 0.6, y + 0.025, z + r() * b + 0.04)); }
    else if (k < 0.8) bag.add('plaster_damp', box(x, y + 0.006, z, x + a, y + 0.012, z + b));
    else bag.add('flagstone', box(x, y + 0.008, z, x + a * 0.7, y + 0.03, z + b * 0.7));
  }
  // a stone-lined drain: a kennel across the court to the quay's gutter
  if (el.drain) for (const d of el.drain) { const [x0, z0, x1, z1] = d; if (free(x0, z0, x1, z1)) { bag.add('limestone', box(x0, y + 0.01, z0, x1, y + 0.07, z1)); const alongX = x1 - x0 > z1 - z0; bag.add('plaster_damp', alongX ? box(x0, y + 0.075, (z0 + z1) / 2 - 0.1, x1, y + 0.08, (z0 + z1) / 2 + 0.1) : box((x0 + x1) / 2 - 0.1, y + 0.075, z0, (x0 + x1) / 2 + 0.1, y + 0.08, z1)); } }
}

/** may_tree: { at, y, h } — the May tree of the court: a trimmed elm trunk in a ring of stones, bare to the crown, hung with ribbons. */
function mayTree(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 6.5, r = rng(el.seed || 3);
  bag.add('limestone', lathe([[1.1, 0], [1.1, 0.35], [0.9, 0.4], [0.001, 0.4]], 14, null, x, y, z));
  bag.add('bark_dark', lathe([[0.2, 0.3], [0.17, h * 0.4], [0.14, h * 0.75], [0.04, h]], 8, null, x, y, z));
  for (let i = 0; i < 9; i++) { const a = i * 0.7 + r(), hh = h * (0.5 + r() * 0.4), l = 1.0 + r() * 1.4; bag.add('bark_dark', rod([x, y + hh, z], [x + Math.cos(a) * l, y + hh + 0.6 + r() * 0.8, z + Math.sin(a) * l], 0.04, 4)); }
  for (let i = 0; i < 7; i++) { const a = i * 0.9, hh = h * (0.65 + r() * 0.3); bag.add(['cloth_red', 'cloth_white', 'cloth_blue'][i % 3], rod([x + Math.cos(a) * 0.5, y + hh, z + Math.sin(a) * 0.5], [x + Math.cos(a) * 0.65, y + hh - 1.2 - r() * 0.8, z + Math.sin(a) * 0.65], 0.012, 3)); }
  col.circle(x, z, 1.1, y, y + 0.4);
}

/** mounting_block: { at, y, rot } — two steps of stone for the horsemen; hitching_rail: { at, y, rot, len } — a rail on two posts. */
function mountingBlock(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, c = Math.cos(el.rot ?? 0), s = Math.sin(el.rot ?? 0);
  const P = (u, v) => [x + u * c + v * s, z - u * s + v * c];
  for (const [u0, u1, hh] of [[-0.6, 0.6, 0.3], [-0.6, 0.2, 0.62]]) { const a = P(u0, -0.4), b = P(u1, 0.4); bag.add('limestone', box(Math.min(a[0], b[0]), y, Math.min(a[1], b[1]), Math.max(a[0], b[0]), y + hh, Math.max(a[1], b[1]))); }
  col.circle(x, z, 0.7, y, y + 0.65);
}
function hitchingRail(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, c = Math.cos(el.rot ?? 0), s = Math.sin(el.rot ?? 0), L = el.len ?? 3;
  const P = (u) => [x + u * c, z - u * s];
  for (const u of [-L / 2, L / 2]) { const p = P(u); bag.add('timber', box(p[0] - 0.07, y, p[1] - 0.07, p[0] + 0.07, y + 1.15, p[1] + 0.07)); }
  const a = P(-L / 2), b = P(L / 2);
  bag.add('timber', rod([a[0], y + 1.0, a[1]], [b[0], y + 1.0, b[1]], 0.05, 6));
  bag.add('timber', rod([a[0], y + 0.6, a[1]], [b[0], y + 0.6, b[1]], 0.04, 6));
  for (const p of [a, b]) col.circle(p[0], p[1], 0.12, y, y + 1.15);
}

Object.assign(STYLES.gothic.elements, { court_ground: courtGround, may_tree: mayTree, mounting_block: mountingBlock, hitching_rail: hitchingRail });
