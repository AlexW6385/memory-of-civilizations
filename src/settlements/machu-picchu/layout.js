// Machu Picchu (c. 1450–1530) — the layout of the settlement (docs/settlements/machu-picchu.md §2):
// the town on its saddle between the peaks of Machu Picchu (south, +z) and Huayna Picchu (north, -z), the
// Main Plaza in the middle, the Sacred sector and the Temple of the Sun on the west, the houses in
// kanchas on both sides, terraces stepping down every flank, the canyon of the Urubamba below and
// the mountains beyond. Pure data. Coordinates: metres, +x east, +z south... the ridge runs along z.

export const RADIUS = 330;
export const SITE = { a: 95, b: 175 };                     // the saddle's top: an ellipse (x half-width, z half-length)
export const TERRACE = { w: 3, h: 2.6, n: 15 };           // terraces round it: 3 m deep, 2.6 m high, 15 of them
export const PLAZA = [-18, -52, 22, 8];
export const PEAKS = [{ c: [0, -208], r: 88, h: 175 }, { c: [-14, 208], r: 88, h: 205 }];   // Huayna Picchu (north), Machu Picchu mountain (south)
export const HILL = { c: [-45, -82], r: 16, n: 5 };       // the Intihuatana's hill, north-west of the Main Plaza: five terraces of 2.2 m
/** The knoll at the saddle's south end, under Machu Picchu mountain, with the Guardhouse on top: eight terraces of 2.2 m (17.6 m: the view over the town and the gorge). */
export const KNOLL = { c: [-24, 138], r: 23.5, n: 8 };
/** A terraced hill's height at (x, z): 2.2 m a terrace, each ring 2.4 m in from the one below (the ring walls stand on these radii). */
export const hillRing = (H, k) => H.r + 6 - 2.4 * (k + 1);
export function hillHeight(H, x, z) { const d = Math.hypot(x - H.c[0], z - H.c[1]); return 2.2 * Math.max(0, Math.min(H.n, Math.floor((H.r + 6 - d) / 2.4))); }
/**
 * The south end of the town: the town wall across the saddle with the main gate; before it the dry ditch along
 * a fault line that parts the urban sector from the agricultural [stated: peru-explorer]; south of it the fields
 * and the five storehouses [stated: "five storerooms" in the agricultural sector — peru-explorer].
 */
export const TOWN_WALL = { z: 84, gate: 2 }, DITCH = { z: 89, top: 3, bottom: 1, depth: 2, x0: -50 };
export const FIELDS = [-90, 93, 90, 175];
/** The chaski's hut by the road and its yard: bare ground. */
export const HUT = [6.5, 118.6, 10.9, 123.2];
export const STORES = Array.from({ length: 5 }, (_, i) => [-50 + i * 7.6, 96, -44.6 + i * 7.6, 100.2]);
/** The kallanka on the Main Plaza's east side, 47.5 × 6.5 m, its seven doors to the plaza [stated: 47.5 × 6.5 m, the largest building of Machu Picchu — Wikipedia, "Kallanka"; inferred: the place]. */
export const KALLANKA = [24.5, -49, 31, -1.5];
/** The Main Plaza's three flights down into it (3 m): at the road, at the west and at the kallanka's middle door. */
export const PLAZA_STAIRS = [
  { rect: [0.9, PLAZA[3] - 6.2, 3.1, PLAZA[3] + 0.3], dir: 's', y0: -3, y1: 0 },
  { rect: [PLAZA[0] - 0.3, -25.1, PLAZA[0] + 6.2, -22.9], dir: 'w', y0: -3, y1: 0 },
  { rect: [PLAZA[2] - 6.2, -26.1, PLAZA[2] + 0.3, -23.9], dir: 'e', y0: -3, y1: 0 },
];
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;

/**
 * The neck: south of the shoulders (z > z0) the saddle is only 2 w wide, centred on xc: the ridge narrows to the strip the
 * way in runs along, with the terraces falling away on both sides and the shoulders cut straight across (the town wall
 * stands on the edge of the first, the Guardhouse's knoll at the neck's end) [inferred: the saddle at Machu Picchu is a
 * narrow spine; the agricultural sector and the way in follow its crest — peru-explorer].
 */
