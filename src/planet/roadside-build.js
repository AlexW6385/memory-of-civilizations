// The country along the roads between a region's settlements (DESIGN §4.1 "the roads and fields
// that join settlements of one region"; src/planet/relief.js ROADS): by region and period, the
// fields of the region's pattern either side of the road near each settlement and in patches along
// the way, and the small things of the road — milestones, wayside shrines, wells and troughs, a
// farmstead or a hamlet of plain houses set back — and a ford or a bridge where a road crosses a
// river. Pure (no three.js): chunk(roadIndex, k) of SEG metres of a road is built in a worker
// (src/planet/roadside-worker.js) as one vertex-coloured mesh in planet coordinates; the same
// hash of the road, the place along it and a salt places everything the same at every visit.

import { ROADS, BUILT, surface, natural, PLANET_RADIUS as R, BLEND } from './relief.js';
import { riverAt } from './rivers.js';
import { dot, cross, add, scale, norm, angle } from './geo.js';
import { CROP_OF } from '../settlements/crops.js';
import { Mesh, Frame, paint, shade, box, frustum, gable, cone, dome, blob, opening } from './roadside-kit.js';

export const SEG = 128;          // metres of road in a chunk
const CELL = 96;                 // metres of road in a cell of small things
const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** A unit hash of integers. */
export function hash(...v) {
  let h = 2166136261;
  for (const x of v) { h ^= (x | 0) + 0x9e3779b9; h = Math.imul(h ^ (h >>> 15), 2246822507); h ^= h >>> 13; h = Math.imul(h, 3266489909); h ^= h >>> 16; }
  return (h >>> 0) / 4294967296;
}

// ---------------------------------------------------------------------------------------------
// the road's line (the same as the one painted on the ground, src/planet/relief.js coverAt)

export const roadLength = (rd) => rd.ang * R;
function wobble(rd, m) {
  const L = roadLength(rd), mm = Math.max(0, Math.min(L, m));
  const w = 22 * Math.sin(mm / 210 + rd.seed) + 9 * Math.sin(mm / 67 + rd.seed * 3.1);
  return w * Math.max(0, Math.min(1, mm / 300, (L - mm) / 300));
}
/** Direction on the planet at m metres along road rd and `off` metres to its side (+ toward the arc's pole). */
export function roadU(rd, m, off = 0) {
  const t = m / R, o = wobble(rd, m) + off;
  return norm([0, 1, 2].map((i) => rd.a[i] * Math.cos(t) + rd.t[i] * Math.sin(t) + rd.n[i] * (o / R)));
}
/** The frame of the road at m: { u (up), f (forward), s (side) }. */
function roadAxes(rd, m, off = 0) {
  const u = roadU(rd, m, off), v = roadU(rd, m + 3, off), w = roadU(rd, m - 3, off);
  const d = [v[0] - w[0], v[1] - w[1], v[2] - w[2]], k = dot(d, u), f = norm([d[0] - u[0] * k, d[1] - u[1] * k, d[2] - u[2] * k]);
  const s = norm(cross(f, u));
  return { u, f, s };
}
const sgn = (rd, ax) => (dot(ax.s, rd.n) >= 0 ? 1 : -1);   // (the lateral sign of off against the side vector)

const heightAt = (u) => surface(u).h;
const place = (u, y = 0) => { const r = R + heightAt(u) + y; return [u[0] * r, u[1] * r, u[2] * r]; };

/** Is the ground at u country for the roadside: land, not a river's bank, nowhere a settlement's disc or its blend and 30 m more. */
function valid(u, ground = null) {
  const g = ground || surface(u);
  if (g.s) return false;
  const n = g.n;
  if (n.d < 14 || (n.river ?? 0) > 0.02 || g.h < 1.2 || g.h > 70) return false;
  for (const S of BUILT) if (angle(u, S.u) * R < S.radius + BLEND + 30) return false;
  return true;
}

// ---------------------------------------------------------------------------------------------
// the regions' ways: crops, fields, houses and small things (dossiers in docs/settlements, crops in src/settlements/crops.js)

const SOIL = paint('#7a6547', '#7a6547', 0, 0.95), MUD = paint('#6c5a40', '#6c5a40', 0, 0.95), DUN = paint('#8b7957', '#8b7957', 0, 0.95);
const STONE = paint('#8f8a7c'), STONE2 = paint('#a39d8d'), EARTH = paint('#7d6b4c'), DARK = paint('#2a2622'), TIMBER = paint('#6d5238'), TIMBER2 = paint('#85693f');
const GREENS = { broad: paint('#5b7a38', '#6b5a40', 1), olive: paint('#78865a'), palm: paint('#5f7a3a'), cypress: paint('#34502f'), agave: paint('#6f8d6a'), poplar: paint('#6f8d3e', '#7a6a4a', 1) };
// crop stages: [furrow paint, ridge paint (null: none), ridge height]
const CROPS = {
  rice: [[paint('#6f858a', '#7a6a4a', 1, 0.12), null, 0], [paint('#7a6a4a', '#7a6a4a', 0, 0.8), paint('#86b050', '#7a6a4a', 1), 0.14], [paint('#6a5c40', '#7a6a4a', 0, 0.8), paint('#5c9033', '#7a6a4a', 1), 0.3], [paint('#6a5c40', '#7a6a4a', 0, 0.8), paint('#c8aa48', '#7a6a4a', 1), 0.34]],
  wheat: [[SOIL, paint('#7fa046', '#b59a63', 1), 0.22], [SOIL, paint('#cbb05a', '#b59a63', 1), 0.4], [SOIL, paint('#b59a63', '#b59a63', 1), 0.1], [DUN, null, 0]],
  millet: [[SOIL, paint('#b8995a', '#9b8458', 1), 1.2], [SOIL, paint('#9fae55', '#9b8458', 1), 0.9]],
  barley: [[MUD, paint('#6a9a40', '#8b7a55', 1), 0.3], [MUD, paint('#8fae4c', '#8b7a55', 1), 0.25], [MUD, paint('#c4ab5a', '#8b7a55', 1), 0.4]],
  vine: [[SOIL, paint('#5f8a3a', '#6e5a3a', 1), 0.95], [SOIL, paint('#6c9440', '#6e5a3a', 1), 0.85]],
  maize: [[SOIL, paint('#5f8e30', '#a58a4c', 1), 1.9], [SOIL, paint('#759a38', '#a58a4c', 1), 1.5]],
  yam: [[SOIL, paint('#4f7d2e', '#6a5a3a', 1), 0.9], [SOIL, paint('#668a3a', '#6a5a3a', 1), 0.7]],
};

