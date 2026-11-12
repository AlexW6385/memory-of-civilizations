// The ground floors of Shibam that can be entered (docs/settlements/shibam.md §5, "Shops and storerooms"): a tower house whose ground storey is
// hollowed into a shop, a coffee house or a workshop — the whitewashed room under its palm-trunk beams, the open front with its plank shutters
// folded aside and a mat canopy over the street — furnished by the trade (spices and incense, cloth, grain and dates, honey, indigo, silver,
// the loom, the forge, carpenter, jars, tailor, barber), and the sultan's palace's hall of piers. The storeys above stay as the town's.

import { box, rod, lathe } from '../../core/geom.js';
import { fl, GH, F0 } from './dims.js';

const WT = 0.9;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
export { WT };

/** The room of a hollowed ground floor from the house's rect: the walls' inner faces. */
export const roomOf = (rect) => [rect[0] + WT, rect[1] + WT, rect[2] - WT, rect[3] - WT];

/**
 * The walls of the ground storey with the door cut in the front, the lining of lime inside, the floor, the beams, and the plinth as a ring:
 * el.rect, el.front ('n'|'s'), el.door (the coordinate along the front), doorW (the opening's width), H (its height).
 */
export function hollowShell(ctx, el, doorW, H = 2.35) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, n = el.front === 'n', u = el.door, hw = doorW / 2;
  const [ix0, iz0, ix1, iz1] = roomOf(el.rect);
  const fz0 = n ? z0 : z1 - WT, fz1 = n ? z0 + WT : z1, bz0 = n ? z1 - WT : z0, bz1 = n ? z1 : z0 + WT;
  const wall = (r, y0, y1) => { bag.add('mud_plaster', box(r[0], y0, r[1], r[2], y1, r[3])); col.rect(r, y0, y1); };
  // the side walls and the back
  wall([x0, z0, x0 + WT, z1], -0.6, GH); wall([x1 - WT, z0, x1, z1], -0.6, GH); wall([x0 + WT, bz0, x1 - WT, bz1], -0.6, GH);
  // the front: either side of the door, and over it
  wall([x0 + WT, fz0, u - hw, fz1], -0.6, GH); wall([u + hw, fz0, x1 - WT, fz1], -0.6, GH); wall([u - hw, fz0, u + hw, fz1], H, GH);
  col.rect([u - hw, fz0, u + hw, fz1], H, GH);
  // the plinth of rubble, a ring on the faces that show (not through the door)
  const pw = 0.08;
  for (const [a, b, c, d] of n ? [[x0 + WT, z0 - pw, u - hw - 0.25, z0], [u + hw + 0.25, z0 - pw, x1 - WT, z0]] : [[x0 + WT, z1, u - hw - 0.25, z1 + pw], [u + hw + 0.25, z1, x1 - WT, z1 + pw]]) bag.add('schist_rubble', box(a, -0.6, b, c, 1.1, d));
  // the lining of lime inside, the floor, the beams of palm trunk under the floor above
  const li = 0.025, lw = [[ix0 - li, iz0, ix0, iz1], [ix1, iz0, ix1 + li, iz1], [ix0, n ? iz1 : iz0 - li, ix1, n ? iz1 + li : iz0]];
  for (const r of lw) bag.add('lime_plaster', box(r[0], 0, r[1], r[2], GH, r[3]));
  const fi = n ? iz0 - li : iz1, fe = n ? iz0 : iz1 + li;
  for (const [a, b] of [[ix0, u - hw], [u + hw, ix1]]) bag.add('lime_plaster', box(a, 0, fi, b, GH, fe));
  bag.add('lime_plaster', box(u - hw, H, fi, u + hw, GH, fe));
  bag.add('earth_wall', box(ix0, -0.3, iz0, ix1, F0, iz1)); col.floor([ix0, iz0, ix1, iz1], F0);
  for (let z = iz0 + 0.4; z < iz1; z += 0.85) bag.add('palm_trunk', rod([ix0, GH - 0.12, z], [ix1, GH - 0.12, z], 0.075, 6));
  for (const a of [ix0 + (ix1 - ix0) * 0.33, ix0 + (ix1 - ix0) * 0.67]) bag.add('timber', box(a - 0.1, GH - 0.3, iz0, a + 0.1, GH - 0.19, iz1));
  // the step outside, level with the plinth's foot
  bag.add('schist_rubble', box(u - hw - 0.15, -0.3, n ? z0 - 0.5 : z1, u + hw + 0.15, 0.1, n ? z0 : z1 + 0.5)); col.floor([u - hw - 0.1, n ? z0 - 0.45 : z1 - 0.1, u + hw + 0.1, n ? z0 + 0.1 : z1 + 0.45], 0.1);
}

