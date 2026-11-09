// Ming Jiangnan: the garden's stone and water edge (docs/settlements/ming-suzhou.md §5–§6).
//   · Taihu stone, built as a solid whose surface is carved the way the lake carves it: tall,
//     thin, wrinkled, pierced by true through-holes and eaten into hollows (the four qualities
//     shou, lou, tou, zhou); its mesh is extracted from a distance field (surface nets) so that
//     holes are holes. Prototypes are built once per shape and level of detail and placed as
//     instances (GeoBag.addInstance), so a hundred stones cost a dozen shapes.
//   · the revetment (bo an) of rubble stone along the pond and island shores.
//   · lotus and water-lily leaves, flowers, buds and seed pods.
//   · Suzhou pebble-mosaic paving (hua jie pu di): coin, plum blossom, crane, lotus, hexagon.
// Pure geometry; imports three.js only through src/core/three.js.

import { BufferGeometry, Float32BufferAttribute, Matrix4, Quaternion, Vector3 } from '../../core/three.js';
import { fromTriangles } from '../../core/geom.js';

export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const smin = (a, b, k) => { const h = clamp(0.5 + 0.5 * (b - a) / k, 0, 1); return b + (a - b) * h - k * h * (1 - h); };
const smax = (a, b, k) => -smin(-a, -b, k);

// ── value noise ─────────────────────────────────────────────────────────────
function hash3(x, y, z) {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
/** Smooth 3-D value noise in [−1, 1]. */
function vn3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  let u = x - xi, v = y - yi, w = z - zi;
  u = u * u * (3 - 2 * u); v = v * v * (3 - 2 * v); w = w * w * (3 - 2 * w);
  const a = hash3(xi, yi, zi), b = hash3(xi + 1, yi, zi), c = hash3(xi, yi + 1, zi), d = hash3(xi + 1, yi + 1, zi);
  const e = hash3(xi, yi, zi + 1), f = hash3(xi + 1, yi, zi + 1), g = hash3(xi, yi + 1, zi + 1), h = hash3(xi + 1, yi + 1, zi + 1);
  const x0 = a + (b - a) * u, x1 = c + (d - c) * u, x2 = e + (f - e) * u, x3 = g + (h - g) * u;
  const y0 = x0 + (x1 - x0) * v, y1 = x2 + (x3 - x2) * v;
  return (y0 + (y1 - y0) * w) * 2 - 1;
}

// ── surface nets: a triangle mesh of {sdf < 0} ──────────────────────────────
function surfaceNets(sdf, lo, hi, cell) {
  const nx = Math.max(3, Math.ceil((hi[0] - lo[0]) / cell)), ny = Math.max(3, Math.ceil((hi[1] - lo[1]) / cell)), nz = Math.max(3, Math.ceil((hi[2] - lo[2]) / cell));
  const sx = (hi[0] - lo[0]) / nx, sy = (hi[1] - lo[1]) / ny, sz = (hi[2] - lo[2]) / nz;
  const X = nx + 1, Y = ny + 1, Z = nz + 1, val = new Float32Array(X * Y * Z);
  const si = (i, j, k) => i + X * (j + Y * k);
  for (let k = 0; k < Z; k++) for (let j = 0; j < Y; j++) for (let i = 0; i < X; i++) val[si(i, j, k)] = sdf(lo[0] + i * sx, lo[1] + j * sy, lo[2] + k * sz);
  const vid = new Int32Array(nx * ny * nz).fill(-1), P = [];
  const ci = (i, j, k) => i + nx * (j + ny * k);
  const EDGES = [];
  for (let c = 0; c < 8; c++) for (let a = 0; a < 3; a++) if (!(c & (1 << a))) EDGES.push([c, c | (1 << a)]);
  const cv = new Float32Array(8);
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    let mask = 0;
    for (let c = 0; c < 8; c++) { cv[c] = val[si(i + (c & 1), j + ((c >> 1) & 1), k + ((c >> 2) & 1))]; if (cv[c] < 0) mask |= 1 << c; }
    if (mask === 0 || mask === 255) continue;
    let ax = 0, ay = 0, az = 0, n = 0;
    for (const [c0, c1] of EDGES) {
      if ((cv[c0] < 0) === (cv[c1] < 0)) continue;
      const t = cv[c0] / (cv[c0] - cv[c1]);
      const x0 = c0 & 1, y0 = (c0 >> 1) & 1, z0 = (c0 >> 2) & 1, x1 = c1 & 1, y1 = (c1 >> 1) & 1, z1 = (c1 >> 2) & 1;
      ax += x0 + (x1 - x0) * t; ay += y0 + (y1 - y0) * t; az += z0 + (z1 - z0) * t; n++;
    }
    vid[ci(i, j, k)] = P.length / 3;
    P.push(lo[0] + (i + ax / n) * sx, lo[1] + (j + ay / n) * sy, lo[2] + (k + az / n) * sz);
  }
  // normals from the field's gradient
  const N = new Float32Array(P.length), e = Math.min(sx, sy, sz) * 0.6;
  for (let v = 0; v < P.length; v += 3) {
    const x = P[v], y = P[v + 1], z = P[v + 2];
    const gx = sdf(x + e, y, z) - sdf(x - e, y, z), gy = sdf(x, y + e, z) - sdf(x, y - e, z), gz = sdf(x, y, z + e) - sdf(x, y, z - e);
    const l = Math.hypot(gx, gy, gz) || 1; N[v] = gx / l; N[v + 1] = gy / l; N[v + 2] = gz / l;
  }
  const I = [];
  const quadAt = (a, b, c, d) => {
    if (a < 0 || b < 0 || c < 0 || d < 0) return;
    // split along the shorter diagonal
    const dAC = Math.hypot(P[a * 3] - P[c * 3], P[a * 3 + 1] - P[c * 3 + 1], P[a * 3 + 2] - P[c * 3 + 2]);
    const dBD = Math.hypot(P[b * 3] - P[d * 3], P[b * 3 + 1] - P[d * 3 + 1], P[b * 3 + 2] - P[d * 3 + 2]);
    const tris = dAC <= dBD ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]];
    for (const [p, q, r] of tris) {
      const ux = P[q * 3] - P[p * 3], uy = P[q * 3 + 1] - P[p * 3 + 1], uz = P[q * 3 + 2] - P[p * 3 + 2];
      const wx = P[r * 3] - P[p * 3], wy = P[r * 3 + 1] - P[p * 3 + 1], wz = P[r * 3 + 2] - P[p * 3 + 2];
      const cx = uy * wz - uz * wy, cy = uz * wx - ux * wz, cz = ux * wy - uy * wx;
      const dot = cx * (N[p * 3] + N[q * 3] + N[r * 3]) + cy * (N[p * 3 + 1] + N[q * 3 + 1] + N[r * 3 + 1]) + cz * (N[p * 3 + 2] + N[q * 3 + 2] + N[r * 3 + 2]);
      if (dot >= 0) I.push(p, q, r); else I.push(p, r, q);
    }
  };
  for (let k = 0; k < Z; k++) for (let j = 0; j < Y; j++) for (let i = 0; i < X; i++) {
    const v0 = val[si(i, j, k)] < 0;
    if (i < nx && j > 0 && k > 0 && j < ny && k < nz && v0 !== (val[si(i + 1, j, k)] < 0)) quadAt(vid[ci(i, j - 1, k - 1)], vid[ci(i, j, k - 1)], vid[ci(i, j, k)], vid[ci(i, j - 1, k)]);
    if (j < ny && i > 0 && k > 0 && i < nx && k < nz && v0 !== (val[si(i, j + 1, k)] < 0)) quadAt(vid[ci(i - 1, j, k - 1)], vid[ci(i, j, k - 1)], vid[ci(i, j, k)], vid[ci(i - 1, j, k)]);
    if (k < nz && i > 0 && j > 0 && i < nx && j < ny && v0 !== (val[si(i, j, k + 1)] < 0)) quadAt(vid[ci(i - 1, j - 1, k)], vid[ci(i, j - 1, k)], vid[ci(i, j, k)], vid[ci(i - 1, j, k)]);
  }
  // drop what the field left as islands (a shard off a thin crown): keep the pieces that are a fair part of the biggest
  const par = new Int32Array(P.length / 3).map((_, i) => i), find = (a) => { while (par[a] !== a) { par[a] = par[par[a]]; a = par[a]; } return a; };
  for (let i = 0; i < I.length; i += 3) { par[find(I[i + 1])] = find(I[i]); par[find(I[i + 2])] = find(I[i]); }
  const cnt = new Map(); for (let i = 0; i < I.length; i += 3) { const r = find(I[i]); cnt.set(r, (cnt.get(r) || 0) + 1); }
  const big = Math.max(...cnt.values()), I2 = [];
  for (let i = 0; i < I.length; i += 3) if (cnt.get(find(I[i])) >= big * 0.2) I2.push(I[i], I[i + 1], I[i + 2]);
  return { P, N, I: I2 };
}

