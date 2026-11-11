// Sudano-Sahelian architecture of Djenné (docs/settlements/djenne.md §4–§5): walls of sun-dried
// mudbrick under banco plaster, thick and battered, ribbed with pilasters that rise above the roof
// as conical pinnacles; bundles of palm-wood sticks (toron) standing out of the walls as scaffolding
// for the yearly replastering; flat roofs on palm beams, drained by clay spouts; the Great Mosque on
// its high platform with three towers on its qibla wall; town houses of two storeys with a
// buttressed facade round the door (the "Tukulor" front), roof terraces behind parapets.

import { registerStyle, STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, frustum } from '../../core/geom.js';
import '../qing/index.js';
import { beamTris } from '../ming/index.js';
import { shopRow, courtHouse } from './interiors.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const B = 'banco_rough';      // hand-smeared at each year's crépissage: lumpy, runnelled
/** A square, tapering mass (flat faces): half-width r0 at y0 to r1 at y1, a cone of height cap on top. */
function taper(bag, x, z, y0, y1, r0, r1, cap = 0) {
  bag.add(B, frustum([x - r0, z - r0, x + r0, z + r0], y0, y1, r0 - r1, r0 - r1, r0 - r1, r0 - r1));
  if (cap > 0) bag.add(B, lathe([[r1 * 1.05, 0], [r1 * 0.6, cap * 0.6], [0.05, cap]], 8, null, x, y1, z));
}

/** Flip each triangle so that it faces along want(centroid). */
export function orientBy(tris, want) {
  for (let i = 0; i < tris.length; i += 9) {
    const a = [tris[i], tris[i + 1], tris[i + 2]], b = [tris[i + 3], tris[i + 4], tris[i + 5]], c = [tris[i + 6], tris[i + 7], tris[i + 8]];
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const w = want([(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3]);
    if (n[0] * w[0] + n[1] * w[1] + n[2] * w[2] < 0) for (let k = 0; k < 3; k++) { const t = tris[i + 3 + k]; tris[i + 3 + k] = tris[i + 6 + k]; tris[i + 6 + k] = t; }
  }
  return tris;
}
/**
 * The solid over a pointed arch between zA and zB in a wall at x (half-thickness t): from the arch
 * (springing at ys, two arcs of radius 0.75 × the span) up to yT; its faces and the soffit.
 */
export function pointedSpandrel(out, x, t, zA, zB, ys, yT, alongX = false, kR = 0.75) {
  const span = zB - zA, R = span * kR, N = 10, P = [];
  for (let k = 0; k <= N; k++) {
    const z = zA + span * k / N, c = z <= zA + span / 2 ? zA + R : zB - R;
    P.push([z, Math.min(yT - 0.05, ys + Math.sqrt(Math.max(0, R * R - (z - c) * (z - c))))]);
  }
  const V = (sx, z, y) => (alongX ? [z, y, x + sx * t] : [x + sx * t, y, z]), loc = [];
  const q = (a, b, c, d) => loc.push(...a, ...b, ...c, ...a, ...c, ...d);
  for (let k = 0; k < N; k++) {
    const [za, ya] = P[k], [zb, yb] = P[k + 1];
    for (const sx of [-1, 1]) q(V(sx, za, ya), V(sx, zb, yb), V(sx, zb, yT), V(sx, za, yT));
    q(V(-1, za, ya), V(1, za, ya), V(1, zb, yb), V(-1, zb, yb));
  }
  const mid = zA + span / 2;
  out.push(...orientBy(loc, (p) => {
    const across = alongX ? p[2] - x : p[0] - x, along = alongX ? p[0] : p[2];
    if (Math.abs(Math.abs(across) - t) < 1e-4) return alongX ? [0, 0, Math.sign(across)] : [Math.sign(across), 0, 0];
    return alongX ? [-(along - mid) * 0.3, -1, 0] : [0, -1, -(along - mid) * 0.3];
  }));
}
/** A half-pipe spout (the open trough upward) from p along the horizontal unit d, length L, radius r: inner and outer faces. */
function halfPipe(p, d, L, r) {
  const N = 6, ex = [-d[2], 0, d[0]], loc = [], th = 0.025;
  const P = (s, a, rr) => [p[0] + d[0] * s + ex[0] * Math.cos(a) * rr, p[1] - Math.sin(a) * rr - s * 0.06, p[2] + d[2] * s + ex[2] * Math.cos(a) * rr];
  const q = (a, b, c, e) => loc.push(...a, ...b, ...c, ...a, ...c, ...e);
  for (let k = 0; k < N; k++) {
    const a0 = Math.PI * k / N, a1 = Math.PI * (k + 1) / N;
    for (const rr of [r, r + th]) q(P(0, a0, rr), P(L, a0, rr), P(L, a1, rr), P(0, a1, rr));
    q(P(L, a0, r), P(L, a0, r + th), P(L, a1, r + th), P(L, a1, r));
  }
  for (const a of [0, Math.PI]) q(P(0, a, r), P(L, a, r), P(L, a, r + th), P(0, a, r + th));
  return orientBy(loc, (c) => {
    const s = (c[0] - p[0]) * d[0] + (c[2] - p[2]) * d[2];
    if (s > L - 0.01) return d;
    const ax = [p[0] + d[0] * s, p[1] - s * 0.06, p[2] + d[2] * s], v = [c[0] - ax[0], c[1] - ax[1], c[2] - ax[2]], rr = Math.hypot(...v);
    if (rr < 1e-6 || Math.abs(c[1] - ax[1]) < 1e-3) return [0, 1, 0];
    return rr > r + th / 2 ? v : v.map((x) => -x);
  });
}

/**
 * A wall of banco from a to b { h, th, batter }: a slab leaning in a little, pilasters every `step` m
 * rising above it as pinnacles, rows of toron. opts.gaps: openings [{ s0, s1 (metres along the wall
 * from a), top (height of the opening), arch (a pointed head springing at top) }]; opts.skip:
 * stretches [s0, s1] along the wall kept clear of pilasters and toron (where a tower stands against it).
 */
function bancoWall(bag, col, a, b, y, h, th, opts = {}) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 0.2) return;
  const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = -uz, nz = ux, out = opts.out ?? 1;
  const at = (s) => [a[0] + ux * s, a[1] + uz * s];
  const gaps = (opts.gaps || []).slice().sort((p, q) => p.s0 - q.s0), t = [];
  // the solid stretches between the openings, then over each opening a lintel or a pointed head
  let s0 = 0;
  for (const g of [...gaps, { s0: L, s1: L }]) {
    if (g.s0 - s0 > 0.01) { const p = at(s0), q = at(g.s0); beamTris(t, [p[0], y, p[1]], [q[0], y, q[1]], th / 2, h); col.segment(p, q, th, y, y + h); }
    s0 = g.s1;
  }
  const heads = [];
  for (const g of gaps) {
    const p = at(g.s0), q = at(g.s1);
    if (g.arch) {
      const alongX = Math.abs(ux) > 0.5, c = alongX ? a[1] : a[0], u0 = alongX ? Math.min(p[0], q[0]) : Math.min(p[1], q[1]), u1 = alongX ? Math.max(p[0], q[0]) : Math.max(p[1], q[1]);
      pointedSpandrel(heads, c, th / 2, u0, u1, y + g.top, y + h, alongX);
    } else {
      beamTris(t, [p[0], y + g.top, p[1]], [q[0], y + g.top, q[1]], th / 2, h - g.top);
      // the palm-wood lintel showing in the soffit
      const lt = []; beamTris(lt, [p[0] - ux * 0.25, y + g.top - 0.12, p[1] - uz * 0.25], [q[0] + ux * 0.25, y + g.top - 0.12, q[1] + uz * 0.25], th / 2 - 0.08, 0.12); bag.add('timber', fromTriangles(lt));
    }
    col.segment(p, q, th, y + g.top, y + h);
  }
  bag.add(B, fromTriangles(t));
  if (heads.length) bag.add(B, fromTriangles(heads));
  const step = opts.step ?? 3.2, n = Math.max(1, Math.round(L / step)), pw = opts.pw ?? 0.7, pd = opts.pd ?? 0.55, ph = opts.ph ?? 1.4;
  const clear = [...gaps.map((g) => [g.s0, g.s1]), ...(opts.skip || [])], free = (s, m) => !clear.some(([c0, c1]) => s > c0 - m && s < c1 + m);
  const rand = rng(opts.seed || 3);
  // a year's rain on the face (opts.erode): between the pilasters the plaster washed off the foot of the
  // wall by the splash, showing the bricks, and runnels washed pale down from the parapet
  if (opts.erode !== false) erode(bag, (s, d) => [a[0] + ux * s + nx * d * out, a[1] + uz * s + nz * d * out], L, n, y, h, th / 2, (s, m) => free(s, m) && Math.abs(s - Math.round(s / (L / n)) * (L / n)) > pw * 0.8 + m, rng((opts.seed || 3) * 31 + 7));
  for (let k = 0; k <= n; k++) {
    const s = k * L / n, x = a[0] + ux * s + nx * (th / 2 + pd / 2) * out, z = a[1] + uz * s + nz * (th / 2 + pd / 2) * out;
    if (!free(s, pw * 0.8 + 0.1)) continue;
    // the pilaster, battered: wider at its foot
    taper(bag, x, z, y, y + h, pw * 0.8, pw * 0.6, ph);
    // toron: palm sticks standing out in rows
    if (opts.toron !== false) {
      const tt = [];
      for (let r = 1; r <= Math.floor(h / 1.5); r++) for (const f of [0.25, 0.5, 0.75]) {
        if (rand() < 0.15 || s + step * f > L || !free(s + step * f, 0.15)) continue;
        const ty = y + r * 1.5 - 0.35 + (rand() - 0.5) * 0.12, tx = a[0] + ux * (s + step * f) + nx * (th / 2) * out, tz = a[1] + uz * (s + step * f) + nz * (th / 2) * out, len = 0.75 + rand() * 0.35;
        beamTris(tt, [tx, ty, tz], [tx + nx * len * out, ty + 0.03, tz + nz * len * out], 0.06, 0.1);
      }
      if (tt.length) bag.add('timber', fromTriangles(tt));
    }
  }
}

