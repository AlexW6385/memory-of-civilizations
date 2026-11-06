// The Phoenix Hall's own pieces, on top of the Japanese style (src/styles/japanese): Jōchō's Amida of 1053 —
// seated in meditation on a tall lotus pedestal hung with jewel garlands, before a pointed mandorla whose
// double halo is ringed by openwork scrolls, flame tongues and flying apsaras — and the fifty-two
// bodhisattvas on clouds, each at its own task: playing a flute, a lute, a drum, praying, dancing, offering a lotus.
// docs/buildings/byodo-in-phoenix-hall.md §4, §8.

import '../../styles/japanese/index.js';
import { STYLES, registerStyle } from '../../core/build.js';
import { lathe, fromTriangles } from '../../core/geom.js';
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

const base = STYLES.japanese;
registerStyle('japanese-byodo', {
  ...base,
  elements: { ...base.elements },
  objects: { ...base.objects, byodo_amida: amida, byodo_cloud: cloudBodhisattva },
});
