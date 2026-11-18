// Ming–Qing Beijing — the walks of the open compounds (docs/settlements/qing-beijing.md §38), for tools/walk-check.mjs: from the lane through
// the gate and round the screen wall into the yard, into the main hall, into each ear room, into each room of the south row.
// World coordinates (the plan has origin 0, yaw 0); the checker must bring the walker to every waypoint.

import { houses, deepHouses, interiorShops } from './layout.js';
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
  // the tea house's stair: from the street through the door bay, along the side wall to the stair's foot, up it to the deck, across to the balcony door
  for (const t of interiorShops().filter((q) => q.kind === 'teahouse')) {
    const L = t.z1 - t.z0, cz = (t.z0 + t.z1) / 2, bays = Math.max(2, Math.round(L / 3.2)), bw = (L - 1.0) / bays, db = Math.floor(bays / 2);
    const sd = -L / 2 + 0.5 + bw * (db + 0.5), aS = L / 2 - 0.5 - 0.575, f = t.front, z = (a) => cz - a;
    routes.push([[f + 3.0, z(sd)], [f - 1.4, z(sd)], [f - 1.4, z(aS)], [f - 0.9, z(aS)], [f - 2.5, z(aS)], [f - 4.2, z(aS)], [f - 5.3, z(aS)], [f - 5.6, z(aS - 1.0)], [f - 3.5, z(sd)], [f - 1.0, z(sd)], [f + 0.5, z(sd)]]);
  }
  for (const r of routes) r.y0 = 0;
  return routes;
}
