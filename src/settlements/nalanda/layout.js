// Nalanda about 640 — the layout (docs/settlements/nalanda.md §3): the sacred way running north to south, the row of
// monasteries east of it with their gates facing it, the line of great brick temples to its west, the library
// in the north-west, brick-edged tanks round the compound, the village of the lay people in the south-east.
// Flat Gangetic plain. Pure data. +x east, +z south.

export const RADIUS = 190;
export const WAY = { x0: -7, x1: 7 };
export const LEVEL = -1.0;                                   // the tanks' water
/** The monasteries: 52 × 46 m, gates west on the way. The third (index 2) is the landmark, Monastery 1. */
export const MONASTERIES = [0, 1, 2, 3, 4].map((i) => ({ rect: [14, -123 + i * 50, 66, -77 + i * 50], enter: true, court: ['stupa', 'pavilion', 'teach', 'stupa', 'pavilion'][i], seed: 11 + i }));
export const M1 = MONASTERIES[2];
export const mgate = (m) => [m.rect[0], (m.rect[1] + m.rect[3]) / 2];
/** The temples west of the way: the great temple (Śāriputra's, Temple 3) and others in the line. */
export const TEMPLES = [
  { id: 't3', c: [-44, 0], half: 25, tiers: 4, tierH: 5, shrine: true, shrineH: 5.2, seed: 3 },
  { id: 't2', c: [-44, 66], half: 13, tiers: 3, tierH: 3.5, shrine: true, shrineH: 4.4, seed: 4 },
  { id: 't12', c: [-44, -66], half: 13, tiers: 3, tierH: 3.5, shrine: true, shrineH: 4.4, seed: 5 },
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
  if (ANNEXES.some((a) => inRect(a.rect, x, z, m + 1)) || inRect([-12.5, GATE.c[1] - 5, 12.5, GATE.c[1] + 5], x, z, m) || inRect([-GATE.ww - 12, GATE.c[1] - 1, -10, GATE.c[1] + 1], x, z, m)) return true;
  return inRect(LIBRARY.yard, x, z, m);
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null, YARDS = null;
/** The village houses: rows in continuous runs, south-east of the south tank and east of the east tank; the gaps are yards (pens, the potter's). */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = []; YARDS = [];
  const rand = rng(640), ok = (cx, cz) => Math.hypot(cx, cz) <= RADIUS - 24 && tankD(cx, cz) >= 10;
  for (let z = 92; z < 152; z += 13) {
    for (let x = 76; x < 176;) {
      const w = 8 + rand() * 3, d = Math.min(6 + rand() * 2, 124 - z > 5 ? 124 - z : 8), cx = x + w / 2, cz = z + d / 2;
      if (!ok(cx, cz) || (x + w > 121 && x < 131)) { x += w + 0.4; continue; }
      if (rand() < 0.07) YARDS.push({ rect: [x, z, x + w, z + 7], back: 's' });
      else LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6), y: 0, foot: -0.2, front: 'n' });
      x += w + 0.4;
    }
  }
  for (let x = 134; x < 180; x += 13) {
    for (let z = -100; z < 88;) {
      const w = 7 + rand() * 3, d = 7 + rand() * 2, cx = x + w / 2, cz = z + d / 2;
      if (!ok(cx, cz)) { z += d + 0.4; continue; }
      if (rand() < 0.07) YARDS.push({ rect: [x, z, x + w, z + d], back: 'e' });
      else LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6), y: 0, foot: -0.2, front: 'w' });
      z += d + 0.4;
    }
  }
  return LOTS;
}
export function yards() { lots(); return YARDS; }
/** The way's furniture (§12): lamp pillars both sides between the gates, booths on the east margin, water-sheds on the west, benches against the monasteries' fronts. */
const gz = () => MONASTERIES.map((m) => mgate(m)[1]);
export const WAY_LAMPS = (() => {
  const L = [], g = gz(), blocked = [0, 66, -66, 104, -92];
  for (let z = -134; z <= 114; z += 16) {
    if (blocked.some((b) => Math.abs(z - b) < 7)) continue;
    L.push([-6.3, z]);
    if (!g.some((q) => Math.abs(q - z) < 6)) L.push([6.3, z]);
  }
  return L;
})();
export const BOOTHS = (() => {
  const B = [], kinds = ['flowers', 'lamps', 'pots', 'grain', 'cloth', 'veg'];
  gz().forEach((g, i) => { B.push([5.0, g + 11, 'w', kinds[(i * 2) % 6], 40 + i], [5.0, g - 11, 'w', kinds[(i * 2 + 1) % 6], 50 + i]); });
  for (const z of [-30, 30, 90]) B.push([-5.4, z, 'e', z === 30 ? 'flowers' : 'lamps', 60 + z]);
  return B;
})();
export const JALS = [[-5.6, -88, 'e'], [-5.6, -36, 'e'], [-5.6, 44, 'e'], [-5.6, 82, 'e']];
export const OTLAS = gz().flatMap((g) => [[13.1, g - 21, 13.1, g - 5, 1.0], [13.1, g + 5, 13.1, g + 21, 1.0]]);
/** The annexes east of the monasteries, door on the lane to the south (§13). */
export const ANNEXES = MONASTERIES.map((m, i) => { const zc = (m.rect[1] + m.rect[3]) / 2; return { rect: [70, zc + 10, 88, zc + 22], door: 's', kind: ['refectory', 'kitchen', 'granary', 'infirmary', 'kitchen'][i], seed: 100 + i }; });
export const GATE = { c: [0, 118], half: 5, ww: 22 };
export const STUPA_END = [0, -141, 3.2];
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m)) || YARDS_IN(x, z, m);
const YARDS_IN = (x, z, m) => yards().some((l) => inRect(l.rect, x, z, m));
