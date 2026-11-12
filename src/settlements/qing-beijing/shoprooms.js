// Ming–Qing Beijing — furnished shop interiors for the shop street (docs/settlements/qing-beijing.md §30):
// a cloth shop, a grain shop, a pawnshop, a wine shop, a lantern shop and a cloth-shoe shop, each inside the shell
// of a `qing_shop` with `enter` (shopfront.js), the middle bay its door. The room's frame is that of interiors.js:
// `a` across (centred), `b` from the back wall (outer face) to the counter line, `y` up. Furniture there faces −z, so
// whatever stands against a wall is turned (yaw: 0 faces the back wall, π faces the street, ±π/2 the side walls).
// Free floor: b 0.5 … Dp − 0.7, a clear aisle of ±0.9 from the door inward.

import { box, lathe } from '../../core/geom.js';
import { Parts, limb } from '../../styles/qing/carving.js';
import { table, chair, stool, bench, frame } from './interiors.js';

const W = 'wood_dark', RED = 'lacquer_red';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const FACE_BACK = 0, FACE_STREET = Math.PI, FACE_A_POS = -Math.PI / 2, FACE_A_NEG = Math.PI / 2;

function setup(el, { bag, col }) {
  const F = frame(el.rect, el.front ?? 'e'), y = el.y, S = new Parts(), rand = rng(el.seed || 7), m = 0.5;
  const put = (Q, a, b, yw = 0, up = 0) => Q.emit(S, a, up, b, yw);
  const blk = (a0, b0, a1, b1, h) => { const p = F.WC(a0, b0), q = F.WC(a1, b1); col.rect([Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])], y, y + h); };
  const Wd = F.Wd, Dp = F.Dp, H = el.H ?? 3.4, hw = Wd / 2 - m;
  return { F, S, put, blk, bag, rand, m, Wd, Dp, H, hw, y };
}
const finish = (R) => R.S.emit(R.bag, R.F.origin[0], R.y + 0.04, R.F.origin[1], R.F.yaw);

/** Shelving against a wall, w wide, h high, rows of boards, depth d; front toward −z. */
function shelving(P, w, h, rows, d = 0.4) {
  for (const s of [-1, 1]) P.add(W, box(s * (w / 2 - 0.03) - 0.03, 0, -d / 2, s * (w / 2 - 0.03) + 0.03, h, d / 2));
  for (let r = 0; r <= rows; r++) P.add(W, box(-w / 2, 0.12 + r * (h - 0.16) / rows, -d / 2, w / 2, 0.16 + r * (h - 0.16) / rows, d / 2));
  P.add('timber', box(-w / 2, 0, d / 2 - 0.02, w / 2, h, d / 2));
}
const rollEnd = (P, mat, x, y, z, r = 0.075, len = 0.5) => P.add(mat, limb([x, y, z], [x, y, z - len], r, r, 6));
function abacus(P, x, y, z) {
  P.add('wood_dark', box(x - 0.17, y, z - 0.07, x + 0.17, y + 0.03, z + 0.07));
  for (const dz of [-0.07, 0.07]) P.add(W, box(x - 0.17, y + 0.03, z + dz - 0.005, x + 0.17, y + 0.06, z + dz + 0.005));
  for (let i = 0; i < 7; i++) { const xx = x - 0.135 + i * 0.045; P.add('timber', limb([xx, y + 0.01, z - 0.07], [xx, y + 0.06, z - 0.07], 0.004, 0.004, 3)); P.add('lacquer_black', lathe([[0.001, 0], [0.014, 0.008], [0.001, 0.016]], 5, null, xx, y + 0.02, z - 0.02)); }
}
const jar = (P, x, z, r, h, y = 0, lid = 'cloth_red') => {
  P.add('pottery_dark', lathe([[0.001, 0], [r * 0.6, 0], [r, h * 0.4], [r * 0.92, h * 0.78], [r * 0.6, h * 0.92], [r * 0.62, h], [r * 0.5, h], [0.001, h - 0.02]], 10, null, x, y, z));
  P.add(lid, lathe([[r * 0.6, h], [r * 0.66, h + 0.05], [r * 0.2, h + 0.14], [0.001, h + 0.16]], 8, null, x, y, z));
};
const sack = (P, x, y, z, r = 0.3) => P.add('sacking', lathe([[0.001, 0], [r, 0.02], [r * 1.15, r * 0.6], [r * 0.9, r * 1.3], [r * 0.4, r * 1.55], [0.001, r * 1.5]], 8, null, x, y, z));
const lantern = (P, mat, x, y, z, r = 0.2, hang = 0.4) => {
  P.add('timber', limb([x, y + 0.1, z], [x, y + 0.1 + hang, z], 0.006, 0.006, 3));
  P.add(mat, lathe([[0.001, 0], [r * 0.6, 0.02], [r, r * 0.9], [r * 0.95, r * 1.7], [r * 0.5, r * 2.2], [0.001, r * 2.24]], 9, null, x, y - r * 1.1, z));
  P.add('lacquer_black', lathe([[r * 0.55, r * 2.15], [r * 0.6, r * 2.15], [r * 0.6, r * 2.25], [r * 0.55, r * 2.25]], 8, null, x, y - r * 1.1, z));
  P.add('gilt_bronze', lathe([[0.001, 0.02], [r * 0.5, 0.02], [r * 0.4, -0.04], [0.001, -0.04]], 7, null, x, y - r * 1.1, z));
  P.add('cloth_red', limb([x, y - r * 1.1 - 0.04, z], [x, y - r * 1.1 - 0.2, z], 0.012, 0.02, 4));
};

