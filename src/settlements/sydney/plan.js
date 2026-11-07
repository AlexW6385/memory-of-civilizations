// Modern Sydney, 1973 (docs/settlements/sydney.md §2–§4).
import { RADIUS, LEVEL, OPERA, BRIDGE, QUAY, AUSTRALIA_SQ, height, seawalls } from './layout.js';

const [ox0, oz0, ox1, oz1] = OPERA.rect, cw = ox0 + 21, ce = ox1 - 21;
export const opera = {
  id: 'sydney-opera',
  name: { en: 'The Opera House and the Harbour Bridge', zh: '悉尼歌剧院与海港大桥' },
  era: { en: 'Sydney, 1973', zh: '悉尼，1973年' },
  style: 'modern',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [100, -96], facing: 'n' },
  bounds: [ox0 - 8, oz0 - 8, ox1 + 8, oz1 + OPERA.stair + 4],
  view: [ox0, oz0, ox1, oz1],
  bakeTop: 72,
  elements: [{
    t: 'opera_house', rect: OPERA.rect, y: height(100, -190), h: OPERA.h, stair: OPERA.stair,
    halls: [
      { x: cw, hw: 19, concert: true, shells: [[oz1 - 6, oz1 - 34, 24], [oz1 - 26, oz1 - 60, 38], [oz1 - 50, oz1 - 88, 50], [oz1 - 78, oz1 - 112, 57]] },
      { x: ce, hw: 17, shells: [[oz1 - 10, oz1 - 36, 20], [oz1 - 28, oz1 - 60, 32], [oz1 - 50, oz1 - 84, 43], [oz1 - 74, oz1 - 104, 49]] },
    ],
  }],
  // (the forecourt and the walk at the ground's height there, not at the plan's base)
  rooms: [{ id: 'forecourt', rect: [ox0, oz1, ox1, oz1 + OPERA.stair + 12], y: height(100, oz1 + OPERA.stair + 6), kind: 'open' }],
  walks: [Object.assign([[100, -96], [100, oz1 + OPERA.stair + 2]], { y0: height(100, -96) }),
    // up the stair, in at the Concert Hall's east door and down its aisle to the stage
    Object.assign([[100, oz1 - 4], [cw + 15, oz1 - 34], [cw + 8, oz1 - 34], [cw, oz1 - 34], [cw, oz1 - 45], [cw, oz1 - 55]], { y0: height(100, -190) + OPERA.h })],
};
export const harbour = {
  id: 'sydney-harbour', style: 'modern', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [100, -96], facing: 'n' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [],
  elements: [
    { t: 'arch_bridge', ...BRIDGE },
    // the sandstone sea wall along every shore (§6)
    ...seawalls().map((w) => ({ t: 'sea_wall', ...w, level: LEVEL })),
    { t: 'viaduct', rect: QUAY, y: 13 },
    // the wharves, a gangway at each berth: lowered onto the Lady-class ferry's foredeck at the east wharf, raised elsewhere
    ...[-36, -18, 0, 18].map((x) => ({ t: 'wharf', rect: [x - 5, -60, x + 5, -8], y: 1.2, gangways: [{ side: -1, z: -50 }, x === 18 ? { side: 1, z: -52.5, down: -0.3 } : { side: 1, z: -50 }] })),
    // the people on the quay's promenade and waiting on the wharves (§1c)
    { t: 'quay_crowd', rect: [-44, -6.4, 39, 1], y: height(0, -3), wharves: [-36, -18, 0, 18].map((x) => ({ x, y: 1.2, a0: -50, a1: -20.3 })), n: 34, seed: 1973 },
    // the ferries of 1973: a Lady-class ferry at the quay, another crossing, a Manly ferry and a hydrofoil out on the harbour
    { t: 'ferry', kind: 'lady', at: [28.6, -36], y: LEVEL, rot: 0 },
    { t: 'ferry', kind: 'lady', at: [-20, -185], y: LEVEL, rot: 0.35 },
    { t: 'ferry', kind: 'manly', at: [-60, -265], y: LEVEL, rot: -0.9 },
    { t: 'ferry', kind: 'hydrofoil', at: [225, -205], y: LEVEL, rot: 2.6 },
    { t: 'round_tower', c: AUSTRALIA_SQ, r: 21, h: 170, y: height(...AUSTRALIA_SQ) },
    { t: 'skyscraper', rect: [-30, 40, 10, 66], y: height(-10, 53), h: 117, mat: 'facade_glass', seed: 1962 },     // the AMP Building at the quay
  ],
};
export default opera;
