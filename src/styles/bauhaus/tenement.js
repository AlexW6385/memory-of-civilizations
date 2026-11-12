// The tenements of Dessau about 1927 (docs/settlements/bauhaus-dessau.md §4, §11): rendered and brick-faced houses of 1870–1914 in four manners, a
// few houses of the new building, every ground floor an enterable shop, pub or flat with its furniture, every front dressed at eye level
// (signs, awnings, goods, stoops, window boxes, curtains, downpipes, number plates) and weathered (streaks under the sills, damp at the foot, bare brick
// where the render has fallen). Local frame: see frame.js.
import { Fr, hip } from './frame.js';
import { S, rng } from './kit.js';

const WALLS = ['stucco_pale', 'stucco_cream', 'stucco_warm', 'facade_buff', 'stucco_ochre', 'plaster_grey'];
const SHUT = ['shutter_green', 'shutter_brown', 'shutter_grey'];
const SIGN = ['car_black', 'cloth_green', 'car_blue', 'cloth_maroon', 'paint_ochre', 'paint_blue'];
const AWN = [['cloth_red', 'cloth_white'], ['cloth_green', 'cloth_white'], ['cloth_ochre', 'cloth_white'], ['car_blue', 'cloth_white'], ['cloth_maroon', 'cloth_ochre']];
const FL = 0.12;           // the ground floor's level (a step above the pavement)
export const SHOPS = ['grocer', 'baker', 'butcher', 'tobacco', 'hardware', 'draper', 'pub', 'grocer', 'baker', 'draper'];

/** The geometry that both the builder and the smoke need of a lot: levels, manner, chimneys (world positions). */
export function houseSpec(l) {
  const r = rng(l.seed || 1), modern = !!l.modern, n = l.storeys, H0 = l.shop ? 4.0 : modern ? 3.2 : 3.5, SH = modern ? 3.0 : 3.2;
  const yc = FL + H0, yb = yc + 0.3, top = yb + (n - 1) * SH;
  const manner = modern ? 'modern' : ['gruender', 'gruender', 'plain', 'brick', 'reform'][Math.floor(r() * 5)];
  const [x0, z0, x1, z1] = l.rect, w = x1 - x0, d = z1 - z0, alongZ = d >= w, m = Math.min(w, d) / 2 - 0.1;
  const rise = l.roof === 'mansard' ? 0.75 : 0.6, ridgeY = top + 0.05 + (m + 0.35) * rise;
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, hl = Math.max(0, Math.abs(d - w) / 2 - 0.6);
  const ch = (k) => (alongZ ? [cx, cz + k * hl] : [cx + k * hl, cz]);
  const chimneys = modern || l.roof === 'flat' ? [] : [ch(-0.7), ch(0.7)].map(([x, z]) => ({ x, z, y: ridgeY + 0.9 }));
  return { n, H0, SH, yc, yb, top, manner, ridgeY, chimneys, modern };
}

// ── interiors ───────────────────────────────────────────────────────────────────────────────────
/** A chair at (u, v) turned to face dir ('v+' | 'v-' | 'u+' | 'u-'). */
export function chr(F, u, v, dir, y = FL, m = 'wood_painted') {
  F.b(m, u - 0.2, u + 0.2, y + 0.43, y + 0.47, v - 0.2, v + 0.2);
  for (const [a, b] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) F.b('timber', u + a - 0.015, u + a + 0.015, y, y + 0.43, v + b - 0.015, v + b + 0.015);
  const s = dir === 'v+' ? [-0.2, 0.2, -0.22, -0.18] : dir === 'v-' ? [-0.2, 0.2, 0.18, 0.22] : dir === 'u+' ? [-0.22, -0.18, -0.2, 0.2] : [0.18, 0.22, -0.2, 0.2];
  F.b(m, u + s[0], u + s[1], y + 0.47, y + 0.9, v + s[2], v + s[3]);
}
export const tbl = (F, u0, u1, v0, v1, y = FL, h = 0.76, top = 'wood_ochre') => {
  F.b(top, u0, u1, y + h - 0.04, y + h, v0, v1);
  for (const [a, b] of [[u0 + 0.06, v0 + 0.06], [u1 - 0.06, v0 + 0.06], [u0 + 0.06, v1 - 0.06], [u1 - 0.06, v1 - 0.06]]) F.b('timber', a - 0.03, a + 0.03, y, y + h - 0.04, b - 0.03, b + 0.03);
  F.k(u0, u1, y, y + h, v0, v1);
};
/** Rows of small coloured goods on a run of shelves against a wall at depth v (facing +v... the shelves stand from v to v+dep). */
function shelves(F, u0, u1, v, dep, y, h, rows, cols, r) {
  F.s('wood_painted', u0, u1, y, y + h, v, v + dep * 0.35);
  for (let i = 0; i < rows; i++) {
    const yy = y + 0.35 + i * ((h - 0.5) / rows);
    F.b('timber', u0, u1, yy, yy + 0.03, v, v + dep);
    for (let u = u0 + 0.15; u < u1 - 0.3; u += 0.22 + r() * 0.2) F.b(cols[Math.floor(r() * cols.length)], u, u + 0.13 + r() * 0.1, yy + 0.03, yy + 0.03 + 0.1 + r() * 0.14, v + dep * 0.4, v + dep * 0.9);
  }
}
export const sack = (F, u, v, y, c = 'cloth_brown') => { F.b(c, u - 0.2, u + 0.2, y, y + 0.55, v - 0.14, v + 0.14); F.b('cloth_white', u - 0.12, u + 0.12, y + 0.55, y + 0.6, v - 0.1, v + 0.1); F.k(u - 0.2, u + 0.2, y, y + 0.55, v - 0.14, v + 0.14); };
const crate = (F, u, v, y, c) => { F.b('wood_ochre', u - 0.3, u + 0.3, y, y + 0.28, v - 0.22, v + 0.22); F.b(c, u - 0.27, u + 0.27, y + 0.28, y + 0.36, v - 0.19, v + 0.19); F.k(u - 0.3, u + 0.3, y, y + 0.36, v - 0.22, v + 0.22); };
const barrel = (F, u, v, y, r = 0.3, h = 0.85) => { F.lathe('wood_painted', [[r * 0.8, 0], [r, h * 0.3], [r, h * 0.7], [r * 0.8, h], [0.001, h]], u, y, v, 10); F.b('iron', u - r * 0.98, u + r * 0.98, y + h * 0.2, y + h * 0.24, v - r * 0.98, v + r * 0.98); F.k(u - r, u + r, y, y + h, v - r, v + r); };
function counter(F, u0, u1, v0, v1, y, top = 'wood_ochre', body = 'wood_painted') { F.s(body, u0, u1, y, y + 0.95, v0, v1); F.b(top, u0 - 0.04, u1 + 0.04, y + 0.95, y + 1.0, v0 - 0.06, v1 + 0.06); }
function scales(F, u, v, y) { F.b('iron', u - 0.12, u + 0.12, y, y + 0.05, v - 0.1, v + 0.1); F.b('iron', u - 0.02, u + 0.02, y + 0.05, y + 0.45, v - 0.02, v + 0.02); F.b('steel_chrome', u - 0.2, u + 0.2, y + 0.45, y + 0.48, v - 0.02, v + 0.02); for (const s of [-1, 1]) F.b('steel_chrome', u + s * 0.2 - 0.1, u + s * 0.2 + 0.1, y + 0.3, y + 0.32, v - 0.1, v + 0.1); }
export function stove(F, u, v, y, big = false) {
  F.s('tile_white', u - 0.4, u + 0.4, y, y + (big ? 1.9 : 1.5), v - 0.4, v + 0.4); F.b('iron', u - 0.42, u + 0.42, y + (big ? 1.9 : 1.5), y + (big ? 1.96 : 1.56), v - 0.42, v + 0.42);
  F.b('iron', u - 0.12, u + 0.12, y + 0.25, y + 0.55, v + 0.4, v + 0.43); F.rod('iron', u, y + 1.6, v, u, y + 3.2, v, 0.07, 6);
}
export function pend(F, u, yc, v, light = true) { F.rod('iron', u, yc, v, u, yc - 0.7, v, 0.01); F.lathe('lamp_white', [[0.001, 0], [0.12, 0.08], [0.17, 0.22], [0.12, 0.36], [0.001, 0.4]], u, yc - 1.05, v, 10); if (light) F.light(u, yc - 0.8, v, '#ffe6b8', 2.0, 8); }
export const rug = (F, u0, u1, v0, v1, y, c) => { F.b(c, u0, u1, y + 0.012, y + 0.02, v0, v1); F.b('cloth_white', u0 + 0.12, u1 - 0.12, y + 0.02, y + 0.024, v0 + 0.12, v1 - 0.12); };

