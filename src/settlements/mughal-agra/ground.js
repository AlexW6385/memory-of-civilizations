// Mughal Agra — the ground: the level plain of the Yamuna, the riverbank falling to the water on
// the north; the garden's beds, the town's dusty lanes; cypresses and fruit trees in the garden,
// neem and peepal in the town; the hazy sky of the north Indian winter.

import { RADIUS, RIVER_Z, TERRACE, GARDEN, KATRAS, LODGES, HAVELI_OPEN, WORKSHOP, inRect, inHouse, onStreet, walkDist, smooth as sm } from './layout.js';

function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
export const LEVEL = { water: -2.4, bed: -5 };
function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  let h = 0;
  if (z < RIVER_Z + 8 && !inRect(TERRACE.rect, x, z, 2)) h = LEVEL.bed + (0 - LEVEL.bed) * sm(RIVER_Z - 10, RIVER_Z + 8, z);
  if (z < RIVER_Z - 10) h = LEVEL.bed;
  return h * (1 - sm(RADIUS - 30, RADIUS, r));
}
const inRiver = (x, z) => (z < RIVER_Z - 4 && !inRect(TERRACE.rect, x, z, 4)) || (z < RIVER_Z + 8 && height(x, z) < LEVEL.water - 0.3);
function cover(x, z, h, ny) {
  const c = { sand: 0.2, grass: 0, rock: 0, soil: 0, fields: 0, dry: 0.5, warmth: 0.8, red: 0.25, road: 0, snow: 0, forest: 0 };
  if (z < RIVER_Z + 10) { c.sand = 0.8; c.soil = 0.2; return c; }
  if (inRect(GARDEN, x, z)) { c.grass = 0.85; c.soil = 0.15; c.dry = 0.2; return c; }
  if (Math.hypot(x, z) > RADIUS - 28) { c.fields = 0.7; c.grass = 0.3; return c; }
  c.soil = 0.65; c.sand = 0.25; c.grass = 0.1; c.road = inHouse(x, z, 0.5) ? 0 : onStreet(x, z, 0.5) ? 0.95 : 0.4; return c;
}
function water(x, z, y) { return inRiver(x, z) && y < LEVEL.water + 0.3; }
function waterLevel(x, z) { return inRiver(x, z) ? LEVEL.water : -Infinity; }
function fromWater(x, z) { return z - RIVER_Z; }
/** Plants per 100 m²: in the garden's quarters a line of cypresses along every raised walk and fruit trees in the sunken beds, grass; neem in the town; none on the paths and terraces. */
function planting(x, z, p) {
  if (Math.hypot(x, z) > RADIUS - 6) return null;
  // the Yamuna's banks east and west of the terrace: tamarisk in the sand, date palms on the rise
  if (z < RIVER_Z + 6) return Math.abs(x) > 158 && z > RIVER_Z - 8 && Math.hypot(x, z) < RADIUS - 24 ? { tamarisk: 0.3, date_palm: 0.05, grass: 6 } : null;
  if (inRect(GARDEN, x, z)) {
    // the sixteen sunken beds of each quarter: cypresses (death) in a line along the edge of every raised walk, fruit
    // trees (life) in the beds behind them, grass and flowers; nothing on the walks, the channels or the terrace's foot
    const ax = Math.abs(x), az = Math.abs(z), d = walkDist(x, z);
    if (LODGES.some((l) => inRect(l.rect, x, z, 1.6))) return null;
    if (ax < 12 || az < 12 || inRect([-150, -148, 150, -138], x, z) || d < 0.3) return null;
    // (thinner within the axes' view, where the near-black crowns closed the Taj off: a cypress every ~12 m, flowering shrubs between)
    if (d < 1.6) return ax < 60 ? { cypress: 6, oleander: 0.45, grass: 40 } : { cypress: 14, grass: 40 };
    // fruit trees of the beds (mango, lemon, pomegranate, plantain by the sources; carob stands for the dark mango, jujube
    // and fig for the lemon and the pomegranate), flowering shrubs and grass between; none within the reach of the axes' view
    if (d > 4) return { carob: 0.22, jujube: 0.2, fig: 0.1, oleander: 0.45, grass: 45 };
    return { oleander: 0.25, grass: 45 };
  }
  if (inHouse(x, z, 0.6) || onStreet(x, z, 1.5) || inRect([-172, -262, 172, 232], x, z, 2) || inRect(HAVELI_OPEN, x, z, 1) || inRect(WORKSHOP.rect, x, z, 1) || KATRAS.some((k) => inRect(k.rect, x, z, 5))) return null;
  return { neem: 0.09, banyan: 0.014, carob: 0.02, date_palm: 0.015, grass: 15 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { cypress: 14, carob: 0.22, jujube: 0.2, fig: 0.1, oleander: 0.45, neem: 0.09, banyan: 0.014, tamarisk: 0.3, date_palm: 0.05 },
  climate: {
    sun: { az: 160, el: 40, color: [1.0, 0.93, 0.82], intensity: 3.1, lat: 27, dec: -15, hour: 10.5 },
    sky: { turbidity: 5, rayleigh: 1.2, mie: 0.007, mieG: 0.82, zenith: [0.13, 0.19, 0.32], horizon: [0.64, 0.62, 0.58] },
    fog: { color: [0.76, 0.74, 0.7], density: 0.0007, height: 0.012 },
    exposure: 0.5,
    wind: [0.3, 0.1],
    weather: [
      { id: 'hazy', weight: 3, clouds: 0.2, cloudDensity: 0.35, sun: 0.9, fog: 1.4 },
      { id: 'clear', weight: 2, clouds: 0.1, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'winter-mist', weight: 1.2, clouds: 0.3, cloudDensity: 0.4, sun: 0.6, fog: 4, fogColor: [0.82, 0.8, 0.77] },
    ],
  },
};
