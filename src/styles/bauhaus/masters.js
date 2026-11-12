// The Masters' Houses, Dessau, 1925–26 (docs/settlements/bauhaus-dessau.md §3, §11): white cubes in the pines, built here as enterable houses —
// a hall with the stair, the living room on the garden, the dining room and kitchen, the north-lit studio; above, bedrooms and bath; a roof terrace.
// The doubles are two mirrored flats round a party wall. Furniture after Breuer, colours after the masters' own schemes. Local frame: frame.js.
import { Fr } from './frame.js';
import { S, rng, slab, rail } from './kit.js';

const Y0 = 0.3, H = 3.0, YF = Y0 + H + 0.3, YR = YF + H + 0.3;   // ground floor, first floor, roof slab
const COL = { gropius: ['paint_white', 'car_blue'], moholy: ['stucco_cream', 'car_red'], muche: ['stucco_pale', 'paint_cab_yellow'], kandinsky: ['stucco_rose', 'car_blue'] };

function chair(F, u, v, dir, y, seat = 'wood_painted') {
  F.b(seat, u - 0.21, u + 0.21, y + 0.44, y + 0.47, v - 0.21, v + 0.21);
  const s = dir === 'v+' ? [-0.21, 0.21, -0.23, -0.2] : dir === 'v-' ? [-0.21, 0.21, 0.2, 0.23] : dir === 'u+' ? [-0.23, -0.2, -0.21, 0.21] : [0.2, 0.23, -0.21, 0.21];
  F.b(seat, u + s[0], u + s[1], y + 0.5, y + 0.85, v + s[2], v + s[3]);
  for (const [a, b] of [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]]) F.b('steel_chrome', u + a - 0.01, u + a + 0.01, y, y + 0.44, v + b - 0.01, v + b + 0.01);
}
function club(F, u, v, dir, y, c) {            // a Breuer club chair: tubular frame, cloth seat and back
  F.b('steel_chrome', u - 0.38, u + 0.38, y + 0.05, y + 0.09, v - 0.38, v + 0.38); F.b(c, u - 0.34, u + 0.34, y + 0.09, y + 0.4, v - 0.34, v + 0.34);
  const s = dir === 'v+' ? [-0.34, 0.34, -0.38, -0.2] : dir === 'v-' ? [-0.34, 0.34, 0.2, 0.38] : dir === 'u+' ? [-0.38, -0.2, -0.34, 0.34] : [0.2, 0.38, -0.34, 0.34];
  F.b(c, u + s[0], u + s[1], y + 0.4, y + 0.8, v + s[2], v + s[3]); F.k(u - 0.4, u + 0.4, y, y + 0.8, v - 0.4, v + 0.4);
}
function table(F, u0, u1, v0, v1, y, h = 0.76, top = 'wood_ochre') {
  F.b(top, u0, u1, y + h - 0.04, y + h, v0, v1);
  for (const [a, b] of [[u0 + 0.05, v0 + 0.05], [u1 - 0.05, v0 + 0.05], [u0 + 0.05, v1 - 0.05], [u1 - 0.05, v1 - 0.05]]) F.b('steel_chrome', a - 0.012, a + 0.012, y, y + h - 0.04, b - 0.012, b + 0.012);
  F.k(u0, u1, y, y + h, v0, v1);
}
const cup = (F, u0, u1, v0, v1, y, h, mat = 'wood_painted') => { F.s(mat, u0, u1, y, y + h, v0, v1); };
const rugs = (F, u0, u1, v0, v1, y, c, c2) => { F.b(c, u0, u1, y + 0.012, y + 0.02, v0, v1); F.b(c2, u0 + 0.15, u1 - 0.15, y + 0.02, y + 0.026, v0 + 0.15, v1 - 0.15); };
function books(F, u0, u1, v, y, h, r) { cup(F, u0, u1, v, v + 0.32, y, h); for (let k = 0; k < 4; k++) { const yy = y + 0.3 + k * (h - 0.4) / 4; F.b('timber', u0, u1, yy, yy + 0.025, v - 0.005, v + 0.01); for (let u = u0 + 0.05; u < u1 - 0.1; u += 0.07 + r() * 0.05) F.b(['cloth_red', 'cloth_blue', 'cloth_brown', 'cloth_green', 'paint_white', 'cloth_ochre'][Math.floor(r() * 6)], u, u + 0.05 + r() * 0.04, yy + 0.025, yy + 0.25 + r() * 0.06, v - 0.03, v + 0.02); } }
function lamp(F, u, y, v, light = true) { F.rod('steel_chrome', u, y, v, u, y + 1.5, v, 0.012); F.lathe('lamp_white', [[0.001, 0], [0.12, 0.05], [0.18, 0.2], [0.001, 0.3]], u, y + 1.5, v, 10); if (light) F.light(u, y + 1.7, v, '#ffe9c0', 1.6, 8); }
function bedIn(F, u, v, y, c, along = 'v') {
  if (along === 'v') { F.b('wood_painted', u - 0.5, u + 0.5, y + 0.25, y + 0.5, v, v + 2.0); F.b('cloth_white', u - 0.46, u + 0.46, y + 0.5, y + 0.6, v + 0.05, v + 1.95); F.b(c, u - 0.48, u + 0.48, y + 0.6, y + 0.66, v + 0.6, v + 1.97); F.b('cloth_white', u - 0.4, u + 0.4, y + 0.6, y + 0.7, v + 0.08, v + 0.5); F.b('wood_painted', u - 0.5, u + 0.5, y + 0.25, y + 0.8, v - 0.04, v); F.k(u - 0.5, u + 0.5, y, y + 0.7, v, v + 2.0); }
  else { F.b('wood_painted', u, u + 2.0, y + 0.25, y + 0.5, v - 0.5, v + 0.5); F.b('cloth_white', u + 0.05, u + 1.95, y + 0.5, y + 0.6, v - 0.46, v + 0.46); F.b(c, u + 0.6, u + 1.97, y + 0.6, y + 0.66, v - 0.48, v + 0.48); F.b('cloth_white', u + 0.08, u + 0.5, y + 0.6, y + 0.7, v - 0.4, v + 0.4); F.k(u, u + 2.0, y, y + 0.7, v - 0.5, v + 0.5); }
}

