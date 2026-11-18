// Ming Suzhou — the rooms and pavilions that stood empty, furnished with the things of their use and
// with one still figure each where the dossier gives a person (docs/settlements/ming-suzhou.md §13):
// the doorkeeper's bench in the gate hall, the sedan chairs and their bearers in the sedan-chair
// hall, the women's room with its embroidery frame and dressing table, the family's dining hall,
// the tea and qin table of Little Canglang, the stone tables and stools of the pavilions.
// Everything is built in the plan's own coordinates; furniture faces −z at yaw 0 (faceYaw turns it).

import { figure } from '../../objects/figures.js';
import { Parts, box, lathe, limb, T, ball, W, table, armchair, stand, drumStool, teaSet, couch, longTable, lampStand, lantern, flowerStand, rock, pine, books, deskThings, hangingScroll, qin, torus } from './props.js';
import { hash } from './corework.js';

const faceYaw = (dx, dz) => Math.atan2(-dx, -dz);

/** A bench: a plank seat on two trestles, 0.46 m high. */
function bench(P, len, d = 0.34) {
  P.add(W, box(-len / 2, 0.42, -d / 2, len / 2, 0.46, d / 2));
  for (const s of [-1, 1]) { P.add(W, box(s * (len / 2 - 0.12) - 0.025, 0, -d / 2 + 0.03, s * (len / 2 - 0.12) + 0.025, 0.42, d / 2 - 0.03)); P.add(W, box(s * (len / 2 - 0.12) - 0.04, 0.0, -d / 2 + 0.02, s * (len / 2 - 0.12) + 0.04, 0.05, d / 2 - 0.02)); }
  P.add(W, box(-len / 2 + 0.14, 0.2, -0.012, len / 2 - 0.14, 0.23, 0.012));
}
/** A cabinet / wardrobe 0.9 wide, 0.5 deep, h high, doors facing −z: lacquer carcase, two panelled doors, brass plates. */
function cabinet(P, w, d, h) {
  P.add(W, box(-w / 2, 0.1, -d / 2, w / 2, h, d / 2));
  for (const s of [-1, 1]) P.add(W, box(s * (w / 2 - 0.05) - 0.05, 0, -d / 2 + 0.03, s * (w / 2 - 0.05) + 0.05, 0.1, d / 2 - 0.03));
  P.add('lacquer_black', box(-w / 2 + 0.05, 0.16, -d / 2 - 0.008, -0.012, h - 0.12, -d / 2 + 0.004));
  P.add('lacquer_black', box(0.012, 0.16, -d / 2 - 0.008, w / 2 - 0.05, h - 0.12, -d / 2 + 0.004));
  for (const s of [-1, 1]) { P.add('paint_ochre', box(s * 0.05 - 0.04, h * 0.5 - 0.1, -d / 2 - 0.012, s * 0.05 + 0.04, h * 0.5 + 0.1, -d / 2 - 0.004)); P.add('paint_ochre', T(ball(0.02, 0.02, 0.01, 6, 3), s * 0.05, h * 0.5, -d / 2 - 0.014)); }
  P.add(W, box(-w / 2 - 0.03, h, -d / 2 - 0.03, w / 2 + 0.03, h + 0.04, d / 2 + 0.03));
}
/** A sedan chair (jiao) facing −z, its poles along z resting on two trestles: poles, floor, posts, side and back cloth, a curtain at the front, a domed roof. */
function sedan(P, cloth, frame) {
  const pl = 1.5, py = 0.66;
  for (const s of [-1, 1]) {
    P.add('timber', limb([s * 0.5, py, -pl], [s * 0.5, py, pl], 0.034, 0.034, 6));
    P.add('timber', T(ball(0.04, 0.04, 0.04, 6, 4), s * 0.5, py, -pl)); P.add('timber', T(ball(0.04, 0.04, 0.04, 6, 4), s * 0.5, py, pl));
    for (const z of [-pl * 0.62, pl * 0.62]) { P.add(W, limb([s * 0.5, 0, z - 0.14], [s * 0.5, py - 0.03, z], 0.025, 0.025, 4)); P.add(W, limb([s * 0.5, 0, z + 0.14], [s * 0.5, py - 0.03, z], 0.025, 0.025, 4)); }
  }
  for (const z of [-pl * 0.62, pl * 0.62]) P.add(W, box(-0.52, 0.2, z - 0.012, 0.52, 0.23, z + 0.012));
  P.add(frame, box(-0.5, py + 0.02, -0.45, 0.5, py + 0.1, 0.45));
  const top = py + 1.18;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(frame, limb([sx * 0.46, py + 0.1, sz * 0.42], [sx * 0.46, top, sz * 0.42], 0.02, 0.02, 5));
  P.add(cloth, box(-0.47, py + 0.28, 0.4, 0.47, top - 0.06, 0.43));                    // the back
  for (const s of [-1, 1]) P.add(cloth, box(s * 0.47 - 0.012, py + 0.28, -0.4, s * 0.47 + 0.012, top - 0.06, 0.4));          // the sides (a window cut in each: a lattice)
  for (const s of [-1, 1]) { P.add('lacquer_chestnut', box(s * 0.466 - 0.016, py + 0.55, -0.2, s * 0.466 + 0.016, py + 0.9, 0.2)); P.add('lamp_white', box(s * 0.466 - 0.004, py + 0.57, -0.18, s * 0.466 + 0.004, py + 0.88, 0.18)); }
  P.add(cloth, box(-0.47, top - 0.5, -0.44, 0.47, top - 0.06, -0.41));                   // the curtain, rolled half up
  P.add('lacquer_red', box(-0.47, top - 0.52, -0.445, 0.47, top - 0.48, -0.405));
  P.add(frame, box(-0.5, top - 0.06, -0.46, 0.5, top, 0.46));
  P.add(cloth, lathe([[0.001, top + 0.2], [0.18, top + 0.17], [0.52, top + 0.04], [0.74, top - 0.01], [0.001, top - 0.01]], 4).rotateY(Math.PI / 4));
  P.add('paint_ochre', T(ball(0.05, 0.06, 0.05, 6, 4), 0, top + 0.22, 0));
}
/** An embroidery frame (xiu jia): two uprights on feet, a top and a bottom bar, the cloth stretched between them with a flower begun on it; faces −z. */
function embroideryFrame(P) {
  for (const s of [-1, 1]) { P.add(W, box(s * 0.35 - 0.025, 0, -0.16, s * 0.35 + 0.025, 0.05, 0.16)); P.add(W, limb([s * 0.35, 0.05, 0], [s * 0.35, 1.0, 0], 0.022, 0.02, 6)); }
  P.add(W, box(-0.37, 0.98, -0.02, 0.37, 1.03, 0.02)); P.add(W, box(-0.37, 0.58, -0.02, 0.37, 0.62, 0.02));
  P.add('paint_white', box(-0.34, 0.62, -0.006, 0.34, 0.98, 0.006));
  for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; P.add('lacquer_red', T(ball(0.05, 0.05, 0.008, 6, 3), Math.cos(a) * 0.07, 0.8 + Math.sin(a) * 0.07, -0.01)); }
  P.add('paint_ochre', T(ball(0.03, 0.03, 0.01, 5, 3), 0, 0.8, -0.012));
  P.add('tile_turquoise', T(ball(0.06, 0.02, 0.008, 5, 3), 0.12, 0.7, -0.01));
}
/** A dressing table with a stand mirror (a bronze disc on a post), a box and a comb tray; faces −z. */
function dressing(P) {
  table(P, 0.9, 0.45, 0.75);
  P.add(W, box(-0.2, 0.75, 0.0, 0.2, 0.84, 0.18)); P.add(W, box(-0.18, 0.84, 0.12, -0.14, 1.0, 0.16)); P.add(W, box(0.14, 0.84, 0.12, 0.18, 1.0, 0.16));
  P.add('paint_ochre', lathe([[0.001, 0], [0.17, 0], [0.18, 0.012], [0.001, 0.012]], 18).rotateX(-1.35).translate(0, 1.0, 0.14));
  P.add('lacquer_red', box(0.22, 0.75, -0.12, 0.38, 0.84, 0.05)); P.add('paint_ochre', box(0.29, 0.82, -0.125, 0.31, 0.845, -0.115));
  P.add('lacquer_black', box(-0.4, 0.75, -0.1, -0.22, 0.765, 0.08));
}
/** A go board on a table: the board, the two round bowls, a few stones laid. */
function goBoard(P, y, seed) {
  P.add('timber', box(-0.24, y, -0.24, 0.24, y + 0.04, 0.24));
  for (let k = 0; k < 9; k++) P.add('lacquer_black', box(-0.21 + k * 0.0525, y + 0.04, -0.21, -0.2 + k * 0.0525, y + 0.042, 0.21));
  for (let k = 0; k < 14; k++) { const a = hash(seed, k, 1), b = hash(seed, k, 2); P.add(k % 2 ? 'glaze_white' : 'lacquer_black', T(ball(0.016, 0.008, 0.016, 6, 3), (Math.round(a * 8) - 4) * 0.0525, y + 0.045, (Math.round(b * 8) - 4) * 0.0525)); }
  for (const s of [-1, 1]) P.add(s > 0 ? 'glaze_white' : 'lacquer_black', lathe([[0.001, 0], [0.05, 0.01], [0.065, 0.06], [0.001, 0.06]], 10, null, s * 0.34, y, 0.05));
}
/** A round stone table on a drum, and a stone drum stool (granite). */
function stoneTable(P, r, h) {
  P.add('granite_grey', lathe([[0.001, 0], [r * 0.5, 0], [r * 0.45, 0.06], [r * 0.3, 0.12], [r * 0.3, h - 0.1], [r * 0.6, h - 0.05], [r, h - 0.04], [r, h], [0.001, h]], 14));
}
function stoneStool(P) { P.add('granite_grey', lathe([[0.001, 0], [0.16, 0], [0.2, 0.06], [0.17, 0.16], [0.2, 0.3], [0.22, 0.4], [0.22, 0.44], [0.001, 0.44]], 12)); }

