// Kakadu, the shelters of Ubirr, about AD 1000 — the layout (docs/settlements/kakadu.md §6). Pure data. +x east, +z south.
// The sandstone outlier runs along the north with its face to the south; under its middle the Main Gallery's overhang
// (a roof slab on two piers over a painted back wall), a smaller shelter to the west; at the east the ledges and steps up to
// the lookout. South of it the floodplain, with the billabong, paperbark and pandanus round it.

export const RADIUS = 90;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;

/** The Main Gallery: the back wall at z = ZB from x = SX0 to SX1; the roof's lip at ZL; the ceiling's height at the wall and at the lip. */
export const MAIN = { x0: -22, x1: 22, zb: -34.3, zl: -26.5, yc0: 3.5, yc1: 3.0, floor: 0.3 };
/** The smaller shelter to the west (hand stencils). */
export const SMALL = { x0: -60, x1: -47, zb: -36.3, zl: -29.5, yc0: 3.1, yc1: 2.7, floor: 0.25 };
/** Rock blocks: [x0, z0, x1, z1, y0, y1, material, roundness n]. Their tops are walkable; colliders follow the boxes. */
export const BLOCKS = [
  // the Main Gallery: back mass, upper rim, piers, roof slab (its bottom at 3.6, the ceiling panel just under it)
  { r: [-36, -70, 36, MAIN.zb], y: [-1, 14], m: 'sandstone_rose', n: 6, seed: 1, panel: true },
  { r: [-30, -70, 30, -48], y: [13, 17.5], m: 'sandstone_yellow', n: 5, seed: 2 },
  { r: [-24, -62, 8, -52], y: [17, 19], m: 'sandstone_white', n: 4, seed: 21 },
  { r: [-34, -39, -22.6, -27.5], y: [-1, 6.4], m: 'tuff_red', n: 4, seed: 3 },
  { r: [21.6, -39, 33, -27.5], y: [-1, 6.4], m: 'tuff_red', n: 4, seed: 4 },
  { r: [MAIN.x0 - 1.5, -41, MAIN.x1 + 1.5, MAIN.zl], y: [3.6, 10], m: 'sandstone_yellow', n: 7, seed: 5, slab: true, walkTop: true },
  // the small shelter
  { r: [-76, -70, -36, SMALL.zb], y: [-1, 10], m: 'sandstone_rose', n: 5, seed: 6, panel: true },
  { r: [-70, -41, -60.2, -30], y: [-1, 5.4], m: 'tuff_red', n: 4, seed: 7 },
  { r: [-46.8, -41, -37, -30.5], y: [-1, 5.4], m: 'tuff_red', n: 4, seed: 8 },
  { r: [SMALL.x0 - 1.5, -42, SMALL.x1 + 1.5, SMALL.zl], y: [3.2, 7.6], m: 'sandstone_yellow', n: 7, seed: 9, slab: true, walkTop: true },
  // the east: ledges to the lookout
  { r: [34, -38, 52, -20], y: [-1, 4.6], m: 'sandstone_rose', n: 5, seed: 10 },
  { r: [38, -56, 64, -37], y: [-1, 11.2], m: 'tuff_red', n: 5, seed: 11 },
  { r: [44, -72, 74, -50], y: [-1, 21], m: 'sandstone_yellow', n: 6, seed: 12 },
  { r: [58, -52, 80, -34], y: [-1, 8], m: 'sandstone_white', n: 4, seed: 13 },
];
export const PEAK = { x: 59, z: -61, y: 21 };
/** The ground's floor in each shelter (a raised platform of beaten earth, falling away to the plain before it). */
function shelterFloor(S, x, z) {
  const k = smooth(S.x0 - 4, S.x0 + 1, x) * smooth(S.x1 + 4, S.x1 - 1, x) * smooth(S.zl + 6, S.zl - 1, z);
  return S.floor * k;
}
/** The billabong: an ellipse, its water a little under the plain. */
export const POOL = { c: [16, 46], a: 46, b: 24, water: -0.4, bed: -1.35 };
export const poolD = (x, z, m = 0) => Math.sqrt(((x - POOL.c[0]) / (POOL.a + m)) ** 2 + ((z - POOL.c[1]) / (POOL.b + m)) ** 2);
export const inPool = (x, z, m = 0) => poolD(x, z, m) < 1;
/** Little hollows of the floodplain, with water standing in them. */
export const HOLLOWS = [[-52, 30, 9, 6], [-62, 62, 7, 5], [72, 18, 8, 5]];
export const inHollow = (x, z, m = 0) => HOLLOWS.some(([cx, cz, a, b]) => ((x - cx) / (a + m)) ** 2 + ((z - cz) / (b + m)) ** 2 < 1);
/** The ground: a very gently swelling plain, the shelters' floors, the billabong's basin and the hollows. */
export function height(x, z) {
  const r = Math.hypot(x, z);
  if (r > RADIUS + 2) return 0;
  let h = 0.1 * Math.sin(x / 13) * Math.cos(z / 17) * smooth(-14, 0, z);
  const f = Math.max(shelterFloor(MAIN, x, z), shelterFloor(SMALL, x, z));
  h = h * (1 - f / 0.3) + f;
  const d = poolD(x, z);
  if (d < 1.25) h = Math.min(h, POOL.bed + (h - POOL.bed) * smooth(0.55, 1.25, d));
  for (const [cx, cz, a, b] of HOLLOWS) { const e = Math.sqrt(((x - cx) / a) ** 2 + ((z - cz) / b) ** 2); if (e < 1.4) h = Math.min(h, -0.75 + (h + 0.75) * smooth(0.5, 1.4, e)); }
  return h * (1 - smooth(RADIUS - 14, RADIUS + 1, r));
}
/** Beaten ground: before the shelters, the way along the foot and to the steps. */
export const TRACKS = [
  [[-80, -14], [-50, -20], [-20, -19], [10, -19], [30, -17], [34, -21]],     // along the foot of the rock, to the steps
  [[34, -21], [30, 0], [30, 10]],
  [[-50, -20], [-52, 0], [-44, 12]],
];
/** The way up, in three flights of rock steps (rect, direction of ascent, from y0 to y1): the foot to the first ledge, to the second, to the lookout. */
export const FLIGHTS = [
  { rect: [40, -20, 42.4, -8], dir: 'n', y0: 0, y1: 4.6 },
  { rect: [46, -37, 48.4, -25], dir: 'n', y0: 4.6, y1: 11.2 },
  { rect: [58, -50, 60.4, -38.5], dir: 'n', y0: 11.2, y1: 21 },
];

