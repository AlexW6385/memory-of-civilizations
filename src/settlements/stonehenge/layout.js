// Stonehenge about 2500 BC — the layout (docs/settlements/stonehenge.md §2): the stones at the centre
// of the circular ditch and bank on the open chalk down; the Avenue running north-east toward the
// midsummer sunrise; round barrows on the ridges; the houses of the builders (after Durrington
// Walls, which lies about 3 km away) brought near, to the north-east. Pure data. +x east, +z south.

export const RADIUS = 360;
export const DITCH = { r: 55, w: 6, depth: 1.6, bank: 1.0 };
export const AXIS = -Math.PI / 4;                          // toward the north-east
/** Bowl barrows (a few may be as early as the Late Neolithic; most round barrows are later): [x, z, radius]. */
export const BARROWS = [[-180, -170, 11], [180, 160, 13], [-150, 210, 12], [120, -260, 11]];
/** Long barrows of the Early and Middle Neolithic, already old: [x, z, length, width, height, angle of the long axis]. */
export const LONG_BARROWS = [[-232, -58, 95, 22, 2.5, -Math.PI / 4], [96, 232, 70, 18, 2.2, -Math.PI / 4 + 0.15]];
/** The Southern Circle and its avenue (after Durrington Walls, §5b): the circle 40 m across, its entrance and the
 *  metalled avenue running south-east from it toward the river (beyond the settlement's edge). */
export const DURR = { c: [214, -165], r: 20, dir: [Math.SQRT1_2, Math.SQRT1_2], len: 108, w: 30 };
/** The Durrington avenue's frame: s along it from the circle's centre, t across it. */
export const durr = (x, z) => { const dx = x - DURR.c[0], dz = z - DURR.c[1], [a, b] = DURR.dir; return [dx * a + dz * b, -dx * b + dz * a]; };
export const VILLAGE = { c: [245, -135], r: 100 };
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
function baseHeight(x, z) {
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
  for (const [bx, bz, br] of BARROWS) {
    const r0 = Math.hypot(x - bx, z - bz), d = r0 / br;
    if (d < 1) h += 2.2 * Math.cos(d * Math.PI / 2) ** 2;
    h -= 0.5 * smooth(1.6, 0, Math.abs(r0 - br - 2.2));                                    // the ring ditch round the mound
  }
  // the long barrows: a mound higher and broader at its north-east end, a quarry ditch along each side
  for (const [bx, bz, L, W, H, ang] of LONG_BARROWS) {
    const ca = Math.cos(ang), sa = Math.sin(ang), u = (x - bx) * ca + (z - bz) * sa, v = -(x - bx) * sa + (z - bz) * ca;
    if (Math.abs(u) > L / 2 + 12 || Math.abs(v) > W / 2 + 14) continue;
    const k = 0.75 + 0.25 * (u / L + 0.5), along = smooth(L / 2, L / 2 - 8, Math.abs(u));
    h += H * k * along * Math.cos(Math.min(1, Math.abs(v) / (W / 2 * k)) * Math.PI / 2) ** 1.5;
    h -= 0.9 * smooth(L / 2 + 2, L / 2 - 4, Math.abs(u)) * smooth(3.5, 0, Math.abs(Math.abs(v) - W / 2 - 5));
  }
  // the Durrington avenue: its rammed surface level, a gully and a low bank outside along each side
  { const [ds, dt] = durr(x, z); if (ds > DURR.r - 2 && ds < DURR.r + DURR.len + 20) { const k = smooth(DURR.r - 2, DURR.r + 3, ds); h += k * (0.45 * smooth(2, 0, Math.abs(Math.abs(dt) - DURR.w / 2 - 2.5)) - 0.35 * smooth(0.9, 0, Math.abs(Math.abs(dt) - DURR.w / 2 - 0.5))); } }
  return h * (1 - smooth(RADIUS - 50, RADIUS - 5, r));
}
/** The ground: the down, with a level platform cut and built up for each house. */
export function height(x, z) {
  let h = baseHeight(x, z);
  if (Math.hypot(x - VILLAGE.c[0], z - VILLAGE.c[1]) > VILLAGE.r + 12) return h;
  for (const o of houses()) {
    const d = Math.max(Math.abs(x - o.c[0]), Math.abs(z - o.c[1]));
    if (d > o.s + 3) continue;
    const r = Math.hypot(x - o.c[0], z - o.c[1]), w = smooth(o.s * 0.75 + 2.5, o.s * 0.75 + 0.3, r);
    h += (o.y - 0.05 - h) * w;
  }
  return h;
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let H = null;
/** The houses: { c, s (inner side), yaw, y (the chalk floor, on its levelled platform), seed }. */
export function houses() {
  if (H) return H;
  H = [];
  const rand = rng(2500);
  for (let k = 0; k < 4000 && H.length < 70; k++) {
    const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * VILLAGE.r, x = VILLAGE.c[0] + Math.cos(a) * d, z = VILLAGE.c[1] + Math.sin(a) * d;
    // flanking the avenue and round the circle (the houses at Durrington stood either side of its avenue)
    const [ds, dt] = durr(x, z), [, st] = avenue(x, z), dc = Math.hypot(x - DURR.c[0], z - DURR.c[1]);
    const near = (ds > -10 && ds < DURR.r + DURR.len && Math.abs(dt) < 58) || dc < 72;
    if (!near || dc < DURR.r + 7 || (ds > 0 && Math.abs(dt) < DURR.w / 2 + 6) || Math.abs(st) < 15) continue;
    if (Math.hypot(x, z) > RADIUS - 50 || H.some((h) => Math.hypot(h.c[0] - x, h.c[1] - z) < 9.5)) continue;
    const s = 4.8 + rand() * 0.9, yaw = rand() * Math.PI * 2, e = s / 2 + 0.3;
    const ys = [[-e, -e], [e, -e], [e, e], [-e, e], [0, 0]].map(([u, v]) => baseHeight(x + u * Math.cos(yaw) - v * Math.sin(yaw), z + u * Math.sin(yaw) + v * Math.cos(yaw)));
    const y = ys.reduce((a, b) => a + b, 0) / ys.length + 0.05;
    H.push({ c: [x, z], s, yaw, y, low: y - 0.1, seed: Math.floor(rand() * 1e6) });
  }
  return H;
}
