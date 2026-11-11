// The Wenchang Hall of Ye (文昌殿), the centrepiece of Cao Cao's palace (docs/settlements/wei-ye.md §4.1): the hall of nine bays on its low rammed-earth
// terrace with the ramp-stair, the throne dais and the court's mats, the side halls, the corridors of the forecourt, the Wei king's gate. Faces south.
import { WENCHANG, W_TERRACE, W_RAMP, PALACE } from './layout.js';

const E = [];
E.push({ t: 'wei_terrace', r: W_TERRACE.r, top: W_TERRACE.top, batter: 0.4, lifts: 1, stair: { rect: [W_RAMP.x[0], W_RAMP.z0 - 0.4, W_RAMP.x[1], W_RAMP.z1], dir: 'n', riser: 0.2 } });
E.push({ t: 'han_hall', cx: WENCHANG.cx, z1: WENCHANG.z1, bays: WENCHANG.bays, bayW: WENCHANG.bayW, depth: WENCHANG.depth, depthW: WENCHANG.depthW, floor: WENCHANG.floor, base: WENCHANG.base, h: WENCHANG.h, roof: 'hip', rise: 6.0, rafters: true, furnish: 'throne', open: [3, 5], seed: 3 });
const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [
  room('wenchang', [-WENCHANG.w / 2, WENCHANG.z0, WENCHANG.w / 2, WENCHANG.z1], WENCHANG.floor, 'hall'),
  room('forecourt', [-45, -37, 45, -10], 0, 'open'),
];
const walks = [[[0, 5], [0, -30], [0, -40], [0, -50], [0, -57], [0, -64], [0, -76]]];
walks[0].y0 = 0;
export const wenchang = {
  id: 'wei-ye-wenchang',
  name: { en: 'The Wenchang Hall', zh: '文昌殿' },
  era: { en: 'Wei, c. AD 215', zh: '曹魏，约公元215年' },
  style: 'wei',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [0, 5], facing: 'n' },
  bounds: [PALACE[0], PALACE[1], PALACE[2], 40],
  bakeBounds: [-55, -105, 55, -35],
  view: [-55, -105, 55, -25],
  bakeTop: 22,
  bakeSpacing: 1.2,
  elements: E,
  rooms,
  walks,
};
export default wenchang;
