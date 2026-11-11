// The carved, cast and glazed detail of the Qing palace and of Joseon Gyeongbokgung
// (docs/settlements/qing-beijing.md §4, joseon-seoul.md §4): guardian beasts (the bronze lions,
// the haetae and cheonrok in stone), the bronzes of the terrace (vats with ring handles, tripod
// burners, the tortoise and the crane, the sundial and the grain measure), the marble balustrade
// with dragon and phoenix posts, its dragon-head spouts, the roof's ridge ornaments and the rows
// of little figures on its hips, and gate leaves with their rows of gilt nails. Every piece is
// built at its own origin, facing +z, feet at y = 0, and then turned and placed; pieces repeated
// many times (posts, spouts, nails, figures) are added one by one so that the bag draws them as
// instances (src/core/geom.js).

import { BufferGeometry, Float32BufferAttribute, Shape, ExtrudeGeometry } from '../../core/three.js';
import { box, lathe, fromTriangles, frustum, orientOutward } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';

// ── geometry helpers ────────────────────────────────────────────────────────────────────────────
/** An ellipsoid of radii rx, ry, rz centred at the origin. */
export function ball(rx, ry = rx, rz = rx, n = 10, m = 6) {
  const g = lathe(Array.from({ length: m + 1 }, (_, i) => { const t = i / m * Math.PI; return [Math.max(0.001, Math.sin(t)), -Math.cos(t)]; }), n);
  g.scale(rx, ry, rz);
  return g;
}
/** A closed limb from a to b, radius r0 at a and r1 at b. */
export function limb(a, b, r0, r1 = r0, n = 8) {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dx, dy, dz) || 1e-6;
  const g = lathe([[0.001, 0], [r0, 0], [r1, L], [0.001, L]], n);
  g.rotateX(Math.atan2(Math.hypot(dx, dz), dy)); g.rotateY(Math.atan2(dx, dz)); g.translate(a[0], a[1], a[2]);
  return g;
}
/** A ring of major radius R and minor radius r round the y axis. */
export function torus(R, r, n = 16, m = 6) {
  const prof = [];
  for (let i = 0; i <= m; i++) { const t = -Math.PI / 2 + i / m * Math.PI * 2; prof.push([R + Math.cos(t) * r, Math.sin(t) * r]); }
  return lathe(prof, n);
}
/** Turn about y, scale, then move. */
export function T(g, x = 0, y = 0, z = 0, yaw = 0, s = 1) { if (s !== 1) g.scale(s, s, s); if (yaw) g.rotateY(yaw); g.translate(x, y, z); return g; }
/** One geometry from several (positions and normals). */
export function merge(list) {
  const gs = list.map((g) => (g.index ? g.toNonIndexed() : g));
  let n = 0; for (const g of gs) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
  let o = 0;
  for (const g of gs) { pos.set(g.attributes.position.array, o); nor.set(g.attributes.normal.array, o); o += g.attributes.position.array.length; }
  const m = new BufferGeometry();
  m.setAttribute('position', new Float32BufferAttribute(pos, 3));
  m.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  return m;
}
/** A collector of pieces by material, emptied into the bag as one piece per material, placed. */
export class Parts {
  constructor() { this.m = new Map(); }
  add(mat, g) { if (!this.m.has(mat)) this.m.set(mat, []); this.m.get(mat).push(g); return g; }
  emit(bag, x = 0, y = 0, z = 0, yaw = 0, s = 1) { for (const [mat, list] of this.m) bag.add(mat, T(merge(list), x, y, z, yaw, s)); }
}
const yawOf = (fx, fz) => Math.atan2(fx, fz);
/** A sumeru pedestal (xumi zuo) of stacked mouldings over [x0, z0, x1, z1], h high. */
export function sumeru(P, mat, x0, z0, x1, z1, h, y = 0) {
  for (const [a, b, i] of [[0, 0.14, 0], [0.14, 0.24, 0.05], [0.24, 0.32, 0.1], [0.32, 0.66, 0.16], [0.66, 0.74, 0.1], [0.74, 0.86, 0.04], [0.86, 1, 0.01]]) P.add(mat, box(x0 + i, y + a * h, z0 + i, x1 - i, y + b * h, z1 - i));
}

// ── guardian beasts ─────────────────────────────────────────────────────────────────────────────
/**
 * A seated guardian (about 2.3 m to the crown at s = 1), facing +z: haunches and folded hind legs,
 * the chest rising to a great head ringed by its mane, the crown covered in rows of snail curls
 * (forty-five on the palace lions: nine times five), bulging eyes and brows, the open jaw; a collar
 * with its bell; the tail spread in a fan. o.paw: 'ball' (the male, right forepaw on the
 * embroidered ball), 'cub' (the female, left forepaw on her cub) or none; o.horn (the haetae).
 */
