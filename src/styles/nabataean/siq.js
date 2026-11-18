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
import { Sculpt, tube, add, sub, mul, norm } from './sculpt.js';
import * as FG from './figures.js';

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

// ---- the beds: from below the floor to above the rim, each with its colour, how far it has weathered back, and its swell
const MATS = { rose: 'sandstone_rose', red: 'scoria_red', mauve: 'tuff_red', ochre: 'banco', yellow: 'sandstone_yellow', grey: 'rubble', white: 'sandstone_white' };
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
    // the walker stops at the face as it is drawn: a piece for every metre of the wall, its front the foremost point of the
    // face over that metre at the height of the body, its back deep in the rock (the drawn rock is a skin over the ground,
    // whose slope rises a few metres behind it: nothing of the hollow between may be walked)
    const PIECE = SUB / 2;
    for (let i = 0; i + 1 < n; i++) {
      if (pts[i][6] > pts[i][4] + 0.5 || pts[i + 1][6] > pts[i + 1][4] + 0.5) continue;
      for (let h = 0; h < 2; h++) {
        const ia = i + h / 2, ib = i + (h + 1) / 2;
        let dmin = Infinity;
        for (let q = 0; q <= PIECE; q++) for (const yy of [0, 0.4, 0.8, 1.2, 1.6, 2.0, 2.4]) dmin = Math.min(dmin, faceD(face, ia + (ib - ia) * q / PIECE, yy, si));
        const back = Math.max(dmin + 0.6, sample(pts, (ia + ib) / 2)[7] ?? face + 12), A = at(ia, dmin, 0), B = at(ib, dmin, 0), C = at(ib, back, 0), D = at(ia, back, 0);
        col.obstacles.push({ poly: [[A[0], A[2]], [B[0], B[2]], [C[0], C[2]], [D[0], D[2]]], y0: Math.min(pts[i][4], pts[i + 1][4]) - 1, y1: Math.max(pts[i][5], pts[i + 1][5]) });
      }
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
  // the cross-sections run along the wall: modelled, not boxed (docs §22): [offset from the face line, height above the floor]
  const run = (mat, prof, mod = 0) => {
    const rows = [];
    for (let i = 0; i < n; i++) rows.push(prof.map(([pd, yy]) => at(i, d0(i) + pd, yy + mod * 0.03 * Math.sin(i * 1.7 + pd * 5))));
    const S = new Sculpt(); S.grid(rows, { wrap: false, face: [0, 1, 0] }); bag.add(mat, S.geometry());
  };
  if (kind === 'cut') {
    // the channel cut along the foot of the wall: the kerb's battered front and rounded lip, the trough sunk behind it with its sloping sides, a bank up to the wall, the water in it
    run(R, [[-0.6, -0.25], [-0.57, 0.3], [-0.54, 0.85], [-0.5, 1.02], [-0.44, 1.14], [-0.35, 1.19], [-0.28, 1.14], [-0.24, 1.0], [-0.18, 0.9], [0.0, 0.86], [0.25, 0.88], [0.36, 1.0], [0.45, 1.3], [1.2, 1.3], [1.25, -0.25]], 1);
    const T = [], q = (a, b, c, d) => T.push(...a, ...b, ...c, ...a, ...c, ...d);
    for (let i = 0; i + 1 < n; i++) { const a = at(i, d0(i) - 0.26, 1.0), b = at(i + 1, d0(i + 1) - 0.26, 1.0), c = at(i + 1, d0(i + 1) + 0.37, 1.0), d = at(i, d0(i) + 0.37, 1.0); if (s > 0) q(a, d, c, b); else q(a, b, c, d); }
    bag.add('water', fromTriangles(T));
    // flat cover stones across the channel every 9 m, so that the way can be crossed
    for (let i = 4; i + 1 < n; i += 5) { const a = at(i, d0(i) - 0.6, 1.2), b = at(i, d0(i) + 0.5, 1.2), S = new Sculpt(); void S; bag.add(R, orientedBox([a[0], a[2]], [b[0], b[2]], 0.9, 1.12, 1.3)); }
  } else {
    // the ledge with the rock-cut groove the pipe lies in, then the pipe: sections of fired clay each with its socket and a collar of lime mortar at the joint
    run(R, [[-0.55, -0.25], [-0.52, 0.3], [-0.5, 0.5], [-0.45, 0.56], [-0.4, 0.58], [-0.36, 0.52], [-0.22, 0.46], [-0.08, 0.52], [-0.04, 0.58], [0.2, 0.6], [1.2, 0.6], [1.25, -0.25]], 1);
    const P = new Sculpt(), M = new Sculpt(), sec = 2;
    for (let i = 0; i + 1 < n; i++) for (let k = 0; k < sec; k++) {
      const t0 = (i + k / sec), t1 = (i + (k + 1) / sec), f = (t) => { const j = Math.min(n - 2, Math.floor(t)), u = t - j; return at(j, d0(j) + (d0(j + 1) - d0(j)) * u - 0.22, 0.63 + 0.004 * Math.sin(t * 3.1)); };
      const a = f(t0), b = f(t1), e = norm(sub(b, a)), L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
      tube(P, [[...a, 0.112 * (1 + 0.02 * Math.sin(i * 2.3 + k))], [...add(a, mul(e, L * 0.8)), 0.112], [...add(b, mul(e, 0.02)), 0.14]], { seg: 6, sub: 1, cap: [0, 0] });
      tube(M, [[...add(b, mul(e, -0.05)), 0.15], [...add(b, mul(e, 0.05)), 0.15]], { seg: 6, sub: 1, cap: [0, 0] });
    }
    bag.add('terracotta', P.geometry()); bag.add('banco', M.geometry());
  }
}

