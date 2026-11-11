// Ubirr about AD 1000 (docs/settlements/kakadu.md §1–§6): the outlier's blocks, the Main Gallery and the small shelter with their painted
// walls and ceilings, the rock steps to the lookout, boulders at the foot.
import { MAIN, SMALL, BLOCKS, FLIGHTS, height, rng, inRect, TRACKS } from './layout.js';
import '../../styles/kakadu/index.js';

const E = [];
E.push({ t: 'ka_rock' }, { t: 'ka_gallery' }, { t: 'ka_steps' });
// boulders fallen at the foot of the south faces, clear of the shelters' mouths, the steps and the way along the foot
{
  const rand = rng(404), list = [];
  for (let k = 0; k < 400 && list.length < 34; k++) {
    const x = -78 + rand() * 160, z = -34 + rand() * 20, s = 0.5 + rand() ** 2 * 1.5;
    const onRock = BLOCKS.some((B) => inRect(B.r, x, z, s + 0.5));
    const mouth = inRect([MAIN.x0 - 5, MAIN.zb, MAIN.x1 + 5, MAIN.zl + 12], x, z) || inRect([SMALL.x0 - 4, SMALL.zb, SMALL.x1 + 4, SMALL.zl + 10], x, z);
    const way = FLIGHTS.some((F) => inRect(F.rect, x, z, 5)) || z > -23;
    if (onRock || mouth || way || list.some((b) => Math.hypot(b[0] - x, b[1] - z) < 5)) continue;
    list.push([x, z, s]);
  }
  E.push({ t: 'ka_boulders', list });
}
const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [
  room('main', [MAIN.x0 - 1, MAIN.zb + 0.3, MAIN.x1 + 1, MAIN.zl], MAIN.floor, 'hall'),
  room('small', [SMALL.x0 - 1, SMALL.zb + 0.3, SMALL.x1 + 1, SMALL.zl], SMALL.floor, 'hall'),
  room('floodplain', [-85, -22, 85, 85], 0, 'open'),
];
const mx = (MAIN.x0 + MAIN.x1) / 2;
const walks = [Object.assign([[mx, -14], [mx, -27], [mx - 10, -31], [mx + 10, -31], [30, -17], [34, -6], [41.2, -5], [41.2, -23], [47.2, -23], [47.2, -36], [47.2, -38], [59.2, -38], [59.2, -49], [59, -58]], { y0: height(mx, -14) })];

export const ubirr = {
  id: 'kakadu-ubirr',
  name: { en: 'Ubirr', zh: '乌比尔' },
  era: { en: 'Late Freshwater period, about AD 1000', zh: '淡水期晚期，约公元1000年' },
  style: 'kakadu',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [mx, -14], facing: 's' },
  bounds: [-85, -76, 85, 4],
  bakeBounds: [-70, -45, 45, -10],
  view: [-60, -45, 60, -10],
  bakeTop: 22,
  elements: E,
  rooms,
  walks,
};
void TRACKS;
export default ubirr;
