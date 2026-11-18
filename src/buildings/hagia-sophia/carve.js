// Hagia Sophia's carving, seen from two metres (docs/settlements/constantinople.md §4.11): the capitals' pierced acanthus standing off a
// gilt ground, with curled tips, side leaflets that are separate pieces with air between them (the drilling of the "lace" capitals), and
// corner volutes; the imperial monograms as real relief on the impost blocks, strokes with bevelled sides standing 2.8 cm off a plaque;
// the carved ornament of the cornices. Every piece is a function of its inputs and of a hash of its own place: the same plan builds the
// same geometry every time, and no two capitals are alike to the millimetre (so they merge into their material's mesh and are never instanced).
// Built with the sculptor's kit of the Nabataean carvings (src/styles/nabataean/sculpt.js, read-only here).

import { Sculpt, blob, torus, norm, cross, sub, add, mul, dot } from '../../styles/nabataean/sculpt.js';
import { hexa } from '../../styles/chinese/index.js';

/** A small, repeatable offset (±amp) from a place and a number. */
export const jit = (x, z, k, amp = 0.004) => amp * Math.sin((x * 12.9898 + z * 78.233 + k * 37.719) * 43.7);

/** A leaflet of acanthus: a flattened spindle along a curved spine from b, direction d, length L, half-width `wid`, half-thickness `thick`; B the broad axis; bend added quadratically (the curl); K rows, the edge notched alternately (the serration). */
export function leaflet(S, b, d, L, wid, thick, B, bend, K = 3, notch = 0.28) {
  const pt = (s) => add(add(b, mul(d, L * s)), mul(bend, s * s));
  const rows = [];
  for (let k = 0; k <= K; k++) {
    const s = k / K, c = pt(s), T = norm(sub(pt(Math.min(1, s + 0.06)), pt(Math.max(0, s - 0.06))));
    let bb = sub(B, mul(T, dot(B, T))); bb = norm(bb);
    const nn = norm(cross(T, bb));
    const f = s < 0.3 ? 0.55 + 0.45 * s / 0.3 : Math.pow(1 - (s - 0.3) / 0.7, 0.85);
    const w = k === K ? 0 : wid * f * (1 - (k % 2 && k < K ? notch : 0)), t = k === K ? 0 : thick * (1 - 0.45 * s);
    const row = [];
    for (let j = 0; j < 4; j++) { const a = j * Math.PI / 2; row.push(add(c, add(mul(bb, w * Math.cos(a)), mul(nn, t * Math.sin(a))))); }
    rows.push(row);
  }
  S.grid(rows);
}

/**
 * One leaf of acanthus at azimuth `ang` of a capital whose core has radius coreR(y): a broad central lobe and nL leaflets either side that
 * stand free of it, each curling out at its tip. Local frame: the column's axis the y axis, the capital's foot at y = 0.
 */
function leaf(S, ang, y0, H, coreR, r, nL, K, curl, seed) {
  const e = [Math.cos(ang), 0, Math.sin(ang)], g = [-Math.sin(ang), 0, Math.cos(ang)], up = [0, 1, 0];
  const R0 = coreR(y0) - 0.012;
  const base = add(mul(e, R0), mul(up, y0));
  const dRib = norm(add(up, mul(e, 0.18)));
  const bend = add(mul(e, curl * H), mul(up, -0.1 * H));
  leaflet(S, base, dRib, H, 0.27 * r, 0.04 * r + 0.004, g, bend, K + 1, 0.22);
  const ribPt = (s) => add(add(base, mul(dRib, H * s)), mul(bend, s * s));
  for (let i = 0; i < nL; i++) for (const sd of [-1, 1]) {
    const s = 0.14 + 0.22 * i, p = ribPt(s), phi = (38 + 9 * i) * Math.PI / 180;
    const dl = norm(add(add(mul(g, sd * Math.cos(phi)), mul(up, Math.sin(phi))), mul(e, 0.3)));
    const L = H * (0.9 - 0.14 * i) * (1 + 0.04 * Math.sin(seed + i * 3 + sd));
    leaflet(S, p, dl, L, 0.17 * r * (1 - 0.1 * i), 0.03 * r + 0.003, norm(cross(dl, e)), add(mul(e, 0.4 * L), mul(up, -0.1 * L)), K, 0.25);
  }
}

