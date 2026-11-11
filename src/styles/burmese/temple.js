// The Pagan temples (docs/settlements/bagan.md §4–§5): the Ananda (a cruciform brick temple, enterable: four porches, the outer wall with its parapet, two
// vaulted corridors round the central cube, the cross passages to the four standing Buddhas, the receding terraces, the sikhara and its gilded spire),
// the hollow multi-storey temple of the Thatbyinnyu and Sulamani type, and the small temples of the plain.
import { box, lathe } from '../../core/geom.js';
import { rng, Fr, sideFrame, archWall, vault, miniStupa, hti } from './kit.js';

const WHITE = 'limewash_white', TRIM = 'stucco_cream', BRICK = 'brick_baked', GLAZE = 'glaze_green';
const SIDES = ['n', 'e', 's', 'w'];

/** The sikhara: bands rising from y0, the half width falling from h0 to hEnd along a concave curve; the last `gilt` bands gilded; returns the top y. */
export function sikhara(ctx, c, y0, h0, hEnd, n, bh, gilt = 3, niches = true) {
  const { bag, col } = ctx;
  let y = y0;
  for (let i = 0; i < n; i++) {
    const t = i / n, half = h0 - (h0 - hEnd) * Math.pow(t, 1.35), g = i >= n - gilt;
    const mat = g ? 'gilt_bronze' : WHITE;
    bag.add(mat, box(c[0] - half, y, c[1] - half, c[0] + half, y + bh, c[1] + half));
    if (i === 0) col.rect([c[0] - half, c[1] - half, c[0] + half, c[1] + half], y, y + bh);
    bag.add(g ? 'gilt_bronze' : TRIM, box(c[0] - half - 0.3, y + bh - 0.28, c[1] - half - 0.3, c[0] + half + 0.3, y + bh, c[1] + half + 0.3));
    if (niches && !g && half > 2.2) {
      const nw = half * 0.55, nh = bh * 0.6;
      bag.add('stucco_ochre', box(c[0] - nw, y + bh * 0.12, c[1] - half - 0.06, c[0] + nw, y + bh * 0.12 + nh, c[1] - half));
      bag.add('stucco_ochre', box(c[0] - nw, y + bh * 0.12, c[1] + half, c[0] + nw, y + bh * 0.12 + nh, c[1] + half + 0.06));
      bag.add('stucco_ochre', box(c[0] - half - 0.06, y + bh * 0.12, c[1] - nw, c[0] - half, y + bh * 0.12 + nh, c[1] + nw));
      bag.add('stucco_ochre', box(c[0] + half, y + bh * 0.12, c[1] - nw, c[0] + half + 0.06, y + bh * 0.12 + nh, c[1] + nw));
    }
    y += bh;
  }
  return y;
}

/** The merlons of a parapet round a square (centre c, half h) at height y. */
function merlons(bag, c, h, y, step = 1.8, hh = 1.1) {
  const out = [];
  for (let s = -h + 0.5; s < h - 0.4; s += step) {
    out.push([c[0] + s, c[1] - h + 0.3], [c[0] + s, c[1] + h - 0.3]);
    if (Math.abs(s) < h - 1.2) out.push([c[0] - h + 0.3, c[1] + s], [c[0] + h - 0.3, c[1] + s]);
  }
  for (const [x, z] of out) bag.add(WHITE, box(x - 0.4, y, z - 0.4, x + 0.4, y + hh * 0.75, z + 0.4)), bag.add(WHITE, box(x - 0.28, y + hh * 0.75, z - 0.28, x + 0.28, y + hh, z + 0.28));
}

/** Steps up a plinth's arm: along −v toward the temple, from the arm's end v1 (ground) to v1 − len (height f). */
function steps(F, u0, u1, v1, len, f) {
  const n = 6, d = len / n;
  for (let i = 0; i < n; i++) F.b('brick_paving', u0, 0, v1 - len, u1, f * (i + 1) / n, v1 - i * d, false);
  F.ramp(u0, v1 - len, u1, v1, 0, f, -1);
}

