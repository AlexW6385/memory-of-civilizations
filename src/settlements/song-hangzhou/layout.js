// Southern Song Lin'an (c. 1200) — the layout (docs/settlements/song-hangzhou.md §2, §12): the
// river along the south behind its stone flood wall and the road on top of the bank; Yuelun Hill to
// the west with the Liuhe Pagoda on its lower slope and Kaihua Temple's halls behind it; the city's
// south wall across the middle with its gate on the Imperial Way (御街) and its water gate where the
// canal comes through; inside, the dense city — the Imperial Way running north between its shop
// houses, lanes, wells, fire-watch towers, warehouses (塌房) on the canal; outside the wall the
// Longshan quarter down to the river road; in the north-west the West Lake with the Su Causeway across
// it, its east shore on the city's west wall at the Yongjin Gate. A compressed composite of Lin'an (§12).
// Pure data. Coordinates: metres, +x east, +z south (the river).

export const RADIUS = 520;
export const LEVEL = { river: -2.2, bed: -5, canal: -1.4, canalBed: -3, street: 0, lake: -1.4, lakeBed: -2.0 };
export const WALL = { z0: 142, z1: 150 };              // the flood wall (its top a walk)
export const ROAD = { z0: 130, z1: 142 };              // the road along the river
export const HILL = { c: [-190, -150], r: 235, h: 66 };
export const PAGODA = { c: [-110, 76], y: 8 };
export const T1 = { rect: [-142, 52, -78, 102], y: 8 };   // the pagoda's terrace
export const T2 = { rect: [-146, -12, -74, 36], y: 16 };   // the temple's upper terrace
export const CANAL = { x0: 138, x1: 150, z0: -440, z1: WALL.z1 };
export const CANAL_STREETS = [[126, CANAL.z0, 138, ROAD.z0], [150, CANAL.z0, 162, ROAD.z0]];
export const CANAL_BRIDGES = [-230, -120, -10, 90, 136];   // z of the canal's arched bridges (plan.js)
// the city wall: the south wall across the middle, the west wall along the lake; rammed earth faced with brick
export const CITY = { zs: -32, th: 16, h: 9, xw: -30, x1: RADIUS - 34, zn: -232 };   // zs the south wall's centre line, zn the north wall's, xw the west wall's
export const GATE = { x: 28, w: 10, rect: [12, CITY.zs - 8, 44, CITY.zs + 8], H: 9.6 };      // the south gate on the Imperial Way
export const WATER_GATE = [122, 166];                                                       // the canal's gate in the south wall (x range)
export const IMPERIAL = [20, CITY.zn - 14, 36, ROAD.z0];                                    // the Imperial Way, 16 m, from the lake gate's shore to the river road
export const LAKE_GATE = { x: 28, w: 10, rect: [12, CITY.zn - 8, 44, CITY.zn + 8], H: 9.6 };   // the north gate, onto the lake's shore
/**
 * The West Lake (西湖) in the north-west: the shore runs along z = shoreZ(x) (the south shore, 12–30 m
 * north of the city's north wall) and x = shoreX(z) (the east shore); the ground is the bank for 16 m
 * inside the shore contour, then the lake's bed. Water stands where the depth into the lake exceeds
 * WEST_LAKE.waterDepth. Other agents' lake pieces (causeway, pavilion, jetty) stand in the water at
 * `level`; the shore band is for the willows, peaches and lotus planted here.
 */
