// Paris in 1248 — the moving life (docs/settlements/paris.md §5b): townspeople in the dress of the 13th century on
// the rues of the Cité and the banks, over the Grand Pont and the Petit Pont and on the parvis; river boats of the
// water-merchants on the Seine's two arms. Data for the engine's movers (src/engine/movers.js), in the format of
// Suzhou's; the ways come from layout.js.

import { RADIUS, RIVER, NORTH_ARM, SOUTH_ARM, BRIDGES, lots, streets } from './layout.js';
import { STYLES } from '../../core/build.js';
import '../../styles/gothic/index.js';
import '../../styles/gothic/town.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure, factor, flat, SLOT } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 52, night: 6, rain: 0.6, reach: 150, spawnMin: 24, far: 42 },
  boats: { count: 6, reach: 250, spawnMin: 60, far: 95, speed: [0.8, 1.2], bridgeSpeed: 0.7 },
  water: RIVER.level,
};

// ── the ways ─────────────────────────────────────────────────────────────────
const shopShare = (r) => {
  let n = 0;
  for (const l of lots()) { const cx = (l.rect[0] + l.rect[2]) / 2, cz = (l.rect[1] + l.rect[3]) / 2; if (cx > r[0] - 4 && cx < r[2] + 4 && cz > r[1] - 12 && cz < r[3] + 12) n++; }
  return Math.min(1, n / Math.max(10, (r[2] - r[0]) / 4));
};
/** The streets as rectangles (the bridges' streets run on over the arms), the bridges' decks needing no link. */
export function walkways() {
  const rects = streets().map((r) => {
    const w = Math.min(r[2] - r[0], r[3] - r[1]), parvis = r[0] === 102 || (r[2] - r[0] > 40 && r[3] - r[1] > 40), bridge = w <= 6.01 && r[3] - r[1] > 100;
    const m = shopShare(r);
    return { r, weight: (parvis ? 3.2 : bridge ? 2.8 : 1.0) * (0.6 + 2 * m), market: parvis ? 1 : bridge ? 0.9 : m, kind: w > 6 ? 'street' : 'lane' };
  });
  return { rects, links: [], clip: RADIUS - 12 };
}
/** The Seine's two arms (their middle lines) and the bridges over them. */
export function waterways() {
  const RW = RADIUS - 40, mid = (a) => (a[1] + a[3]) / 2;
  return {
    rects: [NORTH_ARM, SOUTH_ARM].map((a) => ({ r: [-RW, mid(a) - 16, RW, mid(a) + 16], weight: 1 })),
    bridges: BRIDGES.map((b) => ({ at: [b.x, mid(b.arm)], half: (b.arm[3] - b.arm[1]) / 2 + 4 })),
    clip: RADIUS - 18,
  };
}
/** The boats standing in the river (the plan's `boat_seine` elements), which the moving ones keep clear of. */
export async function staticBoats() {
  const out = [];
  const { boats } = await import('./plan.js');
  for (const e of boats.elements) {
    if (e.t !== 'boat_seine') continue;
    const a = e.yaw ?? 0, L = e.len ?? 12;
    out.push({ c: e.at, u: [Math.cos(a), Math.sin(a)], hl: L / 2 + 1.8, hw: L * 0.11 + 0.3 });
  }
  return out;
}

