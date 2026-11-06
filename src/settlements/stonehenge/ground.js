// Stonehenge — the ground: the open chalk down of Salisbury Plain, short sheep-cropped grass, white
// chalk in the fresh ditch and banks and on the barrows, a few hawthorns and patches of woodland
// far off; the wide, changeable sky.

import { RADIUS, DITCH, VILLAGE, HEEL, height, houses, avenue } from './layout.js';

function cover(x, z, h, ny) {
  const c = { sand: 0, grass: 0.85, rock: 0, soil: 0.15, fields: 0, dry: 0.25, warmth: 0.35, red: 0, road: 0, snow: 0, forest: 0 };
  const r = Math.hypot(x, z);
  if (Math.abs(r - DITCH.r) < 5 || ny < 0.85) { c.sand = 0.6; c.grass = 0.4; return c; }            // white chalk
  const [s, t] = avenue(x, z);
  if ((s > DITCH.r && s < RADIUS - 40 && Math.abs(Math.abs(t) - 9.6) < 1.1) || Math.abs(Math.hypot(s - HEEL.d, t) - HEEL.ditch) < 0.7) { c.sand = 0.5; c.grass = 0.5; return c; }   // chalk in the fresh ditches
  if (r < 20) { c.soil = 0.5; c.grass = 0.5; return c; }
  return c;
}
const water = () => false, waterLevel = () => -Infinity, fromWater = () => 1e4;
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 6 || r < DITCH.r + 4 || houses().some((h) => Math.hypot(h.c[0] - x, h.c[1] - z) < 5)) return r < DITCH.r - 6 && r > 20 ? { grass: 40 } : null;
  if (r > 280) return { oak: 0.03, maquis: 0.04, grass: 40 };
  return { grass: 45, maquis: 0.005 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { oak: 0.03, maquis: 0.04 },
  climate: {
    sun: { az: 140, el: 42, color: [1.0, 0.96, 0.9], intensity: 3.2, lat: 51, dec: 15, hour: 9.5 },
    sky: { turbidity: 2.8, rayleigh: 1.1, mie: 0.006, mieG: 0.78, zenith: [0.08, 0.15, 0.38], horizon: [0.64, 0.68, 0.74] },
    fog: { color: [0.76, 0.78, 0.82], density: 0.0004, height: 0.012 },
    exposure: 0.5,
    wind: [0.9, 0.3],
    weather: [
      { id: 'changeable', weight: 3, clouds: 0.55, cloudDensity: 0.6, sun: 0.85, fog: 1.1 },
      { id: 'clear', weight: 1.5, clouds: 0.2, cloudDensity: 0.35, sun: 1.0, fog: 1 },
      { id: 'rain', weight: 1.2, clouds: 0.95, cloudDensity: 0.9, sun: 0.35, fog: 1.8, rain: 0.8 },
    ],
  },
};
void VILLAGE;
