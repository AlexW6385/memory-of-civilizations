// Ming Suzhou — the moving life of the canal quarter (docs/settlements/ming-suzhou.md §6, "The
// moving life"): boats sculled along the canals with the yuloh, people walking the streets, lanes
// and bridges. Data for the engine's movers (src/engine/movers.js), read in its worker
// (src/engine/movers-worker.js): the ways (from layout.js), who walks and what floats (as figures of
// src/objects/figures.js and the canal boat of the ming style), and the boats already standing in
// the canals (town.js), which the moving ones keep clear of.

import { STREETS, CANALS, BRIDGES, LEVEL, RADIUS, lots } from './layout.js';
import { STYLES } from '../../core/build.js';
import '../../styles/ming/index.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure, factor, flat, SLOT, LIMB } from '../../engine/movers-kit.js';

// ── how many, how fast ───────────────────────────────────────────────────────
export const PARAMS = {
  walkers: {
    day: 46, night: 7, rain: 0.7,        // within reach of the visitor (night: hour from ENV.night; rain thins them)
    reach: 150, spawnMin: 28,            // spawned out of the visitor's sight or beyond spawnMin, let go of beyond reach
    far: 42,                             // the simpler figure beyond (m)
  },
  boats: { count: 8, reach: 250, spawnMin: 60, far: 95, speed: [1.0, 1.45], bridgeSpeed: 0.7 },
  water: LEVEL.canal,
};

// ── the ways ─────────────────────────────────────────────────────────────────
const shopsBy = (() => {
  // the share of shop fronts along each street: the market streets get the crowd by day
  const L = lots();
  return (r) => {
    let n = 0, s = 0;
    for (const l of L) {
      const [x0, z0, x1, z1] = l.rect, f = l.front;
      const fx = f === 'e' ? x1 : f === 'w' ? x0 : (x0 + x1) / 2, fz = f === 's' ? z1 : f === 'n' ? z0 : (z0 + z1) / 2;
      if (fx < r[0] - 1.5 || fx > r[2] + 1.5 || fz < r[1] - 1.5 || fz > r[3] + 1.5) continue;
      n++; if (l.shop) s++;
    }
    return n ? s / n : 0;
  };
})();

/** The streets and lanes (their rectangles), the bridges as links over the canals: { rects, links, clip }. */
export function walkways() {
  const rects = STREETS.map((r) => {
    const w = Math.min(r[2] - r[0], r[3] - r[1]), shops = shopsBy(r);
    // the canal streets and the market lanes busy, the back lanes and alleys of the outer districts quiet
    return { r, weight: (w > 4 ? 1.6 : 0.5) * (1 + 5 * shops), market: shops, kind: w > 4 ? 'street' : 'lane' };
  });
  const links = [];
  for (const b of BRIDGES) {
    const half = b.span / 2 + 0.2 + 4.6;                 // the arch and its landings (town.js waterways)
    if (b.across === 'z') {
      // over the south canal: from the street on its north bank to the back lane behind the houses on the south (where
      // a gap is left among them: the lanes' blocked stretches stop the walkers where it is not)
      links.push({ a: [b.at[0], 65], b: [b.at[0], 89.5], w: b.width / 2, kind: 'bridge', weight: 1.5 });
    } else {
      const sx = b.at[0] > 0 ? 93 : -94;                 // the street on the inner bank; beyond, the landing among the houses
      links.push({ a: [sx, b.at[1]], b: [b.at[0] + Math.sign(b.at[0]) * (half + 3), b.at[1]], w: b.width / 2, kind: 'bridge', weight: 0.6 });
    }
  }
  return { rects, links, clip: RADIUS - 12 };
}

/** The canals (their middle lines and half-widths) and the bridges over them: { canals, bridges, clip }. */
export function waterways() {
  const canals = CANALS.map(([x0, z0, x1, z1]) => {
    const horiz = x1 - x0 > z1 - z0;
    return { r: [x0, z0, x1, z1], horiz };
  });
  const bridges = BRIDGES.map((b) => ({ at: b.at, half: b.span / 2 + 0.5 }));
  // the canals run north under the water gates of the city wall to the moat's edge (north.js: the water to z −179)
  return { rects: canals.map(({ r }) => ({ r: [r[0], Math.max(r[1], -176), r[2], r[3]], weight: 1 })), bridges, clip: RADIUS - 18 };
}

