// Nara — the ground: the temple's white gravel courts, lawns cropped by deer, the grassy dome of
// Wakakusa, cedars and maples on the hills, the capital's earth streets; the soft light of Yamato.

import { RADIUS, TEMPLE, COURT, height, inRect, inLot, inStreet, inBlock, blocks, KOFUKU } from './layout.js';

const MKT = [9, 165, 75, 235];
function cover(x, z, h, ny) {
  const c = { sand: 0.1, grass: 0.7, rock: 0, soil: 0.2, fields: 0, dry: 0.15, warmth: 0.5, red: 0.05, road: 0, snow: 0, forest: 0 };
  if (inRect(COURT, x, z)) { c.sand = 0.8; c.grass = 0.2; return c; }
  if (Math.abs(x) < 6 && z > 40 && z < 160) { c.road = 0.8; return c; }
  if (inStreet(x, z)) { c.road = 0.8; c.grass = 0.05; return c; }
  if (inRect(KOFUKU.block, x, z)) { c.sand = 0.8; c.grass = 0.15; return c; }
  if (blocks().some((b) => b.kind === 'market' && inRect(b.rect, x, z))) { c.road = 0.6; c.soil = 0.5; c.grass = 0.05; return c; }
  if (inBlock(x, z)) { c.soil = 0.35; c.grass = 0.5; return c; }
  return c;
}
const water = () => false, waterLevel = () => -Infinity, fromWater = () => 1e4;
function planting(x, z) {
  // willows along the avenues' edges (the capital's streets were lined with them [inferred]), clear of the road's middle
  if (Math.hypot(x, z) < RADIUS - 8 && !inRect(TEMPLE, x, z, 4) && inStreet(x, z, 0.6) && !inStreet(x, z, -1.4) && !inRect(MKT, x, z, 3)) return { willow: 0.045, grass: 3 };
  if (Math.hypot(x, z) > RADIUS - 6 || inRect(COURT, x, z, 6) || inLot(x, z, 1) || inStreet(x, z, 2) || blocks().some((b) => b.kind !== 'ward' && inRect(b.rect, x, z, 4)) || (Math.abs(x) < 8 && z > 30 && z < 165)) return null;
  if (inBlock(x, z)) return { grass: 6, maple: 0.003, sugi: 0.001 };
  if (inRect(TEMPLE, x, z)) return { grass: 25, red_pine: 0.006 };
  if (height(x, z) > 25) return { grass: 30 };                       // Wakakusa's open grass
  if (height(x, z) > 4) return { sugi: 0.15, maple: 0.05, grass: 15 };
  return { red_pine: 0.01, grass: 20 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { sugi: 0.15, maple: 0.05, red_pine: 0.01, willow: 0.06 },
  climate: {
    sun: { az: 150, el: 45, color: [1.0, 0.96, 0.9], intensity: 3.3, lat: 35, dec: 5, hour: 10.5 },
    sky: { turbidity: 3.0, rayleigh: 1.1, mie: 0.006, mieG: 0.78, zenith: [0.08, 0.15, 0.38], horizon: [0.64, 0.68, 0.72] },
    fog: { color: [0.78, 0.8, 0.82], density: 0.0004, height: 0.012 },
    exposure: 0.5,
    damp: 0.65,     // the humid basin of Yamato: moss on the shaded foot of walls and on north roofs, rain streaks
    wind: [0.3, 0.2],
    weather: [
      { id: 'clear', weight: 3, clouds: 0.3, cloudDensity: 0.4, sun: 1.0, fog: 1 },
      { id: 'mist', weight: 1.2, clouds: 0.5, cloudDensity: 0.5, sun: 0.75, fog: 2.0 },
      { id: 'rain', weight: 1, clouds: 0.95, cloudDensity: 0.9, sun: 0.35, fog: 1.8, rain: 0.7 },
    ],
  },
};
