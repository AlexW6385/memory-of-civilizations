// Babylon — the ground: the flat alluvium, the baked-brick paving of the Processional Way, dusty
// lanes, date palms in gardens and along the Euphrates, reeds on its banks; the hard, hazy light.

import { RADIUS, PALACE, PRECINCT, ESAGILA, RIVER, height, inRiver, onWay, inRect, inLot } from './layout.js';

function cover(x, z, h) {
  const c = { sand: 0.5, grass: 0.05, rock: 0, soil: 0.45, fields: 0, dry: 0.9, warmth: 0.85, red: 0.2, road: 0, snow: 0, forest: 0 };
  if (onWay(x, z) || [PALACE, PRECINCT, ESAGILA].some((r) => inRect(r, x, z))) { c.road = 0.8; return c; }
  if (h < -1) { c.soil = 0.8; c.grass = 0.2; return c; }
  return c;
}
function water(x, z, y) { return inRiver(x, z) && y < RIVER.level + 0.3; }
function waterLevel(x, z) { return inRiver(x, z) ? RIVER.level : -Infinity; }
function fromWater(x, z) { return inRiver(x, z) ? -3 : Math.max(-5, Math.min(40, height(x, z) - RIVER.level)); }
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inRiver(x, z) || onWay(x, z, 2) || [PALACE, PRECINCT, ESAGILA].some((r) => inRect(r, x, z, 4)) || inLot(x, z, 1)) return null;
  if (height(x, z) < -1) return { reeds: 15, date_palm: 0.05 };
  if (x < -200) return { date_palm: 0.25, grass: 8 };
  return { date_palm: 0.03 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { date_palm: 0.25 },
  climate: {
    sun: { az: 140, el: 58, color: [1.0, 0.95, 0.85], intensity: 3.7, lat: 32, dec: 10, hour: 10 },
    sky: { turbidity: 4.0, rayleigh: 1.2, mie: 0.007, mieG: 0.8, zenith: [0.1, 0.17, 0.36], horizon: [0.68, 0.66, 0.62] },
    fog: { color: [0.8, 0.77, 0.72], density: 0.0004, height: 0.01 },
    exposure: 0.47,
    wind: [0.6, 0.2],
    weather: [
      { id: 'clear', weight: 5, clouds: 0.08, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'dusty', weight: 1.5, clouds: 0.1, cloudDensity: 0.3, sun: 0.8, fog: 2.0 },
    ],
  },
};