export function fitShop(F, kind, y, yc, v0, pv, r) {
  const W = F.W, cu0 = 1.0, cu1 = W - 3.0, cv = pv - 1.7;
  const wallTile = kind === 'butcher' ? 'tile_white' : kind === 'baker' ? 'tile_cream' : null;
  if (wallTile) { F.b(wallTile, 0.3, W - 0.3, y, y + 1.6, 0.36, 0.4); F.b(wallTile, 0.3, 0.34, y, y + 1.6, 0.4, pv - 0.1); F.b(wallTile, W - 0.34, W - 0.3, y, y + 1.6, 0.4, pv - 0.1); }
  if (kind === 'pub') {
    // the bar along the partition, the barrel tap, tables and chairs, a tiled stove
    counter(F, 1.0, W - 3.2, pv - 1.2, pv - 0.5, y, 'wood_dark', 'wood_painted');
    F.b('timber', 1.0, W - 3.2, y + 1.0, y + 2.4, pv - 0.28, pv - 0.1); shelves(F, 1.0, W - 3.2, pv - 0.5, 0.35, y, 2.4, 3, ['glaze_green', 'glass_lamp', 'wood_ochre', 'cloth_brown'], r);
    for (const u of [2.2, 3.6, 5.0]) barrel(F, u, pv - 0.9, y + 1.0, 0.18, 0.4);
    const nT = Math.max(2, Math.floor((W - 3) / 3.2));
    for (let i = 0; i < nT; i++) { const u = 1.8 + i * 3.0, v = 1.7 + (i % 2) * 1.2; tbl(F, u - 0.5, u + 0.5, v - 0.5, v + 0.5, y, 0.76, 'wood_dark'); chr(F, u - 0.8, v, 'u+', y); chr(F, u + 0.8, v, 'u-', y); chr(F, u, v - 0.8, 'v+', y); chr(F, u, v + 0.8, 'v-', y); F.b('cloth_white', u - 0.2, u + 0.2, y + 0.76, y + 0.8, v - 0.2, v + 0.2); }
    stove(F, W - 0.9, 1.0, y, true);
    pend(F, 3.0, yc, 2.2); pend(F, W * 0.6, yc, 2.2, false);
    return;
  }
  counter(F, cu0, cu1, cv, cv + 0.7, y);
  const goods = { grocer: ['cloth_red', 'paint_white', 'cloth_green', 'paint_ochre', 'glass_lamp'], baker: ['wood_ochre', 'wood_painted', 'cloth_white'], butcher: ['cloth_red', 'cloth_maroon', 'cloth_white'], tobacco: ['car_black', 'cloth_brown', 'car_red', 'paint_ochre'], hardware: ['iron', 'steel_grey', 'wood_ochre', 'iron_galv'], draper: ['cloth_red', 'cloth_blue', 'cloth_ochre', 'cloth_green', 'cloth_indigo', 'cloth_white', 'cloth_maroon'] }[kind];
  shelves(F, cu0, W - 2.5, pv - 0.5, 0.4, y, 2.7, 4, goods, r);
  F.b('iron', cu0, W - 2.5, y + 2.8, y + 2.83, pv - 0.55, pv - 0.5);
  switch (kind) {
    case 'grocer':
      scales(F, 2.4, cv + 0.35, y + 1.0); scales(F, 5.2, cv + 0.35, y + 1.0);
      barrel(F, W - 1.1, 1.3, y); barrel(F, W - 1.1, 2.2, y, 0.28, 0.8); sack(F, 1.0, 1.0, y); sack(F, 1.5, 1.2, y, 'cloth_white'); sack(F, 1.0, 1.7, y, 'cloth_ochre');
      crate(F, 3.0, 1.2, y, 'cloth_red'); crate(F, 3.7, 1.2, y, 'cloth_green'); crate(F, 3.3, 1.2, y + 0.36, 'paint_ochre'); tbl(F, 5.0, 6.4, 1.0, 1.7, y, 0.8, 'wood_painted'); break;
    case 'baker':
      for (let i = 0; i < 4; i++) { const u = 1.4 + i * 0.9; F.b('wood_ochre', u, u + 0.7, y + 1.04, y + 1.08, cv + 0.1, cv + 0.6); for (let k = 0; k < 3; k++) F.b('wood_painted', u + 0.05 + k * 0.22, u + 0.25 + k * 0.22, y + 1.08, y + 1.18, cv + 0.15, cv + 0.5); }
      F.b('glass_lamp', cu0, cu1, y + 1.0, y + 1.55, cv + 0.05, cv + 0.07); sack(F, W - 1.0, 1.0, y, 'cloth_white'); sack(F, W - 1.0, 1.5, y, 'cloth_white'); sack(F, W - 1.5, 1.0, y, 'cloth_white');
      F.s('brick', 0.4, 2.0, y, y + 2.2, pv + 0.1, pv + 1.0); tbl(F, 4.0, 5.6, 1.0, 1.6, y, 0.8, 'wood_painted'); break;
    case 'butcher':
      F.b('steel_chrome', 1.2, W - 3.4, y + 2.4, y + 2.44, cv + 0.1, cv + 0.13);
      for (let u = 1.5; u < W - 3.6; u += 0.5) { F.b(u % 1 < 0.5 ? 'cloth_red' : 'cloth_maroon', u, u + 0.16, y + 1.5, y + 2.4, cv + 0.08, cv + 0.2); }
      F.s('wood_dark', 3.0, 4.0, y, y + 0.9, 1.0, 1.9); F.b('steel_chrome', 3.3, 3.4, y + 0.9, y + 1.0, 1.4, 1.5); scales(F, 6.0, cv + 0.35, y + 1.0); break;
    case 'tobacco':
      for (let i = 0; i < 3; i++) { const u = 1.0 + i * 1.4; F.b('wood_painted', u, u + 1.1, y, y + 1.4, 0.6, 0.9); for (let k = 0; k < 5; k++) F.b(['paint_white', 'car_red', 'paint_cab_yellow', 'car_blue'][k % 4], u + 0.05 + k * 0.2, u + 0.2 + k * 0.2, y + 1.0 + (k % 2) * 0.2, y + 1.3 + (k % 2) * 0.2, 0.55, 0.6); }
      F.k(1.0, 5.2, y, y + 1.4, 0.6, 0.9); F.b('paint_white', W - 2.4, W - 1.0, y + 1.0, y + 1.4, 0.5, 0.6); break;
    case 'hardware':
      for (let i = 0; i < 5; i++) barrel(F, 1.0 + i * 0.7, 1.2 + (i % 2) * 0.3, y, 0.25, 0.7);
      for (let i = 0; i < 6; i++) F.b('iron_galv', W - 1.6 + (i % 3) * 0.4, W - 1.35 + (i % 3) * 0.4, y, y + 0.3, 1.0 + Math.floor(i / 3) * 0.4, 1.25 + Math.floor(i / 3) * 0.4);
      for (let u = 1.2; u < 5; u += 0.4) F.rod('iron', u, y + 2.2, 0.45, u + 0.05, y + 1.2, 0.45, 0.012); break;
    case 'draper':
      tbl(F, 2.0, 4.4, 1.2, 2.2, y, 0.9, 'wood_painted'); for (let i = 0; i < 4; i++) F.b(goods[i], 2.1 + i * 0.55, 2.55 + i * 0.55, y + 0.9, y + 1.05, 1.3, 2.1);
      F.rod('wood_ochre', W - 1.2, y, 1.4, W - 1.2, y + 1.55, 1.4, 0.03); F.lathe('cloth_blue', [[0.001, 0], [0.24, 0.1], [0.2, 0.6], [0.14, 0.7], [0.001, 0.72]], W - 1.2, y + 0.7, 1.4, 8); break;
    default: break;
  }
  pend(F, W * 0.3, yc, 2.2); pend(F, W * 0.65, yc, 2.2, false);
}

