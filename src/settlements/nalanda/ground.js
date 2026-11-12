// Nalanda — the ground: flat trampled earth and brick paving in the compound, red-brown plain round it with groves of
// mango-stand-ins (neem, pipal, palm) and fields, the brick-edged tanks; the hot hazy sky of the Gangetic plain with its monsoon.
import { RADIUS, TANKS, LEVEL, height, tankD, inTankWater, inTank, nearCore, inLot, inRect, MONASTERIES, TEMPLES } from './layout.js';

function cover(x, z, h) {
  const c = { sand: 0.15, grass: 0.35, rock: 0, soil: 0.5, fields: 0, dry: 0.5, warmth: 0.8, red: 0.45, road: 0, snow: 0, forest: 0 };
  if (nearCore(x, z, 0.5)) { c.road = 0.7; c.grass = Math.abs(x) > 5.2 && Math.abs(x) < 9 ? 0.3 : 0.1; if (Math.abs(x) < 3.5) c.soil = 0.65; return c; }
  if (h < -0.5) { c.soil = 0.7; c.grass = 0.3; return c; }
  if (inLot(x, z, 3)) { c.road = 0.4; c.soil = 0.6; return c; }
  if (Math.hypot(x, z) > 150) { c.fields = 0.7; c.grass = 0.25; return c; }
  return c;
}
const water = (x, z, y) => inTankWater(x, z) && y < LEVEL + 0.3;
const waterLevel = (x, z) => (inTankWater(x, z) ? LEVEL : -Infinity);
const fromWater = (x, z) => Math.max(-5, Math.min(40, tankD(x, z)));
// the arrival's view (the way, the temple's east face, the monastery's gate) kept clear of trees
const EYE = [-3, 62];
function inView(x, z) { return Math.hypot(x - EYE[0], z - EYE[1]) < 42 && x > -48 && x < 30 && z > 10; }
// the lanes of the village and of the ghats stay open
function onLane(x, z) {
  if (x > 70 && z > 88 && ((z - 92) % 13 + 13) % 13 > 7.8 && ((z - 92) % 13 + 13) % 13 < 12.2) return true;
  if (x > 132 && ((x - 134) % 13 + 13) % 13 > 9.6) return true;
  if (x > 122 && x < 130) return true;
  if (x > 60 && x < 125 && [-75, -25, 25, 75].some((g) => Math.abs(z - g) < 4)) return true;
  return z > 123 && z < 129 && x > 0;
}
function planting(x, z) {
  // tufts of dry grass along the margins of the sacred way, between the lamp pillars and the votive stupas
  if (Math.abs(x) > 6.7 && Math.abs(x) < 8.8 && z > -130 && z < 112 && !MONASTERIES.some((m) => Math.abs((m.rect[1] + m.rect[3]) / 2 - z) < 5) && !TEMPLES.some((t) => Math.abs(t.c[1] - z) < t.half && x < 0)) return { grass_dry: 3 };
  if (Math.hypot(x, z) > RADIUS - 6 || inTank(x, z, 1) || nearCore(x, z, 2) || inLot(x, z, 1) || onLane(x, z)) return null;
  if (inView(x, z)) return { grass: 9 };
  if (tankD(x, z) < 6) return { reeds: 3, grass: 10 };
  // the mango groves of the monasteries, pipal by the tanks, tala palms on the bunds
  if (tankD(x, z) < 24) return { fig: 0.5, neem: 0.5, date_palm: 0.5, grass_dry: 7 };
  if (x < -70 || z < -130) return { neem: 1.5, fig: 0.5, banyan: 0.1, date_palm: 0.7, grass_dry: 6 };
  if (x > 124 || z > 128) return { neem: 0.7, fig: 0.2, date_palm: 0.4, grass_dry: 8 };
  return { neem: 0.5, fig: 0.2, date_palm: 0.2, grass_dry: 9 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { neem: 1.6, fig: 0.6, banyan: 0.12, date_palm: 0.8 },
  climate: {
    sun: { az: 125, el: 58, color: [1.0, 0.95, 0.85], intensity: 3.5, lat: 25, dec: 10, hour: 9.5 },
    sky: { turbidity: 4.5, rayleigh: 1.3, mie: 0.006, mieG: 0.8, zenith: [0.1, 0.17, 0.36], horizon: [0.64, 0.62, 0.58] },
    fog: { color: [0.78, 0.76, 0.72], density: 0.0005, height: 0.012 },
    exposure: 0.5,
    damp: 0.55,     // the monsoon darkens and greens the brick's foot and streaks the plaster
    waterline: 0.3,
    wind: [0.3, 0.2],
    weather: [
      { id: 'hazy', weight: 4, clouds: 0.2, cloudDensity: 0.4, sun: 0.95, fog: 1.3 },
      { id: 'monsoon-cloud', weight: 1.5, clouds: 0.7, cloudDensity: 0.7, sun: 0.7, fog: 1.4 },
    ],
  },
};
void TANKS; void inRect; void MONASTERIES; void TEMPLES;
