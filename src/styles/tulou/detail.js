// Close detail of the landmark (docs/settlements/hakka-tulou.md §4.7): the cobble footing, the rows of cover tiles and the rafters
// of the ring roof, the hoods and frames of the windows, the stone gate with its studded doors and couplets, the court's stone ways.
// Every piece is a hexahedron with a hair of skew and a random size, so that the bag merges them into the material's one mesh
// (an axis-aligned box repeated is drawn instanced: one more draw).
import { hexa, P, frameOf } from './geo.js';

export const rnd = (i, s = 0) => { let h = Math.imul(i + 1, 374761393) ^ Math.imul(s + 11, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

/** A box in the frame at (cx, cz) turned by phi (local z radial outward), its top corners moved by a hair (seed) so it is never an axis box. */
export function jbox(cx, cz, phi, x0, y0, z0, x1, y1, z1, seed = 0) {
  const W = frameOf(cx, cz, phi), j = (k) => (rnd(seed, k) - 0.5) * 0.004;
  const pt = (x, y, z) => { const [wx, wz] = W(x, z); return [wx, y, wz]; };
  return hexa(
    [pt(x0 + j(1), y1, z0 + j(2)), pt(x1 + j(3), y1, z0 + j(4)), pt(x1 + j(5), y1, z1 + j(6)), pt(x0 + j(7), y1 + j(8) * 0.5, z1 + j(9))],
    [pt(x0, y0, z0), pt(x1, y0, z0), pt(x1, y0, z1), pt(x0, y0, z1)]);
}
/** A slab in the local frame sloping in z: from (z0, ya) to (z1, yb), x0…x1, thickness t (down). */
export function lslab(cx, cz, phi, x0, x1, z0, ya, z1, yb, t) {
  const W = frameOf(cx, cz, phi), pt = (x, y, z) => { const [wx, wz] = W(x, z); return [wx, y, wz]; };
  return hexa([pt(x0, ya, z0), pt(x1, ya, z0), pt(x1, yb, z1), pt(x0, yb, z1)], [pt(x0, ya - t, z0), pt(x1, ya - t, z0), pt(x1, yb - t, z1), pt(x0, yb - t, z1)]);
}

/** A cover-tile rib along a radial line at angle a: from radius ra (surface height ya) to rb (yb), half-width w at its foot, h tall. */
function rib(c, ra, ya, rb, yb, a, w, h, seed) {
  const p = (r, da, y) => { const [x, z] = P(c, r, a + da / r); return [x, y, z]; }, hh = h + (rnd(seed, 5) - 0.5) * 0.004;
  return hexa(
    [p(ra, -w * 0.5, ya + hh), p(rb, -w * 0.5 * ra / rb, yb + hh), p(rb, w * 0.5 * ra / rb, yb + hh), p(ra, w * 0.5, ya + hh)],
    [p(ra, -w, ya - 0.012), p(rb, -w * ra / rb, yb - 0.012), p(rb, w * ra / rb, yb - 0.012), p(ra, w, ya - 0.012)]);
}

/**
 * The rows of cover tiles on one ring roof (pan-and-cover: a rib over every joint of the pans), the rafters under the outer eave
 * with their flying tips, and the eave-end tiles. o = the roof's radii and heights, `per` ribs a sector.
 */
export function roofRows(bag, c, n, o, per = 8, rafters = true) {
  const da = 2 * Math.PI / n, ySurf = (r) => (r >= o.rr ? o.ye + (o.yr - o.ye) * (o.ro - r) / (o.ro - o.rr) : o.yr - (o.yr - o.yi) * (o.rr - r) / (o.rr - o.ri));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < per; j++) {
      const a = (i - 0.5) * da + (j + 0.5) / per * da, s = i * per + j;
      // outer slope: from the eave's drip row to the ridge band; inner slope from the ridge band to the court side
      bag.add('tile_grey', rib(c, o.ro - 0.4, ySurf(o.ro - 0.4), o.rr + 0.36, ySurf(o.rr + 0.36), a, 0.05, 0.065, s));
      bag.add('tile_grey', rib(c, o.rr - 0.36, ySurf(o.rr - 0.36), o.ri + 0.15, ySurf(o.ri + 0.15), a, 0.05, 0.065, s + 7777));
    }
    if (!rafters) continue;
    // rafters under the outer soffit: three to a sector, a flying tip beyond the eave
    for (let q = 0; q < 3; q++) {
      const a = (i - 0.5) * da + (q + 0.5) / 3 * da, s = i * 3 + q + 500;
      const p = (r, d, y) => { const [x, z] = P(c, r, a + d / r); return [x, y, z]; }, w = 0.045, y1 = (r) => ySurf(r) - 0.15, t = 0.075;
      bag.add('timber', hexa([p(o.rr, -w, y1(o.rr)), p(o.ro + 0.06, -w, y1(o.ro + 0.06)), p(o.ro + 0.06, w, y1(o.ro + 0.06)), p(o.rr, w, y1(o.rr))],
        [p(o.rr, -w, y1(o.rr) - t), p(o.ro + 0.06, -w, y1(o.ro + 0.06) - t), p(o.ro + 0.06 + 0.0, w, y1(o.ro + 0.06) - t - (rnd(s, 1) - 0.5) * 0.004), p(o.rr, w, y1(o.rr) - t)]));
      // the flying rafter's tip (飞椽), a little higher and thinner, dark
      const w2 = 0.036, yy = y1(o.ro) - 0.005;
      bag.add('timber', hexa([p(o.ro + 0.03, -w2, yy + 0.002), p(o.ro + 0.22, -w2, yy + 0.07), p(o.ro + 0.22, w2, yy + 0.07), p(o.ro + 0.03, w2, yy + 0.002 + (rnd(s, 2) - 0.5) * 0.003)],
        [p(o.ro + 0.03, -w2, yy - 0.07), p(o.ro + 0.22, -w2, yy), p(o.ro + 0.22, w2, yy), p(o.ro + 0.03, w2, yy - 0.07)]));
    }
  }
}