/**
 * The boats standing in the canals (town.js: tied up at the landings, or posed under way with their
 * boatman at the oar) as rectangles { c, u (along), hl, hw }, which the moving boats keep clear of.
 */
export async function staticBoats() {
  const { town } = await import('./town.js');
  const out = [];
  for (const p of await town()) for (const e of p.elements) {
    if (e.t !== 'boat') continue;
    const u = e.dir ?? [Math.sin(e.rot ?? 0), Math.cos(e.rot ?? 0)], L = e.len ?? 7;
    // (the ming boat's half-beam 1.25; the sampan of the street life 0.9 L / 7; the oar trails past the stern)
    out.push({ c: e.at, u, hl: L / 2 + (e.moor ? 0.2 : 1.6), hw: e.moor ? 1.27 : 0.9 * L / 7 });
  }
  return out;
}

// ── who walks ────────────────────────────────────────────────────────────────
// After Qiu Ying's Qingming scroll and the town as it survives (dossier §6): men in long robes with
// the Ming square cap or the bare net-bound topknot, women in long robes, porters and labourers in
// jacket and trousers with straw hats, the porters with shoulder poles and two baskets. In the rain
// the robed walk under oil-paper umbrellas (common in the Ming), the porters and boatmen wear the
// palm-fibre rain cape (suoyi) with their straw hats.
const CL = { indigo: 'cloth_indigo', grey: 'cloth_grey', brown: 'cloth_brown', white: 'cloth_white', black: 'cloth_black', ochre: 'cloth_ochre', maroon: 'cloth_maroon', green: 'cloth_green' };
const UMBRELLA = ['#a8834a', '#9b6c3c', '#8a7a4a', '#6e7a52', '#a35a3a'];         // tung-oiled paper: yellow-brown, brown, olive, green, red-brown
export const WALKERS = [
  { id: 'scholar', weight: 1.2, market: 1.4, el: { dress: 'robe', hair: 'netknot', hat: 'cap', cap: 'ming', over: 'collar', arms: 'hang' }, wet: 'umbrella',
    c1: [CL.indigo, CL.grey, CL.black, CL.brown, '#4a5a6e'], c2: [CL.white, CL.white, CL.grey], c3: [CL.black], speed: [1.05, 1.3], stride: 1.45 },
  { id: 'townsman', weight: 1.5, market: 1.5, el: { dress: 'robe', hair: 'netknot', over: 'sash', arms: 'hang' }, wet: 'umbrella',
    c1: [CL.indigo, CL.indigo, CL.grey, CL.brown, CL.white], c2: [CL.black, CL.indigo, CL.brown, CL.white], c3: [CL.black], speed: [1.1, 1.4], stride: 1.45 },
  { id: 'woman', weight: 1.1, market: 1.3, el: { dress: 'robe', hair: 'bun', over: 'collar', arms: 'hang' }, wet: 'umbrella', swing: 0.7,
    c1: [CL.indigo, CL.white, CL.grey, CL.maroon, '#6a5a78', CL.ochre], c2: [CL.white, CL.indigo, CL.black], c3: [CL.black], speed: [0.95, 1.2], stride: 1.25, h: [0.9, 0.97] },
  { id: 'labourer', weight: 0.8, market: 0.7, el: { dress: 'trousers', hair: 'netknot', hat: 'straw', arms: 'hang' }, wet: 'cape',
    c1: [CL.indigo, CL.grey, CL.brown, CL.white, CL.ochre], c2: [CL.indigo, CL.black, CL.grey, CL.brown], c3: [CL.black], speed: [1.15, 1.45], stride: 1.4 },
  { id: 'porter', weight: 1.0, market: 1.2, el: { dress: 'trousers', hair: 'netknot', hat: 'straw', carry: 'pole', arms: 'pole' }, wet: 'cape', swing: 0.75,
    c1: [CL.indigo, CL.grey, CL.brown, CL.white], c2: [CL.indigo, CL.black, CL.brown], c3: [CL.black], speed: [1.0, 1.25], stride: 1.1, pole: true },
];
/** The boatman at the yuloh, and the passenger sitting cross-legged under the awning. */
export const CREW = {
  boatman: { el: { dress: 'trousers', hair: 'netknot', hat: 'straw', arms: 'pull' }, wet: 'cape', c1: [CL.indigo, CL.grey, CL.brown, CL.black], c2: [CL.indigo, CL.black, CL.grey], c3: [CL.black] },
  passenger: { el: { dress: 'robe', hair: 'netknot', hat: 'cap', cap: 'ming', over: 'collar', pose: 'cross' }, c1: [CL.indigo, CL.grey, CL.brown, '#4a5a6e'], c2: [CL.white, CL.grey], c3: [CL.black] },
};

