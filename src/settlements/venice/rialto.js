// The canals' quay walls, the Rialto bridge and its market, a traghetto (docs/settlements/venice.md §4 "The
// Rialto", §6). Pure data: the builders are the venetian style's (rive, rialto) and the shared objects (life).

import { RADIUS, SEA, GROUND, RIALTO, MARKET, rivePieces } from './layout.js';

const plan = (id, style, elements, bounds, extra = {}) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [0, 0], facing: 'n' }, bounds, rooms: [], elements, ...extra });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export function canalPlans() {
  const plans = [];
  // the quay walls, in four quarters so that what is out of view is not drawn
  const pieces = rivePieces(), Q = [[], [], [], []];
  for (const p of pieces) Q[(p[0] < 0 ? 0 : 1) + (p[1] < 0 ? 0 : 2)].push(p);
  Q.forEach((list, i) => { if (list.length) plans.push(plan(`venice-rive-${i}`, 'venetian', [{ t: 'rive', pieces: list, sea: SEA, top: GROUND }], [-RADIUS, -RADIUS, RADIUS, RADIUS], { center: [i % 2 ? 160 : -160, i < 2 ? -160 : 160], near: 420 })); });
  // the bridge
  const { x, z, span } = RIALTO;
  plans.push(plan('venice-rialto', 'venetian', [{ t: 'rialto', x, z, span, y: GROUND, sea: SEA, w: 8.4 }], [x - span / 2 - 2, z - 6, x + span / 2 + 2, z + 6],
    { rooms: [{ id: 'rialto-bridge', rect: [x - span / 2, z - 2, x + span / 2, z + 2], y: GROUND, kind: 'open' }] }));
  // the market on the campo at the bridge's west foot: the fish market's stalls along the canal, the Erberia's behind
  const rand = rng(1494), E = [], [m0, n0, m1, n1] = MARKET, wy = SEA - 0.05;
  const fig = (at, rot, o = {}) => E.push({ t: 'figure', at, rot, y: GROUND, seed: Math.floor(rand() * 1e9), dress: 'robe', legs: 'hose',
    cloth: ['cloth_black', 'cloth_red', 'cloth_brown', 'cloth_indigo', 'cloth_white'][Math.floor(rand() * 5)], cloth2: ['cloth_brown', 'cloth_black', 'cloth_red'][Math.floor(rand() * 3)],
    skin: 'skin_light', hat: ['cap', 'none', 'cap', 'veil'][Math.floor(rand() * 4)], over: ['cape', 'none', 'sash'][Math.floor(rand() * 3)], ...o });
  for (let k = 0, zz = n0 + 6; zz < n1 - 4; zz += 3.3, k++) {
    // row A (fish), its front to the west; row B (greens, fruit, bread), its front to the east
    E.push({ t: 'stall', at: [m1 - 6, zz], rot: -Math.PI / 2, seed: 100 + k, awning: k % 2 ? 'cloth_white' : 'cloth_red', goods: ['fish', 'fish', k % 3 ? 'fish' : 'basket'], w: 2.8, d: 1.3 });
    E.push({ t: 'stall', at: [m1 - 15, zz], rot: Math.PI / 2, seed: 200 + k, awning: ['cloth_ochre', 'cloth_white', 'cloth_green'][k % 3], goods: [['greens', 'heap', 'basket'], ['heap', 'greens', 'bread'], ['bread', 'basket', 'greens']][k % 3], w: 2.8, d: 1.3 });
    if (k % 2 === 0) fig([m1 - 4.6, zz + 0.3], Math.PI / 2, { pose: 'stand' });
    if (k % 2 === 1) fig([m1 - 16.4, zz - 0.3], -Math.PI / 2, { pose: 'stand', hat: 'veil' });
    if (rand() < 0.6) fig([m1 - 10.5 + (rand() - 0.5) * 2, zz + (rand() - 0.5)], rand() < 0.5 ? Math.PI / 2 : -Math.PI / 2, { pose: rand() < 0.5 ? 'talk' : 'stand', carry: rand() < 0.3 ? 'basket' : 'none' });
  }
  // the fondamenta at the water: barges unloading, crates, barrels and baskets set down, porters with sacks
  const face = (zz) => -190 - 10 * (40 - zz) / 120 - 21.55;                // the west quay's face (the Grand Canal's reach here: layout.js GRAND)
  for (const [zz, len] of [[n0 + 8, 12], [n0 + 24, 12], [n1 - 10, 10]]) {
    E.push({ t: 'boat', kind: 'barge', at: [face(zz) + 2.1, zz], y: SEA + 0.15, rot: 0, len, seed: zz | 0 });
    for (let q = 0; q < 4; q++) E.push({ t: ['crates', 'barrel', 'sacks', 'basket'][q], at: [m1 - 1.8 + (q % 2) * 0.9, zz - 2 + q * 1.1], rot: rand() * 6.28, seed: q + (zz | 0) });
    fig([m1 - 1.2, zz + 2.6], Math.PI / 2 * (rand() < 0.5 ? 1 : -1), { carry: 'sack', hat: 'cap' });
  }
  E.push({ t: 'chickens', kind: 'pigeon', n: 9, at: [m1 - 10.5, n0 + 4], seed: 7 });
  plans.push(plan('venice-rialto-market', 'life', E, [m0, n0, m1 + 10, n1], { center: [(m0 + m1) / 2, (n0 + n1) / 2], near: 260, rooms: [{ id: 'rialto-market', rect: MARKET, y: GROUND, kind: 'open', market: false }] }));
  // a traghetto in mid-canal, south of the bridge: the boatman standing at the stern, two passengers, one seated
  const T = [], tx = -199.6, tz = -75, gy = SEA - 0.05;
  T.push({ t: 'boat', kind: 'gondola', at: [tx, tz], y: gy, rot: Math.PI / 2, seed: 11 });
  T.push({ t: 'figure', at: [tx - 4.1, tz], y: gy + 0.42, rot: -Math.PI / 2, seed: 12, pose: 'punt', poleMat: 'timber', dress: 'robe', legs: 'hose', cloth: 'cloth_white', cloth2: 'cloth_red', skin: 'skin_light', hat: 'cap' });
  T.push({ t: 'figure', at: [tx + 0.6, tz - 0.1], y: gy + 0.2, rot: Math.PI / 2, seed: 13, pose: 'stand', dress: 'robe', cloth: 'cloth_black', skin: 'skin_light', hat: 'cap', over: 'cape' });
  T.push({ t: 'figure', at: [tx - 1.2, tz + 0.1], y: gy + 0.1, rot: Math.PI / 2, seed: 14, pose: 'sit', dress: 'robe', cloth: 'cloth_red', skin: 'skin_light', hat: 'veil' });
  // the traghetto's stations on both banks: gondolas waiting stern-on, a boatman on the quay
  for (const [sx, s] of [[tx - 21.4, -1], [tx + 21.6, 1]]) for (let i = 0; i < 3; i++) {
    T.push({ t: 'boat', kind: 'gondola', at: [sx - s * 6, tz - 4.5 + i * 3], y: gy, rot: Math.PI / 2, seed: 20 + i });
    if (i === 1) T.push({ t: 'figure', at: [sx + s * 1.5, tz - 1.5], y: GROUND, rot: s > 0 ? Math.PI / 2 : -Math.PI / 2, seed: 30 + s, pose: 'stand', dress: 'robe', legs: 'hose', cloth: 'cloth_white', cloth2: 'cloth_black', skin: 'skin_light', hat: 'cap' });
  }
  plans.push(plan('venice-traghetto', 'life', T, [tx - 30, tz - 8, tx + 30, tz + 8], { center: [tx, tz], near: 260 }));
  return plans;
}
