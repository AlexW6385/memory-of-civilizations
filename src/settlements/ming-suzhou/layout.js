// Ming Suzhou — the layout of the settlement (docs/settlements/ming-suzhou.md §2, §6): the
// Humble Administrator's Garden and its owner's residence in the middle, and round them a quarter
// of the canal city — streets running beside canals ("water and land side by side"), houses with
// their backs or fronts on the water, stone bridges. Pure data and functions, shared by the ground
// (ground.js), the plans (plan.js, town.js) and the planting.
// Coordinates: metres, +x east, +z south, origin at the disc's centre. Water levels below the streets.

export const RADIUS = 215;
export const LEVEL = { street: 0, garden: 0.15, canal: -0.75, canalBed: -2.6, pond: -0.35, pondBed: -1.6 };

const sm = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

// ── the canals and the streets beside them ───────────────────────────────────
/** Canals: [x0, z0, x1, z1] (water between their stone walls). */
export const CANALS = [
  [-215, 68, 215, 76],             // the south canal, east–west, its street on the north bank
  [96, -215, 103, 68],             // the east canal, its street on the west bank
  [-104, -215, -97, 68],           // the west canal, its street on the east bank
];
/** Streets and lanes: [x0, z0, x1, z1] (paved with bluestone). */
export const STREETS = [
  [-215, 62, 215, 68],             // the south street, beside the south canal
  [90, -215, 96, 62],              // the east street, beside the east canal
  [-97, -215, -91, 62],            // the west street, beside the west canal
  [-91, -94.5, 90, -91],           // the north lane, behind the garden
  [-91, 54, -43, 56.8],            // lanes between the houses (fire lanes, bilong)
  [43, 54, 90, 56.8],
  [-215, 88, 215, 91],             // the back lane south of the canal houses
  [-215, -215, -116, -212],
];
// ── the quarter continues beyond the first ring: back streets behind the canal rows, lanes (2.4 m) between rows of houses
// running off to the rim, a few cross alleys. The rows are the STRIPS built below; both are pure data.
const REACH = RADIUS - 3, LANE = 1.2, PITCH = 26.4;
STREETS.push([128, -205, 134, 62], [-134, -205, -128, 62], [-215, 119, 215, 125]);        // the back streets east and west, and south of the canal rows
const OUTER = [];                                      // the rows of the outer districts (added to STRIPS)
for (let k = 0; k < 10; k++) {                         // east and west: lanes running east–west, rows of houses facing them
  const zc = -190 + PITCH * k;
  for (const sg of [1, -1]) {
    const a = sg > 0 ? 146 : -REACH, b = sg > 0 ? REACH : -146, c = sg > 0 ? 134 : -REACH, d = sg > 0 ? REACH : -134;
    STREETS.push([c, zc - LANE, d, zc + LANE]);
    OUTER.push({ rect: [a, zc - LANE - 12, b, zc - LANE], front: 's', shops: 0.05, outer: true }, { rect: [a, zc + LANE, b, zc + LANE + 12], front: 'n', shops: 0.05, outer: true });
  }
}
OUTER.push({ rect: [134, -205, 146, 60], front: 'w', shops: 0.2, outer: true }, { rect: [-146, -205, -134, 60], front: 'e', shops: 0.2, outer: true });
// south: rows behind the street at z 119–125, lanes at 150.6, 177.4, 204.2
OUTER.push({ rect: [-215, 125, 215, 137], front: 'n', shops: 0.3, outer: true }, { rect: [-215, 137, 215, 149.4], front: 's', shops: 0.05, outer: true },
  { rect: [-215, 151.8, 215, 163.8], front: 'n', shops: 0.05, outer: true }, { rect: [-215, 163.8, 215, 176.2], front: 's', shops: 0.05, outer: true },
  { rect: [-215, 178.6, 215, 190.6], front: 'n', shops: 0.05, outer: true }, { rect: [-215, 190.6, 215, 203], front: 's', shops: 0.05, outer: true });
