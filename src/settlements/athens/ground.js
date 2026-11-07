// Athens — the ground: the grey-white limestone of the Acropolis and the Areopagus, thin red soil,
// dry grass and thyme; olives and cypresses in the gardens, a plane tree or two in the Agora; the
// paved Panathenaic Way; the clear Attic light.

import { RADIUS, ACRO, AGORA, height, acroE, onWay, pathAt, RAMP, inRect, inLot, SLOPE, THEATRE, ODEION } from './layout.js';

function cover(x, z, h, ny) {
  const c = { sand: 0.2, grass: 0.25, rock: 0, soil: 0.55, fields: 0, dry: 0.8, warmth: 0.75, red: 0.45, road: 0, snow: 0, forest: 0 };
  if (acroE(x, z) < 1) { c.rock = 0.85; c.sand = 0.15; return c; }
  if (ny < 0.8) { c.rock = 0.8; c.soil = 0.2; return c; }
  if (onWay(x, z) || pathAt(x, z, RAMP)[0] < 6 || inRect(AGORA, x, z)) { c.road = 0.75; return c; }
  if (Math.hypot(x, z) > RADIUS - 60) { c.fields = 0.4; c.grass = 0.4; return c; }
  return c;
}
const water = () => false, waterLevel = () => -Infinity, fromWater = () => 1e4;
// the Agora's buildings and booths, which the trees keep clear of: the Painted Stoa, the Stoa of Zeus with its wings,
// South Stoa I, the booths of the market (src/settlements/athens/plan.js)
const AGORA_BUILT = [[-252, -237.6, -204, -225], [-292, -197, -273, -150], [-262, -124.89, -219, -110], [-242, -199, -178, -140]];
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || acroE(x, z) < 1.05 || onWay(x, z, 1) || pathAt(x, z, RAMP)[0] < 8 || inLot(x, z, 1)) return null;
  // the plane trees Kimon planted in the Agora (Plutarch, Cimon 13.8): rows along its edges, its middle left open
  if (inRect(AGORA, x, z)) return !inRect(AGORA, x, z, -9) && !AGORA_BUILT.some((r) => inRect(r, x, z, 3)) && Math.hypot(x + 280, z + 133) > 13 && !onWay(x, z, 4) ? { plane_tree: 0.03 } : null;
  if (inRect([-291, -107, -278, -93], x, z, 2)) return null;                        // Simon's house
  // the south slope: nothing in the theatre, the Odeion or the sanctuary's buildings; dry grass between
  if (inRect(SLOPE, x, z, 4)) return Math.hypot(x - THEATRE.c[0], z - THEATRE.c[1]) < 48 || inRect(ODEION.rect, x, z, 3) || inRect([40, 145, 105, 185], x, z) ? null : { grass_dry: 4 };
  if (acroE(x, z) < 1.7) return { grass_dry: 6, maquis: 0.1 };
  return { olive: 0.06, cypress: 0.02, grass_dry: 10 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { olive: 0.06, cypress: 0.02, plane_tree: 0.03, maquis: 0.1 },
  climate: {
    sun: { az: 140, el: 55, color: [1.0, 0.96, 0.88], intensity: 3.6, lat: 38, dec: 12, hour: 10 },
    sky: { turbidity: 2.4, rayleigh: 1.0, mie: 0.004, mieG: 0.78, zenith: [0.07, 0.16, 0.42], horizon: [0.6, 0.66, 0.72] },
    fog: { color: [0.78, 0.8, 0.82], density: 0.00025, height: 0.01 },
    exposure: 0.48,
    wind: [0.6, 0.3],
    weather: [
      { id: 'clear', weight: 5, clouds: 0.1, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'cloud', weight: 1.5, clouds: 0.45, cloudDensity: 0.5, sun: 0.85, fog: 1.1 },
    ],
  },
};
