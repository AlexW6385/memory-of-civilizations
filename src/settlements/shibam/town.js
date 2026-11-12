// Shibam — the townscape (docs/settlements/shibam.md §5–§8): the tower houses in rows along the streets, the sultan's palace, the wall and its
// gate, the square with its well and stalls, the people and beasts of the streets, the gardens' workers outside.

import { RADIUS, WALL, WALL_TH, WALL_H, GATE, SQUARE, PALACE, LM, lots, streets, shops, doorOf, crossings, gardens, HALL, shopPoint, shopSize } from './layout.js';
import { ground, chanZ } from './ground.js';

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
  // the buttresses of the wall's outer face every thirteen metres, the rubble at its foot
  const bt = WALL_TH / 2, put = (rect, ba) => E.push({ t: 'block', rect, y0, y1: WALL_H - 0.5, batter: ba, mat: 'mud_plaster' });
  for (let x = x0 + 12; x < x1 - 8; x += 13) put([x - 0.6, z0 - bt - 0.8, x + 0.6, z0 - bt], [0.15, 0.15, 0.5, 0]);
  for (let x = x0 + 12; x < x1 - 8; x += 13) if (Math.abs(x - gx) > 10) put([x - 0.6, z1 + bt, x + 0.6, z1 + bt + 0.8], [0.15, 0.15, 0, 0.5]);
  for (let z = z0 + 12; z < z1 - 8; z += 13) { put([x0 - bt - 0.8, z - 0.6, x0 - bt, z + 0.6], [0.5, 0, 0.15, 0.15]); put([x1 + bt, z - 0.6, x1 + bt + 0.8, z + 0.6], [0, 0.5, 0.15, 0.15]); }
  E.push({ t: 'block', rect: [x0 - bt - 0.1, z0 - bt - 0.1, x1 + bt + 0.1, z0 - bt + 0.02], y0, y1: -1.2, mat: 'schist_rubble', collide: false });
  // corner towers
  for (const [cx, cz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) {
    E.push({ t: 'block', rect: [cx - 2.8, cz - 2.8, cx + 2.8, cz + 2.8], y0, y1: 8.0, batter: [0.3, 0.3, 0.3, 0.3], mat: 'mud_plaster' });
    E.push({ t: 'merlons', a: [cx - 2.5, cz - 2.5], b: [cx + 2.5, cz - 2.5], y: 8.0, step: 1.5, th: 0.7 }); E.push({ t: 'merlons', a: [cx - 2.5, cz + 2.5], b: [cx + 2.5, cz + 2.5], y: 8.0, step: 1.5, th: 0.7 });
  }
  return E;
}

