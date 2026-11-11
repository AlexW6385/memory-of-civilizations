// Northern Song Bianjing — the ground: the flat Yellow River plain, the Bian River sunk between
// low banks; willows along the water, pagoda trees (huai) and jujubes among the houses; to the east the open
// country — green winter wheat in strips, willows along the field roads; the hazy spring sky.

import { PAVE_R, MAJOR, APPROACH, RIVER_WALK, isMargin, isPaved, RADIUS, RIVER, MONASTERY, STREETS, LANES, FIELDS_X, WALL_X, STONE_BANK, inRect, inRiver, inLot, lotAt, zoneOf, smooth as sm } from './layout.js';

/** The earth streets and lanes (not the paved shop streets near the bridge): the distance in m to the nearest edge of the way's rectangle, or 0. */
function earthWay(x, z) {
  if (x < WALL_X + 8 || x > FIELDS_X || wet(x, z)) return 0;
  let e = 0;
  const edge = (r) => Math.min(x - r[0], r[2] - x, z - r[1], r[3] - z);
  for (let i = 0; i < STREETS.length; i++) if (inRect(STREETS[i], x, z) && !((i < MAJOR || i === 14) && Math.hypot(x, z - 76) < PAVE_R)) e = Math.max(e, edge(STREETS[i]));
  for (const r of LANES) if (inRect(r, x, z)) e = Math.max(e, edge(r));
  return e;
}
/** Hollows in the beaten earth where the rain stands: a shallow dish every 25-40 m along the way, deeper in the wheel tracks (two grooves 1.5 m apart). */
function hollow(x, z) {
  const a = Math.sin(x * 0.19 + Math.sin(z * 0.11) * 2.0) * Math.sin(z * 0.17 + Math.sin(x * 0.07) * 2.3);
  const dish = sm(0.35, 0.9, a);
  const rut = 0.4 * (sm(0.75, 0.95, Math.sin(x * 4.19)) + sm(0.75, 0.95, Math.sin(z * 4.19)));
  return dish * 0.09 + rut * 0.02;
}
function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  let h = 0;
  const ew = earthWay(x, z);
  if (ew > 0) h -= hollow(x, z) * sm(0, 1.0, ew);
  // the bed slopes from 4 m before the water on the earth banks; the stone banks (and the paved landings by them) stand square, so the earth strip by the water stays level
  const lead = 4 * sm(STONE_BANK, STONE_BANK + 25, Math.abs(x));
  if (z > RIVER.z0 - lead && z < RIVER.z1 + lead) h = RIVER.bed * sm(0, 4 + lead, Math.min(z - RIVER.z0 + lead, RIVER.z1 + lead - z));
  return h * (1 - sm(RADIUS - 30, RADIUS, r));
}
const wet = (x, z) => inRiver(x, z);
/** The earth banks: the last 4 m of land before the water, beyond the stone banks by the bridge. */
const bank = (x, z) => Math.abs(x) > STONE_BANK && ((z > RIVER.z0 - 4 && z <= RIVER.z0) || (z >= RIVER.z1 && z < RIVER.z1 + 4));
/** The field strips, 14–20 m wide, running north–south between the roads; every fourth one lies fallow. */
const strip = (x) => Math.floor((x - FIELDS_X) / 17);
const fallow = (x, z) => (strip(x) + Math.floor((z + 400) / 60)) % 4 === 3;
function cover(x, z) {
  const c = { sand: 0.3, grass: 0.2, rock: 0, soil: 0.5, fields: 0, dry: 0.35, warmth: 0.5, red: 0, road: 0, snow: 0, forest: 0 };
  if (wet(x, z)) { c.soil = 0.7; c.sand = 0.3; return c; }
  if (Math.hypot(x, z) > RADIUS - 28) { c.fields = 0.8; c.grass = 0.2; return c; }
  if (isMargin(x, z)) { const w = x > -STONE_BANK && x < STONE_BANK && (Math.abs(z - RIVER.z0 + 5.5) < 5.5 || Math.abs(z - RIVER.z1 - 5.5) < 5.5); c.road = 0.8; c.soil = 0.55; c.grass = w ? 0.34 : 0.16; c.sand = w ? 0.05 : 0.12; c.dry = 0.3; return c; }
  const street = STREETS.some((s) => inRect(s, x, z)), lane = LANES.some((s) => inRect(s, x, z));
  if (earthWay(x, z) > 0) { c.road = 1; c.soil = 0.5; c.grass = 0.04; c.sand = 0.1; c.dry = 0.3; return c; }     // beaten earth, ruts and hollows
  if (lane && x < FIELDS_X) { c.road = 0.8; c.grass = 0.1; return c; }
  if (x > FIELDS_X) {
    // the country: the roads of beaten earth, the field strips (wheat, and some lying fallow), the banks in grass
    if (street) { c.road = bank(x, z) ? 0.5 : 0.75; c.grass = 0.2; return c; }
    if (lotAt(x, z, 1)) { c.road = 0.2; c.soil = 0.6; c.grass = 0.35; return c; }
    if (z > RIVER.z0 - 6 && z < RIVER.z1 + 6) { c.grass = 0.6; c.soil = 0.4; return c; }
    if (fallow(x, z)) { c.soil = 0.8; c.grass = 0.3; c.dry = 0.5; return c; }
    c.fields = 0.95; c.grass = 0.3; c.dry = 0.15; return c;
  }
  // the earth banks beyond the stone ones, trodden along the towpath on the north side
  if (bank(x, z)) { c.road = z < RIVER.z0 ? 0.55 : 0.15; c.grass = z < RIVER.z0 ? 0.25 : 0.6; return c; }
  if (inLot(x, z, 0.3)) { c.road = 0; return c; }
  // the yards behind the houses: trodden earth with grass at the edges; outside the gate the ground is earth and field
  if (lotAt(x, z)) { c.road = 0.2; c.soil = 0.6; c.grass = 0.35; return c; }
  if (!street && zoneOf(x) === 'suburb') { c.road = 0.15; c.grass = 0.4; c.soil = 0.5; return c; }
  c.road = street ? 0.9 : 0.4; return c;
}
function water(x, z, y) { return wet(x, z) && y < RIVER.water + 0.3; }
function waterLevel(x, z) { return wet(x, z) ? RIVER.water : -Infinity; }
function fromWater(x, z) { return wet(x, z) ? 0 : Math.min(Math.abs(z - RIVER.z0), Math.abs(z - RIVER.z1)); }
/** Plants per 100 m²: willows on the riverbanks, pagoda trees (huai) and jujubes in the gaps between the houses and in the monastery's court. */
function planting(x, z) {
  if (Math.hypot(x, z) > RADIUS - 6 || wet(x, z)) return null;
  // the river streets' earth strip by the water (within the paved reach): willows in a row along the edge, grass tufts and bare earth behind, none on the paved walk and its landing paths
  if (!isPaved(x, z) && isMargin(x, z) && z > RIVER.z0 - 11 && z < RIVER.z1 + 11 && !inRect(STREETS[0], x, z) && !inRect(STREETS[1], x, z)) {
    const dw = z < RIVER.z0 ? RIVER.z0 - z : z - RIVER.z1;
    return dw < 2.2 ? { willow: 2.2, grass: 14 } : { grass: 12 };
  }
  // the beaten margins by the house walls on the main street and the cross shop streets: weeds and tufts along the wall's foot, thinning out toward the paving
  if (isMargin(x, z) && !isPaved(x, z)) return lotAt(x, z, 1.6) ? { grass: 9 } : { grass: 2.5 };
  if (isPaved(x, z)) return null;
  // willows along the earth banks: thick on the south bank, a few on the north one, where the towpath runs at their feet
  if (bank(x, z)) return z > RIVER.z1 ? { willow: 1.2 } : (z < RIVER.z0 - 3 ? { willow: 0.25 } : null);
  if (STREETS.some((s) => inRect(s, x, z, 0.5)) || LANES.some((s) => inRect(s, x, z, 0.5)) || inLot(x, z, 0.5)) return null;
  // street trees: pagoda trees (huai) in the free gaps at the shop streets' corners and crossings (about one every 40 m of frontage), none in front of the shops
  if (!lotAt(x, z, 0.8) && x > WALL_X + 12 && x < FIELDS_X && STREETS.some((st, i) => (i < MAJOR || i === 14) && inRect(st, x, z, 4))) return { pagoda_tree: 3, grass: 3 };
  const yard = lotAt(x, z);
  if (yard && x < FIELDS_X) return { jujube: 0.55, pagoda_tree: 0.12, mulberry: 0.2, grass: 6 };      // trees in the yards behind the houses
  if (yard) return { jujube: 0.5, pagoda_tree: 0.2, mulberry: 0.3, poplar: 0.1, grass: 6 };
  if (x > FIELDS_X) {
    if (z > RIVER.z0 - 6 && z < RIVER.z1 + 6) return { grass: 14 };
    // the field strips' edges: a balk of grass between strips, a willow here and there along it
    const e = (x - FIELDS_X) % 17;
    if (e < 0.8) return { willow: 0.15, grass: 16 };
    if (fallow(x, z)) return { grass: 6 };
    return { wheat: 100, grass: 6 };
  }
  if ((z > RIVER.z0 - 4 && z < RIVER.z0) || (z > RIVER.z1 && z < RIVER.z1 + 4)) return Math.abs(x) > 24 ? { willow: 2.4 } : null;
  if (inRect(APPROACH, x, z, 1)) return null;                                                   // the paved approach
  if (inRect(MONASTERY, x, z)) return Math.abs(x - 160) < 28 ? null : { pagoda_tree: 0.08, grass: 12 };   // the court is paved (court.js): nothing grows on it
  // the streets' own trees: pagoda trees (huai) and poplars along the lanes, willows by the wall's foot; the gaps between the blocks
  if (Math.abs(x - WALL_X) < 14) return { willow: 0.3, pagoda_tree: 0.1, grass: 10 };
  if (zoneOf(x) === 'suburb') return { pagoda_tree: 0.12, willow: 0.12, poplar: 0.06, jujube: 0.1, grass: 12 };
  return { pagoda_tree: 0.1, jujube: 0.1, mulberry: 0.06, poplar: 0.04, grass: 12 };
}
export const ground = {
  height, cover, water, waterLevel, planting, fromWater,
  maxDensity: { willow: 2.4, pagoda_tree: 3, jujube: 0.55, mulberry: 0.3, poplar: 0.1, wheat: 100 },
  climate: {
    sun: { az: 160, el: 45, color: [1.0, 0.95, 0.87], intensity: 3.0, lat: 35, dec: 5, hour: 10.5 },
    sky: { turbidity: 4.5, rayleigh: 1.2, mie: 0.007, mieG: 0.82, zenith: [0.12, 0.19, 0.33], horizon: [0.68, 0.68, 0.66] },
    fog: { color: [0.77, 0.77, 0.75], density: 0.0007, height: 0.013 },
    exposure: 0.5,
    waterline: RIVER.water,   // the river's still water: the stain on the revetments and the wharves' piles
    damp: 0.4,      // the spring rains of Qingming on the plain: some streaking and moss at the foot of walls
    wind: [0.3, 0.2],
    weather: [
      { id: 'spring-haze', weight: 3, clouds: 0.35, cloudDensity: 0.4, sun: 0.85, fog: 1.5 },
      { id: 'clear', weight: 2, clouds: 0.15, cloudDensity: 0.3, sun: 1.0, fog: 1 },
      { id: 'qingming-rain', weight: 1.2, clouds: 0.9, cloudDensity: 0.75, sun: 0.35, fog: 2, rain: 0.5 },
    ],
  },
};
