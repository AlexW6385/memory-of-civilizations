// Ming Suzhou — wear and damp in the garden core (docs/settlements/ming-suzhou.md §19): thresholds
// worn down in the middle where the feet go, steps with a rounded edge, moss at the foot of the
// shady (north) faces of walls and halls, and a terrace whose slabs have settled — a few sunk, a
// few cracked. Geometry only, in materials the garden's pieces already use (granite_block,
// bluestone, granite_grey, cloth_green for the moss); a hash of each piece's own place varies it.

import { fromTriangles } from '../../core/geom.js';
import { hash, rimPosts } from './corework.js';

const STONE = 'granite_block';

/** A box as 12 triangles (outward), corners (x0, y0, z0)–(x1, y1, z1) and the top's four heights [h00, h10, h11, h01] (at x0z0, x1z0, x1z1, x0z1) if given. */
function slabTris(out, x0, z0, x1, z1, yb, top) {
  const t = top ?? [0, 0, 0, 0];
  const A = [x0, t[0], z0], B = [x1, t[1], z0], C = [x1, t[2], z1], D = [x0, t[3], z1];
  const a = [x0, yb, z0], b = [x1, yb, z0], c = [x1, yb, z1], d = [x0, yb, z1];
  const q = (p0, p1, p2, p3) => out.push(...p0, ...p1, ...p2, ...p0, ...p2, ...p3);
  q(A, D, C, B);                       // top (up)
  q(a, b, c, d);                       // bottom
  q(a, A, B, b); q(b, B, C, c); q(c, C, D, d); q(d, D, A, a);
}

/** A rod (hexagonal section) from p to q, radius r: the rounded nose of a step. */
function rod(out, p, q, r) {
  const dx = q[0] - p[0], dz = q[2] - p[2], l = Math.hypot(dx, dz) || 1, ux = dx / l, uz = dz / l, nx = -uz, nz = ux, N = 6;
  const ring = (c, k) => { const a = k / N * Math.PI * 2; return [c[0] + nx * Math.cos(a) * r, c[1] + Math.sin(a) * r, c[2] + nz * Math.cos(a) * r]; };
  for (let k = 0; k < N; k++) {
    const a0 = ring(p, k), a1 = ring(p, k + 1), b0 = ring(q, k), b1 = ring(q, k + 1);
    out.push(...a0, ...b0, ...b1, ...a0, ...b1, ...a1);
  }
}

/**
 * A worn threshold: a granite sill across a doorway from u0 to u1 (along `ux, uz` from point `o`),
 * `dep` deep across the wall's line, its top 5.5 cm above the floor at the ends and dipped to 3 cm in
 * the middle (the hollow of ten generations of feet), the arrises rounded by a bevel.
 */
function threshold(out, o, ux, uz, u0, u1, dep, y) {
  const nx = -uz, nz = ux, N = 14, hz = dep / 2;
  const P = (u, v, h) => [o[0] + ux * u + nx * v, y + h, o[1] + uz * u + nz * v];
  const top = (u) => { const m = (u - (u0 + u1) / 2) / ((u1 - u0) / 2); return 0.055 - 0.026 * Math.exp(-m * m * 5); };
  const q = (p0, p1, p2, p3) => out.push(...p0, ...p1, ...p2, ...p0, ...p2, ...p3);
  const bev = 0.018;
  for (let i = 0; i < N; i++) {
    const ua = u0 + (u1 - u0) * i / N, ub = u0 + (u1 - u0) * (i + 1) / N, ha = top(ua), hb = top(ub);
    // the flat top between the bevels, the two bevels, the vertical faces below them
    q(P(ua, -hz + bev, ha), P(ub, -hz + bev, hb), P(ub, hz - bev, hb), P(ua, hz - bev, ha));
    q(P(ua, -hz, ha - bev), P(ub, -hz, hb - bev), P(ub, -hz + bev, hb), P(ua, -hz + bev, ha));
    q(P(ua, hz - bev, ha), P(ub, hz - bev, hb), P(ub, hz, hb - bev), P(ua, hz, ha - bev));
    q(P(ua, -hz, 0), P(ub, -hz, 0), P(ub, -hz, hb - bev), P(ua, -hz, ha - bev));
    q(P(ub, hz, 0), P(ua, hz, 0), P(ua, hz, ha - bev), P(ub, hz, hb - bev));
  }
  q(P(u0, hz, 0), P(u0, -hz, 0), P(u0, -hz, top(u0) - bev), P(u0, hz, top(u0) - bev));
  q(P(u1, -hz, 0), P(u1, hz, 0), P(u1, hz, top(u1) - bev), P(u1, -hz, top(u1) - bev));
}

