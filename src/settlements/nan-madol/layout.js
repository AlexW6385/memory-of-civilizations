// Nan Madol, c. 1300 — the layout (docs/settlements/nan-madol.md §3): rectangular islets of basalt and
// coral fill in three columns and four rows round Nandauwas, tidal canals between them, a few low
// causeways of laid columns across the canals (`fords`, the visitor's way), the L-shaped sea wall to the
// east and south, the mangrove flat and the low shore of Temwen island to the north-west. Pure data.
// +x east, +z south. Heights: the islets' tops at TOP (0), the sea at WATER (the planet's sea level here).

export const RADIUS = 190;
export const WATER = -1.3;          // the lagoon's level (ground.sea): the islet tops stand 1.3 m over it
export const TOP = 0;
export const BED = -2.4;
export const RIM = -4.6;            // the ground's level at the disc's edge (the open lagoon and sea)            // the canals' silt
export const FORD_Y = -1.0;         // a causeway's crown, 0.3 m over the water
export const WALL_FACE = 0.12;      // how far outside the islet's edge the face of its retaining wall stands
const OX = -10, OZ = -8;            // the whole block set to the middle of the disc

export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
function hash2(x, z) { let h = Math.imul(Math.floor(x) | 0, 374761393) + Math.imul(Math.floor(z) | 0, 668265263) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
export function vnoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash2(xi, zi), b = hash2(xi + 1, zi), c = hash2(xi, zi + 1), d = hash2(xi + 1, zi + 1);
  return (a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v) * 2 - 1;
}
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ── the islets: id, kind, [x0, z0, x1, z1] (design coordinates, moved by the block's offset) ──────
const D = [
  ['nan', 'landmark', -31, -66, 31, 6],                    // Nandauwas, 62 × 72
  ['n1', 'canoe', -31, -112, 31, -74],                     // canoe building (Dapahu)
  ['s1', 'palace', -31, 14, 31, 56],                       // the royal residence (Idehd)
  ['s4', 'landing', -31, 64, 31, 100],                     // where the food is received (Peiniot, Usennamw)
  ['w1', 'priest', -78, -60, -38, 0],                      // priests' houses (Madol Powe)
  ['n2', 'oil', -78, -112, -38, -70],                      // coconut oil (Peinering)
  ['s2', 'commoner', -78, 14, -38, 62],
  ['s5', 'commoner', -78, 70, -38, 104],
  ['e1', 'tomb', 42, -59, 82, -9],                         // a walled tomb (Peinkitel)
  ['n3', 'kitchen', 38, -112, 82, -67],                    // food preparation
  ['s3', 'commoner', 38, 14, 82, 58],
  ['s6', 'commoner', 38, 66, 82, 100],
  ['w2a', 'commoner', -120, -85, -88, -45],
  ['w2b', 'commoner', -125, -30, -88, 20],
  ['w2c', 'commoner', -120, 28, -88, 80],
  ['se1', 'seawall', 100, -100, 120, -34],                 // the sea wall, east
  ['se2', 'seawall', 100, -28, 120, 46],
  ['se3', 'seawall', 100, 52, 120, 110],
  ['ss1', 'seawall', -70, 116, -2, 134],                   // and south
  ['ss2', 'seawall', 4, 116, 72, 134],
  ['ss3', 'seawall', 78, 116, 96, 134],
  ['pahnwi', 'seawall', 100, 116, 122, 136],               // the south corner, built late
];
export const ISLETS = D.map(([id, kind, x0, z0, x1, z1]) => ({ id, kind, rect: [x0 + OX, z0 + OZ, x1 + OX, z1 + OZ], c: [(x0 + x1) / 2 + OX, (z0 + z1) / 2 + OZ] }));
export const ISLET = Object.fromEntries(ISLETS.map((s) => [s.id, s]));
export const NAN = ISLET.nan.rect;

/** The causeways across the canals: centre, the axis it runs along, its length (the canal's width there) and width. */
const F = [
  ['f1', 0, 10, 'z', 8], ['f2', 0, 60, 'z', 8], ['f3', 0, -70, 'z', 8],
  ['f4', 36.5, -30, 'x', 11], ['f5', -34.5, -30, 'x', 7], ['f6', 34.5, 35, 'x', 7], ['f7', -34.5, 35, 'x', 7],
  ['f9', -83, -10, 'x', 10], ['f11', 34.5, -92, 'x', 7], ['f12', -34.5, -92, 'x', 7], ['f13', 34.5, 82, 'x', 7], ['f14', -34.5, 85, 'x', 7],
];
export const FORDS = F.map(([id, x, z, axis, len]) => ({ id, c: [x + OX, z + OZ], axis, len, w: 3.4 }));
const RAMP = 2.6;

/** The canals, as the water rectangles the canoes work (the fords cut them into reaches: boats turn back at a causeway). */
const C = [
  [-38, -112, -31, 104], [31, -112, 38, 100], [82, -100, 100, 112], [-88, -75, -78, 104],        // north–south
  [-31, -74, 31, -66], [-78, -70, -38, -60], [38, -67, 82, -59],                                   // east–west, north
  [-31, 6, 31, 14], [-78, 0, -38, 14], [42, -9, 82, 14],
  [-31, 56, 31, 64], [-78, 62, -38, 70], [38, 58, 82, 66],
  [-78, 104, 96, 114],                                                                             // the channel inside the south wall
];
export const CANALS = C.map(([x0, z0, x1, z1]) => [x0 + OX, z0 + OZ, x1 + OX, z1 + OZ]);

// ── the shore of Temwen island to the north-west ──
const SHORE = -215 - OX - OZ;                               // x + z < SHORE: the land
/** Distance inland of the shoreline (m; negative: the lagoon side). */
export const inland = (x, z) => -(x + z - SHORE) / Math.SQRT2 + 3 * vnoise(x * 0.04, z * 0.04) + 2 * vnoise(x * 0.11 + 5, z * 0.11);

const sdfRect = (r, x, z) => {
  const cx = (r[0] + r[2]) / 2, cz = (r[1] + r[3]) / 2, hx = (r[2] - r[0]) / 2, hz = (r[3] - r[1]) / 2;
  const qx = Math.abs(x - cx) - hx, qz = Math.abs(z - cz) - hz;
  return Math.hypot(Math.max(qx, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qz), 0);
};
export const isletAt = (x, z, m = 0) => ISLETS.find((s) => sdfRect(s.rect, x, z) < m) ?? null;

/** The height of a causeway's crown at (x, z), or −Infinity where there is none. */
function fordHeight(x, z) {
  for (const f of FORDS) {
    const along = f.axis === 'x' ? x - f.c[0] : z - f.c[1], across = f.axis === 'x' ? z - f.c[1] : x - f.c[0];
    if (Math.abs(across) > f.w / 2 + 0.3 || Math.abs(along) > f.len / 2 + 0.05) continue;
    const edge = f.len / 2 - Math.abs(along);                  // distance from the nearer end (an islet's edge)
    const h = FORD_Y + (TOP - FORD_Y) * smooth(RAMP, 0, edge);
    return h * smooth(f.w / 2 + 0.3, f.w / 2 - 0.1, Math.abs(across)) + BED * (1 - smooth(f.w / 2 + 0.3, f.w / 2 - 0.1, Math.abs(across)));
  }
  return -Infinity;
}
export const onFord = (x, z, m = 0) => FORDS.some((f) => {
  const along = f.axis === 'x' ? x - f.c[0] : z - f.c[1], across = f.axis === 'x' ? z - f.c[1] : x - f.c[0];
  return Math.abs(across) < f.w / 2 + m && Math.abs(along) < f.len / 2 + m;
});

/** The ground: the lagoon's floor, the islets' flat tops with their steep edges (the walls are built), the causeways, the reef and the shore. */
export function height(x, z) {
  const r = Math.hypot(x, z);
  let h = BED + 0.14 * vnoise(x * 0.31, z * 0.31) + 0.1 * vnoise(x * 0.07 + 9, z * 0.07);
  let top = false;
  // the reef flat east and south of the sea wall, its edge falling to the open sea
  const out = Math.max((x - (122 + OX)) / 1, (z - (136 + OZ)) / 1);
  if (out > 0) h = Math.max(h, -1.25 + 0.1 * vnoise(x * 0.2, z * 0.2) - 2.6 * smooth(26, 40, out));
  for (const s of ISLETS) {
    const d = sdfRect(s.rect, x, z);
    if (d > 0.4) continue;
    const k = smooth(0.12, -0.05, d);
    h = Math.max(h, BED + (TOP + 0.02 * vnoise(x * 0.4, z * 0.4) - BED) * k);
    if (d < 0) top = true;
  }
  const fh = fordHeight(x, z);
  if (fh > -Infinity) h = Math.max(h, fh);
  // the shore: a mud flat with mangroves (just over the water), then the low land
  const q = inland(x, z);
  if (q > -22) {
    const flat = -1.12 + 0.07 * vnoise(x * 0.3, z * 0.3), land = 0.45 + 0.025 * Math.max(0, q) + 0.2 * vnoise(x * 0.06, z * 0.06);
    const s = smooth(-22, -9, q), l = smooth(-1, 5, q);
    const hs = BED + (flat - BED) * s;
    h = Math.max(h, hs + (land - hs) * l);
  }
  if (r > RADIUS - 36) h = h + (RIM - h) * smooth(RADIUS - 36, RADIUS - 6, r) * (top ? 0 : 1);
  return h;
}
export const waterAt = (x, z) => height(x, z) < WATER - 0.3;

// ── the islets' edges: where a causeway or a landing leaves a gap in the retaining wall ──────────
/** The sides of an islet: [side, a, b, nx, nz] — the edge from a to b (x, z), its outward normal. */
export function edges(s) {
  const [x0, z0, x1, z1] = s.rect;
  return [['n', [x0, z0], [x1, z0], 0, -1], ['e', [x1, z0], [x1, z1], 1, 0], ['s', [x1, z1], [x0, z1], 0, 1], ['w', [x0, z1], [x0, z0], -1, 0]];
}
/** The gaps along an islet's edges as [side, u0, u1] (u: metres from the edge's start): the causeways' ramps and the landing steps. */
export function gaps(s) {
  const out = [];
  for (const [side, a, b, nx, nz] of edges(s)) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    for (const f of FORDS) {
      // the causeway's two ends: on the islet's edge line when its centre ± len/2 along its axis falls there
      const dir = f.axis === 'x' ? [1, 0] : [0, 1];
      for (const sg of [-1, 1]) {
        const ex = f.c[0] + dir[0] * sg * f.len / 2, ez = f.c[1] + dir[1] * sg * f.len / 2;
        if (dir[0] * nx + dir[1] * nz === 0) continue;
        const off = (ex - a[0]) * nx + (ez - a[1]) * nz;
        if (Math.abs(off) > 0.5) continue;
        const u = (ex - a[0]) * ux + (ez - a[1]) * uz;
        if (u < -1 || u > L + 1) continue;
        out.push([side, u - f.w / 2 - 0.4, u + f.w / 2 + 0.4]);
      }
    }
    // the landing steps where a canoe comes in (islets that take the food and the canoes)
    for (const g of LANDINGS[s.id] ?? []) if (g[0] === side) out.push([side, g[1] - 1.8, g[1] + 1.8]);
  }
  return out;
}
/** Canoe landings: islet → [[side, u (m along the edge from its start)], …]. Edges run clockwise from the north-west corner. */
export const LANDINGS = {
  s4: [['s', 31], ['e', 18]], n1: [['n', 20], ['w', 30]], n2: [['n', 20]], n3: [['e', 22]], s1: [['w', 14]],
  s6: [['e', 18]], s5: [['s', 20]], e1: [['e', 30]], w1: [['w', 30]], nan: [['e', 56]],
};

