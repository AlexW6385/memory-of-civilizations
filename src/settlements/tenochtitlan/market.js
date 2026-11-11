// The tianguis on the west canal (docs/settlements/tenochtitlan.md §14): the plan of its stalls, by trade.
// Pure data, read by plan.js (the stalls' goods are built by src/styles/aztec/market.js), by smoke.js
// (the comals) and by movers.js (the aisles the buyers walk). "Every kind of merchandise was kept
// separate and had its fixed place marked for it" (Díaz): each row of stalls here sells one kind of
// thing, west half (toward the canal, where the canoes land) and east half (toward the street).
import { MARKET } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

const [X0, Z0, X1, Z1] = MARKET;
/** Rows of stalls back to back in pairs (two stalls 1.6 m deep with 0.4 m between), an aisle 3.4 m wide beyond each pair; the porticoes run 2.8 m along the north, south and east edges. */
export const GEOM = { portico: 2.8, row0: Z0 + 6.2, pitch: 7, rows: 8, depth: 1.6, aisleW: 3.4, xCross: X0 + 21, xWest: X0 + 2, xEast: X0 + 40 };
/** The trade of each row, west half then east half. */
export const ROWS = [
  ['fish', 'fowl'], ['firewood', 'herbs'], ['salt', 'cacao'], ['maize', 'beans'],
  ['pots', 'baskets'], ['chile', 'fruit'], ['cloth', 'feathers'], ['obsidian', 'cooked'],
];
/** Richer trades that take some of a block's stalls (Díaz: gold, stones and feathers together; honey and pulque with the cooked food). */
const MIXED = { feathers: ['jewels', 0.25], cloth: ['rope', 0.2], cooked: ['pulque', 0.3], cacao: ['honey', 0.25] };

let STALLS = null;
/**
 * The stalls: { x (the mat's west edge), cx, cz (its centre), sgn (+1: the seller sits north, the aisle is south;
 * −1: the other way — the stall's local x, z turned about its centre), trade, awning, seller ('f'|'m'), seed, row, half }.
 * A stall is 2.2 m across (x) and 1.6 m deep.
 */
export function stalls() {
  if (STALLS) return STALLS;
  STALLS = [];
  const rand = rng(1519 + 7), G = GEOM;
  for (let r = 0; r < G.rows; r++) for (const side of [0, 1]) {
    const zr = G.row0 + r * G.pitch + side * 2.0;
    for (const half of [0, 1]) {
      const x0 = half ? G.xCross + 1.6 : X0 + 3.6, n = half ? 6 : 6;
      for (let i = 0; i < n; i++) {
        if (rand() < 0.07) continue;
        let trade = ROWS[r][half];
        const mx = MIXED[trade]; if (mx && rand() < mx[1]) trade = mx[0];
        const x = x0 + i * 2.6;
        STALLS.push({ x, cx: x + 1.1, cz: zr + G.depth / 2, sgn: side ? 1 : -1, trade, awning: rand() < (trade === 'cooked' || trade === 'feathers' || trade === 'cloth' ? 0.8 : 0.4), seller: rand() < 0.62 ? 'f' : 'm', seed: Math.floor(rand() * 1e6), row: r, half });
      }
    }
  }
  return STALLS;
}
/** Where a stall's local (u across, v toward the aisle) is in the settlement. */
export const stallAt = (s, u, v) => [s.cx - s.sgn * u, s.cz + s.sgn * v];
/** The comals (a hearth of three stones, a griddle, a fire): world positions with the stall's hearth at local (−0.55, −0.1). */
export const comals = () => stalls().filter((s) => s.trade === 'cooked').map((s) => stallAt(s, -0.55, -0.1));
/** The aisles as walkway rectangles [x0, z0, x1, z1] (market.js's own: the quay, the cross aisles, the rows' aisles). */
export function aisles() {
  const G = GEOM, out = [];
  for (let r = 0; r <= G.rows; r++) { const z = G.row0 + r * G.pitch - 1.7; out.push([X0 + 1, z - G.aisleW / 2, X1 - 1, z + G.aisleW / 2]); }
  for (const x of [G.xWest, G.xCross, G.xEast]) out.push([x - 1.2, Z0, x + 1.2, Z1]);
  out.push([X0 - 3.6, Z0, X0 - 0.4, Z1]);                                     // the quay along the canal
  return out;
}
/** The pavilion where the market's judges sat (Díaz: "three judges"; Cortés: ten or twelve), on the south side. */
export const JUDGES = [X0 + 8, Z1 - 7.4, X0 + 17, Z1 - 3.4];
/** The landing stairs to the canal (z of their centres) and the canoes at them. */
export const LANDINGS = [37, 65];
