// Muromachi Kyoto — the ground: the level city on its earth streets, the stream in its stone-lined channel, the two temple
// ponds, the Higashiyama hills rising behind Ginkaku-ji, moss under the garden's trees, white gravel in the temple courts;
// red pines, cedars and maples on the hills and in the gardens, bamboo, persimmons in the yards; the damp light of the basin.
import { RADIUS, STREAM, GINKAKU, RYOAN, SHRINE, inRect, smooth as sm, inStream, onBridge, pondOf, inPond, inLot, onStreet, yards, inPrecinctAt } from './layout.js';

function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vnoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash2(xi, zi), b = hash2(xi + 1, zi), c = hash2(xi, zi + 1), d = hash2(xi + 1, zi + 1);
  return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1;
}
function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  let h = 0;
  // the hills of Higashiyama behind Ginkaku-ji (east), the western edge of the northern hills behind Ryōan-ji
  h += 30 * sm(282, 322, x) * (0.75 + 0.25 * vnoise(x * 0.03, z * 0.03));
  // the ponds: the bed, rising to the bank
  const p = pondOf(x, z);
  if (p) { const d = Math.hypot((x - p.c[0]) / p.r[0], (z - p.c[1]) / p.r[1]); h = Math.min(h, p.bed + (0 - p.bed) * sm(0.78, 1.08, d)); }
  // the stream's channel
  if (r < RADIUS - 20 && Math.min(x - STREAM.x0, STREAM.x1 - x) > -0.5) h = STREAM.bed;
  return h * (1 - sm(RADIUS - 30, RADIUS, r));
}
function cover(x, z, h, ny) {
  const r = Math.hypot(x, z), n = vnoise(x * 0.08, z * 0.08);
  const c = { sand: 0, grass: 0.35, rock: 0, soil: 0.55, fields: 0, dry: 0.12, warmth: 0.3, red: 0.05, road: 0, snow: 0, forest: 0 };
  if (inRect(RYOAN.rect, x, z) || inRect(SHRINE.rect, x, z) && Math.hypot(x - SHRINE.noh[0] - 2, z - SHRINE.noh[1]) < 16) { c.sand = 0.55; c.grass = 0.3; c.soil = 0.15; }
  if (inRect(GINKAKU.rect, x, z)) { c.grass = 0.88 + 0.08 * n; c.soil = 0.1; c.dry = 0.02; if (Math.hypot(x - GINKAKU.kannon[0], z - GINKAKU.kannon[1] - 12) < 16) { c.sand = 0.7; c.grass = 0.25; c.soil = 0.05; } }
  if (inRect(RYOAN.garden, x, z, 0.5)) { c.sand = 1; c.grass = 0; c.soil = 0; return c; }
  if (r > RADIUS - 28) { c.fields = 0.7; c.grass = 0.3; c.soil = 0; }
  if (h > 4) { c.rock = 0.25 * sm(0.9, 0.7, ny); c.forest = 0.7; }
  if (onStreet(x, z)) { c.road = 1; c.soil = 1; c.grass = 0; c.sand = 0; }
  return c;
}
const water = (x, z, y) => (inStream(x, z, -0.3) && !onBridge(x, z) && y < STREAM.level + 0.3) || (inPond(x, z) && y < pondLevel(x, z) + 0.3);
const pondLevel = (x, z) => (pondOf(x, z) ?? GINKAKU.pond).level;
function waterLevel(x, z) { if (inStream(x, z, -0.3)) return STREAM.level; if (inPond(x, z, -0.1)) return pondLevel(x, z); return -Infinity; }
const fromWater = (x, z) => Math.min(inStream(x, z) ? 0 : Math.max(0, Math.min(x - STREAM.x1, STREAM.x0 - x)), 99);
const yardList = yards();
const inYard = (x, z) => yardList.some((y) => inRect(y, x, z));
/** Where in a yard trees may stand: the middle of its west side (the storehouses, beds, rack, shed, wash line and well have the other sectors). */
const treeSpot = (x, z) => { const y = yardList.find((q) => inRect(q, x, z)); return !!y && x < y[0] + (y[2] - y[0]) / 3 && z > y[1] + (y[3] - y[1]) / 3 && z < y[1] + 2 * (y[3] - y[1]) / 3; };
function planting(x, z, p) {
  if (Math.hypot(x, z) > RADIUS - 6 || inStream(x, z, 1) || inPond(x, z, 1) || onStreet(x, z, 1) || inLot(x, z, 1)) return null;
  if (inRect(RYOAN.garden, x, z, 3) || inRect([RYOAN.hojo[0] - 15, RYOAN.hojo[1] - 8, RYOAN.hojo[0] + 15, RYOAN.hojo[1] + 12], x, z) || Math.hypot(x - GINKAKU.kannon[0], z - GINKAKU.kannon[1]) < 12 || inRect([GINKAKU.togudo[0] - 7, GINKAKU.togudo[1] - 8, GINKAKU.togudo[0] + 10, GINKAKU.togudo[1] + 8], x, z)) return null;
  if (inRect(SHRINE.rect, x, z)) return Math.abs(x - SHRINE.torii[0]) < 5 || Math.hypot(x - SHRINE.noh[0] + 5, z - SHRINE.noh[1] - 2) < 15 || Math.hypot(x - SHRINE.hall[0], z - SHRINE.hall[1]) < 9 ? null : { sugi: 0.03, grass: 8 };
  if (inRect(GINKAKU.rect, x, z)) {
    const n = vnoise(x * 0.05 + 3, z * 0.05), pd = Math.hypot((x - GINKAKU.pond.c[0]) / GINKAKU.pond.r[0], (z - GINKAKU.pond.c[1]) / GINKAKU.pond.r[1]);
    if (Math.hypot(x - GINKAKU.kannon[0], z - GINKAKU.kannon[1] - 12) < 20 && x > 160 && x < 240) return { grass: 1 };       // the court before the pavilion
    if (pd < 1.35) return { red_pine: 0.12 * sm(0, 0.5, n), boulder: 0.03, grass: 10 };
    return { red_pine: 0.07, maple: 0.12 * sm(-0.2, 0.3, n), sugi: 0.05 * sm(0.1, 0.5, p.h / 20), bamboo: 0.6 * sm(0.3, 0.7, -n), grass: 12, boulder: 0.01 };
  }
  if (inRect(RYOAN.rect, x, z)) return { grass: 14, red_pine: 0.03, maple: 0.06, sugi: 0.02, boulder: 0.01 };
  if (p.h > 3) return { sugi: 0.3 * sm(2, 10, p.h), red_pine: 0.15, maple: 0.1, grass: 8 };
  if (inYard(x, z)) return treeSpot(x, z) ? { persimmon: 0.06, maple: 0.04, bamboo: 0.3 * sm(0.3, 0.8, vnoise(x * 0.1, z * 0.1)), grass: 2 } : { grass: 1 };
  if (inPrecinctAt(x, z)) return null;
  return { grass: 3, willow: (x > STREAM.x1 && x < STREAM.x1 + 4) || (x < STREAM.x0 && x > STREAM.x0 - 2) ? 0.14 : 0 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { sugi: 0.3, red_pine: 0.15, maple: 0.12, bamboo: 0.6, persimmon: 0.05, willow: 0.12, boulder: 0.03, grass: 40 },
  climate: {
    waterline: STREAM.level,
    sun: { az: 150, el: 45, color: [1.0, 0.95, 0.88], intensity: 3.1, lat: 35, dec: 8, hour: 10 },
    sky: { turbidity: 3.4, rayleigh: 1.2, mie: 0.005, mieG: 0.8, zenith: [0.09, 0.15, 0.32], horizon: [0.48, 0.5, 0.52] },
    fog: { color: [0.7, 0.73, 0.75], density: 0.0005, height: 0.012 },
    exposure: 0.55,
    wind: [0.25, 0.15],
    damp: 0.75,
    weather: [
      { id: 'clear', weight: 3, clouds: 0.3, cloudDensity: 0.4, sun: 1.0, fog: 1 },
      { id: 'hazy', weight: 2, clouds: 0.5, cloudDensity: 0.5, sun: 0.8, fog: 1.6 },
      { id: 'rain', weight: 1.4, clouds: 0.95, cloudDensity: 0.85, sun: 0.3, fog: 2.0, rain: 0.6 },
      { id: 'mist', weight: 1, clouds: 0.5, cloudDensity: 0.45, sun: 0.6, fog: 3.2, fogColor: [0.76, 0.78, 0.79] },
    ],
  },
};
