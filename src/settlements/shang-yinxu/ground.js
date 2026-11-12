// Shang Yinxu — the ground: the alluvial plain of the Huan river, pale silt and loess; the river in its bed with reeds and willows
// on its banks, the dry moat, beaten-earth lanes and court, millet fields beyond the lineage quarters; mulberries, jujubes and elms
// in the yards; a warm, humid monsoon sky (docs/settlements/shang-yinxu.md §3). Pure (used by the relief, the collision and the plant workers).
import { RADIUS, RIVER, ZONE_R, COURT, FOUNDRY, ARCHIVE, TOMB, height, riverDist, inRiver, inMoat, inRect, inLot, streets, lots, reserved } from './layout.js';

function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
const onStreet = (x, z) => streets().some((r) => inRect(r, x, z));
const inFoundry = (x, z, m = 0) => inRect(FOUNDRY, x, z, m);
function cover(x, z) {
  const c = { sand: 0.3, grass: 0.35, rock: 0, soil: 0.55, fields: 0, dry: 0.5, warmth: 0.75, red: 0.15, road: 0, snow: 0, forest: 0 };
  const dr = riverDist(x, z);
  if (dr < RIVER.half + 4) { c.sand = 0.55; c.soil = 0.5; c.grass = dr > RIVER.half ? 0.25 : 0; return c; }
  if (inRect(COURT, x, z, 3) || inRect([ARCHIVE.rect[0] - 6, ARCHIVE.rect[1] - 6, ARCHIVE.rect[2] + 6, ARCHIVE.shed[3] + 4], x, z) || inRect([TOMB.plat[0] - 6, TOMB.plat[1] - 6, TOMB.pits[2] + 6, -92], x, z)) { c.road = 0.9; c.sand = 0.3; c.soil = 0.2; c.grass = 0; return c; }
  if (inFoundry(x, z, 2) || onStreet(x, z) || inLot(x, z, 0.5) || inMoat(x, z, 1)) { c.road = 0.8; c.sand = 0.3; c.grass = 0.05; return c; }
  if (Math.hypot(x, z) > 150 && !reserved(x, z)) {
    // millet and wheat plots in a patchwork (about half of the plain, thinner far out), fallow strips between: a third of the plants a solid carpet would need
    const r = Math.hypot(x, z), plot = hash2(Math.floor(x / 36), Math.floor(z / 28)) < (r < 235 ? 0.62 : 0.4);
    if (plot) { c.fields = 0.55; c.grass = 0.2; c.dry = 0.4; } else { c.grass = 0.3; c.dry = 0.55; }
    return c;
  }
  return c;
}
const water = (x, z, y) => inRiver(x, z, -1.2) && y < RIVER.water + 0.3;
const waterLevel = (x, z) => (inRiver(x, z, -1.2) ? RIVER.water : -Infinity);
const fromWater = (x, z) => Math.max(0, riverDist(x, z) - RIVER.half);
/** Plants per 100 m²: reeds and willows on the banks, bamboo in a clump or two, mulberries, jujubes and elms in and round the yards, grass; nothing on the court, lanes, foundry or moat. */
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 6) return null;
  const dr = riverDist(x, z) - RIVER.half;
  if (dr < -1.2) return null;
  if (dr < 5) return { reeds: 3.2, willow: 0.2, grass: 18 };
  if (dr < 14) return { willow: 0.16, poplar: 0.08, elm: 0.04, bamboo: hash2(x * 0.1, z * 0.1) < 0.3 ? 0.5 : 0, reeds: dr < 8 ? 0.8 : 0, grass: 16 };
  if (inRect(COURT, x, z, 3) || reserved(x, z, 1) || inFoundry(x, z, 3) || inMoat(x, z, 2) || onStreet(x, z)) return null;
  if (inLot(x, z, 0.5)) return null;
  if (r > 150) return { elm: 0.02, mulberry: 0.03, grass_dry: 3 };
  if (hash2(x * 0.3, z * 0.3) < 0.3) return { elm: 0.09, jujube: 0.1, mulberry: 0.1, grass: 14 };
  return { grass: 12 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { reeds: 3.2, willow: 0.2, poplar: 0.08, bamboo: 0.5, mulberry: 0.1, jujube: 0.1, elm: 0.09 },
  climate: {
    sun: { az: 150, el: 58, color: [1.0, 0.95, 0.86], intensity: 3.6, lat: 36.1, dec: 10, hour: 10 },
    sky: { turbidity: 3.2, rayleigh: 1.0, mie: 0.006, mieG: 0.8, zenith: [0.1, 0.18, 0.4], horizon: [0.7, 0.7, 0.64] },
    fog: { color: [0.8, 0.78, 0.7], density: 0.00032, height: 0.012 },
    exposure: 0.46,
    wind: [0.4, 0.2],
    damp: 0.18,
    waterline: RIVER.water,
    weather: [
      { id: 'clear', weight: 4, clouds: 0.12, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'hazy', weight: 2, clouds: 0.2, cloudDensity: 0.35, sun: 0.85, fog: 1.7, fogColor: [0.82, 0.76, 0.64] },
      { id: 'cloudy', weight: 1.5, clouds: 0.6, cloudDensity: 0.6, sun: 0.6, fog: 1.2 },
    ],
  },
};
void ZONE_R;
