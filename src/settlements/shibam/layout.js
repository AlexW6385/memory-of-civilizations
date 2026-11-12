// Shibam about 1700 (docs/settlements/shibam.md §2): the rectangle of the walled town on its low platform above the wadi floor,
// one gate in the south wall and the street from it to the square, the Friday mosque west of the square, the sultan's palace north of it,
// the tower houses in rows of lots along east–west streets (back to back, alleys between groups), the wadi floor with its palm gardens
// outside. Pure data. Coordinates: metres, +x east, +z south.

import { houseDims, topOf } from '../../styles/hadhrami/dims.js';

export const RADIUS = 190;
/** The wall (its line) and the platform's height above the wadi floor outside. */
export const WALL = [-140, -95, 140, 95], WALL_TH = 1.4, WALL_H = 4.8, PLATFORM = 2.5;
export const GATE = { x: -9.5, w: 4.6, h: 3.8 };
export const SQUARE = [-30, -28, 30, 2.2];
export const MOSQUE = [-58, -26, -33, 2];
export const PALACE = [-22, -62, 22, -31];
/** The enterable tower house (storeys 7), a lot on the square's east side, its door on the west face. */
export const LM = { rect: [33, -28, 43.4, -18.8], storeys: 7 };
export const LMD = houseDims(LM.rect);
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
/** How far a point lies outside the wall's rectangle (0 within). */
export const outside = (x, z) => Math.hypot(Math.max(WALL[0] - x, 0, x - WALL[2]), Math.max(WALL[1] - z, 0, z - WALL[3]));
const ROAD = [GATE.x - 2.6, GATE.x + 2.6];
const rectHit = (a, b, m = 0) => a[0] < b[2] + m && a[2] > b[0] - m && a[1] < b[3] + m && a[3] > b[1] - m;

let LOTS = null;
/**
 * The tower houses: { rect, front ('n'|'s'), storeys, seed, free: { n, s, e, w }, rich }. Bands of two rows back to back along east–west
 * streets 2.6 m wide; the rows broken by alleys 2 m wide every three to six houses and by the main street from the gate; the storeys
 * highest near the square and the mosque (the rich quarter), fewer toward the wall.
 */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1700), DEP = 9.2, ST = 2.6, X0 = -137, X1 = 137;
  const no = [[SQUARE, -0.02], [MOSQUE, 2.3], [PALACE, 2.3], [LM.rect, 2.3]];
  for (let bz = -91; bz + DEP < 93; bz += 2 * DEP + ST) {
    for (const row of ['n', 's']) {
      const z0 = row === 'n' ? bz : bz + DEP, z1 = z0 + DEP;
      if (z1 > 92.5) continue;
      let x = X0, run = 0, limit = 3 + Math.floor(rand() * 4), prevEnd = false;
      const rowLots = [];
      while (x < X1 - 5) {
        let w = 6.4 + rand() * 3.8;
        if (x >= ROAD[0] && x < ROAD[1]) { x = ROAD[1]; run = 0; prevEnd = true; continue; }
        if (x < ROAD[0] && x + w > ROAD[0] - 0.2) { w = ROAD[0] - x; if (w < 5.2) { const lastL = rowLots[rowLots.length - 1]; if (lastL && Math.abs(lastL.rect[2] - x) < 0.01) { lastL.rect[2] = ROAD[0]; lastL.free.e = 1; } x = ROAD[1]; run = 0; prevEnd = true; continue; } }
        if (x + w > X1) w = X1 - x;
        if (w < 5) break;
        const rect = [x, z0, x + w, z1], endNext = run + 1 >= limit || x + w >= ROAD[0] - 0.2 && x < ROAD[0];
        const hit = no.some(([r, m]) => rectHit(rect, r, m));
        if (!hit) rowLots.push({ rect, front: row, sq: false, free: { n: row === 'n' ? 1 : 0, s: row === 's' ? 1 : 0, w: prevEnd ? 1 : 0, e: endNext ? 1 : 0 }, seed: Math.floor(rand() * 1e9) });
        else if (rowLots.length) rowLots[rowLots.length - 1].free.e = 1;
        prevEnd = hit ? true : false;
        x += w; run++;
        if (endNext) { x += run >= limit ? 2.0 : 0; run = 0; limit = 3 + Math.floor(rand() * 4); prevEnd = true; }
      }
      for (const l of rowLots) {
        // the row along the square's south edge turns its front to the square
        if (Math.abs(l.rect[1] - SQUARE[3]) < 0.01 && l.rect[2] > SQUARE[0] && l.rect[0] < SQUARE[2]) { l.front = 'n'; l.sq = true; l.free.n = 1; l.free.s = 1; }
        const cx = (l.rect[0] + l.rect[2]) / 2, cz = (l.rect[1] + l.rect[3]) / 2, d = Math.hypot((cx - MOSQUE[2]) * 0.8, cz + 12);
        const dq = Math.min(Math.hypot(cx, cz + 10), d + 10);
        l.storeys = Math.max(5, Math.min(11, Math.round(5.4 + 4.8 * Math.pow(Math.max(0, 1 - dq / 175), 1.1) + (rand() - 0.5) * 2.6)));
        l.rich = dq < 90 && rand() < 0.45;
        LOTS.push(l);
      }
    }
  }
  return LOTS;
}
/** Keep the house's height for others (movers, smoke). */
export const heightOf = (l) => topOf(l.storeys);
/** The walking ways inside: the main street from the gate, the east–west streets (centre lines). */
export function streets() {
  const out = [], DEP = 9.2, ST = 2.6;
  out.push({ a: [GATE.x, WALL[3] - 1], b: [GATE.x, SQUARE[3]], w: 5.2 });
  for (let bz = -91; bz + DEP < 93; bz += 2 * DEP + ST) out.push({ a: [-136, bz - ST / 2], b: [136, bz - ST / 2], w: ST });
  return out;
}

