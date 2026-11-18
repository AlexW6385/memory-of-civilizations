// Ming–Qing Beijing — the walks of the open compounds (docs/settlements/qing-beijing.md §38), for tools/walk-check.mjs: from the lane through
// the gate and round the screen wall into the yard, into the main hall, into each ear room, into each room of the south row.
// World coordinates (the plan has origin 0, yaw 0); the checker must bring the walker to every waypoint.

import { houses, deepHouses } from './layout.js';
import { houseParts, GATE } from './houses.js';

export function compoundWalks() {
  const routes = [];
  for (const h of houses().filter((q) => deepHouses().has(q.seed))) {
    const el = { rect: h.rect, seed: h.seed, gate: h.gate, courts: h.courts, wealth: h.wealth, lod: h.lod, enter: true, deep: true };
    const P = houseParts(el), SP = P.south, [x0, z0, x1, z1] = h.rect, cx = (x0 + x1) / 2, G = GATE[h.gate];
    const mx = (P.main[0] + P.main[2]) / 2, xl = h.courts === 2 ? cx : cx + 1.2;
    const gate = [[SP.gxC, z1 + 1.5], [SP.gxC, z1 - 2.6], [SP.gxC, SP.zN - 0.9], [xl, SP.zN - 0.9], [xl, z0 + 7.8]];
    void G;
    // the main hall (through its open door, the middle bay) and out again
    const hall = [[mx, z0 + 8.4], [mx, z0 + 4.9],  [mx, z0 + 4.9], [mx, z0 + 8.4]];
    const ear = (e) => [[e.doorX, z0 + 7.8], [e.doorX, e.zb + 1.2], [e.doorX, e.zb - 1.0], [e.doorX, e.zb - 1.9], [e.doorX, e.zb + 1.2], [e.doorX, z0 + 7.8]];
    routes.push([...gate, ...hall]);
    routes.push([...gate, ...ear(P.ears[0])]);
    routes.push([...gate, ...ear(P.ears[1])]);
    const rooms = [];
    for (const rm of SP.rooms) rooms.push([rm.doorX, SP.zN - 1.0], [rm.doorX, SP.zN + 0.5], [rm.doorX, SP.zN + 1.9], [rm.doorX, SP.zN - 1.0]);
    routes.push([[SP.gxC, z1 + 1.5], [SP.gxC, z1 - 2.6], [SP.gxC, SP.zN - 0.9], ...rooms]);
  }
  for (const r of routes) r.y0 = 0;
  return routes;
}
