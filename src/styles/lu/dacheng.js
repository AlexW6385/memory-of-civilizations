// The Dacheng Hall (docs/settlements/lu-qufu.md §4): 45.7 × 24.85 m, nine bays by five, double eaves under yellow glazed tile, on a stone
// base 2.1 m high with the moon terrace before it; the ten front columns of stone wound by coiled dragons; inside, the enthroned statue
// of Confucius in his shrine, the Four Correlates and the Twelve Wise Men, the table of offerings, the bronze vessels, the chimes and the drum.
import { box, lathe } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { IMPERIAL } from '../qing/index.js';
import { Parts, ball, limb, T } from '../qing/carving.js';
import { rng } from './kit.js';

const PAL = { ...IMPERIAL, column: 'granite_grey', base: 'marble' };

/** A coiled-dragon stone column: the shaft with a spiral ridge turning up it, the head at the top. */
function dragonColumn(P, h, seed) {
  const prof = [[0.52, 0], [0.5, 0.18], [0.4, 0.3]];
  const N = 16;
  for (let i = 0; i <= N; i++) prof.push([0.4 - 0.03 * i / N, 0.3 + (h - 0.6) * i / N]);
  prof.push([0.38, h - 0.2], [0.001, h - 0.2]);
  const ph = seed * 1.7;
  P.add('granite_grey', lathe(prof, 14, (th, i) => (i >= 3 && i <= N + 3 ? 1 + 0.2 * Math.max(0, Math.cos(th - (i - 3) * 0.62 + ph)) ** 2 : 1)));
  // the second turn of the coil, in gilt: a thin spiral band; and the dragon's head and claws
  P.add('gilt_bronze', lathe(prof, 14, (th, i) => (i >= 3 && i <= N + 3 ? 1 + 0.07 * Math.max(0, Math.cos(th - (i - 3) * 0.62 + ph + 0.2)) ** 6 : 0.01)));
  P.add('granite_grey', T(ball(0.2, 0.17, 0.26, 8, 5), 0.0, h - 0.6, 0.42));
}

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
  STYLES.qing.elements.qing_hall({ t: 'qing_hall', rect: el.rect, y, H, double: el.double ?? 7.2, roof: 'hip', bays: [9, 5], front: 's', four: false, platform: false, doors: ['n'], eave: 3.4, rise: 9.4, sweep: 0.8, pal: PAL, orn: { figures: 9 } }, ctx);
  // the ten dragon columns before the front wall: on the front column line, the stone thicker than the posts behind
  const bw = (x1 - x0) / 9, hc = H - 0.4;
  for (let i = 0; i <= 9; i++) {
    const x = x0 + i * bw, P = new Parts();
    dragonColumn(P, hc, i);
    P.emit(bag, x, y, z1 + 0.62, Math.PI * (i % 2 ? 0.0 : 0.15));
    col.circle(x, z1 + 0.62, 0.52, y, y + hc);
  }
  // the side columns of the peristyle, plain stone, on both long sides
  for (const sx of [x0, x1]) for (let j = 1; j <= 5; j++) {
    const z = z0 + (z1 - z0) * j / 5, P = new Parts();
    P.add('granite_grey', lathe([[0.5, 0], [0.5, 0.15], [0.4, 0.3], [0.38, hc - 0.4], [0.001, hc - 0.4]], 10));
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
  const stat = new Parts(); seatedSage(stat, 'clay_gilt', 1, true);
  bag.add('lacquer_red', box(cx - 1.5, y + 0.8, zb + 3.1, cx + 1.5, y + 1.6, zb + 6.2)); col.rect([cx - 1.5, zb + 3.1, cx + 1.5, zb + 6.2], y + 0.8, y + 5);
  stat.emit(bag, cx, y + 1.6, zb + 4.6, Math.PI, 1.0);
  // the Four Correlates, two each side, smaller, in robes of green and red
  for (const sx of [-1, 1]) for (const [k, dz] of [[0, 3.4], [1, 6.4]]) {
    const P = new Parts(); seatedSage(P, k ? 'clay_green' : 'clay_robe', 1, false);
    P.emit(bag, cx + sx * 8.8, y, zb + 1.5 + dz, Math.PI, 0.62);
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
  // hanging banners (cloth) are left out; the lamps
  for (const [dx, dz] of [[0, 7], [-12, 9], [12, 9], [0, 17], [-14, 19], [14, 19]]) lights.push({ at: [cx + dx, y + H - 1.4, z0 + dz], color: '#ffcf93', intensity: 7, distance: 20 });
  void rand; void W;
}
