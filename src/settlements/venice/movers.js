// Venice about 1500 — the moving life (docs/settlements/venice.md §10): people on the piazza, the Piazzetta, the Merceria and the
// streets between the houses, over the Rialto and the little bridges; gondolas rowed standing and cargo boats on the basin, the
// Grand Canal's northern reach and the canals that run straight enough. Data for the engine's movers (src/engine/movers.js),
// read in its worker; the format is Suzhou's (src/settlements/ming-suzhou/movers.js).

import { SEA, RADIUS, PIAZZA, PIAZZETTA, MERCERIA, MARKET, RIALTO, BASIN_Z, bands, bridges } from './layout.js';
import { STYLES } from '../../core/build.js';
import '../../styles/venetian/index.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure, factor, flat, SLOT } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 38, night: 6, rain: 0.7, reach: 150, spawnMin: 28, far: 42 },
  boats: { count: 7, reach: 250, spawnMin: 60, far: 95, speed: [0.9, 1.35], bridgeSpeed: 0.7 },
  water: SEA,
};

// ── the ways ─────────────────────────────────────────────────────────────────
/** The piazza, the Piazzetta, the Merceria, the streets between the houses, the market and the Rialto; the bridges as links over the canals. */
export function walkways() {
  const rects = [
    { r: [PIAZZA[0] + 3, PIAZZA[1] + 3, PIAZZA[2] - 3, PIAZZA[3] - 3], weight: 3.2, market: 0.8, kind: 'street' },
    { r: [PIAZZETTA[0] + 4, PIAZZETTA[1] + 2, PIAZZETTA[2] - 4, BASIN_Z - 3], weight: 2.6, market: 0.5, kind: 'street' },
    { r: [MERCERIA[0] + 2, MERCERIA[1], MERCERIA[2] - 2, MERCERIA[3] - 8], weight: 2.2, market: 2.2, kind: 'street' },
    { r: [8, -60, 12.5, -36], weight: 2.2, market: 2.2, kind: 'lane' },
    { r: [MARKET[0] + 3, MARKET[1] + 3, MARKET[2] - 3, MARKET[3] - 3], weight: 2.4, market: 3, kind: 'street' },
  ];
  for (const b of bands()) for (const [z0, z1] of b.runs) rects.push({ r: [b.x0 + 0.5, z0, b.x1 - 0.5, z1], weight: 1.1, market: 0.6, kind: 'street' });
  const links = [
    { a: [21.5, 22], b: [30, 38], w: 2.4, kind: 'lane', weight: 1.5 },                                                      // piazza to Piazzetta, past the campanile
    { a: [RIALTO.x - RIALTO.span / 2 - 3, RIALTO.z], b: [RIALTO.x + RIALTO.span / 2 + 3, RIALTO.z], w: 1.5, kind: 'bridge', weight: 3 },
    { a: [MARKET[2] - 4, RIALTO.z], b: [RIALTO.x - RIALTO.span / 2 - 3, RIALTO.z], w: 1.5, kind: 'lane', weight: 2.5 },
  ];
  for (const b of bridges()) {
    if (b.via !== 'band') continue;
    links.push({ a: [b.c[0], b.c[1] - b.f[0] - 5], b: [b.c[0], b.c[1] + b.f[1] + 5], w: b.w / 2, kind: 'bridge', weight: 1.2 });
  }
  return { rects, links, clip: RADIUS - 70 };
}

