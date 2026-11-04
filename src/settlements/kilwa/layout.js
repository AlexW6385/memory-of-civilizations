// Kilwa Kisiwani about 1330 — the layout (docs/settlements/kilwa.md §2): the island town on its
// north shore — the Great Mosque in the middle of the town, the stone houses round it, the beach
// with dhows drawn up; Husuni Kubwa, the sultan's palace, on the cliff to the east; mangroves,
// baobabs and coconut palms; the island ends at the disc's edge in the Indian Ocean. Pure data.
// +x east, +z south (the sea and the harbour to the north).

export const RADIUS = 340;
export const SEA = -2.5, RIM = -12;
export const MOSQUE = [-40, -10, 20, 40];
export const PALACE = [150, -150, 260, -95];
export const POOL = [205, -80, 6];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const shoreZ = (x) => -120 - 15 * Math.sin(x / 60) - (x > 120 ? 30 : 0);
/** The island: a low plateau, a cliff at the palace, the beach on the north; the sea round about. */
export function height(x, z) {
  const r = Math.hypot(x, z), sz = shoreZ(x);
  let h = 2 + 2 * smooth(sz, sz + 200, z);
  if (x > 120 && z < -60) h = Math.max(h, 10 * smooth(110, 150, x));                 // the cliff of Husuni Kubwa
  const beach = smooth(sz + 10, sz - 18, z), edge = smooth(RADIUS - 90, RADIUS - 25, r);
  const sea = Math.max(beach, edge);
  return h * (1 - sea) + RIM * sea;
}
export const inSea = (x, z) => height(x, z) < SEA - 0.2;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1330);
  for (let x = -220; x < 120; x += 12) for (let z = -100; z < 160; z += 11) {
    const w = 8 + rand() * 3, d = 8 + rand() * 2, cx = x + w / 2, cz = z + d / 2;
    if (Math.hypot(cx, cz) > RADIUS - 110 || inRect(MOSQUE, cx, cz, 10) || height(cx, cz) < 1.5 || rand() < 0.3 + 0.4 * smooth(100, 220, Math.hypot(cx, cz))) continue;
    const ys = [[x, z], [x + w, z], [x, z + d], [x + w, z + d]].map(([a, b]) => height(a, b));
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6), y: Math.max(...ys) });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
