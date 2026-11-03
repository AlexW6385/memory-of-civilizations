// Djenné — the ground: the town's mound above the floods, the channel of the Bani round it, the
// flat floodplain beyond with its rice and grass; few trees (neem in the courts, a baobab-like
// great tree, doum palms by the water); the dusty, hazy sky of the dry season (the harmattan).
// Pure (used by the relief, the collision and the plant workers).

import { RADIUS, LEVEL, MOSQUE, MARKET, inRect, shore, inHouse, smooth as sm } from './layout.js';

function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  const s = shore(x, z);
  let h;
  if (s < 0) h = LEVEL.town;
  else if (s < 50) h = LEVEL.bed + (LEVEL.town - LEVEL.bed) * sm(14, 0, s) + (s > 30 ? (LEVEL.plain - LEVEL.bed) * sm(30, 50, s) : 0);
  else h = LEVEL.plain;
  return h * (1 - sm(RADIUS - 30, RADIUS, r));
}
const inChannel = (x, z) => { const s = shore(x, z); return s > 4 && s < 42; };
function cover(x, z, h, ny) {
  const c = { sand: 0.15, grass: 0, rock: 0, soil: 0, fields: 0, dry: 0.7, warmth: 0.95, red: 0.5, road: 0, snow: 0, forest: 0 };
  const s = shore(x, z);
  if (s < 0) { c.soil = 0.85; c.sand = 0.15; c.road = inHouse(x, z, 0.5) ? 0 : 0.6; return c; }
  if (s > 46) { c.fields = 0.6; c.grass = 0.3; c.soil = 0.1; c.dry = 0.4; return c; }
  c.soil = 0.6; c.sand = 0.4; return c;
}
function water(x, z, y) { return inChannel(x, z) && shore(x, z) > 8 && shore(x, z) < 38 && y < LEVEL.water + 0.3; }
function waterLevel(x, z) { return inChannel(x, z) && shore(x, z) > 8 && shore(x, z) < 38 ? LEVEL.water : -Infinity; }
function fromWater(x, z) { const s = shore(x, z); return s < 0 ? -s + 8 : s < 8 ? 8 - s : s < 38 ? -3 : s - 38; }
function planting(x, z, p) {
  if (Math.hypot(x, z) > RADIUS - 6) return null;
  const s = shore(x, z);
  if (s > 6 && s < 40) return null;
  if (s < 0) {
    if (inHouse(x, z, 0.6) || inRect([-48, -48, 48, 48], x, z) || inRect(MARKET, x, z)) return null;
    return hash2(x * 0.3, z * 0.3) < 0.08 ? { neem: 0.6 } : null;
  }
  if (s < 6 || (s > 40 && s < 52)) return { doum_palm: 0.25, halfa: 20 };
  return { halfa: 25, acacia: 0.04, banyan: 0.006 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { neem: 0.6, doum_palm: 0.25, acacia: 0.04, banyan: 0.006 },
  climate: {
    sun: { az: 150, el: 50, color: [1.0, 0.92, 0.8], intensity: 3.2, lat: 14, dec: -12, hour: 11 },
    sky: { turbidity: 6.5, rayleigh: 1.2, mie: 0.009, mieG: 0.82, zenith: [0.16, 0.2, 0.3], horizon: [0.7, 0.62, 0.5] },
    fog: { color: [0.8, 0.7, 0.56], density: 0.0009, height: 0.014 },
    exposure: 0.5,
    wind: [0.6, -0.1],
    weather: [
      { id: 'harmattan', weight: 3, clouds: 0.1, cloudDensity: 0.3, sun: 0.8, fog: 1.6 },
      { id: 'clear', weight: 2, clouds: 0.15, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'dust', weight: 1, clouds: 0.2, cloudDensity: 0.4, sun: 0.6, fog: 3.2 },
    ],
  },
};
