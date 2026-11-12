// Istanbul — the ground: the paved terrace and courts, gardens with cypresses and plane trees, the
// steep lanes; the bright, windy sky over the Golden Horn.

import { RADIUS, TERRACE, PRECINCT, height, inRect, inLot, inYard, laneAt, inCemetery, nearGrave, inKulliye } from './layout.js';

function cover(x, z, h, ny) {
  const c = { sand: 0.1, grass: 0.45, rock: 0, soil: 0.45, fields: 0, dry: 0.35, warmth: 0.55, red: 0.2, road: 0, snow: 0, forest: 0 };
  if (inCemetery(x, z)) { c.grass = 0.65; c.soil = 0.35; return c; }
  if (inRect(PRECINCT, x, z)) { c.road = 0.85; return c; }
  if (laneAt(x, z)) { c.road = 0.9; c.soil = 0.1; c.grass = 0; return c; }
  if (inYard(x, z)) { c.grass = 0.6; c.soil = 0.35; return c; }
  if (inRect(TERRACE, x, z)) { c.road = 0.5; c.grass = 0.4; return c; }
  if (ny < 0.85) { c.soil = 0.6; c.grass = 0.4; return c; }
  return c;
}
const water = () => false, waterLevel = () => -Infinity, fromWater = () => 1e4;
function planting(x, z) {
  // the burial garden behind the qibla wall: cypresses among the graves
  if (inCemetery(x, z)) return nearGrave(x, z, 1.2) ? null : { cypress: 0.05, grass: 22 };
  // the outer court: plane trees and cypresses in the side yards and the forecourt, the central way and the mosque left clear
  if (inRect(PRECINCT, x, z)) {
    if (Math.abs(x) < 14 || !inRect(PRECINCT, x, z, -5) || inRect([-34, -50, 34, 52], x, z) || inKulliye(x, z, 1.5) || Math.hypot(x, z + 91) < 7) return null;
    return { plane_tree: 0.011, cypress: 0.009 };
  }
  if (inYard(x, z) && inRect([90, 118, 116, 146], x, z)) return null;
  if (inYard(x, z)) return { fig: 0.02, cypress: 0.012, stone_pine: 0.004, grass: 20 };
  if (laneAt(x, z, 0.5)) return null;
  if (Math.hypot(x, z) > RADIUS - 6 || inRect(PRECINCT, x, z, 4) || inLot(x, z, 1) || inKulliye(x, z, 1.5)) return null;
  if (inRect(TERRACE, x, z)) return z > 95 && z < 104 ? { cypress: 0.06, grass: 20 } : null;
  return { cypress: 0.03, plane_tree: 0.004, fig: 0.004, grass: 14 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { cypress: 0.06, plane_tree: 0.014, fig: 0.025, stone_pine: 0.01 },
  climate: {
    sun: { az: 155, el: 52, color: [1.0, 0.96, 0.9], intensity: 3.5, lat: 41, dec: 10, hour: 11 },
    sky: { turbidity: 2.6, rayleigh: 1.05, mie: 0.005, mieG: 0.78, zenith: [0.07, 0.15, 0.4], horizon: [0.62, 0.66, 0.72] },
    fog: { color: [0.78, 0.8, 0.83], density: 0.0003, height: 0.01 },
    exposure: 0.48,
    wind: [0.9, 0.3],
    weather: [
      { id: 'clear', weight: 4, clouds: 0.2, cloudDensity: 0.35, sun: 1.0, fog: 1 },
      { id: 'cloud', weight: 2, clouds: 0.55, cloudDensity: 0.6, sun: 0.8, fog: 1.2 },
      { id: 'rain', weight: 0.7, clouds: 0.92, cloudDensity: 0.85, sun: 0.35, fog: 1.7, rain: 0.7 },
    ],
  },
};
