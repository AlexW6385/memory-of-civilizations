// Zagwe Lalibela (c. 1220) — the layout (docs/settlements/lalibela.md §2): the church precinct
// level on the plateau, its churches standing in pits cut down into the tuff, trenches leading down
// and joining them, the Jordan between the northern and south-eastern groups, Bete Giyorgis alone to
// the south-west; the village of round houses on the slopes round about. Pure data. +x east, +z south.

export const RADIUS = 380;
export const EDGE = 3;                                 // the band inside a cut's edge where its wall stands
export const OUTER = 2;                                // the walls reach this far outside the edge (under the ground)
// pits: { rect, depth }; churches stand on their floors
export const PITS = {
  giyorgis: { rect: [-216, 114, -174, 156], depth: 12 },     // the cross 25.6 m over its plinth, a court of about 5 m round it
  medhane: { rect: [-15, -112, 35, -68], depth: 11.5 },
  maryam: { rect: [55, -104, 85, -76], depth: 9 },
  golgotha: { rect: [-72, -104, -32, -78], depth: 9 },
  amanuel: { rect: [20, 44, 60, 76], depth: 12 },
  gabriel: { rect: [104, 28, 136, 52], depth: 10 },
};
// trenches: { rect, axis ('x'|'z'), d0 (depth at the low-coordinate end), d1 }
export const TRENCHES = [
  { rect: [-262, 123, -216, 133], axis: 'x', d0: 0, d1: 12 },          // down to Bete Giyorgis
  { rect: [4, -146, 16, -112], axis: 'z', d0: 0, d1: 11.5 },          // down to Medhane Alem from the north
  { rect: [-58, -130, -46, -104], axis: 'z', d0: 0, d1: 9 },           // to Golgotha
  { rect: [35, -96, 55, -84], axis: 'x', d0: 11.5, d1: 9 },            // Medhane Alem to Maryam
  { rect: [-150, -22, -120, -6], axis: 'x', d0: 0, d1: 7 },            // into the Jordan's west end
  { rect: [-120, -22, 180, -6], axis: 'x', d0: 7, d1: 7 },             // the Jordan
  { rect: [180, -22, 212, -6], axis: 'x', d0: 7, d1: 0 },              // out of its east end
  { rect: [34, -8, 46, 44], axis: 'z', d0: 7, d1: 12 },               // the Jordan to Amanuel
  { rect: [114, -8, 126, 28], axis: 'z', d0: 7, d1: 10 },             // the Jordan to Gabriel-Rufael
];
export const POOL = [-96, -19, -66, -15.4];            // the baptismal pool in the Jordan's floor
export const PRECINCT = 250;                             // level within this radius; slopes beyond
export const inRect = (r, x, z, m = 0) => x >= r[0] - m && x <= r[2] + m && z >= r[1] - m && z <= r[3] + m;
export const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
const edgeIn = (r, x, z) => Math.min(x - r[0], r[2] - x, z - r[1], r[3] - z);
/** The depth of the cuts at (x, z) (0 outside them): full on their floors, falling to 0 across the wall band at their edges. */
// the ground drops sharply half a metre in from the cut's edge, well inside the rock walls (which
// stand from 2 m outside the edge to EDGE inside it): the ground's mesh, some 2 m between vertices
// and not aligned with the cuts, then slopes down only within the walls, never in front of their
// faces nor in a dip before their kerbs
const DROP = (e) => Math.max(0, Math.min(1, (e - 0.35) / 0.3));
export function cutDepth(x, z) {
  let d = 0;
  for (const p of Object.values(PITS)) if (inRect(p.rect, x, z)) d = Math.max(d, p.depth * DROP(edgeIn(p.rect, x, z)));
  for (const t of TRENCHES) if (inRect(t.rect, x, z)) {
    const [x0, z0, x1, z1] = t.rect, u = t.axis === 'x' ? (x - x0) / (x1 - x0) : (z - z0) / (z1 - z0);
    const side = t.axis === 'x' ? Math.min(z - z0, z1 - z) : Math.min(x - x0, x1 - x);
    d = Math.max(d, (t.d0 + (t.d1 - t.d0) * u) * DROP(side));
  }
  return d;
}
export const inCut = (x, z, m = 0) => Object.values(PITS).some((p) => inRect(p.rect, x, z, m)) || TRENCHES.some((t) => inRect(t.rect, x, z, m));

