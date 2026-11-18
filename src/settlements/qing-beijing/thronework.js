// The dragon throne and the gilt screen of the Hall of Supreme Harmony, modelled (docs/settlements/qing-beijing.md §37), seen through the
// open middle bay: the throne (1.73 m high) on its waisted base with lotus petals, a seat with cushion, the high back with two dragons
// in relief round the pearl and a third coiled in the crest, the round rail running into the arms that end in dragon heads; the screen of
// seven leaves, each a framed field with a gilt dragon in the round of its coils rising among cloud scrolls to the pearl, a cresting of
// cloud heads. bj_throne_hall wraps the style's throne_hall and leaves out its throne and screen (found by where they stand).
import { STYLES } from '../../core/build.js';
import { box } from '../../core/geom.js';
import { Parts } from '../../styles/qing/carving.js';
import { dragonRelief } from './dragonrelief.js';
import { ell, curve, cone, ring, spline, cloudScroll, reliefLine, h01, add } from './sculpt.js';

const X = [[1, 0, 0], [0, 1, 0], [0, 0, 1]], g = 'gilt_bronze', gold = 'gold';
/** A dragon's head in the round, facing +z, a unit about 0.3 m long: the skull, the long snout, the open jaw with teeth, the horns, the eyes, the whiskers. */
function head3(put, s = 1) {
  const E = (c, r, n = 8, m = 5) => put(ell(c.map((v) => v * s), r.map((v) => v * s), X, n, m)), C = (pts, r0, r1, o = {}) => put(curve(pts.map((p) => p.map((v) => v * s)), r0 * s, r1 * s, { n: 6, per: 3, ...o }));
  E([0, 0, 0], [0.11, 0.1, 0.12], 9, 6);
  E([0, -0.01, 0.17], [0.075, 0.055, 0.12], 8, 5); E([0, 0.01, 0.3], [0.06, 0.045, 0.05], 8, 4);
  E([0, -0.07, 0.15], [0.055, 0.025, 0.1], 7, 4);
  for (const x of [-1, 1]) {
    E([x * 0.06, 0.06, 0.07], [0.03, 0.03, 0.03], 7, 4); E([x * 0.06, 0.1, 0.05], [0.05, 0.015, 0.04], 6, 3);
    C([[x * 0.04, 0.08, -0.03], [x * 0.1, 0.17, -0.12], [x * 0.09, 0.27, -0.2]], 0.02, 0.005);
    C([[x * 0.04, 0.0, 0.32], [x * 0.14, -0.06, 0.3], [x * 0.22, -0.16, 0.18], [x * 0.2, -0.25, 0.1]], 0.006, 0.003, { n: 4 });
    put(cone([x * 0.025, -0.03, 0.28].map((v) => v * s), [x * 0.025 * s, -0.09 * s, 0.28 * s], 0.012 * s, 4));
    put(cone([x * 0.02 * s, -0.08 * s, 0.26 * s], [x * 0.02 * s, -0.03 * s, 0.26 * s], 0.01 * s, 4));
  }
  for (let k = 0; k < 4; k++) C([[0, 0.06 - k * 0.01, -0.06 - k * 0.04], [0, 0.1 - k * 0.04, -0.14 - k * 0.07]], 0.04, 0.012, { n: 5 });
}
function throne(P) {
  const G = (gg) => P.add(g, gg), K = (gg) => P.add(gold, gg), W = 0.8, D = 0.4;
  P.add(g, box(-W, 0, -D, W, 0.07, D));
  for (const [x, z] of [[-W + 0.06, -D + 0.06], [W - 0.06, -D + 0.06], [-W + 0.06, D - 0.06], [W - 0.06, D - 0.06]]) { G(curve([[x, 0.07, z], [x * 0.98, 0.18, z], [x * 0.96, 0.3, z * 0.96]], 0.07, 0.055, { n: 8, swell: 0.2 })); K(ell([x, 0.1, z], [0.08, 0.05, 0.08], X, 7, 4)); }
  P.add(g, box(-W + 0.02, 0.28, -D + 0.02, W - 0.02, 0.33, D - 0.02));
  P.add(gold, box(-W + 0.06, 0.33, -D + 0.06, W - 0.06, 0.38, D - 0.06));
  P.add(g, box(-W, 0.38, -D, W, 0.49, D));
  // the lotus petals along the waist and the dragons' scrolls on the base's face
  for (let i = 0; i < 16; i++) { const x = -W + 0.05 + (i + 0.5) * (2 * W - 0.1) / 16; K(ell([x, 0.2, D - 0.02], [0.045, 0.06, 0.018], X, 6, 4)); }
  for (const s of [-1, 1]) for (const gg of cloudScroll(s * 0.45, 0.19, 0.28, 0.012, s, D - 0.03)) K(gg);
  P.add('cloth_ochre', ell([0, 0.52, 0.04], [0.6, 0.06, 0.3], X, 12, 5));
  // the back: frame, field, two dragons round the pearl, the crest with a third dragon
  P.add(g, box(-0.52, 0.56, -0.4, 0.52, 1.5, -0.33));
  P.add('lacquer_red', box(-0.45, 0.62, -0.33, 0.45, 1.42, -0.315));
  for (const k of [-1, 1]) {
    const pts = [[0.08, 0.0], [0.2, 0.12], [0.34, -0.06], [0.28, -0.24], [0.12, -0.27], [0.06, -0.15]].map(([u, v]) => [k * u * 1.05, 1.1 + v * 1.1]);
    const D2 = dragonRelief(spline(pts, 6), 0.03, 0.022, { lite: true, flip: k, step: 0.022, pearlAt: k > 0 ? [0, 1.14] : null, seed: k });
    for (const gg of D2.out) { gg.translate(0, 0, -0.315); K(gg); }
    for (const gg of D2.gilt) { gg.translate(0, 0, -0.315); G(gg); }
  }
  const crest = []; for (let i = 0; i <= 14; i++) { const a = i / 14 * Math.PI; crest.push([-Math.cos(a) * 0.55, 1.47 + Math.sin(a) * 0.22, -0.37]); }
  G(curve(crest, 0.05, 0.05, { n: 7, per: 1 }));
  const cp = []; for (let i = 0; i <= 12; i++) { const t = i / 12, a = t * Math.PI * 3.2; cp.push([Math.cos(a) * (0.14 - t * 0.09), 1.72 + Math.sin(a) * (0.1 - t * 0.06), -0.36]); }
  const D3 = dragonRelief(spline(cp.reverse(), 4), 0.022, 0.02, { lite: true, step: 0.018 });
  for (const gg of D3.out) K(gg);
  for (const s of [-1, 1]) K(ell([s * 0.55, 1.5, -0.37], [0.07, 0.11, 0.06], X, 6, 4));
  // the round rail and the arms, ending in dragon heads facing forward
  const rail = [[-0.74, 0.86, 0.36], [-0.75, 0.88, 0.1], [-0.72, 0.94, -0.18], [-0.58, 1.02, -0.33], [-0.3, 1.08, -0.38], [0, 1.1, -0.39], [0.3, 1.08, -0.38], [0.58, 1.02, -0.33], [0.72, 0.94, -0.18], [0.75, 0.88, 0.1], [0.74, 0.86, 0.36]];
  G(curve(rail, 0.055, 0.055, { n: 8, per: 4 }));
  for (const k of [-1, 1]) {
    G(curve([[k * 0.74, 0.49, 0.34], [k * 0.74, 0.86, 0.36]], 0.05, 0.05, { n: 6, per: 1 }));
    P.add(g, box(k * 0.74 - 0.03, 0.49, -0.3, k * 0.74 + 0.03, 0.88, 0.3));
    const H = new Parts(); head3((q) => H.add(gold, q), 1.0); for (const [m, l] of H.m) for (const q of l) { q.translate(k * 0.75, 0.9, 0.44); P.add(m, q); }
    // the scales along the arm: a row of overlapping gilt scales over the rail
    for (let i = 0; i < 10; i++) { const t = i / 9, p = rail[k < 0 ? Math.min(9, Math.round(t * 4)) : 10 - Math.min(9, Math.round(t * 4))]; K(ell([p[0], p[1] + 0.045, p[2]], [0.035, 0.012, 0.04], X, 5, 3)); }
  }
  const pc = [0, 1.22, -0.29]; K(ell(pc, [0.05, 0.05, 0.04], X, 8, 5));
}
function screen(P, n = 7, Hc = 4.4, dh = 0.32, w = 1.1) {
  const half = (n - 1) / 2, G = (gg) => P.add(g, gg), K = (gg) => P.add(gold, gg);
  let x = -w * n / 2;
  P.add(g, box(-w * n / 2 - 0.15, 0, -0.32, w * n / 2 + 0.15, 0.32, 0.22));
  P.add(gold, box(-w * n / 2 - 0.1, 0.32, -0.28, w * n / 2 + 0.1, 0.38, 0.18));
  for (let i = 0; i < 24; i++) { const xx = -w * n / 2 + (i + 0.5) * (w * n) / 24; K(ell([xx, 0.18, 0.22], [0.1, 0.1, 0.025], X, 7, 4)); }
  for (let k = 0; k < n; k++, x += w) {
    const d = Math.abs(k - half), h = Hc - d * dh, x0 = x + 0.01, x1 = x + w - 0.01, cx = (x0 + x1) / 2, turn = (k - half) * 0.03;
    P.add(g, box(x0, 0.38, -0.12, x0 + 0.08, h, 0.06)); P.add(g, box(x1 - 0.08, 0.38, -0.12, x1, h, 0.06));
    P.add(g, box(x0 + 0.08, h - 0.1, -0.12, x1 - 0.08, h, 0.06)); P.add(g, box(x0 + 0.08, 0.38, -0.12, x1 - 0.08, 0.78, 0.06));
    P.add('lacquer_red', box(x0 + 0.08, 0.78, -0.09, x1 - 0.08, h - 0.1, 0.0));
    P.add(gold, box(x0 + 0.12, 0.44, 0.06, x1 - 0.12, 0.72, 0.075));
    for (const gg of cloudScroll(cx, 0.58, 0.3, 0.012, 1, 0.075)) K(gg);
    // the dragon of the leaf: a coil rising to the pearl, among clouds
    const hh = h - 1.15, dr = k < half ? 1 : -1, ph = k % 2 ? -1 : 1;
    const ctl = [[0.1, 0.92], [0.3, 0.85], [0.36, 0.68], [0.1, 0.56], [-0.18, 0.46], [-0.3, 0.3], [-0.05, 0.16], [0.2, 0.08], [0.28, 0.0]].map(([u, v]) => [cx + u * w * 0.9 * ph * dr, 0.85 + v * hh]);
    const Dg = dragonRelief(spline(ctl, 7), 0.055 + 0.01 * (half - d) / half, 0.04, { flip: dr, pearlAt: [cx + 0.0, 0.85 + hh * 0.95], seed: k, step: 0.06 });
    for (const gg of Dg.out) { gg.translate(0, 0, 0.0); K(gg); }
    for (const gg of Dg.gilt) G(gg);
    for (let j = 0; j < 3; j++) for (const gg of cloudScroll(cx + (j % 2 ? 0.2 : -0.22), 1.2 + j * hh / 3.4, 0.22, 0.02, j % 2 ? 1 : -1, 0.0)) K(gg);
    // the cresting
    const cr = []; for (let i = 0; i <= 8; i++) { const a = i / 8 * Math.PI; cr.push([cx - Math.cos(a) * (w / 2 - 0.04), h + Math.sin(a) * 0.22, -0.03]); }
    G(curve(cr, 0.045, 0.045, { n: 6, per: 1 }));
    for (const s of [-1, 1]) for (const gg of cloudScroll(cx + s * w * 0.22, h + 0.1, 0.26, 0.02, s, -0.03)) K(gg);
    K(ell([cx, h + 0.3, -0.03], [0.07, 0.12, 0.07], X, 7, 5));
    void turn;
  }
}
/** Is the geometry g wholly inside the box [x0, y0, z0, x1, y1, z1] (a little slack)? */
function inside(g, b) {
  const a = g.attributes.position.array;
  for (let i = 0; i < a.length; i += 3) if (a[i] < b[0] - 0.05 || a[i + 1] < b[1] - 0.05 || a[i + 2] < b[2] - 0.05 || a[i] > b[3] + 0.05 || a[i + 1] > b[4] + 0.05 || a[i + 2] > b[5] + 0.05) return false;
  return true;
}
function bjThroneHall(el, ctx) {
  const [x0, z0, x1] = el.rect, y = el.y, cx = (x0 + x1) / 2, hd = 3.4, tz = z0 + 1.6 + hd + 1.2, top = y + 2.0, sz = tz - hd + 1.35, zb = tz - hd + 0.42;
  const boxes = [[cx - 1.0, top - 0.01, sz - 0.5, cx + 1.0, top + 2.0, sz + 0.55], [cx - 4.0, top - 0.01, zb - 0.4, cx + 4.0, top + 5.0, zb + 0.35]];
  const base = ctx.bag, w = Object.create(base);
  w.add = (m, gg) => { if (gg && gg.attributes && !gg.index && boxes.some((b) => inside(gg, b))) return; base.add(m, gg); };
  STYLES.qing.elements.throne_hall(el, { ...ctx, bag: w });
  const T = new Parts(); throne(T); T.emit(base, cx, top, sz, 0, 1);
  const S = new Parts(); screen(S); S.emit(base, cx, top, zb);
}
STYLES.qing.elements.bj_throne_hall = bjThroneHall;
void box; void ring; void reliefLine; void h01; void add;
