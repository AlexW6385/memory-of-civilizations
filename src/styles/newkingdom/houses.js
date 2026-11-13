// The houses of the town (docs/settlements/thebes.md §6): mudbrick on stone footings, the walls plastered and
// whitewashed, the door with its stone threshold and timber lintel, high window slits, a flat roof of beams and mud that is
// a terrace (reached by a stair) with its shade of mats and its jars. Four kinds: the workman's row house (Deir el-Medina:
// entrance, main room with its platform and niche, small room, kitchen with oven, the stair), the courtyard house, the villa
// (walled garden with a pool, a porch of two painted papyrus columns, the central hall with two columns, high windows, a bed
// niche) and the granary yard; the workshops are in workshops.js. A lot's `front` is the side its door is on; in a lot's own
// frame u runs along the street and v from the street into the lot.
import { box, lathe, fromTriangles, clothBox, addCloth } from '../../core/geom.js';
import { rng } from './kit.js';
import { nkPalm } from './palm.js';
import { facade, cabin, dovecote, shopGoods } from './dress.js';
import { lamp, person } from './interiors.js';

export function frame(rect, front, bag, col) {
  const [x0, z0, x1, z1] = rect, zs = front === 's' ? z1 : z0, sg = front === 's' ? -1 : 1, Z = (v) => zs + sg * v;
  const R = (u0, v0, u1, v1) => { const a = Z(v0), b = Z(v1); return [x0 + u0, Math.min(a, b), x0 + u1, Math.max(a, b)]; };
  return {
    W: x1 - x0, D: z1 - z0, X: (u) => x0 + u, Z, R, rise: front === 's' ? 'n' : 's', bag, col, sg,
    b(mat, u0, y0, v0, u1, y1, v1, solid = true) { const r = R(u0, v0, u1, v1); bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); if (solid) col.rect(r, y0, y1); },
    lathe(mat, prof, u, y, v, seg = 10, mod = null) { bag.add(mat, lathe(prof, seg, mod, x0 + u, y, Z(v))); },
  };
}
export const WALLS = ['mud_plaster', 'mud_plaster', 'mudbrick', 'limewash_white', 'mud_plaster', 'mudbrick'];
export const JAR = (r) => [[0.001, 0], [r * 0.4, 0.02], [r * 0.95, r * 0.55], [r, r * 1.2], [r * 0.7, r * 1.9], [r * 0.45, r * 2.2], [r * 0.5, r * 2.3], [0.001, r * 2.3]];

