// A Dogon village — the ground: the red-brown sandstone of the escarpment and its boulder-strewn talus, beaten earth in the village and
// on the place, sandy fields of millet on the plain to the south, thorn scrub and baobabs; the Sahel's dry bright sky at the end of the rains.

import { RADIUS, height, inVillage, inCompound, inFields, nearBaobab, TOGUNA, PUNULU, ALTARS, CLIFF_Z, cliffFoot, wallFace, SHADE, smooth as sm } from './layout.js';

function cover(x, z, h, ny) {
  const c = { sand: 0.3, grass: 0.25, rock: 0, soil: 0.45, fields: 0, dry: 0.7, warmth: 0.65, red: 0.6, road: 0, snow: 0, forest: 0 };
  const d = cliffFoot(x) - z;
  if (d > 1 || ny < 0.75) { c.rock = 0.9; c.red = 0.9; c.grass = 0.05; c.soil = 0.05; return c; }
  if (inVillage(x, z)) { c.road = 0.45; c.soil = 0.7; c.grass = 0; c.sand = 0.2; return c; }
  if (z < CLIFF_Z + 10) { c.rock = 0.45; c.soil = 0.3; c.grass = 0.1; return c; }
  if (inFields(x, z)) { c.fields = 0.55; c.sand = 0.55; c.grass = 0.1; return c; }
  return c;
}
const water = () => false, waterLevel = () => -Infinity, fromWater = () => 1e4;
/** Plants per 100 m²: millet standing on the plain, thorn scrub and dry grass, boulders on the talus; nothing in the village. */
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 5 || inVillage(x, z, 1.5) || inCompound(x, z, 1) || nearBaobab(x, z, 2.5) || Math.hypot(x - TOGUNA.c[0], z - TOGUNA.c[1]) < 7) return null;
  if (PUNULU.some(([px, pz]) => Math.hypot(x - px, z - pz) < 3.5) || ALTARS.some((a) => Math.hypot(x - a.at[0], z - a.at[1]) < 1.6)) return null;
  if (z < wallFace(x) + 2.2 || SHADE.some((t) => Math.hypot(x - t.at[0], z - t.at[1]) < 4)) return null;
  const d = cliffFoot(x) - z;
  // the plateau at the cliff's foot: red rock, boulders fallen from the face, thorn scrub, a fig rooted in a crack
  if (d > 1) return { boulder: 0.5, grass_dry: 4, halfa: 1.2, sycamore_fig: 0.012, acacia: 0.01 };
  if (z < CLIFF_Z + 10) return { boulder: 0.5, grass_dry: 8, acacia: 0.025, halfa: 1.5, sycamore_fig: 0.01 };
  // the millet standing on the plain, a few maize stalks tall among it, the fallow between; trees of the Sahel round the fields
  if (inFields(x, z) && z < 76) return { wheat: 34, maize: 14, grass_dry: 3, acacia: 0.01 };
  if (z >= 76) return { acacia: 0.06, grass_dry: 20, halfa: 1 };
  return { boulder: 0.2, grass_dry: 9, acacia: 0.04, halfa: 0.8, sycamore_fig: 0.004 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { boulder: 0.5, acacia: 0.06, wheat: 55, maize: 14, halfa: 1.5, sycamore_fig: 0.012 },
  climate: {
    sun: { az: 150, el: 50, color: [1.0, 0.94, 0.84], intensity: 3.6, lat: 14.4, dec: -12, hour: 9.5 },
    sky: { turbidity: 2.8, rayleigh: 1.0, mie: 0.005, mieG: 0.78, zenith: [0.1, 0.18, 0.4], horizon: [0.72, 0.72, 0.7] },
    fog: { color: [0.82, 0.78, 0.7], density: 0.0004, height: 0.01 },
    exposure: 0.48,
    damp: 0.1,
    wind: [0.5, 0.15],
    weather: [
      { id: 'clear', weight: 4, clouds: 0.12, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'harmattan-haze', weight: 1, clouds: 0.3, cloudDensity: 0.4, sun: 0.85, fog: 1.6 },
    ],
  },
};
void sm;
