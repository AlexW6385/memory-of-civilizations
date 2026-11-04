// Southern Song Lin'an by the Qiantang — the ground: the river's water below its flood wall, the
// level riverside quarter, the canal sunk between its streets, Yuelun Hill rising to the north-west
// under pines, camphor and bamboo; willows by the canal; the humid sky of Jiangnan.

import { RADIUS, LEVEL, WALL, ROAD, T1, T2, CANAL_STREETS, inRect, hill, inRiver, inCanal, inLot, smooth as sm } from './layout.js';

function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  let h = hill(x, z);
  if (inRiver(x, z)) h = LEVEL.bed * sm(WALL.z1, WALL.z1 + 12, z);
  else if (inCanal(x, z)) h = LEVEL.canalBed;
  return h * (1 - sm(RADIUS - 30, RADIUS, r));
}
const wet = (x, z) => (inRiver(x, z) && Math.hypot(x, z) < RADIUS - 30) || inCanal(x, z);
function cover(x, z, h) {
  const c = { sand: 0.1, grass: 0.3, rock: 0, soil: 0.4, fields: 0, dry: 0.1, warmth: 0.5, red: 0, road: 0, snow: 0, forest: 0 };
  if (inRiver(x, z)) { c.sand = 0.6; c.soil = 0.4; return c; }
  if (h > 2.5) { c.forest = 0.7; c.grass = 0.3; c.soil = 0; return c; }
  if (Math.hypot(x, z) > RADIUS - 26) { c.fields = 0.8; c.grass = 0.2; return c; }
  c.road = inLot(x, z, 0.2) ? 0 : 0.45; return c;
}
function water(x, z, y) { return wet(x, z) && y < (inCanal(x, z) ? LEVEL.canal : LEVEL.river) + 0.3; }
function waterLevel(x, z) { return inCanal(x, z) ? LEVEL.canal : wet(x, z) ? LEVEL.river : -Infinity; }
function fromWater(x, z) { return wet(x, z) ? 0 : Math.min(Math.abs(WALL.z1 - z), 60); }
/** Plants per 100 m²: woods on the hill (pines, camphor stand-ins, bamboo, maples), willows on the canal's banks and along the road, a few trees among the houses. */
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || wet(x, z) || inRiver(x, z)) return null;
  if (inRect(T1.rect, x, z, 3) || inRect(T2.rect, x, z, 3) || (Math.abs(x + 110) < 8 && z > 30 && z < 135)) return null;
  const h = hill(x, z);
  if (h > 2) return { chinese_pine: 0.7, elm: 0.25, bamboo: 1.2, maple: 0.3, grass: 25 };
  if (inLot(x, z, 0.5) || z > ROAD.z0 - 0.5 || CANAL_STREETS.some((r) => inRect(r, x, z, 0.5))) return null;
  if (z > 124 && z < 130) return { willow: 0.9 };
  if (Math.hypot(x, z) > RADIUS - 40) return { grass: 25 };
  return { willow: 0.04 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { chinese_pine: 0.7, elm: 0.25, bamboo: 1.2, maple: 0.3, willow: 0.9 },
  climate: {
    sun: { az: 160, el: 42, color: [1.0, 0.94, 0.86], intensity: 2.9, lat: 30, dec: 0, hour: 10.5 },
    sky: { turbidity: 4.5, rayleigh: 1.2, mie: 0.007, mieG: 0.82, zenith: [0.12, 0.19, 0.33], horizon: [0.66, 0.68, 0.7] },
    fog: { color: [0.75, 0.77, 0.78], density: 0.0008, height: 0.014 },
    exposure: 0.5,
    wind: [0.3, 0.2],
    weather: [
      { id: 'hazy', weight: 3, clouds: 0.4, cloudDensity: 0.45, sun: 0.85, fog: 1.4 },
      { id: 'autumn-clear', weight: 2, clouds: 0.15, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'drizzle', weight: 1.5, clouds: 0.95, cloudDensity: 0.8, sun: 0.3, fog: 2.4, rain: 0.5 },
      { id: 'river-mist', weight: 1, clouds: 0.5, cloudDensity: 0.45, sun: 0.55, fog: 4, fogColor: [0.76, 0.78, 0.79] },
    ],
  },
};
