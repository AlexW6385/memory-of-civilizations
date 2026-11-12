// The village's trades (docs/settlements/tang-wutai.md §13): a pilgrims' inn with a long communal kang, a smithy, a
// shop of incense, candles and lamp oil, and a hostel of four cells — each on a plot of the main lane, each with a furnished
// interior that can be entered. Pure data: elements of the `chinese` style (walls, blocks, floors, a gabled or flat roof) and
// of the street life, in settlement coordinates, from the plot's frame (chinese/village.js `frame`).

import { frame } from '../../styles/chinese/village.js';
import { height } from './layout.js';

const YAW = { n: 0, s: Math.PI, e: -Math.PI / 2, w: Math.PI / 2 };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/** The tools of one plot: B (a block), wall, put (a life element), fig (a person), lamp, in the plot's local frame (u along the front, v inward). */
function tools(lot) {
  const fr = frame(lot.rect, lot.front), { L, D, P, R } = fr, C = [], Lf = [], smoke = [];
  const B = (mat, u0, v0, u1, v1, ya, yb, collide = false) => C.push({ t: 'block', rect: R(u0, v0, u1, v1), y0: ya, y1: yb, mat, collide });
  const wall = (u0, v0, u1, v1, y0, y1, openings = [], mat = 'plaster_white', th = 0.34) => C.push({ t: 'wall', a: P(u0, v0), b: P(u1, v1), th, y0, y1, openings, mat });
  const put = (el, u, v, y, extra = {}) => { const [x, z] = P(u, v); Lf.push({ ...el, at: [x, z], y, ...extra }); };
  const lamp = (u, v, y, h = 0.3, intensity = 1.5, distance = 6) => { const [x, z] = P(u, v); C.push({ t: 'tang_lamp', at: [x, z], y, h, intensity, distance }); };
  const cloth = ['cloth_indigo', 'cloth_grey', 'cloth_brown', 'cloth_white', 'cloth_ochre'];
  // a person: facing toward the lane (face 'lane') or into the plot ('in'), or a way given as a local direction (du, dv)
  const fig = (u, v, y, seed, face = 'lane', extra = {}) => {
    const [x, z] = P(u, v);
    let rot = face === 'lane' ? YAW[lot.front] : face === 'in' ? YAW[lot.front] + Math.PI : 0;
    if (Array.isArray(face)) { const a = P(u, v), b = P(u + face[0], v + face[1]); rot = Math.atan2(-(b[0] - a[0]), -(b[1] - a[1])); }
    Lf.push({ t: 'figure', at: [x, z], y, rot, seed, dress: 'robe', cloth: cloth[seed % 5], cloth2: 'cloth_white', skin: 'skin_light', hair: 'topknot', hat: 'none', carry: 'none', pose: 'stand', ...extra });
  };
  return { fr, L, D, P, R, C, Lf, smoke, B, wall, put, lamp, fig };
}

/** The ground of a plot's front (where the door is reached from) and the floor the building takes: the door's ground and a step. */
function level(t, ub0, ub1, vb0, vb1) {
  const { R, P } = t, rect = R(ub0, vb0, ub1, vb1);
  const hs = [[rect[0], rect[1]], [rect[2], rect[1]], [rect[0], rect[3]], [rect[2], rect[3]]].map(([a, b]) => height(a, b));
  const [dx, dz] = P((ub0 + ub1) / 2, vb0 - 0.6), gd = height(dx, dz);
  return { F: gd + 0.3, foot: Math.min(...hs, gd), gd };
}

/** The footing, the floor, the step before the door. dir: the way up the step leads (into the building). */
function body(t, lot, ub0, ub1, vb0, vb1, F, foot, floorMat = 'brick_grey', doorU = (ub0 + ub1) / 2, doorW = 2.6) {
  const { C, B, R, fr } = t;
  B('schist_rubble', ub0 - 0.15, vb0 - 0.15, ub1 + 0.15, vb1 + 0.15, foot - 0.45, F - 0.14, false);
  C.push({ t: 'floor', rect: R(ub0 - 0.15, vb0 - 0.15, ub1 + 0.15, vb1 + 0.15), y: F, mat: floorMat, th: 0.12 });
  const dir = { n: 's', s: 'n', e: 'w', w: 'e' }[lot.front];
  const r = R(doorU - doorW / 2 - 0.3, vb0 - 1.0, doorU + doorW / 2 + 0.3, vb0 - 0.15);
  C.push({ t: 'stair', rect: r, dir, y0: F - 0.3, y1: F, riser: 0.15, base: foot - 0.4, mat: 'limestone' });
  void fr;
}

