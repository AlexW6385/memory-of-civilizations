// Petra about AD 50 — the layout (docs/settlements/petra.md §2): a sandstone massif cut by
// gorges. From the east the wadi narrows into the Siq, which winds to the little square before
// the Khazneh; the Outer Siq (the Street of Façades, the theatre) runs on north-west into the
// city's open valley — the colonnaded street, the Great Temple, Qasr al-Bint, houses on the
// slopes, the Royal Tombs in the eastern cliff. The Siq is shortened (≈ 170 m of its 1.2 km).
// Pure data. +x east, +z south.

export const RADIUS = 330;
export const RIM = 60;                                        // the massif's top above the valley floor
export const SIQ = { path: [[325, -150], [290, -152], [290, -160], [255, -142], [220, -165], [185, -150], [148, -162]], w: 12 };
export const PLAZA = { c: [128, -160], r: 20 };
export const OUTER = { path: [[128, -160], [126, -120], [108, -82], [80, -52], [40, -20]], w: 34 };
export const VALLEY = { c: [-70, 10], r: [175, 120] };
export const STREET = { a: [60, 12], b: [-128, 12], w: 7 };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function segDist(x, z, a, b) { const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz))); return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t); }
const pathDist = (x, z, p) => { let d = Infinity; for (let i = 0; i + 1 < p.length; i++) d = Math.min(d, segDist(x, z, p[i], p[i + 1])); return d; };
function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
/** How open the ground is (1 on a gorge or valley floor, 0 on the massif). */
export function open(x, z) {
  let m = smooth(SIQ.w / 2 + 3, SIQ.w / 2, pathDist(x, z, SIQ.path));
  m = Math.max(m, smooth(PLAZA.r + 4, PLAZA.r, Math.hypot(x - PLAZA.c[0], z - PLAZA.c[1])));
  m = Math.max(m, smooth(OUTER.w / 2 + 6, OUTER.w / 2, pathDist(x, z, OUTER.path)));
  const e = Math.hypot((x - VALLEY.c[0]) / VALLEY.r[0], (z - VALLEY.c[1]) / VALLEY.r[1]);
  m = Math.max(m, smooth(1.08, 1.0, e));
  return m;
}
/** The valley's slopes: the floor rises gently toward its edge (houses climb them); the east wadi rises to the rim. */
export function floorY(x, z) {
  const e = Math.hypot((x - VALLEY.c[0]) / VALLEY.r[0], (z - VALLEY.c[1]) / VALLEY.r[1]);
  const valley = e < 1.1 ? 10 * smooth(0.55, 1.0, e) : 0;
  const wadi = x > 268 ? RIM * smooth(268, 324, x) : 0;
  return Math.max(valley * (x < 100 ? 1 : 0), wadi);
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
    if (inRect([-175, -20, -125, 30], x, z, 6) || inRect([-90, 26, -30, 76], x, z, 6) || x > 20 && z > -40) continue;
    const w = 7 + rand() * 4, d = 7 + rand() * 3;
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6) });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