/** A Buddha standing on a throne facing +v of the frame, at (u, v): total height H (the throne included). */
export function buddha(F, u, v, H, throne = 2.2) {
  const k = (H - throne) / 8.2, f0 = F.o;
  void f0;
  const y0 = throne;
  F.b('lacquer_red', u - 2.3, F.base ?? 0, v - 1.5, u + 2.3, (F.base ?? 0) + throne, v + 1.6);
  F.b('gilt_bronze', u - 2.4, (F.base ?? 0) + throne - 0.2, v - 1.6, u + 2.4, (F.base ?? 0) + throne, v + 1.7, false);
  const P = (prof) => prof.map(([r, y]) => [r * k, (F.base ?? 0) + y0 + y * k]);
  const robe = [[1.35, 0], [1.28, 0.4], [1.05, 2.2], [0.98, 3.8], [1.05, 5.0], [1.5, 5.8], [1.42, 6.15], [0.62, 6.35], [0.42, 6.5]].map(([r, y]) => [r * k, y * k]);
  const [px, pz] = F.pt(u, v), by = (F.base ?? 0) + y0;
  F.bag.add('gold', lathe(robe, 14, null, px, by, pz));
  F.bag.add('gilt_bronze', lathe([[0.42 * k, 6.5 * k], [0.62 * k, 6.9 * k], [0.78 * k, 7.5 * k], [0.72 * k, 8.1 * k], [0.45 * k, 8.4 * k], [0.18 * k, 8.55 * k]], 12, null, px, by, pz));
  F.bag.add('gold', lathe([[0.4 * k, 8.3 * k], [0.34 * k, 8.8 * k], [0.12 * k, 9.2 * k], [0.001, 9.35 * k]], 10, null, px, by, pz));
  // the arms: the left hand at the hip holding the robe, the right raised (abhaya) — bars of gilt
  F.b('gold', u - 1.7 * k, by + 3.0 * k, v + 0.55 * k, u - 1.3 * k, by + 5.6 * k, v + 1.0 * k, false);
  F.b('gold', u + 1.3 * k, by + 4.6 * k, v + 0.8 * k, u + 1.75 * k, by + 5.7 * k, v + 1.15 * k, false);
  F.b('gilt_bronze', u + 1.15 * k, by + 5.7 * k, v + 1.1 * k, u + 1.75 * k, by + 6.6 * k, v + 1.2 * k, false);
  // the flame-shaped halo behind the head
  F.b('gilt_bronze', u - 1.3 * k, by + 6.6 * k, v - 0.95 * k, u + 1.3 * k, by + 9.2 * k, v - 0.85 * k, false);
  F.col.rect(F.R(u - 2.3, v - 1.5, u + 2.3, v + 1.6), F.base ?? 0, (F.base ?? 0) + H);
}

/**
 * bgn_ananda: { c, f (floor, 1.2), seed } — the Ananda, true size (docs/settlements/bagan.md §4). Central square 53 m, porches projecting 17 m, outer wall 12 m.
 */
