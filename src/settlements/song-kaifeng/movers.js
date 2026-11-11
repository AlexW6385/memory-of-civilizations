// Northern Song Bianjing — the moving life (docs/settlements/song-kaifeng.md §11, "Street life"):
// people in the dress of the Song crowd on the streets and over the Rainbow Bridge, grain boats and
// passenger boats sculled up and down the Bian. Data for the engine's movers (src/engine/movers.js,
// worker src/engine/movers-worker.js), in the format of Suzhou's: the ways (from layout.js), who
// walks and what floats (figures of src/objects/figures.js, the grain boat of the song style), the
// boats already standing in the river (plan.js, town.js), which the moving ones keep clear of.
// Everything is read from layout.js, so a changed street plan changes the ways.

import * as LY from './layout.js';
import { STYLES } from '../../core/build.js';
import '../../styles/song/index.js';
import '../../objects/index.js';
import pagoda from './plan.js';
import { figure } from '../../objects/figures.js';
import { addFigure, factor, flat, SLOT } from '../../engine/movers-kit.js';

const { RADIUS, RIVER, BRIDGE, WALL_X, FIELDS_X } = LY;
const STREETS = LY.STREETS, lots = LY.lots;

// ── how many, how fast ───────────────────────────────────────────────────────
export const PARAMS = {
  walkers: { day: 80, night: 9, rain: 0.7, reach: 130, spawnMin: 20, far: 42 },
  boats: { count: 9, reach: 260, spawnMin: 60, far: 100, speed: [0.85, 1.3], bridgeSpeed: 0.7 },
  water: RIVER.water,
};

// ── the ways ─────────────────────────────────────────────────────────────────
/** The share of shop fronts along a street rectangle: the market streets get the crowd by day. */
function shopShare(r) {
  let n = 0, s = 0;
  for (const l of lots()) {
    const [x0, z0, x1, z1] = l.rect, f = l.front;
    const fx = f === 'e' ? x1 : f === 'w' ? x0 : (x0 + x1) / 2, fz = f === 's' ? z1 : f === 'n' ? z0 : (z0 + z1) / 2;
    if (fx < r[0] - 1.5 || fx > r[2] + 1.5 || fz < r[1] - 1.5 || fz > r[3] + 1.5) continue;
    n++; if (l.shop) s++;
  }
  return n ? s / n : 0;
}
/** The streets of the town clipped to where there is paving (west: the city gate; east: the fields' road), as { r, weight, market, kind }. */
function streetRects() {
  const out = [];
  for (const s of STREETS) {
    const horiz = s[2] - s[0] > s[3] - s[1];
    // the road through the gate runs on a little way beyond the wall; the others stop at the wall's inner foot
    const through = horiz && s[1] < 0 && s[3] > -100 && s[1] > -100;
    const r = horiz ? [Math.max(s[0], through ? WALL_X - 12 : WALL_X + 10), s[1], Math.min(s[2], FIELDS_X + 70), s[3]] : [s[0], s[1], s[2], s[3]];
    if (!horiz && (r[0] < WALL_X + 10 || r[2] > FIELDS_X + 70)) continue;
    if (r[2] - r[0] < 4 || r[3] - r[1] < 4) continue;
    const w = Math.min(r[2] - r[0], r[3] - r[1]), shops = shopShare(r);
    // the street of the bridge and the riverside streets are the busiest; the back streets are quiet
    const nearBridge = !horiz && Math.abs((r[0] + r[2]) / 2 - BRIDGE.at[0]) < 12 ? 1.6 : 1;
    const river = horiz && ((r[3] === RIVER.z0) || (r[1] === RIVER.z1)) ? 1.5 : 1;
    out.push({ r, weight: (w > 4 ? 1.5 : 0.5) * nearBridge * river * (1 + 5 * shops), market: shops, kind: w > 4 ? 'street' : 'lane' });
  }
  return out;
}
/** The streets as rectangles, the bridge as a link over the river: { rects, links, clip }. */
export function walkways() {
  const rects = streetRects();
  const links = [{ a: [BRIDGE.at[0], RIVER.z0], b: [BRIDGE.at[0], RIVER.z1], w: BRIDGE.width / 2, kind: 'bridge', weight: 2.4 }];
  return { rects, links, clip: RADIUS - 12 };
}
/** The river (its middle line and half-width) and the bridge over it: { rects, bridges, clip }. */
export function waterways() {
  const RW = RADIUS - 26;
  return { rects: [{ r: [-RW, RIVER.z0, RW, RIVER.z1], weight: 1 }], bridges: [{ at: BRIDGE.at, half: BRIDGE.span / 2 + 0.5 }], clip: RADIUS - 18 };
}
/**
 * The boats standing in the river (plan.js, town.js: moored along the banks, the one before the bridge,
 * the tracked one) as rectangles { c, u (along), hl, hw }, which the moving boats keep clear of; and the
 * Rainbow Bridge's two stone abutments, which leave the arch's 20 m open between them.
 */
