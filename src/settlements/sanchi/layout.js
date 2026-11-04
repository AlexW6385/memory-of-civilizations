// Sanchi in the 1st century — the layout (docs/settlements/sanchi.md §2): the flat-topped hill
// rising from the plain of the Betwa, the Great Stupa and its companions and monasteries on the
// summit; the processional path climbing the north slope; the village at the hill's foot to the
// south and east; fields and tanks on the plain. Pure data. +x east, +z south.

export const RADIUS = 300;
export const TOP = 22;
export const SUMMIT = { c: [0, 0], half: [95, 95], round: 40 };
export const PATH = { x: 0, w: 5 };                         // up the north slope
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
/** Outside distance from the summit's rounded square (0 on it). */
export function out(x, z) {
  const [hx, hz] = SUMMIT.half, r = SUMMIT.round, dx = Math.max(Math.abs(x - SUMMIT.c[0]) - (hx - r), 0), dz = Math.max(Math.abs(z - SUMMIT.c[1]) - (hz - r), 0);
  return Math.max(0, Math.hypot(dx, dz) - r);
}
export function height(x, z) {
  const d = out(x, z);
  let h = TOP * smooth(30, 0, d);
  // the path: a gentler ramp down the north slope
  if (Math.abs(x - PATH.x) < PATH.w + 3 && z < -SUMMIT.half[1] + 5) {
    const ramp = TOP * smooth(SUMMIT.half[1] + 75, SUMMIT.half[1] - 5, -z), k = smooth(PATH.w + 3, PATH.w, Math.abs(x - PATH.x));
    h = h * (1 - k) + Math.max(ramp, h * 0) * k;
  }
  return h * (1 - smooth(RADIUS - 40, RADIUS - 5, Math.hypot(x, z)));
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
/** The village at the foot of the hill. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(50);
  for (let x = -100; x < 300; x += 14) for (let z = 120; z < 320; z += 13) {
    const w = 8 + rand() * 3, d = 6 + rand() * 2, cx = x + w / 2, cz = z + d / 2;
    if (Math.hypot(cx, cz) > RADIUS - 50 || out(cx, cz) < 34 || rand() < 0.35) continue;
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6), y: 0, foot: -0.2, front: 'n' });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
