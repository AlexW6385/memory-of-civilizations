// Florence — the ground: the stone paving of the piazzas and streets, the Arno's green water and
// its banks, cypresses and umbrella pines in the gardens; the clear Tuscan light.

import { RADIUS, PIAZZA_DUOMO, SIGNORIA, ORSAN, ARNO, height, inArno, inRect, inLot } from './layout.js';

function cover(x, z, h) {
  const c = { sand: 0.1, grass: 0.3, rock: 0, soil: 0.4, fields: 0, dry: 0.45, warmth: 0.6, red: 0.25, road: 0.3, snow: 0, forest: 0 };
  if (inRect(PIAZZA_DUOMO, x, z) || inRect(SIGNORIA, x, z) || inRect(ORSAN, x, z, 6)) { c.road = 0.9; return c; }
  if (h < -1) { c.soil = 0.8; c.grass = 0.2; c.road = 0; return c; }
  return c;
}
function water(x, z, y) { return inArno(x, z) && y < ARNO.level + 0.3; }
function waterLevel(x, z) { return inArno(x, z) ? ARNO.level : -Infinity; }
function fromWater(x, z) { return inArno(x, z) ? -3 : Math.max(-5, Math.min(40, height(x, z) - ARNO.level)); }
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inArno(x, z) || inRect(PIAZZA_DUOMO, x, z, 2) || inRect(SIGNORIA, x, z, 2) || inRect(ORSAN, x, z, 7) || inLot(x, z, 1)) return null;
  if (height(x, z) < -1) return { reeds: 6, willow: 0.03, grass: 20 };
  return { cypress: 0.02, stone_pine: 0.008, grass: 10 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { cypress: 0.02, stone_pine: 0.008, willow: 0.03 },
  climate: {
    sun: { az: 150, el: 52, color: [1.0, 0.96, 0.88], intensity: 3.5, lat: 44, dec: 12, hour: 10.5 },
    sky: { turbidity: 2.6, rayleigh: 1.05, mie: 0.005, mieG: 0.78, zenith: [0.07, 0.15, 0.4], horizon: [0.62, 0.66, 0.72] },
    fog: { color: [0.78, 0.8, 0.82], density: 0.0003, height: 0.01 },
    exposure: 0.48,
    wind: [0.3, 0.2],
    weather: [
      { id: 'clear', weight: 4, clouds: 0.2, cloudDensity: 0.35, sun: 1.0, fog: 1 },
      { id: 'cloud', weight: 2, clouds: 0.55, cloudDensity: 0.6, sun: 0.8, fog: 1.2 },
      { id: 'rain', weight: 0.6, clouds: 0.92, cloudDensity: 0.85, sun: 0.35, fog: 1.7, rain: 0.7 },
    ],
  },
};
