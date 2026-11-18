// Notre-Dame de Paris as it stood about 1248 (docs/settlements/paris.md §1a): the west front of
// three portals, the Gallery of Kings, the rose and the great gallery, the twin towers with their
// belfry bays; the nave and choir under a steep lead roof with the enlarged clerestory of two
// lancets and an oculus, the tribunes, the outer aisles and the new chapels between the uprights
// of the flying buttresses; the transept with its roses; the apse; the timber and lead spire over
// the crossing; gargoyles. Registered into the `gothic` style as `notre_dame`.
//
// The element: { rect [x0, z0, x1, z1] (the west front at x0, about 128 × 48 m), y }.

import { STYLES } from '../../core/build.js';
import { box, frustum, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { planarWall, archHalf, archRise } from '../byzantine/index.js';
import './index.js';
import { archWall, pier, vault, rise, jube, stalls, altar, sideAltar } from './nd-interior.js';
import { Acc, statue, smallFigure, gargoyle as gargoyleBeast, hash3 } from './nd-sculpture.js';
import { portalRelief } from './nd-relief.js';

const L = 'limestone', CARVE = 'limestone_carved', LEAD = 'lead';
const D2R = Math.PI / 180;

// ── geometry helpers ───────────────────────────────────────────────────────────────────────────

/** A convex prism: a planar convex polygon (3D points) pushed along d. */
function prism(out, poly, d) {
  const n = poly.length, top = poly.map((p) => [p[0] + d[0], p[1] + d[1], p[2] + d[2]]), t = [];
  for (let i = 1; i < n - 1; i++) t.push(...poly[0], ...poly[i], ...poly[i + 1], ...top[0], ...top[i + 1], ...top[i]);
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; t.push(...poly[i], ...poly[j], ...top[j], ...poly[i], ...top[j], ...top[i]); }
  out.push(...orientOutward(t));
}
/** Convex hexahedron from 8 corners (bottom 4, top 4, same order). */
function hexa(out, b, t, caps = [true, true]) {
  const tris = [], q = (a, b2, c, d) => tris.push(...a, ...b2, ...c, ...a, ...c, ...d);
  q(b[0], b[1], b[2], b[3]); q(t[0], t[3], t[2], t[1]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; if (i % 2 === 1 || caps[i / 2]) q(b[i], t[i], t[j], b[j]); }
  out.push(...orientOutward(tris));
}
/** Bars along a polyline in a vertical plane { o [x, z], u [ux, uz] } — pts [[u, y] …], width w, depth d, offset off along the normal. */
function bars(out, o, u, pts, w, d, off = 0) {
  const n = [-u[1], u[0]];
  for (let k = 0; k < pts.length - 1; k++) {
    const [ua, ya] = pts[k], [ub, yb] = pts[k + 1];
    const tx = ub - ua, ty = yb - ya, Ln = Math.hypot(tx, ty) || 1, px = -ty / Ln * w / 2, py = tx / Ln * w / 2;
    const W = (uu, yy, s) => [o[0] + u[0] * uu + n[0] * (off + s), yy, o[1] + u[1] * uu + n[1] * (off + s)];
    hexa(out, [W(ua - px, ya - py, -d / 2), W(ua + px, ya + py, -d / 2), W(ub + px, yb + py, -d / 2), W(ub - px, yb - py, -d / 2)],
      [W(ua - px, ya - py, d / 2), W(ua + px, ya + py, d / 2), W(ub + px, yb + py, d / 2), W(ub - px, yb - py, d / 2)], [k === 0, k === pts.length - 2]);
  }
}
const ringPts = (uc, yc, r, n = 24, a0 = 0, a1 = 2 * Math.PI) => Array.from({ length: n + 1 }, (_, k) => { const a = a0 + (a1 - a0) * k / n; return [uc + r * Math.cos(a), yc + r * Math.sin(a)]; });
/** The two halves of a pointed arch of half-width r, springing at s (f: arc radius / span), as one polyline from left foot over the crown to the right foot. */
const pointedPts = (uc, r, s, f, n = 10) => {
  const a = { r, pointed: f }, H = archRise(a), side = (sg) => Array.from({ length: n + 1 }, (_, k) => { const dy = H * k / n; return [uc + sg * archHalf(a, dy), s + dy]; });
  return [...side(-1), ...side(1).reverse()];
};

// ── sculpture ──────────────────────────────────────────────────────────────────────────────────

/**
 * A standing figure in carved stone, h tall, its foot at (x, y, z): a robe falling in vertical
 * folds, the shoulders, the head; `crown` (the kings), `book`, `wings` (an angel: two blades
 * behind the shoulders, turned to face along f), `seat` (enthroned: the knees forward along f).
 */
function figureBase(bag, x, y, z, h, o = {}) {
  const rb = 0.13 * h, m = o.mat || CARVE, f = o.face || [-1, 0];
  const folds = (th, i) => (i > 0 && i < 4 ? 1 + 0.07 * Math.cos(9 * th) : 1);
  if (o.seat) {
    // enthroned: the throne behind, the lap and the knees forward, the robe falling to the feet
    const s = h * 0.62;
    bag.add(m, box(x - 0.2 * h * Math.abs(f[1]) - 0.16 * h * Math.abs(f[0]), y, z - 0.2 * h * Math.abs(f[0]) - 0.16 * h * Math.abs(f[1]), x + 0.2 * h * Math.abs(f[1]) + 0.16 * h * Math.abs(f[0]), y + s * 0.5, z + 0.2 * h * Math.abs(f[0]) + 0.16 * h * Math.abs(f[1])));
    bag.add(m, lathe([[rb * 1.25, 0], [rb * 1.2, 0.08 * h], [rb * 0.95, 0.34 * h], [rb * 0.85, 0.42 * h], [rb * 0.45, 0.47 * h], [0.001, 0.48 * h]], 10, folds, x + f[0] * 0.08 * h, y + s * 0.46, z + f[1] * 0.08 * h));
    bag.add(m, lathe([[rb * 1.05, 0], [rb * 1.2, s * 0.48], [0.001, s * 0.5]], 10, folds, x + f[0] * 0.14 * h, y, z + f[1] * 0.14 * h));
    bag.add(o.mat ? 'ivory' : m, lathe([[0.001, 0], [0.065 * h, 0.03 * h], [0.068 * h, 0.1 * h], [0.04 * h, 0.14 * h], [0.001, 0.145 * h]], 8, null, x + f[0] * 0.08 * h, y + s * 0.46 + 0.47 * h, z + f[1] * 0.08 * h));
    return;
  }
  bag.add(m, lathe([[rb * 1.08, 0], [rb, 0.06 * h], [rb * 0.86, 0.42 * h], [rb * 0.8, 0.62 * h], [rb * 0.92, 0.74 * h], [rb * 0.55, 0.81 * h], [0.001, 0.815 * h]], 10, folds, x, y, z));
  bag.add(o.mat ? 'ivory' : m, lathe([[0.001, 0], [0.05 * h, 0.02 * h], [0.058 * h, 0.08 * h], [0.045 * h, 0.13 * h], [0.001, 0.14 * h]], 8, null, x, y + 0.8 * h, z));
  if (o.crown) bag.add(o.crownMat || 'paint_ochre', lathe([[0.056 * h, 0], [0.06 * h, 0.05 * h], [0.045 * h, 0.05 * h], [0.045 * h, 0.01 * h]], 8, (th, i) => (i === 1 ? 1 + 0.25 * Math.max(0, Math.cos(4 * th)) : 1), x, y + 0.9 * h, z));
  if (o.book) bag.add(m, box(x + f[0] * rb - 0.05 * h, y + 0.5 * h, z + f[1] * rb - 0.05 * h, x + f[0] * rb + 0.05 * h, y + 0.6 * h, z + f[1] * rb + 0.05 * h));
  if (o.wings) {
    const sx = -f[1], sz = f[0], out = [];
    for (const s of [-1, 1]) {
      const base = [x - f[0] * rb * 0.5 + sx * s * rb * 0.5, y + 0.72 * h, z - f[1] * rb * 0.5 + sz * s * rb * 0.5];
      const tip = [base[0] + sx * s * 0.26 * h - f[0] * 0.06 * h, y + 0.98 * h, base[2] + sz * s * 0.26 * h - f[1] * 0.06 * h];
      const low = [base[0] + sx * s * 0.12 * h - f[0] * 0.05 * h, y + 0.3 * h, base[2] + sz * s * 0.12 * h - f[1] * 0.05 * h];
      prism(out, [base, tip, low], [-f[0] * 0.03 * h, 0, -f[1] * 0.03 * h]);
    }
    bag.add(m, fromTriangles(out));
  }
}