/**
 * The oil-paper umbrella held up in the right hand (the figure's 'staff' grip at [0.25, 1.05, −0.25]):
 * a shaft of bamboo leaning in over the head, a shallow cone of oiled paper on 28 ribs, the paper
 * sagging a little between them, the rib tips standing out of its edge, the stretchers under it from
 * a runner on the shaft.
 */
function umbrella(add) {
  const grip = [0.25, 0.98, -0.25], top = [0.07, 2.02, -0.08];
  const ax = [top[0] - grip[0], top[1] - grip[1], top[2] - grip[2]], la = Math.hypot(...ax), u = ax.map((v) => v / la);
  // a frame round the shaft
  const t1 = norm(cross(u, [0, 0, 1])), t2 = cross(u, t1);
  const P = (r, th, h) => [top[0] + (t1[0] * Math.cos(th) + t2[0] * Math.sin(th)) * r + u[0] * h, top[1] + (t1[1] * Math.cos(th) + t2[1] * Math.sin(th)) * r + u[1] * h, top[2] + (t1[2] * Math.cos(th) + t2[2] * Math.sin(th)) * r + u[2] * h];
  const N = 28, R = 0.54, drop = 0.2;
  const paper = [], wood = [];
  for (let k = 0; k < N; k++) {
    const a0 = k / N * Math.PI * 2, a1 = (k + 1) / N * Math.PI * 2, am = (a0 + a1) / 2;
    for (let j = 0; j < 4; j++) {
      const r0 = R * j / 4, r1 = R * (j + 1) / 4, h = (r) => -drop * r / R, sag = (r) => -0.018 * r / R;
      const A = P(r0, a0, h(r0)), B = P(r1, a0, h(r1)), C = P(r1, am, h(r1) + sag(r1)), D = P(r0, am, h(r0) + sag(r0)), E = P(r1, a1, h(r1)), F = P(r0, a1, h(r0));
      paper.push(...A, ...B, ...C, ...A, ...C, ...D, ...D, ...C, ...E, ...D, ...E, ...F);
    }
    // the rib under the paper and its tip beyond the edge; the stretcher from the runner
    const tip = P(R + 0.025, a0, -drop - 0.008), root = P(0.02, a0, -0.012), mid = P(R * 0.45, a0, -drop * 0.45 - 0.012), runner = P(0.016, a0, -0.3);
    beam(wood, root, tip, 0.0045); beam(wood, runner, mid, 0.0035);
  }
  const under = []; for (let i = 0; i < paper.length; i += 9) under.push(paper[i], paper[i + 1], paper[i + 2], paper[i + 6], paper[i + 7], paper[i + 8], paper[i + 3], paper[i + 4], paper[i + 5]);
  // (the underside a hair below the top face)
  for (let i = 0; i < under.length; i += 3) { under[i] -= u[0] * 0.004; under[i + 1] -= u[1] * 0.004; under[i + 2] -= u[2] * 0.004; }
  add('cloth', flat(paper), { slot: SLOT.c3 });
  add('cloth', flat(under), { slot: SLOT.c3, col: [0.78, 0.74, 0.66] });
  // the shaft from below the hand to the knob over the paper, the runner, the knob
  beam(wood, [grip[0] - u[0] * 0.14, grip[1] - u[1] * 0.14, grip[2] - u[2] * 0.14], [top[0] + u[0] * 0.05, top[1] + u[1] * 0.05, top[2] + u[2] * 0.05], 0.011, 6);
  beam(wood, P(0, 0, -0.27), P(0, 0, -0.34), 0.02, 8);
  beam(wood, P(0, 0, 0.02), P(0, 0, 0.075), 0.018, 8);
  add('wood', flat(wood), { col: factor('wood', 'bamboo_culm', 0.95) });
}
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };
/** A thin prism of n sides from p to q (flat triangles into out). */
function beam(out, p, q, r, n = 4) {
  const d = norm([q[0] - p[0], q[1] - p[1], q[2] - p[2]]), t1 = norm(cross(d, Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])), t2 = cross(d, t1);
  const ring = (c) => Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2; return [c[0] + (t1[0] * Math.cos(a) + t2[0] * Math.sin(a)) * r, c[1] + (t1[1] * Math.cos(a) + t2[1] * Math.sin(a)) * r, c[2] + (t1[2] * Math.cos(a) + t2[2] * Math.sin(a)) * r]; });
  const A = ring(p), B = ring(q);
  for (let k = 0; k < n; k++) { const k1 = (k + 1) % n; out.push(...A[k], ...A[k1], ...B[k1], ...A[k], ...B[k1], ...B[k]); }
  for (let k = 1; k + 1 < n; k++) { out.push(...A[0], ...A[k + 1], ...A[k], ...B[0], ...B[k], ...B[k + 1]); }
}