export function ananda(el, ctx) {
  const { bag, col, lights } = ctx, c = el.c, f = el.f ?? 1.2;
  const HO = 26.5, HM = 23.0, HC = 19.8, HW = 16.8, HI = 13.6, NICHE = { u: 3.2, v0: 9.4 }, NT = 14.2, SLAB0 = 8.4, TOP1 = 12;
  const S = Object.fromEntries(SIDES.map((s) => { const F = sideFrame(ctx, c, s); F.base = f; return [s, F]; }));
  const W = Fr; void W;
  // ── the plinth (a cross) and its steps ──
  for (const s of SIDES) {
    const F = S[s];
    F.b(BRICK, -8.2, 0, 0, 8.2, f - 0.03, 46, false); F.b('brick_paving', -8.2, f - 0.03, 0, 8.2, f, 46, false);
    F.floor(-8.2, 0, 8.2, 46, f);
    steps(F, -3.4, 3.4, 48.6, 2.6, f);
    // the plinth's glazed band and its stone edge
    for (const sd of [-1, 1]) F.b(GLAZE, sd * 8.2 - 0.05 + (sd > 0 ? 0 : 0), f * 0.3, 8, sd * 8.2 + 0.05, f * 0.55, 46, false);
  }
  { const F = S.n; F.b(BRICK, -29.5, 0, -29.5, 29.5, f - 0.03, 29.5, false); F.b('brick_paving', -29.5, f - 0.03, -29.5, 29.5, f, 29.5, false); F.floor(-29.5, -29.5, 29.5, 29.5, f); }
  const ring = (h0, h1, fn) => {                       // the ring between half h0 and h1: n and s full, e and w between
    fn(S.n, -h1, h1, h0, h1); fn(S.s, -h1, h1, h0, h1); fn(S.e, -h0, h0, h0, h1); fn(S.w, -h0, h0, h0, h1);
  };
  // ── the outer wall: 12 m, the door of each porch and the slit windows ──
  ring(HM, HO, (F, u0, u1, v0, v1) => archWall(F, WHITE, u0, u1, v0, v1, f, TOP1, [
    { c: 0, w: 4.8, top: 8.4 }, ...[-18, -11, 11, 18].map((c) => ({ c, w: 1.1, top: f + 6.2, sill: 2.6 })),
  ], 'stucco_cream'));
  // ── the middle wall: the opening of the cross passage ──
  ring(HW, HC, (F, u0, u1, v0, v1) => archWall(F, WHITE, u0, u1, v0, v1, f, SLAB0, [{ c: 0, w: 4.8, top: 7.6 }], 'stucco_cream'));
  // ── the core: the central cube with the four niches (u ±3.2, from v 9.4 to its face at 13.6), up to the niches' tops ──
  const coreLayer = (y0, y1, mat = WHITE) => {
    const F = S.n, n = NICHE.u, a = NICHE.v0;
    F.b(mat, -a, y0, -a, a, y1, a);                                           // the centre
    for (const s of SIDES) {
      const G = S[s];
      G.b(mat, -a, y0, a, -n, y1, HI); G.b(mat, n, y0, a, a, y1, HI);       // the flanks of the niche
    }
    // the corner squares between the sides' flanks
    for (const [su, sv] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) F.b(mat, su * a, y0, sv * a, su * HI, y1, sv * HI);
  };
  coreLayer(f, NT);
  // the niches' lintels, and the niches' back walls are the centre block's faces
  for (const s of SIDES) S[s].b(WHITE, -NICHE.u, NT - 0.01, NICHE.v0, NICHE.u, NT + 0.8, HI);
  // ── the slab over the corridors (the terrace of the first roof), as brick ──
  ring(HI, HM, (F, u0, u1, v0, v1) => F.b(BRICK, u0, SLAB0, v0, u1, TOP1, v1, true));
  // the full-square layer above the core, between the niches' lintels and the second terrace
  // ── the corridors' vaults, the passages' vaults ──
  for (const s of SIDES) {
    const F = S[s];
    for (const sg of [-1, 1]) {
      const a = sg < 0 ? [-19.8, -2.4] : [2.4, 19.8], b = sg < 0 ? [-HI, -2.4] : [2.4, HI];
      vault(F, 'u', (HC + HM) / 2, 1.6, a[0], a[1], f + 3.6, 2.4, 5, WHITE);
      vault(F, 'u', (HI + HW) / 2, 1.6, b[0], b[1], f + 4.2, 2.6, 5, WHITE);
    }
    vault(F, 'v', 0, 2.4, HI, HO, f + 3.7, 3.0, 6, WHITE);
    // the stone reliefs along the corridor walls (a band of carved stone), facing the walkers
    for (const sg of [-1, 1]) {
      const a = sg < 0 ? [-13.4, -2.6] : [2.6, 13.4];
      F.b('sandstone_relief', a[0], f + 1.0, HW - 0.06, a[1], f + 3.3, HW, false);
      F.b('sandstone_relief', a[0], f + 1.0, HI, a[1], f + 3.3, HI + 0.06, false);
    }
  }
  // the Buddhas: Kakusandha north, Konagamana east, Kassapa south, Gautama west
  for (const s of SIDES) { buddha(S[s], 0, 11.5, 9.5, 2.4); }
  // ── the porches: a vaulted hall under a stepped gable, a stupa on the front ──
  for (const s of SIDES) {
    const F = S[s], yp = f + 11;
    for (const sg of [-1, 1]) F.b(WHITE, sg < 0 ? -5.8 : 3.6, f, HO, sg < 0 ? -3.6 : 5.8, yp, 43.5);
    archWall(F, WHITE, -5.8, 5.8, 41.3, 43.5, f, yp, [{ c: 0, w: 5.0, top: f + 7.8 }], 'stucco_cream');
    vault(F, 'v', 0, 3.6, HO, 41.3, f + 4.6, 5.2, 8, WHITE);
    F.b(BRICK, -5.8, yp, HO, 5.8, yp + 2.0, 43.5, false);
    F.b(WHITE, -5.8, yp - 0.0, HO, 5.8, yp + 2.0, 43.5, false);
    F.b(WHITE, -4.6, yp + 2.0, HO, 4.6, yp + 4.0, 42.3, false);
    F.b(WHITE, -3.4, yp + 4.0, HO, 3.4, yp + 6.0, 41.1, false);
    for (const [y, u, v] of [[yp + 2.0, 5.8, 43.5], [yp + 4.0, 4.6, 42.3], [yp + 6.0, 3.4, 41.1]]) F.b(TRIM, -u - 0.25, y - 0.3, HO, u + 0.25, y, v + 0.25, false);
    F.b(GLAZE, -5.85, yp + 0.4, 38, 5.85, yp + 0.9, 43.55, false);
    const [fx, fz] = F.pt(0, 39.5);
    miniStupa(bag, fx, yp + 6.0, fz, 5.5, WHITE, true);
    F.b(TRIM, -3.6, yp + 6.0, HO, 3.6, yp + 6.0 + 0.05, 41.3, false);
    F.light(0, f + 6, 34, '#ffc98a', 6, 16);
    F.light(0, f + 4.2, 21.4, '#ffc98a', 4, 12);
    F.light(0, f + 5.4, 15.2, '#ffc98a', 4, 12);
    F.light(0, f + 8.5, 11.5, '#ffd9a0', 9, 22);
  }
  // ── corners: the stupas at the outer wall's corners; the parapet ──
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) miniStupa(bag, c[0] + sx * 24.6, TOP1, c[1] + sz * 24.6, 7, WHITE, true, 10);
  merlons(bag, c, HO - 0.2, TOP1);
  bag.add(TRIM, box(c[0] - HO - 0.3, TOP1 - 0.35, c[1] - HO - 0.3, c[0] + HO + 0.3, TOP1 + 0.02, c[1] + HO + 0.3));
  bag.add(GLAZE, box(c[0] - HO - 0.05, f + 3.4, c[1] - 12, c[0] - HO, f + 4.0, c[1] + 12));
  bag.add(GLAZE, box(c[0] + HO, f + 3.4, c[1] - 12, c[0] + HO + 0.05, f + 4.0, c[1] + 12));
  bag.add(GLAZE, box(c[0] - 12, f + 3.4, c[1] - HO - 0.05, c[0] + 12, f + 4.0, c[1] - HO));
  bag.add(GLAZE, box(c[0] - 12, f + 3.4, c[1] + HO, c[0] + 12, f + 4.0, c[1] + HO + 0.05));
  // ── the receding terraces: the curvilinear roofs, as four stepped tiers with a glazed band and a stupa at each corner ──
  const tier = (h, y0, y1, ringOnly) => {
    const F = S.n;
    if (ringOnly) { ring(HI, h, (G, u0, u1, v0, v1) => G.b(WHITE, u0, y0, v0, u1, y1, v1, true)); F.b(GLAZE, -h - 0.05, y0 + 0.5, -h - 0.05, h + 0.05, y0 + 1.0, h + 0.05, false); return; }
    F.b(WHITE, -h, y0, -h, h, y1, h, true);
    F.b(TRIM, -h - 0.3, y1 - 0.35, -h - 0.3, h + 0.3, y1 + 0.03, h + 0.3, false);
    if (y0 > NT + 0.1) F.b(GLAZE, -h - 0.05, y0 + 0.5, -h - 0.05, h + 0.05, y0 + 1.0, h + 0.05, false);
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) miniStupa(bag, c[0] + sx * (h - 1.2), y1 + 0.03, c[1] + sz * (h - 1.2), 3.6, WHITE, true);
  };
  tier(20, TOP1, NT, true);
  tier(20, NT, 15, false);
  tier(17.5, 15, 18, false); tier(15, 18, 21, false);
  S.n.b(WHITE, -12.8, 21, -12.8, 12.8, 24, 12.8, true);
  S.n.b(TRIM, -13.1, 23.65, -13.1, 13.1, 24.03, 13.1, false);
  // the sikhara and its gilded crown: bands with niches, the bud, the hti — the whole 51 m
  const yTop = sikhara(ctx, c, 24, 12.0, 2.6, 10, 1.55, 4);
  miniStupa(bag, c[0], yTop, c[1], 8, WHITE, true, 12);
  hti(bag, c[0], yTop + 8, c[1], 3.8, 1.0);
}

