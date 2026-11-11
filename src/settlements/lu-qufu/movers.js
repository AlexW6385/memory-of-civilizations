// Qufu, c. 1730 — the moving life (docs/settlements/lu-qufu.md §7): townspeople and pilgrims in Qing dress — the long gown with the queue and the
// skullcap, scholars in blue gowns, women in the long gown or jacket, porters with the shoulder pole, boys, the Duke's bannermen on patrol —
// on Queli Street, the lanes of the town, the temple's forecourt and its first courts, the mansion's forecourt. Data for the engine's movers
// (src/engine/movers.js, read in its worker); the ways come from layout.js.
import { RADIUS, TEMPLE, QUELI, SQUARE, MX, streets } from './layout.js';
import '../../styles/qing/index.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure, factor, flat, SLOT } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 40, night: 5, rain: 0.5, reach: 150, spawnMin: 26, far: 44 },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: -1.4,
};

/** The ways walked: the streets and lanes, Queli Street (the busiest: the pilgrims' way), the temple's forecourt and first courts. */
export function walkways() {
  const rects = [], push = (r, weight, market, kind) => { if (r[2] - r[0] < 1 || r[3] - r[1] < 1) return; rects.push({ r, weight, market, kind }); };
  for (const s of streets()) { const w = Math.min(s[2] - s[0], s[3] - s[1]); push(s, w > 9 ? 1.3 : 0.8, w > 9 ? 0.5 : 0.2, w < 7 ? 'lane' : 'street'); }
  push([-8, 168, 8, 262], 2.6, 1.6, 'street');
  push([QUELI[0] - 1, QUELI[1], QUELI[2] + 1, QUELI[3]], 1.5, 1.2, 'street');
  push(SQUARE, 1.6, 0.8, 'street');
  push([-40, 28, 40, 118], 1.4, 0.2, 'street');                        // the temple's first courts
  push([MX - 6, 80, MX + 6, 125], 0.8, 0.2, 'street');
  void TEMPLE;
  return { rects, links: [], clip: RADIUS - 24 };
}
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }

const CL = { indigo: 'cloth_indigo', grey: 'cloth_grey', brown: 'cloth_brown', white: 'cloth_white', black: 'cloth_black', ochre: 'cloth_ochre', maroon: 'cloth_maroon', green: 'cloth_green', red: 'cloth_red', blue: 'cloth_blue' };
export const WALKERS = [
  { id: 'gentleman', weight: 1.0, market: 1.0, el: { dress: 'robe', hair: 'shaven', hat: 'cap', over: 'collar', arms: 'hang' }, queue: true, button: true,
    c1: [CL.indigo, CL.grey, CL.brown, CL.indigo], c2: [CL.black, CL.black, CL.indigo], c3: [CL.black], speed: [1.0, 1.25], stride: 1.45 },
  // the scholar and the student: the blue gown, the black jacket
  { id: 'scholar', weight: 1.3, market: 0.9, el: { dress: 'robe', hair: 'shaven', hat: 'cap', over: 'collar', arms: 'hang' }, queue: true, button: true,
    c1: [CL.blue, CL.blue, CL.white, CL.grey], c2: [CL.black, CL.indigo], c3: [CL.black], speed: [0.9, 1.15], stride: 1.4 },
  { id: 'townsman', weight: 1.5, market: 1.6, el: { dress: 'robe', hair: 'shaven', hat: 'cap', over: 'sash', arms: 'hang' }, queue: true, button: true,
    c1: [CL.indigo, CL.grey, CL.brown, CL.white], c2: [CL.black, CL.indigo, CL.brown, CL.white], c3: [CL.black, CL.indigo], speed: [1.1, 1.4], stride: 1.45 },
  { id: 'woman', weight: 0.9, market: 1.0, el: { dress: 'robe', hair: 'bun', over: 'collar', arms: 'hang' }, swing: 0.7,
    c1: [CL.indigo, CL.maroon, CL.green, CL.ochre, CL.grey], c2: [CL.white, CL.indigo, CL.black, CL.red], c3: [CL.black], speed: [0.9, 1.15], stride: 1.25, h: [0.9, 0.96] },
  { id: 'labourer', weight: 0.9, market: 0.6, el: { dress: 'trousers', hair: 'shaven', hat: 'cap', arms: 'hang' }, queue: true,
    c1: [CL.indigo, CL.grey, CL.brown, CL.ochre], c2: [CL.indigo, CL.black, CL.grey], c3: [CL.black, CL.brown], speed: [1.15, 1.45], stride: 1.4 },
  { id: 'porter', weight: 0.9, market: 1.3, el: { dress: 'trousers', hair: 'shaven', hat: 'cap', carry: 'pole', arms: 'pole' }, queue: true, swing: 0.75,
    c1: [CL.indigo, CL.grey, CL.brown], c2: [CL.indigo, CL.black, CL.brown], c3: [CL.black, CL.brown], speed: [1.0, 1.25], stride: 1.1 },
  { id: 'boy', weight: 0.5, market: 0.3, el: { dress: 'robe', hair: 'shaven', hat: 'cap', arms: 'hang' }, queue: true, button: true,
    c1: [CL.indigo, CL.grey, CL.ochre, CL.red], c2: [CL.black, CL.white], c3: [CL.black, CL.red], speed: [1.2, 1.7], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
  { id: 'bannerman', weight: 0.4, market: 0.4, el: { dress: 'robe', hair: 'shaven', hat: 'cap', over: 'sash', arms: 'staff', carry: 'staff', staffMat: 'timber', len: 1.8 }, queue: true, button: true,
    c1: [CL.red, CL.ochre, CL.indigo], c2: [CL.black, CL.white], c3: [CL.black], speed: [0.95, 1.15], stride: 1.5 },
];
export const CREW = {};

// ── shapes ───────────────────────────────────────────────────────────────────
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };
/** A thin prism of n sides from p to q (flat triangles into out). */
function beam(out, p, q, r, n = 4, r2 = r) {
  const d = norm([q[0] - p[0], q[1] - p[1], q[2] - p[2]]), t1 = norm(cross(d, Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])), t2 = cross(d, t1);
  const ring = (c, rr) => Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2; return [c[0] + (t1[0] * Math.cos(a) + t2[0] * Math.sin(a)) * rr, c[1] + (t1[1] * Math.cos(a) + t2[1] * Math.sin(a)) * rr, c[2] + (t1[2] * Math.cos(a) + t2[2] * Math.sin(a)) * rr]; });
  const A = ring(p, r), B = ring(q, r2);
  for (let k = 0; k < n; k++) { const k1 = (k + 1) % n; out.push(...A[k], ...A[k1], ...B[k1], ...A[k], ...B[k1], ...B[k]); }
  for (let k = 1; k + 1 < n; k++) { out.push(...A[0], ...A[k + 1], ...A[k], ...B[0], ...B[k], ...B[k + 1]); }
}
/** A solid ball of radius r (flat triangles). */
function bead(out, c, r, n = 6, m = 4) {
  const P = (i, j) => { const t = i / m * Math.PI, a = j / n * Math.PI * 2; return [c[0] + Math.sin(t) * Math.cos(a) * r, c[1] + Math.cos(t) * r, c[2] + Math.sin(t) * Math.sin(a) * r]; };
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) {
    const a = P(i, j), b = P(i + 1, j), cc = P(i + 1, j + 1), d = P(i, j + 1);
    if (i > 0) out.push(...a, ...b, ...d);
    if (i < m - 1) out.push(...d, ...b, ...cc);
  }
}

