// Round the Weiyang hall (docs/settlements/han-changan.md §2, §6–§8): the palace's walls and gates, its corridors, halls and quarters; the Changle Palace;
// the great avenue's offices; the walled wards with their houses; the West and East Markets with their towers and shop rows; the city wall with
// its west and south gates; the Kunming Lake with its tower-ship; the Imperial Academy; the people — the court in the Front Hall, the guards, the merchants
// and the caravans of the Silk Road at the west gate.

import { RADIUS, AX, PALACE, PALACE_WALL, HALL, CROWN, EAST_GATE, SOUTH_GATE, CHANGLE, CHANGLE_HALL, WEST_MARKET, EAST_MARKET, MARKET_WALL, LAKE, LAKE_Y, ACADEMY, WARDS, WARD_WALL, GARDEN_POND, POND_Y, JIAOFANG,
  RAMP, CITY_WALL, WALL_W, WALL_S, GATE_W, GATE_S, cityWalls, lots, inService, serviceKind, TIERS, marketShops, BRIDGES, MOAT_Y, AVENUE } from './layout.js';
const AVENUE_BAND = { mid: [AVENUE[0] + 11, AVENUE[1], AVENUE[2] - 11, WALL_S - 6], kerbW: [AVENUE[0], AVENUE[1], AVENUE[0] + 0.6, WALL_S - 6], kerbE: [AVENUE[2] - 0.6, AVENUE[1], AVENUE[2], WALL_S - 6] };

import { lifePlans } from './life.js';
import '../../styles/hanlodge/index.js';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const base = (id, elements, o = {}) => ({ id, style: 'han', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [AX, 60], facing: 'n' }, ...o });
const pick = (rand, a) => a[Math.floor(rand() * a.length) % a.length];

/** A walled rectangle with gates: sides as han_wall elements; gates: [{ side: 'n' | 's' | 'e' | 'w', c, w }]. */
function walledRect(rect, th, h, mat, gates) {
  const [x0, z0, x1, z1] = rect, E = [];
  const gaps = (side) => gates.filter((g) => g.side === side).map((g) => ({ at: g.c - ((side === 'n' || side === 's') ? x0 : z0), w: g.w }));
  E.push({ t: 'han_wall', a: [x0, z0], b: [x1, z0], th, h, mat, gaps: gaps('n') }, { t: 'han_wall', a: [x0, z1], b: [x1, z1], th, h, mat, gaps: gaps('s') },
    { t: 'han_wall', a: [x0, z0], b: [x0, z1], th, h, mat, gaps: gaps('w') }, { t: 'han_wall', a: [x1, z0], b: [x1, z1], th, h, mat, gaps: gaps('e') });
  for (const g of gates) {
    const ax = g.side === 'n' || g.side === 's';
    const c = g.side === 'n' ? [g.c, z0] : g.side === 's' ? [g.c, z1] : g.side === 'w' ? [x0, g.c] : [x1, g.c];
    E.push({ t: 'han_gate', c, axis: ax ? 'x' : 'z', th, h, n: 1, pw: g.w - 6, ph: Math.min(5, h - 2.5), mat });
  }
  return E;
}

