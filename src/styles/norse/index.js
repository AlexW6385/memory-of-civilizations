// Norse Norway (12th–13th c.; docs/settlements/norse-borgund.md §4): the stave church — the nave
// raised on its ring of staves above the aisles, the ambulatory (svalgang) round it under a lean-to
// roof, the chancel and the round apse with its little tower, the roofs stacked one above another
// under tarred shingles, the turret with its spire, dragon heads on the gables; the free-standing
// bell house; the farm's buildings of round logs notched at the corners, the dwellings under sod,
// the storehouse (loft) raised on posts.

import { registerStyle, STYLES, orientedBox } from '../../core/build.js';
import { box, frustum, lathe, quad, fromTriangles, orientOutward } from '../../core/geom.js';
import { Shape, Path, ExtrudeGeometry, Matrix4 } from '../../core/three.js';
import '../qing/index.js';
import { dragonHead, ridgeCrest, westPortal, staveMask } from './carving.js';
import { stueInside } from './stue.js';
import { makeShore } from './shore.js';
import { makeFarm } from './farm.js';

const W = 'tar_wood', SH = 'tar_shingle', LOG = 'log_pine';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A small cross on a gable's apex. */
function cross(bag, x, y, z, s = 1) { bag.add(W, box(x - 0.05 * s, y, z - 0.05 * s, x + 0.05 * s, y + 1.0 * s, z + 0.05 * s)); bag.add(W, box(x - 0.05 * s, y + 0.55 * s, z - 0.3 * s, x + 0.05 * s, y + 0.65 * s, z + 0.3 * s)); }
/** An extruded flat piece: `shape` drawn in (u, v) — u along a→b from a, v up from y — th thick, centred on the line a–b. */
export function slab(shape, th, a, b, y, curveSegments = 8) {
  let ux = b[0] - a[0], uz = b[1] - a[1]; const L = Math.hypot(ux, uz) || 1; ux /= L; uz /= L;
  const g = new ExtrudeGeometry(shape, { depth: th, bevelEnabled: false, curveSegments });
  g.deleteAttribute('uv'); g.translate(0, 0, -th / 2);
  g.applyMatrix4(new Matrix4().makeBasis({ x: ux, y: 0, z: uz }, { x: 0, y: 1, z: 0 }, { x: -uz, y: 0, z: ux }).setPosition(a[0], y, a[1]));
  return g;
}
/** A convex block from its eight corners (bottom a b c d, top e f g h, in the same order round). */
export function hexa(P) {
  const [a, b, c, d, e, f, g, h] = P, t = [];
  quad(t, a, b, c, d); quad(t, e, f, g, h); quad(t, a, b, f, e); quad(t, b, c, g, f); quad(t, c, d, h, g); quad(t, d, a, e, h);
  return fromTriangles(orientOutward(t));
}
/** A round log between two points on one axis (closed ends), r radius. */
export function logRod(a, b, r, seg = 7) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const g = lathe([[0.001, 0], [r, 0], [r, L], [0.001, L]], seg);
  if (Math.abs(b[0] - a[0]) > 1e-6) g.rotateZ(b[0] > a[0] ? -Math.PI / 2 : Math.PI / 2);
  else if (Math.abs(b[2] - a[2]) > 1e-6) g.rotateX(b[2] > a[2] ? Math.PI / 2 : -Math.PI / 2);
  return g.translate(a[0], a[1], a[2]);
}
/**
 * A pitched roof of two slabs (t thick) over rect, ridge along x (alongX) or z, overhang o, rise per
 * run `pitch`; the gable triangles under it in `wall` (kept below the slabs' undersides). Returns the
 * ridge's height (top of the slabs).
 */
export function pitched(bag, mat, wall, [x0, z0, x1, z1], y, pitch, o = 0.3, alongX = null, t = 0.16) {
  const ax = alongX ?? (x1 - x0 >= z1 - z0);
  const hh = ax ? (z1 - z0) / 2 : (x1 - x0) / 2, rise = hh * pitch, yr = y + rise, ye = y - o * pitch;
  if (ax) {
    const zm = (z0 + z1) / 2, A = x0 - o, B = x1 + o;
    for (const [ze] of [[z0 - o], [z1 + o]]) bag.add(mat, hexa([[A, ye - t, ze], [B, ye - t, ze], [B, yr - t, zm], [A, yr - t, zm], [A, ye, ze], [B, ye, ze], [B, yr, zm], [A, yr, zm]]));
    if (wall) bag.add(wall, frustum([x0, z0, x1, z1], y - 0.01, yr - t - 0.04, 0, 0, hh, hh, { noBottom: true }));
  } else {
    const xm = (x0 + x1) / 2, A = z0 - o, B = z1 + o;
    for (const [xe] of [[x0 - o], [x1 + o]]) bag.add(mat, hexa([[xe, ye - t, A], [xe, ye - t, B], [xm, yr - t, B], [xm, yr - t, A], [xe, ye, A], [xe, ye, B], [xm, yr, B], [xm, yr, A]]));
    if (wall) bag.add(wall, frustum([x0, z0, x1, z1], y - 0.01, yr - t - 0.04, hh, hh, 0, 0, { noBottom: true }));
  }
  return yr;
}
/** A square pyramid or frustum with its sides parallel to the axes: half-widths a0 at y0, a1 at y1. */
export function pyr(x, z, a0, y0, a1, y1) { return lathe([[a0 * Math.SQRT2, 0], [Math.max(a1, 0.001) * Math.SQRT2, y1 - y0], [0.001, y1 - y0]], 4).rotateY(Math.PI / 4).translate(x, y0, z); }
/** An arcade's outline: a band L long and H high over n round arches (radius bay/2 − post), springing at v = 0. */
export function arcadeShape(L, H, n, post = 0.06) {
  const sh = new Shape(), bw = L / n, rr = bw / 2 - post;
  sh.moveTo(0, 0);
  for (let i = 0; i < n; i++) { const uc = (i + 0.5) * bw; sh.lineTo(uc - rr, 0); sh.absarc(uc, 0, rr, Math.PI, 0, true); }
  sh.lineTo(L, 0); sh.lineTo(L, H); sh.lineTo(0, H); sh.lineTo(0, 0);
  return sh;
}
/**
 * The svalgang's arcade along a→b: runs of bays (about `bay` m) between the gaps (entrances, as
 * [u0, u1] metres along the line): in each run a plank parapet with its cap rail, little turned
 * columns with capitals, the band of round arches; a post at each end of a run. The wall plate
 * runs on over the gaps. The parapets stop the walker.
 */
function arcade(bag, col, a, b, y0, { bay = 0.85, parapet = 0.8, colH = 0.62, plate = 0.15, gaps = [] } = {}) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  const at = (u) => [a[0] + ux * u, a[1] + uz * u];
  const runs = [];
  let u0 = 0;
  for (const [g0, g1] of [...gaps].sort((p, q) => p[0] - q[0])) { if (g0 > u0 + 0.3) runs.push([u0, g0]); u0 = g1; }
  if (L > u0 + 0.3) runs.push([u0, L]);
  const ys = y0 + parapet + 0.05, sp = ys + colH;
  // the band of arches springs at the same height everywhere: its height from the standard bay
  const H = bay / 2 - 0.06 + 0.14;
  for (const [r0, r1] of runs) {
    const RL = r1 - r0, n = Math.max(1, Math.round(RL / bay)), bw = RL / n, A = at(r0), B = at(r1);
    bag.add(W, orientedBox(A, B, 0.1, y0, y0 + parapet));
    bag.add(W, orientedBox(A, B, 0.16, y0 + parapet - 0.02, y0 + parapet + 0.05));      // the parapet's cap rail
    col.segment(A, B, 0.16, y0, y0 + 2.2);
    for (let i = 0; i <= n; i++) {
      const [px, pz] = at(r0 + i * bw);
      if (i === 0 || i === n) { bag.add(W, box(px - 0.09, y0, pz - 0.09, px + 0.09, sp + H, pz + 0.09)); continue; }
      bag.add(W, lathe([[0.075, 0], [0.05, 0.05], [0.045, colH * 0.5], [0.05, colH - 0.07], [0.085, colH - 0.02], [0.085, colH], [0.001, colH]], 8, null, px, ys, pz));
    }
    const sh = new Shape(), rr = bw / 2 - 0.06;
    sh.moveTo(0, 0);
    for (let i = 0; i < n; i++) { const uc = (i + 0.5) * bw; sh.lineTo(uc - rr, 0); sh.absarc(uc, 0, rr, Math.PI, 0, true); }
    sh.lineTo(RL, 0); sh.lineTo(RL, H); sh.lineTo(0, H); sh.lineTo(0, 0);
    bag.add(W, slab(sh, 0.1, A, B, sp, 6));
  }
  bag.add(W, orientedBox(a, b, 0.18, sp + H, sp + H + plate));
  return sp + H + plate;
}
/** A squared timber between two points a, b ([x, y, z]), w wide and h deep. */
export function beam(a, b, w, h) {
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], L = Math.hypot(...d), n = d.map((v) => v / L);
  let sx = -n[2], sz = n[0], sl = Math.hypot(sx, sz);
  if (sl < 1e-3) { sx = 1; sz = 0; sl = 1; }
  const side = [sx / sl, 0, sz / sl], up = [side[1] * n[2] - side[2] * n[1], side[2] * n[0] - side[0] * n[2], side[0] * n[1] - side[1] * n[0]];
  const P = (o, sa, sb) => [o[0] + side[0] * sa * w / 2 + up[0] * sb * h / 2, o[1] + side[1] * sa * w / 2 + up[1] * sb * h / 2, o[2] + side[2] * sa * w / 2 + up[2] * sb * h / 2];
  return hexa([P(a, -1, -1), P(a, 1, -1), P(a, 1, 1), P(a, -1, 1), P(b, -1, -1), P(b, 1, -1), P(b, 1, 1), P(b, -1, 1)]);
}
/** A plank wall's outline: L long, H high, door notches from the bottom (round-headed: { u, w, h }, h the springing), round holes ({ u, v, r }). */
export function wallShape(L, H, doors = [], rounds = []) {
  const sh = new Shape();
  sh.moveTo(0, 0);
  for (const d of [...doors].sort((p, q) => p.u - q.u)) { sh.lineTo(d.u - d.w / 2, 0); sh.lineTo(d.u - d.w / 2, d.h); sh.absarc(d.u, d.h, d.w / 2, Math.PI, 0, true); sh.lineTo(d.u + d.w / 2, 0); }
  sh.lineTo(L, 0); sh.lineTo(L, H); sh.lineTo(0, H); sh.lineTo(0, 0);
  for (const r of rounds) { const p = new Path(); p.absarc(r.u, r.v, r.r, 0, Math.PI * 2, false); sh.holes.push(p); }
  return sh;
}
/**
 * Part of a solid of revolution: the profile turned from angle a0 to a0 + π about (cx, cy, cz), closed by
 * its flat cut through the axis, its bottom and (where the profile ends wide) its top. Convex profiles only.
 */
