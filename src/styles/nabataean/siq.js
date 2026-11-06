// The Siq (docs/settlements/petra.md §10): its walls built as rock over the gorge's edge, so that
// they rise from the floor instead of the ground's coarse slope. The rock is the Umm Ishrin
// sandstone, banded in rose, red, mauve, ochre, yellow and grey, with the white Disi sandstone at
// the top: each bed runs through both walls at the same height (they are the two halves of one
// block rent apart), dipping and swelling a little; the thin soft beds weather back into grooves
// and the hard ones stand out as ledges and little overhangs; vertical joints split the faces;
// the walls lean in toward each other as they rise; the lowest metres, scoured by the floods, are
// smoother. Fallen blocks and their rubble lie at the foot. The water channel cut along the foot
// of the south wall, the terracotta pipe laid on a ledge along the north wall; niches with their
// baetyls; and the panel of the camel and its caravan man.
//
// siq_walls { sides: [{ s (−1 north, +1 south), pts: [[x, z, nx, nz, floor, top], …] }], face,
// channel ('cut' | 'pipe' per side), niches: [[side, i]], camel: [side, i] } — the samples (every
// 2 m) are computed by the plan (pure data); n points from the line toward the wall.

import { fromTriangles, rod, orientOutward } from '../../core/geom.js';
import { orientedBox } from '../../core/build.js';
import { raise } from '../achaemenid/reliefs.js';

