// The lesser rooms of Shaolin (docs/settlements/shaolin.md §6b): the monastery's side ranges — refectory, kitchen, guest hall, the
// Sixth Patriarch's hall, the monks' dormitories — the gate hall, and the village's houses (a north-Henan farmhouse with its
// kang, a shop with its counter and shelves by trade). Each is built in the room's own frame (a across the room from its middle,
// b from the back wall toward the front, y up) and turned into place once, whichever way the room faces.
import { Parts, limb, ball, T } from '../qing/carving.js';
import { box, lathe } from '../../core/geom.js';
import { statue } from '../chinese/statues.js';
import {
  brickFloor, longTable, table, armchair, stand, candleStand, lantern, lampStand, books, bolster, hangingScroll, teaSet, scrollsOnTable,
  couch, plumVase, carpet, rng, W,
} from '../../settlements/ming-suzhou/props.js';

const FRONT = { s: [0, 0], n: [Math.PI, 0], e: [Math.PI / 2, 0], w: [-Math.PI / 2, 0] };

/** The room's frame: its width Wd, depth Dp, and put / block in local (a, b). */
function local(el, ctx) {
  const [x0, z0, x1, z1] = el.rect, front = el.front ?? 's', alongX = front === 'n' || front === 's';
  const Wd = alongX ? x1 - x0 : z1 - z0, Dp = alongX ? z1 - z0 : x1 - x0;
  const origin = { s: [(x0 + x1) / 2, z0], n: [(x0 + x1) / 2, z1], e: [x0, (z0 + z1) / 2], w: [x1, (z0 + z1) / 2] }[front];
  const yaw = FRONT[front][0], cs = Math.cos(yaw), sn = Math.sin(yaw), S = new Parts(), { col, bag, lights } = ctx;
  const y = el.y + 0.05, H = el.H ?? 3.6;
  const WC = (a, b) => [origin[0] + a * cs + b * sn, origin[1] - a * sn + b * cs];
  return {
    Wd, Dp, H, y, S,
    put: (Q, a, b, yw = 0, up = 0) => Q.emit(S, a, up, b, yw),
    block: (a0, b0, a1, b1, h) => { const p = WC(a0, b0), q = WC(a1, b1); col.rect([Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])], y, y + h); },
    circle: (a, b, r, h) => { const p = WC(a, b); col.circle(p[0], p[1], r, y, y + h); },
    light: (a, yy, b, c = '#ffb46b', i = 1.3, d = 6) => { const p = WC(a, b); lights?.push({ at: [p[0], y + yy, p[1]], color: c, intensity: i, distance: d }); },
    done: () => S.emit(bag, origin[0], y, origin[1], yaw),
  };
}
const faceYaw = (dx, dz) => Math.atan2(-dx, -dz);

