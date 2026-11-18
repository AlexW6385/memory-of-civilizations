// Carved detail of the Belém Tower (docs/settlements/manueline-lisbon.md §5c): twisted-rope string courses, the Order's shields in
// relief, ogee-hooded windows, the projecting loggia, the bartizans with ribbed domes, the rhinoceros gargoyle. Every piece goes into
// the bag under a material the plan already has, so it merges into the element's existing meshes (no new draw); sizes carry a
// millimetre of variation so that repeated shapes are merged, not instanced.
import { box, lathe, frustum, place, fromTriangles } from '../../core/geom.js';
import { tube } from '../../objects/kit.js';
import { orderCross, armillary } from './util.js';
import { onBuildStart } from '../../core/build-reset.js';

const CARVED = 'limestone_carved', MAT = 'limestone';
let seed = 12345;
onBuildStart(() => { seed = 12345; });
const jit = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296 - 0.5) * 0.003;
const jb = (x0, y0, z0, x1, y1, z1) => box(x0 + jit(), y0 + jit(), z0 + jit(), x1 + jit(), y1 + jit(), z1 + jit());

/** Twisted rope (two strands round a core) along a→b (plan points) at height y; `out` flips the side the rope stands off the line. */
export function ropeLine(bag, a, b, y, { r = 0.07, hr = 0.055, pitch = 0.6, step = 0.2, mat = CARVED, out = 1, lift = 0.1 } = {}) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = uz * out, nz = -ux * out, N = Math.max(2, Math.round(L / step));
  for (const ph of [0, Math.PI]) {
    const pts = [];
    for (let k = 0; k <= N; k++) {
      const s = k / N * L, t = s / pitch * Math.PI * 2 + ph, o = lift + Math.cos(t) * hr;
      pts.push([a[0] + ux * s + nx * o, y + Math.sin(t) * hr, a[1] + uz * s + nz * o, r * (1 + jit() * 4)]);
    }
    bag.add(mat, tube(pts, 3, { capA: false, capB: false }));
  }
}
/** The same round a closed polygon. */
export function ropeAround(bag, poly, y, o = {}) { for (let i = 0; i < poly.length; i++) ropeLine(bag, poly[i], poly[(i + 1) % poly.length], y, o); }

/** Face mapping: u along the face, v height, d outward from the face plane; faces 's' | 'n' | 'e' | 'w' of the rect [x0, z0, x1, z1]. */
export function faceMap(face, [x0, z0, x1, z1]) {
  return face === 's' ? (u, v, d) => [u, v, z1 + d] : face === 'n' ? (u, v, d) => [u, v, z0 - d] : face === 'e' ? (u, v, d) => [x1 + d, v, u] : (u, v, d) => [x0 - d, v, u];
}
/** An axis-aligned box given in face coordinates. */
export function fbox(bag, mat, M, u0, v0, d0, u1, v1, d1) {
  const a = M(u0, v0, d0), b = M(u1, v1, d1);
  bag.add(mat, jb(Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.min(a[2], b[2]), Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.max(a[2], b[2])));
}

/** A shield of the Order of Christ in relief on a face: a carved rim, the white field, the red cross. Free yaw: normal (nx, nz). */
export function shield(bag, x, y, z, nx, nz, w, h, field = 'plaster_white') {
  const g = [], yaw = Math.atan2(nx, nz), rim = 0.07 * w;
  const P = (mat, b) => bag.add(mat, place(b, x, y, z, yaw));
  P(CARVED, jb(-w / 2 - rim, -h / 2 - rim, 0, w / 2 + rim, h / 2 + rim, 0.05));
  P(CARVED, jb(-w / 2 - rim, -h / 2 - rim, 0.05, w / 2 + rim, -h / 2 + 0.005, 0.11)); P(CARVED, jb(-w / 2 - rim, h / 2 - 0.005, 0.05, w / 2 + rim, h / 2 + rim, 0.11));
  P(CARVED, jb(-w / 2 - rim, -h / 2, 0.05, -w / 2 + 0.005, h / 2, 0.11)); P(CARVED, jb(w / 2 - 0.005, -h / 2, 0.05, w / 2 + rim, h / 2, 0.11));
  P(field, jb(-w / 2, -h / 2, 0.05, w / 2, h / 2, 0.075));
  // the cross, built facing +z then turned
  const cb = { add: (m, geo) => bag.add(m, place(geo, x, y, z, yaw)) };
  orderCross(cb, 'wall_red', 0, 0, 0.075, Math.min(w, h) * 0.42, 's', 0.025);
  void g;
}

