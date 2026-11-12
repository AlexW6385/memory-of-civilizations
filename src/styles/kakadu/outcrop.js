// The sandstone of Ubirr as it breaks (docs/settlements/kakadu.md §3, §9): not rounded loaves but beds of hard and soft sandstone, the hard
// beds standing out over the soft ones that weather back (so every ledge shades the face under it), the whole mass split by vertical
// joints into columns whose faces stand at different depths, the joints open as dark clefts; the faces broken by scars where slabs have
// spalled off, pitted with honeycomb weathering (tafoni) in the soft beds, edges sharp and chipped; blocks fallen at the foot, angular.
// Every piece is a hexahedron with jittered corners whose faces are separate displaced grids (hard edges, smooth within a face); all of it
// goes into one geometry per material.
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { BLOCKS, MAIN, SMALL, FLIGHTS, rng, smooth, height } from '../../settlements/kakadu/layout.js';

const hash = (i, j, k, s) => { let h = Math.imul(i, 374761393) ^ Math.imul(j, 668265263) ^ Math.imul(k, 2147483647) ^ Math.imul(s | 0, 1274126177); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296 * 2 - 1; };
export function noise3(x, y, z, s = 0) {
  const i = Math.floor(x), j = Math.floor(y), k = Math.floor(z), fx = x - i, fy = y - j, fz = z - k;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = fz * fz * (3 - 2 * fz);
  const L = (a, b, t) => a + (b - a) * t;
  return L(L(L(hash(i, j, k, s), hash(i + 1, j, k, s), u), L(hash(i, j + 1, k, s), hash(i + 1, j + 1, k, s), u), v),
    L(L(hash(i, j, k + 1, s), hash(i + 1, j, k + 1, s), u), L(hash(i, j + 1, k + 1, s), hash(i + 1, j + 1, k + 1, s), u), v), w);
}

/** Triangles gathered per material, then one geometry each. */
export class Acc {
  constructor() { this.m = new Map(); this.tris = 0; }
  of(mat) { let a = this.m.get(mat); if (!a) this.m.set(mat, (a = { p: [], n: [] })); return a; }
  flush(bag) {
    for (const [mat, a] of this.m) {
      if (!a.p.length) continue;
      const g = new BufferGeometry();
      g.setAttribute('position', new Float32BufferAttribute(a.p, 3));
      g.setAttribute('normal', new Float32BufferAttribute(a.n, 3));
      bag.add(mat, g);
    }
    this.m.clear();
  }
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** Honeycomb: 0 on the thin walls between cells, 1 inside a pit (a jittered cell lattice, the nearest and second-nearest centre). */
function honeycomb(a, b, cell, seed) {
  const ia = Math.floor(a / cell), ib = Math.floor(b / cell);
  let f1 = 9, f2 = 9;
  for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
    const ci = ia + di, cj = ib + dj, cx = (ci + 0.5 + hash(ci, cj, 1, seed) * 0.38) * cell, cz = (cj + 0.5 + hash(ci, cj, 2, seed) * 0.38) * cell;
    const d = Math.hypot(a - cx, b - cz) / cell;
    if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) f2 = d;
  }
  return smooth(0.02, 0.2, f2 - f1) * (1 - 0.35 * smooth(0.25, 0.5, f1));
}

/**
 * One face of a body as a displaced grid. P(s, t): the base surface in [0,1]²; hexC: the body's middle (to find the outward side);
 * o: { res, edge, relief(x, y, z, a, b) → d, honey: { k, cell, depth, seed, patch }, pitMat, pitThr }.
 */