// ── things ───────────────────────────────────────────────────────────────────────────────────
/** A long bench w × 0.3, seat 0.45 high on four stout legs. */
function bench(P, w, m = W) {
  P.add(m, box(-w / 2, 0.42, -0.14, w / 2, 0.46, 0.14));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(m, box(sx * (w / 2 - 0.1) - 0.025, 0, sz * 0.1 - 0.025, sx * (w / 2 - 0.1) + 0.025, 0.42, sz * 0.1 + 0.025));
  P.add(m, box(-w / 2 + 0.1, 0.16, -0.012, w / 2 - 0.1, 0.19, 0.012));
}
/** A water vat (a big glazed jar) with a wooden lid and a gourd ladle. */
function vat(P, r = 0.42, h = 0.85, mat = 'pottery_dark') {
  P.add(mat, lathe([[0.001, 0], [r * 0.7, 0], [r, h * 0.3], [r * 1.05, h * 0.62], [r * 0.9, h * 0.92], [r * 0.95, h], [0.001, h]], 12));
  P.add('timber', lathe([[0.001, h], [r * 0.92, h], [r * 0.92, h + 0.03], [0.001, h + 0.03]], 12));
  P.add('timber', limb([r * 0.3, h + 0.04, 0], [r * 0.7, h + 0.03, 0.05], 0.012, 0.012, 4));
}
/** A stack of split firewood against a wall: its length along a, h high. */
function wood(P, w, h, seed = 3) {
  const r = rng(seed), n = Math.round(h / 0.12);
  for (let j = 0; j < n; j++) for (let i = 0; i < Math.round(w / 0.13); i++) if (r() < 0.95) P.add('timber', limb([-w / 2 + i * 0.13 + (j % 2) * 0.06, 0.06 + j * 0.12, -0.25], [-w / 2 + i * 0.13 + (j % 2) * 0.06, 0.06 + j * 0.12, 0.25], 0.055, 0.055, 5));
}
/** A bowl and a pair of chopsticks, set for one at a table's edge (y at the table top). */
function place(P, y, k = 0) {
  P.add('glaze_white', lathe([[0.001, y], [0.04, y], [0.075, y + 0.045], [0.07, y + 0.047], [0.036, y + 0.012], [0.001, y + 0.008]], 8));
  if (k % 3 !== 2) P.add('rope_fibre', limb([0.08, y + 0.005, -0.1], [0.085, y + 0.005, 0.1], 0.004, 0.004, 3));
}
/** A shelf of shelves: h high, w wide, n boards, depth d; goods per board by callback. */
function shelf(P, w, h, n, d = 0.3, goods = null) {
  for (const sx of [-1, 1]) P.add(W, box(sx * w / 2 - 0.025, 0, -d / 2, sx * w / 2 + 0.025, h, d / 2));
  P.add(W, box(-w / 2, 0, -d / 2, w / 2, 0.04, d / 2));
  for (let k = 1; k <= n; k++) { const yy = h * k / n; P.add(W, box(-w / 2, yy - 0.03, -d / 2, w / 2, yy, d / 2)); goods?.(P, k - 1, yy - 0.03, w, d); }
}
const jarG = (P, x, y, z, r = 0.1, h = 0.22, m = 'pottery_dark') => P.add(m, lathe([[0.001, 0], [r * 0.6, 0], [r, h * 0.35], [r * 1.05, h * 0.6], [r * 0.6, h * 0.92], [r * 0.65, h], [0.001, h]], 8, null, x, y, z));
const stackG = (P, x, y, z, c, n = 4) => { for (let k = 0; k < n; k++) P.add(c, box(x - 0.17, y + k * 0.05, z - 0.14, x + 0.17, y + (k + 1) * 0.05 - 0.004, z + 0.14)); };
/** A rolled quilt: a cylinder along a. */
function quilt(P, len, c = 'cloth_indigo') { P.add(c, lathe([[0.001, -len / 2], [0.13, -len / 2], [0.14, -len / 2 + 0.03], [0.14, len / 2 - 0.03], [0.13, len / 2], [0.001, len / 2]], 8).rotateZ(Math.PI / 2).translate(0, 0.14, 0)); }

// ── the kang: a heated brick platform bed ───────────────────────────────────────────────────
function kang(P, w, d, h = 0.55) {
  P.add('brick_grey', box(-w / 2, 0, -d / 2, w / 2, h, d / 2));
  P.add('earth_wall', box(-w / 2 - 0.02, h - 0.02, -d / 2 - 0.02, w / 2 + 0.02, h + 0.02, d / 2 + 0.02));
  P.add('reed_mat', box(-w / 2 + 0.05, h + 0.02, -d / 2 + 0.05, w / 2 - 0.05, h + 0.034, d / 2 - 0.05));
  P.add('timber', box(-w / 2, h + 0.02, d / 2 - 0.09, w / 2, h + 0.1, d / 2));          // the edge board
}
/** A kitchen range: a brick stove with a wok set in it, a flue, a firebox mouth with ash. */
function range(P, w = 1.4, d = 0.9, h = 0.82, woks = 2) {
  P.add('brick_grey', box(-w / 2, 0, -d / 2, w / 2, h, d / 2));
  P.add('earth_wall', box(-w / 2 - 0.02, h - 0.03, -d / 2 - 0.02, w / 2 + 0.02, h, d / 2 + 0.02));
  for (let k = 0; k < woks; k++) { const x = (k - (woks - 1) / 2) * (w / woks) * 0.95; P.add('iron', lathe([[0.001, h - 0.2], [0.14, h - 0.19], [0.28, h - 0.06], [0.33, h + 0.04], [0.31, h + 0.04], [0.26, h - 0.04], [0.12, h - 0.16], [0.001, h - 0.17]], 12, null, x, 0, 0)); P.add('timber', lathe([[0.001, h + 0.0], [0.31, h + 0.0], [0.31, h + 0.04], [0.001, h + 0.12]], 12, null, x, 0.06, 0).scale(1, 0.01, 1).translate(0, h + 0.06, 0)); }
  P.add('lacquer_black', box(-0.2, 0.12, d / 2, 0.2, 0.38, d / 2 + 0.01));
  P.add('brick_grey', box(w / 2 - 0.3, h, -d / 2 + 0.05, w / 2 - 0.1, h + 1.9, -d / 2 + 0.3));
}

