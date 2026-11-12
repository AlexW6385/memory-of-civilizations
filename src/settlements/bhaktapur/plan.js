// Taumadhi and Pottery Square, Bhaktapur about 1710 (docs/settlements/bhaktapur.md §1–§4): the Nyatapola on its five-stage plinth with its
// five pairs of guardians, the Bhairabnath, the Siddhi Lakshmi shikhara, a dabali, a pati, a stone spout, a chaitya and two pipals on the
// brick-paved square, the stalls of the market, the enterable Newar house on its south side; Pottery Square with its drying ground, wheels and kilns.

import { lots, SQ, POT, NYATAPOLA, BHAIRAB, SHI, DABALI, PATI, DHARA, CHAITYA, TREES, HOUSE, STALLS } from './layout.js';

const E = [];
const KEEP_RINGS = [[NYATAPOLA.c[0] - 8.5, NYATAPOLA.c[1] - 8.5, NYATAPOLA.c[0] + 15.5, NYATAPOLA.c[1] + 8.5], [BHAIRAB.c[0] - 11, BHAIRAB.c[1] - 6, BHAIRAB.c[0] + 6, BHAIRAB.c[1] + 6]];
E.push({ t: 'newar_paving', rect: SQ, y: 0.05, th: 0.3, mat: 'cotto_floor' });
E.push({ t: 'newar_inlay', rect: SQ, rings: KEEP_RINGS, seed: 4 });
E.push({ t: 'newar_pagoda', ...NYATAPOLA });
E.push({ t: 'newar_offerings', pagoda: NYATAPOLA, seed: 11 });
E.push({ t: 'newar_trisul', c: [BHAIRAB.c[0] - 7.4, BHAIRAB.c[1] - 4.2], s: 1 }, { t: 'newar_trisul', c: [BHAIRAB.c[0] - 7.4, BHAIRAB.c[1] + 4.2], s: 1 });
E.push({ t: 'newar_pagoda', ...BHAIRAB });
E.push({ t: 'newar_shikhara', c: SHI.c, s: 1 });
E.push({ t: 'newar_dabali', rect: DABALI, h: 0.8, stair: 'n' });
E.push({ t: 'newar_pati', rect: PATI });
E.push({ t: 'newar_dhara', ...DHARA });
E.push({ t: 'newar_chaitya', c: CHAITYA.c, s: 1 });
TREES.forEach(([x, z], i) => E.push({ t: 'newar_tree', at: [x, z], h: 9.5 + i, seed: i * 2 }));
E.push({ t: 'newar_house', ...HOUSE, open: true, detail: 2, seed: 77, light: true, trade: 'home', shop: false, dx: 4.5, pid: false });
STALLS.forEach(([x, z, yaw, kind], i) => E.push({ t: 'newar_stall', at: [x, z], yaw, kind, seed: i + 5 }));

// Pottery Square: the drying ground, the wheels along its north edge, the kilns behind them (the south-west)
const WHEELS = [[-92, 57.6], [-82, 57.6], [-72, 57.6], [-63, 57.6]];
const KILNS = [[-94, 86], [-62, 86]];
E.push({
  t: 'newar_pot_court', rect: [POT[0] + 2, POT[1] + 3.2, POT[2] - 2, POT[3] - 2.5], seed: 3,
  skip: [[-89, 84.5, -84, 92], [-75, 84.5, -69.5, 92], ...WHEELS.map(([x, z]) => [x - 1.4, z - 1, x + 1.4, z + 4]), ...KILNS.map(([x, z]) => [x - 5, z - 5, x + 5, z + 5]), [-80, 52, -76, 92]],
});
for (const [x, z] of WHEELS) E.push({ t: 'newar_wheel', c: [x, z], yaw: Math.PI });
for (const [x, z] of KILNS) E.push({ t: 'newar_kiln', c: [x, z], r: 1.8 });
E.push({ t: 'newar_yard', c: [-86.5, 88.2], seed: 1 }, { t: 'newar_yard', c: [-72.5, 88.2], seed: 2 });
export const POT_WHEELS = WHEELS, POT_KILNS = KILNS;

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const h = HOUSE.rect;
const rooms = [
  room('house', [h[0] + 0.6, h[1] + 0.6, h[2] - 0.6, h[3] - 0.6], 0.1, 'hall'),
  room('bhairabnath', [BHAIRAB.c[0] - 2.6, BHAIRAB.c[1] - 2.6, BHAIRAB.c[0] + 2.6, BHAIRAB.c[1] + 2.6], 2.7, 'hall'),
  // the lit shop-houses: a hushed room within (their ground floor and the first floor above)
  ...lots().filter((l) => l.open && l.light).map((l, i) => room('shop-' + i, [l.rect[0] + 0.6, l.rect[1] + 0.6, l.rect[2] - 0.6, l.rect[3] - 0.6], 0.1, 'hall')),
  room('taumadhi', SQ, 0.05, 'open'),
  room('pottery', POT, 0, 'open'),
];
const walks = [[[12, 6], [4, 14], [19, 22], [19, 28], [10, 6], [14, 9], [22, 9.5], [28, 8], [10, 22]]];
walks[0].y0 = 0;
// up the stair of the enterable house to its first floor and about it
walks.push([[19, 22], [17.5, 25.4], [17.5, 28.2], [20, 29.6], [22, 27], [20, 26.2]]);
walks[1].y0 = 0;

export const taumadhi = {
  id: 'bhaktapur-taumadhi',
  name: { en: 'Taumadhi square and the Nyatapola', zh: '陶玛迪广场与尼亚塔波拉塔' },
  era: { en: 'Malla Nepal, c. 1710', zh: '马拉王朝尼泊尔，约1710年' },
  style: 'newar',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [16, 6], facing: 'n' },
  bounds: [POT[0] - 4, SQ[1] - 4, SQ[2] + 4, POT[3] + 4],
  bakeBounds: [SQ[0] - 4, SQ[1] - 4, SQ[2] + 4, HOUSE.rect[3] + 4],
  view: [-18, -24, 8, -4],
  bakeTop: 34,
  elements: E,
  rooms,
  walks,
};
export default taumadhi;
