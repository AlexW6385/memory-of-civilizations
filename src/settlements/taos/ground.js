// Taos Pueblo — the ground: the valley floor, the earthen plaza, Red Willow Creek in its shallow bed,
// the ground rising toward the mountain in the north-east; cottonwoods and willows by the creek,
// fields beyond the wall, sagebrush; the high desert sky.

import { RADIUS, WALL, CREEK, creekZ, inCreek, inHouses, KIVAS, inRect, smooth as sm, onKeep, NORTH_RECT, SOUTH_RECT } from './layout.js';

function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  let h = Math.max(0, (x - z) * 0.707 - 140) * 0.18;                 // rising to the north-east
  const dz = Math.abs(z - creekZ(x));
  if (dz < CREEK.w / 2 + 2) h = Math.min(h, CREEK.bed * sm(CREEK.w / 2 + 2, CREEK.w / 2 - 0.5, dz));
  return h * (1 - sm(RADIUS - 30, RADIUS, r));
}
function cover(x, z) {
  const r = Math.hypot(x, z);
  const c = { sand: 0.3, grass: 0.2, rock: 0, soil: 0.5, fields: 0, dry: 0.6, warmth: 0.55, red: 0.25, road: 0, snow: 0, forest: 0 };
  if (inCreek(x, z, 1)) { c.sand = 0.5; c.soil = 0.5; return c; }
  if (inRect(WALL, x, z)) {
    // the trodden ground: swept hard where the visitor and the people go, dry and dusty at the houses' feet and in the alleys, damp soil by the creek
    c.road = onKeep(x, z, 2.2) ? 0.9 : 0.5;
    if (inRect(NORTH_RECT, x, z, 6) || inRect(SOUTH_RECT, x, z, 6)) { c.dry = 0.8; c.soil = 0.65; c.road = Math.min(c.road, 0.35); }
    if (Math.abs(z - creekZ(x)) < 9) { c.soil = 0.75; c.grass = 0.3; }
    return c;
  }
  if (r < RADIUS - 30 && r > 175) { c.fields = 0.7; c.grass = 0.3; return c; }
  return c;
}
function water(x, z, y) { return inCreek(x, z) && y < CREEK.water + 0.3; }
function waterLevel(x, z) { return inCreek(x, z) ? CREEK.water : -Infinity; }
function fromWater(x, z) { return Math.abs(z - creekZ(x)); }
/** Plants per 100 m²: cottonwoods and willows along the creek, sagebrush stand-ins and grass on the dry ground, nothing in the plaza or on the houses. */
function planting(x, z) {
  const r = Math.hypot(x, z), dz = Math.abs(z - creekZ(x));
  if (r > RADIUS - 6 || inCreek(x, z) || inHouses(x, z, 1) || KIVAS.some(([kx, kz, kr]) => Math.hypot(x - kx, z - kz) < kr + 2.6) || (Math.abs(z + 44) < 1.6 && [-52, -17, 18, 30].some((bx) => Math.abs(x - bx) < 2.6))) return null;
  if (dz < 9 && !inRect([-60, -45, 60, 40], x, z)) return { poplar: 0.9, willow: 0.7, grass: 30 };
  if (inRect(WALL, x, z)) {
    // chamisa and dry grass in the corners of the wall and behind the North House, none on the trodden plaza
    const edge = Math.min(x - WALL[0], WALL[2] - x, z - WALL[1], WALL[3] - z);
    if (!inRect([-75, -48, 75, 44], x, z) && (edge < 9 || z < -102) && !onKeep(x, z, 4)) return { maquis: 0.3, grass_dry: 10 };
    return null;
  }
  if (r > 175) return { grass: 30 };
  return { maquis: 0.6, grass_dry: 12, poplar: 0.02 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { poplar: 0.9, willow: 0.7, maquis: 0.6 },
  climate: {
    sun: { az: 160, el: 45, color: [1.0, 0.96, 0.9], intensity: 3.5, lat: 36, dec: 5, hour: 10.5 },
    sky: { turbidity: 2.2, rayleigh: 1.0, mie: 0.003, mieG: 0.8, zenith: [0.08, 0.16, 0.4], horizon: [0.6, 0.66, 0.72] },
    fog: { color: [0.75, 0.78, 0.82], density: 0.0003, height: 0.01 },
    exposure: 0.48,
    wind: [0.4, 0.1],
    weather: [
      { id: 'clear', weight: 4, clouds: 0.1, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'storm-building', weight: 1.5, clouds: 0.55, cloudDensity: 0.6, sun: 0.8, fog: 1.1 },
    ],
  },
};