function square() {
  const E = [], rand = rng(1701);
  // the well and its trough at the square's middle
  E.push({ t: 'well', at: [-4, -12], y: 0, kind: 'windlass', mat: 'schist_rubble', roof: false });
  E.push({ t: 'trough', at: [-1.0, -12.6], y: 0, rot: 0 }); E.push({ t: 'trough', at: [-1.0, -11.2], y: 0, rot: 0 });
  // the stalls: a row under the palace's front, another by the well and on the square's east side (the way to the tower house kept open)
  const goods = [['pottery', 'baskets'], ['heap', 'bread'], ['bolts', 'spice'], ['heap', 'baskets'], ['spice', 'heap'], ['bolts', 'pottery'], ['bread', 'heap']];
  const stalls = [[-26, -24], [-19, -24], [-12, -24.5], [-2, -24], [6, -24.5], [13, -24], [-26, -15], [-14, -3.5], [14, -3.5], [21, -3], [27, -6]];
  stalls.forEach(([x, z], i) => E.push({ t: 'stall', at: [x, z], y: 0, rot: 0, w: 2.6, d: 1.4, awning: ['cloth_white', 'cloth_indigo', 'cloth_ochre', 'cloth_white'][Math.floor(rand() * 4)], goods: goods[i % goods.length], seed: Math.floor(rand() * 1e6) }));
  // the market's shade: palm mats on trunks, the sellers of grain and dates and the men who talk beneath
  for (const [x, z] of [[11, -14], [14, -13], [-23, -8], [-12, -2.5], [-10, -3], [-21, -1], [3, -1], [10, 0.4], [24, 0.5], [-26, 0.2], [18, 0.4], [-18, 0.2], [28, -10], [29, -13]]) E.push({ t: 'goods_mat', at: [x, z], y: 0, rot: Math.round(rand() * 4) * 1.57, goods: ['heap', 'baskets', 'bread', 'spice'], seed: Math.floor(x * 7 + z * 3 + 99) });
  for (const [x, z] of [[-17, -20], [4, -21], [15, -21], [-28, -19], [-6, 0.8], [8, 0.5]]) E.push({ t: 'pot', kind: 'water_pot', at: [x, z], y: 0, n: 4, seed: Math.floor(x * 5 + 31) });
  for (const x of [-18, -9, 0, 9, 18]) E.push({ t: 'bench', at: [x, -29.6], y: 0, rot: 0, len: 2.4 });
  for (const x of [-24, 24]) E.push({ t: 'bench', at: [x, -26.4], y: 0, rot: 0, len: 2.2 });
  for (let k = 0; k < 8; k++) E.push({ t: 'sacks', at: [-26 + k * 7, -27.6 - (k % 2) * 0.3], y: 0, rot: 0, n: 3, seed: k + 2 });
  E.push({ t: 'firewood', at: [-29, -20], y: 0, rot: 1.57 }); E.push({ t: 'firewood', at: [-29, -12], y: 0, rot: 1.57 });
  // the street door's stone and the gate's trough outside the wall
  E.push({ t: 'trough', at: [GATE.x + 5.5, WALL[3] + 6], y: h(GATE.x + 5.5, WALL[3] + 6), rot: 0 });
  return E;
}

