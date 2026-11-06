// The Siq (docs/settlements/petra.md §10): its walls built as rock over the gorge's edge, so that
// they rise sheer and uneven from the floor instead of the ground's coarse slope; the water
// channel cut along the foot of the south wall, the terracotta pipe laid on a ledge along the
// north wall; niches with their baetyls; and the panel of the camel and its caravan man.
//
// siq_walls { sides: [{ s (−1 north, +1 south), pts: [[x, z, nx, nz, floor, top], …] }], face,
// channel ('cut' | 'pipe' per side), niches: [[side, i]], camel: [side, i] } — the samples are
// computed by the plan (pure data); n points from the line toward the wall.

import { fromTriangles, rod } from '../../core/geom.js';
import { orientedBox } from '../../core/build.js';
import { raise } from '../achaemenid/reliefs.js';

const R = 'sandstone_rose';
const ROWS = [-1, 0.6, 1.6, 3.2, 6, 10, 16, 24, 34, 46, 1e9];
/** The face's distance from the line at sample i, height above the floor yy (a few overlapping waves; the same for the channel and the mesh). */
function faceD(face, i, yy, side) {
  const t = i * 2;
  return face + 0.55 * Math.sin(t / 9.3 + side * 1.7) + 0.3 * Math.sin(t / 3.1 + yy / 7 + side) + 0.22 * Math.sin(yy / 4.3 + t / 13 + side * 2.3) + 0.12 * Math.sin(t * 1.3 + yy * 0.9);
}
const CAMEL = [[-0.5, 0], [-0.44, 0], [-0.42, 0.35], [-0.3, 0.5], [0.15, 0.5], [0.2, 0.35], [0.18, 0], [0.24, 0], [0.27, 0.38], [0.3, 0.55], [0.4, 0.7],
  [0.48, 0.85], [0.6, 0.86], [0.6, 0.92], [0.5, 0.97], [0.45, 0.95], [0.36, 0.78], [0.25, 0.7], [0.1, 0.85], [0.0, 0.9], [-0.15, 0.85], [-0.3, 0.72],
  [-0.45, 0.65], [-0.52, 0.55], [-0.5, 0.4], [-0.48, 0.02]];
const MAN = [[-0.09, 0], [0.1, 0], [0.07, 0.04], [0.07, 0.3], [0.09, 0.5], [0.12, 0.62], [0.1, 0.65], [0.07, 0.72], [0.07, 0.86], [0.08, 0.93], [0.04, 1.0],
  [-0.04, 0.99], [-0.06, 0.9], [-0.07, 0.75], [-0.1, 0.5], [-0.11, 0.3], [-0.07, 0.04]];

