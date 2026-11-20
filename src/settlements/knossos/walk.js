// Knossos about 1600 BC — the visitor's walk (docs/settlements/knossos.md §20.1). Pure data and one distance function (no layout import:
// layout.js reads it to open the lots on it). The walk: from the arrival in the Central Court south through the palace's south passage,
// out to the first lane under the palace's south front (the lane the palace's own people used, the Royal Road's sister), east and west
// along it, and along the second lane a block south, with the gap between the house columns at x 12 joining the two.
export const ARRIVAL = [0, 22];
/** The walk's lines [x, z], along the middle of the way. */
export const WALK = [
  [[0, 22], [0, 66]],                    // the Central Court's south passage (the Procession Fresco's corridor)
  [[-64, 67], [87, 67]],                 // the first lane, under the palace's south front
  [[11.2, 67], [11.2, 93]],              // the gap between two columns of houses, joining the lanes
  [[-64, 93], [86, 93]],                 // the second lane
];
export const WALK_REACH = 8;
export function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2));
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
/** The distance of a point from the walk. */
export function walkDistance(p) { let best = Infinity; for (const W of WALK) for (let i = 0; i + 1 < W.length; i++) best = Math.min(best, segDist(p, W[i], W[i + 1])); return best; }
/** The middle of a lot's front on its lane. */
export function frontPoint(l) { const [x0, z0, x1, z1] = l.rect; return l.front === 'n' ? [(x0 + x1) / 2, z0] : l.front === 's' ? [(x0 + x1) / 2, z1] : l.front === 'e' ? [x1, (z0 + z1) / 2] : [x0, (z0 + z1) / 2]; }
/** What the walk's lots are, in order from the arrival. The lots whose tiles are near the arrival (z < 100: the first lane's row and the second lane's south row) keep to the kinds the town's
 *  first houses have (the ground floors of §4e: shops, weavers, stores, homes: the trade of each shop shows at its door); the second lane's north row (z >= 100, a tile of its own, drawn only
 *  when the visitor is south of the palace) takes the workshops of §4h. */
export const WALK_KINDS = ['shop', 'store', 'weaver', 'shop', 'home', 'shop', 'weaver', 'home', 'store', 'shop', 'home', 'weaver'];
export const WALK_TRADES = ['potter', 'press', 'dyer', 'sealcutter', 'smith', 'shop', 'potter', 'press', 'dyer', 'weaver'];
export const WORKSHOP_Z = 100;
export const WALK_MAX = 14;
