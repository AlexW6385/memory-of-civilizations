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
export const inRiver = (x, z, m = 0) => Math.abs(x - riverX(z)) < RIVER.w / 2 - 3 + m && Math.hypot(x, z) < RADIUS - 70;
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

// ── the streets of the village (docs/settlements/heian-uji.md §15) ────────────────────────────────────
// Axis-aligned runs: a = start, b = end (one coordinate shared), hw = the half-width kept clear (the lane),
// kind 'road' (the Bridge road, the temple approach) or 'lane'. Houses stand on both sides, fronts to the lane.
export const STREETS = [
  { id: 'bridge', a: [-296, BRIDGE.z], b: [104, BRIDGE.z], hw: 3.8, kind: 'road' },        // the road to the Uji Bridge
  { id: 'north', a: [-290, -100], b: [60, -100], hw: 3.4, kind: 'lane' },
  { id: 'north2', a: [-290, -146], b: [-130, -146], hw: 3.2, kind: 'lane' },
  { id: 'far', a: [-190, -252], b: [80, -252], hw: 3.2, kind: 'lane' },
  { id: 'south', a: [-290, 106], b: [100, 106], hw: 3.8, kind: 'road' },                    // the south road, past the market
  { id: 'south2', a: [-280, 148], b: [-130, 148], hw: 3.2, kind: 'lane' },
  { id: 'far2', a: [-250, 188], b: [110, 188], hw: 3.2, kind: 'lane' },
  { id: 'landing', a: [86, 40], b: [138, 40], hw: 3.2, kind: 'lane' },                       // down to the ferry landing
  { id: 'west', a: [-214, -250], b: [-214, 252], hw: 3.6, kind: 'road' },
  { id: 'west2', a: [-262, -200], b: [-262, 200], hw: 3.2, kind: 'lane' },
  { id: 'temple-n', a: [-40, -188], b: [-40, -100], hw: 3.8, kind: 'road' },               // north of the garden
  { id: 'temple-s', a: [-40, 106], b: [-40, 252], hw: 4.2, kind: 'road' },                 // the approach from the south, to the market and the pond
  { id: 'bank', a: [84, -188], b: [84, 252], hw: 3.6, kind: 'road' },                     // along the river
  { id: 'mid', a: [-150, -188], b: [-150, -148], hw: 3.2, kind: 'lane' },
  { id: 'mid2', a: [-120, 106], b: [-120, 188], hw: 3.2, kind: 'lane' },
];
/** The market (ichi) on the south approach, an open ground with its stalls: [x0, z0, x1, z1]. */
export const MARKET = [-62, 112, -18, 146];
export const LANDING = { c: [146, 40], steps: [144, 40] };
export const streetRect = (s, m = 0) => [Math.min(s.a[0], s.b[0]) - s.hw - m, Math.min(s.a[1], s.b[1]) - s.hw - m, Math.max(s.a[0], s.b[0]) + s.hw + m, Math.max(s.a[1], s.b[1]) + s.hw + m];
export const onStreet = (x, z, m = 0) => STREETS.some((s) => inRect(streetRect(s), x, z, m));
const overlap = (a, b, m) => a[0] < b[2] + m && a[2] > b[0] - m && a[1] < b[3] + m && a[3] > b[1] - m;
const TRADES = ['farmer', 'farmer', 'fisher', 'weaver', 'potter', 'carpenter', 'porter', 'woodman', 'farmer', 'brewer'];
let LOTS = null;
/** The houses of the village: both sides of every street, fronts to the lane, no gaps but the cross-lanes and the yards. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1053), setback = 3.6;
  const ok = (r, own) => {
    const cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2;
    if (Math.hypot(r[0], r[1]) > RADIUS - 62 || Math.hypot(r[2], r[3]) > RADIUS - 62 || Math.hypot(r[0], r[3]) > RADIUS - 62 || Math.hypot(r[2], r[1]) > RADIUS - 62) return false;
    if (inRect(GARDEN, cx, cz, 14) || overlap(r, GARDEN, 12) || COMPOUNDS.some((c) => overlap(r, c, 9)) || overlap(r, MARKET, 3)) return false;
    if (Math.abs(cx - riverX(cz)) < RIVER.w / 2 + 14 || Math.abs(r[0] - riverX(r[1])) < RIVER.w / 2 + 12 || Math.abs(r[2] - riverX(r[3])) < RIVER.w / 2 + 12) return false;
    if (pondDistance(cx, cz) < 14 || height(cx, cz) > 1.5) return false;
    if (Math.abs(cz - BRIDGE.z) < 7 && !own) return false;
    for (const s of STREETS) if (s !== own && overlap(r, streetRect(s), -0.2)) return false;
    return !LOTS.some((l) => overlap(l.rect, r, 1.9));
  };
  for (const s of STREETS) {
    const horiz = s.a[1] === s.b[1], [t0, t1] = horiz ? [Math.min(s.a[0], s.b[0]), Math.max(s.a[0], s.b[0])] : [Math.min(s.a[1], s.b[1]), Math.max(s.a[1], s.b[1])];
    const c = horiz ? s.a[1] : s.a[0];
    for (const side of [-1, 1]) {
      let t = t0 + 1 + rand() * 3;
      while (t < t1 - 4) {
        const wide = rand() < 0.14, fw = (wide ? 9.5 : 5.6) + rand() * (wide ? 3 : 3.4), dp = 6.6 + rand() * 3.6 + (wide ? 1 : 0), off = setback + (rand() < 0.3 ? rand() * 1.1 : 0);
        let r, front;
        if (horiz) { r = side < 0 ? [t, c - off - dp, t + fw, c - off] : [t, c + off, t + fw, c + off + dp]; front = side < 0 ? 's' : 'n'; }
        else { r = side < 0 ? [c - off - dp, t, c - off, t + fw] : [c + off, t, c + off + dp, t + fw]; front = side < 0 ? 'e' : 'w'; }
        if (ok(r, s) && rand() >= smooth(110, 290, Math.hypot((r[0] + r[2]) / 2, (r[1] + r[3]) / 2)) * 0.55) {
          const seed = Math.floor(rand() * 1e6), tr = TRADES[seed % TRADES.length];
          LOTS.push({ rect: r.map((v) => +v.toFixed(2)), seed, y: 0, foot: -0.2, front, trade: tr, street: s.id, kind: s.kind });
          t += fw + (rand() < 0.2 ? 1.2 + rand() * 2.5 : 2.0 + rand() * 0.6);
        } else t += 2;
      }
    }
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));

let GRID = null;
/** True within a few metres of a house (a 2 m grid, built once): the beaten earth of the yards. */
export function nearLot(x, z, m = 5) {
  if (!GRID) { GRID = new Set(); for (const l of lots()) for (let i = Math.floor((l.rect[0] - 6) / 2); i <= Math.floor((l.rect[2] + 6) / 2); i++) for (let j = Math.floor((l.rect[1] - 6) / 2); j <= Math.floor((l.rect[3] + 6) / 2); j++) GRID.add(i * 4096 + j); }
  void m;
  return GRID.has(Math.floor(x / 2) * 4096 + Math.floor(z / 2));
}
