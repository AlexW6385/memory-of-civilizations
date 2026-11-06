// The Phoenix Hall's own pieces, on top of the Japanese style (src/styles/japanese): Jōchō's Amida of 1053 —
// seated in meditation on a tall lotus pedestal hung with jewel garlands, before a pointed mandorla whose
// double halo is ringed by openwork scrolls, flame tongues and flying apsaras — and the fifty-two
// bodhisattvas on clouds, each at its own task: playing a flute, a lute, a drum, praying, dancing, offering a lotus.
// docs/buildings/byodo-in-phoenix-hall.md §4, §8.

import '../../styles/japanese/index.js';
import { STYLES, registerStyle } from '../../core/build.js';
import { lathe, fromTriangles, box } from '../../core/geom.js';
import { buddha, ellipsoid, petal, hexa } from '../../styles/chinese/index.js';

// a rod from a to b (radius r0 → r1), and a chain of them through points
function rod(a, b, r0, r1 = r0, seg = 6) {
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = Math.hypot(...d) || 1e-6;
  const n = d.map((v) => v / L), up = Math.abs(n[1]) < 0.95 ? [0, 1, 0] : [1, 0, 0];
  const e1 = norm(cross(n, up)), e2 = cross(n, e1), tris = [];
  const P = (t, k) => { const r = r0 + (r1 - r0) * t, a2 = (k / seg) * Math.PI * 2; return [a[0] + d[0] * t + (e1[0] * Math.cos(a2) + e2[0] * Math.sin(a2)) * r, a[1] + d[1] * t + (e1[1] * Math.cos(a2) + e2[1] * Math.sin(a2)) * r, a[2] + d[2] * t + (e1[2] * Math.cos(a2) + e2[2] * Math.sin(a2)) * r]; };
  for (let k = 0; k < seg; k++) {
    const A = P(0, k), B = P(0, k + 1), C = P(1, k + 1), D = P(1, k);
    tris.push(...A, ...B, ...C, ...A, ...C, ...D);
    tris.push(...a, ...B, ...A, ...b, ...D, ...C);
  }
  return fromTriangles(tris);
}
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(...a) || 1; return a.map((v) => v / l); };
const chain = (out, pts, r) => { for (let i = 0; i < pts.length - 1; i++) out.push(rod(pts[i], pts[i + 1], r)); };

/**
 * Jōchō's Amida { at, y (top of the altar), h (2.77 m), dir }: the pedestal — an octagonal plinth of black lacquer edged in
 * gilt, a waist hung with garlands of beads, a flaring tier, the lotus of three rows of petals and its seed pod; the Buddha in
 * the meditation mudra, all gilt; behind, the mandorla.
 */
function amida(el, ctx) {
  const { bag } = ctx;
  const [x, z] = el.at, y = el.y, d = el.dir || [1, 0], u = [-d[1], d[0]];
  const L = [], G = [], tri = [];
  L.push(lathe([[1.5, 0], [1.5, 0.28], [1.4, 0.34], [1.4, 0.5], [1.22, 0.56], [1.02, 0.6], [1.0, 0.96], [1.18, 1.02], [1.3, 1.1], [1.3, 1.16], [0.001, 1.16]], 8, null, x, y, z).rotateY(0));
  for (const [r, yy] of [[1.52, 0.28], [1.42, 0.5], [1.32, 1.12]]) G.push(lathe([[r, -0.025], [r + 0.025, 0], [r, 0.025]], 8, null, x, y + yy, z));
  // the garlands (yōraku) on the waist: festoons of glass beads between gilt bosses
  for (let i = 0; i < 16; i++) {
    const a0 = (i / 16) * Math.PI * 2, a1 = ((i + 1) / 16) * Math.PI * 2, r = 1.04;
    G.push(ellipsoid([x + Math.cos(a0) * r, y + 0.9, z + Math.sin(a0) * r], 0.04, 0.04, 0.04, 6, 3));
    for (let k = 1; k < 6; k++) {
      const t = k / 6, a = a0 + (a1 - a0) * t, sag = Math.sin(Math.PI * t) * 0.18;
      G.push(ellipsoid([x + Math.cos(a) * (r + 0.01), y + 0.9 - sag, z + Math.sin(a) * (r + 0.01)], 0.022, 0.022, 0.022, 5, 3));
    }
    G.push(ellipsoid([x + Math.cos((a0 + a1) / 2) * 1.05, y + 0.66, z + Math.sin((a0 + a1) / 2) * 1.05], 0.03, 0.06, 0.03, 6, 3));
  }
  // the lotus: a drum, three rows of upturned petals, the flat seed pod on which the Buddha sits
  G.push(lathe([[0.001, 1.16], [1.0, 1.16], [0.9, 1.3], [0.92, 1.9], [1.05, 2.0], [0.001, 2.0]], 24, null, x, y, z));
  for (const [n, r0, y0, len, w, lift, off] of [[16, 0.9, 1.28, 0.5, 0.26, 1.1, 0], [16, 0.88, 1.5, 0.52, 0.27, 1.2, 0.5], [16, 0.86, 1.72, 0.48, 0.26, 1.32, 0]]) {
    for (let i = 0; i < n; i++) tri.push(...petal(((i + off) / n) * Math.PI * 2, r0, y0, len, w, lift));
  }
  const pg = fromTriangles(tri); pg.translate(x, y, z); G.push(pg);
  for (const g of L) bag.add('lacquer_black', g);
  for (const g of G) bag.add('clay_gilt', g);
  const s = (el.h || 2.77) / 2.92;
  buddha({ at: [x, z], y: y + 2.0 - 1.6 * s, h: 5.2 * s, dir: d, robe: 'clay_gilt', gilt: 'clay_gilt', noThrone: true, noHalo: true, mudra: 'dhyana' }, ctx);
  mandorla(bag, x, z, y + 2.0, d, u, s);
}

