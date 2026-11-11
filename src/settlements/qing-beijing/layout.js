// Ming–Qing Beijing — the layout of the settlement (docs/settlements/qing-beijing.md §2): the
// Outer Court of the Forbidden City in the middle — the Meridian Gate, the Golden Water River and
// its bridges, the Gate of Supreme Harmony, the great courtyard, the three-tiered marble terrace
// with the Three Great Halls, the gate to the Inner Court — inside a red wall with corner towers and
// a moat; round it, lanes (hutong) of grey-brick courtyard houses (siheyuan). Pure data.
// Coordinates: metres, +x east, +z south, origin at the disc's centre; the palace's axis is x = 0.

export const RADIUS = 520;
export const LEVEL = { ground: 0, moat: -1.6, moatBed: -3.6, river: -1.2, riverBed: -3.0 };

/** The palace wall's centre line (a rectangle), its height and thickness. */
export const WALL = { rect: [-112, -190, 112, 175], h: 8.5, th: 3.6 };
/** The moat: water between the outer and inner rectangles. */
export const MOAT = { outer: [-134, -212, 134, 197], inner: [-120, -198, 120, 183] };
/** The street round the moat, and the avenue south from the Meridian Gate. */
export const RING = [-142, -220, 142, 205];
export const AVENUE = [-7.4, 205, 7.4, RADIUS - 10];
/** The street's carriageway (half width, packed earth with a worn stone strip down its middle) and the raised walks before the shops. */
export const CARRIAGE = 4.3, WALK_UP = 0.14, STONE_STRIP = 1.5;
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
/**
 * The Meridian Gate's forecourt: the south moat is interrupted for |x| < NOTCH.x by a stone causeway, so that the gate's two
 * arms (the "wild goose wings", 25 m long) can project their real distance from the wall's front; the ring street's south side
 * stops at the forecourt too. The two side bridges and the water to either side remain.
 */
export const NOTCH = { x: 70, z0: MOAT.inner[3], z1: RING[3] };
export const inForecourt = (x, z, m = 0) => Math.abs(x) <= NOTCH.x + m && z >= NOTCH.z0 - m && z <= NOTCH.z1 + m;
export function inMoat(x, z) { return inRect(MOAT.outer, x, z) && !inRect(MOAT.inner, x, z) && !inForecourt(x, z); }
export function inRiver(x, z) { return inRect(RIVER, x, z); }
export function inPalace(x, z, m = 0) { return inRect(WALL.rect, x, z, m); }

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** The lanes: east–west hutong every 29 m, north–south streets; [x0, z0, x1, z1]. */
export const HUTONG_PERIOD = 29, HUTONG_W = 5;
const Z_START = -380 - 5 * HUTONG_PERIOD;                 // the lanes keep their old phase, running on to the larger disc's rim
export const STREET_X = [-440, -366, -290, -214, 214, 290, 366, 440];
export function lanes() {
  const out = [];
  const [b0, bz0, b1, bz1] = TEMPLE.belt;
  for (let z = Z_START; z <= RADIUS + 10; z += HUTONG_PERIOD) {
    // the lanes stop at the street round the moat (not under the palace and the moat) and at the temple's belt of trees
    if (z + HUTONG_W > RING[1] && z < RING[3]) { out.push([-RADIUS, z, RING[0], z + HUTONG_W], [RING[2], z, RADIUS, z + HUTONG_W]); continue; }
    if (z + HUTONG_W > bz0 && z < bz1) { out.push([-RADIUS, z, b0, z + HUTONG_W], [b1, z, RADIUS, z + HUTONG_W]); continue; }
    out.push([-RADIUS, z, RADIUS, z + HUTONG_W]);
  }
  for (const x of STREET_X) out.push([x - 4, -RADIUS, x + 4, RADIUS]);
  return out;
}

/**
 * The shop street (docs/settlements/qing-beijing.md §16): on the avenue south of the moat, the
 * shops of the west side from the moat's ring street to the town's edge, and of the east side
 * below the temple's belt of trees, their fronts to the avenue across a paved apron.
 */
export const SHOP_FRONT = 8.0, SHOP_DEPTH = 11, SHOP_YARD = 36;     // the front's distance from the axis, the shop's depth, the rear yard's depth behind the front
export const SHOP_STRIPS = [
  { side: 'w', rect: [-(SHOP_FRONT + SHOP_YARD), 214, -(SHOP_FRONT - 2.6), RADIUS - 20] },
  { side: 'e', rect: [SHOP_FRONT - 2.6, 357, SHOP_FRONT + SHOP_YARD, RADIUS - 20] },
];
export const SHOP_APRONS = [[-SHOP_FRONT, 214, -CARRIAGE, RADIUS - 20], [CARRIAGE, 357, SHOP_FRONT, RADIUS - 20]];
export const inShopStrip = (x, z, m = 0) => SHOP_STRIPS.some((s) => inRect(s.rect, x, z, m));

