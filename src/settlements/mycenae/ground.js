// Mycenae — the ground: the citadel's rocky ridge of grey limestone between its ravines, terra rossa and pale stone, the lower town's terraces on the
// slopes, the Treasury's mound over its dome; olive and fig, stone pine, cypress, kermes oak and thyme on the hills, wheat on the plain beyond;
// the bright dry summer of the Argolid (lat 37.7). Pure (used by the relief, the collision and the plant workers).

import { RADIUS, terrain, smooth as sm, inCitadel, onRamp, onLane, inHouse, TREAS, PALACE, inRect, GCA } from './layout.js';

function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  return terrain(x, z) * (1 - sm(RADIUS - 40, RADIUS, r));
}
const inMound = (x, z) => Math.hypot(x - TREAS.x, z - TREAS.z) < 42;
function cover(x, z, h, ny) {
  const r = Math.hypot(x, z);
  const c = { sand: 0.15, grass: 0.12, rock: 0.35, soil: 0.35, fields: 0, dry: 0.9, warmth: 0.85, red: 0.5, road: 0, snow: 0, forest: 0 };
  if (inRect([26, -30, 92, 34], x, z) || Math.hypot(x - GCA.x, z - GCA.z) < 16) { c.road = 0.9; c.rock = 0.3; c.red = 0.2; return c; }
  if (onRamp(x, z) || (onLane(x, z, 1.5) && !inCitadel(x, z))) { c.road = 0.85; c.rock = 0.2; return c; }
  if (inCitadel(x, z, 2)) { c.road = 0.5; c.rock = 0.45; c.soil = 0.3; return c; }
  if (ny !== undefined && ny < 0.82) { c.rock = 0.85; c.soil = 0.1; c.grass = 0.05; return c; }
  if (inMound(x, z)) { c.grass = 0.45; c.soil = 0.4; c.rock = 0.05; return c; }
  if (r > 120 && r < RADIUS - 20 && Math.abs(z) > 30) { c.fields = 0.45; c.grass = 0.2; return c; }
  return c;
}
const water = () => false, waterLevel = () => -Infinity, fromWater = () => 1e4;
/** Plants per 100 m²: nothing inside the walls or on the roads and houses; olive, fig and cypress about the lower town, stone pine and maquis on the slopes. */
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 6 || inCitadel(x, z, -9) || onRamp(x, z, 3) || onLane(x, z, 3) || inHouse(x, z, 2.5)) return null;
  if (x > TREAS.x0 - 8 && x < TREAS.xf + 4 && Math.abs(z - TREAS.z) < 10) return null;
  if (x < -86 && x > -195 && Math.abs(z) < 14) return null;                                              // the approach road and its court
  if (inMound(x, z)) return { grass_dry: 14, maquis: 0.1 };
  if (inCitadel(x, z, -2)) return { maquis: 0.15, grass_dry: 6 };                                           // the footing of the wall
  const k = hash2(x * 0.2, z * 0.2);
  if (r < 135) return k < 0.4 ? { olive: 0.2, fig: 0.05, grass_dry: 12 } : { maquis: 0.5, stone_pine: 0.03, cypress: 0.03, grass_dry: 14 };
  return { olive: 0.12, maquis: 0.3, stone_pine: 0.04, grass_dry: 14 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { olive: 0.2, fig: 0.05, maquis: 0.5, stone_pine: 0.04, cypress: 0.03 },
  climate: {
    sun: { az: 150, el: 58, color: [1.0, 0.96, 0.88], intensity: 3.6, lat: 37.7, dec: 15, hour: 10.5 },
    sky: { turbidity: 2.4, rayleigh: 1.0, mie: 0.004, mieG: 0.78, zenith: [0.07, 0.16, 0.42], horizon: [0.6, 0.66, 0.72] },
    fog: { color: [0.76, 0.8, 0.84], density: 0.00025, height: 0.01 },
    exposure: 0.48,
    wind: [0.6, 0.3],
    weather: [
      { id: 'clear', weight: 5, clouds: 0.1, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'thin-cloud', weight: 1.5, clouds: 0.35, cloudDensity: 0.45, sun: 0.9, fog: 1 },
    ],
  },
};