/**
 * The year's erosion on a banco face (docs/settlements/djenne.md §13), before the replastering: P(s, d) a point
 * s along the face and d out from the wall's middle plane (the face at d = face); n bays; ok(s, m) a place
 * clear of the pilasters and openings by m. Patches at the foot where the splash has washed the plaster off
 * and the mud bricks show, a few higher up; runnels washed paler down from the top. Each stands 1.5 cm proud.
 */
export function erode(bag, P, L, n, y, h, face, ok, rand, foot = 0.02) {
  const bricks = [], wash = [];
  const strip = (out, s0, s1, y0, y1, e = 0.015) => { if (s1 - s0 < 0.1 || y1 - y0 < 0.05) return; const p = P(s0, face), q = P(s1, face); beamTris(out, [p[0], y0, p[1]], [q[0], y0, q[1]], e, y1 - y0); };
  for (let k = 0; k < n; k++) {
    const bay = L / n, c = (k + 0.5) * bay;
    if (rand() < 0.55) { const w = 0.5 + rand() * Math.min(1.2, bay * 0.45), s0 = c - w / 2 + (rand() - 0.5) * bay * 0.2; if (ok(s0, 0.05) && ok(s0 + w, 0.05)) strip(bricks, s0, s0 + w, y + foot, y + foot + 0.25 + rand() * 0.7); }
    if (rand() < 0.12 && h > 3) { const w = 0.3 + rand() * 0.5, s0 = c + (rand() - 0.5) * bay * 0.4, y0 = y + 1.2 + rand() * (h - 2.5); if (ok(s0, 0.05) && ok(s0 + w, 0.05)) strip(bricks, s0, s0 + w, y0, y0 + 0.2 + rand() * 0.35); }
    if (rand() < 0.5) { const w = 0.1 + rand() * 0.16, s0 = c + (rand() - 0.5) * bay * 0.5; if (ok(s0, 0.05) && ok(s0 + w, 0.05)) strip(wash, s0, s0 + w, y + h * (0.25 + rand() * 0.3), y + h - 0.05, 0.012); }
  }
  if (bricks.length) bag.add('mudbrick', fromTriangles(bricks));
  if (wash.length) bag.add('mud_plaster', fromTriangles(wash));
}
/** An axis-aligned slab of banco [x0, z0, x1, z1] from y0 to y1, pierced by holes [u0, u1, v0, v1] (u along its long side). */
export function piercedSlab(bag, col, mat, r, y0, y1, holes = []) {
  const [x0, z0, x1, z1] = r, alongX = x1 - x0 >= z1 - z0, A0 = alongX ? x0 : z0, A1 = alongX ? x1 : z1;
  const cuts = [...new Set([A0, A1, ...holes.flatMap((h) => [h[0], h[1]])])].filter((u) => u >= A0 && u <= A1).sort((p, q) => p - q);
  const put = (u0, u1, v0, v1) => {
    const b = alongX ? [u0, z0, u1, z1] : [x0, u0, x1, u1];
    bag.add(mat, box(b[0], v0, b[1], b[2], v1, b[3])); col.rect(b, v0, v1);
  };
  for (let i = 0; i < cuts.length - 1; i++) {
    const u0 = cuts[i], u1 = cuts[i + 1], m = (u0 + u1) / 2, hs = holes.filter((h) => m > h[0] && m < h[1]).sort((p, q) => p[2] - q[2]);
    let v = y0;
    for (const h of hs) { if (h[2] > v + 0.01) put(u0, u1, v, h[2]); v = Math.max(v, h[3]); }
    if (y1 > v + 0.01) put(u0, u1, v, y1);
  }
}
/** A flight of mud-brick steps over rect rising from y0 to y1 toward dir, solid down to base. */
function bancoFlight(bag, col, rect, y0, y1, dir, base) {
  const [x0, z0, x1, z1] = rect, along = dir === 'e' || dir === 'w' ? 'x' : 'z', L = along === 'x' ? x1 - x0 : z1 - z0;
  const n = Math.max(1, Math.round((y1 - y0) / 0.19)), h = (y1 - y0) / n, d = L / n, sg = dir === 'e' || dir === 's' ? 1 : -1;
  for (let k = 0; k < n; k++) {
    const yk = y0 + (k + 1) * h, a = sg > 0 ? (along === 'x' ? x0 : z0) + k * d : (along === 'x' ? x1 : z1) - (k + 1) * d;
    const lo = base ?? yk - h - 0.25;
    if (along === 'x') bag.add('banco_smooth', box(a, lo, z0, a + d, yk, z1)); else bag.add('banco_smooth', box(x0, lo, a, x1, yk, a + d));
  }
  col.ramp(rect, y0, y1, dir);
}
/**
 * The stair tower at the south-west corner of the prayer hall (Wikipedia: two square towers hold
 * the stairs to the roof, one at the hall's south-west corner): a square tower against the hall's
 * south wall { r (its outer footprint), py, top (the roof's walking level) }, entered from the
 * hall; inside, flights of steep banco steps winding round a solid newel, landings at the corners,
 * a door at the top onto the roof; pinnacles at its corners, toron on its outer faces.
 */
