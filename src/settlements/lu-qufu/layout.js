// Qufu, c. 1730 — the layout (docs/settlements/lu-qufu.md §2). The Temple of Confucius on its axis x = 0 (the gates and halls in a row from the
// south wall to the Hall of Sage Traces), the side compounds of the ancestors and the parents, the Kong Mansion east of it, the south wall of
// the Ming city with the Wanren Gongqiang gate, Queli Street from the gate to the Temple with its shops, the courtyard houses of the town in
// rows, the cypress grove of the Forest's edge in the north. Pure data. Coordinates: metres, +x east, +z south, y up.

export const RADIUS = 330;
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

// ── the Temple ──
export const TEMPLE = [-95, -232, 95, 118];
export const INNER_X = 58;                                           // the central compound's side walls (z −232…−52)
export const WALL_Z = { shengshi: 118, hongdao: 76, dazhong: 52, tongwen: 28, dacheng: -52, north: -232 };
export const TEMPLE_WALL = { th: 1.4, h: 4.4 };
export const GATE_HALLS = [                                          // z of the centre, width, bays, roof
  { id: 'shengshi', z: 118, w: 17, bays: 5, name: '圣时门' },
  { id: 'hongdao', z: 76, w: 17, bays: 5, name: '弘道门' },
  { id: 'dazhong', z: 52, w: 17, bays: 5, name: '大中门' },
  { id: 'tongwen', z: 28, w: 11.5, bays: 3, name: '同文门' },
  { id: 'dacheng', z: -52, w: 25, bays: 5, name: '大成门' },
];
export const GATE_D = 6.4;                                           // the gate halls' depth (z)
export const LINGXING = { z: 158, w: 20 };
export const TAIHE = { z: 138, w: 16 };
export const JINSHENG = { z: 215, w: 18 };
export const POOL = [-26, 90, 26, 106], POOL_Y = -0.55, POOL_BED = -1.4;
export const BRIDGE = { z: 98, span: 10, width: 6 };
export const KUIWEN = { rect: [-15, -4.8, 15, 12.8], y: 1.0 };
// the thirteen stele pavilions: six large to the north, seven small to the south, the axis kept clear
export const STELE_PAV = [
  ...[-48, -32, -16, 16, 32, 48].map((x) => ({ c: [x, -37], big: true })),
  ...[-52, -38, -24, 24, 38, 52, -10].map((x, i) => ({ c: [x === -10 ? 10 : x, -17], big: false, i })),
].map((p) => ({ ...p, w: p.big ? 7.2 : 5.4 }));
export const ALTAR = { c: [0, -80] };
export const HALL = { rect: [-22.85, -141.85, 22.85, -117], y: 2.1, H: 8.4, double: 7.2 };   // 45.7 × 24.85, the body of the hall
export const BASE = [-27, -146.5, 27, -111.5];                       // the stone base, 2.1 m high
export const MOON = [-18, -111.5, 18, -98.5];                        // the moon terrace before the hall
export const WU = [{ rect: [-52, -125, -44, -56], front: 'e' }, { rect: [44, -125, 52, -56], front: 'w' }];
export const QIN = { rect: [-17, -186, 17, -172], y: 0.9 };         // the Resting Hall
export const SAGE = { rect: [-14, -228, 14, -216], y: 0.9 };        // the Hall of Sage Traces
export const SIDE = [                                                // the side compounds: halls of the parents (west) and the ancestors (east)
  { id: 'qisheng', rect: [-90, -138, -64, -126], c: -77 },
  { id: 'chongsheng', rect: [64, -138, 90, -126], c: 77 },
];
export const SIDE_GATE_Z = -100;