// ── the carved figure, version 2: a column-statue or relief figure with a draped robe, a mantle at the back,
// shoulders, two arms with hands (a book or a scroll), a head with brow, nose, hair and (for the old men) a
// beard; the seated ones on a throne with the knees forward. `lod` 1 (the small figures of the archivolts):
// the robe, the head, the nose only.
const _v = { sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]] };
const _norm = (a) => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
/** A tapered limb of square section from a to b (half-widths w0, w1). */
function limb(out, a, b, w0, w1) {
  const d = _norm(_v.sub(b, a)), ref = Math.abs(d[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0], u1 = _norm(_v.cross(d, ref)), u2 = _v.cross(d, u1);
  const ring = (p, w) => [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([s, t]) => [p[0] + (u1[0] * s + u2[0] * t) * w, p[1] + (u1[1] * s + u2[1] * t) * w, p[2] + (u1[2] * s + u2[2] * t) * w]);
  hexa(out, ring(a, w0), ring(b, w1));
}
function figureND(bag, x, y, z, h, o = {}) {
  const m = o.mat || CARVE, f = o.face || [-1, 0], sd = [-f[1], f[0]], lod = o.lod ?? (h < 0.9 ? 1 : 0);
  const P = (a, yy, b) => [x + f[0] * a + sd[0] * b, y + yy, z + f[1] * a + sd[1] * b];
  const hash = Math.abs(Math.floor(x * 12.9 + z * 78.2 + y * 37.7 + h * 91)), head = o.mat ? 'ivory' : m, hair = o.mat ? 'wood_dark' : m;
  const folds = (th, i) => (i > 0 && i < 6 ? 1 + 0.07 * Math.cos(7 * th + hash) + 0.035 * Math.cos(13 * th) : 1);
  const seg = lod ? 8 : 14;
  let shY;                                                   // the shoulder line
  if (o.seat) {
    const s = h * 0.62;
    bag.add(m, box(x - 0.2 * h * Math.abs(f[1]) - 0.16 * h * Math.abs(f[0]), y, z - 0.2 * h * Math.abs(f[0]) - 0.16 * h * Math.abs(f[1]), x + 0.2 * h * Math.abs(f[1]) + 0.16 * h * Math.abs(f[0]), y + s * 0.5, z + 0.2 * h * Math.abs(f[0]) + 0.16 * h * Math.abs(f[1])));
    const rb = 0.1 * h;
    bag.add(m, lathe([[rb * 1.3, 0], [rb * 1.2, 0.08 * h], [rb * 0.95, 0.34 * h], [rb * 0.85, 0.42 * h], [rb * 0.55, 0.46 * h], [0.001, 0.47 * h]], seg, folds, x + f[0] * 0.08 * h, y + s * 0.46, z + f[1] * 0.08 * h));
    bag.add(m, lathe([[rb * 1.0, 0], [rb * 1.25, s * 0.48], [0.001, s * 0.5]], seg, folds, x + f[0] * 0.15 * h, y, z + f[1] * 0.15 * h));
    // the knees: two rounded blocks under the lap, the robe's fall between them
    for (const sg of [-1, 1]) { const k0 = P(0.15 * h, s * 0.34, sg * 0.05 * h), k1 = P(0.24 * h, s * 0.12, sg * 0.05 * h); const t = []; limb(t, k0, k1, 0.045 * h, 0.04 * h); bag.add(m, fromTriangles(t)); }
    shY = y + s * 0.46 + 0.39 * h;
  } else {
    const rb = 0.1 * h;
    bag.add(m, lathe([[rb * 1.12, 0], [rb * 1.06, 0.05 * h], [rb * 0.9, 0.22 * h], [rb * 0.74, 0.46 * h], [rb * 0.86, 0.6 * h], [rb * 0.98, 0.7 * h], [rb * 0.78, 0.755 * h], [rb * 0.36, 0.795 * h], [0.001, 0.81 * h]], seg, folds, x, y, z));
    shY = y + 0.72 * h;
    if (o.wings) {
      const sx = -f[1], sz = f[0], out = [];
      for (const s of [-1, 1]) {
        const base = [x - f[0] * rb * 0.7 + sx * s * rb * 0.5, y + 0.72 * h, z - f[1] * rb * 0.7 + sz * s * rb * 0.5];
        const tip = [base[0] + sx * s * 0.28 * h - f[0] * 0.07 * h, y + 1.0 * h, base[2] + sz * s * 0.28 * h - f[1] * 0.07 * h];
        const mid = [base[0] + sx * s * 0.22 * h - f[0] * 0.05 * h, y + 0.62 * h, base[2] + sz * s * 0.22 * h - f[1] * 0.05 * h];
        const low = [base[0] + sx * s * 0.1 * h - f[0] * 0.05 * h, y + 0.28 * h, base[2] + sz * s * 0.1 * h - f[1] * 0.05 * h];
        prism(out, [base, tip, mid, low], [-f[0] * 0.025 * h, 0, -f[1] * 0.025 * h]);
      }
      bag.add(m, fromTriangles(out));
    }
  }
  // the head: a neck, the skull with a brow and a nose; hair over the crown and the nape
  const hy = shY + 0.08 * h, hc = P(o.seat ? 0.08 * h : 0, 0, 0), hx = hc[0], hz = hc[2];
  bag.add(head, lathe([[0.001, -0.02 * h], [0.034 * h, -0.02 * h], [0.034 * h, 0.012 * h], [0.05 * h, 0.03 * h], [0.058 * h, 0.075 * h], [0.05 * h, 0.125 * h], [0.001, 0.142 * h]], lod ? 6 : 10, null, hx, hy, hz));
  { const nb = P(0.054 * h + (o.seat ? 0.08 * h : 0), 0.06 * h, 0);
    const t = []; hexa(t, [[nb[0] - 0.008 * h, hy + 0.035 * h + 0.0, nb[2] - 0.008 * h], [nb[0] + 0.008 * h, hy + 0.035 * h, nb[2] - 0.008 * h], [nb[0] + 0.008 * h, hy + 0.035 * h, nb[2] + 0.008 * h], [nb[0] - 0.008 * h, hy + 0.035 * h, nb[2] + 0.008 * h]], [[nb[0] + f[0] * 0.016 * h - 0.004 * h, hy + 0.078 * h, nb[2] + f[1] * 0.016 * h - 0.004 * h], [nb[0] + f[0] * 0.016 * h + 0.004 * h, hy + 0.078 * h, nb[2] + f[1] * 0.016 * h - 0.004 * h], [nb[0] + f[0] * 0.016 * h + 0.004 * h, hy + 0.078 * h, nb[2] + f[1] * 0.016 * h + 0.004 * h], [nb[0] + f[0] * 0.016 * h - 0.004 * h, hy + 0.078 * h, nb[2] + f[1] * 0.016 * h + 0.004 * h]]);
    bag.add(head, fromTriangles(t)); }
  if (!lod) {
    bag.add(hair, lathe([[0.062 * h, 0], [0.066 * h, 0.055 * h], [0.052 * h, 0.115 * h], [0.001, 0.148 * h]], 10, (t, i) => (i === 0 ? 1 + 0.05 * Math.cos(5 * t) : 1), hx - f[0] * 0.01 * h, hy + 0.03 * h, hz - f[1] * 0.01 * h));
    if (!o.noBeard && (o.beard || hash % 3 !== 0)) { const t = [], c = P(0.045 * h + (o.seat ? 0.08 * h : 0), 0, 0), q = (a2, yy, b) => [c[0] + f[0] * a2 + sd[0] * b, hy + yy, c[2] + f[1] * a2 + sd[1] * b];
      hexa(t, [q(0.004 * h, -0.05 * h, -0.012 * h), q(0.004 * h, -0.05 * h, 0.012 * h), q(0.016 * h, -0.05 * h, 0.012 * h), q(0.016 * h, -0.05 * h, -0.012 * h)], [q(-0.012 * h, 0.045 * h, -0.04 * h), q(-0.012 * h, 0.045 * h, 0.04 * h), q(0.022 * h, 0.045 * h, 0.04 * h), q(0.022 * h, 0.045 * h, -0.04 * h)]);
      bag.add(hair, fromTriangles(t)); }
    // the mantle hanging from the shoulders at the back
    { const t = [], B = (a2, yy, b) => P(a2, yy - y, b);
      hexa(t, [B(-0.112 * h, y + 0.07 * h, -0.115 * h), B(-0.112 * h, y + 0.07 * h, 0.115 * h), B(-0.095 * h, y + 0.07 * h, 0.115 * h), B(-0.095 * h, y + 0.07 * h, -0.115 * h)], [B(-0.095 * h, shY - 0.01 * h, -0.095 * h), B(-0.095 * h, shY - 0.01 * h, 0.095 * h), B(-0.078 * h, shY - 0.01 * h, 0.095 * h), B(-0.078 * h, shY - 0.01 * h, -0.095 * h)]);
      bag.add(m, fromTriangles(t)); }
    // the arms: the right (sd +) bent up to hold the book against the chest, the left hanging to the folds of the robe (or both clasped)
    const arms = [], sh = (sg) => P(0, shY - y - 0.015 * h, sg * 0.1 * h);
    const hold = o.book || o.scroll || hash % 2 === 0;
    { const e = P(0.03 * h, shY - y - 0.16 * h, 0.115 * h), hnd = P(0.085 * h, shY - y - 0.13 * h, 0.04 * h); limb(arms, sh(1), e, 0.026 * h, 0.022 * h); limb(arms, e, hnd, 0.022 * h, 0.018 * h); limb(arms, [hnd[0] - 0.012 * h, hnd[1] - 0.012 * h, hnd[2]], [hnd[0] + 0.012 * h, hnd[1] + 0.012 * h, hnd[2]], 0.016 * h, 0.016 * h); }
    if (hold) { const e = P(0.025 * h, shY - y - 0.17 * h, -0.118 * h), hnd = P(0.03 * h, shY - y - 0.3 * h, -0.108 * h); limb(arms, sh(-1), e, 0.026 * h, 0.022 * h); limb(arms, e, hnd, 0.022 * h, 0.018 * h); }
    else { const e = P(0.04 * h, shY - y - 0.17 * h, -0.115 * h), hnd = P(0.09 * h, shY - y - 0.14 * h, -0.03 * h); limb(arms, sh(-1), e, 0.026 * h, 0.022 * h); limb(arms, e, hnd, 0.022 * h, 0.018 * h); }
    bag.add(m, fromTriangles(arms));
    if (o.book || o.scroll) { const t = [], c = P(0.1 * h, shY - y - 0.12 * h, 0.04 * h), q = (a2, yy, b) => [c[0] + f[0] * a2 + sd[0] * b, c[1] + yy, c[2] + f[1] * a2 + sd[1] * b];
      hexa(t, [q(-0.014 * h, -0.05 * h, -0.045 * h), q(-0.014 * h, -0.05 * h, 0.045 * h), q(0.014 * h, -0.05 * h, 0.045 * h), q(0.014 * h, -0.05 * h, -0.045 * h)], [q(-0.01 * h, 0.05 * h, -0.045 * h), q(-0.01 * h, 0.05 * h, 0.045 * h), q(0.014 * h, 0.05 * h, 0.045 * h), q(0.014 * h, 0.05 * h, -0.045 * h)]);
      bag.add(o.book ? 'paint_ochre' : m, fromTriangles(t)); }
    // the folds of the hem: two ridges of drapery down the front
    for (const b of [-0.035 * h, 0.04 * h]) { const t = [], a0 = P(0.085 * h, 0.04 * h, b), a1 = P(0.075 * h, 0.5 * h, b * 0.7); limb(t, a0, a1, 0.014 * h, 0.01 * h); if (!o.seat) bag.add(m, fromTriangles(t)); }
  }
  if (o.crown) bag.add(o.crownMat || 'paint_ochre', lathe([[0.058 * h, 0], [0.064 * h, 0.04 * h], [0.05 * h, 0.05 * h], [0.05 * h, 0.01 * h]], 8, (th, i) => (i === 1 ? 1 + 0.3 * Math.max(0, Math.cos(5 * th)) : 1), hx, hy + 0.1 * h, hz));
}

/** A crocketed pinnacle: a square shaft with a gablet on each face, a spirelet with crockets on its edges, a finial. */
function pinnacle(bag, x, y, z, w, h, m = L) {
  const s = w / 2, hs = h * 0.34, hg = h * 0.16, out = [];
  out.push(...box(x - s, y, z - s, x + s, y + hs, z + s).attributes.position.array);
  // the gablets: a triangle on each face, standing a little proud
  for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const ux = -dz, uz = dx, c = [x + dx * (s + 0.02), z + dz * (s + 0.02)];
    prism(out, [[c[0] - ux * s, y + hs, c[1] - uz * s], [c[0] + ux * s, y + hs, c[1] + uz * s], [c[0], y + hs + hg, c[1]]], [-dx * 0.12, 0, -dz * 0.12]);
  }
  bag.add(m, fromTriangles(out));
  bag.add(m, frustum([x - s * 0.92, z - s * 0.92, x + s * 0.92, z + s * 0.92], y + hs, y + h, s * 0.9, s * 0.9, s * 0.9, s * 0.9));
  // crockets up the four edges, a finial of four leaves
  const cr = [];
  for (let k = 1; k <= 3; k++) {
    const t = k / 4.2, yy = y + hs + (h - hs) * t, e = s * 0.92 * (1 - t * 0.98);
    for (const [ex, ez] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) cr.push(...box(x + ex * e - 0.07, yy, z + ez * e - 0.07, x + ex * e + 0.07, yy + 0.14, z + ez * e + 0.07).attributes.position.array);
  }
  cr.push(...box(x - 0.16, y + h - 0.05, z - 0.04, x + 0.16, y + h + 0.06, z + 0.04).attributes.position.array, ...box(x - 0.04, y + h - 0.05, z - 0.16, x + 0.04, y + h + 0.06, z + 0.16).attributes.position.array);
  bag.add(m, fromTriangles(cr));
  bag.add(m, lathe([[0.06, 0], [0.09, 0.2], [0.001, 0.42]], 6, null, x, y + h + 0.06, z));
}

/** A gargoyle: a crouching beast run out from the wall along d (horizontal unit vector), its jaws open to spout the rain (nd-sculpture.js). */
function gargoyle(bag, x, y, z, d, len = 1.6, full = false) { const a = new Acc(); gargoyleBeast(a, CARVE, x, y, z, d, len, full); a.flush(bag); }

// ── windows, rose ─────────────────────────────────────────────────────────────────────────────

/** A window in a wall plane via the style's gothic_window: { o, u, uc, w, sill, spring, lancets, inSide }. */
const win = (ctx, o, u, uc, w, sill, spring, lancets, inSide, f = 0.75) => STYLES.gothic.elements.gothic_window({ o, u, uc, w, sill, spring, lancets, inSide, f }, ctx);

/**
 * The west rose (about 1225; 9.6 m): glass in two layers; a central oculus, twelve spokes to a
 * ring, twenty-four colonnettes to the rim, each pair of them under a little pointed arch; the
 * moulded rim. In the plane { o, u } at (uc, yc), radius r.
 */
function roseND(bag, o, u, uc, yc, r, inSide, depth = 0.42) {
  const n = [-u[1], u[0]];
  const disc = (off, mat) => {
    const tris = [], N = 48, W = (uu, yy) => [o[0] + u[0] * uu + n[0] * off, yy, o[1] + u[1] * uu + n[1] * off];
    for (let k = 0; k < N; k++) { const a = 2 * Math.PI * k / N, b = 2 * Math.PI * (k + 1) / N; tris.push(...W(uc, yc), ...W(uc + r * Math.cos(a), yc + r * Math.sin(a)), ...W(uc + r * Math.cos(b), yc + r * Math.sin(b))); tris.push(...W(uc, yc), ...W(uc + r * Math.cos(b), yc + r * Math.sin(b)), ...W(uc + r * Math.cos(a), yc + r * Math.sin(a))); }
    bag.add(mat, fromTriangles(tris));
  };
  disc(inSide * 0.03, 'stained_glass'); disc(-inSide * 0.03, 'glass_outer');
  const t = [], r0 = r * 0.2, r1 = r * 0.5;
  bars(t, o, u, ringPts(uc, yc, r, 40), 0.34, depth + 0.08);
  bars(t, o, u, ringPts(uc, yc, r1, 32), 0.2, depth);
  bars(t, o, u, ringPts(uc, yc, r0, 20), 0.2, depth);
  for (let k = 0; k < 12; k++) { const a = 2 * Math.PI * (k + 0.5) / 12; bars(t, o, u, [[uc + r0 * Math.cos(a), yc + r0 * Math.sin(a)], [uc + r1 * Math.cos(a), yc + r1 * Math.sin(a)]], 0.15, depth); }
  // the inner ring's twelve trefoil heads, between the spokes
  for (let k = 0; k < 12; k++) { const a0 = 2 * Math.PI * (k + 0.5) / 12, a1 = 2 * Math.PI * (k + 1.5) / 12, am = (a0 + a1) / 2; bars(t, o, u, ringPts(uc + Math.cos(am) * r1 * 0.78, yc + Math.sin(am) * r1 * 0.78, r1 * 0.17, 10, am - Math.PI * 0.75, am + Math.PI * 0.75), 0.09, depth * 0.8); }
  // the outer zone: twenty-four colonnettes, the arches over them, a ring of small oculi under the rim
  for (let k = 0; k < 24; k++) { const a = 2 * Math.PI * (k + 0.25) / 24; bars(t, o, u, [[uc + r1 * Math.cos(a), yc + r1 * Math.sin(a)], [uc + r * 0.84 * Math.cos(a), yc + r * 0.84 * Math.sin(a)]], 0.11, depth * 0.9); }
  for (let k = 0; k < 24; k++) {
    const a0 = 2 * Math.PI * (k + 0.25) / 24, a1 = 2 * Math.PI * (k + 1.25) / 24, am = (a0 + a1) / 2, rr = r * 0.84;
    const A = [uc + rr * Math.cos(a0), yc + rr * Math.sin(a0)], B = [uc + rr * Math.cos(a1), yc + rr * Math.sin(a1)], C = [uc + r * 0.9 * Math.cos(am), yc + r * 0.9 * Math.sin(am)];
    bars(t, o, u, [A, [(A[0] + C[0]) / 2 + Math.cos(am) * 0.05, (A[1] + C[1]) / 2 + Math.sin(am) * 0.05], C, [(B[0] + C[0]) / 2 + Math.cos(am) * 0.05, (B[1] + C[1]) / 2 + Math.sin(am) * 0.05], B], 0.09, depth * 0.8);
    bars(t, o, u, ringPts(uc + r * 0.955 * Math.cos(am), yc + r * 0.955 * Math.sin(am), r * 0.035, 8), 0.06, depth * 0.7);
  }
  bag.add(L, fromTriangles(t));
}

