// Taos Pueblo about 1500 (docs/settlements/taos.md §2–§4): the North House (to five storeys) and the
// South House (to four), the plaza and the creek with its log bridges, six kivas, the racks on the
// plaza's north side, the perimeter wall.

import { NORTH, SOUTH, CELL, KIVAS, WALL, CREEK, RADIUS, ROOM, creekZ, inCreek } from './layout.js';

const E = [];
E.push({ t: 'pueblo_block', x0: NORTH.x0, z0: NORTH.z0, cell: CELL, heights: NORTH.heights, front: NORTH.front, seed: 7, rooms: [ROOM] });
E.push({ t: 'pueblo_block', x0: SOUTH.x0, z0: SOUTH.z0, cell: CELL, heights: SOUTH.heights, front: SOUTH.front, seed: 11 });
E.push({ t: 'water_cells', rect: [-RADIUS + 24, -30, RADIUS - 24, 30], y: CREEK.water, cell: 1, inside: (x, z) => inCreek(x, z, -0.3) });
for (const [x, z, r] of KIVAS) E.push({ t: 'kiva', c: [x, z], r, gate: Math.atan2(-z, -x) });
for (const x0 of [-60, -25, 10]) E.push({ t: 'rack', a: [x0, -44], b: [x0 + 24, -44], h: 3 });
// the grinding under the racks' shade: rows of three mealing bins, the grinder kneeling on the plaza side
for (const x of [-52, -17, 18, 30]) E.push({ t: 'mealing_bin', c: [x, -44], yaw: 0 });
for (const x of [-35, 30]) { const z = creekZ(x); E.push({ t: 'log_bridge', a: [x, z - 4.5], b: [x, z + 4.5] }); }
const [wx0, wz0, wx1, wz1] = WALL, w = (a, b) => E.push({ t: 'adobe_wall', a, b, h: 2.2 });
const gap = (x) => [creekZ(x) - 5, creekZ(x) + 5];
const [gw0, gw1] = gap(wx0), [ge0, ge1] = gap(wx1);
w([wx0, wz0], [wx1, wz0]); w([wx0, wz1], [-6, wz1]); w([6, wz1], [wx1, wz1]);
w([wx0, wz0], [wx0, gw0]); w([wx0, gw1], [wx0, wz1]); w([wx1, wz0], [wx1, ge0]); w([wx1, ge1], [wx1, wz1]);

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('plaza', [-70, -45, 70, 40], 0, 'open')];
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
