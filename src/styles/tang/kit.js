// Shared helpers of the Tang style: building in a local frame (a hall or a house is built facing +z and turned into
// place), the Tang roof (broad, low, concave, hipped or gabled, the ridge ending in owl tails), a wall run with openings.

import { box, fromTriangles } from '../../core/geom.js';
import { orientedBox } from '../../core/build.js';

export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** The turn (about y) that takes a local frame facing +z to face `f` ('s' | 'n' | 'e' | 'w'). */
export const YAW = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 };

/**
 * Build `fn(local)` in a frame centred on c = [x, z] at height 0, facing +z, then turned by `yaw` (a multiple of 90°)
 * and placed in the parent's context. The local context's bag, colliders and lights are the parent's, transformed.
 */
export function inFrame(ctx, c, yaw, fn) {
  const list = [], cs = Math.round(Math.cos(yaw)), sn = Math.round(Math.sin(yaw));
  const P = ([x, z]) => [c[0] + x * cs + z * sn, c[1] - x * sn + z * cs];
  const R = (r) => { const a = P([r[0], r[1]]), b = P([r[2], r[3]]); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const D = (d) => { const a = P([0, 0]), b = P(d); return [b[0] - a[0], b[1] - a[1]]; };
  const dirName = (dir) => { const v = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] }[dir], o = D(v); return Math.abs(o[0]) > Math.abs(o[1]) ? (o[0] > 0 ? 'e' : 'w') : (o[1] > 0 ? 's' : 'n'); };
  const col = ctx.col, lcol = {
    floor: (r, y, tag) => col.floor(R(r), y, tag),
    ramp: (r, y0, y1, dir) => col.ramp(R(r), y0, y1, dirName(dir)),
    rect: (r, y0, y1) => col.rect(R(r), y0, y1),
    segment: (a, b, th, y0, y1) => col.segment(P(a), P(b), th, y0, y1),
    circle: (x, z, r, y0, y1) => { const p = P([x, z]); col.circle(p[0], p[1], r, y0, y1); },
  };
  const lights = { push: (l) => { const p = P([l.at[0], l.at[2]]); ctx.lights.push({ ...l, at: [p[0], l.at[1], p[1]] }); } };
  const local = { ...ctx, bag: { add: (m, g) => list.push([m, g]) }, col: lcol, lights, parent: ctx };
  fn(local);
  for (const [m, g] of list) { g.rotateY(yaw); g.translate(c[0], 0, c[1]); ctx.bag.add(m, g); }
}

/** A straight wall on a→b of thickness th from y0 to y1 with openings [{ at, w, h, y0 }] (distance from a, width, height, sill), colliding. */
export function wallRun(ctx, mat, a, b, th, y0, y1, openings = []) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  const ops = openings.map((o) => ({ ...o, s0: o.at - o.w / 2, s1: o.at + o.w / 2, y0: o.y0 ?? y0 })).sort((p, q) => p.s0 - q.s0);
  const piece = (s0, s1, ya, yb) => {
    if (s1 - s0 < 1e-3 || yb - ya < 1e-3) return;
    const p0 = [a[0] + ux * s0, a[1] + uz * s0], p1 = [a[0] + ux * s1, a[1] + uz * s1];
    ctx.bag.add(mat, orientedBox(p0, p1, th, ya, yb));
    ctx.col.segment(p0, p1, th, ya, yb);
  };
  let s = 0;
  for (const o of ops) { piece(s, o.s0, y0, y1); if (o.y0 > y0) piece(o.s0, o.s1, y0, o.y0); piece(o.s0, o.s1, o.y0 + o.h, y1); s = o.s1; }
  piece(s, L, y0, y1);
}

