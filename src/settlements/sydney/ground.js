// Modern Sydney — the ground: the harbour's green-blue water, the sandstone foreshore and sea
// walls, the city's streets, the Botanic Garden's lawns with Moreton Bay figs and palms; the bright
// southern light.
import { RADIUS, LEVEL, GARDEN, BENNELONG, height, shore, inWater, inRect, inLot } from './layout.js';

function cover(x, z, h) {
  const c = { sand: 0.1, grass: 0.2, rock: 0, soil: 0.1, fields: 0, dry: 0.2, warmth: 0.55, red: 0.1, road: 0.75, snow: 0, forest: 0 };
  const d = shore(x, z);
  if (d < 4) { c.rock = 0.7; c.sand = 0.3; c.road = 0; return c; }
  if (inRect(GARDEN, x, z)) { c.grass = 0.9; c.road = 0.1; return c; }
  if (inRect(BENNELONG, x, z)) { c.road = 0.9; return c; }
  return c;
}
function water(x, z, y) { return inWater(x, z) && y < LEVEL + 0.3; }
function waterLevel(x, z) { return inWater(x, z) ? LEVEL : -Infinity; }
function fromWater(x, z) { return inWater(x, z) ? -3 : Math.max(-5, Math.min(40, height(x, z) - LEVEL)); }
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inWater(x, z) || shore(x, z) < 5 || inLot(x, z, 1) || inRect(BENNELONG, x, z, 2)) return null;
  if (inRect(GARDEN, x, z)) return { fig: 0.008, banyan: 0.004, date_palm: 0.005, grass: 22 };   // the Moreton Bay figs (stand-ins) and palms
  return null;
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { fig: 0.008, banyan: 0.004, date_palm: 0.005 },
  climate: {
    sun: { az: 20, el: 55, color: [1.0, 0.97, 0.9], intensity: 3.6, lat: -34, dec: -15, hour: 11.5 },
    sky: { turbidity: 2.2, rayleigh: 1.1, mie: 0.004, mieG: 0.78, zenith: [0.06, 0.16, 0.45], horizon: [0.6, 0.68, 0.76] },
    fog: { color: [0.76, 0.8, 0.85], density: 0.0003, height: 0.01 },
    exposure: 0.46,
    wind: [0.7, 0.3],
    weather: [
      { id: 'clear', weight: 4, clouds: 0.2, cloudDensity: 0.35, sun: 1.0, fog: 1 },
      { id: 'cloud', weight: 1.5, clouds: 0.55, cloudDensity: 0.6, sun: 0.8, fog: 1.2 },
      { id: 'rain', weight: 0.6, clouds: 0.92, cloudDensity: 0.85, sun: 0.35, fog: 1.8, rain: 0.7 },
    ],
  },
};
