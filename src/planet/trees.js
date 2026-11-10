// Plants of the open country (DESIGN §11, Planet L2): trees, bushes and boulders scattered over
// the land by its climate — conifers in the cold north, oaks and elms in the moist middle
// latitudes, holm oaks, olives, pines and cypresses round the Mediterranean, acacias in the
// savanna, teak and banyans in the wet tropics, palms and tamarisks by desert water — thick where
// the ground is forest, scattered elsewhere. Pure: the same in the workers and the tools.
// Cells are tiles of the ground's quadtree at CELL_LEVEL (src/planet/chunk.js), so that the plants
// of a place do not change with the ground's detail.

import { faceDir, tileRect } from './chunk.js';
import { surface, coverAt, PLANET_RADIUS as R } from './relief.js';
import { SPECIES } from '../engine/flora/species-list.js';
import { unmapPlanet } from './warp.js';
import { latLon } from './geo.js';

export const CELL_LEVEL = 7;
export const TREE_SPECIES = SPECIES;
const IDX = Object.fromEntries(SPECIES.map((s, i) => [s, i]));
const sm = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// Biome regions, in Earth's true latitude and longitude (the planet's climate fields cannot tell a
// dry-summer climate from a monsoon one): boxes [lat0, lat1, lon0, lon1] with a soft edge in degrees.
const box = (la, lo, [a0, a1, o0, o1], e) => sm(a0 - e, a0 + e, la) * sm(a1 + e, a1 - e, la) * sm(o0 - e, o0 + e, lo) * sm(o1 + e, o1 - e, lo);
const regionOf = (boxes, e, la, lo) => boxes.reduce((m, b) => Math.max(m, box(la, lo, b, e)), 0);
// truly Mediterranean (dry summers): the Mediterranean basin and the Levant, California, central Chile, the Cape, the south-west and south of Australia
const MEDITERRANEAN = [[30, 44.5, -10, 37], [32, 40, -124, -116], [-40, -30, -74, -70], [-36, -31.5, 17, 25], [-36, -29, 114, 124], [-37, -33, 134, 141]];
// humid subtropical (wet summers): East Asia, the south-east USA, south Brazil and the Plata, south-east Australia, Natal
const SUBTROPICAL_EAST_ASIA = [[22.5, 37, 100, 142]];
const SUBTROPICAL_OTHER = [[25, 37, -100, -75], [-35, -22, -58, -42], [-38, -25, 146, 154], [-33, -26, 28, 33]];
const MONSOON_INDIA = [[20, 30, 75, 92]];       // the Ganges plain: neem, banyan, teak, bamboo
const JAPAN = [[30, 38, 129.5, 142]];