for (const zc of [150.6, 177.4, 204.2]) STREETS.push([-215, zc - LANE, 215, zc + LANE]);
// north of the north lane: lanes between the canals' streets at z −121.8 − 26.4 k
for (let k = 0; k < 4; k++) {
  const zc = -121.8 - PITCH * k;
  STREETS.push([-91, zc - LANE, 90, zc + LANE]);
  OUTER.push({ rect: [-91, zc - LANE - 12, 90, zc - LANE], front: 's', shops: 0.05, outer: true });
  OUTER.push({ rect: [-91, zc + LANE, 90, zc + LANE + 12], front: 'n', shops: 0.05, outer: true });
}
// cross alleys: between the rows, through to the rim
for (const x of [-150, -75, 0, 75, 150]) STREETS.push([x - LANE, 91, x + LANE, 210]);
for (const x of [-55, 0, 55]) STREETS.push([x - LANE, -210, x + LANE, -96]);
for (const x of [-178, 178]) STREETS.push([x - LANE, -205, x + LANE, 60]);
// the north (north.js): the Bao'en Temple's court and the city wall with its moat and gate road
// are kept free of houses and lanes; the canal streets pass the wall by their gates
export const TEMPLE_COURT = [-76, -159.5, -4, -111.8];
export const NORTH_KEEP = [TEMPLE_COURT, [-120, -184, 120, -160], [-92, -192, 92, -160], [13, -192, 21, -108]];
const GATE_STREETS = new Set([STREETS[1], STREETS[2]]);       // the east and west canal streets
const NORTH_CUT = [[-77, -160.5, -3, -110.8], [-121, -215, 121, -160]];
/** r minus the rectangle k, along r's long axis (the pieces left, longer than 2 m). */
function cutRect(r, k) {
  if (!(r[0] < k[2] && r[2] > k[0] && r[1] < k[3] && r[3] > k[1])) return [r];
  const out = [];
  if (r[2] - r[0] >= r[3] - r[1]) { if (k[0] - r[0] > 2) out.push([r[0], r[1], k[0], r[3]]); if (r[2] - k[2] > 2) out.push([k[2], r[1], r[2], r[3]]); }
  else { if (k[1] - r[1] > 2) out.push([r[0], r[1], r[2], k[1]]); if (r[3] - k[3] > 2) out.push([r[0], k[3], r[2], r[3]]); }
  return out;
}
{
  const kept = [];
  for (const r of STREETS) { if (GATE_STREETS.has(r)) { kept.push(r); continue; } let pieces = [r]; for (const k of NORTH_CUT) pieces = pieces.flatMap((q) => cutRect(q, k)); kept.push(...pieces); }
  STREETS.length = 0; STREETS.push(...kept);
}
/** Stone bridges over the canals: { at [x, z], across ('z': over an east–west canal), span, width }. */
export const BRIDGES = [
  { at: [-150, 72], across: 'z', span: 8, width: 4.2 },
  { at: [-60, 72], across: 'z', span: 8, width: 4 },
  { at: [0, 72], across: 'z', span: 8, width: 5 },
  { at: [60, 72], across: 'z', span: 8, width: 4 },
  { at: [150, 72], across: 'z', span: 8, width: 4.2 },
  { at: [99.5, -30], across: 'x', span: 7, width: 3.6 },
  { at: [99.5, -130], across: 'x', span: 7, width: 3.6 },
  { at: [-100.5, -60], across: 'x', span: 7, width: 3.6 },
  { at: [-100.5, 20], across: 'x', span: 7, width: 3.6 },
];

// ── the garden and the residence ─────────────────────────────────────────────
/** The garden's walls (its central part, the Ming garden) and the residence south of it. */
export const GARDEN = [-74, -80, 74, 24];
export const RESIDENCE = [-40, 24, 40, 60];

/** The pond: a union of ellipses { c, r } (water inside, minus the islands). */
export const POND = [
  { c: [0, -44], r: [41, 15] },
  { c: [-36, -38], r: [15, 12] },
  { c: [35, -46], r: [17, 12] },
  { c: [-47, -18], r: [4.5, 16] },          // the inlet south under Xiaofeihong to Xiaocanglang
  { c: [-49, -61], r: [11, 8] },            // the bay under Jianshan Lou
  { c: [-47, 0], r: [6, 4.5] },             // the water before Xiaocanglang
];
/** Islands in the pond, with their hills (m above the garden). */
export const ISLANDS = [
  { c: [-12, -49], r: [14, 7.5], h: 3.4 },  // the west island: the Snowy Fragrance pavilion on its hill
  { c: [17, -51], r: [10.5, 6.5], h: 2.6 }, // the east island: the Waiting for Frost pavilion
  { c: [-27, -31], r: [4.6, 4.2], h: 0.55 },// the islet of the Lotus Breeze pavilion
];
/** Rockery mounds in the garden away from the water: { c, r, h }. */
export const MOUNDS = [
  { c: [58, -66], r: [9, 7], h: 2.2 },      // under the Green Ripples pavilion, north-east
  { c: [-62, -30], r: [6, 8], h: 1.4 },
  { c: [28, -12], r: [6, 4], h: 1.2 },
];

