// Modern New York about 1931 (docs/settlements/new-york.md §2–§4).
import { RADIUS, EL_STATIONS, VIADUCT, ESB, LIBRARY, BRYANT, GCT, CHRYSLER, CHANIN, LINCOLN, AVENUES, height, GRID, toCity } from './layout.js';

// (the plans stand at the origin unturned; their elements are laid out in the grid's frame and
// turned with it by the style's `turned`; what the plans say of places — entrance, rooms, walks,
// bounds — is in the settlement's frame)
const P = (x, z) => toCity(x, z);
/** The settlement-frame box round a grid-frame rectangle. */
export const boxOf = ([x0, z0, x1, z1]) => { const c = [P(x0, z0), P(x1, z0), P(x1, z1), P(x0, z1)]; return [Math.min(...c.map((p) => p[0])), Math.min(...c.map((p) => p[1])), Math.max(...c.map((p) => p[0])), Math.max(...c.map((p) => p[1]))]; };
const ENTRANCE = P(4, 176);
/** Where the plans say the settlement is entered: on Fifth Avenue at 35th Street. */
export const entranceOf = () => ({ at: ENTRANCE.map((v) => Math.round(v * 100) / 100), facing: 's' });

const hy = (r) => height((r[0] + r[2]) / 2, (r[1] + r[3]) / 2);
export const esb = {
  id: 'new-york-esb',
  name: { en: 'The Empire State Building and Midtown', zh: '帝国大厦与中城' },
  era: { en: 'New York, 1931', zh: '纽约，1931年' },
  style: 'artdeco',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: entranceOf(),
  bounds: boxOf([ESB[0] - 1, ESB[1] - 1, ESB[2] + 1, ESB[3] + 1]),
  view: boxOf(ESB),
  bakeTop: 390,
  // the bake's boxes round the lobby (src/styles/artdeco/esb.js): the hall from the Fifth Avenue doors to the
  // silhouette, three storeys high, and the corridor of the elevators across it, two storeys high
  bakeBoxes: (() => {
    const y = hy(ESB), xr = ESB[2] - 2.2, cz = (ESB[1] + ESB[3]) / 2;
    return [[[xr - 30, cz - 7, xr + 2.5, cz + 7], 15.8], [[xr - 22.5, ESB[1] + 4.5, xr - 13, ESB[3] - 4.5], 8.6]].map(([r, top]) => [...boxOf(r), y - 0.6, y + top]);
  })(),
  elements: [{ t: 'turned', angle: GRID, elements: [{ t: 'empire_state', rect: ESB, y: hy(ESB) }] }],
  // (Fifth Avenue's roadway in front of the tower: a box inside the turned avenue)
  rooms: [{ id: 'fifth', rect: [...P(0, 200).map((v) => v - 4), ...P(0, 200).map((v) => v + 4)], y: 0, kind: 'open' }],
  // (and in through the Fifth Avenue doors, down the lobby to the silhouette and along the corridor of the elevators)
  walks: [Object.assign([P(4, 176), P(4, 230)], { y0: 0 }), Object.assign([P(2, 230), P(-14, 230), P(-37, 230), P(-29, 230), P(-29, 214), P(-29, 246)], { y0: hy(ESB) })],
};
export const midtown = {
  id: 'new-york-midtown', style: 'artdeco', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: entranceOf(), bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], rooms: [],
  elements: [{ t: 'turned', angle: GRID, elements: [
    { t: 'chrysler', rect: CHRYSLER, y: hy(CHRYSLER) },
    { t: 'skyscraper', rect: CHANIN, y: hy(CHANIN), h: 197, mat: 'facade_buff', seed: 1929 },
    { t: 'skyscraper', rect: LINCOLN, y: hy(LINCOLN), h: 205, mat: 'facade_limestone', seed: 1930 },
    { t: 'grand_central', rect: GCT, y: hy(GCT), h: 30, deck: 8.5, viaduct: VIADUCT, yAt: (z) => height(VIADUCT.x, z) },
    { t: 'beaux_arts', rect: LIBRARY, y: hy(LIBRARY), h: 22, front: 'e', cols: 6, mat: 'marble' },
    { t: 'park', rect: BRYANT, y: hy(BRYANT) },
    { t: 'el_track', x: AVENUES[0][0], z0: -400, z1: 400, y: 0, yAt: (z) => height(AVENUES[0][0], z), stations: EL_STATIONS },
    // trains on it: four cars standing at 42nd Street on the uptown track, five running downtown below 35th Street
    { t: 'el_train', x: AVENUES[0][0] + 2, avenue: AVENUES[0][0], z: EL_STATIONS[2] + 1, y: 10.4, cars: 4 },
    { t: 'el_train', x: AVENUES[0][0] - 2, avenue: AVENUES[0][0], z: 118, y: 10.4, cars: 5 },
  ] }],
};
export default esb;