/** A volute under the abacus's corner: a rolled stalk from the bell's shoulder out to the corner and curled back on itself. */
function volute(S, ang, y0, y1, rr0, rr1, th) {
  const e = [Math.cos(ang), 0, Math.sin(ang)], g = [-Math.sin(ang), 0, Math.cos(ang)];
  const P = (rad, y) => [e[0] * rad, y, e[2] * rad];
  const spl = [
    [...P(rr0, y0), th, th * 1.5], [...P(rr0 + (rr1 - rr0) * 0.5, y0 + (y1 - y0) * 0.45), th * 0.95, th * 1.5],
    [...P(rr1, y0 + (y1 - y0) * 0.85), th * 0.9, th * 1.45], [...P(rr1 + th * 0.8, y1), th * 0.85, th * 1.4],
    [...P(rr1 - th * 1.2, y1 + th * 0.9), th * 0.8, th * 1.3], [...P(rr1 - th * 2.6, y1 - th * 0.3), th * 0.7, th * 1.1],
  ];
  const T = spl.map((_, k) => norm(sub(spl[Math.min(spl.length - 1, k + 1)].slice(0, 3), spl[Math.max(0, k - 1)].slice(0, 3))));
  const out = [];
  for (let k = 0; k < spl.length; k++) {
    const c = spl[k].slice(0, 3), bb = norm(sub(g, mul(T[k], dot(g, T[k])))), nn = norm(cross(T[k], bb)), row = [];
    for (let j = 0; j < 5; j++) { const a = j * Math.PI * 2 / 5; row.push(add(c, add(mul(bb, spl[k][4] * Math.cos(a)), mul(nn, spl[k][3] * Math.sin(a))))); }
    out.push(row);
  }
  const last = out[out.length - 1], cc = last.reduce((p, q) => add(p, mul(q, 1 / last.length)), [0, 0, 0]);
  out.push(last.map((p) => add(mul(sub(p, cc), 0.15), cc)));
  S.grid(out);
}

/**
 * The carved basket capital of a column of radius r at (x, z), its foot at yc, capH tall, the shaft's top at radius 0.9 r: a gilt core (`gold`),
 * and on it, in the capital's own marble, a lower tier of acanthus leaves (eight), an upper tier at the middles of the faces (four) and the
 * corner volutes. lod 2: the nave's great columns; 1: the galleries; 0: the atrium.
 */
