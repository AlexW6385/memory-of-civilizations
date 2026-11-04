// Stonehenge about 2500 BC — the layout (docs/settlements/stonehenge.md §2): the stones at the centre
// of the circular ditch and bank on the open chalk down; the Avenue running north-east toward the
// midsummer sunrise; round barrows on the ridges; the houses of the builders (after Durrington
// Walls, which lies about 3 km away) brought near, to the north-east. Pure data. +x east, +z south.

export const RADIUS = 360;
export const DITCH = { r: 55, w: 6, depth: 1.6, bank: 1.0 };
export const AXIS = -Math.PI / 4;                          // toward the north-east
export const BARROWS = [[-220, -120, 14], [-180, -170, 11], [180, 160, 13], [230, 120, 10], [-150, 210, 12], [120, -260, 11]];
export const VILLAGE = { c: [200, -200], r: 70 };
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export function height(x, z) {
  const r = Math.hypot(x, z);
  let h = 2.5 * Math.sin(x / 90) * Math.cos(z / 110) + 1.5 * Math.sin((x + z) / 60);
  h -= DITCH.depth * smooth(DITCH.w / 2, 0, Math.abs(r - DITCH.r));
  h += DITCH.bank * smooth(3, 0, Math.abs(r - DITCH.r + 6));
  // the Avenue's two low banks running north-east
  const ax = Math.cos(AXIS), az = Math.sin(AXIS), s = x * ax + z * az, t = -x * az + z * ax;
  if (s > DITCH.r && s < RADIUS - 40) h += 0.6 * (smooth(2, 0, Math.abs(t - 11)) + smooth(2, 0, Math.abs(t + 11)));
  for (const [bx, bz, br] of BARROWS) { const d = Math.hypot(x - bx, z - bz) / br; if (d < 1) h += 2.2 * Math.cos(d * Math.PI / 2) ** 2; }
  return h * (1 - smooth(RADIUS - 50, RADIUS - 5, r));
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let H = null;
export function houses() {
  if (H) return H;
  H = [];
  const rand = rng(2500);
  for (let k = 0; k < 1500 && H.length < 70; k++) {
    const a = rand() * Math.PI * 2, d = rand() * VILLAGE.r, x = VILLAGE.c[0] + Math.cos(a) * d, z = VILLAGE.c[1] + Math.sin(a) * d;
    if (Math.hypot(x, z) > RADIUS - 50 || H.some((h) => Math.hypot(h.c[0] - x, h.c[1] - z) < 9)) continue;
    H.push({ c: [x, z], s: 4.5 + rand(), yaw: rand() * Math.PI, y: height(x, z) });
  }
  return H;
}
