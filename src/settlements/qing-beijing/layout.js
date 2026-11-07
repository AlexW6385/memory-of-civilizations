// Ming–Qing Beijing — the layout of the settlement (docs/settlements/qing-beijing.md §2): the
// Outer Court of the Forbidden City in the middle — the Meridian Gate, the Golden Water River and
// its bridges, the Gate of Supreme Harmony, the great courtyard, the three-tiered marble terrace
// with the Three Great Halls, the gate to the Inner Court — inside a red wall with corner towers and
// a moat; round it, lanes (hutong) of grey-brick courtyard houses (siheyuan). Pure data.
// Coordinates: metres, +x east, +z south, origin at the disc's centre; the palace's axis is x = 0.

export const RADIUS = 380;
export const LEVEL = { ground: 0, moat: -1.6, moatBed: -3.6, river: -1.2, riverBed: -3.0 };

/** The palace wall's centre line (a rectangle), its height and thickness. */
export const WALL = { rect: [-112, -190, 112, 175], h: 8.5, th: 3.6 };
/** The moat: water between the outer and inner rectangles. */
export const MOAT = { outer: [-134, -212, 134, 197], inner: [-120, -198, 120, 183] };
/** The street round the moat, and the avenue south from the Meridian Gate. */
export const RING = [-142, -220, 142, 205];
export const AVENUE = [-12, 205, 12, 380];
/** The Inner Golden Water River crossing the Meridian Gate's court (a strip of water). */
export const RIVER = [-78, 139, 78, 146];
/** The terrace's three tiers: [x0, z0, x1, z1], top height. */
export const TIERS = [
  { rect: [-64, -156, 64, 33], y: 2.7 },
  { rect: [-59, -151, 59, 28], y: 5.4 },
  { rect: [-54, -146, 54, 23], y: 8.1 },
];
/** The halls: rectangles and floor heights (their details in plan.js). */
export const HALLS = {
  taihe: { rect: [-32, -24.5, 32, 12.5], y: 8.6 },          // Hall of Supreme Harmony, 64 × 37 m
  zhonghe: { rect: [-12, -60, 12, -36], y: 8.5 },           // Hall of Central Harmony, square
  baohe: { rect: [-24.5, -110, 24.5, -86], y: 8.5 },        // Hall of Preserving Harmony
  taihemen: { rect: [-26, 110.5, 26, 121.5], y: 3.2 },      // Gate of Supreme Harmony
};

/**
 * The Temple of Heaven's Hall of Prayer for Good Harvests on its round altar (§13), brought in
 * beside the avenue south of the palace (the real temple lies some 3 km south, east of the axis):
 * the altar's centre and tiers, the square wall round it, the belt of old arborvitae round the wall.
 */
export const TEMPLE = { c: [72, 280], wall: 54, belt: [14, 214, 142, 352] };
export const inTemple = (x, z, m = 0) => Math.abs(x - TEMPLE.c[0]) <= TEMPLE.wall + m && Math.abs(z - TEMPLE.c[1]) <= TEMPLE.wall + m;
export const inBelt = (x, z, m = 0) => x >= TEMPLE.belt[0] - m && x <= TEMPLE.belt[2] + m && z >= TEMPLE.belt[1] - m && z <= TEMPLE.belt[3] + m;

const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export { inRect };
export function inMoat(x, z) { return inRect(MOAT.outer, x, z) && !inRect(MOAT.inner, x, z); }
export function inRiver(x, z) { return inRect(RIVER, x, z); }
export function inPalace(x, z, m = 0) { return inRect(WALL.rect, x, z, m); }

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** The lanes: east–west hutong every 29 m, north–south streets; [x0, z0, x1, z1]. */
export const HUTONG_PERIOD = 29, HUTONG_W = 5;
export function lanes() {
  const out = [];
  const [b0, bz0, b1, bz1] = TEMPLE.belt;
  for (let z = -380; z <= 380; z += HUTONG_PERIOD) {
    // the lanes stop at the temple's belt of trees
    if (z + HUTONG_W > bz0 && z < bz1) { out.push([-380, z, b0, z + HUTONG_W], [b1, z, 380, z + HUTONG_W]); continue; }
    out.push([-380, z, 380, z + HUTONG_W]);
  }
  for (const x of [-290, -214, 214, 290]) out.push([x - 4, -380, x + 4, 380]);
  return out;
}

let HOUSES = null;
/**
 * The courtyard houses: { rect, seed } in the bands between the hutong, each facing south onto
 * the lane below it, 24–34 m wide; none in the palace, its moat and ring street, the avenue,
 * across a street or beyond the town's edge.
 */
export function houses() {
  if (HOUSES) return HOUSES;
  HOUSES = [];
  const rand = rng(1420), streets = lanes().filter((l) => l[2] - l[0] < 20);
  for (let z = -380 + HUTONG_W; z < 380; z += HUTONG_PERIOD) {
    const z0 = z + 0.8, z1 = z + HUTONG_PERIOD - HUTONG_W - 0.8;
    let x = -380 + rand() * 10;
    while (x < 380) {
      const w = 24 + rand() * 10, r = [x, z0, x + w - 1, z1];
      x += w;
      const far = Math.max(...[[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].map(([a, b]) => Math.hypot(a, b)));
      if (far > RADIUS - 28) continue;
      if (rectsMeet(r, RING, 2) || rectsMeet(r, AVENUE, 2) || rectsMeet(r, TEMPLE.belt, 1) || streets.some((s) => rectsMeet(r, s, 1))) continue;
      if (rand() < 0.05) continue;
      HOUSES.push({ rect: r, seed: Math.floor(rand() * 1e6) });
    }
  }
  return HOUSES;
}
export function rectsMeet(a, b, m = 0) { return a[0] < b[2] + m && a[2] > b[0] - m && a[1] < b[3] + m && a[3] > b[1] - m; }
export function inHouse(x, z, m = 0) { return houses().some((h) => inRect(h.rect, x, z, m)); }
/** The middle of a house's courtyard (where its tree stands), or null. */
export function courtyardAt(x, z) {
  for (const h of houses()) {
    const [x0, z0, x1, z1] = h.rect, cx = (x0 + x1) / 2, cz = z0 + (z1 - z0) * 0.55;
    if (Math.abs(x - cx) < (x1 - x0) * 0.22 && Math.abs(z - cz) < (z1 - z0) * 0.12) return h;
  }
  return null;
}
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
