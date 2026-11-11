// Shibam — the townscape (docs/settlements/shibam.md §5–§8): the tower houses in rows along the streets, the sultan's palace, the wall and its
// gate, the square with its well and stalls, the people and beasts of the streets, the gardens' workers outside.

import { RADIUS, WALL, WALL_TH, WALL_H, GATE, SQUARE, PALACE, LM, lots, streets } from './layout.js';
import { ground } from './ground.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const base = (id, elements, style = 'hadhrami') => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [GATE.x, 100], facing: 'n' } });
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));          // a figure faces −z when rot = 0
const h = (x, z) => ground.height(x, z);

/** The wall with its corner towers and its one gate (a tower over the passage, its leaves folded back), merlons along the head. */
function wall() {
  const [x0, z0, x1, z1] = WALL, E = [], y0 = -3.2, gx = GATE.x;
  const w = (a, b) => { E.push({ t: 'wall', a, b, th: WALL_TH, y0, y1: WALL_H, mat: 'mud_plaster' }); E.push({ t: 'merlons', a, b, y: WALL_H, step: 1.7 }); };
  w([x0, z0], [x1, z0]); w([x0, z0], [x0, z1]); w([x1, z0], [x1, z1]);
  w([x0, z1], [gx - 6, z1]); w([gx + 6, z1], [x1, z1]);
  // the gate: a thick piece with the passage cut through, a tower's head over it; the leaves of cedar folded back along the passage's sides
  E.push({ t: 'wall', a: [gx - 6, z1], b: [gx + 6, z1], th: 4.6, y0, y1: 8.4, mat: 'mud_plaster', openings: [{ at: 6, w: GATE.w, h: GATE.h, y0: 0 }] });
  E.push({ t: 'merlons', a: [gx - 6, z1], b: [gx + 6, z1], y: 8.4, step: 1.7, th: 1.2 });
  E.push({ t: 'block', rect: [gx - GATE.w / 2 - 0.12, z1 - 2.1, gx - GATE.w / 2, z1 + 0.9], y0: 0, y1: 3.3, mat: 'cedar', collide: false });
  E.push({ t: 'block', rect: [gx + GATE.w / 2, z1 - 2.1, gx + GATE.w / 2 + 0.12, z1 + 0.9], y0: 0, y1: 3.3, mat: 'cedar', collide: false });
  E.push({ t: 'block', rect: [gx - GATE.w / 2 - 0.3, z1 - 2.5, gx + GATE.w / 2 + 0.3, z1 - 2.3], y0: GATE.h - 0.05, y1: GATE.h + 0.2, mat: 'timber', collide: false });
  // corner towers
  for (const [cx, cz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) {
    E.push({ t: 'block', rect: [cx - 2.8, cz - 2.8, cx + 2.8, cz + 2.8], y0, y1: 8.0, batter: [0.3, 0.3, 0.3, 0.3], mat: 'mud_plaster' });
    E.push({ t: 'merlons', a: [cx - 2.5, cz - 2.5], b: [cx + 2.5, cz - 2.5], y: 8.0, step: 1.5, th: 0.7 }); E.push({ t: 'merlons', a: [cx - 2.5, cz + 2.5], b: [cx + 2.5, cz + 2.5], y: 8.0, step: 1.5, th: 0.7 });
  }
  return E;
}

function square() {
  const E = [], rand = rng(1701), [x0, z0, x1, z1] = SQUARE;
  // the well and its trough at the square's middle, stalls and mats along its edges, benches under the houses
  E.push({ t: 'well', at: [-4, -12], y: 0, kind: 'windlass', mat: 'schist_rubble', roof: false });
  E.push({ t: 'trough', at: [-1.0, -12.6], y: 0, rot: 0 }); E.push({ t: 'trough', at: [-1.0, -11.2], y: 0, rot: 0 });
  for (const [x, z, goods] of [[-20, -20, ['pottery', 'baskets']], [-10, -22, ['heap', 'bread']], [9, -22, ['bolts', 'spice']], [20, -20, ['heap', 'baskets']]]) E.push({ t: 'stall', at: [x, z], y: 0, rot: 0, w: 2.6, d: 1.4, awning: rand() < 0.5 ? 'cloth_white' : 'cloth_indigo', goods, seed: Math.floor(rand() * 1e6) });
  for (const [x, z] of [[-18, 1.4], [-8, 1.4], [8, 1.4]]) E.push({ t: 'goods_mat', at: [x, z], y: 0, rot: 0, goods: ['heap', 'baskets'], seed: Math.floor(x * 7 + 99) });
  for (const x of [-24, 24]) E.push({ t: 'bench', at: [x, -26.4], y: 0, rot: 0, len: 2.2 });
  for (let k = 0; k < 6; k++) E.push({ t: 'sacks', at: [-27 + k * 2, 2.8 - (k % 2) * 0.4], y: 0, rot: 0, n: 3, seed: k + 2 });
  void z0; void x0; void x1; void z1;
  return E;
}

/** The people (docs/settlements/shibam.md §8): merchants and men of the town in the long white robe and turban, women veiled in black, boys; field workers in wide straw hats. */
function people() {
  const rand = rng(1702), T = [];
  const man = (at, rot, o = {}) => T.push({ t: 'figure', at, y: h(...at), rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: rand() < 0.7 ? 'cloth_white' : 'cloth_ochre', cloth2: 'cloth_white', over: rand() < 0.5 ? 'sash' : 'belt', skin: 'skin_medium', hat: 'turban', feet: 'shod', hair: 'short', beard: rand() < 0.6, ...o });
  const woman = (at, rot, o = {}) => T.push({ t: 'figure', at, y: h(...at), rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: 'cloth_black', cloth2: 'cloth_indigo', over: 'none', skin: 'skin_dark', hat: 'veil', feet: 'bare', hair: 'long', beard: false, ...o });
  // the square: talk, buying at the stalls, water from the well
  for (let k = 0; k < 22; k++) {
    const x = -27 + rand() * 54, z = -26 + rand() * 28, at = [x, z];
    if ((Math.abs(x + 4) < 1.8 && Math.abs(z + 12) < 1.8) || T.some((p) => Math.hypot(p.at[0] - x, p.at[1] - z) < 1.4) || (x > LM.rect[0] - 3 && x > 30)) continue;
    const r = rand(), rot = rand() * 6.28;
    if (r < 0.3) { man(at, rot, { pose: 'talk' }); const b = [x - Math.sin(rot) * 1.0, z + Math.cos(rot) * 1.0]; man(b, face(b, at)); }
    else if (r < 0.5) woman(at, rot, { carry: 'pot' });
    else if (r < 0.62) man(at, rot, { h: 0.7, hat: 'cap', over: 'none' });
    else man(at, rot, { carry: rand() < 0.3 ? 'basket' : 'none' });
  }
  // along the main street from the gate
  for (let k = 0; k < 6; k++) { const at = [-12 + rand() * 5, 40 + rand() * 50]; if (rand() < 0.5) man(at, rand() * 6.28, { carry: 'sack' }); else woman(at, rand() * 6.28, { carry: 'bundle' }); }
  // the gardens' workers outside the wall: women in the wide straw hat with hoes among the palms
  for (let k = 0; k < 12; k++) {
    const x = -90 + rand() * 180, z = 112 + rand() * 40, at = [x, z];
    if (ground.cover(x, z).fields < 0.3) continue;
    woman(at, rand() * 6.28, { hat: 'straw', cloth: 'cloth_indigo', carry: 'hoe', ...(rand() < 0.5 ? { pose: 'squat', carry: 'none' } : {}) });
  }
  // at the gate: a guard and a man with camels
  man([GATE.x + 3.4, 99.5], Math.PI, { pose: 'staff', carry: 'staff', len: 1.6 });
  return T;
}
function beasts() {
  const rand = rng(1703), E = [];
  const put = (kind, at, o = {}) => E.push({ t: 'animal', kind, at, y: h(...at), rot: rand() * 6.28, seed: Math.floor(rand() * 1e6), ...o });
  for (let k = 0; k < 5; k++) put('donkey', [-14 + rand() * 8, 105 + rand() * 18]);
  for (let k = 0; k < 3; k++) put('camel', [-30 + k * 5 + rand() * 2, 112 + rand() * 6], { gear: true });
  for (let k = 0; k < 10; k++) { const x = -25 + rand() * 50, z = -25 + rand() * 25; put(rand() < 0.5 ? 'goat' : 'sheep', [x, z]); }
  for (let k = 0; k < 5; k++) put('goat', [-14 + rand() * 5, 60 + rand() * 30]);
  for (let k = 0; k < 6; k++) put('dog', [-20 + rand() * 40, -24 + rand() * 40]);
  // the beasts stabled at the foot of the enterable house
  put('goat', [38.3, -24.2], { rot: 1 }); put('goat', [39.2, -24.8], { rot: 3 }); put('donkey', [40.6, -25.6], { rot: 4.7 });
  for (const [x, z] of [[-3, -4], [12, -6], [-22, -3]]) E.push({ t: 'chickens', kind: 'pigeon', at: [x, z], rot: 0, n: 5, seed: Math.floor(x * 3 + 17) });
  return E;
}

export async function town() {
  const plans = [], L = lots();
  // the tower houses in chunks of the town's area, so that the far ones are culled together
  const cells = new Map();
  for (const l of L) { const k = Math.floor((l.rect[0] + l.rect[2]) / 2 / 70) + ',' + Math.floor((l.rect[1] + l.rect[3]) / 2 / 70); (cells.get(k) ?? cells.set(k, []).get(k)).push(l); }
  let i = 0;
  for (const list of cells.values()) plans.push(base(`shibam-towers-${i++}`, list.map((l) => ({ t: 'tower_house', rect: l.rect, front: l.front, storeys: l.storeys, seed: l.seed, free: l.free, rich: l.rich }))));
  plans.push(base('shibam-palace', [{ t: 'tower_house', rect: PALACE, front: 's', storeys: 6, seed: 99, white: 3, towers: true, free: { n: 1, s: 1, e: 1, w: 1 }, rich: false }]));
  plans.push(base('shibam-wall', wall()));
  plans.push({ ...base('shibam-square', square(), 'life') });
  plans.push({ ...base('shibam-people', people(), 'life') });
  plans.push({ ...base('shibam-beasts', beasts(), 'life') });
  void streets; void WALL;
  return plans;
}