/**
 * The mandorla: a pointed leaf 4.6 m high, 0.8 m behind the figure. The head halo and body halo as gilt plates with raised rims
 * and lotus rosettes; round them an openwork field of scrolls; on its edge flame tongues; twelve flying apsaras in the field,
 * their scarves streaming. [inferred: the mandorla's composition from photographs; its apsaras are recorded]
 */
function mandorla(bag, x, z, y0, d, u, s) {
  const back = 0.8, M = (p, q, t) => [x - d[0] * (back - t) + u[0] * p, y0 + q, z - d[1] * (back - t) + u[1] * p];
  const plate = [], scroll = [], figs = [];
  const disc = (cq, r0, r1, t0, t1, n = 40) => {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2, b = ((i + 1) / n) * Math.PI * 2;
      const P = (r, ang, t) => M(Math.cos(ang) * r, cq + Math.sin(ang) * r, t);
      hexa(plate, [P(r0, a, t0), P(r1, a, t0), P(r1, b, t0), P(r0, b, t0)], [P(r0, a, t1), P(r1, a, t1), P(r1, b, t1), P(r0, b, t1)]);
    }
  };
  const hq = 3.0 * s + 0.35, bq = 1.45 * s + 0.3;            // the head and the body halo's centres above the lotus
  disc(bq, 0.001, 1.25, 0, 0.05); disc(bq, 1.18, 1.3, 0.05, 0.09); disc(bq, 0.78, 0.84, 0.05, 0.08);
  disc(hq, 0.001, 0.72, 0.06, 0.11); disc(hq, 0.66, 0.76, 0.11, 0.15); disc(hq, 0.34, 0.39, 0.11, 0.14);
  // rosettes of petals in the halos' bands
  for (const [cq, r, n] of [[hq, 0.53, 12], [bq, 1.01, 20]]) for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, c = M(Math.cos(a) * r, cq + Math.sin(a) * r, 0.12);
    figs.push(ellipsoid(c, 0.06, 0.06, 0.03, 8, 3));
  }
  // the outline: a pointed leaf from the lotus up past the head
  const H = 4.6, W = 1.95, outline = (t) => {
    // t in [0, 1] from the bottom centre up one side to the tip
    const q = H * t, w = W * Math.sin(Math.PI * Math.pow(t, 0.8)) * (1 - 0.25 * t);
    return [w, q];
  };
  // openwork scrolls: S-curves of thin rods filling the band between the halos and the outline
  for (const sd of [-1, 1]) {
    for (let k = 0; k < 9; k++) {
      const t = 0.1 + k * 0.095, [w, q] = outline(t), inner = 0.55;
      const pts = [];
      for (let j = 0; j <= 8; j++) {
        const f = j / 8, p = sd * (w * (inner + (1 - inner) * f) - 0.12), qq = q + 0.18 * Math.sin(f * Math.PI * 2 + k);
        pts.push(M(p, qq, 0.03));
      }
      chain(scroll, pts, 0.022);
    }
    // the rim of the leaf, a double rod, and flame tongues standing out from it
    const rim = [], rim2 = [];
    for (let j = 0; j <= 30; j++) { const [w, q] = outline(j / 30); rim.push(M(sd * w, q, 0.03)); rim2.push(M(sd * w * 0.94, q * 0.985, 0.03)); }
    chain(scroll, rim, 0.035); chain(scroll, rim2, 0.022);
    for (let j = 2; j < 30; j += 2) {
      const [w, q] = outline(j / 30), [w2, q2] = outline((j + 1.6) / 30);
      const tip = [sd * (w + 0.22), q + 0.3];
      plate.push(...M(sd * w, q, 0.0), ...M(tip[0], tip[1], 0.015), ...M(sd * w2, q2, 0.0), ...M(sd * w, q, 0.0), ...M(sd * w2, q2, 0.0), ...M(tip[0], tip[1], 0.015));
    }
  }
  // twelve flying apsaras in the field, six a side, rising toward the tip
  for (let i = 0; i < 12; i++) {
    const sd = i % 2 ? 1 : -1, k = Math.floor(i / 2), t = 0.18 + k * 0.13, [w] = outline(t);
    const p = sd * w * 0.78, q = H * t, c = (dp, dq, dt = 0.08) => M(p + sd * dp, q + dq, dt);
    figs.push(ellipsoid(c(0, 0), 0.07, 0.13, 0.06, 8, 4), ellipsoid(c(0, 0.18), 0.05, 0.06, 0.05, 8, 4));
    figs.push(rod(c(0, -0.1), c(-0.22, -0.3), 0.045, 0.02));                       // the trailing legs
    chain(figs, [c(-0.05, 0.08), c(-0.3, 0.2), c(-0.5, 0.05), c(-0.62, 0.22)], 0.015);   // the scarf streaming behind
    figs.push(rod(c(0.03, 0.08), c(0.16, 0.2), 0.02));                              // an arm holding up an offering
    figs.push(ellipsoid(c(0.18, 0.23), 0.04, 0.04, 0.03, 6, 3));
  }
  bag.add('clay_gilt', fromTriangles(plate));
  for (const g of [...scroll, ...figs]) bag.add('clay_gilt', g);
}

