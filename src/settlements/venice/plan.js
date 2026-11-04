// The Piazza San Marco about 1500 (docs/settlements/venice.md §2–§4).
import { PIAZZA, PIAZZETTA, BASILICA, CAMPANILE, PALACE, GROUND } from './layout.js';

const g = GROUND, E = [
  { t: 'basilica', c: BASILICA.c, s: BASILICA.s, w: BASILICA.w, h: 22, y: g },
  { t: 'bell_tower', c: CAMPANILE, s: 12, h: 98, y: g },
  { t: 'doges_palace', rect: PALACE, h: 25, y: g },
  { t: 'procuratie', rect: [PIAZZA[0], PIAZZA[1] - 18, PIAZZA[2] - 5, PIAZZA[1]], h: 15, front: 's', y: g },
  { t: 'procuratie', rect: [PIAZZA[0], PIAZZA[3], CAMPANILE[0] - 12, PIAZZA[3] + 16], h: 14, front: 'n', y: g },
  { t: 'procuratie', rect: [PIAZZA[0] - 16, PIAZZA[1] - 18, PIAZZA[0], PIAZZA[3] + 16], h: 14, front: 'e', y: g },
  { t: 'column_statue', c: [PIAZZETTA[0] + 12, PIAZZETTA[3] - 8], h: 14, y: g },
  { t: 'column_statue', c: [PIAZZETTA[2] - 12, PIAZZETTA[3] - 8], h: 14, y: g },
];
export const sanMarco = {
  id: 'venice-san-marco',
  name: { en: 'San Marco', zh: '圣马可广场与大教堂' },
  era: { en: 'Venice, about 1500', zh: '威尼斯，约1500年' },
  style: 'venetian',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [-120, -5], facing: 'e' },
  bounds: [PIAZZA[0] - 18, PIAZZA[1] - 20, PALACE[2] + 2, PIAZZETTA[3] + 2],
  view: [BASILICA.c[0] - BASILICA.s - 12, BASILICA.c[1] - 30, BASILICA.c[0] + BASILICA.s + 2, BASILICA.c[1] + 30],
  bakeTop: 100,
  elements: E,
  rooms: [{ id: 'piazza', rect: PIAZZA, y: g, kind: 'open' }],
  walks: [Object.assign([[-120, -5], [-40, -5], [10, -5]], { y0: g })],
};
export default sanMarco;
