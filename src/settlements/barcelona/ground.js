// Barcelona — the ground: the Eixample's paved streets and the planes along them, the courts'
// gardens; the bright Mediterranean light.

import { RADIUS, PITCH, BLOCK, SAGRADA, MERCAT, height, onDiagonal, bancsFanals } from './layout.js';
const BANCS = bancsFanals();

const inBlock = (x, z, m = 0) => { const bx = Math.round(x / PITCH) * PITCH, bz = Math.round(z / PITCH) * PITCH; return Math.abs(x - bx) < BLOCK / 2 + m && Math.abs(z - bz) < BLOCK / 2 + m; };
const onSite = (x, z, m = 0) => Math.abs(x - SAGRADA[0]) < BLOCK / 2 + m && Math.abs(z - SAGRADA[1]) < BLOCK / 2 + m;      // the temple's works
function cover(x, z) {
  const c = { sand: 0.1, grass: 0.2, rock: 0, soil: 0.2, fields: 0, dry: 0.45, warmth: 0.6, red: 0.15, road: 0.85, snow: 0, forest: 0 };
  if (Math.abs(x - MERCAT[0]) < BLOCK / 2 && Math.abs(z - MERCAT[1]) < BLOCK / 2) { c.road = 1; c.grass = 0; c.soil = 0; return c; }
  if (onSite(x, z)) { c.soil = 0.75; c.dry = 0.6; c.grass = 0.08; c.road = 0.1; c.sand = 0.2; return c; }
  if (inBlock(x, z, -18)) { c.grass = 0.6; c.road = 0.2; return c; }
  return c;
}
const water = () => false, waterLevel = () => -Infinity, fromWater = () => 1e4;
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || onSite(x, z, -1) || (Math.abs(x - MERCAT[0]) < BLOCK / 2 + 1 && Math.abs(z - MERCAT[1]) < BLOCK / 2 + 1)) return null;
  if (inBlock(x, z, -20)) return { date_palm: 0.0025, oleander: 0.01, fig: 0.003, cypress: 0.0015, grass: 12 };   // the courts' gardens
  if (inBlock(x, z, 1)) return null;
  // the rows of planes along both kerbs of every street, 7–8.3 m from its middle (clear of the tram poles at 9.6),
  // not in the crossings
  const sx = Math.abs(((x % PITCH) + PITCH) % PITCH - PITCH / 2), sz = Math.abs(((z % PITCH) + PITCH) % PITCH - PITCH / 2), half = (PITCH - BLOCK) / 2;
  if (onDiagonal(x, z) || BANCS.some(([bx, bz]) => Math.abs(x - bx) < 3 && Math.abs(z - bz) < 4.5)) return null;     // (clear of the bench-lamps)
  if ((sx > 7 && sx < 8.3 && sz > half + 2) || (sz > 7 && sz < 8.3 && sx > half + 2)) return { plane_tree: 0.1 };
  return null;
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { plane_tree: 0.1, date_palm: 0.0025, oleander: 0.01, fig: 0.003, cypress: 0.0015 },
  climate: {
    sun: { az: 160, el: 55, color: [1.0, 0.96, 0.88], intensity: 3.5, lat: 41, dec: 12, hour: 11 },
    sky: { turbidity: 2.8, rayleigh: 1.05, mie: 0.005, mieG: 0.78, zenith: [0.07, 0.15, 0.4], horizon: [0.62, 0.66, 0.72] },
    fog: { color: [0.8, 0.8, 0.82], density: 0.0003, height: 0.01 },
    exposure: 0.48,
    wind: [0.5, 0.2],
    weather: [
      { id: 'clear', weight: 4, clouds: 0.15, cloudDensity: 0.35, sun: 1.0, fog: 1 },
      { id: 'cloud', weight: 1.5, clouds: 0.5, cloudDensity: 0.55, sun: 0.85, fog: 1.1 },
    ],
  },
};