// ── the furnishing: a frame with its door side at b = 0 (a along the front from the left, b inward, y up from the floor) ──
function frameOf(ctx, el) {
  const { bag, col, lights } = ctx, [ix0, iz0, ix1, iz1] = roomOf(el.rect), n = el.front === 'n', W = ix1 - ix0, D = iz1 - iz0, Y = F0;
  const X = (a) => ix0 + a, Z = (b) => (n ? iz0 + b : iz1 - b);
  const R = (a0, b0, a1, b1) => { const xa = X(a0), xb = X(a1), za = Z(b0), zb = Z(b1); return [Math.min(xa, xb), Math.min(za, zb), Math.max(xa, xb), Math.max(za, zb)]; };
  const S = {
    W, D, Y, cx: W / 2, da: el.door - ix0, bag, col, lights,
    b: (mat, a0, b0, a1, b1, y0, y1, solid = false) => { const r = R(a0, b0, a1, b1); bag.add(mat, box(r[0], Y + y0, r[1], r[2], Y + y1, r[3])); if (solid) col.rect(r, Y + y0, Y + y1); },
    rod: (mat, a0, y0, b0, a1, y1, b1, r = 0.03, seg = 5) => bag.add(mat, rod([X(a0), Y + y0, Z(b0)], [X(a1), Y + y1, Z(b1)], r, seg)),
    lath: (mat, prof, a, b, y = 0, s = 1, seg = 9) => bag.add(mat, lathe(prof.map(([r, h]) => [r * s, h * s]), seg, null, X(a), Y + y, Z(b))),
    solid: (a0, b0, a1, b1, y0, y1) => col.rect(R(a0, b0, a1, b1), Y + y0, Y + y1),
    circle: (a, b, r, y1) => col.circle(X(a), Z(b), r, Y, Y + y1),
    pt: (a, b) => [X(a), Z(b)],
    light: (a, y, b, color = '#ffd9a0', intensity = 1.5, distance = 7) => lights.push({ at: [X(a), Y + y, Z(b)], color, intensity, distance }),
  };
  return S;
}
const P = {
  jar: [[0.001, 0], [0.1, 0.02], [0.2, 0.14], [0.24, 0.3], [0.17, 0.44], [0.1, 0.5], [0.12, 0.56], [0.001, 0.54]],
  big: [[0.001, 0], [0.2, 0.02], [0.34, 0.2], [0.4, 0.45], [0.32, 0.72], [0.18, 0.86], [0.2, 0.94], [0.001, 0.92]],
  sack: [[0.001, 0], [0.2, 0.02], [0.28, 0.2], [0.24, 0.42], [0.12, 0.55], [0.001, 0.58]],
  bowl: [[0.001, 0], [0.12, 0.02], [0.2, 0.1], [0.19, 0.11], [0.001, 0.05]],
  pan: [[0.001, 0], [0.14, 0.01], [0.2, 0.08], [0.19, 0.09], [0.001, 0.04]],
  vat: [[0.001, 0], [0.4, 0.02], [0.52, 0.3], [0.5, 0.7], [0.42, 0.78], [0.001, 0.78]],
  coffee: [[0.001, 0], [0.09, 0.01], [0.16, 0.1], [0.12, 0.22], [0.05, 0.3], [0.04, 0.38], [0.08, 0.4], [0.001, 0.39]],
  hookah: [[0.001, 0], [0.16, 0.01], [0.2, 0.1], [0.12, 0.22], [0.04, 0.3], [0.045, 0.7], [0.11, 0.78], [0.1, 0.84], [0.001, 0.83]],
};
const CLOTHS = ['cloth_white', 'cloth_indigo', 'cloth_ochre', 'cloth_red', 'cloth_maroon', 'cloth_green', 'cloth_brown', 'cloth_black'];

