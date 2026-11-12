// The ritual and record places of Yinxu (docs/settlements/shang-yinxu.md §2): the covered sacrificial pits in the court, Fu Hao's
// tomb with its small hall and the pits of her chariots, the oracle-bone archive with the diviners' shed, the Huan river and its
// plank bridges.
import { box, lathe, frustum, rod, fromTriangles, quad } from '../../core/geom.js';
import { platform, steps, thatch, vessel, wheel } from './geo.js';
import { TOMB, ARCHIVE, PITS, RIVER } from '../../settlements/shang-yinxu/layout.js';

const ball = (r, n = 8) => lathe(Array.from({ length: 6 }, (_, i) => { const t = i / 5 * Math.PI; return [Math.max(0.001, Math.sin(t) * r), r - Math.cos(t) * r]; }), n);

/** shang_pits: {} — rows of sacrificial pits in the court, each shut with a timber lid under a low mound of earth, a rammed rim. */
export function shangPits(el, { bag }) {
  const { x0, x1, z0, z1 } = PITS;
  for (let r = 0; r < 2; r++) for (let x = x0; x + 3.4 < x1 + 0.01; x += 4.5) {
    const z = z0 + r * (z1 - z0 - 3.6);
    bag.add('earth_wall', frustum([x - 0.15, z - 0.15, x + 1.75, z + 3.75], 0, 0.1, 0.05, 0.05, 0.05, 0.05, { noBottom: true }));
    bag.add('planks_grey', frustum([x + 0.1, z + 0.1, x + 1.5, z + 3.5], 0.1, 0.16, 0.02, 0.02, 0.02, 0.02, { noBottom: true }));
    for (const dz of [0.6, 1.8, 3.0]) bag.add('timber', box(x + 0.05, 0.16, z + dz, x + 1.55, 0.2, z + dz + 0.1));
  }
}

/** A chariot: a pole, an axle with two spoked wheels, a box body, the yoke; `y` the ground. */
export function chariot(bag, col, x, z, y = 0) {
  wheel(bag, x - 1.1, y + 0.62, z, 0.62, 'x'); wheel(bag, x + 1.1, y + 0.62, z, 0.62, 'x');
  bag.add('timber', rod([x - 1.3, y + 0.62, z], [x + 1.3, y + 0.62, z], 0.05, 6));
  bag.add('timber', box(x - 0.6, y + 0.7, z - 0.55, x + 0.6, y + 0.78, z + 0.45));
  for (const [a, b, c, d] of [[-0.6, -0.55, 0.6, -0.5], [-0.6, -0.55, -0.55, 0.45], [0.55, -0.55, 0.6, 0.45]]) bag.add('lacquer_red', box(x + a, y + 0.78, z + b, x + c, y + 1.25, z + d));
  bag.add('timber', rod([x, y + 0.72, z + 0.4], [x, y + 1.05, z + 2.9], 0.06, 6));          // the pole
  bag.add('timber', rod([x - 0.7, y + 1.15, z + 2.9], [x + 0.7, y + 1.15, z + 2.9], 0.05, 6));   // the yoke
  bag.add('bronze', box(x - 0.1, y + 1.1, z + 2.85, x + 0.1, y + 1.3, z + 2.95));
  col.rect([x - 1.3, z - 0.6, x + 1.3, z + 0.5], y, y + 1.3);
}

