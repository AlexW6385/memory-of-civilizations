// Nalanda — the ground: flat trampled earth and brick paving in the compound, red-brown plain round it with groves of
// mango-stand-ins (neem, pipal, palm) and fields, the brick-edged tanks; the hot hazy sky of the Gangetic plain with its monsoon.
import { RADIUS, TANKS, LEVEL, height, tankD, inTankWater, inTank, nearCore, inLot, inRect, MONASTERIES, TEMPLES } from './layout.js';

function cover(x, z, h) {
  const c = { sand: 0.15, grass: 0.35, rock: 0, soil: 0.5, fields: 0, dry: 0.5, warmth: 0.8, red: 0.45, road: 0, snow: 0, forest: 0 };
  if (nearCore(x, z, 0.5)) { c.road = 0.7; c.grass = 0.1; return c; }
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
function inView(x, z) { return Math.hypot(x - EYE[0], z - EYE[1]) < 60 && x > -75 && x < 40 && z > -10; }
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inTank(x, z, 1) || nearCore(x, z, 2) || inLot(x, z, 1)) return null;
  if (inView(x, z)) return { grass: 9 };
  if (tankD(x, z) < 8) return { reeds: 3, grass: 10 };
  // the mango groves of the monasteries, pipal by the tanks, tala palms on the bunds
  if (tankD(x, z) < 24) return { fig: 0.05, neem: 0.05, date_palm: 0.05, grass_dry: 7 };
  if (x < -70 || x > 124 || z < -130) return { neem: 0.12, fig: 0.03, banyan: 0.012, date_palm: 0.05, grass_dry: 6 };
  return { neem: 0.03, grass_dry: 9 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { neem: 0.12, fig: 0.05, banyan: 0.012, date_palm: 0.05 },
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