/** A ragged patch of moss on a horizontal plane at height y: a fan of 9 points round (cx, cz), an ellipse a × b turned by `ang`, its rim wavering by a hash. */
function moss(out, cx, cz, a, b, ang, y, seed) {
  const N = 9, ca = Math.cos(ang), sa = Math.sin(ang), pt = [];
  for (let k = 0; k < N; k++) {
    const t = k / N * Math.PI * 2, r = 0.6 + 0.55 * hash(cx + k * 0.37, cz - k * 0.61, seed);
    const u = Math.cos(t) * a * r, v = Math.sin(t) * b * r;
    pt.push([cx + u * ca - v * sa, y, cz + u * sa + v * ca]);
  }
  for (let k = 0; k < N; k++) out.push(cx, y, cz, ...pt[(k + 1) % N], ...pt[k]);
}

/**
 * hallWear(bag, el): a worn threshold in each doorway of a hall (the middle bay of the front, and of
 * every side in el.doors), a rounded nose on every step of its platform, moss at the foot of the
 * platform on the north side and in the angles of the steps there. el is the ming_hall element.
 */
export function hallWear(bag, el) {
  const [x0, z0, x1, z1] = el.rect, front = el.front || 's', { xs, zs } = rimPosts(el);
  const y = el.y, plat = el.plat ?? 0, pm = el.platMargin ?? 0.9;
  const sides = { n: [z0, xs, 0, -1], s: [z1, xs, 0, 1], w: [x0, zs, -1, 0], e: [x1, zs, 1, 0] };
  const doorSide = (k) => k === front || !!el.doors?.includes(k);
  const wallKind = (k) => el.walls?.[k] ?? (el.four || k === front ? 'lat' : 'plaster');
  const sill = [], nose = [], mo = [];
  const nr = plat >= 0.15 ? Math.max(1, Math.round(plat / 0.17)) : 0, rise = nr ? plat / nr : 0, tread = 0.32;
  for (const [k, [line, ticks, nx, nz]] of Object.entries(sides)) {
    if (!doorSide(k)) continue;
    const mid = Math.floor((ticks.length - 1) / 2), bays = el.doorBays?.[k] === 'sides' && ticks.length > 3 ? [mid - 1, mid + 1] : [mid];
    for (const i of bays) {
      const a = ticks[i], b = ticks[i + 1], c = (a + b) / 2, w = Math.min(Math.abs(b - a) * 0.8, 2.6);
      // the threshold: between the posts of the doorway, on the wall's line
      const ux = nz ? 1 : 0, uz = nz ? 0 : 1, o = nz ? [0, line] : [line, 0];
      threshold(sill, o, ux, uz, a + 0.22, b - 0.22, 0.24, y + 0.01);
      // the nose of each step down from this doorway (stacked slabs: the front edge of each tread, 28 mm round)
      for (let j = 1; j < nr; j++) {
        const top = y - j * rise - 0.02, ww = w / 2 + (j > 1 ? 0.04 * (j - 1) : 0), d = pm + j * tread;
        const p0 = nx ? [line + nx * d, top, c - ww] : [c - ww, top, line + nz * d], p1 = nx ? [line + nx * d, top, c + ww] : [c + ww, top, line + nz * d];
        rod(nose, p0, p1, 0.028);
      }
    }
  }
  // moss: along the foot of the platform's north face and in the corners of its steps (the sun never gets there)
  if (nr) {
    const nz0 = z0 - pm, n = Math.max(4, Math.round((x1 - x0 + 2 * pm) / 1.1));
    for (let i = 0; i < n; i++) {
      const u = x0 - pm + (i + 0.5) * (x1 - x0 + 2 * pm) / n;
      if (hash(u, nz0, 31) < 0.45) continue;
      moss(mo, u, nz0 - 0.1, 0.35 + 0.3 * hash(u, nz0, 32), 0.1 + 0.08 * hash(u, nz0, 33), (hash(u, nz0, 34) - 0.5) * 0.4, y - plat + 0.008, 35);
    }
  }
  if (sill.length) bag.add(STONE, fromTriangles(sill));
  if (nose.length) bag.add(STONE, fromTriangles(nose));
  if (mo.length) bag.add('cloth_green', fromTriangles(mo));
}

