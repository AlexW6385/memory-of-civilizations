// Knossos — the ground: the low hill of Kefala, terra rossa and limestone; olive groves and
// vineyards round the town, cypresses on the hills, plane trees and oleander along the Kairatos;
// the bright Cretan summer.

import { RADIUS, PALACE, THEATRAL, STREAM, height, onRoad, inRect, inLot } from './layout.js';
import { YARD } from './life.js';

function cover(x, z, h) {
  const c = { sand: 0.1, grass: 0.3, rock: 0.1, soil: 0.5, fields: 0, dry: 0.7, warmth: 0.75, red: 0.55, road: 0, snow: 0, forest: 0 };
  if (inRect(PALACE, x, z, 2) || inRect([-130, -60, -64, 60], x, z) || inRect(THEATRAL, x, z, 3)) { c.road = 0.8; c.red = 0.2; return c; }
  if (onRoad(x, z)) { c.road = 0.8; return c; }
  if (Math.hypot(x, z) > RADIUS - 70) { c.fields = 0.5; c.grass = 0.4; return c; }
  return c;
}
const water = () => false, waterLevel = () => -Infinity, fromWater = (x) => Math.abs(x - STREAM.x) < 30 ? Math.abs(x - STREAM.x) : 1e4;
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inRect(PALACE, x, z, 6) || inRect([-130, -60, -64, 60], x, z, 2) || inRect(THEATRAL, x, z, 4) || onRoad(x, z, 1) || inLot(x, z, 1) || inRect(YARD, x, z, 2)) return null;
  if (Math.abs(x - STREAM.x) < 25) return { plane_tree: 0.05, oleander: 0.1, grass: 25 };
  if (x > 160 || Math.hypot(x, z) > 260) return { olive: 0.25, cypress: 0.03, grass_dry: 14 };
  return { olive: 0.05, cypress: 0.02, grass_dry: 10 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { olive: 0.25, cypress: 0.03, plane_tree: 0.05, oleander: 0.1 },
  climate: {
    sun: { az: 150, el: 58, color: [1.0, 0.96, 0.88], intensity: 3.6, lat: 35, dec: 15, hour: 10.5 },
    sky: { turbidity: 2.4, rayleigh: 1.0, mie: 0.004, mieG: 0.78, zenith: [0.07, 0.16, 0.42], horizon: [0.6, 0.66, 0.72] },
    fog: { color: [0.76, 0.8, 0.84], density: 0.00025, height: 0.01 },
    exposure: 0.48,
    wind: [0.7, 0.3],
    weather: [
      { id: 'clear', weight: 5, clouds: 0.1, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'meltemi-cloud', weight: 1.5, clouds: 0.35, cloudDensity: 0.45, sun: 0.9, fog: 1 },
    ],
  },
};
