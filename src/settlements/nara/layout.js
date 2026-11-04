// Nara in 752 — the layout (docs/settlements/nara.md §2): Tōdai-ji at the eastern edge of the
// capital, the Great Buddha Hall in its corridored court, the Middle Gate south of it, the Great
// South Gate beyond, the twin seven-storey pagodas in their own courts east and west, the lecture
// hall and monks' quarters to the north; the grassy slope of Wakakusa rising to the east; the
// capital's houses to the west. Pure data. +x east, +z south.

export const RADIUS = 340;
export const HALL = [-43, -85, 43, -35];
export const COURT = [-85, -120, 85, 40];
export const SOUTH_GATE = [-15, 140, 15, 152];
export const PAGODAS = [[-120, 90], [120, 90]];
export const TEMPLE = [-150, -190, 150, 160];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
/** Level in the temple; the hills rising east (Wakakusa) and north-east. */
export function height(x, z) {
  const hill = 45 * smooth(165, 300, x) + 15 * smooth(-200, -380, z) * smooth(-50, 200, x);
  return (inRect(TEMPLE, x, z, 6) ? 0 : hill) * (1 - smooth(RADIUS - 120, RADIUS - 15, Math.hypot(x, z)));
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
/** Houses of the capital to the west, on the grid of its streets. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(752);
  for (let x = -RADIUS + 20; x < -170; x += 14) for (let z = -RADIUS + 20; z < RADIUS - 20; z += 13) {
    const w = 9 + rand() * 3, d = 8 + rand() * 2, cx = x + w / 2, cz = z + d / 2;
    if (Math.hypot(cx, cz) > RADIUS - 45 || Math.abs(cz - 146) < 8 || Math.abs((cx + 400) % 120 - 60) < 4 || rand() < 0.3) continue;
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6), y: 0, foot: -0.2, front: 's' });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
