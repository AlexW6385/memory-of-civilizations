// Tōdai-ji in 752 (docs/settlements/nara.md §2–§4): the Great Buddha Hall, the corridors round its
// court, the Middle Gate, the Great South Gate, the two seven-storey pagodas in their courts, the
// lecture hall and the monks' quarters.

import { HALL, COURT, SOUTH_GATE, PAGODAS } from './layout.js';

const E = [];
// the Great Buddha Hall: eleven bays by seven, two roofs, about 49 m high to the ridge (§1)
E.push({ t: 'nara_hall', rect: HALL, y: 2.2, H: 21, bays: [11, 7], k: 1.8, colD: 1.5, plat: 2.2, walls: 'full', doors: { s: [3, 4, 5, 6, 7], n: [5], e: [3], w: [3] }, doorH: 13, upper: { H: 6.5, ins: 7.14, k: 1.4 }, rise: 11, top: 50, shibi: 6 });
E.push({ t: 'stairs', rect: [-6, HALL[3] + 0.9, 6, HALL[3] + 6], y0: 0, y1: 2.2, dir: 'n' });
// the corridors round the court, the Middle Gate in the south side
const [cx0, cz0, cx1, cz1] = COURT, g = 16;
E.push({ t: 'ming_gallery', pts: [[-g, cz1], [cx0, cz1], [cx0, cz0], [cx1, cz0], [cx1, cz1], [g, cz1]], y: 0.5, w: 6, H: 4.6, side: 1 });
E.push({ t: 'nara_hall', rect: [-g + 1, cz1 - 7, g - 1, cz1 + 7], y: 1.0, H: 6.5, bays: [5, 2], k: 1.1, colD: 0.8, plat: 1.0, walls: 'ends', shibi: 2.4, rise: 4.5 });
// the Great South Gate
E.push({ t: 'nara_hall', rect: SOUTH_GATE, y: 0.8, H: 8, bays: [5, 2], k: 1.3, colD: 0.95, plat: 0.8, walls: 'ends', shibi: 3, rise: 6 });
// the guardian kings in the Great South Gate's outer bays, facing each other across the passage:
// the open-mouthed "a" on the west (the visitor's left), the closed-mouthed "un" on the east (§4)
E.push({ t: 'obj', kind: 'nio', form: 'a', at: [-12, (SOUTH_GATE[1] + SOUTH_GATE[3]) / 2], y: 0.8, h: 5.7, dir: [1, 0] });
E.push({ t: 'obj', kind: 'nio', form: 'un', at: [12, (SOUTH_GATE[1] + SOUTH_GATE[3]) / 2], y: 0.8, h: 5.7, dir: [-1, 0] });
// steps up to both gates' platforms (each 0.9 m out beyond the posts) on the axis, front and back
for (const [r, y] of [[[-g + 1, cz1 - 7, g - 1, cz1 + 7], 1.0], [SOUTH_GATE, 0.8]]) {
  const run = y * 3.2;
  E.push({ t: 'stairs', rect: [-6, r[3] + 0.9, 6, r[3] + 0.9 + run], y0: 0, y1: y, dir: 'n' });
  E.push({ t: 'stairs', rect: [-6, r[1] - 0.9 - run, 6, r[1] - 0.9], y0: 0, y1: y, dir: 's' });
}
// the pagodas: seven storeys each, in square courts of corridors
for (const [px, pz] of PAGODAS) {
  // square, three bays a side, seven storeys narrowing upward, the spire of nine rings (§4)
  E.push({ t: 'pagoda_jp', c: [px, pz], y: 0, base: { half: 12, h: 1.6 }, side: 16.8, shrink: 1.15, tiers: 7, h0: 5.6, dh: 0.3, over: 5.2, spire: 16 });
  E.push({ t: 'ming_gallery', pts: [[px - 8, pz + 32], [px - 32, pz + 32], [px - 32, pz - 32], [px + 32, pz - 32], [px + 32, pz + 32], [px + 8, pz + 32]], y: 0.4, w: 4.5, H: 3.8, side: 1 });
}
// the lecture hall and the monks' quarters to the north
E.push({ t: 'qing_hall', rect: [-36, -165, 36, -140], y: 1.4, H: 10, roof: 'xieshan', bays: [9, 4], front: 's', four: true, plat: 1.4 });
for (const s of [-1, 1]) for (let k = 0; k < 3; k++) E.push({ t: 'ming_hall', rect: s < 0 ? [-140, -175 + k * 26, -60, -160 + k * 26] : [60, -175 + k * 26, 140, -160 + k * 26], y: 0.6, H: 4.6, roof: 'gable', bays: [12, 2], front: 's', plat: 0.6 });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('court', COURT, 0, 'open'), room('great buddha hall', HALL, 2.2, 'hall')];
// the octagonal gilt-bronze lantern on the axis before the hall's stairs (§4)
E.push({ t: 'obj', kind: 'hakkaku_toro', at: [0, -16], y: 0 });
const walks = [[[0, 180], [0, 146], [0, 60], [0, 40], [0, -8], [2.8, -12], [2.8, -20]]];
walks[0].y0 = 0;

export const todaiji = {
  id: 'nara-todaiji',
  name: { en: 'Tōdai-ji', zh: '东大寺' },
  era: { en: 'Nara Japan, 752', zh: '奈良时代，752年' },
  style: 'nara',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [0, 180], facing: 'n' },
  bounds: [-160, -185, 160, 160],
  view: [-50, -92, 50, -28],
  bakeTop: 50,
  elements: E,
  rooms,
  walks,
};
export default todaiji;
