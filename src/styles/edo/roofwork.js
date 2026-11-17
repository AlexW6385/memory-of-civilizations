// The work of a tiled castle roof (docs/settlements/edo-himeji.md §4.2): the rows of round cover
// tiles (maru-gawara) running eave to ridge, each laid in a white plaster bed so the roof reads as
// white lines on grey; the stacked ridge (plaster core, flat tile courses, round cap); the hip
// ridges with a round plate (kudo-gawara) at their feet; the demon tile (onigawara) at the ridge's
// ends. Written to follow the roof surface of ming's rectRoof exactly (same height function).

import { fromTriangles, orientOutward } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import { tri, quad4 } from '../japanese/shape.js';

const TL = 'tile_dark', WH = 'plaster_castle';

/** Collects triangles by material so that one roof's work goes to the plan as one mesh per material. */
export class Acc {
  constructor() { this.m = {}; }
  t(mat, arr) { const a = (this.m[mat] ||= []); for (let i = 0; i < arr.length; i++) a.push(arr[i]); }
  flush(bag) { for (const [mat, a] of Object.entries(this.m)) if (a.length) bag.add(mat, fromTriangles(a)); }
}

/** The surface's height at local (lx, lz) from the roof's centre, as rectRoof computes it. */
function height(r, lx, lz) {
  const { A, B, R, sw, p, kind, gAt, y } = r;
  const ax = Math.abs(lx), az = Math.abs(lz), ts = Math.max(0, Math.min(1, (B - az) / B));
  let te = kind === 'gable' ? 9 : Math.max(0, (A - ax) / B);
  if (kind === 'xieshan' && te > gAt) te = 9;
  const t = Math.min(ts, te), corner = kind === 'gable' ? 0 : Math.max(0, 1 - te / 0.5) * Math.max(0, 1 - ts / 0.5);
  return y + R * Math.pow(t, p) + sw * corner * corner;
}
const worldOf = (r, lx, h, lz) => (r.alongZ ? [r.c[0] - lz, h, r.c[1] + lx] : [r.c[0] + lx, h, r.c[1] + lz]);

