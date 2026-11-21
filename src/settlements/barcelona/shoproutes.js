// The visitor's walk into the Eixample's shops (docs/settlements/barcelona.md §14.1): routes from the pavement through a shop's door to its back
// room, for tools/walk-check.mjs (plan.walks), one shop of each trade nearest the arrival's streets, the Passeig's and the market's. Pure data of the
// blocks' own plot plan (styles/modernisme blockShops), no builders.
import { blockShops } from '../../styles/modernisme/index.js';
import { ARRIVAL, SAGRADA, MERCAT, PITCH, BLOCK, height } from './layout.js';

/** The shops, with their doors, outward normals and street levels: [{ trade, door: [x, z], n: [x, z], y, d (from the arrival) }], nearest first. */
export function shopDoors(els, from = ARRIVAL) {
  const out = [];
  for (const el of els) for (const sh of blockShops(el)) out.push({ trade: sh.trade, door: sh.door, n: sh.n, y: sh.y, d: Math.hypot(sh.door[0] - from[0], sh.door[1] - from[1]), seed: sh.seed });
  return out.sort((a, b) => a.d - b.d);
}
/** The route into a shop: the pavement before the door, the door, the room (1.6, 3.2 and 5 m in). */
export function shopRoute(s) {
  const P = (t) => [s.door[0] + s.n[0] * t, s.door[1] + s.n[1] * t];
  return Object.assign([P(3.0), P(1.2), P(0.1), P(-1.6), P(-3.2), P(-5.0)], { y0: s.y });
}
/** One shop of each of the eight trades nearest the first 60 m round the arrival, then the next nearest of those trades, `n` routes in all. */
export function shopRoutes(els, n = 12, per = 2, skip = 0) {
  const all = shopDoors(els), seen = {}, out = [];
  for (const s of all) { if (out.length >= n) break; const k = seen[s.trade] = (seen[s.trade] ?? 0) + 1; if (k > per + skip || k <= skip) continue; out.push(s); }
  return out.map(shopRoute);
}

// ── the rest of the visitor's walk (docs/settlements/barcelona.md §14.1): arrival → the works' gate → the façade's foot; arrival → the Schools; the market ──
const Y = (x, z) => height(x, z);
/** From the arrival's kerb across the Marina's roadway, up its west side (clear of the kiosk and its readers: the street's own people stand at 224–225) to the
 *  works' gate, in at it and along the lane between the stone yards to the façade's foot (the porches stand from x 211). */
export function visitorWalk() {
  const EDGE = SAGRADA[0] + BLOCK / 2, XM = PITCH * 2.5, gz = SAGRADA[1];
  const W = [[XM + 9.6, -52], [XM - 3.4, -56], [XM - 3.4, -80], [EDGE + 5.6, gz + 0.6], [EDGE + 1.0, gz], [EDGE - 4, gz], [SAGRADA[0] + 25, gz]];
  return Object.assign(W, { y0: Y(W[0][0], W[0][1]) });
}
/** From the arrival west along the cross street under the works' hoarding, round the block's south-west corner into the works, and through the Schools by its
 *  three classrooms (the west door to the east door). */
export function schoolsWalk() {
  const SCH = [SAGRADA[0] - 12, SAGRADA[1] + 25], W = [[XM0 + 9.6, -52], [XM0 - 3.4, -50], [190, -50], [160, -50], [146, -54], [146, SCH[1] - 1], [152, SCH[1]], [SCH[0] - 14, SCH[1]], [SCH[0] - 8.5, SCH[1]], [SCH[0] - 3.3, SCH[1]], [SCH[0] + 3.3, SCH[1]], [SCH[0] + 8.5, SCH[1]], [SCH[0] + 14, SCH[1]]];
  return Object.assign(W, { y0: Y(W[0][0], W[0][1]) });
}
const XM0 = PITCH * 2.5;
/** Into the Mercat de la Concepció by its east gable's open nave, down the middle nave to the west gable. */
export function mercatWalk() {
  const [cx, cz] = MERCAT, y = Math.max(Y(cx, cz - 27), Y(cx, cz + 27)) + 0.05;
  return Object.assign([[cx + 36, cz], [cx + 30, cz], [cx + 20, cz], [cx + 8, cz], [cx - 8, cz], [cx - 20, cz], [cx - 29, cz]], { y0: y });
}
