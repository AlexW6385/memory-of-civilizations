// The rooms of Qufu's great halls (docs/settlements/lu-qufu.md §4, §10): what stands inside the halls the Dacheng Hall's neighbours — the Resting
// Hall of Confucius's wife and the halls of his parents and ancestors (the enthroned figure in its shrine before the offering table), the Hall
// of Sage Traces (the stone slabs of the carved life, set in the walls), the Wu corridors (a red tablet shrine and its offering table in
// every bay), Kuiwen Pavilion (the books of the emperors on their shelves, the stele) and the Kong Mansion's halls: the yamen hall of the Duke
// (the dais, the table and the high chair before the screen, the red staves and the signs of silence), and the family rooms.
// Element lu_inside: { kind, rect (the hall's), y (its floor), seed, front ('s' | 'e' | 'w') }.
import { box, lathe } from '../../core/geom.js';
import { Parts } from '../qing/carving.js';
import { rng } from './kit.js';
import { tools, tang, chamber, table, chair, stool, lantern } from './house.js';
import { seatedSage } from './dacheng.js';

function shrineRoom(T, ctx, [x0, z0, x1, z1], y, rand, scale = 0.5) {
  const cx = (x0 + x1) / 2, zb = z0 + 0.6, w = x1 - x0;
  T.B('lacquer_red', cx - 2.6, y, zb, cx + 2.6, y + 0.5, zb + 3.2, true);
  T.B('marble', cx - 2.7, y + 0.48, zb - 0.05, cx + 2.7, y + 0.52, zb + 3.25);
  T.B('lacquer_red', cx - 2.2, y + 0.5, zb, cx + 2.2, y + 3.6, zb + 0.25);
  T.B('gilt_bronze', cx - 1.5, y + 1.6, zb + 0.25, cx + 1.5, y + 3.0, zb + 0.3);
  for (const sx of [-1, 1]) T.bag.add('lacquer_red', lathe([[0.2, 0], [0.17, 3.2]], 8, null, cx + sx * 2.1, y + 0.5, zb + 2.9));
  T.B('paint_caihua', cx - 2.4, y + 3.6, zb, cx + 2.4, y + 3.95, zb + 3.1);
  const P = new Parts(); seatedSage(P, 'clay_robe', 1, true); P.emit(ctx.bag, cx, y + 0.5, zb + 1.5, Math.PI, scale);
  T.B('lacquer_red', cx - 1.8, y, zb + 4.0, cx + 1.8, y + 0.95, zb + 4.9, true);
  T.B('lacquer_black', cx - 1.85, y + 0.95, zb + 3.95, cx + 1.85, y + 1.0, zb + 4.95);
  for (let k = -3; k <= 3; k++) T.L(k % 2 ? 'bronze' : 'gilt_bronze', [[0.001, 0], [0.1, 0.02], [0.12, 0.18], [0.001, 0.2]], 8, cx + k * 0.45, y + 1.0, zb + 4.45);
  T.L('bronze', [[0.2, 0], [0.4, 0.15], [0.44, 0.65], [0.3, 0.85], [0.001, 0.88]], 10, cx, y, zb + 6.0); T.col.circle(cx, zb + 6.0, 0.45, y, y + 0.9);
  // the tablets of the attendants in red cases along the side walls
  for (const sx of [-1, 1]) for (let k = 0; k < Math.floor((x1 - x0 - 8) / 2.4 / 2); k++) {
    const x = sx < 0 ? x0 + 0.7 : x1 - 0.7, z = zb + 2.0 + k * 2.2;
    T.B('lacquer_red', x - 0.3, y, z - 0.6, x + 0.3, y + 1.9, z + 0.6, true); T.B('gilt_bronze', sx < 0 ? x + 0.3 : x - 0.31, y + 0.8, z - 0.2, sx < 0 ? x + 0.31 : x - 0.3, y + 1.6, z + 0.2);
  }
  void rand; void w;
}
function wuRoom(T, [x0, z0, x1, z1], y, front) {
  // a long hall along z: its back wall away from the court (front e: back at x0)
  const along = z1 - z0 > x1 - x0, n = 15, bz = (z1 - z0) / n, back = front === 'e' ? x0 + 0.5 : x1 - 0.5, dir = front === 'e' ? 1 : -1;
  if (!along) return;
  for (let k = 0; k < n; k++) {
    const z = z0 + bz * (k + 0.5);
    T.B('lacquer_red', Math.min(back, back + dir * 0.6) - 0, y, z - 1.0, Math.max(back, back + dir * 0.6), y + 2.5, z + 1.0, true);
    const fx = back + dir * 0.62;
    T.B('gilt_bronze', Math.min(fx, fx + dir * 0.02), y + 1.0, z - 0.3, Math.max(fx, fx + dir * 0.02), y + 2.0, z + 0.3);
    T.B('lacquer_red', Math.min(back + dir * 1.3, back + dir * 1.9), y, z - 0.5, Math.max(back + dir * 1.3, back + dir * 1.9), y + 0.9, z + 0.5, true);
    if (k % 3 === 1) T.L('bronze', [[0.12, 0], [0.18, 0.1], [0.001, 0.2]], 8, back + dir * 1.6, y + 0.9, z);
  }
}
function sageRoom(T, [x0, z0, x1, z1], y, rand) {
  // the slabs of the carved life in two courses on the side and back walls, a central stele
  const slab = (u0, u1, y0, y1, face, at) => {
    const m = rand() < 0.5 ? 'granite_grey' : 'granite_black';
    if (face === 'z') { T.B(m, u0, y0, at, u1, y1, at + 0.06); T.B('paint_white', u0 + 0.12, y0 + 0.1, at + 0.06, u1 - 0.12, y1 - 0.1, at + 0.065); } else { T.B(m, at, y0, u0, at + 0.06, y1, u1); T.B('paint_white', at + 0.06, y0 + 0.1, u0 + 0.12, at + 0.065, y1 - 0.1, u1 - 0.12); }
  };
  for (const [y0, y1] of [[y + 0.5, y + 1.5], [y + 1.7, y + 2.7]]) {
    for (let u = x0 + 0.5; u < x1 - 1.6; u += 1.2) slab(u, u + 1.05, y0, y1, 'z', z0 + 0.3);
    for (let u = z0 + 1.0; u < z1 - 1.8; u += 1.2) { slab(u, u + 1.05, y0, y1, 'x', x0 + 0.3); slab(u, u + 1.05, y0, y1, 'x', x1 - 0.36); }
  }
  T.B('granite_grey', (x0 + x1) / 2 - 0.5, y, (z0 + z1) / 2 - 0.12, (x0 + x1) / 2 + 0.5, y + 2.6, (z0 + z1) / 2 + 0.12, true);
  T.B('granite_black', (x0 + x1) / 2 - 0.7, y, (z0 + z1) / 2 - 0.3, (x0 + x1) / 2 + 0.7, y + 0.35, (z0 + z1) / 2 + 0.3, true);
}
function kuiwenRoom(T, ctx, [x0, z0, x1, z1], y, rand) {
  // books of the emperors on shelves along the back and sides; a reading table; a great stele; the lantern
  for (const [a, b, c, d] of [[x0 + 0.4, z0 + 0.3, (x0 + x1) / 2 - 2.4, z0 + 0.8], [(x0 + x1) / 2 + 2.4, z0 + 0.3, x1 - 0.4, z0 + 0.8], [x0 + 0.3, z0 + 1.2, x0 + 0.8, z1 - 2.5], [x1 - 0.8, z0 + 1.2, x1 - 0.3, z1 - 2.5]]) {
    T.B('lacquer_chestnut', a, y, b, c, y + 2.6, d, true);
    const along = c - a > d - b;
    for (let r = 0; r < 4; r++) for (let k = 0; k < Math.floor((along ? c - a : d - b) / 0.22); k++) {
      const u = (along ? a : b) + 0.1 + k * 0.22, yy = y + 0.25 + r * 0.6;
      if (along) T.B(rand() < 0.5 ? 'cloth_indigo' : 'cloth_white', u, yy, d, u + 0.17, yy + 0.4, d + 0.02); else T.B(rand() < 0.5 ? 'cloth_indigo' : 'cloth_white', c, yy, u, c + 0.02, yy + 0.4, u + 0.17);
    }
  }
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  table(T, cx - 5.5, y, cz, 2.4, 1.0, 0.8); for (const sx of [-1, 1]) chair(T, cx - 5.5 + sx * 0.7, y, cz - 0.8, 's');
  T.B('granite_black', cx + 5.2, y, cz + 0.3, cx + 6.4, y + 0.4, cz + 2.0, true); T.B('granite_grey', cx + 5.4, y + 0.4, cz + 0.8, cx + 6.2, y + 3.4, cz + 1.0, true);
  lantern(T, cx, y + 3.0, cz); lantern(T, cx - 5, y + 3.0, cz + 1.0); lantern(T, cx + 5, y + 3.0, cz + 1.0);
  void ctx;
}
function yamenRoom(T, ctx, [x0, z0, x1, z1], y, rand, grand) {
  const cx = (x0 + x1) / 2, zb = z0 + 0.5, w = x1 - x0;
  // the dais, the screen painted with the sun over the sea, the Duke's table and high chair, the brush stand and seal box
  T.B('brick_grey', cx - 3.6, y, zb, cx + 3.6, y + 0.35, zb + 4.4, true);
  T.B('lacquer_red', cx - 3.6, y + 0.35, zb, cx + 3.6, y + 0.4, zb + 4.4);
  T.B('lacquer_red', cx - 2.8, y + 0.4, zb + 0.3, cx + 2.8, y + 3.2, zb + 0.5, true);
  T.B('paint_blue', cx - 2.5, y + 0.8, zb + 0.5, cx + 2.5, y + 3.0, zb + 0.52); T.B('flame', cx - 0.5, y + 2.0, zb + 0.52, cx + 0.5, y + 2.9, zb + 0.54);
  table(T, cx, y + 0.4, zb + 2.2, 2.6, 0.9, 0.85, 'lacquer_red');
  chair(T, cx, y + 0.4, zb + 1.1, 's', 'lacquer_red'); T.B('hide_tan', cx - 0.3, y + 0.4 + 0.5, zb + 0.9, cx + 0.3, y + 0.4 + 0.52, zb + 1.3);
  T.L('lacquer_black', [[0.001, 0], [0.07, 0.0], [0.07, 0.2], [0.001, 0.2]], 8, cx - 0.9, y + 0.4 + 0.85, zb + 2.2);
  T.B('lacquer_red', cx + 0.6, y + 0.4 + 0.85, zb + 2.0, cx + 0.95, y + 0.4 + 0.95, zb + 2.4);
  // the paired staves and the signs, the officials' benches either side of the hall
  for (const sx of [-1, 1]) for (let k = 0; k < (grand ? 4 : 2); k++) {
    const x = cx + sx * (4.4 + k * 0.7), z = zb + 5.0;
    T.B('lacquer_black', x - 0.04, y, z - 0.04, x + 0.04, y + 2.1, z + 0.04, true); T.B('lacquer_red', x - 0.045, y + 1.9, z - 0.045, x + 0.045, y + 2.1, z + 0.045);
  }
  for (const sx of [-1, 1]) { T.B('lacquer_black', cx + sx * 6.2 - 0.04, y + 0.2, zb + 5.5, cx + sx * 6.2 + 0.04, y + 2.4, zb + 6.2); T.B('gilt_bronze', cx + sx * 6.2 - 0.08, y + 0.8, zb + 5.6, cx + sx * 6.2 + 0.08, y + 2.0, zb + 6.1); }
  for (const sx of [-1, 1]) for (let k = 0; k < Math.max(0, Math.floor((w - 14) / 3.2)); k++) { const x = cx + sx * (7.5 + k * 3.0); if (Math.abs(x - cx) < w / 2 - 0.8) { table(T, x, y, zb + 4, 0.8, 1.6, 0.8); } }
  for (const dx of [-5, 0, 5]) lantern(T, cx + dx, y + 3.2, zb + 4.5);
  void ctx; void rand;
}
function parlorRoom(T, [x0, z0, x1, z1], y, rand, study) {
  const w = x1 - x0, cx = (x0 + x1) / 2, zb = z0 + 0.4;
  if (study) {
    for (let k = 0; k < 3; k++) { table(T, x0 + 2.2 + k * 3.2, y, zb + 1.2, 1.8, 0.8, 0.78); chair(T, x0 + 2.2 + k * 3.2, y, zb + 2.1, 'n'); T.B('cloth_white', x0 + 1.7 + k * 3.2, y + 0.78, zb + 1.0, x0 + 2.4 + k * 3.2, y + 0.82, zb + 1.4); }
    T.B('lacquer_chestnut', cx - 3.0, y, z1 - 1.0, cx + 3.0, y + 2.2, z1 - 0.6, true);
    for (let k = 0; k < 24; k++) T.B(k % 3 ? 'cloth_indigo' : 'cloth_white', cx - 2.9 + k * 0.24, y + 0.3 + (k % 2) * 0.9, z1 - 0.6, cx - 2.72 + k * 0.24, y + 0.9 + (k % 2) * 0.9, z1 - 0.58);
    return;
  }
  const n = Math.max(3, Math.round(w / 4)), bw = w / n, mid = (n - 1) / 2;
  tang(T, x0 + bw * (Math.floor(mid) + 0.5), y, zb, bw, rand);
  if (n >= 3) { chamber(T, [x0 + 0.2, x0 + bw * Math.floor(mid) - 0.15], y, zb, z1, rand() < 0.5 ? 0 : 1, rand); chamber(T, [x0 + bw * (Math.floor(mid) + 1) + 0.15, x1 - 0.2], y, zb, z1, 0, rand); }
  stool(T, x1 - 2, y, z1 - 1.2);
}
export function inside(el, ctx) {
  const T = tools(ctx), rand = rng(el.seed ?? 7), [x0, z0, x1, z1] = el.rect, y = el.y ?? 0;
  const r = [x0 + 0.3, z0 + 0.3, x1 - 0.3, z1 - 0.3];
  switch (el.kind) {
    case 'shrine': shrineRoom(T, ctx, r, y, rand, el.scale ?? 0.5); break;
    case 'wu': wuRoom(T, r, y, el.front ?? 'e'); break;
    case 'sage': sageRoom(T, r, y, rand); break;
    case 'kuiwen': kuiwenRoom(T, ctx, r, y, rand); break;
    case 'yamen': yamenRoom(T, ctx, r, y, rand, !!el.grand); break;
    case 'drum': {
      const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      T.B('lacquer_chestnut', cx - 1.3, y, cz - 0.4, cx - 1.1, y + 1.6, cz + 0.4, true); T.B('lacquer_chestnut', cx + 1.1, y, cz - 0.4, cx + 1.3, y + 1.6, cz + 0.4, true);
      T.L('lacquer_red', [[0.001, 0], [0.9, 0], [1.0, 0.4], [1.0, 0.9], [0.9, 1.3], [0.001, 1.3]], 14, cx, y + 0.3, cz); T.col.circle(cx, cz, 1.0, y, y + 1.7);
      T.B('timber', x0 + 1.0, y, z0 + 1.0, x0 + 3.0, y + 0.5, z0 + 1.6, true);
      break;
    }
    case 'study': parlorRoom(T, r, y, rand, true); break;
    default: parlorRoom(T, r, y, rand, false);
  }
  // the lamps of the hall for the dusk
  const cx = (x0 + x1) / 2;
  ctx.lights?.push({ at: [cx, y + 3.0, (z0 + z1) / 2], color: '#ffcf93', intensity: 5, distance: 14 });
  void box;
}
