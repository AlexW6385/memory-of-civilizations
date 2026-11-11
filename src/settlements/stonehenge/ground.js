// Stonehenge — the ground: the open chalk down of Salisbury Plain, short sheep-cropped grass, white
// chalk in the fresh ditch and banks and on the barrows, a few hawthorns and patches of woodland
// far off; the wide, changeable sky.

import { RADIUS, DITCH, VILLAGE, HEEL, DURR, height, houses, avenue, durr } from './layout.js';

function cover(x, z, h, ny) {
  const c = { sand: 0, grass: 0.85, rock: 0, soil: 0.15, fields: 0, dry: 0.25, warmth: 0.35, red: 0, road: 0, snow: 0, forest: 0 };
  const r = Math.hypot(x, z);
  if (Math.abs(r - DITCH.r) < 5 || ny < 0.85) { c.sand = 0.6; c.grass = 0.4; return c; }            // white chalk
  const [s, t] = avenue(x, z);
  if ((s > DITCH.r && s < RADIUS - 40 && Math.abs(Math.abs(t) - 9.6) < 1.1) || Math.abs(Math.hypot(s - HEEL.d, t) - HEEL.ditch) < 0.7) { c.sand = 0.5; c.grass = 0.5; return c; }   // chalk in the fresh ditches
  if (r < 20) { c.soil = 0.5; c.grass = 0.5; return c; }
  if (s > 16 && s < RADIUS - 40 && Math.abs(t) < 2.4 + 0.6 * Math.sin(s * 0.21)) { c.sand = 0.32 + 0.1 * Math.sin(s * 0.7); c.soil = 0.25; c.grass = 0.4; return c; }   // the track up the Avenue, trodden to the chalk
  // the Durrington avenue: rammed flint over chalk, trodden bare; inside the timber circle the turf worn
  const [ds, dt] = durr(x, z), dc = Math.hypot(x - DURR.c[0], z - DURR.c[1]);
  if (ds > DURR.r - 1 && ds < DURR.r + DURR.len + 30 && Math.abs(dt) < DURR.w / 2) { c.grass = 0.08; c.soil = 0.2; c.road = 0.7; c.rock = 0.35; c.sand = 0.25; return c; }
  if (ds > DURR.r && Math.abs(Math.abs(dt) - DURR.w / 2 - 0.5) < 0.8) { c.sand = 0.5; c.grass = 0.5; return c; }   // chalk in the gullies
  if (dc < DURR.r + 2) { c.soil = 0.45; c.grass = 0.55; return c; }
  if (Math.hypot(x - VILLAGE.c[0], z - VILLAGE.c[1]) < VILLAGE.r + 8) for (const h of houses()) if (Math.hypot(h.c[0] - x, h.c[1] - z) < h.s * 0.5 + 2.6) { c.soil = 0.5; c.sand = 0.25; c.grass = 0.3; return c; }   // the ground about each door, trodden bare
  return c;
}
const water = () => false, waterLevel = () => -Infinity, fromWater = () => 1e4;
const nearDurr = (x, z) => { const [ds, dt] = durr(x, z); return Math.hypot(x - DURR.c[0], z - DURR.c[1]) < DURR.r + 3 || (ds > DURR.r && Math.abs(dt) < DURR.w / 2 + 4); };
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 6 || r < DITCH.r + 4 || houses().some((h) => Math.hypot(h.c[0] - x, h.c[1] - z) < 5) || nearDurr(x, z)) return r < DITCH.r - 6 && r > 20 ? { grass: 40 } : null;
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
    damp: 0.6,      // the Atlantic down: rain streaks on the stones, green on the north foot of the chalk walls
    wind: [0.9, 0.3],
    weather: [
      { id: 'changeable', weight: 3, clouds: 0.55, cloudDensity: 0.6, sun: 0.85, fog: 1.1 },
      { id: 'clear', weight: 1.5, clouds: 0.2, cloudDensity: 0.35, sun: 1.0, fog: 1 },
      { id: 'rain', weight: 1.2, clouds: 0.95, cloudDensity: 0.9, sun: 0.35, fog: 1.8, rain: 0.8 },
    ],
  },
};
void VILLAGE;