// ── a Taihu stone as a distance field ───────────────────────────────────────
const BASE = -0.3;                   // the stone's foot, buried
function profile(t, ph, ph2) {
  const tc = clamp(t, 0, 1);
  const body = 0.6 + 0.4 * Math.sin(Math.PI * (0.05 + 0.9 * Math.min(1, tc * 1.05)));
  const waist = 1 + 0.26 * Math.sin(tc * Math.PI * 2.3 + ph) + 0.11 * Math.sin(tc * Math.PI * 5.1 + ph2);
  return body * waist * Math.sqrt(Math.max(0, 1 - Math.pow(tc, 5)));
}

/**
 * The description of one stone: its lobes (the peaks), the tunnels bored through it, the hollows
 * worn into it. kind: spire | peak | twin | low | knob | slab | arch | lintel.
 */
function makeStone(kind, seed) {
  const r = rng(seed * 7919 + 13), R = (a, b) => a + (b - a) * r();
  const lobes = [], tunnels = [], pits = [];
  const lobe = (x0, z0, h, a, b, lx, lz) => lobes.push({ x0, z0, hh: h - BASE, a, b, lx, lz, ph: R(0, 6.28), ph2: R(0, 6.28), wx: R(0, 6.28), wz: R(0, 6.28) });
  let H, nT, nP;
  const sg = () => (r() < 0.5 ? -1 : 1);
  switch (kind) {
    case 'spire': H = R(3.0, 3.5); lobe(0, 0, H, R(0.42, 0.5), R(0.19, 0.23), R(-0.06, 0.06), R(-0.03, 0.03));
      lobe(sg() * R(0.26, 0.38), R(-0.04, 0.04), H * R(0.55, 0.72), 0.25, 0.18, R(-0.05, 0.1), 0);
      if (r() < 0.6) lobe(sg() * R(0.36, 0.5), R(-0.04, 0.04), H * R(0.35, 0.5), 0.22, 0.17, 0, 0);
      nT = 10; nP = 7; break;
    case 'peak': H = R(1.9, 2.4); lobe(0, 0, H, R(0.44, 0.52), R(0.2, 0.25), R(-0.07, 0.07), R(-0.03, 0.03));
      lobe(sg() * R(0.3, 0.42), R(-0.04, 0.04), H * R(0.5, 0.7), 0.24, 0.19, R(-0.05, 0.08), 0);
      nT = 7; nP = 6; break;
    case 'twin': H = R(1.5, 1.9); lobe(-0.34, 0, H, 0.3, 0.25, 0.05, 0); lobe(0.33, R(-0.04, 0.04), H * R(0.72, 0.9), 0.28, 0.24, -0.04, 0);
      nT = 2; nP = 5; break;
    case 'low': H = R(0.95, 1.25); lobe(-0.44, 0, H * 0.62, 0.34, 0.27, 0, 0); lobe(0, R(-0.05, 0.05), H, 0.4, 0.28, R(-0.05, 0.05), 0); lobe(0.5, 0, H * 0.78, 0.32, 0.25, 0, 0);
      nT = 5; nP = 5; break;
    case 'knob': H = R(0.55, 0.8); lobe(0, 0, H, 0.42, 0.3, R(-0.08, 0.08), 0); nT = 2; nP = 3; break;
    case 'slab': H = R(0.55, 0.75); lobe(-0.45, 0, H, 0.55, 0.3, 0, 0); lobe(0.42, 0.02, H * 0.72, 0.48, 0.28, 0, 0); nT = 2; nP = 3; break;
    case 'arch': H = R(1.1, 1.4); lobe(0, 0, H, 0.8, 0.34, 0, 0); nT = 2; nP = 4;
      tunnels.push({ x: R(-0.1, 0.1), y: H * 0.38, z: 0, dx: 0, dy: 0, dz: 1, len: 2, r0: 0.27, ph: R(0, 6.28) }); break;
    case 'lintel': H = 0.5; lobe(0, 0, H, 1.9, 0.36, 0, 0); nT = 1; nP = 4; break;
    default: H = 1; lobe(0, 0, H, 0.4, 0.3, 0, 0); nT = 1; nP = 2;
  }
  const lw = (L, y) => profile((y - BASE) / L.hh, L.ph, L.ph2);
  const lcx = (L, y) => L.x0 + L.lx * clamp((y - BASE) / L.hh, 0, 1) * L.hh + 0.04 * Math.sin(y * 3.1 + L.wx);
  const lcz = (L, y) => L.z0 + L.lz * clamp((y - BASE) / L.hh, 0, 1) * L.hh + 0.03 * Math.sin(y * 2.3 + L.wz);
  // tunnels: mostly through the thin way (z), some across a neck
  for (let k = 0; k < nT; k++) {
    const L = lobes[Math.min(lobes.length - 1, Math.floor(r() * lobes.length))];
    const y = BASE + L.hh * R(0.2, 0.82), w = lw(L, y), alongX = kind !== 'lintel' && r() < 0.2;
    let dx = alongX ? 1 : R(-0.4, 0.4), dy = R(-0.3, 0.3), dz = alongX ? R(-0.3, 0.3) : 1;
    const l = Math.hypot(dx, dy, dz); dx /= l; dy /= l; dz /= l;
    const room = alongX ? L.b * w : L.a * w;
    tunnels.push({ x: lcx(L, y) + (alongX ? 0 : R(-0.35, 0.35) * L.a * w), y, z: lcz(L, y), dx, dy, dz, len: 2.2, r0: Math.min(R(0.1, 0.26), room * 0.44), ph: R(0, 6.28) });
  }
  for (let k = 0; k < nP; k++) {
    const L = lobes[Math.min(lobes.length - 1, Math.floor(r() * lobes.length))];
    const y = BASE + L.hh * R(0.12, 0.92), w = lw(L, y), th = R(0, 6.28), pr = R(0.07, 0.17);
    pits.push({ x: lcx(L, y) + Math.cos(th) * L.a * w * 1.0, y, z: lcz(L, y) + Math.sin(th) * L.b * w * 1.0, r: pr });
  }
  const kf = 3 + Math.floor(r() * 3), pg = R(0, 6.28), s1 = R(0, 50), s2 = R(0, 50);
  const L0 = lobes[0];
  const sdf = (x, y, z) => {
    let d = 1e9;
    for (let i = 0; i < lobes.length; i++) {
      const L = lobes[i], t = (y - BASE) / L.hh, w = Math.max(0.02, profile(t, L.ph, L.ph2));
      const dx = (x - lcx(L, y)) / (L.a * w), dz = (z - lcz(L, y)) / (L.b * w);
      let di = (Math.hypot(dx, dz) - 1) * Math.sqrt(L.a * L.b) * w * 0.85;
      di = Math.max(di, y - (BASE + L.hh));
      d = i === 0 ? di : smin(d, di, 0.16);
    }
    for (let i = 0; i < tunnels.length; i++) {
      const T = tunnels[i], px = x - T.x, py = y - T.y, pz = z - T.z;
      const t = clamp(px * T.dx + py * T.dy + pz * T.dz, -T.len / 2, T.len / 2);
      const qx = px - T.dx * t, qy = py - T.dy * t, qz = pz - T.dz * t;
      const rr = T.r0 * (1 + 0.3 * Math.sin(t * 4.2 + T.ph) + 0.12 * vn3(x * 5 + T.ph, y * 5, z * 5));
      d = smax(d, -(Math.hypot(qx, qy, qz) - rr), 0.05);
    }
    for (let i = 0; i < pits.length; i++) {
      const P = pits[i];
      d = smax(d, -(Math.hypot(x - P.x, y - P.y, z - P.z) - P.r), 0.07);
    }
    // the wrinkles: folds winding up the stone, and the roughness of the water's work
    const th = Math.atan2(z - L0.z0, x - L0.x0);
    d += 0.022 * Math.sin(th * kf + y * 2.4 + pg) * Math.min(1, Math.max(0, 1 - Math.abs(y - H * 0.5) / (H * 0.7 + 0.3)));
    d += 0.03 * vn3(x * 3.2 + s1, y * 3.2, z * 3.2 + s2) + 0.014 * vn3(x * 7.5 + s2, y * 7.5 + s1, z * 7.5);
    return Math.max(d, BASE - y);
  };
  // where it is hollowed: the walls of the tunnels, the pits, patches the water has dug out
  const hollow = (x, y, z) => {
    for (let i = 0; i < tunnels.length; i++) {
      const T = tunnels[i], px = x - T.x, py = y - T.y, pz = z - T.z;
      const t = clamp(px * T.dx + py * T.dy + pz * T.dz, -T.len / 2, T.len / 2);
      if (Math.hypot(px - T.dx * t, py - T.dy * t, pz - T.dz * t) < T.r0 * 1.75) return true;
    }
    for (let i = 0; i < pits.length; i++) if (Math.hypot(x - pits[i].x, y - pits[i].y, z - pits[i].z) < pits[i].r * 1.4) return true;
    return vn3(x * 5.5 + s2, y * 5.5, z * 5.5 + s1) < -0.5;
  };
  // the bounds
  let bx = 0, bz = 0;
  for (const L of lobes) { bx = Math.max(bx, Math.abs(L.x0) + L.a * 1.55 + Math.abs(L.lx) * L.hh * 0.5 + 0.1); bz = Math.max(bz, Math.abs(L.z0) + L.b * 1.55 + Math.abs(L.lz) * L.hh * 0.5 + 0.1); }
  return { kind, H, sdf, hollow, bx, bz };
}

