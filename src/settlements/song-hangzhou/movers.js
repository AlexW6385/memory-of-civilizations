// Southern Song Lin'an — the moving life (docs/settlements/song-hangzhou.md §12): people in the
// dress of the Song walking the Imperial Way, the lanes and the bridges; the pleasure boats of West
// Lake and the cargo boats of the canals, sculled along their water. Data for the engine's movers
// (src/engine/movers.js, read in its worker): the ways (from ways.js, which reads the town's
// layout), who walks and what floats (as figures of src/objects/figures.js with Song extras: the
// straight-legged futou, flowers and combs in women's hair), and the boats standing in the water.

import { streetEntries, imperialRects, canals, bridges, lakeLanes, lots, RADIUS, LEVEL } from './ways.js';
import { STYLES } from '../../core/build.js';
import '../../objects/index.js';
import { figure } from '../../objects/figures.js';
import { addFigure, factor, flat, SLOT, LIMB } from '../../engine/movers-kit.js';
import { box, beam, lathe, ball, tri, quad, cross, norm, smoothstep } from './bits.js';

// ── how many, how fast ───────────────────────────────────────────────────────
export const PARAMS = {
  walkers: { day: 46, night: 9, rain: 0.7, reach: 160, spawnMin: 28, far: 42 },       // a great city: more than Suzhou by day
  boats: { count: 10, reach: 280, spawnMin: 60, far: 100, speed: [0.9, 1.4], bridgeSpeed: 0.7 },
  water: LEVEL.canal,
};