export const NECK = { xc: -20, w: 34, z0: 79 };
/** Distance (m) outside the saddle's shape (the ellipse cut to the neck), measured as the growth s that brings (x, z) on to it (negative inside). */
export function outside(x, z) {
  const f = (s) => (x / (SITE.a + s)) ** 2 + (z / (SITE.b + s)) ** 2 - 1;
  let dE;
  if (f(0) <= 0) { let lo = -SITE.a + 1, hi = 0; for (let i = 0; i < 18; i++) { const m = (lo + hi) / 2; if (f(m) > 0) lo = m; else hi = m; } dE = hi; }
  else { let lo = 0, hi = 600; for (let i = 0; i < 22; i++) { const m = (lo + hi) / 2; if (f(m) > 0) lo = m; else hi = m; } dE = hi; }
  return Math.max(dE, Math.min(z - NECK.z0, Math.abs(x - NECK.xc) - NECK.w));
}
/** The saddle's west edge at z (x), the neck's strip or the ellipse, whichever is the nearer. */
export const westEdge = (z, d = 0) => Math.max(z > NECK.z0 - d ? NECK.xc - NECK.w - d : -1e9, -(SITE.a + d) * Math.sqrt(Math.max(0, 1 - (z / (SITE.b + d)) ** 2)));
/** The terrace level (0, 1, …) at distance d outside the ellipse, or -1 past the terraces. */
export const terraceAt = (d) => (d < 0 ? 0 : d < TERRACE.w * TERRACE.n ? Math.floor(d / TERRACE.w) + 1 : -1);
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** The Sacred Rock (its centre) and the two wayronas facing each other across its court, open to it. */
export const SACRED_ROCK = { c: [12, -147.5], wayronas: [[[0, -144, 5, -134], 'e'], [[19, -144, 24, -134], 'w']] };
const ROCK_COURT = [-2, -152, 26, -131];