/** The route a visitor walks (arrival to lookout), as waypoints; nothing tall is planted within a few metres of it. */
export const ROUTE = [[0, -14], [0, -27], [-10, -31], [10, -31], [30, -17], [34, -6], [41.2, -5], [41.2, -23], [47.2, -23], [47.2, -36], [47.2, -38], [59.2, -38], [59.2, -49], [59, -58]];
const segD = (x, z, [ax, az], [bx, bz]) => { const dx = bx - ax, dz = bz - az, k = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1))); return Math.hypot(x - ax - dx * k, z - az - dz * k); };
/** Is (x, z) within w of a beaten track or of the visitor's route? */
export function onWay(x, z, w) {
  for (const t of TRACKS) for (let i = 0; i < t.length - 1; i++) if (segD(x, z, t[i], t[i + 1]) < w) return true;
  for (let i = 0; i < ROUTE.length - 1; i++) if (segD(x, z, ROUTE[i], ROUTE[i + 1]) < w) return true;
  return false;
}

/** The family's camp at the west end of the Main Gallery's apron, and the second fire on the billabong's north bank (docs §5). */
export const CAMPS = [
  { c: [-34, -7], hut: [-38, -9, 0.4], lean: [-29, -4, 0], fire: [-33, -5], rack: [-27, -9], trough: true, grind: true },
  { c: [-11, 14], hut: null, lean: [-16, 16, 0.2], fire: [-11, 14], rack: [-6, 17], fish: true, turtle: true },
  { c: [-54, -25], hut: [-59, -26, 0.2], lean: [-49, -27, 0.1], fire: [-54, -25], rack: [-47, -23], grind: true },      // under the small shelter's apron
  { c: [8, -9], hut: null, lean: [3, -10, 0.1], fire: [8, -9], rack: [13, -7], trough: true, turtle: true },            // on the apron, in front of the arrival
  { c: [-30, 26], hut: [-34, 28, 0.5], lean: [-26, 30, -0.2], fire: [-30, 26], rack: [-24, 25], fish: true },          // the billabong's west bank
  { c: [57, 10], hut: [61, 13, -0.3], lean: [52, 12, 0.3], fire: [57, 10], rack: [62, 8], grind: true, fish: true },   // by the east hollow
];
/** Paperbark and pandanus round the billabong and the hollows; the termite mounds on the dry edge. Seeded, outside the shelters and tracks. */
export function groves() {
  const r = rng(77), paper = [], pand = [], term = [];
  const clear = (x, z, m) => !inPool(x, z, -0.0) && !inHollow(x, z, 0.6) && Math.hypot(x, z) < RADIUS - 6 && !CAMPS.some((k) => Math.hypot(x - k.c[0], z - k.c[1]) < 8 + m) && z > -20;
  for (let k = 0; k < 600 && paper.length < 30; k++) { const a = r() * 6.283, d = 1.12 + r() * 0.45, x = POOL.c[0] + Math.cos(a) * POOL.a * d, z = POOL.c[1] + Math.sin(a) * POOL.b * d; if (clear(x, z, 0)) paper.push([x, z, 6.5 + r() * 5]); }
  for (let k = 0; k < 600 && pand.length < 26; k++) { const a = r() * 6.283, d = 1.06 + r() * 0.3, x = POOL.c[0] + Math.cos(a) * POOL.a * d, z = POOL.c[1] + Math.sin(a) * POOL.b * d; if (clear(x, z, 0) && !paper.some((p) => Math.hypot(p[0] - x, p[1] - z) < 3)) pand.push([x, z, 3 + r() * 3.5]); }
  for (const [cx, cz, a, b] of HOLLOWS) for (let k = 0; k < 3; k++) { const t = r() * 6.28, x = cx + Math.cos(t) * (a + 2.5), z = cz + Math.sin(t) * (b + 2.5); if (clear(x, z, 0)) (k ? pand : paper).push([x, z, k ? 3.5 + r() * 2 : 7 + r() * 3]); }
  for (let k = 0; k < 300 && term.length < 14; k++) { const x = -80 + r() * 160, z = -18 + r() * 90; if (clear(x, z, 0) && poolD(x, z) > 1.4 && !inRect([-70, -20, 45, -10], x, z)) term.push([x, z, 0.6 + r() * 1.2]); }
  return { paper, pand, term };
}

