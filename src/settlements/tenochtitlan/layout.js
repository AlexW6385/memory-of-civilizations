// Mexica Tenochtitlan (1519) — the layout (docs/settlements/tenochtitlan.md §2): the Sacred Precinct
// in its serpent wall with the Templo Mayor on its east side, the palace of Moctezuma to the
// south-east, the causeway to the west, canals crossing the island, calpulli houses between them,
// chinampas at the edge and the lake beyond. Pure data. +x east, +z south.

export const RADIUS = 400;
export const PRECINCT = [-150, -150, 150, 150];
export const TM = { c: [95, 0], w: 80, d: 100, h: 45, top: { w: 34, d: 46 } };
export const PALACE = [160, 100, 211, 191];   // between the two canals (it straddled them)
/** The market (tianguis) on the west canal, south of the causeway's avenue, where canoes unload. */
export const MARKET = [-212, 22, -168, 92];
export const LEVEL = { water: -0.7, canalBed: -2.4, lakeBed: -2.6 };
export const ISLAND = 335;                              // the island's edge (chinampas from 300)
export const CAUSEWAY = { z0: -9, z1: 9 };
export const CANALS = [[-RADIUS, 196, RADIUS, 204], [-RADIUS, -204, RADIUS, -196], [216, -RADIUS, 224, RADIUS], [-224, -RADIUS, -216, RADIUS]];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const inCanal = (x, z) => Math.hypot(x, z) < ISLAND && CANALS.some((c) => inRect(c, x, z));
export const inLake = (x, z) => Math.hypot(x, z) > ISLAND && !(x < 0 && z > CAUSEWAY.z0 && z < CAUSEWAY.z1);
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

let HOUSES = null;
/** Calpulli houses round patios, 10–16 m, on blocks between streets 5 m wide, clear of the precinct, the palace, the canals and the causeway. */
export function houses() {
  if (HOUSES) return HOUSES;
  HOUSES = [];
  const rand = rng(1519), S = 19;
  for (let x = -RADIUS; x < RADIUS; x += S) for (let z = -RADIUS; z < RADIUS; z += S) {
    const w = 10 + rand() * 5, d = 10 + rand() * 5, r = [x + 2, z + 2, x + 2 + w, z + 2 + d], cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2;
    if (Math.max(...[[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].map(([a, b]) => Math.hypot(a, b))) > 300) continue;
    if (inRect(PRECINCT, cx, cz, w / 2 + 10) || inRect(PALACE, cx, cz, w / 2 + 6) || inRect(MARKET, cx, cz, w / 2 + 3) || CANALS.some((c) => inRect(c, cx, cz, w / 2 + 4))) continue;
    if (Math.abs(cz) < 12 + d / 2 && cx < -150) continue;
    if (Math.abs(cx) < 8 + w / 2 || Math.abs(cz) < 8 + d / 2) continue;           // the avenues to the gates
    if (rand() < 0.06) continue;
    HOUSES.push({ rect: r, seed: Math.floor(rand() * 1e6) });
  }
  return HOUSES;
}
let GRID = null;
export function inHouse(x, z, m = 0) {
  if (!GRID) { GRID = new Map(); for (const h of houses()) for (let i = Math.floor((h.rect[0] - 3) / 19); i <= Math.floor((h.rect[2] + 3) / 19); i++) for (let j = Math.floor((h.rect[1] - 3) / 19); j <= Math.floor((h.rect[3] + 3) / 19); j++) { const k = i + ',' + j; if (!GRID.has(k)) GRID.set(k, []); GRID.get(k).push(h); } }
  const l = GRID.get(Math.floor(x / 19) + ',' + Math.floor(z / 19));
  return !!l && l.some((h) => inRect(h.rect, x, z, m));
}
