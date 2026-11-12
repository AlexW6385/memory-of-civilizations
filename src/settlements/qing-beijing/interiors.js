// Ming–Qing Beijing — interiors with the objects of the period (docs/settlements/qing-beijing.md §21–§23):
//  - bj_rooms: a courtyard house furnished: the main hall (the Eight Immortals table, the long table
//    with its painting and couplet), the side rooms of the main house with the kang (the heated brick
//    bed under its mat, the low kang table, folded quilts, the clothes cabinet and chest, a brazier), a
//    desk room; the east wing a bedroom with its kang, the west wing the kitchen (the stove with two
//    iron pots, the water vat, firewood, coal balls, the cupboard);
//  - bj_teahouse: a tea house on the avenue: square tables with benches, the counter with its stove and
//    great copper kettles, the storyteller's table with the wooden block and fan, bird cages hung
//    from the beams under their cloths;
//  - bj_pharmacy: a pharmacy: the cabinet of a hundred drawers, the counter with scales and mortar,
//    bundles of herbs hung from the beams.
// Everything is built in the room's own frame (a across, b from the back wall to the front, y up) and turned into place once.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { Parts, T, ball, limb } from '../../styles/qing/carving.js';
import { mingHall, withPal } from '../../styles/ming/index.js';
import { HOUSE } from '../../styles/qing/index.js';
import { houseParts } from './houses.js';

const W = 'wood_dark', RED = 'lacquer_red';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const Hall = withPal(mingHall);