// ── the trades ──

/** A cloth shop (bu zhuang): bolts of cloth end-on in the shelving of the back wall, lengths hung from a rail, the counter with its measure. */
export function bjClothShop(el, ctx) {
  const R = setup(el, ctx), { put, blk, Wd, Dp, hw, rand, m } = R, cl = ['cloth_indigo', 'cloth_red', 'cloth_ochre', 'cloth_green', 'cloth_white', 'cloth_maroon', 'cloth_blue', 'cloth_grey'];
  { const w = Wd - 1.1, n = Math.floor(w / 0.2), Q = new Parts(); shelving(Q, w, 2.5, 5, 0.6);
    for (let r = 0; r < 5; r++) for (let i = 0; i < n; i++) rollEnd(Q, cl[(i + r * 3 + (rand() * 3 | 0)) % cl.length], -w / 2 + 0.2 + i * (w - 0.4) / Math.max(1, n - 1), 0.12 + r * 0.46 + 0.2, 0.28, 0.08, 0.5);
    put(Q, 0, m + 0.32, FACE_STREET); blk(-w / 2, m, w / 2, m + 0.65, 2.5); }
  // lengths of cloth hung from a rail along one side wall
  for (const s of [1]) { const Q = new Parts(); Q.add('timber', limb([0, 2.5, -2.0], [0, 2.5, 2.0], 0.025, 0.025, 5));
    for (let i = 0; i < 8; i++) { const t = -1.8 + i * 0.5; Q.add(cl[(i * 3) % cl.length], box(-0.03, 0.9 + rand() * 0.3, t - 0.2, 0.03, 2.5, t + 0.2)); }
    put(Q, s * (hw - 0.15), 3.9, 0); blk(s * hw - 0.3, 1.7, s * hw, 6.1, 1.0); }
  // the counter along the other side: folded stacks, the measuring rod, the abacus; the shopman's stool behind
  { const Q = new Parts(), L = Math.min(3.6, Dp - 4.4); table(Q, 0.75, L, 1.0, W, true);
    for (let i = 0; i < 4; i++) { const z = -L / 2 + 0.35 + i * (L - 0.7) / 3; for (let k = 0; k < 4 + (i % 2); k++) Q.add(cl[(i * 2 + 1) % cl.length], box(-0.3, 1.0 + k * 0.07, z - 0.22, 0.3, 1.07 + k * 0.07, z + 0.22)); }
    Q.add(RED, limb([0.28, 1.04, -L / 2 + 0.2], [0.28, 1.04, L / 2 - 0.2], 0.012, 0.012, 4));
    abacus(Q, -0.1, 1.0, -L / 2 + 0.25);
    put(Q, -(hw - 0.55), 1.8 + L / 2 + 0.2, 0); blk(-hw, 1.8 + 0.2, -hw + 1.1, 1.8 + L + 0.3, 1.0);
    const St = new Parts(); stool(St); put(St, -(hw - 0.1), 3.0, 0); }
  // a low display table in the room's middle, a chair for the customer
  { const Q = new Parts(); table(Q, 1.2, 0.8, 0.8, W, true); for (let k = 0; k < 5; k++) Q.add(cl[(k * 2) % cl.length], box(-0.4, 0.8 + k * 0.06, -0.3, 0.4, 0.86 + k * 0.06, 0.3));
    put(Q, hw - 1.0, Dp - 2.6, 0); blk(hw - 1.6, Dp - 3.0, hw - 0.4, Dp - 2.2, 0.9); const C = new Parts(); chair(C); put(C, hw - 1.0, Dp - 3.6, FACE_STREET); }
  lanternPair(R);
  finish(R);
}

