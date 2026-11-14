// The timber houses of Istanbul about 1560 (docs/settlements/ottoman-istanbul.md §13), the town's one house: a ground
// storey of rubble stone, the upper storeys of timber frame filled with plaster or boarded and painted, jettied out
// over the lane on rows of brackets, one or two bays (cumba) on the front with sash windows behind lattice (kafes),
// a hipped roof of tiles on deep eaves, a chimney with its conical cap [inferred; stated in §5 and §13]. Houses touch
// their neighbours, so the lane is lined by one wall.
//
// The ground storey is a door and a grated window, or — on the shopping lanes — a shop (dükkân): the arch open, the
// upper shutter leaf propped out as an awning and the lower let down as the counter, goods before it, a hanging sign.
// A share are open (`open`, with `use` a trade or 'home'): the room furnished, a step up from the lane.
//
//   ottoman_house: { rect, y (floor), foot (lowest ground), storeys, front, seed, plaster, shop (trade | undefined),
//                    open, use, simple (the cheap far version) }

import { box, lathe, fromTriangles } from '../../core/geom.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const pick = (rand, l) => l[Math.floor(rand() * l.length)];

const WALLS = ['wood_painted', 'wood_ochre', 'limewash_red', 'stucco_pale', 'shutter_grey', 'timber', 'wood_painted', 'limewash_yellow', 'pembe', 'plaster_white'];
const PLAST = ['stucco_pale', 'plaster_white', 'limewash_white', 'stucco_cream', 'plaster_ochre', 'limewash_yellow'];
const CLOTH = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_green', 'cloth_maroon', 'cloth_blue'];
export const TRADES = ['baker', 'grocer', 'cobbler', 'coppersmith', 'weaver', 'barber', 'potter', 'butcher', 'sherbet', 'saddler'];

/** A hipped roof over R from ye at `pitch` degrees, overhang o. Returns the rise. */
function hipRoof(bag, mat, R, ye, pitch, o) {
  const ex0 = R[0] - o, ez0 = R[1] - o, ex1 = R[2] + o, ez1 = R[3] + o, wx = ex1 - ex0, wz = ez1 - ez0, rise = Math.min(wx, wz) / 2 * Math.tan(pitch * Math.PI / 180), t = [];
  if (wx >= wz) {
    const r0 = [ex0 + wz / 2, ye + rise, (ez0 + ez1) / 2], r1 = [ex1 - wz / 2, ye + rise, (ez0 + ez1) / 2];
    t.push(ex0, ye, ez0, ...r0, ...r1, ex0, ye, ez0, ...r1, ex1, ye, ez0, ex1, ye, ez1, ...r1, ...r0, ex1, ye, ez1, ...r0, ex0, ye, ez1, ex0, ye, ez1, ...r0, ex0, ye, ez0, ex1, ye, ez0, ...r1, ex1, ye, ez1);
  } else {
    const r0 = [(ex0 + ex1) / 2, ye + rise, ez0 + wx / 2], r1 = [(ex0 + ex1) / 2, ye + rise, ez1 - wx / 2];
    t.push(ex1, ye, ez0, ...r0, ...r1, ex1, ye, ez0, ...r1, ex1, ye, ez1, ex0, ye, ez1, ...r1, ...r0, ex0, ye, ez1, ...r0, ex0, ye, ez0, ex0, ye, ez0, ...r0, ex1, ye, ez0, ex1, ye, ez1, ...r1, ex0, ye, ez1);
  }
  for (let i = 0; i < t.length; i += 9) { const ux = t[i + 3] - t[i], uz = t[i + 5] - t[i + 2], vx = t[i + 6] - t[i], vz = t[i + 8] - t[i + 2]; if (uz * vx - ux * vz < 0) for (let k = 0; k < 3; k++) { const q = t[i + 3 + k]; t[i + 3 + k] = t[i + 6 + k]; t[i + 6 + k] = q; } }
  bag.add(mat, fromTriangles(t));
  return rise;
}

