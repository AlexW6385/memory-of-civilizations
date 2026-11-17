// The things of a patio group's court (docs/settlements/maya-tikal.md §13): the raised drying rack with maize, the midden behind the group,
// the row of log hives of stingless bees under a lean-to. The east shrine is built in index.js (it needs the palace range).

import { box, lathe, rod } from '../../core/geom.js';
import { frame, frust, hex, rng, L, LIME } from './kit.js';

/** k_tapesco { at [x, z], y, rot?, seed }: a drying rack of poles on four posts at 1.1 m, a heap of maize ears on it, strings of chiles hung from its rail. */
export function tapesco(el, { bag, col }) {
  const [cx, cz] = el.at, y = el.y ?? 0.1, w = 2.6, d = 1.3, rand = rng(el.seed ?? 3);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const x = cx + sx * (w / 2 - 0.1), z = cz + sz * (d / 2 - 0.1); bag.add('timber', rod([x, y, z], [x, y + 1.25, z], 0.06, 5)); col.circle(x, z, 0.08, y, y + 1.3); }
  for (const sz of [-1, 1]) bag.add('timber', box(cx - w / 2, y + 1.05, cz + sz * (d / 2 - 0.1) - 0.04, cx + w / 2, y + 1.13, cz + sz * (d / 2 - 0.1) + 0.04));
  for (let i = 0; i < 9; i++) { const x = cx - w / 2 + 0.15 + i * (w - 0.3) / 8; bag.add('wood_ochre', rod([x, y + 1.12, cz - d / 2 + 0.1], [x, y + 1.12, cz + d / 2 - 0.1], 0.025, 4)); }
  for (let i = 0; i < 14; i++) {                                                  // the maize ears, in a low heap, husks pulled back
    const x = cx - w / 2 + 0.3 + rand() * (w - 0.6), z = cz + (rand() - 0.5) * (d - 0.4), a = rand() * 3.14;
    const g = box(-0.13, 0, -0.03, 0.13, 0.06, 0.03); g.rotateY(a); bag.add(i % 4 === 0 ? 'cloth_white' : 'cloth_ochre', g.translate(x, y + 1.14 + (rand() < 0.4 ? 0.06 : 0), z));
  }
  for (const [x, c] of [[cx - 0.6, 'cloth_red'], [cx + 0.7, 'cloth_red']]) { bag.add('rope_fibre', rod([x, y + 1.05, cz + d / 2 - 0.1], [x, y + 0.55, cz + d / 2 - 0.1], 0.012, 4)); bag.add(c, box(x - 0.06, y + 0.45, cz + d / 2 - 0.16, x + 0.06, y + 0.57, cz + d / 2 - 0.04)); }
  col.rect([cx - w / 2, cz - d / 2, cx + w / 2, cz + d / 2], y + 1.0, y + 1.15);
}

/** k_midden { at [x, z], seed }: the refuse heap behind a group: a mound of ash-grey earth and rubble, sherds of dark pottery, bones, weeds. Low, walked over. */
export function midden(el, { bag }) {
  const [cx, cz] = el.at, rand = rng(el.seed ?? 5), r = el.r ?? 1.3;
  bag.add('rubble', lathe([[r, -0.3], [r, 0.02], [r * 0.7, 0.2], [r * 0.35, 0.34], [0.001, 0.38]], 10, null, cx, 0, cz));
  for (let i = 0; i < 16; i++) { const a = rand() * 6.28, d = rand() * r * 0.75, h = 0.38 * (1 - d / (r * 0.9)) + 0.03, g = box(-0.07, 0, -0.05, 0.07, 0.03, 0.05); g.rotateY(rand() * 3); bag.add(i % 3 ? 'pottery_dark' : 'chalk', g.translate(cx + Math.cos(a) * d, Math.max(0.04, h), cz + Math.sin(a) * d)); }
  for (let i = 0; i < 5; i++) { const a = rand() * 6.28, d = r * (0.8 + rand() * 0.25); bag.add('stucco_leaf', rod([cx + Math.cos(a) * d, 0, cz + Math.sin(a) * d], [cx + Math.cos(a) * d * 0.95, 0.35 + rand() * 0.2, cz + Math.sin(a) * d * 0.95 + 0.05], 0.015, 3)); }
}

/** k_hives { at [x, z], y, rot?: 0 | 1 (long in x | z) }: log hives of stingless bees — four hollow logs laid on a rack, each sealed with a round stone, under a thatched lean-to. */
export function hives(el, { bag, col }) {
  const [cx, cz] = el.at, y = el.y ?? 0.1, w = 3.0, d = 0.9, F = frame(el.rot ? 'w' : 's', cx, cz), P = (u, v) => F.P(u, v);
  for (const v of [-w / 2, w / 2]) for (const u of [-0.3, 0.3]) { const p = P(u, v), q = P(u * 0.4 - 0.1, v); bag.add('timber', rod([p[0], y, p[1]], [p[0], y + 1.0, p[1]], 0.05, 5)); void q; }
  for (const u of [-0.3, 0.3]) { const a = P(u, -w / 2), b = P(u, w / 2); bag.add('timber', rod([a[0], y + 0.45, a[1]], [b[0], y + 0.45, b[1]], 0.04, 5)); }
  for (let i = 0; i < 4; i++) {
    const v = -w / 2 + 0.4 + i * (w - 0.8) / 3, a = P(-0.34, v), b = P(0.34, v);
    bag.add('wood_dark', rod([a[0], y + 0.62, a[1]], [b[0], y + 0.62, b[1]], 0.13, 8));
    const c = P(-0.36, v); bag.add('limestone_maya', rod([c[0] + F.U[0] * 0.0, y + 0.62, c[1]], [c[0] - F.U[0] * 0.04, y + 0.62, c[1] - F.U[1] * 0.04], 0.12, 8));   // the stone disc at the front end
  }
  const lo = y + 1.0, hi = y + 1.45, A = P(-0.7, -w / 2 - 0.3), B = P(-0.7, w / 2 + 0.3), C = P(0.5, w / 2 + 0.3), D = P(0.5, -w / 2 - 0.3);
  hex(bag, 'thatch_palm', [[A[0], lo - 0.1, A[1]], [B[0], lo - 0.1, B[1]], [C[0], hi - 0.1, C[1]], [D[0], hi - 0.1, D[1]], [A[0], lo, A[1]], [B[0], lo, B[1]], [C[0], hi, C[1]], [D[0], hi, D[1]]]);
  const r = [Math.min(...[A, B, C, D].map((p) => p[0])), Math.min(...[A, B, C, D].map((p) => p[1])), Math.max(...[A, B, C, D].map((p) => p[0])), Math.max(...[A, B, C, D].map((p) => p[1]))];
  col.rect([r[0] + 0.3, r[1] + 0.3, r[2] - 0.3, r[3] - 0.3], y, y + 1.4);
}
void LIME; void L; void frust;
