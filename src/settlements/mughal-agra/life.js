// The life of the Taj complex about 1653 (docs/settlements/mughal-agra.md §5, §10): goods set out on the verandahs of
// the forecourt's bazaar cells with their keepers sitting by them and buyers in the street; horses held by grooms in
// the forecourt, where visitors dismounted; boats on the Yamuna below the riverfront terrace.

import { RADIUS, FORECOURT } from './layout.js';
import { boatFloat } from '../../objects/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const WATER = -2.4;                                   // the Yamuna's level (ground.js)

export function life() {
  const rand = rng(1653), L = [], pick = (a) => a[Math.floor(rand() * a.length)];
  const MEN = ['cloth_white', 'cloth_white', 'cloth_white', 'cloth_ochre', 'cloth_indigo'], WOMEN = ['cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_indigo', 'cloth_white'];
  /** A man in the jama (a long robe) with a sash and a turban, or a woman in a long robe, her head veiled. */
  const person = (at, y, rot, o = {}) => {
    const woman = !o.man && rand() < 0.3;
    L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), skin: rand() < 0.7 ? 'skin_medium' : 'skin_dark', dress: 'robe',
      ...(woman ? { cloth: pick(WOMEN), cloth2: pick(WOMEN), hat: 'veil', hair: 'long' } : { cloth: pick(MEN), cloth2: pick(['cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_white']), over: 'sash', hat: 'turban', hatMat: pick(['cloth_white', 'cloth_red', 'cloth_ochre']), hair: 'short', beard: rand() < 0.6 }),
      pose: rand() < 0.3 ? 'talk' : 'stand', ...o });
  };
  // the bazaar streets of the forecourt: cells of 3.2 m, verandahs 3 m deep on a plinth of 0.35 m (plan.js)
  const [fx0, , fx1] = FORECOURT, BZ = 200, BW = 4.5, PY = 0.35;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x0 = sx < 0 ? fx0 + 4.2 : 48, x1 = sx < 0 ? -48 : fx1 - 4.2, zf = BZ + sz * BW, s = sz < 0 ? 1 : -1, n = Math.round((x1 - x0) / 3.2), bw = (x1 - x0) / n;
    const face = s > 0 ? Math.PI : 0;                                        // toward the street
    for (let k = 0; k < n; k++) {
      if (rand() < 0.35) continue;
      const xc = x0 + (k + 0.5) * bw, zg = zf - s * 1.35, r = rand();
      for (const dx of [-0.55, 0.55]) {
        if (rand() < 0.25) continue;
        const at = [xc + dx, zg], q = rand();
        L.push(r < 0.3 ? { t: 'pot', kind: pick(['water_pot', 'dark_pot']), n: 2 + Math.floor(rand() * 4), at, y: PY, seed: Math.floor(rand() * 1e9) }
          : r < 0.55 ? { t: 'sacks', n: 2 + Math.floor(rand() * 3), at, y: PY, rot: face + (rand() - 0.5) * 0.4, seed: Math.floor(rand() * 1e9), mat: q < 0.5 ? 'sacking' : 'linen' }
            : { t: 'basket', n: 2 + Math.floor(rand() * 3), at, y: PY, seed: Math.floor(rand() * 1e9), goods: pick(['cloth_red', 'cloth_ochre', 'cloth_green', 'cloth_white', 'cloth_indigo']) });
      }
      if (rand() < 0.6) person([xc, zf - s * 2.1], PY, face, { man: true, pose: 'cross' });
    }
    // buyers and passers-by in the street
    for (let k = 0; k < 7; k++) { const x = x0 + 3 + rand() * (x1 - x0 - 6); person([x, BZ + sz * (1 + rand() * 2.2)], 0.04, rand() < 0.6 ? face + Math.PI : rand() * 6.28); }
  }
  // horses held by grooms in the forecourt before the great gate, a few visitors
  for (const [x, z, rot] of [[-14, 179, 0.3], [-17.5, 180.5, 0.1], [15, 179.5, -0.2], [19, 181, -0.4], [-30, 215, 1.4], [33, 214, -1.6]]) {
    L.push({ t: 'animal', kind: 'horse', at: [x, z], y: 0.05, rot, seed: Math.floor(rand() * 1e9) });
    person([x + Math.cos(rot) * 0.9, z - Math.sin(rot) * 0.9 + 0.6], 0.05, rot, { man: true, pose: 'stand', cloth: 'cloth_white' });
  }
  // elephants with their mahouts astride the neck, goad in hand: one under a canopied howdah, one in its caparison
  // alone, an attendant at each ("would dismount from their horses or elephants" there: Wikipedia, Origins and
  // architecture of the Taj Mahal [stated]; the caparison, the howdah with its railing and canopy after Mughal
  // paintings, e.g. "Elephant with Mahout", c. 1660, https://www.metmuseum.org/art/collection/search/825608 [inferred])
  for (const [x, z, rot, o] of [[-38, 190, 0.35, { howdah: true, canopy: true, cloth: 'cloth_red', tusks: 'long' }], [41, 193, -0.5, { cloth: 'cloth_green', tusks: 'short' }]]) {
    L.push({ t: 'animal', kind: 'elephant', at: [x, z], y: 0.05, rot, seed: Math.floor(rand() * 1e9), gear: true, mahout: { cloth: pick(MEN), hatMat: pick(['cloth_white', 'cloth_red', 'cloth_ochre']) }, ...o });
    person([x + Math.cos(rot) * 1.9, z - Math.sin(rot) * 1.9 - 0.8], 0.05, rot, { man: true, pose: 'stand', cloth: 'cloth_white' });
  }
  for (let k = 0; k < 8; k++) person([(rand() - 0.5) * 70, 184 + rand() * 8], 0.05, rand() * 6.28);
  // boats on the Yamuna: thatch-roofed barges and rowing boats along the river, below the terrace
  for (const [x, z, kind, len] of [[-95, -276, 'barge', 12], [-40, -292, 'rowboat', 5], [10, -281, 'barge', 11], [70, -296, 'rowboat', 4.5], [118, -277, 'barge', 12.5], [160, -300, 'rowboat', 5], [-150, -290, 'rowboat', 4.8]]) {
    if (Math.hypot(x, z) > RADIUS - 40) continue;
    L.push({ t: 'boat', kind, len, at: [x, z], y: WATER + boatFloat(kind), rot: Math.PI / 2 + (rand() - 0.5) * 0.3, seed: Math.floor(rand() * 1e9) });
  }
  return L;
}
export const lifePlan = () => ({ id: 'mughal-agra-life', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: life(), rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 245], facing: 'n' } });
