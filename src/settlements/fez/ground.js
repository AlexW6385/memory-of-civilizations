// Fez el-Bali about 1350 — the ground: the valley of the Oued Fes under its medina, the lanes' beaten earth and cobbles, the river
// between its quays, the dry hills round the wall with olives, figs and cypresses; the bright dry sky of the Saïss plain.
import { RADIUS, WALL_R, RIVER, height, riverZ, riverD, inRiver, inLot, onLane, inReserved, SITES, soukRects, inRect, onBridge } from './layout.js';

const cover = (x, z) => {
  const r = Math.hypot(x, z);
  const c = { sand: 0.25, grass: 0.1, rock: 0, soil: 0.55, fields: 0, dry: 0.7, warmth: 0.7, red: 0.4, road: 0, snow: 0, forest: 0 };
  if (r > WALL_R + 6) { c.grass = 0.2; c.soil = 0.5; c.rock = 0.15; return c; }
  if (inRiver(x, z, 2.5)) { c.road = 0.4; c.soil = 0.6; c.sand = 0.1; return c; }
  c.road = 1; c.soil = 0.6; c.grass = 0; c.dry = 0.3;
  return c;
};
const water = (x, z, y) => inRiver(x, z, -0.3) && !onBridge(x, z) && y < RIVER.water + 0.35;
const waterLevel = (x, z) => (inRiver(x, z, -0.3) ? RIVER.water : -Infinity);
const fromWater = (x, z) => riverD(x, z);
/** Plants per 100 m²: the hills round the wall (olive, fig, cypress, dry grass); poplars by the river outside the wall; nothing in the town. */
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (r < WALL_R + 8 || r > RADIUS - 6) return null;
  if (inRiver(x, z, 4)) return { poplar: 0.5, grass_dry: 14 };
  if (riverD(x, z) < 22) return { fig: 0.25, poplar: 0.1, grass_dry: 16 };
  return r < WALL_R + 40 ? { olive: 0.05, fig: 0.03, cypress: 0.02, grass_dry: 12 } : { olive: 0.03, cypress: 0.01, maquis: 0.5, grass_dry: 12 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { poplar: 0.5, fig: 0.25, olive: 0.05, cypress: 0.02, maquis: 0.5 },
  climate: {
    waterline: RIVER.water,
    damp: 0.18,     // the dry Saïss: pale salts and dust at the foot of the walls, soot over the lamps, little moss or rain streaking
    sun: { az: 150, el: 56, color: [1.0, 0.96, 0.88], intensity: 3.6, lat: 34, dec: 10, hour: 10.5 },
    sky: { turbidity: 2.6, rayleigh: 1.0, mie: 0.004, mieG: 0.78, zenith: [0.07, 0.15, 0.42], horizon: [0.66, 0.68, 0.7] },
    fog: { color: [0.8, 0.79, 0.76], density: 0.00032, height: 0.01 },
    exposure: 0.48,
    wind: [0.35, 0.15],
    weather: [
      { id: 'clear', weight: 5, clouds: 0.1, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'cloud', weight: 1.5, clouds: 0.45, cloudDensity: 0.5, sun: 0.85, fog: 1.1 },
    ],
  },
};
void riverZ; void inLot; void onLane; void inReserved; void SITES; void soukRects; void inRect;
