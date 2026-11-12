// Nan Madol — the ground: the lagoon's silty floor between the islets, the islets' flat tops of coral gravel (packed bare on the
// paths and in the courts, grass and shade trees between the houses), the mud flat with its mangroves and the low shore of Temwen
// island to the north-west, the reef flat beyond the sea wall; the hot, wet equatorial sky (docs/settlements/nan-madol.md §8–§9).

import { RADIUS, WATER, RIM, height, inland, isletAt, ISLET, village, cooks, inRect, onFord, NAN, FORECOURT } from './layout.js';

const HOUSES = () => village().houses;
function cover(x, z, h) {
  const c = { sand: 0.5, grass: 0.15, rock: 0, soil: 0.2, fields: 0, dry: 0.1, warmth: 0.75, red: 0.05, road: 0, snow: 0, forest: 0 };
  const q = inland(x, z);
  if (h < -1.3) { c.sand = 0.8; c.soil = 0.1; c.grass = 0; return c; }                      // the lagoon's floor
  if (q > -22 && !isletAt(x, z, 1)) {
    if (q < 2) { c.soil = 0.7; c.sand = 0.2; c.grass = 0; return c; }                      // the mud flat
    c.grass = 0.85; c.forest = 0.25; c.soil = 0.35; c.sand = 0.05; return c;               // the shore's low land
  }
  if (inRect(NAN, x, z, 1)) { c.road = 0.55; c.sand = 0.5; c.grass = 0.02; return c; }       // Nandauwas: raked coral gravel
  if (onFord(x, z, 0.2)) { c.road = 0.4; c.sand = 0.4; c.grass = 0; return c; }
  const s = isletAt(x, z, 0.6);
  if (s) {
    // the paths between the houses: trodden coral earth
    const [x0, z0, x1, z1] = s.rect, alongX = x1 - x0 >= z1 - z0, pc = alongX ? (z0 + z1) / 2 : (x0 + x1) / 2;
    if (Math.abs((alongX ? z : x) - pc) < 1.8) { c.road = 0.5; c.grass = 0.03; c.sand = 0.5; return c; }
    if (s.id === 's1' && inRect(FORECOURT.way, x, z)) { c.road = 0.6; c.grass = 0.02; c.sand = 0.55; return c; }       // the processional way, packed coral gravel
    c.grass = s.kind === 'seawall' ? 0.05 : 0.45; c.soil = 0.35; c.sand = 0.35;
  }
  return c;
}
const water = (x, z, y) => y < WATER + 0.3 && height(x, z) < WATER + 0.05;
const waterLevel = (x, z) => (height(x, z) < WATER ? WATER : -Infinity);
const fromWater = (x, z) => Math.max(-5, Math.min(40, height(x, z) - WATER));
let HC = null;
const houseCircles = () => HC ?? (HC = [...HOUSES().map((h) => [h.c[0], h.c[1], Math.hypot(h.w, h.l) / 2 + 1.6]), ...cooks().map((k) => [k.c[0], k.c[1], 3.2])]);
/** Plants per 100 m²: coconut palms, breadfruit (the fig stands in) and grass between the houses and along the shore; none in the courts, the paths or on the causeways. */
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 6 || height(x, z) < WATER + 0.25) return null;
  const q = inland(x, z);
  if (q > -3 && !isletAt(x, z, 4)) return q > 4 ? { date_palm: 0.55, fig: 0.4, grass: 25 } : { grass: 12 };
  const s = isletAt(x, z, -1.4);
  if (!s || s.kind === 'landmark' || onFord(x, z, 3)) return null;
  const [x0, z0, x1, z1] = s.rect, alongX = x1 - x0 >= z1 - z0, pc = alongX ? (z0 + z1) / 2 : (x0 + x1) / 2;
  if (Math.abs((alongX ? z : x) - pc) < 2.2) return null;
  if (houseCircles().some(([hx, hz, hr]) => Math.hypot(hx - x, hz - z) < hr)) return null;
  if (s.kind === 'landing' && Math.abs(x + 10) < 10) return null;                         // the landing's view
  if (s.id === 's1' && inRect(FORECOURT.clear, x, z)) return { grass: 6 };                // the arrival's view: no crowns between the crossroads and the wall
  if (s.kind === 'seawall') return { grass: 8 };
  return { date_palm: 0.5, fig: 0.35, grass: 14 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater, rim: RIM,
  sea: WATER,
  maxDensity: { date_palm: 0.55, fig: 0.4 },
  climate: {
    sun: { az: 0, el: 64, color: [1.0, 0.96, 0.88], intensity: 3.5, lat: 7, dec: 8, hour: 10 },
    sky: { turbidity: 3.6, rayleigh: 1.1, mie: 0.007, mieG: 0.78, zenith: [0.08, 0.16, 0.4], horizon: [0.66, 0.7, 0.75] },
    fog: { color: [0.78, 0.82, 0.85], density: 0.00045, height: 0.012 },
    exposure: 0.48,
    wind: [0.7, 0.3],
    damp: 0.92,      // among the wettest places on Earth: rain streaks and moss on the basalt, green at the waterline
    waterline: WATER,
    weather: [
      { id: 'trade', weight: 3, clouds: 0.4, cloudDensity: 0.5, sun: 1.0, fog: 1 },
      { id: 'squall', weight: 2, clouds: 0.9, cloudDensity: 0.85, sun: 0.4, fog: 1.6, rain: 0.85 },
    ],
  },
};
void ISLET;
