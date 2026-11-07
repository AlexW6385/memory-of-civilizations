// The stone-walled towns of the Zimbabwe plateau (14th c.; docs/settlements/great-zimbabwe.md §4):
// mortarless walls of dressed granite blocks, battered, curving, with a chevron band near the top;
// the solid conical tower; houses of daga (clay) with conical thatched roofs.

import { registerStyle, STYLES, orientedBox } from '../../core/build.js';
import { lathe, fromTriangles, orientOutward, frustum } from '../../core/geom.js';
import '../qing/index.js';
import { beamTris } from '../ming/index.js';

const G = 'granite_block';
// a smooth curve through the points (Catmull-Rom), resampled about every `step` metres
function smoothPath(pts, closed, step = 1.6) {
  const n = pts.length, out = [], P = (i) => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2), k = Math.max(1, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
    for (let j = 0; j < k; j++) {
      const t = j / k, t2 = t * t, t3 = t2 * t;
      const f = (c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3);
      out.push([f(0), f(1)]);
    }
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}
const hash = (i, k = 0) => { let h = Math.imul(i * 7919 + k * 104729 + 13, 2654435761); h ^= h >>> 15; return (h >>> 0) / 4294967296; };

/**
 * dry_wall: a curving wall along `pts` { h, th, y (or yAt(x, z)), chevron (true, or [f0, f1] of its
 * length), monoliths, closed } — mortarless granite courses, battered on both faces, the ends of an
 * open wall rounded (as at the entrances), the top a little uneven; the chevron band near the top.
 */
