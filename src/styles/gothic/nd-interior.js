// Notre-Dame de Paris inside, about 1248 (docs/settlements/paris.md §1b): the pieces the cathedral's
// body is built of now that it is hollow — walls in a frame (straight bays or the sides of the apse)
// pierced by pointed openings, the cylindrical piers with crocket capitals, the vaulting shafts,
// sexpartite and quadripartite rib vaults over any four-sided bay, and the furnishings: the jubé
// across the choir's entrance, the canons' stalls, the high altar.

import { box, lathe, fromTriangles, orientOutward } from '../../core/geom.js';

/** Pointed profile (f = arc radius / span): 1 at the crown (t = 0), 0 at the springing (t = 1). */
export function pointed(t, f = 0.7) {
  const R = 2 * f, H = Math.sqrt(R * R - (R - 1) * (R - 1)), x = Math.min(1, Math.max(0, t)) + (R - 1);
  return Math.sqrt(Math.max(0, R * R - x * x)) / H;
}
/** The rise of a pointed arch of half-width r (f as in archRise). */
export const rise = (r, f) => { const R = 2 * f * r; return Math.sqrt(R * R - (R - r) * (R - r)); };
/** The left half of a pointed arch from the springing (uc − r) to the crown, n + 1 points [u, y]. */
function halfArc(uc, r, spring, f, n) {
  const R = 2 * f * r, c = uc + (R - r), t1 = Math.acos(Math.min(1, (R - r) / R));
  return Array.from({ length: n + 1 }, (_, k) => { const t = Math.PI - (Math.PI - t1) * k / n; return [c + R * Math.cos(t), spring + R * Math.sin(t)]; });
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
/** Push the triangle a b c, wound so that its normal points along `want`. */
function tri(out, a, b, c, want) {
  const u = sub(b, a), v = sub(c, a), n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
  if (n[0] * want[0] + n[1] * want[1] + n[2] * want[2] < 0) out.push(...a, ...c, ...b); else out.push(...a, ...b, ...c);
}
/** A convex hexahedron from 8 corners (bottom four, top four), wound outward. */
function hexa(out, b, t) {
  const tris = [], q = (a, b2, c, d) => tris.push(...a, ...b2, ...c, ...a, ...c, ...d);
  q(b[0], b[1], b[2], b[3]); q(t[0], t[3], t[2], t[1]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; q(b[i], t[i], t[j], b[j]); }
  out.push(...orientOutward(tris));
}

/**
 * A wall in a frame M(u, y, d) → [x, y, z] (u along the wall, d across it, from the face d0 to d1),
 * from u0 to u1 and y0 to y1, pierced by pointed openings { uc, r (half-width), sill, spring, f }
 * (left to right, not overlapping, their crowns below y1). Solid strips between the openings, a
 * breast under each sill, the spandrels over each arch, the soffits round it.
 */
export function archWall(out, M, { u0, u1, d0, d1, y0, y1, openings = [], n = 8 }) {
  const B = (ua, ub, ya, yb) => { if (ub - ua < 1e-3 || yb - ya < 1e-3) return; hexa(out, [M(ua, ya, d0), M(ub, ya, d0), M(ub, ya, d1), M(ua, ya, d1)], [M(ua, yb, d0), M(ub, yb, d0), M(ub, yb, d1), M(ua, yb, d1)]); };
  const um = (u0 + u1) / 2, ym = (y0 + y1) / 2;
  const front = sub(M(um, ym, d0), M(um, ym, d1)), back = sub(M(um, ym, d1), M(um, ym, d0));
  let u = u0;
  for (const o of openings) {
    if (o.yc !== undefined) {
      // a round opening (a rose): the square round it less the disc, as fans from its corners; the soffit
      const a = o.uc - o.r, b = o.uc + o.r, N = 32, C = Array.from({ length: N + 1 }, (_, k) => [o.uc + o.r * Math.cos(2 * Math.PI * k / N), o.yc + o.r * Math.sin(2 * Math.PI * k / N)]);
      B(u, a, y0, y1); B(a, b, y0, o.yc - o.r); B(a, b, o.yc + o.r, y1);
      const corner = (k) => { const q = Math.floor(k / (N / 4)) % 4; return [[b, o.yc + o.r], [a, o.yc + o.r], [a, o.yc - o.r], [b, o.yc - o.r]][q]; };
      for (const [d, want] of [[d0, front], [d1, back]]) for (let k = 0; k < N; k++) {
        const c = corner(k); tri(out, M(c[0], c[1], d), M(C[k][0], C[k][1], d), M(C[k + 1][0], C[k + 1][1], d), want);
      }
      for (let k = 0; k < N; k++) {
        const p = C[k], q = C[k + 1], want = sub(M(o.uc, o.yc, (d0 + d1) / 2), M((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (d0 + d1) / 2));
        tri(out, M(p[0], p[1], d0), M(q[0], q[1], d0), M(q[0], q[1], d1), want); tri(out, M(p[0], p[1], d0), M(q[0], q[1], d1), M(p[0], p[1], d1), want);
      }
      u = b; continue;
    }
    const a = o.uc - o.r, b = o.uc + o.r, f = o.f ?? 0.75, top = o.spring + rise(o.r, f);
    const jl = a - u < 1e-3;
    B(u, a, y0, y1);
    B(a, b, y0, o.sill);
    B(a, b, top, y1);
    // the spandrels, front and back, as fans from the upper corners to the arch; the soffit
    const L = halfArc(o.uc, o.r, o.spring, f, n), R = L.map(([uu, yy]) => [2 * o.uc - uu, yy]), cr = [o.uc, top];
    for (const [d, want] of [[d0, front], [d1, back]]) {
      const P = ([uu, yy]) => M(uu, yy, d);
      for (let k = 0; k < n; k++) { tri(out, M(a, top, d), P(L[k]), P(L[k + 1]), want); tri(out, M(b, top, d), P(R[k + 1]), P(R[k]), want); }
      void cr;
    }
    for (const H of [L, R]) for (let k = 0; k < n; k++) {
      const p = H[k], q = H[k + 1], c = M(o.uc, o.spring, (d0 + d1) / 2), mid = M((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (d0 + d1) / 2), want = sub(c, mid);
      tri(out, M(p[0], p[1], d0), M(q[0], q[1], d0), M(q[0], q[1], d1), want); tri(out, M(p[0], p[1], d0), M(q[0], q[1], d1), M(p[0], p[1], d1), want);
    }
    // the jambs from the sill to the springing, where no strip of wall stands beside the opening
    const next = openings[openings.indexOf(o) + 1], jr = (next ? next.uc - next.r : u1) - b < 1e-3;
    for (const [uu, sg] of [[a, 1], [b, -1]]) {
      if (!(sg > 0 ? jl : jr)) continue;
      const want = sub(M(uu + sg, o.spring, (d0 + d1) / 2), M(uu, o.spring, (d0 + d1) / 2));
      tri(out, M(uu, o.sill, d0), M(uu, o.spring, d0), M(uu, o.spring, d1), want); tri(out, M(uu, o.sill, d0), M(uu, o.spring, d1), M(uu, o.sill, d1), want);
    }
    u = b;
  }
  B(u, u1, y0, y1);
}

/**
 * A cylindrical pier { x, z, y (floor), h (to the capital's foot), r } on a square plinth with a moulded
 * base; the bell of the capital in leaves with crockets curling out under the corners of the square abacus.
 * Returns the abacus's top.
 */
export function pier(bag, x, z, y, h, r, mat = 'limestone', carved = 'limestone_carved') {
  bag.add(mat, box(x - r * 1.25, y - 0.1, z - r * 1.25, x + r * 1.25, y + 0.45, z + r * 1.25));
  bag.add(mat, lathe([[r * 1.18, 0], [r * 1.18, 0.1], [r * 1.08, 0.22], [r * 1.12, 0.3], [r * 1.02, 0.42], [r, 0.5]], 16, null, x, y + 0.45, z));
  bag.add(mat, lathe([[r, 0], [r, h - 0.95]], 16, null, x, y + 0.95, z));
  const yc = y + h;
  bag.add(carved, lathe([[r * 1.02, 0], [r * 1.06, 0.12], [r * 1.12, 0.45], [r * 1.3, 0.78], [r * 1.42, 0.92], [0.001, 0.92]], 16, (t, i) => (i > 0 && i < 5 ? 1 + 0.08 * Math.max(0, Math.cos(8 * t)) : 1), x, yc, z));
  const s = r * 1.5;
  bag.add(mat, box(x - s, yc + 0.92, z - s, x + s, yc + 1.2, z + s));
  const cr = [];
  for (const [dx, dz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const cx = x + dx * r * 1.18, cz = z + dz * r * 1.18;
    hexa(cr, [[cx - 0.09, yc + 0.5, cz - 0.09], [cx + 0.09, yc + 0.5, cz - 0.09], [cx + 0.09, yc + 0.5, cz + 0.09], [cx - 0.09, yc + 0.5, cz + 0.09]],
      [[cx + dx * 0.16 - 0.13, yc + 0.92, cz + dz * 0.16 - 0.13], [cx + dx * 0.16 + 0.13, yc + 0.92, cz + dz * 0.16 - 0.13], [cx + dx * 0.16 + 0.13, yc + 0.92, cz + dz * 0.16 + 0.13], [cx + dx * 0.16 - 0.13, yc + 0.92, cz + dz * 0.16 + 0.13]]);
  }
  bag.add(carved, fromTriangles(cr));
  return yc + 1.2;
}

/** A rib hanging under a curve of points [x, y, z]: width w, depth d (the ends of the segments shared). */
function rib(out, pts, w = 0.3, d = 0.32) {
  for (let k = 0; k < pts.length - 1; k++) {
    const a = pts[k], b = pts[k + 1], tx = b[0] - a[0], tz = b[2] - a[2], L = Math.hypot(tx, tz) || 1, sx = -tz / L * w / 2, sz = tx / L * w / 2;
    const S = (p, dd) => [[p[0] - sx, p[1] - dd, p[2] - sz], [p[0] + sx, p[1] - dd, p[2] + sz]];
    const [a0, a1] = S(a, d), [a2, a3] = S(a, -0.03), [b0, b1] = S(b, d), [b2, b3] = S(b, -0.03);
    const tris = [], q = (p, q2, r2, s2) => tris.push(...p, ...q2, ...r2, ...p, ...r2, ...s2);
    q(a0, a1, b1, b0); q(a2, b2, b3, a3); q(a1, a3, b3, b1); q(a0, b0, b2, a2);
    if (k === 0) q(a0, a2, a3, a1);
    if (k === pts.length - 2) q(b0, b1, b3, b2);
    out.push(...orientOutward(tris));
  }
}

/**
 * A rib vault over a four-sided bay: Q(u, v) → [x, z] (u along the vessel, v across, both 0…1,
 * bilinear), springing at `spring`, its crown at `crown`. `sex`: sexpartite (the diagonals across the
 * whole bay, a transverse rib through the middle, the side cells rising to the windows between them);
 * else quadripartite. `last`: also the transverse rib at u = 1 (else the next bay's draws it). The webs face down; the ribs hang below them; a boss at the crown.
 */
export function vault(bag, Q, { spring, crown, sex = false, f = 0.7, lun = 0.9, nu = 12, nv = 10, mat = 'limestone', ribMat = 'limestone', boss = 'limestone_carved', wallRibs = true, transverse = true, last = true, ribN = 16 }) {
  const H = crown - spring;
  const h = (u, v) => {
    const s = Math.abs(2 * v - 1), t = Math.abs(2 * u - 1), L = pointed(s, f);
    if (!sex) return spring + H * Math.max(L, pointed(t, f));
    if (t >= s || s < 1e-6) return spring + H * L;
    return spring + H * (L + lun * (1 - L) * Math.sin(Math.PI * t / s));
  };
  const P = (u, v) => { const [x, z] = Q(u, v); return [x, h(u, v), z]; };
  const web = [];
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const a = P(i / nu, j / nv), b = P((i + 1) / nu, j / nv), c = P((i + 1) / nu, (j + 1) / nv), d = P(i / nu, (j + 1) / nv);
    tri(web, a, b, c, [0, -1, 0]); tri(web, a, c, d, [0, -1, 0]);
  }
  bag.add(mat, fromTriangles(web));
  const out = [], N = ribN, line = (u0, v0, u1, v1) => Array.from({ length: N + 1 }, (_, k) => P(u0 + (u1 - u0) * k / N, v0 + (v1 - v0) * k / N));
  rib(out, line(0, 0, 1, 1)); rib(out, line(0, 1, 1, 0));
  // (the transverse ribs at u = 0, and at u = 1 for the last bay of a row: neighbours share them)
  if (transverse) { rib(out, line(0, 0, 0, 1), 0.4, 0.4); if (last) rib(out, line(1, 0, 1, 1), 0.4, 0.4); }
  if (sex) rib(out, line(0.5, 0, 0.5, 1), 0.34, 0.36);
  if (wallRibs) { rib(out, line(0, 0.004, 1, 0.004), 0.16, 0.16); rib(out, line(0, 0.996, 1, 0.996), 0.16, 0.16); }
  bag.add(ribMat, fromTriangles(out));
  const c = P(0.5, 0.5);
  bag.add(boss, lathe([[0.34, 0], [0.4, 0.12], [0.2, 0.26], [0.001, 0.3]], 10, (t) => 1 + 0.12 * Math.cos(6 * t), c[0], c[1] - 0.62, c[2]));
}

/**
 * The jubé (about 1230; fragments excavated under the crossing in 2022) across the choir's entrance:
 * x from xa (its west face) to xb, z from z0 to z1, the floor at y. An arcade of five pointed bays on
 * colonnettes, the middle one the door into the choir, the others altars' recesses; over them a frieze
 * of the Passion in painted relief on a blue ground sown with gold; a cornice, an openwork parapet, the
 * platform; on it the rood: the cross with Christ between the Virgin and Saint John.
 */
export function jube(ctx, { xa, xb, z0, z1, y, figure }) {
  const { bag, col } = ctx, W = z1 - z0, n = 5, bw = W / n, hA = 4.2, hF = 1.5, hP = 1.0, yA = y + hA, yF = yA + 0.3, yT = yF + hF;
  const out = [], M = (u, yy, d) => [xa + d, yy, z0 + u];
  // the west face: the arcade (the bays' recesses 1.2 m deep; the door through)
  const ops = Array.from({ length: n }, (_, i) => ({ uc: (i + 0.5) * bw, r: bw / 2 - 0.32, sill: y, spring: y + 2.7, f: 0.72 }));
  archWall(out, M, { u0: 0, u1: W, d0: 0, d1: 0.5, y0: y, y1: yA + 0.3, openings: ops });
  bag.add('limestone', fromTriangles(out));
  // the bays: back walls of the recesses (not the door), their vaults' ceiling, altars
  for (let i = 0; i < n; i++) {
    const za = z0 + i * bw + 0.32, zb = z0 + (i + 1) * bw - 0.32;
    if (i !== 2) {
      bag.add('paint_fleur', box(xa + 1.7, y, za, xa + 1.8, yA, zb));
      bag.add('limestone', box(xa + 1.2, y, za, xa + 1.5, y + 1.0, zb)); bag.add('paint_castle', box(xa + 1.18, y + 0.15, za + 0.15, xa + 1.2, y + 0.85, zb - 0.15));
      bag.add('limestone', box(xa + 1.15, y + 1.0, za - 0.02, xa + 1.55, y + 1.08, zb + 0.02));
      bag.add('gilt_bronze', box(xa + 1.33, y + 1.08, (za + zb) / 2 - 0.03, xa + 1.37, y + 1.6, (za + zb) / 2 + 0.03)); bag.add('gilt_bronze', box(xa + 1.33, y + 1.38, (za + zb) / 2 - 0.2, xa + 1.37, y + 1.43, (za + zb) / 2 + 0.2));
      col.rect([xa, za, xa + 1.8, zb], y, yA);
    }
    for (const zz of [za, zb]) { bag.add('limestone', lathe([[0.1, 0], [0.1, 2.55], [0.16, 2.6], [0.16, 2.7]], 8, null, xa - 0.06, y, zz)); }
  }
  // the body of the screen behind the arcade, its passage through the middle bay
  const zd0 = z0 + 2 * bw + 0.32, zd1 = z0 + 3 * bw - 0.32;
  for (const [za, zb] of [[z0, zd0], [zd1, z1]]) { bag.add('limestone', box(xa + 1.8, y, za, xb, yA, zb)); col.rect([xa + 0.5, za, xb, zb], y, yT + hP); }
  bag.add('limestone', box(xa + 0.5, yA - 0.6, zd0, xb, yA + 0.3, zd1));
  bag.add('limestone', box(xa + 0.5, yA + 0.3, z0, xb, yF, z1));
  // the frieze: a ground of blue and gold, the scenes in figures standing proud of it, the bands
  bag.add('paint_fleur', box(xa - 0.02, yF, z0, xa + 0.3, yT, z1));
  bag.add('limestone_carved', box(xa - 0.12, yF - 0.08, z0, xa + 0.3, yF + 0.06, z1));
  bag.add('limestone_carved', box(xa - 0.14, yT - 0.06, z0, xa + 0.3, yT + 0.08, z1));
  const scenes = 7, sw = W / scenes;
  for (let k = 0; k < scenes; k++) {
    const zc = z0 + (k + 0.5) * sw;
    if (k > 0) bag.add('limestone_carved', lathe([[0.06, 0], [0.06, hF - 0.14]], 6, null, xa - 0.02, yF + 0.06, z0 + k * sw));
    // three to four figures to a scene; the middle of the frieze the Crucifixion's foot, the rest about it
    const m = 3 + (k % 2);
    for (let j = 0; j < m; j++) {
      const zz = zc - sw / 2 + (j + 0.5) * sw / m;
      figure(bag, xa - 0.08, yF + 0.06, zz, hF - 0.3, { mat: j % 2 ? 'limestone_carved' : 'paint_robe', book: k === 3 && j === 1, seat: k === 0 && j === 0 });
    }
  }
  // the cornice, the platform's parapet of quatrefoils between posts
  bag.add('limestone', box(xa - 0.25, yT + 0.08, z0 - 0.1, xb + 0.1, yT + 0.35, z1 + 0.1));
  const np = 14;
  for (let i = 0; i <= np; i++) bag.add('limestone', box(xa - 0.18, yT + 0.35, z0 + i * W / np - 0.07, xa + 0.02, yT + 0.35 + hP, z0 + i * W / np + 0.07));
  for (let i = 0; i < np; i++) {
    const zc = z0 + (i + 0.5) * W / np, rr = W / np / 2 - 0.12;
    const ring = []; for (let k = 0; k <= 16; k++) { const a = k / 16 * Math.PI * 2, rf = rr * (0.78 + 0.22 * Math.abs(Math.cos(2 * a))); ring.push([xa - 0.08, yT + 0.35 + hP / 2 + Math.sin(a) * rf, zc + Math.cos(a) * rf]); }
    const tr = []; for (let k = 0; k < 16; k++) { const a = ring[k], b = ring[k + 1]; hexa(tr, [[a[0] - 0.05, a[1] - 0.03, a[2]], [a[0] + 0.05, a[1] - 0.03, a[2]], [b[0] + 0.05, b[1] - 0.03, b[2]], [b[0] - 0.05, b[1] - 0.03, b[2]]], [[a[0] - 0.05, a[1] + 0.03, a[2]], [a[0] + 0.05, a[1] + 0.03, a[2]], [b[0] + 0.05, b[1] + 0.03, b[2]], [b[0] - 0.05, b[1] + 0.03, b[2]]]); }
    bag.add('limestone_carved', fromTriangles(tr));
  }
  bag.add('limestone', box(xa - 0.22, yT + 0.35 + hP, z0, xa + 0.06, yT + 0.5 + hP, z1));
  bag.add('flagstone', box(xa + 0.06, yT + 0.3, z0, xb, yT + 0.36, z1));
  // the rood: a painted cross on the platform, Christ on it, the Virgin and Saint John either side
  const zc = (z0 + z1) / 2, yr = yT + 0.36, xr = xa + 0.7;
  bag.add('paint_castle', box(xr - 0.12, yr, zc - 0.14, xr + 0.12, yr + 5.2, zc + 0.14));
  bag.add('paint_castle', box(xr - 0.12, yr + 3.6, zc - 1.5, xr + 0.12, yr + 3.88, zc + 1.5));
  for (const [zz, yy] of [[zc, yr + 5.2], [zc - 1.5, yr + 3.74], [zc + 1.5, yr + 3.74]]) bag.add('gold', box(xr - 0.14, yy - 0.2, zz - 0.2, xr + 0.14, yy + 0.2, zz + 0.2));
  figure(bag, xr - 0.2, yr + 2.0, zc, 1.8, { mat: 'limestone_carved' });
  bag.add('limestone_carved', box(xr - 0.3, yr + 3.55, zc - 0.85, xr - 0.14, yr + 3.7, zc + 0.85));
  for (const s of [-1, 1]) { bag.add('limestone', box(xr - 0.3, yr, zc + s * 2.1 - 0.3, xr + 0.3, yr + 0.3, zc + s * 2.1 + 0.3)); figure(bag, xr, yr + 0.3, zc + s * 2.1, 1.9, { mat: s < 0 ? 'paint_fleur' : 'paint_robe', book: s > 0 }); }
}

/** The canons' stalls along one side of the choir: x from xa to xb, the backs against the face at zb (the seats facing zf). */
export function stalls(ctx, { xa, xb, zb, zf, y }) {
  const { bag, col } = ctx, s = Math.sign(zf - zb), Z = (d) => zb + s * d, r = (x0, d0, x1, d1, y0, y1, m = 'wood_dark') => bag.add(m, box(x0, y0, Math.min(Z(d0), Z(d1)), x1, y1, Math.max(Z(d0), Z(d1))));
  // the upper row on a step, the lower row before it; the desks in front of each
  r(xa, 0, xb, 2.4, y, y + 0.3, 'timber');
  const n = Math.round((xb - xa) / 0.72), w = (xb - xa) / n;
  r(xa, 0, xb, 0.12, y + 0.3, y + 3.4);                                  // the back panelling
  for (let i = 0; i <= n; i++) { const x = xa + i * w; r(x - 0.04, 0.12, x + 0.04, 0.75, y + 0.3, y + 1.35); r(x - 0.06, 0.12, x + 0.06, 0.2, y + 1.35, y + 3.0, 'timber'); }
  for (let i = 0; i < n; i++) r(xa + i * w + 0.05, 0.15, xa + (i + 1) * w - 0.05, 0.68, y + 0.72, y + 0.78, 'timber');
  r(xa, 0.75, xb, 0.95, y + 0.3, y + 1.15);                              // the upper row's desk-front for the lower
  r(xa, 0.6, xb, 1.05, y + 1.15, y + 1.22, 'timber');
  r(xa, 1.05, xb, 1.15, y + 0.3, y + 0.85);
  for (let i = 0; i < n; i++) r(xa + i * w + 0.05, 1.18, xa + (i + 1) * w - 0.05, 1.7, y + 0.7, y + 0.76, 'timber');
  r(xa, 1.85, xb, 2.4, y + 0.3, y + 1.05); r(xa, 1.75, xb, 2.45, y + 1.05, y + 1.12, 'timber');
  // the canopy: a coved cornice on brackets, a cresting of small gables
  r(xa, 0, xb, 0.9, y + 3.4, y + 3.55);
  for (let i = 0; i <= n; i += 2) { const x = xa + i * w; r(x - 0.05, 0.12, x + 0.05, 0.9, y + 3.0, y + 3.4, 'timber'); }
  for (let i = 0; i < n; i++) { const x = xa + (i + 0.5) * w, t = []; hexa(t, [[x - w / 2 + 0.04, y + 3.55, Z(0.55)], [x + w / 2 - 0.04, y + 3.55, Z(0.55)], [x + w / 2 - 0.04, y + 3.55, Z(0.65)], [x - w / 2 + 0.04, y + 3.55, Z(0.65)]], [[x - 0.01, y + 4.0, Z(0.55)], [x + 0.01, y + 4.0, Z(0.55)], [x + 0.01, y + 4.0, Z(0.65)], [x - 0.01, y + 4.0, Z(0.65)]]); bag.add('timber', fromTriangles(t)); }
  col.rect([xa, Math.min(Z(0), Z(2.45)), xb, Math.max(Z(0), Z(2.45))], y, y + 3.6);
}

/** The high altar at (x, z) facing west: steps, the stone table with its painted frontal, the retable, the cross and candlesticks, a cloth. */
export function altar(ctx, { x, z, y }) {
  const { bag, col } = ctx;
  bag.add('limestone', box(x - 2.2, y, z - 3.2, x + 1.6, y + 0.18, z + 3.2));
  bag.add('limestone', box(x - 1.6, y + 0.18, z - 2.7, x + 1.4, y + 0.36, z + 2.7));
  bag.add('limestone', box(x - 0.6, y + 0.36, z - 1.6, x + 0.6, y + 1.38, z + 1.6));
  bag.add('paint_fleur', box(x - 0.62, y + 0.45, z - 1.5, x - 0.6, y + 1.3, z + 1.5));
  bag.add('linen', box(x - 0.66, y + 1.38, z - 1.66, x + 0.62, y + 1.42, z + 1.66));
  bag.add('linen', box(x - 0.66, y + 1.1, z - 1.66, x - 0.62, y + 1.42, z + 1.66));
  bag.add('gilt_bronze', box(x + 0.35, y + 1.42, z - 1.4, x + 0.5, y + 2.4, z + 1.4));            // the retable
  for (let k = 0; k < 5; k++) bag.add('paint_castle', box(x + 0.33, y + 1.55, z - 1.3 + k * 0.54, x + 0.35, y + 2.25, z - 0.86 + k * 0.54));
  bag.add('gold', box(x + 0.15, y + 1.42, z - 0.03, x + 0.2, y + 2.9, z + 0.03)); bag.add('gold', box(x + 0.15, y + 2.4, z - 0.25, x + 0.2, y + 2.46, z + 0.25));
  for (const s of [-1, 1]) { bag.add('gilt_bronze', lathe([[0.1, 0], [0.03, 0.08], [0.025, 0.4], [0.06, 0.44], [0.001, 0.46]], 8, null, x + 0.1, y + 1.42, z + s * 0.9)); bag.add('linen', lathe([[0.025, 0], [0.025, 0.25]], 6, null, x + 0.1, y + 1.88, z + s * 0.9)); }
  col.rect([x - 0.62, z - 1.66, x + 0.62, z + 1.66], y, y + 2.4);
}
