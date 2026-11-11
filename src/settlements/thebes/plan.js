// The Karnak axis, c. 1250 BC (docs/settlements/thebes.md §2, §4, §5): the Great Hypostyle Hall of Seti I and Ramesses II between
// the second and third pylons, the pylons with their flagstaffs and banners, the obelisks of Thutmose I and Hatshepsut in the
// narrow courts beyond. Authored in a local frame with the axis along −z (the hall's astronomical ceilings and the flying vultures
// run that way); the plan's yaw of 90° sets it along the world's +x: world x = −lz, world z = lx.

import { PYLON2, HALL, PYLON3, OBELISK1, PYLON4, OBELISK2, PYLON5, PYLON6 } from './layout.js';

const E = [];
const P = (p, half, o = {}) => E.push({ t: 'nk_pylon', z0: -p.x1, z1: -p.x0, half, h: p.h, ...o });
// the hall: z0 = the east end (x = −45), z1 = the entrance (x = −98)
E.push({ t: 'nk_hall', z0: -HALL.x1, z1: -HALL.x0, half: 52, wall: HALL.wall });
P(PYLON2, 56, { g: 5, gateH: 21, flags: true, poleH: 44, colossi: 11 });
P(PYLON3, 55, { g: 5, gateH: 19 });
P(PYLON4, PYLON4.half, { g: 4, gateH: 15, flags: true, poleH: 33 });
P(PYLON5, PYLON5.half, { g: 4, gateH: 13, flags: true, poleH: 28 });
P(PYLON6, PYLON6.half, { g: 3.4, gateH: 11, flags: true, poleH: 24, simple: false });
for (const z of OBELISK1.zs) E.push({ t: 'nk_obelisk', at: [z, -OBELISK1.x], h: OBELISK1.h });
for (const z of OBELISK2.zs) E.push({ t: 'nk_obelisk', at: [z, -OBELISK2.x], h: OBELISK2.h });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [
  room('hall', [-55, -HALL.x1, 55, -HALL.x0], 0, 'hall'),
  room('obelisk-court', [-36, -PYLON4.x0 + 2, 36, -PYLON3.x0 - 2], 0, 'open'),
  room('narrow-court', [-28, -PYLON5.x0 + 2, 28, -PYLON4.x1 - 2], 0, 'open'),
];
// the way along the axis: from the avenue in, through the second pylon's gate and the hall, the third pylon, between the obelisks, on
const at = (x, z) => [z, -x];
const walks = [[at(-150, 0), at(-114, 0), at(-100, 0), at(-70, 0), at(-46, 0), at(-30, 0), at(-14, 0), at(-6, 0), at(3, 0), at(8, 0), at(14, 0), at(22, 0)]];
walks[0].y0 = 0;

export const karnak = {
  id: 'thebes-karnak',
  name: { en: 'Karnak: the Great Hypostyle Hall', zh: '卡纳克：大柱厅' },
  era: { en: '19th dynasty, c. 1250 BC', zh: '第十九王朝，约公元前1250年' },
  style: 'newkingdom',
  origin: [0, 0], base: 0, yaw: 90,
  entrance: { at: [0, 170], facing: 'n' },
  bounds: [-64, -40, 64, 130],
  bakeBounds: [-60, 24, 60, 116],
  view: [-60, -40, 60, 125],
  bakeTop: 25,
  bakeSpacing: 0.8,
  elements: E,
  rooms,
  walks,
};
export default karnak;
