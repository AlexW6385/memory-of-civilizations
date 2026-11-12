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
// ── what stands about the terraces: the army's banners, the bronze of the court, the guards' racks, the drum and bells of the dais ──
for (const t of [ICE, SPARROW, TIGER]) {
  const st = stairRect(t), zc = zOf(t), fx = st[2];
  for (const sg of [-1, 1]) {
    E.push({ t: 'wei_prop', kind: 'flag', at: [fx + 3.5, zc + sg * 7.2], yaw: sg > 0 ? 0 : Math.PI, h: 7.2, cloth: sg > 0 ? 'cloth_red' : 'cloth_black', long: t === SPARROW });
    E.push({ t: 'wei_prop', kind: 'brazier', at: [fx + 1.8, zc + sg * 5.4] });
    E.push({ t: 'wei_prop', kind: 'rack', at: [fx + 7, zc + sg * 6.4], yaw: Math.PI / 2, n: 7 });
    E.push({ t: 'wei_prop', kind: 'brazier', at: [st[0] + 1.5, zc + sg * 5.2], y: t.top });
    E.push({ t: 'wei_prop', kind: 'ding', at: [fx - 4, zc + sg * 8.2], s: 1.1 });
  }
  E.push({ t: 'wei_prop', kind: 'block', at: [fx + 1.6, zc + 10.5], yaw: Math.PI / 2 });
  E.push({ t: 'wei_prop', kind: 'rail', at: [fx + 12, zc + 12.5], len: 4 });
}
{
  const [d0, d1, d2, d3] = SPARROW.dais, y = SPARROW.daisTop, [tx, tz] = TOWER.c;
  // the dais: the drum of the hours north of the tower, the bell frame south of it, the dings and lamp trees by its door, braziers at the stair
  E.push({ t: 'wei_prop', kind: 'drum', at: [tx, d1 + 5.2], y, yaw: 0 });
  E.push({ t: 'wei_prop', kind: 'bells', at: [tx, d3 - 5.2], y, yaw: 0, n: 6 });
  for (const sg of [-1, 1]) {
    E.push({ t: 'wei_prop', kind: 'ding', at: [d2 - 3.2, tz + sg * 3.4], y, s: 1.0 });
    E.push({ t: 'wei_prop', kind: 'lamp', at: [d2 - 6, tz + sg * 6.5], y });
    E.push({ t: 'wei_prop', kind: 'lamp', at: [d0 + 4, tz + sg * 7.5], y });
    E.push({ t: 'wei_prop', kind: 'brazier', at: [d2 - 2, tz + sg * 8.5], y });
  }
  E.push({ t: 'wei_prop', kind: 'bench', at: [d0 + 3.2, tz], y, yaw: Math.PI / 2, len: 3 });
  // the crown below the dais: banners at the corners of the terrace
  for (const [x, z] of [[-169.6, -114.5], [-169.6, -61.5], [-219.5, -114.5], [-219.5, -61.5]]) E.push({ t: 'wei_prop', kind: 'flag', at: [x, z], y: SPARROW.top, h: 6.5, cloth: 'cloth_red', long: true });
}
// the Golden Tiger's and the Ice Well's crowns: stores' hoists - lumber and jars at the foot of the halls, benches, lamps
for (const [t, sd] of [[ICE, 1], [TIGER, 2]]) {
  const zc = t.r[3] - 8;
  E.push({ t: 'wei_prop', kind: 'jars', at: [-212.5, zc + 4.6], y: t.top, seed: sd, n: 6 });
  E.push({ t: 'wei_prop', kind: 'lamp', at: [-176, zc + 4.6], y: t.top });
  E.push({ t: 'wei_prop', kind: 'bench', at: [-204, zc + 4.2], y: t.top, len: 3 });
  E.push({ t: 'wei_prop', kind: 'brazier', at: [-186, zc + 4.4], y: t.top });
}
void faceX; void POND; void POND_Y;

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
const walks = [[[-100, zOf(SPARROW)], [-141, zOf(SPARROW)], [sx + 1, zOf(SPARROW)], [-172, zOf(SPARROW)], [-180, zOf(SPARROW)], [-186, zOf(SPARROW)], [-192, zOf(SPARROW)], [tx + 3, zOf(SPARROW)], [tx + 5.5, tz - 5.0], [tx + 6.8, tz - 6.55], [tx + 0.8, tz - 6.55], [tx - 1.5, tz - 4.0], [tx - 3, tz]]];
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
