// The trades of the capital's ordinary households (docs/settlements/nara.md §17): each house of a block
// follows one trade, chosen by a rule from its lot's seed, and the trade gives both its front (what stands
// under the eave outside) and, where the house is open, its room.
//
// Trades: weaver (hemp cloth, the tax cloth of the cho [inferred]), smith (the metal workshops excavated in the
// early blocks, Monograph 46), lacquer worker (the lacquer wares of the same blocks), farmer (rice, a steamer on the
// hearth, hoes, a straw rain-cloak), potter (jars and bowls), straw worker (rope, sandals, mats), and the plain home.
//
// craftOf(el) -> trade | null (shops and the service quarter's houses have their own); craftFront / craftRoom
// draw with the kit of house.js's serviceHouse (Z: a box on the free side of the door, t along the wall from the
// free wall, v in from the door wall; U: t -> u; the earth floor at fy, the raised floor at rf).

export const CRAFTS = ['weaver', 'smith', 'lacquer', 'farm', 'potter', 'straw', 'home'];
export const WORKING = CRAFTS.filter((c) => c !== 'home');

/** The trade of a house: by a rule of the lot's seed (a hash, so neighbours differ), none for shops and service houses. */
export function craftOf(el) {
  if (el.use || el.shop) return null;
  return CRAFTS[(Math.imul((el.seed || 1) | 0, 2654435761) >>> 11) % CRAFTS.length];
}

const BOWL = [[0.001, 0], [0.06, 0], [0.1, 0.03], [0.14, 0.09], [0.15, 0.12], [0.001, 0.12]];
const POT = [[0.001, 0], [0.12, 0], [0.2, 0.12], [0.22, 0.26], [0.14, 0.38], [0.11, 0.42], [0.001, 0.42]];

