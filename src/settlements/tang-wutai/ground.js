// Mount Wutai — the ground: loess and grass in the valley, millet fields, pines and junipers on the
// hills, the monastery's packed earth and paving; the high, dry, clear sky of Shanxi.

import { RADIUS, PLAN, PAGODA, GREEN, height, inRect, inLot, inLane } from './layout.js';

function cover(x, z, h, ny) {
  const c = { sand: 0.2, grass: 0.45, rock: 0, soil: 0.35, fields: 0, dry: 0.55, warmth: 0.5, red: 0.2, road: 0, snow: 0, forest: 0 };
  if (inRect(PLAN, x, z)) { c.road = 0.7; return c; }
  if (inLane(x, z) || inRect(GREEN, x, z)) { c.road = 0.75; c.grass = 0.1; return c; }            // beaten earth of the lanes and the green
  if (inLot(x, z)) { c.road = 0.5; c.grass = 0.25; c.soil = 0.5; return c; }                      // the yards' trodden earth
  if (ny < 0.8) { c.rock = 0.5; c.grass = 0.5; return c; }                                        // the banks between terraces, the steep hill
  if (x < -70 && Math.abs(z) > 100) { c.fields = 0.7; c.grass = 0.2; c.soil = 0.5; return c; }  // millet and oats on the terraced flanks
  if (x < -70 && h < 1.5) { c.fields = 0.35; c.grass = 0.4; c.soil = 0.45; return c; }           // plots between the yards
  return c;
}
const water = () => false, waterLevel = () => -Infinity, fromWater = () => 1e4;
/** Pines and arborvitae on the hill and about the monastery's walls; poplars and jujubes among the yards and on the fields' banks. */
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inRect(PLAN, x, z, 3) || inLot(x, z, 0.5) || inLane(x, z, 1.2) || inRect(GREEN, x, z, 1) || Math.hypot(x - PAGODA[0], z - PAGODA[1]) < 8) return null;
  const h = height(x, z);
  if (x > -50 && Math.abs(z) < 64 && x < 100) return { chinese_pine: 0.16, arborvitae: 0.05, grass_dry: 10 };        // the old pines about the monastery's walls
  if (h > 12 || x > 0) return { chinese_pine: 0.12, arborvitae: 0.03, grass_dry: 10 };
  if (Math.abs(z) > 100) return { poplar: 0.012, jujube: 0.02, chinese_pine: 0.03, grass_dry: 8 };
  return { poplar: 0.025, jujube: 0.03, grass: 12 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { chinese_pine: 0.16, arborvitae: 0.05, poplar: 0.025, jujube: 0.03 },
  climate: {
    sun: { az: 200, el: 48, color: [1.0, 0.96, 0.9], intensity: 3.5, lat: 39, dec: 10, hour: 14 },
    sky: { turbidity: 2.4, rayleigh: 1.0, mie: 0.004, mieG: 0.78, zenith: [0.07, 0.15, 0.42], horizon: [0.62, 0.66, 0.72] },
    fog: { color: [0.78, 0.8, 0.83], density: 0.0003, height: 0.01 },
    exposure: 0.48,
    damp: 0.25,     // the mountain's summer rains: a little streaking and moss on the shaded foot of walls
    wind: [0.5, 0.2],
    weather: [
      { id: 'clear', weight: 4, clouds: 0.2, cloudDensity: 0.35, sun: 1.0, fog: 1 },
      { id: 'cloud', weight: 1.5, clouds: 0.55, cloudDensity: 0.6, sun: 0.8, fog: 1.2 },
    ],
  },
};
