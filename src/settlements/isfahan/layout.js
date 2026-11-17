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
/** The pigeon towers of the fields at the disc's edge (docs/settlements/isfahan.md §23). */
export const DOVECOTES = [[20, 7.5, 17], [75, 8.5, 20], [130, 7, 15], [205, 8, 18], [245, 7.2, 16], [315, 8.2, 19]].map(([deg, r, h], i) => ({ c: [Math.cos(deg * Math.PI / 180) * 407, Math.sin(deg * Math.PI / 180) * 407], r, h, seed: 40 + i }));
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

// ── the houses beyond the arrival's 120 m that can be entered (docs/settlements/isfahan.md §22) ──
let OPENS = null;
const freeWay = (x, z) => !inHouse(x, z, 0.4) && !inMosque(x, z, 1) && !inRect(BUILT, x, z) && !inRect(GARDEN, x, z, 1) && !inRect(TEAHOUSE, x, z, 1) && !inRect(CHAHAR, x, z, 1) && !inRect([88, -58, 122, -8], x, z) && !(Math.abs(x) < 14 && z < -300);
/**
 * The houses that can be entered: the lane house and about fourteen more spread over the town beyond 125 m of the arrival,
 * each with its own plan by rule (the side of its street door — the lane with the most room before it —, which wings are the sedari,
 * the kitchen or the store, how the talar opens, the front of the door, the height and walling, the court's pool, takht and beds).
 * Each: { rect, seed, entry, v } with v the data the builder draws from (rooms, court, front, figures' places).
 */
