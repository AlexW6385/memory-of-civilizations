// Carved relief of Ajanta's facades (docs/settlements/ajanta.md §15): the horseshoe (chaitya) arch as a smooth moulded
// ring with depth, the seated Buddha of the niches, scroll brackets under the porch lintels, fluted pilasters and the
// ribbed lattice of the great window, and the rock's bedding lips, joints and tool marks. Coordinates are world; the face
// looks +x and pieces stand out of it. Repeated shapes are varied by a millimetre so that they merge instead of instancing.
import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { lat, diskX } from './sculpt.js';
import { PAL } from './paint.js';

const W = 'sandstone_white', S = 'sandstone_carved', RED = 'clay_robe';
const mm = (i, k = 0) => 0.001 * ((Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1);

/** Push triangle a b c facing the direction n (flipped when its winding says otherwise). */
function tri(out, a, b, c, n) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const d = (uy * vz - uz * vy) * n[0] + (uz * vx - ux * vz) * n[1] + (ux * vy - uy * vx) * n[2];
  if (d >= 0) out.push(...a, ...b, ...c); else out.push(...a, ...c, ...b);
}
const qd = (out, a, b, c, d, n) => { tri(out, a, b, c, n); tri(out, a, c, d, n); };

/** The outline of a horseshoe arch of radius R centred at (zc, yc): the arc passes the horizontal and narrows, then the legs drop to yb. [z, y] pairs, left leg → right leg. */
function horse(zc, yc, R, yb, n, sp = 0.3) {
  const pts = [], a0 = Math.PI + sp, a1 = -sp;
  pts.push([zc + R * Math.cos(a0), yb]);
  for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; pts.push([zc + R * Math.cos(a), yc + R * Math.sin(a)]); }
  pts.push([zc + R * Math.cos(a1), yb]);
  return pts;
}

/** A moulded horseshoe arch standing on the plane x = x0: rings [rIn, rOut, depth] from the opening outward, each standing `depth` out; centre (zc, yc), legs to yb. A flat fill of one material may close the opening (fill depth 0.02). */
export function horseshoe(bag, mat, x0, zc, yc, yb, rings, { n = 14, fill = null, seed = 0, sp = 0.3 } = {}) {
  const out = [];
  const nrm = (p, q) => [0, (p[1] + q[1]) / 2 > yc ? (p[1] + q[1]) / 2 - yc : 0, (p[0] + q[0]) / 2 - zc];
  const wallq = (A, i, xa, xb, sgn) => {
    const n3 = nrm(A[i], A[i + 1]).map((v) => v * sgn);
    qd(out, [xa, A[i][1], A[i][0]], [xa, A[i + 1][1], A[i + 1][0]], [xb, A[i + 1][1], A[i + 1][0]], [xb, A[i][1], A[i][0]], n3);
  };
  const cur = rings.map(([ri, ro]) => [horse(zc, yc, ri, yb, n, sp), horse(zc, yc, ro, yb, n, sp)]);
  rings.forEach(([, , d], k) => {
    const [A, B] = cur[k], xf = x0 + d + mm(k, seed);
    for (let i = 0; i < A.length - 1; i++) qd(out, [xf, A[i][1], A[i][0]], [xf, A[i + 1][1], A[i + 1][0]], [xf, B[i + 1][1], B[i + 1][0]], [xf, B[i][1], B[i][0]], [1, 0, 0]);
    const dPrev = k ? rings[k - 1][2] : 0, dNext = k < rings.length - 1 ? rings[k + 1][2] : 0;
    for (let i = 0; i < A.length - 1; i++) {
      if (d > dPrev) wallq(A, i, x0 + dPrev, xf, -1);          // the inner reveal: its exposed part
      if (d > dNext) wallq(B, i, x0 + dNext, xf, 1);           // the outer wall
    }
  });
  bag.add(mat, fromTriangles(out));
  if (fill) {
    const P = horse(zc, yc, rings[0][0], yb, n, sp), t = [], xf = x0 + 0.02;
    for (let i = 0; i < P.length - 1; i++) tri(t, [xf, yc, zc], [xf, P[i][1], P[i][0]], [xf, P[i + 1][1], P[i + 1][0]], [1, 0, 0]);
    tri(t, [xf, yc, zc], [xf, P[P.length - 1][1], P[P.length - 1][0]], [xf, P[0][1], P[0][0]], [1, 0, 0]);
    bag.add(fill, fromTriangles(t));
  }
}

