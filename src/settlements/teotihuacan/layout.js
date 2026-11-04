// Teotihuacan (c. 400) — the layout (docs/settlements/teotihuacan.md §2): the Avenue of the Dead
// north–south, the Pyramid of the Moon on its rise at the north end with its plaza, the Pyramid of
// the Sun on the east side, the Ciudadela with the Feathered Serpent Pyramid to the south-east,
// apartment compounds on the grid. Pure data. +x east, +z south.

export const RADIUS = 440;
export const AVENUE = [-20, -262, 20, 400];
export const MOON = { c: [0, -330], w: 140, d: 128, tw: 40, td: 34, h: 43, rise: 6 };
export const PLAZA = [-70, -262, 70, -196];
export const SUN = { c: [180, -80], w: 225, d: 222, tw: 40, td: 40, h: 65 };
export const CIUD = [30, 170, 210, 350];
export const KEEP_CLEAR = [[-100, -420, 100, -190], [22, -215, 315, 95], [22, 160, 220, 360]];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
/** Apartment compounds of 46–58 m on a grid of 64 m, clear of the avenue and the monuments. */
export function compounds() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(400), S = 64;
  for (let x = -RADIUS; x < RADIUS; x += S) for (let z = -RADIUS; z < RADIUS; z += S) {
    const w = 46 + rand() * 12, d = 46 + rand() * 12, r = [x + 3, z + 3, x + 3 + w, z + 3 + d], cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2;
    if (Math.max(...[[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].map(([a, b]) => Math.hypot(a, b))) > RADIUS - 26) continue;
    if (Math.abs(cx) < 34 + w / 2 || KEEP_CLEAR.some((k) => inRect(k, cx, cz, w / 2 + 4))) continue;
    if (rand() < 0.1) continue;
    LOTS.push({ rect: r, seed: Math.floor(rand() * 1e6) });
  }
  return LOTS;
}
export const inCompound = (x, z, m = 0) => compounds().some((c) => inRect(c.rect, x, z, m));