function stairTower(bag, col, { r, py, top, door, exit }) {
  const [x0, z0, x1, z1] = r, w = 0.6, I = [x0 + w, z0 + w, x1 - w, z1 - w], lane = 1.6, H = top + 2.4;
  const cx0 = I[0] + lane, cx1 = I[2] - lane, cz0 = I[1] + lane, cz1 = I[3] - lane;
  // the walls, pierced by the door from the hall and the door at the top, small slit windows
  piercedSlab(bag, col, B, [x0, z0, x1, z0 + w], py, H, [door, exit]);
  piercedSlab(bag, col, B, [x0, z1 - w, x1, z1], py, H, [[(x0 + x1) / 2 - 0.12, (x0 + x1) / 2 + 0.12, py + 4.2, py + 4.9], [(x0 + x1) / 2 - 0.12, (x0 + x1) / 2 + 0.12, py + 9.2, py + 9.9]]);
  for (const xx of [x0, x1 - w]) piercedSlab(bag, col, B, [xx, z0 + w, xx + w, z1 - w], py, H, [[(z0 + z1) / 2 - 0.12, (z0 + z1) / 2 + 0.12, py + 2.4, py + 3.1], [(z0 + z1) / 2 - 0.12, (z0 + z1) / 2 + 0.12, py + 7.4, py + 8.1]]);
  // the newel, solid to the roof
  bag.add('banco_smooth', box(cx0, py, cz0, cx1, H, cz1)); col.rect([cx0, cz0, cx1, cz1], py, H);
  // flights round the newel, clockwise seen from above: east lane south, south lane west, west lane north, north lane east…
  const legs = [
    { f: [cx1, cz0, I[2], cz1], dir: 's', land: [cx1, cz1, I[2], I[3]] },
    { f: [cx0, cz1, cx1, I[3]], dir: 'w', land: [I[0], cz1, cx0, I[3]] },
    { f: [I[0], cz0, cx0, cz1], dir: 'n', land: [I[0], I[1], cx0, cz0] },
    { f: [cx0, I[1], cx1, cz0], dir: 'e', land: [cx1, I[1], I[2], cz0] },
  ];
  const nF = Math.round((top - py) / 1.5), rise = (top - py) / nF;
  for (let k = 0; k < nF; k++) {
    const L = legs[k % 4], ya = py + k * rise, yb = ya + rise, low = k < 3;
    bancoFlight(bag, col, L.f, ya, yb, L.dir, low ? py : null);
    bag.add('banco_smooth', box(L.land[0], low ? py : yb - 0.3, L.land[1], L.land[2], yb, L.land[3]));
    col.floor(L.land, yb);
    if (low) col.rect(L.land, py, yb - 0.5);
    if (low && k > 0) col.rect(L.f, py, ya - 0.1);
  }
  // the doorway at the top onto the roof, its floor; the tower's own roof and parapet
  col.floor([exit[0], z0 - 0.1, exit[1], z0 + w], top);
  bag.add('timber', box(x0, H, z0, x1, H + 0.2, z1));
  bag.add('banco_smooth', box(x0 - 0.15, H + 0.2, z0 - 0.15, x1 + 0.15, H + 0.6, z1 + 0.15));
  for (const [px, pz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) {
    taper(bag, px + (px === x0 ? 0.35 : -0.35), pz + (pz === z0 ? 0.35 : -0.35), H + 0.6, H + 1.0, 0.42, 0.38, 2.2);
  }
  // toron on the three outer faces
  const tt = [];
  for (let k = 1; k < Math.floor((H - py) / 1.6); k++) {
    const yy = py + k * 1.6;
    for (const f of [0.25, 0.5, 0.75]) {
      beamTris(tt, [x0 + (x1 - x0) * f, yy, z1 - 0.05], [x0 + (x1 - x0) * f, yy + 0.03, z1 + 0.8], 0.06, 0.1);
      beamTris(tt, [x0 + 0.05, yy, z0 + (z1 - z0) * f], [x0 - 0.8, yy + 0.03, z0 + (z1 - z0) * f], 0.06, 0.1);
      beamTris(tt, [x1 - 0.05, yy, z0 + (z1 - z0) * f], [x1 + 0.8, yy + 0.03, z0 + (z1 - z0) * f], 0.06, 0.1);
    }
  }
  bag.add('timber', fromTriangles(tt));
}

/**
 * Engaged ribs on the faces of a square battered tower (half-width r0 at y0 to r1 at y1, centred at
 * cx, cz): on each face named in `faces` ('n','s','e','w'), ribs at the fractions ks of the half-width,
 * leaning with the face, rising through the top as small pinnacles; toron in rows between them.
 */
function faceRibs(bag, cx, cz, y0, y1, r0, r1, faces, ks = [-0.5, 0, 0.5], cap = 1.6) {
  const d = r0 - r1, tt = [];
  for (const f of faces) {
    const sx = f === 'e' ? 1 : f === 'w' ? -1 : 0, sz = f === 's' ? 1 : f === 'n' ? -1 : 0;
    for (const k of ks) {
      const sh = -k * d;   // the rib's lateral drift with the batter
      if (sz) {
        const r = sz < 0 ? [cx + k * r0 - 0.3, cz - r0 - 0.32, cx + k * r0 + 0.3, cz - r0 + 0.05] : [cx + k * r0 - 0.3, cz + r0 - 0.05, cx + k * r0 + 0.3, cz + r0 + 0.32];
        bag.add(B, frustum(r, y0, y1, sh + 0.06, -sh + 0.06, sz < 0 ? d + 0.08 : -d, sz < 0 ? -d : d + 0.08));
        bag.add(B, lathe([[0.26, 0], [0.18, cap * 0.7], [0.04, cap]], 8, null, cx + k * r1, y1, cz + sz * (r1 + 0.1)));
      } else {
        const r = sx < 0 ? [cx - r0 - 0.32, cz + k * r0 - 0.3, cx - r0 + 0.05, cz + k * r0 + 0.3] : [cx + r0 - 0.05, cz + k * r0 - 0.3, cx + r0 + 0.32, cz + k * r0 + 0.3];
        bag.add(B, frustum(r, y0, y1, sx < 0 ? d + 0.08 : -d, sx < 0 ? -d : d + 0.08, sh + 0.06, -sh + 0.06));
        bag.add(B, lathe([[0.26, 0], [0.18, cap * 0.7], [0.04, cap]], 8, null, cx + sx * (r1 + 0.1), y1, cz + k * r1));
      }
    }
    for (let r = 1; r < Math.floor((y1 - y0) / 1.6); r++) {
      const yy = y0 + r * 1.6, h = r0 - d * (yy - y0) / (y1 - y0);
      for (let i = 0; i < ks.length - 1; i++) {
        const k = (ks[i] + ks[i + 1]) / 2;
        if (sz) beamTris(tt, [cx + k * h, yy, cz + sz * (h - 0.05)], [cx + k * h, yy + 0.03, cz + sz * (h + 0.8)], 0.06, 0.1);
        else beamTris(tt, [cx + sx * (h - 0.05), yy, cz + k * h], [cx + sx * (h + 0.8), yy + 0.03, cz + k * h], 0.06, 0.1);
      }
    }
  }
  if (tt.length) bag.add('timber', fromTriangles(tt));
}

/**
 * great_mosque: the Great Mosque { c, a (half the platform), py (platform height) }: the platform
 * with its stairs; the prayer hall on the east half (its roof on rows of thick pillars, vents), the
 * court on the west half within high walls; the qibla wall with three square towers crowned with
 * pinnacles and ostrich eggs; entrance towers on the north wall.
 */
function greatMosque(el, { bag, col }) {
  const [cx, cz] = el.c, A = el.a, py = el.py ?? 3;
  bag.add('banco_smooth', box(cx - A, -0.4, cz - A, cx + A, py, cz + A));
  col.floor([cx - A, cz - A, cx + A, cz + A], py);
  col.rect([cx - A, cz - A, cx + A, cz + A], -0.4, py - 0.31);
  for (const [r, dir] of [[[cx - 6, cz + A, cx + 6, cz + A + 5], 'n'], [[cx - 6, cz - A - 5, cx + 6, cz - A], 's'], [[cx - A - 5, cz - 5, cx - A, cz + 5], 'e']]) STYLES.qing.elements.stairs({ rect: r, y0: 0, y1: py, dir, mat: 'banco_smooth' }, { bag, col });
  // the walls: the hall (east part) and the court (west part)
  const x0 = cx - A + 4, x1 = cx + A - 4, z0 = cz - A + 8, z1 = cz + A - 8, xm = cx + 2, H = 10;
  const w = (a, b, opts = {}) => bancoWall(bag, col, a, b, py, opts.h ?? H, 0.9, { step: 3, ph: 2.2, ...opts });
  // the hall's piers in nine arcaded rows between its west wall and the qibla wall, evenly spaced
  const rowX = (i) => xm + 0.45 + (x1 - xm - 0.9) * (i + 0.5) / 9, bayZ = (j) => z0 + (z1 - z0) * (j + 0.5) / 10;
  // the main entrance on the north side (Wikipedia: "The main entrance is on the northern side"),
  // between two entrance towers, into the hall's fourth aisle; the stair tower at the hall's
  // south-west corner (Wikipedia: one of the two roof-stair towers), entered from the hall
  const mainX = (rowX(2) + rowX(3)) / 2, towersX = [mainX - 4.6, mainX + 4.6], ST = [xm, z1, xm + 6.4, z1 + 6.4];
  const stDoor = [(rowX(0) + rowX(1)) / 2 - 0.55, (rowX(0) + rowX(1)) / 2 + 0.55];
  w([x1, z0], [x1, z1], { out: -1, h: 11 });                             // the qibla wall (east), pilasters outside
  w([x0, z0], [x1, z0], { out: -1, gaps: [{ s0: mainX - 1 - x0, s1: mainX + 1 - x0, top: 3.0 }], skip: [[towersX[0] - 2.4 - x0, towersX[1] + 2.4 - x0]] });
  w([x1, z1], [x0, z1], { out: -1, gaps: [{ s0: x1 - stDoor[1], s1: x1 - stDoor[0], top: 2.3 }], skip: [[x1 - ST[2] - 0.2, x1 - ST[0] + 0.2]] });
  w([x0, z1], [x0, (z0 + z1) / 2 + 3], { out: -1, h: 7 }); w([x0, (z0 + z1) / 2 - 3], [x0, z0], { out: -1, h: 7 });
  // the hall's west wall on the court, pierced by pointed-arched openings in line with the bays
  // (Wikipedia: the galleries' walls facing the court are punctuated by arched openings)
  w([xm, z0 + 1], [xm, z1 - 1], { out: 1, h: 9, toron: false, gaps: [1, 3, 4, 5, 6, 8].map((j) => ({ s0: bayZ(j) - 0.9 - (z0 + 1), s1: bayZ(j) + 0.9 - (z0 + 1), top: 2.5, arch: true })) });
  // the galleries round the court on its north, west and south sides (Wikipedia: the court is
  // "surrounded on three sides by galleries", their walls on the court "punctuated by arched
  // openings"; Aramco World: galleries about 4 m wide): an arcade of pointed arches on low pilasters
  // 4 m in from the outer walls, a flat roof of palm beams under banco from it to the outer wall
  { const gw = 4, yR = py + 5.2, xa = x0 + 0.45, xb = xm - 0.45, za = z0 + 0.45, zb = z1 - 0.45;
    const arcade = (a, b, out) => {
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.round(L / 3.2)), p = L / n;
      bancoWall(bag, col, a, b, py, 5.2, 0.6, { out, step: p, pw: 0.42, pd: 0.3, ph: 0.9, toron: false, seed: 11, gaps: Array.from({ length: n }, (_, k) => ({ s0: (k + 0.5) * p - 0.85, s1: (k + 0.5) * p + 0.85, top: 2.5, arch: true })) });
    };
    arcade([xa + gw, za + gw], [xb, za + gw], 1);         // the north gallery, its arches facing south
    arcade([xb, zb - gw], [xa + gw, zb - gw], 1);         // the south gallery
    arcade([xa + gw, zb - gw - 0.3], [xa + gw, za + gw + 0.3], 1);   // the west gallery
    const roof = (r) => {
      bag.add('timber', box(r[0], yR, r[1], r[2], yR + 0.25, r[3]));
      bag.add('banco_smooth', box(r[0] - 0.02, yR + 0.25, r[1] - 0.02, r[2] + 0.02, yR + 0.65, r[3] + 0.02));
      col.rect(r, yR, yR + 0.65); col.floor(r, yR + 0.65);
      // the palm beams showing in the ceiling, across the gallery
      const tt = [], along = r[2] - r[0] > r[3] - r[1], L = along ? r[2] - r[0] : r[3] - r[1], n = Math.floor(L / 0.6);
      for (let k = 0; k < n; k++) { const u = (along ? r[0] : r[1]) + (k + 0.5) * L / n; if (along) beamTris(tt, [u, yR - 0.14, r[1]], [u, yR - 0.14, r[3]], 0.07, 0.14); else beamTris(tt, [r[0], yR - 0.14, u], [r[2], yR - 0.14, u], 0.07, 0.14); }
      bag.add('timber', fromTriangles(tt));
    };
    roof([xa, za, xb, za + gw + 0.3]); roof([xa, zb - gw - 0.3, xb, zb]); roof([xa, za + gw + 0.3, xa + gw + 0.3, zb - gw - 0.3]);
  }
  stairTower(bag, col, { r: [ST[0], ST[1], ST[2], ST[3]], py, top: py + 10.5, door: [stDoor[0], stDoor[1], py, py + 2.3], exit: [ST[0] + 0.75, ST[0] + 2.05, py + 10.5, py + 12.6] });
  // the hall's roof on nine arcaded walls running north–south (docs/settlements/djenne.md §2): each
  // a row of massive piers joined by tall pointed arches, ninety piers in all; the flat roof of palm
  // beams and banco over them, its vents capped with inverted fired bowls
  const ys = py + 4.6, yT = py + 9.6;
  for (let i = 0; i < 9; i++) {
    const x = rowX(i), t = 0.55, piers = [];
    for (let j = 0; j <= 10; j++) piers.push(z0 + (z1 - z0) * j / 10);
    for (const [j, z] of piers.entries()) {
      const hz = j === 0 || j === 10 ? 0.7 : 0.8;
      bag.add('banco_smooth', box(x - t, py, z - hz, x + t, yT, z + hz));
      col.rect([x - t, z - hz, x + t, z + hz], py, yT);
    }
    const tris = [];
    for (let j = 0; j < 10; j++) pointedSpandrel(tris, x, t, piers[j] + (j === 0 ? 0.7 : 0.8), piers[j + 1] - (j === 9 ? 0.7 : 0.8), ys, yT);
    bag.add('banco_smooth', fromTriangles(tris));
  }
  // the floor of the prayer hall: strips of reed matting laid down the aisles between the rows of piers, and the three mihrabs
  // (the niche of the qibla, its dark recess in a pointed frame) on the inner face of the qibla wall, in line with the towers
  for (let i = 0; i < 8; i++) {
    const xa2 = (rowX(i) + rowX(i + 1)) / 2;
    for (let z = z0 + 0.8; z < z1 - 3.1; z += 3.2) bag.add((Math.floor(z / 3.2) + i) % 5 === 0 ? 'cloth_ochre' : 'reed_mat', box(xa2 - 0.65, py, z, xa2 + 0.65, py + 0.02, z + 3.0));
  }
  { const qx = x1 - 0.45;
    for (const [zc, w] of [[cz, 1.2], [cz - 13, 0.9], [cz + 13, 0.9]]) {
      bag.add('lacquer_black', box(qx - 0.03, py, zc - w, qx, py + 2.6, zc + w));
      for (const sg of [-1, 1]) { const za = sg < 0 ? zc - w - 0.18 : zc + w, zb = sg < 0 ? zc - w : zc + w + 0.18; bag.add('banco_smooth', box(qx - 0.12, py, za, qx, py + 2.6, zb)); }
      const tris = []; pointedSpandrel(tris, qx - 0.06, 0.06, zc - w - 0.18, zc + w + 0.18, py + 2.6, py + 4.0); bag.add('banco_smooth', fromTriangles(tris));
    } }
  bag.add('timber', box(xm, py + 9.6, z0, x1, py + 9.9, z1));
  bag.add('banco_smooth', box(xm - 0.5, py + 9.9, z0 - 0.5, x1 + 0.5, py + 10.5, z1 + 0.5));
  col.floor([xm, z0, x1, z1], py + 10.5);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) {
    const x = xm + (x1 - xm) * (i + 1) / 5, z = z0 + (z1 - z0) * (j + 1) / 7;
    bag.add('banco_smooth', lathe([[0.4, -0.05], [0.4, 0.22], [0.34, 0.26], [0.001, 0.26]], 10, null, x, py + 10.5, z));      // the vent's collar
    bag.add('terracotta', lathe([[0.001, 0.25], [0.44, 0.25], [0.44, 0.31], [0.4, 0.42], [0.3, 0.52], [0.16, 0.57], [0.001, 0.58]], 12, null, x, py + 10.5, z));   // the inverted bowl
  }
  // ceramic half-pipes along the roof's edge, throwing the rain clear of the north and south walls (between the pilasters)
  { const L = x1 - x0, n = Math.max(1, Math.round(L / 3));
    for (let k = 0; k < n; k += 2) {
      const x = x0 + (k + 0.5) * L / n, hall = x > xm + 0.8, nearTower = (sg) => sg > 0 ? x > ST[0] - 0.4 && x < ST[2] + 0.4 : Math.abs(x - mainX) < 7.5;
      for (const [zz, sg] of [[z0 - (hall ? 0.5 : 0.45), -1], [z1 + (hall ? 0.5 : 0.45), 1]]) if (!nearTower(sg)) bag.add('terracotta', fromTriangles(halfPipe([x, hall ? py + 10.02 : py + H - 0.45, zz], [0, 0, sg], 1.0, 0.11)));
    } }
  // the three towers on the qibla wall, rising 16 m above the platform with their pinnacles
  for (const [zz, s] of [[cz, 1.2], [cz - 13, 1], [cz + 13, 1]]) {
    const tw = 3.2 * s, th = 16 * s;
    taper(bag, x1 + 1.6, zz, py, py + th, tw * 1.2, tw);
    bag.add('banco_smooth', box(x1 + 1.6 - tw - 0.15, py + th - 0.4, zz - tw - 0.15, x1 + 1.6 + tw + 0.15, py + th, zz + tw + 0.15));
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 0]]) {
      const px = x1 + 1.6 + dx * tw * 0.75, pz = zz + dz * tw * 0.75, ph = dx || dz ? 3 : 4.5;
      bag.add(B, lathe([[0.55, 0], [0.4, ph * 0.7], [0.08, ph]], 8, null, px, py + th, pz));
      bag.add('tura_limestone', lathe([[0.001, 0], [0.18, 0.12], [0.2, 0.28], [0.001, 0.48]], 8, null, px, py + th + ph, pz));     // the ostrich egg
    }
    // engaged ribs on the three outer faces, battered with the face, rising through the cornice as pinnacles
    const tx = x1 + 1.6, fA = tw * 1.2, yR = py + th + 0.05, fB = tw * (1.2 - 0.2 * (yR - py) / th), dF = fA - fB;
    for (const k of [-0.33, 0.33]) {
      const sh = k * (fB - fA);
      bag.add(B, frustum([tx + fA - 0.05, zz + k * fA - 0.3, tx + fA + 0.32, zz + k * fA + 0.3], py, yR, -dF, dF + 0.08, sh + 0.06, -sh + 0.06));
      bag.add(B, lathe([[0.26, 0], [0.18, 1.1], [0.04, 1.6]], 8, null, tx + fB + 0.1, yR, zz + k * fB));
      for (const sz of [-1, 1]) {
        const r0 = sz < 0 ? [tx + k * fA - 0.3, zz - fA - 0.32, tx + k * fA + 0.3, zz - fA + 0.05] : [tx + k * fA - 0.3, zz + fA - 0.05, tx + k * fA + 0.3, zz + fA + 0.32];
        bag.add(B, frustum(r0, py, yR, sh + 0.06, -sh + 0.06, sz < 0 ? dF + 0.08 : -dF, sz < 0 ? -dF : dF + 0.08));
        bag.add(B, lathe([[0.26, 0], [0.18, 1.1], [0.04, 1.6]], 8, null, tx + k * fB, yR, zz + sz * (fB + 0.1)));
      }
    }
    // toron on the tower's three outer faces, following the batter
    const tt = [];
    for (let r = 1; r < Math.floor(th / 1.6); r++) {
      const yy = py + r * 1.6, f = tw * (1.2 - 0.2 * (yy - py) / th);
      for (const k of [-0.66, 0, 0.66]) {
        beamTris(tt, [tx + f - 0.05, yy, zz + k * f], [tx + f + 0.85, yy + 0.03, zz + k * f], 0.06, 0.1);
        for (const sz of [-1, 1]) beamTris(tt, [tx + k * f, yy, zz + sz * (f - 0.05)], [tx + k * f, yy + 0.03, zz + sz * (f + 0.85)], 0.06, 0.1);
      }
    }
    bag.add('timber', fromTriangles(tt));
    col.rect([x1 + 1.6 - tw * 1.2, zz - tw * 1.2, x1 + 1.6 + tw * 1.2, zz + tw * 1.2], py, py + th);
  }
  // the entrance towers flanking the main door on the north, their inner faces buried in the wall
  for (const xx of towersX) {
    const zc = z0 - 2.05;
    taper(bag, xx, zc, py, py + 13, 2.4, 2);
    // the crown: a cornice, pinnacles at the corners and a taller one in the middle
    bag.add('banco_smooth', box(xx - 2.15, py + 12.6, zc - 2.15, xx + 2.15, py + 13.0, zc + 2.15));
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 0]]) bag.add(B, lathe([[0.5, 0], [0.36, (dx || dz ? 2.2 : 3.2) * 0.7], [0.07, dx || dz ? 2.2 : 3.2]], 8, null, xx + dx * 1.5, py + 13.0, zc + dz * 1.5));
    faceRibs(bag, xx, zc, py, py + 12.6, 2.4, 2.4 - 0.4 * 12.6 / 13, ['n', xx < mainX ? 'w' : 'e'], [-0.5, 0.5], 1.4);
    col.rect([xx - 2.4, zc - 2.4, xx + 2.4, zc + 2.4], py, py + 13);
  }
}