/** A window or niche hood: an ogee arch of rope over the opening, springing from colonnettes, a finial on its apex. */
export function ogeeHood(bag, M, u, vTop, w, { d = 0.3, rise = 0.55, fin = true } = {}) {
  const a = u - w / 2, b = u + w / 2, side = (s) => {
    const pts = [];
    for (let k = 0; k <= 6; k++) {
      const t = k / 6, e = t * t * (3 - 2 * t);   // an S curve: concave at the springing, convex at the apex
      const uu = s < 0 ? a + (u - a) * t : b - (b - u) * t, vv = vTop + rise * (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t)) * 0.0 + rise * e;
      pts.push([...M(uu, vv, d), 0.065 + jit()]);
    }
    return pts;
  };
  bag.add(CARVED, tube(side(-1), 5, { capA: false, capB: false })); bag.add(CARVED, tube(side(1), 5, { capA: false, capB: false }));
  if (fin) {
    const p = M(u, vTop + rise, d);
    bag.add(CARVED, lathe([[0.11, 0], [0.07, 0.14], [0.1, 0.22], [0.04, 0.34], [0.001, 0.46]], 6, null, p[0], p[1] - 0.04, p[2]));
  }
}

/** A semicircular arch of rope with the spandrel filled up to `top`, between columns at u0 and u1, spring height v; face plane at d. */
function archBay(bag, M, u0, u1, spring, top, d, t = 0.3) {
  const uc = (u0 + u1) / 2, R = (u1 - u0) / 2 - 0.12, m = 8, st = (u1 - u0) / m;
  for (let k = 0; k < m; k++) {
    const um = u0 + (k + 0.5) * st, dx = um - uc, vArch = Math.abs(dx) < R ? spring + Math.sqrt(R * R - dx * dx) : spring;
    fbox(bag, MAT, M, um - st / 2, vArch, d - t / 2, um + st / 2, top, d + t / 2);
  }
  const pts = Array.from({ length: 11 }, (_, k) => { const a = Math.PI * k / 10; return [...M(uc + Math.cos(a) * R, spring + Math.sin(a) * R, d + t / 2 + 0.03), 0.06 + jit()]; });
  bag.add(CARVED, tube(pts, 4, { capA: false, capB: false }));
  // a pendant at each of the soffit's cusps: a small boss under the crown
  const p = M(uc, spring + R - 0.12, d + t / 2 + 0.02);
  bag.add(CARVED, lathe([[0.001, 0], [0.09, 0.05], [0.05, 0.12], [0.001, 0.16]], 6, null, p[0], p[1], p[2]));
}

/**
 * The loggia of the south face: a gallery of seven round arches on eight slender columns standing out 1.6 m before the wall on a
 * corbelled slab, a balustrade of balusters between them, a cornice with pinnacles over, the royal shields on the spandrels.
 * y is the deck level; the gallery stands from y+12.6 to y+18.6; x0..x1 its width.
 */
