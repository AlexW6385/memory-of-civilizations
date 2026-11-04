// Muscovy about 1600 (docs/settlements/muscovy.md §2–§4).
import { RADIUS, KREMLIN, SPASSKY, SQUARE, BASIL, LOBNOYE, ROWS, CATHEDRALS as C, height } from './layout.js';

const hy = (r) => height((r[0] + r[2]) / 2, (r[1] + r[3]) / 2);
const five = (r, k = 1) => { const [x0, z0, x1, z1] = r, mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, dx = (x1 - x0) * 0.27, dz = (z1 - z0) * 0.27; return [[mx, mz, 3.4 * k, 6 * k], [mx - dx, mz - dz, 2.2 * k, 4 * k], [mx + dx, mz - dz, 2.2 * k, 4 * k], [mx - dx, mz + dz, 2.2 * k, 4 * k], [mx + dx, mz + dz, 2.2 * k, 4 * k]]; };
const by = height(...BASIL);
export const square = {
  id: 'muscovy-red-square',
  name: { en: "Red Square and St Basil's", zh: '红场与圣瓦西里大教堂' },
  era: { en: 'Moscow, about 1600', zh: '莫斯科，约1600年' },
  style: 'muscovite',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [40, 20], facing: 's' },
  bounds: [SQUARE[0], SQUARE[1], ROWS[2] + 2, BASIL[1] + 26],
  view: [BASIL[0] - 23, BASIL[1] - 23, BASIL[0] + 23, BASIL[1] + 23],
  bakeTop: 62,
  elements: [
    { t: 'pokrov', c: BASIL, y: by, s: 1 },
    { t: 'lobnoye', c: LOBNOYE, y: height(...LOBNOYE) },
    { t: 'rows', rect: ROWS, y: hy(ROWS), n: 40 },
  ],
  rooms: [{ id: 'square', rect: SQUARE, y: 0, kind: 'open' }],
  walks: [Object.assign([[40, 20], [40, 90], [BASIL[0], BASIL[1] - 26]], { y0: 0 })],
};
export const kremlin = {
  id: 'muscovy-kremlin', style: 'muscovite', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [40, 20], facing: 'w' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [],
  elements: [
    { t: 'kremlin_wall', pts: KREMLIN, h: 12, th: 4.5, y: height, every: 55, round: [0, 1, 2], gates: [SPASSKY, [2, 0.5]] },
    { t: 'russian_church', rect: C.dormition, h: 21, y: hy(C.dormition), domes: five(C.dormition), apses: 5 },
    { t: 'russian_church', rect: C.archangel, h: 18, y: hy(C.archangel), domes: five(C.archangel, 0.8), dome: 'gilt_bronze' },
    { t: 'russian_church', rect: C.annunciation, h: 14, y: hy(C.annunciation), domes: five(C.annunciation, 0.6), dome: 'gilt_bronze' },
    { t: 'bell_tower', c: C.ivan, y: height(...C.ivan), tiers: [[8.5, 24], [7.2, 14], [6, 12], [4.8, 14], [3.8, 8]] },
    { t: 'russian_church', rect: C.facets, h: 13, y: hy(C.facets), domes: [], apses: 0 },
  ],
};
export default square;