export function openHouses() {
  if (OPENS) return OPENS;
  const first = OPEN_HOUSE(), rand = rng(9031), pickd = [], all = houses().filter((h) => h !== first);
  const cen = (h) => [(h.rect[0] + h.rect[2]) / 2, (h.rect[1] + h.rect[3]) / 2];
  const cand = all.filter((h) => { const [cx, cz] = cen(h); return Math.hypot(cx - ARRIVAL[0], cz - ARRIVAL[1]) > 125 && Math.hypot(cx, cz) < 340 && h.rect[2] - h.rect[0] >= 15.5 && h.rect[3] - h.rect[1] >= 15.5; });
  for (let i = cand.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [cand[i], cand[j]] = [cand[j], cand[i]]; }
  const chosen = [first];
  for (const h of cand) {
    if (chosen.length >= 28) break;
    const [cx, cz] = cen(h);
    if (chosen.some((o) => Math.hypot(cen(o)[0] - cx, cen(o)[1] - cz) < 38)) continue;
    if (!doorSide(h)) continue;
    chosen.push(h);
  }
  void pickd;
  OPENS = chosen.map((h, i) => houseVar(h, i === 0 ? 'w' : doorSide(h)));
  return OPENS;
}
/** The side of the street door: the lane (w, e or s) with the most free way before it, at least 2.4 m. */
function doorSide(h) {
  const [x0, z0, x1, z1] = h.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  let best = null, bg = 2.4;
  for (const [side, px, pz, dx, dz] of [['w', x0, cz, -1, 0], ['e', x1, cz, 1, 0], ['s', cx, z1, 0, 1]]) {
    let g = 0;
    for (; g < 7; g += 0.6) if (!freeWay(px + dx * (g + 0.6), pz + dz * (g + 0.6))) break;
    if (g > bg) { bg = g; best = side; }
  }
  return best;
}
/** One house's plan by rule from its seed: the rooms, the court, the front (all the builder and the life plan read). */
export function houseVar(h, entry) {
  const r = rng(h.seed ^ 0x5bd1), [x0, z0, x1, z1] = h.rect, W = x1 - x0, D = z1 - z0;
  const d = { n: 4.6 + r() * 0.6, s: 3.2 + r() * 0.5, e: 3.5 + r() * 0.5, w: 3.5 + r() * 0.5 };
  const sides = ['s', 'w', 'e'].filter((q) => q !== entry), swap = r() < 0.5, A = swap ? sides[1] : sides[0], B = swap ? sides[0] : sides[1];
  const wings = { n: 'hall', [entry]: 'vestibule', [A]: r() < 0.6 ? 'sedari' : 'winter', [B]: r() < 0.5 ? 'kitchen' : 'store' };
  const L = W - d.w - d.e, triple = L >= 9.6 && r() < 0.55;
  const court = [x0 + d.w, z0 + d.n, x1 - d.e, z1 - d.s], cx = (court[0] + court[2]) / 2, cz = (court[1] + court[3]) / 2;
  const pw = Math.min(2.4, (court[2] - court[0]) * 0.2) * (0.85 + r() * 0.3), pd = Math.min(1.6, (court[3] - court[1]) * 0.16) * (0.85 + r() * 0.3);
  const half = (court[2] - court[0]) / 2, dep = 2.2, len = 2.4;
  // a takht against the vestibule's wall (clear of the pool, the vestibule's inner door and the hall's step), if the court has room
  let takht = entry === 's' ? [court[0] + 0.6, court[3] - dep, court[0] + 0.6 + len, court[3]] : entry === 'w' ? [court[0], court[1] + 0.7, court[0] + dep, court[1] + 0.7 + len] : [court[2] - dep, court[1] + 0.7, court[2], court[1] + 0.7 + len];
  const pr = [cx - pw - 0.8, cz - pd - 0.8, cx + pw + 0.8, cz + pd + 0.8];
  if (r() > 0.55 || !(takht[2] < pr[0] || takht[0] > pr[2] || takht[3] < pr[1] || takht[1] > pr[3])) takht = null;
  const hb = Math.min(1.0, (half - pw - 0.3 - 0.45) / 2), bx = pw + 0.3 + 0.2 + hb;           // beds beside the pool, clear of its rim and the wings
  const beds = hb < 0.55 ? [] : [[cx - bx, cz, hb], [cx + bx, cz, hb]].filter((b) => !(takht && ((entry === 'w' && b[0] < cx) || (entry === 'e' && b[0] > cx) || (entry === 's' && b[0] < cx))));
  return {
    rect: h.rect, seed: h.seed, entry,
    v: { d, wings, H: 4.6 + r() * 1.2, hallH: 7 + r() * 0.8, triple, hall: ['tray', 'sufra', 'rahle', 'hookah'][Math.floor(r() * 4)], carpet: ['persian', 'blue', 'maroon', 'persian'][Math.floor(r() * 4)],
      front: ['lintel', 'portal', 'bench', 'panels'][Math.floor(r() * 4)], out: r() < 0.25 ? 'brick_buff' : r() < 0.5 ? 'mud_plaster' : 'kahgel',
      dome: r() < 0.45, pool: [cx, cz, pw, pd], beds, takht, kind: r(), pious: r() < 0.3 },
  };
}
/** A house's rooms' inner rectangles (as the builder lays them) and the places its people take: the master on the talar's carpet, the cook at the hearth, a man on the takht, a servant in the court. */
export function houseSpots(h) {
  const [x0, z0, x1, z1] = h.rect, d = h.v.d, rr = { n: [x0 + d.w, z0 + 0.6, x1 - d.e, z0 + d.n - 0.45], w: [x0 + 0.6, z0 + d.n, x0 + d.w - 0.45, z1 - d.s], e: [x1 - d.e + 0.45, z0 + d.n, x1 - 0.6, z1 - d.s], s: [x0 + d.w, z1 - d.s + 0.45, x1 - d.e, z1 - 0.6] };
  const court = [x0 + d.w, z0 + d.n, x1 - d.e, z1 - d.s], t = rr.n, out = { rooms: rr, court, people: [] };
  out.people.push({ at: [(t[0] + t[2]) / 2 - 1.4, t[1] + 1.25], rot: Math.PI, y: 0.47, pose: 'cross', man: true, cloth: 'cloth_green' });
  out.people.push({ at: [court[2] - 1.6, court[3] - 1.3], rot: Math.PI / 2, y: 0.04, pose: 'stand', man: true, cloth: 'cloth_white' });
  for (const side of ['s', 'w', 'e']) if (h.v.wings[side] === 'kitchen') {
    const r = rr[side], along = side === 's', cu = along ? (r[0] + r[2]) / 2 : (r[1] + r[3]) / 2, w = along ? r[2] - r[0] : r[3] - r[1];
    const at = along ? [cu + w * 0.28, r[3] - 1.4] : [side === 'w' ? r[0] + 1.4 : r[2] - 1.4, cu + w * 0.28], dir = along ? [0, 1] : [side === 'w' ? -1 : 1, 0];
    out.people.push({ at, rot: Math.atan2(-dir[0], -dir[1]), y: 0.47, pose: 'stand', woman: true });
  }
  if (h.v.takht) { const k = h.v.takht, e = h.entry; out.people.push({ at: [(k[0] + k[2]) / 2 + (e === 'w' ? -0.1 : e === 'e' ? 0.1 : 0), (k[1] + k[3]) / 2 + (e === 's' ? 0.1 : 0)], rot: e === 'w' ? -Math.PI / 2 : e === 'e' ? Math.PI / 2 : 0, y: 0.52, pose: 'cross', man: true, cloth: 'cloth_ochre' }); }
  return out;
}
let GRID = null;
/** Is (x, z) within m of a house? (a grid of 23 m cells over the lots) */
export function inHouse(x, z, m = 0) {
  if (!GRID) { GRID = new Map(); for (const h of houses()) for (let i = Math.floor((h.rect[0] - 3) / 23); i <= Math.floor((h.rect[2] + 3) / 23); i++) for (let j = Math.floor((h.rect[1] - 3) / 23); j <= Math.floor((h.rect[3] + 3) / 23); j++) { const k = i + ',' + j; if (!GRID.has(k)) GRID.set(k, []); GRID.get(k).push(h); } }
  const l = GRID.get(Math.floor(x / 23) + ',' + Math.floor(z / 23));
  return !!l && l.some((h) => inRect(h.rect, x, z, m));
}
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