export function siqWalls(el, { bag, col }) {
  const face = el.face ?? 6.2;
  for (const { s, pts, channel } of el.sides) {
    const n = pts.length;
    const at = (i, d, yy) => { const [x, z, nx, nz, f] = pts[i]; return [x + nx * d, f + yy, z + nz * d]; };
    // the face: rows from below the floor to the top, each point pushed in and out
    const grid = pts.map((p, i) => ROWS.map((yy) => { const top = p[5] - p[4], h = Math.min(yy, top); return at(i, faceD(face, i, h, s), h); }));
    const T = [], quad = (a, b, c, d) => { T.push(...a, ...b, ...c, ...a, ...c, ...d); };
    // wound so that the face looks back at the line (toward −n)
    for (let i = 0; i + 1 < n; i++) for (let j = 0; j + 1 < ROWS.length; j++) {
      const a = grid[i][j], b = grid[i + 1][j], c = grid[i + 1][j + 1], d = grid[i][j + 1];
      if (s > 0) quad(a, d, c, b); else quad(a, b, c, d);
    }
    // the top: from the face's crest back over the edge, sinking into the plateau
    for (let i = 0; i + 1 < n; i++) {
      const a = grid[i][ROWS.length - 1], b = grid[i + 1][ROWS.length - 1];
      const a2 = at(i, face + 9, pts[i][5] - pts[i][4] - 2.5), b2 = at(i + 1, face + 9, pts[i + 1][5] - pts[i + 1][4] - 2.5);
      if (s > 0) quad(a, b, b2, a2); else quad(a, a2, b2, b);
    }
    // the ends closed (face to the buried back edge)
    for (const [i, sg] of [[0, 1], [n - 1, -1]]) {
      const back = (yy) => at(i, face + 9, yy), top = pts[i][5] - pts[i][4];
      const P = [...grid[i].map((p) => p), back(top - 2.5), back(-1)];
      const c = P.reduce((q, p) => [q[0] + p[0] / P.length, q[1] + p[1] / P.length, q[2] + p[2] / P.length], [0, 0, 0]);
      for (let k = 0; k < P.length; k++) { const p = P[k], q = P[(k + 1) % P.length]; if ((s > 0) === (sg > 0)) T.push(...c, ...q, ...p); else T.push(...c, ...p, ...q); }
    }
    bag.add(R, fromTriangles(T));
    // the walker stops at the face's foremost point near the floor
    for (let i = 0; i + 1 < n; i++) {
      const dmin = Math.min(...[0, 1, 2, 3].map((j) => Math.min(faceD(face, i, ROWS[j], s), faceD(face, i + 1, ROWS[j], s)))), mid = (dmin + face + 2.5) / 2;
      const a = at(i, mid, 0), b = at(i + 1, mid, 0);
      col.segment([a[0], a[2]], [b[0], b[2]], face + 2.5 - dmin, Math.min(pts[i][4], pts[i + 1][4]) - 1, Math.max(pts[i][5], pts[i + 1][5]));
    }
    if (channel) waterworks(bag, pts, s, face, channel, at);
  }
  for (const [si, i] of el.niches || []) niche(bag, el.sides[si], face, i);
  if (el.camel) camelPanel(bag, el.sides[el.camel[0]], face, el.camel[1]);
}

/**
 * The water along the foot of a wall: 'cut' — a kerb of rock with the channel along its top,
 * its outer lip, the water in it; 'pipe' — a ledge with the terracotta pipe laid on it, a collar
 * at each joint.
 */
function waterworks(bag, pts, s, face, kind, at) {
  const n = pts.length, d0 = (i) => faceD(face, i, 1.0, s);
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
function niche(bag, side, face, i) {
  const { s, pts } = side, [x, z, nx, nz, f] = pts[i], tx = nz * s, tz = -nx * s;
  const dIn = Math.max(...[1.6, 2.4, 3.2, 4].map((yy) => faceD(face, i, yy, s))) + 0.4, dOut = Math.min(...[1.6, 2.4, 3.2, 4].map((yy) => faceD(face, i, yy, s))) - 0.15;
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
function camelPanel(bag, side, face, i) {
  const { s, pts } = side, [x, z, nx, nz, f] = pts[i], tx = nz * s, tz = -nx * s;
  const ys = [1.6, 2.4, 3.2, 4.0, 4.6];
  const dIn = Math.max(...ys.flatMap((yy) => [-2, 0, 2].map((k) => faceD(face, i + k, yy, s)))) + 0.4;
  const dOut = Math.min(...ys.flatMap((yy) => [-2, 0, 2].map((k) => faceD(face, i + k, yy, s)))) - 0.12;
  const P = (u, d) => [x + tx * u + nx * d, z + tz * u + nz * d];
  { const a = P(0, dOut), b = P(0, dIn); bag.add(R, orientedBox(a, b, 4.6, f + 1.45, f + 4.7)); }
  // the relief faces back toward the line (−n), u along the wall
  const place = (u, v, w) => { const p = P(u, dOut - w); return [p[0], f + 1.6 + v, p[1]]; };
  raise(bag, R, CAMEL, 'siq-camel', place, 0.3, 0, 2.7, -s, 0.12, [[0.1, 0.85, -0.15, 0.6], [-0.3, 0.5, -0.3, 0.7]]);
  raise(bag, R, MAN, 'siq-man', place, -1.3, 0, 1.9, -s, 0.14, [[-0.08, 0.5, 0.08, 0.5]]);
}
