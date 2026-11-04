// Mount Wutai — the ground: loess and grass in the valley, millet fields, pines and junipers on the
// hills, the monastery's packed earth and paving; the high, dry, clear sky of Shanxi.

import { RADIUS, PLAN, PAGODA, height, inRect, inLot } from './layout.js';

function cover(x, z, h, ny) {
  const c = { sand: 0.2, grass: 0.45, rock: 0, soil: 0.35, fields: 0, dry: 0.55, warmth: 0.5, red: 0.2, road: 0, snow: 0, forest: 0 };
  if (inRect(PLAN, x, z)) { c.road = 0.7; return c; }
  if (ny < 0.8) { c.rock = 0.5; c.grass = 0.5; return c; }
  if (x < -90 && h < 2) { c.fields = 0.6; c.grass = 0.3; return c; }
  if (Math.abs(z) < 4 && x < -58) { c.road = 0.7; return c; }
  return c;
}
const water = () => false, waterLevel = () => -Infinity, fromWater = () => 1e4;
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inRect(PLAN, x, z, 4) || inLot(x, z, 1) || Math.hypot(x - PAGODA[0], z - PAGODA[1]) < 8 || (Math.abs(z) < 5 && x < -58)) return null;
  if (height(x, z) > 6) return { chinese_pine: 0.12, arborvitae: 0.03, grass_dry: 10 };
  return { poplar: 0.02, jujube: 0.02, grass: 15 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { chinese_pine: 0.12, arborvitae: 0.03, poplar: 0.02, jujube: 0.02 },
  climate: {
    sun: { az: 200, el: 48, color: [1.0, 0.96, 0.9], intensity: 3.5, lat: 39, dec: 10, hour: 14 },
    sky: { turbidity: 2.4, rayleigh: 1.0, mie: 0.004, mieG: 0.78, zenith: [0.07, 0.15, 0.42], horizon: [0.62, 0.66, 0.72] },
    fog: { color: [0.78, 0.8, 0.83], density: 0.0003, height: 0.01 },
    exposure: 0.48,
    wind: [0.5, 0.2],
    weather: [
      { id: 'clear', weight: 4, clouds: 0.2, cloudDensity: 0.35, sun: 1.0, fog: 1 },
      { id: 'cloud', weight: 1.5, clouds: 0.55, cloudDensity: 0.6, sun: 0.8, fog: 1.2 },
    ],
  },
};
