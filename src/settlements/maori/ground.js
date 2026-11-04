// The pā — the ground: grass and bracken on the hill's terraces and scarps, the bare earth of the
// paths, kūmara gardens in mounds, flax (harakeke) and cabbage trees by the lake, the lake itself;
// mānuka and forest beyond; the mild, changeable sky of the North Island.

import { RADIUS, HILL, LAKE, PATH, height, inLake, inGarden, village } from './layout.js';

function cover(x, z, h, ny) {
  const c = { sand: 0, grass: 0.8, rock: 0, soil: 0.2, fields: 0, dry: 0.15, warmth: 0.45, red: 0.1, road: 0, snow: 0, forest: 0 };
  if (inGarden(x, z)) { c.fields = 0.8; c.soil = 0.6; return c; }
  if (Math.abs(x - PATH.x) < PATH.w / 2 && z > HILL.c[1]) { c.road = 0.8; return c; }
  if (ny < 0.8) { c.soil = 0.6; c.grass = 0.4; return c; }
  if (h < LAKE.level + 0.8) { c.sand = 0.6; c.grass = 0.2; return c; }
  return c;
}
function water(x, z, y) { return inLake(x, z) && y < LAKE.level + 0.3; }
function waterLevel(x, z) { return inLake(x, z) ? LAKE.level : -Infinity; }
function fromWater(x, z) { return Math.max(-5, Math.min(40, height(x, z) - LAKE.level)); }
function planting(x, z) {
  const r = Math.hypot(x - HILL.c[0], z - HILL.c[1]);
  if (Math.hypot(x, z) > RADIUS - 6 || inLake(x, z) || r < HILL.ditch + 4 || Math.abs(x - PATH.x) < PATH.w + 1 || inGarden(x, z)) return r < HILL.ditch + 4 && r > 20 ? { grass: 30 } : null;
  const v = village();
  if ([...v.houses, ...v.pataka, ...v.pits].some((o) => Math.hypot(o.c[0] - x, o.c[1] - z) < 4.5)) return null;
  if (height(x, z) < LAKE.level + 3) return { reeds: 12, maquis: 0.15, grass: 20 };
  if (Math.hypot(x, z) > RADIUS - 70) return { maquis: 0.3, tamarisk: 0.05, grass: 25 };
  return { grass: 35, maquis: 0.04 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { maquis: 0.3, tamarisk: 0.05 },
  climate: {
    sun: { az: 0, el: 52, color: [1.0, 0.97, 0.92], intensity: 3.4, lat: -38, dec: -10, hour: 11 },
    sky: { turbidity: 2.2, rayleigh: 1.0, mie: 0.004, mieG: 0.78, zenith: [0.07, 0.15, 0.42], horizon: [0.62, 0.68, 0.76] },
    fog: { color: [0.76, 0.8, 0.84], density: 0.00035, height: 0.012 },
    exposure: 0.48,
    wind: [0.8, 0.3],
    weather: [
      { id: 'changeable', weight: 3, clouds: 0.5, cloudDensity: 0.55, sun: 0.9, fog: 1.1 },
      { id: 'clear', weight: 2, clouds: 0.15, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'showers', weight: 1.2, clouds: 0.9, cloudDensity: 0.8, sun: 0.4, fog: 1.6, rain: 0.7 },
    ],
  },
};