// ── furniture, local frame: facing −z ──
export function table(P, w, d, h, m = W, low = false) {
  P.add(m, box(-w / 2, h - 0.045, -d / 2, w / 2, h, d / 2));
  P.add(m, box(-w / 2 + 0.04, h - 0.13, -d / 2 + 0.04, w / 2 - 0.04, h - 0.045, d / 2 - 0.04));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) P.add(m, box(sx * (w / 2 - 0.07) - 0.03, 0, sz * (d / 2 - 0.07) - 0.03, sx * (w / 2 - 0.07) + 0.03, h - 0.045, sz * (d / 2 - 0.07) + 0.03));
  if (!low) for (const sz of [-1, 1]) P.add(m, box(-w / 2 + 0.07, 0.12, sz * (d / 2 - 0.07) - 0.015, w / 2 - 0.07, 0.15, sz * (d / 2 - 0.07) + 0.015));
}
export function chair(P) {
  table(P, 0.5, 0.42, 0.48, W, true);
  P.add(W, box(-0.24, 0.48, 0.17, 0.24, 1.0, 0.21)); P.add(W, box(-0.26, 0.98, 0.15, 0.26, 1.04, 0.23));
  for (const s of [-1, 1]) P.add(W, box(s * 0.25 - 0.015, 0.68, -0.2, s * 0.25 + 0.015, 0.72, 0.2));
}
export const stool = (P, h = 0.42, w = 0.34) => table(P, w, w, h, W, true);
export function bench(P, len, h = 0.46) { P.add(W, box(-len / 2, h - 0.05, -0.15, len / 2, h, 0.15)); for (const s of [-1, 1]) P.add(W, box(s * (len / 2 - 0.1) - 0.03, 0, -0.12, s * (len / 2 - 0.1) + 0.03, h - 0.05, 0.12)); }
export function cabinet(P, w, h, d = 0.5, m = W) {
  P.add(m, box(-w / 2, 0, -d / 2, w / 2, h, d / 2));
  P.add(RED, box(-w / 2 + 0.03, 0.1, -d / 2 - 0.012, w / 2 - 0.03, h - 0.1, -d / 2));
  P.add('gilt_bronze', box(-0.14, h * 0.5 - 0.06, -d / 2 - 0.02, 0.14, h * 0.5 + 0.06, -d / 2 - 0.012));
  P.add('gilt_bronze', box(-0.015, 0.1, -d / 2 - 0.014, 0.015, h - 0.1, -d / 2 - 0.011));
}
/** The kang: the brick platform w × d, 0.55 m high, its mat, the stove-mouth side face, a low table, quilts folded at the head. */
export function kang(P, w, d, withTable = true) {
  P.add('brick_grey', box(-w / 2, 0, -d / 2, w / 2, 0.55, d / 2));
  P.add('wood_dark', box(-w / 2 - 0.02, 0.5, -d / 2 - 0.02, w / 2 + 0.02, 0.58, -d / 2 + 0.06));      // the kang edge board (kangyan), on the open side
  P.add('reed_mat', box(-w / 2 + 0.03, 0.55, -d / 2 + 0.06, w / 2 - 0.03, 0.57, d / 2 - 0.02));
  if (withTable) { const Q = new Parts(); table(Q, 0.8, 0.5, 0.28, RED, true); Q.emit(P, 0, 0.57, -0.05); P.add('glaze_white', lathe([[0.001, 0], [0.04, 0.01], [0.05, 0.07], [0.001, 0.08]], 8, null, 0.15, 0.85, -0.05)); }
  for (const [i, m] of ['cloth_red', 'cloth_indigo', 'cloth_green'].entries()) P.add(m, box(w / 2 - 0.9, 0.57 + i * 0.13, d / 2 - 0.58, w / 2 - 0.1, 0.57 + i * 0.13 + 0.12, d / 2 - 0.05));
  P.add('cloth_white', box(w / 2 - 0.9, 0.57 + 0.39, d / 2 - 0.55, w / 2 - 0.1, 0.57 + 0.43, d / 2 - 0.1));
}
export function stove(P) {
  // the range (zao): a brick block with two iron pots in their rings, a chimney at the back, the fire mouth
  P.add('brick_grey', box(-0.7, 0, -0.45, 0.7, 0.85, 0.45));
  for (const x of [-0.32, 0.32]) { P.add('iron', lathe([[0.001, 0], [0.2, 0.02], [0.3, 0.14], [0.31, 0.2], [0.28, 0.2], [0.26, 0.1], [0.001, 0.03]], 14, null, x, 0.83, 0)); P.add('wood_dark', lathe([[0.3, 0], [0.3, 0.1], [0.001, 0.1]], 12, null, x, 0.98, 0)); }
  P.add('iron', box(-0.2, 0.15, -0.46, 0.2, 0.45, -0.44)); P.add('flame', box(-0.15, 0.2, -0.455, 0.15, 0.3, -0.45));
  P.add('brick_grey', box(-0.2, 0.85, 0.25, 0.2, 2.6, 0.45));
}
export const vat = (P, r = 0.42) => { P.add('pottery_dark', lathe([[0.001, 0], [r * 0.7, 0], [r, 0.4], [r * 0.95, 0.8], [r * 0.85, 0.9], [r * 0.9, 0.93], [r * 0.8, 0.93], [r * 0.8, 0.88], [0.001, 0.86]], 14)); P.add('water', lathe([[0.001, 0.8], [r * 0.9, 0.8]], 14)); };

// ── placing a room in the world ──
export function frame(rect, front) {
  const [x0, z0, x1, z1] = rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  const origin = { s: [cx, z0], n: [cx, z1], e: [x0, cz], w: [x1, cz] }[front], yaw = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 }[front];
  const cs = Math.cos(yaw), sn = Math.sin(yaw), WC = (a, b) => [origin[0] + a * cs + b * sn, origin[1] - a * sn + b * cs];
  const alongX = front === 's' || front === 'n';
  return { origin, yaw, WC, Wd: alongX ? x1 - x0 : z1 - z0, Dp: alongX ? z1 - z0 : x1 - x0 };
}

/**
 * A courtyard house's main house and wings, fitted to the shells of hutong_house (houses.js houseParts):
 * `el` is the house as layout.js houses() gives it ({ rect, seed, courts, gate, lod }). Each room's frame
 * runs from the shell's back wall (outer face) to the front wall's inner face plus the wall's thickness
 * m, so that "Dp − m" is the free floor's end and nothing stands in the front wall's lattice.
 */
