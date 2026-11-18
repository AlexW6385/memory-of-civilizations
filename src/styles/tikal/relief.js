// Low relief as one continuous modelled surface (docs/settlements/maya-tikal.md §15): a height field over a carved face, built from
// parts (limbs as tapered capsules, torsos, heads, feathers as shapes with a rounded shoulder) that stack on one another, so that an arm
// rises out of the torso and the torso out of the slab, 2–8 cm in all, with smooth normals and no plates. A part may carry a material
// (the paint of the garment, the jade, the blue feathers): each triangle takes the material of the last painted part over its middle.
// A `patch` field refines a rectangle of a base field (finer cells, only where its parts rise), standing exactly on the base's surface.
// Everything is a function of its inputs: the same plan builds the same geometry every time.

import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';

export { hash3 as hash } from '../nabataean/sculpt.js';

const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
/** A rounded shoulder: 0 at the edge, 1 inside `e` (a quarter circle, so the edge falls steeply as carved stone does). */
const shoulder = (t) => Math.sqrt(Math.max(0, 1 - (1 - t) * (1 - t)));
const smooth = (t) => t * t * (3 - 2 * t);

// ── shapes: signed distances (negative inside) with a box [x0, y0, x1, y1] ────────────────────────────────────
const tag = (f, bb) => { f.bb = bb; return f; };
/** A tapered capsule from (ax, ay) of radius ra to (bx, by) of radius rb. */
export function cap(ax, ay, bx, by, ra, rb = ra) {
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1e-9, m = Math.max(ra, rb);
  return tag((x, y) => { const t = clamp(((x - ax) * dx + (y - ay) * dy) / l2); return Math.hypot(ax + dx * t - x, ay + dy * t - y) - (ra + (rb - ra) * t); }, [Math.min(ax, bx) - m, Math.min(ay, by) - m, Math.max(ax, bx) + m, Math.max(ay, by) + m]);
}
/** An ellipse of radii rx, ry about (cx, cy), turned by rot (radians). */
export function ell(cx, cy, rx, ry, rot = 0) {
  const c = Math.cos(rot), s = Math.sin(rot), m = Math.max(rx, ry);
  return tag((x, y) => {
    const dx = x - cx, dy = y - cy, u = dx * c + dy * s, v = -dx * s + dy * c, k0 = Math.hypot(u / rx, v / ry), k1 = Math.hypot(u / (rx * rx), v / (ry * ry));
    return k1 < 1e-9 ? -Math.min(rx, ry) : k0 * (k0 - 1) / k1;
  }, [cx - m, cy - m, cx + m, cy + m]);
}
/** A rounded rectangle of half-sizes hx, hy about (cx, cy), corner radius r, turned by rot. */
export function rect(cx, cy, hx, hy, r = 0, rot = 0) {
  const c = Math.cos(rot), s = Math.sin(rot), m = Math.hypot(hx, hy);
  r = Math.min(r, hx, hy);
  return tag((x, y) => {
    const dx = x - cx, dy = y - cy, u = Math.abs(dx * c + dy * s) - (hx - r), v = Math.abs(-dx * s + dy * c) - (hy - r);
    return Math.hypot(Math.max(u, 0), Math.max(v, 0)) + Math.min(Math.max(u, v), 0) - r;
  }, [cx - m, cy - m, cx + m, cy + m]);
}
/** A polygon (any simple outline) given as [[x, y], …]. */
export function poly(pts) {
  const n = pts.length; let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  return tag((px, py) => {
    let d = Infinity, s = 1;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const ex = pts[j][0] - pts[i][0], ey = pts[j][1] - pts[i][1], wx = px - pts[i][0], wy = py - pts[i][1];
      const t = clamp((wx * ex + wy * ey) / (ex * ex + ey * ey || 1e-9)), bx = wx - ex * t, by = wy - ey * t;
      d = Math.min(d, bx * bx + by * by);
      const c1 = py >= pts[i][1], c2 = py < pts[j][1], c3 = ex * wy > ey * wx;
      if ((c1 && c2 && c3) || (!c1 && !c2 && !c3)) s = -s;
    }
    return s * Math.sqrt(d);
  }, [x0, y0, x1, y1]);
}
/** A shape mirrored about the vertical axis x = 0 (a, b: the shape and its mirror, joined). */
export function both(f) {
  const g = tag((x, y) => Math.min(f(x, y), f(-x, y)), [Math.min(f.bb[0], -f.bb[2]), f.bb[1], Math.max(f.bb[2], -f.bb[0]), f.bb[3]]);
  return g;
}
/** The shape moved by (dx, dy). */
export function moved(f, dx, dy) { return tag((x, y) => f(x - dx, y - dy), [f.bb[0] + dx, f.bb[1] + dy, f.bb[2] + dx, f.bb[3] + dy]); }
/** The union of shapes. */
export function union(...fs) {
  return tag((x, y) => { let d = Infinity; for (const f of fs) d = Math.min(d, f(x, y)); return d; }, [Math.min(...fs.map((f) => f.bb[0])), Math.min(...fs.map((f) => f.bb[1])), Math.max(...fs.map((f) => f.bb[2])), Math.max(...fs.map((f) => f.bb[3]))]);
}