/** A grain shop (liangdian): wooden bins of millet, rice and beans along the back wall, sacks piled by the side wall, the measures, the steelyard. */
export function bjGrainShop(el, ctx) {
  const R = setup(el, ctx), { put, blk, Wd, Dp, hw, rand, m, H } = R, heaps = ['sandstone_yellow', 'cloth_ochre', 'hide_tan', 'cloth_brown', 'brick_buff'];
  { const n = Math.max(2, Math.floor((Wd - 1.0) / 1.15)), bw = (Wd - 1.0) / n;
    for (let i = 0; i < n; i++) { const Q = new Parts(), w = bw - 0.1;
      Q.add(W, box(-w / 2, 0, -0.45, w / 2, 0.14, 0.45));
      for (const [x0, z0, x1, z1] of [[-w / 2, -0.45, w / 2, -0.4], [-w / 2, 0.4, w / 2, 0.45], [-w / 2, -0.45, -w / 2 + 0.05, 0.45], [w / 2 - 0.05, -0.45, w / 2, 0.45]]) Q.add(W, box(x0, 0.14, z0, x1, 0.85, z1));
      Q.add(heaps[(i + (rand() * 2 | 0)) % heaps.length], lathe([[0.001, 0.88], [w * 0.4, 0.84], [w * 0.46, 0.7], [0.001, 0.7]], 9));
      Q.add('plaster_white', box(-0.14, 0.5, -0.452, 0.14, 0.7, -0.45));
      put(Q, -Wd / 2 + 0.5 + bw * (i + 0.5), m + 0.55, FACE_STREET); }
    blk(-hw, m, hw, m + 1.1, 0.9); }
  // sacks piled in a pyramid by the side wall
  { const Q = new Parts(); for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - r; i++) sack(Q, (i - (3 - r) / 2) * 0.62, r * 0.4, 0, 0.3);
    put(Q, hw - 0.5, 4.0, FACE_A_NEG); blk(hw - 1.0, 3.0, hw, 5.2, 1.3); }
  // the counter: measures (dou and sheng), a ladle, the abacus; a scale (the steelyard) hung from a beam
  { const Q = new Parts(); table(Q, 0.8, 2.0, 1.0, W, true);
    for (const [z, h] of [[-0.6, 0.3], [0, 0.2], [0.5, 0.12]]) Q.add('timber', lathe([[0.001, 1.0], [0.16, 1.0], [0.16, 1.0 + h], [0.14, 1.0 + h], [0.14, 1.02], [0.001, 1.02]], 8, null, 0, 0, z));
    abacus(Q, 0.1, 1.0, 0.75);
    put(Q, -(hw - 0.5), 5.6, 0); blk(-hw, 4.5, -hw + 1.0, 6.7, 1.0);
    const S2 = new Parts(); S2.add('timber', limb([0, H - 0.9, 0], [0, H - 0.1, 0], 0.01, 0.01, 3)); S2.add('wood_dark', limb([-0.5, H - 1.0, 0], [0.5, H - 0.95, 0], 0.014, 0.01, 5));
    S2.add('bronze', lathe([[0.001, 0], [0.16, 0.02], [0.18, 0.05], [0.001, 0.06]], 8, null, -0.5, H - 1.4, 0)); S2.add('iron', lathe([[0.001, 0], [0.03, 0.03], [0.001, 0.07]], 6, null, 0.5, H - 1.05, 0));
    for (const x of [-0.5]) for (const a of [0, 2.1, 4.2]) S2.add('timber', limb([x, H - 1.0, 0], [x + Math.cos(a) * 0.15, H - 1.36, Math.sin(a) * 0.15], 0.004, 0.004, 3));
    put(S2, -(hw - 0.6), 3.4, 0); }
  // a row of seed jars with lids by the door
  { const Q = new Parts(); for (let i = 0; i < 3; i++) jar(Q, i * 0.5, 0, 0.2, 0.55, 0, 'cloth_ochre'); put(Q, hw - 1.0, Dp - 1.4, FACE_STREET); blk(hw - 1.5, Dp - 1.8, hw - 0.1, Dp - 1.0, 0.7); }
  lanternPair(R);
  finish(R);
}