function dryWall(el, { bag, col }) {
  const h = el.h ?? 6, th = el.th ?? 3, closed = el.closed, bat = th * 0.17;
  const path = smoothPath(el.pts, closed), n = path.length, yOf = (p) => (el.yAt ? el.yAt(p[0], p[1]) : el.y ?? 0);
  // frames: the outward normal at each point (mitred), the cumulative length
  const fr = [], len = [0];
  for (let i = 0; i < n; i++) {
    const pr = path[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], nx = path[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
    const dx = nx[0] - pr[0], dz = nx[1] - pr[1], L = Math.hypot(dx, dz) || 1;
    fr.push([dz / L, -dx / L]);
    if (i) len.push(len[i - 1] + Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]));
  }
  const total = len[n - 1] + (closed ? Math.hypot(path[0][0] - path[n - 1][0], path[0][1] - path[n - 1][1]) : 0);
  // the top undulates by a few courses; the section: footing, battered faces, the top
  const top = (i) => h * (1 - 0.05 * hash(Math.floor(len[i] / 7)) - 0.03 * Math.sin(len[i] * 0.11));
  const sect = (i) => {
    const [x, z] = path[i], [nx, nz] = fr[i], y = yOf(path[i]), H = top(i), w0 = th / 2, w1 = th / 2 - bat;
    const P = (u, v) => [x + nx * u, y + v, z + nz * u];
    return [P(w0, -1), P(w0, 0), P(w1, H), P(-w1, H), P(-w0, 0), P(-w0, -1)];
  };
  const tri = [], S = path.map((_, i) => sect(i)), segs = closed ? n : n - 1;
  // each face turned by its own side of the wall (outer, top, inner): a curved wall's faces cannot be
  // oriented from the centre of the whole wall
  const put = (a, b, c, w) => {
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const nn = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    if (nn[0] * w[0] + nn[1] * w[1] + nn[2] * w[2] < 0) tri.push(...a, ...c, ...b); else tri.push(...a, ...b, ...c);
  };
  for (let i = 0; i < segs; i++) {
    const A = S[i], B = S[(i + 1) % n], j = (i + 1) % n, nx = (fr[i][0] + fr[j][0]) / 2, nz = (fr[i][1] + fr[j][1]) / 2;
    for (let k = 0; k < 5; k++) {
      const w = k < 2 ? [nx, 0.2, nz] : k === 2 ? [0, 1, 0] : [-nx, 0.2, -nz];
      put(A[k], B[k], B[k + 1], w); put(A[k], B[k + 1], A[k + 1], w);
    }
    col.segment(path[i], path[(i + 1) % n], th, yOf(path[i]) - 1, yOf(path[i]) + h);
  }
  bag.add(G, fromTriangles(tri));
  // the rounded ends of an open wall
  if (!closed) for (const i of [0, n - 1]) {
    const [x, z] = path[i], y = yOf(path[i]);
    bag.add(G, lathe([[th / 2, -1], [th / 2, 0], [th / 2 - bat, top(i)], [0.001, top(i)]], 18, null, x, y, z));
  }
  // the chevron band: blocks set on edge in a zigzag between two plain courses, on the outer face
  const ch = el.chevron === true ? [0, 1] : el.chevron;
  if (ch) {
    const tris = [];
    for (let i = 0; i < segs; i++) {
      const f = len[i] / total;
      if (f < ch[0] || f > ch[1]) continue;
      const a = path[i], b = path[(i + 1) % n], y = yOf(a), H = Math.min(top(i), top((i + 1) % n));
      const off = (v) => th / 2 - bat * (v / h) + 0.03;
      const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, nx = uz, nz = -ux;
      for (const v0 of [H - 1.55, H - 0.6]) {
        const o = off(v0);
        bag.add('granite_grey', orientedBox([a[0] + nx * o, a[1] + nz * o], [b[0] + nx * o, b[1] + nz * o], 0.1, y + v0, y + v0 + 0.15, 0.02));
      }
      const o = off(H - 1.0), mid = y + H - 1.0;
      for (let t = 0; t < L - 0.05; t += 0.4) {
        const up = Math.floor((len[i] + t) / 0.4) % 2 === 0, t1 = Math.min(L, t + 0.4);
        const p0 = [a[0] + ux * t + nx * o, a[1] + uz * t + nz * o], p1 = [a[0] + ux * t1 + nx * o, a[1] + uz * t1 + nz * o];
        const q0 = up ? mid - 0.32 : mid + 0.18, q1 = up ? mid + 0.18 : mid - 0.32;
        // one block on edge, sloping from q0 to q1 across the step: a thin parallelogram
        const P = (p, yy, d) => [p[0] + nx * d, yy, p[1] + nz * d];
        const a0 = P(p0, q0, 0), a1 = P(p1, q1, 0), a2 = P(p1, q1 + 0.14, 0), a3 = P(p0, q0 + 0.14, 0);
        const b0 = P(p0, q0, 0.09), b1 = P(p1, q1, 0.09), b2 = P(p1, q1 + 0.14, 0.09), b3 = P(p0, q0 + 0.14, 0.09);
        const blk = [], qd = (A, B, C, D) => blk.push(...A, ...B, ...C, ...A, ...C, ...D);
        qd(b0, b1, b2, b3); qd(a3, a2, b2, b3); qd(a0, b0, b3, a3); qd(a1, a2, b2, b1); qd(a0, a1, b1, b0);
        tris.push(...orientOutward(blk));     // each block by its own centre
      }
    }
    if (tris.length) bag.add('granite_grey', fromTriangles(tris));
  }
  // the dentelle frieze: a plain course, blocks set with gaps between them like teeth, a plain course
  // over them, near the top of the outer face (zimfieldguide: on the Eastern Enclosure's south wall)
  if (el.dentelle) {
    const [f0, f1] = el.dentelle;
    for (let i = 0; i < segs; i++) {
      const f = len[i] / total;
      if (f < f0 || f > f1) continue;
      const a = path[i], b = path[(i + 1) % n], y = yOf(a), H = Math.min(top(i), top((i + 1) % n)), L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (L < 0.05) continue;
      const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = uz, nz = -ux, off = (v) => th / 2 - bat * (v / h) - 0.04;
      for (const v0 of [H - 0.95, H - 0.45]) { const o = off(v0); bag.add(G, orientedBox([a[0] + nx * o, a[1] + nz * o], [b[0] + nx * o, b[1] + nz * o], 0.2, y + v0, y + v0 + 0.14, 0.02)); }
      const o = off(H - 0.8);
      for (let t = 0.06; t < L - 0.2; t += 0.46) {
        const p0 = [a[0] + ux * t + nx * o, a[1] + uz * t + nz * o], p1 = [a[0] + ux * (t + 0.24) + nx * o, a[1] + uz * (t + 0.24) + nz * o];
        bag.add(G, orientedBox(p0, p1, 0.26, y + H - 0.81, y + H - 0.45));
      }
    }
  }
  // monoliths: tall stones standing on the wall top, a few metres apart
  if (el.monoliths) {
    const [f0, f1] = el.monoliths;
    for (let d = f0 * total + 3; d < f1 * total; d += 5.5) {
      const i = len.findIndex((l) => l >= d);
      if (i < 0) break;
      const [x, z] = path[i], [nx, nz] = fr[i], y = yOf(path[i]) + top(i), hh = 1.2 + hash(i, 3) * 1.4;
      bag.add('granite_grey', orientedBox([x - nz * 0.18, z + nx * 0.18], [x + nz * 0.18, z - nx * 0.18], 0.32, y - 0.2, y + hh));
    }
  }
}
/**
 * cone_tower: the solid conical tower { c, r, h, y, dentelle }: battered sides swelling slightly
 * (zimfieldguide: "plain and has sloping sides swelling slightly"), a flat top; near its top the
 * dentelle course — blocks set with gaps between them like teeth — between two plain courses.
 */
