// The Bronze Sparrow Terrace of Ye with its two sisters, c. AD 215 (docs/settlements/wei-ye.md §4): three battered rammed-earth terraces in the Tongque
// Garden, each with its stair on the east face, linked by covered skyways at crown height; on the Sparrow's crown a dais with the three-storey tower
// (ground storey furnished, the bronze bird on top) and four pavilions; on the Golden Tiger's and the Ice Well's crowns a hall of five bays.
// Authored in world coordinates (origin 0, yaw 0).

import { SPARROW, ICE, TIGER, TOWER, DAIS_STAIR, SKYWAYS, BATTER, stairRect, zOf, faceX, POND, POND_Y } from './layout.js';

const E = [];
const terr = (t, extra = {}) => ({ t: 'wei_terrace', r: t.r, top: t.top, batter: BATTER, stair: { rect: stairRect(t), riser: 0.25 }, doors: 6, skyX: -195, ...extra });
E.push(terr(ICE, { gapS: true }));
E.push(terr(SPARROW, { gapN: true, gapS: true, dais: { r: SPARROW.dais, top: SPARROW.daisTop, stair: DAIS_STAIR } }));
E.push(terr(TIGER, { gapN: true }));
E.push({ t: 'wei_tower', c: TOWER.c, half: TOWER.half, floor: TOWER.floor, seed: 5 });
const [dx0, dz0, dx1, dz1] = SPARROW.dais;
for (const [x, z] of [[dx0 + 6, dz0 + 6], [dx1 - 6, dz0 + 6], [dx0 + 6, dz1 - 6], [dx1 - 6, dz1 - 6]]) E.push({ t: 'han_pavilion', c: [x, z], A: 3, B: 3, y: SPARROW.daisTop, h: 3.4, walls: false });
for (const [t, sd] of [[ICE, 71], [TIGER, 73]]) {
  const zc = t.r[3] - 8;
  E.push({ t: 'han_hall', cx: -196, z1: zc, bays: 5, bayW: 6, depth: 2, depthW: 6, floor: t.top + 0.6, base: 0.6, h: 5.4, roof: 'hip', rise: 4.4, overhang: 2.6, ap: 2.2, furnish: 'court', open: [2, 2], seed: sd });
}
for (const s of SKYWAYS) E.push({ t: 'wei_skyway', a: [s.a[0], s.a[1]], b: [s.b[0], s.b[1]], y: 12, w: 4.4 });
void zOf; void faceX; void POND; void POND_Y;

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const [tx, tz] = TOWER.c, a = TOWER.half;
const rooms = [
  room('sparrow-tower', [tx - a, tz - a, tx + a, tz + a], TOWER.floor, 'hall'),
  room('ice-hall', [-211, -152, -181, -140], 12.6, 'hall'),
  room('tiger-hall', [-211, -28, -181, -16], 12.6, 'hall'),
  room('garden', [-160, -110, -100, -60], 0, 'open'),
];
// the way in: across the garden, up the stair on the east face, over the crown, up to the dais, into the tower by its east door
const sx = faceX(SPARROW);
const walks = [[[-100, zOf(SPARROW)], [-141, zOf(SPARROW)], [sx + 1, zOf(SPARROW)], [-172, zOf(SPARROW)], [-180, zOf(SPARROW)], [-186, zOf(SPARROW)], [-192, zOf(SPARROW)], [tx, zOf(SPARROW)]]];
walks[0].y0 = 0;

export const sparrow = {
  id: 'wei-ye-bronze-sparrow',
  name: { en: 'The Bronze Sparrow Terrace', zh: '铜雀台' },
  era: { en: 'Wei, c. AD 215', zh: '曹魏，约公元215年' },
  style: 'wei',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [-100, zOf(SPARROW)], facing: 'w' },
  bounds: [-245, -175, -60, 10],
  bakeBounds: [-232, -180, -150, 0],
  view: [-232, -180, -120, 0],
  bakeTop: 38,
  bakeSpacing: 1.2,
  elements: E,
  rooms,
  walks,
};
export default sparrow;