/** The woodland: stringybark gums on the dry ground and the rock's flanks, cycads and fallen logs; clear of water, camps, tracks, the shelters' mouths and the arrival. */
export function woodland() {
  const r = rng(88), gum = [], cyc = [], log = [];
  const ok = (x, z, m) => Math.hypot(x, z) < RADIUS - 5 && !inPool(x, z, 0.12) && !inHollow(x, z, 1.5) && !CAMPS.some((k) => Math.hypot(x - k.c[0], z - k.c[1]) < 7 + m)
    && !inRect([MAIN.x0 - 6, MAIN.zb, MAIN.x1 + 6, MAIN.zl + 14], x, z) && !inRect([SMALL.x0 - 5, SMALL.zb, SMALL.x1 + 5, SMALL.zl + 12], x, z)
    && !FLIGHTS.some((F) => inRect(F.rect, x, z, 6)) && !BLOCKS.some((B) => inRect(B.r, x, z, 2.5 + m)) && Math.hypot(x + 4, z + 2) > 9 && !onWay(x, z, 3.2);
  for (let k = 0; k < 2500 && gum.length < 70; k++) { const x = -86 + r() * 172, z = -34 + r() * 120; const dry = poolD(x, z) > 1.5; if (ok(x, z, 1) && (dry || r() < 0.2) && (z < -18 || r() < 0.7) && !gum.some((g) => Math.hypot(g[0] - x, g[1] - z) < 5)) gum.push([x, z, 7 + r() * 7]); }
  for (let k = 0; k < 1500 && cyc.length < 36; k++) { const x = -86 + r() * 172, z = -34 + r() * 120; if (ok(x, z, 0) && poolD(x, z) > 1.45 && !cyc.some((g) => Math.hypot(g[0] - x, g[1] - z) < 2.5)) cyc.push([x, z, 0.4 + r() * 1.1]); }
  for (let k = 0; k < 800 && log.length < 14; k++) { const x = -80 + r() * 160, z = -30 + r() * 100; if (ok(x, z, 0) && poolD(x, z) > 1.3) log.push([x, z, 1.8 + r() * 2.4, r() * 3.14]); }
  return { gum, cyc, log };
}
/** Tufts of spinifex and dry grass: dense at the rock's foot and the billabong's margin, thin on the plain. [x, z] only; the town adds heights. */
export function tuftSpots() {
  const r = rng(91), out = [];
  const ok = (x, z) => Math.hypot(x, z) < RADIUS - 6 && !inPool(x, z, -0.02) && !inHollow(x, z, 0.2) && !BLOCKS.some((B) => inRect(B.r, x, z, 0.8)) && !inRect([MAIN.x0 - 3, MAIN.zb, MAIN.x1 + 3, MAIN.zl + 4], x, z) && !inRect([SMALL.x0 - 3, SMALL.zb, SMALL.x1 + 3, SMALL.zl + 4], x, z)
    && !onWay(x, z, 1.8) && !CAMPS.some((k) => Math.hypot(x - k.c[0], z - k.c[1]) < 3.4) && Math.hypot(x + 4, z + 2) > 3;
  for (let k = 0; k < 6000 && out.length < 700; k++) {
    const x = -88 + r() * 176, z = -40 + r() * 128, foot = z < -16 ? 1 : 0, edge = poolD(x, z) < 1.5 ? 1 : 0;
    if (r() > 0.18 + 0.5 * foot + 0.35 * edge) continue;
    if (ok(x, z)) out.push([x, z, foot ? 1 : 0, r() * 6.28, 0.7 + r() * 0.8]);
  }
  return out;
}
/** Fragments fallen from the faces: on the shelters' floors and along the foot of the rock. [x, z, s]. */
export function screeSpots() {
  const r = rng(93), out = [];
  for (const S of [MAIN, SMALL]) for (let k = 0; k < 26; k++) out.push([S.x0 + 1.5 + r() * (S.x1 - S.x0 - 3), S.zb + 0.5 + r() * (S.zl - S.zb - 2.2), 0.12 + r() * 0.2, 1]);
  for (let k = 0; k < 260 && out.length < 120; k++) {
    const x = -80 + r() * 160, z = -34 + r() * 20;
    if (BLOCKS.some((B) => inRect(B.r, x, z, 0.4)) || inRect([MAIN.x0 - 4, MAIN.zb, MAIN.x1 + 4, MAIN.zl + 3], x, z) || inRect([SMALL.x0 - 3, SMALL.zb, SMALL.x1 + 3, SMALL.zl + 3], x, z) || FLIGHTS.some((F) => inRect(F.rect, x, z, 2))) continue;
    if (!BLOCKS.some((B) => inRect(B.r, x, z, 6))) continue;
    out.push([x, z, 0.1 + r() ** 2 * 0.5, 0]);
  }
  return out;
}
/** Where the shelters are furnished: hearths, beds, painters' stones, a pole ladder to the high panels, yams, bark and spears. [kind, x, z, rot]. Within each shelter, x from its x0. */
export function shelterSpots() {
  const out = [];
  const M = MAIN, S = SMALL, zf = (T, d) => T.zl - d;
  out.push(['hearth', M.x0 + 5, zf(M, 2.2)], ['hearth', M.x1 - 6, zf(M, 2.0)], ['hearth', S.x0 + 4, zf(S, 2.2)]);
  for (const [T, xs] of [[M, [3, 9, 15, 21, 30, 38]], [S, [9, 12]]]) xs.forEach((d, i) => out.push([['bed', 'bark', 'yams', 'spears', 'bags', 'mat'][i % 6], T.x0 + d, T.zb + (i % 2 ? 1.6 : 2.4), (i % 2 ? 0.15 : -0.1)]));
  out.push(['paint', M.x0 + 18, M.zb + 1.1, 0], ['paint', M.x0 + 33, M.zb + 1.1, 0], ['paint', S.x0 + 6, S.zb + 1.1, 0]);
  out.push(['ladder', M.x0 + 26, M.zb + 0.05, 0], ['ladder', S.x0 + 9.5, S.zb + 0.05, 0]);
  return out;
}
/** The rock's tops: where plants root in the crevices and on the ledges: [x, z, y]. */
export function topSpots() {
  const r = rng(95), out = [];
  for (const B of BLOCKS) {
    if (B.slab) continue;
    const [x0, z0, x1, z1] = B.r, area = (x1 - x0) * (z1 - z0), n = Math.min(14, Math.max(2, Math.round(area / 120)));
    for (let k = 0; k < n; k++) {
      const x = x0 + 1.5 + r() * (x1 - x0 - 3), z = z0 + 1.5 + r() * (z1 - z0 - 3);
      if (BLOCKS.some((C) => C !== B && C.y[1] > B.y[1] - 0.3 && inRect(C.r, x, z, 1.2))) continue;
      if (FLIGHTS.some((F) => inRect(F.rect, x, z, 1.5)) || onWay(x, z, 3.2)) continue;
      out.push([x, z, B.y[1], B.m]);
    }
  }
  return out;
}