const R = 'sandstone_rose';
const SUB = 4;                                                       // mesh columns per 2 m sample (every 0.5 m)
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function hash(i, j, k = 0) { let h = Math.imul(i | 0, 374761393) + Math.imul(j | 0, 668265263) + Math.imul(k | 0, 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vnoise(x, y, k = 0) {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hash(i, j, k), b = hash(i + 1, j, k), c = hash(i, j + 1, k), d = hash(i + 1, j + 1, k);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

const CAMEL = [[-0.5, 0], [-0.44, 0], [-0.42, 0.35], [-0.3, 0.5], [0.15, 0.5], [0.2, 0.35], [0.18, 0], [0.24, 0], [0.27, 0.38], [0.3, 0.55], [0.4, 0.7],
  [0.48, 0.85], [0.6, 0.86], [0.6, 0.92], [0.5, 0.97], [0.45, 0.95], [0.36, 0.78], [0.25, 0.7], [0.1, 0.85], [0.0, 0.9], [-0.15, 0.85], [-0.3, 0.72],
  [-0.45, 0.65], [-0.52, 0.55], [-0.5, 0.4], [-0.48, 0.02]];
const MAN = [[-0.09, 0], [0.1, 0], [0.07, 0.04], [0.07, 0.3], [0.09, 0.5], [0.12, 0.62], [0.1, 0.65], [0.07, 0.72], [0.07, 0.86], [0.08, 0.93], [0.04, 1.0],
  [-0.04, 0.99], [-0.06, 0.9], [-0.07, 0.75], [-0.1, 0.5], [-0.11, 0.3], [-0.07, 0.04]];

// ---- the beds: from below the floor to above the rim, each with its colour, how far it has weathered back, and its swell
const MATS = { rose: 'sandstone_rose', red: 'scoria_red', mauve: 'tuff_red', ochre: 'banco', yellow: 'sandstone_relief', grey: 'rubble', white: 'limestone_carved' };
const BEDS = (() => {
  const rand = rng(1907), out = [];
  for (let y = -7; y < 74;) {
    const disi = y > 44, thin = rand() < 0.55, th = thin ? 0.15 + rand() * 0.5 : 0.8 + rand() * (disi ? 4 : 2.6);
    let m;
    if (disi) { const r = rand(); m = r < 0.55 ? 'white' : r < 0.8 ? 'yellow' : 'rose'; }
    else { const r = rand(); m = r < 0.46 ? 'rose' : r < 0.64 ? 'red' : r < 0.82 ? 'mauve' : r < 0.92 ? 'ochre' : r < 0.97 ? 'yellow' : 'grey'; }
    out.push({ y0: y, th, mat: MATS[m], rec: thin ? 0.2 + rand() * 0.55 : rand() * 0.3, amp: 0.15 + rand() * (thin ? 0.45 : 1.1), ph: rand() * 6.28 });
    y += th;
  }
  return out;
})();
/** The bed boundaries over a point of the line (the same on both walls): clamped to the column [floor − 1, top], never crossing. */
function bounds(x, z, floor, top, lo = floor - 1) {
  const ys = [];
  for (let k = 0; k <= BEDS.length; k++) {
    const b = BEDS[Math.min(k, BEDS.length - 1)], y0 = k < BEDS.length ? b.y0 : b.y0 + b.th;
    let y = y0 + 0.012 * (x - 230) + b.amp * (Math.sin(x / 21 + b.ph) + 0.3 * Math.sin(x / 6.1 + b.ph * 3)) + 0.4 * Math.sin((x + z * 0.7) / 13 + b.ph * 2) + 1.3 * (vnoise(x / 8 + z / 11, k * 0.37, 3) - 0.5);
    y = Math.max(lo, Math.min(top, y));
    ys.push(k ? Math.max(ys[k - 1], y) : lo);
  }
  ys[BEDS.length] = top;
  return ys;
}
const bedAt = (ys, y) => { let k = 0; while (k < BEDS.length - 1 && ys[k + 1] <= y) k++; return k; };

// ---- each wall's own: its joints (where along it, how deep, how wide), its lean
const SIDE = {};
function setSide(key, s, pts, keep, seed) {
  const rand = rng((s > 0 ? 77 : 31) + seed * 1013), L = (pts.length - 1) * 2, cracks = [];
  for (let t = 4 + rand() * 6; t < L - 3; t += 5 + rand() * 13) {
    if (keep.some((k) => Math.abs(k - t) < 4.5)) continue;
    cracks.push({ t, depth: 0.5 + rand() * 1.1, w: 0.4 + rand() * 0.5, ph: rand() * 6.28, from: rand() * 6 });
  }
  SIDE[key] = { s, pts, cracks, keepT: keep };
}
/** A sample of the line at fractional index i: [x, z, nx, nz, floor, top]. */
function sample(pts, i) {
  const n = pts.length, i0 = Math.max(0, Math.min(n - 1, Math.floor(i))), i1 = Math.min(n - 1, i0 + 1), f = Math.max(0, Math.min(1, i - i0)), a = pts[i0], b = pts[i1];
  const p = a.map((v, k) => v + (b[k] - v) * f), l = Math.hypot(p[2], p[3]);
  p[2] /= l; p[3] /= l;
  return p;
}
/** The face's distance from the line at t metres along it (the bed k given, or found), height y absolute. */
function faceAt(face, key, t, p, ys, y, k) {
  const yy = y - p[4], { cracks, s } = SIDE[key];
  let d = face + 0.55 * Math.sin(t / 9.3 + s * 1.7) + 0.3 * Math.sin(t / 3.1 + yy / 7 + s) + 0.22 * Math.sin(yy / 4.3 + t / 13 + s * 2.3);
  const f = smooth(0.9, 2.6, yy);                                           // the scoured foot stays smooth
  if (f > 0) {
    let c = 0;
    for (const q of cracks) { const e = Math.abs(t - (q.t + 0.9 * Math.sin(yy / 5.3 + q.ph))) / q.w; if (e < 1) c = Math.max(c, q.depth * (1 - e) ** 1.5 * smooth(q.from, q.from + 3, yy)); }
    const fine = 0.55 * (vnoise(t / 1.7, y / 1.3, s + 5) - 0.5) + 0.22 * (vnoise(t / 0.6, y / 0.6, s + 9) - 0.5) + 1.1 * (vnoise(t / 7, y / 5, s + 2) - 0.5);
    d += f * (BEDS[k ?? bedAt(ys, y)].rec + c + fine);
  }
  // the walls lean in as they rise, more at some bends than others
  const lean = 0.8 + 2.6 * (0.5 + 0.5 * Math.sin(t / 29 + s * 2.1));
  return d - lean * smooth(6, 52, yy);
}
/** The face's distance at sample index i (2 m apart), height yy above the floor (for the channel, the niches, the panel, the walker). */
function faceD(face, i, yy, key) {
  const p = sample(SIDE[key].pts, i), ys = bounds(p[0], p[1], p[4], p[5], p[6]);
  return faceAt(face, key, i * 2, p, ys, p[4] + yy);
}

/** A rough block: a twice-split octahedron, its corners pushed in and out, half-extents (a, b, c), turned by yaw, its underside flattened. */
function block(x, y, z, a, b, c, yaw, seed) {
  const V = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  let F = [[0, 2, 4], [4, 2, 1], [1, 2, 5], [5, 2, 0], [0, 4, 3], [4, 1, 3], [1, 5, 3], [5, 0, 3]].map((f) => f.map((i) => V[i]));
  const mid = (p, q) => { const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2], l = Math.hypot(...m); return m.map((v) => v / l); };
  for (let r = 0; r < 2; r++) F = F.flatMap(([p, q, w]) => { const pq = mid(p, q), qw = mid(q, w), wp = mid(w, p); return [[p, pq, wp], [pq, q, qw], [wp, qw, w], [pq, qw, wp]]; });
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const P = (v) => {
    const k = 0.78 + 0.4 * hash(Math.round(v[0] * 50), Math.round(v[1] * 50), Math.round(v[2] * 50) + seed);
    // squared off toward a block: the unit sphere pushed toward the cube
    const m = Math.max(Math.abs(v[0]), Math.abs(v[1]), Math.abs(v[2])), sq = 0.55 + 0.45 / m;
    const lx = v[0] * a * k * sq, ly = Math.max(-0.3, v[1]) * b * k * sq, lz = v[2] * c * k * sq;
    return [x + lx * cy + lz * sy, y + ly, z - lx * sy + lz * cy];
  };
  return fromTriangles(orientOutward(F.flatMap((f) => f.flatMap(P))));
}

export function siqWalls(el, { bag, col }) {
  const face = el.face ?? 6.2;
  for (const [si, side] of el.sides.entries()) {
    const keep = [...(el.niches || []).filter(([q]) => q === si).map(([, i]) => i * 2), ...(el.camel && el.camel[0] === si ? [el.camel[1] * 2] : [])];
    setSide(si, side.s, side.pts, keep, el.seed ?? 0);
  }
  for (const [si, { s, pts, channel }] of el.sides.entries()) {
    const n = pts.length, at = (i, d, yy) => { const p = sample(pts, i); return [p[0] + p[2] * d, p[4] + yy, p[1] + p[3] * d]; };
    // the face: per column (every 0.5 m), rows bed by bed, a narrow step at each bed's foot (a ledge or an overhang)
    const cols = [];
    for (let c = 0; c <= (n - 1) * SUB; c++) {
      const i = c / SUB, p = sample(pts, i), ys = bounds(p[0], p[1], p[4], p[5], p[6]), rows = [];
      // the beds pinched out below the column's foot or above its crest take the face of the nearest bed that is there
      let kLo = 0, kHi = BEDS.length - 1;
      while (kLo < kHi && ys[kLo + 1] - ys[kLo] < 1e-6) kLo++;
      while (kHi > kLo && ys[kHi + 1] - ys[kHi] < 1e-6) kHi--;
      for (let k = 0; k < BEDS.length; k++) {
        const yA = ys[k], yB = ys[k + 1], g = Math.min(0.12, (yB - yA) * 0.3), m = Math.max(1, Math.round(BEDS[k].th / (BEDS[k].y0 > 28 ? 2.4 : 1.3)));
        for (let j = 0; j <= m; j++) {
          const y = k === 0 && j === 0 ? yA : yA + g + (yB - yA - g) * j / m, d = faceAt(face, si, i * 2, p, ys, y, Math.min(kHi, Math.max(kLo, k)));
          rows.push({ k, v: [p[0] + p[2] * d, y, p[1] + p[3] * d] });
        }
      }
      cols.push(rows);
    }
    const T = {}, push = (mat, a, b, c) => {
      const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      if (Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) < 1e-5) return;      // a bed pinched out
      (T[mat] ||= []).push(...a, ...b, ...c);
    };
    const quad = (mat, a, b, c, d) => { push(mat, a, b, c); push(mat, a, c, d); };
    const nr = cols[0].length;
    for (let c = 0; c + 1 < cols.length; c++) for (let j = 0; j + 1 < nr; j++) {
      const r0 = cols[c][j], r1 = cols[c][j + 1], k0 = r0.k, k1 = r1.k;
      const mat = BEDS[k0 === k1 ? k1 : BEDS[k0].rec < BEDS[k1].rec ? k0 : k1].mat;
      const a = r0.v, b = cols[c + 1][j].v, cc = cols[c + 1][j + 1].v, d = r1.v;
      // wound so that the face looks back at the line (toward −n)
      if (s > 0) quad(mat, a, d, cc, b); else quad(mat, a, b, cc, d);
    }
    // where the face rises from above the floor (over a tomb): its underside, back into the rock
    const raised = (p) => p[6] !== undefined && p[6] > p[4] + 0.5;
    for (let c = 0; c + 1 < cols.length; c++) {
      const i = c / SUB, i2 = (c + 1) / SUB, pa = sample(pts, i), pb = sample(pts, i2);
      if (!raised(pa) && !raised(pb)) continue;
      const a = cols[c][0].v, b = cols[c + 1][0].v, a2 = at(i, face + 9, a[1] - pa[4]), b2 = at(i2, face + 9, b[1] - pb[4]);
      for (const t of [[a, b, b2], [a, b2, a2]]) { const n = (t[1][2] - t[0][2]) * (t[2][0] - t[0][0]) - (t[1][0] - t[0][0]) * (t[2][2] - t[0][2]); if (n < 0) push(R, t[0], t[1], t[2]); else push(R, t[0], t[2], t[1]); }
    }
    // the top: from the face's crest back over the edge, sinking into the plateau
    for (let c = 0; c + 1 < cols.length; c++) {
      const i = c / SUB, i2 = (c + 1) / SUB, a = cols[c][nr - 1].v, b = cols[c + 1][nr - 1].v;
      const pa = sample(pts, i), pb = sample(pts, i2), a2 = at(i, face + 9, pa[5] - pa[4] - 2.5), b2 = at(i2, face + 9, pb[5] - pb[4] - 2.5);
      if (s > 0) quad(R, a, b, b2, a2); else quad(R, a, a2, b2, b);
    }
    // the ends closed (face to the buried back edge)
    for (const [c, sg] of [[0, 1], [cols.length - 1, -1]]) {
      const i = c / SUB, p = sample(pts, i), back = (yy) => at(i, face + 9, yy), top = p[5] - p[4];
      const P = [...cols[c].map((r) => r.v), back(top - 2.5), back(cols[c][0].v[1] - p[4])];
      const ctr = P.reduce((q, v) => [q[0] + v[0] / P.length, q[1] + v[1] / P.length, q[2] + v[2] / P.length], [0, 0, 0]);
      for (let k = 0; k < P.length; k++) { const v = P[k], q = P[(k + 1) % P.length]; if ((s > 0) === (sg > 0)) push(R, ctr, q, v); else push(R, ctr, v, q); }
    }
    for (const [mat, t] of Object.entries(T)) bag.add(mat, fromTriangles(t));
    // the walker stops at the face's foremost point near the floor
    for (let i = 0; i + 1 < n; i++) {
      if (pts[i][6] > pts[i][4] + 0.5 || pts[i + 1][6] > pts[i + 1][4] + 0.5) continue;
      let dmin = Infinity;
      for (let q = 0; q <= SUB; q++) for (const yy of [0, 0.6, 1.6, 2.5]) dmin = Math.min(dmin, faceD(face, i + q / SUB, yy, si));
      const mid = (dmin + face + 2.5) / 2, a = at(i, mid, 0), b = at(i + 1, mid, 0);
      col.segment([a[0], a[2]], [b[0], b[2]], face + 2.5 - dmin, Math.min(pts[i][4], pts[i + 1][4]) - 1, Math.max(pts[i][5], pts[i + 1][5]));
    }
    // the channel or pipe runs on from the Siq along the walls it is joined to, as far as the first one raised over a monument
    if (channel) { let m = pts.findIndex((p) => p[6] > p[4] + 0.5); if (m < 0) m = n; if (m >= 4) waterworks(bag, pts.slice(0, m), s, face, channel, at, si); }
    if (el.blocks !== false) fallen(bag, col, pts, s, face, channel, at, si, el.clear);
  }
  for (const [si, i] of el.niches || []) niche(bag, el.sides[si], face, i, si);
  if (el.camel) camelPanel(bag, el.sides[el.camel[0]], face, el.camel[1], el.camel[0]);
}

/**
 * Fallen blocks at the foot of a wall, in front of its kerb or ledge, each with a scatter of the
 * rubble it broke into; none near the niches and the panel, none at the Siq's mouth (the first
 * view of the Khazneh), and the middle of the way left clear.
 */
function fallen(bag, col, pts, s, face, kind, at, si, clear) {
  const rand = rng((s > 0 ? 4411 : 9127) + si * 31), L = (pts.length - 1) * 2;
  const bedMat = () => { const r = rand(); return r < 0.55 ? R : r < 0.7 ? 'scoria_red' : r < 0.85 ? 'tuff_red' : 'banco'; };
  for (let t = 6 + rand() * 6; t < L - 6; t += 6 + rand() * 12) {
    const i = t / 2, p = sample(pts, i);
    if (p[6] > p[4] + 0.5 || (clear || []).some((r) => p[0] > r[0] && p[0] < r[2] && p[1] > r[1] && p[1] < r[3]) || p[5] - p[4] < 12 || SIDE[si].keepT.some((k) => Math.abs(k - t) < 4)) continue;
    const r = 0.45 + rand() * 0.85, ha = r * (0.85 + rand() * 0.45), hb = r * (0.45 + rand() * 0.35), hc = r * (0.7 + rand() * 0.4);
    const front = faceD(face, i, 1.0, si) - (kind === 'cut' ? 0.55 : kind ? 0.5 : 0.1), dd = front - Math.max(ha, hc) * 0.85;
    const [x, y, z] = at(i, dd, 0), mat = bedMat();
    bag.add(mat, block(x, y - hb * 0.15, z, ha, hb, hc, rand() * 6.28, Math.floor(rand() * 1e4)));
    if (r > 0.55) col.circle(x, z, Math.max(ha, hc) * 0.85, y - 0.2, y + hb * 1.6);
    for (let q = 0, m = 3 + Math.floor(rand() * 5); q < m; q++) {
      const a = rand() * 6.28, rr = Math.max(ha, hc) * (1.1 + rand() * 0.9), sx = x + Math.cos(a) * rr, sz = z + Math.sin(a) * rr;
      // only on the way's side of the kerb
      const off = (sx - p[0]) * p[2] + (sz - p[1]) * p[3];
      if (off > front - 0.15) continue;
      const g = 0.07 + rand() * 0.2;
      bag.add(rand() < 0.7 ? mat : bedMat(), block(sx, y - g * 0.2, sz, g * (1 + rand() * 0.6), g * (0.5 + rand() * 0.4), g, rand() * 6.28, Math.floor(rand() * 1e4)));
    }
  }
}

/**
 * The water along the foot of a wall: 'cut' — a kerb of rock with the channel along its top,
 * its outer lip, the water in it; 'pipe' — a ledge with the terracotta pipe laid on it, a collar
 * at each joint.
 */
function waterworks(bag, pts, s, face, kind, at, si) {
  const n = pts.length, d0 = (i) => faceD(face, i, 1.0, si);
  const ribbon = (mat, dA, dB, yA, yB, faces) => {
    // a solid strip along the wall from d = dA(i) to dB(i), from yA to yB above the floor: its front, top and (if asked) back
    const T = [], q = (a, b, c, d) => T.push(...a, ...b, ...c, ...a, ...c, ...d);
    for (let i = 0; i + 1 < n; i++) {
      const fa = at(i, dA(i), yA), fb = at(i + 1, dA(i + 1), yA), ta = at(i, dA(i), yB), tb = at(i + 1, dA(i + 1), yB);
      const ba = at(i, dB(i), yB), bb = at(i + 1, dB(i + 1), yB), la = at(i, dB(i), yA), lb = at(i + 1, dB(i + 1), yA);
      if (s > 0) { q(fa, ta, tb, fb); q(ta, ba, bb, tb); if (faces.back) q(la, lb, bb, ba); }
      else { q(fa, fb, tb, ta); q(ta, tb, bb, ba); if (faces.back) q(la, ba, bb, lb); }
    }
    for (const [i, sg] of [[0, 1], [n - 1, -1]]) {
      const a = at(i, dA(i), yA), b = at(i, dB(i), yA), c = at(i, dB(i), yB), d = at(i, dA(i), yB);
      if ((s > 0) === (sg > 0)) q(a, b, c, d); else q(a, d, c, b);
    }
    bag.add(mat, fromTriangles(T));
  };
  if (kind === 'cut') {
    ribbon(R, (i) => d0(i) - 0.55, (i) => d0(i) + 1.2, -0.2, 0.92, {});
    ribbon(R, (i) => d0(i) - 0.55, (i) => d0(i) - 0.4, 0.92, 1.18, { back: true });
    ribbon('water', (i) => d0(i) - 0.4, (i) => d0(i) + 0.3, 1.04, 1.04 + 0.001, {});
  } else {
    ribbon(R, (i) => d0(i) - 0.5, (i) => d0(i) + 1.2, -0.2, 0.5, {});
    for (let i = 0; i + 1 < n; i++) {
      const a = at(i, d0(i) - 0.22, 0.63), b = at(i + 1, d0(i + 1) - 0.22, 0.63);
      bag.add('terracotta', rod(a, b, 0.13, 10));
      const L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), e = [(b[0] - a[0]) / L, (b[1] - a[1]) / L, (b[2] - a[2]) / L];
      bag.add('terracotta', rod([a[0] - e[0] * 0.07, a[1] - e[1] * 0.07, a[2] - e[2] * 0.07], [a[0] + e[0] * 0.07, a[1] + e[1] * 0.07, a[2] + e[2] * 0.07], 0.165, 10));
    }
  }
}

