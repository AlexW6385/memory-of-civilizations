// The sandstone of Ubirr (docs/settlements/kakadu.md §3, §10): the outlier's beds, joints and fallen blocks are built in outcrop.js; the painted wall and the painted ceiling as separate smooth surfaces under the
// roof slab; the rock steps up to the lookout; boulders at the foot. Everything stands on the ground and collides with its box.
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { Acc, outcropBlock, shedBlocks, chunk, hex } from './outcrop.js';
import { BLOCKS, MAIN, SMALL, FLIGHTS, height, rng, smooth } from '../../settlements/kakadu/layout.js';

// smooth value noise in 3D, about −1…1, features about one unit
const hash = (i, j, k, s) => { let h = Math.imul(i, 374761393) ^ Math.imul(j, 668265263) ^ Math.imul(k, 2147483647) ^ Math.imul(s | 0, 1274126177); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296 * 2 - 1; };
export function noise3(x, y, z, s = 0) {
  const i = Math.floor(x), j = Math.floor(y), k = Math.floor(z), fx = x - i, fy = y - j, fz = z - k;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = fz * fz * (3 - 2 * fz);
  const L = (a, b, t) => a + (b - a) * t;
  return L(L(L(hash(i, j, k, s), hash(i + 1, j, k, s), u), L(hash(i, j + 1, k, s), hash(i + 1, j + 1, k, s), u), v),
    L(L(hash(i, j, k + 1, s), hash(i + 1, j, k + 1, s), u), L(hash(i, j + 1, k + 1, s), hash(i + 1, j + 1, k + 1, s), u), v), w);
}
/** The geometry from vertex lattice data: positions with smooth normals welded across the lattice. */
function toGeometry(V, tris) {
  const nor = new Float32Array(V.length);
  for (let t = 0; t < tris.length; t += 3) {
    const a = tris[t] * 3, b = tris[t + 1] * 3, c = tris[t + 2] * 3;
    const ux = V[b] - V[a], uy = V[b + 1] - V[a + 1], uz = V[b + 2] - V[a + 2], vx = V[c] - V[a], vy = V[c + 1] - V[a + 1], vz = V[c + 2] - V[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const i of [a, b, c]) { nor[i] += nx; nor[i + 1] += ny; nor[i + 2] += nz; }
  }
  const pos = [], nn = [];
  for (const i of tris) { pos.push(V[i * 3], V[i * 3 + 1], V[i * 3 + 2]); const l = Math.hypot(nor[i * 3], nor[i * 3 + 1], nor[i * 3 + 2]) || 1; nn.push(nor[i * 3] / l, nor[i * 3 + 1] / l, nor[i * 3 + 2] / l); }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new Float32BufferAttribute(nn, 3));
  return g;
}

/** The block list of the plan as geometry and colliders: beds, joints, clefts, scars and honeycomb (outcrop.js). */
export function rockMass(el, { bag, col }) {
  const acc = new Acc();
  for (const B of BLOCKS) {
    outcropBlock(acc, B, { res: B.r[3] > -50 ? 0.55 : 0.9 });
    col.rect(B.r, B.slab ? B.y[0] - 0.55 : B.y[0], B.y[1]);
  }
  shedBlocks(acc);
  acc.flush(bag);
}

// ── the painted surfaces ────────────────────────────────────────────────────────────────────────────────────
/** The shelter's back wall as a surface: z = zb + a low swell; (u, v) = (x, y). */
export const wallZ = (S, x, y) => S.zb + 0.04 * noise3(x * 0.35, y * 0.5, 1.5, 40) + 0.025 * noise3(x * 1.3, y * 1.1, 3.5, 41);
export const ceilY = (S, x, z) => S.yc1 + (S.yc0 - S.yc1) * smooth(S.zl - 0.8, S.zb, z) + 0.05 * noise3(x * 0.3, 2.5, z * 0.4, 42) + 0.025 * noise3(x * 1.4, 1.5, z * 1.2, 43);

