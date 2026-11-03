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
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
/** The island's shore distance (negative on the island). */
export function shore(x, z) {
  const a = Math.atan2(z, x), r = ISLAND + 14 * Math.sin(a * 3 + 1) + 8 * Math.sin(a * 7 + 2);
  return Math.hypot(x, z) - r;
}
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

let HOUSES = null;
/**
 * The houses: blocks of a jittered grid 26 m apart with lanes of 3–5 m between them, each block cut
 * into two to five houses facing the lanes; none on the mosque's square, the market or the shore.
 */
export function houses() {
  if (HOUSES) return HOUSES;
  HOUSES = [];
  const rand = rng(1300);
  for (let gx = -240; gx < 240; gx += 26) for (let gz = -240; gz < 240; gz += 26) {
    const lane = 3 + rand() * 2, x0 = gx + lane / 2 + (rand() - 0.5) * 3, z0 = gz + lane / 2 + (rand() - 0.5) * 3, x1 = gx + 26 - lane / 2, z1 = gz + 26 - lane / 2;
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    if (shore(cx, cz) > -16 || inRect([-58, -58, 58, 58], cx, cz) || inRect(MARKET, cx, cz, 8)) continue;
    // cut the block into houses: two rows facing north and south lanes, two or three along each
    const n = 2 + Math.floor(rand() * 2), zm = (z0 + z1) / 2;
    for (const [za, zb, front] of [[z0, zm, 'n'], [zm, z1, 's']]) {
      let x = x0;
      for (let k = 0; k < n; k++) {
        const w = k === n - 1 ? x1 - x : (x1 - x0) / n * (0.8 + rand() * 0.4);
        if (w > 4) HOUSES.push({ rect: [x, za, x + w - 0.2, zb - 0.2], front, storeys: rand() < 0.6 ? 2 : 1, seed: Math.floor(rand() * 1e6) });
        x += w;
      }
    }
  }
  return HOUSES;
}
export const inHouse = (x, z, m = 0) => houses().some((h) => inRect(h.rect, x, z, m));
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
