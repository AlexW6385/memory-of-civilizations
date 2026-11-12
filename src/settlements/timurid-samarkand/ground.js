// Timurid Samarkand — the ground (docs/settlements/timurid-samarkand.md §8, §9): the flat loess plain of the Zeravshan
// valley with the observatory's hill (21 m) in the north-west; the Registan's packed earth, the paved court of the
// monuments, dusty lanes between the houses, aryk (irrigation channels) with poplars and plane trees along them, orchards
// of apple, mulberry and jujube at the edge; the dry, clear continental sky.

import { RADIUS, SQUARE, MADRASA, GUR, BIBI, HILL, inRect, inHouse, inBibi, inBazaar, onAryk, onHill, hillHeight, houseAt, houseGeom, CHORSU } from './layout.js';

function height(x, z) { return onHill(x, z) ? hillHeight(x, z) : 0; }
function cover(x, z) {
  const c = { sand: 0.25, grass: 0, rock: 0, soil: 0.5, fields: 0, dry: 0.7, warmth: 0.6, red: 0.05, road: 0, snow: 0, forest: 0 };
  const d = Math.hypot(x, z);
  if (onHill(x, z)) { c.grass = 0.15; c.dry = 0.85; c.rock = hillHeight(x, z) > 18 ? 0.2 : 0; return c; }
  if (inRect(SQUARE, x, z)) { c.sand = 0.5; c.soil = 0.4; c.road = 0.6; return c; }
  if (inRect(MADRASA, x, z) || inRect(GUR.rect, x, z) || inBibi(x, z) || inBazaar(x, z)) { c.road = 0.3; return c; }
  if (d > RADIUS - 70) { c.fields = 0.5; c.grass = 0.3; c.soil = 0.3; c.dry = 0.4; return c; }
  { const hs = houseAt(x, z, 0.3); c.road = hs ? (hs.garden ? 0 : 0) : 0.5; if (hs?.garden) { c.grass = 0.5; c.soil = 0.6; } }
  if (onAryk(x, z, 0.8)) { c.grass = 0.4; c.dry = 0.2; c.road = 0.1; }
  return c;
}
function water() { return false; }
function waterLevel() { return -Infinity; }
function fromWater() { return 1e4; }
/** Plants per 100 m²: poplars and plane trees along the aryk, an orchard at the edge, a few trees in the town's open ground and in the monuments' courts. */
function planting(x, z) {
  const d = Math.hypot(x, z);
  if (d > RADIUS - 6) return null;
  if (inRect(SQUARE, x, z, 14) || inRect(MADRASA, x, z, 4) || inBazaar(x, z, 2) || inBibi(x, z, 2) || inRect(GUR.rect, x, z, 4)) {
    // the Gur-e Amir's court and Bibi-Khanym's surroundings: a few plane trees on the outer side only
    return null;
  }
  if (onHill(x, z)) {
    if (Math.hypot(x - HILL.c[0], z - HILL.c[1]) < HILL.plateau + 30) return { grass_dry: 14 };
    return { grass_dry: 12, apple: 0.02 };
  }
  { const hs = houseAt(x, z, 0.4);
    if (hs) {
      for (const t of houseGeom(hs).trees) if (Math.abs(x - t.at[0]) < 0.9 && Math.abs(z - t.at[1]) < 0.9) return { [t.kind]: 1.5 };
      return hs.garden ? { grass: 14 } : null;
    } }
  if (inHouse(x, z, 0.6)) return null;
  if (onAryk(x, z, 2.6) && !onAryk(x, z, 0.9)) { const k = Math.abs(Math.round(z / 6)) % 2; return ((z % 6) + 6) % 6 < 1.2 ? { [k ? 'poplar' : 'plane_tree']: 2 } : { grass: 25 }; }
  if (d > RADIUS - 70) return inBibi(x, z, 45) || inRect(GUR.rect, x, z, 30) ? { grass: 20 } : { apple: 0.5, mulberry: 0.25, jujube: 0.2, grass: 24 };
  return { mulberry: 0.04, elm: 0.03, grass_dry: 10 };
}
void CHORSU; void BIBI;
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { fig: 1.5, plane_tree: 2, poplar: 2, apple: 0.9, mulberry: 1.5, jujube: 0.3, elm: 0.03 },
  climate: {
    sun: { az: 150, el: 48, color: [1.0, 0.96, 0.88], intensity: 3.4, lat: 39.7, dec: 5, hour: 10.5 },
    sky: { turbidity: 2.8, rayleigh: 1.1, mie: 0.004, mieG: 0.8, zenith: [0.1, 0.18, 0.37], horizon: [0.62, 0.65, 0.68] },
    fog: { color: [0.78, 0.76, 0.72], density: 0.0004, height: 0.01 },
    exposure: 0.48,
    wind: [0.4, 0.1],
    weather: [
      { id: 'clear', weight: 4, clouds: 0.08, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'high-cloud', weight: 1.5, clouds: 0.35, cloudDensity: 0.35, sun: 0.9, fog: 1.1 },
      { id: 'dust', weight: 0.8, clouds: 0.1, cloudDensity: 0.3, sun: 0.75, fog: 3.5, fogColor: [0.8, 0.72, 0.6] },
    ],
  },
};
