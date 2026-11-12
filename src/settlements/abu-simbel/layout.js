// Abu Simbel about 1255 BC (docs/settlements/abu-simbel.md §2): the cliff on the Nile's west bank facing east, the Great Temple cut in it
// (axis east–west, z = 0), the Small Temple of Nefertari 112 m to the north, the paved terrace before the great façade between its mudbrick
// walls with the sun altar and the stone gate, the way to the Small Temple, the ramp down the bank to the quay, the river; the priests'
// houses north of the terrace, the workmen's camp south of it. Pure data. Coordinates: metres, +x east (toward the Nile), +z south.

import { FX, FXS, ZS, cliffFace } from '../../styles/ramesside/dims.js';

export { FX, FXS, ZS, cliffFace };
export const RADIUS = 190;
/** Water level of the Nile and the terrace's level (the bank falls 8.4 m from the terrace to the bed). */
export const WATER = -8.0, TERRACE_Y = 0.04;
export const BANK_X = 12, BED_X = 62;
// the paved terrace before the Great Temple, its mudbrick walls (north and south), the stone gate in the north wall
export const TERRACE = [FX + 0.2, -30, BANK_X, 30];
export const WALL = { z: 30, x0: FX, x1: 8, th: 2.2, h: 3.6 };
export const GATE = { x: -18, w: 3.2, h: 3.4 };
// the south gate: a plainer door of the enclosure, onto the market and the camp
export const SGATE = { x: -4.3, w: 3.0, h: 3.2 };
export const ALTAR = { x: -8, z: -24.5 };
// the Small Temple's terrace and the way to it from the north gate
export const SMALL_TERRACE = [FXS + 0.2, ZS - 21, -4, ZS + 21];
export const WAY = [-20, -112 + 21, -16, -30];
// the quay, with its ramp from the terrace, and the landing stair
export const QUAY = [46, -12, 62, 12], QUAY_Y = -6.3;
// the priests' houses (north of the terrace, east of the way) and the workmen's camp (south), as rows of houses back to back along lanes
export const PRIESTS = [-12, -84, 11, -36];
export const CAMP = [-36, 31.5, 10.4, 140];
/** The market of the camp, the street between the first two rows (a market room of the plan: stalls, mats, figures). */
export const MARKET = [-36, 37.4, 10.4, 42.2];
/** The yard of the round granaries (no houses on it). */
export const GRAN_YARD = [-2.4, 74.4, 10.4, 87.6];
/** The quay's store (a mud shed) and the fields on the bank, as rects. */
export const FIELDS = [[14, -58, 30, -14], [14, 14, 30, 58]];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/** The trades of the shops along the market street, in the order of the row (north side first: against the temple's wall; south side: doors north). */
const TRADES_N = ['potter', 'weaver', 'scribe', 'sandals', 'jeweller', 'carpenter', 'butcher'];
const TRADES_S = ['bakery', 'brewer', 'bakery', 'weaver', 'butcher', 'potter', 'bakery'];