function fitFlat(F, y, yc, pv, D, r, backOnly = false) {
  const W = F.W, kit = Math.floor(r() * 3);
  if (!backOnly) {
  // the front room: a table with chairs, a sideboard, a tiled stove, a rug, pictures
  rug(F, 2.0, W - 2.5, 1.2, pv - 1.2, y, ['cloth_red', 'cloth_indigo', 'cloth_green'][Math.floor(r() * 3)]);
  const tu = W * 0.4; tbl(F, tu - 0.7, tu + 0.7, 2.2, 3.2, y, 0.76, 'wood_painted'); for (const [u, v, d] of [[tu - 0.4, 1.8, 'v+'], [tu + 0.4, 1.8, 'v+'], [tu - 0.4, 3.6, 'v-'], [tu + 0.4, 3.6, 'v-'], [tu - 1.1, 2.7, 'u+'], [tu + 1.1, 2.7, 'u-']]) chr(F, u, v, d, y);
  F.s('wood_dark', 1.0, 2.6, y, y + 1.0, pv - 0.7, pv - 0.15); F.b('cloth_white', 1.2, 1.9, y + 1.0, y + 1.03, pv - 0.55, pv - 0.3); F.b('wood_dark', 1.3, 1.6, y + 1.03, y + 1.4, pv - 0.5, pv - 0.35);
  stove(F, W - 1.0, pv - 0.8, y);
  for (let i = 0; i < 3; i++) F.b(['car_red', 'cloth_indigo', 'paint_ochre'][i], 4.0 + i * 0.9, 4.5 + i * 0.9, y + 1.5, y + 2.0, pv - 0.12, pv - 0.1);
  if (kit === 0) { F.s('wood_painted', W - 3.4, W - 1.6, y, y + 0.6, 0.5, 1.3); F.b('cloth_ochre', W - 3.36, W - 1.64, y + 0.6, y + 0.72, 0.52, 1.28); }   // a sofa under the window
  pend(F, tu, yc, 2.7, r() < 0.5);
  }
  // the kitchen behind: a range with its pipe, a table, a dresser, a sink and a bucket
  const kv = pv + 0.2;
  F.s('iron', 0.5, 1.7, y, y + 0.85, D - 1.0, D - 0.35); F.b('steel_grey', 0.5, 1.7, y + 0.85, y + 0.9, D - 1.0, D - 0.35); F.rod('iron', 1.1, y + 0.9, D - 0.7, 1.1, y + 3.3, D - 0.7, 0.07, 6);
  for (const u of [0.8, 1.3]) F.lathe('iron', [[0.1, 0], [0.14, 0.05], [0.14, 0.12], [0.001, 0.14]], u, y + 0.9, D - 0.7, 8);
  tbl(F, 3.0, 4.6, kv + 0.8, kv + 1.6, y, 0.78, 'paint_white'); chr(F, 2.5, kv + 1.2, 'u+', y); chr(F, 5.1, kv + 1.2, 'u-', y); chr(F, 3.8, kv + 2.1, 'v-', y);
  F.s('wood_painted', W - 2.8, W - 0.5, y, y + 2.0, D - 0.7, D - 0.35); shelves(F, W - 2.8, W - 0.5, D - 0.95, 0.5, y + 0.8, 1.2, 2, ['glaze_white', 'pottery_dark', 'paint_white'], r);
  F.s('glaze_white', W - 5.5, W - 4.5, y, y + 0.9, D - 0.7, D - 0.35); F.b('steel_chrome', W - 5.1, W - 4.9, y + 0.9, y + 1.15, D - 0.6, D - 0.5);
  F.lathe('iron_galv', [[0.13, 0], [0.16, 0.3], [0.001, 0.3]], W - 6.2, y, D - 0.8, 8);
  pend(F, 3.8, yc, kv + 1.2, false);
}

