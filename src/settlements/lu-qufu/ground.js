// Qufu — the ground (docs/settlements/lu-qufu.md §3): the flat plain of the Si River, brick and beaten earth in the temple's courts and the
// streets, the Bishui pool sunk in its stone kerbs; old cypresses, arborvitae and pines in the temple's first courts and the grove of the
// Forest's edge, pagoda trees and elms in the town, jujube and persimmon in the courtyard houses, wheat outside the wall; a warm hazy sky.
// Pure (used by the relief, the collision and the plant workers).

import { RADIUS, TEMPLE, INNER_X, POOL, POOL_Y, KONG_FOREST, MANSION, CITY_WALL, ALTAR, HALL, OLD, DRUM, height, inPool, inRect, inLot, lots, streets, buildRects, SHOP_RECTS, smooth } from './layout.js';

function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vnoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash2(xi, zi), b = hash2(xi + 1, zi), c = hash2(xi, zi + 1), d = hash2(xi + 1, zi + 1);
  return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1;
}
let RECTS = null, STREETS = null, SHOPS = null;
const rects = () => RECTS || (RECTS = buildRects());
const onStreet = (x, z, m = 0) => (STREETS || (STREETS = streets())).some((r) => inRect(r, x, z, m));
const inShop = (x, z, m = 0) => (SHOPS || (SHOPS = SHOP_RECTS())).some((r) => inRect(r, x, z, m));
const inMansion = (x, z, m = 0) => inRect(MANSION, x, z, m);
function cover(x, z, h) {
  const c = { sand: 0.3, grass: 0.12, rock: 0, soil: 0.55, fields: 0, dry: 0.7, warmth: 0.7, red: 0.1, road: 0, snow: 0, forest: 0 };
  if (h < -0.6) { c.soil = 0.9; c.sand = 0.1; c.dry = 0.3; return c; }
  const r = Math.hypot(x, z);
  if (z > CITY_WALL.z + 10 && !onStreet(x, z) || r > RADIUS - 38) { c.fields = 0.7; c.grass = 0.25; c.dry = 0.5; return c; }
  if (inRect(KONG_FOREST, x, z)) { c.soil = 0.8; c.grass = 0.2; return c; }
  if (inRect(TEMPLE, x, z)) {
    // the Dacheng court and the Wu courts: brick; the axis stone way; the first courts earth between pines
    if (z < -52 && Math.abs(x) < INNER_X || Math.abs(x) < 4.5 || inRect([-26, -146, 26, -98], x, z, 4)) { c.road = 0.9; c.sand = 0.2; c.soil = 0.2; c.dry = 0.8; return c; }
    c.road = 0.4; c.sand = 0.4; c.soil = 0.5; return c;
  }
  if (inMansion(x, z, 0) || onStreet(x, z) || inShop(x, z, 1)) { c.road = 0.85; c.sand = 0.3; c.soil = 0.4; return c; }
  c.sand = 0.45 + 0.15 * hash2(x * 0.07, z * 0.07); c.road = 0.12;
  return c;
}
const water = (x, z, y) => inPool(x, z) && y < POOL_Y + 0.3;
const waterLevel = (x, z) => (inPool(x, z, 0.5) ? POOL_Y : -Infinity);
const fromWater = (x, z) => (inPool(x, z) ? -3 : Math.max(-5, Math.min(40, Math.hypot(Math.max(POOL[0] - x, 0, x - POOL[2]), Math.max(POOL[1] - z, 0, z - POOL[3])))));
/** Plants per 100 m². */
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 6 || inPool(x, z, 1.2)) return null;
  // the two apricot trees beside the Apricot Altar (apple stands in for them)
  for (const sx of [-1, 1]) if (Math.hypot(x - sx * 10, z - ALTAR.c[1]) < 2.6) return { apple: 2.4 };
  // the old cypresses of the great court, singly: beside the altar's court, flanking the hall, in the corners and before the Wu
  for (const [px, pz] of OLD) if (Math.hypot(x - px, z - pz) < 3.2) return { cypress: 3.4 };
  if (inRect(KONG_FOREST, x, z)) return Math.abs(x) < 4 ? null : { cypress: 0.4 * (0.5 + smooth(0, 1, vnoise(x * 0.07, z * 0.07))), chinese_pine: 0.25, arborvitae: 0.12, grass_dry: 6 };
  if (inRect(TEMPLE, x, z, 0.5)) {
    if (rects().some((q) => inRect(q, x, z, 1.4)) || Math.abs(x) < 4.2) return null;
    if (z < -52) {
      // the great court and the courts behind: trees only along the walls and between the halls, never before the hall
      if (inRect([-27, -150, 27, -96], x, z, 5) || inRect([-50, -128, 50, -54], x, z, 0)) return null;
      return Math.abs(x) > INNER_X + 1 || z < -150 ? { cypress: 0.1, arborvitae: 0.07, grass_dry: 2 } : null;
    }
    // the first courts: tall old cypresses and pines, the paths between them
    const n = vnoise(x * 0.1 + 5, z * 0.1);
    return { cypress: 0.22 * (0.6 + 0.4 * n), chinese_pine: 0.2, arborvitae: 0.1, grass_dry: 4 };
  }
  if (inMansion(x, z, 0)) return z < -134 && !rects().some((q) => inRect(q, x, z, 1)) ? { pagoda_tree: 0.12, jujube: 0.15, grass: 5 } : (Math.abs(x - 156) > 20 && !onStreet(x, z) && hash2(x * 0.2, z * 0.2) < 0.05 ? { persimmon: 0.2, jujube: 0.15 } : null);
  if (onStreet(x, z, 0.3) || inShop(x, z, 0.5)) return Math.abs(Math.abs(x) - 9) < 0.7 && z > 130 && z < 260 ? { pagoda_tree: 0.5 } : null;
  if (inLot(x, z, 0.5)) {
    const l = lots().find((q) => inRect(q.rect, x, z));
    if (l) { const [x0, z0, x1, z1] = l.rect, u = x - x0, v = z - z0; if (v > 6 && v < z1 - z0 - 9 && u > 3 && u < x1 - x0 - 3) return { jujube: 0.6, persimmon: 0.4, grass: 3 }; }
    return null;
  }
  if (z > CITY_WALL.z + 4) {
    if (z < CITY_WALL.z + 16) return { pagoda_tree: 0.1, elm: 0.1, grass_dry: 6 };
    return hash2(x * 0.3, z * 0.3) < 0.03 ? { elm: 0.1, grass: 6 } : { wheat: 90, grass: 4 };
  }
  if (rects().some((q) => inRect(q, x, z, 1))) return null;
  return { pagoda_tree: 0.1, elm: 0.1, jujube: 0.1, grass: 4 };
}
void HALL;
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { cypress: 3.6, chinese_pine: 0.25, arborvitae: 0.12, apple: 2.4, pagoda_tree: 0.5, elm: 0.1, jujube: 0.6, persimmon: 0.4, wheat: 90 },
  climate: {
    sun: { az: 160, el: 50, color: [1.0, 0.95, 0.87], intensity: 3.2, lat: 35.6, dec: 8, hour: 10.5 },
    sky: { turbidity: 3.8, rayleigh: 1.1, mie: 0.006, mieG: 0.82, zenith: [0.12, 0.2, 0.37], horizon: [0.7, 0.69, 0.65] },
    fog: { color: [0.78, 0.77, 0.72], density: 0.0005, height: 0.012 },
    exposure: 0.5,
    wind: [0.35, 0.2],
    damp: 0.3,
    waterline: POOL_Y,
    weather: [
      { id: 'clear', weight: 4, clouds: 0.15, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'haze', weight: 2.2, clouds: 0.3, cloudDensity: 0.35, sun: 0.85, fog: 1.6, fogColor: [0.8, 0.77, 0.68] },
      { id: 'summer-rain', weight: 0.8, clouds: 0.85, cloudDensity: 0.7, sun: 0.4, fog: 2, rain: 0.4 },
    ],
  },
};