const H = (w, d, h, wall, roof, rc, extra = {}) => ({ w, d, h, wall, roof, rc, ...extra });
const STYLES = {
  cnRice: { fields: [['paddy', 0.8, 'rice'], ['grove', 0.2, 'broad']], house: H([6, 9], [5, 7], 3, ['#e8e2d2', '#ddd6c4'], 'gable', ['#4a4d52', '#55585c'], { chimney: false }), marker: 'stele', shrine: 'tudi', well: 'curb', bridge: 'arch' },
  cnDry: { fields: [['strip', 0.8, 'wheat'], ['strip', 0.1, 'millet'], ['grove', 0.1, 'broad']], house: H([6, 9], [5, 7], 2.8, ['#a58b66', '#9a8060'], 'gable', ['#6b6258', '#756a5e'], { low: true }), marker: 'stele', shrine: 'tudi', well: 'curb', bridge: 'timber' },
  japan: { fields: [['paddy', 1, 'rice']], house: H([7, 10], [6, 8], 2.6, ['#7b6444', '#d6cdb4'], 'hip', ['#a8955a', '#9d8b52'], { deep: true }), marker: 'stone', shrine: 'torii', well: 'curb', bridge: 'timber' },
  india: { fields: [['strip', 0.6, 'wheat'], ['strip', 0.2, 'millet'], ['grove', 0.2, 'broad']], rice: [['paddy', 1, 'rice']], house: H([5, 8], [4, 6], 2.4, ['#b49a72', '#a98f66'], 'hip', ['#b59c5e', '#a8914f']), marker: 'kos', shrine: 'stupa', well: 'curb', bridge: 'ford' },
  java: { fields: [['paddy', 1, 'rice']], house: H([6, 9], [5, 7], 2.3, ['#8a6f4a', '#7d633f'], 'hip', ['#8d7b45', '#7f6e3d'], { deep: true }), marker: 'stone', shrine: 'stupa', well: 'curb', bridge: 'timber' },
  mesop: { fields: [['irrigated', 0.6, 'barley'], ['grove', 0.4, 'palm']], house: H([6, 9], [5, 7], 2.8, ['#b89a6e', '#ad9068'], 'flat', ['#a88a5e'], {}), marker: 'kudurru', shrine: 'altar', well: 'shaduf', bridge: 'timber' },
  persia: { fields: [['irrigated', 0.7, 'wheat'], ['grove', 0.3, 'poplar']], house: H([6, 8], [5, 7], 3, ['#c1a577', '#b89d70'], 'dome', ['#c9b184'], {}), marker: 'stone', shrine: 'dome', well: 'curb', bridge: 'arch' },
  levant: { fields: [['terrace', 0.5, 'wheat'], ['grove', 0.5, 'olive']], house: H([5, 8], [4, 6], 2.7, ['#cdb88e', '#c4af86'], 'flat', ['#bfa97c'], {}), marker: 'cairn', shrine: 'dome', well: 'curb', bridge: 'arch', edge: 'wall' },
  bosph: { fields: [['strip', 0.5, 'wheat'], ['vine', 0.2, 'vine'], ['grove', 0.3, 'olive']], house: H([6, 9], [5, 7], 3, ['#e6dcc6', '#d9ccb0'], 'hip', ['#b5654a', '#a85a42'], {}), marker: 'column', shrine: 'calvary', well: 'curb', bridge: 'arch', edge: 'wall' },
  aegean: { fields: [['strip', 0.3, 'wheat'], ['vine', 0.25, 'vine'], ['terrace', 0.15, 'wheat'], ['grove', 0.3, 'olive']], house: H([5, 8], [4, 6], 2.8, ['#e6dcc6', '#ddd2b8'], 'flat', ['#b5654a', '#c9bca0'], { low: true }), marker: 'herm', shrine: 'tabernacle', well: 'curb', bridge: 'arch', edge: 'wall' },
  egypt: { fields: [['irrigated', 0.6, 'barley'], ['grove', 0.4, 'palm']], house: H([5, 8], [4, 6], 2.6, ['#b8a074', '#ad966c'], 'flat', ['#a58f66'], {}), marker: 'stele', shrine: 'chapel', well: 'shaduf', bridge: 'ford' },
  sahel: { fields: [['milpa', 0.6, 'millet'], ['milpa', 0.4, 'yam']], house: H([3.2, 4.2], [3.2, 4.2], 1.9, ['#a47e58', '#9b744f'], 'cone', ['#b8a05a'], { round: true }), marker: 'cairn', shrine: 'hut', well: 'curb', bridge: 'ford' },
  latium: { fields: [['strip', 0.4, 'wheat'], ['vine', 0.3, 'vine'], ['grove', 0.3, 'olive']], house: H([7, 11], [5, 8], 3.2, ['#d9c7a6', '#cdb894'], 'gable', ['#b4583d', '#a84e36'], {}), marker: 'column', shrine: 'tabernacle', well: 'curb', bridge: 'arch', edge: 'wall' },
  britain: { fields: [['strip', 0.9, 'wheat'], ['grove', 0.1, 'broad']], house: H([6, 10], [4.5, 6], 2.5, ['#cfc6b0', '#c4b99f'], 'gable', ['#b09a5c', '#a28d52'], { deep: true }), marker: 'stone', shrine: 'cross', well: 'curb', bridge: 'arch', edge: 'hedge' },
  france: { fields: [['strip', 0.55, 'wheat'], ['vine', 0.35, 'vine'], ['grove', 0.1, 'broad']], house: H([6, 10], [5, 7], 3, ['#c9b99a', '#bfae8e'], 'gable', ['#5f6168', '#6a6c72'], { chimney: true }), marker: 'stone', shrine: 'calvary', well: 'curb', bridge: 'arch', edge: 'hedge' },
  iberia: { fields: [['terrace', 0.3, 'wheat'], ['vine', 0.3, 'vine'], ['grove', 0.4, 'olive']], house: H([6, 9], [5, 7], 3, ['#efe9dc', '#e6dfcf'], 'gable', ['#b0604a', '#a65640'], {}), marker: 'stone', shrine: 'calvary', well: 'curb', bridge: 'arch', edge: 'wall' },
  italy: { fields: [['strip', 0.4, 'wheat'], ['vine', 0.4, 'vine'], ['grove', 0.2, 'olive']], house: H([7, 11], [6, 8], 3.4, ['#d4b98f', '#c9ad82'], 'hip', ['#b3593e', '#a64f36'], {}), marker: 'stone', shrine: 'tabernacle', well: 'curb', bridge: 'arch', edge: 'wall' },
  mexico: { fields: [['milpa', 0.8, 'maize'], ['grove', 0.2, 'agave']], house: H([5, 8], [4, 5.5], 2.2, ['#b79b6f', '#ac9166'], 'gable', ['#a8924f', '#9b8647'], { deep: true }), marker: 'cairn', shrine: 'altar', well: 'curb', bridge: 'timber' },
  yucatan: { fields: [['milpa', 0.9, 'maize'], ['grove', 0.1, 'broad']], house: H([4.2, 5.5], [4.2, 5.5], 2.0, ['#cbbf9f', '#c1b595'], 'cone', ['#a8924f'], { round: true }), marker: 'stela', shrine: 'altar', well: 'curb', bridge: 'timber' },
};
const REGION = { china: 'cnRice', japan: 'japan', india: 'india', java: 'java', mesopotamia: 'mesop', persia: 'persia', levant: 'levant', bosphorus: 'bosph', egypt: 'egypt', sahel: 'sahel', aegean: 'aegean', latium: 'latium', britain: 'britain', france: 'france', iberia: 'iberia', italy: 'italy', mexico: 'mexico', yucatan: 'yucatan' };
/** The style of the country at m along road rd: the region's, with the crop of the nearer settlement (src/settlements/crops.js). */
export function styleAt(rd, m) {
  const S = m < roadLength(rd) / 2 ? rd.ends[0] : rd.ends[1], reg = S.site.region;
  let key = REGION[reg] ?? 'france';
  const rice = CROP_OF[S.id] === 'rice';
  if (reg === 'china' && !rice) key = 'cnDry';
  const st = STYLES[key];
  return { key, ...st, fields: rice && st.rice ? st.rice : st.fields };
}