/** The water the boats keep to: the basin before the Molo, the Grand Canal's straight reach by the Rialto, the canals that run along an axis. */
export function waterways() {
  const grand = (z0, z1) => { const zm = (z0 + z1) / 2, x = -190 - (40 - zm) / 12; return { r: [x - 12, z0, x + 12, z1], weight: 2 }; };
  const rects = [
    { r: [-200, BASIN_Z + 16, 215, BASIN_Z + 36], weight: 2 },
    grand(-80, -20), grand(-20, 40),
    { r: [-190, -122.5, -62, -117.5], weight: 1 },
  ];
  for (let z = -170; z < 100; z += 30) { const zm = z + 15, x = -40 + (zm + 60) / 185 * 10; rects.push({ r: [x - 3.2, z, x + 3.2, z + 30], weight: 1 }); }
  const out = rects.map((q) => ({ r: q.r, weight: q.weight, horiz: q.r[2] - q.r[0] > q.r[3] - q.r[1] }));
  const br = [{ at: [RIALTO.x, RIALTO.z], half: 4.4 }];
  for (const b of bridges()) if (Math.abs(b.c[1] + 120) < 8 || (b.c[0] > -45 && b.c[0] < -26)) br.push({ at: b.c, half: b.w / 2 + 0.5 });
  return { rects: out, bridges: br, clip: RADIUS - 30 };
}

/** The boats standing in the water (the gondolas at the Molo and at the palazzi's gates, the traghetto's) as rectangles the moving ones keep clear of. */
export async function staticBoats() {
  const { town } = await import('./town.js');
  const out = [];
  for (const p of await town()) for (const e of p.elements) {
    if (e.t === 'gondola') { const h = e.yaw ?? 0; out.push({ c: e.at, u: [Math.cos(h), Math.sin(h)], hl: 5.6, hw: 0.8 }); }
    else if (e.t === 'boat') { const L = e.len ?? 10.8, r = e.rot ?? 0; out.push({ c: e.at, u: [Math.sin(r), Math.cos(r)], hl: L / 2 + 0.4, hw: 0.9 }); }
  }
  return out;
}

// ── who walks ────────────────────────────────────────────────────────────────
// After Gentile Bellini's and Carpaccio's pictures of the 1490s: the patricians in the long black gown with wide sleeves and the
// round cap, citizens in dark gowns and berets, the artisans and boatmen in doublet and parti-coloured hose, women in long gowns with
// a shawl or veil, friars, porters with sacks, merchants from the Levant in turbans.
const CL = { black: 'cloth_black', brown: 'cloth_brown', red: 'cloth_red', indigo: 'cloth_indigo', white: 'cloth_white', ochre: 'cloth_ochre', green: 'cloth_green', grey: 'cloth_grey', maroon: 'cloth_maroon', blue: 'cloth_blue' };
export const WALKERS = [
  { id: 'patrician', weight: 0.9, market: 0.8, el: { dress: 'robe', hair: 'short', hat: 'cap', over: 'cape', arms: 'hang', legs: 'hose' },
    c1: [CL.black, CL.black, CL.maroon, CL.indigo], c2: [CL.black, CL.red], c3: [CL.black, CL.maroon], speed: [0.95, 1.2], stride: 1.4 },
  { id: 'citizen', weight: 1.3, market: 1.4, el: { dress: 'robe', hair: 'short', hat: 'cap', over: 'sash', arms: 'hang', legs: 'hose' },
    c1: [CL.black, CL.brown, CL.indigo, CL.grey, CL.green], c2: [CL.black, CL.brown], c3: [CL.red, CL.black, CL.brown], speed: [1.05, 1.3], stride: 1.45 },
  { id: 'levantine', weight: 0.55, market: 2.0, el: { dress: 'robe', hair: 'short', hat: 'turban', over: 'sash', arms: 'hang', beard: true },
    c1: [CL.ochre, CL.green, CL.white, CL.red, CL.blue], c2: [CL.white, CL.ochre], c3: [CL.white, CL.ochre], speed: [0.95, 1.2], stride: 1.4 },
  { id: 'woman', weight: 1.2, market: 1.5, el: { dress: 'robe', hair: 'bun', hat: 'veil', over: 'shawl', arms: 'hang' }, swing: 0.7,
    c1: [CL.red, CL.indigo, CL.green, CL.maroon, CL.ochre, CL.brown], c2: [CL.white, CL.black], c3: [CL.white, CL.grey], speed: [0.95, 1.2], stride: 1.25, h: [0.9, 0.97] },
  { id: 'artisan', weight: 1.4, market: 1.0, el: { dress: 'tunic', hair: 'short', hat: 'cap', over: 'belt', legs: 'hose', arms: 'hang' },
    c1: [CL.brown, CL.white, CL.ochre, CL.grey, CL.indigo], c2: [CL.red, CL.blue, CL.black, CL.white, CL.green], c3: [CL.red, CL.brown, CL.black], speed: [1.1, 1.4], stride: 1.4 },
  { id: 'porter', weight: 0.8, market: 1.6, el: { dress: 'tunic', hair: 'short', hat: 'cap', carry: 'sack', legs: 'hose' },
    c1: [CL.brown, CL.grey, CL.white], c2: [CL.brown, CL.black], c3: [CL.brown, CL.red], speed: [0.95, 1.2], stride: 1.15 },
  { id: 'friar', weight: 0.35, market: 0.4, el: { dress: 'robe', hair: 'shaven', over: 'sash', arms: 'hang' },
    c1: [CL.brown, CL.black, CL.white], c2: [CL.brown, CL.black], c3: [CL.black], speed: [0.9, 1.1], stride: 1.3 },
];
/** The gondolier at his oar on the stern, and the passenger under the felze. */
export const CREW = {
  boatman: { el: { dress: 'tunic', hair: 'short', hat: 'cap', legs: 'hose', over: 'belt', arms: 'pull' }, c1: [CL.white, CL.red, CL.indigo], c2: [CL.red, CL.blue, CL.black], c3: [CL.red, CL.black] },
  passenger: { el: { dress: 'robe', hair: 'short', hat: 'cap', over: 'cape', pose: 'sit_ground', legs: 'hose' }, c1: [CL.black, CL.maroon, CL.indigo, CL.red], c2: [CL.black], c3: [CL.black, CL.red] },
};