/** A Buddha seated in padmasana on a lotus seat, h high, at (x, y, z) facing +x, hands in the lap, a halo behind. */
export function seatedBuddha(bag, x, y, z, h, i = 0, o = {}) {
  const s = h / 1.0 * (1 + mm(i, 3)), robe = o.robe ?? 'paint_white';
  const L = (prof, seg, sx, sz, dx, dy, dz) => lat(prof, seg, null, sx, sz, x + dx, y + dy, z + dz);
  bag.add(S, L([[0.001, 0], [0.36 * s, 0], [0.4 * s, 0.03 * s], [0.3 * s, 0.08 * s], [0.34 * s, 0.11 * s], [0.001, 0.11 * s]], 12, 0.9, 1, 0, 0, 0));            // the lotus seat
  bag.add(robe, L([[0.001, 0.11 * s], [0.42 * s, 0.12 * s], [0.42 * s, 0.19 * s], [0.3 * s, 0.25 * s], [0.001, 0.26 * s]], 12, 0.55, 1.3, 0, 0, 0));          // the crossed legs, wide and low
  bag.add(robe, L([[0.001, 0.24 * s], [0.2 * s, 0.25 * s], [0.17 * s, 0.45 * s], [0.31 * s, 0.66 * s], [0.2 * s, 0.76 * s], [0.001, 0.77 * s]], 12, 0.6, 1.15, 0, 0, 0)); // the torso: waist and shoulders
  bag.add(o.skin ?? PAL.skin, L([[0.001, 0.74 * s], [0.09 * s, 0.76 * s], [0.15 * s, 0.85 * s], [0.15 * s, 0.95 * s], [0.1 * s, 1.03 * s], [0.001, 1.07 * s]], 10, 0.9, 0.95, 0.01 * s, 0, 0));  // the head
  bag.add(PAL.black, L([[0.001, 0.99 * s], [0.14 * s, 0.99 * s], [0.12 * s, 1.1 * s], [0.001, 1.17 * s]], 10, 0.9, 0.95, 0.005 * s, 0, 0));                         // the hair and ushnisha
  bag.add(robe, box(x + 0.1 * s, y + 0.3 * s, z - 0.17 * s, x + 0.2 * s, y + 0.37 * s, z + 0.17 * s));                                                       // the hands in the lap
  bag.add(o.halo ?? PAL.ochre, diskX(0.34 * s, x - 0.13 * s, y + 0.96 * s, z, 16));                                                                            // the halo
}

