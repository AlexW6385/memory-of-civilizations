// Kilwa Kisiwani about 1330 — the layout (docs/settlements/kilwa.md §2): the island town on its
// north shore — the Great Mosque in the middle of the town, the stone houses round it, the beach
// with dhows drawn up; Husuni Kubwa, the sultan's palace, on its high headland to the east (the
// harbour entrance to the north, the ocean to the east, the town to the west), terraces and a stair
// stepping down from it to the beach; mangroves, baobabs and coconut palms; the island ends at the
// disc's edge in the Indian Ocean. Pure data. +x east, +z south (the sea and the harbour to the north).

export const RADIUS = 340;
export const SEA = -2.5, RIM = -12;
export const MOSQUE = [-40, -10, 20, 40];

// Husuni Kubwa (docs/settlements/kilwa.md §11): the residential core of four courts at the north
// end of the headland, the South Court (46 × 46 m) behind it; the headland's top at PY.
export const PY = 10;
export const CORE = [142, -150, 194, -100];
export const SOUTH = [145, -98, 191, -52];
export const PALACE = [CORE[0], CORE[1], CORE[2], SOUTH[3]];
// the courts of the core (open areas, plan metres) and how deep each is sunk below PY
export const COURTS = {
  pool: { rect: [149.2, -146, 162.2, -133], sunk: 0.8 },            // the bathing court, 13 m square, its arcade round three sides
  audience: { rect: [146, -124, 159, -109], sunk: 0 },             // 13 × 15 m, the pavilion on its east side up nine steps
  domestic: { rect: [173, -124.6, 190, -104], sunk: 0.4 },          // the well; servants' rooms south, living rooms north and east
  palace: { rect: [177.2, -146, 187.2, -128.4], sunk: 1.0 },            // the private court, sunk ~1 m by four steps, walkways either side
};
export const POOL = [155.7, -139.5, 4];                             // the octagon's centre and its inner half-width (8 m across)
// the terraces: the headland's top, the lower terrace on the north between it and the beach, the
// beach at the cliff's foot; the terrace in front of the South Court's gate stepping down to the town
export const TERRACES = [
  { id: 'top', rect: [138, -156, 198, -48], y: PY, fall: [0.5, 7, 0.5, 7] },        // falls: north, east, south, west
  { id: 'north', rect: [137.5, -165.4, 200, -156], y: 5.0, fall: [0.5, 7, 3, 0.5] },
  { id: 'beach', rect: [120, -176, 204, -165.4], y: 0.55, fall: [12, 8, 1, 8] },
  { id: 'cove', rect: [124, -165.4, 137.5, -153], y: 0.55, fall: [1, 1, 3, 8] },     // the sand under the cliff, west of the stair
  { id: 'gate', rect: [154, -48, 182, -37], y: 6.6, fall: [1, 0.5, 0.5, 0.5] },
];
// the retaining walls, built just outside the edge of the terrace they hold (coral rag): [x0, z0, x1, z1, top]
export const WALL_T = 0.6;
// the stair to the beach at the core's north-west corner: two flights at about a right angle
// (Archnet), here west along the foot of the top terrace's wall, then north down to the sand
export const STAIR = {
  head: [150.5, -159.4, 153.5, -156],             // the landing at the top, level with PY
  a: { rect: [140.5, -158.8, 150.5, -156.6], y0: 5.0, y1: PY, dir: 'e' },    // the first flight, rising east
  mid: [137.5, -159.4, 140.5, -156.6],            // the turn, on the north terrace
  bHead: [133.8, -159.4, 136.9, -156.6],          // the second flight's head, through the terrace's west wall
  b: { rect: [134.3, -167.4, 136.9, -159.4], y0: 0.55, y1: 5.0, dir: 's' },  // the second flight, rising south
};
export const BEACH_MOSQUE = [127.6, -173.6, 132.2, -167.4];   // the small mosque at the stair's foot, facing north
// the gate terrace's stairs: from the town up to the terrace, from the terrace up to the South Court's gate
export const GATE_STAIRS = [
  { rect: [165, -37, 171, -29.5], y1: 6.6, dir: 'n' },
  { rect: [165, -47.4, 171, -42], y0: 6.6, y1: PY, dir: 'n' },
];

