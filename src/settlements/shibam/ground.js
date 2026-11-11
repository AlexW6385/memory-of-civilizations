// Shibam — the ground: the walled town on its platform (level 0), falling in an embankment of 2.5 m to the wadi floor outside the wall, the dry
// channel of the wadi winding across the south, palm gardens and fields on the floor round the town; nothing grows inside. The hot, dry
// sky of Hadhramaut (lat 15.9). Pure (used by the relief, the collision and the plant workers).

import { RADIUS, WALL, PLATFORM, GATE, outside, inRect, smooth as sm } from './layout.js';

function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
/** The dry channel of the wadi across the south: its centre line and the distance from it. */
const chanZ = (x) => 168 + 7 * Math.sin(x / 38) + 3 * Math.sin(x / 15 + 1);
const CH = { w: 9, d: 1.1 };
function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  const edge = 1 - sm(RADIUS - 22, RADIUS, r);
  let h = -PLATFORM * sm(0, 9, outside(x, z));
  const dc = Math.abs(z - chanZ(x));
  if (outside(x, z) > 20 && dc < CH.w) h -= CH.d * (1 - sm(CH.w * 0.35, CH.w, dc));
  return h * edge;
}
const garden = (x, z) => outside(x, z) > 7 && Math.hypot(x, z) < RADIUS - 8 && Math.abs(z - chanZ(x)) > CH.w + 1 && (z > WALL[3] + 12 || Math.abs(x) > WALL[2] + 12 && Math.abs(z) < WALL[3] + 30);
function cover(x, z) {
  const c = { sand: 0.45, grass: 0, rock: 0.05, soil: 0.4, fields: 0, dry: 0.95, warmth: 0.9, red: 0.3, road: 0, snow: 0, forest: 0 };
  if (inRect(WALL, x, z, 1)) { c.road = 0.85; c.soil = 0.3; c.sand = 0.3; return c; }
  if (outside(x, z) < 6) { c.road = 0.5; return c; }
  if (Math.abs(z - chanZ(x)) < CH.w * 0.7) { c.sand = 0.8; c.soil = 0.1; c.rock = 0.15; return c; }
  if (garden(x, z)) { c.fields = 0.55 + 0.2 * hash2(x * 0.1, z * 0.1); c.soil = 0.4; c.sand = 0.1; c.dry = 0.4; return c; }
  return c;
}
const water = () => false;
const waterLevel = () => -Infinity;
const fromWater = () => 60;
/** Plants per 100 m²: nothing inside the wall; date palms thick in the gardens, tamarisk along the channel, halfa and a thorn tree on the dry floor. */
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 6 || outside(x, z) < 8 || (Math.abs(x - GATE.x) < 8 && z > WALL[3] && z < WALL[3] + 40)) return null;
  const dc = Math.abs(z - chanZ(x));
  if (dc < CH.w + 6) return { tamarisk: 0.5, halfa: 5 };
  if (garden(x, z)) return hash2(Math.floor(x / 14), Math.floor(z / 14)) < 0.75 ? { date_palm: 1.0, tamarisk: 0.1, halfa: 1 } : { date_palm: 0.25, halfa: 4 };
  return { halfa: 4, acacia: 0.03 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { date_palm: 1.0, tamarisk: 0.5, acacia: 0.03 },
  climate: {
    sun: { az: 150, el: 62, color: [1.0, 0.95, 0.85], intensity: 3.8, lat: 15.9, dec: 5, hour: 10.5 },
    sky: { turbidity: 3.2, rayleigh: 1.0, mie: 0.006, mieG: 0.82, zenith: [0.1, 0.19, 0.4], horizon: [0.68, 0.64, 0.56] },
    fog: { color: [0.83, 0.77, 0.66], density: 0.00025, height: 0.012 },
    exposure: 0.45,
    wind: [0.5, 0.1],
    damp: 0.12,        // the dry valley: rain a few days a year; salts and dust, not moss; the rain's streaks under the sills and the parapets
    weather: [
      { id: 'clear', weight: 5, clouds: 0.03, cloudDensity: 0.25, sun: 1.0, fog: 0.9 },
      { id: 'hazy', weight: 1.5, clouds: 0.08, cloudDensity: 0.3, sun: 0.9, fog: 1.6, fogColor: [0.85, 0.78, 0.66] },
      { id: 'dust', weight: 0.5, clouds: 0.2, cloudDensity: 0.4, sun: 0.65, fog: 4, fogColor: [0.82, 0.68, 0.5] },
    ],
  },
};