function fitWorkshop(F, y, yc, pv, D, r) {
  const W = F.W; tbl(F, 1.5, 4.5, 1.2, 2.0, y, 0.82, 'wood_painted');
  for (let i = 0; i < 5; i++) F.b(['cloth_grey', 'cloth_brown', 'cloth_indigo', 'cloth_black', 'cloth_blue'][i], 1.7 + i * 0.55, 2.1 + i * 0.55, y + 0.82, y + 0.9, 1.3, 1.9);
  chr(F, 3.0, 2.6, 'v-', y); F.s('iron', 6.0, 6.7, y, y + 0.8, 1.4, 1.9); F.b('steel_grey', 5.9, 6.8, y + 0.8, y + 0.88, 1.3, 2.0); F.lathe('iron', [[0.12, 0], [0.12, 0.3], [0.001, 0.32]], 6.35, y + 0.9, 1.65, 8);
  shelves(F, 1.0, W - 2.5, pv - 0.5, 0.4, y, 2.6, 4, ['cloth_grey', 'cloth_brown', 'cloth_indigo', 'wood_ochre', 'iron'], r);
  stove(F, W - 1.0, 1.0, y);
  for (let i = 0; i < 3; i++) F.s('wood_painted', 0.5 + i * 1.4, 1.6 + i * 1.4, y, y + 1.0, D - 0.9, D - 0.35);
  pend(F, 3.0, yc, 2.0);
}