/** A flat earth roof with its parapet and coping (as the village houses'), or a gabled tile roof over the building. */
function flatRoof(t, ub0, ub1, vb0, vb1, top, chim = null) {
  const { B } = t;
  B('mud_plaster', ub0 - 0.4, vb0 - 0.5, ub1 + 0.4, vb1 + 0.4, top, top + 0.3, true);
  for (const [a, b, c, d] of [[ub0 - 0.4, vb0 - 0.5, ub1 + 0.4, vb0 - 0.32], [ub0 - 0.4, vb0 - 0.5, ub0 - 0.22, vb1 + 0.4], [ub1 + 0.22, vb0 - 0.5, ub1 + 0.4, vb1 + 0.4]]) {
    B('brick_grey', a, b, c, d, top + 0.3, top + 0.7); B('tile_grey', a - 0.04, b - 0.04, c + 0.04, d + 0.04, top + 0.7, top + 0.77);
  }
  for (let u = ub0 + 0.4; u < ub1; u += 0.6) B('timber', u - 0.07, vb0 - 0.6, u + 0.07, vb0 - 0.2, top - 0.18, top - 0.02);
  for (const u of [ub0 + 1.2, ub1 - 1.2]) B('limestone', u - 0.1, vb0 - 0.9, u + 0.1, vb0 - 0.3, top + 0.3, top + 0.38);
  if (chim) { const [cu, cv] = chim; B('brick_grey', cu - 0.34, cv - 0.34, cu + 0.34, cv + 0.34, top + 0.3, top + 2.0); B('tile_grey', cu - 0.43, cv - 0.43, cu + 0.43, cv + 0.43, top + 2.0, top + 2.09); }
}
function gableRoof(t, ub0, ub1, vb0, vb1, top, over = 1.1, rise = 1.9) {
  const { C, P } = t, [cx, cz] = P((ub0 + ub1) / 2, (vb0 + vb1) / 2), W = ub1 - ub0, Dd = vb1 - vb0, alongZ = t.fr.P(1, 0)[0] === t.fr.P(0, 0)[0];
  C.push({ t: 'gable_roof_c', c: [cx, cz], A: W / 2 + 0.6, B: Dd / 2 + over, y: top + 0.25, rise, mat: 'tile_grey', soffit: 'timber_red', gableMat: 'plaster_white', ...(alongZ ? { alongZ: true } : {}) });
  return top + 0.25 + rise;
}

/** The ceiling of boards over the room, on beams every metre (what one sees overhead indoors). */
function ceiling(t, ub0, ub1, vb0, vb1, top) {
  const { B } = t;
  B('timber', ub0, vb0, ub1, vb1, top - 0.06, top - 0.01);
  for (let u = ub0 + 0.8; u < ub1 - 0.3; u += 1.1) B('wood_dark', u - 0.1, vb0, u + 0.1, vb1, top - 0.28, top - 0.06);
}

