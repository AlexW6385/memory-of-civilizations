// The Neolithic monuments of Salisbury Plain (about 2500 BC; docs/settlements/stonehenge.md §4):
// sarsen uprights dressed by pounding, widening a little to the top, their inner faces the
// smoothest; the ring of curved lintels joined end to end and set on tenons; the trilithons with
// their tenons and mortised lintels; the bluestone pillars; the unshaped Heel Stone. And the square
// houses of the builders (after Durrington Walls): stake walls woven with hazel and daubed with
// chalk, a chalk floor with a round hearth in the middle, box beds and a dresser against the walls,
// a steep thatched roof on a hazel frame.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { BufferGeometry, Float32BufferAttribute, Vector3 } from '../../core/three.js';
import '../qing/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/**
 * A closed loft: rings of points (each a closed loop, all of one length) joined in order, the first
 * and last capped. Smooth normals along the sides (each corrected to face away from the axis of its
 * rings), flat on the caps.
 */
export function loft(rings, { capStart = true, capEnd = true } = {}) {
  const M = rings.length, N = rings[0].length;
  const cen = rings.map((r) => r.reduce((a, p) => [a[0] + p[0] / N, a[1] + p[1] / N, a[2] + p[2] / N], [0, 0, 0]));
  const acc = rings.map(() => Array.from({ length: N }, () => [0, 0, 0]));
  const faces = [];
  const _u = new Vector3(), _v = new Vector3(), _n = new Vector3();
  for (let i = 0; i < M - 1; i++) for (let j = 0; j < N; j++) {
    const j1 = (j + 1) % N, A = rings[i][j], B = rings[i][j1], C = rings[i + 1][j1], D = rings[i + 1][j];
    _u.set(C[0] - A[0], C[1] - A[1], C[2] - A[2]); _v.set(B[0] - D[0], B[1] - D[1], B[2] - D[2]);
    _n.crossVectors(_v, _u);
    const m = [(A[0] + C[0]) / 2 - (cen[i][0] + cen[i + 1][0]) / 2, (A[1] + C[1]) / 2 - (cen[i][1] + cen[i + 1][1]) / 2, (A[2] + C[2]) / 2 - (cen[i][2] + cen[i + 1][2]) / 2];
    const flip = _n.x * m[0] + _n.y * m[1] + _n.z * m[2] < 0;
    if (flip) _n.negate();
    const l = _n.length() || 1, n = [_n.x / l, _n.y / l, _n.z / l];
    for (const [a, b] of [[i, j], [i, j1], [i + 1, j1], [i + 1, j]]) { const t = acc[a][b]; t[0] += n[0]; t[1] += n[1]; t[2] += n[2]; }
    faces.push([i, j, j1, flip]);
  }
  const pos = [], nor = [];
  const nv = (i, j) => { const t = acc[i][j], l = Math.hypot(t[0], t[1], t[2]) || 1; return [t[0] / l, t[1] / l, t[2] / l]; };
  for (const [i, j, j1, flip] of faces) {
    const q = [[i, j], [i, j1], [i + 1, j1], [i + 1, j]];
    const tri = flip ? [q[0], q[2], q[1], q[0], q[3], q[2]] : [q[0], q[1], q[2], q[0], q[2], q[3]];
    for (const [a, b] of tri) { pos.push(...rings[a][b]); nor.push(...nv(a, b)); }
  }
  // caps: a fan from the ring's centre, facing away from the neighbouring ring
  const cap = (k, kn) => {
    const c = cen[k], away = [c[0] - cen[kn][0], c[1] - cen[kn][1], c[2] - cen[kn][2]];
    for (let j = 0; j < N; j++) {
      const A = rings[k][j], B = rings[k][(j + 1) % N];
      _u.set(A[0] - c[0], A[1] - c[1], A[2] - c[2]); _v.set(B[0] - c[0], B[1] - c[1], B[2] - c[2]); _n.crossVectors(_u, _v);
      const flip = _n.x * away[0] + _n.y * away[1] + _n.z * away[2] < 0;
      if (flip) _n.negate();
      _n.normalize();
      const tri = flip ? [c, B, A] : [c, A, B];
      for (const p of tri) { pos.push(...p); nor.push(_n.x, _n.y, _n.z); }
    }
  };
  if (capStart) cap(0, 1);
  if (capEnd) cap(M - 1, M - 2);
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  return g;
}

/** A section of rounded-rectangle outline (a superellipse), half-widths a (across) and b (through), N points. */
function section(a, b, N, p = 5) {
  const out = [];
  for (let k = 0; k < N; k++) {
    const t = (k / N) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
    out.push([a * Math.sign(c) * Math.abs(c) ** (2 / p), b * Math.sign(s) * Math.abs(s) ** (2 / p), t]);
  }
  return out;
}
/** Seeded bumps: a few waves round the stone and up it (the dressing of pounded sarsen; the knobs of a natural boulder). */
function bumps(rand, n = 5) {
  const W = Array.from({ length: n }, (_, i) => ({ f: 1 + Math.floor(rand() * (2 + i * 1.5)), g: (rand() - 0.5) * (1.5 + i * 1.8), p: rand() * 6.28, A: 1 / (1 + i * 0.7) }));
  const S = W.reduce((a, w) => a + w.A, 0);
  return (t, y) => W.reduce((a, w) => a + w.A * Math.sin(w.f * t + w.g * y + w.p), 0) / S;
}

/**
 * standing_stone: { at, y (the ground there), yaw (direction of the stone's thickness, outward), h (height above
 * the ground) or top (the absolute level of its top), w0/w1 (width at the ground / at the top), d0/d1 (thickness),
 * bury (depth set below ground), rough (m), dress (1: the inner face dressed smooth), cap ('flat' | 'round' | 'peak'),
 * lean [toward +thickness, toward +width] (radians), lying (laid flat, its length across), natural, tenon, mat, seed }.
 */
function standingStone(el, ctx) {
  if (el.tool) return tooledStone(el, ctx);
  const { bag, col } = ctx;
  const rand = rng(el.seed || 1), [x, z] = el.at, y = el.y ?? 0, a = el.yaw ?? 0;
  const h = el.top !== undefined ? el.top - y : el.h, bury = el.bury ?? 1;
  const w0 = el.w0 ?? 2, w1 = el.w1 ?? w0, d0 = el.d0 ?? 1, d1 = el.d1 ?? d0, rough = el.rough ?? 0.04, cap = el.cap ?? 'flat';
  const N = 24, wave = bumps(rand), wave2 = bumps(rand, 3), rows = [];
  const ys = [-bury, -bury * 0.3, 0];
  const nr = Math.max(4, Math.round(h / 0.6));
  for (let i = 1; i <= nr; i++) ys.push(h * (i / nr) * (cap === 'flat' ? 0.97 : cap === 'round' ? 0.86 : 0.8));
  // the shoulders and the top
  if (cap === 'flat') ys.push(h);
  const sec = section(1, 1, N, el.natural ? 2.6 : 4.5);
  const skew = (rand() - 0.5) * 0.12;                                   // tops are rarely quite square to the sides
  const ring = (yy, k) => sec.map(([sx, sz, t]) => {
    const f = Math.max(0, Math.min(1, yy / h)), w = (w0 + (w1 - w0) * f) / 2, d = (d0 + (d1 - d0) * f) / 2;
    const inner = sz < 0 && el.dress ? 0.3 : 1;                       // the inner face (toward the centre) dressed smoothest
    const r = 1 + rough / Math.max(0.3, Math.min(w, d)) * inner * (0.7 * wave(t, yy) + 0.3 * wave2(t * 2, yy * 2));
    return [sx * w * r * k, yy, sz * d * r * k];
  });
  for (const yy of ys) rows.push(ring(yy, 1));
  if (cap === 'flat') {
    // a slight rounding of the arris round the top, the top dressed flat; a tenon on it
    const last = rows[rows.length - 1];
    rows[rows.length - 1] = last.map((p) => [p[0] * 0.97, h, p[2] * 0.95]);
  } else {
    const tops = cap === 'round' ? [[0.92, 0.75], [0.97, 0.45], [1, 0.12]] : [[0.88, 0.7], [0.95, 0.35], [1, 0.08]];
    for (const [fy, k] of tops) rows.push(ring(h * fy, k).map((p, j) => [p[0] + (cap === 'peak' ? skew * h * 0.4 : 0), p[1] + (j % 3) * 0.01 * h * (1 - k), p[2]]));
  }
  // to the plan: lean, turn, place (and for a lying stone, its length laid across)
  const lt = el.lean?.[1] ?? 0, ln = el.lean?.[0] ?? 0, ca = Math.cos(a), sa = Math.sin(a);
  const tx = -sa, tz = ca;                                               // width direction (tangent); thickness along (ca, sa)
  const place = ([u, v, w]) => {
    let U = u, V = v, W = w;
    if (el.lying) { U = v - h / 2; V = w + d0 / 2 - bury; W = u; }
    else { U = u + Math.sin(lt) * v; W = w + Math.sin(ln) * v; V = v * Math.cos(ln) * Math.cos(lt); }
    return [x + tx * U + ca * W, y + V, z + tz * U + sa * W];
  };
  const g = loft(rows.map((r) => r.map(place)), { capStart: true, capEnd: true });
  bag.add(el.mat || 'granite_rough', g);
  if (el.tenon && !el.lying) {
    // the tenon on the top, which the lintel's mortise takes: a low knob, mostly hidden
    bag.add(el.mat || 'granite_rough', lathe([[0.32, 0], [0.3, 0.14], [0.22, 0.24], [0.001, 0.26]], 12, null, x, y + h - 0.01, z));
  }
  const top = el.lying ? y + d0 - bury + 0.05 : y + h * Math.cos(ln);
  if (el.lying) col.segment([x - tx * h / 2, z - tz * h / 2], [x + tx * h / 2, z + tz * h / 2], w0, y - 0.2, top);
  else col.circle(x + ca * Math.sin(ln) * h * 0.3 + tx * Math.sin(lt) * h * 0.3, z + sa * Math.sin(ln) * h * 0.3 + tz * Math.sin(lt) * h * 0.3, Math.max(w0, d0) * 0.55, y - 0.5, top);
}

