// The Phoenix Hall's roof work, laid over the shared Japanese roofs (src/styles/japanese, read-only here): the rows of
// round tiles (maru-gawara) that run down every slope of a hongawara roof with a round end-tile at each foot, the two
// layers of rafter-ends under the eave (the round base rafters under the square flying rafters, each capped in gilt
// metal), and the stacked ridge. Each element adds to the roof it is given the same parameters as (a base roof stays
// as it is); every material gets one merged geometry per element. docs/settlements/heian-uji.md §18.

import { fromTriangles } from '../../core/geom.js';
import { alongZ, hexa, obox } from '../../styles/chinese/index.js';
import { tri, quad4 } from '../../styles/japanese/shape.js';

const clamp01 = (t) => Math.max(0, Math.min(1, t));
const bag3 = () => ({ tile: [], wood: [], gold: [], plaster: [] });
const flush = (bag, o, mats) => {
  bag.add(mats.tile, fromTriangles(o.tile));
  if (o.wood.length) bag.add(mats.wood, fromTriangles(o.wood));
  if (o.gold.length) bag.add('gilt_bronze', fromTriangles(o.gold));
  if (o.plaster.length) bag.add('plaster_white', fromTriangles(o.plaster));
};

/** A round-tile row along the polyline pts [x, y, z]: a low ridge of width w and height hg standing on the roof. */
function rib(out, pts, w, hg) {
  const S = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const tx = b[0] - a[0], tz = b[2] - a[2], l = Math.hypot(tx, tz) || 1, px = -tz / l * w / 2, pz = tx / l * w / 2;
    return { L: [p[0] + px, p[1] - 0.012, p[2] + pz], T: [p[0], p[1] + hg, p[2]], R: [p[0] - px, p[1] - 0.012, p[2] - pz], px, pz };
  });
  for (let i = 0; i < S.length - 1; i++) {
    const A = S[i], B = S[i + 1];
    quad4(out, A.L, B.L, B.T, A.T, [A.px, 0.6, A.pz]);
    quad4(out, A.T, B.T, B.R, A.R, [-A.px, 0.6, -A.pz]);
  }
}
/** The round end-tile at a row's foot: a button of eight facets facing out along the plan unit n. */
function footTile(out, x, y, z, n, r = 0.075) {
  const s = [-n[1], n[0]], c = [x + n[0] * 0.012, y + 0.05, z + n[1] * 0.012], ring = [];
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; ring.push([c[0] + s[0] * Math.cos(a) * r, c[1] + Math.sin(a) * r, c[2] + s[1] * Math.cos(a) * r]); }
  const apex = [c[0] + n[0] * 0.05, c[1], c[2] + n[1] * 0.05];
  for (let k = 0; k < 8; k++) { const j = (k + 1) % 8; tri(out, ring[k], ring[j], apex, [n[0] + (ring[k][0] - c[0]) * 0.5, (ring[k][1] - c[1]) * 0.5, n[1] + (ring[k][2] - c[2]) * 0.5]); }
}
/** A square flying rafter's end and a round base rafter's end under it, with their gilt caps, at the eave point (x, z) whose roof edge is y. */
function rafterEnds(o, x, z, y, n, k) {
  const s = [-n[1], n[0]], j = ((k * 7) % 5) * 0.0004;                  // a hair's difference so that the pieces merge and are not instanced
  obox(o.wood, [x, z], s, n, 0.048 + j, 0.07, y - 0.175, y - 0.075, 0.03);
  obox(o.gold, [x, z], s, n, 0.052 + j, 0.004, y - 0.18, y - 0.07, 0.102);      // the gilt cap
  const c = [x + n[0] * 0.03, y - 0.28, z + n[1] * 0.03], r = 0.062, ring = [], tip = [];
  for (let m = 0; m < 6; m++) { const a = m / 6 * Math.PI * 2 + 0.3, dx = s[0] * Math.cos(a) * r, dz = s[1] * Math.cos(a) * r, dy = Math.sin(a) * r; ring.push([c[0] + dx, c[1] + dy, c[2] + dz]); tip.push([c[0] + dx + n[0] * 0.075, c[1] + dy, c[2] + dz + n[1] * 0.075]); }
  for (let m = 0; m < 6; m++) { const q = (m + 1) % 6; quad4(o.wood, ring[m], ring[q], tip[q], tip[m], [tip[m][0] - c[0] - n[0] * 0.075, tip[m][1] - c[1], tip[m][2] - c[2] - n[1] * 0.075]); }
  const cc = [c[0] + n[0] * 0.077, c[1], c[2] + n[1] * 0.077];
  for (let m = 0; m < 6; m++) tri(o.gold, [cc[0] + (tip[m][0] - c[0] - n[0] * 0.075) * 1.0, tip[m][1], cc[2] + (tip[m][2] - c[2] - n[1] * 0.075) * 1.0], [cc[0] + (tip[(m + 1) % 6][0] - c[0] - n[0] * 0.075), tip[(m + 1) % 6][1], cc[2] + (tip[(m + 1) % 6][2] - c[2] - n[1] * 0.075)], cc, n.length === 2 ? [n[0], 0, n[1]] : n);
}
/** Rafter ends along an eave line from p to q (plan), the roof edge's height yAt(x, z), outward unit n; the ends left bare. */
function eaveLine(o, p, q, yAt, n, sp, bare = 0.4) {
  const L = Math.hypot(q[0] - p[0], q[1] - p[1]), N = Math.max(1, Math.floor((L - 2 * bare) / sp));
  for (let i = 0; i <= N; i++) {
    const t = (bare + (L - 2 * bare) * i / N) / L, x = p[0] + (q[0] - p[0]) * t, z = p[1] + (q[1] - p[1]) * t;
    rafterEnds(o, x, z, yAt(x, z), n, i);
  }
}

