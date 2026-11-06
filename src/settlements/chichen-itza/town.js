// The town round the Great Plaza (docs/settlements/chichen-itza.md §6): house lots enclosed by
// dry-stone walls, each with one to three oval houses of wattle and thatch.

import { RADIUS, lots } from './layout.js';

const base = (id, elements) => ({ id, style: 'maya', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 62], facing: 'n' } });

function lotElements(l) {
  const [x0, z0, x1, z1] = l.rect, E = [], gw = 2.4;
  const sides = [[[x0, z0], [x1, z0]], [[x1, z0], [x1, z1]], [[x1, z1], [x0, z1]], [[x0, z1], [x0, z0]]];
  sides.forEach(([a, b], i) => {
    if (i !== l.gate) { E.push({ t: 'albarrada', pts: [a, b] }); return; }
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    E.push({ t: 'albarrada', pts: [a, [m[0] - ux * gw, m[1] - uz * gw]] });
    E.push({ t: 'albarrada', pts: [[m[0] + ux * gw, m[1] + uz * gw], b] });
  });
  for (const h of l.houses) E.push({ t: 'maya_house', ...h });
  return E;
}

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/**
 * The market on the plaza south of the Thousand Columns (§11): rows of sellers sitting behind their palm mats with
 * baskets of maize, beans and chile, cloth, and dark cooking pots; buyers walking between, some carrying baskets or
 * water jars on their heads. Men in loincloth and cape, women in the long cotton dress (the wrap stands in).
 */
function market() {
  const rand = rng(1000), L = [], M = [], Y = 0.04, pick = (a) => a[Math.floor(rand() * a.length)];
  const skin = () => pick(['skin_dark', 'skin_dark', 'skin_medium']);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) {
    if (rand() < 0.15) continue;
    const x = 96 + c * 10 + (rand() - 0.5) * 2, z = 56 + r * 7 + (rand() - 0.5) * 1.2, woman = rand() < 0.55;
    M.push({ t: 'petate', at: [x, z + 0.4], y: Y, w: 1.8, d: 1.2, rot: (rand() - 0.5) * 0.2 });
    L.push({ t: 'figure', at: [x, z - 0.55], y: Y, rot: Math.PI, h: woman ? 1.5 : 1.6, seed: Math.floor(rand() * 1e9), dress: woman ? 'robe' : 'wrap', cloth: woman ? 'cloth_white' : pick(['cloth_white', 'cloth_ochre']), cloth2: pick(['cloth_red', 'cloth_white', 'cloth_ochre']), skin: skin(), hat: 'none', hair: woman ? pick(['long', 'bun']) : 'long', hairMat: 'hair_dark', feet: 'bare', legs: 'bare', over: woman ? 'none' : 'cape', pose: rand() < 0.6 ? 'squat' : 'sit_ground' });
    for (let k = 0; k < 3; k++) {
      const at = [x - 0.55 + k * 0.55 + (rand() - 0.5) * 0.1, z + 0.45 + (rand() - 0.5) * 0.3];
      const g = rand();
      if (g < 0.55) L.push({ t: 'basket', at, y: Y + 0.015, seed: Math.floor(rand() * 1e6), goods: pick(['paint_ochre', 'cloth_red', 'pottery_dark', 'cloth_ochre', 'fresco_green']) });
      else L.push({ t: 'pot', kind: pick(['dark_pot', 'water_pot']), at, y: Y + 0.015, seed: Math.floor(rand() * 1e6) });
    }
  }
  // buyers between the rows
  for (let k = 0; k < 14; k++) {
    const woman = rand() < 0.5, at = [94 + rand() * 54, 59.5 + Math.floor(rand() * 3) * 7 + (rand() - 0.5) * 1.5];
    L.push({ t: 'figure', at, y: Y, rot: rand() * 6.28, h: woman ? 1.52 : 1.62, seed: Math.floor(rand() * 1e9), dress: woman ? 'robe' : 'wrap', cloth: 'cloth_white', cloth2: pick(['cloth_red', 'cloth_ochre', 'cloth_white']), skin: skin(), hat: 'none', hair: pick(['long', 'bun', 'short']), hairMat: 'hair_dark', feet: 'bare', legs: 'bare', over: woman ? 'none' : pick(['cape', 'sash']), carry: pick(['basket', 'pot', 'none', 'none']), pose: rand() < 0.3 ? 'talk' : 'stand' });
  }
  return [{ ...base('chichen-itza-market', L), style: 'life' }, base('chichen-itza-market-mats', M)];
}

export async function town() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 30) plans.push(base(`chichen-itza-town-${i / 30}`, all.slice(i, i + 30).flatMap(lotElements)));
  return [...plans, ...market()];
}
