// Petra — what stands on the street and in the squares (docs/settlements/petra.md §18): the shop fronts' awnings, shutters and
// racks; the north portico's wall niches with their baetyls and its dedication slabs; the benches, the baetyl shrines, the
// basins with their spouts; the Nymphaeum that ends the colonnaded street on the east. Merged geometry from a place `at`, a
// heading `rot` (the placer's: local +z toward world (sin rot, cos rot)) and, for the props, a `kind`.

import { orientedBox } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';

const A = 'sandstone_rose_ashlar', R = 'sandstone_rose', W = 'sandstone_white';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A local frame at `at` turned by `rot`: P(u, v) the world point u across (local x), v out (local z). */
function frame(at, rot) {
  const c = Math.cos(rot), s = Math.sin(rot);
  const P = (u, v) => [at[0] + u * c + v * s, at[1] - u * s + v * c];
  /** an oriented slab across u0…u1, v0…v1, y0…y1 (the collider optional) */
  const B = (bag, col, mat, u0, v0, u1, v1, y0, y1, solid = false) => {
    const a = P(u0, (v0 + v1) / 2), b = P(u1, (v0 + v1) / 2), th = Math.abs(v1 - v0);
    bag.add(mat, orientedBox(a, b, th, y0, y1));
    if (solid) col.segment(a, b, th, y0, y1);
  };
  return { P, B };
}

const STRIPES = { incense: ['cloth_ochre', 'cloth_white'], spice: ['cloth_red', 'cloth_ochre'], potter: ['cloth_brown', 'cloth_ochre'], cloth: ['cloth_indigo', 'cloth_white'], oil: ['cloth_white', 'cloth_brown'], grain: ['cloth_ochre', 'cloth_brown'] };
/** petra_front: { at (the door's middle on the shop's front wall), rot (facing the street), dw (the door's width), trade, seed, y (the portico floor) }. */
export function front(el, { bag, col }) {
  const rand = rng(el.seed), { P, B } = frame(el.at, el.rot ?? 0), y = el.y ?? 0.45, dw = el.dw ?? 2.2, W2 = dw / 2 + 0.75, out = 1.45;
  const [c1, c2] = STRIPES[el.trade] ?? STRIPES.cloth;
  // the awning: a cloth sloping from the wall's face (3.55) down to its front edge (2.95), in stripes, a scalloped valance, two poles
  const ns = 6, yb = y + 3.55, yf = y + 2.95, tilt = Math.atan2(yb - yf, out), M = new Matrix4().makeRotationY(el.rot ?? 0).setPosition(el.at[0], 0, el.at[1]);
  for (let i = 0; i < ns; i++) {
    const u0 = -W2 + 2 * W2 * i / ns, u1 = -W2 + 2 * W2 * (i + 1) / ns, m = i % 2 ? c2 : c1;
    // (a closed slab: the walkers' footing reads an open sheet over the way as a roof's slope)
    const g = box(u0, -0.025, 0, u1, 0.025, out / Math.cos(tilt)); g.rotateX(tilt); g.translate(0, yb, 0.02); g.applyMatrix4(M); bag.add(m, g);
    const v = box(u0, yf - 0.24, out - 0.01, u1, yf - 0.02, out + 0.02); v.applyMatrix4(M); bag.add(m, v);
  }
  for (const s of [-1, 1]) { const [px, pz] = P(s * (W2 - 0.1), out - 0.05); bag.add('timber', box(px - 0.05, y, pz - 0.05, px + 0.05, yf + 0.05, pz + 0.05)); col.circle(px, pz, 0.12, y, yf); }
  // the plank shutters taken down and stood against the wall either side of the door, a stone block as a seat
  for (const s of [-1, 1]) {
    const u = s * (dw / 2 + 0.55);
    B(bag, col, 'timber', u - 0.3, 0.02, u + 0.3, 0.1, y, y + 2.1);
    B(bag, col, 'timber', u + s * 0.08 - 0.3, 0.1, u + s * 0.08 + 0.3, 0.17, y, y + 1.9);
    for (const yy of [0.5, 1.5]) B(bag, col, 'iron', u - 0.3, 0.17, u + 0.3, 0.2, y + yy, y + yy + 0.05);
  }
  // a hanging bar under the awning with the trade's goods on it
  const yr = y + 2.55;
  B(bag, col, 'timber', -dw / 2 - 0.2, 0.55, dw / 2 + 0.2, 0.6, yr, yr + 0.04);
  for (const s of [-1, 1]) B(bag, col, 'timber', s * (dw / 2 + 0.2) - 0.02, 0.0, s * (dw / 2 + 0.2) + 0.02, 0.6, yr, yr + 0.04);
  const n = 5 + Math.floor(rand() * 3);
  for (let i = 0; i < n; i++) {
    const u = -dw / 2 + 0.1 + (dw - 0.2) * (i + 0.5) / n, [hx, hz] = P(u, 0.58);
    if (el.trade === 'potter') bag.add(rand() < 0.5 ? 'terracotta' : 'pottery_dark', lathe([[0.12, 0], [0.16, 0.1], [0.08, 0.2], [0.001, 0.2]], 8, null, hx, yr - 0.22, hz));
    else if (el.trade === 'cloth') bag.add(['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white'][i % 4], box(hx - 0.12, yr - 0.7 - rand() * 0.3, hz - 0.015, hx + 0.12, yr, hz + 0.015));
    else if (el.trade === 'incense' || el.trade === 'spice') bag.add(['cloth_green', 'cloth_ochre', 'cloth_brown'][i % 3], lathe([[0.001, 0], [0.07, 0.1], [0.05, 0.3], [0.001, 0.36]], 6, null, hx, yr - 0.34, hz));
    else bag.add('wicker', lathe([[0.1, 0], [0.14, 0.12], [0.001, 0.14]], 8, null, hx, yr - 0.16, hz));
  }
}

