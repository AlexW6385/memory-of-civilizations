// Taos Pueblo about 1500 (docs/settlements/taos.md §2–§4): the North House (to five storeys) and the
// South House (to four), the plaza and the creek with its log bridges, six kivas, the racks on the
// plaza's north side, the perimeter wall.

import { NORTH, SOUTH, CELL, KIVAS, WALL, CREEK, RADIUS, ROOMS, YARDS, bankY, creekZ, inCreek, roomsOf, isRoom, nearRoom } from './layout.js';
import { dressItems, woodpiles } from './dress.js';

const E = [];
E.push({ t: 'pueblo_block', x0: NORTH.x0, z0: NORTH.z0, cell: CELL, heights: NORTH.heights, front: NORTH.front, seed: 7, rooms: roomsOf(NORTH) });
E.push({ t: 'pueblo_block', x0: SOUTH.x0, z0: SOUTH.z0, cell: CELL, heights: SOUTH.heights, front: SOUTH.front, seed: 11, rooms: roomsOf(SOUTH) });
E.push({ t: 'water_cells', rect: [-RADIUS + 24, -30, RADIUS - 24, 30], y: CREEK.water, cell: 1, inside: (x, z) => inCreek(x, z, -0.3) });
for (const [x, z, r] of KIVAS) E.push({ t: 'kiva', c: [x, z], r, gate: Math.atan2(-z, -x) });
for (const x0 of [-60, -25, 10]) E.push({ t: 'rack', a: [x0, -44], b: [x0 + 24, -44], h: 3 });
// the grinding under the racks' shade: rows of three mealing bins, the grinder kneeling on the plaza side
for (const x of [-52, -17, 18, 30]) E.push({ t: 'mealing_bin', c: [x, -44], yaw: 0 });
for (const x of [-35, 30]) { const z = creekZ(x); E.push({ t: 'log_bridge', a: [x, z - 4.5], b: [x, z + 4.5] }); }
// the working yards (§4.3): cooking on the plaza, puddling and building with mud by the creek, new vigas stacked,
// woodpiles at the feet of the houses where a face stands free
for (const c of YARDS.cook) E.push({ t: 'cook_yard', c, yaw: 0 });
for (const c of YARDS.mud) E.push({ t: 'mud_yard', c, yaw: 0 });
for (const [x, z, yaw] of YARDS.vigas) E.push({ t: 'viga_stack', at: [x, z], yaw, n: 6, seed: Math.round(x) });
const { wood, piles } = woodpiles();
E.push(...piles);
// Red Willow Creek: stepping stones at two fords and cobbles strewn on both banks
{
  let s = 99; const rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const stones = [], cobbles = [];
  for (const x of [-12, 14]) for (let dz = -1.9; dz <= 1.95; dz += 0.95) stones.push({ x: x + (rand() - 0.5) * 0.25, z: creekZ(x) + dz, y: CREEK.bed - 0.2, top: CREEK.water + 0.2, r: 0.34 });
  for (let x = -66; x < 66; x += 0.8) for (const sd of [-1, 1]) {
    if (rand() < 0.35 || Math.abs(x + 35) < 3.5 || Math.abs(x - 30) < 3.5) continue;
    const dz = 2.25 + rand() * 1.5, z = creekZ(x) + sd * dz;
    cobbles.push({ x: x + rand() * 0.6, z, y: bankY(dz), r: 0.09 + rand() * 0.1 });
  }
  E.push({ t: 'creek_stones', stones, cobbles });
}
const [wx0, wz0, wx1, wz1] = WALL, w = (a, b) => E.push({ t: 'adobe_wall', a, b, h: 2.2 });
const gap = (x) => [creekZ(x) - 5, creekZ(x) + 5];
const [gw0, gw1] = gap(wx0), [ge0, ge1] = gap(wx1);
w([wx0, wz0], [wx1, wz0]); w([wx0, wz1], [-6, wz1]); w([6, wz1], [wx1, wz1]);
w([wx0, wz0], [wx0, gw0]); w([wx0, gw1], [wx0, wz1]); w([wx1, wz0], [wx1, ge0]); w([wx1, ge1], [wx1, wz1]);

E.push({ t: 'pueblo_dress', items: dressItems() });
const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('plaza', [-70, -45, 70, 40], 0, 'open')];
// each furnished room of the plaza faces is a hall of its own (the music and the ambience change at its door)
for (const B of [NORTH, SOUTH]) for (const r of roomsOf(B)) { const x0 = B.x0 + r.j * CELL, z0 = B.z0 + r.i * CELL; rooms.push(room(`room-${B === NORTH ? 'n' : 's'}${r.j}`, [x0 + 0.5, z0 + 0.5, x0 + CELL - 0.5, z0 + CELL - 0.5], 0, 'hall')); }
const walks = [[[0, 200], [0, 141], [0, 30], [-35, 10], [-35, -40]]];
walks[0].y0 = 0;

export const pueblo = {
  id: 'taos-pueblo',
  name: { en: 'Taos Pueblo', zh: '陶斯普韦布洛' },
  era: { en: 'Pueblo, c. 1500', zh: '普韦布洛，约1500年' },
  style: 'pueblo',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [0, 30], facing: 'n' },
  bounds: WALL,
  bakeBounds: [-80, -100, 65, 90],
  view: [NORTH.x0, NORTH.z0, NORTH.x0 + NORTH.heights[0].length * CELL, NORTH.z0 + NORTH.heights.length * CELL],
  bakeTop: 16,
  elements: E,
  rooms,
  walks,
};
export default pueblo;