/** A small papyrus-bundle column of a house or villa: ribbed shaft, lashings, a closed bud, the abacus. */
export function smallColumn(F, u, v, h, r, y = 0) {
  const x = F.X(u), z = F.Z(v);
  F.bag.add('sandstone_dressed', lathe([[r * 1.5, 0], [r * 1.5, 0.12], [r * 1.1, 0.16]], 12, null, x, y, z));
  F.bag.add('sandstone_column', lathe([[r * 0.8, 0.16], [r, 0.5], [r * 0.93, h - 0.62], [r * 0.9, h - 0.46]], 14, (th) => 1 + 0.045 * Math.cos(8 * th), x, y, z));
  F.bag.add('fresco_green', lathe([[r * 0.82, 0.16], [r * 1.05, 0.3], [r * 1.0, 0.5], [r * 0.99, 0.55]], 14, (th) => 1 + 0.06 * Math.pow(Math.abs(Math.cos(4 * th)), 3), x, y, z));
  F.bag.add('egyptian_blue', lathe([[r * 0.92, h - 0.46], [r * 1.07, h - 0.44], [r * 1.07, h - 0.34], [r * 0.9, h - 0.32]], 12, null, x, y, z));
  F.bag.add('limewash_red', lathe([[r * 0.9, h - 0.32], [r * 1.06, h - 0.3], [r * 1.06, h - 0.24], [r * 0.9, h - 0.22]], 12, null, x, y, z));
  F.bag.add('fresco_green', lathe([[r * 0.9, h - 0.22], [r * 1.25, h - 0.14], [r * 1.3, h - 0.06], [r * 0.9, h - 0.01]], 14, null, x, y, z));
  F.bag.add('sandstone_dressed', box(x - r * 1.15, y + h - 0.02, z - r * 1.15, x + r * 1.15, y + h + 0.16, z + r * 1.15));
  F.col.circle(x, z, r * 1.2, y, y + h + 0.16);
}
/** Shared by the houses: the roof terrace of beams and mud with its parapet, a shade of mats and the things kept up there. */
export function roof(F, rand, H, hole, open, rect = [0, 0, F.W, F.D], simple = false) {
  const [u0, v0, u1, v1] = rect, T = H + 0.28;
  const parts = hole ? [[u0 - 0.2, v0 - 0.2, u1 + 0.2, hole[1]], [hole[2], hole[1], u1 + 0.2, v1 + 0.2], [u0 - 0.2, hole[1], hole[0], v1 + 0.2], [hole[0], hole[3], hole[2], v1 + 0.2]] : [[u0 - 0.2, v0 - 0.2, u1 + 0.2, v1 + 0.2]];
  for (const r of parts) if (r[2] - r[0] > 0.05 && r[3] - r[1] > 0.05) {
    F.b('mud_plaster', r[0], H, r[1], r[2], T, r[3], false);
    F.col.floor(F.R(r[0], r[1], r[2], r[3]), T);
  }
  if (open) for (let v = v0 + 0.4; v < v1 - 0.2; v += 0.9) F.b('timber', u0 + 0.35, H - 0.16, v, u1 - 0.35, H, v + 0.14, false);
  const pa = 0.26;                                                                     // the parapet round the terrace
  F.b('mud_plaster', u0 - 0.2, T, v0 - 0.2, u1 + 0.2, T + pa, v0 - 0.2 + 0.22); F.b('mud_plaster', u0 - 0.2, T, v1 - 0.02, u1 + 0.2, T + pa, v1 + 0.2);
  F.b('mud_plaster', u0 - 0.2, T, v0 - 0.2, u0 + 0.02, T + pa, v1 + 0.2); F.b('mud_plaster', u1 - 0.02, T, v0 - 0.2, u1 + 0.2, T + pa, v1 + 0.2);
  if (simple) return;
  // the shade of reed mats on four posts, jars, a basket, linen laid to dry
  const r = rand();
  if (r < 0.55 && u1 - u0 > 3.5 && v1 - v0 > 3.5) {
    const au = u0 + 0.8 + rand() * Math.max(0.1, u1 - u0 - 3.6), av = v0 + 1.0 + rand() * Math.max(0.1, v1 - v0 - 4.0), aw = 2.4, ad = 2.0;
    for (const [pu, pv] of [[au, av], [au + aw, av], [au, av + ad], [au + aw, av + ad]]) F.b('timber', pu - 0.04, T, pv - 0.04, pu + 0.04, T + 2.0 + (pv > av ? -0.2 : 0), pv + 0.04, false);
    F.b('reed_mat', au - 0.15, T + 1.98, av - 0.15, au + aw + 0.15, T + 2.04, av + ad + 0.15, false);
    F.b('reed_mat', au + 0.1, T, av + 0.2, au + aw - 0.1, T + 0.02, av + ad - 0.2, false);
  }
  if (r > 0.3) F.lathe('terracotta', JAR(0.2), u1 - 0.7, T, v0 + 0.7, 9);
  if (r > 0.5) F.lathe('wicker', [[0.2, 0], [0.26, 0.2], [0.24, 0.22], [0.001, 0.04]], u0 + 0.7, T, v1 - 0.8, 9);
  if (r < 0.2) addCloth(F.bag, 'cloth_white', clothBox(F.X(u0 + 0.6), T + 1.0, Math.min(F.Z(v0 + 1.0), F.Z(v0 + 1.02)), F.X(u0 + 2.3), T + 1.5, Math.max(F.Z(v0 + 1.0), F.Z(v0 + 1.02)), 0.25), T + 1.5);
}
/** The door: a stone threshold, jambs of timber, a palm-log lintel, the leaf (shut unless the house is open). */
export function door(F, wallMat, u, w, h, v0, v1, open, H) {
  F.b(wallMat, 0, 0, v0, u - w / 2, H, v1); F.b(wallMat, u + w / 2, 0, v0, F.W, H, v1);
  F.b(wallMat, u - w / 2, h, v0, u + w / 2, H, v1);
  F.b('palm_trunk', u - w / 2 - 0.15, h - 0.16, v0 - 0.06, u + w / 2 + 0.15, h + 0.08, v1 + 0.06, false);
  F.b('limestone_core', u - w / 2 - 0.05, -0.04, v0 - 0.12, u + w / 2 + 0.05, 0.1, v1 + 0.08, false);
  F.b('timber', u - w / 2 - 0.06, 0, v0 - 0.03, u - w / 2 + 0.02, h, v1 + 0.03, false); F.b('timber', u + w / 2 - 0.02, 0, v0 - 0.03, u + w / 2 + 0.06, h, v1 + 0.03, false);
  if (!open) F.b('cedar', u - w / 2 + 0.02, 0.02, v0 + 0.1, u + w / 2 - 0.02, h - 0.02, v0 + 0.2);
}
export const slit = (F, u, y, v, w = 0.5, h = 0.32) => F.b('opening', u - w / 2, y, v - 0.01, u + w / 2, y + h, v + 0.03, false);

