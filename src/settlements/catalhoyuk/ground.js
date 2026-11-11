// Çatalhöyük — the ground: the flat Konya Plain, the mound's trodden earth under the town, reed marsh pools of the old Çarşamba
// channel round it, dry steppe grass, small fields of wheat and barley at the plain's edge (docs/settlements/catalhoyuk.md §2, §8);
// a high dry continental sky, the double cone of Mount Hasan far in the north-east (not drawn).

import { RADIUS, MARSH, POOLS, inPool, nearTown, CLUSTER, height, smooth as sm, inRect } from './layout.js';

const FIELDS = [[-86, -28, -52, 20], [48, -70, 80, -34]];
const inFields = (x, z, m = 0) => FIELDS.some((r) => inRect(r, x, z, m));
function cover(x, z) {
  const c = { sand: 0.25, grass: 0.35, rock: 0, soil: 0.45, fields: 0, dry: 0.6, warmth: 0.6, red: 0.1, road: 0, snow: 0, forest: 0 };
  if (inPool(x, z, 1.5)) { c.sand = 0.15; c.soil = 0.7; c.grass = 0.15; c.dry = 0.1; return c; }
  if (inRect(CLUSTER, x, z, 8) || nearTown(x, z, 4)) { c.road = 0.6; c.soil = 0.4; c.grass = 0; c.dry = 0.7; return c; }
  if (inFields(x, z)) { c.fields = 0.8; c.grass = 0.2; return c; }
  return c;
}
const water = (x, z, y) => inPool(x, z) && y < MARSH.water + 0.3;
const waterLevel = (x, z) => (inPool(x, z) ? MARSH.water : -Infinity);
function fromWater(x, z) {
  let m = 1e4;
  for (const [cx, cz, a, b] of POOLS) m = Math.min(m, (Math.sqrt(((x - cx) / a) ** 2 + ((z - cz) / b) ** 2) - 1) * Math.min(a, b));
  return m;
}
/** Plants per 100 m²: reeds thick round the pools and standing in the shallows, willow on the old channel, steppe grass, wheat in the plots. */
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 5 || nearTown(x, z, 2)) return null;
  if (inPool(x, z, -3)) return { reeds: 2.4 };
  const w = fromWater(x, z);
  if (w < 7) return { reeds: 3.2, willow: 0.05, grass: 20 };
  if (inFields(x, z)) return { wheat: 90 };
  return { grass_dry: 24, grass: 8 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { reeds: 3.2, willow: 0.05, wheat: 90 },
  climate: {
    sun: { az: 160, el: 52, color: [1.0, 0.95, 0.86], intensity: 3.6, lat: 37.7, dec: 20, hour: 9.5 },
    sky: { turbidity: 2.4, rayleigh: 1.0, mie: 0.004, mieG: 0.8, zenith: [0.1, 0.18, 0.42], horizon: [0.66, 0.7, 0.74] },
    fog: { color: [0.8, 0.8, 0.8], density: 0.0003, height: 0.01 },
    exposure: 0.5,
    damp: 0.12,       // a dry plain: little streaking; the marsh's edge only
    waterline: MARSH.water,   // the marsh pools' still water
    wind: [0.5, 0.2],
    weather: [
      { id: 'clear', weight: 4, clouds: 0.1, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'cloud', weight: 1.5, clouds: 0.5, cloudDensity: 0.55, sun: 0.85, fog: 1.1 },
    ],
  },
};
void sm;
