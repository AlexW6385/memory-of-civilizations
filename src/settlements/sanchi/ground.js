// Sanchi — the ground: the sandstone hill with dry grass and scrub, the summit's paved terraces,
// the red-brown plain with fields, neem, banyan and palms round the village; the hot, hazy sky
// of central India before the rains.

import { RADIUS, TOP, VOTIVE, PATH, SUMMIT, STAIR, STUPA2, TEMPLE40, VIHARA2, TANK, HALL, SHRINE, PLAZA, NORTH, STREETS, height, out, inLot, inRect, onStreet, yards, tankD, inTank, inTankWater } from './layout.js';

function cover(x, z, h, ny) {
  const c = { sand: 0.2, grass: 0.3, rock: 0, soil: 0.5, fields: 0, dry: 0.75, warmth: 0.85, red: 0.5, road: 0, snow: 0, forest: 0 };
  if (out(x, z) === 0) { c.road = 0.5; c.grass = 0.3; return c; }
  if (inRect(STUPA2.terrace, x, z, 3) || (Math.abs(x - STUPA2.c[0]) < 2.5 && z < STUPA2.terrace[1] && z > -60)) { c.road = 0.6; c.grass = 0.25; return c; }
  if (Math.abs(x - STAIR.x) < STAIR.w + 1 && z > STAIR.z0 - 2 && z < STAIR.z1 + 4) { c.road = 0.9; c.grass = 0; return c; }
  if (inRect(PLAZA, x, z, 1) || inRect(HALL, x, z, 2) || inRect([SHRINE.c[0] - 5, SHRINE.c[1] - 5, SHRINE.c[0] + 5, SHRINE.c[1] + 8], x, z)) { c.road = 0.75; c.grass = 0.05; return c; }
  if (inRect(NORTH.plaza, x, z, 1) || inRect(NORTH.hall, x, z, 2)) { c.road = 0.75; c.grass = 0.05; return c; }
  if (onStreet(x, z, 0.8)) { c.road = 0.85; c.grass = 0; c.sand = 0.35; return c; }
  if (yards().some((y) => inRect(y.rect, x, z, 0))) { c.road = 0.3; c.soil = 0.65; c.grass = 0.1; return c; }
  if (h < -0.4) { c.soil = 0.7; c.grass = 0.25; return c; }
  if (ny < 0.8) { c.rock = 0.6; c.soil = 0.4; return c; }
  if (Math.abs(x - PATH.x) < PATH.w && z < -SUMMIT.half[1]) { c.road = 0.8; return c; }
  if (Math.hypot(x, z) > 230) { c.fields = 0.7; c.grass = 0.2; return c; }
  return c;
}
function water(x, z, y) { return inTankWater(x, z) && y < TANK.level + 0.3; }
function waterLevel(x, z) { return inTankWater(x, z) ? TANK.level : -Infinity; }
function fromWater(x, z) { return Math.max(-5, Math.min(40, tankD(x, z))); }
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inLot(x, z, 1) || inRect(STUPA2.terrace, x, z, 4) || (Math.abs(x - STUPA2.c[0]) < 3.5 && z < STUPA2.terrace[1] && z > -62) || (Math.abs(x - PATH.x) < PATH.w + 1 && z < -SUMMIT.half[1] + 5)) return null;
  if (inTank(x, z) || (Math.abs(x - STAIR.x) < STAIR.w + 2 && z > STAIR.z0 - 4 && z < STAIR.z1 + 6) || inRect(PLAZA, x, z, 2) || inRect(HALL, x, z, 3) || inRect([SHRINE.c[0] - 6, SHRINE.c[1] - 6, SHRINE.c[0] + 6, SHRINE.c[1] + 9], x, z)) return null;
  if (onStreet(x, z, 1.6) || inRect(NORTH.plaza, x, z, 3) || inRect(NORTH.hall, x, z, 3) || (Math.abs(x) < 14 && z < -150 && z > -196)) return null;
  const d = out(x, z);
  if (d === 0) {
    // on the summit, clear of the monuments and the ways between them: dry grass, a few neem and a pipal (a fig)
    if (VOTIVE.some(([vx, vz]) => Math.hypot(x - vx, z - vz) < 9) || inRect([30, -2, 68, 36], x, z, 4) || Math.hypot(x, z) < 34 || Math.hypot(x - 62, z + 40) < 16 || inRect([30, -2, 68, 36], x, z) || inRect(TEMPLE40.rect, x, z, 5) || inRect(VIHARA2, x, z, 4) || (x < -34 && x > -76 && z > 2 && z < 46 && Math.abs(z - 17) < 4) || Math.abs(x) < 8 || (Math.abs(z + 28) < 5 && x > 0 && x < 66) || Math.abs(x - 30) < 5 || (z > 40 && z < 95 && Math.abs(x) < 14)) return null;
    return { grass_dry: 9, neem: 0.015, fig: 0.01, oleander: 0.05 };
  }
  if (d < 30) return { grass_dry: 10, maquis: 0.08, ...(d > 12 ? { acacia: 0.01 } : {}) };
  // the tank: reeds at its margin, pipal and neem on its banks, date palms
  const dt = tankD(x, z);
  if (dt < 7) return { reeds: 10, grass: 14 };
  if (dt < 24) return { fig: 0.02, neem: 0.03, date_palm: 0.03, grass_dry: 14 };
  if (yards().some((y) => inRect(y.rect, x, z, 1))) return { neem: 0.05, banyan: 0.006, grass_dry: 3 };
  // the village's lanes: neem and a banyan at the crossings, shade; between the rows teak, jujube
  if (inLot(x, z, 16)) return { neem: 0.08, date_palm: 0.05, banyan: 0.012, jujube: 0.02, teak: 0.01, grass_dry: 8 };
  if (Math.hypot(x, z) > 215) return { neem: 0.012, acacia: 0.008, jujube: 0.006, grass: 12 };
  return { neem: 0.015, grass: 12 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { neem: 0.08, date_palm: 0.05, banyan: 0.012, maquis: 0.08, fig: 0.02, oleander: 0.05, acacia: 0.01, jujube: 0.02, teak: 0.01 },
  climate: {
    sun: { az: 130, el: 60, color: [1.0, 0.95, 0.85], intensity: 3.5, lat: 23, dec: 10, hour: 10 },
    sky: { turbidity: 4.5, rayleigh: 1.3, mie: 0.006, mieG: 0.8, zenith: [0.1, 0.17, 0.36], horizon: [0.64, 0.62, 0.58] },
    fog: { color: [0.78, 0.76, 0.72], density: 0.0005, height: 0.012 },
    exposure: 0.5,
    damp: 0.35,     // a dry climate: the monsoon only darkens the sandstone's foot and the north side
    wind: [0.3, 0.2],
    weather: [
      { id: 'hazy', weight: 4, clouds: 0.2, cloudDensity: 0.4, sun: 0.95, fog: 1.3 },
      { id: 'pre-monsoon', weight: 1.5, clouds: 0.6, cloudDensity: 0.7, sun: 0.8, fog: 1.2 },
    ],
  },
};