/**
 * The walkers' set (variants by name: `${id}|${dry|wet}|${near|far}`, the crew's `boatman|…`,
 * `passenger|…`) into the set builder sb.
 */
export function walkerShapes(sb) {
  const kinds = [...WALKERS.map((k) => [k.id, k]), ['boatman', CREW.boatman], ['passenger', CREW.passenger]];
  for (const [id, k] of kinds) for (const wet of k.wet ? [false, true] : [false]) for (const far of [false, true]) {
    const v = sb.variant(`${id}|${wet ? 'wet' : 'dry'}|${far ? 'far' : 'near'}`);
    const el = { ...k.el };
    let cape = null, extra = null;
    if (wet && k.wet === 'umbrella') { el.arms = 'staff'; extra = umbrella; }
    if (wet && k.wet === 'cape') { el.over = 'cloak'; cape = 'thatch_palm'; }
    addFigure(sb, v, figure, el, { far, cape, extra });
  }
}

// ── what floats ──────────────────────────────────────────────────────────────
/**
 * The boats: the covered boat (its awning of matting in two hoods) and the open cargo boat with
 * sacks and baskets, from the canal boat of the ming style (src/styles/ming/index.js boat) — its
 * sculling oar left out (the movers' own oar sways on the pin) — and the oar itself. Built at
 * 7 m, bow toward −z, the waterline at y 0. Variants `covered|near`, `covered|far`, `cargo|…`, `oar`.
 */
