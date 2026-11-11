// The potters' and weavers' compounds of Teotihuacan (docs/settlements/teotihuacan.md §15): in a weaver's
// room the backstrap loom hung from the roof beam with a kneeling weaver at it, a spinner with her spindle,
// baskets of raw cotton, skeins on a pole, dye pots, folded cloths; in a potter's room the heap of clay, the
// turntable and the potter at it, rows of unfired pots on a mat, polishing stones, stacks of orange bowls;
// outside, the potters' kiln and its sherds, the weavers' dye vats and drying cloths.

import { STYLES } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';
import { carved } from '../maya/meso.js';
import { ollaKit, storeJarKit, bowlsKit, waterJarKit, put } from '../maya/household.js';
import { inst, fig, rng } from './street.js';

const RD = 'stucco_red', WH = 'stucco_pale';

/** The backstrap loom hung from a beam: cords, the upper bar, the warp, the woven band, the lower bar; 0.9 m wide, built facing +z (the weaver at +z). */
const loomKit = (c1, c2) => carved(`loom:${c1}:${c2}`, (k) => {
  for (const sx of [-1, 1]) k.seg('sacking', [sx * 0.4, 1.84, 0], [sx * 0.42, 1.3, 0], 0.012, 0.012);
  k.bx('timber', -0.5, 0.5, 1.25, 1.32, -0.03, 0.03);
  k.bx('cloth_white', -0.42, 0.42, 0.5, 1.25, -0.006, 0.006);                                    // the warp
  for (let i = 0; i < 4; i++) k.bx(i % 2 ? c2 : c1, -0.42, 0.42, 0.5 + i * 0.07, 0.5 + i * 0.07 + 0.035, 0.006, 0.012);   // the woven stripes
  k.bx(c1, -0.42, 0.42, 0.5, 0.78, 0.006, 0.012);
  k.bx('timber', -0.5, 0.5, 0.43, 0.5, -0.03, 0.03);
  for (const sx of [-1, 1]) k.seg('cloth_brown', [sx * 0.5, 0.46, 0.04], [sx * 0.3, 0.38, 0.6], 0.012, 0.012);   // the backstrap's ends
  k.bx('cloth_brown', -0.32, 0.32, 0.33, 0.4, 0.58, 0.64);
});
/** A spindle with its whorl, standing in a bowl, and a ball of spun thread; small. */
const spindleKit = () => carved('spindle', (k) => {
  k.seg('timber', [0, 0, 0], [0.08, 0.32, 0.02], 0.006, 0.006); k.geo('terracotta', lathe([[0.001, 0.07], [0.04, 0.07], [0.04, 0.085], [0.001, 0.09]], 8).translate(0.02, 0, 0.005));
  k.geo('cloth_white', lathe([[0.001, 0.12], [0.03, 0.15], [0.001, 0.22]], 7).translate(0.04, 0, 0.01));
});
/** A basket of raw cotton heaped over its rim, r 0.25. */
const cottonKit = () => carved('cotton-basket', (k) => {
  k.geo('wicker', lathe([[0.001, 0], [0.2, 0], [0.26, 0.2], [0.001, 0.2]], 10));
  k.geo('cloth_white', lathe([[0.001, 0.16], [0.26, 0.2], [0.22, 0.34], [0.12, 0.42], [0.001, 0.44]], 9, (th) => 1 + 0.15 * Math.sin(th * 5)));
});
/** Skeins hung on a pole along x, 1.8 m long, 1.9 m up. */
const skeinsKit = () => carved('skeins', (k) => {
  k.bx('timber', -0.9, 0.9, 1.7, 1.75, -0.02, 0.02);
  const C = ['cloth_red', 'cloth_ochre', 'cloth_indigo', 'cloth_white', 'cloth_red', 'cloth_brown', 'cloth_green', 'cloth_ochre'];
  C.forEach((m, i) => { const x = -0.8 + i * 0.23; k.bx(m, x - 0.06, x + 0.06, 1.2, 1.7, -0.025, 0.025); k.bx(m, x - 0.04, x + 0.04, 1.15, 1.2, -0.02, 0.02); });
});
const clothStackKit = (a, b) => carved(`cloth-stack:${a}:${b}`, (k) => { for (let i = 0; i < 5; i++) k.bx(i % 2 ? b : a, -0.3, 0.3, i * 0.055, i * 0.055 + 0.052, -0.22, 0.22); k.bx('cloth_red', -0.3, 0.3, 0.02, 0.03, -0.225, 0.225); });
/** A dye vat: a big pot with the dye (indigo, cochineal red, ochre) showing at its mouth, r 0.4, 0.55 high. */
const vatKit = (dye) => carved(`vat:${dye}`, (k) => {
  k.geo('pottery_dark', lathe([[0.001, 0], [0.2, 0.01], [0.38, 0.2], [0.4, 0.4], [0.33, 0.55], [0.001, 0.55]], 14));
  k.geo(dye, lathe([[0.001, 0.5], [0.3, 0.5], [0.3, 0.52], [0.001, 0.52]], 12));
});
/** The turntable: a flat disc on a bowl (a potter's slab), and a pot half raised on it. */
const turntableKit = () => carved('turntable', (k) => {
  k.geo('terracotta', lathe([[0.001, 0], [0.16, 0], [0.14, 0.1], [0.001, 0.1]], 10));
  k.geo('terracotta', lathe([[0.001, 0.1], [0.22, 0.1], [0.22, 0.12], [0.001, 0.12]], 12));
  k.geo('pottery_dark', lathe([[0.001, 0.12], [0.13, 0.13], [0.15, 0.2], [0.12, 0.28], [0.001, 0.28]], 10));
});
/** A heap of wet clay, 0.5 m across. */
const clayKit = () => carved('clay-heap', (k) => { k.geo('terracotta', lathe([[0.001, 0], [0.28, 0], [0.22, 0.12], [0.1, 0.2], [0.001, 0.22]], 9, (th) => 1 + 0.15 * Math.sin(th * 3))); k.geo('terracotta', lathe([[0.001, 0], [0.12, 0], [0.08, 0.09], [0.001, 0.1]], 7).translate(0.3, 0, 0.1)); });
const polishKit = () => carved('polish-stones', (k) => { for (const [x, z] of [[0, 0], [0.12, 0.06], [-0.08, 0.1]]) k.geo('basalt', lathe([[0.001, 0], [0.035, 0.005], [0.04, 0.025], [0.001, 0.035]], 7).translate(x, 0, z)); });
const sherdsKit = () => carved('sherds', (k) => {
  const r = rng(5);
  for (let i = 0; i < 14; i++) { const a = r() * 6.28, d = 0.1 + r() * 0.6, s = 0.03 + r() * 0.04; k.fy(i % 3 ? 'terracotta' : 'paint_ochre', [-s, s, -s * 0.7, s * 0.7], [-s * 0.5, s * 0.5, -s * 0.3, s * 0.3], 0, 0.02); const g = k.m.get(i % 3 ? 'terracotta' : 'paint_ochre'); g[g.length - 1].rotateY(a).translate(Math.cos(a) * d, 0, Math.sin(a) * d); }
});
/** The pots' kiln: a low dome of rubble and clay with its mouth (fire-hole) and a vent, ash before it; r 1.1, 1.3 high; mouth toward +z. */
const kilnKit = () => carved('kiln', (k) => {
  k.geo('rubble_teo', lathe([[1.15, 0], [1.1, 0.5], [0.85, 0.95], [0.5, 1.2], [0.2, 1.3], [0.001, 1.3]], 14, (th) => 1 + 0.05 * Math.sin(th * 4)));
  k.bx('paint_minoan_black', -0.3, 0.3, 0, 0.5, 0.98, 1.2);
  k.geo('plaster_grey', lathe([[0.001, 0], [0.7, 0], [0.5, 0.03], [0.001, 0.04]], 10).translate(0, 0, 1.6));
  k.geo('pottery_dark', lathe([[0.001, 1.3], [0.12, 1.28], [0.1, 1.42], [0.001, 1.42]], 8));
});
const woodKit = () => carved('kiln-wood', (k) => { for (let r = 0; r < 3; r++) for (let i = 0; i < 5 - r; i++) k.seg('bark_pine', [-0.8 + i * 0.3 + r * 0.15, 0.08 + r * 0.14, -0.4], [-0.8 + i * 0.3 + r * 0.15, 0.08 + r * 0.14, 0.4], 0.07, 0.07); });