/** A pawnshop (dangpu): the high counter with its grille across the room, the pledges behind it (bundles on shelves, garments on rails), the customers' bench before it. */
export function bjPawnShop(el, ctx) {
  const R = setup(el, ctx), { put, blk, Wd, Dp, hw, m, H } = R, zc = Math.max(3.4, Dp * 0.46);
  // the counter: a solid base 1.3 m high with a board on top, then a grille of upright bars to the beam, the little window in it
  { const Q = new Parts(), w = Wd - 1.0;
    Q.add(W, box(-w / 2, 0, -0.3, w / 2, 1.3, 0.3)); Q.add('lacquer_black', box(-w / 2 - 0.04, 1.3, -0.36, w / 2 + 0.04, 1.36, 0.34)); Q.add(RED, box(-w / 2 + 0.1, 0.15, -0.31, w / 2 - 0.1, 1.15, -0.3));
    const n = Math.floor(w / 0.1);
    for (let i = 0; i <= n; i++) { const x = -w / 2 + i * w / n; if (Math.abs(x) < 0.45) continue; Q.add(W, box(x - 0.015, 1.36, -0.06, x + 0.015, 2.7, -0.03)); }
    Q.add(W, box(-w / 2, 2.7, -0.08, w / 2, 2.78, -0.01)); Q.add(W, box(-w / 2, 1.36, -0.08, w / 2, 1.42, -0.01));
    Q.add(W, box(-0.5, 1.9, -0.08, -0.45, 2.7, -0.01)); Q.add(W, box(0.45, 1.9, -0.08, 0.5, 2.7, -0.01)); Q.add('lacquer_black', box(-0.45, 1.9, -0.06, 0.45, 1.96, -0.03));
    abacus(Q, 0.9, 1.36, -0.15);
    put(Q, 0, zc, FACE_STREET); blk(-hw, m, hw, zc + 0.4, 3.0); }
  // behind it: shelves of cloth-wrapped bundles, garments on a pole, iron-bound chests, a strongbox
  { const w = Wd - 1.4, Q = new Parts(); shelving(Q, w, 2.5, 4, 0.5);
    for (let r = 0; r < 4; r++) for (let i = 0; i < Math.floor(w / 0.5); i++) Q.add(['cloth_white', 'cloth_indigo', 'cloth_brown', 'cloth_grey'][(i + r) % 4], box(-w / 2 + 0.2 + i * 0.5, 0.18 + r * 0.55, -0.15, -w / 2 + 0.6 + i * 0.5, 0.18 + r * 0.55 + 0.4, 0.15));
    put(Q, 0, m + 0.3, FACE_STREET); }
  { const Q = new Parts(); Q.add('timber', limb([-1.0, 2.3, 0], [1.0, 2.3, 0], 0.02, 0.02, 5)); for (let i = 0; i < 5; i++) Q.add(['cloth_blue', 'cloth_red', 'cloth_brown', 'cloth_green', 'cloth_indigo'][i], box(-0.9 + i * 0.4, 0.9, -0.02, -0.6 + i * 0.4, 2.3, 0.02)); put(Q, 0, zc - 0.9, 0); }
  // the customers' side: a bench against each side wall, the notice board with the great round 'dang' disc on the wall
  for (const s of [-1, 1]) { const Q = new Parts(); bench(Q, 1.8, 0.46); put(Q, s * (hw - 0.2), zc + 2.0, s > 0 ? FACE_A_NEG : FACE_A_POS); blk(s * hw - 0.2, zc + 1.1, s * hw + 0.2, zc + 2.9, 0.5); }
  { const Q = new Parts(); Q.add('lacquer_black', lathe([[0.001, 0], [0.45, 0], [0.45, 0.04], [0.001, 0.04]], 14, null, 0, 0, 0).rotateX(Math.PI / 2)); Q.add('gilt_bronze', lathe([[0.3, 0.04], [0.43, 0.04], [0.43, 0.055], [0.3, 0.055]], 14).rotateX(Math.PI / 2)); put(Q, hw - 0.04, zc + 2.0, FACE_A_NEG, 1.8);
    const S2 = new Parts(); S2.add(RED, box(-0.35, 0, -0.01, 0.35, 1.0, 0.01)); S2.add('gilt_bronze', box(-0.25, 0.2, 0.01, 0.25, 0.28, 0.015)); S2.add('gilt_bronze', box(-0.25, 0.5, 0.01, 0.25, 0.58, 0.015)); put(S2, -(hw - 0.04), zc + 2.0, FACE_A_POS, 1.1); }
  void H;
  lanternPair(R);
  finish(R);
}

