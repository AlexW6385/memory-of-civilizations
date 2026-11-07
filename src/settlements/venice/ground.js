// Venice — the ground: the trachyte paving of the piazza and the fondamente, the brick of the
// campi, a few gardens with fig and pomegranate, the green water of the canals and the lagoon; the
// soft, hazy, watery light.

import { RADIUS, SEA, RIM, PIAZZA, PIAZZETTA, BASILICA, height, inWater, inRect, inLot } from './layout.js';
const CHURCH = [BASILICA.c[0] - BASILICA.s - 13, BASILICA.c[1] - BASILICA.s * 0.85, BASILICA.c[0] + BASILICA.s + 4, BASILICA.c[1] + BASILICA.s * 0.85];

function cover(x, z, h) {
  const c = { sand: 0, grass: 0.1, rock: 0, soil: 0.2, fields: 0, dry: 0.3, warmth: 0.5, red: 0.15, road: 0.7, snow: 0, forest: 0 };
  if (inRect(PIAZZA, x, z) || inRect(PIAZZETTA, x, z)) { c.road = 0.95; return c; }
  if (h < 0) { c.soil = 0.8; c.road = 0; return c; }
  return c;
}
function water(x, z, y) { return inWater(x, z) && y < SEA + 0.3; }
function waterLevel(x, z) { return inWater(x, z) ? SEA : -Infinity; }
function fromWater(x, z) { return Math.max(-5, Math.min(40, height(x, z) - SEA)); }
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inWater(x, z) || height(x, z) < 0.5 || inRect(PIAZZA, x, z, 2) || inRect(PIAZZETTA, x, z, 2) || inLot(x, z, 1) || inRect(CHURCH, x, z)) return null;
  return { fig: 0.01, grass: 4 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater, rim: RIM,
  sea: SEA,   // the planet's sea is this water, at this level (src/planet/relief.js)
  maxDensity: { fig: 0.01 },
  climate: {
    sun: { az: 160, el: 48, color: [1.0, 0.96, 0.9], intensity: 3.4, lat: 45, dec: 12, hour: 11 },
    sky: { turbidity: 3.4, rayleigh: 1.1, mie: 0.007, mieG: 0.8, zenith: [0.08, 0.15, 0.38], horizon: [0.66, 0.7, 0.74] },
    fog: { color: [0.8, 0.82, 0.84], density: 0.0005, height: 0.012 },
    exposure: 0.5,
    wind: [0.4, 0.2],
    weather: [
      { id: 'hazy', weight: 3, clouds: 0.3, cloudDensity: 0.4, sun: 0.95, fog: 1.3 },
      { id: 'clear', weight: 2, clouds: 0.15, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'mist', weight: 1, clouds: 0.6, cloudDensity: 0.6, sun: 0.6, fog: 2.6 },
    ],
  },
};