function face(acc, mat, P, hexC, o = {}) {
  const p0 = P(0, 0), pa = P(1, 0), pb = P(0, 1), pm = P(0.5, 0.5);
  const la = len(sub(pa, p0)), lb = len(sub(pb, p0));
  if (la < 0.05 || lb < 0.05) return;
  const res = o.res ?? 0.6, na = Math.max(1, Math.round(la / res)), nb = Math.max(1, Math.round(lb / res));
  let n = cross(sub(pa, p0), sub(pb, p0)); const nl = len(n) || 1; n = [n[0] / nl, n[1] / nl, n[2] / nl];
  const flip = dot(n, sub(pm, hexC)) < 0;
  if (flip) n = [-n[0], -n[1], -n[2]];
  const W = (na + 1) * (nb + 1), pos = new Float32Array(W * 3), pit = new Float32Array(W), edge = o.edge ?? 0.3, H = o.honey;
  for (let i = 0; i <= na; i++) for (let j = 0; j <= nb; j++) {
    const s = i / na, t = j / nb, bp = P(s, t), am = s * la, bm = t * lb, k = i * (nb + 1) + j;
    const e = Math.min(am, la - am, bm, lb - bm), fade = smooth(0, edge, e);
    let d = o.relief ? o.relief(bp[0], bp[1], bp[2], am, bm) : 0, pd = 0;
    if (H) {
      const m = smooth(H.lo ?? 0.0, H.hi ?? 0.45, H.patch(bp[0], bp[1], bp[2]));
      if (m > 0.01) pd = H.depth * m * honeycomb(am, bm, H.cell, H.seed);
      d -= pd;
    }
    d *= fade; pit[k] = pd * fade;
    pos[k * 3] = bp[0] + n[0] * d; pos[k * 3 + 1] = bp[1] + n[1] * d; pos[k * 3 + 2] = bp[2] + n[2] * d;
  }
  const nor = new Float32Array(W * 3), T = [];
  const id = (i, j) => i * (nb + 1) + j;
  for (let i = 0; i < na; i++) for (let j = 0; j < nb; j++) {
    const a = id(i, j), b = id(i + 1, j), c = id(i + 1, j + 1), d = id(i, j + 1);
    // the shorter diagonal along the face's relief: split by the lower corner sum
    if (flip) T.push(a, c, b, a, d, c); else T.push(a, b, c, a, c, d);
  }
  for (let q = 0; q < T.length; q += 3) {
    const a = T[q] * 3, b = T[q + 1] * 3, c = T[q + 2] * 3;
    const u = [pos[b] - pos[a], pos[b + 1] - pos[a + 1], pos[b + 2] - pos[a + 2]], v = [pos[c] - pos[a], pos[c + 1] - pos[a + 1], pos[c + 2] - pos[a + 2]], w = cross(u, v);
    for (const x of [a, b, c]) { nor[x] += w[0]; nor[x + 1] += w[1]; nor[x + 2] += w[2]; }
  }
  const A = acc.of(mat), B = o.pitMat ? acc.of(o.pitMat) : null, thr = (H?.depth ?? 0) * (o.pitThr ?? 0.5);
  for (let q = 0; q < T.length; q += 3) {
    const tgt = B && (pit[T[q]] + pit[T[q + 1]] + pit[T[q + 2]]) / 3 > thr ? B : A;
    for (let r = 0; r < 3; r++) {
      const v = T[q + r] * 3, l = Math.hypot(nor[v], nor[v + 1], nor[v + 2]) || 1;
      tgt.p.push(pos[v], pos[v + 1], pos[v + 2]); tgt.n.push(nor[v] / l, nor[v + 1] / l, nor[v + 2] / l);
    }
  }
  acc.tris += T.length / 3;
}

/** The 8 corners C[i][j][k] (i: x, j: y, k: z; 0 = low) of a box with each corner moved by up to jit = [jx, jy, jz]. */
function corners(x0, x1, y0, y1, z0, z1, jit, rnd) {
  const C = [[[], []], [[], []]];
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) for (let k = 0; k < 2; k++) {
    const J = jit[i][j][k] ?? [0, 0, 0];
    C[i][j][k] = [(i ? x1 : x0) + J[0] * (rnd() - 0.5) * 2, (j ? y1 : y0) + J[1] * (rnd() - 0.5) * 2, (k ? z1 : z0) + J[2] * (rnd() - 0.5) * 2];
  }
  return C;
}
const uniformJit = (j) => [[[[j, j, j], [j, j, j]], [[j, j, j], [j, j, j]]], [[[j, j, j], [j, j, j]], [[j, j, j], [j, j, j]]]];
export function hexP(C) {
  return (u, v, w) => {
    const out = [0, 0, 0];
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) for (let k = 0; k < 2; k++) {
      const f = (i ? u : 1 - u) * (j ? v : 1 - v) * (k ? w : 1 - w), c = C[i][j][k];
      out[0] += f * c[0]; out[1] += f * c[1]; out[2] += f * c[2];
    }
    return out;
  };
}
const FACES = {
  S: (H) => (s, t) => H(s, t, 1), N: (H) => (s, t) => H(s, t, 0),
  E: (H) => (s, t) => H(1, t, s), W: (H) => (s, t) => H(0, t, s),
  T: (H) => (s, t) => H(s, 1, t), B: (H) => (s, t) => H(s, 0, t),
};
/** A hexahedron from its corners; faces: { S: opts, E: opts, … } (only those given are built). */
export function hex(acc, mat, C, faces) {
  if (acc.dry) return;
  const H = hexP(C), mid = H(0.5, 0.5, 0.5);
  for (const [k, o] of Object.entries(faces)) if (o) face(acc, o.mat ?? mat, FACES[k](H), mid, o);
}

