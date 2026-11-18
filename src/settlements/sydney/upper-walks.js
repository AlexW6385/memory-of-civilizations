// The walk-check routes to the upper rooms of the houses that can be climbed (docs/settlements/sydney.md §1l): from the footpath
// through the door, across the shop (or up the hall of a terrace), up the stair and along the first floor to a room.
import { lots } from './layout.js';
import { frame } from '../../styles/modern/rooms.js';
import { shopGeom, RES } from '../../styles/modern/upper.js';
import { KINDS } from '../../styles/modern/shops.js';

const DOOR = { pub: 0.5, newsagent: 0.3, milkbar: 0.3, butcher: 0.7, chemist: 0.5, barber: 0.3, greengrocer: 0.5 };
/** The way across each shop's floor from its door to the stair hall's doorway (the lanes the furnishing leaves; per trade where it differs). */
const LANE = { espresso: { off: 0.1, uL: 1.5 }, butcher: { uL: 'R' }, chemist: { dm: 2.5 }, pub: { dm: 2.5 } };

/** The routes (plan `walks` form: [[x, z], …] with `y0` the footpath's height at the start). */
export function upperWalks() {
  const out = [];
  for (const l of lots()) {
    if (!l.up) continue;
    const fr = frame(l.rect, l.front), W = (u, d) => { const p = fr.W(u, d, 0); return [p[0], p[2]]; };
    let pts;
    if (l.t === 'rocks_terrace') {
      const n = Math.max(1, Math.round(fr.L / 4.6)), i1 = fr.L / n - 0.25, PR = 0.3, pu = 1.3, dLo = PR + 3.4, dA = PR + 4.5, dHi = dLo + (3.5 + 0.5 - 0.04 - 0.5 + 0.04) / 0.9;
      void i1;
      pts = [[0.85, -2.4], [0.85, 0.8], [0.8, PR + 2.0], [0.8, PR + 3.2], [0.8, dLo + 2.0], [0.8, dHi - 0.3], [0.8, dHi + 0.6], [pu + 0.8, dHi + 0.7], [pu + 0.85, dA + 0.8], [pu + 0.85, dA - 0.9], [pu + 1.2, PR + 2.0]];
    } else {
      const kind = l.t === 'espresso_bar' ? 'espresso' : l.kind, H1 = kind === 'espresso' ? 3.7 : KINDS[kind].H1, T = 0.3, F = l.y + 0.12;
      const G = shopGeom(fr.L, fr.Dp, F, H1, T), k = DOOR[kind], du = kind === 'espresso' ? fr.L * 0.62 : fr.L * k + (k > 0.4 ? 0 : 0.3);
      const o = { off: 0, uL: T + 0.6, dm: 1.2, dl: 0.7, ...LANE[kind] }, uL = o.uL === 'R' ? fr.L - 0.8 : o.uL, dFront = G.cross - 1.05;
      pts = [[du + o.off, -2.4], [du + o.off, 1.2], [uL, o.dm], [uL, G.dp - o.dl], [T + 0.6, G.dp - o.dl], [T + 0.6, G.dp - 0.7], [T + 0.6, G.dp + 0.6], [G.us0 + 0.3, G.dStairA - 0.5], [G.us0 + 0.3, G.dStairA + 0.5], [G.us1 - 0.3, G.dStairA + 0.5],
        [G.us1 + 0.8, G.dStairA + 0.5], [G.us1 + 0.8, G.hd0 - 0.5], [G.uC, G.hd0 - 0.5], [G.uC, dFront], [G.uC - 1.6, dFront], [(G.left[0] + G.left[1]) / 2, dFront]];
    }
    out.push(Object.assign(pts.map(([u, d]) => W(u, d)), { y0: l.gy ?? l.y }));
  }
  void RES;
  return out;
}
