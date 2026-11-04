// Baroque Rome — the ground: the travertine of the piazza, the Borgo's cobbled streets, the Tiber's
// brown water and its muddy banks, the Vatican gardens' umbrella pines and cypresses on the rising
// ground west; the warm Roman light.

import { RADIUS, RETTA, TIBER, height, inTiber, inOval, inRect, inLot, inBasilica } from './layout.js';

function cover(x, z, h) {
  const c = { sand: 0.1, grass: 0.3, rock: 0, soil: 0.4, fields: 0, dry: 0.5, warmth: 0.65, red: 0.25, road: 0.35, snow: 0, forest: 0 };
  if (inOval(x, z) || inRect(RETTA, x, z)) { c.road = 0.9; return c; }
  if (x < -150) { c.grass = 0.7; c.road = 0.05; c.forest = 0.2; return c; }
  if (h < -1) { c.soil = 0.8; c.grass = 0.2; c.road = 0; return c; }
  return c;
}
function water(x, z, y) { return inTiber(x, z) && y < TIBER.level + 0.3; }
function waterLevel(x, z) { return inTiber(x, z) ? TIBER.level : -Infinity; }
function fromWater(x, z) { return inTiber(x, z) ? -3 : Math.max(-5, Math.min(40, height(x, z) - TIBER.level)); }
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inTiber(x, z) || inOval(x, z, 2) || inRect(RETTA, x, z, 2) || inBasilica(x, z, 2) || inLot(x, z, 1)) return null;
  if (height(x, z) < -1) return { reeds: 6, willow: 0.03, grass: 20 };
  if (x < -150) return { stone_pine: 0.02, cypress: 0.015, grass: 18 };                  // the Vatican gardens
  return { stone_pine: 0.006, cypress: 0.006, grass: 8 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { cypress: 0.015, stone_pine: 0.02, willow: 0.03 },
  climate: {
    sun: { az: 140, el: 50, color: [1.0, 0.95, 0.86], intensity: 3.5, lat: 42, dec: 12, hour: 10 },
    sky: { turbidity: 2.7, rayleigh: 1.05, mie: 0.005, mieG: 0.78, zenith: [0.07, 0.15, 0.4], horizon: [0.64, 0.66, 0.7] },
    fog: { color: [0.8, 0.8, 0.8], density: 0.0003, height: 0.01 },
    exposure: 0.48,
    wind: [0.3, 0.2],
    weather: [
      { id: 'clear', weight: 4, clouds: 0.2, cloudDensity: 0.35, sun: 1.0, fog: 1 },
      { id: 'cloud', weight: 2, clouds: 0.55, cloudDensity: 0.6, sun: 0.8, fog: 1.2 },
      { id: 'rain', weight: 0.5, clouds: 0.92, cloudDensity: 0.85, sun: 0.35, fog: 1.7, rain: 0.7 },
    ],
  },
};
