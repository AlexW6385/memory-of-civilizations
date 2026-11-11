// Ming–Qing Beijing — the moving life of the lanes and the shop street (docs/settlements/qing-beijing.md
// §16): people walking the hutong, the ring street and the avenue south of the moat in Qing dress —
// men in the long gown (changpao) with the queue and the skullcap, women in the long gown or the
// jacket, porters, water carriers with their pails, boys, bannermen on patrol — and, among them, the
// beasts of the street: a donkey with its panniers, a camel with the coal on its pack saddle, a
// Peking cart behind its horse. Data for the engine's movers (src/engine/movers.js), read in its
// worker (src/engine/movers-worker.js): the ways (from layout.js), who walks. No boats (the moat
// carries none), and no walkers in the palace's courts (a few still figures stand there:
// life.js).
//
// What the engine's walkers can and cannot do (src/engine/movers-gpu.js): a figure's legs and arms
// swing about the origin by the sign of x, so a driver cannot stand a metre off a beast and keep
// walking: the drivers of the donkey, the camel and the cart walk in a fixed stride (the pose
// 'step') beside their beasts, whose own legs swing (the leg triangles of the beast, below the
// belly, tagged as legs). The cart's wheels are solid planks (the shader cannot turn them).

import { RADIUS, MOAT, RING, AVENUE, TEMPLE, NOTCH, SHOP_APRONS, lanes, rectsMeet, inPalace, shopRows } from './layout.js';
import { SHOP_SITES } from './shops.js';
import '../../styles/qing/index.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { animal } from '../../objects/animals.js';
import { pekingCart } from '../../styles/qing/street.js';
import { lathe } from '../../core/geom.js';
import { addFigure, factor, flat, splitTris, bounds, SLOT, LIMB } from '../../engine/movers-kit.js';

// ── how many, how fast ───────────────────────────────────────────────────────
export const PARAMS = {
  walkers: {
    day: 34, night: 3, rain: 0.6,        // within reach of the visitor (night: hour from ENV.night; rain thins them: the hutong empties)
    reach: 150, spawnMin: 28,
    far: 42,
  },
  boats: { count: 0, reach: 0, spawnMin: 0, far: 0, speed: [1, 1], bridgeSpeed: 1 },
  water: MOAT ? -1.6 : 0,
};

// ── the ways ─────────────────────────────────────────────────────────────────
/** The share of the length of a way that has shop booths along it (shops.js): the avenue by day is the market. */
function shopShare(r) {
  let n = 0;
  for (const s of SHOP_SITES) if (s.at[0] >= r[0] - 2 && s.at[0] <= r[2] + 2 && s.at[1] >= r[1] - 2 && s.at[1] <= r[3] + 2) n++;
  for (const row of shopRows()) for (const sh of row.shops) if (Math.abs(row.front) >= r[0] - 4 && row.front >= r[0] - 4 && row.front <= r[2] + 4 && (sh.z0 + sh.z1) / 2 >= r[1] && (sh.z0 + sh.z1) / 2 <= r[3]) n += 1.4;
  const L = Math.max(r[2] - r[0], r[3] - r[1]);
  return Math.min(1, n * 7 / L);
}
const clipRect = (r, R) => {
  // (the graph is clipped to the disc by graphFromRects; the rectangles are kept whole)
  void R; return r;
};
/**
 * The ways walked: the hutong and the streets from layout.js, the street round the moat and the
 * avenue south of it. Not the band between the moat and the palace wall, not the palace's courts, not
 * the temple's walled court.
 */