/** Signed distance (m, approximate) from the edge of a union of ellipses: negative inside. */
function ellDist(shapes, x, z) {
  let best = Infinity;
  for (const { c, r } of shapes) {
    const dx = (x - c[0]) / r[0], dz = (z - c[1]) / r[1];
    best = Math.min(best, (Math.hypot(dx, dz) - 1) * Math.min(r[0], r[1]));
  }
  return best;
}
/** Distance from the pond's shore (negative in the water; the islands are land). */
export function pondDistance(x, z) {
  if (x < GARDEN[0] || x > GARDEN[2] || z < GARDEN[1] || z > GARDEN[3]) return 99;
  return Math.max(ellDist(POND, x, z), -ellDist(ISLANDS, x, z));
}
/** Distance outside the nearest canal (negative inside it). */
export function canalDistance(x, z) {
  let best = Infinity;
  for (const [x0, z0, x1, z1] of CANALS) {
    const dx = Math.max(x0 - x, x - x1), dz = Math.max(z0 - z, z - z1);
    best = Math.min(best, dx > 0 || dz > 0 ? Math.hypot(Math.max(dx, 0), Math.max(dz, 0)) : Math.max(dx, dz));
  }
  return best;
}
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const onStreet = (x, z, m = 0) => STREETS.some((r) => inRect(r, x, z, m));
export const onBridge = (x, z, m = 0) => BRIDGES.some((b) => {
  const [bx, bz] = b.at, L = b.span / 2 + 5, W = b.width / 2;
  return b.across === 'z' ? Math.abs(x - bx) < W + m && Math.abs(z - bz) < L + m : Math.abs(z - bz) < W + m && Math.abs(x - bx) < L + m;
});

// ── the houses ───────────────────────────────────────────────────────────────
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/**
 * Strips of house lots along the streets and canals: { rect, front ('n'|'s'|'e'|'w': the side they
 * face), water (their back or front stands in a canal wall), shops (share of shop fronts) }.
 */
const STRIPS = [
  { rect: [-215, 76, 215, 88], front: 'n', water: true, shops: 0.15 },     // "every house pillowed on the river"
  { rect: [-215, 91, 215, 105], front: 'n', shops: 0.04 },
  { rect: [-215, 105, 215, 119], front: 's', shops: 0.04 },
  { rect: [-90, 42, -43, 54], front: 'n', shops: 0 },
  { rect: [-90, 56.8, -43, 62], front: 's', shops: 0.7 },
  { rect: [43, 42, 90, 54], front: 'n', shops: 0 },
  { rect: [43, 56.8, 90, 62], front: 's', shops: 0.7 },
  { rect: [76, -80, 90, 42], front: 'e', shops: 0.35 },
  { rect: [-91, -80, -77, 42], front: 'w', shops: 0.35 },
  { rect: [103, -215, 116, 68], front: 'w', water: true, shops: 0.1 },
  { rect: [116, -215, 128, 68], front: 'e', shops: 0 },
  { rect: [-116, -212, -104, 68], front: 'e', water: true, shops: 0.1 },
  { rect: [-128, -212, -116, 68], front: 'w', shops: 0 },
  { rect: [-91, -108, 90, -94.5], front: 's', shops: 0.2 },
  { rect: [-91, -91, -76, -80], front: 'n', shops: 0 },
  { rect: [76, -91, 90, -80], front: 'n', shops: 0 },
];

