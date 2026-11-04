// Ottoman Istanbul about 1560 — the layout (docs/settlements/ottoman-istanbul.md §2): the
// Süleymaniye on the crown of the third hill, its terrace looking north over the Golden Horn; the
// mosque in its outer court, the madrasas east and west, the soup kitchen and hospital to the
// north-west, Süleyman's tomb behind the qibla wall; timber houses down the slopes. Pure data.
// +x east, +z south (the qibla toward +z).

export const RADIUS = 400;
export const TOP = 22;
export const MOSQUE = { c: [0, 20], d: 26.5, h: 53 };
export const PRECINCT = [-75, -95, 75, 90];
export const MADRASAS = [[-150, -60, -90, 10], [90, -60, 150, 10], [-150, 25, -90, 95], [90, 25, 150, 95]];
export const TERRACE = [-160, -110, 160, 110];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
/** The hill: level on its crown (the terrace), falling to the north toward the Golden Horn and on all sides to the rim. */
export function height(x, z) {
  const dx = Math.max(Math.abs(x) - 160, 0), dz = z < 0 ? Math.max(-z - 110, 0) * 1.4 : Math.max(z - 110, 0);
  const d = Math.hypot(dx, dz);
  return TOP * smooth(240, 0, d) * (1 - smooth(RADIUS - 40, RADIUS - 5, Math.hypot(x, z)));
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
/** Timber houses on the slopes. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1560);
  for (let x = -RADIUS + 20; x < RADIUS - 20; x += 13) for (let z = -RADIUS + 20; z < RADIUS - 20; z += 12) {
    const w = 8 + rand() * 3, d = 8 + rand() * 2, cx = x + w / 2, cz = z + d / 2;
    if (Math.hypot(cx, cz) > RADIUS - 45 || inRect(TERRACE, cx, cz, 10) || rand() < 0.3) continue;
    const ys = [[x, z], [x + w, z], [x, z + d], [x + w, z + d]].map(([a, b]) => height(a, b));
    if (Math.max(...ys) - Math.min(...ys) > 3) continue;
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6), y: Math.max(...ys), foot: Math.min(...ys), storeys: rand() < 0.6 ? 2 : 3, front: rand() < 0.5 ? 'n' : 's', plaster: rand() < 0.5 });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