export function bjRooms(el, { bag, col }) {
  const rand = rng(el.seed || 3), P = houseParts(el);
  const rooms = [{ rect: [P.main[0], P.main[1], P.main[2], P.main[1] + P.dN - 1.1 + 0.5], front: 's', y: P.mainY, kind: 'main', nb: P.mb }];
  for (const w of P.wings) {
    const [xa, za, xb, zb] = w.rect, inner = w.ww - 0.8 + 0.5;
    rooms.push(w.side === 'w' ? { rect: [xb - inner, za, xb, zb], front: 'w', y: P.wingY, kind: 'east' } : { rect: [xa, za, xa + inner, zb], front: 'e', y: P.wingY, kind: 'west' });
  }
  for (const r of rooms) {
    const F = frame(r.rect, r.front), S = new Parts(), put = (Q, a, b, yw = 0, up = 0) => Q.emit(S, a, up, b, yw);
    const blk = (a0, b0, a1, b1, h) => { const p = F.WC(a0, b0), q = F.WC(a1, b1); col.rect([Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])], r.y, r.y + h); };
    const m = 0.5;                                  // the wall's thickness and the post line
    if (r.kind === 'main') {
      const bw = F.Wd / r.nb;
      // the hall: the middle bay — the long table against the back wall, the Eight Immortals table, a chair each side
      { const Q = new Parts(); table(Q, Math.min(2.3, bw - 0.5), 0.45, 0.92); for (const s of [-1, 1]) { Q.add('glaze_blue', lathe([[0.06, 0], [0.11, 0.06], [0.12, 0.2], [0.06, 0.36], [0.045, 0.46], [0.001, 0.5]], 12, null, s * 0.8, 0.92, 0)); Q.add('timber', lathe([[0.012, 0], [0.012, 0.42], [0.001, 0.42]], 5, null, s * 0.8, 1.38, 0)); }
        Q.add('bronze', lathe([[0.07, 0], [0.1, 0.03], [0.11, 0.1], [0.08, 0.15], [0.001, 0.16]], 12, null, 0, 0.92, 0)); put(Q, 0, m + 0.25); blk(-1.2, m, 1.2, m + 0.5, 1.0); }
      { const Q = new Parts(); Q.add('cloth_indigo', box(-0.42, 1.25, -0.005, 0.42, 2.75, 0.005)); Q.add('paint_white', box(-0.34, 1.38, 0.005, 0.34, 2.55, 0.012)); for (const s of [-1, 1]) { Q.add('cloth_red', box(s * 0.7 - 0.13, 1.2, -0.005, s * 0.7 + 0.13, 2.75, 0.008)); } put(Q, 0, m + 0.03); }
      { const Q = new Parts(); table(Q, 0.95, 0.95, 0.86); put(Q, 0, m + 1.6); for (const s of [-1, 1]) { const C = new Parts(); chair(C); put(C, s * 0.95, m + 1.6, s > 0 ? Math.PI / 2 : -Math.PI / 2); } blk(-1.3, m + 1.0, 1.3, m + 2.2, 0.9); }
      // the rooms either side: the east bays the elders' room with the kang under the window, the west bays the desk room and storage
      for (let k = 1; k <= (r.nb - 1) / 2; k++) {
        const ae = k * bw, aw = -k * bw;
        if (k === 1) {
          { const Q = new Parts(); kang(Q, Math.min(bw - 0.7, 2.6), 1.75); put(Q, ae, F.Dp - m - 0.95); blk(ae - 1.3, F.Dp - m - 1.8, ae + 1.3, F.Dp - m, 0.6); }
          { const Q = new Parts(); cabinet(Q, 1.0, 1.8); put(Q, ae - bw * 0.3, m + 0.3, Math.PI); blk(ae - bw * 0.3 - 0.5, m, ae - bw * 0.3 + 0.5, m + 0.6, 1.8); }
          { const Q = new Parts(); Q.add(RED, box(-0.35, 0, -0.25, 0.35, 0.55, 0.25)); Q.add('gilt_bronze', box(-0.06, 0.35, -0.26, 0.06, 0.42, -0.25)); put(Q, ae + bw * 0.25, m + 0.3); }
          { const Q = new Parts(); Q.add('iron', lathe([[0.001, 0], [0.18, 0.02], [0.22, 0.22], [0.001, 0.22]], 12)); Q.add('flame', lathe([[0.001, 0.2], [0.17, 0.2], [0.001, 0.21]], 10)); for (const a of [0, 2.1, 4.2]) Q.add('iron', limb([Math.cos(a) * 0.12, 0.05, Math.sin(a) * 0.12], [Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2], 0.012, 0.01, 4)); put(Q, ae - 0.2, m + 1.6); }
        } else {
          { const Q = new Parts(); kang(Q, Math.min(bw - 0.7, 2.6), 1.75, false); put(Q, ae, F.Dp - m - 0.95); blk(ae - 1.3, F.Dp - m - 1.8, ae + 1.3, F.Dp - m, 0.6); }
        }
        if (k === 1) {
          // the west: a desk with the four treasures and books, a chair, a bookcase; the wardrobes
          { const Q = new Parts(); table(Q, 1.3, 0.62, 0.78); Q.add('slate', box(-0.5, 0.78, -0.1, -0.3, 0.81, 0.1)); for (let i = 0; i < 4; i++) Q.add(['cloth_white', 'cloth_indigo', 'cloth_brown', 'cloth_white'][i], box(0.25, 0.78 + i * 0.02, -0.12, 0.55, 0.8 + i * 0.02, 0.12)); Q.add('bamboo_culm', lathe([[0.04, 0], [0.04, 0.14], [0.001, 0.14]], 8, null, 0.05, 0.78, -0.2)); put(Q, aw, m + 1.2); blk(aw - 0.7, m + 0.85, aw + 0.7, m + 1.55, 0.8); }
          { const C = new Parts(); chair(C); put(C, aw, m + 1.95, Math.PI); }
          { const Q = new Parts(); cabinet(Q, 1.1, 1.9, 0.4); put(Q, aw - bw * 0.3, m + 0.25, Math.PI); blk(aw - bw * 0.3 - 0.55, m, aw - bw * 0.3 + 0.55, m + 0.5, 1.9); }
        } else {
          for (const s of [-1, 1]) { const Q = new Parts(); cabinet(Q, 0.95, 1.95); put(Q, aw + s * 0.55, m + 0.3, Math.PI); }
          blk(aw - 1.1, m, aw + 1.1, m + 0.6, 1.95);
        }
      }
    } else if (r.kind === 'east') {
      // the east wing: a bedroom — the kang along the back wall (its length across the room), a chest, the washstand
      const w = Math.min(F.Wd - 1.0, 3.2);
      { const Q = new Parts(); kang(Q, w, 1.4); put(Q, 0, m + 0.8); blk(-w / 2, m + 0.1, w / 2, m + 1.5, 0.6); }
      { const Q = new Parts(); Q.add(RED, box(-0.5, 0, -0.28, 0.5, 0.6, 0.28)); put(Q, -w / 2 + 0.2, F.Dp - m - 0.3); }
      { const Q = new Parts(); table(Q, 0.5, 0.5, 0.74, W, true); Q.add('glaze_white', lathe([[0.001, 0], [0.12, 0.02], [0.18, 0.1], [0.001, 0.12]], 10, null, 0, 0.74, 0)); put(Q, w / 2 - 0.2, F.Dp - m - 0.4); }
    } else {
      // the west wing: the kitchen — the stove at the back, the water vat, firewood and coal balls, the cupboard, a table for the dough
      { const Q = new Parts(); stove(Q); put(Q, -0.4, m + 0.6, Math.PI); blk(-1.1, m + 0.1, 0.3, m + 1.1, 0.9); }
      { const Q = new Parts(); vat(Q); put(Q, F.Wd / 2 - 0.8, m + 0.6); blk(F.Wd / 2 - 1.2, m + 0.2, F.Wd / 2 - 0.4, m + 1.0, 0.9); }
      { const Q = new Parts(); for (let i = 0; i < 14; i++) Q.add('timber', limb([-0.5 + (i % 5) * 0.2, 0.08 + Math.floor(i / 5) * 0.12, -0.2], [-0.5 + (i % 5) * 0.2, 0.08 + Math.floor(i / 5) * 0.12, 0.2], 0.05, 0.05, 5)); put(Q, -F.Wd / 2 + 0.9, F.Dp - m - 0.5); }
      { const Q = new Parts(); for (let i = 0; i < 12; i++) Q.add('slate', limb([(i % 4) * 0.2 - 0.3, Math.floor(i / 4) * 0.13, 0], [(i % 4) * 0.2 - 0.3, Math.floor(i / 4) * 0.13 + 0.12, 0], 0.085, 0.085, 8)); put(Q, F.Wd / 2 - 1.0, F.Dp - m - 0.5); }
      { const Q = new Parts(); cabinet(Q, 0.9, 1.5, 0.45); put(Q, -F.Wd / 2 + 0.6, m + 0.35, Math.PI); }
    }
    S.emit(bag, F.origin[0], r.y + 0.04, F.origin[1], F.yaw);
  }
  void rand;
}

