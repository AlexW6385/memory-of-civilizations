// Spatial cells and distance detail for a settlement's merged meshes (DESIGN §8: visible triangles
// ≤ 3 M). Pure arrays, no three.js: the viewer (src/engine/merge.js, life-instances.js) and
// tools/draw-count.mjs use the same rules.
//
// Merging a settlement's plans per material (merge.js) made one mesh of, say, all its limestone:
// a mesh as wide as the settlement, never outside the view, so every triangle of it was drawn in
// the scene pass and in each shadow cascade wherever one looked. The big merged meshes (from
// SPLIT_TRIS triangles) are cut into square cells of the ground (CELL m), each its own mesh culled
// by the frustum; the small ones stay whole (a cell is a draw, and they would gain little).
//
// Repeated pieces are drawn by distance (lodKind): rods and bars thinner than THIN only within
// THIN_FAR; fine pieces (balustrade posts and panels, capitals, bracket sets, carvings: an
// instanced prototype of FINE_TRIS or more, at most FINE_SIZE across) in full within LOD_NEAR and
// coarse beyond, their shadows cast by a coarser version still. The coarse versions are made by
// vertex clustering (coarse()), the coarsest grid whose outline, seen along each axis, keeps that
// of the full piece (MIN_IOU); a piece without one stays in full. The street life does the same
// beyond LIFE_FULL.
//
// (Measured with tools/draw-count.mjs --views; a frame at Beijing's arrival went from 14.7 M
// triangles to 8.5 M, the Sainte-Chapelle's upper chapel from 4.6 M to 3.5 M.)

/** Side of a cell (m). */
export const CELL = 128;
/** A merged mesh is cut into cells from this many triangles. */
export const SPLIT_TRIS = 80000;
/** A prototype is fine detail, with a coarse version, from this many triangles and up to this size (m). */
export const FINE_TRIS = 40, FINE_SIZE = 3.2;
/** Fine pieces farther than this (m) are drawn coarse; their coarse shadows are cast within FINE_SHADOW. */
export const LOD_NEAR = 60, FINE_SHADOW = 130;
/** The street life's copies (src/engine/life-instances.js) farther than this (m) are drawn coarse. */
export const LIFE_FULL = 50;
/** Rods and bars thinner than this (m, their second side) are drawn within THIN_FAR (m). */
export const THIN = 0.1, THIN_FAR = 100;
/** The coarse version is kept only if it has at most this fraction of the full one's triangles. */
const WORTH = 0.6;

/** The cell of a point (x, z): an integer key. */
export const cellKey = (x, z, size = CELL) => ((Math.floor(x / size) + 512) << 10) | (Math.floor(z / size) + 512);

/** Distance (m) from p to a box [x0, y0, z0, x1, y1, z1]. */
export function boxDistance(b, x, y, z) {
  const dx = Math.max(b[0] - x, 0, x - b[3]), dy = Math.max(b[1] - y, 0, y - b[4]), dz = Math.max(b[2] - z, 0, z - b[5]);
  return Math.hypot(dx, dy, dz);
}

/**
 * The triangles of an indexed geometry (pos: 3 a vertex, index) by cell of their centroids:
 * Map key → { tri: Uint32Array of triangle numbers }. A geometry in one cell gives one entry.
 */
export function trianglesByCell(pos, index) {
  const nt = index.length / 3, key = new Int32Array(nt), count = new Map();
  for (let t = 0; t < nt; t++) {
    const a = index[3 * t] * 3, b = index[3 * t + 1] * 3, c = index[3 * t + 2] * 3;
    const k = cellKey((pos[a] + pos[b] + pos[c]) / 3, (pos[a + 2] + pos[b + 2] + pos[c + 2]) / 3);
    key[t] = k; count.set(k, (count.get(k) || 0) + 1);
  }
  const out = new Map();
  for (const [k, n] of count) out.set(k, { tri: new Uint32Array(n), n: 0 });
  for (let t = 0; t < nt; t++) { const e = out.get(key[t]); e.tri[e.n++] = t; }
  return out;
}

