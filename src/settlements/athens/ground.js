// Athens — the ground: the grey-white limestone of the Acropolis and the Areopagus, thin red soil,
// dry grass and thyme; olives and cypresses in the gardens, a plane tree or two in the Agora; the
// paved Panathenaic Way; the clear Attic light.

import { RADIUS, ACRO, AGORA, height, acroE, onWay, pathAt, RAMP, inRect, inLot } from './layout.js';

function cover(x, z, h, ny) {
  const c = { sand: 0.2, grass: 0.25, rock: 0, soil: 0.55, fields: 0, dry: 0.8, warmth: 0.75, red: 0.45, road: 0, snow: 0, forest: 0 };
  if (acroE(x, z) < 1) { c.rock = 0.85; c.sand = 0.15; return c; }
  if (ny < 0.8) { c.rock = 0.8; c.soil = 0.2; return c; }
  if (onWay(x, z) || pathAt(x, z, RAMP)[0] < 6 || inRect(AGORA, x, z)) { c.road = 0.75; return c; }
  if (Math.hypot(x, z) > RADIUS - 60) { c.fields = 0.4; c.grass = 0.4; return c; }
  return c;
}
const water = () => false, waterLevel = () => -Infinity, fromWater = () => 1e4;
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || acroE(x, z) < 1.05 || onWay(x, z, 1) || pathAt(x, z, RAMP)[0] < 8 || inLot(x, z, 1)) return null;
  if (inRect(AGORA, x, z)) return { plane_tree: 0.008 };
  if (acroE(x, z) < 1.7) return { grass_dry: 6, maquis: 0.1 };
  return { olive: 0.06, cypress: 0.02, grass_dry: 10 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { olive: 0.06, cypress: 0.02, plane_tree: 0.008, maquis: 0.1 },
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
