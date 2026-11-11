// Mughal Agra about 1650 — the moving life of the Taj Ganj and the forecourt (docs/settlements/mughal-agra.md §12): men
// in the jama (a long robe tied at the chest) with a turban, merchants with a shoulder cloth, craftsmen and porters
// in a short tunic and a wrapped cloth, women in long robes with the head veiled, water carriers with a pot,
// walking the bazaar streets, the town's streets and the forecourt. Data for the engine's movers
// (src/engine/movers.js); format as Madurai's (src/settlements/madurai/movers.js). Boats under sail and pole on the
// Yamuna's open lane; others stand tied at the bank (life.js). The coordinator registers it in src/engine/movers-sites.js.

import { STREETS, FORECOURT, RADIUS, RIVER_Z } from './layout.js';
import { LEVEL } from './ground.js';
import { STYLES } from '../../core/build.js';
import '../../objects/index.js';
import { boatFloat } from '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure, factor, flat, SLOT } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 52, night: 5, rain: 0.7, reach: 150, spawnMin: 26, far: 42 },
  boats: { count: 4, reach: 260, spawnMin: 60, far: 100, speed: [0.8, 1.3], bridgeSpeed: 0.7 },
  water: LEVEL.water,
};

/** The ways: the streets of the town (the bazaar streets busy), the forecourt, the bazaar streets inside its gates. */
export function walkways() {
  const R = RADIUS - 28, lim = (v) => Math.max(-R, Math.min(R, v)), rects = [];
  for (const s of STREETS) {
    const [x0, z0, x1, z1] = s.rect, w = Math.min(x1 - x0, z1 - z0);
    rects.push({ r: [lim(x0 + 1), lim(z0 + 1), lim(x1 - 1), lim(z1 - 1)], weight: s.bazaar ? 2.2 : 0.8, market: s.bazaar ? 1 : 0.2, kind: w > 6 ? 'street' : 'lane' });
  }
  const [fx0, fz0, fx1, fz1] = FORECOURT;
  rects.push({ r: [fx0 + 3, fz0 + 8, fx1 - 3, fz1 - 3], weight: 1.4, market: 0.3, kind: 'street' });
  for (const [a, b] of [[fx0 + 5, -50], [50, fx1 - 5]]) rects.push({ r: [a, 196.5, b, 203.5], weight: 1.8, market: 1, kind: 'lane' });
  return { rects: rects.filter(({ r }) => r[2] > r[0] && r[3] > r[1]), links: [], clip: RADIUS - 12 };
}
/** The Yamuna below the terrace: a lane of open water along the town's north edge, clear of the boats moored at the bank. */
export function waterways() { return { rects: [{ r: [-180, RIVER_Z - 36, 180, RIVER_Z - 12], weight: 1 }], bridges: [], clip: RADIUS - 12 }; }
/** The boats standing in the river (life.js) as rectangles the moving boats keep clear of. */
export async function staticBoats() {
  const { life } = await import('./life.js');
  const out = [];
  for (const e of life()) {
    if (e.t !== 'boat') continue;
    const L = e.len ?? 8, r = e.rot ?? 0;
    out.push({ c: e.at, u: [Math.sin(r), Math.cos(r)], hl: L / 2 + 1, hw: 2.2 });
  }
  return out;
}

