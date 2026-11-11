// The furnished chambers of Esagila's ranges round the court (docs/settlements/babylon.md §13.2): the temple's storehouse, its
// scriptorium (the temple's tablets), the kitchen where the god's meals were prepared, the treasury, the bakehouse, and the
// room where the priests purified themselves and put on white linen. Each room opens on the court through a door in a
// wall 1.2 m thick; built in a frame turned to that door (as the houses', see shop.js).
import { box, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import { frameOf } from './shop.js';

const JAR = [[0.001, 0], [0.1, 0], [0.16, 0.06], [0.24, 0.26], [0.25, 0.42], [0.17, 0.6], [0.09, 0.68], [0.11, 0.74], [0.08, 0.75], [0.07, 0.7], [0.001, 0.68]];
const BOWL = [[0.001, 0], [0.06, 0.005], [0.14, 0.06], [0.13, 0.065], [0.001, 0.02]];
const sc = (p, s) => p.map(([r, y]) => [r * s, y * s]);
const SACK = [[0.001, 0], [0.22, 0.02], [0.26, 0.25], [0.22, 0.5], [0.08, 0.6], [0.001, 0.6]];
const BASKET = [[0.001, 0], [0.2, 0], [0.24, 0.2], [0.22, 0.22], [0.18, 0.04], [0.001, 0.04]];
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** The room r = [x0, z0, x1, z1] (its inside), its door on face f; ceiling at yc. */
export function furnishRoom(kind, r, f, { bag, col, lights }, yc = 4.6) {
  const { U, V, W, R, LP } = frameOf(r, f), rand = rng(Math.floor(r[0] * 7 + r[1] * 13) + 11);
  const B = (mat, u0, v0, u1, v1, y0, y1) => { const q = R(u0, v0, u1, v1); bag.add(mat, box(q[0], y0, q[1], q[2], y1, q[3])); return q; };
  const Bc = (mat, u0, v0, u1, v1, y0, y1) => { const q = B(mat, u0, v0, u1, v1, y0, y1); col.rect(q, y0, y1); };
  const L = (mat, prof, u, v, y, seg = 10) => { const [x, z] = W(u, v); bag.add(mat, lathe(prof, seg, null, x, y, z)); };
  const beam = (mat, a, b, w, h) => { const T = []; beamTris(T, a, b, w, h); bag.add(mat, fromTriangles(T)); };
  const circ = (u, v, rr, y1) => { const [x, z] = W(u, v); col.circle(x, z, rr, 0, y1); };
  // floor, mats, ceiling of cedar beams, a lamp
  B('brick_baked', 0, 0, U, V, -0.3, 0.06); col.floor(r, 0.06);
  for (let u = 0.5; u < U - 0.3; u += 0.9) beam('cedar', LP(u, 0.1, yc - 0.28), LP(u, V - 0.1, yc - 0.28), 0.14, 0.4);
  B('cedar', 0, 0, U, V, yc - 0.06, yc);
  lights.push({ at: LP(U / 2, V / 2, yc - 1.0), color: kind === 'kitchen' || kind === 'bakehouse' ? '#ff9a4a' : '#ffb46b', intensity: 3.2, distance: 10 });
  const back = V - 0.1, shelf = (u0, u1, v, y, rows) => { for (let k = 0; k < rows; k++) B('timber', u0, v - 0.45, u1, v, y + k * 0.75, y + k * 0.75 + 0.05); for (const u of [u0, u1 - 0.07]) B('timber', u, v - 0.45, u + 0.07, v, y, y + (rows - 1) * 0.75 + 0.05); };
  if (kind === 'storehouse') {
    for (let row = 0; row < 3; row++) for (let u = 0.8; u < U - 0.8; u += 0.9) { const s = 1.5 + (row === 1 ? 0.2 : 0); L('terracotta', sc(JAR, s), u, back - 0.5 - row * 1.15, 0.06, 12); circ(u, back - 0.5 - row * 1.15, 0.36, 1.1); }
    for (let i = 0; i < 6; i++) L('sacking', SACK, 1.0 + (i % 3) * 0.5, 0.9 + Math.floor(i / 3) * 0.55, 0.06 + (i > 2 ? 0.0 : 0), 8);
    Bc('timber', U - 2.6, 0.8, U - 0.7, 1.7, 0.06, 0.8);
    for (let k = 0; k < 6; k++) B('mud_plaster', U - 2.4 + (k % 3) * 0.5, 1.0 + Math.floor(k / 3) * 0.35, U - 2.1 + (k % 3) * 0.5, 1.25 + Math.floor(k / 3) * 0.35, 0.8, 0.84);
  } else if (kind === 'scriptorium') {
    shelf(0.5, U - 0.5, back, 0.3, 3);
    for (let k = 0; k < 3; k++) for (let u = 0.7; u < U - 0.9; u += 0.22) B('mud_plaster', u, back - 0.38, u + 0.17, back - 0.05, 0.37 + k * 0.75, 0.37 + k * 0.75 + 0.22);   // the tablets on their edges
    for (let s = 0; s < 2; s++) { const u = 2.0 + s * 3.4; B('reed_mat', u - 0.6, 2.0, u + 1.6, 4.0, 0.06, 0.075); Bc('timber', u + 0.3, 2.6, u + 1.0, 3.3, 0.06, 0.38);
      for (let k = 0; k < 4; k++) B('mud_plaster', u + 0.35 + k * 0.15, 2.7, u + 0.45 + k * 0.15, 2.95, 0.38, 0.4); L('terracotta', sc(BOWL, 1.2), u + 0.8, 3.1, 0.38, 8); }
    for (let k = 0; k < 3; k++) L('wicker', BASKET, U - 1.0, 0.8 + k * 0.55, 0.06, 8);
    for (let k = 0; k < 4; k++) B('mud_plaster', 0.9 + k * 0.4, 0.5, 1.1 + k * 0.4, 0.8, 0.06, 0.1);
  } else if (kind === 'kitchen') {
    // the hearth with its soot, a spit over the embers, the butcher's block, joints hung, jars, ovens, a quern
    Bc('brick_baked', U / 2 - 1.2, back - 1.3, U / 2 + 1.2, back, 0.06, 0.6); B('pottery_dark', U / 2 - 1.0, back - 1.2, U / 2 + 1.0, back - 0.1, 0.6, 0.66); B('flame', U / 2 - 0.3, back - 0.9, U / 2 + 0.3, back - 0.5, 0.66, 0.74);
    B('pottery_dark', U / 2 - 1.2, back + 0.08, U / 2 + 1.2, back + 0.1, 0.7, 3.2);
    for (const du of [-1.1, 1.1]) B('iron', U / 2 + du - 0.03, back - 0.9, U / 2 + du + 0.03, back - 0.84, 0.66, 1.2);
    beam('iron', LP(U / 2 - 1.1, back - 0.87, 1.15), LP(U / 2 + 1.1, back - 0.87, 1.15), 0.02, 0.02);
    Bc('timber', 0.8, 1.2, 2.0, 2.0, 0.06, 0.82);
    for (let k = 0; k < 5; k++) { const u = 1.0 + k * 1.3; B('hide_brown', u - 0.05, 3.2, u + 0.05, 3.3, 2.0, 3.4); L('hide_tan', [[0.001, 0], [0.12, 0.02], [0.14, 0.2], [0.07, 0.4], [0.001, 0.42]], u, 3.25, 1.5, 8); }
    for (let k = 0; k < 4; k++) { L('terracotta', sc(JAR, 1.4), U - 0.8, 0.9 + k * 0.6, 0.06, 10); circ(U - 0.8, 0.9 + k * 0.6, 0.3, 1.0); }
    for (const u of [0.9, 2.2]) { L('terracotta', [[0.55, 0], [0.53, 0.4], [0.4, 0.75], [0.22, 0.95], [0.26, 0.97], [0.44, 0.77], [0.55, 0.4], [0.57, 0]], u, V - 1.2, 0.06, 14); circ(u, V - 1.2, 0.55, 0.95); }
  } else if (kind === 'treasury') {
    for (let k = 0; k < 4; k++) { const u = 0.9 + k * 1.9; Bc('cedar', u, back - 1.0, u + 1.3, back - 0.15, 0.06, 0.7); B('bronze', u - 0.02, back - 1.02, u + 1.32, back - 0.95, 0.4, 0.46); B('bronze', u - 0.02, back - 0.2, u + 1.32, back - 0.13, 0.4, 0.46); B('cedar', u + 0.02, back - 1.03, u + 1.28, back - 0.1, 0.7, 0.8); }
    shelf(0.5, U - 0.5, 0.45 + 0.45, 0.4, 2);
    for (let u = 0.8; u < U - 0.8; u += 0.4) { L('gold', sc(BOWL, 1.5), u, 0.7, 0.45, 8); L('gold', sc(JAR, 0.5), u + 0.15, 0.6, 1.2, 8); }
    Bc('timber', U / 2 - 0.8, 2.2, U / 2 + 0.8, 3.0, 0.06, 0.8); B('cloth_red', U / 2 - 0.7, 2.3, U / 2 + 0.7, 2.9, 0.8, 0.82); L('gold', sc(JAR, 0.7), U / 2, 2.6, 0.82, 8);
    for (const u of [0.5, U - 0.5]) { L('bronze', [[0.2, 0], [0.04, 0.06], [0.03, 1.3], [0.12, 1.4], [0.001, 1.45]], u, 2.6, 0.06, 8); circ(u, 2.6, 0.2, 1.4); B('flame', u - 0.02, 2.58, u + 0.02, 2.62, 1.45, 1.55); }
  } else if (kind === 'bakehouse') {
    for (let k = 0; k < 3; k++) { const u = 1.2 + k * 1.8; L('terracotta', [[0.65, 0], [0.62, 0.4], [0.48, 0.8], [0.26, 1.0], [0.3, 1.02], [0.5, 0.82], [0.65, 0.4], [0.67, 0]], u, back - 0.9, 0.06, 14); circ(u, back - 0.9, 0.65, 1.0); const o = LP(u, back - 1.5, 0.3); bag.add('flame', box(o[0] - 0.05, o[1], o[2] - 0.05, o[0] + 0.05, o[1] + 0.12, o[2] + 0.05)); }
    for (let k = 0; k < 2; k++) { Bc('timber', 1.0 + k * 2.2, 1.5, 2.8 + k * 2.2, 2.3, 0.06, 0.6); B('linen', 1.1 + k * 2.2, 1.6, 2.7 + k * 2.2, 2.2, 0.55, 0.65); }
    for (let i = 0; i < 8; i++) L('hide_tan', [[0.001, 0], [0.1, 0], [0.12, 0.04], [0.09, 0.07], [0.001, 0.08]], U - 1.0 + (i % 2) * 0.3, 0.8 + Math.floor(i / 2) * 0.35, 0.82, 8);
    Bc('timber', U - 1.4, 0.6, U - 0.5, 2.3, 0.06, 0.8);
    for (let k = 0; k < 6; k++) L('sacking', SACK, 0.8 + (k % 3) * 0.5, V - 3.0 + Math.floor(k / 3) * 0.1, 0.06 + (k > 2 ? 0.5 : 0), 8);
  } else {   // purification
    for (let k = 0; k < 2; k++) { const u = 1.8 + k * 3.0; L('limestone', [[0.001, 0], [0.5, 0], [0.55, 0.3], [0.65, 0.7], [0.55, 0.78], [0.001, 0.72]], u, V * 0.5, 0.06, 16); L('bitumen', [[0.001, 0.72], [0.5, 0.72], [0.001, 0.73]], u, V * 0.5, 0.06, 16); circ(u, V * 0.5, 0.65, 0.78); }
    Bc('limestone', 0.2, back - 0.6, U - 0.2, back, 0.06, 0.45);
    for (let k = 0; k < 6; k++) { const u = 0.9 + k * 1.3; B('palm_trunk', u - 0.03, back - 0.04, u + 0.03, back, 1.6, 1.75); B('cloth_white', u - 0.25, back - 0.09, u + 0.25, back - 0.04, 0.55, 1.7); }
    L('bronze', [[0.3, 0], [0.26, 0.06], [0.06, 0.16], [0.045, 0.3], [0.045, 0.95], [0.12, 1.0], [0.26, 1.08], [0.3, 1.2], [0.27, 1.22], [0.22, 1.1], [0.001, 1.08]], U - 0.8, 1.2, 0.06, 12); circ(U - 0.8, 1.2, 0.3, 1.2);
    for (let k = 0; k < 3; k++) L('terracotta', sc(JAR, 1.3), 0.7 + k * 0.6, 0.9, 0.06, 10);
  }
  void rand;
}