/** Where the street door stands along the front (the coordinate along the front: x for a front n or s), for a lot: off the middle, or in the middle for a shop. */
export function doorOf(l) {
  const r = rng(l.seed ^ 0x9e37), [x0, , x1] = l.rect, L = x1 - x0, t = l.shop ? 0.5 + (r() - 0.5) * 0.16 : 0.3 + 0.4 * r();
  return x0 + L * t;
}
/** The trades of the shops that can be entered, in the order they are given out (docs/settlements/shibam.md §5). */
export const TRADES = ['spice', 'cloth', 'grain', 'qahwa', 'honey', 'indigo', 'silver', 'weaver', 'smith', 'carpenter', 'jars', 'tailor', 'barber', 'cloth', 'spice', 'grain'];
let SHOPS = null;
/** The lots with a ground floor to enter: along the square's south edge first, then the main street from the gate and the streets near the square. Each lot gets .shop = { trade, rect (the room), y }. */
export function shops() {
  if (SHOPS) return SHOPS;
  SHOPS = [];
  const L = lots(), chosen = [], far = (l, d) => chosen.every((c) => Math.hypot(c.cx - l.cx, c.cz - l.cz) >= d);
  for (const l of L) { l.cx = (l.rect[0] + l.rect[2]) / 2; l.cz = (l.rect[1] + l.rect[3]) / 2; }
  const take = (list, n, d) => { for (const l of list) { if (chosen.length >= n || l.rect[2] - l.rect[0] < 6.2 || !far(l, d)) continue; chosen.push(l); } };
  take(L.filter((l) => l.sq).sort((a, b) => a.cx - b.cx), 7, 10.5);
  const main = L.filter((l) => l.cx > GATE.x - 22 && l.cx < GATE.x + 22 && l.cz > 14 && l.cz < 85 && (l.front === 'n' ? l.rect[0] : l.rect[2]) !== undefined).sort((a, b) => a.cz - b.cz);
  take(main, 12, 17);
  take(L.filter((l) => !l.sq && Math.hypot(l.cx, l.cz + 12) < 95).sort((a, b) => Math.hypot(a.cx, a.cz + 12) - Math.hypot(b.cx, b.cz + 12)), 17, 26);
  chosen.forEach((l, i) => {
    l.shop = { trade: TRADES[i % TRADES.length], i };
    const [x0, z0, x1, z1] = l.rect, w = 0.9;
    l.shop.rect = [x0 + w, z0 + w, x1 - w, z1 - w];
    SHOPS.push(l);
  });
  return SHOPS;
}
/** The lots as a map by rect (for what must know a house's door). */
export const doorWorld = (l) => { const u = doorOf(l); return l.front === 'n' ? [u, l.rect[1]] : [u, l.rect[3]]; };

