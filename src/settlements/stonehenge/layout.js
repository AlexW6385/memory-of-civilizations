// Stonehenge about 2500 BC — the layout (docs/settlements/stonehenge.md §2): the stones at the centre
// of the circular ditch and bank on the open chalk down; the Avenue running north-east toward the
// midsummer sunrise; round barrows on the ridges; the houses of the builders (after Durrington
// Walls, which lies about 3 km away) brought near, to the north-east. Pure data. +x east, +z south.

export const RADIUS = 360;
export const DITCH = { r: 55, w: 6, depth: 1.6, bank: 1.0 };
export const AXIS = -Math.PI / 4;                          // toward the north-east
export const BARROWS = [[-220, -120, 14], [-180, -170, 11], [180, 160, 13], [230, 120, 10], [-150, 210, 12], [120, -260, 11]];
export const VILLAGE = { c: [200, -200], r: 70 };
/** The Heel Stone and its ring ditch, on the axis outside the entrance (§1). */
export const HEEL = { d: 77, ditch: 3.6 };
/** The four Station Stones at the corners of a rectangle about the centre, short sides parallel to the axis (§1). */
export const STATIONS = [[16.5, 39.5, 91], [16.5, -39.5, 92], [-16.5, -39.5, 93], [-16.5, 39.5, 94]].map(([u, v, n]) => {
  const ax = Math.cos(AXIS), az = Math.sin(AXIS);
  return { n, at: [u * ax - v * az, u * az + v * ax], mound: n === 92 || n === 94 };
});
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
/** The Avenue's frame: s along the axis from the centre, t across it. */
export const avenue = (x, z) => { const ax = Math.cos(AXIS), az = Math.sin(AXIS); return [x * ax + z * az, -x * az + z * ax]; };
/** Depth of the ditch at angle a: dug in irregular segments, with the north-east entrance (and a narrow south one) left as causeways. */
function ditchFactor(x, z) {
  const a = Math.atan2(z, x), rel = Math.atan2(Math.sin(a - AXIS), Math.cos(a - AXIS));
  if (Math.abs(rel) < 0.2) return 0;                                                       // the north-east entrance, widened
  const south = Math.atan2(Math.sin(a - Math.PI / 2 - 0.15), Math.cos(a - Math.PI / 2 - 0.15));
  if (Math.abs(south) < 0.05) return 0;
  return 0.65 + 0.35 * Math.abs(Math.sin(a * 23.5 + 0.7)) ** 0.5 * (0.8 + 0.2 * Math.sin(a * 7));   // segment by segment
}
export function height(x, z) {
  const r = Math.hypot(x, z);
  // the down: gentle swells, nearly level where the stones stand
  let h = (2.5 * Math.sin(x / 90) * Math.cos(z / 110) + 1.5 * Math.sin((x + z) / 60)) * (0.25 + 0.75 * smooth(18, 70, r));
  const f = ditchFactor(x, z);
  h -= DITCH.depth * f * smooth(DITCH.w / 2, 0, Math.abs(r - DITCH.r));
  h += DITCH.bank * Math.min(1, f * 1.3) * smooth(3, 0, Math.abs(r - DITCH.r + 6));          // the bank inside the ditch
  h += 0.3 * f * smooth(1.5, 0, Math.abs(r - DITCH.r - 4.5));                             // the low counterscarp outside
  // the Avenue's two low banks running north-east, a ditch outside each
  const [s, t] = avenue(x, z);
  if (s > DITCH.r - 2 && s < RADIUS - 40) {
    const k = smooth(DITCH.r - 2, DITCH.r + 4, s);
    h += k * (0.5 * (smooth(1.8, 0, Math.abs(t - 7)) + smooth(1.8, 0, Math.abs(t + 7))) - 0.55 * (smooth(1.3, 0, Math.abs(t - 9.6)) + smooth(1.3, 0, Math.abs(t + 9.6))));
  }
  // the Heel Stone's ring ditch
  { const d = Math.hypot(s - HEEL.d, t); h -= 0.6 * smooth(0.8, 0, Math.abs(d - HEEL.ditch)); }
  // the North and South barrows: low mounds carrying two of the Station Stones, each in its ring ditch
  for (const st of STATIONS) if (st.mound) {
    const d = Math.hypot(x - st.at[0], z - st.at[1]);
    h += 0.7 * smooth(5, 0, d) - 0.4 * smooth(0.9, 0, Math.abs(d - 6));
  }
  for (const [bx, bz, br] of BARROWS) { const d = Math.hypot(x - bx, z - bz) / br; if (d < 1) h += 2.2 * Math.cos(d * Math.PI / 2) ** 2; }
  return h * (1 - smooth(RADIUS - 50, RADIUS - 5, r));
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let H = null;
/** The houses: { c, s (inner side), yaw, y (the chalk floor, at the highest corner), seed }. */
export function houses() {
  if (H) return H;
  H = [];
  const rand = rng(2500);
  for (let k = 0; k < 1500 && H.length < 70; k++) {
    const a = rand() * Math.PI * 2, d = rand() * VILLAGE.r, x = VILLAGE.c[0] + Math.cos(a) * d, z = VILLAGE.c[1] + Math.sin(a) * d;
    if (Math.hypot(x, z) > RADIUS - 50 || H.some((h) => Math.hypot(h.c[0] - x, h.c[1] - z) < 10)) continue;
    const s = 4.8 + rand() * 0.9, yaw = rand() * Math.PI * 2, e = s / 2 + 0.3;
    const ys = [[-e, -e], [e, -e], [e, e], [-e, e], [0, 0]].map(([u, v]) => height(x + u * Math.cos(yaw) - v * Math.sin(yaw), z + u * Math.sin(yaw) + v * Math.cos(yaw)));
    H.push({ c: [x, z], s, yaw, y: Math.max(...ys) + 0.04, low: Math.min(...ys), seed: Math.floor(rand() * 1e6) });
  }
  return H;
}
