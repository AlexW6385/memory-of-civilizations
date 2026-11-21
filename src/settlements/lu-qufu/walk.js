// Qufu, c. 1730 — the visitor's walk (docs/settlements/lu-qufu.md §14). Pure data and small functions of the layout (no three.js).
// The way: from the arrival in the court before the Dacheng Hall (src/planet/arrivals.js) across the Apricot court to the hall's moon terrace, back down the
// axis between the stele pavilions, through the Kuiwen Pavilion and the courts of the first gates, over the Bishui bridge and out by the Shengshi and the Lingxing
// Gate into the forecourt, then south along Queli Street between the pilgrims' shops, under the Jinsheng Yuzhen archway to the Wanren Gongqiang gate in the
// Ming wall. The routes of walkroutes.js follow it into the opened places.
export const ARRIVAL = [-26, -59];
/** The walk's lines [x, z], along the middle of the way. */
export const WALK = [
  [[-26, -59], [-20, -78], [-8, -90], [-8, -100], [0, -105], [0, -112]],             // the Apricot court, to the foot of the moon terrace's stair
  [[0, -112], [-8, -102], [-8, -62], [0, -58], [0, 10], [0, 60], [0, 100], [0, 150]],         // down the axis: the stele pavilions, Kuiwen, the gates, the bridge
  [[0, 150], [0, 200], [0, 255]],                                     // the forecourt and Queli Street to the Wanren Gongqiang gate
];
export const WALK_REACH = 24;
function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2)) : 0;
  return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vz * t);
}
/** The distance of a point from the walk. */
export function walkDistance(p) { let best = Infinity; for (const W of WALK) for (let i = 0; i + 1 < W.length; i++) best = Math.min(best, segDist(p, W[i], W[i + 1])); return best; }