/** What grows at a place: [[species, plants per 100 m²], …]. u: the place's direction (for the biome regions). */
export function mix(g, c, u) {
  const { n, h } = g, warm = n.warm, moist = n.moist;
  if (h < 0.6 || c.snow > 0.5 || c.sand > 0.7 && moist > 0.3) return [];   // sea, snow, beach
  const forest = c.forest, open = Math.max(0, c.grass + c.soil * 0.5) * (1 - forest);
  const out = [];
  const add = (sp, d) => { if (d > 0.002) out.push([sp, d]); };
  let boreal = sm(0.45, 0.3, warm), tropical = sm(0.7, 0.85, warm) * sm(0.5, 0.7, moist);
  let savanna = sm(0.65, 0.8, warm) * sm(0.25, 0.4, moist) * (1 - tropical);
  let medit = sm(0.5, 0.62, warm) * sm(0.8, 0.7, warm) * sm(0.3, 0.42, moist) * sm(0.62, 0.5, moist);
  const desert = sm(0.25, 0.12, moist);
  // the biome regions: only where Earth is truly Mediterranean does that class stand; wet-summer lands get their own
  let la = 0, ea = 0, sub = 0, monsoon = 0, jp = 0, oth = 0;
  if (u && warm > 0.45 && moist > 0.2) {
    const [la0, lo] = latLon(unmapPlanet(u)); la = la0;
    const tmed = regionOf(MEDITERRANEAN, 2, la0, lo);
    // in the Mediterranean regions the class is wider than the fields' window (it reaches up the Italian and Balkan coasts); elsewhere it is gone
    medit = tmed * Math.max(medit, sm(0.45, 0.58, warm) * sm(0.28, 0.4, moist) * (1 - tropical));
    savanna *= 1 - tmed;
    ea = regionOf(SUBTROPICAL_EAST_ASIA, 2, la0, lo); oth = regionOf(SUBTROPICAL_OTHER, 2, la0, lo);
    monsoon = regionOf(MONSOON_INDIA, 2, la0, lo); jp = regionOf(JAPAN, 1.5, la0, lo);
    sub = Math.max(ea, oth) * (1 - desert) * (1 - boreal);
  }
  const tame = 1 - sub;
  tropical *= tame; savanna *= tame; medit *= tame;
  const temperate = Math.max(0, 1 - boreal - tropical - savanna - medit - desert) * tame * (1 - monsoon * 0.9);
  const dense = forest * 1.1 + open * 0.06;
  // humid subtropical: evergreen broadleaf, fir, masson/loblolly pine, bamboo groves; mulberry and tea on cultivated ground
  if (sub > 0.01) {
    const wsub = sub * (ea >= oth ? 1 : 0), wo = sub * (ea >= oth ? 0 : 1), fl = c.fields;
    add('camphor', dense * wsub * 0.3 + dense * wo * 0.2); add('chinese_fir', dense * wsub * 0.2); add('masson_pine', (dense * 0.25 + open * 0.015) * wsub + dense * wo * 0.35);
    add('bamboo', (dense * 0.14 + open * 0.02) * wsub * (1 - jp * 0.5)); add('maple', dense * wsub * 0.05 * sm(29, 33, la)); add('oak', dense * wsub * 0.08 + dense * wo * 0.3); add('elm', dense * wo * 0.1);
    add('sugi', dense * wsub * jp * 0.25); add('red_pine', dense * wsub * jp * 0.1);
    add('willow', wsub * sm(30, 6, n.d) * 0.06); add('mulberry', (open * 0.03 + fl * 0.12) * wsub); add('tea', fl * wsub * 0.3);
  }
  const monsoonK = monsoon * (1 - sub) * Math.max(0, 1 - desert - boreal);
  if (monsoonK > 0.01) { add('neem', (open * 0.06 + dense * 0.1) * monsoonK); add('banyan', dense * monsoonK * 0.05); add('teak', dense * monsoonK * 0.3); add('bamboo', dense * monsoonK * 0.1); add('acacia', open * monsoonK * 0.05); }
  add('spruce', dense * boreal * 0.5); add('birch', (dense + open * 0.3) * boreal * 0.12); add('chinese_pine', dense * boreal * 0.45 + c.rock * 0.03 * (1 - desert));
  add('oak', dense * temperate * 0.45); add('elm', dense * temperate * 0.25); add('willow', temperate * sm(30, 6, n.d) * 0.05); add('poplar', open * temperate * 0.02);
  add('holm_oak', dense * medit * 0.35); add('stone_pine', dense * medit * 0.2); add('aleppo_pine', dense * medit * 0.2); add('cypress', open * medit * 0.03); add('olive', open * medit * 0.06); add('maquis', (open + c.rock) * medit * 0.4);
  add('teak', dense * tropical * 0.45); add('banyan', dense * tropical * 0.06); add('bamboo', dense * tropical * 0.2); add('neem', open * tropical * 0.06);
  add('acacia', (dense + open * 0.3) * savanna * 0.25 + desert * c.sand * 0.004); add('sycamore_fig', open * savanna * 0.02);
  add('date_palm', desert * sm(40, 8, n.d) * 0.05); add('tamarisk', desert * 0.01);
  add('boulder', c.rock * 0.25);
  return out;
}

/**
 * The plants of cell (face, i, j) at CELL_LEVEL: a Float32Array of [x, y, z (planet), species,
 * variant, yaw, scale (0…1), tint (0…1)] per plant. Settlements' discs are left to their own planting.
 */
export function scatterCell(face, i, j) {
  const [s0, t0, size] = tileRect(CELL_LEVEL, i, j);
  const area = (size * Math.PI / 4 * R) ** 2;
  const rand = rng((face + 1) * 73856093 ^ (i + 1) * 19349663 ^ (j + 1) * 83492791);
  const out = [];
  const N = Math.round(area / 100 * 1.4);
  for (let k = 0; k < N; k++) {
    const a = rand(), b = rand(), pick = rand();
    const u = faceDir(face, s0 + size * a, t0 + size * b);
    const g = surface(u);
    if (g.s && g.s.w > 0.05) continue;
    // the slope, from two nearby samples
    const e = 1.5 / (Math.PI / 4 * R), ua = faceDir(face, s0 + size * a + e, t0 + size * b), ub = faceDir(face, s0 + size * a, t0 + size * b + e);
    const ha = surface(ua).h, hb = surface(ub).h;
    const slope = Math.hypot(ha - g.h, hb - g.h) / 1.5;
    const ny = 1 / Math.hypot(slope, 1);
    if (ny < 0.6) continue;
    const c = coverAt(g, ny, u);
    let acc = 0, sp = null;
    for (const [s, d] of mix(g, c, u)) { acc += d / 1.4; if (pick < acc) { sp = s; break; } }
    if (!sp) continue;
    const r = R + g.h - 0.05;
    out.push(u[0] * r, u[1] * r, u[2] * r, IDX[sp], Math.floor(rand() * 4), rand() * Math.PI * 2, rand(), rand());
  }
  return new Float32Array(out);
}
