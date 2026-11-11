// Qin Xianyang — the ground: the loess plain of Guanzhong, pale yellow-brown and dusty; the imperial road across it with its pines
// at the edges; packed earth in the streets; millet and wheat fields beyond the town; elms, jujubes and mulberries in the yards;
// the earth mound over Pit 1; the dry continental sky of the Wei valley (docs/settlements/qin-xianyang.md §3).
// Pure (used by the relief, the collision and the plant workers).
import { RADIUS, PIT, ROOF, RAMP, ROAD, PINE_Z, MARKET, FORECOURT, TERRACE, WS_Z, WS_X, height, inRect, inLot, lots, streets } from './layout.js';

function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
const onRoad = (x, z) => z > ROAD.z0 - 1 && z < ROAD.z1 + 1;
const onStreet = (x, z) => streets().some((r) => inRect(r, x, z));
function cover(x, z) {
  const c = { sand: 0.35, grass: 0.1, rock: 0, soil: 0.55, fields: 0, dry: 0.8, warmth: 0.8, red: 0.2, road: 0, snow: 0, forest: 0 };
  if (inRect([PIT.x0 - 8, PIT.z0 - 8, PIT.x1 + RAMP.len + 8, PIT.z1 + 8], x, z)) { c.road = 0.5; c.soil = 0.8; c.sand = 0.2; return c; }
  if (onRoad(x, z) || inRect(FORECOURT, x, z, 2) || inRect(MARKET, x, z, 3)) { c.road = 0.9; c.sand = 0.3; c.soil = 0.2; return c; }
  if (inRect([TERRACE.x0 - TERRACE.rim - 6, TERRACE.z0 - TERRACE.rim - 6, TERRACE.x1 + TERRACE.rim + 6, TERRACE.z1 + TERRACE.rim + 6], x, z) || onStreet(x, z) || inLot(x, z, 0.5)) { c.road = 0.8; c.sand = 0.25; return c; }
  if (inRect([WS_X[0] - 6, WS_Z - 40, WS_X[1] + 6, WS_Z + 40], x, z)) { c.road = 0.6; c.soil = 0.7; return c; }
  const r = Math.hypot(x, z);
  if (r > RADIUS - 130) { c.fields = 0.75; c.grass = 0.2; c.dry = 0.5; return c; }
  c.sand = 0.4 + 0.2 * hash2(x * 0.07, z * 0.07);
  return c;
}
const water = () => false;
const waterLevel = () => -Infinity;
const fromWater = () => 60;
/** Plants per 100 m²: Chinese pines every 3 zhang along the road's edges, elms and jujubes in the yards, mulberries in the gardens, fields beyond. */
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 6) return null;
  const dz = Math.abs(Math.abs(z) - PINE_Z);
  if (dz < 1.4 && !inRect(MARKET, x, z, 4)) return { chinese_pine: 5, grass_dry: 6 };
  if (onRoad(x, z) || onStreet(x, z) || inRect(FORECOURT, x, z, 3) || inRect(MARKET, x, z, 4)) return null;
  if (inRect([PIT.x0 - 8, PIT.z0 - 8, PIT.x1 + RAMP.len + 8, PIT.z1 + 8], x, z)) return inRect([PIT.x0 - 6, PIT.z0 - 6, ROOF.bareX + 16, PIT.z1 + 6], x, z) ? { grass_dry: 14 } : null;
  if (inRect([TERRACE.x0 - TERRACE.rim - 6, TERRACE.z0 - TERRACE.rim - 6, TERRACE.x1 + TERRACE.rim + 6, TERRACE.z1 + TERRACE.rim + 6], x, z)) return null;
  if (inRect([WS_X[0] - 6, WS_Z - 40, WS_X[1] + 6, WS_Z + 40], x, z) && inLot(x, z, 0.5)) return null;
  if (inLot(x, z, 0.5)) { const l = lots().find((q) => inRect(q.rect, x, z)); return l && l.kind === 'garden' ? { mulberry: 1.4, jujube: 0.9, grass: 6 } : null; }
  if (r > RADIUS - 130) return { poplar: 0.05, elm: 0.02, grass_dry: 3 };
  if (hash2(x * 0.3, z * 0.3) < 0.2) return { elm: 0.06, jujube: 0.06, grass_dry: 10 };
  return { grass_dry: 8 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { chinese_pine: 5, mulberry: 1.4, jujube: 0.9, elm: 0.06, poplar: 0.05 },
  climate: {
    sun: { az: 150, el: 56, color: [1.0, 0.95, 0.85], intensity: 3.7, lat: 34.4, dec: 5, hour: 10 },
    sky: { turbidity: 3.0, rayleigh: 1.0, mie: 0.005, mieG: 0.8, zenith: [0.1, 0.18, 0.4], horizon: [0.7, 0.68, 0.6] },
    fog: { color: [0.82, 0.77, 0.66], density: 0.00034, height: 0.012 },
    exposure: 0.46,
    wind: [0.5, 0.2],
    damp: 0.12,
    weather: [
      { id: 'clear', weight: 4, clouds: 0.1, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'hazy', weight: 2, clouds: 0.2, cloudDensity: 0.35, sun: 0.85, fog: 1.8, fogColor: [0.84, 0.76, 0.62] },
      { id: 'cloudy', weight: 1, clouds: 0.6, cloudDensity: 0.6, sun: 0.6, fog: 1.2 },
    ],
  },
};
