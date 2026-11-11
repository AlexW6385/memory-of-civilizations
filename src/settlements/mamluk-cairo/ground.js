// Cairo — the ground: dust and paving in the lanes and the Rumayla square, the bare limestone of the
// Muqattam spur, date palms and sycamore figs in courtyards; the hazy, hot light of the Nile valley.

import { RADIUS, SQUARE, CITADEL, SUQ, QAA, BAYN, QALAWUN, NASIR, BARQUQ, KHAN, SUQ2, SUQ3, CROSS, HAMMAM, SHOP, STREETS, height, inRect, inLot, onRoad } from './layout.js';

const BUILT = [QALAWUN, NASIR, BARQUQ, KHAN, HAMMAM, SHOP];
const PAVED = [BAYN, SUQ2, SUQ3, CROSS, ...STREETS];

function cover(x, z, h, ny) {
  const c = { sand: 0.5, grass: 0.05, rock: 0, soil: 0.45, fields: 0, dry: 0.9, warmth: 0.9, red: 0.2, road: 0, snow: 0, forest: 0 };
  if (PAVED.some((r) => inRect(r, x, z))) { c.road = 0.8; return c; }
  if (inRect(SQUARE, x, z) || inRect([-90, -10, 90, 120], x, z) || inRect(SUQ, x, z, 1) || onRoad(x, z, 0.5)) { c.road = 0.8; return c; }
  if (h > 2) { c.rock = 0.8; c.sand = 0.2; return c; }
  return c;
}
const water = () => false, waterLevel = () => -Infinity, fromWater = () => 1e4;
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || BUILT.some((r) => inRect(r, x, z, 3)) || PAVED.some((r) => inRect(r, x, z, 2)) || inRect(SQUARE, x, z, 2) || inRect([-90, -10, 90, 120], x, z, 4) || inLot(x, z, 1) || inRect(SUQ, x, z, 2) || inRect(QAA, x, z, 1) || onRoad(x, z, 3) || Math.hypot(x - CITADEL.c[0], z - CITADEL.c[1]) < CITADEL.r + 42) return null;
  return { date_palm: 0.03, sycamore_fig: 0.01 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { date_palm: 0.03, sycamore_fig: 0.01 },
  climate: {
    sun: { az: 140, el: 58, color: [1.0, 0.95, 0.85], intensity: 3.7, lat: 30, dec: 10, hour: 10 },
    sky: { turbidity: 4.2, rayleigh: 1.2, mie: 0.007, mieG: 0.8, zenith: [0.1, 0.17, 0.36], horizon: [0.68, 0.66, 0.62] },
    fog: { color: [0.8, 0.77, 0.72], density: 0.00045, height: 0.01 },
    exposure: 0.47,
    damp: 0.04,      // the desert city: no moss or rain streaks (DESIGN §5); dust and sun-bleached limestone instead
    wind: [0.5, 0.2],
    weather: [
      { id: 'clear', weight: 5, clouds: 0.08, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'khamsin', weight: 1, clouds: 0.15, cloudDensity: 0.3, sun: 0.7, fog: 2.4 },
    ],
  },
};
