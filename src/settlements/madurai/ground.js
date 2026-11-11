// Madurai — the ground: the flat red-earth plain of the Vaigai; the temple's granite-paved courts;
// beaten-earth streets; coconut palms (date palms stand in), neem and banyan by the houses; the
// hot, bright sky of the south.

import { RADIUS, WALL, TANK, PUDHU, GATES, inRect, inLot, onStreet, outside, smooth as sm } from './layout.js';

/** The Golden Lotus tank's basin (its steps and floor are built; the ground drops away under them). */
const inTank = (x, z) => inRect(TANK, x, z, -0.2);
function height(x, z) { return inTank(x, z) ? -4.6 : 0; }
function cover(x, z) {
  const c = { sand: 0.2, grass: 0.1, rock: 0, soil: 0.7, fields: 0, dry: 0.5, warmth: 0.9, red: 0.6, road: 0, snow: 0, forest: 0 };
  if (inRect(WALL, x, z)) { c.road = 0.9; c.red = 0.1; return c; }
  if (onStreet(x, z) || inRect(PUDHU, x, z, 3)) { c.road = 0.7; return c; }
  if (Math.hypot(x, z) > RADIUS - 40) { c.fields = 0.6; c.grass = 0.4; return c; }
  return c;
}
const WL = -2.4;                                        // the tank's water (plan.js: depth 4, water 2.4 below the court)
const water = (x, z, y) => inRect(TANK, x, z, -0.3) && y < WL + 0.3;
const waterLevel = (x, z) => (inRect(TANK, x, z, -0.3) ? WL : -Infinity);
const fromWater = (x, z) => (inRect(TANK, x, z, -0.3) ? -1 : 1e4);
/** Plants per 100 m²: none in the temple or on the streets; palms, neem and the odd banyan in the yards. */
function planting(x, z) {
  // shade trees (neem) along the edge of the Avani Moola street and the outer back lane, clear of the axial streets and the car's street
  if (!inRect(WALL, x, z, 4) && Math.hypot(x, z) < RADIUS - 30 && !inRect(PUDHU, x, z, 6)) {
    const o = outside(x, z);
    if (o > 70.2 && o < 72.2 && Math.abs(x - GATES.s[0]) > 10 && Math.abs(x - GATES.n[0]) > 10 && Math.abs(z - GATES.e[1]) > 10 && Math.abs(z - GATES.w[1]) > 10) return { neem: 0.25 };
  }
  if (Math.hypot(x, z) > RADIUS - 6 || inRect(WALL, x, z, 4) || onStreet(x, z, 1) || inLot(x, z, 1) || inRect(PUDHU, x, z, 4)) return null;
  if (outside(x, z) < 30) return null;
  // jasmine bushes (stood in by oleander, whose flowers are offered too) and neem in the yards near the temple
  if (outside(x, z) < 60) return { oleander: 0.25, neem: 0.06, date_palm: 0.3, grass_dry: 12 };
  return { date_palm: 0.5, neem: 0.08, banyan: 0.01, grass_dry: 12 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { date_palm: 0.5, neem: 0.25, banyan: 0.01, oleander: 0.25 },
  climate: {
    sun: { az: 110, el: 48, color: [1.0, 0.95, 0.86], intensity: 3.5, lat: 10, dec: 5, hour: 9.5 },
    sky: { turbidity: 4.5, rayleigh: 1.3, mie: 0.006, mieG: 0.78, zenith: [0.1, 0.18, 0.36], horizon: [0.6, 0.6, 0.58] },
    fog: { color: [0.76, 0.75, 0.72], density: 0.0005, height: 0.012 },
    exposure: 0.5,
    damp: 0.55,     // the north-east monsoon streaks the granite and greens the shaded foot of the walls
    wind: [0.3, 0.2],
    weather: [
      { id: 'bright', weight: 4, clouds: 0.25, cloudDensity: 0.4, sun: 1.0, fog: 1 },
      { id: 'monsoon-cloud', weight: 1.5, clouds: 0.7, cloudDensity: 0.7, sun: 0.7, fog: 1.4 },
      { id: 'shower', weight: 0.7, clouds: 0.92, cloudDensity: 0.85, sun: 0.35, fog: 1.8, rain: 0.7 },
    ],
  },
};