export function halfLathe(profile, seg, cx, cy, cz, a0) {
  const t = [], P = (r, yy, k) => { const a = a0 + Math.PI * k / seg; return [cx + Math.cos(a) * r, cy + yy, cz + Math.sin(a) * r]; };
  for (let i = 0; i + 1 < profile.length; i++) for (let k = 0; k < seg; k++) {
    const [r0, y0] = profile[i], [r1, y1] = profile[i + 1];
    quad(t, P(r0, y0, k), P(r0, y0, k + 1), P(r1, y1, k + 1), P(r1, y1, k));
  }
  const [rb, yb] = profile[0], [rt, yt] = profile[profile.length - 1], ym = (yb + yt) / 2;
  for (let k = 0; k < seg; k++) t.push(cx, cy + yb, cz, ...P(rb, yb, k), ...P(rb, yb, k + 1));
  if (rt > 0.01) for (let k = 0; k < seg; k++) t.push(cx, cy + yt, cz, ...P(rt, yt, k + 1), ...P(rt, yt, k));
  // the cut: the profile on both sides of the axis, fanned from a point on the axis
  const ring = [...profile.map(([r, yy]) => P(r, yy, 0)), ...[...profile].reverse().map(([r, yy]) => P(r, yy, seg))];
  for (let i = 0; i < ring.length; i++) t.push(cx, cy + ym, cz, ...ring[i], ...ring[(i + 1) % ring.length]);
  return fromTriangles(orientOutward(t));
}
/**
 * A lean-to roof of boards under shingles round a core: from the outer rect O at height yo (its top
 * surface) up to the inner rect I at yi, in four trapezoids meeting at the hips; `cut` leaves out a
 * stretch [z0, z1] of the +x side (where the chancel stands against it).
 */
function leanTo(bag, O, I, yo, yi, cut = null) {
  const piece = (a, b, c, d) => {                   // a b on the eave, c d at the core: top-surface points [x, y, z]
    for (const [mat, t0, t1] of [[SH, 0, 0.09], [W, 0.09, 0.15]]) {
      const dn = (p, t) => [p[0], p[1] - t, p[2]];
      bag.add(mat, hexa([dn(a, t1), dn(b, t1), dn(c, t1), dn(d, t1), dn(a, t0), dn(b, t0), dn(c, t0), dn(d, t0)]));
    }
  };
  const o = (x, z) => [x, yo, z], i = (x, z) => [x, yi, z];
  piece(o(O[0], O[1]), o(O[2], O[1]), i(I[2], I[1]), i(I[0], I[1]));
  piece(o(O[2], O[3]), o(O[0], O[3]), i(I[0], I[3]), i(I[2], I[3]));
  piece(o(O[0], O[3]), o(O[0], O[1]), i(I[0], I[1]), i(I[0], I[3]));
  if (!cut) piece(o(O[2], O[1]), o(O[2], O[3]), i(I[2], I[3]), i(I[2], I[1]));
  else {
    piece(o(O[2], O[1]), o(O[2], cut[0]), i(I[2], cut[0]), i(I[2], I[1]));
    piece(o(O[2], cut[1]), o(O[2], O[3]), i(I[2], I[3]), i(I[2], cut[1]));
  }
}
/** A St Andrew's cross of planks in the upright field between u0 and u1 along a→b (plan points), v0 to v1 high, with the sun disc at its crossing. */
function andrew(bag, a, b, u0, u1, v0, v1, w = 0.16, d = 0.06, sun = 0.2) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, P = (u, v) => [a[0] + ux * u, v, a[1] + uz * u];
  bag.add(W, beam(P(u0, v0), P(u1, v1), d, w));
  bag.add(W, beam(P(u0, v1), P(u1, v0), d, w));
  if (!sun) return;
  const m = P((u0 + u1) / 2, (v0 + v1) / 2), alongX = Math.abs(ux) > 0.5;
  const rodN = (h, r) => logRod(alongX ? [m[0], m[1], m[2] - h] : [m[0] - h, m[1], m[2]], alongX ? [m[0], m[1], m[2] + h] : [m[0] + h, m[1], m[2]], r, 14);
  bag.add(W, rodN(0.05, sun));
  bag.add(W, rodN(0.075, sun * 0.4));
}
/** An arch board between two staves: the band from u0 to u1 along a→b with one round arch cut from below, its crown thickness 0.14, its top at yTop. */
function archBoard(bag, a, b, u0, u1, yTop, th = 0.1) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, RL = u1 - u0, rr = RL / 2, H = rr + 0.14;
  const sh = new Shape(); sh.moveTo(0, 0); sh.absarc(RL / 2, 0, rr, Math.PI, 0, true); sh.lineTo(RL, H); sh.lineTo(0, H); sh.lineTo(0, 0);
  bag.add(W, slab(sh, th, [a[0] + ux * u0, a[1] + uz * u0], [a[0] + ux * u1, a[1] + uz * u1], yTop - H, 12));
  return yTop - H;
}
/**
 * stave_church: { c, y, s (scale) } — Borgund: the west porch and door, the chancel and apse east.
 * Hollow: the plank floor on the sills; round the outside the svalgang (gallery) under its lean-to
 * roof; inside the aisle walls the dark nave, its raised central room carried on fourteen round
 * staves (the middle one of each long side standing on an arch), the arcade of arched knee braces,
 * the tengs and the St Andrew's crosses above them, the struts out to the wall posts and the great
 * crosses on the aisle walls, the wall benches; high in the central room's long walls the eight round
 * openings, the only daylight but the doors; the open roof with its rafters and scissor beams; the
 * chancel behind its screen with the stone altar, its frontal and candles, the rood over the opening,
 * the round apse; the soapstone font by the west door.
 */