// ── the ways ─────────────────────────────────────────────────────────────────
const shopsBy = (() => {
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
export function walkways() {
  const iw = imperialRects(), isIw = (r) => iw.some((q) => q[0] === r[0] && q[1] === r[1] && q[2] === r[2] && q[3] === r[3]);
  const rects = streetEntries().map(({ r, kind }) => {
    const w = Math.min(r[2] - r[0], r[3] - r[1]), shops = shopsBy(r), main = isIw(r) ? 3 : kind === 'canal' ? 1.3 : 1;
    // the Imperial Way and the market streets carry the crowd by day, the back lanes few
    return { r, weight: (w > 4 ? 1.6 : 0.5) * (1 + 5 * shops) * main, market: isIw(r) ? 1 : shops, kind: w > 4 ? 'street' : 'lane' };
  });
  const links = [];
  for (const b of bridges()) {
    if (!b.link) continue;
    links.push({ a: b.link.a, b: b.link.b, w: (b.width ?? 3) / 2, kind: 'bridge', weight: 1.2 });
  }
  return { rects, links, clip: RADIUS - 12 };
}

/** The canals and the lake's boat lanes (rectangles along which boats run) and the bridges over them. */
export function waterways() {
  const rects = [...canals().map((r) => ({ r, weight: 1 })), ...lakeLanes().map((r) => ({ r, weight: 1.6 }))];
  const br = bridges().map((b) => ({ at: b.at, half: (b.span ?? 8) / 2 + 0.5 }));
  return { rects, bridges: br, clip: RADIUS - 18 };
}

/** The boats standing in the water (the town's `boat` and `song_boat` elements), which the moving ones keep clear of. */
export async function staticBoats() {
  const { town } = await import('./town.js');
  const out = [];
  for (const p of await town()) for (const e of p.elements) {
    if (e.t !== 'boat' && e.t !== 'song_boat') continue;
    const u = e.dir ?? [Math.sin(e.rot ?? 0), Math.cos(e.rot ?? 0)], L = e.len ?? 7;
    out.push({ c: e.at, u, hl: L / 2 + (e.moor ? 0.2 : 1.6), hw: e.moor ? 1.27 : 0.9 * L / 7 });
  }
  return out;
}

// ── who walks ────────────────────────────────────────────────────────────────
// After the Qingming scroll (Northern Song, but the commoner's dress held through the Southern
// Song) and Wu Zimu's Mengliang lu (each trade known by its headgear and colour): officials in
// round-collared robes of the rank's colour and the straight-legged futou; scholars in long robes
// and the soft kerchief; merchants and townsmen in black or white (the commoners' colours by
// edict) with the plain futou; women in the long beizi over a skirt, flowers in the hair; porters
// and labourers in kerchief, short jacket and trousers; water carriers; flower sellers with
// baskets; monks. In rain umbrellas of oiled paper for the robed, rain capes for the workers.
const CL = { indigo: 'cloth_indigo', grey: 'cloth_grey', brown: 'cloth_brown', white: 'cloth_white', black: 'cloth_black', ochre: 'cloth_ochre', maroon: 'cloth_maroon', green: 'cloth_green', red: 'cloth_red' };
const PURPLE = '#5b3d6e', RANKRED = '#8c2f27', RANKGREEN = '#3f6a4a', RANKBLUE = '#3a6670';       // the colours of the ranks (purple, red, green, blue-green)
const UMBRELLA = ['#a8834a', '#9b6c3c', '#8a7a4a', '#6e7a52', '#a35a3a'];
export const WALKERS = [
  { id: 'official', weight: 0.5, market: 0.7, night: 0.1, el: { dress: 'robe', hair: 'short', hat: 'cap', over: 'sash', arms: 'hang' }, wet: 'umbrella', futou: 'straight',
    c1: [PURPLE, RANKRED, RANKGREEN, RANKBLUE, RANKRED, RANKGREEN], c2: [CL.black, CL.white], c3: [CL.black], speed: [0.95, 1.15], stride: 1.5 },
  { id: 'scholar', weight: 1.0, market: 1.3, night: 0.3, el: { dress: 'robe', hair: 'short', hat: 'cap', over: 'collar', arms: 'hang' }, wet: 'umbrella', futou: 'kerchief',
    c1: [CL.white, CL.white, CL.grey, CL.indigo, '#4a5a6e', CL.brown], c2: [CL.white, CL.grey], c3: [CL.black, CL.indigo], speed: [1.0, 1.25], stride: 1.45 },
  { id: 'merchant', weight: 1.6, market: 1.7, night: 0.4, el: { dress: 'robe', hair: 'short', hat: 'cap', over: 'sash', arms: 'hang' }, wet: 'umbrella', futou: 'plain',
    c1: [CL.black, CL.white, CL.white, CL.brown, CL.grey, CL.indigo], c2: [CL.black, CL.white, CL.brown], c3: [CL.black], speed: [1.1, 1.4], stride: 1.45 },
  { id: 'woman', weight: 1.4, market: 1.5, night: 0.3, el: { dress: 'robe', hair: 'bun', over: 'collar', arms: 'hang' }, wet: 'umbrella', swing: 0.7, flower: true,
    c1: [CL.white, CL.ochre, CL.green, '#6a5a78', CL.maroon, '#b86a5a', CL.indigo], c2: [CL.white, CL.red, CL.green, CL.ochre], c3: [CL.black], speed: [0.9, 1.15], stride: 1.25, h: [0.9, 0.97] },
  { id: 'labourer', weight: 0.9, market: 0.7, night: 0.5, el: { dress: 'trousers', hair: 'short', hat: 'cap', arms: 'hang' }, wet: 'cape', futou: 'kerchief',
    c1: [CL.indigo, CL.grey, CL.brown, CL.white, CL.ochre], c2: [CL.indigo, CL.black, CL.grey, CL.brown], c3: [CL.white, CL.grey, CL.indigo], speed: [1.15, 1.45], stride: 1.4 },
  { id: 'porter', weight: 1.0, market: 1.2, night: 0.2, el: { dress: 'trousers', hair: 'short', hat: 'cap', carry: 'pole', arms: 'pole' }, wet: 'cape', swing: 0.75, pole: true, futou: 'kerchief',
    c1: [CL.indigo, CL.grey, CL.brown, CL.white], c2: [CL.indigo, CL.black, CL.brown], c3: [CL.white, CL.grey], speed: [1.0, 1.25], stride: 1.1 },
  { id: 'waterman', weight: 0.5, market: 0.6, night: 0.1, el: { dress: 'trousers', hair: 'short', hat: 'cap', carry: 'pails', arms: 'pole' }, swing: 0.75, pole: true, futou: 'kerchief',
    c1: [CL.brown, CL.grey, CL.indigo], c2: [CL.brown, CL.black], c3: [CL.white, CL.grey], speed: [0.95, 1.15], stride: 1.05 },
  { id: 'hawker', weight: 0.7, market: 1.4, night: 0.1, el: { dress: 'robe', hair: 'bun', hat: 'none', carry: 'basket', arms: 'head' }, swing: 0.8, flower: true,
    c1: [CL.indigo, CL.grey, CL.brown, CL.white], c2: [CL.white, CL.indigo], c3: [CL.black], speed: [0.9, 1.15], stride: 1.2, h: [0.9, 0.97] },
  { id: 'monk', weight: 0.4, market: 0.5, night: 0.1, el: { dress: 'robe', hair: 'shaven', over: 'shawl', arms: 'hang' },
    c1: [CL.grey, CL.ochre, CL.grey, CL.brown], c2: [CL.ochre, CL.maroon, CL.brown], c3: [CL.black], speed: [0.85, 1.05], stride: 1.45 },
];
/** The boatman at the yuloh, and the passenger sitting cross-legged in the cabin. */
export const CREW = {
  boatman: { el: { dress: 'trousers', hair: 'short', hat: 'cap', arms: 'pull' }, wet: 'cape', futou: 'kerchief', c1: [CL.indigo, CL.grey, CL.brown, CL.white], c2: [CL.indigo, CL.black, CL.grey], c3: [CL.white, CL.grey] },
  passenger: { el: { dress: 'robe', hair: 'short', hat: 'cap', over: 'collar', pose: 'cross' }, futou: 'plain', c1: [CL.white, CL.grey, CL.indigo, '#4a5a6e', CL.ochre], c2: [CL.white, CL.grey], c3: [CL.black] },
};

/** The oil-paper umbrella held up in the right hand: a shallow cone on 20 ribs over a bamboo shaft. */
function umbrella(add) {
  const grip = [0.25, 0.98, -0.25], top = [0.07, 2.02, -0.08];
  const ax = [top[0] - grip[0], top[1] - grip[1], top[2] - grip[2]], la = Math.hypot(...ax), u = ax.map((v) => v / la);
  const t1 = norm(cross(u, [0, 0, 1])), t2 = cross(u, t1);
  const P = (r, th, h) => [0, 1, 2].map((i) => top[i] + (t1[i] * Math.cos(th) + t2[i] * Math.sin(th)) * r + u[i] * h);
  const N = 20, R = 0.56, drop = 0.2;
  const paper = [], wood = [];
  for (let k = 0; k < N; k++) {
    const a0 = k / N * Math.PI * 2, a1 = (k + 1) / N * Math.PI * 2, am = (a0 + a1) / 2;
    for (let j = 0; j < 3; j++) {
      const r0 = R * j / 3, r1 = R * (j + 1) / 3, h = (r) => -drop * r / R, sag = (r) => -0.018 * r / R;
      const A = P(r0, a0, h(r0)), B = P(r1, a0, h(r1)), C = P(r1, am, h(r1) + sag(r1)), D = P(r0, am, h(r0) + sag(r0)), E = P(r1, a1, h(r1)), F = P(r0, a1, h(r0));
      paper.push(...A, ...B, ...C, ...A, ...C, ...D, ...D, ...C, ...E, ...D, ...E, ...F);
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

/**
 * The Song extras of a figure, in its frame (head top at y 1.6–1.7, face toward −z):
 * 'straight': the straight-legged futou of officials — two long flat legs out to either side from
 * the back of the cap; 'plain': the plain futou's short bent lappets behind; 'kerchief': the
 * headcloth's knot and two short tails. Women: a flower and a comb in the hair, a second small
 * flower at the side (Wu Zimu's Lin'an sold flower crowns and fresh flowers).
 */
function extras(k, kind) {
  return (add) => {
    const t = [], tail = [];
    if (kind === 'straight') {
      for (const s of [-1, 1]) box(t, s > 0 ? 0.07 : -0.46, 1.655, 0.045, s > 0 ? 0.46 : -0.07, 1.667, 0.095);
    } else if (kind === 'plain') {
      for (const s of [-1, 1]) box(tail, s * 0.045 - 0.02, 1.56, 0.09, s * 0.045 + 0.02, 1.64, 0.105);
    } else if (kind === 'kerchief') {
      ball(tail, [0, 1.66, 0.105], 0.034, 1, 0.9, 1);
      for (const s of [-1, 1]) box(tail, s * 0.04 - 0.012, 1.5, 0.1, s * 0.04 + 0.012, 1.63, 0.114);
    }
    if (t.length) add('cloth', flat(t), { slot: SLOT.c3 });
    if (tail.length) add('cloth', flat(tail), { slot: SLOT.c3 });
    if (k.flower) {
      const f = [], c = [];
      ball(f, [0.03, 1.585, 0.11], 0.026, 1, 0.8, 1);
      ball(f, [-0.04, 1.6, 0.1], 0.02, 1, 0.8, 1);
      add('cloth', flat(f), { col: factor('cloth', 'cloth_red', 1.1) });
      box(c, -0.045, 1.6, 0.115, 0.045, 1.625, 0.125);                                     // the comb
      add('wood', flat(c), { col: factor('wood', 'lacquer_chestnut', 1.4) });
    }
  };
}

/** The walkers' set (variants by name: `${id}|${dry|wet}|${near|far}`) into the set builder sb. */
export function walkerShapes(sb) {
  const kinds = [...WALKERS.map((k) => [k.id, k]), ['boatman', CREW.boatman], ['passenger', CREW.passenger]];
  for (const [id, k] of kinds) for (const wet of k.wet ? [false, true] : [false]) for (const far of [false, true]) {
    const v = sb.variant(`${id}|${wet ? 'wet' : 'dry'}|${far ? 'far' : 'near'}`);
    const el = { ...k.el };
    let cape = null, ex = null;
    const song = !far && (k.futou || k.flower) ? extras(k, k.futou) : null;
    if (wet && k.wet === 'umbrella') { el.arms = 'staff'; ex = (add) => { umbrella(add); song?.(add); }; }
    else ex = song;
    if (wet && k.wet === 'cape') { el.over = 'cloak'; cape = 'thatch_palm'; }
    addFigure(sb, v, figure, el, { far, cape, extra: ex });
  }
}

// ── what floats ──────────────────────────────────────────────────────────────
// Two boats at 7 m (the engine scales them): 'covered', the painted pleasure boat of West Lake
// (Polo: "from 15 to 20 paces long… flat bottoms and ample breadth of beam… the interior covered
// with ornamental painting in gay colours, with windows all round that can be shut or opened…
// completely furnished with tables and chairs and all the other apparatus for a feast; the roof
// forms a level deck, on which the crew stand, and pole the boat along"), and 'cargo', the open
// canal boat with a matting hood aft and its load (sacks, firewood, wine jars) forward. Bow
// toward −z, waterline y 0; the yuloh of the stern as at Suzhou (the movers' own oar sways on the
// pin) is the variant 'oar'.
export const BOAT = { L: 7, pin: [0.2, 0.774, 3.15], deck: 0.57, stern: 2.35, passenger: [-0.05, 0.1, -0.3], hull: [1.34, 3.55] };
const HL = 3.5;
const Bg = (u) => (u < 0 ? 1.1 - 0.5 * smoothstep(0.5, 1, -u) : 1.1 - 0.3 * smoothstep(0.6, 1, u));      // half-beam over the gunwale
const yG = (u) => (u < 0 ? 0.45 + 0.5 * (-u) ** 3 : 0.45 + 0.18 * u * u);                                 // the sheer
const yB = (u) => -0.28 + 0.3 * smoothstep(0.65, 1, Math.abs(u));                                          // the flat bottom, rising at the ends
const NS = 18;
/** The hull: outer shell, inner shell, the floor, the gunwale cap, the red sheer stripe. Returns { outer, inner, stripe }. */
function hull() {
  const outer = [], inner = [], stripe = [];
  const sec = (i, k) => { const u = -1 + 2 * i / NS, z = u * HL, bg = Bg(u) - k, bb = (Bg(u) - k) * 0.78, yb = yB(u) + k * 1.2, yg = yG(u); return { z, u, bg, bb, yb, yg }; };
  for (let i = 0; i < NS; i++) {
    const a = sec(i, 0), b = sec(i + 1, 0), mid = [0, 0.1, (a.z + b.z) / 2];
    quad(outer, [-a.bb, a.yb, a.z], [a.bb, a.yb, a.z], [b.bb, b.yb, b.z], [-b.bb, b.yb, b.z], mid);
    quad(outer, [a.bb, a.yb, a.z], [a.bg, a.yg, a.z], [b.bg, b.yg, b.z], [b.bb, b.yb, b.z], mid);
    quad(outer, [-a.bb, a.yb, a.z], [-a.bg, a.yg, a.z], [-b.bg, b.yg, b.z], [-b.bb, b.yb, b.z], mid);
    const c = sec(i, 0.06), d = sec(i + 1, 0.06);
    quad(inner, [-c.bb, c.yb, c.z], [c.bb, c.yb, c.z], [d.bb, d.yb, d.z], [-d.bb, d.yb, d.z], [0, -5, mid[2]]);
    quad(inner, [c.bb, c.yb, c.z], [c.bg, c.yg, c.z], [d.bg, d.yg, d.z], [d.bb, d.yb, d.z], [5, 0.2, mid[2]]);
    quad(inner, [-c.bb, c.yb, c.z], [-c.bg, c.yg, c.z], [-d.bg, d.yg, d.z], [-d.bb, d.yb, d.z], [-5, 0.2, mid[2]]);
    for (const s of [-1, 1]) {                                                                              // the gunwale cap and the stripe
      quad(inner, [s * a.bg, a.yg, a.z], [s * c.bg, c.yg, c.z], [s * d.bg, d.yg, d.z], [s * b.bg, b.yg, b.z], [0, -5, mid[2]]);
      const o = 0.012, y0 = (v) => v.yg - 0.2, y1 = (v) => v.yg - 0.05;
      quad(stripe, [s * (a.bg + o), y0(a), a.z], [s * (a.bg + o), y1(a), a.z], [s * (b.bg + o), y1(b), b.z], [s * (b.bg + o), y0(b), b.z], [0, 0.2, mid[2]]);
    }
  }
  for (const [i, sgn] of [[0, -1], [NS, 1]]) {                                                              // the transoms
    const a = sec(i, 0);
    quad(outer, [-a.bb, a.yb, a.z], [a.bb, a.yb, a.z], [a.bg, a.yg, a.z], [-a.bg, a.yg, a.z], [0, 0.1, a.z - sgn * 3]);
  }
  return { outer, inner, stripe };
}

/** The cabin of the pleasure boat: posts, sill panels, lattice windows, roof deck with its eaves and rail, the curtain, the lanterns, the pennant. Pieces by material. */
function cabin(far) {
  const red = [], panel = [], lattice = [], roof = [], trim = [], silk = [], lamps = [], gold = [], wood = [];
  const z0 = -1.75, z1 = 1.45, W = 1.0, yS = 0.45, yT = 1.95, yw0 = 0.88, yw1 = 1.72;
  const zs = [z0, z0 + 0.8, z0 + 1.6, z0 + 2.4, z1];
  for (const s of [-1, 1]) for (const z of zs) box(red, s * W - 0.045, yS, z - 0.045, s * W + 0.045, yT, z + 0.045);
  for (const x of [-W, W]) { /* (the corner posts are those above) */ void x; }
  for (const z of [z0, z1]) for (const x of [-W / 2, 0, W / 2]) box(red, x - 0.04, yS, z - 0.04, x + 0.04, yT, z + 0.04);
  // the front wall (solid with a small window), the rear open (door posts above, a curtain)
  box(panel, -W, yS, z0 - 0.02, W, yw0, z0 + 0.02); box(panel, -W, yw1, z0 - 0.02, W, yT, z0 + 0.02);
  box(lattice, -W, yw0, z0 - 0.015, W, yw1, z0 + 0.015);
  for (let j = 0; j < zs.length - 1; j++) for (const s of [-1, 1]) {
    const a = zs[j] + 0.045, b = zs[j + 1] - 0.045, x = s * W;
    box(panel, x - 0.02, yS, a, x + 0.02, yw0, b);                                          // the sill panel
    box(panel, x - 0.02, yw1, a, x + 0.02, yT, b);                                          // the lintel panel
    if (far) { box(lattice, x - 0.012, yw0, a, x + 0.012, yw1, b); continue; }
    box(red, x - 0.025, yw0, a, x + 0.025, yw0 + 0.04, b); box(red, x - 0.025, yw1 - 0.04, a, x + 0.025, yw1, b);          // the window's rails
    const n = Math.round((b - a) / 0.1);
    for (let k = 1; k < n; k++) { const z = a + (b - a) * k / n; box(lattice, x - 0.012, yw0 + 0.04, z - 0.01, x + 0.012, yw1 - 0.04, z + 0.01); }
    box(lattice, x - 0.012, (yw0 + yw1) / 2 - 0.01, a, x + 0.012, (yw0 + yw1) / 2 + 0.01, b);                                 // a cross rail
  }
  // the roof deck: a level slab with a little camber, the eaves, the upturned corners, the low rail the crew stand behind
  const rz0 = z0 - 0.3, rz1 = z1 + 0.3, rx = W + 0.22;
  box(roof, -rx, yT, rz0, rx, yT + 0.09, rz1);
  for (const [x0, x1, za, zb] of [[-rx, rx, rz0 - 0.02, rz0 + 0.04], [-rx, rx, rz1 - 0.04, rz1 + 0.02], [-rx - 0.02, -rx + 0.04, rz0, rz1], [rx - 0.04, rx + 0.02, rz0, rz1]]) box(trim, x0, yT - 0.12, za, x1, yT + 0.09, zb);
  for (const [x, z] of [[-rx, rz0], [rx, rz0], [-rx, rz1], [rx, rz1]]) box(trim, x - 0.04, yT + 0.06, z - 0.04, x + 0.04, yT + 0.24, z + 0.04);   // the corners turned up
  if (!far) {
    for (const s of [-1, 1]) for (let k = 0; k <= 5; k++) { const z = rz0 + 0.25 + (rz1 - rz0 - 0.5) * k / 5; box(wood, s * (rx - 0.1) - 0.015, yT + 0.09, z - 0.015, s * (rx - 0.1) + 0.015, yT + 0.4, z + 0.015); }
    for (const s of [-1, 1]) box(wood, s * (rx - 0.1) - 0.02, yT + 0.4, rz0 + 0.2, s * (rx - 0.1) + 0.02, yT + 0.43, rz1 - 0.2);
    // the valance of silk along the front's eave and the sides
    box(silk, -rx, yT - 0.32, rz0 - 0.03, rx, yT - 0.12, rz0 - 0.015);
    for (const s of [-1, 1]) box(silk, s * (rx + 0.015) - 0.005, yT - 0.3, rz0, s * (rx + 0.015) + 0.005, yT - 0.12, rz1);
    // the lanterns at the four corners of the eave, hung on short cords
    for (const [x, z] of [[-rx + 0.05, rz0 + 0.05], [rx - 0.05, rz0 + 0.05], [-rx + 0.05, rz1 - 0.05], [rx - 0.05, rz1 - 0.05]]) {
      beam(wood, [x, yT - 0.12, z], [x, yT - 0.3, z], 0.006, 4);
      lathe(lamps, [[0.001, -0.17], [0.07, -0.13], [0.1, -0.04], [0.1, 0.04], [0.07, 0.1], [0.001, 0.12]], 8, x, yT - 0.47, z);
      beam(gold, [x, yT - 0.63, z], [x, yT - 0.8, z], 0.008, 4);
    }
  }
  // the curtain of the open rear: half drawn to either side
  for (const s of [-1, 1]) box(silk, s * 0.52 - 0.2 * 0 - 0.22, yS + 0.05, z1 + 0.02, s * 0.52 + 0.22, yT - 0.05, z1 + 0.035);
  // the pennant at the bow: a pole on the prow with a swallow-tailed streamer
  beam(wood, [0, 0.55, -3.1], [0, 2.2, -3.18], 0.022, 5);
  const pen = [];
  for (const sgn of [1, -1]) { const A = [0, 2.17, -3.17], B = [0, 1.9, -3.17], C = [0, 2.06, -3.7], D = [0, 1.99, -3.55]; if (sgn > 0) { tri(pen, A, B, D, [1, 2, -3.4]); tri(pen, A, D, C, [1, 2, -3.4]); } else { tri(pen, A, D, B, [1, 2, -3.4]); tri(pen, A, C, D, [1, 2, -3.4]); } }
  return { red, panel, lattice, roof, trim, silk, lamps, gold, wood, pen };
}

/** The matting hood and the load of the cargo boat. */
function cargoBoat(far) {
  const ribs = [], mat = [], load = {}, jars = [], logs = [], sackless = true;
  void sackless;
  // the hood: arches of bamboo over the stern's waist, covered in matting (a half-ellipse 1.05 wide, 0.82 high on the gunwale)
  const za = 0.4, zb = 2.2, n = 5, M = 10;
  const arch = (z, i) => { const t = Math.PI * i / M; return [Math.cos(t) * 1.0, 0.5 + Math.sin(t) * 0.8, z]; };
  for (let k = 0; k <= n; k++) { const z = za + (zb - za) * k / n; if (!far) for (let i = 0; i < M; i++) beam(ribs, arch(z, i), arch(z, i + 1), 0.018, 4); }
  for (let k = 0; k < n; k++) {
    const z = za + (zb - za) * k / n, z2 = za + (zb - za) * (k + 1) / n;
    for (let i = 0; i < M; i++) quad(mat, arch(z, i), arch(z, i + 1), arch(z2, i + 1), arch(z2, i), [0, 0.5, (z + z2) / 2]);
  }
  for (const i of [0, M]) for (let k = 0; k < n; k++) void k;
  if (!far) { beam(ribs, [0, 1.32, za], [0, 1.32, zb], 0.02, 4); }
  // firewood bundles forward (the lake's and the hills' fuel came down by water), wine jars
  for (let i = 0; i < 6; i++) { const x = -0.7 + (i % 3) * 0.7, y = 0.18 + Math.floor(i / 3) * 0.3; beam(logs, [x - 0.1, y, -2.7], [x - 0.1, y, -1.5], 0.13, 6); }
  for (const [x, z] of [[-0.45, -0.3], [0.15, -0.38], [0.6, -0.25], [-0.05, 0.12]]) lathe(jars, [[0.001, -0.05], [0.14, -0.05], [0.2, 0.12], [0.22, 0.28], [0.15, 0.42], [0.1, 0.46], [0.11, 0.5], [0.001, 0.5]], far ? 6 : 9, x, 0.06, z);
  return { ribs, mat, logs, jars };
}

const dbl = (t) => { const o = []; for (let i = 0; i < t.length; i += 9) o.push(...t.slice(i, i + 9), t[i], t[i + 1], t[i + 2], t[i + 6], t[i + 7], t[i + 8], t[i + 3], t[i + 4], t[i + 5]); return o; };

export function boatShapes(sb) {
  const H = hull(), wood = factor('wood', 'timber'), put = (v, g, mat, o = {}) => g.length && sb.addPiece(v, o.group ?? 'wood', flat(g), { slot: o.slot ?? SLOT.none, col: factor(o.group ?? 'wood', mat, o.shade ?? 1) });
  for (const kind of ['covered', 'cargo']) for (const far of [false, true]) {
    const v = sb.variant(`${kind}|${far ? 'far' : 'near'}`);
    sb.addPiece(v, 'wood', flat(H.outer), { slot: SLOT.c1, col: wood });
    sb.addPiece(v, 'wood', flat(H.inner), { slot: SLOT.c1, col: factor('wood', 'timber', 0.85) });
    put(v, H.stripe, kind === 'covered' ? 'lacquer_red' : 'cloth_ochre');
    // the stern deck the boatman stands on, the foredeck
    const deck = [], fore = [];
    box(deck, -0.82, 0.55, 1.6, 0.82, 0.58, 3.38); box(fore, -0.55, 0.52, -3.2, 0.55, 0.55, -2.4);
    put(v, deck, 'timber', { shade: 0.9, slot: SLOT.c1 }); put(v, fore, 'timber', { shade: 0.9, slot: SLOT.c1 });
    if (kind === 'covered') {
      const C = cabin(far);
      put(v, C.red, 'lacquer_red'); put(v, C.panel, 'paint_caihua', { shade: 0.9 }); put(v, C.lattice, 'lacquer_chestnut', { shade: 1.2 });
      put(v, C.roof, 'tile_dark', { shade: 1.1 }); put(v, C.trim, 'lacquer_red', { shade: 0.9 }); put(v, C.wood, 'lacquer_black');
      if (C.silk.length) sb.addPiece(v, 'fibre', flat(C.silk), { slot: SLOT.none, col: factor('fibre', 'cloth_red', 0.9) });
      if (C.lamps.length) sb.addPiece(v, 'fibre', flat(C.lamps), { slot: SLOT.none, col: factor('fibre', 'lamp_paper', 1.0) });
      put(v, C.gold, 'gilt_bronze');
      sb.addPiece(v, 'fibre', flat(dbl(C.pen)), { slot: SLOT.none, col: factor('fibre', 'cloth_red', 0.95) });
      // furniture seen through the windows: a low table and two stools (the banquet's), a brazier
      if (!far) {
        const f = [], t = [];
        box(t, -0.28, 0.1, -0.7, 0.28, 0.52, -0.1); box(t, -0.3, 0.52, -0.72, 0.3, 0.56, -0.08);
        for (const x of [-0.55, 0.55]) box(f, x - 0.15, 0.1, -0.5, x + 0.15, 0.38, -0.25);
        put(v, t, 'lacquer_chestnut'); put(v, f, 'lacquer_chestnut', { shade: 0.9 });
      }
    } else {
      const C = cargoBoat(far);
      sb.addPiece(v, 'fibre', flat(dbl(C.mat)), { slot: SLOT.c2, col: factor('fibre', 'reed_mat') });
      put(v, C.ribs, 'bamboo_culm'); put(v, C.logs, 'bark_dark', { shade: 1.2 }); put(v, C.jars, 'pottery_dark');
      // sacks of rice amidships (the life style's objects, as Suzhou's cargo boat)
      const life = STYLES.life?.elements;
      if (life?.sacks) {
        const g2 = [];
        life.sacks({ t: 'sacks', at: [0, -0.3], y: 0.09, rot: 0, n: far ? 3 : 4, seed: 13 }, { bag: { add: (m, g) => g2.push([m, g]) }, col: { circle() {}, box() {}, rect() {} } });
        for (const [m, g] of g2) sb.addPiece(v, /sacking/.test(m) ? 'fibre' : 'wood', g, { slot: m === 'sacking' ? SLOT.c3 : SLOT.none, col: factor(/sacking/.test(m) ? 'fibre' : 'wood', m) });
      }
    }
  }
  // the yuloh: its frame at the pin, the handle forward up to the boatman's hands, the loom bent at the pin and running aft into the water to a long flat blade
  {
    const v = sb.variant('oar'), w = [], bl = [];
    const Hd = [-0.2, 0.86, -0.78], K = [0, 0.02, 0.18], B0 = [0, -0.62, 2.25], B1 = [0, -0.98, 3.25];
    beam(w, Hd, [0, 0.07, -0.02], 0.026, 6); beam(w, [0, 0.07, -0.02], K, 0.032, 6); beam(w, K, B0, 0.03, 6);
    const d = norm([B1[0] - B0[0], B1[1] - B0[1], B1[2] - B0[2]]), hw = 0.085, th = 0.018, side = [1, 0, 0], up = cross(d, side);
    const C = (p, s, t) => [p[0] + side[0] * s + up[0] * t, p[1] + side[1] * s + up[1] * t, p[2] + side[2] * s + up[2] * t];
    const B0x = [B0[0] - d[0] * 0.25, B0[1] - d[1] * 0.25, B0[2] - d[2] * 0.25];
    const q = [[C(B0x, -th, -hw * 0.5), C(B0x, th, -hw * 0.5), C(B0x, th, hw * 0.5), C(B0x, -th, hw * 0.5)], [C(B1, -th * 0.6, -hw), C(B1, th * 0.6, -hw), C(B1, th * 0.6, hw), C(B1, -th * 0.6, hw)]];
    const mid = [(B0[0] + B1[0]) / 2, (B0[1] + B1[1]) / 2, (B0[2] + B1[2]) / 2];
    for (let k = 0; k < 4; k++) { const k1 = (k + 1) % 4; quad(bl, q[0][k], q[1][k], q[1][k1], q[0][k1], mid); }
    quad(bl, q[1][0], q[1][1], q[1][2], q[1][3], mid);
    beam(w, [Hd[0] + 0.02, Hd[1] - 0.03, Hd[2]], [-0.15, -0.2, -0.95], 0.008, 4);
    sb.addPiece(v, 'wood', flat(w), { slot: SLOT.c1, col: factor('wood', 'timber', 0.9) });
    sb.addPiece(v, 'wood', flat(bl), { slot: SLOT.c1, col: factor('wood', 'timber', 0.75) });
  }
}
void LIMB; void UMBRELLA;
