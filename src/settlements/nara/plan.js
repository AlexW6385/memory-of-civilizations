// Tōdai-ji in 752 (docs/settlements/nara.md §2–§4): the Great Buddha Hall, the corridors round its
// court, the Middle Gate, the Great South Gate, the two seven-storey pagodas in their courts, the
// lecture hall and the monks' quarters.

import { HALL, COURT, SOUTH_GATE, PAGODAS } from './layout.js';

const E = [];
// the Great Buddha Hall: eleven bays by seven, two roofs
E.push({ t: 'qing_hall', rect: HALL, y: 2.2, H: 15, double: 11, roof: 'hip', bays: [11, 7], front: 's', four: true, plat: 2.2, open: true });
E.push({ t: 'stairs', rect: [-6, HALL[3] + 0.9, 6, HALL[3] + 6], y0: 0, y1: 2.2, dir: 'n' });
// the corridors round the court, the Middle Gate in the south side
const [cx0, cz0, cx1, cz1] = COURT, g = 16;
E.push({ t: 'ming_gallery', pts: [[-g, cz1], [cx0, cz1], [cx0, cz0], [cx1, cz0], [cx1, cz1], [g, cz1]], y: 0.5, w: 6, H: 4.6, side: 1 });
E.push({ t: 'qing_hall', rect: [-g + 1, cz1 - 7, g - 1, cz1 + 7], y: 1.0, H: 7, double: 5, roof: 'xieshan', bays: [5, 2], front: 's', four: true, plat: 1.0, open: true });
// the Great South Gate
E.push({ t: 'qing_hall', rect: SOUTH_GATE, y: 0.8, H: 9, double: 7, roof: 'hip', bays: [5, 2], front: 's', four: true, plat: 0.8, open: true });
// the pagodas: seven storeys each, in square courts of corridors
for (const [px, pz] of PAGODAS) {
  const tiers = []; for (let i = 0; i < 7; i++) tiers.push({ r: 8.5 - i * 0.55, h: i === 0 ? 11 : 8.4 - i * 0.2 });
  E.push({ t: 'pagoda_oct', c: [px, pz], y: 0, base: { r: 11, h: 1.6 }, tiers, galleries: false, core: 'plaster_white', eave: 'tile_grey', frame: 'timber_red', spire: 14 });
  E.push({ t: 'ming_gallery', pts: [[px - 8, pz + 32], [px - 32, pz + 32], [px - 32, pz - 32], [px + 32, pz - 32], [px + 32, pz + 32], [px + 8, pz + 32]], y: 0.4, w: 4.5, H: 3.8, side: 1 });
}
// the lecture hall and the monks' quarters to the north
E.push({ t: 'qing_hall', rect: [-36, -165, 36, -140], y: 1.4, H: 10, roof: 'xieshan', bays: [9, 4], front: 's', four: true, plat: 1.4 });
for (const s of [-1, 1]) for (let k = 0; k < 3; k++) E.push({ t: 'ming_hall', rect: s < 0 ? [-140, -175 + k * 26, -60, -160 + k * 26] : [60, -175 + k * 26, 140, -160 + k * 26], y: 0.6, H: 4.6, roof: 'gable', bays: [12, 2], front: 's', plat: 0.6 });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('court', COURT, 0, 'open'), room('great buddha hall', HALL, 2.2, 'hall')];
const walks = [[[0, 180], [0, 146], [0, 60], [0, 40], [0, -20]]];
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
