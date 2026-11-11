// Ayutthaya — the ground: the flat alluvial island, the brick-faced canals sunk in it, the great river with its sloping banks, beaten earth
// round the houses and along the canals, the wat's swept forecourt, rice fields in the country beyond the island; banyans and bodhi trees at
// the wat, bamboo clumps and fruit trees among the houses; the hot, hazy monsoon sky. Pure (the relief, collision and plant workers use it).

import { RADIUS, WATER, ISLAND, WAT, PALACE, height, inWater, wet, wetRiver, inRect, inLot, onPath, onBridge, smooth as sm } from './layout.js';

function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function cover(x, z, h) {
  const c = { sand: 0, grass: 0.35, rock: 0, soil: 0.45, fields: 0, dry: 0.1, warmth: 0.85, red: 0.2, road: 0, snow: 0, forest: 0 };
  const n = hash2(x * 0.15, z * 0.15);
  if (h < -0.2) { c.soil = 0.9; c.grass = 0; c.sand = 0.1; return c; }
  if (inRect(WAT.wall, x, z) || inRect(PALACE.wall, x, z)) { c.grass = 0.05; c.soil = 0.4; c.road = 0.5; c.sand = 0.4; return c; }
  if (onPath(x, z, 0.5) || onBridge(x, z, 2)) { c.road = 0.8; c.soil = 0.6; c.grass = 0.1; return c; }
  if (inLot(x, z, 2.5)) { c.soil = 0.75; c.grass = 0.2; return c; }
  if (!inRect(ISLAND, x, z, 10) && wetRiver(x, z) > 12) { c.fields = 0.9; c.grass = 0.1; c.soil = 0.2; return c; }
  c.grass = 0.55 + 0.2 * n; c.soil = 1 - c.grass;
  return c;
}
function water(x, z, y) { return inWater(x, z) && y < WATER + 0.3; }
function waterLevel(x, z) { return inWater(x, z) ? WATER : -Infinity; }
function fromWater(x, z) { return Math.max(-5, Math.min(40, wet(x, z))); }
/** Plants per 100 m²: banyan and bodhi at the wat, bamboo clumps and fruit trees among the houses and by the water, grass; none on paths, houses, the compounds. */
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inWater(x, z) || wet(x, z) < 1.8 || inLot(x, z, 1.4) || onPath(x, z, 0.4) || onBridge(x, z, 3)) return null;
  if (inRect(PALACE.wall, x, z, 1)) return { grass: 14, banyan: 0.01 };
  if (inRect(WAT.wall, x, z, 1)) {
    // banyans and bodhi trees only along the compound's walls and in its far corners, keeping the axis and the buildings clear
    const [x0, z0, x1, z1] = WAT.wall, edge = Math.min(x - x0, x1 - x, z - z0, z1 - z);
    if (edge < 2 || edge > 9 || Math.abs(x - WAT.axisX) < 14 || inRect([-66, -170, 120, -118], x, z, 6)) return null;
    return { grass: 10, banyan: 0.01 };
  }
  if (!inRect(ISLAND, x, z, 6)) return { grass: 26, neem: 0.012 };
  const near = wet(x, z) < 9 ? 1 : 0;
  return { grass: 22, bamboo: 0.015 + 0.03 * near, neem: 0.03, teak: 0.008 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { banyan: 0.012, bamboo: 0.045, neem: 0.03, teak: 0.008 },
  climate: {
    sun: { az: 150, el: 62, color: [1.0, 0.94, 0.84], intensity: 3.4, lat: 14, dec: 12, hour: 10 },
    sky: { turbidity: 5.2, rayleigh: 1.35, mie: 0.007, mieG: 0.8, zenith: [0.12, 0.19, 0.32], horizon: [0.6, 0.58, 0.54] },
    fog: { color: [0.74, 0.73, 0.69], density: 0.0006, height: 0.012 },
    exposure: 0.5,
    waterline: WATER,     // the canals' and river's still water: the stain line on brick and posts
    damp: 0.9,            // the monsoon: black mildew and algae on plaster, brick and timber
    wind: [0.25, 0.3],
    weather: [
      { id: 'hazy', weight: 3, clouds: 0.4, cloudDensity: 0.5, sun: 0.95, fog: 1.3 },
      { id: 'towering', weight: 2, clouds: 0.62, cloudDensity: 0.7, sun: 0.85, fog: 1.1 },
      { id: 'shower', weight: 1, clouds: 0.92, cloudDensity: 0.85, sun: 0.35, fog: 1.8, rain: 0.7 },
    ],
  },
};
void sm;
