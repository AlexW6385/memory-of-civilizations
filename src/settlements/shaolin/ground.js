// Shaolin — the ground: the flat of the compound, the village plain south, the foothills round, Mount
// Song rising in the north; cypress and pine; the dry, hazy sky of the Zhongyuan (docs/settlements/shaolin.md §4, §7).
import { RADIUS, WALL, FOREST, STUPAS, RANGES, AXIS, HOUSES, ROADS, MOUNT, inRect, onRoad, smooth as sm, pathNear } from './layout.js';

function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vnoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash2(xi, zi), b = hash2(xi + 1, zi), c = hash2(xi, zi + 1), d = hash2(xi + 1, zi + 1);
  return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1;
}
const inForest = (x, z, m = 0) => inRect(FOREST, x, z, m);
/** The ground's height: flat in the compound, the forest on a gentle slope up west, the foothills, Mount Song. */
function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  let h = MOUNT(x, z);
  // the flats: compound, village, road
  // gentle foothills east and west of the compound and on the forest's side
  const side = Math.max(0, Math.abs(x) - 75) * 0.08 * sm(-110, 20, z);
  h += side + 0.6 * vnoise(x * 0.03, z * 0.03) * sm(60, 120, Math.abs(x));
  if (x < -100) h += (-100 - x) * 0.035 * sm(0, 40, z + 20);
  return h * (1 - sm(RADIUS - 30, RADIUS, r));
}
function cover(x, z, h, ny) {
  const c = { sand: 0, grass: 0.15, rock: 0, soil: 0.55, fields: 0, dry: 0.65, warmth: 0.55, red: 0.12, road: 0, snow: 0, forest: 0 };
  const steep = sm(0.9, 0.7, ny);
  c.rock = Math.max(steep, sm(8, 40, h) * 0.5);
  if (inRect(WALL, x, z) || onRoad(x, z)) { c.road = 1; c.soil = 1; c.grass = 0; c.rock = 0; return c; }
  if (inForest(x, z, 2)) { c.soil = 0.8; c.grass = 0.1; return c; }
  if (z > 160 && Math.hypot(x, z) > 100 && !onRoad(x, z, 2)) { c.fields = 0.7; c.grass = 0.2; c.soil = 0.3; }
  if (h > 10) { c.forest = 0.4; c.grass = 0.2; }
  return c;
}
const water = () => false, waterLevel = () => -Infinity, fromWater = () => 99;
/** Plants per 100 m². */
function planting(x, z, p) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 6) return null;
  if (z > 128 && z < 150 && Math.abs(x) < 16) return null;
  if (HOUSES.some((q) => inRect(q.rect, x, z, 2.5)) || onRoad(x, z, 1.5)) return null;
  if (STUPAS.some((s) => Math.hypot(s.c[0] - x, s.c[1] - z) < s.rad + 0.8)) return null;
  if (pathNear(x, z, 2.2)) return null;
  if (inRect(WALL, x, z, 0.5)) {
    // inside the compound: old cypresses in the courts and along the cross walls, ginkgo stand-ins, nothing on the paving
    if (RANGES.some((q) => inRect(q.rect, x, z, 1.2)) || Object.values(AXIS).some((q) => inRect(q, x, z, 3))) return null;
    if (Math.abs(x) < 5) return null;
    const n = vnoise(x * 0.12 + 3, z * 0.12);
    return { cypress: 0.14 * sm(0.1, 0.5, n), arborvitae: 0.1 * sm(0.0, 0.5, -n), pagoda_tree: 0.05 };
  }
  if (inForest(x, z, 3)) return { cypress: 0.35 * sm(0.1, 0.6, vnoise(x * 0.09, z * 0.09)), grass_dry: 3 };
  if (z < -112) {
    const t = sm(0, 40, p.h);
    return { chinese_pine: 0.5 * (0.4 + t), arborvitae: 0.2, oak: 0.2 * t, grass_dry: 14, maquis: 0.4 };
  }
  if (z > 160) return { grass_dry: 10, jujube: 0.05, poplar: 0.1 };
  return { chinese_pine: 0.25, arborvitae: 0.12, grass_dry: 12 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { cypress: 0.4, arborvitae: 0.2, pagoda_tree: 0.06, chinese_pine: 0.8, oak: 0.2, maquis: 0.4, jujube: 0.06, poplar: 0.1, grass_dry: 20 },
  climate: {
    damp: 0.2,
    sun: { az: 150, el: 44, color: [1.0, 0.95, 0.86], intensity: 3.3, lat: 34.5, dec: 10, hour: 10.5 },
    sky: { turbidity: 3.6, rayleigh: 1.15, mie: 0.004, mieG: 0.8, zenith: [0.1, 0.17, 0.34], horizon: [0.5, 0.55, 0.6] },
    fog: { color: [0.72, 0.74, 0.76], density: 0.0005, height: 0.012 },
    exposure: 0.52,
    wind: [0.35, 0.15],
    weather: [
      { id: 'clear', weight: 4, clouds: 0.15, cloudDensity: 0.35, sun: 1.0, fog: 1 },
      { id: 'hazy', weight: 2.5, clouds: 0.4, cloudDensity: 0.45, sun: 0.8, fog: 1.6 },
      { id: 'cloudy', weight: 1.5, clouds: 0.75, cloudDensity: 0.6, sun: 0.6, fog: 1.3 },
    ],
  },
};
