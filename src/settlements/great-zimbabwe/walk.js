// Great Zimbabwe about 1350 — the visitor's walk (docs/settlements/great-zimbabwe.md §19.1). Pure data and distance functions (no layout import:
// layout.js reads it to open the houses on it). The walk: from the arrival on the plateau grass north-south up the worn way to the Great
// Enclosure's north entrance, through the forecourt past the Conical Tower and the platform and down the lane inside the wall past the homesteads
// built in the enclosure; and out from the entrance along the worn ways to the courts of the Valley Ruins (the trade goods, the smith, the stone
// carver) and the foot of the Ancient Ascent.
export const ARRIVAL = [46, 60];
/** The walk's lines [x, z], along the middle of the way. */
export const WALK = [
  [[46, 60], [46, 84], [46, 114]],        // the worn way to the entrance, the forecourt, the tower's court
  [[46, 114], [46, 152]],                 // the lane inside the wall on the east side of the enclosure's homesteads
  [[46, 80], [-65, -40]],                 // the worn ways from the gate (layout.js PATHS) to the courts of the Valley Ruins and the Ascent
  [[46, 80], [-9, -20]],
  [[46, 80], [83, -50]],
  [[46, 80], [-101, 60]],
  [[46, 80], [-48, -98]],
];
export const WALK_REACH = 8;
export function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2));
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
/** The distance of a point from the walk. */
export function walkDistance(p) { let best = Infinity; for (const W of WALK) for (let i = 0; i + 1 < W.length; i++) best = Math.min(best, segDist(p, W[i], W[i + 1])); return best; }
/** Homesteads whose middle is within this of the walk have all their houses open (furnished); at most WALK_MAX of them, nearest the arrival first. */
export const HOMESTEAD_REACH = 30;
export const WALK_MAX = 14;
