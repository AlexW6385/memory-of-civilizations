// Mamluk Cairo about 1363 — the layout (docs/settlements/mamluk-cairo.md §2): the Madrasa of
// Sultan Hasan below the Citadel, facing the Rumayla square; the Citadel on its spur of the
// Muqattam to the east, walled with round towers, the Mosque of al-Nasir Muhammad inside; the
// dense city of mud-brick and stone houses round about. Pure data. +x east, +z south.

export const RADIUS = 400;
export const HASAN = { rect: [-75, 6, 75, 74], court: [-17, 24, 17, 56], tomb: [-16, 74, 16, 106] };
export const SQUARE = [80, -80, 170, 120];
export const CITADEL = { c: [280, 0], r: 105, top: 36 };
// the road up to the Citadel from the Rumayla: round the spur's western face, from the square's south-east
// corner (angle 140°, measured from +x toward +z round the Citadel's centre) to the gate at 220° (the north-west,
// where Bab al-Mudarraj stands), 8 m wide, its surface rising evenly to the top as it nears the walls
export const ROAD = { a0: 140, a1: 220, r0: 150, r1: 98, w: 4 };
/** The road's centre at angle a (degrees): [radius, height], or null outside its span. */
export function roadAt(a) {
  if (a < ROAD.a0 || a > ROAD.a1) return null;
  const t = (a - ROAD.a0) / (ROAD.a1 - ROAD.a0), r = ROAD.r0 + (ROAD.r1 - ROAD.r0) * t;
  return [r, CITADEL.top * Math.min(1, (ROAD.r0 - r) / (ROAD.r0 - CITADEL.r))];
}
const angleOf = (x, z) => { const a = Math.atan2(z - CITADEL.c[1], x - CITADEL.c[0]) * 180 / Math.PI; return a < 0 ? a + 360 : a; };
/** Is (x, z) on the road (within its width plus m)? */
export function onRoad(x, z, m = 0) { const q = roadAt(angleOf(x, z)); return !!q && Math.abs(Math.hypot(x - CITADEL.c[0], z - CITADEL.c[1]) - q[0]) < ROAD.w + m; }
// the covered market street north from the madrasa's portal (its axis at x = −37.5)
export const SUQ = [-45, -116, -30, -14];
// sabil-kuttabs on street corners: the crossing of the two lanes west of the madrasa, and the square's north-west corner
export const SABILS = [[-155.5, -115.5], [-165, -130], [74, -86]];
// the merchant's house with its qa'a, open and furnished (docs/settlements/mamluk-cairo.md §10): west of the covered
// market street, its door on the lane beside it
export const QAA = [-69, -70, -47, -48];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export function height(x, z) {
  const d = Math.hypot(x - CITADEL.c[0], z - CITADEL.c[1]);
  let h = CITADEL.top * smooth(CITADEL.r + 40, CITADEL.r, d);
  // the road: cut into the slope and built up on it, level across, blended into the hill beyond its walls
  const q = roadAt(angleOf(x, z));
  if (q) { const e = Math.abs(d - q[0]); if (e < ROAD.w + 1.5) h = q[1] + (h - q[1]) * smooth(ROAD.w, ROAD.w + 1.5, e); }
  return h * (1 - smooth(RADIUS - 50, RADIUS - 5, Math.hypot(x, z)));
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1363);
  for (let x = -RADIUS + 20; x < 170; x += 13) for (let z = -RADIUS + 20; z < RADIUS - 20; z += 12) {
    const w = 9 + rand() * 3, d = 9 + rand() * 2, cx = x + w / 2, cz = z + d / 2;
    if (Math.hypot(cx, cz) > RADIUS - 45 || inRect([-90, -10, 90, 120], cx, cz, 8) || inRect(SQUARE, cx, cz, 6) || Math.hypot(cx - CITADEL.c[0], cz - CITADEL.c[1]) < CITADEL.r + 45 || rand() < 0.15) continue;
    if (Math.abs(cz + 120) < 5 || Math.abs(cx + 160) < 4) continue;
    if (x < SUQ[2] + 1 && x + w > SUQ[0] - 1 && z < SUQ[3] + 6 && z + d > SUQ[1] - 1) continue;   // the market street
    if (x < QAA[2] + 1.5 && x + w > QAA[0] - 1.5 && z < QAA[3] + 1.5 && z + d > QAA[1] - 1.5) continue;   // the open house
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6), y: 0, storeys: 2 + (rand() < 0.4 ? 1 : 0), court: null, front: rand() < 0.5 ? 'n' : 's', plaster: rand() });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