/**
 * The cobble footing of the great wall: a core of earth-bound rubble and, on it, courses of river stones laid in random bond,
 * each stone a little rounded (its top face smaller than its foot), the top course a coping that juts a hand beyond the wall.
 */
export function cobbleFoot(bag, c, ro, a0, a1, i, H = 1.3) {
  const da = a1 - a0, courses = 4, ch = H / courses;
  for (let k = 0; k < courses; k++) {
    const y0 = k * ch, y1 = y0 + ch, last = k === courses - 1;
    // random bond: the course cut into stones of 0.35–0.65 m
    const arc = da * (ro(0) + 0.05), m = Math.max(3, Math.floor(arc / 0.62));
    const cuts = [0]; for (let q = 1; q < m; q++) cuts.push(q / m + (rnd(i * 17 + k, q) - 0.5) * 0.2 / m); cuts.push(1);
    for (let q = 0; q < m; q++) {
      const s = i * 131 + k * 29 + q, g = 0.011 / (ro(0) * da), u0 = a0 + da * (cuts[q] + g), u1 = a0 + da * (cuts[q + 1] - g);
      const ym = y0 + (last ? 0.04 : 0), yt = y1 - 0.012 - rnd(s, 3) * 0.02 - (last ? 0 : 0), jut = 0.035 + rnd(s, 4) * 0.075 + (last ? 0.04 : 0);
      const rO = (y) => ro(y) + jut, rI = ro(y1) - 0.12, bev = last ? 0.02 : 0.04 + rnd(s, 6) * 0.03, cap = (u, d) => u + d * (rnd(s, 7) - 0.5) * 0.002;
      const pt = (r, a, y) => { const [x, z] = P(c, r, a); return [x, y, z]; };
      const ab = Math.min((u1 - u0) * 0.15, bev * 0.35 / ro(0));                              // the top face's angular inset
      bag.add('granite_block', hexa(
        [pt(rO(yt) - bev, cap(u0, 1) + ab, yt), pt(rO(yt) - bev, cap(u1, 1) - ab, yt), pt(rI, u1 - ab, yt), pt(rI, u0 + ab, yt)],
        [pt(rO(ym), u0, ym), pt(rO(ym), u1, ym), pt(rI, u1, ym), pt(rI, u0, ym)]));
    }
  }
}

