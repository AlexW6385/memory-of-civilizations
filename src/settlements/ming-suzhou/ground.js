// Ming Suzhou — the ground of the settlement: the town's level streets and lanes, the canals sunk
// between their stone walls, the garden's pond with its islands and rockery hills; what covers the
// ground; where water stops the walker; where plants grow (willows along the canals and the pond,
// pines, plum trees and maples on the islands, bamboo by the garden walls, osmanthus by the halls,
// loquats in their court); and the sky of Jiangnan in late spring. Pure: used by the planet's
// relief, the collision, the plant workers. docs/settlements/ming-suzhou.md §6–§8.

import {
  RADIUS, LEVEL, GARDEN, RESIDENCE, ISLANDS, MOUNDS, LOQUAT_COURT, FOOTPRINTS,
  pondDistance, canalDistance, inRect, onStreet, onBridge, inLot, nearGallery, nearRockPath, smooth as sm,
} from './layout.js';

function bump(shapes, x, z) {
  let h = 0;
  for (const s of shapes) {
    const e = Math.hypot((x - s.c[0]) / s.r[0], (z - s.c[1]) / s.r[1]);
    if (e < 1.15) h = Math.max(h, s.h * Math.pow(Math.max(0, 1 - e * e / 1.3225), 1.4));
  }
  return h;
}
function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vnoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash2(xi, zi), b = hash2(xi + 1, zi), c = hash2(xi, zi + 1), d = hash2(xi + 1, zi + 1);
  return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1;
}

/** Height of the ground at (x, z), fading to the settlement's level (0) at the rim. */
function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  let h = LEVEL.street;
  const inGarden = inRect(GARDEN, x, z) || inRect(RESIDENCE, x, z);
  if (inGarden) h = LEVEL.garden;
  // the canals: a stone-walled channel (the walls are built), its bed of silt
  const cd = canalDistance(x, z);
  if (cd < 0.4) h = LEVEL.canalBed + (h - LEVEL.canalBed) * sm(-0.3, 0.4, cd);
  // the pond: its bed, rising to the rockery shore; the islands and the hills
  if (inRect(GARDEN, x, z, -0.5)) {
    const pd = pondDistance(x, z);
    if (pd < 1.5) h = LEVEL.pondBed + (h - LEVEL.pondBed) * sm(-2.5, 1.5, pd);
    h += bump(ISLANDS, x, z) + bump(MOUNDS, x, z);
  }
  return h * (1 - sm(RADIUS - 30, RADIUS, r));
}

/** What covers the ground (the same keys as the planet's ground cover). */
function cover(x, z, h, ny) {
  const r = Math.hypot(x, z), n = vnoise(x * 0.08, z * 0.08);
  const c = { sand: 0, grass: 0, rock: 0, soil: 0, fields: 0, dry: 0.12, warmth: 0.3, red: 0.05, road: 0, snow: 0, forest: 0 };
  const steep = sm(0.88, 0.62, ny);
  if (inRect(GARDEN, x, z)) {
    // moss and grass under the trees, beaten earth on the paths' edges, rock on the hills' flanks
    c.rock = Math.max(steep, sm(1.2, 2.6, h) * 0.35);
    c.grass = (0.72 + 0.12 * n) * (1 - c.rock); c.soil = 1 - c.grass - c.rock; c.dry = 0.06;
  } else if (r > RADIUS - 28) {
    // rice fields beyond the last houses
    c.fields = 0.85; c.grass = 0.15;
  } else {
    c.soil = 0.55 + 0.15 * n; c.grass = 1 - c.soil; c.dry = 0.2;
    if (onStreet(x, z)) { c.road = 1; c.soil = 1; c.grass = 0; }
  }
  return c;
}

