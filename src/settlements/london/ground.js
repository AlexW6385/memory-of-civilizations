// London — the ground: granite setts and pavements, Parliament Square's lawn and plane trees, the
// grey-brown Thames at mid tide with its mud, the Abbey's green; the smoky, overcast Victorian sky.

import { RADIUS, GROUND, RIVER, SQUARE, ABBEY, PALACE, SQ, BRIDGE, bank, height, inRiver, inRect, inLot } from './layout.js';

function cover(x, z, h) {
  const c = { sand: 0, grass: 0.15, rock: 0, soil: 0.25, fields: 0, dry: 0.2, warmth: 0.3, red: 0.05, road: 0.65, snow: 0, forest: 0 };
  if (inRect(SQUARE, x, z)) { c.grass = 0.9; c.road = 0; return c; }
  if (h < GROUND - 1) { c.soil = 0.9; c.road = 0; return c; }
  return c;
}
function water(x, z, y) { return inRiver(x, z) && y < RIVER.level + 0.3; }
function waterLevel(x, z) { return inRiver(x, z) ? RIVER.level : -Infinity; }
function fromWater(x, z) { return inRiver(x, z) ? -3 : Math.max(-5, Math.min(40, height(x, z) - RIVER.level)); }
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inRiver(x, z) || height(x, z) < GROUND - 0.5 || inRect(PALACE, x, z, 4) || inRect(ABBEY, x, z, 4) || inLot(x, z, 0.5)) return null;
  if (inRect(SQUARE, x, z)) {
    // the walks, the plazas, the beds and the clipped privet stay clear; planes stand in the lawns (the 1868 planting, a few years grown)
    if (Math.abs(z - SQ.walkZ) < 5.6 || Math.abs(x - SQ.walkX) < 4.2 || Math.hypot(x - SQ.statue[0], z - SQ.statue[1]) < 7 || Math.hypot(x - SQ.walkX, z - SQ.walkZ) < 7) return { grass: 6 };
    if (x < SQUARE[0] + 3 || x > SQUARE[2] - 3 || z < SQUARE[1] + 3 || z > SQUARE[3] - 3) return { grass: 6 };
    return { plane_tree: 0.16, grass: 30 };
  }
  // the embankments' promenades: a row of young planes along the parapet (the Victoria Embankment's, planted 1870)
  { const [a, b] = bank(z), d = Math.min(Math.abs(x - (a - 3.6)), Math.abs(x - (b + 3.6))); if (d < 1.1 && Math.abs(z - BRIDGE.z) > 14 && Math.hypot(x, z) < RADIUS - 70) return { plane_tree: 0.03 * Math.max(0, 1 - d / 1.1) }; }
  if (inRect([ABBEY[0] - 30, ABBEY[1] - 30, ABBEY[2] + 30, ABBEY[3] + 30], x, z)) return { plane_tree: 0.05, grass: 25 };
  return null;
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  sea: RIVER.level,   // the planet's sea is this water, at this level (src/planet/relief.js)
  maxDensity: { plane_tree: 0.16 },
  climate: {
    sun: { az: 180, el: 35, color: [1.0, 0.94, 0.84], intensity: 2.8, lat: 51.5, dec: 5, hour: 12 },
    sky: { turbidity: 6.0, rayleigh: 1.3, mie: 0.012, mieG: 0.82, zenith: [0.12, 0.15, 0.24], horizon: [0.6, 0.6, 0.58] },
    fog: { color: [0.62, 0.6, 0.56], density: 0.0012, height: 0.02 },
    exposure: 0.55,
    damp: 0.7,      // the Thames' damp and the rain: streaks on the stone and the brick, moss on the north feet of the walls
    wind: [0.5, 0.2],
    weather: [
      { id: 'overcast', weight: 3, clouds: 0.8, cloudDensity: 0.7, sun: 0.6, fog: 1.3 },
      { id: 'smoke', weight: 2, clouds: 0.6, cloudDensity: 0.6, sun: 0.5, fog: 2.2 },
      { id: 'fog', weight: 1.5, clouds: 0.9, cloudDensity: 0.8, sun: 0.25, fog: 5.5, fogColor: [0.66, 0.6, 0.45] },    // the yellow "London particular": coal smoke in the damp
      { id: 'rain', weight: 1.5, clouds: 0.95, cloudDensity: 0.9, sun: 0.3, fog: 1.8, rain: 0.8 },
    ],
  },
};