/** The frame and hood of one small window: a lime-washed surround, timber jambs, a tiled hood; on some, a shutter leaf stands open. */
export function windowHood(bag, c, ro, ac, s0, s1, i, k) {
  const r = ro(s0), phi = Math.PI / 2 - ac, [mx, mz] = P(c, r, ac), seed = i * 7 + k * 3, o = 0.27;
  const L = (x0, y0, z0, x1, y1, z1, sd) => jbox(c[0], c[1], phi, x0, y0, z0, x1, y1, z1, seed * 5 + sd);
  void mx; void mz;
  const zf = r + 0.012, zz = (y) => ro(y);
  // lime surround, 0.09 wide, standing 0.03 proud of the face
  bag.add('plaster_white', L(-o - 0.11, s0 - 0.07, zz(s0) - 0.0, -o - 0.02, s1 + 0.1, zz(s1) + 0.03, 1));
  bag.add('plaster_white', L(o + 0.02, s0 - 0.07, zz(s0) - 0.0, o + 0.11, s1 + 0.1, zz(s1) + 0.03, 2));
  bag.add('plaster_white', L(-o - 0.11, s1 + 0.0, zz(s1) - 0.0, o + 0.11, s1 + 0.1, zz(s1) + 0.03, 3));
  // timber jambs in the reveal's mouth
  bag.add('timber', L(-o - 0.02, s0, zf - 0.06, -o + 0.045, s1, zf + 0.03, 4));
  bag.add('timber', L(o - 0.045, s0, zf - 0.06, o + 0.02, s1, zf + 0.03, 5));
  // the little hood: a pent roof of tile, 0.55 out, with a dark drip edge, on two timber props
  bag.add('tile_dark', lslab(c[0], c[1], phi, -o - 0.22, o + 0.22, zz(s1 + 0.3) - 0.02, s1 + 0.34, zz(s1) + 0.58, s1 + 0.2, 0.05));
  bag.add('tile_grey', lslab(c[0], c[1], phi, -o - 0.2, o + 0.2, zz(s1 + 0.3) - 0.02, s1 + 0.38, zz(s1) + 0.52, s1 + 0.245, 0.03));
  bag.add('timber', L(-o - 0.2, s1 + 0.1, zz(s1) + 0.0, -o - 0.15, s1 + 0.2, zz(s1) + 0.48, 6));
  bag.add('timber', L(o + 0.15, s1 + 0.1, zz(s1) + 0.0, o + 0.2, s1 + 0.2, zz(s1) + 0.48, 7));
  // a shutter leaf of boards standing open on some windows
  if (rnd(seed, 9) < 0.28) {
    const sd = rnd(seed, 10) < 0.5 ? -1 : 1, hx = sd * (o + 0.04), len = o * 2 * 0.5 + 0.02, ang = 0.9 + rnd(seed, 11) * 0.5;
    const ex = hx + sd * Math.sin(ang) * len * 0.0, ez = zz(s0 + 0.2) + Math.sin(ang) * len, ex2 = hx - sd * (len - Math.cos(ang) * len);
    void ex;
    bag.add('timber', lslabX(c, phi, hx, s0 + 0.0, zz(s0) + 0.03, ex2 - 0.0, ez, s1, 0.03));
  }
}
/** A vertical leaf from (x0, z0) to (x1, z1) in the plan of the local frame, between heights ya and yb, thickness t. */
function lslabX(c, phi, x0, ya, z0, x1, z1, yb, t) {
  const W = frameOf(c[0], c[1], phi), A = W(x0, z0), B = W(x1, z1), L = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1, nx = -(B[1] - A[1]) / L * t / 2, nz = (B[0] - A[0]) / L * t / 2;
  const tp = (y) => [[A[0] - nx, y, A[1] - nz], [A[0] + nx, y, A[1] + nz], [B[0] + nx, y + 0.003, B[1] + nz], [B[0] - nx, y, B[1] - nz]];
  return hexa(tp(yb), tp(ya));
}

/** The pseudo-script of a couplet: columns of characters drawn as strokes (the wording itself is not rendered), on a red strip. */
export function couplet(bag, c, phi, x0, x1, y0, y1, z, seed, nch = 7) {
  const cw = x1 - x0, ch = (y1 - y0) / nch;
  for (let q = 0; q < nch; q++) {
    const cy = y1 - (q + 0.5) * ch, sx = x0 + cw * 0.5;
    const n = 3 + Math.floor(rnd(seed + q, 1) * 3);
    for (let s = 0; s < n; s++) {
      const hor = rnd(seed + q, 10 + s) < 0.55, u = (rnd(seed + q, 20 + s) - 0.5) * cw * 0.4, v = (rnd(seed + q, 30 + s) - 0.5) * ch * 0.45;
      const lw = cw * (0.28 + rnd(seed + q, 40 + s) * 0.22), lh = ch * (0.26 + rnd(seed + q, 50 + s) * 0.2), t = 0.016;
      if (hor) bag.add('iron', jbox(c[0], c[1], phi, sx + u - lw / 2, cy + v - t / 2, z, sx + u + lw / 2, cy + v + t / 2, z + 0.007, seed + q * 9 + s));
      else bag.add('iron', jbox(c[0], c[1], phi, sx + u - t / 2, cy + v - lh / 2, z, sx + u + t / 2, cy + v + lh / 2, z + 0.007, seed + q * 9 + s));
    }
  }
}
