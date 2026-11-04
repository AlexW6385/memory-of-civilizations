// Muscovy — the ground: the square's beaten earth and log paving, the streets of timber, the
// gardens and orchards behind the courts, the Moskva's low banks with willows; the northern light.
import { RADIUS, SQUARE, BASIL, RIVER, height, inRiver, inRect, inLot, inKremlin, riverZ } from './layout.js';

function cover(x, z, h) {
  const c = { sand: 0.05, grass: 0.4, rock: 0, soil: 0.4, fields: 0, dry: 0.15, warmth: 0.3, red: 0, road: 0.3, snow: 0, forest: 0 };
  if (inRect(SQUARE, x, z) || Math.hypot(x - BASIL[0], z - BASIL[1]) < 30) { c.road = 0.85; c.soil = 0.15; c.grass = 0; return c; }
  if (inKremlin(x, z, 10)) { c.road = 0.5; return c; }
  if (Math.abs(z - riverZ(x)) < RIVER.w / 2 + 8) { c.soil = 0.7; c.grass = 0.3; c.road = 0; return c; }
  return c;
}
function water(x, z, y) { return inRiver(x, z) && y < RIVER.level + 0.3; }
function waterLevel(x, z) { return inRiver(x, z) ? RIVER.level : -Infinity; }
function fromWater(x, z) { return inRiver(x, z) ? -3 : Math.max(-5, Math.min(40, height(x, z) - RIVER.level)); }
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inRiver(x, z) || inRect(SQUARE, x, z, 3) || Math.hypot(x - BASIL[0], z - BASIL[1]) < 32 || inLot(x, z, 1)) return null;
  if (inKremlin(x, z, -14) && !inKremlin(x, z, 10)) return null;                     // the wall's zone
  if (Math.abs(z - riverZ(x)) < RIVER.w / 2 + 8) return { willow: 0.04, reeds: 4, grass: 20 };
  return { birch: 0.004, apple: 0.01, elm: 0.003, grass: 14 };                          // birches, orchards, limes (elm stands in)
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { birch: 0.004, apple: 0.01, elm: 0.003, willow: 0.04 },
  climate: {
    sun: { az: 165, el: 42, color: [1.0, 0.95, 0.86], intensity: 3.3, lat: 56, dec: 15, hour: 11.5 },
    sky: { turbidity: 2.6, rayleigh: 1.1, mie: 0.005, mieG: 0.78, zenith: [0.08, 0.16, 0.42], horizon: [0.64, 0.68, 0.74] },
    fog: { color: [0.78, 0.8, 0.82], density: 0.0004, height: 0.01 },
    exposure: 0.5,
    wind: [0.4, 0.2],
    weather: [
      { id: 'clear', weight: 3, clouds: 0.25, cloudDensity: 0.4, sun: 1.0, fog: 1 },
      { id: 'cloud', weight: 2.5, clouds: 0.6, cloudDensity: 0.6, sun: 0.75, fog: 1.3 },
      { id: 'rain', weight: 0.8, clouds: 0.92, cloudDensity: 0.85, sun: 0.35, fog: 1.8, rain: 0.6 },
    ],
  },
};