/** A smooth-shaded strip mesh from a grid of placed points G[i][j] (rows i, round j, closed round), the cells sorted
 *  into buckets by pick(i, j); normals by central differences, turned away from each row's centre. */
function gridMesh(G, pick, buckets) {
  const M = G.length, N = G[0].length;
  const cen = G.map((r) => r.reduce((a, p) => [a[0] + p[0] / N, a[1] + p[1] / N, a[2] + p[2] / N], [0, 0, 0]));
  const nor = G.map((r, i) => r.map((p, j) => {
    const a = G[i][(j + 1) % N], b = G[i][(j + N - 1) % N], c = G[Math.min(M - 1, i + 1)][j], d = G[Math.max(0, i - 1)][j];
    const u = [a[0] - b[0], a[1] - b[1], a[2] - b[2]], v = [c[0] - d[0], c[1] - d[1], c[2] - d[2]];
    let n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const m = [p[0] - cen[i][0], p[1] - cen[i][1], p[2] - cen[i][2]];
    if (n[0] * m[0] + n[1] * m[1] + n[2] * m[2] < 0) n = n.map((q) => -q);
    const l = Math.hypot(...n) || 1;
    return n.map((q) => q / l);
  }));
  for (let i = 0; i < M - 1; i++) for (let j = 0; j < N; j++) {
    const j1 = (j + 1) % N, B = buckets[pick(i, j)];
    const q = [[i, j], [i, j1], [i + 1, j1], [i + 1, j]];
    // wind so the face looks along its normal
    const A = G[i][j], Bp = G[i][j1], C = G[i + 1][j1], n0 = nor[i][j];
    const fn = [(Bp[1] - A[1]) * (C[2] - A[2]) - (Bp[2] - A[2]) * (C[1] - A[1]), (Bp[2] - A[2]) * (C[0] - A[0]) - (Bp[0] - A[0]) * (C[2] - A[2]), (Bp[0] - A[0]) * (C[1] - A[1]) - (Bp[1] - A[1]) * (C[0] - A[0])];
    const tri = fn[0] * n0[0] + fn[1] * n0[1] + fn[2] * n0[2] >= 0 ? [q[0], q[1], q[2], q[0], q[2], q[3]] : [q[0], q[2], q[1], q[0], q[3], q[2]];
    for (const [a, b] of tri) { B.pos.push(...G[a][b]); B.nor.push(...nor[a][b]); }
  }
  return { nor, cen };
}
const toGeom = ({ pos, nor }) => { const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(nor, 3)); return g; };

/**
 * A sarsen worked as at Stonehenge (docs/settlements/stonehenge.md §1c), standing_stone with `tool`: { faces ('all' |
 * 'inner' | 'none'), lichen (patches on the crust) }. Pick-dressing took off the brown and grey crust and left a fine,
 * bright grey-white face (`dressMat`), worked in lanes of hammer-blows a hand wide and pitted by them; where the stone was
 * not dressed — the backs of the uprights away from the solstice axis, the natural stones — the old crust stands a little
 * proud, knobbly, and carries the lichens it grew lying on the downs (grey-green, yellow and pale grey rosettes).
 */
function tooledStone(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x, z] = el.at, y = el.y ?? 0, a = el.yaw ?? 0;
  const h = el.top !== undefined ? el.top - y : el.h, bury = el.bury ?? 1;
  const w0 = el.w0 ?? 2, w1 = el.w1 ?? w0, d0 = el.d0 ?? 1, d1 = el.d1 ?? d0, rough = el.rough ?? 0.04, cap = el.cap ?? 'flat';
  const faces = el.tool.faces ?? 'inner', N = 48, wave = bumps(rand), wave2 = bumps(rand, 3), wave3 = bumps(rand, 6);
  const sec = section(1, 1, N, el.natural ? 2.6 : 4.5);
  const dressedAt = (sz) => faces === 'all' || (faces === 'inner' && sz < 0.25);
  // the lanes of the tooling: oblique bands a hand wide, their direction and pitch varying from stone to stone
  const phi = (rand() - 0.5) * 1.4 + (rand() < 0.5 ? 0 : Math.PI / 2), lane = 0.16 + rand() * 0.08, per = (w0 + d0) * 2.1;
  const ys = [-bury, -bury * 0.3, 0];
  const top0 = h * (cap === 'flat' ? 0.97 : cap === 'round' ? 0.86 : 0.8), nr = Math.max(8, Math.round(top0 / 0.14));
  for (let i = 1; i <= nr; i++) ys.push(top0 * (i / nr));
  if (cap === 'flat') ys.push(h);
  const skew = (rand() - 0.5) * 0.12, cls = [];
  const ring = (yy, k, row) => sec.map(([sx, sz, t], j) => {
    const f = Math.max(0, Math.min(1, yy / h)), w = (w0 + (w1 - w0) * f) / 2, d = (d0 + (d1 - d0) * f) / 2;
    const dressed = dressedAt(sz) && yy > -0.25, m = Math.max(0.3, Math.min(w, d));
    let r;
    if (dressed) {
      const s = t / (Math.PI * 2) * per, along = yy * Math.cos(phi) + s * Math.sin(phi);
      const groove = 0.5 + 0.5 * Math.sin(along / lane * Math.PI * 2 + wave2(t * 3, yy) * 1.5);
      r = 1 + (rough * 0.3 * (0.7 * wave(t, yy) + 0.3 * wave2(t * 2, yy * 2)) - 0.006 * groove + 0.0025 * wave3(t * 37, yy * 41)) / m;
    } else r = 1 + (0.02 + rough * 1.5 * (0.6 * wave(t, yy) + 0.25 * wave2(t * 2, yy * 2) + 0.15 * wave3(t * 9, yy * 9))) / m;
    if (row !== undefined) (cls[row] ||= [])[j] = dressed ? 0 : 1;
    return [sx * w * r * k, yy, sz * d * r * k];
  });
  const rows = ys.map((yy, i) => ring(yy, 1, i));
  if (cap === 'flat') rows[rows.length - 1] = rows[rows.length - 1].map((p) => [p[0] * 0.97, h, p[2] * 0.95]);
  else {
    const tops = cap === 'round' ? [[0.92, 0.75], [0.97, 0.45], [1, 0.12]] : [[0.88, 0.7], [0.95, 0.35], [1, 0.08]];
    for (const [fy, k] of tops) { const i = rows.length; rows.push(ring(h * fy, k, i).map((p, j) => [p[0] + (cap === 'peak' ? skew * h * 0.4 : 0), p[1] + (j % 3) * 0.01 * h * (1 - k), p[2]])); }
  }
  const lt = el.lean?.[1] ?? 0, ln = el.lean?.[0] ?? 0, ca = Math.cos(a), sa = Math.sin(a), tx = -sa, tz = ca;
  const place = ([u, v, w]) => {
    let U = u, V = v, W = w;
    if (el.lying) { U = v - h / 2; V = w + d0 / 2 - bury; W = u; } else { U = u + Math.sin(lt) * v; W = w + Math.sin(ln) * v; V = v * Math.cos(ln) * Math.cos(lt); }
    return [x + tx * U + ca * W, y + V, z + tz * U + sa * W];
  };
  const G = rows.map((r) => r.map(place));
  const buckets = [{ pos: [], nor: [] }, { pos: [], nor: [] }];
  const pick = (i, j) => { const c = cls[i] || cls[cls.length - 1], c1 = cls[i + 1] || c; return c[j] + c[(j + 1) % N] + c1[j] + c1[(j + 1) % N] >= 2 ? 1 : 0; };
  const { nor, cen } = gridMesh(G, pick, buckets);
  // the caps: the top dressed flat on an upright that carries a lintel (else of the face's kind), the foot unseen
  const fanUp = (row, B) => { const c = cen[row], R = G[row]; for (let j = 0; j < N; j++) { const p = R[j], q = R[(j + 1) % N]; const ux = p[0] - c[0], uz = p[2] - c[2], vx = q[0] - c[0], vz = q[2] - c[2]; const ccw = uz * vx - ux * vz > 0; for (const v of (ccw ? [c, p, q] : [c, q, p])) { B.pos.push(...v); B.nor.push(0, 1, 0); } } };
  fanUp(G.length - 1, buckets[faces === 'none' ? 1 : 0]);
  const dm = el.tool.dressMat || 'sandstone_white', cm = el.mat || 'granite_rough';
  if (buckets[0].pos.length) bag.add(dm, toGeom(buckets[0]));
  if (buckets[1].pos.length) bag.add(cm, toGeom(buckets[1]));
  if (el.tenon && !el.lying) bag.add(dm, lathe([[0.32, 0], [0.3, 0.14], [0.22, 0.24], [0.001, 0.26]], 12, null, x, y + h - 0.01, z));
  // the lichens on the crust: rosettes 3–12 cm across in loose colonies, each a hair off the face, on faces that see the sky
  const nL = el.tool.lichen ?? 0, LM = ['plaster_damp', 'plaster_damp', 'plaster_ochre', 'plaster_grey'], disc = { plaster_damp: [], plaster_ochre: [], plaster_grey: [] };
  for (let c = 0, tries = 0; c < nL && tries < nL * 20; tries++) {
    const i = 3 + Math.floor(rand() * (G.length - 5)), j = Math.floor(rand() * N);
    if (!cls[i] || cls[i][j] !== 1 || G[i][j][1] < y + 0.25 || nor[i][j][1] < -0.25) continue;
    c++;
    const m = LM[Math.floor(rand() * LM.length)], n = 2 + Math.floor(rand() * 5);
    for (let k = 0; k < n; k++) {
      const ii = Math.max(1, Math.min(G.length - 2, i + Math.round((rand() - 0.5) * 3))), jj = (j + Math.round((rand() - 0.5) * 3) + N) % N;
      if (cls[ii]?.[jj] !== 1) continue;
      const p = G[ii][jj], nn = nor[ii][jj], off = 0.004 + k * 0.0012 + (m === 'plaster_damp' ? 0 : 0.0006);
      const e1 = Math.abs(nn[1]) < 0.9 ? [nn[2], 0, -nn[0]] : [1, 0, 0], l1 = Math.hypot(...e1), u = e1.map((q) => q / l1);
      const v = [nn[1] * u[2] - nn[2] * u[1], nn[2] * u[0] - nn[0] * u[2], nn[0] * u[1] - nn[1] * u[0]];
      const R = 0.015 + rand() * 0.05, cx = p[0] + nn[0] * off, cy = p[1] + nn[1] * off, cz = p[2] + nn[2] * off, S = 7;
      for (let s = 0; s < S; s++) {
        const a0 = s / S * Math.PI * 2, a1 = (s + 1) / S * Math.PI * 2, r0 = R * (0.8 + 0.3 * Math.sin(a0 * 3 + k)), r1 = R * (0.8 + 0.3 * Math.sin(a1 * 3 + k));
        const P0 = [cx + (u[0] * Math.cos(a0) + v[0] * Math.sin(a0)) * r0, cy + (u[1] * Math.cos(a0) + v[1] * Math.sin(a0)) * r0, cz + (u[2] * Math.cos(a0) + v[2] * Math.sin(a0)) * r0];
        const P1 = [cx + (u[0] * Math.cos(a1) + v[0] * Math.sin(a1)) * r1, cy + (u[1] * Math.cos(a1) + v[1] * Math.sin(a1)) * r1, cz + (u[2] * Math.cos(a1) + v[2] * Math.sin(a1)) * r1];
        const ax = P0[0] - cx, ay = P0[1] - cy, az = P0[2] - cz, bx = P1[0] - cx, by = P1[1] - cy, bz = P1[2] - cz;
        const out = (ay * bz - az * by) * nn[0] + (az * bx - ax * bz) * nn[1] + (ax * by - ay * bx) * nn[2] > 0;
        disc[m].push(cx, cy, cz, ...(out ? [...P0, ...P1] : [...P1, ...P0]));
      }
    }
  }
  for (const [m, T] of Object.entries(disc)) if (T.length) bag.add(m, fromTriangles(T));
  const top = el.lying ? y + d0 - bury + 0.05 : y + h * Math.cos(ln);
  if (el.lying) col.segment([x - tx * h / 2, z - tz * h / 2], [x + tx * h / 2, z + tz * h / 2], w0, y - 0.2, top);
  else col.circle(x + ca * Math.sin(ln) * h * 0.3 + tx * Math.sin(lt) * h * 0.3, z + sa * Math.sin(ln) * h * 0.3 + tz * Math.sin(lt) * h * 0.3, Math.max(w0, d0) * 0.55, y - 0.5, top);
}