/** The far version of a house (lod.js): the door, the walls, the street's slit and the roof's parapet; nothing inside or on the front. */
function shell(F, wm, uD, dw, dh, th, H, D, kind) {
  F.b(wm, 0, 0, 0, uD - dw / 2, H, th); F.b(wm, uD + dw / 2, 0, 0, F.W, H, th); F.b(wm, uD - dw / 2, dh, 0, uD + dw / 2, H, th);
  F.b('cedar', uD - dw / 2, 0, 0.1, uD + dw / 2, dh, 0.2, false);
  F.b(wm, 0, 0, th, th, H, D); F.b(wm, F.W - th, 0, th, F.W, H, D); F.b(wm, 0, 0, D - th, F.W, H, D);
  F.b(wm, th, 0, th, F.W - th, kind === 'row' ? 1.0 : 2.2, D - th);
}

/** nk_row_house: { rect, front, seed, open } — the workman's house. */
export function rowHouse(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed), F = frame(el.rect, el.front, bag, col), W = F.W, D = F.D, th = 0.4, H = 3.1 + rand() * 0.3, wm = WALLS[Math.floor(rand() * WALLS.length)], simple = !!el.simple, open = !!el.open && !simple;
  const uD = W * (0.3 + rand() * 0.4);
  if (simple) { shell(F, wm, uD, 0.9, 1.95, th, H, D, 'row'); roof(F, rand, H, null, false, undefined, true); return; }
  door(F, wm, uD, 0.9, 1.95, 0, th, open, H);
  facade(F, rng(el.seed + 99), { W, H, wm, uD, dw: 0.9, lod: el.lod ?? 1, open, shop: !!el.shop });
  F.b(wm, 0, 0, th, th, H, D); F.b(wm, W - th, 0, th, W, H, D); F.b(wm, 0, 0, D - th, W, H, D);
  slit(F, W * 0.5 + (uD < W / 2 ? 1.2 : -1.2), 2.45, -0.0); slit(F, uD, H - 0.5, 0, 0.5, 0.26);
  F.b('limewash_white', 0, 0, -0.02, W, 0.5, 0.0, false);                               // the whitewash's edge at the foot (the street's dust on it)
  F.b('banco_rough', 0, 0, -0.03, W, 0.32, 0.0, false);
  const stairV0 = D - 4.4, hole = [th, stairV0, 1.35, D - th];
  if (open) {
    const wall = (v, gap) => { F.b(wm, th, 0, v, gap - 0.45, H, v + 0.35); F.b(wm, gap + 0.45, 0, v, W - th, H, v + 0.35); F.b(wm, gap - 0.45, 2.0, v, gap + 0.45, H, v + 0.35); };
    wall(3.4, W / 2); wall(stairV0 - 0.35, W * 0.55);
    F.b(wm, 1.35, 0, stairV0, 1.7, H, D - 3.2);
    // stair to the roof along the left wall, rising toward the rear
    const n = 17, rise = (H + 0.28) / n, run = (D - th - stairV0) / n;
    for (let i = 0; i < n; i++) F.b('mud_plaster', th, 0, stairV0 + i * run, 1.35, rise * (i + 1), D - th, false);
    col.ramp(F.R(th, stairV0, 1.35, D - th), 0, H + 0.28, F.rise);
    // the floor (beaten mud) and the whitewash dado
    F.b('mud_plaster', th, -0.02, th, W - th, 0.03, D - th, false);
    for (const [a, b, c, d] of [[th, 3.75, W - th, 3.8], [th, 8.65, W - th, 8.7]]) F.b('limewash_white', a, 0.03, b, c, 1.0, d, false);
    // the front room: a bench along the wall, jars
    F.b('mud_plaster', W - th - 0.5, 0, th, W - th, 0.4, 3.0); F.b('reed_mat', W - th - 0.45, 0.4, th + 0.1, W - th - 0.05, 0.42, 2.9, false);
    if (el.shop) shopGoods(F, rng(el.seed + 5), uD, th, el.shop);
    F.lathe('terracotta', JAR(0.22), th + 0.35, 0, th + 0.4, 10); F.lathe('terracotta', JAR(0.18), th + 0.35, 0, th + 1.0, 10);
    // the main room: the platform with its steps, the niche with a little altar, a stool and a chest, a mat
    F.b('mud_plaster', W - th - 1.9, 0, 4.1, W - th, 0.5, 6.2); F.b('mud_plaster', W - th - 2.5, 0, 4.9, W - th - 1.9, 0.25, 5.5);
    F.b('opening', W - th - 1.1, 1.0, 3.84, W - th - 0.4, 1.8, 3.86, false); F.b('limestone_core', W - th - 1.15, 0.95, 3.8, W - th - 0.35, 1.0, 4.05, false);
    F.b('limestone_carved', W - th - 0.9, 1.0, 3.84, W - th - 0.7, 1.35, 3.9, false);
    F.b('reed_mat', 1.3, 0.03, 5.8, W - th - 2.8, 0.05, 7.6, false);
    F.b('timber', 1.1, 0, 7.2, 1.55, 0.42, 7.65); F.b('timber', 0.55, 0, 6.2, 1.3, 0.55, 6.9); F.b('cloth_ochre', 0.57, 0.55, 6.22, 1.28, 0.6, 6.88, false);
    F.lathe('terracotta', JAR(0.26), W - th - 0.4, 0, 8.2, 10); F.lathe('terracotta', JAR(0.2), W - th - 1.0, 0, 8.3, 10);
    // the small room: a bed (a frame of timber, a headrest, a mat); the kitchen: the domed oven, the quern, a store jar
    F.b('timber', 1.9, 0.2, 9.2, W - th - 0.3, 0.3, 10.9, false); for (const [a, b] of [[1.9, 9.2], [W - th - 0.4, 9.2], [1.9, 10.8], [W - th - 0.4, 10.8]]) F.b('timber', a, 0, b, a + 0.1, 0.2, b + 0.1, false);
    F.b('reed_mat', 1.95, 0.3, 9.25, W - th - 0.35, 0.32, 10.85, false); F.b('limestone_carved', W - th - 0.9, 0.32, 9.4, W - th - 0.45, 0.42, 9.6, false);
    F.lathe('mudbrick', [[0.5, 0], [0.5, 0.3], [0.4, 0.62], [0.2, 0.82], [0.001, 0.88]], W - th - 0.75, 0, D - th - 0.75, 12); col.circle(F.X(W - th - 0.75), F.Z(D - th - 0.75), 0.5, 0, 0.88);
    F.b('pottery_dark', W - th - 1.2, 0.05, D - th - 1.3, W - th - 0.8, 0.42, D - th - 1.25, false);
    F.b('mud_plaster', 2.3, 0, D - th - 1.0, 3.2, 0.18, D - th - 0.2); F.b('granite_red', 2.4, 0.18, D - th - 0.9, 3.1, 0.26, D - th - 0.3, false);
    F.lathe('terracotta', JAR(0.3), 2.0, 0, 11.4, 10);
    // the room is lit by a clay lamp on the platform, and someone is at home: the housewife at the oven, the master on his mat, the shopkeeper behind the counter
    lamp(F, ctx, W - th - 0.5, 0.5, 5.9, 0, 2.6);
    const pr = rng(el.seed + 31), q = pr();
    if (el.shop) person(F, ctx, { u: Math.max(th + 0.5, uD - 1.5), v: 1.7, face: [0, -1], who: pr() < 0.5 ? 'woman' : 'man', pose: 'squat', seed: el.seed + 3 });
    if (q < 0.6) person(F, ctx, { u: Math.max(2.2, W - th - 2.7), v: D - th - 1.0, face: [1, 0.2], who: 'woman', pose: 'kneel', seed: el.seed + 5, cloth: 'cloth_white' });
    if (q > 0.3) person(F, ctx, { u: 2.5, v: 6.6, face: [1, 0], who: q > 0.8 ? 'elder' : 'man', pose: 'sit_ground', seed: el.seed + 7 });
  }
  roof(F, rand, H, hole, open);
  // a third of the houses not entered carry a room built on the roof over the front (a second storey of the street's front: its window, its door to the terrace)
  if (!open && (el.lod ?? 1) >= 1 && W > 5.4 && rng(el.seed + 17)() < 0.38) cabin(F, rng(el.seed + 19), H, wm, [0.4, 0.5, W - 0.4, 3.9]);
}