export function walkerShapes(sb) {
  for (const [id, k] of [...WALKERS.map((w) => [w.id, w]), ['boatman', CREW.boatman], ['passenger', CREW.passenger]]) for (const far of [false, true]) {
    addFigure(sb, sb.variant(`${id}|dry|${far ? 'far' : 'near'}`), figure, { ...k.el }, { far });
  }
}

// ── what floats ──────────────────────────────────────────────────────────────
/**
 * The gondola (with its felze, the cabin of dark cloth: variant `covered`) and the cargo boat (a broad open boat with sacks, barrels and
 * crates: `cargo`), near and far, and the oar. Built at the gondola's 10.8 m, the bow toward −z, the waterline at y 0; the gondolier
 * stands on the stern (z +4.2) at the forcola, the oar swinging on it.
 */
export const BOAT = { L: 10.8, pin: [0.55, 1.0, 4.1], deck: 0.38, stern: 4.1, passenger: [0, 0.22, 0.4], hull: [0.95, 5.5] };
const beam = (out, p, q, r, n = 6) => {
  const d = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], l = Math.hypot(...d) || 1, u = d.map((v) => v / l), up = Math.abs(u[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const cr = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], nm = (v) => { const m = Math.hypot(...v) || 1; return v.map((x) => x / m); };
  const t1 = nm(cr(u, up)), t2 = cr(u, t1), ring = (c) => Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2; return [0, 1, 2].map((i) => c[i] + (t1[i] * Math.cos(a) + t2[i] * Math.sin(a)) * r); });
  const A = ring(p), B = ring(q);
  for (let k = 0; k < n; k++) { const k1 = (k + 1) % n; out.push(...A[k], ...A[k1], ...B[k1], ...A[k], ...B[k1], ...B[k]); }
};
export function boatShapes(sb) {
  const grab = (fn, el, ctx = {}) => { const got = []; fn(el, { bag: { add: (m, g) => got.push([m, g]) }, col: { circle() {}, box() {}, rect() {}, segment() {}, floor() {}, ramp() {} }, ...ctx }); return got; };
  const turn = (g) => { g.rotateY(Math.PI / 2); return g; };                                  // the gondola builds along +x, the bow +x → bow toward −z
  const group = (m) => (/cloth|wicker|sacking/.test(m) ? 'fibre' : 'wood');
  for (const kind of ['covered', 'cargo']) for (const far of [false, true]) {
    const v = sb.variant(`${kind}|${far ? 'far' : 'near'}`);
    if (kind === 'covered') {
      for (const [m, g] of grab(STYLES.venetian.elements.gondola, { t: 'gondola', at: [0, 0], yaw: 0, y: 0, felze: true })) { if (far && m === 'iron') continue; sb.addPiece(v, group(m), turn(g), { col: factor(group(m), m) }); }
    } else {
      for (const [m, g] of grab(STYLES.venetian.elements.gondola, { t: 'gondola', at: [0, 0], yaw: 0, y: 0, felze: false, len: 9 })) { if (far && m === 'iron') continue; sb.addPiece(v, group(m), turn(g), { col: factor(group(m), m === 'lacquer_black' ? 'wood_dark' : m) }); }
      const life = STYLES.life.elements, put = (fn, el) => { for (const [m, g] of grab(fn, el)) if (!far || m !== 'hide_tan') sb.addPiece(v, /wicker|sacking/.test(m) ? 'fibre' : 'wood', g, { slot: SLOT.none, col: factor(/wicker|sacking/.test(m) ? 'fibre' : 'wood', m) }); };
      put(life.sacks, { t: 'sacks', at: [0, -1.2], y: 0.1, rot: 0, n: 5, seed: 21 });
      put(life.barrel, { t: 'barrel', at: [0.2, 0.3], y: 0.1, rot: 0, seed: 22 });
      put(life.crates, { t: 'crates', at: [-0.1, 1.4], y: 0.1, rot: 0.3, seed: 23 });
    }
  }
  // the remo: its loom on the forcola, the handle forward to the gondolier's hands, the broad blade running aft and down into the water
  const v = sb.variant('oar'), w = [], bl = [];
  const H = [-0.3, 1.1, -1.0], K = [0, 0.05, 0.1], B0 = [0.1, -0.5, 2.6], B1 = [0.2, -0.9, 3.7];
  beam(w, H, [0, 0.12, -0.05], 0.025, 6); beam(w, [0, 0.12, -0.05], K, 0.03, 6); beam(w, K, B0, 0.028, 6);
  const hw = 0.08, th = 0.014, d = [B1[0] - B0[0], B1[1] - B0[1], B1[2] - B0[2]], dl = Math.hypot(...d), du = d.map((x) => x / dl), side = [1, 0, 0], upv = [du[1] * side[2] - du[2] * side[1], du[2] * side[0] - du[0] * side[2], du[0] * side[1] - du[1] * side[0]];
  const C = (p, s, t) => [0, 1, 2].map((i) => p[i] + side[i] * s + upv[i] * t);
  const q = [[C(B0, -th, -hw * 0.5), C(B0, th, -hw * 0.5), C(B0, th, hw * 0.5), C(B0, -th, hw * 0.5)], [C(B1, -th * 0.6, -hw), C(B1, th * 0.6, -hw), C(B1, th * 0.6, hw), C(B1, -th * 0.6, hw)]];
  for (let k = 0; k < 4; k++) { const k1 = (k + 1) % 4; bl.push(...q[0][k], ...q[1][k], ...q[1][k1], ...q[0][k], ...q[1][k1], ...q[0][k1]); }
  bl.push(...q[1][0], ...q[1][2], ...q[1][1], ...q[1][0], ...q[1][3], ...q[1][2]);
  sb.addPiece(v, 'wood', flat(w), { slot: SLOT.c1, col: factor('wood', 'wood_dark', 1.2) });
  sb.addPiece(v, 'wood', flat(bl), { slot: SLOT.c1, col: factor('wood', 'wood_dark', 1.0) });
}