export function seated(P, m, o = {}) {
  const lite = !!o.lite, B = (rx, ry, rz, x, y, z, n = 10) => { if (lite && n < 8) return; P.add(m, T(ball(rx, ry, rz, lite ? 6 : Math.min(n, 9), lite ? 4 : n >= 10 ? 6 : 4), x, y, z)); };
  B(0.55, 0.42, 0.6, 0, 0.4, -0.3, 12);                                                  // the haunches
  for (const sx of [-1, 1]) { B(0.24, 0.34, 0.46, sx * 0.42, 0.36, -0.24); B(0.17, 0.1, 0.28, sx * 0.43, 0.08, 0.14); }
  const a = [0, 0.55, -0.2], b = [0, 1.35, 0.12];
  P.add(m, limb(a, b, 0.5, 0.44, 12));                                                   // the chest
  const chest = (y) => { const t = (y - a[1]) / (b[1] - a[1]); return { z: a[2] + t * (b[2] - a[2]), r: 0.5 - 0.06 * t }; };
  // the forelegs: straight, or one raised onto the ball or the cub
  for (const sx of [-1, 1]) {
    const onBall = o.paw === 'ball' && sx < 0, onCub = o.paw === 'cub' && sx > 0;
    const foot = onBall ? [-0.38, 0.6, 0.55] : onCub ? [0.38, 0.34, 0.6] : [sx * 0.3, 0.1, 0.5];
    P.add(m, limb([sx * 0.3, 1.1, 0.22], foot, 0.15, 0.12));
    B(0.16, 0.09, 0.22, foot[0], foot[1] - 0.02, foot[2] + 0.04);
    for (const k of [-1, 0, 1]) B(0.05, 0.045, 0.05, foot[0] + k * 0.08, foot[1] - 0.04, foot[2] + 0.24, 6);   // the claws
  }
  if (o.paw === 'ball') {
    P.add(m, T(ball(0.29, 0.29, 0.29, 12), -0.38, 0.29, 0.55));
    for (const ang of [0, Math.PI / 2]) { const r = torus(0.29, 0.025, 16, 4); r.rotateX(Math.PI / 2); r.rotateY(ang); P.add(m, T(r, -0.38, 0.29, 0.55)); }   // its ribbons
  } else if (o.paw === 'cub') {
    B(0.17, 0.13, 0.25, 0.38, 0.13, 0.55); B(0.12, 0.11, 0.12, 0.38, 0.2, 0.82);              // the cub on its back, its head
    for (const sx of [-1, 1]) P.add(m, limb([0.38 + sx * 0.1, 0.2, 0.5], [0.38 + sx * 0.12, 0.34, 0.42], 0.04, 0.03, 6));
  }
  // the mane, the head, the face
  B(0.56, 0.55, 0.42, 0, 1.5, 0.05, 12);
  const hc = [0, 1.82, 0.32], hr = [0.46, 0.42, 0.42];
  B(...hr, ...hc, 12);
  B(0.3, 0.2, 0.22, 0, 1.68, 0.66); B(0.13, 0.08, 0.07, 0, 1.78, 0.86);                       // muzzle and nose
  B(0.23, 0.08, 0.2, 0, 1.49, 0.6);                                                       // the lower jaw, open
  for (const sx of [-1, 1]) {
    B(0.09, 0.09, 0.09, sx * 0.17, 1.92, 0.66, 8); B(0.15, 0.06, 0.09, sx * 0.17, 2.03, 0.62, 8); B(0.1, 0.13, 0.05, sx * 0.42, 1.98, 0.3, 8);
    B(0.035, 0.07, 0.035, sx * 0.12, 1.56, 0.78, 6);                                          // the fangs
  }
  const D = Math.PI / 180;
  for (const be of [-25, 5, 35, 65, 95]) for (let k = -4; k <= 4; k++) {               // the snail curls
    const al = k * 16 * D, bb = be * D, d = [Math.sin(al), Math.cos(al) * Math.cos(bb), -Math.cos(al) * Math.sin(bb)];
    if (!lite) P.add(m, T(ball(0.075, 0.075, 0.075, 5, 3), hc[0] + d[0] * hr[0], hc[1] + d[1] * hr[1], hc[2] + d[2] * hr[2]));
  }
  if (o.horn) P.add(m, limb([0, 2.12, 0.34], [0, 2.46, 0.22], 0.08, 0.03));
  // the collar and its bell; the locks down the back; the tail
  if (o.bell !== false) { P.add(m, T(torus(0.47, 0.05, 16, 4), 0, 1.25, chest(1.25).z)); B(0.11, 0.12, 0.11, 0, 1.12, chest(1.12).z + chest(1.12).r + 0.04, 8); }
  for (let i = 0; i < 4; i++) { const y = 1.4 - i * 0.16, c = chest(y); B(0.13, 0.12, 0.1, 0, y, c.z - c.r + 0.06, 8); }
  B(0.3, 0.3, 0.12, 0, 0.62, -0.78); for (const sx of [-1, 1]) B(0.16, 0.24, 0.08, sx * 0.22, 0.56, -0.74, 8);
}
/** A crouching guardian (the cheonrok by the palace stream), about 1.2 m high, long, head up. */
export function crouching(P, m) {
  const B = (rx, ry, rz, x, y, z, n = 10) => P.add(m, T(ball(rx, ry, rz, n), x, y, z));
  B(0.42, 0.34, 0.45, 0, 0.32, -0.6, 12);
  P.add(m, limb([0, 0.4, -0.7], [0, 0.52, 0.3], 0.36, 0.33, 12));
  for (const sx of [-1, 1]) {
    B(0.18, 0.26, 0.38, sx * 0.33, 0.24, -0.5);
    P.add(m, limb([sx * 0.24, 0.45, 0.24], [sx * 0.27, 0.08, 0.6], 0.12, 0.1)); B(0.13, 0.08, 0.2, sx * 0.27, 0.07, 0.68);
    B(0.08, 0.08, 0.08, sx * 0.13, 0.94, 0.72, 8); B(0.08, 0.11, 0.05, sx * 0.28, 0.98, 0.42, 8);
  }
  B(0.34, 0.31, 0.33, 0, 0.84, 0.48, 12); B(0.21, 0.15, 0.17, 0, 0.74, 0.76); B(0.18, 0.07, 0.15, 0, 0.6, 0.7);
  P.add(m, limb([0, 1.08, 0.46], [0, 1.32, 0.34], 0.06, 0.025));                           // the single horn
  for (let i = 0; i < 5; i++) B(0.12, 0.07, 0.12, 0, 0.88 - i * 0.07, 0.1 - i * 0.2, 8);    // the scales along the spine
  B(0.22, 0.26, 0.09, 0, 0.5, -1.0);
}