let LOTS = null, GRID = null;
const TRADES = ['cloth', 'tea', 'rice', 'medicine', 'lacquer', 'books'];
/**
 * Every house of the quarter (computed once): { rect, front, storeys, shop, trade, water, seed, kind
 * ('row' | 'court' | 'grand' | 'yard' | 'simple'), roof ('gable' | 'horse' | 'guanyin' | 'hip'),
 * bays, detail (2 full … 0 cheap), overhang, balcony, tone }. Lots run along their strip, one to
 * four bays wide (3.4–15 m) and of differing depth (a deep house has courts behind its front);
 * they stop at lanes and alleys, thin out toward the rim, where they sink to one storey and give
 * way to walled yards with trees (the city goes on, under the mist).
 */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1513), pickW = (w) => { let t = rand() * w.reduce((a, b) => a + b[1], 0); for (const [v, p] of w) if ((t -= p) < 0) return v; return w[0][0]; };
  for (const S of [...STRIPS, ...OUTER]) {
    const [x0, z0, x1, z1] = S.rect, along = S.front === 'n' || S.front === 's';
    const a0 = along ? x0 : z0, a1 = along ? x1 : z1, depth = along ? z1 - z0 : x1 - x0;
    // lanes and streets crossing the strip cut it: their stretches along the strip are gaps
    const gaps = STREETS.filter((r) => r[0] < x1 && r[2] > x0 && r[1] < z1 && r[3] > z0 && (along ? r[1] <= z0 + 0.5 || r[3] >= z1 - 0.5 || (r[3] - r[1]) > 3 : r[0] <= x0 + 0.5 || r[2] >= x1 - 0.5 || (r[2] - r[0]) > 3))
      .map((r) => (along ? [r[0] - 0.3, r[2] + 0.3] : [r[1] - 0.3, r[3] + 0.3])).filter(([g0, g1]) => g1 - g0 < 6 || true).sort((p, q) => p[0] - q[0]);
    let a = a0, prevGap = false;
    while (a < a1 - 3) {
      const g = gaps.find(([g0, g1]) => a + 3 > g0 && a < g1);
      if (g) { a = g[1]; prevGap = true; continue; }
      const bays = pickW(S.outer ? [[1, 0.4], [2, 0.45], [3, 0.15]] : [[1, 0.3], [2, 0.42], [3, 0.2], [4, 0.08]]);
      let w = bays * 3.4 + (rand() - 0.5) * 1.1 + (bays === 4 ? 1.2 : 0);
      const nextGap = gaps.find(([g0]) => g0 > a && g0 < a + w + 2.5);
      if (nextGap) w = Math.max(3.4, nextGap[0] - a);
      w = Math.min(w, a1 - a);
      const cornerLot = prevGap || !!nextGap || a + w > a1 - 3.1;
      prevGap = false;
      const d = Math.max(5, depth * (0.66 + 0.34 * rand()));
      const r = S.front === 'n' ? [a, z0, a + w - 0.12, z0 + d] : S.front === 's' ? [a, z1 - d, a + w - 0.12, z1] : S.front === 'e' ? [x1 - d, a, x1, a + w - 0.12] : [x0, a, x0 + d, a + w - 0.12];
      a += w;
      const cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2;
      const far = Math.max(...[[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].map(([x, z]) => Math.hypot(x, z)));
      const rr = Math.hypot(cx, cz);
      if (far > RADIUS - 8) continue;
      if (onBridge(cx, cz, 2) || rand() < 0.05 + 0.3 * sm(168, 205, rr)) continue;
      if (inRect(GARDEN, cx, cz, 1) || inRect(RESIDENCE, cx, cz, 1)) continue;
      const L = along ? r[2] - r[0] : r[3] - r[1], dd = along ? r[3] - r[1] : r[2] - r[0], fromGate = Math.hypot(cx, cz - 40);
      const detail = fromGate < 105 ? 2 : fromGate < 150 ? 1 : 0;
      const edge = sm(150, 196, rr);                              // toward the rim: lower, walled yards
      let kind = 'row';
      if (rand() < 0.22 * edge + 0.1 * (rr > 190) && !S.water) kind = 'yard';
      else if (detail === 0) kind = 'simple';
      else if (dd >= 11.4 && L >= 9.4 && !S.water && rand() < 0.45) kind = 'grand';
      else if (dd >= 9 && L >= 3.8 && rand() < 0.7) kind = 'court';
      const shop = kind !== 'yard' && kind !== 'grand' && rand() < S.shops;
      const storeys = kind === 'yard' ? 1 : rand() < 0.72 - 0.75 * edge ? 2 : (kind === 'grand' && rand() < 0.5 ? 3 : 1);
      const roll = rand();
      let roof = roll < 0.46 ? 'gable' : roll < 0.78 ? 'horse' : roll < 0.87 ? 'guanyin' : 'hip';
      if (cornerLot && rand() < 0.6) roof = 'hip';
      if (kind === 'simple' && roof === 'guanyin') roof = 'horse';
      if (L < 4.6 && roof === 'guanyin') roof = 'gable';
      LOTS.push({
        rect: r, front: S.front, storeys: storeys === 3 ? 2 : storeys, shop, water: !!S.water, seed: Math.floor(rand() * 1e6), kind, roof, bays, detail,
        trade: shop ? TRADES[Math.floor(rand() * TRADES.length)] : null,
        overhang: storeys > 1 && !S.water && rand() < (shop ? 0.5 : 0.2),
        balcony: !!S.water && storeys > 1 ? (rand() < 0.4 ? 'water' : rand() < 0.5 ? 'upper' : null) : null,
        tone: pickW([['white', 5], ['grey', 3], ['patched', 2], ['damp', 1.2]]),
        storeysTall: storeys === 3, edge,
      });
    }
  }
  // (none in the temple's court or under the wall: north.js)
  { const ov = (a, b) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1]; const keep = LOTS.filter((l) => !NORTH_KEEP.some((k) => ov(l.rect, k))); LOTS.length = 0; LOTS.push(...keep); }
  return LOTS;
}
/** Is (x, z) inside a house lot? */
export function inLot(x, z, m = 0) {
  if (!GRID) {
    GRID = new Map();
    for (const l of lots()) for (let i = Math.floor((l.rect[0] - 4) / 16); i <= Math.floor((l.rect[2] + 4) / 16); i++) for (let j = Math.floor((l.rect[1] - 4) / 16); j <= Math.floor((l.rect[3] + 4) / 16); j++) { const k = i * 4096 + j; (GRID.get(k) || GRID.set(k, []).get(k)).push(l); }
  }
  const c = GRID.get(Math.floor(x / 16) * 4096 + Math.floor(z / 16));
  return !!c && c.some((l) => inRect(l.rect, x, z, m));
}