/** The stone shapes of the garden (kind, seed): the library from which every stone is taken. */
export const STONES = [
  ['spire', 1], ['spire', 2], ['peak', 3], ['peak', 4], ['peak', 5], ['twin', 6], ['twin', 7], ['low', 8], ['low', 9], ['low', 10],
  ['knob', 11], ['knob', 12], ['slab', 13], ['arch', 14], ['lintel', 15],
];
const CACHE = new Map();
function nonIndexed(P, N, I) {
  const pos = new Float32Array(I.length * 3), nor = new Float32Array(I.length * 3);
  I.forEach((v, i) => { pos[i * 3] = P[v * 3]; pos[i * 3 + 1] = P[v * 3 + 1]; pos[i * 3 + 2] = P[v * 3 + 2]; nor[i * 3] = N[v * 3]; nor[i * 3 + 1] = N[v * 3 + 1]; nor[i * 3 + 2] = N[v * 3 + 2]; });
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  return g;
}
/**
 * The geometry of stone shape v at a level of detail (lod 0: near, fine; 1: far, coarse), in two
 * parts: the pale body and the darker hollows ({ body, hollow, H }), cached.
 */
export function stoneParts(v, lod = 1) {
  const key = `${v}/${lod}`;
  if (CACHE.has(key)) return CACHE.get(key);
  const [kind, seed] = STONES[((v % STONES.length) + STONES.length) % STONES.length];
  const S = makeStone(kind, seed);
  // the grid coarsens until the stone is within its triangle budget (near 1.5 k, far 400): the holes that survive are the big ones
  const target = lod === 0 ? 1500 : 400;
  let cell = lod === 0 ? Math.max(0.075, S.H * 0.05) : Math.max(0.16, S.H * 0.1), net;
  for (let it = 0; it < 16; it++) {
    net = surfaceNets(S.sdf, [-S.bx, BASE - cell * 1.5, -S.bz], [S.bx, S.H + cell * 2.5, S.bz], cell);
    if (net.I.length / 3 <= target) break;
    cell *= 1.1;
  }
  const { P, N, I } = net;
  const a = [], b = [];
  for (let i = 0; i < I.length; i += 3) {
    const cx = (P[I[i] * 3] + P[I[i + 1] * 3] + P[I[i + 2] * 3]) / 3, cy = (P[I[i] * 3 + 1] + P[I[i + 1] * 3 + 1] + P[I[i + 2] * 3 + 1]) / 3, cz = (P[I[i] * 3 + 2] + P[I[i + 1] * 3 + 2] + P[I[i + 2] * 3 + 2]) / 3;
    (S.hollow(cx, cy, cz) ? b : a).push(I[i], I[i + 1], I[i + 2]);
  }
  const out = { body: nonIndexed(P, N, a), hollow: b.length ? nonIndexed(P, N, b) : null, H: S.H, kind, bx: S.bx, bz: S.bz };
  CACHE.set(key, out);
  return out;
}

const _m = new Matrix4(), _q = new Quaternion(), _q1 = new Quaternion(), _q2 = new Quaternion(), _p = new Vector3(), _s = new Vector3();
const AX = new Vector3(1, 0, 0), AY = new Vector3(0, 1, 0), AZ = new Vector3(0, 0, 1);
/** A placement matrix: position, yaw, a lean (tilt about x and z, radians), uniform scale. */
export function placement(x, y, z, yaw, s, tx = 0, tz = 0) {
  _q.setFromAxisAngle(AY, yaw); _q1.setFromAxisAngle(AX, tx); _q2.setFromAxisAngle(AZ, tz); _q.multiply(_q1).multiply(_q2);
  return _m.compose(_p.set(x, y, z), _q, _s.set(s, s, s)).clone();
}
/**
 * Place stone shape v at (x, y, z): as instances where the bag can (the pale body in the 'taihu'
 * material lightened, standing in 'granite_rough' when merged; the hollows in 'taihu').
 */
