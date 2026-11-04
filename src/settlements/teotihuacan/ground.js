// Teotihuacan — the ground: the valley floor, level, rising a little at the north under the Moon
// Pyramid; dry soil and grass, maguey and nopal stand-ins between the compounds; the high valley's sky.

import { RADIUS, MOON, AVENUE, inRect, inCompound, KEEP_CLEAR, smooth as sm } from './layout.js';

function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  const q = Math.hypot((x - MOON.c[0]) / 110, (z - MOON.c[1]) / 100);
  return MOON.rise * sm(1.6, 0.9, q) * (1 - sm(RADIUS - 40, RADIUS, r));
}
function cover(x, z) {
  const c = { sand: 0.25, grass: 0.25, rock: 0, soil: 0.5, fields: 0, dry: 0.6, warmth: 0.6, red: 0.15, road: 0, snow: 0, forest: 0 };
  if (inRect(AVENUE, x, z)) { c.road = 0.8; return c; }
  if (Math.hypot(x, z) > RADIUS - 34) { c.fields = 0.6; c.grass = 0.4; return c; }
  return c;
}
const water = () => false, waterLevel = () => -Infinity, fromWater = () => 1e4;
/** Plants per 100 m²: grass, scattered junipers and pepper-tree stand-ins between the compounds; none on the avenue or the monuments. */
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 6 || inRect(AVENUE, x, z, 2) || KEEP_CLEAR.some((k) => inRect(k, x, z)) || inCompound(x, z, 1)) return null;
  return { cypress: 0.03, acacia: 0.04, grass_dry: 16 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { cypress: 0.03, acacia: 0.04 },
  climate: {
    sun: { az: 145, el: 55, color: [1.0, 0.96, 0.9], intensity: 3.4, lat: 20, dec: -10, hour: 10 },
    sky: { turbidity: 2.6, rayleigh: 1.0, mie: 0.004, mieG: 0.8, zenith: [0.09, 0.17, 0.38], horizon: [0.62, 0.66, 0.7] },
    fog: { color: [0.76, 0.77, 0.78], density: 0.0004, height: 0.01 },
    exposure: 0.48,
    wind: [0.3, 0.1],
    weather: [
      { id: 'clear', weight: 4, clouds: 0.15, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'thunderheads', weight: 1.5, clouds: 0.6, cloudDensity: 0.6, sun: 0.75, fog: 1.2 },
    ],
  },
};
