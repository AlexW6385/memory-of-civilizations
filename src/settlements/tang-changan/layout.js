// Tang Chang'an (c. 750) — the layout (docs/settlements/tang-changan.md §2): Zhuque Avenue north–south through the origin between
// two rows of ward walls, with its ditches and locusts; the broad cross street A; walled wards of 170 m with cross-shaped lanes and
// four gates (none onto the avenue); Daci'en Temple and the Big Wild Goose Pagoda east of the avenue, the West Market opposite,
// the Daoist temple to the north-east, courtyard houses in the rest. Pure data. +x east, +z south.

export const RADIUS = 520;
export const AVE = 52;                                    // half the avenue between the ward walls
export const DITCH = { in: 44, out: 47.5, bed: -1.6, water: -0.9 };      // |x| of the ditch's edges
export const WARD = 170, STREET = 30, WALL = 2.6;
export const CROSS = 25;                                  // half the width of cross street A
export const LANE = 10;                                   // the wards' cross-shaped lanes
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const rectsMeet = (a, b, m = 0) => a[0] - m < b[2] && a[2] + m > b[0] && a[1] - m < b[3] && a[3] + m > b[1];

/** The streets between the wards: [x0, z0, x1, z1]. */
export const STREETS = (() => {
  const S = [[-AVE, -RADIUS, AVE, RADIUS], [-RADIUS, -CROSS, RADIUS, CROSS]];
  for (const k of [1, 2]) {
    const z = CROSS + k * (WARD + STREET) - STREET;       // 195, 395
    S.push([-RADIUS, z, RADIUS, z + STREET], [-RADIUS, -z - STREET, RADIUS, -z]);
  }
  for (const k of [1, 2]) { const x = AVE + k * (WARD + STREET) - STREET; S.push([x, -RADIUS, x + STREET, RADIUS], [-x - STREET, -RADIUS, -x, RADIUS]); }
  return S;
})();
export const onStreet = (x, z, m = 0) => STREETS.some((s) => inRect(s, x, z, m));

/**
 * The walled wards: { id, rect (the outer limits), c, kind: 'daci'en' | 'daoist' | 'market' | 'official' | 'common' | 'poor', side (±1: east/west of the
 * avenue), avenueSide ('w' | 'e' or null: the wall that faces the avenue: no gate there) }, only those whose centre lies within the disc.
 */
export const WARDS = (() => {
  const out = [];
  for (const sx of [1, -1]) for (let i = 0; i < 2; i++) for (const sz of [1, -1]) for (let j = 0; j < 2; j++) {
    const x0 = AVE + i * (WARD + STREET), z0 = CROSS + j * (WARD + STREET);
    const rect = [sx > 0 ? x0 : -x0 - WARD, sz > 0 ? z0 : -z0 - WARD, sx > 0 ? x0 + WARD : -x0, sz > 0 ? z0 + WARD : -z0];
    const c = [(rect[0] + rect[2]) / 2, (rect[1] + rect[3]) / 2];
    if (Math.hypot(c[0], c[1]) > RADIUS - 40) continue;
    const d = Math.hypot(c[0], c[1]);
    let kind = d < 360 ? 'official' : d < 430 ? 'common' : 'poor';
    if (i === 0 && j === 0 && sz > 0) kind = sx > 0 ? 'daci\'en' : 'market';
    if (i === 0 && j === 0 && sz < 0 && sx > 0) kind = 'daoist';
    out.push({ id: `${sx > 0 ? 'E' : 'W'}${i}${sz > 0 ? 'S' : 'N'}${j}`, rect, c, kind, side: sx, avenueSide: i === 0 ? (sx > 0 ? 'w' : 'e') : null });
  }
  return out;
})();
export const WARD_OF = (id) => WARDS.find((w) => w.id === id);
export const DACI = WARD_OF('E0S0'), MARKET = WARD_OF('W0S0'), DAOIST = WARD_OF('E0N0');
export const inWard = (x, z, m = 0) => WARDS.find((w) => inRect(w.rect, x, z, m)) || null;

