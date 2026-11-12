// Tang Chang'an — the ground: the flat Guanzhong plain under a pale hazy sky; the avenue's beaten earth with its two ditches and the
// locusts planted along them, the wards' lanes of earth, the temples' brick courts, the market's lanes; locusts, elms and jujubes in
// the courts of the houses, cypresses and pines in the temples, peach trees in the Daoist temple's court; wheat beyond the wards.

import { RADIUS, AVE, DITCH, STREETS, WARDS, DACI, DAOIST, MARKET, MARKET_BLOCKS, OFFICE, DACI_AX, DAO_AX, inRect, inDitch, onStreet, onLane, onMarketLane, lotAt, smooth as sm, inWard, TREE_ROWS, marketYards } from './layout.js';

function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  let h = 0;
  const ax = Math.abs(x), cx = (DITCH.in + DITCH.out) / 2, hw = (DITCH.out - DITCH.in) / 2;
  const dd = Math.abs(ax - cx);
  if (dd < hw + 0.9 && !STREETS.slice(1).some((s) => s[2] - s[0] > s[3] - s[1] && z > s[1] - 0.5 && z < s[3] + 0.5)) h = DITCH.bed * (1 - sm(hw - 0.2, hw + 0.9, dd));
  return h * (1 - sm(RADIUS - 30, RADIUS, r));
}
const earthWay = (x, z) => onStreet(x, z) || onLane(x, z);
function cover(x, z) {
  const r = Math.hypot(x, z);
  const c = { sand: 0.25, grass: 0.12, rock: 0, soil: 0.55, fields: 0, dry: 0.55, warmth: 0.55, red: 0, road: 0, snow: 0, forest: 0 };
  if (inDitch(x, z)) { c.soil = 0.7; c.grass = 0.3; c.dry = 0.2; return c; }
  if (r > RADIUS - 28) { c.fields = 0.8; c.grass = 0.2; return c; }
  const ward = inWard(x, z);
  if (!ward && !onStreet(x, z)) { c.fields = 0.9; c.grass = 0.25; return c; }
  if (onStreet(x, z)) {
    c.road = 0.95; c.soil = 0.5; c.grass = 0.02; c.sand = 0.2;
    // wheel ruts of the carts (two tracks 1.8 m apart every 7.6 m, broken up along their run), the trodden hoof strip between them, dust by the walls
    const ax = Math.abs(x), along = ax < AVE ? z : x, across = ax < AVE ? x : z, u = ((across % 7.6) + 7.6) % 7.6, brk = 0.5 + 0.5 * Math.sin(along * 0.09 + Math.floor(across / 7.6) * 2.3);
    const rut = Math.max(0, 1 - Math.min(Math.abs(u - 2.8), Math.abs(u - 4.6)) / 0.32) * (0.35 + 0.65 * brk);
    c.soil += rut * 0.35; c.dry -= rut * 0.3; c.sand -= rut * 0.1;
    if (u > 3.1 && u < 4.3) { c.sand += 0.25 * brk; c.dry += 0.1; }
    const edge = Math.min(Math.abs(ax - AVE), 6); if (ax > AVE - 6 && ax < AVE + 6) c.sand += (6 - edge) / 6 * 0.2;
    return c;
  }
  if (ward && (ward.kind === 'daci\'en' || ward.kind === 'daoist')) { const lane = Math.abs(x - (ward.kind === 'daci\'en' ? DACI_AX : DAO_AX)) < 9; c.road = lane ? 0.6 : 0.25; c.soil = 0.5; c.grass = lane ? 0.02 : 0.2; return c; }
  if (ward && ward.kind === 'market') { c.road = onMarketLane(x, z) ? 0.9 : 0.5; c.grass = 0.02; return c; }
  if (onLane(x, z)) { c.road = 0.85; c.grass = 0.05; return c; }
  if (lotAt(x, z)) { c.road = 0.15; c.soil = 0.65; c.grass = 0.3; return c; }
  c.road = 0.4; return c;
}
const water = (x, z, y) => inDitch(x, z) && y < DITCH.water + 0.3;
const waterLevel = (x, z) => (inDitch(x, z) ? DITCH.water : -Infinity);
const fromWater = (x, z) => Math.abs(Math.abs(x) - (DITCH.in + DITCH.out) / 2);