// ── the pilgrims' inn ───────────────────────────────────────────────────────────
function inn(lot) {
  const t = tools(lot), { L, B, C, Lf, wall, put, lamp, fig, smoke } = t, rand = rng(lot.seed + 3);
  const ub0 = 1.0, ub1 = L - 1.0, vb0 = 3.0, vb1 = vb0 + 7.2, Hh = 3.5, W = ub1 - ub0, uc = (ub0 + ub1) / 2;
  const { F, foot } = level(t, ub0, ub1, vb0, vb1), top = F + Hh, T = 0.17;
  body(t, lot, ub0, ub1, vb0, vb1, F, foot, 'brick_grey', uc, 2.4);
  // walls: the front with its door and two papered windows, the sides and back closed but for a door to the yard, the partition between the hall and the guests' kang room
  const wm = 'plaster_white', y0 = F;
  wall(ub0, vb0, ub1, vb0, y0, top, [{ at: uc - ub0, w: 2.4, h: 2.4, y0: F }, { at: 2.1, w: 1.6, h: 1.25, y0: F + 0.95 }, { at: W - 2.1, w: 1.6, h: 1.25, y0: F + 0.95 }, { at: uc - ub0 - 4.2, w: 1.5, h: 1.25, y0: F + 0.95 }, { at: uc - ub0 + 4.2, w: 1.5, h: 1.25, y0: F + 0.95 }], wm);
  wall(ub0, vb0, ub0, vb1, y0, top, [], wm); wall(ub1, vb0, ub1, vb1, y0, top, [], wm);
  wall(ub0, vb1, ub1, vb1, y0, top, [{ at: uc - ub0 + 3.4, w: 1.2, h: 2.1, y0: F }], wm);
  wall(ub0, vb0 + 3.9, ub1, vb0 + 3.9, y0, top, [{ at: 3.2, w: 1.5, h: 2.1, y0: F }, { at: W - 3.2, w: 1.5, h: 2.1, y0: F }], wm, 0.24);
  // timber frame showing on the front: posts and a tie beam, a red band under the eave
  for (const u of [ub0, uc - 1.4, uc + 1.4, ub1]) B('timber_red', u - 0.14, vb0 - 0.2, u + 0.14, vb0 + 0.1, F, top, false);
  B('timber_red', ub0 - 0.1, vb0 - 0.2, ub1 + 0.1, vb0 + 0.1, top - 0.4, top - 0.1, false);
  B('timber_red', uc - 1.5, vb0 - 0.22, uc + 1.5, vb0 + 0.12, F + 2.4, F + 2.62, false);          // the door's lintel
  B('wall_red', ub0 + 0.02, vb0 - 0.19, ub0 + 3.1, vb0 - 0.17, F + 0.1, F + 0.9, false);          // painted dado
  ceiling(t, ub0 + T, ub1 - T, vb0 + T, vb1 - T, top - 0.1);
  const apex = gableRoof(t, ub0, ub1, vb0, vb1, top, 1.15, 1.9);
  // the hall (front): the counter with its shelf of wine jars, four tea tables with stools, a stove with its pots, a lamp on each
  B('lacquer_chestnut', ub1 - 4.4, vb0 + 0.7, ub1 - 0.6, vb0 + 1.4, F, F + 1.0, true); B('lacquer_chestnut', ub1 - 4.5, vb0 + 0.62, ub1 - 0.52, vb0 + 1.48, F + 1.0, F + 1.07, false);
  B('lacquer_chestnut', ub1 - 4.4, vb0 + 1.9, ub1 - 0.6, vb0 + 2.05, F + 1.0, F + 1.06, false);                // the shelf behind the counter
  for (let k = 0; k < 4; k++) put({ t: 'pot', kind: 'vat', n: 1, seed: lot.seed + k }, ub1 - 3.8 + k * 1.0, vb0 + 2.6, F);
  for (let k = 0; k < 3; k++) B(k % 2 ? 'glaze_green' : 'pottery_dark', ub1 - 4.0 + k * 1.2, vb0 + 1.92, ub1 - 3.7 + k * 1.2, vb0 + 2.02, F + 1.06, F + 1.4, false);
  for (const [u, v] of [[ub0 + 2.3, vb0 + 1.9], [ub0 + 4.6, vb0 + 2.8], [ub0 + 7.0, vb0 + 2.9], [ub0 + 2.2, vb0 + 3.3 - 0.3]]) put({ t: 'tea_table', seed: lot.seed + (u | 0) }, u, v, F, { rot: rand() * 3 });
  B('brick_grey', ub0 + 0.35, vb0 + 0.35, ub0 + 1.9, vb0 + 1.25, F, F + 0.85, true);                      // the stove by the door
  put({ t: 'pot', kind: 'vat', n: 1, seed: lot.seed + 9 }, ub0 + 0.8, vb0 + 1.7, F);
  B('iron', ub0 + 0.6, vb0 + 0.55, ub0 + 1.3, vb0 + 1.05, F + 0.85, F + 0.97, false);
  lamp(ub1 - 2.0, vb0 + 1.05, F + 1.07); lamp(uc - 1.5, vb0 + 2.4, F + 0.6, 0.3, 1.3);
  lamp(ub0 + 3.0, vb0 + 3.3, F + 2.4, 0.3, 1.2, 5);
  put({ t: 'goods_mat', seed: 4 }, uc, vb0 + 3.2, F, { rot: 0 });
  // the guests' room (rear): a communal kang the width of the room with a row of quilts and bolsters, a chest or two, a lamp, strings of
  // chillies, a rack for the guests' bundles
  const kv0 = vb1 - T - 2.2;
  B('brick_grey', ub0 + T, kv0, ub1 - T, vb1 - T, F, F + 0.62, true); B('reed_mat', ub0 + T + 0.05, kv0 + 0.05, ub1 - T - 0.05, vb1 - T - 0.05, F + 0.62, F + 0.645);
  for (let u = ub0 + 0.6; u < ub1 - 1.5; u += 1.7) { const c = ['cloth_indigo', 'cloth_red', 'cloth_brown', 'cloth_green', 'cloth_ochre'][Math.floor(rand() * 5)]; B(c, u, kv0 + 0.5, u + 1.2, vb1 - T - 0.2, F + 0.645, F + 0.8); B('cloth_white', u + 0.05, vb1 - T - 0.8, u + 0.55, vb1 - T - 0.25, F + 0.8, F + 0.9); }
  B('lacquer_chestnut', ub0 + 0.4, vb0 + 4.35, ub0 + 1.3, vb0 + 4.9, F, F + 0.72, true); B('lacquer_chestnut', ub1 - 1.4, vb0 + 4.35, ub1 - 0.5, vb0 + 4.9, F, F + 0.7, true);
  lamp(uc, vb1 - T - 1.4, F + 0.64, 0.25, 1.3); lamp(ub1 - 3.2, kv0 - 0.2, F + 0.9, 0.2, 1.0, 4);
  for (const u of [ub0 + 3.0, uc + 1.0, ub1 - 3.5]) { B('lacquer_red', u - 0.02, kv0 + 0.3, u + 0.02, kv0 + 0.34, top - 1.1, top - 0.32); B('paint_ochre', u + 0.05, kv0 + 0.5, u + 0.12, kv0 + 0.54, top - 0.9, top - 0.32); }
  // people: the keeper behind the counter, two guests at a table, a guest on the kang
  fig(ub1 - 2.5, vb0 + 1.9, F, 311, 'lane', { cloth: 'cloth_brown', hat: 'cap', cloth2: 'cloth_white' });
  fig(ub0 + 4.1, vb0 + 2.8, F, 312, [1, 0], { pose: 'low', hat: 'brim' }); fig(ub0 + 5.1, vb0 + 2.8, F, 313, [-1, 0], { pose: 'low', cloth: 'cloth_indigo', hat: 'none' });
  fig(ub0 + 5.4, vb1 - T - 1.3, F + 0.64, 314, 'lane', { pose: 'cross', hat: 'none', cloth: 'cloth_grey' });
  // the front: hanging lanterns of red paper under the eave, the banner of the wine, a hitching rail with its donkeys and a cart, a bench
  for (const u of [uc - 3.6, uc, uc + 3.6]) { const [x, z] = t.P(u, vb0 - 0.62); Lf.push({ t: 'hang_lantern', kind: 'paper', at: [x, z], y: top - 0.15 }); }
  put({ t: 'shop_sign', seed: 5, h: 3.9 }, ub0 + 0.2, vb0 - 0.2, F, { rot: YAW[lot.front] });
  B('timber', 0.4, 0.5, L - 0.4, 0.62, F - 0.05, F + 0.95, false);                                          // the hitching rail's top bar
  for (let u = 0.6; u < L - 0.3; u += 2.2) B('timber', u - 0.07, 0.48, u + 0.07, 0.64, foot, F + 0.95, false);
  put({ t: 'animal', kind: 'donkey', seed: lot.seed + 21 }, 3.4, 1.4, height(...t.P(3.4, 1.4)), { rot: YAW[lot.front] + Math.PI / 2 });
  put({ t: 'animal', kind: 'ox', seed: lot.seed + 22 }, L - 4.2, 1.5, height(...t.P(L - 4.2, 1.5)), { rot: YAW[lot.front] + Math.PI / 2 });
  put({ t: 'bench', len: 1.8, seed: lot.seed + 23 }, ub1 - 3.0, vb0 - 0.9, height(...t.P(ub1 - 3.0, vb0 - 0.9)), { rot: YAW[lot.front] + Math.PI / 2 });
  fig(ub1 - 3.0, vb0 - 0.9, height(...t.P(ub1 - 3.0, vb0 - 0.9)) + 0.0, 315, 'in', { pose: 'low', hat: 'straw', dress: 'trousers' });
  // behind: the stable lean-to and the yard (hay, a trough, a cart, hens), walled in earth
  const yd = (u0, v0, u1, v1) => { B('schist_rubble', u0, v0, u1, v1, foot - 0.3, foot + 0.5, true); B('earth_wall', u0 + 0.03, v0 + 0.03, u1 - 0.03, v1 - 0.03, foot + 0.5, foot + 2.0, true); B('tile_grey', u0 - 0.05, v0 - 0.05, u1 + 0.05, v1 + 0.05, foot + 2.0, foot + 2.1, false); };
  yd(0, vb1 + 0.5, L, vb1 + 0.9 - 0.4 + 0.5); yd(0, vb1 + 0.5, 0.45, t.D); yd(L - 0.45, vb1 + 0.5, L, t.D); yd(0, t.D - 0.45, L, t.D);
  const gy = (u, v) => height(...t.P(u, v));
  put({ t: 'haystack', seed: lot.seed + 25 }, 2.5, vb1 + 2.6, gy(2.5, vb1 + 2.6)); put({ t: 'trough', seed: lot.seed + 26 }, L - 3, vb1 + 2.6, gy(L - 3, vb1 + 2.6), { rot: 0 });
  put({ t: 'cart', kind: 'two', load: 'hay', seed: lot.seed + 27 }, L / 2, t.D - 2.3, gy(L / 2, t.D - 2.3), { rot: YAW[lot.front] + Math.PI / 2 });
  put({ t: 'chickens', n: 4, kind: 'hen', seed: lot.seed + 28 }, L / 2 + 3, vb1 + 2.4, gy(L / 2 + 3, vb1 + 2.4)); put({ t: 'firewood', seed: lot.seed + 29, len: 2 }, ub0 + 1.5, vb1 + 1.2, gy(ub0 + 1.5, vb1 + 1.2), { rot: 0 });
  put({ t: 'animal', kind: 'donkey', seed: lot.seed + 30 }, L - 5, vb1 + 4.0, gy(L - 5, vb1 + 4.0), { rot: 2 });
  smoke.push({ p: t.P(ub0 + 1.1, vb0 + 0.8), y: apex + 0.2 });
  return t;
}