/** nk_court_house: { rect, front, seed, open } — a court at the front with its oven, granary and palm, the roofed rooms behind, the roof terrace. */
export function courtHouse(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed), F = frame(el.rect, el.front, bag, col), W = F.W, D = F.D, th = 0.4, H = 3.0 + rand() * 0.4, wm = WALLS[Math.floor(rand() * WALLS.length)], simple = !!el.simple, open = !!el.open && !simple;
  const cv = 5.5 + rand() * 1.5, uD = W * (0.25 + rand() * 0.5);
  if (simple) {
    F.b(wm, 0, 0, 0, uD - 0.5, 2.7, th); F.b(wm, uD + 0.5, 0, 0, W, 2.7, th); F.b(wm, uD - 0.5, 2.0, 0, uD + 0.5, 2.7, th);
    F.b(wm, 0, 0, th, th, 2.7, cv); F.b(wm, W - th, 0, th, W, 2.7, cv);
    F.b(wm, 0, 0, cv, W, H, D); roof(F, rand, H, null, false, [0, cv, W, D], true); return;
  }
  door(F, wm, uD, 1.0, 2.0, 0, th, open, 2.7);
  facade(F, rng(el.seed + 99), { W, H: 2.7, wm, uD, dw: 1.0, doorH: 2.0, lod: el.lod ?? 1, open });
  F.b(wm, 0, 0, th, th, 2.7, cv); F.b(wm, W - th, 0, th, W, 2.7, cv);                                // the court's walls
  F.b(wm, 0, 0, cv, th, H, D); F.b(wm, W - th, 0, cv, W, H, D); F.b(wm, 0, 0, D - th, W, H, D);      // the house's
  slit(F, W / 2, 2.5, 0, 0.45, 0.3);
  F.b('banco_rough', 0, 0, -0.03, W, 0.3, 0.0, false);
  // the roofed rooms at the back: the front wall of the house on the court with a door, the party wall between two rooms
  const dm = W * 0.5; F.b(wm, th, 0, cv, dm - 0.5, H, cv + 0.35); F.b(wm, dm + 0.5, 0, cv, W - th, H, cv + 0.35); F.b(wm, dm - 0.5, 2.05, cv, dm + 0.5, H, cv + 0.35);
  F.b('palm_trunk', dm - 0.65, 1.9, cv - 0.06, dm + 0.65, 2.14, cv + 0.4, false);
  const sv = cv + 2.6; F.b(wm, th, 0, sv, W * 0.35, H, sv + 0.3); F.b(wm, W * 0.35 + 0.9, 0, sv, W - th, H, sv + 0.3);
  const hole = [th, D - 4.4, 1.35, D - th];
  if (open) {
    const n = 17, rise = (H + 0.28) / n, run = (D - th - hole[1]) / n;
    for (let i = 0; i < n; i++) F.b('mud_plaster', th, 0, hole[1] + i * run, 1.35, rise * (i + 1), D - th, false);
    col.ramp(F.R(th, hole[1], 1.35, D - th), 0, H + 0.28, F.rise);
    F.b('mud_plaster', th, -0.02, cv + 0.35, W - th, 0.03, D - th, false);
    // the central room: a bench on two sides, a column of papyrus, a bed niche; the court: oven, granary, quern, jars, a palm
    smallColumn(F, W / 2, cv + 1.6, H - 0.1, 0.2);
    F.b('mud_plaster', W - th - 0.5, 0, cv + 0.4, W - th, 0.4, sv - 0.1); F.b('reed_mat', W - th - 0.45, 0.4, cv + 0.5, W - th - 0.05, 0.42, sv - 0.2, false);
    F.b('timber', 0.6, 0.2, sv + 0.5, 2.6, 0.3, sv + 2.2, false); F.b('reed_mat', 0.62, 0.3, sv + 0.52, 2.58, 0.32, sv + 2.18, false);
    F.lathe('terracotta', JAR(0.28), W - th - 0.5, 0, sv + 1.0, 10);
    for (let x = th + 0.3; x < W - th - 0.3; x += 0.9) F.b('timber', x, H - 0.16, cv + 0.4, x + 0.14, H, D - th, false);
    // a clay lamp on the bench, the housewife kneeling at the court's oven, the master or an old man on the bench
    lamp(F, ctx, W - th - 0.25, 0.42, cv + 1.4, 0, 2.6);
    const pr = rng(el.seed + 31), q = pr();
    if (q < 0.7) person(F, ctx, { u: th + 0.9, v: cv - 2.2, face: [0, 1], who: 'woman', pose: 'kneel', seed: el.seed + 5 });
    if (q > 0.25) person(F, ctx, { u: W - th - 0.3, v: cv + 2.4, face: [-1, 0], who: q > 0.7 ? 'elder' : 'man', pose: 'sit', y: -0.04, seed: el.seed + 7 });
    if (q > 0.55) person(F, ctx, { u: W * 0.5 + 1.2, v: cv - 1.6, face: [0, -1], who: 'child', pose: 'sit_ground', seed: el.seed + 9 });
  } else F.b(wm, th, 0, cv, W - th, 2.2, D - th, true);
  F.b('mud_plaster', th, -0.02, th, W - th, 0.02, cv, false);
  F.lathe('mudbrick', [[0.55, 0], [0.56, 0.3], [0.45, 0.65], [0.25, 0.85], [0.001, 0.9]], th + 0.9, 0, cv - 1.0, 12); col.circle(F.X(th + 0.9), F.Z(cv - 1.0), 0.56, 0, 0.9);
  F.lathe('mud_plaster', [[0.52, 0], [0.55, 0.5], [0.5, 1.0], [0.32, 1.35], [0.1, 1.45], [0.1, 1.5], [0.001, 1.5]], W - th - 0.8, 0, cv - 1.0, 12); col.circle(F.X(W - th - 0.8), F.Z(cv - 1.0), 0.55, 0, 1.5);
  F.lathe('limestone_core', [[0.001, 0], [0.13, 0], [0.12, 0.06], [0.001, 0.08]], W - th - 0.8, 1.5, cv - 1.0, 8);
  const qv = th + 1.2 + rand() * 1.5; F.b('mud_plaster', W / 2 - 0.4, 0, qv, W / 2 + 0.4, 0.18, qv + 0.6, false); F.b('granite_red', W / 2 - 0.3, 0.18, qv + 0.1, W / 2 + 0.3, 0.26, qv + 0.5, false);
  F.lathe('terracotta', JAR(0.3), W - th - 0.5, 0, th + 0.5, 10); F.lathe('terracotta', JAR(0.22), W - th - 1.2, 0, th + 0.45, 10);
  { const pu = th + 1.1 + rand() * (W - 2.5), pl = (rand() - 0.5) * 0.15, ph = 5 + rand() * 3, ps = Math.floor(rand() * 9999); if (rand() < 0.7) nkPalm({ at: [F.X(pu), F.Z(cv * 0.62)], y: 0, h: ph, lean: pl, seed: ps }, ctx, (el.lod ?? 1) >= 2 ? 2 : 1); }
  roof(F, rand, H, hole, open, [0, cv, W, D]);
  const dr = rng(el.seed + 17), q = dr();
  if (!open && (el.lod ?? 1) >= 1 && W > 7.5) { if (q < 0.5) cabin(F, dr, H, wm, [0.4, cv + 0.6, Math.min(W - 0.4, 4.2), cv + 4.2]); else if (q < 0.7) dovecote(F, W - 1.6, D - 1.8, 3.6, 1.1); }
}