function gridSurface(u0, u1, v0, v1, step, F, up) {
  const nu = Math.max(1, Math.round((u1 - u0) / step)), nv = Math.max(1, Math.round((v1 - v0) / step));
  const V = new Float32Array((nu + 1) * (nv + 1) * 3), tris = [];
  for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) { const p = F(u0 + (u1 - u0) * i / nu, v0 + (v1 - v0) * j / nv), k = (i * (nv + 1) + j) * 3; V[k] = p[0]; V[k + 1] = p[1]; V[k + 2] = p[2]; }
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const a = i * (nv + 1) + j, b = (i + 1) * (nv + 1) + j, c = (i + 1) * (nv + 1) + j + 1, d = i * (nv + 1) + j + 1;
    if (up) tris.push(a, b, c, a, c, d); else tris.push(a, c, b, a, d, c);
  }
  return toGeometry(V, tris);
}
/** A smooth wall under the roof and a ceiling over it, as surfaces, for the paintings to lie on. */
export function shelterSurfaces(S, mat, { bag }) {
  // the wall faces +z: u along x (east), v up; wound so that it faces the room
  bag.add(mat, gridSurface(S.x0 - 1, S.x1 + 1, -0.3, S.yc0 + 0.3, 0.35, (x, y) => [x, y, wallZ(S, x, y)], true));
  bag.add(mat, gridSurface(S.x0 - 1, S.x1 + 1, S.zb, S.zl - 0.8, 0.5, (x, z) => [x, ceilY(S, x, z), z], true));
}

// ── the way up ──────────────────────────────────────────────────────────────────────────────────────────────
export function rockSteps(el, { bag, col }) {
  const rand = rng(77), acc = new Acc();
  for (const F of FLIGHTS) {
    const [x0, z0, x1, z1] = F.rect, rise = F.y1 - F.y0, n = Math.max(2, Math.round(rise / 0.2)), L = z1 - z0;
    for (let k = 0; k < n; k++) {
      const top = F.y0 + rise * (k + 1) / n;
      // ascent to the north: the first step at the south end (z1), the last at the north (z0): flat slabs, broken edges, each a little crooked
      const za = z1 - L * (k + 1) / n, zb = z1 - L * k / n;
      const j = (rand() - 0.5) * 0.3, w = 0.12 + rand() * 0.2, c = (rand() - 0.5) * 0.05;
      const C = [[[], []], [[], []]];
      for (let i = 0; i < 2; i++) for (let jj = 0; jj < 2; jj++) for (let kk = 0; kk < 2; kk++) C[i][jj][kk] = [(i ? x1 + w + j * 0.5 : x0 - w + j) + (rand() - 0.5) * 0.08, jj ? top + (jj && i ? c : 0) : top - 0.7, kk ? zb + 0.28 : za - 0.05];
      hex(acc, k % 3 ? 'tuff_red' : 'sandstone_rose', C, { S: { res: 0.5, relief: (x, y, z) => 0.05 * noise3(x * 1.3, y * 1.3, z * 1.3, 100 + k) }, T: { res: 0.6, edge: 0.15, relief: (x, y, z) => 0.012 * noise3(x * 2.1, 0, z * 2.1, 300 + k) }, E: { res: 0.5 }, W: { res: 0.5 } });
    }
    col.ramp(F.rect, F.y0, F.y1, 'n');
  }
  acc.flush(bag);
}

/** Fallen blocks at the foot of the rock: angular, some leaning slabs; each blocks its footprint. */
export function boulders(el, { bag, col }) {
  const rand = rng(31), acc = new Acc();
  for (const b of el.list) {
    const [x, z, s] = b, y = height(x, z), seed = Math.floor(rand() * 1e6), q = rand();
    const mat = q < 0.45 ? 'sandstone_rose' : q < 0.7 ? 'tuff_red' : q < 0.88 ? 'sandstone_yellow' : 'rock_boulder';
    const slab = rand() < 0.3;
    chunk(acc, mat, x, y - 0.25, z, s * (slab ? 2.0 : 1.5), s * (slab ? 0.5 : 1.0 + rand() * 0.4), s * (slab ? 1.5 : 1.3), rand() * 3.14, slab && rand() < 0.5 ? 0.3 : 0, seed);
    col.circle(x, z, s * 0.85, y - 0.4, y + s * 0.7);
  }
  acc.flush(bag);
}
export { MAIN, SMALL };
