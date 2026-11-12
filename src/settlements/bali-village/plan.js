// The village pura (docs/settlements/bali-village.md §3): the split gate at the end of the street, the middle court (jaba tengah) with the bale agung, the bale gong
// and the kulkul tower, the roofed gate (kori agung) up a stair to the inner court (jeroan) with the three merus, the padmasana, the gedong, the pawedan and
// piasan pavilions. Authored in world coordinates (origin 0, yaw 0); the temple faces south, the holiest court at kaja (north).
import { PURA } from './layout.js';

const { x0, x1, zS, zM, zN, y1, y2, gap } = PURA;
const E = [];
const wall = (a, b, y, h, gaps) => E.push({ t: 'bali_wall', a, b, y, h, th: 0.6, mat: 'brick', gaps });
// the court floors (earth in the middle court, flagstone in the inner one) filling the raised courts, and the walls round them
E.push({ t: 'floor', rect: [x0 + 0.3, zM + 0.25, x1 - 0.3, zS - 1.8], y: y1, th: y1 + 0.3, mat: 'ground', room: 'jaba-tengah' });
E.push({ t: 'floor', rect: [x0 + 0.3, zN + 0.3, x1 - 0.3, zM - 0.25], y: y2, th: y2 + 0.3, mat: 'sandstone_floor', room: 'jeroan' });
// the south wall with the split gate between its ends; the side and north walls
const cb = gap / 2 + 4.4;
wall([x0, zS], [-cb, zS], 0, 3.2); wall([cb, zS], [x1, zS], 0, 3.2);
wall([x0, zS], [x0, zN], 0, 3.2); wall([x1, zS], [x1, zN], 0, 3.2);
wall([x0, zN], [x1, zN], 0, y2 + 2.4);
// the wall between the courts, the kori agung in it
{ const w = PURA.kori + 2 * 2.6; wall([x0, zM], [x1, zM], y1 - 0.3, y2 - y1 + 2.4, [{ at: 0 - x0, w }]); }
E.push({ t: 'bali_candi_bentar', c: [0, zS], gap, y: 0, depth: 3.6, rise: y1 });
E.push({ t: 'bali_kori', c: [0, zM], w: PURA.kori, y: y1, h: 3.9, up: y2 - y1 });
// the middle court: the bale agung (the big pavilion of the village assembly) west, the gong pavilion east with the gamelan, the kulkul at the front corner, the kitchen
E.push({ t: 'bali_bale', rect: [-31, -103, -15, -92], y: y1, floor: 0.6, h: 3.0, bays: [4, 2], tier2: true, roof: 'palm', furnish: 'mats', stairs: 's', gold: true, seed: 5 });
E.push({ t: 'bali_wantilan', rect: [13, -104, 29, -93], y: y1, seed: 6 });
E.push({ t: 'bali_kulkul', c: [24, -80.5], y: y1 });
E.push({ t: 'bali_paon', rect: [-31, -84, -23, -79], y: y1, stairs: 'e', seed: 8 });
E.push({ t: 'bali_bale', rect: [-31, -90, -24, -86], y: y1, floor: 0.45, h: 2.3, bays: [2, 1], furnish: 'tray', stairs: 'e', roof: 'thatch', seed: 9 });
// the inner court: three merus along the kaja wall, the padmasana at the north-east corner, the gedong and the rong tiga, the pawedan and the piasan
E.push({ t: 'bali_meru', c: [0, -143], y: y2, tiers: 7, a: 2.4, seed: 1 });
E.push({ t: 'bali_meru', c: [-13, -142.5], y: y2, tiers: 5, a: 2.1, seed: 2 });
E.push({ t: 'bali_meru', c: [13, -142.5], y: y2, tiers: 3, a: 1.9, seed: 3 });
E.push({ t: 'bali_padmasana', c: [26, -146], y: y2, s: 1 });
E.push({ t: 'bali_shrine', c: [-26, -146], y: y2, kind: 'gedong', face: 's' });
E.push({ t: 'bali_shrine', c: [-25, -134], y: y2, kind: 'rongtiga', face: 's' });
E.push({ t: 'bali_shrine', c: [25, -135], y: y2, kind: 'taksu', face: 's' });
E.push({ t: 'bali_bale', rect: [-31, -125, -20, -118], y: y2, floor: 0.7, h: 2.6, bays: [3, 1], roof: 'palm', furnish: 'tray', stairs: 'e', gold: true, seed: 11 });
E.push({ t: 'bali_bale', rect: [20, -125, 31, -118], y: y2, floor: 0.7, h: 2.6, bays: [3, 1], roof: 'palm', furnish: 'mats', stairs: 'w', gold: true, seed: 12 });
{ const o = []; for (const x of [-4, -2, 2, 4]) o.push([x, y2 + 0.01, -112]); for (const x of [-6, -3, 3, 6]) o.push([x, y1 + 0.01, -76]); E.push({ t: 'bali_offerings', list: o }); }