/**
 * wallWear(bag, el): the shady foot of a garden or court wall — moss in patches along the base of
 * its north face (a wall running east–west) and a worn threshold in each rectangular gate.
 */
export function wallWear(bag, el) {
  const [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, th = el.th ?? 0.4, y = el.y;
  const mo = [], sill = [];
  const gates = el.gates || [];
  const free = (u) => gates.every((g) => Math.abs(u - g.at) > (g.r ?? g.w / 2) + 0.4);
  if (Math.abs(uz) < 0.2) {
    // an east–west wall: its north face is the one the shade falls on
    const side = -1;                                         // north = −z
    for (let u = 0.5; u < L - 0.5; u += 0.9 + hash(ax + u, az, 41) * 1.6) {
      if (!free(u) || hash(ax + u, az, 42) < 0.4) continue;
      const cx = ax + ux * u, cz = az + side * (th / 2 + 0.07);
      moss(mo, cx, cz, 0.3 + 0.35 * hash(cx, cz, 43), 0.07 + 0.05 * hash(cx, cz, 44), (hash(cx, cz, 45) - 0.5) * 0.3, y + 0.012, 46);
    }
  }
  for (const g of gates) {
    if (g.r) continue;
    const o = [ax + ux * (g.at - g.w / 2 + 0.1), az + uz * (g.at - g.w / 2 + 0.1)];
    threshold(sill, o, ux, uz, 0, g.w - 0.2, th * 0.7, y + 0.02);
  }
  if (mo.length) bag.add('cloth_green', fromTriangles(mo));
  if (sill.length) bag.add(STONE, fromTriangles(sill));
}

/**
 * terrace_paving { rect, y (top), th, mat }: the terrace laid in slabs 1.2 × 0.6 m, running bond, in
 * the hall's own bluestone, with the settling of centuries: most flush (a few millimetres up or
 * down by a hash), about one in nine sunk at a corner, about one in twelve cracked across (two halves,
 * a dark seam between, one half a little lower).
 */
export function terracePaving(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, th = el.th ?? 0.3, mat = el.mat || 'bluestone';
  const out = [], seams = [], SW = 1.2, SD = 0.6;
  const rows = Math.ceil((z1 - z0) / SD);
  for (let j = 0; j < rows; j++) {
    const za = z0 + j * SD, zb = Math.min(z1, za + SD), off = (j % 2) * SW * 0.5;
    for (let xa = x0 - off; xa < x1 - 0.001; xa += SW) {
      const a = Math.max(x0, xa), b = Math.min(x1, xa + SW);
      if (b - a < 0.05) continue;
      const k = hash(a, za, 51), settle = (hash(a, za, 52) - 0.5) * 0.008;
      const gap = 0.004;
      const ya = y - 0.004 + settle;
      if (k < 0.09) {
        // sunk: the corner farthest from the wall lower by 1.5–2.5 cm, the slab tilted
        const dz = 0.014 + 0.012 * hash(a, za, 53), tilt = [0, 0, -dz, -dz * 0.6];
        slabTris(out, a + gap, za + gap, b - gap, zb - gap, y - th, tilt.map((t) => y + t - 0.006));
      } else if (k < 0.17) {
        // cracked across on a slant: two pieces, one a little lower, the crack between them dark
        const cx = a + (b - a) * (0.35 + 0.3 * hash(a, za, 54)), sl = (hash(a, za, 55) - 0.5) * 0.3, lo = 0.007 + 0.006 * hash(a, za, 56);
        const xm0 = cx - sl * (zb - za) / 2, xm1 = cx + sl * (zb - za) / 2;
        // left piece: the box with a slanted right side (built as two triangulated quads on top)
        const tp = (x, z, h) => [x, h, z];
        const t = (p0, p1, p2) => out.push(...p0, ...p1, ...p2);
        const h0 = ya, h1 = ya - lo, zA = za + gap, zB = zb - gap, xa2 = a + gap, xb2 = b - gap;
        t(tp(xa2, zA, h0), tp(xa2, zB, h0), tp(xm1 - 0.004, zB, h0)); t(tp(xa2, zA, h0), tp(xm1 - 0.004, zB, h0), tp(xm0 - 0.004, zA, h0));
        t(tp(xm0 + 0.004, zA, h1), tp(xm1 + 0.004, zB, h1), tp(xb2, zB, h1)); t(tp(xm0 + 0.004, zA, h1), tp(xb2, zB, h1), tp(xb2, zA, h1));
        // the sides and the fall at the crack
        const wall = (p, q, hp, hq, yb) => { out.push(p[0], hp, p[1], p[0], yb, p[1], q[0], yb, q[1], p[0], hp, p[1], q[0], yb, q[1], q[0], hq, q[1]); };
        wall([xa2, zB], [xa2, zA], h0, h0, y - th); wall([xa2, zA], [xm0 - 0.004, zA], h0, h0, y - th); wall([xm1 - 0.004, zB], [xa2, zB], h0, h0, y - th);
        wall([xm0 + 0.004, zA], [xb2, zA], h1, h1, y - th); wall([xb2, zA], [xb2, zB], h1, h1, y - th); wall([xb2, zB], [xm1 + 0.004, zB], h1, h1, y - th);
        wall([xm0 - 0.004, zA], [xm1 - 0.004, zB], h0, h0, y - th); wall([xm1 + 0.004, zB], [xm0 + 0.004, zA], h1, h1, y - th);
        // the bottom, one piece under both
        out.push(xa2, y - th, zA, xa2, y - th, zB, xb2, y - th, zB, xa2, y - th, zA, xb2, y - th, zB, xb2, y - th, zA);
        // the dark seam: a sliver of granite_black laid in the crack, just below the surface
        seams.push(xm0 - 0.004, h1 + 0.001, zA, xm1 - 0.004, h1 + 0.001, zB, xm1 + 0.004, h1 + 0.001, zB, xm0 - 0.004, h1 + 0.001, zA, xm1 + 0.004, h1 + 0.001, zB, xm0 + 0.004, h1 + 0.001, zA);
      } else slabTris(out, a + gap, za + gap, b - gap, zb - gap, y - th, [ya, ya, ya, ya]);
    }
  }
  bag.add(mat, fromTriangles(out));
  // the joints between the slabs, a dark mortar line under them
  bag.add(mat, fromTriangles([x0, y - th - 0.001, z0, x0, y - th - 0.001, z1, x1, y - th - 0.001, z1, x0, y - th - 0.001, z0, x1, y - th - 0.001, z1, x1, y - th - 0.001, z0]));
  if (seams.length) bag.add('granite_black', fromTriangles(seams));
  col.floor(el.rect, y);
}
