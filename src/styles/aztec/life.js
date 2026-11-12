// People of Tenochtitlan as still figures (docs/settlements/tenochtitlan.md §13): `mx_people` places a
// list of them — black-robed priests with their hair long, men in the white cotton cape (tilmatli)
// and loincloth, women in the long skirt, farmers with the digging stick (coa) on the chinampas.

import { STYLES } from '../../core/build.js';
import '../../objects/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/**
 * mx_people { people: [[x, z, y, rot, who, seed]] }: who 'priest' | 'priest_censer' (with the long-handled
 * censer) | 'drummer' | 'worshipper' (kneeling) | 'man' | 'woman' | 'bearer' (a load on the head) |
 * 'farmer' (the coa) | 'planter' (squatting at the furrow). rot turns the figure, which faces −z at 0.
 */
export function mxPeople(el, ctx) {
  const L = STYLES.life.elements;
  for (const [x, z, y, rot, who, seed, extra] of el.people) {
    const r = rng(seed);
    const base = { at: [x, z], y, rot, seed, dress: 'tunic', legs: 'bare', feet: 'bare', skin: r() < 0.5 ? 'skin_medium' : 'skin_dark', hair: 'long', hairMat: 'hide_black', beard: false };
    if (who === 'priest' || who === 'priest_censer' || who === 'drummer') {
      L.figure({ ...base, dress: 'robe', cloth: 'cloth_black', over: 'none', ...(who === 'priest_censer' ? { carry: 'staff', len: 1.1, staffMat: 'terracotta' } : {}), ...(who === 'drummer' ? { pose: 'stand', arms: 'talk' } : {}) }, ctx);
    } else if (who === 'worshipper') L.figure({ ...base, dress: 'wrap', top: 'bare', cloth: 'cloth_white', pose: 'kneel', arms: 'pray', over: 'none' }, ctx);
    else if (who === 'woman') L.figure({ ...base, dress: 'robe', cloth: 'cloth_white', cloth2: r() < 0.5 ? 'cloth_red' : 'cloth_ochre', over: 'none', hair: 'bun', carry: r() < 0.4 ? 'basket' : 'none' }, ctx);
    else if (who === 'bearer') L.figure({ ...base, dress: 'loincloth', cloth: 'cloth_white', carry: r() < 0.5 ? 'basket' : 'pot', hair: 'short' }, ctx);
    else if (who === 'farmer') L.figure({ ...base, dress: 'loincloth', cloth: 'cloth_white', carry: 'hoe', hair: 'short' }, ctx);
    else if (who === 'planter') L.figure({ ...base, dress: 'loincloth', cloth: 'cloth_white', pose: 'squat', hair: 'short' }, ctx);
    // the trades at their work and the others of the lanes (docs/settlements/tenochtitlan.md §15)
    else if (who === 'weaver') L.figure({ ...base, dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_red', over: 'none', hair: 'bun', pose: 'kneel', ...extra }, ctx);
    else if (who === 'potter') L.figure({ ...base, dress: 'loincloth', cloth: 'cloth_brown', pose: 'squat', hair: 'short', ...extra }, ctx);
    else if (who === 'seller') L.figure({ ...base, dress: 'robe', cloth: r() < 0.5 ? 'cloth_white' : 'cloth_ochre', cloth2: 'cloth_red', over: 'none', hair: 'bun', pose: 'sit_ground', ...extra }, ctx);
    else if (who === 'cook') L.figure({ ...base, dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_ochre', over: 'none', hair: 'bun', pose: 'kneel', ...extra }, ctx);
    else if (who === 'fisher') L.figure({ ...base, dress: 'loincloth', cloth: 'cloth_white', carry: 'staff', len: 2.0, staffMat: 'timber', hair: 'short', ...extra }, ctx);
    else if (who === 'mason') L.figure({ ...base, dress: 'loincloth', cloth: 'cloth_white', pose: 'kneel', hair: 'short', ...extra }, ctx);
    else if (who === 'featherer') L.figure({ ...base, dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_indigo', over: 'cape', pose: 'cross', hair: 'short', ...extra }, ctx);
    else if (who === 'sweeper') L.figure({ ...base, dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_ochre', over: 'none', hair: 'bun', carry: 'besom', ...extra }, ctx);
    else if (who === 'washer') L.figure({ ...base, dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_red', over: 'none', hair: 'bun', pose: 'squat', ...extra }, ctx);
    else if (who === 'child') L.figure({ ...base, dress: 'loincloth', cloth: 'cloth_white', child: true, hair: 'short', ...extra }, ctx);
    else if (who === 'guard') L.figure({ ...base, dress: 'tunic', cloth: 'cloth_ochre', cloth2: 'cloth_red', over: 'cape', carry: 'staff', len: 1.9, staffMat: 'timber', hair: 'short', ...extra }, ctx);
    else if (who === 'noble') L.figure({ ...base, dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_indigo', over: 'cape', hair: 'short', skin: 'skin_medium', ...extra }, ctx);
    else L.figure({ ...base, cloth: 'cloth_white', cloth2: 'cloth_white', over: 'cape', pose: r() < 0.5 ? 'talk' : 'stand', hair: 'short', ...extra }, ctx);
  }
}
