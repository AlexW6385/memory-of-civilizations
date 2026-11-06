// Petra about AD 50 — the layout (docs/settlements/petra.md §2): a sandstone massif cut by
// gorges. From the east the wadi narrows into the Siq, which winds to the little square before
// the Khazneh; the Outer Siq (the Street of Façades, the theatre) runs on north-west into the
// city's open valley — the colonnaded street, the Great Temple, Qasr al-Bint, houses on the
// slopes, the Royal Tombs in the eastern cliff. The Siq is shortened (≈ 170 m of its 1.2 km).
// Pure data. +x east, +z south.

export const RADIUS = 330;
export const RIM = 60;                                        // the massif's top above the valley floor
export const SIQ = { path: [[325, -150], [296, -154], [263, -147], [229, -160], [192, -151], [148, -162]], w: 12 };
/** The Siq's line smoothed (two rounds of Chaikin's corner cutting, the ends kept): the floor and the built walls follow it. */
function chaikin(P, n) {
  for (let k = 0; k < n; k++) {
    const Q = [P[0]];
    for (let i = 0; i + 1 < P.length; i++) { const a = P[i], b = P[i + 1]; Q.push([a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25], [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75]); }
    Q.push(P[P.length - 1]); P = Q;
  }
  return P;
}
export const SIQ_LINE = chaikin(SIQ.path, 2);
/** Where the Siq's walls are built (docs/settlements/petra.md §10): from the east down to x = 145, at the square; the floor runs on under them, 4.5 m wider on each side, so the ground's slope never shows in front of them. */
export const SIQ_WALL = { x1: 145, face: 6.2, wide: 4.5 };
export const siqHalf = (x) => SIQ.w / 2 + SIQ_WALL.wide * smooth(SIQ_WALL.x1 - 14, SIQ_WALL.x1, x);
export const PLAZA = { c: [128, -160], r: 20 };
/** The walls of the square and the Outer Siq are built too (plan.js): the floor runs on under them, this much deeper. */
export const GORGE_WIDE = 4.5;
/** The theatre (plan.js): its centre, the radius of its cavea's back and how far behind that the cliff's face stands. */
export const THEATRE = { c: [94, -34.5], r1: 34, cliff: 1.8, west: -4 };   // (only east of c.x + west: the cavea's half)
/** How far (in the valley ellipse's measure) the floor runs on under the built east cliff. */
export const EAST_WIDE = 0.035;
/** The rock the Khazneh is cut from (its builder fills it): the ground stays at the floor inside, so that it never shows in the portico. */
export const KHAZNEH_ROCK = [88, -174, 111, -146];
export const OUTER = { path: [[128, -160], [126, -120], [108, -82], [80, -52], [40, -20]], w: 34 };
export const VALLEY = { c: [-70, 10], r: [175, 120] };
export const STREET = { a: [60, 12], b: [-104, 12], w: 6 };
/** The Great Temple's precinct south of the street, the temenos of Qasr al-Bint at its west end, the temple and its altar (plan.js). */
export const GREAT_TEMPLE = [-86, 20.9, -30, 100];
export const TEMENOS = [-172, -26, -104, 42];
export const QASR = { rect: [-166, 8, -138, 36], altar: [-152, -14] };
/** Inside the precincts (nothing planted, no houses). */
export const sacred = (x, z, m = 0) => inRect([GREAT_TEMPLE[0] - 1, GREAT_TEMPLE[1], GREAT_TEMPLE[2] + 1, GREAT_TEMPLE[3] + 1], x, z, m) || inRect([TEMENOS[0] - 1, TEMENOS[1], TEMENOS[2], TEMENOS[3]], x, z, m);
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function segDist(x, z, a, b) { const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz))); return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t); }
export const pathDist = (x, z, p) => { let d = Infinity; for (let i = 0; i + 1 < p.length; i++) d = Math.min(d, segDist(x, z, p[i], p[i + 1])); return d; };
function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
/** How open the ground is (1 on a gorge or valley floor, 0 on the massif). */
export function open(x, z, W = GORGE_WIDE) {
  const hs = W ? siqHalf(x) : SIQ.w / 2;
  let m = smooth(hs + 3, hs, pathDist(x, z, SIQ_LINE));
  m = Math.max(m, smooth(PLAZA.r + W + 4, PLAZA.r + W, Math.hypot(x - PLAZA.c[0], z - PLAZA.c[1])));
  m = Math.max(m, smooth(OUTER.w / 2 + W + 6, OUTER.w / 2 + W, pathDist(x, z, OUTER.path)));
  // the theatre's cavea, cut back into the rock, its cliff built behind it
  m = Math.max(m, smooth(THEATRE.r1 + THEATRE.cliff + W + 3, THEATRE.r1 + THEATRE.cliff + W, Math.hypot(x - THEATRE.c[0], z - THEATRE.c[1])) * smooth(THEATRE.c[0] + THEATRE.west - W - 3, THEATRE.c[0] + THEATRE.west - W, x));
  if (W && inRect(KHAZNEH_ROCK, x, z)) m = 1;
  // the valley; its east cliff (the Royal Tombs) is built, the floor running on under it
  const e = Math.hypot((x - VALLEY.c[0]) / VALLEY.r[0], (z - VALLEY.c[1]) / VALLEY.r[1]), d = W ? EAST_WIDE * smooth(30, 50, x) * smooth(-30, -12, z) : 0;
  m = Math.max(m, smooth(1.08 + d, 1.0 + d, e));
  return m;
}
/** Behind the built cliffs: open ground under them that is never seen (nothing is planted there). */
export const behindWalls = (x, z) => open(x, z) > 0.5 && open(x, z, 0) < 0.97;
/** The valley's slopes: the floor rises gently toward its edge (houses climb them); the east wadi rises to the rim. */
export function floorY(x, z) {
  const e = Math.hypot((x - VALLEY.c[0]) / VALLEY.r[0], (z - VALLEY.c[1]) / VALLEY.r[1]);
  // (but level along the colonnaded street, where the Outer Siq opens into the valley and round the theatre, so that none is buried)
  const valley = e < 1.1 ? 10 * smooth(0.55, 1.0, e) * smooth(OUTER.w / 2 + 4, OUTER.w / 2 + 36, pathDist(x, z, OUTER.path)) * smooth(9, 24, Math.abs(z - STREET.a[1])) * smooth(THEATRE.r1 + 10, THEATRE.r1 + 40, Math.hypot(x - THEATRE.c[0], z - THEATRE.c[1])) : 0;
  const wadi = x > 268 ? RIM * smooth(268, 324, x) : 0;
  return Math.max(valley, wadi);
}
export function height(x, z) {
  if (Math.hypot(x, z) > RADIUS) return RIM;
  const o = open(x, z), rock = RIM + 3 * Math.sin(x / 17) * Math.sin(z / 13) * smooth(RADIUS, RADIUS - 40, Math.hypot(x, z));
  return floorY(x, z) * o + rock * (1 - o);
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
/** Houses on the valley's slopes north and south of the street. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(50);
  for (let x = -230; x < 60; x += 13) for (let z = -100; z < 120; z += 12) {
    const e = Math.hypot((x - VALLEY.c[0]) / VALLEY.r[0], (z - VALLEY.c[1]) / VALLEY.r[1]);
    if (e > 0.9 || Math.abs(z - 12) < 22 || rand() < 0.35) continue;
    if (sacred(x, z, 6) || sacred(x + 11, z + 10, 6) || sacred(x + 11, z, 6) || sacred(x, z + 10, 6) || x > 20 && z > -40) continue;
    const w = 7 + rand() * 4, d = 7 + rand() * 3;
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6) });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