// ---------------------------------------------------------------------------------------------
// rivers crossed: where the road runs over water, a deck (ford, timber or stone bridge)

let CROSSINGS = null;
/** The places a road crosses a river: { ri, m0, m1, kind, c, ax, sd, half, H0, hump, width } (deck in a straight line from m0 to m1). */
export function crossings() {
  if (CROSSINGS) return CROSSINGS;
  CROSSINGS = [];
  ROADS.forEach((rd, ri) => {
    const L = roadLength(rd);
    let a = null, last = -1e9;
    const close = () => {
      if (a == null) return;
      const m0 = a - 3, m1 = last + 3;
      a = null;
      if (m1 - m0 > 150) return;                               // (a road running along a river: not bridged)
      if ([m0, (m0 + m1) / 2, m1].some((mm) => { const u = roadU(rd, mm); return BUILT.some((S) => angle(u, S.u) * R < S.radius + BLEND + 12); })) return;   // (in a settlement's zone: its own)
      const kind = styleAt(rd, (m0 + m1) / 2).bridge;
      const p0 = roadU(rd, m0), p1 = roadU(rd, m1), c = norm(add(p0, p1));
      let ax = norm([p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]]);
      const k = dot(ax, c); ax = norm([ax[0] - c[0] * k, ax[1] - c[1] * k, ax[2] - c[2] * k]);
      const sd = norm(cross(ax, c)), half = (m1 - m0) / 2;
      CROSSINGS.push({ ri, m0, m1, kind, c, ax, sd, half, H0: kind === 'ford' ? 0.4 : 1.0, hump: kind === 'arch' ? Math.min(1.3, half * 0.05) : 0, width: kind === 'ford' ? 3.6 : 3.2 });
    };
    for (let m = 0; m <= L; m += 3) {
      const u = roadU(rd, m), rv = riverAt(u);
      if (rv && rv.d < rv.half + rv.bank && natural(u).h < 1.0) { if (a == null) a = m; else if (m - last > 30) { close(); a = m; } last = m; } else if (a != null && m - last > 30) close();
    }
    close();
  });
  return CROSSINGS;
}
/** The deck's height above the sea at s metres from the middle of crossing cr. */
export const deckH = (cr, s) => cr.H0 + cr.hump * Math.max(0, 1 - (s / cr.half) ** 2);
const deckU = (cr, s, lat) => norm([0, 1, 2].map((i) => cr.c[i] + (cr.ax[i] * s + cr.sd[i] * lat) / R));

function bridge(M, cr, detail) {
  const n = Math.max(2, Math.round(cr.half * 2 / 2)), w = cr.width / 2, bed = -1.8;
  const wood = paint('#7a5d3c'), stone = paint('#a6a08f'), top = cr.kind === 'timber' ? paint('#8a6c45') : paint('#b0a794', '#b0a794', 0, 0.9);
  const pts = (s, lat, dy = 0) => { const u = deckU(cr, s, lat), r = R + deckH(cr, s) + dy; return [u[0] * r, u[1] * r, u[2] * r]; };
  const below = (s, lat) => { const u = deckU(cr, s, lat), r = R - 20; return [u[0] * r, u[1] * r, u[2] * r]; };
  const th = cr.kind === 'ford' ? 0.35 : 0.3;
  for (let i = 0; i < n; i++) {
    const s0 = -cr.half + (i / n) * 2 * cr.half, s1 = -cr.half + ((i + 1) / n) * 2 * cr.half;
    // the walking surface and its underside
    M.quad(pts(s0, -w), pts(s1, -w), pts(s1, w), pts(s0, w), cr.kind === 'ford' ? shade(paint('#8d887a'), hash(cr.ri, i) - 0.5) : top, below(s0, 0));
    if (cr.kind !== 'ford') {
      M.quad(pts(s0, -w, -th), pts(s1, -w, -th), pts(s1, w, -th), pts(s0, w, -th), wood, pts(s0, 0, 4));
      for (const l of [-w, w]) M.quad(pts(s0, l, -th), pts(s1, l, -th), pts(s1, l, 0), pts(s0, l, 0), wood, pts(s0, 0, -0.1));
    } else {
      for (const l of [-w, w]) M.quad(pts(s0, l, -0.5), pts(s1, l, -0.5), pts(s1, l, 0), pts(s0, l, 0), stone, pts(s0, 0, -0.1));
    }
  }
  if (cr.kind === 'timber') {
    // piles of the trestle every 4 m, and a rail
    for (let s = -cr.half; s <= cr.half + 0.1; s += 4) for (const l of [-w + 0.2, w - 0.2]) {
      const u = deckU(cr, s, l), P = [u[0] * (R + bed), u[1] * (R + bed), u[2] * (R + bed)], up = u;
      const f = new Frame(P, cr.ax, cr.sd, up);
      box(M, f, -0.15, 0.15, 0, deckH(cr, s) - bed - 0.3 + 1.0, -0.15, 0.15, wood);
    }
    for (const l of [-w, w]) for (let i = 0; i < n; i++) {
      const s0 = -cr.half + (i / n) * 2 * cr.half, s1 = -cr.half + ((i + 1) / n) * 2 * cr.half;
      M.quad(pts(s0, l, 0.85), pts(s1, l, 0.85), pts(s1, l, 0.95), pts(s0, l, 0.95), wood, pts(s0, l * 0.5, 0.9));
      M.quad(pts(s0, l, 0.85), pts(s1, l, 0.85), pts(s1, l, 0.95), pts(s0, l, 0.95), wood, pts(s0, l * 2, 0.9));
    }
  } else if (cr.kind === 'arch') {
    // stone spandrel walls with round arches between piers, parapets above
    const span = Math.max(5, Math.min(9, cr.half * 2 / Math.max(1, Math.round(cr.half * 2 / 7)))), nA = Math.max(1, Math.round(cr.half * 2 / span));
    for (const l of [-w, w]) for (let i = 0; i < n; i++) {
      const s0 = -cr.half + (i / n) * 2 * cr.half, s1 = -cr.half + ((i + 1) / n) * 2 * cr.half;
      const arch = (s) => { const k = (s + cr.half) / (2 * cr.half) * nA, f = k - Math.floor(k), c = Math.abs(f - 0.5) * span, rr = span * 0.42; return c < rr ? -0.2 + (deckH(cr, s) - th - 0.5 + 0.2) * Math.sqrt(1 - (c / rr) ** 2) : bed; };
      const y0 = (s) => Math.min(arch(s), deckH(cr, s) - th - 0.3);
      const q = (s, y) => { const u = deckU(cr, s, l), r = R + y; return [u[0] * r, u[1] * r, u[2] * r]; };
      const out = pts(s0, 0, -1);
      M.quad(q(s0, y0(s0)), q(s1, y0(s1)), q(s1, deckH(cr, s1) - th), q(s0, deckH(cr, s0) - th), stone, out);
      M.card(pts(s0, l, 0), pts(s1, l, 0), pts(s1, l, 0.7), pts(s0, l, 0.7), stone);
      M.quad(pts(s0, l - 0.2, 0.7), pts(s1, l - 0.2, 0.7), pts(s1, l + 0.2, 0.7), pts(s0, l + 0.2, 0.7), stone, pts(s0, l, -1));
    }
  }
  // the ends of a ford: a marker pole on each bank
  if (cr.kind === 'ford') for (const s of [-cr.half - 1, cr.half + 1]) for (const l of [-w - 0.8]) {
    const u = deckU(cr, s, l), P = place(u), f = new Frame(P, cr.ax, cr.sd, u);
    box(M, f, -0.07, 0.07, 0, 1.8, -0.07, 0.07, TIMBER);
  }
}

