// One tile of the planet's ground as typed arrays, for the terrain workers (and the tools): a cube
// face's square of the sphere at some level of detail, N × N cells, its vertices on the ground in
// planet coordinates, with normals, what covers the ground, and the sea over it where there is sea.
// A skirt hangs from the edges so that tiles of different detail meet without cracks.

import { PLANET_RADIUS as R, surface, coverAt, seaHeight } from './relief.js';

/** The six faces of the cube: normal n and the in-face axes a, b (a × b = n). */
export const FACES = [
  { n: [1, 0, 0], a: [0, 0, -1], b: [0, 1, 0] },
  { n: [-1, 0, 0], a: [0, 0, 1], b: [0, 1, 0] },
  { n: [0, 1, 0], a: [1, 0, 0], b: [0, 0, -1] },
  { n: [0, -1, 0], a: [1, 0, 0], b: [0, 0, 1] },
  { n: [0, 0, 1], a: [1, 0, 0], b: [0, 1, 0] },
  { n: [0, 0, -1], a: [-1, 0, 0], b: [0, 1, 0] },
];

/** Direction for face f at face coordinates s, t in −1…1 (tangent-warped: cells of even size). */
export function faceDir(f, s, t) {
  const F = FACES[f], ts = Math.tan(s * Math.PI / 4), tt = Math.tan(t * Math.PI / 4);
  const x = F.n[0] + F.a[0] * ts + F.b[0] * tt, y = F.n[1] + F.a[1] * ts + F.b[1] * tt, z = F.n[2] + F.a[2] * ts + F.b[2] * tt;
  const l = Math.hypot(x, y, z);
  return [x / l, y / l, z / l];
}

/** Face and face coordinates of a direction: [face, s, t]. */
export function dirFace(u) {
  let best = 0, bd = -2;
  for (let f = 0; f < 6; f++) { const n = FACES[f].n, d = u[0] * n[0] + u[1] * n[1] + u[2] * n[2]; if (d > bd) { bd = d; best = f; } }
  const F = FACES[best], a = u[0] * F.a[0] + u[1] * F.a[1] + u[2] * F.a[2], b = u[0] * F.b[0] + u[1] * F.b[1] + u[2] * F.b[2];
  return [best, Math.atan(a / bd) / (Math.PI / 4), Math.atan(b / bd) / (Math.PI / 4)];
}

/** The square of a tile in face coordinates: [s0, t0, size]. */
export function tileRect(level, i, j) { const size = 2 / (1 << level); return [-1 + i * size, -1 + j * size, size]; }

/**
 * Build tile (face, level, i, j) with n cells a side. Returns { position, normal, ground, ground2,
 * ground3, index, minH, maxH, water?: { position, depth, index } }.
 */