/** The west stair's fountains: the court of each, on its terrace level j, south of the stair (z > 0) but the first, north of it. */
const xAt = (d, z) => -(SITE.a + d) * Math.sqrt(1 - (z / (SITE.b + d)) ** 2);
export function fountains() {
  const out = [], zc = 2.6;
  for (let i = 0; i < 16; i++) {
    const j = Math.max(1, i), z = i === 0 ? -zc : zc, dBack = TERRACE.w * (j - 1) + 0.95, dFront = TERRACE.w * j - 0.3, d = dFront - dBack, x = xAt((dBack + dFront) / 2, z);
    out.push({ c: [x, z], y: -TERRACE.h * j, ox: -1, oz: 0, w: 2.0, d });
  }
  return out;
}
/** The canal: from the foot of the mountain to the south, along the saddle's west edge 1.2 m in, to the head of the terrace wall over the first fountain. */
let CANAL = null;
export function canal() {
  if (CANAL) return CANAL;
  const pts = [], zc = NECK.z0, xn = NECK.xc - NECK.w + 1.2;
  // down the neck's west edge from the foot of the mountain (where the ellipse is the narrower, along it), round the corner of the shoulder and along the shoulder's edge to the ellipse
  for (let z = 158.2; z > zc; z -= 1.5) pts.push([Math.max(xn, xAt(-1.2, z)), z]);
  for (let i = 0; i <= 6; i++) { const a = i / 6 * Math.PI / 2; pts.push([NECK.xc - NECK.w + 1.2 * Math.cos(a), zc - 1.2 * Math.sin(a)]); }
  { const xe = xAt(-1.2, zc - 1.2); for (let x = NECK.xc - NECK.w - 1.5; x > xe; x -= 1.5) pts.push([x, zc - 1.2]); pts.push([xe, zc - 1.2]); }
  for (let z = zc - 1.2 - 1.5; z >= -2.6; z -= 1.5) pts.push([xAt(-1.2, z), z]);
  pts.push([xAt(-1.2, -2.6), -2.6], [xAt(-0.6, -2.6), -2.6], [xAt(0.25, -2.6), -2.6]);
  CANAL = pts;
  return pts;
}
const nearCanal = (x, z, m) => { if (x > -36 || z < -4 || z > 161) return false; const p = canal(); for (let i = 0; i + 1 < p.length; i++) { const [ax, az] = p[i], [bx, bz] = p[i + 1], dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / l2)); if (Math.hypot(x - ax - dx * t, z - az - dz * t) < m) return true; } return false; };
/** The Temple of the Condor, north-west below the Sacred Plaza: the carved floor, head and wings, its back wall of cells [stated: general; place inferred]. */
export const CONDOR = { c: [-56, -108], yaw: 0.5, rect: [-66, -118, -46, -98] };
const TOMB = [-45.5, 12.5, -22.5, 31.5];
/** Ground built over, where no grass grows: the canal, the fountains' courts, the cave under the Torreón, the Sacred Rock's base and the wayronas' floors. */
let PAVED = null;
export function paved(x, z) {
  if (!PAVED) {
    PAVED = fountains().map((f) => [f.c[0] - f.d / 2 - 1.1, f.c[1] - f.w / 2 - 0.5, f.c[0] + f.d / 2 + 0.2, f.c[1] + f.w / 2 + 0.5]);
    PAVED.push([-32.5, 22.4, -26.5, 27.6], [SACRED_ROCK.c[0] - 4.4, SACRED_ROCK.c[1] - 1.4, SACRED_ROCK.c[0] + 4.4, SACRED_ROCK.c[1] + 1.4]);
    for (const [r] of SACRED_ROCK.wayronas) PAVED.push([r[0] - 1.4, r[1] - 1.4, r[2] + 1.4, r[3] + 1.4]);
  }
  return PAVED.some((r) => inRect(r, x, z)) || nearCanal(x, z, 0.3);
}
/** The canal and the fountains as elements (the ground's height passed in, for the canal to lie on). */
export function waterworks(height) {
  const p = canal(), n = p.length;
  const pts = p.map(([x, z], i) => [x, z, i >= n - 2 ? 0.06 : height(x, z)]);
  const [hx, hz] = p[0];
  return [
    // where the canal comes out at the foot of the mountain: a short wall holding the slope [inferred, after the spring's collection wall — waterhistory.org]
    { t: 'stone_block', a: [hx - 2.2, hz + 0.45], b: [hx + 2.2, hz + 0.45], w: 0.45, y0: -0.6, y1: 1.4 },
    { t: 'inca_canal', pts },
    ...fountains().map((f) => ({ t: 'inca_fountain', ...f })),
  ];
}


/**
 * The town's own terraces: the saddle's top is not one flat field. Round the core (the Sacred sector, the Main Plaza, the kallanka, the
 * way in from the gate) the ground is at the plaza's level; going out from it each band of BAND m falls STEP m, over a short ramp at the
 * band's end, three bands to the edge (the first terrace of the ring). Every kancha stands on its own platform, raised RAISE above the
 * lane's ground and kept level, with a stair up from the lane at its gate [inferred: Machu Picchu's urban sector is built on platforms
 * stepping down the saddle's flanks, the kanchas on their own levelled terraces — Wright & Valencia, "Machu Picchu: A Civil Engineering Marvel"].
 */
