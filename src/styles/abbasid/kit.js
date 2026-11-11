// Shared helpers of the Abbasid style (docs/settlements/abbasid-baghdad.md §3): walls run on any line with
// arched openings, vaults and domes, the stucco panel, the shop bay. Builds on the Mamluk kit's frames and arches
// (read-only): u along a face, d outward, v up.

import { box, fromTriangles, lathe } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';
import { orientedBox } from '../../core/build.js';
import { polyGeo, archCurve, archPoly, rng, dbl } from '../mamluk/kit.js';

export { rng, dbl, polyGeo, archCurve, archPoly, orientedBox };
export const D2R = Math.PI / 180;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** The frame of a line a → b: u along it from a, d to its left-hand side (n = [-uz, ux] rotated so d is +n when side = 1). */
export function lineFrame(a, b, side = 1) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  const N = [-uz * side, ux * side];
  return { O: a, U: [ux, uz], N, L, P: (u, d = 0) => [a[0] + ux * u + N[0] * d, a[1] + uz * u + N[1] * d] };
}

/** The solid above a pointed arch of width w from v0 (springing at its curve's start) up to `top`, in the frame, between d0 and d1. */
export function spandrel(fr, u0, v0, w, h, top, d0, d1, n = 8) {
  const { pts } = archCurve(w, h, n);
  const poly = [[u0, top], [u0 + w, top], ...pts.slice().reverse().map((c) => [u0 + c.p[0], v0 + c.p[1]])];
  return polyGeo(fr, poly, d0, d1);
}

/**
 * A straight wall on the line a → b, thickness th, from y0 to y1 in `mat`, with openings
 * { at, w, h (to the apex of a pointed arch, or the lintel when flat), flat, y0 (sill, 0 = a door), sill (a window's wall below) }.
 * Doors keep the wall's full thickness; the reveal is plain. Colliders follow (the arch's apex is the clearance).
 */
export function wallRun({ bag, col }, { a, b, th, y0, y1, mat, ops = [], caps = null, collide = true }) {
  const fr = lineFrame(a, b), L = fr.L;
  const list = ops.map((o) => ({ ...o, s0: o.at - o.w / 2, s1: o.at + o.w / 2, sy: o.y0 ?? y0 })).sort((p, q) => p.s0 - q.s0);
  const solid = (s0, s1, v0, v1) => {
    if (s1 - s0 < 1e-3 || v1 - v0 < 1e-3) return;
    const p0 = fr.P(s0), p1 = fr.P(s1);
    bag.add(mat, orientedBox(p0, p1, th, v0, v1));
    if (collide) col.segment(p0, p1, th, v0, v1);
  };
  let s = 0;
  for (const o of list) {
    solid(s, o.s0, y0, y1);
    if (o.sy > y0) solid(o.s0, o.s1, y0, o.sy);
    if (o.flat) solid(o.s0, o.s1, o.sy + o.h, y1);
    else {
      const top = o.sy + o.h;
      if (y1 > top - 0.05) bag.add(mat, spandrel(fr, o.s0, o.sy, o.w, o.h, y1, -th / 2, th / 2));
      if (collide) { const p0 = fr.P(o.s0), p1 = fr.P(o.s1); col.segment(p0, p1, th, top, y1); }
    }
    s = o.s1;
  }
  solid(s, L, y0, y1);
  return fr;
}

/** A pointed brick arch ring in the frame: voussoirs in two bricks' alternating materials, d0..d1, over an opening. */
export function archBand(bag, fr, u0, v0, w, h, ring, d0, d1, mats = ['brick_baked', 'brick_buff']) {
  const { pts } = archCurve(w, h, 7), m = pts.length;
  for (let i = 0; i + 1 < m; i++) {
    const A = pts[i], B = pts[i + 1], q = (c) => [u0 + c.p[0] + c.n[0] * ring, v0 + c.p[1] + c.n[1] * ring], p = (c) => [u0 + c.p[0], v0 + c.p[1]];
    bag.add(mats[i % mats.length], polyGeo(fr, [p(A), p(B), q(B), q(A)], d0, d1));
  }
}