/** One flat in its frame: W wide (the party wall at u = W), 20 deep. */
function flat(F, W, who, r, single) {
  const D = F.D, [wall, accent] = COL[who], T = 0.3, DR = 2.3, glassM = 'glass_outer', fr = 'steel_grey', sk = F.sk;
  // the shell: a plinth, the walls of both floors with ribbon windows to the garden (south front) and the studio window in the north
  F.b('concrete_light', -0.05, W + 0.05, 0, Y0, -0.05, D + 0.05); F.floor(0.3, W - 0.3, T, D - T, Y0);
  const front = [{ u0: W - 1.55, u1: W - 0.55, y0: Y0 + 0.2, y1: YR - 0.4, glass: glassM, frame: fr }];
  const doorU = W - 2.9;
  front.push({ u0: doorU - 0.5, u1: doorU + 0.5, y1: Y0 + DR });
  const lr0 = 0.8, lr1 = doorU - 0.9, per = Math.max(1, Math.floor((lr1 - lr0) / 2.6));
  for (let i = 0; i < per; i++) { const a = lr0 + i * (lr1 - lr0) / per, b = a + (lr1 - lr0) / per - 0.4; front.push({ u0: a, u1: b, y0: Y0 + 0.5, y1: Y0 + 2.5, glass: glassM, frame: fr }, { u0: a, u1: b, y0: YF + 0.55, y1: YF + 2.4, glass: glassM, frame: fr }); }
  front.push({ u0: doorU + 0.9, u1: doorU + 1.3, y0: YF + 0.6, y1: YF + 2.4, glass: glassM, frame: fr });
  F.wall({ u0: 0, u1: W, v: 0, th: T, y0: Y0, y1: YR, mat: wall, ops: front });
  F.wall({ u0: 0, u1: W, v: D - T, th: T, y0: Y0, y1: YR, mat: wall, ops: [{ u0: 0.8, u1: W - 0.8, y0: Y0 + 0.9, y1: Y0 + 2.85, glass: glassM, frame: fr }, { u0: 0.8, u1: W - 0.8, y0: YF + 0.9, y1: YF + 2.6, glass: glassM, frame: fr }] });
  F.wall({ u0: 0, u1: T, v: T, th: D - 2 * T, y0: Y0, y1: YR, mat: wall, ops: [] });
  F.s(wall, W - T, W, Y0, YR, T, D - T);
  // floors, ceilings and the roof; the stair hole in the first floor
  const sU0 = W - 1.7, sU1 = W - 0.4, sV0 = 3.2, sV1 = 8.4, hole = F._r(sU0, sU1, sV0 - 0.05, sV1);
  slab(sk, F._r(0, W, 0, D), YF, [hole], { mat: 'concrete_light', th: 0.3 });
  slab(sk, F._r(0, W, 0, D), YR, [], { mat: 'concrete_light', th: 0.3 });
  F.b('wood_ochre', T, W - T, Y0 - 0.02, Y0 + 0.012, T, D - T); F.b('wood_ochre', T, W - T, YF - 0.02, YF + 0.012, T, D - T);
  F.b('plaster_white', T, W - T, Y0 + H - 0.03, Y0 + H, T, D - T);
  // the stair, climbing toward the back (north), with a rail round the hole
  const n = 19, rise = YF - Y0, dv = (sV1 - sV0) / n;
  for (let i = 0; i < n; i++) F.b('concrete_light', sU0, sU1, Y0 - 0.02, Y0 + rise * (i + 1) / n, sV0 + i * dv, sV0 + (i + 1) * dv);
  sk.col.ramp(F._r(sU0, sU1, sV0, sV1), Y0, YF, 'n');
  const p = (u, v) => F.at(u, v);
  rail(sk, p(sU0, sV0 - 0.05), p(sU1, sV0 - 0.05), YF, 'steel_chrome'); rail(sk, p(sU0, sV0 - 0.05), p(sU0, sV1), YF, 'steel_chrome');
  F.rod('steel_chrome', sU0 + 0.03, Y0 + 0.95, sV0, sU0 + 0.03, YF + 0.95, sV1, 0.022, 5);
  // the roof: asphalt, parapet; a terrace with deck chairs on the garden side
  F.b('asphalt', 0.1, W - 0.1, YR, YR + 0.03, 0.1, D - 0.1);
  const par = (u0, u1, v0, v1) => F.s(wall, u0, u1, YR, YR + 0.6, v0, v1);
  par(0, W, 0, 0.2); par(0, W, D - 0.2, D); par(0, 0.2, 0.2, D - 0.2); par(W - 0.2, W, 0.2, D - 0.2);
  F.b('concrete_light', -0.04, W + 0.04, YR + 0.6, YR + 0.65, -0.04, 0.24); F.b('concrete_light', -0.04, W + 0.04, YR + 0.6, YR + 0.65, D - 0.24, D + 0.04);
  F.s('concrete_light', 1, 3.2, YR + 0.03, YR + 0.07, 1.0, 3.0);
  for (const u of [1.6, 2.6]) { F.b('wood_ochre', u - 0.25, u + 0.25, YR + 0.35, YR + 0.4, 1.2, 2.5); F.b('cloth_red', u - 0.22, u + 0.22, YR + 0.4, YR + 0.43, 1.25, 2.45); }
  // the doorway, canopy, soffit and downpipe in colour; the door in its colour
  F.b(accent, doorU - 0.55, doorU + 0.55, Y0, Y0 + DR + 0.1, -0.04, 0.12); F.b('wood_dark', doorU - 0.4, doorU + 0.4, Y0 + 1.0, Y0 + 1.1, -0.08, -0.04);
  F.b('concrete_light', doorU - 1.5, doorU + 1.5, Y0 + 2.7, Y0 + 2.85, -1.6, 0); F.k(doorU - 1.5, doorU + 1.5, Y0 + 2.7, Y0 + 2.85, -1.6, 0);
  F.b('paint_cab_yellow', doorU - 1.5, doorU + 1.5, Y0 + 2.66, Y0 + 2.7, -1.6, 0); F.b('steel_grey', doorU - 1.5, doorU - 1.46, Y0 + 2.85, Y0 + 3.4, -1.6, -1.58); F.rod('steel_chrome', doorU - 1.45, Y0 + 2.7, -1.55, doorU - 1.45, Y0, -1.55, 0.03, 5); F.b('concrete_light', doorU - 1.6, doorU + 1.6, 0, 0.18, -1.8, -0.04);
  F.b(accent, -0.04, 0.0, Y0, YR, -0.1, -0.04); F.b(accent, W - 0.12, W - 0.02, Y0, YR, -0.1, -0.02);
  // a balcony on the first floor over the garden front
  F.b('concrete_light', 0.9, doorU - 0.9, YF - 0.3, YF - 0.12, -1.3, 0); F.b(accent, 0.9, doorU - 0.9, YF - 0.12, YF - 0.1, -1.3, 0);
  for (let u = 0.95; u < doorU - 0.85; u += 0.22) F.b('steel_chrome', u, u + 0.012, YF - 0.12, YF + 0.95, -1.28, -1.26);
  F.b('steel_chrome', 0.9, doorU - 0.9, YF + 0.95, YF + 0.98, -1.3, -1.25); F.b('steel_chrome', 0.9, 0.95, YF - 0.12, YF + 0.98, -1.3, 0); F.b('steel_chrome', doorU - 0.95, doorU - 0.9, YF - 0.12, YF + 0.98, -1.3, 0);
  F.k(0.9, doorU - 0.9, YF - 0.3, YF + 0.95, -1.3, -1.25);
  for (let v = -3.3; v < -1.7; v += 0.8) F.b('flagstone', doorU - 0.5, doorU + 0.5, 0, 0.04, v, v + 0.7);
  for (let u = 0; u < W; u += 2.0) { if (Math.abs(u + 1 - doorU) < 1.3) continue; F.b('iron', u, u + 0.03, 0, 0.9, -3.3, -3.27); F.b('iron', u, u + 2.0, 0.85, 0.88, -3.3, -3.27); }
  F.b('cloth_green', 0, doorU - 1.4, 0, 0.7, -3.6, -3.1); F.b('cloth_green', doorU + 1.4, W, 0, 0.7, -3.6, -3.1); F.b('paint_cab_yellow', doorU + 1.1, doorU + 1.3, 0.9, 1.2, -3.3, -3.1);
  F.b('plaster_streak', 0.9, doorU - 0.9, YF - 0.3 - 1.0, YF - 0.32, -0.03, 0.01); F.b('plaster_damp', 0.05, W - 0.05, Y0, Y0 + 0.4, -0.03, 0.01);
  // GROUND: hall, living room, dining and kitchen, studio
  const y = Y0;
  F.wall({ u0: T, u1: W - T, v: 7.2, th: 0.2, y0: y, y1: y + H, mat: 'plaster_white', ops: [{ u0: 1.2, u1: 2.2, y1: y + 2.2 }, { u0: sU0 - 0.05, u1: sU1 + 0.05, y1: y + H + 0.3 }] });
  F.wall({ u0: T, u1: W - T, v: 11.4, th: 0.2, y0: y, y1: y + H, mat: 'plaster_white', ops: [{ u0: W * 0.4, u1: W * 0.4 + 1.0, y1: y + 2.2 }, { u0: W - 2.3, u1: W - 1.4, y1: y + 2.2 }] });
  F.b('wood_dark', doorU + 0.6, doorU + 1.4, y + 1.7, y + 1.74, T + 0.05, T + 0.1); for (let i = 0; i < 4; i++) F.b(['cloth_brown', 'cloth_grey', 'cloth_indigo', 'cloth_black'][i], doorU + 0.65 + i * 0.18, doorU + 0.8 + i * 0.18, y + 0.8, y + 1.7, T + 0.05, T + 0.12);
  F.b('wood_painted', doorU - 0.3, doorU + 0.5, y + 0.42, y + 0.46, 1.8, 2.8); F.k(doorU - 0.3, doorU + 0.5, y, y + 0.46, 1.8, 2.8);
  // the living room on the garden: Breuer table and chairs, club chairs round a rug, a sideboard and a bookcase, a lamp
  const lw = doorU - 1.4;
  rugs(F, 0.8, lw - 0.4, 0.9, 4.6, y, r() < 0.5 ? 'cloth_red' : 'cloth_indigo', 'cloth_ochre');
  club(F, 1.6, 2.2, 'v-', y, 'cloth_ochre'); club(F, 3.0, 2.2, 'v-', y, 'cloth_blue'); table(F, 1.8, 2.8, 3.0, 3.6, y, 0.45, 'wood_dark');
  table(F, lw - 1.6, lw - 0.4, 5.3, 6.6, y, 0.76, 'wood_painted'); for (const [u, v, d] of [[lw - 2.0, 5.6, 'u-'], [lw - 2.0, 6.3, 'u-'], [lw - 1.0, 5.0, 'v+'], [lw - 1.0, 6.9, 'v-']]) chair(F, u, v, d, y);
  books(F, 0.35, 0.35 + Math.min(3.0, lw - 1), 6.7, y, 2.1, r);
  cup(F, 0.4, 1.4, 0.4, 0.9, y, 0.7, 'wood_painted'); lamp(F, 0.9, y + 0.7, 0.6, false); lamp(F, 4.0, y, 2.0, false);
  F.b(accent, 0.31, 0.34, y + 0.0, y + 3.0, 1.0, 4.6);             // the master's colour on the inner wall
  F.b('paint_cab_yellow', 0.31, 0.34, y + 1.0, y + 1.8, 1.4, 3.0); F.b('car_red', 0.31, 0.34, y + 1.3, y + 2.2, 2.4, 3.6);   // a wall painting (Klee, Kandinsky; the colours are the school's)
  // dining and kitchen
  table(F, 0.9, 2.5, 8.4, 9.6, y, 0.76, 'paint_white'); for (const [u, v, d] of [[0.7, 8.7, 'u+'], [0.7, 9.3, 'u+'], [2.7, 9.0, 'u-'], [1.7, 10.0, 'v-']]) chair(F, u, v, d, y);
  cup(F, 3.6, W - 2.3, 10.7, 11.3, y, 0.9, 'glaze_white'); F.b('steel_chrome', 3.6, W - 2.3, y + 0.9, y + 0.93, 10.7, 11.3); F.s('iron', W - 4.5, W - 3.5, y, y + 0.9, 10.7, 11.3);
  cup(F, 3.6, 4.4, 7.4, 8.1, y, 2.0, 'wood_painted');
  // the studio: a drafting table under the north light, an easel, a long table of work, shelves, a couch
  table(F, 1.0, 3.0, 17.4, 18.4, y, 0.9, 'paint_white'); F.b('paint_white', 1.0, 3.0, y + 0.9, y + 1.1, 17.6, 18.2); chair(F, 2.0, 16.9, 'v+', y);
  for (let k = 0; k < 2; k++) { const u = W * (0.55 + 0.2 * k); for (const a of [-0.35, 0, 0.35]) F.rod('timber', u + a, y + 1.7, 15.0, u + a * 1.6, y, 15.0 + (a === 0 ? 0.5 : -0.3), 0.018); F.b('paint_white', u - 0.4, u + 0.4, y + 0.9, y + 1.5, 14.95, 14.98); F.b([accent, 'car_red', 'paint_cab_yellow'][k], u - 0.3, u + 0.05, y + 1.0, y + 1.35, 14.93, 14.95); F.k(u - 0.5, u + 0.5, y, y + 1.7, 14.9, 15.6); }
  books(F, 0.35, 0.35 + 3.0, 12.2, y, 2.2, r); table(F, W - 3.6, W - 0.5, 13.0, 13.8, y, 0.78, 'wood_painted'); for (let i = 0; i < 5; i++) F.b(['car_red', 'car_blue', 'paint_cab_yellow', 'cloth_green', 'paint_white'][i], W - 3.5 + i * 0.6, W - 3.1 + i * 0.6, y + 0.78, y + 0.82, 13.1, 13.7);
  F.s('wood_painted', W - 2.6, W - 0.4, y, y + 0.45, 18.0, 19.5); F.b('cloth_ochre', W - 2.56, W - 0.44, y + 0.45, y + 0.58, 18.02, 19.48);
  F.light(W * 0.5, y + 2.7, 15.0, '#fff2d8', 1.8, 9); F.light(2.5, y + 2.7, 3.0, '#ffe6bc', 1.6, 8);
  // FIRST FLOOR: the parents' bedroom on the garden, a room for the children, the bath, the working room on the north
  const yb = YF;
  F.wall({ u0: T, u1: W - T, v: 7.2, th: 0.2, y0: yb, y1: yb + H, mat: 'plaster_white', ops: [{ u0: 1.2, u1: 2.2, y1: yb + 2.2 }, { u0: sU0 - 0.05, u1: W - T, y1: yb + H + 0.3 }] });
  F.wall({ u0: T, u1: W - T, v: 11.4, th: 0.2, y0: yb, y1: yb + H, mat: 'plaster_white', ops: [{ u0: W * 0.4, u1: W * 0.4 + 1.0, y1: yb + 2.2 }, { u0: W - 2.3, u1: W - 1.4, y1: yb + 2.2 }] });
  const bu = Math.min(2.4, (doorU - 1) / 2), sheet = ['cloth_red', 'cloth_ochre', 'cloth_blue', 'cloth_green'];
  bedIn(F, bu, 1.2, yb, sheet[Math.floor(r() * 4)]); bedIn(F, bu + 1.4, 1.2, yb, sheet[Math.floor(r() * 4)]); cup(F, 0.4, 1.2, 4.4, 6.4, yb, 2.2); rugs(F, 1.0, doorU - 1.2, 3.6, 5.8, yb, 'cloth_indigo', 'cloth_white');
  bedIn(F, 1.6, 8.0, yb, sheet[Math.floor(r() * 4)]); cup(F, 0.4, 0.9, 10.0, 11.2, yb, 2.2); F.s('glaze_white', W - 3.6, W - 1.6, yb, yb + 0.55, 8.0, 9.2); F.b('water', W - 3.5, W - 1.7, yb + 0.5, yb + 0.52, 8.1, 9.1); F.s('glaze_white', W - 1.3, W - 0.4, yb, yb + 0.85, 10.3, 10.9);
  table(F, 1.0, 2.8, 12.4, 13.2, yb, 0.76, 'wood_painted'); chair(F, 1.9, 13.7, 'v-', yb); books(F, W - 3.5, W - 0.5, 12.3, yb, 2.0, r); bedIn(F, W - 2.0, 15.0, yb, 'cloth_ochre'); cup(F, 0.4, 1.4, 18.6, 19.6, yb, 2.2);
  void single; void sk;
}

/** bauhaus_master: { rect, kind ('single' | 'double'), id, seed } — the house, its garden fence and hedge, the path to the door. */
export function masterHouse(el, ctx) {
  const sk = new S(ctx), r = rng(el.seed * 31 + 5), [x0, z0, x1, z1] = el.rect, id = el.id || 'gropius';
  if (el.kind === 'double') {
    const mid = (x0 + x1) / 2;
    flat(new Fr(sk, [x0, z0, mid, z1], 's', false), mid - x0, id, r, false);
    flat(new Fr(sk, [mid, z0, x1, z1], 's', true), x1 - mid, id, r, false);
  } else flat(new Fr(sk, [x0, z0, x1, z1], 's', false), x1 - x0, id, r, true);
}
