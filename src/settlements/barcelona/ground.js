// Barcelona — the ground: the Eixample's paved streets and the planes along them, the courts'
// gardens; the bright Mediterranean light.

import { RADIUS, PITCH, BLOCK, height, onDiagonal } from './layout.js';

const inBlock = (x, z, m = 0) => { const bx = Math.round(x / PITCH) * PITCH, bz = Math.round(z / PITCH) * PITCH; return Math.abs(x - bx) < BLOCK / 2 + m && Math.abs(z - bz) < BLOCK / 2 + m; };
function cover(x, z) {
  const c = { sand: 0.1, grass: 0.2, rock: 0, soil: 0.2, fields: 0, dry: 0.45, warmth: 0.6, red: 0.15, road: 0.85, snow: 0, forest: 0 };
  if (inBlock(x, z, -18)) { c.grass = 0.6; c.road = 0.2; return c; }
  return c;
}
const water = () => false, waterLevel = () => -Infinity, fromWater = () => 1e4;
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6) return null;
  if (inBlock(x, z, -20)) return { plane_tree: 0.01, grass: 15 };                       // the courts' gardens
  if (inBlock(x, z, 1)) return null;
  const sx = Math.abs(((x % PITCH) + PITCH) % PITCH - PITCH / 2), sz = Math.abs(((z % PITCH) + PITCH) % PITCH - PITCH / 2);
  if ((sx > PITCH / 2 - 3 || sz > PITCH / 2 - 3) && !onDiagonal(x, z)) return { plane_tree: 0.12 };   // the rows of planes along the streets
  return null;
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { plane_tree: 0.12 },
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
