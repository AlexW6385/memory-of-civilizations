// A Balinese village — the ground (docs/settlements/bali-village.md §6): the level core under the village, the terraces beyond it (layout.js height), paddies green or
// flooded, packed earth in the streets and the temple's courts, groves of coconut (the date palm stands in), bamboo and banyan about the compounds, the humid sky of the
// tropics at 8° S.

import { RADIUS, CORE, PURA, BANYAN, WANTILAN, DALEM, DALEM_C, inDalem, height, flooded, lots, inRect, inLot, inPura, streets, smooth as sm } from './layout.js';

function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
const inCore = (x, z) => inRect(CORE, x, z);
function cover(x, z, h) {
  const c = { sand: 0, grass: 0.5, rock: 0, soil: 0.4, fields: 0, dry: 0.05, warmth: 0.5, red: 0.2, road: 0, snow: 0, forest: 0 };
  if (inPura(x, z, 0.5) || inDalem(x, z, 0.3)) { c.grass = 0.1; c.soil = 0.5; c.road = 0.7; return c; }
  if (streets().some((r) => inRect(r, x, z))) { c.road = 0.8; c.soil = 0.5; c.grass = 0.1; return c; }
  if (inCore(x, z)) { if (inLot(x, z, 0.3)) { c.road = 0.6; c.soil = 0.5; c.grass = 0.15; } return c; }
  c.fields = flooded(x, z, h ?? height(x, z)) ? 0.1 : 0.85; c.grass = 0.3; c.soil = 0.5;
  return c;
}
const water = () => false;
const waterLevel = () => -Infinity;
const fromWater = () => 1e4;
/** Plants per 100 m²: groves of coconut and bamboo about the compounds, the banyan at the crossing, a few trees by the temple's walls, rice on the terraces, nothing in the courts, streets and lots' yards. */
function planting(x, z, p) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 6) return null;
  if (Math.hypot(x - BANYAN[0], z - BANYAN[1]) < 2.2) return { banyan: 8 };
  if (Math.hypot(x - BANYAN[0], z - BANYAN[1]) < 3.4) return null;
  // the pura dalem: its own banyan (local (−5, 6.5) of the temple turned to face the street), a frangipani at each side of the gate, nothing else in the court
  if (inDalem(x, z, 1.5)) {
    if (Math.hypot(x - (DALEM_C[0] - 6.5), z - (DALEM_C[1] - 5)) < 2.2) return { banyan: 8 };
    return null;
  }
  // the temple's frangipani (a fig stands in) in the middle court's open corners (the inner court's floor is raised past what a planting can follow)
  if (inPura(x, z, 0.5) && [[-9, -82], [9, -82], [-9, -100], [-30, -75], [28.5, -74.5]].some(([px, pz]) => Math.hypot(x - px, z - pz) < 1.8)) return { fig: 10 };
  if (inPura(x, z, 1.5) || streets().some((q) => inRect(q, x, z, 0.4)) || inRect(WANTILAN, x, z, 3)) return null;
  if (inLot(x, z, 0.3)) {
    // in a compound only the occasional frangipani (a fig stands in) or coconut in the natah's corner
    const l = lots().find((q) => inRect(q.rect, x, z)); if (!l) return null;
    return hash2(x * 0.7, z * 0.7) < 0.015 ? { date_palm: 0.6, fig: 0.3 } : null;
  }
  if (inCore(x, z)) {
    // the gardens and groves between the compounds and the terraces
    if (hash2(x * 0.04, z * 0.04) < 0.5) return { date_palm: 0.7, bamboo: 0.4, banyan: 0.015, teak: 0.06, grass: 18 };
    return { date_palm: 0.25, grass: 25 };
  }
  const h = p?.h ?? height(x, z);
  if (flooded(x, z, h)) return { grass: 2 };
  // the terraces: rice, a coconut on a bund now and then, the shade tree beside a shrine
  return hash2(x * 0.1, z * 0.1) < 0.02 ? { date_palm: 0.5, rice: 40 } : { grass: 4 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { date_palm: 0.7, bamboo: 0.4, banyan: 8, teak: 0.06, fig: 0.3, rice: 40 },
  climate: {
    sun: { az: 25, el: 56, color: [1.0, 0.95, 0.86], intensity: 3.3, lat: -8.4, dec: 10, hour: 9.5 },
    sky: { turbidity: 4.4, rayleigh: 1.15, mie: 0.007, mieG: 0.82, zenith: [0.1, 0.19, 0.36], horizon: [0.66, 0.7, 0.72] },
    fog: { color: [0.76, 0.8, 0.8], density: 0.0007, height: 0.014 },
    exposure: 0.5,
    damp: 0.75,
    wind: [0.2, 0.1],
    weather: [
      { id: 'morning-mist', weight: 2, clouds: 0.3, cloudDensity: 0.4, sun: 0.7, fog: 3, fogColor: [0.8, 0.83, 0.83] },
      { id: 'bright', weight: 3, clouds: 0.35, cloudDensity: 0.45, sun: 1.0, fog: 1 },
      { id: 'shower', weight: 1.2, clouds: 0.9, cloudDensity: 0.8, sun: 0.35, fog: 2, rain: 0.6 },
    ],
  },
};
void sm; void DALEM;
