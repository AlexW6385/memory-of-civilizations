// The houses of Shazhou, hollow and furnished (docs/settlements/dunhuang.md §6b): rammed-earth houses along the
// street, every one with its door open and a room behind it — a shop of its trade on the main street (counter,
// shelves, goods), a home of earth kang, stove, chests and mats in the lanes, a stair to the upper room where there
// is one, and a back door to the walled yard. The fronts are dressed at eye level (a banner, shutters, goods on
// the trestle, jars, a bench, firewood, hung gourds and garlic, a lamp), the earth weathered (patches of mended
// plaster, the foot eaten by salt, rain streaks, cracks) and the flat roofs carry what a roof carries in a
// desert town (fodder, drying mats, jars, a ladder, the chimney pots).
import { box, lathe, fromTriangles, quad, rod } from '../../core/geom.js';
import { rng } from '../../settlements/dunhuang/layout.js';
import { figure } from '../../objects/figures.js';
import { oilLamp } from './caves.js';

const WALL = 'earth_wall', FOOT = 'banco_rough';
const CLOTHS = ['cloth_red', 'cloth_blue', 'cloth_ochre', 'cloth_green', 'cloth_white', 'cloth_indigo', 'cloth_brown'];
/** The trades of the main street: [trade, banner cloth]. */
export const TRADES = {
  cloth: 'cloth_red', grain: 'cloth_ochre', pottery: 'cloth_blue', smith: 'cloth_black', bake: 'cloth_white',
  wine: 'cloth_green', scribe: 'cloth_indigo', saddler: 'cloth_brown', drugs: 'cloth_red',
};

