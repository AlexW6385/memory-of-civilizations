// Lalibela c. 1220 — the visitor's walk (docs/settlements/lalibela.md §18). Pure data and one distance function.
// The arrival is the knoll south-west of Bete Giyorgis (WATCH). The pilgrim's way: down from the knoll to the head of the
// trench (the road from the west), down the cut steps and through the tunnel into Giyorgis' court; then back up and along the
// footpath north to the Jordan's road, east along it to the Jordan, and north by the pilgrims' track to the head of the
// trench that leads down to Bete Medhane Alem. The houses and stalls of the walk are those within WALK_REACH of these lines.
export const ARRIVAL = [-236, 176];
/** The walk's lines [x, z], along the middle of the way. */
export const WALK = [
  [[-236, 176], [-247, 150], [-258, 131]],             // from the knoll down to the trench's head (the road from the west)
  [[-262, 128], [-216, 128]],                           // the trench, its steps and the tunnel into the court
  [[-250, 128], [-250, 40], [-250, -14]],               // the footpath north (LINKS)
  [[-250, -14], [-150, -14]],                           // the Jordan's road from the west
  [[10, -252], [10, -146]],                             // the way to Medhane Alem's head
];
export const WALK_REACH = 60;
export function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2));
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
/** The distance of a point from the walk. */
export function walkDistance(p) { let best = Infinity; for (const W of WALK) for (let i = 0; i + 1 < W.length; i++) best = Math.min(best, segDist(p, W[i], W[i + 1])); return best; }
