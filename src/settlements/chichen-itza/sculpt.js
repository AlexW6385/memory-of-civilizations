// Sculpture of Chichén Itzá (docs/settlements/chichen-itza.md §18): the pieces a visitor walks up to, built as modelled volumes rather than
// stacked plates. A carving is a `Parts` — one smooth `Sculpt` per material (src/styles/nabataean/sculpt.js) plus loose geometries (the human
// bodies of src/buildings/parthenon/bodies.js) — and comes out as ONE geometry per material, placed by a matrix. Everything is a function of its
// inputs and of `hash` of a piece's own place: the same plan builds the same geometry every time (the light bake depends on it).

import { Sculpt, blob, blobDir, tube, rodT, torus, ellipsoid, hash3 } from '../../styles/nabataean/sculpt.js';
import { bodyOf, skeleton, headOf, reliefSqueeze } from '../../buildings/parthenon/bodies.js';
import { BufferGeometry, Float32BufferAttribute, Matrix4 } from '../../core/three.js';

export { Sculpt, blob, blobDir, tube, rodT, torus, ellipsoid, hash3, bodyOf, skeleton, headOf, reliefSqueeze };

export const ST = 'limestone_maya', RD = 'stucco_red', BL = 'maya_blue', GR = 'stucco_leaf', OC = 'paint_ochre', BK = 'paint_minoan_black', WH = 'plaster_white', JD = 'inlay_jade';

const nonIndexed = (g) => (g.index ? g.toNonIndexed() : g);

/** The pieces of one carving by material. */
export class Parts {
  constructor() { this.s = new Map(); this.g = new Map(); }
  /** The sculpt of a material (identity frame), made when first asked. */
  sc(mat) { let s = this.s.get(mat); if (!s) this.s.set(mat, (s = new Sculpt())); return s; }
  /** A loose geometry of a material (a body from bodyOf, a lathe). */
  geo(mat, g) { if (!g) return; let l = this.g.get(mat); if (!l) this.g.set(mat, (l = [])); l.push(g); }
  /** A list of geometries (bodyOf's stone or metal). */
  geos(mat, list, m = null) { for (const g of list ?? []) this.geo(mat, m ? g.clone().applyMatrix4(m) : g); }
  get tris() { let n = 0; for (const [, s] of this.s) n += s.triangles; for (const l of this.g.values()) for (const g of l) n += (g.index ? g.index.count : g.attributes.position.count) / 3; return n; }
  /** One geometry per material: every sculpt and every loose piece, joined (non-indexed, positions and normals). */
  merged() {
    const out = new Map(), mats = new Set([...this.s.keys(), ...this.g.keys()]);
    for (const mat of mats) {
      const P = [], N = [], push = (g) => { const q = nonIndexed(g), p = q.attributes.position.array, n = q.attributes.normal.array; for (let i = 0; i < p.length; i++) { P.push(p[i]); N.push(n[i]); } };
      const s = this.s.get(mat); if (s && s.pos.length) push(s.geometry());
      for (const g of this.g.get(mat) ?? []) push(g);
      if (!P.length) continue;
      const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(P, 3)); g.setAttribute('normal', new Float32BufferAttribute(N, 3));
      out.set(mat, g);
    }
    return out;
  }
  /** Set into the bag: each material's geometry moved by `m` (a Matrix4 without a mirror) — one piece per material; `post` (a relief squeeze) acts first. */
  emit(bag, m, post = null) {
    for (const [mat, g] of this.merged()) { if (post) post(g); bag.add(mat, g.applyMatrix4(m)); }
  }
}

/** A matrix: translate (x, y, z) · turn `yaw` about y · scale s. */
export function at(x, y, z, yaw = 0, s = 1) {
  const m = new Matrix4().makeRotationY(yaw);
  if (s !== 1) m.multiply(new Matrix4().makeScale(s, s, s));
  return m.setPosition(x, y, z);
}

/** A frame on a surface: its x along U, y along V, z along N (unit vectors, U × V = N), the origin at O: the matrix that lays a carving there. */
export function frameM(O, U, V, N) {
  const m = new Matrix4();
  m.set(U[0], V[0], N[0], O[0], U[1], V[1], N[1], O[1], U[2], V[2], N[2], O[2], 0, 0, 0, 1);
  return m;
}

/** The merged geometry of a list of geometries (non-indexed). */
export function mergeGeos(list) {
  const P = [], N = [];
  for (const g0 of list) { const g = nonIndexed(g0), p = g.attributes.position.array, n = g.attributes.normal.array; for (let i = 0; i < p.length; i++) { P.push(p[i]); N.push(n[i]); } }
  const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(P, 3)); g.setAttribute('normal', new Float32BufferAttribute(N, 3));
  return g;
}

/**
 * A human figure of bodyOf set into `parts`: its stone and its metal (as ST / metal material), turned by yaw about y, scaled by h, at (x, y, z), its depth squeezed
 * by `k` with what lies behind z = cut dropped when `k` is given (low relief).
 */
export function putFigure(parts, fig, h, x, y, z, yaw = 0, { k = 0, cut = 0, stone = ST, metal = BL, pre = null } = {}) {
  const m = new Matrix4().makeRotationY(yaw).multiply(new Matrix4().makeScale(h, h, h)).setPosition(x, y, z), sq = k ? reliefSqueeze(k, cut) : null;
  for (const [key, mat] of [['stone', stone], ['metal', metal]]) {
    const list = fig[key]; if (!list?.length) continue;
    const g = mergeGeos(list); if (pre) pre(g);
    g.applyMatrix4(new Matrix4().makeRotationY(yaw).multiply(new Matrix4().makeScale(h, h, h)));
    if (sq) sq(g);
    g.translate(x, y, z);
    parts.geo(mat, g);
  }
  void m;
}

/** A square-sectioned rod from a to b, half-width w (a convex solid into a sculpt): the cheap stand-in for a limb. */
export function segBox(S, a, b, w) {
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], l = Math.hypot(...d) || 1, t = d.map((v) => v / l);
  let up = Math.abs(t[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
  const cr = (p, q) => [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]];
  let u = cr(t, up); const ul = Math.hypot(...u); u = u.map((v) => v / ul * w); const v2 = cr(t, u).map((v) => v / w * w);
  const C = (p, i, j) => [p[0] + u[0] * i + v2[0] * j, p[1] + u[1] * i + v2[1] * j, p[2] + u[2] * i + v2[2] * j];
  const c = [C(a, -1, -1), C(a, 1, -1), C(a, 1, 1), C(a, -1, 1), C(b, -1, -1), C(b, 1, -1), C(b, 1, 1), C(b, -1, 1)], tr = [], q = (i, j, k, m) => tr.push(...c[i], ...c[j], ...c[k], ...c[i], ...c[k], ...c[m]);
  q(0, 1, 2, 3); q(4, 5, 6, 7); q(0, 1, 5, 4); q(1, 2, 6, 5); q(2, 3, 7, 6); q(3, 0, 4, 7);
  S.solid(tr);
}