export async function staticBoats() {
  const out = [];
  const take = (e) => {
    if (e.t !== 'song_boat') return;
    const [dx, dz] = e.dir ?? [1, 0], d = Math.hypot(dx, dz) || 1, L = e.len ?? 18;
    out.push({ c: e.at, u: [dx / d, dz / d], hl: L / 2 + 1.2, hw: (e.beam ?? L * 0.25) / 2 + 0.2 });
  };
  for (const e of pagoda.elements) take(e);
  try { const { town } = await import('./town.js'); for (const p of await town()) for (const e of p.elements) take(e); } catch { /* the town's own failure is reported by its own build */ }
  const S = BRIDGE.span / 2, [bx, bz] = BRIDGE.at;
  for (const sg of [-1, 1]) out.push({ c: [bx, bz + sg * (S + 3.0)], u: [1, 0], hl: BRIDGE.width / 2 + 1.5, hw: 3.0 });
  return out;
}

// ── who walks ────────────────────────────────────────────────────────────────
// After the Qingming scroll and the Song dress as the scroll and the tomb paintings show it (dossier
// §11): men in long gowns with the black soft cap (futou) over a topknot, merchants and clerks the
// same in plainer cloth, women in long gowns with a collar crossed over, a bun, in light green, rose
// and white, and, in the dry, with a parasol; porters bare to the waist with sacks on the shoulder
// or with the carrying pole and two baskets; drovers with a staff and a straw hat; monks, shaven, in
// grey-brown and ochre robes. In the rain the robed go under oil-paper umbrellas, the porters and
// drovers under palm-fibre rain capes.
const CL = { indigo: 'cloth_indigo', grey: 'cloth_grey', brown: 'cloth_brown', white: 'cloth_white', black: 'cloth_black', ochre: 'cloth_ochre', maroon: 'cloth_maroon', green: 'cloth_green', red: 'cloth_red' };
export const WALKERS = [
  { id: 'scholar', weight: 1.1, market: 1.2, el: { dress: 'robe', hair: 'topknot', hat: 'cap', over: 'collar', arms: 'hang' }, wet: 'umbrella',
    c1: [CL.indigo, CL.grey, '#4a5a6e', CL.green, CL.brown, '#6a5a78'], c2: [CL.white, CL.white, CL.grey], c3: [CL.black, CL.black, CL.indigo], speed: [1.0, 1.25], stride: 1.45 },
  { id: 'merchant', weight: 1.5, market: 1.6, el: { dress: 'robe', hair: 'topknot', hat: 'cap', over: 'sash', arms: 'hang' }, wet: 'umbrella',
    c1: [CL.brown, CL.grey, CL.indigo, CL.white, CL.ochre], c2: [CL.black, CL.indigo, CL.brown], c3: [CL.white, CL.grey, CL.black], speed: [1.1, 1.4], stride: 1.45 },
  { id: 'woman', weight: 1.0, market: 1.2, el: { dress: 'robe', hair: 'bun', over: 'collar', arms: 'hang' }, wet: 'umbrella', swing: 0.7,
    c1: ['#9bb08a', '#c9a0a0', CL.white, '#a8b8a0', CL.grey, '#b88c8c'], c2: [CL.white, CL.white, '#c9b88a'], c3: [CL.black], speed: [0.9, 1.15], stride: 1.25, h: [0.9, 0.97] },
  { id: 'lady', weight: 0.9, market: 1.4, el: { dress: 'robe', hair: 'bun', over: 'collar', arms: 'staff' }, wet: 'umbrella', swing: 0.7, parasol: true,
    c1: ['#8fae9a', '#d0a0a8', CL.white, '#a8b8a0', '#b88c8c'], c2: [CL.white, '#c9b88a'], c3: [CL.black], speed: [0.85, 1.1], stride: 1.2, h: [0.9, 0.96] },
  { id: 'porter', weight: 0.9, market: 1.1, el: { dress: 'trousers', hair: 'topknot', hat: 'straw', carry: 'pole', arms: 'pole' }, wet: 'cape', swing: 0.75, pole: true,
    c1: [CL.indigo, CL.grey, CL.brown, CL.white], c2: [CL.indigo, CL.black, CL.brown], c3: [CL.black], speed: [1.0, 1.25], stride: 1.1 },
  { id: 'sacker', weight: 0.9, market: 0.9, el: { dress: 'trousers', top: 'bare', hair: 'topknot', carry: 'sack', arms: 'sack' }, wet: 'cape',
    c1: [CL.white, CL.grey, CL.brown], c2: [CL.white, CL.grey, CL.indigo], c3: [CL.black], speed: [1.0, 1.3], stride: 1.15 },
  { id: 'drover', weight: 0.7, market: 0.5, el: { dress: 'trousers', hair: 'topknot', hat: 'straw', carry: 'staff', arms: 'staff' }, wet: 'cape',
    c1: [CL.brown, CL.grey, CL.white, CL.ochre], c2: [CL.indigo, CL.black, CL.grey], c3: [CL.black], speed: [1.05, 1.3], stride: 1.4 },
  { id: 'monk', weight: 0.45, market: 0.8, el: { dress: 'robe', hair: 'shaven', over: 'shawl', arms: 'hang' },
    c1: [CL.grey, CL.brown, CL.ochre, '#8a6a4a'], c2: [CL.ochre, CL.maroon, CL.brown], c3: [CL.black], speed: [0.9, 1.1], stride: 1.5 },
];
/** The boatman at the stern oar, and the passenger sitting cross-legged on the foredeck. */
export const CREW = {
  boatman: { el: { dress: 'trousers', hair: 'topknot', hat: 'straw', arms: 'pull' }, wet: 'cape', c1: [CL.indigo, CL.grey, CL.brown, CL.black], c2: [CL.indigo, CL.black, CL.grey], c3: [CL.black] },
  passenger: { el: { dress: 'robe', hair: 'topknot', hat: 'cap', over: 'collar', pose: 'cross' }, c1: [CL.indigo, CL.grey, CL.brown, '#4a5a6e'], c2: [CL.white, CL.grey], c3: [CL.black] },
};

