// Cahokia — the ground: the grassed slopes of the mounds, the plaza's packed clay, the courtyards
// and paths of bare earth, fields of maize, squash and sunflower beyond the town, the creek's
// willows and the bottomland woods; the hot, humid light of an American Bottom summer.
import { RADIUS, PLAZA, CREEK, height, inCreek, inRect, inLot, onMound, mounds, creekZ, inSmallPlaza } from './layout.js';

function cover(x, z, h) {
  const c = { sand: 0.05, grass: 0.5, rock: 0, soil: 0.4, fields: 0, dry: 0.15, warmth: 0.5, red: 0.05, road: 0, snow: 0, forest: 0 };
  if (inRect(PLAZA, x, z)) { c.soil = 0.75; c.grass = 0.25; return c; }
  if (inSmallPlaza(x, z, 1.5)) { c.soil = 0.85; c.grass = 0.1; c.dry = 0.3; return c; }
  if (onMound(x, z)) { c.grass = 0.85; c.soil = 0.15; return c; }
  if (Math.abs(z - creekZ(x)) < CREEK.w / 2 + 6) { c.soil = 0.6; c.grass = 0.4; return c; }
  if (Math.hypot(x, z) > 300 && ((Math.floor(x / 34) + Math.floor(z / 26)) & 1)) { c.fields = 0.8; c.grass = 0.2; }
  return c;
}
function water(x, z, y) { return inCreek(x, z) && y < CREEK.level + 0.3; }
function waterLevel(x, z) { return inCreek(x, z) ? CREEK.level : -Infinity; }
function fromWater(x, z) { return inCreek(x, z) ? -3 : Math.max(-5, Math.min(40, height(x, z) - CREEK.level)); }
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inCreek(x, z) || inRect(PLAZA, x, z, 3) || inLot(x, z, 1) || inSmallPlaza(x, z, 2)) return null;
  if (mounds(x, z) > 0.3) return { grass: 22 };
  if (Math.abs(z - creekZ(x)) < CREEK.w / 2 + 6) return { willow: 0.05, reeds: 6, grass: 18 };
  if (z < -330) return { oak: 0.01, elm: 0.006, grass: 16 };                                  // the bottomland woods by the creek
  return { grass: 12, oak: 0.0008 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { oak: 0.01, elm: 0.006, willow: 0.05 },
  climate: {
    sun: { az: 150, el: 58, color: [1.0, 0.95, 0.86], intensity: 3.5, lat: 39, dec: 18, hour: 10.5 },
    sky: { turbidity: 3.4, rayleigh: 1.0, mie: 0.007, mieG: 0.78, zenith: [0.07, 0.15, 0.38], horizon: [0.68, 0.7, 0.72] },
    fog: { color: [0.8, 0.8, 0.8], density: 0.0004, height: 0.01 },
    exposure: 0.48,
    damp: 0.5,      // the humid American Bottom: moss and dark stains on the thatch and the foot of the daub, rain streaks on the clay
    waterline: CREEK.level,
    wind: [0.3, 0.2],
    weather: [
      { id: 'clear', weight: 3, clouds: 0.3, cloudDensity: 0.4, sun: 1.0, fog: 1.1 },
      { id: 'cloud', weight: 2, clouds: 0.6, cloudDensity: 0.65, sun: 0.75, fog: 1.3 },
      { id: 'storm', weight: 0.6, clouds: 0.95, cloudDensity: 0.9, sun: 0.3, fog: 1.8, rain: 0.8 },
    ],
  },
};