// ── who walks ────────────────────────────────────────────────────────────────
// The dress of the 13th-century town (dossier §5b): burghers in long tunics (cotte) and belted, with the linen coif
// or a soft cap; craftsmen and labourers in short tunics and hose; women in long gowns with a wimple or veil; canons
// and clerks in black; porters with sacks, water-carriers with the yoke.
const CL = { grey: 'cloth_grey', brown: 'cloth_brown', white: 'cloth_white', black: 'cloth_black', ochre: 'cloth_ochre', red: 'cloth_red', green: 'cloth_green', blue: 'cloth_blue', indigo: 'cloth_indigo', maroon: 'cloth_maroon' };
export const WALKERS = [
  { id: 'burgher', weight: 1.3, market: 1.5, el: { dress: 'robe', hair: 'short', hat: 'cap', over: 'sash', arms: 'hang' }, wet: 'cloak',
    c1: [CL.red, CL.blue, CL.green, CL.brown, CL.indigo, CL.maroon], c2: [CL.black, CL.brown, CL.white], c3: [CL.white, CL.white, CL.black], speed: [1.0, 1.3], stride: 1.45 },
  { id: 'merchant', weight: 1.0, market: 1.4, el: { dress: 'robe', hair: 'short', hat: 'brim', over: 'cape', arms: 'hang' }, wet: 'cloak',
    c1: [CL.maroon, CL.green, CL.blue, CL.grey], c2: [CL.black, CL.brown], c3: [CL.brown, CL.black, CL.red], speed: [1.0, 1.25], stride: 1.45 },
  { id: 'craftsman', weight: 1.4, market: 1.1, el: { dress: 'tunic', legs: 'hose', feet: 'shod', hair: 'short', hat: 'cap', over: 'belt', arms: 'hang' }, wet: 'cloak',
    c1: [CL.brown, CL.grey, CL.ochre, CL.green, CL.white], c2: [CL.brown, CL.grey, CL.red, CL.black], c3: [CL.white, CL.brown, CL.grey], speed: [1.1, 1.45], stride: 1.45 },
  { id: 'woman', weight: 1.2, market: 1.3, el: { dress: 'robe', hat: 'veil', over: 'none', arms: 'hang' }, wet: 'cloak', swing: 0.7,
    c1: [CL.red, CL.blue, CL.green, CL.ochre, CL.grey, CL.indigo], c2: [CL.white, CL.brown], c3: [CL.white, CL.white, CL.grey], speed: [0.9, 1.15], stride: 1.25, h: [0.9, 0.97] },
  { id: 'canon', weight: 0.5, market: 0.7, el: { dress: 'robe', hair: 'shaven', over: 'cape', arms: 'hang' }, wet: 'cloak',
    c1: [CL.black, CL.black, CL.grey], c2: [CL.black, CL.white], c3: [CL.black], speed: [0.85, 1.1], stride: 1.5 },
  { id: 'porter', weight: 0.9, market: 1.1, el: { dress: 'tunic', legs: 'hose', feet: 'shod', hair: 'short', hat: 'cap', carry: 'sack', arms: 'sack' }, wet: 'cloak',
    c1: [CL.brown, CL.grey, CL.white, CL.ochre], c2: [CL.brown, CL.grey], c3: [CL.white, CL.brown], speed: [1.0, 1.25], stride: 1.15 },
  { id: 'carrier', weight: 0.7, market: 0.9, el: { dress: 'tunic', legs: 'hose', feet: 'shod', hair: 'short', hat: 'cap', carry: 'pole', arms: 'pole' }, wet: 'cloak', swing: 0.75, pole: true,
    c1: [CL.brown, CL.grey, CL.indigo], c2: [CL.brown, CL.black], c3: [CL.white, CL.brown], speed: [1.0, 1.25], stride: 1.1 },
];
/** The boatman at the stern oar, and the passenger sitting on a thwart. */
export const CREW = {
  boatman: { el: { dress: 'tunic', legs: 'hose', feet: 'shod', hair: 'short', hat: 'cap', over: 'belt', arms: 'pull' }, wet: 'cloak', c1: [CL.brown, CL.grey, CL.blue, CL.ochre], c2: [CL.brown, CL.black, CL.grey], c3: [CL.white, CL.brown, CL.red] },
  passenger: { el: { dress: 'robe', hair: 'short', hat: 'cap', over: 'sash', pose: 'sit' }, c1: [CL.red, CL.blue, CL.green, CL.grey], c2: [CL.black, CL.brown], c3: [CL.white, CL.black] },
};

export function walkerShapes(sb) {
  const kinds = [...WALKERS.map((k) => [k.id, k]), ['boatman', CREW.boatman], ['passenger', CREW.passenger]];
  for (const [id, k] of kinds) for (const wet of k.wet ? [false, true] : [false]) for (const far of [false, true]) {
    const v = sb.variant(`${id}|${wet ? 'wet' : 'dry'}|${far ? 'far' : 'near'}`);
    const el = { ...k.el };
    if (wet) el.over = 'cloak';
    addFigure(sb, v, figure, el, { far });
  }
}