/** Triangulate a simple counter-clockwise polygon of [z, y] points (ear clipping). */
function earclip(P) {
  const idx = P.map((_, i) => i), res = [], area = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  let guard = 400;
  while (idx.length > 3 && guard-- > 0) {
    let cut = false;
    for (let k = 0; k < idx.length; k++) {
      const a = P[idx[(k + idx.length - 1) % idx.length]], b = P[idx[k]], c = P[idx[(k + 1) % idx.length]];
      if (area(a, b, c) <= 1e-9) continue;
      let ok = true;
      for (const j of idx) { const p = P[j]; if (p === a || p === b || p === c) continue; if (area(a, b, p) >= 0 && area(b, c, p) >= 0 && area(c, a, p) >= 0) { ok = false; break; } }
      if (!ok) continue;
      res.push([a, b, c]); idx.splice(k, 1); cut = true; break;
    }
    if (!cut) break;
  }
  if (idx.length === 3) res.push([P[idx[0]], P[idx[1]], P[idx[2]]]);
  return res;
}
/** A polygon of [z, y] (counter-clockwise seen from +x... in the z–y plane) extruded along x from xa to xb. */
export function extrude(P, xa, xb) {
  const out = []; let ar = 0;
  for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; ar += p[0] * q[1] - q[0] * p[1]; }
  if (ar < 0) P = [...P].reverse();
  for (const [a, b, c] of earclip(P)) tri(out, [xb, a[1], a[0]], [xb, b[1], b[0]], [xb, c[1], c[0]], [1, 0, 0]);
  for (let i = 0; i < P.length; i++) {
    const p = P[i], q = P[(i + 1) % P.length], dz = q[0] - p[0], dy = q[1] - p[1];
    qd(out, [xa, p[1], p[0]], [xa, q[1], q[0]], [xb, q[1], q[0]], [xb, p[1], p[0]], [0, -dz, dy]);
  }
  return fromTriangles(out);
}
const circle = (z, y, r, n = 10) => Array.from({ length: n }, (_, i) => [z + r * Math.cos(-i / n * Math.PI * 2), y + r * Math.sin(-i / n * Math.PI * 2)]);

/** The scroll bracket of a pillar's capital: out of the abacus (at z = zp, top of the lintel at yt) to each side along z, a volute at its end and a small gana crouched under it. Two brackets facing ±z, standing between x0 and x1. */
export function brackets(bag, x0, x1, zp, yt, reach, i = 0) {
  for (const sg of [-1, 1]) {
    const k = 1 + mm(i * 2 + (sg > 0), 5), r = reach * k;
    // profile in (s outward from the pillar axis, t down from the lintel): a tapering S-curve ending in a scroll
    const s0 = 0.78, F = [[0, 0], [1, 0], [1.03, -0.1], [0.9, -0.2], [0.55, -0.24], [0.42, -0.34], [0.52, -0.46], [0.22, -0.5], [0.13, -0.4], [0.08, -0.5], [0, -0.6]];
    const raw = F.map(([f, t]) => [s0 + (r - s0) * f, t]);
    let P = raw.map(([s, t]) => [zp + sg * s, yt + t]);
    if (sg < 0) P = P.reverse();
    bag.add(S, extrude(P, x0, x1));
  }
}

/** A pilaster of the facade: fluted shaft between y0 and y1 on the face x = x0, centre z, half-width hw, flutes standing out; a base of two steps and a lotus-petal capital. */
export function pilaster(bag, x0, z, y0, y1, hw, seed = 0) {
  const n = 7, w = (2 * hw) / n;
  for (let i = 0; i < n; i++) {
    const a = z - hw + i * w + w * 0.2, ww = w * 0.6 + mm(i, seed);
    bag.add(S, box(x0, y0 + 0.9, a, x0 + 0.12, y1 - 1.0, a + ww));
  }
  bag.add(S, box(x0, y0, z - hw * 1.2, x0 + 0.3, y0 + 0.5, z + hw * 1.2));
  bag.add(S, box(x0, y0 + 0.5, z - hw * 1.08, x0 + 0.2, y0 + 0.9, z + hw * 1.08));
  bag.add(S, box(x0, y1 - 1.0, z - hw * 1.08, x0 + 0.2, y1 - 0.75, z + hw * 1.08));
  const cap = [[z - hw * 1.2, y1 - 0.75], [z + hw * 1.2, y1 - 0.75], [z + hw * 1.3, y1 - 0.5], [z + hw * 1.1, y1 - 0.3], [z - hw * 1.1, y1 - 0.3], [z - hw * 1.3, y1 - 0.5]].reverse();
  bag.add(S, extrude(cap, x0, x0 + 0.3));
  for (let i = 0; i < 6; i++) { const a = z - hw * 1.08 + i * (hw * 2.16 / 6); bag.add(W, extrude([[a + 0.03, y1 - 0.3], [a + 0.03 + hw * 0.34, y1 - 0.3], [a + hw * 0.17 + 0.03, y1 - 0.62]].reverse(), x0 + 0.3, x0 + 0.34 + mm(i, seed)).translate(0, 0, 0)); }
}