/** The relief of a rock face: low noise, scars (rectangles spalled back), vertical notches (joints running on). a, b: the face's own metres. */
function relief(seed, amp, scale, scars = [], notches = []) {
  return (x, y, z, a, b) => {
    let d = amp * (0.62 * noise3(x * scale, y * scale, z * scale, seed) + 0.38 * noise3(x * scale * 2.4, y * scale * 2.4, z * scale * 2.4, seed + 5));
    for (const s of scars) {
      const k = smooth(s.a0, s.a0 + 0.07, a) * smooth(s.a1, s.a1 - 0.07, a) * smooth(s.b0, s.b0 + 0.07, b) * smooth(s.b1, s.b1 - 0.07, b);
      if (k > 0) d -= s.d * k;
    }
    for (const nn of notches) { const k = 1 - smooth(nn.w * 0.5, nn.w * 0.5 + 0.12, Math.abs(a - nn.a)); if (k > 0) d -= nn.d * k * smooth(nn.b0, nn.b0 + 0.25, b); }
    return d;
  };
}

/** The tones of the beds, by the block's own stone. */
const BANDS = {
  sandstone_rose: ['sandstone_rose', 'sandstone_rose', 'tuff_red', 'sandstone_yellow', 'sandstone_rose', 'sandstone_white'],
  sandstone_yellow: ['sandstone_yellow', 'sandstone_yellow', 'sandstone_rose', 'sandstone_white', 'sandstone_yellow', 'tuff_red'],
  sandstone_white: ['sandstone_white', 'sandstone_yellow', 'sandstone_white', 'sandstone_rose'],
  tuff_red: ['tuff_red', 'sandstone_rose', 'tuff_red', 'sandstone_rose', 'tuff_red'],
};
const PIT = { sandstone_rose: 'tuff_red', sandstone_yellow: 'tuff_red', sandstone_white: 'sandstone_rose', tuff_red: 'pottery_dark' };
const SHELTER_OF = { 1: MAIN, 6: SMALL };

const inBox = (C, x, y, z) => x > C.r[0] && x < C.r[2] && z > C.r[1] && z < C.r[3] && y > C.y[0] && y < C.y[1];
const buried = (B, x, y, z) => BLOCKS.some((C) => C !== B && inBox(C, x, y, z));