const KINDS = ['flute', 'biwa', 'drum', 'pray', 'dance', 'lotus', 'sho', 'pray'];
/**
 * A bodhisattva on a cloud, applied high on the wall { at, y, dir (out of the wall), kind }: about 0.6 m, seated (or standing to
 * dance) on a cloud of billows whose tail curls up behind; the hair in a chignon, a halo; the hands at the task: a flute held
 * across, a lute (biwa) on the lap, a drum, joined in prayer, raised in the dance, a lotus bud, a mouth organ (shō).
 */
function cloudBodhisattva(el, { bag }) {
  const [x, z] = el.at, y = el.y, d = el.dir, w = [-d[1], d[0]];
  const kind = el.kind || KINDS[Math.abs(Math.round(x * 7 + z * 13 + y * 5)) % KINDS.length];
  const tail = (Math.round(x * 3 + z * 5) % 2) ? 1 : -1;
  const P = (dd, ww, yy) => [x + d[0] * dd + w[0] * ww, y + yy, z + d[1] * dd + w[1] * ww];
  const C = [], F = [], I = [];
  // the cloud: billows along the wall and a tail rising behind
  for (const [ww, yy, r] of [[-0.24, -0.02, 0.15], [-0.08, 0.02, 0.19], [0.1, 0.0, 0.18], [0.26, -0.03, 0.13], [0.02, -0.1, 0.14]]) C.push(ellipsoid(P(0.22, ww, yy), r, r * 0.7, r * 0.8, 10, 5));
  for (let k = 0; k < 7; k++) C.push(ellipsoid(P(0.16 - k * 0.01, tail * (0.32 + k * 0.065 - k * k * 0.004), 0.0 + k * 0.05 + k * k * 0.008), 0.1 - k * 0.009, 0.075 - k * 0.006, 0.08 - k * 0.006, 8, 4));
  const by = 0.1, dance = kind === 'dance';
  if (!dance) F.push(ellipsoid(P(0.27, 0, by + 0.04), 0.17, 0.07, 0.13, 10, 4));              // the crossed legs
  else for (const s of [-1, 1]) F.push(rod(P(0.25, s * 0.05, by), P(0.25, s * 0.06, by + 0.2), 0.035, 0.03));
  const hy = dance ? by + 0.2 : by;
  F.push(ellipsoid(P(0.26, 0, hy + 0.17), 0.085, 0.13, 0.065, 10, 5));                        // torso
  F.push(ellipsoid(P(0.27, 0, hy + 0.36), 0.05, 0.062, 0.05, 10, 5));                          // head
  F.push(ellipsoid(P(0.26, 0, hy + 0.44), 0.03, 0.05, 0.03, 8, 4));                            // chignon
  F.push(lathe([[0.1, -0.006], [0.12, -0.006], [0.12, 0.006], [0.1, 0.006]], 16).rotateX(Math.PI / 2).rotateY(Math.atan2(d[0], d[1])).translate(...P(0.2, 0, hy + 0.37)));
  chain(F, [P(0.24, -0.08, hy + 0.27), P(0.2, -0.2, hy + 0.15), P(0.16, -0.28, hy + 0.2), P(0.12, -0.36, hy + 0.12)], 0.016);   // the scarf
  chain(F, [P(0.24, 0.08, hy + 0.27), P(0.2, 0.2, hy + 0.12), P(0.16, 0.3, hy + 0.16)], 0.016);
  const sh = (s) => P(0.26, s * 0.08, hy + 0.27);
  const arm = (s, el2, hand) => { F.push(rod(sh(s), el2, 0.02, 0.018), rod(el2, hand, 0.018, 0.015), ellipsoid(hand, 0.02, 0.02, 0.02, 6, 3)); };
  if (kind === 'flute') {
    arm(-1, P(0.32, -0.1, hy + 0.22), P(0.36, -0.06, hy + 0.33)); arm(1, P(0.32, 0.1, hy + 0.22), P(0.36, 0.1, hy + 0.32));
    I.push(rod(P(0.36, -0.1, hy + 0.335), P(0.36, 0.2, hy + 0.315), 0.012));
  } else if (kind === 'biwa') {
    arm(-1, P(0.32, -0.1, hy + 0.2), P(0.36, -0.02, hy + 0.14)); arm(1, P(0.3, 0.1, hy + 0.2), P(0.35, 0.12, hy + 0.3));
    I.push(ellipsoid(P(0.36, -0.02, hy + 0.12), 0.07, 0.05, 0.025, 10, 4), rod(P(0.36, 0.03, hy + 0.15), P(0.36, 0.14, hy + 0.32), 0.014, 0.01));
  } else if (kind === 'drum') {
    arm(-1, P(0.32, -0.11, hy + 0.18), P(0.38, -0.05, hy + 0.12)); arm(1, P(0.32, 0.11, hy + 0.18), P(0.38, 0.05, hy + 0.12));
    I.push(lathe([[0.04, -0.06], [0.055, 0], [0.04, 0.06]], 10).rotateZ(Math.PI / 2).rotateY(Math.atan2(w[0], w[1]) + Math.PI / 2).translate(...P(0.36, 0, hy + 0.1)));
  } else if (kind === 'sho') {
    arm(-1, P(0.32, -0.08, hy + 0.22), P(0.36, -0.03, hy + 0.3)); arm(1, P(0.32, 0.08, hy + 0.22), P(0.36, 0.03, hy + 0.3));
    for (let k = -2; k <= 2; k++) I.push(rod(P(0.37, k * 0.012, hy + 0.3), P(0.37, k * 0.012, hy + 0.38 + 0.02 * (2 - Math.abs(k))), 0.006));
  } else if (kind === 'dance') {
    arm(-1, P(0.28, -0.14, hy + 0.35), P(0.3, -0.12, hy + 0.48)); arm(1, P(0.3, 0.13, hy + 0.2), P(0.34, 0.2, hy + 0.12));
  } else if (kind === 'lotus') {
    arm(-1, P(0.32, -0.09, hy + 0.2), P(0.36, -0.03, hy + 0.24)); arm(1, P(0.31, 0.1, hy + 0.2), P(0.32, 0.12, hy + 0.12));
    I.push(rod(P(0.36, -0.03, hy + 0.22), P(0.36, -0.02, hy + 0.42), 0.006), ellipsoid(P(0.36, -0.02, hy + 0.45), 0.025, 0.04, 0.025, 8, 4));
  } else { arm(-1, P(0.33, -0.08, hy + 0.2), P(0.36, -0.005, hy + 0.27)); arm(1, P(0.33, 0.08, hy + 0.2), P(0.36, 0.005, hy + 0.27)); }
  for (const g of C) bag.add('paint_white', g);
  for (const g of F) bag.add('clay_gilt', g);
  for (const g of I) bag.add('lacquer_red', g);
}

