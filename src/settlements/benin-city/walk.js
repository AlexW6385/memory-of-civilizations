// Benin City about 1600 — the visitor's walk (docs/settlements/benin-city.md §15). Pure data and one distance function (layout.js reads it to give the
// compounds on it their trading fronts). The walk: from the arrival on the king's square, before the palace gate, south across the square to the great
// street, along it east to the cross street (the way to the Oba market) and west to the square's end, up the cross street and east into the market's
// aisle, and from the west lane (x 22) across the open strip to the guild lane and north along it between the yards.
export const ARRIVAL = [-65, 24];
/** The walk's lines [a, b, reach]: the compounds whose front door lies within `reach` metres of the line belong to the walk. */
export const WALK = [
  [[-65, 24], [-65, 57], 0],        // the arrival across the king's square to the great street
  [[-150, 57], [100, 57], 25],      // the great street (34 m: its two rows of compounds front it from 22 m away)
  [[98, 57], [98, 14.5], 0],        // the cross street's south end, to the market
  [[98, 14.5], [212, 14.5], 0],     // the aisle between the market's stalls and its open floor
  [[22, 57], [22, 9], 0],           // the west lane up to the open strip before the guild
  [[22, 9], [52, 9], 0],            // the strip
  [[52, 9], [52, -120], 0],         // the guild lane between the yards
];
export const WALK_MAX = 30;
function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2));
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
/** The distance of a point from the walk, less each line's reach (<= 0: on the walk). */
export function walkExcess(p) { let best = Infinity; for (const [a, b, r] of WALK) best = Math.min(best, segDist(p, a, b) - r); return best; }
/** The middle of a lot's front on its street. */
export function frontPoint(l) { const [x0, z0, x1, z1] = l.rect; return l.front === 'n' ? [(x0 + x1) / 2, z0] : [(x0 + x1) / 2, z1]; }
/** Is the lot on the walk? */
export const onWalk = (l) => walkExcess(frontPoint(l)) <= 0;
/** The goods on the counters of the walk's trading fronts, in order along the street [stated: pepper and ivory sold to the Portuguese (the ivory the Oba's); manillas of brass; inferred: the rest]. */
export const WALK_GOODS = ['pots', 'oil', 'cloth', 'pepper', 'kola', 'yam', 'brass', 'cloth'];