/** A barrel vault over rect r (along x if `along` = 'x'), springing at y, rise = half the span; the inner surface only, both sides drawn. */
export function barrel(bag, mat, rect, y, along = 'x', n = 8, rise = null) {
  const [x0, z0, x1, z1] = rect, span = along === 'x' ? z1 - z0 : x1 - x0, len = along === 'x' ? x1 - x0 : z1 - z0, R = span / 2, H = rise ?? R, out = [];
  for (let i = 0; i < n; i++) {
    const t0 = Math.PI * i / n, t1 = Math.PI * (i + 1) / n;
    const P = (t, s) => { const c = Math.cos(t) * R, h = Math.sin(t) * H; return along === 'x' ? [x0 + s, y + h, (z0 + z1) / 2 + c] : [(x0 + x1) / 2 + c, y + h, z0 + s]; };
    out.push(...P(t0, 0), ...P(t0, len), ...P(t1, len), ...P(t0, 0), ...P(t1, len), ...P(t1, 0));
  }
  // the walk's top field takes the first of two coincident faces: put the one facing down first, so a vault over a passage is a soffit and not a roof
  const m = Math.floor(n / 2) * 18, A = out.slice(m, m + 9), ny = (A[5] - A[2]) * (A[6] - A[0]) - (A[3] - A[0]) * (A[8] - A[2]);
  const flip = (t) => { const o = []; for (let i = 0; i < t.length; i += 9) o.push(...t.slice(i, i + 3), ...t.slice(i + 6, i + 9), ...t.slice(i + 3, i + 6)); return o; };
  const dn = ny > 0 ? flip(out) : out, up = ny > 0 ? out : flip(out), lift = dn.map((v, i) => (i % 3 === 1 ? v + 0.02 : v));      // (the soffit 2 cm above its back, which is then the top the field reads: facing down, not a roof)
  bag.add(mat, fromTriangles(lift.concat(up)));
}

/** A dome on a circle (cx, cz) of radius r from y: a pointed (onion-less) shell, profile 'round' or 'pointed' (the Abbasid dome's slight point); seg sides. */
export function domeShell(bag, mat, cx, cz, r, y, { pointed = 0.15, seg = 24, rows = 8, cap = 0 } = {}) {
  const prof = [];
  for (let i = 0; i <= rows; i++) {
    const t = i / rows * (Math.PI / 2), k = 1 + pointed * Math.sin(t) ** 2;
    prof.push([Math.max(0.001, Math.cos(t) * r), Math.sin(t) * r * k]);
  }
  bag.add(mat, lathe(prof.map(([rr, yy]) => [rr, yy]), seg, null, cx, y, cz));
  if (cap) bag.add('gilt_bronze', lathe([[0.001, 0], [r * 0.06, 0.05], [r * 0.045, cap * 0.4], [r * 0.07, cap * 0.55], [0.001, cap]], 10, null, cx, y + prof[rows][1] * 0.99, cz));
}

/**
 * A stucco panel in the Samarra manner (style C, "bevelled"): a plaster slab with a field of raised faceted lozenges (a pyramid
 * of four facets each, the neighbours alternately large and small) in frame `fr`, u0..u1 × v0..v1, relief d.
 */
export function stuccoPanel(bag, fr, u0, u1, v0, v1, d = 0.03, mat = 'stucco', cell = 0.36) {
  const nu = Math.max(1, Math.round((u1 - u0) / cell)), nv = Math.max(1, Math.round((v1 - v0) / cell)), du = (u1 - u0) / nu, dv = (v1 - v0) / nv;
  const W = (u, v, dd) => [fr.O[0] + fr.U[0] * u + fr.N[0] * dd, v, fr.O[1] + fr.U[1] * u + fr.N[1] * dd];
  const tris = [];
  const slab = [W(u0, v0, 0.004), W(u1, v0, 0.004), W(u1, v1, 0.004), W(u0, v1, 0.004)];
  tris.push(...slab[0], ...slab[1], ...slab[2], ...slab[0], ...slab[2], ...slab[3]);
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const uc = u0 + (i + 0.5) * du, vc = v0 + (j + 0.5) * dv, k = ((i + j) & 1) ? 0.46 : 0.3, a = du * k, b = dv * k;
    const T = W(uc, vc + b, 0.004), R = W(uc + a, vc, 0.004), B = W(uc, vc - b, 0.004), L = W(uc - a, vc, 0.004), Cn = W(uc, vc, d);
    tris.push(...T, ...L, ...Cn, ...L, ...B, ...Cn, ...B, ...R, ...Cn, ...R, ...T, ...Cn);
  }
  bag.add(mat, dbl(tris));
}

