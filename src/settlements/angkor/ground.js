// Angkor — the ground: the flat, wet plain of the Tonle Sap; the moat and the basins sunk in it;
// lawns and laterite paths inside the enclosure; the village's beaten earth; rice fields to the
// horizon; sugar palms, a few great trees (banyan, teak); the hot, hazy sky before the rains.
// Pure (used by the relief, the collision and the plant workers).

import { RADIUS, LEVEL, MOAT, ENCLOSURE, CAUSEWAY, T, inRect, inMoat, inBasin, onRoad, inHouse, smooth as sm } from './layout.js';

function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
/** Depth into the moat's band or a basin (negative inside water). */
function wet(x, z) {
  if (inMoat(x, z)) {
    const [a0, b0, a1, b1] = MOAT.outer, [c0, d0, c1, d1] = MOAT.inner;
    return -Math.min(x - a0, a1 - x, z - b0, b1 - z, Math.max(c0 - x, x - c1, d0 - z, z - d1));
  }
  return inBasin(x, z) ? -2 : 1;
}
function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  let h = LEVEL.ground;
  const w = wet(x, z);
  if (w < 0.5) { const bed = inBasin(x, z) ? LEVEL.basinBed : LEVEL.moatBed; h = bed + (h - bed) * sm(-1.2, 0.5, w); }
  return h * (1 - sm(RADIUS - 30, RADIUS, r));
}
function cover(x, z, h, ny) {
  const c = { sand: 0, grass: 0, rock: 0, soil: 0, fields: 0, dry: 0.15, warmth: 0.85, red: 0.35, road: 0, snow: 0, forest: 0 };
  const r = Math.hypot(x, z), n = hash2(x * 0.1, z * 0.1);
  if (inRect(ENCLOSURE, x, z)) { c.grass = 0.75 + 0.15 * n; c.soil = 1 - c.grass; return c; }
  if (onRoad(x, z) || inRect(CAUSEWAY.outer, x, z, 1)) { c.road = 0.7; c.soil = 1; c.red = 0.6; return c; }
  if (r > 340 || (r > 250 && n < 0.35 && !inHouse(x, z, 20))) { c.fields = 0.9; c.grass = 0.1; return c; }
  c.soil = 0.5 + 0.2 * n; c.grass = 1 - c.soil; return c;
}
function water(x, z, y) { const w = wet(x, z); return w < -0.3 && y < (inBasin(x, z) ? LEVEL.basin : LEVEL.moat) + 0.3; }
function waterLevel(x, z) { const w = wet(x, z); return w < -0.3 ? (inBasin(x, z) ? LEVEL.basin : LEVEL.moat) : -Infinity; }
function fromWater(x, z) { return Math.max(-5, Math.min(40, wet(x, z) < 0 ? wet(x, z) : 20)); }
/** Plants per 100 m²: grass, a few great trees; none on the temple (the sugar palms are placed by town.js, §14). */
function planting(x, z, p) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 6 || wet(x, z) < 0.6) return null;
  if (inRect(T.base.rect, x, z, 4) || inRect(CAUSEWAY.inner, x, z, 2) || inRect(CAUSEWAY.outer, x, z, 2) || onRoad(x, z) || inHouse(x, z, 0.8)) return null;
  if (inRect(ENCLOSURE, x, z)) return { grass: 35, banyan: 0.015, teak: 0.03 };
  const near = inHouse(x, z, 18) ? 1 : 0;
  if (r > 340) return { grass: 20 };
  return { grass: 30, banyan: 0.01, teak: 0.03, neem: 0.03 * near };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { banyan: 0.015, teak: 0.03, neem: 0.03 },
  // the end of the dry season: hot, hazy with smoke and dust, towering clouds in the afternoon
  climate: {
    sun: { az: 120, el: 55, color: [1.0, 0.94, 0.84], intensity: 3.4, lat: 13, dec: 10, hour: 10 },
    sky: { turbidity: 5.5, rayleigh: 1.4, mie: 0.007, mieG: 0.8, zenith: [0.12, 0.18, 0.3], horizon: [0.58, 0.56, 0.52] },
    fog: { color: [0.74, 0.72, 0.68], density: 0.0006, height: 0.012 },
    exposure: 0.5,
    wind: [0.2, 0.3],
    weather: [
      { id: 'hazy', weight: 3, clouds: 0.35, cloudDensity: 0.45, sun: 0.95, fog: 1.3 },
      { id: 'towering', weight: 2, clouds: 0.6, cloudDensity: 0.7, sun: 0.85, fog: 1.1 },
      { id: 'shower', weight: 1, clouds: 0.92, cloudDensity: 0.85, sun: 0.35, fog: 1.8, rain: 0.7 },
    ],
  },
};