function coneTower(el, { bag, col }) {
  const [x, z] = el.c, r = el.r ?? 2.7, h = el.h ?? 10, y = el.y ?? 0, rt = r * 0.58;
  const R = (t) => r + (rt - r) * t + r * 0.045 * Math.sin(Math.PI * t);
  const prof = [[r + 0.04, -0.5], [r + 0.04, 0]];
  for (let k = 1; k <= 10; k++) prof.push([R(k / 10), h * k / 10]);
  prof.push([0.001, h]);
  bag.add(G, lathe(prof, 28, null, x, y, z));
  if (el.dentelle !== false && h > 6) {
    // the dentelle 0.9 m below the top: a plain course standing out, the teeth, a plain course over them
    const yd = y + h - 0.9, rd = R((h - 0.9) / h);
    bag.add(G, lathe([[0.001, 0], [rd + 0.06, 0], [rd + 0.06, 0.16], [0.001, 0.16]], 28, null, x, yd - 0.16, z));
    bag.add(G, lathe([[0.001, 0], [rd + 0.04, 0], [rd + 0.04, 0.16], [0.001, 0.16]], 28, null, x, yd + 0.24, z));
    const n = Math.round(Math.PI * 2 * rd / 0.5);
    for (let k = 0; k < n; k++) {
      const a = k / n * Math.PI * 2, ux = Math.cos(a), uz = Math.sin(a), tx = -uz, tz = ux;
      bag.add(G, orientedBox([x + ux * (rd - 0.15) - tx * 0.13, z + uz * (rd - 0.15) - tz * 0.13], [x + ux * (rd - 0.15) + tx * 0.13, z + uz * (rd - 0.15) + tz * 0.13], 0.42, yd, yd + 0.24));
    }
  }
  col.circle(x, z, r, y, y + h);
}
/** platform: a round platform of stone faced with dhaka { c, r, h, y }: a battered drum, a step on one side. */
function platform(el, { bag, col }) {
  const [x, z] = el.c, r = el.r, h = el.h ?? 0.9, y = el.y ?? 0;
  bag.add(G, lathe([[r + 0.12, -0.4], [r + 0.12, 0], [r - 0.05, h - 0.06], [r - 0.12, h - 0.06], [0.001, h - 0.06]], 32, null, x, y, z));
  bag.add('mud_plaster', lathe([[r - 0.1, 0], [r - 0.16, 0.06], [0.001, 0.06]], 32, null, x, y + h - 0.06, z));
  const a = el.step ?? 0, ux = Math.cos(a), uz = Math.sin(a);
  bag.add(G, orientedBox([x + ux * (r - 0.3), z + uz * (r - 0.3)], [x + ux * (r + 0.55), z + uz * (r + 0.55)], 1.2, y - 0.2, y + h / 2));
  col.circle(x, z, r, y, y + h); col.floor([x - r * 0.7, z - r * 0.7, x + r * 0.7, z + r * 0.7], y + h);
}
/**
 * soapstone_bird: a bird of soapstone on its column { at, rot, y, s, seed } (Zimbabwe Bird: ~40 cm
 * birds on columns over 90 cm; Posselt: bird and plinth 4 ft 6 in, of one stone): the shaft with
 * a raised zigzag up its face, a ring of a perch, the bird upright with folded wings, legs with
 * toes gripping the ring, the head on a long neck with lips rather than a beak.
 */
function soapstoneBird(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, s = el.s ?? 1, rot = el.rot ?? 0, M = 'soapstone', H = 0.95 * s;
  const fx = Math.sin(rot), fz = -Math.cos(rot), sx = -fz, sz = fx;      // forward (−z turned by rot), side
  const W = (u, v, w) => [x + fx * u + sx * v, y + w, z + fz * u + sz * v], W2 = (u, v) => [x + fx * u + sx * v, z + fz * u + sz * v];
  const put = (g) => bag.add(M, g);
  // the column, a little narrower upward, a socket stone at its foot
  bag.add(G, orientedBox(W2(0, -0.24), W2(0, 0.24), 0.48, y - 0.3, y + 0.12));
  put(orientedBox(W2(0, -0.13 * s), W2(0, 0.13 * s), 0.2 * s, y + 0.12, y + H, -0.015));
  // the zigzag (a chevron run) up the column's face
  const zz = [];
  for (let k = 0; k < 5; k++) {
    const y0 = 0.28 + k * 0.13 * s, sg = k % 2 ? 1 : -1;
    beamTris(zz, W(0.1 * s + 0.012, -0.09 * s * sg, y0), W(0.1 * s + 0.012, 0.09 * s * sg, y0 + 0.13 * s), 0.014, 0.035);
  }
  put(fromTriangles(zz));
  // the perch ring on the column top, the toes over it
  put(lathe([[0.001, 0], [0.16 * s, 0], [0.17 * s, 0.03 * s], [0.16 * s, 0.06 * s], [0.001, 0.06 * s]], 12, null, ...W(0, 0, H)));
  const yb = H + 0.06 * s;
  for (const v of [-0.05, 0.05]) {
    for (const d of [-0.025, 0, 0.025]) put(orientedBox(W2(0.03 * s, v * s + d * s), W2(0.12 * s, v * s + d * s * 1.6), 0.018 * s, y + yb - 0.012 * s, y + yb + 0.012 * s));
    put(lathe([[0.022 * s, 0], [0.018 * s, 0.1 * s], [0.001, 0.11 * s]], 6, null, ...W(0.02 * s, v * s, yb)));      // the legs
  }
  // the body: upright, the breast forward; the wings folded down its sides, the tail behind
  const body = lathe([[0.001, 0], [0.06, 0.02], [0.085, 0.08], [0.09, 0.15], [0.075, 0.22], [0.045, 0.27], [0.001, 0.29]].map(([r, h]) => [r * s, h * s]), 10);
  body.scale(0.8, 1, 1); body.rotateY(-rot); const bp = W(0, 0, yb + 0.08 * s); body.translate(bp[0], bp[1], bp[2]); put(body);
  const ell = (prof, sxs, at, tilt = 0, fwd = false) => { const g = lathe(prof.map(([r, h]) => [r * s, h * s]), 10); g.scale(sxs, 1, 1); if (fwd) g.rotateX(-Math.PI / 2 + tilt); g.rotateY(-rot); g.translate(at[0], at[1], at[2]); put(g); };
  // the wings folded close down the sides, their tips crossing over the tail
  for (const sg of [-1, 1]) ell([[0.001, 0], [0.04, 0.03], [0.05, 0.12], [0.035, 0.2], [0.001, 0.23]], 0.35, W(-0.01 * s, sg * 0.062 * s, yb + 0.07 * s));
  ell([[0.001, 0], [0.04, 0.02], [0.035, 0.1], [0.001, 0.13]], 0.45, W(-0.08 * s, 0, yb + 0.1 * s), Math.PI * 0.75, true);
  // the neck, the head, and the lips — a heavy, closed mouth, not a beak
  ell([[0.03, 0], [0.026, 0.06], [0.024, 0.1], [0.001, 0.11]], 1, W(0.01 * s, 0, yb + 0.27 * s));
  ell([[0.001, 0], [0.032, 0.015], [0.038, 0.045], [0.03, 0.075], [0.001, 0.085]], 0.9, W(0.015 * s, 0, yb + 0.36 * s));
  ell([[0.001, 0], [0.024, 0.01], [0.022, 0.05], [0.012, 0.085], [0.001, 0.09]], 0.8, W(0.03 * s, 0, yb + 0.395 * s), 0.1, true);
  col.circle(x, z, 0.3, y, y + H + 0.5);
}
/** monolith: a tall natural slab of granite standing in a socket { at, rot, h, y }. */
function monolith(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, a = el.rot ?? 0, h = el.h ?? 2.2, ux = Math.cos(a), uz = Math.sin(a);
  bag.add('granite_grey', frustum([-0.22, -0.11, 0.22, 0.11], -0.4, h, 0.06, 0.02, 0.03, 0.02).rotateY(-a).translate(x, y, z));
  void ux; void uz;
  col.circle(x, z, 0.25, y, y + h);
}
/**
 * boulder: one of the granite whalebacks and kopje boulders the Hill Complex's walls run among
 * { c, r, h, y, seed }: a rounded, lumpy, flattened mass set deep in the ground, a few joints.
 */