/**
 * bgn_tower: { c, facing, k (scale; 1 = the Thatbyinnyu's 58 m platform), f, seed } — the hollow multi-storey temple: a plinth, a two-storey lower block with blind windows,
 * a terrace with parapet and corner stupas, an upper block, receding terraces and the sikhara; an entry hall projecting on `facing`, enterable to a vaulted hall with a seated Buddha.
 */
export function tower(el, ctx) {
  const { bag, col } = ctx, c = el.c, k = el.k ?? 1, f = el.f ?? 1.4, H = 29 * k, Hc = H - 1.5 * k;
  const facing = el.facing ?? 'e';
  const S = Object.fromEntries(SIDES.map((s) => { const F = sideFrame(ctx, c, s); F.base = f; return [s, F]; }));
  const FF = S[facing];
  const hh = 12.5 * k, Y1 = f + hh;
  // the plinth
  S.n.b(BRICK, -H - 2.5, 0, -H - 2.5, H + 2.5, f - 0.03, H + 2.5, false); S.n.b('brick_paving', -H - 2.5, f - 0.03, -H - 2.5, H + 2.5, f, H + 2.5, false);
  S.n.floor(-H - 2.5, -H - 2.5, H + 2.5, H + 2.5, f);
  // steps on all four sides' middles
  for (const s of SIDES) steps(S[s], -3.2 * k - 1, 3.2 * k + 1, H + 2.5 + 2.4, 2.4, f);
  // the lower block: shells with blind windows (two rows), the entry door on `facing`
  const hmid = 6.25 * k, W1 = [-3, -2, -1, 0, 1, 2, 3];
  const shell = (s, u0, u1) => {
    const F = S[s], face = s === facing;
    const r1 = W1.filter((i) => !face || i !== 0).map((i) => ({ c: i * 7.4 * k, w: 1.7 * k, top: f + 5.4 * k, sill: 1.9 * k }));
    if (face) r1.push({ c: 0, w: 4.6 * k, top: f + 5.6 * k });
    r1.sort((p, q) => p.c - q.c);
    archWall(F, WHITE, u0, u1, Hc, H, f, f + hmid, r1, 'stucco_cream');
    archWall(F, WHITE, u0, u1, Hc, H, f + hmid, Y1, W1.map((i) => ({ c: i * 7.4 * k, w: 1.7 * k, top: f + 10.6 * k, sill: 1.15 * k })), 'stucco_cream');
  };
  shell('n', -H, H); shell('s', -H, H); shell('e', -Hc, Hc); shell('w', -Hc, Hc);
  // the core of the lower block, with a slot for the entry hall in the facing frame
  const sl = 3.9 * k, hallV = 6 * k, hallTop = f + 9 * k;
  FF.b(WHITE, -Hc, f, -Hc, -sl, Y1, Hc); FF.b(WHITE, sl, f, -Hc, Hc, Y1, Hc);
  FF.b(WHITE, -sl, f, -Hc, sl, Y1, hallV); FF.b(WHITE, -sl, hallTop, hallV, sl, Y1, Hc);
  vault(FF, 'v', 0, sl, hallV, Hc, f + 4.4 * k, (hallTop - f - 4.4 * k) * 0.95, 6, WHITE);
  // the seated Buddha at the hall's end
  FF.b('lacquer_red', -2.6, f, hallV + 0.2, 2.6, f + 1.6, hallV + 3.4, true);
  FF.b('gilt_bronze', -2.7, f + 1.4, hallV + 0.2, 2.7, f + 1.6, hallV + 3.5, false);
  FF.lathe('gold', [[2.0, 0], [1.9, 0.9], [1.3, 2.2], [1.15, 3.4], [1.5, 3.9], [0.45, 4.1], [0.4, 4.3]], 0, f + 1.6, hallV + 1.8, 14);
  FF.lathe('gilt_bronze', [[0.4, 4.3], [0.62, 4.7], [0.58, 5.3], [0.2, 5.55], [0.001, 5.7]], 0, f + 1.6, hallV + 1.8, 12);
  FF.light(0, f + 7 * k, hallV + 4, '#ffd9a0', 8, 18);
  FF.light(0, f + 7 * k, Hc - 1, '#ffd9a0', 5, 14);
  FF.b('limewash_white', -sl - 0.1, f, hallV, -sl, f + 0.01, Hc, false);
  // the entry hall projecting on `facing`: 9.8 wide, 11.6 long, a gabled roof in steps, an end arch
  const pw = (sl + 1.6 * k), pl = 11.6 * k;
  for (const sg of [-1, 1]) FF.b(WHITE, sg < 0 ? -pw : sl, f, H, sg < 0 ? -sl : pw, f + 9.5 * k, H + pl);
  archWall(FF, WHITE, -pw, pw, H + pl - 1.8 * k, H + pl, f, f + 9.5 * k, [{ c: 0, w: 4.6 * k, top: f + 7.0 * k }], 'stucco_cream');
  vault(FF, 'v', 0, sl, H, H + pl - 1.8 * k, f + 4.4 * k, 4.4 * k, 6, WHITE);
  for (let i = 0; i < 3; i++) FF.b(WHITE, -pw + i * 0.9 * k, f + (9.5 + i * 1.8) * k, H, pw - i * 0.9 * k, f + (11.3 + i * 1.8) * k, H + pl - i * 1.0 * k, false);
  FF.light(0, f + 5 * k, H + pl / 2, '#ffc98a', 5, 14);
  // the first terrace: the parapet and the corner stupas
  bag.add(TRIM, box(c[0] - H - 0.3, Y1 - 0.35, c[1] - H - 0.3, c[0] + H + 0.3, Y1 + 0.03, c[1] + H + 0.3));
  merlons(bag, c, H - 0.2, Y1);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) miniStupa(bag, c[0] + sx * (H - 2.2), Y1, c[1] + sz * (H - 2.2), 6.5 * k, WHITE, true, 10);
  // the upper block (the third and fourth storeys) with one row of blind windows
  const Hu = H - 9 * k, Hs = Hu - 1.4 * k, Y2 = Y1 + 11 * k;
  S.n.b(WHITE, -Hs, Y1, -Hs, Hs, Y2, Hs, true);
  const uw = [-2, -1, 0, 1, 2].map((i) => ({ c: i * 6.2 * k, w: 1.5 * k, top: Y1 + 8.2 * k, sill: 3.6 * k }));
  for (const s of SIDES) archWall(S[s], WHITE, s === 'n' || s === 's' ? -Hu : -Hs, s === 'n' || s === 's' ? Hu : Hs, Hs, Hu, Y1, Y2, uw, 'stucco_cream');
  bag.add(TRIM, box(c[0] - Hu - 0.3, Y2 - 0.35, c[1] - Hu - 0.3, c[0] + Hu + 0.3, Y2 + 0.03, c[1] + Hu + 0.3));
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) miniStupa(bag, c[0] + sx * (Hu - 1.6), Y2 + 0.03, c[1] + sz * (Hu - 1.6), 5 * k, WHITE, true, 8);
  // three receding terraces and the sikhara
  let y = Y2;
  for (let i = 0; i < 3; i++) {
    const h = Hu - (2.0 + i * 2.2) * k, y1 = y + 2.2 * k;
    S.n.b(WHITE, -h, y, -h, h, y1, h, true);
    S.n.b(TRIM, -h - 0.3, y1 - 0.3, -h - 0.3, h + 0.3, y1 + 0.03, h + 0.3, false);
    S.n.b(GLAZE, -h - 0.05, y + 0.4, -h - 0.05, h + 0.05, y + 0.85, h + 0.05, false);
    y = y1;
  }
  const hs = Hu - 8.6 * k, n = Math.round(13 * Math.sqrt(k));
  const yTop = sikhara(ctx, c, y, hs, 2.2 * k, n, 1.9 * k, 3);
  miniStupa(bag, c[0], yTop, c[1], 8 * k, WHITE, true, 12);
  hti(bag, c[0], yTop + 8 * k, c[1], 5.5 * k, 1.2 * k);
  void rng; void col;
}