// ---- the terraced slopes: flat treads with a steep riser between, a retaining wall on each riser (docs §15)
export const TERR = { r0: 262, P: 9, rise: 0.16 * 9, n: 9 };
function profile(r) {
  if (r <= PRECINCT) return 0;
  if (r <= TERR.r0) return (r - PRECINCT) * 0.16;
  const u = (r - TERR.r0) / TERR.P, n = Math.floor(u), f = u - n;
  return (TERR.r0 - PRECINCT) * 0.16 + n * TERR.rise + TERR.rise * smooth(0.72, 1, f);
}
const aMod = (x, z) => 0.8 + 0.2 * Math.sin(Math.atan2(z, x) * 3);
// The shoulder of the hill south-west of Bete Giyorgis: the pilgrims' viewing place, from which the cross on the church's roof
// (level with the ground round the pit) is seen from above. A broad swell on the terraced slope, flat to 6 m from the pit's edge
// and the trench's, so the cuts keep their levels; no houses on it (the build() below clears them).
export const KNOLL = { c: [-236, 176], h: 9, R: 30, clear: 36 };
const cutDist = (x, z) => Math.min(rectDist(PITS.giyorgis.rect, x, z), rectDist(TRENCHES[0].rect, x, z));
function knoll(x, z) {
  const dx = x - KNOLL.c[0], dz = z - KNOLL.c[1], q = (dx * dx + dz * dz) / (KNOLL.R * KNOLL.R);
  if (q > 5) return 0;
  return KNOLL.h * Math.exp(-q) * smooth(6, 26, cutDist(x, z));
}
export function slope(x, z) { return profile(Math.hypot(x, z)) * aMod(x, z) + knoll(x, z); }
/** The terrace risers: the ring radius of the wall n (its foot's ground and its top's). */
export const riserR = (n) => TERR.r0 + TERR.P * (n + 0.86);
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ---- the ways: the roads of the movers (rects) and the footpaths between the compounds
export const PATHS = [
  [-150, -19, 212, -9], [-340, -17, -150, -11], [212, -17, 340, -11], [-340, 126, -211, 130], [7, -252, 13, -106], [-55, -252, -49, -99.5], [-252, -252, 10, -248], [29, -93, 58.6, -87], [37, -19, 43, 49], [117, -19, 123, 33],
];
export const LINKS = [{ a: [-250, -14], b: [-250, -250], w: 1.2 }, { a: [-250, -14], b: [-250, 128], w: 1.2 }, { a: [250, -14], b: [250, 150], w: 1.2 }];
export const ARRIVAL = [-217, 113];
export const WATCH = [-236, 176];                  // where the visitor arrives (arrivals.js): the knoll's viewing place
const rectDist = (r, x, z) => Math.hypot(Math.max(r[0] - x, 0, x - r[2]), Math.max(r[1] - z, 0, z - r[3]));
const segDist = (a, b, x, z) => { const dx = b[0] - a[0], dz = b[1] - a[1], L = dx * dx + dz * dz || 1, t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / L)); return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t); };
const nearPath = (x, z) => { let best = null, bd = 1e9; for (const r of PATHS) { const px = Math.max(r[0], Math.min(r[2], x)), pz = Math.max(r[1], Math.min(r[3], z)), d = Math.hypot(px - x, pz - z); if (d < bd) { bd = d; best = [px, pz]; } } return { p: best, d: bd }; };

