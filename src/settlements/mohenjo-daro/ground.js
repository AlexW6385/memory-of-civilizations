// Mohenjo-daro — the ground (docs/settlements/mohenjo-daro.md §3): the flat silt plain of the Indus, packed mud in the streets and lanes, the brick paving of the
// market place, the river on the east in its bed with reeds and tamarisk on its banks, fields of wheat and barley beyond the town with
// acacia, jujube and date palms; the hot, dry, hazy sky of Sindh.
// Pure (used by the relief, the collision and the plant workers).

import { RADIUS, MOUND, PLAZA, QUAY, RIVER, riverX, height, inRiver, inRect, inLot, streets, lanes } from './layout.js';

function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
const TOWN = [-262, -228, 262, 244];
const onStreet = (x, z, m = 0) => streets().some((r) => inRect(r, x, z, m)) || lanes().some((r) => inRect(r, x, z, m));
function cover(x, z, h) {
  const c = { sand: 0.5, grass: 0.04, rock: 0, soil: 0.5, fields: 0, dry: 0.9, warmth: 1, red: 0.2, road: 0, snow: 0, forest: 0 };
  if (h < -0.8) { c.soil = 0.9; c.sand = 0.1; c.dry = 0.3; return c; }
  if (Math.hypot(x, z) > RADIUS - 30) { c.fields = 0.6; c.grass = 0.2; c.dry = 0.6; return c; }
  if (inRect(MOUND, x, z, 6)) { c.road = 0.9; c.sand = 0.2; c.soil = 0.2; return c; }
  if (inRect(PLAZA, x, z) || inRect([QUAY.x0, QUAY.z0, QUAY.x1 + 1, QUAY.z1], x, z)) { c.road = 1; c.sand = 0.1; c.soil = 0.1; return c; }
  if (!inRect(TOWN, x, z)) { const fld = hash2(x * 0.02, z * 0.02) < 0.65; c.fields = fld ? 0.7 : 0.1; c.grass = fld ? 0.3 : 0.1; c.dry = 0.55; return c; }
  if (inLot(x, z, 0.2)) { c.road = 0.3; return c; }
  c.road = onStreet(x, z) ? 0.85 : 0.5; c.sand = 0.4 + 0.15 * hash2(x * 0.07, z * 0.07); c.soil = 0.5;
  return c;
}
const water = (x, z, y) => inRiver(x, z) && y < RIVER.level + 0.3;
const waterLevel = (x, z) => (inRiver(x, z) ? RIVER.level : -Infinity);
const fromWater = (x, z) => (inRiver(x, z) ? -3 : Math.max(-5, Math.min(40, Math.abs(x - riverX(z)) - RIVER.hw)));
/** Plants per 100 m²: reeds and tamarisk on the river's banks, date palms along the landing road, acacia and jujube on the plain, wheat in the fields. */
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inRiver(x, z)) return null;
  if (inRect(MOUND, x, z, 5) || inRect(PLAZA, x, z, 2) || inRect([QUAY.x0 - 2, QUAY.z0 - 2, QUAY.x1 + 4, QUAY.z1 + 2], x, z)) return null;
  const bank = Math.abs(x - riverX(z)) - RIVER.hw;
  if (bank > -4 && bank < 6) return { reeds: 7, tamarisk: 0.15, grass_dry: 5 };
  // the outskirts of the town: groves of neem and jujube among the fields, date palms at the field edges, tamarisk along the ditches
  const out = Math.hypot(x, z) > RADIUS - 95;
  if (out && !inRect(TOWN, x, z)) {
    const h = hash2(x * 0.11, z * 0.13);
    if (h < 0.22) return { neem: 0.1, jujube: 0.08, acacia: 0.05, grass_dry: 5 };
    if (h < 0.34) return { date_palm: 0.35, grass_dry: 4 };
  }
  if (!inRect(TOWN, x, z)) {
    if (hash2(x * 0.3, z * 0.3) < 0.07) return { acacia: 0.12, jujube: 0.1, neem: 0.05, grass_dry: 6 };
    const e = (x + 1000) % 24;
    return e < 1 ? { grass_dry: 12 } : { wheat: 90, grass_dry: 4 };
  }
  if (inLot(x, z, 0.8) || onStreet(x, z, 0.6)) return null;
  if (x > QUAY.x1 - 20 && x < QUAY.x0) return { date_palm: 0.5 };
  // the vacant ground between the blocks and the Citadel's foot, the town's edge: neem and jujube, date palms and thorn
  const h2 = hash2(x * 0.2, z * 0.2);
  return h2 < 0.05 ? { neem: 0.12, acacia: 0.1, grass_dry: 3 } : h2 < 0.08 ? { jujube: 0.1, date_palm: 0.15, grass_dry: 3 } : null;
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { date_palm: 0.5, tamarisk: 0.15, acacia: 0.15, jujube: 0.1, neem: 0.12, reeds: 7, wheat: 90 },
  climate: {
    sun: { az: 150, el: 60, color: [1.0, 0.94, 0.82], intensity: 3.8, lat: 27.3, dec: 8, hour: 10 },
    sky: { turbidity: 4.4, rayleigh: 1.05, mie: 0.008, mieG: 0.8, zenith: [0.13, 0.2, 0.36], horizon: [0.72, 0.66, 0.56] },
    fog: { color: [0.82, 0.75, 0.64], density: 0.0005, height: 0.012 },
    exposure: 0.46,
    wind: [0.45, 0.15],
    damp: 0.05,
    waterline: RIVER.level,
    weather: [
      { id: 'clear', weight: 5, clouds: 0.04, cloudDensity: 0.25, sun: 1.0, fog: 1 },
      { id: 'dust-haze', weight: 2, clouds: 0.1, cloudDensity: 0.3, sun: 0.8, fog: 2.6, fogColor: [0.84, 0.74, 0.6] },
    ],
  },
};
