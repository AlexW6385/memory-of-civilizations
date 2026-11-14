// Florence about 1480 (docs/settlements/florence.md §2–§4).
import { RADIUS, DUOMO, CAMPANILE, BAPTISTERY, PALAZZO, LOGGIA, ORSAN, ARNO, BRIDGE, MEDICI, MERCATO, NOVELLA, NOVELLA_PIAZZA } from './layout.js';

const E = [
  { t: 'duomo', ...DUOMO, interior: true },
  { t: 'campanile', c: CAMPANILE, s: 14.5, h: 84 },
  { t: 'baptistery', c: BAPTISTERY, a: 12.8, h: 26 },
  { t: 'palazzo', rect: PALAZZO, h: 30, front: 'w', tower: { u: 13, s: 7, h: 94 } },
  { t: 'loggia', rect: LOGGIA, h: 9.5, n: 3 },
  { t: 'orsanmichele', rect: ORSAN, h: 39.5 },
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
  rooms: [{ id: 'nave', rect: [-70, -77.5, 17, -42.5], y: 0, kind: 'hall' }, { id: 'crossing', rect: [24, -76, 56, -44], y: 0, kind: 'hall', sealed: true }, { id: 'tribune east', rect: [64, -67.8, 79.5, -52.2], y: 0, kind: 'hall', sealed: true }, { id: 'tribune north', rect: [32.2, -99.5, 47.8, -84], y: 0, kind: 'hall', sealed: true }, { id: 'tribune south', rect: [32.2, -36, 47.8, -20.5], y: 0, kind: 'hall', sealed: true }, { id: 'piazza', rect: [-160, -110, 100, -10], y: 0, kind: 'open' }],
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
// the Palazzo Medici (docs/settlements/florence.md §4): its front on the Via Larga (east), the loggia on the corner of the Via de' Gori (south-east)
export const medici = {
  id: 'florence-palazzo-medici', style: 'renaissance', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [MEDICI[2] + 4, (MEDICI[1] + MEDICI[3]) / 2], facing: 'w' }, bounds: [MEDICI[0] - 1, MEDICI[1] - 1, MEDICI[2] + 3, MEDICI[3] + 3],
  elements: [{ t: 'palazzo_medici', rect: MEDICI, y: 0 }],
  rooms: [{ id: 'medici-court', rect: [MEDICI[0] + 9.1, MEDICI[1] + 9.1, MEDICI[2] - 9.1, MEDICI[3] - 9.1], y: 0, kind: 'open' }],
};
// the Mercato Vecchio (docs/settlements/florence.md §4): the column of Abundance at the crossing of the Roman streets, the market hall on its south side
const mc = [(MERCATO[0] + MERCATO[2]) / 2, (MERCATO[1] + MERCATO[3]) / 2];
export const mercato = {
  id: 'florence-mercato-vecchio', style: 'renaissance', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [mc[0], MERCATO[1] + 2], facing: 's' }, bounds: [MERCATO[0], MERCATO[1], MERCATO[2], MERCATO[3]],
  elements: [{ t: 'mercato', column: mc, hall: [MERCATO[0] + 8, MERCATO[3] - 14, MERCATO[2] - 22, MERCATO[3] - 7], y: 0 }],
  rooms: [{ id: 'mercato-market', rect: [MERCATO[0] + 2, MERCATO[1] + 2, MERCATO[2] - 2, MERCATO[3] - 16], y: 0, kind: 'open' }],
};
// Santa Maria Novella (docs/settlements/florence.md §4): Alberti's front of 1470 on the south, its piazza before it
export const novella = {
  id: 'florence-santa-maria-novella', style: 'renaissance', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [(NOVELLA[0] + NOVELLA[2]) / 2, NOVELLA[3] + 12], facing: 'n' }, bounds: [NOVELLA[0] - 1, NOVELLA[1] - 1, NOVELLA[2] + 1, NOVELLA[3] + 1],
  elements: [{ t: 'novella', rect: NOVELLA, y: 0 }],
  rooms: [{ id: 'novella-piazza', rect: NOVELLA_PIAZZA, y: 0, kind: 'open', market: false }],
};
export default centre;