function staveChurch(el, { bag, col, lights }) {
  const [cx, cz] = el.c, y = el.y ?? 0, s = el.s ?? 1, X = (v) => cx + v * s, Z = (v) => cz + v * s, U = (v) => y + v * s;
  const F = U(0.35), T = 0.12;
  const sv = [X(-7.4), Z(-6.8), X(6), Z(6.8)], ai = [X(-5.6), Z(-5), X(5.4), Z(5)], co = [X(-4), Z(-3.4), X(4), Z(3.4)];
  const po = [X(-8.8), Z(-1.6), sv[0], Z(1.6)], ch = [ai[2], Z(-2.6), X(9.6), Z(2.6)], ac = X(9.6), ra = 1.75 * s;
  const xs = X(-0.4), sk = [xs - 0.7, sv[3], xs + 0.7, sv[3] + 1.3 * s];
  // the footing: a rubble bed and the sill frame; the plank floor on top (svalgang, nave, porch, skruv, chancel, apse)
  bag.add('rubble', box(sv[0] - 0.25, y - 0.6, sv[1] - 0.25, sv[2] + 0.25, U(0.15), sv[3] + 0.25));
  bag.add(W, box(sv[0], U(0.15), sv[1], sv[2], F, sv[3]));
  bag.add('rubble', box(po[0] - 0.15, y - 0.6, po[1] - 0.15, po[2] - 0.25, U(0.15), po[3] + 0.15));
  bag.add(W, box(po[0], U(0.15), po[1], po[2], F, po[3]));
  bag.add('rubble', box(sv[2] + 0.25, y - 0.6, ch[1] - 0.15, ch[2] + 0.15, U(0.15), ch[3] + 0.15));
  bag.add(W, box(sv[2], U(0.15), ch[1], ch[2], F, ch[3]));
  bag.add('rubble', halfLathe([[ra + 0.15, 0], [ra + 0.15, U(0.15) - y + 0.6]], 8, ac + 0.15, y - 0.6, cz, -Math.PI / 2));
  bag.add(W, halfLathe([[ra, 0], [ra, F - U(0.15)]], 8, ac, U(0.15), cz, -Math.PI / 2));
  bag.add(W, box(sk[0], U(0.15), sk[1], sk[2], F, sk[3]));
  for (const r of [sv, po, sk, [sv[2], ch[1], ch[2], ch[3]], [ac, Z(-1.75), ac + ra, Z(1.75)]]) col.floor(r, F);

  // ── the svalgang: arcades on the north, south and west, gaps at the porch and the skruv; closed east
  arcade(bag, col, [sv[0], sv[1]], [sv[2], sv[1]], F);
  arcade(bag, col, [sv[0], sv[3]], [sv[2], sv[3]], F, { gaps: [[sk[0] - sv[0], sk[2] - sv[0]]] });
  arcade(bag, col, [sv[0], sv[1]], [sv[0], sv[3]], F, { gaps: [[po[1] - sv[1], po[3] - sv[1]]] });
  for (const [z0, z1] of [[sv[1], ch[1]], [ch[3], sv[3]]]) { bag.add(W, box(sv[2] - 0.1, F, z0, sv[2], U(2.6) + 0.1, z1)); col.rect([sv[2] - 0.1, z0, sv[2], z1], F, U(2.6)); }
  // its boarded ceiling, over the ring between the arcades and the aisle walls (not over the chancel's passage)
  for (const r of [[sv[0], sv[1], sv[2], ai[1]], [sv[0], ai[3], sv[2], sv[3]], [sv[0], ai[1], ai[0], ai[3]], [ai[2], ai[1], sv[2], ch[1]], [ai[2], ch[3], sv[2], ai[3]]]) bag.add(W, box(r[0], U(2.6) - 0.04, r[1], r[2], U(2.6), r[3]));
  leanTo(bag, [sv[0] - 0.3, sv[1] - 0.3, sv[2] + 0.3, sv[3] + 0.3], [ai[0] + 0.04, ai[1] + 0.04, ai[2] - 0.04, ai[3] - 0.04], U(2.6) + 0.06, U(4.2), [ch[1], ch[3]]);

  // ── the south skruv: a gabled porch standing out from the gallery over its entrance, a cross on its gable
  for (const xx of [sk[0], sk[2]]) {
    bag.add(W, box(xx - 0.06, F, sk[1], xx + 0.06, F + 0.75, sk[3])); col.rect([xx - 0.06, sk[1], xx + 0.06, sk[3]], F, F + 1.8);
    bag.add(W, box(xx - 0.08, F, sk[3] - 0.16, xx + 0.08, U(2.5), sk[3]));
  }
  const skr = pitched(bag, SH, W, [sk[0] - 0.08, sk[1] - 0.3, sk[2] + 0.08, sk[3]], U(2.5), 1.3, 0.2, false);
  bag.add(W, box(sk[0] - 0.02, U(2.5) - 0.06, sk[1] - 0.3, sk[2] + 0.02, U(2.5), sk[3] - 0.16));       // its boarded ceiling
  { const sh = new Shape(), L = sk[2] - sk[0] + 0.16, r = L / 2 - 0.1; sh.moveTo(0, 0); sh.lineTo(0.1, 0); sh.absarc(L / 2, 0, r, Math.PI, 0, true); sh.lineTo(L, 0); sh.lineTo(L, 0.55); sh.lineTo(0, 0.55); sh.lineTo(0, 0); bag.add(W, slab(sh, 0.12, [sk[0] - 0.08, sk[3] - 0.08], [sk[2] + 0.08, sk[3] - 0.08], U(2.5) - 0.55, 10)); }
  cross(bag, (sk[0] + sk[2]) / 2, skr - 0.1, sk[3] + 0.1, s * 0.6);

  // ── the aisle walls: planks between posts, the west and south portals, the chancel opening east
  const slope = (run) => (U(7.4) - U(5.6)) / run;
  const topNS = U(5.6) + slope(ai[3] - co[3] + 0.3) * 0.3 - 0.05, topWE = U(5.6) + slope(co[0] - ai[0] + 0.3) * 0.3 - 0.05, topE = U(5.6) + slope(ai[2] - co[2] + 0.3) * 0.3 - 0.05;
  const wDoor = { w: 1.0, h: 1.5 }, sDoor = { w: 0.85, h: 1.45 }, chW = 3 * s, chH = U(3.4) - F;
  const wall = (a, b, H, doors = [], rounds = [], y0 = F) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
    bag.add(W, slab(wallShape(L, H, doors, rounds), T, a, b, y0, 10));
    const cuts = [0, ...doors.flatMap((d) => [d.u - d.w / 2, d.u + d.w / 2]).sort((p, q) => p - q), L];
    for (let k = 0; k + 1 < cuts.length; k += 2) if (cuts[k + 1] - cuts[k] > 0.02) col.segment([a[0] + ux * cuts[k], a[1] + uz * cuts[k]], [a[0] + ux * cuts[k + 1], a[1] + uz * cuts[k + 1]], T, y0, y0 + Math.min(H, 2.6));
  };
  wall([ai[0], ai[1] + T / 2], [ai[2], ai[1] + T / 2], topNS - F);
  wall([ai[0], ai[3] - T / 2], [ai[2], ai[3] - T / 2], topNS - F, [{ u: xs - ai[0], ...sDoor }]);
  wall([ai[0] + T / 2, ai[1] + T], [ai[0] + T / 2, ai[3] - T], topWE - F, [{ u: cz - ai[1] - T, ...wDoor }]);
  wall([ai[2] - T / 2, ai[1] + T], [ai[2] - T / 2, ai[3] - T], topE - F, [{ u: cz - ai[1] - T, w: chW, h: chH }]);
  // outside, in the gallery, the wall's staves standing proud (clear of the south portal)
  for (let k = 0; k <= 8; k++) for (const [zz, sg] of [[ai[1], -1], [ai[3], 1]]) {
    const x = ai[0] + 0.3 + k * (ai[2] - ai[0] - 0.6) / 8;
    if (sg > 0 && Math.abs(x - xs) < sDoor.w / 2 + 0.2) continue;
    bag.add(W, box(x - 0.07, F, Math.min(zz, zz + sg * 0.05), x + 0.07, U(2.6) - 0.04, Math.max(zz, zz + sg * 0.05)));
  }
  // the portals' jambs and heads (inside face), plain boards
  const jambs = (u, w, h, along, line, sg) => {
    for (const e of [-1, 1]) { const p = u + e * (w / 2 + 0.07); bag.add(W, along ? box(p - 0.07, F, line + sg * 0.02, p + 0.07, F + h, line + sg * 0.1) : box(line + sg * 0.02, F, p - 0.07, line + sg * 0.1, F + h, p + 0.07)); }
  };
  jambs(xs, sDoor.w, sDoor.h, true, ai[3] - T, -1);
  jambs(cz, wDoor.w, wDoor.h, false, ai[0] + T, 1);
  // the chancel screen: the opening framed as a stepped portal with a half-column each side, the rood beam and the crucifix over it
  for (const e of [-1, 1]) {
    const zz = cz + e * (chW / 2 + 0.1), xx = ai[2] - T - 0.02;
    bag.add(W, box(xx - 0.12, F, zz - 0.1, xx, F + chH, zz + 0.1));
    bag.add(W, lathe([[0.1, 0], [0.08, 0.1], [0.075, chH - 0.25], [0.11, chH - 0.12], [0.11, chH], [0.001, chH]], 10, null, xx - 0.12, F, cz + e * (chW / 2 - 0.02)));
  }
  const rb = F + 2.55;
  bag.add(W, box(ai[2] - T - 0.2, rb - 0.2, cz - chW / 2 - 0.15, ai[2] - T - 0.02, rb, cz + chW / 2 + 0.15));
  crucifix(bag, ai[2] - T - 0.11, rb, cz);

  // ── the nave's raised central room on its fourteen staves
  const sx = [-3.8, -1.9, 0, 1.9, 3.8].map(X), sz = [-3.2, -1.1, 1.1, 3.2].map(Z), sr = 0.2;
  const yTeng = U(4.6), yBeam = U(7.2), yPlate = U(10.3);
  const staves = [];
  for (const x of sx) for (const z of [sz[0], sz[3]]) staves.push([x, z, x === X(0) ? yTeng - 0.14 : F]);
  for (const x of [sx[0], sx[4]]) for (const z of [sz[1], sz[2]]) staves.push([x, z, F]);
  for (const [x, z, y0] of staves) {
    bag.add(W, lathe([[sr, 0], [sr, yPlate + 0.2 - y0], [0.001, yPlate + 0.2 - y0]], 12, null, x, y0, z));
    if (y0 - F < 1.8) col.circle(x, z, sr, F, F + 2.2);
    else bag.add(W, lathe([[sr * 0.4, 0], [sr * 1.05, 0.25], [0.001, 0.3]], 12, null, x, y0 - 0.25, z));       // the suspended stave's carved foot
  }
  // the intermediate staves end in carved masks and beasts' heads, turned into the room, under the wall plate (SNL)
  { let k = 0;
    for (const [x, z] of staves) {
      const corner = (x === sx[0] || x === sx[4]) && (z === sz[0] || z === sz[3]);
      if (corner) continue;
      const d = Math.abs(z - sz[0]) < 1e-6 ? [0, 1] : Math.abs(z - sz[3]) < 1e-6 ? [0, -1] : x === sx[0] ? [1, 0] : [-1, 0];
      staveMask(bag, W, [x + d[0] * (sr - 0.015), yPlate - 0.32, z + d[1] * (sr - 0.015)], d, k++ % 2 ? 'beast' : 'man', 1.5);
    } }
  // the four sides of the central room: a (corner) → b (corner) on the staves' line, the staves' positions along it
  const sides = [
    [[sx[0], sz[0]], [sx[4], sz[0]], sx.map((x) => x - sx[0]), true],
    [[sx[0], sz[3]], [sx[4], sz[3]], sx.map((x) => x - sx[0]), true],
    [[sx[0], sz[0]], [sx[0], sz[3]], sz.map((z) => z - sz[0]), false],
    [[sx[4], sz[0]], [sx[4], sz[3]], sz.map((z) => z - sz[0]), false],
  ];
  for (const [a, b, us, long] of sides) {
    // the arcade of arched knee braces under the teng (on a long side the middle arch is wide, the middle stave standing on it)
    const spans = long ? [[us[0], us[1]], [us[1], us[3]], [us[3], us[4]]] : us.slice(0, -1).map((u, k) => [u, us[k + 1]]);
    for (const [u0, u1] of spans) archBoard(bag, a, b, u0 + sr * 0.8, u1 - sr * 0.8, yTeng);
    bag.add(W, orientedBox(a, b, 0.18, yTeng, yTeng + 0.22, sr));                 // the teng
    bag.add(W, orientedBox(a, b, 0.2, yBeam, U(7.4), sr));                        // the beam the central room's walls stand on
    bag.add(W, orientedBox(a, b, 0.2, yPlate, yPlate + 0.2, sr));                // the wall plate
    for (let k = 0; k + 1 < us.length; k++) {
      andrew(bag, a, b, us[k] + sr, us[k + 1] - sr, yTeng + 0.22, yBeam, 0.16, 0.06, 0.17);
      archBoard(bag, a, b, us[k] + sr * 0.8, us[k + 1] - sr * 0.8, yPlate, 0.08);   // the upper arcade under the plate
    }
  }
  // the horizontal struts from the staves out to the aisle walls' posts, and those posts
  const posts = [];
  for (const x of sx) { posts.push([x, ai[1] + T, x, sz[0], 0]); posts.push([x, ai[3] - T, x, sz[3], 0]); }
  for (const z of sz) { posts.push([ai[0] + T, z, sx[0], z, 1]); posts.push([ai[2] - T, z, sx[4], z, 1]); }
  for (const [wx, wz, x, z] of posts) {
    bag.add(W, beam([wx, yTeng + 0.05, wz], [x, yTeng + 0.05, z], 0.14, 0.16));
    const onDoor = (Math.abs(wz - (ai[3] - T)) < 0.01 && Math.abs(wx - xs) < sDoor.w / 2 + 0.15) || (Math.abs(wx - (ai[0] + T)) < 0.01 && Math.abs(wz - cz) < wDoor.w / 2 + 0.15) || (Math.abs(wx - (ai[2] - T)) < 0.01 && Math.abs(wz - cz) < chW / 2 + 0.25);
    if (!onDoor) bag.add(W, box(wx - 0.09, F, wz - 0.09, wx + 0.09, topNS - 0.25, wz + 0.09));
  }
  // the great St Andrew's crosses on the aisle walls between the posts, above the benches (with leaf-carved arms: a boss at each end)
  const bayCross = (a, b, us, skip) => { for (let k = 0; k + 1 < us.length; k++) if (!skip(us[k], us[k + 1])) andrew(bag, a, b, us[k] + 0.12, us[k + 1] - 0.12, F + 1.35, topNS - 0.35, 0.18, 0.05, 0); };
  const nsU = [ai[0] + T, ...sx, ai[2] - T];
  bayCross([nsU[0], ai[1] + T + 0.03], [nsU[6], ai[1] + T + 0.03], nsU.map((x) => x - nsU[0]), () => false);
  bayCross([nsU[0], ai[3] - T - 0.03], [nsU[6], ai[3] - T - 0.03], nsU.map((x) => x - nsU[0]), (u0, u1) => xs - nsU[0] > u0 - 0.6 && xs - nsU[0] < u1 + 0.6);
  const weU = [ai[1] + T, ...sz, ai[3] - T];
  bayCross([ai[0] + T + 0.03, weU[0]], [ai[0] + T + 0.03, weU[5]], weU.map((z) => z - weU[0]), (u0, u1) => cz - weU[0] > u0 && cz - weU[0] < u1);
  // the wall benches round the aisles
  const bench = (a, b, sg, along) => {
    const [p, q] = along ? [a[0], b[0]] : [a[1], b[1]], line = along ? a[1] : a[0];
    if (q - p < 0.5) return;
    const r = along ? [p, Math.min(line, line + sg * 0.38), q, Math.max(line, line + sg * 0.38)] : [Math.min(line, line + sg * 0.38), p, Math.max(line, line + sg * 0.38), q];
    bag.add(W, box(r[0], F + 0.4, r[1], r[2], F + 0.46, r[3]));
    const fr = along ? [p, Math.min(line + sg * 0.3, line + sg * 0.34), q, Math.max(line + sg * 0.3, line + sg * 0.34)] : [Math.min(line + sg * 0.3, line + sg * 0.34), p, Math.max(line + sg * 0.3, line + sg * 0.34), q];
    bag.add(W, box(fr[0], F, fr[1], fr[2], F + 0.4, fr[3]));
    col.rect(r, F, F + 0.46);
  };
  bench([ai[0] + T + 0.4, ai[1] + T], [ai[2] - T - 0.1, ai[1] + T], 1, true);
  bench([ai[0] + T + 0.4, ai[3] - T], [xs - sDoor.w / 2 - 0.25, ai[3] - T], -1, true);
  bench([xs + sDoor.w / 2 + 0.25, ai[3] - T], [ai[2] - T - 0.1, ai[3] - T], -1, true);
  bench([ai[0] + T, ai[1] + T], [ai[0] + T, cz - wDoor.w / 2 - 0.3], 1, false);
  bench([ai[0] + T, cz + wDoor.w / 2 + 0.3], [ai[0] + T, ai[3] - T], 1, false);
  // the soapstone font by the west door: a box-shaped basin on a foot
  { const fx = X(-4.6), fz = Z(-2), b = 0.32;
    bag.add('soapstone', box(fx - 0.2, F, fz - 0.2, fx + 0.2, F + 0.5, fz + 0.2));
    for (const [x0, z0, x1, z1] of [[-b, -b, b, -b + 0.07], [-b, b - 0.07, b, b], [-b, -b + 0.07, -b + 0.07, b - 0.07], [b - 0.07, -b + 0.07, b, b - 0.07]]) bag.add('soapstone', box(fx + x0, F + 0.5, fz + z0, fx + x1, F + 0.92, fz + z1));
    bag.add('soapstone', box(fx - b + 0.07, F + 0.5, fz - b + 0.07, fx + b - 0.07, F + 0.62, fz + b - 0.07));
    bag.add('water', box(fx - b + 0.07, F + 0.62, fz - b + 0.07, fx + b - 0.07, F + 0.8, fz + b - 0.07));
    col.circle(fx, fz, 0.34, F, F + 0.92); }

  // ── the central room's walls above the aisle roof, the eight round openings high in the long walls; the gables
  const Yc = U(10.5) + 0.35 * s * 1.55, cl = co[2] - co[0], cw = co[3] - co[1];
  const glug = [-2.85, -0.95, 0.95, 2.85].map((u) => ({ u: X(u) - co[0], v: U(8.75) - U(7.4), r: 0.15 }));
  bag.add(W, slab(wallShape(cl, Yc - U(7.4), [], glug), T, [co[0], co[1] + T / 2], [co[2], co[1] + T / 2], U(7.4), 12));
  bag.add(W, slab(wallShape(cl, Yc - U(7.4), [], glug), T, [co[0], co[3] - T / 2], [co[2], co[3] - T / 2], U(7.4), 12));
  for (const xx of [co[0] + T / 2, co[2] - T / 2]) bag.add(W, slab(wallShape(cw - 2 * T, Yc - U(7.4)), T, [xx, co[1] + T], [xx, co[3] - T], U(7.4), 2));
  const rise = (cw / 2) * 1.55, ridge = pitched(bag, SH, null, co, Yc, 1.55, 0.35 * s, true, 0.18);
  { const tri = new Shape(); tri.moveTo(0, 0); tri.lineTo(cw, 0); tri.lineTo(cw / 2, rise - 0.06); tri.lineTo(0, 0);
    for (const xx of [co[0] + T / 2, co[2] - T / 2]) bag.add(W, slab(tri, T, [xx, co[1]], [xx, co[3]], Yc, 2)); }
  // under the roof: the boarding, the rafters and the scissor beams crossing the room
  for (const sg of [-1, 1]) {
    const ze = sg < 0 ? co[1] + T : co[3] - T, yAt = (z) => Yc + (cw / 2 - Math.abs(z - cz)) * 1.55 - 0.18;
    const A = co[0] + T, B = co[2] - T, Pz = (x, z, d) => [x, yAt(z) + d, z];
    bag.add(W, hexa([Pz(A, ze, -0.04), Pz(B, ze, -0.04), Pz(B, cz, -0.04), Pz(A, cz, -0.04), Pz(A, ze, 0.01), Pz(B, ze, 0.01), Pz(B, cz, 0.01), Pz(A, cz, 0.01)]));
    for (let k = 0; k <= 7; k++) {
      const x = A + 0.15 + k * (B - A - 0.3) / 7;
      bag.add(W, beam([x, yAt(ze) - 0.1, ze], [x, yAt(cz) - 0.1, cz - sg * 0.02], 0.1, 0.12));                                   // the rafter
      const z2 = cz - sg * 0.55 * (cw / 2);
      bag.add(W, beam([x + sg * 0.06, Yc - 0.1, ze], [x + sg * 0.06, yAt(z2) - 0.2, z2], 0.08, 0.12));                           // the scissor beam, to the far rafter
    }
  }
  // the dragon heads, the openwork crest along the ridge
  // (both the nave and the turret carry openwork crests with dragon heads over the gables — SNL; the turret's below)
  { const xe = 0.35 * s, bt = 1.25 * s;
    ridgeCrest(bag, W, [co[0] - xe, cz], [cx - bt, cz], ridge - 0.03, 0.4 * s);
    ridgeCrest(bag, W, [cx + bt, cz], [co[2] + xe, cz], ridge - 0.03, 0.4 * s);
    for (const [x, d] of [[co[0] - xe + 0.12, -1], [co[2] + xe - 0.12, 1]]) dragonHead(bag, W, [x, ridge - 0.06, cz], [d, 0], 1.3 * s); }
  // the aisles' lean-to roof, from the eaves up to the central room's walls
  leanTo(bag, [ai[0] - 0.3, ai[1] - 0.3, ai[2] + 0.3, ai[3] + 0.3], [co[0] + 0.04, co[1] + 0.04, co[2] - 0.04, co[3] - 0.04], U(5.6), U(7.4));

  // ── the west porch: its walls and gable, the portal, the two-storey superstructure over it (the skruv) with a cross
  const pH = U(2.4) + 0.3;
  for (const zz of [po[1] + T / 2, po[3] - T / 2]) { bag.add(W, box(po[0], F, zz - T / 2, po[2], pH, zz + T / 2)); col.segment([po[0], zz], [po[2], zz], T, F, pH); }
  bag.add(W, slab(wallShape(po[3] - po[1], pH - F, [{ u: cz - po[1], ...wDoor }]), T, [po[0] + T / 2, po[1]], [po[0] + T / 2, po[3]], F, 12));
  for (const [z0, z1] of [[po[1], cz - wDoor.w / 2], [cz + wDoor.w / 2, po[3]]]) col.segment([po[0] + T / 2, z0], [po[0] + T / 2, z1], T, F, pH);
  bag.add(W, box(po[0] + T, pH - 0.05, po[1] + T, po[2], pH, po[3] - T));                                  // its boarded ceiling
  const pr = pitched(bag, SH, W, po, pH, 1.2, 0.25, true);
  const pu = [po[0] + 0.45, Z(-1.05), po[2] + 0.2, Z(1.05)];
  bag.add(W, box(pu[0], pr - 0.9, pu[1], pu[2], pr + 1.1 * s, pu[3]));
  for (const zz of [-0.45, 0.45]) { bag.add('opening', box(pu[0] - 0.03, pr + 0.1 * s, cz + zz * s - 0.17 * s, pu[0], pr + 0.75 * s, cz + zz * s + 0.17 * s)); bag.add('opening', lathe([[0.17 * s, 0], [0.17 * s, 0.03], [0.001, 0.03]], 10).rotateZ(Math.PI / 2).translate(pu[0] - 0.003, pr + 0.75 * s, cz + zz * s)); }
  const pur = pitched(bag, SH, W, pu, pr + 1.1 * s + 0.2 * 1.4, 1.4, 0.2, true);
  cross(bag, pu[0] - 0.12, pur - 0.15, cz, s * 0.8);
  // the portal: the broad carved side panels and the field over the arch (the vine and dragon work), the half-columns; the door leaf stands open inward
  { const hh = (po[3] - po[1]) / 2, yr = pH + hh * 1.2;
    westPortal(bag, W, [po[0], F, cz], [-1, 0], { w: wDoor.w, hs: wDoor.h, pw: 0.62 * s, top: (u) => yr - 0.16 - 0.08 - Math.abs(u) * 1.2 - F }); }
  bag.add(W, box(po[0] + T + 0.02, F, cz + wDoor.w / 2 + 0.02, po[0] + T + wDoor.w - 0.04, F + wDoor.h + 0.2, cz + wDoor.w / 2 + 0.07));
  bag.add('iron', box(po[0] + T + 0.3, F + 0.3, cz + wDoor.w / 2 + 0.07, po[0] + T + wDoor.w - 0.1, F + 0.34, cz + wDoor.w / 2 + 0.085));
  bag.add('iron', box(po[0] + T + 0.3, F + 1.25, cz + wDoor.w / 2 + 0.07, po[0] + T + wDoor.w - 0.1, F + 1.29, cz + wDoor.w / 2 + 0.085));

  // ── the chancel: its walls, its boarded ceiling, the opening to the apse; outside its skirt roof, upper storey and gable
  const cH = U(5.2);
  for (const zz of [ch[1] + T / 2, ch[3] - T / 2]) { bag.add(W, box(ch[0], F, zz - T / 2, ch[2], cH, zz + T / 2)); col.segment([ch[0], zz], [ch[2], zz], T, F, cH); }
  const aW = 2.8 * s, aH = U(3.2) - F;
  bag.add(W, slab(wallShape(ch[3] - ch[1] - 2 * T, cH - F, [{ u: cz - ch[1] - T, w: aW, h: aH }]), T, [ch[2] - T / 2, ch[1] + T], [ch[2] - T / 2, ch[3] - T], F, 12));
  for (const [z0, z1] of [[ch[1] + T, cz - aW / 2], [cz + aW / 2, ch[3] - T]]) col.segment([ch[2] - T / 2, z0], [ch[2] - T / 2, z1], T, F, cH);
  bag.add(W, box(ch[0], cH - 0.06, ch[1] + T, ch[2] - T, cH, ch[3] - T));
  bag.add(SH, frustum([sv[2] - 0.3, ch[1] - 0.3, ch[2] + 0.3, ch[3] + 0.3], cH, U(6), 0.3, 0.3, 0.9, 0.9, { noBottom: true }));
  bag.add(W, box(sv[2] + 0.5, U(6), Z(-1.8), ch[2] - 0.3, U(7.6) + 0.3 * 1.4, Z(1.8)));
  const cr = pitched(bag, SH, W, [sv[2] + 0.5, Z(-1.8), ch[2] - 0.3, Z(1.8)], U(7.6) + 0.3 * 1.4, 1.4, 0.3, true);
  cross(bag, sv[2] + 0.2, cr - 0.15, cz, s * 0.9);
  // the round apse: its wall in staves round a half circle, its conical roof (its underside the apse's ceiling), the little tower and its cap, the cross
  const aTop = U(4.2), nA = 7;
  for (let k = 0; k < nA; k++) {
    const a0 = -Math.PI / 2 + Math.PI * k / nA, a1 = a0 + Math.PI / nA, R = ra - T / 2;
    const p = [ac + Math.cos(a0) * R, cz + Math.sin(a0) * R], q = [ac + Math.cos(a1) * R, cz + Math.sin(a1) * R];
    bag.add(W, orientedBox(p, q, T, F, aTop + 0.05, 0.03)); col.segment(p, q, T, F, aTop);
    bag.add(W, box(p[0] + Math.cos(a0) * 0.05 - 0.07, F, p[1] + Math.sin(a0) * 0.05 - 0.07, p[0] + Math.cos(a0) * 0.05 + 0.07, aTop, p[1] + Math.sin(a0) * 0.05 + 0.07));
  }
  bag.add(W, halfLathe([[ra - 0.02, 0], [ra - 0.02, 0.04]], 10, ac, aTop - 0.04, cz, -Math.PI / 2));
  bag.add(SH, halfLathe([[2.3 * s, 0], [0.7 * s, 2.2 * s], [0.001, 2.4 * s]], 12, ac, aTop, cz, -Math.PI / 2));
  bag.add(W, lathe([[0.6 * s, 0], [0.6 * s, 1.4 * s], [0.001, 1.4 * s]], 8, null, ac + 0.25, aTop + 2.1 * s, cz));
  bag.add(SH, lathe([[0.8 * s, 0], [0.001, 2.6 * s]], 8, null, ac + 0.25, aTop + 3.5 * s, cz));
  cross(bag, ac + 0.25, aTop + 3.5 * s + 2.45 * s, cz, s * 0.7);
  // the altar at the apse's mouth: two stacked stone blocks and the slab (about 1.33 × 0.65 × 0.92 m), the linen, the painted frontal, the candles
  { const xa = ac + 0.45, h = 0.92, hw = 0.665, hd = 0.325;
    bag.add('rubble', box(xa - hd + 0.04, F, cz - hw + 0.04, xa + hd - 0.04, F + 0.42, cz + hw - 0.04));
    bag.add('rubble', box(xa - hd + 0.06, F + 0.42, cz - hw + 0.06, xa + hd - 0.06, F + h - 0.12, cz + hw - 0.06));
    bag.add('flagstone', box(xa - hd, F + h - 0.12, cz - hw, xa + hd, F + h, cz + hw));
    bag.add('linen', box(xa - hd - 0.02, F + h, cz - hw - 0.02, xa + hd + 0.02, F + h + 0.012, cz + hw + 0.02));
    bag.add('linen', box(xa - hd - 0.03, F + h - 0.3, cz - hw - 0.03, xa - hd - 0.02, F + h + 0.012, cz + hw + 0.03));
    // the frontal: a painted panel in its frame against the altar's west face
    bag.add(W, box(xa - hd - 0.1, F + 0.02, cz - hw - 0.02, xa - hd - 0.06, F + h - 0.31, cz + hw + 0.02));
    bag.add('ceiling_painted', box(xa - hd - 0.115, F + 0.08, cz - hw + 0.06, xa - hd - 0.1, F + h - 0.37, cz + hw - 0.06));
    col.rect([xa - hd - 0.12, cz - hw - 0.03, xa + hd, cz + hw + 0.03], F, F + h);
    for (const e of [-1, 1]) {
      const z = cz + e * 0.48, yy = F + h + 0.012;
      bag.add('iron', lathe([[0.07, 0], [0.06, 0.02], [0.015, 0.05], [0.015, 0.26], [0.05, 0.28], [0.04, 0.3], [0.001, 0.3]], 8, null, xa, yy, z));
      bag.add('linen', lathe([[0.022, 0], [0.02, 0.2], [0.004, 0.22]], 8, null, xa, yy + 0.3, z));
      bag.add('flame', lathe([[0.001, 0], [0.012, 0.015], [0.008, 0.04], [0.001, 0.055]], 6, null, xa, yy + 0.52, z));
      lights.push({ at: [xa, yy + 0.56, z], color: '#ffb46b', intensity: 1.6, distance: 7 });
    }
    // a little wooden cross on the altar
    bag.add(W, box(xa - 0.03, F + h + 0.012, cz - 0.08, xa + 0.03, F + h + 0.04, cz + 0.08));
    bag.add(W, box(xa - 0.015, F + h + 0.04, cz - 0.015, xa + 0.015, F + h + 0.45, cz + 0.015));
    bag.add(W, box(xa - 0.015, F + h + 0.3, cz - 0.11, xa + 0.015, F + h + 0.33, cz + 0.11)); }

  // ── the ridge turret: a base on the ridge under crossing gables, two panelled storeys with their open
  // arcades and skirts, and the spire in two stages (seven roofs in all, one above another)
  const b0 = 1.25 * s, ty = ridge - 1.2 * s, yb0 = ridge - b0 * 1.55 - 0.03;
  { const sh = new Shape(); sh.moveTo(0, 0); sh.lineTo(b0, b0 * 1.55 - 0.08); sh.lineTo(2 * b0, 0); sh.lineTo(2 * b0, ty + 2.1 * s - yb0); sh.lineTo(0, ty + 2.1 * s - yb0); sh.lineTo(0, 0);
    bag.add(W, slab(sh, 2 * b0, [cx, cz - b0], [cx, cz + b0], yb0, 2)); }
  const g1 = pitched(bag, SH, W, [cx - b0, cz - b0, cx + b0, cz + b0], ty + 2.1 * s, 1.1, 0.25, true);
  pitched(bag, SH, W, [cx - b0, cz - b0, cx + b0, cz + b0], ty + 2.1 * s, 1.1, 0.25, false);
  // the turret's crests on the four short ridges outside its first storey, the dragon heads over its east and west gables
  { const e = b0 + 0.25, a = 0.85 * s;
    for (const sg of [-1, 1]) {
      ridgeCrest(bag, W, [cx + sg * e, cz], [cx + sg * a, cz], g1 - 0.03, 0.3 * s);
      ridgeCrest(bag, W, [cx, cz + sg * e], [cx, cz + sg * a], g1 - 0.03, 0.3 * s);
      dragonHead(bag, W, [cx + sg * (e - 0.1), g1 - 0.05, cz], [sg, 0], 0.9 * s);
    } }
  const storey = (a, y0, h) => {
    bag.add(W, box(cx - a, y0, cz - a, cx + a, y0 + h, cz + a));
    for (const [nx, nz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) for (let k = -1; k <= 1; k++) {
      const u = k * a * 0.6, w = a * 0.18, ox = cx + nx * (a + 0.02) + nz * u, oz = cz + nz * (a + 0.02) + nx * u;
      bag.add('opening', box(ox - (nx ? 0.02 : w), y0 + h * 0.2, oz - (nz ? 0.02 : w), ox + (nx ? 0.02 : w), y0 + h * 0.72, oz + (nz ? 0.02 : w)));
      bag.add(W, box(ox - (nx ? 0.04 : w + 0.05), y0 + h * 0.72, oz - (nz ? 0.04 : w + 0.05), ox + (nx ? 0.04 : w + 0.05), y0 + h * 0.8, oz + (nz ? 0.04 : w + 0.05)));
    }
  };
  const a1 = 0.85 * s, y1 = g1 - 0.6 * s;
  storey(a1, y1, 1.6 * s);
  bag.add(SH, pyr(cx, cz, a1 + 0.35 * s, y1 + 1.6 * s, a1 * 0.7, y1 + 2.1 * s));
  const a2 = 0.62 * s, y2 = y1 + 1.95 * s;
  storey(a2, y2, 1.2 * s);
  bag.add(SH, pyr(cx, cz, a2 + 0.4 * s, y2 + 1.2 * s, 0.4 * s, y2 + 2.4 * s));
  bag.add(W, box(cx - 0.36 * s, y2 + 2.3 * s, cz - 0.36 * s, cx + 0.36 * s, y2 + 2.9 * s, cz + 0.36 * s));
  bag.add(SH, pyr(cx, cz, 0.52 * s, y2 + 2.9 * s, 0, y2 + 8 * s));
  bag.add('iron', box(cx - 0.035, y2 + 7.8 * s, cz - 0.035, cx + 0.035, y2 + 8.9 * s, cz + 0.035));
  bag.add('iron', box(cx - 0.02, y2 + 8.45 * s, cz - 0.03, cx + 0.42 * s, y2 + 8.7 * s, cz + 0.03));   // the vane
}
/** The crucifix on the rood beam at (x, y, z), facing west (−x): the cross with its round-ended arms and the figure of Christ, the arms outstretched. */
function crucifix(bag, x, y, z) {
  const H = 1.7, A = 0.62, w = 0.09, cy = y + H * 0.72;
  bag.add(W, box(x - 0.04, y, z - w / 2, x + 0.04, y + H, z + w / 2));
  bag.add(W, box(x - 0.04, cy - w / 2, z - A, x + 0.04, cy + w / 2, z + A));
  for (const [zz, yy] of [[z - A, cy], [z + A, cy], [z, y + H]]) bag.add(W, logRod([x - 0.045, yy, zz], [x + 0.045, yy, zz], 0.08, 10));
  const fx = x - 0.07, M = 'wood_painted';
  bag.add(M, lathe([[0.001, 0], [0.04, 0.02], [0.055, 0.3], [0.09, 0.52], [0.1, 0.7], [0.06, 0.78], [0.001, 0.8]], 8, null, fx, cy - 0.72, z));      // the body
  bag.add('linen', lathe([[0.075, 0], [0.11, 0.05], [0.1, 0.22], [0.07, 0.26], [0.001, 0.26]], 8, null, fx, cy - 0.4, z));                        // the loincloth
  bag.add(M, lathe([[0.001, 0], [0.06, 0.02], [0.075, 0.09], [0.06, 0.16], [0.001, 0.18]], 8, null, fx - 0.02, cy + 0.04, z));                        // the head
  bag.add('gilt_bronze', lathe([[0.075, 0], [0.085, 0.02], [0.085, 0.05], [0.075, 0.05], [0.001, 0.05]], 10, null, fx - 0.02, cy + 0.16, z));        // the crown (a king's crown on the Romanesque crucifix)
  for (const e of [-1, 1]) bag.add(M, beam([fx, cy - 0.02, z + e * 0.08], [fx, cy + 0.03, z + e * (A - 0.06)], 0.06, 0.05));
  for (const e of [-1, 1]) bag.add(M, beam([fx, cy - 0.7, z + e * 0.035], [fx, cy - 0.33, z + e * 0.06], 0.06, 0.06));
}
/**
 * bell_house: { c, y, s } — the free-standing stave bell tower (støpul) south of the church: its posts
 * on a sill frame over a rubble bed, enclosed by the steep shingled skirt; above it the belfry with
 * its round-headed sound openings, and the pyramid roof with a flared eave and a cross.
 */