/** The people (docs/settlements/han-changan.md §7): the court in the front hall, guards, scribes, merchants, camels and bales at the west gate. */
function people() {
  const rand = rng(100), L = [];
  const fig = (at, rot, o = {}) => L.push({ t: 'figure', at, y: 0, rot, seed: Math.floor(rand() * 1e9), dress: 'robe', top: '', cloth: 'cloth_white', cloth2: 'cloth_white', skin: 'skin_light', hat: 'none', hair: 'topknot', hairMat: 'hair_dark', feet: 'shod', carry: 'none', pose: 'stand', ...o });
  // the throne: the emperor in black with a red hem, seated on the couch; two attendants with long-handled fans
  const dz = HALL.z0, f = HALL.floor;
  fig([AX, dz + 2.6], Math.PI, { y: f + 1.64, pose: 'seiza', cloth: 'cloth_black', cloth2: 'cloth_red', hat: 'cap', over: 'sash', beard: 1 });
  for (const s of [-1, 1]) fig([AX + s * 3.6, dz + 4.4], Math.PI, { y: f + 1.2, cloth: 'cloth_red', hat: 'cap', over: 'sash', pose: 'staff', carry: 'staff', len: 2.0 });
  // the court's musicians at the racks of bells and chimes and the drums (src/styles/han/hall.js): a zither, a flute and a drummer each side
  for (const s of [-1, 1]) {
    fig([AX + s * 11.5 - 1.2, dz + 21.8], 0, { y: f + 0.05, pose: 'harp', cloth: 'cloth_indigo', cloth2: 'cloth_white', hat: 'cap', over: 'sash' });
    fig([AX + s * 11.5 + 1.2, dz + 21.8], 0, { y: f + 0.05, pose: 'flute', cloth: 'cloth_green', cloth2: 'cloth_white', hat: 'cap', over: 'sash' });
    fig([AX + s * 7.2, dz + 22.0], 0, { y: f + 0.05, pose: 'drum', cloth: 'cloth_red', cloth2: 'cloth_white', hat: 'cap', over: 'sash' });
  }
  // the ministers kneeling on their mats before their low tables, the same places as the hall's (src/styles/han/hall.js)
  const aisle = HALL.bayW * 1.6, x0 = AX - HALL.w / 2, cols = [];
  for (let i = 0; i <= HALL.bays; i++) for (let j = 0; j <= HALL.depth; j++) {
    const inner = j > 0 && j < HALL.depth && i > 0 && i < HALL.bays && (j === 1 || j === HALL.depth - 1) && Math.abs(i - HALL.bays / 2) >= Math.max(2, HALL.bays / 4);
    if (inner) cols.push([x0 + i * HALL.bayW, dz + j * HALL.depthW]);
  }
  for (const s of [-1, 1]) for (const z of [dz + 9.5, dz + 13.5, dz + 17]) for (let k = 0; k < 5; k++) {
    const x = AX + s * (aisle + 1.2 + k * 3.4);
    if (cols.some(([cx, cz]) => Math.hypot(cx - x, cz - z) < 1.9) || rand() < 0.15) continue;
    fig([x, z + 0.3], 0, { y: f + 0.05, pose: 'seiza', cloth: pick(rand, ['cloth_blue', 'cloth_indigo', 'cloth_brown', 'cloth_green', 'cloth_red']), cloth2: 'cloth_white', hat: 'cap', over: 'sash', beard: rand() < 0.5 ? 1 : 0 });
  }
  // the guards: halberdiers at the foot of the ramp, at the hall's door and at the gates, in lamellar-grey coats
  for (const [x, z, r] of [[AX - 7, -90, 0], [AX + 7, -90, 0], [AX - 7, -128.5, Math.PI], [AX + 7, -128.5, Math.PI], [AX - 5, -161, Math.PI], [AX + 5, -161, Math.PI], [PALACE[2] - 3, EAST_GATE.z - 8, -Math.PI / 2], [PALACE[2] - 3, EAST_GATE.z + 8, -Math.PI / 2], [SOUTH_GATE.x - 8, PALACE[3] - 3, 0], [SOUTH_GATE.x + 8, PALACE[3] - 3, 0]])
    fig([x, z], r, { dress: 'robe', cloth: 'cloth_grey', cloth2: 'cloth_black', hat: 'cap', over: 'belt', pose: 'staff', carry: 'staff', len: 2.2, y: z < -128 && z > -170 ? CROWN : 0 });
  // the west gate and the Silk Road: Hu merchants in pointed caps and long coats at the camels, bales stacked, the gate's keepers
  const gz = GATE_W.z;
  for (let k = 0; k < 7; k++) {
    const x = WALL_W - 22 - k * 12, z = gz - 16 + (k % 3) * 11 + rand() * 3, rot = Math.PI / 2 + (rand() - 0.5) * 0.3;
    L.push({ t: 'animal', kind: 'camel', at: [x, z], y: 0, rot, seed: Math.floor(rand() * 1e9), gear: true });
    L.push({ t: 'sacks', at: [x - 0.3, z], y: 1.45, rot, n: 3, seed: Math.floor(rand() * 1e9) });
    fig([x + 1.5, z + 1.5], Math.PI * 1.5, { dress: 'tunic', cloth: pick(rand, ['cloth_indigo', 'cloth_brown', 'cloth_red', 'cloth_green']), cloth2: 'cloth_brown', hat: 'brim', hairMat: 'hair_dark', beard: 1, skin: 'skin_medium', legs: 'hose', feet: 'shod', pose: 'staff', carry: 'staff', len: 1.8 });
  }
  for (const [x, z] of [[WALL_W - 12, gz - 8], [WALL_W - 12, gz + 8], [WALL_W + 10, gz - 8], [WALL_W + 10, gz + 8]]) fig([x, z], x < WALL_W ? Math.PI * 1.5 : Math.PI / 2, { dress: 'robe', cloth: 'cloth_grey', hat: 'cap', over: 'belt', pose: 'staff', carry: 'staff', len: 2.2 });
  // the markets: sellers at their counters; officials by the tower
  for (const [rect] of [[WEST_MARKET], [EAST_MARKET]]) {
    const cx = (rect[0] + rect[2]) / 2, cz = (rect[1] + rect[3]) / 2;
    fig([cx - 8, cz + 8], 0, { dress: 'robe', cloth: 'cloth_blue', hat: 'cap', over: 'sash', pose: 'staff', carry: 'staff', len: 1.7, y: 2.6 });
    fig([cx + 8, cz + 8], 0, { dress: 'robe', cloth: 'cloth_blue', hat: 'cap', over: 'sash', pose: 'staff', carry: 'staff', len: 1.7, y: 2.6 });
  }
  return L;
}