export const BOAT = { L: 7, pin: [0.2, 0.774, 3.15], deck: 0.57, stern: 2.35, passenger: [-0.05, 0.1, -0.3] };
export function boatShapes(sb) {
  const got = [];
  STYLES.ming.elements.boat({ at: [0, 0], dir: [0, 1], len: BOAT.L, y: 0 }, { bag: { add: (m, g) => got.push([m, g]) }, col: { circle() {}, box() {} } });
  const [hull, mat, tim] = got.map(([, g]) => g);
  const TB = 36 * 3, nb = tim.attributes.position.array.length / TB;     // the details are beams of 36 vertices each
  const beams = (keep) => { const P = tim.attributes.position.array, Nn = tim.attributes.normal.array, pos = [], nor = []; for (let b = 0; b < nb; b++) if (keep(b)) for (let i = b * TB; i < (b + 1) * TB; i++) { pos.push(P[i]); nor.push(Nn[i]); } return { pos, nor }; };
  // (the last three beams the oar's pin, the oar, the deck pole; before them the awning's 60 hoops: ming/index.js boat)
  const ok = nb === 108;
  const oar = nb - 2, hoops = (b) => b >= nb - 63 && b < nb - 3;
  const wood = factor('wood', 'timber');
  for (const kind of ['covered', 'cargo']) for (const far of [false, true]) {
    const v = sb.variant(`${kind}|${far ? 'far' : 'near'}`);
    sb.addPiece(v, 'wood', hull, { slot: SLOT.c1, col: wood });
    if (!far) sb.addPiece(v, 'wood', beams((b) => ok && b !== oar && (kind === 'covered' || !hoops(b))), { slot: SLOT.c1, col: [0.92, 0.92, 0.92] });
    if (kind === 'covered') sb.addPiece(v, 'fibre', mat, { slot: SLOT.c2, col: factor('fibre', 'reed_mat') });
    else {
      // the cargo: sacks of rice stacked amidships, baskets fore and aft
      const life = STYLES.life.elements;
      const put = (fn, el) => { const g2 = []; fn({ ...el }, { bag: { add: (m, g) => g2.push([m, g]) }, col: { circle() {}, box() {}, rect() {} } }); for (const [m, g] of g2) if (!far || m !== 'hide_tan') sb.addPiece(v, /wicker|sacking/.test(m) ? 'fibre' : 'wood', g, { slot: m === 'sacking' ? SLOT.c3 : SLOT.none, col: factor(/wicker|sacking/.test(m) ? 'fibre' : 'wood', m) }); };
      put(life.sacks, { t: 'sacks', at: [0, -0.7], y: 0.09, rot: 0, n: 5, seed: 11 });
      put(life.sacks, { t: 'sacks', at: [0, 0.55], y: 0.09, rot: Math.PI, n: 3, seed: 12 });
      put(life.basket, { t: 'basket', at: [0.25, -2.05], y: 0.36, rot: 0, n: 2, seed: 7, goods: 'hide_tan' });
      put(life.basket, { t: 'basket', at: [-0.3, 1.6], y: 0.36, rot: 0, n: 1, seed: 9, goods: 'hide_tan' });
    }
  }
  // the yuloh: its frame at the pin, the handle forward (−z) up to the boatman's hands, the loom bent at the
  // pin and running aft down into the water to a long flat blade
  {
    const v = sb.variant('oar'), w = [];
    const H = [-0.2, 0.86, -0.78], K = [0, 0.02, 0.18], B0 = [0.0, -0.62, 2.25], B1 = [0.0, -0.98, 3.25];
    beam(w, H, [0, 0.07, -0.02], 0.026, 6); beam(w, [0, 0.07, -0.02], K, 0.032, 6); beam(w, K, B0, 0.03, 6);
    // the blade: a flat board, thin across and broad down its length
    const bl = [], hw = 0.085, th = 0.018, d = norm([B1[0] - B0[0], B1[1] - B0[1], B1[2] - B0[2]]);
    const side = [1, 0, 0], up = cross(d, side);
    const C = (p, s, t) => [p[0] + side[0] * s + up[0] * t, p[1] + side[1] * s + up[1] * t, p[2] + side[2] * s + up[2] * t];
    const B0x = [B0[0] - d[0] * 0.25, B0[1] - d[1] * 0.25, B0[2] - d[2] * 0.25];
    const q = [[C(B0x, -th, -hw * 0.5), C(B0x, th, -hw * 0.5), C(B0x, th, hw * 0.5), C(B0x, -th, hw * 0.5)], [C(B1, -th * 0.6, -hw), C(B1, th * 0.6, -hw), C(B1, th * 0.6, hw), C(B1, -th * 0.6, hw)]];
    for (let k = 0; k < 4; k++) { const k1 = (k + 1) % 4; bl.push(...q[0][k], ...q[1][k], ...q[1][k1], ...q[0][k], ...q[1][k1], ...q[0][k1]); }
    bl.push(...q[1][0], ...q[1][2], ...q[1][1], ...q[1][0], ...q[1][3], ...q[1][2]);
    // the rope from the handle down to the deck (it pulls the handle back as the sculler works it)
    beam(w, [H[0] + 0.02, H[1] - 0.03, H[2]], [-0.15, -0.2, -0.95], 0.008, 4);
    sb.addPiece(v, 'wood', flat(w), { slot: SLOT.c1, col: factor('wood', 'timber', 0.9) });
    sb.addPiece(v, 'wood', flat(bl), { slot: SLOT.c1, col: factor('wood', 'timber', 0.75) });
  }
}
void LIMB;