function bellHouse(el, { bag, col }) {
  const [x, z] = el.c, y = el.y ?? 0, s = el.s ?? 4, h = s / 2;
  bag.add('rubble', box(x - h - 0.35, y - 0.6, z - h - 0.35, x + h + 0.35, y + 0.3, z + h + 0.35));
  bag.add(W, box(x - h - 0.15, y + 0.3, z - h - 0.15, x + h + 0.15, y + 0.55, z + h + 0.15));
  col.rect([x - h - 0.35, z - h - 0.35, x + h + 0.35, z + h + 0.35], y, y + 8);
  const a = h - 0.75;
  bag.add(SH, frustum([x - h - 0.1, z - h - 0.1, x + h + 0.1, z + h + 0.1], y + 0.55, y + 5.2, h + 0.1 - a, h + 0.1 - a, h + 0.1 - a, h + 0.1 - a));
  bag.add('opening', box(x - 0.45, y + 0.55, z + h - 0.02, x + 0.45, y + 2.3, z + h + 0.14));    // the low door in the skirt
  bag.add(W, box(x - 0.55, y + 2.3, z + h - 0.02, x + 0.55, y + 2.45, z + h + 0.2));
  bag.add(W, box(x - a, y + 5.2, z - a, x + a, y + 7.9, z + a));
  for (let k = -3; k <= 3; k++) for (const sz of [-1, 1]) { bag.add(W, box(x + k * a / 3.5 - 0.05, y + 5.2, z + sz * a - 0.04, x + k * a / 3.5 + 0.05, y + 7.9, z + sz * a + 0.04)); bag.add(W, box(x + sz * a - 0.04, y + 5.2, z + k * a / 3.5 - 0.05, x + sz * a + 0.04, y + 7.9, z + k * a / 3.5 + 0.05)); }
  // the sound openings: a board with two round-headed openings on each face, dark behind
  const so = new Shape(), L = 2 * a - 0.2, w = 0.32, H = 1.9;
  so.moveTo(0, 0); so.lineTo(L, 0); so.lineTo(L, H); so.lineTo(0, H); so.lineTo(0, 0);
  for (const uc of [L * 0.3, L * 0.7]) { const p = new Path(); p.moveTo(uc - w, 0.35); p.lineTo(uc + w, 0.35); p.lineTo(uc + w, 1.2); p.absarc(uc, 1.2, w, 0, Math.PI, false); p.lineTo(uc - w, 0.35); so.holes.push(p); }
  for (const [p0, p1, nx, nz] of [[[x - a + 0.1, z + a + 0.1], [x + a - 0.1, z + a + 0.1], 0, 1], [[x + a - 0.1, z - a - 0.1], [x - a + 0.1, z - a - 0.1], 0, -1], [[x + a + 0.1, z + a - 0.1], [x + a + 0.1, z - a + 0.1], 1, 0], [[x - a - 0.1, z - a + 0.1], [x - a - 0.1, z + a - 0.1], -1, 0]]) {
    bag.add(W, slab(so, 0.08, p0, p1, y + 5.6, 8));
    const e = a - 0.15, f = a + 0.03;
    bag.add('opening', nx ? box(x + nx * (a + 0.015) - 0.015, y + 5.9, z - e, x + nx * (a + 0.015) + 0.015, y + 7.4, z + e) : box(x - e, y + 5.9, z + nz * (a + 0.015) - 0.015, x + e, y + 7.4, z + nz * (a + 0.015) + 0.015));
  }
  bag.add(SH, pyr(x, z, a + 0.75, y + 7.75, a + 0.1, y + 8.25));
  bag.add(SH, pyr(x, z, a + 0.15, y + 8.2, 0, y + 12));
  cross(bag, x, y + 11.85, z, 0.7);
}
/** Round-log walls on rect from y to y + H: the courses of the long and the short walls half a log apart, crossing and standing out at the notched corners. */
function logWalls(bag, [x0, z0, x1, z1], y, H, d = 0.26, over = 0.3, hole = null) {
  const r = d * 0.54;
  // the logs' backs: solid, or (a house open inside) four walls a log thick, the door's gap cut through one
  if (!hole) bag.add(LOG, box(x0 + 0.03, y, z0 + 0.03, x1 - 0.03, y + H, z1 - 0.03));
  else {
    const t = r + 0.02, ex = hole.face[0] === 'x', lo = hole.c - hole.w / 2, hi = hole.c + hole.w / 2;
    const wallX = (xx, sg) => { const a = Math.min(xx, xx + sg * t), b = Math.max(xx, xx + sg * t);
      if (ex && hole.face === (sg > 0 ? 'x0' : 'x1')) { bag.add(LOG, box(a, y, z0 + 0.03, b, y + H, lo)); bag.add(LOG, box(a, y, hi, b, y + H, z1 - 0.03)); bag.add(LOG, box(a, y + hole.h, lo, b, y + H, hi)); }
      else bag.add(LOG, box(a, y, z0 + 0.03, b, y + H, z1 - 0.03)); };
    const wallZ = (zz, sg) => { const a = Math.min(zz, zz + sg * t), b = Math.max(zz, zz + sg * t);
      if (!ex && hole.face === (sg > 0 ? 'z0' : 'z1')) { bag.add(LOG, box(x0 + t + 0.03, y, a, lo, y + H, b)); bag.add(LOG, box(hi, y, a, x1 - t - 0.03, y + H, b)); bag.add(LOG, box(lo, y + hole.h, a, hi, y + H, b)); }
      else bag.add(LOG, box(x0 + t + 0.03, y, a, x1 - t - 0.03, y + H, b)); };
    wallX(x0 + 0.03, 1); wallX(x1 - 0.03, -1); wallZ(z0 + 0.03, 1); wallZ(z1 - 0.03, -1);
  }
  const split = (face, yy, a, b) => (hole && hole.face === face && yy - r < y + hole.h ? [[a, hole.c - hole.w / 2 - 0.12], [hole.c + hole.w / 2 + 0.12, b]] : [[a, b]]);
  for (let k = 0; y + k * d <= y + H - d * 0.4; k++) {
    for (const [xx, fc] of [[x0, 'x0'], [x1, 'x1']]) for (const [a, b] of split(fc, y + k * d, z0 - over, z1 + over)) bag.add(LOG, logRod([xx, y + k * d, a], [xx, y + k * d, b], r));
    const y2 = y + d / 2 + k * d;
    if (y2 <= y + H - d * 0.4) for (const [zz, fc] of [[z0, 'z0'], [z1, 'z1']]) for (const [a, b] of split(fc, y2, x0 - over, x1 + over)) bag.add(LOG, logRod([a, y2, zz], [b, y2, zz], r));
  }
}
/** The gable ends in logs above y over rect (ridge along x if alongX), each course shorter, under a roof of the given rise. */
function logGables(bag, [x0, z0, x1, z1], y, rise, alongX, d = 0.26) {
  const r = d * 0.54, span = alongX ? z1 - z0 : x1 - x0, m = alongX ? (z0 + z1) / 2 : (x0 + x1) / 2;
  for (let yy = y + d / 2; yy < y + rise - 0.3; yy += d) {
    const half = span / 2 * (1 - (yy + r - y) / rise) - 0.05;
    if (half < 0.25) break;
    for (const e of alongX ? [x0, x1] : [z0, z1]) bag.add(LOG, alongX ? logRod([e, yy, m - half], [e, yy, m + half], r) : logRod([m - half, yy, e], [m + half, yy, e], r));
  }
}
/** Barge boards (vindski) up the rakes of a gable at both ends, and on sod the eave logs (torvvol) that hold the turf. */
function roofTrim(bag, [x0, z0, x1, z1], y, pitch, o, alongX, sod) {
  const hh = alongX ? (z1 - z0) / 2 : (x1 - x0) / 2, yr = y + hh * pitch, ye = y - o * pitch;
  const lo = alongX ? z0 - o : x0 - o, hi = alongX ? z1 + o : x1 + o, m = (lo + hi) / 2;
  for (const e of alongX ? [x0 - o - 0.03, x1 + o + 0.03] : [z0 - o - 0.03, z1 + o + 0.03]) for (const [a, b] of [[lo, m + 0.12], [hi, m - 0.12]]) {
    const ya = ye, yb = yr + 0.12 * pitch, P = (u, v, w) => alongX ? [e + w, v, u] : [u, v, e + w];
    bag.add(W, hexa([P(a, ya - 0.24, -0.03), P(b, yb - 0.24, -0.03), P(b, yb + 0.07, -0.03), P(a, ya + 0.07, -0.03), P(a, ya - 0.24, 0.03), P(b, yb - 0.24, 0.03), P(b, yb + 0.07, 0.03), P(a, ya + 0.07, 0.03)]));
  }
  if (!sod) return;
  const L0 = alongX ? x0 - o : z0 - o, L1 = alongX ? x1 + o : z1 + o;
  for (const [ee, sg] of [[lo, 1], [hi, -1]]) {
    const c = ee + sg * 0.16, yy = ye + 0.16 * pitch + 0.08;
    bag.add(LOG, alongX ? logRod([L0, yy, c], [L1, yy, c], 0.08, 6) : logRod([c, yy, L0], [c, yy, L1], 0.08, 6));
  }
}
/** A plank door with its jambs and lintel on the face z = f (sg: the face's outward sign), centred at mx; w wide, h high, standing out by `out`. */
function door(bag, mx, f, sg, y, w, h, out, open = false) {
  const z = f + sg * out;
  if (!open) bag.add(W, box(mx - w / 2, y, Math.min(z, z + sg * 0.06), mx + w / 2, y + h, Math.max(z, z + sg * 0.06)));
  for (const sx of [-1, 1]) bag.add(W, box(mx + sx * (w / 2 + 0.06) - 0.06, y, Math.min(z, z + sg * 0.1), mx + sx * (w / 2 + 0.06) + 0.06, y + h + 0.14, Math.max(z, z + sg * 0.1)));
  bag.add(W, box(mx - w / 2 - 0.14, y + h, Math.min(z, z + sg * 0.1), mx + w / 2 + 0.14, y + h + 0.14, Math.max(z, z + sg * 0.1)));
}
/** log_house: { rect, y, foot, kind ('stue' | 'barn' | 'loft'), roof (material, optional), seed } — round-log walls notched at the corners; sod roofs on dwellings, shingles or boards on the rest; the loft on posts. */
function logHouse(el, ctx) {
  const { bag, col } = ctx;
  if (el.kind === 'shed') return FARM.elements.shed(el, ctx);
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, foot = el.foot ?? y - 0.4, rand = rng(el.seed || 1), kind = el.kind ?? 'stue', d = 0.26, r = d * 0.54;
  if (kind === 'loft') {
    // the loft: a two-storey storehouse lifted on posts over stones; the upper storey overhangs on
    // corbelled logs, with its svalgang (gallery) on the front and the stair up to it outside
    const lx0 = x0 + 0.35, lz0 = z0 + 0.35, lx1 = x1 - 0.35, lz1 = z1 - 0.35, yb = y + 0.9;
    for (const [px, pz] of [[lx0 + 0.2, lz0 + 0.2], [lx1 - 0.2, lz0 + 0.2], [lx0 + 0.2, lz1 - 0.2], [lx1 - 0.2, lz1 - 0.2]]) {
      bag.add('rubble', box(px - 0.32, foot, pz - 0.32, px + 0.32, y + 0.2, pz + 0.32));
      bag.add(LOG, box(px - 0.16, y + 0.2, pz - 0.16, px + 0.16, yb - 0.08, pz + 0.16));
      bag.add(W, box(px - 0.26, yb - 0.08, pz - 0.26, px + 0.26, yb, pz + 0.26));    // the flat cap that turns the rats
    }
    col.rect([lx0, lz0, lx1, lz1], foot, yb + 1.85);
    logWalls(bag, [lx0, lz0, lx1, lz1], yb, 1.85, d, 0.22);
    door(bag, (lx0 + lx1) / 2 - 0.3, lz1, 1, yb, 0.7, 1.35, r + 0.01);
    // the corbels: the top logs of the lower storey reaching out under the overhang and the gallery
    const yc = yb + 1.85, ux0 = x0 - 0.1, ux1 = x1 + 0.1, uz0 = z0 - 0.1, uz1 = z1 + 0.1, gz = uz1 + 0.95;
    for (const xx of [lx0, lx1]) bag.add(LOG, logRod([xx, yc, lz0 - 0.5], [xx, yc, gz + 0.1], r));
    bag.add(W, box(ux0, yc + r - 0.02, uz0, ux1, yc + r + 0.08, uz1));                  // the floor of the upper storey
    bag.add(W, box(ux0, yc + r - 0.02, uz1, ux1 + 0.9, yc + r + 0.08, gz));            // and of the gallery, with the stair's landing at its end
    bag.add(LOG, box(ux1 + 0.72, foot, gz - 0.24, ux1 + 0.88, yc + r - 0.02, gz - 0.08));
    const yu = yc + r + 0.08;
    const HU = 2.25, dc = (ux0 + ux1) / 2, hole = { face: 'z1', c: dc, w: 0.9, h: 1.85 };
    logWalls(bag, [ux0, uz0, ux1, uz1], yu, HU, d, 0.25, hole);
    { const t = r + 0.05, zz = uz1 - t / 2, lo = dc - 0.45, hi = dc + 0.45;
      col.segment([ux0, uz0 + t / 2], [ux1, uz0 + t / 2], t, yu, yu + HU); col.segment([ux0 + t / 2, uz0], [ux0 + t / 2, uz1], t, yu, yu + HU); col.segment([ux1 - t / 2, uz0], [ux1 - t / 2, uz1], t, yu, yu + HU);
      col.segment([ux0, zz], [lo, zz], t, yu, yu + HU); col.segment([hi, zz], [ux1, zz], t, yu, yu + HU); col.segment([lo, zz], [hi, zz], t, yu + 1.9, yu + HU);
      col.floor([ux0, uz1, ux1 + 0.9, gz], yu); col.segment([ux0, gz - 0.04], [ux1 + 0.9, gz - 0.04], 0.1, yu, yu + 1.2); col.segment([ux1 + 0.86, uz1], [ux1 + 0.86, gz], 0.1, yu, yu + 1.2);
      col.ramp([ux1 + 0.15, z0 - 0.6, ux1 + 0.85, uz1], foot + 0.45, yu, 's'); }
    FARM.interiors.loft(bag, col, { rect: [ux0, uz0, ux1, uz1], fl: yu + 0.06, top: yu + HU, ridge: yu + HU + 0.5, alongX: true, wt: r + 0.05, door: hole, seed: el.seed });
    // the gallery: a plank parapet with a row of little arched openings, posts up to the roof
    const gy = yu + 0.85;
    bag.add(W, box(ux0, yu, gz - 0.08, ux1 + 0.9, gy, gz));
    bag.add(W, box(ux1 + 0.82, yu, uz1 + 0.15, ux1 + 0.9, gy, gz));
    bag.add(W, slab(arcadeShape(ux1 - ux0, 0.32, 5, 0.05), 0.06, [ux0, gz - 0.04], [ux1, gz - 0.04], gy + 0.35, 6));
    for (let k = 0; k <= 5; k++) { const px = ux0 + k * (ux1 - ux0) / 5; bag.add(W, box(px - 0.05, gy, gz - 0.09, px + 0.05, gy + 0.35, gz + 0.01)); }
    bag.add(W, box(ux0, gy + 0.67, gz - 0.1, ux1, yu + HU, gz + 0.02));
    door(bag, dc, uz1, 1, yu + 0.02, 0.9, 1.85, r + 0.01, true);
    bag.add(W, box(dc + 0.45 - 0.03, yu + 0.04, uz1 + 0.12, dc + 0.45 + 0.03, yu + 1.85, uz1 + 0.12 + 0.82));
    // the stair up the side to the gallery's end
    const sx0 = ux1 + 0.15, sx1 = ux1 + 0.85, steps = 11, sz0 = z0 - 0.6;
    for (let k = 0; k < steps; k++) { const t = (k + 1) / steps, zz = sz0 + (uz1 - sz0) * (k / steps); bag.add(W, box(sx0, foot + (yu - foot) * t - 0.06, zz, sx1, foot + (yu - foot) * t, zz + (uz1 - sz0) / steps + 0.04)); }
    for (const sx of [sx0 - 0.08, sx1]) bag.add(W, hexa([[sx, foot, sz0], [sx + 0.08, foot, sz0], [sx + 0.08, yu - 0.3, uz1], [sx, yu - 0.3, uz1], [sx, foot + 0.3, sz0], [sx + 0.08, foot + 0.3, sz0], [sx + 0.08, yu + 0.04, uz1], [sx, yu + 0.04, uz1]]));
    const rr = [ux0, uz0, ux1, gz], ry = yu + HU;
    pitched(bag, SH, W, rr, ry, 0.95, 0.35, true);
    roofTrim(bag, rr, ry, 0.95, 0.35, true, false);
    return;
  }
  const H = kind === 'barn' ? 3.9 : 3.1;
  bag.add('rubble', box(x0 - 0.15, foot, z0 - 0.15, x1 + 0.15, y + 0.15, z1 + 0.15));
  const alongX = x1 - x0 >= z1 - z0, front0 = rand() < 0.5, front = el.front ?? front0, open = (kind === 'stue' || kind === 'barn' || kind === 'smithy') && !!el.open;
  const dw = kind === 'barn' ? 2.2 : 0.85, dh = kind === 'barn' ? 2.3 : 1.7, dm = kind === 'stue' || kind === 'smithy' ? -0.8 : 0;
  const hole = open ? (alongX ? { face: front ? 'z0' : 'z1', c: (x0 + x1) / 2 + dm, w: dw, h: dh + 0.12 - r } : { face: front ? 'x0' : 'x1', c: (z0 + z1) / 2, w: dw, h: dh + 0.12 - r }) : null;
  logWalls(bag, el.rect, y + 0.15 + r, H - r, d, 0.3, hole);
  if (!open) col.rect(el.rect, foot, y + H);
  else {
    col.rect(el.rect, foot, y + 0.15);
    const t = r + 0.05, lo = hole.c - hole.w / 2, hi = hole.c + hole.w / 2;
    for (const [fc, seg] of [['z0', [[x0, z0 + t / 2], [x1, z0 + t / 2]]], ['z1', [[x0, z1 - t / 2], [x1, z1 - t / 2]]], ['x0', [[x0 + t / 2, z0], [x0 + t / 2, z1]]], ['x1', [[x1 - t / 2, z0], [x1 - t / 2, z1]]]]) {
      if (fc !== hole.face) { col.segment(seg[0], seg[1], t, y + 0.15, y + H); continue; }
      const ex = fc[0] === 'x', [p, q] = seg, at = (u) => (ex ? [p[0], u] : [u, p[1]]), u0 = ex ? z0 : x0, u1 = ex ? z1 : x1;
      col.segment(at(u0), at(lo), t, y + 0.15, y + H); col.segment(at(hi), at(u1), t, y + 0.15, y + H); col.segment(at(lo), at(hi), t, y + 0.15 + r + hole.h, y + H);
    }
  }
  // the door (and the stue's small window) in a long wall; a barn's wide double doors
  if (alongX) {
    const f = front ? z0 : z1, sg = front ? -1 : 1, mx = (x0 + x1) / 2 + (dm);
    door(bag, mx, f, sg, y + 0.15, kind === 'barn' ? 2.2 : 0.85, kind === 'barn' ? 2.3 : 1.7, r + 0.01, open);
    if (open && kind !== 'barn') { const zi = f - sg * (r + 0.03); bag.add(W, box(mx + 0.425 - 0.05, y + 0.19, Math.min(zi, zi - sg * 0.8), mx + 0.425, y + 1.82, Math.max(zi, zi - sg * 0.8))); }
    if (open && kind === 'barn') for (const e of [-1, 1]) { const zo = f + sg * (r + 0.06); bag.add(W, box(mx + e * 1.1 - 0.04, y + 0.2, Math.min(zo, zo + sg * 1.05), mx + e * 1.1 + 0.04, y + 2.3, Math.max(zo, zo + sg * 1.05))); }
    if (kind === 'stue' || kind === 'smithy') { const wx = mx + 1.7, z = f + sg * (r + 0.01); bag.add('opening', box(wx - 0.3, y + 1.4, Math.min(z, z + sg * 0.03), wx + 0.3, y + 1.85, Math.max(z, z + sg * 0.03))); for (const [a, b, c, e] of [[-0.38, -0.3, 1.32, 1.93], [0.3, 0.38, 1.32, 1.93], [-0.38, 0.38, 1.32, 1.4], [-0.38, 0.38, 1.85, 1.93]]) bag.add(W, box(wx + a, y + c, Math.min(z, z + sg * 0.06), wx + b, y + e, Math.max(z, z + sg * 0.06))); }
  } else {
    const f = front ? x0 : x1, sg = front ? -1 : 1, mz = (z0 + z1) / 2, X0 = f + sg * (r + 0.01), X1 = X0 + sg * 0.06;
    const w = kind === 'barn' ? 2.2 : 0.85, h = kind === 'barn' ? 2.3 : 1.7;
    if (!open) bag.add(W, box(Math.min(X0, X1), y + 0.15, mz - w / 2, Math.max(X0, X1), y + 0.15 + h, mz + w / 2));
    else { const xi = f - sg * (r + 0.03); if (kind !== 'barn') bag.add(W, box(Math.min(xi, xi - sg * 0.8), y + 0.19, mz + w / 2 - 0.05, Math.max(xi, xi - sg * 0.8), y + 1.82, mz + w / 2)); else for (const e of [-1, 1]) { const xo = f + sg * (r + 0.06); bag.add(W, box(Math.min(xo, xo + sg * 1.05), y + 0.2, mz + e * 1.1 - 0.04, Math.max(xo, xo + sg * 1.05), y + 2.3, mz + e * 1.1 + 0.04)); } for (const e of [-1, 1]) bag.add(W, box(Math.min(X0, X1 + sg * 0.04), y + 0.15, mz + e * (w / 2 + 0.06) - 0.06, Math.max(X0, X1 + sg * 0.04), y + 0.15 + h + 0.14, mz + e * (w / 2 + 0.06) + 0.06)); }
    bag.add(W, box(Math.min(X0, X1 + sg * 0.04), y + 0.15 + h, mz - w / 2 - 0.14, Math.max(X0, X1 + sg * 0.04), y + 0.29 + h, mz + w / 2 + 0.14));
  }
  const roof = el.roof ?? (kind === 'stue' || kind === 'smithy' ? 'sod' : rand() < 0.5 ? 'sod' : SH), pitch = kind === 'stue' || kind === 'smithy' ? 0.5 : 0.7, o = 0.45, yt = y + H + o * pitch;
  const span = alongX ? z1 - z0 : x1 - x0;
  const top = pitched(bag, roof, LOG, el.rect, yt, pitch, o, alongX, roof === 'sod' ? 0.28 : 0.16);
  logGables(bag, el.rect, y + H, span / 2 * pitch + o * pitch - 0.28, alongX, d);
  roofTrim(bag, el.rect, yt, pitch, o, alongX, roof === 'sod');
  // the stue's smoke-hole (ljore) on the ridge: a little boarded hood with its own roof — no chimney yet
  if (kind === 'stue' || kind === 'smithy') {
    const mx = (x0 + x1) / 2 - (alongX ? 0.6 : 0), mz = (z0 + z1) / 2 - (alongX ? 0 : 0.6);
    bag.add(W, box(mx - 0.35, top - 0.35, mz - 0.35, mx + 0.35, top + 0.35, mz + 0.35));
    bag.add('opening', box(mx - 0.25, top + 0.05, mz - 0.36, mx + 0.25, top + 0.3, mz + 0.36));
    pitched(bag, W, W, [mx - 0.35, mz - 0.35, mx + 0.35, mz + 0.35], top + 0.35, 0.8, 0.12, alongX, 0.05);
  }
  if (open) {
    const io = { rect: el.rect, fl: y + 0.17, top: y + H, ridge: top - (roof === 'sod' ? 0.28 : 0.16), alongX, wt: r + 0.05, door: hole, seed: el.seed };
    (kind === 'barn' ? FARM.interiors.barn : kind === 'smithy' ? FARM.interiors.smithy : stueInside)(bag, col, io);
    // the fire's light in the room: the hearth of the stue (in the middle of the floor), the forge of the smithy; the byre has a horn lantern on its beam
    if (ctx.lights && !el.simple) ctx.lights.push({ at: [(x0 + x1) / 2, y + 0.17 + (kind === 'barn' ? 1.7 : 1.0), (z0 + z1) / 2], color: kind === 'barn' ? '#ffd9a0' : '#ffb46b', intensity: kind === 'barn' ? 1.6 : kind === 'smithy' ? 3.2 : 2.8, distance: kind === 'barn' ? 6 : 8 });
  }
}
/** fence: { pts, y, h } — a fence of split staves along a polyline. */
function fence(el, { bag, col }) {
  const pts = el.pts, y = el.y ?? 0, h = el.h ?? 1.2;
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1], L = Math.hypot(bx - ax, bz - az), n = Math.ceil(L / 0.5);
    for (let k = 0; k < n; k++) { const t = (k + 0.5) / n, x = ax + (bx - ax) * t, z = az + (bz - az) * t; bag.add(W, box(x - 0.08, y - 0.3, z - 0.08, x + 0.08, y + h + (k % 2) * 0.15, z + 0.08)); }
    col.segment([ax, az], [bx, bz], 0.2, y, y + h);
  }
}
/**
 * stone_wall: { pts, y (number or fn of x, z), h, th, seed } — a dry-stone churchyard wall along a
 * polyline: a battered body of laid stones following the ground in short lengths, a row of larger
 * cover stones along its top, the odd stone fallen at its foot.
 */