/**
 * A niche for a baetyl (docs/settlements/petra.md §22): a dressed aedicule standing out of the face, its two pilasters with the
 * horned Nabataean capitals, the architrave and cornice, the little pediment with its raking cornices and acroteria over a
 * recess, and in the recess the god's stone, a tapering betyl on its two steps. Built as one piece in the rock's own stone.
 */
function niche(bag, side, face, i, si) {
  const { s, pts } = side, [x, z, nx, nz, f] = pts[i], tx = nz * s, tz = -nx * s;
  const ds = [1.6, 2.4, 3.2, 4, 4.8].flatMap((yy) => [-1, 0, 1].map((k) => faceD(face, i + k, yy, si)));
  const dIn = Math.max(...ds) + 0.4, dOut = Math.min(...ds) - 0.1, wb = -(dIn - dOut) - 0.1, y0 = f + 1.7;
  // the niche's frame: x to the viewer's right (standing in the Siq, facing the wall), y up, w out of the wall toward the way
  const S = new Sculpt(([a, b, w]) => { const u = -a * s, d = dOut - w; return [x + tx * u + nx * d, y0 + b, z + tz * u + nz * d]; });
  S.box(-1.3, -0.15, wb, 1.3, 0.1, 0.55);                                           // the plinth
  S.box(-0.86, 0.1, wb, 0.86, 2.35, 0.14);                                           // the recess's back
  for (const q of [-1, 1]) {
    S.box(Math.min(q * 0.86, q * 1.2), 0.1, wb, Math.max(q * 0.86, q * 1.2), 2.2, 0.48);   // a pilaster
    S.box(Math.min(q * 0.8, q * 1.28), 2.2, wb, Math.max(q * 0.8, q * 1.28), 2.38, 0.56);  // its capital's block
    S.box(Math.min(q * 0.98, q * 1.3), 2.38, wb, Math.max(q * 0.98, q * 1.3), 2.5, 0.52);  // the horn on the corner
    S.box(Math.min(q * 0.9, q * 1.24), 0.1, wb, Math.max(q * 0.9, q * 1.24), 0.3, 0.55);   // its base
  }
  S.box(-1.32, 2.5, wb, 1.32, 2.7, 0.58);                                            // the architrave
  S.box(-1.42, 2.7, wb, 1.42, 2.84, 0.7);                                            // the cornice
  S.prism([[-1.3, 2.84], [1.3, 2.84], [0, 3.38]], wb, 0.44);                         // the tympanum
  for (const q of [-1, 1]) S.prism([[q * 1.5, 2.8], [0, 3.46], [0, 3.3], [q * 1.5, 2.66]], wb, 0.7);   // the raking cornices
  for (const q of [-1, 1]) S.prism([[q * 1.45, 2.84], [q * 1.2, 2.84], [q * 1.3, 3.04]], wb, 0.6);
  S.prism([[-0.14, 3.42], [0.14, 3.42], [0, 3.7]], wb, 0.58);                        // the acroterion
  S.box(-0.62, 0.1, 0.0, 0.62, 0.24, 0.42); S.box(-0.46, 0.24, 0.04, 0.46, 0.38, 0.36);   // the two steps of the god's base
  { const H = 1.2 + 0.1 * hash(Math.round(x), Math.round(z)); S.xf = ([a, b, w]) => { const u = -a * H * s, d = dOut - (0.2 + w * H); return [x + tx * u + nx * d, y0 + 0.38 + b * H, z + tz * u + nz * d]; }; FG.betyl(S, 0); }
  bag.add(R, S.geometry());
}

/**
 * The relief of the caravan, cut on a dressed field of the south wall over the channel (docs §22): in its frame of mouldings,
 * a man in his tunic and mantle striding to the right and leading a dromedary with its pack saddle by a rope, modelled as low
 * relief standing 12–25 cm from the field.
 */
function camelPanel(bag, side, face, i, si) {
  const { s, pts } = side, [x, z, nx, nz, f] = pts[i], tx = nz * s, tz = -nx * s;
  const ys = [1.6, 2.4, 3.2, 4.0, 4.6];
  const ds = ys.flatMap((yy) => [-2, 0, 2].map((k) => faceD(face, i + k, yy, si)));
  const dIn = Math.max(...ds) + 0.4, dOut = Math.min(...ds) - 0.12, wb = -(dIn - dOut) - 0.1, y0 = f + 1.45;
  const W = ([a, b, w]) => { const u = -a * s, d = dOut - w; return [x + tx * u + nx * d, y0 + b, z + tz * u + nz * d]; };
  const S = new Sculpt(W);
  S.box(-2.4, 0, wb, 2.4, 0.2, 0.16); S.box(-2.4, 3.06, wb, 2.4, 3.26, 0.16);               // the frame's sill and head
  S.box(-2.4, 0.2, wb, -2.2, 3.06, 0.16); S.box(2.2, 0.2, wb, 2.4, 3.06, 0.16);              // its sides
  S.box(-2.2, 0.2, wb, 2.2, 3.06, 0.05);                                                       // the field
  const put = (fn, px, py, H, flat, shift) => { S.flat = flat; S.shift = shift; S.clip = true; S.xf = ([a, b, w]) => W([px + a * H, py + b * H, 0.05 + w * H]); fn(S, 0); };
  put(FG.camel, 0.7, 0.55, 2.5, 0.42, 0.11);
  put(FG.driver, -1.45, 0.45, 1.95, 0.45, 0.07);
  bag.add(R, S.geometry());
}