// ── the bronzes and stones of the courts ─────────────────────────────────────────────────────────
/** A vat (jixiang gang) of gilt bronze on its carved stand: the belly, the rolled rim, two animal masks with hanging rings. */
export function vat(P, metal = 'gilt_bronze', stone = 'marble', wide = false) {
  const k = wide ? [1.25, 0.6] : [1, 1];
  sumeru(P, stone, -1.0 * k[0], -1.0 * k[0], 1.0 * k[0], 1.0 * k[0], 0.45);
  P.add(metal, lathe([[0.001, 0], [0.9, 0.05], [1.12, 0.5], [1.18, 1.0], [1.05, 1.35], [1.1, 1.42], [0.95, 1.42], [0.001, 1.3]].map(([r, y]) => [r * k[0], y * k[1]]), 20, null, 0, 0.45, 0));
  P.add(metal, T(torus(1.08 * k[0], 0.045, 20, 4), 0, 0.45 + 1.4 * k[1], 0));
  for (const sx of [-1, 1]) {
    const x = sx * 1.19 * k[0], y = 0.45 + 1.02 * k[1];
    P.add(metal, T(ball(0.06, 0.16, 0.15, 8), x, y, 0)); P.add(metal, T(ball(0.05, 0.05, 0.05, 6), x + sx * 0.03, y + 0.12, 0.1)); P.add(metal, T(ball(0.05, 0.05, 0.05, 6), x + sx * 0.03, y + 0.12, -0.1));
    const r = torus(0.12, 0.022, 14, 4); r.rotateZ(Math.PI / 2); P.add(metal, T(r, x + sx * 0.06, y - 0.12, 0));
  }
}
/** A tripod incense burner (ding) on its pedestal: three legs, the round belly, two upright ears, the domed lid with its knob. */
export function tripod(P, metal = 'bronze', stone = 'marble') {
  sumeru(P, stone, -0.9, -0.9, 0.9, 0.9, 1.0);
  const y = 1.0;
  for (let k = 0; k < 3; k++) { const a = k * 2 * Math.PI / 3 + Math.PI / 2; P.add(metal, limb([Math.cos(a) * 0.4, y + 0.75, Math.sin(a) * 0.4], [Math.cos(a) * 0.52, y, Math.sin(a) * 0.52], 0.09, 0.06)); P.add(metal, T(ball(0.09, 0.05, 0.09, 8), Math.cos(a) * 0.52, y + 0.03, Math.sin(a) * 0.52)); }
  P.add(metal, lathe([[0.001, 0.55], [0.42, 0.6], [0.6, 0.85], [0.58, 1.1], [0.5, 1.2], [0.56, 1.24], [0.001, 1.26]], 16, null, 0, y, 0));
  P.add(metal, lathe([[0.5, 1.24], [0.46, 1.42], [0.28, 1.54], [0.16, 1.6], [0.16, 1.7], [0.22, 1.78], [0.12, 1.94], [0.14, 2.0], [0.001, 2.18]], 12, null, 0, y, 0));
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) P.add(metal, limb([sx * 0.46, y + 1.18, sz * 0.13], [sx * 0.54, y + 1.62, sz * 0.13], 0.04, 0.035, 6));
    P.add(metal, limb([sx * 0.54, y + 1.62, -0.17], [sx * 0.54, y + 1.62, 0.17], 0.045, 0.045, 6));
  }
}
/** The bronze tortoise with a dragon's head, on a stone pedestal. */
export function tortoise(P, metal = 'bronze', stone = 'marble') {
  sumeru(P, stone, -0.8, -1.0, 0.8, 1.0, 0.7);
  const y = 0.7, B = (rx, ry, rz, x, yy, z, n = 10) => P.add(metal, T(ball(rx, ry, rz, n), x, y + yy, z));
  B(0.55, 0.12, 0.7, 0, 0.26, 0, 12); B(0.58, 0.36, 0.74, 0, 0.3, -0.02, 14);
  for (const [x, z] of [[0, 0], [0, 0.38], [0, -0.38], [0.3, 0.18], [-0.3, 0.18], [0.3, -0.2], [-0.3, -0.2]]) B(0.2, 0.035, 0.2, x, 0.3 + 0.36 * Math.sqrt(Math.max(0, 1 - (x / 0.58) ** 2 - (z / 0.74) ** 2)) - 0.012, z, 8);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { P.add(metal, limb([sx * 0.42, y + 0.25, sz * 0.48], [sx * 0.58, y + 0.02, sz * 0.62], 0.12, 0.1)); B(0.12, 0.05, 0.14, sx * 0.6, 0.03, sz * 0.66, 8); }
  P.add(metal, limb([0, y + 0.36, 0.6], [0, y + 0.8, 0.94], 0.14, 0.12));
  B(0.17, 0.15, 0.24, 0, 0.88, 1.02); B(0.1, 0.06, 0.1, 0, 0.8, 1.2, 8);
  for (const sx of [-1, 1]) { P.add(metal, limb([sx * 0.08, y + 1.0, 0.98], [sx * 0.14, y + 1.18, 0.82], 0.035, 0.015, 6)); B(0.045, 0.045, 0.045, sx * 0.1, 0.94, 1.18, 6); }
  P.add(metal, limb([0, y + 0.3, -0.72], [0, y + 0.12, -1.0], 0.08, 0.02, 6));
}
/** The bronze crane standing on one pedestal, its neck curved up, 1.98 m to the crown. */
export function crane(P, metal = 'bronze', stone = 'marble') {
  sumeru(P, stone, -0.5, -0.5, 0.5, 0.5, 0.55);
  const y = 0.55, B = (rx, ry, rz, x, yy, z, n = 10) => P.add(metal, T(ball(rx, ry, rz, n), x, y + yy, z));
  B(0.26, 0.22, 0.42, 0, 0.82, 0, 12);
  for (const sx of [-1, 1]) { B(0.08, 0.17, 0.38, sx * 0.2, 0.88, -0.05, 8); P.add(metal, limb([sx * 0.08, y + 0.66, 0.02], [sx * 0.08, y, 0.06], 0.035, 0.03, 6)); B(0.06, 0.02, 0.14, sx * 0.08, 0.01, 0.12, 6); }
  B(0.15, 0.08, 0.24, 0, 0.84, -0.44, 8);
  const neck = [[0, 0.9, 0.3], [0, 1.08, 0.42], [0, 1.24, 0.42], [0, 1.36, 0.36]];
  for (let i = 0; i + 1 < neck.length; i++) P.add(metal, limb(neck[i].map((v, k) => (k === 1 ? v + y : v)), neck[i + 1].map((v, k) => (k === 1 ? v + y : v)), 0.07 - i * 0.012, 0.06 - i * 0.012, 8));
  B(0.075, 0.075, 0.1, 0, 1.38, 0.4, 8);
  P.add(metal, limb([0, y + 1.38, 0.48], [0, y + 1.34, 0.72], 0.025, 0.006, 6));
  B(0.04, 0.05, 0.05, 0, 1.44, 0.38, 6);
}
/** The sundial (rigui): a marble dial set in the plane of the equator on its pedestal, the gnomon through it toward the pole. */
export function sundial(P, lat = 40) {
  sumeru(P, 'marble', -0.75, -0.75, 0.75, 0.75, 1.3);
  // the support: a wedge whose sloping top lies just inside the dial's lower face
  const yt = (z) => 1.85 + z / Math.tan(lat * Math.PI / 180) - 0.07, w = [];
  const v = [[-0.2, 1.3, -0.3], [0.2, 1.3, -0.3], [0.2, 1.3, 0.25], [-0.2, 1.3, 0.25], [-0.2, yt(-0.3), -0.3], [0.2, yt(-0.3), -0.3], [0.2, yt(0.25), 0.25], [-0.2, yt(0.25), 0.25]];
  for (const [a, b, c, d] of [[0, 1, 2, 3], [4, 7, 6, 5], [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]]) w.push(...v[a], ...v[b], ...v[c], ...v[a], ...v[c], ...v[d]);
  P.add('marble', fromTriangles(orientOutward(w)));
  const tilt = -(90 - lat) * Math.PI / 180, put = (g) => { g.rotateX(tilt); g.translate(0, 1.85, 0); return g; };
  P.add('marble_smooth', put(lathe([[0.001, -0.06], [0.62, -0.06], [0.62, 0.06], [0.001, 0.06]], 24)));
  for (const s of [-1, 1]) { const r = torus(0.5, 0.012, 24, 3); r.translate(0, s * 0.06, 0); P.add('bronze', put(r)); }
  for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6, g = box(-0.012, -0.075, 0.42, 0.012, 0.075, 0.55); g.rotateY(a); P.add('bronze', put(g)); }
  P.add('iron', put(lathe([[0.012, -0.5], [0.012, 0.5], [0.001, 0.52]], 6)));
}
/** The grain measure (jialiang) in its little square shrine of marble on a pedestal, the bronze measure inside. */
export function jialiang(P) {
  sumeru(P, 'marble', -0.8, -0.8, 0.8, 0.8, 1.3);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add('marble', box(sx * 0.62 - 0.08, 1.3, sz * 0.62 - 0.08, sx * 0.62 + 0.08, 2.25, sz * 0.62 + 0.08));
  for (const [a, b] of [[[-0.7, -0.7], [0.7, -0.62]], [[-0.7, 0.62], [0.7, 0.7]], [[-0.7, -0.62], [-0.62, 0.62]], [[0.62, -0.62], [0.7, 0.62]]]) P.add('marble', box(a[0], 2.15, a[1], b[0], 2.3, b[1]));
  P.add('marble', box(-0.7, 2.3, -0.7, 0.7, 2.36, 0.7));
  P.add('bronze', lathe([[0.3, 0], [0.32, 0.05], [0.3, 0.42], [0.33, 0.46], [0.27, 0.46], [0.27, 0.12], [0.001, 0.12]], 16, null, 0, 1.3, 0));
  for (const sx of [-1, 1]) P.add('bronze', box(sx * 0.31, 1.62, -0.05, sx * 0.4, 1.68, 0.05));
  P.add('marble_smooth', frustum([-0.86, -0.86, 0.86, 0.86], 2.36, 2.46, 0, 0, 0, 0));
  P.add('marble_smooth', frustum([-0.86, -0.86, 0.86, 0.86], 2.46, 2.9, 0.72, 0.72, 0.72, 0.72));
  P.add('marble_smooth', lathe([[0.16, 0], [0.18, 0.06], [0.1, 0.14], [0.13, 0.24], [0.05, 0.34], [0.001, 0.38]], 10, null, 0, 2.88, 0));
}

