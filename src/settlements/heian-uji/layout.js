// Uji in 1053 — the layout (docs/settlements/heian-uji.md §2): Byōdō-in on the west bank of the Uji
// River, the Phoenix Hall on its island facing east across the Aji pond; the river to the east,
// the Uji Bridge crossing it to the north; the shrine of Ujigami among trees on the far bank; the
// village of timber houses along the road to the north and west; wooded hills beyond the river.
// Pure data. +x east, +z south.

import { PONDS } from '../../world/regions.js';

export const RADIUS = 360;
export const HALL = { origin: [-40, 0] };                  // the plan's origin (the central hall)
export const POND_LEVEL = -0.35;
export const POND = PONDS.find((p) => p.site === 'byodo-in-phoenix-hall').shapes.map(({ c, r }) => ({ c: [c[0] + HALL.origin[0], c[1] + HALL.origin[1]], r }));
export const GARDEN = [-100, -78, 60, 78];
export const RIVER = { x: 170, w: 62, level: -3, bed: -6 };
export const BRIDGE = { z: -190 };
/** The enclosed compounds (earthen walls): the Fujiwara villa west of the temple garden, a nobleman's house to the north of it. [x0, z0, x1, z1] */
export const VILLA = [-194, -34, -122, 46];
export const NOBLE = [-124, -148, -86, -114];
export const COMPOUNDS = [VILLA, NOBLE];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const riverX = (z) => RIVER.x + 15 * Math.sin(z / 110);
export function pondDistance(x, z) {
  let best = Infinity;
  for (const P of POND) { const dx = (x - P.c[0]) / P.r[0], dz = (z - P.c[1]) / P.r[1]; best = Math.min(best, (Math.hypot(dx, dz) - 1) * Math.min(P.r[0], P.r[1])); }
  return best;
}
/** The small island (koshima) in the pond's north arm, between the hall's island and the north shore, joined to both by bridges (docs/settlements/heian-uji.md §6). */
export const ISLAND = { c: [-55, -53], r: [6, 3.8], top: 0.3 };
/** Distance (m, negative inside) from the small island's outline at the ground's level. */
export function islandDistance(x, z) { const dx = (x - ISLAND.c[0]) / ISLAND.r[0], dz = (z - ISLAND.c[1]) / ISLAND.r[1]; return (Math.hypot(dx, dz) - 1) * Math.min(...ISLAND.r); }
export const inPond = (x, z) => pondDistance(x, z) < 0 && islandDistance(x, z) > -0.6;
export const inRiver = (x, z) => Math.abs(x - riverX(z)) < RIVER.w / 2 - 3 && Math.hypot(x, z) < RADIUS - 70;
export function height(x, z) {
  const r = Math.hypot(x, z), edge = smooth(RADIUS - 80, RADIUS - 40, r);
  let h = 0;
  const d = Math.abs(x - riverX(z));
  h = Math.min(h, (RIVER.bed) * smooth(RIVER.w / 2 + 8, RIVER.w / 2 - 6, d) * (1 - edge));
  if (x > riverX(z) + RIVER.w / 2) h = Math.max(h, 30 * smooth(riverX(z) + RIVER.w / 2 + 10, RADIUS - 40, x));   // the hills beyond the river
  const p = pondDistance(x, z);
  if (p < 5) { const bed = POND_LEVEL - 1.2; h = bed + (Math.max(h, bed) - bed) * smooth(-1, 5, p); }
  const q = islandDistance(x, z);
  if (q < 2) { const bed = POND_LEVEL - 1.2; h = Math.max(h, bed + (ISLAND.top - bed) * smooth(2, -2.5, q)); }
  return h * (1 - smooth(RADIUS - 40, RADIUS - 5, r));
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
/** Timber houses along the road north of the temple and on the west. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1053);
  for (let x = -300; x < 120; x += 15) for (let z = -300; z < 280; z += 14) {
    const w = 9 + rand() * 3, d = 7 + rand() * 2, cx = x + w / 2, cz = z + d / 2;
    if (Math.hypot(cx, cz) > RADIUS - 60 || inRect(GARDEN, cx, cz, 18) || COMPOUNDS.some((r) => inRect(r, cx, cz, 14)) || Math.abs(cz - BRIDGE.z) < 7 || Math.abs(cx - riverX(cz)) < RIVER.w / 2 + 20 || rand() < 0.45) continue;
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6), y: 0, foot: -0.2, front: rand() < 0.5 ? 's' : 'e' });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));

let GRID = null;
/** True within `m` metres (≤ 6) of a house: the beaten earth of the lanes and yards (a 2 m grid, built once). */
export function nearLot(x, z, m = 5) {
  if (!GRID) { GRID = new Set(); for (const l of lots()) for (let i = Math.floor((l.rect[0] - 6) / 2); i <= Math.floor((l.rect[2] + 6) / 2); i++) for (let j = Math.floor((l.rect[1] - 6) / 2); j <= Math.floor((l.rect[3] + 6) / 2); j++) GRID.add(i * 4096 + j); }
  void m;
  return GRID.has(Math.floor(x / 2) * 4096 + Math.floor(z / 2));
}