/**
 * The canopy (tengai) over Amida { at, y (the ceiling it hangs from), half, depth }: a box-shaped outer canopy of black
 * lacquer inlaid with mother-of-pearl flowers, its edges bound in gilt metal, a valance of gilt openwork and strings of
 * beads hanging from its lower edge; inside it the round canopy, a disc of gilt openwork arabesque (hōsōge) in rings —
 * scrolls between a rim and a central lotus — seen from below. [stated: JAANUS "tengai"; MLIT "Phoenix Hall
 * decorations" (floral motifs with mother-of-pearl); inferred: sizes, the valance and the beads]
 */
function byodoCanopy(el, { bag }) {
  const [x, z] = el.at, y = el.y, h = el.half ?? 1.9, d = el.depth ?? 0.62, yb = y - d;
  const L = [], G = [], S = [], R = [], GB = [];
  // the four side boards with gilt bands at top and bottom; the board over the inside
  for (const [a, b] of [[[-1, -1], [1, -1]], [[1, -1], [1, 1]], [[1, 1], [-1, 1]], [[-1, 1], [-1, -1]]]) {
    const p = [x + a[0] * h, z + a[1] * h], q = [x + b[0] * h, z + b[1] * h], u = [(q[0] - p[0]) / (2 * h), (q[1] - p[1]) / (2 * h)], n = [u[1], -u[0]];
    const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], P = (t, o, yy) => [m[0] + u[0] * t + n[0] * o, yy, m[1] + u[1] * t + n[1] * o];
    const slab = (out, t0, t1, o0, o1, y0, y1) => hexa(out, [P(t0, o0, y0), P(t1, o0, y0), P(t1, o1, y0), P(t0, o1, y0)], [P(t0, o0, y1), P(t1, o0, y1), P(t0 === t1 ? t1 : t1, o1, y1), P(t0, o1, y1)]);
    slab(L, -h, h, -0.05, 0, yb + 0.08, y - 0.06);
    slab(GB, -h - 0.02, h + 0.02, -0.06, 0.02, yb, yb + 0.08);
    slab(GB, -h - 0.02, h + 0.02, -0.06, 0.02, y - 0.06, y - 0.02);
    // mother-of-pearl flowers in a row on the outer face, a rosette of petals round a gilt centre
    for (let k = 0; k < 7; k++) {
      const t = -h + (k + 0.5) * 2 * h / 7, yy = (yb + y) / 2 + 0.01, c = P(t, 0.006, yy);
      for (let j = 0; j < 6; j++) {
        const a = j * Math.PI / 3, e = P(t + Math.cos(a) * 0.075, 0.006, yy + Math.sin(a) * 0.075), f = P(t + Math.cos(a + 0.5) * 0.04, 0.006, yy + Math.sin(a + 0.5) * 0.04), g = P(t + Math.cos(a - 0.5) * 0.04, 0.006, yy + Math.sin(a - 0.5) * 0.04);
        S.push(...c, ...g, ...e, ...c, ...e, ...f);
        S.push(...c, ...e, ...g, ...c, ...f, ...e);
      }
      G.push(ellipsoid(P(t, 0.01, yy), 0.018, 0.018, 0.018, 6, 3));
    }
    // the valance: a row of gilt openwork pendants (pointed leaves with a hole) under the lower band, and strings of beads
    for (let k = 0; k <= 12; k++) {
      const t = -h + k * 2 * h / 12;
      chain(G, [P(t - 0.07, -0.02, yb), P(t, -0.02, yb - 0.16), P(t + 0.07, -0.02, yb)], 0.008);
      if (k % 2 === 0) { const top = P(t, -0.02, yb), n2 = 7 + (k % 4 === 0 ? 3 : 0); for (let j = 1; j <= n2; j++) G.push(ellipsoid([top[0], yb - 0.05 - j * 0.055, top[2]], 0.017, 0.022, 0.017, 6, 3)); G.push(lathe([[0.001, 0], [0.03, 0.03], [0.001, 0.09]], 6, null, top[0], yb - 0.12 - n2 * 0.055 - 0.04, top[2])); }
    }
  }
  hexa(L, [[x - h, y - 0.06, z - h], [x + h, y - 0.06, z - h], [x + h, y - 0.06, z + h], [x - h, y - 0.06, z + h]], [[x - h, y - 0.01, z - h], [x + h, y - 0.01, z - h], [x + h, y - 0.01, z + h], [x - h, y - 0.01, z + h]]);
  // the round canopy inside: a rim, two rings, scrolls between them, the central lotus with a bronze mirror
  const yr = yb + 0.22, r = h - 0.16;
  const ring = (rr, w) => G.push(lathe([[rr - w, -0.02], [rr + w, -0.02], [rr + w, 0.02], [rr - w, 0.02], [rr - w, -0.02]], 48, null, x, yr, z));
  ring(r, 0.04); ring(r * 0.66, 0.025); ring(r * 0.34, 0.02);
  for (let k = 0; k < 24; k++) {
    // a C-scroll and its curl in each sector of the outer field, a smaller leaf in the inner field
    const a = k / 24 * Math.PI * 2, da = Math.PI * 2 / 24, Pp = (rr, aa) => [x + Math.cos(aa) * rr, yr, z + Math.sin(aa) * rr];
    const pts = [];
    for (let j = 0; j <= 8; j++) { const t = j / 8, rr = r * (0.68 + 0.3 * t), aa = a + da * (0.5 * Math.sin(t * Math.PI * 1.5)); pts.push(Pp(rr, aa)); }
    chain(R, pts, 0.016);
    const c0 = Pp(r * 0.82, a + da * 0.55);
    for (let j = 0; j < 6; j++) { const t0 = j / 6 * Math.PI * 1.6, t1 = (j + 1) / 6 * Math.PI * 1.6, rc = 0.07 * (1 - j / 8); R.push(rod([c0[0] + Math.cos(t0 + a) * rc, yr, c0[2] + Math.sin(t0 + a) * rc], [c0[0] + Math.cos(t1 + a) * rc, yr, c0[2] + Math.sin(t1 + a) * rc], 0.012)); }
    chain(R, [Pp(r * 0.36, a), Pp(r * 0.5, a + da * 0.4), Pp(r * 0.64, a)], 0.013);
  }
  for (let j = 0; j < 12; j++) G.push(...[petalFlat(x, yr, z, j / 12 * Math.PI * 2, r * 0.12, r * 0.32)]);
  bag.add('bronze', lathe([[0.001, -0.04], [r * 0.12, -0.04], [r * 0.12, -0.02], [0.001, -0.02]], 20, null, x, yr, z));
  bag.add('lacquer_black', fromTriangles(L));
  bag.add('shell_inlay', fromTriangles(S));
  bag.add('clay_gilt', fromTriangles(GB));
  for (const g of [...G, ...R]) bag.add('clay_gilt', g);
}
/** A flat petal in the horizontal plane at height y, pointing out at angle a from radius r0 to r1. */
function petalFlat(x, y, z, a, r0, r1) {
  const tri = [], w = (r1 - r0) * 0.35, c = Math.cos(a), sn = Math.sin(a), P = (rr, ww, dy) => [x + c * rr - sn * ww, y + dy, z + sn * rr + c * ww];
  hexa(tri, [P(r0, -w * 0.5, -0.02), P(r0 + (r1 - r0) * 0.5, -w, -0.02), P(r1, 0, -0.02), P(r0 + (r1 - r0) * 0.5, w, -0.02)], [P(r0, -w * 0.5, 0.0), P(r0 + (r1 - r0) * 0.5, -w, 0.0), P(r1, 0, 0.0), P(r0 + (r1 - r0) * 0.5, w, 0.0)]);
  return fromTriangles(tri);
}