// ── the smithy ──────────────────────────────────────────────────────────────────
function smithy(lot) {
  const t = tools(lot), { L, B, C, Lf, wall, put, lamp, fig, smoke } = t, rand = rng(lot.seed + 5);
  const ub0 = 2.4, ub1 = Math.min(L - 2.0, ub0 + 10), vb0 = 2.8, vb1 = vb0 + 6.0, Hh = 3.3, uc = (ub0 + ub1) / 2, W = ub1 - ub0;
  const { F, foot } = level(t, ub0, ub1, vb0, vb1), top = F + Hh, T = 0.17;
  body(t, lot, ub0, ub1, vb0, vb1, F, foot, 'mud_plaster', uc, 3.6);
  const wm = 'brick_grey';
  // the front wide open (the forge works to the street), a pier each side; the sides and back of brick, the walls' insides black with soot
  wall(ub0, vb0, ub1, vb0, F, top, [{ at: uc - ub0, w: 5.2, h: 2.5, y0: F }], wm);
  wall(ub0, vb0, ub0, vb1, F, top, [], wm); wall(ub1, vb0, ub1, vb1, F, top, [{ at: 3.8, w: 1.1, h: 2.0, y0: F }], wm);
  wall(ub0, vb1, ub1, vb1, F, top, [], wm);
  B('lacquer_black', ub0 + T, vb1 - T - 0.03, ub1 - T, vb1 - T, F, F + 2.4, false); B('lacquer_black', ub0 + T, vb0 + T, ub0 + T + 0.03, vb1 - T, F, F + 2.0, false);
  B('timber_red', uc - 2.8, vb0 - 0.2, uc + 2.8, vb0 + 0.1, F + 2.5, F + 2.85, false);
  for (const s of [-1, 1]) B('timber_red', uc + s * 2.75 - 0.15, vb0 - 0.2, uc + s * 2.75 + 0.15, vb0 + 0.1, F, F + 2.5, false);
  ceiling(t, ub0 + T, ub1 - T, vb0 + T, vb1 - T, top - 0.1);
  flatRoof(t, ub0, ub1, vb0, vb1, top, [ub1 - 2.0, vb1 - 1.6]);
  // the forge: a brick hearth with its bed of glowing coal, the hood and the stack through the roof; the bellows (a box with a plunger and a nozzle) at its side
  const hu = ub1 - 2.0, hv = vb1 - 1.6;
  B('brick_grey', hu - 1.0, hv - 0.8, hu + 1.0, hv + 0.8, F, F + 0.9, true); B('lacquer_black', hu - 0.8, hv - 0.6, hu + 0.8, hv + 0.6, F + 0.9, F + 0.95, false); B('lacquer_red', hu - 0.4, hv - 0.3, hu + 0.4, hv + 0.3, F + 0.95, F + 1.0, false);
  B('brick_grey', hu - 0.9, hv - 0.7, hu + 0.9, hv + 0.7, F + 1.7, F + 2.2, false); B('brick_grey', hu - 0.45, hv - 0.35, hu + 0.45, hv + 0.35, F + 2.2, top + 0.3, false);
  B('hide_brown', hu - 2.1, hv - 0.3, hu - 1.15, hv + 0.3, F + 0.4, F + 0.85, true); B('iron', hu - 1.15, hv - 0.05, hu - 0.95, hv + 0.05, F + 0.6, F + 0.66, false); B('timber', hu - 2.0, hv - 0.04, hu - 1.5, hv + 0.04, F + 0.85, F + 1.5, false);
  lamp(hu, hv - 0.9, F + 0.96, 0.3, 2.4, 7);
  // the anvil on its log, the quenching trough, hammers and tongs on the wall, bars of iron and the heap of charcoal, a grindstone
  const au = uc - 0.5, av = vb0 + 2.4;
  B('timber', au - 0.28, av - 0.28, au + 0.28, av + 0.28, F, F + 0.55, true); B('iron', au - 0.2, av - 0.12, au + 0.2, av + 0.12, F + 0.55, F + 0.78, true); B('iron', au + 0.2, av - 0.05, au + 0.42, av + 0.05, F + 0.7, F + 0.76, false);
  put({ t: 'trough', seed: lot.seed + 4 }, au + 1.6, av + 0.4, F, { rot: 0 });
  for (let k = 0; k < 7; k++) B(k % 2 ? 'iron' : 'timber', ub0 + 0.6 + k * 0.28, vb1 - T - 0.07, ub0 + 0.65 + k * 0.28, vb1 - T, F + 1.3, F + 1.3 + 0.5 + (k % 3) * 0.12, false);
  B('timber', ub0 + 0.5, vb1 - T - 0.1, ub0 + 2.6, vb1 - T - 0.02, F + 1.25, F + 1.31, false);
  B('lacquer_black', hu - 3.0, hv + 0.2, hu - 2.3, hv + 0.8, F, F + 0.3, false); B('lacquer_black', hu - 2.9, hv + 0.3, hu - 2.5, hv + 0.7, F + 0.3, F + 0.45, false);
  for (let k = 0; k < 4; k++) B('iron', ub0 + 0.5, vb0 + 1.2 + k * 0.12, ub0 + 2.2, vb0 + 1.28 + k * 0.12, F + 0.04 * k, F + 0.1 + 0.07 * k, false);
  B('granite_grey', ub0 + 0.6, vb0 + 3.9, ub0 + 1.4, vb0 + 4.0, F + 0.4, F + 0.9, false); B('timber', ub0 + 0.55, vb0 + 3.7, ub0 + 0.65, vb0 + 4.3, F, F + 0.6, false); B('timber', ub0 + 1.35, vb0 + 3.7, ub0 + 1.45, vb0 + 4.3, F, F + 0.6, false);
  // outside: the smith at the anvil and his apprentice at the bellows, a donkey being shod, ploughshares and mattocks leaned against the wall,
  // a cartwheel with its iron tyre, a stack of firewood, a bench
  fig(au, av + 0.7, F, 321, [0, -1], { dress: 'trousers', cloth: 'cloth_black', cloth2: 'cloth_brown', hat: 'none', pose: 'talk', beard: true });
  fig(hu - 1.6, hv + 0.7, F, 322, [0, -1], { dress: 'trousers', cloth: 'cloth_grey', hat: 'cap', pose: 'stand' });
  const gy = (u, v) => height(...t.P(u, v));
  put({ t: 'animal', kind: 'donkey', seed: lot.seed + 6 }, uc + 4.4, 1.2, gy(uc + 4.4, 1.2), { rot: YAW[lot.front] + Math.PI / 2 });
  fig(uc + 4.4, 2.2, gy(uc + 4.4, 2.2), 323, [0, -1], { dress: 'trousers', cloth: 'cloth_indigo', hat: 'straw', pose: 'low' });
  for (let k = 0; k < 4; k++) { const u = ub0 - 0.6 + k * 0.0, h = 0.8 + 0.2 * (k % 2); void u; B('iron', ub1 + 0.15 + k * 0.17, vb0 + 0.3, ub1 + 0.22 + k * 0.17, vb0 + 0.34, foot, foot + h, false); }
  put({ t: 'firewood', seed: lot.seed + 7, len: 2 }, ub0 - 1.0, vb0 + 2.2, gy(ub0 - 1.0, vb0 + 2.2), { rot: 0 });
  put({ t: 'bench', len: 1.6, seed: lot.seed + 8 }, ub0 + 0.4, vb0 - 1.0, gy(ub0 + 0.4, vb0 - 1.0), { rot: YAW[lot.front] + Math.PI / 2 });
  put({ t: 'barrel', n: 2, seed: lot.seed + 9 }, uc - 3.4, vb0 - 0.9, gy(uc - 3.4, vb0 - 0.9));
  put({ t: 'sacks', n: 3, seed: lot.seed + 10 }, ub1 + 0.9, vb0 + 2.4, gy(ub1 + 0.9, vb0 + 2.4));
  // the yard behind: scrap iron, a heap of coal, a wagon wheel on the ground; a wall of earth round it
  const yd = (u0, v0, u1, v1) => { B('schist_rubble', u0, v0, u1, v1, foot - 0.3, foot + 0.5, true); B('earth_wall', u0 + 0.03, v0 + 0.03, u1 - 0.03, v1 - 0.03, foot + 0.5, foot + 2.0, true); B('tile_grey', u0 - 0.05, v0 - 0.05, u1 + 0.05, v1 + 0.05, foot + 2.0, foot + 2.1, false); };
  yd(0, t.D - 0.45, L, t.D); yd(0, vb1 + 0.6, 0.45, t.D); yd(L - 0.45, vb1 + 0.6, L, t.D);
  for (let k = 0; k < 7; k++) { const u = 2 + rand() * (L - 4), v = vb1 + 1.4 + rand() * 4.5; B(k % 3 ? 'iron' : 'lacquer_black', u, v, u + 0.3 + rand() * 0.5, v + 0.2 + rand() * 0.4, gy(u, v), gy(u, v) + 0.12 + rand() * 0.2, false); }
  put({ t: 'cart', kind: 'two', load: 'empty', seed: lot.seed + 12 }, L - 4, t.D - 2.2, gy(L - 4, t.D - 2.2), { rot: YAW[lot.front] + Math.PI / 2 });
  smoke.push({ p: t.P(hu, hv), y: top + 2.2 });
  return t;
}