// ── the village: houses, cook-houses, trees ─────────────────────────────────────────────────────
let V = null;
/**
 * What stands on the islets (the same for the town, the ground's planting, the walkers' ways and the smoke):
 * houses (nahs) in two rows facing the path along each islet's long axis, cook-houses and special works by kind.
 */
export function village() {
  if (V) return V;
  const rand = rng(1300), out = { houses: [], cooks: [], paths: [], works: [], yards: [] };
  for (const s of ISLETS) {
    if (s.kind === 'landmark' || s.kind === 'seawall') continue;
    const [x0, z0, x1, z1] = s.rect, w = x1 - x0, d = z1 - z0, alongX = w >= d;
    const pc = alongX ? (z0 + z1) / 2 : (x0 + x1) / 2;                     // the path's centre line
    const lo = (alongX ? x0 : z0) + 3, hi = (alongX ? x1 : z1) - 3;
    // the path along the long axis, and a cross path at its middle
    out.paths.push({ islet: s.id, a: alongX ? [x0 + 2, pc] : [pc, z0 + 2], b: alongX ? [x1 - 2, pc] : [pc, z1 - 2] });
    const mid = (lo + hi) / 2;
    out.paths.push({ islet: s.id, a: alongX ? [mid, z0 + 2] : [x0 + 2, mid], b: alongX ? [mid, z1 - 2] : [x1 - 2, mid] });
    const grand = s.kind === 'palace', kinds = { commoner: [4.2, 5.4], priest: [4.6, 6.2], palace: [6.2, 9], canoe: [5, 6.5], oil: [4.5, 6], kitchen: [4, 5], landing: [5, 7.5], tomb: [4.4, 5.6] }[s.kind] ?? [4.2, 5.4];
    for (const side of [-1, 1]) {
      let u = lo + 1;
      const depth = (alongX ? d : w) / 2 - 1.6 - 1.4;                      // from the path's edge to the islet's edge, less the margin
      while (u < hi - 3) {
        const ww = kinds[0] + rand() * (kinds[0] * 0.3), ll = Math.min(depth - 1, kinds[1] + rand() * 1.8);
        if (u + ww > hi - 1.5) break;
        const cu = u + ww / 2, cv = pc + side * (1.7 + ll / 2 + 0.2 + rand() * 0.6);
        const c = alongX ? [cu, cv] : [cv, cu];
        // open end toward the path
        const dir = alongX ? [0, -side] : [-side, 0];
        const yaw = Math.atan2(-dir[0], -dir[1]);
        // not on the ford landings, nor the cross path, nor the landings
        const near = FORDS.some((f) => Math.hypot(f.c[0] - c[0], f.c[1] - c[1]) < f.len / 2 + 4.5 + ll / 2) || Math.abs(cu - mid) < ww / 2 + 1.8;
        if (!near && rand() < (s.kind === 'commoner' ? 0.82 : 0.9)) {
          const house = { c, yaw, w: alongX ? ww : ww, l: ll, islet: s.id, rank: grand && rand() < 0.5 ? 2 : s.kind === 'priest' ? 1 : 0, seed: Math.floor(rand() * 1e6), side };
          out.houses.push(house);
        }
        u += ww + 1.2 + rand() * 1.6;
      }
    }
  }
  return (V = out);
}
export const housesOf = (id) => village().houses.filter((h) => h.islet === id);

