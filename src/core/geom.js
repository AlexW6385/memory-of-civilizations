// Geometry primitives for architecture. Pure three.js core: runs in the browser and in Node
// (the baker and the plan checker build the same geometry the viewer shows).
//
// Every primitive returns a non-indexed BufferGeometry with `position` and `normal` only.
// Materials are procedural and work from world position, so no UVs are needed.

import { BufferGeometry, BufferAttribute, Float32BufferAttribute, Vector3, Matrix4 } from './three.js';

const _a = new Vector3(), _b = new Vector3(), _c = new Vector3(), _n = new Vector3();

/** Build a geometry from a flat list of triangles (each 9 numbers) with flat normals. */
export function fromTriangles(tris) {
  const pos = new Float32Array(tris);
  const nor = new Float32Array(tris.length);
  for (let i = 0; i < tris.length; i += 9) {
    _a.set(tris[i], tris[i + 1], tris[i + 2]);
    _b.set(tris[i + 3], tris[i + 4], tris[i + 5]);
    _c.set(tris[i + 6], tris[i + 7], tris[i + 8]);
    _n.subVectors(_c, _b).cross(_a.clone().sub(_b)).normalize();
    for (let k = 0; k < 3; k++) { nor[i + 3 * k] = _n.x; nor[i + 3 * k + 1] = _n.y; nor[i + 3 * k + 2] = _n.z; }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  return g;
}

/** For a convex solid given as triangles: flip any triangle whose normal points inward. */
export function orientOutward(tris) {
  let cx = 0, cy = 0, cz = 0;
  const n = tris.length / 3;
  for (let i = 0; i < tris.length; i += 3) { cx += tris[i]; cy += tris[i + 1]; cz += tris[i + 2]; }
  cx /= n; cy /= n; cz /= n;
  for (let i = 0; i < tris.length; i += 9) {
    const ax = tris[i], ay = tris[i + 1], az = tris[i + 2];
    const ux = tris[i + 3] - ax, uy = tris[i + 4] - ay, uz = tris[i + 5] - az;
    const vx = tris[i + 6] - ax, vy = tris[i + 7] - ay, vz = tris[i + 8] - az;
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const mx = (ax + tris[i + 3] + tris[i + 6]) / 3 - cx, my = (ay + tris[i + 4] + tris[i + 7]) / 3 - cy, mz = (az + tris[i + 5] + tris[i + 8]) / 3 - cz;
    if (nx * mx + ny * my + nz * mz < 0) {
      for (let k = 0; k < 3; k++) { const t = tris[i + 3 + k]; tris[i + 3 + k] = tris[i + 6 + k]; tris[i + 6 + k] = t; }
    }
  }
  return tris;
}

/** Push a quad (a b c d, counter-clockwise seen from outside) as two triangles. */
export function quad(out, a, b, c, d) {
  out.push(...a, ...b, ...c, ...a, ...c, ...d);
}

/** Axis-aligned box. */
export function box(x0, y0, z0, x1, y1, z1) {
  return frustum([x0, z0, x1, z1], y0, y1, 0, 0, 0, 0);
}

/**
 * A rectangular block whose four faces may lean inwards (Egyptian batter).
 * rect = [x0, z0, x1, z1] at the base; insets (metres at the top) for the faces at
 * -x, +x, -z, +z. With all insets 0 it is a box.
 */
export function frustum(rect, y0, y1, ixn, ixp, izn, izp, opts = {}) {
  const [x0, z0, x1, z1] = rect;
  const b = [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]];
  const t = [[x0 + ixn, y1, z0 + izn], [x1 - ixp, y1, z0 + izn], [x1 - ixp, y1, z1 - izp], [x0 + ixn, y1, z1 - izp]];
  const out = [];
  if (!opts.noTop) quad(out, t[0], t[3], t[2], t[1]);
  if (!opts.noBottom) quad(out, b[0], b[1], b[2], b[3]);
  if (!opts.noZn) quad(out, b[0], t[0], t[1], b[1]);   // -z face
  if (!opts.noXp) quad(out, b[1], t[1], t[2], b[2]);   // +x face
  if (!opts.noZp) quad(out, b[2], t[2], t[3], b[3]);   // +z face
  if (!opts.noXn) quad(out, b[3], t[3], t[0], b[0]);   // -x face
  return fromTriangles(out);
}

