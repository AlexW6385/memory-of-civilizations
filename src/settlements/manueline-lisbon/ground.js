// Manueline Lisbon — the ground (docs/settlements/manueline-lisbon.md §9): the pale limestone and red earth of the hills, the
// paved plaza and quay, the beach of Belém, the mud and sand of the Tagus shore; stone pines, cypresses and olives on the hill,
// figs and vines in the yards; the bright Atlantic light, salt and damp on the stone.
import { RADIUS, SEA, CLOISTER, MONASTERY, PLAZA, PALACE, TERREIRO, YARD, SE, CASTLE, SQUARE, HILL, height, wet, inWater, inRect, inLot, onStreet } from './layout.js';

const BUILT = [MONASTERY, PALACE, YARD, SE, CASTLE, [-262, 41, -120, 128]];
function cover(x, z, h, ny) {
  const c = { sand: 0.1, grass: 0.12, rock: 0.15, soil: 0.4, fields: 0, dry: 0.7, warmth: 0.75, red: 0.35, road: 0, snow: 0, forest: 0 };
  const w = wet(x, z);
  if (h < 0) { c.sand = 0.35; c.soil = 0.5; c.rock = 0.05; return c; }
  if (inRect(CLOISTER, x, z, -7)) { c.road = 0.05; c.grass = 0.7; c.sand = 0.1; c.red = 0.1; return c; }
  if (inRect(TERREIRO, x, z) || inRect(PLAZA, x, z) || inRect(SQUARE, x, z) || inRect(YARD, x, z) || inRect(PALACE, x, z) || inRect(MONASTERY, x, z)) { c.road = 0.9; c.rock = 0.1; c.red = 0; return c; }
  if (onStreet(x, z)) { c.road = 0.8; c.rock = 0.15; c.red = 0.1; return c; }
  if (w < 14 && x < -100) { c.sand = 0.85; c.grass = 0; c.rock = 0.1; c.soil = 0.1; c.dry = 0.9; return c; }
  if (w < 5) { c.sand = 0.5; c.rock = 0.3; return c; }
  if (ny < 0.8) { c.rock = 0.75; return c; }
  if (inLot(x, z, 2)) { c.road = 0.55; return c; }
  return c;
}
const water = (x, z, y) => inWater(x, z) && y < SEA + 0.3;
const waterLevel = (x, z) => (inWater(x, z) ? SEA : -Infinity);
const fromWater = (x, z) => Math.max(-5, Math.min(40, height(x, z) - SEA));
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 70 || inWater(x, z) || wet(x, z) < 2 || inLot(x, z, 1.5) || onStreet(x, z, 1.5)) return null;
  if (inRect(CLOISTER, x, z, 8)) return inRect(CLOISTER, x, z, -8) && Math.abs(x - (CLOISTER[0] + CLOISTER[2]) / 2) > 4 && Math.abs(z - (CLOISTER[1] + CLOISTER[3]) / 2) > 4 ? { grass: 2 } : null;
  if (BUILT.some((r) => inRect(r, x, z, 3)) || inRect(TERREIRO, x, z, 3)) return null;
  if (wet(x, z) < 5 && x < -100) return { reeds: 0.25, tamarisk: 0.01, grass_dry: 1 };
  if (wet(x, z) < 14 && x < -100) return { grass_dry: 1.5, tamarisk: 0.005 };
  if (Math.hypot(x - HILL.c[0], z - HILL.c[1]) < HILL.R * 0.9 && z < -40) return { stone_pine: 0.02, cypress: 0.03, olive: 0.04, carob: 0.02, holm_oak: 0.012, fig: 0.02, grass_dry: 3 };
  return { fig: 0.03, olive: 0.04, stone_pine: 0.02, holm_oak: 0.012, carob: 0.015, cypress: 0.01, grass_dry: 3 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater, rim: -10,
  sea: SEA,
  maxDensity: { fig: 0.05, olive: 0.06, stone_pine: 0.05, cypress: 0.05, carob: 0.04, holm_oak: 0.03, reeds: 0.4, tamarisk: 0.03 },
  climate: {
    sun: { az: 160, el: 54, color: [1.0, 0.95, 0.86], intensity: 3.5, lat: 38.7, dec: 14, hour: 10 },
    sky: { turbidity: 3.2, rayleigh: 1.0, mie: 0.006, mieG: 0.8, zenith: [0.1, 0.2, 0.42], horizon: [0.68, 0.72, 0.76] },
    fog: { color: [0.8, 0.83, 0.85], density: 0.0004, height: 0.012 },
    exposure: 0.47,
    wind: [0.5, 0.3],
    waterline: SEA,
    damp: 0.55,
    weather: [
      { id: 'clear', weight: 5, clouds: 0.1, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'hazy', weight: 2, clouds: 0.3, cloudDensity: 0.4, sun: 0.9, fog: 1.6 },
      { id: 'cloud', weight: 2, clouds: 0.55, cloudDensity: 0.5, sun: 0.75, fog: 1.2 },
      { id: 'rain', weight: 1, clouds: 0.9, cloudDensity: 0.7, sun: 0.45, fog: 1.8, rain: 0.5 },
    ],
  },
};