/**
 * lintel_ring: { c, r, n, a0, y (the uprights' level tops), w (radial), h, mat, seed } — n lintels end to end on a
 * ring, each from the middle of one upright to the next, curved on plan with the ring; the joints between them
 * (tongue and groove) a fine line. Each sits on its uprights' tenons.
 */
function lintelRing(el, { bag }) {
  const [cx, cz] = el.c, R = el.r, n = el.n, y = el.y, w = el.w ?? 1, hh = el.h ?? 0.8, rand = rng(el.seed || 3);
  const sec = section(w / 2, hh / 2, 16, 5), M = 9;
  for (let i = 0; i < n; i++) {
    const A0 = el.a0 + (i / n) * Math.PI * 2, A1 = el.a0 + ((i + 1) / n) * Math.PI * 2, gap = 0.012 / R;
    const wave = bumps(rand, 4), sag = (rand() - 0.5) * 0.02, dw = (rand() - 0.5) * 0.06;
    const rings = [];
    for (let k = 0; k <= M; k++) {
      const f = k / M, t = A0 + gap + (A1 - A0 - 2 * gap) * f, ct = Math.cos(t), st = Math.sin(t);
      // the ends squared off; along the length a slight unevenness of the pounded faces
      const end = k === 0 || k === M ? 0.985 : 1;
      rings.push(sec.map(([sr, sy, th]) => {
        const rr = 1 + 0.025 * wave(th, f * 4) * (sy > 0 ? 0.4 : 1);
        const rad = R + sr * (1 + dw) * rr * end, yy = y + hh / 2 + sy * rr * end + sag * Math.sin(f * Math.PI) * (sy < 0 ? 1 : 0);
        return [cx + ct * rad, yy, cz + st * rad];
      }));
    }
    bag.add(el.mat || 'granite_rough', loft(rings));
  }
}

/** lintel: { a, b, y (its underside), w, h, mat, seed } — a trilithon's lintel, straight, its faces pounded, a little wider than its uprights. */
function lintel(el, { bag }) {
  const [ax, az] = el.a, [bx, bz] = el.b, y = el.y, w = el.w ?? 1.1, hh = el.h ?? 1, rand = rng(el.seed || 5);
  const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux;
  const sec = section(w / 2, hh / 2, 16, 4.2), wave = bumps(rand, 4), M = 8;
  const rings = [];
  for (let k = 0; k <= M; k++) {
    const f = k / M, s = L * f, end = k === 0 || k === M ? 0.95 : 1;
    rings.push(sec.map(([sn, sy, th]) => {
      const rr = 1 + 0.04 * wave(th, f * 3);
      return [ax + ux * s + nx * sn * rr * end, y + hh / 2 + sy * rr * end, az + uz * s + nz * sn * rr * end];
    }));
  }
  bag.add(el.mat || 'granite_rough', loft(rings));
}

// ── the houses ──────────────────────────────────────────────────────────────────────────────────
/** Oriented box in a house's frame: u (across), v (depth, +v toward the door) ranges; y range. */
function obox(fr, u0, u1, y0, y1, v0, v1) {
  const g = box(u0, y0, v0, u1, y1, v1);
  const p = g.attributes.position.array, n = g.attributes.normal.array;
  for (let i = 0; i < p.length; i += 3) {
    const u = p[i], v = p[i + 2];
    p[i] = fr.x + u * fr.c - v * fr.s; p[i + 1] += fr.y; p[i + 2] = fr.z + u * fr.s + v * fr.c;
    const nu = n[i], nv = n[i + 2]; n[i] = nu * fr.c - nv * fr.s; n[i + 2] = nu * fr.s + nv * fr.c;
  }
  return g;
}
const W = (fr, u, y, v) => [fr.x + u * fr.c - v * fr.s, fr.y + y, fr.z + u * fr.s + v * fr.c];
/** A Grooved Ware pot: flat-based, straight-sided like a tub or bucket. */
const groovedWare = (r, h) => [[0.001, 0], [r * 0.82, 0], [r * 0.86, h * 0.1], [r, h * 0.8], [r * 1.02, h], [r * 0.93, h], [r * 0.9, h * 0.15], [0.001, h * 0.15]];

/**
 * neolithic_house: { c, s (inner side), yaw, y (the floor), low (lowest ground under it), seed } — a square house
 * of stake walls woven with hazel and daubed with chalk, a doorway in the side +v; a chalk floor, a round hearth
 * with its kerb in the middle; box beds and a dresser of planks against the walls; a steep thatch on a hazel frame,
 * hipped to a point, its eaves well out over the walls.
 */