/**
 * petra_prop: { at, rot, kind, seed, y } —
 *   'shrine': a stepped platform with three baetyls (blocks of the god's stone, the middle the tallest), an offering table, an incense bowl;
 *   'bench': a stone bench (len, back) ; 'basin': a trough on a plinth with a lion-head spout and its water; 'stele': a dedication slab with lines of letters cut in it;
 *   'niche': a niche in a wall with its baetyl (on the wall's face at `at`, facing out along rot).
 */
export function prop(el, { bag, col }) {
  const rand = rng(el.seed ?? 1), { P, B } = frame(el.at, el.rot ?? 0), y = el.y ?? 0, k = el.kind;
  if (k === 'shrine') {
    B(bag, col, A, -2.2, -1.6, 2.2, 1.6, y - 0.4, y + 0.14, true); B(bag, col, A, -1.8, -1.2, 1.8, 1.2, y + 0.14, y + 0.3, true);
    for (const [u, h, w] of [[-1.0, 1.3, 0.4], [0, 1.9, 0.5], [1.0, 1.1, 0.38]]) { B(bag, col, R, u - w / 2, -0.55, u + w / 2, -0.55 + w * 0.8, y + 0.3, y + 0.3 + h, true); B(bag, col, W, u - w / 2 - 0.08, -0.6, u + w / 2 + 0.08, -0.55 + w * 0.8 + 0.08, y + 0.28, y + 0.42); }
    B(bag, col, A, -0.5, 0.35, 0.5, 0.85, y + 0.3, y + 0.82, true);
    const [bx, bz] = P(0, 0.6); bag.add('bronze', lathe([[0.2, 0], [0.16, 0.05], [0.12, 0.12], [0.001, 0.12]], 10, null, bx, y + 0.82, bz));
  } else if (k === 'bench') {
    const L = el.len ?? 2.4;
    B(bag, col, A, -L / 2, -0.22, L / 2, 0.22, y + 0.38, y + 0.46, true); for (const s of [-1, 1]) B(bag, col, A, s * (L / 2 - 0.2) - 0.1, -0.2, s * (L / 2 - 0.2) + 0.1, 0.2, y - 0.1, y + 0.38, true);
    if (el.back) B(bag, col, A, -L / 2, 0.16, L / 2, 0.22, y + 0.46, y + 0.9);
  } else if (k === 'basin') {
    B(bag, col, R, -1.1, -0.45, 1.1, 0.45, y, y + 0.7, true);
    B(bag, col, W, -1.14, -0.49, 1.14, -0.34, y + 0.69, y + 0.78); B(bag, col, W, -1.14, 0.34, 1.14, 0.49, y + 0.69, y + 0.78);
    B(bag, col, W, -1.14, -0.49, -0.99, 0.49, y + 0.69, y + 0.78); B(bag, col, W, 0.99, -0.49, 1.14, 0.49, y + 0.69, y + 0.78);
    B(bag, col, 'water', -1.0, -0.35, 1.0, 0.35, y + 0.68, y + 0.685);
    B(bag, col, A, -0.25, 0.4, 0.25, 0.6, y + 0.7, y + 1.7, true); B(bag, col, A, -0.4, 0.3, 0.4, 0.7, y + 1.7, y + 1.85);
    B(bag, col, 'water_jet', -0.03, 0.2, 0.03, 0.26, y + 0.7, y + 1.45);
  } else if (k === 'stele') {
    B(bag, col, W, -0.45, -0.1, 0.45, 0.1, y + 0.35, y + 1.7, true); B(bag, col, A, -0.6, -0.25, 0.6, 0.25, y - 0.1, y + 0.35, true);
    for (let i = 0; i < 4; i++) B(bag, col, 'sandstone_red', -0.33, 0.1, 0.33 - rand() * 0.2, 0.115, y + 0.7 + i * 0.22, y + 0.75 + i * 0.22);
    B(bag, col, W, -0.5, -0.12, 0.5, 0.12, y + 1.7, y + 1.78);
  } else if (k === 'lampstand') {
    // a bronze stand: a round foot, the shaft with its rings, a dish at the top with the lamp's flame
    const [x, z] = el.at;
    bag.add('bronze', lathe([[0.24, 0], [0.22, 0.05], [0.07, 0.12], [0.04, 0.3], [0.05, 0.5], [0.035, 0.7], [0.035, 1.25], [0.07, 1.34], [0.2, 1.42], [0.18, 1.46], [0.001, 1.44]], 12, null, x, y, z));
    bag.add('lamp_white', lathe([[0.05, 0], [0.03, 0.08], [0.001, 0.12]], 6, null, x, y + 1.45, z));
    col.circle(x, z, 0.24, y, y + 1.5);
  } else if (k === 'brazier') {
    // a bowl of bronze on three legs, the coals and the incense smoking above them
    const [x, z] = el.at;
    bag.add('bronze', lathe([[0.001, 0.62], [0.2, 0.64], [0.38, 0.78], [0.4, 0.86], [0.36, 0.86], [0.18, 0.7], [0.001, 0.68]], 14, null, x, y, z));
    for (let i = 0; i < 3; i++) { const a = i * 2.094 + 0.4; bag.add('bronze', box(x + Math.cos(a) * 0.2 - 0.025, y, z + Math.sin(a) * 0.2 - 0.025, x + Math.cos(a) * 0.2 + 0.025, y + 0.66, z + Math.sin(a) * 0.2 + 0.025)); }
    bag.add('flame', lathe([[0.22, 0], [0.12, 0.08], [0.001, 0.14]], 8, null, x, y + 0.78, z));
    col.circle(x, z, 0.42, y, y + 0.9);
  } else if (k === 'table') {
    // a stone offering table: a slab on two block legs, a bowl and a cluster of small vessels
    B(bag, col, A, -0.55, -0.3, 0.55, 0.3, y + 0.82, y + 0.9, true); for (const s2 of [-1, 1]) B(bag, col, A, s2 * 0.4 - 0.1, -0.24, s2 * 0.4 + 0.1, 0.24, y, y + 0.82, true);
    const [x, z] = P(0.1, 0); bag.add('terracotta', lathe([[0.001, 0], [0.12, 0.01], [0.17, 0.08], [0.15, 0.09], [0.1, 0.03], [0.001, 0.025]], 10, null, x, y + 0.9, z));
    const [x2, z2] = P(-0.3, 0.05); bag.add('pottery_dark', lathe([[0.06, 0], [0.08, 0.07], [0.04, 0.14], [0.001, 0.14]], 8, null, x2, y + 0.9, z2));
  } else if (k === 'niche') {
    // a pilastered frame on the wall with a lintel, crow-steps, a baetyl on a ledge in the dark behind
    const h = el.h ?? 2.4;
    B(bag, col, 'opening', -0.55, 0.0, 0.55, 0.02, y + 0.5, y + 0.5 + h);
    for (const s of [-1, 1]) B(bag, col, W, s * 0.7 - 0.12, 0.0, s * 0.7 + 0.12, 0.12, y + 0.4, y + 0.5 + h + 0.25);
    B(bag, col, W, -0.85, 0.0, 0.85, 0.14, y + 0.5 + h, y + 0.5 + h + 0.28); B(bag, col, W, -0.55, 0.0, 0.55, 0.14, y + 0.5 + h + 0.28, y + 0.5 + h + 0.46); B(bag, col, W, -0.25, 0.0, 0.25, 0.14, y + 0.5 + h + 0.46, y + 0.5 + h + 0.62);
    B(bag, col, A, -0.6, 0.0, 0.6, 0.35, y + 0.4, y + 0.5);
    B(bag, col, R, -0.18, 0.05, 0.18, 0.3, y + 0.5, y + 1.55);
  }
}

