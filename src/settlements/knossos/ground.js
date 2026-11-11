// Knossos — the ground: the low hill of Kefala, terra rossa and limestone; olive groves and
// vineyards round the town, cypresses on the hills, plane trees and oleander along the Kairatos;
// the bright Cretan summer.

import { RADIUS, PALACE, THEATRAL, STREAM, STREAM_LEVEL, WESTCOURT, height, onRoad, onStream, onLane, inRect, inLot, inYard } from './layout.js';
import { YARD } from './life.js';

function cover(x, z, h) {
  const c = { sand: 0.1, grass: 0.3, rock: 0.1, soil: 0.5, fields: 0, dry: 0.7, warmth: 0.75, red: 0.55, road: 0, snow: 0, forest: 0 };
  if (inRect(PALACE, x, z, 2) || inRect(WESTCOURT, x, z) || inRect(THEATRAL, x, z, 3)) { c.road = 0.8; c.red = 0.2; return c; }
  if (onRoad(x, z) || onLane(x, z, 0.4)) { c.road = 0.8; return c; }
  if (inRect(PALACE, x, z, 12)) { c.road = 0.5; c.soil = 0.6; c.grass = 0.1; return c; }       // the trodden apron round the palace
  if (onStream(x, z, 1.5) || (onStream(x, z, 8) && h < STREAM_LEVEL + 0.8)) { c.sand = 0.5; c.rock = 0.35; c.grass = 0.05; c.soil = 0.1; return c; }
  if (inYard(x, z)) { c.soil = 0.8; c.grass = 0.05; c.dry = 0.5; return c; }
  if (Math.hypot(x, z) > RADIUS - 70) { c.fields = 0.5; c.grass = 0.4; return c; }
  return c;
}
const water = (x, z, y) => onStream(x, z, 0) && y < STREAM_LEVEL + 0.3, waterLevel = (x, z) => (onStream(x, z, 6) ? STREAM_LEVEL : -Infinity);
const fromWater = (x, z) => (onStream(x, z, 0) ? -2 : Math.abs(x - STREAM.x) < 40 ? Math.max(-5, Math.min(40, height(x, z) - STREAM_LEVEL)) : 1e4);
const cellHash = (i, j) => { let h = Math.imul(i * 73856093 ^ j * 19349663, 2654435761) >>> 0; return h / 4294967296; };
/** Plants per 100 m²: figs and olives in the yards; plane trees, oleander and reeds along the Kairatos; olives, cypresses and maquis on the hills; wheat in the plots at the edge. */
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 6 || inRect(PALACE, x, z, 6) || inRect(WESTCOURT, x, z, 2) || inRect(THEATRAL, x, z, 4) || onRoad(x, z, 1) || inLot(x, z, 1) || onLane(x, z, 0.6) || inRect(YARD, x, z, 2)) return null;
  if (inYard(x, z)) return { fig: 2.4, olive: 1.0, grass_dry: 8 };
  if (onStream(x, z, 0) && height(x, z) < STREAM_LEVEL + 0.2) return { reeds: 1.8 };
  if (onStream(x, z, 22)) return { plane_tree: 0.35, oleander: 1.6, tamarisk: 0.4, reeds: onStream(x, z, 5) ? 1.4 : 0, grass: 25 };
  if (r > 215 && cellHash(Math.floor(x / 45), Math.floor(z / 45)) < 0.35) return { wheat: 90 };
  if (x > 160 || r > 260) return { olive: 0.9, cypress: 0.12, maquis: 1.0, grass_dry: 14 };
  return { olive: 0.45, fig: 0.1, cypress: 0.08, grass_dry: 10 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { olive: 1.0, cypress: 0.12, plane_tree: 0.35, oleander: 1.6, tamarisk: 0.4, reeds: 1.8, fig: 2.4, maquis: 1.0, wheat: 90 },
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