/** The people (docs/settlements/shibam.md §8): merchants and men of the town in the long white robe and turban, women veiled in black, boys; field workers in wide straw hats. */
function people() {
  const rand = rng(1702), T = [];
  const man = (at, rot, o = {}) => T.push({ t: 'figure', at, y: h(...at), rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: rand() < 0.7 ? 'cloth_white' : 'cloth_ochre', cloth2: 'cloth_white', over: rand() < 0.5 ? 'sash' : 'belt', skin: 'skin_medium', hat: 'turban', feet: 'shod', hair: 'short', beard: rand() < 0.6, ...o });
  const woman = (at, rot, o = {}) => T.push({ t: 'figure', at, y: h(...at), rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: 'cloth_black', cloth2: 'cloth_indigo', over: 'none', skin: 'skin_dark', hat: 'veil', feet: 'bare', hair: 'long', beard: false, ...o });
  const busy = (x, z, d = 1.3) => T.some((p) => Math.hypot(p.at[0] - x, p.at[1] - z) < d);
  // the square: talk, buying at the stalls, water from the well, men seated in the shade
  for (let k = 0; k < 46; k++) {
    const x = -27 + rand() * 54, z = -26 + rand() * 27, at = [x, z];
    if ((Math.abs(x + 4) < 1.8 && Math.abs(z + 12) < 1.8) || busy(x, z) || (x > 29 && z < -16) || Math.hypot(x + 6, z + 8) < 1.2) continue;
    const r = rand(), rot = rand() * 6.28;
    if (r < 0.3) { man(at, rot, { pose: 'talk' }); const b = [x - Math.sin(rot) * 1.0, z + Math.cos(rot) * 1.0]; man(b, face(b, at)); }
    else if (r < 0.5) woman(at, rot, { carry: 'pot' });
    else if (r < 0.62) man(at, rot, { h: 0.7, hat: 'cap', over: 'none' });
    else man(at, rot, { carry: rand() < 0.3 ? 'basket' : 'none' });
  }
  // the sellers sitting behind their stalls and mats, men sitting in the shade on the ground, the water drawn at the well
  for (const [x, z] of [[-26, -24], [-19, -24], [-12, -24.5], [-2, -24], [6, -24.5], [13, -24], [-26, -15], [-14, -3.5], [14, -3.5], [21, -3], [27, -6]]) man([x, z - 1.05], 0, { pose: 'cross', beard: true });
  for (const [x, z] of [[12, -13], [15.5, -15.5], [-24, -9], [-21.5, -7], [24, -11], [26, -10.5]]) man([x, z], rand() * 6.28, { pose: 'cross' });
  for (const d of [[-4, -13.4, 0], [-2.8, -10.8, 3.2]]) woman([d[0], d[1]], d[2], { carry: 'pot' });
  // along the main street from the gate and the streets round the square
  for (let k = 0; k < 14; k++) { const at = [GATE.x - 2.4 + rand() * 4.8, 20 + rand() * 76]; if (rand() < 0.45) man(at, rand() * 6.28, { carry: 'sack' }); else if (rand() < 0.6) woman(at, rand() * 6.28, { carry: 'bundle' }); else man(at, rand() * 6.28, { pose: 'talk' }); }
  // sitting at the doors on the mastabas, along the streets
  const L = lots();
  for (let k = 0; k < L.length; k += 4) {
    const l = L[k]; if (l.front !== 'n' || l.sq) continue;
    const [dx, dz] = [doorOf(l), l.front === 'n' ? l.rect[1] : l.rect[3]], out = l.front === 'n' ? -1 : 1, at = [dx + 1.6 * (k % 2 ? 1 : -1), dz + out * 0.5];
    if (Math.hypot(at[0] - GATE.x, at[1] - 100) < 4) continue;
    if (rand() < 0.5) man(at, 0, { pose: 'sit_low', beard: true }); else woman(at, rand() * 6.28, { pose: 'squat', carry: 'none' });
  }
  // the gardens' workers outside the wall: women in the wide straw hat with hoes among the palms
  for (let k = 0; k < 24; k++) {
    const x = -125 + rand() * 250, z = 112 + rand() * 36, at = [x, z];
    if (ground.cover(x, z).fields < 0.3) continue;
    woman(at, rand() * 6.28, { hat: 'straw', cloth: 'cloth_indigo', carry: 'hoe', ...(rand() < 0.5 ? { pose: 'squat', carry: 'none' } : {}) });
  }
  // at the gate: a guard and a man with camels
  man([GATE.x + 3.4, 99.5], Math.PI, { pose: 'staff', carry: 'staff', len: 1.6 });
  man([GATE.x - 3.4, 99.5], Math.PI, { pose: 'sit_low', beard: true });
  // at the palace's door: the sultan's guards with their long guns
  for (const x of [-3.2, 3.2]) man([x, PALACE[3] + 1.4], 0, { pose: 'staff', carry: 'staff', len: 1.7, cloth: 'cloth_ochre' });
  return T;
}
function beasts() {
  const rand = rng(1703), E = [];
  const put = (kind, at, o = {}) => E.push({ t: 'animal', kind, at, y: h(...at), rot: rand() * 6.28, seed: Math.floor(rand() * 1e6), ...o });
  for (let k = 0; k < 5; k++) put('donkey', [-14 + rand() * 8, 105 + rand() * 18]);
  for (let k = 0; k < 3; k++) put('camel', [-30 + k * 5 + rand() * 2, 112 + rand() * 6], { gear: true });
  // the square: camels at rest with their loads at the east side, donkeys tethered at the west, the goats and sheep that wander
  put('camel', [24, 3.8], { gear: true, rot: 1.6 }); put('camel', [27, -0.5], { gear: true, rot: 4.4 }); put('donkey', [-27.5, -3]); put('donkey', [-28, -4.2]); put('donkey', [29, 0.5]);
  for (let k = 0; k < 12; k++) { const x = -25 + rand() * 50, z = -25 + rand() * 25; put(rand() < 0.5 ? 'goat' : 'sheep', [x, z]); }
  for (let k = 0; k < 9; k++) put('goat', [-14 + rand() * 5, 60 + rand() * 30]);
  for (let k = 0; k < 8; k++) put('dog', [-20 + rand() * 40, -24 + rand() * 40]);
  for (let k = 0; k < 8; k++) put('donkey', [GATE.x - 2 + rand() * 4, 30 + rand() * 60]);
  // the beasts stabled at the foot of the enterable house
  put('goat', [38.3, -24.2], { rot: 1 }); put('goat', [39.2, -24.8], { rot: 3 }); put('donkey', [40.6, -25.6], { rot: 4.7 });
  for (const [x, z] of [[-3, -4], [12, -6], [-22, -3], [0, 0], [16, -20], [-10, -26]]) E.push({ t: 'chickens', kind: 'pigeon', at: [x, z], rot: 0, n: 5, seed: Math.floor(x * 3 + 17) });
  // the cats of the shops
  for (const l of shops()) if (l.shop.i % 3 === 0) { const x = doorOf(l) + 1.8, z = l.front === 'n' ? l.rect[1] - 0.7 : l.rect[3] + 0.7; E.push({ t: 'animal', kind: 'cat', at: [x, z], y: 0, rot: rand() * 6.28, seed: l.seed % 1000 }); }
  return E;
}