/**
 * A tea house furnished inside the shell of a shop (shopfront.js qing_shop with `enter`): el.rect is the frame
 * from the shop's back wall to its counter line (layout.js interiorShops, shopInterior below), el.front 'e'
 * (street to the east). The furniture is laid out from the room's width and depth: the storyteller's platform
 * at the back left, the counter with its stove at the back right, the tables in rows before them.
 */
export function bjTeahouse(el, { bag, col }) {
  const F = frame(el.rect, el.front ?? 'e'), y = el.y, S = new Parts(), rand = rng(el.seed || 11), m = 0.55;
  const put = (Q, a, b, yw = 0, up = 0) => Q.emit(S, a, up, b, yw);
  const blk = (a0, b0, a1, b1, h) => { const p = F.WC(a0, b0), q = F.WC(a1, b1); col.rect([Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])], y, y + h); };
  const Wd = F.Wd, Dp = F.Dp, u0 = -Wd / 2 + 0.55, u1 = Wd / 2 - 0.55;
  // the back right: the counter and the stove with two great copper kettles, shelves of cups and tea above
  const cw = Math.max(1.6, u1 - 1.2 - (u0 + 2.2)), ca = u0 + 2.2 + cw / 2;
  { const Q = new Parts(); table(Q, cw, 0.7, 1.05, W, true); put(Q, ca, m + 0.5); blk(ca - cw / 2, m + 0.1, ca + cw / 2, m + 0.9, 1.05); }
  { const Q = new Parts(); Q.add('brick_grey', box(-0.45, 0, -0.35, 0.45, 0.8, 0.35)); for (const x of [-0.18, 0.18]) { Q.add('bronze', lathe([[0.001, 0], [0.17, 0], [0.2, 0.2], [0.14, 0.38], [0.07, 0.46], [0.001, 0.46]], 12, null, x, 0.8, 0)); Q.add('bronze', limb([x + 0.17, 1.05, 0], [x + 0.36, 1.2, 0], 0.02, 0.018, 5)); } Q.add('brick_grey', box(-0.12, 1.26, 0.1, 0.12, 3.0, 0.32)); put(Q, u1 - 0.5, m + 0.45); blk(u1 - 1.0, m + 0.05, u1, m + 0.85, 1.3); }
  { const Q = new Parts(), n = Math.floor((cw - 0.2) / 0.3); for (let r = 0; r < 3; r++) { Q.add(W, box(-cw / 2, 1.3 + r * 0.5, -0.12, cw / 2, 1.34 + r * 0.5, 0.12)); for (let i = 0; i < n; i++) Q.add(i % 2 ? 'glaze_white' : 'glaze_blue', lathe([[0.001, 0], [0.045, 0.01], [0.05, 0.05], [0.001, 0.06]], 8, null, -cw / 2 + 0.2 + i * 0.3, 1.34 + r * 0.5, 0)); } put(Q, ca, m + 0.05); }
  // the storyteller's platform at the back left, facing the room
  { const Q = new Parts(); Q.add('wood_dark', box(-0.9, 0, -0.9, 0.9, 0.25, 0.9)); const Tb = new Parts(); table(Tb, 0.9, 0.5, 0.75, RED); Tb.emit(Q, 0, 0.25, 0); Q.add('wood_dark', box(-0.06, 1.0, -0.04, 0.06, 1.06, 0.04)); put(Q, u0 + 0.95, m + 1.0, 0); blk(u0 + 0.05, m + 0.1, u0 + 1.85, m + 1.9, 0.9); }
  // tables in rows, a bench each side (clear of the back strip and the front's counter line)
  const colsN = Math.max(1, Math.floor((u1 - u0) / 1.95)), rows = Math.max(1, Math.floor((Dp - m - 1.0 - 2.9) / 1.9) + 1);
  for (let i = 0; i < rows; i++) for (let j = 0; j < colsN; j++) {
    const a = u0 + (u1 - u0) * (j + 0.5) / colsN, b = 3.0 + i * 1.9;
    if (b > Dp - m - 1.0) continue;
    const Q = new Parts(); table(Q, 0.85, 0.85, 0.78);
    // a covered pot of tea and two bowls on each
    Q.add('glaze_white', lathe([[0.001, 0], [0.08, 0.01], [0.09, 0.12], [0.06, 0.16], [0.001, 0.16]], 8, null, 0.1, 0.78, 0));
    for (const dx of [-0.25, 0.3]) Q.add('glaze_white', lathe([[0.001, 0], [0.04, 0.0], [0.055, 0.06], [0.001, 0.06]], 8, null, dx, 0.78, 0.2));
    put(Q, a, b);
    for (const s of [-1, 1]) { const B = new Parts(); bench(B, 1.2); put(B, a, b + s * 0.7); }
    blk(a - 0.62, b - 0.9, a + 0.62, b + 0.9, 0.8);
  }
  // bird cages hung from the beams: a round cage of bamboo bars on its hook, half under a blue cloth
  for (let i = 0; i < 5; i++) {
    const a = u0 + 0.6 + i * (u1 - u0 - 1.2) / 4, b = 1.5 + rand() * (Dp - 3.5), Q = new Parts(), hy = (el.H ?? 4.0) - 0.9;
    Q.add('bamboo_culm', lathe([[0.15, 0], [0.16, 0.12], [0.15, 0.24], [0.001, 0.26]], 12, null, 0, hy - 0.26, 0));
    for (let k = 0; k < 10; k++) { const t = k / 10 * Math.PI * 2; Q.add('bamboo_culm', limb([Math.cos(t) * 0.15, hy - 0.26, Math.sin(t) * 0.15], [Math.cos(t) * 0.15, hy, Math.sin(t) * 0.15], 0.004, 0.004, 3)); }
    Q.add('bamboo_culm', lathe([[0.001, 0], [0.15, 0], [0.15, 0.01], [0.001, 0.01]], 12, null, 0, hy - 0.27, 0));
    if (i % 2) Q.add('cloth_indigo', lathe([[0.17, hy - 0.26], [0.17, hy + 0.05], [0.001, hy + 0.12]], 12));
    Q.add('timber', limb([0, hy + 0.12, 0], [0, hy + 0.55, 0], 0.006, 0.006, 3));
    put(Q, a, b);
  }
  // paper lanterns, red, from the beams
  for (const [a, b] of [[-Wd / 4, Dp * 0.4], [Wd / 4, Dp * 0.4], [-Wd / 4, Dp * 0.75], [Wd / 4, Dp * 0.75]]) { const Q = new Parts(); Q.add('lamp_paper', lathe([[0.001, 0], [0.16, 0.05], [0.2, 0.2], [0.16, 0.36], [0.001, 0.4]], 10, null, 0, (el.H ?? 4) - 1.5, 0)); Q.add('lacquer_black', box(-0.03, (el.H ?? 4) - 1.1, -0.03, 0.03, (el.H ?? 4) - 0.8, 0.03)); put(Q, a, b); }
  S.emit(bag, F.origin[0], y + 0.04, F.origin[1], F.yaw);
}

