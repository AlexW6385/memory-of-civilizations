// Edo Himeji — the ground: the level Harima plain; the inner enclosure raised a little on its bank,
// Himeyama rising in it (the baileys' stone platforms are built on it); the inner moat round it and
// the middle moat on the south holding water below their banks; dusty streets; pines and maples on
// the hill, willows by the moats; the Inland Sea's mild sky.

import { RADIUS, INNER, OUTER, BANK, LEVEL, inRect, inMoat, inMiddle, hill, onPlatform, inLot, smooth as sm } from './layout.js';

function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  let h = 0;
  if (inRect(INNER, x, z)) h = BANK + hill(x, z);
  else if (inMoat(x, z) || inMiddle(x, z)) h = LEVEL.bed;
  return h * (1 - sm(RADIUS - 30, RADIUS, r));
}
const wet = (x, z) => inMoat(x, z) || inMiddle(x, z);
function cover(x, z, h) {
  const c = { sand: 0.1, grass: 0.2, rock: 0, soil: 0.5, fields: 0, dry: 0.3, warmth: 0.45, red: 0, road: 0, snow: 0, forest: 0 };
  if (wet(x, z)) { c.soil = 0.6; c.rock = 0.4; return c; }
  if (inRect(INNER, x, z)) {
    if (h > BANK + 3 && !onPlatform(x, z)) { c.forest = 0.6; c.grass = 0.4; c.soil = 0; return c; }
    c.sand = 0.5; c.soil = 0.4; c.grass = 0.1; c.road = 0.3; return c;
  }
  if (Math.hypot(x, z) > RADIUS - 26) { c.fields = 0.7; c.grass = 0.3; return c; }
  c.road = inLot(x, z, 0.3) ? 0 : 0.5; c.grass = inLot(x, z) ? 0.5 : 0.1; return c;
}
function water(x, z, y) { return wet(x, z) && y < LEVEL.water + 0.3; }
function waterLevel(x, z) { return wet(x, z) ? LEVEL.water : -Infinity; }
function fromWater(x, z) { return wet(x, z) ? 0 : 50; }
/** Plants per 100 m²: woods of red pine, maple and cedar on the hill's slopes, a few pines in the baileys, willows along the moat banks. */
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 6 || wet(x, z)) return null;
  if (inRect(INNER, x, z)) {
    if (onPlatform(x, z, 2)) return null;
    if (hill(x, z) > 2.5) return { red_pine: 0.9, maple: 0.5, sugi: 0.15, grass: 25 };
    if (!inRect(INNER, x, z, -6)) return { red_pine: 0.25, grass: 10 };
    return hash2(x * 0.1, z * 0.1) < 0.1 ? { red_pine: 0.05 } : null;
  }
  const nearMoat = inRect(OUTER, x, z, 5) && !inRect(OUTER, x, z, 1);
  if (nearMoat) return { willow: 1.2, grass: 20 };
  if (inLot(x, z, 0.5)) return null;
  return null;
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { red_pine: 0.9, maple: 0.5, sugi: 0.15, willow: 1.2 },
  climate: {
    sun: { az: 165, el: 38, color: [1.0, 0.95, 0.87], intensity: 3.1, lat: 35, dec: -5, hour: 10.5 },
    sky: { turbidity: 3.2, rayleigh: 1.2, mie: 0.005, mieG: 0.8, zenith: [0.11, 0.19, 0.36], horizon: [0.64, 0.67, 0.7] },
    fog: { color: [0.76, 0.78, 0.8], density: 0.0005, height: 0.012 },
    exposure: 0.5,
    wind: [0.3, 0.2],
    weather: [
      { id: 'clear', weight: 3, clouds: 0.2, cloudDensity: 0.35, sun: 1.0, fog: 1 },
      { id: 'cloudy', weight: 2, clouds: 0.65, cloudDensity: 0.55, sun: 0.7, fog: 1.3 },
      { id: 'drizzle', weight: 1, clouds: 0.95, cloudDensity: 0.8, sun: 0.35, fog: 2.2, rain: 0.5 },
    ],
  },
};
