// Ur — the ground: the flat alluvial plain, dusty lanes, the precinct's packed floors, the harbour
// basin holding water below its quay; date palms in groves by the water and at the edges, reeds in
// the shallows; the hot, hazy sky of southern Mesopotamia.

import { RADIUS, TEMENOS, COURT, HARBOUR, inRect, inHarbour, inHouse, smooth as sm } from './layout.js';

function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  const h = inHarbour(x, z) ? HARBOUR.bed * sm(0, 6, Math.min(x - HARBOUR.rect[0], HARBOUR.rect[2] - x, z - HARBOUR.rect[1], HARBOUR.rect[3] - z)) : 0;
  return h * (1 - sm(RADIUS - 30, RADIUS, r));
}
function cover(x, z) {
  const c = { sand: 0.55, grass: 0, rock: 0, soil: 0.45, fields: 0, dry: 0.85, warmth: 0.8, red: 0.05, road: 0, snow: 0, forest: 0 };
  if (inHarbour(x, z)) { c.soil = 0.8; c.sand = 0.2; return c; }
  if (inRect(COURT, x, z)) { c.sand = 0; c.soil = 0.1; c.road = 1; return c; }               // the Court of Nanna, paved in baked brick
  if (inRect(TEMENOS, x, z)) { c.sand = 0.4; c.soil = 0.6; c.road = 0.3; return c; }
  if (Math.hypot(x, z) > RADIUS - 30) { c.fields = 0.5; c.grass = 0.2; return c; }
  c.road = inHouse(x, z, 0.3) ? 0 : 0.5; return c;
}
function water(x, z, y) { return inHarbour(x, z) && y < HARBOUR.water + 0.3; }
function waterLevel(x, z) { return inHarbour(x, z) ? HARBOUR.water : -Infinity; }
function fromWater(x, z) { return inHarbour(x, z) ? 0 : Math.max(0, x - HARBOUR.rect[2]); }
/** Plants per 100 m²: date palms round the harbour and at the town's edge, reeds at the water's edge, nothing in the lanes. */
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 6 || inHarbour(x, z)) return null;
  if (inRect(HARBOUR.rect, x, z, 3)) return { reeds: 6 };
  if (inRect(HARBOUR.rect, x, z, 14)) return { date_palm: 1.2, grass_dry: 10 };
  if (r > RADIUS - 34) return { date_palm: 0.8, grass_dry: 12 };
  if (inRect(TEMENOS, x, z) || inHouse(x, z, 1)) return null;
  return hash2(x * 0.1, z * 0.1) < 0.04 ? { date_palm: 0.3 } : null;
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { date_palm: 1.2, reeds: 6 },
  climate: {
    sun: { az: 150, el: 48, color: [1.0, 0.94, 0.84], intensity: 3.4, lat: 31, dec: 10, hour: 10 },
    sky: { turbidity: 4.6, rayleigh: 1.1, mie: 0.007, mieG: 0.8, zenith: [0.12, 0.19, 0.34], horizon: [0.7, 0.68, 0.62] },
    fog: { color: [0.8, 0.76, 0.68], density: 0.0006, height: 0.012 },
    exposure: 0.48,
    wind: [0.4, 0.1],
    weather: [
      { id: 'clear', weight: 3, clouds: 0.06, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'dust-haze', weight: 2, clouds: 0.1, cloudDensity: 0.3, sun: 0.8, fog: 3, fogColor: [0.82, 0.74, 0.62] },
    ],
  },
};