function house(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x, z] = el.c, s = el.s ?? 5, y = el.y ?? 0, a = el.yaw ?? 0, low = el.low ?? y - 0.4;
  const fr = { x, z, y, c: Math.cos(a), s: Math.sin(a) };
  const hw = s / 2, th = 0.16, wh = 1.75, dw = 0.85, dh = 1.5, doorU = (rand() - 0.5) * 0.8;
  const foot = low - y - 0.25;
  // the floor: chalk, beaten and plastered, its edge bedded into the ground
  bag.add('chalk', obox(fr, -hw - th + 0.04, hw + th - 0.04, foot, 0, -hw - th + 0.04, hw + th - 0.04));
  { const k = hw / (Math.abs(fr.c) + Math.abs(fr.s)); col.floor([x - k, z - k, x + k, z + k], y); }
  // the walls: daub of chalk over the woven hazel; the doorway in the +v wall, a timber lintel and jambs
  const walls = [[-hw - th, hw + th, -hw - th, -hw], [-hw - th, -hw, -hw, hw], [hw, hw + th, -hw, hw]];
  for (const [u0, u1, v0, v1] of walls) bag.add('chalk', obox(fr, u0, u1, foot, wh, v0, v1));
  bag.add('chalk', obox(fr, -hw - th, doorU - dw / 2, foot, wh, hw, hw + th));
  bag.add('chalk', obox(fr, doorU + dw / 2, hw + th, foot, wh, hw, hw + th));
  bag.add('chalk', obox(fr, doorU - dw / 2, doorU + dw / 2, dh + 0.12, wh, hw, hw + th));
  bag.add('timber', obox(fr, doorU - dw / 2 - 0.1, doorU + dw / 2 + 0.1, dh, dh + 0.12, hw - 0.02, hw + th + 0.035));
  for (const sg of [-1, 1]) bag.add('timber', obox(fr, doorU + sg * dw / 2 - (sg > 0 ? 0 : 0.09), doorU + sg * dw / 2 + (sg > 0 ? 0.09 : 0), 0, dh, hw - 0.02, hw + th + 0.035));
  // the foot of the walls darkened by splashed mud, a skin of daub a little proud of the face
  for (const [u0, u1, v0, v1] of [[-hw - th - 0.02, hw + th + 0.02, -hw - th - 0.02, -hw - th], [-hw - th - 0.02, -hw - th, -hw - th, hw + th], [hw + th, hw + th + 0.02, -hw - th, hw + th]]) bag.add('plaster_damp', obox(fr, u0, u1, foot, 0.32, v0, v1));
  bag.add('plaster_damp', obox(fr, -hw - th - 0.02, doorU - dw / 2, foot, 0.32, hw + th, hw + th + 0.02));
  bag.add('plaster_damp', obox(fr, doorU + dw / 2, hw + th + 0.02, foot, 0.32, hw + th, hw + th + 0.02));
  // the wall-plate on the stakes, carrying the rafters
  const o = hw + th + 0.02, i0 = hw - 0.02;
  for (const [u0, u1, v0, v1] of [[-o, o, -o, -i0], [-o, o, i0, o], [-o, -i0, -i0, i0], [i0, o, -i0, i0]]) bag.add('timber', obox(fr, u0, u1, wh, wh + 0.1, v0, v1));
  // colliders: the walls (the doorway open)
  const P2 = (u, v) => { const p = W(fr, u, 0, v); return [p[0], p[2]]; };
  col.segment(P2(-hw, -hw - th / 2), P2(hw, -hw - th / 2), th, y + foot, y + wh);
  col.segment(P2(-hw - th / 2, -hw), P2(-hw - th / 2, hw), th, y + foot, y + wh);
  col.segment(P2(hw + th / 2, -hw), P2(hw + th / 2, hw), th, y + foot, y + wh);
  col.segment(P2(-hw, hw + th / 2), P2(doorU - dw / 2, hw + th / 2), th, y + foot, y + wh);
  col.segment(P2(doorU + dw / 2, hw + th / 2), P2(hw, hw + th / 2), th, y + foot, y + wh);
  // the roof: thatch outside, the woven hazel frame seen from within, a thick eave
  const e = hw + th + 0.75, ye = wh - 0.25, apex = wh + s * 0.95, ti = 0.32;
  const out = [], inn = [], rim = [];
  const C = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  for (let k = 0; k < 4; k++) {
    const [p, q] = [C[k], C[(k + 1) % 4]];
    const A = W(fr, p[0] * e, ye, p[1] * e), B = W(fr, q[0] * e, ye, q[1] * e), T = W(fr, 0, apex, 0);
    const ei = e - ti * 1.2, Ai = W(fr, p[0] * ei, ye + 0.02, p[1] * ei), Bi = W(fr, q[0] * ei, ye + 0.02, q[1] * ei), Ti = W(fr, 0, apex - ti * 1.6, 0);
    out.push(...A, ...T, ...B);
    inn.push(...Ai, ...Bi, ...Ti);
    rim.push(...A, ...B, ...Bi, ...A, ...Bi, ...Ai);
  }
  // wind each face outward/downward: outer faces away from the centre line, inner toward, the rim downward
  const orient = (tris, sign) => {
    for (let i = 0; i < tris.length; i += 9) {
      const ux = tris[i + 3] - tris[i], uy = tris[i + 4] - tris[i + 1], uz = tris[i + 5] - tris[i + 2], vx = tris[i + 6] - tris[i], vy = tris[i + 7] - tris[i + 1], vz = tris[i + 8] - tris[i + 2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const mx = (tris[i] + tris[i + 3] + tris[i + 6]) / 3 - x, my = sign === 'down' ? -1 : 0, mz = (tris[i + 2] + tris[i + 5] + tris[i + 8]) / 3 - z;
      const d = sign === 'down' ? ny * my : (nx * mx + nz * mz) * (sign === 'in' ? -1 : 1);
      if (d < 0) for (let k = 0; k < 3; k++) { const t = tris[i + 3 + k]; tris[i + 3 + k] = tris[i + 6 + k]; tris[i + 6 + k] = t; }
    }
    return tris;
  };
  bag.add('thatch', fromTriangles(orient(out, 'out')));
  bag.add('wicker', fromTriangles(orient(inn, 'in')));
  bag.add('thatch', fromTriangles(orient(rim, 'down')));
  // the apex bound into a capping bundle
  bag.add('wicker', lathe([[0.001, -0.5], [0.34, -0.42], [0.3, -0.05], [0.16, 0.12], [0.001, 0.16]], 10, null, ...W(fr, 0, apex - 0.1, 0)));
  // the hearth: a round kerb of chalk about a bed of ash, a few sticks; in some a fire
  bag.add('chalk', lathe([[0.62, 0], [0.62, 0.07], [0.5, 0.09], [0.45, 0.03], [0.001, 0.03]], 18, null, ...W(fr, 0, 0, -0.1)));
  bag.add('pottery_dark', lathe([[0.45, 0], [0.42, 0.035], [0.001, 0.045]], 14, null, ...W(fr, 0, 0.01, -0.1)));
  for (let k = 0; k < 3; k++) {
    const t = rand() * 6.28, p0 = W(fr, Math.cos(t) * 0.36, 0.06, -0.1 + Math.sin(t) * 0.36), p1 = W(fr, Math.cos(t) * 0.05, 0.12, -0.1 + Math.sin(t) * 0.05);
    const g = lathe([[0.035, 0], [0.03, 1], [0.001, 1]], 6);
    const dx = p1[0] - p0[0], dy = p1[1] - p0[1], dz = p1[2] - p0[2], L = Math.hypot(dx, dy, dz);
    g.scale(1, L, 1); g.rotateX(Math.atan2(Math.hypot(dx, dz), dy)); g.rotateY(Math.atan2(dx, dz)); g.translate(...p0);
    bag.add('log_pine', g);
  }
  if (rand() < 0.4) bag.add('flame', lathe([[0.16, 0], [0.12, 0.18], [0.05, 0.36], [0.001, 0.45]], 8, null, ...W(fr, 0, 0.06, -0.1)));
  // box beds against the side walls: plank sides staked into the floor, filled with bedding, a hide over it
  for (const sg of [-1, 1]) {
    if (rand() < 0.25) continue;
    const u0 = sg < 0 ? -hw + 0.02 : hw - 1.0, u1 = u0 + 0.98, v0 = -hw + 0.3, v1 = v0 + 1.9;
    bag.add('timber', obox(fr, u0, u1, 0, 0.36, v0, v0 + 0.06)); bag.add('timber', obox(fr, u0, u1, 0, 0.36, v1 - 0.06, v1));
    bag.add('timber', obox(fr, sg < 0 ? u1 - 0.06 : u0, sg < 0 ? u1 : u0 + 0.06, 0, 0.36, v0 + 0.06, v1 - 0.06));
    bag.add('reed_mat', obox(fr, u0 + (sg < 0 ? 0 : 0.06), u1 - (sg < 0 ? 0.06 : 0), 0, 0.26, v0 + 0.06, v1 - 0.06));
    bag.add(['hide_tan', 'hide_brown', 'hide_grey'][Math.floor(rand() * 3)], obox(fr, u0 + 0.1, u1 - 0.1, 0.26, 0.3, v0 + 0.25, v1 - 0.1));
    { const p0 = W(fr, (u0 + u1) / 2, 0, v0), p1 = W(fr, (u0 + u1) / 2, 0, v1); col.segment([p0[0], p0[2]], [p1[0], p1[2]], u1 - u0, y, y + 0.36); }
  }
  // the dresser against the back wall: posts and two shelves, Grooved Ware pots on them and below
  {
    const u0 = -0.8 + doorU * 0.3, u1 = u0 + 1.6, v0 = -hw + 0.02, v1 = v0 + 0.45;
    for (const uu of [u0, u1 - 0.07]) for (const vv of [v0, v1 - 0.07]) bag.add('timber', obox(fr, uu, uu + 0.07, 0, 1.15, vv, vv + 0.07));
    for (const yy of [0.45, 1.1]) bag.add('timber', obox(fr, u0 - 0.03, u1 + 0.03, yy, yy + 0.05, v0, v1));
    for (let k = 0; k < 3; k++) {
      const r = 0.1 + rand() * 0.06, ph = 0.18 + rand() * 0.12, uu = u0 + 0.3 + k * 0.5, yy = k === 1 ? 0 : 0.5;
      bag.add(rand() < 0.5 ? 'pottery_dark' : 'terracotta', lathe(groovedWare(r, ph), 14, null, ...W(fr, uu, yy, v0 + 0.22)));
    }
  }
  // the roof frame seen from within: eight hazel rafters from the wall-plate to the apex (corners and middles of the sides),
  // bound by two hoops of withy; a cooking pot in the embers; a saddle quern by the door; baskets at the beds
  {
    const ei = e - ti * 1.2 + 0.02, ya = apex - ti * 1.6 - 0.1;
    const ring = (f, yy) => { const pts = []; for (let k = 0; k < 8; k++) { const t = k / 8 * Math.PI * 2, c = Math.cos(t), sn = Math.sin(t), m = 1 / Math.max(Math.abs(c), Math.abs(sn)); pts.push(W(fr, c * m * ei * f, yy, sn * m * ei * f)); } return pts; };
    const base = ring(1, ye - 0.09), h1 = ring(0.62, ye - 0.09 + (ya - ye) * 0.38), h2 = ring(0.3, ye - 0.09 + (ya - ye) * 0.72);
    for (let k = 0; k < 8; k++) {
      bag.add('timber', stick(base[k], W(fr, 0, ya, 0), 0.032, 5));
      for (const R of [h1, h2]) bag.add('wicker', stick(R[k], R[(k + 1) % 8], 0.014, 4));
    }
  }
  bag.add('pottery_dark', lathe(groovedWare(0.19, 0.3), 14, null, ...W(fr, 0.28, 0.035, -0.28)));
  if (rand() < 0.8) {
    const u = doorU - dw / 2 - 0.55, v = hw - 0.55;
    bag.add('granite_rough', lathe([[0.001, 0], [0.24, 0], [0.26, 0.05], [0.18, 0.1], [0.001, 0.1]], 10, null, ...W(fr, u, 0, v)));
    bag.add('granite_rough', lathe([[0.001, 0.08], [0.09, 0.1], [0.1, 0.14], [0.001, 0.15]], 8, null, ...W(fr, u + 0.05, 0.02, v - 0.03)));
  }
  for (const sg of [-1, 1]) if (rand() < 0.6) bag.add('wicker', lathe([[0.001, 0], [0.2, 0], [0.24, 0.3], [0.21, 0.31], [0.001, 0.04]], 12, null, ...W(fr, sg * (hw - 1.3), 0, -hw + 1.0 + rand() * 0.6)));
  // a woven hurdle for a door, hung back against the outside of the wall beside the doorway
  if (rand() < 0.7) bag.add('wicker', obox(fr, doorU + dw / 2 + 0.12, doorU + dw / 2 + 0.95, 0.05, 1.45, hw + th + 0.04, hw + th + 0.09));
  // by the door inside, a large pot; outside, firewood stacked against the wall
  bag.add('pottery_dark', lathe(groovedWare(0.22, 0.4), 14, null, ...W(fr, doorU + dw / 2 + 0.4, 0, hw - 0.35)));
  if (rand() < 0.7) for (let k = 0; k < 5; k++) {
    const g = lathe([[0.05, 0], [0.045, 1.3], [0.001, 1.3]], 6); g.rotateZ(Math.PI / 2 - 0.05); g.rotateY(-(a + Math.PI / 2));
    const p = W(fr, -hw - th - 0.12 - (k % 2) * 0.1, 0.05 + Math.floor(k / 2) * 0.09 + (low - y), -0.8 + k * 0.05);
    g.translate(...p); bag.add('log_pine', g);
  }
  // weathering of the daub: hairline cracks running down from the wall-plate, a few patches of fresh chalk wash where it has been
  // mended, the mud-splash higher on the weather side
  for (let k = 0; k < 7; k++) {
    const side = Math.floor(rand() * 3), u = (rand() - 0.5) * (s - 0.8), h0 = 0.5 + rand() * 1.0, L = 0.25 + rand() * 0.5;
    const [uu, vv, nu, nv] = side === 0 ? [u, -hw - th - 0.025, 0, -1] : side === 1 ? [-hw - th - 0.025, u, -1, 0] : [hw + th + 0.025, u, 1, 0];
    if (k < 4) bag.add('pottery_dark', obox(fr, uu - (nu ? 0.003 : 0.012), uu + (nu ? 0.003 : 0.012), h0, h0 + L, vv - (nv ? 0.003 : 0.012), vv + (nv ? 0.003 : 0.012)));
    else bag.add('limewash_white', obox(fr, uu - (nu ? 0.006 : 0.3), uu + (nu ? 0.006 : 0.3), h0, h0 + 0.4, vv - (nv ? 0.006 : 0.3), vv + (nv ? 0.006 : 0.3)));
  }
  // within: strings of hazelnuts and bundles of herbs and a smoked flitch hung from the rafters, a hide spread by the hearth,
  // two log seats, a stack of firewood against the wall, an antler hung on a peg
  {
    const ei = e - ti * 1.2, hang = (u, v, drop, mat, r, len) => { const top = ye + (1 - Math.max(Math.abs(u), Math.abs(v)) / ei) * (apex - ye) - 0.28; bag.add('rope_fibre', stick(W(fr, u, top, v), W(fr, u, top - drop, v), 0.006, 4)); bag.add(mat, lathe([[0.001, 0], [r, len * 0.2], [r * 0.9, len * 0.8], [0.001, len]], 7, null, ...W(fr, u, top - drop - len, v))); };
    hang(0.9, -0.9, 0.35, 'thatch', 0.08, 0.3); hang(-1.0, -0.4, 0.45, 'ichu', 0.07, 0.25); hang(0.5, 0.9, 0.3, 'hide_brown', 0.09, 0.4);
    for (let k = 0; k < 6; k++) bag.add('wood_ochre', pebble(0.025, W(fr, -0.85 + k * 0.03, 1.55 - k * 0.04, 0.6 + k * 0.02)));
    bag.add(['hide_tan', 'hide_brown', 'hide_white'][Math.floor(rand() * 3)], lathe([[0.7, 0], [0.68, 0.014], [0.001, 0.016]], 10, null, ...W(fr, 0.25, 0.01, 1.2)));
    for (const [u, v] of [[-0.95, -0.2], [0.85, 0.15]]) bag.add('log_pine', lathe([[0.17, 0], [0.16, 0.26], [0.001, 0.27]], 8, null, ...W(fr, u, 0, v)));
    for (let k = 0; k < 6; k++) { const uu = -hw + 0.28 + (k % 3) * 0.1, yy = 0.05 + Math.floor(k / 3) * 0.1; bag.add('log_pine', stick(W(fr, uu, yy, hw - 1.9), W(fr, uu, yy, hw - 0.7), 0.05, 6)); }
  }
}

