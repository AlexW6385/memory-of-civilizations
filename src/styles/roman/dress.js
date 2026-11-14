// The eye-level dressing of Roman street fronts (docs/settlements/rome.md §4.9): the canvas awnings on their poles,
// the goods set out at the shop door by trade (amphorae in racks, strings of onions and sausages, carcasses on hooks,
// loaves, fish on a marble slab, pots, cloth), the hanging boards and bronze lamps, painted notices (dipinti) on the
// piers, plaster patches and damp and soot (the weathering of brick-faced concrete), flower boxes and washing at the
// windows, the wooden balconies (maeniana). Everything is built through a building's tools (street.js `tools`):
// u along the front, d deep into the building (negative d is the street), so that it fits any side of a block.
// Repeated shapes (amphorae, pots, onions) are put as instances where the bag instances.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';

const lz = (p, n) => lathe(p, n);
export const AMPH = [[0.001, 0], [0.03, 0.02], [0.1, 0.15], [0.18, 0.42], [0.17, 0.62], [0.08, 0.75], [0.05, 0.9], [0.06, 0.95], [0.001, 0.95]];
const JUG = [[0.04, 0], [0.07, 0.05], [0.075, 0.12], [0.04, 0.2], [0.03, 0.24], [0.04, 0.26], [0.001, 0.26]];
const POT = [[0.001, 0], [0.1, 0.0], [0.14, 0.08], [0.15, 0.2], [0.12, 0.26], [0.13, 0.28], [0.001, 0.27]];
const HAM = [[0.001, 0], [0.06, 0.04], [0.09, 0.14], [0.06, 0.26], [0.02, 0.32], [0.001, 0.34]];
const SAUSAGE = [[0.001, 0], [0.025, 0.02], [0.025, 0.2], [0.001, 0.22]];
const ONION = [[0.001, 0], [0.05, 0.02], [0.065, 0.07], [0.04, 0.12], [0.012, 0.15], [0.001, 0.16]];
const LOAF = [[0.001, 0], [0.13, 0.0], [0.15, 0.04], [0.1, 0.09], [0.001, 0.1]];
const LAMP = [[0.001, 0], [0.04, 0.01], [0.055, 0.04], [0.045, 0.07], [0.02, 0.085], [0.001, 0.085]];
const FISH = [[0.001, 0], [0.04, 0.02], [0.05, 0.04], [0.001, 0.07]];
const SHAPES = new Map();
const shape = (key, make) => { let g = SHAPES.get(key); if (!g) SHAPES.set(key, (g = make())); return g.clone(); };

/** A piece at (x, y, z) turned by yaw: one instance where the bag instances, else merged. */
export function putAt(bag, mat, g, x, y, z, yaw = 0) {
  const M = new Matrix4().makeRotationY(yaw).setPosition(x, y, z);
  if (bag.addInstance) bag.addInstance(mat, g, M, { reach: 140 });
  else bag.add(mat, g.applyMatrix4(M));
}
/** A lathe shape (cached by key) at the street-front frame's (u, d), y above the building's base. */
const V = (T, mat, key, prof, u, d, ya = 0, n = 8, sc = 1) => { const p = T.P(u, d); putAt(T.bag, mat, shape(key, () => lz(prof, n)).scale(sc, sc, sc), p[0], T.y + ya, p[1]); };
/** The direction out of the building (toward the street) as a yaw: used only for pieces that are not turned about their axis. */
export const outYaw = (T) => { const a = T.P(0, 0), b = T.P(0, -1); return Math.atan2(b[0] - a[0], b[1] - a[1]); };