/** Orient a triangle so that its normal's y has the wanted sign (+1 up, −1 down). */
function tri(out, a, b, c, up) {
  const ny = (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]);
  if ((ny >= 0) === (up > 0)) out.push(...a, ...b, ...c); else out.push(...a, ...c, ...b);
}
const qd = (out, a, b, c, d, up) => { tri(out, a, b, c, up); tri(out, a, c, d, up); };
/** A bar from p to q (3D points), width w across, rising h above the line: top and two sides. */
function bar(out, p, q, w, h) {
  const dx = q[0] - p[0], dz = q[2] - p[2], L = Math.hypot(dx, dz) || 1, nx = -dz / L * w / 2, nz = dx / L * w / 2;
  const a = [p[0] + nx, p[1], p[2] + nz], b = [p[0] - nx, p[1], p[2] - nz], c = [q[0] - nx, q[1], q[2] - nz], d = [q[0] + nx, q[1], q[2] + nz];
  const up = (v) => [v[0], v[1] + h, v[2]];
  qd(out, up(a), up(b), up(c), up(d), 1);
  for (const [s, t, sg] of [[a, d, 1], [b, c, -1]]) {
    const A = s, B = t, C = up(t), D = up(s);
    const ny = (B[1] - A[1]) * 0 ; void ny;
    // side face: outward is ±(nx, nz)
    const o = [sg * nx, sg * nz];
    const cr = (B[0] - A[0]) * (C[1] - A[1]) * 0; void cr;
    const e1 = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], e2 = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
    const n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    if (n[0] * o[0] + n[2] * o[1] >= 0) out.push(...A, ...B, ...C, ...A, ...C, ...D); else out.push(...A, ...C, ...B, ...A, ...D, ...C);
  }
}

/**
 * The Tang roof over a hall whose eaves lie on the rectangle cx ± A, cz ± B (A ≥ B), eave edge at height y, rising `rise` to the
 * ridge along x: hipped (the hips run to the ridge's ends) or gabled (`gable`), a concave profile in four steps, the eave edge
 * lifted a little at the corners only, a soffit under it, the ridge and the hips capped, the ridge ended by owl tails (chiwei,
 * height `chi`). Materials: tile (top), soffit, ridge, gableMat (plaster of the gable ends).
 */
