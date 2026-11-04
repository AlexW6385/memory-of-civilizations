// Bianjing about 1120 (docs/settlements/song-kaifeng.md §2–§4): the Iron Pagoda (13 storeys of brown
// glazed brick, eaves at every storey, 56 m) in the Kaibao monastery with its halls; the Bian River
// with its stone landings, the Rainbow Bridge and grain boats; the east wall, its water gate and its
// gate tower; the streets' paving.

import { RADIUS, RIVER, BRIDGE, MONASTERY, PAGODA, WALL_X, STREETS } from './layout.js';

const E = [];
const RW = RADIUS - 26, half = (z) => Math.sqrt(Math.max(0, RW * RW - z * z));
// ---- the Iron Pagoda: base side 4.16 m (circumradius 5.4), thirteen storeys narrowing to the top
const tiers = [];
for (let i = 0; i < 13; i++) tiers.push({ r: 5.4 - i * 0.19, h: i === 0 ? 5.6 : 3.75 - i * 0.06 });
E.push({ t: 'pagoda_oct', c: PAGODA, y: 0, base: { r: 7.2, h: 1.2 }, tiers, galleries: false, core: 'tile_iron', eave: 'tile_iron', frame: 'tile_iron', spire: 3.6 });
// the monastery: its wall, gate hall, main hall behind the pagoda, side halls
const [mx0, mz0, mx1, mz1] = MONASTERY, w = (a, b, gates = []) => E.push({ t: 'ming_wall', a, b, y: 0, h: 3.6, th: 0.8, gates });
w([mx0, mz0], [mx1, mz0]); w([mx0, mz1], [mx1, mz1], [{ at: PAGODA[0] - mx0, w: 4, h: 3 }]); w([mx0, mz0], [mx0, mz1]); w([mx1, mz0], [mx1, mz1]);
E.push({ t: 'ming_hall', rect: [PAGODA[0] - 9, mz1 - 14, PAGODA[0] + 9, mz1 - 4], y: 0, H: 4.6, front: 's', roof: 'xieshan', plat: 0.8, eave: 1.5, sweep: 0.9 });
E.push({ t: 'qing_hall', rect: [PAGODA[0] - 18, mz0 + 10, PAGODA[0] + 18, mz0 + 32], y: 0, H: 6, double: 4.8, roof: 'xieshan', bays: [7, 4], front: 's', four: true, plat: 1, pal: { roof: 'tile_dark', soffit: 'lacquer_red', wood: 'lacquer_red', column: 'lacquer_red', plaster: 'plaster_white', plinth: 'granite_block', base: 'granite_block' } });
for (const x of [mx0 + 14, mx1 - 14]) E.push({ t: 'ming_hall', rect: [x - 6, -200, x + 6, -170], y: 0, H: 4.2, front: x < PAGODA[0] ? 'e' : 'w', roof: 'xieshan', plat: 0.6, eave: 1.3, sweep: 0.8 });
// ---- the river: water, stone landings near the bridge, the Rainbow Bridge, boats
E.push({ t: 'water_rect', rect: [WALL_X + 2, RIVER.z0, half(RIVER.z1) - 2, RIVER.z1], y: RIVER.water });
for (const z of [RIVER.z0, RIVER.z1]) E.push({ t: 'canal_wall', a: [-90, z], b: [90, z], y: 0.05, bed: RIVER.bed, th: 0.8 });
E.push({ t: 'rainbow_bridge', at: BRIDGE.at, across: 'z', span: BRIDGE.span, width: BRIDGE.width, rise: BRIDGE.rise });
for (const [x, z, d, L] of [[-200, 70, 1, 18], [-120, 82, -1, 16], [-60, 68, 1, 20], [60, 80, -1, 18], [130, 70, 1, 14], [220, 84, -1, 18], [300, 72, 1, 12]]) E.push({ t: 'boat', at: [x, z], dir: [d, 0], len: L, y: RIVER.water });
// ---- the east wall of the city with its water gate and the gate tower over the road
const wz = (z0, z1) => E.push({ t: 'block', walk: true, rect: [WALL_X - 8, z0, WALL_X + 8, z1], y0: RIVER.bed, y1: 9, mat: 'brick_grey' });
wz(-half(WALL_X) + 4, -110); wz(-94, RIVER.z0 - 2); wz(RIVER.z1 + 2, half(WALL_X) - 4);
E.push({ t: 'block', walk: true, rect: [WALL_X - 8, RIVER.z0 - 2, WALL_X + 8, RIVER.z1 + 2], y0: 4.5, y1: 9, mat: 'brick_grey' });
E.push({ t: 'block', walk: true, rect: [WALL_X - 8, -110, WALL_X + 8, -94], y0: 5, y1: 9, mat: 'brick_grey' });
E.push({ t: 'qing_hall', rect: [WALL_X - 7, -116, WALL_X + 7, -88], y: 9, H: 5, double: 4, roof: 'xieshan', bays: [5, 3], front: 'e', four: true, plat: 0.3, pal: { roof: 'tile_dark', soffit: 'lacquer_red', wood: 'lacquer_red', column: 'lacquer_red', plaster: 'plaster_white', plinth: 'brick_grey', base: 'brick_grey' } });
// ---- the streets' paving
for (const s of STREETS) { const c = [Math.max(s[0], WALL_X + 8), s[1], s[2], s[3]]; const horiz = c[2] - c[0] > c[3] - c[1]; const h = horiz ? half(Math.max(Math.abs(c[1]), Math.abs(c[3]))) : half(Math.max(Math.abs(c[0]), Math.abs(c[2]))); const r = horiz ? [Math.max(c[0], -h), c[1], Math.min(c[2], h), c[3]] : [c[0], Math.max(c[1], -h), c[2], Math.min(c[3], h)]; if (r[2] > r[0] && r[3] > r[1]) E.push({ t: 'paving', rect: r, y: 0.04, th: 0.3 }); }

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('monastery', MONASTERY, 0, 'open')];
const walks = [[[0, 200], [0, 100], [0, 76], [0, 50], [0, -80], [160, -80], [160, -150]]];
walks[0].y0 = 0;

export const pagoda = {
  id: 'song-kaifeng-iron-pagoda',
  name: { en: 'The Iron Pagoda and the Rainbow Bridge', zh: '铁塔与虹桥' },
  era: { en: 'Northern Song, c. 1120', zh: '北宋，约1120年' },
  style: 'song',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [160, -130], facing: 'n' },
  bounds: [WALL_X - 8, -260, 300, 110],
  bakeBounds: [WALL_X - 8, -260, 245, 100],
  view: [150, -200, 170, -180],
  bakeTop: 62,
  elements: E,
  rooms,
  walks,
};
export default pagoda;