/** A cloth awning: from the wall at height yw sloping down to height yo at d = -out, over u0…u1, on two poles; its valance hangs in front. */
export function awning(T, u0, u1, yw, yo, out, cloth, poles = true) {
  const a = T.P(u0, 0.0), b = T.P(u1, 0.0), c = T.P(u1, -out), e = T.P(u0, -out), y = T.y;
  const q = (p, h) => [p[0], y + h, p[1]], tris = [];
  const top = [q(a, yw), q(b, yw), q(c, yo), q(e, yo)];
  tris.push(...top[0], ...top[2], ...top[1], ...top[0], ...top[3], ...top[2]);
  const lo = [q(a, yw - 0.03), q(b, yw - 0.03), q(c, yo - 0.03), q(e, yo - 0.03)];
  tris.push(...lo[0], ...lo[1], ...lo[2], ...lo[0], ...lo[2], ...lo[3]);
  T.bag.add(cloth, fromTriangles(tris));
  T.B(cloth, u0, u1, -out - 0.02, -out + 0.01, yo - 0.34, yo - 0.02);                         // the valance
  T.B('timber', u0, u1, -out - 0.03, -out, yo - 0.02, yo + 0.04);                              // the front rail
  if (poles) for (const u of [u0 + 0.06, u1 - 0.06]) T.B('timber', u - 0.045, u + 0.045, -out - 0.09, -out, 0.0, yo + 0.04, true);
}
/** A rack of amphorae against the wall by the door: n standing in two ranks leaning on a timber frame. */
export function amphoraRack(T, u, n, rand) {
  T.B('timber', u - 0.05, u + 0.05 + (n > 3 ? 0.4 : 0), -0.08, -0.04, 0.0, 1.25);
  for (let k = 0; k < n; k++) V(T, 'terracotta', 'amph', AMPH, u + 0.18 + (k % 3) * 0.32, -0.28 - Math.floor(k / 3) * 0.3 - rand() * 0.05, 0.0, 10, 0.9 + rand() * 0.15);
  if (n > 3) T.B('timber', u - 0.05, u + 0.05 + 0.4, -0.5, -0.46, 0.7, 0.74);
}
/** A pole under the lintel with strings of onions, sausages and hams hanging from it. */
export function hangingGoods(T, u0, u1, rand, ham = false) {
  T.B('timber', u0, u1, -0.28, -0.22, 3.0, 3.05);
  for (const u of [u0, u1]) T.B('timber', u - 0.02, u + 0.02, -0.28, -0.1, 3.0, 3.05);
  const n = Math.floor((u1 - u0) / 0.28);
  for (let k = 0; k < n; k++) {
    const u = u0 + 0.14 + k * (u1 - u0 - 0.28) / Math.max(1, n - 1), r = rand();
    if (ham && r < 0.5) V(T, 'hide_brown', 'ham', HAM, u, -0.25, 2.62, 8);
    else if (r < 0.5) { T.B('rope_fibre', u - 0.004, u + 0.004, -0.255, -0.245, 2.65, 3.0); for (let j = 0; j < 3; j++) V(T, 'cloth_ochre', 'onion', ONION, u, -0.25, 2.52 + j * 0.13, 7); }
    else V(T, 'hide_brown', 'sausage', SAUSAGE, u + (k % 2 ? 0.03 : -0.03), -0.25, 2.78 - (k % 3) * 0.04, 6);
  }
}
/** A butcher's: hooks on a beam with carcasses (pigs, hares, birds) and a chopping block outside. */
export function carcasses(T, u0, u1, rand) {
  T.B('timber', u0, u1, -0.3, -0.22, 3.05, 3.15);
  for (let k = 0; k < 3; k++) {
    const u = u0 + (u1 - u0) * (k + 0.5) / 3, h = 0.7 + rand() * 0.25;
    T.B('iron', u - 0.01, u + 0.01, -0.27, -0.25, 3.05 - h * 0.3, 3.05);
    T.B('hide_tan', u - 0.15, u + 0.15, -0.34, -0.2, 3.05 - h * 0.3 - h, 3.05 - h * 0.3);
    T.B('wall_red', u - 0.06, u + 0.06, -0.345, -0.335, 3.05 - h * 0.3 - h * 0.7, 3.05 - h * 0.3 - 0.1);
  }
  const uc = u1 + 0.35;
  V(T, 'timber', 'block', [[0.001, 0], [0.27, 0.0], [0.27, 0.62], [0.001, 0.62]], uc, -0.6, 0.0, 10);
}
/** A marble slab on trestles, out in front, with fish or loaves or vegetables set out on it. */
export function slab(T, uc, w, goods, rand) {
  T.B('travertine', uc - w / 2 + 0.05, uc - w / 2 + 0.2, -1.0, -0.4, 0.0, 0.8);
  T.B('travertine', uc + w / 2 - 0.2, uc + w / 2 - 0.05, -1.0, -0.4, 0.0, 0.8);
  T.B('marble_smooth', uc - w / 2, uc + w / 2, -1.05, -0.35, 0.8, 0.86);
  const n = Math.floor(w / 0.22);
  for (let k = 0; k < n; k++) {
    const u = uc - w / 2 + 0.15 + k * (w - 0.3) / Math.max(1, n - 1), d = -0.45 - rand() * 0.45;
    if (goods === 'fish') V(T, k % 3 ? 'silver' : 'cloth_grey', 'fish', FISH, u, d, 0.86, 6, 1.2);
    else if (goods === 'bread') V(T, k % 3 ? 'hide_tan' : 'terracotta', 'loaf', LOAF, u, d, 0.86, 8);
    else V(T, ['cloth_green', 'cloth_ochre', 'cloth_red', 'papyrus'][k % 4], 'onion', ONION, u, d, 0.86, 7, 1.2);
  }
}
/** Pots and jugs stacked on a plank bench at the door, a heap of bowls on the ground. */
export function potStall(T, u, w, rand) {
  T.B('timber', u, u + w, -0.9, -0.4, 0.38, 0.42);
  for (const x of [u + 0.1, u + w - 0.1]) T.B('timber', x - 0.04, x + 0.04, -0.85, -0.45, 0.0, 0.38);
  for (let k = 0; k < Math.floor(w / 0.26); k++) V(T, k % 3 ? 'terracotta' : 'pottery_dark', 'pot', POT, u + 0.2 + k * 0.26, -0.55 - (k % 2) * 0.22, 0.42, 8);
  for (let k = 0; k < 3; k++) V(T, 'terracotta', 'jug', JUG, u + w + 0.1 + (k % 2) * 0.2, -0.45 - k * 0.2, 0.0, 8, 2.2);
}
/** A hanging board on an iron bracket from the pier: the trade's sign, painted. */
export function signBoard(T, u, ya, rand) {
  const m = ['wall_red', 'paint_ochre', 'egyptian_blue', 'plaster_white'][Math.floor(rand() * 4)];
  T.B('iron', u - 0.02, u + 0.02, -0.7, -0.06, ya + 0.62, ya + 0.66);
  T.B('iron', u - 0.015, u + 0.015, -0.7, -0.06, ya, ya + 0.62 - 0.5);
  T.B('timber', u - 0.015, u + 0.015, -0.66, -0.64, ya + 0.1, ya + 0.62);
  T.B('timber', u - 0.03, u + 0.03, -0.5, -0.2, ya, ya + 0.55);
  T.B(m, u - 0.035, u + 0.035, -0.46, -0.24, ya + 0.06, ya + 0.49);
  T.B('lacquer_black', u - 0.04, u + 0.04, -0.4, -0.3, ya + 0.14, ya + 0.4);
}
/** A bronze hanging lamp on a bracket beside a door. */
export function lampBracket(T, u, ya) {
  T.B('iron', u - 0.015, u + 0.015, -0.4, -0.04, ya + 0.3, ya + 0.33);
  T.B('iron', u - 0.004, u + 0.004, -0.4, -0.39, ya, ya + 0.3);
  V(T, 'bronze', 'lamp', LAMP, u, -0.395, ya - 0.1, 8, 1.6);
}
/** A painted notice on a pier (a dipinto): a white panel with lines of red and black letters. */
export function notice(T, u, ya, w = 0.7, h = 1.1, rand = Math.random) {
  T.B('plaster_white', u - w / 2, u + w / 2, -0.04, -0.01, ya, ya + h);
  const lines = Math.floor(h / 0.14);
  for (let k = 0; k < lines; k++) {
    const ww = w * (0.45 + rand() * 0.4);
    T.B(k === 0 ? 'wall_red' : 'lacquer_black', u - ww / 2, u + ww / 2, -0.055, -0.04, ya + h - 0.12 - k * 0.14, ya + h - 0.07 - k * 0.14);
  }
}
/** Patches of plaster fallen from the brick, damp at the foot, soot over the doors: the weathering of a front. */
export function weather(T, u0, u1, ya, yb, rand, density = 1) {
  const n = Math.round((u1 - u0) / 2.2 * density);
  for (let k = 0; k < n; k++) {
    const w = 0.6 + rand() * 1.1, h = 0.6 + rand() * 1.2, u = u0 + rand() * Math.max(0.01, u1 - u0 - w), y = ya + rand() * Math.max(0.01, yb - ya - h);
    const dd = 0.02 + rand() * 0.012;
    T.B(rand() < 0.7 ? 'stucco_rome' : 'plaster_damp', u, u + w, -dd, -0.005, y, y + h);
  }
}
/** Damp rising in the foot of a pier or a wall, and the streaks under a sill or a gutter. */
export function damp(T, u0, u1, h, rand) { T.B('plaster_damp', u0, u1, -0.03, -0.005, 0.0, h * (0.5 + rand() * 0.5)); }
export function streak(T, u, ya, h, w = 0.18) { T.B('plaster_streak', u - w / 2, u + w / 2, -0.026, -0.005, ya - h, ya); }
/** A window box with flowers or herbs (terracotta box, leaves). */
export function flowerBox(T, uc, ya, rand) {
  T.B('terracotta', uc - 0.5, uc + 0.5, -0.3, 0.0, ya, ya + 0.22);
  T.B('timber', uc - 0.5, uc + 0.5, -0.32, -0.28, ya, ya + 0.3);
  for (let k = 0; k < 6; k++) V(T, ['palm_leaf', 'papyrus', 'palm_leaf'][k % 3], 'tuft', [[0.001, 0], [0.07, 0.06], [0.05, 0.16], [0.001, 0.2]], uc - 0.4 + k * 0.16, -0.14 - (k % 2) * 0.05, ya + 0.22, 6, 1 + rand() * 0.4);
  for (let k = 0; k < 3; k++) T.B(['cloth_red', 'cloth_ochre', 'cloth_white'][Math.floor(rand() * 3)], uc - 0.35 + k * 0.35, uc - 0.3 + k * 0.35, -0.2 - (k % 2) * 0.03, -0.14 - (k % 2) * 0.03, ya + 0.3, ya + 0.38);
}
/** Washing hung from a pole put out of a window. */
export function washing(T, uc, ya, rand) {
  T.B('timber', uc - 0.7, uc + 0.7, -0.5, -0.46, ya + 1.1, ya + 1.14);
  T.B('timber', uc - 0.7, uc - 0.66, -0.5, 0.0, ya + 1.1, ya + 1.14);
  const n = 2 + Math.floor(rand() * 2);
  for (let k = 0; k < n; k++) {
    const u = uc - 0.55 + k * 1.1 / Math.max(1, n - 1), h = 0.55 + rand() * 0.5, w = 0.28 + rand() * 0.14;
    T.B(['cloth_white', 'linen', 'cloth_ochre', 'cloth_red', 'cloth_indigo', 'cloth_white'][Math.floor(rand() * 6)], u - w, u + w, -0.49 + k * 0.02, -0.47 + k * 0.02, ya + 1.1 - h, ya + 1.1);
  }
}
/**
 * A closed wooden balcony (maenianum) on beams across the front, over u0…u1 from height ya: a floor, a boxed front with
 * two window openings and wooden shutters, a small tiled roof.
 */
