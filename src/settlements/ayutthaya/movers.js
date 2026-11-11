// Ayutthaya about 1687 — the moving life (docs/settlements/ayutthaya.md §7): people on the earth paths along the canals and the river road, over the
// bridges and in the wat's forecourt, in the dress La Loubère saw (the cloth between the legs and knotted at the waist, the breast bare or
// crossed by a sash, the feet bare, the hair cropped), monks in saffron with their alms bowls, women with baskets and water pots on the head,
// porters with the shoulder pole; boats paddled and poled along the canals and the river (sampans, vendors' boats). Data for the engine's
// movers (src/engine/movers.js), read in its worker; the format is Suzhou's. Ways derived from layout.js, the standing boats from town.js.

import { RADIUS, WATER, CANALS, BRIDGES, paths, bridgeLinks, inRect, WAT, MARKET } from './layout.js';
import { waterElements } from './town.js';
import '../../styles/siamese/index.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { boatParts } from '../../styles/siamese/index.js';
import { addFigure, factor, flat, SLOT } from '../../engine/movers-kit.js';

export const PARAMS = {
  walkers: { day: 36, night: 5, rain: 0.6, reach: 150, spawnMin: 26, far: 42 },
  boats: { count: 10, reach: 240, spawnMin: 50, far: 95, speed: [0.7, 1.15], bridgeSpeed: 0.6 },
  water: WATER,
};

// ── the ways on foot ─────────────────────────────────────────────────────────
/** The banks' paths (layout.js), the wat's forecourt and the way to its gate, the bridges as links. */
export function walkways() {
  const rects = paths().map((p) => ({ r: p.r, weight: p.weight, market: 0, kind: 'lane' }));
  const [x0, z0, x1, z1] = WAT.wall;
  rects.push({ r: [x0 + 4, z1 - 14, x1 - 4, z1 - 4], weight: 1.4, market: 0, kind: 'street' }, { r: [WAT.gate[0] - 2, z1 - 4, WAT.gate[0] + 2, z1 + 8], weight: 1.4, market: 0, kind: 'street' });
  return { rects, links: bridgeLinks(), clip: RADIUS - 40 };
}
/** The canals as reaches between the bridges (the bridges are low: boats turn back short of them) and the river's lanes. */
export function waterways() {
  const out = [];
  for (const c of CANALS) {
    const [a, b, c1, d] = c.rect, horiz = c1 - a > d - b, mid = horiz ? (b + d) / 2 : (a + c1) / 2;
    const [lo, hi] = horiz ? [a + 6, c1 - 6] : [b + 6, d - 6];
    const cuts = BRIDGES.filter((q) => (horiz ? Math.abs(q.c[1] - mid) < 1 && q.dir === 'z' : Math.abs(q.c[0] - mid) < 1 && q.dir === 'x')).map((q) => (horiz ? q.c[0] : q.c[1])).sort((p, q) => p - q);
    let s = lo;
    for (const cut of [...cuts, hi + 12]) { const e = Math.min(hi, cut - 7); if (e - s > 12) out.push({ r: horiz ? [s, mid - 0.8, e, mid + 0.8] : [mid - 0.8, s, mid + 0.8, e], weight: 1, horiz, kind: 'canal' }); s = cut + 7; }
  }
  // the great river: two lanes down its west reach, and one across its south reach
  out.push({ r: [-292, -200, -288, 200], weight: 2, horiz: false }, { r: [-272, -148, -268, 58], weight: 2.5, horiz: false, market: 1 });
  out.push({ r: [-250, 258, 250, 262], weight: 1.5, horiz: true });
  return { rects: out, bridges: [], clip: RADIUS - 36 };
}
/** The boats standing in the water (town.js): hulls the moving ones keep clear of. */
export async function staticBoats() {
  const out = [];
  for (const e of waterElements()) {
    if (e.t === 'boat') { const L = e.kind === 'vendor' ? 5.2 : 6, r = e.rot ?? 0; out.push({ c: e.at, u: [Math.sin(r), Math.cos(r)], hl: L / 2 + 0.6, hw: 0.9 }); }
    else if (e.t === 'floating_house') { const r = e.rot ?? 0, d = (e.d ?? 5.6) + 2, w = e.w ?? 4.4; out.push({ c: [e.c[0] - Math.sin(r) * 0.9 * 0, e.c[1]], u: [Math.sin(r), Math.cos(r)], hl: d / 2 + 0.6, hw: w / 2 + 0.7 }); }
  }
  return out;
}