/** The visitor's ways, as rectangles and links for the walkers (movers.js). */
export function walkPaths() {
  const rects = [], links = [], v = village();
  for (const p of v.paths) {
    const horiz = Math.abs(p.b[0] - p.a[0]) > Math.abs(p.b[1] - p.a[1]), hw = 1.4;
    rects.push(horiz ? [p.a[0], p.a[1] - hw, p.b[0], p.b[1] + hw] : [p.a[0] - hw, p.a[1], p.b[0] + hw, p.b[1]]);
  }
  for (const f of FORDS) {
    const dir = f.axis === 'x' ? [1, 0] : [0, 1];
    links.push({ a: [f.c[0] - dir[0] * (f.len / 2 + 2), f.c[1] - dir[1] * (f.len / 2 + 2)], b: [f.c[0] + dir[0] * (f.len / 2 + 2), f.c[1] + dir[1] * (f.len / 2 + 2)], w: f.w / 2, kind: 'bridge' });
  }
  return { rects, links };
}

/** Cook-houses and their earth ovens (umu): beside every fifth house, on its back side; [{ c, yaw, islet, seed }]. */
let CK = null;
export function cooks() {
  if (CK) return CK;
  CK = [];
  village().houses.forEach((h, k) => {
    if (k % 5 !== 2 && !(ISLET[h.islet].kind === 'kitchen' && k % 2 === 0)) return;
    const ca = Math.cos(h.yaw), sa = Math.sin(h.yaw), u = h.w / 2 + 2.3, v = h.l / 2 - 0.4;
    const c = [h.c[0] + u * ca + v * sa, h.c[1] - u * sa + v * ca];
    if (!inRect(ISLET[h.islet].rect, c[0], c[1], -2.2)) return;
    CK.push({ c, yaw: h.yaw, islet: h.islet, seed: h.seed });
  });
  return CK;
}

// ── Nandauwas (docs/settlements/nan-madol.md §4): the outer wall 50 × 60 on its islet, the inner enclosure, the tomb ──
export const OUTER = [-35, -68, 15, -8];                     // the wall's centre lines
export const OUTER_GATE = [-11.6, -8.4];                      // the gap in the south side (x)
export const INNER = [-23, -54, 3, -22];
export const INNER_GATE = [-0.8, 2.4];                        // the gap at the east end of its south side (x)
export const TOMB = { rect: [-17, -48, -3, -30], h: 2.4, pit: [-12.2, -43, -7.8, -35.6], roofZ: -40.4, ramp: [-12.2, -39, -7.8, -35.6], stair: [-11, -30, -9, -26.6] };
export const SAKAU = [[-28.5, -38, Math.PI / 2], [8.5, -15.5, 0]];
export const inNandauwas = (x, z, m = 0) => inRect(ISLET.nan.rect, x, z, m);