/**
 * petra_nymph: { at (the middle of the front's foot), rot (facing out), w, y } (docs/settlements/petra.md §18): the Nymphaeum at the
 * street's east end — a long basin with its water, two steps, a back wall of ashlar 7.4 m high with five niches (each with its
 * base for a statue), pilasters between, a cornice, lion-head spouts above the basin, a little flat roof behind a parapet.
 */
export function nymph(el, { bag, col }) {
  const { P, B } = frame(el.at, el.rot ?? 0), y = el.y ?? 0, w = el.w ?? 15, H = 7.4;
  B(bag, col, A, -w / 2 - 1, 3.0, w / 2 + 1, 3.9, y - 0.4, y + 0.2, true);                                  // the paved ledge behind the basin
  B(bag, col, A, -w / 2 - 0.6, 0.3, w / 2 + 0.6, 1.0, y - 0.4, y + 0.2, true);                               // the step before it
  // the basin: stone walls 0.8 high, the water 0.15 below the rim
  B(bag, col, R, -w / 2, 1.0, w / 2, 3.0, y, y + 0.8, true);
  B(bag, col, 'water', -w / 2 + 0.25, 1.25, w / 2 - 0.25, 2.75, y + 0.64, y + 0.645);
  for (const [u0, v0, u1, v1] of [[-w / 2, 0.9, w / 2, 1.2], [-w / 2, 2.8, w / 2, 3.1], [-w / 2 - 0.1, 0.9, -w / 2 + 0.2, 3.1], [w / 2 - 0.2, 0.9, w / 2 + 0.1, 3.1]]) B(bag, col, W, u0, v0, u1, v1, y + 0.8, y + 0.88);
  // the back wall, its niches and pilasters
  B(bag, col, A, -w / 2 - 0.4, 3.9, w / 2 + 0.4, 5.1, y - 0.4, y + H, true);
  B(bag, col, A, -w / 2 - 0.55, 3.8, w / 2 + 0.55, 5.1, y + H - 0.1, y + H + 0.45);
  B(bag, col, W, -w / 2 - 0.7, 3.7, w / 2 + 0.7, 5.1, y + H + 0.45, y + H + 0.7);
  B(bag, col, A, -w / 2 - 0.4, 4.7, w / 2 + 0.4, 5.1, y + H + 0.7, y + H + 1.15);
  const nn = 5, sp = w / nn;
  for (let i = 0; i < nn; i++) {
    const u = -w / 2 + sp * (i + 0.5);
    B(bag, col, 'opening', u - 0.8, 3.86, u + 0.8, 3.92, y + 1.6, y + 5.0);
    B(bag, col, W, u - 1.0, 3.8, u + 1.0, 3.9, y + 5.0, y + 5.25); B(bag, col, W, u - 0.5, 3.8, u + 0.5, 3.9, y + 5.25, y + 5.45);
    B(bag, col, R, u - 0.55, 3.45, u + 0.55, 3.9, y + 0.2, y + 1.6);                                             // the statue's base
    B(bag, col, 'marble', u - 0.2, 3.55, u + 0.2, 3.85, y + 1.6, y + 3.2);                                      // the statue (a figure in the round of marble, reduced)
    { const [px, pz] = P(u, 3.7); bag.add('marble', lathe([[0.001, 0], [0.16, 0.05], [0.1, 0.3], [0.001, 0.34]], 8, null, px, y + 3.2, pz)); }
    // the spout: a lion's head over the basin, the stream falling
    if (i < nn - 1) {
      const um = u + sp / 2;
      B(bag, col, W, um - 0.25, 3.78, um + 0.25, 3.9, y + 0.4, y + 5.2);                                          // the pilaster
      B(bag, col, W, um - 0.18, 3.5, um + 0.18, 3.78, y + 0.95, y + 1.3);                                         // the lion's head
      B(bag, col, 'water_jet', um - 0.025, 3.3, um + 0.025, 3.36, y + 0.66, y + 1.15);
    }
  }
  for (const s of [-1, 1]) B(bag, col, W, s * (w / 2 + 0.25) - 0.3, 3.75, s * (w / 2 + 0.25) + 0.3, 3.9, y + 0.4, y + 5.2);
}
