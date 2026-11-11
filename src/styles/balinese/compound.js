// The walled family compound (docs/settlements/bali-village.md §4.1): wall, gate with its spirit wall, the sanggah in the kaja-kangin corner,
// the sleeping house (bale daja) at the back, the guest bale (dauh), the kitchen (paon), the rice barn (lumbung), the open natah between.
import { bx, steps, canang, rng, pick } from './kit.js';
import { wall, gate, shrine, padmasana, guardian } from './stone.js';
import { bale, house, paon, lumbung } from './bale.js';

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
    wl(a, b, [{ at: L * (gateU - 0.25) / (W - 0.5), w: gw }]);
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
      house({ rect: r, y, door: dirV(-1), roof: rich ? 'ijuk' : 'palm' }, ctx);
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
  // the natah: a few offerings by the gate's foot and before the sleeping house
  const g1 = RM(gateU, 0.6, gateU, 0.6);
  canang(ctx, g1[0], y + 0.01, g1[1], 1);
  if (el.penjor !== false) void pick;
  void steps; void guardian;
}