/** The bronze mirrors set in the ceilings { spots: [[x, z, y]…] } (sixty-six, catching the light) [stated: MLIT]. */
function byodoMirrors(el, { bag }) {
  // each a disc with a rim, its polished face turned down into the hall, its back pressed into the ceiling
  for (const [x, z, y] of el.spots) bag.add('bronze', lathe([[0.001, 0], [0.115, 0], [0.12, 0.012], [0.12, 0.02], [0.04, 0.03], [0.001, 0.045]], 18, null, x, y - 0.03, z));
}

/**
 * A painting of Amida's welcoming descent (raigō) in a Yamato-e landscape, on a wall panel { a, b (the panel's ends on the
 * wall's face), y0, y1, dir (out of the wall, into the room), season ('spring' | 'summer' | 'autumn' | 'winter'), from
 * ('l' | 'r': the side the procession comes from), seed }: far and near hills of green, a river, pines and the season's trees,
 * a house below with the dying believer, and the cloud bearing Amida and his bodhisattvas sweeping down to it.
 * Each layer a face a few millimetres in front of the last. [stated: MLIT "Art of Byōdōin" (nine forms of welcome,
 * four-season landscapes, Yamato-e); inferred: the composition in each panel]
 */
function raigo(el, { bag }) {
  const [ax, az] = el.a, [bx, bz] = el.b, W = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / W, (bz - az) / W], n = el.dir, y0 = el.y0, H = el.y1 - el.y0;
  let sd = el.seed || 1; const rnd = () => ((sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296);
  const lay = {};
  let off = 0.012;
  const P = (s, v, o) => [ax + u[0] * s + n[0] * o, y0 + v, az + u[1] * s + n[1] * o];
  const push = (mat, tris) => { (lay[mat] ||= []).push(...faceTo(tris, n)); };
  const band = (mat, lo, hi, s0 = 0, s1 = W, N = 24) => { const o = off; off += 0.003; const t = []; for (let i = 0; i < N; i++) { const sa = s0 + (s1 - s0) * i / N, sb = s0 + (s1 - s0) * (i + 1) / N; t.push(...P(sa, lo(sa), o), ...P(sb, lo(sb), o), ...P(sb, hi(sb), o), ...P(sa, lo(sa), o), ...P(sb, hi(sb), o), ...P(sa, hi(sa), o)); } push(mat, t); };
  const disc = (mat, s, v, rs, rv, N = 14) => { const o = off; off += 0.0015; const t = []; for (let i = 0; i < N; i++) { const a0 = i / N * Math.PI * 2, a1 = (i + 1) / N * Math.PI * 2; t.push(...P(s, v, o), ...P(s + Math.cos(a0) * rs, v + Math.sin(a0) * rv, o), ...P(s + Math.cos(a1) * rs, v + Math.sin(a1) * rv, o)); } push(mat, t); };
  const quadF = (mat, pts) => { const o = off; off += 0.0015; const q = pts.map(([s, v]) => P(s, v, o)); push(mat, [...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3]]); };
  const season = el.season || 'spring', ph = rnd() * 6, ph2 = rnd() * 6;
  // the far hills, then the near ones (snow-capped in winter), the river winding between
  band('stucco_leaf', () => 0.25 * H, (s) => H * (0.5 + 0.08 * Math.sin(s * 2.1 + ph) + 0.04 * Math.sin(s * 5.3 + ph2)));
  band(season === 'winter' ? 'paint_white' : 'fresco_green', () => 0, (s) => H * (0.3 + 0.06 * Math.sin(s * 2.7 + ph2) + 0.03 * Math.sin(s * 6.1 + ph)));
  if (season === 'winter') band('fresco_green', () => 0, (s) => H * (0.22 + 0.05 * Math.sin(s * 2.7 + ph2)));
  band('paint_blue', (s) => H * (0.1 + 0.04 * Math.sin(s * 3 + ph)), (s) => H * (0.15 + 0.04 * Math.sin(s * 3 + ph) + 0.01 * Math.sin(s * 9)), W * 0.05, W * 0.95);
  // trees on the hills: pines, and the season's (blossom in spring, red maples in autumn)
  const crown = season === 'spring' ? 'marble_pink' : season === 'autumn' ? 'cloth_red' : 'lotus_leaf';
  for (let k = 0; k < Math.max(2, Math.round(W * 1.6)); k++) {
    const s = W * (0.06 + 0.88 * rnd()), base = H * (0.2 + 0.12 * rnd()), th = H * (0.08 + 0.06 * rnd());
    quadF('roof_bark', [[s - 0.012, base], [s + 0.012, base], [s + 0.008, base + th], [s - 0.008, base + th]]);
    disc(k % 3 === 0 ? crown : 'cloth_green', s, base + th, 0.06 + 0.04 * rnd(), 0.035 + 0.02 * rnd());
  }
  // the house below, toward the side the cloud descends to: a raised floor, posts, a bark roof, the believer within
  const fromL = el.from !== 'r', hs = fromL ? W * 0.74 : W * 0.26, hw = Math.min(0.36, W * 0.2);
  quadF('timber_ni', [[hs - hw, H * 0.08], [hs + hw, H * 0.08], [hs + hw, H * 0.2], [hs - hw, H * 0.2]]);
  quadF('roof_bark', [[hs - hw * 1.35, H * 0.2], [hs + hw * 1.35, H * 0.2], [hs + hw * 0.6, H * 0.27], [hs - hw * 0.6, H * 0.27]]);
  disc('cloth_white', hs, H * 0.12, 0.03, 0.04, 8);
  // the cloud trailing down from the upper corner, on it Amida (a gilt figure in a halo) and his bodhisattvas
  const sA = fromL ? W * 0.08 : W * 0.92, sB = fromL ? Math.min(W * 0.62, hs - hw * 0.4) : Math.max(W * 0.38, hs + hw * 0.4), vA = H * 0.95, vB = H * 0.42;
  for (let k = 0; k <= 10; k++) { const t = k / 10; disc('cloth_white', sA + (sB - sA) * t, vA + (vB - vA) * t - 0.03, 0.05 + 0.1 * t, 0.03 + 0.035 * t, 12); }
  const fig = (s, v, sc) => { disc('clay_gilt', s, v + 0.13 * sc, 0.09 * sc, 0.09 * sc, 12); disc('clay_gilt', s, v + 0.05 * sc, 0.045 * sc, 0.07 * sc, 10); disc('paint_ochre', s, v + 0.14 * sc, 0.025 * sc, 0.028 * sc, 8); };
  const nb = Math.max(1, Math.min(5, Math.round(W * 1.5)));
  for (let k = 0; k < nb; k++) { const t = 0.15 + 0.6 * k / Math.max(1, nb - 1) * (nb > 1 ? 1 : 0); fig(sA + (sB - sA) * t, vA + (vB - vA) * t, 0.55); }
  fig(sA + (sB - sA) * 0.95, vA + (vB - vA) * 0.95, 1.0);
  for (const [mat, t] of Object.entries(lay)) bag.add(mat, fromTriangles(t));
}
/** Turn triangles to face along n (a plan direction). */
function faceTo(t, n) {
  for (let i = 0; i < t.length; i += 9) {
    const ux = t[i + 3] - t[i], uy = t[i + 4] - t[i + 1], uz = t[i + 5] - t[i + 2], vx = t[i + 6] - t[i], vy = t[i + 7] - t[i + 1], vz = t[i + 8] - t[i + 2];
    const nx = uy * vz - uz * vy, nz = ux * vy - uy * vx;
    if (nx * n[0] + nz * n[1] < 0) for (let k = 0; k < 3; k++) { const q = t[i + 3 + k]; t[i + 3 + k] = t[i + 6 + k]; t[i + 6 + k] = q; }
  }
  return t;
}