// ── the garden's buildings (their details in plan.js; docs/settlements/ming-suzhou.md §4) ──
/**
 * Halls, pavilions, galleries and bridges of the garden and the residence: id, kind and where.
 * Rectangles [x0, z0, x1, z1]; pavilions by centre and size. `y`: floor above the garden.
 */
export const BUILDINGS = {
  // `hall`: how each hall's walls are made (ming_hall's walls / doors / lat / winSide / winWall, docs/settlements/ming-suzhou.md §4)
  yuanxiang: { kind: 'hall4', rect: [-7.2, -19.5, 7.2, -10], y: 0.75,                    // Hall of Distant Fragrance: long windows on all four sides
    hall: { winSide: 'door', doors: ['s'], lat: { door: 'lattice_bubujin', window: 'lattice_bubujin', e: 'lattice_ice', w: 'lattice_ice' } } },
  yiyu: { kind: 'hall', rect: [-25, -18.5, -15, -12], y: 0.45, front: 'n',               // Leaning Jade Pavilion (xuan): latticed to the pond, a plastered back and west wall
    hall: { walls: { s: 'plaster', w: 'plaster' }, winWall: true, lat: { n: 'lattice_ice', e: 'lattice_ice', window: 'lattice_haitang' } } },
  xiangzhou: { kind: 'boat', rect: [-58, -40.5, -44, -35.5], y: 0.35 },                 // the Fragrant Isle, a stone boat
  xiaofeihong: { kind: 'covered_bridge', rect: [-53.5, -15.2, -40.5, -12.6], y: 0.45 },  // Small Flying Rainbow
  xiaocanglang: { kind: 'water_pavilion', rect: [-52, 2.5, -42, 7.5], y: 0.4,           // Little Canglang
    hall: { winSide: 'door', lat: 'lattice_wan' } },
  jianshan: { kind: 'lou', rect: [-63, -71, -53, -63], y: 0.35 },                        // Mountain-in-View Tower
  hefeng: { kind: 'hex', c: [-27, -31], r: 2.5, y: 0.7 },                                 // Lotus Breeze on Four Sides
  xuexiang: { kind: 'pav_rect', c: [-12, -50.5], w: 4.2, d: 3.0, y: 3.5 },                // Snowy Fragrance and Rosy Clouds
  daishuang: { kind: 'hex', c: [17, -52], r: 2.1, y: 2.75 },                             // Waiting for Frost
  wuzhu: { kind: 'pav_square', c: [57, -44], w: 6.0, y: 0.45, moons: true },              // Wutong and Bamboo Retreat
  lvyi: { kind: 'pav_square', c: [60, -68], w: 3.4, y: 2.35 },                           // Green Ripples
  linglong: { kind: 'hall', rect: [35, -7.5, 45, -2], y: 0.4, front: 'w',                // the Exquisite Jade hall, in the loquat court: plastered on three sides
    hall: { winWall: true, lat: { door: 'lattice_lantern', window: 'lattice_haitang' } } },
};
/** Covered galleries (lang): polylines with their floor height, 2 m wide. */
export const GALLERIES = [
  [[-69, 18], [-69, -6], [-66, -10], [-66, -30], [-69, -36], [-69, -58], [-64, -62]],
  [[69, 18], [69, -20], [66, -26], [66, -62], [69, -74]],
  [[-60, 18], [-30, 18], [-26, 14], [26, 14], [30, 18], [60, 18]],
  [[-44, -18], [-38, -22], [-30, -22]],
];
/** Stone bridges in the garden: polylines (zigzag or straight), their width. */
export const GARDEN_BRIDGES = [
  { pts: [[-22, -27], [-24.5, -29]], w: 1.4 },                                  // to the Lotus Breeze islet from the south shore
  { pts: [[-27, -35], [-24, -38], [-20, -40], [-18, -42.5]], w: 1.3 },          // zigzag on to the west island
  { pts: [[1.5, -49], [6.5, -50]], w: 1.4 },                                    // between the two islands
  { pts: [[27.5, -51], [32, -54], [36, -56], [40, -57.5]], w: 1.3 },            // from the east island to the north-east shore
  { pts: [[-28, -23], [-27, -26.7]], w: 1.4 },
];
/**
 * Paths up the islands' hills among piled stone (ming_rockery), from the bridges' landings to the
 * hill pavilions' platforms: { pts [[x, z]…], end (the tread height at the last point, the
 * platform's; elsewhere the ground's), cave (where a stone lies overhead, 0…1) }.
 */