// ---- the compounds (gojo): each a yard walled with stone or fenced with wattle, the family's round house at its back, a smaller
// kitchen house, a store or a stilted granary, a pen, at the yard's gate a path to the hamlet's lane (docs §15). The hamlets lie
// on the level precinct between the pits and on the first slopes, their lanes joining the ways.
const ANCHORS = [
  [-236, 74], [-240, 30], [-196, 62], [-150, 92], [-240, -40], [-205, -62], [-165, -108], [-118, -150], [-92, -176], [-24, -178], [48, -162], [110, -132],
  [152, -70], [188, -48], [160, 50], [214, 66], [140, 112], [-62, 112], [2, 124], [64, 118], [-130, 176], [30, 178], [96, 170], [-170, 170], [-238, 150], [-60, 40], [-100, 30], [236, 10], [-215, -140], [200, -120],
];
let CMP = null, LAN = null;
const gridKey = (x, z) => Math.floor(x / 24) + ',' + Math.floor(z / 24);
let BUCKET = null;
function build() {
  CMP = []; LAN = [];
  const rand = rng(1220), taken = (x, z, R) => CMP.some((q) => Math.hypot(q.c[0] - x, q.c[1] - z) < q.R + R + 1.4);
  const free = (x, z, R) => !inCut(x, z, R + 9) && Math.hypot(x - ARRIVAL[0], z - ARRIVAL[1]) > R + 7 && Math.hypot(x - HUT.c[0], z - HUT.c[1]) > R + 7
    && !PATHS.some((r) => rectDist(r, x, z) < R * 0.55 + 3.4) && !LINKS.some((l) => segDist(l.a, l.b, x, z) < R * 0.55 + 3) && Math.hypot(x, z) < 255 - R * 0.4;
  for (const [ax, az] of ANCHORS) {
    const np = nearPath(ax, az), want = 2 + Math.floor(rand() * 3) + (Math.hypot(ax, az) < 250 ? 1 : 0);
    let made = 0;
    for (let k = 0; k < 90 && made < want; k++) {
      const a = rand() * Math.PI * 2, d = made === 0 && k < 6 ? rand() * 6 : 12 + rand() * 24, R = 7.6 + rand() * 2.6, x = ax + Math.cos(a) * d, z = az + Math.sin(a) * d;
      if (!free(x, z, R) || taken(x, z, R)) continue;
      const to = np.d > 4 ? np.p : [ax + 1, az], gate = Math.atan2(to[1] - z, to[0] - x), gx = x + Math.cos(gate) * R, gz = z + Math.sin(gate) * R;
      CMP.push({ c: [x, z], R, gate, anchor: [ax, az], seed: Math.floor(rand() * 1e6), stone: rand() < 0.55, gx, gz });
      made++;
    }
    if (made && np.d > 4) LAN.push({ a: [ax, az], b: np.p, w: 1.8 });
  }
  // the buildings of each compound
  HOUSES = [];
  for (const q of CMP) {
    const r = rng(q.seed), u = [Math.cos(q.gate), Math.sin(q.gate)], v = [-u[1], u[0]];
    const R = 2.9 + r() * 1.3, two = R > 3.3 && r() < 0.45, back = q.R - R - 1.5;
    const main = { c: [q.c[0] - u[0] * back, q.c[1] - u[1] * back], r: R, storeys: two ? 2 : 1, seed: Math.floor(r() * 1e6), kind: 'main', door: q.gate };
    HOUSES.push(main); q.main = main;
    const nk = 1 + (r() < 0.5 ? 1 : 0);
    for (let i = 0; i < nk; i++) {
      const s = i ? -1 : 1, kr = 1.9 + r() * 0.6, off = q.R - kr - 1.1;
      HOUSES.push({ c: [q.c[0] + v[0] * s * off * 0.8 - u[0] * 1.2, q.c[1] + v[1] * s * off * 0.8 - u[1] * 1.2], r: kr, storeys: 1, seed: Math.floor(r() * 1e6), kind: i ? 'store' : 'kitchen', door: q.gate + Math.PI * (s > 0 ? 0.55 : -0.55) });
    }
    q.granary = r() < 0.6 ? [q.c[0] + u[0] * 2.2 - v[0] * (q.R * 0.45), q.c[1] + u[1] * 2.2 - v[1] * (q.R * 0.45)] : null;
    q.pen = r() < 0.5 ? [q.c[0] + u[0] * (q.R * 0.35) + v[0] * (q.R * 0.35), q.c[1] + u[1] * (q.R * 0.35) + v[1] * (q.R * 0.35)] : null;
    LAN.push({ a: [q.gx, q.gz], b: q.anchor, w: 1.4 });
  }
  // lone houses on the slopes (the herders and farmers of the terraces), and some more round the hamlets' edges
  for (let k = 0; k < 900 && HOUSES.length < 430; k++) {
    const a = rand() * Math.PI * 2, d = 110 + Math.sqrt(rand()) * 175, x = Math.cos(a) * d, z = Math.sin(a) * d, r = 2.4 + rand() * 1.8;
    if (!free(x, z, r + 2) || taken(x, z, r + 2) || HOUSES.some((h) => Math.hypot(h.c[0] - x, h.c[1] - z) < h.r + r + 4)) continue;
    HOUSES.push({ c: [x, z], r, storeys: rand() < 0.3 ? 2 : 1, seed: Math.floor(rand() * 1e6), kind: 'lone', door: rand() * 6.28 });
  }
  // the knoll is left open: no compound, house or lane on it
  { const off = (p) => Math.hypot(p[0] - KNOLL.c[0], p[1] - KNOLL.c[1]) < KNOLL.clear;
    CMP = CMP.filter((q) => !off(q.c)); HOUSES = HOUSES.filter((h) => !off(h.c)); LAN = LAN.filter((l) => !off(l.a) && !off(l.b)); }
  // the enterable houses: the main houses nearest the arrival (the knoll's pilgrims' viewing place, WATCH), a good way apart, then the kitchens
  // of the compounds nearest it (a smaller round house each, the family's cooking house, entered like the others)
  ENTER = [];
  const dA = (h) => Math.hypot(h.c[0] - WATCH[0], h.c[1] - WATCH[1]);
  const mains = HOUSES.filter((h) => h.kind === 'main' && h.r > 3.0).sort((p, q) => dA(p) - dA(q));
  const KINDS = ['household', 'weaver', 'brewer', 'scribe', 'store', 'household', 'weaver', 'brewer', 'scribe', 'household', 'store', 'brewer'];
  for (const h of mains) {
    if (ENTER.length >= KINDS.length) break;
    if (Math.hypot(h.c[0] - ARRIVAL[0], h.c[1] - ARRIVAL[1]) < 22 || dA(h) > 170) continue;
    if (ENTER.some((e) => Math.hypot(e.c[0] - h.c[0], e.c[1] - h.c[1]) < 16)) continue;
    h.enter = KINDS[ENTER.length]; h.storeys = 1; h.r = 3.8; ENTER.push(h);
  }
  BUCKET = new Map();
  const put = (k, o) => { let l = BUCKET.get(k); if (!l) BUCKET.set(k, (l = [])); l.push(o); };
  for (const q of CMP) for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) put(gridKey(q.c[0] + i * 24, q.c[1] + j * 24), { c: q.c, r: q.R });
  for (const h of HOUSES) for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) put(gridKey(h.c[0] + i * 24, h.c[1] + j * 24), { c: h.c, r: h.r });
  LBUCKET = new Map();
  const lput = (k, o) => { let l = LBUCKET.get(k); if (!l) LBUCKET.set(k, (l = [])); l.push(o); };
  for (const l of [...LAN, ...LINKS, ...PATHS.map((r) => ({ rect: r }))]) {
    const x0 = l.rect ? l.rect[0] : Math.min(l.a[0], l.b[0]), x1 = l.rect ? l.rect[2] : Math.max(l.a[0], l.b[0]), z0 = l.rect ? l.rect[1] : Math.min(l.a[1], l.b[1]), z1 = l.rect ? l.rect[3] : Math.max(l.a[1], l.b[1]);
    for (let i = Math.floor((x0 - 4) / 24); i <= Math.floor((x1 + 4) / 24); i++) for (let j = Math.floor((z0 - 4) / 24); j <= Math.floor((z1 + 4) / 24); j++) lput(i + ',' + j, l);
  }
}
let HOUSES = null, ENTER = null, LBUCKET = null;
export function compounds() { if (!CMP) build(); return CMP; }
/** Every round house, compound and lone: { c, r, storeys, seed, kind ('main' | 'kitchen' | 'store' | 'lone'), door, enter? }. */
export function houses() { if (!CMP) build(); return HOUSES; }
/** The footpaths between the compounds and the hamlets and the ways: { a, b, w }. */
export function lanes() { if (!CMP) build(); return LAN; }
/** The houses that can be entered (kind of household in `enter`), besides HUT. */
export function enterable() { if (!CMP) build(); return ENTER; }
/** How far (m) a point is from the nearest lane or way, with the lane's half-width taken off (≤ 0 on it). */
export function onLane(x, z) {
  if (!CMP) build();
  let d = 1e9;
  for (const l of LBUCKET.get(Math.floor(x / 24) + ',' + Math.floor(z / 24)) ?? []) d = Math.min(d, l.rect ? rectDist(l.rect, x, z) - 0.5 : segDist(l.a, l.b, x, z) - l.w / 2);
  return d;
}
/** The compound whose yard holds the point (a margin m), or null. */
export function inYard(x, z, m = 0) {
  if (!CMP) build();
  for (const o of BUCKET.get(gridKey(x, z)) ?? []) if (o.r > 6 && Math.hypot(o.c[0] - x, o.c[1] - z) < o.r + m) return o;
  return null;
}
export const HUT = { c: [-224, 104], r: 3.9, door: Math.PI };   // the house one can enter, near the arrival
export const nearHouse = (x, z, m = 0) => {
  if (Math.hypot(HUT.c[0] - x, HUT.c[1] - z) < HUT.r + 1.2 + m) return true;
  if (!CMP) build();
  for (const o of BUCKET.get(gridKey(x, z)) ?? []) if (Math.hypot(o.c[0] - x, o.c[1] - z) < o.r + m) return true;
  return false;
};
