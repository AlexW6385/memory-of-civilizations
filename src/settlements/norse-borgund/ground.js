// Norse Norway — the ground: the hay meadows and small fields of the valley floor, the river's
// stony banks with willows and alders, the steep sides of pine and spruce; the cool northern light.
import { RADIUS, RIM, RIVER, YARD, height, inRiver, inRect, inBuilding, inFarm, riverZ } from './layout.js';

function cover(x, z, h) {
  const c = { sand: 0, grass: 0.7, rock: 0, soil: 0.2, fields: 0, dry: 0.05, warmth: 0.2, red: 0, road: 0, snow: 0, forest: 0 };
  if (inFarm(x, z, 4)) { c.road = 0.4; c.soil = 0.4; return c; }
  if (h > 8) { c.forest = 0.7; c.rock = 0.25 * Math.min(1, (h - 8) / 30); c.grass = 0.3; return c; }
  if (Math.abs(z - riverZ(x)) < RIVER.w / 2 + 4) { c.rock = 0.4; c.soil = 0.4; c.grass = 0.2; return c; }
  if (((Math.floor(x / 40) + Math.floor(z / 30)) & 1) === 0 && !inRect(YARD, x, z, 6)) { c.fields = 0.7; c.grass = 0.3; }
  return c;
}
function water(x, z, y) { return inRiver(x, z) && y < RIVER.level + 0.3; }
function waterLevel(x, z) { return inRiver(x, z) ? RIVER.level : -Infinity; }
function fromWater(x, z) { return inRiver(x, z) ? -3 : Math.max(-5, Math.min(40, height(x, z) - RIVER.level)); }
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inRiver(x, z) || inRect(YARD, x, z, 1) || inBuilding(x, z, 2)) return null;
  const h = height(x, z);
  if (Math.abs(z - riverZ(x)) < RIVER.w / 2 + 5) return { willow: 0.04, grass: 18 };
  if (h > 8) return { spruce: 0.5, red_pine: 0.15, birch: 0.05, boulder: 0.01, grass: 10 };   // spruce, Scots pine (red_pine) and birch on the slopes
  if (inFarm(x, z)) return { grass: 10 };
  return { birch: 0.003, grass: 24 };                                                     // birches in the meadows
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater, rim: RIM,
  maxDensity: { spruce: 0.5, red_pine: 0.15, willow: 0.04, birch: 0.05, boulder: 0.01 },
  climate: {
    sun: { az: 170, el: 40, color: [1.0, 0.95, 0.88], intensity: 3.2, lat: 61, dec: 18, hour: 12 },
    sky: { turbidity: 2.4, rayleigh: 1.1, mie: 0.004, mieG: 0.78, zenith: [0.08, 0.16, 0.42], horizon: [0.62, 0.68, 0.75] },
    fog: { color: [0.75, 0.78, 0.82], density: 0.0005, height: 0.012 },
    exposure: 0.5,
    damp: 0.85,     // western Norway: moss on the north faces and on the shingled roofs, rain streaks down the tarred wood (DESIGN §5)
    wind: [0.4, 0.1],
    weather: [
      { id: 'clear', weight: 2, clouds: 0.3, cloudDensity: 0.4, sun: 1.0, fog: 1 },
      { id: 'cloud', weight: 3, clouds: 0.65, cloudDensity: 0.65, sun: 0.7, fog: 1.4 },
      { id: 'rain', weight: 1.5, clouds: 0.95, cloudDensity: 0.9, sun: 0.3, fog: 2.2, rain: 0.6 },
    ],
  },
};
