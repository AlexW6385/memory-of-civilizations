// Foguang Monastery in 857 (docs/settlements/tang-wutai.md §2–§4, §10): the Great East Hall with its
// terraces and courtyard (the full building of the previous design, src/buildings/foguang-east-hall);
// the dhāraṇī pillar of 857 before the hall and the founding master's pagoda south of it, rebuilt in
// detail here (the hall plan's simple stand-ins for them are left out); the monks of the monastery.

import { HALL } from './layout.js';
import hallPlan from '../../buildings/foguang-east-hall/plan.js';

const T = 13;                                   // the upper terrace (hall plan, y above the courtyard)
const at = (x, z) => [HALL.origin[0] + x, HALL.origin[1] + z];   // a point of the hall plan in the settlement
export const PILLAR = at(-22, -8), ZUSHI = at(6, 32);

export const pagoda = {
  id: 'tang-wutai-stones', style: 'song', origin: [0, 0], base: 0, yaw: 0, feature: true,
  entrance: { at: [ZUSHI[0] - 6, ZUSHI[1]], facing: 'e' }, bounds: [PILLAR[0] - 2, PILLAR[1] - 2, ZUSHI[0] + 3, ZUSHI[1] + 3], rooms: [],
  elements: [
    { t: 'tang_dharani', at: PILLAR, y: T, h: 3.24 },
    { t: 'zushi_pagoda', at: ZUSHI, y: T, door: 'w' },
  ],
};

/** The monks (dark robes, the reddish-brown kasaya, shaven heads) about the courtyard and terraces, and a few lay pilgrims. */
function monks() {
  const L = [], faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);
  let seed = 857;
  const monk = (p, y, dir, extra = {}) => L.push({ t: 'figure', at: at(...p), y, rot: faceTo(dir), seed: seed++ * 7919, dress: 'robe', cloth: seed % 3 ? 'cloth_black' : 'cloth_grey', cloth2: 'cloth_brown', skin: 'skin_light', hat: 'cap', hatMat: 'skin_light', carry: 'none', pose: 'stand', ...extra });
  const lay = (p, y, dir, extra = {}) => L.push({ t: 'figure', at: at(...p), y, rot: faceTo(dir), seed: seed++ * 7919, dress: 'robe', cloth: 'cloth_indigo', cloth2: 'cloth_white', skin: 'skin_light', hat: 'brim', carry: 'none', pose: 'stand', ...extra });
  // at the pillar, reading the record of the hall; at the old pagoda, one bowing to the master's tomb, a pilgrim with an offering
  monk([-23.4, -8], T, [1, 0]); monk([-22.2, -6.3], T, [0, -1], { pose: 'talk' });
  monk([3.0, 32.3], T, [1, 0]); lay([3.2, 30.8], T, [1, 0.3], { carry: 'basket' });
  // on the hall's platform at the door, looking out down the valley
  monk([-12.2, 6.2], T + 1, [-1, 0]);
  // on the middle terrace and in the courtyard: monks walking and talking, pilgrims come up from the village
  monk([-50, -9], 6.5, [1, 0], { pose: 'talk' }); monk([-49.2, -8.4], 6.5, [-1, -0.4]);
  monk([-44, 14], 6.5, [0, -1]);
  monk([-96, -14], 0, [0, 1], { pose: 'talk' }); monk([-95.4, -13.2], 0, [-0.6, -1]);
  lay([-100, 6], 0, [1, 0]); lay([-101, 7.2], 0, [1, 0], { cloth: 'cloth_brown', hat: 'none', dress: 'trousers', carry: 'pole' });
  monk([-86, 20], 0, [-1, 0]);
  return { id: 'tang-wutai-monks', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: L, rooms: [], bounds: [-360, -360, 360, 360], entrance: { at: [-80, 0], facing: 'e' } };
}
export const people = monks();

export const hall = { ...hallPlan, elements: hallPlan.elements.filter((e) => !(e.t === 'obj' && (e.kind === 'pagoda' || e.kind === 'dharani_pillar'))), origin: HALL.origin, base: 0, district: undefined, view: [HALL.origin[0] - 14, -20, HALL.origin[0] + 11, 20], viewY: 13 };
export default hall;