export function loggia(bag, tx0, tx1, tz1, y) {
  const M = faceMap('s', [tx0, 0, tx1, tz1]), x0 = tx0 + 1, x1 = tx1 - 1, n = 7, dx = (x1 - x0) / n, D = 1.6;
  const floor = y + 12.6, rail = floor + 1.0, spring = y + 15.9, top = y + 17.7;
  // the corbelled slab and its rope
  fbox(bag, MAT, M, x0 - 0.35, floor - 0.25, 0, x1 + 0.35, floor + 0.15, D + 0.25);
  fbox(bag, CARVED, M, x0 - 0.45, floor + 0.15, 0.2, x1 + 0.45, floor + 0.3, D + 0.35);
  for (let k = 0; k < 9; k++) { const u = x0 - 0.25 + k * (x1 - x0 + 0.5) / 8, p = M(u, floor - 0.25, 0.1); bag.add(CARVED, lathe([[0.001, 0], [0.1, 0.25], [0.22, 0.6], [0.3, 0.8]], 6, null, p[0], p[1] - 0.55 + jit(), p[2] + 0.55)); }
  { const p = M(x0 - 0.4, 0, D + 0.3), q = M(x1 + 0.4, 0, D + 0.3); ropeLine(bag, [p[0], p[2]], [q[0], q[2]], floor + 0.3, { lift: 0.08, out: -1 }); }
  // the dark gallery behind, its ceiling
  fbox(bag, 'opening', M, x0 + 0.1, floor + 0.3, 0.02, x1 - 0.1, top - 0.1, 0.1);
  fbox(bag, CARVED, M, x0 - 0.15, top - 0.12, 0, x1 + 0.15, top + 0.05, D + 0.1);
  // columns, balusters, arches
  for (let k = 0; k <= n; k++) {
    const u = x0 + k * dx, p = M(u, floor + 0.3, D), end = k === 0 || k === n;
    bag.add(CARVED, lathe([[0.22, 0], [0.22, 0.12], [0.15, 0.2], [0.13, 0.8], [0.15, 3.2], [0.25, 3.35], [0.3, 3.6], [0.001, 3.6]].map(([r, h]) => [r * (end ? 1.15 : 1) + jit(), h]), 8, null, p[0], p[1], p[2]));
    // twisted rope on the shaft
    const pts = Array.from({ length: 21 }, (_, q) => { const t = q / 20, a = t * Math.PI * 8; return [p[0] + Math.cos(a) * 0.15, p[1] + 0.8 + t * 2.3, p[2] + Math.sin(a) * 0.15, 0.035]; });
    bag.add(CARVED, tube(pts, 3, { capA: false, capB: false }));
  }
  for (let k = 0; k < n; k++) {
    const u0 = x0 + k * dx, u1 = u0 + dx;
    archBay(bag, M, u0, u1, spring, top - 0.12, D, 0.3);
    // the rail: a handrail and balusters between the columns
    fbox(bag, CARVED, M, u0 + 0.15, rail, D - 0.12, u1 - 0.15, rail + 0.1, D + 0.12); fbox(bag, MAT, M, u0 + 0.15, floor + 0.3, D - 0.1, u1 - 0.15, floor + 0.42, D + 0.1);
    for (let q = 1; q <= 5; q++) { const p = M(u0 + q * dx / 6, floor + 0.42, D); bag.add(MAT, lathe([[0.06, 0], [0.09, 0.15], [0.05, 0.3], [0.07, 0.45], [0.05, 0.55], [0.001, 0.55]].map(([r, h]) => [r + jit(), h]), 6, null, p[0], p[1], p[2])); }
    // the royal shield above each arch's crown
  }
  // cornice, pinnacles and shields on the column heads
  fbox(bag, CARVED, M, x0 - 0.3, top, 0, x1 + 0.3, top + 0.3, D + 0.35);
  for (let k = 0; k <= n; k++) { const p = M(x0 + k * dx, top + 0.3, D + 0.1); bag.add(CARVED, lathe([[0.16, 0], [0.12, 0.2], [0.14, 0.3], [0.08, 0.7], [0.001, 1.0]], 6, null, p[0], p[1] + jit(), p[2])); }
  for (let k = 0; k < n; k += 2) { const p = M(x0 + (k + 0.5) * dx, top - 0.65, D + 0.18); shield(bag, p[0], p[1], p[2], 0, 1, 0.5, 0.6); }
}

/** A bartizan: corbelled base with a rope ring, slits, a ribbed onion dome, an armillary finial. (bx, bz) its centre, ty the terrace height. */
export function bartizan(bag, bx, bz, ty, seg = 12) {
  bag.add(MAT, lathe([[0.4, 0], [0.9, 0.3], [1.15, 0.7], [1.45, 1.0], [1.45, 1.15], [1.3, 1.3], [1.3, 3.2]].map(([r, h]) => [r + jit(), h]), seg, null, bx, ty - 1.4, bz));
  // rope ring under the parapet of the bartizan, and one at the springing
  for (const [yy, rr] of [[ty - 0.15, 1.34], [ty + 1.8, 1.34]]) {
    const pts = Array.from({ length: 49 }, (_, k) => { const a = k / 48 * Math.PI * 2, t = k / 48 * Math.PI * 2 * 12; return [bx + Math.cos(a) * (rr + Math.cos(t) * 0.05), yy + Math.sin(t) * 0.05, bz + Math.sin(a) * (rr + Math.cos(t) * 0.05), 0.07]; });
    bag.add(CARVED, tube(pts, 4, { capA: false, capB: false }));
  }
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2, nx = Math.cos(a), nz = Math.sin(a); bag.add('opening', place(jb(-0.13, 0, 0, 0.13, 0.75, 0.06), bx + nx * 1.31, ty + 0.5, bz + nz * 1.31, Math.atan2(nx, nz))); }
  const prof = [[1.5, 0], [1.66, 0.1], [1.6, 0.35], [1.25, 0.85], [0.8, 1.45], [0.38, 2.0], [0.001, 2.45]];
  bag.add(CARVED, lathe(prof.map(([r, h]) => [r + jit(), h]), seg, null, bx, ty + 1.85, bz));
  // the ribs of the dome: a raised rib on each of the gores
  for (let k = 0; k < seg; k++) {
    const a = (k + 0.0) / seg * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
    const pts = prof.slice(1, -1).map(([r, h], i) => [bx + c * (r + 0.05), ty + 1.85 + h, bz + s * (r + 0.05), 0.05 - i * 0.004]);
    bag.add(MAT, tube(pts, 3, { capA: false, capB: false }));
  }
  // finial: a ball with a small armillary
  bag.add(CARVED, lathe([[0.001, 0], [0.18, 0.05], [0.12, 0.25], [0.2, 0.4], [0.001, 0.8]], 8, null, bx, ty + 4.25, bz));
  armillary(bag, CARVED, bx, ty + 5.3, bz, 0.28);
}