// ── the balustrade ──────────────────────────────────────────────────────────────────────────────
/**
 * A post's carved head: 'dragon' (a column wound by a dragon), 'phoenix' (wings folded round it, a flame on top), 'lotus' (the Joseon bud).
 * About 100 triangles a post: the shaft one box, the head one lathe whose radius is swung by angle (a spiral
 * for the dragon's coils, three lobes for the phoenix's wings) so that few segments still read as carved.
 */
export function post(P, m, head, H = 0.98) {
  P.add(m, box(-0.11, 0, -0.11, 0.11, H, 0.11));
  if (head === 'lotus') { P.add(m, lathe([[0.125, H], [0.1, H + 0.06], [0.14, H + 0.2], [0.07, H + 0.36], [0.001, H + 0.42]], 6)); return; }
  if (head === 'beast') { P.add(m, box(-0.14, H, -0.14, 0.14, H + 0.06, 0.14)); return; }
  if (head === 'phoenix') {
    // cap, neck, the folded wings (three lobes), the crown and flame, in one lathe
    P.add(m, lathe([[0.125, H], [0.105, H + 0.05], [0.14, H + 0.2], [0.1, H + 0.4], [0.12, H + 0.44], [0.05, H + 0.54], [0.001, H + 0.68]], 6, (th, i) => (i >= 2 && i <= 3 ? 1 + 0.32 * Math.cos(th * 3) : 1)));
  } else {
    // cap and a column wound by the dragon: rings of the body swung round by the spiral
    P.add(m, lathe([[0.125, H], [0.1, H + 0.05], [0.12, H + 0.13], [0.1, H + 0.21], [0.12, H + 0.29], [0.1, H + 0.37], [0.125, H + 0.44], [0.05, H + 0.52], [0.001, H + 0.57]], 8, (th, i) => (i >= 2 && i <= 5 ? 1 + 0.3 * Math.cos(th - i * 1.6) : 1)));
  }
}
/**
 * A carved balustrade from a to b at height y (Qing: o.carve 'qing'; Joseon: 'joseon'): posts every
 * `step` with carved heads (dragon and phoenix by turns; the Joseon lotus bud, and stone beasts at
 * the ends of runs when o.beasts); between them the sill, the lower panel framed and carved with a
 * medallion, the cloud band, the vase-shaped balusters with their cloud caps, the round handrail.
 * Returns the distances of the posts along the run (for the spouts below them).
 */