function stoneWall(el, { bag, col }) {
  const pts = el.pts, h = el.h ?? 1.1, th = el.th ?? 0.85, yf = typeof el.y === 'function' ? el.y : () => el.y ?? 0, rand = rng(el.seed || 7);
  for (let i = 0; i + 1 < pts.length; i++) {
    const [ax, az] = pts[i], [bx, bz] = pts[i + 1], L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, n = Math.max(1, Math.round(L / 2.5));
    for (let k = 0; k < n; k++) {
      const u0 = k * L / n, u1 = (k + 1) * L / n, p = [ax + ux * u0, az + uz * u0], q = [ax + ux * u1, az + uz * u1];
      const yy = Math.min(yf(...p), yf(...q)), y1 = Math.max(yf(...p), yf(...q)) + h;
      // the body: wider at the foot than at the top (each length carried a little past the next, so the corners close)
      const ext = k === 0 || k === n - 1 ? th / 2 : 0.02, P = (u, w, yv) => [ax + ux * u - uz * w, yv, az + uz * u + ux * w];
      const e0 = u0 - (k === 0 ? ext : 0.02), e1 = u1 + (k === n - 1 ? ext : 0.02), tb = th / 2, tt = th / 2 - 0.12;
      bag.add('schist_rubble', hexa([P(e0, -tb, yy - 0.3), P(e1, -tb, yy - 0.3), P(e1, tb, yy - 0.3), P(e0, tb, yy - 0.3), P(e0, -tt, y1 - 0.12), P(e1, -tt, y1 - 0.12), P(e1, tt, y1 - 0.12), P(e0, tt, y1 - 0.12)]));
      col.segment(p, q, th, yy - 0.3, y1);
      // the cover stones: flat slabs of uneven length along the top
      for (let u = e0; u < e1 - 0.15;) {
        const l = Math.min(e1 - u, 0.45 + rand() * 0.5), w = tt + 0.04 + rand() * 0.06, hh = 0.1 + rand() * 0.06, tilt = (rand() - 0.5) * 0.03;
        bag.add('rubble', hexa([P(u + 0.02, -w, y1 - 0.13), P(u + l - 0.02, -w, y1 - 0.13), P(u + l - 0.02, w, y1 - 0.13), P(u + 0.02, w, y1 - 0.13), P(u + 0.04, -w + 0.03, y1 - 0.13 + hh + tilt), P(u + l - 0.04, -w + 0.03, y1 - 0.13 + hh - tilt), P(u + l - 0.04, w - 0.03, y1 - 0.13 + hh - tilt), P(u + 0.04, w - 0.03, y1 - 0.13 + hh + tilt)]));
        u += l;
      }
      if (rand() < 0.25) { const u = u0 + rand() * (u1 - u0), sd = rand() < 0.5 ? -1 : 1, r = 0.14 + rand() * 0.1, pp = P(u, sd * (tb + 0.25), 0), c = [pp[0], yf(pp[0], pp[2]), pp[2]]; bag.add('rubble', lathe([[r, 0], [r * 1.05, r * 0.5], [r * 0.6, r * 1.1], [0.001, r * 1.2]], 6, null, c[0], c[1] - 0.12, c[2])); }
    }
  }
}
/**
 * lychgate: { c, y, w, d, s (rotation: 'ns' passes north–south) } — the roofed gate into the churchyard: four
 * staves on a sill frame over stones, benches along its sides, a gabled shingle roof with barge
 * boards and a cross over the way in, the two plank leaves of the gate standing open.
 */