export function walkways() {
  const rects = [];
  const push = (r, weight, kind) => { if (r[2] - r[0] < 1 || r[3] - r[1] < 1) return; rects.push({ r: clipRect(r, RADIUS), weight, market: shopShare(r), kind }); };
  for (const l of lanes()) {
    const w = Math.min(l[2] - l[0], l[3] - l[1]);
    // the north–south streets (8 m) busier than the lanes (5 m)
    push(l, w > 6 ? 1.1 : 0.7, w > 6 ? 'street' : 'lane');
  }
  const [a0, b0, a1, b1] = MOAT.outer;
  // the ring street, its four sides
  for (const r of [[RING[0], RING[1], RING[2], b0], [RING[0], b1, -NOTCH.x, RING[3]], [NOTCH.x, b1, RING[2], RING[3]], [RING[0], b0, a0, b1], [a1, b0, RING[2], b1]]) push(r, 1.0, 'street');
  push(AVENUE, 1.7, 'street');
  // the paved aprons before the shop fronts (the shoppers stand and walk there)
  for (const r of SHOP_APRONS) push(r, 0.9, 'street');
  return { rects, links: [], clip: RADIUS - 14 };
}
/** No canals: the moat carries no boats. */
export function waterways() { return { rects: [], bridges: [], clip: RADIUS - 18 }; }
export async function staticBoats() { return []; }
void TEMPLE; void rectsMeet; void inPalace;