export function balustradeCarved(bag, col, a, b, y, open, o = {}) {
  const step = o.step ?? 1.6, m = o.mat ?? 'marble_smooth', joseon = o.carve === 'joseon';
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = -uz, nz = ux;
  const Pt = (s) => [a[0] + ux * s, a[1] + uz * s];
  const isOpen = (s) => open.some(([f, t]) => s > f && s < t);
  // the posts at an even `step` from the middle of the run, the odd remainder shared between its two end bays: so that the bays
  // of every run, tier and side are one shape (instanced once: a draw for all of them, not one for each run's own length)
  const n = Math.max(1, Math.round(L / step)), e = L - n * step, rot = yawOf(ux, uz) - Math.PI / 2, posts = [];
  const sp = Array.from({ length: n + 1 }, (_, k) => (k === 0 ? 0 : k === n ? L : n === 1 ? L : k * step + e / 2));
  let runStart = null;
  for (let k = 0; k <= n; k++) {
    const s = sp[k], p = Pt(s), lPrev = k > 0 ? s - sp[k - 1] : step, lNext = k < n ? sp[k + 1] - s : step, l = lNext;
    if (isOpen(s)) { if (runStart !== null) { col.segment(Pt(runStart), Pt(sp[k - 1]), 0.3, y, y + 1.1); runStart = null; } continue; }
    if (runStart === null) runStart = s;
    const end = k === 0 || k === n || isOpen(s + lNext * 0.5) || isOpen(s - lPrev * 0.5);
    const head = joseon ? (o.beasts && end ? 'beast' : 'lotus') : (k % 2 ? 'phoenix' : 'dragon');
    const corner = o.skipEnds && (k === 0 || k === n);              // the corner post is the other side's
    if (!corner) {
      const PP = new Parts(); post(PP, m, head); PP.emit(bag, p[0], y, p[1]);
      if (head === 'beast') { const BB = new Parts(); seated(BB, m, { bell: false, lite: true }); BB.emit(bag, p[0], y + 1.04, p[1], 0, 0.22); }
    }
    posts.push(s);
    if (k < n && !isOpen(s + l * 0.5)) {
      // the bay, built at the origin along +x, turned onto the run and moved (bays of one run share their shape)
      const t = [], l0 = 0.1, l1 = l - 0.1, at = (u, w) => [u, 0, w], beam = (u0, u1, y0, h, w) => beamTris(t, [u0, y0, 0], [u1, y0, 0], w, h, true);
      beam(l0, l1, 0, 0.1, 0.14);                                // the sill
      beam(l0, l1, 0.1, 0.4, 0.075);                             // the panel (its frame's 1.5 cm relief is not worth six triangles a bay)
      beam(l0, l1, 0.5, 0.06, 0.055);                            // the cloud band
      const BP = new Parts(); BP.add(m, fromTriangles(t));
      if (!joseon) for (const sg of [-1, 1]) BP.add(m, T(ball((l1 - l0) * 0.3, 0.12, 0.025, 6, 2), l / 2, 0.3, sg * 0.075));   // the carved medallion
      BP.emit(bag, p[0], y, p[1], rot);
      // the openwork above (balusters with their cloud caps, the handrail) as pieces of their own, each under 10 cm across: the engine
      // draws such thin pieces within 100 m only, so that from afar the bay is the solid panel (which it can coarsen) and not an
      // openwork it cannot (a vase baluster and a gap beside it keep the whole bay's outline from matching a coarse version)
      for (const j of [1, 2]) {
        const u = l0 + (l1 - l0) * j / 3, VP = new Parts();
        VP.add(m, lathe([[0.04, 0], [0.047, 0.09], [0.026, 0.18], [0.045, 0.2]].map(([r, yy]) => [r, yy + 0.56]), 6, null, u, 0, 0));
        const c = []; beamTris(c, [u - 0.12, 0, 0], [u + 0.12, 0, 0], 0.045, 0.075, true); VP.add(m, T(fromTriangles(c), 0, 0.76, 0));
        VP.emit(bag, p[0], y, p[1], rot);
      }
      const HP = new Parts(); HP.add(m, limb([l0 - 0.06, 0.86, 0], [l1 + 0.06, 0.86, 0], 0.045, 0.045, 6)); HP.emit(bag, p[0], y, p[1], rot);
      void at;
    }
  }
  if (runStart !== null) col.segment(Pt(runStart), b, 0.3, y, y + 1.1);
  void nx; void nz;
  return posts;
}
/** A dragon-head spout (chishou) jutting from a terrace's face, facing +z, its throat the drain. */
export function spout(P, m = 'marble_smooth') {
  // (about 110 triangles: a thousand of them line the terraces; the stub's back and top are in the wall and the head, the eyes and horns are the least that read)
  P.add(m, frustum([-0.12, 0, 0.12, 0.34], -0.15, 0.1, 0, 0, 0, 0, { noZn: true }));
  P.add(m, limb([0, -0.02, 0.3], [0, -0.05, 0.7], 0.11, 0.075, 5));
  P.add(m, T(ball(0.1, 0.05, 0.07, 6, 2), 0, 0.03, 0.68)); P.add(m, T(ball(0.075, 0.035, 0.13, 6, 2), 0, -0.12, 0.6));
  for (const sx of [-1, 1]) { P.add(m, T(ball(0.035, 0.035, 0.035, 4, 2), sx * 0.09, 0.06, 0.42)); P.add(m, limb([sx * 0.06, 0.08, 0.3], [sx * 0.09, 0.13, 0.02], 0.035, 0.018, 3)); }
}