function boulder(el, { bag, col }) {
  const [x, z] = el.c, r = el.r, h = el.h ?? r * 0.75, y = el.y ?? 0, seed = el.seed ?? 1;
  const n = (th, i) => 1 + 0.12 * Math.sin(th * 3 + seed) + 0.07 * Math.sin(th * 5 + seed * 1.7 + i) + 0.04 * Math.sin(th * 9 + i * 2.1);
  const prof = []; for (let k = 0; k <= 8; k++) { const f = -0.35 + 1.35 * k / 8, a = Math.asin(Math.max(-1, Math.min(1, f))); prof.push([Math.max(0.001, Math.cos(a) * r * (k === 8 ? 0 : 1)), Math.sin(a) * h]); }
  bag.add('rock_boulder', lathe(prof, 18, n, x, y, z));
  col.circle(x, z, r * 0.95, y - h, y + h);
}
/**
 * daga_hut: { c, r, y, h, seed } — a round house of daga (puddled clay) on its raised daga floor
 * with a kerb, the walls a little battered, the doorway with a raised sill facing the yard, the
 * conical thatch in two lifts with a ragged eave; the larger houses with a veranda of posts under
 * the eave (zimfieldguide: dhaka floors and platforms, kerbs; Maund Ruin's circular dhaka houses).
 */
function hut(el, ctx) {
  const { bag, col } = ctx;
  const [x, z] = el.c, r = el.r ?? 3, y = el.y ?? 0, h = el.h ?? 2.2, seed = el.seed ?? Math.floor(Math.abs(x * 13 + z * 7)), ver = r > 3.1;
  const fr = r + (ver ? 1.3 : 0.45);
  bag.add('mud_plaster', lathe([[fr + 0.08, -0.3], [fr + 0.08, 0.12], [fr - 0.04, 0.24], [0.001, 0.24]], 18, null, x, y, z));
  const a = ((seed % 628) / 100), ux = Math.cos(a), uz = Math.sin(a), tx = -uz, tz = ux;
  if (el.open) hutInside(el, ctx, { x, z, r, y, h, a, seed });
  else {
    bag.add('mud_plaster', lathe([[r + 0.06, 0], [r - 0.06, h], [0.001, h]], 16, null, x, y + 0.2, z));
    bag.add('opening', orientedBox([x + ux * (r + 0.02) - tx * 0.42, z + uz * (r + 0.02) - tz * 0.42], [x + ux * (r + 0.02) + tx * 0.42, z + uz * (r + 0.02) + tz * 0.42], 0.06, y + 0.38, y + 1.85));
  }
  bag.add('mud_plaster', orientedBox([x + ux * (r + 0.05) - tx * 0.5, z + uz * (r + 0.05) - tz * 0.5], [x + ux * (r + 0.05) + tx * 0.5, z + uz * (r + 0.05) + tz * 0.5], 0.22, y + 0.2, y + 0.4));
  const yl = el.open ? 2.05 : 1.85;
  bag.add('timber', orientedBox([x + ux * (r + 0.07) - tx * 0.55, z + uz * (r + 0.07) - tz * 0.55], [x + ux * (r + 0.07) + tx * 0.55, z + uz * (r + 0.07) + tz * 0.55], 0.14, y + yl, y + yl + 0.12));
  const ye = y + 0.2 + h - 0.15, eave = ver ? fr + 0.15 : r + 0.75;
  bag.add('thatch', lathe([[eave, -0.08], [eave - 0.05, 0.06], [(eave + r * 0.5) / 2 + 0.12, eave * 0.36], [(eave + r * 0.5) / 2, eave * 0.36 + 0.05], [r * 0.32, r * 1.0], [0.06, r * 1.22], [0.001, r * 1.3]], 16, (th, i) => (i < 2 ? 1 + 0.025 * Math.sin(th * 11 + seed) : 1), x, ye, z));
  if (ver) for (let k = 0; k < 8; k++) { const b = a + Math.PI / 8 + k * Math.PI / 4; bag.add('timber', lathe([[0.06, 0], [0.055, ye - y - 0.2 + 0.1], [0.001, ye - y - 0.15]], 6, null, x + Math.cos(b) * (fr - 0.2), y + 0.2, z + Math.sin(b) * (fr - 0.2))); }
  if (el.open) {
    // the thatch seen from within: a cone a little under the outer one, blackened by the hearth's smoke, the
    // rafters radiating from the wall plate to the apex, a ring of withies binding them
    const yi = ye + 0.12, ri = r - 0.2, apex = ye + r * 1.3 - 0.32;
    bag.add('tar_wood', lathe([[ri, yi], [0.001, apex]].reverse(), 16, null, x, 0, z));
    const raf = [];
    for (let k = 0; k < 14; k++) { const b = a + (k + 0.5) * Math.PI * 2 / 14, c = Math.cos(b), s2 = Math.sin(b); beamTris(raf, [x + c * (ri - 0.05), yi - 0.09, z + s2 * (ri - 0.05)], [x + c * 0.12, apex - 0.18, z + s2 * 0.12], 0.025, 0.05); }
    for (const t of [0.35, 0.65]) { const rr = ri * (1 - t) - 0.04, yy = yi + (apex - yi) * t - 0.13; for (let k = 0; k < 14; k++) { const b0 = a + k * Math.PI * 2 / 14, b1 = b0 + Math.PI * 2 / 14; beamTris(raf, [x + Math.cos(b0) * rr, yy, z + Math.sin(b0) * rr], [x + Math.cos(b1) * rr, yy, z + Math.sin(b1) * rr], 0.018, 0.03); } }
    bag.add('timber', fromTriangles(raf));
  } else col.circle(x, z, r, y, y + h);
}
// a triangle or quad turned to face along w (an approximate outward direction)
function putN(T, w, a, b, c, d) {
  const tri = (p, q, s) => {
    const u = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], v = [s[0] - p[0], s[1] - p[1], s[2] - p[2]];
    const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    if (n[0] * w[0] + n[1] * w[1] + n[2] * w[2] < 0) T.push(...p, ...s, ...q); else T.push(...p, ...q, ...s);
  };
  tri(a, b, c); if (d) tri(a, c, d);
}
/**
 * A solid swept round a vertical axis from angle a0 to a1 { cx, cz, y } of a closed section `prof` [[r, v], …]
 * (counter-clockwise in r, v): the walls of the open houses, the rukuva bench, the kraal's footing. Ends capped.
 */
