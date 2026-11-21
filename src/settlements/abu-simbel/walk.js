// The visitor's walk at Abu Simbel (docs/settlements/abu-simbel.md §18): from the arrival on the terrace in to the Great Temple's door, out by the north
// gate and up the processional way to the Small Temple, out by the south gate into the camp's market street and down its cross lane to the chapel, out
// along the terrace to the ramp and the quay; and the routes into the places the walk passes (shops, bakeries, houses), which tools/walk-check.mjs walks
// (`plan.walks`; the plan's frame is the world's). Pure data and functions (no three.js). The doors are those the styles cut (ramesside shops.js,
// dmhouse.js; oldkingdom mud_house and bakery), found here by replaying their dice.
import { FX, FXS, ZS, TERRACE, GATE, SGATE, WAY, QUAY, QUAY_Y, CHAPEL, lots } from './layout.js';
import { ground } from './ground.js';
import { rng } from '../../styles/ramesside/util.js';

export const ARRIVAL = [-4, 17];

/** The main walks, polylines in world x, z. */
export const WALKS = {
  // across the terrace to the colossi's door and in at it, down the first hall's aisle
  temple: [ARRIVAL, [-12, 3], [FX + 12, 3], [FX + 8, 0], [FX + 2, 0], [FX - 4, 0]],
  // out by the stone gate in the north wall and up the paved way to the Small Temple's terrace, to its door
  north: [[-14, -14], [GATE.x + 0.6, -24], [GATE.x + 1, -28], [GATE.x + 1, -34], [-17, -60], [-17, -88], [-18, -94], [-18, -100], [-12, -108], [FXS + 8, ZS], [FXS + 2, ZS]],
  // out by the south gate into the market street, west to its end, and down the cross lane to the camp's chapel
  market: [ARRIVAL, [-5.6, 22], [-5.6, 33], [-5.6, 40], [-15.5, 40.4], [-15.5, 44], [-15.5, 80], [-15.5, 128.7], [-20.5, 128.7], [-27, 128.7]],
  // the west end of the market street
  marketW: [[-15.5, 40.4], [-30, 40]],
  // the east half of the market street
  marketE: [[-5.6, 36], [-5.6, 41.2], [8, 41.2]],
  // east along the terrace, down the ramp to the quay and along it
  quay: [ARRIVAL, [0, 6], [TERRACE[2] - 2, 0], [24, 0], [QUAY[0] + 1, 0], [QUAY[0] + 6, 0]],
  // the priests' lanes: from the way east along the lane between the first two rows
  priests: [[-17, -37], [-8, -37], [1.5, -37]],
};
/** Distance (m) of a point from the nearest of the walks. */
export function walkDist(x, z) {
  let best = Infinity;
  for (const W of Object.values(WALKS)) for (let i = 0; i + 1 < W.length; i++) {
    const a = W[i], b = W[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz || 1)));
    best = Math.min(best, Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t));
  }
  return best;
}

/** The x of a lot's door (in its own frame, the front to the south) by the style's dice. */
export function doorX(l) {
  const [x0, , x1] = l.rect, W = x1 - x0;
  if (l.kind === 'bakery') return (x0 + x1) / 2;
  if (l.kind === 'shop') { const left = rng(l.seed || 5)() < 0.5; return left ? x0 + 1.075 : x1 - 1.075; }
  if (l.dm) { const r = rng((l.seed || 1) * 5 + 3), left = r() < 0.5; return left ? x0 + 1.3 + r() * 0.5 : x1 - 1.3 - r() * 0.5; }
  const r = rng(l.seed || 1); r(); const court = r() < 0.7, split = court ? x0 + W * (0.45 + r() * 0.2) : x1;
  return court ? (split + x1) / 2 : (x0 + split) / 2;
}
/** The ways into the town's places: [{ kind, rect, route: [[x, z]] }], those on the walk first. */
export function placeRoutes() {
  const out = [];
  for (const l of lots()) {
    const [x0, z0, x1, z1] = l.rect, xd = doorX(l), n = l.front === 'n', zf = n ? z0 : z1, s = n ? -1 : 1, depth = l.kind === 'bakery' ? 0.9 : l.kind === 'shop' ? 0.25 : 1.2;
    const kind = l.kind === 'house' ? (l.dm ? 'dm_house' : 'house') : l.kind;
    out.push({ kind, trade: l.trade, rect: l.rect, route: [[xd, zf + s * 2.0], [xd, zf + s * 0.9], [xd, zf - s * depth], [xd, zf - s * (depth + (l.kind === 'shop' ? 0.35 : 0.7))]], d: walkDist(xd, zf) });
  }
  return out.sort((a, b) => a.d - b.d);
}

/** The floor a route starts on: the ground, the terrace's level, or the quay's top. */
const startY = ([x, z]) => (x > QUAY[0] && x < QUAY[2] ? QUAY_Y + 0.02 : Math.max(ground.height(x, z), x < 12 && x > FX ? 0.04 : -99));

/** The routes walk-check follows: the main walks, and from the lane into `n` places of each kind. */
export function walkRoutes(n = { shop: 9, bakery: 2, dm_house: 6, house: 3 }) {
  const out = [], count = {};
  for (const W of Object.values(WALKS)) { const r = W.map((p) => [...p]); r.y0 = startY(r[0]); out.push(r); }
  for (const p of placeRoutes()) {
    if ((count[p.kind] = (count[p.kind] || 0) + 1) > (n[p.kind] ?? 0)) continue;
    const r = p.route.map((q) => [...q]); r.y0 = startY(r[0]); out.push(r);
  }
  return out;
}
void CHAPEL; void WAY;