// ── who walks ────────────────────────────────────────────────────────────────
// After the dress of the Qing capital (§16): the queue from the Order of 1645, the skullcap with its
// button, the long gown (changpao) with a short jacket (magua) over it, the women of the banners in
// the long gown, the Han women in jacket and trousers; porters and carters in short jacket and
// trousers, the felt hat of the carters. In the rain the robed walk under oil-paper umbrellas, the
// porters and carters wear the palm-fibre cape.
const CL = { indigo: 'cloth_indigo', grey: 'cloth_grey', brown: 'cloth_brown', white: 'cloth_white', black: 'cloth_black', ochre: 'cloth_ochre', maroon: 'cloth_maroon', green: 'cloth_green', red: 'cloth_red' };
const UMBRELLA = ['#a8834a', '#9b6c3c', '#8a7a4a', '#6e7a52', '#a35a3a'];
export const WALKERS = [
  // the gentleman: gown of dark blue, grey or brown, the black jacket over it, the skullcap
  { id: 'gentleman', weight: 1.1, market: 1.2, el: { dress: 'robe', hair: 'shaven', hat: 'cap', over: 'collar', arms: 'hang' }, queue: true, button: true, wet: 'umbrella',
    c1: [CL.indigo, CL.grey, CL.brown, '#4a5a6e', CL.indigo], c2: [CL.black, CL.black, CL.indigo], c3: [CL.black], speed: [1.0, 1.25], stride: 1.45 },
  // the shopman / townsman: shorter gown or jacket and trousers, sash
  { id: 'townsman', weight: 1.5, market: 1.6, el: { dress: 'robe', hair: 'shaven', hat: 'cap', over: 'sash', arms: 'hang' }, queue: true, button: true, wet: 'umbrella',
    c1: [CL.indigo, CL.indigo, CL.grey, CL.brown, CL.white], c2: [CL.black, CL.indigo, CL.brown, CL.white], c3: [CL.black, CL.black, CL.indigo], speed: [1.1, 1.4], stride: 1.45 },
  // the women: the long gown of the banners, the hair in the bun (the banner headdress is not made)
  { id: 'woman', weight: 1.0, market: 1.1, el: { dress: 'robe', hair: 'bun', over: 'collar', arms: 'hang' }, wet: 'umbrella', swing: 0.7,
    c1: [CL.indigo, CL.maroon, CL.green, '#6a5a78', CL.ochre, CL.grey], c2: [CL.white, CL.indigo, CL.black, CL.red], c3: [CL.black], speed: [0.9, 1.15], stride: 1.25, h: [0.9, 0.96] },
  // the Han woman and the servant: jacket and trousers
  { id: 'servant', weight: 0.7, market: 0.7, el: { dress: 'trousers', hair: 'bun', arms: 'hang' }, swing: 0.7,
    c1: [CL.indigo, CL.grey, CL.brown, CL.ochre], c2: [CL.indigo, CL.black, CL.grey], c3: [CL.black], speed: [1.0, 1.25], stride: 1.3, h: [0.9, 0.97] },
  // the labourer / carter: short jacket, trousers, the felt cap
  { id: 'labourer', weight: 0.8, market: 0.6, el: { dress: 'trousers', hair: 'shaven', hat: 'cap', arms: 'hang' }, queue: true, wet: 'cape',
    c1: [CL.indigo, CL.grey, CL.brown, CL.ochre, CL.white], c2: [CL.indigo, CL.black, CL.grey, CL.brown], c3: [CL.black, CL.brown], speed: [1.15, 1.45], stride: 1.4 },
  // the porter with the shoulder pole and two baskets (greens, coal balls, bundles)
  { id: 'porter', weight: 0.9, market: 1.3, el: { dress: 'trousers', hair: 'shaven', hat: 'cap', carry: 'pole', arms: 'pole' }, queue: true, wet: 'cape', swing: 0.75,
    c1: [CL.indigo, CL.grey, CL.brown, CL.white], c2: [CL.indigo, CL.black, CL.brown], c3: [CL.black, CL.brown], speed: [1.0, 1.25], stride: 1.1, pole: true },
  // the water carrier with two pails on the pole (the wells of the hutong)
  { id: 'watercarrier', weight: 0.5, market: 0.1, el: { dress: 'trousers', hair: 'shaven', hat: 'cap', carry: 'pails', arms: 'pole' }, queue: true, wet: 'cape', swing: 0.75,
    c1: [CL.indigo, CL.grey, CL.brown], c2: [CL.indigo, CL.black, CL.brown], c3: [CL.black], speed: [0.95, 1.2], stride: 1.05, pole: true },
  // the boy: the gown, a small queue, the cap
  { id: 'boy', weight: 0.45, market: 0.3, el: { dress: 'robe', hair: 'shaven', hat: 'cap', arms: 'hang' }, queue: true, button: true,
    c1: [CL.indigo, CL.grey, CL.brown, CL.ochre, CL.red], c2: [CL.black, CL.white], c3: [CL.black, CL.red], speed: [1.2, 1.7], stride: 1.0, h: [0.6, 0.72], swing: 1.1 },
  // the bannerman on patrol: gown and jacket, the staff at the right hand
  { id: 'bannerman', weight: 0.35, market: 0.5, el: { dress: 'robe', hair: 'shaven', hat: 'cap', over: 'sash', arms: 'staff', carry: 'staff', staffMat: 'timber', len: 1.8 }, queue: true, button: true,
    c1: [CL.indigo, CL.ochre, CL.red], c2: [CL.black, CL.white], c3: [CL.black], speed: [0.95, 1.15], stride: 1.5 },
  // the beasts (their drivers beside them)
  { id: 'donkey', weight: 0.3, market: 0.4, beast: true, c1: [CL.indigo, CL.brown, CL.ochre], c2: [CL.grey], c3: [CL.black], speed: [0.95, 1.2], stride: 1.15, h: [0.95, 1.05], swing: 0 },
  { id: 'camel', weight: 0.28, market: 0.1, beast: true, c1: [CL.indigo, CL.brown], c2: [CL.grey], c3: [CL.black], speed: [0.85, 1.05], stride: 1.7, h: [0.97, 1.03], swing: 0 },
  { id: 'cart', weight: 0.25, market: 0.5, beast: true, c1: [CL.indigo], c2: [CL.grey], c3: [CL.black], speed: [1.1, 1.5], stride: 1.5, h: [0.98, 1.02], swing: 0 },
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
/**
 * The oil-paper umbrella held up in the right hand (the figure's 'staff' grip at [0.25, 1.05, −0.25]):
 * a bamboo shaft leaning in over the head, a shallow cone of oiled paper on 20 ribs, the rib tips
 * standing out of its edge.
 */
function umbrella(add) {
  const grip = [0.25, 0.98, -0.25], top = [0.07, 2.0, -0.08];
  const ax = [top[0] - grip[0], top[1] - grip[1], top[2] - grip[2]], la = Math.hypot(...ax), u = ax.map((v) => v / la);
  const t1 = norm(cross(u, [0, 0, 1])), t2 = cross(u, t1);
  const P = (r, th, h) => [top[0] + (t1[0] * Math.cos(th) + t2[0] * Math.sin(th)) * r + u[0] * h, top[1] + (t1[1] * Math.cos(th) + t2[1] * Math.sin(th)) * r + u[1] * h, top[2] + (t1[2] * Math.cos(th) + t2[2] * Math.sin(th)) * r + u[2] * h];
  const N = 20, R = 0.52, drop = 0.19, paper = [], wood = [];
  for (let k = 0; k < N; k++) {
    const a0 = k / N * Math.PI * 2, a1 = (k + 1) / N * Math.PI * 2;
    for (let j = 0; j < 3; j++) {
      const r0 = R * j / 3, r1 = R * (j + 1) / 3, h = (r) => -drop * r / R;
      const A = P(r0, a0, h(r0)), B = P(r1, a0, h(r1)), C = P(r1, a1, h(r1)), D = P(r0, a1, h(r0));
      paper.push(...A, ...B, ...C, ...A, ...C, ...D);
    }
    beam(wood, P(0.02, a0, -0.012), P(R + 0.02, a0, -drop - 0.008), 0.0045, 4);
  }
  const under = [];
  for (let i = 0; i < paper.length; i += 9) under.push(paper[i], paper[i + 1], paper[i + 2], paper[i + 6], paper[i + 7], paper[i + 8], paper[i + 3], paper[i + 4], paper[i + 5]);
  for (let i = 0; i < under.length; i += 3) { under[i] -= u[0] * 0.004; under[i + 1] -= u[1] * 0.004; under[i + 2] -= u[2] * 0.004; }
  add('cloth', flat(paper), { slot: SLOT.c3 });
  add('cloth', flat(under), { slot: SLOT.c3, col: [0.78, 0.74, 0.66] });
  beam(wood, [grip[0] - u[0] * 0.14, grip[1] - u[1] * 0.14, grip[2] - u[2] * 0.14], [top[0] + u[0] * 0.05, top[1] + u[1] * 0.05, top[2] + u[2] * 0.05], 0.011, 6);
  add('wood', flat(wood), { col: factor('wood', 'bamboo_culm', 0.95) });
}

/** A geometry (or { pos, nor }) with every vertex moved by (dx, dz), as { pos, nor }. */
function shifted(g, dx, dy, dz, yaw = 0) {
  const P = g.attributes ? (g.index ? g.toNonIndexed() : g).attributes.position.array : g.pos, N = g.attributes ? (g.index ? g.toNonIndexed() : g).attributes.normal.array : g.nor;
  const pos = new Float32Array(P.length), nor = new Float32Array(N.length), c = Math.cos(yaw), s = Math.sin(yaw);
  for (let i = 0; i < P.length; i += 3) {
    pos[i] = P[i] * c + P[i + 2] * s + dx; pos[i + 1] = P[i + 1] + dy; pos[i + 2] = -P[i] * s + P[i + 2] * c + dz;
    nor[i] = N[i] * c + N[i + 2] * s; nor[i + 1] = N[i + 1]; nor[i + 2] = -N[i] * s + N[i + 2] * c;
  }
  return { pos, nor };
}
/** A set builder that moves everything added through it (the drivers stand beside their beasts). */
const offset = (sb, dx, dz, yaw = 0) => ({ addPiece: (v, group, g, o) => sb.addPiece(v, group, shifted(g, dx, 0, dz, yaw), o), variant: (n) => sb.variant(n) });

/** The beast's pieces as [material, geometry] (a still beast of src/objects/animals.js, head toward −z, built at the origin). */
function beastPieces(el) {
  const got = [];
  animal({ t: 'animal', at: [0, 0], y: 0, rot: 0, graze: false, ...el }, { bag: { add: (m, g) => got.push([m, g.index ? g.toNonIndexed() : g]) }, col: { circle() {}, rect() {} } });
  return got;
}
const GROUP_OF = (m) => (/wicker|sacking|reed|thatch/.test(m) ? 'fibre' : /timber|wood|bamboo/.test(m) ? 'wood' : /^skin/.test(m) ? 'skin' : 'cloth');
/**
 * Add a beast's pieces to variant v: those below `legTop` (the legs, hooves and pads) swing as legs, the
 * rest rigid; the beast's own colours fixed.
 */
function addBeast(sb, v, pieces, legTop, far) {
  for (const [m, g] of pieces) {
    if (far && (m === 'ivory' || m === 'bronze' || m === 'hide_black' && g.attributes.position.count < 200)) continue;
    const group = GROUP_OF(m), col = factor(group, m, 1);
    const [lo, hi] = splitTris(g, (x, y) => y < legTop);
    if (lo.pos.length) sb.addPiece(v, group, lo, { col, limb: LIMB.legs });
    if (hi.pos.length) sb.addPiece(v, group, hi, { col });
  }
}

/** The Peking cart's pieces, the wheels made solid, placed behind the horse (the horse at the origin, the cart's centre 2.95 m behind it). */
function cartPieces() {
  const got = [];
  pekingCart({ t: 'peking_cart', at: [0, 0], y: 0, rot: 0, beast: 'none', hood: 'cloth_indigo' }, { bag: { add: (m, g) => got.push([m, g.index ? g.toNonIndexed() : g]) }, col: { circle() {}, rect() {} } });
  const out = [];
  const r = 0.62, axW = 0.98;
  for (const [m, g] of got) {
    // the wheels' spokes, hubs, rims and tyres out (the cab is clear of them), the axle's ends too
    const [wheel, rest] = splitTris(g, (x, y, z) => Math.abs(x) > 0.84 && Math.abs(x) < 1.14 && (y - r) * (y - r) + z * z < (r + 0.08) * (r + 0.08));
    void wheel;
    if (rest.pos.length) out.push([m, rest]);
  }
  const add = (m, g) => out.push([m, { pos: g.attributes.position.array, nor: g.attributes.normal.array }]);
  for (const s of [-1, 1]) {
    const xw = s * axW;
    const disc = lathe([[0.001, -0.045], [r - 0.012, -0.045], [r - 0.012, 0.045], [0.001, 0.045]], 28); disc.rotateZ(Math.PI / 2); disc.translate(xw, r, 0);
    const tyre = lathe([[r + 0.014, -0.04], [r + 0.014, 0.04], [r - 0.012, 0.04], [r - 0.012, -0.04], [r + 0.014, -0.04]], 28); tyre.rotateZ(Math.PI / 2); tyre.translate(xw, r, 0);
    const hub = lathe([[0.001, -0.17], [0.08, -0.17], [0.12, -0.07], [0.12, 0.09], [0.07, 0.17], [0.001, 0.17]], 12); hub.rotateZ(Math.PI / 2); hub.translate(xw, r, 0);
    const boss = lathe([[0.001, 0.0], [0.17, 0.0], [0.17, 0.05], [0.001, 0.05]], 14); boss.rotateZ(Math.PI / 2); boss.translate(xw + s * 0.045, r, 0);
    add('wood_dark', disc.toNonIndexed ? (disc.index ? disc.toNonIndexed() : disc) : disc);
    add('iron', tyre.index ? tyre.toNonIndexed() : tyre);
    add('wood_dark', hub.index ? hub.toNonIndexed() : hub);
    add('iron', boss.index ? boss.toNonIndexed() : boss);
  }
  return out;
}

const CART_Z = 2.95;
/**
 * The walkers' set (variants by name: `${id}|${dry|wet}|${near|far}`) into the set builder sb: the people
 * (the umbrella in the rain, the rain cape), and the three beasts with their drivers.
 */
export function walkerShapes(sb) {
  for (const k of WALKERS) {
    if (k.beast) continue;
    for (const wet of k.wet ? [false, true] : [false]) for (const far of [false, true]) {
      const v = sb.variant(`${k.id}|${wet ? 'wet' : 'dry'}|${far ? 'far' : 'near'}`);
      const el = { ...k.el };
      let cape = null;
      const extras = [];
      if (wet && k.wet === 'umbrella') { el.arms = 'staff'; extras.push(umbrella); }
      if (wet && k.wet === 'cape') { el.over = 'cloak'; cape = 'thatch_palm'; }
      if (k.queue) extras.push((add) => queue(add, far));
      if (k.button && !(wet && k.wet === 'umbrella')) extras.push(button);
      addFigure(sb, v, figure, el, { far, cape, extra: (add) => { for (const f of extras) f(add); } });
    }
  }
  const driver = (osb, v, far, cloth, dx, dz, yaw = 0) => {
    const S = offset(osb, dx, dz, yaw);
    // (a fixed stride: the legs of a figure beside a beast would swing about the beast's middle: see the head of this file)
    addFigure(S, v, figure, { dress: 'trousers', hair: 'shaven', hat: 'cap', arms: 'staff', carry: 'staff', staffMat: 'timber', len: 1.5, pose: 'step', cloth, cloth2: 'cloth_black' }, {
      far, extra: (add) => { queue((g, geo, o) => add(g, shifted(geo, 0, 0, 0), { ...o, slot: SLOT.none }), far); },
    });
  };
  for (const far of [false, true]) {
    // the donkey with its panniers; the driver walking beside it
    {
      const v = sb.variant(`donkey|dry|${far ? 'far' : 'near'}`), P = beastPieces({ kind: 'donkey', gear: true, seed: 9, mat: 'hide_grey' });
      addBeast(sb, v, P, 0.55, far);
      driver(sb, v, far, 'cloth_indigo', 1.0, -0.1);
    }
    // the camel with its pack saddle and the two sacks of coal
    {
      const v = sb.variant(`camel|dry|${far ? 'far' : 'near'}`), P = beastPieces({ kind: 'camel', gear: true, seed: 4, mat: 'hide_tan' });
      addBeast(sb, v, P, 1.0, far);
      if (!far) { const t = [], bell = [0, 1.0, -1.0]; bead(t, bell, 0.07, 8, 5); sb.addPiece(v, 'cloth', flat(t), { col: factor('cloth', 'bronze', 1) }); }
      driver(sb, v, far, 'cloth_brown', 1.15, -0.4);
    }
    // the Peking cart behind its horse; the carter beside the shafts
    {
      const v = sb.variant(`cart|dry|${far ? 'far' : 'near'}`), P = beastPieces({ kind: 'horse', gear: false, seed: 6, mat: 'hide_brown' });
      addBeast(sb, v, P, 0.8, far);
      for (const [m, g] of cartPieces()) {
        const group = GROUP_OF(m);
        sb.addPiece(v, group, shifted(g, 0, 0, CART_Z), { col: factor(group, m === 'cloth_indigo' ? 'cloth_indigo' : m, 1) });
      }
      driver(sb, v, far, 'cloth_grey', 1.15, 0.2);
    }
  }
}

/** Not used: no boats (kept for the engine's contract). */
export const BOAT = { L: 7, pin: [0, 0, 0], deck: 0, stern: 0, passenger: [0, 0, 0], hull: [1.34, 3.55] };
export function boatShapes() { /* the moat carries none */ }
void UMBRELLA; void bounds;
