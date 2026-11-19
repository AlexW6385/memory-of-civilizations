// The wall, its gate tower and the temple's court, looked at close (docs/settlements/ming-suzhou.md §26): the gate tower furnished
// as a watch-post (guards' room, weapon racks, the drum and the water-clock, a notice board, the guards), the weathering of the wall (plants
// in the joints, stains under the parapet), the wall-walk routes, the court's old camphors in their railings, the stelae on tortoises,
// the pond for released fish, and the people at the gate. All fine work: drawn only near (plans with `near`), one geometry per material
// per element; every variation from a hash of the piece's place (the same plan builds the same geometry).

import { Parts, box, lathe, limb, T, ball, table, teaSet } from './props.js';
import { Acc, hash } from './townwork.js';
import { figure } from '../../objects/figures.js';
import { drum, bell } from './templehall.js';

const PI = Math.PI;
const put = (P, build, x, y, z, yaw = 0, s = 1) => { const Q = new Parts(); build(Q); Q.emit(P, x, y, z, yaw, s); };

// ── the gate tower as a watch-post ──────────────────────────────────────────
/** A rack of weapons against a wall (local: the wall at z = 0, the weapons leaning out toward +z): two posts, a rail, spears and halberds. */
function weaponRack(P, w, seed) {
  for (const s of [-1, 1]) P.add('timber', box(s * w / 2 - 0.04, 0, -0.04, s * w / 2 + 0.04, 1.3, 0.2));
  P.add('timber', box(-w / 2, 0.7, 0.06, w / 2, 0.76, 0.14)); P.add('timber', box(-w / 2, 0.25, 0.06, w / 2, 0.3, 0.14));
  const n = Math.floor(w / 0.17);
  for (let k = 0; k < n; k++) {
    const x = -w / 2 + 0.12 + k * (w - 0.24) / Math.max(1, n - 1), h = 2.0 + 0.3 * hash(seed, k, 1), lean = 0.04 + 0.04 * hash(seed, k, 2), halb = hash(seed, k, 3) > 0.6;
    P.add('timber', limb([x, 0.05, 0.1], [x, h, 0.1 + lean * 3], 0.016, 0.012, 5));
    P.add('steel_grey', limb([x, h, 0.1 + lean * 3], [x, h + 0.22, 0.1 + lean * 3.2], 0.02, 0.002, 5));
    if (halb) P.add('steel_grey', box(x - 0.1, h - 0.18, 0.1 + lean * 3 - 0.01, x + 0.012, h - 0.04, 0.1 + lean * 3 + 0.01));
    P.add('cloth_red', T(ball(0.02, 0.035, 0.02, 6, 4), x, h - 0.06, 0.1 + lean * 3));   // the tassel
  }
}
/** A water clock (louhu) of three stepped bronze jars on a stand, a float-rod in the lowest: 1.9 m. */
function clepsydra(P) {
  P.add('timber', box(-0.5, 0, -0.3, 0.5, 0.06, 0.3));
  for (const [k, y, r] of [[0, 0.06, 0.26], [1, 0.62, 0.22], [2, 1.18, 0.2]]) {
    P.add('timber', box(-0.42, y + 0.34 - 0.02, -0.24, 0.42, y + 0.38, 0.24)); if (k) for (const s of [-1, 1]) P.add('timber', box(s * 0.4 - 0.025, y - 0.2, -0.22, s * 0.4 + 0.025, y + 0.34, 0.22));
    P.add('bronze', lathe([[0.001, 0], [r * 0.8, 0], [r, 0.05], [r * 1.05, 0.2], [r * 0.9, 0.3], [r * 0.8, 0.32], [r * 0.7, 0.3], [r * 0.7, 0.18], [0.001, 0.05]], 14, null, 0, y + 0.4 - 0.06, 0));
    if (k < 2) P.add('bronze', limb([r * 0.7, y + 0.56, 0.05], [r * 0.7 + 0.14, y + 0.52, 0.05], 0.014, 0.01, 5));   // the spout
  }
  P.add('bronze', limb([0.05, 1.62, 0], [0.05, 2.0, 0], 0.01, 0.008, 4));
  P.add('timber', box(-0.1, 1.9, -0.012, 0.16, 1.95, 0.012));
}
/** A notice board on two posts: a plain board (its writing is for the sign-writers), a tiled hood. */
function noticeBoard(P, w, h) {
  for (const s of [-1, 1]) P.add('timber', box(s * w / 2 - 0.05, 0, -0.05, s * w / 2 + 0.05, h + 0.4, 0.05));
  P.add('wood_ochre', box(-w / 2 + 0.05, 0.9, -0.03, w / 2 - 0.05, h, 0.03));
  P.add('tile_dark', box(-w / 2 - 0.1, h + 0.28, -0.14, w / 2 + 0.1, h + 0.4, 0.16));
}
/** gate_tower_in { x, z (the wall's middle), y (the hall's floor), w (the hall's width), seed }: the furniture and the watch of the gate hall over the north gate. */
export function gateTowerIn(el, ctx) {
  const { bag, col } = ctx, { x, z, y } = el, w = el.w ?? 17, P = new Parts();
  const xa = x - w / 2 + 0.55, xb = x + w / 2 - 0.55, zn = z - 2.5 + 0.4, zs = z + 2.5 - 0.4, sd = el.seed ?? 7;
  // the west room: the guards' bench against the back wall, a table with tea, the weapon racks on the end wall, two bedrolls
  put(P, (Q) => table(Q, 2.6, 0.55, 0.46), x - 5.4, y, zn + 0.45);
  col.rect([x - 6.7, zn + 0.15, x - 4.1, zn + 0.75], y, y + 0.5);
  put(P, (Q) => table(Q, 1.0, 0.7, 0.76), x - 4.6, y, zn + 2.0);
  col.rect([x - 5.1, zn + 1.65, x - 4.1, zn + 2.35], y, y + 0.8);
  put(P, (Q) => teaSet(Q), x - 4.75, y + 0.76, zn + 2.0); put(P, (Q) => teaSet(Q), x - 4.35, y + 0.76, zn + 2.1, 1.2);
  put(P, (Q) => weaponRack(Q, 2.2, sd), xa + 0.1, y, zn + 1.5, PI / 2); col.rect([xa, zn + 0.4, xa + 0.45, zn + 2.6], y, y + 2.3);
  put(P, (Q) => weaponRack(Q, 1.8, sd + 5), x - 7.0, y, zn, 0); col.rect([x - 7.9, zn, x - 6.1, zn + 0.45], y, y + 2.3);
  for (const k of [0, 1]) {
    const bx = x - 7.4 + k * 0.0, bz = zs - 0.6 - k * 0.0;
    void bx; void bz;
  }
  P.add('cloth_grey', box(x - 7.7, y, zs - 1.2, x - 5.9, y + 0.16, zs - 0.45)); P.add('cloth_brown', box(x - 7.6, y + 0.16, zs - 1.15, x - 5.6, y + 0.22, zs - 0.5));
  col.rect([x - 7.7, zs - 1.2, x - 5.9, zs - 0.45], y, y + 0.3);
  // the east room: the great drum on its stand, the water clock, the notice board, a stool
  put(P, drum, x + 5.2, y, z - 0.1, 0, 0.9); col.rect([x + 4.4, z - 0.6, x + 6.0, z + 0.4], y, y + 1.9);
  put(P, clepsydra, x + 7.4, y, zn + 0.6, 0); col.rect([x + 6.9, zn, x + 7.9, zn + 1.0], y, y + 2.0);
  put(P, (Q) => noticeBoard(Q, 1.6, 1.7), x + 3.2, y, zn + 0.18, 0);
  P.add('timber', box(x + 3.6, y, zs - 0.9, x + 4.1, y + 0.42, zs - 0.4)); col.rect([x + 3.6, zs - 0.9, x + 4.1, zs - 0.4], y, y + 0.45);
  // the lamps: an iron lantern pole at the door, hung (unlit by day) – the night's light is lamps.js'
  P.emit(bag);
  // the watch: two on the bench with the tea, two at the door with spears, one at the drum
  const g = (id, gx, gz, rot, o = {}) => figure({ at: [gx, gz], y, rot, seed: 3300 + id, dress: 'tunic', cloth: 'cloth_indigo', cloth2: 'cloth_red', skin: 'skin_medium', hat: 'cap', hair: 'netknot', over: 'belt', pose: 'stand', ...o }, ctx);
  g(1, x - 5.9, zn + 0.7, PI, { pose: 'sit' }); g(2, x - 4.9, zn + 0.7, PI, { pose: 'sit', cloth: 'cloth_brown' });
  g(3, x - 2.5, zs - 0.5, PI, { pose: 'staff', carry: 'staff', len: 2.3 }); g(4, x + 2.5, zs - 0.5, PI, { pose: 'staff', carry: 'staff', len: 2.3 });
  g(5, x + 5.2, z + 0.9, PI, { pose: 'stand', cloth: 'cloth_brown' });
  void bell;
}