/** A pharmacy: the cabinet of a hundred drawers on the back wall, the counter with the scales, jars, hanging herbs. */
export function bjPharmacy(el, { bag, col }) {
  const F = frame(el.rect, el.front ?? 'e'), y = el.y, S = new Parts(), m = 0.5, Wd = F.Wd, Dp = F.Dp;
  const put = (Q, a, b, yw = 0, up = 0) => Q.emit(S, a, up, b, yw);
  const blk = (a0, b0, a1, b1, h) => { const p = F.WC(a0, b0), q = F.WC(a1, b1); col.rect([Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])], y, y + h); };
  // the hundred-drawer cabinet (baizi gui): rows of small drawers with brass pulls, the names on paper labels
  { const Q = new Parts(), w = Math.min(Wd - 1.4, 5.0), cols = Math.floor(w / 0.32), rows = 9; Q.add(W, box(-w / 2, 0, -0.2, w / 2, 0.2 + rows * 0.2, 0.2)); Q.add('lacquer_black', box(-w / 2, 0, -0.205, w / 2, 0.2, -0.2));
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const x = -w / 2 + 0.05 + (c + 0.5) * (w - 0.1) / cols, yy = 0.24 + r * 0.2; Q.add('wood_painted', box(x - 0.14, yy, -0.215, x + 0.14, yy + 0.17, -0.2)); Q.add('gilt_bronze', box(x - 0.025, yy + 0.07, -0.235, x + 0.025, yy + 0.1, -0.2125)); Q.add('paint_white', box(x - 0.07, yy + 0.12, -0.2285, x + 0.07, yy + 0.16, -0.2135)); }
    put(Q, 0, m + 0.22, Math.PI); blk(-w / 2, m, w / 2, m + 0.45, 2.1); }
  // the counter with the scale, a mortar, a hand-mill (a boat-shaped iron trough with its wheel)
  { const Q = new Parts(), w = Math.min(Wd - 1.2, 4.6); table(Q, w, 0.75, 1.0, W, true); Q.add('bronze', lathe([[0.001, 0], [0.12, 0.02], [0.1, 0.12], [0.001, 0.12]], 10, null, -w / 2 + 0.5, 1.0, 0)); Q.add('iron', box(-0.35, 1.0, -0.1, 0.35, 1.06, 0.1)); Q.add('iron', lathe([[0.001, -0.02], [0.14, -0.02], [0.14, 0.02], [0.001, 0.02]], 14).rotateZ(Math.PI / 2).translate(0.0, 1.17, 0)); Q.add('timber', limb([0, 1.0, 0], [0, 1.55, 0], 0.008, 0.008, 4)); Q.add('timber', limb([-0.3, 1.55, 0], [0.3, 1.55, 0], 0.006, 0.006, 4)); put(Q, 0, m + 1.7); blk(-w / 2, m + 1.3, w / 2, m + 2.1, 1.0); }
  // jars on the floor along the wall; herbs in bundles from the beams
  for (let i = 0; i < 5; i++) { const Q = new Parts(); Q.add('pottery_dark', lathe([[0.001, 0], [0.18, 0.02], [0.24, 0.25], [0.14, 0.45], [0.001, 0.47]], 10)); Q.add('cloth_red', lathe([[0.12, 0.45], [0.14, 0.5], [0.001, 0.52]], 8)); put(Q, -Wd / 2 + m + 0.3, 3.0 + i * 0.6); }
  for (let i = 0; i < 7; i++) { const a = -Wd / 2 + 0.9 + i * (Wd - 1.8) / 6, Q = new Parts(), h = (el.H ?? 3.8) - 0.5; Q.add('timber', limb([0, h + 0.5, 0], [0, h, 0], 0.005, 0.005, 3)); Q.add(i % 2 ? 'cloth_green' : 'cloth_brown', lathe([[0.02, 0], [0.09, -0.05], [0.12, -0.32], [0.04, -0.4], [0.001, -0.42]], 8, null, 0, h, 0)); put(Q, a, Dp * 0.4 + (i % 3) * 0.7); }
  { const C = new Parts(); chair(C); put(C, Wd / 2 - 0.8, Dp * 0.55, Math.PI / 2); }
  S.emit(bag, F.origin[0], y + 0.04, F.origin[1], F.yaw);
}
void T; void ball; void fromTriangles; void Hall; void HOUSE;