/**
 * A sub-geometry of an indexed one: the triangles listed, their vertices renumbered. attrs: [{ array,
 * size }]; returns { arrays (same types), index (Uint16 or Uint32), box }.
 */
export function subGeometry(attrs, index, tri, posAttr = 0) {
  const nv = attrs[posAttr].array.length / attrs[posAttr].size;
  const remap = new Int32Array(nv).fill(-1);
  let kept = 0;
  for (let i = 0; i < tri.length; i++) for (let k = 0; k < 3; k++) { const v = index[3 * tri[i] + k]; if (remap[v] < 0) remap[v] = kept++; }
  const arrays = attrs.map(({ array, size }) => new array.constructor(kept * size));
  for (let v = 0; v < nv; v++) {
    const j = remap[v];
    if (j < 0) continue;
    for (let a = 0; a < attrs.length; a++) { const s = attrs[a].size, A = attrs[a].array, B = arrays[a]; for (let c = 0; c < s; c++) B[j * s + c] = A[v * s + c]; }
  }
  const idx = new (kept > 65535 ? Uint32Array : Uint16Array)(tri.length * 3);
  for (let i = 0; i < tri.length; i++) for (let k = 0; k < 3; k++) idx[3 * i + k] = remap[index[3 * tri[i] + k]];
  const P = arrays[posAttr], box = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i += 3) for (let c = 0; c < 3; c++) { if (P[i + c] < box[c]) box[c] = P[i + c]; if (P[i + c] > box[c + 3]) box[c + 3] = P[i + c]; }
  return { arrays, index: idx, box };
}

/** A prototype's extents (its box's, ext) at the scale of a copy's matrix M, largest first. */
export function extents(ext, M, o = 0) {
  const sx = Math.hypot(M[o], M[o + 1], M[o + 2]), sy = Math.hypot(M[o + 4], M[o + 5], M[o + 6]), sz = Math.hypot(M[o + 8], M[o + 9], M[o + 10]);
  return [ext[0] * sx, ext[1] * sy, ext[2] * sz].sort((a, b) => b - a);
}

/**
 * How an instanced shape is drawn by distance: 'thin' (rods and bars, under THIN m in section:
 * drawn within THIN_FAR, shadowed in the first cascade only), 'fine' (a small piece of FINE_TRIS
 * or more, with a coarse version beyond LOD_NEAR), or null (as it is).
 */
export function lodKind(tris, ext, M) {
  const e = extents(ext, M);
  if (e[1] < THIN) return 'thin';
  if (tris >= FINE_TRIS && e[0] <= FINE_SIZE) return 'fine';
  return null;
}

/**
 * A coarse version of a small piece (an indexed prototype; pos Float32 3 a vertex, nor any typed
 * array 3 a vertex, normalized or not), or null where none is both cheaper and faithful. Its
 * vertices are clustered on grids of `divs` cells along its longest side (coarsest first: see
 * cluster()); the first whose outline seen along each axis covers the full piece's within
 * MIN_IOU (intersection over union, on a SIL × SIL raster) and that saves enough is taken.
 */
export const MIN_IOU = 0.9, SIL = 48;
/** Shadows bear a coarser version (their edges are soft, a few texels wide): its outline within this. */
export const SHADOW_IOU = 0.8;
export function coarse(pos, nor, index, minIoU = MIN_IOU, divs = [4, 5, 6, 8, 10, 12, 16, 20, 24]) {
  const box = boundsOf(pos), full = silhouettes(pos, index, box);
  for (const div of divs) {
    const c = cluster(pos, nor, index, div, box);
    if (!c) continue;
    if (c.index.length > index.length * WORTH) return null;          // finer grids save still less
    const sil = silhouettes(c.pos, c.index, box);
    if (sil.every((m, a) => iou(m, full[a]) >= minIoU)) return c;
  }
  return null;
}

function boundsOf(pos) {
  const b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let i = 0; i < pos.length; i += 3) for (let k = 0; k < 3; k++) { const v = pos[i + k]; if (v < b[k]) b[k] = v; if (v > b[k + 3]) b[k + 3] = v; }
  return b;
}

