// The Piazza San Marco about 1500 (docs/settlements/venice.md §2–§4).
import { PIAZZA, PIAZZETTA, BASILICA, CAMPANILE, PALACE, CLOCK, GROUND, SEA, BASIN_Z } from './layout.js';

const g = GROUND, E = [
  { t: 'basilica', c: BASILICA.c, s: BASILICA.s, w: BASILICA.w, h: 22, y: g },
  { t: 'bell_tower', c: CAMPANILE, s: 12, h: 98, y: g },
  { t: 'doges_palace', rect: PALACE, h: 25, y: g },
  { t: 'procuratie', rect: [PIAZZA[0], PIAZZA[1] - 18, CLOCK[0], PIAZZA[1]], h: 11, front: 's', y: g },
  { t: 'clock_tower', rect: CLOCK, h: 24, front: 's', y: g },
  { t: 'procuratie', rect: [PIAZZA[0], PIAZZA[3], CAMPANILE[0] - 12, PIAZZA[3] + 16], h: 11, front: 'n', y: g },
  { t: 'procuratie', rect: [PIAZZA[0] - 16, PIAZZA[1] - 18, PIAZZA[0], PIAZZA[3] + 16], h: 11, front: 'e', y: g },
  { t: 'column_statue', c: [PIAZZETTA[0] + 12, PIAZZETTA[3] - 8], h: 12.5, y: g, statue: 'theodore', granite: 'granite_red' },
  { t: 'column_statue', c: [PIAZZETTA[2] - 12, PIAZZETTA[3] - 8], h: 12.5, y: g, statue: 'lion' },
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
// the gondolas moored stern to the Molo before the Piazzetta and the palace, between their posts
const boats = [];
for (const [x0, x1] of [[30, 72], [84, 146]]) for (let x = x0, i = 0; x <= x1; x += 2.3, i++) boats.push({ t: 'gondola', at: [x, BASIN_Z + 6.4], yaw: Math.PI / 2 + (i % 3 - 1) * 0.04, y: SEA, felze: i % 3 !== 1 });
for (const x of [27.5, 75, 81, 149]) for (const dz of [1.2, 9.5]) boats.push({ t: 'palo', at: [x, BASIN_Z + dz], y: SEA - 3, h: 6.2 });
export const molo = {
  id: 'venice-molo', style: 'venetian', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [0, 0], facing: 'n' }, bounds: [24, BASIN_Z, 152, BASIN_Z + 13], rooms: [], elements: boats,
};
// Doge Agostino Barbarigo (doge 1486–1501) kneeling before the lion of St Mark over the Clock Tower's
// gallery, as he was until the French took the figure down in 1797 (docs/settlements/venice.md §2, Clock
// Tower) [stated: Wikipedia "St Mark's Clocktower"]: on the cornice before the gilt lion (which strides east,
// +x, in the tower's front: venetian/piazza.js, clockTower), facing it, his hands joined; in the ducal robe
// and mantle with the corno, gilt like the lion [inferred: material and dress]. The cornice's top is 20.75 m
// up (the gallery's yG 20.3 + 0.45), its depth 0.55 m from the front.
const DOGE = [CLOCK[0] + 6.25, CLOCK[3] + 0.28];
export const doge = {
  id: 'venice-doge', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, center: DOGE, near: 320,
  entrance: { at: [0, 0], facing: 'n' }, bounds: [CLOCK[0], CLOCK[1], CLOCK[2], CLOCK[3] + 1], rooms: [],
  elements: [{ t: 'figure', at: DOGE, y: g + 20.75, rot: Math.PI / 2, seed: 1486, h: 1.9, pose: 'kneel', arms: 'pray', dress: 'robe', over: 'cape', hat: 'corno', hair: 'short', beard: true, feet: 'bare',
    cloth: 'gilt_bronze', cloth2: 'gilt_bronze', skin: 'gilt_bronze', hatMat: 'gilt_bronze', hairMat: 'gilt_bronze', hairShade: 1 }],
};
export default sanMarco;