export const STEP = 1.0, BAND = 13, LEVELS = 3, RAISE = 0.5;
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));
const CORE = [[-62, -66, -10, 50], PLAZA, KALLANKA, ROCK_COURT, [-5, -140, 7, 8], [-3, 6, 7, TOWN_WALL.z + 8]];
/** Distance (m) from the core of the town. */
export function coreDist(x, z) { let d = Math.hypot(x - HILL.c[0], z - HILL.c[1]) - (HILL.r + 8); for (const r of CORE) d = Math.min(d, rectDist(r, x, z)); return Math.max(0, d); }
/** The lanes' ground level at (x, z) inside the saddle (before the kancha platforms): a stair of bands, its ramps 25% of a band, rising again to the town wall. */
export function laneLevel(x, z) {
  const s = coreDist(x, z) / BAND, k = Math.floor(s), f = s - k, t = Math.min(LEVELS, k + smooth(0.75, 1, f));
  return -Math.min(STEP * t, TERRACE.h) * (1 - smooth(TOWN_WALL.z - 22, TOWN_WALL.z - 4, z));
}
let PGRID = null;
/** A stair's rect { rect, dir (the way up), y0, y1 }: the ground under it follows the flight's line, so the steps (the stairs element) stand on it and the way is walkable. */
export const STAIRS = [];
export const stairH = (S, x, z) => { const [a, b, c, d] = S.rect, t = S.dir === 'w' ? (c - x) / (c - a) : S.dir === 'e' ? (x - a) / (c - a) : S.dir === 'n' ? (d - z) / (d - b) : (z - b) / (d - b); return S.y0 + (S.y1 - S.y0) * Math.max(0, Math.min(1, t)); };
/** The ground the stairs make at (x, z), or null. */
export function stairAt(x, z) { if (!PGRID) houses(); for (const S of STAIRS) if (inRect(S.rect, x, z)) return stairH(S, x, z); return null; }
/** The platform at (x, z) (its margin included), or null: the level of the kancha or house standing there. */
export function platformAt(x, z) {
  if (!PGRID) { houses(); }
  const l = PGRID.get(Math.floor(x / 8) + ',' + Math.floor(z / 8));
  if (l) for (const q of l) if (x >= q.r[0] && x <= q.r[2] && z >= q.r[1] && z <= q.r[3]) return q.lv;
  return null;
}

let HOUSES = null, KWALLS = null, KANCHAS = null, PLATS = null;
/**
 * The houses in their kanchas: "three (or more)" one-room buildings round a patio, the whole walled, a single
 * gateway into it [stated: World History Encyclopedia, "Inca Architecture"]; the kanchas in rows with lanes
 * between, their gates to the Main Plaza's side; single houses where a kancha does not fit. Each kancha: a long
 * house across its back, a house on each side, the patio before them open to the gate [inferred: the
 * arrangement, after the kanchas of the eastern sector]. The kancha wall runs only where no house stands: the
 * houses' back walls are its line. { rect, front, seed } for the houses; kanchaWalls() the walls.
 */
