// Sanchi — the ground: the sandstone hill with dry grass and scrub, the summit's paved terraces,
// the red-brown plain with fields, neem, banyan and palms round the village; the hot, hazy sky
// of central India before the rains.

import { RADIUS, PATH, SUMMIT, STUPA2, height, out, inLot, inRect } from './layout.js';

function cover(x, z, h, ny) {
  const c = { sand: 0.2, grass: 0.3, rock: 0, soil: 0.5, fields: 0, dry: 0.75, warmth: 0.85, red: 0.5, road: 0, snow: 0, forest: 0 };
  if (out(x, z) === 0) { c.road = 0.5; c.grass = 0.3; return c; }
  if (inRect(STUPA2.terrace, x, z, 3) || (Math.abs(x - STUPA2.c[0]) < 2.5 && z < STUPA2.terrace[1] && z > -60)) { c.road = 0.6; c.grass = 0.25; return c; }
  if (ny < 0.8) { c.rock = 0.6; c.soil = 0.4; return c; }
  if (Math.abs(x - PATH.x) < PATH.w && z < -SUMMIT.half[1]) { c.road = 0.8; return c; }
  if (Math.hypot(x, z) > 230) { c.fields = 0.7; c.grass = 0.2; return c; }
  return c;
}
const water = () => false, waterLevel = () => -Infinity, fromWater = () => 1e4;
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inLot(x, z, 1) || inRect(STUPA2.terrace, x, z, 4) || (Math.abs(x - STUPA2.c[0]) < 3.5 && z < STUPA2.terrace[1] && z > -62) || (Math.abs(x - PATH.x) < PATH.w + 1 && z < -SUMMIT.half[1] + 5)) return null;
  const d = out(x, z);
  if (d === 0) return null;
  if (d < 30) return { grass_dry: 10, maquis: 0.08 };
  if (inLot(x, z, 14)) return { neem: 0.08, date_palm: 0.05, banyan: 0.01, grass_dry: 8 };
  return { neem: 0.01, grass: 12 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { neem: 0.08, date_palm: 0.05, banyan: 0.01, maquis: 0.08 },
  climate: {
    sun: { az: 130, el: 60, color: [1.0, 0.95, 0.85], intensity: 3.5, lat: 23, dec: 10, hour: 10 },
    sky: { turbidity: 4.5, rayleigh: 1.3, mie: 0.006, mieG: 0.8, zenith: [0.1, 0.17, 0.36], horizon: [0.64, 0.62, 0.58] },
    fog: { color: [0.78, 0.76, 0.72], density: 0.0005, height: 0.012 },
    exposure: 0.5,
    wind: [0.3, 0.2],
    weather: [
      { id: 'hazy', weight: 4, clouds: 0.2, cloudDensity: 0.4, sun: 0.95, fog: 1.3 },
      { id: 'pre-monsoon', weight: 1.5, clouds: 0.6, cloudDensity: 0.7, sun: 0.8, fog: 1.2 },
    ],
  },
};
