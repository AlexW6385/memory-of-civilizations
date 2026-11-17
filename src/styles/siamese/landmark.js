// The landmark's finer parts (docs/settlements/ayutthaya.md §12.6): the redented prang of the Prasat Phra Narai with its antefixes and
// garudas, and the little gabled porch roof of a chedi's niche. Existing palette materials only; every piece is added to the bag so the tile
// merges them per material.

import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { pinnacle as pin0 } from './detail.js';
const pinnacle = (bag, m, x, y, z, a, h) => pin0(bag, m, x, y, z, a * jit(x, z), h * jit(z, x));

/** A garuda (the king's mount, the supporter of the tower) in gilt stucco, standing at (x, y, z), facing `yaw`, about 1.5 m high at s = 1. */
export const jit = (x, z) => 1 + (Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1) * 0.006;
export function garuda(bag, x, y, z, yaw, s = 1) {
  s *= jit(x, z);
  const M = 'clay_gilt', parts = [];
  const add = (m, g) => parts.push([m, g]);
  // the plinth, the legs, the torso with its belly band, the head with the beak and the crown, the raised arms, the wings
  add('lime_plaster', box(-0.4, 0, -0.3, 0.4, 0.14, 0.3));
  for (const sx of [-1, 1]) add(M, rod([sx * 0.13, 0.14, 0], [sx * 0.15, 0.62, 0.02], 0.065, 5));
  add(M, lathe([[0.18, 0.55], [0.3, 0.62], [0.32, 0.95], [0.27, 1.25], [0.12, 1.38]], 8));
  add('gold', lathe([[0.31, 0.64], [0.33, 0.7], [0.31, 0.76]], 8));
  add(M, lathe([[0.001, 1.3], [0.15, 1.36], [0.16, 1.52], [0.001, 1.58]], 7));
  add('gold', lathe([[0.07, 0], [0.001, 0.26]], 5).rotateX(Math.PI / 2).translate(0, 1.44, 0.14));       // the beak
  add('gold', lathe([[0.15, 0], [0.1, 0.18], [0.001, 0.46]], 6, null, 0, 1.56, 0));                                                    // the crown
  for (const sx of [-1, 1]) { add(M, rod([sx * 0.27, 1.15, 0], [sx * 0.62, 1.5, 0.05], 0.05, 5)); add(M, rod([sx * 0.62, 1.5, 0.05], [sx * 0.7, 1.9, 0.05], 0.045, 5)); }
  const t = [];
  for (const sx of [-1, 1]) {
    const a = [sx * 0.22, 1.15, -0.1], f = [[sx * 0.95, 1.7, -0.14], [sx * 1.2, 1.3, -0.14], [sx * 1.15, 0.85, -0.14], [sx * 0.85, 0.55, -0.12]];
    for (let i = 0; i + 1 < f.length; i++) t.push(...a, ...f[i], ...f[i + 1], ...a, ...f[i + 1], ...f[i]);
  }
  add(M, fromTriangles(t));
  for (const [m, g] of parts) { g.scale(s, s, s); g.rotateY(yaw); g.translate(x, y, z); bag.add(m, g); }
}

/**
 * prang: the corn-cob tower of Ayutthaya (as at Wat Ratchaburana and Wat Mahathat): tiers of a square plan with redented corners, each a
 * storey in miniature with a niche and an antefix (a small spired shrine) at the middle of each face and a corner spire at each notch, the
 * tiers shrinking by a curve; then the lotus bud and the gilded finial. Returns the height reached.
 */
