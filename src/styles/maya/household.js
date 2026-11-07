// The things of a Mesoamerican household, shared by the teotihuacano, aztec and maya styles: the hearth
// of three stones with the clay griddle (comal) on them, its ash and its sticks; the metate and its
// mano; cooking pots (ollas), the great water jar, storage jars, bowls; reed mats with folded cotton
// blankets; soot on the wall and ceiling over a fire. Built as closed solids; carvings cached.

import { lathe, place } from '../../core/geom.js';
import { carved } from './meso.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** The three hearthstones (tenamaxtli, k'oben), the comal on them, the bed of ash, sticks pushed in from one side; about 0.75 m across, the comal's top 0.27 m up. */
export const hearthKit = (stone = 'rubble') => carved(`hearth:${stone}`, (k) => {
  k.geo('plaster_grey', lathe([[0.001, 0], [0.42, 0], [0.38, 0.025], [0.001, 0.035]], 14));                 // the ash
  for (let i = 0; i < 3; i++) {
    const a = i * 2.094 + 0.4, x = Math.cos(a) * 0.24, z = Math.sin(a) * 0.24;
    k.geo(stone, lathe([[0.001, 0], [0.09, 0.01], [0.1, 0.1], [0.075, 0.2], [0.03, 0.235], [0.001, 0.24]], 7, (th) => 1 + 0.12 * Math.sin(th * 3 + i)).translate(x, 0, z));
  }
  k.geo('terracotta', lathe([[0.001, 0.235], [0.3, 0.24], [0.31, 0.262], [0.001, 0.255]], 18));           // the comal
  k.geo('pottery_dark', lathe([[0.27, 0.255], [0.29, 0.262], [0.001, 0.262], [0.001, 0.258]], 18));       // its blackened face
  for (let i = 0; i < 3; i++) { const a = 2.6 + (i - 1) * 0.35; k.seg('bark_pine', [Math.cos(a) * 0.12, 0.04, Math.sin(a) * 0.12], [Math.cos(a) * 0.75, 0.03 + i * 0.012, Math.sin(a) * 0.75], 0.022, 0.022); }
  k.geo('cloth_black', lathe([[0.001, 0.035], [0.1, 0.035], [0.06, 0.06], [0.001, 0.065]], 8).translate(0.05, 0, -0.05));   // the embers' char
});
/** The metate: the sloping slab of basalt on three legs, the mano lying across it; 0.6 m long. Faces +z (the kneeling grinder at −z). */
export const metateKit = (stone = 'basalt') => carved(`metate:${stone}`, (k) => {
  for (const [x, z] of [[-0.14, -0.22], [0.14, -0.22], [0, 0.22]]) k.fy(stone, [x - 0.045, x + 0.045, z - 0.045, z + 0.045], [x - 0.035, x + 0.035, z - 0.035, z + 0.035], 0, z < 0 ? 0.12 : 0.2);
  k.seg(stone, [0, 0.14, -0.3], [0, 0.25, 0.3], 0.19, 0.035);
  k.seg(stone, [-0.22, 0.235, -0.12], [0.22, 0.235, -0.12], 0.042, 0.035);
  k.geo('stucco_pale', lathe([[0.001, 0], [0.09, 0.005], [0.001, 0.03]], 8).translate(0, 0.2, 0.18));   // a little meal left on it
});
/** An olla: the round-bellied cooking pot with a short neck, blackened below, r ≈ 0.22 m. */
export const ollaKit = () => carved('olla', (k) => {
  k.geo('pottery_dark', lathe([[0.001, 0], [0.12, 0.01], [0.2, 0.08], [0.22, 0.16], [0.001, 0.16]], 14));
  k.geo('terracotta', lathe([[0.22, 0.16], [0.2, 0.26], [0.13, 0.32], [0.12, 0.36], [0.14, 0.38], [0.12, 0.38], [0.11, 0.34], [0.001, 0.3]], 14));
});
/** The great water jar (tinaja), 0.75 m high, a bowl as its lid; and a gourd dipper on it. */
export const waterJarKit = () => carved('tinaja', (k) => {
  k.geo('terracotta', lathe([[0.001, 0], [0.14, 0.01], [0.3, 0.2], [0.33, 0.38], [0.26, 0.6], [0.15, 0.68], [0.16, 0.74], [0.13, 0.74], [0.001, 0.7]], 16));
  k.geo('pottery_dark', lathe([[0.001, 0.74], [0.08, 0.745], [0.17, 0.8], [0.16, 0.81], [0.001, 0.77]], 14));
  k.geo('wood_ochre', lathe([[0.001, 0.79], [0.06, 0.8], [0.07, 0.84], [0.001, 0.86]], 8).translate(0.04, 0, 0));
});
/** A storage jar for maize or beans, 0.55 m, its mouth stopped with a cloth tied over. */
export const storeJarKit = () => carved('store-jar', (k) => {
  k.geo('terracotta', lathe([[0.001, 0], [0.12, 0.01], [0.24, 0.16], [0.25, 0.3], [0.17, 0.46], [0.11, 0.5], [0.12, 0.55], [0.001, 0.55]], 14));
  k.geo('cloth_white', lathe([[0.001, 0.55], [0.13, 0.545], [0.12, 0.575], [0.001, 0.59]], 10));
});
/** A stack of bowls and a painted cylinder jar (the cups of the household). */
export const bowlsKit = (paint = 'stucco_red') => carved(`bowls:${paint}`, (k) => {
  for (let i = 0; i < 3; i++) k.geo(i ? 'terracotta' : paint, lathe([[0.001, 0], [0.07, 0.005], [0.12, 0.06], [0.125, 0.07], [0.001, 0.02]], 12).translate(0, i * 0.035, 0));
  k.geo(paint, lathe([[0.001, 0], [0.08, 0], [0.085, 0.16], [0.08, 0.16], [0.001, 0.02]], 12).translate(0.24, 0, 0.05));
});
/** A sleeping mat (petlatl) with a folded blanket and a rolled one at its head; 1.9 × 0.95 m, along x. */
export const bedKit = (cloth = 'cloth_white', band = 'cloth_red') => carved(`bed:${cloth}:${band}`, (k) => {
  k.bx('reed_mat', -0.95, 0.95, 0, 0.018, -0.48, 0.48);
  k.bx(cloth, 0.2, 0.75, 0.018, 0.1, -0.36, 0.3);                                     // the folded blanket
  k.bx(band, 0.2, 0.75, 0.04, 0.07, 0.3, 0.315);                                     // its woven border
  k.seg(cloth, [-0.82, 0.07, -0.34], [-0.82, 0.07, 0.34], 0.06, 0.055);              // the rolled one at the head
});

