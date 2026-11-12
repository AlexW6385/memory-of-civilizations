// The ground floors of a Victorian shop and a public house, to walk into (docs/settlements/london.md §6b). Both are drawn in
// the frame of the lot that shops.js sets up: u along the street, d outward from the front wall — here v = −d inward from the
// front face. The shell (front wall pierced by the shop window and the door, party walls, back wall, boards for the floor, the
// ceiling under the upper floors) is hollow; the upper floors stay shut. People stand in them (the shopkeeper, the publican, customers).

import { lathe } from '../../core/geom.js';
import { figure } from '../../objects/figures.js';

const pick = (rand, a) => a[Math.floor(rand() * a.length)];
/** a frame's interior helpers: IB a box (v inward), IC its collision, W both, IL a lathe at (u, v), the floor, a point, a face turned toward b */
function inner(F) {
  const { B, C, L, bag, col, x0, x1, zf, sg, y } = F;
  const IB = (m, u0, u1, ya, yb, v0, v1) => B(m, u0, u1, ya, yb, -v1, -v0);
  const IC = (u0, u1, ya, yb, v0, v1) => C(u0, u1, ya, yb, -v1, -v0);
  const W = (m, u0, u1, ya, yb, v0, v1) => { IB(m, u0, u1, ya, yb, v0, v1); IC(u0, u1, ya, yb, v0, v1); };
  const IL = (m, prof, n, u, ya, v) => L(m, prof, n, u, ya, -v);
  const floor = (u0, u1, v0, v1, yy) => { const za = zf - sg * v1, zb = zf - sg * v0; col.floor([x0 + u0, Math.min(za, zb), x0 + u1, Math.max(za, zb)], yy); };
  const pt = (u, v) => [x0 + u, zf - sg * v];
  const turn = (a, b) => Math.atan2(-(b[0] - a[0]), -(b[1] - a[1]));
  void bag; void x1; void y;
  return { IB, IC, W, IL, floor, pt, turn };
}
/** a person standing in the room at (u, v) turned toward (tu, tv) */
function person(F, I, ctx, u, v, toward, o) {
  const at = I.pt(u, v), to = I.pt(toward[0], toward[1]);
  figure({ t: 'figure', at, y: F.y + 0.1, rot: I.turn(at, to), h: 1.62 + (((u * 7 + v * 3) % 1 + 1) % 1) * 0.14, skin: 'skin_light', feet: 'shod', seed: Math.floor(u * 977 + v * 331) + 11, ...o }, ctx);
}
const SHOP_STOCK = { bolts: 'cloth', jars: 'jar', hooks: 'box', carboys: 'bottle', loaves: 'loaf', boxes: 'box', boots: 'boot', wigs: 'box', baskets: 'basket' };
/** a run of shelves on a wall: axis 'u' along the street with the wall at v = wall, 'v' along the depth with the wall at u = wall; the shelves stand dir (±1) from it */
function shelves(F, I, rand, tr, { axis, a0, a1, wall, dir, tiers = [0.5, 1.05, 1.6, 2.15], depth = 0.34, fy }) {
  const { IB, IL } = I, G = tr.goods, kind = SHOP_STOCK[tr.kind] ?? 'box';
  const D = (d0, d1) => dir > 0 ? [wall + d0, wall + d1] : [wall - d1, wall - d0];
  const box = (m, p0, p1, ya, yb, d0, d1) => { const [e0, e1] = D(d0, d1); if (axis === 'u') IB(m, p0, p1, ya, yb, e0, e1); else IB(m, e0, e1, ya, yb, p0, p1); };
  const lathe_ = (m, prof, p, ya, d) => { const e = dir > 0 ? wall + d : wall - d; if (axis === 'u') IL(m, prof, 8, p, ya, e); else IL(m, prof, 8, e, ya, p); };
  box('wood_dark', a0, a1, fy, fy + 0.42, 0, depth); box('wood_dark', a0, a1, fy, fy + 2.5, 0, 0.04);          // the cupboards below, the back
  for (const p of [a0, a1 - 0.05]) box('wood_dark', p, p + 0.05, fy, fy + 2.5, 0, depth);
  for (const t of tiers) {
    const ya = fy + t; box('timber', a0, a1, ya - 0.03, ya, 0.04, depth);
    for (let p = a0 + 0.2; p < a1 - 0.2; p += 0.24 + rand() * 0.22) {
      if (rand() < 0.12) continue;
      const m = pick(rand, G), d = 0.2;
      switch (kind) {
        case 'cloth': { const h = 0.3 + rand() * 0.2; box(m, p - 0.1, p + 0.1, ya, ya + h, 0.06, 0.3); break; }
        case 'jar': lathe_(rand() < 0.5 ? 'glaze_blue' : 'glaze_white', [[0.001, 0], [0.07, 0.01], [0.08, 0.2], [0.05, 0.25], [0.001, 0.26]], p, ya, d); break;
        case 'bottle': lathe_(pick(rand, ['glaze_blue', 'glaze_green', 'glass_topaz']), [[0.001, 0], [0.065, 0.01], [0.075, 0.14], [0.04, 0.22], [0.02, 0.28], [0.03, 0.34]], p, ya, d); break;
        case 'loaf': lathe_('hide_tan', [[0.001, 0], [0.13, 0.02], [0.14, 0.09], [0.1, 0.17], [0.001, 0.2]], p, ya, d); break;
        case 'boot': box('hide_black', p - 0.05, p + 0.05, ya, ya + 0.26, 0.08, 0.22); box('hide_black', p - 0.05, p + 0.12, ya, ya + 0.07, 0.08, 0.22); break;
        case 'basket': box('wicker', p - 0.14, p + 0.14, ya, ya + 0.18, 0.06, 0.32); break;
        default: box(m, p - 0.09, p + 0.09, ya, ya + 0.14 + rand() * 0.14, 0.06, 0.3);
      }
    }
  }
}
/** a brass pair of scales on the counter, a till, a bell */
function counterThings(F, I, rand, u, v, fyc) {
  const { IB, IL } = I;
  IB('iron', u - 0.17, u + 0.17, fyc, fyc + 0.04, v - 0.1, v + 0.1); IL('gilt_bronze', [[0.001, 0], [0.025, 0], [0.02, 0.28], [0.001, 0.3]], 6, u, fyc + 0.04, v);
  IB('gilt_bronze', u - 0.24, u + 0.24, fyc + 0.3, fyc + 0.32, v - 0.01, v + 0.01);
  for (const s of [-1, 1]) IL('gilt_bronze', [[0.12, 0], [0.12, 0.012], [0.001, 0.02]], 10, u + s * 0.22, fyc + 0.2, v);
  IB('wood_dark', u + 0.6, u + 1.0, fyc, fyc + 0.28, v - 0.18, v + 0.18); IB('gold', u + 0.62, u + 0.98, fyc + 0.28, fyc + 0.34, v - 0.14, v + 0.14);
  void rand;
}
/** the hollow ground floor of a shop_house: see shops.js shopHouse; wu0, wu1 the window's span, uDoor/dw the door */
export function shopInterior(F, rand, tn, tr, ctx, o) {
  const { Wd, D, y, bag } = F, { g0, mat, uDoor, dw, wu0, wu1, left } = o, I = inner(F), { IB, W, IL } = I;
  const T = 0.34, fy = y + 0.1, ceil = y + g0, dA = uDoor - dw / 2 - 0.05, dB = uDoor + dw / 2 + 0.05, pv = Math.min(D * 0.62, 5.6);
  // the front wall: piers either side of the door, the stallriser and the lintels over window and door
  const lo = left ? [0, dA] : [wu1, Wd], mid = left ? [dB, wu0] : [wu1 === Wd ? 0 : 0, 0];
  void lo; void mid;
  const segs = left ? [[0, dA], [dB, wu0], [wu1, Wd]] : [[0, wu0], [wu1, dA], [dB, Wd]];
  for (const [a, b] of segs) if (b - a > 0.01) W(mat, a, b, y - 0.5, ceil, 0, T);
  W(mat, Math.min(wu0, wu1), Math.max(wu0, wu1), y - 0.5, y + 0.7, 0, T); W(mat, wu0, wu1, y + g0 - 1.05, ceil, 0, T);
  W(mat, dA, dB, y + 2.6, ceil, 0, T);
  IB('timber', dA, dB, y - 0.5, fy, 0, T);                                    // the threshold
  W(mat, 0, 0.22, y - 0.5, ceil, T, D - T); W(mat, Wd - 0.22, Wd, y - 0.5, ceil, T, D - T); W(mat, 0, Wd, y - 0.5, ceil, D - T, D);
  IB('timber', 0.22, Wd - 0.22, y - 0.5, fy, T, D - T); I.floor(0.22, Wd - 0.22, T, D - T, fy);
  // the lining of plaster on the inner faces, the dado of dark boards, the ceiling with its rose
  const lin = 'stucco_cream';
  IB(lin, 0.22, Wd - 0.22, ceil - 0.05, ceil, T, D - T);
  for (const [u0, u1, v0, v1] of [[0.22, 0.24, T, D - T], [Wd - 0.24, Wd - 0.22, T, D - T], [0.22, Wd - 0.22, D - T - 0.02, D - T]]) IB(lin, u0, u1, fy, ceil - 0.05, v0, v1);
  for (const [a, b] of segs) if (b - a > 0.3) IB(lin, a, b, fy, ceil - 0.05, T, T + 0.02);
  IB('wood_dark', 0.22, 0.26, fy, fy + 1.0, T, D - T); IB('wood_dark', Wd - 0.26, Wd - 0.22, fy, fy + 1.0, T, D - T);
  // the partition between the shop and the room behind, a door in it near the counter's end
  const pd0 = left ? Wd - 1.9 : 0.9, pd1 = pd0 + 0.95;
  W('stucco_cream', 0.22, pd0, fy, ceil - 0.05, pv, pv + 0.12); W('stucco_cream', pd1, Wd - 0.22, fy, ceil - 0.05, pv, pv + 0.12); W('stucco_cream', pd0, pd1, fy + 2.1, ceil - 0.05, pv, pv + 0.12);
  // the stock on the walls behind the counter and on the partition; the counter along the party wall on the window's side
  const cu = left ? Wd - 0.22 : 0.22, cdir = left ? -1 : 1, cf = cu + cdir * 0.85;           // the counter's front face
  shelves(F, I, rand, tr, { axis: 'v', a0: 0.9, a1: pv - 0.2, wall: cu, dir: cdir, fy });
  const sh0 = left ? 0.4 : pd1 + 0.2, sh1 = left ? pd0 - 0.2 : Wd - 0.4;
  if (sh1 - sh0 > 0.6) shelves(F, I, rand, tr, { axis: 'u', a0: sh0, a1: sh1, wall: pv, dir: -1, fy, depth: 0.3 });
  { const u0 = Math.min(cu + cdir * 0.4, cf), u1 = Math.max(cu + cdir * 0.4, cf);       // the counter: a panelled front, a marble or mahogany top
    W('wood_dark', u0, u1, fy, fy + 0.92, 1.2, pv - 0.5); IB(tn === 'butcher' || tn === 'grocer' ? 'marble' : 'timber', Math.min(cu + cdir * 0.2, cf - cdir * 0.06), Math.max(cu + cdir * 0.2, cf - cdir * 0.06), fy + 0.92, fy + 0.96, 1.15, pv - 0.45);
    for (let v = 1.4; v < pv - 0.7; v += 0.5) IB('timber', Math.min(cf, cf - cdir * 0.02), Math.max(cf, cf - cdir * 0.02), fy + 0.1, fy + 0.8, v, v + 0.34);
    counterThings(F, I, rand, (cu + cf) / 2, 2.2 + rand() * 0.8, fy + 0.96);
    counterThings(F, I, rand, (cu + cf) / 2, pv - 1.6, fy + 0.96); }
  // stock on the floor by the trade, a stool, the gas-lights hung on brass rods from the ceiling
  const mu = left ? Wd * 0.4 : Wd * 0.55;
  if (tn === 'grocer' || tn === 'greengrocer') { for (let k = 0; k < 4; k++) W('sacking', mu - 0.4 + (k % 2) * 0.42, mu - 0.02 + (k % 2) * 0.42, fy, fy + 0.7 - (k > 1 ? 0.12 : 0), 2.3 + Math.floor(k / 2) * 0.35, 2.6 + Math.floor(k / 2) * 0.35); IL('wood_dark', [[0.3, 0], [0.34, 0.2], [0.34, 0.6], [0.3, 0.85]], 10, mu + 0.9, fy, 3.0); }
  else if (tn === 'butcher') { IB('iron', 0.5, Wd - 0.5, fy + 2.3, fy + 2.34, pv - 0.9, pv - 0.86); for (let u = 0.9; u < Wd - 0.7; u += 0.5) { const hh = 0.5 + rand() * 0.35; IB(rand() < 0.5 ? 'hide_tan' : 'cloth_red', u - 0.1, u + 0.1, fy + 2.3 - hh, fy + 2.3, pv - 0.95, pv - 0.8); } W('timber', mu - 0.4, mu + 0.4, fy, fy + 0.8, 2.6, 3.2); IB('cloth_white', mu - 0.4, mu + 0.4, fy + 0.8, fy + 0.82, 2.6, 3.2); }
  else if (tn === 'draper') { for (let k = 0; k < 3; k++) { const u = mu - 0.8 + k * 0.8; IL('wood_dark', [[0.2, 0], [0.04, 0.02], [0.04, 1.0], [0.001, 1.05]], 6, u, fy, 3.0); IB(['cloth_red', 'cloth_blue', 'cloth_green'][k], u - 0.2, u + 0.2, fy + 0.9, fy + 1.5, 2.88, 3.12); } }
  else if (tn === 'baker') { W('wood_dark', mu - 0.5, mu + 0.5, fy, fy + 0.8, 2.5, 3.1); for (let k = 0; k < 6; k++) IL('hide_tan', [[0.001, 0], [0.13, 0.02], [0.14, 0.09], [0.1, 0.17], [0.001, 0.2]], 8, mu - 0.4 + (k % 3) * 0.4, fy + 0.8 + Math.floor(k / 3) * 0.0, 2.65 + Math.floor(k / 3) * 0.25); }
  else if (tn === 'barber') { for (const k of [0, 1]) { const u = mu - 0.6 + k * 1.3; W('wood_dark', u - 0.3, u + 0.3, fy, fy + 0.5, 2.5, 3.1); IB('hide_black', u - 0.28, u + 0.28, fy + 0.5, fy + 0.62, 2.52, 3.08); IB('hide_black', u - 0.28, u + 0.28, fy + 0.62, fy + 1.3, 3.0, 3.08); } IB('mirror_tin', 0.4, Wd - 0.4, fy + 1.1, fy + 2.1, pv - 0.04, pv - 0.0); }
  else W('timber', mu - 0.4, mu + 0.4, fy, fy + 0.5, 2.6, 3.1);
  for (const [u, v] of [[Wd * 0.5, 2.0], [Wd * 0.5, pv - 1.3]]) { const p = I.pt(u, v); bag.add('gilt_bronze', lathe([[0.012, 0], [0.012, 0.75]], 5, null, p[0], ceil - 0.8, p[1])); bag.add('lamp_glass', lathe([[0.03, 0], [0.12, 0.08], [0.16, 0.2], [0.1, 0.32], [0.001, 0.34]], 10, null, p[0], ceil - 1.12, p[1])); }
  // the shopkeeper behind his counter in an apron, a customer at it
  const kv = 2.6 + rand() * 0.6, cuC = (cu + cf) / 2;
  person(F, I, ctx, cuC + cdir * 0.55, kv, [cuC - cdir * 1.5, kv], { dress: 'trousers', cloth: 'cloth_white', cloth2: 'cloth_grey', hat: tn === 'baker' ? 'cap' : 'none', hatMat: 'cloth_white', over: 'apron', beard: rand() < 0.5, hair: 'short' });
  if (rand() < 0.75) person(F, I, ctx, cuC - cdir * 1.35, kv + 0.4, [cuC, kv], { dress: 'robe', cloth: pick(rand, ['cloth_maroon', 'cloth_indigo', 'cloth_green']), cloth2: 'cloth_black', hat: 'brim', hatMat: 'cloth_black', over: 'shawl', carry: 'basket' });
  // the room behind: a table under its cloth, chairs, the range
  const rv = (pv + 0.12 + D - T) / 2, ru = Wd / 2;
  W('wood_dark', ru - 0.5, ru + 0.5, fy + 0.7, fy + 0.74, rv - 0.5, rv + 0.5); IB('linen', ru - 0.55, ru + 0.55, fy + 0.74, fy + 0.745, rv - 0.55, rv + 0.55);
  for (const [a, b] of [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]]) IB('wood_dark', ru + a - 0.03, ru + a + 0.03, fy, fy + 0.7, rv + b - 0.03, rv + b + 0.03);
  for (const s of [-1, 1]) { const u = ru + s * 0.85; IB('wood_dark', u - 0.2, u + 0.2, fy + 0.43, fy + 0.47, rv - 0.2, rv + 0.2); IB('wood_dark', u - 0.2 * (s > 0 ? -0 : 1), u + 0.2 * (s > 0 ? 1 : 0), fy + 0.47, fy + 0.95, rv - 0.2, rv + 0.2); I.IC(u - 0.2, u + 0.2, fy, fy + 0.9, rv - 0.2, rv + 0.2); }
  const ru2 = left ? 0.22 : Wd - 0.22;
  W('iron', Math.min(ru2, ru2 + (left ? 0.5 : -0.5)), Math.max(ru2, ru2 + (left ? 0.5 : -0.5)), fy, fy + 0.85, rv - 0.55, rv + 0.55); IB('opening', Math.min(ru2, ru2 + (left ? 0.51 : -0.51)), Math.max(ru2, ru2 + (left ? 0.51 : -0.51)), fy + 0.2, fy + 0.5, rv - 0.2, rv + 0.2);
  IL('iron', [[0.1, 0], [0.12, 0.05], [0.12, 0.18], [0.1, 0.2]], 10, ru2 + (left ? 0.3 : -0.3), fy + 0.85, rv + 0.25);
  I.IC(ru - 0.55, ru + 0.55, fy, fy + 0.75, rv - 0.55, rv + 0.55);
}

