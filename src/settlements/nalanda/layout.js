// Nalanda about 640 — the layout (docs/settlements/nalanda.md §3): the sacred way running north to south, the row of
// monasteries east of it with their gates facing it, the line of great brick temples to its west, the library
// in the north-west, brick-edged tanks round the compound, the village of the lay people in the south-east.
// Flat Gangetic plain. Pure data. +x east, +z south.

export const RADIUS = 190;
export const WAY = { x0: -7, x1: 7 };
export const LEVEL = -1.0;                                   // the tanks' water
/** The monasteries: 52 × 46 m, gates west on the way. The third (index 2) is the landmark, Monastery 1. */
export const MONASTERIES = [0, 1, 2, 3, 4].map((i) => ({ rect: [14, -123 + i * 50, 66, -77 + i * 50], enter: i === 2, seed: 11 + i }));
export const M1 = MONASTERIES[2];
export const mgate = (m) => [m.rect[0], (m.rect[1] + m.rect[3]) / 2];
/** The temples west of the way: the great temple (Śāriputra's, Temple 3) and others in the line. */
export const TEMPLES = [
  { id: 't3', c: [-44, 0], half: 25, tiers: 4, tierH: 5, shrine: true, shrineH: 5.2, seed: 3 },
  { id: 't2', c: [-44, 66], half: 13, tiers: 3, tierH: 3.5, seed: 4 },
  { id: 't12', c: [-44, -66], half: 13, tiers: 3, tierH: 3.5, seed: 5 },
  { id: 't13', c: [-44, 104], half: 11, tiers: 3, tierH: 3.2, seed: 6 },
];
export const T3 = TEMPLES[0];
export const LIBRARY = { c: [-96, -92], yard: [-130, -112, -62, -72] };
export const TANKS = [
  { rect: [92, -85, 120, 85], ghats: [-75, -25, 25, 75].map((at) => ({ side: 'w', at, w: 3.6 })) },
  { rect: [-62, 132, 40, 150], ghats: [{ side: 'n', at: 0, w: 7 }, { side: 'n', at: 24, w: 5 }] },
  { rect: [-152, -62, -110, -22], ghats: [{ side: 'e', at: -42, w: 6 }] },
];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const rectD = (r, x, z) => { const dx = Math.max(r[0] - x, x - r[2]), dz = Math.max(r[1] - z, z - r[3]); return dx > 0 || dz > 0 ? Math.hypot(Math.max(dx, 0), Math.max(dz, 0)) : Math.max(dx, dz); };
/** Signed distance to the nearest tank's edge (negative inside it). */
export const tankD = (x, z) => Math.min(...TANKS.map((t) => rectD(t.rect, x, z)));
export function height(x, z) {
  const d = tankD(x, z);
  return (d < 2.7 ? -2.4 * smooth(2.6, -0.4, d) : 0) * (1 - smooth(RADIUS - 30, RADIUS - 4, Math.hypot(x, z)));
}
export const inTankWater = (x, z) => tankD(x, z) < 3 && height(x, z) < LEVEL;
export const inTank = (x, z, m = 0) => tankD(x, z) < 3 + m;
/** The ground the buildings stand on (the compound): monasteries, temples with their stairs, the way, the library's yard. */
export function nearCore(x, z, m = 0) {
  if (inRect([WAY.x0, -150, WAY.x1, 128], x, z, m)) return true;
  if (MONASTERIES.some((q) => inRect([q.rect[0] - 3, q.rect[1], q.rect[2], q.rect[3]], x, z, m))) return true;
  if (TEMPLES.some((t) => inRect([t.c[0] - t.half - 1, t.c[1] - t.half - 1, t.c[0] + t.half + t.tierH * 1.04 + 1, t.c[1] + t.half + 1], x, z, m))) return true;
  return inRect(LIBRARY.yard, x, z, m);
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
/** The village houses: south-east of the south tank and east of the east tank. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(640);
  for (let x = 76; x < 175; x += 14) for (let z = 92; z < 152; z += 13) {
    const w = 8 + rand() * 3, d = 6 + rand() * 2, cx = x + w / 2, cz = z + d / 2;
    if (Math.hypot(cx, cz) > RADIUS - 24 || tankD(cx, cz) < 10 || (x + w > 120 && x < 130) || rand() < 0.3) continue;
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6), y: 0, foot: -0.2, front: 'n' });
  }
  for (let x = 134; x < 180; x += 13) for (let z = -100; z < 86; z += 13) {
    const w = 7 + rand() * 3, d = 7 + rand() * 2, cx = x + w / 2, cz = z + d / 2;
    if (Math.hypot(cx, cz) > RADIUS - 24 || tankD(cx, cz) < 10 || rand() < 0.45) continue;
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6), y: 0, foot: -0.2, front: 'w' });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