/** The deck's height at the planet point direction p0n (a unit vector) or -Infinity: used by the collision (src/planet/roadside.js). */
export function deckAtDir(cr, p0n) {
  const dx = p0n[0] - cr.c[0], dy = p0n[1] - cr.c[1], dz = p0n[2] - cr.c[2];
  const s = (dx * cr.ax[0] + dy * cr.ax[1] + dz * cr.ax[2]) * R, lat = (dx * cr.sd[0] + dy * cr.sd[1] + dz * cr.sd[2]) * R;
  if (Math.abs(s) > cr.half || Math.abs(lat) > cr.width / 2 + 0.35) return -Infinity;
  return deckH(cr, s);
}

// ---------------------------------------------------------------------------------------------
// small things: milestones, shrines, wells, farmsteads and hamlets by cell of the road

function frameAt(u, yaw, ax) {
  // a frame on the ground at u turned by yaw from the road's forward
  const f0 = ax.f, s0 = ax.s, c = Math.cos(yaw), s = Math.sin(yaw);
  const F = norm([0, 1, 2].map((i) => f0[i] * c + s0[i] * s)), S = norm(cross(F, u));
  return new Frame(place(u), F, S, u);
}

/** The things of a cell: [{ kind, m, o (lateral, signed), r (clear radius) }] — the same every visit. */
const THINGS = new Map();
export function things(ri, ci) {
  const key = ri * 100000 + ci;
  let out = THINGS.get(key);
  if (out) return out;
  out = [];
  const rd = ROADS[ri], L = roadLength(rd);
  const at = (salt) => ci * CELL + hash(ri, ci, salt) * CELL;
  const side = (salt) => (hash(ri, ci, salt + 50) < 0.5 ? -1 : 1);
  const cut = (m) => m > 20 && m < L - 20;
  const roll = hash(ri, ci, 1);
  if (roll < 0.15) { const m = at(2); if (cut(m)) out.push({ kind: 'hamlet', m, o: side(2) * (34 + hash(ri, ci, 3) * 30), r: 30 }); }
  else if (roll < 0.42) { const m = at(4); if (cut(m)) out.push({ kind: 'farm', m, o: side(4) * (26 + hash(ri, ci, 5) * 20), r: 20 }); }
  if (hash(ri, ci, 6) < 0.14) { const m = at(7); if (cut(m)) out.push({ kind: 'shrine', m, o: side(7) * (6.5 + hash(ri, ci, 8) * 2), r: 3 }); }
  if (hash(ri, ci, 9) < 0.13) { const m = at(10); if (cut(m)) out.push({ kind: 'well', m, o: side(10) * (7 + hash(ri, ci, 11) * 3), r: 4 }); }
  if (hash(ri, ci, 12) < 0.26) { const m = at(13); if (cut(m)) out.push({ kind: 'marker', m, o: side(13) * (5.5 + hash(ri, ci, 14)), r: 1.5 }); }
  THINGS.set(key, out);
  return out;
}

// the shapes

function house(M, f, st, h, big = 1) {
  const H = st.house, w = (H.w[0] + (H.w[1] - H.w[0]) * h(1)) * big, d = (H.d[0] + (H.d[1] - H.d[0]) * h(2)) * big, ht = H.h * (0.9 + 0.2 * h(3));
  const wall = paint(H.wall[Math.floor(h(4) * H.wall.length)]), roof = shade(paint(H.rc[Math.floor(h(5) * H.rc.length)]), h(6) - 0.5);
  const rad = []; // collision radius
  if (H.round) {
    const r = w / 2;
    cone(M, f, 0, 0, r, 0, r, ht, 8, wall, false);
    cone(M, f, 0, 0, r * 1.35, ht - 0.05, 0.15, ht + r * 1.1, 8, roof, true);
    opening(M, f, 0, 0, 1.4, r + 0.02, 0.8, 'z+', DARK);
    return r * 1.3;
  }
  box(M, f, -w / 2, w / 2, -0.15, ht, -d / 2, d / 2, wall);
  const ov = H.deep ? 0.8 : 0.4;
  if (H.roof === 'gable') gable(M, f, -w / 2, w / 2, -d / 2, d / 2, ht, ht + (H.low ? 0.6 : w * 0.32), ov, roof, wall);
  else if (H.roof === 'hip') frustum(M, f, -w / 2 - ov, w / 2 + ov, -d / 2 - ov, d / 2 + ov, ht - 0.1, ht + w * 0.3, 0.2, Math.max(0.2, d - w * 0.3), roof);
  else if (H.roof === 'dome') { box(M, f, -w / 2 - 0.1, w / 2 + 0.1, ht, ht + 0.25, -d / 2 - 0.1, d / 2 + 0.1, wall); dome(M, f, 0, 0, Math.min(w, d) * 0.42, ht + 0.2, roof, 8, 3); }
  else box(M, f, -w / 2 - 0.1, w / 2 + 0.1, ht, ht + 0.3, -d / 2 - 0.1, d / 2 + 0.1, roof);
  opening(M, f, (h(7) - 0.5) * w * 0.4, 0, 1.75, d / 2, 0.9, 'z+', DARK);
  opening(M, f, w * 0.3, 1.0, 1.7, d / 2, 0.6, 'z+', DARK); opening(M, f, -w * 0.3, 1.0, 1.7, d / 2, 0.6, 'z+', DARK);
  if (H.chimney) box(M, f, w * 0.25, w * 0.25 + 0.5, ht + w * 0.1, ht + w * 0.32 + 0.9, 0, 0.5, STONE);
  return Math.hypot(w, d) / 2;
}