export function prang(bag, cx, cz, y0, r0, n = 9) {
  let r = r0, y = y0;
  for (let i = 0; i < n; i++) {
    const h = 1.8 * (1 - 0.07 * i), alt = i % 2 ? 'lime_plaster' : 'plaster_white';
    bag.add(alt, box(cx - r, y, cz - r * 0.74, cx + r, y + h, cz + r * 0.74));
    bag.add(alt, box(cx - r * 0.74, y, cz - r, cx + r * 0.74, y + h - 0.04, cz + r));
    bag.add('plaster_white', box(cx - r * 0.88, y, cz - r * 0.88, cx + r * 0.88, y + h - 0.09, cz + r * 0.88));
    // the cornice of the storey, in the same redented plan
    const e = r * 0.06;
    bag.add('lime_plaster', box(cx - r - e, y + h, cz - r * 0.74 - e, cx + r + e, y + h + 0.16, cz + r * 0.74 + e));
    bag.add('lime_plaster', box(cx - r * 0.74 - e, y + h, cz - r - e, cx + r * 0.74 + e, y + h + 0.15, cz + r + e));
    // the antefix: a framed niche on each face with a dark opening, a spired shrine above on the cornice
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const q = r + 0.02, w2 = r * 0.2, nh = h * 0.62, py = y + h * 0.12;
      const fr = (d0, d1, u0, u1, ya, yb) => (dx ? box(cx + dx * q + Math.min(d0, d1) * dx, ya, cz + u0, cx + dx * q + Math.max(d0, d1) * dx, yb, cz + u1) : box(cx + u0, ya, cz + dz * q + Math.min(d0, d1) * dz, cx + u1, yb, cz + dz * q + Math.max(d0, d1) * dz));
      bag.add('lime_plaster', fr(0, 0.07, -w2 - 0.06, w2 + 0.06, py - 0.05, py + nh + 0.08));
      bag.add('opening', fr(0.06, 0.1, -w2, w2, py, py + nh));
      pinnacle(bag, i % 2 ? 'plaster_white' : 'lime_plaster', cx + dx * (r - 0.02) * 0.995, y + h + 0.15, cz + dz * (r - 0.02) * 0.995, 0.09 + r * 0.04, 0.55 + r * 0.22);
    }
    // the corner spires of the notches
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) pinnacle(bag, alt, cx + sx * r * 0.77, y + h - 0.09, cz + sz * r * 0.77, 0.08 + r * 0.05, 0.5 + r * 0.18);
    y += h + 0.16; r *= 0.86 - 0.012 * i;
  }
  // the bud (the lotus), the ring, the gilded finial with its vajra
  bag.add('plaster_white', lathe([[r * 1.0, 0], [r * 1.12, 0.35], [r * 0.9, 0.8], [r * 0.55, 1.5], [0.001, 2.2]], 8, null, cx, y, cz));
  bag.add('gold', lathe([[0.12, 0], [0.2, 0.15], [0.1, 0.4], [0.07, 1.4], [0.04, 2.4], [0.001, 3.2]], 8, null, cx, y + 2.1, cz));
  for (const a of [0, 1, 2]) { const t = a / 3 * Math.PI * 2; bag.add('gold', rod([cx, y + 3.0, cz], [cx + Math.cos(t) * 0.38, y + 4.0, cz + Math.sin(t) * 0.38], 0.025, 4)); }
  return y + 5.2 - y0;
}

/** The gabled roof of a chedi's niche porch: tile over the porch, ridge outward, a red board with gilt bargeboards at the front, a finial. rect: the porch; (dx, dz) outward. */
export function porchRoof(bag, gable, rect, y, rise, over, dx, dz, k) {
  gable(bag, 'roof_tile', rect, y, rise, over, dx ? 'x' : 'z', 0.18 * k + 0.04);
  if (k < 0.6) return;
  const [x0, z0, x1, z1] = rect, A = !!dx, u = A ? (dx > 0 ? x1 + over : x0 - over) + dx * 0.02 : (dz > 0 ? z1 + over : z0 - over) + dz * 0.02, dir = A ? dx : dz;
  const v0 = (A ? z0 : x0) - over, v1 = (A ? z1 : x1) + over, vm = (v0 + v1) / 2;
  const P = (uu, v, h) => (A ? [uu, y + h, v] : [v, y + h, uu]);
  const T = [], a = P(u, v0, 0), b = P(u, vm, rise), c = P(u, v1, 0);
  T.push(...a, ...b, ...c, ...a, ...c, ...b);
  bag.add('timber_red', fromTriangles(T));
  const uo = u + dir * 0.03;
  for (const [p, q] of [[v0, vm], [v1, vm]]) bag.add('clay_gilt', rod(P(uo, p, 0), P(uo, q, rise), 0.04 * k + 0.01, 4));
  bag.add('gold', rod(P(uo, vm, rise * 0.15), P(uo, vm, rise * 0.62), 0.03 * k + 0.01, 4));
  bag.add('gold', lathe([[0.001, 0], [0.07 * k, 0.04], [0.001, 0.35 * k + 0.1]], 5, null, ...P(uo, vm, rise)));
}