/** The wards' walls: { a, b, gaps (distance from a), ward } with the centre lines WALL/2 inside the ward's outer limits. */
export function wallRuns() {
  const out = [], h = WALL / 2;
  for (const w of WARDS) {
    const [x0, z0, x1, z1] = w.rect, [cx, cz] = w.c, g = 3.2;
    const noGate = (side) => w.avenueSide === side;
    const run = (a, b, gate, side) => out.push({ a, b, gaps: gate && !noGate(side) ? [[gate - g, gate + g]] : [], ward: w.id, side });
    if (w.kind === 'daci\'en') {
      run([x0, z0 + h], [x1, z0 + h], null, 'n'); run([x0, z1 - h], [x1, z1 - h], cx - x0, 's');
      run([x0 + h, z0], [x0 + h, z1], null, 'w'); run([x1 - h, z0], [x1 - h, z1], null, 'e');
    } else if (w.kind === 'daoist') {
      run([x0, z0 + h], [x1, z0 + h], null, 'n'); run([x0, z1 - h], [x1, z1 - h], cx - x0, 's');
      run([x0 + h, z0], [x0 + h, z1], null, 'w'); run([x1 - h, z0], [x1 - h, z1], null, 'e');
    } else if (w.kind === 'market') {
      const lx = MARKET_LANES.x, lz = MARKET_LANES.z;
      run([x0, z0 + h], [x1, z0 + h], null, 'n'); run([x0, z1 - h], [x1, z1 - h], null, 's');
      out[out.length - 2].gaps = lx.map((x) => [x - x0 - 4, x - x0 + 4]); out[out.length - 1].gaps = lx.map((x) => [x - x0 - 4, x - x0 + 4]);
      run([x0 + h, z0], [x0 + h, z1], null, 'w'); out[out.length - 1].gaps = lz.map((z) => [z - z0 - 4, z - z0 + 4]);
      run([x1 - h, z0], [x1 - h, z1], null, 'e');
    } else {
      run([x0, z0 + h], [x1, z0 + h], cx - x0, 'n'); run([x0, z1 - h], [x1, z1 - h], cx - x0, 's');
      run([x0 + h, z0], [x0 + h, z1], cz - z0, 'w'); run([x1 - h, z0], [x1 - h, z1], cz - z0, 'e');
    }
  }
  return out;
}
/** The gate positions: [x, z, axis] ('x': in a wall running east–west). */
export function gates() {
  const out = [];
  for (const r of wallRuns()) for (const [g0, g1] of r.gaps) {
    const s = (g0 + g1) / 2, horiz = r.a[1] === r.b[1];
    out.push(horiz ? { c: [r.a[0] + s, r.a[1]], axis: 'x', ward: r.ward } : { c: [r.a[0], r.a[1] + s], axis: 'z', ward: r.ward });
  }
  return out;
}