export function maenianum(T, u0, u1, ya, rand) {
  const out = 1.0, h = 2.2;
  for (let u = u0 + 0.4; u < u1 - 0.3; u += 1.1) T.B('timber', u - 0.07, u + 0.07, -out - 0.1, 0.0, ya - 0.28, ya - 0.08);
  T.B('timber', u0, u1, -out, 0.0, ya - 0.08, ya + 0.04);
  T.B('half_timber', u0, u1, -out, -out + 0.12, ya + 0.04, ya + 1.0);
  T.B('timber', u0, u1, -out - 0.03, -out + 0.12, ya + 1.0, ya + 1.1);
  const n = Math.max(2, Math.floor((u1 - u0) / 1.4)), w = (u1 - u0) / n;
  for (let k = 0; k < n; k++) {
    const uc = u0 + (k + 0.5) * w;
    T.B('opening', uc - 0.4, uc + 0.4, -out - 0.01, -out + 0.12, ya + 1.15, ya + 1.95);
    if (rand() < 0.5) { T.B('shutter_brown', uc - 0.72, uc - 0.4, -out - 0.04, -out + 0.0, ya + 1.15, ya + 1.95); T.B('shutter_brown', uc + 0.4, uc + 0.72, -out - 0.04, -out + 0.0, ya + 1.15, ya + 1.95); }
  }
  T.B('half_timber', u0, u1, -out, -out + 0.12, ya + 1.95, ya + h);
  for (const u of [u0, u1 - 0.12]) T.B('half_timber', u, u + 0.12, -out, 0.0, ya + 0.04, ya + h);
  T.B('roof_tile', u0 - 0.1, u1 + 0.1, -out - 0.15, 0.0, ya + h, ya + h + 0.12);
}
/** Stepping-stone bench of travertine at a door (a seat 1.4 m long) or steps up. */
export function stoneBench(T, u, len = 1.4) {
  T.B('travertine', u, u + len, -0.55, -0.1, 0.0, 0.42);
  T.B('travertine', u - 0.02, u + len + 0.02, -0.57, -0.08, 0.42, 0.48);
}
/** A pile of crates, sacks, barrels outside the door. */
export function litter(T, u, rand, kind = 0) {
  if (kind === 0) { // barrels
    for (let k = 0; k < 2; k++) V(T, 'timber', 'cupa', [[0.001, 0], [0.24, 0.0], [0.3, 0.25], [0.31, 0.42], [0.3, 0.6], [0.24, 0.85], [0.001, 0.85]], u + k * 0.6, -0.4, 0.0, 10);
    for (const yy of [0.14, 0.7]) for (let k = 0; k < 2; k++) V(T, 'iron', 'hoop', [[0.285, 0], [0.285, 0.04], [0.001, 0.04]], u + k * 0.6, -0.4, yy, 10);
  } else if (kind === 1) { // crates
    T.B('timber', u, u + 0.6, -0.7, -0.2, 0.0, 0.5); T.B('timber', u + 0.05, u + 0.55, -0.62, -0.28, 0.5, 0.95);
    T.B('wood_dark', u + 0.0, u + 0.6, -0.705, -0.7, 0.2, 0.25);
  } else { // sacks
    for (let k = 0; k < 3; k++) V(T, 'sacking', 'sack', [[0.2, 0], [0.26, 0.15], [0.24, 0.5], [0.12, 0.58], [0.001, 0.56]], u + (k % 2) * 0.45, -0.35 - Math.floor(k / 2) * 0.1, k > 1 ? 0.5 : 0.0, 8);
  }
}
void box;
