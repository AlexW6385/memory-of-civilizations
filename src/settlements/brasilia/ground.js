// Brasília, 1970 — the ground: the plateau's red earth (cerrado), the Esplanade's lawn between the carriageways, the asphalt of
// the axis and the avenue, the Praça's paving, the superquadra's belt of trees and lawns; the Cathedral's sunken nave. The
// dry season's hard blue light, high sun at latitude 16° S.

import { RADIUS, LAWN, PRACA, SQ, SQS, inSQ, BELT, CATH, POOLS, MINISTRIES, CAMP, PARKS, SHOPS, AVENUE, pitDepth, inRect, onRoad, inBuilding, inMedian, inPark, smooth as sm } from './layout.js';

function height(x, z) { return Math.hypot(x, z) > RADIUS ? 0 : pitDepth(x, z); }
function cover(x, z) {
  const c = { sand: 0.05, grass: 0.35, rock: 0, soil: 0.55, fields: 0, dry: 0.55, warmth: 0.7, red: 0.75, road: 0, snow: 0, forest: 0 };
  if (inRect(CAMP, x, z, 3)) { c.grass = 0.04; c.soil = 0.8; c.red = 0.95; c.dry = 0.7; return c; }
  if (inMedian(x, z)) { c.road = 0; c.grass = 0.9; c.soil = 0.15; c.red = 0.15; c.dry = 0.3; return c; }
  if (inPark(x, z, 0.2)) { c.road = 0.97; c.grass = 0; c.red = 0.05; c.soil = 0.1; return c; }
  if (onRoad(x, z, 0.5)) { c.road = 0.97; c.grass = 0; c.red = 0.05; c.soil = 0.1; return c; }
  if (inRect(PRACA, x, z)) { c.road = 0.9; c.grass = 0; c.red = 0.05; return c; }
  if (x > LAWN[0] + 30 && x < RAMP_X0 && Math.abs(z) < 1.6) { c.road = 0.55; c.grass = 0.1; c.red = 0.4; c.soil = 0.4; return c; }     // the lawn's central path, a strip of pale paving
  if (inRect(LAWN, x, z) || inSQ(x, z)) { c.grass = 0.85; c.soil = 0.2; c.red = 0.3; c.dry = 0.35; return c; }
  if (Math.hypot(x - CATH.c[0], z - CATH.c[1]) < CATH.pool + 14) { c.road = 0.6; c.grass = 0.2; c.red = 0.1; return c; }
  // the Esplanade's outer lawns round the ministries, the verges of the avenue and the shops' forecourt
  if ((Math.abs(z) > 140 && Math.abs(z) < 262 && x < -100 && x > -470) || (x > 44 && x < 68 && z > 140 && z < 505)) { c.grass = 0.55; c.dry = 0.5; c.soil = 0.4; c.red = 0.5; return c; }
  return c;
}
const RAMP_X0 = -112;
const water = () => false, waterLevel = () => -Infinity, fromWater = () => 1e4;
/** Plants per 100 m²: palms in rows by the carriageways, the lawn's few trees, the superquadra's belt and its lawns' trees, cerrado outside. */
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (inMedian(x, z)) return { oleander: 0.45, grass: 14 };
  if (r > RADIUS - 6 || inBuilding(x, z, 1.5) || onRoad(x, z, 1.2) || inRect(PRACA, x, z, 1) || Math.hypot(x - CATH.c[0], z - CATH.c[1]) < CATH.pool + 3) return null;
  if (POOLS.some((p) => inRect(p, x, z, 2))) return null;
  const q = SQS.find((s) => inRect(s, x, z));
  if (q) {
    const edge = Math.min(x - q[0], q[2] - x, z - q[1], q[3] - z);
    if (edge < BELT) return { neem: 0.5, fig: 0.2, sycamore_fig: 0.03, acacia: 0.1, grass: 28 };
    // the lawns under the blocks: mangoes (the neem stands for them) and figs by the lanes, a palm here and there
    return { neem: 0.05, fig: 0.05, sycamore_fig: 0.012, acacia: 0.03, date_palm: 0.03, oleander: 0.05, grass: 30 };
  }
  // the car parks' shade: a row of trees along every car park's side
  if (PARKS.some((p) => inRect(p.rect, x, z, 6) && !inRect(p.rect, x, z, 0.5))) return { neem: 0.5, oleander: 0.08, grass: 26 };
  // the ministries' gaps and outer lawns: mangoes and palms, oleander along the road verges
  if (MINISTRIES.length && Math.abs(z) > 138 && Math.abs(z) < 262 && x < -100 && x > -470) { if (Math.abs(z) < 147) return { date_palm: 0.35, oleander: 0.25, grass: 26 }; return { neem: 0.06, acacia: 0.025, date_palm: 0.03, oleander: 0.04, grass: 28 }; }
  // the avenue's verges: a file of palms and mangoes along both pavements, the shops' forecourt open
  if (z > 140 && z < 505 && ((x > AVENUE[0] - 10 && x < AVENUE[0] - 1) || (x > AVENUE[2] + 1 && x < 68))) { if (inRect(SHOPS, x, z, 14)) return { grass: 20, oleander: 0.05 }; return { date_palm: 0.12, neem: 0.1, oleander: 0.08, grass: 24 }; }
  if (inRect(LAWN, x, z)) {
    if (Math.abs(z) > 104) return { date_palm: 0.2, oleander: 0.05, grass: 30 };
    if (Math.abs(z) < 5) return { grass: 30 };
    return { acacia: 0.012, neem: 0.012, sycamore_fig: 0.004, date_palm: 0.006, grass: 30 };
  }
  if (r < 300) return { acacia: 0.04, maquis: 0.12, grass_dry: 16, fig: 0.01 };
  return { acacia: 0.1, maquis: 0.25, grass_dry: 18, neem: 0.02 };
}
void sm;
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { neem: 0.5, fig: 0.35, acacia: 0.15, date_palm: 0.35, maquis: 0.25, oleander: 0.45, sycamore_fig: 0.03 },
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
