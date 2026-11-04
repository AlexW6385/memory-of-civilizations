// Safavid Isfahan — the ground: the level plain; the square's packed earth for polo, paved walks by
// the arcades, the canal round the field; the town's dusty lanes; the royal garden's grass; plane
// trees by the canal and in the garden, elms and fruit trees here and there in the town; the dry,
// clear sky of the Iranian plateau.

import { RADIUS, SQUARE, ARCADE, CANAL, GARDEN, inRect, inHouse, inMosque } from './layout.js';

const [sx0, sz0, sx1, sz1] = SQUARE;
const FIELD = [sx0 + CANAL + 2, sz0 + CANAL + 2, sx1 - CANAL - 2, sz1 - CANAL - 2];
function height() { return 0; }
function cover(x, z) {
  const c = { sand: 0.3, grass: 0, rock: 0, soil: 0.4, fields: 0, dry: 0.75, warmth: 0.7, red: 0.05, road: 0, snow: 0, forest: 0 };
  if (inRect(SQUARE, x, z)) { c.sand = 0.55; c.soil = 0.45; c.road = inRect(FIELD, x, z) ? 0 : 0.5; return c; }
  if (inRect(GARDEN, x, z)) { c.grass = 0.8; c.soil = 0.2; c.dry = 0.3; return c; }
  if (Math.hypot(x, z) > RADIUS - 26) { c.fields = 0.6; c.grass = 0.2; c.soil = 0.2; return c; }
  c.road = inHouse(x, z, 0.3) || inMosque(x, z) || inRect(SQUARE, x, z, ARCADE) ? 0 : 0.45;
  return c;
}
function water() { return false; }
function waterLevel() { return -Infinity; }
function fromWater() { return 1e4; }
/** Plants per 100 m²: a row of plane trees by the canal (both sides of the square, and the ends), plane trees and grass in the royal garden, a scatter of elms and mulberries in the town's open ground. */
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6) return null;
  if (inRect(SQUARE, x, z)) {
    const dx = Math.min(Math.abs(x - (sx0 + CANAL - 2.5)), Math.abs(x - (sx1 - CANAL + 2.5)));
    const dz = Math.min(Math.abs(z - (sz0 + CANAL - 2.5)), Math.abs(z - (sz1 - CANAL + 2.5)));
    if ((dx < 1.2 && z > sz0 + CANAL - 4 && z < sz1 - CANAL + 4) || (dz < 1.2 && Math.abs(x) > 24 && x > sx0 + CANAL - 4 && x < sx1 - CANAL + 4)) return { plane_tree: 1.8 };
    return null;
  }
  if (inRect(GARDEN, x, z)) {
    if (inRect(GARDEN, x, z, -6) && !(Math.abs(z + 45) < 10) && !(Math.abs(x + 221) < 4)) return { plane_tree: 1.6, grass: 40 };
    return { grass: 30 };
  }
  if (inHouse(x, z, 0.6) || inMosque(x, z, 1) || inRect(SQUARE, x, z, ARCADE + 1) || (Math.abs(x) < 12 && z < -300) || inRect([88, -58, 122, -8], x, z)) return null;
  return { elm: 0.05, apple: 0.05, grass_dry: 10 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { plane_tree: 1.8, elm: 0.05, apple: 0.05 },
  climate: {
    sun: { az: 150, el: 45, color: [1.0, 0.95, 0.86], intensity: 3.4, lat: 33, dec: 5, hour: 10.5 },
    sky: { turbidity: 2.8, rayleigh: 1.1, mie: 0.004, mieG: 0.8, zenith: [0.1, 0.18, 0.36], horizon: [0.62, 0.64, 0.66] },
    fog: { color: [0.78, 0.76, 0.72], density: 0.0004, height: 0.01 },
    exposure: 0.48,
    wind: [0.4, 0.1],
    weather: [
      { id: 'clear', weight: 4, clouds: 0.08, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'high-cloud', weight: 1.5, clouds: 0.35, cloudDensity: 0.35, sun: 0.9, fog: 1.1 },
      { id: 'dust', weight: 0.8, clouds: 0.1, cloudDensity: 0.3, sun: 0.75, fog: 3.5, fogColor: [0.8, 0.72, 0.6] },
    ],
  },
};