function tree(M, f, kind, h) {
  const s = 0.85 + h(1) * 0.4;
  if (kind === 'palm') {
    const H = 7 * s;
    cone(M, f, 0, 0, 0.3, 0, 0.18, H, 6, paint('#7a6444'), false);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + h(2), c = Math.cos(a), sn = Math.sin(a), L = 3.4 * s;
      M.card(f.at(0, H, 0), f.at(c * L * 0.55 - sn * 0.35, H + 0.7, sn * L * 0.55 + c * 0.35), f.at(c * L, H - 1.4, sn * L), f.at(c * L * 0.55 + sn * 0.35, H + 0.7, sn * L * 0.55 - c * 0.35), GREENS.palm);
    }
  } else if (kind === 'cypress') {
    cone(M, f, 0, 0, 0.9 * s, 0.3, 0, 7 * s, 6, GREENS.cypress, false);
  } else if (kind === 'agave') {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
      M.card(f.at(0, 0.3, 0), f.at(c * 1.1 - sn * 0.2, 0.9, sn * 1.1 + c * 0.2), f.at(c * 1.9, 0.5, sn * 1.9), f.at(c * 1.1 + sn * 0.2, 0.9, sn * 1.1 - c * 0.2), GREENS.agave);
    }
  } else {
    const pt = shade(kind === 'olive' ? GREENS.olive : kind === 'poplar' ? GREENS.poplar : GREENS.broad, h(3) - 0.5);
    const hh = kind === 'olive' ? 2.2 : 3.4;
    cone(M, f, 0, 0, 0.25 * s, 0, 0.15 * s, hh, 5, paint('#6b5a44'), false);
    blob(M, f, 0, hh + 0.8 * s, 0, (kind === 'olive' ? 2.1 : kind === 'poplar' ? 1.4 : 2.6) * s, (kind === 'poplar' ? 3.2 : 1.7) * s, (kind === 'olive' ? 2.1 : kind === 'poplar' ? 1.4 : 2.6) * s, pt, 6, 3, 0.35, h);
  }
}

function marker(M, f, st, h) {
  const stone = paint('#9c978a'), dk = paint('#857f72');
  switch (st.marker) {
    case 'stele': box(M, f, -0.45, 0.45, 0, 0.25, -0.4, 0.4, dk); box(M, f, -0.3, 0.3, 0.25, 1.5, -0.1, 0.1, stone); frustum(M, f, -0.3, 0.3, -0.1, 0.1, 1.5, 1.7, 0.1, 0.1, stone); break;
    case 'kos': cone(M, f, 0, 0, 1.2, 0, 1.1, 1.0, 8, paint('#a8825f'), false); cone(M, f, 0, 0, 0.8, 1.0, 0.4, 7.5, 8, paint('#b39068'), true); break;
    case 'column': box(M, f, -0.5, 0.5, 0, 0.4, -0.5, 0.5, dk); cone(M, f, 0, 0, 0.32, 0.4, 0.28, 2.4, 8, stone, true); break;
    case 'herm': box(M, f, -0.25, 0.25, 0, 1.3, -0.25, 0.25, stone); blob(M, f, 0, 1.55, 0, 0.26, 0.28, 0.26, stone, 6, 3); break;
    case 'kudurru': frustum(M, f, -0.55, 0.55, -0.4, 0.4, 0, 0.5, 0.9, 0.7, dk); frustum(M, f, -0.4, 0.4, -0.25, 0.25, 0.5, 1.9, 0.5, 0.4, stone); dome(M, f, 0, 0, 0.25, 1.9, stone, 6, 2); break;
    case 'stela': box(M, f, -0.6, 0.6, 0, 0.3, -0.5, 0.5, dk); box(M, f, -0.45, 0.45, 0.3, 2.3, -0.15, 0.15, stone); break;
    case 'cairn': for (let i = 0; i < 3; i++) blob(M, f, 0, 0.3 + i * 0.4, 0, 0.9 - i * 0.27, 0.3, 0.9 - i * 0.27, shade(stone, h(i) - 0.5), 6, 2); break;
    default: frustum(M, f, -0.35, 0.35, -0.3, 0.3, 0, 1.0, 0.5, 0.4, stone); box(M, f, -0.2, 0.2, 1.0, 1.15, -0.17, 0.17, dk);
  }
  return 1;
}

function shrine(M, f, st, h) {
  const stone = paint('#9c978a'), red = paint('#a8412e'), tile = paint('#4d5055');
  switch (st.shrine) {
    case 'tudi': box(M, f, -0.5, 0.5, 0, 0.9, -0.4, 0.4, stone); box(M, f, -0.3, 0.3, 0.1, 0.7, 0.4, 0.43, DARK); frustum(M, f, -0.65, 0.65, -0.55, 0.55, 0.9, 1.35, 0.3, 0.2, tile); break;
    case 'torii': for (const x of [-1.4, 1.4]) cone(M, f, x, 0, 0.16, 0, 0.13, 3.3, 6, red, true); box(M, f, -2.1, 2.1, 3.3, 3.55, -0.2, 0.2, paint('#2b2724')); box(M, f, -1.6, 1.6, 2.7, 2.9, -0.1, 0.1, red); box(M, f, -0.3, 0.3, 0, 0.5, 2.5, 3.1, stone); cone(M, f, 0, 2.8, 0.2, 0.5, 0.15, 1.7, 6, stone, true); box(M, f, -0.4, 0.4, 1.7, 1.95, 2.4, 3.2, stone); frustum(M, f, -0.45, 0.45, 2.35, 3.25, 1.95, 2.35, 0.1, 0.1, stone); break;
    case 'cross': for (let i = 0; i < 3; i++) box(M, f, -1 + i * 0.25, 1 - i * 0.25, i * 0.3, i * 0.3 + 0.3, -1 + i * 0.25, 1 - i * 0.25, stone); box(M, f, -0.18, 0.18, 0.9, 3.1, -0.14, 0.14, stone); box(M, f, -0.7, 0.7, 2.3, 2.7, -0.14, 0.14, stone); break;
    case 'calvary': box(M, f, -0.8, 0.8, 0, 0.5, -0.8, 0.8, stone); box(M, f, -0.3, 0.3, 0.5, 1.4, -0.3, 0.3, stone); box(M, f, -0.12, 0.12, 1.4, 3.3, -0.1, 0.1, TIMBER); box(M, f, -0.6, 0.6, 2.5, 2.74, -0.1, 0.1, TIMBER); gable(M, f, -0.65, 0.65, -0.25, 0.25, 3.3, 3.8, 0.1, paint('#6a5a48')); break;
    case 'stupa': box(M, f, -1.6, 1.6, 0, 0.5, -1.6, 1.6, stone); box(M, f, -1.2, 1.2, 0.5, 1.0, -1.2, 1.2, stone); dome(M, f, 0, 0, 1.15, 1.0, paint('#d8d1be'), 10, 4); box(M, f, -0.35, 0.35, 2.1, 2.45, -0.35, 0.35, stone); for (let i = 0; i < 3; i++) cone(M, f, 0, 0, 0.55 - i * 0.14, 2.45 + i * 0.3, 0.45 - i * 0.14, 2.7 + i * 0.3, 8, stone, true); break;
    case 'dome': box(M, f, -1.4, 1.4, 0, 2.2, -1.4, 1.4, paint('#d9cdb0')); box(M, f, -0.4, 0.4, 0, 1.5, 1.4, 1.43, DARK); dome(M, f, 0, 0, 1.25, 2.2, paint('#cfc4a3'), 8, 3); break;
    case 'altar': for (let i = 0; i < 3; i++) box(M, f, -1.5 + i * 0.4, 1.5 - i * 0.4, i * 0.45, i * 0.45 + 0.45, -1.5 + i * 0.4, 1.5 - i * 0.4, stone); box(M, f, -0.2, 0.2, 1.35, 2.5, -0.2, 0.2, paint('#8a8576')); break;
    case 'tabernacle': box(M, f, -0.12, 0.12, 0, 2.2, -0.12, 0.12, TIMBER2); box(M, f, -0.5, 0.5, 2.2, 3.0, -0.35, 0.35, paint('#d8ccb0')); box(M, f, -0.3, 0.3, 2.35, 2.9, 0.35, 0.38, paint('#8b4a3a')); gable(M, f, -0.5, 0.5, -0.35, 0.35, 3.0, 3.45, 0.15, paint('#a85a42')); break;
    case 'chapel': frustum(M, f, -1.2, 1.2, -1.0, 1.0, 0, 2.2, 2.0, 1.6, paint('#d4c39a')); box(M, f, -0.35, 0.35, 0, 1.3, -1.02, -1.0, DARK); break;
    case 'hut': cone(M, f, 0, 0, 0.8, 0, 0.8, 0.6, 8, paint('#a47e58'), false); cone(M, f, 0, 0, 1.2, 0.55, 0.1, 1.9, 8, paint('#b8a05a'), true); for (let i = 0; i < 3; i++) blob(M, f, 1.5 + i * 0.35, 0.3, (i - 1) * 0.5, 0.25, 0.3, 0.25, paint('#8a5a3c'), 6, 2); break;
  }
  return 2.5;
}