function arcSolid(T, cx, cz, y, a0, a1, prof, n = 16) {
  const P = (k, j) => { const t = a0 + (a1 - a0) * k / n, [rr, v] = prof[j]; return [cx + Math.cos(t) * rr, y + v, cz + Math.sin(t) * rr]; };
  const m = prof.length, pc = prof.reduce((s, p) => [s[0] + p[0] / m, s[1] + p[1] / m], [0, 0]);
  for (let k = 0; k < n; k++) for (let j = 0; j < m; j++) {
    const j1 = (j + 1) % m, tm = a0 + (a1 - a0) * (k + 0.5) / n, dr = (prof[j][0] + prof[j1][0]) / 2 - pc[0], dv = (prof[j][1] + prof[j1][1]) / 2 - pc[1];
    putN(T, [Math.cos(tm) * dr, dv, Math.sin(tm) * dr], P(k, j), P(k + 1, j), P(k + 1, j1), P(k, j1));
  }
  for (const [k, sg] of [[0, -1], [n, 1]]) {
    const t = k ? a1 : a0, w = [-Math.sin(t) * sg * Math.sign(a1 - a0), 0, Math.cos(t) * sg * Math.sign(a1 - a0)], c = [cx + Math.cos(t) * pc[0], y + pc[1], cz + Math.sin(t) * pc[0]];
    for (let j = 0; j < m; j++) putN(T, w, c, P(k, j), P(k, (j + 1) % m));
  }
}
const potProf = (s) => [[0.001, 0], [0.09, 0.01], [0.16, 0.08], [0.18, 0.16], [0.15, 0.25], [0.1, 0.29], [0.11, 0.31], [0.001, 0.31]].map(([r, v]) => [r * s, v * s]);
/**
 * The inside of an open daga house (docs/settlements/great-zimbabwe.md §14): the wall of daga 0.22 m thick
 * with a real doorway; in the middle the hearth, a shallow hollow with three hearth stones and a pot on them,
 * ash and a few sticks (Herald: "a shallow depression within which are lodged three hearth stones", a central
 * hearth in the kitchen house); against the back wall the rukuva, the curved moulded bench about half a metre
 * high on which the pots stand in pairs one on another; a reed sleeping mat (rukukwe); the grinding stones
 * (guyo nehuyo) by the wall; a water pot by the door; the hearth's glow.
 */
