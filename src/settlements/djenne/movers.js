// Djenné — the moving life (docs/settlements/djenne.md §14): people in the lanes between the blocks, round the
// mosque's square and in the market's aisles; pirogues poled along the channel of the Bani round the island.
// Data for the engine's movers (src/engine/movers.js, worker src/engine/movers-worker.js), in the format of Suzhou's:
// the ways (from layout.js and the market of town.js), who walks and what floats, the boats already standing at
// the landing (town.js), which the moving ones keep clear of.

import { RADIUS, ISLAND, MARKET, MOSQUE, LEVEL, shore, lanes } from './layout.js';
import { STYLES } from '../../core/build.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure, factor, flat, bounds, SLOT, LIMB } from '../../engine/movers-kit.js';
import { boatFloat } from '../../objects/index.js';

// ── how many, how fast ───────────────────────────────────────────────────────
export const PARAMS = {
  walkers: { day: 56, night: 4, rain: 0.5, reach: 150, spawnMin: 24, far: 42 },
  boats: { count: 8, reach: 260, spawnMin: 60, far: 95, speed: [0.7, 1.1], bridgeSpeed: 0.6 },
  water: LEVEL.water,
};

// ── the ways on foot ─────────────────────────────────────────────────────────
const rect = (x0, z0, x1, z1, o = {}) => ({ r: [x0, z0, x1, z1], weight: 1, market: 0, kind: 'street', ...o });
const ringR = (a) => ISLAND + 14 * Math.sin(a * 3 + 1) + 8 * Math.sin(a * 7 + 2);
/**
 * The lanes between the blocks (layout.js lanes()), the ring of open ground round the mosque's platform, the market's
 * aisles and its two cross lanes (between the rows of stalls and the sellers on their mats, town.js market()), and the path
 * along the bank at the landing with the lane that comes down to it.
 */
export function walkways() {
  const rects = [], links = [];
  for (const l of lanes()) rects.push({ r: l.r, weight: 0.8, market: 0, kind: 'lane' });
  // the ring round the platform (±37.5 m): the west, north and south sides; the east side is the market
  rects.push(rect(-56, -55, 56, -40, { weight: 1.5 }), rect(-56, 40, 56, 55, { weight: 1.5 }), rect(-56, -55, -40, 55, { weight: 1.5 }));
  // the market: the aisles between a row of stalls and the next row of mats, the kola sellers' lane, the two cross lanes
  for (const x of [46.5, 55.5, 69.5, 83.5, 97.5]) rects.push(rect(x - 1, MARKET[1] + 2.5, x + 1, MARKET[3] - 2.5, { weight: 3, market: 1 }));
  rects.push(rect(40, -43.5, 112, -41.5, { weight: 2.4, market: 1 }), rect(40, 42.5, 112, 44.5, { weight: 2.4, market: 1 }));
  rects.push(rect(MARKET[2] - 1, -43.5, MARKET[2] + 18, -41.5, { weight: 1 }));
  // the landing: the path along the bank (south, toward the Bani) and the lane that meets it
  const zb = ringR(Math.PI / 2) - 4.4;
  rects.push(rect(-36, zb - 1.2, 36, zb + 1.2, { weight: 1.6, kind: 'lane' }), rect(-7.25, zb - 22, -5.25, zb, { weight: 1.6, kind: 'lane' }));
  return { rects, links, clip: RADIUS - 24 };
}

// ── the channel ──────────────────────────────────────────────────────────────
/**
 * The channel of the Bani round the island: its middle line (the shore's distance 23 m, in the band of water 8–38) as a
 * staircase of thin rectangles, one every 5°, each pair joined by a corner chosen to keep nearest the ring.
 */