// ── the West Market: a 井 of 8 m lanes, nine blocks of about 50 m ──
const [mx0, mz0, mx1, mz1] = MARKET.rect;
const MI = [mx0 + WALL, mz0 + WALL, mx1 - WALL, mz1 - WALL];
export const MARKET_LANE = 8;
export const MARKET_LANES = { x: [MI[0] + (MI[2] - MI[0]) / 3, MI[0] + (MI[2] - MI[0]) * 2 / 3], z: [MI[1] + (MI[3] - MI[1]) / 3, MI[1] + (MI[3] - MI[1]) * 2 / 3] };
/** The nine blocks [x0, z0, x1, z1] (i west to east, j north to south), the lanes between. */
export const MARKET_BLOCKS = (() => {
  const xe = [MI[0], ...MARKET_LANES.x.flatMap((x) => [x - MARKET_LANE / 2, x + MARKET_LANE / 2]), MI[2]];
  const ze = [MI[1], ...MARKET_LANES.z.flatMap((z) => [z - MARKET_LANE / 2, z + MARKET_LANE / 2]), MI[3]];
  const out = [];
  for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) out.push({ i, j, rect: [xe[2 * i], ze[2 * j], xe[2 * i + 1], ze[2 * j + 1]] });
  return out;
})();
export const MARKET_LANE_RECTS = [...MARKET_LANES.x.map((x) => [x - MARKET_LANE / 2, MI[1], x + MARKET_LANE / 2, MI[3]]), ...MARKET_LANES.z.map((z) => [MI[0], z - MARKET_LANE / 2, MI[2], z + MARKET_LANE / 2])];
export const MARKET_INNER = MI;
const SH = 11;                                            // the depth of the shops round a block
/** The Hu wine shop (walkable): in the north-west block's south row, facing the lane, 19 m wide. */
export const WINE = (() => { const [a, , b, z] = MARKET_BLOCKS[0].rect, cx = (a + b) / 2; return { foot: [cx - 9.5, z - SH, cx + 9.5, z], front: 's', hall: { w: 19 - 1.6, d: SH - 1.6, nb: 4 } }; })();
/** What stands in each market block: 'office' (centre), 'caravanserai' (west column, middle and south), 'shops' (a ring of shop rows round a yard). */
const BLOCK_KIND = (b) => (b.i === 1 && b.j === 1 ? 'office' : b.i === 0 && b.j > 0 ? 'caravanserai' : 'shops');
const TRADE_BY = (b) => ([
  ['carpet', 'spice', 'jade', 'wine', 'saddlery'], ['books', 'paper', 'medicine', 'lacquer', 'wine'], ['cloth', 'silk', 'dye', 'cloth', 'wine'],
  ['carpet', 'jade', 'spice', 'wine', 'carpet'], ['iron', 'pottery', 'grain', 'food', 'wine'], ['silk', 'cloth', 'dye', 'lacquer', 'wine'],
  ['saddlery', 'spice', 'carpet', 'wine', 'jade'], ['pottery', 'iron', 'grain', 'food', 'saddlery'], ['cloth', 'silk', 'food', 'wine', 'iron'],
][b.j * 3 + b.i]);
/** The market's shop rows: { foot, front, units: [{ nb, trade }], seed, block } — four per block (north, south, west, east). */
export function marketRows() {
  const out = [], rand = rng(750);
  for (const b of MARKET_BLOCKS) {
    if (BLOCK_KIND(b) === 'office') continue;
    const [x0, z0, x1, z1] = b.rect, T = TRADE_BY(b);
    const rows = [
      { foot: [x0, z0, x1, z0 + SH], front: 'n', len: x1 - x0 }, { foot: [x0, z1 - SH, x1, z1], front: 's', len: x1 - x0 },
      { foot: [x0, z0 + SH, x0 + SH, z1 - SH], front: 'w', len: z1 - z0 - 2 * SH }, { foot: [x1 - SH, z0 + SH, x1, z1 - SH], front: 'e', len: z1 - z0 - 2 * SH },
    ];
    const rows2 = [];
    for (const r of rows) {
      if (b.i === 0 && b.j === 0 && r.front === 's') {
        const cx = (x0 + x1) / 2;
        rows2.push({ foot: [x0, z1 - SH, cx - 9.5, z1], front: 's', len: cx - 9.5 - x0 }, { foot: [cx + 9.5, z1 - SH, x1, z1], front: 's', len: x1 - cx - 9.5 });
      } else rows2.push(r);
    }
    for (const r of rows2) {
      if (r.front === 'w' && b.i === 0) continue;                                                      // against the market wall
      if (BLOCK_KIND(b) === 'caravanserai' && r.front === 'e') continue;                              // the yard's gate side
      const nbT = Math.max(2, Math.round((r.len - 1.6) / 3.4)), units = [];
      let left = nbT;
      while (left > 0) { const nb = left >= 7 ? 3 : left; units.push({ nb, trade: T[Math.floor(rand() * T.length)] }); left -= nb; }
      out.push({ foot: r.foot, front: r.front, units, seed: Math.floor(rand() * 1e6), block: `${b.i}${b.j}`, det: Math.hypot((x0 + x1) / 2, (z0 + z1) / 2) < 260 ? 2 : 1 });
    }
  }
  return out;
}
export const marketYards = () => MARKET_BLOCKS.filter((b) => BLOCK_KIND(b) !== 'office').map((b) => ({ ...b, kind: BLOCK_KIND(b), yard: [b.rect[0] + SH + 0.5, b.rect[1] + SH + 0.5, b.rect[2] - SH - 0.5, b.rect[3] - SH - 0.5] }));
export const OFFICE = MARKET_BLOCKS.find((b) => BLOCK_KIND(b) === 'office').rect;
/** Is (x, z) a lane of the market? */
export const onMarketLane = (x, z, m = 0) => MARKET_LANE_RECTS.some((r) => inRect(r, x, z, m));
/** The wine shop of the market that is furnished: the unit of the south row of the west column's south block nearest the gate (chosen in plan.js). */

