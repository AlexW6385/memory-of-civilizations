// Granada — the ground: the red earth of the Sabika, the palace courts' marble and the gardens'
// cypresses, myrtle and orange trees; elms in the wood below the walls; the Darro's poplars; the
// white Albaicín; the clear sky under the Sierra Nevada.

import { RADIUS, COMARES, GEN, TERRACES, height, hillE, inLot, inRect, laneAt, LANE_W } from './layout.js';

// the Generalife (§10.7): what grows where on its estate
const TER = Object.fromEntries(TERRACES.map((t) => [t.id, t.r]));
const BUILT = [[280.2, -57, 300.5, 54], GEN.sultana, GEN.oratory, [GEN.stair.x0, GEN.stair.z - 2.2, GEN.stair.x1, GEN.stair.z + 2.2], [264, 35, 300.5, 54], GEN.gate];
const VEG = [[266.7, 5, 277, 28.5], [266.7, -7.5, 275, 5.5]];
function estatePlant(x, z) {
  if (BUILT.some((r) => inRect(r, x, z, 0.8)) || laneAt(x, z).d < LANE_W / 2 + 1.2) return null;
  if (VEG.some((r) => inRect(r, x, z, 0.4))) return null;
  if (inRect(TER.orchard1, x, z, -1)) return x > 276.2 ? { grass: 12 } : { fig: 1.5, grass: 14 };     // figs and pomegranates (fig) by the palace
  if (inRect(TER.orchard2, x, z, -1)) return x > 262.4 ? { grass: 12 } : { apple: 0.14, grass: 14 };  // pears, quinces, apples in rows (apple)
  if (inRect(TER.orchard3, x, z, -1)) return { olive: 0.02, grass_dry: 10 };                          // olives in rows
  for (const id of ['side1', 'side2', 'side3', 'top']) if (inRect(TER[id], x, z, -0.6)) return Math.abs(z - GEN.stair.z) > 4 ? { maquis: 3, oleander: 0.6, cypress: 0.3, grass: 12 } : { grass: 8 };
  return undefined;
}
const inEstate = (x, z) => x > 238 && x < 346 && z > -62 && z < 60;

function cover(x, z, h, ny) {
  const c = { sand: 0.15, grass: 0.35, rock: 0, soil: 0.5, fields: 0, dry: 0.6, warmth: 0.65, red: 0.6, road: 0, snow: 0, forest: 0 };
  if (hillE(x, z) < 1) { c.road = 0.5; return c; }
  if (x > 205 && laneAt(x, z).d < LANE_W / 2 + 0.2) { c.road = 0.7; c.grass = 0.05; return c; }
  if (x > 246 && x < 281 && z > -45 && z < 36) { c.soil = 0.85; c.grass = 0.25; c.dry = 0.3; return c; }   // the tilled terraces
  if (ny < 0.85) { c.soil = 0.7; c.grass = 0.3; return c; }
  return c;
}
const water = () => false, waterLevel = () => -Infinity, fromWater = () => 1e4;
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inLot(x, z, 1) || inRect(COMARES, x, z, 3)) return null;
  if (inEstate(x, z)) { const p = estatePlant(x, z); if (p !== undefined) return p; }
  const e = hillE(x, z);
  if (e < 0.95) return e > 0.6 && x > 90 ? { cypress: 0.04, grass: 15 } : null;          // the gardens of the Partal and toward the Generalife
  if (e < 1.4) return { elm: 0.12, cypress: 0.02, grass: 20 };                              // the wood on the slopes
  if (Math.abs(z + 110) < 14) return { poplar: 0.1, grass: 25 };
  if (x > 222 && x < 250 && z > -100 && z < 70) return laneAt(x, z).d < LANE_W / 2 + 1.2 ? null : { elm: 0.08, poplar: 0.03, grass: 22 };   // the ravine
  if (x > 246) return { holm_oak: 0.3, cypress: 0.05, maquis: 2, grass_dry: 12 };                          // the hillside of the Cerro del Sol
  return { olive: 0.02, cypress: 0.01, grass_dry: 8 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { elm: 0.12, cypress: 0.3, poplar: 0.1, olive: 0.02, fig: 1.5, apple: 0.14, maquis: 3, oleander: 0.6, holm_oak: 0.3 },
  climate: {
    sun: { az: 150, el: 52, color: [1.0, 0.96, 0.88], intensity: 3.5, lat: 37, dec: 12, hour: 10.5 },
    sky: { turbidity: 2.4, rayleigh: 1.0, mie: 0.004, mieG: 0.78, zenith: [0.07, 0.15, 0.42], horizon: [0.62, 0.66, 0.72] },
    fog: { color: [0.78, 0.8, 0.82], density: 0.00028, height: 0.01 },
    exposure: 0.48,
    wind: [0.4, 0.2],
    weather: [
      { id: 'clear', weight: 5, clouds: 0.12, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'cloud', weight: 1.5, clouds: 0.45, cloudDensity: 0.5, sun: 0.85, fog: 1.1 },
    ],
  },
};