/**
 * Byōdō-in's bronze bell { at, y (the lip's height), h }: the "bell of form", its waist bands and four vertical bands dividing
 * the body; in the upper panels the knobs, five rows of five; a band of dragons near the top, of heavenly figures round
 * the middle and of lions at the base, in low relief; two lotus striking seats; the hook of two dragons back to back.
 * [stated: MLIT "Temple Bell (Bonsho)"; inferred: proportions, about 2 m high]
 */
function byodoBell(el, { bag }) {
  const [x, z] = el.at, y = el.y, H = el.h ?? 1.95, R = H * 0.32, B = [], K = [];
  const prof = [[R * 0.98, 0], [R, 0.04 * H], [R * 0.97, 0.1 * H], [R * 0.92, 0.45 * H], [R * 0.88, 0.75 * H], [R * 0.84, 0.86 * H], [R * 0.74, 0.92 * H], [R * 0.4, 0.97 * H], [0.001, 0.985 * H]];
  bag.add('bronze', lathe([[R * 0.86, 0.02 * H], ...prof], 40, null, x, y, z));
  const rAt = (v) => { for (let i = 0; i < prof.length - 1; i++) { const [r0, y0] = prof[i], [r1, y1] = prof[i + 1]; if (v >= y0 && v <= y1) return r0 + (r1 - r0) * (v - y0) / (y1 - y0); } return R * 0.9; };
  // the horizontal bands (raised rings) and the four vertical bands
  for (const v of [0.13, 0.17, 0.5, 0.54, 0.84]) { const r = rAt(v * H); B.push(lathe([[r - 0.01, -0.015], [r + 0.018, -0.012], [r + 0.018, 0.012], [r - 0.01, 0.015]], 40, null, x, y + v * H, z)); }
  for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 2 + Math.PI / 4;
    for (let j = 0; j < 12; j++) {
      const v0 = (0.17 + j * 0.67 / 12) * H, v1 = (0.17 + (j + 1) * 0.67 / 12) * H, r0 = rAt(v0) + 0.012, r1 = rAt(v1) + 0.012;
      B.push(rodS([x + Math.cos(a) * r0, y + v0, z + Math.sin(a) * r0], [x + Math.cos(a) * r1, y + v1, z + Math.sin(a) * r1], 0.035));
    }
    // the knobs in the upper panel between this band and the next
    for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
      const aa = a + (i + 1) / 6 * Math.PI / 2 - Math.PI / 4 * 0 + Math.PI / 2 * 0 + 0, v = (0.6 + j * 0.045) * H, r = rAt(v);
      const ang = a + (i + 1) * (Math.PI / 2) / 6;
      void aa;
      K.push(ellipsoid([x + Math.cos(ang) * r, y + v, z + Math.sin(ang) * r], 0.028, 0.028, 0.028, 6, 3));
    }
    // the relief bands: heavenly figures in the middle panels, lions at the base, dragons at the top (raised forms)
    for (let i = 0; i < 3; i++) {
      const ang = a + (i + 0.5) * (Math.PI / 2) / 3;
      const fig = (v, w, hh) => { const r = rAt(v); K.push(ellipsoid([x + Math.cos(ang) * r, y + v, z + Math.sin(ang) * r], w, hh, w, 8, 4)); };
      fig(0.3 * H, 0.06, 0.11); fig(0.38 * H, 0.04, 0.04);            // a heavenly figure: the body, the head
      fig(0.085 * H, 0.08, 0.04);                                        // a lion couchant on the lip band
      fig(0.89 * H, 0.09, 0.025);                                        // a dragon's coil near the shoulder
    }
  }
  // two striking seats: lotus discs on the waist band's level
  for (const a of [0, Math.PI]) { const v = 0.3 * H, r = rAt(v); const g = lathe([[0.001, 0], [0.14, 0], [0.13, 0.03], [0.06, 0.045], [0.001, 0.05]], 16, (th, i) => (i === 1 ? 0.88 + 0.12 * Math.abs(Math.cos(th * 4)) : 1)); g.rotateZ(-Math.PI / 2); g.rotateY(-a); g.translate(x + Math.cos(a) * (r - 0.01), y + v, z + Math.sin(a) * (r - 0.01)); B.push(g); }
  // the hook: two dragons' bodies arching up and meeting, their heads biting the crown, a flaming jewel between
  const top = y + 0.98 * H;
  for (const sd of [-1, 1]) {
    const pts = []; for (let k = 0; k <= 8; k++) { const t = k / 8; pts.push([x + sd * 0.16 * Math.cos(t * Math.PI * 0.5), top + Math.sin(t * Math.PI) * 0.28, z]); }
    for (let k = 0; k < pts.length - 1; k++) B.push(rodS(pts[k], pts[k + 1], 0.045 - 0.015 * k / 8));
    B.push(ellipsoid([x + sd * 0.17, top + 0.03, z], 0.07, 0.06, 0.06, 8, 4));
  }
  B.push(lathe([[0.001, 0], [0.05, 0.03], [0.03, 0.1], [0.001, 0.16]], 8, null, x, top + 0.26, z));
  for (const g of [...B, ...K]) bag.add('bronze', g);
}
function rodS(a, b, r) { return rod(a, b, r, r, 6); }