function well(M, f, st, h) {
  const stone = paint('#9a9484');
  if (st.well === 'shaduf') {
    box(M, f, -0.2, 0.2, 0, 2.4, -0.2, 0.2, EARTH); box(M, f, 1.6, 2.0, 0, 2.4, -0.2, 0.2, EARTH); box(M, f, -0.1, 0.3, 2.4, 2.55, 0, 1.2, TIMBER2);
    box(M, f, -0.2, 0.2, 2.3, 2.7, -0.3, 0.3, TIMBER);
    blob(M, f, 0, 2.3, -0.9, 0.35, 0.3, 0.35, paint('#6b5a44'), 6, 2); cone(M, f, 0, 1.2, 0.28, 0, 0.2, 0.5, 6, paint('#8a5a3c'), true);
    cone(M, f, 1.8, 0, 1.0, 0, 0.9, 0.35, 8, EARTH, true);
  } else {
    cone(M, f, 0, 0, 0.95, 0, 0.9, 0.85, 8, stone, false); cone(M, f, 0, 0, 0.6, 0.84, 0.6, 0.86, 8, paint('#1d2a30', '#1d2a30', 0, 0.1), true);
    box(M, f, -0.06, 0.06, 0.8, 2.2, -1.0, -0.88, TIMBER); box(M, f, -0.06, 0.06, 0.8, 2.2, 0.88, 1.0, TIMBER); box(M, f, -0.1, 0.1, 2.1, 2.25, -1.0, 1.0, TIMBER);
  }
  // the trough beside it
  box(M, f, 2.6, 3.2, 0, 0.55, -1.3, 1.1, stone); box(M, f, 2.7, 3.1, 0.5, 0.56, -1.2, 1.0, paint('#2a3a40', '#2a3a40', 0, 0.1));
  return 3.5;
}

/** A hamlet or a farmstead: houses by hash about (m, o); returns the circles [x, y, z, r, h] to keep out of. */
function settle(M, rd, ri, t, detail, blockers) {
  const ci = Math.floor(t.m / CELL), st = styleAt(rd, t.m);
  const count = t.kind === 'hamlet' ? 3 + Math.floor(hash(ri, ci, 20) * 4) : 1;
  const placed = [];
  for (let k = 0; k < count; k++) {
    for (let tryN = 0; tryN < 6; tryN++) {
      const q = hash(ri, ci, 30 + k * 7 + tryN * 3), q2 = hash(ri, ci, 31 + k * 7 + tryN * 3), q3 = hash(ri, ci, 32 + k * 7 + tryN * 3);
      const dm = t.kind === 'hamlet' ? (q - 0.5) * 44 : (q - 0.5) * 10, dO = t.kind === 'hamlet' ? (q2 - 0.5) * 26 : (q2 - 0.5) * 8;
      if (placed.some((p) => Math.hypot(p[0] - dm, p[1] - dO) < 11)) continue;
      const m = t.m + dm, o = t.o + dO;
      const ax = roadAxes(rd, m, o), u = ax.u;
      if (!valid(u)) continue;
      const hh = (a) => hash(ri, ci, 100 + k * 13 + a);
      const hf = hash(ri, ci, 40 + k), toRoad = -Math.sign(o) * sgn(rd, ax) * Math.PI / 2;
      const f = frameAt(u, (hf < 0.7 ? toRoad : hf < 0.85 ? 0 : Math.PI) + (q3 - 0.5) * 0.5, ax);
      // level ground only (a house on a slope would float or sink)
      const h0 = heightAt(u), hs = [[8, 0], [-8, 0], [0, 8], [0, -8]].map(([a, b]) => Math.abs(heightAt(norm(add(u, scale(add(scale(f.F, a), scale(f.S, b)), 1 / R)))) - h0));
      if (Math.max(...hs) > 1.1) continue;
      const r = house(M, f, st, hh, t.kind === 'farm' && k === 0 ? 1.15 : 1);
      blockers.push(f.P[0], f.P[1], f.P[2], r + 0.3, 3.2);
      placed.push([dm, dO]);
      if (t.kind === 'farm' && k === 0) {
        // outbuilding, a haystack and a tree
        for (const [a, b, kind] of [[9, 3, 'barn'], [-6, 8, 'stack'], [-5, -8, 'tree']]) {
          const u2 = norm(add(u, scale(add(scale(f.F, a), scale(f.S, b)), 1 / R)));
          if (!valid(u2)) continue;
          const g = new Frame(place(u2), f.F, f.S, u2);
          if (kind === 'barn') { box(M, g, -3, 3, -0.15, 2.0, -2.2, 2.2, paint('#8a6f4c')); gable(M, g, -3, 3, -2.2, 2.2, 2.0, 3.4, 0.4, paint(st.house.rc[0]), paint('#8a6f4c')); blockers.push(g.P[0], g.P[1], g.P[2], 3.4, 3.2); }
          else if (kind === 'stack') blob(M, g, 0, 1, 0, 1.4, 1.6, 1.4, paint('#c2a95c', '#b09a55', 1), 6, 3);
          else tree(M, g, st.fields.find((x) => x[0] === 'grove')?.[2] ?? 'broad', (a) => hash(ri, ci, 200 + a));
        }
      }
      break;
    }
  }
}

function dressing(M, rd, ri, t, blockers) {
  const ci = Math.floor(t.m / CELL), st = styleAt(rd, t.m);
  const m = t.m, o = t.o, a2 = roadAxes(rd, m, o), u = a2.u;
  if (!valid(u)) return;
  // facing the road
  const f = frameAt(u, -Math.sign(o) * sgn(rd, a2) * Math.PI / 2, a2);
  const hh = (a) => hash(ri, ci, 300 + a);
  let r = 1;
  if (t.kind === 'marker') r = marker(M, f, st, hh);
  else if (t.kind === 'shrine') r = shrine(M, f, st, hh);
  else if (t.kind === 'well') r = well(M, f, st, hh);
  blockers.push(f.P[0], f.P[1], f.P[2], r * (t.kind === 'marker' ? 0.7 : 1), 2.5);
}