// ── the Kong Mansion ──
export const MANSION = [107, -172, 205, 112];
export const MX = 156;                                              // its axis
export const MANSION_HALLS = [
  { id: 'gate', rect: [MX - 9, 105.5, MX + 9, 111.5], H: 4.6, bays: [5, 2], doors: ['n'] },
  { id: 'chongguang', rect: [MX - 8, 41, MX + 8, 47], H: 4.6, bays: [5, 2], doors: ['n'] },
  { id: 'datang', rect: [MX - 16, 14, MX + 16, 30], H: 5.6, bays: [7, 3], doors: ['n'] },
  { id: 'ertang', rect: [MX - 12, -14, MX + 12, -2], H: 5.0, bays: [5, 2], doors: ['n'] },
  { id: 'santang', rect: [MX - 9, -36, MX + 9, -26], H: 4.8, bays: [5, 2], doors: ['n'] },
  { id: 'neizhai', rect: [MX - 6, -54, MX + 6, -48], H: 4.4, bays: [3, 2], doors: ['n'] },
  { id: 'qianshang', rect: [MX - 16, -72, MX + 16, -60], H: 5.0, bays: [7, 2], doors: ['n'] },
  { id: 'qiantang', rect: [MX - 16, -98, MX + 16, -86], H: 4.6, double: 3.6, bays: [7, 2], doors: ['n'] },
  { id: 'houtang', rect: [MX - 18, -128, MX + 18, -114], H: 4.8, double: 3.8, bays: [7, 3], doors: ['n'] },
  { id: 'flower', rect: [MX - 11, -166, MX + 11, -156], H: 4.4, bays: [5, 2], doors: ['n'] },
];
export const MANSION_RANGES = [                                      // the offices flanking the central court, and the side studies
  { rect: [112, 56, 124, 98], front: 'e' }, { rect: [188, 56, 200, 98], front: 'w' },
  { rect: [112, -118, 123, -76], front: 'e' }, { rect: [189, -118, 200, -76], front: 'w' },
];
export const MANSION_WALLS = [32, -44, -134].map((z) => z);          // cross walls, with the gates

// ── the Ming city wall (south), the street, the squares ──
export const CITY_WALL = { z: 262, th: 7, h: 9.5, x0: -240, x1: 240 };
export const WANREN = { x: 0, w: 5.6 };
export const QUELI = [-9, 118, 9, 262];                              // Queli Street, between the shop rows
export const SQUARE = [-40, 118, 40, 170];                           // the forecourt before the temple's south gate (the Lingxing Gate in it)
export const SHOP_X = 12;                                            // depth of the shop rows
export const LANES_X = [-110, -200, -290, 101, 211];                 // the north–south streets (their centres), 8 m wide (the two by the temple 12 m)
export const STREET_W = { '-110': 12, '101': 12 };
export const KONG_FOREST = [-70, -330, 70, -252];
// the Drum Tower: a brick platform across the west street (x −110) with the passage through it, the hall on top, its stair on the east side
export const DRUM = { x: -110, z: 111, w: 20, d: 12, h: 6, pass: 6, stair: [-100, 107, -85, 110.5] };
// the old cypresses and arborvitae of the temple's courts (each in its stone guard)
export const OLD = [[-34, -66], [34, -66], [-34, -90], [34, -90], [-36, -112], [36, -112], [-36, -134], [36, -134], [-30, -160], [30, -160], [-16, -158], [16, -158], [-30, -200], [30, -200], [-16, -200], [16, -200], [-54, -214], [54, -214], [-22, 10], [22, 10], [-62, -20], [62, -20], [-62, 50], [62, 50], [-70, 90], [70, 90]];

export const inPool = (x, z, m = 0) => inRect(POOL, x, z, m);
export function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS) return 0;
  let h = 0;
  const d = Math.min(x - POOL[0], POOL[2] - x, z - POOL[1], POOL[3] - z);
  if (d > -1.2) h = Math.min(h, POOL_BED * smooth(-1.2, 1.2, d));
  return h * (1 - smooth(RADIUS - 30, RADIUS, r));
}

