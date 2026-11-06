// Joseon timber detail shared by the joseon style and the qing halls it borrows
// (docs/settlements/joseon-seoul.md §10): the dapo bracket sets under the eaves, the moru-dancheong
// bands (meoricho) painted at the ends of the beams, and the hip-and-gable roof without a main ridge
// (muryang) of the king's and queen's sleeping halls. Depends only on core and the ming vocabulary.

import { box, fromTriangles } from '../../core/geom.js';
import { beamTris, flipTris, sheet } from '../ming/index.js';

/** The posts' lines of a ming_hall-type rect, as mingHall lays them out: [xs, zs]. */
export function postLines(el) {
  const [x0, z0, x1, z1] = el.rect, along = x1 - x0 >= z1 - z0, Lx = x1 - x0, Lz = z1 - z0;
  const nb = el.bays?.[0] ?? Math.max(1, Math.round((along ? Lx : Lz) / 3.6)), nd = el.bays?.[1] ?? Math.max(1, Math.round((along ? Lz : Lx) / 3.4));
  const xs = [], zs = [];
  for (let i = 0; i <= (along ? nb : nd); i++) xs.push(x0 + Lx * i / (along ? nb : nd));
  for (let j = 0; j <= (along ? nd : nb); j++) zs.push(z0 + Lz * j / (along ? nd : nb));
  return [xs, zs];
}
/** The four sides of a rect with their posts: [a, b, posts as distances from a, outward normal]. */
function sides([x0, z0, x1, z1], [xs, zs]) {
  return [
    [[x0, z0], [x1, z0], xs.map((x) => x - x0), [0, -1]], [[x0, z1], [x1, z1], xs.map((x) => x - x0), [0, 1]],
    [[x0, z0], [x0, z1], zs.map((z) => z - z0), [-1, 0]], [[x1, z0], [x1, z1], zs.map((z) => z - z0), [1, 0]],
  ];
}

/**
 * Moru dancheong on a beam's face: at each end of every bay, beside the post, the meoricho — bands
 * of vermilion, white, blue and ochre with a white-edged flower — the middle of the beam left in its
 * green ground with a white line along it (moru: patterns at the ends, lines in the middle).
 * rect: the beam's line; posts [xs, zs]; y0..y1 the beam's face; off: its distance out of the line.
 */
export function meoricho(bag, rect, posts, y0, y1, off) {
  const B = { lacquer_red: [], plaster_white: [], paint_blue: [], paint_ochre: [] }, m = 0.02, h0 = y0 + m, h1 = y1 - m;
  const seq = [['lacquer_red', 0.1], ['plaster_white', 0.03], ['paint_blue', 0.16], ['plaster_white', 0.03], ['paint_ochre', 0.08]];
  for (const [a, b, ps, n] of sides(rect, posts)) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, o = off + 0.012;
    const strip = (s0, s1, mat, ya = h0, yb = h1, d = o) => {
      const p0 = [a[0] + ux * s0 + n[0] * d, a[1] + uz * s0 + n[1] * d], p1 = [a[0] + ux * s1 + n[0] * d, a[1] + uz * s1 + n[1] * d];
      B[mat].push(box(Math.min(p0[0], p1[0]) - Math.abs(n[0]) * 0.01, ya, Math.min(p0[1], p1[1]) - Math.abs(n[1]) * 0.01, Math.max(p0[0], p1[0]) + Math.abs(n[0]) * 0.01, yb, Math.max(p0[1], p1[1]) + Math.abs(n[1]) * 0.01));
    };
    for (let i = 0; i + 1 < ps.length; i++) {
      const s0 = ps[i] + 0.22, s1 = ps[i + 1] - 0.22, span = s1 - s0;
      if (span < 1.4) continue;
      let w = 0;
      for (const [mat, d] of seq) w += d;
      const k = Math.min(1, span * 0.3 / w);
      for (const dir of [1, -1]) {
        let s = dir > 0 ? s0 : s1;
        for (const [mat, d] of seq) { const e = s + dir * d * k; strip(Math.min(s, e), Math.max(s, e), mat); s = e; }
        // the flower (juhwa) in the middle of the band: an ochre lozenge edged in white, standing out a little more
        const c = (dir > 0 ? s0 : s1) + dir * w * k * 0.55, ym = (h0 + h1) / 2, r = (h1 - h0) * 0.32;
        strip(c - r * 0.55, c + r * 0.55, 'plaster_white', ym - r, ym + r, o + 0.02);
        strip(c - r * 0.32, c + r * 0.32, 'lacquer_red', ym - r * 0.62, ym + r * 0.62, o + 0.04);
      }
      // the white line along the middle of the beam
      const sa = s0 + w * k + 0.05, sb = s1 - w * k - 0.05;
      if (sb - sa > 0.3) strip(sa, sb, 'plaster_white', (h0 + h1) / 2 - 0.015, (h0 + h1) / 2 + 0.015);
    }
  }
  for (const [mat, gs] of Object.entries(B)) for (const g of gs) bag.add(mat, g);
}

