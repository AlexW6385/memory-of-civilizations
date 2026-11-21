// Tang Chang'an, c. 750 — the visitor's walk (docs/settlements/tang-changan.md §21). Pure data and helpers, no town import beyond the layout.
// The way: from the arrival in Daci'en's pagoda court down the temple's axis to the ward gate in its south wall, out to the street, west to
// Zhuque Avenue, up the avenue's east edge to cross street A, west along it to the West Market's north gate (x -164.5), south down the market's
// lane to the cross lane and west along it to the Hu wine shop; and, off street A, into the official ward north of it by its south gate.
import { rng } from '../../styles/tang/kit.js';
import { DACI_AX, MARKET_LANES, marketRows, lots, WARDS, WARD, STREET, onMarketLane } from './layout.js';

export const ARRIVAL = [102, 112];
const LX = MARKET_LANES.x[0], LZ = MARKET_LANES.z[0];
/** The walk's lines [x, z]. */
export const WALK = [
  [[DACI_AX, 128], [DACI_AX, 192]],                                 // down Daci'en's axis to the gate
  [[DACI_AX, 210], [28, 210], [28, 10]],                            // the street, the avenue's east edge up to street A
  [[28, 10], [LX, 10], [LX, LZ], [-196, LZ]],                       // street A west, the market's north gate, the lane south, the cross lane west
  [[-137, 10], [-137, -26], [-137, -110]],                          // the official ward's south gate and its lane
];
export const WALK_REACH = 12;
function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2)) : 0;
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
export function walkDistance(p) { let b = Infinity; for (const W of WALK) for (let i = 0; i + 1 < W.length; i++) b = Math.min(b, segDist(p, W[i], W[i + 1])); return b; }

const YAWS = { s: 0, n: Math.PI, e: Math.PI / 2, w: -Math.PI / 2 };
/** Local (x along the front, z outward) to world for a frame at c facing `front`, as inFrame does. */
export function framePt(c, front) {
  const yaw = YAWS[front], cs = Math.round(Math.cos(yaw)), sn = Math.round(Math.sin(yaw));
  return ([x, z]) => [c[0] + x * cs + z * sn, c[1] - x * sn + z * cs];
}
const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
const ext = (rect, f) => { const w = rect[2] - rect[0], d = rect[3] - rect[1]; return f === 'n' || f === 's' ? [w, d] : [d, w]; };

/**
 * The shop units of the market that have a door bay (three bays or more): { row, i, door: [x, z] world (the door bay's middle, on the platform edge),
 * keeper: [x, z], rot (facing out), P }. A unit's bays as tang_shop_row lays them.
 */
export function shopUnits() {
  const out = [];
  marketRows().forEach((r, ri) => {
    const [W, D] = ext(r.foot, r.front), hw = W - 1.6, hd = D - 1.6, nbT = r.units.reduce((s, u) => s + u.nb, 0), bay = hw / nbT, P = framePt(mid(r.foot), r.front);
    let k = 0;
    r.units.forEach((u, i) => {
      const x0 = -hw / 2 + k * bay;
      if (u.nb >= 3) {
        const xd = x0 + (Math.floor(u.nb / 2) + 0.5) * bay, xk = x0 + 0.5 * bay;
        out.push({ ri, i, trade: u.trade, row: r, xd, hd, hw, bay, P, door: P([xd, hd / 2]), keeper: P([xk, hd / 2 - 1.15]), rot: Math.atan2(...(({ s: [0, 1], n: [0, -1], e: [1, 0], w: [-1, 0] })[r.front])) });
      }
      k += u.nb;
    });
  });
  return out;
}
/** The route into a shop: from the lane, over the platform, through the door bay to the room's middle. */
export function shopRoute(s) {
  const r = [s.P([s.xd, s.hd / 2 + 3.2]), s.P([s.xd, s.hd / 2 + 0.2]), s.P([s.xd, 0]), s.P([s.xd, -s.hd / 2 + 1.7])];
  r.y0 = 0; r.kind = 'market-shop'; r.id = `shop:${s.row.seed}:${s.i}`;
  return r;
}
/** The walked units (door within reach of the walk). */
export const walkedShops = () => shopUnits().filter((s) => walkDistance(s.door) <= WALK_REACH && onMarketLane(...s.P([s.xd, s.hd / 2 + 3.2])));

/** A courtyard house's route: gate, court, up the hall's steps to its door, in. */
export function houseRoute(l) {
  const [W, D] = ext(l.rect, l.front), rand = rng(l.seed || 1), gx = (rand() < 0.5 ? -1 : 1) * W * 0.2, P = framePt(mid(l.rect), l.front);
  const hd = l.kind === 'mansion' ? 7.4 : 5.8, hz = -D / 2 + hd / 2 + 2.0, f = hz + hd / 2;
  const r = [P([gx, D / 2 + 2.5]), P([gx, D / 2 - 1]), P([gx, f + 3.5]), P([0, f + 3.0]), P([0, f + 0.2]), P([0, hz + 0.3])];
  r.y0 = 0; r.kind = 'house'; r.id = 'lot:' + l.seed;
  return r;
}
/** The houses whose front gate lies within reach of the walk's ward lane. */
export function walkedHouses() {
  return lots().filter((l) => l.kind !== 'hut' && l.det >= 1 && walkDistance(framePt(mid(l.rect), l.front)([0, ext(l.rect, l.front)[1] / 2 + 1])) <= 22).slice(0, 12);
}
void WARDS; void WARD; void STREET;
