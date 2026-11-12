// The Registan c. 1420 (docs/settlements/timurid-samarkand.md §2): the open square where the trade streets meet, Ulugh
// Beg's madrasa on its west side with its pishtaq, minarets, court and cells (the north-east corner hall a furnished
// classroom), the khanqah on the east, the rows of shops on the north and south. The other monuments are in town.js.

import { SQUARE, MADRASA, KHANQAH, SHOPS_N, SHOPS_S } from './layout.js';

const E = [];
E.push({ t: 'tim_madrasa', rect: MADRASA });
E.push({ t: 'khanqah', rect: KHANQAH.rect });
E.push({ t: 'shop_row', rect: SHOPS_N, front: 's', unit: 3.6, enter: 8, seed: 14 });
E.push({ t: 'shop_row', rect: SHOPS_S, front: 'n', unit: 3.6, enter: 17, seed: 15 });

// the market on the square: two rows of stalls under awnings, goods spread on mats between them and the shops
{
  const kinds = ['melon', 'pots', 'cloth', 'bread', 'copper', 'carpets', 'fruit'], stalls = [], spreads = [];
  for (let i = 0; i < 16; i++) { const x = -34 + i * 3.9; stalls.push([x, -34, 0, kinds[(i * 3) % 7]], [x + 1.2, 34, Math.PI, kinds[(i * 5 + 2) % 7]]); }
  const sk = ['melon', 'pots', 'grain', 'fruit', 'melon'];
  for (let i = 0; i < 10; i++) { spreads.push([-33 + i * 5.2, -26.5, (i % 3) * 0.2, sk[i % 5]], [-31 + i * 5.2, 26.5, Math.PI + (i % 3) * 0.2, sk[(i + 2) % 5]]); }
  E.push({ t: 'tim_market', rect: SQUARE, seed: 5, stalls, spreads });
}
const [mx0, mz0, mx1, mz1] = MADRASA, zm = (mz0 + mz1) / 2;
const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [
  room('registan', SQUARE, 0, 'open'),
  room('madrasa court', [-107, -18, -59, 18], 0, 'open'),
  room('classroom', [-58, -25.6, -47.4, -18.5], 0, 'hall'),
  room('pishtaq passage', [-59, zm - 6, -45, zm + 6], 0, 'hall'),
];
const walks = [[[40, 0], [0, 0], [-40, 0], [-52, 0], [-66, 0], [-83, 0]]];
walks[0].y0 = 0;

export const registan = {
  id: 'samarkand-registan',
  name: { en: 'The Registan and the Ulugh Beg Madrasa', zh: '雷吉斯坦广场与兀鲁伯经学院' },
  era: { en: 'Timurid, c. 1420', zh: '帖木儿王朝，约1420年' },
  style: 'timurid',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [14, 0], facing: 'w' },
  bounds: [mx0 - 8, -62, KHANQAH.rect[2] + 8, 62],
  bakeBounds: [mx0 - 4, -56, KHANQAH.rect[2] + 4, 56],
  view: [-60, -30, 60, 30],
  bakeTop: 40,
  elements: E,
  rooms,
  walks,
};
export default registan;
void mx1;
