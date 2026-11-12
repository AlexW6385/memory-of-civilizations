// Ubirr about AD 1000 (docs/settlements/kakadu.md §1–§6): the outlier's blocks, the Main Gallery and the small shelter with their painted
// walls and ceilings, the rock steps to the lookout, boulders at the foot.
import { MAIN, SMALL, BLOCKS, FLIGHTS, height, rng, inRect, TRACKS, ROUTE } from './layout.js';
import '../../styles/kakadu/index.js';
import { faceSpots } from '../../styles/kakadu/outcrop.js';

const E = [];
E.push({ t: 'ka_rock' }, { t: 'ka_gallery' }, { t: 'ka_steps' });
// boulders fallen at the foot of the south faces, clear of the shelters' mouths, the steps and the way along the foot
{
  const rand = rng(404), list = [];
  for (let k = 0; k < 1600 && list.length < 64; k++) {
    const x = -80 + rand() * 164, z = -36 + rand() * 14, s = 0.5 + rand() ** 2 * 1.9;
    const onRock = BLOCKS.some((B) => inRect(B.r, x, z, s + 0.5));
    const mouth = inRect([MAIN.x0 - 5, MAIN.zb, MAIN.x1 + 5, MAIN.zl + 12], x, z) || inRect([SMALL.x0 - 4, SMALL.zb, SMALL.x1 + 4, SMALL.zl + 10], x, z);
    const way = FLIGHTS.some((F) => inRect(F.rect, x, z, 5)) || z > -23;
    if (onRock || mouth || way || list.some((b) => Math.hypot(b[0] - x, b[1] - z) < 3.6 + (b[2] + s) * 0.6)) continue;
    list.push([x, z, s]);
  }
  // slabs shed from the roof's lip and the piers, lying on the apron where people sit by the camps
  for (const q of [[-5.8, -24.2, 0.8], [5.6, -24.6, 0.75], [-19.5, -23.6, 0.9], [18.5, -24.2, 0.8], [-29.5, -24.5, 1.1], [29.5, -24, 1.0]]) list.push(q);
  // rock falls: at the foot of each open cleft a heap of the blocks that came out of it, and a slab leaning on the face beside it
  const rr = rng(405);
  for (const sp of faceSpots()) {
    if (sp.kind !== 'cleft') continue;
    for (let k = 0; k < 4; k++) {
      const s = k === 0 ? 1.2 + rr() * 0.8 : 0.45 + rr() * 0.8, x = sp.x + (rr() - 0.5) * 4.5, z = sp.z + 1.8 + rr() * 3.2;
      if (z > -23 || BLOCKS.some((B) => inRect(B.r, x, z, s * 0.6)) || FLIGHTS.some((F) => inRect(F.rect, x, z, 4)) || inRect([MAIN.x0 - 5, MAIN.zb, MAIN.x1 + 5, MAIN.zl + 12], x, z) || inRect([SMALL.x0 - 4, SMALL.zb, SMALL.x1 + 4, SMALL.zl + 10], x, z)) continue;
      if (list.some((b) => Math.hypot(b[0] - x, b[1] - z) < 1.6 + (b[2] + s) * 0.55)) continue;
      list.push([x, z, s]);
    }
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
const walks = [Object.assign(ROUTE.map((p) => [...p]), { y0: height(mx, -14) })];

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