/** The washing hung across the alleys and the streets between the storeys, and the covered passages (sabat) over some streets. */
function crossings_() {
  const rand = rng(1705), lines = [], bridges = [], C = crossings();
  for (const c of C) {
    const doors = c.dir === 'z' ? [doorOf(c.a), doorOf(c.b)] : [];
    if (c.dir === 'z' && c.hi - c.lo >= 3.8 && rand() < 0.2 && !c.a.shop && !c.b.shop) {
      let bx = null;
      for (let t = 0; t < 8 && bx === null; t++) { const x = c.lo + 1.4 + (c.hi - c.lo - 2.8) * (t / 7); if (doors.every((d) => Math.abs(d - x) > 1.9) && Math.abs(x - GATE.x) > 6.5) bx = x; }
      if (bx !== null) { bridges.push({ t: 'sabat', c: [bx, c.z], dir: 'z', gap: c.gap, w: 2.4, y0: 3.9, h: 2.5 }); c.used = true; continue; }
    }
    if (c.used || rand() > (c.dir === 'z' ? 0.16 : 0.3)) continue;
    const ea = 0.3, y = 4.4 + rand() * 3.0, gap = c.gap + 0.2, len = Math.ceil((gap + 2 * ea) * 4) / 4;
    if (c.dir === 'z') { if (c.hi - c.lo < 2.2) continue; const x = c.lo + 0.9 + rand() * (c.hi - c.lo - 1.8); if (doors.some((d) => Math.abs(d - x) < 1.4)) continue; lines.push({ t: 'wash_line', at: [x, c.z], y, rot: -Math.PI / 2, len, emb: [ea, ea], clear: [0.3, 0.3], pole: false, drop: 0.95, seed: Math.floor(rand() * 1e9) }); }
    else { if (c.hi - c.lo < 3) continue; const z = c.lo + 1 + rand() * (c.hi - c.lo - 2); lines.push({ t: 'wash_line', at: [c.x, z], y, rot: 0, len, emb: [ea, ea], clear: [0.3, 0.3], pole: false, drop: 0.95, seed: Math.floor(rand() * 1e9) }); }
  }
  return { lines, bridges };
}

