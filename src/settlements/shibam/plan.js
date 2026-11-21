// Shibam's two landmarks (docs/settlements/shibam.md §2, §4): the tower house that can be entered — street door, stair, store and stable, the
// women's floors, the majlis, the upper rooms, the roof terrace — and the Friday mosque, a court and a hall of piers with its minaret.

import { LM, LMD, shops, HALL, ups } from './layout.js';
import { fl, topOf, T, houseDims } from '../../styles/hadhrami/dims.js';
import { shopRoutes } from './walkroutes.js';
import { kindOf, frameOf, upOf, upRoutes, routesIn } from '../../styles/hadhrami/up.js';

const [X0, Z0, X1, Z1] = LM.rect, top = topOf(LM.storeys), dz = LMD.doorZ;
const E = [{ t: 'tower_open', rect: LM.rect, storeys: LM.storeys, seed: 7 }];
// the rubble plinth round the free faces (north, and west either side of the door), no collision
E.push({ t: 'block', rect: [X0 - 0.08, Z0 - 0.08, X1, Z0], y0: -0.6, y1: 1.1, mat: 'schist_rubble', collide: false });
E.push({ t: 'block', rect: [X0 - 0.08, Z0, X0, dz - 0.75], y0: -0.6, y1: 1.1, mat: 'schist_rubble', collide: false });
E.push({ t: 'block', rect: [X0 - 0.08, dz + 0.75, X0, Z1], y0: -0.6, y1: 1.1, mat: 'schist_rubble', collide: false });
// a cresset before the door (nightlight.js): in this plan so that its iron, flame and glow merge with the house's own meshes
E.push({ t: 'shb_cresset', at: [X0 - 1.6, dz - 2.0], y: 0 });
// the worn flagstone before the street door (wear.js, §20): a slab of rubble with its middle trodden dark
E.push({ t: 'block', rect: [X0 - 0.95, dz - 0.8, X0 - 0.1, dz + 0.8], y0: -0.1, y1: 0.05, mat: 'schist_rubble', collide: false }, { t: 'block', rect: [X0 - 0.8, dz - 0.4, X0 - 0.25, dz + 0.4], y0: 0.05, y1: 0.054, mat: 'plaster_damp', collide: false });
const room = (id, rect, y, kind, extra = {}) => ({ id, rect, y, kind, ...extra });
const NAMES = ['the store and stable', 'the women\'s floor', 'the family room', 'the bedroom', 'the majlis', 'the upper room', 'the room under the roof'];
const rooms = NAMES.map((n, s) => room(n, LMD.room, fl(s), 'hall'));
for (const l of shops()) rooms.push(room(`the ${l.shop.trade} room`, l.shop.rect, 0.06, l.shop.trade === 'qahwa' ? 'hall' : 'shop'));
rooms.push(room("the sultan's hall", HALL.rect, 0.06, 'hall'));
rooms.push(room('the stair lobby', LMD.lobby, fl(0), 'hall'), room('the roof terrace', [X0 + 1.5, Z0 + 1.5, X1 - 1.5, Z1 - 1.5], top, 'open'));
const walks = [[[X0 - 2.5, dz], [X0 - 0.3, dz], [LMD.I[0] + 1.2, dz], [LMD.xp + 0.15, dz], [LMD.room[0] + 2, dz]]];
walks[0].y0 = 0;
for (const r of routesIn(LM.rect, (u, v) => [u, v], LM.storeys)) { r.y0 = 0; walks.push(r); }
// the towers of the rows nearest the arrival that can be climbed too (docs/settlements/shibam.md §15): each a tower_up, its rooms, and two walks from its door
// (up the stair to the majlis, and to the roof's terrace)
const NAMES6 = ['the store and stable', 'the women\'s floor', 'the family room', 'the bedroom', 'the majlis', 'the upper room', 'the room under the roof'];
const bnd = [X0 - 6, Z0 - 6, X1 + 3, Z1 + 3];
let upTop = top;
for (const l of ups()) {
  E.push({ t: 'tower_up', rect: l.rect, front: l.front, storeys: l.storeys, seed: l.seed, free: l.free });
  const F = frameOf(l.front, l.rect), D = houseDims(upOf(l).rect), wr = (r) => { const a = F.P(r[0], r[1]), b = F.P(r[2], r[3]); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  for (let s = 0; s < l.storeys; s++) rooms.push(room(NAMES6[kindOf(s, l.storeys, l.seed)], wr(D.room), fl(s), 'hall'));
  rooms.push(room('the stair', wr(D.lobby), fl(0), 'hall'), room('the roof terrace', wr([D.room[0] + 1.3, D.room[1] + 1.5, D.room[2] - 1.1, D.room[3] - 1.2]), topOf(l.storeys), 'open'));
  for (const r of upRoutes(l)) { r.y0 = 0; walks.push(r); }
  bnd[0] = Math.min(bnd[0], l.rect[0] - 4); bnd[1] = Math.min(bnd[1], l.rect[1] - 4); bnd[2] = Math.max(bnd[2], l.rect[2] + 4); bnd[3] = Math.max(bnd[3], l.rect[3] + 4);
  upTop = Math.max(upTop, topOf(l.storeys));
}

for (const r of shopRoutes()) { r.y0 = 0; walks.push(r); }

export const house = {
  id: 'shibam-tower-house',
  name: { en: 'A merchant\'s tower house', zh: '商人的塔楼住宅' },
  era: { en: 'Shibam, c. 1700', zh: '希巴姆，约1700年' },
  style: 'hadhrami',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [X0 - 2.2, dz], facing: 'e' },
  bounds: bnd,
  view: [X0 - 2, Z0 - 2, X1 + 2, Z1 + 2],
  bakeBounds: [X0 - 2, Z0 - 2, X1 + 2, Z1 + 2],
  bakeTop: upTop + 3,
  elements: E,
  rooms,
  walks,
};