/** The height a dapo band takes between the beam's top and the eave line (tiers of arms). */
export const dapoHeight = (o = {}) => 0.32 + (o.tiers ?? 3) * 0.17 + 0.16 + 0.2;

/**
 * Dapo bracket sets: on a plate over the beam, sets of brackets on every post and o.inter between
 * each pair, each set a bearing block and o.tiers (2–3) of crossed arms — the lateral arms along the
 * wall, the projecting tongues (salmi) stepping out tier by tier — with little blocks (soro) at
 * their ends, carrying an outer purlin under the eaves; painted boards (pobyeok) between the sets.
 * Arms in the green ground of dancheong, the tongues' faces blue, the blocks vermilion [inferred
 * from photographs]. yf: the beam's top; soffit(d): the roof's underside at d out from the wall line.
 */
export function dapo(bag, rect, posts, yf, o = {}, soffit = null) {
  const tiers = o.tiers ?? 3, inter = o.inter ?? 2, step = o.step ?? 0.3, ah = 0.17, aw = 0.065;
  const G = [], Bl = [], R = [];
  const add = (arr, p0, p1, w, y, h) => beamTris(arr, [p0[0], y, p0[1]], [p1[0], y, p1[1]], w, h);
  for (const [a, b, ps, n] of sides(rect, posts)) {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    const P = (s, d) => [a[0] + ux * s + n[0] * d, a[1] + uz * s + n[1] * d];
    const out = tiers * step + 0.08, yTop = yf + 0.32 + tiers * ah;
    // the plate (pyeongbang) over the beam, the outer purlin over the tongues' tips, the wall-line beam
    add(G, P(-0.3, 0), P(L + 0.3, 0), 0.17, yf, 0.12);
    add(G, P(-out, out), P(L + out, out), 0.09, yTop, 0.16);
    add(G, P(-0.2, 0), P(L + 0.2, 0), 0.09, yTop, 0.16);
    // the boards between the sets, up to the roof's underside
    const yb = soffit ? soffit(0) + 0.06 : yTop + 0.3;
    G.push(...boxTris(P(0, -0.025), P(L, 0.025), yf + 0.12, yb));
    const at = [];
    for (let i = 0; i < ps.length; i++) { at.push(ps[i]); if (i + 1 < ps.length) for (let k = 1; k <= inter; k++) at.push(ps[i] + (ps[i + 1] - ps[i]) * k / (inter + 1)); }
    for (const s of at) {
      // the bearing block (judu)
      Bl.push(...boxTris(P(s - 0.18, -0.18), P(s + 0.18, 0.18), yf + 0.12, yf + 0.32));
      for (let t = 0; t < tiers; t++) {
        const y = yf + 0.32 + t * ah, lat = 0.42 + t * 0.2, proj = (t + 1) * step;
        add(G, P(s - lat, 0), P(s + lat, 0), aw, y, ah - 0.03);                         // the lateral arm
        add(G, P(s, -0.25), P(s, proj - 0.12), aw, y, ah - 0.03);                        // the tongue, its tip painted
        add(R, P(s, proj - 0.12), P(s, proj + 0.02), aw + 0.02, y - 0.025, ah - 0.025);
        Bl.push(...boxTris(P(s - 0.09, proj - 0.09), P(s + 0.09, proj + 0.09), y + ah - 0.03, y + ah));   // the block (soro) on the tip
      }
    }
  }
  bag.add(o.wood ?? 'paint_dancheong', fromTriangles(G));
  bag.add('lacquer_red', fromTriangles(Bl));
  bag.add('paint_blue', fromTriangles(R));
}
/** A box's twelve outward triangles from two plan corners p, q and heights y0, y1. */
function boxTris(p, q, y0, y1) {
  const g = box(Math.min(p[0], q[0]), y0, Math.min(p[1], q[1]), Math.max(p[0], q[0]), y1, Math.max(p[1], q[1]));
  const P = g.attributes.position.array, I = g.index ? g.index.array : null, out = [];
  if (I) for (const i of I) out.push(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]); else out.push(...P);
  return out;
}

/**
 * A hip-and-gable roof with no main ridge (muryang), as rectRoof draws it { c, A, B, y, rise,
 * sweep, alongZ, p, gableAt, mat, soffit, plaster }: the two slopes rounded over into each other at
 * the top under curved tiles, the gable boards, the hips with their white-plastered sides.
 */
