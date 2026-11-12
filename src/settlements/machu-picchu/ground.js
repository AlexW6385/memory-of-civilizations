// Machu Picchu — the ground: the saddle's top, nearly level, the plaza sunk in it and the
// Intihuatana's hill; terraces stepping down all round; the flanks falling steeply into the canyon
// of the Urubamba; the peaks of Huayna Picchu and Machu Picchu; the far side rising again; grass
// on the terraces, cloud forest on the slopes; mist and cloud of the eastern Andes.
// Pure (used by the relief, the collision and the plant workers).

import { RADIUS, SITE, TERRACE, PLAZA, PEAKS, DITCH, FIELDS, STORES, HUT, HILL, KNOLL, hillHeight, inRect, outside, terraceAt, inHouse, paved, ploughed, smooth as sm } from './layout.js';

function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vnoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash2(xi, zi), b = hash2(xi + 1, zi), c = hash2(xi, zi + 1), d = hash2(xi + 1, zi + 1);
  return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1;
}
const TOP = -TERRACE.h * TERRACE.n;
/** The far walls of the canyon: { c, rx, rz, h } ellipses of mountain, east and west of the saddle (crests at 60–120 m above the town). */
const RIDGES = [{ c: [212, -15], rx: 66, rz: 200, h: 160 }, { c: [-214, 20], rx: 66, rz: 190, h: 140 }, { c: [200, 150], rx: 60, rz: 80, h: 100 }, { c: [-210, 140], rx: 60, rz: 70, h: 90 }, { c: [150, -215], rx: 55, rz: 70, h: 135 }, { c: [-155, -210], rx: 55, rz: 70, h: 130 }, { c: [-10, -262], rx: 70, rz: 50, h: 150 }];
/** The ridge stands 130 m above the open country: its canyon floor comes down to -130 by the rim. */
export const LIFT = 130, RIM = -130;
function fbm(x, z) { return vnoise(x, z) * 0.6 + vnoise(x * 2.1 + 5, z * 2.1) * 0.3 + vnoise(x * 4.3, z * 4.3 + 9) * 0.1; }
function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return RIM;
  const d = outside(x, z);
  let h;
  if (d < 0) {
    h = 0;
    // the plaza sunk 2.4 m, its banks falling over 6 m from its edge (about 30° at the steepest: one
    // walks down into it and up out of it)
    if (inRect(PLAZA, x, z)) h = -2.4 * sm(0, 6, Math.min(x - PLAZA[0], PLAZA[2] - x, z - PLAZA[1], PLAZA[3] - z));
    // the dry ditch across the saddle before the town wall, its west end closed
    { const q = Math.abs(z - DITCH.z); if (q < DITCH.top) h = Math.min(h, -DITCH.depth * (1 - sm(DITCH.bottom, DITCH.top, q)) * sm(DITCH.x0, DITCH.x0 + 5, x)); }
    // the Intihuatana's hill and the Guardhouse's knoll, in terraces
    h = Math.max(h, hillHeight(HILL, x, z), hillHeight(KNOLL, x, z));
  } else {
    const k = terraceAt(d);
    // the terraces, then the slope down into the canyon, its floor
    h = k >= 0 ? -TERRACE.h * k : Math.max(RIM + 4 * fbm(x * 0.02, z * 0.02), TOP - (d - TERRACE.w * TERRACE.n) * 1.2 + 7 * fbm(x * 0.04, z * 0.04));
  }
  // the peaks, rising from the canyon floor: steep, ribbed, rugged
  for (const p of PEAKS) {
    const q = Math.hypot(x - p.c[0], z - p.c[1]) / p.r;
    if (q < 1) {
      // a sugarloaf: steep flanks, a rounded summit, ribs and buttresses down the sides, crags and ledges
      const a = Math.atan2(z - p.c[1], x - p.c[0]);
      // the ribs and crags on the flanks only; the summit stays a rounded dome, not a cluster of spires
      const flank = sm(0.08, 0.45, q);
      const rib = 1 + (0.12 * fbm(x * 0.05 + p.c[0], z * 0.05) + 0.06 * Math.sin(a * 7) + 0.03 * Math.sin(a * 17 + q * 9)) * flank;
      const crag = 0.05 * Math.abs(fbm(x * 0.13 + 3, z * 0.13 - 2)) * q * (1 - q) * 4;
      const qs = Math.sqrt(q * q + 0.012);
      const prof = (1 - Math.pow(qs, 1.35)) * (1 - 0.25 * qs) / (1 - Math.pow(0.11, 1.35));
      h = Math.max(h, RIM + (p.h - RIM) * prof * (rib - crag) - 6 * Math.floor(Math.max(0, fbm(x * 0.08, z * 0.08)) * 2) * q);
    }
  }
  // the canyon's far walls: the Urubamba loops round the saddle, and across it the mountains rise again on every side
  // (Putucusi to the east, the ridges of the Salkantay's foothills to the west, Machu Picchu mountain's long spur): long
  // ridges standing off the saddle with the canyon floor between, their crests running along the river
  // (down to the canyon floor again before the rim, so the disc joins the open country without a step)
  const fade = 1 - sm(RADIUS - 110, RADIUS - 32, r);
  if (fade > 0) for (const R of RIDGES) {
    const q = Math.hypot((x - R.c[0]) / R.rx, (z - R.c[1]) / R.rz);
    if (q < 1) {
      const a = Math.atan2(z - R.c[1], x - R.c[0]), qs = Math.sqrt(q * q + 0.09), fl = sm(0.15, 0.7, q);
      const prof = (1 - Math.pow(qs, 1.6)) / (1 - Math.pow(0.3, 1.6));
      const rib = 1 + (0.16 * fbm(x * 0.035 + R.c[0], z * 0.035) + 0.07 * Math.sin(a * 9 + R.c[1])) * fl;
      h = Math.max(h, RIM + ((R.h - RIM) * prof * rib - 5 * Math.max(0, fbm(x * 0.07, z * 0.07)) * q) * fade);
    }
  }
  return RIM + (h - RIM) * (1 - sm(RADIUS - 25, RADIUS, r));
}
function cover(x, z, h, ny) {
  const c = { sand: 0, grass: 0, rock: 0, soil: 0, fields: 0, dry: 0.2, warmth: 0.45, red: 0.1, road: 0, snow: 0, forest: 0 };
  const d = outside(x, z);
  if (ny < 0.55) { c.rock = 0.55; c.grass = 0.3; c.soil = 0.15; c.forest = 0.45; return c; }      // the cloud forest clings to all but the sheerest rock
  if (ploughed(x, z)) { c.soil = 1; c.grass = 0.05; c.dry = 0.05; return c; }      // the turned earth of the ploughed strips
  if (d < 0 && inRect(FIELDS, x, z) && h < 0.5 && Math.abs(x - 2) > 2) { c.soil = 0.75; c.grass = 0.35; return c; }   // the fields
  if (d < TERRACE.w * TERRACE.n) { c.grass = 0.85; c.soil = 0.15; if (inHouse(x, z, 1)) { c.grass = 0.3; c.soil = 0.7; } return c; }
  c.grass = 0.3; c.forest = 0.85; c.rock = 0.1; c.soil = 0.6; return c;
}
function water() { return false; }
function waterLevel() { return -Infinity; }
function fromWater() { return 50; }
/** Plants per 100 m²: grass on the terraces and the plaza, a few trees in the town; cloud forest on the slopes and the peaks. */
function planting(x, z, p) {
  if (Math.hypot(x, z) > RADIUS - 6 || paved(x, z)) return null;
  const d = outside(x, z);
  if (d < 0 && inRect(FIELDS, x, z)) {
    // the fields of maize south of the ditch, in plots with grass between; the path to the gate, the storehouses and the chaski's yard kept clear
    const hk = ground.height(x, z);
    if (Math.abs(x - 2) < 2.2 || inRect(HUT, x, z, 2.5) || STORES.some((r) => inRect(r, x, z, 1.5))) return { grass: 30 };
    if (hk > 0.5) {
      // the Guardhouse's knoll: maize on the middle of its treads (not the top, not the stair)
      const kd = Math.hypot(x - KNOLL.c[0], z - KNOLL.c[1]), ph = ((KNOLL.r + 6 - kd) / 2.4) % 1;
      if (hk < 2.2 * KNOLL.n - 0.5 && ph > 0.2 && ph < 0.85 && !(z < KNOLL.c[1] && Math.abs(x - KNOLL.c[0]) < 2.6) && hash2(Math.floor(x / 5), Math.floor(z / 5)) < 0.65) return { maize: 30, grass: 8 };
      return { grass: 30 };
    }
    const plot = ((Math.floor((x + 200) / 9) + Math.floor(z / 7)) % 3);
    return plot === 2 ? { grass: 45 } : { maize: 34, grass: 6 };
  }
  if (d < 0) return inHouse(x, z, 0.6) ? null : { grass: 40, tamarisk: hash2(x * 0.2, z * 0.2) < 0.03 ? 0.3 : 0 };
  if (d < TERRACE.w * TERRACE.n) {
    if (ploughed(x, z)) return null;
    // maize on the terraces: whole sectors of a terrace in crop, the next in grass or fallow; the stairs and the fountains' stair kept clear
    const j = Math.floor(d / TERRACE.w), f = d - TERRACE.w * j, ang = Math.atan2(z / (SITE.b + d), x / (SITE.a + d));
    const nearStair = (Math.abs(z) < 2.6 && Math.abs(x) > SITE.a * 0.5) || (z > SITE.b * 0.5 && Math.abs(x) < 2.6);
    if (!nearStair && f > 0.9 && f < TERRACE.w - 0.5 && hash2(Math.floor((ang + 3.2) * 7 + j * 3.1), j) < 0.5) return { maize: 30, grass: 8 };
    return { grass: 50 };
  }
  return { grass: 25, teak: 0.25, neem: 0.3, oak: 0.08, reeds: 4 };
}
export const ground = {
  lift: LIFT, rim: RIM,
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { teak: 0.25, neem: 0.3, oak: 0.08, tamarisk: 0.3, maize: 34 },
  // the eastern Andes in the dry season's end: bright sun between clouds, mist rising from the canyon
  climate: {
    sun: { az: 40, el: 55, color: [1.0, 0.96, 0.9], intensity: 3.4, lat: -13, dec: -15, hour: 10 },
    sky: { turbidity: 2.4, rayleigh: 1.0, mie: 0.004, mieG: 0.8, zenith: [0.08, 0.16, 0.38], horizon: [0.5, 0.56, 0.62] },
    fog: { color: [0.78, 0.8, 0.82], density: 0.0007, height: 0.02 },
    exposure: 0.5,
    wind: [0.3, 0.2],
    weather: [
      { id: 'bright', weight: 2.5, clouds: 0.4, cloudDensity: 0.5, sun: 1.0, fog: 1 },
      { id: 'cloud', weight: 2, clouds: 0.75, cloudDensity: 0.7, sun: 0.6, fog: 1.6 },
      { id: 'mist', weight: 1.5, clouds: 0.85, cloudDensity: 0.75, sun: 0.4, fog: 4.5, fogColor: [0.85, 0.86, 0.87] },
    ],
  },
};