// ---------------------------------------------------------------------------------------------
// fields

function plot(M, rd, ri, m, o, fieldKind, cropKey, st, Lp, Wp, detail, hs, blockers) {
  const ax = roadAxes(rd, m, o), u0 = ax.u, f0 = ax.f, s0 = ax.s;
  const nx = Math.max(2, Math.round(Lp / 4)), nz = Math.max(2, Math.round(Wp / 4));
  const dir = (x, z) => norm([0, 1, 2].map((i) => u0[i] + (f0[i] * x + s0[i] * z) / R));
  const g = [], X = [], Z = [];
  let hi = -1e9, lo = 1e9;
  for (let j = 0; j <= nz; j++) Z.push(-Wp / 2 + (j / nz) * Wp);
  for (let i = 0; i <= nx; i++) X.push(-Lp / 2 + (i / nx) * Lp);
  for (let i = 0; i <= nx; i++) { g.push([]); for (let j = 0; j <= nz; j++) {
    const d = dir(X[i], Z[j]), s = surface(d);
    if (!valid(d, s)) return false;
    g[i].push(s.h); hi = Math.max(hi, s.h); lo = Math.min(lo, s.h);
  } }
  const level = fieldKind === 'paddy' || fieldKind === 'irrigated' || fieldKind === 'terrace';
  if (hi - lo > (fieldKind === 'terrace' ? 1.4 : level ? 0.8 : 3.2)) return false;
  const L0 = level ? (hi + lo) / 2 + 0.2 : hi + 0.12;
  const hAt = (x, z) => {   // the ground's height at local (x, z), bilinear on the grid
    const fx = Math.max(0, Math.min(nx - 1e-6, (x + Lp / 2) / Lp * nx)), fz = Math.max(0, Math.min(nz - 1e-6, (z + Wp / 2) / Wp * nz));
    const i = Math.floor(fx), j = Math.floor(fz), a = fx - i, b = fz - j;
    return g[i][j] * (1 - a) * (1 - b) + g[i + 1][j] * a * (1 - b) + g[i][j + 1] * (1 - a) * b + g[i + 1][j + 1] * a * b;
  };
  const yAt = (x, z) => (level ? L0 : hAt(x, z) + 0.1);
  const P = (x, z, y) => { const d = dir(x, z), r = R + y; return [d[0] * r, d[1] * r, d[2] * r]; };
  const below = (x, z, y) => P(x, z, y - 3);
  // crop stage
  const crop = CROPS[cropKey] ?? CROPS.wheat, stage = crop[Math.floor(hs(1) * crop.length)];
  const top = stage[0], ridge = stage[1], rh = stage[2];
  const stone = fieldKind === 'terrace' || st.edge === 'wall';
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    const pt = detail ? shade(top, (hash(ri, Math.floor(m), i, j) - 0.5) * 0.35) : shade(ridge ?? top, (hash(ri, Math.floor(m), i, j) - 0.5) * 0.4);
    M.quad(P(X[i], Z[j], yAt(X[i], Z[j])), P(X[i + 1], Z[j], yAt(X[i + 1], Z[j])), P(X[i + 1], Z[j + 1], yAt(X[i + 1], Z[j + 1])), P(X[i], Z[j + 1], yAt(X[i], Z[j + 1])), detail || !ridge ? top : pt, below(X[i], Z[j], 0));
    if (detail && !ridge && false) { /* (flooded: no rows) */ }
  }
  // the edge: a bund or a skirt wall about a levelled plot, a hedge or a dry-stone wall about a strip
  const rim = (xa, za, xb, zb, hgt, wid, pt, skirt) => {
    const A = P(xa, za, yAt(xa, za)), B = P(xb, zb, yAt(xb, zb)), up = dir((xa + xb) / 2, (za + zb) / 2);
    const len = Math.hypot(B[0] - A[0], B[1] - A[1], B[2] - A[2]);
    const F = norm([B[0] - A[0], B[1] - A[1], B[2] - A[2]]), S = norm(cross(F, up));
    box(M, new Frame(A, F, S, up), -wid / 2, wid / 2, level && skirt ? -Math.max(0.3, yAt(xa, za) - hAt(xa, za) + 0.3) : -0.25, hgt, 0, len, pt);
  };
  const bund = level ? (fieldKind === 'terrace' ? paint('#8f8a7c') : paint('#7e6c4c')) : null;
  const edge = !level ? st.edge : null;
  for (let s = 0; s < 4; s++) {
    const hor = s < 2, cnt = hor ? nx : nz;
    for (let k = 0; k < cnt; k++) {
      const a = hor ? [X[k], s === 0 ? -Wp / 2 : Wp / 2] : [s === 2 ? -Lp / 2 : Lp / 2, Z[k]], b = hor ? [X[k + 1], a[1]] : [a[0], Z[k + 1]];
      if (bund) rim(a[0], a[1], b[0], b[1], 0.32, fieldKind === 'terrace' ? 0.7 : 0.5, bund, true);
      else if (edge && (s < 2 || hash(ri, Math.floor(m), s, k) < 0.5) && hash(ri, Math.floor(m), 70 + s, k) > 0.12) {
        if (edge === 'hedge') rim(a[0], a[1], b[0], b[1], 1.4, 1.0, paint('#47662f', '#5a4d38', 1), false);
        else rim(a[0], a[1], b[0], b[1], 0.8, 0.5, paint('#9a9585'), false);
      }
    }
  }
  // rows or mounds
  if (detail && fieldKind !== 'grove' && ridge) {
    if (fieldKind === 'milpa') {
      const sp = cropKey === 'maize' ? 1.6 : 2.0;
      for (let x = -Lp / 2 + 1.2; x < Lp / 2 - 0.8; x += sp) for (let z = -Wp / 2 + 1.2; z < Wp / 2 - 0.8; z += sp) {
        const jx = x + (hash(ri, Math.floor(m * 3), Math.floor(x * 7), Math.floor(z * 5)) - 0.5) * 0.5, jz = z + (hash(ri, Math.floor(m * 3), Math.floor(z * 5), 9) - 0.5) * 0.5;
        const d = dir(jx, jz), r0 = R + yAt(jx, jz), F = norm(f0), fr = new Frame([d[0] * r0, d[1] * r0, d[2] * r0], F, s0, d);
        frustum(M, fr, -0.5, 0.5, -0.5, 0.5, -0.05, 0.35, 0.2, 0.2, shade(SOIL, 0.1));
        cone(M, fr, 0, 0, 0.28, 0.3, 0.03, 0.3 + rh, 3, ridge, false);
      }
    } else {
      const sp = fieldKind === 'vine' ? 2.2 : fieldKind === 'paddy' ? 0.9 : 1.3, w = fieldKind === 'vine' ? 0.8 : fieldKind === 'paddy' ? 0.4 : 0.6;
      for (let z = -Wp / 2 + sp * 0.6; z < Wp / 2 - 0.5; z += sp) for (let i = 0; i < nx; i++) {
        const xa = X[i], xb = X[i + 1];
        const q = [[xa, z - w / 2], [xb, z - w / 2], [xb, z + w / 2], [xa, z + w / 2]], ya = yAt(xa, z), yb = yAt(xb, z);
        const A = P(xa, z, ya + rh), B = P(xb, z, yb + rh);
        const l = P(xa, q[0][1], ya), l2 = P(xb, q[0][1], yb), r = P(xa, q[3][1], ya), r2 = P(xb, q[3][1], yb);
        const pt = shade(ridge, hash(ri, Math.floor(m), i, Math.floor(z * 4)) - 0.5);
        const up = P(xa, z, ya - 2);
        M.quad(l, l2, B, A, pt, up); M.quad(r, r2, B, A, pt, up);
      }
    }
  }
  // centre of the field for the kind of things in it
  void blockers;
  return true;
}