export function waterways() {
  const N = 72, P = [];
  for (let k = 0; k < N; k++) { const a = k / N * Math.PI * 2, r = ringR(a) + 23; P.push([Math.cos(a) * r, Math.sin(a) * r]); }
  const rects = [], w = 2.5, mid = (p) => Math.hypot(p[0], p[1]);
  // (a leg shorter than 6 m is dropped: the next point is moved onto the line, so that every rectangle is plainly long or tall)
  const Q = [P[0]];
  for (let k = 1; k <= N; k++) {
    const p = Q[Q.length - 1], q = k === N ? P[0].slice() : P[k].slice();
    if (Math.abs(q[0] - p[0]) < 6) q[0] = p[0]; if (Math.abs(q[1] - p[1]) < 6) q[1] = p[1];
    if (q[0] === p[0] && q[1] === p[1] && k < N) continue;
    Q.push(q);
  }
  const seg = (p, q) => { if (Math.hypot(q[0] - p[0], q[1] - p[1]) < 0.5) return; const x0 = Math.min(p[0], q[0]), x1 = Math.max(p[0], q[0]), z0 = Math.min(p[1], q[1]), z1 = Math.max(p[1], q[1]); rects.push({ r: x1 - x0 > z1 - z0 ? [x0, z0 - w, x1, z1 + w] : [x0 - w, z0, x1 + w, z1], weight: 1 }); };
  for (let k = 0; k + 1 < Q.length; k++) {
    const p = Q[k], q = Q[k + 1], rm = (mid(p) + mid(q)) / 2, c1 = [q[0], p[1]], c2 = [p[0], q[1]];
    const c = Math.abs(mid(c1) - rm) < Math.abs(mid(c2) - rm) ? c1 : c2;
    seg(p, c); seg(c, q);
  }
  return { rects, bridges: [], clip: ISLAND + 60 };
}
/** The boats standing at the landing (town.js: moored along the bank, two poled out) as hulls { c, u, hl, hw } the moving ones keep clear of. */
export async function staticBoats() {
  const { town } = await import('./town.js');
  const out = [];
  for (const p of await town()) for (const e of p.elements) {
    if (e.t !== 'boat') continue;
    const u = [Math.sin(e.rot ?? 0), Math.cos(e.rot ?? 0)], L = e.len ?? 8, B = 0.8 * L / 6;
    out.push({ c: e.at, u, hl: L / 2 + 0.8, hw: B / 2 + 0.35 });
  }
  return out;
}

