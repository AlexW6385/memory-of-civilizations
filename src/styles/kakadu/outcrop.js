// The sandstone of Ubirr as it breaks (docs/settlements/kakadu.md §3, §9): not rounded loaves but beds of hard and soft sandstone, the hard
// beds standing out over the soft ones that weather back (so every ledge shades the face under it), the whole mass split by vertical
// joints into columns whose faces stand at different depths, the joints open as dark clefts; the faces broken by scars where slabs have
// spalled off, pitted with honeycomb weathering (tafoni) in the soft beds, edges sharp and chipped; blocks fallen at the foot, angular.
// Every piece is a hexahedron with jittered corners whose faces are separate displaced grids (hard edges, smooth within a face); all of it
// goes into one geometry per material.
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { BLOCKS, MAIN, SMALL, rng, smooth } from '../../settlements/kakadu/layout.js';

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
const uniformJit = (j) => [[[j, j], [j, j]], [[j, j], [j, j]]];
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

/** One block of the outcrop as beds, columns and joints. res: the south faces' grid. */
export function outcropBlock(acc, B, o = {}) {
  const rnd = rng(B.seed * 131 + 17), [x0, z0, x1, z1] = B.r, [y0, y1] = B.y, H = y1 - y0, slab = !!B.slab;
  const bands = BANDS[B.m] ?? [B.m], S = B.panel ? SHELTER_OF[B.seed] : null, res = o.res ?? 0.55;
  const D = z1 - z0, deepMax = Math.min(D - 0.6, 6.5);
  // ── the mass behind: its north face (seen from the lookout), the dark back of the clefts, nothing else shows
  {
    const C = corners(x0, x1, y0, y1, z0, z1, uniformJit(0), rnd);
    const mass = { res: 1.6, relief: relief(B.seed, 0.35, 0.12) };
    // the south face of the mass 3 m in from the beds' fronts: the back wall of the clefts (dark)
    const inset = (k, v) => k.map((a, i) => a.map((b, j) => b.map((c, q) => (q === 1 ? c.map((p, w) => (w === 2 ? p - 3.0 : p)) : c))));
    void inset;
    hex(acc, B.m, C, { N: mass });
    const Cs = corners(x0 + 0.4, x1 - 0.4, y0, y1 - 0.5, z0, z1 - 3.0, uniformJit(0), rnd);
    hex(acc, 'pottery_dark', Cs, { S: { res: 2.5 } });
  }
  // the roof's soffit, one flat face (the walker's shell test needs an underside to see the roof as a roof)
  if (slab) {
    const A = acc.of(BANDS[B.m]?.[0] ?? B.m), yS = y0 - 0.02, pts = [[x0 + 0.1, z1 - 0.05], [x1 - 0.1, z1 - 0.05], [x1 - 0.1, z0 + 0.1], [x0 + 0.1, z0 + 0.1]];
    for (const q of [[0, 2, 1], [0, 3, 2]]) for (const i of q) { A.p.push(pts[i][0], yS, pts[i][1]); A.n.push(0, -1, 0); }
  }
  // ── the beds
  const nb = Math.max(2, Math.round(H / (slab ? 2.0 : 1.9)));
  const wts = Array.from({ length: nb }, () => 0.7 + rnd() * 0.75), ws = wts.reduce((a, b) => a + b, 0), beds = [];
  let yy = y0, prevSoft = false;
  for (let i = 0; i < nb; i++) {
    const th = H * wts[i] / ws, top = i === nb - 1;
    const soft = top ? 0 : prevSoft ? rnd() * 0.2 : rnd() < 0.42 ? 0.45 + rnd() * 1.05 : rnd() * 0.25;
    prevSoft = soft > 0.4;
    beds.push({ ya: yy, yb: yy + th, soft, mat: bands[(i + (B.seed % 3)) % bands.length], honey: soft > 0.4 ? (rnd() < 0.7 ? 1 : 0.5) : rnd() < 0.1 ? 0.55 : 0, top });
    yy += th;
  }
  // the joints: master positions, shared by all the beds (a joint runs through several), a few open wide as clefts
  const joints = [];
  if (S) for (const x of [S.x0 - 1.2, S.x1 + 1.2]) joints.push({ x, g: 0.32, forced: true });
  for (let x = x0 + 2.2 + rnd() * 3; x < x1 - 2.5; x += 4.6 + rnd() * 4.6) if (!joints.some((j) => Math.abs(j.x - x) < 2.2)) joints.push({ x, g: 0.3 + rnd() * 0.4, cleft: rnd() < 0.14 });
  for (const j of joints) if (j.cleft) j.g = 1.1 + rnd() * 1.0;
  joints.sort((a, b) => a.x - b.x);
  const colOff = joints.map(() => -rnd() * 0.85 * (rnd() < 0.6 ? 1 : 0.3));
  colOff.push(-rnd() * 0.6);
  // ── the lower beds: columns of segments
  for (let i = 0; i < nb - 1; i++) {
    const b = beds[i];
    const behind = S && b.ya < S.yc0 + 0.35;     // the painted wall's surface stands before these beds
    let xa = x0 + (i % 2 ? 0 : rnd() * 0.3);
    const cuts = [];
    if (!(slab && i === 0)) joints.forEach((j, k) => { if (j.forced || j.cleft || rnd() < 0.8) cuts.push({ x: j.x, g: j.g * (j.cleft ? 1 : 0.75 + rnd() * 0.55), k }); });
    cuts.push({ x: x1 - (i % 3 ? 0 : rnd() * 0.3), g: 0, k: joints.length, end: true });
    for (const c of cuts) {
      const xb = c.end ? c.x : c.x - c.g / 2;
      const w = xb - xa;
      if (w > 1.4) {
        const col = colOff[Math.min(c.k, colOff.length - 1)], zf = Math.min(z1, z1 - b.soft + col + (rnd() - 0.5) * 0.3 - (behind ? 1.0 : 0));
        const deep = slab && i === 0 ? D - 0.3 : Math.min(deepMax, 4 + rnd() * 2.5), seed = B.seed * 53 + i * 11 + Math.floor(xa);
        const inWall = S && xa > S.x0 - 1.2 && xb < S.x1 + 1.2 && b.yb < S.yc0 + 0.5;
        const ya = b.ya - 0.05, yb = b.yb + 0.1;
        if (!inWall) {
          const cx = xa + w / 2;
          // the faces seen: the front, the sides of the clefts and of the block's ends, the ledge on top where the bed above stands back
          const nextSoft = beds[i + 1].soft, nextZf = z1 - nextSoft + colOff[Math.min(c.k, colOff.length - 1)];
          const ledge = zf - nextZf;     // > 0: the bed above stands back, the top shows
          const scars = [], nsc = Math.round(w * (yb - ya) / 7 * (0.5 + rnd()));
          for (let q = 0; q < nsc; q++) { const sw = 0.5 + rnd() * 1.4, sh = 0.3 + rnd() * 0.8, a0 = rnd() * Math.max(0.1, w - sw), b0 = rnd() * Math.max(0.1, yb - ya - sh); scars.push({ a0, a1: a0 + sw, b0, b1: b0 + sh, d: 0.12 + rnd() * 0.3 }); }
          const hon = b.honey ? { k: 1, cell: 0.42 + rnd() * 0.25, depth: 0.16 + rnd() * 0.1, seed: seed + 3, patch: (x, y, z) => noise3(x * 0.33, y * 0.4, z * 0.33, seed) * 0.8 + 0.2 * b.honey - 0.05, lo: 0.05, hi: 0.5 } : null;
          const C = corners(xa, xb, ya, yb, zf - deep, zf, [[[[0, 0, 0], [0.1, 0.12, 0.14]], [[0, 0.14, 0], [0.1, 0.16, 0.14]]], [[[0, 0, 0], [0.1, 0.12, 0.14]], [[0, 0.14, 0], [0.1, 0.16, 0.14]]]].map((p) => p), rnd);
          const sOpt = { res: hon ? 0.2 : res, relief: relief(seed, 0.2, 0.3, scars), honey: hon, pitMat: hon ? PIT[b.mat] ?? 'tuff_red' : null, pitThr: 0.45, edge: 0.3 };
          const faces = { S: sOpt, T: ledge > 0.15 && !buried(B, cx, yb + 0.3, zf - 0.3) ? { res: 0.7, relief: relief(seed + 1, 0.05, 0.6), edge: 0.2 } : null };
          const ex = { res: 0.9, relief: relief(seed + 2, 0.12, 0.35) };
          if (!(c.end && buried(B, x1 + 0.25, (ya + yb) / 2, zf - 1))) faces.E = ex;
          else if (!c.end) faces.E = ex;
          if (!(xa === x0 + 0 && buried(B, x0 - 0.25, (ya + yb) / 2, zf - 1)) && (xa - x0 < 0.5 ? !buried(B, x0 - 0.25, (ya + yb) / 2, zf - 1) : true)) faces.W = ex;
          if (!buried(B, cx, (ya + yb) / 2, zf - 1)) hex(acc, b.mat, C, faces);
          void ledge;
        }
      }
      xa = c.x + c.g / 2;
    }
  }
  // ── the top bed: one piece across the block (its top is walked on and must not break), the joints running on as notches in its face
  {
    const b = beds[nb - 1], zf = z1 - rnd() * 0.12, seed = B.seed * 53 + 977;
    const notches = joints.map((j) => ({ a: j.x - x0, w: Math.min(0.9, j.g * 1.1 + 0.1), d: 0.35 + rnd() * 0.55, b0: rnd() * (b.yb - b.ya) * 0.5 })).filter(() => rnd() < 0.85);
    const scars = [];
    const nsc = Math.round((x1 - x0) * (b.yb - b.ya) / 9 * (0.5 + rnd()));
    for (let q = 0; q < nsc; q++) { const sw = 0.6 + rnd() * 1.8, sh = 0.3 + rnd() * 0.9, a0 = rnd() * Math.max(0.1, x1 - x0 - sw), b0 = rnd() * Math.max(0.1, b.yb - b.ya - sh); scars.push({ a0, a1: a0 + sw, b0, b1: b0 + sh, d: 0.12 + rnd() * 0.28 }); }
    const C = corners(x0, x1, b.ya - 0.1, y1, z0, zf, [[[[0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0]]], [[[0, 0, 0], [0, 0, 0]], [[0, 0, 0], [0, 0, 0]]]], rnd);
    const hon = b.honey ? { k: 1, cell: 0.5, depth: 0.2, seed: seed + 3, patch: (x, y, z) => noise3(x * 0.3, y * 0.4, z * 0.3, seed) * 0.8 - 0.05, lo: 0.1, hi: 0.5 } : null;
    const crack = joints.map((j) => ({ a: j.x - x0, w: 0.22 + j.g * 0.2, d: B.walkTop || slab ? 0.06 : 0.14, b0: 0 }));
    const ends = (xe) => !buried(B, xe, (b.ya + y1) / 2, (z0 + zf) / 2);
    hex(acc, b.mat, C, {
      S: { res: hon ? 0.25 : res, relief: relief(seed, 0.18, 0.28, scars, notches), honey: hon, pitMat: PIT[b.mat] ?? 'tuff_red', pitThr: 0.45 },
      T: { res: 1.1, relief: (x, y, z, a, bb) => relief(seed + 4, 0.04, 0.5)(x, y, z, a, bb) - crack.reduce((s, c) => s + c.d * (1 - smooth(c.w * 0.5, c.w * 0.5 + 0.1, Math.abs(a - c.a))), 0), edge: 0.5 },
      E: ends(x1 + 0.25) ? { res: 1.0, relief: relief(seed + 2, 0.15, 0.3) } : null,
      W: ends(x0 - 0.25) ? { res: 1.0, relief: relief(seed + 6, 0.15, 0.3) } : null,
    });
  }
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
