// Khajuraho — the ground: lawns and packed earth round the temples, the red-brown plain of
// Bundelkhand with fields, mango, neem and palms, the tank with its ghats; the hot, hazy sky.

import { RADIUS, TANK, height, inTank, inTankWater, tankD, nearTemple, inLot, onStreet, yards, inRect } from './layout.js';

function cover(x, z, h) {
  const c = { sand: 0.2, grass: 0.35, rock: 0, soil: 0.45, fields: 0, dry: 0.65, warmth: 0.85, red: 0.5, road: 0, snow: 0, forest: 0 };
  if (nearTemple(x, z, 4)) { c.road = 0.6; return c; }
  if (onStreet(x, z, 1.2)) { c.road = 0.85; c.grass = 0; c.sand = 0.35; return c; }
  if (yards().some((y) => inRect(y.rect, x, z, 0))) { c.road = 0.3; c.soil = 0.6; return c; }
  if (h < -0.5) { c.soil = 0.7; c.grass = 0.3; return c; }
  if (Math.hypot(x, z) > 270) { c.fields = 0.7; c.grass = 0.2; return c; }
  return c;
}
function water(x, z, y) { return inTankWater(x, z) && y < TANK.level + 0.3; }
function waterLevel(x, z) { return inTankWater(x, z) ? TANK.level : -Infinity; }
function fromWater(x, z) { return Math.max(-5, Math.min(40, tankD(x, z))); }
// the arrival's view of Kandariya Mahadeva (src/planet/arrivals.js) kept free of the oleander clumps:
// the wedge from the arrival point to the temple's two ends, as far as its terrace
const EYE = [-9.5, -60], ENDS = [[-42, -73], [-42, -47]];
const ang = (x, z) => Math.atan2(z - EYE[1], x - EYE[0]);
const A0 = Math.min(...ENDS.map(([x, z]) => ang(x, z))) - 0.08, A1 = Math.max(...ENDS.map(([x, z]) => ang(x, z))) + 0.08;
function inView(x, z) { const a = ang(x, z); return a > A0 && a < A1 && Math.hypot(x - EYE[0], z - EYE[1]) < 50; }
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inTank(x, z) || nearTemple(x, z, 6) || inLot(x, z, 1)) return null;
  if (inView(x, z)) return { grass: 25 };
  if (onStreet(x, z, 2)) return null;
  const yd = yards().find((y) => inRect(y.rect, x, z, 0));
  if (yd) return { neem: 0.03, banyan: 0.004, grass: 4 };
  if (tankD(x, z) < 8) return { reeds: 10, grass: 20 };
  // oleander (karavira, its flowers offered at the shrines) in clumps round the terraces; a pipal (a fig) or two by the tank
  if (nearTemple(x, z, 16)) return { oleander: 0.5, grass: 22 };
  if (tankD(x, z) < 22) return { fig: 0.03, neem: 0.02, grass: 20 };
  if (x > 100) return { neem: 0.06, banyan: 0.01, date_palm: 0.04, grass: 14 };
  return { neem: 0.02, grass: 25 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { neem: 0.06, banyan: 0.01, date_palm: 0.04, oleander: 0.5, fig: 0.03 },
  climate: {
    sun: { az: 120, el: 55, color: [1.0, 0.92, 0.8], intensity: 3.6, lat: 25, dec: 8, hour: 9.5 },
    sky: { turbidity: 4.5, rayleigh: 1.3, mie: 0.006, mieG: 0.8, zenith: [0.1, 0.17, 0.36], horizon: [0.64, 0.62, 0.58] },
    fog: { color: [0.8, 0.75, 0.66], density: 0.00035, height: 0.012 },
    exposure: 0.56,
    damp: 0.35,     // semi-arid Bundelkhand: the monsoon only streaks the stone and greens its shaded foot
    wind: [0.3, 0.2],
    weather: [
      { id: 'hazy', weight: 4, clouds: 0.2, cloudDensity: 0.4, sun: 0.95, fog: 1.3 },
      { id: 'monsoon-cloud', weight: 1.5, clouds: 0.7, cloudDensity: 0.7, sun: 0.7, fog: 1.4 },
    ],
  },
};