export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const shoreZ = (x) => -120 - 15 * Math.sin(x / 60) - 30 * smooth(100, 145, x);
/** How far outside the rectangle (x, z) lies, each side scaled by its own fall (0 inside, 1 at the foot). */
function outside(T, x, z) {
  const [x0, z0, x1, z1] = T.rect, [fn, fe, fs, fw] = T.fall;
  const u = Math.max(0, (x0 - x) / fw, (x - x1) / fe), v = Math.max(0, (z0 - z) / fn, (z - z1) / fs);
  return Math.hypot(u, v);
}
/** The town's ground: a low plateau, the beach on the north; the sea round about. */
function townHeight(x, z) {
  const r = Math.hypot(x, z), sz = shoreZ(x);
  const h = 2 + 2 * smooth(sz, sz + 200, z);
  const beach = smooth(sz + 10, sz - 18, z), edge = smooth(RADIUS - 90, RADIUS - 25, r);
  const sea = Math.max(beach, edge);
  return h * (1 - sea) + RIM * sea;
}
/** The ground: the town, and over it the headland's terraces with their cliffs (to the rim level). */
export function height(x, z) {
  let h = townHeight(x, z);
  if (x < 100 || z > 0) return h;
  for (const T of TERRACES) {
    const o = outside(T, x, z);
    if (o >= 1) continue;
    h = Math.max(h, T.y + (RIM - T.y) * smooth(0, 1, o));
  }
  // the sunken courts and the pool: the rock cut down under them (their floors are built solid over it)
  for (const c of Object.values(COURTS)) if (c.sunk && inRect(c.rect, x, z, 0.3)) h = Math.min(h, PY - c.sunk - (c === COURTS.pool ? 2.4 : 0.3));
  return h;
}
/** Is (x, z) on the headland's built terraces (no planting, paved)? */
export const onHeadland = (x, z, m = 0) => TERRACES.some((T) => T.id !== 'beach' && inRect(T.rect, x, z, m));
export const inSea = (x, z) => height(x, z) < SEA - 0.2;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
// The streets of the stone town (docs/settlements/kilwa.md §17), kept clear of houses: the market street (soko) along the
// harbour side of the town, the street before the Great Mosque's north door, the spine between them, and the lanes down to
// the beach, three of them to the landing places of the trade. Rectangles [x0, z0, x1, z1].
export const SOKO = [-225, -89.6, 105, -79];
export const MOSQUE_STREET = [-225, -35, 105, -24.5];
export const LANES = [-175, -141, -100, -75, -45, 45].map((x) => [x - 2.6, -112, x + 2.6, -24.5]);
export const SPINE = [-18, -89.6, -11.5, -24.5];
export const STREETS = [SOKO, MOSQUE_STREET, SPINE, ...LANES];
/** The open harbour water the sailing boats work in, north of the beach (clear of the dhows at anchor). */
export const HARBOUR = [-200, -215, 90, -185];
/**
 * The stone town's houses in rows of back-to-back pairs (docs/settlements/kilwa.md §18): a row's front on the north (the
 * house's street, `flip` false) or on the south (`flip`: the house built turned about its middle line), the pair sharing its
 * back wall, narrow alleys (2.2 m) between the pairs where the fronts face each other; party walls side by side (houses
 * of 6.5–11.5 m, 8 cm apart), cut by the lanes. The first row of the market block fronts the soko, the last the footpath
 * north of the mosque street; south of the mosque street the first row fronts that street. Thinner with the distance
 * from the town's heart; none on the beach side of the soko (the landing places and the boats).
 */