/** A figure element: seated or standing, Ming dress. */
function person(ctx, x, z, y, rot, o = {}) {
  figure({ at: [x, z], y, rot, seed: o.seed ?? Math.round(hash(x, z, 11) * 1e9), dress: o.dress ?? 'robe', cloth: o.cloth ?? 'lacquer_black', cloth2: o.cloth2 ?? 'paint_white', skin: o.skin ?? 'skin_light', pose: o.pose ?? 'stand', hat: o.hat ?? 'none', cap: o.cap, hair: o.hair ?? 'netknot', over: o.over, arms: o.arms, woman: o.woman, hairMat: 'lacquer_black' }, ctx);
}

/**
 * hall_life { kind: 'gate' | 'sedan' | 'women' | 'east' | 'canglang' | 'pav', rect or c…, y (the floor) }: the furnishing of one room
 * or pavilion, built from the plan's own data.
 */
const MAT = { bronze: 'paint_ochre', gilt_bronze: 'paint_ochre', inlay_jade: 'tile_turquoise', cloth_brown: 'paint_ochre', cloth_indigo: 'lacquer_black', cloth_red: 'lacquer_red', cloth_green: 'tile_turquoise', cloth_grey: 'paint_ochre', cloth_white: 'paint_white' };
/** (the room's pieces are drawn in the materials the garden's fine pieces already use, so that they add no mesh of their own) */
const sameMats = (bag) => new Proxy(bag, { get: (t, k) => (k === 'add' ? (m, g, ...r) => t.add(MAT[m] ?? m, g, ...r) : k === 'addInstance' ? (m, g, M, o) => t.addInstance(MAT[m] ?? m, g, M, o && o.real ? { ...o, real: MAT[o.real] ?? o.real } : o) : typeof t[k] === 'function' ? t[k].bind(t) : t[k]) });
export function hallLife(el, ctx0) {
  const ctx = { ...ctx0, bag: sameMats(ctx0.bag) };
  const { bag, col } = ctx, y = el.y + 0.012, S = new Parts();
  const put = (Q, x, z, yaw = 0, up = 0) => Q.emit(S, x, up, z, yaw);
  const blk = (x0, z0, x1, z1, h, yy = y) => col.rect([Math.min(x0, x1), Math.min(z0, z1), Math.max(x0, x1), Math.max(z0, z1)], yy, yy + h);
  const circ = (x, z, r, h, yy = y) => col.circle(x, z, r, yy, yy + h);
  const k = el.kind;
  if (k === 'gate') {
    // the gate hall: the doorkeeper's bench and tea stand west of the doorway, a long table with two chairs east of it, a pair of lanterns
    const zb = el.rect[1] + 0.44;
    { const P = new Parts(); bench(P, 2.2); put(P, -4.0, zb, Math.PI); blk(-5.1, zb - 0.18, -2.9, zb + 0.18, 0.5); }
    { const P = new Parts(); stand(P); const Q = new Parts(); teaSet(Q); Q.emit(P, 0, 0.68, 0); put(P, -2.55, zb, Math.PI); blk(-2.78, zb - 0.23, -2.32, zb + 0.23, 0.7); }
    { const P = new Parts(), h = 0.88; longTable(P, 1.9, 0.5, h); const D = new Parts(); books(D, 4, 3); D.emit(P, -0.5, h, 0); const L = new Parts(); lampStand(L, 0.5); L.emit(P, 0.55, h, 0); put(P, 4.1, zb + 0.02, Math.PI); blk(3.1, zb - 0.25, 5.1, zb + 0.27, 0.9); }
    for (const x of [3.3, 4.9]) { const P = new Parts(); armchair(P); put(P, x, zb + 1.05, 0); circ(x, zb + 1.05, 0.3, 1.1); }
    for (const x of [-3.3, 3.3]) { const P = new Parts(); lantern(P, 0.2); put(P, x, el.rect[1] + 1.9, 0, el.H - 0.55 - 0.012); }
    S.emit(bag, 0, y, 0, 0);
    person(ctx, -4.6, zb + 0.12, y, Math.PI, { pose: 'sit', cloth: 'paint_ochre', hat: 'cap', cap: 'ming', seed: 8111 });   // the doorkeeper, watching the street door
    return;
  }
  if (k === 'sedan') {
    // the sedan-chair hall: two chairs on trestles along the north side, a bench and a bearer
    const z0 = el.rect[1], zc = z0 + 2.0;
    for (const [x, cloth, dir] of [[-5.2, 'tile_turquoise', 1], [5.2, 'lacquer_black', -1]]) {
      const P = new Parts(); sedan(P, cloth, 'lacquer_black'); put(P, x, zc - 0.5, faceYaw(dir, 0));
      blk(x - 1.5, zc - 0.5 - 0.55, x + 1.5, zc - 0.5 + 0.55, 0.62); blk(x - 0.45, zc - 0.5 - 0.5, x + 0.45, zc - 0.5 + 0.5, 1.9);
    }
    { const P = new Parts(); bench(P, 2.4); put(P, -5.0, el.rect[3] - 0.62, 0); blk(-6.2, el.rect[3] - 0.8, -3.8, el.rect[3] - 0.44, 0.5); }
    { const P = new Parts(); bench(P, 2.4); put(P, 5.0, el.rect[3] - 0.62, 0); blk(3.8, el.rect[3] - 0.8, 6.2, el.rect[3] - 0.44, 0.5); }
    for (const x of [-7.3, 7.3]) { const P = new Parts(); lantern(P, 0.2); put(P, x, zc, 0, el.H - 0.55 - 0.012); }
    S.emit(bag, 0, y, 0, 0);
    person(ctx, -4.4, el.rect[3] - 0.62, y, 0, { pose: 'sit', dress: 'trousers', cloth: 'lacquer_black', cloth2: 'paint_ochre', seed: 8112 });   // a bearer resting
    return;
  }
  if (k === 'women') {
    // the women's room (ground floor of the inner building): a couch-bed with its tea stand, the dressing table, an embroidery frame, a wardrobe
    const [x0, z0, x1, z1] = el.rect, zn = z0 + 0.9;
    { const P = new Parts(); couch(P); put(P, -6.0, zn + 0.1, Math.PI); blk(-7.05, zn - 0.45, -4.95, zn + 0.65, 0.5); }
    { const P = new Parts(); stand(P); const Q = new Parts(); teaSet(Q); Q.emit(P, 0, 0.68, 0); put(P, -4.35, zn + 0.1, Math.PI); blk(-4.6, zn - 0.14, -4.1, zn + 0.34, 0.7); }
    { const P = new Parts(); dressing(P); put(P, 6.3, z0 + 0.5, Math.PI); blk(5.82, z0 + 0.3, 6.78, z0 + 0.72, 0.9); }
    { const P = new Parts(); drumStool(P); put(P, 6.3, z0 + 1.15, 0); circ(6.3, z0 + 1.15, 0.2, 0.46); }
    { const P = new Parts(); embroideryFrame(P); put(P, 3.9, z0 + 1.6, Math.PI); blk(3.5, z0 + 1.4, 4.3, z0 + 1.8, 1.05); }
    { const P = new Parts(); drumStool(P); put(P, 3.9, z0 + 2.3, 0); circ(3.9, z0 + 2.3, 0.2, 0.46); }
    { const P = new Parts(); cabinet(P, 1.0, 0.5, 1.75); put(P, x0 + 0.5, z0 + 1.7, faceYaw(1, 0)); blk(x0 + 0.2, z0 + 1.15, x0 + 0.78, z0 + 2.25, 1.8); }
    { const P = new Parts(); flowerStand(P, 0.82); const R = new Parts(); pine(R, 0.9, 17); R.emit(P, 0, 0.82, 0); put(P, -1.5, zn + 0.1, 0); circ(-1.5, zn + 0.1, 0.22, 1.1); }
    for (const x of [-3.8, 3.8]) { const P = new Parts(); lantern(P, 2.4); put(P, x, z0 + 1.7, 0, el.H - 0.55 - 0.012); }
    S.emit(bag, 0, y, 0, 0);
    person(ctx, 3.9, z0 + 2.24, y, 0, { pose: 'sit', cloth: 'lacquer_red', cloth2: 'paint_white', hair: 'bun', woman: true, seed: 8113 });   // at the embroidery
    void x1; void z1;
    return;
  }
  if (k === 'east') {
    // the family's dining and tea hall: two square tables each with four stools, a long table and a cabinet at the back, a painting
    const [x0, z0, x1, z1] = el.rect;
    for (const [tx, tz] of [[27.6, z0 + 1.9], [30.9, z0 + 1.9]]) {
      const P = new Parts(); table(P, 0.95, 0.95, 0.85); const Q = new Parts(); teaSet(Q); Q.emit(P, 0, 0.85, 0); put(P, tx, tz, 0); blk(tx - 0.48, tz - 0.48, tx + 0.48, tz + 0.48, 0.9);
      for (const [dx, dz] of [[-0.72, 0], [0.72, 0], [0, -0.72], [0, 0.72]]) { const St = new Parts(); drumStool(St); put(St, tx + dx, tz + dz, 0); circ(tx + dx, tz + dz, 0.2, 0.46); }
    }
    { const P = new Parts(), h = 0.88; longTable(P, 2.4, 0.5, h); const V = new Parts(); scrollRollsOn(V); V.emit(P, -0.5, h, 0); const Pl = new Parts(); const Rk = new Parts(); rock(Rk, 0.5, 31); Rk.emit(Pl, 0, 0, 0); Pl.emit(P, 0.6, h, 0); put(P, x1 - 0.75, 47.0, faceYaw(-1, 0)); blk(x1 - 1.05, 45.8, x1 - 0.45, 48.2, 0.95); }
    { const P = new Parts(); cabinet(P, 1.2, 0.5, 1.8); put(P, 25.2, z1 - 0.48, faceYaw(0, -1)); blk(24.6, z1 - 0.75, 25.8, z1 - 0.25, 1.85); }
    { const P = new Parts(); cabinet(P, 1.2, 0.5, 1.8); put(P, 27.0, z1 - 0.48, faceYaw(0, -1)); blk(26.4, z1 - 0.75, 27.6, z1 - 0.25, 1.85); }
    { const P = new Parts(); hangingScroll(P, 1.0, 2.0, 9); put(P, x1 - 0.12, 47.0, -Math.PI / 2, 0.85); }
    S.emit(bag, 0, y, 0, 0);
    person(ctx, 29.4, z0 + 4.6, y, faceYaw(0, -1), { cloth: 'paint_ochre', cloth2: 'paint_white', hat: 'cap', cap: 'ming', seed: 8114, arms: 'clasp' });   // the steward, waiting
    return;
  }
  if (k === 'canglang') {
    // Little Canglang: a qin table with its player at the west end, a couch-bed with a low table at the east end
    const [x0, z0, x1, z1] = el.rect, zc = (z0 + z1) / 2;
    { const P = new Parts(), h = 0.72; table(P, 1.1, 0.4, h, 'everted'); const Q = new Parts(); qin(Q); Q.emit(P, 0, h, 0); put(P, x0 + 1.25, zc, faceYaw(1, 0)); blk(x0 + 1.0, zc - 0.6, x0 + 1.5, zc + 0.6, 0.78); }
    { const P = new Parts(); drumStool(P); put(P, x0 + 2.05, zc, 0); circ(x0 + 2.05, zc, 0.2, 0.46); }
    { const P = new Parts(); couch(P); const Q = new Parts(); table(Q, 0.5, 0.4, 0.22); const T2 = new Parts(); teaSet(T2); T2.emit(Q, 0, 0.22, 0); Q.emit(P, 0, 0.46 - 0.04, 0); put(P, x1 - 0.85, zc, Math.PI / 2); blk(x1 - 1.4, zc - 1.05, x1 - 0.3, zc + 1.05, 0.5); }
    { const P = new Parts(); flowerStand(P, 0.82); const R = new Parts(); rock(R, 0.55, 12); R.emit(P, 0, 0.82, 0); put(P, x0 + 0.7, z0 + 0.7, 0); circ(x0 + 0.7, z0 + 0.7, 0.22, 1.2); }
    S.emit(bag, 0, y, 0, 0);
    person(ctx, x0 + 2.05, zc, y, faceYaw(-1, 0), { pose: 'sit', cloth: 'lacquer_black', cloth2: 'paint_white', hat: 'cap', cap: 'ming', seed: 8115 });   // the scholar at his qin
    return;
  }
  if (k === 'pav') {
    pavilion(el, ctx, S, y, put, blk, circ);
    return;
  }
}
function scrollRollsOn(P) {
  for (let k = 0; k < 3; k++) { P.add('paint_white', lathe([[0.001, -0.2], [0.02, -0.2], [0.02, 0.2], [0.001, 0.2]], 6).rotateZ(Math.PI / 2).translate(0, 0.02 + k * 0.001, -0.08 + k * 0.08)); P.add('lacquer_red', torus(0.02, 0.004, 6, 3).rotateZ(Math.PI / 2).translate(0.1, 0.02, -0.08 + k * 0.08)); }
}