export function carvedCapital(bag, { x, z, yc, r, capH, capMat, lod, bellR }) {
  const xf = (p) => [x + p[0], yc + p[1], z + p[2]];
  const core = new Sculpt(xf), stone = new Sculpt(xf);
  const coreR = (y) => { const t = Math.min(1, y / capH); return bellR(t) - r * 0.14 * Math.min(1, t / 0.35); };
  const nj = lod > 0 ? 12 : 8, rows = [];
  for (let i = 0; i <= 4; i++) { const y = capH * i / 4, R = coreR(y), row = []; for (let j = 0; j < nj; j++) { const a = j / nj * Math.PI * 2; row.push([Math.cos(a) * R, y, Math.sin(a) * R]); } rows.push(row); }
  rows.push(rows[rows.length - 1].map(([px, , pz]) => [px * 0.97, capH * 0.995, pz * 0.97]));
  core.grid(rows);
  const nL = lod === 2 ? 2 : 1, K = lod === 2 ? 3 : 2, a0 = jit(x, z, 3, 0.05);
  for (let k = 0; k < 8; k++) {
    const ang = a0 + k * Math.PI / 4 + Math.PI / 8 + jit(x, z, 10 + k, 0.03), hj = jit(x, z, 20 + k, 0.012);
    leaf(stone, ang, capH * 0.05 + hj, capH * (0.62 + 0.02 * Math.sin(k * 1.7 + x)), coreR, r, nL, K, 0.42, x * 3 + z + k);
  }
  if (lod === 2) for (let k = 0; k < 4; k++) {
    const ang = a0 + k * Math.PI / 2 + jit(x, z, 40 + k, 0.03), hj = jit(x, z, 50 + k, 0.012);
    leaf(stone, ang, capH * 0.34 + hj, capH * 0.64, coreR, r, Math.max(1, nL - 1), K, 0.3, x + z * 2 + k);
  }
  for (let k = 0; k < 4; k++) {
    const ang = a0 + Math.PI / 4 + k * Math.PI / 2 + jit(x, z, 60 + k, 0.02);
    volute(stone, ang, capH * 0.5, capH * (0.9 + jit(x, z, 70 + k, 0.02)), coreR(capH * 0.5) + 0.01, r * (1.38 + jit(x, z, 80 + k, 0.03)), r * (lod > 0 ? 0.1 : 0.12));
  }
  bag.add('gold', core.geometry());
  bag.add(lod === 1 ? capMat : 'marble', stone.geometry());
}

// ── the imperial monograms ───────────────────────────────────────────────────
/** A bar from (u0, v0) to (u1, v1) of width w with bevelled sides, rising from depth d0 to d1 (its top 60 % as wide); added to `out` in the frame W(u, y, d). */
export function bevelBar(out, W, u0, v0, u1, v1, w, d0, d1) {
  const dx = u1 - u0, dy = v1 - v0, l = Math.hypot(dx, dy) || 1, tx = dx / l, ty = dy / l, nx = -ty, ny = tx, e = w * 0.5;
  const q = (hw, ex, d) => [[u0 - tx * ex + nx * hw, v0 - ty * ex + ny * hw], [u1 + tx * ex + nx * hw, v1 + ty * ex + ny * hw], [u1 + tx * ex - nx * hw, v1 + ty * ex - ny * hw], [u0 - tx * ex - nx * hw, v0 - ty * ex - ny * hw]].map(([a, b]) => W(a, b, d));
  hexa(out, q(w / 2, e, d0), q(w * 0.3, e * 0.6, d1));
}
/** A bevelled disc of radius r. */
export function bevelDisc(out, W, uc, vc, r, d0, d1, n = 8) {
  for (let i = 0; i < n; i++) {
    const a = 2 * Math.PI * i / n, b = 2 * Math.PI * (i + 1) / n, P = (rad, t, d) => W(uc + rad * Math.cos(t), vc + rad * Math.sin(t), d);
    hexa(out, [P(0.001, a, d0), P(r, a, d0), P(r, b, d0), P(0.001, b, d0)], [P(0.001, a, d1), P(r * 0.7, a, d1), P(r * 0.7, b, d1), P(0.001, b, d1)]);
  }
}
const GLYPH = {
  I: [[0, -1, 0, 1]], T: [[-1, 1, 1, 1], [0, 1, 0, -1]], Y: [[-1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 0, -1]],
  N: [[-0.8, -1, -0.8, 1], [-0.8, 1, 0.8, -1], [0.8, -1, 0.8, 1]],
  TH: [[-1, 0, 0, 1], [0, 1, 1, 0], [1, 0, 0, -1], [0, -1, -1, 0], [-0.5, 0, 0.5, 0]],
  E: [[-0.8, -1, -0.8, 1], [-0.8, 1, 0.8, 1], [-0.8, 0, 0.5, 0], [-0.8, -1, 0.8, -1]],
  D: [[-1, -1, 1, -1], [-1, -1, 0, 1], [1, -1, 0, 1]],
  A: [[-1, -1, 0, 1], [1, -1, 0, 1], [-0.5, -0.2, 0.5, -0.2]],
};
/**
 * A cruciform monogram in the frame W, centred at (uc, vc), half-size q, its strokes rising from d0 to d1: a cross whose four arms end in
 * serifs, and in each quarter one letter, Justinian's (I, Y, N, T) or Theodora's (Θ, E, Δ, A). `full` false: the cross and four pellets.
 * [inferred: a cruciform monogram of this kind; the letters stand for the names, not their exact arrangement]
 */