export const ROCK_PATHS = [
  { pts: [[-18, -42.5], [-19.5, -44.5], [-18.5, -46.6], [-16, -47.6], [-13, -48.3]], end: 3.65, cave: 0.42 },   // up to Snowy Fragrance
  { pts: [[6.5, -50], [9, -49.2], [11.5, -49.8], [14.7, -51.4]], end: 2.9 },                                    // to Waiting for Frost from the west
  { pts: [[27.5, -51], [25, -50], [22.2, -50.5], [19.7, -51.5]], end: 2.9 },                                    // and from the east
];
export function nearRockPath(x, z, m = 1.6) {
  for (const { pts } of ROCK_PATHS) for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1], vx = bx - ax, vz = bz - az, l2 = vx * vx + vz * vz;
    const t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / l2));
    if (Math.hypot(x - ax - vx * t, z - az - vz * t) < m) return true;
  }
  return false;
}
/** The loquat court's walls (with a moon gate on the west). */
export const LOQUAT_COURT = [30, -13, 50, 8];

/** Footprints kept free of planting and of the pond's rockery: the buildings' rectangles, grown a little. */
export const FOOTPRINTS = Object.values(BUILDINGS).map((b) => (b.rect ? b.rect : [b.c[0] - (b.r || b.w / 2) - 1, b.c[1] - (b.r || (b.d || b.w) / 2) - 1, b.c[0] + (b.r || b.w / 2) + 1, b.c[1] + (b.r || (b.d || b.w) / 2) + 1]));
export function nearGallery(x, z, m = 1.4) {
  for (const L of GALLERIES) for (let i = 0; i + 1 < L.length; i++) {
    const [ax, az] = L[i], [bx, bz] = L[i + 1], vx = bx - ax, vz = bz - az, l2 = vx * vx + vz * vz;
    const t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / l2));
    if (Math.hypot(x - ax - vx * t, z - az - vz * t) < m) return true;
  }
  return false;
}
export const smooth = sm;
