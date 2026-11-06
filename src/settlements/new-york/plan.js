// Modern New York about 1931 (docs/settlements/new-york.md §2–§4).
import { RADIUS, EL_STATIONS, VIADUCT, ESB, LIBRARY, BRYANT, GCT, CHRYSLER, CHANIN, LINCOLN, AVENUES, height } from './layout.js';

const hy = (r) => height((r[0] + r[2]) / 2, (r[1] + r[3]) / 2);
export const esb = {
  id: 'new-york-esb',
  name: { en: 'The Empire State Building and Midtown', zh: '帝国大厦与中城' },
  era: { en: 'New York, 1931', zh: '纽约，1931年' },
  style: 'artdeco',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [4, 176], facing: 's' },
  bounds: [ESB[0] - 1, ESB[1] - 1, ESB[2] + 1, ESB[3] + 1],
  view: ESB,
  bakeTop: 390,
  elements: [{ t: 'empire_state', rect: ESB, y: hy(ESB) }],
  rooms: [{ id: 'fifth', rect: [-9, 150, 9, 260], y: 0, kind: 'open' }],
  walks: [Object.assign([[4, 176], [4, 230]], { y0: 0 })],
};
export const midtown = {
  id: 'new-york-midtown', style: 'artdeco', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [4, 176], facing: 's' }, bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [],
  elements: [
    { t: 'chrysler', rect: CHRYSLER, y: hy(CHRYSLER) },
    { t: 'skyscraper', rect: CHANIN, y: hy(CHANIN), h: 197, mat: 'facade_buff', seed: 1929 },
    { t: 'skyscraper', rect: LINCOLN, y: hy(LINCOLN), h: 205, mat: 'facade_limestone', seed: 1930 },
    { t: 'grand_central', rect: GCT, y: hy(GCT), h: 30, deck: 8.5, viaduct: VIADUCT, yAt: (z) => height(VIADUCT.x, z) },
    { t: 'beaux_arts', rect: LIBRARY, y: hy(LIBRARY), h: 22, front: 'e', cols: 6, mat: 'marble' },
    { t: 'park', rect: BRYANT, y: hy(BRYANT) },
    { t: 'el_track', x: AVENUES[0][0], z0: -400, z1: 400, y: 0, yAt: (z) => height(AVENUES[0][0], z), stations: EL_STATIONS },
  ],
};
export default esb;
