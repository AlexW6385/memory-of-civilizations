// Great Zimbabwe about 1350 — the layout (docs/settlements/great-zimbabwe.md §2): the Hill Complex
// on its granite ridge to the north, walls winding among the boulders; the Great Enclosure on the
// valley floor to the south, its elliptical outer wall with the narrow parallel passage and the
// conical tower inside; the Valley Ruins' smaller enclosures between; daga houses all round; the
// miombo woodland. Pure data. +x east, +z south.

export const RADIUS = 380;
export const HILL = { c: [-30, -190], r: [140, 70], h: 32 };
export const ENCLOSURE = { c: [40, 120], r: [52, 38] };
// the Hill Complex (docs/settlements/great-zimbabwe.md §11): the Western Enclosure at the hill's
// west end, its floor levelled with daga (zimfieldguide: deposits 4.3 m deep); the Recess Enclosure
// east of it; the Ancient Ascent climbing the south face through a cleft between boulders
export const WEST = { c: [-62, -188], r: [24, 17], y: 33.2 };
export const RECESS = { c: [-14, -178], r: [7, 5.5], y: 33.4 };
export const ASCENT = { x: -48, z0: -104, z1: -170, w: 1.8 };
// the Valley Ruins (§12): smaller walled enclosures between the hill and the Great Enclosure, each
// round a court of daga houses; [centre, radii, the wall's arc from a0 to a1 (the gap its entrance)]
export const VALLEY = [
  { c: [-90, -40], r: [22, 16], a0: 0.4, a1: Math.PI * 2 - 0.2 },
  { c: [-30, -20], r: [18, 14], a0: 1.9, a1: Math.PI * 2 + 1.5 },
  { c: [60, -50], r: [20, 15], a0: 2.0, a1: Math.PI * 2 + 1.6 },
  { c: [-120, 60], r: [16, 12], a0: -1.2, a1: Math.PI * 2 - 1.6 },
];
const ell = (E, x, z, m = 0) => Math.hypot((x - E.c[0]) / (E.r[0] + m), (z - E.c[1]) / (E.r[1] + m));
/** Is (x, z) within a Hill or Valley enclosure (m: margin, metres)? */
export const inWalled = (x, z, m = 0) => [WEST, RECESS, ...VALLEY].some((E) => ell(E, x, z, m) < 1);
export const onAscent = (x, z, m = 0) => Math.abs(x - ASCENT.x) < ASCENT.w / 2 + 1 + m && z < ASCENT.z0 + m && z > ASCENT.z1 - m;
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
export function height(x, z) {
  const e = Math.hypot((x - HILL.c[0]) / HILL.r[0], (z - HILL.c[1]) / HILL.r[1]);
  let hill = HILL.h * smooth(1.25, 0.45, e) + 3 * Math.sin(x / 9) * Math.sin(z / 7) * smooth(1.1, 0.5, e);
  // the levelled floors of the Hill Complex's enclosures
  for (const E of [WEST, RECESS]) { const f = ell(E, x, z); if (f < 1.3) hill += (E.y - hill) * smooth(1.3, 0.92, f); }
  return hill * (1 - smooth(RADIUS - 50, RADIUS - 5, Math.hypot(x, z)));
}
export const inEnclosure = (x, z, m = 0) => Math.hypot((x - ENCLOSURE.c[0]) / (ENCLOSURE.r[0] + m), (z - ENCLOSURE.c[1]) / (ENCLOSURE.r[1] + m)) < 1;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let HUTS = null;
/** Daga houses in clusters on the valley floor and inside the enclosures. */
export function huts() {
  if (HUTS) return HUTS;
  HUTS = [];
  const rand = rng(1350);
  for (let k = 0; k < 4000 && HUTS.length < 260; k++) {
    const x = (rand() * 2 - 1) * (RADIUS - 50), z = (rand() * 2 - 1) * (RADIUS - 50);
    if (Math.hypot(x, z) > RADIUS - 50 || height(x, z) > 4 || inWalled(x, z, 5) || (inEnclosure(x, z, 6) && !inEnclosure(x, z, -10)) || HUTS.some((h) => Math.hypot(h.c[0] - x, h.c[1] - z) < 8)) continue;
    if (inEnclosure(x, z, -10) && Math.hypot(x - ENCLOSURE.c[0] - 25, z - ENCLOSURE.c[1] + 5) < 14) continue;     // the tower's court
    HUTS.push({ c: [x, z], r: 2.6 + rand() * 1.2, y: height(x, z) });
  }
  return HUTS;
}
void hash2;
