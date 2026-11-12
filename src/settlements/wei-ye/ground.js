// Three Kingdoms Ye — the ground (docs/settlements/wei-ye.md §3): the flat alluvial plain of the Zhang River; beaten earth in the streets and wards,
// the paved crowns and the garden under the terraces, the Xuanwu pond and the river sunk in their banks; elms, pagoda trees and jujubes in the avenue,
// the courtyards and the Tongque Garden, willows at the water, millet and wheat in the country; the dry haze of the North China plain.
// Pure (used by the relief, the collision and the plant workers).

import { KEEP } from './forecourt.js';
import { GATES_S, GATES_N, inFarm, RADIUS, PALACE, W_TERRACE, TERRACES, SPARROW, zOf, POND, POND_Y, AVENUE, MARKET, WARDS, RIVER, riverZ, height, inPond, inRiver, inRect, inLot, lots, streets, inCity } from './layout.js';

function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
const inWard = (x, z) => WARDS.some((w) => inRect(w, x, z));
const GARDEN = [-245, -170, -85, -6];
let LOTS = null;
const lotAt = (x, z) => (LOTS ??= lots()).find((l) => inRect(l.rect, x, z));
const nearTerrace = (x, z, m = 0) => TERRACES.some((t) => inRect([t.r[0], t.r[1], t.r[2] + 26, t.r[3]], x, z, m));
function cover(x, z, h) {
  const c = { sand: 0.35, grass: 0.1, rock: 0, soil: 0.55, fields: 0, dry: 0.8, warmth: 0.8, red: 0.1, road: 0, snow: 0, forest: 0 };
  if (h < -0.8) { c.soil = 0.9; c.sand = 0.1; c.dry = 0.3; return c; }
  if (Math.hypot(x, z) > RADIUS - 40 || !inCity(x, z)) {
    if (inRiver(x, z, 6)) { c.sand = 0.5; c.soil = 0.5; c.fields = 0; c.grass = 0.2; return c; }
    if (roadOut(x, z)) { c.road = 0.8; c.sand = 0.3; c.soil = 0.4; c.fields = 0; c.grass = 0.05; return c; }
    if (inFarm(x, z)) { c.road = 0.25; c.soil = 0.6; c.fields = 0.1; c.grass = 0.1; return c; }
    c.fields = 0.7; c.grass = 0.25; c.dry = 0.5; return c;
  }
  if (inRect(W_TERRACE.r, x, z, 3) || inRect([-50, -102, 50, -8], x, z) || nearTerrace(x, z, 3)) { c.road = 0.9; c.sand = 0.2; c.soil = 0.2; c.dry = 0.9; return c; }
  if (inRect(AVENUE, x, z) || inRect(MARKET, x, z) || streets().some((r) => inRect(r, x, z))) { c.road = 0.85; c.sand = 0.3; c.soil = 0.4; return c; }
  if (inRect(GARDEN, x, z)) { c.grass = 0.45; c.sand = 0.25; c.soil = 0.45; c.road = 0.05; return c; }
  c.sand = 0.45 + 0.15 * hash2(x * 0.07, z * 0.07); c.road = 0.15;
  return c;
}
/** The roads outside the gates: from each south gate south, from each north gate to the river, the avenue east and west. */
const roadOut = (x, z) => (z > 176 && GATES_S.some((g) => Math.abs(x - g) < 3.5)) || (z < -176 && z > riverZ(x) + 16 && GATES_N.some((g) => Math.abs(x - g) < 3.5)) || (Math.abs(z - 25) < 5 && Math.abs(x) > 246);
const GARDEN_WAYS = [[-141, -93.5, -100, -82.5], [-114, -135, -108, -93], [-114, -83, -108, -37], [-136, -37.5, -98, -33], [-135, -40, -99, -22]];
const water = (x, z, y) => (inRiver(x, z) && y < RIVER.y + 0.3) || (inPond(x, z) && y < POND_Y + 0.3);
const waterLevel = (x, z) => (inRiver(x, z, 1) ? RIVER.y : inPond(x, z, 0.5) ? POND_Y : -Infinity);
const fromWater = (x, z) => (inRiver(x, z) || inPond(x, z) ? -3 : Math.max(-5, Math.min(40, Math.min(Math.abs(z - riverZ(x)) - RIVER.w / 2, 30, Math.hypot(Math.max(0, POND[0] - x, x - POND[2]), Math.max(0, POND[1] - z, z - POND[3]))))));
/** Plants per 100 m²: elms and pagoda trees along the avenue, willows at the water, jujube and mulberry in the courtyards, the garden's trees, millet and wheat outside the city. */
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || inRiver(x, z, 1) || inPond(x, z, 0.4)) return null;
  if (inRiver(x, z, 7)) return { willow: 1.0, reeds: 4, grass: 12 };
  if (inPond(x, z, 6)) return { willow: 1.2, pagoda_tree: 0.2, grass: 8 };
  if (nearTerrace(x, z, 2) || inRect([-50, -102, 50, -8], x, z, 3)) return null;
  if (inRect(AVENUE, x, z)) { const e = Math.min(x - AVENUE[0], AVENUE[2] - x, z - AVENUE[1], AVENUE[3] - z); return e < 2.5 && Math.abs(x) > 12 ? { pagoda_tree: 0.7, elm: 0.35 } : null; }
  if (streets().some((r) => inRect(r, x, z, 0.3))) return null;
  if (inLot(x, z, 0.5)) {
    const l = lotAt(x, z);
    if (l && l.kind === 'court') {
      const [x0, z0, x1, z1] = l.rect, v = l.front === 's' ? z1 - z : z - z0, u = x - x0;
      if (v > 2 && v < (z1 - z0) - 9 && u > 1.5 && u < (x1 - x0) - 1.5) return { jujube: 0.8, mulberry: 0.5, grass: 3 };
    }
    return null;
  }
  if (inRect(MARKET, x, z, 1) || inWard(x, z)) return null;
  if (inRect(GARDEN, x, z)) {
    if (GARDEN_WAYS.some((r) => inRect(r, x, z, 1.5))) return null;
    if (KEEP.some(([kx, kz, kr]) => Math.hypot(x - kx, z - kz) < kr)) return { grass: 6 };
    // the approach to the Sparrow's stair: two files of arborvitae and pine either side of the forecourt, the royal way and the lawns before it open
    if (x > -166 && x < -126 && Math.abs(z - zOf(SPARROW)) > 10.5 && Math.abs(z - zOf(SPARROW)) < 14) return { arborvitae: 1.5, chinese_pine: 0.4, grass: 6 };
    // the Tongque Garden: clumps of pines, arborvitae, elms and persimmons in the lawns, the paths and the arrival's lawn left open
    const cell = hash2(Math.floor(x / 11), Math.floor(z / 11));
    if (inRect([-160, -112, -100, -64], x, z)) return cell < 0.25 ? { arborvitae: 0.18, chinese_pine: 0.1, grass: 6 } : { grass: 7 };
    return cell < 0.5 ? { chinese_pine: 0.28, arborvitae: 0.3, elm: 0.18, pagoda_tree: 0.16, persimmon: 0.1, grass: 6 } : { grass: 8, jujube: 0.04 };
  }
  if (inRect(PALACE, x, z)) {
    if (Math.abs(x) > 71 && Math.abs(x) < 73.6 && z > -150 && z < -14) return { arborvitae: 0.5, grass: 2 };
    return hash2(x * 0.2, z * 0.2) < 0.06 ? { pagoda_tree: 0.5, grass: 2 } : { grass: 2 };
  }
  if (!inCity(x, z)) {
    if (roadOut(x, z)) return null;
    if (inFarm(x, z)) return { grass: 3, jujube: 0.15, persimmon: 0.05 };
    const e = (x + 1000) % 22;
    if (hash2(x * 0.3, z * 0.3) < 0.04) return { willow: 0.2, elm: 0.1, grass: 6 };
    return e < 1 ? { grass: 14 } : { wheat: 90, grass: 4 };
  }
  return { pagoda_tree: 0.15, elm: 0.12, jujube: 0.1, grass: 4 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { pagoda_tree: 0.7, elm: 0.6, willow: 1.4, jujube: 0.8, mulberry: 0.5, wheat: 90, arborvitae: 1.6, chinese_pine: 0.45, persimmon: 0.1, reeds: 4 },
  climate: {
    sun: { az: 160, el: 50, color: [1.0, 0.95, 0.87], intensity: 3.3, lat: 36.3, dec: 8, hour: 10.5 },
    sky: { turbidity: 4.0, rayleigh: 1.12, mie: 0.007, mieG: 0.82, zenith: [0.12, 0.2, 0.36], horizon: [0.7, 0.68, 0.64] },
    fog: { color: [0.78, 0.76, 0.7], density: 0.0006, height: 0.013 },
    exposure: 0.5,
    wind: [0.35, 0.2],
    damp: 0.2,
    waterline: RIVER.y,
    weather: [
      { id: 'clear', weight: 4, clouds: 0.15, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'haze', weight: 2.5, clouds: 0.3, cloudDensity: 0.35, sun: 0.85, fog: 1.7, fogColor: [0.8, 0.76, 0.66] },
      { id: 'summer-rain', weight: 0.8, clouds: 0.85, cloudDensity: 0.7, sun: 0.4, fog: 2, rain: 0.4 },
    ],
  },
};
