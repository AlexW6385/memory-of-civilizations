// Safavid Isfahan (c. 1630) — the layout of the settlement (docs/settlements/isfahan.md §2):
// Naqsh-e Jahan Square at true size with its arcades, canal, plane trees and polo posts; the Shah
// Mosque on the south, its court and sanctuary turned 45° toward Mecca; Lotfollah on the east, Ali
// Qapu on the west with the royal garden behind it; the Qeysarieh portal and the bazaar on the
// north; and round them the town of courtyard houses. Pure data.
// Coordinates: metres, +x east, +z south.

export const RADIUS = 420;
export const SQUARE = [-80, -300, 80, 260];           // 160 × 560 m
export const ARCADE = 12;                             // the arcade's depth
export const CANAL = 13;                              // the canal's distance in from the arcades
export const GARDEN = [-330, -150, -112, 60];         // the royal garden behind Ali Qapu
export const BAZAAR = { x: 0, z0: -312, z1: -386, w: 5, shops: 5 };
// the Shah Mosque: its portal on the square, the court's centre C, its axis V toward Mecca (south-west)
export const V = [-Math.SQRT1_2, Math.SQRT1_2], U = [Math.SQRT1_2, Math.SQRT1_2];
export const PORTAL = { a: [-16, 260], b: [16, 260], depth: 13 };
export const COURT = { half: 35, ring: 12 };
export const C = [0 + V[0] * (COURT.half + COURT.ring), 273 + V[1] * (COURT.half + COURT.ring)];
/** A point of the mosque given (u across, v toward the qibla) from the court's centre. */
export const M = (u, v) => [C[0] + U[0] * u + V[0] * v, C[1] + U[1] * u + V[1] * v];
export const toMosque = (x, z) => { const dx = x - C[0], dz = z - C[1]; return [dx * U[0] + dz * U[1], dx * V[0] + dz * V[1]]; };
export const MOSQUE = { u: 48, v0: -48, v1: 72 };     // its footprint in (u, v)
export const LOTF = { portal: [[80, -29], [80, -51]], c: [103, -32], half: 10.5 };   // the chamber 19 m inside (Archnet)
export const TEAHOUSE = [17, -332, 35, -316];       // the coffeehouse by the Qeysarieh (docs/settlements/isfahan.md §18)
export const CHAHAR = [-384, -110, -338, 110];       // the Chahar Bagh avenue west of the royal garden, canal on x = CHAHAR_X
export const CHAHAR_X = -361;
export const ALIQAPU = { rect: [-104, -50, -80, -30] };

export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const inMosque = (x, z, m = 0) => { const [u, v] = toMosque(x, z); return Math.abs(u) <= MOSQUE.u + m && v >= MOSQUE.v0 - m && v <= MOSQUE.v1 + m; };
export const BUILT = [SQUARE[0] - ARCADE - 2, SQUARE[1] - ARCADE - 2, SQUARE[2] + ARCADE + 2, SQUARE[3] + ARCADE + 2];
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

let HOUSES = null;
/** The town: courtyard houses on lots of 15–20 m between lanes, round the square, the mosque, the bazaar and the garden. */
export function houses() {
  if (HOUSES) return HOUSES;
  HOUSES = [];
  const rand = rng(1629), S = 23;
  for (let x = -RADIUS; x < RADIUS; x += S) for (let z = -RADIUS; z < RADIUS; z += S) {
    const w = 15 + rand() * 5, d = 15 + rand() * 5, ox = rand() * (S - 3 - w), oz = rand() * (S - 3 - d);
    const r = [x + ox, z + oz, x + ox + w, z + oz + d], cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2;
    const far = Math.max(...[[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].map(([a, b]) => Math.hypot(a, b)));
    if (far > RADIUS - 22) continue;
    if (inRect(BUILT, cx, cz, w / 2 + 2) || inRect(GARDEN, cx, cz, w / 2 + 3)) continue;
    if ([[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]], [cx, cz]].some(([a, b]) => inMosque(a, b, 3))) continue;
    if (Math.abs(cx) < 13 + w / 2 && cz < -300) continue;                                   // the bazaar
    if (inRect([88, -58, 122, -8], cx, cz, w / 2)) continue;                                // Lotfollah's chamber
    if (Math.abs(cz + 40) < 3 + d / 2 && cx > 0) continue;                                   // the lane east from the square
    const skip = rand() < 0.1;
    if (skip || inRect(TEAHOUSE, cx, cz, w / 2 + 4) || inRect(CHAHAR, cx, cz, w / 2 + 2)) continue;
    HOUSES.push({ rect: r, seed: Math.floor(rand() * 1e6) });
  }
  return HOUSES;
}
/** The house open to walk into (docs/settlements/isfahan.md §16): the one the lane from the square's east gap (z −180) meets. */
export const OPEN_HOUSE = () => houses().reduce((b, h) => (Math.hypot((h.rect[0] + h.rect[2]) / 2 - 105, (h.rect[1] + h.rect[3]) / 2 + 180) < Math.hypot((b.rect[0] + b.rect[2]) / 2 - 105, (b.rect[1] + b.rect[3]) / 2 + 180) ? h : b));
let GRID = null;
/** Is (x, z) within m of a house? (a grid of 23 m cells over the lots) */
export function inHouse(x, z, m = 0) {
  if (!GRID) { GRID = new Map(); for (const h of houses()) for (let i = Math.floor((h.rect[0] - 3) / 23); i <= Math.floor((h.rect[2] + 3) / 23); i++) for (let j = Math.floor((h.rect[1] - 3) / 23); j <= Math.floor((h.rect[3] + 3) / 23); j++) { const k = i + ',' + j; if (!GRID.has(k)) GRID.set(k, []); GRID.get(k).push(h); } }
  const l = GRID.get(Math.floor(x / 23) + ',' + Math.floor(z / 23));
  return !!l && l.some((h) => inRect(h.rect, x, z, m));
}
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