/** A wine shop (jiupu): great jars with red cloth lids along the back wall, the counter with its bamboo dippers and measures, small tables for the drinkers. */
export function bjWineShop(el, ctx) {
  const R = setup(el, ctx), { put, blk, Wd, Dp, hw, rand, m } = R;
  { const n = Math.max(3, Math.floor((Wd - 1.0) / 0.95)), Q = new Parts();
    for (let i = 0; i < n; i++) { const x = -(Wd - 1.0) / 2 + 0.45 + i * ((Wd - 1.0) - 0.9) / Math.max(1, n - 1); jar(Q, x, 0, 0.42, 0.95, 0, 'cloth_red'); Q.add('plaster_white', box(x - 0.1, 0.4, -0.425, x + 0.1, 0.62, -0.42)); }
    put(Q, 0, m + 0.5, FACE_STREET); blk(-hw, m, hw, m + 1.0, 1.1);
    // a shelf of small jars and cups above
    const S2 = new Parts(); S2.add(W, box(-hw + 0.1, 1.9, -0.18, hw - 0.1, 1.95, 0.18)); for (let i = 0; i < Math.floor((Wd - 1.4) / 0.28); i++) jar(S2, -hw + 0.35 + i * 0.28, 0, 0.09, 0.2, 1.95, i % 2 ? 'cloth_white' : 'cloth_red'); put(S2, 0, m + 0.2, FACE_STREET); }
  // the counter with a wine-warming stove, bamboo dippers hung on a rod, tin pitchers and a funnel
  { const Q = new Parts(), L = Math.min(3.0, Dp - 5.0); table(Q, 0.8, L, 1.05, W, true);
    for (let i = 0; i < 4; i++) { const z = -L / 2 + 0.3 + i * (L - 0.6) / 3; Q.add('bamboo_culm', limb([0, 1.05, z], [0.1, 1.5, z], 0.012, 0.012, 4)); Q.add('bamboo_culm', lathe([[0.001, 0], [0.04, 0], [0.045, 0.1], [0.001, 0.1]], 6, null, 0.1, 1.42, z)); }
    Q.add('iron', lathe([[0.001, 0], [0.09, 0.0], [0.12, 0.14], [0.06, 0.2], [0.001, 0.2]], 8, null, 0.0, 1.05, L / 2 - 0.3));
    Q.add('bronze', lathe([[0.001, 0], [0.07, 0], [0.04, 0.08], [0.001, 0.08]], 8, null, 0.0, 1.05, -L / 2 + 0.3));
    put(Q, -(hw - 0.5), 2.3 + L / 2 + 0.2, 0); blk(-hw, 2.4, -hw + 1.0, 2.5 + L, 1.05);
    const Sx = new Parts(); Sx.add('brick_grey', box(-0.4, 0, -0.35, 0.4, 0.8, 0.35)); Sx.add('bronze', lathe([[0.001, 0], [0.2, 0.02], [0.24, 0.16], [0.16, 0.3], [0.001, 0.3]], 10, null, 0, 0.8, 0)); Sx.add('flame', box(-0.12, 0.2, -0.36, 0.12, 0.3, -0.35)); put(Sx, -(hw - 0.5), m + 1.3, FACE_STREET); blk(-hw, m + 0.8, -hw + 0.9, m + 1.8, 0.9); }
  // two small tables with a stool on each side, a dish of peanuts and two cups
  for (let i = 0; i < 2; i++) { const Q = new Parts(); table(Q, 0.7, 0.7, 0.76);
    Q.add('glaze_white', lathe([[0.001, 0], [0.12, 0.01], [0.14, 0.04], [0.001, 0.04]], 8, null, 0, 0.76, 0)); for (const dx of [-0.2, 0.2]) Q.add('glaze_white', lathe([[0.001, 0], [0.04, 0], [0.05, 0.06], [0.001, 0.06]], 6, null, dx, 0.76, 0.12));
    const a = hw - 0.9, b = 4.2 + i * 1.9 + rand() * 0.2; put(Q, a, b, 0); blk(a - 0.4, b - 0.4, a + 0.4, b + 0.4, 0.8);
    for (const s of [-1, 1]) { const St = new Parts(); stool(St); put(St, a + s * 0.62, b); } }
  lanternPair(R);
  finish(R);
}

