// The pā — the ground: grass and bracken on the hill's terraces and scarps, the bare earth of the
// paths, kūmara gardens in mounds, flax (harakeke) and cabbage trees by the lake, the lake itself;
// mānuka and forest beyond; the mild, changeable sky of the North Island.

import { RADIUS, HILL, LAKE, LANES, PATH, height, inLake, inGarden, village } from './layout.js';

// the trodden ground: bare earth round every house and across each whānau yard, in cells of 12 m
let CELLS = null;
function cells() {
  if (CELLS) return CELLS;
  CELLS = new Map();
  const v = village(), add = (o) => { const k = Math.floor(o[0] / 12) + ',' + Math.floor(o[1] / 12); (CELLS.get(k) || CELLS.set(k, []).get(k)).push(o); };
  for (const h of v.houses) add([h.c[0], h.c[1], h.l / 2 + 2.6, 1]);
  for (const c of v.compounds) add([c.c[0], c.c[1], c.r + 1.5, 2]);
  for (const p of [...v.pataka, ...v.pits]) add([p.c[0], p.c[1], 2.6, 1]);
  // the summit: the marae atea beaten bare before the chief's house, the cooking place, the weavers' and the carver's places
  const [hx, hz] = HILL.c, h0 = v.houses[0];
  for (let k = 0; k < 4; k++) add([h0.c[0] + 1 + (k % 2) * 7 - 3, hz + 11 + k * 5.5, 7.5, 2]);
  for (const [x, z, r] of [[hx + 13, hz + 10, 5], [hx - 16, hz + 9, 5], [hx - 18, hz + 1, 4], [hx + 17, hz - 2, 4.5], [hx + 5.5, hz + 14, 3]]) add([x, z, r, 2]);
  // the gates' surrounds, trodden by everyone who passes
  for (const r of [HILL.tihi - 1.5, ...HILL.rings.map(([, r1]) => r1 - 2), HILL.ditch + 5]) for (const dz of [-3, 0, 3]) add([PATH.x, hz + r + dz, 4, 2]);
  return CELLS;
}
/** 0..1: how trodden the ground is at (x, z). */
function trodden(x, z) {
  const C = cells(), i = Math.floor(x / 12), j = Math.floor(z / 12);
  let t = 0;
  for (let a = i - 2; a <= i + 2; a++) for (let b = j - 2; b <= j + 2; b++) for (const [ox, oz, r, k] of C.get(a + ',' + b) || []) {
    const d = Math.hypot(ox - x, oz - z);
    if (d < r) t = Math.max(t, k === 2 ? 1 : 0.5 + 0.5 * (1 - d / r));
  }
  // the walks along each terrace behind the stages: a worn lane
  const r = Math.hypot(x - HILL.c[0], z - HILL.c[1]);
  for (const q of LANES) { const d = Math.abs(r - q); if (d < 1.5) t = Math.max(t, 0.9 * (1 - d / 1.5)); }
  return t;
}
function cover(x, z, h, ny) {
  const c = { sand: 0, grass: 0.8, rock: 0, soil: 0.2, fields: 0, dry: 0.15, warmth: 0.45, red: 0.1, road: 0, snow: 0, forest: 0 };
  if (inGarden(x, z)) { c.fields = 0.8; c.soil = 0.6; return c; }
  if (Math.abs(x - PATH.x) < PATH.w / 2 && z > HILL.c[1]) { c.road = 0.8; return c; }
  if (ny < 0.8) { c.soil = 0.6; c.grass = 0.4; return c; }
  const tr = trodden(x, z);
  if (tr > 0.05) { c.soil = 0.25 + 0.55 * tr; c.grass = 0.8 - 0.7 * tr; c.dry = 0.15 + 0.3 * tr; }
  if (h < LAKE.level + 0.8) { c.sand = 0.6; c.grass = 0.2; return c; }
  return c;
}
function water(x, z, y) { return inLake(x, z) && y < LAKE.level + 0.3; }
function waterLevel(x, z) { return inLake(x, z) ? LAKE.level : -Infinity; }
function fromWater(x, z) { return Math.max(-5, Math.min(40, height(x, z) - LAKE.level)); }
function planting(x, z) {
  const r = Math.hypot(x - HILL.c[0], z - HILL.c[1]);
  if (Math.hypot(x, z) > RADIUS - 6 || inLake(x, z) || r < HILL.ditch + 4 || Math.abs(x - PATH.x) < PATH.w + 1 || inGarden(x, z)) return r < HILL.ditch + 4 && r > 20 ? { grass: 30 } : null;
  if (trodden(x, z) > 0.3) return null;
  if (height(x, z) < LAKE.level + 3) return { reeds: 12, maquis: 0.15, grass: 20 };
  if (Math.hypot(x, z) > RADIUS - 70) return { maquis: 0.3, tamarisk: 0.05, grass: 25 };
  return { grass: 35, maquis: 0.04 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  sea: LAKE.level,   // the planet's sea is this water, at this level (src/planet/relief.js)
  maxDensity: { maquis: 0.3, tamarisk: 0.05 },
  climate: {
    sun: { az: 0, el: 52, color: [1.0, 0.97, 0.92], intensity: 3.4, lat: -38, dec: -10, hour: 11 },
    sky: { turbidity: 2.2, rayleigh: 1.0, mie: 0.004, mieG: 0.78, zenith: [0.07, 0.15, 0.42], horizon: [0.62, 0.68, 0.76] },
    fog: { color: [0.76, 0.8, 0.84], density: 0.00035, height: 0.012 },
    exposure: 0.48,
    wind: [0.8, 0.3],
    weather: [
      { id: 'changeable', weight: 3, clouds: 0.5, cloudDensity: 0.55, sun: 0.9, fog: 1.1 },
      { id: 'clear', weight: 2, clouds: 0.15, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'showers', weight: 1.2, clouds: 0.9, cloudDensity: 0.8, sun: 0.4, fog: 1.6, rain: 0.7 },
    ],
  },
};
