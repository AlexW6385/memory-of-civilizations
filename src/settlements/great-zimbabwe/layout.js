// Great Zimbabwe about 1350 — the layout (docs/settlements/great-zimbabwe.md §2): the Hill Complex
// on its granite ridge to the north, walls winding among the boulders; the Great Enclosure on the
// valley floor to the south, its elliptical outer wall with the narrow parallel passage and the
// conical tower inside; the Valley Ruins' smaller enclosures between; daga houses all round; the
// miombo woodland. Pure data. +x east, +z south.

export const RADIUS = 380;
export const HILL = { c: [-30, -190], r: [140, 70], h: 32 };
export const ENCLOSURE = { c: [40, 120], r: [52, 38] };
// the conical tower and the platform beside it, inside the north entrance (the entrance's gap is x 32–53 at z 82)
export const TOWER = { c: [38, 108], r: 2.8, h: 10 };
export const PLATFORM = [54, 108];
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
// the worn ways: from the Great Enclosure's north entrance to the Valley courts and the foot of the Ancient Ascent, straight lines
// (the walkers of movers.js follow the same ones); the ground there is trodden red earth, bare of grass
export const GATE = [ENCLOSURE.c[0] + 6, ENCLOSURE.c[1] - ENCLOSURE.r[1] - 2];
export const PATHS = [...VALLEY.map((V) => [V.c[0] + V.r[0] + 3, V.c[1]]), [ASCENT.x, ASCENT.z0 + 6]].map((h) => [GATE, h]);
/** Distance from (x, z) to the nearest worn way. */
export function pathDist(x, z) {
  let best = 1e9;
  for (const [[ax, az], [bx, bz]] of PATHS) {
    const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
    best = Math.min(best, Math.hypot(x - ax - dx * t, z - az - dz * t));
  }
  return best;
}
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
// the cattle kraals' sites (life.js kraals() reads these; kept here so the homesteads keep clear of them)
export const KRAAL_AT = [[150, -40, 6.5], [-170, 120, 5.5], [110, 230, 6]];
let COMP = null, HUTS = null;
/**
 * The homesteads of the valley: each a walled compound (a low wall of granite rubble round a yard, a gate in
 * it), two to four daga houses on a ring in the yard with their doors to its middle, and a granary raised on
 * stones between two of them (docs/settlements/great-zimbabwe.md §15). Returns { c, r (the wall), gap (the
 * gate's angle), y, huts: [{ c, r, y, seed, open }], granary: [x, z] }.
 */
export function compounds() {
  if (COMP) return COMP;
  COMP = [];
  const rand = rng(1350), R = 9;
  // the homesteads inside the Great Enclosure, in the open western and southern parts (clear of the passage, the tower's court and the entrance path)
  const mk = (x, z, open) => {
    const n = 3, a0 = rand() * 6.28, gap = a0 + Math.PI * 2 / n, huts = [];
    for (let i = 0; i < n; i++) {
      const a = a0 + (i + 0.5) * Math.PI * 2 / n, hx = x + Math.cos(a) * 5.4, hz = z + Math.sin(a) * 5.4, toC = Math.atan2(z - hz, x - hx);
      huts.push({ c: [hx, hz], r: 2.35 + rand() * 0.6, y: 0, seed: (Math.round(toC * 100) % 628 + 628) % 628, open: open && i < 2 });
    }
    return { c: [x, z], r: R, gap, y: 0, huts, granary: [x + Math.cos(a0) * 6.2, z + Math.sin(a0) * 6.2], seed: Math.floor(rand() * 1e6), inner: true };
  };
  const [ex, ez] = ENCLOSURE.c;
  for (const [dx, dz, o] of [[-27, -12, true], [-26, 8, false], [-8, 20, true], [-10, -1, false]]) COMP.push(mk(ex + dx, ez + dz, o));
  const ok = (x, z) => {
    if (Math.hypot(x, z) > RADIUS - 56 || inEnclosure(x, z, 14) || inWalled(x, z, R + 6) || pathDist(x, z) < R + 2) return false;
    if (KRAAL_AT.some(([kx, kz, kr]) => Math.hypot(kx - x, kz - z) < kr + R + 4)) return false;
    for (let a = 0; a < 6.3; a += 0.9) if (height(x + Math.cos(a) * R, z + Math.sin(a) * R) > 4 || onAscent(x + Math.cos(a) * R, z + Math.sin(a) * R, 3)) return false;
    return height(x, z) < 3.5 && !COMP.some((k) => Math.hypot(k.c[0] - x, k.c[1] - z) < 2 * R + 5);
  };
  for (let k = 0; k < 6000 && COMP.length < 82; k++) {
    const x = (rand() * 2 - 1) * (RADIUS - 56), z = (rand() * 2 - 1) * (RADIUS - 56);
    if (!ok(x, z)) continue;
    const n = 2 + Math.floor(rand() * 3), a0 = rand() * 6.28, gap = a0 + Math.PI * 2 / n, y = height(x, z), huts = [];
    // the huts on the ring, a gap left in it toward the gate
    for (let i = 0; i < n; i++) {
      const a = a0 + (i + 0.5) * Math.PI * 2 / n, hx = x + Math.cos(a) * 5.4, hz = z + Math.sin(a) * 5.4, toC = Math.atan2(z - hz, x - hx);
      huts.push({ c: [hx, hz], r: 2.35 + rand() * 0.6, y: height(hx, hz), seed: (Math.round(toC * 100) % 628 + 628) % 628, open: false });
    }
    huts[0].open = rand() < 0.4;
    COMP.push({ c: [x, z], r: R, gap, y, huts, granary: [x + Math.cos(a0) * 6.2, z + Math.sin(a0) * 6.2], seed: Math.floor(rand() * 1e6) });
  }
  return COMP;
}
/** The houses of the homesteads (flattened), those inside the Great Enclosure included. */
export function huts() {
  if (HUTS) return HUTS;
  HUTS = compounds().flatMap((k) => k.huts);
  return HUTS;
}
void hash2;