/** shang_tomb: {} — Fu Hao's tomb: a low rammed platform with the small hall above the shaft, an offering table, the six chariot pits, one chariot standing by. */
export function shangTomb(el, { bag, col, lights }) {
  const { plat, h, hall, pits } = TOMB, [hx0, hz0, hx1, hz1] = hall, cx = (hx0 + hx1) / 2, cz = (hz0 + hz1) / 2;
  platform(bag, col, plat, h, 0.3);
  steps(bag, col, [cx - 1.4, plat[3], cx + 1.4, plat[3] + 1.2], 0, h, 'n');
  // the small hall: three open sides on posts, a wall at the back, a hip of thatch
  const y = h, wh = 2.5;
  bag.add('mud_plaster', box(hx0, y, hz0, hx1, y + wh, hz0 + 0.45)); col.rect([hx0, hz0, hx1, hz0 + 0.45], y, y + wh);
  for (const [a, b, c, d] of [[hx0, hz0, hx0 + 0.45, hz1 - 3], [hx1 - 0.45, hz0, hx1, hz1 - 3]]) { bag.add('mud_plaster', box(a, y, b, c, y + wh, d)); col.rect([a, b, c, d], y, y + wh); }
  for (const x of [hx0 + 0.3, cx, hx1 - 0.3]) { bag.add('timber', lathe([[0.17, 0], [0.15, wh]], 8, null, x, y, hz1 - 0.3)); col.circle(x, hz1 - 0.3, 0.2, y, y + wh); }
  bag.add('timber', box(hx0 - 0.2, y + wh, hz1 - 0.5, hx1 + 0.2, y + wh + 0.3, hz1 - 0.1));
  thatch(bag, [hx0, hz0, hx1, hz1 - 0.3], y + wh + 0.25, 2.8, 1.3, true);
  bag.add('reed_mat', box(cx - 1.6, y, hz0 + 1, cx + 1.6, y + 0.03, hz0 + 4));
  bag.add('lacquer_black', box(cx - 1.2, y, hz0 + 0.6, cx + 1.2, y + 0.4, hz0 + 1.6)); col.rect([cx - 1.2, hz0 + 0.6, cx + 1.2, hz0 + 1.6], y, y + 0.4);
  vessel('ding', bag, cx, y + 0.4, hz0 + 1.1, 1.3); vessel('jue', bag, cx - 0.8, y + 0.4, hz0 + 1.1, 1); vessel('jue', bag, cx + 0.8, y + 0.4, hz0 + 1.1, 1); vessel('gu', bag, cx + 0.35, y + 0.4, hz0 + 1.3, 1);
  bag.add('flame', lathe([[0.001, 0], [0.06, 0.05], [0.001, 0.22]], 6, null, cx - 1.9, y + 0.6, hz0 + 2));
  bag.add('bronze', lathe([[0.001, 0], [0.18, 0.03], [0.04, 0.3], [0.04, 0.55], [0.12, 0.6], [0.001, 0.62]], 8, null, cx - 1.9, y, hz0 + 2));
  lights.push({ at: [cx - 1.9, y + 1.2, hz0 + 2.4], color: '#ffb468', intensity: 1.4, distance: 8 });
  // the offering table before the platform: bronze vessels, a jade
  // the six chariot pits: a rammed rim, a lid of planks under earth, in two rows of three
  const [qx0, qz0] = pits;
  for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
    const x = qx0 + 1 + c * 7, z = qz0 + 1 + r * 10;
    bag.add('earth_wall', frustum([x, z, x + 5.6, z + 8.4], 0, 0.18, 0.1, 0.1, 0.1, 0.1, { noBottom: true }));
    bag.add('planks_grey', frustum([x + 0.3, z + 0.3, x + 5.3, z + 8.1], 0.18, 0.26, 0.05, 0.05, 0.05, 0.05, { noBottom: true }));
  }
  chariot(bag, col, qx0 + 9, -98.4, 0);
  // ── Fu Hao's tomb dressed (docs §2a): the offering table before the platform, bells on a mat, jades, a lamp; the wattle fence round the zone;
  // the ridge and the weathering of the small hall; a second parked chariot's wheel leaned on the pit's rim ──
  { const tx = cx, tz = plat[3] + 3.6;
    bag.add('lacquer_black', box(tx - 1.6, 0, tz, tx + 1.6, 0.5, tz + 1.0)); col.rect([tx - 1.6, tz, tx + 1.6, tz + 1.0], 0, 0.5); bag.add('lacquer_red', box(tx - 1.6, 0.5, tz, tx + 1.6, 0.54, tz + 1.0));
    vessel('ding', bag, tx - 1.0, 0.54, tz + 0.5, 1.1); vessel('gui', bag, tx, 0.54, tz + 0.5, 0.9); vessel('zun', bag, tx + 0.9, 0.54, tz + 0.5, 1.1); vessel('jue', bag, tx + 1.3, 0.54, tz + 0.3, 0.9);
    for (let k = 0; k < 4; k++) bag.add('inlay_jade', box(tx - 0.8 + k * 0.45, 0.54, tz + 0.85, tx - 0.6 + k * 0.45, 0.57, tz + 0.95));
    bag.add('reed_mat', box(tx - 2.2, 0.01, tz + 1.3, tx + 2.2, 0.04, tz + 3.2));
    for (let i = 0; i < 3; i++) bag.add('bronze', lathe([[0.001, 0.4], [0.11 + i * 0.03, 0.43], [0.14 + i * 0.03, 0.1], [0.19 + i * 0.03, 0.0]], 8, null, tx - 1.0 + i * 0.6, 0.04, tz + 2.2));
    for (const s of [-1, 1]) { bag.add('bronze', lathe([[0.001, 0], [0.18, 0.03], [0.04, 0.3], [0.04, 0.9], [0.12, 1.0], [0.001, 1.02]], 8, null, tx + s * 2.6, 0, tz + 0.5)); bag.add('flame', lathe([[0.001, 0], [0.07, 0.04], [0.001, 0.26]], 6, null, tx + s * 2.6, 1.1, tz + 0.5)); } }
  { const [fx0, fz0, fx1, fz1] = [-80, -126, -26, -94], fence = (a, b, c, d) => { bag.add('wicker', box(a, 0, b, c, 1.3, d)); col.rect([a, b, c, d], 0, 1.3); bag.add('thatch', box(a - 0.05, 1.3, b - 0.07, c + 0.05, 1.44, d + 0.07)); };
    fence(fx0, fz0, fx1, fz0 + 0.18); fence(fx0, fz0, fx0 + 0.18, fz1 - 6); fence(fx1 - 0.18, fz0, fx1, fz1 - 6);
    for (let x = fx0; x <= fx1; x += 3) bag.add('timber', box(x - 0.07, 0, fz0 - 0.07, x + 0.07, 1.6, fz0 + 0.25));
    for (const x of [fx0 + 0.1, fx1 - 0.1]) for (let z = fz0; z <= fz1 - 6; z += 3) bag.add('timber', box(x - 0.1, 0, z - 0.07, x + 0.1, 1.6, z + 0.07)); }
  { const hv = (hz0 + hz1 - 0.3) / 2, top = y + wh + 0.25 + 2.8; bag.add('roof_ridge', box(hx0 - 0.6, top - 0.1, hv - 0.18, hx1 + 0.6, top + 0.16, hv + 0.18)); }
  bag.add('kokowai', box(hx0 - 0.02, y, hz0 - 0.02, hx1 + 0.02, y + 0.6, hz0)); for (const [a, b, c, d] of [[hx0 - 0.02, hz0, hx0, hz1 - 3], [hx1, hz0, hx1 + 0.02, hz1 - 3]]) bag.add('kokowai', box(a, y, b, c, y + 0.6, d));
  bag.add('earth_wall', box(hx0 - 0.04, y, hz0 - 0.04, hx1 + 0.04, y + 0.45, hz0 + 0.02)); for (let k = 0; k < 4; k++) bag.add('plaster_streak', box(hx0 + 0.8 + k * 1.6, y + wh - 0.9, hz0 - 0.03, hx0 + 0.95 + k * 1.6, y + wh, hz0 + 0.01));
  wheel(bag, qx0 - 1.2, 0.62, -94.8, 0.62, 'x', 14);
}

