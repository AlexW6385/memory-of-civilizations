// Modern New York — the ground: asphalt avenues and streets, granite curbs and pavements, Bryant
// Park's lawns and plane trees; the clear light of a New York autumn.
import { RADIUS, BRYANT, height, inRect, inLot } from './layout.js';

function cover(x, z) {
  const c = { sand: 0, grass: 0.1, rock: 0, soil: 0.1, fields: 0, dry: 0.2, warmth: 0.3, red: 0, road: 0.95, snow: 0, forest: 0 };
  if (inRect(BRYANT, x, z)) { c.grass = 0.85; c.road = 0.15; return c; }
  return c;
}
const water = () => false, waterLevel = () => -Infinity, fromWater = () => 1e4;
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inLot(x, z, 1)) return null;
  if (inRect(BRYANT, x, z, -3)) return { plane_tree: 0.03, grass: 20 };
  return null;
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { plane_tree: 0.03 },
  climate: {
    sun: { az: 160, el: 40, color: [1.0, 0.95, 0.86], intensity: 3.4, lat: 41, dec: -5, hour: 11 },
    sky: { turbidity: 3.2, rayleigh: 1.0, mie: 0.007, mieG: 0.78, zenith: [0.07, 0.15, 0.4], horizon: [0.66, 0.68, 0.72] },
    fog: { color: [0.76, 0.77, 0.8], density: 0.0004, height: 0.012 },
    exposure: 0.48,
    wind: [0.6, 0.2],
    weather: [
      { id: 'clear', weight: 3, clouds: 0.2, cloudDensity: 0.35, sun: 1.0, fog: 1 },
      { id: 'cloud', weight: 2, clouds: 0.6, cloudDensity: 0.6, sun: 0.75, fog: 1.4 },
      { id: 'rain', weight: 0.8, clouds: 0.92, cloudDensity: 0.85, sun: 0.35, fog: 1.9, rain: 0.6 },
    ],
  },
};
