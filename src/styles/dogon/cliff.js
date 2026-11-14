// The Bandiagara Escarpment (docs/settlements/dogon.md §1, §4.3): a face of sandstone strata — hard bands proud, soft ones recessed, a pale
// capping layer — built as a lattice from the ground up (2 m across, 1.2 m up) so that it can have alcoves cut into it for the Tellem
// dwellings, and boulders fallen at its foot. The terrain cannot hold a cliff of this height inside the rim (layout.js height), so it is
// built; the face line and the strata are layout.js's (passed in as el.L), the viewer's collider is a wall behind the front.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { rng } from './props.js';

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
  // boulders fallen at the foot, in drifts
  for (let k = 0; k < 150; k++) {
    const x = (rand() * 2 - 1) * X * 0.92, zf = wallFace(x), z = zf + 1.2 + rand() * rand() * 7, r = 0.35 + rand() * rand() * 1.9, y = el.L.ground(x, z);
    if (el.L.ground(x, z) > wallBase(x) + 6) continue;
    bag.add(rand() < 0.7 ? 'rock_boulder' : 'tuff_red', lathe([[r * 0.7, -0.4], [r, r * 0.35], [r * 0.8, r * 0.75], [r * 0.4, r * 0.95], [0.001, r * 0.9]], 7, (t, i) => 1 + 0.22 * Math.sin(t * 3 + i * 2.1 + k), x, y, z));
  }
  // the collider: a wall behind the face's forward-most line in each 6 m
  for (let i = 0; i + 3 <= xs.length - 1; i += 3) {
    let zmax = -1e9, ymin = 1e9, ymax = -1e9;
    for (let k = i; k <= i + 3; k++) { zmax = Math.max(zmax, wallFace(xs[k]) + 0.5); ymin = Math.min(ymin, yb[k]); ymax = Math.max(ymax, yt[k]); }
    col.rect([xs[i] - 0.1, zmax - 14, xs[i + 3] + 0.1, zmax], ymin - 1, ymax + 1);
  }
}