/** The five pavilions: a stone or wooden table with its stools off the line through the open sides, and a person in some. */
function pavilion(el, ctx, S, y, put, blk, circ) {
  const [cx, cz] = el.c, id = el.id;
  if (el.shape === 'hex') {
    // the open edges are 1 and 4: the way through runs at 120° / 300°; the table stands toward the vertex at 30°
    const dir = [Math.cos(Math.PI / 6), Math.sin(Math.PI / 6)], ax = [Math.cos(2 * Math.PI / 3), Math.sin(2 * Math.PI / 3)];
    const d = el.r * 0.52, tx = cx + dir[0] * d, tz = cz + dir[1] * d, tr = el.r > 2.3 ? 0.42 : 0.32;
    { const P = new Parts(); stoneTable(P, tr, 0.74); if (id === 'hefeng') { const G = new Parts(); goBoard(G, 0, 3); G.emit(P, 0, 0.74, 0); } else { const Q = new Parts(); teaSet(Q); Q.emit(P, 0, 0.74, 0); const V = new Parts(); V.add('glaze_blue', lathe([[0.001, 0], [0.05, 0.01], [0.06, 0.06], [0.001, 0.06]], 8)); V.emit(P, 0.14, 0.74, 0.1); } put(P, tx, tz, 0); circ(tx, tz, tr, 0.78); }
    const sp = el.r > 2.3 ? 0.68 : 0.58;
    for (const s of [-1, 1]) { const P = new Parts(); stoneStool(P); const sx = tx + ax[0] * s * sp, sz = tz + ax[1] * s * sp; put(P, sx, sz, 0); circ(sx, sz, 0.22, 0.46); }
    if (id === 'hefeng') person(ctx, tx - ax[0] * sp, tz - ax[1] * sp, y, faceYaw(ax[0], ax[1]), { pose: 'sit', cloth: 'paint_ochre', cloth2: 'paint_white', hat: 'cap', cap: 'ming', seed: 8116 });
    S.emit(ctx.bag, 0, y, 0, 0);
    return;
  }
  if (id === 'xuexiang') {
    const tx = cx + 1.15;
    { const P = new Parts(); table(P, 0.6, 0.6, 0.78); const Q = new Parts(); teaSet(Q); Q.emit(P, 0.05, 0.78, 0); const B = new Parts(); books(B, 3, 5); B.emit(P, -0.12, 0.78, -0.15); put(P, tx, cz, faceYaw(-1, 0)); blk(tx - 0.32, cz - 0.32, tx + 0.32, cz + 0.32, 0.82); }
    for (const dz of [-0.8, 0.8]) { const P = new Parts(); armchair(P); put(P, tx, cz + dz, faceYaw(0, -dz)); circ(tx, cz + dz, 0.3, 1.1); }
    { const P = new Parts(); flowerStand(P, 0.82); const R = new Parts(); rock(R, 0.55, 22); R.emit(P, 0, 0.82, 0); put(P, cx - 1.35, cz, 0); circ(cx - 1.35, cz, 0.22, 1.2); }
    S.emit(ctx.bag, 0, y, 0, 0);
    person(ctx, tx, cz + 0.8, y, faceYaw(0, -1), { pose: 'sit', cloth: 'lacquer_black', cloth2: 'paint_white', hat: 'cap', cap: 'ming', seed: 8117 });
    return;
  }
  if (id === 'lvyi') {
    const tx = cx + 1.0;
    { const P = new Parts(); stand(P); const Q = new Parts(); teaSet(Q); Q.emit(P, 0, 0.68, 0); put(P, tx, cz - 0.3, 0); circ(tx, cz - 0.3, 0.24, 0.72); }
    { const P = new Parts(); stoneStool(P); put(P, tx, cz + 0.5, 0); circ(tx, cz + 0.5, 0.22, 0.46); }
    { const P = new Parts(); flowerStand(P, 0.82); const R = new Parts(); pine(R, 0.8, 41); R.emit(P, 0, 0.82, 0); put(P, cx - 1.1, cz - 0.3, 0); circ(cx - 1.1, cz - 0.3, 0.22, 1.2); }
    S.emit(ctx.bag, 0, y, 0, 0);
    return;
  }
  if (id === 'wuzhu') {
    // the Wutong and Bamboo Retreat: a reading corner — a desk with books and brushes, a stool and a reader, a stand with a rock, a couch-bed in the opposite corner
    const dx = cx + 2.1, dz = cz - 2.1;
    { const P = new Parts(), h = 0.78; table(P, 1.1, 0.5, h, 'everted'); const Q = new Parts(); deskThings(Q, 0); Q.emit(P, 0, h, 0); const B = new Parts(); books(B, 5, 9); B.emit(P, 0.35, h, 0.05); put(P, dx, dz, faceYaw(-1, 1)); blk(dx - 0.55, dz - 0.55, dx + 0.55, dz + 0.55, 0.85); }
    { const P = new Parts(); drumStool(P); put(P, dx - 0.7, dz + 0.7, 0); circ(dx - 0.7, dz + 0.7, 0.2, 0.46); }
    { const P = new Parts(); flowerStand(P, 0.82); const R = new Parts(); rock(R, 0.6, 33); R.emit(P, 0, 0.82, 0); put(P, cx - 2.2, cz - 2.2, 0); circ(cx - 2.2, cz - 2.2, 0.22, 1.2); }
    { const P = new Parts(); stand(P); const Q = new Parts(); teaSet(Q); Q.emit(P, 0, 0.68, 0); put(P, cx - 2.2, cz + 2.2, 0); circ(cx - 2.2, cz + 2.2, 0.24, 0.72); }
    S.emit(ctx.bag, 0, y, 0, 0);
    person(ctx, dx - 0.7, dz + 0.7, y, faceYaw(1, -1), { pose: 'sit', cloth: 'paint_ochre', cloth2: 'paint_white', hat: 'cap', cap: 'ming', seed: 8118 });
    return;
  }
}