/**
 * sahel_house: a town house { rect, front ('n'|'s'|'e'|'w'), storeys, seed, kind ('tukulor' |
 * 'moroccan', by default chosen by seed) } (docs/settlements/djenne.md §5, §12): banco walls, a flat
 * roof behind a parapet; on the street the "Sudan facade": corner pilasters (sarafar har) rising as
 * tall pinnacles, the two pilasters framing the entrance rising higher still, and between them over
 * the door the facade panel crowned by a row of small mitre-shaped pinnacles (sarafar idye) over a
 * frieze of recesses; toron in rows, clay spouts, the facade bench (tintin) either side of the door,
 * the plank door in its frame. A Tukulor house has the massive covered porch before the door and a
 * single small window over it; a Moroccan house no porch and small ornate windows with wooden grilles.
 */
function sahelHouse(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, st = el.storeys ?? (rand() < 0.65 ? 2 : 1), H = st * 3.1;
  const kind = el.kind ?? (st > 1 && rand() < 0.55 ? 'moroccan' : 'tukulor');
  const hollow = !!el.hollow;           // an enterable house: the walls, roofs and furniture are built apart (interiors.js)
  if (!hollow) {
  bag.add(B, box(x0, 0, z0, x1, H, z1));
  bag.add('banco_smooth', box(x0 - 0.1, H, z0 - 0.1, x1 + 0.1, H + 0.15, z1 + 0.1));
  // the parapet round the roof terrace
  for (const [a, b] of [[[x0, z0], [x1, z0]], [[x1, z0], [x1, z1]], [[x1, z1], [x0, z1]], [[x0, z1], [x0, z0]]]) { const t = []; beamTris(t, [a[0], H + 0.15, a[1]], [b[0], H + 0.15, b[1]], 0.18, 0.75); bag.add(B, fromTriangles(t)); }
  col.rect([x0, z0, x1, z1], 0, H);
  col.floor([x0 + 0.3, z0 + 0.3, x1 - 0.3, z1 - 0.3], H + 0.15);  // the roof terrace: a vent of the kitchen below, capped with an inverted fired bowl as on the mosque's roof, water jars,
  // sometimes a mat spread to dry and a bundle of palm sticks (the next replastering's toron)
  { const r2 = rng((el.seed || 1) * 7 + 3), y = H + 0.15, W = x1 - x0, D = z1 - z0;
    const vx = x0 + W * (0.3 + r2() * 0.4), vz = z0 + D * (0.3 + r2() * 0.4);
    bag.add('banco_smooth', lathe([[0.3, -0.05], [0.3, 0.16], [0.25, 0.2], [0.001, 0.2]], 8, null, vx, y, vz));
    bag.add('terracotta', lathe([[0.001, 0.19], [0.33, 0.19], [0.33, 0.24], [0.28, 0.33], [0.18, 0.4], [0.001, 0.42]], 10, null, vx, y, vz));
    for (let i = 0; i < 1 + Math.floor(r2() * 3); i++) { const jx = x0 + 0.8 + r2() * (W - 1.6), jz = z0 + 0.8 + r2() * (D - 1.6); if (Math.hypot(jx - vx, jz - vz) > 0.9) bag.add(r2() < 0.5 ? 'terracotta' : 'pottery_dark', lathe([[0.001, 0], [0.12, 0.03], [0.2, 0.2], [0.15, 0.36], [0.09, 0.44], [0.11, 0.5], [0.001, 0.48]], 9, null, jx, y, jz)); }
    if (r2() < 0.4) { const mx = x0 + 0.9 + r2() * Math.max(0.1, W - 3.4), mz = z0 + 0.9 + r2() * Math.max(0.1, D - 2.6); bag.add(r2() < 0.5 ? 'reed_mat' : 'cloth_indigo', box(mx, y, mz, mx + 1.6, y + 0.02, mz + 1.0)); }
  }
  }
  // the facade's frame: s along the front from a to b, d outward from its plane
  const f = el.front || 's';
  const [a, b] = f === 's' ? [[x0, z1], [x1, z1]] : f === 'n' ? [[x1, z0], [x0, z0]] : f === 'e' ? [[x1, z1], [x1, z0]] : [[x0, z0], [x0, z1]];
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = -uz, nz = ux;   // n: outward
  const P = (s, d) => [a[0] + ux * s + nx * d, a[1] + uz * s + nz * d];
  const R = (s0, s1, d0, d1) => { const p = P(s0, d0), q = P(s1, d1); return [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; };
  const lbox = (mat, s0, s1, d0, d1, y0, y1, solid = false) => { const r = R(s0, s1, d0, d1); bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); if (solid) col.rect(r, y0, y1); };
  const mid = L / 2, hw = Math.min(1.35, L / 2 - 1.2), top = H + 0.9;
  // a mitre-shaped pinnacle: a rounded blade, flattened across the facade
  const mitre = (s, d, y, h, w) => { const [x, z] = P(s, d), g = lathe([[w, 0], [w * 0.95, h * 0.45], [w * 0.6, h * 0.8], [0.02, h]], 8, null, 0, 0, 0); g.scale(Math.abs(ux) > 0.5 ? 1 : 0.45, 1, Math.abs(ux) > 0.5 ? 0.45 : 1); bag.add(B, g.translate(x, y, z)); };
  // the corner pilasters (sarafar har) and the two framing the entrance, battered, rising as pinnacles
  for (const [s, extra, w] of [[0.3, 1.2, 0.42], [L - 0.3, 1.2, 0.42], [mid - hw, 2.6, 0.5], [mid + hw, 2.6, 0.5]]) {
    const [px, pz] = P(s, 0.22), ph = H + extra;
    taper(bag, px, pz, 0, ph * 0.86, w, w * 0.72, ph * 0.14);
    col.rect(R(s - w, s + w, 0, 0.22 + w), 0, ph * 0.86);
  }
  // intermediate pilasters along a long front, lower
  for (const s of [(0.3 + mid - hw) / 2, (mid + hw + L - 0.3) / 2]) if (Math.abs(s - 0.3) > 1.6 && Math.abs(s - (mid - hw)) > 1.2 && Math.abs(s - (mid + hw)) > 1.2) { const [px, pz] = P(s, 0.15); taper(bag, px, pz, 0, H + 0.6, 0.3, 0.22, 0.9); }
  // the facade panel between the entrance pilasters: proud of the wall, up past the parapet, a band of
  // square recesses (the frieze), a moulding, and the row of small mitre pinnacles along its top
  lbox(B, mid - hw + 0.35, mid + hw - 0.35, -0.05, 0.14, 2.9, top + 0.35);
  lbox('banco_smooth', mid - hw + 0.3, mid + hw - 0.3, 0.1, 0.24, top + 0.35, top + 0.5);
  { const n = 5; for (let k = 0; k < n; k++) mitre(mid - hw + 0.6 + (2 * hw - 1.2) * k / (n - 1), 0.12, top + 0.5, k % 2 ? 0.75 : 0.95, 0.17); }
  if (st > 1) { const n = Math.max(3, Math.round((2 * hw - 0.9) / 0.5)); for (let k = 0; k < n; k++) { const s = mid - hw + 0.55 + (2 * hw - 1.1) * (k + 0.5) / n; lbox('banco_smooth', s - 0.12, s + 0.12, 0.14, 0.17, H - 0.55, H - 0.3); } }
  lbox('banco_smooth', mid - hw + 0.3, mid + hw - 0.3, 0.14, 0.26, H - 0.2, H - 0.05);
  // the door: a plank leaf in a banco frame, the frame's timber lintel; an iron ring
  const dw = el.dw ?? 0.55, dh = 2.05;
  lbox('banco_smooth', mid - dw - 0.2, mid - dw, -0.05, 0.2, 0, dh + 0.2); lbox('banco_smooth', mid + dw, mid + dw + 0.2, -0.05, 0.2, 0, dh + 0.2);
  lbox('timber', mid - dw - 0.3, mid + dw + 0.3, -0.05, 0.22, dh, dh + 0.14);
  if (!hollow) lbox('wood_dark', mid - dw, mid + dw, -0.06, 0.015, 0, dh - 0.01);
  if (!hollow) for (let k = 0; k < 5; k++) { const s = mid - dw + k * (2 * dw) / 5; lbox('timber', s + 0.008, s + 2 * dw / 5 - 0.008, -0.06, k % 2 ? 0.035 : 0.045, 0, dh); }
  if (!hollow) for (const y of [0.35, 1.0, 1.7]) lbox('wood_dark', mid - dw, mid + dw, 0.04, 0.07, y, y + 0.09);
  // the year's erosion on its four walls (§13): on the front clear of the pilasters, the panel and the door
  for (const [ea, eb] of [[[x0, z1], [x1, z1]], [[x1, z0], [x0, z0]], [[x1, z1], [x1, z0]], [[x0, z0], [x0, z1]]]) {
    const EL = Math.hypot(eb[0] - ea[0], eb[1] - ea[1]), ex = (eb[0] - ea[0]) / EL, ez = (eb[1] - ea[1]) / EL, front = ea[0] === a[0] && ea[1] === a[1] && eb[0] === b[0] && eb[1] === b[1];
    const ok = front ? (q, m) => q > 0.85 + m && q < EL - 0.85 - m && Math.abs(q - mid) > hw + 0.65 + m : (q, m) => q > 0.25 + m && q < EL - 0.25 - m;
    erode(bag, (q, d) => [ea[0] + ex * q - ez * d, ea[1] + ez * q + ex * d], EL, Math.max(1, Math.round(EL / (front ? 1.1 : 1.8))), 0, H, 0, ok, rng((el.seed || 1) * 13 + EL * 7), front ? 0.62 : 0.02);   // (on the front above the benches)
  }
  if (!hollow) { const [rx, rz] = P(mid + dw * 0.55, 0.09); bag.add('iron', lathe([[0.06, -0.06], [0.07, 0], [0.06, 0.06], [0.05, 0], [0.06, -0.06]], 8, null, 0, 0, 0).rotateX(Math.PI / 2).rotateY(Math.atan2(nx, nz)).translate(rx, 1.05, rz)); }
  // the facade bench (tintin) along the foot, either side of the entrance
  for (const [s0, s1] of [[0.8, mid - hw - 0.55], [mid + hw + 0.55, L - 0.8]]) if (s1 - s0 > 0.8) lbox('banco_smooth', s0, s1, -0.05, 0.5, 0, 0.45, true);
  if (kind === 'tukulor') {
    // the massive covered porch before the door: two piers, a roof of palm beams under banco, a
    // timber lintel over its mouth
    const pd = 0.95, pw = hw - 0.1;
    if (pw - dw - 0.25 > 0.3) {
    lbox(B, mid - pw - 0.05, mid - dw - 0.25, 0.2, pd, 0, 2.75, true); lbox(B, mid + dw + 0.25, mid + pw + 0.05, 0.2, pd, 0, 2.75, true);
    lbox('timber', mid - pw - 0.1, mid + pw + 0.1, pd - 0.18, pd + 0.02, 2.4, 2.56);
    lbox('banco_smooth', mid - pw - 0.12, mid + pw + 0.12, 0.1, pd + 0.08, 2.75, 2.95);
    for (let k = 0; k < 5; k++) { const s = mid - pw + 0.2 + (2 * pw - 0.4) * k / 4; lbox('timber', s - 0.05, s + 0.05, 0.1, pd + 0.18, 2.62, 2.74); }
    lbox(B, mid - pw - 0.05, mid + pw + 0.05, 0.2, pd, 2.56, 2.75);
    }
    // the single small window over the entrance, its timber grille of bars
    if (st > 1) {
      lbox('lacquer_black', mid - 0.28, mid + 0.28, 0.16, 0.2, 4.0, 4.65);
      lbox('banco_smooth', mid - 0.42, mid + 0.42, 0.16, 0.34, 3.88, 4.0); lbox('banco_smooth', mid - 0.42, mid + 0.42, 0.16, 0.34, 4.65, 4.77);
      for (const s of [mid - 0.36, mid + 0.36]) lbox('banco_smooth', s - 0.06, s + 0.06, 0.16, 0.3, 4.0, 4.65);
      for (let k = 0; k < 4; k++) { const s = mid - 0.21 + k * 0.14; lbox('timber', s - 0.02, s + 0.02, 0.2, 0.26, 4.0, 4.65); }
    }
  } else {
    // Moroccan: small ornate windows in the upper storey, each in a moulded banco frame with a
    // pointed head, a wooden grille of crossed laths before a dark opening, a little sill
    const ws = [mid - hw - 1.1, mid + hw + 1.1].filter((s) => s > 1.0 && s < L - 1.0);
    ws.push(mid);
    for (const s of ws) {
      const y0 = s === mid ? 4.05 : 3.9, wh = 0.75, ww = 0.32, o = s === mid ? 0.16 : 0;
      const wb = (mat, s0, s1, d0, d1, ya, yb) => lbox(mat, s0, s1, d0 + o, d1 + o, ya, yb);
      wb('lacquer_black', s - ww, s + ww, 0.02, 0.06, y0, y0 + wh);
      wb('banco_smooth', s - ww - 0.14, s - ww, 0.0, 0.2, y0 - 0.1, y0 + wh); wb('banco_smooth', s + ww, s + ww + 0.14, 0.0, 0.2, y0 - 0.1, y0 + wh);
      wb('banco_smooth', s - ww - 0.2, s + ww + 0.2, 0.0, 0.3, y0 - 0.2, y0 - 0.08);
      for (const sg of [-1, 1]) for (let k = 0; k < 3; k++) { const s0 = s + sg * (ww + 0.14 - (k + 1) * (ww + 0.14) / 3); wb('banco_smooth', Math.min(s0, s + sg * (ww + 0.14)) , Math.max(s0, s + sg * (ww + 0.14)), 0.0, 0.2, y0 + wh + k * 0.1, y0 + wh + (k + 1) * 0.1); }
      wb('banco_smooth', s - 0.05, s + 0.05, 0.0, 0.2, y0 + wh + 0.3, y0 + wh + 0.42);
      for (let k = 0; k < 4; k++) { const sx = s - ww + 0.08 + k * (2 * ww - 0.16) / 3; wb('timber', sx - 0.018, sx + 0.018, 0.07, 0.11, y0, y0 + wh); }
      for (let k = 0; k < 5; k++) { const yy = y0 + 0.08 + k * (wh - 0.16) / 4; wb('timber', s - ww, s + ww, 0.11, 0.14, yy - 0.018, yy + 0.018); }
    }
    // a canopy of palm sticks and banco on brackets over the door
    lbox('banco_smooth', mid - dw - 0.4, mid + dw + 0.4, 0.0, 0.7, 2.45, 2.62);
    for (const s of [mid - dw - 0.3, mid + dw + 0.3]) lbox('timber', s - 0.05, s + 0.05, 0.2, 0.75, 2.33, 2.45);
  }
  // toron in rows across the front, between the pilasters
  const tt = [];
  for (let r = 1; r <= st; r++) for (let k = 1; k < 8; k++) {
    const s = L * k / 8; if (Math.abs(s - mid) < hw + 0.6 || Math.abs(s - 0.3) < 0.6 || Math.abs(s - L + 0.3) < 0.6 || rand() < 0.25) continue;
    const [tx, tz] = P(s, 0.0), y = r * 3.1 - 0.7 + (rand() - 0.5) * 0.1, len = 0.5 + rand() * 0.25;
    beamTris(tt, [tx, y, tz], [tx + nx * len, y + 0.03, tz + nz * len], 0.06, 0.1);
  }
  if (tt.length) bag.add('timber', fromTriangles(tt));
  // fired clay spouts through the parapet throwing the rain off the roof, one either side of the panel
  for (const s of [mid - hw - 0.9, mid + hw + 0.9]) if (s > 0.9 && s < L - 0.9) { const [sx, sz] = P(s, -0.15); bag.add('terracotta', fromTriangles(halfPipe([sx, H + 0.25, sz], [nx, 0, nz], 0.95, 0.09))); }
}
/** sahel_wall: a plain banco wall (courts, the market) { a, b, h }. */
function sahelWall(el, { bag, col }) { bancoWall(bag, col, el.a, el.b, el.y ?? 0, el.h ?? 2.6, 0.45, { step: 4, ph: 0.6, toron: false, pw: 0.4, pd: 0.3 }); }