export const shoreZ = (x) => -262 + 6 * Math.sin(x / 41) + 4 * Math.sin(x / 17 + 2);
export const shoreX = (z) => 100 + 7 * Math.sin(z / 33);
/** How far inside the lake's shore contour (m; negative on land). */
export const lakeDepth = (x, z) => Math.min(shoreZ(x) - z, shoreX(z) - x);
export const WEST_LAKE = { level: LEVEL.lake, bed: LEVEL.lakeBed, bank: 16, waterDepth: 10.3, rect: [-RADIUS + 20, -RADIUS + 20, 112, -246] };
/** Is (x, z) in the West Lake's water? */
export const inWestLake = (x, z) => lakeDepth(x, z) > WEST_LAKE.waterDepth && Math.hypot(x, z) < RADIUS - 30;
export const inLake = inWestLake;
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
/** The hill: Yuelun in the south-west, rising to the north-west to the ridge behind the lake's south shore; flat inside the city's wall and north of z = −262 (the lake). */
function hillBase(x, z) {
  const q = Math.hypot(x - HILL.c[0], z - HILL.c[1]) / HILL.r;
  if (q >= 1) return 0;
  return HILL.h * smooth(0, 1, 1 - q) * smooth(-262, -200, z) * (1 - smooth(-130, -50, x));
}
/** Levelled pads on the hill for the pavilions of the temple path (hill.js, §26): { c, r (level), b (blend out), y }. */
export const HILL_PADS = [{ c: [-198, -124], r: 5, b: 5 }, { c: [-170, -72], r: 4, b: 4 }].map((p) => ({ ...p, y: hillBase(p.c[0], p.c[1]) }));
export function hill(x, z) {
  let h = hillBase(x, z);
  for (const p of HILL_PADS) { const d = Math.hypot(x - p.c[0], z - p.c[1]); if (d < p.r + p.b) { const w = 1 - smooth(p.r, p.r + p.b, d); h = h * (1 - w) + p.y * w; } }
  return h;
}
export const inRiver = (x, z) => z > WALL.z1;
export const inCanal = (x, z) => x > CANAL.x0 && x < CANAL.x1 && z > CANAL.z0 && z < CANAL.z1;
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const fits = (r, m) => Math.max(...[[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]]].map(([a, b]) => Math.hypot(a, b))) <= RADIUS - m;

// ---- the streets (paved rectangles; each a { r, kind }): the Imperial Way (in two pieces, the gate between), lanes across and along
const EW_IN = [-205, -160, -120, -75];                           // lanes inside the walls (−120 crosses the canal on its bridge)
const EW_OUT = [-10, 45, 90];                                   // lanes outside the south wall, between it and the road (−10 and 90 cross on bridges)
const EW_N = [-290, -350, -405];                                // lanes in the northern suburb, east of the canal
const NS_X = [90, 232, 322, 412];                               // lanes running north–south
const LANE = 8, NS = 7;
const WEST_X = CITY.xw + 8 + 1;                                  // lanes start inside the west wall
const HALF = (z) => Math.sqrt(Math.max(0, (RADIUS - 8) ** 2 - z * z));
let STREETS = null;
/** All the paved streets other than the canal streets and the road: [{ r: [x0, z0, x1, z1], kind: 'imperial' | 'lane' | 'lane-ns' }]. */
export function streets() {
  if (STREETS) return STREETS;
  STREETS = [];
  const gz0 = CITY.zs - CITY.th / 2 - 0.2, gz1 = CITY.zs + CITY.th / 2 + 0.2, nz0 = CITY.zn - CITY.th / 2 - 0.2, nz1 = CITY.zn + CITY.th / 2 + 0.2;
  STREETS.push({ r: [IMPERIAL[0], IMPERIAL[1], IMPERIAL[2], nz0], kind: 'imperial' }, { r: [IMPERIAL[0], nz1, IMPERIAL[2], gz0], kind: 'imperial' }, { r: [IMPERIAL[0], gz1, IMPERIAL[2], IMPERIAL[3]], kind: 'imperial' });
  const ew = (z, xa, xb) => { const h = HALF(z); const a = Math.max(xa, -h), b = Math.min(xb, h); if (b - a > 6) STREETS.push({ r: [a, z - LANE / 2, b, z + LANE / 2], kind: 'lane' }); };
  for (const z of EW_IN) { ew(z, WEST_X, IMPERIAL[0]); ew(z, IMPERIAL[2], CANAL_STREETS[0][0]); ew(z, CANAL_STREETS[1][2], RADIUS); }
  for (const z of EW_N) ew(z, CANAL_STREETS[1][2], RADIUS);
  for (const z of EW_OUT) { ew(z, WEST_X, IMPERIAL[0]); ew(z, IMPERIAL[2], CANAL_STREETS[0][0]); ew(z, CANAL_STREETS[1][2], RADIUS); }
  const ns = (x, za, zb) => { const h = Math.sqrt(Math.max(0, (RADIUS - 8) ** 2 - x * x)); const a = Math.max(za, -h), b = Math.min(zb, h); if (b - a > 6) STREETS.push({ r: [x - NS / 2, a, x + NS / 2, b], kind: 'lane-ns' }); };
  for (const x of NS_X) { ns(x, nz1, gz0); ns(x, gz1, ROAD.z0); if (x > CANAL_STREETS[1][2]) ns(x, CANAL.z0 + 4, nz0); }
  // the lane across the canal's bridges is cut by the canal itself: the bridges join them
  return STREETS;
}
export const STREET_RECTS = () => streets().map((s) => s.r);
// the plots kept free of houses: the warehouses on the canal, the fire-watch towers on the Imperial Way, the wells' corners
export const WAREHOUSES = [[166, 96, 196, 124], [200, 96, 230, 124]];
export const TAFANG = [[166, -199, 196, -166], [166, -114, 196, -81], [94, -199, 124, -166]];   // 塌房, the storehouses by the canal inside the wall
export const TAFANG_FRONT = ['w', 'w', 'e'];
export const WATCH_TOWERS = [[38.5, -188, 45, -181.5], [38.5, -98, 45, -91.5], [11, -142, 17.5, -135.5]];   // 望火楼, a tower to each ward
/**
 * 瓦子 (wazi): the walled entertainment ground of the lane quarter, with its theatres (勾栏) — a block between two lanes east of the Way (§24).
 * `gates`: the openings of its fence: side 's' (onto the lane south of it) at x, side 'e' (onto the lane running north-south) at z.
 */
