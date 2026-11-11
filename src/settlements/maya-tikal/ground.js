// Classic Maya Tikal — the ground: the rolling limestone plain of the Petén, the core levelled for its plazas, two plastered
// reservoirs sunk in it, rainforest closing in beyond the patio groups; the humid, hazy sky of the rainy season.
// Pure (used by the relief, the collision and the plant workers).

import { RADIUS, PLAZA, CORE, RESERVOIRS, resDist, inRect, onCauseway, inGroup, nearHouse, inCore, groupDist, smooth as sm } from './layout.js';

function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vnoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash2(xi, zi), b = hash2(xi + 1, zi), c = hash2(xi, zi + 1), d = hash2(xi + 1, zi + 1);
  return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1;
}
const coreDist = (x, z) => Math.max(CORE[0] - x, x - CORE[2], CORE[1] - z, z - CORE[3]);
function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  // gentle rolling relief outside the levelled core
  let h = (1.4 * vnoise(x * 0.012, z * 0.012) + 0.4 * vnoise(x * 0.04, z * 0.04)) * sm(0, 40, coreDist(x, z)) * sm(0, 14, groupDist(x, z));
  for (const R of RESERVOIRS) { const d = resDist(R, x, z); if (d < 3) h = R.bed + (Math.max(0, h) - R.bed) * Math.pow(sm(-4, 3, d), 0.8); }
  // the groups and the causeways lie level
  if (onCauseway(x, z, 2)) h *= 0.15;
  return h * (1 - sm(RADIUS - 30, RADIUS, r));
}
function cover(x, z) {
  const c = { sand: 0, grass: 0, rock: 0, soil: 0, fields: 0, dry: 0.15, warmth: 0.75, red: 0.35, road: 0, snow: 0, forest: 0 };
  if (inRect(PLAZA, x, z)) { c.road = 1; c.soil = 1; c.dry = 0.5; return c; }
  for (const R of RESERVOIRS) if (resDist(R, x, z) < 1.5) { c.rock = 0.7; c.soil = 0.3; return c; }
  const n = hash2(x * 0.1, z * 0.1);
  if (inGroup(x, z)) { c.soil = 0.65; c.grass = 0.35; c.red = 0.5; return c; }
  if (onCauseway(x, z)) { c.road = 1; c.soil = 1; c.dry = 0.4; return c; }
  if (inCore(x, z)) { c.grass = 0.6 + 0.2 * n; c.soil = 0.3; c.red = 0.45; return c; }
  c.grass = 0.55 + 0.25 * n; c.soil = 0.35; c.forest = 0.9; return c;
}
const wetOf = (x, z) => { let m = 1e9; for (const R of RESERVOIRS) m = Math.min(m, resDist(R, x, z)); return m; };
function water(x, z, y) { return wetOf(x, z) < -1.2 && y < RESERVOIRS[0].water + 0.3; }
function waterLevel(x, z) { return wetOf(x, z) < -1.2 ? RESERVOIRS[0].water : -Infinity; }
function fromWater(x, z) { return Math.max(-5, Math.min(40, wetOf(x, z))); }
/** Plants per 100 m²: none on the plazas, the platforms and the causeways; forest gardens in the groups; the forest beyond. */
function planting(x, z, p) {
  if (Math.hypot(x, z) > RADIUS - 6 || wetOf(x, z) < 1.5) return null;
  if (inRect(PLAZA, x, z, 3) || onCauseway(x, z, 2.5)) return null;
  if (inRect([-62, -126, 130, 134], x, z) || inRect([-296, -36, -232, 36], x, z) || nearHouse(x, z, 1.8)) return null;       // the acropolises, the temples, Temple IV
  if (inGroup(x, z, 0.5)) return { grass: 20, fig: 0.1, neem: 0.05 };
  const f = sm(70, 190, Math.hypot(x, z));
  return { grass: 25, banyan: 0.04 + 0.1 * f, teak: 0.1 + 0.4 * f, sycamore_fig: 0.05 + 0.2 * f, neem: 0.1 * f, fig: 0.15 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { banyan: 0.14, teak: 0.5, sycamore_fig: 0.25, neem: 0.1, fig: 0.15 },
  // the humid lowlands in the rainy season: hot, hazy, towering clouds and showers
  climate: {
    sun: { az: 150, el: 62, color: [1.0, 0.95, 0.85], intensity: 3.3, lat: 17.2, dec: 15, hour: 10.5 },
    sky: { turbidity: 4.6, rayleigh: 1.3, mie: 0.006, mieG: 0.8, zenith: [0.1, 0.18, 0.33], horizon: [0.55, 0.58, 0.58] },
    fog: { color: [0.72, 0.76, 0.76], density: 0.0005, height: 0.012 },
    exposure: 0.5,
    waterline: RESERVOIRS[0].water,
    damp: 0.85,
    wind: [0.3, 0.2],
    weather: [
      { id: 'hazy', weight: 3, clouds: 0.4, cloudDensity: 0.5, sun: 0.95, fog: 1.3 },
      { id: 'towering', weight: 2, clouds: 0.65, cloudDensity: 0.7, sun: 0.85, fog: 1.1 },
      { id: 'shower', weight: 1, clouds: 0.92, cloudDensity: 0.85, sun: 0.35, fog: 1.8, rain: 0.7 },
    ],
  },
};
