// Taos Pueblo is its own town: the house blocks are part of the landmark's plan (docs/settlements/taos.md
// §5). This adds the life of the plaza and the roofs (§4.2): women grinding at the mealing bins, the
// grinder inside the furnished room, people on the terraces and the plaza, firewood, jars and baskets
// on the roofs, dogs and turkeys about the plaza.
import { NORTH, SOUTH, CELL, RADIUS, ROOM, creekZ, inCreek } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const ST = 2.7;
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));     // a figure faces −z when rot = 0
const plan = (id, style, elements) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 30], facing: 'n' } });

export async function town() {
  const rand = rng(1500), P = [], T = [];
  // women in the manta of cotton or deerskin, tied over one shoulder, and moccasins; men in deerskin
  // shirt and leggings, some with a blanket of rabbit fur over the shoulders; the hair long [inferred]
  const skin = () => (rand() < 0.7 ? 'skin_medium' : 'skin_dark');
  const woman = (at, y, rot, o = {}) => P.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', cloth: ['cloth_white', 'hide_tan', 'cloth_brown', 'cloth_black'][Math.floor(rand() * 4)], cloth2: 'cloth_red', over: rand() < 0.3 ? 'shawl' : 'belt', skin: skin(), hat: 'none', feet: 'shod', hair: 'long', beard: false, ...o });
  const man = (at, y, rot, o = {}) => { const cl = rand() < 0.35; P.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'tunic', cloth: rand() < 0.7 ? 'hide_tan' : 'hide_brown', cloth2: cl ? 'hide_white' : 'hide_tan', legs: 'hose', over: cl ? 'cloak' : 'belt', skin: skin(), hat: 'none', feet: 'shod', hair: 'long', beard: false, ...o }); };
  // the grinders at the bins under the racks (the row's centre at x, the bins at x − 0.62, x, x + 0.62)
  for (const x of [-52, -17, 18, 30]) for (const u of [-0.62, 0.62]) if (rand() < 0.75) woman([x + u, -43.15], 0, 0, { pose: 'kneel', over: 'none' });
  // and inside the room, at its first bin
  const ix0 = NORTH.x0 + ROOM.j * CELL + 0.5, iz0 = NORTH.z0 + ROOM.i * CELL + 0.5, cx = ix0 + 2;
  woman([cx - 0.1 - 0.62, iz0 + 0.025 + 0.48 + 0.78], 0.06, 0, { pose: 'kneel', over: 'none' });
  // the plaza: people talking, carrying water from the creek, children
  for (let k = 0; k < 26; k++) {
    const x = -60 + rand() * 120, z = -38 + rand() * 70;
    if (inCreek(x, z, 2) || P.some((p) => Math.hypot(p.at[0] - x, p.at[1] - z) < 1.5)) continue;
    const r = rand(), at = [x, z], rot = rand() * 6.28;
    if (r < 0.3) woman(at, 0, rot, { carry: 'pot' });
    else if (r < 0.45) woman(at, 0, rot, { child: true, h: 1.15 });
    else if (r < 0.75) { man(at, 0, rot, { pose: 'talk' }); const b = [x + Math.sin(rot) * -1.1, z + Math.cos(rot) * -1.1]; man(b, 0, face(b, at)); }
    else man(at, 0, rot);
  }
  // the roofs: on some, a figure at the back corner of the terrace, firewood stacked, jars and baskets
  const E = [];
  for (const B of [NORTH, SOUTH]) {
    const H = B.heights, back = B.front === 's' ? -1 : 1;
    for (let i = 0; i < H.length; i++) for (let j = 0; j < H[0].length; j++) {
      const n = H[i][j]; if (!n || (B === NORTH && i === ROOM.i && j === ROOM.j)) continue;
      const x0 = B.x0 + j * CELL, z0 = B.z0 + i * CELL, y = n * ST, zb = back < 0 ? z0 + 0.75 : z0 + CELL - 0.75, r = rand();
      if (r < 0.12) E.push({ t: 'firewood', at: [x0 + 0.75, zb], y, rot: Math.PI / 2, len: 1.5, seed: i * 31 + j });
      else if (r < 0.2) E.push({ t: 'pot', kind: rand() < 0.5 ? 'water_pot' : 'dark_pot', n: 2 + Math.floor(rand() * 2), at: [x0 + 0.8, zb], y, seed: i * 7 + j });
      else if (r < 0.25) E.push({ t: 'basket', n: 2, at: [x0 + 0.8, zb], y, seed: i * 13 + j, goods: 'cloth_ochre' });
      else if (r < 0.33) (rand() < 0.5 ? woman : man)([x0 + 0.7, zb], y, back < 0 ? Math.PI : 0, rand() < 0.4 ? { pose: 'sit_ground' } : {});
    }
  }
  // dogs about the plaza and the roofs' feet; turkeys kept for their feathers, a flock or two
  for (let k = 0; k < 9; k++) { const x = -70 + rand() * 140, z = -40 + rand() * 75; if (!inCreek(x, z, 1.5)) E.push({ t: 'animal', kind: 'dog', at: [x, z], y: 0, rot: rand() * 6.28, seed: k + 3 }); }
  for (const [fx, fz] of [[-40, 18], [45, -20], [8, 25]]) for (let k = 0; k < 5; k++) {
    const x = fx + (rand() - 0.5) * 6, z = fz + (rand() - 0.5) * 5;
    if (!inCreek(x, z, 1.5)) T.push({ t: 'turkey', at: [x, z], y: 0, rot: rand() * 6.28, tom: k === 0 });
  }
  void creekZ;
  return [plan('taos-people', 'life', [...P, ...E]), plan('taos-turkeys', 'pueblo', T)];
}
