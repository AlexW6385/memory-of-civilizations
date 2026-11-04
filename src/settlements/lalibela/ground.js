// Zagwe Lalibela — the ground: the church precinct level on the plateau, the pits and trenches cut
// down into the red tuff, the slopes rising round it with terraced fields; juniper, wild olive and
// acacia, grass; the clear, cool sky of the highlands.

import { RADIUS, cutDepth, inCut, slope, nearHouse, smooth as sm } from './layout.js';

function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  return (slope(x, z) - cutDepth(x, z)) * (1 - sm(RADIUS - 30, RADIUS, r));
}
function cover(x, z) {
  const c = { sand: 0, grass: 0.45, rock: 0, soil: 0.45, fields: 0, dry: 0.45, warmth: 0.6, red: 0.35, road: 0, snow: 0, forest: 0 };
  if (inCut(x, z, 1)) { c.rock = 0.9; c.soil = 0.1; c.grass = 0; return c; }
  const r = Math.hypot(x, z);
  if (r > 260 && r < RADIUS - 20) { c.fields = 0.6; c.grass = 0.3; c.soil = 0.1; return c; }
  return c;
}
const water = () => false, waterLevel = () => -Infinity, fromWater = () => 1e4;
/** Plants per 100 m²: juniper, wild olive and acacia scattered on the slopes and round the houses, grass; none in the cuts. */
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 6 || inCut(x, z, 2) || nearHouse(x, z, 1.5)) return null;
  if (r < 230) return { olive: 0.05, acacia: 0.04, grass_dry: 14 };
  return { olive: 0.15, acacia: 0.1, cypress: 0.06, grass_dry: 18 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { olive: 0.15, acacia: 0.1, cypress: 0.06 },
  climate: {
    sun: { az: 140, el: 55, color: [1.0, 0.96, 0.9], intensity: 3.4, lat: 12, dec: -10, hour: 10 },
    sky: { turbidity: 2.4, rayleigh: 1.0, mie: 0.004, mieG: 0.8, zenith: [0.09, 0.17, 0.38], horizon: [0.62, 0.66, 0.7] },
    fog: { color: [0.74, 0.77, 0.8], density: 0.0004, height: 0.01 },
    exposure: 0.48,
    wind: [0.3, 0.2],
    weather: [
      { id: 'clear', weight: 4, clouds: 0.15, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'escarpment-cloud', weight: 1.5, clouds: 0.55, cloudDensity: 0.5, sun: 0.75, fog: 1.6 },
    ],
  },
};