// the carved and festival detail: guardian figures at the split gate, niches of carved stone along the forecourt wall, the row of small shrines of the middle court's east side,
// the ceremonial umbrellas by the merus and the padmasana, the towers of offerings on the bales, the long banners of the odalan down the forecourt
for (const s of [-1, 1]) E.push({ t: 'bali_guard', at: [s * (gap / 2 + 4.4 + 0.75), zS + 2.6], y: 0, h: 1.4 });
E.push({ t: 'bali_niches', a: [x0 + 1.5, zS], b: [-cb - 0.8, zS], y: 0, side: 1, n: 5 });
E.push({ t: 'bali_niches', a: [cb + 0.8, zS], b: [x1 - 1.5, zS], y: 0, side: 1, n: 5 });
for (const z of [-90, -86, -78, -74.8]) E.push({ t: 'bali_shrine', c: [x1 - 2.2, z], y: y1, kind: 'small', face: 'w' });
for (const [x, m] of [[-6.4, 'cloth_white'], [6.4, 'cloth_ochre'], [-19.5, 'cloth_ochre'], [19.5, 'cloth_white'], [-29, 'cloth_red'], [29, 'cloth_red']]) E.push({ t: 'bali_tedung', at: [x, x === -29 || x === 29 ? -131.5 : -139.5], y: y2, h: 3.1, mat: m });
for (const [x, z, f] of [[-27.5, -121.7, y2 + 0.7], [-24.0, -121.7, y2 + 0.7], [23.5, -121.7, y2 + 0.7], [27, -121.7, y2 + 0.7], [-27, -98, y1 + 0.6], [-20, -97.5, y1 + 0.6]]) E.push({ t: 'bali_gebogan', at: [x, z], y: f });
for (let z = -69; z >= -50; z -= 4.5) for (const s of [-1, 1]) E.push({ t: 'bali_umbul', at: [s * 12.2, z], y: 0, h: 8.5 + ((z * 7) % 3), dir: [-s, 0] });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [
  room('forecourt', [-12, zS + 1, 12, -46], 0, 'market'),
  room('jaba-tengah', [x0 + 1, zM + 1, x1 - 1, zS - 3], y1, 'open'),
  room('jeroan', [x0 + 1, zN + 1, x1 - 1, zM - 3], y2, 'inner'),
  room('gong-pavilion', [15, -103, 27, -94.5], y1 + 0.5, 'hall'),
  room('bale-agung', [-29.5, -101.5, -16.5, -93.5], y1 + 0.6, 'hall'),
];
const walks = [[[0, -30], [0, -60], [0, -80], [0, -100], [0, -112], [0, -125], [0, -133]]];
walks[0].y0 = 0;

export const pura = {
  id: 'bali-pura',
  name: { en: 'The village pura', zh: '村庄神庙' },
  era: { en: 'Bali, c. 1900', zh: '巴厘岛，约1900年' },
  style: 'balinese',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [0, -30], facing: 'n' },
  bounds: [-40, -160, 40, -28],
  bakeBounds: [-38, -156, 38, -66],
  view: [-40, -160, 40, -28],
  bakeTop: 24,
  elements: E,
  rooms,
  walks,
};
export default pura;