/** A lantern shop (dengpu): lanterns of every size hung close under the beams, a bench with bamboo ribs and paper, shelves of finished ones at the back. */
export function bjLanternShop(el, ctx) {
  const R = setup(el, ctx), { put, blk, Wd, Dp, hw, rand, m, H } = R, cols = ['lamp_paper', 'cloth_red', 'lamp_paper', 'cloth_ochre', 'cloth_red', 'lamp_paper'];
  { const w = Wd - 1.2, Q = new Parts(); shelving(Q, w, 2.3, 4, 0.5); const n = Math.floor(w / 0.42);
    for (let r = 0; r < 4; r++) for (let i = 0; i < n; i++) { const hh = 0.42 + r * 0.55 - 0.12; Q.add(cols[(i + r) % cols.length], lathe([[0.001, 0], [0.1, 0.02], [0.16, 0.14], [0.1, 0.27], [0.001, 0.3]], 8, null, -w / 2 + 0.3 + i * (w - 0.6) / Math.max(1, n - 1), hh - 0.14, 0)); }
    put(Q, 0, m + 0.3, FACE_STREET); blk(-hw, m, hw, m + 0.6, 2.3); }
  // lanterns hung from the beams in a loose grid, at three heights, clear of the aisle's head height only at the door
  for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) {
    const a = -hw + 0.5 + i * (2 * hw - 1.0) / 3 + (rand() - 0.5) * 0.3, b = 1.4 + j * (Dp - 3.0) / 4 + (rand() - 0.5) * 0.3;
    const Q = new Parts(); lantern(Q, cols[(i + j) % cols.length], 0, 0, 0, 0.14 + rand() * 0.1, 0.3 + rand() * 0.3); put(Q, a, b, 0, H - 0.4 - (rand() < 0.5 ? 0.0 : 0.35) - (j % 2 ? 0.3 : 0));
  }
  // the work bench along a side wall: ribs of split bamboo, a roll of paper, a glue pot, brushes, a half-made lantern
  { const Q = new Parts(), L = Math.min(3.2, Dp - 4.6); table(Q, 0.9, L, 0.85, W, true);
    for (let i = 0; i < 9; i++) Q.add('bamboo_culm', limb([-0.3 + (i % 3) * 0.12, 0.85, -L / 2 + 0.2 + Math.floor(i / 3) * 0.04], [-0.3 + (i % 3) * 0.12, 0.85, -L / 2 + 1.2], 0.006, 0.006, 3));
    Q.add('cloth_white', lathe([[0.001, 0], [0.07, 0], [0.07, 0.34], [0.001, 0.34]], 8).rotateZ(Math.PI / 2).translate(0.1, 0.92, 0.3));
    Q.add('pottery_dark', lathe([[0.001, 0], [0.07, 0], [0.08, 0.1], [0.001, 0.1]], 8, null, -0.2, 0.85, L / 2 - 0.4)); Q.add('cloth_red', lathe([[0.001, 0], [0.06, 0], [0.06, 0.05], [0.001, 0.05]], 8, null, 0.1, 0.85, L / 2 - 0.4));
    lantern(Q, 'cloth_red', 0.2, 1.3, L / 2 - 0.9, 0.16, 0);
    put(Q, -(hw - 0.55), 2.0 + L / 2, 0); blk(-hw, 2.0, -hw + 1.1, 2.1 + L, 0.9);
    const St = new Parts(); stool(St); put(St, -(hw - 1.4), 2.0 + L / 2); }
  // a finished pair on a stand by the door
  { const Q = new Parts(); Q.add(W, box(-0.2, 0, -0.2, 0.2, 0.06, 0.2)); Q.add(W, limb([0, 0.06, 0], [0, 2.0, 0], 0.03, 0.025, 5)); Q.add(W, limb([-0.5, 1.9, 0], [0.5, 1.9, 0], 0.02, 0.02, 4)); for (const s of [-1, 1]) lantern(Q, 'cloth_red', s * 0.45, 1.8, 0, 0.17, 0.0); put(Q, hw - 0.6, Dp - 1.2, 0); blk(hw - 0.9, Dp - 1.5, hw - 0.3, Dp - 0.9, 2.0); }
  finish(R);
}