let LOTS = null, LANES = null;
/** Cuts a row's x-span [a, b] into houses of about `target` m: [[x0, x1]] with 0.5 m party walls. */
function split(a, b, target, rand) {
  const n = Math.max(1, Math.round((b - a) / target)), g = 0.5, tot = b - a - g * (n - 1);
  const w = Array.from({ length: n }, () => 0.82 + rand() * 0.36), S = w.reduce((p, q) => p + q, 0), out = [];
  let x = a;
  for (let i = 0; i < n; i++) { const d = tot * w[i] / S; out.push([x, x + d]); x += d + g; }
  return out;
}
/**
 * The lots: { kind ('house' | 'shop' | 'bakery'), trade, rect, front ('s' | 'n': the lane the door opens on), seed, quarter ('priests' | 'camp'), furnish }.
 * Rows stand back to back (0.6 m between their rear walls) with their doors on lanes 3.4–6.4 m wide, cross lanes cutting the blocks:
 * the priests' houses north of the terrace, the camp south of it (the first two rows are the market's shops).
 */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = []; LANES = [];
  const rand = rng(1255);
  const row = (quarter, z0, d, front, segs, target, pick) => {
    segs.forEach(([a, b], si) => split(a, b, target, rand).forEach(([x0, x1], k) => {
      const rect = [x0, z0, x1, z0 + d], seed = Math.floor(rand() * 1e6), kind = pick ? pick(si, k, x0, x1) : null;
      if (inRect(GRAN_YARD, (x0 + x1) / 2, z0 + d / 2, 0.8) || (rect[0] < GRAN_YARD[2] && rect[2] > GRAN_YARD[0] && rect[1] < GRAN_YARD[3] && rect[3] > GRAN_YARD[1])) return;
      if (Math.hypot(Math.max(Math.abs(x0), Math.abs(x1)), Math.max(Math.abs(z0), Math.abs(z0 + d))) > RADIUS - 40) return;
      const base = { rect, front, seed, quarter, kind: 'house', furnish: quarter === 'priests' || z0 < 100 || rand() < 0.45 };
      LOTS.push(kind ? { ...base, ...kind } : base);
    }));
  };
  // ── the priests' quarter: from the south lane northward: row (doors south), row (doors north), lane, row, row, lane
  const PS = [[-12, -0.6], [2.2, 11]];
  row('priests', -48.6, 7.2, 's', PS, 7.4);
  row('priests', -56.4, 7.2, 'n', PS, 7.4);
  row('priests', -68.6, 7.2, 's', PS, 7.4);
  row('priests', -76.4, 7.2, 'n', PS, 7.4);
  LANES.push({ r: [-16, -41.4, 11, -35], w: 6.4, kind: 'lane' }, { r: [-16, -61.4, 11, -56.4], w: 5, kind: 'lane' }, { r: [-16, -81.4, 11, -76.4], w: 5, kind: 'lane' }, { r: [-0.6, -81.4, 2.2, -41.4], w: 2.8, kind: 'cross' });
  // ── the camp: the market rows, then the pairs of rows
  const CS = [[-36, -17], [-14, -6.6], [-2.6, 10.4]];
  const shopN = (si, k, x0, x1) => ({ kind: 'shop', trade: TRADES_N[(si * 3 + k) % TRADES_N.length] });
  const shopS = (si, k, x0, x1) => { const t = TRADES_S[(si * 3 + k) % TRADES_S.length]; return t === 'bakery' ? { kind: 'bakery' } : { kind: 'shop', trade: t }; };
  row('camp', 31.8, 5.4, 's', CS, 6.0, shopN);
  row('camp', 42.4, 6.0, 'n', CS, 6.6, shopS);
  const T3 = ['sandals', 'jeweller', 'carpenter', 'scribe', 'weaver', 'potter', 'butcher'];
  row('camp', 49.0, 6.0, 's', CS, 6.0, (si, k) => ({ kind: 'shop', trade: T3[(si * 3 + k) % T3.length] }));
  LANES.push({ r: [-36, 37.2, 10.4, 42.4], w: 5.2, kind: 'market' }, { r: [-36, 55, 10.4, 58.4], w: 3.4, kind: 'lane' });
  for (let p = 0; p < 5; p++) {
    const z = 58.4 + p * 16;
    row('camp', z, 6.0, 'n', CS, 6.0, p === 0 ? (si, k) => ({ kind: 'shop', trade: TRADES_N[(si + k + 3) % TRADES_N.length] }) : null);
    row('camp', z + 6.6, 6.0, 's', CS, 6.0);
    LANES.push({ r: [-36, z + 12.6, 10.4, z + 16], w: 3.4, kind: 'lane' });
  }
  for (const [a, b] of [[-17, -14], [-6.6, -2.6]]) LANES.push({ r: [a, 31.5, b, 138.4], w: b - a, kind: 'cross' });
  return LOTS;
}
/** The lanes of the town: { r: rect, w, kind ('lane' | 'cross' | 'market') } (for the walkers and the lane's dressing). */
export function lanes() { lots(); return LANES; }
/** Round granaries of mud in the camp's east yard: [x, z, r, h]. */
export function granaries() {
  const rand = rng(1256), out = [], [x0, z0, x1, z1] = GRAN_YARD;
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
    if (rand() < 0.12) continue;
    out.push([x0 + 1.6 + i * 3.2 + (rand() - 0.5) * 0.4, z0 + 1.8 + j * 3.2 + (rand() - 0.5) * 0.4, 1.1 + rand() * 0.3, 2.2 + rand() * 0.6]);
  }
  void x1; void z1;
  return out;
}