// ── the wall's weathering ───────────────────────────────────────────────────
/**
 * wall_weather { x0, x1, z (the wall's middle), base, top, H, skip: [[x0, x1]] (the gates), seed }: tufts of grass and small shrubs in the joints
 * at the plinth's top, in the courses higher up and along the wall-walk's edge, rain stains under the parapet and the string course, a darker foot
 * where the damp rises; on both faces. One geometry per material.
 */
export function wallWeather(el, { bag }) {
  const acc = new Acc(), { x0, x1, z, base: B, top: T0, H } = el, bat = (B - T0) / 2, zn = z - B / 2, zp = z + B / 2, sd = el.seed ?? 1;
  const zf = (y) => zn + bat * y / H, zb = (y) => zp - bat * y / H, skip = el.skip || [];
  const inSkip = (x) => skip.some(([a, b]) => x > a - 0.6 && x < b + 0.6);
  const tuft = (px, py, pz, nz, s, k) => {   // blades in two crossed planes standing out from the face (nz = ±1, the face's outward direction)
    const mat = hash(px, pz, k) > 0.7 ? 'lotus_leaf' : 'palm_leaf', n = 5 + Math.floor(hash(px, py, 4) * 4);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * PI * 1.0 - PI / 2, lean = Math.sin(a) * 0.55 * s, h = (0.6 + 0.6 * hash(px + i, py, 5)) * s * 0.4, w = 0.012 + 0.01 * s;
      const dx = Math.cos(a) * 0.1 * s, bx = px + (hash(px, i, 6) - 0.5) * 0.08;
      acc.quad(mat, [bx - w, py, pz], [bx + w, py, pz], [bx + dx + lean * 0.4 + w * 0.2, py + h, pz + nz * Math.abs(lean) * 0.5 + nz * 0.05], [bx + dx + lean * 0.4, py + h, pz + nz * Math.abs(lean) * 0.5 + nz * 0.05], true);
    }
    if (s > 1.3) acc.quad('sod', [px - 0.14, py - 0.02, pz], [px + 0.14, py - 0.02, pz], [px + 0.1, py + 0.07, pz + nz * 0.08], [px - 0.1, py + 0.07, pz + nz * 0.08], true);   // the tuft's earth in the joint
  };
  for (let xx = x0 + 0.7; xx < x1 - 0.5; xx += 1.05) {
    if (inSkip(xx)) continue;
    for (const [face, nz] of [[zf, -1], [zb, 1]]) {
      const hx = hash(xx, nz, sd);
      if (hx < 0.38) { const y = 1.97; tuft(xx + (hash(xx, 9, nz) - 0.5) * 0.6, y, face(y) + nz * 0.02, nz, 1 + hx * 2.2, 1); }               // at the plinth's top
      if (hx > 0.82) { const y = 2.6 + hash(xx, 3, sd) * 2.4; tuft(xx, y, face(y) + nz * 0.02, nz, 0.7 + hx, 2); }                                 // in a high course
      if (hx > 0.45 && hx < 0.56) { const y = H - 0.6; tuft(xx, y, face(y) + nz * 0.02, nz, 1.1, 3); }                                           // on the string course under the parapet
    }
    // the stains: a dark streak run down from the string course under the parapet, wider at the top, and the damp foot
    const hs = hash(xx, 7, sd);
    if (hs < 0.4) for (const [face, nz] of [[zf, -1], [zb, 1]]) {
      const len = 1.2 + 3.0 * hash(xx, 8, sd), w0 = 0.12 + 0.16 * hash(xx, 10, sd), yt = H - 0.55, yb = yt - len, o = nz * 0.014;
      acc.quad('granite_black', [xx - w0, yt, face(yt) + o], [xx + w0, yt, face(yt) + o], [xx + w0 * 0.3, yb, face(yb) + o], [xx - w0 * 0.3, yb, face(yb) + o], true);
    }
  }
  for (const [face, nz] of [[zf, -1], [zb, 1]]) for (let xx = x0; xx < x1; xx += 6) {   // the damp foot, an uneven band
    if (inSkip(xx + 3)) continue;
    const w = 6 - 0.2, h = 0.3 + 0.35 * hash(xx, nz, 11), o = nz * 0.016, y0 = 1.95;
    acc.quad('granite_black', [xx, y0, face(y0) + o], [xx + w, y0, face(y0) + o], [xx + w * 0.8, y0 + h, face(y0 + h) + o], [xx + w * 0.2, y0 + h, face(y0 + h) + o], true);
  }
  acc.flush(bag);
}

