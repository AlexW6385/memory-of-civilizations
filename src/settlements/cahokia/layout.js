// Mississippian Cahokia about 1175 — the layout (docs/settlements/cahokia.md §2): Monks Mound at
// the north of the Grand Plaza (four terraces, the main summit 30 m up with the great house, the
// first terrace below it on the south, the ramp down to the plaza); the plaza flattened and the
// twin mounds at its south end (the platform Fox Mound and the conical Roundtop); the palisade round
// the central precinct with its bastions; Woodhenge west of it; smaller mounds; the town's houses
// round their courtyards; fields of maize; Cahokia Creek to the north. Distances compressed
// (Monks Mound ~291 × 236 m → 200 × 170 m, height true). Pure data. +x east, +z south.

export const RADIUS = 420;
export const MONKS = { main: [-80, -265, 80, -120, 30], first: [-70, -146, 70, -62, 12], west: [-110, -230, -80, -140, 18], east: [80, -215, 112, -150, 16] };
export const SUMMIT = [-20, -235, 22, -170];                 // the main summit's top, for the great house
export const HALLS = [[SUMMIT[0], SUMMIT[1] + 20, SUMMIT[2], SUMMIT[1] + 40], [-14, -100, 8, -86]];   // the two opened great houses, summit and first terrace
export const LODGES = [[-54, -104, -32, -90], [26, -104, 48, -90]];   // the two lodges on the first terrace
export const GATES = [[-25, -42, 9], [-25, -78, 8], [-25, -151, 8]];   // x, z, height of the posts of the stairs' gates
export const PLAZA = [-115, -40, 115, 150];
// the chunkey yards of the Grand Plaza (long strips of beaten clay, 4 m wide): two run toward the ramp either side of its foot, so that the visitor who comes to the stair walks between two games [inferred: the places]; two more further south
export const YARDS = [[-42, -36, -38, -8], [-12, -36, -8, -8], [-80, 92, -44, 96], [58, 104, 62, 140]];
export const FOX = [-62, 178, -18, 222, 9];
export const ROUNDTOP = [36, 200, 22, 12];                   // centre x, z, radius, height (conical)
export const PALISADE = [-160, -300, 160, 252];
export const WOODHENGE = { c: [-290, -40], r: 45 };
export const MOUNDS = [[150, -150, 24, 6], [-150, 80, 20, 5], [210, 120, 18, 5], [-230, 180, 22, 6], [260, -230, 16, 4], [100, 300, 18, 5]];   // smaller platform mounds: x, z, half-size, height
// conical mounds (x, z, radius, height) and ridge-top mounds (x0, z0, x1, z1, height): the conical for burials, the ridge-top (as Mound 72, south of the palisade) a long low spine with a rounded crown
export const CONES = [[-135, 40, 11, 5.5], [140, -80, 10, 5], [-200, -150, 13, 6], [230, 20, 12, 5.5]];
export const RIDGES = [[-45, 268, 45, 280, 4.5], [170, 170, 215, 182, 3.5]];
// the neighbourhood plazas: small cleared squares among the houses, 16 m a side, one to a block of 66 m
export const NPLAZA = 16;
// the borrow pits: ponds dug where earth was taken for the mounds (x, z, radii) — Cahokia's builders took the fill from pits about the site [stated: Cahokia Mounds State Historic Site]; the water at the creek's level
export const PONDS = [[-215, -110, 22, 12], [215, 60, 20, 11], [125, -240, 16, 9], [-120, 318, 24, 12], [-250, 130, 15, 9]];
const pondE = (x, z, [cx, cz, rx, rz]) => Math.hypot((x - cx) / rx, (z - cz) / rz);
export const inPond = (x, z, m = 0) => PONDS.some((p) => pondE(x, z, p) < 0.85 + m / p[2]);
export const CREEK = { z: -365, w: 26, level: -3, bed: -4.5 };
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const creekZ = (x) => CREEK.z + 18 * Math.sin(x / 70);
export const inCreek = (x, z) => Math.abs(z - creekZ(x)) < CREEK.w / 2 - 2 && Math.hypot(x, z) < RADIUS - 45;
/** Slow irregularity, about ±1.1: the same everywhere, so the earthworks wander the same way every time. */
const N = (x, z) => 0.5 * Math.sin(x * 0.071 + z * 0.043 + 1.3) + 0.35 * Math.sin(x * 0.13 - z * 0.09 + 0.4) + 0.25 * Math.sin(x * 0.19 + z * 0.23 + 2.1);
const GULLY = { on: true };
/**
 * A platform of earth, as weathered earth stands: rect [x0, z0, x1, z1], height h, the slope on each side given
 * its own length (sw, se, sn, ss), the shoulders and toes wandering by a few metres, and on the faces
 * erosion gullies running down the fall line about 18 m apart, as deep as 1.6 m on a 30 m mound.
 */