/** Rectangles of the buildings and courts that no tree or house may stand on (the temple's halls, the stele pavilions, the altar). */
export function buildRects() {
  const o = [BASE, MOON, KUIWEN.rect, QIN.rect, SAGE.rect, ...WU.map((w) => w.rect), ...SIDE.map((s) => s.rect)];
  for (const g of GATE_HALLS) o.push([-g.w / 2 - 2, g.z - GATE_D / 2 - 2, g.w / 2 + 2, g.z + GATE_D / 2 + 2]);
  for (const p of STELE_PAV) o.push([p.c[0] - p.w / 2 - 1, p.c[1] - p.w / 2 - 1, p.c[0] + p.w / 2 + 1, p.c[1] + p.w / 2 + 1]);
  o.push([ALTAR.c[0] - 7, ALTAR.c[1] - 7, ALTAR.c[0] + 7, ALTAR.c[1] + 7]);
  o.push([DRUM.x - DRUM.w / 2 - 2, DRUM.z - DRUM.d / 2 - 2, DRUM.stair[2] + 2, DRUM.z + DRUM.d / 2 + 2]);
  return o;
}

/** The streets and lanes of the town as rectangles (walkable, free of houses). */
export function streets() {
  const out = [];
  out.push(QUELI, SQUARE);
  out.push([-8, 170, 8, 262]);
  // the east–west lanes between the bands of houses, from the lots' side to the next street
  for (const z of laneZs()) {
    let segs = [[-296, 296]];
    for (const b of [TEMPLE, MANSION]) if (z + LANE_W > b[1] - 1 && z < b[3] + 1) segs = segs.flatMap(([a, c]) => (c <= b[0] || a >= b[2] ? [[a, c]] : [[a, Math.min(c, b[0])], [Math.max(a, b[2]), c]].filter(([p, q]) => q - p > 1)));
    for (const [a, c] of segs) out.push([a, z, c, z + LANE_W]);
  }
  // the north–south streets
  for (const x of LANES_X) { const w = STREET_W[x] ?? 8; out.push([x - w / 2, -250, x + w / 2, 255]); }
  out.push([-98, 118, 98, 130]);                                     // the street before the temple's south wall
  out.push([-98, -240, 98, -232]);
  out.push([MX - 6, 112, MX + 6, 125]);                               // the mansion's forecourt
  out.push([-296, 262, 296, 276]);                                    // the road outside the south wall (the field edge)
  return out.filter((r) => r[2] - r[0] > 1 && r[3] - r[1] > 1);
}
const LANE_W = 6, BAND = 38, Z0 = -246;
export const laneZs = () => { const o = []; for (let z = Z0; z < 258; z += BAND) o.push(z + BAND - LANE_W); return o; };