export function putStone(bag, v, lod, m) {
  const P = stoneParts(v, lod);
  const body = P.body, hol = P.hollow;
  if (bag.addInstance) {
    bag.addInstance('taihu', body.clone(), m, { color: [1.42, 1.42, 1.4], real: 'granite_rough', reach: 420 });
    if (hol) bag.addInstance('taihu', hol.clone(), m, { reach: 420 });
  } else {
    bag.add('granite_rough', body.clone().applyMatrix4(m));
    if (hol) bag.add('taihu', hol.clone().applyMatrix4(m));
  }
}
/** The same, merged into one geometry in a given matrix (a stone stretched or turned as one piece, not instanced). */
export function stoneMerged(v, lod, m) {
  const P = stoneParts(v, lod), parts = [P.body, P.hollow].filter(Boolean).map((g) => g.clone().applyMatrix4(m));
  const n = parts.reduce((a, g) => a + g.attributes.position.count, 0), pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
  let o = 0;
  for (const g of parts) { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); o += g.attributes.position.count; }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  return g;
}

// ── rubble ──────────────────────────────────────────────────────────────────
/**
 * One rubble stone of a revetment: a roughly squared block with chamfered, uneven top, from the
 * foot yb up to yt, centred (x, z), long axis along angle `ang`, length L, width W.
 */
export function rubble(out, x, z, ang, L, W, yb, yt, rand) {
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const at = (u, v, y) => [x + u * ca - v * sa, y, z + u * sa + v * ca];
  const j = (m) => (rand() - 0.5) * m;
  const hu = L / 2, hv = W / 2;
  const B = [[-hu * 0.92, -hv * 0.9], [hu * 0.92, -hv * 0.9], [hu * 0.92, hv * 0.9], [-hu * 0.92, hv * 0.9]].map(([u, v]) => at(u + j(0.06), v + j(0.05), yb));
  const T = [[-hu, -hv], [hu, -hv], [hu, hv], [-hu, hv]].map(([u, v]) => at(u * 0.94 + j(0.06), v * 0.94 + j(0.05), yt - 0.02 + j(0.07)));
  const ctr = at(j(0.1), j(0.08), yt + 0.03 + rand() * 0.05);
  for (let i = 0; i < 4; i++) {
    const k = (i + 1) % 4;
    out.push(...B[i], ...B[k], ...T[k], ...B[i], ...T[k], ...T[i]);
    out.push(...T[i], ...T[k], ...ctr);
  }
}
/** Make every triangle of a rubble list face out of the stone (rubble() is wound one way; this returns the two-sided safe copy). */
export function faceOut(tris, cx, cy, cz) {
  const o = [];
  for (let i = 0; i < tris.length; i += 9) {
    const ax = tris[i], ay = tris[i + 1], az = tris[i + 2], bx = tris[i + 3], by = tris[i + 4], bz = tris[i + 5], dx = tris[i + 6], dy = tris[i + 7], dz = tris[i + 8];
    const nx = (dx - bx) * 0 + ((dy - by) * (az - bz) - (dz - bz) * (ay - by)), ny = (dz - bz) * (ax - bx) - (dx - bx) * (az - bz), nz = (dx - bx) * (ay - by) - (dy - by) * (ax - bx);
    const mx = (ax + bx + dx) / 3 - cx, my = (ay + by + dy) / 3 - cy, mz = (az + bz + dz) / 3 - cz;
    if (nx * mx + ny * my + nz * mz >= 0) o.push(ax, ay, az, bx, by, bz, dx, dy, dz); else o.push(ax, ay, az, dx, dy, dz, bx, by, bz);
  }
  return o;
}

