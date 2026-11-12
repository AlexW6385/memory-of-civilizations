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
  // the courses: the face steps in a little at each course (Ebsco/Britannica: "each layer slightly recessed in comparison to
  // the successive layers below"), so the batter is a stair of slabs 0.42 m apart (the granite_block's own coursing) whose
  // treads catch the light; faceW(v) is the half-thickness of the face at height v
  const K = Math.max(2, Math.round(h / 0.42)), faceW = (v, H = h) => th / 2 - bat * (Math.min(K - 1, Math.floor(Math.max(0, v) / (H / K))) + 1) / K;
  const stair = (H) => { const out = []; for (let k = 0; k < K; k++) { const x = th / 2 - bat * (k + 1) / K; out.push([x, H * k / K], [x, H * (k + 1) / K]); } return out; };
  const sect = (i) => {
    const [x, z] = path[i], [nx, nz] = fr[i], y = yOf(path[i]), H = top(i), st = stair(H);
    const P = (u, v) => [x + nx * u, y + v, z + nz * u];
    return [P(th / 2, -1), ...st.map(([u, v]) => P(u, v)), ...st.map(([u, v]) => P(-u, v)).reverse(), P(-th / 2, -1)];
  };
  const tri = [], S = path.map((_, i) => sect(i)), segs = closed ? n : n - 1;
  // each face turned by its own side of the wall (outer, top, inner): a curved wall's faces cannot be
  // oriented from the centre of the whole wall
  const put = (a, b, c, w, arr = tri) => {
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const nn = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    if (nn[0] * w[0] + nn[1] * w[1] + nn[2] * w[2] < 0) arr.push(...a, ...c, ...b); else arr.push(...a, ...b, ...c);
  };
  // the coursing seen from afar: a course's joints fade in the distance, so the faces are laid in patches of
  // lighter, coarser and darker granite, a metre or two high and four to nine metres long (slabs split from different
  // beds differ in tone), which read as courses at fifty metres; the faces of low walls keep one stone
  const patchy = h >= 3.5, lt = [], dk = [];
  const tone = (kc, i) => {
    if (!patchy) return tri;
    const r = hash(Math.floor(kc / 2) * 31 + Math.floor(len[i] / (4 + 5 * hash(Math.floor(kc / 2), 9))), 51);
    return r < 0.24 ? lt : r > 0.84 ? dk : tri;
  };
  for (let i = 0; i < segs; i++) {
    const A = S[i], B = S[(i + 1) % n], j = (i + 1) % n, nx = (fr[i][0] + fr[j][0]) / 2, nz = (fr[i][1] + fr[j][1]) / 2;
    for (let k = 0; k < A.length - 1; k++) {
      const w = k < 2 * K ? [nx, 0.2, nz] : k === 2 * K ? [0, 1, 0] : [-nx, 0.2, -nz];
      const arr = k === 2 * K ? tri : tone(k < 2 * K ? k : 4 * K - k + 1, i);
      put(A[k], B[k], B[k + 1], w, arr); put(A[k], B[k + 1], A[k + 1], w, arr);
    }
    col.segment(path[i], path[(i + 1) % n], th, yOf(path[i]) - 1, yOf(path[i]) + h);
  }
  bag.add(G, fromTriangles(tri));
  if (lt.length) bag.add('granite_rough', fromTriangles(lt));
  if (dk.length) bag.add('andesite', fromTriangles(dk));
  // fallen and tumbled blocks along the foot of both faces: slabs that have come off the courses, lying where they fell
  if (el.rubble !== false && h >= 3) {
    const Nb = Math.floor(len[n - 1] / 2.3);
    for (let j = 0; j < Nb; j++) {
      const i = Math.min(n - 2, Math.max(0, len.findIndex((l) => l >= hash(j, 31) * len[n - 1]))), a = path[i], b = path[i + 1], L0 = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      const tx = (b[0] - a[0]) / L0, tz = (b[1] - a[1]) / L0, nx = tz, nz = -tx, side = hash(j, 32) > 0.5 ? 1 : -1, u = side * (th / 2 + 0.15 + hash(j, 33) * 0.7);
      const cx = a[0] + nx * u, cz = a[1] + nz * u, w = 0.35 + hash(j, 34) * 0.55, d = 0.3 + hash(j, 35) * 0.3, tw = (hash(j, 36) - 0.5) * 1.2, ca = Math.cos(tw), sa = Math.sin(tw);
      const ux = tx * ca - tz * sa, uz = tx * sa + tz * ca, y = yOf(a);
      bag.add(hash(j, 37) < 0.25 ? 'granite_rough' : G, orientedBox([cx - ux * w / 2, cz - uz * w / 2], [cx + ux * w / 2, cz + uz * w / 2], d, y - 0.08, y + 0.14 + hash(j, 38) * 0.26, 0.04));
    }
  }
  // what grows on and under the walls: tufts of dry grass on the wall top and at the foot, here and there an aloe rosette on the
  // top (aloes grow out of the granite of the plateau; inferred), each leaf a flat blade; sparse, a cluster every few metres
  if (h >= 3.5) {
    const dry = [], green = [], total2 = len[n - 1];
    const blade = (arr, x, y, z, ang, lean, L, w) => {
      const c = Math.cos(ang), s2 = Math.sin(ang), tx = -s2, tz = c, tip = [x + c * lean * L, y + L * Math.sqrt(Math.max(0.05, 1 - lean * lean)), z + s2 * lean * L];
      const a = [x - tx * w, y, z - tz * w], b = [x + tx * w, y, z + tz * w];
      arr.push(...a, ...b, ...tip, ...a, ...tip, ...b);
    };
    for (let j = 0, N = Math.floor(total2 / 5.2); j < N; j++) {
      const d = (j + hash(j, 61)) * 5.2, i = Math.min(n - 2, Math.max(0, len.findIndex((l) => l >= d)));
      const [x, z] = path[i], [nx, nz] = fr[i], r = hash(j, 62);
      if (r < 0.62) {
        // dry grass on the top, a little to one side of the middle
        const u = (hash(j, 63) - 0.5) * th * 0.55, y = yOf(path[i]) + top(i) - 0.04, bx = x + nx * u, bz = z + nz * u;
        for (let k = 0; k < 11; k++) blade(dry, bx + (hash(j * 11 + k, 64) - 0.5) * 0.25, y, bz + (hash(j * 11 + k, 65) - 0.5) * 0.25, hash(j * 11 + k, 66) * 6.28, 0.35 + hash(j * 11 + k, 67) * 0.4, 0.35 + hash(j * 11 + k, 68) * 0.4, 0.022);
      } else if (r < 0.74) {
        // an aloe rosette on the top: eight thick leaves, curving up and out
        const u = (hash(j, 63) - 0.5) * th * 0.4, y = yOf(path[i]) + top(i) - 0.03, bx = x + nx * u, bz = z + nz * u;
        for (let k = 0; k < 9; k++) blade(green, bx, y, bz, k / 9 * 6.28 + hash(j, 69), 0.6, 0.5 + 0.1 * (k % 2), 0.07);
      }
      // at the foot of either face, grass in the lee of the stone
      if (hash(j, 70) < 0.55) {
        const side = hash(j, 71) > 0.5 ? 1 : -1, u = side * (th / 2 + 0.25 + hash(j, 72) * 0.4), y = yOf(path[i]) - 0.02, bx = x + nx * u, bz = z + nz * u;
        for (let k = 0; k < 13; k++) blade(dry, bx + (hash(j * 13 + k, 73) - 0.5) * 0.4, y, bz + (hash(j * 13 + k, 74) - 0.5) * 0.4, hash(j * 13 + k, 75) * 6.28, 0.3 + hash(j * 13 + k, 76) * 0.45, 0.45 + hash(j * 13 + k, 77) * 0.55, 0.025);
      }
    }
    if (dry.length) bag.add('reed_mat', fromTriangles(dry));
    if (green.length) bag.add('flax_leaf', fromTriangles(green));
  }
  // the rounded ends of an open wall
  if (!closed) for (const i of [0, n - 1]) {
    const [x, z] = path[i], y = yOf(path[i]);
    bag.add(G, lathe([[th / 2, -1], [th / 2, 0], ...stair(top(i)), [0.001, top(i)]], 18, null, x, y, z));
  }
  // the chevron band: blocks set on edge in a zigzag between two plain courses, on the outer face
  const ch = el.chevron === true ? [0, 1] : el.chevron;
  if (ch) {
    const tris = [];
    for (let i = 0; i < segs; i++) {
      const f = len[i] / total;
      if (f < ch[0] || f > ch[1]) continue;
      const a = path[i], b = path[(i + 1) % n], y = yOf(a), H = Math.min(top(i), top((i + 1) % n));
      const off = (v) => faceW(v, H) + 0.03;
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
      const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = uz, nz = -ux, off = (v) => faceW(v, H) - 0.02;
      for (const v0 of [H - 0.95, H - 0.45]) { const o = off(v0); bag.add(G, orientedBox([a[0] + nx * o, a[1] + nz * o], [b[0] + nx * o, b[1] + nz * o], 0.2, y + v0, y + v0 + 0.14, 0.02)); }
      const o = off(H - 0.8);
      for (let t = 0.06; t < L - 0.2; t += 0.46) {
        const p0 = [a[0] + ux * t + nx * o, a[1] + uz * t + nz * o], p1 = [a[0] + ux * (t + 0.24) + nx * o, a[1] + uz * (t + 0.24) + nz * o];
        bag.add(G, orientedBox(p0, p1, 0.26, y + H - 0.81, y + H - 0.45));
      }
    }
  }
  // weathering: patches of lichen lying flat on single courses of both faces, grey-green and a few yellow-orange,
  // more on the lower courses where the stone stays damp (dossier §15)
  {
    const dens = el.lichen ?? 0.16, N = Math.floor(total * dens * Math.min(1, h / 4)), gT = [], oT = [];
    const fan = (arr, c, ring, w) => { for (let k = 0; k < ring.length; k++) { const p = ring[k], q = ring[(k + 1) % ring.length], u = [p[0] - c[0], p[1] - c[1], p[2] - c[2]], v = [q[0] - c[0], q[1] - c[1], q[2] - c[2]], nn = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; if (nn[0] * w[0] + nn[1] * w[1] + nn[2] * w[2] < 0) arr.push(...c, ...q, ...p); else arr.push(...c, ...p, ...q); } };
    for (let j = 0; j < N; j++) {
      const d = hash(j, 11) * (closed ? total : len[n - 1]);
      let i = len.findIndex((l) => l >= d); if (i < 1) continue;
      const a = path[i - 1], b = path[i % n], L0 = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, tx = (b[0] - a[0]) / L0, tz = (b[1] - a[1]) / L0, nx = tz, nz = -tx;
      const side = hash(j, 13) > 0.5 ? 1 : -1, kc = Math.min(K - 5, Math.floor(Math.pow(hash(j, 12), 1.7) * (K - 4)));
      if (kc < 0) continue;
      const H = top(i), y = yOf(path[i]), v0 = H * kc / K, vh = H / K, rw = 0.12 + hash(j, 14) * 0.5, rv = vh * (0.22 + hash(j, 15) * 0.2);
      const cu = side * (faceW(v0 + 0.02, H) + 0.012), cx = path[i][0] + nx * cu, cz = path[i][1] + nz * cu, cy = y + v0 + vh * 0.5;
      const ring = [];
      for (let k = 0; k < 7; k++) { const t = k / 7 * Math.PI * 2, jr = 0.7 + 0.3 * hash(j * 7 + k, 16); ring.push([cx + tx * Math.cos(t) * rw * jr, cy + Math.sin(t) * rv * jr, cz + tz * Math.cos(t) * rw * jr]); }
      fan(hash(j, 17) < 0.2 ? oT : gT, [cx, cy, cz], ring, [nx * side, 0.1, nz * side]);
    }
    if (gT.length) bag.add('plaster_damp', fromTriangles(gT));
    if (oT.length) bag.add('paint_ochre', fromTriangles(oT));
  }
  // drains: roofed outlets at the foot of the outer face (zimfieldguide: "six original drainage outlets in the
  // north-east side of the Great Outer Wall", five roofed with stone): a dark opening between two jamb stones, a slab over it
  if (el.drains) for (const f of el.drains) {
    const i = Math.min(n - 2, Math.max(1, len.findIndex((l) => l >= f * total))), a = path[i], b = path[i + 1], L0 = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, tx = (b[0] - a[0]) / L0, tz = (b[1] - a[1]) / L0, nx = tz, nz = -tx, y = yOf(a), u = faceW(0.1);
    const P = (t, uu) => [a[0] + tx * t + nx * uu, a[1] + tz * t + nz * uu];
    bag.add('opening', orientedBox(P(-0.17, u + 0.012), P(0.17, u + 0.012), 0.04, y, y + 0.34));
    for (const t of [-0.27, 0.27]) bag.add('granite_grey', orientedBox(P(t - 0.09, u + 0.06), P(t + 0.09, u + 0.06), 0.2, y - 0.02, y + 0.4));
    bag.add('granite_grey', orientedBox(P(-0.5, u + 0.07), P(0.5, u + 0.07), 0.28, y + 0.34, y + 0.46));
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
/**
 * termite_mound: a termite hill of the savanna { c, r, h, y, seed }: a lumpy cone of red earth, a ragged top with a chimney or
 * two, a darker skirt of loose soil at its foot, a few stems of dry grass round it.
 */
function termiteMound(el, { bag, col }) {
  const [x, z] = el.c, r = el.r ?? 1, h = el.h ?? 1.5, y = el.y ?? 0, seed = el.seed ?? 1;
  const n = (th, i) => 1 + 0.18 * Math.sin(th * 3 + seed) + 0.1 * Math.sin(th * 7 + seed * 1.3 + i * 0.9);
  bag.add('banco', lathe([[r * 1.25, -0.2], [r * 1.18, 0.05], [r * 0.85, h * 0.3], [r * 0.6, h * 0.6], [r * 0.38, h * 0.85], [r * 0.2, h * 0.97], [0.001, h]], 10, n, x, y, z));
  for (let k = 0; k < 2; k++) { const a = seed * 0.7 + k * 2.4, cx = x + Math.cos(a) * r * 0.35, cz = z + Math.sin(a) * r * 0.35; bag.add('banco', lathe([[r * 0.2, 0], [r * 0.13, h * 0.2], [r * 0.07, h * 0.3], [0.001, h * 0.32]], 6, null, cx, y + h * 0.78, cz)); }
  bag.add('silt', lathe([[r * 1.9, 0], [r * 1.3, 0.12], [0.001, 0.14]], 10, (th) => 1 + 0.15 * Math.sin(th * 4 + seed), x, y - 0.02, z));
  col.circle(x, z, r * 0.9, y, y + h);
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
  // the foot of the wall splashed dark by the rain off the eaves, a hand's breadth of earth and dung-wash above the kerb
  bag.add('silt', lathe([[r + 0.075, 0.2], [r + 0.065, 0.5], [r + 0.06, 0.52], [r + 0.02, 0.5], [r + 0.02, 0.2]], 18, (th) => 1 + 0.01 * Math.sin(th * 7 + seed), x, y, z));
  if (el.open) hutInside(el, ctx, { x, z, r, y, h, a, seed });
  else {
    // each house's daga is its own earth: the walls differ a little in tone from house to house (Shona houses were replastered by hand each season)
    bag.add(['mud_plaster', 'banco_smooth', 'adobe_taos', 'kahgel'][seed % 4], lathe([[r + 0.06, 0], [r - 0.06, h], [0.001, h]], 16, null, x, y + 0.2, z));
    // a screen of woven reed leaning against the wall at one side of the door, a water stain streaking the daga below the eave
    if (seed % 2 === 1) bag.add('reed_mat', orientedBox([x + ux * (r + 0.1) + tx * 0.62, z + uz * (r + 0.1) + tz * 0.62], [x + ux * (r + 0.1) + tx * 1.02, z + uz * (r + 0.1) + tz * 1.02], 0.07, y + 0.22, y + 1.55));
    if (seed % 3 === 0) {
      // a band painted in ochre and white round the wall, hanging triangles under it (the patterns painted and cut into Shona daga walls; inferred)
      const rb = r + 0.06 - 0.12 * (1.45 / h) + 0.012, T = [], W2 = [], N = 18;
      bag.add('paint_ochre', lathe([[rb, 0], [rb, 0.1], [rb - 0.004, 0.1]], 18, null, x, y + 0.2 + 1.45, z));
      for (let k = 0; k < N; k++) {
        const t0 = a + 0.5 + (Math.PI * 2 - 1.0) * k / N, t1 = a + 0.5 + (Math.PI * 2 - 1.0) * (k + 1) / N, tm = (t0 + t1) / 2, ro = rb - 0.012, yy = y + 0.2 + 1.45;
        putN(k % 2 ? W2 : T, [Math.cos(tm), 0, Math.sin(tm)], [x + Math.cos(t0) * ro, yy, z + Math.sin(t0) * ro], [x + Math.cos(t1) * ro, yy, z + Math.sin(t1) * ro], [x + Math.cos(tm) * ro, yy - 0.2, z + Math.sin(tm) * ro]);
      }
      bag.add('paint_ochre', fromTriangles(T)); bag.add('paint_white', fromTriangles(W2));
    }
    bag.add('opening', orientedBox([x + ux * (r + 0.02) - tx * 0.42, z + uz * (r + 0.02) - tz * 0.42], [x + ux * (r + 0.02) + tx * 0.42, z + uz * (r + 0.02) + tz * 0.42], 0.06, y + 0.38, y + 1.85));
  }
  bag.add('mud_plaster', orientedBox([x + ux * (r + 0.05) - tx * 0.5, z + uz * (r + 0.05) - tz * 0.5], [x + ux * (r + 0.05) + tx * 0.5, z + uz * (r + 0.05) + tz * 0.5], 0.22, y + 0.2, y + 0.4));
  const yl = el.open ? 2.05 : 1.85;
  bag.add('timber', orientedBox([x + ux * (r + 0.07) - tx * 0.55, z + uz * (r + 0.07) - tz * 0.55], [x + ux * (r + 0.07) + tx * 0.55, z + uz * (r + 0.07) + tz * 0.55], 0.14, y + yl, y + yl + 0.12));
  const ye = y + 0.2 + h - 0.15, eave = ver ? fr + 0.15 : r + 0.75;
  bag.add(seed % 5 < 2 ? 'thatch_palm' : 'thatch', lathe([[eave, -0.08], [eave - 0.05, 0.06], [(eave + r * 0.5) / 2 + 0.12, eave * 0.36], [(eave + r * 0.5) / 2, eave * 0.36 + 0.05], [r * 0.32, r * 1.0], [0.06, r * 1.22], [0.001, r * 1.3]], 16, (th, i) => (i < 2 ? 1 + 0.025 * Math.sin(th * 11 + seed) : 1), x, ye, z));
  // the thatch bound down with rings of withy: two bands round the cone, standing a finger's breadth out of it
  for (const [rr, vv] of [[0.78, 0.5], [0.52, 0.8]]) {
    const E0 = [(eave + r * 0.5) / 2, eave * 0.36 + 0.05], T0 = [r * 0.32, r * 1.0], P0 = [0.06, r * 1.22];
    const [pa, pb] = vv < 0.6 ? [E0, T0] : [T0, P0], f = vv < 0.6 ? vv / 0.6 : (vv - 0.6) / 0.4, rc = pa[0] + (pb[0] - pa[0]) * f, hc = pa[1] + (pb[1] - pa[1]) * f;
    bag.add('wicker', lathe([[rc + 0.045, -0.03], [rc + 0.05, 0.0], [rc + 0.045, 0.03], [rc + 0.01, 0.03], [rc + 0.01, -0.03]], 20, null, x, ye + hc, z));
    void rr;
  }
  // a clay pot set over the apex of some roofs, to shed the rain from the point
  if (seed % 4 === 1) bag.add('terracotta', lathe(potProf(0.7).map(([rr, vv]) => [rr, -vv + 0.22]).reverse(), 8, null, x, ye + r * 1.3 - 0.06, z));
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
  // the shelf for the plates and cups on the wall above the rukuva (Herald: "interior walls carry shelves"), of daga, bowls on it
  { const S = []; arcSolid(S, x, z, y0, a + Math.PI - 0.6, a + Math.PI + 0.6, [[ri - 0.22, 1.22], [ri, 1.22], [ri, 1.3], [ri - 0.22, 1.3]], 10); bag.add('mud_plaster', fromTriangles(S));
    for (const t of [-0.42, -0.14, 0.14, 0.42]) { const [bx, bz] = Q(ri - 0.12, Math.PI + t); bag.add(t < 0 ? 'terracotta' : 'pottery_dark', lathe([[0.001, 0], [0.04, 0], [0.09, 0.05], [0.1, 0.075], [0.085, 0.077], [0.07, 0.05], [0.001, 0.03]], 10, null, bx, y0 + 1.3, bz)); } }
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
/**
 * granary: a grain bin of the homesteads { c, y, rot (the way its door faces), seed }: a drum of daga plastered over
 * a frame of poles, bellied, set on a ring of flat stones with a floor of poles over them so the grain stays dry and
 * the rats out, a conical thatched roof with a deep eave, a small door high in the wall with a notched pole leaning
 * to it (Hall's work destroyed "store huts and grain bins" in the Great Enclosure: zimfieldguide; the form is inferred
 * from the Shona granaries of later times).
 */
function granary(el, { bag, col }) {
  const [x, z] = el.c, y = el.y ?? 0, rot = el.rot ?? 0, ux = Math.cos(rot), uz = Math.sin(rot), tx = -uz, tz = ux, F = 0.42;
  for (let k = 0; k < 7; k++) { const t = k / 7 * Math.PI * 2 + 0.2; bag.add('granite_rough', lathe([[0.001, -0.2], [0.17, -0.2], [0.18, 0.1], [0.15, F - 0.05], [0.001, F - 0.05]], 7, (th) => 1 + 0.1 * Math.sin(th * 3 + k), x + Math.cos(t) * 0.62, y, z + Math.sin(t) * 0.62)); }
  bag.add('timber', lathe([[0.001, 0], [0.98, 0], [1.0, 0.07], [0.001, 0.07]], 14, null, x, y + F - 0.05, z));
  const yb = y + F + 0.02, body = [[0.001, 0], [0.86, 0], [0.95, 0.35], [1.02, 0.85], [0.98, 1.4], [0.9, 1.8], [0.84, 2.0], [0.001, 2.0]];
  bag.add('mud_plaster', lathe(body, 18, (th, i) => 1 + (i > 0 && i < 7 ? 0.02 * Math.sin(th * 5 + (el.seed ?? 1)) : 0), x, yb, z));
  bag.add('mud_plaster', lathe([[0.91, 1.9], [0.93, 1.95], [0.86, 2.02], [0.001, 2.02]], 18, null, x, yb, z));
  const yr = yb + 2.0;
  bag.add('thatch', lathe([[1.38, -0.12], [1.34, 0.04], [0.8, 0.42], [0.5, 0.78], [0.2, 1.12], [0.05, 1.3], [0.001, 1.34]], 18, (th, i) => (i < 2 ? 1 + 0.03 * Math.sin(th * 9) : 1), x, yr, z));
  bag.add('thatch', lathe([[0.001, 1.14], [0.5, 0.64], [1.3, -0.04], [1.34, -0.08]], 18, null, x, yr, z));
  bag.add('wicker', lathe([[0.62, 0.45], [0.66, 0.5], [0.62, 0.55], [0.58, 0.5]], 14, null, x, yr, z));
  // the door: a small square opening high in the wall, a daga lip round it, a notched pole leaning to it
  const dr = 1.0;
  bag.add('mud_plaster', orientedBox([x + ux * dr - tx * 0.27, z + uz * dr - tz * 0.27], [x + ux * dr + tx * 0.27, z + uz * dr + tz * 0.27], 0.12, yb + 0.95, yb + 1.5));
  bag.add('opening', orientedBox([x + ux * (dr + 0.045) - tx * 0.17, z + uz * (dr + 0.045) - tz * 0.17], [x + ux * (dr + 0.045) + tx * 0.17, z + uz * (dr + 0.045) + tz * 0.17], 0.06, yb + 1.05, yb + 1.4));
  const T = [], bx = x + ux * (dr + 0.1), bz = z + uz * (dr + 0.1), gx = x + ux * (dr + 1.0), gz = z + uz * (dr + 1.0);
  beamTris(T, [gx, y, gz], [bx, yb + 1.1, bz], 0.04, 0.06);
  for (let k = 0; k < 4; k++) { const f = 0.2 + k * 0.2, px = gx + (bx - gx) * f, pz = gz + (bz - gz) * f, py = y + (yb + 1.1 - y) * f; beamTris(T, [px - tx * 0.12, py, pz - tz * 0.12], [px + tx * 0.12, py, pz + tz * 0.12], 0.03, 0.05); }
  bag.add('timber', fromTriangles(T));
  col.circle(x, z, 1.05, y, yr + 1.3);
}
/**
 * compound: the wall of a homestead { c, r, gap (the gate's angle), y, yAt, seed }: a low wall of granite rubble set
 * in courses, rounded on top, running in sections along the ground, broken by the gate with a post either side; by it a
 * stack of firewood and two stones to sit on (the daga houses and the granary stand inside, as their own elements).
 */
function compound(el, { bag, col }) {
  const [x, z] = el.c, r = el.r ?? 9, g = 1.3 / r, a0 = (el.gap ?? 0) + g, a1 = (el.gap ?? 0) + Math.PI * 2 - g, N = 14, T = [];
  for (let k = 0; k < N; k++) {
    const t0 = a0 + (a1 - a0) * k / N, t1 = a0 + (a1 - a0) * (k + 1) / N, tm = (t0 + t1) / 2, y = (el.yAt ? el.yAt(x + Math.cos(tm) * r, z + Math.sin(tm) * r) : el.y ?? 0), hh = 1.1 + 0.12 * Math.sin(k * 2.3 + (el.seed ?? 0));
    const T1 = [];
    arcSolid(T1, x, z, y, t0, t1, [[r - 0.3, -0.7], [r + 0.3, -0.7], [r + 0.25, hh - 0.1], [r + 0.1, hh], [r - 0.1, hh], [r - 0.25, hh - 0.1]], 3);
    bag.add(G, fromTriangles(T1));
    col.segment([x + Math.cos(t0) * r, z + Math.sin(t0) * r], [x + Math.cos(t1) * r, z + Math.sin(t1) * r], 0.6, y - 0.5, y + hh);
  }
  const ga = el.gap ?? 0, yg = el.yAt ? el.yAt(x + Math.cos(ga) * r, z + Math.sin(ga) * r) : el.y ?? 0;
  for (const t of [a0 - 0.02, a1 + 0.02]) bag.add('timber', lathe([[0.1, -0.4], [0.09, 1.6], [0.001, 1.64]], 7, null, x + Math.cos(t) * r, yg, z + Math.sin(t) * r));
  // firewood against the wall inside, opposite the gate, and two stones for sitting
  const wa = ga + Math.PI, wx = x + Math.cos(wa) * (r - 1.1), wz = z + Math.sin(wa) * (r - 1.1), wy = el.yAt ? el.yAt(wx, wz) : el.y ?? 0, tx = -Math.sin(wa), tz = Math.cos(wa);
  for (let k = 0; k < 9; k++) { const o = (k % 3 - 1) * 0.16, layer = Math.floor(k / 3), l = 1.1 - layer * 0.12; beamTris(T, [wx + tx * (o * 1 + (layer - 1) * 0.1) - Math.cos(wa) * l / 2, wy + 0.08 + layer * 0.12, wz + tz * (o + (layer - 1) * 0.1) - Math.sin(wa) * l / 2], [wx + tx * (o + (layer - 1) * 0.1) + Math.cos(wa) * l / 2, wy + 0.08 + layer * 0.12, wz + tz * (o + (layer - 1) * 0.1) + Math.sin(wa) * l / 2], 0.04, 0.07); }
  bag.add('bark_grey', fromTriangles(T));
  for (const [u, v] of [[-2.2, -0.4], [-1.8, 0.7]]) { const sx = x + Math.cos(wa) * (r - 3.6) + tx * v * 2 + Math.cos(wa) * u * 0.2, sz = z + Math.sin(wa) * (r - 3.6) + tz * v * 2 + Math.sin(wa) * u * 0.2; bag.add('granite_rough', lathe([[0.001, -0.1], [0.27, -0.1], [0.3, 0.1], [0.22, 0.26], [0.001, 0.28]], 8, (th) => 1 + 0.12 * Math.sin(th * 3 + u), sx, el.yAt ? el.yAt(sx, sz) : el.y ?? 0, sz)); }
}

/**
 * homestead_goods: the yard of a homestead dressed at eye level { c, r, gap, seed } — an open hearth of three stones with a
 * pot and sticks, a wooden mortar with its pestle (duri), a drying rack of poles with gourds and grain on it (dara), a group of
 * pots, a basket of grain, hoe and axe leaning to the house wall, a mat with grain spread to dry [forms inferred from Shona
 * homesteads of later times; the pots, hearth stones and grinding gear are stated for the houses, Herald].
 */
function homesteadGoods(el, { bag, col }) {
  const [x, z] = el.c, y = (el.yAt ? el.yAt(x, z) : el.y ?? 0) + 0.06, a = ((el.seed ?? 3) % 628) / 100, c = Math.cos(a), s = Math.sin(a), T = [];
  const W = (u, v) => [x + c * u - s * v, z + s * u + c * v], at = (u, v) => { const [px, pz] = W(u, v); return [px, pz]; };
  // the open hearth
  { const [hx, hz] = at(-1.3, 1.0);
    bag.add('plaster_grey', lathe([[0.4, 0], [0.4, 0.015], [0.001, 0.015]], 12, null, hx, y, hz));
    for (let k = 0; k < 3; k++) { const t = k * 2.1 + a; bag.add('granite_grey', lathe([[0.001, 0], [0.09, 0.01], [0.1, 0.09], [0.06, 0.17], [0.001, 0.18]], 7, null, hx + Math.cos(t) * 0.2, y, hz + Math.sin(t) * 0.2)); }
    bag.add('pottery_dark', lathe([[0.001, 0.14], [0.13, 0.15], [0.23, 0.27], [0.22, 0.4], [0.17, 0.46], [0.18, 0.48], [0.001, 0.48]], 12, null, hx, y, hz));
    for (let k = 0; k < 4; k++) { const t = a + 0.7 + k * 1.5; beamTris(T, [hx + Math.cos(t) * 0.1, y + 0.03, hz + Math.sin(t) * 0.1], [hx + Math.cos(t) * 0.7, y + 0.02, hz + Math.sin(t) * 0.7], 0.022, 0.04); } }
  // the wooden mortar and its pestle
  { const [mx, mz] = at(1.5, -0.8);
    bag.add('timber', lathe([[0.001, 0], [0.2, 0], [0.21, 0.05], [0.14, 0.3], [0.2, 0.62], [0.22, 0.66], [0.15, 0.62], [0.001, 0.5]], 10, null, mx, y, mz));
    beamTris(T, [mx + 0.05, y + 0.45, mz], [mx + 0.45, y + 1.65, mz + 0.1], 0.05, 0.05); col.circle(mx, mz, 0.24, y, y + 0.66); }
  // the drying rack: four posts, a floor of poles at breast height, gourds and cobs of grain on it
  { const P = [[-0.6, -0.45], [0.6, -0.45], [0.6, 0.45], [-0.6, 0.45]].map(([u, v]) => at(0.3 + u, 1.5 + v));
    for (const [px, pz] of P) bag.add('timber', lathe([[0.05, -0.2], [0.045, 1.5], [0.001, 1.53]], 5, null, px, y, pz));
    for (let k = 0; k < 6; k++) { const v = -0.4 + k * 0.16, [p0x, p0z] = at(-0.4, 1.5 + v), [p1x, p1z] = at(1.0, 1.5 + v); beamTris(T, [p0x, y + 1.42, p0z], [p1x, y + 1.42, p1z], 0.03, 0.05); }
    for (const [u, v, m] of [[0.1, -0.2, 'terracotta'], [0.45, 0.1, 'terracotta'], [0.8, -0.1, 'reed_mat'], [0.3, 0.2, 'reed_mat']]) { const [gx, gz] = at(u, 1.5 + v); bag.add(m, lathe([[0.001, 0], [0.12, 0.02], [0.14, 0.1], [0.08, 0.18], [0.001, 0.2]], 8, null, gx, y + 1.46, gz)); } }
  // the pots, the basket, the hoe and the axe
  for (const [u, v, sc, m] of [[-0.5, -1.5, 1.8, 'terracotta'], [-0.05, -1.35, 1.3, 'pottery_dark'], [-0.8, -1.2, 1.1, 'terracotta']]) { const [px, pz] = at(u, v); bag.add('thatch', lathe([[0.001, 0], [0.12 * sc, 0.0], [0.1 * sc, 0.04], [0.001, 0.04]], 8, null, px, y, pz)); bag.add(m, lathe(potProf(sc), 11, null, px, y + 0.03, pz)); }
  { const [bx, bz] = at(1.7, 0.8); bag.add('wicker', lathe([[0.001, 0], [0.22, 0], [0.3, 0.2], [0.33, 0.3], [0.3, 0.31], [0.2, 0.22], [0.001, 0.22]], 10, null, bx, y, bz)); bag.add('reed_mat', lathe([[0.001, 0.26], [0.27, 0.27], [0.15, 0.34], [0.001, 0.37]], 8, null, bx, y, bz)); }
  { const [hx, hz] = at(-1.9, -0.7), [h2x, h2z] = at(-2.1, -0.4);
    beamTris(T, [hx, y, hz], [hx + c * -0.35, y + 1.2, hz + s * -0.35], 0.03, 0.04); bag.add('iron', orientedBox([hx + c * -0.35 - s * 0.1, hz + s * -0.35 + c * 0.1], [hx + c * -0.35 + s * 0.1, hz + s * -0.35 - c * 0.1], 0.12, y + 1.14, y + 1.24));
    beamTris(T, [h2x, y, h2z], [h2x + c * -0.3, y + 1.1, h2z + s * -0.3], 0.03, 0.04); bag.add('iron', orientedBox([h2x + c * -0.3 - s * 0.09, h2z + s * -0.3 + c * 0.09], [h2x + c * -0.3 + s * 0.09, h2z + s * -0.3 - c * 0.09], 0.05, y + 1.0, y + 1.16)); }
  { const [p0, p1] = [at(0.2, -0.2), at(1.0, -0.2)]; bag.add('reed_mat', orientedBox(p0, p1, 0.9, y, y + 0.015)); const [gx, gz] = at(0.6, -0.2); bag.add('reed_mat', lathe([[0.3, 0], [0.26, 0.03], [0.001, 0.05]], 9, null, gx, y + 0.01, gz)); }
  bag.add('timber', fromTriangles(T));
}
/**
 * millet_plot: standing millet (the staple grain; inferred for the plateau) in rows { rect, yAt, seed }, the stalks 2 m, the
 * heads nodding.
 */
function milletPlot(el, { bag }) {
  const rand = ((sd) => () => ((sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296))(el.seed ?? 4), [x0, z0, x1, z1] = el.rect, yAt = el.yAt ?? (() => el.y ?? 0), T = [];
  for (let x = x0 + 0.5; x < x1; x += 1.0) for (let z = z0 + 0.5; z < z1; z += 1.0) {
    if (rand() < 0.2) continue;
    const px = x + (rand() - 0.5) * 0.4, pz = z + (rand() - 0.5) * 0.4, y = yAt(px, pz), hh = 1.8 + rand() * 0.6, lx = (rand() - 0.5) * 0.3;
    beamTris(T, [px, y, pz], [px + lx, y + hh, pz], 0.012, 0.012);
    bag.add('reed_mat', lathe([[0.001, 0], [0.04, 0.04], [0.045, 0.2], [0.001, 0.34]], 4, null, px + lx, y + hh - 0.08, pz));
  }
  bag.add('reed_mat', fromTriangles(T));
}
/**
 * smithy: an iron-and-gold worker's yard under a pole shed { at, rot, y } (Met: crucibles "to melt gold, copper, bronze, and brass";
 * Smarthistory: copper ingots): a clay forge with its tuyere, two bellows (a goatskin on a clay pot each), an anvil stone and
 * hammer stones, a heap of charcoal, hoes and bars of iron, crucibles with their tongs; the roof of thatch on four poles [forms inferred].
 */
function smithy(el, { bag, col, lights }) {
  const [x, z] = el.at, y = (el.y ?? 0) + 0.02, rot = el.rot ?? 0, c = Math.cos(rot), s = Math.sin(rot), T = [];
  const W = (u, v) => [x + c * u - s * v, z + s * u + c * v];
  // the shed
  const P = [[-2.2, -1.9], [2.2, -1.9], [2.2, 1.9], [-2.2, 1.9]].map(([u, v]) => W(u, v));
  for (const [px, pz] of P) { bag.add('timber', lathe([[0.1, -0.3], [0.09, 2.3], [0.001, 2.34]], 6, null, px, y, pz)); col.circle(px, pz, 0.12, y, y + 2.3); }
  bag.add('thatch', lathe([[3.4, 2.15], [3.3, 2.3], [1.6, 3.0], [0.001, 3.7]], 12, null, x, y, z));
  bag.add('thatch', lathe([[0.001, 3.55], [1.5, 2.85], [3.3, 2.12]], 12, null, x, y, z));
  // the forge: a low clay mound, a hollow with charcoal, the tuyere pipes from the bellows
  { const [fx, fz] = W(0, 0.2);
    bag.add('mud_plaster', lathe([[0.8, 0], [0.7, 0.2], [0.5, 0.42], [0.3, 0.42], [0.001, 0.4]], 12, null, fx, y, fz));
    bag.add('tar_wood', lathe([[0.3, 0.38], [0.22, 0.46], [0.001, 0.5]], 9, null, fx, y, fz));
    col.circle(fx, fz, 0.8, y, y + 0.45);
    if (lights) lights.push({ at: [fx, y + 0.55, fz], color: '#ff8a3a', intensity: 2.2, distance: 6 });
    for (const v of [-0.38, 0.38]) { const [bx, bz] = W(-1.3, 0.2 + v), [tx, tz] = W(-0.3, 0.2 + v * 0.3);
      bag.add('terracotta', lathe(potProf(1.6), 10, null, bx, y, bz));
      bag.add('hide_brown', lathe([[0.001, 0], [0.18, 0.02], [0.2, 0.2], [0.12, 0.34], [0.001, 0.36]], 9, null, bx, y + 0.46, bz));
      beamTris(T, [bx, y + 0.25, bz], [tx, y + 0.3, tz], 0.03, 0.03); } }
  // the anvil stone, hammer stones, charcoal, iron, crucibles
  { const [ax, az] = W(1.2, 0.5); bag.add('granite_grey', lathe([[0.001, -0.1], [0.28, -0.1], [0.3, 0.1], [0.2, 0.28], [0.001, 0.3]], 8, (th) => 1 + 0.1 * Math.sin(th * 3), ax, y, az)); col.circle(ax, az, 0.32, y, y + 0.3);
    for (const [u, v] of [[1.55, 0.1], [1.0, 1.0]]) { const [hx, hz] = W(u, v); bag.add('granite_grey', lathe([[0.001, 0], [0.09, 0.01], [0.1, 0.07], [0.001, 0.12]], 6, null, hx, y, hz)); }
    const [cx, cz] = W(0.2, -1.3); bag.add('tar_wood', lathe([[0.001, 0], [0.5, 0], [0.38, 0.28], [0.15, 0.45], [0.001, 0.48]], 9, (th) => 1 + 0.12 * Math.sin(th * 4), cx, y, cz));
    for (let k = 0; k < 3; k++) { const [px, pz] = W(1.0 + k * 0.28, -1.2); beamTris(T, [px - c * 0.3, y + 0.04, pz - s * 0.3], [px + c * 0.3, y + 0.04, pz + s * 0.3], 0.025, 0.03); }
    for (const [u, v] of [[-0.9, -1.3], [-0.65, -1.45]]) { const [px, pz] = W(u, v); bag.add('pottery_dark', lathe([[0.001, 0], [0.06, 0.01], [0.09, 0.09], [0.07, 0.11], [0.05, 0.04], [0.001, 0.04]], 9, null, px, y, pz)); }
    const [t0, t1] = [W(-0.5, -1.35), W(-0.5, -1.0)]; bag.add('iron', orientedBox(t0, t1, 0.03, y + 0.01, y + 0.04));
    const [h0, h1] = [W(1.9, -0.6), W(1.9, -0.1)]; bag.add('iron', orientedBox(h0, h1, 0.2, y, y + 0.02)); }
  bag.add('timber', fromTriangles(T));
}
/**
 * stone_carver: a soapstone carver's corner { at, rot, y } (Wikipedia, Zimbabwe Bird: the birds are carved "from a micaceous schist
 * (soapstone)"): a rough block, a column half carved with a bird's head just blocked out, a mat with chisels, a litter of chips and a
 * water pot [the working place inferred].
 */
function stoneCarver(el, { bag, col }) {
  const [x, z] = el.at, y = (el.y ?? 0) + 0.02, rot = el.rot ?? 0, c = Math.cos(rot), s = Math.sin(rot);
  const W = (u, v) => [x + c * u - s * v, z + s * u + c * v];
  bag.add('reed_mat', orientedBox(W(-1.2, 0), W(1.2, 0), 1.6, y - 0.02, y + 0.005));
  { const [bx, bz] = W(-0.7, -0.2); bag.add('soapstone', orientedBox(W(-0.95, -0.2), W(-0.45, -0.2), 0.45, y, y + 0.4, 0.2)); col.circle(bx, bz, 0.35, y, y + 0.4); }
  { const [p0, p1] = [W(0.0, 0.15), W(0.9, 0.15)]; bag.add('soapstone', orientedBox(p0, p1, 0.22, y + 0.02, y + 0.24)); const [h0, h1] = [W(0.9, 0.15), W(1.12, 0.15)]; bag.add('soapstone', orientedBox(h0, h1, 0.16, y + 0.08, y + 0.4, 0.2)); const [nx, nz] = W(1.1, 0.15); bag.add('soapstone', lathe([[0.001, 0], [0.07, 0.01], [0.06, 0.12], [0.001, 0.16]], 7, null, nx, y + 0.4, nz)); }
  for (let k = 0; k < 14; k++) { const u = -1.1 + ((k * 37) % 23) / 10, v = -0.7 + ((k * 53) % 17) / 12, [px, pz] = W(u, v); bag.add('soapstone', lathe([[0.001, 0], [0.04, 0], [0.001, 0.025]], 4, null, px, y, pz)); }
  for (const v of [0.6, 0.72]) { const [p0, p1] = [W(-0.3, v), W(-0.05, v)]; bag.add('iron', orientedBox(p0, p1, 0.02, y + 0.005, y + 0.03)); }
  { const [wx, wz] = W(-1.5, 0.7); bag.add('terracotta', lathe(potProf(1.4), 12, null, wx, y, wz)); }
}
registerStyle('zimbabwe', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, dry_wall: dryWall, cone_tower: coneTower, daga_hut: hut, platform, soapstone_bird: soapstoneBird, monolith, boulder, stone_steps: stoneSteps, daga_yard: dagaYard, thatch_roof: thatchRoof, kraal, trade_goods: tradeGoods, granary, compound, homestead_goods: homesteadGoods, millet_plot: milletPlot, smithy, stone_carver: stoneCarver, termite_mound: termiteMound },
  objects: {},
});