/** The people in the rooms: the keeper at his trade, a customer, guests in the coffee house, the sultan's hall. */
function interiorLife() {
  const rand = rng(1706), T = [], Y = 0.06;
  const fig = (at, rot, o = {}) => T.push({ t: 'figure', at, y: Y, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: ['cloth_white', 'cloth_ochre', 'cloth_white', 'cloth_brown'][Math.floor(rand() * 4)], cloth2: 'cloth_white', over: rand() < 0.5 ? 'sash' : 'belt', skin: 'skin_medium', hat: 'turban', feet: 'bare', hair: 'short', beard: rand() < 0.6, ...o });
  // (a, b, pose, toward a, toward b) by trade, in the room's frame
  for (const l of shops()) {
    const { W, D } = shopSize(l), cx = W / 2, tr = l.shop.trade, P = (a, b) => shopPoint(l, a, b);
    const at = (a, b, pose, ta, tb, o = {}) => { const p = P(a, b); fig(p, face(p, P(ta, tb)), { pose, ...o }); };
    switch (tr) {
      case 'spice': at(1.7, 2.3, 'cross', 0.5, 2.3); break;
      case 'cloth': at(W - 1.9, 2.4, 'cross', W - 1.0, 2.4); at(cx - 0.4, 1.4, 'stand', W - 1.0, 2.4); break;
      case 'grain': at(cx + 1.2, 1.1, 'stand', cx, D - 2.0); break;
      case 'qahwa': at(cx + 1.4, D - 1.0, 'stand', cx, D - 1.4); at(0.55, 2.4, 'sit', W, 2.4); at(0.55, 3.8, 'sit', W, 3.8); at(W - 0.5, 2.8, 'sit', 0, 2.8, { hat: 'cap' }); break;
      case 'honey': at(1.9, 2.1, 'stand', 0.5, 2.1); break;
      case 'indigo': at(W - 1.9, 1.4, 'stand', W - 1.0, 2.4); break;
      case 'silver': at(1.9, 2.0, 'cross', 0.6, 2.0); break;
      case 'weaver': at(W - 1.3, 1.0, 'sit', W - 1.3, 3.0); break;
      case 'smith': at(1.2, D - 2.9, 'stand', 1.0, D - 1.4); break;
      case 'carpenter': at(1.5, 3.2, 'stand', 0.5, 3.2); break;
      case 'jars': at(cx + 1.1, 1.0, 'stand', cx, D - 2); break;
      case 'tailor': at(cx - 0.4, 2.1, 'cross', cx + 0.8, 2.1); break;
      case 'barber': at(cx, 2.7, 'sit', cx, D); at(cx, 3.4, 'stand', cx, 2.7); break;
      default: break;
    }
    if (rand() < 0.55 && tr !== 'barber') at(cx - 0.9, 1.1, 'stand', cx, D - 1, { carry: rand() < 0.3 ? 'basket' : 'none' });
  }
  // the sultan's hall: the sultan on the dais with two attendants standing, men seated along the walls, the guards by the rack
  const [x0, z0, x1, z1] = HALL.rect, W = x1 - x0, D = z1 - z0, P = (a, b) => [x0 + a, z1 - b];
  const sit = (a, b, ta, tb, o = {}) => { const p = P(a, b); T.push({ t: 'figure', at: p, y: Y + (o.up ?? 0), rot: face(p, P(ta, tb)), seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: o.cloth ?? 'cloth_white', cloth2: 'cloth_white', over: 'sash', skin: 'skin_medium', hat: 'turban', feet: 'bare', hair: 'short', beard: true, pose: o.pose ?? 'cross', ...o.extra }); };
  sit(W / 2, D - 0.8, W / 2, 0, { up: 0.3, cloth: 'cloth_white' });
  sit(W / 2 - 2.8, D - 1.9, W / 2, D - 0.8, { pose: 'stand', up: 0.3 }); sit(W / 2 + 2.8, D - 1.9, W / 2, D - 0.8, { pose: 'stand', up: 0.3, cloth: 'cloth_ochre' });
  for (let b = 5; b < D - 5; b += 3.1) { sit(0.55, b, W / 2, b, { up: 0.39, cloth: ['cloth_white', 'cloth_ochre', 'cloth_brown'][Math.floor(b) % 3] }); if (b % 2 < 1) sit(W - 0.55, b, W / 2, b, { up: 0.39 }); }
  sit(3.0, 1.2, W / 2, 6, { pose: 'staff', extra: { carry: 'staff', len: 1.6 } }); sit(1.0, 1.6, W / 2, 6, { pose: 'sit', up: 0 });
  return T;
}

