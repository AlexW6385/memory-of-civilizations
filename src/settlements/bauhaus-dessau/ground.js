// Bauhaus Dessau — the ground (docs/settlements/bauhaus-dessau.md §8): the flat sandy plain of the Mulde; asphalt and cobbled streets with
// paved pavements, the school's forecourt of concrete flags, the sports field east of the school, the pine grove of the Masters' Houses on sand,
// kitchen gardens at Törten; lindens along the streets, Scots pines (red_pine stands in) and birch in the grove; a grey central-German sky.
import { RADIUS, ROADS, FOOT, PINES, MASTERS, TORTEN, GARDEN, GARDEN_PATHS, GARDEN_BEDS, GARDEN_SHED, inGarden, inRect, inRoad, inLot, inMasters, inTorten, inTortenHouses, inSchool, smooth } from './layout.js';

const SPORTS = [52, 4, 140, 40];
const height = () => 0;
function pavement(x, z) { return ROADS.some((r) => inRect(r, x, z, FOOT) && !inRect(r, x, z, 0)); }
function cover(x, z) {
  const r = Math.hypot(x, z);
  const c = { sand: 0.35, grass: 0.45, rock: 0, soil: 0.2, fields: 0, dry: 0.2, warmth: 0.35, red: 0, road: 0, snow: 0, forest: 0 };
  if (r > RADIUS - 8) { c.grass = 0.7; return c; }
  if (inRoad(x, z)) { c.road = 0.95; c.sand = 0; c.grass = 0; return c; }
  if (pavement(x, z) || inRect([-12, -10, 52, 14], x, z) || inSchool(x, z, 1.5)) { c.road = 0.6; c.sand = 0.05; c.grass = 0; return c; }
  if (GARDEN_PATHS.some((p) => inRect(p, x, z))) { c.road = 0.5; c.grass = 0; c.sand = 0.3; return c; }
  if (GARDEN_BEDS.some((b) => inRect(b, x, z))) { c.soil = 0.9; c.grass = 0; c.sand = 0.1; return c; }
  if (inGarden(x, z)) { c.grass = 0.95; c.sand = 0.05; c.soil = 0.05; return c; }
  if (inRect(SPORTS, x, z)) { c.grass = 0.9; c.sand = 0.1; return c; }
  if (inRect(PINES, x, z)) { c.sand = 0.5; c.grass = 0.35; c.dry = 0.5; return c; }
  if (inTorten(x, z)) { c.soil = 0.5; c.grass = 0.4; c.sand = 0.3; return c; }
  if (inLot(x, z, 1.2)) { c.road = 0.3; c.grass = 0.1; c.soil = 0.3; return c; }
  return c;
}
const water = () => false;
const waterLevel = () => -Infinity;
const fromWater = () => 30;
/** Plants per 100 m²: lindens along the kerbs, Scots pines and birch in the Masters' grove, grass on the sports field and the lawns, apple trees and vegetable beds at Törten. */
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 6 || inRoad(x, z, 0.5) || inSchool(x, z, 3) || inLot(x, z, 0.3) || inMasters(x, z, 4) || inTortenHouses(x, z, 0.8)) return null;
  if (inRect([-12, -10, 52, 14], x, z)) return null;
  // a row of lindens on the outer edge of the pavement
  if (ROADS.some((rr) => { const ok = inRect(rr, x, z, 1.3) && !inRect(rr, x, z, 0.5); return ok; }) && !inRect(PINES, x, z)) return { plane_tree: 0.9, elm: 0.25, grass: 14 };
  if (inRect(PINES, x, z)) return { red_pine: 0.7, birch: 0.18, grass: 22 };
  if (inGarden(x, z, 0.4)) {
    // the lawns of the garden: grass, birches singly, a few shrubs; clear of the paths, the beds, the shed, the table and the hedge's foot
    if (GARDEN_PATHS.some((p) => inRect(p, x, z, 1)) || GARDEN_BEDS.some((b) => inRect(b, x, z, 0.8)) || inRect(GARDEN_SHED, x, z, 2.5) || inRect([-8, 41, -1, 48], x, z) || inRect([21, 54, 27, 66], x, z) || x < GARDEN[0] + 1.6 || z > GARDEN[3] - 1.6) return null;
    return { grass: 30, birch: 0.2, apple: 0.05 };
  }
  if (inRect(SPORTS, x, z)) return { grass: 36 };
  if (inTorten(x, z)) return { apple: 0.14, grass: 14 };
  if (r > RADIUS - 30) return { red_pine: 0.15, birch: 0.1, grass: 20 };
  return { grass: 18, plane_tree: 0.02 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { plane_tree: 0.9, elm: 0.25, red_pine: 0.7, birch: 0.2, apple: 0.14 },
  climate: {
    sun: { az: 170, el: 38, color: [1.0, 0.95, 0.88], intensity: 3.0, lat: 51.8, dec: 10, hour: 11 },
    sky: { turbidity: 3.5, rayleigh: 1.1, mie: 0.006, mieG: 0.8, zenith: [0.1, 0.17, 0.36], horizon: [0.62, 0.66, 0.7] },
    fog: { color: [0.7, 0.72, 0.74], density: 0.0006, height: 0.02 },
    exposure: 0.5,
    damp: 0.5,
    wind: [0.5, 0.2],
    weather: [
      { id: 'clear', weight: 3, clouds: 0.3, cloudDensity: 0.4, sun: 1.0, fog: 1 },
      { id: 'overcast', weight: 3, clouds: 0.8, cloudDensity: 0.7, sun: 0.55, fog: 1.3 },
      { id: 'rain', weight: 1.5, clouds: 0.95, cloudDensity: 0.9, sun: 0.3, fog: 1.8, rain: 0.7 },
    ],
  },
};
void MASTERS; void TORTEN; void smooth;
