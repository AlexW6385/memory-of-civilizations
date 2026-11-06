// The country round Angkor Wat (docs/settlements/angkor.md §6): the moat with its laterite banks,
// the road round it, and the village of houses on stilts among the palms.

import { RADIUS, LEVEL, MOAT, ROAD, CX, T, CAUSEWAY, houses } from './layout.js';

const base = (id, elements) => ({ id, style: 'khmer', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-206, 0], facing: 'e' } });

function moat() {
  const E = [], [a0, b0, a1, b1] = MOAT.outer, [c0, d0, c1, d1] = MOAT.inner;
  for (const r of [[a0, b0, a1, d0], [a0, d1, a1, b1], [a0, d0, c0, -4.75], [a0, 4.75, c0, d1], [c1, d0, a1, d1]]) E.push({ t: 'water_rect', rect: r, y: LEVEL.moat });
  // the banks: steps of laterite down to the water (here a wall with a sandstone coping)
  for (const [p, q] of [[[a0, b0], [a1, b0]], [[a0, b1], [a1, b1]], [[a0, b0], [a0, -4.75]], [[a0, 4.75], [a0, b1]], [[a1, b0], [a1, b1]], [[c0, d0], [c1, d0]], [[c0, d1], [c1, d1]], [[c0, d0], [c0, -4.75]], [[c0, 4.75], [c0, d1]], [[c1, d0], [c1, d1]]]) E.push({ t: 'canal_wall', a: p, b: q, y: 0.1, bed: LEVEL.moatBed, th: 1.6 });
  // the road round the moat, of beaten laterite
  const [r0, s0, r1, s1] = ROAD;
  for (const r of [[r0, s0, r1, b0], [r0, b1, r1, s1], [r0, b0, a0, b1], [a1, b0, r1, b1]]) E.push({ t: 'lane', rect: r, y: 0.03, mat: 'laterite' });
  return base('angkor-moat', E);
}
function village() {
  const all = houses(), plans = [];
  for (let i = 0; i < all.length; i += 45) plans.push(base(`angkor-village-${i / 45}`, all.slice(i, i + 45).map((h) => ({ t: 'stilt_house', ...h }))));
  return plans;
}
/**
 * The people of the temple (§12): Brahmin priests in white before the image of Vishnu in the central
 * sanctuary, an attendant with offerings; temple dancers on the Terrace of Honour before the western
 * entrance, their musicians seated by them; devotees crossing the causeway with offerings on their
 * heads and slung from poles.
 */
function templeLife() {
  const L = [], faceTo = ([dx, dz]) => Math.atan2(-dx, -dz);
  let seed = 1150;
  const fig = (at, y, dir, o) => L.push({ t: 'figure', at, y, rot: faceTo(dir), seed: seed++ * 7919, skin: seed % 2 ? 'skin_medium' : 'skin_dark', hat: 'none', ...o });
  const brahmin = { dress: 'wrap', top: 'bare', cloth: 'cloth_white', cloth2: 'cloth_white', hair: 'bun', over: 'sash', feet: 'bare' };
  // in the cella, before the image (it faces west): a priest at his worship, another behind him, an attendant with flowers
  const fy = T.bakan.y + 0.7;
  fig([CX - 1.75, 0.95], fy, [1, 0], { ...brahmin, pose: 'stand', arms: 'pray' });
  fig([CX - 2.05, -1.2], fy, [1, 0], { ...brahmin, pose: 'kneel', arms: 'pray' });
  L.push({ t: 'basket', at: [CX - 1.05, -1.05], y: fy, seed: 11, goods: 'cloth_white' }, { t: 'pot', at: [CX - 1.05, 1.15], y: fy, seed: 12, kind: 'water_pot' });
  // a priest coming down from the western porch of the sanctuary
  fig([CX - 14.6, 1.8], T.bakan.y, [-1, 0], { ...brahmin, pose: 'stand' });
  // the dancers on the Terrace of Honour (CX − 113 … CX − 99, z ± 12, 1.4 up), off the axis of the approach
  const ty = 1.4;
  for (const [x, z, d] of [[CX - 107.5, -4.2, [0, 1]], [CX - 105.5, -5.6, [0, 1]], [CX - 107.5, 4.2, [0, -1]], [CX - 105.5, 5.6, [0, -1]]]) {
    fig([x, z], ty, d, { dress: 'wrap', top: 'bare', cloth: seed % 2 ? 'cloth_red' : 'cloth_ochre', cloth2: 'cloth_ochre', hair: 'bun', over: 'sash', feet: 'bare', pose: 'stand', arms: 'pray', h: 1.55 });
  }
  for (const [x, z] of [[CX - 110.5, -8.5], [CX - 109, -9.6], [CX - 110.5, 8.5], [CX - 109, 9.6]]) fig([x, z], ty, [0, -Math.sign(z)], { dress: 'wrap', top: 'bare', cloth: 'cloth_white', cloth2: 'cloth_brown', hair: 'short', feet: 'bare', pose: 'cross' });
  // devotees on the causeway, walking in to the temple with their offerings
  const carries = ['basket', 'pot', 'pole', 'basket', 'none', 'pot', 'basket'];
  carries.forEach((carry, i) => fig([CAUSEWAY.outer[0] + 6 + i * 6.1, (i % 2 ? 1 : -1) * 1.6], 1.0, [1, 0], { dress: 'wrap', top: i % 3 ? 'bare' : '', cloth: ['cloth_red', 'cloth_ochre', 'cloth_brown', 'cloth_white'][i % 4], cloth2: 'cloth_white', hair: i % 2 ? 'bun' : 'short', feet: 'bare', carry }));
  return { ...base('angkor-temple-life', L), style: 'life', center: [CX - 60, 0], near: 300 };
}
export async function town() { return [moat(), ...village(), templeLife()]; }
