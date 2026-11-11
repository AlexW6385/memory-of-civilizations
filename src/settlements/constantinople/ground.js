// Constantinople — the ground: the paved squares and streets of the first hill, gardens with
// cypresses, plane trees and vines on the slopes toward the sea; the bright, windy Bosphorus sky.

import { RADIUS, SOPHIA, AUGUSTAION, EIRENE, ZEUXIPPUS, HIPPODROME, PALACE, FORUM, height, onMese, inRect, inLot, onLane, gardens } from './layout.js';

const PAVED = [SOPHIA, AUGUSTAION, EIRENE, ZEUXIPPUS, HIPPODROME, PALACE];
const inGarden = (x, z, m = 0) => gardens().some((g) => inRect(g.rect, x, z, m));
function cover(x, z) {
  const c = { sand: 0.1, grass: 0.45, rock: 0, soil: 0.45, fields: 0, dry: 0.4, warmth: 0.6, red: 0.25, road: 0, snow: 0, forest: 0 };
  if (PAVED.some((r) => inRect(r, x, z, 3)) || onMese(x, z) || (onLane(x, z, 0.3) && !inGarden(x, z, 0)) || Math.hypot(x - FORUM.c[0], z - FORUM.c[1]) < FORUM.r + 7 || inRect([0, 108, 62, 178], x, z)) { c.road = 0.85; return c; }
  return c;
}
const water = () => false, waterLevel = () => -Infinity, fromWater = () => 1e4;
function planting(x, z) {
  if (inGarden(x, z, -0.8)) return { fig: 0.035, olive: 0.02, cypress: 0.012, apple: 0.02, plane_tree: 0.004, grass: 30 };
  if (onLane(x, z, 0.6) || inGarden(x, z, 1) || Math.hypot(x, z) > RADIUS - 6 || PAVED.some((r) => inRect(r, x, z, 6)) || onMese(x, z, 12) || inLot(x, z, 1) || Math.hypot(x - FORUM.c[0], z - FORUM.c[1]) < FORUM.r + 9 || inRect([0, 108, 62, 178], x, z)) return null;
  return { cypress: 0.04, plane_tree: 0.01, grass: 22 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { cypress: 0.04, plane_tree: 0.01, fig: 0.035, olive: 0.02, apple: 0.02 },
  climate: {
    sun: { az: 150, el: 52, color: [1.0, 0.96, 0.9], intensity: 3.5, lat: 41, dec: 10, hour: 10.5 },
    sky: { turbidity: 2.6, rayleigh: 1.05, mie: 0.005, mieG: 0.78, zenith: [0.07, 0.15, 0.4], horizon: [0.62, 0.66, 0.72] },
    fog: { color: [0.78, 0.8, 0.83], density: 0.0003, height: 0.01 },
    exposure: 0.48,
    wind: [0.9, 0.3],
    weather: [
      { id: 'clear', weight: 4, clouds: 0.2, cloudDensity: 0.35, sun: 1.0, fog: 1 },
      { id: 'cloud', weight: 2, clouds: 0.55, cloudDensity: 0.6, sun: 0.8, fog: 1.2 },
      { id: 'rain', weight: 0.7, clouds: 0.92, cloudDensity: 0.85, sun: 0.35, fog: 1.7, rain: 0.7 },
    ],
  },
};
