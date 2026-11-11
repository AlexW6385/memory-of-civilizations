// The Weiyang Palace's front hall, c. 100 BC (docs/settlements/han-changan.md §2, §4): the three-tiered rammed-earth terrace with its
// central ramp-stair, the Front Hall on its crown (nine bays, hipped roof, round eave tiles, throne dais, the court's mats and tables),
// the two side chambers, the palace's east gate with its pair of que, the Changle Palace's hall on its low terrace.
// Authored in world coordinates (origin 0, yaw 0). The hall faces south.

import { AX, TIERS, CROWN, RAMP, HALL, SIDE_HALLS, EAST_GATE, PALACE, CHANGLE_HALL, PALACE_WALL } from './layout.js';

const E = [];
E.push({ t: 'han_terrace', tiers: TIERS, ramp: { x: RAMP.x, z0: RAMP.z0, z1: RAMP.z1 } });
E.push({ t: 'han_hall', cx: AX, z1: HALL.z1, bays: HALL.bays, bayW: HALL.bayW, depth: HALL.depth, depthW: HALL.depthW, floor: HALL.floor, base: HALL.base, h: HALL.h, roof: 'hip', rise: 6.6, rafters: true, furnish: 'throne', open: [3, 5], seed: 3 });
for (const [i, [cx]] of SIDE_HALLS.entries()) {
  E.push({ t: 'han_hall', cx: cx + (i ? -2 : 2), z1: HALL.z1, bays: 3, bayW: 6, depth: 2, depthW: 7, floor: CROWN + 0.6, base: 0.6, h: 5.6, roof: 'hip', rise: 4.2, overhang: 2.6, ap: 1.0, furnish: 'court', open: [1, 1], seed: 11 + i });
}
// the Changle Palace's hall on its low terrace (one tier, a ramp)
const CH = CHANGLE_HALL;
E.push({ t: 'han_terrace', tiers: [{ r: [CH.cx - 36, CH.z1 - 38, CH.cx + 36, CH.z1 + 18], top: 2.5 }], ramp: { x: [CH.cx - 4, CH.cx + 4], z0: CH.z1 + 18, z1: CH.z1 + 28 } });
E.push({ t: 'han_hall', cx: CH.cx, z1: CH.z1, bays: 7, bayW: 6, depth: 3, depthW: 6, floor: 3.1, base: 0.6, h: 6.4, roof: 'hip', rise: 5.2, overhang: 3.0, furnish: 'court', open: [2, 4], seed: 21 });
// the east gate of the palace: the gate in the wall, a pair of que outside it
const wx = PALACE[2], gz = EAST_GATE.z;
for (const [dz, s] of [[-14, 1], [14, -1]]) E.push({ t: 'han_que', at: [wx + PALACE_WALL.th / 2 + 6, gz + dz], sub: [0, s], h: 11 });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const fh = [AX - HALL.w / 2, HALL.z0, AX + HALL.w / 2, HALL.z1];
const rooms = [
  room('front-hall', fh, HALL.floor, 'hall'),
  room('west-chamber', [AX - 55, HALL.z1 - 14, AX - 37, HALL.z1], CROWN + 0.6, 'hall'),
  room('east-chamber', [AX + 37, HALL.z1 - 14, AX + 55, HALL.z1], CROWN + 0.6, 'hall'),
  room('changle-hall', [CH.cx - 21, CH.z1 - 18, CH.cx + 21, CH.z1], 3.1, 'hall'),
  room('forecourt', [AX - 80, RAMP.z1, AX + 80, 100], 0, 'open'),
];
// the way in: the forecourt, up the ramp-stair to the crown, across the apron and the steps, into the hall, up the aisle to the dais
const walks = [[[AX, 60], [AX, -60], [AX, -90], [AX, -110], [AX, -127], [AX, -140], [AX, -160], [AX, -166], [AX, -172], [AX, -184]]];
walks[0].y0 = 0;

export const weiyang = {
  id: 'han-changan-weiyang',
  name: { en: 'Weiyang Palace: the Front Hall', zh: '未央宫前殿' },
  era: { en: 'Western Han, c. 100 BC', zh: '西汉，约公元前100年' },
  style: 'han',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [AX, 60], facing: 'n' },
  bounds: [PALACE[0], PALACE[1], 420, PALACE[3]],
  bakeBounds: [AX - 70, -215, AX + 70, -115],
  view: [AX - 70, -215, AX + 70, -100],
  bakeTop: 30,
  bakeSpacing: 1.2,
  elements: E,
  rooms,
  walks,
};
export default weiyang;
