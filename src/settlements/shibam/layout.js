// Shibam about 1700 (docs/settlements/shibam.md §2): the rectangle of the walled town on its low platform above the wadi floor,
// one gate in the south wall and the street from it to the square, the Friday mosque west of the square, the sultan's palace north of it,
// the tower houses in rows of lots along east–west streets (back to back, alleys between groups), the wadi floor with its palm gardens
// outside. Pure data. Coordinates: metres, +x east, +z south.

import { houseDims, topOf } from '../../styles/hadhrami/dims.js';

export const RADIUS = 190;
/** The wall (its line) and the platform's height above the wadi floor outside. */
export const WALL = [-140, -95, 140, 95], WALL_TH = 1.4, WALL_H = 4.8, PLATFORM = 2.5;
export const GATE = { x: -9.5, w: 4.6, h: 3.8 };
export const SQUARE = [-30, -28, 30, 4];
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
  const no = [[SQUARE[0], SQUARE[1], SQUARE[2], SQUARE[3]], MOSQUE, PALACE, LM.rect];
  for (let bz = -91; bz + DEP < 93; bz += 2 * DEP + ST) {
    for (const row of ['n', 's']) {
      const z0 = row === 'n' ? bz : bz + DEP, z1 = z0 + DEP;
      if (z1 > 92.5) continue;
      let x = X0, run = 0, limit = 3 + Math.floor(rand() * 4), prevEnd = false;
      const rowLots = [];
      while (x < X1 - 5) {
        let w = 6.4 + rand() * 3.8;
        if (x >= ROAD[0] && x < ROAD[1]) { x = ROAD[1]; run = 0; prevEnd = true; continue; }
        if (x < ROAD[0] && x + w > ROAD[0] - 0.2) { w = ROAD[0] - x; if (w < 5.2) { x = ROAD[1]; run = 0; prevEnd = true; continue; } }
        if (x + w > X1) w = X1 - x;
        if (w < 5) break;
        const rect = [x, z0, x + w, z1], endNext = run + 1 >= limit || x + w >= ROAD[0] - 0.2 && x < ROAD[0];
        const hit = no.some((r) => rectHit(rect, r, 2.3)) && !(rect === LM.rect);
        if (!hit) rowLots.push({ rect, front: row, free: { n: row === 'n' ? 1 : 0, s: row === 's' ? 1 : 0, w: prevEnd ? 1 : 0, e: endNext ? 1 : 0 }, seed: Math.floor(rand() * 1e9) });
        else if (rowLots.length) rowLots[rowLots.length - 1].free.e = 1;
        prevEnd = hit ? true : false;
        x += w; run++;
        if (endNext) { x += run >= limit ? 2.0 : 0; run = 0; limit = 3 + Math.floor(rand() * 4); prevEnd = true; }
      }
      for (const l of rowLots) {
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
