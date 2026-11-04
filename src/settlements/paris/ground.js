// Paris — the ground: mud and paving of the streets, the stone quays, gardens with fruit trees
// and lime trees, willows on the banks, the Seine; the soft, changeable sky of the Île-de-France.

import { RADIUS, PALACE, PARVIS, CATHEDRAL, RIVER, height, inRiver, inRect, inLot } from './layout.js';

function cover(x, z, h) {
  const c = { sand: 0, grass: 0.45, rock: 0, soil: 0.55, fields: 0, dry: 0.2, warmth: 0.4, red: 0.1, road: 0, snow: 0, forest: 0 };
  if (inRect(PALACE, x, z) || inRect(PARVIS, x, z) || inRect(CATHEDRAL, x, z, 4)) { c.road = 0.8; return c; }
  if (h < 0) { c.soil = 0.8; c.grass = 0.2; return c; }
  c.road = 0.4; return c;
}
function water(x, z, y) { return inRiver(x, z) && y < RIVER.level + 0.3; }
function waterLevel(x, z) { return inRiver(x, z) ? RIVER.level : -Infinity; }
function fromWater(x, z) { return inRiver(x, z) ? -3 : Math.max(-5, Math.min(40, height(x, z) - RIVER.level)); }
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inRiver(x, z) || inRect(PALACE, x, z, 3) || inRect(PARVIS, x, z, 2) || inRect(CATHEDRAL, x, z, 6) || inLot(x, z, 0.5)) return null;
  if (height(x, z) < 0.5) return { willow: 0.04, reeds: 8, grass: 25 };
  return { apple: 0.03, elm: 0.01, grass: 20 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { willow: 0.04, apple: 0.03, elm: 0.01 },
  climate: {
    sun: { az: 150, el: 48, color: [1.0, 0.96, 0.9], intensity: 3.3, lat: 49, dec: 12, hour: 11 },
    sky: { turbidity: 3.0, rayleigh: 1.1, mie: 0.006, mieG: 0.78, zenith: [0.08, 0.15, 0.38], horizon: [0.62, 0.66, 0.72] },
    fog: { color: [0.76, 0.78, 0.8], density: 0.0004, height: 0.012 },
    exposure: 0.5,
    wind: [0.6, 0.3],
    weather: [
      { id: 'changeable', weight: 3, clouds: 0.55, cloudDensity: 0.6, sun: 0.85, fog: 1.1 },
      { id: 'clear', weight: 2, clouds: 0.2, cloudDensity: 0.35, sun: 1.0, fog: 1 },
      { id: 'rain', weight: 1.2, clouds: 0.95, cloudDensity: 0.9, sun: 0.35, fog: 1.8, rain: 0.8 },
    ],
  },
};