// ── lotus and water lilies ──────────────────────────────────────────────────
const TAU = Math.PI * 2;
/** A leaf of unit radius: polar grid, cupped (or floating and rippled), double-sided by the material; notch: a wedge cut out (a water lily's). */
function leafGeometry(cup, ripple, seed, notch = false) {
  const r = rng(seed * 31 + 7), ph = r() * TAU, ph2 = r() * TAU, NS = 16, NR = 4, dip = r() * TAU;
  const at = (i, k) => {
    const rho = i / NR, th = k / NS * TAU, edge = 1 + 0.07 * Math.sin(th * 3 + ph) + 0.04 * Math.sin(th * 5 + ph2);
    const rad = rho * edge;
    const y = cup * Math.pow(rho, 2.2) - 0.05 * (1 - rho) * (1 - rho) + ripple * Math.pow(rho, 2) * (Math.sin(th * 5 + ph) * 0.6 + Math.sin(th * 8 + ph2) * 0.4)
      - cup * 0.5 * Math.pow(rho, 3) * Math.max(0, Math.cos(th - dip)) ** 6;
    return [Math.cos(th) * rad, y, Math.sin(th) * rad];
  };
  const t = [];
  for (let k = 0; k < NS; k++) {
    if (notch && k === 0) continue;
    for (let i = 0; i < NR; i++) {
      const a = at(i, k), b = at(i, k + 1), c = at(i + 1, k + 1), d = at(i + 1, k);
      if (i === 0) t.push(...a, ...d, ...c); else t.push(...a, ...d, ...c, ...a, ...c, ...b);
    }
  }
  // the centre must not be degenerate: the i = 0 ring is a point, so those fans are single triangles (a, d, c)
  const g = fromTriangles(t);
  return g;
}
/** A flower: rings of petals around a golden receptacle; open: spread (0..1), petals per ring. */
function petalTris(out, ang, r0, len, wid, tilt, cupBend) {
  const ca = Math.cos(ang), sa = Math.sin(ang), rows = 3;
  const pt = (t, side) => {
    const w = wid * Math.pow(Math.sin(Math.PI * (0.1 + 0.9 * t)), 0.75) * side;
    const a = tilt + cupBend * t;                       // the petal curls toward its tip
    const rad = r0 + len * t * Math.cos(a), y = len * t * Math.sin(a);
    return [rad * ca - w * sa, y, rad * sa + w * ca];
  };
  const rowsP = []; for (let i = 0; i <= rows; i++) rowsP.push([pt(i / rows, -1), pt(i / rows, 0), pt(i / rows, 1)]);
  for (let i = 0; i < rows; i++) for (let j = 0; j < 2; j++) {
    const a = rowsP[i][j], b = rowsP[i][j + 1], c = rowsP[i + 1][j + 1], d = rowsP[i + 1][j];
    out.push(...a, ...b, ...c, ...a, ...c, ...d);
    out.push(...a, ...c, ...b, ...a, ...d, ...c);        // (and the back)
  }
}
const FLO = new Map();
/** Lotus flower shapes in unit size (~0.2 across): 'open', 'half', 'bud', 'pod', 'lily'. */
function flowerParts(kind, v = 0) {
  const key = kind + v;
  if (FLO.has(key)) return FLO.get(key);
  const r = rng(kind.length * 977 + 5), pet = [], mid = [], out = {};
  if (kind === 'open' || kind === 'half') {
    const open = kind === 'open' ? 1 : 0.45;
    const rings = [[7, 0.03, 0.17, 0.07, 1.0 * open + 0.12, 0.7], [5, 0.025, 0.14, 0.065, 0.55 * open + 0.1, 0.65]];
    rings.forEach(([n, r0, len, wid, tilt, bend], i) => { const off = r() * TAU; for (let k = 0; k < n; k++) petalTris(pet, off + k / n * TAU + i * 0.4, r0, len, wid, tilt, bend * (kind === 'open' ? 1 : -0.3)); });
    // the receptacle (a flat cone with its seeds) and the ring of stamens
    const rc = [], R0 = 0.035;
    for (let k = 0; k < 8; k++) { const a = k / 8 * TAU, b = (k + 1) / 8 * TAU; rc.push(0, 0.05, 0, Math.cos(a) * R0, 0.035, Math.sin(a) * R0, Math.cos(b) * R0, 0.035, Math.sin(b) * R0); }
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU, b = (k + 1) / 12 * TAU; mid.push(Math.cos(a) * 0.075, 0.04, Math.sin(a) * 0.075, Math.cos(a) * 0.06, 0.1, Math.sin(a) * 0.06, Math.cos(b) * 0.06, 0.1, Math.sin(b) * 0.06); }
    out.mid = fromTriangles(rc.concat(mid.length ? mid : []));
  } else if (kind === 'bud') {
    const off = r() * TAU;
    for (let k = 0; k < 9; k++) petalTris(pet, off + k / 9 * TAU, 0.012, 0.2, 0.052, 0.18 + (k % 3) * 0.05, -0.2);
  } else if (kind === 'lily') {
    const off = r() * TAU;
    for (let k = 0; k < 10; k++) petalTris(pet, off + k / 10 * TAU, 0.01, 0.11, 0.032, 0.35, 0.3);
    for (let k = 0; k < 7; k++) petalTris(pet, off + 0.3 + k / 7 * TAU, 0.01, 0.075, 0.03, 0.8, 0.3);
  } else if (kind === 'pod') {
    // an inverted cone, flat on top, dotted with holes (darker), on its stalk's end
    const t = [], R1 = 0.07, R0 = 0.02;
    for (let k = 0; k < 10; k++) { const a = k / 10 * TAU, b = (k + 1) / 10 * TAU; t.push(Math.cos(a) * R0, 0, Math.sin(a) * R0, Math.cos(a) * R1, 0.1, Math.sin(a) * R1, Math.cos(b) * R1, 0.1, Math.sin(b) * R1, Math.cos(a) * R0, 0, Math.sin(a) * R0, Math.cos(b) * R1, 0.1, Math.sin(b) * R1, Math.cos(b) * R0, 0, Math.sin(b) * R0); t.push(0, 0.102, 0, Math.cos(b) * R1, 0.1, Math.sin(b) * R1, Math.cos(a) * R1, 0.1, Math.sin(a) * R1); }
    out.pod = fromTriangles(t);
    const h = [];
    for (let k = 0; k < 7; k++) { const a = k / 7 * TAU, q = k === 0 ? 0 : 0.038; h.push(...disc6(Math.cos(a) * q, 0.1035, Math.sin(a) * q, 0.011)); }
    out.holes = fromTriangles(h);
  }
  if (pet.length) out.pet = fromTriangles(pet);
  FLO.set(key, out);
  return out;
}
function disc6(x, y, z, r) { const t = []; for (let k = 0; k < 6; k++) { const a = k / 6 * TAU, b = (k + 1) / 6 * TAU; t.push(x, y, z, x + Math.cos(b) * r, y, z + Math.sin(b) * r, x + Math.cos(a) * r, y, z + Math.sin(a) * r); } return t; }
/** A slender stalk from a to b, bowed a little, five sides, two rings of segments. */
function stalk(a, b, r0, r1, bow) {
  const rows = [];
  for (let i = 0; i <= 2; i++) {
    const t = i / 2, rr = r0 + (r1 - r0) * t;
    const cx = a[0] + (b[0] - a[0]) * t + bow[0] * Math.sin(Math.PI * t), cy = a[1] + (b[1] - a[1]) * t, cz = a[2] + (b[2] - a[2]) * t + bow[1] * Math.sin(Math.PI * t);
    const row = []; for (let k = 0; k < 5; k++) { const th = k / 5 * TAU; row.push([cx + Math.cos(th) * rr, cy, cz + Math.sin(th) * rr]); }
    rows.push(row);
  }
  const t = [];
  for (let i = 0; i < 2; i++) for (let k = 0; k < 5; k++) { const k2 = (k + 1) % 5; t.push(...rows[i][k], ...rows[i + 1][k], ...rows[i + 1][k2], ...rows[i][k], ...rows[i + 1][k2], ...rows[i][k2]); }
  return t;
}
const LEAVES = new Map();
function leafProto(kind, v) {
  const key = kind + v;
  if (!LEAVES.has(key)) {
    LEAVES.set(key, kind === 'cup' ? leafGeometry(0.2 + (v % 4) * 0.07, 0.03, 40 + v)
      : kind === 'float' ? leafGeometry(0.05, 0.035, 60 + v)
        : leafGeometry(0.03, 0.02, 80 + v, true));
  }
  return LEAVES.get(key);
}
function inst(bag, mat, g, m, real = mat) {
  if (!g) return;
  if (bag.addInstance) bag.addInstance(mat, g.clone(), m, { real, reach: 260 }); else bag.add(real, g.clone().applyMatrix4(m));
}
/**
 * lotus (kind 'lotus') or water lilies (kind 'lily') over a region of the pond { c, r, n (leaves), y,
 * seed, inside(x, z) }: in clumps with open water between; of the lotus, cupped leaves standing on
 * stalks and floating ones, flowers and buds at varied heights, a few seed pods.
 */
