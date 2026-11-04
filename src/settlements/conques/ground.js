// Conques — the ground: the steep hillside of grey schist and thin soil, terraced gardens and
// vines below the village, chestnut and oak woods on the slopes (oak stands in), the Dourdou's
// rocky bed; the mild, often misty sky of the Rouergue.

import { RADIUS, ABBEY, RIVER, height, inRiver, inRect, inLot } from './layout.js';

function cover(x, z, h, ny) {
  const c = { sand: 0, grass: 0.5, rock: 0, soil: 0.4, fields: 0, dry: 0.3, warmth: 0.45, red: 0.15, road: 0, snow: 0, forest: 0.2 };
  if (inRect(ABBEY.terrace, x, z)) { c.road = 0.8; return c; }
  if (ny < 0.8) { c.rock = 0.6; c.grass = 0.3; return c; }
  if (h < RIVER.level + 2) { c.rock = 0.5; c.sand = 0.3; return c; }
  return c;
}
function water(x, z, y) { return inRiver(x, z) && y < RIVER.level + 0.3; }
function waterLevel(x, z) { return inRiver(x, z) ? RIVER.level : -Infinity; }
function fromWater(x, z) { return inRiver(x, z) ? -2 : Math.max(-5, Math.min(40, height(x, z) - RIVER.level)); }
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inRiver(x, z) || inRect(ABBEY.terrace, x, z, 3) || inLot(x, z, 1)) return null;
  const r = Math.hypot(x, z);
  if (r > 170) return { oak: 0.35, grass: 15 };
  return { apple: 0.03, oak: 0.05, grass: 20 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { oak: 0.35, apple: 0.03 },
  climate: {
    sun: { az: 160, el: 45, color: [1.0, 0.96, 0.9], intensity: 3.3, lat: 45, dec: 8, hour: 11 },
    sky: { turbidity: 2.8, rayleigh: 1.05, mie: 0.006, mieG: 0.78, zenith: [0.08, 0.15, 0.38], horizon: [0.64, 0.68, 0.72] },
    fog: { color: [0.78, 0.8, 0.82], density: 0.0005, height: 0.014 },
    exposure: 0.5,
    wind: [0.3, 0.2],
    weather: [
      { id: 'clear', weight: 3, clouds: 0.25, cloudDensity: 0.4, sun: 1.0, fog: 1 },
      { id: 'mist', weight: 1.5, clouds: 0.5, cloudDensity: 0.5, sun: 0.75, fog: 2.4 },
      { id: 'rain', weight: 1, clouds: 0.95, cloudDensity: 0.9, sun: 0.35, fog: 1.8, rain: 0.7 },
    ],
  },
};
