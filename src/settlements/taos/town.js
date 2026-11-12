// Taos Pueblo is its own town: the house blocks are part of the landmark's plan (docs/settlements/taos.md
// §5). This adds the life of the plaza and the roofs (§4.2): women grinding at the mealing bins, the
// grinder inside the furnished room, people on the terraces and the plaza, firewood, jars and baskets
// on the roofs, dogs and turkeys about the plaza.
import { NORTH, SOUTH, CELL, RADIUS, ROOMS, YARDS, PENS, ARRIVE, nearYard, creekZ, inCreek, isRoom, roomsOf } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const ST = 2.7;
const face = (from, to) => Math.atan2(-(to[0] - from[0]), -(to[1] - from[1]));     // a figure faces −z when rot = 0
const plan = (id, style, elements) => ({ id, style, origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 30], facing: 'n' } });

export async function town() {
  const rand = rng(1500), P = [], T = [], E0 = [];
  // women in the manta of cotton or deerskin, tied over one shoulder, and moccasins; men in deerskin
  // shirt and leggings, some with a blanket of rabbit fur over the shoulders; the hair long [inferred]
  const skin = () => (rand() < 0.7 ? 'skin_medium' : 'skin_dark');
  const woman = (at, y, rot, o = {}) => P.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', cloth: ['cloth_white', 'hide_tan', 'cloth_brown', 'cloth_black'][Math.floor(rand() * 4)], cloth2: 'cloth_red', over: rand() < 0.3 ? 'shawl' : 'belt', skin: skin(), hat: 'none', feet: 'shod', hair: 'long', beard: false, ...o });
  const man = (at, y, rot, o = {}) => { const cl = rand() < 0.35; P.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'tunic', cloth: rand() < 0.7 ? 'hide_tan' : 'hide_brown', cloth2: cl ? 'hide_white' : 'hide_tan', legs: 'hose', over: cl ? 'cloak' : 'belt', skin: skin(), hat: 'none', feet: 'shod', hair: 'long', beard: false, ...o }); };
  // the grinders at the bins under the racks (the row's centre at x, the bins at x − 0.62, x, x + 0.62)
  for (const x of [-52, -17, 18, 30]) for (const u of [-0.62, 0.62]) if (rand() < 0.75) woman([x + u, -43.15], 0, 0, { pose: 'kneel', over: 'none' });
  // and inside the room, at its first bin
  const ROOM = ROOMS[0], ix0 = NORTH.x0 + ROOM.j * CELL + 0.5, iz0 = NORTH.z0 + ROOM.i * CELL + 0.5, cx = ix0 + 2;
  woman([cx - 0.1 - 0.62, iz0 + 0.025 + 0.48 + 0.78], 0.06, 0, { pose: 'kneel', over: 'none' });
  // and in the other rooms (pueblo_room's furniture, §4.5): the weaver seated at her loom, the potter kneeling at the drying jars, the man
  // at the knapping pad, a woman by the fire in the sleeping rooms and the second homes at their bins
  for (const B of [NORTH, SOUTH]) for (const r of roomsOf(B)) {
    if (r === ROOM) continue;
    const x0 = B.x0 + r.j * CELL + 0.5, z0 = B.z0 + r.i * CELL + 0.5, x1 = x0 + 4, z1 = z0 + 4, mx = x0 + 2, mz = z0 + 2, south = r.door === 's', sg = south ? -1 : 1;
    const Z = (d) => (south ? z0 + 0.025 + d : z1 - 0.025 - d), D = (d) => (south ? z1 - 0.025 - d : z0 + 0.025 + d);
    if (r.kind === 'weave') woman([x1 - 0.025 - 0.85, mz + sg * 0.7], 0.06, face([x1, 0], [x1 + 1, 0]) + Math.PI, { pose: 'sit_ground', over: 'none' });
    else if (r.kind === 'pottery') woman([x0 + 1.15, Z(1.95)], 0.06, south ? 0 : Math.PI, { pose: 'kneel', over: 'none' });
    else if (r.kind === 'work') man([x0 + 1.4, D(1.65)], 0.06, south ? 0 : Math.PI, { pose: 'sit_ground' });
    else if (r.kind === 'sleep') woman([mx - 0.2, mz + 0.95 * (south ? 1 : -1)], 0.06, face([mx - 0.2, 0], [mx + 0.3, 0]) + Math.PI, { pose: 'sit_ground', over: 'none' });
    else if (r.kind === 'home') woman([mx - 0.1 - 0.62, Z(0.48 + 0.78 + 0.03)], 0.06, south ? 0 : Math.PI, { pose: 'kneel', over: 'none' });
  }
  // the cook yards: a woman kneeling at the griddle turning the thin bread, one tending the steaming pit; at the mud yards a man
  // treading and mixing the mud, a woman smoothing the new course of the wall with her hands, a boy carrying a basket of mud
  for (const [x, z] of YARDS.cook) {
    woman([x + 1.3, z + 1.4], 0, 0, { pose: 'kneel', over: 'none' });                   // facing the griddle (north)
    woman([x - 1.5, z + 1.25], 0, 0, { pose: 'kneel', over: 'none' });
  }
  for (const [x, z] of YARDS.mud) {
    man([x - 1.4, z], 0, 1.1, { pose: 'talk' });
    woman([x + 0.9, z + 1.3], 0, 0, { pose: 'kneel', over: 'none' });
    man([x + 3.1, z - 0.6], 0, 2.0, { h: 0.7 });
  }
  // the arrival's view (layout.js ARRIVE): the plaza's life in the cone before the visitor, 6 to 21 m off, none nearer than 6 m;
  // water-bearers, a mother with a child, elders in rabbit-fur blankets, men talking, boys with a dog, pots and baskets set down, a flock of turkeys
  const AF = [-Math.sin(ARRIVE.yaw), -Math.cos(ARRIVE.yaw)], AR = [-AF[1], AF[0]];
  const ap = (d, s) => [ARRIVE.at[0] + AF[0] * d + AR[0] * s, ARRIVE.at[1] + AF[1] * d + AR[1] * s];
  const toward = (p) => face(p, ARRIVE.at);
  const cl = (d, s, f) => { const p = ap(d, s); if (!inCreek(p[0], p[1], 2) && !nearYard(p[0], p[1], 1.5)) f(p); };
  cl(7, -4, (p) => woman(p, 0, toward(p) + 0.5, { carry: 'pot' }));
  cl(9, 3.5, (p) => { man(p, 0, toward(p) + 2.4, { pose: 'talk' }); const b = [p[0] + 1.1, p[1] + 0.3]; man(b, 0, face(b, p)); });
  cl(12, -7, (p) => { woman(p, 0, toward(p) - 0.4); const c = [p[0] + 0.6, p[1] + 0.5]; woman(c, 0, face(c, p), { child: true, h: 1.15 }); });
  cl(14, 7, (p) => man(p, 0, toward(p) + 0.8, { over: 'cloak', cloth2: 'hide_white' }));
  cl(16, -2, (p) => woman(p, 0, toward(p) + 3.0, { carry: 'pot' }));
  cl(19, 9, (p) => { woman(p, 0, toward(p) + 2.6, { pose: 'talk' }); const b = [p[0] - 1.0, p[1] + 0.4]; woman(b, 0, face(b, p)); });
  cl(11, 0.5, (p) => man(p, 0, toward(p) + 1.4, { h: 0.7 }));
  cl(13, -3.5, (p) => E0.push({ t: 'animal', kind: 'dog', at: p, y: 0, rot: 1.8, seed: 41 }));
  cl(20, -9, (p) => woman(p, 0, toward(p) + 1.0, { pose: 'kneel', over: 'none' }));
  cl(8, 6, (p) => E0.push({ t: 'pot', kind: 'water_pot', n: 2, at: p, y: 0, seed: 17 }));
  cl(10, -8, (p) => E0.push({ t: 'basket', n: 2, at: p, y: 0, seed: 23, goods: 'cloth_ochre' }));
  cl(17, 3, (p) => E0.push({ t: 'animal', kind: 'dog', at: p, y: 0, rot: 4.0, seed: 43 }));
  for (let k = 0; k < 5; k++) cl(15 + (k % 2) * 1.6, -6 + k * 0.9, (p) => T.push({ t: 'turkey', at: p, y: 0, rot: 0.8 + k, tom: k === 0 }));
  // the plaza: people talking, carrying water from the creek, children
  for (let k = 0; k < 26; k++) {
    const x = -60 + rand() * 120, z = -38 + rand() * 70;
    if (inCreek(x, z, 2) || nearYard(x, z, 1.5) || Math.hypot(x - ARRIVE.at[0], z - ARRIVE.at[1]) < 6 || P.some((p) => Math.hypot(p.at[0] - x, p.at[1] - z) < 1.5)) continue;
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
      const n = H[i][j]; if (!n || isRoom(B, i, j)) continue;
      const x0 = B.x0 + j * CELL, z0 = B.z0 + i * CELL, y = n * ST, zb = back < 0 ? z0 + 0.75 : z0 + CELL - 0.75, r = rand();
      if (r < 0.12) E.push({ t: 'firewood', at: [x0 + 0.75, zb], y, rot: Math.PI / 2, len: 1.5, seed: i * 31 + j });
      else if (r < 0.2) E.push({ t: 'pot', kind: rand() < 0.5 ? 'water_pot' : 'dark_pot', n: 2 + Math.floor(rand() * 2), at: [x0 + 0.8, zb], y, seed: i * 7 + j });
      else if (r < 0.25) E.push({ t: 'basket', n: 2, at: [x0 + 0.8, zb], y, seed: i * 13 + j, goods: 'cloth_ochre' });
      else if (r < 0.33) (rand() < 0.5 ? woman : man)([x0 + 0.7, zb], y, back < 0 ? Math.PI : 0, rand() < 0.4 ? { pose: 'sit_ground' } : {});
    }
  }
  // dogs about the plaza and the roofs' feet; turkeys kept for their feathers, a flock or two
  for (let k = 0; k < 9; k++) { const x = -70 + rand() * 140, z = -40 + rand() * 75; if (!inCreek(x, z, 1.5) && !nearYard(x, z, 1)) E.push({ t: 'animal', kind: 'dog', at: [x, z], y: 0, rot: rand() * 6.28, seed: k + 3 }); }
  for (const [fx, fz] of [[-40, 18], [45, -20], [8, 25]]) for (let k = 0; k < 5; k++) {
    const x = fx + (rand() - 0.5) * 6, z = fz + (rand() - 0.5) * 5;
    if (!inCreek(x, z, 1.5) && !nearYard(x, z, 1)) T.push({ t: 'turkey', at: [x, z], y: 0, rot: rand() * 6.28, tom: k === 0 });
  }
  // the pens' turkeys
  for (const [px, pz] of PENS) for (let k = 0; k < 5; k++) { const a = rand() * 6.28, r = 0.4 + rand() * 0.9; T.push({ t: 'turkey', at: [px + Math.cos(a) * r - 0.2, pz + Math.sin(a) * r], y: 0, rot: rand() * 6.28, tom: k === 0 }); }
  void creekZ;
  return [plan('taos-people', 'life', [...P, ...E0, ...E]), plan('taos-turkeys', 'pueblo', T)];
}
