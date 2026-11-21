// The Hakka tulou — the visitor's walk (docs/settlements/hakka-tulou.md §9). Pure data and functions (no three.js): from the arrival on the
// stream's near bank (0, 72) north up the road to the drying ground and the great gate, and south over the bridge along the lower row.
// Every house of the hamlet whose front lies within REACH of the walk is an opened one: its door stands open on the hall (styles/tulou/houses.js),
// the hall is furnished, the altar bay is at the back, and the four shop-houses are open for trade with a keeper at the counter (their trade is
// `tradeOf`). walk-check follows one route into every opened house (plan.js adds them to the landmark's walks).
import { HOUSES, HOUSE } from './layout.js';

export const ARRIVAL = [0, 72];
/** The walk's lines [x, z], along the middle of the way. */
export const WALK = [
  [[0, 138], [0, 56]],              // the road from the lower row over the bridge, past the arrival, to the drying ground
  [[0, 56], [0, 36]],               // the drying ground up to the gate
  [[-14, 45], [14, 45]],            // across the drying ground between the two rows
];
export const REACH = 60;

function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz || 1, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2));
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
/** The frame of a house: W(x, z) the world point at local x across and z toward the street (the front wall's outside is z = d / 2). */
export function frameOfHouse(h) { const c = Math.cos(h.yaw), s = Math.sin(h.yaw); return (x, z) => [h.c[0] + x * c + z * s, h.c[1] - x * s + z * c]; }
/** The street point in front of a house's door (3 m out from the front wall). */
export const doorOf = (h, out = 2.6) => frameOfHouse(h)(0, h.d / 2 + out);
export function walkDistance(h) { const p = doorOf(h); let best = Infinity; for (const W of WALK) best = Math.min(best, segDist(p, W[0], W[1])); return best; }
/** The opened houses: [{ i, h }] in order of their distance from the arrival. */
export function openedHouses() {
  const out = [];
  HOUSES.forEach((h, i) => { if (walkDistance(h) <= REACH) out.push({ i, h }); });
  return out.sort((a, b) => Math.hypot(...doorOf(a.h).map((v, k) => v - ARRIVAL[k])) - Math.hypot(...doorOf(b.h).map((v, k) => v - ARRIVAL[k])));
}
/** The trades of the four shop-houses (seed % 4 === 1; styles/tulou/houses.js kind 1), [inferred: what a Hakka hill hamlet sold: tobacco, tea, rice wine, preserved greens]. */
export const TRADES = ['tobacco', 'tea', 'wine', 'pickles'];
export const isShop = (h) => h.seed % 4 === 1;
export const tradeOf = (h) => TRADES[Math.floor(h.seed / 4) % 4];
/** The routes walk-check follows: out in the road, to the door, over the sill, into the hall, round the tea table to the altar bay. */
export function walkRoutes() {
  const out = [];
  for (const { h } of openedHouses()) {
    const W = frameOfHouse(h), hz = h.d / 2;
    const head = [W(0, hz + 2.6), W(0, hz + 0.6), W(0, hz - 0.6), W(0, hz - 1.0), W(1.35, 2.0), W(1.35, 0.7)];
    const hall = [...head, W(0, -0.3)];
    hall.y0 = 0; out.push(hall);
    // on through the door in the partition into each back room (the kitchen and the other room, door middles at x ±2.34, partition at z 0.2)
    for (const sx of [-1, 1]) { const r = [W(0, hz + 2.6), W(0, hz + 0.6), W(0, hz - 0.6), W(0, hz - 1.0), W(sx * 1.35, 2.0), W(sx * 1.35, 0.7), W(sx * 2.34, 0.7), W(sx * 2.34, -0.3), W(sx * 2.34, -1.2), W(sx * 2.34, -1.45)]; r.y0 = 0; out.push(r); }
  }
  return out;
}
void HOUSE;
