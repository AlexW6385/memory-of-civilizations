// Life on the Arno about 1480 (docs/settlements/florence.md §6): flat-bottomed barges (navicelli) of
// wood and stone and wine moored along the banks with their punters, fishermen with long poles and
// small boats, the washerwomen kneeling at the water's edge with their troughs and cloth spread on
// the bank to bleach, the washing drying on lines. Pure data derived from layout.js (arnoZ, ARNO).

import { ARNO, TINTORI, arnoZ, height } from './layout.js';
import { boatFloat } from '../../objects/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const FIG = { dress: 'robe', legs: 'hose', skin: 'skin_light', over: 'none' };
const bankFree = (x) => !(x > 70 && x < 250 && false) && !(x > -2 && x < 82) && !(x > TINTORI[0] - 6 && x < TINTORI[2] + 6);

export function arnoPlans() {
  const rand = rng(1494), out = new Map();
  const put = (x, e) => { const k = Math.floor((x + 300) / 150); if (!out.has(k)) out.set(k, []); out.get(k).push(e); };
  const lvl = ARNO.level, half = ARNO.w / 2;
  // barges lying along the banks, bows upstream
  const barges = [[-250, 1, 'sacks'], [-205, -1, 'barrels'], [-120, 1, 'sacks'], [-40, -1, 'crates'], [130, 1, 'barrels'], [185, 1, 'sacks'], [250, -1, 'crates']];
  barges.forEach(([x, side, load], k) => {
    const z = arnoZ(x) + side * (half - 9), kind = 'barge';
    put(x, { t: 'boat', kind, at: [x, z], y: lvl + boatFloat(kind), rot: Math.PI / 2 + 0.05 * (k % 3 - 1), seed: 700 + k });
    put(x, { t: 'figure', at: [x - 5.2, z], y: lvl + 0.12, rot: Math.PI / 2, seed: 710 + k, pose: 'punt', poleMat: 'timber', ...FIG, cloth: 'cloth_grey', cloth2: 'cloth_brown', hat: 'cap', legs: 'bare', feet: 'bare' });
    for (let j = 0; j < 3; j++) put(x, { t: load === 'barrels' ? 'barrel' : load, at: [x - 1.8 + j * 1.6, z + (j % 2 ? 0.25 : -0.25)], y: lvl + 0.42, rot: j, seed: 720 + k * 3 + j });
  });
  // fishermen in small boats on the water and on the banks with their poles and nets
  for (const [x, side] of [[-230, -1], [-165, 1], [-95, 1], [-20, 1], [100, -1], [215, -1], [270, 1]]) {
    const z = arnoZ(x) + side * 6;
    put(x, { t: 'boat', kind: 'rowboat', at: [x, z], y: lvl + boatFloat('rowboat'), rot: Math.PI / 2 + rand() * 0.5 - 0.25, seed: 740 + x });
    put(x, { t: 'figure', at: [x - 0.4, z], y: lvl + 0.1, rot: Math.PI / 2, seed: 750 + x, pose: 'stand', carry: 'none', ...FIG, cloth: 'cloth_brown', cloth2: 'cloth_grey', hat: 'cap' });
  }
  let n = 0;
  for (let x = -285; x < 285; x += 17 + Math.floor(rand() * 12)) {
    if (!bankFree(x)) continue;
    const side = rand() < 0.6 ? -1 : 1, d = half + 3 - 0.5, z = arnoZ(x) + side * d, y = height(x, z), face = side < 0 ? Math.PI / 2 : -Math.PI / 2;
    const r = rand();
    if (r < 0.45) {
      // the washerwomen: two kneeling at a plank, a trough, the cloth spread on the bank behind them
      for (let k = 0; k < 2; k++) put(x, { t: 'figure', at: [x + k * 1.5, z], y, rot: face + Math.PI, seed: 800 + n * 4 + k, pose: 'squat', carry: 'none', ...FIG, dress: 'robe', cloth: ['cloth_white', 'cloth_ochre', 'cloth_indigo'][(n + k) % 3], cloth2: 'cloth_brown', hat: 'none', hair: 'bun', legs: 'bare', feet: 'bare' });
      put(x, { t: 'trough', at: [x + 0.8, z + side * 0.8], y, rot: 0, seed: 810 + n });
      put(x, { t: 'laundry', at: [x + 0.5, z + side * 6], y: height(x, z + side * 6), rot: face, seed: 820 + n });
    } else if (r < 0.75) {
      put(x, { t: 'figure', at: [x, z], y, rot: face + Math.PI, seed: 830 + n, pose: 'punt', poleMat: 'timber', carry: 'none', ...FIG, cloth: 'cloth_brown', cloth2: 'cloth_grey', hat: 'cap', legs: 'bare', feet: 'bare' });
      put(x, { t: 'basket', at: [x + 1.0, z + side * 0.5], y, rot: 0, seed: 840 + n });
    } else {
      put(x, { t: 'laundry_pole', at: [x, z + side * 5], y: height(x, z + side * 5), rot: 0, seed: 850 + n });
      put(x, { t: 'figure', at: [x + 2, z + side * 4], y: height(x + 2, z + side * 4), rot: face, seed: 860 + n, pose: 'stand', carry: 'bundle', ...FIG, cloth: 'cloth_white', cloth2: 'cloth_ochre', hat: 'none', hair: 'bun' });
    }
    n++;
  }
  return [...out].map(([k, els]) => ({ id: `florence-arno-life-${k}`, style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [0, 0], facing: 'n' }, bounds: [-300 + k * 150, arnoZ(0) - 60, -150 + k * 150, arnoZ(0) + 60], rooms: [], elements: els, center: [-225 + k * 150, arnoZ(-225 + k * 150)], near: 260 }));
}