// ── the portals ────────────────────────────────────────────────────────────────────────────────

/**
 * A portal of the west front, in the bay z0…z1 of a wall whose face is at x (the portal facing −x):
 * N orders stepping in and back from the outer arch (half-width W0) to the door, each a slice of the
 * wall with a pointed opening; on each step below the springing a column-statue on its corbel under a
 * canopy, on each step above it a file of small figures up the archivolt; the trumeau with its figure;
 * the lintels and the tympanum with their figures; the doors with their ironwork. The slices run back
 * to xBack, where the core of the front stands.
 */
const figure = figureND;
// the 13th-century portals were painted: the figures' robes in reds, blues, ochres and greens, the tympanum's ground blue
const PAINT = ['paint_robe', 'paint_blue', 'paint_ochre', 'cloth_red', 'paint_white', 'cloth_green'];
function portal(bag, col, p0) {
  const p = p0, acc = new Acc(), robeOf = (a, b) => PAINT[Math.floor(hash3(a, b, 77) * PAINT.length)];
  const ATTR = ['book', 'key', 'scroll', 'sword', 'book', 'staff', 'scroll', 'cross', 'book', 'palm', 'scroll', 'book'];
  const { x, z0, z1, y, W0, N, dw, dd, spring: S, xBack, top, f = 0.75 } = p;
  const zc = (z0 + z1) / 2, wN = W0 - N * dw, xEnd = x + N * dd;
  const o = [x, z0], u = [0, 1], uc = zc - z0;
  for (let k = 0; k < N; k++) {
    const r = W0 - k * dw;
    bag.add(L, planarWall({ o: [x + (k + 0.5) * dd, z0], u, th: dd, u0: 0, u1: z1 - z0, y0: y, y1: k === 0 ? y + top : y + S + archRise({ r: W0, pointed: f }) + 0.3, arches: [{ uc, r, spring: y + S, sill: y, pointed: f }] }));
  }
  // the back slice: the tympanum's field over the door
  const doorTop = y + p.door;
  bag.add('paint_blue', planarWall({ o: [(xEnd + xBack) / 2, z0], u, th: xBack - xEnd, u0: 0, u1: z1 - z0, y0: y, y1: y + top, holes: [{ u0: uc - wN, u1: uc + wN, y0: y, y1: doorTop }] }));
  // the socle: a moulded base and a shelf at the statues' feet along the steps
  for (const s of [-1, 1]) for (let k = 0; k < N; k++) {
    const za = zc + s * (W0 - k * dw), zb = zc + s * (W0 - (k + 1) * dw), xa = x + (k + 1) * dd;
    bag.add(L, box(xa - 0.12, y, Math.min(za, zb) - 0.0, xa + 0.02, y + 0.35, Math.max(za, zb) + 0.0));
    bag.add(L, box(xa - 0.16, y + p.base - 0.18, Math.min(za, zb), xa + 0.02, y + p.base, Math.max(za, zb)));
    // the colonnette in the corner of the step, the statue before it on its corbel, the canopy over its head
    const zcol = zc + s * (W0 - (k + 1) * dw);
    bag.add(L, lathe([[0.08, 0], [0.08, S - p.base]], 8, null, x + (k + 1) * dd - 0.02, y + p.base, zcol));
    const zs = zc + s * (W0 - (k + 0.5) * dw), xs = xa - 0.27, hS = p.statue;
    bag.add(L, lathe([[0.001, -0.22], [0.13, -0.22], [0.2, -0.13], [0.25, -0.04], [0.27, 0]], 8, null, xs, y + p.base + 0.26, zs));
    statue(acc, xs, y + p.base + 0.26, zs, hS, { mat: robeOf(xs, zs), attr: ATTR[(k * 2 + (s > 0 ? 1 : 0) + (p.scheme === 'anne' ? 5 : p.scheme === 'virgin' ? 3 : 0)) % 12], crown: p.crowns && k % 3 === 1, crownMat: 'paint_ochre', face: [-1, 0] });
    const cy = y + p.base + 0.26 + hS + 0.12;
    bag.add(L, box(xs - 0.26, cy, zs - 0.2, xs + 0.24, cy + 0.22, zs + 0.2));
    bag.add(L, frustum([xs - 0.26, zs - 0.2, xs + 0.24, zs + 0.2], cy + 0.22, cy + 0.62, 0.2, 0.2, 0.15, 0.15));
  }
  // the dado: a splayed course of ashlar along each jamb below the statues, carrying rows of quatrefoil medallions in relief
  // (the Last Judgement portal: fourteen a side, the Virtues in women with their emblems, the Vices opposite; the side portals one row of months and signs)
  for (const s of [-1, 1]) {
    const A = [x, zc + s * W0], B = [xEnd, zc + s * wN], Ln = Math.hypot(B[0] - A[0], B[1] - A[1]), u = [(B[0] - A[0]) / Ln, (B[1] - A[1]) / Ln];
    let nn = [-u[1], u[0]]; if (nn[1] * s > 0) nn = [-nn[0], -nn[1]];
    const yT = y + p.base - 0.2, ex = (q) => [A[0] + u[0] * q, A[1] + u[1] * q];
    const q0 = ex(0), q1 = ex(Ln), T = 0.07, G = (pt, yy, d) => [pt[0] + nn[0] * d, yy, pt[1] + nn[1] * d];
    const sl = []; hexa(sl, [G(q0, y, 0), G(q1, y, 0), G(q1, y, T), G(q0, y, T)], [G(q0, yT, 0), G(q1, yT, 0), G(q1, yT, T), G(q0, yT, T)]); bag.add(L, fromTriangles(sl));
    bag.add(L, box(Math.min(q0[0], q1[0]) - 0.01, yT - 0.01, Math.min(q0[1], q1[1]) - 0.01, Math.min(q0[0], q1[0]) + 0.01, yT, Math.min(q0[1], q1[1]) + 0.01));
    const [rows, per] = p.dado, rr = 0.21, rel = [], back = [];
    for (let r = 0; r < rows; r++) for (let i = 0; i < per; i++) {
      const uu = 0.28 + i * (Ln - 0.56) / (per - 1), yc = y + (rows === 2 ? 0.58 + r * 0.4 : 0.8), c = ex(uu);
      const ou = [c[0] + nn[0] * T, c[1] + nn[1] * T];
      // the quatrefoil: four lobes, their outer arcs
      for (let lb = 0; lb < 4; lb++) { const a = lb * Math.PI / 2 + Math.PI / 4; bars(rel, [ou[0], ou[1]], u, ringPts(Math.cos(a) * rr * 0.5, yc - y + y + Math.sin(a) * rr * 0.5, rr * 0.5, 6, a - Math.PI * 0.62, a + Math.PI * 0.62), 0.045, 0.06); }
      { const hh = rr * 0.68; hexa(back, [G(ex(uu - hh), yc - hh, T), G(ex(uu + hh), yc - hh, T), G(ex(uu + hh), yc - hh, T + 0.025), G(ex(uu - hh), yc - hh, T + 0.025)], [G(ex(uu - hh), yc + hh, T), G(ex(uu + hh), yc + hh, T), G(ex(uu + hh), yc + hh, T + 0.025), G(ex(uu - hh), yc + hh, T + 0.025)]); }
      figure(bag, ou[0] + nn[0] * 0.02, yc - 0.13, ou[1] + nn[1] * 0.02, 0.27, { face: nn, lod: 1 });
    }
    bag.add(CARVE, fromTriangles(rel)); bag.add('paint_blue', fromTriangles(back));
  }
  // the archivolts' figures: on each step above the springing, small seated figures one above another
  for (let k = 0; k < N; k++) {
    const rm = W0 - (k + 0.5) * dw, a = { r: rm, pointed: f }, H = archRise(a), xs = x + (k + 1) * dd - 0.12;
    const n = Math.max(3, Math.round((H * 1.25) / 0.66));
    for (const s of [-1, 1]) for (let i = 0; i < n; i++) {
      const dy = H * (i + 0.15) / (n + 0.2), zz = zc + s * archHalf(a, dy);
      if (dy > H - 0.45) continue;
      smallFigure(acc, xs, y + S + dy - 0.08, zz, 0.58, { mat: robeOf(xs + k, zz), seat: i % 2 === 1, face: [-1, 0], crown: p.crowns && i % 3 === 2 });
    }
  }
  // the trumeau, its figure, the doors with their iron hinges
  const xd = xBack - 0.22;
  bag.add(L, box(xEnd - 0.35, y, zc - 0.36, xBack, doorTop, zc + 0.36));
  bag.add(L, lathe([[0.001, -0.3], [0.24, -0.06], [0.3, 0]], 8, null, xEnd - 0.55, y + 1.6, zc));
  statue(acc, xEnd - 0.55, y + 1.6, zc, p.statue * 1.05, { mat: p.scheme === 'judgement' ? 'paint_white' : p.scheme === 'virgin' ? 'paint_blue' : 'paint_robe', attr: p.scheme === 'virgin' ? 'scepter' : 'book', crown: p.trumeauCrown !== false && p.scheme === 'virgin', beard: p.scheme !== 'virgin', long: true, hair: 'wood_dark', face: [-1, 0] });
  bag.add(L, box(xEnd - 0.84, y + 1.72 + p.statue * 1.05, zc - 0.3, xEnd - 0.28, y + 2.0 + p.statue * 1.05, zc + 0.3));
  // the two leaves stand open, turned in against the jambs of the passage (their iron scrolls on the
  // face that shuts outward, now turned to the passage)
  for (const s of [-1, 1]) {
    const lw = wN - 0.36, zh = zc + s * (wN - 0.06), zf = zc + s * (wN - 0.22), zl = Math.min(zh, zf), zm = Math.max(zh, zf), xh = xBack + 0.02;
    bag.add('wood_dark', box(xh, y + 0.01, zl, xh + lw, doorTop - 0.01, zm));
    const iron = [], zi = zc + s * (wN - 0.26);
    for (const hy of [0.18, 0.42, 0.66, 0.88]) {
      const yy = y + p.door * hy;
      iron.push(...box(xh + 0.1, yy - 0.05, Math.min(zi, zf), xh + lw - 0.1, yy + 0.05, Math.max(zi, zf)).attributes.position.array);
      for (let q = 1; q < 4; q++) { const xq = xh + lw * q / 4; bars(iron, [0, zf - s * 0.02], [1, 0], ringPts(xq, yy + 0.32, 0.28, 8, -Math.PI * 0.95, -Math.PI * 0.05), 0.04, 0.035); bars(iron, [0, zf - s * 0.02], [1, 0], ringPts(xq, yy - 0.32, 0.28, 8, Math.PI * 0.05, Math.PI * 0.95), 0.04, 0.035); }
    }
    bag.add('iron', fromTriangles(iron));
    col.rect([xh, zl, xh + lw, zm], y, doorTop);
  }
  // lintels and tympanum: the ledges, and the modelled relief of the registers (nd-relief.js)
  const tA = { r: wN, pointed: f }, TH = archRise(tA), ty = y + S;
  const band = (y0, y1) => { bag.add(L, box(xEnd - 0.3, y0, zc - wN, xEnd + 0.02, y0 + 0.14, zc + wN)); bag.add(L, box(xEnd - 0.32, y1 - 0.14, zc - wN, xEnd + 0.02, y1, zc + wN)); };
  const L1 = doorTop, L2 = doorTop + p.lintel, L3 = L2 + p.lintel * 1.15;
  band(L1, L2); band(L2, Math.min(L3, ty));
  portalRelief(acc, { X: xEnd, zc, wN, L1, lintel: p.lintel, ty, apex: ty + TH, scheme: p.scheme, arch: (dy) => archHalf(tA, dy) });
  acc.flush(bag);
  // the gable over the outer archivolt: a moulded raking edge on each side with crockets, a corbel under each foot, a ring of
  // tracery in the apex, pinnacles at the feet and a finial (inferred: the portals' gables as restored; they stood in 1248)
  { const crown = y + S + archRise({ r: W0, pointed: f }), yb = y + S + 0.6, ya = crown + (p.scheme === 'judgement' ? 2.7 : 2.9), hw = W0 + 0.1, gx = x - 0.17, gb = [], cr = [];
    bars(gb, [gx, zc], [0, 1], [[-hw, yb], [0, ya], [hw, yb]], 0.42, 0.3);
    bars(gb, [gx + 0.02, zc], [0, 1], [[-hw + 0.25, yb + 0.2], [0, ya - 0.5], [hw - 0.25, yb + 0.2]], 0.1, 0.34);
    const rl = Math.hypot(hw, ya - yb);
    for (const sg of [-1, 1]) {
      for (let k = 1; k <= 7; k++) { const t = k / 8.2, py = yb + (ya - yb) * t, pz = zc + sg * hw * (1 - t), nz = sg * (ya - yb) / rl, ny = hw / rl; cr.push(...box(gx - 0.13, py + ny * 0.3 - 0.11, pz + nz * 0.3 - 0.09, gx + 0.13, py + ny * 0.3 + 0.11, pz + nz * 0.3 + 0.09).attributes.position.array); }
      bag.add(L, box(gx - 0.2, yb - 0.7, zc + sg * hw - 0.26, gx + 0.2, yb - 0.05, zc + sg * hw + 0.26));
      pinnacle(bag, gx, yb - 0.05, zc + sg * hw, 0.46, 1.5);
    }
    const ring = ringPts(0, ya - 1.25, 0.55, 20); bars(gb, [gx + 0.02, zc], [0, 1], ring, 0.1, 0.18);
    for (let k = 0; k < 3; k++) { const a = Math.PI / 2 + k * 2 * Math.PI / 3; bars(gb, [gx + 0.02, zc], [0, 1], ringPts(Math.cos(a) * 0.24, ya - 1.25 + Math.sin(a) * 0.24, 0.2, 8), 0.06, 0.14); }
    bag.add(L, fromTriangles(gb)); bag.add(CARVE, fromTriangles(cr));
    pinnacle(bag, gx, ya - 0.2, zc, 0.5, 1.0);
  }
  // the jambs and the splays are solid, the trumeau stands in the middle; the door opens through
  col.rect([x, z0, xBack, zc - wN], y, y + top); col.rect([x, zc + wN, xBack, z1], y, y + top);
  col.rect([xEnd - 0.84, zc - 0.36, xBack, zc + 0.36], y, doorTop);
  col.rect([xEnd - 0.4, zc - wN, xBack, zc + wN], doorTop, y + top);
}