// ── the facade ────────────────────────────────────────────────────────────────────────────────────
/** The street-front dressing of a shop: the fascia with its lettering, the awning, a blade sign and the goods out on the pavement. */
function shopFront(F, kind, y, yc, r, du, ux0, ux1) {
  const sign = SIGN[Math.floor(r() * SIGN.length)], aw = AWN[Math.floor(r() * AWN.length)], W = F.W;
  F.b(sign, 0.3, W - 0.3, yc - 1.0, yc - 0.12, -0.12, 0); F.b('paint_white', 0.3, W - 0.3, yc - 1.04, yc - 1.0, -0.14, 0); F.b('paint_white', 0.3, W - 0.3, yc - 0.12, yc - 0.08, -0.14, 0);
  // the lettering: signwriter's blocks of varying width on the fascia
  const letter = sign === 'paint_ochre' || sign === 'paint_blue' ? 'car_black' : 'car_cream';
  for (let u = 1.2, k = 0; u < W - 2.4 && k < 40; k++) { const wd = 0.14 + r() * 0.12; if (r() < 0.12) { u += 0.3; continue; } F.b(letter, u, u + wd, yc - 0.82, yc - 0.3, -0.15, -0.12); u += wd + 0.1; }
  // the awning, striped, over the window part (two lengths either side of the door)
  for (const [a, b] of [[ux0, du - 0.9], [du + 0.9, ux1]]) {
    if (b - a < 1.2) continue;
    const n = Math.max(2, Math.round((b - a) / 0.32)), step = (b - a) / n;
    for (let i = 0; i < n; i++) { const c = aw[i % 2]; F.b(c, a + i * step, a + (i + 1) * step, yc - 1.55, yc - 1.4, -1.5, -0.12); F.b(c, a + i * step, a + (i + 1) * step, yc - 1.62, yc - 1.4, -1.55, -1.5); }
    F.rod('iron', a, yc - 1.5, -1.5, a, yc - 1.0, -0.1, 0.012); F.rod('iron', b, yc - 1.5, -1.5, b, yc - 1.0, -0.1, 0.012);
  }
  // the blade sign on its iron bracket, its figure by the trade
  const bu = W - 0.6, fig = { grocer: 'cloth_red', baker: 'paint_cab_yellow', butcher: 'cloth_maroon', tobacco: 'car_black', hardware: 'iron_galv', draper: 'cloth_blue', pub: 'wood_ochre' }[kind];
  F.rod('iron', bu, yc - 0.1, -0.1, bu, yc - 0.1, -1.1, 0.02); F.b('iron', bu - 0.02, bu + 0.02, yc - 0.1, yc + 0.5, -1.1, -1.06); F.rod('iron', bu, yc + 0.5, -0.1, bu, yc + 0.5, -1.1, 0.012);
  F.b(fig, bu - 0.03, bu + 0.03, yc - 0.75, yc - 0.15, -1.0, -0.45); F.b('paint_white', bu - 0.035, bu + 0.035, yc - 0.65, yc - 0.45, -0.95, -0.55);
  // the goods on the pavement
  const g = r();
  if (kind === 'grocer') { F.b('wood_ochre', ux0 + 0.2, ux0 + 2.0, 0.55, 0.6, -1.0, -0.4); F.b('wood_ochre', ux0 + 0.2, ux0 + 2.0, 0, 0.55, -0.45, -0.4); for (let i = 0; i < 5; i++) F.b(['cloth_red', 'cloth_green', 'paint_ochre', 'cloth_brown'][i % 4], ux0 + 0.3 + i * 0.33, ux0 + 0.55 + i * 0.33, 0.6, 0.78, -0.95, -0.5); F.s('wood_ochre', ux0 + 0.2, ux0 + 2.0, 0, 0.55, -1.0, -0.4); }
  else if (kind === 'baker') { F.b('wood_painted', ux1 - 1.3, ux1 - 0.3, 0.8, 0.84, -0.9, -0.3); for (const u of [ux1 - 1.2, ux1 - 0.35]) F.b('timber', u, u + 0.06, 0, 0.8, -0.6, -0.55); for (let i = 0; i < 4; i++) F.b('wood_ochre', ux1 - 1.2 + i * 0.22, ux1 - 1.05 + i * 0.22, 0.84, 0.94, -0.8, -0.4); }
  else if (kind === 'hardware') { for (let i = 0; i < 4; i++) F.lathe('iron_galv', [[0.18, 0], [0.22, 0.34], [0.001, 0.34]], ux0 + 0.4 + i * 0.5, 0, -0.7, 8); F.rod('iron', ux1 - 0.6, 0.05, -0.5, ux1 - 0.4, 1.9, -0.15, 0.015); }
  else if (kind === 'draper') { F.b('wood_painted', ux0 + 0.2, ux0 + 1.6, 0, 0.9, -0.8, -0.3); for (let i = 0; i < 3; i++) F.b(['cloth_red', 'cloth_blue', 'cloth_ochre'][i], ux0 + 0.3 + i * 0.4, ux0 + 0.65 + i * 0.4, 0.9, 1.0, -0.75, -0.35); }
  else if (kind === 'tobacco') { F.s('wood_painted', ux1 - 1.2, ux1 - 0.4, 0, 1.3, -0.6, -0.2); for (let i = 0; i < 4; i++) F.b(['paint_white', 'cloth_grey', 'paint_white'][i % 3], ux1 - 1.15 + i * 0.2, ux1 - 1.0 + i * 0.2, 0.8 + (i % 2) * 0.2, 1.2 + (i % 2) * 0.2, -0.62, -0.58); }
  else if (kind === 'pub') { for (const u of [ux0 + 0.6, ux0 + 2.0]) { F.b('wood_dark', u - 0.4, u + 0.4, 0.72, 0.76, -1.2, -0.5); for (const [a, b] of [[-0.35, -1.15], [0.35, -1.15], [-0.35, -0.55], [0.35, -0.55]]) F.b('iron', u + a - 0.02, u + a + 0.02, 0, 0.72, b - 0.02, b + 0.02); chr(F, u - 0.7, -0.85, 'u+', 0); chr(F, u + 0.7, -0.85, 'u-', 0); } }
  if (g < 0.5) F.cyl('wood_painted', ux0 + 0.1, 0, -0.35, 0.22, 0.7, 8);
  if (g < 0.35) { F.b('slate', ux1 - 0.9, ux1 - 0.1, 1.0, 1.6, -0.12, -0.06); F.b('paint_white', ux1 - 0.8, ux1 - 0.2, 1.1, 1.5, -0.13, -0.12); }
}