export function houses() {
  if (HOUSES) return HOUSES;
  HOUSES = []; KWALLS = []; KANCHAS = []; PLATS = [];
  const rand = rng(1450), taken = [];
  const clear = (r, m) => {
    const cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2, cs = [[r[0], r[1]], [r[2], r[1]], [r[0], r[3]], [r[2], r[3]], [cx, r[1]], [cx, r[3]], [r[0], cz], [r[2], cz]];
    if (cs.some(([x, z]) => outside(x, z) > -m)) return false;
    if (r[0] < CONDOR.rect[2] + 3 && r[2] > CONDOR.rect[0] - 3 && r[1] < CONDOR.rect[3] + 3 && r[3] > CONDOR.rect[1] - 3) return false;
    if (cs.some(([x, z]) => inRect(PLAZA, x, z, 6) || inRect([-62, -66, -10, 50], x, z) || inRect(ROCK_COURT, x, z, 1) || inRect(TOMB, x, z, 3) || inRect(CONDOR.rect, x, z, 3) || inRect(KALLANKA, x, z, 4))) return false;
    if (cs.some(([x, z]) => Math.hypot(x - HILL.c[0], z - HILL.c[1]) < HILL.r + 7 || Math.hypot(x - KNOLL.c[0], z - KNOLL.c[1]) < KNOLL.r + 9)) return false;
    if (cs.some(([px, pz]) => nearCanal(px, pz, 1.8) || pz > TOWN_WALL.z - 6)) return false;
    return !taken.some((t) => r[0] < t[2] + 2 && r[2] > t[0] - 2 && r[1] < t[3] + 2 && r[3] > t[1] - 2);
  };
  const th = 0.7, MG = 0.9;
  const platform = (r, raise = RAISE) => { const lv = Math.round(laneLevel((r[0] + r[2]) / 2, (r[1] + r[3]) / 2) / STEP) * STEP + raise; PLATS.push({ r: [r[0] - MG, r[1] - MG, r[2] + MG, r[3] + MG], lv }); return lv; };
  // one kancha in the rectangle r (A across the gate side, D deep), its gate on side `gate` ('e' | 'w')
  const kancha = (r, gate, A, D) => {
    taken.push(r);
    const lv = platform(r);
    // kancha-local: u across the gate side (along z), v from the gate side (0) to the back (D)
    const gx = gate === 'e' ? r[2] : r[0], sv = gate === 'e' ? -1 : 1;
    const P = (u, v) => [gx + sv * v, r[1] + u];
    const R = (u0, v0, u1, v1) => { const a = P(u0, v0), b = P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
    const bd = 5.6 + rand() * 1, bu0 = 2 + rand() * 2, bu1 = A - 2 - rand() * 2;
    const sl0 = 7 + rand() * 2, sd = 5 + rand() * 0.8, sv1 = D - bd - 1 - rand() * 1.5, sv0 = sv1 - Math.min(sl0, sv1 - 1.1);
    const seed = () => Math.floor(rand() * 1e6);
    {
      const gz = (r[1] + r[3]) / 2, ox = gate === 'e' ? 1 : -1, yl = laneLevel(gx + ox * 2.8, gz), len = Math.max(2.3, Math.min(2.6, (lv - yl) * 2.4));
      if (lv - yl > 0.1) STAIRS.push({ rect: gate === 'e' ? [gx + 0.05, gz - 0.65, gx + 0.05 + len, gz + 0.65] : [gx - 0.05 - len, gz - 0.65, gx - 0.05, gz + 0.65], dir: gate === 'e' ? 'w' : 'e', y0: yl, y1: lv });
    }
    KANCHAS.push({ rect: r, lv, at: P, inward: [sv, 0], A, D, sd, sv0, sv1, bd });
    HOUSES.push({ rect: R(bu0, D - bd, bu1, D), front: gate, seed: seed() });
    HOUSES.push({ rect: R(0, sv0, sd, sv1), front: 's', seed: seed() });
    HOUSES.push({ rect: R(A - sd, sv0, A, sv1), front: 'n', seed: seed() });
    // the walls: the gate side and the back run past the corners; the sides stop at the corner lines, a little lower
    const seg = (a, b, y1, door) => KWALLS.push({ a: P(...a), b: P(...b), y1, door });
    const hth = th / 2;
    seg([-hth - 0.05, 0], [A + hth + 0.05, 0], 2.4, { at: A / 2 + hth + 0.05, w: 1.15, h: 1.95, jamb: rand() < 0.3 });
    seg([-hth - 0.05, D], [bu0 - hth + 0.12, D], 2.4);
    seg([bu1 + hth - 0.12, D], [A + hth + 0.05, D], 2.4);
    for (const u of [0, A]) { seg([u, 0], [u, sv0 - hth + 0.12], 2.36); seg([u, sv1 + hth - 0.12], [u, D], 2.36); }
  };
  for (const [X0, X1, gate] of [[-86, -22, 'e'], [26, 88, 'w']]) {
    for (let z = -152; z < 160; z += 27) for (let x = X0; x < X1; x += 22.5) {
      const r = [x, z, x + 20, z + 24];
      if (!clear(r, 3) || rand() < 0.12) continue;
      kancha(r, gate, 24, 20);
    }
  }
  // the town is packed: smaller kanchas (17 × 18.5 m) in every gap the big ones leave, their gates to the nearer lane
  // [inferred: Machu Picchu's urban sector is a dense mass of buildings — "closely packed buildings" round the plaza, World History Encyclopedia];
  // the way in from the gate to the plaza and the Sacred Rock's lane stay open
  {
    const ov = (r, q) => r[0] < q[2] && r[2] > q[0] && r[1] < q[3] && r[3] > q[1], keep = (r) => ov(r, [-4, 6, 8, TOWN_WALL.z + 6]) || ov(r, [-5, -140, 7, 8]);
    for (let z = -150; z < 150; z += 3) for (let x = -92; x < 90; x += 3) {
      const r = [x, z, x + 17, z + 18.5];
      if (keep(r) || !clear(r, 2.5)) continue;
      kancha(r, (r[0] + r[2]) / 2 < 0 ? 'e' : 'w', 18.5, 17);
    }
  }
  // the town wall from the canal to the saddle's east edge, its gateway double-jambed, the stone ring over the lintel
  { const z = TOWN_WALL.z, xe = NECK.xc + NECK.w, x0 = NECK.xc - NECK.w + 2.6;
    KWALLS.push({ a: [x0, z], b: [xe - 0.3, z], y1: 3.0, w: 0.45, door: { at: TOWN_WALL.gate - x0, w: 1.5, h: 2.5, jamb: true, ring: true } }); }
  // single houses where no kancha fits, as before
  for (const [X0, X1, front] of [[-84, -24, 'e'], [28, 86, 'w']]) {
    for (let z = -150; z < 160; z += 15) for (let x = X0; x < X1; x += 13) {
      const w = 6 + rand() * 3, d = 9 + rand() * 3, r = [x, z, x + w, z + d];
      if (!clear(r, 6) || rand() < 0.25) continue;
      taken.push(r);
      platform(r, 0.25);
      HOUSES.push({ rect: r, front: rand() < 0.7 ? front : (rand() < 0.5 ? 'n' : 's'), seed: Math.floor(rand() * 1e6) });
    }
  }
  PGRID = new Map();
  for (const q of PLATS) for (let i = Math.floor(q.r[0] / 8); i <= Math.floor(q.r[2] / 8); i++) for (let j = Math.floor(q.r[1] / 8); j <= Math.floor(q.r[3] / 8); j++) { const k = i + ',' + j; if (!PGRID.has(k)) PGRID.set(k, []); PGRID.get(k).push(q); }
  return HOUSES;
}
/** The kanchas' walls: { a, b, y1 (height), door ({ at, w, h, jamb } along a→b) }. */
export function kanchaWalls() { houses(); return KWALLS; }
/** The kanchas: { rect, at (u across the gate side, v in from it → a plan point), inward (gate to back) }. */
export function kanchas() { houses(); return KANCHAS; }
/** The ploughed strips on the terraces: [the angle the team starts at, the terrace level, the number of men] (people.js). */
export const PLOUGH = [[0.32, 2, 4], [Math.PI - 0.42, 3, 5], [-0.5, 1, 3]];
/** Is (x, z) in a ploughed strip: on its terrace, from a little before the team to a few metres past it. */
export function ploughed(x, z) {
  const d = outside(x, z);
  if (d < 0.5 || d > TERRACE.w * 3) return false;
  const j = Math.floor(d / TERRACE.w) + 1, f = d - TERRACE.w * (j - 1);
  if (f < 0.75 || f > TERRACE.w - 0.45) return false;
  const t = Math.atan2(z / (SITE.b + d), x / (SITE.a + d));
  return PLOUGH.some(([t0, jj, n]) => { if (jj !== j) return false; const sg = Math.sign(Math.cos(t0)) || 1, len = (n * 1.35 + 9) / (SITE.b + d); const u = (t - t0) * sg; return u > -2.5 / (SITE.b + d) && u < len; });
}
const nearWall = (x, z, m) => kanchaWalls().some(({ a, b }) => { const dx = b[0] - a[0], dz = b[1] - a[1], l2 = dx * dx + dz * dz, t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / l2)); return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t) < m; });
export const inHouse = (x, z, m = 0) => houses().some((h) => inRect(h.rect, x, z, m)) || nearWall(x, z, 0.5 + m);
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
