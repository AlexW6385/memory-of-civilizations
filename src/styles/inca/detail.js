// L3 detail of Machu Picchu's Sacred Sector and streets (docs/settlements/machu-picchu.md §12): the Intihuatana
// as a carved pyramid of the bedrock with its two cut stairs and its altar block, the textiles hung on the
// Main Temple's pegs, the stone benches of the wayronas, the things at the kanchas' gates.
// All merged into the element's bag: one mesh per material, nothing per-pixel.

import { box, lathe, frustum, rod, fromTriangles, orientOutward } from '../../core/geom.js';
import { urpu } from './life.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** A convex prism: polygon p0 ([x, z]) at y0 lofted to polygon p1 ([x, z] or [x, z, y]) at y1 (a point's own y overrides y1). */
function prism(bag, mat, p0, y0, p1, y1) {
  const t = [], n = p0.length, bot = p0.map(([x, z]) => [x, y0, z]), top = p1.map(([x, z, y]) => [x, y ?? y1, z]);
  for (let i = 1; i + 1 < n; i++) { t.push(...top[0], ...top[i], ...top[i + 1]); t.push(...bot[0], ...bot[i], ...bot[i + 1]); }
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; t.push(...bot[i], ...bot[j], ...top[j], ...bot[i], ...top[j], ...top[i]); }
  bag.add(mat, fromTriangles(orientOutward(t)));
}
const scaled = (poly, k, cx, cz) => poly.map(([x, z]) => [cx + (x - cx) * k, cz + (z - cz) * k]);

/**
 * intihuatana: the carved stone on the top of its hill { c, y }: "carved into the shape of a pyramid" out of the bedrock on a
 * polygonal base, two long stairs giving access, one on the north and one on the south, the south one cut for most of its length
 * from a single rock; a granite block beside it for an altar, bench or shelf; on the top a slightly inclined plane and the upright
 * column leaning 13° to the north, with a cubic protrusion on its top [stated: salkantaytrekking, "The Intihuatana stone at Machu
 * Picchu"; Wikipedia, "Intihuatana, Urubamba"]. Built: a rough irregular mound (0.45 m), a carved four-sided tier of fine granite
 * (to 0.85 m), the inclined platform (to 1.2 m at the north edge, 1.14 at the south), each rise within a step so the tiers are
 * walked up; the stairs of five and four steps; the post 0.48 × 0.34 × 0.62 m with its slanted top and a cube of 0.14 m on it;
 * the altar block 1.4 × 0.5 × 0.42 m west of the mound [inferred: sizes, after photographs].
 */