/**
 * bgn_cella: { c, facing, w (half width), seed } — a small temple of the plain: a plinth, a square cell under receding terraces and a sikhara, a porch with a blind door
 * (not enterable); brick showing through worn stucco, or white.
 */
export function cella(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, r = rng(el.seed ?? 3), w = el.w ?? 4, facing = el.facing ?? 'e';
  const F = sideFrame(ctx, el.c, facing), f = 0.5, brick = el.brick ?? r() < 0.5;
  const body = brick ? 'brick' : WHITE, h = w * (1.5 + r() * 0.5);
  F.b(BRICK, -w - 1.2, 0, -w - 1.2, w + 1.2, f, w + 1.2, true);
  const th = 0.55;
  archWall(F, body, -w, w, w - th, w, f, f + h, [{ c: 0, w: Math.min(1.6, w * 0.4), top: f + h * 0.62 }]);
  F.b('wood_dark', -0.75, f, w - th, 0.75, f + h * 0.58, w - th + 0.04, false);
  F.b(body, -w, f, -w, w, f + h, w - th, true);
  F.b(TRIM, -w - 0.2, f + h - 0.3, -w - 0.2, w + 0.2, f + h + 0.03, w + 0.2, false);
  let y = f + h;
  const nt = 2;
  for (let i = 0; i < nt; i++) { const hh = w * (0.8 - 0.2 * i), y1 = y + w * 0.35; F.b(body, -hh, y, -hh, hh, y1, hh, true); F.b(TRIM, -hh - 0.15, y1 - 0.2, -hh - 0.15, hh + 0.15, y1 + 0.02, hh + 0.15, false); y = y1; }
  const top = sikhara(ctx, el.c, y, w * 0.5, w * 0.12, 6, w * 0.32, 0, false);
  miniStupa(bag, cx, top, cz, w * 1.1, body === 'brick' ? 'brick' : WHITE, false, 8);
  // the porch: two stubs flanking the door under a stepped roof
  for (const sg of [-1, 1]) F.b(body, sg < 0 ? -1.5 : 0.9, f, w, sg < 0 ? -0.9 : 1.5, f + h * 0.6, w + w * 0.35, true);
  F.b(TRIM, -1.6, f + h * 0.6, w - 0.1, 1.6, f + h * 0.6 + 0.25, w + w * 0.4, false);
}

