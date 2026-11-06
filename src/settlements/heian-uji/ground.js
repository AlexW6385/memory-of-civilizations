// Uji — the ground: the temple's raked white gravel and moss, the pond, pines and maples in the
// garden, the swift Uji River with its pebbled banks, wooded hills of cedar and maple beyond; the
// soft, humid light of the Kyoto basin.

import { RADIUS, GARDEN, RIVER, POND_LEVEL, height, inPond, inRiver, inRect, inLot, pondDistance, islandDistance } from './layout.js';

function cover(x, z, h, ny) {
  const c = { sand: 0.1, grass: 0.55, rock: 0, soil: 0.35, fields: 0, dry: 0.15, warmth: 0.5, red: 0.05, road: 0, snow: 0, forest: 0.1 };
  // the garden: a beach of gravel round the pond, moss under the pines and maples beyond it
  if (islandDistance(x, z) < -1.5) { c.sand = 0.15; c.grass = 0.8; c.soil = 0.05; return c; }      // the small island's turf
  if (inRect(GARDEN, x, z)) {
    const d = pondDistance(x, z);
    if (d < 5 || Math.hypot(x + 40, z) < 26) { c.sand = 0.85; c.grass = 0.1; c.soil = 0.05; c.dry = 0.05; return c; }
    c.sand = 0.05; c.grass = 0.85; c.soil = 0.1; c.dry = 0; c.warmth = 0.4; return c;
  }
  if (h < -1 && !inPond(x, z)) { c.rock = 0.4; c.sand = 0.4; return c; }
  if (h > 4) { c.forest = 0.7; c.grass = 0.3; return c; }
  return c;
}
function water(x, z, y) { return (inRiver(x, z) && y < RIVER.level + 0.3) || (inPond(x, z) && y < POND_LEVEL + 0.2); }
function waterLevel(x, z) { return inRiver(x, z) ? RIVER.level : inPond(x, z) ? POND_LEVEL : -Infinity; }
function fromWater(x, z) { return inRiver(x, z) || inPond(x, z) ? -2 : Math.max(-5, Math.min(40, height(x, z) - RIVER.level)); }
function planting(x, z) {
  if (islandDistance(x, z) < -1.5) return { grass: 6 };                      // the small island: low grass in its middle
  if (Math.hypot(x, z) > RADIUS - 6 || inRiver(x, z) || inPond(x, z) || inLot(x, z, 1)) return null;
  if (inRect(GARDEN, x, z)) {
    const d = pondDistance(x, z);
    if (d < 5 || Math.hypot(x + 40, z) < 28 || Math.hypot(x - 50, z - 46) < 7) return null;
    return d < 16 ? { red_pine: 0.06, grass: 3 } : { red_pine: 0.1, maple: 0.08, grass: 4 };
  }
  if (height(x, z) > 4) return { sugi: 0.2, maple: 0.06, red_pine: 0.05, grass: 15 };
  return { red_pine: 0.02, grass: 20 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { sugi: 0.2, maple: 0.08, red_pine: 0.1 },
  climate: {
    sun: { az: 110, el: 42, color: [1.0, 0.96, 0.9], intensity: 3.3, lat: 35, dec: 5, hour: 9 },
    sky: { turbidity: 3.2, rayleigh: 1.1, mie: 0.006, mieG: 0.78, zenith: [0.08, 0.15, 0.38], horizon: [0.64, 0.68, 0.72] },
    fog: { color: [0.78, 0.8, 0.82], density: 0.00045, height: 0.012 },
    exposure: 0.5,
    wind: [0.3, 0.2],
    weather: [
      { id: 'clear', weight: 3, clouds: 0.3, cloudDensity: 0.4, sun: 1.0, fog: 1 },
      { id: 'mist', weight: 1.5, clouds: 0.5, cloudDensity: 0.5, sun: 0.75, fog: 2.2 },
      { id: 'rain', weight: 1, clouds: 0.95, cloudDensity: 0.9, sun: 0.35, fog: 1.8, rain: 0.7 },
    ],
  },
};
