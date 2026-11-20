// Machu Picchu — the visitor's walk (docs/settlements/machu-picchu.md §13). Pure data and one distance function (layout.js reads nothing from here;
// town.js and walkroutes.js read it to open the places on it). From the Guardhouse's knoll down its stair, along the way in (the fields, the dry ditch,
// the main gate, the flagged road) to the Main Plaza, then west to the Sacred Plaza and east to the kallanka.
export const ARRIVAL = [-21, 129.8];
/** The walk's lines [x, z], along the middle of the way. */
export const WALK = [
  [[-21, 129.8], [-24, 127], [-24, 104], [2, 104]],      // down the knoll's stair, across the fields to the road
  [[2, 124], [2, 14]],                                   // the way in: the fields, the ditch's stairs, the main gate, the flagged road
  [[2, 14], [2, -26], [22, -24]],                        // the Main Plaza, across to the kallanka's middle door
  [[2, -24], [-14, -24], [-40, -36]],                    // west to the Sacred Plaza's temples
  [[-12, 12], [-21, 15.5]],                              // the Torreon's stair
];
/** How far from the walk a place's gate may lie to be opened. */
export const WALK_REACH = 25;
export function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2));
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
/** The distance of a point from the walk. */
export function walkDistance(p) { let best = Infinity; for (const W of WALK) for (let i = 0; i + 1 < W.length; i++) best = Math.min(best, segDist(p, W[i], W[i + 1])); return best; }
/** The measures of a door opened for the visitor: 1.7 m wide, 2.2 m to the lintel's underside (the walker is 1.6 m clear and a head's height under it). */
export const OPEN_DOOR = { w: 1.7, h: 2.2 };
/** Open houses stand at least this high, so the lintel stone fits over the taller door. */
export const OPEN_WALL_H = 2.8;