let LOTS = null;
/** The houses' lots: { rect, seed, wealth }, courtyard houses facing south onto the lane below them. */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1730);
  const hold = [...buildRects(), TEMPLE, MANSION, KONG_FOREST, POOL, [-22, 118, 22, 262], SQUARE];
  for (let z = Z0; z < 258 - BAND + 1; z += BAND) {
    let x = -300;
    while (x < 300) {
      const w = 24 + Math.floor(rand() * 4) * 2.5, r = [x + 0.5, z + 0.5, x + w - 0.5, z + BAND - LANE_W - 0.5];
      x += w;
      if (Math.max(...[[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].map(([a, b]) => Math.hypot(a, b))) > RADIUS - 30) continue;
      if (hold.some((h) => r[0] < h[2] + 2 && r[2] > h[0] - 2 && r[1] < h[3] + 2 && r[3] > h[1] - 2)) continue;
      if (LANES_X.some((lx) => { const hw = (STREET_W[lx] ?? 8) / 2; return r[0] < lx + hw && r[2] > lx - hw; })) continue;
      if (r[3] > CITY_WALL.z - 6 && r[1] < CITY_WALL.z + 8) continue;
      const near = Math.hypot((r[0] + r[2]) / 2, (r[1] + r[3]) / 2 - 20);
      LOTS.push({ rect: r, seed: Math.floor(rand() * 1e6), wealth: Math.max(0, 1 - near / 330), lod: near < 150 ? 0 : near < 230 ? 1 : 2 });
    }
  }
  return LOTS;
}
export const inLot = (x, z, m = 0) => lots().some((l) => inRect(l.rect, x, z, m));
/** The shop runs along Queli Street: { rect, front, n, seed, storeys }; the cross lanes' gaps left open. */
export function shopRuns() {
  const out = [], rand = rng(918);
  const runs = [[168, 201], [213, 239], [251, 260]];
  // the square's two sides: the pilgrims' shops facing the Lingxing Gate
  for (const [rect, front] of [[[-40, 128, -28, 166], 'e'], [[28, 128, 40, 166], 'w']]) out.push({ rect, front, n: 7, seed: Math.floor(rand() * 1e6), storeys: rand() < 0.35 ? 2 : 1 });
  for (const [za, zb] of runs) for (const side of [-1, 1]) {
    const rect = side < 0 ? [-9 - SHOP_X, za, -9, zb] : [9, za, 9 + SHOP_X, zb];
    out.push({ rect, front: side < 0 ? 'e' : 'w', n: Math.max(2, Math.round((zb - za) / 5.8)), seed: Math.floor(rand() * 1e6), storeys: rand() < 0.35 ? 2 : 1 });
  }
  return out;
}
export const SHOP_RECTS = () => shopRuns().map((s) => s.rect);

/** The furniture of the streets, from the layout: stalls (kind, rot toward the street's axis), wells, stone lamps, hitching posts, handcarts. Pure data. */
export function streetItems() {
  const r = rng(33), out = { stalls: [], wells: [], lamps: [], hitches: [], carts: [] };
  const KINDS = ['fruit', 'buns', 'noodle', 'cloth', 'books', 'pots'];
  // Queli Street: a stall every 14 m on each side near the shop fronts, a lamp every 22 m, hitching posts at the cross lanes
  for (let z = 176; z < 256; z += 14) for (const s of [-1, 1]) if (r() < 0.8) out.stalls.push({ at: [s * (5.4 + r() * 1.2), z + r() * 4], rot: s < 0 ? Math.PI / 2 : -Math.PI / 2, kind: KINDS[Math.floor(r() * KINDS.length)], seed: Math.floor(r() * 1e6) });
  for (let z = 125; z < 258; z += 22) for (const s of [-1, 1]) out.lamps.push({ at: [s * 7.6, z] });
  // the square before the Lingxing Gate: the pilgrims' stalls in two rows either side of the axis
  for (let z = 126; z < 152; z += 8) for (const s of [-1, 1]) { out.stalls.push({ at: [s * 17, z + r() * 2], rot: s < 0 ? Math.PI / 2 : -Math.PI / 2, kind: ['buns', 'noodle', 'books', 'fruit'][Math.floor(r() * 4)], seed: Math.floor(r() * 1e6) }); }
  for (const s of [-1, 1]) out.hitches.push({ at: [s * 24, 168], rot: 0 });
  // the wells at some crossings of the north–south streets and the lanes
  const zs = laneZs();
  LANES_X.forEach((x, xi) => zs.forEach((z, zi) => { if ((xi + zi) % 3 === 0 && Math.hypot(x, z) < RADIUS - 50) { const hw = (STREET_W[x] ?? 8) / 2; out.wells.push({ at: [x + hw - 1.5, z + 1.6] }); } }));
  for (let i = 0; i < zs.length; i += 2) for (const x of LANES_X) if (Math.hypot(x, zs[i]) < RADIUS - 60 && r() < 0.5) out.carts.push({ at: [x - ((STREET_W[x] ?? 8) / 2 - 1.2), zs[i] + 12 + r() * 6], rot: 0, seed: Math.floor(r() * 1e6) });
  return out;
}