// ── what floats ──────────────────────────────────────────────────────────────
// The Seine's flat-bottomed boat of the water-merchants (the gothic style's boat_seine), 12 m, bow toward −z, waterline at y 0:
// `covered` carries casks and a passenger on a thwart, `cargo` sacks. Its fixed steering oar and pole are left out; the
// moving boat has the stern oar of the movers.
const LEN = 12, BEAM = LEN * 0.22;
export const BOAT = { L: LEN, pin: [0.0, 0.82, LEN / 2 - 0.1], deck: 0.0, stern: LEN / 2 - 0.1, passenger: [0, 0.55, -0.4], hull: [BEAM / 2 + 0.2, LEN / 2 + 0.5] };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };
function beam(out, p, q, r, n = 4) {
  const d = norm([q[0] - p[0], q[1] - p[1], q[2] - p[2]]), t1 = norm(cross(d, Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])), t2 = cross(d, t1);
  const ring = (c) => Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2; return [c[0] + (t1[0] * Math.cos(a) + t2[0] * Math.sin(a)) * r, c[1] + (t1[1] * Math.cos(a) + t2[1] * Math.sin(a)) * r, c[2] + (t1[2] * Math.cos(a) + t2[2] * Math.sin(a)) * r]; });
  const A = ring(p), B = ring(q);
  for (let k = 0; k < n; k++) { const k1 = (k + 1) % n; out.push(...A[k], ...A[k1], ...B[k1], ...A[k], ...B[k1], ...B[k]); }
  for (let k = 1; k + 1 < n; k++) { out.push(...A[0], ...A[k + 1], ...A[k], ...B[0], ...B[k], ...B[k + 1]); }
}
export function boatShapes(sb) {
  const MAT_GROUP = { sacking: 'fibre' };
  for (const [kind, load] of [['covered', 'casks'], ['cargo', 'sacks']]) {
    const got = [];
    STYLES.gothic.elements.boat_seine({ at: [0, 0], yaw: -Math.PI / 2, len: LEN, load, water: 0 }, { bag: { add: (m, g) => got.push([m, g]) }, col: { circle() {}, box() {}, rect() {} } });
    let timber = 0;
    for (const far of [false, true]) {
      const v = sb.variant(`${kind}|${far ? 'far' : 'near'}`);
      timber = 0;
      for (const [m, g] of got) {
        if (m === 'timber' && ++timber > 5) continue;            // the steering oar and the pole
        if (far && m === 'timber') continue;
        const group = MAT_GROUP[m] ?? 'wood';
        sb.addPiece(v, group, g, { slot: m === 'tar_wood' ? SLOT.c1 : m === 'sacking' ? SLOT.c3 : SLOT.none, col: factor(group, m === 'tar_wood' ? 'timber' : m) });
      }
    }
  }
  // the stern oar: its frame at the pin, the handle forward to the boatman's hands, the loom running aft into the water to a flat blade
  {
    const v = sb.variant('oar'), w = [];
    const H = [-0.2, 0.86 - 0.3, -0.78], K = [0, 0.02, 0.18], B0 = [0.0, -0.8, 2.25], B1 = [0.0, -1.1, 3.4];
    beam(w, H, [0, 0.07, -0.02], 0.028, 6); beam(w, [0, 0.07, -0.02], K, 0.034, 6); beam(w, K, B0, 0.03, 6);
    const bl = [], hw = 0.1, th = 0.02, d = norm([B1[0] - B0[0], B1[1] - B0[1], B1[2] - B0[2]]), side = [1, 0, 0], up = cross(d, side);
    const C = (p, s, t) => [p[0] + side[0] * s + up[0] * t, p[1] + side[1] * s + up[1] * t, p[2] + side[2] * s + up[2] * t];
    const q = [[C(B0, -th, -hw * 0.5), C(B0, th, -hw * 0.5), C(B0, th, hw * 0.5), C(B0, -th, hw * 0.5)], [C(B1, -th * 0.6, -hw), C(B1, th * 0.6, -hw), C(B1, th * 0.6, hw), C(B1, -th * 0.6, hw)]];
    for (let k = 0; k < 4; k++) { const k1 = (k + 1) % 4; bl.push(...q[0][k], ...q[1][k], ...q[1][k1], ...q[0][k], ...q[1][k1], ...q[0][k1]); }
    bl.push(...q[1][0], ...q[1][2], ...q[1][1], ...q[1][0], ...q[1][3], ...q[1][2]);
    sb.addPiece(v, 'wood', flat(w), { slot: SLOT.c1, col: factor('wood', 'timber', 0.9) });
    sb.addPiece(v, 'wood', flat(bl), { slot: SLOT.c1, col: factor('wood', 'timber', 0.75) });
  }
}
