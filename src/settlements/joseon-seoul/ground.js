// Joseon Hanyang — the ground: the valley at Bugaksan's foot rising to the north, the palace's
// courts level, the pond and the stream; pines and willows in the palace, pines on the northern
// slopes, a few trees in the yards; Korea's clear autumn sky.

import { RADIUS, PALACE, POND, ISLAND, HYANG, HISLE, JONGNO, AVENUE, AMISAN, inRect, inPond, inHyang, inStream, inLot, amisan, smooth as sm } from './layout.js';
const WATER = -1.2, BED = -2.6;
function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  let h = Math.max(0, -z - 300) * 0.35;                       // Bugaksan's foot
  if (inRect(PALACE, x, z)) h = amisan(x, z);                 // Amisan's terraces behind the queen's hall
  if (inRect(HYANG, x, z)) { const d = Math.hypot(x - HISLE.c[0], z - HISLE.c[1]); h = BED * sm(0, 3, Math.min(x - HYANG[0], HYANG[2] - x, z - HYANG[1], HYANG[3] - z)); if (d < HISLE.r - 0.4) h = 0; else if (d < HISLE.r + 4) h = Math.min(h, -1.8); }
  if (inRect(ISLAND, x, z, 1.5)) h = -1.8;                   // under Gyeonghoeru's island block, below the water at its foot
  if (inPond(x, z)) h = BED * sm(0, 3, Math.min(x - POND[0], POND[2] - x, z - POND[1], POND[3] - z));
  if (inStream(x, z)) h = BED;
  return h * (1 - sm(RADIUS - 30, RADIUS, r));
}
const wet = (x, z) => inPond(x, z) || inHyang(x, z) || inStream(x, z);
function cover(x, z) {
  const c = { sand: 0.2, grass: 0.3, rock: 0, soil: 0.5, fields: 0, dry: 0.3, warmth: 0.45, red: 0, road: 0, snow: 0, forest: 0 };
  if (wet(x, z)) { c.soil = 0.5; c.rock = 0.5; return c; }
  // Amisan's terraces and the gardens round Hyangwonji: grass and garden soil
  if (inRect(PALACE, x, z) && ((Math.abs(x) < 60 && z < -202) || inRect(HYANG, x, z, 10))) { c.grass = 0.75; c.soil = 0.35; c.sand = 0.05; return c; }
  if (inRect(PALACE, x, z)) { c.sand = 0.6; c.soil = 0.4; c.road = 0.3; return c; }
  if (-z > 300) { c.forest = 0.6; c.grass = 0.4; return c; }
  if (inRect(JONGNO, x, z) || inRect(AVENUE, x, z)) { c.road = 0.85; c.soil = 0.7; c.grass = 0.05; return c; }
  c.road = inLot(x, z, 0.3) ? 0 : 0.45; return c;
}
function water(x, z, y) { return wet(x, z) && y < WATER + 0.3; }
function waterLevel(x, z) { return wet(x, z) ? WATER : -Infinity; }
function fromWater(x, z) { return wet(x, z) ? 0 : 40; }
/** Plants per 100 m²: pines and willows round the pond, flowering trees on Amisan, pines on the northern slopes, none in the courts. */
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 6 || wet(x, z)) return null;
  if (inRect(POND, x, z, 8) && !inRect(POND, x, z, 1)) return { willow: 1.2, red_pine: 0.4, grass: 20 };
  // Hyangwonji: pines and maples round the banks, grass on the island
  if (Math.hypot(x - HISLE.c[0], z - HISLE.c[1]) < HISLE.r - 1) return Math.hypot(x - HISLE.c[0], z - HISLE.c[1]) > 4.5 ? { grass: 35 } : null;
  if (inRect(HYANG, x, z, 9) && !inRect(HYANG, x, z, 1.5) && Math.abs(x - HISLE.c[0]) > 3) return { red_pine: 0.7, maple: 0.6, grass: 25 };
  if (inRect(PALACE, x, z) && Math.abs(x) < 60 && z < -202 && z > -290) {
    // Amisan: flowering trees and pines on the terraces, none against the walls or round the chimneys
    if (AMISAN.faces.some((f) => z < f + 1 && z > f - 3) || Math.abs(Math.abs(x) - AMISAN.hw) < 3 || (Math.abs(x) < 21 && z > -229)) return { grass: 30 };
    return { maple: 0.5, red_pine: 0.3, grass: 30 };
  }
  if (inRect(PALACE, x, z)) return inRect(PALACE, x, z, -6) ? null : { red_pine: 0.15 };
  if (-z > 300) return { red_pine: 0.9, maple: 0.2, grass: 20 };
  if (inLot(x, z, 0.5)) return null;
  return null;
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { willow: 1.2, red_pine: 0.9, maple: 0.8 },
  climate: {
    sun: { az: 165, el: 38, color: [1.0, 0.95, 0.87], intensity: 3.1, lat: 37.6, dec: -5, hour: 10.5 },
    sky: { turbidity: 2.8, rayleigh: 1.1, mie: 0.004, mieG: 0.8, zenith: [0.1, 0.18, 0.38], horizon: [0.63, 0.67, 0.72] },
    fog: { color: [0.76, 0.78, 0.8], density: 0.0004, height: 0.01 },
    exposure: 0.5,
    wind: [0.3, 0.2],
    weather: [
      { id: 'clear', weight: 3, clouds: 0.15, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'spring-haze', weight: 1.5, clouds: 0.3, cloudDensity: 0.4, sun: 0.8, fog: 2 },
      { id: 'drizzle', weight: 1, clouds: 0.9, cloudDensity: 0.75, sun: 0.35, fog: 2, rain: 0.5 },
    ],
  },
};