/** What stands outside under the eave, on the free side of the door. */
export function craftFront(c, k) {
  const { Z, tall, U, y, zw, lat } = k;
  const W = Math.min(zw, 3.1);
  if (W < 1.6) return;
  if (c === 'weaver') {
    // a drying pole on two posts, skeins of hemp thread and strips of cloth hung from it, a basket of hemp stalks
    const t1 = W - 0.25;
    tall('bamboo_culm', U(0.3), -1.0, 0.045, 2.1); tall('bamboo_culm', U(t1), -1.0, 0.045, 2.1);
    Z(0.25, -1.04, t1 + 0.05, -0.96, y + 2.1, y + 2.16, 'bamboo_culm');
    for (let t = 0.55, i = 0; t < t1 - 0.15; t += 0.3, i++) Z(t, -1.03, t + (i % 3 === 2 ? 0.22 : 0.12), -0.97, y + (i % 3 === 2 ? 1.2 : 1.45), y + 2.1, ['rope_fibre', 'cloth_white', 'rope_fibre', 'cloth_indigo'][i % 4]);
    Z(0.3, -0.7, 0.8, -0.2, y, y + 0.5, 'wicker', true); Z(0.34, -0.66, 0.76, -0.24, y + 0.5, y + 0.62, 'rope_fibre');
  } else if (c === 'smith') {
    // a stone anvil block, a quenching trough, a basket of charcoal by the door
    Z(0.25, -1.3, 0.85, -0.7, y, y + 0.4, 'basalt', true); Z(0.3, -1.25, 0.8, -0.75, y + 0.4, y + 0.44, 'iron');
    Z(1.2, -1.2, 2.3, -0.6, y, y + 0.45, 'timber', true); Z(1.26, -1.14, 2.24, -0.66, y + 0.45, y + 0.47, 'opening');
    Z(2.5, -0.7, 3.0, -0.2, y, y + 0.4, 'wicker', true); Z(2.54, -0.66, 2.96, -0.24, y + 0.4, y + 0.5, 'hide_black');
  } else if (c === 'lacquer') {
    // jars of raw lacquer sap under straw caps in a row, a drying frame with dishes set out on it
    for (let i = 0; i < 3; i++) { const t = 0.5 + i * 0.6; if (t < W - 0.3) { lat('pottery_dark', [[0.001, 0], [0.16, 0], [0.26, 0.28], [0.22, 0.5], [0.14, 0.58], [0.001, 0.58]], U(t), -0.55, y); lat('thatch', [[0.14, 0.58], [0.2, 0.64], [0.001, 0.8]], U(t), -0.55, y); k.colAt(U(t), -0.55, 0.28, y + 0.6); } }
    if (W > 2.6) { Z(2.2, -1.2, W - 0.1, -0.6, y + 0.45, y + 0.5, 'wood_dark', true); for (const t of [2.25, W - 0.2]) Z(t, -1.2, t + 0.07, -1.13, y, y + 0.45, 'wood_dark'); for (let i = 0; i < 3; i++) lat(i % 2 ? 'lacquer_black' : 'lacquer_red', BOWL, U(2.5 + i * 0.28 > W - 0.2 ? W - 0.2 : 2.5 + i * 0.28), -0.9, y + 0.5); }
  } else if (c === 'farm') {
    // a mortar of a hollowed log and its pestle for the rice, sheaves of straw on a drying frame, a hoe against the wall
    lat('timber', [[0.001, 0], [0.3, 0], [0.34, 0.2], [0.3, 0.55], [0.001, 0.55]], U(0.55), -0.8, y); lat('opening', [[0.001, 0.55], [0.22, 0.55], [0.001, 0.5]], U(0.55), -0.8, y);
    k.colAt(U(0.55), -0.8, 0.32, y + 0.55);
    Z(0.95, -0.62, 1.05, -0.58, y, y + 1.3, 'wood_dark');
    if (W > 2.2) { for (const t of [1.5, W - 0.2]) tall('wood_dark', U(t), -1.0, 0.05, 1.8); Z(1.45, -1.04, W - 0.15, -0.96, y + 1.75, y + 1.81, 'bamboo_culm'); for (let t = 1.7; t < W - 0.3; t += 0.28) Z(t, -1.08, t + 0.18, -0.92, y + 0.95, y + 1.75, 'thatch'); }
  } else if (c === 'potter') {
    // pots drying in rows on a mat before the door, a heap of clay under a cloth
    Z(0.2, -1.5, W - 0.1, -0.4, y, y + 0.03, 'reed_mat');
    for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) { const t = 0.5 + i * 0.6; if (t < W - 0.25) lat('terracotta', POT, U(t), -0.7 - r * 0.5, y + 0.03); }
    Z(0.2, -0.38, 0.0 + 0.2 + 0.01, -0.36, y, y + 0.01, 'opening');
  } else if (c === 'straw') {
    // coils of rope hung on pegs, a hank of straw sandals, a bundle of straw standing against the wall
    Z(0.2, -0.35, W - 0.2, -0.3, y + 1.55, y + 1.62, 'wood_dark');
    for (let t = 0.4, i = 0; t < W - 0.3; t += 0.4, i++) Z(t, -0.42, t + (i % 2 ? 0.2 : 0.3), -0.3, y + (i % 2 ? 0.95 : 0.8), y + 1.55, i % 2 ? 'hide_tan' : 'rope_fibre');
    Z(0.3, -1.1, 1.1, -0.5, y, y + 1.1, 'thatch', true);
  }
}

