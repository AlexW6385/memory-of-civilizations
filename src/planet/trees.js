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

export const CELL_LEVEL = 7;
export const TREE_SPECIES = SPECIES;
const IDX = Object.fromEntries(SPECIES.map((s, i) => [s, i]));
const sm = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** What grows at a place: [[species, plants per 100 m²], …]. */
export function mix(g, c) {
  const { n, h } = g, warm = n.warm, moist = n.moist;
  if (h < 0.6 || c.snow > 0.5 || c.sand > 0.7 && moist > 0.3) return [];   // sea, snow, beach
  const forest = c.forest, open = Math.max(0, c.grass + c.soil * 0.5) * (1 - forest);
  const out = [];
  const add = (sp, d) => { if (d > 0.002) out.push([sp, d]); };
  const boreal = sm(0.45, 0.3, warm), tropical = sm(0.7, 0.85, warm) * sm(0.5, 0.7, moist);
  const savanna = sm(0.65, 0.8, warm) * sm(0.25, 0.4, moist) * (1 - tropical);
  const medit = sm(0.5, 0.62, warm) * sm(0.8, 0.7, warm) * sm(0.3, 0.42, moist) * sm(0.62, 0.5, moist);
  const desert = sm(0.25, 0.12, moist);
  const temperate = Math.max(0, 1 - boreal - tropical - savanna - medit - desert);
  const dense = forest * 1.1 + open * 0.06;
  add('sugi', dense * boreal * 0.55); add('chinese_pine', dense * boreal * 0.45 + c.rock * 0.03 * (1 - desert));
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
    for (const [s, d] of mix(g, c)) { acc += d / 1.4; if (pick < acc) { sp = s; break; } }
    if (!sp) continue;
    const r = R + g.h - 0.05;
    out.push(u[0] * r, u[1] * r, u[2] * r, IDX[sp], Math.floor(rand() * 4), rand() * Math.PI * 2, rand(), rand());
  }
  return new Float32Array(out);
}