// ── the roof's ornaments ───────────────────────────────────────────────────────────────────────
/** The height of a rectRoof (src/styles/ming/) at (x, z) in its own frame, and the frame's turn: the same formula. */
function roofFrame(r) {
  const [cx, cz] = r.c, A = r.A, B = r.B, y = r.y, R = r.rise, sw = r.sweep ?? 0.9, kind = r.kind || 'xieshan', p = r.p ?? 1.7, gAt = r.gableAt ?? 0.42;
  const rot = (x, z) => (r.alongZ ? [cx - (z - cz), cz + (x - cx)] : [x, z]);
  const H = (x, z, off = 0) => {
    const ax = Math.abs(x - cx), az = Math.abs(z - cz), ts = Math.max(0, Math.min(1, (B - az) / B));
    let te = kind === 'gable' ? 9 : Math.max(0, (A - ax) / B);
    if (kind === 'xieshan' && te > gAt) te = 9;
    const t = Math.min(ts, te), corner = kind === 'gable' ? 0 : Math.max(0, 1 - te / 0.5) * Math.max(0, 1 - ts / 0.5);
    return y + R * Math.pow(t, p) + sw * corner * corner + off;
  };
  return { cx, cz, A, B, R, kind, gAt, rot, H, top: y + R, dir: (dx, dz) => (r.alongZ ? [-dz, dx] : [dx, dz]) };
}
/** A little roof figure, about 1 high: the immortal riding a bird ('rider'), the Tang monk ('monk'), a seated beast ('beast'), the hip-end beast's head ('end'). */
function figure(P, m, kind) {
  const B = (rx, ry, rz, x, y, z) => P.add(m, T(ball(rx, ry, rz, 6, 4), x, y, z));
  const limb6 = (a, b, r0, r1) => limb(a, b, r0, r1, 5);
  if (kind === 'rider') {
    B(0.3, 0.2, 0.4, 0, 0.22, 0); B(0.12, 0.12, 0.12, 0, 0.46, 0.4); B(0.2, 0.07, 0.34, 0, 0.3, -0.42);
    P.add(m, limb6([0, 0.36, 0], [0, 0.78, 0], 0.16, 0.12)); B(0.12, 0.12, 0.12, 0, 0.9, 0.02); B(0.15, 0.05, 0.15, 0, 1.0, 0);
  } else if (kind === 'monk') {
    B(0.26, 0.3, 0.24, 0, 0.3, 0); P.add(m, limb6([0, 0.4, 0], [0, 0.72, 0.02], 0.2, 0.14)); B(0.13, 0.14, 0.13, 0, 0.86, 0.04); B(0.18, 0.05, 0.18, 0, 0.98, 0.02);
  } else {
    const k = kind === 'end' ? 1.25 : 1;
    B(0.25, 0.25, 0.3, 0, 0.24, -0.08); P.add(m, limb6([0, 0.26, 0], [0, 0.64, 0.12], 0.2, 0.16));
    B(0.17 * k, 0.16 * k, 0.2 * k, 0, 0.78, 0.18); B(0.1 * k, 0.08 * k, 0.11 * k, 0, 0.74, 0.35);
    for (const sx of [-1, 1]) P.add(m, limb6([sx * 0.1, 0.5, 0.14], [sx * 0.1, 0.02, 0.2], 0.05, 0.045));
    B(0.05, 0.14 * k, 0.1, 0, 0.94, 0.12);
    if (kind === 'end') for (const sx of [-1, 1]) P.add(m, limb6([sx * 0.08, 0.9, 0.12], [sx * 0.14, 1.12, -0.06], 0.04, 0.015));
  }
}
/** The ridge-end ornament (the Qing zhengwen, the Joseon chwidu), h high, its mouth (−u side) swallowing the ridge: built in u (x) and up (y). */
function ridgeEnd(P, m, h, joseon) {
  const s = new Shape(), pts = joseon
    ? [[-0.4, 0], [0.36, 0], [0.4, 0.3], [0.32, 0.62], [0.2, 0.86], [0.02, 1.0], [-0.24, 0.96], [-0.4, 0.8], [-0.5, 0.6], [-0.3, 0.52], [-0.34, 0.3], [-0.42, 0.14]]
    : [[-0.42, 0], [0.38, 0], [0.42, 0.25], [0.36, 0.48], [0.42, 0.58], [0.33, 0.68], [0.37, 0.8], [0.3, 0.86], [0.44, 0.94], [0.36, 1.04], [0.2, 0.98], [0.08, 1.0], [-0.14, 0.97], [-0.28, 0.86], [-0.3, 0.6], [-0.44, 0.44], [-0.2, 0.3], [-0.44, 0.14]];
  s.moveTo(pts[0][0] * h, pts[0][1] * h); for (const [u, v] of pts.slice(1)) s.lineTo(u * h, v * h); s.lineTo(pts[0][0] * h, pts[0][1] * h);
  const th = 0.28 * h, g = new ExtrudeGeometry(s, { depth: th, bevelEnabled: false });
  g.translate(0, 0, -th / 2); P.add(m, g);
  for (const sz of [-1, 1]) {
    P.add(m, T(ball(0.07 * h, 0.07 * h, 0.03 * h, 8), -0.2 * h, 0.52 * h, sz * th / 2));                   // the eye
    if (!joseon) { const r = torus(0.11 * h, 0.022 * h, 12, 3); r.rotateX(Math.PI / 2); P.add(m, T(r, 0.18 * h, 0.82 * h, sz * th / 2)); }   // the curl of the tail
  }
  if (!joseon) {
    P.add(m, limb([0.06 * h, 0.9 * h, 0], [0.16 * h, 1.22 * h, 0], 0.05 * h, 0.04 * h, 6));                  // the sword hilt
    P.add(m, T(ball(0.08 * h, 0.08 * h, 0.07 * h, 8), 0.42 * h, 0.38 * h, 0));                               // the beast on its back
  }
}
/**
 * The ornaments of one rectRoof (r: its parameters): the ridge-end ornaments (o.ends), the rows of
 * figures on the hips (o.figures: how many beasts; o.lead: the leading figure; o.reach: how far up
 * the hips, as a fraction), white-plastered ridge sides (o.white, Joseon), and for a xieshan the
 * ridge carried on to the gables under the ornaments.
 */