function grove(M, rd, ri, m, o, kind, Lp, Wp, hs) {
  const ax = roadAxes(rd, m, o), u0 = ax.u;
  const sp = kind === 'palm' ? 6 : kind === 'agave' ? 3.2 : kind === 'olive' ? 7 : 7.5;
  let k = 0;
  for (let x = -Lp / 2 + sp / 2; x < Lp / 2; x += sp) for (let z = -Wp / 2 + sp / 2; z < Wp / 2; z += sp) {
    k++;
    const jx = x + (hash(ri, Math.floor(m), k, 1) - 0.5) * sp * 0.4, jz = z + (hash(ri, Math.floor(m), k, 2) - 0.5) * sp * 0.4;
    const d = norm([0, 1, 2].map((i) => u0[i] + (ax.f[i] * jx + ax.s[i] * jz) / R));
    if (!valid(d)) continue;
    tree(M, new Frame(place(d), ax.f, ax.s, d), kind, (a) => hash(ri, Math.floor(m), k, 10 + a));
  }
}

const pickField = (st, h) => {
  let tot = 0; for (const f of st.fields) tot += f[1];
  let x = h * tot;
  for (const f of st.fields) { x -= f[1]; if (x <= 0) return f; }
  return st.fields[0];
};

/** Is road distance m (and lateral position o) in the country of fields? How thick (rows deep) at m. */
function depthAt(rd, ri, m) {
  const L = roadLength(rd), [A, B] = rd.ends;
  const da = m - (A.radius + BLEND), db = L - m - (B.radius + BLEND), d = Math.min(da, db);
  const bk = Math.floor(m / 150), patch = hash(ri, bk, 61);
  let near = d < 460 ? 3 - (d / 460) * 1.6 : 0;
  if (patch < 0.28 && d >= 460) near = Math.max(near, 1.2 + patch * 6);
  return near;                       // (rows: 3 → 1.4 near a settlement, up to ~2.9 in a patch, else none)
}

// ---------------------------------------------------------------------------------------------

/** Build the chunk k of road ri: { pos, nrm, col, alt, ses, idx, blockers (x y z r h per circle), tris } or null when empty. detail: 1 rows, mounds and the shadows' worth, 0 plain. */
export function buildChunk(ri, k, detail = 1) {
  const rd = ROADS[ri], L = roadLength(rd), m0 = k * SEG, m1 = Math.min(L, m0 + SEG);
  if (m0 >= L) return null;
  const mc = (m0 + m1) / 2, uc = roadU(rd, mc), M = new Mesh(Math.sign(uc[1]) * sm(0.42, 0.8, Math.abs(uc[1]))), blockers = [];
  const st = styleAt(rd, mc), cr = crossings().filter((c) => c.ri === ri);
  const nearCross = (m, pad) => cr.some((c) => m > c.m0 - pad && m < c.m1 + pad);
  // bridges and fords
  for (const c of cr) if ((c.m0 + c.m1) / 2 >= m0 && (c.m0 + c.m1) / 2 < m1) bridge(M, c, detail);
  // small things of the cells whose things fall in this chunk
  for (let ci = Math.floor(m0 / CELL) - 1; ci <= Math.floor(m1 / CELL) + 1; ci++) {
    for (const t of things(ri, ci)) {
      if (t.m < m0 || t.m >= m1 || nearCross(t.m, 24)) continue;
      if (t.kind === 'hamlet' || t.kind === 'farm') settle(M, rd, ri, t, detail, blockers); else dressing(M, rd, ri, t, blockers);
    }
  }
  // the fields: plots in bands either side, by the road's cells of PL metres
  const PL = 24;
  for (let pi = Math.floor(m0 / PL); pi * PL < m1; pi++) {
    const m = pi * PL + PL / 2;
    if (m < m0 || m >= m1 || nearCross(m, 40)) continue;
    const depth = depthAt(rd, ri, m);
    if (depth <= 0) continue;
    const sty = styleAt(rd, m);
    for (const sd of [-1, 1]) {
      let o = 9;
      for (let row = 0; row < 3 && row < depth; row++) {
        const hs = (a) => hash(ri, pi, sd * 7 + row * 3 + 1000, a), Wp = 14 + hs(2) * 6, Lp = PL - 1.5 - hs(3) * 3;
        const [kind, , crop] = pickField(sty, hs(4));
        const off = sd * (o + Wp / 2), cut = hs(5) > Math.min(0.92, 0.5 + 0.17 * (depth - row));
        o += Wp + 2.2;
        if (cut) continue;
        // clear of hamlets and farmsteads
        let hit = false;
        for (let ci = Math.floor((m - 40) / CELL); ci <= Math.floor((m + 40) / CELL); ci++) for (const t of things(ri, ci)) {
          if ((t.kind === 'hamlet' || t.kind === 'farm') && Math.abs(t.m - m) < t.r + Lp / 2 + 6 && Math.abs(t.o - off) < t.r + Wp / 2 + 4) hit = true;
        }
        if (hit) continue;
        if (kind === 'grove') grove(M, rd, ri, m, off, crop, Lp, Wp, hs);
        else if (!plot(M, rd, ri, m, off, kind, crop, sty, Lp, Wp, detail, hs, blockers)) continue;
      }
    }
  }
  if (!M.idx.length && !blockers.length) return null;
  return {
    pos: new Float32Array(M.pos), nrm: new Float32Array(M.nrm), col: new Float32Array(M.col), alt: new Float32Array(M.alt), ses: new Float32Array(M.ses),
    idx: M.n > 65535 ? new Uint32Array(M.idx) : new Uint32Array(M.idx), blockers: new Float32Array(blockers), tris: M.idx.length / 3,
  };
}

/** The chunks of every road: [{ ri, k, c (centre direction), key }] — for choosing those near the visitor. */
export function chunkList() {
  const out = [];
  ROADS.forEach((rd, ri) => {
    const L = roadLength(rd);
    for (let k = 0; k * SEG < L; k++) out.push({ ri, k, c: roadU(rd, Math.min(L, k * SEG + SEG / 2)), key: `${ri}/${k}` });
  });
  return out;
}
