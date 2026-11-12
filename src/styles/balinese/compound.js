// The walled family compound (docs/settlements/bali-village.md §4.1): wall, gate with its spirit wall, the sanggah in the kaja-kangin corner,
// the sleeping house (bale daja) at the back, the guest bale (dauh), the kitchen (paon), the rice barn (lumbung), the open natah between.
import { bx, steps, canang, rng, pick } from './kit.js';
import { wall, gate, shrine, padmasana, guardian } from './stone.js';
import { bale, house, paon, lumbung } from './bale.js';
import { shop } from './shops.js';
import { lathe } from '../../core/geom.js';
import { shrine as shrineOf } from './stone.js';

/** bali_compound: { rect, front ('n'|'s'|'e'|'w': the side the street is on), seed, rich, y } */
export function compound(el, ctx) {
  const [x0, z0, x1, z1] = el.rect, rand = rng(el.seed), y = el.y ?? 0, f = el.front, rich = el.rich ?? rand() < 0.6;
  const alongX = f === 'n' || f === 's';
  const W = alongX ? x1 - x0 : z1 - z0, D = alongX ? z1 - z0 : x1 - x0;
  // frame: u along the street (from the left as one looks from the street into the lot), v from the street inward
  const P = (u, v) => (f === 'n' ? [x0 + u, z0 + v] : f === 's' ? [x1 - u, z1 - v] : f === 'w' ? [x0 + v, z1 - u] : [x1 - v, z0 + u]);
  const R = (u0, v0, u1, v1) => { const a = P(u0, v0), b = P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const dirV = (s) => (f === 'n' ? (s > 0 ? 's' : 'n') : f === 's' ? (s > 0 ? 'n' : 's') : f === 'w' ? (s > 0 ? 'e' : 'w') : (s > 0 ? 'w' : 'e'));
  const dirU = (s) => (f === 'n' ? (s > 0 ? 'e' : 'w') : f === 's' ? (s > 0 ? 'w' : 'e') : f === 'w' ? (s > 0 ? 'n' : 's') : (s > 0 ? 's' : 'n'));
  // which back corner is the kaja-kangin (north-east) one: the one whose world x − z is the larger
  const cL = P(0, D), cR = P(W, D), left = cL[0] - cL[1] >= cR[0] - cR[1];
  const M = (u) => (left ? u : W - u);                        // mirror so that the sanggah side is canonical "u small"
  const RM = (u0, v0, u1, v1) => R(M(u0), v0, M(u1), v1);
  const sgn = left ? 1 : -1;                                  // +u of the canonical frame in the real frame's u
  const th = 0.5, h = rich ? 2.4 : 2.0, mat = rich ? 'brick' : 'earth_wall', cap = rich ? 'stone' : 'thatch';
  const gateU = W * (el.gateF ?? 0.5);
  const wl = (a, b, gaps) => wall({ a, b, h, th, mat, cap, gaps, y }, ctx);
  // the four walls (centre lines on the lot's edge, inset by half the thickness)
  const c00 = P(0, 0), c10 = P(W, 0), c01 = P(0, D), c11 = P(W, D);
  const ins = (p, q) => { const dx = Math.sign(q[0] - p[0]), dz = Math.sign(q[1] - p[1]); return [p, q, dx, dz]; };
  void ins;
  const gw = 2.2;
  // street wall with the gap for the gate; the other three whole
  {
    const a = P(0.25, 0.25), b = P(W - 0.25, 0.25);
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const gaps = [{ at: L * (gateU - 0.25) / (W - 0.5), w: gw }];
    if (el.shop) gaps.push({ at: L * ((el.shop.u0 + el.shop.u1) / 2 - 0.25) / (W - 0.5), w: el.shop.u1 - el.shop.u0 + 0.3 });
    wl(a, b, gaps);
  }
  wl(P(0.25, D - 0.25), P(W - 0.25, D - 0.25));
  wl(P(0.25, 0.25), P(0.25, D - 0.25)); wl(P(W - 0.25, 0.25), P(W - 0.25, D - 0.25));
  void c00; void c10; void c01; void c11;
  const gp = P(gateU, 0.25);
  gate({ at: gp, axis: alongX ? 'x' : 'z', w: gw, h: 2.7, y, face: (f === 'n' || f === 'w') ? -1 : 1, rich }, ctx);
  // the sanggah yard, canonical left-back corner: a low walled yard 6 × 6 with its shrines
  {
    const sv0 = D - 7.2, sv1 = D - 0.6, su0 = 0.6, su1 = 6.8, lw = 0.9;
    const w4 = [[su0, sv0, su1, sv0 + 0.25], [su0, sv0, su0 + 0.25, sv1], [su1 - 0.25, sv0, su1, sv1]];
    for (const q of w4) { const r = RM(...q); bx(ctx, 'brick', r[0], y, r[1], r[2], y + lw, r[3], true); bx(ctx, 'tuff_hewn', r[0] - 0.04, y + lw, r[1] - 0.04, r[2] + 0.04, y + lw + 0.1, r[3] + 0.04); }
    // the front wall (toward the natah) with a gap
    for (const q of [[su0, sv0 - 0.0, su0 + 1.6, sv0 + 0.25], [su1 - 1.6, sv0, su1, sv0 + 0.25]]) { void q; }
    const mid = (su0 + su1) / 2;
    const cp = RM(mid, (sv0 + sv1) / 2, mid, (sv0 + sv1) / 2);
    const at = (u, v) => RM(u, v, u, v);
    // three-chambered shrine against the back (kaja) wall, the padmasana beside it
    const s1 = at(su0 + 2.6, sv1 - 1.0), s2 = at(su1 - 1.3, sv1 - 1.2);
    shrine({ c: [s1[0], s1[1]], y, kind: 'rongtiga', face: dirV(-1) }, ctx);
    padmasana({ c: [s2[0], s2[1]], y, s: 0.55 }, ctx);
    const t = at(su0 + 0.95, sv0 + 1.2); shrine({ c: [t[0], t[1]], y, kind: 'taksu', face: dirV(-1) }, ctx);
    for (let k = 0; k < 3; k++) { const o = at(su0 + 2.6 + k * 0.9, sv1 - 2.4); canang(ctx, o[0], y + 0.02, o[1], k); }
    void cp;
  }
  // the sleeping house across the back, door to the natah
  {
    const hu0 = 8.8, hu1 = Math.min(W - 2.2, hu0 + 6.4), hv1 = D - 1.9, hv0 = hv1 - 3.2;
    if (hu1 - hu0 >= 3.2) {
      const r = RM(hu0, hv0, hu1, hv1);
      house({ rect: r, y, door: dirV(-1), roof: rich ? 'ijuk' : 'palm', seed: el.seed }, ctx);
    }
  }
  // the guest bale on the side opposite the sanggah (u large), open to the natah
  {
    const bu1 = W - 0.9, bu0 = bu1 - 3.6, bv0 = 6.5 + rand() * 2, bv1 = bv0 + 5.2;
    bale({ rect: RM(bu0, bv0, bu1, bv1), y, floor: 0.55, h: 2.3, bays: [1, 2], walls: 'back', stairs: dirU(-sgn), furnish: 'mats', roof: rich ? 'palm' : 'thatch', seed: el.seed }, ctx);
  }
  // the kitchen toward kelod: on the sanggah side near the front; the rice barn beside it
  {
    const pu0 = 0.9, pv0 = 3.4, pr = RM(pu0, pv0, pu0 + 3.8, pv0 + 3.2);
    paon({ rect: pr, y, stairs: dirU(sgn), seed: el.seed }, ctx);
    const lc = RM(pu0 + 1.0, pv0 + 6.2, pu0 + 1.0, pv0 + 6.2);
    lumbung({ c: [lc[0], lc[1]], y }, ctx);
  }
  if (el.shop) shop({ rect: el.rect, front: f, shop: el.shop, seed: el.seed, y }, ctx);
  // the variants of the plan: a bale dangin on the east of the natah, or a second barn
  const variant = (el.seed >>> 3) % 3;
  if (variant === 1 && D >= 21) bale({ rect: RM(10.0, 11.8, 13.6, 15.0), y, floor: 0.5, h: 2.2, bays: [1, 1], walls: 'none', stairs: dirV(-1), furnish: 'mats', roof: 'thatch', seed: el.seed + 3 }, ctx);
  if (variant === 2) { const lc2 = RM(9.4, 11.2, 9.4, 11.2); lumbung({ c: [lc2[0], lc2[1]], y }, ctx); }
  // the pig sty toward the kelod corner of the natah: a low brick pen with a lean-to of thatch
  {
    const r = RM(4.3, 8.6, 6.5, 10.2), th2 = 0.18;
    bx(ctx, 'brick', r[0], y, r[1], r[2], y + 0.9, r[1] + th2, true); bx(ctx, 'brick', r[0], y, r[3] - th2, r[2], y + 0.9, r[3], true);
    bx(ctx, 'brick', r[0], y, r[1], r[0] + th2, y + 0.9, r[3], true); bx(ctx, 'brick', r[2] - th2, y, r[1], r[2], y + 0.9, r[3], true);
    bx(ctx, 'earth_wall', r[0] + th2, y, r[1] + th2, r[2] - th2, y + 0.04, r[3] - th2);
    bx(ctx, 'thatch', r[0] - 0.2, y + 1.25, r[1] - 0.2, r[2] + 0.2, y + 1.4, (r[1] + r[3]) / 2 + 0.2);
    for (const [px, pz] of [[r[0], r[1]], [r[2], r[1]]]) bx(ctx, 'wood_dark', px - 0.04, y + 0.9, pz - 0.04, px + 0.04, y + 1.3, pz + 0.04);
    const t = RM(5.4, 9.4, 5.4, 9.4); bx(ctx, 'timber', t[0] - 0.4, y, t[1] - 0.12, t[0] + 0.4, y + 0.14, t[1] + 0.12);
  }
  // the natah's furniture: paddy drying on a mat in the sun, the cocks under their wicker domes, the water jar by the kitchen, the offering stand
  {
    const m = RM(9.4, 8.6, 12.2, 10.0); bx(ctx, 'reed_mat', m[0], y, m[1], m[2], y + 0.025, m[3]); bx(ctx, 'paint_ochre', m[0] + 0.1, y + 0.025, m[1] + 0.1, m[2] - 0.1, y + 0.06, m[3] - 0.1);
    for (let k = 0; k < 3; k++) { const c = P(gateU + (k - 1) * 0.7 + (gateU > W / 2 ? 3.6 : -3.6), 7.3 + (k % 2) * 0.5); ctx.bag.add('wicker', lathe([[0.001, 0.36], [0.12, 0.33], [0.24, 0.2], [0.27, 0.0]], 8, null, c[0], y, c[1])); }
    const j = RM(5.1, 3.5, 5.1, 3.5); ctx.bag.add('terracotta', lathe([[0.001, 0], [0.2, 0.02], [0.28, 0.25], [0.22, 0.5], [0.16, 0.56]], 8, null, j[0], y, j[1]));
    const lg = RM(10.8, 5.0, 12.2, 5.6); bx(ctx, 'log_pine', lg[0], y, lg[1], lg[2], y + 0.5, lg[3]);
  }
  // the front of the compound at eye level, on the street: shelves for offerings let into the wall, bougainvillea over the coping, a bench and water jar by the gate, the tugu
  {
    const span = el.shop ? [el.shop.u0 - 0.5, el.shop.u1 + 0.5] : null, free = (u, w = 0.6) => Math.abs(u - gateU) > 2.9 && (!span || u + w < span[0] || u > span[1]);
    let n = 0;
    for (let k = 0; k < 14 && n < 3; k++) {
      const u = 1.2 + rand() * (W - 3.0);
      if (!free(u, 1.2)) continue;
      n++;
      if (n === 1 || rand() < 0.5) { const r = R(u, -0.24, u + 0.55, 0); bx(ctx, 'tuff_hewn', r[0], y + 1.35, r[1], r[2], y + 1.45, r[3]); const p = P(u + 0.28, -0.1); canang(ctx, p[0], y + 1.45, p[1], k); }
      else { const r = R(u, -0.06, u + 1.2, 0.56); bx(ctx, 'cloth_green', r[0], y + h + 0.1, r[1], r[2], y + h + 0.5, r[3]); const q = R(u + 0.1, -0.1, u + 1.0, 0.0); bx(ctx, 'cloth_red', q[0], y + h + 0.22, q[1], q[2], y + h + 0.44, q[3]); }
    }
    const side = gateU > W / 2 ? 1 : -1, bu = gateU + side * 3.1;
    if (bu > 1.2 && bu < W - 1.2 && free(bu, 0.8)) {
      const r = R(bu - 0.75, -0.95, bu + 0.75, -0.45); bx(ctx, 'bamboo_culm', r[0], y + 0.42, r[1], r[2], y + 0.5, r[3]);
      for (const [a, b] of [[r[0] + 0.06, r[1] + 0.06], [r[2] - 0.1, r[1] + 0.06], [r[0] + 0.06, r[3] - 0.1], [r[2] - 0.1, r[3] - 0.1]]) bx(ctx, 'wood_dark', a, y, b, a + 0.04, y + 0.42, b + 0.04);
    }
    const ju = gateU - side * 3.2;
    if (ju > 1.0 && ju < W - 1.0 && free(ju, 0.6)) { const p = P(ju, -0.45); ctx.bag.add('terracotta', lathe([[0.001, 0], [0.18, 0.02], [0.26, 0.22], [0.2, 0.44], [0.14, 0.5]], 8, null, p[0], y, p[1])); }
    const tu = gateU + side * 3.6, tp = P(tu, 1.5);
    if (el.penjor !== false && tu > 1.2 && tu < W - 1.2 && free(tu, 0.8) && !el.shop) shrineOf({ c: [tp[0], tp[1]], y, kind: 'small' }, ctx);
  }
  // the lamak, a strip of palm-leaf and cloth hung from the gate's lintel on the street side
  { const lp = P(gateU, -0.2), lr = P(gateU + 0.22, -0.17); bx(ctx, 'cloth_ochre', Math.min(lp[0], lr[0]) - 0.01, y + 1.6, Math.min(lp[1], lr[1]) - 0.01, Math.max(lp[0], lr[0]) + 0.01, y + 2.55, Math.max(lp[1], lr[1]) + 0.01); }
  // the natah: a few offerings by the gate's foot and before the sleeping house
  const g1 = RM(gateU, 0.6, gateU, 0.6);
  canang(ctx, g1[0], y + 0.01, g1[1], 1);
  if (el.penjor !== false) void pick;
  void steps; void guardian;
}