// ── small helpers (a prism along a segment, the parasol and the umbrella) ───
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };
/** A thin prism of n sides from p to q (flat triangles pushed into out). */
function beam(out, p, q, r, n = 4) {
  const d = norm([q[0] - p[0], q[1] - p[1], q[2] - p[2]]), t1 = norm(cross(d, Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])), t2 = cross(d, t1);
  const ring = (c) => Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2; return [c[0] + (t1[0] * Math.cos(a) + t2[0] * Math.sin(a)) * r, c[1] + (t1[1] * Math.cos(a) + t2[1] * Math.sin(a)) * r, c[2] + (t1[2] * Math.cos(a) + t2[2] * Math.sin(a)) * r]; });
  const A = ring(p), B = ring(q);
  for (let k = 0; k < n; k++) { const k1 = (k + 1) % n; out.push(...A[k], ...A[k1], ...B[k1], ...A[k], ...B[k1], ...B[k]); }
  for (let k = 1; k + 1 < n; k++) { out.push(...A[0], ...A[k + 1], ...A[k], ...B[0], ...B[k], ...B[k + 1]); }
}
/**
 * The held shade: a shaft of bamboo leaning in over the head in the right hand (the figure's 'staff'
 * grip at [0.25, 1.05, −0.25]) and a cone of paper on ribs. The oil-paper umbrella (R 0.54, drop 0.2,
 * 28 ribs) for the rain; the parasol of the dry (wider and shallower, 18 ribs, silk).
 */