export function intihuatana(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y;
  // the mound of the bedrock: ten sides, worn and irregular, wider east–west
  const R = [], rand = rng(el.seed || 13);
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2 + 0.2, e = 1 + (rand() - 0.5) * 0.2; R.push([cx + Math.cos(a) * 3.0 * e, cz + Math.sin(a) * 2.6 * e]); }
  prism(bag, 'granite_rough', R, y - 0.4, scaled(R, 0.9, cx, cz), y + 0.18);
  prism(bag, 'granite_rough', scaled(R, 0.9, cx, cz), y + 0.18, scaled(R, 0.8, cx, cz).map(([x, z], i) => [x, z, y + 0.45 + (rand() - 0.5) * 0.07]), y + 0.45);
  // the bedrock's own lumps standing out of its foot, rounded by weathering
  for (let k = 0; k < 7; k++) { const a = rand() * Math.PI * 2, rr = 0.35 + rand() * 0.4, px = cx + Math.cos(a) * 3.0, pz = cz + Math.sin(a) * 2.6; if (Math.abs(Math.sin(a)) > 0.88 && Math.abs(Math.cos(a)) < 0.3) continue;
    bag.add('granite_rough', lathe([[rr, 0], [rr * 0.92, 0.18], [rr * 0.6, 0.34], [0.001, 0.4]], 9, (t, i) => 1 + 0.15 * Math.sin(t * 3 + i + k), px, y - 0.2, pz)); }
  // the carved tier: a squared pyramid's step with its corners cut
  const T = [[-1.7, -1.1], [-0.9, -1.45], [0.9, -1.45], [1.7, -1.1], [1.7, 1.1], [0.9, 1.45], [-0.9, 1.45], [-1.7, 1.1]].map(([u, w]) => [cx + u, cz + w]);
  prism(bag, 'granite_inca', T, y + 0.45, scaled(T, 0.97, cx, cz), y + 0.64);
  prism(bag, 'granite_inca', scaled(T, 0.985, cx, cz), y + 0.64, scaled(T, 0.94, cx, cz), y + 0.85);
  // the carved planes cut into the platform's west and south: two steps down, their edges cut sharp [inferred from photographs: the many planes of the stone]
  for (const [k, [u0, w0, u1, w1, hh]] of [[-1.35, -0.9, -0.95, 0.9, 0.98], [-1.55, -0.9, -1.35, 0.9, 0.92], [-0.7, 0.72, 0.7, 1.05, 0.95]].entries()) bag.add('granite_inca', frustum([cx + u0, cz + w0, cx + u1, cz + w1], y + 0.84, y + hh, 0.015, 0.015, 0.015, 0.015));
  // the inclined platform on top
  const Pq = [[-1.1, -0.75], [1.0, -0.75], [1.1, 0.65], [-1.0, 0.7]].map(([u, w]) => [cx + u, cz + w]);
  prism(bag, 'granite_inca', Pq, y + 0.85, Pq.map(([x, z]) => [x, z, y + 1.2 - (z - (cz - 0.75)) * 0.04]), y + 1.2);
  // a carved ledge on the east of the tier, a step on its south face (the small cut channels like stairs)
  bag.add('granite_inca', frustum([cx + 1.0, cz - 0.9, cx + 1.7, cz + 0.2], y + 0.85, y + 1.0, 0.02, 0.02, 0.02, 0.02));
  // the stairs, north and south, from the hill's top to the mound's: the south one the longer, one block with its steps cut in it
  for (const [sg, n, wd, lo] of [[1, 5, 0.7, 2.1], [-1, 4, 0.55, 2.0]]) {
    const dp = 0.34;
    for (let k = 0; k < n; k++) {
      const top = y + 0.45 * (k + 1) / (n), z0 = cz + sg * (lo + (n - 1 - k) * dp), z1 = cz + sg * (lo + (n - k) * dp);
      bag.add(k === 0 && sg > 0 ? 'granite_rough' : 'granite_inca', box(cx - wd, y - 0.2, Math.min(z0, z1), cx + wd, top, Math.max(z0, z1)));
    }
  }
  // the post, leaning north, its top cut on a slant, a cube on it
  const lean = Math.tan(13 * Math.PI / 180), hp = 0.62, b = [cx - 0.24, cz - 0.17, cx + 0.24, cz + 0.17], y0 = y + 1.17;
  const lo = [[b[0], b[1]], [b[2], b[1]], [b[2], b[3]], [b[0], b[3]]];
  const tops = lo.map(([x, z], i) => [x, y0 + hp + (i < 2 ? 0.07 : -0.05) - (x - cx) * 0.06, z - hp * lean]);
  // the post: a chamfered shaft (the four corners cut off), its top a slanted plane, a small cube with its own slanted face on it
  {
    const ch = 0.07, ring = (yy, k, dz) => [[-0.24 + ch, -0.17], [0.24 - ch, -0.17], [0.24, -0.17 + ch], [0.24, 0.17 - ch], [0.24 - ch, 0.17], [-0.24 + ch, 0.17], [-0.24, 0.17 - ch], [-0.24, -0.17 + ch]].map(([u, w]) => [cx + u * k, yy(u), cz + w * k - dz]);
    const topY = (u) => y0 + hp + 0.06 - (u * 0.12) , botY = () => y0 - 0.05, A = ring(botY, 1, 0), B = ring(topY, 1, hp * lean), g2 = [];
    for (let i = 0; i < 8; i++) { const j = (i + 1) % 8; g2.push(...A[i], ...B[i], ...B[j], ...A[i], ...B[j], ...A[j]); }
    for (let i = 1; i < 7; i++) g2.push(...B[0], ...B[i], ...B[i + 1]);
    bag.add('granite_inca', fromTriangles(orientOutward(g2)));
  }
  { const px = cx, pz = cz - hp * lean, py = y0 + hp - 0.02; prism(bag, 'granite_inca', [[px - 0.07, pz - 0.07], [px + 0.07, pz - 0.07], [px + 0.07, pz + 0.07], [px - 0.07, pz + 0.07]], py, [[px - 0.07, pz - 0.07, py + 0.2], [px + 0.07, pz - 0.07, py + 0.2], [px + 0.07, pz + 0.07, py + 0.13], [px - 0.07, pz + 0.07, py + 0.13]], py + 0.2); }
  col.circle(cx, cz - 0.1, 0.32, y + 1.15, y + 2.0);
  // the altar block west of the mound
  bag.add('granite_inca', frustum([cx - 5.4, cz - 0.28, cx - 4.0, cz + 0.28], y - 0.05, y + 0.42, 0.03, 0.03, 0.03, 0.03));
  col.rect([cx - 5.4, cz - 0.28, cx - 4.0, cz + 0.28], y, y + 0.42);
}

