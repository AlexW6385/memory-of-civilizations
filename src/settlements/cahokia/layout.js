// Mississippian Cahokia about 1175 — the layout (docs/settlements/cahokia.md §2): Monks Mound at
// the north of the Grand Plaza (four terraces, the main summit 30 m up with the great house, the
// first terrace below it on the south, the ramp down to the plaza); the plaza flattened and the
// twin mounds at its south end (the platform Fox Mound and the conical Roundtop); the palisade round
// the central precinct with its bastions; Woodhenge west of it; smaller mounds; the town's houses
// round their courtyards; fields of maize; Cahokia Creek to the north. Distances compressed
// (Monks Mound ~291 × 236 m → 200 × 170 m, height true). Pure data. +x east, +z south.

export const RADIUS = 420;
export const MONKS = { main: [-80, -265, 80, -120, 30], first: [-70, -120, 70, -62, 12], west: [-110, -230, -80, -140, 18] };
export const SUMMIT = [-20, -235, 22, -170];                 // the main summit's top, for the great house
export const PLAZA = [-115, -40, 115, 150];
export const FOX = [-62, 178, -18, 222, 9];
export const ROUNDTOP = [36, 200, 22, 12];                   // centre x, z, radius, height (conical)
export const PALISADE = [-160, -300, 160, 252];
export const WOODHENGE = { c: [-290, -40], r: 45 };
export const MOUNDS = [[150, -150, 24, 6], [-150, 80, 20, 5], [210, 120, 18, 5], [-230, 180, 22, 6], [260, -230, 16, 4], [100, 300, 18, 5]];   // smaller platform mounds: x, z, half-size, height
export const CREEK = { z: -365, w: 26, level: -3, bed: -4.5 };
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const creekZ = (x) => CREEK.z + 18 * Math.sin(x / 70);
export const inCreek = (x, z) => Math.abs(z - creekZ(x)) < CREEK.w / 2 - 2 && Math.hypot(x, z) < RADIUS - 45;
/** A platform of earth: rect [x0, z0, x1, z1], height h, its sides sloping over s metres. */
const platform = ([x0, z0, x1, z1], h, s) => (x, z) => h * smooth(0, s, Math.min(x - x0, x1 - x, z - z0, z1 - z));
const MAIN = platform(MONKS.main.slice(0, 4), 30, 28), FIRST = platform(MONKS.first.slice(0, 4), 12, 12), WEST = platform(MONKS.west.slice(0, 4), 18, 14), FOXP = platform(FOX.slice(0, 4), 9, 9);
const SMALL = MOUNDS.map(([x, z, s, h]) => platform([x - s, z - s, x + s, z + s], h, h * 1.1));
/** The ramp from the plaza up the first terrace's south face, and on up the main mound's. */
function ramp(x, z) {
  if (Math.abs(x + 25) > 5) return 0;
  if (z > -74 && z < -38) return 12 * smooth(-38, -74, z);
  if (z > -148 && z <= -108) return 12 + 18 * smooth(-108, -148, z);
  return 0;
}
export function mounds(x, z) {
  let h = Math.max(MAIN(x, z), FIRST(x, z), WEST(x, z), FOXP(x, z), ramp(x, z), ROUNDTOP[3] * smooth(ROUNDTOP[2], 0, Math.hypot(x - ROUNDTOP[0], z - ROUNDTOP[1])));
  for (const f of SMALL) h = Math.max(h, f(x, z));
  return h;
}
export const onMound = (x, z) => mounds(x, z) > 0.8;
export function height(x, z) {
  const d = Math.abs(z - creekZ(x)), fade = 1 - smooth(RADIUS - 60, RADIUS - 30, Math.hypot(x, z));
  const plaza = inRect(PLAZA, x, z) ? 0 : 0.6 * Math.sin(x / 37) * Math.sin(z / 29);                 // the plaza levelled, the rest gently uneven
  return (mounds(x, z) + plaza + (CREEK.bed - plaza) * smooth(CREEK.w / 2 + 5, CREEK.w / 2 - 4, d)) * fade;
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
/** Houses round small courtyards, in and beyond the precinct, off the mounds and the plaza. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1175);
  for (let x = -RADIUS + 20; x < RADIUS - 20; x += 11) for (let z = -RADIUS + 20; z < RADIUS - 20; z += 11) {
    const cx = x + 5.5 + (rand() - 0.5) * 3, cz = z + 5.5 + (rand() - 0.5) * 3, w = 5 + rand() * 2.5, d = 3.6 + rand() * 1.6, rot = rand() < 0.5;
    if (Math.hypot(cx, cz) > RADIUS - 45 || mounds(cx, cz) > 0.1 || mounds(cx + 6, cz) > 0.1 || mounds(cx - 6, cz) > 0.1 || mounds(cx, cz + 6) > 0.1 || mounds(cx, cz - 6) > 0.1
      || inRect(PLAZA, cx, cz, 8) || Math.hypot(cx - WOODHENGE.c[0], cz - WOODHENGE.c[1]) < WOODHENGE.r + 10
      || Math.abs(cx - PALISADE[0]) < 9 || Math.abs(cx - PALISADE[2]) < 9 || Math.abs(cz - PALISADE[1]) < 9 || Math.abs(cz - PALISADE[3]) < 9
      || Math.abs(cz - creekZ(cx)) < CREEK.w / 2 + 10 || rand() < 0.42) continue;
    const hw = (rot ? d : w) / 2, hd = (rot ? w : d) / 2, ys = [height(cx - hw, cz - hd), height(cx + hw, cz - hd), height(cx - hw, cz + hd), height(cx + hw, cz + hd)];
    LOTS.push({ rect: [cx - hw, cz - hd, cx + hw, cz + hd], y: Math.max(...ys), foot: Math.min(...ys) - 0.4, seed: Math.floor(rand() * 1e6) });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
