// Three more rooms of Sydney in 1973 to walk into (docs/settlements/sydney.md §1g): the public bar of a sandstone hotel in the Rocks,
// a newsagent and a greengrocer. One shell (a shop front on its footpath, the ground floor hollow, the upper storey solid) and
// each fitted out by its trade.
import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { frame, chair } from './rooms.js';
import { milkbar, butcher, chemist, barber } from './shops2.js';
import { Quads, letters, textLen, fitCell } from '../artdeco/dress.js';

const both = (t) => { const o = [...t]; for (let i = 0; i < t.length; i += 9) o.push(...t.slice(i, i + 3), ...t.slice(i + 6, i + 9), ...t.slice(i + 3, i + 6)); return o; };
const KINDS = {
  pub: { name: 'HOTEL', wall: 'sandstone_dressed', floor: 'tile_grey', riser: 'tile_green', fascia: 'paint_ferry_green', letter: 'gold', awning: ['cloth_green', 'cloth_white'], door: 0.5, H1: 3.9 },
  newsagent: { name: 'NEWSAGENT', wall: 'brick', floor: 'tile_cream', riser: 'tile_cream', fascia: 'car_blue', letter: 'paint_white', awning: ['cloth_blue', 'cloth_white'], door: 0.3, H1: 3.5 },
  milkbar: { name: 'MILK BAR', wall: 'stucco_cream', floor: 'tile_cream', riser: 'tile_green', fascia: 'car_red', letter: 'paint_white', awning: ['cloth_red', 'cloth_white'], door: 0.3, H1: 3.4, top: 7.5, parapet: 'step', blade: 'car_red' },
  butcher: { name: 'BUTCHER', wall: 'brick', floor: 'tile_white', riser: 'tile_white', fascia: 'cloth_maroon', letter: 'paint_white', awning: ['cloth_red', 'cloth_white'], door: 0.7, H1: 3.6, top: 8.0, parapet: 'cornice' },
  chemist: { name: 'CHEMIST', wall: 'facade_buff', floor: 'tile_cream', riser: 'granite_black', fascia: 'glaze_green', letter: 'paint_white', awning: ['cloth_green', 'cloth_white'], door: 0.5, H1: 3.8, top: 9.0, parapet: 'cornice', blade: 'glaze_green' },
  barber: { name: 'BARBER', wall: 'facade_brick', floor: 'tile_grey', riser: 'glaze_blue', fascia: 'car_blue', letter: 'paint_white', awning: ['cloth_blue', 'cloth_white'], door: 0.3, H1: 3.3, top: 7.2, parapet: 'step', pole: true },
  greengrocer: { name: 'FRUIT VEG', wall: 'brick', floor: 'concrete_light', riser: 'wood_painted', fascia: 'shutter_green', letter: 'paint_white', awning: ['cloth_green', 'cloth_white'], door: 0.5, H1: 3.5 },
};

