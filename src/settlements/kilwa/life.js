// Kilwa about 1330 — the trees and the trade of the shore (docs/settlements/kilwa.md §15): coconut palms
// along the top of the beach and among the houses, baobabs on the open ground behind the town; on the beach by
// the drawn-up mtepe the goods of the monsoon trade — ivory, cloth, beads and pots — the merchants and porters;
// two ocean dhows riding at anchor in the harbour. Pure data.

import { RADIUS, SEA, MOSQUE, PALACE, height, inSea, inRect, inLot, onHeadland } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const shoreAt = (x) => -120 - 15 * Math.sin(x / 60);
const free = (x, z, m) => Math.hypot(x, z) < RADIUS - 30 && !inSea(x, z) && height(x, z) > 0.9 && !inRect(MOSQUE, x, z, m + 2) && !inRect(PALACE, x, z, m + 6) && !onHeadland(x, z, m) && !inLot(x, z, m);

let TREES = null;
/** The coconut palms and baobabs: [{ t, at, y, … }] (swahili style). */
export function trees() {
  if (TREES) return TREES;
  TREES = [];
  const rand = rng(1331), near = (x, z, d) => TREES.some((t) => Math.hypot(t.at[0] - x, t.at[1] - z) < d);
  // the palms in a loose belt along the top of the beach, leaning to the sea, and in groves among the houses
  for (let k = 0, x = -230; x < 110 && k < 200; x += 4 + rand() * 6, k++) {
    const z = shoreAt(x) + 20 + rand() * 16;
    if (!free(x, z, 1.5) || near(x, z, 4)) continue;
    TREES.push({ t: 'coconut_palm', at: [x, z], y: height(x, z) - 0.1, h: 11 + rand() * 8, lean: 1 + rand() * 2.5, dir: -Math.PI / 2 + (rand() - 0.5) * 1.2, seed: Math.floor(rand() * 1e6) });
  }
  for (let k = 0; k < 600 && TREES.length < 58; k++) {
    const x = -240 + rand() * 360, z = -90 + rand() * 260;
    if (!free(x, z, 2.5) || near(x, z, 7)) continue;
    TREES.push({ t: 'coconut_palm', at: [x, z], y: height(x, z) - 0.1, h: 10 + rand() * 9, lean: 0.5 + rand() * 2, seed: Math.floor(rand() * 1e6) });
  }
  // baobabs on the open ground behind the town
  for (let k = 0, n = 0; k < 400 && n < 9; k++) {
    const x = -260 + rand() * 420, z = 60 + rand() * 200, R = 1.8 + rand() * 1.4;
    if (!free(x, z, R + 4) || near(x, z, R + 9)) continue;
    TREES.push({ t: 'baobab', at: [x, z], y: height(x, z) - 0.2, h: 9 + R * 2.2, r: R, seed: Math.floor(rand() * 1e6) }); n++;
  }
  return TREES;
}
export const inTree = (x, z, m = 0) => trees().some((t) => Math.hypot(t.at[0] - x, t.at[1] - z) < (t.r ?? 0.6) + m);

/** The goods on the beach (swahili style: ivory tusks) and the life of the shore (life style). */
export function shore() {
  const S = [], L = [], rand = rng(1332), pick = (a) => a[Math.floor(rand() * a.length)];
  const man = (at, y, rot, o = {}) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', cloth: 'cloth_white', cloth2: 'cloth_white', skin: pick(['skin_dark', 'skin_dark', 'skin_medium']), hat: pick(['cap', 'turban']), hatMat: 'cloth_white', hair: 'short', hairMat: 'hair_dark', beard: rand() < 0.5, feet: 'bare', over: 'none', carry: 'none', pose: 'stand', ...o });
  const porter = (at, y, rot, carry) => L.push({ t: 'figure', at, y, rot, seed: Math.floor(rand() * 1e9), dress: 'wrap', top: 'bare', cloth: pick(['cloth_white', 'cloth_indigo', 'cloth_ochre']), skin: 'skin_dark', hat: 'none', hair: 'short', hairMat: 'hair_dark', feet: 'bare', over: 'none', carry, pose: 'stand' });
  // three landing places along the beach, each a heap of goods with its merchants and porters
  for (const x of [-140, -75, -45]) {
    const z = shoreAt(x) + 14, y = height(x, z);
    if (height(x, z) < 0.3 || height(x + 6, z) < 0.3) continue;
    S.push({ t: 'tusks', at: [x, z], y, rot: 0.2, n: 7 });
    L.push({ t: 'sacks', n: 5, at: [x + 3, z + 0.5], y, rot: 0.4, seed: x + 1000 });
    L.push({ t: 'goods_mat', goods: ['bolts', 'pottery', 'basket'], at: [x - 2.8, z + 1], y, rot: Math.PI, seed: x + 2000 });
    L.push({ t: 'pot', kind: 'blue_jar', at: [x + 1.2, z + 2.6], y, seed: x + 3000 });
    L.push({ t: 'pot', kind: 'glazed_jar', at: [x + 2.1, z + 2.8], y, seed: x + 3001 });
    man([x - 1, z + 2.2], y, Math.PI * 0.9);
    man([x + 0.2, z + 2.6], y, -0.3, { pose: 'talk' });
    porter([x + 4.5, z - 0.8], y, Math.PI * 0.5, 'headload');
    porter([x - 4.2, z + 3.5], y, 0.2, rand() < 0.5 ? 'basket' : 'headload');
  }
  // the ocean dhows at anchor out in the harbour, beyond the beach
  for (const [x, rot] of [[-110, 0.4], [-20, -0.3]]) {
    let z = shoreAt(x) - 22;
    while (!inSea(x, z) && z > -300) z -= 4;
    L.push({ t: 'boat', kind: 'dhow', len: 18, at: [x, z - 14], y: SEA, rot, seed: Math.round(x) });
  }
  return { S, L };
}