const at = (A, f, u, v) => { const [x, z] = A(u, v); return [x, f, z]; };
const faceRot = (A, u0, v0, u1, v1) => { const [x0, z0] = A(u0, v0), [x1, z1] = A(u1, v1); return Math.atan2(-(x1 - x0), -(z1 - z0)); };
const kitYaw = (A, u0, v0, u1, v1) => { const [x0, z0] = A(u0, v0), [x1, z1] = A(u1, v1); return Math.atan2(x1 - x0, z1 - z0); };
const mat = (bag, A, f, u0, u1, v0, v1) => { const [x0, z0] = A(u0, v0), [x1, z1] = A(u1, v1); bag.add('reed_mat', box(Math.min(x0, x1), f, Math.min(z0, z1), Math.max(x0, x1), f + 0.02, Math.max(z0, z1))); };

/** The weaver's room (a0..a1 across, v0..v1 from the door in; A the room's frame as in rooms.js). */
export function weaverRoom(ctx, A, f, a0, a1, v0, v1, inward, rand, ceil) {
  const { bag, col } = ctx, m = (a0 + a1) / 2, C = ['cloth_red', 'cloth_indigo', 'cloth_ochre'];
  const c1 = C[Math.floor(rand() * 3)], c2 = C[Math.floor(rand() * 3)];
  // the loom in the room's middle, its warp across the room; the weaver kneeling in front of it
  const lu = a0 + 1.5, lv = (v0 + v1) / 2 - 0.2, yaw = kitYaw(A, lu, lv, lu + 1, lv);
  const [lx, , lz] = at(A, f, lu, lv);
  inst(bag, loomKit(c1, c2), lx, f, lz, yaw, 1, 60);
  fig(ctx, { who: 'woman', at: A(lu + 0.62, lv), y: f, rot: faceRot(A, lu + 0.62, lv, lu, lv), seed: Math.floor(rand() * 1e9), pose: 'kneel' });
  mat(bag, A, f, lu + 0.2, lu + 1.4, lv - 0.7, lv + 0.7);
  col.circle(lx, lz, 0.3, f, f + 2);
  // the spinner squatting by the door with her spindle and the basket of cotton
  fig(ctx, { who: 'woman', at: A(a1 - 1.0, v0 + 1.3), y: f, rot: faceRot(A, a1 - 1.0, v0 + 1.3, a1 - 2.0, v0 + 1.6), seed: Math.floor(rand() * 1e9), pose: 'squat' });
  inst(bag, cottonKit(), ...at(A, f, a1 - 1.5, v0 + 0.8), 0, 1, 50); inst(bag, cottonKit(), ...at(A, f, a1 - 0.55, v0 + 2.2), 1, 0.85, 50);
  inst(bag, spindleKit(), ...at(A, f, a1 - 1.9, v0 + 1.7), 1.2, 1, 40);
  // skeins on a pole along the side wall, dye pots and the stacks of cloth under the back wall
  { const [x, , z] = at(A, f + 0.0, a0 + 0.3, (v0 + v1) / 2); inst(bag, skeinsKit(), x, f, z, kitYaw(A, a0 + 0.3, (v0 + v1) / 2, a0 + 0.3, (v0 + v1) / 2 + 1) + Math.PI / 2 * 0 + (Math.abs(A(1, 0)[0] - A(0, 0)[0]) > 0.5 ? Math.PI / 2 : 0), 1, 60); }
  for (let i = 0; i < 3; i++) inst(bag, clothStackKit(['cloth_white', 'cloth_ochre', 'cloth_red'][i], ['cloth_indigo', 'cloth_white', 'cloth_brown'][i]), ...at(A, f, m - 0.9 + i * 0.75, v1 - 0.4), rand() * 0.3, 1, 50);
  for (const [i, d] of [[0, 'cloth_indigo'], [1, 'cloth_red']]) { const [x, y, z] = at(A, f, a1 - 0.6 - i * 0.9, v1 - 0.6); inst(bag, vatKit(d), x, y, z, 0, 1, 50); col.circle(x, z, 0.4, f, f + 0.55); }
  put(bag, waterJarKit(), ...at(A, f, a0 + 0.5, v0 + 0.55), 0); { const [x, z] = A(a0 + 0.5, v0 + 0.55); col.circle(x, z, 0.33, f, f + 0.8); }
}

