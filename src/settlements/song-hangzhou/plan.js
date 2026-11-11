// The Liuhe Pagoda and the riverside of Lin'an, c. 1200 (docs/settlements/song-hangzhou.md §2–§4):
// the pagoda (seven storeys of galleries and eaves on its octagonal stone base) on its terrace above
// the river road, Kaihua Temple's halls beside it and on the terrace behind; the flood wall, the road
// on the bank, the river with its boats; the canal and its lock, bridges and boats.

import { RADIUS, LEVEL, WALL, ROAD, PAGODA, T1, T2, CANAL, CANAL_STREETS, CANAL_BRIDGES, WAREHOUSES } from './layout.js';
import { interiorRooms } from './life.js';

/** The river boats [x, z, heading (±1 along x), length − 4] (moored by the wall when z < 165, under sail beyond), and the canal boats [z, heading]. */
export const RIVER_BOATS = [[-240, 160, 1, 12], [-60, 158, -1, 9], [20, 172, 1, 14], [100, 160, 1, 8], [190, 158, -1, 10], [250, 190, -1, 16], [-150, 215, 1, 18], [60, 240, -1, 11]];
export const CANAL_BOATS = [[-280, 1], [-170, -1], [-60, 1], [40, -1], [112, 1]];
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
// ---- the river: the river boats moored by the wall with their masts up and sails down, others under sail
// (the river's water is the planet's sea: ground.js, sea)
for (const [x, z, d, L] of RIVER_BOATS) E.push({ t: 'song_boat', at: [x, z], dir: [d, 0], len: L + 4, beam: (L + 4) * 0.27, mast: 0, sail: z > 165, y: LEVEL.river, seed: x });
// ---- the canal: water, walls, streets, bridges, boats
E.push({ t: 'water_rect', rect: [CANAL.x0, CANAL.z0, CANAL.x1, WALL.z0 + 3], y: LEVEL.canal });
for (const x of [CANAL.x0, CANAL.x1]) E.push({ t: 'canal_wall', a: [x, CANAL.z0], b: [x, ROAD.z0], y: LEVEL.street + 0.05, bed: LEVEL.canalBed, th: 0.7 });
for (const r of CANAL_STREETS) E.push({ t: 'paving', rect: [r[0], Math.max(r[1], -half(r[0]) + 6), r[2], r[3]], y: LEVEL.street + 0.04, th: 0.3 });
for (const z of CANAL_BRIDGES) E.push({ t: 'ming_arch_bridge', at: [(CANAL.x0 + CANAL.x1) / 2, z], across: 'x', span: CANAL.x1 - CANAL.x0 + 0.4, width: 4, rise: 2.4, landing: 4.6, y: LEVEL.street + 0.04, water: LEVEL.canal, bed: LEVEL.canalBed });
for (const [z, d] of CANAL_BOATS) E.push({ t: 'boat', at: [(CANAL.x0 + CANAL.x1) / 2 + (d > 0 ? -2 : 2), z], dir: [0, d], len: 7, y: LEVEL.canal });