/** Rows of cover tiles on the slopes. spec: { c, A, B, y, rise (R), sweep, p, kind, gableAt, alongZ, hole, pitch, s }. */
export function tileRows(bag, spec) {
  const r = { ...spec, R: spec.rise, sw: spec.sweep, gAt: spec.gableAt ?? 0.5 };
  const { A, B, kind, gAt } = r, s = r.s ?? 1, pr = spec.pitch, wr = 0.15 * s, hr = 0.08 * s;
  let hole = null;
  if (spec.hole) {
    const [cx, cz] = r.c, inv = (wx, wz) => (r.alongZ ? [wz - cz, -(wx - cx)] : [wx - cx, wz - cz]), a = inv(spec.hole[0], spec.hole[1]), b = inv(spec.hole[2], spec.hole[3]);
    hole = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])];
  }
  const inH = (x, z) => hole && x > hole[0] + 0.05 && x < hole[2] - 0.05 && z > hole[1] + 0.05 && z < hole[3] - 0.05;
  const rib = [], bed = [];
  // one row: points (lx, lz) from the eave inward, lateral axis 'x' or 'z'
  const row = (pts, lat) => {
    const P = (q, o) => { const h = height(r, q[0], q[1]) + o; return [q, h]; };
    let prev = null;
    for (const q of pts) {
      if (inH(q[0], q[1])) break;
      if (prev) {
        const [qa, ha] = prev, [qb, hb] = P(q, 0);
        const w = (qq, o, hh, e) => worldOf(r, qq[0] + (lat === 'x' ? e : 0), hh + o, qq[1] + (lat === 'z' ? e : 0));
        const up = [0, 1, 0];
        for (const [e, o] of [[-wr * 1.6, 0.012], [wr * 1.6, 0.012]]) void e, void o;
        // the plaster bed, a flat strip wider than the tile
        quad4(bed, w(qa, 0.045, ha, -wr * 1.28), w(qb, 0.045, hb, -wr * 1.28), w(qb, 0.045, hb, wr * 1.28), w(qa, 0.045, ha, wr * 1.28), up);
        // the round tile: a peaked ridge on the bed
        const L = [w(qa, 0.045, ha, -wr), w(qb, 0.045, hb, -wr)], Rr = [w(qa, 0.045, ha, wr), w(qb, 0.045, hb, wr)];
        const Tp = [w(qa, hr, ha, 0), w(qb, hr, hb, 0)];
        const mid = [(L[0][0] + Rr[0][0]) / 2, (L[0][2] + Rr[0][2]) / 2];
        quad4(rib, L[0], L[1], Tp[1], Tp[0], (pp) => [pp[0] - mid[0], 0.3, pp[2] - mid[2]]);
        quad4(rib, Tp[0], Tp[1], Rr[1], Rr[0], (pp) => [pp[0] - mid[0], 0.3, pp[2] - mid[2]]);
      }
      prev = P(q, 0);
    }
  };
  const step = 1.3, seg = (from, to, f) => { const n = Math.max(2, Math.ceil(Math.abs(to - from) / step)), out = []; for (let i = 0; i <= n; i++) out.push(f(from + (to - from) * i / n)); return out; };
  // the long slopes: rows along z at fixed x, from the eave to the ridge or the hip
  const xLim = kind === 'xieshan' ? A - gAt * B - 0.15 : A;
  const nx = Math.floor(xLim / pr);
  for (let i = -nx; i <= nx; i++) {
    const x = i * pr + pr / 2 * (nx * 2 + 1 > 0 ? 0 : 0);
    if (Math.abs(x) > xLim) continue;
    for (const sz of [-1, 1]) {
      const zEnd = kind === 'gable' ? 0.2 : Math.max(0.2, B - (A - Math.abs(x)) + 0.05);
      if (zEnd > B - 0.1) continue;
      row(seg(B - 0.02, zEnd, (z) => [x, sz * z]), 'x');
    }
  }
  // the end slopes of hips and hip-and-gable roofs: rows along x at fixed z
  if (kind !== 'gable') {
    const nz = Math.floor(B / pr);
    for (let i = -nz; i <= nz; i++) {
      const z = i * pr;
      if (Math.abs(z) > B - 0.3) continue;
      for (const sx of [-1, 1]) {
        const xEnd = Math.max(A - (B - Math.abs(z)) + 0.05, kind === 'xieshan' ? A - gAt * B + 0.1 : 0);
        if (xEnd > A - 0.1) continue;
        row(seg(A - 0.02, xEnd, (x) => [sx * x, z]), 'z');
      }
    }
  }
  bag.t(WH, bed);
  bag.t(TL, rib);
}

/** A shallow cone (a round plate with a boss) facing d, centre c, radius r, boss height hb: its triangles. */
function plate(out, c, d, r, hb, n = 10) {
  const sd = [-d[1], d[0]], tip = [c[0] + d[0] * hb, c[1], c[2] + d[1] * hb];
  for (let k = 0; k < n; k++) {
    const a0 = k / n * Math.PI * 2, a1 = (k + 1) / n * Math.PI * 2;
    const P0 = [c[0] + sd[0] * r * Math.cos(a0), c[1] + r * Math.sin(a0), c[2] + sd[1] * r * Math.cos(a0)], P1 = [c[0] + sd[0] * r * Math.cos(a1), c[1] + r * Math.sin(a1), c[2] + sd[1] * r * Math.cos(a1)];
    tri(out, tip, P0, P1, [d[0], 0, d[1]]);
  }
}
/** A section [[offset, y]…] swept along a→b (world [x, z]), capped, in material mat. */
function sweep(bag, mat, a, b, sec) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), nx = -(b[1] - a[1]) / L, nz = (b[0] - a[0]) / L, t = [];
  const P = (p, [o, y]) => [p[0] + nx * o, y, p[1] + nz * o];
  for (let k = 0; k < sec.length; k++) { const s0 = sec[k], s1 = sec[(k + 1) % sec.length]; const A = P(a, s0), B = P(b, s0), C = P(b, s1), D = P(a, s1); t.push(...A, ...B, ...C, ...A, ...C, ...D); }
  for (let k = 1; k < sec.length - 1; k++) t.push(...P(a, sec[0]), ...P(a, sec[k]), ...P(a, sec[k + 1]), ...P(b, sec[0]), ...P(b, sec[k + 1]), ...P(b, sec[k]));
  bag.t(mat, orientOutward(t));
}