// ── the Friday mosque ──
import { MOSQUE } from './layout.js';
const [mx0, mz0, mx1, mz1] = MOSQUE, th = 0.9, wx0 = mx0 + th / 2, wx1 = mx1 - th / 2, wz0 = mz0 + th / 2, wz1 = mz1 - th / 2, doorZ = -12, WH = 7.5;
const M = [];
M.push({ t: 'floor', rect: [wx0, wz0, wx1, wz1], y: 0.06, th: 0.4, mat: 'earth_wall' });
const slits = (len, n) => Array.from({ length: n }, (_, i) => ({ at: len * (i + 0.5) / n, w: 0.55, h: 1.0, y0: 3.4 }));
M.push({ t: 'wall', a: [wx0 - th / 2, wz0], b: [wx1 + th / 2, wz0], th, y0: -0.6, y1: WH, mat: 'lime_plaster', openings: slits(wx1 - wx0 + th, 6) });
M.push({ t: 'wall', a: [wx0 - th / 2, wz1], b: [wx1 + th / 2, wz1], th, y0: -0.6, y1: WH, mat: 'lime_plaster', openings: slits(wx1 - wx0 + th, 6) });
M.push({ t: 'wall', a: [wx0, wz0], b: [wx0, wz1], th, y0: -0.6, y1: WH, mat: 'lime_plaster', openings: [{ at: 6.5, w: 0.55, h: 1.0, y0: 3.4 }, { at: 20.5, w: 0.55, h: 1.0, y0: 3.4 }] });
M.push({ t: 'wall', a: [wx1, wz0], b: [wx1, wz1], th, y0: -0.6, y1: WH, mat: 'lime_plaster', openings: [{ at: doorZ - wz0, w: 1.8, h: 2.8, y0: 0 }] });
M.push({ t: 'beam', a: [wx1 + 0.3, doorZ - 1.1], b: [wx1 + 0.3, doorZ + 1.1], w: 0.3, y: 2.8, h: 0.25, mat: 'timber', ext: 0 });
M.push({ t: 'mosque_hall', rect: [wx0 + th / 2, wz0 + th / 2, mx0 + 11, wz1 - th / 2], y: 0.06, roofY: 5.6 });
M.push({ t: 'mosque_crown', rect: [mx0, mz0, mx1, mz1], y: WH, door: [mx1, doorZ] });
M.push({ t: 'shb_cresset', at: [-31.4, -14.6], y: 0 }, { t: 'shb_minaretlamp', c: [mx1 - 2.4, mz0 + 2.2], y: 28.2 });
M.push({ t: 'block', rect: [wx1 - 0.3, doorZ - 0.8, wx1 + 0.9, doorZ + 0.8], y0: -0.1, y1: 0.09, mat: 'schist_rubble', collide: false }, { t: 'block', rect: [wx1 - 0.2, doorZ - 0.45, wx1 + 0.7, doorZ + 0.45], y0: 0.09, y1: 0.094, mat: 'plaster_damp', collide: false });
M.push({ t: 'minaret', c: [mx1 - 2.4, mz0 + 2.2], w: 3.8, h: 31 });
// the court: benches of mud and lime along its long walls, the water jars of the sabil by the door, a shade of mats over a corner, stone seats round the basin
for (const zz of [wz0 + 0.45, wz1 - 0.95]) { M.push({ t: 'block', rect: [-46.5, zz, -34.6, zz + 0.5], y0: 0.0, y1: 0.42, mat: 'mud_plaster', collide: false }); M.push({ t: 'block', rect: [-46.55, zz - 0.02, -34.55, zz + 0.52], y0: 0.42, y1: 0.46, mat: 'lime_plaster', collide: false }); }
M.push({ t: 'block', rect: [-35.6, -19.5, -34.6, -17.5], y0: 0, y1: 0.9, mat: 'mud_plaster' }); M.push({ t: 'block', rect: [-35.7, -19.6, -34.5, -17.4], y0: 0.9, y1: 0.98, mat: 'lime_plaster', collide: false });
for (const [x, z] of [[-35.1, -19.0], [-35.1, -18.0]]) M.push({ t: 'pot', kind: 'water_pot', at: [x, z], y: 0.98, n: 1, seed: Math.floor(-z) });
M.push({ t: 'mat_shade', rect: [-46, wz0 + 1.4, -41.5, wz0 + 6.4], y: 0.06, seed: 12 });
M.push({ t: 'block', rect: [-43.2, -14.4, -42.8, -10.6], y0: 0, y1: 0.4, mat: 'lime_plaster', collide: false }); M.push({ t: 'block', rect: [-38.8, -14.4, -38.4, -10.6], y0: 0, y1: 0.4, mat: 'lime_plaster', collide: false });
// the ablution basin in the court
M.push({ t: 'block', rect: [-42, -14, -39.5, -11], y0: 0, y1: 0.55, mat: 'limestone' });
M.push({ t: 'water', rect: [-41.8, -13.8, -39.7, -11.2], y: 0.5 });
export const mosque = {
  id: 'shibam-friday-mosque',
  name: { en: 'The Friday mosque', zh: '主麻清真寺' },
  era: { en: 'Shibam, c. 1700', zh: '希巴姆，约1700年' },
  style: 'hadhrami',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [wx1 + 1.6, doorZ], facing: 'w' },
  bounds: [mx0 - 3, mz0 - 3, mx1 + 3, mz1 + 3],
  view: [mx0, mz0, mx1, mz1],
  bakeTop: 35,
  elements: M,
  rooms: [room('the court', [-46, mz0 + 2, wx1 - 1, mz1 - 2], 0.06, 'open'), room('the prayer hall', [mx0 + 2, mz0 + 2, mx0 + 10.5, mz1 - 2], 0.06, 'hall')],
  walks: [[[wx1 + 1.6, doorZ], [wx1 - 1, doorZ], [-45, doorZ], [-52, doorZ]]],
};
void T;
export default house;