export function lotusField(el, { bag }) {
  const rand = rng(el.seed || 3), [cx, cz] = el.c, y = el.y, lily = el.kind === 'lily';
  const inside = el.inside || (() => true);
  const nClumps = Math.max(2, Math.round((el.n ?? 30) / (lily ? 7 : 17)));
  const clumps = [];
  for (let tries = 0; tries < nClumps * 30 && clumps.length < nClumps; tries++) {
    const a = rand() * TAU, d = Math.sqrt(rand()) * el.r, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d * (el.sq ?? 1);
    const cr = lily ? 0.5 + rand() * 0.9 : 1.1 + rand() * 2.0;
    if (!inside(x, z)) continue;
    if (clumps.some((c) => Math.hypot(c.x - x, c.z - z) < (c.r + cr) * 1.05 + (lily ? 0.4 : 0.9))) continue;
    clumps.push({ x, z, r: cr });
  }
  for (const C of clumps) {
    const m = lily ? 4 + Math.floor(rand() * 7) : 10 + Math.floor(rand() * 20);
    for (let k = 0; k < m; k++) {
      const a = rand() * TAU, d = Math.sqrt(rand()) * C.r, x = C.x + Math.cos(a) * d, z = C.z + Math.sin(a) * d;
      if (!inside(x, z)) continue;
      const big = 0.65 + rand() * rand() * 0.7;
      if (lily) {
        const rr = 0.1 + rand() * 0.14;
        inst(bag, 'lotus_leaf', leafProto('lily', Math.floor(rand() * 3)), placement(x, y + 0.012 + rand() * 0.004, z, rand() * TAU, rr, 0, 0));
        if (rand() < 0.2) inst(bag, 'paint_white', flowerParts('lily').pet, placement(x + 0.06, y + 0.02, z, rand() * TAU, 1.0, 0, 0));
        continue;
      }
      const raised = rand() < 0.45, rr = (0.22 + rand() * 0.34) * big;
      const lift = raised ? 0.3 + rand() * 0.85 : 0.02 + rand() * 0.03;
      const tx = (rand() - 0.5) * (raised ? 0.5 : 0.12), tz = (rand() - 0.5) * (raised ? 0.5 : 0.12);
      inst(bag, 'lotus_leaf', leafProto(raised ? 'cup' : 'float', Math.floor(rand() * (raised ? 4 : 3))), placement(x, y + lift, z, rand() * TAU, rr, tx, tz));
      if (raised) bag.add('lotus_leaf', fromTriangles(stalk([x - tz * lift * 0.5, y - 0.7, z + tx * lift * 0.5], [x, y + lift - 0.02, z], 0.014, 0.01, [(rand() - 0.5) * 0.1, (rand() - 0.5) * 0.1])));
    }
    if (lily) continue;
    // flowers, buds and pods stand taller than the leaves
    const nf = Math.floor(rand() * 3.2), nb = Math.floor(rand() * 2.8), np = rand() < 0.35 ? 1 : 0;
    const standUp = (kind, h0, h1, mat, extra) => {
      const a = rand() * TAU, d = rand() * C.r * 0.8, x = C.x + Math.cos(a) * d, z = C.z + Math.sin(a) * d;
      if (!inside(x, z)) return;
      const h = h0 + rand() * (h1 - h0), lean = [(rand() - 0.5) * 0.3, (rand() - 0.5) * 0.3];
      bag.add('lotus_leaf', fromTriangles(stalk([x, y - 0.7, z], [x + lean[0], y + h, z + lean[1]], 0.013, 0.01, [lean[1] * 0.4, -lean[0] * 0.4])));
      const parts = flowerParts(kind, 0), M = placement(x + lean[0], y + h, z + lean[1], rand() * TAU, (0.8 + rand() * 0.55) * extra, (rand() - 0.5) * 0.3, (rand() - 0.5) * 0.3);
      return { parts, M };
    };
    for (let k = 0; k < nf; k++) { const f = standUp(rand() < 0.65 ? 'open' : 'half', 0.7, 1.45, 'marble_pink', 1.2); if (f) { inst(bag, 'marble_pink', f.parts.pet, f.M); inst(bag, 'paint_ochre', f.parts.mid, f.M); } }
    for (let k = 0; k < nb; k++) { const f = standUp('bud', 0.55, 1.25, 'marble_pink', 1.0); if (f) inst(bag, 'marble_pink', f.parts.pet, f.M); }
    for (let k = 0; k < np; k++) { const f = standUp('pod', 0.7, 1.25, 'lotus_leaf', 1.0); if (f) { inst(bag, 'lotus_leaf', f.parts.pod, f.M); inst(bag, 'lacquer_black', f.parts.holes, f.M); } }
  }
}

// ── the revetment ───────────────────────────────────────────────────────────
/**
 * revetment: rubble along a shore { arcs: [[[x, z]…]…] (the shore's line, water on the side where
 * dist < 0), dist (x, z) → signed distance (negative in the water), ground (x, z), water (the
 * level), seed }: a lower course standing in the shallows, its tops just over the water, and an
 * upper course on the bank, its tops uneven; a block now and then of Taihu stone.
 */
export function revetmentBuild(el, { bag }) {
  const rand = rng(el.seed || 5), dist = el.dist, ground = el.ground, wl = el.water;
  const mats = ['sandstone_carved', 'sandstone_carved', 'granite_rough', 'taihu'];   // yellowstone (here warm grey-brown), grey Taihu and granite among it
  const T = { sandstone_carved: [], granite_rough: [], taihu: [] };
  for (const arc of el.arcs) {
    for (const row of [0, 1]) {
      let carry = 0;
      for (let i = 0; i + 1 < arc.length; i++) {
        const [ax, az] = arc[i], [bx, bz] = arc[i + 1], len = Math.hypot(bx - ax, bz - az), tx = (bx - ax) / len, tz = (bz - az) / len;
        let s = carry;
        while (s < len) {
          const L = 0.65 + rand() * 0.6, W = row === 0 ? 0.42 + rand() * 0.16 : 0.36 + rand() * 0.16;
          const sc = s + L / 2;
          if (sc > len) { carry = s - len; break; }
          const px = ax + tx * sc, pz = az + tz * sc;
          // toward the water: the field's gradient
          const e = 0.2, gx = dist(px + e, pz) - dist(px - e, pz), gz = dist(px, pz + e) - dist(px, pz - e), gl = Math.hypot(gx, gz) || 1;
          const nx = -gx / gl, nz = -gz / gl;                                  // toward the water
          const off = row === 0 ? -0.33 + (rand() - 0.5) * 0.14 : 0.04 + (rand() - 0.5) * 0.14;
          const x = px - nx * off, z = pz - nz * off;                            // (off < 0: toward the water)
          const gh = ground(x, z);
          const yb = gh - 0.22;
          const yt = row === 0 ? Math.max(yb + 0.3, wl + 0.02 + rand() * 0.2) : Math.max(yb + 0.25, gh + 0.05 + rand() * 0.28);
          const tris = [];
          rubble(tris, x, z, Math.atan2(tz, tx) + (rand() - 0.5) * 0.35, L, W, yb, yt, rand);
          const m = mats[Math.floor(rand() * mats.length)];
          T[m].push(...faceOut(tris, x, (yb + yt) / 2, z));
          s += L + 0.01 + rand() * 0.05;
          carry = s - len;
        }
        if (s >= len) carry = Math.max(0, s - len);
      }
    }
  }
  for (const m of Object.keys(T)) if (T[m].length) bag.add(m, fromTriangles(T[m]));
}

// ── pebble-mosaic paving (hua jie pu di) ────────────────────────────────────
const LV = 0.01;                       // the height of a layer of the mosaic (unit size)
/** Flat layers of a motif: { material: [triangles] }, every polygon star-shaped about its first point, facing up. */
class Flat {
  constructor() { this.m = {}; }
  tri(mat, lv, a, b, c) { (this.m[mat] ||= []).push(a[0], lv * LV, a[1], b[0], lv * LV, b[1], c[0], lv * LV, c[1]); }
  /** a fan about the centroid (the points run counter-clockwise seen from above, +x east, +z south: clockwise on the page). */
  poly(mat, lv, P) {
    let cx = 0, cz = 0; for (const [x, z] of P) { cx += x; cz += z; } cx /= P.length; cz /= P.length;
    for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; this.tri(mat, lv, [cx, cz], b, a); }
  }
  disc(mat, lv, x, z, r, n = 16) { this.poly(mat, lv, ngon(x, z, r, n, 0)); }
  ring(mat, lv, x, z, r0, r1, n = 20, rot = 0) {
    const A = ngon(x, z, r1, n, rot), B = ngon(x, z, r0, n, rot);
    for (let i = 0; i < n; i++) { const k = (i + 1) % n; this.tri(mat, lv, A[i], B[k], A[k]); this.tri(mat, lv, A[i], B[i], B[k]); }
  }
  /** a band along a polyline with widths at its points */
  strip(mat, lv, pts, wid) {
    const L = [], R = [];
    pts.forEach((p, i) => {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      let dx = b[0] - a[0], dz = b[1] - a[1]; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
      const w = (Array.isArray(wid) ? wid[i] : wid) / 2;
      L.push([p[0] - dz * w, p[1] + dx * w]); R.push([p[0] + dz * w, p[1] - dx * w]);
    });
    for (let i = 0; i + 1 < pts.length; i++) { this.tri(mat, lv, L[i], R[i + 1], R[i]); this.tri(mat, lv, L[i], L[i + 1], R[i + 1]); }
  }
  geos() { const o = {}; for (const k of Object.keys(this.m)) o[k] = fromTriangles(this.m[k]); return o; }
}
// (x → east, z → south: a polygon listed with increasing angle is clockwise on the page, which is the winding fromTriangles reads as facing up)
function ngon(x, z, r, n, rot) { const P = []; for (let i = 0; i < n; i++) { const a = rot + i / n * TAU; P.push([x + Math.cos(a) * r, z + Math.sin(a) * r]); } return P; }
const ellipse = (x, z, a, b, rot, n = 14) => ngon(0, 0, 1, n, 0).map(([u, v]) => [x + u * a * Math.cos(rot) - v * b * Math.sin(rot), z + u * a * Math.sin(rot) + v * b * Math.cos(rot)]);

