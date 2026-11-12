// Mongol Karakorum, c. 1254 — the layout (docs/settlements/mongol-karakorum.md §3). Pure data. +x east, +z south.
// The walled town (a rammed-earth wall, four gates: grain at the east, sheep and goats west, oxen and carts south, horses north),
// the palace compound in its north-east, the Saracen quarter (west, the bazaar on the main street, two mosques, the Nestorian church at the
// far south-west) and the Cathayan quarter (south-east, craftsmen, the Great Hall), open ground for gers, the court's ger camps outside the south wall.

export const RADIUS = 190;
export const WALL = [-135, -100, 135, 100];
export const WALL_TH = 5, WALL_H = 5.8;
export const GATES = { n: [0, -100], s: [0, 100], w: [-135, 0], e: [135, 0] };
export const GATE_W = 4.6;
export const MAIN = { z: 0, w: 8 };            // the main street, east–west, stone-paved [stated: UW]
export const CROSS = { x: 0, w: 7 };           // the cross-street, north–south
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ── the palace compound (north-east) ──
export const PALACE = [12, -92, 128, -10];
export const HALL = { c: [70, -42], y: 1.6 };                   // c: [x centre, z of the south wall]; 16.8 × 33.6 m
export const HALL_RECT = [HALL.c[0] - 8.4, HALL.c[1] - 33.6, HALL.c[0] + 8.4, HALL.c[1]];
export const TREE = [70, -49];
export const PALACE_GATE = { c: [70, -10], y: 0.9 };
export const STORES = [[112, -82, 124, -52], [112, -46, 124, -16], [16, -82, 34, -62], [16, -56, 34, -36]];
export const COURT_GER = { c: [104, -24], r: 4.4 };            // the khan's great ger, opened
export const COURT_CART = { c: [36, -26], r: 3.0 };
export const BANNERS = [[58, -22], [82, -22]];
export const TORTOISE = [51, -18];

// ── the Cathayan quarter (south-east) ──
export const GREAT_HALL = { c: [72, 52], y: 1.5 };              // 36.4 m square
export const GREAT_RECT = [72 - 18.2 - 2.6, 52 - 18.2 - 2.6, 72 + 18.2 + 2.6, 52 + 18.2 + 2.6];
export const KILNS = [[108, 22], [120, 22], [112, 36]];
export const FORGES = [[102, 60, 109, 66], [114, 60, 121, 66], [102, 72, 109, 78]];
export const TEMPLES = [[14, 14, 26, 24], [14, 34, 26, 44], [110, 82, 122, 90], [40, 78, 52, 88], [96, 40, 106, 50]];     // small halls of the idol temples [stated: twelve]
export const TEMPLES_NW = [[-24, -60, -12, -48], [-24, -90, -12, -78]];
export const WORKSHOPS = [[14, 56, 28, 66], [14, 72, 28, 82], [38, 14, 50, 24], [94, 14, 104, 24]];

// ── the Saracen quarter (west) ──
export const MOSQUES = [[-62, -93, -36, -68], [-112, 20, -88, 44]];
export const CHURCH = [-129, 72, -115, 80];
export const SECRETARIES = [[-24, -34, -8, -20], [-24, 12, -8, 28]];       // "large palaces" of the court secretaries [stated: Rubruck]: big courtyard houses by the cross-street

/** Depth of a shop bay and its width (m). */
export const SHOP_D = 5.0, SHOP_W = 3.6;
/**
 * The shop rows: { a (min corner), n (bays), face ('s'|'n'|'e'|'w': the way the fronts look), seed, d }. The main street's rows stand with their fronts 7.6 m from its axis
 * (the awnings reach 5.8 m, the paving 4 m); the cross-street's rows (the lanes between them are 1.6 m) face it from both sides.
 */
export const SHOPS = [];
for (const [x, n] of [[-126, 8], [-90, 8], [-54, 8], [-22, 4]]) { SHOPS.push({ a: [x, -12.6], n, face: 's', seed: x, d: SHOP_D }); SHOPS.push({ a: [x, 7.6], n, face: 'n', seed: x + 1, d: SHOP_D }); }
for (const [x, n] of [[8, 8], [40, 8], [72, 8], [104, 6]]) SHOPS.push({ a: [x, 7.6], n, face: 'n', seed: x + 3, east: true, d: SHOP_D });
// the cross-street (x ±3.5): fronts at x = ∓5.2, bays 4.6 deep
for (const [z, n] of [[-92, 7], [-64, 7], [32, 7], [59, 7]]) { SHOPS.push({ a: [-5.2 - 4.6, z], n, face: 'e', seed: z * 3 + 1, d: 4.6 }); SHOPS.push({ a: [5.2, z], n, face: 'w', seed: z * 3 + 2, east: z > 0, d: 4.6 }); }