/** The piece's outline seen along each axis: three SIL × SIL masks over its box (both faces drawn). */
function silhouettes(pos, index, box) {
  const out = [];
  for (let a = 0; a < 3; a++) {
    const u = (a + 1) % 3, v = (a + 2) % 3, u0 = box[u], v0 = box[v], su = (box[u + 3] - u0) || 1, sv = (box[v + 3] - v0) || 1;
    const m = new Uint8Array(SIL * SIL);
    for (let t = 0; t < index.length; t += 3) {
      const P = [index[t], index[t + 1], index[t + 2]].map((i) => [((pos[i * 3 + u] - u0) / su) * SIL, ((pos[i * 3 + v] - v0) / sv) * SIL]);
      const [[ax, ay], [bx, by], [cx, cy]] = P, d = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
      // a triangle seen edge-on: its edges (thin parts seen along their face)
      if (Math.abs(d) < 1e-9) { for (const [p, q] of [[P[0], P[1]], [P[1], P[2]]]) { const n = Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1])) + 1; for (let k = 0; k <= n; k++) { const x = Math.min(SIL - 1, Math.floor(p[0] + (q[0] - p[0]) * k / n)), y = Math.min(SIL - 1, Math.floor(p[1] + (q[1] - p[1]) * k / n)); m[y * SIL + x] = 1; } } continue; }
      const x0 = Math.max(0, Math.floor(Math.min(ax, bx, cx))), x1 = Math.min(SIL - 1, Math.floor(Math.max(ax, bx, cx)));
      const y0 = Math.max(0, Math.floor(Math.min(ay, by, cy))), y1 = Math.min(SIL - 1, Math.floor(Math.max(ay, by, cy)));
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const px = x + 0.5, py = y + 0.5;
        const w0 = ((bx - px) * (cy - py) - (by - py) * (cx - px)) / d, w1 = ((cx - px) * (ay - py) - (cy - py) * (ax - px)) / d;
        if (w0 >= -1e-6 && w1 >= -1e-6 && 1 - w0 - w1 >= -1e-6) m[y * SIL + x] = 1;
      }
      // (and its corners: a sliver narrower than a cell still marks where it passes)
      for (const [px, py] of P) m[Math.min(SIL - 1, Math.floor(py)) * SIL + Math.min(SIL - 1, Math.floor(px))] = 1;
    }
    out.push(m);
  }
  return out;
}
function iou(a, b) {
  let i = 0, u = 0;
  for (let k = 0; k < a.length; k++) { i += a[k] & b[k]; u += a[k] | b[k]; }
  return u ? i / u : 1;
}

/**
 * Vertex clustering (Lindstrom's): the piece's vertices on a grid of about `div` cells along its
 * longest side (at least two along each); each cell's vertices become one point, placed where it
 * best keeps the planes of the faces round it (their error quadric; the cell's mean where that is
 * ill-posed or falls outside the cell), a vertex kept per cell and facing (six directions, so that
 * the two faces of a thin panel and the sides of a post keep their own shading); the triangles
 * that collapse or turn over are dropped. Returns { pos, nor (the input's type), index }.
 */
