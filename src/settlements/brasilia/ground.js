// Brasília, 1970 — the ground: the plateau's red earth (cerrado), the Esplanade's lawn between the carriageways, the asphalt of
// the axis and the avenue, the Praça's paving, the superquadra's belt of trees and lawns; the Cathedral's sunken nave. The
// dry season's hard blue light, high sun at latitude 16° S.

import { RADIUS, LAWN, PRACA, SQ, RING, BELT, CATH, POOLS, pitDepth, inRect, onRoad, inBuilding, smooth as sm } from './layout.js';

function height(x, z) { return Math.hypot(x, z) > RADIUS ? 0 : pitDepth(x, z); }
function cover(x, z) {
  const c = { sand: 0.05, grass: 0.35, rock: 0, soil: 0.55, fields: 0, dry: 0.55, warmth: 0.7, red: 0.75, road: 0, snow: 0, forest: 0 };
  if (onRoad(x, z, 0.5)) { c.road = 0.97; c.grass = 0; c.red = 0.05; c.soil = 0.1; return c; }
  if (inRect(PRACA, x, z)) { c.road = 0.9; c.grass = 0; c.red = 0.05; return c; }
  if (inRect(LAWN, x, z) || inRect(SQ, x, z)) { c.grass = 0.85; c.soil = 0.2; c.red = 0.3; c.dry = 0.35; return c; }
  if (Math.hypot(x - CATH.c[0], z - CATH.c[1]) < CATH.pool + 14) { c.road = 0.6; c.grass = 0.2; c.red = 0.1; return c; }
  return c;
}
const water = () => false, waterLevel = () => -Infinity, fromWater = () => 1e4;
/** Plants per 100 m²: palms in rows by the carriageways, the lawn's few trees, the superquadra's belt and its lawns' trees, cerrado outside. */
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 6 || inBuilding(x, z, 1.5) || onRoad(x, z, 1.2) || inRect(PRACA, x, z, 1) || Math.hypot(x - CATH.c[0], z - CATH.c[1]) < CATH.pool + 3) return null;
  if (POOLS.some((p) => inRect(p, x, z, 2))) return null;
  if (inRect(SQ, x, z)) {
    const edge = Math.min(x - SQ[0], SQ[2] - x, z - SQ[1], SQ[3] - z);
    if (edge < BELT) return { neem: 0.5, fig: 0.35, acacia: 0.15, grass: 28 };
    return { fig: 0.05, acacia: 0.04, date_palm: 0.03, grass: 30 };
  }
  if (inRect(LAWN, x, z)) {
    if (Math.abs(z) > 106) return { date_palm: 0.12, grass: 30 };
    return { acacia: 0.012, neem: 0.006, grass: 30 };
  }
  if (r < 300) return { acacia: 0.04, maquis: 0.12, grass_dry: 16, fig: 0.01 };
  return { acacia: 0.1, maquis: 0.25, grass_dry: 18, neem: 0.02 };
}
void sm; void RING;
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { neem: 0.5, fig: 0.35, acacia: 0.15, date_palm: 0.12, maquis: 0.25 },
  climate: {
    sun: { az: 150, el: 62, color: [1.0, 0.96, 0.88], intensity: 3.6, lat: -15.8, dec: 10, hour: 10 },
    sky: { turbidity: 2.0, rayleigh: 1.1, mie: 0.003, mieG: 0.8, zenith: [0.07, 0.17, 0.44], horizon: [0.6, 0.67, 0.76] },
    fog: { color: [0.74, 0.78, 0.84], density: 0.00022, height: 0.01 },
    exposure: 0.46,
    wind: [0.5, 0.15],
    damp: 0.15,
    weather: [
      { id: 'clear', weight: 5, clouds: 0.12, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'cloud', weight: 1.5, clouds: 0.55, cloudDensity: 0.55, sun: 0.8, fog: 1.2 },
      { id: 'rain', weight: 0.8, clouds: 0.9, cloudDensity: 0.8, sun: 0.4, fog: 1.7, rain: 0.5 },
    ],
  },
};