/** One house, in its frame. */
function houseIn(F, l, spec, r) {
  const { n, H0, SH, yc, yb, top, manner, modern } = spec, W = F.W, D = F.D, y = FL;
  const mat = modern ? 'plaster_white' : manner === 'brick' ? 'brick_buff' : WALLS[Math.floor(r() * WALLS.length)];
  const sandstone = 'sandstone_white', shut = SHUT[Math.floor(r() * 3)], kind = SHOPS[Math.floor(r() * SHOPS.length)];
  const enter = l.shop || modern || r() < 0.55, shopKind = l.shop ? kind : null;
  const cols = Math.max(3, Math.floor(W / (modern ? 3.4 : 3.0))), pitch = (W - 0.6) / cols, cu = (c) => 0.3 + pitch * (c + 0.5);
  const dcol = l.shop ? Math.min(cols - 1, Math.max(1, Math.round(cols * (0.25 + r() * 0.5)))) : Math.floor(cols * (0.25 + r() * 0.5)), du = cu(dcol);
  const FT = 0.35, wy1 = (s) => (s === 0 ? yc : yb + s * SH);
  // the footprint's volume above the ground storey, and the colliders of the ground storey
  F.b(mat, 0, W, yc, top, FT, D); F.b('plaster_white', 0.3, W - 0.3, yc, yc + 0.3, FT, D - 0.3);
  F.k(0, W, yc - 0.1, top, 0, D);
  // the ground storey: the walls, hollow
  const pm = manner === 'brick' ? 'brick' : sandstone;
  const dopen = { u0: du - 0.6, u1: du + 0.6, y1: y + 2.55 };
  const gops = [dopen];
  if (shopKind) {
    const a = 0.6, b = W - 0.6;
    for (const [s0, s1] of [[a, du - 0.9], [du + 0.9, b]]) if (s1 - s0 > 1.0) gops.push({ u0: s0, u1: s1, y0: y + 0.65, y1: yc - 1.15, glass: 'glass_outer', frame: 'wood_dark' });
  } else for (let c = 0; c < cols; c++) { const u = cu(c); if (Math.abs(u - du) < 1.3) continue; gops.push({ u0: u - 0.55, u1: u + 0.55, y0: y + 0.95, y1: y + 2.65, glass: 'glass_outer', frame: modern ? 'steel_grey' : 'paint_white' }); }
  F.wall({ u0: 0, u1: W, v: 0, th: FT, y0: y, y1: yc, mat, ops: gops });
  F.s(mat, 0, 0.3, y, yc, FT, D); F.s(mat, W - 0.3, W, y, yc, FT, D);
  F.wall({ u0: 0.3, u1: W - 0.3, v: D - 0.3, th: 0.3, y0: y, y1: yc, mat, ops: [0.22, 0.62].map((f) => ({ u0: W * f - 0.5, u1: W * f + 0.5, y0: y + 1.1, y1: y + 2.5, glass: 'glass_outer', frame: 'paint_white' })) });
  // the floor, the ceiling, the dark behind the glass of the closed ones
  F.b(shopKind ? 'tile_cream' : 'wood_ochre', 0.3, W - 0.3, y - 0.02, y + 0.012, FT, D - 0.3); F.floor(0.3, W - 0.3, FT, D - 0.3, y);
  F.b('plaster_white', 0.3, W - 0.3, yc - 0.04, yc, FT, D - 0.3);
  // the partition with its door; wainscot along the inner walls
  const pv = Math.min(D - 5.5, shopKind ? 7.2 : 6.2), pd = W - 1.7;
  F.wall({ u0: 0.3, u1: W - 0.3, v: pv, th: 0.2, y0: y, y1: yc, mat: 'plaster_white', ops: [{ u0: pd - 0.5, u1: pd + 0.5, y1: y + 2.3 }] });
  F.b('wood_painted', 0.32, W - 0.32, y + 0.02, y + 1.1, D - 0.36, D - 0.3); F.b('wood_painted', 0.3, 0.36, y + 0.02, y + 1.1, FT + 0.02, D - 0.32); F.b('wood_painted', W - 0.36, W - 0.3, y + 0.02, y + 1.1, FT + 0.02, D - 0.32);
  F.b('paint_cab_yellow', 0.32, W - 0.32, y + 1.1, y + 1.14, D - 0.38, D - 0.3);
  const fit = rng(l.seed * 7 + 3);
  if (shopKind) { fitShop(F, shopKind, y, yc, FT, pv, fit); fitFlat(F, y, yc, pv, D - 0.3, fit, true); } else if (r() < 0.7) fitFlat(F, y, yc, pv, D - 0.3, fit); else { fitWorkshop(F, y, yc, pv, D - 0.3, fit); fitFlat(F, y, yc, pv, D - 0.3, fit, true); }
  void enter;
  // the plinth, the damp at the foot, the quoins / bands by manner
  F.b(pm, -0.04, W + 0.04, 0, 0.95, -0.06, 0); F.b('concrete_light', -0.05, W + 0.05, 0.95, 1.02, -0.08, 0);
  F.b('plaster_damp', 0.05, W - 0.05, 1.02, 1.5, -0.03, 0.01); F.b('plaster_damp', 0.05, W - 0.05, 0, 0.18, -0.09, -0.07);
  for (let u = 0.3; u < W - 0.6; u += 0.5 + r() * 2.5) if (r() < 0.45) F.b('brick', u, u + 0.35 + r() * 0.3, 1.02, 1.35 + r() * 0.4, -0.03, -0.01);    // bare brick where the render fell
  // the door: a stoop, a frame, a transom, the bell and number plate (a shop's door glazed)
  F.b('sandstone_white', du - 0.8, du + 0.8, 0, 0.12, -0.7, -0.06); F.b('sandstone_white', du - 0.7, du + 0.7, 0, 0.24, -0.4, -0.06); F.k(du - 0.8, du + 0.8, 0, 0.12, -0.7, -0.06);
  const dm = shopKind ? 'wood_dark' : modern ? 'car_blue' : ['wood_dark', 'shutter_green', 'wood_painted', 'car_red'][Math.floor(r() * 4)];
  F.b(dm, du - 0.7, du - 0.62, y + 0.02, y + 2.55, -0.06, 0.12); F.b(dm, du + 0.62, du + 0.7, y + 0.02, y + 2.55, -0.06, 0.12); F.b(dm, du - 0.7, du + 0.7, y + 2.55, y + 2.65, -0.06, 0.12);
  F.b(dm, du - 0.6, du + 0.6, y + 2.0, y + 2.5, 0.0, 0.04);
  F.b('wood_dark', du + 0.6 - 0.0, du + 0.62, y + 1.0, y + 1.1, -0.1, -0.06);
  if (!modern) { F.b('paint_white', du + 0.75, du + 0.9, y + 1.4, y + 1.55, -0.08, -0.06); F.b('paint_blue', du - 1.1, du - 0.9, y + 1.8, y + 2.0, -0.07, -0.06); F.b('iron', du - 0.8, du - 0.5, y + 0.25, y + 0.3, -0.6, -0.5); }
  if (!shopKind && !modern) { F.b(sandstone, du - 0.95, du + 0.95, y + 2.65, y + 2.85, -0.16, 0.0); F.b(sandstone, du - 0.8, du + 0.8, y + 2.85, y + 3.0, -0.12, 0); }
  if (modern) F.b('concrete_light', du - 1.3, du + 1.3, y + 2.75, y + 2.88, -1.3, 0);
  if (shopKind) shopFront(F, shopKind, y, yc, r, du, 0.6, W - 0.6);
  // the upper storeys: a wall with deep reveals, windows with sills and lintels, curtains, boxes, shutters
  for (let s = 1; s < n; s++) {
    const sb = yb + (s - 1) * SH, y0 = sb + 0.85, y1 = sb + SH - (modern ? 0.55 : 0.5), w = modern ? 0.8 : 0.52;
    const ops = [];
    for (let c = 0; c < cols; c++) {
      const u = cu(c), balc = !modern && manner === 'gruender' && s === 1 && c === dcol;
      ops.push({ u0: u - w, u1: u + w, y0: balc ? sb + 0.12 : y0, y1: balc ? y1 + 0.1 : y1, glass: 'glass_outer', frame: modern ? 'steel_grey' : 'paint_white' });
    }
    F.wall({ u0: 0, u1: W, v: 0, th: FT, y0: s === 1 ? sb - 0.3 : sb, y1: sb + SH, mat, ops, solid: false });
    for (let c = 0; c < cols; c++) {
      const u = cu(c), balc = !modern && manner === 'gruender' && s === 1 && c === dcol, wy0 = balc ? sb + 0.12 : y0, wy1b = balc ? y1 + 0.1 : y1;
      F.b('wood_dark', u - w + 0.02, u + w - 0.02, wy0 + 0.02, wy1b - 0.02, FT - 0.06, FT - 0.02);                                        // the dark room behind the glass
      const cc = ['cloth_white', 'cloth_white', 'cloth_ochre', 'cloth_red', 'cloth_blue'][Math.floor(r() * 5)], open = 0.25 + r() * 0.2;
      F.b('cloth_white', u - w, u - w + open, wy0 + 0.3, wy1b - 0.05, 0.2, 0.23); F.b('cloth_white', u + w - open, u + w, wy0 + 0.3, wy1b - 0.05, 0.2, 0.23);
      if (r() < 0.35) F.b(cc, u - w, u + w, wy1b - 0.35, wy1b - 0.05, 0.19, 0.2);                          // a blind half down
      if (!modern) {
        F.b(sandstone, u - w - 0.1, u + w + 0.1, wy0 - 0.1, wy0, -0.1, 0.04);                             // the sill
        if (manner === 'gruender') { F.b(sandstone, u - w - 0.14, u + w + 0.14, wy1b, wy1b + 0.2, -0.1, 0.04); F.b(sandstone, u - w - 0.08, u + w + 0.08, wy1b + 0.2, wy1b + 0.3, -0.14, 0.0); if (s === 1) { F.b(sandstone, u - w - 0.06, u + w + 0.06, wy1b + 0.3, wy1b + 0.34, -0.14, -0.02); } }
        else if (manner === 'brick') { F.b('brick_grey', u - w - 0.08, u + w + 0.08, wy1b, wy1b + 0.16, -0.06, 0.02); }
        else F.b(sandstone, u - w - 0.06, u + w + 0.06, wy1b, wy1b + 0.1, -0.05, 0.02);
        F.b('plaster_streak', u - w + 0.05, u + w - 0.05, wy0 - 0.75 - r() * 0.5, wy0 - 0.12, -0.03, 0.01);   // rain streaks under the sill
        if (manner === 'plain' || (manner === 'reform' && c % 2 === 0)) { const o = 0.2; F.b(shut, u - w - o, u - w, wy0, wy1b, -0.08, 0.0); F.b(shut, u + w, u + w + o, wy0, wy1b, -0.08, 0.0); }
        if (!balc && r() < 0.42) {                                                                           // a window box with geraniums
          F.b('wood_painted', u - w, u + w, wy0 - 0.28, wy0 - 0.08, -0.34, -0.1); F.b('pottery_dark', u - w + 0.02, u + w - 0.02, wy0 - 0.1, wy0 - 0.06, -0.32, -0.12);
          for (let k = 0; k < 3; k++) { const uu = u - w + 0.2 + k * (2 * w - 0.4) / 2; F.b('cloth_green', uu - 0.16, uu + 0.16, wy0 - 0.06, wy0 + 0.14, -0.3, -0.16); F.b(['car_red', 'cloth_red', 'paint_white'][(k + c) % 3], uu - 0.08, uu + 0.08, wy0 + 0.14, wy0 + 0.22, -0.26, -0.2); }
        }
      }
      if (balc) {                                                                                           // the iron balcony over the door
        F.b('sandstone_white', u - 1.4, u + 1.4, sb - 0.05, sb + 0.1, -0.9, 0); for (const a of [u - 1.4, u + 1.4]) F.b('sandstone_white', a - 0.05, a + 0.05, sb + 0.1, sb + 1.0, -0.9, -0.8);
        for (let q = -1.35; q <= 1.36; q += 0.18) F.b('iron', u + q - 0.01, u + q + 0.01, sb + 0.1, sb + 1.0, -0.9, -0.88);
        F.b('iron', u - 1.4, u + 1.4, sb + 1.0, sb + 1.04, -0.91, -0.87); F.b('iron', u - 1.4, u - 1.36, sb + 0.1, sb + 1.0, -0.9, 0); F.b('iron', u + 1.36, u + 1.4, sb + 0.1, sb + 1.0, -0.9, 0);
      }
    }
    // the bands between the storeys by manner; weathered render at the corners
    if (!modern) F.b(manner === 'brick' ? 'brick_grey' : sandstone, -0.05, W + 0.05, sb - 0.06, sb + 0.1, -0.06, 0);
    if (manner === 'gruender' && s > 0) for (const u of [0, W - 0.35]) F.b(sandstone, u, u + 0.35, sb, sb + SH, -0.04, 0);
    if (modern) F.b('concrete_light', -0.03, W + 0.03, sb - 0.1, sb + 0.04, -0.03, 0);
  }
  // downpipes at both ends, a gutter, the cornice and the roof
  for (const u of [0.18, W - 0.18]) F.b('iron_galv', u - 0.05, u + 0.05, 0.2, top, -0.12, -0.04);
  F.b('plaster_damp', 0.05, 0.55, top - 1.6, top - 0.1, -0.03, 0.01); F.b('plaster_streak', W - 0.75, W - 0.05, top - 1.2, top - 0.1, -0.03, 0.01);
  if (modern || l.roof === 'flat') {
    F.b('concrete_light', -0.05, W + 0.05, top, top + 0.12, -0.05, D + 0.05); F.b('plaster_white', 0, W, top + 0.12, top + 0.55, -0.0, 0.2); F.b('plaster_white', 0, W, top + 0.12, top + 0.55, D - 0.2, D);
    F.b('plaster_white', 0, 0.2, top + 0.12, top + 0.55, 0, D); F.b('plaster_white', W - 0.2, W, top + 0.12, top + 0.55, 0, D);
    F.b('asphalt', 0.2, W - 0.2, top + 0.12, top + 0.15, 0.2, D - 0.2);
  } else {
    F.b(manner === 'brick' ? 'brick_grey' : sandstone, -0.12, W + 0.12, top - 0.22, top + 0.05, -0.2, D + 0.12); F.b('iron_galv', -0.1, W + 0.1, top - 0.02, top + 0.02, -0.28, -0.2);
    const sk = F.sk, rect = F.rect, rm = Math.floor(r() * 4) === 0 ? 'tile_dark' : 'roof_tile';
    hip(sk, rect, top + 0.05, rm, l.roof === 'mansard' ? 0.75 : 0.6);
    // dormers on the front slope, the chimneys from houseSpec
    const nd = Math.max(1, Math.floor(cols / 2));
    for (let i = 0; i < nd; i++) { const u = W * (i + 0.5) / nd; F.b(mat, u - 0.55, u + 0.55, top + 0.3, top + 1.5, 0.55, 1.4); F.b(rm, u - 0.7, u + 0.7, top + 1.5, top + 1.65, 0.45, 1.5); F.pane('glass_outer', u - 0.4, u + 0.4, top + 0.6, top + 1.4, 0.54, 1); F.b('paint_white', u - 0.45, u + 0.45, top + 0.55, top + 0.6, 0.5, 0.56); }
  }
}

