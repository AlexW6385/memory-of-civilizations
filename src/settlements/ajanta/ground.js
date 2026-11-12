// Ajanta — the ground: the plateau behind the cliff (dry teak forest), the gorge floor with the Waghora in its gravel
// bed and the waterfall's pool, the worn paths, the village's earth on the east bank. Climate: the Deccan, hot and
// hazy, dry for most of the year, the monsoon darkening the rock (docs/settlements/ajanta.md §2).
import { RADIUS, EAST, XF, ROCK, ZOUT, WX1, PLATEAU, RIVER, riverX, inRiver, bankY, inPool, FALL, onPath, VILLAGE, inRect, inRock, smooth as sm } from './layout.js';

function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  const az = Math.abs(z);
  let h = 0;
  // the plateau behind the main block, tapering north and south beyond the wings' outer sides
  const back = sm(XF - ROCK + 8, XF - ROCK - 2, x) * (1 - sm(ZOUT + 6, ZOUT + 60, az));
  // the hills beside the wings' outer faces (west of the wings' ends; the river gap stays low)
  const side = sm(ZOUT, ZOUT + 6, az) * (1 - sm(ZOUT + 10, ZOUT + 70, az)) * (1 - sm(WX1 - 6, WX1 + 4, x));
  h = PLATEAU * Math.max(back, side);
  // the east bank: the land rises from the gorge floor to a plateau from which the whole cliff is seen
  h = Math.max(h, EAST * sm(-8, 14, x) * sm(5, 20, Math.abs(x - riverX(z))) * (1 - sm(RADIUS - 60, RADIUS - 30, r)));
  if (inRiver(x, z, 2.4)) h = Math.min(h, bankY(Math.abs(x - riverX(z))));
  if (inPool(x, z, 0)) h = Math.min(h, -0.8);
  else if (inPool(x, z, 1.5)) h = Math.min(h, -0.3);
  // the rim meets the open country at no more than 1 m in 1 m (tests/planet.test.mjs: no step)
  const lim = Math.max(0, RADIUS - 1 - r) * 0.9;
  return Math.max(-lim, Math.min(lim, h * (1 - sm(RADIUS - 30, RADIUS, r))));
}
function cover(x, z, h) {
  const c = { sand: 0.1, grass: 0.35, rock: 0, soil: 0.45, fields: 0, dry: 0.7, warmth: 0.8, red: 0.25, road: 0, snow: 0, forest: 0 };
  if (inRiver(x, z, 1.5) || inPool(x, z, 1.5)) { c.sand = 0.3; c.soil = 0.15; c.rock = 0.55; c.grass = 0; return c; }
  if (onPath(x, z)) { c.road = 0.6; c.soil = 0.4; c.grass = 0; return c; }
  if (inRock(x, z, 3)) { c.rock = 0.8; c.soil = 0.2; return c; }
  if (inRect(VILLAGE, x, z, 4)) { c.soil = 0.7; c.grass = 0.1; c.red = 0.4; return c; }
  if (h > 5) { c.rock = 0.35; c.soil = 0.45; c.forest = 0.4; }
  return c;
}
const water = (x, z, y) => (inRiver(x, z) && y < RIVER.water + 0.3) || (inPool(x, z) && y < -0.2);
const waterLevel = (x, z) => (inRiver(x, z) ? RIVER.water : inPool(x, z) ? -0.15 : -Infinity);
const fromWater = (x, z) => Math.min(Math.abs(x - riverX(z)), Math.hypot(x - FALL.pool[0], z - FALL.pool[1]) - FALL.pr);
/** Plants per 100 m²: dry teak forest on the plateau and hills, bamboo and fig by the river, neem and palms round the village; nothing at the cliff foot, on the paths or in the sight-line across the pocket. */
function planting(x, z) {
  const r = Math.hypot(x, z), az = Math.abs(z);
  if (r > RADIUS - 6 || inRock(x, z, 2) || onPath(x, z, 1) || inRiver(x, z, 1) || inPool(x, z, 1.5)) return null;
  if (x < XF + 14 && az < ZOUT) return null;                         // the foot of the cliff
  if (x < WX1 + 14 && az >= 56 && az < ZOUT + 12 && x > XF - 6) return null;                // the wings' feet
  if (inRect(VILLAGE, x, z, 1)) return { neem: 0.14, jujube: 0.05, date_palm: 0.05, banyan: 0.006, grass_dry: 4 };
  // the millet fields of the village's east and south edge, in plots with fallow between
  if (inRect([VILLAGE[0] - 4, VILLAGE[1] - 14, VILLAGE[2] + 26, VILLAGE[3] + 20], x, z, 0) && r < RADIUS - 24) { const plot = (Math.floor(x / 9) + Math.floor(z / 11) * 3) % 4; return plot === 3 ? { grass_dry: 6, acacia: 0.02 } : { maize: 30, grass_dry: 3 }; }
  // oleander clumps at the pilgrims' shelter and the washing places
  if (Math.abs(x - riverX(z)) < 12 && Math.abs(Math.abs(z) - 32) < 8) return { oleander: 0.12, grass: 5, reeds: 0.1 };
  if (x < XF - ROCK - 4 || (az > ZOUT + 4 && x < WX1)) return { teak: 0.08, neem: 0.02, acacia: 0.03, grass_dry: 5 };
  const dr = Math.abs(x - riverX(z));
  if (dr < 16 && az > 48) return { bamboo: 0.08, fig: 0.03, banyan: 0.01, grass: 6 };
  if (dr < 10) return { grass: 8, reeds: 0.3 };
  if (x > XF + 16 && az > 44 || x > 30) return { teak: 0.025, neem: 0.015, grass_dry: 5 };
  return { grass_dry: 5, grass: 2 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { maize: 40, jujube: 0.08, oleander: 0.14, teak: 0.16, neem: 0.12, acacia: 0.05, bamboo: 0.12, fig: 0.04, banyan: 0.012, date_palm: 0.06, reeds: 0.4 },
  climate: {
    sun: { az: 150, el: 62, color: [1.0, 0.95, 0.85], intensity: 3.6, lat: 20.5, dec: 12, hour: 10 },
    sky: { turbidity: 4.0, rayleigh: 1.2, mie: 0.006, mieG: 0.8, zenith: [0.1, 0.18, 0.38], horizon: [0.64, 0.64, 0.6] },
    fog: { color: [0.76, 0.76, 0.7], density: 0.0005, height: 0.012 },
    exposure: 0.5,
    damp: 0.5,      // the monsoon: dark streaks on the rock, moss in the gorge's shade
    wind: [0.3, 0.2],
    weather: [
      { id: 'hazy', weight: 4, clouds: 0.2, cloudDensity: 0.4, sun: 0.95, fog: 1.2 },
      { id: 'monsoon-cloud', weight: 1.5, clouds: 0.7, cloudDensity: 0.7, sun: 0.7, fog: 1.4 },
    ],
  },
};