/** nk_villa: { rect, front, seed, open } — the house of an official: the walled garden with its pool and trees, the porch, the hall of columns. */
export function villa(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed), F = frame(el.rect, el.front, bag, col), W = F.W, D = F.D, th = 0.45, H = 3.6, wm = rand() < 0.6 ? 'limewash_white' : 'mud_plaster', simple = !!el.simple, open = !!el.open && !simple;
  const gv = 6.2;                                                                               // the garden's depth
  if (simple) {
    F.b(wm, 0, 0, 0, W / 2 - 0.75, 3.4, th); F.b(wm, W / 2 + 0.75, 0, 0, W, 3.4, th); F.b(wm, W / 2 - 0.75, 2.6, 0, W / 2 + 0.75, 3.4, th);
    F.b(wm, 0, 0, th, th, 3.4, gv); F.b(wm, W - th, 0, th, W, 3.4, gv); F.b(wm, 0, 0, gv, W, H, D);
    roof(F, rand, H, null, false, [0, gv, W, D], true); return;
  }
  door(F, wm, W / 2, 1.5, 2.6, 0, th, open, 3.4);
  facade(F, rng(el.seed + 99), { W, H: 3.0, wm, uD: W / 2, dw: 1.5, doorH: 2.6, lod: Math.max(1, el.lod ?? 1), open });
  F.b(wm, 0, 0, th, th, 3.4, gv); F.b(wm, W - th, 0, th, W, 3.4, gv);
  F.b('timber', W / 2 - 1.05, 2.6, -0.1, W / 2 + 1.05, 2.8, 0.18, false);
  for (const s of [-1, 1]) F.b('sandstone_dressed', W / 2 + s * 0.95 - 0.16, 0, -0.14, W / 2 + s * 0.95 + 0.16, 3.0, 0.14, false);        // the gate's posts
  F.b('banco_rough', 0, 0, -0.03, W, 0.3, 0.0, false);
  // the garden: a pool in a stone kerb, the water, papyrus and lotus at its edge, palms and a sycamore
  const pu = W / 2, pv = 3.2, pw = Math.min(4.2, W - 5), pd = 2.6;
  F.b('limestone_core', pu - pw / 2 - 0.25, 0, pv - pd / 2 - 0.25, pu + pw / 2 + 0.25, 0.35, pv + pd / 2 + 0.25);
  const r = F.R(pu - pw / 2, pv - pd / 2, pu + pw / 2, pv + pd / 2), wy = 0.3;
  bag.add('water', fromTriangles([r[0], wy, r[1], r[0], wy, r[3], r[2], wy, r[3], r[0], wy, r[1], r[2], wy, r[3], r[2], wy, r[1]]));
  for (let i = 0; i < 4; i++) F.lathe('lotus_leaf', [[0.001, 0], [0.3, 0.01], [0.001, 0.02]], pu - pw / 2 + 0.7 + i * pw / 4.5, wy, pv + (i % 2 - 0.5) * 1.2, 8);
  for (const [pxu, pxv, k] of [[0.2, 0.5, 0], [W - 0.2, 0.5, 1], [0.5, gv - 0.4, 2], [W - 0.5, gv - 0.4, 3]]) { const ph = 6 + rand() * 3, pl = (rand() - 0.5) * 0.14, ps = Math.floor(rand() * 9999); if ((el.lod ?? 1) >= 2 || k < 2) nkPalm({ at: [F.X(pxu + (k % 2 ? -0.5 : 0.5)), F.Z(pxv)], y: 0, h: ph, lean: pl, seed: ps }, ctx, (el.lod ?? 1) >= 2 ? 2 : 1); }
  F.b('mud_plaster', 1.2, 0, 1.0, 1.9, 0.18, 5.6, false); F.b('mud_plaster', W - 1.9, 0, 1.0, W - 1.2, 0.18, 5.6, false);        // the beds
  // the house across the garden's end: the porch of two painted columns, the long front hall, the central hall
  const hv = gv, hd = D - th - hv;
  F.b(wm, 0, 0, hv, th, H, D); F.b(wm, W - th, 0, hv, W, H, D); F.b(wm, 0, 0, D - th, W, H, D);
  F.b(wm, th, 0, hv + 1.4, W / 2 - 1.0, H, hv + 1.85); F.b(wm, W / 2 + 1.0, 0, hv + 1.4, W - th, H, hv + 1.85); F.b(wm, W / 2 - 1.0, 2.6, hv + 1.4, W / 2 + 1.0, H, hv + 1.85);
  smallColumn(F, W / 2 - 2.6, hv + 0.6, 3.1, 0.24); smallColumn(F, W / 2 + 2.6, hv + 0.6, 3.1, 0.24);
  for (let u = 0.4; u < W - 0.4; u += 1.1) F.b('timber', u, 3.1, hv + 0.1, u + 0.16, 3.34, hv + 1.4, false);
  F.b(wm, th, 3.1, hv, W - th, 3.4, hv + 0.4, false);
  const wy2 = (u) => F.b('lattice', u - 0.4, 2.55, hv + 1.4 - 0.04, u + 0.4, 3.2, hv + 1.4 - 0.01, false);                    // the high windows with their screens
  wy2(W * 0.22); wy2(W * 0.78);
  const hole = [th, D - 4.6, 1.4, D - th];
  if (open) {
    const n = 18, rise = (H + 0.28) / n, run = (D - th - hole[1]) / n;
    for (let i = 0; i < n; i++) F.b('mud_plaster', th, 0, hole[1] + i * run, 1.4, rise * (i + 1), D - th, false);
    col.ramp(F.R(th, hole[1], 1.4, D - th), 0, H + 0.28, F.rise);
    F.b('mud_plaster', th, -0.02, hv, W - th, 0.03, D - th, false);
    const cv = hv + 4.4;
    F.b(wm, th, 0, cv, W / 2 - 0.55, H, cv + 0.35); F.b(wm, W / 2 + 0.55, 0, cv, W - th, H, cv + 0.35); F.b(wm, W / 2 - 0.55, 2.1, cv, W / 2 + 0.55, H, cv + 0.35);
    smallColumn(F, W / 2 - 1.8, hv + 3.0, H - 0.1, 0.22); smallColumn(F, W / 2 + 1.8, hv + 3.0, H - 0.1, 0.22);
    F.b('mud_plaster', th, 0, hv + 1.9, 1.0, 0.45, cv - 0.1); F.b('mud_plaster', W - th - 1.0, 0, hv + 1.9, W - th, 0.45, cv - 0.1);                         // the raised seats along two walls
    F.b('cloth_blue', th + 0.05, 0.45, hv + 2.0, 0.95, 0.5, cv - 0.2, false); F.b('cloth_red', W - th - 0.95, 0.45, hv + 2.0, W - th - 0.05, 0.5, cv - 0.2, false);
    F.b('reed_mat', 2.4, 0.03, hv + 2.2, W - 2.4, 0.05, cv - 0.4, false);
    F.lathe('terracotta', JAR(0.3), W - th - 0.4, 0, hv + 1.7, 10);
    F.b('mud_plaster', 2.2, 0, cv + 0.4, 4.6, 0.55, cv + 1.9); F.b('reed_mat', 2.25, 0.55, cv + 0.45, 4.55, 0.57, cv + 1.85, false); F.b('limestone_carved', 4.0, 0.57, cv + 0.6, 4.4, 0.68, cv + 0.85, false);        // the bed niche
    F.b('mud_plaster', th, 1.0, cv + 0.35, 0.95, 1.6, D - th, false);
    for (let x = th + 0.3; x < W - th - 0.3; x += 0.9) F.b('timber', x, H - 0.16, hv + 1.85, x + 0.14, H, D - th, false);
    // the hall is lit by two stands of lamps, the master of the house sits on the raised seat, a servant kneels on the mat with a tray
    lamp(F, ctx, W / 2 + 1.0, 0.03, hv + 2.5, 1.0, 2.6); lamp(F, ctx, W / 2 - 1.0, 0.03, cv + 0.7, 1.0, 2.2);
    person(F, ctx, { u: th + 0.5, v: hv + 3.0, face: [1, 0], who: 'man', pose: 'sit', y: 0.04, seed: el.seed + 7, cloth: 'cloth_white' });
    person(F, ctx, { u: W / 2 - 0.4, v: hv + 3.0, face: [-1, 0.2], who: 'woman', pose: 'kneel', seed: el.seed + 5, cloth: 'cloth_white' });
  } else F.b(wm, th, 0, hv + 1.85, W - th, 2.5, D - th, true);
  roof(F, rand, H, hole, open, [0, hv, W, D]);
}