const D = 'tile_dark', P = 'plaster_grey', C = 'tile_cream', BL = 'tile_lapis', TQ = 'tile_turquoise', WH = 'tile_white', OC = 'paint_ochre', RD = 'lacquer_red';
const MOTIFS = {
  // a coin: its rim, the square hole
  coin(f) { f.ring(D, 1, 0, 0, 0.86, 1.0, 20); f.ring(P, 1, 0, 0, 0.5, 0.86, 20); f.poly(D, 2, ngon(0, 0, 0.38, 4, Math.PI / 4)); f.disc(TQ, 3, 0, 0, 0.06, 8); },
  // a plum blossom: five round petals about a golden heart
  plum(f) {
    f.ring(D, 1, 0, 0, 0.93, 1.0, 22);
    for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k / 5 * TAU, x = Math.cos(a) * 0.5, z = Math.sin(a) * 0.5; f.disc(D, 1, x, z, 0.42, 14); }
    for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k / 5 * TAU, x = Math.cos(a) * 0.5, z = Math.sin(a) * 0.5; f.disc(k % 2 ? C : P, 2, x, z, 0.36, 14); }
    f.disc(OC, 3, 0, 0, 0.17, 10);
    for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k + 0.5) / 5 * TAU; f.disc(D, 3, Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0.03, 5); }
  },
  // a tortoise-shell hexagon
  hex(f) { f.ring(D, 1, 0, 0, 0.84, 1.0, 6, 0); f.ring(P, 1, 0, 0, 0.55, 0.84, 6, 0); f.ring(D, 2, 0, 0, 0.4, 0.55, 6, 0); f.disc(BL, 3, 0, 0, 0.3, 6); f.disc(WH, 3, 0, 0, 0.1, 6); },
  // a lotus: eight long petals, eight short between, a golden heart
  lotus(f) {
    f.ring(D, 1, 0, 0, 0.94, 1.0, 22);
    const petal = (a, r0, r1, wd) => [0, 1, 2, 3, 4, 5].map((i) => [[r0, 0], [(r0 + r1) * 0.5, -wd], [r1 - 0.12 * (r1 - r0), -wd * 0.55], [r1, 0], [r1 - 0.12 * (r1 - r0), wd * 0.55], [(r0 + r1) * 0.5, wd]][i]).map(([u, v]) => [u * Math.cos(a) - v * Math.sin(a), u * Math.sin(a) + v * Math.cos(a)]);
    for (let k = 0; k < 8; k++) f.poly(D, 1, petal(k / 8 * TAU, 0.2, 0.92, 0.26));
    for (let k = 0; k < 8; k++) f.poly(P, 2, petal(k / 8 * TAU, 0.24, 0.86, 0.19));
    for (let k = 0; k < 8; k++) f.poly(D, 2, petal((k + 0.5) / 8 * TAU, 0.2, 0.55, 0.15));
    for (let k = 0; k < 8; k++) f.poly(TQ, 3, petal((k + 0.5) / 8 * TAU, 0.24, 0.5, 0.1));
    f.disc(OC, 3, 0, 0, 0.2, 12);
  },
  // a crane against the sun, in a round of tile
  crane(f) {
    f.ring(D, 1, 0, 0, 0.92, 1.0, 26);
    f.disc(BL, 1, -0.38, -0.5, 0.14, 12);                                                  // the sun (blue porcelain)
    f.poly(P, 2, ellipse(-0.04, 0.08, 0.34, 0.15, -0.12, 16));                              // the body
    f.poly(P, 2, [[-0.05, 0.0], [-0.3, -0.3], [-0.72, -0.36], [-0.74, -0.16], [-0.4, 0.04]]);        // the wing
    f.poly(D, 3, [[-0.56, -0.33], [-0.72, -0.36], [-0.74, -0.16], [-0.52, -0.02]]);           // its dark flight feathers
    f.poly(D, 3, [[-0.28, 0.1], [-0.7, 0.2], [-0.68, 0.3], [-0.26, 0.16]]);                // the tail
    f.strip(P, 2, [[0.26, 0.02], [0.43, -0.12], [0.42, -0.32], [0.38, -0.5], [0.5, -0.62]], 0.075);   // the neck
    f.disc(P, 2, 0.5, -0.64, 0.065, 8); f.disc(RD, 3, 0.5, -0.69, 0.035, 6);               // the head and its red crown
    f.strip(D, 3, [[0.55, -0.64], [0.82, -0.58]], 0.025);                                  // the beak
    f.strip(D, 3, [[-0.06, 0.2], [-0.16, 0.5], [-0.2, 0.8]], 0.03);                         // the legs
    f.strip(D, 3, [[0.04, 0.21], [0.0, 0.5], [0.0, 0.84]], 0.03);
    f.strip(P, 1, [[-0.9, 0.62], [-0.7, 0.58], [-0.5, 0.64]], 0.05); f.strip(P, 1, [[0.45, 0.66], [0.62, 0.6], [0.8, 0.66]], 0.05);   // wisps of cloud
  },
  // a little diamond between coins
  diamond(f) { f.poly(P, 1, ngon(0, 0, 1, 4, 0)); f.disc(D, 2, 0, 0, 0.3, 6); },
  // a hexagonal cell of the honeycomb (alternately pale)
  hexcell(f) { f.ring(D, 1, 0, 0, 0.88, 1.0, 6, 0); },
  hexpale(f) { f.ring(D, 1, 0, 0, 0.88, 1.0, 6, 0); f.disc(P, 1, 0, 0, 0.6, 6); f.disc(TQ, 2, 0, 0, 0.14, 6); },
  hexbrown(f) { f.ring(D, 1, 0, 0, 0.88, 1.0, 6, 0); f.disc(C, 1, 0, 0, 0.6, 6); },
};
const MCACHE = new Map();
function motif(name) {
  if (!MCACHE.has(name)) { const f = new Flat(); MOTIFS[name](f); MCACHE.set(name, f.geos()); }
  return MCACHE.get(name);
}
/** A motif of unit radius placed at (x, y, z), turned, scaled (instanced where the bag can). */
function putMotif(bag, name, x, y, z, yaw, s) {
  const m = placement(x, y, z, yaw, s);
  for (const [mat, g] of Object.entries(motif(name))) inst(bag, mat, g, m);
}
/** A frame (a band of width w with its outer edge `a` inside the rect) as four non-overlapping flat quads. */
function frame(f, mat, lv, [x0, z0, x1, z1], a, w) {
  const q = (xa, za, xb, zb) => { f.tri(mat, lv, [xa, za], [xa, zb], [xb, zb]); f.tri(mat, lv, [xa, za], [xb, zb], [xb, za]); };
  q(x0 + a, z0 + a, x1 - a, z0 + a + w); q(x0 + a, z1 - a - w, x1 - a, z1 - a);
  q(x0 + a, z0 + a + w, x0 + a + w, z1 - a - w); q(x1 - a - w, z0 + a + w, x1 - a, z1 - a - w);
}
/**
 * pebble_paving: a court of pebble mosaic { rect, y (the top), th, field: 'hex' | 'coin' | null,
 * medallion: 'crane' | 'lotus' | 'plum' | 'coin' | 'hex' | null, at: [x, z] (its centre), d (its
 * diameter), seed }: a bed of pebbles, a border of tile edges and a band of pale pebbles, the
 * field of one repeating figure, the medallion in the middle.
 */