export function muryangRoof(el, bag) {
  const [cx, cz] = el.c, A = el.A, B = el.B, y = el.y, R = el.rise, sw = el.sweep ?? 0.9, p = el.p ?? 1.7, gAt = el.gableAt ?? 0.42, tc = 0.8;
  const f = (t) => { if (t <= tc) return Math.pow(t, p); const d = p * Math.pow(tc, p - 1); return Math.pow(tc, p) + d * (t - tc) - d / (2 * (1 - tc)) * (t - tc) ** 2; };
  const top = y + R * f(1);
  const rot = (x, z) => (el.alongZ ? [cx - (z - cz), cz + (x - cx)] : [x, z]);
  const H = (x, z, off = 0) => {
    const ax = Math.abs(x - cx), az = Math.abs(z - cz), ts = Math.max(0, Math.min(1, (B - az) / B));
    let te = Math.max(0, (A - ax) / B); if (te > gAt) te = 9;
    const t = Math.min(ts, te), corner = Math.max(0, 1 - te / 0.5) * Math.max(0, 1 - ts / 0.5);
    return y + R * f(t) + sw * corner * corner + off;
  };
  const P = (x, z, off = 0) => { const [rx, rz] = rot(x, z); return [rx, H(x, z, off), rz]; };
  const xs = [], zs = [];
  for (let i = 0; i <= Math.max(8, Math.round(A * 2)); i++) xs.push(cx - A + 2 * A * i / Math.max(8, Math.round(A * 2)));
  const xg = A - gAt * B; xs.push(cx - xg - 0.02, cx - xg + 0.02, cx + xg - 0.02, cx + xg + 0.02); xs.sort((a, b) => a - b);
  for (let j = 0; j <= 12; j++) zs.push(cz - B + 2 * B * j / 12);
  for (const t of [0.86, 0.92, 0.97]) zs.push(cz - B * (1 - t), cz + B * (1 - t));
  zs.sort((a, b) => a - b);
  bag.add(el.mat, sheet(xs.map((x) => zs.map((z) => P(x, z))), true));
  bag.add(el.soffit, sheet(xs.map((x) => zs.map((z) => P(x, z, -0.14)))));
  const ring = [];
  for (const x of xs) ring.push([x, cz - B]);
  for (const z of zs.slice(1)) ring.push([cx + A, z]);
  for (const x of xs.slice().reverse().slice(1)) ring.push([x, cz + B]);
  for (const z of zs.slice().reverse().slice(1)) ring.push([cx - A, z]);
  const edge = [];
  for (let k = 0; k + 1 < ring.length; k++) { const a = P(...ring[k]), b = P(...ring[k + 1]); edge.push(...a, ...b, b[0], b[1] - 0.2, b[2], ...a, b[0], b[1] - 0.2, b[2], a[0], a[1] - 0.2, a[2]); }
  bag.add(el.soffit, fromTriangles(edge.concat(flipTris(edge))));
  // the hips: the dark tile cap over white-plastered sides; the curved-tile crest along the top
  const cap = [], white = [];
  for (const s of [-1, 1]) for (const sz of [-1, 1]) {
    const pts = []; for (let k = 0; k <= 12; k++) { const t = gAt * k / 12; pts.push([cx + s * (A - t * B), cz + sz * (B - t * B)]); }
    for (let k = 0; k + 1 < pts.length; k++) { beamTris(cap, P(...pts[k], 0.08), P(...pts[k + 1], 0.08), 0.08, 0.14); beamTris(white, P(...pts[k], 0.05), P(...pts[k + 1], 0.05), 0.1, 0.14); }
  }
  // the gable boards, plastered, and the barge boards' tiled edges along their tops
  const yb = H(cx + xg, cz + B * (1 - gAt) * 0.98), gb = [];
  for (const s of [-1, 1]) {
    const x = cx + s * (xg + 0.05), zz = (B - gAt * B) * 0.98;
    const N = 10, prof = [];
    for (let k = 0; k <= N; k++) { const z = -zz + 2 * zz * k / N; prof.push([z, H(x - s * 0.1, cz + z) - 0.12]); }
    for (let k = 0; k < N; k++) {
      const [za, ya] = prof[k], [zb, yb2] = prof[k + 1], q0 = rot(x, cz + za), q1 = rot(x, cz + zb);
      gb.push(q0[0], yb, q0[1], q1[0], yb, q1[1], q1[0], Math.max(yb, yb2), q1[1], q0[0], yb, q0[1], q1[0], Math.max(yb, yb2), q1[1], q0[0], Math.max(yb, ya), q0[1]);
      beamTris(cap, P(x - s * 0.08, cz + za, -0.02), P(x - s * 0.08, cz + zb, -0.02), 0.09, 0.12);
    }
  }
  bag.add(el.plaster ?? 'plaster_white', fromTriangles(gb.concat(flipTris(gb))));
  bag.add(el.mat, fromTriangles(cap));
  bag.add('plaster_white', fromTriangles(white));
  void top;
}
