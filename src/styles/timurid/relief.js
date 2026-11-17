// Relief of the Timurid portal and minaret (docs/settlements/timurid-samarkand.md §18): pointed archivolts and
// panels standing out of the wall in stepped mouldings, the muqarnas corbel cornice with its parapet of merlons,
// the moulded frame (alfiz) round the portal's field. Pure geometry in the plan's metres; materials of the palette.

import { Shape, ExtrudeGeometry, Matrix4 } from '../../core/three.js';
import { orientedBox } from '../../core/build.js';
import { box } from '../../core/geom.js';

const unit = (a, b) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / L, (b[1] - a[1]) / L, L]; };

/** The points of the pointed arch of width W and height H from its left foot to its right foot (as the wall's own arches). */
function archPts(u0, W, H, y0 = 0) {
  const r = W * 0.8, rise = Math.sqrt(r * r - (r - W / 2) ** 2), spring = Math.max(0.3, H - rise), cL = u0 + r, cR = u0 + W - r, N = 12, p = [[u0, y0], [u0, y0 + spring]];
  for (let i = 1; i <= N; i++) { const x = u0 + (W / 2) * i / N; p.push([x, y0 + spring + Math.sqrt(Math.max(0, r * r - (x - cL) ** 2))]); }
  for (let i = 1; i <= N; i++) { const x = u0 + W / 2 + (W / 2) * i / N; p.push([x, y0 + spring + Math.sqrt(Math.max(0, r * r - (x - cR) ** 2))]); }
  p.push([u0 + W, y0 + spring], [u0 + W, y0]);
  return p;
}

/** A shape extruded `proj` toward the unit normal (nx, nz) from the surface point o = [x, y, z]; the shape's x runs along (nz, −nx). */
function place(bag, mat, shape, proj, o, nx, nz) {
  const g = new ExtrudeGeometry(shape, { depth: proj, bevelEnabled: false, curveSegments: 4 });
  const ux = nz, uz = -nx;
  g.applyMatrix4(new Matrix4().makeBasis({ x: ux, y: 0, z: uz }, { x: 0, y: 1, z: 0 }, { x: nx, y: 0, z: nz }).setPosition(o[0], o[1], o[2]));
  bag.add(mat, g);
}

/**
 * Stepped pointed archivolts round an opening in the wall a→b (face pushed out by d toward n): the opening at
 * `at` along the wall, width w, height h (as arcadeWall's), from `sill`; rings [[from, to, proj, mat]] are the
 * offsets of each moulding from the opening's edge and how far it stands out of the face.
 */
export function archRings(bag, o) {
  const { a, b, n, d, at, w, h, rings } = o, y = o.y ?? 0, sill = o.sill ?? 0, [ux, uz] = unit(a, b);
  const c = [a[0] + ux * at + n[0] * (d - 0.02), a[1] + uz * at + n[1] * (d - 0.02)];
  for (const [o0, o1, proj, mat] of rings) {
    const outer = archPts(-w / 2 - o1, w + 2 * o1, h + o1, 0), inner = archPts(-w / 2 - o0, w + 2 * o0, h + o0, 0).reverse();
    const s = new Shape(); s.moveTo(outer[0][0], outer[0][1]);
    for (const p of outer.slice(1)) s.lineTo(p[0], p[1]);
    for (const p of inner) s.lineTo(p[0], p[1]);
    place(bag, mat, s, proj + 0.02, [c[0], y + sill, c[1]], n[0], n[1]);
  }
}

/** A pointed panel (an arch-headed slab) standing out of a wall: centre c on the surface, outward normal (nx, nz), width w, height h, from height y. */
export function archPanel(bag, mat, c, y, nx, nz, w, h, proj) {
  const p = archPts(-w / 2, w, h, 0), s = new Shape(); s.moveTo(p[0][0], p[0][1]);
  for (const q of p.slice(1)) s.lineTo(q[0], q[1]);
  place(bag, mat, s, proj, [c[0] - nx * 0.02, y, c[1] - nz * 0.02], nx, nz);
}

/** A moulded rectangular frame (alfiz) of width t, standing p out of the face, round s0…s1 × v0…v1. */
export function frameRect(bag, o) {
  const { a, b, n, d, s0, s1, v0, v1, t, proj, mat } = o, y = o.y ?? 0, [ux, uz] = unit(a, b);
  const P = (s, off) => [a[0] + ux * s + n[0] * (d + off), a[1] + uz * s + n[1] * (d + off)];
  const bar = (sa, sb, va, vb) => bag.add(mat, orientedBox(P(sa, proj / 2 - 0.01), P(sb, proj / 2 - 0.01), proj, y + va, y + vb));
  bar(s0, s1, v0, v0 + t); bar(s0, s1, v1 - t * 1.06, v1);
  bar(s0, s0 + t, v0 + t, v1 - t * 1.06); bar(s1 - t * 1.08, s1, v0 + t, v1 - t * 1.06);
}

/**
 * The cornice of a portal along a→b at height y: two tiers of corbel cells (muqarnas) under a marble slab, and
 * a parapet of merlons over it capped in turquoise. `cell` the width of one cell.
 */
export function corbelCornice(bag, o) {
  const { a, b, n, d, y, th } = o, cell = o.cell ?? 0.5, [ux, uz, L] = unit(a, b);
  const P = (s, off) => [a[0] + ux * s + n[0] * (d + off), a[1] + uz * s + n[1] * (d + off)];
  const N = Math.max(2, Math.round((L - 0.4) / cell)), w = (L - 0.4) / N, jit = (i, k) => 1 + 0.04 * Math.sin(i * 12.9898 + k * 78.233) + 0.02 * Math.sin(i * 3.7 + k);
  for (let i = 0; i < N; i++) {
    const s0 = 0.2 + i * w + w * 0.08, s1 = 0.2 + (i + 1) * w - w * 0.08;
    bag.add('brick_buff', orientedBox(P(s0, 0.18), P(s1, 0.18), 0.36 * jit(i, 1), y - 0.95 * jit(i, 2), y - 0.5));
    // the second tier set over the joints, standing further out, its face in cream tile, its soffit stepped
    if (i < N - 1) {
      const m0 = 0.2 + (i + 0.5) * w + w * 0.08, m1 = 0.2 + (i + 1.5) * w - w * 0.08;
      bag.add('tile_cream', orientedBox(P(m0, 0.4), P(m1, 0.4), 0.52 * jit(i, 3), y - 0.5 * jit(i, 4), y - 0.12));
    }
  }
  bag.add('marble', orientedBox(P(0, 0.35), P(L, 0.35), 0.7, y - 0.12, y + 0.1));
  const mw = 0.6, step = 1.2, M = Math.floor((L - 0.4) / step);
  for (let i = 0; i < M; i++) {
    const s = 0.5 + i * ((L - 1.0) / Math.max(1, M - 1)), mj = mw * jit(i, 9), pa = P(s - mj / 2, -th / 2 + 0.3), pb = P(s + mj / 2, -th / 2 + 0.3);
    bag.add('brick_buff', orientedBox(pa, pb, th * 0.5, y + 0.1, y + 1.0 * jit(i, 10)));
    bag.add('tile_turquoise', orientedBox(pa, pb, th * 0.5 + 0.08, y + 1.0 * jit(i, 10), y + 1.14 * jit(i, 11)));
  }
  void box;
}