/** The shop rows of a market (layout.js marketShops) as elements. */
function marketRows(rect, seedBase) {
  return marketShops(rect, seedBase).map((r) => ({ t: 'han_shop_row', ...r }));
}

let CACHE = null;
export async function town() {
  if (CACHE) return CACHE;
  const plans = [], rand = rng(206);
  // ── the Weiyang palace: walls, the three gates, the corridors, the halls ──
  {
    const W = PALACE, th = PALACE_WALL.th, E = walledRect(W, th, PALACE_WALL.h, 'lime_plaster', [{ side: 's', c: SOUTH_GATE.x, w: 14 }, { side: 'e', c: EAST_GATE.z, w: 14 }, { side: 'n', c: AX, w: 14 }]);
    // the corridors along the forecourt, their back walls outward
    for (const s of [-1, 1]) E.push({ t: 'han_corridor', a: [AX + s * 80, -80], b: [AX + s * 80, 84], w: 3.4, h: 3.6, wall: s });
    E.push({ t: 'han_corridor', a: [AX - 80, 84], b: [AX + 80, 84], w: 3.4, h: 3.6, wall: 1 });
    // the Jiaofang hall behind the terrace, the offices west of the court, the library pavilions on their platforms
    E.push({ t: 'han_hall', cx: JIAOFANG.cx, z1: JIAOFANG.cz + 6, bays: 5, bayW: 7.2, depth: 2, depthW: 6, floor: 0.9, base: 0.9, h: 5.8, roof: 'hip', rise: 4.4, overhang: 2.8, ap: 1.6, furnish: 'court', open: [2, 2], seed: 31 });
    for (const [cz, sd] of [[-130, 41], [-176, 43]]) E.push({ t: 'han_hall', cx: -228, z1: cz, bays: 5, bayW: 6, depth: 2, depthW: 6, floor: 0.9, base: 0.9, h: 5.0, roof: 'gable', rise: 3.4, overhang: 2.4, ap: 1.6, furnish: 'office', open: [2, 2], seed: sd });
    for (const [x, z] of [[-210, -228], [-165, -232]]) {
      E.push({ t: 'han_wall', a: [x - 9, z], b: [x + 9, z], th: 14, h: 2.6, mat: 'earth_wall', cap: 'none' });
      E.push({ t: 'han_pavilion', c: [x, z], A: 5.2, B: 5.2, y: 2.6, h: 4.2, tiers: 2, walls: true });
    }
    E.push({ t: 'han_pond', rect: GARDEN_POND, y: POND_Y }, { t: 'han_island', at: [(GARDEN_POND[0] + GARDEN_POND[2]) / 2 - 6, GARDEN_POND[1] + 17], r: 7, y: POND_Y, pond: GARDEN_POND, seed: 4 });
    // the paved axial way from the south gate to the ramp, and the paved court at its foot
    E.push({ t: 'floor', rect: [AX - 6, RAMP.z1 - 0.5, AX + 6, PALACE[3] - 2], y: 0.03, mat: 'bluestone', th: 0.3 }, { t: 'floor', rect: [AX - 26, RAMP.z1 - 0.5, AX + 26, RAMP.z1 + 24], y: 0.02, mat: 'brick_paving', th: 0.3 });
    plans.push(base('han-palace', E));
  }
  // ── the Changle palace ──
  {
    const E = walledRect(CHANGLE, PALACE_WALL.th, PALACE_WALL.h, 'lime_plaster', [{ side: 'w', c: EAST_GATE.z, w: 14 }, { side: 's', c: CHANGLE_HALL.cx, w: 14 }]);
    for (const cz of [-150, -20]) E.push({ t: 'han_hall', cx: CHANGLE_HALL.cx, z1: cz, bays: 5, bayW: 6, depth: 2, depthW: 6, floor: 0.9, base: 0.9, h: 5.2, roof: 'hip', rise: 4.2, overhang: 2.6, ap: 1.6, furnish: 'court', open: [2, 2], seed: 51 + cz });
    E.push({ t: 'han_corridor', a: [CHANGLE[0] + 10, -100], b: [CHANGLE[0] + 40, -100], w: 3.4, wall: 1 });
    plans.push(base('han-changle', E));
  }
  // ── the great avenue's offices ──
  {
    const E = [];
    for (const l of lots()) if (l.kind === 'office') E.push({ t: 'han_office', rect: l.rect, seed: l.seed, open: l.seed % 3 === 0 });
    if (E.length) plans.push(base('han-offices', E));
  }
  // ── wards: walls and gates, the houses ──
  {
    const E = [];
    for (const w of WARDS) {
      const z0 = w[1], lc = [z0 + WARD_WALL + 24.55, z0 + WARD_WALL + 72.85];
      E.push({ t: 'han_ward', rect: w, gates: [{ side: 'w', c: lc[0], w: 4.5 }, { side: 'e', c: lc[0], w: 4.5 }, { side: 'w', c: lc[1], w: 3.5 }, { side: 'e', c: lc[1], w: 3.5 }] });
    }
    plans.push(base('han-wards', E));
    const H = lots().filter((l) => l.kind !== 'office' && !inService(l)), K = { court: 'han_house', row: 'han_house', tower: 'han_house' };
    for (let i = 0; i < H.length; i += 40) plans.push(base(`han-houses-${i / 40}`, H.slice(i, i + 40).map((l) => ({ t: K[l.kind], rect: l.rect, front: l.front, kind: l.kind, seed: l.seed, open: l.open }))));
  }
  // the service quarters' houses: enterable (src/styles/hanlodge)
  plans.push(base('han-service-houses', lots().filter(inService).map((l) => ({ t: 'hanl_house', rect: l.rect, front: l.front, kind: serviceKind(l), seed: l.seed })), { style: 'hanlodge' }));
  // ── the markets ──
  for (const [id, rect, sd] of [['west', WEST_MARKET, 600], ['east', EAST_MARKET, 700]]) {
    const cx = (rect[0] + rect[2]) / 2, cz = (rect[1] + rect[3]) / 2;
    plans.push(base(`han-market-${id}`, [{ t: 'han_market', rect, gates: { n: cx, s: cx, e: cz, w: cz }, th: MARKET_WALL.th, h: MARKET_WALL.h }, ...marketRows(rect, sd)]));
  }
  // ── the city wall and its gates; the Kunming Lake and the tower-ship; the academy ──
  {
    const E = [], th = CITY_WALL.th, h = CITY_WALL.h;
    const wn = GATE_W.w - 2 + 2;
    for (const { a, b } of cityWalls()) {
      const alongX = Math.abs(b[0] - a[0]) > Math.abs(b[1] - a[1]), gaps = [];
      if (alongX && Math.abs(a[1] - WALL_S) < 1 && GATE_S.x > a[0] && GATE_S.x < b[0]) gaps.push({ at: GATE_S.x - a[0], w: 28.8 });
      if (!alongX && Math.abs(a[0] - WALL_W) < 1 && GATE_W.z > a[1] && GATE_W.z < b[1]) gaps.push({ at: GATE_W.z - a[1], w: 28.8 });
      const Ls = alongX ? Math.abs(b[0] - a[0]) : Math.abs(b[1] - a[1]), at = [], sheds = [];
      // a ramp every ~120 m and a sentries' shed between them, clear of the gate (the wall runs a → b; the city lies to +z (north wall), −z (south), +x (west), −x (east))
      const inner = alongX ? (Math.abs(a[1] - WALL_S) < 1 ? -1 : 1) : (Math.abs(a[0] - WALL_W) < 1 ? 1 : -1);
      const gc = gaps.length ? gaps[0].at : -1e9;
      for (let m = 40; m < Ls - 30; m += 120) if (Math.abs(m - gc) > 40) at.push(m);
      for (let m = 100; m < Ls - 30; m += 120) if (Math.abs(m - gc) > 30) sheds.push(m);
      E.push({ t: 'han_wall', a, b, th, h, mat: 'earth_wall', walk: true, layers: true, gaps, ramps: at, sheds, inner });
    }
    E.push({ t: 'han_gate', c: [WALL_W, GATE_W.z], axis: 'z', th, h, n: 3, pw: 6, pier: 2.4, ph: 5.4 });
    E.push({ t: 'han_gate', c: [GATE_S.x, WALL_S], axis: 'x', th, h, n: 3, pw: 6, pier: 2.4, ph: 5.4 });
    void wn;
    for (const b of BRIDGES) E.push({ t: 'han_bridge', ...b, y: MOAT_Y });
    plans.push(base('han-citywall', E));
    const A = ACADEMY, cx = (A[0] + A[2]) / 2, L = walledRect(A, 1.6, 3.4, 'earth_wall', [{ side: 'n', c: cx, w: 6 }]);
    for (const e of L) if (e.t === 'han_gate') { e.h = 3.4; e.th = 1.6; e.ph = 2.6; e.pw = 3; }
    L.push({ t: 'han_hall', cx, z1: A[3] - 16, bays: 5, bayW: 6, depth: 2, depthW: 6, floor: 0.9, base: 0.9, h: 5.0, roof: 'gable', rise: 3.4, overhang: 2.4, ap: 1.6, furnish: 'lecture', open: [2, 2], seed: 61 });
    for (const s of [-1, 1]) L.push({ t: 'han_hall', cx: cx + s * 40, z1: A[1] + 30, bays: 4, bayW: 6, depth: 2, depthW: 6, floor: 0.9, base: 0.9, h: 4.6, roof: 'gable', rise: 3.2, overhang: 2.2, ap: 1.6, furnish: 'lecture', open: [1, 2], seed: 62 + s });
    plans.push(base('han-academy', L));
    plans.push(base('han-lake', [{ t: 'han_lake', c: LAKE.c, rx: LAKE.rx, rz: LAKE.rz, y: LAKE_Y, pier: [LAKE.c[0] + 40, LAKE.c[1] - LAKE.rz * 0.96] }, { t: 'han_ship', at: [LAKE.c[0] - 8, LAKE.c[1] + 4], y: LAKE_Y, len: 16, yaw: 0 }]));
  }
  {
    const A = AVENUE_BAND;
    plans.push(base('han-avenue', [{ t: 'floor', rect: A.mid, y: 0.04, mat: 'brick_paving', th: 0.3 }, { t: 'floor', rect: A.kerbW, y: 0.1, mat: 'bluestone', th: 0.3 }, { t: 'floor', rect: A.kerbE, y: 0.1, mat: 'bluestone', th: 0.3 }]));
  }
  plans.push({ ...base('han-people', people()), style: 'life' }, ...lifePlans());
  void TIERS; void rand;
  return (CACHE = plans);
}
