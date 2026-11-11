// Barcelona about 1910 (docs/settlements/barcelona.md §2–§4).
import { SAGRADA, GRACIA_X, PITCH, BLOCK, PEDRERA, BATLLO, CASA, height } from './layout.js';

// the house with the café (docs/settlements/barcelona.md §6): rooms by their rects, a floor each (the street's level + 0.12; the flat 7.4 m up)
const cy = height(CASA.fx - 9, CASA.z0 + 8), R = (a0, b0, a1, b1) => [CASA.fx - b1, CASA.z0 + a0, CASA.fx - b0, CASA.z0 + a1];
const casaRooms = [
  { id: 'cafe', rect: R(0.05, 0.5, 9.25, 17.6), y: cy + 0.12, kind: 'cafe' },
  { id: 'casa-stair', rect: R(9.55, 0.5, 12.6, 17.6), y: cy + 0.12, kind: 'hall' },
  { id: 'casa-shop', rect: R(12.9, 0.5, 15.95, 7.4), y: cy + 0.12, kind: 'shop' },
  { id: 'casa-flat', rect: R(0.05, 0.5, 15.95, 17.6), y: cy + 7.4, kind: 'house' },
];

// the Schools (docs/settlements/barcelona.md §10): the three classrooms, at the schools' place in the works
const SCH = [SAGRADA[0] - 12, SAGRADA[1] + 25], sy = height(SCH[0], SCH[1]);

export const sagrada = {
  id: 'barcelona-sagrada',
  name: { en: 'The Sagrada Família and the Eixample', zh: '圣家堂与扩展区' },
  era: { en: 'Barcelona, about 1910', zh: '巴塞罗那，约1910年' },
  style: 'modernisme',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [SAGRADA[0] + 50, SAGRADA[1]], facing: 'w' },
  bounds: [GRACIA_X - BLOCK / 2 - 2, SAGRADA[1] - 48, SAGRADA[0] + 40, PITCH + BLOCK / 2 + 2],
  view: [SAGRADA[0] - 24, SAGRADA[1] - 46, SAGRADA[0] + 32, SAGRADA[1] + 46],
  bakeTop: 110,
  elements: [
    { t: 'sagrada', c: SAGRADA, y: height(...SAGRADA) },
    { t: 'pedrera', c: PEDRERA, y: height(PEDRERA[0] - 26, PEDRERA[1] - 26) },
    { t: 'batllo', a: BATLLO.a, b: BATLLO.b, y: height(...BATLLO.a), d: 18, h: 24 },
  ],
  rooms: [...casaRooms, { id: 'schools', rect: [SCH[0] - 10, SCH[1] - 4.3, SCH[0] + 10, SCH[1] + 4.3], y: sy + 0.08, kind: 'house' }, { id: 'nativity', rect: [SAGRADA[0] + 30, SAGRADA[1] - 26, SAGRADA[0] + 50, SAGRADA[1] + 26], y: height(SAGRADA[0] + 40, SAGRADA[1]), kind: 'open' }],
  walks: [Object.assign(Object.assign([[CASA.fx + 3, CASA.z0 + 4.8], [CASA.fx - 1.5, CASA.z0 + 4.8], [CASA.fx - 7, CASA.z0 + 4.8], [CASA.fx - 12, CASA.z0 + 2.5], [CASA.fx - 7, CASA.z0 + 4.8], [CASA.fx + 3, CASA.z0 + 4.8]], { y0: cy }), {}),
    // the portal, the stair hall, up the two flights to the flat, into the salon
    Object.assign([[CASA.fx + 3, CASA.z0 + 11.2], [CASA.fx - 2.5, CASA.z0 + 11.2], [CASA.fx - 2.5, CASA.z0 + 10.3], [CASA.fx - 4.6, CASA.z0 + 10.3], [CASA.fx - 12.9, CASA.z0 + 10.3], [CASA.fx - 14, CASA.z0 + 10.3], [CASA.fx - 14, CASA.z0 + 11.9], [CASA.fx - 12.9, CASA.z0 + 11.9], [CASA.fx - 4.6, CASA.z0 + 11.9], [CASA.fx - 3, CASA.z0 + 11.1], [CASA.fx - 2.3, CASA.z0 + 9.9], [CASA.fx - 2.3, CASA.z0 + 9.0], [CASA.fx - 3, CASA.z0 + 7], [CASA.fx - 3.5, CASA.z0 + 3]], { y0: cy }),
    Object.assign([[SAGRADA[0] + 50, SAGRADA[1]], [SAGRADA[0] + 36, SAGRADA[1]]], { y0: height(SAGRADA[0] + 50, SAGRADA[1]) }),
    // the Schools: in at the west door, through the three classrooms by their doorways, out at the east door
    Object.assign([[SCH[0] - 14, SCH[1]], [SCH[0] - 8.5, SCH[1]], [SCH[0] - 3.3, SCH[1]], [SCH[0] + 3.3, SCH[1]], [SCH[0] + 8.5, SCH[1]], [SCH[0] + 14, SCH[1]]], { y0: sy })],
};
export default sagrada;