/** The palette names a house folds together (near-alike colours: fewer materials, fewer draw calls per plan). */
const HOUSE_MAP = {
  cloth_blue: 'cloth_grey', cloth_indigo: 'cloth_grey', cloth_black: 'cloth_grey', cloth_brown: 'cloth_red', cloth_maroon: 'cloth_red', cloth_ochre: 'paint_ochre',
  car_black: 'iron', car_blue: 'paint_blue', car_red: 'cloth_red', car_cream: 'stucco_cream', shutter_brown: 'shutter_green', shutter_grey: 'shutter_green',
  plaster_damp: 'plaster_grey', plaster_streak: 'plaster_grey', tile_cream: 'tile_white', tile_dark: 'slate', wood_ochre: 'timber', wood_painted: 'timber',
  steel_chrome: 'iron', steel_grey: 'iron', iron_galv: 'iron', paint_cab_yellow: 'paint_ochre', pottery_dark: 'terracotta', brick_buff: 'brick', brick_grey: 'brick',
  glaze_white: 'glaze_green',
};

/** dessau_house: { rect, front, storeys, shop, roof, modern, seed, simple } (docs §11); `simple`: the far view (walls, window dots, roof, chimneys). */
export function dessauHouse(el, ctx) {
  const sk = new S(ctx, HOUSE_MAP), spec = houseSpec(el), r = rng(el.seed || 1), F = new Fr(sk, el.rect, el.front);
  if (el.simple) { farHouse(F, el, spec, r); } else houseIn(F, el, spec, r);
  for (const c of spec.chimneys) { sk.b('brick', c.x - 0.3, c.y - 2.4 > 0 ? c.y - 2.4 : 0, c.z - 0.3, c.x + 0.3, c.y, c.z + 0.3); if (!el.simple) { sk.b('iron', c.x - 0.36, c.y, c.z - 0.36, c.x + 0.36, c.y + 0.1, c.z + 0.36); sk.cyl('terracotta', c.x, c.y + 0.1, c.z, 0.13, 0.3, 8); } }
}

/** The far house: one mass, a row of dark window boxes on each storey, the roof. */
function farHouse(F, l, spec, r) {
  const { n, SH, yb, top, manner, modern } = spec, W = F.W, D = F.D;
  const mat = modern ? 'plaster_white' : manner === 'brick' ? 'brick_buff' : WALLS[Math.floor(r() * WALLS.length)];
  F.b(mat, 0, W, 0, top, 0, D);
  const cols = Math.max(3, Math.floor(W / (modern ? 3.4 : 3.0))), pitch = (W - 0.6) / cols;
  for (let s = 1; s < n; s++) { const sb = yb + (s - 1) * SH; for (let c = 0; c < cols; c++) { const u = 0.3 + pitch * (c + 0.5); F.b('wood_dark', u - 0.45, u + 0.45, sb + 0.9, sb + SH - 0.6, -0.04, 0.0); } }
  if (modern || l.roof === 'flat') F.b('concrete_light', -0.05, W + 0.05, top, top + 0.3, -0.05, D + 0.05);
  else hip(F.sk, F.rect, top + 0.05, 'roof_tile', l.roof === 'mansard' ? 0.75 : 0.6);
}
