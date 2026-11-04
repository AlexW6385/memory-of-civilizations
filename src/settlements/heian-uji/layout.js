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
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const riverX = (z) => RIVER.x + 15 * Math.sin(z / 110);
export function pondDistance(x, z) {
  let best = Infinity;
  for (const P of POND) { const dx = (x - P.c[0]) / P.r[0], dz = (z - P.c[1]) / P.r[1]; best = Math.min(best, (Math.hypot(dx, dz) - 1) * Math.min(P.r[0], P.r[1])); }
  return best;
}
export const inPond = (x, z) => pondDistance(x, z) < 0;
export const inRiver = (x, z) => Math.abs(x - riverX(z)) < RIVER.w / 2 - 3 && Math.hypot(x, z) < RADIUS - 70;
export function height(x, z) {
  const r = Math.hypot(x, z), edge = smooth(RADIUS - 80, RADIUS - 40, r);
  let h = 0;
  const d = Math.abs(x - riverX(z));
  h = Math.min(h, (RIVER.bed) * smooth(RIVER.w / 2 + 8, RIVER.w / 2 - 6, d) * (1 - edge));
  if (x > riverX(z) + RIVER.w / 2) h = Math.max(h, 30 * smooth(riverX(z) + RIVER.w / 2 + 10, RADIUS - 40, x));   // the hills beyond the river
  const p = pondDistance(x, z);
  if (p < 5) { const bed = POND_LEVEL - 1.2; h = bed + (Math.max(h, bed) - bed) * smooth(-1, 5, p); }
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
    if (Math.hypot(cx, cz) > RADIUS - 60 || inRect(GARDEN, cx, cz, 18) || Math.abs(cz - BRIDGE.z) < 7 || Math.abs(cx - riverX(cz)) < RIVER.w / 2 + 20 || rand() < 0.45) continue;
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6), y: 0, foot: -0.2, front: rand() < 0.5 ? 's' : 'e' });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
