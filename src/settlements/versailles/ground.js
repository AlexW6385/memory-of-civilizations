// Versailles — the ground: raked gravel walks, the green of the Tapis Vert, clipped box, the
// bosquets' dense woods of hornbeam, lime and elm, the Grand Canal; the soft light of the
// Île-de-France.

import { RADIUS, CHATEAU, LOGIS, WINGS, PARTERRE, TAPIS, PLACE, height, inCanal, onAvenue, inRect, inLot } from './layout.js';

const BUILT = [CHATEAU, LOGIS, ...WINGS];
function cover(x, z, h) {
  const c = { sand: 0.2, grass: 0.6, rock: 0, soil: 0.2, fields: 0, dry: 0.2, warmth: 0.45, red: 0.05, road: 0, snow: 0, forest: 0 };
  if (inRect(PARTERRE, x, z) || inRect(PLACE, x, z) || onAvenue(x, z) || (Math.abs(z) < 34 && x < -60 && !inRect(TAPIS, x, z))) { c.road = 0.6; c.sand = 0.4; return c; }
  if (inRect(TAPIS, x, z)) { c.grass = 0.95; c.soil = 0.05; return c; }
  return c;
}
function water(x, z, y) { return inCanal(x, z) && y < -0.7; }
function waterLevel(x, z) { return inCanal(x, z) ? -1 : -Infinity; }
function fromWater(x, z) { return inCanal(x, z) ? -2 : 20; }
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inCanal(x, z) || BUILT.some((r) => inRect(r, x, z, 6)) || inRect(PARTERRE, x, z, 3) || inRect(TAPIS, x, z, 4) || inRect(PLACE, x, z, 3) || onAvenue(x, z, -4) || inLot(x, z, 1)) return null;
  if (x < -60 && Math.abs(z) < 34) return null;                                     // the axis's walks
  if (x < 0 && x > -360 && Math.abs(z) < 260) return { elm: 0.35, oak: 0.1 };      // the bosquets
  if (onAvenue(x, z, 4)) return { elm: 0.2 };                                        // the avenues' rows
  return { elm: 0.04, grass: 25 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { elm: 0.35, oak: 0.1 },
  climate: {
    sun: { az: 200, el: 45, color: [1.0, 0.96, 0.9], intensity: 3.3, lat: 49, dec: 12, hour: 14 },
    sky: { turbidity: 2.8, rayleigh: 1.1, mie: 0.006, mieG: 0.78, zenith: [0.08, 0.15, 0.38], horizon: [0.64, 0.68, 0.72] },
    fog: { color: [0.76, 0.78, 0.8], density: 0.0004, height: 0.012 },
    exposure: 0.5,
    wind: [0.4, 0.2],
    weather: [
      { id: 'fair', weight: 3, clouds: 0.35, cloudDensity: 0.45, sun: 1.0, fog: 1 },
      { id: 'cloud', weight: 2, clouds: 0.65, cloudDensity: 0.65, sun: 0.75, fog: 1.2 },
      { id: 'rain', weight: 0.8, clouds: 0.95, cloudDensity: 0.9, sun: 0.35, fog: 1.8, rain: 0.7 },
    ],
  },
};