// ── the wall-walk routes ────────────────────────────────────────────────────
/** The routes walk-check follows on the wall: up each stair-ramp, along the wall-walk both ways, and at the gate hall in and out. */
export function wallWalks({ z, base: B, top, H, ramps, tower }) {
  const bat = (B - top) / 2, zp = z + B / 2, zT = zp - bat, zw = z + 0.5, out = [];
  for (const rx of ramps) {
    const r = [[rx, zp + 17.5], [rx, zp + 12], [rx, zp + 2], [rx, zT - 0.5], [rx, zw]];
    const east = rx > 0, t = tower, zf = zT - 0.7;   // (zf: the platform's walk before the hall's front)
    if (t) {
      const side = east ? -1 : 1;
      r.push([east ? t + 14 : t - 13, zw]);
      r.push(east ? [t + 14, zf] : [t - 13, zf]);
      r.push([t + side * 3.5, zf], [t, zf], [t, zw - 0.4], [t + side * 3.8, zw - 0.4], [t, zw - 0.4], [t, zf]);
      r.push([t + (east ? 14 : -13), zf], [t + (east ? 14 : -13), zw]);
    }
    r.push(east ? [rx + 30, zw] : [rx - 36, zw]);
    r.y0 = 0; out.push(r);
  }
  return out;
}