export const ROW_D = 9.4, ALLEY = 2.2;
const BLOCKS = [
  // the market block: its first row (front north) on the soko, a pair back to back, the alley, a pair
  [-78.4, -69.0, false], [-69.0, -59.6, true], [-57.4, -48.0, false], [-48.0, -38.6, true],
];
// south of the mosque street: pairs with an alley between each
for (let z = -23.9; z < 125; z += 2 * ROW_D + ALLEY) BLOCKS.push([z, z + ROW_D, false], [z + ROW_D, z + 2 * ROW_D, true]);
/** The alleys between the pairs of rows (the fronts face each other across them): rectangles [x0, z0, x1, z1]. */
export const ALLEYS = [];
for (let i = 1; i < BLOCKS.length; i++) if (Math.abs(BLOCKS[i][0] - BLOCKS[i - 1][1] - ALLEY) < 1e-6) { const z0 = BLOCKS[i - 1][1], z1 = BLOCKS[i][0]; if (z1 > MOSQUE[1] - 7 && z0 < MOSQUE[3] + 7) ALLEYS.push([-222, z0, MOSQUE[0] - 7, z1], [MOSQUE[2] + 7, z0, 124, z1]); else ALLEYS.push([-222, z0, 124, z1]); }
const heart = (cx, cz) => Math.hypot(cx + 45, cz - 10);
/** Is the stone house of this lot furnished and open to the visitor? (every house within 95 m of the town's heart but one in seven; beyond it one in eight to 140 m) */
export const isOpen = (l) => (l.dh < 95 ? l.seed % 7 !== 0 : l.dh < 140 && l.seed % 8 === 0);
let LOTS = null;
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1330);
  const cuts = [...LANES, SPINE];
  for (const [z0, z1, flip] of BLOCKS) {
    const d = z1 - z0, cz = (z0 + z1) / 2;
    // the market block's rows lie between the soko and the mosque street; further south the SPINE does not reach
    for (let x = -222; x < 124;) {
      const w = 6.5 + rand() * 5;
      let hit = null;
      for (const r of cuts) if (cz > r[1] - 0.2 && cz < r[3] + 0.2 && x + w > r[0] - 0.35 && x < r[2] + 0.35) hit = r;
      if (hit) { x = hit[2] + 0.35; continue; }
      const x1 = x + w, cx = (x + x1) / 2, dh = heart(cx, cz);
      const ys = [[x, z0], [x1, z0], [x, z1], [x1, z1]].map(([a, b]) => height(a, b));
      const skipP = 0.04 + 0.72 * smooth(100, 200, dh), r1 = rand(), seed = Math.floor(rand() * 1e6);
      x = x1 + 0.08;
      if (dh > 205 || Math.min(...ys) < 1.3 || r1 < skipP) continue;
      if (x1 > MOSQUE[0] - 7 && x1 - w < MOSQUE[2] + 7 && z1 > MOSQUE[1] - 7 && z0 < MOSQUE[3] + 7) continue;
      if (STREETS.some((r) => cx + w / 2 > r[0] - 0.3 && cx - w / 2 < r[2] + 0.3 && cz + d / 2 > r[1] - 0.3 && cz - d / 2 < r[3] + 0.3)) continue;
      LOTS.push({ rect: [x1 - w, z0, x1, z1], seed, flip, y: Math.max(...ys), low: Math.min(...ys), dh });
    }
  }
  return LOTS;
}
// a spatial index: the lots are many
let GRID = null;
const GC = 16;
export function inLot(x, z, m = 0) {
  if (!GRID) {
    GRID = new Map();
    for (const l of lots()) for (let i = Math.floor((l.rect[0] - 10) / GC); i <= Math.floor((l.rect[2] + 10) / GC); i++) for (let j = Math.floor((l.rect[1] - 10) / GC); j <= Math.floor((l.rect[3] + 10) / GC); j++) { const k = i + ',' + j; (GRID.get(k) || GRID.set(k, []).get(k)).push(l); }
  }
  const L = GRID.get(Math.floor(x / GC) + ',' + Math.floor(z / GC));
  return !!L && L.some((l) => inRect(l.rect, x, z, m));
}