export function makeHouse({ frame, gable }) {
  return function house(el, ctx) {
    const { bag, col } = ctx, rand = rng(el.seed || 1), f = frame(el.rect, el.front);
    const W = f.W, D = f.D, tiled = !!el.tiled, two = el.storeys === 2, trade = el.trade && TRADES[el.trade] ? el.trade : null;
    const Dh = Math.min(D - 3, 5.4 + rand() * 1.4), H = two ? 6.0 : 3.2 + rand() * 0.4, th = 0.5, HF = two ? 3.0 : H;
    const R = (u0, v0, u1, v1) => f.rc(u0, v0, u1, v1);
    const B = (m, u0, v0, u1, v1, y0, y1) => { const r = R(u0, v0, u1, v1); bag.add(m, box(r[0], y0, r[1], r[2], y1, r[3])); };
    const S = (m, u0, v0, u1, v1, y0, y1) => { const r = R(u0, v0, u1, v1); bag.add(m, box(r[0], y0, r[1], r[2], y1, r[3])); col.rect(r, y0, y1); };
    const P = (u, v) => f.P(u, v);
    const jar = (m, u, v, y, r, h, solid = true) => { const [x, z] = P(u, v); bag.add(m, lathe([[0.001, 0], [r * 0.6, 0.01], [r, h * 0.38], [r * 0.82, h * 0.82], [r * 0.5, h], [r * 0.58, h * 1.04], [0.001, h * 1.04]], 9, null, x, y, z)); if (solid) col.circle(x, z, r, y, y + h); };
    const post = (m, u, v, y0, y1, r = 0.07) => { const [x, z] = P(u, v); bag.add(m, rod([x, y0, z], [x, y1, z], r, 6)); };
    const yaw = Math.atan2(-f.dir[0], -f.dir[1]);          // facing the street
    const fig = (u, v, y, rot, o) => figure({ at: P(u, v), y, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: CLOTHS[Math.floor(rand() * 7)], over: 'sash', skin: 'skin_medium', hat: 'cap', hair: 'short', feet: 'shod', ...o }, ctx);

    // ── the shell: footing, walls with the door cut in the front and a back door to the yard, the ceiling
    const dw = 1.15, dh = 2.1, shop = !!trade;
    const du = Math.max(1.3 + (shop ? 1.4 : 0), Math.min(W - 1.3 - (shop ? 0 : 0), W * (0.28 + 0.44 * rand())));
    const ru = W - du > W / 2 ? W - 1.2 : 1.2;               // the back door at the far side
    const sideL = shop ? 1.9 : 0;                             // a shop's open front: counter beside the door, on its left
    S(FOOT, 0, 0, du - dw / 2 - sideL, 0.14, 0, 0.55); S(FOOT, du + dw / 2, 0, W, 0.14, 0, 0.55);                          // the foot of the front, a course of rubble
    // front wall pieces
    const fw = (u0, u1) => { if (u1 - u0 > 0.05) S(WALL, u0, 0, u1, th, 0.55, H); };
    fw(0, du - dw / 2 - sideL); fw(du + dw / 2, W);
    if (shop) { S(WALL, du - dw / 2 - sideL, 0, du - dw / 2, th, 0.55, 0.95); S('timber', du - dw / 2 - sideL - 0.05, -0.12, du - dw / 2 + 0.05, th + 0.05, 0.95, 1.05); S(WALL, du - dw / 2 - sideL, 0, du - dw / 2, th, 2.5, H); }
    S(WALL, du - dw / 2, 0, du + dw / 2, th, dh, H);
    S(FOOT, 0, 0, th, Dh, 0, 0.55); S(FOOT, W - th, 0, W, Dh, 0, 0.55);
    S(WALL, 0, th, th, Dh, 0.55, H); S(WALL, W - th, th, W, Dh, 0.55, H);
    // the back wall with its door
    S(FOOT, 0, Dh - th, ru - 0.55, Dh, 0, 0.55); S(FOOT, ru + 0.55, Dh - th, W, Dh, 0, 0.55);
    S(WALL, 0, Dh - th, ru - 0.55, Dh, 0.55, H); S(WALL, ru + 0.55, Dh - th, W, Dh, 0.55, H); S(WALL, ru - 0.55, Dh - th, ru + 0.55, Dh, 2.0, H);
    // the floor of beaten earth with a mat or two, the ceiling of poles and brush under the roof
    B('mudbrick', th, th, W - th, Dh - th, -0.03, 0.08); col.floor(R(th, th, W - th, Dh - th), 0.08);
    B('mudbrick', du - dw / 2, -0.7, du + dw / 2, th, -0.03, 0.08); col.floor(R(du - dw / 2, -0.7, du + dw / 2, th), 0.08);   // the threshold
    if (shop) { B('mudbrick', du - dw / 2 - sideL, -0.9, du - dw / 2, -0.02, -0.03, 0.12); }                                   // the step before the counter
    B('mudbrick', ru - 0.55, Dh, ru + 0.55, Dh + 0.7, -0.03, 0.08); col.floor(R(ru - 0.55, Dh, ru + 0.55, Dh + 0.7), 0.08);
    const ceil = (y) => { B(FOOT, 0, 0, W, Dh, y, y + 0.25); for (let u = 0.6; u < W - 0.3; u += 0.55) B('timber', u - 0.07, th, u + 0.07, Dh - th, y - 0.16, y); B('timber', th, Dh * 0.5 - 0.1, W - th, Dh * 0.5 + 0.1, y - 0.28, y); };
    ceil(HF);
    // the doorways: frames of red timber, the leaf folded back against the wall inside
    const frameDoor = (u, v, w, h, vv) => { B('timber_red', u - w / 2 - 0.1, v - 0.05, u - w / 2 + 0.03, v + 0.22, 0.04, h + 0.12); B('timber_red', u + w / 2 - 0.03, v - 0.05, u + w / 2 + 0.1, v + 0.22, 0.04, h + 0.12); B('timber_red', u - w / 2 - 0.1, v - 0.05, u + w / 2 + 0.1, v + 0.22, h, h + 0.12); void vv; };
    frameDoor(du, 0, dw, dh);
    B('wood_dark', du + dw / 2 + 0.05, th, du + dw / 2 + 0.9, th + 0.06, 0.05, dh - 0.05);
    frameDoor(ru, Dh - th, 1.1, 2.0);
    // windows: lattice set into the front, with a sill, either side of the door
    const win = (u, w, h, y0) => { B('timber_red', u - w / 2 - 0.08, -0.04, u + w / 2 + 0.08, 0.1, y0 - 0.08, y0); B('timber_red', u - w / 2 - 0.08, -0.04, u + w / 2 + 0.08, 0.1, y0 + h, y0 + h + 0.08); B('timber_red', u - w / 2 - 0.08, -0.04, u - w / 2, 0.1, y0, y0 + h); B('timber_red', u + w / 2, -0.04, u + w / 2 + 0.08, 0.1, y0, y0 + h); B('lattice', u - w / 2, 0.0, u + w / 2, 0.06, y0, y0 + h); };
    if (!shop) for (const wu of [W * 0.12, W * 0.88]) if (Math.abs(wu - du) > 1.3 && wu > 0.9 && wu < W - 0.9) win(wu, 0.8, 0.8, 1.3);
    else if (shop && W - du > 3.0) win(Math.min(W - 1.0, du + 2.4), 0.8, 0.7, 1.5);

    // ── the roof
    if (tiled) { B(WALL, 0, 0, W, Dh, H, H + 0.12); gable(ctx, R(0, 0, W, Dh), H + 0.12, 1.3 + W * 0.08); }
    else {
      B(FOOT, 0, 0, W, Dh, H, H + 0.25); col.floor(R(0.3, 0.3, W - 0.3, Dh - 0.3), H + 0.25);
      // the parapet, broken in places where it has fallen; the beam ends under the front eave; a spout
      const par = (u0, v0, u1, v1) => { const r = R(u0, v0, u1, v1); bag.add(WALL, box(r[0], H + 0.25, r[1], r[2], H + 0.7 - 0.12 * rand(), r[3])); };
      par(0, 0, W, 0.3); par(0, Dh - 0.3, W, Dh); par(0, 0, 0.3, Dh); par(W - 0.3, 0, W, Dh);
      const nb = Math.floor(W / 0.7);
      for (let k = 0; k < nb; k++) { const u = 0.4 + k * (W - 0.8) / Math.max(1, nb - 1); B('timber', u - 0.08, -0.3, u + 0.08, 0.1, HF - 0.2, HF - 0.06); }
      B('wood_dark', W * 0.7, -0.35, W * 0.7 + 0.18, 0.1, H + 0.05, H + 0.12);
      roofLife();
    }
    function roofLife() {
      const y = H + 0.25, k = rand();
      if (k < 0.3) { const [x, z] = P(W * (0.3 + 0.4 * rand()), Dh * 0.55); bag.add('thatch', lathe([[0.001, 0], [1.0, 0], [0.92, 0.5], [0.5, 0.95], [0.001, 1.15]], 9, null, x, y, z)); }       // a stack of fodder
      else if (k < 0.55) { const u = W * (0.25 + 0.3 * rand()); B('reed_mat', u, Dh * 0.3, u + 1.8, Dh * 0.3 + 1.2, y, y + 0.03); for (let j = 0; j < 8; j++) B(['cloth_ochre', 'cloth_red', 'cloth_brown'][j % 3], u + 0.15 + (j % 4) * 0.42, Dh * 0.3 + 0.2 + Math.floor(j / 4) * 0.5, u + 0.45 + (j % 4) * 0.42, Dh * 0.3 + 0.5 + Math.floor(j / 4) * 0.5, y + 0.03, y + 0.1); }   // apricots, jujubes and grain drying
      else if (k < 0.75) { jar('pottery_dark', W * 0.6, Dh * 0.5, y, 0.32, 0.8, false); jar('pottery_dark', W * 0.6 + 0.7, Dh * 0.6, y, 0.26, 0.6, false); }
      else { const [x0, z0] = P(W * 0.15, Dh * 0.8), [x1, z1] = P(W * 0.15, Dh * 0.8 - 0.1); for (let j = 0; j < 5; j++) bag.add('log_pine', rod([x0 + j * 0.05, y, z0 + j * 0.04], [x1 + f.dir[0] * -0.3, y + 0.5 + j * 0.05, z1], 0.06, 5)); }
      // the roof door and a chimney pot
      B(WALL, W * 0.2, Dh * 0.4, W * 0.2 + 0.5, Dh * 0.4 + 0.5, y, y + 0.7);
      const [cx, cz] = P(W * 0.8, Dh * 0.7); bag.add('pottery_dark', lathe([[0.001, 0], [0.22, 0], [0.2, 0.5], [0.26, 0.58], [0.2, 0.62], [0.001, 0.62]], 8, null, cx, y, cz));
      // a ladder up the side wall to the roof (rods), one house in three
      if (rand() < 0.33) { const [lx, lz] = P(W + 0.0, Dh * 0.3); for (const s of [-0.2, 0.2]) bag.add('log_pine', rod([lx + f.dir[1] * s * 1.0 + 0.1, 0, lz + f.dir[0] * s * -1.0], [lx + f.dir[1] * s + 0.1, H + 0.6, lz - f.dir[0] * s], 0.04, 5)); }
    }

    // ── the second storey: a stair along the side wall (rising away from the street), the floor with its hole, the room above
    if (two) {
      const y1 = 3.0, vTop = Dh - 1.5, asc = { s: 'n', n: 's', w: 'e', e: 'w' }[el.front];
      B('timber', th, th, W - th, Dh - th, y1 - 0.0, y1 + 0.12);
      const r0 = R(th, th, 1.7, vTop);
      void r0;
      const steps = 15;
      for (let k = 0; k < steps; k++) { const v0 = 0.7 + (vTop - 0.7) * k / steps, v1 = 0.7 + (vTop - 0.7) * (k + 1) / steps; B('timber', th, v0, 1.7, v1, 0, 0.2 + (y1 + 0.12 - 0.2) * (k + 1) / steps); }
      col.ramp(R(th, 0.7, 1.7, vTop), 0.08, y1 + 0.12, asc);
      // the hole: the floor above (already laid whole) is cut by laying the ceiling pieces instead — the floor is built in pieces
      // (see below); the stair's well is left open
      col.floor(R(1.7, th, W - th, Dh - th), y1 + 0.12); col.floor(R(th, vTop, 1.7, Dh - th), y1 + 0.12);
      // the upper front: a door onto the balcony and two windows, the balcony of timber on beams
      B('timber', 0, -0.9, W, 0.0, y1 - 0.12, y1 + 0.12); col.floor(R(0, -0.9, W, 0), y1 + 0.12);
      B('timber_red', 0.05, -0.9, W - 0.05, -0.84, y1 + 0.12, y1 + 1.0);
      for (let u = 0.2; u < W; u += 1.6) B('timber_red', u, -0.9, u + 0.12, -0.78, y1 + 0.12, y1 + 1.05);
      col.segment(P(0, -0.87), P(W, -0.87), 0.1, y1 + 0.12, y1 + 1.0);
      for (let u = 0.8; u < W - 0.3; u += 1.1) B('timber', u, -0.9, u + 0.14, -0.7, y1 - 0.5, y1 - 0.12);
      for (const wu of [W * 0.2, W * 0.8]) win(wu, 0.9, 1.0, 4.1);
      frameDoor(W * 0.5, 0, 1.0, 2.0 + 0.0 * dh);
      // lift that door's frame to the upper floor: frameDoor draws from y 0, so draw the upper one by hand
      B('timber_red', W * 0.5 - 0.6, -0.05, W * 0.5 - 0.5, 0.22, y1 + 0.12, y1 + 2.3); B('timber_red', W * 0.5 + 0.5, -0.05, W * 0.5 + 0.6, 0.22, y1 + 0.12, y1 + 2.3); B('timber_red', W * 0.5 - 0.6, -0.05, W * 0.5 + 0.6, 0.22, y1 + 2.1, y1 + 2.3);
      upper(y1 + 0.12, vTop);
    }
    function upper(y, vTop) {
      // an upper room: a bed-platform at the back, a chest, a loom or shelf, a lamp
      S('mudbrick', W - th - 2.0, Dh - th - 1.9, W - th, Dh - th, y, y + 0.5); B('cloth_blue', W - th - 1.95, Dh - th - 1.85, W - th - 0.05, Dh - th - 0.05, y + 0.5, y + 0.56); B('cloth_ochre', W - th - 1.6, Dh - th - 1.0, W - th - 0.3, Dh - th - 0.2, y + 0.56, y + 0.7);
      S('timber_red', 2.0, Dh - th - 0.74, 3.2, Dh - th - 0.04, y, y + 0.7); B('wood_dark', 2.0, Dh - th - 0.76, 3.2, Dh - th - 0.7, y + 0.2, y + 0.55);
      for (const [u, v, c] of [[2.4, 2.0, 'cloth_red'], [W * 0.5, 1.6, 'cloth_brown']]) B('reed_mat', u, v, u + 1.6, v + 1.2, y, y + 0.03), B(c, u + 0.2, v + 0.2, u + 1.0, v + 0.8, y + 0.03, y + 0.08);
      oilLamp(ctx, ...P(3.6, 2.8).flatMap((c, i) => (i === 0 ? [c, y + 0.55] : [c])), 0.3, 1.6, 6);
      void vTop;
    }

    // ── the yard walls (as before) and what the yard holds
    const wl = (u0, v0, u1, v1) => S(WALL, u0, v0, u1, v1, 0, 2.3);
    wl(W - th, Dh, W, D); wl(0, D - th, W, D);
    if (el.left) wl(0, Dh, th, D);
    for (const [u0, v0, u1, v1] of [[W - th, Dh, W, D], [0, D - th, W, D]]) B('tile_grey', u0 - 0.06, v0 - 0.06, u1 + 0.06, v1 + 0.06, 2.3, 2.4);
    yard();
    function yard() {
      const k = rand();
      if (k < 0.3) { const [x, z] = P(W * 0.5, Dh + 2.0); bag.add('thatch', lathe([[0.001, 0], [1.1, 0], [1.0, 0.8], [0.5, 1.6], [0.001, 1.9]], 9, null, x, 0, z)); col.circle(x, z, 1.0, 0, 1.6); }
      else if (k < 0.55) { const u = W * 0.5 - 1.0, v = Dh + 1.4; for (const s of [0, 2.0]) post('timber', u + s, v, 0, 1.5, 0.06); B('timber', u - 0.1, v - 0.04, u + 2.1, v + 0.04, 1.45, 1.52); for (let j = 0; j < 6; j++) B(['cloth_ochre', 'cloth_red', 'cloth_brown'][j % 3], u + 0.15 + j * 0.3, v - 0.04, u + 0.4 + j * 0.3, v + 0.04, 0.85, 1.45); }       // strings of fruit and gourds
      else if (k < 0.8) { const [x, z] = P(W * 0.3, Dh + 1.5); bag.add('banco', lathe([[0.55, 0], [0.5, 0.35], [0.38, 0.62], [0.2, 0.7], [0.001, 0.7]], 10, null, x, 0, z)); col.circle(x, z, 0.55, 0, 0.7); jar('pottery_dark', W * 0.3 + 1.1, Dh + 1.4, 0, 0.3, 0.8); }   // a tandoor oven and a jar
      else { for (let j = 0; j < 7; j++) { const [x0, z0] = P(W * 0.7 - 0.8 + (j % 4) * 0.3, Dh + 1.6 + Math.floor(j / 4) * 0.28); bag.add('log_pine', rod([x0, 0.0 + Math.floor(j / 4) * 0.25, z0], [x0 + f.dir[1] * 1.4, 0.0 + Math.floor(j / 4) * 0.25, z0 - f.dir[0] * 1.4], 0.1, 6)); } }   // a stack of poplar poles
    }

    // ── the interior
    const iu0 = th + 0.05, iu1 = W - th - 0.05, iv0 = th + 0.05, iv1 = Dh - th - 0.05;
    const backFree = (u) => Math.abs(u - ru) > 1.0;
    const shelf = (uA, uB, rows, mats) => {                 // shelves along the back wall from uA to uB
      for (let j = 0; j < rows; j++) { const y = 0.45 + j * 0.62; B('timber', uA, iv1 - 0.38, uB, iv1, y, y + 0.05); }
      for (let u = uA; u <= uB + 0.01; u += (uB - uA) / Math.max(1, Math.round((uB - uA) / 1.2))) B('timber', u - 0.04, iv1 - 0.38, u + 0.04, iv1, 0, 0.45 + (rows - 1) * 0.62 + 0.05);
      col.rect(R(uA, iv1 - 0.38, uB, iv1), 0, 0.5 + rows * 0.6);
      for (let j = 0; j < rows; j++) for (let u = uA + 0.2; u < uB - 0.2; u += 0.32 + 0.2 * rand()) {
        const y = 0.5 + j * 0.62, m = mats[Math.floor(rand() * mats.length)], hh = 0.18 + 0.25 * rand();
        if (m.startsWith('pot')) jar(m, u, iv1 - 0.2, y, 0.11 + 0.05 * rand(), hh, false); else B(m, u - 0.12, iv1 - 0.34, u + 0.12, iv1 - 0.06, y, y + hh * 0.7);
      }
    };
    const counter = () => {                                   // the shop's counter behind the open front (the counter is the front wall's low part); a board on the inside
      B('timber', du - dw / 2 - sideL - 0.05, 0.05, du - dw / 2 + 0.05, 0.75, 0.9, 0.97);
    };
    const kang = (u0, u1, v0, v1, y = 0.55) => {
      S('mudbrick', u0, v0, u1, v1, 0, y); B('reed_mat', u0 + 0.05, v0 + 0.05, u1 - 0.05, v1 - 0.05, y, y + 0.03);
      B(CLOTHS[Math.floor(rand() * 4)], u0 + 0.1, v0 + 0.3, u1 - 0.1, v1 - 0.1, y + 0.03, y + 0.1);
      B('banco', u0 - 0.0, v1 - 0.0, u0 + 0.5, v1 + 0.0, 0, 0);                // (no-op)
    };
    const stove = (u, v) => { S('banco', u, v, u + 0.8, v + 0.6, 0, 0.8); jar('pottery_dark', u + 0.4, v + 0.3, 0.8, 0.26, 0.28, false); B('iron', u + 0.3, v + 0.55, u + 0.5, v + 0.62, 0.2, 0.4); };
    const lamp = (u, v, y) => { const [x, z] = P(u, v); oilLamp(ctx, x, y, z, 0.3, 1.8, 6.5); };
    const trestle = (u0, u1, v0, v1, y = 0.8) => { S('timber', u0, v0, u1, v1, y - 0.06, y); for (const [u, v] of [[u0 + 0.06, v0 + 0.06], [u1 - 0.12, v0 + 0.06], [u0 + 0.06, v1 - 0.12], [u1 - 0.12, v1 - 0.12]]) B('timber', u, v, u + 0.06, v + 0.06, 0, y - 0.06); };

    if (!shop) {
      // home: the kang across the back corner (the side away from the back door), the stove, a low table, chests, jars, a loom in some, a lamp
      const kU1 = ru < W / 2 ? iu1 : iu1, kU0 = Math.max(iu0, iu1 - 2.4);
      const left = ru > W / 2;
      if (left) kang(iu0, iu0 + 2.4, iv1 - 1.7, iv1); else kang(kU0, kU1, iv1 - 1.7, iv1);
      const su = left ? iu0 + 2.5 : kU0 - 0.9; stove(su, iv1 - 0.6);
      void kU1;
      trestle(W * 0.5 - 0.4, W * 0.5 + 0.5, 1.9, 2.6, 0.38); jar('pottery_dark', W * 0.5 + 0.1, 2.25, 0.38, 0.12, 0.16, false);
      B('reed_mat', W * 0.5 - 1.0, 1.5, W * 0.5 + 1.2, 3.0, 0.08, 0.1);
      S('timber_red', iu0, 1.2, iu0 + 0.55, 2.3, 0, 0.8); B('lacquer_red', iu0 + 0.02, 1.25, iu0 + 0.5, 2.25, 0.8, 0.86);
      jar('pottery_dark', iu1 - 0.35, 1.0, 0.08, 0.3, 0.9); jar('pottery_dark', iu1 - 0.35, 1.8, 0.08, 0.25, 0.7); jar('wicker', iu1 - 0.4, 2.7, 0.08, 0.3, 0.5);
      if (rand() < 0.4) { for (const s of [0, 1.1]) S('timber', iu0 + 0.1 + s, 3.2, iu0 + 0.2 + s, 3.3, 0, 1.3); S('timber', iu0 + 0.1, 3.1, iu0 + 1.4, 3.15, 0.5, 0.6); B('cloth_ochre', iu0 + 0.2, 3.1, iu0 + 1.3, 3.3, 0.6, 1.0); }    // a loom
      lamp(W * 0.5 + 0.0, 2.25, 0.38);
      if (rand() < 0.65) fig(W * 0.5 - 0.1, 3.0, 0.1, yaw, { pose: 'cross', hat: rand() < 0.5 ? 'cap' : 'none' });
    } else {
      counter();
      lamp(W * 0.5, iv1 - 0.4, 0.95);
      const sf = (u, v, rot, o = {}) => fig(u, v, 0.08, rot, { dress: 'tunic', legs: 'hose', over: 'belt', ...o });
      const bu0 = backFree(iu0 + 1) ? iu0 : iu0, shelvesU0 = bu0, shelvesU1 = Math.min(ru - 0.7, iu1);
      void shelvesU1;
      const rightSide = ru < W / 2;                           // the back door on the left → shelves on the right part of the wall
      const sA = rightSide ? ru + 0.8 : iu0, sB = rightSide ? iu1 : ru - 0.8;
      void shelvesU0;
      switch (trade) {
        case 'cloth': shelf(sA, sB, 3, ['cloth_red', 'cloth_blue', 'cloth_ochre', 'cloth_white', 'cloth_green', 'cloth_indigo']); trestle(iu0 + 0.3, iu0 + 1.7, 1.2, 2.0, 0.85); for (let j = 0; j < 4; j++) B(CLOTHS[j], iu0 + 0.4 + j * 0.3, 1.3, iu0 + 0.65 + j * 0.3, 1.9, 0.85, 0.85 + 0.12 + j * 0.03); sf(du + 1.0, 1.2, yaw + Math.PI, { cloth: 'cloth_blue' }); break;
        case 'grain': for (let j = 0; j < 9; j++) { const [x, z] = P(iu0 + 0.5 + (j % 3) * 0.7, iv1 - 0.6 - Math.floor(j / 3) * 0.55); bag.add('sacking', lathe([[0.001, 0], [0.3, 0.02], [0.32, 0.3], [0.22, 0.55], [0.001, 0.6]], 8, null, x, 0.08, z)); col.circle(x, z, 0.3, 0.08, 0.6); } trestle(W - th - 1.5, W - th - 0.4, 1.0, 2.0, 0.8); B('timber_red', W - th - 1.3, 1.2, W - th - 0.9, 1.6, 0.8, 1.0); B('iron', W - th - 0.8, 1.7, W - th - 0.7, 1.75, 0.9, 1.6); shelf(sA, sB, 2, ['sacking', 'pot_dark', 'wicker']); sf(du + 0.9, 1.1, yaw + Math.PI, { cloth: 'cloth_brown' }); break;
        case 'pottery': shelf(sA, sB, 3, ['pot', 'pot', 'glaze_green', 'glaze_blue', 'pottery_dark']); for (let j = 0; j < 14; j++) jar(['pottery_dark', 'glaze_green', 'glaze_blue', 'pottery_dark'][j % 4], iu0 + 0.4 + (j % 5) * 0.55, 1.2 + Math.floor(j / 5) * 0.55, 0.08, 0.2 + 0.1 * rand(), 0.35 + 0.35 * rand()); sf(du + 1.0, 1.0, yaw + Math.PI, { cloth: 'cloth_grey' }); break;
        case 'smith': { const hu = rightSide ? iu1 - 1.9 : iu0 + 0.1; S('banco', hu, iv1 - 1.2, hu + 1.8, iv1, 0, 0.8); B('banco_rough', hu + 0.4, iv1 - 0.9, hu + 1.4, iv1 - 0.3, 0.8, 1.0); B('iron', hu + 0.5, iv1 - 0.8, hu + 1.3, iv1 - 0.4, 0.8, 0.84); B('hide_brown', hu + 0.5, iv1 - 1.55, hu + 1.3, iv1 - 1.2, 0.5, 0.95); const [ax, az] = P(W * 0.5, 2.4); bag.add('log_pine', lathe([[0.25, 0], [0.22, 0.5], [0.001, 0.5]], 8, null, ax, 0.08, az)); B('iron', W * 0.5 - 0.2, 2.25, W * 0.5 + 0.2, 2.55, 0.58, 0.75); col.circle(ax, az, 0.28, 0.08, 0.75); for (let j = 0; j < 6; j++) B('iron', iu0 + 0.1 + j * 0.15, iv1 - 0.1, iu0 + 0.2 + j * 0.15, iv1, 1.4 - j * 0.1, 2.0); const [wx, wz] = P(W * 0.5 + 1.0, 3.0); bag.add('water', lathe([[0.001, 0], [0.4, 0], [0.4, 0.05], [0.001, 0.05]], 8, null, wx, 0.5, wz)); sf(W * 0.5, 1.6, yaw + Math.PI, { cloth: 'cloth_black', cloth2: 'cloth_brown', over: 'apron' }); ctx.lights?.push({ at: [...P(hu + 0.9, iv1 - 0.6)].flatMap((c, i) => (i === 0 ? [c, 1.1] : [c])), color: '#ff8a40', intensity: 3.0, distance: 7 }); break; }
        case 'bake': { const [ox, oz] = P(iu0 + 1.0, iv1 - 0.9); bag.add('banco', lathe([[0.8, 0], [0.75, 0.5], [0.55, 0.9], [0.3, 1.05], [0.001, 1.05]], 10, null, ox, 0.08, oz)); col.circle(ox, oz, 0.82, 0.08, 1.0); B('iron', iu0 + 0.9, iv1 - 1.8, iu0 + 1.6, iv1 - 1.7, 0.2, 0.3); trestle(W * 0.5 - 0.9, W * 0.5 + 0.9, 1.7, 2.5, 0.8); for (let j = 0; j < 5; j++) { const [x, z] = P(W * 0.5 - 0.6 + j * 0.28, 2.1); bag.add('hide_tan', lathe([[0.001, 0], [0.14, 0], [0.14, 0.04], [0.001, 0.04]], 8, null, x, 0.8, z)); } for (const u of [W * 0.5 - 1.0, W * 0.5 + 1.2]) B('timber', u, 1.8, u + 0.4, 2.2, 0, 0.42); sf(iu0 + 2.2, iv1 - 0.8, yaw + Math.PI, { cloth: 'cloth_white' }); break; }
        case 'wine': for (let j = 0; j < 8; j++) jar('pottery_dark', iu0 + 0.5 + (j % 4) * 0.7, iv1 - 0.55 - Math.floor(j / 4) * 0.7, 0.08, 0.34, 0.95); shelf(sA, sB, 2, ['pot', 'pottery_dark']); for (const [u, v] of [[W * 0.5 - 0.7, 2.0], [W * 0.5 + 0.7, 2.6]]) { trestle(u - 0.4, u + 0.4, v - 0.3, v + 0.3, 0.42); B('glaze_blue', u - 0.1, v - 0.1, u + 0.1, v + 0.1, 0.42, 0.52); } sf(du - 0.2, 1.1, yaw + Math.PI, { cloth: 'cloth_green', cloth2: 'cloth_white', beard: true, skin: 'skin_light' }); break;
        case 'scribe': shelf(sA, sB, 3, ['linen', 'cloth_white', 'cloth_ochre']); B('reed_mat', W * 0.5 - 1.3, 1.4, W * 0.5 + 1.3, 3.2, 0.08, 0.1); trestle(W * 0.5 - 0.5, W * 0.5 + 0.5, 2.0, 2.7, 0.4); B('cloth_white', W * 0.5 - 0.3, 2.1, W * 0.5 + 0.1, 2.5, 0.4, 0.43); B('wood_dark', W * 0.5 + 0.2, 2.2, W * 0.5 + 0.3, 2.35, 0.4, 0.5); lamp(W * 0.5 - 0.4, 2.55, 0.4); fig(W * 0.5, 3.0, 0.1, yaw, { pose: 'cross', dress: 'robe', over: 'shawl', cloth: 'cloth_ochre', hair: 'shaven', hat: 'none' }); break;
        case 'saddler': for (let j = 0; j < 3; j++) { const u = sA + 0.5 + j * 1.0; B('timber', u, iv1 - 0.4, u + 0.12, iv1, 0, 1.1); B('timber', u - 0.2, iv1 - 0.4, u + 0.32, iv1, 1.0, 1.08); B('hide_brown', u - 0.3, iv1 - 0.35, u + 0.42, iv1 - 0.05, 1.08, 1.3); } for (let j = 0; j < 5; j++) B(j % 2 ? 'hide_tan' : 'hide_brown', iu0 + 0.1 + j * 0.45, iv1 - 0.04, iu0 + 0.4 + j * 0.45, iv1, 1.4, 2.3 - 0.1 * j); trestle(W * 0.5 - 0.6, W * 0.5 + 0.6, 1.6, 2.4, 0.7); B('hide_tan', W * 0.5 - 0.4, 1.8, W * 0.5 + 0.4, 2.2, 0.7, 0.8); sf(du + 1.0, 1.2, yaw + Math.PI, { cloth: 'cloth_brown' }); break;
        default: /* drugs */ { const cabinet = () => { S('timber_red', sA, iv1 - 0.5, sB, iv1, 0, 2.2); for (let r = 0; r < 5; r++) for (let u = sA + 0.1; u < sB - 0.3; u += 0.4) B('wood_dark', u, iv1 - 0.54, u + 0.34, iv1 - 0.5, 0.2 + r * 0.38, 0.52 + r * 0.38); }; cabinet(); for (let j = 0; j < 6; j++) jar('glaze_white' in {} ? 'glaze_white' : 'pottery_dark', iu0 + 0.3 + j * 0.3, 1.0, 0.0, 0.1, 0.0, false); trestle(W * 0.5 - 0.5, W * 0.5 + 0.5, 1.8, 2.5, 0.8); B('iron', W * 0.5 - 0.2, 2.0, W * 0.5 + 0.2, 2.25, 0.8, 0.9); for (const [u, v, c] of [[0.2, 0.2, 'cloth_green'], [0.5, 0.15, 'cloth_ochre'], [0.0, 0.5, 'cloth_brown']]) B(c, W * 0.5 - 0.3 + u, 2.0 + v - 0.1, W * 0.5 - 0.1 + u, 2.0 + v + 0.1, 0.8, 0.95); sf(du + 1.0, 1.2, yaw + Math.PI, { cloth: 'cloth_white', cloth2: 'cloth_green' }); break; }
      }
    }
    // a lattice window high in the back wall lets a little light in (shown as a pale lattice in the plaster)
    B('lattice', W * 0.5 - 0.4, Dh - 0.06, W * 0.5 + 0.4, Dh - 0.02, 1.8, 2.5);

    // ── the front, dressed at eye level and weathered
    dressFront();
    function dressFront() {
      // the earth's layers (the lines of the rammed courses), the foot eaten by salt, patches of mended plaster, cracks, rain streaks
      for (let y = 1.5; y < H; y += 0.8) B('banco_rough', 0, -0.012, W, 0.03, y, y + 0.05);
      for (let u = 0.2; u < W - 0.4; u += 0.5 + 0.7 * rand()) B(FOOT, u, -0.08, u + 0.3 + 0.6 * rand(), 0.02, 0.0, 0.25 + 0.3 * rand());                   // the foot, scoured
      for (let u = 0.3; u < W - 0.6; u += 1.6 + 1.6 * rand()) B('chalk', u, -0.03, u + 0.4 + 0.8 * rand(), 0.0, 0.5 + 0.2 * rand(), 0.62 + 0.4 * rand());      // salt crust above the foot
      for (let j = 0; j < 2 + Math.floor(W / 5); j++) { const u = rand() * (W - 1.6) + 0.4; if (Math.abs(u - du) < 1.0) continue; B(rand() < 0.5 ? 'mud_plaster' : 'lime_plaster_rough', u, -0.02, u + 0.5 + 0.9 * rand(), 0.0, 1.0 + rand() * 1.4, 1.5 + rand() * 1.5 > H ? H - 0.2 : 1.5 + rand() * 1.3); }       // patches of mended plaster
      for (let j = 0; j < 2; j++) { const u = rand() * (W - 1.0) + 0.3; if (Math.abs(u - du) < 0.9) continue; B('plaster_streak', u, -0.015, u + 0.12, 0.0, H - 1.6, H - 0.1); }
      const cu = W * (0.1 + 0.8 * rand()); if (Math.abs(cu - du) > 1.0) { B('wood_dark', cu, -0.012, cu + 0.04, 0.0, 1.0, 2.4); B('wood_dark', cu + 0.04, -0.012, cu + 0.1, 0.0, 2.0, 2.9); }
      const lampU = du - dw / 2 - 0.3; { const [x, z] = P(lampU, -0.15); bag.add('lamp_paper', lathe([[0.001, 0], [0.12, 0.05], [0.14, 0.2], [0.1, 0.34], [0.001, 0.36]], 8, null, x, 2.0, z)); bag.add('timber', rod([x, 2.4, z], [x, 2.34, z], 0.015, 4)); }
      // the trade: banner and goods; or for homes a bench, firewood, a pot, gourds hung to dry
      const out = (u) => P(u, -0.5);
      if (shop) {
        const cloth = TRADES[trade], bu = Math.min(W - 0.4, du + dw / 2 + 0.7);
        // a banner on a pole at the corner by the door
        const [px, pz] = P(bu, -0.55); bag.add('timber', rod([px, 0, pz], [px, 3.5, pz], 0.05, 6));
        const t = []; const a = P(bu, -0.55), b = P(bu, -1.35); quad(t, [a[0], 3.45, a[1]], [a[0], 2.2, a[1]], [b[0], 2.2, b[1]], [b[0], 3.45, b[1]]); quad(t, [b[0], 3.45, b[1]], [b[0], 2.2, b[1]], [a[0], 2.2, a[1]], [a[0], 3.45, a[1]]); bag.add(cloth + '+wind', fromTriangles(t));
        // shutters stacked against the jamb: the planks that close the front by night
        B('planks_grey', du - dw / 2 - sideL - 0.2, -0.08, du - dw / 2 - sideL - 0.06, 0.04, 0.55, 2.4);
        // an awning of cloth over the counter, on two poles
        const a0 = P(du - dw / 2 - sideL - 0.2, -0.05), a1 = P(du - dw / 2 + 0.1, -0.05), a2 = P(du - dw / 2 + 0.1, -1.7), a3 = P(du - dw / 2 - sideL - 0.2, -1.7), tt = [];
        quad(tt, [a0[0], 2.6, a0[1]], [a1[0], 2.6, a1[1]], [a2[0], 2.15, a2[1]], [a3[0], 2.15, a3[1]]); quad(tt, [a3[0], 2.15, a3[1]], [a2[0], 2.15, a2[1]], [a1[0], 2.6, a1[1]], [a0[0], 2.6, a0[1]]);
        bag.add(cloth + '+wind', fromTriangles(tt));
        for (const p of [a2, a3]) bag.add('timber', rod([p[0], 0, p[1]], [p[0], 2.15, p[1]], 0.045, 5));
        goodsOut(trade, du - dw / 2 - sideL / 2);
      } else {
        const k = rand();
        const [bx, bz] = out(Math.max(0.8, Math.min(W - 1.0, du - 1.4 + 2.8 * rand())));
        void bx; void bz;
        // an earth bench along the wall
        const bu = du + (rand() < 0.5 ? 1.2 : -2.6), bw = 1.5;
        if (bu > 0.5 && bu + bw < W - 0.3) { S('banco', bu, -0.5, bu + bw, 0, 0, 0.42); B('reed_mat', bu + 0.05, -0.45, bu + bw - 0.05, -0.02, 0.42, 0.45); }
        // firewood, a pot or two, gourds and garlic hung from the beams' ends
        if (k < 0.5) for (let j = 0; j < 9; j++) { const u = (W - 1.5) + (j % 3) * 0.2, y = 0.55 + Math.floor(j / 3) * 0.2, [x0, z0] = P(Math.min(W - 0.8, u), -0.2); bag.add('log_pine', rod([x0 + f.dir[1] * -0.6 * 0, y, z0], [x0 - f.dir[0] * 0.0 + f.dir[0] * 0.4, y, z0 + f.dir[1] * 0.4], 0.06, 5)); }
        for (let j = 0; j < 5; j++) { const u = 0.6 + j * 0.5 + (du > W / 2 ? 0 : W - 3.5), [x, z] = P(Math.min(W - 0.4, u), -0.25); if (Math.abs(u - du) < 0.9) continue; bag.add(j % 2 ? 'cloth_ochre' : 'cloth_green', lathe([[0.001, 0], [0.08, 0.04], [0.1, 0.12], [0.001, 0.22]], 6, null, x, H - 0.6, z)); bag.add('rope_fibre', rod([x, H - 0.2, z], [x, H - 0.38, z], 0.012, 4)); }
        jar('pottery_dark', Math.max(0.5, du - 1.0), -0.35, 0, 0.26, 0.7); jar('pottery_dark', Math.min(W - 0.4, du + 1.0), -0.3, 0, 0.2, 0.5);
      }
    }
    function goodsOut(tr, u) {
      const y0 = 0.0;
      switch (tr) {
        case 'cloth': for (let j = 0; j < 5; j++) { const [x, z] = P(u - 0.8 + j * 0.4, -0.9); bag.add('timber', rod([x, y0, z], [x, 2.1, z], 0.03, 4)); } for (let j = 0; j < 4; j++) { const a = P(u - 0.8 + j * 0.4, -0.9), b = P(u - 0.4 + j * 0.4, -0.9), t = []; quad(t, [a[0], 2.1, a[1]], [a[0], 1.3, a[1]], [b[0], 1.3, b[1]], [b[0], 2.1, b[1]]); quad(t, [b[0], 2.1, b[1]], [b[0], 1.3, b[1]], [a[0], 1.3, a[1]], [a[0], 2.1, a[1]]); bag.add(CLOTHS[j] + '+wind', fromTriangles(t)); } break;
        case 'grain': for (let j = 0; j < 4; j++) { const [x, z] = P(u - 0.8 + (j % 2) * 0.8, -0.8 - Math.floor(j / 2) * 0.6); bag.add('sacking', lathe([[0.001, 0], [0.3, 0.02], [0.32, 0.3], [0.22, 0.55], [0.001, 0.6]], 8, null, x, 0, z)); col.circle(x, z, 0.3, 0, 0.6); } break;
        case 'pottery': for (let j = 0; j < 9; j++) jar(['pottery_dark', 'glaze_green', 'glaze_blue'][j % 3], u - 0.9 + (j % 3) * 0.55, -0.6 - Math.floor(j / 3) * 0.5, 0, 0.2 + 0.08 * rand(), 0.35 + 0.3 * rand()); break;
        case 'smith': for (let j = 0; j < 5; j++) { const [x, z] = P(u - 0.8 + j * 0.25, -0.1); bag.add('iron', rod([x, 1.6, z], [x, 1.1 - 0.05 * j, z], 0.02, 4)); } { const [x, z] = P(u, -0.8); bag.add('iron', lathe([[0.001, 0], [0.3, 0], [0.3, 0.3], [0.001, 0.3]], 8, null, x, 0, z)); col.circle(x, z, 0.3, 0, 0.3); } break;
        case 'bake': { const [x, z] = P(u, -0.7); bag.add('banco', lathe([[0.001, 0], [0.5, 0.0], [0.45, 0.7], [0.001, 0.8]], 9, null, x, 0, z)); col.circle(x, z, 0.5, 0, 0.8); for (let j = 0; j < 3; j++) { const [bx, bz] = P(u - 0.5 + j * 0.5, -1.3); bag.add('wicker', lathe([[0.2, 0], [0.25, 0.14], [0.2, 0.2], [0.001, 0.2]], 8, null, bx, 0.75, bz)); } trestleOut(u - 0.8, u + 0.8, -1.6, -1.0); break; }
        case 'wine': for (let j = 0; j < 4; j++) jar('pottery_dark', u - 0.8 + j * 0.5, -0.65, 0, 0.3, 0.9); break;
        case 'scribe': { B('reed_mat', u - 0.7, -1.4, u + 0.7, -0.5, 0, 0.03); B('timber', u - 0.3, -1.0, u + 0.3, -0.6, 0.0, 0.3); B('cloth_white', u - 0.2, -0.95, u + 0.2, -0.65, 0.3, 0.33); break; }
        case 'saddler': for (let j = 0; j < 2; j++) { const [x, z] = P(u - 0.4 + j * 0.8, -0.7); bag.add('timber', rod([x, 0, z], [x, 1.0, z], 0.05, 5)); B('hide_brown', u - 0.6 + j * 0.8, -0.95, u - 0.2 + j * 0.8, -0.45, 1.0, 1.25); } break;
        default: for (let j = 0; j < 6; j++) { const [x, z] = P(u - 0.8 + (j % 3) * 0.4, -0.7 - Math.floor(j / 3) * 0.4); bag.add(['cloth_green', 'cloth_ochre', 'cloth_brown'][j % 3], lathe([[0.001, 0], [0.18, 0], [0.18, 0.1], [0.001, 0.12]], 8, null, x, 0.0, z)); } trestleOut(u - 0.8, u + 0.8, -1.4, -0.6);
      }
      function trestleOut(u0, u1, v0, v1) { B('timber', u0, v0, u1, v1, 0.74, 0.8); for (const [a, b] of [[u0 + 0.05, v0 + 0.05], [u1 - 0.1, v0 + 0.05], [u0 + 0.05, v1 - 0.1], [u1 - 0.1, v1 - 0.1]]) B('timber', a, b, a + 0.05, b + 0.05, 0, 0.74); }
    }
    // the lights of the interior: one lamp is added above; make the room's light bright enough to read it
    ctx.lights?.push({ at: [...P(W * 0.5, Dh * 0.5)].flatMap((c, i) => (i === 0 ? [c, HF - 0.6] : [c])), color: '#ffd29a', intensity: 0.9, distance: 6.5 });
  };
}