/** The shelves along the back wall: boards at each height, uprights, and what the trade puts on them. */
function shelves(S, rand, rows, put, a0 = 0.15, a1 = S.W - 0.15, depth = 0.5) {
  const b0 = S.D - depth;
  for (const y of rows) S.b('timber', a0, b0, a1, S.D - 0.02, y, y + 0.045);
  for (let a = a0; a <= a1 + 0.01; a += (a1 - a0) / Math.max(2, Math.round((a1 - a0) / 1.5))) S.b('timber', a - 0.03, b0, a + 0.03, S.D - 0.02, 0, rows[rows.length - 1] + 0.3);
  S.solid(a0, b0, a1, S.D, 0, rows[rows.length - 1]);
  for (const y of rows) put(y + 0.045, b0 + depth / 2, rand);
}
const spread = (S, a0, a1, step, fn) => { for (let a = a0; a <= a1; a += step) fn(a); };
const bolts = (S, rand, y, b, a0, a1, h = 0.22) => spread(S, a0, a1, 0.38, (a) => { const m = CLOTHS[Math.floor(rand() * CLOTHS.length)]; S.b(m, a - 0.17, b - 0.18, a + 0.17, b + 0.18, y, y + h * (0.7 + 0.5 * rand())); });
const counter = (S, a0, b0, a1, b1, h = 0.85) => { S.b('timber', a0, b0, a1, b1, 0, h, true); S.b('lime_plaster', a0 - 0.03, b0 - 0.03, a1 + 0.03, b1 + 0.03, h, h + 0.05); };
const scale = (S, a, b, y) => {
  S.b('bronze', a - 0.012, b - 0.012, a + 0.012, b + 0.012, y, y + 0.5);
  S.b('bronze', a - 0.28, b - 0.012, a + 0.28, b + 0.012, y + 0.5, y + 0.52);
  for (const d of [-0.26, 0.26]) S.lath('bronze', P.pan, a + d, b, y + 0.2, 0.9);
};
const rug = (S, a0, b0, a1, b1, mat) => { S.b(mat, a0, b0, a1, b1, 0, 0.022); S.b('cloth_black', a0 + 0.08, b0 + 0.08, a1 - 0.08, b0 + 0.11, 0.022, 0.03); };