// ── rounded blocks in columns ───────────────────────────────────────────────────────────────────────────────
// Each column between two joints is a stack of slices; a slice is a rounded block (a superellipse in plan, its edges rolled over a quarter
// circle), hard slices standing out over soft ones that have weathered back, every column with its own bed heights, depth and width, so no
// bedding line runs on from one column to the next. The sides of the columns are the joints; the wide ones are clefts, dark inside.
const TAU = Math.PI * 2;
const sgnPow = (v, e) => Math.sign(v) * Math.abs(v) ** e;
/** Ring angles: dense across the front (+z), sparse behind (the back is buried in the mass). */
function ringAngles(nf, nb) {
  const a0 = 0.05 * Math.PI, a1 = 0.95 * Math.PI, out = [];
  for (let i = 0; i <= nf; i++) out.push(a0 + (a1 - a0) * i / nf);
  for (let i = 1; i < nb; i++) out.push(a1 + (TAU - (a1 - a0)) * i / nb);
  return out;
}
/** The heights of a slice's rings with the metres by which each is drawn in: a quarter circle at each rounded end, then every ~0.7 m. */
function sliceRings(ya, yb, rb, rt, step) {
  const out = [];
  if (rb > 0.01) for (let k = 0; k <= 3; k++) { const f = k / 3 * Math.PI / 2; out.push([ya + rb * (1 - Math.cos(f)), rb * (1 - Math.sin(f))]); } else out.push([ya, 0]);
  const m0 = ya + rb, m1 = yb - rt, nm = Math.max(0, Math.round((m1 - m0) / step) - 1);
  for (let k = 1; k <= nm; k++) out.push([m0 + (m1 - m0) * k / (nm + 1), 0]);
  if (rt > 0.01) for (let k = 3; k >= 0; k--) { const f = k / 3 * Math.PI / 2; out.push([yb - rt * (1 - Math.cos(f)), rt * (1 - Math.sin(f))]); } else out.push([yb, 0]);
  return out;
}
/** A grid of rings → triangles with welded normals, oriented outward (side) or up/down (annulus, cap), each triangle's material from matOf. */
function emitGrid(acc, V, aux, tris, orient, matOf, quads = true) {
  if (acc.dry) return;
  const nor = new Float32Array(V.length * 3);
  const tn = [];
  let score = 0;
  for (let q = 0; q < tris.length; q += 3) {
    const a = V[tris[q]], b = V[tris[q + 1]], c = V[tris[q + 2]];
    const n = cross(sub(b, a), sub(c, a)); tn.push(n);
    const m = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3];
    if (orient.axis) score += n[0] * (m[0] - orient.axis[0]) + n[2] * (m[2] - orient.axis[1]);
    else score += n[1] * orient.y;
  }
  const flip = score < 0;
  for (let q = 0, t = 0; q < tris.length; q += 3, t++) for (let r = 0; r < 3; r++) { const v = tris[q + r] * 3, n = tn[t]; nor[v] += n[0]; nor[v + 1] += n[1]; nor[v + 2] += n[2]; }
  for (let q = 0; q < tris.length; q += 3) {
    const a = V[tris[q]], b = V[tris[q + 1]], c = V[tris[q + 2]];
    // the material is chosen per quad (two triangles), so that streak edges run along the grid and not along its diagonals
    const q0 = q - (q % 6), quad = quads ? [tris[q0], tris[q0 + 1], tris[q0 + 2], tris[q0 + 5]] : [tris[q], tris[q + 1], tris[q + 2]];
    const cen = [0, 0, 0]; let pit = 0;
    for (const i of quad) { cen[0] += V[i][0] / quad.length; cen[1] += V[i][1] / quad.length; cen[2] += V[i][2] / quad.length; pit += aux[i] / quad.length; }
    const gn = cross(sub(b, a), sub(c, a)), gl = len(gn) || 1, fn = flip ? [-gn[0] / gl, -gn[1] / gl, -gn[2] / gl] : [gn[0] / gl, gn[1] / gl, gn[2] / gl];
    const T = acc.of(matOf(cen, fn, pit));
    for (let r = 0; r < 3; r++) {
      const i = tris[flip ? q + (r ? 3 - r : 0) : q + r], v = i * 3, l = Math.hypot(nor[v], nor[v + 1], nor[v + 2]) || 1, s = flip ? -1 : 1;
      T.p.push(V[i][0], V[i][1], V[i][2]); T.n.push(s * nor[v] / l, s * nor[v + 1] / l, s * nor[v + 2] / l);
    }
    acc.tris++;
  }
}
const GREY = 'rock_boulder', BLACK = 'pottery_dark', IRON = 'scoria_red';
/**
 * One column: o = { xa, xb, zf, deep, slices: [{ya, yb, mat, set, inx, dx, n, rb, rt, soft, honey, pit}], seed, res, flatTop, darkL, darkR, bridge }.
 * Everything is in the settlement's frame; the front is at z = zf − set.
 */