// ── who walks ────────────────────────────────────────────────────────────────
const CL = { red: 'cloth_red', ochre: 'cloth_ochre', brown: 'cloth_brown', white: 'cloth_white', indigo: 'cloth_indigo', maroon: 'cloth_maroon', green: 'cloth_green', blue: 'cloth_blue', black: 'cloth_black' };
export const WALKERS = [
  { id: 'woman', weight: 1.5, market: 1.5, el: { dress: 'wrap', top: 'bare', hair: 'short', over: 'shawl', arms: 'hang', feet: 'bare' }, wet: 'cape', swing: 0.7,
    c1: [CL.red, CL.indigo, CL.green, CL.maroon, CL.brown], c2: [CL.white, CL.ochre, CL.red], c3: [CL.black], speed: [0.9, 1.15], stride: 1.25, h: [0.9, 0.97] },
  { id: 'potwoman', weight: 0.8, market: 0.5, el: { dress: 'wrap', top: 'bare', hair: 'short', over: 'shawl', arms: 'hang', carry: 'pot', feet: 'bare' }, wet: 'cape', swing: 0.5,
    c1: [CL.red, CL.indigo, CL.brown, CL.green], c2: [CL.white], c3: [CL.black], speed: [0.85, 1.05], stride: 1.15, h: [0.9, 0.96] },
  { id: 'basketwoman', weight: 0.9, market: 1.4, el: { dress: 'wrap', top: 'bare', hair: 'short', over: 'shawl', arms: 'hang', carry: 'basket', feet: 'bare' }, wet: 'cape', swing: 0.5,
    c1: [CL.ochre, CL.red, CL.green, CL.blue], c2: [CL.white], c3: [CL.black], speed: [0.85, 1.05], stride: 1.15, h: [0.9, 0.96] },
  { id: 'man', weight: 1.3, market: 1.0, el: { dress: 'wrap', top: 'bare', hair: 'short', arms: 'hang', feet: 'bare', over: 'sash' }, wet: 'cape',
    c1: [CL.indigo, CL.red, CL.maroon, CL.brown, CL.green], c2: [CL.white, CL.red], c3: [CL.black], speed: [1.05, 1.35], stride: 1.45 },
  { id: 'porter', weight: 0.8, market: 1.0, el: { dress: 'wrap', top: 'bare', hair: 'short', hat: 'straw', carry: 'pole', arms: 'pole', feet: 'bare' }, wet: 'cape', swing: 0.75, pole: true,
    c1: [CL.indigo, CL.brown, CL.red], c2: [CL.white], c3: [CL.black], speed: [1.0, 1.25], stride: 1.1 },
  { id: 'monk', weight: 0.8, market: 0.3, el: { dress: 'robe', over: 'sash', hair: 'shaven', arms: 'hang', feet: 'bare', carry: 'bowl' }, wet: 'cape',
    c1: [CL.ochre], c2: [CL.ochre], c3: [CL.black], speed: [0.85, 1.05], stride: 1.3 },
  { id: 'official', weight: 0.3, market: 0.3, el: { dress: 'robe', over: 'sash', hair: 'short', hat: 'cap', arms: 'hang', feet: 'bare' },
    c1: [CL.white, CL.blue, CL.green], c2: [CL.red, CL.maroon], c3: [CL.black], speed: [0.85, 1.05], stride: 1.4 },
  { id: 'child', weight: 0.4, market: 0.3, el: { dress: 'wrap', top: 'bare', hair: 'short', arms: 'hang', feet: 'bare' },
    c1: [CL.red, CL.ochre, CL.brown], c2: [CL.white], c3: [CL.black], speed: [1.2, 1.7], stride: 1.0, h: [0.55, 0.7], swing: 1.1 },
];
/** The boatman standing at the stern with the paddle, and the passenger sitting under the awning. */
export const CREW = {
  boatman: { el: { dress: 'wrap', top: 'bare', hair: 'short', hat: 'straw', arms: 'pull', feet: 'bare' }, wet: 'cape', c1: [CL.indigo, CL.brown, CL.red], c2: [CL.white], c3: [CL.black] },
  passenger: { el: { dress: 'wrap', top: 'bare', hair: 'bun', over: 'shawl', pose: 'sit_ground', legs: 'cross', feet: 'bare' }, c1: [CL.red, CL.green, CL.ochre], c2: [CL.white], c3: [CL.black] },
};
export function walkerShapes(sb) {
  for (const [id, k] of [...WALKERS.map((w) => [w.id, w]), ['boatman', CREW.boatman], ['passenger', CREW.passenger]]) for (const wet of k.wet ? [false, true] : [false]) for (const far of [false, true]) {
    const v = sb.variant(`${id}|${wet ? 'wet' : 'dry'}|${far ? 'far' : 'near'}`), el = { ...k.el };
    if (wet && k.wet === 'cape' && !el.carry && !el.hat) el.hat = 'straw';
    addFigure(sb, v, figure, el, { far, cape: wet && k.wet === 'cape' ? 'thatch_palm' : null });
  }
}