export function monogram(out, W, uc, vc, q, d0, d1, who = 'J', full = true) {
  const w = q * 0.17;
  bevelBar(out, W, uc, vc - q, uc, vc + q, w, d0, d1);
  bevelBar(out, W, uc - q, vc, uc + q, vc, w, d0, d1);
  for (const s of [-1, 1]) { bevelBar(out, W, uc + s * q, vc - q * 0.3, uc + s * q, vc + q * 0.3, w * 0.9, d0, d1); bevelBar(out, W, uc - q * 0.3, vc + s * q, uc + q * 0.3, vc + s * q, w * 0.9, d0, d1); }
  const set = who === 'J' ? ['I', 'Y', 'N', 'T'] : ['TH', 'E', 'D', 'A'], qq = [[-1, 1], [1, 1], [-1, -1], [1, -1]];
  qq.forEach(([su, sv], i) => {
    const cu = uc + su * q * 0.55, cv = vc + sv * q * 0.55, gs = q * 0.3;
    if (full === 'min') return;
    if (!full) { bevelBar(out, W, cu, cv - gs * 0.6, cu, cv + gs * 0.6, w * 0.8, d0, d1); return; }
    for (const [a, b, c, d] of GLYPH[set[i]]) bevelBar(out, W, cu + a * gs, cv + b * gs, cu + c * gs, cv + d * gs, w * 0.62, d0, d1);
  });
}

/**
 * A bust in a roundel (the images on the chancel barrier's architrave: Christ, the Virgin, apostles and prophets, after Paul the Silentiary): head with
 * brow, nose and hair, beard, shoulders in the mantle, a book on the breast, behind the head a halo, with a cross in it for Christ. Built in the
 * frame W at (uc, vc) on the plane of depth d, facing out by `sd` (±1); about 0.3 m high. The pieces go into the two Sculpts given (one geometry per material for a whole barrier, not a small mesh each).
 */
export function bust(St, Go, W, uc, vc, d, sd, kind) {
  const xf = (p) => W(uc + p[0] * sd, vc + p[1], d + p[2] * sd);
  St.xf = xf; Go.xf = xf;
  blob(St, [0, -0.115, 0.012], [0.135, 0.075, 0.03], 3, 7);                                    // the shoulders in the mantle
                                       // the neck
  blob(St, [0, 0.035, 0.028], [0.05, 0.065, 0.036], 4, 7);                                      // the head
  blob(St, [0, 0.043, 0.012], [0.058, 0.07, 0.03], 3, 7);                                       // the hair
  blob(St, [0, 0.025, 0.062], [0.011, 0.024, 0.014], 2, 4);                                     // the nose
         // the brow
  if (kind !== 'V') blob(St, [0, -0.012, 0.05], [0.032, 0.036, 0.016], 3, 6);                    // the beard (the Virgin has none)
  if (kind === 'C') St.box(-0.115, -0.165, 0.03, -0.045, -0.09, 0.046);                          // the book
  torus(Go, [0, 0.04, -0.004], [1, 0, 0], [0, 1, 0], 0.088, 0.0075, { seg: 12, sec: 4 });
  if (kind === 'C') { Go.box(-0.007, 0.04, -0.004, 0.007, 0.128, 0.008); Go.box(-0.088, 0.034, -0.004, 0.088, 0.046, 0.008); Go.box(-0.05, 0.034, -0.004, 0.05, 0.046, 0.009); }
}