/** The rib lattice of the great chaitya window: spokes from a hub and two rings of timber in the plane x = xp, radius r, centre (zc, yc), upper half only. */
export function windowLattice(bag, xp, zc, yc, r, yb) {
  const wood = 'timber';
  for (let i = 0; i <= 12; i++) {
    const a = Math.PI * i / 12, e = r * 0.98;
    bag.add(wood, rod([xp, yc + 0.18 * Math.sin(a) * 0.4, zc + 0.18 * Math.cos(a) * 0.4], [xp + mm(i), yc + e * Math.sin(a), zc + e * Math.cos(a)], 0.035 + mm(i, 2), 5));
  }
  for (const rr of [0.42, 0.74]) for (let i = 0; i < 12; i++) {
    const a = Math.PI * i / 12, b = Math.PI * (i + 1) / 12;
    bag.add(wood, rod([xp, yc + rr * r * Math.sin(a), zc + rr * r * Math.cos(a)], [xp, yc + rr * r * Math.sin(b), zc + rr * r * Math.cos(b)], 0.03 + mm(i, rr * 9), 4));
  }
  // the legs of the horseshoe: two uprights, and a sill beam across the foot
  for (const s of [-1, 1]) bag.add(wood, box(xp - 0.04, yb, zc + s * r * 0.955 - 0.05, xp + 0.04, yc - r * 0.29, zc + s * r * 0.955 + 0.05));
  bag.add(wood, box(xp - 0.05, yb, zc - r * 0.96, xp + 0.05, yb + 0.1, zc + r * 0.96));
}

/** The rock's own marks on the main face (x < XF): bedding lips, vertical joints and clusters of chisel strokes, where no cave or frame stands. skip(z, y) says where not. */
export function rockMarks(bag, XF, rand, skip) {
  for (let k = 0; k < 70; k++) {
    const z = -57 + rand() * 114, y = [11.2, 14.6, 17.8, 21.5, 25.3, 28.4][k % 6] + (rand() - 0.5) * 1.4, len = 2.5 + rand() * 6;
    if (skip(z, y) || skip(z + len, y)) continue;
    bag.add(k % 3 ? 'rubble' : 'sandstone_relief', box(XF - 0.35, y, z, XF + 0.1 + rand() * 0.25, y + 0.18 + rand() * 0.14, z + len));
    bag.add('tuff_red', box(XF - 0.35, y - 0.1, z + 0.3, XF + 0.04, y, z + len - 0.3));
  }
  for (let k = 0; k < 60; k++) {
    const z = -57 + rand() * 114, y = 10 + rand() * 20, h = 2 + rand() * 4.5;
    if (skip(z, y) || skip(z, y + h)) continue;
    bag.add('tuff_red', box(XF - 0.04, y, z, XF + 0.012, y + h, z + 0.05 + rand() * 0.06));
  }
  for (let k = 0; k < 24; k++) {
    const z0 = -55 + rand() * 110, y0 = 10.3 + rand() * 4;
    if (skip(z0, y0) || skip(z0 + 2, y0 + 1.5)) continue;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
      const z = z0 + c * 0.32 + (r % 2) * 0.12 + mm(c + r * 7, k), y = y0 + r * 0.42, a = 0.5 + 0.1 * mm(k + c, 1) * 1000;
      void a;
      bag.add(c % 2 ? 'tuff_red' : 'sandstone_dressed', box(XF - 0.02, y, z, XF + 0.035, y + 0.05, z + 0.26 + mm(c, r)).rotateX(0));
    }
  }
}
void lathe;