function cluster(pos, nor, index, div, box) {
  const nv = pos.length / 3, nt = index.length / 3;
  const [x0, y0, z0, x1, y1, z1] = box, ex = x1 - x0, ey = y1 - y0, ez = z1 - z0, s = Math.max(ex, ey, ez) / div || 1;
  const nx = Math.max(2, Math.ceil(ex / s)), ny = Math.max(2, Math.ceil(ey / s)), nz = Math.max(2, Math.ceil(ez / s));
  const q = (v, o, e, n) => Math.min(n - 1, Math.max(0, Math.floor(((v - o) / (e || 1)) * n)));
  const sc = nor.constructor === Float32Array ? 1 : nor instanceof Int16Array ? 1 / 32767 : nor instanceof Int8Array ? 1 / 127 : 1;
  const cell = new Int32Array(nv), face = new Uint8Array(nv), cells = new Map(), cid = [];
  for (let v = 0; v < nv; v++) {
    const ix = q(pos[3 * v], x0, ex, nx), iy = q(pos[3 * v + 1], y0, ey, ny), iz = q(pos[3 * v + 2], z0, ez, nz), c = ix + nx * (iy + ny * iz);
    let k = cells.get(c);
    if (k === undefined) { cells.set(c, (k = cells.size)); cid.push(ix, iy, iz); }
    cell[v] = k;
    const a = nor[3 * v], b = nor[3 * v + 1], d = nor[3 * v + 2], A = Math.abs(a), B = Math.abs(b), D = Math.abs(d);
    face[v] = A >= B && A >= D ? (a >= 0 ? 0 : 1) : B >= D ? (b >= 0 ? 2 : 3) : (d >= 0 ? 4 : 5);
  }
  const nc = cells.size, mean = new Float64Array(nc * 4), Q = new Float64Array(nc * 10);
  for (let v = 0; v < nv; v++) { const k = cell[v] * 4; mean[k] += pos[3 * v]; mean[k + 1] += pos[3 * v + 1]; mean[k + 2] += pos[3 * v + 2]; mean[k + 3]++; }
  // each face's plane, weighted by its area, into the quadrics of its corners' cells
  for (let t = 0; t < nt; t++) {
    const a = index[3 * t] * 3, b = index[3 * t + 1] * 3, c = index[3 * t + 2] * 3;
    const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2], wx = pos[c] - pos[a], wy = pos[c + 1] - pos[a + 1], wz = pos[c + 2] - pos[a + 2];
    let fx = uy * wz - uz * wy, fy = uz * wx - ux * wz, fz = ux * wy - uy * wx;
    const l = Math.hypot(fx, fy, fz);
    if (l < 1e-12) continue;
    const w = l / 2; fx /= l; fy /= l; fz /= l;
    const d = -(fx * pos[a] + fy * pos[a + 1] + fz * pos[a + 2]);
    const seen = new Set();
    for (const i of [index[3 * t], index[3 * t + 1], index[3 * t + 2]]) {
      const k = cell[i];
      if (seen.has(k)) continue;
      seen.add(k);
      const o = k * 10;
      Q[o] += w * fx * fx; Q[o + 1] += w * fx * fy; Q[o + 2] += w * fx * fz; Q[o + 3] += w * fy * fy; Q[o + 4] += w * fy * fz; Q[o + 5] += w * fz * fz;
      Q[o + 6] += w * fx * d; Q[o + 7] += w * fy * d; Q[o + 8] += w * fz * d; Q[o + 9] += w;
    }
  }
  const cp = new Float32Array(nc * 3);
  for (let k = 0; k < nc; k++) {
    const m = [mean[k * 4] / mean[k * 4 + 3], mean[k * 4 + 1] / mean[k * 4 + 3], mean[k * 4 + 2] / mean[k * 4 + 3]];
    let p = m;
    const o = k * 10, W = Q[o + 9];
    if (W > 0) {
      // minimise the quadric about the mean (regularised toward it): (A + εI) x = -(b + A m) + ...
      const e = 1e-3 * W, a11 = Q[o] + e, a12 = Q[o + 1], a13 = Q[o + 2], a22 = Q[o + 3] + e, a23 = Q[o + 4], a33 = Q[o + 5] + e;
      // right side: −(A m + b) for x = m + δ
      const r1 = -(Q[o] * m[0] + Q[o + 1] * m[1] + Q[o + 2] * m[2] + Q[o + 6]), r2 = -(Q[o + 1] * m[0] + Q[o + 3] * m[1] + Q[o + 4] * m[2] + Q[o + 7]), r3 = -(Q[o + 2] * m[0] + Q[o + 4] * m[1] + Q[o + 5] * m[2] + Q[o + 8]);
      const c11 = a22 * a33 - a23 * a23, c12 = a13 * a23 - a12 * a33, c13 = a12 * a23 - a13 * a22, det = a11 * c11 + a12 * c12 + a13 * c13;
      if (Math.abs(det) > 1e-18) {
        const c22 = a11 * a33 - a13 * a13, c23 = a12 * a13 - a11 * a23, c33 = a11 * a22 - a12 * a12;
        const dx = (c11 * r1 + c12 * r2 + c13 * r3) / det, dy = (c12 * r1 + c22 * r2 + c23 * r3) / det, dz = (c13 * r1 + c23 * r2 + c33 * r3) / det;
        const t = [m[0] + dx, m[1] + dy, m[2] + dz];
        // kept within its cell (and a little round it)
        const lo = [x0 + cid[k * 3] * ex / nx, y0 + cid[k * 3 + 1] * ey / ny, z0 + cid[k * 3 + 2] * ez / nz], sz = [ex / nx, ey / ny, ez / nz];
        if (t.every((v, i) => v >= lo[i] - 0.25 * sz[i] && v <= lo[i] + 1.25 * sz[i])) p = t;
      }
    }
    cp[k * 3] = p[0]; cp[k * 3 + 1] = p[1]; cp[k * 3 + 2] = p[2];
  }
  // a vertex per cell and facing: the cell's point, the facing's mean normal
  const vid = new Map(), outN = [], outC = [];
  const vert = new Int32Array(nv);
  for (let v = 0; v < nv; v++) {
    const key = cell[v] * 6 + face[v];
    let j = vid.get(key);
    if (j === undefined) { vid.set(key, (j = outC.length)); outC.push(cell[v]); outN.push(0, 0, 0); }
    vert[v] = j;
    outN[3 * j] += nor[3 * v] * sc; outN[3 * j + 1] += nor[3 * v + 1] * sc; outN[3 * j + 2] += nor[3 * v + 2] * sc;
  }
  const n = outC.length, P = new Float32Array(n * 3), N = new nor.constructor(n * 3);
  for (let j = 0; j < n; j++) {
    const k = outC[j] * 3;
    P[3 * j] = cp[k]; P[3 * j + 1] = cp[k + 1]; P[3 * j + 2] = cp[k + 2];
    const l = Math.hypot(outN[3 * j], outN[3 * j + 1], outN[3 * j + 2]) || 1;
    for (let c = 0; c < 3; c++) N[3 * j + c] = sc === 1 ? outN[3 * j + c] / l : Math.round((outN[3 * j + c] / l) / sc);
  }
  const I = [], seen = new Set();
  for (let t = 0; t < nt; t++) {
    const a = index[3 * t], b = index[3 * t + 1], c = index[3 * t + 2];
    if (cell[a] === cell[b] || cell[b] === cell[c] || cell[a] === cell[c]) continue;
    const A = vert[a], B = vert[b], C = vert[c];
    // turned over by the clustering: its face against its corners' normals
    const ux = P[3 * B] - P[3 * A], uy = P[3 * B + 1] - P[3 * A + 1], uz = P[3 * B + 2] - P[3 * A + 2];
    const wx = P[3 * C] - P[3 * A], wy = P[3 * C + 1] - P[3 * A + 1], wz = P[3 * C + 2] - P[3 * A + 2];
    const fx = uy * wz - uz * wy, fy = uz * wx - ux * wz, fz = ux * wy - uy * wx;
    const mx = N[3 * A] + N[3 * B] + N[3 * C], my = N[3 * A + 1] + N[3 * B + 1] + N[3 * C + 1], mz = N[3 * A + 2] + N[3 * B + 2] + N[3 * C + 2];
    if (fx * mx + fy * my + fz * mz <= 0) continue;
    // the same triangle twice (two fine ones collapsed onto one)
    const lo = Math.min(A, B, C), hi = Math.max(A, B, C), key = (lo * 65536 + (A + B + C - lo - hi)) * 65536 + hi;
    if (seen.has(key)) continue;
    seen.add(key);
    I.push(A, B, C);
  }
  if (!I.length) return null;
  return { pos: P, nor: N, index: n > 65535 ? Uint32Array.from(I) : Uint16Array.from(I) };
}