/** The furnished ground room of an open house (frame: u along the front, v in from it). */
function room(bag, col, el, { wall, y, st, f, rand }, lights) {
  const [x0, z0, x1, z1] = el.rect, T = 0.4, fy = y + 0.6, along = f === 'n' || f === 's';
  const L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0;
  const P = (u, v) => (f === 's' ? [x1 - u, z1 - v] : f === 'n' ? [x0 + u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);
  const B = (mat, u0, v0, u1, v1, ya, yb, c = false) => { const a = P(u0, v0), b = P(u1, v1), r = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; bag.add(mat, box(r[0], ya, r[1], r[2], yb, r[3])); if (c) col.rect(r, ya - 0.5, yb); };
  const h = (mat, u, v, r, ht, ya = 0) => { const p = P(u, v); bag.add(mat, lathe([[r * 0.6, 0], [r, ht * 0.4], [r * 0.7, ht * 0.85], [r * 0.4, ht], [0.001, ht]], 10, null, p[0], fy + ya, p[1])); };
  const shop = el.shop && el.use !== 'home';
  const dw = shop ? 2.2 : 1.2, du = L / 2;
  // walls: the back and sides whole; the front either side of the door (the whole width but a shutter-wide gap in a shop)
  B(wall, 0, D - T, L, D, fy, y + st, true); B(wall, 0, T, T, D - T, fy, y + st, true); B(wall, L - T, T, L, D - T, fy, y + st, true);
  B(wall, 0, 0, du - dw / 2, T, fy, y + st, true); B(wall, du + dw / 2, 0, L, T, fy, y + st, true); B(wall, du - dw / 2, 0, du + dw / 2, T, fy + (shop ? 2.7 : 2.5), y + st);
  col.rect([x0, z0, x1, z1], y + st, y + st + 0.4);
  // step, floor of boards, ceiling beams
  B('limestone', du - dw / 2 - 0.1, -0.5, du + dw / 2 + 0.1, 0, fy - 0.3, fy - 0.02);
  { const a = P(du - dw / 2, -0.5), b = P(du + dw / 2, 0); col.floor([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], fy - 0.3); }
  B(shop && el.use !== 'sherbet' ? 'flagstone' : 'timber', T, T, L - T, D - T, fy - 0.12, fy + 0.015); { const a = P(0, 0), b = P(L, D); col.floor([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], fy); }
  B('plaster_white', T, T, L - T, D - T, y + st - 0.05, y + st - 0.02);
  for (let v = T + 0.5; v < D - T; v += 0.8) B('wood_dark', T, v - 0.08, L - T, v + 0.08, y + st - 0.24, y + st - 0.05);
  if (!shop) B('wood_dark', du - dw / 2 - 0.02, T, du - dw / 2 + 0.06, T + dw, fy, fy + 2.45);
  const lamp = () => { const lp = P(L / 2, D / 2); lights?.push({ at: [lp[0], y + st - 1.0, lp[1]], color: '#ffd9a0', intensity: 2.4, distance: 7 }); bag.add('lamp_glass', lathe([[0.001, 0], [0.12, 0.05], [0.15, 0.2], [0.08, 0.3], [0.001, 0.32]], 10, null, lp[0], y + st - 0.9, lp[1])); B('iron', L / 2 - 0.005, D / 2 - 0.005, L / 2 + 0.005, D / 2 + 0.005, y + st - 0.58, y + st - 0.24); };
  const shelf = (u0, u1, v, hs) => { for (const q of hs) { B('wood_dark', u0, v, u1, v + 0.3, fy + q, fy + q + 0.04); for (let u = u0 + 0.2; u < u1 - 0.1; u += 0.32) h(rand() < 0.5 ? 'terracotta' : pick(rand, ['glaze_white', 'pottery_dark', 'glaze_blue']), u, v + 0.15, 0.07, 0.18, q + 0.04); } };
  // the counter across the shop, its flap raised in the middle (a way through 1.1 m wide in line with the door, to the keeper's side)
  const counter = () => { for (const [a, b] of [[T + 0.1, du - 0.55], [du + 0.55, L - T - 0.1]]) { B('wood_dark', a, T + 0.15, b, T + 0.75, fy, fy + 0.95, true); B('timber', a - 0.05, T + 0.1, b + 0.05, T + 0.8, fy + 0.95, fy + 1.0); } };
  const use = el.use ?? 'home';
  if (use === 'home' || use === 'inn') {
    // the divan round three walls with mattresses and cushions, a rug, the brass tray on its stand, a lamp, a painted chest
    const dv = 0.75;
    for (const [u0, v0, u1, v1] of [[T, D - T - dv, L - T, D - T], [T, T + 1.0, T + dv, D - T - dv], [L - T - dv, T + 1.0, L - T, D - T - dv]]) { B('timber', u0, v0, u1, v1, fy, fy + 0.3, true); B(pick(rand, ['cloth_red', 'cloth_indigo', 'cloth_green']), u0 + 0.02, v0 + 0.02, u1 - 0.02, v1 - 0.02, fy + 0.3, fy + 0.42); }
    for (let u = T + 0.6; u < L - T - 0.4; u += 0.7) B(pick(rand, ['cloth_ochre', 'cloth_red', 'cloth_green', 'cloth_white']), u - 0.25, D - T - 0.2, u + 0.25, D - T - 0.05, fy + 0.42, fy + 0.85);
    B('cloth_red', T + dv + 0.3, T + 1.2, L - T - dv - 0.3, D - T - dv - 0.3, fy + 0.01, fy + 0.025); B('cloth_ochre', T + dv + 0.5, T + 1.4, L - T - dv - 0.5, D - T - dv - 0.5, fy + 0.025, fy + 0.03);
    const tc = P(L / 2, (T + 1.2 + D - T - dv) / 2); bag.add('wood_dark', lathe([[0.25, 0], [0.18, 0.15], [0.22, 0.38], [0.001, 0.38]], 8, null, tc[0], fy + 0.03, tc[1])); bag.add('gilt_bronze', lathe([[0.001, 0], [0.42, 0.01], [0.45, 0.05], [0.43, 0.06], [0.001, 0.03]], 20, null, tc[0], fy + 0.41, tc[1])); col.circle(tc[0], tc[1], 0.45, fy, fy + 0.5);
    B('wood_painted', T + 0.1, T + 0.2, T + 1.0, T + 0.8, fy, fy + 0.6, true);
    lamp();
  } else {
    counter();
    if (use === 'baker') {
      // the oven (fırın) at the back, its mouth glowing, the peel, loaves on boards
      B('brick', L / 2 - 1.0, D - T - 1.3, L / 2 + 1.0, D - T, fy, fy + 1.1, true); B('plaster_white', L / 2 - 0.9, D - T - 1.2, L / 2 + 0.9, D - T, fy + 1.1, fy + 1.6); B('flame', L / 2 - 0.3, D - T - 1.32, L / 2 + 0.3, D - T - 1.28, fy + 0.35, fy + 0.75);
      for (let u = T + 0.4; u < L - T - 0.5; u += 0.45) { const p = P(u, T + 0.45); bag.add('wicker', lathe([[0.2, 0], [0.2, 0.05], [0.001, 0.1]], 8, null, p[0], fy + 1.0, p[1])); }
      B('wood_dark', T + 0.1, D - T - 1.0, T + 0.7, D - T - 0.1, fy, fy + 0.8, true); B('cloth_white', T + 0.12, D - T - 0.98, T + 0.68, D - T - 0.12, fy + 0.8, fy + 0.86);
    } else if (use === 'coppersmith') {
      // the tree-stump anvil, hammered pans on the walls and shelves, a charcoal hearth
      const p = P(L / 2, D * 0.6); bag.add('wood_dark', lathe([[0.3, 0], [0.26, 0.45], [0.001, 0.45]], 8, null, p[0], fy, p[1])); bag.add('iron', lathe([[0.001, 0], [0.18, 0], [0.16, 0.08], [0.001, 0.08]], 8, null, p[0], fy + 0.45, p[1])); col.circle(p[0], p[1], 0.32, fy, fy + 0.5);
      B('brick', T + 0.1, D - T - 0.9, T + 1.3, D - T, fy, fy + 0.6, true); B('flame', T + 0.5, D - T - 0.7, T + 0.9, D - T - 0.3, fy + 0.6, fy + 0.66);
      for (let u = T + 1.6; u < L - T - 0.4; u += 0.6) { const q = P(u, D - T - 0.05); bag.add('bronze', lathe([[0.25, 0], [0.22, 0.05], [0.001, 0.1]], 12, null, q[0], fy + 1.2 + (u % 1.2) * 0.4, q[1])); }
      shelf(L - T - 2.0, L - T - 0.1, D - T - 0.32, [0.5, 1.1]);
    } else if (use === 'weaver') {
      // a loom: two posts, the beams, warp threads, the cloth rolled in front
      const u = L / 2, v = D * 0.55;
      for (const s of [-1, 1]) B('wood_dark', u + s * 0.9 - 0.06, v - 0.5, u + s * 0.9 + 0.06, v + 0.5, fy, fy + 1.5, true);
      B('timber', u - 0.95, v - 0.5, u + 0.95, v - 0.42, fy + 1.4, fy + 1.5); B('timber', u - 0.95, v + 0.4, u + 0.95, v + 0.48, fy + 0.8, fy + 0.88);
      for (let a = -0.8; a <= 0.8; a += 0.1) B('cloth_white', u + a - 0.004, v - 0.46, u + a + 0.004, v + 0.44, fy + 0.85, fy + 1.45);
      B(pick(rand, CLOTH), u - 0.8, v + 0.1, u + 0.8, v + 0.44, fy + 0.8, fy + 1.0); B('wood_dark', u - 0.3, v + 0.55, u + 0.3, v + 1.0, fy, fy + 0.45, true);
      shelf(T + 0.05, L - T - 0.05, D - T - 0.32, [0.9, 1.5]);
    } else if (use === 'cobbler') {
      // low bench with lasts, shoes on shelves by sumptuary colour: red, yellow, black, blue
      B('wood_dark', T + 0.2, D - T - 0.9, L / 2, D - T - 0.2, fy, fy + 0.4, true);
      for (let q = 0; q < 8; q++) { const u = T + 0.3 + q * 0.3, p = P(u, D - T - 0.15); bag.add(pick(rand, ['cloth_red', 'glaze_yellow', 'hide_black', 'cloth_blue']), lathe([[0.001, 0], [0.09, 0.0], [0.08, 0.1], [0.001, 0.12]], 8, null, p[0], fy + 0.5 + (q % 3) * 0.45, p[1])); }
      for (const q of [0.5, 0.95, 1.4]) B('wood_dark', T + 0.05, D - T - 0.3, L - T - 0.05, D - T - 0.05, fy + q, fy + q + 0.04);
    } else if (use === 'barber') {
      // a stool, a basin on a stand, a shelf of bottles, a brass dish
      const p = P(L / 2, D * 0.55); bag.add('wood_dark', lathe([[0.26, 0], [0.2, 0.2], [0.24, 0.45], [0.001, 0.45]], 8, null, p[0], fy, p[1])); col.circle(p[0], p[1], 0.28, fy, fy + 0.5);
      B('wood_dark', T + 0.2, D - T - 0.5, T + 0.8, D - T - 0.1, fy, fy + 0.8, true); bag.add('bronze', lathe([[0.001, 0], [0.22, 0.02], [0.24, 0.12], [0.001, 0.1]], 12, null, P(T + 0.5, D - T - 0.3)[0], fy + 0.8, P(T + 0.5, D - T - 0.3)[1]));
      shelf(L - T - 1.8, L - T - 0.1, D - T - 0.32, [1.0, 1.5]);
    } else if (use === 'potter') {
      for (let q = 0; q < 9; q++) h(pick(rand, ['terracotta', 'glaze_blue', 'glaze_green', 'pottery_dark', 'glaze_white']), T + 0.6 + (q % 5) * 0.55, D * 0.5 + Math.floor(q / 5) * 0.8, 0.2, 0.4, 0);
      shelf(T + 0.05, L - T - 0.05, D - T - 0.32, [0.6, 1.2, 1.8]);
    } else if (use === 'butcher') {
      const p = P(L / 2, D * 0.5); bag.add('wood_dark', lathe([[0.4, 0], [0.34, 0.5], [0.001, 0.5]], 10, null, p[0], fy, p[1])); col.circle(p[0], p[1], 0.4, fy, fy + 0.55); B('iron', 0.5, D - T - 0.1, L - 0.5, D - T - 0.04, fy + 1.9, fy + 1.96);
      for (let u = 0.8; u < L - 0.6; u += 0.45) B('hide_brown', u - 0.07, D - T - 0.14, u + 0.07, D - T - 0.04, fy + 1.1, fy + 1.9);
    } else if (use === 'sherbet') {
      shelf(T + 0.05, L - T - 0.05, D - T - 0.32, [0.7, 1.3, 1.9]);
      for (let q = 0; q < 4; q++) { const p = P(0.9 + q * 0.5, T + 0.45); bag.add('bronze', lathe([[0.001, 0], [0.18, 0.02], [0.2, 0.15], [0.001, 0.14]], 10, null, p[0], fy + 1.0, p[1])); }
    } else if (use === 'saddler') {
      B('wood_dark', L / 2 - 0.5, D * 0.5 - 0.2, L / 2 + 0.5, D * 0.5 + 0.2, fy, fy + 0.7, true); B('hide_brown', L / 2 - 0.4, D * 0.5 - 0.3, L / 2 + 0.4, D * 0.5 + 0.3, fy + 0.7, fy + 0.85);
      for (let u = 0.8; u < L - 0.6; u += 0.7) { B('hide_tan', u, D - T - 0.1, u + 0.35, D - T - 0.04, fy + 1.1, fy + 1.8); B('iron', u + 0.1, D - T - 0.14, u + 0.14, D - T - 0.1, fy + 1.8, fy + 2.0); }
    } else {
      // the grocer's sacks and jars
      for (let q = 0; q < 6; q++) { const p = P(0.6 + q * 0.5, D - T - 0.45); bag.add(q % 2 ? 'sacking' : 'cloth_ochre', lathe([[0.001, 0], [0.22, 0], [0.24, 0.3], [0.14, 0.6], [0.001, 0.62]], 8, null, p[0], fy, p[1])); }
      shelf(T + 0.05, L - T - 0.05, D - T - 0.32, [1.0, 1.6]);
    }
    lamp();
  }
}

function house(el, { bag, col, lights }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, foot = el.foot ?? y - 0.4, simple = !!el.simple;
  const n = Math.max(1, el.storeys), st = 2.9 + rand() * 0.35, H = n * st, f = el.front || 's';
  const wall = el.plaster ? pick(rand, PLAST) : pick(rand, WALLS), shut = pick(rand, ['timber', 'shutter_green', 'shutter_brown', 'shutter_grey', 'timber']);
  const jet = n > 1 ? 0.8 : 0, OPEN = !!el.open && n >= 1;
  const R = [x0, z0, x1, z1];
  bag.add('rubble', box(x0 - 0.06, foot - 0.6, z0 - 0.06, x1 + 0.06, y + (jet && !OPEN ? st : 0.6), z1 + 0.06));
  if (jet) { if (f === 's') R[3] += jet; else if (f === 'n') R[1] -= jet; else if (f === 'e') R[2] += jet; else R[0] -= jet; bag.add(wall, box(R[0], y + st, R[1], R[2], y + H, R[3])); bag.add('timber', box(R[0] - 0.05, y + st - 0.18, R[1] - 0.05, R[2] + 0.05, y + st, R[3] + 0.05)); }
  else bag.add(wall, box(x0, y + (OPEN ? st : 0.6), z0, x1, y + H, z1));
  if (!OPEN) col.rect(el.rect, foot - 0.6, y + H);
  else room(bag, col, { ...el, shop: !!el.shop }, { wall: 'rubble', y, st, f, rand }, simple ? null : lights);
  const along = f === 'n' || f === 's', L = along ? R[2] - R[0] : R[3] - R[1], a0 = along ? R[0] : R[1];
  const fz = f === 'n' ? R[1] : f === 's' ? R[3] : f === 'w' ? R[0] : R[2], sg = f === 'n' || f === 'w' ? -1 : 1;
  // a box on the front face: u0..u1 along it, v0..v1 up, d0..d1 out from the wall (R's face: the jetty's outer face above the ground storey)
  const put = (mat, u0, u1, v0, v1, d0, d1, base = fz) => { const p0 = base + sg * d0, p1 = base + sg * d1; const q = along ? [a0 + u0, Math.min(p0, p1), a0 + u1, Math.max(p0, p1)] : [Math.min(p0, p1), a0 + u0, Math.max(p0, p1), a0 + u1]; bag.add(mat, box(q[0], y + v0, q[1], q[2], y + v1, q[3])); };
  const gz = fz - sg * jet;              // the ground storey's face
  const bays = Math.max(1, Math.round(L / 2.4)), mid = Math.floor(bays / 2);
  const shop = el.shop;
  // other faces: plain windows (the side walls of corner houses show to the lane)
  const faces = { n: 's', s: 'n', e: 'w', w: 'e' };
  if (!simple) for (const fc of [faces[f]]) {
    const al = fc === 'n' || fc === 's', Ln = al ? R[2] - R[0] : R[3] - R[1], an = al ? R[0] : R[1], zf = fc === 'n' ? R[1] : fc === 's' ? R[3] : fc === 'w' ? R[0] : R[2], sx = fc === 'n' || fc === 'w' ? -1 : 1;
    const nb = Math.max(1, Math.round(Ln / 2.4));
    for (let s = 1; s < n; s++) for (let b = 0; b < nb; b++) { const u = (b + 0.5) * Ln / nb, p0 = zf, p1 = zf + sx * 0.03, q = al ? [an + u - 0.35, Math.min(p0, p1), an + u + 0.35, Math.max(p0, p1)] : [Math.min(p0, p1), an + u - 0.35, Math.max(p0, p1), an + u + 0.35]; bag.add('opening', box(q[0], y + s * st + 0.7, q[1], q[2], y + s * st + 1.8, q[3])); }
  }
  // ground storey of the front
  const dc = (mid + 0.5) * L / bays;
  if (simple) { put('opening', dc - 0.6, dc + 0.6, 0.5, 2.7, 0, 0.04, gz); }
  else {
    for (let b = 0; b < bays; b++) {
      const u = (b + 0.5) * L / bays;
      if (b === mid) {
        if (shop) {
          // the dükkân: a pointed-head opening framed in timber; upper leaf propped as an awning, lower leaf let down as the counter
          const w = Math.min(2.3, L / bays + 0.3);
          put('timber', u - w / 2 - 0.12, u + w / 2 + 0.12, 0.45, 2.75, -0.01, 0.1, gz);
          if (!OPEN) put('opening', u - w / 2, u + w / 2, 0.6, 2.6, 0.09, 0.12, gz);
          put('wood_dark', u - w / 2, u + w / 2, 2.55, 2.62, 0.0, 0.9, gz);                       // the propped upper leaf
          put('timber', u - w / 2, u + w / 2, 0.88, 0.94, 0.0, 0.7, gz);                           // the let-down lower leaf (counter)
          for (const s2 of [-1, 1]) put('wood_dark', u + s2 * (w / 2 - 0.03) - 0.03, u + s2 * (w / 2 - 0.03) + 0.03, 0.9, 2.6, 0.7, 0.76, gz);
          put(pick(rand, CLOTH), Math.max(0.03, u - w / 2 - 0.05), Math.min(L - 0.03, u + w / 2 + 0.05), 2.1, 2.5, 0.9, 0.93, gz);   // an awning cloth
          // goods on the counter and at the door
          for (let q = 0; q < 4; q++) { const gu = u - w / 2 + 0.25 + q * (w - 0.5) / 3; put(pick(rand, ['terracotta', 'cloth_ochre', 'cloth_red', 'wicker', 'glaze_blue', 'cloth_green']), gu - 0.14, gu + 0.14, 0.94, 1.18 + rand() * 0.12, 0.2, 0.5, gz); }
          // the hanging sign on its iron bracket
          put('iron', -0.02 + (u + w / 2 + 0.35), 0.02 + (u + w / 2 + 0.35), 3.0, 3.04, 0.05, 0.95, gz); put(pick(rand, ['paint_blue', 'cloth_red', 'wood_painted', 'cloth_green']), (u + w / 2 + 0.33), (u + w / 2 + 0.37), 2.3, 3.0, 0.4, 0.9, gz);
        } else {
          // a door under a lintel, the leaf open or shut, a lamp over it
          const w = 1.15;
          put('timber', u - w / 2 - 0.12, u + w / 2 + 0.12, 0.45, 2.45, -0.01, 0.08, gz);
          if (!OPEN) { put('opening', u - w / 2, u + w / 2, 0.55, 2.35, 0.07, 0.11, gz); put('wood_dark', u - w / 2 + 0.05, u + w / 2 - 0.05, 0.57, 2.3, 0.1, 0.13, gz); put('iron', u + w / 2 - 0.25, u + w / 2 - 0.2, 1.1, 1.2, 0.13, 0.17, gz); }
          put('limestone', u - w / 2 - 0.3, u + w / 2 + 0.3, 0.3, 0.45, -0.02, 0.5, gz);     // the doorstep
          put('lamp_glass', u + w / 2 + 0.25, u + w / 2 + 0.4, 2.5, 2.7, 0.0, 0.12, gz);
        }
      } else if (rand() < 0.75) {
        // a small window behind iron bars, a stone sill, a plant pot on it now and then
        put('opening', u - 0.35, u + 0.35, 1.4, 2.2, -0.01, 0.03, gz);
        for (const g of [-0.175, 0, 0.175]) put('iron', u + g - 0.018, u + g + 0.018, 1.4, 2.2, 0.03, 0.065, gz);
        put('iron', u - 0.35, u + 0.35, 1.78, 1.82, 0.065, 0.095, gz);
        put('limestone', u - 0.45, u + 0.45, 1.3, 1.4, -0.01, 0.12, gz);
        if (rand() < 0.3) put('terracotta', u - 0.12, u + 0.12, 1.4, 1.62, 0.0, 0.24, gz);
      }
    }
    // the sill of stone along the foot, a darker damp band on the wall above it
    put('plaster_damp', 0.0, L, 0.6, 1.1, -0.005, 0.02, gz);
  }
  // upper storeys: windows with shutters, sills, kafes; the cumbas
  const cum = !simple && n > 1 ? (rand() < 0.35 ? 2 : rand() < 0.75 ? 1 : 0) : 0;
  const cumAt = cum === 2 ? [0.28, 0.72] : cum === 1 ? [0.5] : [];
  for (let s = 1; s < n; s++) {
    for (let b = 0; b < bays; b++) {
      const u = (b + 0.5) * L / bays;
      const inCum = cumAt.some((c) => Math.abs(u - c * L) < Math.min(3, L * 0.4) / 2 + 0.2);
      const ww = 0.7 * (0.9 + rand() * 0.2), wh = 1.2, v0 = s * st + (st - wh) * 0.45;
      if (simple) { put('opening', u - ww / 2, u + ww / 2, v0, v0 + wh, -0.01, 0.03); continue; }
      if (inCum) continue;
      const closed = rand() < 0.22;
      put('timber', u - ww / 2 - 0.1, u + ww / 2 + 0.1, v0 - 0.12, v0 + wh + 0.08, -0.01, 0.05);
      put(closed ? shut : 'opening', u - ww / 2, u + ww / 2, v0, v0 + wh, 0.04, 0.08);
      if (!closed) { put('wood_dark', u - 0.03, u + 0.03, v0, v0 + wh, 0.08, 0.1); put('wood_dark', u - ww / 2, u + ww / 2, v0 + wh * 0.62, v0 + wh * 0.62 + 0.05, 0.08, 0.1); if (rand() < 0.5) put('koshi', u - ww / 2, u + ww / 2, v0, v0 + wh * 0.5, 0.1, 0.14); }
      // open shutters standing against the wall either side
      if (!closed && rand() < 0.5) for (const sd of [-1, 1]) put(shut, sd < 0 ? u - ww / 2 - 0.4 : u + ww / 2 + 0.04, sd < 0 ? u - ww / 2 - 0.04 : u + ww / 2 + 0.4, v0, v0 + wh, 0.04, 0.07);
      put('timber', u - ww / 2 - 0.14, u + ww / 2 + 0.14, v0 - 0.2, v0 - 0.1, -0.01, 0.15);
    }
  }
  for (const c of cumAt) {
    // the cumba: a closed bay of boards on stepped brackets, sash windows round it behind kafes, a cornice board
    for (let s = 1; s < n; s++) {
      const u = c * L, w = Math.min(3, L * 0.4), a = u - w / 2, b = u + w / 2, D = 0.8, ya = s * st + 0.3, yb = (s + 1) * st - 0.2, wa = s * st + 0.95, wb = (s + 1) * st - 0.55;
      put(wall, a, b, ya, yb, 0, D);
      put('timber', a - 0.1, b + 0.1, s * st + 0.2, s * st + 0.32, -0.02, D + 0.1);
      if (s === 1) for (const ub of [a + 0.15, u, b - 0.15]) for (let k = 0; k < 3; k++) put('timber', ub - 0.07, ub + 0.07, st - 0.4 + k * 0.2, st - 0.2 + k * 0.2, 0, D * (k + 1) / 3);
      const nw = Math.max(2, Math.round((w - 0.3) / 0.7)), ww2 = (w - 0.3) / nw;
      for (let k = 0; k < nw; k++) {
        const c0 = a + 0.15 + k * ww2 + 0.06, c1 = a + 0.15 + (k + 1) * ww2 - 0.06;
        put('opening', c0, c1, wa, wb, D, D + 0.01); put('koshi', c0, c1, wa, wa + (wb - wa) * 0.55, D + 0.01, D + 0.03);
        put('timber', c0 - 0.06, c0, wa - 0.05, wb + 0.05, D, D + 0.05); put('timber', c1, c1 + 0.06, wa - 0.05, wb + 0.05, D, D + 0.05);
      }
      put('timber', a + 0.1, b - 0.1, wa - 0.1, wa - 0.02, D, D + 0.08); put('timber', a + 0.1, b - 0.1, wb, wb + 0.08, D, D + 0.06);
      put('timber', a - 0.15, b + 0.15, yb, yb + 0.12, -0.02, D + 0.15);
      // the sides of the bay: a window each
      for (const e of [a, b - 0.02]) put('opening', e, e + 0.02, wa, wb, 0.15, D - 0.1);
    }
  }
  if (!simple) {
    // the frame showing on the boarded walls: corner posts, floor rails, brackets under the jetty at every metre
    for (const e of [0, L - 0.12]) put('timber', e, e + 0.12, 0.6, H - 0.25, -0.02, 0.04, jet ? fz : fz);
    for (let s = 1; s < n; s++) put('timber', 0, L, s * st - 0.02, s * st + 0.1, -0.02, 0.05);
    if (jet) for (let u = 0.5; u < L - 0.3; u += 1.0) for (let k = 0; k < 2; k++) put('wood_dark', u - 0.06, u + 0.06, st - 0.5 + k * 0.22, st - 0.28 + k * 0.22, -jet * (1 - k * 0.5), 0);
    // weathering: a water-stain under the eaves and the sills, a patch of plaster come away, a drain pipe at a corner
    for (let s = 1; s < n; s++) if (rand() < 0.5 && !cumAt.length) { const u = 0.3 + rand() * (L - 1.4); put("plaster_streak", u, u + 0.5 + rand() * 0.4, s * st + 0.37, s * st + 1.1 + rand() * 0.6, 0.004, 0.02); }
    if (rand() < 0.4) { const u = 0.3 + rand() * (L - 1.2); put('timber', u, u + 0.7, st * Math.min(n - 1, 1) + 0.4, st * Math.min(n - 1, 1) + 1.2, 0.004, 0.016); }
    // washing on a pole out of an upper window, a vine on the ground storey's wall, pots by the door
    if (n > 1 && !cumAt.length && rand() < 0.22) { const u = 0.8 + rand() * (L - 1.6); put('wood_dark', u - 0.02, u + 0.02, st + 1.6, st + 1.64, 0, 0.75); for (let k = 0; k < 3; k++) put(pick(rand, CLOTH), u + 0.1 + k * 0.28, u + 0.34 + k * 0.28, st + 0.7 + rand() * 0.2, st + 1.6, 0.45 + k * 0.08, 0.48 + k * 0.08); }   // kept short of the opposite house's cumba across the lane (jetties 0.8 + 0.8 m, lane 3.4 m)
    if (rand() < 0.3) { const u = 0.5 + rand() * (L - 1.0); put('fresco_green', u, u + 0.9, 0.6, 2.6, 0.0, 0.06, gz); }
  }
  // the top: the eaves' boards, the hip of tiles, a chimney with its conical cap
  const ye = y + H, E = simple ? 0.5 : 0.9;
  bag.add('timber', box(R[0] - E, ye - 0.22, R[1] - E, R[2] + E, ye, R[3] + E));
  if (!simple) for (let u = R[0] - E + 0.3; u < R[2] + E; u += 0.9) { if (f === 'n' || f === 's') { const zz = f === 's' ? R[3] + 0.05 : R[1] - 0.17; bag.add('wood_dark', box(u, ye - 0.36, f === 's' ? zz : zz - (E - 0.2), u + 0.1, ye - 0.22, f === 's' ? zz + E - 0.1 : zz + 0.12)); } }
  const rise = hipRoof(bag, 'roof_tile', R, ye, 22 + (rand() - 0.5) * 4, E);
  if (rand() < 0.6) {
    const cx = R[0] + 1 + rand() * (R[2] - R[0] - 2), cz = R[1] + 1 + rand() * (R[3] - R[1] - 2), ch = rise + 1.1;
    bag.add('brick', box(cx - 0.3, ye, cz - 0.3, cx + 0.3, ye + ch, cz + 0.3));
    if (!simple) bag.add('roof_tile', lathe([[0.42, 0], [0.38, 0.1], [0.001, 0.55]], 8, null, cx, ye + ch, cz));
  }
}

export { house as ottomanHouse };