/** market_stall: a stall of the market { c, s }: four poles and a sagging mat roof, a low table of
 * sticks with its mat, goods laid out on it — calabashes, pots, baskets, heaps of grain and kola —
 * and sacks and jars on the ground beside it. */
function marketStall(el, { bag }) {
  const [x, z] = el.c, s = el.s ?? 1.6, rand = rng(Math.floor((x * 73 + z * 31) * 10) >>> 0);
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const lean = (rand() - 0.5) * 0.08;
    bag.add('timber', lathe([[0.06, 0], [0.05, 2.25]], 6, null, x + dx * s + lean, 0, z + dz * s));
  }
  for (const dz of [-1, 1]) bag.add('timber', box(x - s - 0.1, 2.2, z + dz * s - 0.04, x + s + 0.1, 2.28, z + dz * s + 0.04));
  // the mat roof, sagging a little in the middle
  const roof = [], N = 6, R = s + 0.35, Y = (u, v) => 2.3 - 0.12 * (1 - u * u) * (1 - v * v);
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const u0 = -1 + 2 * i / N, u1 = -1 + 2 * (i + 1) / N, v0 = -1 + 2 * j / N, v1 = -1 + 2 * (j + 1) / N;
    const P = (u, v) => [x + u * R, Y(u, v), z + v * R];
    roof.push(...P(u0, v0), ...P(u0, v1), ...P(u1, v1), ...P(u0, v0), ...P(u1, v1), ...P(u1, v0));
    roof.push(...P(u0, v0), ...P(u1, v1), ...P(u0, v1), ...P(u0, v0), ...P(u1, v0), ...P(u1, v1));
  }
  bag.add('reed_mat', fromTriangles(roof));
  // the table: a top of sticks on four legs, a mat on it
  const tw = s * 0.8, td = s * 0.5, ty = 0.55;
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bag.add('timber', box(x + dx * (tw - 0.08) - 0.04, 0, z + dz * (td - 0.08) - 0.04, x + dx * (tw - 0.08) + 0.04, ty, z + dz * (td - 0.08) + 0.04));
  bag.add('timber', box(x - tw, ty, z - td, x + tw, ty + 0.06, z + td));
  bag.add(['reed_mat', 'cloth_indigo', 'cloth_ochre', 'sacking'][Math.floor(rand() * 4)], box(x - tw + 0.05, ty + 0.06, z - td + 0.05, x + tw - 0.05, ty + 0.075, z + td - 0.05));
  const top = ty + 0.075;
  for (let i = 0; i < 6; i++) {
    const gx = x - tw + 0.3 + (i % 3) * (tw * 2 - 0.6) / 2, gz = z + (i < 3 ? -td * 0.45 : td * 0.45), k = rand();
    if (k < 0.3) bag.add('hide_tan', lathe([[0.001, 0], [0.18, 0.04], [0.24, 0.13], [0.22, 0.14], [0.001, 0.05]], 10, null, gx, top, gz));                  // a calabash bowl
    else if (k < 0.55) bag.add(rand() < 0.5 ? 'terracotta' : 'pottery_dark', lathe([[0.001, 0], [0.12, 0.03], [0.17, 0.15], [0.1, 0.3], [0.08, 0.34], [0.001, 0.34]], 10, null, gx, top, gz));
    else if (k < 0.8) { bag.add('wicker', lathe([[0.001, 0], [0.2, 0.02], [0.24, 0.14], [0.22, 0.14], [0.001, 0.04]], 10, null, gx, top, gz)); bag.add(['cloth_ochre', 'terracotta', 'cloth_green'][Math.floor(rand() * 3)], lathe([[0.2, 0], [0.12, 0.08], [0.001, 0.12]], 8, null, gx, top + 0.1, gz)); }
    else bag.add(['cloth_ochre', 'sacking', 'hide_tan'][Math.floor(rand() * 3)], lathe([[0.22, 0], [0.14, 0.1], [0.001, 0.16]], 10, null, gx, top, gz));         // a heap of grain or kola
  }
  // beside the table: sacks and a water jar
  for (let i = 0; i < 2; i++) bag.add('sacking', lathe([[0.2, 0], [0.24, 0.25], [0.2, 0.45], [0.06, 0.52], [0.001, 0.52]], 8, null, x + tw + 0.3, 0, z - td + 0.3 + i * 0.5));
  bag.add('terracotta', lathe([[0.001, 0], [0.2, 0.05], [0.3, 0.3], [0.2, 0.55], [0.12, 0.6], [0.14, 0.66], [0.001, 0.62]], 10, null, x - tw - 0.35, 0, z + td * 0.4));
}