export const WAZI = { rect: [58.4, -155, 86, -125], gates: [{ side: 's', at: 72.5 }, { side: 'e', at: -130 }] };
/** Wells in the lanes: [x, z] on a lane's edge. */
export function wells() {
  const out = [];
  for (const s of streets()) {
    if (s.kind === 'imperial') continue;
    const [x0, z0, x1, z1] = s.r, horiz = x1 - x0 > z1 - z0, len = horiz ? x1 - x0 : z1 - z0;
    const n = Math.floor(len / 85);
    for (let k = 0; k < n; k++) { const t = (k + 0.5) / n, side = (k + Math.round(x0 / 7)) % 2 ? 1 : -1; const p = horiz ? [x0 + len * t, (z0 + z1) / 2 + side * (LANE / 2 - 1.1)] : [(x0 + x1) / 2 + side * (NS / 2 - 1.1), z0 + len * t]; if (Math.hypot(...p) < RADIUS - 40) out.push(p); }
  }
  return out;
}

let LOTS = null;
/**
 * The town's houses, in the order of how rich their detail is: the Imperial Way's shop houses (kind
 * 'row' or 'court', two storeys, tea houses and shops), the canal streets' houses, the road's tea houses
 * and shops, rows along the lanes (the lanes inside the wall denser than those of the Longshan quarter).
 * Each { rect, front, storeys, shop, seed, kind, detail, roof, where }.
 */