/**
 * inca_altar_bench: a long low block of fine granite on two stones { a: [x, z], b: [x, z] (its long axis), y, d (depth), h }: the seat
 * or altar along the back of a wayrona, on it the offerings [inferred: the three-walled halls held altars].
 */
export function altarBench(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, y = el.y, d = el.d ?? 0.7, h = el.h ?? 0.42;
  const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz * d / 2, nz = ux * d / 2;
  const hw = Math.abs(nx) + Math.abs(ux) * L / 2, hz = Math.abs(nz) + Math.abs(uz) * L / 2, mx = (ax + bx) / 2, mz = (az + bz) / 2;
  const R = [mx - hw, mz - hz, mx + hw, mz + hz];
  bag.add('granite_inca', frustum(R, y + h * 0.35, y + h, 0.03, 0.03, 0.03, 0.03));
  for (const s of [-0.38, 0.38]) { const px = mx + ux * L * s, pz = mz + uz * L * s, qx = Math.abs(nx) * 0.8 + Math.abs(ux) * 0.3, qz = Math.abs(nz) * 0.8 + Math.abs(uz) * 0.3; bag.add('granite_rough', box(px - qx, y - 0.02, pz - qz, px + qx, y + h * 0.36, pz + qz)); }
  col.rect(R, y, y + h);
}

/**
 * inca_hangings: textiles hung from the great pegs of a wall { rect, side, y, h, th, from, n, w, drop, seed }: each cloth falls from its peg
 * and lies against the wall: bands of red, black, ochre and white, a fringe at the hem [stated: some pegs inside "perhaps for textile
 * hangings" — World History Encyclopedia, "Inca Architecture"; inferred: the bands].
 * The peg's place is the wall's own: n pegs spread over [0.9, L - 0.9] as the temple builds them, the peg at v = h - 0.45 standing 0.3 out.
 */
export function banner(bag, F, off, y, u, pv, drop, w, main, reach = 0.3) {
  const vb = pv - drop, kTop = off(pv) + reach, kBot = off(vb) + 0.045;
  const P = (uu, v, k) => { const p = F.at(uu), n = F.n(uu); return [p[0] + n[0] * k, y + v, p[1] + n[1] * k]; };
  const bands = [['cloth_black', 0.0, 0.1], [main, 0.1, 0.55], ['cloth_ochre', 0.55, 0.64], [main, 0.64, 0.92], ['cloth_white', 0.92, 1.0]];
  for (const [mat, f0, f1] of bands) {
    const q = (f) => [vb + (pv - vb) * (1 - f), kBot + (kTop - kBot) * (1 - f)];
    const [va, ka] = q(f0), [vc, kc] = q(f1), a = P(u - w / 2, va, ka), b = P(u + w / 2, va, ka), c = P(u + w / 2, vc, kc), d = P(u - w / 2, vc, kc), t = [];
    t.push(...a, ...b, ...c, ...a, ...c, ...d, ...a, ...c, ...b, ...a, ...d, ...c);
    bag.add(mat, fromTriangles(t));
  }
  // the fringe at the hem: short cords
  for (let k = 0; k < 7; k++) { const uu = u - w / 2 + (k + 0.5) * w / 7; bag.add('cloth_brown', rod(P(uu, vb, kBot), P(uu, vb - 0.1, kBot - 0.01), 0.006, 3)); }
}
export function hangings(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, h = el.h, th = el.th ?? 1.0, side = el.side, n = el.n, w = el.w ?? 0.9, rand = rng(el.seed || 3);
  const bat = Math.min(0.087 * h, th / 4), off = (v) => th / 2 - bat * v / h;
  const L = side === 'n' || side === 's' ? x1 - x0 : z1 - z0;
  const fr = { n: [[x0, z0], [x1, z0]], e: [[x1, z0], [x1, z1]], s: [[x1, z1], [x0, z1]], w: [[x0, z1], [x0, z0]] }[side];
  const ux = (fr[1][0] - fr[0][0]) / L, uz = (fr[1][1] - fr[0][1]) / L;
  const F = { at: (u) => [fr[0][0] + ux * u, fr[0][1] + uz * u], n: () => [-uz, ux] };
  for (let i = 0; i < n; i++) banner(bag, F, off, y, 0.9 + (i + 0.5) * (L - 1.8) / n, h - 0.45, el.drop ?? 1.1, w * (0.9 + rand() * 0.2), rand() < 0.6 ? 'cloth_red' : 'cloth_brown');
}