/**
 * market_mat: a seller's place on market day (docs/settlements/djenne.md §11, after Caillié's
 * description of the market) { at, rot (the seller faces −z turned by rot, as the figures do), goods,
 * seed }: a low stool for the seller, a mat before it and the goods laid out on it — 'kola' (a small
 * basket of kola nuts, no mat), 'fish' (dried fish in heaps), 'salt' (bars of rock salt and broken
 * pieces), 'pots', 'calabash', 'grain' (millet and rice in calabashes, sacks), 'butter' (shea butter
 * in bowls), 'cloth' (folded narrow-strip cotton), 'mats' (rolled mats), 'meat' (smoked meat on skewers).
 */
function marketMat(el, { bag }) {
  const [X, Z] = el.at, r = el.rot ?? 0, c = Math.cos(r), sn = Math.sin(r), rand = rng(el.seed || 1), g = el.goods || 'pots';
  // local (x, z) → world: the rotation about y the figures use
  const W = (x, z) => [X + x * c + z * sn, Z - x * sn + z * c];
  const put = (mat, geo, x, y, z, yaw = 0) => { const [wx, wz] = W(x, z); bag.add(mat, geo.rotateY(r + yaw).translate(wx, y, wz)); };
  const L = (prof, n = 10) => lathe(prof, n, null, 0, 0, 0);
  // the stool (a single block of wood, a dished seat)
  put('timber', L([[0.15, 0], [0.1, 0.12], [0.08, 0.3], [0.16, 0.42], [0.17, 0.45], [0.001, 0.44]], 8), 0, 0, 0.02);
  if (g === 'kola') {
    // Caillié: the kola sellers sit in two lines, each with a small basket
    put('wicker', L([[0.001, 0], [0.16, 0.02], [0.2, 0.15], [0.19, 0.16], [0.001, 0.05]]), 0, 0, -0.75);
    for (let i = 0; i < 9; i++) { const a = rand() * 6.28, d = rand() * 0.11; put(rand() < 0.6 ? 'terracotta' : 'hide_white', L([[0.001, 0], [0.035, 0.02], [0.03, 0.05], [0.001, 0.06]], 6), Math.cos(a) * d, 0.1 + rand() * 0.03, -0.75 + Math.sin(a) * d); }
    return;
  }
  const mw = 0.7, z0 = -0.65, z1 = -1.8, mz = (z0 + z1) / 2;
  put(g === 'cloth' ? 'cloth_white' : 'reed_mat', box(-mw, 0, z1, mw, 0.015, z0), 0, 0.005, 0);
  const top = 0.02, spots = [[-0.4, -0.95], [0.05, -0.95], [0.45, -0.95], [-0.4, -1.5], [0.05, -1.5], [0.45, -1.5]];
  if (g === 'fish') {
    // dried fish of the Niger, laid head to tail in round heaps
    for (const [sx, sz] of spots.slice(0, 4)) for (let k = 0; k < 7; k++) {
      const a = k * 0.9 + rand(), f = L([[0.001, 0], [0.03, 0.04], [0.035, 0.12], [0.02, 0.2], [0.035, 0.24], [0.001, 0.25]], 5);
      f.rotateZ(Math.PI / 2).scale(1, 0.55, 1).rotateY(a);
      put(rand() < 0.5 ? 'hide_brown' : 'hide_tan', f, sx + Math.cos(a) * 0.06, top + 0.02 + Math.floor(k / 3) * 0.035, sz + Math.sin(a) * 0.06);
    }
  } else if (g === 'salt') {
    // bars of rock salt from the desert mines, about a metre long, lashed in pairs; pieces broken off for retail
    for (let k = 0; k < 3; k++) {
      put('lime_plaster', box(-0.5, 0, -0.2, 0.5, 0.07, 0.2), 0.02 * k, top + k * 0.072, -1.15, (rand() - 0.5) * 0.12);
      put('plaster_grey', box(-0.505, 0.03, -0.205, 0.505, 0.04, 0.205), 0.02 * k, top + k * 0.072, -1.15, 0);
    }
    for (const dx of [-0.35, 0.35]) put('hide_brown', box(-0.015, 0, -0.21, 0.015, 0.24, 0.21), dx, top - 0.005, -1.15);
    for (let i = 0; i < 5; i++) put('lime_plaster', box(-0.07, 0, -0.05, 0.07, 0.05 + rand() * 0.04, 0.05), -0.5 + i * 0.25, top, -1.62, rand());
  } else if (g === 'pots') {
    for (const [sx, sz] of spots) {
      const k = rand(), m = rand() < 0.5 ? 'terracotta' : 'pottery_dark';
      if (k < 0.4) put(m, L([[0.001, 0], [0.12, 0.03], [0.2, 0.18], [0.14, 0.34], [0.1, 0.38], [0.12, 0.42], [0.001, 0.4]], 12), sx, top, sz);
      else if (k < 0.75) put(m, L([[0.001, 0], [0.14, 0.02], [0.22, 0.1], [0.24, 0.14], [0.2, 0.14], [0.001, 0.05]], 12), sx, top, sz);
      else put(m, L([[0.001, 0], [0.09, 0.02], [0.14, 0.12], [0.08, 0.24], [0.06, 0.3], [0.001, 0.29]], 10), sx, top, sz);
    }
  } else if (g === 'calabash') {
    for (const [sx, sz] of spots) for (let k = 0; k < (rand() < 0.5 ? 3 : 2); k++) put('hide_tan', L([[0.001, 0.16], [0.18, 0.13], [0.24, 0.04], [0.22, 0.0], [0.2, 0.04], [0.001, 0.12]], 12), sx, top + k * 0.05, sz);
  } else if (g === 'grain' || g === 'butter') {
    for (const [sx, sz] of spots.slice(0, 5)) {
      put('hide_tan', L([[0.001, 0], [0.16, 0.03], [0.22, 0.12], [0.2, 0.13], [0.001, 0.05]]), sx, top, sz);
      put(g === 'butter' ? 'hide_white' : rand() < 0.5 ? 'cloth_ochre' : 'sacking', L([[0.2, 0], [0.13, 0.06], [0.001, 0.09]], 10), sx, top + 0.11, sz);
    }
    if (g === 'grain') for (const dx of [-0.95, 0.95]) put('sacking', L([[0.2, 0], [0.24, 0.25], [0.2, 0.45], [0.06, 0.52], [0.001, 0.52]], 8), dx, 0, mz);
  } else if (g === 'cloth') {
    for (let k = 0; k < 6; k++) put(['cloth_indigo', 'cloth_white', 'cloth_indigo', 'cloth_ochre', 'cloth_black', 'cloth_white'][k], box(-0.3, 0, -0.2, 0.3, 0.05, 0.2), (k % 2) * 0.68 - 0.34, top + Math.floor(k / 2) * 0.052, -1.2, (rand() - 0.5) * 0.1);
  } else if (g === 'mats') {
    for (let k = 0; k < 4; k++) { const m = L([[0.09, 0], [0.09, 1.2], [0.001, 1.2]], 10); m.rotateZ(Math.PI / 2); put('reed_mat', m, 0.6, top + 0.09 + (k > 2 ? 0.17 : 0), -0.95 - (k % 3) * 0.19); }
  } else if (g === 'meat') {
    // smoked meat in small pieces on skewers, stuck in a block of wood (Caillié)
    put('timber', box(-0.5, 0, -0.12, 0.5, 0.14, 0.12), 0, top, -1.2);
    for (let k = 0; k < 9; k++) {
      const x = -0.44 + k * 0.11, sk = L([[0.006, 0], [0.006, 0.42], [0.001, 0.43]], 4);
      put('timber', sk, x, top + 0.1, -1.2);
      for (let j = 0; j < 3; j++) put('hide_brown', box(-0.03, 0, -0.025, 0.03, 0.05, 0.025), x, top + 0.24 + j * 0.06, -1.2, rand());
    }
  }
}

