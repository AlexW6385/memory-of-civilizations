// The visitor's walk in Florence (docs/settlements/florence.md §16): from the arrival at the north-west corner of the cathedral's
// square past the Baptistery and the cathedral's front to the Via Calzaiuoli, south past Orsanmichele and the Mercato Vecchio to the
// Piazza della Signoria and down to the Ponte Vecchio; and the branches to the Palazzo Medici, to Santa Maria Novella, into the
// Mercato and along the Lungarno to the dyers. Pure data and distances; +x east, +z south.
import { lots } from './layout.js';

export const ROUTES = {
  main: [[-152, -108], [-120, -112], [-92, -108], [-92, -8], [-6, -4], [-6, 105], [30, 128], [40, 200], [40, 245], [40, 262]],
  medici: [[-92, -112], [-6, -117], [40, -117], [40, -176]],
  novella: [[-152, -108], [-200, -117], [-250, -128]],
  mercato: [[-6, 40], [-50, 40]],
  tintori: [[40, 212], [100, 212], [200, 212]],
};

const segD = (px, pz, a, b) => {
  const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (pz - a[1]) * dz) / (dx * dx + dz * dz)));
  return Math.hypot(px - a[0] - t * dx, pz - a[1] - t * dz);
};
/** Distance (m) from a point to the nearest route. */
export function walkDist(x, z) {
  let best = Infinity;
  for (const line of Object.values(ROUTES)) for (let i = 0; i + 1 < line.length; i++) best = Math.min(best, segD(x, z, line[i], line[i + 1]));
  return best;
}
/** Distance (m) from a rectangle (its corners, edge middles and centre) to the nearest route. */
export function rectWalkDist(r) {
  const mx = (r[0] + r[2]) / 2, mz = (r[1] + r[3]) / 2;
  let best = Infinity;
  for (const [x, z] of [[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]], [mx, mz], [mx, r[1]], [mx, r[3]], [r[0], mz], [r[2], mz]]) best = Math.min(best, walkDist(x, z));
  return best;
}
/** How far from the walk the houses keep their full near form (m): beyond it they are drawn in the far-lite form (house.js, `lite: 2`). */
export const FULL_WITHIN = 50;
export const onWalk = (l) => rectWalkDist(l.rect) <= FULL_WITHIN;
/** The lots along the walk, nearest the arrival first. */
export function walkLots(d = 30) { return lots().filter((l) => rectWalkDist(l.rect) <= d); }
