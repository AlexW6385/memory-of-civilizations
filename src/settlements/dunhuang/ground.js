// Dunhuang — the ground: the cliff's plateau and the Singing Sand dunes behind it, the stone apron, the Daquan's
// dry bed with its stream, the oasis town's earth streets, fields and poplars, the dunes and the Crescent Spring at
// the south. Climate: one of the sunniest places in China, dry, clear (dossier §6).
import { RADIUS, XF, ROCK, ZEND, RIVER, riverX, inRiver, bankY, onStreet, TOWN, SPRING, inRect, smooth as sm, crescent } from './layout.js';

const PLATEAU = 27.5;
function dune(x, z) { return Math.sin(x * 0.045 + z * 0.02) * 0.5 + Math.sin(x * 0.021 - z * 0.05 + 1.3) * 0.5 + 0.5; }
function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  let h = 0;
  // behind the cliff: the plateau (hidden under the rock to x = XF − ROCK + 2) and the dunes rising westward
  const west = sm(XF - ROCK + 8, XF - ROCK - 2, x), zm = 1 - sm(ZEND - 6, ZEND + 36, Math.abs(z));
  h += west * zm * (PLATEAU + dune(x, z) * (4 + Math.max(0, (XF - ROCK - x)) * 0.35));
  // the dunes of the south, ringing the spring
  const south = sm(112, 160, z) * (dune(x * 1.3, z) * 12 + 2) * sm(8, 30, Math.hypot(x - SPRING.c[0], z - SPRING.c[1]));
  h += south;
  // the dry bed
  const d = Math.abs(x - riverX(z));
  if (d < RIVER.w / 2 + 2 && z > -ZEND && z < ZEND) h = Math.min(h, bankY(d));
  // the spring's basin
  if (crescent(x, z, 0.5)) h = Math.min(h, -0.7);
  return h * (1 - sm(RADIUS - 30, RADIUS, r));
}
function cover(x, z) {
  const c = { sand: 0.5, grass: 0.1, rock: 0, soil: 0.3, fields: 0, dry: 0.9, warmth: 0.6, red: 0.1, road: 0, snow: 0, forest: 0 };
  if (x < XF - 10) { c.sand = 0.9; c.dry = 1; return c; }
  if (inRiver(x, z, 1)) { c.sand = 0.6; c.soil = 0.4; return c; }
  if (onStreet(x, z)) { c.road = 0.6; c.sand = 0.2; return c; }
  if (inRect(TOWN, x, z) && x > -30) { c.soil = 0.6; c.sand = 0.2; return c; }
  if (x > -28 && Math.abs(z) < 120 && z < 112 && Math.hypot(x, z) < RADIUS - 28) { c.fields = 0.6; c.grass = 0.3; c.soil = 0.4; c.sand = 0.1; return c; }
  return c;
}
const water = (x, z, y) => (inRiver(x, z) && y < RIVER.water + 0.3) || (crescent(x, z, 0) && y < -0.1);
const waterLevel = (x, z) => (inRiver(x, z) ? RIVER.water : crescent(x, z, 0) ? -0.15 : -Infinity);
const fromWater = (x, z) => Math.min(Math.abs(x - riverX(z)), crescent(x, z, 3) ? 1 : 99);
/** Plants per 100 m²: poplars and willows along the river and the channels, fields of wheat and millet beyond the town, reeds and tamarisk at the spring, scrub on the dunes; nothing on the apron, the street or in the town's lots. */
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 6 || x < XF + 8 && x > XF - 1 || inRiver(x, z) || onStreet(x, z, 1) || crescent(x, z, 0.5)) return null;
  if (x < XF - 8) return Math.hypot(x, z) < RADIUS - 20 && x > XF - ROCK - 5 ? null : { tamarisk: 0.03, grass_dry: 4 };
  const dr = Math.abs(x - riverX(z));
  if (dr < 14 && Math.abs(z) < ZEND) return { poplar: 1.0, willow: 0.5, tamarisk: 0.2, grass: 24 };
  if (crescent(x, z, 5)) return { reeds: 1.2, tamarisk: 0.4, poplar: 0.3, grass: 20 };
  if (z > 112) return { tamarisk: 0.08, grass_dry: 6 };
  if (inRect(TOWN, x, z)) return { poplar: 0.12, willow: 0.05, grass: 14 };
  if (x > -28) return { wheat: 110, poplar: 0.03 };
  return { grass_dry: 8, tamarisk: 0.03 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { poplar: 1.0, willow: 0.5, tamarisk: 0.4, reeds: 1.2, wheat: 110 },
  climate: {
    sun: { az: 160, el: 52, color: [1.0, 0.96, 0.88], intensity: 3.8, lat: 40, dec: 5, hour: 11 },
    sky: { turbidity: 2.4, rayleigh: 1.0, mie: 0.004, mieG: 0.8, zenith: [0.08, 0.17, 0.42], horizon: [0.66, 0.68, 0.7] },
    fog: { color: [0.8, 0.76, 0.68], density: 0.00035, height: 0.01 },
    exposure: 0.5,
    wind: [0.7, 0.3],
    weather: [
      { id: 'clear', weight: 6, clouds: 0.08, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'dust-haze', weight: 1.5, clouds: 0.25, cloudDensity: 0.4, sun: 0.85, fog: 2.2 },
    ],
  },
};
