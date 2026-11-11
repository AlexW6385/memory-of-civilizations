// Conques — the ground: the steep hillside of grey schist and thin soil, terraced gardens and
// vines below the village, chestnut and oak woods on the slopes (oak stands in), the Dourdou's
// rocky bed; the mild, often misty sky of the Rouergue.

import { RADIUS, ABBEY, RIVER, height, inRiver, inRect, inLot, inStreet, gardens } from './layout.js';

function cover(x, z, h, ny) {
  const c = { sand: 0, grass: 0.5, rock: 0, soil: 0.4, fields: 0, dry: 0.3, warmth: 0.45, red: 0.15, road: 0, snow: 0, forest: 0.2 };
  if (inRect(ABBEY.terrace, x, z)) { c.road = 0.8; return c; }
  if (inStreet(x, z, 0.3)) { c.road = 0.9; c.grass = 0.1; return c; }
  if (ny < 0.8) { c.rock = 0.6; c.grass = 0.3; return c; }
  if (h < RIVER.level + 2) { c.rock = 0.5; c.sand = 0.3; return c; }
  return c;
}
function water(x, z, y) { return inRiver(x, z) && y < RIVER.level + 0.3; }
function waterLevel(x, z) { return inRiver(x, z) ? RIVER.level : -Infinity; }
function fromWater(x, z) { return inRiver(x, z) ? -2 : Math.max(-5, Math.min(40, height(x, z) - RIVER.level)); }
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inRiver(x, z) || inRect(ABBEY.terrace, x, z, 3) || inLot(x, z, 1) || inStreet(x, z, 1.5)) return null;
  if (gardens().some((g) => inRect(g.rect, x, z, 0.5))) return { apple: 0.09, grass: 10 };
  const r = Math.hypot(x, z);
  // by the Dourdou: willows and reeds at the water, poplars on the flat of the bank
  const dz = Math.abs(z - (RIVER.z + 14 * Math.sin(x / 90)));
  if (dz < RIVER.w / 2 + 4) return { willow: 0.12, reeds: 3, grass: 20 };
  if (dz < RIVER.w / 2 + 16) return { poplar: 0.06, willow: 0.03, grass: 25 };
  if (r > 170) return { oak: 0.35, grass: 15 };
  // elms and walnuts (elms stand in) by the houses, apples in the terraced gardens
  if (inLot(x, z, 6)) return { apple: 0.03, grass: 18 };
  return { apple: 0.03, oak: 0.05, grass: 20 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { oak: 0.35, apple: 0.05, willow: 0.12, poplar: 0.06, elm: 0.02, reeds: 3 },
  climate: {
    sun: { az: 160, el: 45, color: [1.0, 0.96, 0.9], intensity: 3.3, lat: 45, dec: 8, hour: 11 },
    sky: { turbidity: 2.8, rayleigh: 1.05, mie: 0.006, mieG: 0.78, zenith: [0.08, 0.15, 0.38], horizon: [0.64, 0.68, 0.72] },
    fog: { color: [0.78, 0.8, 0.82], density: 0.0005, height: 0.014 },
    exposure: 0.5,
    damp: 0.75,     // mist and rain in the gorge: moss on the north feet of the schist walls and on the lauzes, rain streaks
    wind: [0.3, 0.2],
    weather: [
      { id: 'clear', weight: 3, clouds: 0.25, cloudDensity: 0.4, sun: 1.0, fog: 1 },
      { id: 'mist', weight: 1.5, clouds: 0.5, cloudDensity: 0.5, sun: 0.75, fog: 2.4 },
      { id: 'rain', weight: 1, clouds: 0.95, cloudDensity: 0.9, sun: 0.35, fog: 1.8, rain: 0.7 },
    ],
  },
};