/** A floor of flags over the rect r, its top 2 cm over the ground at y. */
function floorPiece(bag, col, r, y) { bag.add('flagstone', box(r[0], y - 0.1, r[1], r[2], y + 0.02, r[3])); col.floor(r, y + 0.02); }

// ── the cathedral ─────────────────────────────────────────────────────────────────────────────

function notreDame(el, ctx) {
  const { bag, col } = ctx, [X0, Z0, X1, Z1] = el.rect, y = el.y ?? 0, cz = (Z0 + Z1) / 2;
  const Y = (v) => y + v;
  // plan (x from the west front, z from the axis)
  const XF = X0 + 1, XA = X0 + 4, XT = X0 + 13, ZF = 20.5;
  const BAY = 6.2, NB = 8, XTR0 = XT + NB * BAY, XTR1 = XTR0 + 14, CB = 6.4, NCB = 4, XAP = XTR1 + NCB * CB;
  const ZN = 7, ZT = 13, ZC = 21, ZU0 = 18.6, ZU1 = 23.6, ZCC = 17, ZUC0 = 16.6, ZUC1 = 21;   // walls; nave uprights; the choir's outer wall and uprights
  const EAVE = 34, RIDGE = 44.5, TRIB = 21.8, TRIBR = 23, CHAP = 11.5, CHAPR = 13.8;
  const Z = (v) => cz + v;
  const sc = new Acc();                                       // the statues of the west front, merged per material

  // ── the west front ──
  const BUT = [[-ZF, -17.6], [-7.4, -4.6], [4.6, 7.4], [17.6, ZF]];
  for (const [a, b] of BUT) {
    bag.add(L, box(X0 - 1.4, Y(-0.5), Z(a), XA + 0.01, Y(18.6), Z(b))); bag.add(L, box(XF, Y(18.5), Z(a), XA + 0.01, Y(19.45), Z(b))); col.rect([X0 - 1.4, Z(a), XA, Z(b)], y, Y(19));
    const w = [];
    hexa(w, [[X0 - 1.4, Y(18.6), Z(a)], [XF + 0.6, Y(18.6), Z(a)], [XF + 0.6, Y(18.6), Z(b)], [X0 - 1.4, Y(18.6), Z(b)]], [[XF + 0.5, Y(19.45), Z(a)], [XF + 0.6, Y(19.45), Z(a)], [XF + 0.6, Y(19.45), Z(b)], [XF + 0.5, Y(19.45), Z(b)]]);
    bag.add(L, fromTriangles(w));
    // a statue before the buttress on its corbel, under a gabled canopy (the four of the buttresses)
    const zm = Z((a + b) / 2);
    { const j = 0.0007 * (zm % 7); bag.add(L, lathe([[0.42 + j, 0], [0.4 + j, 0.2], [0.36 + j, 0.32], [0.36 + j, 2.7], [0.44 + j, 2.82], [0.46 + j, 3.0]], 10, null, X0 - 1.75, Y(0), zm)); }
    statue(sc, X0 - 1.75, Y(3.0), zm, 2.5, { mat: PAINT[Math.floor(hash3(zm, 3, 1) * PAINT.length)], attr: a < -10 ? 'sword' : a < 0 ? 'book' : a > 10 ? 'scepter' : 'palm', crown: a > 10, crownMat: 'paint_ochre', face: [-1, 0] });
    bag.add(L, box(X0 - 2.15, Y(5.7), zm - 0.45, X0 - 1.39, Y(5.95), zm + 0.45));
    const g = []; prism(g, [[X0 - 2.15, Y(5.95), zm - 0.45], [X0 - 2.15, Y(5.95), zm + 0.45], [X0 - 2.15, Y(6.9), zm]], [0.76, 0, 0]); bag.add(L, fromTriangles(g));
    // the blind arcade on the buttress's face above
    bag.add(L, planarWall({ o: [X0 - 1.5, Z(a)], u: [0, 1], th: 0.2, u0: 0.3, u1: b - a - 0.3, y0: Y(9), y1: Y(16.5), arches: [] }));
    const arc = []; bars(arc, [X0 - 1.62, Z(a)], [0, 1], pointedPts((b - a) / 2, (b - a) / 2 - 0.55, Y(13.8), 0.8), 0.16, 0.12); bag.add(L, fromTriangles(arc));
  }
  // the three portals: the Virgin (north, the left), the Last Judgement (centre), Saint Anne (south)
  const side = { W0: 4.0, N: 4, dw: 0.24, dd: 0.45, spring: 8.6, door: 5.6, lintel: 1.1, base: 1.6, statue: 2.4, top: 19.45, dado: [1, 6] };
  portal(bag, col, { ...side, x: XF, z0: Z(-17.6), z1: Z(-7.4), y, xBack: XA, scheme: 'virgin', crowns: true });
  portal(bag, col, { x: XF, z0: Z(-4.6), z1: Z(4.6), y, W0: 4.45, N: 6, dw: 0.24, dd: 0.42, spring: 9.5, door: 6.4, lintel: 1.15, base: 1.6, statue: 2.6, dado: [2, 7], top: 19.45, xBack: XA, scheme: 'judgement' });
  portal(bag, col, { ...side, x: XF, z0: Z(7.4), z1: Z(17.6), y, xBack: XA, scheme: 'anne', trumeauCrown: false });
  // behind the central portal, the west bay of the nave between the towers, open to its high vault
  // (the rose in its west wall); the transverse wall to the nave with the nave's arch in it
  const SP = 6.4, VS = 23.5, VC = 33.5, out0 = [];
  for (const s of [-1, 1]) bag.add(L, box(X0 + 2.3, Y(24.6), Z(Math.min(s * 5.4, s * 6)), XA, Y(36.8), Z(Math.max(s * 5.4, s * 6))));
  vault(bag, (u, v) => [XA + u * (XT - 0.6 - XA), Z(-6 + 12 * v)], { spring: Y(26), crown: Y(36.3), f: 0.5, nu: 10, nv: 12 });
  archWall(out0, (u, yy, d) => [XT - 0.6 + d, yy, Z(u)], { u0: -6, u1: 6, d0: 0, d1: 0.6, y0: Y(0), y1: Y(36.4), openings: [{ uc: 0, r: 5.6, sill: Y(0), spring: Y(VS), f: 0.97 }] });
  bag.add(L, fromTriangles(out0));
  floorPiece(bag, col, [XA, Z(-6), XT, Z(6)], y);

  // the Gallery of Kings: twenty-eight kings of Judah under an arcade, on a ledge some 20 m up
  const XK = XF + 0.6;
  bag.add(L, box(XK, Y(19.4), Z(-ZF), XA + 0.01, Y(24.6), Z(ZF)));
  bag.add(L, box(X0 - 0.2, Y(19.4), Z(-ZF - 0.2), XK + 0.01, Y(20.2), Z(ZF + 0.2)));
  const NK = 28, kw = 2 * ZF / NK;
  for (let i = 0; i < NK; i++) {
    const zz = Z(-ZF + (i + 0.5) * kw);
    statue(sc, XK - 0.42, Y(20.2), zz, 3.3, { mat: PAINT[Math.floor(hash3(zz, 20, 5) * PAINT.length)], lod: 1, crown: true, crownMat: 'paint_ochre', attr: i % 3 === 0 ? 'scepter' : i % 3 === 1 ? 'scroll' : 'palm', face: [-1, 0] });
  }
  sc.flush(bag);
  for (let i = 0; i <= NK; i++) { const zz = Z(-ZF + i * kw); bag.add(L, lathe([[0.11, 0], [0.1, 3.0], [0.16, 3.05], [0.16, 3.15]], 8, null, X0 + 0.95, Y(20.2), zz)); }
  bag.add(L, planarWall({ o: [X0 + 0.95, Z(-ZF)], u: [0, 1], th: 0.4, u0: 0, u1: 2 * ZF, y0: Y(23.35), y1: Y(24.45), arcade: true, noEnds: true,
    arches: Array.from({ length: NK }, (_, i) => ({ uc: (i + 0.5) * kw, r: kw / 2 - 0.1, spring: Y(23.35), sill: Y(23.35), pointed: 0.8 })) }));
  bag.add(L, box(X0 + 0.55, Y(24.4), Z(-ZF - 0.2), XK + 0.5, Y(24.65), Z(ZF + 0.2)));
  // the Virgin's gallery: an open balustrade of small trefoil arches before the rose
  bag.add(L, planarWall({ o: [X0 + 0.72, Z(-ZF)], u: [0, 1], th: 0.3, u0: 0, u1: 2 * ZF, y0: Y(24.65), y1: Y(25.85), arcade: true,
    arches: Array.from({ length: 52 }, (_, i) => ({ uc: (i + 0.5) * 2 * ZF / 52, r: ZF / 52 - 0.07, spring: Y(25.15), sill: Y(24.75), pointed: 0.85 })) }));
  bag.add(L, box(X0 + 0.52, Y(25.85), Z(-ZF), X0 + 0.92, Y(26.0), Z(ZF)));
  for (let i = 0; i <= 52; i++) bag.add(L, box(X0 + 0.64, Y(24.65), Z(-ZF + i * 2 * ZF / 52) - 0.04, X0 + 0.8, Y(25.15), Z(-ZF + i * 2 * ZF / 52) + 0.04));

  // the rose stage: the rose in the middle, in each tower a great window of two lancets and an oculus
  const XR = X0 + 2;                                                               // the wall's face
  const STRIP = [[-ZF, -18.2], [-7.0, -5.4], [5.4, 7.0], [18.2, ZF]];
  bag.add(L, planarWall({ o: [XR + 1, Z(-5.4)], u: [0, 1], th: 2, u0: 0, u1: 10.8, y0: Y(24.6), y1: Y(36.8), circles: [{ uc: 5.4, yc: Y(31.2), r: 4.8 }] }));
  roseND(bag, [XR + 0.6, cz], [0, 1], 0, Y(31.2), 4.8, -1);
  const rim = []; bars(rim, [XR - 0.05, cz], [0, 1], ringPts(0, Y(31.2), 5.0, 48), 0.42, 0.22); bars(rim, [XR - 0.1, cz], [0, 1], ringPts(0, Y(31.2), 5.32, 48), 0.18, 0.2); bag.add(L, fromTriangles(rim));
  for (const s of [-1, 1]) {
    const za = s < 0 ? -18.2 : 7.0, zb = s < 0 ? -7.0 : 18.2, uc = (zb - za) / 2;
    bag.add(L, planarWall({ o: [XR + 1, Z(za)], u: [0, 1], th: 2, u0: 0, u1: zb - za, y0: Y(24.6), y1: Y(36.8), arches: [{ uc, r: 3.2, spring: Y(31.8), sill: Y(26.2), pointed: 0.75 }] }));
    win(ctx, [XR + 0.7, Z(za)], [0, 1], uc, 6.4, Y(26.2), Y(31.8), 2, -1);
    // the archivolt round the window, in two orders
    const av = []; bars(av, [XR - 0.06, Z(za)], [0, 1], pointedPts(uc, 3.42, Y(31.8), 0.75, 12), 0.36, 0.2); bars(av, [XR - 0.12, Z(za)], [0, 1], pointedPts(uc, 3.78, Y(31.8), 0.75, 12), 0.2, 0.2); bag.add(L, fromTriangles(av));
  }
  // the buttress strips running up the front to the towers' tops, set back at each stage
  for (const [a, b] of STRIP) {
    bag.add(L, box(X0 + 1.0, Y(24.6), Z(a), XR + 0.3, Y(36.9), Z(b)));
    bag.add(L, box(X0 + 1.6, Y(36.9), Z(a), XR + 0.6, Y(43.4), Z(b)));
    bag.add(L, box(X0 + 2.2, Y(43.4), Z(a), X0 + 3.4, Y(55), Z(b)));
    bag.add(L, box(X0 + 2.6, Y(55), Z(a), X0 + 3.4, Y(67.3), Z(b)));
    const w = [];
    for (const [ya, xa, xb] of [[36.9, X0 + 1.0, X0 + 1.6], [43.4, X0 + 1.6, X0 + 2.2], [55, X0 + 2.2, X0 + 2.6]]) hexa(w, [[xa, Y(ya - 0.6), Z(a)], [xb, Y(ya - 0.6), Z(a)], [xb, Y(ya - 0.6), Z(b)], [xa, Y(ya - 0.6), Z(b)]], [[xb - 0.01, Y(ya), Z(a)], [xb, Y(ya), Z(a)], [xb, Y(ya), Z(b)], [xb - 0.01, Y(ya), Z(b)]]);
    bag.add(L, fromTriangles(w));
  }

  // the great gallery: a screen of tall slender arches on colonnettes, open to the sky between the towers
  bag.add(L, box(X0 + 1.2, Y(36.4), Z(-ZF), XT, Y(36.9), Z(ZF))); col.floor([X0 + 1.2, Z(-ZF), XT, Z(ZF)], Y(36.9));
  for (const [a, b] of [[-18.2, -7.0], [-5.4, 5.4], [7.0, 18.2]]) {
    const n = Math.round((b - a) / 1.0), st = (b - a) / n;
    bag.add(L, planarWall({ o: [X0 + 1.95, Z(a)], u: [0, 1], th: 0.45, u0: 0, u1: b - a, y0: Y(36.9), y1: Y(42.6), arcade: true, noEnds: true,
      arches: Array.from({ length: n }, (_, i) => ({ uc: (i + 0.5) * st, r: st / 2 - 0.11, spring: Y(40.9), sill: Y(36.9), pointed: 0.9 })) }));
    for (let i = 0; i <= n; i++) bag.add(L, lathe([[0.15, 0], [0.11, 0.25], [0.11, 3.7], [0.17, 3.85], [0.17, 4.0]], 8, null, X0 + 1.95, Y(36.9), Z(a + i * st)));
  }
  bag.add(L, box(X0 + 1.45, Y(42.6), Z(-ZF), X0 + 2.45, Y(43.0), Z(ZF)));
  bag.add(L, planarWall({ o: [X0 + 1.75, Z(-ZF)], u: [0, 1], th: 0.25, u0: 0, u1: 2 * ZF, y0: Y(43.0), y1: Y(44.0), arcade: true,
    arches: Array.from({ length: 40 }, (_, i) => ({ uc: (i + 0.5) * 2 * ZF / 40, r: ZF / 40 - 0.08, spring: Y(43.45), sill: Y(43.1), pointed: 0.85 })) }));
  bag.add(L, box(X0 + 1.6, Y(44.0), Z(-5.4), X0 + 1.9, Y(44.15), Z(5.4)));

  // the towers: the lower mass up to the gallery's head, then the belfry with two tall bays a face, the louvres, the platform
  const TX0 = X0 + 3.4, TX1 = XT + 3.5;
  for (const s of [-1, 1]) {
    const za = s < 0 ? -ZF : 6.0, zb = s < 0 ? -6.0 : ZF;
    // the tower's mass over its vaulted ground floor, the floor open to the aisles and to the nave's west bay
    const A = (a, b) => Z(Math.min(s * a, s * b)), Bz = (a, b) => Z(Math.max(s * a, s * b));
    bag.add(L, box(X0 + 3.4, Y(36.8), Z(za), TX1, Y(43.4), Z(zb))); col.rect([X0 + 3.4, Z(za), TX1, Z(zb)], Y(36.8), Y(43.4));
    bag.add(L, box(XA, Y(11), A(6, 20.5), XT, Y(36.8), Bz(6, 20.5))); bag.add(L, box(XT, Y(11), A(7, 20.5), TX1, Y(36.8), Bz(7, 20.5))); bag.add(L, box(XT, Y(EAVE), A(6, 7), TX1, Y(36.8), Bz(6, 7)));
    col.rect([XA, A(6, 20.5), TX1, Bz(6, 20.5)], Y(11), Y(36.8));
    const XC0 = XA + (XT - 1.2 - XA) / 2, tw = [];
    archWall(tw, (u, yy, d) => [u, yy, Z(s * d)], { u0: XA, u1: XT - 1.2, d0: 6, d1: 7, y0: Y(0), y1: Y(11), openings: [{ uc: XC0, r: 2.4, sill: Y(0), spring: Y(5.5), f: 0.75 }] });
    bag.add(L, fromTriangles(tw));
    col.rect([XA, A(6, 7), XC0 - 2.4, Bz(6, 7)], y, Y(11)); col.rect([XC0 + 2.4, A(6, 7), XT - 1.2, Bz(6, 7)], y, Y(11));
    bag.add(L, box(XA, Y(-0.5), A(19.5, 20.5), XT - 1.2, Y(11), Bz(19.5, 20.5))); col.rect([XA, A(19.5, 20.5), XT - 1.2, Bz(19.5, 20.5)], y, Y(11));
    // the east piers carrying the tower's east wall, between the nave, the two aisles and the outer wall
    for (const [a, b] of [[6, 7.6], [12.3, 13.7], [19.5, 21.1]]) { bag.add(L, box(XT - 1.2, Y(-0.5), A(a, b), XT + 1.2, Y(11), Bz(a, b))); col.rect([XT - 1.2, A(a, b), XT + 1.2, Bz(a, b)], y, Y(11)); }
    pier(bag, XC0, Z(s * 13), Y(0), 4.6, 0.6); col.circle(XC0, Z(s * 13), 0.75, y, Y(5.8));
    for (const [x0, x1] of [[XA, XC0], [XC0, XT - 1.2]]) for (const [d0, d1] of [[7, 13], [13, 19.5]]) vault(bag, (u, v) => [x0 + u * (x1 - x0), Z(s * (d0 + v * (d1 - d0)))], { spring: Y(5.8), crown: Y(10.4), nu: 6, nv: 6, wallRibs: false, ribN: 8 });
    floorPiece(bag, col, [XA, A(7, 19.5), XT + 1.2, Bz(7, 19.5)], y);
    const faces = [[[TX0 + 0.7, Z(za)], [0, 1], zb - za], [[TX1 - 0.7, Z(za)], [0, 1], zb - za], [[TX0, Z(za) + 0.7], [1, 0], TX1 - TX0], [[TX0, Z(zb) - 0.7], [1, 0], TX1 - TX0]];
    for (const [o, u, Ln] of faces) {
      const bays = [Ln / 2 - 2.6, Ln / 2 + 2.6];
      bag.add(L, planarWall({ o, u, th: 1.4, u0: u[0] ? 0 : 0, u1: Ln, y0: Y(43.4), y1: Y(67.3), arches: bays.map((uc) => ({ uc, r: 1.3, spring: Y(59.0), sill: Y(46.5), pointed: 0.75 })) }));
      const n = [-u[1], u[0]];
      for (const uc of bays) {
        // the bay's archivolt, its colonnettes, the louvres inside
        const av = []; bars(av, [o[0] - n[0] * 0.75, o[1] - n[1] * 0.75], u, pointedPts(uc, 1.5, Y(59.0), 0.75, 10), 0.3, 0.2); bars(av, [o[0] + n[0] * 0.75, o[1] + n[1] * 0.75], u, pointedPts(uc, 1.5, Y(59.0), 0.75, 10), 0.3, 0.2); bag.add(L, fromTriangles(av));
        for (const e of [-1, 1]) for (const sd of [-0.78, 0.78]) { const p0 = [o[0] + u[0] * (uc + e * 1.38) + n[0] * sd, o[1] + u[1] * (uc + e * 1.38) + n[1] * sd]; bag.add(L, lathe([[0.12, 0], [0.12, 12.5]], 8, null, p0[0], Y(46.5), p0[1])); }
        const lv = [];
        for (let k = 0; k < 14; k++) { const yy = Y(47.2 + k * 0.85); const hw = archHalf({ r: 1.3, pointed: 0.75 }, yy - Y(59.0)) - 0.02; if (hw < 0.2) continue; hexa(lv, [[o[0] + u[0] * (uc - hw) + n[0] * 0.3, yy, o[1] + u[1] * (uc - hw) + n[1] * 0.3], [o[0] + u[0] * (uc + hw) + n[0] * 0.3, yy, o[1] + u[1] * (uc + hw) + n[1] * 0.3], [o[0] + u[0] * (uc + hw) + n[0] * 0.24, yy - 0.06, o[1] + u[1] * (uc + hw) + n[1] * 0.24], [o[0] + u[0] * (uc - hw) + n[0] * 0.24, yy - 0.06, o[1] + u[1] * (uc - hw) + n[1] * 0.24]], [[o[0] + u[0] * (uc - hw) - n[0] * 0.3, yy - 0.5, o[1] + u[1] * (uc - hw) - n[1] * 0.3], [o[0] + u[0] * (uc + hw) - n[0] * 0.3, yy - 0.5, o[1] + u[1] * (uc + hw) - n[1] * 0.3], [o[0] + u[0] * (uc + hw) - n[0] * 0.36, yy - 0.56, o[1] + u[1] * (uc + hw) - n[1] * 0.36], [o[0] + u[0] * (uc - hw) - n[0] * 0.36, yy - 0.56, o[1] + u[1] * (uc - hw) - n[1] * 0.36]]); }
        bag.add('timber', fromTriangles(lv));
      }
    }
    col.rect([TX0, Z(za), TX1, Z(zb)], Y(43.4), Y(67.3));
    // the platform: the cornice, the pierced parapet round it, the lead over the vault, gargoyles at the corners
    bag.add(L, box(TX0 - 0.35, Y(67.3), Z(za) - 0.35, TX1 + 0.35, Y(67.8), Z(zb) + 0.35));
    bag.add(LEAD, box(TX0 + 0.4, Y(67.8), Z(za) + 0.4, TX1 - 0.4, Y(67.95), Z(zb) - 0.4)); col.floor([TX0, Z(za), TX1, Z(zb)], Y(67.95));
    for (const [o, u, Ln] of [[[TX0 - 0.15, Z(za) - 0.35], [0, 1], zb - za + 0.7], [[TX1 + 0.15, Z(za) - 0.35], [0, 1], zb - za + 0.7], [[TX0 - 0.35, Z(za) - 0.15], [1, 0], TX1 - TX0 + 0.7], [[TX0 - 0.35, Z(zb) + 0.15], [1, 0], TX1 - TX0 + 0.7]]) {
      const n = Math.round(Ln / 0.9), st = Ln / n;
      bag.add(L, planarWall({ o, u, th: 0.3, u0: 0, u1: Ln, y0: Y(67.8), y1: Y(69.0), arches: Array.from({ length: n }, (_, i) => ({ uc: (i + 0.5) * st, r: st / 2 - 0.1, spring: Y(68.35), sill: Y(67.95), pointed: 0.85 })) }));
    }
    for (const [cx, czz, dx, dz] of [[TX0, Z(za), -1, -1], [TX0, Z(zb), -1, 1], [TX1, Z(za), 1, -1], [TX1, Z(zb), 1, 1]]) { const l = Math.SQRT1_2; gargoyle(bag, cx - dx * 0.2, Y(67.05), czz - dz * 0.2, [dx * l, dz * l], 1.9, true); }
    for (const t of [0.33, 0.67]) { gargoyle(bag, TX0 - 0.1, Y(67.05), Z(za + (zb - za) * t), [-1, 0], 1.5, true); }
  }

  // the nave's west gable behind the gallery
  { const g = []; prism(g, [[XT, Y(EAVE), Z(-ZN - 0.4)], [XT, Y(EAVE), Z(ZN + 0.4)], [XT, Y(RIDGE + 0.6), cz]], [0.9, 0, 0]); bag.add(L, fromTriangles(g)); }

  // ── nave, choir: in section the main vessel, the inner aisle under its tribune, the outer aisle (the
  // nave's with chapels between the buttresses), the clerestory; inside, the arcade on cylindrical piers ──
  // (walls: the clerestory's ZN−1…ZN, the tribune's outer wall ZT−0.9…ZT+0.1 on the aisles' columns, the outer wall zc−0.9…zc+0.1)
  const TF = 10.6, TS = 15.2, TCR = 20.8;                                     // the tribunes' floor, their vaults' springing and crown
  const range = (xa, xb, zc, zu0, zu1, chapels) => {
    const n = Math.round((xb - xa) / BAY), bw = (xb - xa) / n, nave = xa === XT;
    for (const s of [-1, 1]) {
      const zlo = (a, b) => Z(Math.min(s * a, s * b)), zhi = (a, b) => Z(Math.max(s * a, s * b));
      const M = (u, yy, d) => [u, yy, Z(s * d)], wA = [], wB = [], wC = [], wT = [], wO = [], wR = [];
      // the roll mouldings round the arches on the vessel's face, the string courses between the stages
      const RO = (c, r, sp) => bars(wR, [0, Z(s * (ZN - 1))], [1, 0], pointedPts(c, r, sp, 0.75, 12), 0.2, 0.14, -s * 0.06);
      // the lead roofs: the tribune's terrace-roof, the outer aisle's lean-to
      const lean = (z0, y0, z1, y1) => { const r = []; hexa(r, [[xa, Y(y0 - 0.25), Z(s * z0)], [xb, Y(y0 - 0.25), Z(s * z0)], [xb, Y(y1 - 0.25), Z(s * z1)], [xa, Y(y1 - 0.25), Z(s * z1)]], [[xa, Y(y0), Z(s * z0)], [xb, Y(y0), Z(s * z0)], [xb, Y(y1), Z(s * z1)], [xa, Y(y1), Z(s * z1)]]); bag.add(LEAD, fromTriangles(r)); };
      lean(ZN - 0.1, TRIBR, ZT + 0.35, TRIB + 0.05);
      lean(ZT - 0.1, CHAPR, zc + 0.35, CHAP + 0.05);
      // a corbel table and cornice under each eave
      bag.add(L, box(xa, Y(CHAP - 0.45), zlo(zc, zc + 0.3), xb, Y(CHAP - 0.2), zhi(zc, zc + 0.3)));
      bag.add(L, box(xa, Y(TRIB - 0.45), zlo(ZT, ZT + 0.3), xb, Y(TRIB - 0.2), zhi(ZT, ZT + 0.3)));
      bag.add(L, box(xa, Y(EAVE - 0.5), zlo(ZN, ZN + 0.35), xb, Y(EAVE - 0.15), zhi(ZN, ZN + 0.35)));
      const outerOps = [];
      for (let i = 0; i < n; i++) {
        const u0 = xa + i * bw, u1 = u0 + bw, uc = (u0 + u1) / 2, engaged = i === 0 && nave, ua = engaged ? u0 + 1.2 : u0;
        // the clerestory wall: the arcade's arch, the tribune's opening (three arches on two colonnettes under a
        // relieving arch), the window
        const ra = (u1 - ua) / 2 - (engaged ? 0.45 : 0.9), ca = engaged ? ua + 0.45 + ra : uc;
        RO(ca, ra + 0.1, Y(SP));
        archWall(wA, M, { u0, u1, d0: ZN - 1, d1: ZN, y0: Y(SP), y1: Y(TF), openings: [{ uc: ca, r: ra, sill: Y(SP), spring: Y(SP), f: 0.75 }] });
        if (!engaged) {
          const rt = bw / 2 - 0.75;
          RO(uc, rt + 0.1, Y(16.0)); RO(uc, 2.1, Y(28.6));
          archWall(wB, M, { u0, u1, d0: ZN - 1, d1: ZN, y0: Y(TF), y1: Y(22.5), openings: [{ uc, r: rt, sill: Y(TF + 0.9), spring: Y(16.0), f: 0.75 }] });
          const ty = [], k3 = (2 * rt) / 3;
          archWall(ty, M, { u0: uc - rt, u1: uc + rt, d0: ZN - 0.7, d1: ZN - 0.35, y0: Y(15.0), y1: Y(16.0) + rise(rt, 0.75), openings: [0, 1, 2].map((k) => ({ uc: uc - rt + (k + 0.5) * k3, r: k3 / 2 - 0.1, sill: Y(15.0), spring: Y(15.0), f: 0.8 })) });
          bag.add(L, fromTriangles(ty));
          for (const k of [1, 2]) bag.add(L, lathe([[0.16, 0], [0.12, 0.18], [0.12, 15.0 - TF - 1.2], [0.2, 15.0 - TF - 0.95], [0.22, 15.0 - TF - 0.9]], 8, null, uc - rt + k * k3, Y(TF + 0.9), Z(s * (ZN - 0.52))));
          archWall(wC, M, { u0, u1, d0: ZN - 1, d1: ZN, y0: Y(22.5), y1: Y(EAVE), openings: [{ uc, r: 2.0, sill: Y(VS), spring: Y(28.6), f: 0.75 }] });
        } else { archWall(wB, M, { u0, u1, d0: ZN - 1, d1: ZN, y0: Y(TF), y1: Y(EAVE), openings: [] }); }
        // the tribune's outer wall on the aisles' columns: the arcade's arch, the tribune's window
        const rz = (u1 - ua) / 2 - (engaged ? 0.4 : 0.75), cz2 = engaged ? ua + 0.4 + rz : uc;
        archWall(wT, M, { u0, u1, d0: ZT - 0.9, d1: ZT + 0.1, y0: Y(SP), y1: Y(TF), openings: [{ uc: cz2, r: rz, sill: Y(SP), spring: Y(SP), f: 0.7 }] });
        archWall(wT, M, { u0, u1, d0: ZT - 0.9, d1: ZT + 0.1, y0: Y(TF), y1: Y(TRIB), openings: engaged ? [] : [{ uc, r: 1.4, sill: Y(CHAPR + 0.8), spring: Y(18.4), f: 0.75 }] });
        if (chapels && !engaged) sideAltar(ctx, { x: uc, z: Z(s * (zc - 0.9)), y: Y(0.02), s, seed: i * 2 + (s > 0 ? 1 : 0), vaultY: Y(9.0) });
        outerOps.push(chapels ? { uc, r: 1.7, sill: Y(2.8), spring: Y(8.0), f: 0.75 } : { uc, r: 1.3, sill: Y(3.2), spring: Y(7.6), f: 0.75 });
        if (!engaged) {
          win(ctx, [xa, Z(s * (ZN - 0.5))], [1, 0], uc - xa, 4.0, Y(VS), Y(28.6), 2, -s);
          win(ctx, [xa, Z(s * (ZT - 0.4))], [1, 0], uc - xa, 2.8, Y(CHAPR + 0.8), Y(18.4), 2, -s);
        }
        if (chapels) win(ctx, [xa, Z(s * (zc - 0.4))], [1, 0], uc - xa, 3.4, Y(2.8), Y(8.0), 4, -s);
        else win(ctx, [xa, Z(s * (zc - 0.4))], [1, 0], uc - xa, 2.6, Y(3.2), Y(7.6), 2, -s);
        // the vaults of the inner aisle, the tribune, the outer aisle (and the chapel between the buttresses); the tribune's floor
        const SM = { nu: 6, nv: 6, wallRibs: false, ribN: 8, last: i === n - 1 };
        const Q = (d0, d1, x0 = u0, x1 = u1) => (u, v) => [x0 + u * (x1 - x0), Z(s * (d0 + v * (d1 - d0)))];
        vault(bag, Q(ZN - 0.5, ZT - 0.4), { spring: Y(SP), crown: Y(10.1), ...SM });
        if (!engaged) vault(bag, Q(ZN - 0.5, ZT - 0.4), { spring: Y(TS), crown: Y(TCR), ...SM });
        bag.add('flagstone', box(u0, Y(TF - 0.3), zlo(ZN, ZT - 0.9), u1, Y(TF), zhi(ZN, ZT - 0.9)));
        if (chapels) { vault(bag, Q(ZT - 0.4, zu0), { spring: Y(SP), crown: Y(10.8), ...SM }); vault(bag, Q(zu0, zc - 0.5, u0 + (i ? 1.0 : 1.2), u1 - (i < n - 1 ? 1.0 : 0)), { spring: Y(SP), crown: Y(10.8), nu: 5, nv: 4, wallRibs: false, ribN: 8 }); }
        else vault(bag, Q(ZT - 0.4, zc - 0.5), { spring: Y(SP), crown: Y(10.8), ...SM });
      }
      archWall(wO, M, { u0: xa, u1: xb, d0: zc - 0.9, d1: zc + 0.1, y0: Y(-0.5), y1: Y(CHAP), openings: outerOps });
      for (const w of [wA, wB, wC, wT, wO]) bag.add(L, fromTriangles(w));
      bag.add(CARVE, fromTriangles(wR));
      for (const [b0, b1] of [[TF, TF + 0.26], [22.5, 22.76]]) bag.add(L, box(xa, Y(b0), zlo(ZN - 1.14, ZN - 1), xb, Y(b1), zhi(ZN - 1.14, ZN - 1)));
      col.rect([xa, zlo(zc - 0.9, zc + 0.1), xb, zhi(zc - 0.9, zc + 0.1)], y, Y(CHAP));
      // the piers of the arcade, the columns between the aisles (every other one with attached shafts), the
      // vaulting shafts up the clerestory wall from each pier to the vault
      for (let i = 1; i < n; i++) {
        const x = xa + i * bw;
        pier(bag, x, Z(s * (ZN - 0.5)), Y(0), SP - 1.2, 0.7); col.circle(x, Z(s * (ZN - 0.5)), 0.85, y, Y(SP));
        pier(bag, x, Z(s * (ZT - 0.4)), Y(0), SP - 1.2, 0.5); col.circle(x, Z(s * (ZT - 0.4)), 0.65, y, Y(SP));
        if (i % 2 === 0) for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; bag.add(L, lathe([[0.09, 0], [0.09, SP - 1.6]], 6, null, x + Math.cos(a) * 0.55, Y(0.95), Z(s * (ZT - 0.4)) + Math.sin(a) * 0.55)); }
        shafts(x, s, ZN - 1);
      }
    }
    // the steep lead roof over the main vessel, its ridge
    bag.add(LEAD, frustum([xa, Z(-ZN - 0.45), xb, Z(ZN + 0.45)], Y(EAVE), Y(RIDGE), 0, 0, ZN + 0.45, ZN + 0.45));
    bag.add(LEAD, box(xa, Y(RIDGE - 0.05), cz - 0.12, xb, Y(RIDGE + 0.25), cz + 0.12));
    // the main vessel's vaults: sexpartite, over two bays each
    for (let i = 0; i + 1 < n; i += 2) vault(bag, (u, v) => [xa + (i + 2 * u) * bw, Z(-(ZN - 1) + 2 * (ZN - 1) * v)], { spring: Y(VS), crown: Y(VC), sex: true, nu: 16, nv: 12, last: i + 2 >= n && xb !== XAP });
    floorPiece(bag, col, [xa, Z(-(zc - 0.9)), xb, Z(zc - 0.9)], y);
    const n2 = Math.round((xb - xa) / BAY);
    // at each bay's division: the pilaster on the clerestory, the upright, the flyer, its pinnacle and gargoyle
    // (none against the towers or the transept; the choir's last stands at the apse's springing)
    for (let i = 1; i <= (xb === XAP ? n2 : n2 - 1); i++) for (const s of [-1, 1]) flyer(xa + i * bw, s, zu0, zu1);
  };
  /** Three shafts up the clerestory wall's face at d (from the axis) from the arcade's abacus to the vault's springing. */
  const shafts = (x, s, d) => {
    for (const o of [-0.26, 0, 0.26]) bag.add(L, lathe([[0.12, 0], [0.12, VS - SP - 0.5], [0.2, VS - SP - 0.25], [0.22, VS - SP]], 8, null, x + o, Y(SP), Z(s * (d - 0.12))));
  };
  const flyer = (x, s, zu0, zu1) => {
    const zl = (a, b) => Z(Math.min(s * a, s * b)), zh = (a, b) => Z(Math.max(s * a, s * b));
    bag.add(L, box(x - 0.55, Y(TRIBR - 0.3), zl(ZN, ZN + 0.6), x + 0.55, Y(EAVE - 0.5), zh(ZN, ZN + 0.6)));
    // the upright: three stages, each set back under a sloping weathering
    const st = [[0, 12, zu1], [12, 22, zu1 - 0.7], [22, 29.5, zu1 - 1.4]], w = [];
    for (const [y0, y1, zo] of st) { bag.add(L, box(x - 1.0, Y(y0 - (y0 ? 0 : 0.5)), zl(zu0, zo), x + 1.0, Y(y1), zh(zu0, zo))); }
    for (const [yy, zo0, zo1] of [[12, zu1, zu1 - 0.7], [22, zu1 - 0.7, zu1 - 1.4]]) hexa(w, [[x - 1.0, Y(yy), Z(s * (zo1 - 0.01))], [x + 1.0, Y(yy), Z(s * (zo1 - 0.01))], [x + 1.0, Y(yy), Z(s * zo0)], [x - 1.0, Y(yy), Z(s * zo0)]], [[x - 1.0, Y(yy + 0.7), Z(s * (zo1 - 0.01))], [x + 1.0, Y(yy + 0.7), Z(s * (zo1 - 0.01))], [x + 1.0, Y(yy + 0.7), Z(s * zo1)], [x - 1.0, Y(yy + 0.7), Z(s * zo1)]]);
    bag.add(L, fromTriangles(w));
    col.rect([x - 1.0, zl(zu0, zu1), x + 1.0, zh(zu0, zu1)], y, Y(29.5));
    // the flying arch over the aisles to the clerestory: an arc below, a straight sloping back above, its coping
    const fl = [], N = 14, za = zu0, zb = ZN + 0.6, ya0 = 23.4, yb0 = 29.7, ya1 = 28.6, yb1 = 31.1;
    const Pt = (t) => { const zz = za + (zb - za) * t; return [Z(s * zz), Y(ya0 + (yb0 - ya0) * Math.sin(t * Math.PI / 2)), Y(ya1 + (yb1 - ya1) * t)]; };
    for (let k = 0; k < N; k++) {
      const A = Pt(k / N), B = Pt((k + 1) / N);
      hexa(fl, [[x - 0.42, A[1], A[0]], [x + 0.42, A[1], A[0]], [x + 0.42, B[1], B[0]], [x - 0.42, B[1], B[0]]], [[x - 0.42, A[1] + 0.95, A[0]], [x + 0.42, A[1] + 0.95, A[0]], [x + 0.42, B[1] + 0.95, B[0]], [x - 0.42, B[1] + 0.95, B[0]]]);    // the arch's band
      hexa(fl, [[x - 0.42, A[2] - 0.5, A[0]], [x + 0.42, A[2] - 0.5, A[0]], [x + 0.42, B[2] - 0.5, B[0]], [x - 0.42, B[2] - 0.5, B[0]]], [[x - 0.42, A[2], A[0]], [x + 0.42, A[2], A[0]], [x + 0.42, B[2], B[0]], [x - 0.42, B[2], B[0]]]);    // the coping with its gutter
      hexa(fl, [[x - 0.2, A[2] - 0.01, A[0]], [x + 0.2, A[2] - 0.01, A[0]], [x + 0.2, B[2] - 0.01, B[0]], [x - 0.2, B[2] - 0.01, B[0]]], [[x - 0.1, A[2] + 0.22, A[0]], [x + 0.1, A[2] + 0.22, A[0]], [x + 0.1, B[2] + 0.22, B[0]], [x - 0.1, B[2] + 0.22, B[0]]]);
    }
    // the spandrel between the arch and the coping: a file of slender colonnettes (an open arcade), each with a base and a small capital
    for (let j = 1; j <= 11; j++) {
      const t = j / 12, [pz, yi, yt] = Pt(t), y0 = yi + 0.9, y1 = yt - 0.45, hh = y1 - y0;
      if (hh < 0.5) continue;
      const sq = (r, ya, yb) => hexa(fl, [[x - r, ya, pz - r], [x + r, ya, pz - r], [x + r, ya, pz + r], [x - r, ya, pz + r]], [[x - r, yb, pz - r], [x + r, yb, pz - r], [x + r, yb, pz + r], [x - r, yb, pz + r]]);
      sq(0.09, y0, y1 - 0.02); sq(0.14, y0, y0 + 0.14); sq(0.14, y1 - 0.16, y1);
    }
    bag.add(L, fromTriangles(fl));
    pinnacle(bag, x, Y(29.5), Z(s * (zu0 + (zu1 - 1.4 - zu0) / 2)), Math.min(1.8, zu1 - 1.4 - zu0 - 0.1), 7.5);
    gargoyle(bag, x, Y(28.9), Z(s * (zu1 - 1.45)), [0, s], 1.7);
  };
  range(XT, XTR0, ZC, ZU0, ZU1, true);
  range(XTR1, XAP, ZCC, ZUC0, ZUC1, false);

  // ── the transept: the arms to just beyond the chapels, the gables with their roses; inside, the crossing
  // on its four great piers, the arms open to the aisles and the tribunes ──
  const ZTR = 23.2, XC = (XTR0 + XTR1) / 2, ZE = ZTR - 1.2;
  bag.add(LEAD, frustum([XTR0 - 0.45, Z(-ZTR), XTR1 + 0.45, Z(ZTR)], Y(EAVE), Y(RIDGE), 7.45, 7.45, 0, 0));
  bag.add(LEAD, box(XC - 0.12, Y(RIDGE - 0.05), Z(-ZTR), XC + 0.12, Y(RIDGE + 0.25), Z(ZTR)));
  for (const s of [-1, 1]) {
    const A = (a2, b2) => Z(Math.min(s * a2, s * b2)), Bz = (a2, b2) => Z(Math.max(s * a2, s * b2));
    const g = []; prism(g, [[XTR0 - 0.45, Y(EAVE), Z(s * ZTR)], [XTR1 + 0.45, Y(EAVE), Z(s * ZTR)], [XC, Y(RIDGE + 0.7), Z(s * ZTR)]], [0, 0, s * 0.7]); bag.add(L, fromTriangles(g));
    // the end wall: the door's window below, five lancets, the rose
    const we = [], ME = (u, yy, d) => [XTR0 + u, yy, Z(s * d)], E0 = { u0: 0, u1: XTR1 - XTR0, d0: ZE, d1: ZTR };
    archWall(we, ME, { ...E0, y0: Y(-0.5), y1: Y(13.2), openings: [{ uc: 7, r: 1.7, sill: Y(5.6), spring: Y(10.5), f: 0.75 }] });
    archWall(we, ME, { ...E0, y0: Y(13.2), y1: Y(20.6), openings: Array.from({ length: 5 }, (_, k) => ({ uc: 2.6 + k * 2.2, r: 0.75, sill: Y(14.5), spring: Y(19.2), f: 0.8 })) });
    archWall(we, ME, { ...E0, y0: Y(20.6), y1: Y(EAVE), openings: [{ uc: 7, yc: Y(25.6), r: 4.4 }] });
    bag.add(L, fromTriangles(we));
    col.rect([XTR0, A(ZE, ZTR), XTR1, Bz(ZE, ZTR)], y, Y(EAVE));
    roseND(bag, [XTR0, Z(s * (ZTR - 0.6))], [1, 0], XC - XTR0, Y(25.6), 4.4, -s, 0.36);
    const rr = []; bars(rr, [XTR0, Z(s * (ZTR + 0.08))], [1, 0], ringPts(XC - XTR0, Y(25.6), 4.65, 40), 0.4, 0.3); bag.add(L, fromTriangles(rr));
    for (let k = 0; k < 5; k++) win(ctx, [XTR0, Z(s * (ZTR - 0.6))], [1, 0], 2.6 + k * 2.2, 1.5, Y(14.5), Y(19.2), 2, -s, 0.8);
    win(ctx, [XTR0, Z(s * (ZTR - 0.6))], [1, 0], 7, 3.4, Y(5.6), Y(10.5), 2, -s);
    roseND(bag, [XTR0, Z(s * (ZTR + 0.72))], [1, 0], 7, Y(38.4), 1.5, -s, 0.3);
    for (const x of [XTR0 - 1.0, XTR1 + 1.0]) {
      bag.add(L, box(x - 1.0, Y(-0.5), Z(Math.min(s * (ZTR - 1), s * (ZTR + 1.8))), x + 1.0, Y(EAVE + 1), Z(Math.max(s * (ZTR - 1), s * (ZTR + 1.8)))));
      pinnacle(bag, x, Y(EAVE + 1), Z(s * (ZTR + 0.4)), 1.7, 6.5);
      gargoyle(bag, x, Y(EAVE + 0.4), Z(s * (ZTR + 1.8)), [0, s], 1.6);
    }
    // the arm's side walls: on the west the nave's aisles and tribune open into it, on the east the choir's
    for (const [x0, sg, zo] of [[XTR0, 1, ZC], [XTR1, -1, ZCC]]) {
      const ws = [], MW = (u, yy, d) => [x0 + sg * d, yy, Z(s * u)], W0 = { u0: ZN, u1: ZE, d0: 0, d1: 0.9 };
      const o1 = (ZT + 0.1 + zo - 0.9) / 2, r1 = (zo - 0.9 - ZT - 0.1) / 2 - 0.2;
      archWall(ws, MW, { ...W0, y0: Y(-0.5), y1: Y(TF), openings: [{ uc: (ZN + ZT - 0.9) / 2, r: 2.3, sill: Y(0), spring: Y(SP), f: 0.75 }, { uc: o1, r: r1, sill: Y(0), spring: Y(SP), f: r1 > 2 ? 0.6 : 0.75 }] });
      archWall(ws, MW, { ...W0, y0: Y(TF), y1: Y(22.5), openings: [{ uc: (ZN + ZT - 0.9) / 2, r: 2.2, sill: Y(TF + 0.9), spring: Y(16), f: 0.75 }] });
      archWall(ws, MW, { ...W0, y0: Y(22.5), y1: Y(EAVE), openings: [{ uc: 14, r: 2.0, sill: Y(VS), spring: Y(28.6), f: 0.75 }] });
      bag.add(L, fromTriangles(ws));
      win(ctx, [x0 + sg * 0.45, cz], [0, 1], s * 14, 4.0, Y(VS), Y(28.6), 2, -sg);
      const xl = Math.min(x0, x0 + sg * 0.9), xh = Math.max(x0, x0 + sg * 0.9);
      col.rect([xl, A(ZT - 0.9, ZT + 0.1), xh, Bz(ZT - 0.9, ZT + 0.1)], y, Y(TF)); col.rect([xl, A(zo - 0.9, ZE), xh, Bz(zo - 0.9, ZE)], y, Y(EAVE));
      // the corner of the crossing over its pier, up to the vault
      bag.add(L, box(xl, Y(SP), A(ZN - 1, ZN), xh, Y(EAVE), Bz(ZN - 1, ZN)));
      // the great pier of the crossing, its shafts
      pier(bag, x0, Z(s * (ZN - 0.5)), Y(0), SP - 1.2, 1.0); col.circle(x0, Z(s * (ZN - 0.5)), 1.2, y, Y(SP));
      shafts(x0, s, ZN - 1);
    }
    vault(bag, (u, v) => [XTR0 + v * (XTR1 - XTR0), Z(s * (ZN - 1 + u * (ZE - ZN + 1)))], { spring: Y(VS), crown: Y(VC), nu: 12, nv: 10 });
  }
  vault(bag, (u, v) => [XTR0 + u * (XTR1 - XTR0), Z(-(ZN - 1) + 2 * (ZN - 1) * v)], { spring: Y(VS), crown: Y(VC), nu: 10, nv: 10, transverse: false, wallRibs: false });
  floorPiece(bag, col, [XTR0, Z(-ZE), XTR1, Z(ZE)], y);

  // ── the apse: the half-polygon of the choir, the ambulatories round it, the uprights and flyers (radii to
  // the corners: the straight walls run on into the polygon) ──
  const SIDES = 5, a0 = -90, step = 180 / SIDES, C18 = Math.cos(step / 2 * D2R);
  const P = (r, a, yy) => [XAP + r * Math.cos(a * D2R), yy, cz + r * Math.sin(a * D2R)];
  STYLES.gothic.elements.apse_roof({ c: [XAP, cz], sides: SIDES, a0: -90, a1: 90, R: ZN + 0.5, y: Y(EAVE), ridge: Y(RIDGE) }, ctx);
  const ringRoof = (r0, y0, r1, y1) => {
    const g = [];
    for (let k = 0; k < SIDES; k++) {
      const aa = a0 + k * step, bb = aa + step;
      hexa(g, [P(r0, aa, Y(y0 - 0.25)), P(r0, bb, Y(y0 - 0.25)), P(r1, bb, Y(y1 - 0.25)), P(r1, aa, Y(y1 - 0.25))], [P(r0, aa, Y(y0)), P(r0, bb, Y(y0)), P(r1, bb, Y(y1)), P(r1, aa, Y(y1))]);
    }
    bag.add(LEAD, fromTriangles(g));
  };
  ringRoof(ZN - 0.1, TRIBR, ZT + 0.35, TRIB + 0.05);
  ringRoof(ZT - 0.1, CHAPR, ZCC + 0.35, CHAP + 0.05);
  const wa = [], fl = [];
  for (let k = 0; k < SIDES; k++) {
    const aa = a0 + k * step, bb = aa + step, am = aa + step / 2, nk = [Math.cos(am * D2R), Math.sin(am * D2R)], tk = [-nk[1], nk[0]];
    const MK = (rr) => (u, yy, d) => { const f = d / rr; return [XAP + (nk[0] * rr * C18 + tk[0] * u) * f, yy, cz + (nk[1] * rr * C18 + tk[1] * u) * f]; };
    const hw = (rr) => rr * Math.sin(step / 2 * D2R);
    // the hemicycle's wall: its arcade, the tribune's opening, the window
    const m1 = MK(ZN - 0.5), h1 = hw(ZN - 0.5);
    archWall(wa, m1, { u0: -h1, u1: h1, d0: ZN - 1, d1: ZN, y0: Y(SP), y1: Y(TF), openings: [{ uc: 0, r: h1 - 0.95, sill: Y(SP), spring: Y(SP), f: 0.9 }] });
    archWall(wa, m1, { u0: -h1, u1: h1, d0: ZN - 1, d1: ZN, y0: Y(TF), y1: Y(22.5), openings: [{ uc: 0, r: 1.2, sill: Y(TF + 0.9), spring: Y(16), f: 0.75 }] });
    archWall(wa, m1, { u0: -h1, u1: h1, d0: ZN - 1, d1: ZN, y0: Y(22.5), y1: Y(EAVE), openings: [{ uc: 0, r: 1.5, sill: Y(VS), spring: Y(28.6), f: 0.75 }] });
    const c1 = m1(0, 0, ZN - 0.5); win(ctx, [c1[0], c1[2]], tk, 0, 3.0, Y(VS), Y(28.6), 2, 1);
    // the tribune's outer wall on the ambulatory's columns, its window
    const m2 = MK(ZT - 0.4), h2 = hw(ZT - 0.4);
    archWall(wa, m2, { u0: -h2, u1: h2, d0: ZT - 0.9, d1: ZT + 0.1, y0: Y(SP), y1: Y(TF), openings: [{ uc: 0, r: h2 - 0.75, sill: Y(SP), spring: Y(SP), f: 0.6 }] });
    archWall(wa, m2, { u0: -h2, u1: h2, d0: ZT - 0.9, d1: ZT + 0.1, y0: Y(TF), y1: Y(TRIB), openings: [{ uc: 0, r: 1.5, sill: Y(CHAPR + 0.8), spring: Y(18.4), f: 0.75 }] });
    const c2 = m2(0, 0, ZT - 0.4); win(ctx, [c2[0], c2[2]], tk, 0, 3.0, Y(CHAPR + 0.8), Y(18.4), 2, 1);
    // the outer wall of the ambulatory, its window
    const m3 = MK(ZCC - 0.4), h3 = hw(ZCC - 0.4);
    archWall(wa, m3, { u0: -h3, u1: h3, d0: ZCC - 0.9, d1: ZCC + 0.1, y0: Y(-0.5), y1: Y(CHAP), openings: [{ uc: 0, r: 1.8, sill: Y(3.2), spring: Y(7.6), f: 0.75 }] });
    const c3 = m3(0, 0, ZCC - 0.4); win(ctx, [c3[0], c3[2]], tk, 0, 3.6, Y(3.2), Y(7.6), 2, 1);
    const pa = P(ZCC - 0.4, aa, 0), pb = P(ZCC - 0.4, bb, 0); col.segment([pa[0], pa[2]], [pb[0], pb[2]], 1.0, y, Y(CHAP));
    // the vaults of the ambulatories and of the tribune over the inner one; the tribune's floor
    const Qa = (r0, r1) => (u, v) => { const A0 = P(r0, aa, 0), A1 = P(r0, bb, 0), B0 = P(r1, aa, 0), B1 = P(r1, bb, 0); const lx = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[2] + (q[2] - p[2]) * t]; const i0 = lx(A0, A1, u), o0 = lx(B0, B1, u); return [i0[0] + (o0[0] - i0[0]) * v, i0[1] + (o0[1] - i0[1]) * v]; };
    const SA = { nu: 6, nv: 6, wallRibs: false, ribN: 8, last: k === SIDES - 1 };
    vault(bag, Qa(ZN - 0.5, ZT - 0.4), { spring: Y(SP), crown: Y(10.1), ...SA });
    vault(bag, Qa(ZN - 0.5, ZT - 0.4), { spring: Y(TS), crown: Y(TCR), ...SA });
    vault(bag, Qa(ZT - 0.4, ZCC - 0.5), { spring: Y(SP), crown: Y(10.8), ...SA });
    hexa(fl, [P(ZN, aa, Y(TF - 0.3)), P(ZN, bb, Y(TF - 0.3)), P(ZT - 0.9, bb, Y(TF - 0.3)), P(ZT - 0.9, aa, Y(TF - 0.3))], [P(ZN, aa, Y(TF)), P(ZN, bb, Y(TF)), P(ZT - 0.9, bb, Y(TF)), P(ZT - 0.9, aa, Y(TF))]);
    const fp = []; prism(fp, [P(0, aa, Y(-0.1)), P(ZCC - 0.9, aa, Y(-0.1)), P(ZCC - 0.9, bb, Y(-0.1))], [0, 0.12, 0]); bag.add('flagstone', fromTriangles(fp));
  }
  bag.add(L, fromTriangles(wa)); bag.add('flagstone', fromTriangles(fl));
  col.floor([XAP, Z(-(ZCC - 0.9)), XAP + ZCC - 0.9, Z(ZCC - 0.9)], Y(0.02));
  // the piers of the hemicycle and the columns of the ambulatory at the corners, the shafts to the vault
  for (let k = 0; k <= SIDES; k++) {
    const a = a0 + k * step, p1 = P(ZN - 0.5, a, 0), p2 = P(ZT - 0.4, a, 0);
    pier(bag, p1[0], p1[2], Y(0), SP - 1.2, 0.7); col.circle(p1[0], p1[2], 0.85, y, Y(SP));
    pier(bag, p2[0], p2[2], Y(0), SP - 1.2, 0.5); col.circle(p2[0], p2[2], 0.65, y, Y(SP));
    const t = [-Math.sin(a * D2R), Math.cos(a * D2R)];
    for (const o of [-0.26, 0, 0.26]) { const q = P(ZN - 1.12, a, 0); bag.add(L, lathe([[0.12, 0], [0.12, VS - SP - 0.5], [0.2, VS - SP - 0.25], [0.22, VS - SP]], 8, null, q[0] + t[0] * o, Y(SP), q[2] + t[1] * o)); }
  }
  STYLES.gothic.elements.apse_vault({ c: [XAP, cz], R: ZN - 1, a0: -90, a1: 90, sides: SIDES, spring: Y(VS), crown: Y(VC), mat: L, ribMat: L }, ctx);
  // the choir: the jubé across its entrance, the canons' stalls, the high altar in the hemicycle
  jube(ctx, { xa: XTR1 + 1.3, xb: XTR1 + 4.6, z0: Z(-5.6), z1: Z(5.6), y: Y(0.02), figure });
  for (const s of [-1, 1]) stalls(ctx, { xa: XTR1 + 4.8, xb: XAP - 0.9, zb: Z(s * 5.6), zf: Z(0), y: Y(0.02) });
  altar(ctx, { x: XAP + 2.2, z: cz, y: Y(0.02) });
  // the uprights round the apse, at its corners, each with its flyer to the choir's wall
  for (let k = 1; k < SIDES; k++) {
    const a = a0 + k * step, d = [Math.cos(a * D2R), Math.sin(a * D2R)], t = [-d[1], d[0]];
    const Q = (r, s, yy) => [XAP + d[0] * r + t[0] * s, Y(yy), cz + d[1] * r + t[1] * s];
    const up = [];
    for (const [y0, y1, ro] of [[-0.5, 12, ZUC1], [12, 22, ZUC1 - 0.7], [22, 29.5, ZUC1 - 1.4]]) hexa(up, [Q(ZUC0, -1, y0), Q(ZUC0, 1, y0), Q(ro, 1, y0), Q(ro, -1, y0)], [Q(ZUC0, -1, y1), Q(ZUC0, 1, y1), Q(ro, 1, y1), Q(ro, -1, y1)]);
    const R7 = ZN;
    hexa(up, [Q(R7 - 0.2, -0.55, TRIBR - 0.3), Q(R7 - 0.2, 0.55, TRIBR - 0.3), Q(R7 + 0.6, 0.55, TRIBR - 0.3), Q(R7 + 0.6, -0.55, TRIBR - 0.3)], [Q(R7 - 0.2, -0.55, EAVE - 0.5), Q(R7 - 0.2, 0.55, EAVE - 0.5), Q(R7 + 0.6, 0.55, EAVE - 0.5), Q(R7 + 0.6, -0.55, EAVE - 0.5)]);
    const N = 14;
    for (let i = 0; i < N; i++) {
      const f0 = i / N, f1 = (i + 1) / N, rr = (f) => ZUC0 + (R7 + 0.6 - ZUC0) * f, yb = (f) => 23.4 + 6.3 * Math.sin(f * Math.PI / 2), yt = (f) => 28.6 + 2.5 * f;
      hexa(up, [Q(rr(f0), -0.42, yb(f0)), Q(rr(f0), 0.42, yb(f0)), Q(rr(f1), 0.42, yb(f1)), Q(rr(f1), -0.42, yb(f1))], [Q(rr(f0), -0.42, yb(f0) + 0.95), Q(rr(f0), 0.42, yb(f0) + 0.95), Q(rr(f1), 0.42, yb(f1) + 0.95), Q(rr(f1), -0.42, yb(f1) + 0.95)]);
      hexa(up, [Q(rr(f0), -0.42, yt(f0) - 0.5), Q(rr(f0), 0.42, yt(f0) - 0.5), Q(rr(f1), 0.42, yt(f1) - 0.5), Q(rr(f1), -0.42, yt(f1) - 0.5)], [Q(rr(f0), -0.42, yt(f0)), Q(rr(f0), 0.42, yt(f0)), Q(rr(f1), 0.42, yt(f1)), Q(rr(f1), -0.42, yt(f1))]);
      if (i > 0) { const f = f0, y0 = yb(f) + 0.9, y1 = yt(f) - 0.45, c = Q(rr(f), 0, y0); if (y1 - y0 > 0.5) { const sq = (r, ya, yb2) => hexa(up, [[c[0] - r, c[1] + ya, c[2] - r], [c[0] + r, c[1] + ya, c[2] - r], [c[0] + r, c[1] + ya, c[2] + r], [c[0] - r, c[1] + ya, c[2] + r]], [[c[0] - r, c[1] + yb2, c[2] - r], [c[0] + r, c[1] + yb2, c[2] - r], [c[0] + r, c[1] + yb2, c[2] + r], [c[0] - r, c[1] + yb2, c[2] + r]]); sq(0.09, 0, y1 - y0 - 0.02); sq(0.14, 0, 0.14); sq(0.14, y1 - y0 - 0.16, y1 - y0); } }
    }
    bag.add(L, fromTriangles(up));
    col.circle(...[XAP + d[0] * (ZUC0 + 2), cz + d[1] * (ZUC0 + 2)], 1.6, y, Y(29.5));
    const pc = Q(ZUC0 + (ZUC1 - 1.4 - ZUC0) / 2, 0, 29.5);
    pinnacle(bag, pc[0], pc[1], pc[2], 1.7, 7.5);
    const gp = Q(ZUC1 - 1.45, 0, 28.9); gargoyle(bag, gp[0], gp[1], gp[2], d, 1.7);
  }

  // ── the spire over the crossing (about 1220–30; about 78 m above the floor), of oak sheathed in lead ──
  const sx = XC, R8 = 3.3;
  bag.add(LEAD, lathe([[R8 + 0.3, 0], [R8 + 0.3, 0.6], [R8, 0.7], [R8, 8.6], [R8 + 0.35, 8.8], [R8 + 0.35, 9.3]], 8, null, sx, Y(RIDGE - 2.5), cz));
  // the lantern's pointed bays and their gablets, the corner pinnacles
  for (let k = 0; k < 8; k++) {
    const a = (k + 0.5) * Math.PI / 4, d = [Math.cos(a), Math.sin(a)], t = [-d[1], d[0]], rf = R8 * Math.cos(Math.PI / 8) + 0.03, hw = R8 * Math.sin(Math.PI / 8) * 0.62;
    const c = [sx + d[0] * rf, cz + d[1] * rf], op = [];
    const pts = pointedPts(0, hw, Y(RIDGE + 3.6), 0.8, 6);
    for (let i = 0; i < pts.length - 1; i++) {
      const [ua, ya] = pts[i], [ub, yb] = pts[i + 1];
      op.push(c[0] + t[0] * ua, ya, c[1] + t[1] * ua, c[0] + t[0] * ub, yb, c[1] + t[1] * ub, c[0], Y(RIDGE + 3.6), c[1]);
    }
    op.push(c[0] - t[0] * hw, Y(RIDGE + 0.6), c[1] - t[1] * hw, c[0] + t[0] * hw, Y(RIDGE + 0.6), c[1] + t[1] * hw, c[0] + t[0] * hw, Y(RIDGE + 3.6), c[1] + t[1] * hw);
    op.push(c[0] - t[0] * hw, Y(RIDGE + 0.6), c[1] - t[1] * hw, c[0] + t[0] * hw, Y(RIDGE + 3.6), c[1] + t[1] * hw, c[0] - t[0] * hw, Y(RIDGE + 3.6), c[1] - t[1] * hw);
    // wind every triangle outward
    for (let i = 0; i < op.length; i += 9) { const ux = op[i + 3] - op[i], uy = op[i + 4] - op[i + 1], uz = op[i + 5] - op[i + 2], vx = op[i + 6] - op[i], vy = op[i + 7] - op[i + 1], vz = op[i + 8] - op[i + 2]; const nx = uy * vz - uz * vy, nz = ux * vy - uy * vx; if (nx * d[0] + nz * d[1] < 0) for (let q = 0; q < 3; q++) { const tt = op[i + 3 + q]; op[i + 3 + q] = op[i + 6 + q]; op[i + 6 + q] = tt; } }
    bag.add('opening', fromTriangles(op));
    const gb = [], gw = R8 * Math.sin(Math.PI / 8) * 0.95;
    prism(gb, [[c[0] - t[0] * gw, Y(RIDGE + 6.8), c[1] - t[1] * gw], [c[0] + t[0] * gw, Y(RIDGE + 6.8), c[1] + t[1] * gw], [c[0], Y(RIDGE + 9.4), c[1]]], [-d[0] * 0.5, 0, -d[1] * 0.5]);
    bag.add(LEAD, fromTriangles(gb));
    const ca = k * Math.PI / 4, pr = R8 + 0.1;
    bag.add(LEAD, lathe([[0.32, 0], [0.32, 1.2], [0.001, 3.4]], 4, null, sx + Math.cos(ca) * pr, Y(RIDGE + 6.8), cz + Math.sin(ca) * pr));
  }
  bag.add(LEAD, lathe([[R8 * 0.96, 0], [R8 * 0.6, 6], [0.5, 22], [0.08, 26.5]], 8, null, sx, Y(RIDGE + 6.8), cz));
  for (let k = 1; k <= 7; k++) {
    // crockets up the needle's eight arrises, set on the lathe's own profile
    const hh = 26 * k / 8, prof = [[R8 * 0.96, 0], [R8 * 0.6, 6], [0.5, 22], [0.08, 26.5]];
    let rr = 0.08; for (let q = 0; q < prof.length - 1; q++) if (hh >= prof[q][1] && hh <= prof[q + 1][1]) rr = prof[q][0] + (prof[q + 1][0] - prof[q][0]) * (hh - prof[q][1]) / (prof[q + 1][1] - prof[q][1]);
    const yy = Y(RIDGE + 6.8 + hh); rr -= 0.04;
    for (let q = 0; q < 8; q++) { const a = q * Math.PI / 4; bag.add(LEAD, box(sx + Math.cos(a) * rr - 0.12, yy, cz + Math.sin(a) * rr - 0.12, sx + Math.cos(a) * rr + 0.12, yy + 0.3, cz + Math.sin(a) * rr + 0.12)); }
  }
  const top = Y(RIDGE + 6.8 + 26.5);
  bag.add('gilt_bronze', lathe([[0.06, 0], [0.06, 2.0], [0.001, 2.0]], 6, null, sx, top, cz));
  bag.add('gilt_bronze', box(sx - 0.05, top + 1.25, cz - 0.55, sx + 0.05, top + 1.38, cz + 0.55));
  bag.add('gilt_bronze', box(sx - 0.35, top + 2.0, cz - 0.04, sx + 0.3, top + 2.4, cz + 0.04));     // the cock
  bag.add('gilt_bronze', box(sx - 0.1, top + 2.4, cz - 0.04, sx + 0.18, top + 2.65, cz + 0.04));
  void X1; void Z1; void Z0;
}

Object.assign(STYLES.gothic.elements, { notre_dame: notreDame });

// the carving helpers, for the Sainte-Chapelle and the palace (src/buildings/sainte-chapelle/style.js, ./palace.js)
export { prism, bars, pinnacle, figureBase as figure, pointedPts, ringPts };