function lychgate(el, { bag, col }) {
  const [x, z] = el.c, y = el.y ?? 0, w = el.w ?? 3.2, d = el.d ?? 2.6, hw = w / 2, hd = d / 2, H = 2.35;
  bag.add('rubble', box(x - hw - 0.15, y - 0.4, z - hd - 0.1, x - hw + 0.25, y + 0.12, z + hd + 0.1));
  bag.add('rubble', box(x + hw - 0.25, y - 0.4, z - hd - 0.1, x + hw + 0.15, y + 0.12, z + hd + 0.1));
  for (const sx of [-1, 1]) {
    const xx = x + sx * (hw - 0.05);
    bag.add(W, box(xx - 0.1, y + 0.12, z - hd, xx + 0.1, y + 0.3, z + hd));              // the sill
    for (const sz of [-1, 1]) { bag.add(W, lathe([[0.13, 0], [0.13, H - 0.3], [0.001, H - 0.3]], 10, null, xx, y + 0.3, z + sz * (hd - 0.15))); col.circle(xx, z + sz * (hd - 0.15), 0.13, y, y + H); }
    bag.add(W, box(xx - 0.1, y + H - 0.2, z - hd - 0.1, xx + 0.1, y + H, z + hd + 0.1));   // the wall plate
    // the side: boards up to the bench's back, a knee brace at each post's head
    bag.add(W, box(xx - 0.04, y + 0.3, z - hd + 0.28, xx + 0.04, y + 1.05, z + hd - 0.28));
    bag.add(W, box(xx - sx * 0.04 - 0.2, y + 0.45, z - hd + 0.28, xx - sx * 0.04 + 0.2, y + 0.5, z + hd - 0.28).translate(-sx * 0.16, 0, 0));
    for (const sz of [-1, 1]) bag.add(W, beam([xx, y + H - 0.75, z + sz * (hd - 0.15)], [xx, y + H - 0.2, z + sz * (hd - 0.7)], 0.1, 0.12));
    col.segment([xx - sx * 0.2, z - hd + 0.28], [xx - sx * 0.2, z + hd - 0.28], 0.5, y, y + 0.5);
  }
  for (const sz of [-1, 1]) bag.add(W, box(x - hw, y + H - 0.2, z + sz * (hd - 0.15) - 0.09, x + hw, y + H, z + sz * (hd - 0.15) + 0.09));   // the tie beams over the way
  const top = pitched(bag, SH, W, [x - hw - 0.1, z - hd - 0.1, x + hw + 0.1, z + hd + 0.1], y + H, 1.05, 0.35, false);
  bag.add(W, box(x - hw + 0.12, y + H - 0.03, z - hd - 0.05, x + hw - 0.12, y + H, z + hd + 0.05));                                       // the boarded ceiling
  roofTrim(bag, [x - hw - 0.1, z - hd - 0.1, x + hw + 0.1, z + hd + 0.1], y + H, 1.05, 0.35, false, false);
  cross(bag, x, top - 0.1, z + hd + 0.5, 0.75);
  // the gate's two leaves on the inner (north) posts, standing open against the sides
  for (const sx of [-1, 1]) {
    const xx = x + sx * (hw - 0.5), z0 = z - hd + 0.3;
    bag.add(W, box(xx - 0.03, y + 0.15, z0, xx + 0.03, y + 1.25, z0 + hw - 0.35));
    for (const yy of [y + 0.3, y + 1.05]) bag.add(W, box(xx - sx * 0.03 - 0.03, yy, z0, xx - sx * 0.03 + 0.03, yy + 0.1, z0 + hw - 0.35));
  }
}
const FARM = makeFarm({ hexa, logRod });
const SHORE = makeShore({ hexa, logRod, beam, pitched, logWalls, logGables, roofTrim, door });
registerStyle('norse', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, stave_church: staveChurch, bell_house: bellHouse, log_house: logHouse, fence, stone_wall: stoneWall, lychgate, ...FARM.elements, ...SHORE },
  objects: {},
});