function hutInside(el, { bag, col, lights }, { x, z, r, y, h, a, seed }) {
  const y0 = y + 0.2, y1 = y0 + h, th = 0.22, g = 0.46 / r, T = [];
  // the wall: battered outside, plumb within; over the doorway the wall goes on above the lintel
  const wallProf = [[r - th + 0.06, 0], [r + 0.06, 0], [r - 0.06, h], [r - th, h]];
  arcSolid(T, x, z, y0, a + g, a + Math.PI * 2 - g, wallProf, 22);
  arcSolid(T, x, z, y0, a - g - 0.02, a + g + 0.02, [[r - th + 0.03, 1.97], [r + 0.03, 1.97], [r - 0.06, h], [r - th, h]], 3);
  bag.add('mud_plaster', fromTriangles(T));
  for (let k = 0; k < 22; k++) {
    const t0 = a + g + (Math.PI * 2 - 2 * g) * k / 22, t1 = a + g + (Math.PI * 2 - 2 * g) * (k + 1) / 22, rm = r - th / 2 + 0.03;
    col.segment([x + Math.cos(t0) * rm, z + Math.sin(t0) * rm], [x + Math.cos(t1) * rm, z + Math.sin(t1) * rm], th, y, y1);
  }
  col.floor([x - r * 0.72, z - r * 0.72, x + r * 0.72, z + r * 0.72], y + 0.24);
  const ri = r - th + 0.06, Q = (rr, t) => [x + Math.cos(a + t) * rr, z + Math.sin(a + t) * rr], F = y + 0.24;
  // the hearth: a kerb of daga round the hollow, the bed of ash, three stones, the cooking pot, sticks
  const [hx, hz] = Q(0.25, 0);
  bag.add('mud_plaster', lathe([[0.42, 0], [0.44, 0.04], [0.38, 0.05], [0.34, 0.02]], 14, null, hx, F, hz));
  bag.add('plaster_grey', lathe([[0.35, 0], [0.35, 0.02], [0.001, 0.02]], 12, null, hx, F, hz));
  for (let k = 0; k < 3; k++) { const t = a + k * Math.PI * 2 / 3 + 0.3; bag.add('granite_grey', lathe([[0.001, 0], [0.09, 0.01], [0.1, 0.08], [0.06, 0.15], [0.001, 0.16]], 7, null, hx + Math.cos(t) * 0.2, F, hz + Math.sin(t) * 0.2)); }
  bag.add('pottery_dark', lathe([[0.001, 0.12], [0.12, 0.13], [0.21, 0.24], [0.2, 0.36], [0.15, 0.42], [0.16, 0.44], [0.001, 0.44]], 12, null, hx, F, hz));
  col.circle(hx, hz, 0.32, F, F + 0.45);
  const sticks = [];
  for (let k = 0; k < 4; k++) { const t = a + 1.1 + k * 1.4; beamTris(sticks, [hx + Math.cos(t) * 0.12, F + 0.03, hz + Math.sin(t) * 0.12], [hx + Math.cos(t) * 0.75, F + 0.02, hz + Math.sin(t) * 0.75], 0.022, 0.04); }
  bag.add('timber', fromTriangles(sticks));
  if (lights) lights.push({ at: [hx, F + 0.05, hz], color: '#ff9a4a', intensity: 1.6, distance: 4.5 });   // the fire between the stones, under the pot
  // the rukuva against the back wall, its front rounded over, the pots on it two by two
  const R = [];
  arcSolid(R, x, z, F, a + Math.PI - 0.75, a + Math.PI + 0.75, [[ri - 0.52, 0], [ri, 0], [ri, 0.5], [ri - 0.42, 0.5], [ri - 0.5, 0.46], [ri - 0.53, 0.4]], 12);
  bag.add('mud_plaster', fromTriangles(R));
  col.segment(Q(ri - 0.25, Math.PI - 0.7), Q(ri - 0.25, Math.PI), 0.5, F, F + 0.5); col.segment(Q(ri - 0.25, Math.PI), Q(ri - 0.25, Math.PI + 0.7), 0.5, F, F + 0.5);
  for (const t of [-0.45, 0, 0.45]) {
    const [px, pz] = Q(ri - 0.24, Math.PI + t), s = 1.25 + 0.1 * ((seed + t * 10) % 2);
    bag.add('terracotta', lathe(potProf(s), 12, null, px, F + 0.5, pz));
    bag.add('pottery_dark', lathe(potProf(s * 0.72), 12, null, px, F + 0.5 + 0.31 * s - 0.03, pz));
  }
  // the sleeping mat along one side, the grinding stones on the other
  { const [p0, p1] = [Q(ri - 0.75, 1.0), Q(ri - 0.75, 2.0)]; bag.add('reed_mat', orientedBox(p0, p1, 0.85, F, F + 0.018)); }
  { const [gx, gz] = Q(ri - 0.45, -1.35), t = a - 1.35;
    bag.add('granite_grey', frustum([-0.36, -0.24, 0.36, 0.24], 0, 0.16, 0.04, 0.04, 0.04, 0.04).rotateY(-t).translate(gx, F, gz));
    bag.add('granite_grey', lathe([[0.001, 0], [0.09, 0.005], [0.1, 0.05], [0.07, 0.09], [0.001, 0.1]], 8).scale(1.4, 1, 1).rotateY(-t).translate(gx, F + 0.16, gz)); }
  // the water pot inside the door, on its grass ring
  { const [wx, wz] = Q(ri - 0.35, 0.75); bag.add('thatch', lathe([[0.08, 0], [0.13, 0.02], [0.1, 0.05], [0.06, 0.03], [0.08, 0]], 10, null, wx, F, wz)); bag.add('terracotta', lathe(potProf(1.5), 12, null, wx, F + 0.04, wz)); }
}
/**
 * stone_steps: a stair of granite slabs up a slope along z { x, z0, z1, w, yAt }: each step a slab
 * set into the ground at the slope's height, its tread level, a riser of dressed blocks (the
 * Ancient Ascent; zimfieldguide: it rises through a narrow cleft).
 */