/** The rhinoceros (Manuel's gift to the Pope, 1515) supporting a bartizan: body, folded hide, head with its horn, ears, forelegs; it springs from the wall corner outward along (dx, dz). */
export function rhinoceros(bag, cx, cz, dx, dz, yb) {
  const L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, px = -uz, pz = ux;
  const at = (s, h, o = 0) => [cx + ux * s + px * o, yb + h, cz + uz * s + pz * o];
  const T = (arr, n = 8, caps = [false, true]) => bag.add(CARVED, tube(arr.map(([s, h, o, r, r2]) => [...at(s, h, o), r, r2]), n, { capA: caps[0], capB: caps[1] }));
  T([[-0.9, 0.05, 0, 0.55, 0.5], [-0.2, 0.0, 0, 0.62, 0.58], [0.5, -0.04, 0, 0.6, 0.56], [0.95, -0.12, 0, 0.5, 0.48]], 10);                        // the body
  T([[0.9, -0.12, 0, 0.46, 0.44], [1.3, -0.32, 0, 0.4, 0.4], [1.75, -0.5, 0, 0.3, 0.3], [2.0, -0.55, 0, 0.18, 0.2]], 8);                         // the neck and the long head
  T([[1.9, -0.36, 0, 0.1, 0.07], [2.0, -0.15, 0, 0.07, 0.07], [2.08, 0.12, 0, 0.001, 0.001]], 6, [true, true]);                                  // the horn
  for (const o of [-0.17, 0.17]) { T([[1.38, -0.0, o * 1.8, 0.08, 0.1], [1.38, 0.2, o * 2.2, 0.001, 0.001]], 5, [true, true]); }              // the ears
  for (const o of [-0.34, 0.34]) { T([[0.2, -0.45, o, 0.15, 0.15], [0.28, -0.85, o * 1.1, 0.13, 0.13], [0.32, -1.1, o * 1.1, 0.16, 0.12]], 6, [true, true]); }  // forelegs
  // the folds of the hide: ridges at the shoulder, the flank and the haunch
  for (const s of [0.55, 0.1, -0.4]) {
    const ring = Array.from({ length: 13 }, (_, k) => { const a = k / 12 * Math.PI * 2; return [...at(s, 0.0 + Math.sin(a) * 0.63, Math.cos(a) * 0.66), 0.06]; });
    bag.add(CARVED, tube(ring, 4, { capA: false, capB: false }));
  }
}

/** A tower's string course of windows: the opening, a stepped frame, colonnettes, an ogee hood. */
export function manuWindow(bag, M, u, v, w, h, { hood = true } = {}) {
  const fr = 0.22;
  fbox(bag, 'opening', M, u - w / 2, v, -0.12, u + w / 2, v + h, 0.02);
  fbox(bag, CARVED, M, u - w / 2 - fr, v - fr, 0, u + w / 2 + fr, v, 0.28);                       // the sill
  fbox(bag, CARVED, M, u - w / 2 - fr, v + h, 0, u + w / 2 + fr, v + h + fr, 0.24);              // the lintel
  fbox(bag, CARVED, M, u - w / 2 - fr, v, 0, u - w / 2, v + h, 0.22); fbox(bag, CARVED, M, u + w / 2, v, 0, u + w / 2 + fr, v + h, 0.22);
  for (const s of [-1, 1]) { const p = M(u + s * (w / 2 + 0.02), v, 0.26); bag.add(CARVED, lathe([[0.1, 0], [0.07, 0.1], [0.06, h - 0.1], [0.1, h]].map(([r, hh]) => [r + jit(), hh]), 6, null, p[0], p[1], p[2])); }
  if (hood) ogeeHood(bag, M, u, v + h + fr, w + fr * 2, { d: 0.26, rise: 0.5 });
}
export { fromTriangles, frustum };