/**
 * timber_circle: the Southern Circle at Durrington Walls (docs/settlements/stonehenge.md §5b) { posts: [{ at, y, r, h,
 * seed }] }: great posts of oak, each a trunk set upright in its pit, a little irregular in section and leaning a
 * hair, its top cut flat; the foot packed round with a collar of rammed chalk.
 */
function timberCircle(el, { bag, col }) {
  for (const p of el.posts) {
    const rand = rng(p.seed ?? 1), [x, z] = p.at, y = p.y, r = p.r, h = p.h, n = 9, lean = [(rand() - 0.5) * 0.04, (rand() - 0.5) * 0.04];
    const wob = Array.from({ length: n }, () => 0.9 + rand() * 0.18), rings = [];
    for (let k = 0; k <= 4; k++) {
      const f = k / 4, rr = r * (1 - 0.12 * f), yy = y - 0.4 + (h + 0.4) * f, cx = x + lean[0] * h * f, cz = z + lean[1] * h * f;
      rings.push(Array.from({ length: n }, (_, j) => { const a = j / n * Math.PI * 2; return [cx + Math.cos(a) * rr * wob[j], yy, cz + Math.sin(a) * rr * wob[j]]; }));
    }
    bag.add('bark_dark', loft(rings, { capStart: false }));
    bag.add('timber', lathe([[0.001, 0], [r * 0.86, 0], [r * 0.86, 0.02]], n, null, x + lean[0] * h, y + h - 0.01, z + lean[1] * h));      // the cut top, pale
    bag.add('chalk', lathe([[r * 1.9, -0.1], [r * 1.7, 0.08], [r * 1.05, 0.16], [r * 0.95, 0.16]], 10, null, x, y, z));   // the rammed chalk round the foot
    col.circle(x, z, r * 1.05, y, y + h);
  }
}

/** A stick or log from p0 to p1 (radius r), as a lathe laid along the segment. */
function stick(p0, p1, r, n = 6) {
  const g = lathe([[r, 0], [r * 0.9, 1], [0.001, 1]], n);
  const dx = p1[0] - p0[0], dy = p1[1] - p0[1], dz = p1[2] - p0[2], L = Math.hypot(dx, dy, dz);
  g.scale(1, L, 1); g.rotateX(Math.atan2(Math.hypot(dx, dz), dy)); g.rotateY(Math.atan2(dx, dz)); g.translate(...p0);
  return g;
}
/**
 * feast_fire: { c, r (the ground kept round it, for those sitting at it), y, yaw, pig (a carcass roasting on the spit), seed } — the open fires of the midwinter feasts at
 * Durrington (docs/settlements/stonehenge.md §10a): a shallow scoop ringed with burnt flints and chalk, a bed of ash and
 * embers, logs laid in a star, the flames; across it, on two forked stakes, a green spit of hazel with a pig spitted
 * along it, browned; Grooved Ware pots set at the edge of the fire, cooking.
 */
function feastFire(el, { bag, col }) {
  const rand = rng(el.seed || 9), [x, z] = el.c ?? el.at, y = el.y ?? 0, a = el.yaw ?? 0, c = Math.cos(a), s = Math.sin(a);
  const P = (u, yy, v) => [x + u * c - v * s, y + yy, z + u * s + v * c];
  bag.add('pottery_dark', lathe([[1.15, -0.02], [1.0, 0.03], [0.55, 0.02], [0.001, 0.0]], 18, null, x, y, z));           // the scorched ground and ash
  bag.add('linen', lathe([[0.62, 0], [0.5, 0.025], [0.001, 0.035]], 14, null, x, y + 0.005, z));                          // grey-white ash
  for (let k = 0; k < 16; k++) {                                                                                          // the ring of burnt flints and chalk
    const t = k / 16 * Math.PI * 2 + rand() * 0.2, r = 0.8 + rand() * 0.1, q = [x + Math.cos(t) * r, y, z + Math.sin(t) * r], sz = 0.07 + rand() * 0.06;
    bag.add(k % 3 ? 'granite_rough' : 'chalk', lathe([[sz, 0], [sz * 0.9, sz * 0.6], [0.001, sz]], 5, null, ...q));
  }
  for (let k = 0; k < 6; k++) { const t = k / 6 * Math.PI * 2 + rand() * 0.4; bag.add(k % 2 ? 'log_pine' : 'bark_dark', stick([x + Math.cos(t) * 0.75, y + 0.04, z + Math.sin(t) * 0.75], [x + Math.cos(t) * 0.08, y + 0.16, z + Math.sin(t) * 0.08], 0.06)); }
  bag.add('flame', lathe([[0.32, 0], [0.26, 0.25], [0.12, 0.55], [0.001, 0.75]], 9, null, x, y + 0.06, z));
  // the spit on two forked hazel stakes
  for (const sg of [-1, 1]) {
    const f = P(sg * 1.05, 0, 0);
    bag.add('timber', stick([f[0], y - 0.3, f[2]], [f[0], y + 0.95, f[2]], 0.035));
    for (const d of [-1, 1]) bag.add('timber', stick(P(sg * 1.05, 0.88, 0), P(sg * 1.05, 1.08, d * 0.09), 0.02));
    col.circle(f[0], f[2], 0.06, y, y + 1.0);
  }
  bag.add('timber', stick(P(-1.3, 0.95, 0), P(1.3, 0.95, 0), 0.025));
  bag.add('timber', stick(P(1.3, 0.95, 0), P(1.3, 0.75, -0.25), 0.02));                                                  // the crank to turn it
  if (el.pig !== false) {
    // the carcass along the spit: the body, the head with its snout, the legs drawn out fore and aft, browned
    const body = lathe([[0.001, 0], [0.12, 0.05], [0.2, 0.2], [0.23, 0.45], [0.22, 0.65], [0.16, 0.82], [0.001, 0.9]], 12);
    body.scale(1, 1, 0.85); body.rotateZ(-Math.PI / 2); body.translate(-0.45, 0, 0); body.rotateY(-a); body.translate(x, y + 0.92, z);
    bag.add('wood_ochre', body);
    const head = lathe([[0.001, 0], [0.11, 0.04], [0.12, 0.14], [0.07, 0.26], [0.045, 0.3], [0.001, 0.31]], 10);
    head.rotateZ(-Math.PI / 2); head.translate(0.42, -0.02, 0); head.rotateY(-a); head.translate(x, y + 0.92, z);
    bag.add('wood_ochre', head);
    for (const [u0, u1] of [[0.25, 0.62], [-0.3, -0.68]]) for (const d of [-0.07, 0.07]) bag.add('wood_ochre', stick(P(u0, 0.84, d), P(u1, 0.86, d * 1.3), 0.035, 5));
  }
  // pots at the fire's edge
  for (let k = 0; k < 2 + Math.floor(rand() * 2); k++) {
    const t = Math.PI / 2 + (k - 0.5) * 0.7 + rand() * 0.2, r = 0.62, q = [x + Math.cos(t + a) * r, y, z + Math.sin(t + a) * r];
    bag.add(rand() < 0.6 ? 'pottery_dark' : 'terracotta', lathe(groovedWare(0.13 + rand() * 0.05, 0.22 + rand() * 0.08), 14, null, ...q));
  }
}
/**
 * midden: { c, y, r, seed } — a heap of the feasts' leavings: dark earthy refuse with ash, the bones of pigs and cattle
 * (long bones, jaws, skulls) and broken Grooved Ware thrown on it.
 */