/** A niche cut for a baetyl: a framed panel of dressed rock on the face, the plain block of the god standing on its ledge. */
function niche(bag, side, face, i, si) {
  const { s, pts } = side, [x, z, nx, nz, f] = pts[i], tx = nz * s, tz = -nx * s;
  const dIn = Math.max(...[1.6, 2.4, 3.2, 4].map((yy) => faceD(face, i, yy, si))) + 0.4, dOut = Math.min(...[1.6, 2.4, 3.2, 4].map((yy) => faceD(face, i, yy, si))) - 0.15;
  const P = (u, d) => [x + tx * u + nx * d, z + tz * u + nz * d], y = f + 1.7;
  const slab = (mat, u0, u1, dA, dB, y0, y1) => { const a = P((u0 + u1) / 2, dA), b = P((u0 + u1) / 2, dB); bag.add(mat, orientedBox(a, b, Math.abs(u1 - u0), y0, y1)); };
  slab(R, -0.95, 0.95, dOut + 0.05, dIn, y, y + 2.1);            // the dressed back panel
  slab(R, -1.15, -0.85, dOut - 0.18, dIn, y - 0.1, y + 2.1);     // the pilasters
  slab(R, 0.85, 1.15, dOut - 0.18, dIn, y - 0.1, y + 2.1);
  slab(R, -1.25, 1.25, dOut - 0.25, dIn, y + 2.1, y + 2.4);      // the lintel and its two crow-steps
  slab(R, -0.8, 0.8, dOut - 0.2, dIn, y + 2.4, y + 2.6);
  slab(R, -0.4, 0.4, dOut - 0.15, dIn, y + 2.6, y + 2.8);
  slab(R, -0.85, 0.85, dOut - 0.3, dIn, y - 0.1, y + 0.12);      // the ledge
  slab(R, -0.22, 0.22, dOut - 0.12, dOut + 0.1, y + 0.12, y + 1.0);   // the baetyl
}