export function roofOrnaments(bag, r, o) {
  const F = roofFrame(r), mat = o.mat ?? 'tile_yellow', joseon = !!o.joseon, sc = o.scale ?? Math.round(Math.max(0.22, Math.min(0.45, F.B * 0.03)) / 0.05) * 0.05;
  const L = F.kind === 'gable' ? F.A : F.A - F.B, xg = F.kind === 'xieshan' ? F.A - F.gAt * F.B - 0.05 : L + 0.3;
  if (o.ends !== false && F.kind !== 'gable') {
    // the ridge carried on to the gables (xieshan), then the ornament at each end, wholly on the ridge
    const h = o.endH ?? Math.max(0.8, Math.min(3.4, F.B * 0.24)) * (joseon ? 0.6 : 1);
    for (const s of [-1, 1]) {
      if (F.kind === 'xieshan' && xg > L + 0.3) { const t = [], e0 = F.rot(F.cx + s * (L + 0.2), F.cz), e1 = F.rot(F.cx + s * xg, F.cz); beamTris(t, [e0[0], F.top - 0.08, e0[1]], [e1[0], F.top - 0.08, e1[1]], 0.16, 0.42); bag.add(mat, fromTriangles(t)); }
      const P = new Parts(); ridgeEnd(P, mat, h, joseon);
      const u = F.cx + s * (xg - 0.4 * h), e = F.rot(u, F.cz), d = F.dir(s, 0);
      P.emit(bag, e[0], F.top + 0.3, e[1], Math.atan2(-d[1], d[0]));
    }
  }
  if (o.white) {
    // the sides of the ridges plastered white, the tiles' dark cap left showing above (yangseong)
    const t = [], a0 = F.rot(F.cx - xg, F.cz), a1 = F.rot(F.cx + xg, F.cz);
    beamTris(t, [a0[0], F.top - 0.14, a0[1]], [a1[0], F.top - 0.14, a1[1]], 0.19, 0.4);
    for (const s of [-1, 1]) for (const sz of [-1, 1]) {
      const tEnd = F.kind === 'xieshan' ? F.gAt : 1, pts = [];
      for (let k = 0; k <= 12; k++) { const tt = tEnd * k / 12, x = F.cx + s * (F.A - tt * F.B), z = F.cz + sz * (F.B - tt * F.B), w = F.rot(x, z); pts.push([w[0], F.H(x, z, 0.05), w[1]]); }
      for (let k = 0; k + 1 < pts.length; k++) beamTris(t, pts[k], pts[k + 1], 0.1, 0.14);
    }
    bag.add('plaster_white', fromTriangles(t));
  }
  const nF = o.figures ?? 0;
  if (!nF) return;
  const kinds = [o.lead ?? (joseon ? 'monk' : 'rider'), ...Array(nF).fill('beast'), ...(joseon ? [] : ['end'])];
  const gap = sc * 1.25, reach = o.reach ?? 0.6, tMax = F.kind === 'xieshan' ? F.gAt : 1;
  for (const s of [-1, 1]) for (const sz of [-1, 1]) {
    // walk up the hip from its tip, setting the figures at even distances along it
    const at = (tt) => { const x = F.cx + s * (F.A - tt * F.B), z = F.cz + sz * (F.B - tt * F.B), w = F.rot(x, z); return [w[0], F.H(x, z, 0.2), w[1]]; };
    const lim = (o.tLimit ?? tMax) * reach, d = F.dir(s, sz), yaw = yawOf(d[0], d[1]);
    let prev = at(0), dist = 0, next = gap * 0.7, i = 0;
    for (let k = 1; k <= 400 && i < kinds.length; k++) {
      const q = at(lim * k / 400); dist += Math.hypot(q[0] - prev[0], q[1] - prev[1], q[2] - prev[2]); prev = q;
      if (dist >= next) { const P = new Parts(); figure(P, mat, kinds[i]); P.emit(bag, q[0], q[1] - 0.03, q[2], yaw, sc * (kinds[i] === 'end' ? 1.5 : 1)); i++; next += kinds[i] === 'end' ? gap * 1.4 : gap; }
    }
  }
}

