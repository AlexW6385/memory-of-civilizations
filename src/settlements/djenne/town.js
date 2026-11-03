// The town round the mosque (docs/settlements/djenne.md §6): the market square with its stalls,
// the houses packed along the streets.

import { RADIUS, MARKET, LEVEL, houses, shore } from './layout.js';

const base = (id, elements) => ({ id, style: 'sahel', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [70, 0], facing: 'w' } });
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export async function town() {
  const rand = rng(77), stalls = [];
  for (let i = 0; i < 46; i++) stalls.push({ t: 'market_stall', c: [MARKET[0] + 8 + rand() * (MARKET[2] - MARKET[0] - 16), MARKET[1] + 6 + rand() * (MARKET[3] - MARKET[1] - 12)], s: 1.3 + rand() * 0.6 });
  const water = { t: 'water_cells', rect: [-RADIUS + 20, -RADIUS + 20, RADIUS - 20, RADIUS - 20], y: LEVEL.water, cell: 2, inside: (x, z) => { const s = shore(x, z); return s > 7 && s < 39; } };
  const plans = [base('djenne-market', [...stalls, water])];
  const all = houses();
  for (let i = 0; i < all.length; i += 110) plans.push(base(`djenne-houses-${i / 110}`, all.slice(i, i + 110).map((h) => ({ t: 'sahel_house', ...h }))));
  return plans;
}