export function lots() {
  if (LOTS) return LOTS;
  LOTS = [];
  const rand = rng(1165), taken = [];
  const hit = (r, o, m = 0.3) => r[0] < o[2] + m && r[2] > o[0] - m && r[1] < o[3] + m && r[3] > o[1] - m;
  const S = STREET_RECTS();
  const wall = [[CITY.xw - 8, CITY.zn - 6, CITY.xw + 8, CITY.zs + CITY.th / 2 + 6], [CITY.xw - 8, CITY.zn - CITY.th / 2 - 6, CITY.x1 + 40, CITY.zn + CITY.th / 2 + 6], [CITY.xw - 8, CITY.zs - CITY.th / 2 - 6, CITY.x1 + 40, CITY.zs + CITY.th / 2 + 6]];
  const fixed = [...CANAL_STREETS, ...S, ...wall, ...WAREHOUSES, ...TAFANG, ...WATCH_TOWERS, WAZI.rect, [CANAL.x0 - 1, CANAL.z0, CANAL.x1 + 1, CANAL.z1], [-150, -20, -70, 110], [-70, 100, -40, 130]];
  const detailAt = (r) => { const d = Math.hypot((r[0] + r[2]) / 2 - 28, (r[1] + r[3]) / 2 + 120); return d < 150 ? 2 : d < 300 ? 1 : 0; };
  const add = (r, front, storeys, shop, extra = {}) => {
    if (!fits(r, 24) || hill((r[0] + r[2]) / 2, (r[1] + r[3]) / 2) > 1.5) return false;
    if (fixed.some((o) => hit(r, o, -0.05)) || taken.some((o) => hit(r, o, 0.25))) return false;
    const d = (r[1] + r[3]) / 2 < -440 ? 0 : detailAt(r);
    LOTS.push({ rect: r, front, storeys, shop, seed: Math.floor(rand() * 1e6), kind: 'row', detail: d, roof: rand() < 0.8 ? 'gable' : 'hip', ...weather(front, storeys, shop, extra), ...extra });
    taken.push(r);
    return true;
  };
  // the houses' weathering and variety (its own stream, so that the plots stay as they are): the lime wash fresh, streaked by the rain, greened by the damp
  // (more by the canal), or dull grey where it was not renewed; old tiles weathered paler; the upper floor jutting over the street in some of the shops
  const rw = rng(7741);
  const weather = (front, storeys, shop, extra) => {
    const r = rw(), q = rw(), o = rw(), damp = extra.where === 'canal' ? 2.2 : 1, a = 5, b = 3, c = 1.2 * damp, d = 0.8;
    const t = r * (a + b + c + d), pal = {};
    if (t > a + b + c) { pal.plaster = 'plaster_grey'; pal.plinth = 'brick_grey'; } else if (t > a + b) pal.plaster = 'plaster_damp'; else if (t > a) pal.plaster = 'plaster_streak';
    if (q < 0.18) pal.roof = 'tile_grey';
    return { pal: Object.keys(pal).length ? pal : undefined, overhang: storeys > 1 && shop && o < (extra.where === 'imperial' ? 0.55 : 0.3) };
  };
  // The fronts run on without gaps (Suzhou's density): a strip is walked along its length, the free stretches between what is fixed or already taken are
  // divided into houses that abut (shared party walls), the depth drawn in (to 70 %, 55 %, 7 m) where a tower or a lane's end bites into it; now and then a
  // fire lane (huo xiang) of 1.5 m is left between two houses. A run shorter than 4.2 m is left to the lane.
  const MINW = 4.2;
  const run = (horiz, a0, a1, c0, c1, front, shopP, st2, extra) => {
    const sgn = front === 's' || front === 'e' ? 1 : -1, dep0 = c1 - c0;
    const R = (s0, s1, dep) => { const cf = sgn > 0 ? c1 : c0, cb = sgn > 0 ? c1 - dep : c0 + dep, lo = Math.min(cf, cb), hi = Math.max(cf, cb); return horiz ? [s0, lo, s1, hi] : [lo, s0, hi, s1]; };
    const obst = () => [...fixed, ...taken];
    let s = a0;
    while (s < a1 - MINW) {
      let dep = 0;
      for (const f of [1, 0.75, 0.55, 7 / dep0]) { const d = dep0 * f; if (d >= 7 && !obst().some((o) => hit(R(s, s + MINW, d), o, -0.02))) { dep = d; break; } }
      if (!dep) { const b = obst().filter((o) => hit(R(s, s + MINW, 7), o, -0.02)).map((o) => (horiz ? o[2] : o[3])); s = Math.max(s + 0.5, ...b); continue; }
      let e = a1;
      for (const o of obst()) if (hit(R(s, a1, dep), o, -0.02)) { const os = horiz ? o[0] : o[1]; if (os > s && os < e) e = os; }
      const len = e - s;
      if (len < MINW) { s = e + 0.1; continue; }
      const n = Math.max(1, Math.round(len / 8.2)), ws = []; let tot = 0;
      for (let i = 0; i < n; i++) { const q = 0.78 + rand() * 0.44; ws.push(q); tot += q; }
      let acc = s;
      const made = [];
      for (let i = 0; i < n; i++) {
        const wi = i === n - 1 ? e - acc : len * ws[i] / tot, r = R(acc, acc + wi, dep);
        acc += wi;
        if (!fits(r, 24) || hill((r[0] + r[2]) / 2, (r[1] + r[3]) / 2) > 1.5) continue;
        const d = (r[1] + r[3]) / 2 < -440 ? 0 : detailAt(r), end = i === 0 || i === n - 1;
        const ex = extra?.() || {};
        LOTS.push({ rect: r, front, storeys: rand() < st2 ? 2 : 1, shop: rand() < shopP, seed: Math.floor(rand() * 1e6), kind: 'row', detail: d, roof: end && rand() < 0.7 ? 'hip' : (rand() < 0.85 ? 'gable' : 'hip'), ...ex });
        const l = LOTS[LOTS.length - 1]; Object.assign(l, weather(front, l.storeys, l.shop, l), ex);
        made.push(r);
      }
      taken.push(...made);
      s = e + (rand() < 0.07 ? 1.5 : 0);
    }
  };
  const row = (x0, x1, z0, z1, front, shopP, st2 = 0.6, extra) => run(true, x0, x1, z0, z1, front, shopP, st2, extra);
  const col = (z0, z1, x0, x1, front, shopP, st2 = 0.6, extra) => run(false, z0, z1, x0, x1, front, shopP, st2, extra);
  // 1. the Imperial Way: both sides, in deep lots (their courts behind), shops nearly all, two storeys
  const iw = () => ({ kind: rand() < 0.3 ? 'court' : 'row', detail: 2, where: 'imperial' });
  const gate0 = CITY.zs - CITY.th / 2 - 6, gate1 = CITY.zs + CITY.th / 2 + 6, ng = CITY.zn + CITY.th / 2 + 6;
  for (const [z0, z1] of [[ng, gate0], [gate1, ROAD.z0 - 18]]) {
    col(z0, z1, IMPERIAL[0] - 22, IMPERIAL[0], 'e', 0.92, 0.85, iw);
    col(z0, z1, IMPERIAL[2], IMPERIAL[2] + 22, 'w', 0.92, 0.85, iw);
  }
  // 2. the canal streets, both sides
  for (const [z0, z1] of [[CANAL.z0 + 10, CITY.zn - CITY.th / 2 - 6], [ng, gate0], [gate1, ROAD.z0 - 18]]) {
    col(z0, z1, CANAL_STREETS[0][0] - 13, CANAL_STREETS[0][0], 'e', 0.6, 0.6, () => ({ where: 'canal' }));
    col(z0, z1, CANAL_STREETS[1][2], CANAL_STREETS[1][2] + 13, 'w', 0.6, 0.6, () => ({ where: 'canal' }));
  }
  // 3. the river road: houses on its north side (west of the canal: tea houses toward the pagoda)
  row(-70, IMPERIAL[0] - 1, ROAD.z0 - 14, ROAD.z0, 's', 0.8);
  row(IMPERIAL[2] + 1, CANAL_STREETS[0][0] - 2, ROAD.z0 - 14, ROAD.z0, 's', 0.8);
  row(CANAL_STREETS[1][2] + 18, RADIUS, ROAD.z0 - 14, ROAD.z0, 's', 0.8);
  // 4. the lanes: a row of houses on each side, between each pair of lanes, as deep as the space allows
  const strips = (zs, x0, x1, shopP, inside) => {
    for (let i = 0; i < zs.length - 1; i++) {
      const za = zs[i] + LANE / 2 + 0.3, zb = zs[i + 1] - LANE / 2 - 0.3, d = Math.min(inside ? 22 : 16, (zb - za) / 2 - 0.2);
      if (d < 7) continue;
      const ex = () => ({ kind: d > 17 && rand() < 0.25 ? 'court' : 'row', where: 'lane' });
      row(x0, x1, za, za + d, 'n', shopP, inside ? 0.7 : 0.4, ex);
      row(x0, x1, zb - d, zb, 's', shopP, inside ? 0.7 : 0.4, ex);
    }
  };
  const inside = [CITY.zn + 12, ...EW_IN, CITY.zs - CITY.th / 2 - 14].sort((a, b) => a - b);
  strips(inside, WEST_X, IMPERIAL[0] - 22.3, 0.25, true);
  strips(inside, IMPERIAL[2] + 22.3, CANAL_STREETS[0][0] - 13.3, 0.3, true);
  strips(inside, CANAL_STREETS[1][2] + 13.3, CITY.x1 - 6, 0.25, true);
  const north = [-445, ...EW_N, CITY.zn - 20];
  strips(north, CANAL_STREETS[1][2] + 13.3, RADIUS, 0.2, false);
  const outside = [CITY.zs + CITY.th / 2 + 14, ...EW_OUT, ROAD.z0 - 30].sort((a, b) => a - b);
  strips(outside, WEST_X, IMPERIAL[0] - 22.3, 0.2, false);
  strips(outside, IMPERIAL[2] + 22.3, CANAL_STREETS[0][0] - 13.3, 0.25, false);
  strips(outside, CANAL_STREETS[1][2] + 13.3, RADIUS, 0.2, false);
  return LOTS;
}
let TEA = null;
/** The tea houses on the road below the pagoda: three of the wide shop lots nearest its stair (built with the old tea_house element, furnished by the town). */
export function riverTeaHouses() {
  if (!TEA) TEA = lots().filter((l) => l.front === 's' && l.shop && l.rect[3] > ROAD.z0 - 1 && l.rect[0] < -30 && l.rect[2] - l.rect[0] > 8).slice(0, 3);
  return TEA;
}
let GRID = null;
export function inLot(x, z, m = 0) {
  if (!GRID) { GRID = new Map(); for (const h of lots()) for (let i = Math.floor((h.rect[0] - 3) / 20); i <= Math.floor((h.rect[2] + 3) / 20); i++) for (let j = Math.floor((h.rect[1] - 3) / 20); j <= Math.floor((h.rect[3] + 3) / 20); j++) { const k = i + ',' + j; if (!GRID.has(k)) GRID.set(k, []); GRID.get(k).push(h); } }
  const l = GRID.get(Math.floor(x / 20) + ',' + Math.floor(z / 20));
  return !!l && l.some((h) => inRect(h.rect, x, z, m));
}
/** Is (x, z) on a street, the wall, a gate or under the town's other built ground (no plants)? */
export function onStreet(x, z, m = 0) {
  if (streets().some((s) => inRect(s.r, x, z, m))) return true;
  if (CANAL_STREETS.some((r) => inRect(r, x, z, m))) return true;
  return false;
}
export function onWall(x, z, m = 0) {
  return inRect([CITY.xw - 9, CITY.zn - 9, CITY.xw + 9, CITY.zs + 9], x, z, m) || inRect([CITY.xw - 9, CITY.zs - 9, CITY.x1, CITY.zs + 9], x, z, m) || inRect([CITY.xw - 9, CITY.zn - 9, CITY.x1, CITY.zn + 9], x, z, m);
}

