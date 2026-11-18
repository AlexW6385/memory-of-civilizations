// Taihu stones for the Humble Administrator's Garden (docs/settlements/ming-suzhou.md §19): the
// pale grey limestone of Lake Tai, lean and top-heavy, pierced through by many holes, hollowed and
// wrinkled by the water (the four qualities: thin, open, perforated, wrinkled). The body is a
// distance field — a leaning axis with a waisted, swelling profile, folded cross-sections, spurs —
// from which tunnels (curved, of changing bore) and scoops are cut, its surface worked into the
// pits and ridges of the lake's wear; the mesh is extracted by surface nets, so a hole is a hole.
//
// Prototypes are built once per shape and level of detail and placed as instances (GeoBag
// .addInstance); a hash of each stone's own position picks its shape, turn, lean, size and tint
// (never a counter or an RNG shared between stones: the same plan builds the same geometry).
//   lod 0  near, fine (about 3 000 triangles); lod 1 far, coarse (about 450); lod 2 middle (1 500)
// The old shared stone (src/styles/ming/garden-stone.js) is left to the other settlements.

import { BufferGeometry, Float32BufferAttribute, Matrix4, Quaternion, Vector3 } from '../../core/three.js';
import { box, fromTriangles } from '../../core/geom.js';

const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const smin = (a, b, k) => { const h = clamp(0.5 + 0.5 * (b - a) / k, 0, 1); return b + (a - b) * h - k * h * (1 - h); };
const smax = (a, b, k) => -smin(-a, -b, k);
export function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A number in [0, 1) from a position alone (a hash, not a stream). */
export function hash2(x, z, k = 0) {
  let h = Math.imul(Math.round(x * 64) | 0, 374761393) ^ Math.imul(Math.round(z * 64) | 0, 668265263) ^ Math.imul(k + 1, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// ── noise ───────────────────────────────────────────────────────────────────
function hash3(x, y, z) {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
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
/** Cellular noise: [F1, F2] distances to the nearest feature points (unit cells). */
const _f = [0, 0];
function worley(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  let f1 = 9, f2 = 9;
  for (let k = -1; k <= 1; k++) for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
    const cx = xi + i, cy = yi + j, cz = zi + k;
    const px = cx + hash3(cx, cy, cz + 17) - x, py = cy + hash3(cx + 31, cy, cz) - y, pz = cz + hash3(cx, cy + 53, cz) - z;
    const d = px * px + py * py + pz * pz;
    if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) f2 = d;
  }
  _f[0] = Math.sqrt(f1); _f[1] = Math.sqrt(f2);
  return _f;
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
  // normals from the field's gradient (they also orient the triangles)
  const N = new Float32Array(P.length), e = Math.min(sx, sy, sz) * 0.6;
  for (let v = 0; v < P.length; v += 3) {
    const x = P[v], y = P[v + 1], z = P[v + 2];
    const gx = sdf(x + e, y, z) - sdf(x - e, y, z), gy = sdf(x, y + e, z) - sdf(x, y - e, z), gz = sdf(x, y, z + e) - sdf(x, y, z - e);
    const l = Math.hypot(gx, gy, gz) || 1; N[v] = gx / l; N[v + 1] = gy / l; N[v + 2] = gz / l;
  }
  const I = [];
  const quadAt = (a, b, c, d) => {
    if (a < 0 || b < 0 || c < 0 || d < 0) return;
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
  // drop the islands the field left (shards off a thin crown)
  const par = new Int32Array(P.length / 3).map((_, i) => i), find = (a) => { while (par[a] !== a) { par[a] = par[par[a]]; a = par[a]; } return a; };
  for (let i = 0; i < I.length; i += 3) { par[find(I[i + 1])] = find(I[i]); par[find(I[i + 2])] = find(I[i]); }
  const cnt = new Map(); for (let i = 0; i < I.length; i += 3) { const r = find(I[i]); cnt.set(r, (cnt.get(r) || 0) + 1); }
  const big = Math.max(...cnt.values()), I2 = [];
  for (let i = 0; i < I.length; i += 3) if (cnt.get(find(I[i])) >= big * 0.35) I2.push(I[i], I[i + 1], I[i + 2]);
  // smooth normals: area-weighted face normals averaged at each vertex (the gradient only where no face is left)
  const A = new Float32Array(P.length);
  for (let i = 0; i < I2.length; i += 3) {
    const a = I2[i] * 3, b = I2[i + 1] * 3, c = I2[i + 2] * 3;
    const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], wx = P[c] - P[a], wy = P[c + 1] - P[a + 1], wz = P[c + 2] - P[a + 2];
    const fx = uy * wz - uz * wy, fy = uz * wx - ux * wz, fz = ux * wy - uy * wx;
    for (const v of [a, b, c]) { A[v] += fx; A[v + 1] += fy; A[v + 2] += fz; }
  }
  for (let v = 0; v < P.length; v += 3) {
    const l = Math.hypot(A[v], A[v + 1], A[v + 2]);
    if (l > 1e-9) { N[v] = N[v] * 0.15 + A[v] / l * 0.85; N[v + 1] = N[v + 1] * 0.15 + A[v + 1] / l * 0.85; N[v + 2] = N[v + 2] * 0.15 + A[v + 2] / l * 0.85; }
    const m = Math.hypot(N[v], N[v + 1], N[v + 2]) || 1; N[v] /= m; N[v + 1] /= m; N[v + 2] /= m;
  }
  return { P: Float32Array.from(P), N, I: I2 };
}

// ── one stone as a distance field ───────────────────────────────────────────
const BASE = -0.3;
/**
 * A stone is a chain of swellings on a leaning, sway-backed spine, joined by smooth unions: the
 * lumps and necks, wider above than below (top-heavy), thin in one direction. Holes are bored
 * through the middle of the swellings, where the stone is thickest, so the rim round each is
 * sound; scoops and the water's wrinkles are cut over it all.
 */
function makeStone(kind, seed, fine) {
  const r = rng(seed * 7919 + 13), R = (a, b) => a + (b - a) * r();
  const nodes = [], tunnels = [], pits = [];
  const sg = () => (r() < 0.5 ? -1 : 1);
  const node = (x, y, z, rx, ry, rz, rot = 0) => nodes.push({ x, y, z, rx, ry, rz, c: Math.cos(rot), s: Math.sin(rot) });
  let H, kS = 0.2;
  // a spine of n swellings from the foot to the crown, each (rx, ry, rz) by a profile that is narrow at the waist and fat at the head
  const spine = (h, n, width, thin, lean, sway, top, x0 = 0, z0 = 0) => {
    const sw = R(0, 6.28), prof = [R(0.8, 1), R(0.6, 0.78), R(0.85, 1.05), R(0.62, 0.82), R(0.8, 1.0), R(0.7, 0.9)];
    const out = [];
    for (let i = 0; i < n; i++) {
      const u = n === 1 ? 0.5 : i / (n - 1), y = u * (h - 0.35) + 0.05, w = width * (prof[i % prof.length] * (0.78 + 0.34 * u * top));
      const x = x0 + lean * y + sway * Math.sin(u * 4.2 + sw), z = z0 + 0.04 * Math.sin(u * 5 + sw);
      const rz = w * thin * R(0.9, 1.1), ry = w * R(1.0, 1.55);
      node(x, y, z, w * R(0.85, 1.1), ry, rz, R(-0.5, 0.5));
      out.push(nodes[nodes.length - 1]);
    }
    return out;
  };
  let chain = [], bore = 0.85;
  switch (kind) {
    case 'spire': H = R(3.0, 3.5); chain = spine(H, 8, R(0.27, 0.32), R(0.5, 0.6), R(-0.07, 0.07), R(0.06, 0.16), 1.2);
      node(chain[2].x + sg() * 0.3, H * 0.5, 0.02, 0.2, 0.34, 0.14); node(chain[4].x + sg() * 0.34, H * 0.68, -0.02, 0.19, 0.3, 0.13); bore = 1.0; break;
    case 'peak': H = R(1.9, 2.4); chain = spine(H, 6, R(0.31, 0.37), R(0.5, 0.6), R(-0.08, 0.08), R(0.06, 0.15), 1.25);
      node(chain[1].x + sg() * 0.34, H * 0.42, 0.02, 0.22, 0.32, 0.15); break;
    case 'shore': H = R(1.15, 1.7); chain = spine(H, 5, R(0.26, 0.33), R(0.5, 0.62), R(-0.1, 0.1), R(0.05, 0.13), 1.25);
      if (r() < 0.6) node(chain[1].x + sg() * 0.3, H * R(0.4, 0.55), 0.02, 0.2, 0.26, 0.14); break;
    case 'twin': H = R(1.5, 1.9); spine(H, 4, 0.36, 0.55, 0.05, 0.05, 1.1, -0.36); spine(H * R(0.72, 0.9), 4, 0.34, 0.55, -0.04, 0.05, 1.1, 0.36); break;
    case 'low': H = R(0.95, 1.25);
      node(-0.55, 0.3, 0, 0.36, 0.42, 0.24); node(-0.1, 0.46, 0, 0.42, H * 0.5, 0.27); node(0.4, 0.36, 0, 0.38, 0.42, 0.25); node(0.05, 0.1, 0, 0.8, 0.2, 0.3); chain = nodes.slice(0, 3); break;
    case 'knob': H = R(0.55, 0.85); node(0, H * 0.45, 0, 0.42, H * 0.5, 0.3, R(-0.3, 0.3)); node(0.3 * sg(), H * 0.3, 0, 0.26, H * 0.34, 0.2); chain = [nodes[0]]; bore = 0.75; break;
    case 'slab': H = R(0.55, 0.8); node(-0.45, H * 0.45, 0, 0.5, H * 0.5, 0.26); node(0.42, H * 0.35, 0.02, 0.46, H * 0.4, 0.25); chain = nodes.slice(); break;
    case 'arch': H = R(1.1, 1.4); node(-0.5, H * 0.45, 0, 0.3, H * 0.55, 0.3); node(0.5, H * 0.4, 0, 0.3, H * 0.5, 0.3); node(0, H * 0.82, 0, 0.62, H * 0.22, 0.3); node(0, 0.1, 0, 0.8, 0.2, 0.3); chain = []; kS = 0.12; break;
    case 'lintel': H = 0.5; for (let i = -3; i <= 3; i++) node(i * 0.58, 0.22 + 0.02 * Math.sin(i * 1.7), 0, 0.62, 0.3, 0.32 + 0.03 * Math.sin(i * 2.3)); chain = []; kS = 0.2; break;
    default: H = 1; node(0, 0.5, 0, 0.4, 0.5, 0.3);
  }
  H = Math.max(...nodes.map((N) => N.y + N.ry * 1.05));
  // bores: through the thick way (z) at the middle of the swellings, tilted a little, their radius within what the rim can bear
  for (const N of chain) {
    if (N === chain[0] && chain.length > 2 && r() < 0.7) continue;
    if (r() < 0.12) continue;
    const rad = Math.min(R(0.32, 0.5) * Math.min(N.rx, N.ry) * bore, N.ry * 0.5);
    if (rad < 0.045) continue;
    const yaw = R(-0.45, 0.45), tl = R(-0.3, 0.3), dx = Math.sin(yaw), dz = Math.cos(yaw), reach = 0.6;
    const cx = N.x + R(-0.25, 0.25) * N.rx, cy = N.y + R(-0.2, 0.2) * N.ry, bend = R(-0.08, 0.08);
    tunnels.push({ pts: [[cx - dx * reach, cy - tl * reach, N.z - dz * reach], [cx + bend, cy + bend, N.z], [cx + dx * reach, cy + tl * reach, N.z + dz * reach]], r0: rad * R(0.85, 1.15), r1: rad * R(0.8, 1.2), ph: R(0, 6.28) });
    // a second bore beside it, smaller, so the two open into one irregular hole
    if (r() < 0.3 && N.rx > 0.3) { const o = rad * R(1.1, 1.5) * sg(), rr = rad * R(0.45, 0.65); tunnels.push({ pts: [[cx - dx * reach + o, cy - tl * reach + rad * 0.6, N.z - dz * reach], [cx + o + bend, cy + rad * 0.6 + bend, N.z], [cx + dx * reach + o, cy + tl * reach + rad * 0.6, N.z + dz * reach]], r0: rr, r1: rr * 0.9, ph: R(0, 6.28) }); }
    // and along the width, through the neck
    if (r() < 0.22 && N.rz > 0.14) { const rr = Math.min(N.rz * 0.5, N.ry * 0.3); if (rr > 0.04) tunnels.push({ pts: [[N.x - 0.6, N.y + N.ry * 0.35, N.z], [N.x, N.y + N.ry * 0.3, N.z], [N.x + 0.6, N.y + N.ry * 0.35, N.z]], r0: rr, r1: rr * 0.8, ph: R(0, 6.28) }); }
  }
  if (kind === 'arch') tunnels.push({ pts: [[0, H * 0.42, -1], [0, H * 0.42, 0], [0, H * 0.42, 1]], r0: 0.27, r1: 0.3, ph: R(0, 6.28) });
  // scoops, the hollows the water has dug on the faces (ellipsoids, long along the grain)
  const nP = kind === 'spire' ? 9 : kind === 'peak' ? 7 : kind === 'shore' || kind === 'twin' ? 5 : 3;
  for (let k = 0; k < nP; k++) {
    const N = nodes[Math.floor(r() * nodes.length)], th = R(0, 6.28), pr = R(0.08, 0.17);
    pits.push({ x: N.x + Math.cos(th) * N.rx * 0.95, y: N.y + R(-0.4, 0.4) * N.ry, z: N.z + Math.sin(th) * N.rz * 1.0, rx: pr, ry: pr * R(1.1, 2.0), rz: pr, tilt: R(-0.6, 0.6) });
  }
  const s1 = R(0, 50), s2 = R(0, 50), wf = R(2.2, 3.6);
  const n0 = nodes[0];
  const body = (x, y, z) => {
    let d = 1e9;
    for (let i = 0; i < nodes.length; i++) {
      const N = nodes[i], px = x - N.x, pz = z - N.z, dx = (px * N.c - pz * N.s) / N.rx, dz = (px * N.s + pz * N.c) / N.rz, dy = (y - N.y) / N.ry;
      const di = (Math.hypot(dx, dy, dz) - 1) * Math.min(N.rx, N.ry, N.rz) * 0.95;
      d = i === 0 ? di : smin(d, di, kS);
    }
    return d;
  };
  const sdf = (x, y, z) => {
    let d = body(x, y, z);
    if (d > 0.4) return Math.max(d, BASE - y);
    for (let i = 0; i < tunnels.length; i++) {
      const T = tunnels[i];
      let best = 1e9, tt = 0;
      for (let s = 0; s < T.pts.length - 1; s++) {
        const a = T.pts[s], b = T.pts[s + 1], vx = b[0] - a[0], vy = b[1] - a[1], vz = b[2] - a[2];
        const px = x - a[0], py = y - a[1], pz = z - a[2], u = clamp((px * vx + py * vy + pz * vz) / (vx * vx + vy * vy + vz * vz), 0, 1);
        const dd = Math.hypot(px - vx * u, py - vy * u, pz - vz * u);
        if (dd < best) { best = dd; tt = (s + u) / (T.pts.length - 1); }
      }
      // (the bore swells to the middle and pinches toward the faces, and is never round)
      const rr = (T.r0 + (T.r1 - T.r0) * tt) * (1 + 0.2 * Math.sin(tt * 9 + T.ph) + 0.12 * vn3(x * 5 + T.ph, y * 5, z * 5));
      d = smax(d, -(best - rr), 0.05);
    }
    for (let i = 0; i < pits.length; i++) {
      const P = pits[i], px = x - P.x, py = y - P.y, pz = z - P.z, c = Math.cos(P.tilt), s = Math.sin(P.tilt);
      const qx = px * c - py * s, qy = px * s + py * c;
      d = smax(d, -(Math.hypot(qx / P.rx, qy / P.ry, pz / P.rz) - 1) * Math.min(P.rx, P.rz) * 0.9, 0.08);
    }
    // the work of the lake: broad swells, folds winding up the stone and bent by the grain (zhou), then the
    // ridges between small dimples (the cellular network the water leaves in limestone), kept off the far forms
    d += 0.034 * vn3(x * 3.1 + s1, y * 3.1, z * 3.1 + s2) + 0.012 * vn3(x * 7.4 + s2, y * 7.4 + s1, z * 7.4);
    const wv = vn3(x * 2.3 + s2, y * 1.4, z * 2.3 + s1);
    d += 0.04 * Math.sin(Math.atan2(z - n0.z, x - n0.x) * wf + y * 2.8 + s1 + wv * 2.6) * clamp(1 - Math.abs(y - H * 0.5) / (H * 0.8 + 0.3), 0, 1);
    if (fine > 0 && Math.abs(d) < 0.09) {
      // creases: grooves where a stretched noise crosses zero, running mostly up the stone
      const g = vn3(x * 4.6 + s2, y * 1.9 + s1, z * 4.6 + s1 * 0.5);
      d += fine * 0.03 * Math.pow(1 - Math.abs(g), 4);
      const q = worley(x * 3.8 + s1, y * 3.8 + s2, z * 3.8), ridge = clamp(1 - (q[1] - q[0]) * 2.6, 0, 1);
      d += fine * (0.034 * ridge - 0.02 * clamp(q[0] * 1.6, 0, 1));
    }
    return Math.max(d, BASE - y);
  };
  let bx = 0, bz = 0;
  for (const N of nodes) { bx = Math.max(bx, Math.abs(N.x) + Math.max(N.rx, N.rz) * 1.1 + 0.12); bz = Math.max(bz, Math.abs(N.z) + Math.max(N.rx, N.rz) * 1.1 + 0.12); }
  return { kind, H, sdf, bx, bz };
}

/** The shapes of the garden (kind, seed): shore stones, the tall peaks, piles, the arch and the lintel. The first fifteen keep the indices of the old library. */
export const STONES = [
  ['spire', 21], ['spire', 22], ['peak', 23], ['peak', 24], ['peak', 25], ['twin', 26], ['twin', 27], ['low', 28], ['low', 29], ['low', 30],
  ['knob', 31], ['knob', 32], ['slab', 33], ['arch', 34], ['lintel', 35],
  ['shore', 41], ['shore', 42], ['shore', 43], ['shore', 44], ['shore', 45], ['shore', 46], ['shore', 47], ['shore', 48], ['shore', 49], ['shore', 50], ['shore', 51], ['shore', 52],
];
export const SHORE = [15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26];
const CACHE = new Map();
const TARGET = [3200, 450, 1500];
/** The geometry of stone shape v at a level of detail (0 near, 1 far, 2 middle): { geometry (indexed? no: non-indexed with normals), H, bx, bz, kind }, cached. */
export function stoneParts(v, lod = 1) {
  const key = `${v}/${lod}`;
  if (CACHE.has(key)) return CACHE.get(key);
  const [kind, seed] = STONES[((v % STONES.length) + STONES.length) % STONES.length];
  const S = makeStone(kind, seed, lod === 0 ? 1 : lod === 2 ? 0.6 : 0);
  const target = TARGET[lod] * (S.H > 2.6 ? 1.3 : 1);
  let cell = lod === 0 ? Math.max(0.05, S.H * 0.04) : lod === 2 ? Math.max(0.065, S.H * 0.04) : Math.max(0.1, S.H * 0.07), net;
  for (let it = 0; it < 18; it++) {
    net = surfaceNets(S.sdf, [-S.bx, BASE - cell * 1.5, -S.bz], [S.bx, S.H + cell * 2.5, S.bz], cell);
    if (net.I.length / 3 <= target) break;
    cell *= 1.1;
  }
  const { P, N, I } = net, pos = new Float32Array(I.length * 3), nor = new Float32Array(I.length * 3);
  I.forEach((v2, i) => { pos[i * 3] = P[v2 * 3]; pos[i * 3 + 1] = P[v2 * 3 + 1]; pos[i * 3 + 2] = P[v2 * 3 + 2]; nor[i * 3] = N[v2 * 3]; nor[i * 3 + 1] = N[v2 * 3 + 1]; nor[i * 3 + 2] = N[v2 * 3 + 2]; });
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  const out = { geometry: g, H: S.H, kind, bx: S.bx, bz: S.bz, tris: I.length / 3 };
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
 * Place stone shape v: as instances where the bag can (the 'taihu' material, tinted pale and by the
 * stone's own position), else merged into 'granite_rough'.
 */
export function putStone(bag, v, lod, m, tint = 0.5) {
  const P = stoneParts(v, lod), k = 1.5 + (tint - 0.5) * 0.3;
  if (bag.addInstance) bag.addInstance('taihu', P.geometry.clone(), m, { color: [k, k * (1.0 + (tint - 0.5) * 0.04), k * (0.98 - (tint - 0.5) * 0.1)], real: 'granite_rough', reach: 420 });
  else bag.add('granite_rough', P.geometry.clone().applyMatrix4(m));
}
/** The same, merged into one geometry in a given matrix (a stone stretched or turned as one piece, not instanced). */
export function stoneMerged(v, lod, m) {
  return stoneParts(v, lod).geometry.clone().applyMatrix4(m);
}

// ── the elements ────────────────────────────────────────────────────────────
function prismTris(poly, y0, y1) {
  const t = [], n = poly.length;
  let cx = 0, cz = 0; for (const [x, z] of poly) { cx += x / n; cz += z / n; }
  for (let i = 0; i < n; i++) {
    const [ax, az] = poly[i], [bx, bz] = poly[(i + 1) % n];
    t.push(ax, y0, az, bx, y0, bz, bx, y1, bz, ax, y0, az, bx, y1, bz, ax, y1, az);
    t.push(ax, y1, az, bx, y1, bz, cx, y1, cz);
  }
  return t;
}

/**
 * taihu { c, y, v, s, lod, yaw, tx, tz, solid, plinth, hero }: one stone. Its yaw, lean, size and
 * tint come from the hash of its position unless given; a `hero` stone is merged as a piece of its
 * own, its own seed from the position (the peaks that flank the terrace, the court stones).
 */
export function taihu(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, lod = el.lod ?? 1;
  const h = (k) => hash2(cx, cz, k);
  const v = el.v ?? SHORE[Math.floor(h(1) * SHORE.length)];
  const P = stoneParts(v, lod), s = el.s ?? (el.h ? el.h / P.H : 1);
  const yaw = el.yaw ?? h(2) * Math.PI * 2, tx = el.tx ?? (h(3) - 0.5) * 0.1, tz = el.tz ?? (h(4) - 0.5) * 0.1;
  const m = placement(cx, y, cz, yaw, s, tx, tz);
  if (el.hero) bag.add('granite_rough', stoneMerged(v, lod, m)); else putStone(bag, v, lod, m, h(5));
  if (el.plinth) {
    const w = Math.max(P.bx, P.bz) / 1.55 * s * 0.9;
    bag.add('granite_block', box(cx - w, y - 0.25, cz - w * 0.65, cx + w, y + 0.06, cz + w * 0.65));
  }
  if (el.solid) col.circle(cx, cz, Math.max(0.35, P.bx / 1.55 * s * 0.75), y, y + P.H * s);
}

/**
 * ming_rockery { pts, w, ground, cave, seed }: a path climbing among piled Taihu stone (as the
 * style's own, docs §5), the stones of taihu.js, each shape and turn from the hash of its place.
 */
export function rockery(el, { bag, col }) {
  const rand = rng(el.seed || 31), P = el.pts, hw = (el.w ?? 1.3) / 2, gr = el.ground || (() => -Infinity);
  const bedAt = (x, z, y) => { const g = gr(x, z); return Number.isFinite(g) ? Math.min(y, g) : y; };
  const S = [0];
  for (let i = 1; i < P.length; i++) S.push(S[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
  const Ltot = S[S.length - 1];
  const at = (s) => {
    let i = 1; while (i < P.length - 1 && S[i] < s) i++;
    const t = Math.max(0, Math.min(1, (s - S[i - 1]) / (S[i] - S[i - 1]))), a = P[i - 1], b = P[i], l = S[i] - S[i - 1];
    const x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t;
    return { x, z, y: Math.max(a[2] + (b[2] - a[2]) * t, gr(x, z) + 0.06), ux: (b[0] - a[0]) / l, uz: (b[1] - a[1]) / l };
  };
  // the treads: rough slabs, each a little turned, 0.2 thick, their tops the path's height
  const tr = [], nT = Math.max(2, Math.round(Ltot / 0.55));
  for (let k = 0; k <= nT; k++) {
    const q = at(k * Ltot / nT), ang = Math.atan2(q.uz, q.ux) + (rand() - 0.5) * 0.3, ca = Math.cos(ang), sa = Math.sin(ang);
    const poly = [];
    for (let j = 0; j < 8; j++) {
      const a = (j + (rand() - 0.5) * 0.6) / 8 * Math.PI * 2, rr = 1 + (rand() - 0.5) * 0.4, lu = Math.cos(a) * 0.36 * rr, lv = Math.sin(a) * hw * 0.92 * rr;
      poly.push([q.x + lu * ca - lv * sa, q.z + lu * sa + lv * ca]);
    }
    const top = q.y + (rand() - 0.5) * 0.02;
    tr.push(...prismTris(poly, Math.min(top - 0.2, bedAt(q.x, q.z, top) - 0.1), top));
    col.floor([q.x - 0.36, q.z - 0.36, q.x + 0.36, q.z + 0.36], top);
  }
  bag.add('taihu', fromTriangles(tr));
  const cave = el.cave ?? -1, sC = cave * Ltot;
  const pick = (h, k) => { const set = h > 1.8 ? [2, 3, 4] : h > 1.0 ? [15, 16, 17, 18, 19, 20, 21, 22] : [10, 11, 12]; return set[Math.floor(k * set.length)]; };
  const lodOf = 2;
  for (const sg of [-1, 1]) {
    for (let s = 0.9 + rand() * 0.4; s < Ltot - 0.9; s += 0.95 + rand() * 0.7) {
      if (cave >= 0 && Math.abs(s - sC) < 1.3) continue;
      const q = at(s), nx = -q.uz * sg, nz = q.ux * sg, h0 = 0.6 + rand() * 2.0, v = pick(h0, hash2(q.x, q.z, 7)), Pp = stoneParts(v, lodOf);
      const sc = Math.max(0.55, Math.min(1.5, h0 / Pp.H)), wid = Pp.bz / 1.55 * sc, off = hw + 0.2 + wid * 1.15;
      const x = q.x + nx * off, z = q.z + nz * off, b = bedAt(x, z, q.y) - 0.15, hh = Pp.H * sc;
      putStone(bag, v, lodOf, placement(x, b + 0.3, z, -Math.atan2(q.uz, q.ux) + (rand() - 0.5) * 0.5, sc, nz * 0.05, -nx * 0.05), hash2(x, z, 5));
      col.circle(x, z, Math.max(0.3, wid * 1.2), b, b + hh);
    }
  }
  if (cave >= 0) {
    const q = at(sC), nx = -q.uz, nz = q.ux, clear = 2.3;
    for (const sg of [-1, 1]) {
      const x = q.x + nx * (hw + 0.75) * sg, z = q.z + nz * (hw + 0.75) * sg, b = bedAt(x, z, q.y) - 0.15, top = q.y + clear + 0.5 - b;
      const v = 2 + Math.floor(hash2(x, z, 3) * 2), Pp = stoneParts(v, lodOf), sc = top / Pp.H;
      putStone(bag, v, lodOf, placement(x, b + 0.3, z, -Math.atan2(q.uz, q.ux) + (hash2(x, z, 4) - 0.5) * 0.3, sc), hash2(x, z, 5));
      col.circle(x, z, 0.5, b, q.y + clear + 0.3);
    }
    const span = hw + 1.2;
    bag.add('granite_rough', stoneMerged(14, 2, placement(q.x, q.y + clear + 0.3, q.z, -Math.atan2(nz, nx), (2 * span) / 3.6)));
    const hx = q.x + nx * (hw + 0.75), hz = q.z + nz * (hw + 0.75);
    putStone(bag, 18, lodOf, placement(hx, q.y + clear + 0.7, hz, hash2(hx, hz, 6) * 6, 1.0), 0.5);
    col.rect([Math.min(q.x - nx * span, q.x + nx * span) - 0.4, Math.min(q.z - nz * span, q.z + nz * span) - 0.4, Math.max(q.x - nx * span, q.x + nx * span) + 0.4, Math.max(q.z - nz * span, q.z + nz * span) + 0.4], q.y + clear + 0.02, q.y + clear + 1.6);
  }
}
