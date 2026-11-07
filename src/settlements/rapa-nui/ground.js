// Rapa Nui — the ground: grass over red-brown volcanic soil, the bare tuff of Rano Raraku, reeds
// (totora) in its crater lake, boulders of basalt, the dark rocky shore and the Pacific; few trees
// left — a palm or two by the lake, banana and sugar cane in the garden walls; trade-wind cloud.

import { RADIUS, SEA, RIM, RARAKU, PLAZA, AHU, ROAD_W, height, inLake, inSea, inRect, village, roadDist, fields } from './layout.js';

function cover(x, z, h, ny) {
  const c = { sand: 0, grass: 0.75, rock: 0, soil: 0.25, fields: 0, dry: 0.35, warmth: 0.55, red: 0.45, road: 0, snow: 0, forest: 0 };
  if (inRect(PLAZA, x, z)) { c.grass = 0.4; c.soil = 0.6; return c; }
  if (fields().some((r) => inRect(r, x, z))) { c.grass = 0.2; c.soil = 0.8; c.rock = 0.25; return c; }
  const rd = roadDist(x, z);
  if (rd < ROAD_W / 2 + 0.8) { const k = rd < ROAD_W / 2 - 0.4 ? 1 : 0.5; c.road = 0.7 * k; c.soil = 0.5; c.grass = 0.75 - 0.5 * k; return c; }
  if (h < 0.5 && !inLake(x, z)) { c.rock = 0.8; c.grass = 0.1; return c; }
  if (Math.hypot(x - RARAKU.c[0], z - RARAKU.c[1]) < RARAKU.r * 0.7 && ny < 0.9) { c.rock = 0.7; c.grass = 0.3; return c; }
  return c;
}
function water(x, z, y) { return (inSea(x, z) && y < SEA + 0.3) || (inLake(x, z) && y < RARAKU.lake + 0.3); }
function waterLevel(x, z) { return inSea(x, z) ? SEA : inLake(x, z) ? RARAKU.lake : -Infinity; }
function fromWater(x, z) { return inLake(x, z) ? -2 : Math.max(-5, Math.min(40, height(x, z) - SEA)); }
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inRect(PLAZA, x, z, 2) || inRect(AHU.rect, x, z, 16) || inSea(x, z) || height(x, z) < 0.5) return null;
  if (inLake(x, z)) return null;
  const v = village();
  if (v.houses.some((h) => Math.hypot(h.c[0] - x, h.c[1] - z) < h.len / 2 + 2) || v.moa.some((m) => Math.hypot(m.c[0] - x, m.c[1] - z) < 4)) return null;
  if (roadDist(x, z) < ROAD_W / 2 + 0.5) return null;
  if (fields().some((r) => inRect(r, x, z, 0.5))) return { grass: 6 };
  if (v.gardens.some((g) => Math.hypot(g.c[0] - x, g.c[1] - z) < g.r)) return { grass: 30 };
  if (Math.hypot(x - RARAKU.c[0], z - RARAKU.c[1]) < RARAKU.crater + 2) return { reeds: 30, grass: 20, date_palm: 0.02 };
  return { grass: 45, boulder: 0.08 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater, rim: RIM,
  maxDensity: { date_palm: 0.02, boulder: 0.08 },
  climate: {
    sun: { az: 20, el: 50, color: [1.0, 0.96, 0.9], intensity: 3.5, lat: -27, dec: 0, hour: 10.5 },
    sky: { turbidity: 2.2, rayleigh: 1.0, mie: 0.004, mieG: 0.78, zenith: [0.07, 0.15, 0.42], horizon: [0.62, 0.68, 0.76] },
    fog: { color: [0.76, 0.8, 0.86], density: 0.0003, height: 0.01 },
    exposure: 0.48,
    wind: [1.0, 0.4],
    weather: [
      { id: 'trade-cloud', weight: 4, clouds: 0.4, cloudDensity: 0.5, sun: 0.95, fog: 1 },
      { id: 'clear', weight: 2, clouds: 0.12, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'squall', weight: 1, clouds: 0.9, cloudDensity: 0.85, sun: 0.4, fog: 1.6, rain: 0.8 },
    ],
  },
};