// ── the arcades round the square (docs/settlements/isfahan.md §4): the runs between the gaps, and the shops of the walk-in bays ──
export const ARRIVAL = [0, 170];                      // src/planet/arrivals.js
/** The arcade's straight runs [a, b], broken for the streets and the monuments (the gaps are the lanes at z −180, the Ali Qapu and Lotfollah portals, the lane at z 120, the Qeysarieh and the Shah Mosque portals). */
export const ARCADE_RUNS = (() => {
  const [sx0, sz0, sx1, sz1] = SQUARE, out = [];
  const runs = (along, gaps, lo, hi) => { let u = lo; for (const [g0, g1] of gaps) { if (g0 > u) out.push([along(u), along(g0)]); u = g1; } if (hi > u) out.push([along(u), along(hi)]); };
  runs((z) => [sx0 - 0.6, z], [[-183, -177], [-51, -29], [117, 123]], sz0, sz1);
  runs((z) => [sx1 + 0.6, z], [[-183, -177], [LOTF.portal[1][1], LOTF.portal[0][1]], [117, 123]], sz0, sz1);
  runs((x) => [x, sz0 - 0.6], [[-15, 15]], sx0, sx1);
  runs((x) => [x, sz1 + 0.6], [[PORTAL.a[0], PORTAL.b[0]]], sx0, sx1);
  return out;
})();
/** The shops that can be entered: every second bay of the arcade within 115 m of the arrival (a shop room 5 m deep behind the door, lit, furnished by its trade, the shopkeeper in it). */
export const ARCADE_OPEN = { at: ARRIVAL, r: 115, every: 2, not: [[-84, 252, -12, 292]] };   // not: where the Shah Mosque's court and its masses stand behind the arcade
export const SHOP_TRADES = ['cloth', 'carpet', 'copper', 'spice', 'pottery'];
/** Every bay of the arcade: { c (on the wall line), u (along), n (away from the square), w (bay width), open, trade }. */
export function arcadeBays() {
  const [sx0, sz0, sx1, sz1] = SQUARE, mid = [0, (sz0 + sz1) / 2], out = [];
  for (const [a, b] of ARCADE_RUNS) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / 7)), w = L / n, u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
    let nv = [-u[1], u[0]]; if ((mid[0] - (a[0] + b[0]) / 2) * nv[0] + (mid[1] - (a[1] + b[1]) / 2) * nv[1] > 0) nv = [-nv[0], -nv[1]];
    for (let i = 0; i < n; i++) {
      const c = [a[0] + u[0] * (i + 0.5) * w, a[1] + u[1] * (i + 0.5) * w];
      const e = [c[0] + nv[0] * 8, c[1] + nv[1] * 8], open = i % ARCADE_OPEN.every === 0 && Math.hypot(e[0] - ARCADE_OPEN.at[0], e[1] - ARCADE_OPEN.at[1]) < ARCADE_OPEN.r && !ARCADE_OPEN.not.some((r) => inRect(r, e[0], e[1]));
      out.push({ c, u, n: nv, w, open, trade: SHOP_TRADES[Math.abs(Math.round(c[0] * 7 + c[1] * 3)) % SHOP_TRADES.length] });
    }
  }
  return out;
}