export function pebblePaving(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, w = x1 - x0, d = z1 - z0, rand = rng(el.seed || 9);
  bag.add('pebbles', fromTriangles(boxTris(x0, y - (el.th ?? 0.14), z0, x1, y, z1)));
  col.floor(el.rect, y);
  const f = new Flat();
  frame(f, D, 1, el.rect, 0.08, 0.12); frame(f, P, 1, el.rect, 0.2, 0.14); frame(f, D, 1, el.rect, 0.34, 0.06);
  const geos = f.geos();
  for (const [mat, g] of Object.entries(geos)) bag.add(mat, g.translate(0, y, 0));
  const inner = [x0 + 0.5, z0 + 0.5, x1 - 0.5, z1 - 0.5];
  const med = el.medallion, mcx = el.at ? el.at[0] : (x0 + x1) / 2, mcz = el.at ? el.at[1] : (z0 + z1) / 2, mr = med ? (el.d ?? Math.min(w, d) * 0.62) / 2 : 0;
  // the field: a lattice of one figure, left out under the medallion and where it would cross the border
  if (el.field === 'hex') {
    const R = 0.46, dx = 1.5 * R, dz = Math.sqrt(3) * R;
    for (let i = 0; i * dx < w; i++) for (let j = 0; j * dz < d; j++) {
      const x = inner[0] + R + i * dx, z = inner[1] + R * 0.87 + j * dz + (i % 2 ? dz / 2 : 0);
      if (x + R > inner[2] || z + R * 0.87 > inner[3]) continue;
      if (med && Math.hypot(x - mcx, z - mcz) < mr + R + 0.25) continue;
      const k = (i + j * 2) % 5;
      putMotif(bag, k === 0 ? 'hexpale' : k === 3 ? 'hexbrown' : 'hexcell', x, y, z, 0, R);
    }
  } else if (el.field === 'coin') {
    const R = 0.34, st = R * 2.05;
    for (let i = 0; (i + 1) * st < w - 1; i++) for (let j = 0; (j + 1) * st < d - 1; j++) {
      const x = inner[0] + R + i * st, z = inner[1] + R + j * st;
      if (x + R > inner[2] || z + R > inner[3]) continue;
      if (med && Math.hypot(x - mcx, z - mcz) < mr + R + 0.25) continue;
      putMotif(bag, 'coin', x, y, z, 0, R);
      if (x + st + R <= inner[2] && z + st + R <= inner[3] && !(med && Math.hypot(x + st / 2 - mcx, z + st / 2 - mcz) < mr + 0.3)) putMotif(bag, 'diamond', x + st / 2, y, z + st / 2, 0, R * 0.42);
    }
  }
  if (med) {
    // a ring of pale pebbles round the medallion, then the figure
    const g2 = new Flat(); g2.ring(P, 1, mcx, mcz, mr + 0.04, mr + 0.2, 28); g2.ring(D, 1, mcx, mcz, mr + 0.2, mr + 0.28, 28);
    for (const [mat, g] of Object.entries(g2.geos())) bag.add(mat, g.translate(0, y, 0));
    putMotif(bag, med, mcx, y, mcz, med === 'crane' ? 0 : (rand() * 0.3), mr);
  }
}
function boxTris(x0, y0, z0, x1, y1, z1) {
  // (top and four sides; the bed sits on the ground)
  const t = [];
  t.push(x0, y1, z0, x0, y1, z1, x1, y1, z1, x0, y1, z0, x1, y1, z1, x1, y1, z0);
  const side = (a, b, c, d) => t.push(...a, ...c, ...b, ...a, ...d, ...c);
  side([x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]);
  side([x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]);
  side([x1, y0, z1], [x0, y0, z1], [x0, y1, z1], [x1, y1, z1]);
  side([x0, y0, z1], [x0, y0, z0], [x0, y1, z0], [x0, y1, z1]);
  return t;
}
/**
 * path (pebble mosaic): a ribbon of pebbles along a polyline { pts, w, y (the top) }, edged with
 * tiles on edge and a line of pale pebbles, a medallion — coin, plum, lotus, hexagon — every
 * couple of metres down its middle.
 */
export function pebblePath(el, { bag, col }) {
  const pts = el.pts, hw = (el.w ?? 1.4) / 2, y = el.y ?? 0.17, rand = rng(el.seed || 17);
  // the ribbon's two edges (mitred)
  const Lp = [], Rp = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let dx = b[0] - a[0], dz = b[1] - a[1]; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    let k = 1;
    if (i > 0 && i < pts.length - 1) { const u = [p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]], v = [pts[i + 1][0] - p[0], pts[i + 1][1] - p[1]]; const cu = (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v) || 1); k = 1 / Math.max(0.55, Math.sqrt((1 + cu) / 2)); }
    Lp.push([p[0] - dz * hw * k, p[1] + dx * hw * k]); Rp.push([p[0] + dz * hw * k, p[1] - dx * hw * k]);
  });
  const t = [], dpt = 0.12;
  for (let i = 0; i + 1 < pts.length; i++) {
    const L0 = Lp[i], L1 = Lp[i + 1], R0 = Rp[i], R1 = Rp[i + 1];
    t.push(L0[0], y, L0[1], R1[0], y, R1[1], R0[0], y, R0[1], L0[0], y, L0[1], L1[0], y, L1[1], R1[0], y, R1[1]);
    const side = (a, b) => t.push(a[0], y - dpt, a[1], b[0], y - dpt, b[1], b[0], y, b[1], a[0], y - dpt, a[1], b[0], y, b[1], a[0], y, a[1]);
    side(R1, R0); side(L0, L1);
  }
  bag.add('pebbles', fromTriangles(t));
  // edges: tiles on edge, and inside them a line of pale pebbles
  const f = new Flat(), edge = (E, off, wd, mat, lv) => {
    const line = E.map((q, i) => { const c = pts[i]; const dx = c[0] - q[0], dz = c[1] - q[1], l = Math.hypot(dx, dz) || 1; return [q[0] + dx / l * off, q[1] + dz / l * off]; });
    f.strip(mat, lv, line, wd);
  };
  for (const E of [Lp, Rp]) { edge(E, 0.05, 0.07, D, 1); edge(E, 0.15, 0.06, P, 1); }
  for (const [mat, g] of Object.entries(f.geos())) bag.add(mat, g.translate(0, y, 0));
  // medallions down the middle
  const names = ['coin', 'plum', 'lotus', 'hex'], sp = (el.w ?? 1.4) * 1.55, r = hw * 0.78;
  let s = sp * 0.5, ni = Math.floor(rand() * 4), walked = 0;
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1], len = Math.hypot(bx - ax, bz - az);
    while (s - walked < len - 0.3) {
      const u = (s - walked) / len, x = ax + (bx - ax) * u, z = az + (bz - az) * u;
      putMotif(bag, names[ni++ % 4], x, y, z, Math.atan2(bz - az, bx - ax), r);
      s += sp;
    }
    walked += len;
  }
  void col;
}