/** shang_archive: {} — the oracle-bone archive: a long low store of rammed earth under thatch, the shells and scapulae on shelves; before it the diviners' shed. */
export function shangArchive(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = ARCHIVE.rect, y = ARCHIVE.h, wh = 2.6, tw = 0.6, cx = (x0 + x1) / 2;
  { const r = [x0 - 0.6, z0 - 0.6, x1 + 0.6, z1 + 0.6];
    bag.add('earth_wall', frustum(r, 0, y, 0.25, 0.25, 0.25, 0, { noBottom: true }));
    col.rect([r[0], r[1], r[2], z1 - 0.3], 0, y); col.rect([r[0], z1 - 0.3, cx - 1.3, r[3]], 0, y); col.rect([cx + 1.3, z1 - 0.3, r[2], r[3]], 0, y);
    col.floor([r[0] + 0.25, r[1] + 0.25, r[2] - 0.25, r[3]], y); }
  // walls: the door in the south wall in the middle
  const W = (r, yy = y + wh) => { bag.add('earth_wall', box(r[0], y, r[1], r[2], yy, r[3])); col.rect(r, y, yy); };
  W([x0, z0, x1, z0 + tw]); W([x0, z0, x0 + tw, z1]); W([x1 - tw, z0, x1, z1]);
  W([x0, z1 - tw, cx - 1.3, z1]); W([cx + 1.3, z1 - tw, x1, z1]); bag.add('earth_wall', box(cx - 1.3, y + 2.2, z1 - tw, cx + 1.3, y + wh, z1));
  for (const s of [-1, 1]) bag.add('timber', box(cx + s * 1.3 - 0.1, y, z1 - tw - 0.05, cx + s * 1.3 + 0.1, y + 2.2, z1 + 0.05));
  bag.add('timber', box(cx - 1.4, y + 2.1, z1 - tw - 0.08, cx + 1.4, y + 2.3, z1 + 0.08));
  col.floor([x0 + tw, z0 + tw, x1 - tw, z1 - tw], y);
  thatch(bag, [x0, z0, x1, z1], y + wh, 2.6, 0.9, false);
  steps(bag, col, [cx - 1.3, z1 + 0.6, cx + 1.3, z1 + 2.4], 0, y, "n");
  bag.add('earth_wall', box(x0 + tw, y, z0 + tw, x1 - tw, y + 0.04, z1 - tw));
  // shelves along the back and the ends: rows of shells (plastrons) laid flat, each row a slab of bone-coloured stacks
  const shelf = (a, b, c, d, rows) => { for (let r = 0; r < rows; r++) { const yy = y + 0.2 + r * 0.55; bag.add('timber', box(a, yy, b, c, yy + 0.05, d)); col.rect([a, b, c, d], y, y + 0.3); }
    for (let r = 0; r < rows; r++) for (let x = a + 0.1; x < c - 0.35; x += 0.5) for (let z = b + 0.1; z < d - 0.3; z += 0.55) bag.add('ivory', box(x, y + 0.25 + r * 0.55, z, x + 0.32 + (x * 7 % 3) * 0.02, y + 0.25 + r * 0.55 + 0.18, z + 0.4)); };
  shelf(x0 + tw + 0.1, z0 + tw + 0.1, x1 - tw - 0.1, z0 + tw + 1.0, 4);
  shelf(x0 + tw + 0.1, z0 + tw + 1.3, x0 + tw + 1.0, z1 - tw - 3.5, 4);
  shelf(x1 - tw - 1.0, z0 + tw + 1.3, x1 - tw - 0.1, z1 - tw - 3.5, 4);
  for (const x of [cx - 4, cx + 4]) shelf(x - 1.6, z0 + 5.5, x + 1.6, z0 + 6.5, 3);
  bag.add('reed_mat', box(cx - 1.5, y + 0.04, z1 - tw - 3.0, cx + 1.5, y + 0.07, z1 - tw - 1.2));
  lights.push({ at: [cx, y + 2.2, z0 + 9], color: '#ffb468', intensity: 1.6, distance: 12 });
  // ── the diviners' shed ──
  const [sx0, sz0, sx1, sz1] = ARCHIVE.shed, sy = 0, sh = 2.7;
  for (let x = sx0 + 1; x < sx1; x += 4.6) for (const z of [sz0 + 1, sz1 - 1]) { bag.add('timber', lathe([[0.14, 0], [0.12, sh]], 8, null, x, sy, z)); col.circle(x, z, 0.18, 0, sh); }
  bag.add('timber', box(sx0, sh, sz0 + 0.8, sx1, sh + 0.2, sz0 + 1.2)); bag.add('timber', box(sx0, sh, sz1 - 1.2, sx1, sh + 0.2, sz1 - 0.8));
  thatch(bag, [sx0, sz0, sx1, sz1], sh + 0.2, 2.3, 0.9, false);
  bag.add('earth_wall', box(sx0 + 0.5, 0, sz0 + 0.3, sx1 - 0.5, 0.05, sz1 - 0.3));
  // benches with plastrons being sawn, scraped and drilled; the brazier and the bronze drill; heaps of raw shells and scapulae
  for (let i = 0; i < 3; i++) {
    const x = sx0 + 1.5 + i * 9, z = sz0 + 3;
    bag.add('timber', box(x, 0.65, z, x + 2.8, 0.72, z + 1.0)); for (const dx of [0.1, 2.6]) for (const dz of [0.1, 0.8]) bag.add('timber', box(x + dx, 0, z + dz, x + dx + 0.1, 0.65, z + dz + 0.1)); col.rect([x, z, x + 2.8, z + 1], 0, 0.72);
    for (let k = 0; k < 4; k++) bag.add('ivory', box(x + 0.2 + k * 0.6, 0.72, z + 0.2, x + 0.7 + k * 0.6, 0.76 + (k % 2) * 0.02, z + 0.8));
    bag.add('bronze', rod([x + 2.5, 0.76, z + 0.5], [x + 2.2, 1.0, z + 0.5], 0.015, 5));
    bag.add('reed_mat', box(x - 0.2, 0.01, z + 1.4, x + 3.2, 0.04, z + 3.4));
  }
  { const bx = sx0 + 6, bz = sz1 - 3.4; bag.add('bronze', lathe([[0.001, 0.3], [0.3, 0.34], [0.34, 0.5], [0.001, 0.5]], 10, null, bx, 0, bz)); bag.add('flame', lathe([[0.001, 0], [0.1, 0.05], [0.001, 0.3]], 6, null, bx, 0.5, bz)); col.circle(bx, bz, 0.34, 0, 0.55);
    lights.push({ at: [bx, 1.1, bz], color: '#ffb468', intensity: 1.2, distance: 8 }); }
  for (let k = 0; k < 14; k++) { const a = k * 2.399, rr = 0.2 + (k % 5) * 0.2; bag.add('hide_grey', frustum([sx1 - 5 + Math.cos(a) * rr - 0.3, sz1 - 3.4 + Math.sin(a) * rr - 0.25, sx1 - 5 + Math.cos(a) * rr + 0.3, sz1 - 3.4 + Math.sin(a) * rr + 0.25], 0.1 * (k % 4), 0.1 * (k % 4) + 0.1, 0.05, 0.05, 0.05, 0.05)); }
  for (const x of [sx1 - 8.5, sx1 - 7.8]) bag.add('pottery_dark', lathe([[0.001, 0], [0.2, 0.02], [0.28, 0.3], [0.2, 0.5], [0.001, 0.5]], 8, null, x, 0, sz1 - 2));
  // ── the archive dressed (docs §2b): racks of fresh plastrons drying, a trough of water for soaking shells, heaps of sawn waste, baskets of scapulae;
  // inside, a reading table with its lamp, tally bundles on the shelves, a ladder to the loft; the foot of the walls splashed, the walls streaked ──
  { const rk = (x, z, n) => { for (const s of [0, n * 0.5]) { bag.add('timber', box(x + s - 0.05, 0, z - 0.2, x + s + 0.05, 1.5, z - 0.1)); bag.add('timber', box(x + s - 0.05, 0, z + 0.1, x + s + 0.05, 1.5, z + 0.2)); } bag.add('timber', box(x, 1.45, z - 0.05, x + n * 0.5, 1.52, z + 0.05)); for (let k = 0; k < n; k++) bag.add('ivory', box(x + 0.1 + k * 0.5 - 0.0, 0.7, z - 0.04, x + 0.4 + k * 0.5, 1.45, z + 0.04)); };
    rk(x0 - 6, z1 + 5, 5); rk(x1 + 3.5, z1 + 5, 5); rk(x0 - 6, z1 + 9, 4);
    const tx = x1 + 4, tz = z1 + 10; for (const [a, b, c, d] of [[-0.9, -0.4, 0.9, -0.33], [-0.9, 0.33, 0.9, 0.4], [-0.9, -0.4, -0.83, 0.4], [0.83, -0.4, 0.9, 0.4]]) bag.add('planks_grey', box(tx + a, 0, tz + b, tx + c, 0.5, tz + d)); bag.add('planks_grey', box(tx - 0.9, 0, tz - 0.4, tx + 0.9, 0.08, tz + 0.4)); bag.add('water', box(tx - 0.82, 0.36, tz - 0.32, tx + 0.82, 0.38, tz + 0.32)); col.rect([tx - 0.9, tz - 0.4, tx + 0.9, tz + 0.4], 0, 0.5);
    for (const [hx, hz] of [[x0 - 3, z1 + 1.5], [x1 + 2, z1 + 2]]) bag.add('hide_grey', frustum([hx - 1, hz - 0.8, hx + 1, hz + 0.8], 0, 0.5, 0.3, 0.3, 0.3, 0.3, { noBottom: true }));
    for (const [bx, bz] of [[x1 + 1.5, z1 + 6], [x0 - 2, z1 + 6.5]]) { bag.add('wicker', lathe([[0.3, 0], [0.36, 0.4], [0.32, 0.42], [0.001, 0.42]], 8, null, bx, 0, bz)); bag.add('ivory', lathe([[0.3, 0.38], [0.18, 0.5], [0.001, 0.52]], 8, null, bx, 0, bz)); }
    bag.add('earth_wall', box(x0 - 0.62, 0, z1 - 0.02, x1 + 0.62, 0.45, z1 + 0.62)); for (let k = 0; k < 6; k++) bag.add('plaster_streak', box(x0 + 1.5 + k * 4.4, y + wh - 0.8, z1 + 0.0, x0 + 1.7 + k * 4.4, y + wh, z1 + 0.04));
    bag.add('roof_ridge', box(x0 - 1.3, y + wh + 2.6 - 0.1, (z0 + z1) / 2 - 0.17, x1 + 1.3, y + wh + 2.6 + 0.16, (z0 + z1) / 2 + 0.17));
    // inside
    const ix = cx + 7, iz = z0 + 12; bag.add('timber', box(ix - 1.5, 0.62 + y, iz, ix + 1.5, 0.7 + y, iz + 1.0)); for (const dx of [0.1, 2.8]) bag.add('timber', box(ix - 1.5 + dx, y, iz + 0.4, ix - 1.4 + dx, y + 0.62, iz + 0.5)); col.rect([ix - 1.5, iz, ix + 1.5, iz + 1.0], y, y + 0.7);
    for (let k = 0; k < 4; k++) bag.add('ivory', box(ix - 1.2 + k * 0.7, y + 0.7, iz + 0.2, ix - 0.8 + k * 0.7, y + 0.74, iz + 0.8)); bag.add('bronze', lathe([[0.001, 0], [0.12, 0.02], [0.04, 0.2], [0.001, 0.26]], 8, null, ix + 1.1, y + 0.7, iz + 0.5)); bag.add('flame', lathe([[0.001, 0], [0.05, 0.03], [0.001, 0.18]], 6, null, ix + 1.1, y + 0.96, iz + 0.5));
    bag.add('reed_mat', box(ix - 2, y + 0.04, iz + 1.3, ix + 2, y + 0.07, iz + 2.9));
    for (let k = 0; k < 8; k++) bag.add('hide_tan', box(x0 + tw + 1.3 + k * 0.12, y + 0.8, z0 + tw + 1.0 - 0.02, x0 + tw + 1.38 + k * 0.12, y + 1.3, z0 + tw + 0.99));
    for (const s of [0, 0.5]) bag.add('timber', box(x1 - tw - 0.4 - s * 0 + 0.0 - 0.06, y, z0 + 5.6 + 0.0 - 0.0 + s * 0, x1 - tw - 0.34, y + 2.4, z0 + 5.66)); for (let k = 0; k < 8; k++) bag.add('timber', box(x1 - tw - 0.4, y + 0.3 + k * 0.28, z0 + 5.6, x1 - tw - 0.1, y + 0.34 + k * 0.28, z0 + 5.66)); }
  void ball; void quad; void fromTriangles;
}