// ── who walks ────────────────────────────────────────────────────────────────
// After the dossier (§14): men in the boubou, the wide robe, white or indigo, with the skullcap or a turban; the
// marabout in white with a turban and his staff; women in the wrapped cloth (pagne) in indigo, ochre and red, the
// head tied in a cloth, the jar or basket on the head; porters under their loads; the Bozo fisherman in tunic and
// short trousers under a straw hat, a pole over the shoulder with his nets; the Fulani herder in the broad straw
// hat with his staff; the mason with his hoe.
const CL = { white: 'cloth_white', ochre: 'cloth_ochre', brown: 'cloth_brown', grey: 'cloth_grey', red: 'cloth_red', indigo: 'cloth_indigo', blue: 'cloth_blue', green: 'cloth_green', black: 'cloth_black' };
export const WALKERS = [
  { id: 'man', weight: 1.6, market: 1.3, el: { dress: 'robe', over: 'none', hair: 'short', hat: 'cap', arms: 'hang', feet: 'shod' },
    c1: [CL.white, CL.white, CL.indigo, CL.ochre, CL.brown], c2: [CL.white, CL.indigo, CL.brown], c3: [CL.white, CL.white, CL.indigo], speed: [1.0, 1.3], stride: 1.4 },
  { id: 'turban', weight: 0.9, market: 1.1, el: { dress: 'robe', over: 'sash', hair: 'short', hat: 'turban', arms: 'hang', feet: 'shod' },
    c1: [CL.indigo, CL.white, CL.blue], c2: [CL.white, CL.indigo], c3: [CL.indigo, CL.white, CL.blue], speed: [1.0, 1.25], stride: 1.4 },
  { id: 'marabout', weight: 0.5, market: 0.4, el: { dress: 'robe', over: 'none', hair: 'short', hat: 'turban', carry: 'staff', len: 1.5, staffMat: 'wood_dark', beard: true, feet: 'shod' },
    c1: [CL.white], c2: [CL.white, CL.grey], c3: [CL.white], speed: [0.8, 1.0], stride: 1.5 },
  { id: 'woman', weight: 1.5, market: 1.5, el: { dress: 'wrap', over: 'shawl', hair: 'bun', hat: 'turban', arms: 'hang', feet: 'bare' }, swing: 0.7,
    c1: [CL.white, CL.ochre, CL.red, CL.indigo, CL.green], c2: [CL.indigo, CL.red, CL.ochre, CL.brown, CL.blue], c3: [CL.red, CL.ochre, CL.white, CL.indigo, CL.green], speed: [0.9, 1.15], stride: 1.25, h: [0.9, 0.97] },
  { id: 'jar', weight: 1.0, market: 1.2, el: { dress: 'wrap', over: 'shawl', hair: 'bun', hat: 'turban', carry: 'pot', arms: 'hang', feet: 'bare' }, swing: 0.6,
    c1: [CL.white, CL.ochre, CL.red, CL.indigo], c2: [CL.indigo, CL.red, CL.ochre, CL.green], c3: [CL.red, CL.white, CL.ochre], speed: [0.85, 1.1], stride: 1.2, h: [0.9, 0.96] },
  { id: 'basket', weight: 0.9, market: 1.8, el: { dress: 'wrap', over: 'shawl', hair: 'bun', hat: 'turban', carry: 'basket', arms: 'hang', feet: 'bare' }, swing: 0.6,
    c1: [CL.white, CL.ochre, CL.indigo], c2: [CL.indigo, CL.red, CL.brown, CL.green], c3: [CL.red, CL.ochre, CL.white], speed: [0.85, 1.1], stride: 1.2, h: [0.9, 0.96] },
  { id: 'porter', weight: 0.9, market: 1.3, el: { dress: 'tunic', legs: 'bare', over: 'belt', hair: 'short', hat: 'cap', carry: 'headload', arms: 'hang', feet: 'bare' }, wet: 'cape',
    c1: [CL.ochre, CL.brown, CL.white, CL.indigo], c2: [CL.white, CL.brown], c3: [CL.white, CL.indigo], speed: [0.95, 1.2], stride: 1.1 },
  { id: 'fisher', weight: 0.7, market: 0.3, shore: 2.2, el: { dress: 'tunic', legs: 'bare', over: 'belt', hair: 'short', hat: 'straw', carry: 'pole', arms: 'pole', feet: 'bare' }, wet: 'cape', pole: true, swing: 0.75,
    c1: [CL.ochre, CL.brown, CL.indigo, CL.white], c2: [CL.brown, CL.indigo, CL.white], c3: [CL.black], speed: [1.0, 1.25], stride: 1.15 },
  { id: 'herder', weight: 0.4, market: 0.5, el: { dress: 'robe', over: 'sash', hair: 'short', hat: 'straw', carry: 'staff', len: 1.6, feet: 'bare' },
    c1: [CL.ochre, CL.brown, CL.white], c2: [CL.ochre, CL.brown], c3: [CL.black], speed: [0.9, 1.15], stride: 1.45 },
  { id: 'mason', weight: 0.5, market: 0.2, el: { dress: 'tunic', legs: 'bare', top: 'bare', hair: 'short', hat: 'none', carry: 'hoe', arms: 'hang', feet: 'bare' },
    c1: [CL.white, CL.ochre], c2: [CL.brown, CL.white, CL.indigo], c3: [CL.black], speed: [1.0, 1.3], stride: 1.4 },
];
/** The boatman standing at the stern with the pole, and the passenger sitting under the mat roof. */
export const CREW = {
  boatman: { el: { dress: 'tunic', legs: 'bare', over: 'belt', hair: 'short', hat: 'straw', arms: 'pull', feet: 'bare' }, wet: 'cape', c1: [CL.ochre, CL.brown, CL.white, CL.indigo], c2: [CL.brown, CL.indigo], c3: [CL.black] },
  passenger: { el: { dress: 'robe', over: 'none', hair: 'short', hat: 'turban', pose: 'cross', feet: 'bare' }, c1: [CL.white, CL.indigo, CL.ochre], c2: [CL.white, CL.indigo], c3: [CL.white, CL.indigo] },
};