/**
 * net_rack: a fisherman's nets hung to dry { at, rot, seed }: two forked poles, a cross pole in their
 * forks, the folded nets draped over it in heavy swags hanging to either side, their lower edges
 * ragged, a few gourd floats; a coil of rope at the foot.
 */
function netRack(el, { bag, col }) {
  const [X, Z] = el.at, r = el.rot ?? 0, c = Math.cos(r), sn = Math.sin(r), rand = rng(el.seed || 1);
  const Wp = (x, z) => [X + x * c + z * sn, Z - x * sn + z * c];
  const put = (mat, g) => bag.add(mat, g.rotateY(r).translate(X, 0, Z));
  const hw = 1.3 + rand() * 0.4, ph = 1.75;
  for (const sx of [-hw, hw]) {
    put('timber', lathe([[0.05, 0], [0.045, ph], [0.001, ph]], 6, null, sx, 0, 0));
    for (const sg of [-1, 1]) { const g = lathe([[0.025, 0], [0.02, 0.22], [0.001, 0.22]], 5, null, 0, 0, 0); g.rotateZ(sg * 0.45); put('timber', g.translate(sx, ph - 0.05, 0)); }
  }
  put('timber', lathe([[0.035, 0], [0.035, 2 * hw + 0.4], [0.001, 2 * hw + 0.4]], 6, null, 0, 0, 0).rotateZ(Math.PI / 2).translate(hw + 0.2, ph + 0.03, 0));
  // the swags: a sheet hanging on each side of the pole, its edge ragged
  const T = [], N = 10, M = 4;
  const Q = (u, v, sg) => { const x = -hw * 0.92 + 2 * hw * 0.92 * u, drop = 0.9 + 0.35 * Math.sin(u * 9 + sg * 2 + el.seed) * 0.5 + 0.2 * Math.sin(u * 23 + el.seed); return [x, ph + 0.04 - v * drop - 0.08 * Math.sin(Math.PI * u) * v, sg * (0.05 + 0.12 * v + 0.04 * Math.sin(u * 13) * v)]; };
  for (const sg of [-1, 1]) for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
    const a = Q(i / N, j / M, sg), b = Q((i + 1) / N, j / M, sg), d = Q((i + 1) / N, (j + 1) / M, sg), e = Q(i / N, (j + 1) / M, sg);
    T.push(...a, ...b, ...d, ...a, ...d, ...e, ...a, ...d, ...b, ...a, ...e, ...d);
  }
  put('rope_fibre', fromTriangles(T));
  for (let k = 0; k < 5; k++) { const u = (k + 0.5) / 5, sg = k % 2 ? 1 : -1, p = Q(u, 0.98, sg); put('hide_tan', lathe([[0.001, -0.06], [0.06, -0.03], [0.065, 0.02], [0.03, 0.06], [0.001, 0.07]], 6, null, p[0], p[1] - 0.06, p[2] + sg * 0.05)); }
  put('rope_fibre', lathe([[0.001, 0], [0.22, 0], [0.24, 0.05], [0.2, 0.1], [0.12, 0.1], [0.1, 0.05], [0.001, 0.05]], 10, null, hw * 0.4, 0, 0.5));
  for (const sx of [-hw, hw]) { const [px, pz] = Wp(sx, 0); col.circle(px, pz, 0.1, 0, ph); }
}