/**
 * The stacked ridge from a to b at the height `top` (the roof's ridge line): a plaster core, two
 * flat tile courses, a round cap on top; returns nothing. s the scale.
 */
export function stackedRidge(bag, a, b, top, s = 1) {
  const k = s;
  sweep(bag, WH, a, b, [[-0.4 * k, top - 0.08], [0.4 * k, top - 0.08], [0.4 * k, top + 0.26 * k], [-0.4 * k, top + 0.26 * k]]);
  sweep(bag, TL, a, b, [[-0.45 * k, top + 0.26 * k], [0.45 * k, top + 0.26 * k], [0.45 * k, top + 0.34 * k], [-0.45 * k, top + 0.34 * k]]);
  sweep(bag, TL, a, b, [[-0.4 * k, top + 0.34 * k], [0.4 * k, top + 0.34 * k], [0.4 * k, top + 0.42 * k], [-0.4 * k, top + 0.42 * k]]);
  sweep(bag, TL, a, b, [[-0.3 * k, top + 0.42 * k], [0.3 * k, top + 0.42 * k], [0.24 * k, top + 0.56 * k], [0, top + 0.62 * k], [-0.24 * k, top + 0.56 * k]]);
}

/**
 * The demon tile (onigawara) at the end of a ridge: a shield of tile leaning out from the ridge's
 * end, its face with a round plate bearing a pale crest, stepped scallops on its edge. at [x, z],
 * top (the ridge's top y), d the unit direction outward along the ridge, s scale.
 */
