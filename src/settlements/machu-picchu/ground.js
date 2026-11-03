// Machu Picchu — the ground: the saddle's top, nearly level, the plaza sunk in it and the
// Intihuatana's hill; terraces stepping down all round; the flanks falling steeply into the canyon
// of the Urubamba; the peaks of Huayna Picchu and Machu Picchu; the far side rising again; grass
// on the terraces, cloud forest on the slopes; mist and cloud of the eastern Andes.
// Pure (used by the relief, the collision and the plant workers).

import { RADIUS, TERRACE, PLAZA, PEAKS, HILL, inRect, outside, terraceAt, inHouse, smooth as sm } from './layout.js';

function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vnoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash2(xi, zi), b = hash2(xi + 1, zi), c = hash2(xi, zi + 1), d = hash2(xi + 1, zi + 1);
  return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1;
}
const TOP = -TERRACE.h * TERRACE.n;
/** The ridge stands 130 m above the open country: its canyon floor comes down to -130 by the rim. */
export const LIFT = 130, RIM = -130;
function fbm(x, z) { return vnoise(x, z) * 0.6 + vnoise(x * 2.1 + 5, z * 2.1) * 0.3 + vnoise(x * 4.3, z * 4.3 + 9) * 0.1; }
function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return RIM;
  const d = outside(x, z);
  let h;
  if (d < 0) {
    h = 0;
    if (inRect(PLAZA, x, z, -2)) h = -2.4 * sm(0, 4, Math.min(x - PLAZA[0], PLAZA[2] - x, z - PLAZA[1], PLAZA[3] - z));
    const hd = Math.hypot(x - HILL.c[0], z - HILL.c[1]);
    if (hd < HILL.r + 8) h = Math.max(h, Math.floor(Math.max(0, HILL.h * (1 - Math.max(0, hd - 3) / (HILL.r + 6))) / 2.2) * 2.2);
  } else {
    const k = terraceAt(d);
    // the terraces, then the slope down into the canyon, its floor
    h = k >= 0 ? -TERRACE.h * k : Math.max(RIM + 4 * fbm(x * 0.02, z * 0.02), TOP - (d - TERRACE.w * TERRACE.n) * 1.2 + 7 * fbm(x * 0.04, z * 0.04));
  }
  // the peaks, rising from the canyon floor: steep, ribbed, rugged
  for (const p of PEAKS) {
    const q = Math.hypot(x - p.c[0], z - p.c[1]) / p.r;
    if (q < 1) {
      const rib = 1 + 0.18 * fbm(x * 0.05 + p.c[0], z * 0.05) + 0.08 * Math.sin(Math.atan2(z - p.c[1], x - p.c[0]) * 7);
      h = Math.max(h, RIM + (p.h - RIM) * Math.pow(1 - q, 1.15) * rib);
    }
  }
  return RIM + (h - RIM) * (1 - sm(RADIUS - 25, RADIUS, r));
}
function cover(x, z, h, ny) {
  const c = { sand: 0, grass: 0, rock: 0, soil: 0, fields: 0, dry: 0.2, warmth: 0.45, red: 0.1, road: 0, snow: 0, forest: 0 };
  const d = outside(x, z);
  if (ny < 0.55) { c.rock = 0.7; c.grass = 0.3; return c; }
  if (d < TERRACE.w * TERRACE.n) { c.grass = 0.85; c.soil = 0.15; if (inHouse(x, z, 1)) { c.grass = 0.3; c.soil = 0.7; } return c; }
  c.grass = 0.3; c.forest = 0.85; c.rock = 0.1; c.soil = 0.6; return c;
}
function water() { return false; }
function waterLevel() { return -Infinity; }
function fromWater() { return 50; }
/** Plants per 100 m²: grass on the terraces and the plaza, a few trees in the town; cloud forest on the slopes and the peaks. */
function planting(x, z, p) {
  if (Math.hypot(x, z) > RADIUS - 6) return null;
  const d = outside(x, z);
  if (d < 0) return inHouse(x, z, 0.6) ? null : { grass: 40, tamarisk: hash2(x * 0.2, z * 0.2) < 0.03 ? 0.3 : 0 };
  if (d < TERRACE.w * TERRACE.n) return { grass: 50 };
  return { grass: 25, teak: 0.25, neem: 0.3, oak: 0.08, reeds: 4 };
}
export const ground = {
  lift: LIFT, rim: RIM,
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { teak: 0.25, neem: 0.3, oak: 0.08, tamarisk: 0.3 },
  // the eastern Andes in the dry season's end: bright sun between clouds, mist rising from the canyon
  climate: {
    sun: { az: 40, el: 55, color: [1.0, 0.96, 0.9], intensity: 3.4, lat: -13, dec: -15, hour: 10 },
    sky: { turbidity: 2.4, rayleigh: 1.0, mie: 0.004, mieG: 0.8, zenith: [0.08, 0.16, 0.38], horizon: [0.5, 0.56, 0.62] },
    fog: { color: [0.78, 0.8, 0.82], density: 0.0007, height: 0.02 },
    exposure: 0.5,
    wind: [0.3, 0.2],
    weather: [
      { id: 'bright', weight: 2.5, clouds: 0.4, cloudDensity: 0.5, sun: 1.0, fog: 1 },
      { id: 'cloud', weight: 2, clouds: 0.75, cloudDensity: 0.7, sun: 0.6, fog: 1.6 },
      { id: 'mist', weight: 1.5, clouds: 0.85, cloudDensity: 0.75, sun: 0.4, fog: 4.5, fogColor: [0.85, 0.86, 0.87] },
    ],
  },
};