export function buildTile(face, level, i, j, n = 32) {
  const [s0, t0, size] = tileRect(level, i, j);
  const W = n + 3;                                    // one extra ring of samples for normals
  const P = new Float64Array(W * W * 3), G = new Array(W * W), U = new Array(W * W);
  for (let b = 0; b < W; b++) for (let a = 0; a < W; a++) {
    const u = faceDir(face, s0 + size * (a - 1) / n, t0 + size * (b - 1) / n);
    const g = surface(u), r = R + g.h, k = b * W + a;
    P[k * 3] = u[0] * r; P[k * 3 + 1] = u[1] * r; P[k * 3 + 2] = u[2] * r;
    G[k] = g; U[k] = u;
  }
  const verts = (n + 1) * (n + 1), skirt = 4 * n, total = verts + skirt;
  const position = new Float32Array(total * 3), normal = new Float32Array(total * 3);
  const ground = new Float32Array(total * 4), ground2 = new Float32Array(total * 4), ground3 = new Float32Array(total * 4);
  let minH = Infinity, maxH = -Infinity;
  const at = (a, b) => (b + 1) * W + (a + 1);
  let v = 0;
  const put = (a, b, drop) => {
    const k = at(a, b), u = U[k], g = G[k];
    const ka = at(a + 1, b), kb = at(a - 1, b), kc = at(a, b + 1), kd = at(a, b - 1);
    const ex = P[ka * 3] - P[kb * 3], ey = P[ka * 3 + 1] - P[kb * 3 + 1], ez = P[ka * 3 + 2] - P[kb * 3 + 2];
    const fx = P[kc * 3] - P[kd * 3], fy = P[kc * 3 + 1] - P[kd * 3 + 1], fz = P[kc * 3 + 2] - P[kd * 3 + 2];
    let nx = ey * fz - ez * fy, ny = ez * fx - ex * fz, nz = ex * fy - ey * fx;
    const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    const up = nx * u[0] + ny * u[1] + nz * u[2];
    const r = R + g.h - drop;
    position[v * 3] = u[0] * r; position[v * 3 + 1] = u[1] * r; position[v * 3 + 2] = u[2] * r;
    normal[v * 3] = nx; normal[v * 3 + 1] = ny; normal[v * 3 + 2] = nz;
    if (!drop) {
      const c = coverAt(g, up, u);
      ground[v * 4] = c.sand; ground[v * 4 + 1] = c.grass; ground[v * 4 + 2] = c.rock; ground[v * 4 + 3] = c.soil;
      ground2[v * 4] = c.fields; ground2[v * 4 + 1] = c.dry; ground2[v * 4 + 2] = c.warmth; ground2[v * 4 + 3] = c.red;
      ground3[v * 4] = c.road; ground3[v * 4 + 1] = c.snow; ground3[v * 4 + 2] = c.forest; ground3[v * 4 + 3] = g.s ? g.s.w : 0;   // (w: on a settlement's disc, which keeps its own season)
      minH = Math.min(minH, g.h); maxH = Math.max(maxH, g.h);
    }
    return v++;
  };
  for (let b = 0; b <= n; b++) for (let a = 0; a <= n; a++) put(a, b, 0);
  const idx = [];
  const id = (a, b) => b * (n + 1) + a;
  for (let b = 0; b < n; b++) for (let a = 0; a < n; a++) {
    const p = id(a, b), q = id(a + 1, b), r = id(a + 1, b + 1), s = id(a, b + 1);
    if ((a + b) & 1) idx.push(p, q, r, p, r, s); else idx.push(p, q, s, q, r, s);
  }
  // skirt: the edge ring copied, dropped, joined to the edge (its cover copied from the edge)
  const drop = Math.max(2, size * Math.PI / 4 * R / n * 1.2);
  const ring = [];
  for (let a = 0; a < n; a++) ring.push([a, 0]);
  for (let b = 0; b < n; b++) ring.push([n, b]);
  for (let a = n; a > 0; a--) ring.push([a, n]);
  for (let b = n; b > 0; b--) ring.push([0, b]);
  const top = ring.map(([a, b]) => id(a, b));
  const low = ring.map(([a, b]) => { const w = put(a, b, drop), t = id(a, b); ground.copyWithin(w * 4, t * 4, t * 4 + 4); ground2.copyWithin(w * 4, t * 4, t * 4 + 4); ground3.copyWithin(w * 4, t * 4, t * 4 + 4); return w; });
  for (let k = 0; k < ring.length; k++) {
    const k2 = (k + 1) % ring.length;
    idx.push(top[k], top[k2], low[k2], top[k], low[k2], low[k]);
  }
  const out = { position, normal, ground, ground2, ground3, index: total > 65535 ? new Uint32Array(idx) : new Uint16Array(idx), minH, maxH };
  if (minH < 0.4) out.water = buildWater(face, s0, t0, size, Math.max(4, n / 2), (a, b) => G[at(a * 2, b * 2)]);
  return out;
}

/**
 * The sea's surface over a tile: m × m cells at the sea's level (relief.js, seaHeight: the sphere,
 * or over the disc of a settlement on the sea the plane of its sea level), with the depth below
 * each vertex. On a settlement's disc whose water is its own the sea is kept under the ground — its
 * cells there left out, the vertices it shares with cells beyond sunk below the ground — so that a
 * valley, a gorge or a cenote below the sea's level stays dry, and the settlement's own river or
 * moat is not covered by the sea at another level.
 */
const SINK = 20;
function buildWater(face, s0, t0, size, m, gAt) {
  const verts = (m + 1) * (m + 1), total = verts + 4 * m;
  const position = new Float32Array(total * 3), depth = new Float32Array(total);
  const dry = new Uint8Array(verts);
  let v = 0;
  const put = (a, b, drop) => {
    const u = faceDir(face, s0 + size * a / m, t0 + size * b / m), g = gAt(a, b), sh = seaHeight(g, u);
    const r = R - drop + (sh ?? Math.min(0, g.h) - SINK);
    position[v * 3] = u[0] * r; position[v * 3 + 1] = u[1] * r; position[v * 3 + 2] = u[2] * r;
    depth[v] = Math.max(0, (sh ?? 0) - g.h);
    if (v < verts) dry[v] = sh == null ? 1 : 0;
    return v++;
  };
  for (let b = 0; b <= m; b++) for (let a = 0; a <= m; a++) put(a, b, 0);
  const idx = [], id = (a, b) => b * (m + 1) + a;
  for (let b = 0; b < m; b++) for (let a = 0; a < m; a++) {
    const p = id(a, b), q = id(a + 1, b), r = id(a + 1, b + 1), s = id(a, b + 1);
    if (dry[p] && dry[q] && dry[r] && dry[s]) continue;
    idx.push(p, q, r, p, r, s);
  }
  const ring = [];
  for (let a = 0; a < m; a++) ring.push([a, 0]);
  for (let b = 0; b < m; b++) ring.push([m, b]);
  for (let a = m; a > 0; a--) ring.push([a, m]);
  for (let b = m; b > 0; b--) ring.push([0, b]);
  const top = ring.map(([a, b]) => id(a, b)), low = ring.map(([a, b]) => put(a, b, 1.5));
  for (let k = 0; k < ring.length; k++) { const k2 = (k + 1) % ring.length; if (dry[top[k]] && dry[top[k2]]) continue; idx.push(top[k], top[k2], low[k2], top[k], low[k2], low[k]); }
  if (!idx.length) return null;
  return { position, depth, index: new Uint16Array(idx) };
}
