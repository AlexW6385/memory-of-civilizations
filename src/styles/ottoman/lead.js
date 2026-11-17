// The lead of the Süleymaniye's roofs (docs/settlements/ottoman-istanbul.md §16): the sheets are laid in strips
// from the crown to the foot and joined by raised standing seams (rolls) that run down every meridian,
// and the finials are the gilt alem: a stack of balls on a spike with the crescent. Pure strips, no per-pixel work.

import { rod, lathe, fromTriangles } from '../../core/geom.js';

const twice = (t) => { const o = t.slice(); for (let i = 0; i < t.length; i += 9) o.push(t[i], t[i + 1], t[i + 2], t[i + 6], t[i + 7], t[i + 8], t[i + 3], t[i + 4], t[i + 5]); return o; };

/**
 * Standing seams over a surface of revolution: prof is the profile [[rho, height]…] from the foot to the
 * crown (rho falling), pt(a, rho, yy) the plan-to-world map (a the angle round the axis), n the number of
 * seams over the angles [a0, a1] (both ends when the range is not a full turn), w their breadth, lift how
 * far they stand off the sheet. They taper to nothing toward the crown.
 */
export function seams(bag, mat, prof, pt, n, a0, a1, w = 0.12, lift = 0.07, rmin = 0.4) {
  const tri = [], full = Math.abs(a1 - a0 - Math.PI * 2) < 1e-6, cnt = full ? n : n + 1;
  const e = 1e-3;
  for (let i = 0; i < cnt; i++) {
    const a = a0 + (a1 - a0) * i / n, o = pt(a, 0, 0), p1 = pt(a, 1, 0), pa = pt(a - e, 1, 0), pb = pt(a + e, 1, 0);
    let lx = pb[0] - pa[0], lz = pb[2] - pa[2]; const ll = Math.hypot(lx, lz) || 1; lx /= ll; lz /= ll;
    const dx = p1[0] - o[0], dz = p1[2] - o[2], dl = Math.hypot(dx, dz) || 1;
    const row = [];
    for (let k = 0; k < prof.length; k++) {
      const [r, h] = prof[k], [rp, hp] = prof[Math.max(0, k - 1)], [rq, hq] = prof[Math.min(prof.length - 1, k + 1)];
      if (r < rmin) break;
      let nr = hq - hp, nh = rp - rq; const nl = Math.hypot(nr, nh) || 1; nr /= nl; nh /= nl;
      const b = pt(a, r, h), ww = Math.min(w, 0.45 * 2 * Math.PI * r / n) / 2, rl = lift * Math.min(1, r / (rmin * 2.5));
      row.push([[b[0] - lx * ww, b[1], b[2] - lz * ww], [b[0] + lx * ww, b[1], b[2] + lz * ww], [b[0] + dx / dl * nr * rl, b[1] + nh * rl, b[2] + dz / dl * nr * rl]]);
    }
    for (let k = 0; k + 1 < row.length; k++) {
      const [l0, r0, t0] = row[k], [l1, r1, t1] = row[k + 1];
      tri.push(...l0, ...t0, ...t1, ...l0, ...t1, ...l1, ...t0, ...r0, ...r1, ...t0, ...r1, ...t1);
    }
  }
  if (tri.length) bag.add(mat, fromTriangles(twice(tri)));
}

/** The profile of a dome of base radius ro and rise hh, sampled as a quarter ellipse from the foot (k = 0) to the crown. */
export const domeProfile = (ro, hh, N = 12) => Array.from({ length: N + 1 }, (_, k) => { const t = Math.PI / 2 * k / N; return [Math.max(0.001, ro * Math.cos(t)), hh * Math.sin(t)]; });

/** The alem at (x, y, z): a spike through a stack of three balls, the crescent (open to the sky) round the top; s scales. One piece. */
export function alem(bag, x, y, z, s = 1, yaw = 0) {
  const parts = [rod([x, y, z], [x, y + 3.1 * s, z], 0.05 * s, 5)];
  for (const [r, h] of [[0.34, 0.5], [0.26, 1.15], [0.18, 1.7]]) parts.push(lathe([[0.001, -r], [r * 0.87, -r * 0.5], [r, 0], [r * 0.87, r * 0.5], [0.001, r]].map(([a, b]) => [a * s, b * s]), 8, null, x, y + h * s, z));
  const R = 0.34 * s, cy = y + 2.35 * s, c = Math.cos(yaw), d = Math.sin(yaw), N = 7;
  for (let i = 0; i < N; i++) {
    const t0 = Math.PI * 0.8 + Math.PI * 1.4 * i / N, t1 = Math.PI * 0.8 + Math.PI * 1.4 * (i + 1) / N;
    const P = (t) => [x + Math.cos(t) * R * c, cy + Math.sin(t) * R, z + Math.cos(t) * R * d];
    parts.push(rod(P(t0), P(t1), 0.045 * s, 4));
  }
  const all = [];
  for (const g of parts) { const gg = g.index ? g.toNonIndexed() : g, a = gg.attributes.position.array; for (let i = 0; i < a.length; i++) all.push(a[i]); }
  bag.add('gilt_bronze', fromTriangles(all));
}