/** The room of the trade (the house is open): the kit adds `lights`. */
export function craftRoom(c, k) {
  const { Z, lat, U, Jr, lampAt, rf, fy, D, T, P, lights } = k;
  let lamp = null;
  if (c === 'weaver') {
    // a ground loom: four posts with side rails, the warp threads stretched between the beams, cloth woven near the weaver; her bench; a basket of hemp, skeins on pegs
    for (const [a, b] of [[0.2, 2.6], [2.1, 2.6], [0.2, 4.3], [2.1, 4.3]]) Z(a, b, a + 0.08, b + 0.08, rf, rf + 0.9, 'wood_dark');
    for (const v of [2.6, 4.3]) Z(0.2, v, 2.18, v + 0.08, rf + 0.78, rf + 0.86, 'timber');
    for (const t of [0.2, 2.1]) Z(t, 2.6, t + 0.08, 4.38, rf + 0.6, rf + 0.66, 'timber');
    for (let i = 0; i < 9; i++) Z(0.32 + i * 0.2, 3.3, 0.345 + i * 0.2, 4.3, rf + 0.67, rf + 0.69, 'cloth_white');
    Z(0.3, 2.7, 2.08, 3.3, rf + 0.67, rf + 0.7, 'cloth_ochre'); for (const t of [0.6, 1.5]) Z(t, 2.7, t + 0.14, 3.3, rf + 0.7, rf + 0.705, 'cloth_indigo');
    Z(0.2, 2.5, 2.2, 2.6, rf + 0.88, rf + 1.0, 'cloth_ochre');
    Z(0.6, 1.95, 1.8, 2.35, rf, rf + 0.28, 'timber', true);
    Z(2.4, 2.6, 2.9, 3.1, rf, rf + 0.3, 'wicker', true); Z(2.44, 2.64, 2.86, 3.06, rf + 0.3, rf + 0.42, 'rope_fibre');
    Z(0.0, 3.0, 0.06, 4.6, rf + 1.45, rf + 1.51, 'wood_dark'); for (let i = 0; i < 5; i++) Z(0.0, 3.1 + i * 0.3, 0.1, 3.22 + i * 0.3, rf + 0.8, rf + 1.45, 'rope_fibre');
    lamp = lampAt(U(1.6), 5.3, rf);
  } else if (c === 'smith') {
    // the clay furnace on the earth floor with a glowing crater and a bellows of wood and hide at its side, a stone anvil, crucibles and ingots on a mat, a rack of tongs and hammers, a basket of charcoal
    Z(0, 0.5, 1.1, 1.4, fy, fy + 0.8, 'earth_wall', true); Z(0.3, 0.7, 0.8, 1.2, fy + 0.8, fy + 0.84, 'granite_black'); Z(0.4, 0.8, 0.7, 1.1, fy + 0.84, fy + 0.95, 'flame');
    Z(1.15, 0.65, 2.0, 1.15, fy, fy + 0.5, 'timber', true); Z(1.15, 0.65, 2.0, 1.15, fy + 0.5, fy + 0.56, 'hide_tan'); Z(0.95, 0.85, 1.2, 0.95, fy + 0.5, fy + 0.58, 'iron');
    Z(0.2, 2.4, 0.8, 3.0, rf, rf + 0.35, 'basalt', true); Z(0.3, 2.5, 0.7, 2.9, rf + 0.35, rf + 0.38, 'iron');
    Z(1.2, 2.4, 2.4, 3.0, rf, rf + 0.03, 'reed_mat'); for (let i = 0; i < 3; i++) lat('pottery_dark', [[0.001, 0], [0.07, 0], [0.1, 0.1], [0.07, 0.16], [0.001, 0.16]], U(1.45 + i * 0.35), 2.55, rf + 0.03);
    for (let i = 0; i < 3; i++) Z(1.5 + i * 0.3, 2.75, 1.7 + i * 0.3, 2.9, rf + 0.03, rf + 0.08, 'bronze');
    Z(0.0, 3.4, 0.06, 4.9, rf + 0.9, rf + 1.9, 'wood_dark'); for (let i = 0; i < 6; i++) Z(0.06, 3.5 + i * 0.24, 0.14, 3.55 + i * 0.24, rf + 1.1 + (i % 3) * 0.25, rf + 1.55 + (i % 3) * 0.25, 'iron');
    Z(1.9, 4.8, 2.5, 5.4, rf, rf + 0.4, 'wicker', true); Z(1.94, 4.84, 2.46, 5.36, rf + 0.4, rf + 0.5, 'hide_black');
    const q = P(U(0.55), 0.95); if (lights) lights.push({ at: [q[0], fy + 1.5, q[1]], color: '#ff9a4a', intensity: 2.4, distance: 6 });
  } else if (c === 'lacquer') {
    // a bench with a stone slab and the tools for mixing, a tub of sap, a drying rack of three shelves with bowls and trays, hung sheets of hemp cloth for straining
    Z(0.2, 2.6, 1.6, 3.3, rf + 0.3, rf + 0.36, 'timber', true); for (const [a, b] of [[0.25, 2.65], [1.5, 2.65], [0.25, 3.2], [1.5, 3.2]]) Z(a, b, a + 0.06, b + 0.06, rf, rf + 0.3, 'wood_dark');
    Z(0.4, 2.7, 1.0, 3.2, rf + 0.36, rf + 0.4, 'granite_grey'); Z(1.1, 2.8, 1.4, 2.88, rf + 0.36, rf + 0.38, 'wood_dark'); Z(1.1, 3.0, 1.4, 3.06, rf + 0.36, rf + 0.39, 'lacquer_red');
    Jr(0.25, 0.5, U(2.3), 3.0, rf);
    Z(0.1, 5.0, 2.6, 5.4, rf, rf + 1.6, 'wood_dark', true);
    [0.5, 1.0, 1.5].forEach((q, r) => { Z(0.08, 4.95, 2.62, 5.45, rf + q, rf + q + 0.04, 'timber'); for (let i = 0; i < 6; i++) lat((i + r) % 2 ? 'lacquer_black' : 'lacquer_red', BOWL, U(0.35 + i * 0.4), 5.2, rf + q + 0.04); });
    Z(0.0, 3.6, 0.05, 4.6, rf + 1.0, rf + 1.8, 'linen');
    lamp = lampAt(U(1.9), 4.2, rf);
  } else if (c === 'farm') {
    // sacks of rice stacked in two layers, a steamer (koshiki) over its pot, a rain-cloak of straw and two hoes on the wall, baskets of grain
    Z(0.1, 5.0, 1.0, 6.0, rf, rf + 0.35, 'sacking', true); Z(0.15, 5.1, 0.95, 5.9, rf + 0.35, rf + 0.7, 'sacking', true);
    lat('terracotta', [[0.001, 0], [0.18, 0], [0.26, 0.14], [0.3, 0.28], [0.001, 0.3]], U(1.9), 5.4, rf); lat('timber', [[0.28, 0.3], [0.28, 0.7], [0.2, 0.76], [0.001, 0.8]], U(1.9), 5.4, rf);
    Z(0, 2.4, 0.1, 3.4, rf + 0.9, rf + 1.7, 'thatch');
    for (const v of [3.8, 4.1]) { Z(0.0, v, 0.06, v + 0.06, rf + 0.1, rf + 1.9, 'wood_dark'); Z(0.0, v - 0.1, 0.34, v + 0.16, rf + 1.8, rf + 1.9, 'iron'); }
    for (let i = 0; i < 2; i++) { Z(1.4 + i * 0.7, 2.4, 2.0 + i * 0.7, 3.0, rf, rf + 0.4, 'wicker', true); Z(1.45 + i * 0.7, 2.45, 1.95 + i * 0.7, 2.95, rf + 0.4, rf + 0.46, 'cloth_ochre'); }
    lamp = lampAt(U(1.5), 4.4, rf);
  } else if (c === 'potter') {
    // a clay heap and a trough of water, a kick-wheel with a pot on it, shelves of drying pots
    Z(0.1, 2.4, 0.7, 3.0, rf, rf + 0.3, 'earth_wall', true); Z(0.1, 3.2, 0.8, 3.7, rf, rf + 0.3, 'timber', true); Z(0.14, 3.24, 0.76, 3.66, rf + 0.3, rf + 0.31, 'opening');
    Z(1.15, 2.95, 1.25, 3.05, rf, rf + 0.3, 'wood_dark', true); lat('timber', [[0.001, 0], [0.3, 0], [0.3, 0.05], [0.001, 0.05]], U(1.2), 3.0, rf + 0.3); lat('terracotta', POT, U(1.2), 3.0, rf + 0.35);
    Z(0.1, 5.0, 2.6, 5.4, rf, rf + 1.5, 'wood_dark', true);
    [0.5, 1.0].forEach((q, r) => { Z(0.08, 4.95, 2.62, 5.45, rf + q, rf + q + 0.04, 'timber'); for (let i = 0; i < 6; i++) lat('terracotta', POT, U(0.35 + i * 0.4), 5.2, rf + q + 0.04 + (r ? 0 : 0)); });
    for (let i = 0; i < 4; i++) lat('terracotta', POT, U(0.4 + i * 0.5), 5.2, rf);
    lamp = lampAt(U(1.7), 4.2, rf);
  } else if (c === 'straw') {
    // a heap of straw in the corner, a stone and mallet for beating it soft, sandals set in a row on a rack, coils of rope
    Z(0.1, 4.6, 1.8, 6.0, rf, rf + 0.6, 'thatch', true);
    Z(2.0, 2.6, 2.5, 3.1, rf, rf + 0.25, 'granite_grey', true); Z(2.1, 2.7, 2.4, 2.8, rf + 0.25, rf + 0.32, 'wood_dark');
    Z(0.0, 2.4, 0.06, 3.9, rf + 0.8, rf + 0.86, 'wood_dark'); for (let i = 0; i < 5; i++) Z(0.06, 2.5 + i * 0.3, 0.2, 2.65 + i * 0.3, rf + 0.5, rf + 0.8, 'hide_tan');
    Z(1.0, 2.5, 1.6, 3.0, rf, rf + 0.3, 'rope_fibre', true);
    lamp = lampAt(U(1.5), 3.9, rf);
  }
  if (lamp && lights) lights.push({ at: [lamp[0], rf + 1.0, lamp[1]], color: '#ffd9a0', intensity: 2.4, distance: 7 });
  void D; void T; void Jr;
}
