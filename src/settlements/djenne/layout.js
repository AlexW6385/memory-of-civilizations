// Djenné (the Mali Empire, 14th c.) — the layout of the settlement (docs/settlements/djenne.md §2):
// the town on its island in the floodplain of the Bani, the Great Mosque on its platform in the
// middle with the market square before its qibla wall on the east, the houses packed along narrow
// winding streets; round the island the channel, then the flooded fields. Pure data.
// Coordinates: metres, +x east, +z south.

export const RADIUS = 360;
export const ISLAND = 225;                  // the island's radius (with a ragged shore)
export const LEVEL = { town: 0, water: -1.6, bed: -3.6, plain: -1.2 };
export const MOSQUE = { c: [0, 0], a: 37.5, py: 3 };
export const MARKET = [40, -45, 115, 45];
// the shop row on the market's north edge (fronts to the south) and the court house at its north-east corner: both enterable
export const SHOPS = [58, -52, 98, -45.5];
export const COURT = [100, -62, 121, -45.5];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
/** The island's shore distance (negative on the island). */
export function shore(x, z) {
  const a = Math.atan2(z, x), r = ISLAND + 14 * Math.sin(a * 3 + 1) + 8 * Math.sin(a * 7 + 2);
  return Math.hypot(x, z) - r;
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

let HOUSES = null;
const HOUSES_CLEAR = (x0, z0, x1, z1) => [SHOPS, COURT].some((r) => x1 > r[0] - 3 && x0 < r[2] + 3 && z1 > r[1] - 3 && z0 < r[3] + 3);
/**
 * The houses: blocks of a jittered grid 26 m apart with lanes of 3–5 m between them, each block cut
 * into two to five houses facing the lanes; none on the mosque's square, the market or the shore.
 */
export function houses() {
  if (HOUSES) return HOUSES;
  HOUSES = [];
  const rand = rng(1300);
  for (let gx = -240; gx < 240; gx += 26) for (let gz = -240; gz < 240; gz += 26) {
    const lane = 4 + rand() * 2, x0 = gx + lane / 2 + (rand() - 0.5) * 1.2, z0 = gz + lane / 2 + (rand() - 0.5) * 1.2, x1 = gx + 26 - lane / 2, z1 = gz + 26 - lane / 2;
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    if (shore(cx, cz) > -16 || inRect([-58, -58, 58, 58], cx, cz) || inRect(MARKET, cx, cz, 8)) continue;
    // cut the block into houses: two rows facing north and south lanes, two or three along each
    const n = 2 + Math.floor(rand() * 2), zm = (z0 + z1) / 2;
    for (const [za, zb, front] of [[z0, zm, 'n'], [zm, z1, 's']]) {
      let x = x0;
      for (let k = 0; k < n; k++) {
        const w = k === n - 1 ? x1 - x : (x1 - x0) / n * (0.8 + rand() * 0.4);
        if (w > 4 && !HOUSES_CLEAR(x, za, x + w - 0.2, zb - 0.2)) HOUSES.push({ rect: [x, za, x + w - 0.2, zb - 0.2], front, storeys: rand() < 0.6 ? 2 : 1, seed: Math.floor(rand() * 1e6) });
        x += w;
      }
    }
  }
  return HOUSES;
}
export const inHouse = (x, z, m = 0) => houses().some((h) => inRect(h.rect, x, z, m));
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

/**
 * The lanes between the blocks, as runs of rectangles { r, w } for the walkers: the lane lines x = gx − 0.25 (north–south, 2 m
 * wide: the blocks' side walls) and z = gz − 0.55 (east–west, 1 m wide: the house fronts' benches and porches stand out of the
 * walls), cut where a house or the mosque's square and the market stand, and where the shore is near.
 */
export function lanes() {
  const out = [], free = (x, z) => shore(x, z) < -12 && !inHouse(x, z, 0) && !inRect([-58, -58, 58, 58], x, z, -4) && !inRect(MARKET, x, z, 3) && !inRect(SHOPS, x, z, 2) && !inRect(COURT, x, z, 2);
  for (const alongX of [false, true]) for (let g = -240; g < 240; g += 26) {
    let run = null;
    const c = g - (alongX ? 0.55 : 0.25);
    for (let t = -ISLAND; t <= ISLAND + 1; t += 2) {
      const x = alongX ? t : c, z = alongX ? c : t, ok = t <= ISLAND && free(x, z);
      if (ok && !run) run = t;
      if (!ok && run !== null) { if (t - 2 - run >= 6) out.push({ r: alongX ? [run, c - 0.5, t - 2, c + 0.5] : [c - 1, run, c + 1, t - 2], w: alongX ? 0.5 : 1 }); run = null; }
    }
  }
  return out;
}
