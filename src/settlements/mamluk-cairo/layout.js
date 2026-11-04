// Mamluk Cairo about 1363 — the layout (docs/settlements/mamluk-cairo.md §2): the Madrasa of
// Sultan Hasan below the Citadel, facing the Rumayla square; the Citadel on its spur of the
// Muqattam to the east, walled with round towers, the Mosque of al-Nasir Muhammad inside; the
// dense city of mud-brick and stone houses round about. Pure data. +x east, +z south.

export const RADIUS = 400;
export const HASAN = { rect: [-75, 6, 75, 74], court: [-17, 24, 17, 56], tomb: [-16, 74, 16, 106] };
export const SQUARE = [80, -80, 170, 120];
export const CITADEL = { c: [280, 0], r: 105, top: 36 };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export function height(x, z) {
  const d = Math.hypot(x - CITADEL.c[0], z - CITADEL.c[1]);
  return CITADEL.top * smooth(CITADEL.r + 40, CITADEL.r, d) * (1 - smooth(RADIUS - 50, RADIUS - 5, Math.hypot(x, z)));
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
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6), y: 0, storeys: 2 + (rand() < 0.4 ? 1 : 0), court: null, front: rand() < 0.5 ? 'n' : 's', plaster: rand() });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