/** bgn_stupa: { c, h, kind ('bell' | 'tall'), body, gilt, seed } — a stupa: square terraces, an octagonal platform, the bell, bands, the bud and the finial. */
export function stupa(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, h = el.h ?? 10, s = h / 12, body = el.body ?? WHITE, gil = el.gilt ? 'gilt_bronze' : body;
  const t1 = 3.4 * s, t2 = 2.7 * s;
  bag.add(BRICK, box(cx - t1 * 1.25, 0, cz - t1 * 1.25, cx + t1 * 1.25, 0.9 * s, cz + t1 * 1.25));
  bag.add(body, box(cx - t1, 0.9 * s, cz - t1, cx + t1, 1.8 * s, cz + t1));
  bag.add(body, box(cx - t2, 1.8 * s, cz - t2, cx + t2, 2.6 * s, cz + t2));
  col.rect([cx - t1 * 1.25, cz - t1 * 1.25, cx + t1 * 1.25, cz + t1 * 1.25], 0, 2.6 * s);
  col.circle(cx, cz, 2 * s, 2.6 * s, h);
  bag.add(body, lathe([[2.2 * s, 2.6 * s], [2.3 * s, 3.2 * s], [2.0 * s, 3.4 * s]], 8, null, cx, 0, cz));
  bag.add(body, lathe([[2.0 * s, 3.4 * s], [2.6 * s, 4.0 * s], [2.9 * s, 5.2 * s], [2.5 * s, 6.5 * s], [1.7 * s, 7.6 * s], [1.0 * s, 8.4 * s], [0.8 * s, 8.8 * s]], 16, null, cx, 0, cz));
  bag.add(gil, lathe([[0.8 * s, 8.8 * s], [1.15 * s, 9.05 * s], [0.7 * s, 9.3 * s], [0.95 * s, 9.55 * s], [0.5 * s, 9.8 * s], [0.62 * s, 10.0 * s], [0.3 * s, 10.3 * s], [0.3 * s, 10.7 * s], [0.001, 11.1 * s]], 12, null, cx, 0, cz));
  hti(bag, cx, 10.7 * s, cz, 1.3 * s, 0.6 * s);
  if (el.corners) for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) miniStupa(bag, cx + sx * t1 * 0.85, 1.8 * s, cz + sz * t1 * 0.85, 2.2 * s, body, el.gilt, 8);
}

