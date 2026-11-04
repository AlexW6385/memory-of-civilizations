// Great Zimbabwe — the ground: the grey granite of the hill and its boulders, red earth and dry
// grass on the valley floor, cleared ground round the houses, the miombo woodland (acacia stands
// in) and msasa trees beyond; the high plateau's clear, bright sky.

import { RADIUS, HILL, height, huts, inEnclosure } from './layout.js';

function cover(x, z, h, ny) {
  const c = { sand: 0.2, grass: 0.4, rock: 0, soil: 0.4, fields: 0, dry: 0.7, warmth: 0.7, red: 0.55, road: 0, snow: 0, forest: 0 };
  if (h > 6 || ny < 0.8) { c.rock = 0.8; c.grass = 0.2; return c; }
  if (inEnclosure(x, z)) { c.soil = 0.8; c.grass = 0.2; return c; }
  return c;
}
const water = () => false, waterLevel = () => -Infinity, fromWater = () => 1e4;
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inEnclosure(x, z, 4) || huts().some((h) => Math.hypot(h.c[0] - x, h.c[1] - z) < h.r + 2)) return null;
  const h = height(x, z);
  if (h > 6) return { boulder: 0.6, grass_dry: 6, acacia: 0.02 };
  if (Math.hypot(x, z) > 260) return { acacia: 0.12, grass_dry: 14 };
  return { acacia: 0.03, grass_dry: 12 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { acacia: 0.12, boulder: 0.6 },
  climate: {
    sun: { az: 20, el: 55, color: [1.0, 0.96, 0.88], intensity: 3.6, lat: -20, dec: -5, hour: 11 },
    sky: { turbidity: 2.4, rayleigh: 1.0, mie: 0.004, mieG: 0.78, zenith: [0.07, 0.15, 0.42], horizon: [0.64, 0.68, 0.72] },
    fog: { color: [0.8, 0.8, 0.8], density: 0.0003, height: 0.01 },
    exposure: 0.48,
    wind: [0.5, 0.2],
    weather: [
      { id: 'clear', weight: 4, clouds: 0.15, cloudDensity: 0.35, sun: 1.0, fog: 1 },
      { id: 'storm', weight: 1, clouds: 0.85, cloudDensity: 0.8, sun: 0.45, fog: 1.4, rain: 0.8 },
    ],
  },
};
void HILL;