/** nk_granary: { rect, front, seed } — a walled yard with its beehive silos, loading holes at their tops, a stair. */
export function granary(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed), F = frame(el.rect, el.front, bag, col), W = F.W, D = F.D, th = 0.4, wm = 'mud_plaster', simple = !!el.simple;
  F.b(wm, 0, 0, 0, W, 1.8, th); F.b(wm, 0, 0, 0, th, 1.8, D); F.b(wm, W - th, 0, 0, W, 1.8, D); F.b(wm, 0, 0, D - th, W, 1.8, D);
  F.b('opening', W / 2 - 0.5, 0, -0.01, W / 2 + 0.5, 1.5, 0.05, false);
  const n = Math.max(2, Math.floor((W - 1) / 2.9));
  for (let i = 0; i < n; i++) for (const v of [D * 0.38, D * 0.78]) {
    const u = 0.6 + (i + 0.5) * (W - 1.2) / n, h = 3.0 + rand() * 0.7, r = 1.1;
    F.lathe('mud_plaster', [[r, 0], [r * 1.04, 0.3], [r * 0.95, h * 0.6], [r * 0.6, h * 0.92], [r * 0.2, h], [0.001, h]], u, 0, v, simple ? 8 : 14);
    if (simple) { col.circle(F.X(u), F.Z(v), r * 1.02, 0, h); continue; }
    F.lathe('limestone_core', [[0.001, 0], [r * 0.26, 0], [r * 0.24, 0.1], [0.001, 0.12]], u, h, v, 8);
    F.b('mud_plaster', u - 0.2, 0.9, v - r - 0.05, u + 0.2, 1.3, v - r + 0.1, false);
    col.circle(F.X(u), F.Z(v), r * 1.02, 0, h);
  }
  if (simple) return;
  const st = 8, run = 3.2 / st; for (let i = 0; i < st; i++) F.b('mud_plaster', 0.4, 0, D - 3.6 + i * run, 1.2, 0.4 * (i + 1), D - 0.4, false);
  col.ramp(F.R(0.4, D - 3.6, 1.2, D - 0.4), 0, 3.2, F.rise);
}