/** shang_river: { pts } — the Huan: a ribbon of water along the polyline. */
export function shangRiver(el, { bag }) {
  const T = [], hw = RIVER.half - 1.2, y = RIVER.water;
  const P = el.pts, only = el.seg;   // seg: build just segment `only` (plans split along the river keep their bounds inside the disc)
  for (let i = 0; i < P.length - 1; i++) {
    if (only !== undefined && i !== only) continue;
    const a = P[i], b = P[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), nx = -dz / L * hw, nz = dx / L * hw;
    const n = Math.max(1, Math.round(L / 40));
    for (let k = 0; k < n; k++) {
      const t0 = k / n, t1 = (k + 1) / n, x0 = a[0] + dx * t0, z0 = a[1] + dz * t0, x1 = a[0] + dx * t1, z1 = a[1] + dz * t1;
      // a little overlap at the joints
      quad(T, [x0 - nx, y, z0 - nz], [x0 + nx, y, z0 + nz], [x1 + nx, y, z1 + nz], [x1 - nx, y, z1 - nz]);
    }
    if (i < P.length - 2) { const c = P[i + 1]; T.push(c[0], y, c[1], c[0] + hw, y, c[1], c[0], y, c[1] + hw, c[0], y, c[1], c[0], y, c[1] + hw, c[0] - hw, y, c[1], c[0], y, c[1], c[0] - hw, y, c[1], c[0], y, c[1] - hw, c[0], y, c[1], c[0], y, c[1] - hw, c[0] + hw, y, c[1]); }
  }
  bag.add('water', fromTriangles(T));
}

