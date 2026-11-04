// Rome — the ground: the flat Campus Martius, paved streets and squares, gardens with umbrella
// pines and cypresses, the Tiber's muddy water and its banks of reeds; the soft light of Latium.

import { RADIUS, PANTHEON, BATHS, SAEPTA, STADIUM, TIBER, height, inRiver, onStreet, inRect, inLot } from './layout.js';

function cover(x, z, h) {
  const c = { sand: 0.1, grass: 0.4, rock: 0, soil: 0.5, fields: 0, dry: 0.5, warmth: 0.65, red: 0.3, road: 0, snow: 0, forest: 0 };
  if ([PANTHEON, BATHS, SAEPTA, STADIUM].some((r) => inRect(r, x, z, 4)) || onStreet(x, z)) { c.road = 0.85; return c; }
  if (h < -0.5) { c.soil = 0.8; c.grass = 0.2; return c; }
  return c;
}
function water(x, z, y) { return inRiver(x, z) && y < TIBER.level + 0.3; }
function waterLevel(x, z) { return inRiver(x, z) ? TIBER.level : -Infinity; }
function fromWater(x, z) { return inRiver(x, z) ? -3 : Math.max(-5, Math.min(40, height(x, z) - TIBER.level)); }
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inRiver(x, z) || [PANTHEON, BATHS, SAEPTA, STADIUM].some((r) => inRect(r, x, z, 6)) || onStreet(x, z, 1) || inLot(x, z, 1)) return null;
  if (height(x, z) < -1) return { reeds: 15, willow: 0.03, grass: 20 };
  return { stone_pine: 0.03, cypress: 0.03, grass: 20 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { stone_pine: 0.03, cypress: 0.03, willow: 0.03 },
  climate: {
    sun: { az: 150, el: 55, color: [1.0, 0.96, 0.88], intensity: 3.5, lat: 42, dec: 12, hour: 10.5 },
    sky: { turbidity: 2.8, rayleigh: 1.1, mie: 0.005, mieG: 0.78, zenith: [0.08, 0.16, 0.4], horizon: [0.62, 0.66, 0.7] },
    fog: { color: [0.78, 0.79, 0.8], density: 0.0003, height: 0.01 },
    exposure: 0.48,
    wind: [0.4, 0.2],
    weather: [
      { id: 'clear', weight: 4, clouds: 0.15, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'cloud', weight: 2, clouds: 0.5, cloudDensity: 0.55, sun: 0.8, fog: 1.2 },
      { id: 'shower', weight: 0.6, clouds: 0.9, cloudDensity: 0.85, sun: 0.4, fog: 1.6, rain: 0.6 },
    ],
  },
};