function midden(el, { bag }) {
  const rand = rng(el.seed || 11), [x, z] = el.c ?? el.at, y = el.y ?? 0, R = el.r ?? 1.6;
  const mound = lathe([[R, -0.05], [R * 0.85, 0.1], [R * 0.55, 0.26], [R * 0.25, 0.34], [0.001, 0.36]], 14);
  mound.scale(1, 1, 0.75 + rand() * 0.2); mound.rotateY(rand() * 3); mound.translate(x, y, z);
  bag.add('mud_plaster', mound);
  const hgt = (r) => 0.36 * Math.max(0, 1 - (r / R) ** 1.6);
  for (let k = 0; k < 26; k++) {
    const t = rand() * 6.28, r = Math.sqrt(rand()) * R * 0.85, px = x + Math.cos(t) * r, pz = z + Math.sin(t) * r * 0.85, py = y + hgt(r) - 0.01;
    const kind = rand();
    if (kind < 0.55) { const L = 0.14 + rand() * 0.22, b = rand() * 6.28; bag.add('linen', stick([px - Math.cos(b) * L / 2, py, pz - Math.sin(b) * L / 2], [px + Math.cos(b) * L / 2, py + 0.02, pz + Math.sin(b) * L / 2], 0.018, 5)); }
    else if (kind < 0.7) bag.add('linen', lathe([[0.001, 0], [0.07, 0.02], [0.08, 0.07], [0.05, 0.11], [0.001, 0.12]], 7, null, px, py - 0.03, pz));
    else { const sz = 0.05 + rand() * 0.05, b = rand() * 6.28; bag.add('pottery_dark', box(-sz, 0, -0.01, sz, 0.012, 0.01).rotateY(b).rotateZ((rand() - 0.5) * 0.4).translate(px, py, pz)); }
  }
}


/**
 * aubrey_holes: { holes: [{ at, y, r, seed }] } — the 56 Aubrey Holes (docs/settlements/stonehenge.md §1d): pits about 1.06 m across,
 * refilled soon after digging with the chalk rubble thrown out of them, so each shows as a patch of white rubble, a little proud,
 * with lumps of chalk on it, the turf not yet grown over.
 */
function aubreyHoles(el, { bag }) {
  for (const h of el.holes) {
    const rand = rng(h.seed ?? 1), [x, z] = h.at, r = h.r ?? 0.55;
    bag.add('chalk', lathe([[r * 1.12, -0.04], [r * 0.98, 0.012], [r * 0.7, 0.05], [r * 0.3, 0.07], [0.001, 0.075]], 12, null, x, h.y, z));
    for (let k = 0, n = 5 + Math.floor(rand() * 4); k < n; k++) {
      const t = rand() * 6.28, d = Math.sqrt(rand()) * r * 0.85, sz = 0.04 + rand() * 0.07;
      bag.add('chalk', lathe([[sz, 0], [sz * 0.95, sz * 0.5], [sz * 0.5, sz * 0.9], [0.001, sz]], 5, null, x + Math.cos(t) * d, h.y + 0.05 + 0.02 * (1 - d / r), z + Math.sin(t) * d));
    }
    if (rand() < 0.4) bag.add('plaster_damp', lathe([[r * 1.45, -0.04], [r * 1.2, 0.0], [r * 1.1, -0.04]], 12, null, x, h.y, z));      // the dark ring of the dug soil trodden into the turf
  }
}

/**
 * camp_shelter: { c, y, yaw, r, h, seed } — a gatherer's shelter: hazel poles leaning in to a point, covered with sewn hides
 * (tan, brown and grey patches), the poles crossing and standing out above the apex, a low door facing +v with a flap
 * hung back; a smoke hole under the crossing; turf and chalk heaped round the foot against the wind.
 */
