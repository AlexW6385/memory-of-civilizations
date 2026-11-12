// Jerusalem — the ground: the paved esplanade with its trees, the pale limestone hills, terraced
// olive groves on the slopes of the Kidron, cypresses in the city; the dry, bright air of the hills.

import { PLATFORM, WALKS, haramFurnish } from './haram-detail.js';
import { RADIUS, HARAM, SEPULCHRE, CARDO, CARDO_HALF, STREET, WALL, height, inRect, inLot, gardenAt } from './layout.js';

function cover(x, z, h, ny) {
  const c = { sand: 0.2, grass: 0.25, rock: 0, soil: 0.55, fields: 0, dry: 0.75, warmth: 0.7, red: 0.3, road: 0, snow: 0, forest: 0 };
  if (inRect(HARAM.rect, x, z)) { c.road = 0.8; return c; }
  if (ny < 0.85) { c.rock = 0.6; c.soil = 0.4; return c; }
  if (Math.abs(z) < 5 || (Math.abs(z) < STREET.half - 1 && x > STREET.x0 && x < STREET.x1) || Math.abs(x - CARDO.x) < CARDO_HALF) { c.road = 0.8; return c; }
  const g = gardenAt(x, z, 0.3);
  if (g) { c.road = 0; c.soil = 0.5; c.grass = g.kind === 'orchard' ? 0.5 : 0.2; c.dry = 0.5; return c; }
  if (Math.hypot(x, z) < WALL.r - 3 && x < WALL.east && !inLot(x, z, 0.2)) c.road = 0.7;   // the lanes between the houses are paved
  return c;
}
const water = () => false, waterLevel = () => -Infinity, fromWater = () => 1e4;
haramFurnish();       // (fills WALKS)
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inLot(x, z, 1) || inRect(SEPULCHRE, x, z, 4) || Math.abs(z) < 6 || Math.abs(x - CARDO.x) < CARDO_HALF + 1) return null;
  if (inRect(HARAM.rect, x, z, 2)) return inRect(PLATFORM, x, z, 9) || inRect([-50, 92, 50, 200], x, z) || WALKS.some((r) => inRect(r, x, z, 2)) ? null : { cypress: 0.02, olive: 0.014 };
  { const g = gardenAt(x, z, -0.9); if (g) return g.kind === 'orchard' ? { fig: 1.6, olive: 1.0, date_palm: 0.25, grass: 16 } : g.kind === 'terrace' ? { olive: 1.4, grass_dry: 12 } : null; }
  if (gardenAt(x, z, 0.3) || (Math.hypot(x, z) < WALL.r && x < WALL.east)) return null;     // inside the walls: the lanes and the gardens' walls stay clear
  if (x > 150) return { olive: 0.18, grass_dry: 10 };
  return { olive: 0.03, cypress: 0.02, grass_dry: 8 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { olive: 1.4, cypress: 0.02, fig: 1.6, date_palm: 0.25 },
  climate: {
    sun: { az: 140, el: 55, color: [1.0, 0.96, 0.88], intensity: 3.6, lat: 32, dec: 10, hour: 10 },
    sky: { turbidity: 2.6, rayleigh: 1.0, mie: 0.004, mieG: 0.78, zenith: [0.07, 0.15, 0.42], horizon: [0.62, 0.66, 0.7] },
    fog: { color: [0.8, 0.8, 0.8], density: 0.00028, height: 0.01 },
    exposure: 0.48,
    wind: [0.5, 0.2],
    weather: [
      { id: 'clear', weight: 5, clouds: 0.12, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'cloud', weight: 1.5, clouds: 0.45, cloudDensity: 0.5, sun: 0.85, fog: 1.1 },
    ],
  },
};