function stoneSteps(el, { bag, col }) {
  const { x, z0, z1, w } = el, sg = Math.sign(z1 - z0), go = 0.42, n = Math.floor(Math.abs(z1 - z0) / go);
  for (let k = 0; k < n; k++) {
    const za = z0 + sg * k * go, zb = za + sg * go, zm = (za + zb) / 2;
    const yt = Math.max(el.yAt(x - w / 2, zm), el.yAt(x + w / 2, zm), el.yAt(x, za), el.yAt(x, zb)) + 0.08;
    const r = [x - w / 2 - 0.02 * (k % 3), Math.min(za, zb), x + w / 2 + 0.02 * ((k + 1) % 3), Math.max(za, zb)];
    bag.add(G, frustum(r, yt - 0.6, yt, 0, 0, 0, 0));
    col.floor(r, yt);
  }
}
/** daga_yard: the court of a homestead, paved with daga, a raised kerb round it { c, r: [a, b], y } (zimfieldguide: courtyards paved with dhaka, often with raised kerbs). */
function dagaYard(el, { bag, col }) {
  const [x, z] = el.c, [a, b] = el.r, y = el.y ?? 0, k = b / a;
  bag.add('mud_plaster', lathe([[a, -0.3], [a, 0.06], [0.001, 0.06]], 32).scale(1, 1, k).translate(x, y, z));
  bag.add('mud_plaster', lathe([[a + 0.12, 0], [a + 0.12, 0.16], [a + 0.02, 0.2], [a - 0.08, 0.16], [a - 0.08, 0.06], [a, 0.06]], 40).scale(1, 1, k).translate(x, y, z));
  col.floor([x - a * 0.7, z - b * 0.7, x + a * 0.7, z + b * 0.7], y + 0.06);
}
/**
 * thatch_roof: the roof over the Recess Enclosure (zimfieldguide: "four slots built within the walls
 * that may have held wooden posts" carrying a thatched roof) { c, r: [a, b], y, h, posts }: four
 * posts standing in the wall, a ring beam on them, a low cone of thatch over the enclosure.
 */
function thatchRoof(el, { bag, col }) {
  const [x, z] = el.c, [a, b] = el.r, y = el.y ?? 0, h = el.h ?? 3.2, k = b / a;
  for (const p of el.posts) {
    bag.add('timber', lathe([[0.11, -0.4], [0.1, h], [0.001, h + 0.02]], 7, null, p[0], el.yAt ? el.yAt(p[0], p[1]) : y, p[1]));
    col.circle(p[0], p[1], 0.12, y, y + h);
  }
  const beam = []; const N = 24;
  for (let i = 0; i < N; i++) { const t0 = Math.PI * 2 * i / N, t1 = Math.PI * 2 * (i + 1) / N; beamTris(beam, [x + Math.cos(t0) * a * 0.92, y + h - 0.12, z + Math.sin(t0) * b * 0.92], [x + Math.cos(t1) * a * 0.92, y + h - 0.12, z + Math.sin(t1) * b * 0.92], 0.07, 0.14); }
  bag.add('timber', fromTriangles(beam));
  const prof = [[a + 0.7, -0.1], [a + 0.65, 0.05], [a * 0.55, a * 0.38], [0.15, a * 0.62], [0.001, a * 0.66]];
  bag.add('thatch', lathe(prof, 24, (th, i) => (i < 2 ? 1 + 0.02 * Math.sin(th * 13) : 1)).scale(1, 1, k).translate(x, y + h, z));
  // the underside of the thatch, seen from within: the same cone a hand's breadth lower, facing down
  bag.add('thatch', lathe(prof.slice(1).map(([r, v]) => [r, v - 0.14]).reverse(), 24).scale(1, 1, k).translate(x, y + h, z));
}
/**
 * kraal: a cattle pen (danga) of the homesteads { c, r, gap (the gate's angle), seed }: a ring of rough posts
 * close set, of uneven height, bound by two rails of withies, a gate of two heavier posts and bars laid by it;
 * the trodden, dunged ground inside.
 */
