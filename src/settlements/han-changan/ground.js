// Han Chang'an — the ground (docs/settlements/han-changan.md §3): the flat loess plain of the Wei, beaten yellow-brown earth in the streets and wards, the
// paved court of the palace, the lake and the pond sunk in their banks; the avenues planted with pagoda trees and elms, willows at the water, jujube and
// mulberry in the ward courtyards, millet and wheat in the country; a pale hazy sky of the Wei valley.
// Pure (used by the relief, the collision and the plant workers).

import { RADIUS, AX, PALACE, TIERS, LAKE, LAKE_Y, GARDEN_POND, AVENUE, WEST_MARKET, EAST_MARKET, CHANGLE, ACADEMY, WARDS, QUARTERS, height, inLake, inPond, inRect, inLot, lots, streets, inMoat, MOAT_Y } from './layout.js';

function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
const inCity = (x, z) => x > -286 && x < 464 && z > -436 && z < 274;
const inWard = (x, z) => WARDS.some((w) => inRect(w, x, z));
let LOTMAP = null;
function lotAt(x, z) { return lots().find((l) => inRect(l.rect, x, z)); }
function cover(x, z, h) {
  const c = { sand: 0.35, grass: 0.1, rock: 0, soil: 0.55, fields: 0, dry: 0.8, warmth: 0.8, red: 0.1, road: 0, snow: 0, forest: 0 };
  if (h < -0.8) { c.soil = 0.9; c.sand = 0.1; c.dry = 0.3; return c; }
  if (Math.hypot(x, z) > RADIUS - 40 || !inCity(x, z)) { c.fields = 0.7; c.grass = 0.25; c.dry = 0.5; return c; }
  if (inRect(PALACE, x, z) && (inRect(TIERS[0].r, x, z, 3) || (x > AX - 90 && x < AX + 90 && z > -130 && z < 110))) { c.road = 0.9; c.sand = 0.2; c.soil = 0.2; c.dry = 0.9; return c; }
  if (inRect(AVENUE, x, z) || inRect(WEST_MARKET, x, z) || inRect(EAST_MARKET, x, z) || streets().some((r) => inRect(r, x, z))) { c.road = 0.85; c.sand = 0.3; c.soil = 0.4; return c; }
  if (inRect(ACADEMY, x, z) || inRect(CHANGLE, x, z)) { c.road = 0.5; c.soil = 0.5; return c; }
  c.sand = 0.45 + 0.15 * hash2(x * 0.07, z * 0.07); c.road = 0.15;
  return c;
}
const water = (x, z, y) => (inLake(x, z) && y < LAKE_Y + 0.3) || (inPond(x, z) && y < -0.6 + 0.3) || (inMoat(x, z) && y < MOAT_Y + 0.3);
const waterLevel = (x, z) => (inLake(x, z, 1) ? LAKE_Y : inPond(x, z, 0.5) ? -0.6 : inMoat(x, z, 0.5) ? MOAT_Y : -Infinity);
const fromWater = (x, z) => (inLake(x, z) || inPond(x, z) ? -3 : Math.max(-5, Math.min(40, Math.min(Math.hypot((x - LAKE.c[0]) / LAKE.rx, (z - LAKE.c[1]) / LAKE.rz) * 60 - 60, 30))));
/** Plants per 100 m²: pagoda trees and elms along the avenues, willows at the water, jujube and mulberry in the ward courtyards, millet and wheat outside the city. */
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inLake(x, z, 1) || inPond(x, z, 0.4)) return null;
  if (inMoat(x, z, 0.5)) return null;
  if (inMoat(x, z, 5) && !streets().some((r) => inRect(r, x, z, 6)) && !inRect(AVENUE, x, z, 8)) return { willow: 0.9, grass: 10 };
  const nearLake = inLake(x, z, 6) && !inLake(x, z, 1);
  if (nearLake) return { willow: 1.6, grass: 12 };
  if (inPond(x, z, 6) && !inPond(x, z, 0.8)) return { willow: 1.4, pagoda_tree: 0.2, grass: 8 };
  if (inRect(TIERS[0].r, x, z, 2.5)) return null;
  // the avenue's rows of trees along the kerbs, in the ward streets' crossings
  if (inRect(AVENUE, x, z, 0)) { const e = Math.min(x - AVENUE[0], AVENUE[2] - x); return e < 3.5 ? { pagoda_tree: 2.0, elm: 0.8 } : null; }
  if (streets().some((r) => inRect(r, x, z, 0.3))) return null;
  if (inLot(x, z, 0.5)) {
    const l = lotAt(x, z);
    if (l && l.kind === 'court') {
      // the yard: between the gate and the hall
      const [x0, z0, x1, z1] = l.rect, v = l.front === 's' ? z1 - z : z - z0, u = x - x0;
      if (v > 2 && v < (z1 - z0) - 9 && u > 1.5 && u < (x1 - x0) - 1.5) return { jujube: 0.8, mulberry: 0.5, grass: 3 };
    }
    return null;
  }
  if (inRect(WEST_MARKET, x, z, 1) || inRect(EAST_MARKET, x, z, 1) || inWard(x, z) || inRect(ACADEMY, x, z, 1)) return null;
  for (const q of QUARTERS) if (inRect(q, x, z, 1)) return null;
  if (inRect([AX - 92, -135, AX + 92, 112], x, z)) return null;
  if (inRect(PALACE, x, z, 0)) return hash2(x * 0.2, z * 0.2) < 0.06 ? { pagoda_tree: 0.5, grass: 2 } : { grass: 2 };
  if (inRect(CHANGLE, x, z, 0)) return hash2(x * 0.2, z * 0.2) < 0.05 ? { pagoda_tree: 0.5, grass: 2 } : { grass: 2 };
  if (!inCity(x, z)) {
    const e = (x + 1000) % 22;
    if (hash2(x * 0.3, z * 0.3) < 0.04) return { willow: 0.2, elm: 0.1, grass: 6 };
    return e < 1 ? { grass: 14 } : { wheat: 90, grass: 4 };
  }
  return { pagoda_tree: 0.15, elm: 0.12, jujube: 0.1, grass: 4 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { pagoda_tree: 2.0, elm: 0.8, willow: 1.6, jujube: 0.8, mulberry: 0.5, wheat: 90 },
  climate: {
    sun: { az: 160, el: 52, color: [1.0, 0.95, 0.86], intensity: 3.2, lat: 34.3, dec: 8, hour: 10.5 },
    sky: { turbidity: 4.2, rayleigh: 1.15, mie: 0.007, mieG: 0.82, zenith: [0.13, 0.2, 0.35], horizon: [0.7, 0.68, 0.64] },
    fog: { color: [0.78, 0.76, 0.7], density: 0.0006, height: 0.013 },
    exposure: 0.5,
    wind: [0.35, 0.2],
    damp: 0.2,
    waterline: LAKE_Y,
    weather: [
      { id: 'clear', weight: 4, clouds: 0.15, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'haze', weight: 2.5, clouds: 0.3, cloudDensity: 0.35, sun: 0.85, fog: 1.7, fogColor: [0.8, 0.76, 0.66] },
      { id: 'summer-rain', weight: 0.8, clouds: 0.85, cloudDensity: 0.7, sun: 0.4, fog: 2, rain: 0.4 },
    ],
  },
};
void LOTMAP;
