// Benin City — the ground (docs/settlements/benin-city.md §6): the red laterite earth of the forest belt, trodden bare on the streets, the
// square and the market, grass and oil palms between the compounds, the bank and ditch of the Iya, the forest beyond it (silk-cotton
// stand-ins, teak, bamboo); the hot, humid, hazy light of the wet season, damp and algae on the clay.

import { RADIUS, PALACE, SQUARE, MARKET, GUILD, height, depth, inRect, inLot, onStreet } from './layout.js';

function cover(x, z, h, ny) {
  const c = { sand: 0.05, grass: 0.3, rock: 0.05, soil: 0.45, fields: 0, dry: 0.3, warmth: 0.85, red: 0.7, road: 0, snow: 0, forest: 0 };
  const d = depth(x, z);
  if (d < 0) { c.forest = 0.55; c.grass = 0.45; c.red = 0.55; if (d > -26) { c.forest = 0.2; c.soil = 0.6; } return c; }
  if (inRect(PALACE, x, z) || inRect(SQUARE, x, z) || inRect(MARKET, x, z) || inRect(GUILD, x, z) || onStreet(x, z)) { c.road = 0.85; c.red = 0.9; c.grass = 0; c.soil = 0.4; return c; }
  if (d < 14) { c.grass = 0.55; c.soil = 0.4; return c; }
  if (inLot(x, z, 0.3)) { c.road = 0.7; c.red = 0.85; c.grass = 0; return c; }
  if (ny < 0.8) { c.rock = 0.3; c.grass = 0.2; }
  return c;
}
const water = () => false;
const waterLevel = () => -Infinity;
const fromWater = () => 40;
function planting(x, z) {
  const d = depth(x, z);
  if (Math.hypot(x, z) > RADIUS - 6) return null;
  if (d < -30) return { teak: 0.05, banyan: 0.012, date_palm: 0.02, bamboo: 0.012, grass: 14 };
  if (d < 14) return { grass: 8, maquis: 0.015 };
  if (inRect(PALACE, x, z, 2) || inLot(x, z, 1.5) || onStreet(x, z, 0.5) || inRect(GUILD, x, z, 1) || inRect(SQUARE, x, z, 0)) return null;
  if (inRect(MARKET, x, z)) return { banyan: 0.0015, grass: 0 };
  return { date_palm: 0.012, banyan: 0.002, grass: 6 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater, rim: 0,
  maxDensity: { teak: 0.05, banyan: 0.012, date_palm: 0.02, bamboo: 0.012, maquis: 0.015 },
  climate: {
    sun: { az: 170, el: 68, color: [1.0, 0.95, 0.86], intensity: 3.5, lat: 6, dec: 10, hour: 10 },
    sky: { turbidity: 4.2, rayleigh: 1.1, mie: 0.008, mieG: 0.78, zenith: [0.1, 0.19, 0.4], horizon: [0.66, 0.7, 0.72] },
    fog: { color: [0.78, 0.8, 0.78], density: 0.0006, height: 0.012 },
    exposure: 0.46,
    wind: [0.4, 0.2],
    damp: 0.9,
    weather: [
      { id: 'clear', weight: 3, clouds: 0.25, cloudDensity: 0.4, sun: 1.0, fog: 1 },
      { id: 'hazy', weight: 3, clouds: 0.45, cloudDensity: 0.5, sun: 0.85, fog: 1.4 },
      { id: 'rain', weight: 1, clouds: 0.9, cloudDensity: 0.85, sun: 0.4, fog: 1.8, rain: 0.8 },
    ],
  },
};
