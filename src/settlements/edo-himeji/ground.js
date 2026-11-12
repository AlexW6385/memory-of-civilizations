// Edo Himeji — the ground: the level Harima plain; the inner enclosure raised a little on its bank,
// Himeyama rising in it (the baileys' stone platforms are built on it); the inner moat round it and
// the middle moat on the south holding water below their banks; dusty streets; pines and maples on
// the hill, willows by the moats; the Inland Sea's mild sky.

import { yardFree } from '../../styles/edo/yard.js';
import { RADIUS, INNER, OUTER, BANK, LEVEL, MIDDLE, STREET, OTEMON, GOTEN, inRect, inMoat, inMiddle, hill, onPlatform, inLot, lots, smooth as sm } from './layout.js';

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
    // the baileys' yards are raked pale gravel (the flagstones laid on it), the enclosure's open ground beaten earth
    if (onPlatform(x, z)) { c.sand = 0.8; c.soil = 0.1; c.grass = 0.06; c.road = 0.12; return c; }
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
    if (inRect(GOTEN, x, z, 5) || inRect([-206, 106, -68, 188], x, z) || inRect([72, 106, 196, 188], x, z) || Math.abs(x) < 8 || z > INNER[3] - 14) return null;
    return { red_pine: 0.1 * sm(-0.2, 0.5, vn(x * 0.07, z * 0.07)), maple: 0.06, grass: 5 };
  }
  const nearMoat = inRect(OUTER, x, z, 6) && !inRect(OUTER, x, z, 0.8);
  if (nearMoat) return { willow: 9 * sm(-0.6, 0.2, vn(x * 0.12, z * 0.12)), grass: 14 };
  // the middle moat's banks: willows in groups, on the town's side
  if (z > MIDDLE.z0 - 3.5 && z < MIDDLE.z1 + 3.5 && !inMiddle(x, z) && Math.abs(x) > MIDDLE.gap / 2 + 3) return { willow: 7 * sm(-0.5, 0.25, vn(x * 0.1 + 5, z * 0.1)), grass: 12 };
  // pines (and a few maples) along the avenue from the main gate, outside the lanes' walls
  if (Math.abs(x) > 5 && Math.abs(x) < 9.5 && z > OUTER[3] + 1 && z < MIDDLE.z0 - 4) return { red_pine: 0.5 * sm(-0.2, 0.3, vn(x * 0.2, z * 0.2)) };
  const l = yashikiAt(x, z);
  if (l) {
    if (!yardFree(l, x, z)) return null;
    const n = vn(x * 0.08 + 3, z * 0.08);
    return { maple: 0.5 * sm(-0.1, 0.4, n), red_pine: 0.35 * sm(-0.3, 0.2, -n), sugi: 0.12, bamboo: Math.min(l.rect[2] - x, x - l.rect[0], l.rect[3] - z, z - l.rect[1]) < 4 ? 1.5 * sm(0, 0.4, vn(x * 0.2, z * 0.2 + 9)) : 0, grass: 6 };
  }
  if (inLot(x, z, 0.5)) return null;
  // the plain beyond the lots: moss and weeds at the wall feet, a pine now and then
  return { grass: 2 + 10 * sm(0.2, 0.6, vn(x * 0.1, z * 0.1)), red_pine: 0.03 };
}
let YL = null;
function yashikiAt(x, z) {
  if (!YL) { YL = new Map(); for (const l of lots()) if (l.t === 'yashiki') YL.set(Math.floor((l.rect[0] + 396) / 44) + ',' + Math.floor((l.rect[1] + 397) / 34), l); }
  const l = YL.get(Math.floor((x + RADIUS) / 44) + ',' + Math.floor((z + RADIUS) / 34));
  return l && inRect(l.rect, x, z) ? l : null;
}
function vn(x, z) { return hash2(Math.floor(x), Math.floor(z)) * 2 - 1; }
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { red_pine: 0.9, maple: 0.6, sugi: 0.15, willow: 9, bamboo: 1.5, grass: 25 },
  climate: {
    sun: { az: 165, el: 38, color: [1.0, 0.95, 0.87], intensity: 3.1, lat: 35, dec: -5, hour: 10.5 },
    sky: { turbidity: 3.2, rayleigh: 1.2, mie: 0.005, mieG: 0.8, zenith: [0.11, 0.19, 0.36], horizon: [0.64, 0.67, 0.7] },
    fog: { color: [0.76, 0.78, 0.8], density: 0.0005, height: 0.012 },
    exposure: 0.5,
    damp: 0.3,      // the Inland Sea's wet summers: moss on the north faces of the walls and roofs, rain streaks down the plaster (DESIGN §5)
    wind: [0.3, 0.2],
    weather: [
      { id: 'clear', weight: 3, clouds: 0.2, cloudDensity: 0.35, sun: 1.0, fog: 1 },
      { id: 'cloudy', weight: 2, clouds: 0.65, cloudDensity: 0.55, sun: 0.7, fog: 1.3 },
      { id: 'drizzle', weight: 1, clouds: 0.95, cloudDensity: 0.8, sun: 0.35, fog: 2.2, rain: 0.5 },
    ],
  },
};
