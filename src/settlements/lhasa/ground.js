// Lhasa — the ground: the flat valley at 3,650 m, the rocky ridge of Marpo Ri and Chokpori, barley
// fields, willows and poplars on the valley floor; the intensely clear plateau sky.

import { RADIUS, SHOL, POND, CHAPEL, hill, inRect, inLot, pondDist, smooth as sm } from './layout.js';

/** The valley is ringed by mountains: the ground rises toward its rim to meet them (RIM above the valley floor). */
export const RIM = 50;
function height(x, z) {
  const r = Math.hypot(x, z); if (r > RADIUS) return RIM;
  const f = sm(RADIUS - 90, RADIUS, r), pd = pondDist(x, z);
  // the pond's basin: its banks falling over 4 m to the bed; the island rising back out of it
  const dig = pd < 0 ? POND.bed * sm(0, -4, pd) : pd < 3 ? POND.bed * 0.35 * sm(3, 0, pd) : 0;
  return Math.max(hill(x, z), 0) * (1 - f) + RIM * f + dig;
}
function cover(x, z, h) {
  const c = { sand: 0.2, grass: 0.3, rock: 0, soil: 0.5, fields: 0, dry: 0.6, warmth: 0.45, red: 0.15, road: 0, snow: 0, forest: 0 };
  if (h > 3) { c.rock = 0.6; c.grass = 0.3; c.soil = 0.1; return c; }
  if (inRect(SHOL, x, z)) { c.road = 0.6; return c; }
  if (z > 40 || Math.hypot(x, z) > 300) { c.fields = 0.7; c.grass = 0.3; return c; }
  return c;
}
const water = (x, z, y) => pondDist(x, z) < 0 && y < POND.level + 0.3;
const waterLevel = (x, z) => (pondDist(x, z) < 0 ? POND.level : -Infinity);
const fromWater = (x, z) => Math.max(-5, Math.min(99, pondDist(x, z)));
/** Plants per 100 m²: willows and poplars in rows on the valley floor, grass on the hills, none in Shöl. */
function planting(x, z) {
  const r = Math.hypot(x, z);
  // the open ground below the palace stairs: willows and poplars of the village's north edge, clear of the street and the stairs' foot
  if (z > 35 && z < 46 && Math.abs(x) > 20 && Math.abs(x) < 196 && hill(x, z) < 1.5) return { willow: 0.28, poplar: 0.12, grass: 18 };
  if (r > RADIUS - 6 || inRect(SHOL, x, z, 3) || inLot(x, z, 2) || inRect(CHAPEL, x, z, 1.5)) return null;
  const pd = pondDist(x, z);
  if (pd < 0.5) return null;
  if (pd < 12) return { willow: 0.9, grass: 30 };                                         // willows round the pond and on its island
  if (hill(x, z) > 2) return { grass_dry: 10 };
  if (Math.abs(x) < 210 && z < 60 && z > -250) return null;
  return { willow: 0.15, poplar: 0.2, grass: 20 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater, rim: RIM,
  maxDensity: { willow: 0.9, poplar: 0.2 },
  climate: {
    sun: { az: 160, el: 50, color: [1.0, 0.97, 0.92], intensity: 3.6, lat: 30, dec: 0, hour: 10.5 },
    sky: { turbidity: 1.8, rayleigh: 0.9, mie: 0.002, mieG: 0.78, zenith: [0.06, 0.13, 0.42], horizon: [0.56, 0.64, 0.74] },
    fog: { color: [0.74, 0.79, 0.85], density: 0.0002, height: 0.008 },
    exposure: 0.46,
    wind: [0.5, 0.1],
    weather: [
      { id: 'clear', weight: 5, clouds: 0.1, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'afternoon-cloud', weight: 1.5, clouds: 0.45, cloudDensity: 0.5, sun: 0.85, fog: 1 },
    ],
  },
};