export function columnMass(acc, o) {
  if (acc.dry) return;
  const w = o.xb - o.xa, cx0 = (o.xa + o.xb) / 2, res = o.res ?? 0.55, seed = o.seed;
  const rnd = rng(seed * 31 + 7), scars = [];
  const yLo = o.slices[0].ya, yHi = o.slices[o.slices.length - 1].yb;
  for (let q = 0, nq = Math.round(w * (yHi - yLo) / 14 * (0.6 + rnd())); q < nq; q++) { const sw = 0.5 + rnd() * 1.6, sh = 0.4 + rnd() * 1.0, x0 = o.xa + rnd() * Math.max(0.1, w - sw), y0 = yLo + rnd() * Math.max(0.1, yHi - yLo - sh); scars.push({ x0, x1: x0 + sw, y0, y1: y0 + sh, d: 0.1 + rnd() * 0.22 }); }
  const grooves = [];
  for (let q = 0, nq = 1 + Math.floor(w / 3.2 * rnd()); q < nq; q++) { const y0 = yLo + rnd() * (yHi - yLo) * 0.4; grooves.push({ x: o.xa + 0.6 + rnd() * Math.max(0.1, w - 1.2), w: 0.3 + rnd() * 0.3, d: 0.3 + rnd() * 0.35, y0, y1: y0 + (yHi - y0) * (0.4 + rnd() * 0.6) }); }
  let prev = null;
  const nS = o.slices.length, anyFine = o.slices.some((s) => s.honey > 0);
  const nf = Math.max(10, Math.min(120, Math.round((w + o.deep * 0.5) / (anyFine ? (o.fine ?? 0.4) : res * 1.25)))), th = ringAngles(nf, 12);
  o.slices.forEach((s, si) => {
    const wb = o.bridge && si === 0 ? o.bridge : 0, hx = w / 2 - s.inx + wb, hz = (o.deep - s.set) / 2, cz = o.zf - s.set - hz, cx = cx0 + s.dx;
    const fine = s.honey > 0;
    const rows = sliceRings(s.ya, s.yb, s.rb, s.rt, fine ? Math.min(0.3, (o.fine ?? 0.4) * 0.8) : 0.75), top = si === nS - 1;
    const V = [], aux = [], R = [];
    const ringsOut = [];
    for (const [y, ins] of rows) {
      const ring = [];
      for (const t of th) {
        const c = Math.cos(t), sn = Math.sin(t), e = 2 / s.n, fw = top && y > s.yb - s.rt - 0.01 ? smooth(-0.25, 0.4, sn) : 1;
        const prof = 1 + 0.1 * noise3(y * 0.37, seed * 0.013, 0.5, seed + 2), sxs = 0.3 * noise3(y * 0.3, 1.5, 0.5, seed + 4), lz = s.lean * (y - s.ya) / Math.max(0.5, s.yb - s.ya);
        const hxx = Math.max(0.3, (hx - ins * fw) * prof), hzz = Math.max(0.3, (hz - ins * fw) * prof);
        let x = cx + sxs + hxx * sgnPow(c, e), z = cz + lz + hzz * sgnPow(sn, e);
        const gx = sgnPow(c, 2 - e) / hxx, gz = sgnPow(sn, 2 - e) / hzz, gl = Math.hypot(gx, gz) || 1, nx = gx / gl, nz = gz / gl;
        let d = o.amp * (0.62 * noise3(x * 0.4, y * 0.4, z * 0.4, seed) + 0.38 * noise3(x * 1.1, y * 1.1, z * 1.1, seed + 5)) + 0.3 * noise3(x * 0.16, y * 0.2, z * 0.16, seed + 9);
        let pd = 0;
        const front = nz > 0.3 ? 1 : 0;
        if (front) for (const g of grooves) d -= g.d * (1 - smooth(g.w * 0.5, g.w * 0.5 + 0.2, Math.abs(x - g.x))) * smooth(g.y0, g.y0 + 0.5, y) * smooth(g.y1, g.y1 - 0.5, y);
        if (front) for (const sc of scars) { const k = smooth(sc.x0, sc.x0 + 0.12, x) * smooth(sc.x1, sc.x1 - 0.12, x) * smooth(sc.y0, sc.y0 + 0.12, y) * smooth(sc.y1, sc.y1 - 0.12, y); if (k > 0) d -= sc.d * k; }
        if (s.honey > 0) {
          const m = smooth(0.05, 0.5, noise3(x * 0.33, y * 0.4, z * 0.33, seed + 3) * 0.8 + 0.2 * s.honey - 0.05) * smooth(s.ya + 0.1, s.ya + 0.45, y) * smooth(s.yb - 0.1, s.yb - 0.45, y);
          if (m > 0.01) pd = s.pit * m * honeycomb(x + z, y, 0.42 + 0.25 * (noise3(x, y, z, seed) * 0.5 + 0.5), seed + 3);
          d -= pd;
        }
        x += nx * d; z += nz * d;
        ring.push(V.length); V.push([x, y, z]); aux.push(pd);
      }
      R.push(ring);
    }
    const tris = [], M = th.length;
    for (let r = 0; r + 1 < R.length; r++) for (let j = 0; j < M; j++) { const a = R[r][j], b = R[r][(j + 1) % M], c = R[r + 1][(j + 1) % M], d = R[r + 1][j]; tris.push(a, b, c, a, c, d); }
    const matBase = s.mat, pitMat = s.pitMat;
    const matOf = (cen, n, pit) => {
      if (pit > s.pit * 0.45) return pitMat;
      if (n[1] > 0.5) return matBase;
      if (n[2] > 0.25 || Math.abs(n[0]) > 0.5) {
        if (n[0] < -0.55 && o.darkL || n[0] > 0.55 && o.darkR) return BLACK;
        const st = noise3(cen[0] * 0.9 + cen[2] * 0.6, cen[1] * 0.045, 0.5, seed + 17);
        if (!s.soft) { if (st > 0.55) return BLACK; if (st > 0.38) return GREY; if (st < -0.42) return IRON; }
        else if (st > 0.5) return GREY;
      }
      return matBase;
    };
    emitGrid(acc, V, aux, tris, { axis: [cx, cz] }, matOf);
    // the ledge or soffit between this slice and the next (separate vertices: a hard edge)
    const last = R[R.length - 1].map((i) => V[i]);
    if (prev) {
      const A = prev.ring, B = R[0].map((i) => V[i]), W = [], X = [], Tt = [], Mm = Math.min(A.length, B.length);
      for (let j = 0; j < Mm; j++) { W.push(A[j]); }
      for (let j = 0; j < Mm; j++) { W.push(B[j]); }
      for (let j = 0; j < Mm; j++) { const a = j, b = (j + 1) % Mm, c = Mm + (j + 1) % Mm, d = Mm + j; Tt.push(a, b, c, a, c, d); }
      const area = (P) => { let s2 = 0; for (let j = 0; j < P.length; j++) { const p = P[j], q = P[(j + 1) % P.length]; s2 += p[0] * q[2] - q[0] * p[2]; } return Math.abs(s2); };
      void X;
      emitGrid(acc, W, W.map(() => 0), Tt, { y: area(B) > area(A) ? -1 : 1 }, (cen, n) => (n[1] < 0 ? (s.soft ? matBase : prev.mat) : prev.mat));
    }
    prev = { ring: last, mat: s.mat };
    if (top) {
      const cap = R[R.length - 1].map((i) => V[i]), W = [...cap, [cx, cap[0][1] + 0.01, cz - hz * 0.0]], Tt = [], Mm = cap.length;
      for (let j = 0; j < Mm; j++) Tt.push(Mm, j, (j + 1) % Mm);
      emitGrid(acc, W, W.map(() => 0), Tt, { y: 1 }, () => s.mat, false);
    }
  });
}

