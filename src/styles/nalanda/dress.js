// Nalanda — the dressing of the way and the village, the annexes of the monasteries, the gate (docs/settlements/nalanda.md §12–§14).
// Small things set at eye level: lamp pillars, booths of flower-sellers and potters, the water-sheds (jal-shalas) of the pilgrims,
// benches of brick (otla) at the monasteries' fronts, dung-cake stacks, clay grain bins, wattle fences, charpoys, tulsi platforms,
// the potter's kiln; the kitchens, refectories, granaries and infirmaries on the lanes east of the monasteries; the southern gate.
// Built from the style's own helpers (handed in by index.js: they are defined there).
import { orientedBox, subtractRects } from '../../core/build.js';
import { box, lathe, frustum } from '../../core/geom.js';

const BR = 'brick', BRB = 'brick_baked', PL = 'lime_plaster', TB = 'timber';
const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };

/** The frame of a standing thing: a along its front, b away from the buyer's side (into the seller's), facing 'w' | 'e' | 'n' | 's'. */
function frame(x, z, face) {
  const m = { w: [[0, 1], [1, 0]], e: [[0, 1], [-1, 0]], n: [[1, 0], [0, 1]], s: [[-1, 0], [0, -1]] }[face || 'w'];
  const P = (a, b) => [x + m[0][0] * a + m[1][0] * b, z + m[0][1] * a + m[1][1] * b];
  const R = (a0, b0, a1, b1) => { const p = P(a0, b0), q = P(a1, b1); return [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; };
  return { P, R };
}
const POT = [[0.001, 0], [0.12, 0.02], [0.2, 0.14], [0.21, 0.26], [0.14, 0.38], [0.1, 0.42], [0.12, 0.46], [0.001, 0.46]];
const heap = (bag, mat, x, y, z, r, h) => bag.add(mat, lathe([[r, 0], [r * 0.8, h * 0.35], [r * 0.45, h * 0.75], [0.001, h]], 8, null, x, y, z));

export default function make(H) {
  const { B, wallGaps, votiveStupa, buddha } = H;

  // ── the way's furniture ──────────────────────────────────────────────────────
  /** Lamp pillars { at: [[x, z]] }: a brick shaft on a base with a bowl of oil at the top and its flame; lit at night. */
  function lamps(el, ctx) {
    const { bag, col } = ctx;
    for (const [x, z] of el.at) {
      B(bag, BRB, x - 0.36, 0, z - 0.36, x + 0.36, 0.5, z + 0.36);
      B(bag, BR, x - 0.22, 0.5, z - 0.22, x + 0.22, 1.9, z + 0.22);
      B(bag, PL, x - 0.26, 1.2, z - 0.26, x + 0.26, 1.3, z + 0.26);
      B(bag, BRB, x - 0.36, 1.9, z - 0.36, x + 0.36, 2.05, z + 0.36);
      bag.add('terracotta', lathe([[0.001, 0], [0.16, 0], [0.3, 0.12], [0.26, 0.15], [0.001, 0.09]], 10, null, x, 2.05, z));
      B(bag, 'flame', x - 0.03, 2.12, z - 0.03, x + 0.03, 2.28, z + 0.03);
      col.rect([x - 0.38, z - 0.38, x + 0.38, z + 0.38], 0, 2.1);
    }
  }

  /** Booths { at: [[x, z, face, kind, seed]] }: a hipped thatch awning on four posts over a counter of timber, the goods of the kind
   *  ('flowers' | 'lamps' | 'pots' | 'grain' | 'cloth' | 'veg') on it and on the ground, a mat for the seller behind. */
  function booths(el, ctx) {
    const { bag, col } = ctx;
    for (const [x, z, face, kind, seed] of el.at) {
      const { P, R } = frame(x, z, face), r = rng(seed ?? 1), Bx = (m, a0, b0, a1, b1, y0, y1) => { const q = R(a0, b0, a1, b1); bag.add(m, box(q[0], y0, q[1], q[2], y1, q[3])); };
      for (const a of [-1.35, 1.35]) for (const b of [-0.35, 2.1]) { Bx(TB, a - 0.05, b - 0.05, a + 0.05, b + 0.05, 0, 2.2); const q = R(a - 0.06, b - 0.06, a + 0.06, b + 0.06); col.rect(q, 0, 2.2); }
      const rr = R(-1.75, -0.8, 1.75, 2.55);
      bag.add('thatch', frustum(rr, 2.2, 2.75, 0.95, 0.95, 0.95, 0.95));
      Bx(TB, -1.4, -0.3, 1.4, 2.15, 2.15, 2.22);
      Bx(TB, -1.25, 0.05, 1.25, 0.72, 0.0, 0.8); col.rect(R(-1.25, 0.05, 1.25, 0.72), 0, 0.8);
      Bx('cloth_white', -1.25, 0.05, 1.25, 0.72, 0.8, 0.82);
      Bx('reed_mat', -1.0, 1.0, 1.0, 1.9, 0, 0.03);
      const put = (a, b, y) => { const p = P(a, b); return [p[0], y, p[1]]; };
      if (kind === 'flowers') {
        const mats = ['cloth_red', 'cloth_ochre', 'cloth_white', 'cloth_red', 'cloth_ochre'];
        for (let k = 0; k < 5; k++) { const [px, py, pz] = put(-1.0 + k * 0.5, 0.38, 0.82); heap(bag, mats[(k + Math.floor(r() * 3)) % 5], px, py, pz, 0.22, 0.2 + r() * 0.08); }
        for (let k = 0; k < 3; k++) { const [px, py, pz] = put(-0.8 + k * 0.8, 1.3, 0.03); bag.add('wicker', lathe([[0.3, 0], [0.34, 0.12], [0.3, 0.2], [0.001, 0.2]], 8, null, px, py, pz)); heap(bag, mats[k], px, py + 0.18, pz, 0.26, 0.16); }
      } else if (kind === 'lamps') {
        for (let k = 0; k < 14; k++) { const [px, py, pz] = put(-1.1 + (k % 7) * 0.37, 0.2 + Math.floor(k / 7) * 0.3, 0.82); bag.add('terracotta', lathe([[0.001, 0], [0.07, 0], [0.09, 0.03], [0.001, 0.025]], 6, null, px, py, pz)); }
        for (let k = 0; k < 4; k++) { const q = R(-0.9 + k * 0.6, 0.5, -0.85 + k * 0.6, 0.55); bag.add('bamboo_culm', box(q[0], 0.82, q[1], q[2], 1.25, q[3])); }
        for (let k = 0; k < 3; k++) { const [px, py, pz] = put(-0.7 + k * 0.7, 1.4, 0); bag.add('terracotta', lathe(POT, 8, null, px, py, pz)); }
      } else if (kind === 'pots') {
        for (let k = 0; k < 4; k++) { const [px, py, pz] = put(-1.05 + k * 0.7, 0.4, 0.8); bag.add('terracotta', lathe(POT.map(([a, b]) => [a * 1.1, b * 1.1]), 8, null, px, py, pz)); }
        for (let k = 0; k < 5; k++) { const [px, py, pz] = put(-1.2 + k * 0.6, 1.3 + (k % 2) * 0.25, 0); bag.add(k % 2 ? 'pottery_dark' : 'terracotta', lathe(POT.map(([a, b]) => [a * 1.5, b * 1.6]), 8, null, px, py, pz)); }
        for (let k = 0; k < 3; k++) { const [px, py, pz] = put(-0.5 + k * 0.5, 1.7, 0); bag.add('terracotta', lathe(POT, 8, null, px, py + 0.0, pz)); }
      } else if (kind === 'grain') {
        const mats = ['sacking', 'cloth_ochre', 'earth_wall', 'cloth_brown'];
        for (let k = 0; k < 4; k++) { const [px, py, pz] = put(-0.95 + k * 0.63, 0.38, 0.82); heap(bag, mats[k], px, py, pz, 0.28, 0.24 + r() * 0.06); }
        const q = R(-0.5, 0.2, 0.5, 0.25); bag.add(TB, box(q[0], 1.0, q[1], q[2], 1.04, q[3]));
        for (let k = 0; k < 3; k++) { const [px, py, pz] = put(-0.9 + k * 0.9, 1.4, 0); bag.add('sacking', lathe([[0.3, 0], [0.34, 0.25], [0.26, 0.55], [0.12, 0.6], [0.001, 0.6]], 8, null, px, py, pz)); }
      } else if (kind === 'cloth') {
        const m4 = ['cloth_red', 'cloth_indigo', 'cloth_white', 'cloth_ochre', 'cloth_green', 'cloth_maroon'];
        for (let k = 0; k < 4; k++) for (let j = 0; j < 3; j++) Bx(m4[(k + j * 2) % 6], -1.15 + k * 0.6, 0.12, -0.7 + k * 0.6, 0.62, 0.82 + j * 0.09, 0.9 + j * 0.09);
        for (let k = 0; k < 5; k++) { const q = R(-1.2 + k * 0.55, 1.95, -1.15 + k * 0.55, 2.0); bag.add(m4[(k * 5) % 6], box(q[0], 0.7 + (k % 2) * 0.05, q[1], q[2], 1.9, q[3])); }
      } else {                                                                                  // veg
        const mats = ['lotus_leaf', 'cloth_red', 'lotus_leaf', 'cloth_ochre'];
        for (let k = 0; k < 4; k++) { const [px, py, pz] = put(-0.95 + k * 0.63, 0.38, 0.82); heap(bag, mats[k], px, py, pz, 0.28, 0.22); }
        for (let k = 0; k < 3; k++) { const [px, py, pz] = put(-0.8 + k * 0.8, 1.35, 0); bag.add('wicker', lathe([[0.3, 0], [0.38, 0.16], [0.34, 0.26], [0.001, 0.26]], 8, null, px, py, pz)); heap(bag, mats[k + 1], px, py + 0.22, pz, 0.3, 0.2); }
      }
    }
  }

  /** Water-sheds { at: [[x, z, face]] }: a thatched roof on posts over a brick shelf of water pots, a bench before it. */
  function jal(el, ctx) {
    const { bag, col } = ctx;
    for (const [x, z, face] of el.at) {
      const { P, R } = frame(x, z, face), Bx = (m, a0, b0, a1, b1, y0, y1) => { const q = R(a0, b0, a1, b1); bag.add(m, box(q[0], y0, q[1], q[2], y1, q[3])); };
      for (const a of [-1.6, 1.6]) for (const b of [0, 2.2]) { Bx(TB, a - 0.07, b - 0.07, a + 0.07, b + 0.07, 0, 2.4); col.rect(R(a - 0.08, b - 0.08, a + 0.08, b + 0.08), 0, 2.4); }
      bag.add('thatch', frustum(R(-2.0, -0.5, 2.0, 2.7), 2.4, 3.05, 1.1, 1.1, 1.1, 1.1));
      Bx(TB, -1.7, -0.2, 1.7, 2.4, 2.35, 2.42);
      Bx(BR, -1.5, 1.55, 1.5, 2.1, 0, 0.8); Bx(BRB, -1.55, 1.5, 1.55, 2.15, 0.8, 0.88); col.rect(R(-1.55, 1.5, 1.55, 2.15), 0, 0.88);
      for (let k = 0; k < 6; k++) { const p = P(-1.2 + k * 0.48, 1.8); bag.add(k % 3 === 1 ? 'pottery_dark' : 'terracotta', lathe(POT.map(([a, b]) => [a * 1.15, b * 1.15]), 8, null, p[0], 0.88, p[1])); }
      Bx(TB, -1.2, 0.3, 1.2, 0.75, 0.38, 0.44); for (const a of [-1.1, 1.1]) Bx(TB, a - 0.04, 0.35, a + 0.04, 0.7, 0, 0.38);
      col.rect(R(-1.2, 0.3, 1.2, 0.75), 0, 0.44);
      const p = P(0, 1.0); bag.add('terracotta', lathe(POT.map(([a, b]) => [a * 1.9, b * 1.8]), 10, null, p[0], 0, p[1]));
    }
  }

  /** Benches of brick against a wall { runs: [[ax, az, bx, bz, depth]] }: the otla, a plaster top, a few pots and a mat. */
  function otlas(el, ctx) {
    const { bag, col } = ctx, r = rng(el.seed ?? 3);
    for (const [ax, az, bx, bz, d] of el.runs) {
      bag.add(BR, orientedBox([ax, az], [bx, bz], d, 0, 0.42, 0));
      bag.add(PL, orientedBox([ax, az], [bx, bz], d + 0.08, 0.42, 0.5, 0.04));
      col.segment([ax, az], [bx, bz], d, 0, 0.5);
      const L = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / L, (bz - az) / L];
      for (let s = 1.2; s < L - 0.8; s += 2.4 + r() * 1.6) {
        const p = [ax + u[0] * s, az + u[1] * s], k = r();
        if (k < 0.35) bag.add('reed_mat', orientedBox([p[0] - u[0] * 0.6, p[1] - u[1] * 0.6], [p[0] + u[0] * 0.6, p[1] + u[1] * 0.6], d * 0.7, 0.5, 0.53, 0));
        else if (k < 0.7) bag.add('terracotta', lathe(POT, 8, null, p[0], 0.5, p[1]));
        else bag.add('wicker', lathe([[0.2, 0], [0.24, 0.1], [0.2, 0.16], [0.001, 0.16]], 8, null, p[0], 0.5, p[1]));
      }
    }
  }

  // ── the village ──────────────────────────────────────────────────────────────
  /** Village things { items: [{ k, x, z, ... }] }: dung-cake stacks, clay grain bins, wattle fences, charpoys, tulsi platforms, pot stacks, the kiln. */
  function village(el, ctx) {
    const { bag, col } = ctx;
    for (const it of el.items) {
      const { k, x, z } = it, s = it.s ?? 1;
      if (k === 'dung') {
        bag.add('earth_wall', lathe([[0.62 * s, 0], [0.58 * s, 0.25 * s], [0.38 * s, 0.55 * s], [0.12 * s, 0.7 * s], [0.001, 0.72 * s]], 9, null, x, 0, z));
        col.circle(x, z, 0.6 * s, 0, 0.7 * s);
      } else if (k === 'kothi') {
        bag.add('earth_wall', lathe([[0.45 * s, 0], [0.6 * s, 0.3 * s], [0.62 * s, 0.7 * s], [0.46 * s, 1.05 * s], [0.3 * s, 1.12 * s], [0.001, 1.12 * s]], 10, null, x, 0.12, z));
        B(bag, 'brick', x - 0.5 * s, 0, z - 0.5 * s, x + 0.5 * s, 0.14, z + 0.5 * s);
        bag.add('thatch', lathe([[0.55 * s, 0], [0.4 * s, 0.14 * s], [0.12 * s, 0.34 * s], [0.001, 0.46 * s]], 9, null, x, 1.22 * s, z));
        col.circle(x, z, 0.62 * s, 0, 1.5 * s);
      } else if (k === 'fence') {
        const [ax, az, bx, bz] = it.seg, L = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / L, (bz - az) / L], n = Math.max(1, Math.round(L / 1.3));
        for (let i = 0; i <= n; i++) { const px = ax + u[0] * L * i / n, pz = az + u[1] * L * i / n; B(bag, TB, px - 0.04, 0, pz - 0.04, px + 0.04, 1.2, pz + 0.04); }
        bag.add('wicker', orientedBox([ax, az], [bx, bz], 0.06, 0.15, 1.1, 0));
        bag.add('bamboo_culm', orientedBox([ax, az], [bx, bz], 0.09, 1.1, 1.18, 0));
        col.segment([ax, az], [bx, bz], 0.1, 0, 1.2);
      } else if (k === 'charpoy') {
        const al = it.rot ? [0.45, 0.95] : [0.95, 0.45];
        const x0 = x - al[0], x1 = x + al[0], z0 = z - al[1], z1 = z + al[1];
        for (const [a, b] of [[x0, z0], [x1 - 0.06, z0], [x0, z1 - 0.06], [x1 - 0.06, z1 - 0.06]]) B(bag, TB, a, 0, b, a + 0.06, 0.42, b + 0.06);
        B(bag, TB, x0, 0.38, z0, x1, 0.44, z1);
        B(bag, it.cloth ?? 'cloth_white', x0 + 0.06, 0.44, z0 + 0.06, x1 - 0.06, 0.47, z1 - 0.06);
        col.rect([x0, z0, x1, z1], 0, 0.47);
      } else if (k === 'tulsi') {
        B(bag, BR, x - 0.4, 0, z - 0.4, x + 0.4, 0.45, z + 0.4); B(bag, PL, x - 0.44, 0.45, z - 0.44, x + 0.44, 0.52, z + 0.44);
        bag.add('lotus_leaf', lathe([[0.001, 0], [0.22, 0.05], [0.28, 0.25], [0.18, 0.5], [0.001, 0.58]], 8, null, x, 0.52, z));
        col.rect([x - 0.44, z - 0.44, x + 0.44, z + 0.44], 0, 0.52);
      } else if (k === 'potstack') {
        for (let i = 0; i < 4; i++) for (let j = 0; j < 4 - i; j++) bag.add(j % 2 ? 'pottery_dark' : 'terracotta', lathe(POT.map(([a, b]) => [a * 1.3, b * 1.2]), 8, null, x + (j - (3 - i) / 2) * 0.55, i * 0.5, z + (i % 2) * 0.1));
        col.rect([x - 1.2, z - 0.4, x + 1.2, z + 0.4], 0, 1.2);
      } else if (k === 'kiln') {
        bag.add('brick', lathe([[1.5, 0], [1.5, 0.9], [1.15, 1.5], [0.6, 1.85], [0.25, 1.95], [0.001, 1.95]], 12, null, x, 0, z));
        bag.add('plaster_streak', lathe([[1.52, 0.3], [1.52, 0.45], [1.5, 0.45], [1.5, 0.3]], 12, null, x, 0, z));
        B(bag, 'opening', x - 0.35, 0.1, z + 1.35, x + 0.35, 0.75, z + 1.62);
        col.circle(x, z, 1.55, 0, 2.0);
      } else if (k === 'haypile') {
        bag.add('thatch', lathe([[1.0 * s, 0], [0.95 * s, 0.4 * s], [0.6 * s, 0.95 * s], [0.2 * s, 1.3 * s], [0.001, 1.38 * s]], 10, null, x, 0, z));
        col.circle(x, z, 0.95 * s, 0, 1.4 * s);
      }
    }
  }

  // ── the annexes ──────────────────────────────────────────────────────────────
  /** An annex { rect, door ('n' | 's'), kind, seed }: a single hall of brick on a flat lime roof, the door on the lane side, windows high; furnished by kind
   *  ('kitchen' | 'refectory' | 'granary' | 'infirmary'). */
  function annex(el, ctx) {
    const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, r = rng(el.seed ?? 5), HT = 3.6, T = 0.6, dn = el.door === 'n', zd = dn ? z0 : z1;
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    bag.add('cotto_floor', frustum([x0, z0, x1, z1], -0.45, 0, 0, 0, 0, 0, { noBottom: true }));
    col.floor(el.rect, 0);
    const hole = (c, w, y0, y1) => ({ s0: c - w / 2, s1: c + w / 2, y0, y1 });
    // walls: the door in the lane side's middle, a window at either end of the long walls, a lintel over the door
    const dh = [hole((x1 - x0) / 2, 2.0, -0.2, 2.5)], wh = [hole(2.5, 0.9, 2.1, 3.0), hole((x1 - x0) - 2.5, 0.9, 2.1, 3.0), hole((x1 - x0) / 2, 0.9, 2.1, 3.0)];
    wallGaps(ctx, [x0, z0], [x1, z0], T, -0.1, HT, dn ? dh : wh); wallGaps(ctx, [x0, z1], [x1, z1], T, -0.1, HT, dn ? wh : dh);
    wallGaps(ctx, [x0, z0], [x0, z1], T, -0.1, HT, [hole((z1 - z0) / 2, 0.9, 2.1, 3.0)]); wallGaps(ctx, [x1, z0], [x1, z1], T, -0.1, HT, [hole((z1 - z0) / 2, 0.9, 2.1, 3.0)]);
    bag.add(TB, orientedBox([cx - 1.2, zd], [cx + 1.2, zd], T + 0.1, 2.5, 2.68, 0));
    bag.add('wood_dark', orientedBox([cx - 1.0, zd + (dn ? -0.34 : 0.34)], [cx - 1.0, zd + (dn ? -1.3 : 1.3)], 0.07, 0, 2.4, 0));        // a door leaf standing open
    for (const [a, b] of [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]) B(bag, BRB, Math.min(a, a + (a === x0 ? -0.15 : 0.15)), -0.1, Math.min(b, b + (b === z0 ? -0.15 : 0.15)), Math.max(a, a + (a === x0 ? -0.15 : 0.15)), HT + 0.1, Math.max(b, b + (b === z0 ? -0.15 : 0.15)));
    // the roof: a flat slab with a parapet, beams under it
    B(bag, PL, x0 - 0.3, HT, z0 - 0.3, x1 + 0.3, HT + 0.3, z1 + 0.3);
    for (const q of subtractRects([x0 - 0.3, z0 - 0.3, x1 + 0.3, z1 + 0.3], [[x0 + 0.1, z0 + 0.1, x1 - 0.1, z1 - 0.1]])) B(bag, BR, q[0], HT + 0.3, q[1], q[2], HT + 0.85, q[3]);
    col.rect([x0 - 0.3, z0 - 0.3, x1 + 0.3, z1 + 0.3], HT - 0.1, HT + 0.9);
    for (let u = x0 + 1.4; u < x1 - 0.5; u += 1.4) B(bag, 'wood_dark', u - 0.1, HT - 0.28, z0 + T / 2, u + 0.1, HT - 0.02, z1 - T / 2);
    const IX0 = x0 + T / 2 + 0.2, IX1 = x1 - T / 2 - 0.2, IZ0 = z0 + T / 2 + 0.2, IZ1 = z1 - T / 2 - 0.2, back = dn ? IZ1 : IZ0, sgn = dn ? -1 : 1;
    const potAt = (x, z, k = 1, y = 0, m = 'terracotta') => bag.add(m, lathe(POT.map(([a, b]) => [a * k, b * k]), 8, null, x, y, z));
    if (el.kind === 'kitchen') {
      // three hearths of brick along the back wall, each with a great iron cauldron, a chimney through the roof; fuel and water at the side walls
      for (let i = 0; i < 3; i++) {
        const hx = IX0 + 2.0 + i * ((IX1 - IX0 - 4) / 2);
        const hz0 = dn ? back - 1.6 : back, hz1 = dn ? back : back + 1.6, hzc = (hz0 + hz1) / 2;
        B(bag, BR, hx - 0.9, 0, hz0, hx + 0.9, 0.8, hz1);
        bag.add('iron', lathe([[0.001, 0], [0.5, 0.03], [0.62, 0.3], [0.55, 0.5], [0.001, 0.5]], 10, null, hx, 0.8, hzc));
        B(bag, 'flame', hx - 0.12, 0.8, hzc - 0.7 * 0 + (dn ? 0.55 : -0.7), hx + 0.12, 0.9, hzc + (dn ? 0.7 : -0.55));
        B(bag, BR, hx - 0.35, 0.8, dn ? back - 0.7 : back + 0.35, hx + 0.35, HT + 1.6, dn ? back - 0.35 : back + 0.7);
        col.rect([hx - 0.9, hz0, hx + 0.9, hz1], 0, 1.0);
      }
      for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) bag.add(TB, orientedBox([IX0 + 0.1, cz - 2 + i * 0.28 + 0.0], [IX0 + 1.3, cz - 2 + i * 0.28], 0.22, j * 0.2, j * 0.2 + 0.2, 0));
      col.rect([IX0, cz - 2.2, IX0 + 1.4, cz - 0.7], 0, 0.8);
      for (let i = 0; i < 5; i++) potAt(IX1 - 0.5, IZ0 + 1.2 + i * 0.7 + (dn ? 1.8 : 0), 1.7, 0);
      col.rect([IX1 - 0.9, IZ0 + 1.0 + (dn ? 1.8 : 0), IX1, IZ0 + 4.7 + (dn ? 1.8 : 0)], 0, 0.8);
      B(bag, TB, cx - 1.8, 0.7, cz - 0.4, cx + 1.8, 0.78, cz + 0.4); for (const a of [-1.7, 1.7]) for (const b of [-0.35, 0.35]) B(bag, TB, cx + a - 0.04, 0, cz + b - 0.04, cx + a + 0.04, 0.7, cz + b + 0.04);
      col.rect([cx - 1.8, cz - 0.4, cx + 1.8, cz + 0.4], 0, 0.78);
      for (let i = 0; i < 4; i++) { bag.add('sacking', lathe([[0.3, 0], [0.34, 0.25], [0.26, 0.5], [0.001, 0.54]], 8, null, cx - 1.2 + i * 0.8, 0.78, cz)); }
    } else if (el.kind === 'refectory') {
      // rows of mats before long low boards; a serving table at the end with a great pot and ladles; a water stand
      for (let row = 0; row < 3; row++) {
        const zz = IZ0 + 2.2 + row * ((IZ1 - IZ0 - 4.4) / 2);
        B(bag, TB, IX0 + 3.0, 0.22, zz - 0.3, IX1 - 3.0, 0.28, zz + 0.3); col.rect([IX0 + 3.0, zz - 0.3, IX1 - 3.0, zz + 0.3], 0, 0.28);
        for (let k = 0; k < 8; k++) { const xx = IX0 + 3.6 + k * ((IX1 - IX0 - 7.2) / 7); bag.add('reed_mat', orientedBox([xx - 0.4, zz - 0.95], [xx + 0.4, zz - 0.95], 0.7, 0, 0.03, 0)); bag.add('reed_mat', orientedBox([xx - 0.4, zz + 0.95], [xx + 0.4, zz + 0.95], 0.7, 0, 0.03, 0)); }
        for (let k = 0; k < 8; k++) { const xx = IX0 + 3.6 + k * ((IX1 - IX0 - 7.2) / 7); bag.add('pottery_dark', lathe([[0.001, 0], [0.09, 0], [0.14, 0.05], [0.001, 0.05]], 8, null, xx, 0.28, zz)); }
      }
      B(bag, TB, IX0 + 0.2, 0.0, cz - 1.2, IX0 + 1.0, 0.85, cz + 1.2); col.rect([IX0 + 0.2, cz - 1.2, IX0 + 1.0, cz + 1.2], 0, 0.85);
      bag.add('iron', lathe([[0.001, 0], [0.4, 0.03], [0.5, 0.25], [0.42, 0.42], [0.001, 0.42]], 10, null, IX0 + 0.6, 0.85, cz));
      for (let i = 0; i < 3; i++) potAt(IX1 - 0.5, cz - 1.0 + i * 1.0, 1.8, 0);
    } else if (el.kind === 'granary') {
      // rows of great clay bins with thatch hoods, sacks between, a weighing beam
      for (let row = 0; row < 2; row++) for (let k = 0; k < 5; k++) {
        const bx = IX0 + 1.5 + k * ((IX1 - IX0 - 3) / 4), bz = row ? IZ1 - 1.2 : IZ0 + 1.2;
        bag.add('earth_wall', lathe([[0.55, 0], [0.8, 0.5], [0.82, 1.1], [0.6, 1.6], [0.42, 1.7], [0.001, 1.7]], 10, null, bx, 0.12, bz));
        B(bag, BR, bx - 0.6, 0, bz - 0.6, bx + 0.6, 0.14, bz + 0.6);
        bag.add('thatch', lathe([[0.66, 0], [0.48, 0.18], [0.14, 0.44], [0.001, 0.58]], 9, null, bx, 1.82, bz));
        col.circle(bx, bz, 0.85, 0, 2.2);
      }
      for (let i = 0; i < 9; i++) { const sx = cx - 2.5 + (i % 5) * 0.7, sz = cz - 0.5 + Math.floor(i / 5) * 0.8; bag.add(i % 2 ? 'sacking' : 'cloth_ochre', lathe([[0.3, 0], [0.34, 0.25], [0.26, 0.5], [0.12, 0.56], [0.001, 0.56]], 8, null, sx, 0, sz)); }
      col.rect([cx - 2.9, cz - 0.9, cx + 0.9, cz + 1.0], 0, 0.6);
      B(bag, TB, cx + 2.4, 0, cz - 0.05, cx + 2.5, 2.2, cz + 0.05); bag.add(TB, orientedBox([cx + 1.4, cz], [cx + 3.4, cz], 0.07, 2.1, 2.17, 0));
    } else {
      // the infirmary: beds along the walls with their cloth, a table with the jars of herbs, a brazier, a stand of vials
      for (let i = 0; i < 4; i++) for (const side of [0, 1]) {
        const bx = IX0 + 1.6 + i * ((IX1 - IX0 - 3.2) / 3), bz = side ? IZ1 - 1.0 : IZ0 + 1.0;
        B(bag, TB, bx - 0.5, 0.0, bz - 0.95 * 0.5, bx + 0.5, 0.4, bz + 0.5); B(bag, 'cloth_white', bx - 0.5, 0.4, bz - 0.47, bx + 0.5, 0.45, bz + 0.47); B(bag, i % 2 ? 'cloth_ochre' : 'cloth_indigo', bx - 0.5, 0.45, bz - 0.2 + (side ? 0.2 : -0.0), bx + 0.5, 0.48, bz + 0.47);
        col.rect([bx - 0.5, bz - 0.5, bx + 0.5, bz + 0.5], 0, 0.48);
      }
      B(bag, TB, cx - 1.8, 0.0, cz - 0.5, cx + 1.8, 0.8, cz + 0.5); col.rect([cx - 1.8, cz - 0.5, cx + 1.8, cz + 0.5], 0, 0.8);
      for (let k = 0; k < 8; k++) bag.add(k % 2 ? 'terracotta' : 'glaze_green', lathe([[0.001, 0], [0.1, 0], [0.12, 0.1], [0.08, 0.2], [0.001, 0.2]], 8, null, cx - 1.5 + k * 0.43, 0.8, cz + (k % 2 ? 0.15 : -0.15)));
      B(bag, BR, cx + 2.4, 0, cz - 0.4, cx + 3.1, 0.55, cz + 0.4); bag.add('iron', lathe([[0.001, 0], [0.26, 0], [0.3, 0.12], [0.001, 0.12]], 8, null, cx + 2.75, 0.55, cz)); col.rect([cx + 2.4, cz - 0.4, cx + 3.1, cz + 0.4], 0, 0.7);
    }
    void r;
  }

  // ── the southern gate ────────────────────────────────────────────────────────
  /** The gate of the enclosure { c: [x, z], half (the passage's), ww (the wall's length each side) }: two brick towers on either side of the way, a lintel
   *  and a parapet over the passage, walls of plastered brick running off to the west. */
  function gate(el, ctx) {
    const { bag, col } = ctx, [cx, cz] = el.c, hp = el.half, tw = 6.2, td = 8, HT = 7.2;
    for (const s of [-1, 1]) {
      const x0 = s < 0 ? cx - hp - tw : cx + hp, x1 = s < 0 ? cx - hp : cx + hp + tw, z0 = cz - td / 2, z1 = cz + td / 2;
      bag.add(BR, frustum([x0, z0, x1, z1], -0.4, HT, 0.12, 0.12, 0.12, 0.12));
      col.rect([x0, z0, x1, z1], 0, HT + 1);
      B(bag, BRB, x0 - 0.3, 0, z0 - 0.3, x1 + 0.3, 0.6, z1 + 0.3);
      B(bag, PL, x0 - 0.1, 3.0, z0 - 0.1, x1 + 0.1, 3.6, z1 + 0.1);
      B(bag, BRB, x0 - 0.4, HT - 0.4, z0 - 0.4, x1 + 0.4, HT, z1 + 0.4);
      bag.add('roof_tile', frustum([x0 - 0.6, z0 - 0.6, x1 + 0.6, z1 + 0.6], HT, HT + 1.9, 1.6, 1.6, 2.6, 2.6));
      bag.add(BRB, lathe([[0.4, 0], [0.3, 0.3], [0.001, 0.9]], 8, null, (x0 + x1) / 2, HT + 1.9, cz));
      // slit windows on the way side and on both faces
      for (const dz of [-1.8, 0, 1.8]) B(bag, 'opening', s < 0 ? x1 - 0.05 : x0 - 0.02, 4.4, cz + dz - 0.2, s < 0 ? x1 + 0.02 : x0 + 0.05, 5.6, cz + dz + 0.2);
      // the leaf of the gate standing open against the passage wall
      bag.add('wood_dark', orientedBox([s < 0 ? x1 + 0.05 : x0 - 0.05, cz - 1.0], [s < 0 ? x1 + 0.05 : x0 - 0.05, cz + 1.0], 0.12, 0, 0.1, 0));
    }
    // the lintel and the room over the passage
    const lx0 = cx - hp - 0.3, lx1 = cx + hp + 0.3;
    B(bag, 'wood_dark', lx0, 4.6, cz - td / 2 + 0.3, lx1, 5.0, cz + td / 2 - 0.3);
    B(bag, PL, lx0, 5.0, cz - td / 2 + 0.2, lx1, 5.5, cz + td / 2 - 0.2);
    B(bag, BR, lx0, 5.5, cz - td / 2 + 0.2, lx1, 6.4, cz - td / 2 + 0.7); B(bag, BR, lx0, 5.5, cz + td / 2 - 0.7, lx1, 6.4, cz + td / 2 - 0.2);
    for (const q of [[lx0, 5.0, cz - td / 2 + 0.2, lx1, 6.4, cz + td / 2 - 0.2]]) col.rect([q[0], q[2], q[3], q[5]], 4.6, q[4] + 0.1);
    // the walls running off westward
    wallGaps(ctx, [cx - hp - tw, cz], [cx - hp - tw - el.ww, cz], 1.0, -0.2, 3.6);
    bag.add(BRB, orientedBox([cx - hp - tw, cz], [cx - hp - tw - el.ww, cz], 1.3, 3.6, 3.8, 0));
    // the stupas and lamps flanking the passage
    for (const s of [-1, 1]) B(bag, BRB, cx + s * (hp + tw + 0.8) - 0.4, 0, cz + td / 2 + 0.6, cx + s * (hp + tw + 0.8) + 0.4, 0.3, cz + td / 2 + 1.4);
  }

  // ── the tank ────────────────────────────────────────────────────────────────
  /** Lotus { rect, level, n, seed, avoid: [[x0, z0, x1, z1]] }: floating leaves and a few flowers on the water of a tank. */
  function lotus(el, ctx) {
    const { bag } = ctx, [x0, z0, x1, z1] = el.rect, r = rng(el.seed ?? 9), y = el.level + 0.03;
    for (let i = 0; i < el.n; i++) {
      const cx = x0 + 1.2 + r() * (x1 - x0 - 2.4), cz = z0 + 1.2 + r() * (z1 - z0 - 2.4);
      if ((el.avoid || []).some((a) => cx > a[0] && cx < a[2] && cz > a[1] && cz < a[3])) continue;
      const rad = 0.28 + r() * 0.22;
      bag.add('lotus_leaf', lathe([[0.001, 0], [rad, 0.0], [rad * 1.02, 0.02], [0.001, 0.02]], 9, null, cx, y, cz));
      if (r() < 0.22) { const m = r() < 0.5 ? 'cloth_white' : 'cloth_red'; bag.add(m, lathe([[0.001, 0], [0.09, 0.02], [0.12, 0.1], [0.07, 0.2], [0.001, 0.26]], 7, null, cx + 0.3, y, cz + 0.1)); }
    }
  }

  /** A ghat's pavilion { at: [[x, z, face]] }: four brick piers carrying a flat roof with a parapet, a bench of brick within, where the monks dry and robe. */
  function pavilion(el, ctx) {
    const { bag, col } = ctx;
    for (const [x, z, face] of el.at) {
      const { P, R } = frame(x, z, face), Bx = (m, a0, b0, a1, b1, y0, y1) => { const q = R(a0, b0, a1, b1); bag.add(m, box(q[0], y0, q[1], q[2], y1, q[3])); };
      Bx(BRB, -1.9, -0.3, 1.9, 3.1, 0, 0.3);
      for (const a of [-1.6, 1.6]) for (const b of [0, 2.8]) { Bx(BR, a - 0.28, b - 0.28, a + 0.28, b + 0.28, 0.3, 2.8); Bx(BRB, a - 0.36, b - 0.36, a + 0.36, b + 0.36, 2.6, 2.8); col.rect(R(a - 0.3, b - 0.3, a + 0.3, b + 0.3), 0, 2.8); }
      Bx(TB, -1.9, -0.4, 1.9, 3.2, 2.8, 3.05); Bx(PL, -2.0, -0.5, 2.0, 3.3, 3.05, 3.3);
      Bx(BR, -2.0, -0.5, 2.0, -0.3, 3.3, 3.75); Bx(BR, -2.0, 3.1, 2.0, 3.3, 3.3, 3.75); Bx(BR, -2.0, -0.3, -1.8, 3.1, 3.3, 3.75); Bx(BR, 1.8, -0.3, 2.0, 3.1, 3.3, 3.75);
      Bx(BR, -1.2, 2.3, 1.2, 2.8, 0.3, 0.75); col.rect(R(-1.2, 2.3, 1.2, 2.8), 0, 0.75);
      const p = P(0.6, 2.55); bag.add('terracotta', lathe(POT, 8, null, p[0], 0.75, p[1]));
      Bx('cloth_ochre', -0.5, 2.7, 0.3, 2.75, 0.75, 1.5);
    }
  }

  return { lamps, booth: booths, jal, otla: otlas, village, annex, gate, lotus, pavilion };
}