// ── the hip-and-gable roof (shared `irimoya`'s own surface, re-derived with the same parameters) ──────
/** { c, A, B, y, rise, lift, gable, alongZ }: the same parameters as the irimoya it is laid on. */
function irimoyaDetail(el, ctx) { alongZ(irimoyaDetailX, el, ctx); }
function irimoyaDetailX(el, { bag }) {
  const [cx, cz] = el.c, A = el.A, B = el.B, R = el.rise, U = el.lift ?? 0.7, tg = el.gable ?? 0.45;
  const P = (t) => Math.pow(clamp01(t), 1.45), xg = A - B * tg, zr = B * (1 - tg);
  const hs = (z) => el.y + R * P((B - Math.abs(z - cz)) / B), he = (x) => el.y + R * P((A - Math.abs(x - cx)) / B);
  const corner = (x, z) => { const c = Math.max(0, 1 - (A - Math.abs(x - cx)) / 4.5) * Math.max(0, 1 - (B - Math.abs(z - cz)) / 4.5); return U * c * c; };
  const h = (x, z, mid) => (mid ? hs(z) : Math.min(hs(z), he(x))) + corner(x, z);
  const o = bag3(), SP = 0.3, W = 0.15, HG = 0.075;
  // the rows down the long slopes: from the eave to the ridge, in the middle and on the hips' side slopes up to where the hip begins
  for (let x = cx - A + 0.3; x <= cx + A - 0.29; x += SP) {
    const mid = Math.abs(x - cx) <= xg;
    for (const sz of [-1, 1]) {
      const pts = [];
      for (let k = 0; k <= 40; k++) {
        const z = cz + sz * B * (1 - k / 40);
        if (!mid && hs(z) > he(x) + 0.01) break;
        pts.push([x, h(x, z, mid) + 0.0, z]);
      }
      if (pts.length < 2) continue;
      rib(o.tile, pts.filter((_, i) => i % 3 === 0 || i === pts.length - 1), W, HG);
      footTile(o.tile, x, pts[0][1], cz + sz * B, [0, sz]);
    }
  }
  // the rows down the hipped ends: along x from the eave to the gable's foot or the hip
  for (let z = cz - B + 0.3; z <= cz + B - 0.29; z += SP) {
    for (const sx of [-1, 1]) {
      const pts = [];
      for (let k = 0; k <= 40; k++) {
        const x = cx + sx * (A - (A - xg) * k / 40);
        if (hs(z) < he(x) - 0.01) break;
        pts.push([x, h(x, z, false), z]);
      }
      if (pts.length < 2) continue;
      rib(o.tile, pts.filter((_, i) => i % 3 === 0 || i === pts.length - 1), W, HG);
      footTile(o.tile, cx + sx * A, pts[0][1], z, [sx, 0]);
    }
  }
  // the stacked ridge: three bands of flat tiles on each face and the round cap, the main ridge's box already stands
  const top = el.y + R, L = xg + 0.3;
  for (const sz of [-1, 1]) for (let b = 0; b < 3; b++) obox(o.tile, [cx, cz], [1, 0], [0, 1], L + 0.04, 0.025, top + 0.05 + b * 0.24, top + 0.15 + b * 0.24, sz * 0.335);
  const ring = [];
  for (let m = 0; m < 8; m++) { const a = m / 8 * Math.PI * 2 + Math.PI / 8; ring.push([Math.cos(a) * 0.23, Math.sin(a) * 0.2]); }
  const base = top + 0.8, e0 = cx - L - 0.1, e1 = cx + L + 0.1;
  for (let m = 0; m < 8; m++) {
    const q = (m + 1) % 8, a = ring[m], b = ring[q];
    quad4(o.tile, [e0, base + a[1], cz + a[0]], [e1, base + a[1], cz + a[0]], [e1, base + b[1], cz + b[0]], [e0, base + b[1], cz + b[0]], [0, (a[1] + b[1]) / 2, (a[0] + b[0]) / 2]);
  }
  for (const [x, sx] of [[e0, -1], [e1, 1]]) for (let m = 1; m < 7; m++) tri(o.tile, [x, base + ring[0][1], cz + ring[0][0]], [x, base + ring[m][1], cz + ring[m][0]], [x, base + ring[m + 1][1], cz + ring[m + 1][0]], [sx, 0, 0]);
  // the rafter ends round the eave: the four sides, the corners left bare
  const side = (a, b, n) => eaveLine(o, a, b, (x, z) => h(x, z, false), n, 0.42, 0.9);
  side([cx - A, cz - B], [cx + A, cz - B], [0, -1]); side([cx - A, cz + B], [cx + A, cz + B], [0, 1]);
  side([cx - A, cz - B], [cx - A, cz + B], [-1, 0]); side([cx + A, cz - B], [cx + A, cz + B], [1, 0]);
  flush(bag, o, { tile: el.mat || 'tile_dark', wood: el.soffit || 'timber_ni' });
}

