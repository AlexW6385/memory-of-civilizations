// The ways people walk in the square before the cathedral (docs/settlements/florence.md §14): from the arrival at its
// north-west corner to the Baptistery's north door, round it to the east door, along the front to the campanile and
// round its foot. Sculpture is carved in full within 15 m of these, reduced to 40 m, and drawn as before beyond.

const WALK = [[-152, -108], [-122, -78], [-108, -60], [-80, -55], [-63, -45], [-78, -38], [-80, -25], [-56, -60], [-52, -40]];
const dseg = (px, pz, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (pz - a[1]) * dz) / (dx * dx + dz * dz || 1))); return Math.hypot(px - a[0] - dx * t, pz - a[1] - dz * t); };
/** 0 (full) within 15 m of the walks, 1 (reduced) to 40 m, 2 (the old form) beyond. */
export function lodAt(x, z) {
  let d = 1e9; for (let i = 0; i + 1 < WALK.length; i++) d = Math.min(d, dseg(x, z, WALK[i], WALK[i + 1]));
  return d < 15 ? 0 : d < 40 ? 1 : 2;
}
