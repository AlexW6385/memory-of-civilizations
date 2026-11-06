// Edfu — the ground: the dusty town mound, the temple's stone pavements, date palms and doum palms
// by the river, green fields of the floodplain to the south and east, the Nile, the desert's edge;
// the hard light of Upper Egypt.

import { RADIUS, ENCLOSURE, LAKE, MAMMISI, NILE, QUAY, height, inNile, inRect, inLot } from './layout.js';

function cover(x, z, h) {
  const c = { sand: 0.5, grass: 0.05, rock: 0, soil: 0.45, fields: 0, dry: 0.9, warmth: 0.9, red: 0.25, road: 0, snow: 0, forest: 0 };
  if (inRect(ENCLOSURE, x, z) || inRect(MAMMISI, x, z, 3)) { c.road = 0.6; c.sand = 0.4; return c; }
  if (h < -1 && !inRect(LAKE, x, z)) { c.soil = 0.8; c.grass = 0.2; return c; }
  if (z > 160 || x > 200) { c.fields = 0.85; c.grass = 0.15; c.dry = 0.3; return c; }
  return c;
}
function water(x, z, y) { return (inNile(x, z) && y < NILE.level + 0.3) || (inRect(LAKE, x, z, -2) && y < -1.2); }
function waterLevel(x, z) { return inNile(x, z) ? NILE.level : inRect(LAKE, x, z, -2) ? -1.5 : -Infinity; }
function fromWater(x, z) { return inNile(x, z) ? -3 : Math.max(-5, Math.min(40, height(x, z) - NILE.level)); }
function planting(x, z, p) {
  if (Math.hypot(x, z) > RADIUS - 6 || inNile(x, z) || inRect(ENCLOSURE, x, z, 4) || inRect(MAMMISI, x, z, 5) || inRect(LAKE, x, z, 3) || inLot(x, z, 1) || inRect(QUAY.rect, x, z, 3) || (inRect(QUAY.rect, x, z, 14) && x < QUAY.rect[0])) return null;
  if (height(x, z) < -1) return { papyrus: 6, reeds: 10, date_palm: 0.05 };
  if (z > 160 || x > 200) return { date_palm: 0.06, grass: 10 };
  if (x < -180) return { date_palm: 0.3, doum_palm: 0.06, grass: 8 };
  return { date_palm: 0.03 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { date_palm: 0.3, doum_palm: 0.06 },
  climate: {
    sun: { az: 140, el: 60, color: [1.0, 0.95, 0.85], intensity: 3.7, lat: 25, dec: 10, hour: 10 },
    sky: { turbidity: 3.4, rayleigh: 1.1, mie: 0.006, mieG: 0.8, zenith: [0.09, 0.16, 0.38], horizon: [0.68, 0.66, 0.62] },
    fog: { color: [0.8, 0.77, 0.72], density: 0.0003, height: 0.01 },
    exposure: 0.47,
    wind: [0.6, 0.2],
    weather: [
      { id: 'clear', weight: 6, clouds: 0.05, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'dusty', weight: 1, clouds: 0.1, cloudDensity: 0.3, sun: 0.85, fog: 1.8 },
    ],
  },
};
