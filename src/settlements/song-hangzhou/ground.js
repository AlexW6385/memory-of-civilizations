// Southern Song Lin'an by the Qiantang — the ground: the river's water below its flood wall, the
// level city and riverside quarter, the canal sunk between its streets, the West Lake in the north-west
// with the Su Causeway across it, Yuelun Hill and the ridge behind the lake rising to the west under
// pines, fir, camphor, bamboo and tea; willows on the canal, the lake and the causeway, peach trees on
// the causeway; the humid sky of Jiangnan (docs/settlements/song-hangzhou.md §6, §7, §12).

import { pathDist } from './hillpath.js';
import { WAZI, spans, RADIUS, LEVEL, WALL, ROAD, T1, T2, CANAL_STREETS, WEST_LAKE, LAKE_GATE, TAFANG, WAREHOUSES, WATCH_TOWERS, inRect, hill, inRiver, inCanal, inLot, inWestLake, lakeDepth, onStreet, onWall, smooth as sm } from './layout.js';

function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  let h = hill(x, z);
  if (inRiver(x, z)) h = LEVEL.bed * sm(WALL.z1, WALL.z1 + 12, z);
  else if (inCanal(x, z)) h = LEVEL.canalBed;
  else { const d = lakeDepth(x, z); if (d > 0) h = LEVEL.lakeBed * sm(0, WEST_LAKE.bank, d); }
  return h * (1 - sm(RADIUS - 30, RADIUS, r));
}
const wet = (x, z) => (inRiver(x, z) && Math.hypot(x, z) < RADIUS - 30) || inCanal(x, z) || inWestLake(x, z);
function cover(x, z, h) {
  const c = { sand: 0.1, grass: 0.3, rock: 0, soil: 0.4, fields: 0, dry: 0.1, warmth: 0.5, red: 0, road: 0, snow: 0, forest: 0 };
  if (inRiver(x, z)) { c.sand = 0.6; c.soil = 0.4; return c; }
  const d = lakeDepth(x, z);
  if (d > -3) { c.sand = 0.25; c.soil = 0.5; c.grass = 0.25; return c; }
  if (h > 2.5) { c.forest = 0.7; c.grass = 0.3; c.soil = 0; c.rock = h > 40 ? 0.2 : 0; return c; }
  if (Math.hypot(x, z) > RADIUS - 26) { c.fields = 0.8; c.grass = 0.2; return c; }
  c.road = inLot(x, z, 0.2) ? 0 : 0.45;
  if (inRect(WAZI.rect, x, z, 0)) c.road = 1;
  if (onStreet(x, z)) c.road = 1;
  return c;
}
function water(x, z, y) { return wet(x, z) && y < (inCanal(x, z) ? LEVEL.canal : inWestLake(x, z) ? LEVEL.lake : LEVEL.river) + 0.3; }
function waterLevel(x, z) { return inCanal(x, z) ? LEVEL.canal : wet(x, z) ? (inWestLake(x, z) ? LEVEL.lake : LEVEL.river) : -Infinity; }
function fromWater(x, z) { return wet(x, z) ? 0 : Math.min(Math.abs(WALL.z1 - z), Math.max(0, -lakeDepth(x, z) + WEST_LAKE.waterDepth), 60); }
const NOGO = () => [...TAFANG, ...WAREHOUSES, ...WATCH_TOWERS];
/**
 * Plants per 100 m²: woods on the hills (masson pine and Chinese fir above, camphor and bamboo below, tea
 * on the middle slopes, maples), willows on the canal's banks, round the lake and on the causeway with
 * peach trees between them, reeds in the lake's shallows, camphor and mulberry among the houses.
 */
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inRiver(x, z) || inCanal(x, z)) return null;
  if (inRect(T1.rect, x, z, 3) || inRect(T2.rect, x, z, 3) || (Math.abs(x + 110) < 8 && z > 30 && z < 135)) return null;
  if (inRect(WAZI.rect, x, z, 3)) return null;
  // the approach to the pagoda from the river road (the arrival's view): its old camphors and ginkgos are placed trees (plan.js); no scattered flora here, whose crown clumps hang
  // as bare clumps in the sky of that view
  if ((x > -170 && x < -50 && z > 84 && z < 132) || Math.hypot(x + 110, z - 138) < 22) return null;   // (the pagoda approach and round the arrival: no crown overhead or at the lens)
  const d = lakeDepth(x, z);
  // the lake's shallows and its shore: reeds in the shallows, willows on the bank with peach trees behind them
  if (d > WEST_LAKE.waterDepth) return null;
  if (inRect([LAKE_GATE.rect[0] - 4, LAKE_GATE.rect[1] - 30, LAKE_GATE.rect[2] + 4, LAKE_GATE.rect[3]], x, z, 0)) return d > 5 ? { reeds: 2 } : null;
  if (d > 4) return { reeds: 3 };
  if (d > -4.5) return { willow: 1.0, reeds: d > 0 ? 1.5 : 0 };
  if (d > -11 && z < -240) return { apple: 0.7, willow: 0.15, grass: 20 };
  if (onWall(x, z, 1) || onStreet(x, z, 0.5)) {
    // willows on the canal streets' edges, over the water
    if (CANAL_STREETS.some((r) => inRect(r, x, z, 0)) && (x < 138 ? x > 136.4 : x < 151.6 && x > 150)) return { willow: 0.9 };
    // street trees: willows and camphors at the Imperial Way's kerbs (inferred from the shaded streets of Lin'an's accounts)
    if (spans().some((s) => Math.abs(s.z - z) < 1.5)) return null;
    if (x > 20.4 && x < 21.6 && z < -20 && z > -215 && !onWall(x, z, 14)) return { willow: 0.45 };
    if (x > 34.4 && x < 35.6 && z < -20 && z > -215 && !onWall(x, z, 14)) return { camphor: 0.3 };
    return null;
  }
  if (inLot(x, z, 0.5) || z > ROAD.z0 - 0.5) return null;
  if (NOGO().some((r) => inRect(r, x, z, 3))) return null;
  const h = hill(x, z);
  if (h > 2 && pathDist(x, z) < 3.2) return { grass: 14 };
  if (h > 2) {
    const up = sm(18, 40, h);
    return { masson_pine: 0.5 * up, chinese_fir: 0.35 * up, chinese_pine: 0.3 * (1 - up), camphor: 0.25 * (1 - up), bamboo: 1.0 * (1 - up), tea: 0.6 * sm(0.2, 0.7, 1 - up) * (1 - sm(28, 38, h)), maple: 0.3, grass: 25 };
  }
  if (Math.hypot(x, z) > RADIUS - 40) return { grass: 25 };
  const out = z > -20 ? { mulberry: 0.1, camphor: 0.05, willow: 0.03, grass: 14 } : { camphor: 0.07, willow: 0.02, grass: 10 };
  if (x > -150 && x < -40 && z < -20 && z > -330) { out.bamboo = 0.8; out.camphor = 0.15; }
  return out;
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  sea: LEVEL.river,   // the planet's sea is this water, at this level (src/planet/relief.js)
  maxDensity: { masson_pine: 0.5, chinese_fir: 0.35, chinese_pine: 0.3, camphor: 0.4, bamboo: 1.2, tea: 0.6, maple: 0.3, willow: 1.1, apple: 0.7, reeds: 3, mulberry: 0.1, grass: 25 },
  climate: {
    waterline: LEVEL.canal,   // the canals' still water: the stain line on their walls (src/engine/materials.js)
    sun: { az: 160, el: 42, color: [1.0, 0.94, 0.86], intensity: 2.9, lat: 30, dec: 0, hour: 10.5 },
    sky: { turbidity: 4.5, rayleigh: 1.2, mie: 0.007, mieG: 0.82, zenith: [0.12, 0.19, 0.33], horizon: [0.66, 0.68, 0.7] },
    fog: { color: [0.75, 0.77, 0.78], density: 0.0008, height: 0.014 },
    exposure: 0.5,
    wind: [0.3, 0.2],
    damp: 0.75,        // the river's damp: streaks down the white walls, moss at their shaded feet and on the north roofs (§11)
    weather: [
      { id: 'hazy', weight: 3, clouds: 0.4, cloudDensity: 0.45, sun: 0.85, fog: 1.4 },
      { id: 'autumn-clear', weight: 2, clouds: 0.15, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'drizzle', weight: 1.5, clouds: 0.95, cloudDensity: 0.8, sun: 0.3, fog: 2.4, rain: 0.5 },
      { id: 'river-mist', weight: 1, clouds: 0.5, cloudDensity: 0.45, sun: 0.55, fog: 4, fogColor: [0.76, 0.78, 0.79] },
    ],
  },
};
