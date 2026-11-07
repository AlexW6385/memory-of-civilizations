// Giza — the ground: the limestone plateau, level round the pyramids and the cemeteries, dropping
// east to the valley and the harbour and south to the workers' town; sand and bare rock; the river
// country's palms and fields by the harbour; the clear, hot sky of the desert.
// Pure (used by the relief, the collision and the plant workers).

import { RADIUS, HARBOUR, ENCLOSURE, TOWN, VALLEY, inRect, plateau, smooth as sm } from './layout.js';

function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
const inHarbour = (x, z) => inRect(HARBOUR, x, z);
function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  let h = plateau(x, z);
  if (inRect(HARBOUR, x, z, 1)) h = VALLEY - 2.5;
  return h * (1 - sm(RADIUS - 40, RADIUS, r));
}
function cover(x, z, h, ny) {
  const c = { sand: 0.75, grass: 0, rock: 0.25, soil: 0, fields: 0, dry: 1, warmth: 1, red: 0.3, road: 0, snow: 0, forest: 0 };
  if (inRect(ENCLOSURE, x, z)) { c.road = 1; c.sand = 0.3; c.rock = 0.7; return c; }
  if (ny < 0.8) { c.rock = 0.8; c.sand = 0.2; return c; }
  if (x > 330) { c.fields = 0.7; c.grass = 0.2; c.sand = 0.1; c.dry = 0.3; return c; }
  if (inRect(TOWN, x, z)) { c.soil = 0.6; c.sand = 0.4; return c; }
  c.sand = 0.6 + 0.3 * hash2(x * 0.05, z * 0.05); c.rock = 1 - c.sand; return c;
}
function water(x, z, y) { return inRect(HARBOUR, x, z, 1) && y < VALLEY - 1.2 + 0.3; }
function waterLevel(x, z) { return inRect(HARBOUR, x, z, 1) ? VALLEY - 1.2 : -Infinity; }
function fromWater(x, z) { return inRect(HARBOUR, x, z, -1) ? -3 : 30; }
/** Plants per 100 m²: nothing on the plateau; date palms and a sycamore fig by the harbour and in the valley. */
function planting(x, z, p) {
  if (Math.hypot(x, z) > RADIUS - 6 || inHarbour(x, z)) return null;
  // papyrus and reeds along the harbour's open edges (not the quay on its west side)
  if (inRect(HARBOUR, x, z, 5) && x > HARBOUR[0] + 7) return { papyrus: 10, reeds: 8 };
  if (x > 320) return { date_palm: 0.5, sycamore_fig: 0.03, halfa: 20 };
  if (inRect(TOWN, x, z, 10) && hash2(x * 0.2, z * 0.2) < 0.04) return { date_palm: 0.3 };
  return null;
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { date_palm: 0.5, sycamore_fig: 0.03 },
  climate: {
    sun: { az: 140, el: 55, color: [1.0, 0.95, 0.85], intensity: 3.6, lat: 30, dec: 5, hour: 10.5 },
    sky: { turbidity: 3.2, rayleigh: 1.05, mie: 0.005, mieG: 0.82, zenith: [0.12, 0.2, 0.38], horizon: [0.66, 0.64, 0.58] },
    fog: { color: [0.82, 0.78, 0.7], density: 0.0003, height: 0.012 },
    exposure: 0.45,
    wind: [0.5, 0.1],
    weather: [
      { id: 'clear', weight: 4, clouds: 0.05, cloudDensity: 0.25, sun: 1.0, fog: 0.9 },
      { id: 'hazy', weight: 1.5, clouds: 0.1, cloudDensity: 0.3, sun: 0.9, fog: 1.6, fogColor: [0.85, 0.78, 0.66] },
      { id: 'khamsin', weight: 0.6, clouds: 0.2, cloudDensity: 0.4, sun: 0.65, fog: 4, fogColor: [0.82, 0.68, 0.5] },
    ],
  },
};
