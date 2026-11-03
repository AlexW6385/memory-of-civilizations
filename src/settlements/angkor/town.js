// The country round Angkor Wat (docs/settlements/angkor.md §6): the moat with its laterite banks,
// the road round it, and the village of houses on stilts among the palms.

import { RADIUS, LEVEL, MOAT, ROAD, houses } from './layout.js';

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
export async function town() { return [moat(), ...village()]; }