export function onigawara(bag, at, top, d, s = 1) {
  const sd = [-d[1], d[0]], out = [], hw = 0.34 * s;
  const prof = [[-0.1, -0.08], [0.5, -0.08], [0.6, 0.16], [0.56, 0.5], [0.42, 0.82], [0.22, 1.04], [0.02, 1.12], [-0.08, 0.9], [-0.1, 0.5]].map(([u, v]) => [u * s, v * s]);
  const W = (u, v, w) => [at[0] + d[0] * u + sd[0] * w, top - 0.08 * s + v, at[1] + d[1] * u + sd[1] * w];
  const cen = [0.22 * s, 0.5 * s];
  const face = (w, sign) => { for (let i = 0; i < prof.length; i++) { const a = prof[i], b = prof[(i + 1) % prof.length]; tri(out, W(cen[0], cen[1], w), W(a[0], a[1], w), W(b[0], b[1], w), [sd[0] * sign, 0, sd[1] * sign]); } };
  face(hw, 1); face(-hw, -1);
  for (let i = 0; i < prof.length; i++) { const a = prof[i], b = prof[(i + 1) % prof.length], m = W((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0), c = W(cen[0], cen[1], 0); quad4(out, W(a[0], a[1], -hw), W(b[0], b[1], -hw), W(b[0], b[1], hw), W(a[0], a[1], hw), [m[0] - c[0], m[1] - c[1], m[2] - c[2]]); }
  bag.t(TL, out);
  // the pale roundel on the face, with a boss
  const rd = [], q = W(0.6 * s, 0.34 * s, 0);
  plate(rd, [q[0] - d[0] * 0.04 * s, q[1], q[2] - d[1] * 0.04 * s], d, 0.2 * s, 0.1 * s, 12);
  bag.t(WH, rd);
  { const o = []; quad4(o, W(-0.12 * s, -0.1 * s, -hw - 0.08 * s), W(0.54 * s, -0.1 * s, -hw - 0.08 * s), W(0.54 * s, -0.1 * s, hw + 0.08 * s), W(-0.12 * s, -0.1 * s, hw + 0.08 * s), [0, -1, 0]); bag.t(TL, o); }
}

/** A hip ridge through points (world [x, y, z]) with a round plate at its foot (the first point), outward direction d. */
export function hipRidge(bag, pts, d, s = 1) {
  const white = [], dark = [];
  for (let k = 0; k + 1 < pts.length; k++) {
    beamTris(white, pts[k], pts[k + 1], 0.16 * s, 0.1 * s);
    beamTris(dark, [pts[k][0], pts[k][1] + 0.07 * s, pts[k][2]], [pts[k + 1][0], pts[k + 1][1] + 0.07 * s, pts[k + 1][2]], 0.13 * s, 0.22 * s);
  }
  bag.t(WH, white); bag.t(TL, dark);
  // the round plate at the foot, standing upright facing outward along the hip
  const p0 = pts[0], g = [];
  plate(g, [p0[0] + d[0] * 0.1 * s, p0[1] + 0.25 * s, p0[2] + d[1] * 0.1 * s], d, 0.26 * s, 0.12 * s, 10);
  bag.t(TL, g);
}

/**
 * The rafters under a castle eave (nokinoki, plastered): from the wall out to the eave's edge, one at every
 * `pr` along the four sides, hanging 0.1 m under the soffit so that the underside reads as ribs.
 * spec as for tileRows, plus o (the overhang).
 */
export function rafters(bag, spec, pr = 0.6) {
  const r = { ...spec, R: spec.rise, sw: spec.sweep, gAt: spec.gableAt ?? 0.5 }, { A, B, o } = r, out = [], hw = 0.05, hh = 0.13;
  const stick = (lx0, lz0, lx1, lz1) => {
    const a = worldOf(r, lx0, height(r, lx0, lz0) - 0.27, lz0), b = worldOf(r, lx1, height(r, lx1, lz1) - 0.27, lz1);
    const dx = b[0] - a[0], dz = b[2] - a[2], L = Math.hypot(dx, dz), nx = -dz / L * hw, nz = dx / L * hw;
    const A0 = [a[0] + nx, a[1], a[2] + nz], A1 = [a[0] - nx, a[1], a[2] - nz], B0 = [b[0] + nx, b[1], b[2] + nz], B1 = [b[0] - nx, b[1], b[2] - nz];
    const dn = [0, -1, 0];
    quad4(out, A0, A1, B1, B0, dn);
    quad4(out, A0, B0, [B0[0], B0[1] + hh, B0[2]], [A0[0], A0[1] + hh, A0[2]], [nx, 0, nz]);
    quad4(out, A1, B1, [B1[0], B1[1] + hh, B1[2]], [A1[0], A1[1] + hh, A1[2]], [-nx, 0, -nz]);
    quad4(out, A0, A1, [A1[0], A1[1] + hh, A1[2]], [A0[0], A0[1] + hh, A0[2]], [a[0] - b[0], 0, a[2] - b[2]]);
  };
  const nA = Math.floor((A - 0.9) / pr), nB = Math.floor((B - 0.9) / pr);
  for (let i = -nA; i <= nA; i++) for (const sz of [-1, 1]) stick(i * pr, sz * B, i * pr, sz * (B - o));
  if (spec.kind !== 'gable') for (let i = -nB; i <= nB; i++) for (const sx of [-1, 1]) stick(sx * A, i * pr, sx * (A - o), i * pr);
  bag.t(WH, out);
}