let HOUSES = null;
/** The gate types, by rank (§5, §16): the Guangliang gate (the grandest), the Jinzhu, the Manzi, the Ruyi (the commonest), the wall gate (the poorest). */
export const GATES = ['guangliang', 'jinzhu', 'manzi', 'ruyi', 'wall'];
/** How near the palace a place lies, 1 at the moat and 0 far out: the city's officials and its rich lived near the Imperial City. */
export const nearness = (x, z) => Math.max(0, 1 - Math.hypot(x, z * 0.9) / 470);
/**
 * The courtyard houses: { rect, seed, gate, courts (1 or 2), wealth, lod } in the bands between the
 * hutong, each facing south onto the lane below it, 24–34 m wide; none in the palace, its moat and
 * ring street, the avenue, the shop street, across a street or beyond the town's edge. The grand gates
 * (Guangliang, Jinzhu) and the second court with its hanging-flower gate go to the richer lots near the
 * palace; the Ruyi gate and the wall gate to the rest. lod: 0 the core (full detail), 1 the middle ring,
 * 2 the outer town (lighter).
 */
export function houses() {
  if (HOUSES) return HOUSES;
  HOUSES = [];
  const rand = rng(1420), pick = rng(2208), streets = lanes().filter((l) => l[2] - l[0] < 20);
  for (let z = Z_START + HUTONG_W; z < RADIUS; z += HUTONG_PERIOD) {
    const z0 = z + 0.8, z1 = z + HUTONG_PERIOD - HUTONG_W - 0.8;
    let x = -RADIUS + rand() * 10;
    while (x < RADIUS) {
      const w = 24 + rand() * 10, r = [x, z0, x + w - 1, z1];
      x += w;
      const far = Math.max(...[[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].map(([a, b]) => Math.hypot(a, b)));
      const seed = Math.floor(rand() * 1e6), drop = rand() < 0.05, q = pick(), q2 = pick();
      if (far > RADIUS - 28) continue;
      if (rectsMeet(r, RING, 2) || rectsMeet(r, AVENUE, 2) || rectsMeet(r, TEMPLE.belt, 1) || SHOP_STRIPS.some((p) => rectsMeet(r, p.rect, 0)) || streets.some((s) => rectsMeet(r, s, 1))) continue;
      if (drop) continue;
      const cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2, wealth = Math.min(1, nearness(cx, cz) * 0.95 + (q - 0.5) * 0.5 + (r[2] - r[0] > 31 ? 0.08 : 0));
      const gate = wealth > 0.74 ? 'guangliang' : wealth > 0.6 ? (q2 < 0.6 ? 'jinzhu' : 'ruyi') : wealth > 0.34 ? (q2 < 0.14 ? 'manzi' : q2 < 0.88 ? 'ruyi' : 'wall') : (q2 < 0.55 ? 'wall' : q2 < 0.9 ? 'ruyi' : 'manzi');
      const courts = wealth > 0.52 && q2 > 0.25 || gate === 'guangliang' ? 2 : 1;
      const d = Math.hypot(cx, cz), lod = d < 320 ? 0 : d < 430 ? 1 : 2;
      HOUSES.push({ rect: r, seed, gate, courts, wealth, lod });
    }
  }
  return HOUSES;
}
export function rectsMeet(a, b, m = 0) { return a[0] < b[2] + m && a[2] > b[0] - m && a[1] < b[3] + m && a[3] > b[1] - m; }
export function inHouse(x, z, m = 0) { return houses().some((h) => inRect(h.rect, x, z, m)); }
/** Where a house's trees stand: [x, z, kind] in its inner court (the pagoda tree, jujube or persimmon of the yard, §17). */
export function houseTrees(h) {
  const [x0, z0, x1, z1] = h.rect, W = x1 - x0, cx = (x0 + x1) / 2, r = rng(h.seed + 77);
  const dN = 6.45, zc = z0 + dN + (h.courts === 2 ? 3.5 : 4.6);        // the yard's middle (the main house's front below, the hanging-flower wall or the south row beyond)
  const kinds = ['jujube', 'jujube', 'persimmon', 'persimmon', 'crabapple', 'pagoda'];
  const k = () => kinds[Math.floor(r() * kinds.length)];
  const out = [];
  const big = W > 29 && h.wealth > 0.5 && r() < 0.5;
  if (big) out.push([cx + (r() - 0.5) * 3, zc, 'pagoda']);
  else if (r() < 0.45) out.push([cx - 0.2 * W, zc, k()], [cx + 0.2 * W, zc + 0.3, k()]);       // a pair either side of the path
  else out.push([cx + (r() < 0.5 ? -1 : 1) * (0.14 + 0.1 * r()) * W, zc + (r() - 0.5), k()]);
  if (h.courts === 2 && r() < 0.6) out.push([cx + (r() < 0.5 ? -1 : 1) * 5.5, z0 + 15.4, "crabapple"]);   // the outer court's one tree (crab-apple, haitang)
  return out;
}
let TREES = null;
/** All the courtyard trees: a grid for lookups. */
function treeIndex() {
  if (TREES) return TREES;
  TREES = new Map();
  const add = (t) => { const k = Math.floor(t[0] / 8) + ',' + Math.floor(t[1] / 8); if (!TREES.has(k)) TREES.set(k, []); TREES.get(k).push(t); };
  for (const t of vergeTrees()) add(t);
  for (const h of houses()) for (const t of houseTrees(h)) { const k = Math.floor(t[0] / 8) + ',' + Math.floor(t[1] / 8); if (!TREES.has(k)) TREES.set(k, []); TREES.get(k).push(t); }
  return TREES;
}
/** The old pagoda trees (Sophora japonica) of the lanes' edges and the trees of the shops' yards: [x, z, kind]. */
export function vergeTrees() {
  if (VERGE) return VERGE;
  VERGE = [];
  const rand = rng(1553), [b0, bz0, b1, bz1] = TEMPLE.belt;
  for (let z = Z_START; z <= RADIUS; z += HUTONG_PERIOD) {
    for (let x = -RADIUS + 30; x < RADIUS - 30; x += 46 + rand() * 40) {
      const p = [x, z + 0.55, 'pagoda'];
      if (Math.hypot(p[0], p[1]) > RADIUS - 36 || inRect(RING, p[0], p[1], 10) || inRect(AVENUE, p[0], p[1], 14) || inRect(TEMPLE.belt, p[0], p[1], 6) || inShopStrip(p[0], p[1], 4)) continue;
      if (STREET_X.some((sx) => Math.abs(x - sx) < 9) || (z + HUTONG_W > RING[1] && z < RING[3] && x > RING[0] - 30 && x < RING[2] + 30)) continue;
      if (rand() < 0.3) continue;
      VERGE.push(p);
    }
  }
  // the old pagoda trees along the avenue's east verge, where no shops stand (before the temple's belt of trees)
  for (let z = 226; z < 352; z += 15 + rand() * 6) VERGE.push([AVENUE[2] + 2.4 + rand() * 0.6, z, 'pagoda']);
  for (const row of shopRows()) {
    const yc = [(row.yard[0] + row.yard[2]) / 2 + (row.side === 'w' ? -4 : 4), (row.z0 + row.z1) / 2];
    VERGE.push([yc[0], yc[1], rand() < 0.5 ? 'pagoda' : 'jujube']);
  }
  return VERGE;
}
let VERGE = null;
/** The tree (its [x, z, kind]) within r of the point, or null. */
export function treeNear(x, z, r = 1.5) {
  const m = treeIndex(), gx = Math.floor(x / 8), gz = Math.floor(z / 8);
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (const t of m.get(`${gx + i},${gz + j}`) || []) if (Math.hypot(t[0] - x, t[1] - z) < r) return t;
  return null;
}
/** The middle of a house's courtyard (where its tree stands), or null (kept for the old callers). */
export function courtyardAt(x, z) { const t = treeNear(x, z, 1.4); return t ? { tree: t } : null; }

let SHOPS = null;
const TRADES = ['tea', 'wine', 'medicine', 'cloth', 'pawn', 'grain', 'tea', 'cloth', 'wine', 'grain', 'lantern', 'shoes'];
/**
 * The shops of the shop street, one block to each band between two lanes: { side, rect (the bay's
 * footprint: the front on the avenue side, SHOP_DEPTH deep), yard (the walled yard behind), shops:
 * [{ z0, z1, trade, seed, storeys }] } — the front to the avenue (x = ±SHOP_FRONT), 3 shops of 6–9 m to a block.
 */
export function shopRows() {
  if (SHOPS) return SHOPS;
  SHOPS = [];
  const rand = rng(1693);
  for (const st of SHOP_STRIPS) {
    for (let z = Z_START + HUTONG_W; z < RADIUS; z += HUTONG_PERIOD) {
      const z0 = z + 0.8, z1 = z + HUTONG_PERIOD - HUTONG_W - 0.8;
      if (z0 < st.rect[1] || z1 > st.rect[3]) continue;
      const w = st.side === 'w';
      const fx = w ? -SHOP_FRONT : SHOP_FRONT, rx = w ? fx - SHOP_DEPTH : fx + SHOP_DEPTH;
      const row = { side: st.side, front: fx, back: rx, yard: [Math.min(rx, w ? st.rect[0] + 1 : st.rect[0] + 1), z0, Math.max(rx, w ? st.rect[0] + 1 : st.rect[2] - 1), z1], z0, z1, shops: [] };
      row.yard = w ? [st.rect[0] + 1, z0, rx, z1] : [rx, z0, st.rect[2] - 1, z1];
      // three or four shops of 5.4–9.4 m along the avenue
      const n = 3 + (rand() < 0.35 ? 1 : 0); let cut = [0];
      for (let i = 1; i < n; i++) cut.push(i / n + (rand() - 0.5) * 0.12);
      cut.push(1);
      for (let i = 0; i < n; i++) row.shops.push({ z0: z0 + (z1 - z0) * cut[i] + 0.15, z1: z0 + (z1 - z0) * cut[i + 1] - 0.15, trade: TRADES[Math.floor(rand() * TRADES.length)], seed: Math.floor(rand() * 1e6), storeys: rand() < 0.3 ? 2 : 1 });
      SHOPS.push(row);
    }
  }
  // the two shops with a furnished interior (§21): the tea house and the pharmacy, the first wide-enough shops of the west side
  // from the avenue's mouth (a rule that follows the layout: it picks from whatever shops there are)
  const west = SHOPS.filter((r) => r.side === 'w').sort((a, b) => a.z0 - b.z0), all = west.flatMap((r) => r.shops.map((s) => ({ s, r })));
  const tea = all.find(({ s }) => s.z1 - s.z0 >= 7.0 && s.trade === 'tea') || all.find(({ s }) => s.z1 - s.z0 >= 7.0);
  if (tea) { tea.s.trade = 'tea'; tea.s.storeys = 1; tea.s.interior = 'teahouse'; }
  const med = all.find(({ s, r }) => s !== tea?.s && s.z1 - s.z0 >= 5.6 && r !== tea?.r && s.z0 > (tea?.s.z1 ?? 0) + 6 && s.trade === 'medicine') || all.find(({ s, r }) => s !== tea?.s && s.z1 - s.z0 >= 5.6 && r !== tea?.r && s.z0 > (tea?.s.z1 ?? 0) + 6);
  if (med) { med.s.trade = 'medicine'; med.s.storeys = 1; med.s.interior = 'pharmacy'; }
  return SHOPS;
}
/** The shops with a furnished interior: { kind, side, front, z0, z1, depth }. */
export const SHOP_DEPTH_BUILT = 8.4;
export function interiorShops() {
  const out = [];
  for (const r of shopRows()) for (const s of r.shops) if (s.interior) out.push({ kind: s.interior, side: r.side, front: r.front, z0: s.z0, z1: s.z1, depth: SHOP_DEPTH_BUILT, seed: s.seed });
  return out;
}
/** The courtyard houses furnished inside (§21): the n lod-0 houses nearest the avenue's mouth, whatever the layout. */
export function furnishedHouses(n = 5) {
  const d2 = (h) => ((h.rect[0] + h.rect[2]) / 2 + 30) ** 2 + ((h.rect[1] + h.rect[3]) / 2 - 225) ** 2;
  return [...houses()].filter((h) => h.lod === 0 && h.rect[2] - h.rect[0] >= 24).sort((a, b) => d2(a) - d2(b)).slice(0, n);
}
export function inShopRow(x, z, m = 0) { return shopRows().some((r) => inRect([Math.min(r.front, r.back, r.yard[0], r.yard[2]), r.z0, Math.max(r.front, r.back, r.yard[0], r.yard[2]), r.z1], x, z, m)); }

let WELLS = null;
/** The public wells of the lanes (§17): [x, z] on the lane's north edge, one lane in three, away from the avenue, the ring street and the temple. */
export function wells() {
  if (WELLS) return WELLS;
  WELLS = [];
  const rand = rng(1771), [b0, bz0, b1, bz1] = TEMPLE.belt;
  for (let z = Z_START; z <= RADIUS; z += HUTONG_PERIOD) {
   for (let tries = 0; tries < 3; tries++) {
    if (rand() < 0.45) continue;
    const x = -RADIUS + 60 + rand() * (2 * RADIUS - 120), p = [x, z + 1.1];
    if (Math.hypot(...p) > RADIUS - 40 || inRect(RING, p[0], p[1], 8) || inRect(AVENUE, p[0], p[1], 12) || inRect(TEMPLE.belt, p[0], p[1], 8) || inShopStrip(p[0], p[1], 6)) continue;
    if (STREET_X.some((sx) => Math.abs(x - sx) < 8)) continue;
    if (z + HUTONG_W > RING[1] && z < RING[3] && x > RING[0] - 30 && x < RING[2] + 30) continue;
    if (WELLS.some((w) => Math.hypot(w[0] - x, w[1] - p[1]) < 60)) continue;
    WELLS.push(p);
   }
  }
  return WELLS;
}
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