/**
 * The bell tower (shōrō) { c, y, half, h }: a stone platform; four posts splayed a little inward, tie beams at mid-height
 * and at the top, bearing blocks; a hip-and-gable roof of tiles; the beam the bell hangs from, the bell, and the striking
 * log hung on ropes beside it. [stated: the bell hung in the tower across the pond (MLIT); inferred: the tower's form]
 */
function shoro(el, ctx) {
  const { bag, col } = ctx, [cx, cz] = el.c, y = el.y ?? 0, h = el.half ?? 1.8, H = el.h ?? 3.4, T = 'timber_ni', W = [];
  hexaBox(W, [[cx - h - 1.0, y + 0.45, cz - h - 1.0], [cx + h + 1.0, y + 0.45, cz - h - 1.0], [cx + h + 1.0, y + 0.45, cz + h + 1.0], [cx - h - 1.0, y + 0.45, cz + h + 1.0]], 0.75);
  bag.add('limestone', fromTriangles(W));
  col.rect([cx - h - 1.0, cz - h - 1.0, cx + h + 1.0, cz + h + 1.0], y - 0.3, y + 0.45);
  col.floor([cx - h - 1.0, cz - h - 1.0, cx + h + 1.0, cz + h + 1.0], y + 0.45);
  const yp = y + 0.45, P = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    // the post, splayed in toward the top by 4 %
    const b = [cx + sx * h, cz + sz * h], t = [cx + sx * h * 0.96, cz + sz * h * 0.96], r = 0.16;
    hexa(P, [[b[0] - r, yp, b[1] - r], [b[0] + r, yp, b[1] - r], [b[0] + r, yp, b[1] + r], [b[0] - r, yp, b[1] + r]], [[t[0] - r * 0.92, yp + H, t[1] - r * 0.92], [t[0] + r * 0.92, yp + H, t[1] - r * 0.92], [t[0] + r * 0.92, yp + H, t[1] + r * 0.92], [t[0] - r * 0.92, yp + H, t[1] + r * 0.92]]);
    hexaBox(P, [[b[0] - 0.3, yp + 0.12, b[1] - 0.3], [b[0] + 0.3, yp + 0.12, b[1] - 0.3], [b[0] + 0.3, yp + 0.12, b[1] + 0.3], [b[0] - 0.3, yp + 0.12, b[1] + 0.3]], 0.14);   // a stone-like foot block
    col.circle(b[0], b[1], 0.2, yp, yp + H);
    // a bearing block on the post head
    hexaBox(P, [[t[0] - 0.24, yp + H + 0.22, t[1] - 0.24], [t[0] + 0.24, yp + H + 0.22, t[1] - 0.24], [t[0] + 0.24, yp + H + 0.22, t[1] + 0.24], [t[0] - 0.24, yp + H + 0.22, t[1] + 0.24]], 0.22);
  }
  // tie beams: through the posts at mid-height (the lower rail) and at the top; the head beams over the blocks
  for (const [yy, hh, k] of [[yp + 0.9, 0.14, 0.99], [yp + H - 0.4, 0.26, 0.965]]) for (const s of [-1, 1]) {
    P.push(...boxT(cx - h * k - 0.25, yy, cz + s * h * k - 0.09, cx + h * k + 0.25, yy + hh, cz + s * h * k + 0.09));
    P.push(...boxT(cx + s * h * k - 0.09, yy + hh + 0.002, cz - h * k - 0.25, cx + s * h * k + 0.09, yy + 2 * hh, cz + h * k + 0.25));
  }
  for (const s of [-1, 1]) P.push(...boxT(cx - h - 0.6, yp + H + 0.22, cz + s * h * 0.96 - 0.12, cx + h + 0.6, yp + H + 0.5, cz + s * h * 0.96 + 0.12));
  for (const s of [-1, 1]) P.push(...boxT(cx + s * h * 0.96 - 0.12, yp + H + 0.5, cz - h - 0.6, cx + s * h * 0.96 + 0.12, yp + H + 0.78, cz + h + 0.6));
  // the beam the bell hangs from (along x, on the head beams), its iron hanger
  P.push(...boxT(cx - h, yp + H + 0.78, cz - 0.14, cx + h, yp + H + 1.08, cz + 0.14));
  bag.add(T, fromTriangles(P));
  const bh = 1.95, ybell = yp + H + 0.78 - 0.25 - bh;
  bag.add('iron', box(cx - 0.04, ybell + bh * 0.98 + 0.2, cz - 0.04, cx + 0.04, yp + H + 0.79, cz + 0.04));
  byodoBell({ at: [cx, cz], y: ybell, h: bh }, ctx);
  // the striking log on two ropes from the head beam, pointing at the striking seat (+x)
  const yl = ybell + 0.3 * bh, xl0 = cx + 0.75, xl1 = cx + h + 0.2;
  bag.add('timber', lathe([[0.11, 0], [0.12, 0.05], [0.12, xl1 - xl0 - 0.05], [0.1, xl1 - xl0], [0.001, xl1 - xl0]], 12, null, 0, 0, 0).rotateZ(-Math.PI / 2).translate(xl0, yl, cz));
  for (const xr of [xl0 + 0.3, xl1 - 0.3]) bag.add('sacking', box(xr - 0.012, yl + 0.1, cz - 0.012, xr + 0.012, yp + H + 0.5, cz + 0.012));
  STYLES.japanese.elements.irimoya({ c: [cx, cz], A: h + 1.75, B: h + 1.6, y: yp + H + 0.9, rise: 2.4, lift: 0.4, gable: 0.45 }, ctx);
}
function boxT(x0, y0, z0, x1, y1, z1) { const o = []; hexa(o, [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]]); return o; }
function hexaBox(out, top, t) { hexa(out, top.map((p) => [p[0], p[1] - t, p[2]]), top); }

const base = STYLES.japanese;
registerStyle('japanese-byodo', {
  ...base,
  elements: { ...base.elements, byodo_mirrors: byodoMirrors, raigo, shoro },
  objects: { ...base.objects, byodo_amida: amida, byodo_cloud: cloudBodhisattva, byodo_canopy: byodoCanopy },
});