/**
 * Where the Imperial Way is spanned (§24): sunshades of cloth and strings of lanterns on poles at the aprons' edge, one every ~34 m, not at a lane's
 * mouth or beside a fire-watch tower. [{ z, kind: 'shade' | 'lamps' }] (the poles stand at x = IMPERIAL[0] + 2.2 and IMPERIAL[2] − 2.2).
 */
let SPANS = null;
export function spans() {
  if (SPANS) return SPANS;
  SPANS = [];
  const lanes = [...EW_IN, ...EW_OUT], towers = WATCH_TOWERS.map((t) => (t[1] + t[3]) / 2);
  const gz0 = CITY.zs - CITY.th / 2 - 8, gz1 = CITY.zs + CITY.th / 2 + 8, ng = CITY.zn + CITY.th / 2 + 8;
  const ok = (z) => !lanes.some((l) => Math.abs(l - z) < LANE / 2 + 1.2) && !towers.some((t) => Math.abs(t - z) < 7);
  for (const [a, b] of [[ng, gz0], [gz1, ROAD.z0 - 22]]) for (let z = a + 10; z < b - 4; z += 28) {
    const zz = [0, 4, -4, 8, -8, 12].map((d) => z + d).find((q) => ok(q) && q < b - 4 && q > a);
    if (zz !== undefined) SPANS.push({ z: zz, kind: SPANS.length % 2 ? 'shade' : 'lamps' });
  }
  return SPANS;
}
/** The gates (坊门) across the lanes where they meet the Way: [{ at: [x, z], axis: 'z' (the lane runs east–west; the posts stand either side of it) }]. */
let FANG = null;
export function fangGates() {
  if (FANG) return FANG;
  FANG = [];
  for (const z of [...EW_IN, ...EW_OUT]) for (const x of [IMPERIAL[0] - 5.5, IMPERIAL[2] + 5.5]) {
    if (!streets().some((s) => s.kind === 'lane' && x > s.r[0] + 1 && x < s.r[2] - 1 && Math.abs((s.r[1] + s.r[3]) / 2 - z) < 0.1)) continue;
    FANG.push({ at: [x, z], axis: 'z' });
  }
  return FANG;
}

/** The canal's landings (granite steps down to the water, §12): [{ z, west: bool, hl: half length }] — every 31–43 m on both banks, clear of the bridges and the walls. */
let LAND = null;
export function canalLandings() {
  if (LAND) return LAND;
  LAND = [];
  const r = rng(1090);
  for (const west of [true, false]) for (let z = -420; z < 120; z += 31 + r() * 12) {
    if (CANAL_BRIDGES.some((bz) => Math.abs(bz - z) < 12) || Math.abs(z - CITY.zs) < 18 || Math.abs(z - CITY.zn) < 18) continue;
    LAND.push({ z, west, hl: r() < 0.4 ? 2.2 : 1.1 });
  }
  return LAND;
}
