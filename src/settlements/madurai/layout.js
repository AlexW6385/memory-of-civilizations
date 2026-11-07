// Madurai about 1650 — the layout (docs/settlements/madurai.md §2): the Meenakshi temple at the
// centre, its outer wall 254 × 237 m with a tall gopuram in the middle of each side; the
// Sundareswarar shrine's enclosure in the north-centre, Meenakshi's to its south-west, the Golden
// Lotus tank south of hers, the Thousand-Pillar Hall in the north-east; the city in concentric
// squares of streets round the temple (the Chitrai, Avani Moola and Masi streets) with houses in
// the blocks between. Pure data. +x east, +z south.

export const RADIUS = 400;
export const WALL = [-127, -118, 127, 118];
export const SUNDARA = [-20, -86, 78, 30];
export const MEENAKSHI = [-102, -66, -40, 4];
export const TANK = [-96, 32, -46, 69];
export const HALL = [86, -112, 121, -52];
export const STREETS = [{ off: 12, w: 14 }, { off: 70, w: 10 }, { off: 150, w: 14 }];   // outward from the wall
export const GATES = { e: [127, -8], s: [-20, 118], w: [-127, -24], n: [14, -118] };
/** Tirumala Nayaka's Pudhu Mandapam (1628–1635), 330 × 105 ft, across the street east of the east gopuram, the axial street through its middle. */
export const PUDHU = [156, -24, 256.6, 8];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
/** How far outside the temple wall's rectangle (0 inside). */
export const outside = (x, z) => Math.max(WALL[0] - x, x - WALL[2], WALL[1] - z, z - WALL[3], 0);
/** On one of the ring streets or the four axial streets out from the gates. */
export function onStreet(x, z, m = 0) {
  const o = outside(x, z);
  if (STREETS.some((s) => o > s.off - m && o < s.off + s.w + m)) return true;
  if (Math.abs(z - GATES.e[1]) < 6 + m && x > WALL[2]) return true;
  if (Math.abs(z - GATES.w[1]) < 6 + m && x < WALL[0]) return true;
  if (Math.abs(x - GATES.s[0]) < 6 + m && z > WALL[3]) return true;
  if (Math.abs(x - GATES.n[0]) < 6 + m && z < WALL[1]) return true;
  return false;
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
/** House lots in the blocks between the ring streets, facing the nearer street. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1650);
  for (let x = -RADIUS + 20; x < RADIUS - 20; x += 11) for (let z = -RADIUS + 20; z < RADIUS - 20; z += 13) {
    const w = 8 + rand() * 2, d = 10 + rand() * 2, r = [x, z, x + w, z + d];
    const o = outside(x + w / 2, z + d / 2);
    if (o < 30 || Math.hypot(x + w / 2, z + d / 2) > RADIUS - 28) continue;
    if ([[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].some(([a, b]) => onStreet(a, b, 1.5))) continue;
    if (rand() < 0.3 || inRect(PUDHU, x + w / 2, z + d / 2, 9)) continue;
    LOTS.push({ rect: r, seed: Math.floor(rand() * 1e6), facing: rand() < 0.5 ? 'n' : 's' });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
