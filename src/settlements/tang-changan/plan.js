// Daci'en Temple and the Big Wild Goose Pagoda, c. 750 (docs/settlements/tang-changan.md §1, §2): the temple fills the ward east of
// Zhuque Avenue; its gate in the south wall, the court with the bell and drum towers, the Hall of the Heavenly Kings, the main hall
// on its high platform (furnished), the sutra hall and Xuanzang's translation hall at its sides, and behind it the pagoda on its
// stepped platform with the two tablets at its stair. The ward's wall and gate are the shared ward pieces.

import { DACI, DACI_AX, PAGODA, DACI_MAIN, wallRuns, gates, DAO_HALLS, GALLERIES } from './layout.js';
import { interiorRooms } from './interiors.js';

const E = [];
const [x0, z0, x1, z1] = DACI.rect, ax = DACI_AX;
// the wall and its gate
for (const r of wallRuns().filter((q) => q.ward === DACI.id)) E.push({ t: 'fang_wall', a: r.a, b: r.b, gaps: r.gaps, h: 3.6 });
for (const g of gates().filter((q) => q.ward === DACI.id)) E.push({ t: 'fang_gate', c: g.c, axis: g.axis, w: 7.6 });
// paving: the way from the gate up the courts to the hall's steps, the court's apron, the pagoda's court
const pave = (r) => E.push({ t: 'paving', rect: r, y: 0.04, th: 0.3 });
pave([ax - 5, DACI_MAIN[1] + 10.4, ax + 5, z1 - 2.0]);
pave([ax - 34, DACI_MAIN[1] + 10.4, ax - 5, 138]); pave([ax + 5, DACI_MAIN[1] + 10.4, ax + 34, 138]);
pave([ax - 34, 156, ax - 5, 190]); pave([ax + 5, 156, ax + 34, 190]);
pave([ax - 24, 98, ax + 24, DACI_MAIN[1] - 9]);
// the pagoda
E.push({ t: 'tang_pagoda', c: PAGODA, y: 0 });
// the main hall (Mahavira): seven bays on a high platform, big bracket sets, deep eaves, the Buddha and his company inside
const MH = { w: 33.6, d: 14.0 }, MAIN = [ax - MH.w / 2, DACI_MAIN[1] - MH.d / 2, ax + MH.w / 2, DACI_MAIN[1] + MH.d / 2];
E.push({ t: 'tang_hall', c: DACI_MAIN, w: MH.w, d: MH.d, face: 's', y: 0, plat: 1.2, H: 5.6, nb: 7, kind: 'hall', roof: 'hip', over: 3.2, bh: 1.9, big: true, doorW: 3.4, interior: true, det: 2, chi: 1.9, pitch: 0.24 });
E.push({ t: 'temple_interior', rect: MAIN, y: 1.2, H: 5.6, front: 's', kind: 'main' });
// the Hall of the Heavenly Kings (the gate hall of the inner court), five bays
const KH = { c: [ax, 150], w: 22.4, d: 10 };
E.push({ t: 'tang_hall', c: KH.c, w: KH.w, d: KH.d, face: 's', y: 0, plat: 0.9, H: 4.6, nb: 5, kind: 'hall', roof: 'hip', over: 2.6, bh: 1.5, doorW: 3.0, interior: true, det: 2, chi: 1.5 });
E.push({ t: 'temple_interior', rect: [KH.c[0] - KH.w / 2, KH.c[1] - KH.d / 2, KH.c[0] + KH.w / 2, KH.c[1] + KH.d / 2], y: 0.9, H: 4.6, front: 's', kind: 'guanyin' });
// the sutra hall (west) and the translation hall (east), facing the axis
for (const [s, kind] of [[-1, 'sutra'], [1, 'guanyin']]) {
  const c = [ax + s * 52, DACI_MAIN[1]], w = 22, d = 9.6, face = s < 0 ? 'e' : 'w';
  E.push({ t: 'tang_hall', c, w, d, face, y: 0, plat: 0.7, H: 4.4, nb: 5, kind: 'hall', roof: 'gable', over: 2.3, bh: 1.4, doorW: 2.6, interior: true, det: 2, chi: 1.3 });
  if (s > 0) E.push({ t: 'tang_interior', c, face, w, d, y: 0.7, kind: 'scriptorium', seed: 21 });
  else E.push({ t: 'temple_interior', rect: [c[0] - d / 2, c[1] - w / 2, c[0] + d / 2, c[1] + w / 2], y: 0.7, H: 4.4, front: face, kind });
}
// the bell and drum pavilions of the first court
E.push({ t: 'drum_tower', c: [ax - 27, 172], face: 'e' }, { t: 'drum_tower', c: [ax + 27, 172], face: 'w' });
// the tablets of Taizong and Gaozong in their pavilions at the pagoda's stair, the great censer, the stone lamps
for (const s of [-1, 1]) {
  E.push({ t: 'stele_pavilion', at: [ax + s * 14, 93], y: 0, face: [-s, 0] });
  for (const z of [142, 176]) E.push({ t: 'stone_lamp', at: [ax + s * 8, z], y: 0.04 });
}
E.push({ t: 'incense_ding', at: [ax, 128.4], y: 0.04, s: 1.5 });
// the covered galleries (cloisters) round the courts, their back walls to the ward wall, their fronts to the court; benches under them
for (const g of GALLERIES.filter((q) => q.c[1] > 0)) {
  const nb = Math.round(g.w / 3.4);
  E.push({ t: 'tang_hall', c: g.c, w: g.w, d: 4.4, face: g.face, y: 0, plat: 0.3, H: 3.4, nb, kind: 'open', roof: 'gable', over: 1.7, bh: 0.9, det: 1, steps: false, chi: 0.8 });
}
// a second censer at the pagoda's court, the stone lamps along the axis, the great bronze bell under the bell pavilion's roof
E.push({ t: 'incense_ding', at: [ax, 100.0], y: 0.04, s: 1.1 });
for (const z of [188, 100]) for (const s of [-1, 1]) E.push({ t: 'stone_lamp', at: [ax + s * 6, z], y: 0.04 });
const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [
  room('main-hall', MAIN, 1.2, 'hall'),
  room('kings-hall', [KH.c[0] - KH.w / 2, KH.c[1] - KH.d / 2, KH.c[0] + KH.w / 2, KH.c[1] + KH.d / 2], 0.9, 'hall'),
  room('sutra-hall', [ax - 52 - 4.8, DACI_MAIN[1] - 11, ax - 52 + 4.8, DACI_MAIN[1] + 11], 0.7, 'hall'),
  room('translation-hall', [ax + 52 - 4.8, DACI_MAIN[1] - 11, ax + 52 + 4.8, DACI_MAIN[1] + 11], 0.7, 'hall'),
  room('daci-en', DACI.rect, 0, 'open'),
  ...[DAO_HALLS.main, DAO_HALLS.rear, ...DAO_HALLS.side].map((h, i) => { const al = !h.face || h.face === 's'; const hw = al ? h.w : h.d, hd = al ? h.d : h.w; return room('dao-hall-' + i, [h.c[0] - hw / 2, h.c[1] - hd / 2, h.c[0] + hw / 2, h.c[1] + hd / 2], h.y, 'hall'); }),
  ...interiorRooms(),
];
const walks = [[[28, 20], [28, 210], [ax, 210], [ax, 172], [ax - 17, 172], [ax - 17, 128], [ax - 2.5, 128], [ax - 1.8, 123.5]]];
walks[0].y0 = 0;

export const temple = {
  id: 'tang-changan-daci-en',
  name: { en: 'Daci\'en Temple and the Big Wild Goose Pagoda', zh: '大慈恩寺与大雁塔' },
  era: { en: 'Tang, c. 750', zh: '唐，约750年' },
  style: 'tang',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [ax, 210], facing: 'n' },
  bounds: [x0 - 4, z0 - 4, x1 + 4, z1 + 4],
  bakeBounds: [x0 - 4, z0 - 4, x1 + 4, z1 + 4],
  view: [ax - 20, PAGODA[1] - 20, ax + 20, PAGODA[1] + 20],
  viewY: 4.2,
  bakeTop: 66,
  elements: E,
  rooms,
  walks,
};
export default temple;