/** The courtyard lots of the Saracen quarter and the open ground between: { rect, gate, kind: 'house' | 'open', seed }. */
export const LOTS = (() => {
  const r = rng(1254), out = [], taken = [...MOSQUES, CHURCH, ...SECRETARIES.map((q) => q), [-62, -93, -36, -68]];
  const rows = [[-70, -56, 's'], [-52, -38, 's'], [-34, -18, 's'], [18, 32, 'n'], [36, 50, 'n'], [54, 68, 'n'], [72, 86, 'n']];
  for (const [z0, z1, gate] of rows) {
    for (let x = -128; x < -30; x += 17.5) {
      const rect = [x, z0, x + 14, z1];
      if (taken.some((q) => rect[0] < q[2] + 3 && rect[2] > q[0] - 3 && rect[1] < q[3] + 3 && rect[3] > q[1] - 3)) continue;
      out.push({ rect, gate, kind: r() < 0.62 ? 'house' : 'open', seed: Math.floor(r() * 1e6), floors: r() < 0.22 ? 2 : 1, dome: r() < 0.25 });
    }
  }
  // the east strip of the Saracen quarter, along the cross-street
  for (const [z0, z1, gate] of [[-70, -56, 's'], [-52, -38, 's'], [36, 50, 'n'], [54, 68, 'n'], [72, 86, 'n']]) for (const x of [-26, -8 - 14 + 0]) {
    const rect = [x, z0, x + 14, z1];
    if (x + 14 > -4 || taken.some((q) => rect[0] < q[2] + 3 && rect[2] > q[0] - 3 && rect[1] < q[3] + 3 && rect[3] > q[1] - 3)) continue;
    if (out.some((o) => rect[0] < o.rect[2] && rect[2] > o.rect[0] && rect[1] < o.rect[3] && rect[3] > o.rect[1])) continue;
    out.push({ rect, gate, kind: r() < 0.7 ? 'house' : 'open', seed: Math.floor(r() * 1e6), floors: 1, dome: false });
  }
  return out;
})();

/** The footprint of a shop row. */
export const shopRect = (s) => (s.face === 'e' || s.face === 'w' ? [s.a[0], s.a[1], s.a[0] + s.d, s.a[1] + s.n * SHOP_W] : [s.a[0], s.a[1], s.a[0] + s.n * SHOP_W, s.a[1] + s.d]);
/** Everything built in the town that a person cannot walk through (rects, with a margin test): for placing life. */
export const BUILT = [
  ...LOTS.filter((l) => l.kind === 'house').map((l) => l.rect), ...MOSQUES, CHURCH, ...SECRETARIES, ...TEMPLES, ...TEMPLES_NW, ...WORKSHOPS,
  ...SHOPS.map((s) => shopRect(s)), ...STORES, GREAT_RECT,
  [HALL_RECT[0] - 2.7, HALL_RECT[1] - 2.7, HALL_RECT[2] + 2.7, HALL_RECT[3] + 2.7], ...FORGES,
];
export const inBuilt = (x, z, m = 0) => BUILT.some((r) => inRect(r, x, z, m));
/** Inside the town wall (the clear inside of it). */
export const inTown = (x, z, m = 0) => inRect([WALL[0] + WALL_TH / 2, WALL[1] + WALL_TH / 2, WALL[2] - WALL_TH / 2, WALL[3] - WALL_TH / 2], x, z, -m);
export const inPalace = (x, z, m = 0) => inRect(PALACE, x, z, m);
export const onStreet = (x, z) => (inTown(x, z) && (Math.abs(z - MAIN.z) < MAIN.w / 2 || Math.abs(x - CROSS.x) < CROSS.w / 2));

/** The ger camps outside the south wall (the court's, "like a large town"): { c, ... }. */
export const CAMPS = { sw: [-62, 128], se: [66, 126] };
/** Pens at the gates' markets outside the wall: horses N, sheep and goats W, oxen and carts S, millet E. */
export const PENS = { n: [[-30, -118, -10, -106], [10, -118, 30, -106], [-30, -134, -10, -122], [10, -134, 30, -122]], w: [[-158, -22, -146, -8], [-158, 8, -146, 22], [-172, -8, -160, 8]] };
export const OUTSIDE_WAGONS = { s: [[-24, 112], [-14, 118], [14, 114], [26, 120]], e: [[148, -22], [150, -8], [148, 12], [152, 24]] };
/** The ground rises gently beyond the wall's neighbourhood (flat to 172 m so that every placed thing stands level). */
export function height(x, z) {
  const r = Math.hypot(x, z);
  return 2.6 * smooth(172, RADIUS, r) * (0.7 + 0.3 * Math.sin(x * 0.05) * Math.cos(z * 0.04));
}