/**
 * bgn_shwezigon: { c, h (48.8), seed } — the Shwezigon: five square terraces round a solid core, four stairs, the gilded bell on an octagonal platform, replicas at the corners,
 * four standing Buddha shrines on the faces.
 */
export function shwezigon(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, F = sideFrame(ctx, el.c, 'n');
  const halves = [32, 27.5, 23.5, 20, 17.2], hts = [2.6, 4.8, 7.0, 9.2, 11.4];
  let y0 = 0;
  halves.forEach((h, i) => {
    F.b(i === 0 ? BRICK : WHITE, -h, y0, -h, h, hts[i], h, true);
    F.b(TRIM, -h - 0.25, hts[i] - 0.3, -h - 0.25, h + 0.25, hts[i] + 0.03, h + 0.25, false);
    if (i > 0 && i < 4) F.b(GLAZE, -h - 0.05, y0 + 0.5, -h - 0.05, h + 0.05, y0 + 0.95, h + 0.05, false);
    y0 = hts[i];
    // the replicas at the corners of every terrace
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) miniStupa(bag, cx + sx * (h - 1.7), hts[i], cz + sz * (h - 1.7), i === 4 ? 6.5 : 4.5, WHITE, true, 8);
  });
  // the four stairs, up the middle of each face, to the top terrace: over each terrace's tread a flight to the next
  halves.forEach((h, i) => { F.floor(-h, -h, h, h, hts[i]); });
  for (const sd of SIDES) {
    const G = sideFrame(ctx, el.c, sd);
    for (let i = 0; i < 5; i++) {
      const outer = i ? halves[i - 1] : 35.5, inner = halves[i], yl = i ? hts[i - 1] : 0, yh = hts[i], n = 5, d = (outer - inner) / n;
      for (let j = 0; j < n; j++) G.b('brick_paving', -2.5, yl, inner, 2.5, yl + (yh - yl) * (j + 1) / n, outer - j * d, false);
      G.ramp(-2.5, inner, 2.5, outer, yl, yh, -1);
    }
  }
  // the octagonal platform and the gilded bell
  const top = hts[4], R = 13.2;
  const oct = [];
  for (let k = 0; k < 8; k++) { const a = (k + 0.5) / 8 * Math.PI * 2; oct.push([Math.cos(a) * R, Math.sin(a) * R]); }
  bag.add(WHITE, lathe([[R, top], [R, top + 2.2], [R * 0.93, top + 2.4]], 8, null, cx, 0, cz));
  col.circle(cx, cz, R * 0.95, top, top + 2.6);
  const y1 = top + 2.4, s = 1.0;
  bag.add('gilt_bronze', lathe([[11.2, y1], [11.3, y1 + 1.0], [10.6, y1 + 1.3], [10.0, y1 + 1.2]], 20, null, cx, 0, cz));
  bag.add('gilt_bronze', lathe([[10.0, y1 + 1.2], [10.8, y1 + 2.4], [10.9, y1 + 5], [9.6, y1 + 9.2], [7.2, y1 + 13], [4.6, y1 + 16.2], [2.8, y1 + 18.6], [2.2, y1 + 19.6]], 24, null, cx, 0, cz));
  bag.add('gilt_bronze', lathe([[2.2, y1 + 19.6], [3.0, y1 + 20.4], [2.0, y1 + 21.0], [2.6, y1 + 21.8], [1.5, y1 + 22.6], [1.6, y1 + 23.2], [0.9, y1 + 24.2], [0.9, y1 + 25.2], [0.001, y1 + 26.2]], 16, null, cx, 0, cz));
  hti(bag, cx, y1 + 25.4, cz, 6.5, 2.4);
  void oct; void s;
}