/** The queue: the braid down the back from the crown, its end bound with a red cord, a little tassel. */
function queue(add, far, h = 1) {
  const pts = [[0, 1.58, 0.075], [0, 1.52, 0.118], [0, 1.4, 0.148], [0, 1.22, 0.162], [0, 1.04, 0.158], [0, 0.9, 0.146]];
  const w = [];
  for (let k = 0; k + 1 < pts.length; k++) beam(w, pts[k], pts[k + 1], k < 2 ? 0.022 : 0.026, far ? 4 : 6, k < 1 ? 0.024 : 0.025);
  add('cloth', flat(w), { col: factor('cloth', 'hide_black', 0.7) });
  if (!far) {
    const t = [];
    beam(t, [0, 0.935, 0.146], [0, 0.9, 0.146], 0.03, 6, 0.03);
    for (const dx of [-0.012, 0, 0.012]) beam(t, [dx, 0.9, 0.146], [dx * 2, 0.8, 0.15], 0.006, 4, 0.004);
    add('cloth', flat(t), { col: factor('cloth', 'cloth_red', 1) });
  }
  void h;
}
/** The button of the skullcap (guapimao): a bead of red coral on its crown. */
function button(add) {
  const t = []; bead(t, [0, 1.703, 0.004], 0.014, 6, 4);
  add('cloth', flat(t), { col: factor('cloth', 'cloth_red', 1.1) });
}

export function walkerShapes(sb) {
  for (const k of WALKERS) for (const far of [false, true]) {
    const v = sb.variant(`${k.id}|dry|${far ? 'far' : 'near'}`);
    const extras = [];
    if (k.queue) extras.push((add) => queue(add, far));
    if (k.button) extras.push(button);
    addFigure(sb, v, figure, { ...k.el }, { far, cape: null, extra: (add) => { for (const f of extras) f(add); } });
  }
}
export const BOAT = { L: 7, pin: [0, 0, 0], deck: 0, stern: 0, passenger: [0, 0, 0], hull: [1.34, 3.55] };
export function boatShapes() { /* no boats */ }