// ── the shop of incense, candles and oil ────────────────────────────────────────
function store(lot) {
  const t = tools(lot), { L, B, C, Lf, wall, put, lamp, fig, smoke } = t, rand = rng(lot.seed + 7);
  const ub0 = 1.8, ub1 = L - 1.8, vb0 = 2.8, vb1 = vb0 + 5.4, Hh = 3.4, uc = (ub0 + ub1) / 2, W = ub1 - ub0;
  const { F, foot } = level(t, ub0, ub1, vb0, vb1), top = F + Hh, T = 0.17;
  body(t, lot, ub0, ub1, vb0, vb1, F, foot, 'brick_grey', uc + 1.9, 1.6);
  const wm = 'plaster_white';
  // the front a shop front: a wide opening between two posts, closed at night by boards (here leaning at one side), a counter at its line
  wall(ub0, vb0, ub1, vb0, F, top, [{ at: uc - ub0, w: 5.0, h: 2.45, y0: F }], wm);
  wall(ub0, vb0, ub0, vb1, F, top, [], wm); wall(ub1, vb0, ub1, vb1, F, top, [{ at: 3.0, w: 1.1, h: 2.0, y0: F }], wm); wall(ub0, vb1, ub1, vb1, F, top, [], wm);
  for (const s of [-1, 1]) B('timber_red', uc + s * 2.55 - 0.16, vb0 - 0.22, uc + s * 2.55 + 0.16, vb0 + 0.12, F, F + 2.5, false);
  B('timber_red', uc - 2.8, vb0 - 0.22, uc + 2.8, vb0 + 0.12, F + 2.45, F + 2.8, false);
  B('timber_red', ub0 - 0.1, vb0 - 0.2, ub1 + 0.1, vb0 + 0.1, top - 0.4, top - 0.1, false);
  for (let k = 0; k < 5; k++) B('timber', ub0 + 0.15 + k * 0.32, vb0 - 0.28 - k * 0.0, ub0 + 0.15 + k * 0.32 + 0.28, vb0 - 0.2, F, F + 2.1, false);        // the shutter boards stacked against the wall
  ceiling(t, ub0 + T, ub1 - T, vb0 + T, vb1 - T, top - 0.1);
  const apex = gableRoof(t, ub0, ub1, vb0, vb1, top, 1.2, 1.7); void apex;
  // the counter (leaving the way in at its right end), the shelves of the back wall: bundles of incense sticks, red candles, oil jars,
  // paper money, rolled cloth; a scale hanging from a beam
  B('lacquer_chestnut', uc - 2.5, vb0 + 0.5, uc + 0.9, vb0 + 1.1, F, F + 1.05, true); B('lacquer_chestnut', uc - 2.6, vb0 + 0.44, uc + 1.0, vb0 + 1.16, F + 1.05, F + 1.12, false);
  for (let k = 0; k < 4; k++) B('lacquer_chestnut', ub0 + T, vb1 - T - 0.45, ub1 - T, vb1 - T, F + 0.55 + k * 0.55, F + 0.6 + k * 0.55, false);
  for (let k = 0; k < 14; k++) { const u = ub0 + 0.6 + k * 0.5, row = k % 3; if (u > ub1 - 0.5) break; B(row === 0 ? 'lacquer_red' : row === 1 ? 'paint_ochre' : 'cloth_red', u, vb1 - T - 0.4, u + 0.12 + (row === 0 ? 0 : 0.1), vb1 - T - 0.28, F + 1.65, F + 1.65 + 0.4 + (k % 4) * 0.05, false); }
  for (let k = 0; k < 8; k++) { const u = ub0 + 0.6 + k * 0.75; if (u > ub1 - 0.6) break; B(k % 2 ? 'cloth_indigo' : 'cloth_white', u, vb1 - T - 0.4, u + 0.4, vb1 - T - 0.1, F + 1.1, F + 1.18 + 0.15 * (k % 2), false); }
  for (let k = 0; k < 4; k++) put({ t: 'pot', kind: 'vat', n: 1, seed: lot.seed + k }, ub0 + 1.0 + k * 0.9, vb1 - T - 0.6, F);
  B('timber', uc - 1.0, vb0 + 0.7, uc - 0.99, vb0 + 0.9, top - 1.3, top - 0.1, false); B('bronze', uc - 1.3, vb0 + 0.7, uc - 0.7, vb0 + 0.74, top - 1.3, top - 1.26, false);
  for (const u of [ub0 + 2.0, ub1 - 2.0]) { B('lacquer_red', u - 0.02, vb0 + 2.2, u + 0.02, vb0 + 2.26, top - 1.4, top - 0.1, false); B('cloth_red', u - 0.15, vb0 + 2.15, u + 0.15, vb0 + 2.3, top - 1.7, top - 1.4, false); }
  lamp(uc - 1.2, vb0 + 0.8, F + 1.12, 0.3, 1.4); lamp(ub1 - 2.0, vb1 - 0.8, F + 0.0, 0.8, 1.0, 5);
  put({ t: 'basket', n: 3, seed: lot.seed + 11 }, ub1 - 1.3, vb0 + 2.6, F); put({ t: 'sacks', n: 2, seed: lot.seed + 12 }, ub0 + 1.2, vb0 + 2.8, F);
  fig(uc - 0.9, vb0 + 1.8, F, 331, 'lane', { cloth: 'cloth_indigo', hat: 'cap', cloth2: 'cloth_white' });
  fig(uc + 0.3, vb0 - 1.0, height(...t.P(uc + 0.3, vb0 - 1.0)), 332, 'in', { hair: 'bun', hat: 'none', carry: 'basket', cloth: 'cloth_ochre', cloth2: 'cloth_white' });
  // out front: the shop's board, red lanterns, a mat of goods (bundles of incense, candles, paper) under a stand, a low bench
  put({ t: 'shop_sign', seed: 6, h: 3.7 }, ub1 + 0.2, vb0 - 0.2, F, { rot: YAW[lot.front] });
  for (const u of [ub0 + 1.2, uc - 2.0, uc + 2.0, ub1 - 1.2]) { const [x, z] = t.P(u, vb0 - 0.66); Lf.push({ t: 'hang_lantern', kind: 'paper', at: [x, z], y: top - 0.15 }); }
  const gy = (u, v) => height(...t.P(u, v));
  put({ t: 'goods_mat', seed: 7 }, uc - 3.8, 1.2, gy(uc - 3.8, 1.2), { rot: 0 }); put({ t: 'stool', seed: lot.seed + 13 }, uc - 5.0, 1.4, gy(uc - 5.0, 1.4), { rot: 0.5 });
  put({ t: 'bench', len: 1.6, seed: lot.seed + 14 }, uc + 4.5, vb0 - 0.9, gy(uc + 4.5, vb0 - 0.9), { rot: YAW[lot.front] + Math.PI / 2 });
  put({ t: 'barrel', n: 2, seed: lot.seed + 15 }, uc - 5.4, vb0 - 0.7, gy(uc - 5.4, vb0 - 0.7));
  const yd = (u0, v0, u1, v1) => { B('schist_rubble', u0, v0, u1, v1, foot - 0.3, foot + 0.5, true); B('earth_wall', u0 + 0.03, v0 + 0.03, u1 - 0.03, v1 - 0.03, foot + 0.5, foot + 2.0, true); B('tile_grey', u0 - 0.05, v0 - 0.05, u1 + 0.05, v1 + 0.05, foot + 2.0, foot + 2.1, false); };
  yd(0, t.D - 0.45, L, t.D); yd(0, vb1 + 0.6, 0.45, t.D); yd(L - 0.45, vb1 + 0.6, L, t.D);
  put({ t: 'drying_tray', seed: lot.seed + 16 }, L / 2 - 2, vb1 + 3, gy(L / 2 - 2, vb1 + 3)); put({ t: 'drying_tray', seed: lot.seed + 17 }, L / 2 + 2, vb1 + 3.4, gy(L / 2 + 2, vb1 + 3.4));
  put({ t: 'crates', n: 3, seed: lot.seed + 18 }, 2, vb1 + 1.6, gy(2, vb1 + 1.6)); put({ t: 'chickens', n: 3, kind: 'hen', seed: lot.seed + 19 }, L - 3, vb1 + 2.4, gy(L - 3, vb1 + 2.4));
  smoke.push({ p: t.P(ub1 - 0.6, vb1 - 0.7), y: top + 2.0 });
  return t;
}

