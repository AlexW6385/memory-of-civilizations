// The Dacheng Hall (docs/settlements/lu-qufu.md §4): 45.7 × 24.85 m, nine bays by five, double eaves under yellow glazed tile, on a stone
// base 2.1 m high with the moon terrace before it; the ten front columns of stone wound by coiled dragons; inside, the enthroned statue
// of Confucius in his shrine, the Four Correlates and the Twelve Wise Men, the table of offerings, the bronze vessels, the chimes and the drum.
import { box, lathe } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { IMPERIAL } from '../qing/index.js';
import { Parts, ball, limb, T } from '../qing/carving.js';
import { dragon } from '../qing/throne.js';
import { placeColumn } from './colwork.js';
import { confucius, correlate } from './statue.js';
import { dougongHeight } from '../qing/caihua.js';
import { rng } from './kit.js';
import { glyph, writeColumn, writeRow } from './plaques.js';
import { tileCourses } from './tiles.js';

const PAL = { ...IMPERIAL, column: 'granite_grey', base: 'marble' };

/** A seated statue facing +z: robe, torso, head, crown; s the scale (the Master about 3.4 m seated). */
export function seatedSage(P, robe, s, crown) {
  P.add(robe, T(ball(0.95, 0.5, 0.8, 10, 6), 0, 0.5, 0));                         // the lap and legs
  P.add(robe, limb([0, 0.7, -0.1], [0, 1.9, -0.05], 0.62, 0.4, 10));                 // the body
  for (const sx of [-1, 1]) P.add(robe, limb([sx * 0.45, 1.75, 0], [sx * 0.55, 0.95, 0.55], 0.17, 0.13, 6));   // the arms to the gui
  P.add('clay_gilt', box(-0.14, 0.9, 0.5, 0.14, 1.65, 0.62));                        // the jade tablet held before the chest
  P.add('skin_light', T(ball(0.27, 0.32, 0.27, 10, 6), 0, 2.25, 0.02));
  if (crown) {
    P.add('lacquer_black', box(-0.4, 2.55, -0.28, 0.4, 2.62, 0.46));                // the mianliu: board and the hanging strings of beads
    for (let k = -3; k <= 3; k++) P.add('gilt_bronze', box(0.1 * k - 0.012, 2.12, 0.42, 0.1 * k + 0.012, 2.55, 0.45));
  } else P.add('lacquer_black', T(ball(0.26, 0.14, 0.26, 8, 4), 0, 2.5, 0));
  void s;
}

/**
 * lu_dacheng: { rect: [x0, z0, x1, z1] (the hall's body), y (floor, 2.1), H (the lower eaves), double (the upper storey), seed }. The hall faces south.
 * The base and the moon terrace are in the plan (qing terrace and stairs); the hall's own platform is turned off.
 */