function shade(R, drop, N, cloth, ribs = true) {
  return (add) => {
    const grip = [0.25, 0.98, -0.25], top = [0.07, 2.02, -0.08];
    const ax = [top[0] - grip[0], top[1] - grip[1], top[2] - grip[2]], la = Math.hypot(...ax), u = ax.map((v) => v / la);
    const t1 = norm(cross(u, [0, 0, 1])), t2 = cross(u, t1);
    const P = (r, th, h) => [top[0] + (t1[0] * Math.cos(th) + t2[0] * Math.sin(th)) * r + u[0] * h, top[1] + (t1[1] * Math.cos(th) + t2[1] * Math.sin(th)) * r + u[1] * h, top[2] + (t1[2] * Math.cos(th) + t2[2] * Math.sin(th)) * r + u[2] * h];
    const paper = [], wood = [];
    for (let k = 0; k < N; k++) {
      const a0 = k / N * Math.PI * 2, a1 = (k + 1) / N * Math.PI * 2, am = (a0 + a1) / 2;
      for (let j = 0; j < 3; j++) {
        const r0 = R * j / 3, r1 = R * (j + 1) / 3, h = (r) => -drop * r / R, sag = (r) => -0.016 * r / R;
        const A = P(r0, a0, h(r0)), B = P(r1, a0, h(r1)), C = P(r1, am, h(r1) + sag(r1)), D = P(r0, am, h(r0) + sag(r0)), E = P(r1, a1, h(r1)), F = P(r0, a1, h(r0));
        paper.push(...A, ...B, ...C, ...A, ...C, ...D, ...D, ...C, ...E, ...D, ...E, ...F);
      }
      if (ribs) beam(wood, P(0.02, a0, -0.012), P(R + 0.02, a0, -drop - 0.008), 0.0045);
    }
    const under = []; for (let i = 0; i < paper.length; i += 9) under.push(paper[i], paper[i + 1], paper[i + 2], paper[i + 6], paper[i + 7], paper[i + 8], paper[i + 3], paper[i + 4], paper[i + 5]);
    for (let i = 0; i < under.length; i += 3) { under[i] -= u[0] * 0.004; under[i + 1] -= u[1] * 0.004; under[i + 2] -= u[2] * 0.004; }
    add('cloth', flat(paper), { slot: SLOT.c3, col: cloth });
    add('cloth', flat(under), { slot: SLOT.c3, col: [0.78, 0.74, 0.66] });
    beam(wood, [grip[0] - u[0] * 0.14, grip[1] - u[1] * 0.14, grip[2] - u[2] * 0.14], [top[0] + u[0] * 0.05, top[1] + u[1] * 0.05, top[2] + u[2] * 0.05], 0.011, 6);
    beam(wood, P(0, 0, 0.02), P(0, 0, 0.07), 0.018, 8);
    add('wood', flat(wood), { col: factor('wood', 'bamboo_culm', 0.95) });
  };
}
const umbrella = shade(0.54, 0.2, 28, [1, 1, 1]);
const parasol = shade(0.66, 0.14, 18, [1, 1, 1], true);

/** The walkers' set (variants `${id}|${dry|wet}|${near|far}`, the crew's `boatman|…`, `passenger|…`) into the set builder sb: 36 variants at most. */
export function walkerShapes(sb) {
  const kinds = [...WALKERS.map((k) => [k.id, k]), ['boatman', CREW.boatman], ['passenger', CREW.passenger]];
  for (const [id, k] of kinds) for (const wet of k.wet ? [false, true] : [false]) for (const far of [false, true]) {
    const v = sb.variant(`${id}|${wet ? 'wet' : 'dry'}|${far ? 'far' : 'near'}`);
    const el = { ...k.el };
    let cape = null, extra = null;
    if (wet && k.wet === 'umbrella') { el.arms = 'staff'; extra = umbrella; }
    if (wet && k.wet === 'cape') { el.over = 'cloak'; cape = 'thatch_palm'; }
    if (!wet && k.parasol) { el.arms = 'staff'; extra = parasol; }
    addFigure(sb, v, figure, el, { far, cape, extra });
  }
}