/**
 * inca_gate_dress: what stood in the lane before a kancha's gate { items: [{ at: [x, z], kind, y, yaw, seed }] }: a water jar (urpu) set in a ring
 * of three stones; a stone seat; a bundle of firewood leaning on the wall; the little gutter that takes the patio's water out under the gate
 * [stated: drainage holes built into city walls and channels in the stairways and walkways carrying water to the main drain — ancientengrtech.wisc.edu;
 * inferred: the jars, seats and wood, after Andean lanes today].
 */
export function gateDress(el, { bag, col }) {
  for (const it of el.items) {
    const [x, z] = it.at, y = it.y, r = rng(it.seed || 1), c = Math.cos(it.yaw || 0), s = Math.sin(it.yaw || 0), P = (u, w) => [x + u * c - w * s, z + u * s + w * c];
    if (it.kind === 'jar') {
      for (let k = 0; k < 3; k++) { const a = k * 2.094 + r(), q = [x + Math.cos(a) * 0.27, z + Math.sin(a) * 0.27]; bag.add('granite_rough', lathe([[0.001, 0], [0.11, 0], [0.1, 0.17], [0.001, 0.2]], 6, null, q[0], y - 0.02, q[1])); }
      urpu(bag, x, y + 0.02, z, 0.78 + r() * 0.1, r() * 6.28);
      col.circle(x, z, 0.3, y, y + 0.9);
    } else if (it.kind === 'seat') {
      bag.add('granite_inca', frustum([x - 0.38, z - 0.27, x + 0.38, z + 0.27], y - 0.03, y + 0.38, 0.03, 0.03, 0.03, 0.03));
      col.rect([x - 0.38, z - 0.27, x + 0.38, z + 0.27], y, y + 0.38);
    } else if (it.kind === 'wood') {
      for (let k = 0; k < 7; k++) { const u = (k - 3) * 0.075, a = P(u, 0), b = P(u + (r() - 0.5) * 0.05, -0.5 - r() * 0.15); bag.add('timber', rod([a[0], y + 0.05, a[1]], [b[0], y + 1.1 + r() * 0.2, b[1]], 0.022, 5)); }
      { const a = P(-0.25, 0.55), b = P(0.25, 0.55); bag.add('cloth_brown', rod([a[0], y + 0.7, a[1]], [b[0], y + 0.7, b[1]], 0.01, 3)); }
    } else if (it.kind === 'gutter') {
      // two runs of cut kerb stones with the water's dark strip between, going out from the wall's foot
      for (let k = 0; k < 4; k++) {
        const a = P(0, k * 0.6), b = P(0, k * 0.6 + 0.56);
        for (const sg of [-1, 1]) { const q = [P(sg * 0.1, k * 0.6), P(sg * 0.1, k * 0.6 + 0.56)]; bag.add('granite_inca', box(Math.min(q[0][0], q[1][0]) - 0.04, y, Math.min(q[0][1], q[1][1]) - 0.04, Math.max(q[0][0], q[1][0]) + 0.04, y + 0.07, Math.max(q[0][1], q[1][1]) + 0.04)); }
        bag.add('pottery_dark', box(Math.min(a[0], b[0]) - 0.05, y, Math.min(a[1], b[1]) - 0.05, Math.max(a[0], b[0]) + 0.05, y + 0.012, Math.max(a[1], b[1]) + 0.05));
      }
    }
  }
}

export const INCA_DETAIL = { intihuatana, inca_altar_bench: altarBench, inca_hangings: hangings, inca_gate_dress: gateDress };
