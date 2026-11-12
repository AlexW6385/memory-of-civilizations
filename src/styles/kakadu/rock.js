// The sandstone of Ubirr (docs/settlements/kakadu.md §3): blocks of rounded, jointed sandstone built as superellipsoid boxes with bedding
// grooves and vertical joints, stacked into the outlier; the painted wall and the painted ceiling as separate smooth surfaces under the
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
const fbm = (x, y, z, s) => 0.62 * noise3(x, y, z, s) + 0.28 * noise3(x * 2.1, y * 2.1, z * 2.1, s + 7) + 0.1 * noise3(x * 4.3, y * 4.3, z * 4.3, s + 13);

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

/**
 * A rounded block of sandstone: the box [x0, z0, x1, z1] × [y0, y1] as a superellipsoid of exponent n, its faces displaced by noise,
 * grooved along the bedding (horizontal) and the joints (vertical). o: { seed, amp, res, slab (bottom face kept, rounded), groove, shrinkS }.
 */
export function blockGeometry(r, ys, n, o = {}) {
  const seed = o.seed ?? 1, amp = o.amp ?? 0.3, rs = o.res ?? 0.9, groove = o.groove ?? 1;
  const x0 = r[0], x1 = r[2], z0 = r[1], z1 = r[3] - (o.shrinkS ?? 0), y0 = ys[0], y1 = ys[1];
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, cy = (y0 + y1) / 2, hx = (x1 - x0) / 2, hz = (z1 - z0) / 2, hy = (y1 - y0) / 2;
  const NX = Math.max(2, Math.round((x1 - x0) / rs)), NY = Math.max(2, Math.round((y1 - y0) / rs)), NZ = Math.max(2, Math.round((z1 - z0) / rs));
  const id = (ix, iy, iz) => (ix * (NY + 1) + iy) * (NZ + 1) + iz;
  const V = new Float32Array((NX + 1) * (NY + 1) * (NZ + 1) * 3), used = new Uint8Array((NX + 1) * (NY + 1) * (NZ + 1));
  const bed = 1.15 + (seed % 5) * 0.12, ph = seed * 0.37;
  const vert = (ix, iy, iz) => {
    const k = id(ix, iy, iz);
    if (used[k]) return k;
    used[k] = 1;
    const ux = 2 * ix / NX - 1, uy = 2 * iy / NY - 1, uz = 2 * iz / NZ - 1;
    const tx = Math.abs(ux) ** n, tz = Math.abs(uz) ** n, ty = (uy > 0 || o.slab ? Math.abs(uy) ** n : 0);
    const s = 1 / (tx + ty + tz) ** (1 / n);
    let px = ux * s, py = uy * s, pz = uz * s;
    let X = cx + px * hx, Y = cy + py * hy, Z = cz + pz * hz;
    // the face this vertex mainly lies on: its displacement (the top is kept flatter, to be walked)
    const top = uy > 0.98 && !o.slab, ex = Math.abs(ux) > 0.98, ez = Math.abs(uz) > 0.98;
    const gx = Math.sign(px) * Math.abs(px) ** (n - 1), gy = (py > 0 || o.slab ? Math.sign(py) * Math.abs(py) ** (n - 1) : 0), gz = Math.sign(pz) * Math.abs(pz) ** (n - 1);
    const gl = Math.hypot(gx, gy, gz) || 1;
    let d = amp * fbm(X * 0.23, Y * 0.23, Z * 0.23, seed) * (top ? 0.45 : 1) + 0.5 * amp * noise3(X * 0.9, Y * 0.9, Z * 0.9, seed + 3);
    if (groove && !top) {
      // the bedding planes: shallow horizontal steps; the joints: narrow vertical cracks
      const b = ((Y / bed + ph) % 1 + 1) % 1;
      d -= 0.32 * groove * smooth(0.0, 0.07, b) * (1 - smooth(0.07, 0.14, b)) * (0.5 + 0.5 * noise3(X * 0.3, 0, Z * 0.3, seed + 5));
      if (ez) { const j = ((X / 6.3 + seed * 0.13) % 1 + 1) % 1; d -= 0.4 * groove * (1 - smooth(0.0, 0.025, Math.min(j, 1 - j))) * (0.4 + 0.6 * noise3(0, Y * 0.2, X * 0.2, seed + 9)); }
      if (ex) { const j = ((Z / 5.1 + seed * 0.21) % 1 + 1) % 1; d -= 0.4 * groove * (1 - smooth(0.0, 0.03, Math.min(j, 1 - j))) * (0.4 + 0.6 * noise3(0, Y * 0.2, Z * 0.2, seed + 11)); }
    }
    X += gx / gl * d; Y += gy / gl * d; Z += gz / gl * d;
    V[k * 3] = X; V[k * 3 + 1] = Y; V[k * 3 + 2] = Z;
    return k;
  };
  const tris = [];
  const face = (axis, sgn, na, nb) => {
    // a grid on the face with the given axis fixed at its extreme; counter-clockwise seen from outside
    for (let a = 0; a < na; a++) for (let b = 0; b < nb; b++) {
      const idx = (aa, bb) => (axis === 0 ? vert(sgn > 0 ? NX : 0, aa, bb) : axis === 1 ? vert(aa, sgn > 0 ? NY : 0, bb) : vert(aa, bb, sgn > 0 ? NZ : 0));
      const p = idx(a, b), q = idx(a + 1, b), r2 = idx(a + 1, b + 1), s = idx(a, b + 1);
      // orientation by axis parity
      const flip = (axis === 1) !== (sgn > 0) ? false : true;
      if (axis === 0) { if (sgn > 0) tris.push(p, q, r2, p, r2, s); else tris.push(p, r2, q, p, s, r2); }
      else if (axis === 1) { if (sgn > 0) tris.push(p, r2, q, p, s, r2); else tris.push(p, q, r2, p, r2, s); }
      else { if (sgn > 0) tris.push(p, q, r2, p, r2, s); else tris.push(p, r2, q, p, s, r2); }
      void flip;
    }
  };
  // axis 0 (x): a over y, b over z; axis 1 (y): a over x, b over z; axis 2 (z): a over x, b over y
  face(0, 1, NY, NZ); face(0, -1, NY, NZ); face(1, 1, NX, NZ); if (o.slab) face(1, -1, NX, NZ); face(2, 1, NX, NY); face(2, -1, NX, NY);
  return toGeometry(V, tris);
}
export const outwardFix = (g) => g;