/** Water that cannot be waded: the canals and the pond (y: the walker's feet). */
function water(x, z, y) {
  if (canalDistance(x, z) < -0.3 && y < LEVEL.canal + 0.3 && !onBridge(x, z)) return true;
  return inRect(GARDEN, x, z) && pondDistance(x, z) < -1.0 && y < LEVEL.pond + 0.3;
}
function waterLevel(x, z) {
  if (canalDistance(x, z) < -0.3) return LEVEL.canal;
  if (inRect(GARDEN, x, z) && pondDistance(x, z) < -1.0) return LEVEL.pond;
  return -Infinity;
}
function fromWater(x, z) { return Math.min(Math.max(-5, canalDistance(x, z)), inRect(GARDEN, x, z) ? pondDistance(x, z) : 99); }

/** Plants per 100 m² at a place ({ x, z, h, ny, g }), or null where nothing grows. */
function planting(x, z, p) {
  if (Math.hypot(x, z) > RADIUS - 6) return null;
  const cd = canalDistance(x, z);
  if (cd < 0.6 || onBridge(x, z, 1)) return null;
  // willows along the canals, on the street's edge above the water
  if (cd < 1.2 && onStreet(x, z)) return { willow: 1.1 };
  if (onStreet(x, z) || inLot(x, z, 0.6) || inRect(RESIDENCE, x, z, 0.5)) return null;
  if (inRect(GARDEN, x, z)) {
    if (FOOTPRINTS.some((r) => inRect(r, x, z, 1.2)) || nearGallery(x, z) || nearRockPath(x, z, 2.4)) return null;
    const pd = pondDistance(x, z);
    if (pd < 0.8) return pd < -0.4 ? null : { willow: 2 };
    const wall = Math.min(x - GARDEN[0], GARDEN[2] - x, z - GARDEN[1], GARDEN[3] - z);
    const n = vnoise(x * 0.05 + 3, z * 0.05);
    if (inRect(LOQUAT_COURT, x, z)) return { fig: 1.5, grass: 30 };
    const out = { grass: 45 * p.g.grass };
    if (pd < 4) out.willow = 0.9;
    if (p.h > 0.7) { out.chinese_pine = 0.7; out.maple = 0.9; out.apple = 0.6; out.bamboo = 0.6 * sm(0.0, 0.4, n); }
    else {
      if (wall < 7) out.bamboo = 3 * sm(-0.1, 0.3, n);
      out.holm_oak = 0.25; out.maple = 0.25 * sm(0.1, 0.5, n); out.apple = 0.3 * sm(0.2, 0.6, -n);
    }
    return out;
  }
  // yards and the town's edges: grass, now and then a camphor tree or a loquat
  return { grass: 25, oak: 0.08, fig: 0.06 };
}

export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { willow: 2, bamboo: 3, fig: 1.5, chinese_pine: 0.7, maple: 0.9, apple: 0.6, holm_oak: 0.25, oak: 0.08 },
  // late spring in Jiangnan (the plum rains near): soft hazy sun, drizzle and mist over the water
  climate: {
    sun: { az: 140, el: 40, color: [1.0, 0.92, 0.82], intensity: 3.0, lat: 31, dec: 15, hour: 10 },
    sky: { turbidity: 4.4, rayleigh: 1.35, mie: 0.0055, mieG: 0.8, zenith: [0.11, 0.15, 0.25], horizon: [0.33, 0.34, 0.34] },
    fog: { color: [0.64, 0.67, 0.68], density: 0.0007, height: 0.012 },
    exposure: 0.6,
    wind: [0.3, 0.2],
    weather: [
      { id: 'hazy', weight: 3, clouds: 0.4, cloudDensity: 0.45, sun: 0.9, fog: 1.4 },
      { id: 'cloudy', weight: 2.5, clouds: 0.7, cloudDensity: 0.6, sun: 0.65, fog: 1.6 },
      { id: 'drizzle', weight: 2, clouds: 0.95, cloudDensity: 0.8, sun: 0.3, fog: 2.4, rain: 0.5 },
      { id: 'water-mist', weight: 1.2, clouds: 0.5, cloudDensity: 0.45, sun: 0.55, fog: 4.2, fogColor: [0.74, 0.76, 0.77] },
    ],
  },
};