/** nk_garden: { rect, front, seed } — a low wall, beds, a shaduf by its well (the post, the counterweighted sweep, the bucket). */
export function garden(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed), F = frame(el.rect, el.front, bag, col), W = F.W, D = F.D;
  F.b('mud_plaster', 0, 0, 0, W, 0.9, 0.3); F.b('mud_plaster', 0, 0, 0, 0.3, 0.9, D); F.b('mud_plaster', W - 0.3, 0, 0, W, 0.9, D); F.b('mud_plaster', 0, 0, D - 0.3, W, 0.9, D);
  if (el.simple) return;
  F.b('opening', W / 2 - 0.5, 0, -0.01, W / 2 + 0.5, 0.9, 0.04, false);
  for (let u = 1.0; u < W - 1.2; u += 1.7) F.b('mud_plaster', u, 0, 1.2, u + 0.9, 0.12, D - 1.5, false);
  const su = W - 1.6, sv = D - 1.5;
  F.b('mud_plaster', su - 0.7, 0, sv - 0.7, su + 0.7, 0.5, sv + 0.7);                                              // the well's kerb
  F.b('timber', su - 0.9, 0, sv - 0.8, su - 0.78, 2.4, sv - 0.68, false); F.b('timber', su - 0.9, 0, sv + 0.68, su - 0.78, 2.4, sv + 0.8, false); F.b('timber', su - 0.9, 2.3, sv - 0.8, su - 0.78, 2.45, sv + 0.8, false);
  F.b('timber', su - 2.2, 2.35, sv - 0.03, su + 1.0, 2.43, sv + 0.03, false);                                      // the sweep
  F.lathe('limestone_core', [[0.001, 0], [0.22, 0.05], [0.25, 0.35], [0.001, 0.4]], su - 2.2, 2.0, sv, 8);        // the counterweight of clay
  F.lathe('wicker', [[0.12, 0], [0.16, 0.2], [0.001, 0.2]], su + 1.0, 1.0, sv, 8);                                // the bucket
  void rand;
}