/** shop_room: { rect, y (the floor), front, kind ('pub' | 'newsagent' | 'greengrocer'), gy (the footpath), seed, name } */
export function shopRoom(el, { bag, col, lights }) {
  const K = KINDS[el.kind] ?? KINDS.newsagent, { L, Dp, W, R, B } = frame(el.rect, el.front ?? 'n');
  const y = el.y ?? 0, F = y + 0.12, H1 = K.H1, top = y + (K.top ?? 8.4), T = 0.3, gy = el.gy ?? y, wall = el.wall ?? K.wall;
  const rc = (a, b, d0, d1, ya, yb) => col.rect(R(a, b, d0, d1), ya, yb);
  const S = (m, a, b, d0, d1, ya, yb) => { bag.add(m, B(a, b, d0, d1, ya, yb)); rc(a, b, d0, d1, ya, yb); };
  const dw = 1.2, du = L * K.door + (K.door > 0.4 ? 0 : 0.3), fy1 = F + 2.7;
  // the foundation and floor
  bag.add('concrete_light', B(0, L, 0, Dp, y - 1.5, F - 0.1));
  bag.add(K.floor, B(T, L - T, T, Dp - T, F - 0.1, F)); col.floor(R(T, L - T, T, Dp - T), F);
  // the front: brick or sandstone piers, glass in aluminium frames over a riser, the open door, a fascia with the name, a canvas awning
  bag.add(wall, B(0, 0.45, 0, T + 0.15, y - 0.5, F + H1)); bag.add(wall, B(L - 0.45, L, 0, T + 0.15, y - 0.5, F + H1)); rc(0, 0.45, 0, T + 0.15, y - 0.5, F + H1); rc(L - 0.45, L, 0, T + 0.15, y - 0.5, F + H1);
  const front = (a, b) => {
    if (b - a < 0.3) return;
    S(K.riser, a, b, 0.05, 0.2, F, F + 0.6); bag.add('glass_outer', B(a, b, 0.1, 0.12, F + 0.6, fy1)); rc(a, b, 0.08, 0.14, F + 0.6, fy1);
    for (let u = a; u <= b + 0.001; u += (b - a) / Math.max(1, Math.round((b - a) / 1.4))) bag.add('aluminium_dull', B(u - 0.03, u + 0.03, 0.08, 0.16, F + 0.6, fy1));
    bag.add('aluminium_dull', B(a, b, 0.08, 0.16, fy1 - 0.03, fy1 + 0.03));
  };
  front(0.45, du - dw / 2); front(du + dw / 2, L - 0.45);
  bag.add('aluminium_dull', B(du - dw / 2, du + dw / 2, 0.08, 0.16, fy1 - 0.03, fy1 + 0.03));
  bag.add('glass_outer', B(du + dw / 2 - 0.04, du + dw / 2 - 0.02, 0.25, 0.25 + dw - 0.1, F + 0.1, fy1 - 0.05));
  const n = Math.max(1, Math.ceil((F - gy) / 0.17)), hh = (F - gy) / n;
  for (let k = 0; k < n; k++) { bag.add('granite_grey', B(du - dw / 2, du + dw / 2, -0.38 * (k + 1) - 0.02, 0.05, gy - 0.5, gy + hh * (n - k))); col.floor(R(du - dw / 2, du + dw / 2, -0.38 * (k + 1), -0.38 * k + 0.05), gy + hh * (n - k)); }
  col.floor(R(du - dw / 2, du + dw / 2, 0.05, T), F);
  bag.add(K.fascia, B(0.45, L - 0.45, -0.04, 0.3, fy1 + 0.05, F + H1)); bag.add('plaster_white', B(0.45, L - 0.45, -0.06, -0.04, fy1 + 0.03, fy1 + 0.08));
  const name = el.name ?? K.name, cell = fitCell(name, Math.min(L - 3, 7), 0.13), tl = textLen(name, cell), Q = new Quads(), v0 = fy1 + 0.1 + ((F + H1 - fy1 - 0.1) - 5 * cell) / 2;
  letters(Q.t(K.letter), name, cell, (h, v) => W((L - tl) / 2 + h, -0.08, v), 0, v0 - 0); // (v is the height above the base v0)
  for (const [m, T2] of Q.m) bag.add(m, fromTriangles(T2));
  const aw = el.kind === 'pub' ? 1.6 : 1.4;
  for (let k = 0; k < 9; k++) { const u0 = 0.45 + k * (L - 0.9) / 9, u1 = u0 + (L - 0.9) / 9, A = [W(u0, 0, F + H1 - 0.1), W(u1, 0, F + H1 - 0.1), W(u1, -aw, fy1 + 0.25), W(u0, 0, F + H1 - 0.1), W(u1, -aw, fy1 + 0.25), W(u0, -aw, fy1 + 0.25)]; bag.add(K.awning[k % 2], fromTriangles(both(A.flat()))); }
  // the walls, ceiling and the solid upper storey with its windows
  for (const [a, b] of [[0, T], [L - T, L]]) { S(wall, a, b, T + 0.15, Dp, F, F + H1); bag.add('plaster_white', B(a === 0 ? T : a - 0.03, a === 0 ? T + 0.03 : a, T + 0.15, Dp - T, F + (el.kind === 'pub' ? 1.5 : 0), F + H1 - 0.3)); }
  S(wall, 0, L, Dp - T, Dp, F, F + H1); bag.add('plaster_white', B(T, L - T, Dp - T - 0.03, Dp - T, F + (el.kind === 'pub' ? 1.5 : 0), F + H1 - 0.3));
  if (el.kind === 'pub') for (const [a, b, d0, d1] of [[T, T + 0.03, T + 0.15, Dp - T], [L - T - 0.03, L - T, T + 0.15, Dp - T], [T, L - T, Dp - T - 0.03, Dp - T]]) bag.add('tile_green', B(a, b, d0, d1, F, F + 1.5));   // the tiled dado of the public bar
  bag.add('plaster_white', B(0.45, L - 0.45, 0.16, Dp, F + H1 - 0.3, F + H1)); rc(0, L, 0, Dp, F + H1 - 0.3, F + H1);
  bag.add(wall, B(0, L, 0, Dp, F + H1, top)); rc(0, L, 0, Dp, F + H1, top + 1);
  for (let u = 0.9; u + 1.1 < L - 0.5; u += 2.1) {
    bag.add('glass_outer', B(u, u + 1.1, -0.02, 0, F + H1 + 0.9, F + H1 + 2.8)); bag.add('paint_white', B(u - 0.1, u + 1.2, -0.08, 0, F + H1 + 0.82, F + H1 + 0.9)); bag.add('paint_white', B(u + 0.52, u + 0.58, -0.05, 0, F + H1 + 0.9, F + H1 + 2.8));
    bag.add('sandstone_dressed', B(u - 0.12, u + 1.22, -0.05, 0, F + H1 + 2.8, F + H1 + 3.0));
    if (el.kind === 'pub') { bag.add('iron', B(u - 0.15, u + 1.25, -1.0, -0.96, F + H1 + 0.9, F + H1 + 1.0)); }
  }
  if (el.kind === 'pub') { bag.add('iron', B(0.3, L - 0.3, -1.25, -1.2, F + H1 + 0.95, F + H1 + 1.05)); bag.add('timber', B(0.2, L - 0.2, -1.3, 0, F + H1 - 0.1, F + H1 + 0.05)); for (let u = 0.5; u < L - 0.4; u += 0.14) bag.add('iron', B(u, u + 0.02, -1.25, -1.22, F + H1 + 0.05, F + H1 + 0.95)); }   // the hotel's balcony
  bag.add(wall === 'brick' ? 'concrete_light' : 'sandstone_dressed', B(-0.05, L + 0.05, -0.15, Dp + 0.05, top, top + 0.3));
  if (K.parapet === 'step') { bag.add(wall, B(L * 0.3, L * 0.7, -0.05, 0.4, top + 0.3, top + 1.2)); bag.add('concrete_light', B(L * 0.28, L * 0.72, -0.08, 0.43, top + 1.2, top + 1.35)); }
  if (K.parapet === 'cornice') bag.add('concrete_light', B(-0.2, L + 0.2, -0.4, 0.2, top - 0.25, top + 0.3));
  if (K.blade) bag.add(K.blade, B(L - 0.55, L - 0.45, -1.2, 0, fy1 + 0.4, F + H1 + 1.6));
  if (K.pole) for (let k = 0; k < 8; k++) bag.add(['car_red', 'paint_white', 'car_blue', 'paint_white'][k % 4], B(L - 0.5, L - 0.38, -0.5, -0.38, F + 0.9 + k * 0.17, F + 1.07 + k * 0.17));
  const pend = (u, d, h = 0.7, m = 'lamp_white') => { const p = W(u, d, F + H1 - h); bag.add(m, lathe([[0.001, 0], [0.18, 0.1], [0.2, 0.25], [0.1, 0.42], [0.001, 0.42]], 12, null, p[0], p[1], p[2])); bag.add('iron', rod([p[0], F + H1 - 0.3, p[2]], [p[0], p[1] + 0.42, p[2]], 0.01, 4)); };
  const light = (u, d, color = '#ffe2b0') => lights.push({ at: W(u, d, F + H1 - 0.8), color, intensity: 1.5, distance: 6 });
  const fit = { pub, newsagent, greengrocer, milkbar, butcher, chemist, barber }[el.kind] ?? newsagent;
  fit({ bag, col, lights, B, W, R, S, rc, L, Dp, F, T, H1, du, dw, pend, light });
}