/** One block of the outcrop as columns of rounded blocks split by joints. res: the south faces' grid. */
export function outcropBlock(acc, B, o = {}) {
  const rnd = rng(B.seed * 131 + 17), [x0, z0, x1, z1] = B.r, [y0, y1] = B.y, slab = !!B.slab;
  const bands = BANDS[B.m] ?? [B.m], S = B.panel ? SHELTER_OF[B.seed] : null, res = o.res ?? 0.55;
  const D = z1 - z0, deepC = slab ? D - 0.3 : Math.min(D - 0.3, 7.0);
  const onFlight = (xa, xb) => FLIGHTS.some((F) => F.rect[0] < xb + 1.5 && F.rect[2] > xa - 1.5 && F.rect[1] < z1 + 14 && F.rect[3] > z0);
  // ── the plateau behind the columns: the top walked on, the north face seen from the lookout
  {
    const C = corners(x0, x1, y0, y1, z0, z1 - deepC + 1.2, uniformJit(0), rnd);
    hex(acc, B.m, C, { S: { res: 2.5, mat: BLACK }, N: { res: 1.6, relief: relief(B.seed, 0.35, 0.12) }, T: { res: 1.2, edge: 0.5, relief: relief(B.seed + 4, 0.04, 0.5) } });
    // the dark back of the clefts, inside the columns' depth
    if (!slab) { const Cs = corners(x0 + 0.4, x1 - 0.4, y0, y1 - 0.5, z1 - 3.9, z1 - 3.8, uniformJit(0), rnd); hex(acc, BLACK, Cs, { S: { res: 2.5 } }); }
  }
  // the roof's soffit, one flat face (the walker's shell test needs an underside to see the roof as a roof)
  if (slab && !acc.dry) {
    const A = acc.of(BANDS[B.m]?.[0] ?? B.m), yS = y0 - 0.02, pts = [[x0 + 0.1, z1 - 0.05], [x1 - 0.1, z1 - 0.05], [x1 - 0.1, z0 + 0.1], [x0 + 0.1, z0 + 0.1]];
    for (const q of [[0, 2, 1], [0, 3, 2]]) for (const i of q) { A.p.push(pts[i][0], yS, pts[i][1]); A.n.push(0, -1, 0); }
  }
  // ── the joints: positions shared by the columns; a few open wide as clefts
  const joints = [];
  if (S) for (const x of [S.x0 - 1.2, S.x1 + 1.2]) joints.push({ x, g: 0.4, forced: true });
  for (let x = x0 + 2.6 + rnd() * 2.5; x < x1 - 2.8; x += 2.8 + rnd() * 3.2) if (!joints.some((j) => Math.abs(j.x - x) < 2.4)) joints.push({ x, g: 0.3 + rnd() * 0.45, cleft: !slab && rnd() < 0.2 });
  for (const j of joints) if (j.cleft) j.g = 1.1 + rnd() * 1.1;
  joints.sort((a, b) => a.x - b.x);
  const edges = [{ x: x0, g: 0 }, ...joints, { x: x1, g: 0 }];
  for (let c = 0; c + 1 < edges.length; c++) {
    const xa = edges[c].x + edges[c].g / 2, xb = edges[c + 1].x - edges[c + 1].g / 2, w = xb - xa, seed = B.seed * 53 + c * 7;
    if (w < 1.2) continue;
    const wall = S && xa > S.x0 - 1.3 && xb < S.x1 + 1.3, flat = onFlight(xa, xb);
    const yBase = wall ? S.yc0 + 0.4 : y0, colOff = flat ? 0 : (rnd() < 0.3 ? -0.5 : rnd() * 1.7);
    const covered = BLOCKS.some((C) => C !== B && C.y[0] < y1 + 0.5 && C.y[1] > y1 + 0.5 && C.r[0] < xb && C.r[2] > xa && C.r[3] > z1 - 8 && C.r[1] < z1);
    const yTop = y1 + 0.03 + (flat ? 0 : slab ? rnd() * 1.3 : covered ? rnd() * 0.3 : rnd() < 0.4 ? 0.8 + rnd() * 2.4 : rnd() * 0.4);
    // beds of this column's own: thickness 0.9–2.8 m, hard and soft by turns
    const colMat = bands[Math.floor(rnd() * 99) % bands.length] === 'sandstone_white' && rnd() < 0.6 ? B.m : bands[Math.floor(rnd() * 99) % bands.length];
    const slices = [], H = yTop - yBase;
    let y = yBase, prevSoft = false, i = 0;
    while (y < yTop - 0.4) {
      let th = (prevSoft ? 1.8 : 1.0) + rnd() * (prevSoft ? 2.6 : 1.8) + (i === 0 ? 1.0 : 0);
      if (yTop - (y + th) < 1.2) th = yTop - y;
      const topS = y + th >= yTop - 1e-6, first = i === 0;
      const soft = !topS && !first && !prevSoft && !flat && rnd() < 0.55;
      prevSoft = soft;
      const mat = colMat;
      let set = colOff + (soft ? 0.5 + rnd() * 1.3 : (rnd() - 0.6) * 0.7);
      if (first || flat) set = Math.min(set, flat ? 0 : 0.7);
      if (slab && first) set = 0;
      set = Math.max(-0.5, Math.min(3.3, set));
      const inx = soft ? 0.15 + rnd() * 0.4 : rnd() * 0.25;
      slices.push({ ya: y, yb: y + th, mat, set, inx, dx: (rnd() - 0.5) * 2 * Math.min(inx, 0.25), n: soft ? 3.0 + rnd() * 1.2 : 4.5 + rnd() * 3.5, rb: first ? 0 : soft ? 0.1 + rnd() * 0.1 : 0.2 + rnd() * 0.25, rt: topS ? (flat ? 0.2 : 0.3 + rnd() * 0.25) : soft ? 0.1 : 0.2 + rnd() * 0.2, soft, lean: (rnd() - 0.5) * 0.9, honey: soft ? (rnd() < 0.75 ? 1 : 0.5) : rnd() < 0.3 ? 0.35 : 0, pit: 0.14 + rnd() * 0.12, pitMat: PIT[mat] ?? 'tuff_red' });
      y += th; i++;
    }
    if (!slices.length) continue;
    if (slab) slices[0].rb = 0;
    void H;
    const gapL = edges[c].g, gapR = edges[c + 1].g;
    columnMass(acc, { fine: z1 > -31 ? 0.4 : z1 > -40 ? 0.55 : 0.8, xa, xb, zf: z1, deep: deepC, slices, seed, res, amp: 0.2 + rnd() * 0.12, darkL: gapL > 0.9, darkR: gapR > 0.9, bridge: slab ? 0.2 : 0 });
    // plants: the ledges where a slice stands back from the one under it, the feet of the clefts
    if (o.spots) {
      slices.forEach((s, k) => {
        if (!k) return;
        const p = slices[k - 1], led = s.set - p.set;
        if (led > 0.4 && !flat && rnd() < 0.85) o.spots.push({ x: xa + 0.6 + rnd() * Math.max(0.1, w - 1.2), y: p.yb - 0.02, z: z1 - s.set + led * (0.25 + rnd() * 0.4), w: led, kind: 'ledge' });
      });
    }
  }
  if (o.spots) for (const j of joints) if (j.cleft) o.spots.push({ x: j.x, y: height(j.x, z1 - 1.2), z: z1 - 1.2, w: 1, kind: 'cleft' });
}