function kraal(el, { bag, col }) {
  const [x, z] = el.c, r = el.r ?? 6, y = el.y ?? 0, rand = ((s) => () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296))(el.seed ?? 5), g = 1.1 / r, a0 = (el.gap ?? 0) + g, a1 = (el.gap ?? 0) + Math.PI * 2 - g;
  const n = Math.round((a1 - a0) * r / 0.22), rails = [];
  // the posts, rough poles of uneven height
  const P = [];
  for (let k = 0; k <= n; k++) {
    const t = a0 + (a1 - a0) * k / n, rr = r + (rand() - 0.5) * 0.08, hh = 1.35 + rand() * 0.4, w = 0.045 + rand() * 0.02;
    P.push(lathe([[w, -0.3], [w * 0.9, hh], [0.001, hh + 0.04]], 5, null, x + Math.cos(t) * rr, y, z + Math.sin(t) * rr));
  }
  for (const g2 of P) bag.add('bark_grey', g2);
  for (const v of [0.45, 1.1]) for (let k = 0; k < n; k += 3) {
    const t0 = a0 + (a1 - a0) * k / n, t1 = a0 + (a1 - a0) * Math.min(n, k + 3) / n, ro = r + 0.07;
    beamTris(rails, [x + Math.cos(t0) * ro, y + v, z + Math.sin(t0) * ro], [x + Math.cos(t1) * ro, y + v, z + Math.sin(t1) * ro], 0.02, 0.05);
  }
  bag.add('wicker', fromTriangles(rails));
  for (const t of [a0 - 0.04, a1 + 0.04]) bag.add('timber', lathe([[0.1, -0.4], [0.09, 1.9], [0.001, 1.94]], 7, null, x + Math.cos(t) * r, y, z + Math.sin(t) * r));
  const bars = [], ga = el.gap ?? 0, gx = x + Math.cos(ga) * (r + 1.2), gz = z + Math.sin(ga) * (r + 1.2);
  for (let k = 0; k < 3; k++) beamTris(bars, [gx - Math.sin(ga) * 1.4, y + 0.05 + k * 0.08, gz + Math.cos(ga) * 1.4 + k * 0.12], [gx + Math.sin(ga) * 1.4, y + 0.05 + k * 0.08, gz - Math.cos(ga) * 1.4 + k * 0.12], 0.04, 0.08);
  bag.add('timber', fromTriangles(bars));
  bag.add('silt', lathe([[r - 0.1, -0.1], [r - 0.1, 0.02], [0.001, 0.03]], 24, (th) => 1 + 0.03 * Math.sin(th * 5), x, y, z));
  for (let k = 0; k < 16; k++) { const t0 = a0 + (a1 - a0) * k / 16, t1 = a0 + (a1 - a0) * (k + 1) / 16; col.segment([x + Math.cos(t0) * r, z + Math.sin(t0) * r], [x + Math.cos(t1) * r, z + Math.sin(t1) * r], 0.2, y, y + 1.5); }
}
/**
 * trade_goods: the goods of the coast trade set out on a mat in a court of the Valley Ruins { at, rot, y }
 * (Smarthistory: Chinese porcelain, south-east Asian beads, copper ingots; Met: glass beads, porcelain, gold
 * foil, crucibles for gold and copper): coils of glass beads in blue, green and yellow; celadon bowls and a white
 * bowl; a stack of cast copper ingots; coils of gold wire; two iron hoes; a crucible.
 */
function tradeGoods(el, { bag }) {
  const [x, z] = el.at, y = (el.y ?? 0) + 0.02, rot = el.rot ?? 0, c = Math.cos(rot), s = Math.sin(rot);
  const W = (u, v) => [x + c * u - s * v, z + s * u + c * v];
  bag.add('reed_mat', orientedBox(W(-1.1, 0), W(1.1, 0), 1.3, y - 0.02, y));
  const coil = (u, v, R, m, k = 0) => { const [px, pz] = W(u, v), prof = Array.from({ length: 7 }, (_, i) => { const t = -i / 6 * Math.PI * 2; return [R + Math.cos(t) * 0.014, 0.014 + Math.sin(t) * 0.014]; }); bag.add(m, lathe(prof, 18, (th) => 1 + 0.02 * Math.sin(th * 36 + k), px, y + k * 0.024, pz)); };
  [['glaze_blue', -0.8, -0.35], ['glaze_blue', -0.55, -0.4], ['glaze_green', -0.8, 0.0], ['glaze_yellow', -0.55, 0.05], ['glaze_blue', -0.8, 0.35]].forEach(([m, u, v], i) => { for (let k = 0; k < 3; k++) coil(u, v, 0.12 - k * 0.02, m, k); });
  for (const [u, v, m, rr] of [[-0.15, -0.35, 'glaze_green', 0.14], [0.2, -0.35, 'glaze_green', 0.12], [0.02, 0.0, 'glaze_white', 0.11]]) {
    const [px, pz] = W(u, v); bag.add(m, lathe([[0.001, 0], [rr * 0.45, 0.0], [rr * 0.85, rr * 0.35], [rr, rr * 0.62], [rr * 0.93, rr * 0.64], [rr * 0.8, rr * 0.36], [rr * 0.4, rr * 0.1], [0.001, rr * 0.1]], 14, null, px, y, pz));
  }
  // the copper ingots, cast bars stacked crosswise
  for (let k = 0; k < 4; k++) for (let j = 0; j < 3; j++) {
    const along = k % 2 === 0, o = (j - 1) * 0.09, [px, pz] = W(0.6 + (along ? 0 : o), 0.25 + (along ? o : 0)), d = along ? [c, s] : [-s, c];
    bag.add('bronze', orientedBox([px - d[0] * 0.17, pz - d[1] * 0.17], [px + d[0] * 0.17, pz + d[1] * 0.17], 0.07, y + k * 0.035, y + k * 0.035 + 0.032));
  }
  for (let k = 0; k < 3; k++) coil(0.25, 0.4, 0.06 + k * 0.012, 'gold', 0);
  for (const v of [-0.45, -0.2]) { const [p0, p1] = [W(0.55, v), W(0.95, v)]; bag.add('iron', orientedBox(p0, W(0.72, v), 0.03, y, y + 0.02)); bag.add('iron', orientedBox(W(0.72, v), p1, 0.2, y, y + 0.015)); }
  { const [px, pz] = W(0.95, 0.4); bag.add('pottery_dark', lathe([[0.001, 0], [0.05, 0.01], [0.07, 0.08], [0.06, 0.09], [0.04, 0.03], [0.001, 0.03]], 10, null, px, y, pz)); }
}
registerStyle('zimbabwe', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, dry_wall: dryWall, cone_tower: coneTower, daga_hut: hut, platform, soapstone_bird: soapstoneBird, monolith, boulder, stone_steps: stoneSteps, daga_yard: dagaYard, thatch_roof: thatchRoof, kraal, trade_goods: tradeGoods },
  objects: {},
});
