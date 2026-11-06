// Muscovy about 1600 (docs/settlements/muscovy.md §2–§4).
import { RADIUS, KREMLIN, SPASSKY, NIKOLSKY, SQUARE, BASIL, LOBNOYE, ROWS, MOAT, CATHEDRALS as C, height, wallX, gateZ } from './layout.js';

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
    // the Tsar Cannon (1586) on its platform near the Lobnoye Mesto, aimed south toward the river crossing
    { t: 'tsar_cannon', c: [LOBNOYE[0], LOBNOYE[1] + 16], y: height(LOBNOYE[0], LOBNOYE[1] + 16) },
    { t: 'rows', rect: ROWS, y: hy(ROWS), seed: 1595 },
  ],
  rooms: [{ id: 'square', rect: SQUARE, y: 0, kind: 'open' }],
  walks: [Object.assign([[40, 20], [40, 90], [BASIL[0], BASIL[1] - 26]], { y0: 0 })],
};
export const kremlin = {
  id: 'muscovy-kremlin', style: 'muscovite', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [40, 20], facing: 'w' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [],
  elements: [
    { t: 'kremlin_wall', pts: KREMLIN, h: 12, th: 4.5, y: height, every: 55, round: [0, 1, 2], gates: [SPASSKY, NIKOLSKY, [2, 0.5]] },
    { t: 'moat', wallX, ...MOAT, y: height, bridges: [gateZ(SPASSKY[1]), gateZ(NIKOLSKY[1])], bw: 3.2 },
    { t: 'archangel', rect: C.archangel, h: 18, y: hy(C.archangel) },
    { t: 'annunciation', rect: C.annunciation, y: hy(C.annunciation) },
    { t: 'ivan_tower', c: C.ivan, y: height(...C.ivan) },
    { t: 'russian_church', rect: C.facets, h: 13, y: hy(C.facets), domes: [], apses: 0 },
  ],
};
// the Dormition, with its inside: its own plan, so that its nave is a room (with its music) and its door is reached on foot
const D = C.dormition, dy = hy(D), dsx = D[0] + 1.5 * (D[2] - D[0]) / 4;
export const dormition = {
  id: 'muscovy-dormition',
  name: { en: 'Cathedral of the Dormition', zh: '圣母升天大教堂' },
  era: { en: 'Moscow Kremlin, about 1600', zh: '莫斯科克里姆林宫，约1600年' },
  style: 'muscovite', origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [dsx, D[3] + 3], facing: 'n' },
  bounds: [D[0] - 6, D[1] - 2, D[2] + 6, D[3] + 2],
  bakeTop: 40,
  elements: [{ t: 'russian_church', rect: D, h: 21, y: dy, domes: five(D), apses: 5, interior: true }],
  rooms: [{ id: 'nave', rect: [D[0] + 1.3, D[1] + 1.3, D[2] - 1.3, D[3] - 1.3], y: dy + 0.15, kind: 'hall' }],
  walks: [Object.assign([[dsx, D[3] + 4], [dsx, D[3] - 3], [dsx + 2, (D[1] + D[3]) / 2]], { y0: dy })],
};
export default square;