/**
 * Surface of revolution about the y axis. profile = [[r, y], ...] bottom to top.
 * mod(theta, i, r, y) may return a radius multiplier for fluting, petals, palm fronds.
 * Smooth normals around, faceted along the profile (crisp mouldings).
 */
export function lathe(profile, segments = 32, mod = null, cx = 0, cy = 0, cz = 0) {
  const ring = [];
  for (let i = 0; i < profile.length; i++) {
    const [r, y] = profile[i];
    const row = [];
    for (let s = 0; s <= segments; s++) {
      const th = (s / segments) * Math.PI * 2;
      const k = mod ? mod(th, i, r, y) : 1;
      row.push([cx + Math.cos(th) * r * k, cy + y, cz + Math.sin(th) * r * k]);
    }
    ring.push(row);
  }
  const pos = [], nor = [];
  const v = new Vector3(), u = new Vector3(), w = new Vector3();
  // per-vertex normals by averaging the adjacent faces of each row pair
  for (let i = 0; i < ring.length - 1; i++) {
    const A = ring[i], B = ring[i + 1];
    const nrm = [];
    for (let s = 0; s <= segments; s++) {
      const sp = s === 0 ? segments - 1 : s - 1, sn = s === segments ? 1 : s + 1;
      u.set(A[sn][0] - A[sp][0], A[sn][1] - A[sp][1], A[sn][2] - A[sp][2]);
      const up = [(B[s][0] - A[s][0]), (B[s][1] - A[s][1]), (B[s][2] - A[s][2])];
      v.set(up[0], up[1], up[2]);
      w.crossVectors(v, u).normalize();
      if (!Number.isFinite(w.x)) w.set(0, 1, 0);
      nrm.push([w.x, w.y, w.z]);
    }
    for (let s = 0; s < segments; s++) {
      const a = A[s], b = A[s + 1], c = B[s + 1], d = B[s];
      const na = nrm[s], nb = nrm[s + 1];
      pos.push(...a, ...c, ...b, ...a, ...d, ...c);
      nor.push(...na, ...nb, ...nb, ...na, ...na, ...nb);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  return g;
}

/** A flat disc (cap) at height y. */
export function disc(r, y, segments = 32, cx = 0, cz = 0, up = true) {
  const out = [];
  for (let s = 0; s < segments; s++) {
    const a0 = (s / segments) * Math.PI * 2, a1 = ((s + 1) / segments) * Math.PI * 2;
    const p0 = [cx + Math.cos(a0) * r, y, cz + Math.sin(a0) * r];
    const p1 = [cx + Math.cos(a1) * r, y, cz + Math.sin(a1) * r];
    if (up) out.push(cx, y, cz, ...p1, ...p0); else out.push(cx, y, cz, ...p0, ...p1);
  }
  return fromTriangles(out);
}

/**
 * Sweep a 2D profile along a polyline in plan at a given height (mouldings, cornices).
 * profile = [[u, v], ...] where u points outward (to the right of the path direction when
 * the path runs counter-clockwise seen from above, i.e. away from the enclosed area) and v up.
 * path = [[x, z], ...]; closed joins the ends. Corners are mitred.
 */
export function sweep(profile, path, y, closed = true) {
  const n = path.length;
  const frames = [];
  for (let i = 0; i < n; i++) {
    const p = path[i];
    const prev = path[(i - 1 + n) % n], next = path[(i + 1) % n];
    let d0, d1;
    if (!closed && i === 0) { d0 = d1 = norm2(sub2(next, p)); }
    else if (!closed && i === n - 1) { d0 = d1 = norm2(sub2(p, prev)); }
    else { d0 = norm2(sub2(p, prev)); d1 = norm2(sub2(next, p)); }
    // outward normals (to the right of travel): (dz, -dx)
    const o0 = [d0[1], -d0[0]], o1 = [d1[1], -d1[0]];
    let m = norm2([o0[0] + o1[0], o0[1] + o1[1]]);
    const cos = m[0] * o1[0] + m[1] * o1[1];
    const scale = 1 / Math.max(cos, 0.2);
    frames.push({ p, m: [m[0] * scale, m[1] * scale] });
  }
  const rings = frames.map(({ p, m }) => profile.map(([u, v]) => [p[0] + m[0] * u, y + v, p[1] + m[1] * u]));
  const out = [];
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const A = rings[i], B = rings[(i + 1) % n];
    for (let k = 0; k < profile.length - 1; k++) {
      quad(out, A[k], A[k + 1], B[k + 1], B[k]);
    }
  }
  return fromTriangles(out);
}

/** Cylinder between two points (rolls, poles, beams of round section). */
export function rod(a, b, r, segments = 12) {
  const A = new Vector3(...a), B = new Vector3(...b);
  const len = A.distanceTo(B);
  const g = lathe([[r, 0], [r, len]], segments);
  const dir = B.clone().sub(A).normalize();
  const m = new Matrix4();
  const up = new Vector3(0, 1, 0);
  const axis = up.clone().cross(dir);
  const ang = Math.acos(Math.min(1, Math.max(-1, up.dot(dir))));
  if (axis.lengthSq() < 1e-9) { if (dir.y < 0) m.makeRotationX(Math.PI); }
  else m.makeRotationAxis(axis.normalize(), ang);
  m.setPosition(A);
  g.applyMatrix4(m);
  return g;
}

/** Translate / rotate-about-y helper (returns the same geometry). */
export function place(g, x = 0, y = 0, z = 0, yaw = 0, s = 1) {
  const m = new Matrix4().makeRotationY(yaw);
  if (s !== 1) m.multiply(new Matrix4().makeScale(s, s, s));
  m.setPosition(x, y, z);
  g.applyMatrix4(m);
  return g;
}

function sub2(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
function norm2(a) { const l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; }

/** Collects geometries by material key and merges them. */
/** The stand-off rank of a material (0…15 from its name; 16 and up only by override); DEPTH_STEP metres per rank. */
export const DEPTH_STEP = 0.0003;
// overrides where two materials laid in one plane would otherwise share a rank (tools/surface-check.mjs finds them)
const RANK_OVERRIDE = { paint_minoan_red: 20, plaster_white: 16, brick_paving: 6, stucco_ochre: 14, stucco_warm: 11, pavonazzetto: 5, vault_stars: 1, paint_dancheong: 8, stucco_cream: 15, plaster_castle: 17, raupo: 18, brick: 19 };
export function depthRank(mat) {
  if (mat in RANK_OVERRIDE) return RANK_OVERRIDE[mat];
  let h = 2166136261;
  for (let i = 0; i < mat.length; i++) h = Math.imul(h ^ mat.charCodeAt(i), 16777619);
  return (h >>> 0) % 16;
}

/**
 * Repeated pieces (DESIGN §8: instancing): a piece added to a bag is matched against the others of
 * its material by shape. Two pieces are the same prototype when one is the other moved
 * (translation), or — for pieces whose faces all face along the axes, as every box does — moved
 * and stretched along the axes. A prototype repeated often enough in one plan is drawn as one
 * instanced mesh (its shape once, indexed, plus a matrix per copy) instead of as copies merged
 * into the material's mesh. The picture is the same; the memory is not.
 */
export const INSTANCING = { minCount: 12, minSaved: 2400, maxVerts: 40000 };
const AXIS_EPS = 1e-4;

/** A piece's shape key (null for pieces too large or too small to be worth it) and its placement. */
function shapeOf(mat, g, moveOnly = false) {
  const P = g.attributes.position.array, N = g.attributes.normal.array, n = P.length / 3;
  if (n < 6 || n > INSTANCING.maxVerts) return null;
  let x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity;
  for (let i = 0; i < P.length; i += 3) {
    const x = P[i], y = P[i + 1], z = P[i + 2];
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; if (z < z0) z0 = z; if (z > z1) z1 = z;
  }
  let axis = !moveOnly;
  if (axis) for (let i = 0; i < N.length; i++) { const v = Math.abs(N[i]); if (v > AXIS_EPS && Math.abs(v - 1) > AXIS_EPS) { axis = false; break; } }
  const sx = x1 - x0, sy = y1 - y0, sz = z1 - z0;
  if (!(sx + sy + sz > 0) || !Number.isFinite(sx + sy + sz)) return null;
  // stretched pieces are normalised to their box; moved ones keep their size (to 0.1 mm)
  const ix = axis && sx > 1e-6 ? 1 / sx : 1, iy = axis && sy > 1e-6 ? 1 / sy : 1, iz = axis && sz > 1e-6 ? 1 / sz : 1;
  // a coarse key (vertex count, size, centroid and spread to the millimetre): pieces that share it
  // are then compared vertex by vertex (sameShape), so float rounding cannot split or merge them
  let cx = 0, cy = 0, cz = 0, qx = 0, qy = 0, qz = 0, nx = 0, ny = 0, nz = 0;
  for (let i = 0; i < P.length; i += 3) {
    const a = (P[i] - x0) * ix, b = (P[i + 1] - y0) * iy, c = (P[i + 2] - z0) * iz;
    cx += a; cy += b; cz += c; qx += a * a; qy += b * b; qz += c * c;
    nx += N[i] * (i % 7); ny += N[i + 1] * (i % 5); nz += N[i + 2] * (i % 3);
  }
  const r = (v) => Math.round((v / n) * 1000);
  const size = axis ? '' : `${Math.round(sx * 1000)},${Math.round(sy * 1000)},${Math.round(sz * 1000)}`;
  return {
    key: `${mat}|${n}|${axis ? 's' : 't'}|${size}|${r(cx)},${r(cy)},${r(cz)},${r(qx)},${r(qy)},${r(qz)}|${r(nx * 10)},${r(ny * 10)},${r(nz * 10)}`,
    axis, t: [x0, y0, z0], s: axis ? [ix === 1 && !(sx > 1e-6) ? 1 : sx, iy === 1 && !(sy > 1e-6) ? 1 : sy, iz === 1 && !(sz > 1e-6) ? 1 : sz] : [1, 1, 1],
    inv: [ix, iy, iz],
  };
}

/** Are two pieces of one coarse key the same shape (to a tenth of a millimetre, or of their box)? */
function sameShape(ga, a, gb, b) {
  const PA = ga.attributes.position.array, PB = gb.attributes.position.array;
  const NA = ga.attributes.normal.array, NB = gb.attributes.normal.array;
  if (PA.length !== PB.length) return false;
  const tol = 2e-4;
  for (let i = 0; i < PA.length; i += 3) {
    for (let k = 0; k < 3; k++) {
      if (Math.abs((PA[i + k] - a.t[k]) * a.inv[k] - (PB[i + k] - b.t[k]) * b.inv[k]) > tol) return false;
      if (Math.abs(NA[i + k] - NB[i + k]) > 2e-3) return false;
    }
  }
  return true;
}

/** The prototype of a piece: its shape at the origin (normalised if stretched), indexed. */
function prototypeOf(g, sh, d) {
  const P = g.attributes.position.array, N = g.attributes.normal.array, n = P.length / 3;
  const [x0, y0, z0] = sh.t, [ix, iy, iz] = sh.inv;
  const pos = [], nor = [], index = new (n > 65535 ? Uint32Array : Uint16Array)(n), seen = new Map();
  for (let i = 0; i < n; i++) {
    let x = (P[3 * i] - x0) * ix, y = (P[3 * i + 1] - y0) * iy, z = (P[3 * i + 2] - z0) * iz;
    // moved pieces take the material's stand-off here; stretched ones in their matrices
    if (!sh.axis && d) { x += N[3 * i] * d; y += N[3 * i + 1] * d; z += N[3 * i + 2] * d; }
    const k = `${Math.round(x * 1e5)},${Math.round(y * 1e5)},${Math.round(z * 1e5)},${Math.round(N[3 * i] * 1e3)},${Math.round(N[3 * i + 1] * 1e3)},${Math.round(N[3 * i + 2] * 1e3)}`;
    let j = seen.get(k);
    if (j === undefined) { j = pos.length / 3; seen.set(k, j); pos.push(x, y, z); nor.push(N[3 * i], N[3 * i + 1], N[3 * i + 2]); }
    index[i] = j;
  }
  const m = new BufferGeometry();
  m.setAttribute('position', new Float32BufferAttribute(pos, 3));
  m.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  m.setIndex(new BufferAttribute(index, 1));
  m.computeBoundingBox(); m.computeBoundingSphere();
  // the stand-off of a stretched piece: its box grown by d where it has depth, moved by d toward
  // its faces where it is flat
  let flat = [0, 0, 0];
  if (sh.axis && d) for (let a = 0; a < 3; a++) { if (sh.s[a] === 1 && !(m.boundingBox.max.getComponent(a) > 0)) { let sum = 0; for (let i = a; i < N.length; i += 3) sum += N[i]; flat[a] = Math.sign(sum); } }
  return { geometry: m, flat };
}

/** Pieces smaller than this (m, their box's largest side) are fine detail, drawn only near. */
export const DETAIL_SIZE = 0.4;
function pieceSize(g) {
  const P = g.attributes.position.array;
  let x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity;
  for (let i = 0; i < P.length; i += 3) {
    const x = P[i], y = P[i + 1], z = P[i + 2];
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; if (z < z0) z0 = z; if (z > z1) z1 = z;
  }
  return Math.max(x1 - x0, y1 - y0, z1 - z0);
}
/** Is an instanced prototype, at the scale of its first copy, fine detail? */
function isSmall(geometry, M) {
  const b = geometry.boundingBox, s = Math.max(Math.hypot(M[0], M[1], M[2]), Math.hypot(M[4], M[5], M[6]), Math.hypot(M[8], M[9], M[10]));
  return Math.max(b.max.x - b.min.x, b.max.y - b.min.y, b.max.z - b.min.z) * s < DETAIL_SIZE;
}
function mergeInto(mat, list, d, detail) {
  let count = 0;
  for (const g of list) count += g.attributes.position.count;
  const pos = new Float32Array(count * 3), nor = new Float32Array(count * 3);
  let o = 0;
  for (let i = 0; i < list.length; i++) { const g = list[i]; pos.set(g.attributes.position.array, o); nor.set(g.attributes.normal.array, o); o += g.attributes.position.array.length; list[i] = null; }
  if (d) for (let k = 0; k < pos.length; k++) pos[k] += nor[k] * d;
  const m = new BufferGeometry();
  m.setAttribute('position', new Float32BufferAttribute(pos, 3));
  m.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  m.computeBoundingBox(); m.computeBoundingSphere();
  return [{ mat, geometry: m, detail }];
}

export class GeoBag {
  /** instancing: find repeated pieces (the viewer); without it every piece is merged (the tools). */
  constructor({ instancing = false, always = false, detail = false } = {}) { this.parts = new Map(); this.instancing = instancing; this.always = always; this.detail = detail; this.explicit = new Map(); }
  /**
   * A piece built at its object's origin and placed by a matrix (rotation, uniform scale,
   * translation): the objects of use and the figures (src/objects/index.js). Pieces of the same
   * shape share one prototype whatever their turn; `color` (linear RGB, relative to the material's
   * own) lets one material stand for a family (cloth, skin, hide) and `real` names the material the
   * piece has when it is merged instead. `reach` (m): how far off the piece is still drawn.
   * Without instancing (the tools), or too few of a shape in a plan, the pieces are merged as usual.
   */
  addInstance(mat, g, matrix, { color = null, real = mat, reach = 230 } = {}) {
    if (!g) return;
    if (g.index) g = g.toNonIndexed();
    const sh = shapeOf(mat, g, true);
    if (!sh) { this.add(real, g.applyMatrix4(matrix)); return; }
    let list = this.explicit.get(sh.key);
    if (!list) this.explicit.set(sh.key, (list = []));
    let e = list.find((x) => sameShape(x.g, x.sh, g, sh));
    if (!e) { e = { mat, g, sh, key: `${sh.key}#${list.length}`, items: [] }; list.push(e); }
    // the copy's matrix takes the prototype (at its box's corner) to the place
    const M = new Matrix4().makeTranslation(sh.t[0], sh.t[1], sh.t[2]).premultiply(matrix);
    e.items.push({ m: M.elements.slice(), color, real, reach });
  }
  add(mat, g) {
    if (!g) return;
    if (!this.parts.has(mat)) this.parts.set(mat, []);
    this.parts.get(mat).push(g.index ? g.toNonIndexed() : g);
  }
  /**
   * Merge into one geometry per material; with instancing, also the repeated prototypes:
   * `this.instanced` = [{ mat, geometry (prototype, indexed), matrices (16 per copy, column-major) }].
   */
  merged() {
    const res = [];
    this.instanced = [];
    // placed pieces: instanced, or merged into their real materials
    for (const list of this.explicit.values()) {
      for (const e of list) {
        const n = e.g.attributes.position.count;
        const worth = this.instancing && (this.always || (e.items.length >= INSTANCING.minCount && (e.items.length - 1) * n >= INSTANCING.minSaved));
        if (!worth) {
          const local = prototypeOf(e.g, e.sh, 0).geometry.toNonIndexed();
          const M = new Matrix4();
          for (const it of e.items) this.add(it.real, local.clone().applyMatrix4(M.fromArray(it.m)));
          continue;
        }
        const d = depthRank(e.mat) * DEPTH_STEP;
        const { geometry } = prototypeOf(e.g, e.sh, d);
        const k = e.items.length, matrices = new Float32Array(k * 16), reach = new Float32Array(k);
        const colors = e.items.some((it) => it.color) ? new Float32Array(k * 3).fill(1) : null;
        const reals = e.items.map((it) => it.real);
        e.items.forEach((it, i) => { matrices.set(it.m, i * 16); reach[i] = it.reach; if (it.color && colors) colors.set(it.color, i * 3); });
        this.instanced.push({ mat: e.mat, key: e.key, geometry, matrices, colors, reach, reals, detail: this.detail && isSmall(geometry, matrices) });
      }
    }
    this.explicit.clear();
    for (const [mat, all] of this.parts) {
      const d = depthRank(mat) * DEPTH_STEP;
      let list = all;
      if (this.instancing && all.length >= INSTANCING.minCount) {
        // pieces by coarse key, then split into groups of the same shape
        const byKey = new Map(), shapes = new Array(all.length), groups = [];
        for (let i = 0; i < all.length; i++) {
          const sh = shapeOf(mat, all[i]);
          shapes[i] = sh;
          if (!sh) continue;
          let list = byKey.get(sh.key);
          if (!list) byKey.set(sh.key, (list = []));
          let gr = list.find((g) => sameShape(all[g[0]], shapes[g[0]], all[i], sh));
          if (!gr) { gr = []; list.push(gr); groups.push(gr); }
          gr.push(i);
        }
        const take = new Set();
        for (const idx of groups) {
          const n = all[idx[0]].attributes.position.count;
          if (idx.length < INSTANCING.minCount || (idx.length - 1) * n < INSTANCING.minSaved) continue;
          const first = shapes[idx[0]];
          const { geometry, flat } = prototypeOf(all[idx[0]], first, d);
          const M = new Float32Array(idx.length * 16);
          idx.forEach((i, k) => {
            const sh = shapes[i], o = k * 16;
            let [tx, ty, tz] = sh.t, [sx, sy, sz] = sh.s;
            if (sh.axis && d) {
              // grown where it has depth, moved toward its faces where it is flat
              const T = [tx, ty, tz], S = [sx, sy, sz];
              for (let a = 0; a < 3; a++) {
                if (flat[a]) T[a] += flat[a] * d;
                else if (geometry.boundingBox.max.getComponent(a) > 0) { T[a] -= d; S[a] += 2 * d; }
              }
              [tx, ty, tz] = T; [sx, sy, sz] = S;
            }
            M[o] = sx; M[o + 5] = sy; M[o + 10] = sz; M[o + 12] = tx; M[o + 13] = ty; M[o + 14] = tz; M[o + 15] = 1;
          });
          this.instanced.push({ mat, geometry, matrices: M, detail: this.detail && isSmall(geometry, M) });
          for (const i of idx) take.add(i);
        }
        if (take.size) list = all.filter((_, i) => !take.has(i));
      }
      if (!list.length) continue;
      // with `detail` (the viewer), the small pieces of a material (under DETAIL_SIZE) are a mesh of
      // their own, which the world draws only near (src/engine/world.js)
      if (this.detail) {
        const small = [], big = [];
        for (const g of list) (pieceSize(g) < DETAIL_SIZE ? small : big).push(g);
        if (small.length && big.length) { res.push(...mergeInto(mat, small, d, true)); list = big; }
        else if (small.length) { res.push(...mergeInto(mat, small, d, true)); continue; }
      }
      let count = 0;
      for (const g of list) count += g.attributes.position.count;
      const pos = new Float32Array(count * 3), nor = new Float32Array(count * 3);
      let o = 0;
      // copy and let go of each piece as it is copied, so the peak is one merged copy, not two
      for (let i = 0; i < list.length; i++) {
        const g = list[i];
        pos.set(g.attributes.position.array, o);
        nor.set(g.attributes.normal.array, o);
        o += g.attributes.position.array.length;
        list[i] = null;
      }
      // each material stands off its faces by its own fraction of a millimetre or so, so that two
      // materials laid in the same plane (a lattice in its frame, paving on a terrace) never fight
      // in the depth buffer
      if (d) for (let k = 0; k < pos.length; k++) pos[k] += nor[k] * d;
      const m = new BufferGeometry();
      m.setAttribute('position', new Float32BufferAttribute(pos, 3));
      m.setAttribute('normal', new Float32BufferAttribute(nor, 3));
      m.computeBoundingBox(); m.computeBoundingSphere();
      res.push({ mat, geometry: m });
    }
    this.parts.clear();
    return res;
  }
}
