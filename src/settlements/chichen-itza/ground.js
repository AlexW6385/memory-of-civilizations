// Chichén Itzá — the ground: the flat limestone plain of northern Yucatán, gently uneven; the
// Great Plaza levelled and plastered; the Sacred Cenote, a sheer-walled sinkhole down to green
// water; the dry forest, thinned round the house lots; the bright sky of the dry season.
// Pure (used by the relief, the collision and the plant workers).

import { RADIUS, PLAZA, CENOTE, inRect, cenoteDist, onSacbe, inLot, nearHouse, smooth as sm } from './layout.js';

function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vnoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash2(xi, zi), b = hash2(xi + 1, zi), c = hash2(xi, zi + 1), d = hash2(xi + 1, zi + 1);
  return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1;
}
function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  let h = inRect(PLAZA, x, z, -2) ? 0 : 0.5 * vnoise(x * 0.03, z * 0.03) * sm(0, 25, Math.max(PLAZA[0] - x, x - PLAZA[2], PLAZA[1] - z, z - PLAZA[3]));
  const d = cenoteDist(x, z);
  if (d < 0.6) h = CENOTE.bed + (h - CENOTE.bed) * sm(-3, 0.6, d) ** 0.15;          // sheer walls
  return h * (1 - sm(RADIUS - 30, RADIUS, r));
}
function cover(x, z, h, ny) {
  const c = { sand: 0, grass: 0, rock: 0, soil: 0, fields: 0, dry: 0.55, warmth: 0.8, red: 0.25, road: 0, snow: 0, forest: 0 };
  if (inRect(PLAZA, x, z)) { c.road = 1; c.soil = 1; c.dry = 0.9; return c; }
  if (ny < 0.6 || cenoteDist(x, z) < 2) { c.rock = 1; return c; }
  const n = hash2(x * 0.1, z * 0.1);
  if (inLot(x, z)) { c.soil = 0.7; c.grass = 0.3; return c; }
  c.grass = 0.45 + 0.2 * n; c.soil = 0.25; c.rock = 1 - c.grass - c.soil; c.forest = 0.6; return c;
}
function water(x, z, y) { return cenoteDist(x, z) < -1 && y < CENOTE.water + 0.3; }
function waterLevel(x, z) { return cenoteDist(x, z) < -1 ? CENOTE.water : -Infinity; }
function fromWater(x, z) { return Math.max(-5, Math.min(40, cenoteDist(x, z))); }
/** Plants per 100 m²: none on the plaza and the sacbe; dry forest elsewhere, thinned in the lots (a few fruit trees). */
function planting(x, z, p) {
  if (Math.hypot(x, z) > RADIUS - 6 || inRect(PLAZA, x, z, 2) || onSacbe(x, z, 2) || cenoteDist(x, z) < 1.5) return null;
  if (nearHouse(x, z, 1.5)) return null;
  if (inLot(x, z)) return { grass: 30, jujube: 0.12, carob: 0.08 };
  return { grass: 25, acacia: 0.5, neem: 0.35, banyan: 0.03 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { acacia: 0.5, neem: 0.35, banyan: 0.03, jujube: 0.12, carob: 0.08 },
  // the dry season in Yucatán: a hot, bright sky, a few fair-weather clouds, a sea breeze
  climate: {
    sun: { az: 130, el: 60, color: [1.0, 0.95, 0.86], intensity: 3.5, lat: 20.7, dec: -10, hour: 10.5 },
    sky: { turbidity: 3.4, rayleigh: 1.2, mie: 0.0045, mieG: 0.8, zenith: [0.1, 0.19, 0.38], horizon: [0.52, 0.58, 0.62] },
    fog: { color: [0.72, 0.77, 0.82], density: 0.00035, height: 0.01 },
    exposure: 0.5,
    wind: [0.5, 0.2],
    weather: [
      { id: 'clear', weight: 3, clouds: 0.25, cloudDensity: 0.4, sun: 1.0, fog: 0.9 },
      { id: 'fair', weight: 2, clouds: 0.45, cloudDensity: 0.5, sun: 0.92, fog: 1 },
      { id: 'hazy', weight: 1, clouds: 0.35, cloudDensity: 0.4, sun: 0.85, fog: 1.6 },
    ],
  },
};
