// Mycenae about 1250 BC — the visitor's walk (docs/settlements/mycenae.md §16.1). Pure data and one distance function (no layout import: layout.js reads it to open the
// lots on it). The walk: from the arrival on the approach road east past the halt to the Lion Gate, in through the passage, up the stepped ramp past the guard-room and the
// granary and Grave Circle A, along the workshops and the shrines of the citadel's road to the propylon and the Great Court, across it to the megaron; and the spur south
// to the shrines (the cult centre) off the ramp.
export const ARRIVAL = [-136, 0];
/** The walk's lines [x, z], along the middle of the way. */
export const WALK = [
  [[-186, -2], [-160, -2], [-130, -2], [-107, 0], [-89, 0]],                      // the approach road to the gate
  [[-86, 0], [-70, -4], [-52, -7], [-30, -8], [-10, -4], [8, 0], [24, 3]],        // the stepped ramp up to the propylon
  [[24, 3], [45, 3], [75, 3]],                                                    // the Great Court and the megaron
  [[-28, -7], [-28, 9]],                                                          // the spur to the shrines
  [[-150, 0], [-146, 12], [-144, 20]],                                            // the lane south at the halt (the first lots of the lower town)
];
/** How far from the walk a lot's front may lie to be opened (m). */
export const WALK_REACH = 14;
export function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2));
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
/** The distance of a point from the walk. */
export function walkDistance(p) { let best = Infinity; for (const W of WALK) for (let i = 0; i + 1 < W.length; i++) best = Math.min(best, segDist(p, W[i], W[i + 1])); return best; }
/** The middle of a lot's front on its lane. */
export function frontPoint(l) { const [x0, z0, x1, z1] = l.rect; return l.face === 'n' ? [(x0 + x1) / 2, z0] : l.face === 's' ? [(x0 + x1) / 2, z1] : l.face === 'e' ? [x1, (z0 + z1) / 2] : [x0, (z0 + z1) / 2]; }
/** The trades of the shops that line the road at the halt, in order from the arrival (the shop at the arrival's right hand first). */
export const ROAD_SHOPS = { potter: [-140, 6], smith: [-150, -10], store: [-136, -10] };