/** shang_bridge: { a, b } — a plank bridge on pairs of piles over the river, rails of poles. */
export function shangBridge(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, w = 2.6, y = 0.55;
  const P = (s, o) => [ax + ux * s - uz * o, az + uz * s + ux * o];
  const a0 = P(0, -w / 2), a1 = P(L, w / 2), r = [Math.min(a0[0], a1[0]), Math.min(a0[1], a1[1]), Math.max(a0[0], a1[0]), Math.max(a0[1], a1[1])];
  bag.add('planks_grey', box(r[0], y - 0.12, r[1], r[2], y, r[3])); col.floor(r, y);
  for (let s = 1; s < L; s += 5) for (const o of [-1, 1]) { const p = P(s, o * (w / 2 - 0.2)); bag.add('log_pine', lathe([[0.16, RIVER.bed - 0.3], [0.16, y + 0.5]], 7, null, p[0], 0, p[1])); }
  for (const o of [-1, 1]) { const p = P(0, o * (w / 2 - 0.1)), q = P(L, o * (w / 2 - 0.1)); bag.add('timber', rod([p[0], y + 0.9, p[1]], [q[0], y + 0.9, q[1]], 0.05, 5)); col.segment(p, q, 0.12, y, y + 1.0); }
  steps(bag, col, ux ? [r[0] - 1.5, r[1], r[0], r[3]] : [r[0], r[1] - 1.5, r[2], r[1]], 0, y, ux ? 'e' : 's');
  steps(bag, col, ux ? [r[2], r[1], r[2] + 1.5, r[3]] : [r[0], r[3], r[2], r[3] + 1.5], 0, y, ux ? 'w' : 'n');
}