// ── the courtyard houses of the other wards ──
let LOTS = null, GRID = null;
/** Lots { rect, front, kind: 'mansion' | 'house' | 'hut', seed, det, ward }: in each quadrant of a ward two rows, one facing the lane, one the alley. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(751);
  for (const w of WARDS) {
    if (w.kind === 'daci\'en' || w.kind === 'daoist' || w.kind === 'market') continue;
    const [x0, z0, x1, z1] = w.rect, [cx, cz] = w.c, a = WALL + 0.4, L2 = LANE / 2;
    for (const qx of [-1, 1]) for (const qz of [-1, 1]) {
      const qa = qx < 0 ? [x0 + a, cx - L2] : [cx + L2, x1 - a], qb = qz < 0 ? [z0 + a, cz - L2] : [cz + L2, z1 - a];
      const mid = (qb[0] + qb[1]) / 2, AL = 4;
      // the row beside the E–W lane faces it; the row against the wall faces the alley
      const rowNear = qz < 0 ? [mid + AL / 2, qb[1]] : [qb[0], mid - AL / 2], rowFar = qz < 0 ? [qb[0], mid - AL / 2] : [mid + AL / 2, qb[1]];
      for (const [row, front] of [[rowNear, qz < 0 ? 's' : 'n'], [rowFar, qz < 0 ? 's' : 'n']]) {
        // (the far row faces the alley, which lies on its lane-ward side: for qz < 0 the far row is the north one, facing south onto the alley)
        const n = Math.max(2, Math.round((qa[1] - qa[0]) / 26)), wdt = (qa[1] - qa[0]) / n;
        for (let k = 0; k < n; k++) {
          const rect = [qa[0] + k * wdt + 0.3, row[0], qa[0] + (k + 1) * wdt - 0.3, row[1]];
          const d = Math.hypot((rect[0] + rect[2]) / 2, (rect[1] + rect[3]) / 2), r = rand();
          let kind = w.kind === 'official' ? (r < 0.55 ? 'mansion' : 'house') : w.kind === 'common' ? (r < 0.08 ? 'mansion' : r < 0.85 ? 'house' : 'hut') : (r < 0.55 ? 'hut' : 'house');
          if (rand() < (d > 440 ? 0.25 : 0.04)) continue;
          LOTS.push({ rect, front, kind, seed: Math.floor(rand() * 1e6), det: d < 230 ? 2 : d < 380 ? 1 : 0, ward: w.id });
        }
      }
    }
  }
  return LOTS;
}
const gridOf = () => {
  if (GRID) return GRID;
  GRID = new Map();
  for (const h of lots()) for (let i = Math.floor((h.rect[0] - 2) / 24); i <= Math.floor((h.rect[2] + 2) / 24); i++) for (let j = Math.floor((h.rect[1] - 2) / 24); j <= Math.floor((h.rect[3] + 2) / 24); j++) { const k = i + ',' + j; if (!GRID.has(k)) GRID.set(k, []); GRID.get(k).push(h); }
  return GRID;
};
/** The lot (house and yard) at (x, z), if any. */
export function lotAt(x, z, m = 0) { const l = gridOf().get(Math.floor(x / 24) + ',' + Math.floor(z / 24)); return (l && l.find((h) => inRect(h.rect, x, z, m))) || null; }
/** The ward's lanes (the cross) and its alleys, as rectangles. */
export function laneRects() {
  const out = [];
  for (const w of WARDS) {
    const [x0, z0, x1, z1] = w.rect, [cx, cz] = w.c;
    if (w.kind === 'daci\'en' || w.kind === 'daoist' || w.kind === 'market') continue;
    out.push([x0, cz - LANE / 2, x1, cz + LANE / 2], [cx - LANE / 2, z0, cx + LANE / 2, z1]);
    for (const qz of [-1, 1]) { const qb = qz < 0 ? [z0 + WALL + 0.4, cz - LANE / 2] : [cz + LANE / 2, z1 - WALL - 0.4], mid = (qb[0] + qb[1]) / 2; out.push([x0 + WALL, mid - 2, x1 - WALL, mid + 2]); }
  }
  return out;
}
export const onLane = (x, z, m = 0) => laneRects().some((r) => inRect(r, x, z, m));

