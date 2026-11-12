// Babylon — the ground: the flat alluvium, the baked-brick paving of the Processional Way, dusty
// lanes, date palms in gardens and along the Euphrates, reeds on its banks; the hard, hazy light.

import { RADIUS, WAY, WALL_Z, PALACE, PRECINCT, ESAGILA, RIVER, BRIDGE, MARKET, riverX, height, inRiver, onWay, inRect, inLot, inQuay, onLane, yards, lots } from './layout.js';

function cover(x, z, h) {
  const c = { sand: 0.5, grass: 0.05, rock: 0, soil: 0.45, fields: 0, dry: 0.9, warmth: 0.85, red: 0.2, road: 0, snow: 0, forest: 0 };
  if (onWay(x, z) || [PALACE, PRECINCT, ESAGILA].some((r) => inRect(r, x, z))) { c.road = 0.8; return c; }
  if (h < -1) { c.soil = 0.8; c.grass = 0.2; return c; }
  if (onLane(x, z)) { c.road = 0.55; c.grass = 0; c.sand = 0.6; }   // beaten earth between the houses
  return c;
}
function water(x, z, y) { return inRiver(x, z) && y < RIVER.level + 0.3; }
function waterLevel(x, z) { return inRiver(x, z) ? RIVER.level : -Infinity; }
function fromWater(x, z) { return inRiver(x, z) ? -3 : Math.max(-5, Math.min(40, height(x, z) - RIVER.level)); }
function yardAt(x, z) { for (const y of yards()) if (inRect(y.rect, x, z, -0.6)) return y; return null; }
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inRiver(x, z) || onWay(x, z, 2) || [PALACE, PRECINCT, ESAGILA].some((r) => inRect(r, x, z, 4)) || inQuay(x, z, 1.5)) return null;
  const yd = yardAt(x, z);
  if (yd) return yd.kind === 'garden' ? { date_palm: 1.7, grass_dry: 14, tamarisk: 0.3 } : null;       // gardens inside their walls
  if (lots().length && inLot(x, z, 1)) return null;
  if (Math.abs(z - BRIDGE.z) < 8 && Math.abs(x - riverX(z)) < 60) return null;   // the bridgeheads and the road onto the bridge
  if (inRect(MARKET, x, z, 2) || onLane(x, z, 0.5)) return null;                 // the market, the lanes
  if (height(x, z) < -1) return { reeds: 15, date_palm: 0.05, tamarisk: 0.1 };
  const dr = x - riverX(z);
  // the banks: Euphrates poplar and tamarisk at the water, date orchards behind them (Psalm 137's willows are Populus euphratica)
  if (Math.abs(dr) < 70) return { poplar: 0.35, tamarisk: 0.55, date_palm: dr < 0 ? 1.0 : 0.7, grass_dry: 8 };
  if (x < -200) return { date_palm: 1.1, tamarisk: 0.2, grass_dry: 8 };
  // the approach outside the inner wall: date palms and tamarisk in groves on either hand of the Way, their crowns rising over the glazed walls
  if (z < WALL_Z - 18 && Math.abs(x - WAY.x) < 46) return Math.abs(x - WAY.x) > 14 ? { date_palm: 0.9, tamarisk: 0.35, grass_dry: 6 } : null;
  return { date_palm: 0.12, tamarisk: 0.06 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { date_palm: 1.7, reeds: 15, poplar: 0.35, tamarisk: 0.55 },
  climate: {
    sun: { az: 140, el: 58, color: [1.0, 0.95, 0.85], intensity: 3.7, lat: 32, dec: 10, hour: 10 },
    sky: { turbidity: 4.0, rayleigh: 1.2, mie: 0.007, mieG: 0.8, zenith: [0.1, 0.17, 0.36], horizon: [0.68, 0.66, 0.62] },
    fog: { color: [0.8, 0.77, 0.72], density: 0.0004, height: 0.01 },
    exposure: 0.47,
    wind: [0.6, 0.2],
    weather: [
      { id: 'clear', weight: 5, clouds: 0.08, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'dusty', weight: 1.5, clouds: 0.1, cloudDensity: 0.3, sun: 0.8, fog: 2.0 },
    ],
  },
};
