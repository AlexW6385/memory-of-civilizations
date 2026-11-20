// Which side of its door a shop's counter stands on (the byzantine style's shopfit chooses it from the shop's seed): found by furnishing the shop into a bag
// that keeps only the colliders, so the walk's routes go in by the other side. Read by index.js.
import { STYLES } from '../../core/build.js';
import '../../styles/roman/town.js';
import '../../styles/byzantine/interiors.js';
import { shopFrame } from './shops.js';

/** +1 or -1: the side (the sign of local a) of the counter in shop r (a shopRooms() entry). */
export function counterSide(r) {
  const fit = STYLES.roman.elements.byz_shopfit ?? STYLES.byzantine.elements.byz_shopfit;
  const rects = [];
  fit({ st: r.st, k: r.k, ns: r.ns, trade: r.trade, seed: r.seed }, { bag: { add() {} }, col: { rect: (q, y0, y1) => rects.push([q, y1 - y0]) }, lights: [] });
  const c = rects.find(([, h]) => Math.abs(h - 1.0) < 1e-6);
  if (!c) return 1;
  const F = shopFrame(r.st, r.k, r.ns), q = c[0], mx = (q[0] + q[2]) / 2, mz = (q[1] + q[3]) / 2, d = F.W(0, 0.7);
  return Math.sign(((mx - d[0]) * F.u[0] + (mz - d[1]) * F.u[1]) * F.side) || 1;
}
