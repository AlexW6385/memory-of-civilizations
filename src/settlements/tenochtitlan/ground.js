// Tenochtitlan — the ground: the island level a little above the lake, its canals sunk between
// walls, chinampa plots round its edge, the lake beyond with the causeway crossing it; willows by
// the water, maize on the chinampas; the clear high sky of the Valley of Mexico.

import { RADIUS, PRECINCT, PALACE, MARKET, LEVEL, ISLAND, inRect, inCanal, inLake, inLakeWater, inHouse, inChinampaHouse, canalDistance, smooth as sm } from './layout.js';

function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  let h = 0;
  if (inLake(x, z)) h = LEVEL.lakeBed * sm(ISLAND, ISLAND + 8, r);
  else if (inCanal(x, z)) h = LEVEL.canalBed;
  else if (r > 300) { const cell = (Math.floor(x / 14) + Math.floor(z / 30)) % 2 === 0; const lane = Math.abs(((x % 14) + 14) % 14 - 7) > 6.2; h = lane ? LEVEL.canalBed * 0.6 : 0.1 * (cell ? 1 : 0); }
  return h * (1 - sm(RADIUS - 30, RADIUS, r));
}
const wet = (x, z) => inCanal(x, z) || inLakeWater(x, z, height(x, z) + 0.1);
function cover(x, z) {
  const r = Math.hypot(x, z);
  const c = { sand: 0.1, grass: 0.1, rock: 0, soil: 0.8, fields: 0, dry: 0.4, warmth: 0.55, red: 0.05, road: 0, snow: 0, forest: 0 };
  if (wet(x, z)) { c.soil = 1; return c; }
  if (r > 300) { c.fields = 0.8; c.grass = 0.2; c.soil = 0; return c; }
  if (inRect(PRECINCT, x, z)) { c.sand = 0.3; c.soil = 0.7; c.road = 0.6; return c; }
  c.road = inHouse(x, z, 0.3) ? 0 : 0.5; return c;
}
function water(x, z, y) { return wet(x, z) && y < LEVEL.water + 0.3; }
function waterLevel(x, z) { return wet(x, z) ? LEVEL.water : -Infinity; }
function fromWater(x, z) { return wet(x, z) ? 0 : Math.max(0, ISLAND - Math.hypot(x, z)); }
/** Plants per 100 m²: ahuejote willows along the chinampas' edges and the canals, maize with grass among it on the plots; none in the precinct, the palace or the lanes. */
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 6 || wet(x, z)) return null;
  if (r > 300) { const lane = Math.abs(((x % 14) + 14) % 14 - 7); if (lane < 5.4 && inChinampaHouse(x, z)) return { grass: 20 }; return lane > 5.4 && lane < 6.2 ? { poplar: 2.5 } : lane < 4.6 ? { maize: 30, grass: 12 } : { grass: 30 }; }
  if (inRect(PRECINCT, x, z, 2) || inRect(PALACE, x, z, 4) || inRect(MARKET, x, z, 6) || inHouse(x, z, 0.5)) return null;
  // the ahuejotes along the canals' banks, their crowns over the water (the bank is 4 m wide between the walls and the compounds)
  const cd = canalDistance(x, z);
  if (cd > 0.9 && cd < 2.4 && Math.abs(x) > 9 && Math.abs(z) > 9 && Math.hypot(x, z) < 296) return { willow: 2.2 };
  return hash2(x * 0.2, z * 0.2) < 0.05 ? { willow: 0.4 } : null;
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { poplar: 2.5, willow: 2.2 },
  climate: {
    waterline: LEVEL.water,        // the canals' and the lake's water: the stain line on the walls that stand in it (src/engine/materials.js)
    damp: 0.42,                    // a lake city 2,240 m up: dry winters, the summer rains; salts (tequesquite) and moss at the foot of the shaded walls
    sun: { az: 150, el: 55, color: [1.0, 0.96, 0.9], intensity: 3.4, lat: 19, dec: -15, hour: 10 },
    sky: { turbidity: 2.6, rayleigh: 1.0, mie: 0.004, mieG: 0.8, zenith: [0.09, 0.17, 0.38], horizon: [0.62, 0.66, 0.7] },
    fog: { color: [0.76, 0.78, 0.8], density: 0.0004, height: 0.01 },
    exposure: 0.48,
    wind: [0.2, 0.1],
    weather: [
      { id: 'clear', weight: 4, clouds: 0.15, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'thunderheads', weight: 1.5, clouds: 0.6, cloudDensity: 0.6, sun: 0.75, fog: 1.2 },
      { id: 'afternoon-rain', weight: 0.8, clouds: 0.95, cloudDensity: 0.8, sun: 0.35, fog: 2.0, rain: 0.5 },
    ],
  },
};