// ── Daci'en, the Daoist temple: the axes and what stands on them ──
export const DACI_AX = DACI.c[0];
export const PAGODA = [DACI_AX, DACI.rect[1] + 38];
export const DACI_MAIN = [DACI_AX, DACI.rect[1] + 86];            // the main hall's centre
export const DAO_AX = DAOIST.c[0];
/** Where the avenue crosses street A (the visitor's arrival is near it). */
export const CROSSING = [0, 0];
/** The ditches of the avenue: |x| from DITCH.in to DITCH.out, interrupted at the cross streets (a culvert under each). */
export const inDitch = (x, z) => {
  const ax = Math.abs(x);
  if (ax < DITCH.in || ax > DITCH.out || Math.hypot(x, z) > RADIUS - 26) return false;
  return !STREETS.slice(1).some((s) => s[2] - s[0] > s[3] - s[1] && z > s[1] - 0.5 && z < s[3] + 0.5);
};
/** Zone: 'city' inside the walls' region, 'country' beyond. */
export const zoneOf = (x, z) => (Math.abs(x) > 2 * (WARD + STREET) + AVE - STREET + 20 || Math.abs(z) > 2 * (WARD + STREET) + CROSS - STREET + 20 ? 'country' : 'city');
export const TREE_ROWS = [-49.5, -41.5, 41.5, 49.5];

/** The Daoist temple's halls (c, w along the hall's front, d), for the town (shell) and the plan's rooms (music zones). */
export const DAO_HALLS = {
  main: { c: [DAO_AX, -112], w: 25, d: 11, H: 4.8, y: 1.0 },
  rear: { c: [DAO_AX, -164], w: 18, d: 8.4, H: 4.2, y: 0.8 },
  side: [-1, 1].map((s) => ({ c: [DAO_AX + s * 42, -112], w: 18, d: 8, H: 3.8, y: 0.6, face: s < 0 ? 'e' : 'w' })),
};
/** Covered galleries (cloisters) of the two temples: { c, w (length), face }. */
export const GALLERIES = [
  ...[-1, 1].map((s) => ({ c: [DACI_AX + s * 40, 172], w: 42, face: s < 0 ? 'e' : 'w' })),
  ...[-1, 1].map((s) => ({ c: [DACI_AX + s * 40, 134], w: 28, face: s < 0 ? 'e' : 'w' })),
  ...[-1, 1].map((s) => ({ c: [DACI_AX + s * 40, 66], w: 52, face: s < 0 ? 'e' : 'w' })),
  ...[-1, 1].map((s) => ({ c: [DAO_AX + s * 62, -66], w: 62, face: s < 0 ? 'e' : 'w' })),
  ...[-1, 1].map((s) => ({ c: [DAO_AX + s * 62, -145], w: 36, face: s < 0 ? 'e' : 'w' })),
];

/** Where one arrives (the pagoda court, west of the main hall): the sight line from there to the pagoda must stay clear of crowns. */
export const ARRIVE = [DACI_AX - 35, DACI.rect[1] + 87];
/** The distance from (x, z) to the sight line from the arrival to the pagoda's foot (0 if on it). */
export const sightDist = (x, z) => {
  const [ax, az] = ARRIVE, vx = PAGODA[0] - ax, vz = PAGODA[1] - az, t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)));
  return Math.hypot(x - (ax + vx * t), z - (az + vz * t));
};