const CL = { white: 'cloth_white', red: 'cloth_red', green: 'cloth_green', indigo: 'cloth_indigo', ochre: 'cloth_ochre', maroon: 'cloth_maroon', blue: 'cloth_blue', brown: 'cloth_brown' };
export const WALKERS = [
  { id: 'jama', weight: 1.6, market: 1.2, el: { dress: 'robe', hair: 'short', hat: 'turban', over: 'sash', beard: true, arms: 'hang' },
    c1: [CL.white, CL.white, CL.ochre, CL.indigo], c2: [CL.red, CL.green, CL.ochre, CL.white], c3: [CL.white, CL.red, CL.ochre], speed: [1.0, 1.3], stride: 1.4 },
  { id: 'merchant', weight: 1.0, market: 1.8, el: { dress: 'robe', hair: 'short', hat: 'turban', over: 'shawl', beard: true, arms: 'hang' },
    c1: [CL.white, CL.ochre, CL.blue, CL.green], c2: [CL.white, CL.maroon], c3: [CL.maroon, CL.red, CL.ochre], speed: [0.95, 1.2], stride: 1.4 },
  { id: 'craftsman', weight: 0.9, market: 1.0, el: { dress: 'wrap', top: 'bare', hair: 'short', hat: 'turban', over: 'sash', arms: 'hang' },
    c1: [CL.white, CL.brown, CL.ochre], c2: [CL.white, CL.ochre], c3: [CL.white, CL.red], speed: [1.05, 1.3], stride: 1.4 },
  { id: 'woman', weight: 1.6, market: 1.4, el: { dress: 'robe', hair: 'long', hat: 'veil', arms: 'hang' }, swing: 0.7,
    c1: [CL.red, CL.green, CL.ochre, CL.indigo, CL.white, CL.maroon], c2: [CL.ochre, CL.white, CL.red], c3: [CL.ochre, CL.red], speed: [0.9, 1.15], stride: 1.25, h: [0.9, 0.97] },
  { id: 'water', weight: 0.7, market: 0.4, el: { dress: 'robe', hair: 'long', hat: 'veil', carry: 'pot', arms: 'hang' }, swing: 0.7,
    c1: [CL.green, CL.ochre, CL.red], c2: [CL.white], c3: [CL.white], speed: [0.85, 1.05], stride: 1.25, h: [0.9, 0.97] },
  { id: 'porter', weight: 0.9, market: 1.1, el: { dress: 'wrap', top: 'bare', hair: 'short', hat: 'turban', carry: 'basket', arms: 'hang' },
    c1: [CL.white, CL.brown], c2: [CL.white], c3: [CL.red, CL.white, CL.ochre], speed: [1.0, 1.25], stride: 1.3 },
];
export const CREW = {
  boatman: { el: { dress: 'wrap', top: 'bare', hair: 'short', arms: 'pull' }, c1: [CL.white], c2: [CL.white], c3: [CL.white] },
  passenger: { el: { dress: 'robe', hair: 'short', hat: 'turban', pose: 'cross' }, c1: [CL.white], c2: [CL.white], c3: [CL.white] },
};
export function walkerShapes(sb) {
  for (const [id, k] of [...WALKERS.map((w) => [w.id, w]), ['boatman', CREW.boatman], ['passenger', CREW.passenger]]) for (const far of [false, true]) {
    addFigure(sb, sb.variant(`${id}|dry|${far ? 'far' : 'near'}`), figure, { ...k.el }, { far });
  }
}
// ── what floats ──
/** The Yamuna's country boat under its square sail (variant `covered`: a seated passenger under the awning) and loaded (`cargo`: sacks and jars), and the steering sweep. The bow toward −z. */
export const BOAT = { L: 11, pin: [0.3, 0.55, 4.3], deck: -0.3, stern: 3.7, passenger: [0, -0.2, 0.9], hull: [1.8, 5.9] };
const beam = (out, p, q, r, n = 6) => {
  const d = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], l = Math.hypot(...d) || 1, u = d.map((v) => v / l), up = Math.abs(u[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const cr = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], nm = (v) => { const m = Math.hypot(...v) || 1; return v.map((x) => x / m); };
  const t1 = nm(cr(u, up)), t2 = cr(u, t1), ring = (c) => Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2; return [0, 1, 2].map((i) => c[i] + (t1[i] * Math.cos(a) + t2[i] * Math.sin(a)) * r); });
  const A = ring(p), B = ring(q);
  for (let k = 0; k < n; k++) { const k1 = (k + 1) % n; out.push(...A[k], ...A[k1], ...B[k1], ...A[k], ...B[k1], ...B[k]); }
};
export function boatShapes(sb) {
  const grab = (fn, el) => { const got = []; fn(el, { bag: { add: (m, g) => got.push([m, g]) }, col: { circle() {}, box() {}, rect() {}, segment() {}, floor() {}, ramp() {} } }); return got; };
  const group = (m) => (/cloth|wicker|sacking|reed_mat|hide|thatch|rope/.test(m) ? 'fibre' : 'wood');
  const life = STYLES.life.elements, y = boatFloat('barge');
  for (const kind of ['covered', 'cargo']) for (const far of [false, true]) {
    const v = sb.variant(`${kind}|${far ? 'far' : 'near'}`);
    for (const [m, g] of grab(life.boat, { t: 'boat', kind: 'barge', at: [0, 0], y, rot: 0, len: BOAT.L, seed: 5 })) sb.addPiece(v, group(m), g, { slot: SLOT.none, col: factor(group(m), m) });
    // the mast and the square sail on its yard (the boat under way), the rope to the stern
    const w = [], mz = -0.9;
    beam(w, [0, -0.4, mz], [0, 6.0, mz], 0.1, 6); beam(w, [-2.3, 5.4, mz], [2.3, 5.4, mz], 0.05, 5); beam(w, [-2.0, 2.0, mz + 0.05], [2.0, 2.0, mz + 0.05], 0.04, 5);
    sb.addPiece(v, 'wood', flat(w), { slot: SLOT.none, col: factor('wood', 'timber', 0.9) });
    const sail = [], X = 2.1, Y0 = 2.0, Y1 = 5.4, bz = (x, yy) => mz + 0.12 + 0.35 * Math.sin(Math.PI * (x / X + 1) / 2) * Math.sin(Math.PI * (yy - Y0) / (Y1 - Y0));
    const N = 6, Q = (i, j) => { const x = -X + 2 * X * i / N, yy = Y0 + (Y1 - Y0) * j / N; return [x, yy, bz(x, yy)]; };
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const p = Q(i, j), q = Q(i + 1, j), r = Q(i + 1, j + 1), s = Q(i, j + 1); sail.push(...p, ...q, ...r, ...p, ...r, ...s, ...p, ...r, ...q, ...p, ...s, ...r); }
    sb.addPiece(v, 'fibre', flat(sail), { slot: SLOT.c3, col: factor('fibre', 'cloth_white') });
    if (kind === 'cargo') {
      const put = (fn, el) => { for (const [m, g] of grab(fn, el)) sb.addPiece(v, /wicker|sacking/.test(m) ? 'fibre' : 'wood', g, { slot: SLOT.none, col: factor(/wicker|sacking/.test(m) ? 'fibre' : 'wood', m) }); };
      put(life.sacks, { t: 'sacks', at: [0, 1.4], y: -0.3, rot: 0, n: 6, seed: 31 });
      put(life.pot, { t: 'pot', kind: 'water_pot', n: 4, at: [0.1, -2.2], y: -0.3, seed: 32 });
      put(life.basket, { t: 'basket', at: [-0.2, -3.8], y: -0.3, rot: 0, n: 2, seed: 33 });
    }
  }
  // the steering sweep: a long oar over the stern, its blade trailing aft into the water
  const v = sb.variant('oar'), w = [], bl = [];
  const H = [-0.2, 0.55, -0.8], K = [0, 0.02, 0.2], B0 = [0, -0.5, 2.0], B1 = [0, -0.9, 3.0];
  beam(w, H, [0, 0.07, -0.02], 0.03, 6); beam(w, [0, 0.07, -0.02], K, 0.036, 6); beam(w, K, B0, 0.034, 6);
  const hw = 0.12, th = 0.02, d = [B1[0] - B0[0], B1[1] - B0[1], B1[2] - B0[2]], dl = Math.hypot(...d), du = d.map((x) => x / dl), side = [1, 0, 0];
  const upv = [du[1] * side[2] - du[2] * side[1], du[2] * side[0] - du[0] * side[2], du[0] * side[1] - du[1] * side[0]];
  const C = (p, s, t) => [0, 1, 2].map((i) => p[i] + side[i] * s + upv[i] * t);
  const q = [[C(B0, -th, -hw * 0.5), C(B0, th, -hw * 0.5), C(B0, th, hw * 0.5), C(B0, -th, hw * 0.5)], [C(B1, -th * 0.6, -hw), C(B1, th * 0.6, -hw), C(B1, th * 0.6, hw), C(B1, -th * 0.6, hw)]];
  for (let k = 0; k < 4; k++) { const k1 = (k + 1) % 4; bl.push(...q[0][k], ...q[1][k], ...q[1][k1], ...q[0][k], ...q[1][k1], ...q[0][k1]); }
  bl.push(...q[1][0], ...q[1][2], ...q[1][1], ...q[1][0], ...q[1][3], ...q[1][2]);
  sb.addPiece(v, 'wood', flat(w), { slot: SLOT.c1, col: factor('wood', 'timber', 0.9) });
  sb.addPiece(v, 'wood', flat(bl), { slot: SLOT.c1, col: factor('wood', 'timber', 0.75) });
}