function campShelter(el, { bag, col }) {
  const rand = rng(el.seed || 21), [x, z] = el.c, y = el.y ?? 0, a = el.yaw ?? 0, R = el.r ?? 1.9, Hh = el.h ?? 2.5, N = 10;
  const fr = { x, z, y, c: Math.cos(a), s: Math.sin(a) };
  const mats = ['hide_tan', 'hide_brown', 'hide_grey', 'hide_tan'];
  for (let k = 0; k < N; k++) {
    // a panel of hide between two poles, bellied a little between them; its rows of stitches left bare
    const a0 = k / N * Math.PI * 2, a1 = (k + 1) / N * Math.PI * 2, am = (a0 + a1) / 2, m = mats[Math.floor(rand() * mats.length)];
    const pr = (aa, f) => W(fr, Math.cos(aa) * R * (1 - f), Hh * f - 0.05, Math.sin(aa) * R * (1 - f));
    const T = [];
    for (let j = 0; j < 4; j++) {
      const f0 = j / 4, f1 = (j + 1) / 4, bel = (f) => 1 + 0.05 * Math.sin(f * Math.PI);
      const A = pr(a0, f0), B = pr(a1, f0), C = pr(a1, f1), D = pr(a0, f1), Mm0 = W(fr, Math.cos(am) * R * (1 - f0) * bel(f0), Hh * f0 - 0.05, Math.sin(am) * R * (1 - f0) * bel(f0)), Mm1 = W(fr, Math.cos(am) * R * (1 - f1) * bel(f1), Hh * f1 - 0.05, Math.sin(am) * R * (1 - f1) * bel(f1));
      T.push(...A, ...Mm1, ...D, ...A, ...Mm0, ...Mm1, ...A, ...B, ...Mm0, ...B, ...Mm1, ...Mm0, ...B, ...C, ...Mm1);
    }
    // wind outward: faces away from the axis
    for (let i = 0; i < T.length; i += 9) {
      const ux = T[i + 3] - T[i], uy = T[i + 4] - T[i + 1], uz = T[i + 5] - T[i + 2], vx = T[i + 6] - T[i], vy = T[i + 7] - T[i + 1], vz = T[i + 8] - T[i + 2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const mx = (T[i] + T[i + 3] + T[i + 6]) / 3 - x, my = (T[i + 1] + T[i + 4] + T[i + 7]) / 3 - y - Hh * 0.4, mz = (T[i + 2] + T[i + 5] + T[i + 8]) / 3 - z;
      if (nx * mx + ny * my + nz * mz < 0) for (let q = 0; q < 3; q++) { const t = T[i + 3 + q]; T[i + 3 + q] = T[i + 6 + q]; T[i + 6 + q] = t; }
    }
    if (Math.abs(Math.atan2(Math.sin(am - Math.PI / 2), Math.cos(am - Math.PI / 2))) < 0.2) continue;     // the doorway (+v)
    bag.add(m, fromTriangles(T));
  }
  // the door: a dark opening under a lintel pole, the flap hung back to one side
  bag.add('pottery_dark', obox(fr, -0.36, 0.36, 0, 1.15, R * 0.62, R * 0.62 + 0.05));
  bag.add('timber', stick(W(fr, -0.42, 1.2, R * 0.6), W(fr, 0.42, 1.2, R * 0.6), 0.03, 5));
  for (let k = 0; k < N; k += 1) bag.add('timber', stick(W(fr, Math.cos(k / N * 6.283) * R * 1.02, 0, Math.sin(k / N * 6.283) * R * 1.02), W(fr, Math.cos(k / N * 6.283 + 3.1) * 0.12, Hh + 0.35, Math.sin(k / N * 6.283 + 3.1) * 0.12), 0.026, 5));
  bag.add('plaster_damp', lathe([[R * 1.12, -0.05], [R * 1.04, 0.1], [R * 0.99, 0.18], [R * 0.97, 0.02]], 14, null, x, y, z));
  col.circle(x, z, R * 0.95, y, y + Hh);
}

/** hurdle: { a, b, y, h, seed } — a woven hazel hurdle fence (a windbreak, a pen): rails of withy woven between stakes. */
function hurdle(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, y = el.y ?? 0, h = el.h ?? 1.1, L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L;
  const n = Math.max(2, Math.round(L / 0.45)), at = (t, yy) => [ax + ux * t, y + yy, az + uz * t];
  for (let k = 0; k <= n; k++) { const t = L * k / n; bag.add('timber', stick(at(t, -0.2), at(t, h + 0.05 * (k % 2)), 0.028, 5)); }
  for (let r = 0; r < 6; r++) for (let k = 0; k < n; k++) { const t0 = L * k / n, t1 = L * (k + 1) / n, off = (k + r) % 2 ? 0.03 : -0.03, yy = 0.12 + r * (h - 0.2) / 5; const p = at(t0, yy), q = at(t1, yy + 0.015); bag.add('wicker', stick([p[0] - uz * off, p[1], p[2] + ux * off], [q[0] - uz * off, q[1], q[2] + ux * off], 0.016, 4)); }
  col.segment([ax, az], [bx, bz], 0.12, y - 0.2, y + h);
}


// ── the yards, the crafts, the litter of the work, the scrub ─────────────────────────────────────────
const LEAF_MATS = ['flax_leaf', 'lotus_leaf'];
/** A small rounded stone (a flint nodule, a hammerstone, a chalk lump) of radius r at p. */
const pebble = (r, p, sq = 0.7) => lathe([[0.001, 0], [r, r * 0.25], [r * 0.9, r * 0.7], [0.001, r * sq * 1.4]], 6, null, p[0], p[1], p[2]);
/** A flat flake of stone: a thin tilted plate. */
const flake = (sz, p, rand) => box(-sz, 0, -sz * 0.6, sz, 0.012, sz * 0.6).rotateY(rand() * 6.28).rotateZ((rand() - 0.5) * 0.5).translate(p[0], p[1], p[2]);
/** An antler pick: a tine's length of beam with the brow tine, pale. */
function antlerPick(bag, p, ang, rand, y0 = 0.03) {
  const c = Math.cos(ang), s = Math.sin(ang), L = 0.55 + rand() * 0.15;
  const a = [p[0], y0, p[2]], b = [p[0] + c * L, y0 + 0.03, p[2] + s * L];
  bag.add('linen', stick(a, b, 0.022, 5));
  bag.add('linen', stick([a[0] + c * L * 0.3, y0 + 0.02, a[2] + s * L * 0.3], [a[0] + c * L * 0.3 - s * 0.2, y0 + 0.12, a[2] + s * L * 0.3 + c * 0.2], 0.016, 4));
  bag.add('linen', stick(b, [b[0] + c * 0.12 + s * 0.1, y0 + 0.12, b[2] + s * 0.12 - c * 0.1], 0.015, 4));
}

/**
 * yard: { c (the house), s, yaw, seed, k } — what lies about a house door: a woven hazel hurdle screening a yard beside the
 * door (some), a storage pit lidded with a hurdle disc weighted with stones and a basket by it, a hide stretched on a frame, a ring
 * of log seats, a stack of thatching straw bundles against the wall, bundles of hazel rods leaning, a quern outdoors, a pot of water.
 * k picks the set (0..3); the house frame as in `house`: +v toward the door.
 */
function yard(el, { bag, col }) {
  const rand = rng(el.seed || 5), [x, z] = el.c, y = el.y ?? 0, a = el.yaw ?? 0, s = el.s ?? 5, hw = s / 2;
  const fr = { x, z, y, c: Math.cos(a), s: Math.sin(a) }, k = el.k ?? 0;
  const at = (u, v, yy = 0) => { const p = W(fr, u, 0, v); return [p[0], y + yy, p[2]]; };
  const front = hw + 0.16 + 0.9;
  // the way up to the door trodden: a scatter of chalk lumps and flints
  for (let i = 0; i < 9; i++) bag.add(i % 3 ? 'chalk' : 'granite_black', pebble(0.04 + rand() * 0.04, at((rand() - 0.5) * 2.6, front + rand() * 2.4, 0)));
  if (k === 0 || k === 2) {                                  // a hurdle screen forming a yard on one side of the door, a log seat
    const sg = rand() < 0.5 ? -1 : 1, u0 = sg * 1.3, u1 = sg * 3.4, v = front + 0.2;
    const p = W(fr, u0, 0, v), q = W(fr, u1, 0, v), p2 = W(fr, u1, 0, v + 2.2);
    const gy = () => y;
    hurdle({ a: [p[0], p[2]], b: [q[0], q[2]], y: gy(p), h: 1.1, seed: el.seed }, { bag, col });
    hurdle({ a: [q[0], q[2]], b: [p2[0], p2[2]], y: gy(q), h: 1.1, seed: el.seed + 1 }, { bag, col });
    const lg = at(sg * 2.2, v + 1.1, 0.14); bag.add('log_pine', stick([lg[0] - fr.c * 0.5, lg[1], lg[2] - fr.s * 0.5], [lg[0] + fr.c * 0.5, lg[1], lg[2] + fr.s * 0.5], 0.14, 7));
    col.circle(lg[0], lg[2], 0.3, y, y + 0.3);
  }
  if (k === 1 || k === 3) {                                  // a storage pit lidded with a weighted hurdle disc, a basket by it
    const sg = k === 1 ? 1 : -1, p = at(sg * 2.6, front + 1.2, 0.0);
    bag.add('plaster_damp', lathe([[0.62, -0.02], [0.55, 0.04], [0.0, 0.05]], 14, null, p[0], p[1], p[2]));
    bag.add('wicker', lathe([[0.001, 0.05], [0.5, 0.07], [0.52, 0.1], [0.001, 0.1]], 14, null, p[0], p[1], p[2]));
    for (let i = 0; i < 4; i++) bag.add('granite_rough', pebble(0.09 + rand() * 0.05, [p[0] + Math.cos(i * 1.6) * 0.3, p[1] + 0.1, p[2] + Math.sin(i * 1.6) * 0.3]));
    const b = at(sg * 2.6 + 0.9, front + 0.9, 0); bag.add('wicker', lathe([[0.001, 0], [0.22, 0], [0.27, 0.34], [0.24, 0.35], [0.001, 0.05]], 12, null, b[0], b[1], b[2]));
    col.circle(p[0], p[2], 0.55, y - 0.05, y + 0.12);
  }
  if (k === 1 || k === 2) {                                  // a hide stretched to dry on a frame of hazel poles, leaning at the wall
    const sg = k === 1 ? -1 : 1, u = sg * (hw - 0.2), v = hw + 0.16 + 0.55, a0 = at(u - 0.5, v, 0), a1 = at(u + 0.5, v, 0), top = 1.35;
    for (const p of [a0, a1]) bag.add('timber', stick(p, [p[0] + fr.s * 0.0, p[1] + top, p[2]], 0.025, 5));
    bag.add('timber', stick([a0[0], a0[1] + top, a0[2]], [a1[0], a1[1] + top, a1[2]], 0.02, 5));
    bag.add('timber', stick([a0[0], a0[1] + 0.35, a0[2]], [a1[0], a1[1] + 0.35, a1[2]], 0.02, 5));
    bag.add(['hide_tan', 'hide_brown', 'hide_white'][Math.floor(rand() * 3)], obox(fr, Math.min(u - 0.45, u + 0.45), Math.max(u - 0.45, u + 0.45), 0.4, top - 0.03, v - 0.015, v + 0.015));
  }
  if (k === 0 || k === 3) {                                  // bundles of thatching straw leaning against the wall, hazel rods in a sheaf
    const sg = rand() < 0.5 ? -1 : 1;
    for (let i = 0; i < 4; i++) { const p = at(sg * (hw - 0.4 - i * 0.18), hw + 0.16 + 0.22, 0), q = at(sg * (hw - 0.4 - i * 0.18), hw + 0.16 + 0.02, 1.2); bag.add('thatch', stick(p, q, 0.11, 7)); }
    for (let i = 0; i < 6; i++) { const p = at(-sg * (hw - 0.3) - i * 0.015 * sg, hw + 0.16 + 0.3 + i * 0.02, 0), q = at(-sg * (hw - 0.3) + (i - 3) * 0.02, hw + 0.16 + 0.03, 1.9); bag.add('wicker', stick(p, q, 0.012, 4)); }
  }
  // a pot of water by the door
  { const p = at((rand() < 0.5 ? -1 : 1) * 0.9, hw + 0.16 + 0.35, 0); bag.add('terracotta', lathe(groovedWare(0.2, 0.42), 12, null, p[0], p[1], p[2])); }
}

/**
 * craft: { c, y, yaw, kind, seed } — a place of work in the open, the tools and stuff laid out where its worker squats:
 * 'knap' (a flint knapper: a flat stone for an anvil, nodules in a heap, a drift of grey flakes round it, axe blanks on a hide, an antler hammer),
 * 'pots' (a potter: a heap of grey clay, pots standing to dry, a bone paddle, a firing pit with flints and firewood),
 * 'basket' (a basket-maker: sheaves of hazel and willow rods, a half-woven basket on the ground, a bone awl),
 * 'grind' (grain milling: two saddle querns on a hide, a heap of grain, a basket, a pot of flour), 'hides' (scraping a hide pegged out on the ground, a flint scraper).
 */
function craft(el, { bag, col }) {
  const rand = rng(el.seed || 7), [x, z] = el.c, y = el.y ?? 0, a = el.yaw ?? 0, fr = { x, z, y, c: Math.cos(a), s: Math.sin(a) };
  const at = (u, v, yy = 0) => W(fr, u, yy, v);
  switch (el.kind) {
    case 'knap': {
      bag.add('hide_tan', lathe([[1.0, 0], [0.98, 0.012], [0.001, 0.014]], 12, null, ...at(0, 0.1)));
      bag.add('granite_rough', lathe([[0.001, 0], [0.34, 0], [0.3, 0.16], [0.001, 0.19]], 8, null, ...at(0.2, 0.55)));
      for (let i = 0; i < 9; i++) bag.add('granite_black', pebble(0.07 + rand() * 0.05, at(-0.9 + rand() * 0.4, -0.3 + rand() * 0.7, 0.02)));
      for (let i = 0; i < 70; i++) { const t = rand() * 6.28, r = 0.25 + Math.sqrt(rand()) * 0.9; bag.add(i % 4 ? 'granite_black' : 'chalk', flake(0.012 + rand() * 0.02, at(Math.cos(t) * r + 0.1, Math.sin(t) * r * 0.8 + 0.1, 0.012), rand)); }
      for (let i = 0; i < 3; i++) bag.add('granite_black', lathe([[0.001, 0], [0.045, 0.01], [0.05, 0.14], [0.001, 0.26]], 5, null, ...at(0.45 + i * 0.12, -0.2 - i * 0.05, 0.016)));
      antlerPick(bag, at(-0.2, 0.9, 0.0), a + 0.7, rand, y + 0.03 - y);
      break;
    }
    case 'pots': {
      bag.add('mud_plaster', lathe([[0.55, 0], [0.45, 0.14], [0.2, 0.24], [0.001, 0.26]], 10, null, ...at(-0.9, 0.2)));
      for (let i = 0; i < 6; i++) { const t = i * 1.05 + rand() * 0.4, r = 0.5 + rand() * 0.45; bag.add(rand() < 0.5 ? 'terracotta' : 'pottery_dark', lathe(groovedWare(0.1 + rand() * 0.08, 0.2 + rand() * 0.2), 12, null, ...at(0.5 + Math.cos(t) * r, 0.1 + Math.sin(t) * r * 0.9, 0))); }
      bag.add('pottery_dark', lathe([[1.1, -0.02], [0.95, 0.02], [0.001, 0.0]], 14, null, ...at(1.7, -0.6)));
      for (let i = 0; i < 8; i++) { const t = i / 8 * 6.28; bag.add('granite_black', pebble(0.07, at(1.7 + Math.cos(t) * 0.95, -0.6 + Math.sin(t) * 0.95, 0))); }
      for (let i = 0; i < 5; i++) bag.add('log_pine', stick(at(1.4 + i * 0.07, -0.5 + i * 0.1, 0.05), at(2.0 + i * 0.05, -0.9 + i * 0.16, 0.12), 0.04, 6));
      bag.add('linen', stick(at(-0.1, 0.9, 0.02), at(0.25, 0.97, 0.03), 0.02, 5));
      break;
    }
    case 'basket': {
      for (let i = 0; i < 12; i++) bag.add(i % 3 ? 'wicker' : 'timber', stick(at(-1.0 + i * 0.015, -0.2 + i * 0.03, 0.03), at(-0.95 + i * 0.01, -0.2 + i * 0.03 + 0.2, 0.9 + rand() * 0.15), 0.011, 4));
      const bk = at(0.4, 0.3, 0);
      bag.add('wicker', lathe([[0.001, 0.02], [0.24, 0.02], [0.3, 0.16], [0.28, 0.3], [0.001, 0.3]], 12, null, ...bk));
      for (let i = 0; i < 14; i++) { const t = i / 14 * 6.28, b = at(0.4 + Math.cos(t) * 0.28, 0.3 + Math.sin(t) * 0.28, 0.3); bag.add('wicker', stick([b[0], b[1], b[2]], [b[0] + Math.cos(t) * 0.04, b[1] + 0.32, b[2] + Math.sin(t) * 0.04], 0.01, 4)); }
      bag.add('wicker', lathe([[0.001, 0.0], [0.2, 0.0], [0.24, 0.14], [0.001, 0.14]], 12, null, ...at(1.0, -0.2)));
      break;
    }
    case 'grind': {
      bag.add('hide_brown', lathe([[1.1, 0], [1.08, 0.012], [0.001, 0.014]], 12, null, ...at(0, 0)));
      for (const sg of [-1, 1]) { bag.add('granite_rough', lathe([[0.001, 0.01], [0.3, 0.01], [0.33, 0.07], [0.22, 0.12], [0.001, 0.12]], 10, null, ...at(sg * 0.45, 0.15))); bag.add('granite_rough', lathe([[0.001, 0.1], [0.1, 0.12], [0.11, 0.17], [0.001, 0.18]], 8, null, ...at(sg * 0.45 + 0.04, 0.12))); }
      bag.add('ichu', lathe([[0.4, 0], [0.3, 0.1], [0.12, 0.17], [0.001, 0.18]], 10, null, ...at(-0.2, -0.65)));
      bag.add('wicker', lathe([[0.001, 0], [0.2, 0], [0.25, 0.3], [0.001, 0.04]], 12, null, ...at(0.9, -0.5)));
      bag.add('pottery_dark', lathe(groovedWare(0.16, 0.3), 12, null, ...at(1.05, 0.5)));
      break;
    }
    case 'hides': {
      bag.add(['hide_tan', 'hide_brown', 'hide_white'][Math.floor(rand() * 3)], obox(fr, -0.8, 0.8, 0.0, 0.025, -0.55, 0.55));
      for (const [u, v] of [[-0.8, -0.55], [0.8, -0.55], [0.8, 0.55], [-0.8, 0.55], [0, -0.55], [0, 0.55]]) bag.add('timber', stick(at(u, v, -0.05), at(u, v, 0.14), 0.022, 5));
      bag.add('granite_black', lathe([[0.001, 0], [0.06, 0.01], [0.07, 0.04], [0.001, 0.05]], 6, null, ...at(0.9, 0.2, 0.01)));
      bag.add('linen', stick(at(0.55, 0.2, 0.03), at(0.9, 0.25, 0.05), 0.02, 5));
      break;
    }
  }
}

/**
 * litter: { c, r, n, kind, seed } — what the work of the monument leaves on the chalk: kind 'dressing' (chips and flakes of grey and
 * white sarsen, sarsen mauls of the size of a head, antler picks, a coil of rope of twisted lime-bast, rollers of oak), 'path' (chalk lumps
 * and flints trodden into the track), 'offering' (a Grooved Ware pot with the bones of a pig, an antler, a flint axe laid at a stone's foot).
 */
function litter(el, { bag }) {
  const rand = rng(el.seed || 3), [x, z] = el.c, R = el.r ?? 3, y = el.y ?? 0, n = el.n ?? 30, gy = () => y;
  const spot = (r = R) => { const t = rand() * 6.28, d = Math.sqrt(rand()) * r, px = x + Math.cos(t) * d, pz = z + Math.sin(t) * d; return [px, gy(px, pz), pz]; };
  if (el.kind === 'path') {
    for (let i = 0; i < n; i++) { const p = spot(); bag.add(i % 3 ? 'chalk' : i % 2 ? 'granite_black' : 'granite_rough', pebble(0.025 + rand() * 0.05, p)); }
  } else if (el.kind === 'offering') {
    const p = [x, gy(x, z), z];
    bag.add('terracotta', lathe(groovedWare(0.14, 0.26), 12, null, ...p));
    for (let i = 0; i < 5; i++) { const q = spot(0.5), b = rand() * 6.28; bag.add('linen', stick([q[0], q[1] + 0.02, q[2]], [q[0] + Math.cos(b) * 0.22, q[1] + 0.03, q[2] + Math.sin(b) * 0.22], 0.016, 5)); }
    antlerPick(bag, spot(0.7), rand() * 6.28, rand, p[1] + 0.02);
    bag.add('granite_black', lathe([[0.001, 0], [0.06, 0.01], [0.09, 0.14], [0.001, 0.22]], 5, null, ...spot(0.6)));
  } else {
    for (let i = 0; i < n; i++) { const q = spot(); const r = rand(); if (r < 0.6) bag.add(i % 3 ? 'sandstone_white' : 'granite_rough', flake(0.02 + rand() * 0.05, [q[0], q[1] + 0.01, q[2]], rand)); else bag.add('granite_rough', pebble(0.04 + rand() * 0.06, q)); }
    for (let i = 0; i < 3; i++) { const q = spot(R * 0.8); bag.add('granite_rough', lathe([[0.001, 0], [0.13, 0.03], [0.17, 0.12], [0.1, 0.2], [0.001, 0.22]], 8, null, ...q)); }
    for (let i = 0; i < 2; i++) antlerPick(bag, spot(R * 0.8), rand() * 6.28, rand, gy(x, z) + 0.02);
    { const q = spot(R * 0.5); for (let i = 0; i < 4; i++) bag.add('rope_fibre', lathe([[0.3 - i * 0.015, 0], [0.31 - i * 0.015, 0.045], [0.001, 0.06]], 12, null, q[0], q[1] + i * 0.04, q[2])); }
    { const q = spot(R * 0.7), b = rand() * 6.28; for (let i = 0; i < 3; i++) bag.add('bark_dark', stick([q[0] + i * 0.2, q[1] + 0.12, q[2] + i * 0.12], [q[0] + i * 0.2 + Math.cos(b) * 1.3, q[1] + 0.12, q[2] + i * 0.12 + Math.sin(b) * 1.3], 0.12, 7)); }
  }
}

/**
 * scrub: { c, y, r, h, kind, seed } — 'gorse' (a dense dark-green dome of spines, a few yellow flowers; the down's commonest scrub) or
 * 'hawthorn' (a low thorn-tree, a gnarled trunk bent by the wind, a rounded crown of leaf with the white of the blossom) — overlapping domes of leaf.
 */
function scrub(el, { bag, col }) {
  const rand = rng(el.seed || 17), [x, z] = el.c, y = el.y ?? 0, R = el.r ?? 1.2, H = el.h ?? 1.0;
  if (el.kind === 'hawthorn') {
    const lean = (rand() - 0.5) * 0.5, tr = 0.09 * R;
    bag.add('bark_dark', stick([x, y - 0.1, z], [x + lean * 0.6, y + H * 0.6, z + lean * 0.2], tr, 6));
    for (let i = 0; i < 3; i++) { const t = rand() * 6.28; bag.add('bark_dark', stick([x + lean * 0.4, y + H * 0.4, z], [x + Math.cos(t) * R * 0.6, y + H * 0.95, z + Math.sin(t) * R * 0.6], tr * 0.5, 5)); }
    for (let i = 0; i < 5; i++) { const t = rand() * 6.28, d = rand() * R * 0.5, q = lathe([[0.001, -0.5], [0.8, -0.2], [1, 0.1], [0.7, 0.4], [0.001, 0.5]], 9); q.scale(R * (0.55 + rand() * 0.25), H * 0.35, R * (0.55 + rand() * 0.25)); q.translate(x + Math.cos(t) * d, y + H * 0.8 + rand() * H * 0.15, z + Math.sin(t) * d); bag.add(LEAF_MATS[i % 2], q); }
    for (let i = 0; i < 14; i++) { const t = rand() * 6.28, d = R * (0.4 + rand() * 0.55); bag.add('cloth_white', pebble(0.045, [x + Math.cos(t) * d, y + H * (0.75 + rand() * 0.45), z + Math.sin(t) * d])); }
    col.circle(x, z, tr * 1.5, y, y + H);
  } else {
    for (let i = 0; i < 4; i++) { const t = rand() * 6.28, d = rand() * R * 0.5, q = lathe([[0.001, 0], [1, 0.0], [0.95, 0.35], [0.6, 0.8], [0.001, 1]], 9); q.scale(R * (0.5 + rand() * 0.4), H * (0.7 + rand() * 0.3), R * (0.5 + rand() * 0.4)); q.translate(x + Math.cos(t) * d, y - 0.05, z + Math.sin(t) * d); bag.add('flax_leaf', q); }
    for (let i = 0; i < 16; i++) { const t = rand() * 6.28, d = R * (0.3 + rand() * 0.6), hh = H * (0.5 + rand() * 0.4) * (1 - d / R * 0.5); bag.add('cloth_ochre', pebble(0.04, [x + Math.cos(t) * d, y + hh, z + Math.sin(t) * d])); }
    col.circle(x, z, R * 0.7, y, y + H * 0.8);
  }
}

registerStyle('neolithic', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, standing_stone: standingStone, lintel_ring: lintelRing, lintel, neolithic_house: house, timber_circle: timberCircle, feast_fire: feastFire, midden, aubrey_holes: aubreyHoles, camp_shelter: campShelter, hurdle, yard, craft, litter, scrub },
  objects: {},
});