/** The tones of the beds, by the block's own stone: the pink and buff sandstone is banded with iron-stained dark red and pale beds. */
const BANDS = {
  sandstone_rose: ['sandstone_rose', 'sandstone_rose', 'tuff_red', 'sandstone_yellow', 'sandstone_rose', 'sandstone_white'],
  sandstone_yellow: ['sandstone_yellow', 'sandstone_yellow', 'sandstone_rose', 'sandstone_white', 'sandstone_yellow', 'tuff_red'],
  sandstone_white: ['sandstone_white', 'sandstone_yellow', 'sandstone_white', 'sandstone_rose'],
  tuff_red: ['tuff_red', 'sandstone_rose', 'tuff_red', 'sandstone_rose', 'tuff_red'],
};
/**
 * A big block built as the real outcrop is: not one rounded loaf but beds of sandstone, each its own rounded block, some set back (the soft
 * beds weather in, so the hard bed above hangs over them), broken along the joints into segments of a few metres whose faces stand at
 * different depths, the topmost bed with a broken skyline; the bands of tone follow the beds. Only the south faces and the lip are made
 * fine; the mass behind is left to the block's own (coarse) core.
 */
function bedded(B, bag, res) {
  const rand = rng(B.seed * 31 + 7), [x0, z0, x1, z1] = B.r, [y0, y1] = B.y, H = y1 - y0, bands = BANDS[B.m] ?? [B.m];
  const nb = B.beds ?? Math.max(2, Math.round(H / (B.slab ? 2.2 : 1.9))), deep = Math.min(z1 - z0, B.slab ? 14 : 15);
  const soft = Array.from({ length: nb }, (_, i) => (i === 0 && B.panel ? 0.75 : rand() < 0.4 ? 0.5 + rand() * 1.1 : rand() * 0.25));
  const shift = rand() * 3;
  for (let i = 0; i < nb; i++) {
    const yA = y0 + H * i / nb - (i ? 0.3 : 0), yB = y0 + H * (i + 1) / nb + (i < nb - 1 ? 0.12 : 0);
    const mat = bands[(i + (B.seed % 3)) % bands.length], top = i === nb - 1, low = !!B.panel && yA < 4.4;   // (low beds stay well behind the painted wall's surface)
    // the joints: segment edges a few metres apart, the bed's own offset from the block's ends
    let x = x0 + (i % 2 ? 0 : rand() * 0.8);
    const xe = x1 - (i % 3 ? 0 : rand() * 0.8);
    while (x < xe - 1) {
      const w = Math.min(xe - x, 4 + rand() * 4.5 + shift * 0.2), zf = z1 - (low ? Math.max(soft[i], 0.9) : soft[i]) - rand() * (low ? 0.15 : 0.55), hy = top ? (rand() - 0.5) * 0.3 : 0;
      const xs1 = xe - x - w < 2 ? xe : x + w;
      bag.add(mat, blockGeometry([x, zf - deep, xs1, zf], [yA, yB + hy], B.slab ? 4.2 : 4.6, { seed: B.seed * 13 + i * 7 + Math.floor(x), amp: low ? 0.1 : B.slab ? 0.16 : 0.22, res, slab: i > 0 || !!B.slab, groove: low ? 0.3 : 0.7 }));
      x = xs1;
    }
  }
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
