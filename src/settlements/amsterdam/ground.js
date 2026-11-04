// Amsterdam — the ground: the brick-paved quays and streets, rows of elms along the canals, the
// canals' dark water, the IJ; the soft grey light and big clouds of Holland.

import { RADIUS, DAM, WATER, height, inWater, wet, inRect, inLot } from './layout.js';

function cover(x, z, h) {
  const c = { sand: 0, grass: 0.2, rock: 0, soil: 0.2, fields: 0, dry: 0.15, warmth: 0.35, red: 0.25, road: 0.7, snow: 0, forest: 0 };
  if (inRect(DAM, x, z)) { c.road = 0.95; return c; }
  if (h < 0) { c.soil = 0.8; c.road = 0; return c; }
  return c;
}
function water(x, z, y) { return inWater(x, z) && y < WATER + 0.3; }
function waterLevel(x, z) { return inWater(x, z) ? WATER : -Infinity; }
function fromWater(x, z) { return Math.max(-5, Math.min(40, height(x, z) - WATER)); }
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inWater(x, z) || inRect(DAM, x, z, 2) || inLot(x, z, 0.5)) return null;
  const w = wet(x, z);
  if (w > 1.5 && w < 5) return { elm: 0.25 };                                    // the rows of elms along the quays
  return { grass: 6 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { elm: 0.25 },
  climate: {
    sun: { az: 170, el: 42, color: [1.0, 0.96, 0.9], intensity: 3.1, lat: 52, dec: 12, hour: 12 },
    sky: { turbidity: 3.0, rayleigh: 1.1, mie: 0.006, mieG: 0.78, zenith: [0.09, 0.16, 0.36], horizon: [0.66, 0.7, 0.74] },
    fog: { color: [0.76, 0.78, 0.82], density: 0.0005, height: 0.012 },
    exposure: 0.52,
    wind: [1.0, 0.4],
    weather: [
      { id: 'big-clouds', weight: 3, clouds: 0.6, cloudDensity: 0.6, sun: 0.85, fog: 1.1 },
      { id: 'clear', weight: 1.2, clouds: 0.25, cloudDensity: 0.4, sun: 1.0, fog: 1 },
      { id: 'drizzle', weight: 1.5, clouds: 0.95, cloudDensity: 0.9, sun: 0.35, fog: 1.8, rain: 0.6 },
    ],
  },
};