/** The public bar: a long timber counter with its brass rail and hand pumps, bottle shelves and a mirror, stools, round tables and stools, a dartboard, a pool table, a jukebox. */
function pub(c) {
  const { bag, col, lights, B, W, S, L, Dp, F, T, pend, light } = c;
  const cu0 = L - T - 1.6, cu1 = L - T - 0.9, c0 = T + 1.2, c1 = Dp - T - 1.2;
  S('timber', cu0, cu1, c0, c1, F, F + 1.05); bag.add('wood_dark', B(cu0 - 0.04, cu0 + 0.0, c0, c1, F + 0.05, F + 1.0)); bag.add('wood_dark', B(cu0 - 0.1, cu1 + 0.08, c0 - 0.08, c1 + 0.08, F + 1.05, F + 1.12));
  bag.add('gilt_bronze', rod(W(cu0 - 0.28, c0, F + 0.22), W(cu0 - 0.28, c1, F + 0.22), 0.025, 6));   // the brass foot rail
  for (let d = c0 + 0.3; d < c1; d += 1.7) { bag.add('gilt_bronze', rod(W(cu0 - 0.28, d, F), W(cu0 - 0.28, d, F + 0.22), 0.02, 5)); }
  for (let d = c0 + 1.0; d < c1 - 0.5; d += 1.6) { const p = W((cu0 + cu1) / 2 + 0.1, d, F + 1.12); bag.add('steel_chrome', lathe([[0.04, 0], [0.04, 0.06], [0.025, 0.1], [0.025, 0.34], [0.001, 0.34]], 8, null, p[0], p[1], p[2])); bag.add('car_black', rod([p[0], p[1] + 0.32, p[2]], [p[0] - 0.02, p[1] + 0.48, p[2]], 0.02, 5)); }   // the hand pumps
  for (let d = c0 + 0.4; d < c1 - 0.2; d += 0.45) bag.add('glass_outer', lathe([[0.04, 0], [0.04, 0.12], [0.001, 0.12]], 8, null, ...W(cu0 + 0.08 - 0.3, d, F + 1.12)));   // glasses on the bar towels
  bag.add('wood_dark', B(cu0 - 0.5 + 0.5, cu1 + 0.1, c0 - 0.1, c0 + 0.1, F, F + 1.2));
  for (let d = c0 + 0.5; d < c1; d += 0.85) { bag.add('steel_chrome', lathe([[0.17, 0], [0.17, 0.03], [0.04, 0.06], [0.035, 0.55], [0.05, 0.6], [0.001, 0.6]], 10, null, ...W(cu0 - 0.55, d, F))); bag.add('leather_bench', lathe([[0.17, 0], [0.18, 0.05], [0.15, 0.08], [0.001, 0.09]], 12, null, ...W(cu0 - 0.55, d, F + 0.6))); }
  // the back bar: a mirror and three shelves of bottles under a clock
  const bu = L - T - 0.05;
  S('wood_dark', bu - 0.45, bu, c0 - 0.1, c1 + 0.1, F, F + 0.9); bag.add('mirror_tin', B(bu - 0.03, bu, c0, c1, F + 1.1, F + 2.6));
  for (const h of [1.3, 1.75, 2.2]) { bag.add('timber', B(bu - 0.3, bu - 0.03, c0, c1, F + h, F + h + 0.04)); for (let d = c0 + 0.15; d < c1 - 0.1; d += 0.22) bag.add(['glaze_green', 'glass_outer', 'glaze_blue', 'car_cream'][Math.round(d * 7) % 4], lathe([[0.045, 0], [0.05, 0.2], [0.02, 0.28], [0.001, 0.3]], 8, null, ...W(bu - 0.16, d, F + h + 0.04))); }
  bag.add('paint_white', lathe([[0.001, 0], [0.26, 0], [0.26, 0.04], [0.001, 0.04]], 16, null, 0, 0, 0).rotateZ(Math.PI / 2).translate(...W(bu - 0.06, (c0 + c1) / 2, F + 2.85)));
  // the public bar's floor: round tables with iron legs and stools, standing space between; ashtrays and a jug of water
  const tbl = (u, d) => { bag.add('iron', lathe([[0.2, 0], [0.2, 0.025], [0.04, 0.04], [0.04, 0.95], [0.001, 0.95]], 10, null, ...W(u, d, F))); bag.add('wood_dark', lathe([[0.001, 0], [0.4, 0], [0.4, 0.04], [0.001, 0.04]], 16, null, ...W(u, d, F + 0.95)));
    col.circle?.(...W(u, d, F).filter((_, i) => i !== 1), 0.42, F, F + 1); for (const a of [0, 2.1, 4.2]) bag.add('leather_bench', lathe([[0.15, 0], [0.16, 0.04], [0.001, 0.05]], 10, null, ...W(u + Math.cos(a) * 0.6, d + Math.sin(a) * 0.6, F + 0.45)));
    for (const a of [0, 2.1, 4.2]) bag.add('iron', lathe([[0.03, 0], [0.03, 0.45]], 6, null, ...W(u + Math.cos(a) * 0.6, d + Math.sin(a) * 0.6, F))); };
  for (const [u, d] of [[T + 1.4, T + 1.8], [T + 1.4, T + 4.2], [T + 3.4, T + 3.0], [T + 3.4, T + 5.4], [T + 1.4, T + 6.6]]) if (d < Dp - T - 1.5 && u < cu0 - 1.4) tbl(u, d);
  // the dartboard on the left wall with its oche, a poster; the pool table at the back
  const dd = Dp * 0.5; bag.add('car_black', lathe([[0.001, 0], [0.24, 0], [0.24, 0.04], [0.001, 0.04]], 20, null, 0, 0, 0).rotateZ(Math.PI / 2).translate(...W(T + 0.06, dd, F + 1.7))); bag.add('car_red', lathe([[0.001, 0], [0.1, 0], [0.1, 0.045], [0.001, 0.045]], 20, null, 0, 0, 0).rotateZ(Math.PI / 2).translate(...W(T + 0.07, dd, F + 1.7)));
  bag.add('timber', B(T + 1.9, T + 2.6, dd - 0.6, dd + 0.6, F + 0.01, F + 0.014));
  const pu = (T + cu0) / 2 - 0.2, pd = Dp - T - 2.0;
  if (pd - 1.6 > Dp * 0.55) { S('wood_dark', pu - 0.9, pu + 0.9, pd - 1.6, pd + 1.6, F + 0.65, F + 0.85); bag.add('cloth_green', B(pu - 0.75, pu + 0.75, pd - 1.45, pd + 1.45, F + 0.85, F + 0.89)); for (const [a, b] of [[-0.8, -1.5], [0.8, -1.5], [-0.8, 1.5], [0.8, 1.5]]) bag.add('wood_dark', B(pu + a - 0.07, pu + a + 0.07, pd + b - 0.07, pd + b + 0.07, F, F + 0.65)); for (const [a, b] of [[-0.3, -0.5], [0.2, 0.3], [0.1, 0.9]]) bag.add(['car_red', 'paint_white', 'paint_cab_yellow'][Math.abs(Math.round(b * 5)) % 3], lathe([[0.001, 0], [0.028, 0.0], [0.028, 0.056], [0.001, 0.056]], 8, null, ...W(pu + a, pd + b, F + 0.89))); pend(pu, pd, 0.9, 'lamp_glass'); }
  // the jukebox in the corner by the door, a cigarette machine
  const ju = T + 0.5, jd = T + 0.7; S('car_blue', ju - 0.4, ju + 0.4, jd - 0.3, jd + 0.2, F, F + 1.25); bag.add('glass_lamp', B(ju - 0.25, ju + 0.25, jd + 0.2, jd + 0.22, F + 0.5, F + 1.0));
  S('car_red', T + 0.1, T + 0.5, Dp - T - 1.6, Dp - T - 0.95, F, F + 1.5); bag.add('steel_chrome', B(T + 0.5, T + 0.52, Dp - T - 1.5, Dp - T - 1.05, F + 0.8, F + 1.3));
  pend((T + cu0) / 2, Dp * 0.25); pend((T + cu0) / 2, Dp * 0.6); pend(L * 0.5, Dp * 0.4, 0.7); light(L * 0.5, Dp * 0.3); light(L * 0.5, Dp * 0.7, '#ffd9a0');
  void col; void lights;
}

