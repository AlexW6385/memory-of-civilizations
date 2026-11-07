// People at Petra (docs/settlements/petra.md §14): a company at table in the triclinium — Strabo's companies of thirteen,
// fewer here — sitting on the benches' mattresses round the table, two musicians on the floor by the doors; a caravan of
// camels with its drivers coming down the Outer Siq into the city, donkeys with loads, a dog.
import { TRICLINIUM, floorY } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));     // a figure faces −z when rot = 0

export function people() {
  const rand = rng(51), L = [], seed = () => Math.floor(rand() * 1e9);
  const robe = () => ({ dress: 'robe', cloth: ['cloth_white', 'linen', 'cloth_ochre', 'cloth_indigo', 'cloth_red'][Math.floor(rand() * 5)], cloth2: 'cloth_white', over: rand() < 0.5 ? 'cape' : 'sash', hair: 'short', beard: true, skin: 'skin_medium', feet: 'shod', hat: 'none' });
  // the company at table: on the three benches (0.85 m high, 1.9 m deep), facing the table
  const { at: [cx, fz], w: W, d: D } = TRICLINIUM, y = +floorY(cx, fz).toFixed(3), x0 = cx - W / 2, x1 = cx + W / 2, z1 = fz - 1.6, z0 = z1 - D, bh = 0.85 + 0.1;
  const tz = (z0 + 1.9 + z1 - 0.9) / 2 - 0.4, table = [cx, tz];
  for (const p of [[cx - 3.2, z0 + 1.0], [cx - 1.1, z0 + 1.0], [cx + 1.2, z0 + 1.0], [cx + 3.3, z0 + 1.0], [x0 + 1.0, z0 + 3.4], [x0 + 1.0, z0 + 5.6], [x1 - 1.0, z0 + 3.0], [x1 - 1.0, z0 + 5.4]]) {
    L.push({ t: 'figure', at: p, y: y + bh, rot: face(p, table), seed: seed(), ...robe(), pose: 'sit_ground' });
  }
  // the two musicians on the floor, a lute and a flute, and a servant with a jug
  L.push({ t: 'figure', at: [cx - 1.6, z1 - 1.6], y, rot: face([cx - 1.6, z1 - 1.6], table), seed: seed(), dress: 'robe', cloth: 'cloth_red', cloth2: 'cloth_ochre', over: 'shawl', hair: 'bun', beard: false, skin: 'skin_medium', feet: 'bare', pose: 'lute', h: 1.55 });
  L.push({ t: 'figure', at: [cx + 1.6, z1 - 1.6], y, rot: face([cx + 1.6, z1 - 1.6], table), seed: seed(), dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_indigo', over: 'shawl', hair: 'long', beard: false, skin: 'skin_medium', feet: 'bare', pose: 'flute', h: 1.55 });
  L.push({ t: 'figure', at: [cx + 0.9, tz + 0.9], y, rot: face([cx + 0.9, tz + 0.9], table), seed: seed(), dress: 'tunic', cloth: 'linen', over: 'belt', hair: 'short', skin: 'skin_medium', feet: 'bare', carry: 'pot' });
  // the caravan coming down the Outer Siq toward the city (the street's east end), its camels loaded, two drivers
  const path = [[118, -110], [110, -96], [102, -84], [94, -74], [86, -64], [78, -55]];
  path.forEach(([x, z], k) => { const n = path[Math.min(path.length - 1, k + 1)], p = path[Math.max(0, k - 1)], rot = Math.atan2(-(n[0] - p[0]), -(n[1] - p[1])); L.push({ t: 'animal', kind: 'camel', at: [x, z], y: floorY(x, z), rot, seed: seed(), gear: true }); });
  for (const [x, z] of [[74.5, -51.5], [107.5, -93.5]]) L.push({ t: 'figure', at: [x, z], y: floorY(x, z), rot: Math.atan2(40, -55), seed: seed(), dress: 'robe', cloth: 'cloth_brown', cloth2: 'cloth_white', over: 'cape', hat: 'turban', hatMat: 'cloth_white', beard: true, skin: 'skin_medium', feet: 'shod', pose: 'staff', carry: 'staff', len: 1.8, staffMat: 'wood_dark' });
  for (const [x, z] of [[60, -38], [62.2, -40.6]]) L.push({ t: 'animal', kind: 'donkey', at: [x, z], y: floorY(x, z), rot: Math.atan2(40, -55), seed: seed(), gear: true });
  L.push({ t: 'animal', kind: 'dog', at: [70, -46], y: floorY(70, -46), rot: 0.9, seed: seed() });
  return L;
}
