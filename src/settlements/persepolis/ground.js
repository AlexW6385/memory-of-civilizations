// Persepolis — the ground: the Marvdasht plain, dry and pale with fields and orchards; the bare
// slope of Kuh-e Rahmat behind the terrace; poplars, cypresses and plane trees in the town's
// gardens; the high, clear sky of Fars.

import { RADIUS, TERRACE, ROAD, mountain, inRect, inLot } from './layout.js';

function height(x, z) { return inRect(TERRACE.rect, x, z, 2) ? 0 : mountain(x, z); }
function cover(x, z, h) {
  const c = { sand: 0.5, grass: 0.1, rock: 0, soil: 0.4, fields: 0, dry: 0.85, warmth: 0.7, red: 0.2, road: 0, snow: 0, forest: 0 };
  if (h > 4) { c.rock = 0.7; c.sand = 0.3; return c; }
  if (inRect(ROAD, x, z)) { c.road = 0.7; return c; }
  if (x < -170 && Math.hypot(x, z) > RADIUS - 70) { c.fields = 0.6; c.grass = 0.3; return c; }
  return c;
}
const water = () => false, waterLevel = () => -Infinity, fromWater = () => 1e4;
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inRect(TERRACE.rect, x, z, 6) || inRect(ROAD, x, z, 1) || inLot(x, z, 1)) return null;
  if (mountain(x, z) > 3) return { grass_dry: 4 };
  if (x < -170) return { poplar: 0.12, cypress: 0.06, plane_tree: 0.02, grass_dry: 14 };
  return { grass_dry: 10 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { poplar: 0.12, cypress: 0.06, plane_tree: 0.02 },
  climate: {
    sun: { az: 140, el: 52, color: [1.0, 0.96, 0.88], intensity: 3.6, lat: 30, dec: 10, hour: 10 },
    sky: { turbidity: 2.6, rayleigh: 1.0, mie: 0.004, mieG: 0.78, zenith: [0.08, 0.15, 0.4], horizon: [0.62, 0.64, 0.66] },
    fog: { color: [0.78, 0.78, 0.76], density: 0.0003, height: 0.01 },
    exposure: 0.48,
    wind: [0.5, 0.1],
    weather: [
      { id: 'clear', weight: 5, clouds: 0.12, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'spring-cloud', weight: 1.5, clouds: 0.5, cloudDensity: 0.55, sun: 0.8, fog: 1.2 },
    ],
  },
};