const TRADE = {
  // incense, henna, spices: sacks open at the mouth, a scale on the counter, jars and boxes on the shelves, a brazier of coals with frankincense
  spice(S, rand) {
    counter(S, 0.1, 0.9, 1.0, 3.7); scale(S, 0.55, 2.2, 0.85);
    spread(S, 0.6, S.W - 0.6, 0.62, (a) => { if (Math.abs(a - S.cx) < 0.95) return; S.lath('sacking', P.sack, a, S.D - 1.0 - (a * 7 % 3) * 0.1, 0, 1.3); S.lath(['cloth_ochre', 'cloth_red', 'cloth_green', 'limestone_yellow'][Math.floor(rand() * 4)], P.bowl, a, S.D - 1.0 - (a * 7 % 3) * 0.1, 0.72, 0.9); S.circle(a, S.D - 1.0, 0.3, 0.7); });
    shelves(S, rand, [0.55, 1.15, 1.75], (y, b) => spread(S, 0.3, S.W - 0.3, 0.36, (a) => S.lath(rand() < 0.5 ? 'terracotta' : 'pottery_dark', P.jar, a, b, y, 0.62 + 0.3 * rand())));
    S.lath('bronze', P.pan, S.W - 0.55, 1.4, 0.0, 1.2); S.b('schist_rubble', S.W - 0.9, 1.05, S.W - 0.2, 1.75, 0, 0.3, true); S.lath('bronze', P.pan, S.W - 0.55, 1.4, 0.3, 1.5); S.b('flame', S.W - 0.62, 1.34, S.W - 0.48, 1.46, 0.33, 0.37);
    S.light(S.cx, 2.7, S.D * 0.5, '#ffd0a0', 1.6);
  },
  // bolts of cloth on shelves, a measuring rod nailed to the counter, a low seat for the buyer
  cloth(S, rand) {
    counter(S, S.W - 1.1, 0.9, S.W - 0.1, 4.0); S.b('iron', S.W - 1.08, 0.9, S.W - 0.12, 0.93, 0.9, 0.93);
    shelves(S, rand, [0.4, 0.95, 1.5, 2.05], (y, b) => bolts(S, rand, y, b, 0.35, S.W - 0.35));
    for (const a of [0.45, 0.8]) S.rod('cloth_indigo', a, 2.3, 1.2, a, 0.9, 1.2, 0.05, 6);
    S.rod('timber', 0.1, 2.35, 1.2, 1.2, 2.35, 1.2, 0.025);
    for (let k = 0; k < 4; k++) S.b(CLOTHS[(k * 3) % 8], 0.15, 1.6 + k * 0.4, 0.95, 1.9 + k * 0.4, 0, 0.3 - k * 0.02);
    S.b('reed_mat', S.W - 2.4, 1.0, S.W - 1.3, 2.0, 0, 0.15);
    S.light(S.cx, 2.7, S.D * 0.5, '#ffe0b0', 1.5);
  },
  // grain and dates: big jars along the walls, sacks and baskets of dates, a wooden measure, a scale
  grain(S, rand) {
    for (let k = 0; k < Math.floor((S.D - 2) / 0.95); k++) for (const a of [0.5, S.W - 0.5]) { S.lath('terracotta', P.big, a, 1.4 + k * 0.95, 0, 1.05); S.circle(a, 1.4 + k * 0.95, 0.4, 0.95); }
    spread(S, 1.4, S.W - 1.4, 0.7, (a) => { if (Math.abs(a - S.cx) < 0.9) return; S.lath('sacking', P.sack, a, S.D - 0.5, 0, 1.4); S.circle(a, S.D - 0.5, 0.3, 0.8); S.lath('sacking', P.sack, a + 0.3, S.D - 1.1, 0, 1.3); });
    for (let k = 0; k < 4; k++) { S.lath('wicker', P.pan, 1.4 + k * 0.55, 1.3, 0, 2.2, 8); S.lath('terracotta', P.bowl, 1.4 + k * 0.55, 1.3, 0.07, 1.0); }
    S.b('timber', S.cx - 0.45, 0.6, S.cx + 0.45, 0.8, 0, 0.35); S.lath('wicker', P.bowl, S.cx, 0.7, 0.35, 1.2);
    scale(S, S.cx - 0.0, S.D - 2.2, 0); S.light(S.cx, 2.7, S.D * 0.5, '#ffe0b0', 1.3);
  },
  // the coffee house: benches of timber with mats along the walls, a stove with the big pots, cups on a tray, a water pipe
  qahwa(S, rand) {
    for (const side of [0, 1]) { const a0 = side ? S.W - 0.85 : 0.05, a1 = side ? S.W - 0.05 : 0.85; S.b('timber', a0, 1.2, a1, S.D - 1.6, 0, 0.42, true); S.b('reed_mat', a0, 1.2, a1, S.D - 1.6, 0.42, 0.47); for (let k = 0; k < 4; k++) S.b(CLOTHS[(k + side * 2) % 5 + 1], side ? a0 + 0.1 : a1 - 0.5, 1.5 + k * 1.2, side ? a0 + 0.55 : a1 - 0.1, 2.0 + k * 1.2, 0.47, 0.8); }
    S.b('schist_rubble', S.cx - 1.0, S.D - 0.9, S.cx + 1.0, S.D - 0.1, 0, 0.8, true); S.b('iron', S.cx - 0.9, S.D - 0.85, S.cx + 0.9, S.D - 0.15, 0.8, 0.84);
    for (const d of [-0.55, 0, 0.55]) { S.lath('bronze', P.coffee, S.cx + d, S.D - 0.5, 0.84, 1.3); S.b('flame', S.cx + d - 0.07, S.D - 0.56, S.cx + d + 0.07, S.D - 0.44, 0.79, 0.81); }
    S.b('timber', S.cx - 0.9, S.D - 1.6, S.cx + 0.9, S.D - 1.2, 0, 0.5, true);
    for (let k = 0; k < 6; k++) S.lath('glaze_white', P.bowl, S.cx - 0.6 + k * 0.24, S.D - 1.4, 0.5, 0.35);
    S.lath('bronze', P.hookah, 0.5, S.D - 1.0, 0, 1.0); S.b('lamp_glass', S.cx - 0.1, S.D * 0.5 - 0.1, S.cx + 0.1, S.D * 0.5 + 0.1, 2.4, 2.65);
    S.rod('iron', S.cx, 2.65, S.D * 0.5, S.cx, 3.1, S.D * 0.5, 0.01, 4);
    S.light(S.cx, 2.5, S.D * 0.5, '#ffcf8a', 2.2, 8);
  },
  // honey of the wadi's sidr trees: big sealed jars, tins and small pots, a ladle
  honey(S, rand) {
    counter(S, 0.1, 0.9, 1.1, 3.4); for (let k = 0; k < 5; k++) S.lath('terracotta', P.jar, 0.35 + (k % 2) * 0.4, 1.2 + k * 0.45, 0.85, 0.85 + 0.1 * rand());
    shelves(S, rand, [0.5, 1.1, 1.7], (y, b) => spread(S, 0.3, S.W - 0.3, 0.4, (a) => S.lath('terracotta', P.jar, a, b, y, 0.55 + 0.25 * rand())));
    for (let k = 0; k < 6; k++) { const a = S.W - 0.55 - (k % 2) * 0.6, b = 1.2 + Math.floor(k / 2) * 0.9; S.lath('terracotta', P.big, a, b, 0, 1.1); S.lath('cloth_white', P.bowl, a, b, 0.97, 0.9); S.circle(a, b, 0.4, 0.95); }
    S.light(S.cx, 2.7, S.D * 0.5, '#ffd9a0', 1.5);
  },
  // the dyer's: vats of indigo sunk in the floor, cloth hanging from poles to drip, a beating block, blue hands and floor
  indigo(S, rand) {
    S.b('cloth_indigo', 0.3, 1.5, S.W - 0.3, 3.8, 0, 0.012);
    for (let k = 0; k < 4; k++) { const a = 0.9 + (k % 2) * 1.3, b = 2.0 + Math.floor(k / 2) * 1.6; S.lath('pottery_dark', P.vat, a, b, 0, 1.0); S.b('prussian_blue', a - 0.38, b - 0.38, a + 0.38, b + 0.38, 0.72, 0.73); S.circle(a, b, 0.5, 0.78); }
    for (const b of [S.D - 0.9, S.D - 2.0]) { S.rod('palm_trunk', 0.15, 2.6, b, S.W - 0.15, 2.6, b, 0.05, 6); for (let a = 0.5; a < S.W - 0.4; a += 0.62) S.b(['cloth_indigo', 'cloth_blue', 'cloth_indigo', 'cloth_white'][Math.floor(rand() * 4)], a - 0.22, b - 0.015, a + 0.22, b + 0.015, 1.3 + rand() * 0.2, 2.58); }
    S.b('timber', S.W - 1.0, 0.9, S.W - 0.3, 1.5, 0, 0.5, true); S.b('cloth_indigo', S.W - 0.95, 0.95, S.W - 0.35, 1.45, 0.5, 0.56);
    S.light(S.cx, 2.7, S.D * 0.5, '#d8e0ff', 1.3);
  },
  // the silversmith: the bench with the anvil, a small hearth and bellows, the tray of jewellery, chains hung in the light
  silver(S, rand) {
    counter(S, 0.1, 0.9, 1.2, 3.0, 0.8); S.b('iron', 0.4, 1.6, 0.7, 1.9, 0.8, 0.92); S.b('silver', 0.75, 1.1, 1.05, 1.4, 0.85, 0.87);
    for (let k = 0; k < 7; k++) S.lath('silver', P.bowl, 0.3 + (k % 4) * 0.2, 2.2 + Math.floor(k / 4) * 0.3, 0.85, 0.35);
    S.b('schist_rubble', S.W - 1.2, 1.0, S.W - 0.2, 2.0, 0, 0.5, true); S.b('flame', S.W - 0.9, 1.35, S.W - 0.55, 1.65, 0.5, 0.54); S.b('hide_brown', S.W - 1.15, 2.1, S.W - 0.25, 2.5, 0.2, 0.55);
    shelves(S, rand, [0.9, 1.5], (y, b) => spread(S, 0.4, S.W - 0.4, 0.5, (a) => { S.lath('silver', P.bowl, a, b, y, 0.6); if (rand() < 0.5) S.lath('bronze', P.coffee, a + 0.2, b, y, 0.7); }));
    for (let k = 0; k < 5; k++) S.rod('silver', 0.5 + k * 0.5, 2.9, S.D - 0.6, 0.5 + k * 0.5, 2.1, S.D - 0.6, 0.012, 4);
    S.b('mirror_tin', S.cx - 0.5, S.D - 0.05, S.cx + 0.5, S.D - 0.03, 1.6, 2.2);
    S.light(S.cx, 2.6, S.D * 0.45, '#fff0d0', 2.2, 8);
  },
  // the weaver: a loom with the warp stretched across the pit, the shuttle, spools and woven lengths on a rail
  weaver(S, rand) {
    const b0 = 1.4, b1 = 3.8, a0 = S.W - 2.2, a1 = S.W - 0.4;
    S.b('timber', a0, b0, a1, b0 + 0.1, 0, 1.3, true); S.b('timber', a0, b1, a1, b1 + 0.1, 0, 1.3, true); S.b('timber', a0, b0, a1, b1 + 0.1, 0, 0.03);
    for (let a = a0 + 0.1; a < a1; a += 0.09) S.b('cloth_white', a, b0 + 0.1, a + 0.008, b1, 0.94, 0.945);
    S.b('cloth_indigo', a0 + 0.1, b0 + 0.1, a1 - 0.1, b0 + 0.9, 0.94, 0.95); S.b('wood_dark', a0, 2.4, a1, 2.55, 0.9, 1.05); S.b('timber', a0 + 0.2, 3.0, a0 + 0.7, 3.4, 0, 0.4, true);
    for (let k = 0; k < 8; k++) S.lath(CLOTHS[k % 7], P.bowl, 0.35 + (k % 4) * 0.3, 1.4 + Math.floor(k / 4) * 0.35, 0, 0.45);
    S.rod('palm_trunk', 0.1, 2.4, S.D - 0.3, S.W - 0.3, 2.4, S.D - 0.3, 0.05, 6); for (let a = 0.5; a < S.W - 1; a += 0.55) S.b(CLOTHS[Math.floor(rand() * 7) + 1], a - 0.2, S.D - 0.33, a + 0.2, S.D - 0.27, 1.2 + rand() * 0.3, 2.37);
    S.light(S.cx, 2.7, S.D * 0.5, '#ffe0b0', 1.4);
  },
  // the blacksmith: forge and bellows, anvil on a log, tools on the wall, charcoal, sickles and hoes for the gardens
  smith(S, rand) {
    S.b('schist_rubble', 0.1, S.D - 2.2, 1.6, S.D - 0.1, 0, 0.8, true); S.b('flame', 0.45, S.D - 1.4, 1.2, S.D - 0.8, 0.8, 0.86); S.b('hide_brown', 1.7, S.D - 1.8, 2.5, S.D - 0.9, 0.3, 0.75); S.b('iron', 1.65, S.D - 1.9, 1.95, S.D - 1.85, 0.35, 0.4);
    S.b('palm_trunk', S.cx - 0.2, 2.2, S.cx + 0.2, 2.6, 0, 0.5, true); S.b('iron', S.cx - 0.3, 2.1, S.cx + 0.3, 2.7, 0.5, 0.62);
    for (let k = 0; k < 7; k++) S.rod('iron', 2.7 + k * 0.28, 2.4, S.D - 0.03, 2.7 + k * 0.28, 1.2 + (k % 3) * 0.2, S.D - 0.03, 0.018, 4);
    S.b('cloth_black', S.W - 1.3, 1.0, S.W - 0.3, 2.0, 0, 0.4, true); spread(S, 0.4, 1.4, 0.45, (a) => S.rod('iron', a, 0, 1.2, a + 0.1, 1.1, 1.3, 0.02, 4));
    S.lath('pottery_dark', P.vat, 0.7, 1.4, 0, 0.5); S.light(1.0, 1.4, S.D - 1.1, '#ff8a3a', 2.4, 6); S.light(S.cx, 2.7, S.D * 0.4, '#ffd9a0', 1.0);
  },
  // the carpenter: the bench, planks stacked, a door leaf of cedar leaning with its carving half done, tools on pegs
  carpenter(S, rand) {
    S.b('timber', 0.1, 1.0, 0.8, S.D - 1.5, 0, 0.85, true); S.b('cedar', 0.1, 1.0, 0.8, S.D - 1.5, 0.85, 0.9);
    for (let k = 0; k < 6; k++) S.b(k % 2 ? 'cedar' : 'timber', S.W - 1.6, 1.0, S.W - 0.1, 2.9, k * 0.07, k * 0.07 + 0.06);
    S.solid(S.W - 1.6, 1.0, S.W - 0.1, 2.9, 0, 0.45);
    for (let k = 0; k < 3; k++) { S.b('cedar', 1.3 + k * 0.7, S.D - 0.35, 1.9 + k * 0.7, S.D - 0.2, 0.1, 2.0); for (let p = 0; p < 3; p++) S.b('wood_dark', 1.4 + k * 0.7, S.D - 0.2, 1.8 + k * 0.7, S.D - 0.18, 0.3 + p * 0.55, 0.65 + p * 0.55); }
    for (let k = 0; k < 8; k++) S.rod('iron', 0.2 + k * 0.3, 1.5, S.D - 0.03, 0.2 + k * 0.3, 0.9 + (k % 3) * 0.25, S.D - 0.03, 0.015, 4);
    for (let k = 0; k < 5; k++) S.b('thatch', S.cx - 0.5 + k * 0.2, 2.6, S.cx - 0.3 + k * 0.2, 2.75, 0, 0.012 + k * 0.01);
    S.light(S.cx, 2.7, S.D * 0.5, '#ffe0b0', 1.4);
  },
  // water jars, pots and the big storage jars of the potters of the wadi, stacked on mats; nothing much else
  jars(S, rand) {
    for (let r = 0; r < 4; r++) for (let a = 0.5; a < S.W - 0.3; a += 0.6) { if (Math.abs(a - S.cx) < 0.85 && r < 2) continue; const b = 1.4 + r * 1.35; S.lath(rand() < 0.3 ? 'pottery_dark' : 'terracotta', rand() < 0.5 ? P.big : P.jar, a, b, 0, rand() < 0.5 ? 1.0 : 1.5); if (a < 1 || a > S.W - 1) S.circle(a, b, 0.35, 0.9); }
    S.b('reed_mat', 0.1, 0.9, S.W - 0.1, S.D - 0.1, 0, 0.012);
    for (let k = 0; k < 3; k++) { S.lath('terracotta', P.bowl, 1.1 + k * 0.55, 0.9, 0, 1.8); }
    S.light(S.cx, 2.7, S.D * 0.5, '#ffe0b0', 1.3);
  },
  // the tailor: a low table, the treadle-less machine of the time (a needle and thread), heaps of cloth, a chest, a mirror
  tailor(S, rand) {
    S.b('reed_mat', S.cx - 1.0, 1.4, S.cx + 1.6, 2.8, 0, 0.12); S.b('timber', S.cx + 0.2, 1.6, S.cx + 1.4, 2.4, 0.12, 0.42);
    for (let k = 0; k < 5; k++) S.b(CLOTHS[(k * 2) % 8], 0.2 + (k % 3) * 0.3, 1.0 + Math.floor(k / 3) * 0.5 + (k % 2) * 0.1, 0.5 + (k % 3) * 0.3, 1.4 + Math.floor(k / 3) * 0.5, 0, 0.2 + 0.05 * k);
    S.b('timber', S.W - 1.3, 1.0, S.W - 0.2, 1.7, 0, 0.6, true); S.b('iron', S.W - 1.3, 1.3, S.W - 0.2, 1.36, 0.45, 0.5);
    shelves(S, rand, [0.6, 1.3, 2.0], (y, b) => bolts(S, rand, y, b, 0.35, S.W - 0.35, 0.18));
    for (let k = 0; k < 4; k++) S.rod(CLOTHS[(k * 3 + 1) % 8], 0.4 + k * 0.7, 2.7, 1.1, 0.4 + k * 0.7, 1.3, 1.1, 0.07, 6);
    S.b('mirror_tin', 0.12, 2.0, 0.14, 2.7, 1.2, 1.9);
    S.light(S.cx, 2.7, S.D * 0.5, '#ffe0b0', 1.4);
  },
  // the barber: a stool and a mirror, a basin and jug, razors on a tray, benches for waiting
  barber(S, rand) {
    S.b('timber', S.cx - 0.3, 2.4, S.cx + 0.3, 3.0, 0, 0.46, true); S.b('mirror_tin', S.cx - 0.45, S.D - 0.06, S.cx + 0.45, S.D - 0.03, 1.2, 2.0); S.b('wood_dark', S.cx - 0.52, S.D - 0.09, S.cx + 0.52, S.D - 0.05, 1.15, 2.05);
    S.lath('bronze', P.pan, S.W - 0.6, 1.4, 0.85, 1.4); S.b('timber', S.W - 0.9, 1.1, S.W - 0.3, 1.7, 0, 0.85, true); S.lath('bronze', P.coffee, S.W - 0.4, 1.4, 0.85, 1.1);
    for (const side of [0, 1]) { const a0 = side ? S.W - 0.6 : 0.05, a1 = side ? S.W - 0.05 : 0.6; if (!side) { S.b('timber', a0, 1.1, a1, 3.8, 0, 0.42, true); S.b('reed_mat', a0, 1.1, a1, 3.8, 0.42, 0.47); } }
    S.b('timber', 0.1, S.D - 0.5, 0.9, S.D - 0.1, 0, 0.8, true); for (let k = 0; k < 4; k++) S.b('silver', 0.2 + k * 0.17, S.D - 0.4, 0.28 + k * 0.17, S.D - 0.2, 0.8, 0.83);
    S.light(S.cx, 2.7, S.D * 0.5, '#ffe8c0', 1.5);
  },
};
export const TRADE_NAMES = Object.keys(TRADE);