const platform = ([x0, z0, x1, z1], h, [sw, se, sn, ss], seed = 0) => (x, z) => {
  const dw = (x - x0) / sw, de = (x1 - x) / se, dn = (z - z0) / sn, ds = (z1 - z) / ss, m = Math.min(dw, de, dn, ds);
  if (m < -0.2) return 0;
  // the sides' distances joined by a soft minimum, so the corners are rounded, not mitred
  const q = (d) => Math.exp(-9 * Math.min(d, 3)), t = m <= 0 ? m : Math.min(m + 0.2, -Math.log(q(dw) + q(de) + q(dn) + q(ds)) / 9);
  const tt = t + 0.1 * N(x + seed, z - seed * 0.7) * smooth(-0.2, 0.2, t);
  if (tt <= 0) return 0;
  let v = h * smooth(0, 1, tt);
  if (GULLY.on && tt < 1) {
    const u = m === dw || m === de ? z : x, ph = u * 0.349 + 1.9 * N(u * 0.9 + seed, seed * 0.3) + seed + 2.6 * tt * N(u * 0.5, seed + 9), g = smooth(0.62, 1, Math.cos(ph)) * smooth(0.1, 0.85, 0.5 + 0.5 * Math.sin(u * 0.113 + seed * 1.7) + 0.3 * N(u, seed));
    v -= 1.6 * (h / 30) * g * Math.min(1, 4 * tt * (1 - tt) * 1.3) * smooth(9, 22, Math.abs(x + 25));
  }
  return Math.max(0, v);
};
const MAIN = platform(MONKS.main.slice(0, 4), 30, [40, 40, 30, 38], 3), FIRST = platform(MONKS.first.slice(0, 4), 12, [14, 14, 12, 22], 11), WEST = platform([-134, -234, -62, -136], 18, [24, 24, 18, 18], 5), EAST = platform([58, -219, 132, -146], 16, [20, 20, 16, 16], 8), FOXP = platform(FOX.slice(0, 4), 9, [13, 13, 13, 13], 2);
const SMALL = MOUNDS.map(([x, z, s, h], i) => platform([x - s, z - s, x + s, z + s], h, [h * 2, h * 2, h * 2, h * 2], 20 + i * 7));
/** A spur of earth rising to hz along its crest, with soft shoulders that spread as it grows. */
const spurSide = (dx, over) => 1 - smooth(5, 7 + 1.7 * over, Math.abs(dx));
/** The ramp from the plaza up the first terrace's south face, and on up the main mound's: a broad spur with sloping sides, not a causeway. */
function ramp(x, z) {
  const dx = x + 25 + 1.2 * N(z, 4);
  if (Math.abs(dx) > 30) return 0;
  if (z > -96 && z < -30) { const hz = 12 * smooth(-32, -74, z); return hz * spurSide(dx, hz); }
  if (z > -158 && z <= -96) { const hz = 12 + 18 * smooth(-108, -156, z); return 12 + (hz - 12) * spurSide(dx, hz - 12) * (1 - smooth(-146, -158, z)); }
  return 0;
}
/** A ramp up each small platform mound's south face: its foot 2.5 heights out, its head on the crown, the sides spreading. */
export const mRamp = ([x, z, s, h]) => ({ x, zOut: z + s + 2.5 * h, zIn: z + s - 2.0 * h, h });
const SRAMP = MOUNDS.map((m) => { const r = mRamp(m); return (px, pz) => { if (pz > r.zOut || pz < r.zIn - 0.5) return 0; const hz = r.h * smooth(r.zOut, r.zIn, pz); return hz * (1 - smooth(2.5, 4 + 1.4 * hz, Math.abs(px - r.x))); }; });
const CONE = CONES.map(([cx, cz, r, h]) => (x, z) => h * smooth(r * (1 + 0.07 * N(x * 0.8, z * 0.8)), 0, Math.hypot(x - cx, z - cz)));
const RIDGE = RIDGES.map(([x0, z0, x1, z1, h]) => (x, z) => {
  const mz = (z0 + z1) / 2, hw = (z1 - z0) / 2 + h * 1.3, across = 1 - Math.min(1, Math.abs(z - mz) / hw) ** 2, along = smooth(0, h * 2.2, Math.min(x - x0 + h * 1.3, x1 + h * 1.3 - x));
  return h * smooth(0, 0.9, across) * along;
});
export function mounds(x, z, smoothOnly = false) {
  GULLY.on = !smoothOnly;
  let h = Math.max(MAIN(x, z), FIRST(x, z), WEST(x, z), EAST(x, z), FOXP(x, z), ramp(x, z), ROUNDTOP[3] * smooth(ROUNDTOP[2], 0, Math.hypot(x - ROUNDTOP[0], z - ROUNDTOP[1])));
  for (const f of SMALL) h = Math.max(h, f(x, z));
  for (const f of SRAMP) h = Math.max(h, f(x, z));
  for (const f of CONE) h = Math.max(h, f(x, z));
  for (const f of RIDGE) h = Math.max(h, f(x, z));
  GULLY.on = true;
  return h;
}
export const onMound = (x, z) => mounds(x, z) > 0.8;
export function height(x, z) {
  const d = Math.abs(z - creekZ(x)), fade = 1 - smooth(RADIUS - 60, RADIUS - 30, Math.hypot(x, z));
  const pdx = Math.max(PLAZA[0] - x, x - PLAZA[2], 0), pdz = Math.max(PLAZA[1] - z, z - PLAZA[3], 0);
  const plaza = 0.6 * Math.sin(x / 37) * Math.sin(z / 29) * smooth(0, 14, Math.hypot(pdx, pdz)) * (1 - smooth(0.05, 1.5, mounds(x, z)));                 // the plaza levelled, the rest gently uneven, the unevenness coming in over 14 m (no step at the plaza's edge)
  let base = mounds(x, z) + plaza;
  base += (CREEK.bed - base) * smooth(CREEK.w / 2 + 5, CREEK.w / 2 - 4, d);
  for (const p of PONDS) base += (CREEK.bed + 0.3 - base) * smooth(1.45, 0.6, pondE(x, z, p));
  return base * fade;
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null, NPL = null, GAPS = null;
/** The small plazas of the neighbourhoods: [x0, z0, x1, z1] each, one per block of 66 m where it clears the mounds, the Grand Plaza, the palisade, Woodhenge and the creek. */
export function smallPlazas() {
  if (NPL) return NPL;
  NPL = [];
  const rand = rng(7731), B = 66;
  for (let bx = -6; bx <= 5; bx++) for (let bz = -6; bz <= 5; bz++) {
    const cx = bx * B + 33 + (rand() - 0.5) * 14, cz = bz * B + 33 + (rand() - 0.5) * 14, r = [cx - NPLAZA / 2, cz - NPLAZA / 2, cx + NPLAZA / 2, cz + NPLAZA / 2];
    if (Math.hypot(cx, cz) > RADIUS - 70 || inRect(PLAZA, cx, cz, 26)) continue;
    if ([[-12, 0], [12, 0], [0, -12], [0, 12], [12, 12], [-12, -12]].some(([dx, dz]) => mounds(cx + dx, cz + dz) > 0.05)) continue;
    if (Math.hypot(cx - WOODHENGE.c[0], cz - WOODHENGE.c[1]) < WOODHENGE.r + 24 || inRect([PALISADE[0] - 14, PALISADE[1] - 14, PALISADE[2] + 14, PALISADE[3] + 14], cx, cz) && !inRect([PALISADE[0] + 14, PALISADE[1] + 14, PALISADE[2] - 14, PALISADE[3] - 14], cx, cz)) continue;
    if (Math.abs(cz - creekZ(cx)) < CREEK.w / 2 + 24 || inPond(cx, cz, 16)) continue;
    if (inRect(MONKS.main, cx, cz, 24) || inRect(MONKS.west, cx, cz, 24) || inRect([FOX[0], FOX[1], FOX[2] + 80, FOX[3]], cx, cz, 18)) continue;
    NPL.push({ rect: r, c: [cx, cz], seed: Math.floor(rand() * 1e6) });
  }
  return NPL;
}
export const inSmallPlaza = (x, z, m = 0) => smallPlazas().some((p) => inRect(p.rect, x, z, m));
/** Houses round small courtyards, in and beyond the precinct, off the mounds and the plaza. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = []; GAPS = [];
  const rand = rng(1175);
  for (let x = -RADIUS + 20; x < RADIUS - 20; x += 11) for (let z = -RADIUS + 20; z < RADIUS - 20; z += 11) {
    const cx = x + 5.5 + (rand() - 0.5) * 3, cz = z + 5.5 + (rand() - 0.5) * 3, w = 5 + rand() * 2.5, d = 3.6 + rand() * 1.6, rot = rand() < 0.5;
    if (Math.hypot(cx, cz) > RADIUS - 45 || mounds(cx, cz) > 0.1 || mounds(cx + 6, cz) > 0.1 || mounds(cx - 6, cz) > 0.1 || mounds(cx, cz + 6) > 0.1 || mounds(cx, cz - 6) > 0.1
      || inRect(PLAZA, cx, cz, 8) || Math.hypot(cx - WOODHENGE.c[0], cz - WOODHENGE.c[1]) < WOODHENGE.r + 10
      || Math.abs(cx - PALISADE[0]) < 9 || Math.abs(cx - PALISADE[2]) < 9 || Math.abs(cz - PALISADE[1]) < 9 || Math.abs(cz - PALISADE[3]) < 9
      || Math.abs(cz - creekZ(cx)) < CREEK.w / 2 + 10 || inPond(cx, cz, 12) || inSmallPlaza(cx, cz, 6)) continue;
    if (rand() < (Math.hypot(cx, cz) < 260 ? 0.14 : 0.3)) { if (Math.hypot(cx, cz) < 300) GAPS.push({ c: [cx, cz], seed: Math.floor(rand() * 1e6) }); continue; }
    // the door toward the nearest small plaza, if one is near
    let door = null, bd = 40;
    for (const p of smallPlazas()) { const d = Math.hypot(cx - p.c[0], cz - p.c[1]); if (d < bd) { bd = d; door = cz > p.c[1] ? 'n' : 's'; } }
    const seed = Math.floor(rand() * 1e6), hw = (rot ? d : w) / 2, hd = (rot ? w : d) / 2, ys = [height(cx - hw, cz - hd), height(cx + hw, cz - hd), height(cx - hw, cz + hd), height(cx + hw, cz + hd)];
    LOTS.push({ rect: [cx - hw, cz - hd, cx + hw, cz + hd], y: Math.max(...ys), foot: Math.min(...ys) - 0.4, seed, door: door || (seed % 2 ? 'n' : 's'), lod: Math.hypot(cx, cz) < 190 ? 0 : Math.hypot(cx, cz) < 280 ? 1 : 2 });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
/** Cells of the house grid left empty by chance (not by a mound, the plaza or the like): where a yard's own things stand — a granary, a fire, a heap of wood. */
export function gaps() { lots(); return GAPS; }
