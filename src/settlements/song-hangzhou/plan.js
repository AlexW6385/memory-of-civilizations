// The Liuhe Pagoda and the riverside of Lin'an, c. 1200 (docs/settlements/song-hangzhou.md §2–§4):
// the pagoda (seven storeys of galleries and eaves on its octagonal stone base) on its terrace above
// the river road, Kaihua Temple's halls beside it and on the terrace behind; the flood wall, the road
// on the bank, the river with its boats; the canal and its lock, bridges and boats.

import { RADIUS, LEVEL, WALL, ROAD, PAGODA, T1, T2, CANAL, CANAL_STREETS, WAREHOUSES } from './layout.js';

const E = [];
const RW = RADIUS - 30, half = (z) => Math.sqrt(Math.max(0, RW * RW - z * z));
// ---- the flood wall (its top a walk), the road behind it, the lock where the canal meets the river
const hw = half(WALL.z1);
E.push({ t: 'block', walk: true, rect: [-hw, WALL.z0, CANAL.x0 - 4, WALL.z1], y0: LEVEL.bed, y1: 1.0, mat: 'granite_block' });
E.push({ t: 'block', walk: true, rect: [CANAL.x1 + 4, WALL.z0, hw, WALL.z1], y0: LEVEL.bed, y1: 1.0, mat: 'granite_block' });
for (const r of [[CANAL.x0 - 4, WALL.z0, CANAL.x0, WALL.z1], [CANAL.x1, WALL.z0, CANAL.x1 + 4, WALL.z1]]) E.push({ t: 'block', walk: true, rect: r, y0: LEVEL.bed, y1: 2.6, mat: 'granite_block' });
E.push({ t: 'block', rect: [CANAL.x0, WALL.z0 + 3, CANAL.x1, WALL.z0 + 3.5], y0: LEVEL.canalBed, y1: 0.6, mat: 'timber' });
E.push({ t: 'block', walk: true, rect: [CANAL.x0 - 4, WALL.z0 + 5, CANAL.x1 + 4, WALL.z0 + 7], y0: 2.2, y1: 2.6, mat: 'timber' });
E.push({ t: 'paving', rect: [-half(ROAD.z1), ROAD.z0, half(ROAD.z1), ROAD.z1], y: LEVEL.street + 0.04, th: 0.3 });
// ---- the river, boats moored and under way
for (let z0 = WALL.z1; z0 < RW - 4; z0 += 10) { const z1 = Math.min(z0 + 10, RW - 4); E.push({ t: 'water_rect', rect: [-half(z1) + 2, z0, half(z1) - 2, z1], y: LEVEL.river }); }
for (const [x, z, d, L] of [[-240, 160, 1, 12], [-60, 158, -1, 9], [20, 172, 1, 14], [100, 160, 1, 8], [190, 158, -1, 10], [250, 190, -1, 16], [-150, 215, 1, 18], [60, 240, -1, 11]]) E.push({ t: 'boat', at: [x, z], dir: [d, 0], len: L, y: LEVEL.river });
// ---- the canal: water, walls, streets, bridges, boats
E.push({ t: 'water_rect', rect: [CANAL.x0, CANAL.z0 + 4, CANAL.x1, WALL.z0 + 3], y: LEVEL.canal });
for (const x of [CANAL.x0, CANAL.x1]) E.push({ t: 'canal_wall', a: [x, CANAL.z0 + 4], b: [x, ROAD.z0], y: LEVEL.street + 0.05, bed: LEVEL.canalBed, th: 0.7 });
for (const r of CANAL_STREETS) E.push({ t: 'paving', rect: [r[0], -half(r[0]) + 6, r[2], r[3]], y: LEVEL.street + 0.04, th: 0.3 });
for (const z of [-230, -120, -10, 90, 136]) E.push({ t: 'ming_arch_bridge', at: [(CANAL.x0 + CANAL.x1) / 2, z], across: 'x', span: CANAL.x1 - CANAL.x0 + 0.4, width: 4, rise: 2.4, landing: 4.6, y: LEVEL.street + 0.04, water: LEVEL.canal, bed: LEVEL.canalBed });
for (const [z, d] of [[-280, 1], [-170, -1], [-60, 1], [40, -1], [112, 1]]) E.push({ t: 'boat', at: [(CANAL.x0 + CANAL.x1) / 2 + (d > 0 ? -2 : 2), z], dir: [0, d], len: 7, y: LEVEL.canal });

// ---- the pagoda on its terrace, the temple's halls, the stairs from the road
E.push({ t: 'block', walk: true, rect: T1.rect, y0: 0, y1: T1.y, mat: 'granite_block' });
E.push({ t: 'block', walk: true, rect: T2.rect, y0: 0, y1: T2.y, mat: 'granite_block' });
E.push({ t: 'stairs', rect: [PAGODA.c[0] - 6, T1.rect[3], PAGODA.c[0] + 6, ROAD.z0], y0: 0, y1: T1.y, dir: 'n', mat: 'granite_block' });
E.push({ t: 'stairs', rect: [PAGODA.c[0] - 4, T2.rect[3], PAGODA.c[0] + 4, T1.rect[1]], y0: T1.y, y1: T2.y, dir: 'n', mat: 'granite_block' });
const tiers = [{ r: 10.5, h: 9.5 }];
for (let i = 1; i < 7; i++) tiers.push({ r: 10.5 - 0.6 * i, h: 6.7 });
E.push({ t: 'pagoda_oct', c: PAGODA.c, y: PAGODA.y, base: { r: 17, h: 2 }, tiers, spire: 4.4 });
E.push({ t: 'ming_hall', rect: [-129, -4, -91, 24], y: T2.y, H: 6, front: 's', four: true, roof: 'xieshan', plat: 0.8, eave: 1.8, sweep: 0.9 });
E.push({ t: 'ming_hall', rect: [-140.5, 58, -131, 94], y: T1.y, H: 4.4, front: 'e', roof: 'xieshan', plat: 0.5, eave: 1.3, sweep: 0.7 });
E.push({ t: 'ming_hall', rect: [-89, 58, -79.5, 94], y: T1.y, H: 4.4, front: 'w', roof: 'xieshan', plat: 0.5, eave: 1.3, sweep: 0.7 });
// ---- the warehouses by the lock
for (const r of WAREHOUSES) E.push({ t: 'house_jiangnan', rect: r, y: LEVEL.street, front: 's', storeys: 2, shop: false, seed: r[0] });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('terrace', T1.rect, T1.y, 'open'), room('hall', [-129, -4, -91, 24], T2.y, 'hall')];
const walks = [[[-110, 136], [-110, 104], [-110, 52], [-110, 36]]];
walks[0].y0 = 0;

export const pagoda = {
  id: 'song-hangzhou-liuhe',
  name: { en: 'The Liuhe Pagoda', zh: '六和塔' },
  era: { en: 'Southern Song, rebuilt 1165', zh: '南宋，1165年重建' },
  style: 'song',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [-110, 136], facing: 'n' },
  bounds: [-150, -20, -70, 110],
  bakeBounds: [-150, -16, -70, 104],
  view: [-127, 59, -93, 93],
  viewY: T1.y,
  bakeTop: 70,
  elements: E,
  rooms,
  walks,
};
export default pagoda;
