// Karakorum, 1254 — the visitor's walk (docs/settlements/mongol-karakorum.md §14.1). Pure data and one distance function.
// The arrival stands in the palace compound's south gate (src/planet/arrivals.js: [70, -12], facing the hall); the visitor turns, goes out through the gate hall
// to the main street (z = 0, the stone-paved way between the west and east gates [stated: UW Silk Road]), and walks it, west to the cross-street and east to the Cathayan
// rows; the cross-street's bazaar is the second leg. Every bay of every row along it is open (shops.js: one trade each, the keeper inside, the goods before the counter).
export const ARRIVAL = [70, -12];
/** The walk's lines [x, z], along the middle of the way. */
export const WALK = [
  [[70, -12], [70, 0]],                  // out through the palace's south gate hall to the main street
  [[-128, 0], [128, 0]],                 // the main street, gate to gate
  [[0, -92], [0, 92]],                   // the cross-street (the bazaar of the Saracen quarter)
];
/** How far from the middle of a way the fronts that belong to the walk may stand (the main street's fronts stand 7.6 m off its axis; the cross-street's 5.2 m). */
export const WALK_REACH = 8;
export function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2));
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
/** The distance of a point from the walk. */
export function walkDistance(p) { let best = Infinity; for (const W of WALK) for (let i = 0; i + 1 < W.length; i++) best = Math.min(best, segDist(p, W[i], W[i + 1])); return best; }
