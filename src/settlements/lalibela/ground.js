// Zagwe Lalibela — the ground: the church precinct level on the plateau, the pits and trenches cut
// down into the red tuff, the slopes rising round it with terraced fields; juniper, wild olive and
// acacia, grass; the clear, cool sky of the highlands.

import { RADIUS, TERR, cutDepth, inCut, slope, nearHouse, onLane, inYard, smooth as sm } from './layout.js';

function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  return (slope(x, z) - cutDepth(x, z)) * (1 - sm(RADIUS - 30, RADIUS, r));
}
const fh = (a, b) => { let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
/** The terraced fields: ring n, the fraction across it, and the plot (a hash of its place along the ring) → 'wheat' | 'fallow' | 'grass'. */
function field(x, z) {
  const r = Math.hypot(x, z);
  if (r < TERR.r0 - 2 || r > RADIUS - 28) return null;
  const u = (r - TERR.r0) / TERR.P, n = Math.floor(u), f = u - n, plot = fh(n * 31 + 7, Math.floor(Math.atan2(z, x) * r / 22));
  return { n, f, kind: plot < 0.5 ? 'wheat' : plot < 0.72 ? 'fallow' : 'grass', riser: f >= 0.7 };
}
function cover(x, z) {
  const c = { sand: 0, grass: 0.45, rock: 0, soil: 0.45, fields: 0, dry: 0.45, warmth: 0.6, red: 0.35, road: 0, snow: 0, forest: 0 };
  if (inCut(x, z, 1)) { c.rock = 0.9; c.soil = 0.1; c.grass = 0; return c; }
  const f = field(x, z);
  if (f) {
    if (f.riser) { c.rock = 0.5; c.grass = 0.2; return c; }
    c.fields = f.kind === 'wheat' ? 0.8 : 0.5; c.grass = f.kind === 'grass' ? 0.6 : 0.2; c.soil = f.kind === 'fallow' ? 0.8 : 0.3;
  }
  if (inYard(x, z, 0)) { c.road = 0.55; c.soil = 0.9; c.grass = 0; c.dry = 0.2; return c; }
  const d = onLane(x, z);
  if (d < 0.2) { c.road = 0.9; c.soil = 0.8; c.grass = 0.05; } else if (d < 1.2) { c.road = 0.4; c.grass = 0.25; }
  return c;
}
const water = () => false, waterLevel = () => -Infinity, fromWater = () => 1e4;
/** Plants per 100 m²: juniper, wild olive and acacia scattered on the slopes and round the houses, grass; wheat and barley on the terraces' treads; a shade tree in some yards; none in the cuts. */
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 6 || inCut(x, z, 2)) return null;
  const y = inYard(x, z, 0);
  if (y) return nearHouse(x, z, 2.2) ? null : { olive: 0.35, cypress: 0.2 };
  if (nearHouse(x, z, 1.5) || onLane(x, z) < 0.6) return null;
  const f = field(x, z);
  if (f) {
    if (f.riser) return { grass_dry: 20, acacia: 0.02 };
    return f.kind === 'wheat' ? { wheat: 55, grass_dry: 2 } : f.kind === 'fallow' ? { grass_dry: 6 } : { grass_dry: 22, acacia: 0.03 };
  }
  if (r < 230) return { olive: 0.06, acacia: 0.04, cypress: 0.05, grass_dry: 14 };
  return { olive: 0.15, acacia: 0.1, cypress: 0.12, grass_dry: 18 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { olive: 0.35, acacia: 0.1, cypress: 0.2, wheat: 55 },
  climate: {
    sun: { az: 140, el: 55, color: [1.0, 0.96, 0.9], intensity: 3.4, lat: 12, dec: -10, hour: 10 },
    sky: { turbidity: 2.4, rayleigh: 1.0, mie: 0.004, mieG: 0.8, zenith: [0.09, 0.17, 0.38], horizon: [0.62, 0.66, 0.7] },
    fog: { color: [0.74, 0.77, 0.8], density: 0.0004, height: 0.01 },
    exposure: 0.48,
    wind: [0.3, 0.2],
    weather: [
      { id: 'clear', weight: 4, clouds: 0.15, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'escarpment-cloud', weight: 1.5, clouds: 0.55, cloudDensity: 0.5, sun: 0.75, fog: 1.6 },
    ],
  },
};
