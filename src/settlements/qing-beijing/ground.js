// Ming–Qing Beijing — the ground: the level plain of the city, the moat and the Golden Water River
// sunk between stone walls, paving inside the palace (no trees there), lanes of earth and brick,
// scholar trees and jujubes in the courtyards, willows along the moat; the sky of a clear Beijing
// autumn. Pure (used by the relief, the collision and the plant workers).

import { RADIUS, LEVEL, MOAT, RIVER, RING, AVENUE, SHOP_APRONS, inRect, inMoat, inRiver, inPalace, lanes, inHouse, inShopStrip, treeNear, inTemple, inBelt, smooth as sm } from './layout.js';

const LANES = lanes();
const onLane = (x, z, m = 0) => LANES.some((l) => inRect(l, x, z, m)) || inRect(RING, x, z, m) && !inRect(MOAT.outer, x, z) || inRect(AVENUE, x, z, m) || SHOP_APRONS.some((r) => inRect(r, x, z, m));
function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }

/** Distance into a rectangle's border band (negative inside the band), for the channels' walls. */
function channel(x, z) {
  if (inMoat(x, z)) {
    const [a0, b0, a1, b1] = MOAT.outer, [c0, d0, c1, d1] = MOAT.inner;
    return -Math.min(x - a0, a1 - x, z - b0, b1 - z, Math.max(c0 - x, x - c1, d0 - z, z - d1));
  }
  if (inRiver(x, z)) return -Math.min(x - RIVER[0], RIVER[2] - x, z - RIVER[1], RIVER[3] - z);
  return 1;
}

function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  let h = LEVEL.ground;
  const c = channel(x, z);
  if (c < 0.3) {
    const bed = inMoat(x, z) ? LEVEL.moatBed : LEVEL.riverBed;
    h = bed + (h - bed) * sm(-0.2, 0.3, c);
  }
  return h * (1 - sm(RADIUS - 30, RADIUS, r));
}

function cover(x, z, h, ny) {
  const c = { sand: 0, grass: 0, rock: 0, soil: 0, fields: 0, dry: 0.35, warmth: 0.35, red: 0.08, road: 0, snow: 0, forest: 0 };
  const r = Math.hypot(x, z);
  if (inPalace(x, z, 4)) { c.road = 1; c.soil = 1; return c; }
  if (r > RADIUS - 26) { c.fields = 0.7; c.grass = 0.3; return c; }
  if (inTemple(x, z, 0.5)) { c.road = 1; c.soil = 1; return c; }                       // the altar's court, paved with brick
  if (onLane(x, z)) { c.road = 0.8; c.soil = 1; c.dry = 0.7; return c; }
  if (inShopStrip(x, z)) { c.road = 0.9; c.soil = 1; c.dry = 0.6; return c; }
  if (inBelt(x, z)) { c.soil = 0.35; c.grass = 0.65; return c; }
  c.soil = 0.6 + 0.2 * hash2(x * 0.2, z * 0.2); c.grass = 1 - c.soil;
  return c;
}

function water(x, z, y) {
  const c = channel(x, z);
  if (c > -0.3) return false;
  return y < (inMoat(x, z) ? LEVEL.moat : LEVEL.river) + 0.3;
}
function waterLevel(x, z) { const c = channel(x, z); return c < -0.3 ? (inMoat(x, z) ? LEVEL.moat : LEVEL.river) : -Infinity; }
function fromWater(x, z) { return Math.max(-5, Math.min(99, channel(x, z) < 0 ? channel(x, z) : (inPalace(x, z) ? 99 : 20))); }

const KIND = { pagoda: 'pagoda_tree', jujube: 'jujube', persimmon: 'persimmon', crabapple: 'apple' };      // the pagoda tree (Sophora japonica) and the persimmon have their own species; the crab-apple is an apple
/**
 * Plants per 100 m²: none in the palace (its courts were kept bare); the trees of the courtyards and
 * the lanes' edges each at its place (a pagoda tree, a jujube, a persimmon or a crab-apple, §17);
 * willows on the moat's banks; the old arborvitae round the temple's wall; grass at the edge.
 */
function planting(x, z, p) {
  if (Math.hypot(x, z) > RADIUS - 8) return null;
  if (inPalace(x, z, 6) || channel(x, z) < 0.6) return null;
  if (inRect(MOAT.outer, x, z, 3) && !inRect(MOAT.outer, x, z, -0.01)) return { willow: 1.6 };
  if (inTemple(x, z, 2.5)) return null;
  if (inBelt(x, z)) return onLane(x, z, 1) || Math.abs(x - 13) < 9 && Math.abs(z - 280) < 4 ? null : { arborvitae: 2.4, grass: 18 };
  const t = treeNear(x, z, 1.5);
  if (t) return { [KIND[t[2]]]: 22 };
  if (onLane(x, z) || inHouse(x, z, 0.4) || inShopStrip(x, z)) return null;
  if (inRect(RING, x, z, 8) || inRect(AVENUE, x, z, 30)) return null;                     // the paved ring before the walls and the approach
  if (Math.hypot(x, z) > RADIUS - 28) return { grass: 30 };
  return { grass: 12 };
}

export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { willow: 1.6, pagoda_tree: 22, persimmon: 22, jujube: 22, apple: 22, arborvitae: 2.4, grass: 30 },
  // a clear autumn day in Beijing: a high blue sky, dry air, a cool wind from the north-west
  climate: {
    sun: { az: 160, el: 38, color: [1.0, 0.95, 0.86], intensity: 3.3, lat: 40, dec: -5, hour: 11 },
    sky: { turbidity: 2.6, rayleigh: 1.1, mie: 0.004, mieG: 0.8, zenith: [0.08, 0.16, 0.36], horizon: [0.42, 0.46, 0.5] },
    fog: { color: [0.7, 0.74, 0.8], density: 0.00035, height: 0.01 },
    exposure: 0.55,
    damp: 0.06,        // the dry north: dust and grime at the foot of the walls, no moss, no rain streaks (§18)
    wind: [0.6, -0.4],
    weather: [
      { id: 'clear', weight: 4, clouds: 0.15, cloudDensity: 0.3, sun: 1.0, fog: 0.8 },
      { id: 'fair', weight: 2.5, clouds: 0.4, cloudDensity: 0.45, sun: 0.9, fog: 1 },
      { id: 'dusty', weight: 1, clouds: 0.3, cloudDensity: 0.4, sun: 0.75, fog: 2.6, fogColor: [0.76, 0.72, 0.62] },
    ],
  },
};
