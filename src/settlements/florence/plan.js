// Florence about 1480 (docs/settlements/florence.md §2–§4).
import { RADIUS, DUOMO, CAMPANILE, BAPTISTERY, PALAZZO, LOGGIA, ARNO, BRIDGE } from './layout.js';

const E = [
  { t: 'duomo', ...DUOMO, interior: true },
  { t: 'campanile', c: CAMPANILE, s: 14.5, h: 84 },
  { t: 'baptistery', c: BAPTISTERY, r: 13.5, h: 26 },
  { t: 'palazzo', rect: PALAZZO, h: 30, front: 'w', tower: { u: 13, s: 7, h: 94 } },
  { t: 'loggia', rect: LOGGIA, h: 9.5, n: 3 },
];
export const centre = {
  id: 'florence-centre',
  name: { en: 'Santa Maria del Fiore and the Signoria', zh: '圣母百花大教堂与领主广场' },
  era: { en: 'Florence, about 1480', zh: '佛罗伦萨，约1480年' },
  style: 'renaissance',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [-150, -60], facing: 'e' },
  bounds: [-145, -95, 100, 185],
  view: [DUOMO.c[0] - DUOMO.nave - 25, DUOMO.c[1] - 22, DUOMO.c[0] + 34, DUOMO.c[1] + 22],
  bakeTop: 115,
  elements: E,
  rooms: [{ id: 'nave', rect: [-70, -77.5, 17, -42.5], y: 0, kind: 'hall' }, { id: 'crossing', rect: [17, -103, 83, -17], y: 0, kind: 'hall' }, { id: 'piazza', rect: [-160, -110, 100, -10], y: 0, kind: 'open' }],
  walks: [Object.assign([[-150, -60], [-150, -20], [-80, -20]], { y0: 0 })],
};
const az = ARNO.z + 12 * Math.sin(BRIDGE.x / 130);
export const bridge = {
  id: 'florence-ponte-vecchio', style: 'renaissance', origin: [BRIDGE.x, az], base: 0, yaw: 90, feature: true,
  entrance: { at: [0, 0], facing: 'n' }, bounds: [-44, -13, 44, 13], rooms: [],
  elements: [{ t: 'ponte_vecchio', span: ARNO.w + 12, w: 10, y: 0.5, bed: ARNO.bed, water: ARNO.level }],
};
export const river = {
  id: 'florence-arno', style: 'ming', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [0, 0], facing: 'n' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [],
  elements: [{ t: 'water_cells', rect: [-(RADIUS - 55), ARNO.z - 45, RADIUS - 55, ARNO.z + 45], y: ARNO.level, cell: 1.5, inside: (x, z) => Math.abs(z - (ARNO.z + 12 * Math.sin(x / 130))) < ARNO.w / 2 - 2 && Math.hypot(x, z) < RADIUS - 55 }],
};
export default centre;