// ── small helpers: solids as triangles ───────────────────────────────────────
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };
function beam(out, p, q, r, n = 4) {
  const d = norm([q[0] - p[0], q[1] - p[1], q[2] - p[2]]), t1 = norm(cross(d, Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])), t2 = cross(d, t1);
  const ring = (c) => Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2; return [c[0] + (t1[0] * Math.cos(a) + t2[0] * Math.sin(a)) * r, c[1] + (t1[1] * Math.cos(a) + t2[1] * Math.sin(a)) * r, c[2] + (t1[2] * Math.cos(a) + t2[2] * Math.sin(a)) * r]; });
  const A = ring(p), B = ring(q);
  for (let k = 0; k < n; k++) { const k1 = (k + 1) % n; out.push(...A[k], ...A[k1], ...B[k1], ...A[k], ...B[k1], ...B[k]); }
  for (let k = 1; k + 1 < n; k++) out.push(...A[0], ...A[k + 1], ...A[k], ...B[0], ...B[k], ...B[k + 1]);
}
const SKIN = [0.62, 0.55, 0.5];            // the engine's skin factors darkened toward the dark skin of the Sahel
const DARK = factor('skin', 'skin_dark');
/** Every figure's skin dark (the instance's skin slot would be the engine's light/medium); bare legs given the stride of legs. */
function viaSkin(sb) {
  return {
    addPiece(v, group, g, o = {}) {
      if (group === 'skin' && o.slot === SLOT.skin) {
        const b = bounds(g), legs = b[4] < 1.02 && Math.max(Math.abs(b[0]), Math.abs(b[3])) < 0.2;
        o = { ...o, slot: SLOT.none, col: DARK };
        if (legs) o = { ...o, limb: LIMB.legs };
      } else if (group === 'skin') o = { ...o, col: DARK };
      return sb.addPiece(v, group, g, o);
    },
  };
}
void SKIN;
export function walkerShapes(sb) {
  const kinds = [...WALKERS.map((k) => [k.id, k]), ['boatman', CREW.boatman], ['passenger', CREW.passenger]];
  for (const [id, k] of kinds) for (const wet of k.wet ? [false, true] : [false]) for (const far of [false, true]) {
    const v = sb.variant(`${id}|${wet ? 'wet' : 'dry'}|${far ? 'far' : 'near'}`);
    const el = { ...k.el };
    let cape = null;
    if (wet && k.wet === 'cape') { el.over = 'cloak'; cape = 'thatch_palm'; }
    addFigure(viaSkin(sb), v, figure, el, { far, cape });
  }
}

// ── what floats ──────────────────────────────────────────────────────────────
/**
 * The pirogues of the Bani (the life style's canoe: a long narrow hull of planks with its sheer rising to bow and stern),
 * 8 m, bow toward −z, the waterline at y 0: the loaded one (sacks of grain and millet, clay jars and baskets of dried
 * fish amidships) and the covered one (a gabled mat roof on four posts over a passenger). The boatman stands in the
 * stern and poles; the pole is the movers' own 'oar' piece, swaying at the pin.
 */