export function dacheng(el, ctx) {
  const { bag, col, lights } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 2.1, H = el.H ?? 8.4, cx = (x0 + x1) / 2, rand = rng(el.seed ?? 3);
  STYLES.qing.elements.qing_hall({ t: 'qing_hall', rect: el.rect, y, H, double: el.double ?? 7.2, roof: 'xieshan', bays: [9, 5], front: 's', four: false, platform: false, doors: ['n'], eave: 3.4, rise: 9.4, sweep: 0.8, pal: PAL, orn: { figures: 9 } }, ctx);
  // the cover tiles of both roofs, laid over the smooth sheets with the same figures qing_hall gave them (docs §12)
  {
    const bk0 = dougongHeight({ tiers: H > 8 ? 3 : 2 }), W0 = x1 - x0, D0 = z1 - z0, inset = Math.min(W0, D0) / 5.5, o = 3.4, yb0 = y + H + bk0, Dd = el.double ?? 7.2;
    tileCourses(bag, { c: [cx, (z0 + z1) / 2], A: W0 / 2 + o, B: D0 / 2 + o, y: y + H - 0.25 + bk0, rise: (inset + o) * 0.55, p: 1.25, kind: 'hip', sweep: 0.8 }, { reach: inset + o - 0.3, seed: 1 });
    tileCourses(bag, { c: [cx, (z0 + z1) / 2], A: (W0 - 2 * inset) / 2 + o * 1.1, B: (D0 - 2 * inset) / 2 + o * 1.1, y: yb0 + Dd - 0.25 + bk0, rise: 9.4, kind: 'xieshan', gableAt: 0.45, sweep: 0.8 }, { seed: 2 });
  }
  // the two gable faces of the upper roof (the xieshan's "nine ridges"): red boards with vertical battens in painted green-blue, a gilt medallion of
  // clouds at the middle (the hanging fish and the carved gable of the Qing halls, schematic)
  {
    const bk0 = dougongHeight({ tiers: H > 8 ? 3 : 2 }), W0 = x1 - x0, D0 = z1 - z0, inset = Math.min(W0, D0) / 5.5, o = 3.4, yb0 = y + H + bk0, Dd = el.double ?? 7.2;
    const A2 = (W0 - 2 * inset) / 2 + o * 1.1, B2 = (D0 - 2 * inset) / 2 + o * 1.1, yu = yb0 + Dd - 0.25 + bk0, Rr = 9.4, gAt = 0.45, xg = A2 - gAt * B2, zc = (z0 + z1) / 2, p = 1.7;
    const hAt = (zz) => yu + Rr * Math.pow(Math.max(0, Math.min(1, (B2 - Math.abs(zz)) / B2)), p), yLow = yu + Rr * Math.pow(gAt, p);
    for (const sx of [-1, 1]) {
      const xf = cx + sx * (xg + 0.05), zr = B2 * (1 - gAt) - 0.5;
      for (let k = -Math.floor(zr / 0.5); k <= Math.floor(zr / 0.5); k++) {
        const zz = k * 0.5 + 0.0007 * k * sx, top = hAt(zz) - 0.55, bot = yLow + 0.25;
        if (top - bot > 0.4) bag.add('paint_caihua', box(xf - 0.03, bot, zc + zz - 0.07, xf + 0.03, top, zc + zz + 0.07).translate(0, 0, 0));
      }
      const my = yLow + (Rr * 0.52 - Rr * Math.pow(gAt, p)) * 0.5 + 1.2;
      bag.add('gilt_bronze', T(ball(0.07, 1.4, 1.4, 4, 16), xf + sx * 0.06, my, zc));
      bag.add('paint_blue', T(ball(0.07, 0.95, 0.95, 4, 16), xf + sx * 0.1, my, zc));
      bag.add('gilt_bronze', T(ball(0.08, 0.42, 0.42, 4, 12), xf + sx * 0.14, my, zc));
    }
  }
  // the ten dragon columns before the front wall: on the front column line, the stone thicker than the posts behind
  const bw = (x1 - x0) / 9, hc = H - 0.4;
  for (let i = 0; i <= 9; i++) {
    const x = x0 + i * bw;
    placeColumn(bag, x, z1 + 0.62, y, hc, 'R');                       // the reduced sculpture, always drawn (the fine layer: the plan's near detail)
    col.circle(x, z1 + 0.62, 0.52, y, y + hc);
  }
  // the side columns of the peristyle, plain stone, on both long sides
  for (const sx of [x0, x1]) for (let j = 1; j <= 5; j++) {
    const z = z0 + (z1 - z0) * j / 5, P = new Parts();
    P.add('marble', box(-0.6, 0, -0.6, 0.6, 0.2, 0.6));
    P.add('granite_grey', lathe([[0.5, 0.2], [0.46, 0.3], [0.42, 0.4], [0.4, hc - 0.4], [0.44, hc - 0.34], [0.001, hc - 0.34]], 8));   // an octagonal shaft (eight sides), as the plain columns of the hall are
    P.emit(bag, sx + (sx < cx ? -0.62 : 0.62), y, z);
    col.circle(sx + (sx < cx ? -0.62 : 0.62), z, 0.46, y, y + hc);
  }
  // ── inside ──
  const zb = z0 + 1.0, W = x1 - x0;
  // the dais and the shrine in the middle bay at the back
  bag.add('lacquer_red', box(cx - 6.6, y, zb, cx + 6.6, y + 0.8, zb + 8)); col.rect([cx - 6.6, zb, cx + 6.6, zb + 8], y, y + 0.8); col.floor([cx - 6.6, zb, cx + 6.6, zb + 8], y + 0.8);
  bag.add('marble', box(cx - 6.7, y + 0.78, zb - 0.1, cx + 6.7, y + 0.84, zb + 8.1));
  for (const sx of [-1, 1]) {
    bag.add('lacquer_red', lathe([[0.4, 0], [0.32, 6.6]], 8, null, cx + sx * 4.2, y + 0.8, zb + 1.4)); col.circle(cx + sx * 4.2, zb + 1.4, 0.4, y, y + 7);
    bag.add('lacquer_red', lathe([[0.4, 0], [0.32, 6.6]], 8, null, cx + sx * 4.2, y + 0.8, zb + 6.2)); col.circle(cx + sx * 4.2, zb + 6.2, 0.4, y, y + 7);
  }
  bag.add('lacquer_red', box(cx - 4.7, y + 7.4, zb + 1.1, cx + 4.7, y + 7.9, zb + 6.6));         // the canopy beam
  bag.add('paint_caihua', box(cx - 4.9, y + 6.8, zb + 1.0, cx + 4.9, y + 7.4, zb + 6.8));
  bag.add('lacquer_red', box(cx - 4.6, y + 0.8, zb + 0.2, cx + 4.6, y + 7.4, zb + 0.5));         // the shrine's back screen
  bag.add('gilt_bronze', box(cx - 3.6, y + 3.6, zb + 0.5, cx + 3.6, y + 6.2, zb + 0.56));        // the gilt screen
  bag.add('clay_gilt', box(cx - 3.0, y + 7.95, zb + 0.9, cx + 3.0, y + 8.55, zb + 1.0));         // the plaque of the shrine
  bag.add('lacquer_red', box(cx - 1.5, y + 0.8, zb + 3.1, cx + 1.5, y + 1.6, zb + 6.2)); col.rect([cx - 1.5, zb + 3.1, cx + 1.5, zb + 6.2], y + 0.8, y + 5);
  confucius('R').emit(bag, cx, y + 1.6, zb + 4.6, 0, 1.0);                       // the enthroned statue, facing the door (fine layer: the plan's near detail)
  // the Four Correlates, two each side, smaller, in robes of green and red
  for (const sx of [-1, 1]) for (const [k, dz] of [[0, 3.4], [1, 6.4]]) {
    correlate(k ? 'clay_green' : 'clay_robe', (sx + 2) * 3 + k, 'R').emit(bag, cx + sx * 8.8, y + 0.5, zb + 1.5 + dz, 0, 0.72);
    bag.add('lacquer_red', box(cx + sx * 8.8 - 1.0, y, zb + dz + 0.1, cx + sx * 8.8 + 1.0, y + 0.5, zb + dz + 2.9));
  }
  // the table of offerings and the vessels, the burners before the shrine
  bag.add('lacquer_red', box(cx - 3.0, y, zb + 9.0, cx + 3.0, y + 1.05, zb + 10.4)); col.rect([cx - 3.0, zb + 9.0, cx + 3.0, zb + 10.4], y, y + 1.05);
  bag.add('lacquer_black', box(cx - 3.1, y + 1.05, zb + 8.9, cx + 3.1, y + 1.12, zb + 10.5));
  for (let k = -4; k <= 4; k++) bag.add(k % 2 ? 'bronze' : 'gilt_bronze', lathe([[0.001, 0], [0.12, 0.02], [0.14, 0.2], [0.001, 0.2]], 8, null, cx + k * 0.6, y + 1.12, zb + 9.7));
  for (const sx of [-1, 1]) {
    bag.add('bronze', lathe([[0.25, 0], [0.5, 0.2], [0.56, 0.8], [0.4, 1.0], [0.001, 1.04]], 12, null, cx + sx * 5.4, y, zb + 12.2)); col.circle(cx + sx * 5.4, zb + 12.2, 0.55, y, y + 1.1);
    bag.add('lacquer_red', lathe([[0.04, 0], [0.04, 1.3]], 6, null, cx + sx * 1.8, y + 1.12, zb + 9.2));
  }
  // the Twelve Wise Men: six tablet shrines along each side wall, red with a gilt tablet
  for (const sx of [-1, 1]) for (let k = 0; k < 6; k++) {
    const x = sx < 0 ? x0 + 0.9 : x1 - 0.9, z = z0 + 6.2 + k * 2.9;
    bag.add('lacquer_red', box(x - 0.4, y, z - 0.9, x + 0.4, y + 2.3, z + 0.9)); col.rect([x - 0.4, z - 0.9, x + 0.4, z + 0.9], y, y + 2.3);
    bag.add('gilt_bronze', box(x - 0.42 + (sx < 0 ? 0.82 : -0.82) * 0.5, y + 1.0, z - 0.3, x + 0.42 + (sx < 0 ? 0.82 : -0.82) * 0.5, y + 2.0, z + 0.3).translate(0, 0, 0));
  }
  // the bells (bianzhong) in their frame on the east side, the stone chimes on the west; the drum
  for (const [sx, mat] of [[1, 'bronze'], [-1, 'granite_black']]) {
    const x = cx + sx * 14, z = z1 - 4.5;
    bag.add('lacquer_black', box(x - 2.6, y, z - 0.2, x - 2.4, y + 2.4, z + 0.2)); bag.add('lacquer_black', box(x + 2.4, y, z - 0.2, x + 2.6, y + 2.4, z + 0.2)); bag.add('lacquer_black', box(x - 2.6, y + 2.3, z - 0.15, x + 2.6, y + 2.45, z + 0.15));
    col.rect([x - 2.6, z - 0.25, x + 2.6, z + 0.25], y, y + 2.5);
    for (let k = 0; k < 8; k++) { bag.add(mat, box(x - 2.1 + k * 0.6, y + 1.2 - (sx > 0 ? 0 : 0.0) + (mat === 'bronze' ? 0 : 0.5), z - 0.12, x - 1.7 + k * 0.6, y + 2.3, z + 0.12)); }
  }
  bag.add('lacquer_red', lathe([[0.7, 0], [0.9, 0.4], [0.9, 1.1], [0.001, 1.1]], 12, null, cx + 17.5, y + 0.7, z1 - 9)); bag.add('timber_red', box(cx + 16.6, y, z1 - 9.6, cx + 18.4, y + 0.7, z1 - 8.4));
  col.circle(cx + 17.5, z1 - 9, 0.9, y, y + 1.8);
  // ── the ceiling: the coffered ceiling under the upper body's floor, with the caisson over the shrine, and the plaques hung before it (§10) ──
  {
    const bk = dougongHeight({ tiers: y + H > 8 ? 3 : 2 }), cy = y + H + bk - 0.2 - 0.12;       // the underside of the upper body's box (qing_hall) less the thickness of the boards
    const cr = [x0 + 0.9, z0 + 0.9, x1 - 0.9, z1 - 0.9], well = [cx - 3.4, zb + 1.2, cx + 3.4, zb + 8.0];
    const nx = Math.round((cr[2] - cr[0]) / 1.9), nz = Math.round((cr[3] - cr[1]) / 1.9), sx = (cr[2] - cr[0]) / nx, sz = (cr[3] - cr[1]) / nz;
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      const ax = cr[0] + i * sx, az = cr[1] + j * sz, bx = ax + sx, bz = az + sz;
      if (ax > well[0] - 0.01 && bx < well[2] + 0.01 && az > well[1] - 0.01 && bz < well[3] + 0.01) continue;
      bag.add('paint_blue', box(ax + 0.06, cy, az + 0.06, bx - 0.06, cy + 0.04, bz - 0.06));          // each coffer a blue-green panel
      bag.add('paint_caihua', box(ax - 0.07, cy - 0.12, az - 0.07, ax + 0.07, cy + 0.05, bz + 0.07)); bag.add('paint_caihua', box(ax - 0.07, cy - 0.12, az - 0.07, bx + 0.07, cy + 0.05, az + 0.07));
      bag.add('gilt_bronze', lathe([[0.001, 0.0], [0.16, 0.02], [0.2, 0.06], [0.001, 0.1]], 8, null, ax + sx / 2, cy, az + sz / 2));       // a gilt boss in each coffer's heart
    }
    bag.add('paint_caihua', box(cr[2] - 0.07, cy - 0.12, cr[1] - 0.07, cr[2] + 0.07, cy + 0.05, cr[3] + 0.07)); bag.add('paint_caihua', box(cr[0] - 0.07, cy - 0.12, cr[3] - 0.07, cr[2] + 0.07, cy + 0.05, cr[3] + 0.07));
    // the caisson over the shrine: a stepped gilt-and-red frame, the blue field, the gilt dragon coiled in it with the pearl hung from its mouth
    const kx = (well[0] + well[2]) / 2, kz = (well[1] + well[3]) / 2, hw = (well[2] - well[0]) / 2, hd = (well[3] - well[1]) / 2;
    for (const [m, e, d0, d1] of [['paint_caihua', 0.0, -0.1, 0.06], ['gilt_bronze', 0.16, -0.22, -0.1], ['lacquer_red', 0.34, -0.3, -0.22]]) bag.add(m, box(kx - hw + e, cy + d0, kz - hd + e, kx + hw - e, cy + d1, kz + hd - e));
    bag.add('paint_blue', box(kx - hw + 0.5, cy - 0.34, kz - hd + 0.5, kx + hw - 0.5, cy - 0.3, kz + hd - 0.5));
    const Cq = new Parts(), pts = [];
    for (let k = 0; k <= 30; k++) { const a = 0.4 + k * 0.34, R = 2.1 - k * 0.045; pts.push([Math.cos(a) * R * 0.98, Math.sin(a) * R * 1.0, 0]); }
    pts[0] = [pts[1][0] * 0.7, pts[1][1] * 0.7, 0.1];
    dragon(Cq, 'gilt_bronze', pts, 0.16, { up: [0, 0, 1], flat: 0.55, head: 1.2 });
    for (const [mat, list] of Cq.m) for (const g of list) { g.rotateX(Math.PI / 2); g.translate(kx, cy - 0.3, kz); bag.add(mat, g); }   // laid flat, its face to the floor
    bag.add('gilt_bronze', lathe([[0.001, -0.7], [0.2, -0.62], [0.28, -0.45], [0.2, -0.28], [0.001, -0.22]], 10, null, kx, cy - 0.34, kz));           // the pearl hanging from the mouth
    bag.add('gilt_bronze', lathe([[0.012, -0.22], [0.012, 0]], 4, null, kx, cy - 0.34, kz));
    // the plaques of the emperors hung on the beams before the shrine, facing the door: gilt frame, black field, the characters
    for (const [px, pz, w, hgt, chs] of [[cx, zb + 12.6, 3.8, 1.5, ['万', '世', '师', '表']], [cx - 9.5, zb + 12.6, 2.9, 1.2, ['至', '圣']], [cx + 9.5, zb + 12.6, 2.9, 1.2, ['大', '成']]]) {
      const top = cy - 0.35, bot = top - hgt;
      bag.add('gilt_bronze', box(px - w / 2 - 0.08, bot - 0.08, pz - 0.06, px + w / 2 + 0.08, top + 0.08, pz + 0.06));
      bag.add('lacquer_black', box(px - w / 2, bot, pz, px + w / 2, top, pz + 0.09));
      const gs = Math.min(hgt * 0.62, (w - 0.4) / chs.length * 0.9);
      // the Kangxi emperor's board 萬世師表 (1684) is lettered in checked characters, horizontal, read right to left (docs/settlements/lu-qufu.md §19b); the others keep the schematic strokes
      if (chs.join('') === '万世师表') writeRow(bag, '萬世師表', px, bot + hgt / 2, pz + 0.09, pz + 0.13, (w - 0.3) / 4, Math.min(hgt * 0.8, (w - 0.3) / 4 * 0.94));
      else chs.forEach((ch, k) => glyph(bag, ch, px - ((chs.length - 1) * gs * 1.1) / 2 + k * gs * 1.1, bot + hgt / 2, pz + 0.125, 0, gs));
      for (const dx of [-1, 1]) bag.add('timber', limb([px + dx * w * 0.38, top + 0.08, pz], [px + dx * w * 0.38, cy, pz], 0.025, 0.025, 4));
    }
    // the name board of the hall under the upper eaves: the three characters on a vertical board over the middle bay
    const yb = y + H + bk, u = cx, zf = z1 - 4.52 + 0.07;                                       // the upper wall's front plane is z1 less the inset; the skirt roof covers its lowest 4 m
    bag.add('gilt_bronze', box(u - 0.62, yb + 4.4, zf - 0.02, u + 0.62, yb + 6.95, zf + 0.1)); bag.add('paint_blue', box(u - 0.5, yb + 4.52, zf + 0.1, u + 0.5, yb + 6.83, zf + 0.13));
    // 大成殿 in checked characters (docs/settlements/lu-qufu.md §10b); the schematic strokes stay only if a character were not in the table
    if (!writeColumn(bag, '大成殿', u, yb + 6.4, zf + 0.13, zf + 0.17, 0.74, 0.7)) ['大', '成', '殿'].forEach((ch, k) => glyph(bag, ch, u, yb + 6.4 - k * 0.74, zf + 0.165, 0, 0.7));
  }
  // hanging banners (cloth) are left out; the lamps
  for (const [dx, dz] of [[0, 7], [-12, 9], [12, 9], [0, 17], [-14, 19], [14, 19]]) lights.push({ at: [cx + dx, y + H - 1.4, z0 + dz], color: '#ffcf93', intensity: 7, distance: 20 });
  void rand; void W;
}
