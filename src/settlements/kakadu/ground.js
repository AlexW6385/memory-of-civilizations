// Kakadu — the ground: the floodplain's grey-brown clay and dry sedge, bare earth in the shelters and along the beaten tracks, sandstone
// at the rock's foot, the billabong and its hollows; woodland of gums on the rock's flanks; a high hot sun and long clear weather
// (docs/settlements/kakadu.md §4, §7).
import { RADIUS, POOL, MAIN, SMALL, TRACKS, CAMPS, height, inPool, inHollow, poolD, smooth, inRect } from './layout.js';

function nearTrack(x, z, w) {
  for (const t of TRACKS) for (let i = 0; i < t.length - 1; i++) {
    const [ax, az] = t[i], [bx, bz] = t[i + 1], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz;
    const k = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2)), d = Math.hypot(x - ax - dx * k, z - az - dz * k);
    if (d < w) return true;
  }
  return false;
}
const inShelter = (x, z, m = 0) => inRect([MAIN.x0 - 2, MAIN.zb, MAIN.x1 + 2, MAIN.zl + 3], x, z, m) || inRect([SMALL.x0 - 2, SMALL.zb, SMALL.x1 + 2, SMALL.zl + 3], x, z, m);
function cover(x, z) {
  const c = { sand: 0.15, grass: 0.2, rock: 0, soil: 0.35, fields: 0, dry: 0.7, warmth: 0.85, red: 0.35, road: 0, snow: 0, forest: 0 };
  if (z < -16) { c.rock = 0.55; c.red = 0.7; c.grass = 0.05; c.soil = 0.4; c.sand = 0.2; }                  // the rock's skirt of grit and red earth
  if (inShelter(x, z, 1)) { c.road = 0.5; c.soil = 0.5; c.sand = 0.35; c.grass = 0; c.rock = 0.1; c.dry = 0.9; return c; }   // beaten, dry dust
  if (CAMPS.some((k) => Math.hypot(x - k.fire[0], z - k.fire[1]) < 4.5)) { c.road = 0.45; c.grass = 0.02; c.soil = 0.5; c.dry = 0.9; c.sand = 0.3; return c; }   // the trodden ground of a camp
  if (nearTrack(x, z, 1.6)) { c.road = 0.5; c.grass = 0.02; c.soil = 0.5; c.dry = 0.9; return c; }
  const d = poolD(x, z);
  if (d < 1.2 || inHollow(x, z, 1)) { c.sand = 0.1; c.soil = 0.6; c.grass = 0.1; c.dry = 0.1; c.warmth = 0.5; return c; }
  if (d < 1.5) { c.grass = 0.55; c.soil = 0.3; c.dry = 0.3; }                                             // the sedge at the margin
  return c;
}
const water = (x, z, y) => (inPool(x, z) && y < POOL.water + 0.3) || (inHollow(x, z) && y < POOL.water + 0.3);
const waterLevel = (x, z) => (inPool(x, z) || inHollow(x, z) ? POOL.water : -Infinity);
function fromWater(x, z) {
  const d = (poolD(x, z) - 1) * Math.min(POOL.a, POOL.b);
  return d;
}
/** Plants per 100 m²: spike-rush and reeds in the shallows and at the margin, grass and a few gums beyond. */
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 5 || z < -22 && z > -80 && x > -80 && x < 82 && r < RADIUS) return null;
  if (inPool(x, z, -4) || inHollow(x, z, -1)) return { reeds: 1.2 };
  if (inShelter(x, z, 2) || nearTrack(x, z, 1.6) || CAMPS.some((k) => Math.hypot(x - k.fire[0], z - k.fire[1]) < 4)) return null;
  const w = fromWater(x, z);
  if (w < 7) return { reeds: 2.0, grass: 16 };
  if (z < -12) return { acacia: 0.012, grass_dry: 14 };
  return { grass_dry: 22, grass: 10, acacia: 0.003 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { reeds: 2.0, acacia: 0.012 },
  climate: {
    sun: { az: 250, el: 56, color: [1.0, 0.94, 0.84], intensity: 3.8, lat: -12.5, dec: 15, hour: 15.5 },
    sky: { turbidity: 2.8, rayleigh: 1.05, mie: 0.006, mieG: 0.8, zenith: [0.08, 0.17, 0.44], horizon: [0.68, 0.7, 0.72] },
    fog: { color: [0.78, 0.76, 0.72], density: 0.00035, height: 0.01 },
    exposure: 0.48,
    damp: 0.3,        // the dry season: dark water streaks on the rock from the wet, algae at the billabong's edge only
    waterline: POOL.water,
    wind: [0.5, 0.2],
    weather: [
      { id: 'clear', weight: 5, clouds: 0.12, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'buildup', weight: 1.5, clouds: 0.6, cloudDensity: 0.7, sun: 0.8, fog: 1.2 },
      { id: 'storm', weight: 0.6, clouds: 0.95, cloudDensity: 0.9, sun: 0.3, fog: 1.8, rain: 0.8 },
    ],
  },
};
void smooth;
