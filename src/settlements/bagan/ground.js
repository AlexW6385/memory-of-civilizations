// Bagan — the ground (docs/settlements/bagan.md §3): the dry, sandy plain of the Irrawaddy's east bank, beaten sand in the streets and precincts, the river and its bank,
// the village tank; palmyra palms, neem, acacia, a few teak and banyan; a pale, hot, hazy sky of the Dry Zone.
// Pure (used by the relief, the collision and the plant workers).

import { RADIUS, RIVER_Y, TANK, TANK_Y, PRECINCT, CITY, THAT_ENC, SHWE_PREC, SULA_PREC, PALACE, bankX, height, inRiver, inTank, inRect, inLot, lots, streets, inPlainTemple } from './layout.js';

function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
const PRECS = [PRECINCT, SHWE_PREC, SULA_PREC, THAT_ENC, PALACE];
const inPrec = (x, z, m = 0) => PRECS.some((p) => inRect(p, x, z, m));
const onRoad = (x, z, m = 0) => streets().some((r) => inRect(r, x, z, m));
function cover(x, z, h) {
  const c = { sand: 0.55, grass: 0.08, rock: 0, soil: 0.35, fields: 0, dry: 0.85, warmth: 0.85, red: 0.15, road: 0, snow: 0, forest: 0 };
  const d = x - bankX(z);
  if (d < 2) { c.sand = 0.8; c.soil = 0.2; c.dry = 0.3; return c; }
  if (inTank(x, z, 2)) { c.soil = 0.8; c.sand = 0.1; c.grass = 0.1; return c; }
  if (onRoad(x, z, 0.4)) { c.road = 0.9; c.sand = 0.5; c.soil = 0.3; return c; }
  if (inPrec(x, z)) { c.road = 0.75; c.sand = 0.6; c.soil = 0.2; return c; }
  if (inLot(x, z, 0.5)) { c.road = 0.25; c.sand = 0.5; c.soil = 0.4; return c; }
  c.grass = 0.08 + 0.1 * hash2(x * 0.05, z * 0.05); c.sand = 0.5 + 0.2 * hash2(x * 0.09, z * 0.09);
  c.dry = 0.9;
  return c;
}
const water = (x, z, y) => (inRiver(x, z) && y < RIVER_Y + 0.3) || (inTank(x, z) && y < TANK_Y + 0.3);
const waterLevel = (x, z) => (inRiver(x, z, -1) ? RIVER_Y : inTank(x, z, 0.5) ? TANK_Y : -Infinity);
const fromWater = (x, z) => (inRiver(x, z) || inTank(x, z) ? -3 : Math.max(-5, Math.min(40, x - bankX(z) - 5)));
/** Plants per 100 m²: palmyra palms, neem, acacia on the plain, teak and banyan in the precincts and villages; none on the roads, lots, temples. */
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inRiver(x, z, 2) || inTank(x, z, 0.5)) return null;
  if (x - bankX(z) < 6) return { grass_dry: 5, tamarisk: 0.4 };
  if (onRoad(x, z, 0.5) || inLot(x, z, 0.4) || inPlainTemple(x, z, 1.2)) return null;
  if (inRect(PRECINCT, x, z, 0)) {
    if (Math.hypot(x - 105, z) < 52) return null;
    return { banyan: 0.012, neem: 0.05, date_palm: 0.05, fig: 0.012, oleander: 0.03, grass_dry: 6 };
  }
  if (inRect(SHWE_PREC, x, z, 0) || inRect(SULA_PREC, x, z, 0)) return Math.hypot(x - 140, z + 190) < 40 || Math.hypot(x - 155, z - 198) < 34 ? null : { neem: 0.04, date_palm: 0.05, grass_dry: 5 };
  if (inRect(THAT_ENC, x, z, 0) || inRect(PALACE, x, z, 0)) return Math.hypot(x + 198, z - 82) < 40 ? null : { neem: 0.05, date_palm: 0.06, grass_dry: 5 };
  if (inLot(x, z, 7)) return { date_palm: 0.14, neem: 0.07, bamboo: 0.09, jujube: 0.05, fig: 0.012, grass_dry: 5 };     // the yards and village edges: palmyras, neem, bamboo clumps, jujube
  if (inRect(CITY, x, z, 0)) return { date_palm: 0.08, neem: 0.05, grass_dry: 6 };
  if (x - bankX(z) < 22) return { date_palm: 0.05, tamarisk: 0.5, acacia: 0.06, grass_dry: 10 };       // the bank's scrub
  const n = hash2(x * 0.02, z * 0.02);
  return n < 0.4 ? { date_palm: 0.07, acacia: 0.1, neem: 0.03, grass_dry: 14 } : { acacia: 0.12, neem: 0.025, teak: 0.012, grass_dry: 10 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { date_palm: 0.14, neem: 0.07, acacia: 0.12, teak: 0.012, banyan: 0.012, tamarisk: 0.5, bamboo: 0.09, jujube: 0.05, fig: 0.012, oleander: 0.03 },
  climate: {
    sun: { az: 140, el: 58, color: [1.0, 0.94, 0.82], intensity: 3.5, lat: 21.2, dec: 12, hour: 10 },
    sky: { turbidity: 5.2, rayleigh: 1.3, mie: 0.008, mieG: 0.8, zenith: [0.14, 0.21, 0.36], horizon: [0.72, 0.66, 0.56] },
    fog: { color: [0.78, 0.72, 0.62], density: 0.0006, height: 0.012 },
    exposure: 0.5,
    wind: [0.25, 0.15],
    damp: 0.45,
    waterline: RIVER_Y,
    weather: [
      { id: 'hazy', weight: 4, clouds: 0.15, cloudDensity: 0.3, sun: 1.0, fog: 1.3 },
      { id: 'dusty', weight: 2, clouds: 0.3, cloudDensity: 0.4, sun: 0.82, fog: 1.9, fogColor: [0.8, 0.7, 0.55] },
      { id: 'monsoon-shower', weight: 0.8, clouds: 0.9, cloudDensity: 0.8, sun: 0.35, fog: 1.8, rain: 0.6 },
    ],
  },
};
void lots;