// ---- the pagoda on its terrace, the temple's halls, the stairs from the road
E.push({ t: 'block', walk: true, rect: T1.rect, y0: 0, y1: T1.y, mat: 'granite_block' });
E.push({ t: 'block', walk: true, rect: T2.rect, y0: 0, y1: T2.y, mat: 'granite_block' });
E.push({ t: 'stairs', rect: [PAGODA.c[0] - 6, T1.rect[3], PAGODA.c[0] + 6, ROAD.z0], y0: 0, y1: T1.y, dir: 'n', mat: 'granite_block' });
E.push({ t: 'stairs', rect: [PAGODA.c[0] - 4, T2.rect[3], PAGODA.c[0] + 4, T1.rect[1]], y0: T1.y, y1: T2.y, dir: 'n', mat: 'granite_block' });
const tiers = [{ r: 10.5, h: 9.5 }];
for (let i = 1; i < 7; i++) tiers.push({ r: 10.5 - 0.6 * i, h: 6.7 });
E.push({ t: 'liuhe_pagoda', c: PAGODA.c, y: PAGODA.y, base: { r: 17, h: 2 }, tiers, bells: 'iron', interior: true, images: true });
// the steps up the base on the south, to the way onto the lowest gallery and the doors into the pagoda
E.push({ t: 'stairs', rect: [PAGODA.c[0] - 3, PAGODA.c[1] + 15.3, PAGODA.c[0] + 3, PAGODA.c[1] + 19.3], y0: T1.y, y1: PAGODA.y + 2, dir: 'n', mat: 'granite_block' });
E.push({ t: 'ming_hall', rect: [-129, -4, -91, 24], y: T2.y, H: 6, front: 's', four: true, roof: 'xieshan', plat: 0.8, eave: 1.8, sweep: 0.9 });
E.push({ t: 'kaihua_hall', rect: [-129, -4, -91, 24], y: T2.y });
E.push({ t: 'ming_hall', rect: [-140.5, 58, -131, 94], y: T1.y, H: 4.4, front: 'e', roof: 'xieshan', plat: 0.5, eave: 1.3, sweep: 0.7 });
E.push({ t: 'ming_hall', rect: [-89, 58, -79.5, 94], y: T1.y, H: 4.4, front: 'w', roof: 'xieshan', plat: 0.5, eave: 1.3, sweep: 0.7 });
// ---- Kaihua Temple's enclosure round the pagoda's court: a white wall on a grey-brick dado with a tiled coping, a gate in the
// south (at the head of the stair from the road) and one in the north (at the foot of the stair to the upper terrace)
{
  const [wx0, wz0, wx1, wz1] = T1.rect, yT = T1.y, gc = PAGODA.c[0], gw = 3.2;
  const wall = (a, b) => E.push({ t: 'ming_wall', a, b, y: yT, h: 3.4, th: 0.42 });
  wall([wx0 + 0.3, wz1 - 1.0], [gc - gw - 1.0, wz1 - 1.0]); wall([gc + gw + 1.0, wz1 - 1.0], [wx1 - 0.3, wz1 - 1.0]);
  wall([wx0 + 0.3, wz0 + 0.6], [gc - gw - 1.0, wz0 + 0.6]); wall([gc + gw + 1.0, wz0 + 0.6], [wx1 - 0.3, wz0 + 0.6]);
  wall([wx0 + 0.3, wz0 + 0.6], [wx0 + 0.3, wz1 - 1.0]); wall([wx1 - 0.3, wz0 + 0.6], [wx1 - 0.3, wz1 - 1.0]);
  E.push({ t: 'temple_gate', c: [gc, wz1 - 1.0], y: yT, w: gw * 2, dir: 's' });
  E.push({ t: 'temple_gate', c: [gc, wz0 + 0.6], y: yT, w: gw * 2, dir: 'n' });
  // in the court: the great censer before the stair to the pagoda, the sutra pillars either side of the way
  E.push({ t: 'court_censer', at: [gc, wz1 - 5.4], y: yT });
  for (const dx of [-8.5, 8.5]) E.push({ t: 'sutra_pillar', at: [gc + dx, wz1 - 6.4], y: yT });
}
// the side halls: the luohan along their back walls; the main hall's coffered ceiling and hangings
E.push({ t: 'luohan_hall', rect: [-140.5, 58, -131, 94], y: T1.y, side: 'w', n: 16 });
E.push({ t: 'luohan_hall', rect: [-89, 58, -79.5, 94], y: T1.y, side: 'e', n: 16 });
E.push({ t: 'hall_ceiling', rect: [-129, -4, -91, 24], y: T2.y, H: 6 });
E.push({ t: 'hall_offerings', rect: [-129, -4, -91, 24], y: T2.y, H: 6 });
// the courts' flagstones, worn along their middle, and the moss at the feet of walls and halls
E.push({ t: 'court_paving', y: T1.y, seed: 3, rects: [[PAGODA.c[0] - 3, 95.4, PAGODA.c[0] + 3, T1.rect[3] - 1.3], [PAGODA.c[0] - 3, T1.rect[1] + 1.2, PAGODA.c[0] + 3, 58.0], [-130.2, 74.4, -127.7, 77.6], [-92.3, 74.4, -89.9, 77.6]],
  moss: [[T1.rect[0] + 0.8, T1.rect[1] + 1.2, T1.rect[2] - 0.8, T1.rect[1] + 2.4], [T1.rect[0] + 0.8, T1.rect[3] - 3, T1.rect[2] - 0.8, T1.rect[3] - 1.9], [-141.2, 58, -140.7, 94], [-79.2, 58, -78.8, 94]] });
E.push({ t: 'court_paving', y: T2.y, seed: 8, rects: [[PAGODA.c[0] - 3, 26, PAGODA.c[0] + 3, T2.rect[3] - 0.6]], moss: [[T2.rect[0] + 0.8, 26, T2.rect[2] - 0.8, 27.5], [T2.rect[0] + 0.8, T2.rect[1] + 0.6, T2.rect[2] - 0.8, T2.rect[1] + 2]] });
for (const dx of [-8.5, 8.5]) E.push({ t: 'sutra_pillar', at: [PAGODA.c[0] + dx, 30.5], y: T2.y });
// ---- the warehouses by the lock
for (const r of WAREHOUSES) E.push({ t: 'house_jiangnan', rect: r, y: LEVEL.street, front: 's', storeys: 2, shop: false, seed: r[0] });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('terrace', T1.rect, T1.y, 'open'), room('hall', [-129, -4, -91, 24], T2.y, 'hall'), ...interiorRooms()];   // the music zones of the furnished houses (life.js)
// each storey inside the pagoda, in the corridor's north-west corner (the stair arrives in the south-west one)
{
  const [px, pz] = PAGODA.c, aw = (tiers[6].r * Math.cos(Math.PI / 8)) * 0.78, sw = aw * Math.tan(Math.PI / 8);
  let y = PAGODA.y + 2;
  tiers.forEach((t, i) => { rooms.push(room(`storey-${i + 1}`, [px - aw + 0.6, pz - aw + 0.6, px - sw - 0.3, pz - sw - 0.3], y, 'hall')); y += t.h; });
}
// the road to the upper terrace, round the pagoda's base by its east side (the great censer stands on the axis before the stair up the base, the pagoda on it);
// and up the base's stair, round the gallery to the south-west doorway and into the first storey's corridor
const walks = [
  [[-110, 136], [-110, 104], [-106, 99], [-92, 97], [-91.5, 76], [-91.5, 62], [-110, 55], [-110, 36]],
  [[-110, 136], [-110, 104], [-106, 99], [-108, 95.5], [-108, 90], [-113, 88], [-117, 84], [-114, 80]],
];
walks.forEach((w) => { w.y0 = 0; });

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