/** The newsagent: shelves of magazines down both walls, a rack of the day's papers by the door, a counter at the back with lolly jars and the till, cigarettes behind it. */
function newsagent(c) {
  const { bag, B, W, S, L, Dp, F, T, du, dw, pend, light } = c;
  const MAG = ['car_red', 'cloth_blue', 'paint_cab_yellow', 'paint_white', 'cloth_green', 'cloth_ochre', 'cloth_maroon', 'car_cream'];
  for (const [side, u0] of [[0, T], [1, L - T - 0.35]]) {
    S('wood_painted', u0, u0 + 0.35, T + 1.0, Dp - T - 3.2, F, F + 0.7);
    for (const h of [0.95, 1.3, 1.65, 2.0]) { bag.add('timber', B(u0 + (side ? 0 : 0.0), u0 + 0.3, T + 1.0, Dp - T - 3.2, F + h, F + h + 0.03)); for (let d = T + 1.05; d < Dp - T - 3.25; d += 0.17) bag.add(MAG[(Math.round(d * 11) + h * 7 + side) % 8 | 0], B(side ? u0 + 0.05 : u0 + 0.03, side ? u0 + 0.3 : u0 + 0.28, d, d + 0.14, F + h + 0.03, F + h + 0.31)); }
    for (const d of [T + 1.0, Dp - T - 3.2]) bag.add('wood_painted', B(u0, u0 + 0.35, d - 0.03, d + 0.03, F, F + 2.4));
  }
  // the papers on a rack by the window, the counter across the back with a till, the jars, a scale, the cigarette case behind it
  bag.add('wood_painted', B(du - 1.0, du + 1.0, T + 0.45, T + 0.7, F, F + 1.1)); for (let u = du - 0.9; u < du + 0.9; u += 0.3) bag.add(u > du ? 'paint_white' : 'cloth_grey', B(u, u + 0.26, T + 0.5, T + 0.66, F + 1.1, F + 1.45));
  const cd0 = Dp - T - 2.4, cd1 = Dp - T - 1.7;
  S('wood_painted', T + 1.0, L - T - 1.0, cd0, cd1, F, F + 1.0); bag.add('marble', B(T + 0.95, L - T - 0.95, cd0 - 0.05, cd1 + 0.05, F + 1.0, F + 1.04));
  for (let u = T + 1.4; u < L - T - 1.8; u += 0.32) bag.add(['car_red', 'paint_cab_yellow', 'cloth_green', 'cloth_blue'][Math.round(u * 5) % 4], lathe([[0.001, 0], [0.09, 0.0], [0.1, 0.17], [0.07, 0.2], [0.001, 0.2]], 10, null, ...W(u, cd0 + 0.3, F + 1.04)));   // the lolly jars
  const tu = L / 2; bag.add('steel_chrome', B(tu - 0.22, tu + 0.22, cd0 + 0.1, cd0 + 0.5, F + 1.04, F + 1.3)); bag.add('car_cream', B(tu - 0.2, tu + 0.2, cd0 + 0.1, cd0 + 0.3, F + 1.3, F + 1.4));
  const bd = Dp - T - 0.5; S('wood_painted', T + 1.0, L - T - 1.0, bd - 0.4, bd, F, F + 0.9); for (const h of [1.1, 1.5, 1.9]) { bag.add('timber', B(T + 1.0, L - T - 1.0, bd - 0.38, bd, F + h, F + h + 0.03)); for (let u = T + 1.1; u < L - T - 1.1; u += 0.12) bag.add(MAG[Math.round(u * 13 + h * 3) % 8 | 0], B(u, u + 0.09, bd - 0.2, bd - 0.02, F + h + 0.03, F + h + 0.15)); }
  bag.add('car_black', B(T + 1.0, L - T - 1.0, bd - 0.02, bd, F + 1.1, F + 2.1)); bag.add('paint_white', B(L / 2 - 0.6, L / 2 + 0.6, bd - 0.045, bd - 0.02, F + 2.25, F + 2.55));   // a sign over the shelves
  // a plain rug of lino by the door and a stool
  void dw; pend(L * 0.5, Dp * 0.3); pend(L * 0.5, Dp * 0.65); light(L * 0.5, Dp * 0.35, '#fff0d0'); light(L * 0.5, Dp * 0.7, '#fff0d0');
}

