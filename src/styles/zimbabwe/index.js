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
  for (let i = 0; i < segs; i++) {
    const A = S[i], B = S[(i + 1) % n];
    for (let k = 0; k < 5; k++) tri.push(...A[k], ...B[k], ...B[k + 1], ...A[k], ...B[k + 1], ...A[k + 1]);
    col.segment(path[i], path[(i + 1) % n], th, yOf(path[i]) - 1, yOf(path[i]) + h);
  }
  bag.add(G, fromTriangles(orientOutward(tri)));
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
        const qd = (A, B, C, D) => tris.push(...A, ...B, ...C, ...A, ...C, ...D);
        qd(b0, b1, b2, b3); qd(a3, a2, b2, b3); qd(a0, b0, b3, a3); qd(a1, a2, b2, b1); qd(a0, a1, b1, b0);
      }
    }
    if (tris.length) bag.add('granite_grey', fromTriangles(orientOutward(tris)));
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
function hut(el, { bag, col }) {
  const [x, z] = el.c, r = el.r ?? 3, y = el.y ?? 0, h = el.h ?? 2.2, seed = el.seed ?? Math.floor(Math.abs(x * 13 + z * 7)), ver = r > 3.1;
  const fr = r + (ver ? 1.3 : 0.45);
  bag.add('mud_plaster', lathe([[fr + 0.08, -0.3], [fr + 0.08, 0.12], [fr - 0.04, 0.24], [0.001, 0.24]], 18, null, x, y, z));
  bag.add('mud_plaster', lathe([[r + 0.06, 0], [r - 0.06, h], [0.001, h]], 16, null, x, y + 0.2, z));
  const a = ((seed % 628) / 100), ux = Math.cos(a), uz = Math.sin(a), tx = -uz, tz = ux;
  bag.add('opening', orientedBox([x + ux * (r + 0.02) - tx * 0.42, z + uz * (r + 0.02) - tz * 0.42], [x + ux * (r + 0.02) + tx * 0.42, z + uz * (r + 0.02) + tz * 0.42], 0.06, y + 0.38, y + 1.85));
  bag.add('mud_plaster', orientedBox([x + ux * (r + 0.05) - tx * 0.5, z + uz * (r + 0.05) - tz * 0.5], [x + ux * (r + 0.05) + tx * 0.5, z + uz * (r + 0.05) + tz * 0.5], 0.22, y + 0.2, y + 0.4));
  bag.add('timber', orientedBox([x + ux * (r + 0.07) - tx * 0.55, z + uz * (r + 0.07) - tz * 0.55], [x + ux * (r + 0.07) + tx * 0.55, z + uz * (r + 0.07) + tz * 0.55], 0.14, y + 1.85, y + 1.97));
  const ye = y + 0.2 + h - 0.15, eave = ver ? fr + 0.15 : r + 0.75;
  bag.add('thatch', lathe([[eave, -0.08], [eave - 0.05, 0.06], [(eave + r * 0.5) / 2 + 0.12, eave * 0.36], [(eave + r * 0.5) / 2, eave * 0.36 + 0.05], [r * 0.32, r * 1.0], [0.06, r * 1.22], [0.001, r * 1.3]], 16, (th, i) => (i < 2 ? 1 + 0.025 * Math.sin(th * 11 + seed) : 1), x, ye, z));
  if (ver) for (let k = 0; k < 8; k++) { const b = a + Math.PI / 8 + k * Math.PI / 4; bag.add('timber', lathe([[0.06, 0], [0.055, ye - y - 0.2 + 0.1], [0.001, ye - y - 0.15]], 6, null, x + Math.cos(b) * (fr - 0.2), y + 0.2, z + Math.sin(b) * (fr - 0.2))); }
  col.circle(x, z, r, y, y + h);
}
registerStyle('zimbabwe', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, dry_wall: dryWall, cone_tower: coneTower, daga_hut: hut, platform, soapstone_bird: soapstoneBird, monolith, boulder },
  objects: {},
});
