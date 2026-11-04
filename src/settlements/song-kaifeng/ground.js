// Northern Song Bianjing — the ground: the flat Yellow River plain, the Bian River sunk between
// low banks; willows along the water, elms and jujubes among the houses; the hazy spring sky.

import { RADIUS, RIVER, MONASTERY, STREETS, inRect, inRiver, inLot, smooth as sm } from './layout.js';

function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  let h = 0;
  if (z > RIVER.z0 - 4 && z < RIVER.z1 + 4) h = RIVER.bed * sm(0, 8, Math.min(z - RIVER.z0 + 4, RIVER.z1 + 4 - z));
  return h * (1 - sm(RADIUS - 30, RADIUS, r));
}
const wet = (x, z) => inRiver(x, z);
function cover(x, z) {
  const c = { sand: 0.3, grass: 0.2, rock: 0, soil: 0.5, fields: 0, dry: 0.35, warmth: 0.5, red: 0, road: 0, snow: 0, forest: 0 };
  if (wet(x, z)) { c.soil = 0.7; c.sand = 0.3; return c; }
  if (Math.hypot(x, z) > RADIUS - 28) { c.fields = 0.8; c.grass = 0.2; return c; }
  c.road = inLot(x, z, 0.3) ? 0 : (STREETS.some((s) => inRect(s, x, z)) ? 0.9 : 0.4); return c;
}
function water(x, z, y) { return wet(x, z) && y < RIVER.water + 0.3; }
function waterLevel(x, z) { return wet(x, z) ? RIVER.water : -Infinity; }
function fromWater(x, z) { return wet(x, z) ? 0 : Math.min(Math.abs(z - RIVER.z0), Math.abs(z - RIVER.z1)); }
/** Plants per 100 m²: willows on the riverbanks, elms and jujubes in the gaps between the houses and in the monastery's court. */
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || wet(x, z) || STREETS.some((s) => inRect(s, x, z, 0.5)) || inLot(x, z, 0.5)) return null;
  if ((z > RIVER.z0 - 4 && z < RIVER.z0) || (z > RIVER.z1 && z < RIVER.z1 + 4)) return Math.abs(x) > 24 ? { willow: 2.4 } : null;
  if (inRect(MONASTERY, x, z)) return Math.abs(x - 160) < 26 ? { grass: 8 } : { elm: 0.08, grass: 12 };
  return { elm: 0.08, jujube: 0.08, grass: 12 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { willow: 2.4, elm: 0.08, jujube: 0.08 },
  climate: {
    sun: { az: 160, el: 45, color: [1.0, 0.95, 0.87], intensity: 3.0, lat: 35, dec: 5, hour: 10.5 },
    sky: { turbidity: 4.5, rayleigh: 1.2, mie: 0.007, mieG: 0.82, zenith: [0.12, 0.19, 0.33], horizon: [0.68, 0.68, 0.66] },
    fog: { color: [0.77, 0.77, 0.75], density: 0.0007, height: 0.013 },
    exposure: 0.5,
    wind: [0.3, 0.2],
    weather: [
      { id: 'spring-haze', weight: 3, clouds: 0.35, cloudDensity: 0.4, sun: 0.85, fog: 1.5 },
      { id: 'clear', weight: 2, clouds: 0.15, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'qingming-rain', weight: 1.2, clouds: 0.9, cloudDensity: 0.75, sun: 0.35, fog: 2, rain: 0.5 },
    ],
  },
};
