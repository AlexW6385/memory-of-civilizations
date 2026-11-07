// Petra — the ground: the rose and banded sandstone of the massif; the gorges' sandy floors; the
// valley's dry slopes with oleander and tamarisk in the wadi bed, junipers and grass on the
// heights; the desert sky.

import { RADIUS, RIM, STREET, GARDEN, SIQ_LINE, PLAZA, open, height, inLot, behindWalls, sacred, inGarden, gardenLevel, pathDist, siqHalf } from './layout.js';

function cover(x, z, h) {
  const c = { sand: 0.5, grass: 0, rock: 0, soil: 0.3, fields: 0, dry: 0.9, warmth: 0.85, red: 0.8, road: 0, snow: 0, forest: 0 };
  const o = open(x, z);
  if (o < 0.5 || behindWalls(x, z)) { c.rock = 0.9; c.sand = 0.1; return c; }
  // the foot of the cliffs: rock with the sand drifted against it, so that the walls stay rose to the floor
  if (o < 0.97) { c.rock = 0.75; c.sand = 0.15; c.soil = 0.1; return c; }
  if (Math.abs(z - STREET.a[1]) < 6 && x < STREET.a[0] && x > STREET.b[0]) { c.road = 0.7; return c; }
  // the garden's watered earth and grass (its promenade and pool are paved over)
  if (inGarden(x, z) && gardenLevel(x, z) === GARDEN.gy) { c.sand = 0.05; c.dry = 0.35; c.soil = 0.45; c.grass = 0.55; c.red = 0.4; return c; }
  return c;
}
const water = () => false, waterLevel = () => -Infinity, fromWater = () => 1e4;
/**
 * The garden (docs/settlements/petra.md §13): a grove of date palms in its southern quarters, figs and olives in the northern,
 * irrigated grass under them; nothing on the walk, the axis's platforms and pergola, the stair, near the walls.
 */
function gardenPlants(x, z) {
  const G = GARDEN, [x0, z0, x1] = G.rect, zw = (z0 + 2.6 + G.split) / 2;
  if (gardenLevel(x, z) !== G.gy || x < x0 + 3 || x > x1 - 3 || z < z0 + 4 || z > G.split - 2.5) return null;
  if (Math.abs(z - zw) < 3.2 || Math.abs(x) < 6.5 || (x > G.entry[0] - 2 && x < G.entry[1] + 2 && z < z0 + 8)) return { grass: 14 };
  return z > zw ? { date_palm: 1.1, grass: 26 } : { fig: 0.5, olive: 0.35, grass: 26 };
}
function planting(x, z) {
  if (inGarden(x, z)) return gardenPlants(x, z);
  if (Math.hypot(x, z) > RADIUS - 6 || inLot(x, z, 1) || behindWalls(x, z)) return null;
  const o = open(x, z);
  if (o < 0.2) return { grass_dry: 2, maquis: 0.05 };
  if (o < 0.95) return null;
  if (Math.abs(z - STREET.a[1]) < 17 || sacred(x, z, 2)) return null;
  // (in the Siq the oleanders and tamarisks keep to the foot of its walls: its floor, scoured by the floods and walked, and the
  // Treasury's plaza are clear, so that nothing stands between the Siq's last bend and the Treasury)
  if (pathDist(x, z, SIQ_LINE) < siqHalf(x) - 2 || Math.hypot(x - PLAZA.c[0], z - PLAZA.c[1]) < PLAZA.r) return { grass_dry: 3 };
  return { oleander: 0.06, tamarisk: 0.04, grass_dry: 6 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater, rim: RIM,
  maxDensity: { oleander: 0.06, tamarisk: 0.04, maquis: 0.05, date_palm: 1.1, fig: 0.5, olive: 0.35 },
  climate: {
    sun: { az: 130, el: 50, color: [1.0, 0.95, 0.86], intensity: 3.6, lat: 30, dec: 5, hour: 10 },
    sky: { turbidity: 3.2, rayleigh: 1.1, mie: 0.005, mieG: 0.78, zenith: [0.08, 0.15, 0.4], horizon: [0.66, 0.64, 0.62] },
    fog: { color: [0.8, 0.76, 0.72], density: 0.0003, height: 0.01 },
    exposure: 0.48,
    wind: [0.4, 0.2],
    weather: [
      { id: 'clear', weight: 5, clouds: 0.1, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'dusty', weight: 1.2, clouds: 0.25, cloudDensity: 0.4, sun: 0.85, fog: 1.8 },
    ],
  },
};
