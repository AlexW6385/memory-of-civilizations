// Plants of the open country (DESIGN §11, Planet L2): trees, bushes and boulders scattered over
// the land by its climate — conifers in the cold north, oaks and elms in the moist middle
// latitudes, holm oaks, olives, pines and cypresses round the Mediterranean, acacias in the
// savanna, teak and banyans in the wet tropics, palms and tamarisks by desert water — thick where
// the ground is forest, scattered elsewhere. Pure: the same in the workers and the tools.
// Cells are tiles of the ground's quadtree at CELL_LEVEL (src/planet/chunk.js), so that the plants
// of a place do not change with the ground's detail.

import { faceDir, tileRect } from './chunk.js';
import { noise3 } from './noise.js';
import { cliffK } from './wild.js';
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

// ── Ground cover ─────────────────────────────────────────────────────────────
// What grows at the visitor's feet (src/planet/open-flora.js draws it within ~80 m): grass tufts and
// tall grass, wildflowers in temperate meadows, steppe and savanna grass, heather in the north, ferns
// in forest, rushes and reeds along rivers and coasts, dry stalks at desert margins. Cells of ~18 m.

export const COVER_LEVEL = 10;
const COVER_NODES = 8;

/** What grows at a place, as [[species, plants per m²], …] (c: coverAt; ny: how level the ground is). */
export function coverMix(g, c, u, ny) {
  const { n, h } = g, warm = n.warm, moist = n.moist;
  if (g.s && g.s.w > 0.02) return [];
  if (h < -0.7 || c.snow > 0.35 || c.road > 0.3 || c.fields > 0.3 || ny < 0.62) return [];
  const px = u[0] * R, py = u[1] * R, pz = u[2] * R;
  const out = [], add = (sp, d) => { if (d > 0.01) out.push([sp, d]); };
  const patch = noise3(px / 24 + 2.3, py / 24, pz / 24) * 0.5 + 0.5, blooms = sm(0.5, 0.72, noise3(px / 13 + 9, py / 13, pz / 13) * 0.5 + 0.5);
  // the waterside: rushes and reeds on the banks of a river and in patches along sheltered coasts
  const bank = (n.river ?? 0) * (1 - Math.min(1, (n.bar ?? 0) * 2)), shoreK = n.d > 0 ? sm(45, 8, n.d) * sm(0.5, 0.75, patch) * (1 - cliffK(px, py, pz)) * (1 - c.sand * 0.7) : 0;
  const wet = Math.max(bank, shoreK) * sm(2.4, 0.9, h) * (1 - Math.min(1, c.rock * 2));
  if (wet > 0.02) { add('reeds', 0.3 * wet); add('rush', 0.6 * wet); }
  const desert = sm(0.25, 0.12, moist), boreal = sm(0.45, 0.3, warm);
  const tropical = sm(0.7, 0.85, warm) * sm(0.5, 0.7, moist), savanna = sm(0.65, 0.8, warm) * sm(0.25, 0.4, moist) * (1 - tropical);
  const steppe = sm(0.2, 0.28, moist) * sm(0.44, 0.34, moist) * (1 - boreal) * (1 - savanna);
  const temperate = Math.max(0, 1 - desert - boreal - savanna - steppe - tropical * 0.5);
  const veg = Math.max(0, c.grass + 0.5 * c.soil) * (1 - c.sand) * (1 - c.rock) * (1 - Math.min(1, bank * 2));
  const forest = c.forest * (1 - bank);
  const open = veg * (1 - forest * 0.7);
  add('grass', 0.45 * open * (temperate + tropical * 0.5));
  add('tall_grass', 0.24 * open * (temperate * patch + tropical * 0.9));
  add('flowers', 0.34 * open * temperate * blooms * (1 - boreal));
  add('steppe_grass', 0.5 * open * (steppe + savanna * 1.1));
  add('grass_dry', 0.26 * open * (steppe + savanna));
  add('heather', 0.6 * veg * boreal * (1 - forest * 0.5) + 0.15 * c.rock * boreal);
  add('grass_dry', 0.12 * veg * boreal);
  add('fern', 0.55 * forest * (1 - boreal * 0.4) * (1 + tropical * 0.6));
  add('grass', 0.18 * forest * temperate);
  // desert margins: dry stalks and scrub where something grows at all
  add('halfa', 0.1 * desert * (1 - c.sand * 0.5) * (0.4 + patch) + 0.02 * desert * c.sand * sm(0.4, 0.7, patch));
  add('steppe_grass', 0.05 * desert * (1 - c.sand) * sm(0.55, 0.8, patch));
  return out;
}

/**
 * The ground cover of cell (face, i, j) at COVER_LEVEL: a Float32Array of [x, y, z (planet), species,
 * rank (0…1: the plant's place in the thinning with distance), yaw, scale (0…1), tint (0…1)].
 */
export function scatterCover(face, i, j) {
  const [s0, t0, size] = tileRect(COVER_LEVEL, i, j);
  const side = size * Math.PI / 4 * R, area = side * side, N = COVER_NODES, W = N + 1;
  const rand = rng((face + 1) * 40503 ^ (i + 1) * 69069 ^ (j + 1) * 1103515245 ^ 0x5bd1e995);
  // the ground on a grid of nodes: its height and, from the neighbours, how level it is; what grows at each
  const U = [], G = [], H = new Float64Array(W * W);
  for (let b = 0; b < W; b++) for (let a = 0; a < W; a++) {
    const u = faceDir(face, s0 + size * a / N, t0 + size * b / N), g = surface(u);
    U.push(u); G.push(g); H[b * W + a] = g.h;
  }
  const step = side / N, mixes = [];
  let any = false;
  for (let b = 0; b < W; b++) for (let a = 0; a < W; a++) {
    const k = b * W + a, hx = (H[b * W + Math.min(N, a + 1)] - H[b * W + Math.max(0, a - 1)]) / (step * (Math.min(N, a + 1) - Math.max(0, a - 1)));
    const hy = (H[Math.min(N, b + 1) * W + a] - H[Math.max(0, b - 1) * W + a]) / (step * (Math.min(N, b + 1) - Math.max(0, b - 1)));
    const ny = 1 / Math.hypot(hx, hy, 1), c = coverAt(G[k], ny, U[k]), m = coverMix(G[k], c, U[k], ny);
    mixes.push(m); if (m.length) any = true;
  }
  if (!any) return new Float32Array(0);
  const out = [], cands = Math.round(area * 1.3);
  for (let k = 0; k < cands; k++) {
    const a = rand(), b = rand(), pick = rand(), rank = rand(), yaw = rand() * Math.PI * 2, sc = rand(), tint = rand();
    const ia = Math.min(N - 1, Math.floor(a * N)), ib = Math.min(N - 1, Math.floor(b * N)), fa = a * N - ia, fb = b * N - ib;
    const near = Math.round(b * N) * W + Math.round(a * N), m = mixes[near];
    if (!m.length) continue;
    let acc = 0, sp = null;
    for (const [s, d] of m) { acc += d / 1.3; if (pick < acc) { sp = s; break; } }
    if (!sp) continue;
    const h = (H[ib * W + ia] * (1 - fa) + H[ib * W + ia + 1] * fa) * (1 - fb) + (H[(ib + 1) * W + ia] * (1 - fa) + H[(ib + 1) * W + ia + 1] * fa) * fb;
    const u = faceDir(face, s0 + size * a, t0 + size * b), r = R + h - 0.04;
    out.push(u[0] * r, u[1] * r, u[2] * r, IDX[sp], rank, yaw, sc, tint);
  }
  return new Float32Array(out);
}
