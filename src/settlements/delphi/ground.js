// Delphi — the ground: grey limestone and thin red soil on the steep south-facing slope of Parnassus, the Phaedriades' pale cliffs
// to the north and east, the paved Way and the levelled terraces; olives in the valley below and about the village, cypresses
// and holm oaks among the sanctuary's buildings, Aleppo pines and maquis on the slope, bay (oleander stands in), a plane tree at
// the spring; the clear mountain light of Phocis (lat 38.5). Pure (the relief, the collision and the plant workers use it).

import { RADIUS, height, built, onWay, inRect, TT, SPRING, STADIUM, smooth as sm } from './layout.js';

function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function cover(x, z, h, ny) {
  const c = { sand: 0.05, grass: 0.1, rock: 0.6, soil: 0.2, fields: 0, dry: 0.85, warmth: 0.6, red: 0.12, road: 0, snow: 0, forest: 0 };
  if (inRect(TT, x, z) || onWay(x, z)) { c.road = 0.85; c.rock = 0.4; c.soil = 0; return c; }
  if (inRect(STADIUM, x, z)) { c.sand = 0.8; c.road = 0.2; c.rock = 0; return c; }
  if (z < -115 || x > 150 || ny < 0.72) { c.rock = 0.9; c.soil = 0.05; c.dry = 0.9; c.grass = 0; return c; }
  if (built(x, z)) { c.road = 0.45; c.soil = 0.3; return c; }
  if (z > 118 || Math.hypot(x, z) > RADIUS - 40) { c.fields = 0.3; c.grass = 0.3; c.rock = 0.15; return c; }
  const n = hash2(x * 0.08, z * 0.08); c.rock = 0.5 + 0.3 * n; c.red = 0.08 + 0.15 * n; c.soil = 0.2; return c;
}
const water = () => false, waterLevel = () => -Infinity, fromWater = () => 1e4;
/** Plants per 100 m²: nothing on built ground; the sanctuary's cypresses, bay and holm oaks; olives below and by the village; pines and maquis up the slope; a plane tree by the spring. */
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 6 || built(x, z, 1.5)) return null;
  const n = hash2(x * 0.2, z * 0.2);
  if (inRect(SPRING, x, z, 16)) return Math.hypot(x - 122, z + 2) < 4 ? { plane_tree: 0.5 } : { oleander: 0.4, maquis: 0.3, grass_dry: 3 };
  if (z < -118) return n < 0.3 ? { aleppo_pine: 0.06, maquis: 0.3, grass_dry: 2 } : null;
  if (x > 150) return { maquis: 0.15 };
  if (z > 112) return { olive: 0.5, cypress: 0.04, grass_dry: 6 };
  if (x < -76 || x > 106) return { olive: 0.4, cypress: 0.06, holm_oak: 0.03, grass_dry: 7, maquis: 0.12, oleander: 0.05 };
  if (z > 60) return { olive: 0.16, cypress: 0.1, holm_oak: 0.06, grass_dry: 7, oleander: 0.05 };
  return { cypress: 0.16, holm_oak: 0.09, oleander: 0.22, aleppo_pine: 0.06, grass_dry: 5, maquis: 0.22 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { olive: 0.5, cypress: 0.16, holm_oak: 0.09, oleander: 0.4, aleppo_pine: 0.06, maquis: 0.3, plane_tree: 0.5 },
  climate: {
    sun: { az: 150, el: 52, color: [1.0, 0.95, 0.86], intensity: 3.6, lat: 38.5, dec: 12, hour: 10 },
    sky: { turbidity: 2.2, rayleigh: 1.0, mie: 0.004, mieG: 0.78, zenith: [0.07, 0.16, 0.42], horizon: [0.6, 0.66, 0.72] },
    fog: { color: [0.76, 0.79, 0.84], density: 0.00028, height: 0.012 },
    exposure: 0.48,
    wind: [0.7, 0.2],
    weather: [
      { id: 'clear', weight: 5, clouds: 0.08, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'cloud-on-the-ridge', weight: 1.8, clouds: 0.5, cloudDensity: 0.55, sun: 0.8, fog: 1.2 },
    ],
  },
};
void sm;