// ── gate leaves ─────────────────────────────────────────────────────────────────────────────────
/**
 * gate_doors: the two leaves of a gate standing open { at [x, z], along ('x' | 'z': the way the wall
 * runs), w (the opening), h, y, swing (±1: the side they open to), off (the hinge line's distance
 * from `at` toward that side), nails (rows and columns: 9 on the imperial gates), mat }: red lacquer,
 * gilt nails in rows on the face that is outward when shut, a gilt mask with its ring on each leaf.
 */
export function gateDoors(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, w = el.w, h = el.h - 0.08, sw = el.swing ?? 1, off = el.off ?? 0, nN = el.nails ?? 9, mat = el.mat ?? 'lacquer_red';
  const alongX = el.along !== 'z', lw = w / 2 - 0.06, th = Math.min(0.2, 0.025 * h + 0.04);
  // in a frame where u runs along the wall and v across it (toward the swing)
  const W = (u, v) => (alongX ? [x + u, z + v * sw] : [x + v * sw, z + u]);
  for (const su of [-1, 1]) {
    const uc = su * (w / 2 - 0.04 - th / 2), v0 = off, v1 = off + lw;
    const p0 = W(uc - th / 2, v0), p1 = W(uc + th / 2, v1);
    bag.add(mat, box(Math.min(p0[0], p1[0]), y, Math.min(p0[1], p1[1]), Math.max(p0[0], p1[0]), y + h, Math.max(p0[1], p1[1])));
    col.rect([Math.min(p0[0], p1[0]), Math.min(p0[1], p1[1]), Math.max(p0[0], p1[0]), Math.max(p0[1], p1[1])], y, y + h);
    // the face toward the passage's middle (the outer face when the gate is shut): the nails, the mask and ring
    const uf = uc - su * th / 2, r = Math.min(0.09, lw / (nN * 2.6)), face = alongX ? [-su, 0] : [0, -su];
    for (let i = 0; i < nN; i++) for (let j = 0; j < nN; j++) {
      const v = v0 + lw * (j + 0.5) / nN, yy = y + h * (0.1 + 0.8 * i / Math.max(1, nN - 1)), q = W(uf, v);
      const g = lathe([[r, 0], [r * 0.8, r * 0.5], [0.001, r * 0.9]], 6);
      g.rotateZ(-Math.PI / 2); g.rotateY(yawOf(face[0], face[1]) - Math.PI / 2);
      bag.add('gilt_bronze', T(g, q[0], yy, q[1]));
    }
    const P = new Parts(), q = W(uf, v0 + lw * 0.86);
    P.add('gilt_bronze', T(ball(0.2, 0.22, 0.05, 10), 0, 0, 0)); P.add('gilt_bronze', T(ball(0.06, 0.06, 0.06, 6), -0.08, 0.06, 0.04)); P.add('gilt_bronze', T(ball(0.06, 0.06, 0.06, 6), 0.08, 0.06, 0.04));
    const ring = torus(0.15, 0.022, 14, 4); ring.rotateX(Math.PI / 2); P.add('gilt_bronze', T(ring, 0, -0.2, 0.06));
    P.emit(bag, q[0], y + h * 0.5, q[1], yawOf(face[0], face[1]));
  }
}
