// The Törten estate and its Konsum (docs/settlements/bauhaus-dessau.md §4, §11): rows of two-storey flat-roofed houses of slag-concrete blocks
// with their ground floors furnished, a front garden behind a low fence, a kitchen garden behind (beds, bean poles, a shed with its hens, the
// washing line), and Gropius's Konsum building of 1928 — a low shop with its café and the five-storey tower of flats.
import { Fr } from './frame.js';
import { S, rng } from './kit.js';
import { fitShop, pend, tbl, chr, stove, sack, rug } from './tenement.js';

const Y = 0.15, H0 = 2.75, YC = Y + H0, YB = YC + 0.3, TOP = YB + 2.9;
const DOORS = ['car_blue', 'car_red', 'paint_cab_yellow', 'car_cream', 'paint_ferry_green', 'car_blue'];

function rowHouse(F, i, r, fit) {
  const W = F.W, D = F.D, T = 0.3, du = W - 1.5, dm = DOORS[Math.floor(r() * DOORS.length)];
  F.b('concrete_light', -0.02, W + 0.02, 0, Y, -0.05, D + 0.05);
  const wm = 'plaster_white';
  F.wall({ u0: 0, u1: W, v: 0, th: T, y0: Y, y1: YC, mat: wm, ops: [{ u0: du - 0.5, u1: du + 0.5, y1: Y + 2.2 }, { u0: 0.5, u1: du - 0.9, y0: Y + 0.85, y1: Y + 2.15, glass: 'glass_outer', frame: 'steel_grey' }] });
  F.s(wm, 0, T, Y, YC, T, D); F.s(wm, W - T, W, Y, YC, T, D);
  F.wall({ u0: T, u1: W - T, v: D - T, th: T, y0: Y, y1: YC, mat: wm, ops: [{ u0: 0.6, u1: 1.7, y0: Y + 1.0, y1: Y + 2.1, glass: 'glass_outer', frame: 'steel_grey' }, { u0: W - 1.7, u1: W - 0.7, y1: Y + 2.1 }] });
  F.b('wood_ochre', T, W - T, Y - 0.02, Y + 0.012, T, D - T); F.floor(T, W - T, T, D - T, Y);
  F.wall({ u0: 0, u1: W, v: 0, th: T, y0: YC, y1: TOP, mat: wm, ops: [{ u0: 0.4, u1: W - 0.4, y0: YB + 0.75, y1: YB + 1.95, glass: 'glass_outer', frame: 'steel_grey' }], solid: false });
  F.b(wm, 0, W, YC, TOP, T, D); F.k(0, W, YC - 0.1, TOP, 0, D);
  F.b('plaster_white', T, W - T, YC - 0.04, YC, T, D - T);
  F.b('wood_dark', 0.4, W - 0.4, YB + 0.75, YB + 1.95, T, T + 0.04);
  F.b('cloth_white', 0.4, 0.4 + 0.5, YB + 0.9, YB + 1.9, 0.2, 0.23); F.b('cloth_white', W - 0.9, W - 0.4, YB + 0.9, YB + 1.9, 0.2, 0.23);
  // the partition, the furniture: a front room (table, chairs, a built-in cupboard, a stove) and the kitchen behind
  const pv = 4.6;
  F.wall({ u0: T, u1: W - T, v: pv, th: 0.15, y0: Y, y1: YC, mat: wm, ops: [{ u0: 0.7, u1: 1.6, y1: Y + 2.1 }] });
  rug(F, 0.6, W - 0.6, 0.8, pv - 0.6, Y, ['cloth_red', 'cloth_indigo', 'cloth_green'][i % 3]);
  tbl(F, 1.0, 2.2, 1.8, 2.7, Y, 0.76, 'wood_painted'); for (const [u, v, d] of [[0.7, 2.0, 'u+'], [0.7, 2.5, 'u+'], [2.5, 2.2, 'u-'], [1.6, 3.1, 'v-']]) chr(F, u, v, d, Y);
  F.s('wood_painted', W - 1.4, W - 0.35, Y, Y + 2.1, 1.0, 3.0); stove(F, W - 0.8, pv - 0.7, Y);
  F.s('glaze_white', T, 0.9, Y, Y + 0.9, D - 1.3, D - T); F.b('steel_chrome', 0.5, 0.7, Y + 0.9, Y + 1.1, D - 1.1, D - 0.9);
  F.s('iron', 1.2, 2.2, Y, Y + 0.85, D - 0.9, D - T); F.rod('iron', 1.7, Y + 0.85, D - 0.6, 1.7, YC, D - 0.6, 0.06, 6);
  tbl(F, 2.5, 3.6, D - 2.4, D - 1.6, Y, 0.78, 'paint_white'); chr(F, 3.0, D - 2.8, 'v-', Y); chr(F, 4.0, D - 2.0, 'u+', Y);
  F.b('wood_painted', T, 0.42, Y + 0.9, Y + 1.0, D - 3.4, D - 1.3); F.b('car_cream', T, 0.42, Y + 1.0, Y + 2.0, D - 3.4, D - 1.3);
  if (fit) pend(F, 1.8, YC, 2.4, i % 4 === 0); pend(F, 2.2, YC, D - 2.2, false);
  // the front: a door in its colour, a cantilevered canopy, the plinth, rain streaks and damp, a downpipe
  F.b(dm, du - 0.5, du + 0.5, Y, Y + 2.2, 0.0, 0.1); F.b('concrete_light', du - 0.9, du + 0.9, Y + 2.4, Y + 2.5, -1.0, 0); F.k(du - 0.9, du + 0.9, Y + 2.4, Y + 2.5, -1.0, 0);
  F.b('concrete_light', du - 0.9, du + 0.9, 0, 0.1, -0.9, -0.05); F.b('paint_white', du + 0.55, du + 0.7, Y + 1.5, Y + 1.65, -0.05, 0);
  F.b('plaster_damp', 0.05, W - 0.05, Y, Y + 0.35, -0.03, 0.01); F.b('plaster_streak', 0.5, du - 0.9, Y + 0.45, Y + 0.83, -0.03, 0.01); F.b('plaster_streak', 0.45, W - 0.45, YB + 0.0, YB + 0.73, -0.03, 0.01);
  F.b('iron_galv', W - 0.12, W - 0.04, 0.2, TOP, -0.1, -0.03);
  F.b('concrete_light', -0.03, W + 0.03, TOP, TOP + 0.1, -0.03, D + 0.03); F.b('plaster_white', 0, W, TOP + 0.1, TOP + 0.35, 0, 0.15); F.b('plaster_white', 0, W, TOP + 0.1, TOP + 0.35, D - 0.15, D); F.b('asphalt', 0.0, W, TOP + 0.1, TOP + 0.12, 0.15, D - 0.15);
  F.b('steel_grey', 0.5, 0.56, YB + 0.0, YB + 0.75, -0.02, 0);                              // the cellar-light grating
  // the front garden: a fence, a gate, a path, a hedge and a rose; the kitchen garden behind: beds, bean poles, a shed with hens, the washing, a barrel
  for (let u = 0; u <= W; u += 0.9) F.b('timber', u, u + 0.05, 0, 0.95, -2.7, -2.65);
  F.b('timber', 0, W, 0.55, 0.6, -2.7, -2.65); F.b('timber', 0, W, 0.85, 0.9, -2.7, -2.65);
  for (let v = -2.6; v < -0.1; v += 0.55) F.b('flagstone', du - 0.4, du + 0.4, 0, 0.03, v, v + 0.5);
  F.b('cloth_green', 0.1, du - 0.7, 0, 0.6, -2.3, -1.8); F.b('car_red', 0.3, 0.5, 0.6, 0.75, -2.2, -2.0);
  const G0 = D + 0.2;
  for (let b = 0; b < 4; b++) { F.b('soil', 0.5 + b * 1.1, 1.2 + b * 1.1, 0, 0.12, G0 + 0.5, G0 + 4.6); if (b % 2 === 0) for (let k = 0; k < 3; k++) { F.rod('timber', 0.85 + b * 1.1 + k * 0.1, 0.1, G0 + 2 + k * 0.5, 0.95 + b * 1.1 + k * 0.1, 1.9, G0 + 2 + k * 0.5, 0.012); F.b('cloth_green', 0.8 + b * 1.1 + k * 0.1, 0.9 + b * 1.1 + k * 0.1, 0.9, 1.8, G0 + 1.95 + k * 0.5, G0 + 2.05 + k * 0.5); } else for (let k = 0; k < 5; k++) F.b(['cloth_green', 'car_red', 'cloth_ochre'][k % 3], 0.6 + b * 1.1 + k * 0.1, 0.7 + b * 1.1 + k * 0.1, 0.12, 0.35, G0 + 1 + k * 0.7, G0 + 1.3 + k * 0.7); }
  if (i % 2 === 0) {
    F.s('timber', W - 1.8, W - 0.4, 0, 1.9, G0 + 5.2, G0 + 6.4); F.b('tar_wood', W - 1.9, W - 0.3, 1.9, 2.0, G0 + 5.1, G0 + 6.5); F.b('iron', W - 1.5, W - 1.4, 0.2, 1.6, G0 + 5.19, G0 + 5.2);
    F.b('timber', W - 1.8, W - 0.4, 0, 0.8, G0 + 3.9, G0 + 4.9); for (let u = W - 1.8; u < W - 0.4; u += 0.14) F.b('iron_galv', u, u + 0.01, 0.0, 0.8, G0 + 3.9, G0 + 3.91);    // the hens' run
  } else {
    F.rod('iron', 0.4, 0.0, G0 + 6.2, 0.4, 2.0, G0 + 6.2, 0.02); F.rod('iron', W - 0.4, 0.0, G0 + 6.2, W - 0.4, 2.0, G0 + 6.2, 0.02); F.rod('cloth_grey', 0.4, 1.9, G0 + 6.2, W - 0.4, 1.9, G0 + 6.2, 0.006, 3);
    for (let k = 0; k < 5; k++) F.b(['cloth_white', 'cloth_blue', 'cloth_white', 'cloth_red', 'cloth_ochre'][k], 0.7 + k * 0.7, 1.1 + k * 0.7, 1.15, 1.9, G0 + 6.15, G0 + 6.25);
  }
  F.lathe('wood_painted', [[0.25, 0], [0.3, 0.4], [0.28, 0.85], [0.001, 0.85]], 0.7, 0, G0 + 0.2, 8);
  F.b('timber', 0, 0.05, 0, 1.0, G0 + 0.0, G0 + 7.0); F.b('wood_ochre', W - 0.05, W, 0, 1.0, G0, G0 + 7.0);              // the fences between the plots
}

