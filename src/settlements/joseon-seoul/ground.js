// Joseon Hanyang — the ground: the valley at Bugaksan's foot rising to the north, the palace's
// courts level, the pond and the stream; pines and willows in the palace, pines on the northern
// slopes, a few trees in the yards; Korea's clear autumn sky.

import { RADIUS, PALACE, POND, inRect, inPond, inStream, inLot, smooth as sm } from './layout.js';
const WATER = -1.2, BED = -2.6;
function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  let h = Math.max(0, -z - 300) * 0.35;                       // Bugaksan's foot
  if (inRect(PALACE, x, z)) { h = 0; if (z < -200 && z > -260 && Math.abs(x) < 50) h = 3 * sm(-200, -230, z); }   // Amisan's terraces
  if (inPond(x, z)) h = BED * sm(0, 3, Math.min(x - POND[0], POND[2] - x, z - POND[1], POND[3] - z));
  if (inStream(x, z)) h = BED;
  return h * (1 - sm(RADIUS - 30, RADIUS, r));
}
const wet = (x, z) => inPond(x, z) || inStream(x, z);
function cover(x, z) {
  const c = { sand: 0.2, grass: 0.3, rock: 0, soil: 0.5, fields: 0, dry: 0.3, warmth: 0.45, red: 0, road: 0, snow: 0, forest: 0 };
  if (wet(x, z)) { c.soil = 0.5; c.rock = 0.5; return c; }
  if (inRect(PALACE, x, z)) { c.sand = 0.6; c.soil = 0.4; c.road = 0.3; return c; }
  if (-z > 300) { c.forest = 0.6; c.grass = 0.4; return c; }
  c.road = inLot(x, z, 0.3) ? 0 : 0.45; return c;
}
function water(x, z, y) { return wet(x, z) && y < WATER + 0.3; }
function waterLevel(x, z) { return wet(x, z) ? WATER : -Infinity; }
function fromWater(x, z) { return wet(x, z) ? 0 : 40; }
/** Plants per 100 m²: pines and willows round the pond, flowering trees on Amisan, pines on the northern slopes, none in the courts. */
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 6 || wet(x, z)) return null;
  if (inRect(POND, x, z, 8) && !inRect(POND, x, z, 1)) return { willow: 1.2, red_pine: 0.4, grass: 20 };
  if (inRect(PALACE, x, z)) return z < -200 && z > -260 && Math.abs(x) < 50 ? { maple: 0.8, red_pine: 0.3, grass: 25 } : (inRect(PALACE, x, z, -6) ? null : { red_pine: 0.15 });
  if (-z > 300) return { red_pine: 0.9, maple: 0.2, grass: 20 };
  if (inLot(x, z, 0.5)) return null;
  return null;
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { willow: 1.2, red_pine: 0.9, maple: 0.8 },
  climate: {
    sun: { az: 165, el: 38, color: [1.0, 0.95, 0.87], intensity: 3.1, lat: 37.6, dec: -5, hour: 10.5 },
    sky: { turbidity: 2.8, rayleigh: 1.1, mie: 0.004, mieG: 0.8, zenith: [0.1, 0.18, 0.38], horizon: [0.63, 0.67, 0.72] },
    fog: { color: [0.76, 0.78, 0.8], density: 0.0004, height: 0.01 },
    exposure: 0.5,
    wind: [0.3, 0.2],
    weather: [
      { id: 'clear', weight: 3, clouds: 0.15, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'spring-haze', weight: 1.5, clouds: 0.3, cloudDensity: 0.4, sun: 0.8, fog: 2 },
      { id: 'drizzle', weight: 1, clouds: 0.9, cloudDensity: 0.75, sun: 0.35, fog: 2, rain: 0.5 },
    ],
  },
};