/**
 * Soot over a fire on a face: an irregular dark stain, densest in its middle (a black core within a grey
 * spread), on a plane given by its centre c, its normal n (unit, along an axis) and its size (w across, h up
 * or, on a ceiling, along).
 */
export function soot(bag, c, n, w, h, seed = 1) {
  const r = rng(seed), p1 = r() * 6, p2 = r() * 6, wall = Math.abs(n[1]) < 0.5;
  // on a wall the stain is a plume, narrow over the fire and spreading as it rises (the disc's −z is up once stood)
  const mod = (th) => (0.9 + 0.07 * Math.sin(th * 3 + p1) + 0.03 * Math.sin(th * 5 + p2)) * (wall ? 1 - 0.35 * Math.sin(th) : 1);
  for (const [mat, s, off] of [['plaster_damp', 1, 0.006], ['cloth_grey', 0.55, 0.012]]) {
    const g = lathe([[0.001, 0], [0.5, 0], [0.5, 0.004], [0.001, 0.004]], 20, mod);        // a disc in xz, its face +y
    g.scale(w * s, 1, h * s);
    if (n[1] < -0.5) g.rotateX(Math.PI);                                                  // a ceiling: facing down
    else if (wall) { g.rotateX(Math.PI / 2); g.rotateY(Math.atan2(n[0], n[2])); g.translate(0, -h * (1 - s) * 0.25, 0); }   // the core low in the plume
    bag.add(mat, g.translate(c[0] + n[0] * off, c[1] + n[1] * off, c[2] + n[2] * off));
  }
}
/** Emit a cached carving turned by yaw (radians about y, +z toward (sin yaw, cos yaw)). */
export function put(bag, kit, x, y, z, yaw = 0, s = 1) {
  for (const [mat, list] of kit.m) for (const g of list) bag.add(mat, place(g.clone(), x, y, z, yaw, s));
}
/** A patch on a face (plaster re-laid, or fallen away to show the core): an irregular flat piece of `mat` centred at c, facing n, w × h, standing `off` out. */
export function patch(bag, mat, c, n, w, h, seed = 1, off = 0.008) {
  const r = rng(seed), p1 = r() * 6, p2 = r() * 6, p3 = r() * 6;
  const g = lathe([[0.001, 0], [0.5, 0], [0.5, 0.006], [0.001, 0.006]], 16, (th) => 0.86 + 0.1 * Math.sin(th * 2 + p1) + 0.05 * Math.sin(th * 5 + p2) + 0.03 * Math.sin(th * 9 + p3));
  g.scale(w, 1, h);
  if (Math.abs(n[1]) < 0.5) { g.rotateX(Math.PI / 2); g.rotateY(Math.atan2(n[0], n[2])); } else if (n[1] < 0) g.rotateX(Math.PI);
  bag.add(mat, g.translate(c[0] + n[0] * off, c[1] + n[1] * off, c[2] + n[2] * off));
}