/** A boxed frame: n rows of bricks' projecting courses in a band (the saw-tooth frieze of baked brick), u0..u1 at height v, depth 0.07. */
export function sawtooth(bag, fr, u0, u1, v, mat = 'brick_baked') {
  const n = Math.max(1, Math.floor((u1 - u0) / 0.3));
  for (let i = 0; i < n; i++) {
    const a = u0 + i * (u1 - u0) / n, b = a + (u1 - u0) / n;
    bag.add(mat, polyGeo(fr, [[a, v], [b, v], [(a + b) / 2, v + 0.1]], 0, 0.07));
  }
}

/** Crenels of a wall top on the line a → b (th), from y: merlons 0.8 wide, 0.9 apart, 1 high, both faces. */
export function merlons(bag, mat, a, b, th, y, { w = 0.9, gap = 0.7, h = 1.1 } = {}) {
  const fr = lineFrame(a, b), n = Math.max(1, Math.floor(fr.L / (w + gap)));
  const step = fr.L / n;
  for (let i = 0; i < n; i++) {
    const s0 = i * step + gap / 2, s1 = s0 + w;
    if (s1 > fr.L) break;
    bag.add(mat, orientedBox(fr.P(s0), fr.P(s1), th * 0.5, y, y + h));
  }
}
export { box, fromTriangles };

/**
 * Build in a local frame: `fn` gets a context whose bag, colliders and lights are in a frame at (ox, oz) turned by `yaw`
 * (radians; the world point of a local (x, z) is the rotation of it by makeRotationY(yaw), then moved). A quarter turn keeps
 * floors and ramps exact; at other angles floors and ramps are dropped (obstacles go as polygons).
 */
export function local(ctx, [ox, oz], yaw, fn) {
  const c = Math.round(Math.cos(yaw) * 1e9) / 1e9, s = Math.round(Math.sin(yaw) * 1e9) / 1e9;
  const quarter = Math.abs(c * s) < 1e-6;
  const P = (x, z) => [ox + x * c + z * s, oz - x * s + z * c];
  const m = new Matrix4().makeRotationY(yaw); m.setPosition(ox, 0, oz);
  const bag = { add: (mat, g) => { if (g) { g.applyMatrix4(m); ctx.bag.add(mat, g); } }, addInstance: (...a) => ctx.bag.addInstance?.(...a) };
  const poly = (pts, y0, y1) => ctx.col.obstacles.push({ poly: pts.map(([x, z]) => P(x, z)), y0, y1 });
  const dirs = ['n', 'e', 's', 'w'], turn = Math.round(-yaw / (Math.PI / 2));
  const col = {
    floors: ctx.col.floors, obstacles: ctx.col.obstacles,
    floor(rect, y, tag) { if (!quarter) return; const a = P(rect[0], rect[1]), b = P(rect[2], rect[3]); ctx.col.floor([a[0], a[1], b[0], b[1]], y, tag); },
    ramp(rect, y0, y1, dir) { if (!quarter) return; const a = P(rect[0], rect[1]), b = P(rect[2], rect[3]); ctx.col.ramp([a[0], a[1], b[0], b[1]], y0, y1, dirs[(((dirs.indexOf(dir) + turn) % 4) + 4) % 4]); },
    segment(a, b, th, y0, y1) { const A = P(...a), B = P(...b); ctx.col.segment(A, B, th, y0, y1); },
    rect(r, y0, y1) { const [x0, z0, x1, z1] = [Math.min(r[0], r[2]), Math.min(r[1], r[3]), Math.max(r[0], r[2]), Math.max(r[1], r[3])]; poly([[x0, z0], [x1, z0], [x1, z1], [x0, z1]], y0, y1); },
    circle(x, z, r, y0, y1) { const q = P(x, z); ctx.col.circle(q[0], q[1], r, y0, y1); },
  };
  const lights = { push: (l) => { const q = P(l.at[0], l.at[2]); ctx.lights.push({ ...l, at: [q[0], l.at[1], q[1]] }); }, get length() { return ctx.lights.length; } };
  return fn({ ...ctx, bag, col, lights });
}
