// The Bandiagara Escarpment (docs/settlements/dogon.md §1, §4.3): a face of sandstone strata — hard bands proud, soft ones recessed, a pale
// capping layer — built as a lattice from the ground up (2 m across, 1.2 m up) so that it can have alcoves cut into it for the Tellem
// dwellings, and boulders fallen at its foot. The terrain cannot hold a cliff of this height inside the rim (layout.js height), so it is
// built; the face line and the strata are layout.js's (passed in as el.L), the viewer's collider is a wall behind the front.

import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { rng, hv } from './props.js';

const BANDS = ['tuff_red', 'sandstone_rose', 'scoria_red', 'tuff_red', 'sandstone_rose'];

/** cliff_wall: { L: { wallFace, wallZ, wallBase, wallTop, DX, DY, X, ledges: [{ x, w, y }] }, seed } */
export function cliffWall(el, { bag, col }) {
  const { wallFace, wallZ, wallBase, wallTop, DX, DY, X, ledges } = el.L, rand = rng(el.seed || 19), H = 6;
  const n0 = Math.round(-X / DX), n1 = Math.round(X / DX), xs = [], yb = [], yt = [];
  for (let i = n0; i <= n1; i++) { const x = i * DX; xs.push(x); yb.push(wallBase(x) - 1.5); yt.push(Math.max(wallTop(x), wallBase(x) + 0.5)); }
  const jlo = Math.floor(Math.min(...yb) / DY), jhi = Math.ceil(Math.max(...yt) / DY);
  const noise = (i, j) => { let h = Math.imul(i * 73856093 ^ j * 19349663, 83492791); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296 - 0.5; };
  const V = (i, j) => {
    const x = xs[i], y = Math.min(yt[i], Math.max(yb[i], j * DY)), edge = j * DY <= yb[i] || j * DY >= yt[i] ? 0 : 1;
    return [x + noise(i, j + 400) * 0.5 * edge, y, wallZ(x, y) + noise(i, j) * 0.9 * edge];
  };
  const inAlcove = (i, j) => ledges.some((L) => xs[i] >= L.x - L.w / 2 - 1e-6 && xs[i + 1] <= L.x + L.w / 2 + 1e-6 && j * DY >= L.y - 1e-6 && (j + 1) * DY <= L.y + H + 1e-6);
  const T = new Map();
  const push = (m, ...v) => { if (!T.has(m)) T.set(m, []); T.get(m).push(...v); };
  for (let i = 0; i + 1 < xs.length; i++) for (let j = jlo; j < jhi; j++) {
    if (yt[i] <= (j) * DY || yb[i] >= (j + 1) * DY) { if (yt[i + 1] <= j * DY || yb[i + 1] >= (j + 1) * DY) continue; }
    if (inAlcove(i, j)) continue;
    const a = V(i, j), b = V(i + 1, j), c = V(i + 1, j + 1), d = V(i, j + 1);
    if (Math.abs(a[1] - d[1]) < 1e-4 && Math.abs(b[1] - c[1]) < 1e-4) continue;
    const ym = (a[1] + c[1]) / 2, cap = ym > Math.min(yt[i], yt[i + 1]) - 2.4;
    const m = cap ? 'sandstone_yellow' : BANDS[Math.floor(ym / 3.6 + 5) % BANDS.length];
    push(m, ...a, ...b, ...c, ...a, ...c, ...d);
  }
  // the top of the plateau behind the edge, a strip of rock
  for (let i = 0; i + 1 < xs.length; i++) {
    const a = V(i, jhi + 2), b = V(i + 1, jhi + 2), zb = Math.min(a[2], b[2]) - 9;
    if (a[1] <= yb[i] + 0.6 || b[1] <= yb[i + 1] + 0.6) continue;
    push('sandstone_yellow', a[0], a[1], a[2], b[0], b[1], b[2], b[0], b[1], zb, a[0], a[1], a[2], b[0], b[1], zb, a[0], a[1], zb);
  }
  for (const [m, t] of T) bag.add(m, fromTriangles(t));
  // the alcoves: the ledge's floor, the back wall (blackened by smoke), the sides, the overhang over it
  for (const L of ledges) {
    const xa = L.x - L.w / 2, xb = L.x + L.w / 2, y0 = L.y, zF = wallZ(L.x, y0 + 3), zB = zF - 3.4;
    bag.add('tuff_red', box(xa - 0.4, y0 - 1.2, zB, xb + 0.4, y0, zF + 0.45));
    bag.add('scoria_red', box(xa - 0.6, y0, zB - 0.6, xb + 0.6, y0 + H, zB));
    bag.add('tuff_red', box(xa - 0.6, y0, zB - 0.6, xa, y0 + H, zF + 0.1));
    bag.add('tuff_red', box(xb, y0, zB - 0.6, xb + 0.6, y0 + H, zF + 0.1));
    bag.add('tuff_red', box(xa - 0.6, y0 + H, zB - 0.6, xb + 0.6, y0 + H + 1.1, zF + 0.5));
    bag.add('bark_dark', box(xa, y0 + H - 0.04, zB, xb, y0 + H, zF + 0.2));
    // the soot above the dwellings on the back wall, the pale streaks of the swifts' droppings down the face below the ledge
    bag.add('bark_dark', box(xa + 0.3, y0 + 3.6, zB + 0.001, xb - 0.3, y0 + H - 0.04, zB + 0.004));
    for (let k = 0; k < 5; k++) { const sx = xa + 0.5 + rand() * (xb - xa - 1); bag.add('plaster_streak', box(sx, y0 - 1.2 - 2.5 * rand(), zF + 0.46, sx + 0.12 + rand() * 0.2, y0 - 0.02, zF + 0.462)); }
  }
  // bedding ledges: the top of each hard band stands out over the soft one below it, in runs of a few columns, here and there a heavy overhang
  const bandMat = (y) => BANDS[Math.floor(y / 3.6 + 5) % BANDS.length];
  const clear = (i, y) => ledges.some((L) => xs[i + 1] > L.x - L.w / 2 - 0.9 && xs[i] < L.x + L.w / 2 + 0.9 && y > L.y - 1.5 && y < L.y + H + 2.5);
  for (let m = 0; m < 12; m++) {
    const yt0 = 3.6 * (3 * m + 2), j = Math.round(yt0 / DY);
    for (let i = 0; i + 1 < xs.length; i++) {
      if (yt0 < Math.max(yb[i], yb[i + 1]) + 2 || yt0 > Math.min(yt[i], yt[i + 1]) - 3 || clear(i, yt0)) continue;
      const hh = hv(xs[i], yt0, 1);
      if (hh < 0.38) continue;
      const a = V(i, j), b = V(i + 1, j), heavy = hh > 0.93, proj = (heavy ? 1.1 : 0.3) + 0.5 * hv(xs[i], yt0, 2), th = (heavy ? 0.9 : 0.4) + 0.3 * hv(xs[i], yt0, 3);
      const zb = Math.min(a[2], b[2]) - 0.8, zf = Math.max(a[2], b[2]) + proj;
      bag.add(bandMat(yt0 - 0.5), box(a[0], yt0 - th, zb, b[0], yt0 + 0.04, zf));
      if (hv(xs[i], yt0, 4) < 0.5) bag.add(bandMat(yt0 - 0.5), box(a[0] + 0.2, yt0 - th - 0.25, zb, b[0] - 0.3, yt0 - th, zf - 0.35 * hv(xs[i], yt0, 5)));     // the break of the slab's underside
    }
  }
  // vertical joints: dark cracks running down the face where the blocks parted
  for (let q = 0; q < 14; q++) {
    const i = Math.floor(hv(q, 7, 11) * (xs.length - 2)), j0 = Math.round((yb[i] + 3 + hv(q, 7, 12) * Math.max(1, yt[i] - yb[i] - 12)) / DY), n = 3 + Math.floor(hv(q, 7, 13) * 5);
    if (yb[i] + 3 > yt[i] - 6 || clear(i, j0 * DY)) continue;
    for (let j = j0; j < j0 + n; j++) { const a = V(i, j), b = V(i, j + 1); if (b[1] > yt[i] - 2) break; bag.add('bark_dark', rod([a[0], a[1], a[2] + 0.02], [b[0], b[1], b[2] + 0.02], 0.1, 4)); }
  }
  // the ropes of the Tellem: a pair of stakes driven in at the ledge's lip with the rope made fast round them, hanging down the face past the footholds (pegs) cut up it; a beam stub from the overhang with a rope hanging to the floor
  for (const [li, L] of ledges.entries()) {
    const y0 = L.y, zF = wallZ(L.x, y0 + 3) + 0.45, xa = L.x - L.w / 2, xb = L.x + L.w / 2, i = Math.round((L.x - L.w / 2 + 1.6 + hv(li, 3, 20) * (L.w - 4)) / DX - n0);
    const px = xs[Math.max(0, Math.min(xs.length - 2, i))] + 0.5;
    for (const s of [0, 1]) bag.add('bark_dark', rod([px + s * 0.5, y0 - 0.02, zF - 0.1], [px + s * 0.5 + 0.03, y0 + 0.75, zF - 0.1], 0.07, 5));
    bag.add('bark_dark', rod([px - 0.05, y0 + 0.55, zF - 0.1], [px + 0.6, y0 + 0.5, zF - 0.1], 0.04, 4));
    for (const dy of [0.2, 0.4]) bag.add('bark_dark', lathe([[0.085, dy], [0.085, dy + 0.05]], 5, null, px, 0, zF - 0.1));
    const zr = zF + 0.12, len = 7 + 3 * hv(li, 3, 21);
    bag.add('bark_dark', rod([px + 0.25, y0 + 0.5, zF - 0.02], [px + 0.4, y0 - len * 0.5, zr + 0.1], 0.028, 4));
    bag.add('bark_dark', rod([px + 0.4, y0 - len * 0.5, zr + 0.1], [px + 0.3, y0 - len, zr], 0.026, 4));
    for (let k = 0; k < 7; k++) {          // footholds: stubs of wood driven into the face beside the rope
      const yy = y0 - 2.1 - k * 0.8, ii = Math.max(0, Math.min(xs.length - 2, i)), jj = Math.floor(yy / DY), fr = (yy - jj * DY) / DY;
      const za = V(ii, jj), zb2 = V(ii + 1, jj), zc = V(ii, jj + 1), zd = V(ii + 1, jj + 1), u = 0.25;
      const zf2 = ((za[2] * (1 - u) + zb2[2] * u) * (1 - fr) + (zc[2] * (1 - u) + zd[2] * u) * fr);
      const bx = xs[ii] + u * DX + (k % 2 ? 0.35 : -0.05);
      bag.add('bark_dark', rod([bx, yy, zf2 - 0.35], [bx + 0.02, yy + 0.04, zf2 + 0.28], 0.032, 4));
    }
    const bxm = L.x + (hv(li, 3, 22) - 0.5) * (L.w - 3);
    bag.add('bark_dark', rod([bxm, y0 + H + 0.45, zF - 0.4], [bxm, y0 + H + 0.5, zF + 0.7], 0.075, 5));
    bag.add('bark_dark', rod([bxm, y0 + H + 0.45, zF + 0.62], [bxm + 0.06, y0 + 0.4, zF + 0.7], 0.022, 4));
    void xa; void xb;
  }
  // blocks fallen from the face, angular, tilted, half sunk in the ground at its foot, in drifts; and the scree of small stones about them
  const block = (x, y, z, a, b, c, k, mat) => {
    const yaw = hv(x, z, 30) * 6.28, cs = Math.cos(yaw), sn = Math.sin(yaw), tl = (hv(x, z, 31) - 0.5) * 0.5, T = [];
    const P = [];
    for (let q = 0; q < 8; q++) {
      const sx = q & 1 ? 1 : -1, sy = q & 2 ? 1 : -1, sz = q & 4 ? 1 : -1, j = 1 + 0.22 * (hv(x + q, z, 32) - 0.5), top = sy > 0 ? 0.85 + 0.3 * hv(x, z + q, 33) : 1;
      let lx = sx * a * j, ly = (sy > 0 ? b * top : -b * 0.5), lz = sz * c * j;
      ly += lx * tl;
      P.push([x + lx * cs - lz * sn, y + ly + b * 0.35, z + lx * sn + lz * cs]);
    }
    const F = [[0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1], [2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3]];
    for (const f of F) T.push(...P[f[0]], ...P[f[1]], ...P[f[2]], ...P[f[0]], ...P[f[2]], ...P[f[3]]);
    // flip any triangle facing inward
    let cx = 0, cy = 0, cz = 0; for (const p of P) { cx += p[0] / 8; cy += p[1] / 8; cz += p[2] / 8; }
    for (let i = 0; i < T.length; i += 9) {
      const ux = T[i + 3] - T[i], uy = T[i + 4] - T[i + 1], uz = T[i + 5] - T[i + 2], vx = T[i + 6] - T[i], vy = T[i + 7] - T[i + 1], vz = T[i + 8] - T[i + 2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, mx = (T[i] + T[i + 3] + T[i + 6]) / 3 - cx, my = (T[i + 1] + T[i + 4] + T[i + 7]) / 3 - cy, mz = (T[i + 2] + T[i + 5] + T[i + 8]) / 3 - cz;
      if (nx * mx + ny * my + nz * mz < 0) for (let q = 0; q < 3; q++) { const t = T[i + 3 + q]; T[i + 3 + q] = T[i + 6 + q]; T[i + 6 + q] = t; }
    }
    bag.add(mat, fromTriangles(T)); void k;
  };
  for (let k = 0; k < 90; k++) {          // the round boulders, weathered
    const x = (rand() * 2 - 1) * X * 0.92, zf = wallFace(x), z = zf + 1.2 + rand() * rand() * 7, r = 0.35 + rand() * rand() * 1.9, y = el.L.ground(x, z);
    if (el.L.ground(x, z) > wallBase(x) + 6) continue;
    bag.add(rand() < 0.7 ? 'rock_boulder' : 'tuff_red', lathe([[r * 0.7, -0.4], [r, r * 0.35], [r * 0.8, r * 0.75], [r * 0.4, r * 0.95], [0.001, r * 0.9]], 7, (t, i) => 1 + 0.22 * Math.sin(t * 3 + i * 2.1 + k), x, y, z));
  }
  for (let k = 0; k < 130; k++) {          // the angular blocks
    const x = (hv(k, 1, 40) * 2 - 1) * X * 0.92, z = wallFace(x) + 0.8 + hv(k, 1, 41) * hv(k, 1, 42) * 9, s = 0.35 + hv(k, 1, 43) * hv(k, 1, 44) * 1.7;
    if (el.L.ground(x, z) > wallBase(x) + 6) continue;
    block(x, el.L.ground(x, z) - 0.15, z, s * (0.7 + 0.6 * hv(k, 1, 45)), s * (0.5 + 0.5 * hv(k, 1, 46)), s * (0.7 + 0.6 * hv(k, 1, 47)), k, hv(k, 1, 48) < 0.45 ? 'rock_boulder' : bandMat(hv(k, 1, 49) * 18));
  }
  for (let k = 0; k < 420; k++) {          // the scree
    const x = (hv(k, 2, 50) * 2 - 1) * X * 0.92, z = wallFace(x) + 0.5 + Math.pow(hv(k, 2, 51), 1.6) * 11, s = 0.07 + 0.16 * hv(k, 2, 52);
    if (el.L.ground(x, z) > wallBase(x) + 7) continue;
    block(x, el.L.ground(x, z) - 0.02, z, s * 1.2, s * 0.6, s, k, hv(k, 2, 53) < 0.5 ? 'rock_boulder' : 'tuff_red');
  }
  // the collider: a wall behind the face's forward-most line in each 6 m
  for (let i = 0; i + 3 <= xs.length - 1; i += 3) {
    let zmax = -1e9, ymin = 1e9, ymax = -1e9;
    for (let k = i; k <= i + 3; k++) { zmax = Math.max(zmax, wallFace(xs[k]) + 0.5); ymin = Math.min(ymin, yb[k]); ymax = Math.max(ymax, yt[k]); }
    col.rect([xs[i] - 0.1, zmax - 14, xs[i + 3] + 0.1, zmax], ymin - 1, ymax + 1);
  }
}
