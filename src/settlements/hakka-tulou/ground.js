// The Hakka tulou — the ground: a small valley floor, flat, with the stream cut into its cobbled bed on
// the south side; the hills rising north, east and west, cut into terraces — paddy on the lower ones,
// tea on the upper — and fir and bamboo on the slopes beyond; the damp humid-subtropical sky of the
// Fujian hills. docs/settlements/hakka-tulou.md §2, §4.3.
import { RADIUS, STREAM, streamZ, inStream, inFoot, hill, terrace, terraced, sm, inRect, YARD, ROAD, T } from './layout.js';

function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vnoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash2(xi, zi), b = hash2(xi + 1, zi), c = hash2(xi, zi + 1), d = hash2(xi + 1, zi + 1);
  return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1;
}

function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  let h = hill(x, z);
  const t = terraced(x, z);
  h = h * (1 - t) + terrace(h) * t;
  const dz = Math.abs(z - streamZ(x));
  if (dz < STREAM.w / 2 + 2) h = Math.min(h, STREAM.bed * sm(STREAM.w / 2 + 2, STREAM.w / 2 - 0.5, dz));
  return h * (1 - sm(RADIUS - 30, RADIUS, r));
}
/** The height of the slope at a place (for the terraces' use). */
const slopeH = (x, z) => hill(x, z);

function cover(x, z, h) {
  const r = Math.hypot(x, z), n = vnoise(x * 0.09, z * 0.09);
  const c = { sand: 0, grass: 0.35, rock: 0, soil: 0.5, fields: 0, dry: 0.12, warmth: 0.45, red: 0.35, road: 0, snow: 0, forest: 0 };
  if (inStream(x, z, 1.2)) { c.sand = 0.4; c.soil = 0.3; c.rock = 0.3; c.grass = 0; return c; }
  if (r < T.R + 2 || inFoot(x, z, 0)) { c.soil = 0.8; c.grass = 0.05; c.road = 0.4; return c; }
  if (inRect(YARD, x, z, 1) || inRect(ROAD, x, z, 0.5) && z > 30) { c.road = 1; c.soil = 1; c.grass = 0; return c; }
  const s = slopeH(x, z);
  if (s > 0.6) {
    // the terraces: paddy on the lower, tea on the upper, forest on the steep top
    if (s > 15) { c.forest = 0.7; c.grass = 0.5; c.soil = 0.2; c.fields = 0; c.red = 0.45; }
    else if (s > 8) { c.grass = 0.45; c.soil = 0.5; c.red = 0.5; c.fields = 0.05; }
    else { c.fields = 0.85; c.grass = 0.15; c.soil = 0.1; }
  } else if (z > streamZ(x) + 5 && z < 150 || (Math.abs(x) > 100 && Math.abs(x) < 125)) { c.fields = 0.8; c.grass = 0.2; c.soil = 0.1; }
  else if (z < -55 && z > -105) { c.fields = 0.5 + 0.2 * n; c.grass = 0.3; c.soil = 0.2; }
  else { c.soil = 0.55 + 0.1 * n; c.grass = 0.4 - 0.1 * n; }
  return c;
}
function water(x, z, y) { return inStream(x, z) && y < STREAM.water + 0.3; }
function waterLevel(x, z) { return inStream(x, z) ? STREAM.water : -Infinity; }
function fromWater(x, z) { return Math.abs(z - streamZ(x)) - STREAM.w / 2; }

/** Plants per 100 m². */
function planting(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS - 6 || inStream(x, z, 0.6) || inFoot(x, z, 1.5)) return null;
  if (inRect(YARD, x, z, 1) || inRect(ROAD, x, z, 1.2)) return null;
  const s = slopeH(x, z), n = vnoise(x * 0.06 + 3, z * 0.06 - 5), g = vnoise(x * 0.15, z * 0.15 + 9);
  if (Math.abs(z - streamZ(x)) < 8) return { bamboo: 1.2 * sm(0.0, 0.5, n), willow: 0.15, grass: 30 };
  if (s > 15) return { chinese_fir: 0.35, masson_pine: 0.15, bamboo: 0.6 * sm(-0.2, 0.4, g), grass: 12 };
  if (s > 8) return { tea: 50 * sm(-0.3, 0.2, g) + 25, grass: 10 };
  if (s > 0.6) return { rice: 110, grass: 3 };
  if (z > streamZ(x) + 5 && z < 150) return { rice: 110 };
  if (Math.abs(x) > 100 && Math.abs(x) < 125 || (z < -55 && z > -105)) return { rice: 100, grass: 4 };
  // by the tulou: camphor and a banyan at the front, bamboo clumps at the back, fruit trees about the yards
  if (z < -34 && Math.hypot(x, z + 55) < 30) return { bamboo: 3.0 * sm(-0.1, 0.4, g), camphor: 0.05, grass: 12 };
  return { camphor: 0.05, banyan: 0.008, grass: 14 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { bamboo: 3, willow: 0.15, chinese_fir: 0.35, masson_pine: 0.15, tea: 130, rice: 110, camphor: 0.05, banyan: 0.008, grass: 30 },
  climate: {
    waterline: STREAM.water,
    sun: { az: 150, el: 45, color: [1.0, 0.94, 0.84], intensity: 3.0, lat: 24.7, dec: 12, hour: 10 },
    sky: { turbidity: 4.0, rayleigh: 1.3, mie: 0.005, mieG: 0.8, zenith: [0.1, 0.17, 0.3], horizon: [0.4, 0.42, 0.42] },
    fog: { color: [0.66, 0.7, 0.7], density: 0.0009, height: 0.02 },
    exposure: 0.56,
    wind: [0.25, 0.15],
    damp: 0.9,
    weather: [
      { id: 'hazy', weight: 3, clouds: 0.4, cloudDensity: 0.45, sun: 0.9, fog: 1.4 },
      { id: 'cloudy', weight: 2.5, clouds: 0.7, cloudDensity: 0.6, sun: 0.65, fog: 1.6 },
      { id: 'drizzle', weight: 2, clouds: 0.95, cloudDensity: 0.8, sun: 0.3, fog: 2.4, rain: 0.5 },
      { id: 'water-mist', weight: 1.4, clouds: 0.5, cloudDensity: 0.45, sun: 0.55, fog: 4.0, fogColor: [0.74, 0.76, 0.77] },
    ],
  },
};