/** torten_row: { rect (the row), n, front ('s' | 'n'), seed }. */
export function tortenRow(el, ctx) {
  const sk = new S(ctx), [x0, z0, x1, z1] = el.rect, pw = (x1 - x0) / el.n, r = rng(el.seed || 1);
  for (let i = 0; i < el.n; i++) rowHouse(new Fr(sk, [x0 + i * pw, z0, x0 + (i + 1) * pw, z1], el.front || 's', i % 2 === 1), i, r, i % 3 === 0);
}

/** konsum: { rect } — the cooperative shop with its café (low block, front on the south) and the five-storey tower of flats at its east end. */
export function konsum(el, ctx) {
  const sk = new S(ctx), [x0, z0, x1, z1] = el.rect, tw = 6.5, r = rng(el.seed || 9), lowR = [x0, z0, x1 - tw, z1];
  const F = new Fr(sk, lowR, 's', false), W = F.W, D = F.D, y = 0.15, h = 4.2, T = 0.3;
  F.b('concrete_light', -0.05, W + 0.05, 0, y, -0.05, D + 0.05);
  F.wall({ u0: 0, u1: W, v: 0, th: T, y0: y, y1: h, mat: 'plaster_white', ops: [{ u0: 0.5, u1: 5.2, y0: y + 0.5, y1: h - 0.9, glass: 'glass_outer', frame: 'steel_grey' }, { u0: 5.2, u1: 6.4, y1: y + 2.5 }, { u0: 6.9, u1: W - 0.5, y0: y + 0.6, y1: y + 2.6, glass: 'glass_outer', frame: 'steel_grey' }] });
  F.s('plaster_white', 0, T, y, h, T, D); F.s('plaster_white', W - T, W, y, h, T, D);
  F.wall({ u0: T, u1: W - T, v: D - T, th: T, y0: y, y1: h, mat: 'plaster_white', ops: [{ u0: 1, u1: 2.5, y0: y + 1.2, y1: y + 2.5, glass: 'glass_outer', frame: 'steel_grey' }, { u0: W - 3, u1: W - 2, y1: y + 2.2 }] });
  F.b('wood_ochre', T, W - T, y - 0.02, y + 0.012, T, D - T); F.floor(T, W - T, T, D - T, y);
  F.b('plaster_white', T, W - T, h - 0.04, h, T, D - T); F.b('concrete_light', -0.05, W + 0.05, h, h + 0.12, -0.05, D + 0.05); F.b('plaster_white', 0, W, h + 0.12, h + 0.6, 0, 0.2); F.b('asphalt', 0, W, h + 0.12, h + 0.15, 0.2, D);
  F.k(0, W, h - 0.1, h + 0.2, 0, D);
  // the shop (left) with its counter and shelves; the café (right) with tables
  const pv = D - 3.6;
  F.wall({ u0: T, u1: W - T, v: pv, th: 0.2, y0: y, y1: h, mat: 'plaster_white', ops: [{ u0: W - 1.9, u1: W - 0.9, y1: y + 2.2 }] });
  fitShop(F, 'grocer', y, h, 0.3, pv, r);
  F.b('car_red', 0.3, 5.2, h - 1.0, h - 0.15, -0.1, 0); for (let u = 0.8, k = 0; u < 4.6 && k < 20; k++) { F.b('car_cream', u, u + 0.12 + r() * 0.1, h - 0.85, h - 0.35, -0.12, -0.1); u += 0.28; }
  for (let i = 0; i < 3; i++) { const u = 1.8 + i * 2.6, v = pv + 1.9; tbl(F, u - 0.5, u + 0.5, v - 0.5, v + 0.5, y, 0.74, 'wood_painted'); chr(F, u - 0.8, v, 'u+', y); chr(F, u + 0.8, v, 'u-', y); chr(F, u, v + 0.8, 'v-', y); }
  sack(F, 2.0, D - 1.0, y, 'cloth_white'); sack(F, 2.5, D - 1.0, y); pend(F, 3.0, h, 2.0); pend(F, 9.0, h, 3.0, false);
  F.b('cloth_green', 6.9, W - 0.5, h - 1.55, h - 1.4, -1.4, -0.1);          // the café's awning
  // the tower: five storeys of rendered brickwork, a window strip and balcony on each, a roof terrace with its rail
  const Tw = new Fr(sk, [x1 - tw, z0, x1, z1 - 3], 's', false), TW = Tw.W, TD = Tw.D, th = 5 * 3.0 + 0.3;
  Tw.s('plaster_white', 0, TW, 0, th, 0, TD); Tw.b('concrete_light', -0.04, TW + 0.04, th, th + 0.1, -0.04, TD + 0.04);
  for (let s = 0; s < 5; s++) {
    const yy = 0.3 + s * 3.0;
    Tw.pane('glass_outer', 0.6, TW - 2.0, yy + 0.9, yy + 2.3, -0.02, 1); Tw.b('steel_grey', 0.6, TW - 2.0, yy + 0.9, yy + 0.96, -0.05, 0); Tw.b('steel_grey', 0.6, TW - 2.0, yy + 2.3, yy + 2.36, -0.05, 0); for (let u = 0.6; u <= TW - 1.99; u += 1.1) Tw.b('steel_grey', u, u + 0.05, yy + 0.9, yy + 2.36, -0.05, 0);
    Tw.b('concrete_light', TW - 1.9, TW + 0.5, yy - 0.2, yy, -1.2, 0); Tw.b('steel_grey', TW - 1.9, TW + 0.5, yy, yy + 1.0, -1.2, -1.15); Tw.b('car_cream', TW - 1.9, TW + 0.5, yy + 0.3, yy + 0.85, -1.19, -1.16);
    Tw.pane('glass_outer', TW - 1.5, TW - 0.5, yy + 0.2, yy + 2.3, -0.02, 1);
  }
  Tw.b('steel_grey', 0, TW, th + 0.1, th + 1.0, TD - 0.05, TD); Tw.b('steel_grey', 0, 0.05, th + 0.1, th + 1.0, 0, TD); Tw.b('steel_grey', TW - 0.05, TW, th + 0.1, th + 1.0, 0, TD); Tw.b('steel_grey', 0, TW, th + 0.1, th + 1.0, 0, 0.05);
  Tw.b('plaster_damp', 0.05, TW - 0.05, 0.15, 0.7, -0.03, 0.01); Tw.b('plaster_streak', 1.0, TW - 2.0, th - 1.5, th - 0.1, -0.03, 0.01);
  Tw.b('wood_painted', 0.4, 1.5, th + 0.1, th + 0.14, 0.6, 1.6);
}