export async function town() {
  const plans = [], L = lots(), S = shops();
  void S;
  // the tower houses in chunks of the town's area, so that the far ones are culled together
  const cells = new Map();
  for (const l of L) { const k = Math.floor((l.rect[0] + l.rect[2]) / 2 / 70) + ',' + Math.floor((l.rect[1] + l.rect[3]) / 2 / 70); (cells.get(k) ?? cells.set(k, []).get(k)).push(l); }
  let i = 0;
  for (const list of cells.values()) plans.push(base(`shibam-towers-${i++}`, list.map((l) => ({ t: 'tower_house', rect: l.rect, front: l.front, storeys: l.storeys, seed: l.seed, free: l.free, rich: l.rich, door: doorOf(l), ...(l.shop ? { shop: l.shop } : {}) }))));
  plans.push(base('shibam-palace', [{ t: 'tower_house', rect: PALACE, front: 's', storeys: 6, seed: 99, white: 3, towers: true, free: { n: 1, s: 1, e: 1, w: 1 }, rich: false, hall: true, door: HALL.door }]));
  plans.push(base('shibam-wall', wall()));
  // ground kept clear of the generic street life (src/objects/life.js reads these footprints): the shops' doors, the palace's door, the stalls and the arrival
  const res = [];
  for (const l of shops()) { const u = doorOf(l); res.push({ t: 'reserve_wall', rect: l.front === 'n' ? [u - 1.4, l.rect[1] - 2.5, u + 1.4, l.rect[1]] : [u - 1.4, l.rect[3], u + 1.4, l.rect[3] + 2.5] }); }
  res.push({ t: 'reserve_wall', rect: [-2.6, PALACE[3], 0, PALACE[3] + 3] }, { t: 'reserve_wall', rect: [0, PALACE[3], 2.6, PALACE[3] + 3] });
  for (const [x, z] of [[-26, -24], [-19, -24], [-12, -24.5], [-2, -24], [6, -24.5], [13, -24], [-26, -15], [-14, -3.5], [14, -3.5], [21, -3], [27, -6]]) res.push({ t: 'reserve_wall', rect: [x - 1.6, z - 1.4, x + 1.6, z + 1.5] });
  res.push({ t: 'reserve_wall', rect: [SQUARE[0], SQUARE[1], SQUARE[2], SQUARE[3]] });
  plans.push(base('shibam-reserve', res));
  const { lines, bridges } = crossings_();
  plans.push(base('shibam-sabat', bridges));
  plans.push({ ...base('shibam-washing', lines, 'life') });
  plans.push({ ...base('shibam-square', square(), 'life') });
  plans.push(base('shibam-shades', [[8, -17.5, 17, -11], [-27, -11, -19, -5.5], [20, -13, 28, -8.5]].map((r, k) => ({ t: 'mat_shade', rect: r, y: 0, seed: 40 + k }))));
  plans.push({ ...base('shibam-people', people(), 'life') });
  plans.push({ ...base('shibam-interior-life', interiorLife(), 'life') });
  plans.push({ ...base('shibam-beasts', beasts(), 'life') });
  // the gardens: the walled plots, the burial ground, the wells with their donkeys
  const G = gardens(chanZ), gel = G.map((g) => ({ t: 'garden_plot', rect: g.rect, y: h((g.rect[0] + g.rect[2]) / 2, (g.rect[1] + g.rect[3]) / 2), gate: g.gate, seed: g.seed }));
  gel.push({ t: 'graveyard', rect: [45, -150, 95, -120], y: h(70, -135), seed: 5 });
  plans.push(base('shibam-gardens', gel));
  const rr = rng(1707), gl = [];
  G.forEach((g, k) => {
    if (k % 3 !== 0) return;
    const [x0, z0, x1, z1] = g.rect, wx = x0 + 5 + rr() * (x1 - x0 - 10), wz = z0 + 4 + rr() * (z1 - z0 - 8), y = h(wx, wz);
    gl.push({ t: 'well', at: [wx, wz], y, kind: 'pulley', mat: 'schist_rubble', roof: false }, { t: 'trough', at: [wx + 1.4, wz + 0.2], y, rot: 0 }, { t: 'animal', kind: 'donkey', at: [wx + 3.2, wz + 1.5], y: h(wx + 3.2, wz + 1.5), rot: rr() * 6.28, seed: k });
  });
  plans.push({ ...base('shibam-garden-life', gl, 'life') });
  void streets; void WALL;
  return plans;
}