/** The furnishing of a hollowed shop by its trade. */
export function furnishShop(ctx, el) {
  const S = frameOf(ctx, el), rand = rng(el.seed ^ 77);
  (TRADE[el.shop.trade] ?? TRADE.jars)(S, rand);
  // every room: a lamp hung on a cord, the plank shutters' hooks, a rug at the counter's foot
  S.rod('iron', S.cx + 0.6, 3.0, 1.0, S.cx + 0.6, GH - 0.2, 1.0, 0.008, 3); S.b('lamp_glass', S.cx + 0.52, 1.0 - 0.08, S.cx + 0.68, 1.0 + 0.08, 2.75, 2.95);
}

/** The palace's hall of piers (the sultan's reception rooms on the ground floor): { rect (the house's), front, door, seed }. */
export function furnishHall(ctx, el) {
  const S = frameOf(ctx, el), rand = rng(el.seed ^ 31), { W, D } = S;
  // the piers in two rows of columns along the hall, with a timber bracket each; the beams between
  const nx = Math.floor(W / 5), sx = W / nx;
  for (let i = 1; i < nx; i++) for (const b of [D * 0.3, D * 0.62]) { const a = i * sx; S.b('lime_plaster', a - 0.35, b - 0.35, a + 0.35, b + 0.35, 0, GH - F0 - 0.2, true); S.b('timber', a - 0.55, b - 0.55, a + 0.55, b + 0.55, GH - F0 - 0.45, GH - F0 - 0.2); S.b('cedar', a - 0.3, b - 0.3, a + 0.3, b + 0.3, 0.3, 0.4); }
  for (const b of [D * 0.3, D * 0.62]) S.b('timber', 0.1, b - 0.12, W - 0.1, b + 0.12, GH - F0 - 0.48, GH - F0 - 0.4);
  // the dais at the back: carpet, the seat of the sultan with cushions, brass coffee pots, carved chests either side
  S.b('timber', W / 2 - 3.5, D - 3.2, W / 2 + 3.5, D - 0.1, 0, 0.3, true); rug(S, W / 2 - 3.3, D - 3.0, W / 2 + 3.3, D - 0.3, 0.3 + 0.0 ? 'cloth_maroon' : 'cloth_maroon');
  S.b('cloth_maroon', W / 2 - 3.3, D - 3.0, W / 2 + 3.3, D - 0.3, 0.3, 0.325);
  S.b('wood_dark', W / 2 - 0.9, D - 1.2, W / 2 + 0.9, D - 0.15, 0.325, 0.75, true); S.b('cloth_red', W / 2 - 0.8, D - 1.1, W / 2 + 0.8, D - 0.2, 0.75, 0.9);
  for (const d of [-2.8, 2.8]) { S.b('timber', W / 2 + d - 0.6, D - 1.2, W / 2 + d + 0.6, D - 0.5, 0.325, 0.95, true); S.lath('bronze', P.coffee, W / 2 + d, D - 0.85, 0.95, 1.3); }
  // seats along both long walls: mats on low platforms and bolster cushions; carpets down the middle
  for (const side of [0, 1]) { const a0 = side ? W - 1.0 : 0.05, a1 = side ? W - 0.05 : 1.0; S.b('timber', a0, 3.5, a1, D - 3.6, 0, 0.35, true); S.b('reed_mat', a0, 3.5, a1, D - 3.6, 0.35, 0.39); for (let b = 4.0; b < D - 4; b += 1.3) S.b(CLOTHS[(Math.floor(b) + side) % 4 + 2], side ? a0 + 0.1 : a1 - 0.5, b, side ? a0 + 0.5 : a1 - 0.1, b + 0.5, 0.39, 0.75); }
  for (let k = 0; k < 3; k++) rug(S, W / 2 - 2.5, 3.5 + k * 3.8, W / 2 + 2.5, 6.6 + k * 3.8, ['cloth_red', 'cloth_maroon', 'cloth_ochre'][k]);
  // the guard room at the front: a bench, a rack of long guns (matchlocks) and swords, a hearth for coffee
  S.b('timber', 0.1, 0.9, 1.6, 1.5, 0, 0.42, true); for (let k = 0; k < 5; k++) S.rod('wood_dark', 2.2 + k * 0.22, 0.05, 0.6, 2.4 + k * 0.22, 1.7, 0.4, 0.02, 4);
  S.b('timber', 2.0, 0.3, 3.3, 0.5, 0.0, 0.1);
  // water jars in the corners and brass lamps hung along the hall
  for (const [a, b] of [[0.5, D - 0.5], [W - 0.5, D - 0.5], [0.5, 2.4], [W - 0.5, 2.4]]) { S.lath('terracotta', P.big, a, b, 0, 1.1); S.circle(a, b, 0.4, 0.95); }
  for (let i = 1; i <= nx; i++) for (const b of [D * 0.46]) { S.light(i * sx - sx / 2, 2.6, b, '#ffcf8a', 2.2, 9); S.rod('iron', i * sx - sx / 2, 2.8, b, i * sx - sx / 2, GH - F0 - 0.2, b, 0.008, 3); S.lath('bronze', P.coffee, i * sx - sx / 2, b, 2.45, 0.8); }
  void fl; void rand;
}
