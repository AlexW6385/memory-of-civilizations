// Mount Wutai in 857 — the layout (docs/settlements/tang-wutai.md §2): Foguang Monastery on the
// west-facing slope of Foguang Hill — the lower courtyard, the middle terrace, the Great East Hall on
// the upper terrace against the hill; the small brick pagoda of the founding master on the slope
// to the south; a village of earth-walled houses and fields in the valley below to the west; pines
// on the hills. Pure data. +x east, +z south.

export const RADIUS = 360;
export const HALL = { origin: [60, 0] };                  // the plan's origin (the hall's centre)
export const PLAN = [-58, -48, 94, 48];                    // the plan's terraces in settlement coordinates
export const PAGODA = [60, -78];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
/** The hill rising behind the monastery and round its sides, kept below the monastery's terraces; the valley floor west. */
export function height(x, z) {
  let h = 14 * smooth(-10, 94, x) + 46 * smooth(94, 330, x) + 22 * smooth(60, 210, Math.abs(z)) * smooth(-140, 60, x);
  if (inRect(PLAN, x, z, -0.5)) h = Math.min(h, x < -2 ? -0.3 : x < 30 ? 6.2 : 12.7);
  return h * (1 - smooth(RADIUS - 70, RADIUS - 8, Math.hypot(x, z)));
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
let LOTS = null;
/** Houses of the village in the valley, in walled yards facing south. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(857);
  for (let x = -320; x < -90; x += 16) for (let z = -200; z < 220; z += 15) {
    const w = 10 + rand() * 3, d = 6 + rand() * 2, cx = x + w / 2, cz = z + d / 2;
    if (Math.hypot(cx, cz) > RADIUS - 70 || Math.abs(cz) < 8 || rand() < 0.35) continue;
    const ys = [[x, z], [x + w, z], [x, z + d], [x + w, z + d]].map(([a, b]) => height(a, b));
    if (Math.max(...ys) - Math.min(...ys) > 2) continue;
    LOTS.push({ rect: [x, z, x + w, z + d], seed: Math.floor(rand() * 1e6), y: Math.max(...ys), foot: Math.min(...ys), front: 's' });
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