/**
 * A height field over the rectangle [a0, y0, a1, y1] (a to the viewer's right, y up) in cells of `cell` metres. `base`: a field this one
 * refines (its heights are the surface it stands on; its own parts only add to it).
 */
export class Field {
  constructor(rect_, cell, base = null, sub = false) {
    this.sub = sub; this.r = rect_; this.cell = cell; this.base = base; this.parts = [];
    this.nx = Math.max(1, Math.round((rect_[2] - rect_[0]) / cell)); this.ny = Math.max(1, Math.round((rect_[3] - rect_[1]) / cell));
    this.H = null;
  }
  /**
   * Add a part: shape f (a signed distance), depth d (m), edge e (the width of its rounded shoulder), op 'add' (rises from the surface
   * below), 'max' (rises from the ground, merges with what is there) or 'cut' (sinks into the surface), dome (a swell of the middle,
   * as a fraction of d, over the radius dr), mat (the paint, if any).
   */
  put(f, { d = 0.02, e = Math.min(0.03, d * 1.6), op = 'add', dome = 0, dr = 0.1, mat = null, lift = 0 } = {}) { this.parts.push({ f, d, e, op, dome, dr, mat, lift }); return this; }
  /** A part's rise at a point (0 outside). */
  rise(p, x, y) {
    const bb = p.f.bb;
    if (x < bb[0] - 1e-9 || x > bb[2] + 1e-9 || y < bb[1] - 1e-9 || y > bb[3] + 1e-9) return 0;
    const sd = p.f(x, y);
    if (sd >= 0) return 0;
    const e = Math.max(p.e, 1.7 * this.cell), t = clamp(-sd / e);
    let r = p.d * (0.55 * shoulder(t) + 0.45 * smooth(t));
    if (p.dome) r += p.d * p.dome * smooth(clamp(-sd / p.dr));
    return r;
  }
  /** The surface of the parts alone at a point. */
  parts_(x, y) {
    let h = 0;
    for (const p of this.parts) {
      const r = this.rise(p, x, y);
      if (r <= 0) continue;
      if (p.op === 'add') h += r + p.lift; else if (p.op === 'max') h = Math.max(h, r); else h = Math.max(0, h - r);
    }
    return h;
  }
  /** The height of the whole surface (the base's, then this field's parts) at a point. */
  at(x, y) { return (this.base ? this.base.surface(x, y) : 0) + this.parts_(x, y); }
  /** The mesh's surface at a point (its triangles' interpolation, as drawn). */
  surface(x, y) {
    if (!this.H) this.solve();
    const [a0, b0] = this.r, c = this.cell, u = (x - a0) / c, v = (y - b0) / c;
    if (u < 0 || v < 0 || u > this.nx || v > this.ny) return this.base ? this.base.surface(x, y) : 0;
    const i = Math.min(this.nx - 1, Math.floor(u)), j = Math.min(this.ny - 1, Math.floor(v)), fu = u - i, fv = v - j, W = this.nx + 1;
    const h00 = this.H[j * W + i], h10 = this.H[j * W + i + 1], h11 = this.H[(j + 1) * W + i + 1], h01 = this.H[(j + 1) * W + i];
    // the cell's two triangles: (00, 10, 11) below the diagonal, (00, 11, 01) above it
    return fu >= fv ? h00 + (h10 - h00) * fu + (h11 - h10) * fv : h00 + (h11 - h01) * fu + (h01 - h00) * fv;
  }
  solve() {
    const { nx, ny, cell: c } = this, [a0, b0] = this.r, W = nx + 1;
    // one margin of vertices round the field so that the normals at its border are central differences
    const MW = nx + 3, T = new Float32Array(MW * (ny + 3)), H = new Float32Array(W * (ny + 1));
    for (let j = -1; j <= ny + 1; j++) for (let i = -1; i <= nx + 1; i++) {
      const x = a0 + i * c, y = b0 + j * c, h = this.parts_(x, y), tot = this.base ? this.base.surface(x, y) + h : h;
      T[(j + 1) * MW + i + 1] = tot;
      if (i >= 0 && i <= nx && j >= 0 && j <= ny) H[j * W + i] = h;
    }
    this.T = T; this.MW = MW; this.Hpart = H;
    // `H` is the surface the field itself draws (base + parts for a patch)
    this.H = new Float32Array(W * (ny + 1));
    for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) this.H[j * W + i] = T[(j + 1) * MW + i + 1];
  }
  /** The material of the last painted part over a point (null if none). */
  label(x, y) {
    let m = null;
    for (const p of this.parts) { if (!p.mat) continue; if (this.rise(p, x, y) > 0) m = p.mat; }
    return m;
  }
  /**
   * The triangles by material: Map(mat → { pos, nor }) with the world mapping `to(a, y, z) → [x, y, z]` and `toN(nx, ny, nz)`; the
   * background material `back` for the triangles no painted part covers. A triangle is made where the surface rises (a patch: where its
   * own parts do).
   */
  mesh(to, toN, back, out = new Map()) {
    if (!this.H) this.solve();
    const { nx, ny, cell: c, T, MW, Hpart } = this, [a0, b0] = this.r, W = nx + 1;
    // the mapping's handedness: triangles are wound so that the normal points to the viewer
    const o = to(0, 0, 0), ex = to(1, 0, 0), ey = to(0, 1, 0), ez = to(0, 0, 1);
    const ax = [ex[0] - o[0], ex[1] - o[1], ex[2] - o[2]], ay = [ey[0] - o[0], ey[1] - o[1], ey[2] - o[2]], az = [ez[0] - o[0], ez[1] - o[1], ez[2] - o[2]];
    const det = ax[0] * (ay[1] * az[2] - ay[2] * az[1]) - ax[1] * (ay[0] * az[2] - ay[2] * az[0]) + ax[2] * (ay[0] * az[1] - ay[1] * az[0]), flip = det < 0;
    const V = (i, j) => {
      const k = (j + 1) * MW + i + 1, gx = (T[k + 1] - T[k - 1]) / (2 * c), gy = (T[k + MW] - T[k - MW]) / (2 * c), l = Math.hypot(gx, gy, 1);
      return { p: to(a0 + i * c, b0 + j * c, T[k]), n: toN(-gx / l, -gy / l, 1 / l) };
    };
    const cache = new Map(), vert = (i, j) => { const k = j * W + i; let v = cache.get(k); if (!v) cache.set(k, (v = V(i, j))); return v; };
    const emit = (mat, A, B, C) => {
      let g = out.get(mat); if (!g) out.set(mat, (g = { pos: [], nor: [] }));
      const tri = flip ? [A, C, B] : [A, B, C];
      for (const v of tri) { g.pos.push(v.p[0], v.p[1], v.p[2]); g.nor.push(v.n[0], v.n[1], v.n[2]); }
    };
    // a cell whose paint changes inside it is cut into four, each quarter by its own two triangles at exact heights: clean edges between colours
    const sub = new Map(), e = c / 2;
    const sv = (x, y) => {
      const k = Math.round(x / e) * 100003 + Math.round(y / e); let v = sub.get(k); if (v) return v;
      const gx = (this.at(x + e, y) - this.at(x - e, y)) / (2 * e), gy = (this.at(x, y + e) - this.at(x, y - e)) / (2 * e), l = Math.hypot(gx, gy, 1);
      sub.set(k, (v = { p: to(x, y, this.at(x, y)), n: toN(-gx / l, -gy / l, 1 / l) })); return v;
    };
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const h00 = Hpart[j * W + i], h10 = Hpart[j * W + i + 1], h11 = Hpart[(j + 1) * W + i + 1], h01 = Hpart[(j + 1) * W + i];
      if (Math.max(h00, h10, h11, h01) < 1e-5) continue;
      const x = a0 + i * c, y = b0 + j * c;
      const q = [this.label(x + c * 0.25, y + c * 0.25), this.label(x + c * 0.75, y + c * 0.25), this.label(x + c * 0.25, y + c * 0.75), this.label(x + c * 0.75, y + c * 0.75)];
      if (this.sub && (q[0] !== q[1] || q[0] !== q[2] || q[0] !== q[3])) {
        for (let qj = 0; qj < 2; qj++) for (let qi = 0; qi < 2; qi++) {
          const sx = x + qi * e, sy = y + qj * e;
          const f00 = this.parts_(sx, sy), f10 = this.parts_(sx + e, sy), f11 = this.parts_(sx + e, sy + e), f01 = this.parts_(sx, sy + e);
          if (Math.max(f00, f10, f11, f01) < 1e-5) continue;
          if (Math.max(f00, f10, f11) >= 1e-5) emit(this.label(sx + e * 0.667, sy + e * 0.333) ?? back, sv(sx, sy), sv(sx + e, sy), sv(sx + e, sy + e));
          if (Math.max(f00, f11, f01) >= 1e-5) emit(this.label(sx + e * 0.333, sy + e * 0.667) ?? back, sv(sx, sy), sv(sx + e, sy + e), sv(sx, sy + e));
        }
        continue;
      }
      const t1 = Math.max(h00, h10, h11) >= 1e-5, t2 = Math.max(h00, h11, h01) >= 1e-5, lab = q[0] ?? back;
      if (t1) emit(this.label(x + c * 0.667, y + c * 0.333) ?? back, vert(i, j), vert(i + 1, j), vert(i + 1, j + 1));
      if (t2) emit(this.label(x + c * 0.333, y + c * 0.667) ?? back, vert(i, j), vert(i + 1, j + 1), vert(i, j + 1));
      void lab;
    }
    return out;
  }
}

/** A Map of { pos, nor } turned into geometries added to `bag` by material (the materials of `remap` stand for others where a piece would be tiny). */
export function emitMeshes(map, add, fallback = null) {
  for (const [mat0, g] of map) {
    if (!g.pos.length) continue;
    // a material whose pieces are all under 0.4 m would become a fine-detail mesh of its own (src/core/geom.js DETAIL_SIZE): it joins the fallback's
    let mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < g.pos.length; i += 3) for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], g.pos[i + k]); mx[k] = Math.max(mx[k], g.pos[i + k]); }
    const mat = fallback && Math.max(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]) < 0.45 ? fallback : mat0;
    const geo = new BufferGeometry();
    geo.setAttribute('position', new Float32BufferAttribute(new Float32Array(g.pos), 3));
    geo.setAttribute('normal', new Float32BufferAttribute(new Float32Array(g.nor), 3));
    add(mat, geo);
  }
}