// ── the rooms ─────────────────────────────────────────────────────────────────────────────
/** The refectory (guotang): rows of long tables with benches, bowls set, a rice tub and a ladle at the serving end, a wall board. */
function refectory(f) {
  const { Wd, Dp } = f, rand = rng(9);
  brickFloor(f.S, -Wd / 2 + 0.2, 0.2, Wd / 2 - 0.2, Dp - 0.2, 31);
  const rows = Math.max(2, Math.floor((Dp - 3.2) / 2.4)), L = Wd - 2.2;
  for (let k = 0; k < rows; k++) {
    const b = 1.6 + k * 2.4;
    { const P = new Parts(); longTable(P, L, 0.72, 0.84); for (let i = 0; i < Math.floor(L / 0.9); i++) { const B = new Parts(); place(B, 0, i); B.emit(P, -L / 2 + 0.7 + i * 0.9, 0.84, -0.2, 0); const C = new Parts(); place(C, 0, i + 1); C.emit(P, -L / 2 + 0.7 + i * 0.9, 0.84, 0.18, Math.PI); } f.put(P, 0, b); f.block(-L / 2, b - 0.4, L / 2, b + 0.4, 0.9); }
    for (const s of [-1, 1]) { const P = new Parts(); bench(P, L - 0.4); f.put(P, 0, b + s * 0.62); }
  }
  { const P = new Parts(); vat(P, 0.5, 0.9, 'glaze_white'); f.put(P, Wd / 2 - 0.9, 0.7); f.circle(Wd / 2 - 0.9, 0.7, 0.55, 1.0); }
  { const P = new Parts(); table(P, 1.4, 0.6, 0.9); const B = new Parts(); for (let i = 0; i < 6; i++) place(B, 0, i); B.emit(P, 0, 0.9, 0, 0); f.put(P, -Wd / 2 + 1.2, 0.6); f.block(-Wd / 2 + 0.5, 0.3, -Wd / 2 + 1.9, 0.9, 0.95); }
  { const P = new Parts(); P.add('lacquer_black', box(-0.6, 1.6, -0.02, 0.6, 2.4, 0.02)); P.add('gilt_bronze', box(-0.5, 1.7, 0.0, 0.5, 2.3, 0.045)); f.put(P, 0, 0.12); }
  for (const a of [-Wd / 4, Wd / 4]) { const P = new Parts(); lantern(P, 0.2); f.put(P, a, Dp / 2, 0, f.H - 0.5); }
  f.light(0, 2.2, Dp / 2, '#ffd9a0', 1.3, 9);
}
/** The kitchen: two ranges of woks under a flue, water vats, firewood, a chopping block, baskets of greens, steamers, ladles on the wall. */
function kitchen(f) {
  const { Wd, Dp } = f, rand = rng(21);
  brickFloor(f.S, -Wd / 2 + 0.2, 0.2, Wd / 2 - 0.2, Dp - 0.2, 33, 0);
  for (const [i, a] of [-Wd / 4, Wd / 4].entries()) { const P = new Parts(); range(P, 1.9, 1.0, 0.85, 2); f.put(P, a, 0.75 + 0.05, 0); f.block(a - 1.0, 0.2, a + 1.0, 1.35, 0.9); void i; }
  for (let k = 0; k < 3; k++) { const P = new Parts(); vat(P, 0.44, 0.9); f.put(P, -Wd / 2 + 0.65 + k * 0.95, Dp - 0.7); f.circle(-Wd / 2 + 0.65 + k * 0.95, Dp - 0.7, 0.46, 0.95); }
  { const P = new Parts(); wood(P, 2.2, 1.3, 5); f.put(P, Wd / 2 - 1.3, 0.4, Math.PI / 2); f.block(Wd / 2 - 1.6, 0.0, Wd / 2 - 0.9, 2.4, 1.3); }
  { const P = new Parts(); P.add('timber', lathe([[0.001, 0], [0.3, 0], [0.3, 0.7], [0.001, 0.7]], 10)); P.add('iron', box(-0.01, 0.7, -0.2, 0.01, 0.76, 0.2)); f.put(P, 0, Dp / 2 + 0.3); f.circle(0, Dp / 2 + 0.3, 0.32, 0.75); }
  for (const [a, b] of [[0.9, Dp - 0.5], [1.4, Dp - 0.55], [Wd / 2 - 0.6, Dp - 0.6]]) { const P = new Parts(); P.add('wicker', lathe([[0.001, 0], [0.2, 0], [0.26, 0.2], [0.001, 0.2]], 8)); P.add('lotus_leaf', T(ball(0.2, 0.08, 0.2, 7, 3), 0, 0.22, 0)); f.put(P, a, b); }
  for (const [a, b] of [[0, 2.6], [1.0, 2.8]]) { const P = new Parts(); for (let k = 0; k < 3; k++) P.add('bamboo_culm', lathe([[0.2, k * 0.12], [0.2, k * 0.12 + 0.1], [0.001, k * 0.12 + 0.1]], 8)); P.add('bamboo_culm', lathe([[0.22, 0.36], [0.001, 0.4]], 8)); f.put(P, a - 1.0, b, 0, 0.8); }
  { const P = new Parts(); for (let k = 0; k < 5; k++) { P.add('iron', limb([k * 0.28 - 0.56, 0, 0], [k * 0.28 - 0.56, -0.38, 0], 0.012, 0.012, 3)); P.add('iron', lathe([[0.001, -0.5], [0.07, -0.42], [0.001, -0.38]], 6, null, k * 0.28 - 0.56, 0, 0)); } P.add('timber', box(-0.7, 0, -0.02, 0.7, 0.04, 0.02)); f.put(P, 0, 0.1, 0, 1.9); }
  f.light(0, 2.3, 1.2, '#ff9a4a', 1.6, 8);
}
/** The guest hall (zhike tang): armchairs and tea tables in pairs down both sides, a couch at the back, a painting, tea sets. */
function guest(f) {
  const { Wd, Dp, H } = f;
  brickFloor(f.S, -Wd / 2 + 0.2, 0.2, Wd / 2 - 0.2, Dp - 0.2, 41);
  { const P = new Parts(); carpet(P, Math.min(3.4, Wd - 3), Dp * 0.5); f.put(P, 0, Dp * 0.5); }
  { const P = new Parts(); hangingScroll(P, 1.0, 1.9, 3); f.put(P, 0, 0.1, Math.PI, 1.0); }
  { const P = new Parts(); longTable(P, 2.0, 0.45, 0.9); const S2 = new Parts(); scrollsOnTable(S2, 3); S2.emit(P, -0.4, 0.9, 0); const V = new Parts(); plumVase(V, 2); V.emit(P, 0.5, 0.9, 0); f.put(P, 0, 0.45); f.block(-1.1, 0.2, 1.1, 0.7, 0.95); }
  const n = Math.max(2, Math.floor((Dp - 2.2) / 1.6));
  for (let k = 0; k < n; k++) for (const s of [-1, 1]) {
    const b = 1.9 + k * 1.6, a = s * (Wd / 2 - 1.05);
    { const P = new Parts(); armchair(P); f.put(P, a - s * 0.5, b + 0.0, faceYaw(-s, 0)); f.circle(a - s * 0.5, b, 0.36, 0.9); }
    { const P = new Parts(); stand(P); const T2 = new Parts(); teaSet(T2); T2.emit(P, 0, 0.68, 0); f.put(P, a, b); f.circle(a, b, 0.28, 0.7); }
    { const P = new Parts(); armchair(P); f.put(P, a + s * 0.5, b, faceYaw(s, 0)); f.circle(a + s * 0.5, b, 0.36, 0.9); }
  }
  for (const a of [-Wd / 4, Wd / 4]) { const P = new Parts(); lantern(P, 0.2); f.put(P, a, Dp / 2, 0, H - 0.5); }
  f.light(0, 2.0, Dp / 2, '#ffc890', 1.2, 8);
}
/** The Sixth Patriarch's hall: Huineng seated in his niche (a clay monk figure), the altar table with censer, the iron bell of the Wanli reign hung in its frame, cushions. */
function patriarch(f, ctx, el) {
  const { Wd, Dp, H } = f;
  brickFloor(f.S, -Wd / 2 + 0.2, 0.2, Wd / 2 - 0.2, Dp - 0.2, 51);
  { const P = new Parts(); P.add('granite_grey', box(-1.5, 0, -0.9, 1.5, 0.7, 0.9)); P.add('granite_block', box(-1.6, 0.7, -1.0, 1.6, 0.78, 1.0)); f.put(P, 0, 1.2); f.block(-1.6, 0.2, 1.6, 2.2, 0.8); }
  ctx.__pat = { a: 0, b: 1.2, y: 0.78 };
  { const P = new Parts(); longTable(P, 1.8, 0.5, 0.95); P.add('bronze', lathe([[0.001, 0.95], [0.16, 0.97], [0.2, 1.1], [0.15, 1.2], [0.001, 1.2]], 10)); f.put(P, 0, 3.0); f.block(-1.0, 2.7, 1.0, 3.3, 1.0); }
  for (const a of [-0.8, 0.8]) { const P = new Parts(); P.add('reed_mat', box(-0.28, 0, -0.28, 0.28, 0.03, 0.28)); P.add('cloth_ochre', T(ball(0.24, 0.07, 0.24, 8, 4), 0, 0.08, 0)); f.put(P, a, 4.1); }
  // the iron bell (about 650 kg, 1.3 m tall) hung in a timber frame at the side
  { const P = new Parts(), ax = Wd / 2 - 1.5;
    for (const s of [-1, 1]) { P.add('timber', limb([s * 0.9, 0, -0.5], [s * 0.1, 2.2, 0], 0.07, 0.06, 5)); P.add('timber', limb([s * 0.9, 0, 0.5], [s * 0.1, 2.2, 0], 0.07, 0.06, 5)); }
    P.add('timber', box(-0.9, 2.15, -0.06, 0.9, 2.28, 0.06));
    P.add('iron', limb([0, 2.15, 0], [0, 1.95, 0], 0.03, 0.03, 5));
    P.add('iron', lathe([[0.001, 2.0], [0.12, 1.98], [0.3, 1.78], [0.38, 1.3], [0.5, 0.82], [0.54, 0.78], [0.5, 0.74], [0.001, 0.74]].map(([r, y]) => [r, y - 0.04]), 14));
    P.add('bronze', box(-0.04, 0.0, 0.0, 0.04, 0.05, 0.0));
    f.put(P, ax, Dp * 0.55, 0); f.circle(ax, Dp * 0.55, 0.9, 0.5); }
  { const P = new Parts(); P.add('timber', limb([0, 0, 0], [0.5, 1.9, 0], 0.07, 0.07, 6)); f.put(P, -Wd / 2 + 1.0, Dp * 0.55 - 0.5, 0, 0); }
  for (const a of [-1.9, 1.9]) { const P = new Parts(); candleStand(P, 1.3); f.put(P, a, 2.8); }
  { const P = new Parts(); hangingScroll(P, 0.9, 1.7, 8); f.put(P, 0, 0.1, Math.PI, 1.1); }
  for (const a of [-Wd / 4, Wd / 4]) { const P = new Parts(); lantern(P, 0.3); f.put(P, a, Dp * 0.6, 0, H - 0.5); }
  f.light(0, 1.8, 2.5, '#ffb46b', 1.5, 8);
}
/** A dormitory (the monks' sleeping hall): long platforms (tan) along both walls with a bedroll and a shelf at each place, robes on pegs, a brazier. */
function dorm(f) {
  const { Wd, Dp, H } = f;
  brickFloor(f.S, -Wd / 2 + 0.2, 0.2, Wd / 2 - 0.2, Dp - 0.2, 61);
  const pw = 1.95, n = Math.max(2, Math.floor((Dp - 1.6) / 0.95));
  for (const s of [-1, 1]) {
    { const P = new Parts(); P.add(W, box(-pw / 2, 0.38, -(Dp - 1.4) / 2, pw / 2, 0.46, (Dp - 1.4) / 2)); P.add('reed_mat', box(-pw / 2 + 0.03, 0.46, -(Dp - 1.4) / 2 + 0.03, pw / 2 - 0.03, 0.472, (Dp - 1.4) / 2 - 0.03)); for (let k = 0; k <= 4; k++) P.add(W, box(-pw / 2 + 0.05, 0, -(Dp - 1.4) / 2 + k * (Dp - 1.4) / 4 - 0.05, pw / 2 - 0.05, 0.38, -(Dp - 1.4) / 2 + k * (Dp - 1.4) / 4 + 0.05)); f.put(P, s * (Wd / 2 - pw / 2 - 0.15), Dp / 2 + 0.2); f.block(s * (Wd / 2 - 0.15) - pw / 2 - 0.0, 0.7, s * (Wd / 2 - 0.15), Dp - 0.7, 0.5); }
    for (let k = 0; k < n; k++) {
      const b = 1.0 + k * 0.95, a = s * (Wd / 2 - 0.55);
      { const P = new Parts(); quilt(P, 0.62, ['cloth_grey', 'cloth_ochre', 'cloth_indigo'][k % 3]); f.put(P, a, b, Math.PI / 2, 0.48); }
      { const P = new Parts(); P.add('reed_mat', T(ball(0.12, 0.06, 0.1, 6, 3), 0, 0.55, 0)); f.put(P, a - s * 0.55, b); }
      { const P = new Parts(); P.add('cloth_grey', box(-0.12, 1.7, -0.02, 0.12, 2.15 - (k % 2) * 0.35, 0.02)); P.add('timber', limb([-0.2, 2.2, 0], [0.2, 2.2, 0], 0.012, 0.012, 3)); f.put(P, s * (Wd / 2 - 0.12), b, -s * Math.PI / 2); }
    }
    { const P = new Parts(); shelf(P, 1.0, 1.0, 2, 0.28, (Q, i, yy, w, d) => { if (i) stackG(Q, 0, yy, 0, 'cloth_white', 3); }); f.put(P, s * (Wd / 2 - 0.16), Dp - 0.5, -s * Math.PI / 2); }
  }
  { const P = new Parts(); P.add('iron', lathe([[0.001, 0.25], [0.2, 0.25], [0.26, 0.4], [0.001, 0.4]], 10)); for (const a of [0, 2.1, 4.2]) P.add('iron', limb([Math.cos(a) * 0.2, 0.3, Math.sin(a) * 0.2], [Math.cos(a) * 0.24, 0, Math.sin(a) * 0.24], 0.02, 0.02, 4)); P.add('flame', lathe([[0.001, 0.4], [0.05, 0.43], [0.001, 0.52]], 5)); f.put(P, 0, Dp * 0.5); f.circle(0, Dp * 0.5, 0.28, 0.5); }
  { const P = new Parts(); lantern(P, 0.2); f.put(P, 0, Dp * 0.5, 0, H - 0.55); }
  f.light(0, 1.6, Dp * 0.5, '#ff9e55', 1.2, 7);
}
/** The gate hall (Shanmen): the two Vajra guardians (Heng and Ha) at the sides of the passage, a duty table and a stone drum, the notice board. */
function shanmen(f, ctx) {
  const { Wd, Dp, H } = f;
  brickFloor(f.S, -Wd / 2 + 0.3, 0.3, Wd / 2 - 0.3, Dp - 0.3, 71);
  for (const [i, s] of [-1, 1].entries()) {
    const a = s * (Wd / 2 - 2.6);
    { const P = new Parts(); P.add('granite_grey', box(-1.1, 0, -1.0, 1.1, 0.5, 1.0)); P.add('granite_block', box(-1.2, 0.5, -1.1, 1.2, 0.58, 1.1)); f.put(P, a, 1.8); f.block(a - 1.2, 0.7, a + 1.2, 2.9, 0.6); }
    ctx.__vajra ??= [];
    ctx.__vajra.push({ a, b: 1.8, y: 0.58, robe: i ? 'clay_green' : 'paint_blue' });
  }
  for (const s of [-1, 1]) { const P = new Parts(); bench(P, 1.6); f.put(P, s * 2.1, Dp - 0.9, s ? Math.PI : 0); }
  { const P = new Parts(); table(P, 1.0, 0.5, 0.78); P.add('bronze', lathe([[0.001, 0.78], [0.1, 0.8], [0.12, 0.9], [0.001, 0.9]], 8)); f.put(P, -3.2, Dp - 1.2); f.block(-3.7, Dp - 1.5, -2.7, Dp - 0.9, 0.8); }
  for (const a of [-Wd / 3, Wd / 3]) { const P = new Parts(); lantern(P, 0.3); f.put(P, a, Dp * 0.45, 0, H - 0.6); }
  f.light(0, 2.0, Dp * 0.5, '#ffd9a0', 1.0, 9);
}