/** the hollow ground floor of a pub: see shops.js pub; uDoor the double doors' centre, east the corner's side, wins the window spans */
export function pubInterior(F, rand, ctx, o) {
  const { Wd, D, y } = F, { g0, mat, uDoor, east, wins } = o, I = inner(F), { IB, W, IL } = I;
  const T = 0.34, fy = y + 0.1, ceil = y + g0, dA = uDoor - 0.85, dB = uDoor + 0.85;
  // the front wall under the windows and between them, the doors' gap; the party walls, the back wall, the boards
  const gaps = [[dA, dB], ...wins.filter(([a, b]) => !(uDoor > a && uDoor < b)).map(([a, b]) => [a + 0.05, b - 0.05])].sort((p, q) => p[0] - q[0]);
  let u = 0;
  for (const [a, b] of gaps) { if (a - u > 0.01) W(mat, u, a, y - 0.5, ceil, 0, T); u = b; }
  if (Wd - u > 0.01) W(mat, u, Wd, y - 0.5, ceil, 0, T);
  for (const [a, b] of gaps) { if (a === dA) { W(mat, a, b, y + 2.62, ceil, 0, T); IB('timber', a, b, y - 0.5, fy, 0, T); } else { W(mat, a, b, y - 0.5, y + 0.8, 0, T); W(mat, a, b, y + g0 - 1.05, ceil, 0, T); } }
  W(mat, 0, 0.22, y - 0.5, ceil, T, D - T); W(mat, Wd - 0.22, Wd, y - 0.5, ceil, T, D - T); W(mat, 0, Wd, y - 0.5, ceil, D - T, D);
  IB('timber', 0.22, Wd - 0.22, y - 0.5, fy, T, D - T); I.floor(0.22, Wd - 0.22, T, D - T, fy);
  // the plaster, a dado of mahogany panelling, the deep red ceiling that hid the smoke, gas globes in clusters
  IB('paint_fleur', 0.22, Wd - 0.22, ceil - 0.05, ceil, T, D - T);
  for (const [u0, u1, v0, v1] of [[0.22, 0.24, T, D - T], [Wd - 0.24, Wd - 0.22, T, D - T], [0.22, Wd - 0.22, D - T - 0.02, D - T]]) { IB('stucco_cream', u0, u1, fy, ceil - 0.05, v0, v1); IB('lacquer_chestnut', u0, u1, fy, fy + 1.2, v0, v1); }
  // the bar: a long mahogany counter across the room, brass rail, hand-pumps, the snob-screens of etched glass, the back-fitting
  const bv = Math.min(D * 0.55, 5.8), bu0 = east ? 0.5 : 2.4, bu1 = east ? Wd - 2.4 : Wd - 0.5;
  W('lacquer_chestnut', bu0, bu1, fy, fy + 1.05, bv, bv + 0.6); IB('timber', bu0 - 0.05, bu1 + 0.05, fy + 1.05, fy + 1.1, bv - 0.04, bv + 0.64);
  IB('gilt_bronze', bu0, bu1, fy + 0.15, fy + 0.19, bv - 0.25, bv - 0.21); for (let k = bu0 + 0.3; k < bu1; k += 1.4) IB('gilt_bronze', k, k + 0.04, fy, fy + 0.18, bv - 0.25, bv - 0.21);
  for (let k = bu0 + 0.6; k < bu1 - 0.3; k += 1.1) { const p = I.pt(k, bv + 0.3); F.bag.add('gilt_bronze', lathe([[0.04, 0], [0.025, 0.05], [0.025, 0.4], [0.04, 0.45]], 8, null, p[0], fy + 1.1, p[1])); F.bag.add('glaze_white', lathe([[0.03, 0], [0.04, 0.2]], 6, null, p[0], fy + 1.5, p[1])); }
  for (const k of [bu0 + 1.2, (bu0 + bu1) / 2 + 0.8]) { IB('lacquer_chestnut', k - 0.02, k + 0.02, fy + 1.1, fy + 1.9, bv - 0.1, bv + 0.55); IB('lamp_glass', k - 0.015, k + 0.015, fy + 1.4, fy + 1.85, bv - 0.1, bv + 0.55); }
  I.IC(bu0, bu1, fy, fy + 1.1, bv - 0.1, bv + 0.7);
  // behind the bar: spirit casks on a rack with brass taps, shelves of bottles under a gilt mirror, a clock
  const bw = D - T - 0.02, bu0b = bu0 + 0.2, bu1b = bu1 - 0.2;
  IB('lacquer_chestnut', 0.22, Wd - 0.22, fy, fy + 0.9, bw - 0.55, bw); IB('timber', 0.22, Wd - 0.22, fy + 0.9, fy + 0.94, bw - 0.6, bw);
  I.IC(0.22, Wd - 0.22, fy, fy + 0.9, bw - 0.55, bw);
  for (let k = bu0b; k < bu1b - 0.4; k += 0.75) { const p = I.pt(k + 0.3, bw - 0.9); F.bag.add('wood_dark', lathe([[0.001, 0], [0.24, 0], [0.28, 0.2], [0.3, 0.4], [0.28, 0.6], [0.24, 0.8], [0.001, 0.8]], 10, null, p[0], fy + 0.94, p[1])); }
  IB('gold', bu0b, bu1b, fy + 1.85, fy + 1.95, bw - 0.08, bw); IB('mirror_tin', bu0b + 0.1, bu1b - 0.1, fy + 1.1, fy + 1.85, bw - 0.03, bw);
  for (const t of [1.25, 1.6, 1.95]) { IB('timber', bu0b, bu1b, fy + t, fy + t + 0.03, bw - 0.3, bw - 0.05); for (let k = bu0b + 0.15; k < bu1b - 0.1; k += 0.2 + rand() * 0.1) IL(pick(rand, ['glaze_blue', 'glaze_green', 'glass_topaz', 'glaze_white']), [[0.001, 0], [0.04, 0.01], [0.045, 0.16], [0.02, 0.26], [0.02, 0.3]], 6, k, fy + t + 0.03, bw - 0.17); }
  IB('wood_dark', Math.max(bu0b, (bu0b + bu1b) / 2 - 0.2), Math.min(bu1b, (bu0b + bu1b) / 2 + 0.2), fy + 2.0, fy + 2.5, bw - 0.1, bw); IB('gold', (bu0b + bu1b) / 2 - 0.12, (bu0b + bu1b) / 2 + 0.12, fy + 2.1, fy + 2.4, bw - 0.12, bw - 0.1);
  // the room before the bar: round cast-iron tables, stools, benches along the front wall and the party wall; sawdust on the boards
  IB('sacking', 0.3, Wd - 0.3, fy + 0.001, fy + 0.006, T + 0.2, bv - 0.5);
  const tbl = (u, v) => { const p = I.pt(u, v); F.bag.add('iron', lathe([[0.18, 0], [0.04, 0.05], [0.04, 0.68], [0.3, 0.72], [0.3, 0.76], [0.001, 0.76]], 12, null, p[0], fy, p[1])); F.bag.add('marble', lathe([[0.001, 0.76], [0.32, 0.76], [0.32, 0.8], [0.001, 0.8]], 12, null, p[0], fy, p[1])); F.col.circle(p, 0.34, fy, fy + 0.85); };
  const stool = (u, v) => { const p = I.pt(u, v); F.bag.add('wood_dark', lathe([[0.17, 0], [0.04, 0.02], [0.04, 0.42], [0.17, 0.45], [0.17, 0.5], [0.001, 0.5]], 8, null, p[0], fy, p[1])); };
  const tabs = [[Wd * 0.5, 2.0], [Wd * 0.5 + (east ? -1 : 1) * 2.0, 3.0], [Wd * 0.5 + (east ? 1 : -1) * 1.8, 1.6]].filter(([tu]) => tu > 0.9 && tu < Wd - 0.9);
  for (const [tu, tv] of tabs) { tbl(tu, tv); stool(tu - 0.5, tv); stool(tu + 0.5, tv); stool(tu, tv + 0.5); }
  const benchU = east ? 0.22 : Wd - 0.22, bd = east ? 1 : -1;
  W('lacquer_chestnut', Math.min(benchU, benchU + bd * 0.5), Math.max(benchU, benchU + bd * 0.5), fy, fy + 0.46, T + 1.5, bv - 0.9); IB('cloth_red', Math.min(benchU + bd * 0.08, benchU + bd * 0.5), Math.max(benchU + bd * 0.08, benchU + bd * 0.5), fy + 0.46, fy + 0.56, T + 1.5, bv - 0.9);
  IB('lacquer_chestnut', Math.min(benchU, benchU + bd * 0.08), Math.max(benchU, benchU + bd * 0.08), fy + 0.46, fy + 1.1, T + 1.5, bv - 0.9);
  // the spittoon, a tray of sawdust, the gas globes on their brass drops
  for (const [gu, gv] of [[Wd * 0.3, 2.0], [Wd * 0.7, 2.0], [Wd * 0.5, bv - 1.0]]) { const p = I.pt(gu, gv); F.bag.add('gilt_bronze', lathe([[0.012, 0], [0.012, 0.6]], 5, null, p[0], ceil - 0.7, p[1])); F.bag.add('lamp_glass', lathe([[0.03, 0], [0.13, 0.08], [0.18, 0.2], [0.11, 0.34], [0.001, 0.36]], 10, null, p[0], ceil - 1.02, p[1])); }
  // the people: the landlord behind the bar, the barmaid, men at the tables and the bar
  const midBar = (bu0 + bu1) / 2;
  person(F, I, ctx, midBar - 1.0, bv + 1.15, [midBar - 1.0, bv - 1.0], { dress: 'trousers', cloth: 'cloth_white', cloth2: 'cloth_grey', hat: 'none', over: 'apron', beard: true, hair: 'short' });
  person(F, I, ctx, midBar + 1.4, bv + 1.15, [midBar + 1.4, bv - 1.0], { dress: 'robe', cloth: 'cloth_maroon', cloth2: 'cloth_black', hat: 'none', over: 'apron', hair: 'bun' });
  person(F, I, ctx, midBar - 0.3, bv - 0.8, [midBar - 0.3, bv + 1.0], { dress: 'trousers', cloth: 'cloth_brown', cloth2: 'cloth_brown', hat: 'cap', hatMat: 'cloth_grey', over: 'collar', pose: 'talk' });
  person(F, I, ctx, midBar + 0.5, bv - 0.8, [midBar - 0.3, bv - 0.8], { dress: 'trousers', cloth: 'cloth_grey', cloth2: 'cloth_black', hat: 'brim', hatMat: 'cloth_black', over: 'cloak', beard: true });
  if (tabs[0]) { person(F, I, ctx, tabs[0][0] - 0.5, tabs[0][1], [tabs[0][0], tabs[0][1]], { dress: 'trousers', cloth: 'cloth_indigo', cloth2: 'cloth_brown', hat: 'cap', hatMat: 'cloth_brown', pose: 'sit' }); person(F, I, ctx, tabs[0][0] + 0.5, tabs[0][1], [tabs[0][0], tabs[0][1]], { dress: 'trousers', cloth: 'cloth_black', cloth2: 'cloth_grey', hat: 'brim', hatMat: 'cloth_black', over: 'cloak', pose: 'sit' }); }
}
