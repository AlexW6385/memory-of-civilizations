// Baroque Rome about 1670 (docs/settlements/baroque-rome.md §2–§4).
import { RADIUS, CROSSING, FRONT_X, FLOOR, OVAL, RETTA, PALACE, SISTINE, CASTEL, TIBER, tiberX, height } from './layout.js';

export const stpeter = {
  id: 'baroque-rome-stpeter',
  name: { en: "St Peter's and Bernini's piazza", zh: '圣彼得大教堂与贝尼尼广场' },
  era: { en: 'Rome, about 1670', zh: '罗马，约1670年' },
  style: 'baroque',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [125, 0], facing: 'w' },
  bounds: [CROSSING[0] - 70, -118, OVAL.c[0] + OVAL.ax * 1.2 + 2, 118],
  view: [FRONT_X - 30, -62, FRONT_X + 12, 62],
  bakeTop: 132,
  elements: [
    { t: 'st_peter', c: CROSSING, s: 110, nave: FRONT_X - 4 - (CROSSING[0] + 55), w: 56, h: 48, d: 42, y: FLOOR, interior: true },
    { t: 'colonnade', c: OVAL.c, ax: OVAL.ax, bz: OVAL.bz, rows: 4, depth: 14, h: 13 },
    { t: 'paving', rect: RETTA },
    { t: 'obelisk', c: OVAL.c, h: 25.5 },
    { t: 'fountain', c: [OVAL.c[0], OVAL.c[1] - 42], r: 6 },
    { t: 'fountain', c: [OVAL.c[0], OVAL.c[1] + 42], r: 6 },
  ],
  rooms: [
    { id: 'piazza', rect: [RETTA[0], -90, OVAL.c[0] + OVAL.ax, 90], y: 0, kind: 'open' },
    { id: 'nave', rect: [CROSSING[0] + 21, -13.75, FRONT_X - 4 - 9.2, 13.75], y: FLOOR, kind: 'hall' },
    { id: 'crossing', rect: [CROSSING[0] - 21, -21, CROSSING[0] + 21, 21], y: FLOOR, kind: 'hall' },
  ],
  walks: [Object.assign([[125, 0], [40, 0], [FRONT_X + 26, 0]], { y0: 0 })],
};
export const vatican = {
  id: 'baroque-rome-vatican', style: 'baroque', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [125, 0], facing: 'w' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [],
  elements: [
    { t: 'palace_roman', rect: PALACE, h: 26 },
    { t: 'palace_roman', rect: SISTINE, h: 21, hall: true },
    { t: 'castel', c: CASTEL.c, r: CASTEL.r, h: 20 },
  ],
};
export const passetto = {
  id: 'baroque-rome-passetto', style: 'vernacular', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [125, 0], facing: 'w' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [],
  elements: [{ t: 'wall_low', rect: [PALACE[2], -160, CASTEL.c[0] - CASTEL.r * 1.5, -156], y: 0, h: 8 }],
};
const bz = CASTEL.c[1], bx = tiberX(bz);
export const bridge = {
  id: 'baroque-rome-ponte', style: 'baroque', origin: [bx, bz], base: 0, yaw: 0, feature: true,
  entrance: { at: [0, 0], facing: 'n' }, bounds: [-44, -10, 44, 10], rooms: [],
  elements: [{ t: 'ponte_angeli', span: TIBER.w + 12, w: 11, y: 0.5, bed: TIBER.bed, water: TIBER.level, city: 'e' }],
};
export const river = {
  id: 'baroque-rome-tiber', style: 'ming', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [0, 0], facing: 'n' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [],
  // (out to where its bed comes up to the water by the disc's edge)
  elements: [{ t: 'water_cells', rect: [TIBER.x - 60, -RADIUS, TIBER.x + 60, RADIUS], y: TIBER.level, cell: 1.5, inside: (x, z) => Math.abs(x - tiberX(z)) < TIBER.w / 2 + 6 && height(x, z) < TIBER.level }],
};
export default stpeter;