/** An angular block lying on the ground: base centre (cx, cy, cz), size (sx, sy, sz), turned by yaw and leaning by tilt (about its x axis). */
export function chunk(acc, mat, cx, cy, cz, sx, sy, sz, yaw, tilt, seed) {
  const rnd = rng(seed * 7 + 3), cy_ = Math.cos(yaw), sy_ = Math.sin(yaw), ct = Math.cos(tilt), st = Math.sin(tilt);
  const C = [[[], []], [[], []]];
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) for (let k = 0; k < 2; k++) {
    const narrow = j ? 0.72 + rnd() * 0.28 : 1;
    let lx = (i - 0.5) * sx * narrow * (0.88 + rnd() * 0.24), ly = j * sy * (0.9 + rnd() * 0.2) - sy * 0.15, lz = (k - 0.5) * sz * narrow * (0.88 + rnd() * 0.24);
    const y2 = ly * ct - lz * st, z2 = ly * st + lz * ct;
    ly = y2; lz = z2;
    C[i][j][k] = [cx + lx * cy_ + lz * sy_, cy + ly, cz - lx * sy_ + lz * cy_];
  }
  const res = Math.max(0.45, Math.min(sx, sy, sz) / 2.2), o = { res, relief: relief(seed, 0.05 + 0.04 * Math.min(sx, sy, sz), 0.9 / Math.max(0.6, Math.min(sx, sz) * 0.6)), edge: 0.12 };
  hex(acc, mat, C, { S: o, N: o, E: o, W: o, T: { ...o, relief: relief(seed + 1, 0.05, 0.9) } });
}

/** Blocks and slabs shed on the broken top of the back mass above the gallery's roof, and along the tops of the ledges (nothing walks there). */
export function shedBlocks(acc) {
  const r2 = rng(909);
  for (let k = 0; k < 34; k++) {
    const sz = 0.9 + r2() ** 2 * 2.8, x = -34 + r2() * 68, z = -46 + r2() * 9.5, flat = r2() < 0.4, lean = r2() < 0.3;
    const mat = k % 3 ? 'sandstone_rose' : k % 2 ? 'sandstone_yellow' : 'tuff_red';
    chunk(acc, mat, x, 13.9, z, sz * (flat ? 2.4 : 1.4), sz * (flat ? 0.55 : 0.8 + r2() * 0.6), sz * (flat ? 1.8 : 1.1), r2() * 3.14, lean ? 0.25 + r2() * 0.2 : 0, Math.floor(r2() * 1e6));
  }
}

/** Where plants root in the face: the ledges of the soft beds' setbacks and the feet of the open clefts (the same seeded build, drawn to nothing). */
export function faceSpots() {
  const acc = new Acc(), spots = [];
  acc.dry = true;
  for (const B of BLOCKS) outcropBlock(acc, B, { spots });
  return spots;
}