// ── the pent roof ──────────────────────────────────────────────────────────────────────────────────
/** { rect, out, yIn, yOut, raise }: the same parameters as the pent_roof it is laid on. */
function pentDetail(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, o = el.out, T = bag3();
  const sides = {
    n: [[x0, z0], [x1, z0], [x0 - o, z0 - o], [x1 + o, z0 - o]],
    s: [[x1, z1], [x0, z1], [x1 + o, z1 + o], [x0 - o, z1 + o]],
    w: [[x0, z1], [x0, z0], [x0 - o, z1 + o], [x0 - o, z0 - o]],
    e: [[x1, z0], [x1, z1], [x1 + o, z0 - o], [x1 + o, z1 + o]],
  };
  for (const [k, [ia, ib, oa, ob]] of Object.entries(sides)) {
    const R = el.raise && el.raise.side === k ? el.raise : null;
    const L = Math.hypot(ib[0] - ia[0], ib[1] - ia[1]), u = [(ib[0] - ia[0]) / L, (ib[1] - ia[1]) / L];
    let nx = oa[0] - ia[0] - u[0] * ((oa[0] - ia[0]) * u[0] + (oa[1] - ia[1]) * u[1]), nz = oa[1] - ia[1] - u[1] * ((oa[0] - ia[0]) * u[0] + (oa[1] - ia[1]) * u[1]);
    const nl = Math.hypot(nx, nz); nx /= nl; nz /= nl;
    const p0 = R ? Math.min(R.from, R.to) - 0.4 : 0, p1 = R ? Math.max(R.from, R.to) + 0.4 : 0;
    const yOutAt = (p) => (R && p >= p0 && p <= p1 ? R.yOut : el.yOut), yInAt = (p) => (R && p >= p0 && p <= p1 ? R.yIn : el.yIn);
    for (let q = 0.15; q < L + 2 * o - 0.1; q += 0.3) {
      const len = Math.max(0, Math.min(q, L + 2 * o - q, o)), p = q - o;
      if (len < 0.25) continue;
      const ex = oa[0] + u[0] * q, ez = oa[1] + u[1] * q, yo = yOutAt(p), yi = yInAt(p), pts = [];
      const nseg = Math.max(1, Math.ceil(len / 0.8));
      for (let i = 0; i <= nseg; i++) { const d = len * i / nseg; pts.push([ex - nx * d, yo + (yi - yo) * d / o, ez - nz * d]); }
      rib(T.tile, pts, 0.15, 0.075);
      footTile(T.tile, ex, yo, ez, [nx, nz]);
    }
    // rafter ends along the eave (split at the raised section)
    const eave = (pa, pb) => {
      if (pb - pa < 1) return;
      eaveLine(T, [oa[0] + u[0] * (pa + o), oa[1] + u[1] * (pa + o)], [oa[0] + u[0] * (pb + o), oa[1] + u[1] * (pb + o)], () => yOutAt((pa + pb) / 2), [nx, nz], 0.42, 0.3);
    };
    if (R) { eave(-o + 0.5, p0 - 0.05); eave(p0, p1); eave(p1 + 0.05, L + o - 0.5); } else eave(-o + 0.5, L + o - 0.5);
  }
  flush(bag, T, { tile: el.mat || 'tile_dark', wood: el.soffit || 'timber_ni' });
}