const LEN = 8, FLOAT = boatFloat('canoe'), DECK = -0.2;
export const BOAT = { L: LEN, pin: [0.3, 0.25, 3.3], deck: DECK, stern: 2.7, passenger: [0, DECK, -0.2], hull: [0.62, 4.1] };
export function boatShapes(sb) {
  const put = (into) => ({ bag: { add: (m, g) => into.push([m, g]) }, col: { circle() {}, box() {}, rect() {}, floor() {}, segment() {} } });
  const life = STYLES.life.elements, hull = [];
  life.boat({ kind: 'canoe', at: [0, 0], y: FLOAT, rot: Math.PI, len: LEN }, put(hull));
  const grp = (m) => (/wicker|reed|sacking|thatch/.test(m) ? 'fibre' : 'wood');
  const add = (v, m, g, far) => { if (far && /hide|cloth/.test(m)) return; sb.addPiece(v, grp(m), g, { slot: SLOT.none, col: factor(grp(m), m) }); };
  // the cargo: sacks at the bow and amidships, jars and baskets of dried fish
  const cargo = [];
  life.sacks({ at: [0, -1.5], y: DECK + 0.07, rot: 0.2, n: 5, seed: 21 }, put(cargo));
  life.sacks({ at: [0.05, -0.4], y: DECK + 0.07, rot: -0.3, n: 4, seed: 22 }, put(cargo));
  life.pot({ at: [-0.18, 0.6], y: DECK + 0.07, seed: 3 }, put(cargo)); life.pot({ at: [0.2, 0.95], y: DECK + 0.07, seed: 4 }, put(cargo));
  life.basket({ at: [-0.15, 1.5], y: DECK + 0.07, seed: 5, goods: 'hide_tan' }, put(cargo));
  // the roof: two mat slopes from a ridge over the middle of the boat, on four posts
  const roof = [], posts = [], R = (x, y, z) => [x, y, z];
  const quad = (a, b, c, d) => roof.push(...a, ...b, ...c, ...a, ...c, ...d, ...a, ...c, ...b, ...a, ...d, ...c);
  quad(R(-0.7, 0.62, -1.5), R(0, 1.02, -1.5), R(0, 1.02, 1.1), R(-0.7, 0.62, 1.1)); quad(R(0, 1.02, -1.5), R(0.7, 0.62, -1.5), R(0.7, 0.62, 1.1), R(0, 1.02, 1.1));
  for (const [x, z] of [[-0.5, -1.35], [0.5, -1.35], [-0.5, 0.95], [0.5, 0.95]]) beam(posts, R(x, DECK, z), R(x, 0.8, z), 0.03, 5);
  for (const kind of ['covered', 'cargo']) for (const far of [false, true]) {
    const v = sb.variant(`${kind}|${far ? 'far' : 'near'}`);
    for (const [m, g] of hull) add(v, m, g, far);
    if (kind === 'cargo') for (const [m, g] of cargo) add(v, m, g, far);
    else { sb.addPiece(v, 'fibre', flat(roof), { slot: SLOT.none, col: factor('fibre', 'reed_mat') }); sb.addPiece(v, 'wood', flat(posts), { slot: SLOT.c1, col: factor('wood', 'timber', 0.9) }); }
  }
  // the pole: held at the stern, a long shaft slanting down and aft to a small forked foot on the river bed
  {
    const v = sb.variant('oar'), w = [], H = [-0.2, 1.7, -0.7], B1 = [0.15, -1.1, 0.75];
    beam(w, H, B1, 0.024, 5);
    beam(w, B1, [B1[0] - 0.08, B1[1] - 0.12, B1[2] + 0.04], 0.02, 4); beam(w, B1, [B1[0] + 0.08, B1[1] - 0.12, B1[2] + 0.04], 0.02, 4);
    sb.addPiece(v, 'wood', flat(w), { slot: SLOT.c1, col: factor('wood', 'timber', 0.9) });
  }
}
void MOSQUE; void shore;
