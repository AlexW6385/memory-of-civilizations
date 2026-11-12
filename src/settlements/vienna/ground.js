// Vienna — the ground (docs/settlements/vienna.md §9): granite setts, asphalt and flagstone in the streets, lawns and gravel in the
// Karlsplatz and the garden behind the Secession, the planes and chestnuts of the Ring, the walled Wien in its channel; the bright,
// changeable continental light of a Danube spring, soot on the stucco.

import { RADIUS, WIEN, KARLSPLATZ, SQUARE, SEC_COURT, OPERA, height, inWater, fromWater, inRect, inLot, onStreet, nearPath, GROUND } from './layout.js';

function cover(x, z, h) {
  const c = { sand: 0, grass: 0.1, rock: 0, soil: 0.15, fields: 0, dry: 0.2, warmth: 0.4, red: 0.05, road: 0.92, snow: 0, forest: 0 };
  if (h < -0.5) { c.road = 0.2; c.soil = 0.6; c.rock = 0.4; return c; }
  if (inRect(KARLSPLATZ, x, z) || inRect(SQUARE, x, z)) { if (nearPath(x, z, 0.2)) { c.road = 0.75; c.grass = 0.1; return c; } c.grass = 0.9; c.road = 0; c.soil = 0.15; return c; }
  if (inRect(SEC_COURT, x, z) || inRect(OPERA, x, z, 6)) { c.road = 0.95; return c; }
  if (onStreet(x, z) || inLot(x, z, 0.3)) { c.road = 0.95; c.soil = 0.05; c.grass = 0.02; return c; }
  if (z > 255 || Math.hypot(x, z) > RADIUS - 40) { c.road = 0.5; c.grass = 0.3; return c; }
  return c;
}
const water = (x, z, y) => inWater(x, z) && y < WIEN.water + 0.3;
const waterLevel = (x, z) => (inWater(x, z) ? WIEN.water : -Infinity);
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 35 || inWater(x, z) || inLot(x, z, 1.5) || height(x, z) < -0.5) return null;
  // the Ring's two promenades: planes and chestnuts (planes shown) in rows under which the benches stand
  if (Math.abs(x) < RADIUS - 30 && ((z > -253.4 && z < -249.6) || (z > -210.4 && z < -206.6))) return Math.abs(((x + 9) % 12 + 12) % 12 - 6) < 1.2 ? { plane_tree: 0.5 } : null;
  if (onStreet(x, z, 0)) return null;
  if (inRect(SEC_COURT, x, z, 1) || inRect([-31, -54, 31, -12], x, z, 3)) return null;
  if (inRect(OPERA, x, z, 4) || inRect([196, -40, 250, 20], x, z, 0)) return null;
  if (inRect(SQUARE, x, z, -1)) return nearPath(x, z, 1.2) ? null : { plane_tree: 0.012, grass: 14 };
  if (inRect(KARLSPLATZ, x, z, -1)) return nearPath(x, z, 1.4) || inRect([86, -30, 110, 14], x, z) ? null : { elm: 0.008, plane_tree: 0.006, grass: 14 };
  return null;
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater, rim: 0,
  maxDensity: { plane_tree: 0.5, elm: 0.008 },
  climate: {
    sun: { az: 160, el: 46, color: [1.0, 0.96, 0.9], intensity: 3.3, lat: 48, dec: 10, hour: 11 },
    sky: { turbidity: 3.2, rayleigh: 1.08, mie: 0.007, mieG: 0.78, zenith: [0.09, 0.16, 0.38], horizon: [0.64, 0.68, 0.74] },
    fog: { color: [0.78, 0.79, 0.82], density: 0.0004, height: 0.012 },
    exposure: 0.5,
    wind: [0.7, 0.3],
    waterline: WIEN.water,   // the Wien's stain on its granite walls (src/engine/materials.js)
    damp: 0.55,              // a continental spring: soot and streaks on the stucco, moss only on the Wien's walls
    weather: [
      { id: 'clear', weight: 3, clouds: 0.2, cloudDensity: 0.35, sun: 1.0, fog: 1 },
      { id: 'cloud', weight: 2.5, clouds: 0.55, cloudDensity: 0.55, sun: 0.85, fog: 1.1 },
      { id: 'shower', weight: 1.2, clouds: 0.9, cloudDensity: 0.85, sun: 0.4, fog: 1.7, rain: 0.5 },
    ],
  },
};
void GROUND;