/** The greengrocer: tiers of crates in colours of fruit and vegetables down both walls and in a stand, hanging scales, a counter with a till and brown bags, an onion sack. */
function greengrocer(c) {
  const { bag, B, W, S, L, Dp, F, T, du, pend, light } = c;
  const FR = ['car_red', 'cloth_green', 'paint_cab_yellow', 'cloth_ochre', 'shutter_green', 'cloth_red', 'terracotta', 'cloth_green'];
  const stand = (u0, u1, d0, d1) => { for (const [i, h] of [[0, 0.0], [1, 0.34], [2, 0.68]]) { S('timber', u0 + i * 0.12, u1, d0, d1, F + h, F + h + 0.3); bag.add(FR[(Math.round(u0 * 5 + d0 * 3) + i) % 8], B(u0 + i * 0.12 + 0.03, u1 - 0.03, d0 + 0.03, d1 - 0.03, F + h + 0.3, F + h + 0.4)); } };
  for (let d = T + 1.0; d < Dp - T - 3.2; d += 0.95) { stand(T, T + 0.55, d, d + 0.9); stand(L - T - 0.55, L - T, d, d + 0.9); }
  for (const u of [L * 0.3, L * 0.55]) for (const d of [Dp * 0.35, Dp * 0.5]) if (Math.abs(u - du) > 0.6 || d > Dp * 0.4) { bag.add('timber', B(u - 0.5, u + 0.5, d - 0.3, d + 0.3, F, F + 0.55)); for (let k = 0; k < 4; k++) bag.add(FR[(k + Math.round(u)) % 8], B(u - 0.45 + (k % 2) * 0.46, u - 0.05 + (k % 2) * 0.46, d - 0.25 + (k >> 1) * 0.28, d + 0.0 + (k >> 1) * 0.28, F + 0.55, F + 0.66)); }
  const cd0 = Dp - T - 2.2, cd1 = Dp - T - 1.5;
  S('wood_painted', T + 1.2, L - T - 1.2, cd0, cd1, F, F + 0.95); bag.add('timber', B(T + 1.15, L - T - 1.15, cd0 - 0.05, cd1 + 0.05, F + 0.95, F + 0.99));
  bag.add('steel_chrome', B(L / 2 - 0.2, L / 2 + 0.2, cd0 + 0.1, cd0 + 0.5, F + 0.99, F + 1.2)); bag.add('paint_white', lathe([[0.001, 0], [0.16, 0], [0.16, 0.03], [0.001, 0.03]], 14, null, ...W(L / 2 - 0.9, cd0 + 0.4, F + 1.2)));
  bag.add('steel_chrome', rod(W(L / 2 - 0.9, cd0 + 0.4, F + 0.99), W(L / 2 - 0.9, cd0 + 0.4, F + 1.2), 0.03, 5));
  for (let u = T + 1.4; u < L - T - 2.0; u += 0.45) bag.add('sacking', B(u, u + 0.3, cd0 + 0.1, cd0 + 0.3, F + 0.99, F + 1.2));
  for (const [u, k] of [[T + 0.6, 0], [L - T - 0.7, 1]]) bag.add('sacking', lathe([[0.2, 0], [0.26, 0.2], [0.2, 0.45], [0.001, 0.5]], 10, null, ...W(u, Dp - T - 0.5 - k * 0.5, F)));
  const bd = Dp - T - 0.4; S('wood_painted', T + 1.0, L - T - 1.0, bd - 0.4, bd, F, F + 1.2); bag.add('car_cream', B(L / 2 - 0.8, L / 2 + 0.8, bd - 0.045, bd - 0.02, F + 1.5, F + 1.9));
  pend(L * 0.3, Dp * 0.3, 0.7); pend(L * 0.6, Dp * 0.55, 0.7); light(L * 0.5, Dp * 0.35); light(L * 0.5, Dp * 0.7);
}
void box;
