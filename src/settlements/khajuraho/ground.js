// Khajuraho — the ground: lawns and packed earth round the temples, the red-brown plain of
// Bundelkhand with fields, mango, neem and palms, the tank with its ghats; the hot, hazy sky.

import { RADIUS, TANK, height, inTank, tankD, nearTemple, inLot } from './layout.js';

function cover(x, z, h) {
  const c = { sand: 0.2, grass: 0.35, rock: 0, soil: 0.45, fields: 0, dry: 0.65, warmth: 0.85, red: 0.5, road: 0, snow: 0, forest: 0 };
  if (nearTemple(x, z, 4)) { c.road = 0.6; return c; }
  if (h < -0.5) { c.soil = 0.7; c.grass = 0.3; return c; }
  if (Math.hypot(x, z) > 270) { c.fields = 0.7; c.grass = 0.2; return c; }
  return c;
}
function water(x, z, y) { return inTank(x, z) && y < TANK.level + 0.3; }
function waterLevel(x, z) { return inTank(x, z) ? TANK.level : -Infinity; }
function fromWater(x, z) { return Math.max(-5, Math.min(40, tankD(x, z))); }
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inTank(x, z) || nearTemple(x, z, 6) || inLot(x, z, 1)) return null;
  if (tankD(x, z) < 8) return { reeds: 10, grass: 20 };
  if (x > 100) return { neem: 0.06, banyan: 0.01, date_palm: 0.04, grass: 14 };
  return { neem: 0.02, grass: 25 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { neem: 0.06, banyan: 0.01, date_palm: 0.04 },
  climate: {
    sun: { az: 120, el: 55, color: [1.0, 0.95, 0.85], intensity: 3.5, lat: 25, dec: 8, hour: 9.5 },
    sky: { turbidity: 4.5, rayleigh: 1.3, mie: 0.006, mieG: 0.8, zenith: [0.1, 0.17, 0.36], horizon: [0.64, 0.62, 0.58] },
    fog: { color: [0.78, 0.76, 0.72], density: 0.0005, height: 0.012 },
    exposure: 0.5,
    wind: [0.3, 0.2],
    weather: [
      { id: 'hazy', weight: 4, clouds: 0.2, cloudDensity: 0.4, sun: 0.95, fog: 1.3 },
      { id: 'monsoon-cloud', weight: 1.5, clouds: 0.7, cloudDensity: 0.7, sun: 0.7, fog: 1.4 },
    ],
  },
};
