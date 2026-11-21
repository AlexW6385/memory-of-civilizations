// The routes walk-check follows into the opened places of the visitor's walk (walk.js): the whole way from the arrival to the south gate, and in at the doorway of
// the pilgrims' shops of Queli Street and the square (each shop's gap beside its counter), to the account table behind. Pure functions of the layout.
import { shopRuns } from './layout.js';
import { WALK_REACH, walkDistance } from './walk.js';
import { lotFrame } from '../../styles/lu/kit.js';

const NOOP = new Proxy({}, { get: () => () => {} });
const frame = (rect, front) => lotFrame({ bag: NOOP, col: NOOP }, rect, front);

/** The shop's doorway along its row (the style's own rule, styles/lu/shops.js: the gap 1.5 m wide at 0.34 or 0.66 of the shop's width). */
export const shopGap = (i, sw) => i * sw + sw * (i % 2 ? 0.34 : 0.66);

/** The whole way, from the arrival to the south gate (one route; the arrival's floor is the ground). */
export function mainRoute() {
  const r = [[-26, -59], [-20, -78], [-8, -90], [-8, -100], [0, -105], [0, -112], [-8, -102], [-8, -62], [0, -58], [0, 10], [0, 60], [0, 100], [0, 150], [0, 200], [0, 255]];
  r.y0 = 0;
  return r;
}

/** [{ kind, id, route }] for the opened shops on the walk: one in each two, in at the doorway and to the counter's back. */
export function walkRoutes() {
  const out = [];
  let k = 0;
  for (const row of shopRuns()) {
    const F = frame(row.rect, row.front), sw = F.W / row.n;
    for (let i = 0; i < row.n; i++, k++) {
      if (k % 2 !== 0) continue;
      const g = shopGap(i, sw), c = F.pt(g, 0);
      if (walkDistance(c) > WALK_REACH || Math.abs(c[1] - 215) < 4.5) continue;      // (not the shops the archway's columns stand against)
      const street = row.front === 'e' ? [-3.4, c[1]] : row.front === 'w' ? [3.4, c[1]] : [c[0], c[1]];
      const r = [street, F.pt(g, -1.2), F.pt(g, 0.4), F.pt(g, 2.0), F.pt(g, 3.4)];
      r.y0 = 0; r.kind = 'shop'; r.id = `shop:${row.seed}:${i}`;
      out.push(r);
    }
  }
  return out;
}

let LINES = null;
/** Move a point (a figure, a prop) out of the lanes of the routes: it is pushed sideways to `m` metres from the nearest route line. Others are left as they are. */
export function keepOff(p, m = 1.2) {
  if (!LINES) { LINES = [mainRoute(), ...walkRoutes()]; }
  let q = p;
  for (let pass = 0; pass < 3; pass++) {
    let moved = false;
    for (const R of LINES) for (let i = 0; i + 1 < R.length; i++) {
      const a = R[i], b = R[i + 1], vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz || 1, t = Math.max(0, Math.min(1, ((q[0] - a[0]) * vx + (q[1] - a[1]) * vz) / l2));
      const cx = a[0] + vx * t, cz = a[1] + vz * t, dx = q[0] - cx, dz = q[1] - cz, d = Math.hypot(dx, dz);
      if (d < m) { const k = d > 1e-4 ? m / d : 0; q = d > 1e-4 ? [cx + dx * k, cz + dz * k] : [cx + (vz ? 1 : 0) * m, cz + (vz ? 0 : 1) * m]; moved = true; }
    }
    if (!moved) break;
  }
  return q;
}