/** Plants per 100 m². */
function planting(x, z) {
  const r = Math.hypot(x, z), ax = Math.abs(x);
  if (r > RADIUS - 6 || inDitch(x, z)) return null;
  // the avenue: locusts in two rows each side (between the roadway and the ditch's near edge; between the ditch and the wall), none at the cross streets
  if (ax < AVE && !STREETS.slice(1).some((s) => s[2] - s[0] > s[3] - s[1] && z > s[1] - 6 && z < s[3] + 6)) {
    if (Math.abs(ax - 49.8) < 1.1 || Math.abs(ax - 41.5) < 1.0) return { pagoda_tree: 3.2, grass: 4 };
    if (ax > 47.5) return { grass: 8, willow: Math.abs(ax - 48.3) < 0.7 ? 0.55 : 0 };
    return null;
  }
  if (onStreet(x, z)) { const e = STREETS.filter((s) => inRect(s, x, z)); return e.length && ax > AVE ? ((Math.abs(x) % 28 < 3) && z % 6 < 2 && false ? null : { grass: 1.2 }) : null; }
  const ward = inWard(x, z);
  if (!ward) { if (r > 470) return { wheat: 100, grass: 6 }; return { wheat: 90, grass: 6 }; }
  if (ward.kind === 'daci\'en') {
    const [x0, z0, x1, z1] = ward.rect;
    if (Math.abs(x - DACI_AX) < 10) return null;
    if (inRect([DACI_AX - 26, z0, DACI_AX + 26, z0 + 80], x, z)) return null;                       // the pagoda's platform
    if (z < z0 + 4 || z > z1 - 4 || x < x0 + 4 || x > x1 - 4) return null;
    return { cypress: 0.09, chinese_pine: 0.09, pagoda_tree: 0.06, grass: 4 };
  }
  if (ward.kind === 'daoist') {
    if (Math.abs(x - DAO_AX) < 7) return null;
    const [x0, z0, x1, z1] = ward.rect;
    if (z < z0 + 4 || z > z1 - 4 || x < x0 + 4 || x > x1 - 4) return null;
    return z > z0 + 120 ? { apple: 0.7, grass: 8 } : { chinese_pine: 0.1, cypress: 0.06, apple: 0.15, grass: 5 };
  }
  if (ward.kind === 'market') { return onMarketLane(x, z, 0.5) ? null : (marketYards().some((m) => inRect(m.yard, x, z, -1.5)) ? { pagoda_tree: 0.18, grass: 3 } : null); }
  if (onLane(x, z, 0.4)) { const rim = Math.abs(((ward.c[0] - x) * 0.5)) % 1; void rim; return { pagoda_tree: 0.12, elm: 0.05, grass: 2 }; }
  const lot = lotAt(x, z);
  if (lot) { const inCourt = true; void inCourt; return lot.kind === 'hut' ? { grass: 4, jujube: 0.1 } : { pagoda_tree: 0.12, jujube: 0.14, persimmon: 0.1, elm: 0.06, grass: 5 }; }
  return { grass: 3 };
}
void MARKET; void MARKET_BLOCKS; void OFFICE; void DACI; void DAOIST; void TREE_ROWS; void WARDS; void earthWay;

export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { willow: 0.6, pagoda_tree: 3.2, jujube: 0.14, persimmon: 0.1, elm: 0.06, cypress: 0.09, chinese_pine: 0.1, apple: 0.7, wheat: 100 },
  climate: {
    sun: { az: 160, el: 50, color: [1.0, 0.95, 0.86], intensity: 3.1, lat: 34.3, dec: 5, hour: 10.5 },
    sky: { turbidity: 5.0, rayleigh: 1.1, mie: 0.008, mieG: 0.82, zenith: [0.12, 0.19, 0.34], horizon: [0.72, 0.69, 0.62] },
    fog: { color: [0.78, 0.74, 0.66], density: 0.0007, height: 0.013 },
    exposure: 0.5,
    waterline: DITCH.water,
    damp: 0.2,
    wind: [0.3, 0.2],
    weather: [
      { id: 'dust-haze', weight: 3, clouds: 0.3, cloudDensity: 0.4, sun: 0.9, fog: 1.6 },
      { id: 'clear', weight: 3, clouds: 0.12, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'autumn-rain', weight: 1, clouds: 0.85, cloudDensity: 0.7, sun: 0.4, fog: 2, rain: 0.45 },
    ],
  },
};
