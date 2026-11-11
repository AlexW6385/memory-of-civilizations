// Alexandria — the ground (docs/settlements/alexandria.md §8): the pale limestone of the coastal ridge, sand and shingle at the
// shore, the paved quay and streets, the gravel of the Museion's garden, the rock of Rhakotis; date palms and tamarisk, the
// plane trees of the Museion's garden, papyrus and reeds at the lake; the bright, humid Mediterranean light, salt and damp.

import { RADIUS, SEA, MUSEION, SEROUTE, GYMZONE, AGORA, ISLAND, PHAROS, HILL, JEWISH, ROYAL, height, wet, inWater, inRect, inLot, onStreet } from './layout.js';

const GARDEN = [196, -66, 296, -36];
const BUILT = [MUSEION, [ROYAL[0], ROYAL[1], ROYAL[2], ROYAL[3] - 2], GYMZONE, AGORA, [PHAROS.c[0] - 22, PHAROS.c[1] - 22, PHAROS.c[0] + 22, PHAROS.c[1] + 22], [SEROUTE.rect[0] - 4, SEROUTE.rect[1] - 4, SEROUTE.rect[2] + 20, SEROUTE.rect[3] + 4], [-470, 46, 470, 58], [-470, 82, 470, 94]];

function cover(x, z, h, ny) {
  const c = { sand: 0.25, grass: 0.05, rock: 0.2, soil: 0.35, fields: 0, dry: 0.85, warmth: 0.8, red: 0.1, road: 0, snow: 0, forest: 0 };
  const w = wet(x, z);
  if (h < 0) { c.sand = 0.3; c.soil = 0.5; c.rock = 0.1; return c; }
  if (inRect(GARDEN, x, z)) { c.road = 0.35; c.grass = 0.4; c.sand = 0.2; return c; }
  if (inRect(MUSEION, x, z) || inRect(ROYAL, x, z) || inRect(AGORA, x, z) || inRect(SEROUTE.rect, x, z, 2) || onStreet(x, z) || inRect(GYMZONE, x, z)) { c.road = 0.85; c.rock = 0.1; return c; }
  if (inRect(ISLAND, x, z) || w < 6) { c.sand = 0.6; c.rock = 0.3; c.road = 0; return c; }
  if (Math.hypot(x - HILL.c[0], z - HILL.c[1]) < HILL.R) { c.rock = 0.6; c.soil = 0.2; return c; }
  if (ny < 0.8) { c.rock = 0.8; return c; }
  if (z > 225) { c.grass = 0.2; c.soil = 0.5; c.sand = 0.2; c.dry = 0.4; return c; }
  return c;
}
const water = (x, z, y) => inWater(x, z) && y < SEA + 0.3;
const waterLevel = (x, z) => (inWater(x, z) ? SEA : -Infinity);
const fromWater = (x, z) => Math.max(-5, Math.min(40, height(x, z) - SEA));
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 70 || inWater(x, z) || wet(x, z) < 1.5 || inLot(x, z, 1.5) || onStreet(x, z, 1)) return null;
  if (inRect(GARDEN, x, z, -3) && !(x > 226 && x < 240) && Math.abs(z + 51) > 4) return { plane_tree: 0.06, grass_dry: 3 };
  if (inRect(MUSEION, x, z, 4) || inRect(SEROUTE.rect, x, z, 3)) return null;
  if (BUILT.some((r) => inRect(r, x, z, 3)) || inRect(JEWISH, x, z) && z < 20) return null;
  if (inRect(ISLAND, x, z)) return wet(x, z) > 4 ? { tamarisk: 0.08, grass_dry: 3 } : null;
  if (z > 236) return { papyrus: 8, reeds: 7, date_palm: 0.2 };       // the lake shore
  if (Math.hypot(x - HILL.c[0], z - HILL.c[1]) < HILL.R + 8) return { grass_dry: 4, tamarisk: 0.05 };
  return { date_palm: 0.12, sycamore_fig: 0.02, grass_dry: 3 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater, rim: -10,
  sea: SEA,
  maxDensity: { date_palm: 0.2, sycamore_fig: 0.02, plane_tree: 0.06, tamarisk: 0.08 },
  climate: {
    sun: { az: 150, el: 56, color: [1.0, 0.96, 0.88], intensity: 3.6, lat: 31, dec: 12, hour: 10 },
    sky: { turbidity: 3.0, rayleigh: 1.05, mie: 0.006, mieG: 0.8, zenith: [0.1, 0.19, 0.4], horizon: [0.66, 0.7, 0.74] },
    fog: { color: [0.8, 0.82, 0.83], density: 0.00035, height: 0.012 },
    exposure: 0.47,
    wind: [0.5, 0.3],
    waterline: SEA,       // the harbour's still water: the stain on the quay walls (src/engine/materials.js)
    damp: 0.75,           // the sea air's salt and damp: crust and pitting on the limestone, rising damp, algae at the quay
    weather: [
      { id: 'clear', weight: 5, clouds: 0.1, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'hazy', weight: 2, clouds: 0.25, cloudDensity: 0.4, sun: 0.9, fog: 1.5 },
      { id: 'cloud', weight: 1, clouds: 0.5, cloudDensity: 0.5, sun: 0.8, fog: 1.1 },
    ],
  },
};