// ── what floats ──────────────────────────────────────────────────────────────
/** The sampan paddled from the stern (6 m, the bow toward −z, the waterline at y 0): the covered one with an awning of atap over a passenger, the loaded one with fruit. */
export const BOAT = { L: 6, pin: [0.5, 0.6, 2.3], deck: 0.42, stern: 2.3, passenger: [0, 0.1, -0.2], hull: [0.75, 3.1] };
const beam = (out, p, q, r, n = 5) => {
  const d = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], l = Math.hypot(...d) || 1, u = d.map((v) => v / l), up = Math.abs(u[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const cr = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], nm = (v) => { const m = Math.hypot(...v) || 1; return v.map((x) => x / m); };
  const t1 = nm(cr(u, up)), t2 = cr(u, t1), ring = (c) => Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2; return [0, 1, 2].map((i) => c[i] + (t1[i] * Math.cos(a) + t2[i] * Math.sin(a)) * r); });
  const A = ring(p), B = ring(q);
  for (let k = 0; k < n; k++) { const k1 = (k + 1) % n; out.push(...A[k], ...A[k1], ...B[k1], ...A[k], ...B[k1], ...B[k]); }
};
const fibre = /thatch|cloth|wicker|sacking|reed|glaze|terracotta|silver/;
export function boatShapes(sb) {
  for (const kind of ['covered', 'cargo']) for (const far of [false, true]) {
    const v = sb.variant(`${kind}|${far ? 'far' : 'near'}`);
    const parts = boatParts(kind === 'covered' ? { kind: 'sampan', len: 6, awning: 'atap', load: 'empty', seed: 3 } : { kind: 'sampan', len: 6, load: 'fruit', seed: 5 });
    for (const [m, g] of parts) { const grp = fibre.test(m) ? 'fibre' : 'wood'; sb.addPiece(v, grp, g, { slot: SLOT.none, col: factor(grp, m) }); }
  }
  // the paddle: held at the stern, the shaft down and aft to a leaf-shaped blade in the water
  const v = sb.variant('oar'), w = [], bl = [];
  const H = [-0.2, 0.95, -0.7], K = [0, 0.0, 0.0], B0 = [0.1, -0.4, 1.7], B1 = [0.14, -0.95, 2.45];
  beam(w, H, K, 0.026, 6); beam(w, K, B0, 0.026, 6);
  for (let k = 0; k < 6; k++) {
    const t0 = k / 6, t1 = (k + 1) / 6, wd = (t) => 0.02 + 0.09 * Math.sin(Math.PI * Math.min(1, t * 1.25 + 0.1));
    const P = (t, s) => [B0[0] + (B1[0] - B0[0]) * t + s, B0[1] + (B1[1] - B0[1]) * t, B0[2] + (B1[2] - B0[2]) * t];
    const a = P(t0, -wd(t0)), b = P(t0, wd(t0)), c = P(t1, wd(t1)), e = P(t1, -wd(t1));
    bl.push(...a, ...b, ...c, ...a, ...c, ...e, ...a, ...c, ...b, ...a, ...e, ...c);
  }
  sb.addPiece(v, 'wood', flat(w), { slot: SLOT.c1, col: factor('wood', 'timber', 0.9) });
  sb.addPiece(v, 'wood', flat(bl), { slot: SLOT.c1, col: factor('wood', 'timber', 0.8) });
}
void inRect; void MARKET;