/** The garden plots of the wadi floor (the mud-walled palm gardens): the south belt in two rows, and the flanks east and west. { rect, gate: 'n'|'s'|'e'|'w' } */
let GARDENS = null;
export function gardens(chanZ) {
  if (GARDENS) return GARDENS;
  GARDENS = [];
  const rand = rng(1704);
  const ok = (r) => Math.hypot(Math.max(Math.abs(r[0]), Math.abs(r[2])), Math.max(Math.abs(r[1]), Math.abs(r[3]))) < RADIUS - 9;
  for (const [z0, z1] of [[112, 129], [133, 150]]) for (let x = -124; x + 24 <= 124; x += 28) {
    const r = [x, z0, x + 24, z1];
    if (r[0] < GATE.x + 9 && r[2] > GATE.x - 9) continue;
    const cz = Math.min(chanZ(r[0]), chanZ(r[2]), chanZ((r[0] + r[2]) / 2));
    if (r[3] > cz - 14 || !ok(r)) continue;
    GARDENS.push({ rect: r, gate: z0 === 112 ? 's' : 'n', seed: Math.floor(rand() * 1e9) });
  }
  for (const sx of [-1, 1]) for (let z = -84; z + 22 <= 86; z += 26) for (const [a, b] of [[150, 169]]) {
    const r = sx > 0 ? [a, z, b, z + 22] : [-b, z, -a, z + 22];
    if (!ok(r)) continue;
    GARDENS.push({ rect: r, gate: sx > 0 ? 'w' : 'e', seed: Math.floor(rand() * 1e9) });
  }
  return GARDENS;
}
/** Is a point inside a garden plot (its interior, 1.2 m in from the walls)? */
export const inGarden = (x, z, chanZ) => gardens(chanZ).some((g) => x > g.rect[0] + 1.2 && x < g.rect[2] - 1.2 && z > g.rect[1] + 1.2 && z < g.rect[3] - 1.2);

let CROSS = null;
/**
 * The places where a line or a bridge can cross a way between two houses: { x, z, dir: 'z'|'x', gap, a, b } — over the streets (between
 * the south row of a band and the north row of the next) and over the alleys between two houses of a row; x, z the middle; a and b the
 * lots at either end.
 */
export function crossings() {
  if (CROSS) return CROSS;
  CROSS = [];
  const L = lots(), rows = new Map();
  for (const l of L) { const k = l.rect[1].toFixed(1); (rows.get(k) ?? rows.set(k, []).get(k)).push(l); }
  for (const l of L) {
    // over the street: the lot of the row whose north face meets this lot's south face across the street
    const nz = l.rect[3] + 2.6, row = rows.get(nz.toFixed(1)) ?? [];
    for (const m of row) {
      const lo = Math.max(l.rect[0], m.rect[0]), hi = Math.min(l.rect[2], m.rect[2]);
      if (hi - lo > 3.4 && l.front === 's') CROSS.push({ x: (lo + hi) / 2, lo, hi, z: l.rect[3] + 1.3, dir: 'z', gap: 2.6, a: l, b: m });
    }
    // over the alley: the next lot of the same row 2 m on
    const row2 = rows.get(l.rect[1].toFixed(1)) ?? [];
    for (const m of row2) if (Math.abs(m.rect[0] - l.rect[2] - 2.0) < 0.05) CROSS.push({ x: l.rect[2] + 1.0, lo: Math.max(l.rect[1], m.rect[1]), hi: Math.min(l.rect[3], m.rect[3]), z: (l.rect[1] + l.rect[3]) / 2, dir: 'x', gap: 2.0, a: l, b: m });
  }
  return CROSS;
}

/** A point in a shop's room: a along the front from the left, b inward from the front (the room's frame as the style furnishes it); the world's x, z. */
export function shopPoint(l, a, b) {
  const [ix0, iz0, ix1, iz1] = l.shop.rect;
  return [ix0 + a, l.front === 'n' ? iz0 + b : iz1 - b];
}
/** The room's size: { W, D }. */
export const shopSize = (l) => ({ W: l.shop.rect[2] - l.shop.rect[0], D: l.shop.rect[3] - l.shop.rect[1] });
/** The palace hall's room (inside the ground storey's walls) and the door's coordinate. */
export const HALL = { rect: [PALACE[0] + 0.9, PALACE[1] + 0.9, PALACE[2] - 0.9, PALACE[3] - 0.9], door: 0 };