/** The potter's room. */
export function potterRoom(ctx, A, f, a0, a1, v0, v1, inward, rand) {
  const { bag, col } = ctx, m = (a0 + a1) / 2;
  // the clay heap and the water jar at the back, the potter kneeling at the turntable in the room's middle
  inst(bag, clayKit(), ...at(A, f, a0 + 0.7, v1 - 0.6), rand() * 6, 1.2, 50); inst(bag, clayKit(), ...at(A, f, a0 + 1.6, v1 - 0.5), 2, 0.8, 50);
  put(bag, waterJarKit(), ...at(A, f, a0 + 0.5, v0 + 0.6), 0); { const [x, z] = A(a0 + 0.5, v0 + 0.6); col.circle(x, z, 0.33, f, f + 0.8); }
  mat(bag, A, f, m - 0.6, m + 0.9, v0 + 1.6, v0 + 2.9);
  inst(bag, turntableKit(), ...at(A, f + 0.02, m + 0.1, v0 + 2.25), 0, 1, 50);
  fig(ctx, { who: 'man', at: A(m - 0.25, v0 + 2.25), y: f + 0.02, rot: faceRot(A, m - 0.25, v0 + 2.25, m + 0.1, v0 + 2.25), seed: Math.floor(rand() * 1e9), pose: 'kneel' });
  inst(bag, polishKit(), ...at(A, f, m + 0.55, v0 + 2.7), 0, 1, 40);
  // the unfired pots in two rows on a mat along the side wall, the finished orange bowls stacked by the door
  mat(bag, A, f, a1 - 1.6, a1 - 0.2, v0 + 1.0, v1 - 0.4);
  for (let i = 0; i < 8; i++) { const vv = v0 + 1.3 + (i >> 1) * 0.65; if (vv > v1 - 0.7) break; const [x, y, z] = at(A, f + 0.02, a1 - 1.2 + (i & 1) * 0.65, vv); put(bag, i % 3 ? ollaKit() : storeJarKit(), x, y, z, rand() * 6, 0.85); col.circle(x, z, 0.24, f, f + 0.5); }
  for (let i = 0; i < 3; i++) put(bag, bowlsKit('paint_ochre'), ...at(A, f, a1 - 0.5, v0 + 0.5 + i * 0.35), inward, 1);
  inst(bag, sherdsKit(), ...at(A, f, a0 + 1.2, v0 + 1.4), 0, 0.9, 40);
}