// ── the hostel of four cells ────────────────────────────────────────────────────
function hostel(lot) {
  const t = tools(lot), { L, B, C, Lf, wall, put, lamp, fig, smoke } = t, rand = rng(lot.seed + 9);
  const ub0 = 1.4, ub1 = L - 1.4, vb0 = 3.4, vb1 = vb0 + 5.0, Hh = 3.2, W = ub1 - ub0, N = 4, cw = W / N;
  const { F, foot } = level(t, ub0, ub1, vb0, vb1), top = F + Hh, T = 0.17;
  body(t, lot, ub0, ub1, vb0, vb1, F, foot, 'brick_grey', ub0 + cw * 1.5, 2.6);
  // the veranda: a covered walk along the front on timber posts (stone bases), under the same roof
  const vv = vb0 - 1.7;
  C.push({ t: 'floor', rect: t.R(ub0 - 0.15, vv, ub1 + 0.15, vb0), y: F, mat: 'bluestone', th: 0.12 });
  for (let k = 0; k <= N; k++) { const u = ub0 + k * cw; B('limestone', u - 0.24, vv + 0.1, u + 0.24, vv + 0.58, F - 0.02, F + 0.2, true); B('timber_red', u - 0.13, vv + 0.18, u + 0.13, vv + 0.5, F + 0.2, top - 0.15, true); }
  B('timber_red', ub0 - 0.15, vv + 0.1, ub1 + 0.15, vv + 0.58, top - 0.5, top - 0.15, false);
  const wm = 'plaster_white';
  wall(ub0, vb0, ub0, vb1, F, top, [], wm); wall(ub1, vb0, ub1, vb1, F, top, [], wm); wall(ub0, vb1, ub1, vb1, F, top, [], wm);
  for (let k = 0; k < N; k++) {
    const a = ub0 + k * cw, b = a + cw, m = (a + b) / 2;
    wall(a, vb0, b, vb0, F, top, [{ at: cw / 2 - 0.7, w: 1.1, h: 2.1, y0: F }, { at: cw / 2 + 0.8, w: 0.9, h: 1.0, y0: F + 1.05 }], wm);
    if (k) wall(a, vb0, a, vb1, F, top, [], wm, 0.24);
    // the cell: a kang along the back wall, a quilt and a bolster, a low table with a lamp, a chest, the pilgrim's bundle and staff
    B('brick_grey', a + T + 0.05, vb1 - T - 1.7, b - T - 0.05, vb1 - T, F, F + 0.58, true); B('reed_mat', a + T + 0.1, vb1 - T - 1.65, b - T - 0.1, vb1 - T - 0.05, F + 0.58, F + 0.6);
    const q = ['cloth_indigo', 'cloth_brown', 'cloth_green', 'cloth_red'][(k + lot.seed) % 4];
    B(q, a + T + 0.2, vb1 - T - 1.2, b - T - 0.7, vb1 - T - 0.15, F + 0.6, F + 0.74, false); B('cloth_white', b - T - 0.65, vb1 - T - 0.9, b - T - 0.2, vb1 - T - 0.3, F + 0.6, F + 0.76, false);
    B('lacquer_chestnut', m - 0.35, vb0 + 1.4, m + 0.35, vb0 + 2.0, F + 0.38, F + 0.43, true); for (const [x, z] of [[-0.3, 1.45], [0.25, 1.45], [-0.3, 1.9], [0.25, 1.9]]) B('lacquer_chestnut', m + x, vb0 + z, m + x + 0.05, vb0 + z + 0.05, F, F + 0.38, false);
    lamp(m, vb0 + 1.7, F + 0.43, 0.22, 1.1, 4.5);
    B('lacquer_chestnut', a + T + 0.1, vb0 + 0.4, a + T + 0.75, vb0 + 0.9, F, F + 0.55, true);
    B('cloth_brown', b - T - 0.55, vb0 + 0.35, b - T - 0.2, vb0 + 0.7, F, F + 0.38, false); B('timber', b - T - 0.15, vb0 + 0.4, b - T - 0.1, vb0 + 0.45, F, F + 1.6, false);
    ceiling(t, a + T, b - T, vb0 + T, vb1 - T, top - 0.1);
    // a pilgrim in two of the cells
    if (k === 1) fig(m + 0.2, vb1 - T - 0.9, F + 0.6, 340 + k, 'lane', { pose: 'cross', cloth: 'cloth_grey', hat: 'none' });
  }
  gableRoof(t, ub0, ub1, vv + 0.1, vb1, top, 1.1, 1.8);
  // the veranda's gear: a bench, a water jar with a dipper, a lantern, pilgrims' sandals and staves; a monk seated
  put({ t: 'bench', len: 1.7, seed: lot.seed + 3 }, ub1 - 1.3, vv + 0.9, F, { rot: YAW[lot.front] + Math.PI / 2 });
  put({ t: 'pot', kind: 'vat', n: 1, seed: lot.seed + 4 }, ub0 + 0.9, vv + 0.9, F);
  for (const u of [ub0 + cw * 1.5, ub0 + cw * 3.5]) { const [x, z] = t.P(u, vv + 0.5); Lf.push({ t: 'hang_lantern', kind: 'paper', at: [x, z], y: top - 0.45 }); }
  const gy = (u, v) => height(...t.P(u, v));
  put({ t: 'goods_mat', seed: 8 }, ub0 + cw * 2.5, 1.4, gy(ub0 + cw * 2.5, 1.4), { rot: 0 });
  fig(ub0 + cw * 2.5, 1.3, gy(ub0 + cw * 2.5, 1.3), 351, 'in', { pose: 'low', cloth: 'cloth_black', cloth2: 'cloth_brown', hair: 'shaven', hat: 'none' });
  fig(ub1 - 1.0, vv + 0.9, F, 352, 'lane', { pose: 'low', hat: 'brim' });
  put({ t: 'basket', n: 2, seed: lot.seed + 5 }, ub0 + cw * 3.4, 1.4, gy(ub0 + cw * 3.4, 1.4)); put({ t: 'stool', seed: lot.seed + 6 }, ub0 + cw * 1.0, 1.5, gy(ub0 + cw * 1.0, 1.5), { rot: 0.4 });
  // behind: the yard's well-stand of jars, a drying line, firewood, an earth wall
  const yd = (u0, v0, u1, v1) => { B('schist_rubble', u0, v0, u1, v1, foot - 0.3, foot + 0.5, true); B('earth_wall', u0 + 0.03, v0 + 0.03, u1 - 0.03, v1 - 0.03, foot + 0.5, foot + 2.0, true); B('tile_grey', u0 - 0.05, v0 - 0.05, u1 + 0.05, v1 + 0.05, foot + 2.0, foot + 2.1, false); };
  yd(0, t.D - 0.45, L, t.D); yd(0, vb1 + 0.6, 0.45, t.D); yd(L - 0.45, vb1 + 0.6, L, t.D);
  put({ t: 'laundry', len: 3, seed: lot.seed + 7 }, L / 2, vb1 + 3.0, gy(L / 2, vb1 + 3.0), { rot: 0 }); put({ t: 'firewood', seed: lot.seed + 8, len: 2 }, 2.2, vb1 + 1.6, gy(2.2, vb1 + 1.6), { rot: 0 });
  put({ t: 'trough', seed: lot.seed + 9 }, L - 3.0, vb1 + 2.4, gy(L - 3.0, vb1 + 2.4), { rot: 0 });
  smoke.push({ p: t.P(ub1 - 0.5, vb1 - 0.8), y: top + 2.3 });
  return t;
}

/** The plot's trade by its place in the list: the inn, the smithy, the shop, the hostel. */
export const TRADES = ['inn', 'smithy', 'store', 'hostel'];
export function trade(lot, kind) {
  const t = { inn, smithy, store, hostel }[kind](lot);
  return { chinese: t.C, life: t.Lf, smoke: t.smoke };
}