// ── the gabled corridor roofs ──────────────────────────────────────────────────────────────────────
/** { c, A, B, y, rise, alongZ }: the same parameters as the gable_roof_j it is laid on. */
function gableDetail(el, ctx) { alongZ(gableDetailX, el, ctx); }
function gableDetailX(el, { bag }) {
  const [cx, cz] = el.c, A = el.A, B = el.B, y = el.y, R = el.rise, o = bag3();
  const prof = (t) => y + R * Math.pow(t, 1.4);
  for (let x = cx - A + 0.2; x <= cx + A - 0.19; x += 0.3) for (const s of [-1, 1]) {
    const pts = [];
    for (let k = 0; k <= 6; k++) { const t = k / 6; pts.push([x, prof(t) + 0.0, cz + s * B * (1 - t)]); }
    rib(o.tile, pts, 0.15, 0.075);
    footTile(o.tile, x, y, cz + s * B, [0, s]);
  }
  // the roof's ridge: three bands of flat tiles under a round cap (the ridge's box stands as before)
  const top = y + R;
  for (const s of [-1, 1]) for (let b = 0; b < 2; b++) obox(o.tile, [cx, cz], [1, 0], [0, 1], A + 0.14, 0.022, top - 0.02 + b * 0.2, top + 0.08 + b * 0.2, s * 0.27);
  for (const s of [-1, 1]) eaveLine(o, [cx - A, cz + s * B], [cx + A, cz + s * B], () => y, [0, s], 0.42, 0.5);
  flush(bag, o, { tile: el.mat || 'tile_dark', wood: el.soffit || 'timber_ni' });
}

// ── the pyramidal roof of a corner tower ───────────────────────────────────────────────────────────
/** { c, A, y, rise, lift }: the same parameters as the hogyo it is laid on. */
function hogyoDetail(el, { bag }) {
  const [cx, cz] = el.c, A = el.A, B = el.A, R = el.rise, U = el.lift ?? 0.6, o = bag3();
  const h = (x, z) => {
    const ax = Math.abs(x - cx), az = Math.abs(z - cz), t = clamp01(Math.min((B - az) / B, (A - ax) / B));
    const corner = Math.max(0, 1 - (A - ax) / 5) * Math.max(0, 1 - (B - az) / 5);
    return el.y + R * Math.pow(t, 1.45) + U * corner * corner;
  };
  for (const d of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
    const s = [-d[1], d[0]];
    for (let a = -A + 0.3; a <= A - 0.29; a += 0.3) {
      const depth = A - Math.abs(a), pts = [];
      const N = Math.max(1, Math.ceil(depth / 0.7));
      for (let i = 0; i <= N; i++) { const dd = depth * i / N, x = cx + d[0] * (A - dd) + s[0] * a, z = cz + d[1] * (A - dd) + s[1] * a; pts.push([x, h(x, z), z]); }
      if (depth < 0.3) continue;
      rib(o.tile, pts, 0.15, 0.075);
      footTile(o.tile, pts[0][0], pts[0][1], pts[0][2], d);
    }
    eaveLine(o, [cx + d[0] * A - s[0] * A, cz + d[1] * A - s[1] * A], [cx + d[0] * A + s[0] * A, cz + d[1] * A + s[1] * A], h, d, 0.42, 0.6);
  }
  flush(bag, o, { tile: el.mat || 'tile_dark', wood: el.soffit || 'timber_ni' });
}

export const roofElements = { byodo_irimoya_detail: irimoyaDetail, byodo_pent_detail: pentDetail, byodo_gable_detail: gableDetail, byodo_hogyo_detail: hogyoDetail };
void hexa;