/** The potters' kiln in a compound's second patio, with the wood before it, sherds, and a man feeding it. */
export function kiln(ctx, x, y, z, seed) {
  const { bag, col } = ctx, r = rng(seed);
  inst(bag, kilnKit(), x, y, z - 0.6, Math.PI * (r() < 0.5 ? 0 : 1) * 0 + Math.PI, 1, 140); col.circle(x, z - 0.6, 1.2, y, y + 1.4);
  inst(bag, woodKit(), x + 2.3, y, z - 2.0, 0.3, 1, 90); col.rect([x + 1.5, z - 2.5, x + 3.1, z - 1.5], y, y + 0.5);
  inst(bag, sherdsKit(), x - 2.0, y, z + 1.6, 1, 2.2, 90);
  for (let i = 0; i < 6; i++) { const px = x - 2.8 + (i % 3) * 0.7, pz = z - 2.4 + Math.floor(i / 3) * 0.7; put(bag, i % 2 ? ollaKit() : storeJarKit(), px, y, pz, r() * 6, 0.9); }
  fig(ctx, { who: 'man', at: [x, z + 0.8], y, rot: Math.PI, seed: seed + 3, pose: 'squat' });
}
/** The weavers' dye vats in the second patio, a cloth spread on a line to dry, a woman at a vat. */
export function dyeYard(ctx, x, y, z, seed) {
  const { bag, col } = ctx, L = STYLES.life.elements;
  [['cloth_indigo', -1.6], ['cloth_red', -0.6], ['cloth_ochre', 0.4]].forEach(([d, dx]) => { inst(bag, vatKit(d), x + dx - 0.5, y, z - 1.8, 0, 1, 90); col.circle(x + dx - 0.5, z - 1.8, 0.4, y, y + 0.55); });
  L.laundry({ t: 'laundry', at: [x, z + 1.8], y, rot: 0, len: 3.5, seed }, ctx);
  fig(ctx, { who: 'woman', at: [x - 1.0, z - 0.9], y, rot: 0, seed: seed + 1, pose: 'kneel' });
}
