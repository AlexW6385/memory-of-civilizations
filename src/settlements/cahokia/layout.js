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
/** A platform of earth: rect [x0, z0, x1, z1], height h, its sides sloping over s metres. */
const platform = ([x0, z0, x1, z1], h, s) => (x, z) => h * smooth(0, s, Math.min(x - x0, x1 - x, z - z0, z1 - z));
const MAIN = platform(MONKS.main.slice(0, 4), 30, 28), FIRST = platform(MONKS.first.slice(0, 4), 12, 12), WEST = platform(MONKS.west.slice(0, 4), 18, 14), EAST = platform(MONKS.east.slice(0, 4), 16, 12), FOXP = platform(FOX.slice(0, 4), 9, 9);
const SMALL = MOUNDS.map(([x, z, s, h]) => platform([x - s, z - s, x + s, z + s], h, h * 1.1));
/** The ramp from the plaza up the first terrace's south face, and on up the main mound's. */
function ramp(x, z) {
  if (Math.abs(x + 25) > 5) return 0;
  if (z > -74 && z < -38) return 12 * smooth(-38, -74, z);
  if (z > -148 && z <= -108) return 12 + 18 * smooth(-108, -148, z);
  return 0;
}
/** A ramp up each small platform mound's south face: 5 m wide, its foot 2.5 heights out. */
export const mRamp = ([x, z, s, h]) => ({ x, zOut: z + s + 2.5 * h, zIn: z + s - 1.1 * h, h });
const SRAMP = MOUNDS.map((m) => { const r = mRamp(m); return (px, pz) => (Math.abs(px - r.x) > 4.5 || pz > r.zOut || pz < r.zIn - 0.5 ? 0 : r.h * smooth(r.zOut, r.zIn, pz) * smooth(4.5, 2.5, Math.abs(px - r.x))); });
const CONE = CONES.map(([cx, cz, r, h]) => (x, z) => h * smooth(r, 0, Math.hypot(x - cx, z - cz)));
const RIDGE = RIDGES.map(([x0, z0, x1, z1, h]) => (x, z) => {
  const mz = (z0 + z1) / 2, hw = (z1 - z0) / 2 + h * 1.3, across = 1 - Math.min(1, Math.abs(z - mz) / hw) ** 2, along = smooth(0, h * 2.2, Math.min(x - x0 + h * 1.3, x1 + h * 1.3 - x));
  return h * smooth(0, 0.9, across) * along;
});
export function mounds(x, z) {
  let h = Math.max(MAIN(x, z), FIRST(x, z), WEST(x, z), EAST(x, z), FOXP(x, z), ramp(x, z), ROUNDTOP[3] * smooth(ROUNDTOP[2], 0, Math.hypot(x - ROUNDTOP[0], z - ROUNDTOP[1])));
  for (const f of SMALL) h = Math.max(h, f(x, z));
  for (const f of SRAMP) h = Math.max(h, f(x, z));
  for (const f of CONE) h = Math.max(h, f(x, z));
  for (const f of RIDGE) h = Math.max(h, f(x, z));
  return h;
}
export const onMound = (x, z) => mounds(x, z) > 0.8;
export function height(x, z) {
  const d = Math.abs(z - creekZ(x)), fade = 1 - smooth(RADIUS - 60, RADIUS - 30, Math.hypot(x, z));
  const plaza = inRect(PLAZA, x, z) ? 0 : 0.6 * Math.sin(x / 37) * Math.sin(z / 29) * (1 - smooth(0.05, 1.5, mounds(x, z)));                 // the plaza levelled, the rest gently uneven
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