/** A cloth-shoe shop (xie pu): rows of black cloth shoes on the shelves of the back wall, the cobbler's low bench with lasts and awls, a bench for the customer. */
export function bjShoeShop(el, ctx) {
  const R = setup(el, ctx), { put, blk, Wd, Dp, hw, m, H } = R;
  { const w = Wd - 1.1, rows = 5, n = Math.floor(w / 0.36), Q = new Parts(); shelving(Q, w, 2.4, rows, 0.5);
    for (let r = 0; r < rows; r++) for (let i = 0; i < n; i++) { const x = -w / 2 + 0.25 + i * (w - 0.5) / Math.max(1, n - 1), yy = 0.16 + r * (2.4 - 0.16) / rows + 0.04;
      Q.add('cloth_white', box(x - 0.1, yy, -0.18, x + 0.1, yy + 0.04, 0.18)); Q.add(r % 2 ? 'cloth_black' : 'cloth_indigo', box(x - 0.09, yy + 0.04, -0.17, x + 0.09, yy + 0.12, 0.05)); Q.add('cloth_black', box(x - 0.07, yy + 0.04, 0.05, x + 0.07, yy + 0.09, 0.17)); }
    put(Q, 0, m + 0.32, FACE_STREET); blk(-hw, m, hw, m + 0.65, 2.4); }
  // the cobbler's low bench by a side wall: a stool, lasts (wooden shoe forms) standing on it, an awl, coils of thread, stacked soles
  { const Q = new Parts(); table(Q, 0.5, 1.5, 0.5, W, true);
    for (let i = 0; i < 3; i++) Q.add('timber', box(-0.1, 0.5, -0.6 + i * 0.35, 0.1, 0.62, -0.42 + i * 0.35));
    for (let k = 0; k < 6; k++) Q.add('cloth_white', box(0.0, 0.5 + k * 0.025, 0.35, 0.18, 0.525 + k * 0.025, 0.65)); Q.add('iron', limb([-0.1, 0.5, 0.15], [-0.1, 0.62, 0.15], 0.006, 0.002, 3)); Q.add('cloth_white', lathe([[0.001, 0], [0.04, 0], [0.04, 0.05], [0.001, 0.05]], 6, null, 0.1, 0.5, 0.05));
    put(Q, -(hw - 0.4), 3.4, 0); blk(-hw, 2.6, -hw + 0.8, 4.2, 0.62);
    const St = new Parts(); stool(St, 0.3, 0.32); put(St, -(hw - 1.1), 3.4); }
  // a long bench with a pair of shoes to try; strings of straw sandals hung from the beam
  { const Q = new Parts(); bench(Q, 1.6, 0.46); put(Q, hw - 0.2, 5.0, FACE_A_NEG); blk(hw - 0.4, 4.1, hw, 5.9, 0.5); }
  { const Q = new Parts(); Q.add('timber', limb([0, H - 0.6, -1.0], [0, H - 0.6, 1.0], 0.02, 0.02, 5)); for (let i = 0; i < 6; i++) { Q.add('timber', limb([0, H - 0.6, -0.9 + i * 0.36], [0, H - 1.0, -0.9 + i * 0.36], 0.004, 0.004, 3)); Q.add('wicker', box(-0.05, H - 1.35, -0.99 + i * 0.36, 0.05, H - 1.0, -0.8 + i * 0.36)); } put(Q, hw - 0.9, 3.2, 0); }
  lanternPair(R);
  finish(R);
}

/** Two red paper lanterns hung under the beam over the door bay, every shop's. */
function lanternPair(R) {
  const { put, H, Dp } = R;
  for (const a of [-0.9, 0.9]) { const Q = new Parts(); lantern(Q, 'cloth_red', 0, 0, 0, 0.17, 0.35); put(Q, a, Dp - 1.2, 0, H - 0.65); }
}
void RED;
