// Abu Simbel — the ground: the bare sandstone plateau at the temple terrace's level (the cliff and the rock-cut temples are built, not heightfield),
// the terrace, the bank falling 8.4 m to the Nile, the river (a reach of the Nile, calm, 130 m across here), the bed rising to the shore
// at the settlement's east edge; the halls' floors cut below the plateau (so that the terrain does not meet the floor); palms, tamarisk and
// papyrus along the water, nothing on the desert; the clear, hot sky of Nubia (lat 22°). Pure (used by the relief, the collision and the plant workers).

import { RADIUS, WATER, BANK_X, BED_X, TERRACE, GATE, PRIESTS, CAMP, MARKET, FIELDS, FX, FXS, ZS, inRect, lanes, smooth as sm } from './layout.js';

const YARD = [-36, 141, 10, 170];

function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
/** How far inside a rectangle (negative outside). */
const into = (r, x, z) => Math.min(x - r[0], r[2] - x, z - r[1], r[3] - z);
// the halls cut below the plateau's surface where the rooms lie (the floors are built slabs; the terrain must pass below them)
const DIPS = [[-112, -17, FX + 0.2, 17], [FXS - 28, ZS - 11, FXS + 0.2, ZS + 11]];
function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  let h = 0;
  if (x > BANK_X) h = (WATER - 0.4) * sm(BANK_X, BED_X, x) - 1.4 * sm(BED_X, 105, x);        // the bank, then the bed
  for (const D of DIPS) { const d = Math.min(into(D, x, z) , 99); if (d > 0) h = Math.min(h, -3 * sm(0, 2.4, d)); }
  return h * (1 - sm(RADIUS - 40, RADIUS, r));
}
function cover(x, z, h, ny) {
  const c = { sand: 0.75, grass: 0, rock: 0.25, soil: 0, fields: 0, dry: 1, warmth: 1, red: 0.35, road: 0, snow: 0, forest: 0 };
  if (inRect(TERRACE, x, z)) { c.road = 1; c.sand = 0.25; c.rock = 0.7; return c; }
  if (FIELDS.some((f) => inRect(f, x, z, 1)) && h > WATER + 3) { c.fields = 1; c.soil = 0.5; c.sand = 0.1; c.dry = 0.15; c.rock = 0; c.warmth = 0.9; return c; }
  if (inRect(MARKET, x, z) || LANE_RECTS.some((r) => inRect(r, x, z))) { c.road = 0.7; c.soil = 0.5; c.sand = 0.4; c.rock = 0; return c; }
  if (inRect(YARD, x, z, 2)) { c.sand = 0.7; c.rock = 0.3; c.road = 0.2; return c; }
  if (x > BANK_X - 2 && x < BED_X + 10) {
    if (h < WATER + 0.6) { c.soil = 0.8; c.sand = 0.1; c.dry = 0.3; c.rock = 0; return c; }
    c.soil = 0.35 * sm(BANK_X, 50, x); c.sand = 0.65 - c.soil; c.rock = 0.1; return c;
  }
  if (x > BED_X + 10) { c.soil = 0.9; c.sand = 0; c.rock = 0; c.dry = 0.2; return c; }
  if (inRect(CAMP, x, z, 8) || inRect(PRIESTS, x, z, 6)) { c.soil = 0.5; c.sand = 0.5; c.rock = 0.1; return c; }
  if (ny < 0.8) { c.rock = 0.8; c.sand = 0.2; return c; }
  c.sand = 0.6 + 0.3 * hash2(x * 0.05, z * 0.05); c.rock = 1 - c.sand; return c;
}
const LANE_RECTS = lanes().map((l) => l.r);
const water = (x, z, y) => x > 30 && y < WATER + 0.3;
const waterLevel = (x) => (x > 30 ? WATER : -Infinity);
const fromWater = (x) => (x > 54 ? -3 : Math.min(40, 54 - x));
/** Plants per 100 m²: nothing on the desert, the terrace or under the cliff; date and doum palms and tamarisk on the bank and about the camp; papyrus and reeds at the water. */
function planting(x, z, p) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 8 || x < -30 || inRect(TERRACE, x, z, 6) || Math.abs(z) < 7 && x > BANK_X - 4 && x < BED_X) return null;
  if (x > 46 && x < 64 && Math.abs(z) > 14) return { papyrus: 9, reeds: 10 };
  if (FIELDS.some((f) => inRect(f, x, z, -0.5)) && x % 4.5 < 3.0) return { wheat: 60 };      // emmer and barley in the basins between the ridges
  if (x > BANK_X && x < 46) return { date_palm: 0.5, doum_palm: 0.12, tamarisk: 0.5, halfa: 4, sycamore_fig: 0.08 };
  // nothing in the blocks of houses and lanes, the market, the masons' yard: the planting is a ring round them (palms in the yards' margins, tamarisk)
  if (inRect(CAMP, x, z, 1) || inRect(PRIESTS, x, z, 1) || inRect(YARD, x, z, 1)) return null;
  if (inRect(CAMP, x, z, 10) || inRect(PRIESTS, x, z, 8)) return hash2(x * 0.3, z * 0.3) < 0.35 ? { date_palm: 0.25, tamarisk: 0.3 } : null;
  if (x > -30 && x < BANK_X) return { tamarisk: 0.12, acacia: 0.03, halfa: 5 };
  void p; return null;
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { date_palm: 0.5, doum_palm: 0.12, tamarisk: 0.5, acacia: 0.03, sycamore_fig: 0.08, wheat: 60 },
  climate: {
    sun: { az: 140, el: 58, color: [1.0, 0.95, 0.85], intensity: 3.7, lat: 22.4, dec: 5, hour: 10.5 },
    sky: { turbidity: 3.0, rayleigh: 1.05, mie: 0.005, mieG: 0.82, zenith: [0.11, 0.2, 0.4], horizon: [0.66, 0.64, 0.58] },
    fog: { color: [0.82, 0.78, 0.7], density: 0.00025, height: 0.012 },
    exposure: 0.45,
    wind: [0.5, 0.1],
    weather: [
      { id: 'clear', weight: 5, clouds: 0.03, cloudDensity: 0.25, sun: 1.0, fog: 0.9 },
      { id: 'hazy', weight: 1.5, clouds: 0.08, cloudDensity: 0.3, sun: 0.9, fog: 1.6, fogColor: [0.85, 0.78, 0.66] },
      { id: 'khamsin', weight: 0.5, clouds: 0.2, cloudDensity: 0.4, sun: 0.65, fog: 4, fogColor: [0.82, 0.68, 0.5] },
    ],
  },
};
void GATE;