// ── the village houses ────────────────────────────────────────────────────────────────────
/** A farmhouse: the kang along the back wall with its stove at one end, a table with stools, a grain bin, a vat, a chest and cabinet, a New Year picture. */
function farmhouse(f, el) {
  const { Wd, Dp, H } = f, rand = rng(el.seed || 5), flip = rand() < 0.5 ? -1 : 1;
  brickFloor(f.S, -Wd / 2 + 0.2, 0.2, Wd / 2 - 0.2, Dp - 0.2, (el.seed || 3) % 97);
  const kw = Wd - 2.2;
  { const P = new Parts(); kang(P, kw, 1.9); const Q = new Parts(); quilt(Q, 0.9, ['cloth_indigo', 'cloth_red', 'cloth_ochre'][Math.floor(rand() * 3)]); Q.emit(P, -kw / 2 + 0.7, 0.58, 0); const Q2 = new Parts(); quilt(Q2, 0.9, 'cloth_grey'); Q2.emit(P, -kw / 2 + 1.9, 0.58, 0);
    const T2 = new Parts(); table(T2, 0.7, 0.5, 0.28, 'flat'); T2.emit(P, kw / 4, 0.6, 0); const B2 = new Parts(); teaSet(B2); B2.emit(P, kw / 4, 0.9, 0);
    f.put(P, flip * (Wd / 2 - 1.1 - kw / 2 + 0.2) - 0.2 * flip, 1.05); f.block(-kw / 2 + flip * 0.0 - 0.0 + flip * (Wd / 2 - 1.1 - kw / 2), 0.1, kw / 2 + flip * (Wd / 2 - 1.1 - kw / 2), 2.0, 0.6); }
  { const P = new Parts(); range(P, 0.9, 0.8, 0.8, 1); f.put(P, -flip * (Wd / 2 - 0.9), 0.7); f.block(-flip * (Wd / 2 - 0.9) - 0.5, 0.2, -flip * (Wd / 2 - 0.9) + 0.5, 1.2, 0.85); }
  { const P = new Parts(); table(P, 1.0, 0.8, 0.76); f.put(P, 0, Dp * 0.55 + 0.4); f.block(-0.55, Dp * 0.55, 0.55, Dp * 0.55 + 0.8, 0.8);
    for (const s of [-1, 1]) { const Q = new Parts(); Q.add(W, box(-0.17, 0.4, -0.17, 0.17, 0.44, 0.17)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) Q.add(W, box(sx * 0.13 - 0.02, 0, sz * 0.13 - 0.02, sx * 0.13 + 0.02, 0.4, sz * 0.13 + 0.02)); f.put(Q, s * 0.8, Dp * 0.55 + 0.4); } }
  { const P = new Parts(); vat(P, 0.36, 0.78); f.put(P, flip * (Wd / 2 - 0.5), Dp - 0.7); f.circle(flip * (Wd / 2 - 0.5), Dp - 0.7, 0.4, 0.85); }
  { const P = new Parts(); P.add('timber', box(-0.45, 0, -0.35, 0.45, 1.1, 0.35)); P.add('wicker', box(-0.4, 1.1, -0.3, 0.4, 1.16, 0.3)); f.put(P, -flip * (Wd / 2 - 0.6), Dp - 0.8, 0); f.block(-flip * (Wd / 2 - 0.6) - 0.5, Dp - 1.2, -flip * (Wd / 2 - 0.6) + 0.5, Dp - 0.4, 1.1); }
  { const P = new Parts(); P.add(W, box(-0.4, 0, -0.22, 0.4, 1.5, 0.22)); P.add('lacquer_black', box(-0.36, 1.0, 0.22, 0.36, 1.45, 0.225)); P.add('lacquer_black', box(-0.36, 0.1, 0.22, 0.36, 0.95, 0.225)); f.put(P, flip * 0.4 + 0.4, 0.35, 0); f.block(flip * 0.4, 0.1, flip * 0.4 + 0.8, 0.6, 1.5); }
  { const P = new Parts(); hangingScroll(P, 0.45, 0.8, 4 + Math.floor(rand() * 8)); f.put(P, 0, 0.08, Math.PI, 1.55); }
  { const P = new Parts(); lampStand(P, 1.0); f.put(P, -flip * 1.3, Dp * 0.55 + 0.9); }
  // corn cobs, braids of garlic and chillies hung from the beam
  { const P = new Parts(); for (let k = 0; k < 6; k++) { const a = -1.6 + k * 0.6; P.add(k % 2 ? 'cloth_red' : 'cloth_ochre', T(ball(0.07, 0.2, 0.07, 6, 3), a, -0.25, 0)); P.add('rope_fibre', limb([a, 0, 0], [a, -0.1, 0], 0.01, 0.01, 3)); } f.put(P, 0, Dp * 0.62, 0, H - 0.55); }
  f.light(0, 1.6, Dp * 0.55, '#ffb878', 1.0, 6);
}
/** A shop interior: a counter across the room, shelves behind it with the trade's goods, scales, a stool, a lamp; the back room curtained. */
const SHELF = {
  tea: (Q, i, yy) => { for (let k = 0; k < 4; k++) jarG(Q, (k - 1.5) * 0.26, yy, 0, 0.09, 0.22, i % 2 ? 'glaze_green' : 'pottery_dark'); },
  food: (Q, i, yy) => { for (let k = 0; k < 4; k++) jarG(Q, (k - 1.5) * 0.26, yy, 0, 0.1, 0.2, 'glaze_white'); },
  rice: (Q, i, yy) => { for (let k = 0; k < 3; k++) Q.add('sacking', box((k - 1) * 0.34 - 0.14, yy, -0.1, (k - 1) * 0.34 + 0.14, yy + 0.22, 0.1)); },
  cloth: (Q, i, yy) => { for (let k = 0; k < 4; k++) stackG(Q, (k - 1.5) * 0.3, yy, 0, ['cloth_indigo', 'cloth_red', 'cloth_ochre', 'cloth_white', 'cloth_grey'][(k + i) % 5], 5); },
  medicine: (Q, i, yy) => { for (let k = 0; k < 6; k++) Q.add('timber', box((k - 2.5) * 0.17 - 0.07, yy, -0.1, (k - 2.5) * 0.17 + 0.07, yy + 0.16, 0.1)); },
  wine: (Q, i, yy) => { for (let k = 0; k < 3; k++) jarG(Q, (k - 1) * 0.34, yy, 0, 0.14, 0.3, 'pottery_dark'); },
  pottery: (Q, i, yy) => { for (let k = 0; k < 4; k++) jarG(Q, (k - 1.5) * 0.26, yy, 0, 0.1, 0.24, i % 2 ? 'glaze_blue' : 'glaze_white'); },
  iron: (Q, i, yy) => { for (let k = 0; k < 4; k++) Q.add('iron', limb([(k - 1.5) * 0.25, yy, 0], [(k - 1.5) * 0.25, yy + 0.3, 0.05], 0.02, 0.015, 4)); },
  books: (Q, i, yy) => { for (let k = 0; k < 4; k++) { const B = new Parts(); books(B, 6, i * 4 + k, 0.2, 0.18); B.emit(Q, (k - 1.5) * 0.26, yy, 0); } },
};
function shopRoom(f, el) {
  const { Wd, Dp, H } = f, rand = rng(el.seed || 7), trade = el.trade || 'tea';
  brickFloor(f.S, -Wd / 2 + 0.2, 0.2, Wd / 2 - 0.2, Dp - 0.2, (el.seed || 3) % 89);
  for (let k = 0; k < Math.max(1, Math.floor((Wd - 0.8) / 1.5)); k++) { const a = -Wd / 2 + 0.7 + k * 1.5 + (Wd - 0.8 - Math.floor((Wd - 0.8) / 1.5) * 1.5) / 2; const P = new Parts(); shelf(P, 1.35, 2.0, 4, 0.34, SHELF[trade] ?? SHELF.tea); f.put(P, a, 0.3); f.block(a - 0.7, 0.1, a + 0.7, 0.5, 2.0); }
  { const P = new Parts(); P.add(W, box(-(Wd - 1.4) / 2, 0, -0.3, (Wd - 1.4) / 2, 0.95, 0.3)); P.add('lacquer_black', box(-(Wd - 1.4) / 2 - 0.04, 0.95, -0.34, (Wd - 1.4) / 2 + 0.04, 1.0, 0.34)); P.add('timber', box(-(Wd - 1.4) / 2 + 0.06, 0.1, 0.3, (Wd - 1.4) / 2 - 0.06, 0.88, 0.304));
    const S2 = new Parts(); S2.add('iron', box(-0.2, 0, 0, 0.2, 0.01, 0.01)); S2.add('timber', limb([0, 0, 0], [0, 0.4, 0], 0.01, 0.01, 3)); S2.emit(P, 0.3, 1.0, 0);
    const T2 = new Parts(); deskBook(T2); T2.emit(P, -0.5, 1.0, 0); f.put(P, 0, Dp * 0.45); f.block(-(Wd - 1.4) / 2, Dp * 0.45 - 0.35, (Wd - 1.4) / 2, Dp * 0.45 + 0.35, 1.0); }
  { const P = new Parts(); P.add(W, box(-0.2, 0.42, -0.2, 0.2, 0.46, 0.2)); for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(W, box(sx * 0.16 - 0.02, 0, sz * 0.16 - 0.02, sx * 0.16 + 0.02, 0.42, sz * 0.16 + 0.02)); f.put(P, 0.8 * (rand() < 0.5 ? -1 : 1), 0.95); }
  { const P = new Parts(); lampStand(P, 1.1); f.put(P, Wd / 2 - 0.5, Dp * 0.6); }
  { const P = new Parts(); lantern(P, 0.3); f.put(P, 0, Dp * 0.75, 0, H - 0.55); }
  f.light(0, 1.7, Dp * 0.6, '#ffc080', 1.1, 7);
}
function deskBook(P) { P.add('cloth_white', box(-0.1, 0, -0.07, 0.1, 0.02, 0.07)); P.add('cloth_indigo', box(-0.105, 0, -0.075, -0.095, 0.02, 0.075)); }