// ── what floats ──────────────────────────────────────────────────────────────
/**
 * The boats: the passenger boat (a mat awning over its foredeck) and the grain boat (sacks heaped on
 * the foredeck and baskets), both the Bian grain boat of the song style (song_boat: flat-bottomed
 * hull with the raised square bow and stern, the house of boards with lattice windows under its
 * vaulted mat roof, the bipod mast laid back on its crutch, as the boats come up to the city) with
 * its rudder and tiller left out — the moving boat is sculled with the long stern oar (the movers'
 * own oar sways on the pin). Built at 16 m by 4.9 m (the engine's 0.74–0.82 across makes the beam
 * 3.6–4.0 m), bow toward −z, the waterline at y 0. Variants `covered|near|far`, `cargo|…`, `oar`.
 */
const LEN = 16, BEAM = 4.9, HALF = LEN / 2;
// the hull's lines as song_boat draws them (kaifeng.js): sheer height at t ∈ [−1 (stern), 1 (bow)]
const sheer = (t) => 0.95 + 0.35 * t * t + (t > 0 ? 0.7 : 0.45) * t ** 6, deckAt = (z) => sheer(-z / HALF) - 0.3 + 0.01;
const Z_STERN = 7.0, Z_FORE = -5.0;
export const BOAT = { L: LEN, pin: [0.2, deckAt(Z_STERN) + 0.774, Z_STERN + 0.8], deck: deckAt(Z_STERN), stern: Z_STERN, passenger: [-0.05, deckAt(Z_FORE), Z_FORE], hull: [BEAM / 2, HALF + 1.0] };
const MAT_GROUP = { timber: 'wood', wood_dark: 'wood', planks_grey: 'wood', lattice: 'wood', bamboo_culm: 'wood', iron: 'wood', reed_mat: 'fibre', sacking: 'fibre', wicker: 'fibre' };
export function boatShapes(sb) {
  const got = [];
  STYLES.song.elements.song_boat({ at: [0, 0], dir: [0, -1], len: LEN, beam: BEAM, y: 0, mast: 90, mastH: 8.65, seed: 1 }, { bag: { add: (m, g) => got.push([m, g]) }, col: { circle() {}, box() {}, rect() {} } });
  got.length -= 4;                                                 // its rudder post, blade, tiller and stern oar
  const life = STYLES.life.elements;
  const put = (fn, el, into) => { fn({ ...el }, { bag: { add: (m, g) => into.push([m, g]) }, col: { circle() {}, box() {}, rect() {} } }); };
  // the foredeck's awning of matting on bamboo hoops (passenger boats): a vault from the house's forward end to the bow beam, 1.6 m over the deck
  const awning = [], hoops = [];
  {
    const z0 = -3.5, z1 = -6.6, N = 10, M = 8;
    const hw = (z) => BEAM / 2 * (1 - 0.4 * Math.abs(z / HALF) ** 2.6) - 0.3, arch = (z) => deckAt(z) + 0.55;
    for (let i = 0; i < N; i++) {
      const za = z0 + (z1 - z0) * i / N, zb = z0 + (z1 - z0) * (i + 1) / N;
      for (let k = 0; k < M; k++) {
        const a0 = Math.PI * k / M, a1 = Math.PI * (k + 1) / M, p = (z, a, up) => [-Math.cos(a) * (hw(z) + up * 0.04), arch(z) + Math.sin(a) * (1.1 + up * 0.04), z];
        for (const up of [0, -1]) {
          const q = [p(za, a0, up), p(zb, a0, up), p(zb, a1, up), p(za, a1, up)];
          const tri = up === 0 ? [...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3]] : [...q[0], ...q[2], ...q[1], ...q[0], ...q[3], ...q[2]];
          awning.push(...tri);
        }
      }
    }
    for (let i = 0; i <= 5; i++) {
      const z = z0 + (z1 - z0) * i / 5, pts = [];
      for (let k = 0; k <= M; k++) { const a = Math.PI * k / M; pts.push([-Math.cos(a) * (hw(z) + 0.05), arch(z) + Math.sin(a) * 1.15, z]); }
      for (let k = 0; k < M; k++) beam(hoops, pts[k], pts[k + 1], 0.028, 4);
    }
  }
  const wood = factor('wood', 'timber');
  for (const kind of ['covered', 'cargo']) for (const far of [false, true]) {
    const v = sb.variant(`${kind}|${far ? 'far' : 'near'}`);
    for (const [m, g] of got) {
      if (far && /lattice|bamboo_culm|iron/.test(m)) continue;
      const group = MAT_GROUP[m] ?? 'wood';
      if (m === 'timber') sb.addPiece(v, 'wood', g, { slot: SLOT.c1, col: wood });
      else if (m === 'reed_mat') sb.addPiece(v, 'fibre', g, { slot: SLOT.c2, col: factor('fibre', 'reed_mat') });
      else sb.addPiece(v, group, g, { slot: SLOT.none, col: factor(group, m) });
    }
    if (kind === 'covered') {
      sb.addPiece(v, 'fibre', flat(awning), { slot: SLOT.c2, col: factor('fibre', 'reed_mat') });
      if (!far) sb.addPiece(v, 'wood', flat(hoops), { col: factor('wood', 'bamboo_culm', 0.95) });
    } else {
      // the cargo: sacks of grain heaped on the foredeck and in the waist, baskets by the bow
      const g2 = [];
      put(life.sacks, { t: 'sacks', at: [0, -4.2], y: deckAt(-4.2), rot: 0, n: 9, seed: 11 }, g2);
      put(life.sacks, { t: 'sacks', at: [0.1, -2.6], y: deckAt(-2.6), rot: Math.PI, n: 5, seed: 12 }, g2);
      put(life.sacks, { t: 'sacks', at: [-0.2, -5.9], y: deckAt(-5.9), rot: 0.2, n: 4, seed: 13 }, g2);
      put(life.basket, { t: 'basket', at: [0.9, -6.4], y: deckAt(-6.4), rot: 0, n: 2, seed: 7, goods: 'hide_tan' }, g2);
      for (const [m, g] of g2) { if (far && m === 'hide_tan') continue; const grp = /wicker|sacking/.test(m) ? 'fibre' : 'wood'; sb.addPiece(v, grp, g, { slot: m === 'sacking' ? SLOT.c3 : SLOT.none, col: factor(grp, m) }); }
    }
  }
  // the stern oar (the yuloh): its frame at the pin, the handle forward (−z) to the boatman's hands, the loom bent at the pin and running aft down to a long flat blade in the water
  {
    const v = sb.variant('oar'), w = [], deckDrop = BOAT.pin[1] - BOAT.deck;
    const H = [-0.2, 0.86, -0.78], K = [0, 0.02, 0.18], B0 = [0.0, -1.15, 2.7], B1 = [0.0, -BOAT.pin[1] - 0.45, 5.1];
    beam(w, H, [0, 0.07, -0.02], 0.03, 6); beam(w, [0, 0.07, -0.02], K, 0.036, 6); beam(w, K, B0, 0.034, 6);
    const bl = [], hwid = 0.14, th = 0.022, d = norm([B1[0] - B0[0], B1[1] - B0[1], B1[2] - B0[2]]), side = [1, 0, 0], up = cross(d, side);
    const C = (p, s, t) => [p[0] + side[0] * s + up[0] * t, p[1] + side[1] * s + up[1] * t, p[2] + side[2] * s + up[2] * t];
    const B0x = [B0[0] - d[0] * 0.3, B0[1] - d[1] * 0.3, B0[2] - d[2] * 0.3];
    const q = [[C(B0x, -th, -hwid * 0.5), C(B0x, th, -hwid * 0.5), C(B0x, th, hwid * 0.5), C(B0x, -th, hwid * 0.5)], [C(B1, -th * 0.6, -hwid), C(B1, th * 0.6, -hwid), C(B1, th * 0.6, hwid), C(B1, -th * 0.6, hwid)]];
    for (let k = 0; k < 4; k++) { const k1 = (k + 1) % 4; bl.push(...q[0][k], ...q[1][k], ...q[1][k1], ...q[0][k], ...q[1][k1], ...q[0][k1]); }
    bl.push(...q[1][0], ...q[1][2], ...q[1][1], ...q[1][0], ...q[1][3], ...q[1][2]);
    beam(w, [H[0] + 0.02, H[1] - 0.03, H[2]], [-0.15, -deckDrop + 0.05, -0.95], 0.009, 4);     // the rope from the handle to the deck
    sb.addPiece(v, 'wood', flat(w), { slot: SLOT.c1, col: factor('wood', 'timber', 0.9) });
    sb.addPiece(v, 'wood', flat(bl), { slot: SLOT.c1, col: factor('wood', 'timber', 0.75) });
  }
}