/** The panel of the camel and the man leading it, cut in a dressed field of the south wall over the channel. */
function camelPanel(bag, side, face, i, si) {
  const { s, pts } = side, [x, z, nx, nz, f] = pts[i], tx = nz * s, tz = -nx * s;
  const ys = [1.6, 2.4, 3.2, 4.0, 4.6];
  const dIn = Math.max(...ys.flatMap((yy) => [-2, 0, 2].map((k) => faceD(face, i + k, yy, si)))) + 0.4;
  const dOut = Math.min(...ys.flatMap((yy) => [-2, 0, 2].map((k) => faceD(face, i + k, yy, si)))) - 0.12;
  const P = (u, d) => [x + tx * u + nx * d, z + tz * u + nz * d];
  { const a = P(0, dOut), b = P(0, dIn); bag.add(R, orientedBox(a, b, 4.6, f + 1.45, f + 4.7)); }
  // the relief faces back toward the line (−n), u along the wall
  const place = (u, v, w) => { const p = P(u, dOut - w); return [p[0], f + 1.6 + v, p[1]]; };
  raise(bag, R, CAMEL, 'siq-camel', place, 0.3, 0, 2.7, -s, 0.12, [[0.1, 0.85, -0.15, 0.6], [-0.3, 0.5, -0.3, 0.7]]);
  raise(bag, R, MAN, 'siq-man', place, -1.3, 0, 1.9, -s, 0.14, [[-0.08, 0.5, 0.08, 0.5]]);
}