const KIND = { refectory, kitchen, guest, patriarch, dorm, shanmen, farmhouse, shop: shopRoom };
/** shaolin_room { kind, rect, y, H, front, trade?, seed? } */
export function shaolinRoom(el, ctx) {
  const fn = KIND[el.kind];
  if (!fn) throw new Error('shaolin_room: unknown kind ' + el.kind);
  const f = local(el, ctx), c = { ...ctx };
  fn(f, c, el);
  f.done();
  // the statues stand in the world, outside the merged parts
  const yaw = FRONT[el.front ?? 's'][0], [x0, z0, x1, z1] = el.rect, front = el.front ?? 's';
  const origin = { s: [(x0 + x1) / 2, z0], n: [(x0 + x1) / 2, z1], e: [x0, (z0 + z1) / 2], w: [x1, (z0 + z1) / 2] }[front], cs = Math.cos(yaw), sn = Math.sin(yaw);
  const WC = (a, b) => [origin[0] + a * cs + b * sn, origin[1] - a * sn + b * cs];
  const dir = [Math.sin(yaw) * 0 + sn, cs];                    // the local +b (toward the front) as a world direction
  if (c.__pat) { const [wx, wz] = WC(c.__pat.a, c.__pat.b); statue({ at: [wx, wz], y: f.y + c.__pat.y, h: 2.1, dir: [sn, cs], type: 'disciple', robe: 'cloth_ochre', robe2: 'cloth_grey', seed: 616 }, ctx); }
  for (const v of c.__vajra ?? []) { const [wx, wz] = WC(v.a, v.b); statue({ at: [wx, wz], y: f.y + v.y, h: 3.0, dir: [sn, cs], type: 'king', robe: v.robe, robe2: 'lacquer_red', seed: 700 + Math.round(v.a) }, ctx); }
  void dir;
}