export function tangRoof(bag, o) {
  const { cx, cz, A, B, y, rise } = o, N = 4, gable = !!o.gable, thick = o.thick ?? 0.24;
  const tile = o.tile || 'tile_grey', soffit = o.soffit || 'timber_red', ridgeMat = o.ridge || 'roof_ridge';
  const Y = (t) => y + rise * Math.pow(t, 1.35);
  const half = (t) => (gable ? A : A - B * t);                    // the half-length at level t
  const top = [], under = [], fascia = [], rid = [];
  const P = (x, t, z, dy = 0) => [x, Y(t) + dy, z];
  for (let k = 0; k < N; k++) {
    const t0 = k / N, t1 = (k + 1) / N;
    for (const s of [-1, 1]) {
      const z0 = cz + s * B * (1 - t0), z1 = cz + s * B * (1 - t1);
      const q = [P(cx - half(t0), t0, z0), P(cx + half(t0), t0, z0), P(cx + half(t1), t1, z1), P(cx - half(t1), t1, z1)];
      qd(top, q[0], q[1], q[2], q[3], 1);
      qd(under, ...q.map((v) => [v[0], v[1] - thick, v[2]]), -1);
    }
    if (!gable) for (const s of [-1, 1]) {
      const x0 = cx + s * (A - B * t0), x1 = cx + s * (A - B * t1);
      const q = [P(x0, t0, cz - B * (1 - t0)), P(x0, t0, cz + B * (1 - t0)), P(x1, t1, cz + B * (1 - t1)), P(x1, t1, cz - B * (1 - t1))];
      qd(top, q[0], q[1], q[2], q[3], 1);
      qd(under, ...q.map((v) => [v[0], v[1] - thick, v[2]]), -1);
    }
  }
  // the fascia: the eave edge's thickness (all four sides); on a gable roof the rake edge too
  const face = (a, b) => { const ex = b[0] - a[0], ez = b[2] - a[2]; const A2 = [a[0], a[1] - thick, a[2]], B2 = [b[0], b[1] - thick, b[2]]; const n = [ez, -ex]; // a normal in plan
    const q = [A2, B2, b, a]; const e1 = [B2[0] - A2[0], B2[1] - A2[1], B2[2] - A2[2]], e2 = [b[0] - A2[0], b[1] - A2[1], b[2] - A2[2]]; const cr = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    void n; return { q, cr }; };
  const wallOut = (a, b, out) => { const { q, cr } = face(a, b); if (cr[0] * out[0] + cr[2] * out[1] >= 0) fascia.push(...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3]); else fascia.push(...q[0], ...q[2], ...q[1], ...q[0], ...q[3], ...q[2]); };
  wallOut(P(cx - A, 0, cz + B), P(cx + A, 0, cz + B), [0, 1]); wallOut(P(cx - A, 0, cz - B), P(cx + A, 0, cz - B), [0, -1]);
  if (!gable) { wallOut(P(cx + A, 0, cz - B), P(cx + A, 0, cz + B), [1, 0]); wallOut(P(cx - A, 0, cz - B), P(cx - A, 0, cz + B), [-1, 0]); }
  else for (const s of [-1, 1]) for (let k = 0; k < N; k++) for (const sz of [-1, 1]) {
    const t0 = k / N, t1 = (k + 1) / N;
    wallOut(P(cx + s * A, t0, cz + sz * B * (1 - t0)), P(cx + s * A, t1, cz + sz * B * (1 - t1)), [s, 0]);
  }
  // the ridge and the hips
  const Lr = gable ? A : Math.max(0.2, A - B), Yr = Y(1);
  bar(rid, [cx - Lr, Yr - 0.05, cz], [cx + Lr, Yr - 0.05, cz], 0.55, 0.42);
  if (!gable) for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const pts = []; for (let k = 0; k <= N; k++) { const t = k / N; pts.push([cx + sx * (A - B * t), Y(t) - 0.04, cz + sz * B * (1 - t)]); }
    for (let k = 0; k < N; k++) bar(rid, pts[k], pts[k + 1], 0.36, 0.2);
  }
  bag.add(tile, fromTriangles(top)); bag.add(soffit, fromTriangles(under)); bag.add(soffit, fromTriangles(fascia)); bag.add(ridgeMat, fromTriangles(rid));
  // the gable ends closed (plaster), under the roof's profile
  if (gable) for (const s of [-1, 1]) {
    const g = [], x = cx + s * (A - 0.7), at = (t, sz) => [x, Y(t) - thick - 0.04, cz + sz * B * (1 - t)];
    const base = y - thick - 0.5;
    for (let k = 0; k < N; k++) {
      const t0 = k / N, t1 = (k + 1) / N;
      for (const sz of [-1, 1]) { const a = at(t0, sz), b = at(t1, sz), mid0 = [x, base, cz + sz * B * (1 - t0)]; void mid0; tri(g, [x, base, cz], a, b, 0); }
    }
    // (side-facing triangles: set their normal by the winding that faces ±x)
    const fixed = [];
    for (let i = 0; i < g.length; i += 9) {
      const e1 = [g[i + 3] - g[i], g[i + 4] - g[i + 1], g[i + 5] - g[i + 2]], e2 = [g[i + 6] - g[i], g[i + 7] - g[i + 1], g[i + 8] - g[i + 2]];
      const nx = e1[1] * e2[2] - e1[2] * e2[1];
      if (nx * s >= 0) fixed.push(...g.slice(i, i + 9)); else fixed.push(...g.slice(i, i + 3), ...g.slice(i + 6, i + 9), ...g.slice(i + 3, i + 6));
    }
    bag.add(o.gableMat || 'plaster_white', fromTriangles(fixed));
  }
  // the owl tails at the ridge's ends: a stepped, inward-curling horn, 0.5 m wide
  const chi = o.chi ?? Math.min(1.5, 0.7 + rise * 0.15), ends = gable ? [[cx - A + 0.35, -1], [cx + A - 0.35, 1]] : [[cx - Lr - 0.15, -1], [cx + Lr + 0.15, 1]];
  if (o.chiwei !== false) for (const [ex, s] of ends) for (let k = 0; k < 5; k++) {
    const h0 = Yr + 0.3 + k * chi / 5, c0 = ex - s * (k * k / 25) * 0.55 * chi, hw = 0.2 * (1 - k / 7);
    bag.add(ridgeMat, box(c0 - hw, h0, cz - 0.27, c0 + hw, h0 + chi / 5 + 0.02, cz + 0.27));
  }
}
