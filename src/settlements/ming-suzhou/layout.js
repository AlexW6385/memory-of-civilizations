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
  { rect: [-215, 91, 215, 103], front: 'n', shops: 0 },
  { rect: [-215, 103, 215, 115], front: 's', shops: 0 },
  { rect: [-90, 42, -43, 54], front: 'n', shops: 0 },
  { rect: [-90, 56.8, -43, 62], front: 's', shops: 0.7 },
  { rect: [43, 42, 90, 54], front: 'n', shops: 0 },
  { rect: [43, 56.8, 90, 62], front: 's', shops: 0.7 },
  { rect: [76, -91, 90, 42], front: 'e', shops: 0.35 },
  { rect: [-91, -91, -77, 42], front: 'w', shops: 0.35 },
  { rect: [103, -215, 116, 68], front: 'w', water: true, shops: 0.1 },
  { rect: [116, -215, 128, 68], front: 'e', shops: 0 },
  { rect: [-116, -212, -104, 68], front: 'e', water: true, shops: 0.1 },
  { rect: [-128, -212, -116, 68], front: 'w', shops: 0 },
  { rect: [-91, -108, 90, -94.5], front: 's', shops: 0.2 },
  { rect: [-91, -91, -76, -80], front: 'n', shops: 0 },
  { rect: [76, -91, 90, -80], front: 'n', shops: 0 },
];

let LOTS = null;
/**
 * Every house of the quarter: { rect, front, storeys, shop, water, seed } (computed once).
 * Lots run along their strip, 4.5–8 m wide (one to two bays), left out where a bridge lands
 * or beyond the disc; now and then a lot stays open (a yard, a gate).
 */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1513);
  for (const S of STRIPS) {
    const [x0, z0, x1, z1] = S.rect, along = S.front === 'n' || S.front === 's';
    const a0 = along ? x0 : z0, a1 = along ? x1 : z1;
    let a = a0;
    while (a < a1 - 3) {
      const w = Math.min(a1 - a, 4.5 + rand() * 3.5);
      const r = along ? [a, z0, a + w - 0.12, z1] : [x0, a, x1, a + w - 0.12];
      a += w;
      const cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2;
      const far = Math.max(...[[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].map(([x, z]) => Math.hypot(x, z)));
      if (far > RADIUS - 14) continue;
      if (onBridge(cx, cz, 2) || rand() < 0.06) continue;
      if (inRect(GARDEN, cx, cz, 1) || inRect(RESIDENCE, cx, cz, 1)) continue;
      LOTS.push({ rect: r, front: S.front, storeys: rand() < 0.72 ? 2 : 1, shop: rand() < S.shops, water: !!S.water, seed: Math.floor(rand() * 1e6) });
    }
  }
  return LOTS;
}
/** Is (x, z) inside a house lot? */
export function inLot(x, z, m = 0) { return lots().some((l) => inRect(l.rect, x, z, m)); }

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