/**
 * mud_pit: { c, r, y, seed } — a round pit by the river where the clay for the crépissage soaks for some
 * twenty days (docs/settlements/djenne.md §13): a low lip of trodden mud round it, the wet mud inside
 * a hand below the lip, lumps of clay waiting on its edge, a heap of rice husk to be worked in at the end.
 */
function mudPit(el, { bag, col }) {
  const [cx, cz] = el.c, r = el.r ?? 2, y = el.y ?? 0, rand = rng(el.seed || 5);
  bag.add(B, lathe([[r, -0.3], [r, 0.12], [r + 0.15, 0.22], [r + 0.4, 0.16], [r + 0.75, 0.02], [r + 0.8, -0.1]], 18, null, cx, y, cz));
  // the wet mud, its surface churned
  bag.add('silt', lathe([[0.001, 0.05], [r * 0.3, 0.07], [r * 0.6, 0.03], [r * 0.85, 0.08], [r + 0.02, 0.06], [r + 0.02, -0.3]], 18, (th) => 1 + 0.02 * Math.sin(th * 5), cx, y, cz));
  col.circle(cx, cz, r + 0.6, y, y + 0.2);
  // lumps of dry clay brought by cart and donkey, broken up on the edge; a heap of rice husk
  const a0 = rand() * 6.28;
  for (let k = 0; k < 9; k++) {
    const a = a0 + (rand() - 0.5) * 1.2, d = r + 1.1 + rand() * 0.9, s = 0.18 + rand() * 0.2, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d;
    bag.add(B, lathe([[s, 0], [s * 1.05, s * 0.5], [s * 0.6, s * 0.95], [0.001, s]], 6, null, x, y - 0.02, z));
  }
  const ha = a0 + Math.PI * 0.8, hx = cx + Math.cos(ha) * (r + 1.6), hz = cz + Math.sin(ha) * (r + 1.6);
  bag.add('thatch', lathe([[0.9, 0], [0.75, 0.25], [0.4, 0.5], [0.001, 0.6]], 12, null, hx, y - 0.02, hz));
}

registerStyle('sahel', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, great_mosque: greatMosque, sahel_house: sahelHouse, sahel_shops: shopRow, sahel_court_house: (el, c) => { sahelHouse({ ...el, hollow: true, front: 's', storeys: 2, kind: 'tukulor', dw: 0.65 }, c); courtHouse(el, c); }, sahel_wall: sahelWall, market_stall: marketStall, market_mat: marketMat, net_rack: netRack, mud_pit: mudPit },
  objects: {},
});