// ── the court ───────────────────────────────────────────────────────────────
/** An old camphor (xiangzhang): a flared trunk, three limbs, a broad crown of blobs of leaf; about 12 m at s = 1. */
function oldTree(P, s, seed) {
  P.add('bark_grey', lathe([[0.001, 0], [1.1 * s, 0], [0.95 * s, 0.3 * s], [0.78 * s, 1.2 * s], [0.7 * s, 2.4 * s], [0.62 * s, 3.2 * s], [0.001, 3.3 * s]], 10).scale(1, 1, 0.92));
  for (let k = 0; k < 4; k++) {   // the roots on the ground
    const a = k * 1.7 + seed; P.add('bark_grey', limb([Math.cos(a) * 0.6 * s, 0.5 * s, Math.sin(a) * 0.6 * s], [Math.cos(a) * 1.6 * s, 0.0, Math.sin(a) * 1.6 * s], 0.28 * s, 0.1 * s, 5));
  }
  const tops = [];
  for (let k = 0; k < 3; k++) {
    const a = k * 2.1 + hash(seed, k, 1) * 1.2, L = 2.6 + hash(seed, k, 2) * 1.4, e = [Math.cos(a) * L * s, 6.4 * s + hash(seed, k, 3) * s, Math.sin(a) * L * s];
    P.add('bark_grey', limb([0, 2.9 * s, 0], [e[0] * 0.5, 4.6 * s, e[2] * 0.5], 0.4 * s, 0.26 * s, 6)); P.add('bark_grey', limb([e[0] * 0.5, 4.6 * s, e[2] * 0.5], e, 0.26 * s, 0.14 * s, 6));
    tops.push(e);
  }
  tops.push([0, 7.2 * s, 0]);
  for (let k = 0; k < 15; k++) {
    const t = tops[k % tops.length], a = hash(seed, k, 4) * 6.28, r = (1.2 + 1.8 * hash(seed, k, 5)) * s, rr = (2.0 + 1.3 * hash(seed, k, 6)) * s;
    P.add(k % 3 ? 'palm_leaf' : 'lotus_leaf', T(ball(rr, rr * 0.7, rr, 9, 6), t[0] + Math.cos(a) * r, t[1] + (hash(seed, k, 7) - 0.3) * 2.4 * s, t[2] + Math.sin(a) * r));
  }
}
/** The stone railing round a tree: eight posts on a ring, two rails; r the ring's radius. */
function treeRail(P, r) {
  for (let k = 0; k < 8; k++) {
    const a = k / 8 * PI * 2, b = (k + 1) / 8 * PI * 2, A = [Math.cos(a) * r, 0, Math.sin(a) * r], Bp = [Math.cos(b) * r, 0, Math.sin(b) * r];
    P.add('granite_grey', box(A[0] - 0.09, 0, A[2] - 0.09, A[0] + 0.09, 0.95, A[2] + 0.09)); P.add('granite_grey', lathe([[0.001, 0], [0.08, 0.02], [0.09, 0.08], [0.001, 0.18]], 8, null, A[0], 0.95, A[2]));
    for (const h of [0.82, 0.38]) P.add('granite_block', limb([A[0], h, A[2]], [Bp[0], h, Bp[2]], 0.045, 0.045, 5));
    P.add('granite_block', box((A[0] + Bp[0]) / 2 - 0.1, 0, (A[2] + Bp[2]) / 2 - 0.1, (A[0] + Bp[0]) / 2 + 0.1, 0.12, (A[2] + Bp[2]) / 2 + 0.1));
  }
}
/** A stela on a tortoise (bixi), facing +z: the shell, the head on a long neck, four feet, the stela in a slot, its top of two entwined dragons; 2.9 m. */
function stela(P, seed) {
  const j = 0.95 + 0.1 * hash(seed, 1, 1);
  P.add('granite_grey', T(ball(0.56, 0.24, 1.0 * j, 12, 6), 0, 0.24, 0));
  P.add('granite_block', T(ball(0.5, 0.1, 0.9 * j, 12, 4), 0, 0.46, 0));
  for (let k = -2; k <= 2; k++) P.add('granite_grey', limb([-0.38, 0.52, k * 0.34], [0.38, 0.52, k * 0.34], 0.012, 0.012, 3));      // the shell's plates
  P.add('granite_grey', limb([0, 0.28, 0.8 * j], [0, 0.44, 1.18 * j], 0.2, 0.16, 7)); P.add('granite_grey', T(ball(0.19, 0.16, 0.24, 8, 5), 0, 0.46, 1.34 * j));
  for (const s of [-1, 1]) { P.add('lacquer_red', T(ball(0.02, 0.02, 0.02, 5, 3), s * 0.08, 0.5, 1.46 * j)); P.add('granite_grey', limb([s * 0.5, 0.22, 0.55], [s * 0.62, 0.0, 0.7], 0.14, 0.17, 5)); P.add('granite_grey', limb([s * 0.5, 0.22, -0.55], [s * 0.62, 0.0, -0.7], 0.14, 0.17, 5)); }
  P.add('granite_grey', box(-0.52, 0.5, -0.17, 0.52, 0.64, 0.17));
  P.add('granite_block', box(-0.44, 0.64, -0.12, 0.44, 2.3, 0.12));
  P.add('granite_grey', box(-0.5, 2.3, -0.15, 0.5, 2.38, 0.15));
  for (const s of [-1, 1]) { P.add('granite_grey', T(ball(0.2, 0.3, 0.1, 8, 5), s * 0.2, 2.6, 0)); P.add('granite_block', limb([s * 0.4, 2.38, 0], [s * 0.1, 2.85, 0], 0.07, 0.04, 5)); }
  P.add('granite_grey', T(ball(0.1, 0.1, 0.07, 6, 4), 0, 2.86, 0));
  P.add('granite_grey', box(-0.3, 2.0, 0.12, 0.3, 2.04, 0.125));   // (the plain panel for the inscription)
}
/** The pond for released fish: a stone-edged basin, water, carp (red, white and ochre) and lotus leaves. rect [x0, z0, x1, z1] */
function fishPond(P, rect, y) {
  const [x0, z0, x1, z1] = rect, ys = y + 0.42;
  P.add('granite_block', box(x0, y, z0, x1, y + 0.6, z0 + 0.4)); P.add('granite_block', box(x0, y, z1 - 0.4, x1, y + 0.6, z1));
  P.add('granite_block', box(x0, y, z0 + 0.4, x0 + 0.4, y + 0.6, z1 - 0.4)); P.add('granite_block', box(x1 - 0.4, y, z0 + 0.4, x1, y + 0.6, z1 - 0.4));
  P.add('granite_grey', box(x0 - 0.06, y + 0.6, z0 - 0.06, x1 + 0.06, y + 0.66, z0 + 0.46)); P.add('granite_grey', box(x0 - 0.06, y + 0.6, z1 - 0.46, x1 + 0.06, y + 0.66, z1 + 0.06));
  P.add('granite_grey', box(x0 - 0.06, y + 0.6, z0 + 0.4, x0 + 0.46, y + 0.66, z1 - 0.4)); P.add('granite_grey', box(x1 - 0.46, y + 0.6, z0 + 0.4, x1 + 0.06, y + 0.66, z1 - 0.4));
  P.add('water', box(x0 + 0.4, y, z0 + 0.4, x1 - 0.4, ys, z1 - 0.4));
  const W = x1 - x0 - 1.0, D = z1 - z0 - 1.0;
  for (let k = 0; k < 11; k++) {
    const fx = x0 + 0.5 + W * hash(x0, k, 1), fz = z0 + 0.5 + D * hash(z0, k, 2), a = hash(k, x0, 3) * 6.28, L = 0.2 + 0.1 * hash(k, 5, 4), c = ['cloth_red', 'paint_white', 'cloth_ochre', 'cloth_red'][k % 4];
    const dx = Math.cos(a), dz = Math.sin(a);
    P.add(c, T(ball(L, 0.025, L * 0.32, 8, 4), fx, ys + 0.004, fz).rotateY(-a));
    P.add(c, limb([fx - dx * L * 0.9, ys + 0.004, fz - dz * L * 0.9], [fx - dx * L * 1.5, ys + 0.004, fz - dz * L * 1.5 + 0.06], 0.02, 0.07, 4));
  }
  for (let k = 0; k < 6; k++) { const fx = x0 + 0.6 + (x1 - x0 - 1.2) * hash(x1, k, 5), fz = z0 + 0.6 + (z1 - z0 - 1.2) * hash(z1, k, 6); P.add('lotus_leaf', lathe([[0.001, 0], [0.26, 0.004], [0.3, 0.02], [0.001, 0.01]], 10, null, fx, ys + 0.004, fz)); }
}
/** court_work { y, trees: [[x, z, s]], stelae: [[x, z, yaw]], pond: rect }: the old trees with their rails, the stelae, the pond. */
export function courtWork(el, { bag, col }) {
  const P = new Parts(), y = el.y;
  for (const [x, z, s] of el.trees || []) {
    put(P, (Q) => oldTree(Q, s, Math.round(x * 3 + z)), x, y, z); put(P, (Q) => treeRail(Q, 2.1 * s), x, y, z);
    col.circle(x, z, 2.25 * s, y, y + 1.0); col.circle(x, z, 0.85 * s, y + 1.0, y + 5);
  }
  for (const [x, z, yaw] of el.stelae || []) { put(P, (Q) => stela(Q, Math.round(x + z)), x, y, z, yaw); col.circle(x, z, 0.9, y, y + 3); }
  if (el.pond) { fishPond(P, el.pond, y); col.rect(el.pond, y, y + 0.7); }
  P.emit(bag);
}
/** court_life { y, people: [{ id, at, rot, ...figure options }] }: the people of the gate and the court, each a figure. */
export function courtLife(el, ctx) {
  for (const p of el.people) figure({ y: el.y, ...p, seed: 4400 + p.id, at: p.at }, ctx);
}
