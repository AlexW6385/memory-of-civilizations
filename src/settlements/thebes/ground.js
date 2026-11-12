// New Kingdom Thebes — the ground: the flat alluvial plain on the Nile's east bank, packed earth and dust in the
// town, the paved temple, the river with reeds and papyrus on its banks, the lake sunk in its stone;
// palms in the gardens and along the water; the hot dry sky of Upper Egypt (docs/settlements/thebes.md §3, §10).
// Pure (used by the relief, the collision and the plant workers).

import { RADIUS, RIVER, AVENUE, ENCL, LAKE, LAKE_Y, QUAY, MARKET, height, inRiver, inLake, inRect, inLot, lots } from './layout.js';

function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function cover(x, z, h, ny) {
  const c = { sand: 0.55, grass: 0, rock: 0, soil: 0.4, fields: 0, dry: 1, warmth: 1, red: 0.25, road: 0, snow: 0, forest: 0 };
  if (inRect(ENCL, x, z)) { c.road = 0.9; c.sand = 0.3; c.soil = 0.1; return c; }
  if (h < -1) { c.soil = 0.9; c.sand = 0.1; c.dry = 0.4; return c; }
  if (inRect(MARKET, x, z) || inRect([QUAY.x, QUAY.z0, QUAY.x + QUAY.top, QUAY.z1], x, z)) { c.road = 0.8; c.sand = 0.2; return c; }
  if (x < -320) { c.fields = 0.7; c.grass = 0.2; c.dry = 0.4; return c; }
  if (x > 300 || z < -300) { c.fields = 0.5; c.sand = 0.3; c.dry = 0.6; return c; }
  c.sand = 0.5 + 0.2 * hash2(x * 0.07, z * 0.07);
  return c;
}
const water = (x, z, y) => (inRiver(x, z) && y < RIVER.level + 0.3) || (inLake(x, z) && y < LAKE_Y + 0.3);
const waterLevel = (x, z) => (inLake(x, z, 1) ? LAKE_Y : inRiver(x, z) ? RIVER.level : -Infinity);
const fromWater = (x, z) => (inRiver(x, z) || inLake(x, z) ? -3 : Math.max(-5, Math.min(40, Math.min(Math.abs(x - RIVER.x) - 35, 30))));
/** Plants per 100 m²: papyrus and reeds on the river's unwalled banks, palms in the gardens, along the lanes' ends and on the plain. */
function planting(x, z, p) {
  if (Math.hypot(x, z) > RADIUS - 6 || inRiver(x, z)) return null;
  // the avenue and the open way to the gateway (the paved way 17 m wide, the gateway's forecourt before it) are kept clear: no tree stands in the view down the rams to the pylon
  if (x > AVENUE.x0 - 6 && x < ENCL[0] + 1 && Math.abs(z) < 14.5 && !(Math.abs(z) > 9.4 && x < ENCL[0] - 9)) return null;
  // the temple's gardens: a grove of date palms round the sacred lake, a row along the quay's promenade
  if (inRect(LAKE, x, z, 11) && !inRect(LAKE, x, z, 6.5)) return { date_palm: 1.4, tamarisk: 0.1 };
  // the avenue's borders: a row of date palms and tamarisks outside the rams, the grove round the great wall
  if (x > AVENUE.x0 - 4 && x < ENCL[0] - 2 && Math.abs(z) > 9.4 && Math.abs(z) < 14) return { date_palm: 1.5, tamarisk: 0.25 };
  if (inRect(ENCL, x, z, 11) && !inRect(ENCL, x, z, 4.5)) return { date_palm: 1.3, sycamore_fig: 0.15, tamarisk: 0.2 };
  const qx = x - (QUAY.x + QUAY.top);
  if (qx > -0.5 && qx < 2.2 && z > QUAY.z0 + 6 && z < QUAY.z1 - 6) return { date_palm: 1.0 };
  if (inRect(ENCL, x, z, 0) && inLot(x, z, 0)) { const l = lots().find((q) => inRect(q.rect, x, z)); return l && l.kind === 'garden' ? { date_palm: 2.0, sycamore_fig: 0.2, tamarisk: 0.3 } : null; }
  if (inLake(x, z, 3) || inRect(ENCL, x, z, 4)) return null;
  const bank = Math.abs(x - RIVER.x) - RIVER.w / 2;
  if (bank > -6 && bank < 8 && (z < QUAY.z0 - 6 || z > QUAY.z1 + 6)) return { papyrus: 8, reeds: 10, tamarisk: 0.1 };
  if (inLot(x, z, 0.5)) { const l = lots().find((q) => inRect(q.rect, x, z)); return l && l.kind === 'garden' ? { date_palm: 1.6, sycamore_fig: 0.12, tamarisk: 0.3 } : null; }
  if (inRect(MARKET, x, z, 2) || inRect([QUAY.x - 2, QUAY.z0, QUAY.x + QUAY.top + 2, QUAY.z1], x, z)) return null;
  if (x < -320) return { date_palm: 0.8, halfa: 4 };
  if (hash2(x * 0.3, z * 0.3) < 0.18) return { date_palm: 0.25, acacia: 0.04, halfa: 1.5 };
  return null;
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { date_palm: 1.6, sycamore_fig: 0.12, acacia: 0.04 },
  climate: {
    sun: { az: 140, el: 62, color: [1.0, 0.94, 0.82], intensity: 3.9, lat: 25.7, dec: 5, hour: 10 },
    sky: { turbidity: 3.4, rayleigh: 1.05, mie: 0.006, mieG: 0.82, zenith: [0.12, 0.2, 0.38], horizon: [0.68, 0.64, 0.56] },
    fog: { color: [0.84, 0.77, 0.66], density: 0.00032, height: 0.012 },
    exposure: 0.45,
    wind: [0.5, 0.2],
    damp: 0.05,
    waterline: RIVER.level,
    weather: [
      { id: 'clear', weight: 5, clouds: 0.03, cloudDensity: 0.2, sun: 1.0, fog: 0.9 },
      { id: 'hazy', weight: 1.5, clouds: 0.08, cloudDensity: 0.3, sun: 0.9, fog: 1.7, fogColor: [0.86, 0.76, 0.62] },
      { id: 'khamsin', weight: 0.6, clouds: 0.2, cloudDensity: 0.4, sun: 0.62, fog: 4.2, fogColor: [0.82, 0.66, 0.46] },
    ],
  },
};
