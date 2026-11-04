// Sailendra Java — the ground: the Kedu plain gently rolling, level round the monument; grass on
// the monument's ground, fields between the hamlets; palms, bamboo, banyan and teak in the groves;
// the tropical sky of central Java.

import { RADIUS, MONASTERY, inRect, inHouse, nearHamlet, smooth as sm } from './layout.js';

function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  const roll = 1.6 * Math.sin(x * 0.013 + 1) * Math.cos(z * 0.011) + 0.8 * Math.sin((x + z) * 0.021);
  return roll * sm(110, 170, r) * (1 - sm(RADIUS - 40, RADIUS, r));
}
function cover(x, z) {
  const r = Math.hypot(x, z);
  const c = { sand: 0, grass: 0.6, rock: 0, soil: 0.3, fields: 0, dry: 0.05, warmth: 0.55, red: 0.15, road: 0, snow: 0, forest: 0 };
  if (r < 95) { c.grass = 0.75; c.soil = 0.25; return c; }
  if (nearHamlet(x, z) || inRect(MONASTERY, x, z, 4)) { c.soil = 0.6; c.grass = 0.4; return c; }
  c.fields = 0.75; c.grass = 0.25; return c;
}
function water() { return false; }
function waterLevel() { return -Infinity; }
function fromWater() { return 1e4; }
/** Plants per 100 m²: groves round the hamlets (palms, bamboo, banyan, teak), a few trees by the monastery, scattered palms in the fields, nothing on the monument's ground. */
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 6 || r < 100) return r < 100 && r > 75 ? { grass: 30 } : null;
  if (inHouse(x, z, 1.5) || inRect(MONASTERY, x, z, 1)) return null;
  if (nearHamlet(x, z)) return { date_palm: 1.0, bamboo: 0.8, banyan: 0.08, teak: 0.25, grass: 25 };
  if (inRect(MONASTERY, x, z, 14)) return { banyan: 0.3, teak: 0.4 };
  return hash2(x * 0.05, z * 0.05) < 0.3 ? { date_palm: 0.12, grass: 15 } : { grass: 12 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { date_palm: 1.0, bamboo: 0.8, banyan: 0.3, teak: 0.4 },
  climate: {
    sun: { az: 20, el: 50, color: [1.0, 0.95, 0.88], intensity: 3.2, lat: -8, dec: 10, hour: 9.5 },
    sky: { turbidity: 4.2, rayleigh: 1.2, mie: 0.006, mieG: 0.82, zenith: [0.11, 0.19, 0.35], horizon: [0.66, 0.69, 0.72] },
    fog: { color: [0.77, 0.79, 0.8], density: 0.0007, height: 0.014 },
    exposure: 0.5,
    wind: [0.2, 0.1],
    weather: [
      { id: 'morning-mist', weight: 2, clouds: 0.3, cloudDensity: 0.4, sun: 0.7, fog: 3.2, fogColor: [0.8, 0.82, 0.82] },
      { id: 'bright', weight: 3, clouds: 0.35, cloudDensity: 0.45, sun: 1.0, fog: 1 },
      { id: 'shower', weight: 1.2, clouds: 0.9, cloudDensity: 0.8, sun: 0.35, fog: 2, rain: 0.6 },
    ],
  },
};
