// Kilwa — the ground: grey-brown sandy soil on the coral rag, white coral sand on the beach, grass and scrub, coconut palms (date palms stand in) and
// baobabs (banyan stands in) on the island, the beach and the reef flat, the Indian Ocean; the
// warm, bright, humid sky of the monsoon coast.

import { RADIUS, SEA, RIM, MOSQUE, PALACE, height, inSea, inRect, inLot, onHeadland, STAIR, BEACH_MOSQUE } from './layout.js';

function cover(x, z, h) {
  // inland the coral rag weathers to a grey-brown sandy soil under grass; only the beach is white
  const c = { sand: 0.35, grass: 0.35, rock: 0.05, soil: 0.3, fields: 0, dry: 0.3, warmth: 0.9, red: 0.15, road: 0, snow: 0, forest: 0 };
  if (inRect(MOSQUE, x, z, 2) || inRect(PALACE, x, z, 2)) { c.road = 0.45; c.grass = 0.1; return c; }
  // the headland: bare sandstone on its cliffs, trodden ground on its terraces
  const s = Math.max(Math.abs(height(x + 1, z) - height(x - 1, z)), Math.abs(height(x, z + 1) - height(x, z - 1))) / 2;
  if (s > 0.7 && h > -1) { c.rock = 0.85; c.red = 0.35; c.grass = 0.05; c.sand = 0.2; c.soil = 0.1; return c; }
  if (onHeadland(x, z)) { c.road = 0.3; c.grass = 0.15; c.soil = 0.45; return c; }
  if (h < 1) { c.sand = 0.9; c.grass = 0; return c; }
  return c;
}
function water(x, z, y) { return inSea(x, z) && y < SEA + 0.3; }
function waterLevel(x, z) { return inSea(x, z) ? SEA : -Infinity; }
function fromWater(x, z) { return Math.max(-5, Math.min(40, height(x, z) - SEA)); }
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inSea(x, z) || height(x, z) < 0.8 || inRect(MOSQUE, x, z, 4) || inRect(PALACE, x, z, 4) || onHeadland(x, z, 3) || inRect(STAIR.b.rect, x, z, 3) || inRect(BEACH_MOSQUE, x, z, 4) || inLot(x, z, 1)) return null;
  return { date_palm: 0.12, banyan: 0.008, maquis: 0.06, grass: 18 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater, rim: RIM,
  maxDensity: { date_palm: 0.12, banyan: 0.008, maquis: 0.06 },
  climate: {
    sun: { az: 0, el: 60, color: [1.0, 0.96, 0.88], intensity: 3.6, lat: -9, dec: 0, hour: 11 },
    sky: { turbidity: 3.4, rayleigh: 1.1, mie: 0.006, mieG: 0.78, zenith: [0.08, 0.16, 0.4], horizon: [0.64, 0.68, 0.74] },
    fog: { color: [0.78, 0.82, 0.86], density: 0.00035, height: 0.01 },
    exposure: 0.48,
    wind: [1.0, 0.3],
    weather: [
      { id: 'trade', weight: 4, clouds: 0.35, cloudDensity: 0.45, sun: 1.0, fog: 1 },
      { id: 'squall', weight: 1, clouds: 0.9, cloudDensity: 0.85, sun: 0.4, fog: 1.6, rain: 0.8 },
    ],
  },
};
