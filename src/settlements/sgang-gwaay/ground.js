// SG̱ang Gwaay — the ground: the pebble-and-shell beach with drift logs, the beaten earth of the street and the terrace, the
// pits of the houses, the rain forest of cedar and spruce rising behind over deep moss and fern, kelp-dark sea to the east;
// low cloud, drizzle and rain, the damp at its highest (docs/settlements/sgang-gwaay.md §6–§8).

import { RADIUS, SEA, RIM, G, height, shoreX, inSea, inHouse, village } from './layout.js';

function cover(x, z, h, ny) {
  const c = { sand: 0, grass: 0.45, rock: 0, soil: 0.35, fields: 0, dry: 0, warmth: 0.1, red: 0, road: 0, snow: 0, forest: 0.5 };
  const dE = shoreX(z) - x;
  if (inHouse(x, z, -0.5)) { c.soil = 0.9; c.grass = 0; c.road = 0.6; c.forest = 0; return c; }
  if (h < 0.9) { c.sand = 0.45; c.rock = 0.4; c.grass = 0; c.forest = 0; return c; }
  if (dE < 34 && h < G + 0.6) { c.road = 0.55; c.soil = 0.6; c.grass = 0.15; c.forest = 0; return c; }
  if (dE < 48) { c.grass = 0.7; c.soil = 0.3; c.forest = 0.2; return c; }
  c.forest = 0.9; c.grass = 0.8;
  return c;
}
function water(x, z, y) { return inSea(x, z) && y < SEA + 0.3; }
function waterLevel(x, z) { return inSea(x, z) ? SEA : -Infinity; }
function fromWater(x, z) { return Math.max(-5, Math.min(40, height(x, z) - SEA)); }
/** Cedar, spruce and salal behind the village; ferns and salmonberry at its back; boulders on the beach; the street and houses bare. */
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inSea(x, z)) return null;
  const h = height(x, z), dE = shoreX(z) - x;
  if (inHouse(x, z, -4)) return null;
  const v = village();
  if (v.poles.some((p) => Math.hypot(p.c[0] - x, p.c[1] - z) < 3) || v.canoes.some((c) => !c.moored && Math.hypot(c.c[0] - x, c.c[1] - z) < c.l / 2 + 1.5)) return null;
  if (h < 0.9) return h > 0.15 ? { boulder: 0.1, grass: 5 } : { boulder: 0.1 };    // the beach top: drift boulders and sea-rye tufts
  if (dE < 30) return null;                                                           // the street and the houses
  if (dE < 34) return { grass: 16, maquis: 0.14 };                                    // fern and salmonberry against the houses' backs
  if (dE < 40) return { grass: 30, maquis: 0.45, sugi: 0.06 };
  if (dE < 48) return { grass: 36, maquis: 0.7, sugi: 0.3, spruce: 0.2 };             // the forest's edge, the first cedars and spruce
  return { sugi: 0.7, spruce: 0.5, maquis: 0.9, grass: 40 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater, rim: RIM,
  sea: SEA,
  maxDensity: { sugi: 0.7, spruce: 0.5, maquis: 0.9, boulder: 0.1 },
  climate: {
    sun: { az: 170, el: 34, color: [1.0, 0.95, 0.88], intensity: 3.0, lat: 52, dec: 15, hour: 11 },
    sky: { turbidity: 2.6, rayleigh: 1.0, mie: 0.006, mieG: 0.78, zenith: [0.1, 0.15, 0.27], horizon: [0.55, 0.6, 0.65] },
    fog: { color: [0.7, 0.74, 0.77], density: 0.0009, height: 0.02 },
    exposure: 0.5,
    damp: 1,                // the wettest of the set: moss, dark stains and silvering on every plank
    waterline: SEA,
    wind: [1.0, 0.3],
    weather: [
      { id: 'overcast', weight: 4, clouds: 0.8, cloudDensity: 0.7, sun: 0.55, fog: 1.4 },
      { id: 'drizzle', weight: 3, clouds: 0.95, cloudDensity: 0.85, sun: 0.35, fog: 2.0, rain: 0.45 },
      { id: 'rain', weight: 2, clouds: 0.98, cloudDensity: 0.9, sun: 0.25, fog: 2.2, rain: 0.8 },
      { id: 'bright', weight: 1, clouds: 0.3, cloudDensity: 0.4, sun: 1.0, fog: 1 },
    ],
  },
};
