// Granada — the ground: the red earth of the Sabika, the palace courts' marble and the gardens'
// cypresses, myrtle and orange trees; elms in the wood below the walls; the Darro's poplars; the
// white Albaicín; the clear sky under the Sierra Nevada.

import { RADIUS, height, hillE, inLot } from './layout.js';

function cover(x, z, h, ny) {
  const c = { sand: 0.15, grass: 0.35, rock: 0, soil: 0.5, fields: 0, dry: 0.6, warmth: 0.65, red: 0.6, road: 0, snow: 0, forest: 0 };
  if (hillE(x, z) < 1) { c.road = 0.5; return c; }
  if (ny < 0.85) { c.soil = 0.7; c.grass = 0.3; return c; }
  return c;
}
const water = () => false, waterLevel = () => -Infinity, fromWater = () => 1e4;
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inLot(x, z, 1)) return null;
  const e = hillE(x, z);
  if (e < 0.95) return e > 0.6 && x > 90 ? { cypress: 0.04, grass: 15 } : null;          // the gardens of the Partal and toward the Generalife
  if (e < 1.4) return { elm: 0.12, cypress: 0.02, grass: 20 };                              // the wood on the slopes
  if (Math.abs(z + 110) < 14) return { poplar: 0.1, grass: 25 };
  return { olive: 0.02, cypress: 0.01, grass_dry: 8 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { elm: 0.12, cypress: 0.04, poplar: 0.1, olive: 0.02 },
  climate: {
    sun: { az: 150, el: 52, color: [1.0, 0.96, 0.88], intensity: 3.5, lat: 37, dec: 12, hour: 10.5 },
    sky: { turbidity: 2.4, rayleigh: 1.0, mie: 0.004, mieG: 0.78, zenith: [0.07, 0.15, 0.42], horizon: [0.62, 0.66, 0.72] },
    fog: { color: [0.78, 0.8, 0.82], density: 0.00028, height: 0.01 },
    exposure: 0.48,
    wind: [0.4, 0.2],
    weather: [
      { id: 'clear', weight: 5, clouds: 0.12, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'cloud', weight: 1.5, clouds: 0.45, cloudDensity: 0.5, sun: 0.85, fog: 1.1 },
    ],
  },
};
