// The Piazza San Marco about 1500 (docs/settlements/venice.md §2–§4).
import { upWalks } from './upper.js';
import { shopsOf, shopWalks } from './shops.js';
import { PIAZZA, PIAZZETTA, BASILICA, CAMPANILE, PALACE, CLOCK, GROUND, SEA, BASIN_Z } from './layout.js';

const g = GROUND, E = [
  { t: 'basilica', c: BASILICA.c, s: BASILICA.s, w: BASILICA.w, h: 22, y: g, interior: true, noHorses: true },
  { t: 'bell_tower', c: CAMPANILE, s: 12, h: 98, y: g },
  { t: 'doges_palace', rect: PALACE, h: 25, y: g, noFigs: true },
  { t: 'procuratie', rect: [PIAZZA[0], PIAZZA[1] - 18, CLOCK[0], PIAZZA[1]], h: 11, front: 's', y: g, shops: shopsOf([PIAZZA[0], PIAZZA[1] - 18, CLOCK[0], PIAZZA[1]]) },
  { t: 'clock_tower', rect: CLOCK, h: 24, front: 's', y: g },
  { t: 'procuratie', rect: [PIAZZA[0], PIAZZA[3], CAMPANILE[0] - 12, PIAZZA[3] + 16], h: 11, front: 'n', y: g, shops: shopsOf([PIAZZA[0], PIAZZA[3], CAMPANILE[0] - 12, PIAZZA[3] + 16]) },
  { t: 'procuratie', rect: [PIAZZA[0] - 16, PIAZZA[1] - 18, PIAZZA[0], PIAZZA[3] + 16], h: 11, front: 'e', y: g },
  { t: 'column_statue', c: [PIAZZETTA[0] + 12, PIAZZETTA[3] - 8], h: 12.5, y: g, statue: 'theodore', granite: 'granite_red', figs: false },
  { t: 'column_statue', c: [PIAZZETTA[2] - 12, PIAZZETTA[3] - 8], h: 12.5, y: g, statue: 'lion', figs: false },
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
  rooms: [{ id: 'piazza', rect: PIAZZA, y: g, kind: 'open' },
    { id: 'basilica', rect: [BASILICA.c[0] - BASILICA.s + 1.5, BASILICA.c[1] - 9.5, BASILICA.c[0] + 8, BASILICA.c[1] + 9.5], y: g, kind: 'hall' },
    { id: 'transepts', rect: [BASILICA.c[0] - 9.5, BASILICA.c[1] - BASILICA.s * 0.8 + 2, BASILICA.c[0] + 9.5, BASILICA.c[1] + BASILICA.s * 0.8 - 2], y: g, kind: 'hall' }],
  // (past the market stall and the wells and well-heads of the square, then the Campanile's open ground floor: the street life stands where it stands)
  walks: [...upWalks(), ...shopWalks(), Object.assign([[-120, -5], [-108, -6.3], [-45, -6.3], [-38, 1.5], [12, 1.5], [17, -5], [22, -5], [40, -5], [BASILICA.c[0], BASILICA.c[1]]], { y0: g })],
};
// the gondolas moored stern to the Molo before the Piazzetta and the palace, between their posts
const boats = [];
for (const [x0, x1] of [[30, 72], [84, 146]]) for (let x = x0, i = 0; x <= x1; x += 2.3, i++) boats.push({ t: 'gondola', at: [x, BASIN_Z + 6.4], yaw: Math.PI / 2 + (i % 3 - 1) * 0.04, y: SEA, felze: i % 3 !== 1 });
for (const x of [27.5, 75, 81, 149]) for (const dz of [1.2, 9.5]) boats.push({ t: 'palo', at: [x, BASIN_Z + dz], y: SEA - 3, h: 6.2 });
const moloBase = { style: 'venetian', origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [0, 0], facing: 'n' }, bounds: [24, BASIN_Z, 152, BASIN_Z + 13], rooms: [] };
export const molo = { ...moloBase, id: 'venice-molo', elements: boats.map((e) => (e.t === 'gondola' ? { ...e, noFerro: true } : e)) };
// (the gondolas' ferro and the felze of cloth over hoops, modelled, within 75 m of the middle of the Molo; the simple cabin stays under it: venetian/boats.js)
export const moloFine = { ...moloBase, id: 'venice-molo-fine', center: [88, BASIN_Z + 6], near: 75, elements: boats.filter((e) => e.t === 'gondola').map((e) => ({ ...e, fine: 'only' })) };
// the three banner masts before San Marco (venetian/masts.js), their yards across the piazza so that the banners show their faces from the square
const MX = BASILICA.c[0] - BASILICA.s - 13 - 12;
export const masts = {
  id: 'venice-masts', style: 'venetian', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [0, 0], facing: 'n' }, bounds: [MX - 3, BASILICA.c[1] - 18, MX + 3, BASILICA.c[1] + 18], rooms: [],
  elements: [-14, 0, 14].map((dz, i) => ({ t: 'pennone', at: [MX, BASILICA.c[1] + dz], y: g, h: 20, rot: Math.PI / 2, cloth: ['cloth_red', 'cloth_red', 'cloth_red'][i] })),
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
// the fourteen marble statues of the iconostasis of 1394 (docs/settlements/venice.md §4, San Marco inside): the
// Virgin and St Mark nearest the crucifix, the twelve apostles beyond, on the architrave (its top 5.42 m over the
// pavement, 9.75 m east of the crossing's centre), facing the nave [stated: basilicasanmarco.it; inferred: the order]
const IX = BASILICA.c[0] + 9.75, IY = g + 5.42;
export const iconostasis = {
  id: 'venice-iconostasis', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, center: [IX, BASILICA.c[1]], near: 120,
  entrance: { at: [0, 0], facing: 'n' }, bounds: [IX - 1, BASILICA.c[1] - 7, IX + 1, BASILICA.c[1] + 7], rooms: [],
  elements: Array.from({ length: 14 }, (_, i) => {
    const s = i < 7 ? -1 : 1, k = i % 7, w = s * (1.0 + k * 0.85);
    return { t: 'figure', at: [IX, BASILICA.c[1] + w], y: IY, rot: Math.PI / 2, seed: 1394 + i, h: 1.35, pose: 'stand', arms: k === 0 && s < 0 ? 'pray' : undefined,
      dress: 'robe', over: 'cape', hat: k === 0 && s < 0 ? 'veil' : 'none', hair: 'short', beard: !(k === 0 && s < 0), feet: 'bare',
      cloth: 'marble_smooth', cloth2: 'marble_smooth', skin: 'marble_smooth', hairMat: 'marble_smooth', hatMat: 'marble_smooth', hairShade: 1 };
  }),
};
// The sculpture a visitor walks up to (venetian/works.js, docs/settlements/venice.md §4j), each group in two plans by
// the distance to its centre: in full within `near` m, reduced beyond (the engine's tile batches, src/settlements/lod.js).
const sculptPlan = (id, center, near, elements, r = 8) => [false, true].map((far) => ({
  id: `venice-${id}${far ? '-far' : ''}`, style: 'venetian', origin: [0, 0], base: 0, yaw: 0, feature: true, ...(far ? { nocollide: true } : {}), center,
  ...(far ? { far: near } : { near }), entrance: { at: [0, 0], facing: 'n' }, bounds: [center[0] - r, center[1] - r, center[0] + r, center[1] + r], rooms: [],
  elements: elements.map((e) => ({ ...e, lod: far ? 2 : 0 })),
}));
const FX = BASILICA.c[0] - BASILICA.s - 10, YT = g + 0.84 + 0.75 + 12.5 + 2.05;
export const sculptPlans = () => [
  // the four gilt horses on the loggia over the middle portal, 17 m up
  ...sculptPlan('horses', [FX - 3.75, BASILICA.c[1]], 45, [{ t: 'sculpt', what: 'horses', x: FX - 3.75, y: g + 22 * 0.7 + 0.55, z: BASILICA.c[1] }], 10),
  // St Mark's lion and St Theodore on the two columns
  ...sculptPlan('patrons', [(PIAZZETTA[0] + PIAZZETTA[2]) / 2, PIAZZETTA[3] - 8], 50, [
    { t: 'sculpt', what: 'patron', c: [PIAZZETTA[0] + 12, PIAZZETTA[3] - 8], yt: YT, statue: 'theodore' },
    { t: 'sculpt', what: 'patron', c: [PIAZZETTA[2] - 12, PIAZZETTA[3] - 8], yt: YT, statue: 'lion' }], 20),
  // the Porta della Carta: the doge before the lion, the four Virtues
  ...sculptPlan('porta', [PALACE[2] - 61, PALACE[1] - 1], 30, [{ t: 'sculpt', what: 'porta', rect: PALACE, face: 'n', y: g, uP: 61 }], 6),
  // the corner groups on the capitals of the palace's corner columns
  ...sculptPlan('adam', [PALACE[0] + 0.75, PALACE[3] - 0.75], 30, [{ t: 'sculpt', what: 'corner', kind: 'adam', x: PALACE[0] + 0.75, y: g + 4.48, z: PALACE[3] - 0.75, dx: -1, dz: 1 }], 3),
  ...sculptPlan('noah', [PALACE[2] - 0.75, PALACE[3] - 0.75], 30, [{ t: 'sculpt', what: 'corner', kind: 'noah', x: PALACE[2] - 0.75, y: g + 4.48, z: PALACE[3] - 0.75, dx: 1, dz: 1 }], 3),
  ...sculptPlan('solomon', [PALACE[0] + 0.75, PALACE[1] + 0.75], 30, [{ t: 'sculpt', what: 'corner', kind: 'solomon', x: PALACE[0] + 0.75, y: g + 4.48, z: PALACE[1] + 0.75, dx: -1, dz: -1 }], 3),
  // the carved capitals of the arcade on the Piazzetta (the palace's west front): the figures of the months and the trades, in full near only
  { ...sculptPlan('capitals', [PALACE[0], (PALACE[1] + PALACE[3]) / 2], 55, [{ t: 'sculpt', what: 'capitals', x: PALACE[0] + 0.6, y: g + 3.3, zs: Array.from({ length: 18 }, (_, i) => PALACE[1] + Math.min(68 - 0.6, Math.max(0.6, i * 4))) }], 40)[0] },
  // the Tetrarchs at the corner of the basilica's south arm, facing the piazzetta and the palace
  ...sculptPlan('tetrarchs', [BASILICA.c[0] + 12, BASILICA.c[1] + 28.4], 30, [{ t: 'sculpt', what: 'tetrarchs', x: BASILICA.c[0] + 11.9, y: g + 1.5, z: BASILICA.c[1] + 27.7 }], 3),
];
export default sanMarco;
