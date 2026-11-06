// Romanesque architecture (southern France, late 11th – early 12th century): the vocabulary of the
// pilgrimage church of Sainte-Foy at Conques. Round arches; tunnel (barrel) vaults on transverse
// arches; half-barrels over the tribunes to carry the thrust; groin-less, heavy walls with small
// round-headed windows; piers of square cores with four half-columns and carved block capitals;
// apses and chapels under half-domes; a crossing lantern; roofs of schist slabs (lauzes) at a
// moderate pitch; a portal with a carved and painted tympanum. Planar walls (round arches,
// windows), arc walls and sphere patches come from the shared Byzantine vocabulary.

import { registerStyle } from '../../core/build.js';
import { box, lathe, frustum, fromTriangles, orientOutward } from '../../core/geom.js';
import { byzantineElements } from '../byzantine/index.js';
import { doors } from '../greek/objects.js';

const D2R = Math.PI / 180;

/** Convex hexahedron from 8 corners (bottom 4, top 4, same order) → triangles, outward. */
function hexa(out, b, t) {
  const tris = [];
  const q = (a, b2, c, d) => tris.push(...a, ...b2, ...c, ...a, ...c, ...d);
  q(b[0], b[1], b[2], b[3]); q(t[0], t[3], t[2], t[1]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; q(b[i], t[i], t[j], b[j]); }
  out.push(...orientOutward(tris));
}

// ── vaults ───────────────────────────────────────────────────────────────────

/**
 * A tunnel vault (or part of one): a cylindrical shell along `axis` ('x' or 'z') from s0 to s1,
 * its axis at `c` (the other horizontal coordinate) and height y (the springing); intrados r,
 * thickness th; the arc from a0 to a1 degrees (0: toward +c side horizontally, 90: the crown,
 * 180: toward −c). A half-barrel over a tribune is a quarter: 0–90 or 90–180.
 */
function barrel(el, { bag }) {
  const a0 = (el.a0 ?? 0) * D2R, a1 = (el.a1 ?? 180) * D2R, r0 = el.r, r1 = el.r + (el.th ?? 0.6);
  const n = Math.max(2, Math.round(Math.abs(a1 - a0) / (Math.PI / 24)));
  const P = (r, a, s) => (el.axis === 'x' ? [s, el.y + r * Math.sin(a), el.c + r * Math.cos(a)] : [el.c + r * Math.cos(a), el.y + r * Math.sin(a), s]);
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = a0 + (a1 - a0) * i / n, b = a0 + (a1 - a0) * (i + 1) / n;
    hexa(out, [P(r0, a, el.s0), P(r1, a, el.s0), P(r1, b, el.s0), P(r0, b, el.s0)], [P(r0, a, el.s1), P(r1, a, el.s1), P(r1, b, el.s1), P(r0, b, el.s1)]);
  }
  bag.add(el.mat || 'limestone_yellow', fromTriangles(out));
}

// ── supports ─────────────────────────────────────────────────────────────────

/** Block capital of the Romanesque Corinthian kind, round below and square above, with its abacus. */
function capital(bag, mat, x, y, z, r, h) {
  bag.add(mat, lathe([[r * 0.95, 0], [r * 1.0, h * 0.12]], 16, null, x, y, z));
  const sq = r * 1.35;
  bag.add(mat, frustum([x - r, z - r, x + r, z + r], y + h * 0.12, y + h * 0.82, -(sq - r), -(sq - r), -(sq - r), -(sq - r)));
  bag.add(mat, box(x - sq - 0.05, y + h * 0.82, z - sq - 0.05, x + sq + 0.05, y + h, z + sq + 0.05));
}

/** Column: square plinth, torus base, shaft, block capital and abacus { at, y, h, d, mat, capMat }. */
function column(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, d = el.d, r = d / 2, h = el.h;
  const mat = el.mat || el.shaftMat || 'limestone_yellow', capMat = el.capMat || mat;
  const baseH = 0.5 * d, capH = 0.85 * d;
  bag.add(mat, box(x - r * 1.3, y, z - r * 1.3, x + r * 1.3, y + baseH * 0.35, z + r * 1.3));
  bag.add(mat, lathe([[r * 1.25, 0], [r * 1.22, baseH * 0.3], [r * 1.05, baseH * 0.45], [r * 1.0, baseH * 0.6], [r * 1.0, baseH * 0.65]], 16, null, x, y + baseH * 0.35, z));
  bag.add(mat, lathe([[r, 0], [r * 0.96, h - baseH - capH]], 16, null, x, y + baseH, z));
  capital(bag, capMat, x, y + h - capH, z, r, capH);
  if (el.collide !== false) col.circle(x, z, r * 1.1, y, y + h);
}

/**
 * A pier of the nave or transept: a square core (half-size s) with a half-column on each face
 * (radius hr) up to `cap` (where their capitals stand), the core rising on to y1 (under the
 * transverse arch). { at [x, z], s, hr, y0, cap, y1, mat, faces ('nesw' — which faces carry one) }
 */
function pier(el, { bag, col }) {
  const [x, z] = el.at, s = el.s, hr = el.hr ?? 0.22, y0 = el.y0 ?? 0, cap = el.cap, y1 = el.y1 ?? cap;
  const mat = el.mat || 'limestone_yellow';
  bag.add(el.baseMat || mat, box(x - s - 0.12, y0, z - s - 0.12, x + s + 0.12, y0 + 0.4, z + s + 0.12));
  bag.add(mat, box(x - s, y0 + 0.4, z - s, x + s, y1, z + s));
  const faces = el.faces || 'nesw', capH = Math.min(0.75, hr * 3.2);
  const at = { n: [x, z - s], s: [x, z + s], e: [x + s, z], w: [x - s, z] };
  for (const f of faces) {
    const [hx, hz] = at[f];
    bag.add(mat, lathe([[hr * 1.25, 0], [hr * 1.15, 0.25], [hr, 0.35], [hr, cap - capH - y0 - 0.4]], 12, null, hx, y0 + 0.4, hz));
    capital(bag, el.capMat || mat, hx, cap - capH, hz, hr, capH);
  }
  col.rect([x - s - hr, z - s - hr, x + s + hr, z + s + hr], y0, y1);
}

// ── roofs ────────────────────────────────────────────────────────────────────

/** A gable roof with its ridge along `axis` ('x' default or 'z') { x0, x1, z0, z1, y, ridge, ends, mat }. */
function gableRoof(el, { bag }) {
  const { x0, x1, z0, z1, y, ridge } = el;
  const tris = [];
  const q = (a, b, c, d) => tris.push(...a, ...b, ...c, ...a, ...c, ...d);
  if ((el.axis || 'x') === 'x') {
    const zm = (z0 + z1) / 2;
    q([x0, y, z0], [x1, y, z0], [x1, ridge, zm], [x0, ridge, zm]);
    q([x0, y, z1], [x0, ridge, zm], [x1, ridge, zm], [x1, y, z1]);
    if (el.ends !== false) { tris.push(x0, y, z0, x0, ridge, zm, x0, y, z1); tris.push(x1, y, z0, x1, y, z1, x1, ridge, zm); }
  } else {
    const xm = (x0 + x1) / 2;
    q([x0, y, z0], [x0, y, z1], [xm, ridge, z1], [xm, ridge, z0]);
    q([x1, y, z0], [xm, ridge, z0], [xm, ridge, z1], [x1, y, z1]);
    if (el.ends !== false) { tris.push(x0, y, z0, xm, ridge, z0, x1, y, z0); tris.push(x0, y, z1, x1, y, z1, xm, ridge, z1); }
  }
  q([x0, y, z0], [x0, y, z1], [x1, y, z1], [x1, y, z0]);
  bag.add(el.mat || 'lauze', fromTriangles(orientOutward(tris)));
}

/** A lean-to roof over rect, falling toward side `low` ('n','s','e','w') from y1 to y0. */
function leanRoof(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, lo = el.y0, hi = el.y1, t = el.th ?? 0.25;
  const hAt = (x, z) => {
    if (el.low === 'n') return lo + (hi - lo) * (z - z0) / (z1 - z0);
    if (el.low === 's') return lo + (hi - lo) * (z1 - z) / (z1 - z0);
    if (el.low === 'w') return lo + (hi - lo) * (x - x0) / (x1 - x0);
    return lo + (hi - lo) * (x1 - x) / (x1 - x0);
  };
  const c = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
  const out = [];
  hexa(out, c.map(([x, z]) => [x, hAt(x, z) - t, z]), c.map(([x, z]) => [x, hAt(x, z), z]));
  bag.add(el.mat || 'lauze', fromTriangles(out));
}

/**
 * A half-cone (or part of a cone) over an apse { c [x, z], R, a0, a1 (deg), y, apex, mat }; with r0
 * a ring only, from radius r0 at the apex's height down to R (the roof of an ambulatory).
 */
function coneRoof(el, { bag }) {
  const [cx, cz] = el.c, a0 = el.a0 * D2R, a1 = el.a1 * D2R, n = el.seg || 16;
  if (el.r0) {
    const out = [], t = el.th ?? 0.3, P = (r, a, y) => [cx + Math.cos(a) * r, y, cz + Math.sin(a) * r];
    for (let k = 0; k < n; k++) {
      const a = a0 + (a1 - a0) * k / n, b = a0 + (a1 - a0) * (k + 1) / n;
      hexa(out, [P(el.r0, a, el.apex - t), P(el.R, a, el.y - t), P(el.R, b, el.y - t), P(el.r0, b, el.apex - t)], [P(el.r0, a, el.apex), P(el.R, a, el.y), P(el.R, b, el.y), P(el.r0, b, el.apex)]);
    }
    bag.add(el.mat || 'lauze', fromTriangles(out));
    return;
  }
  const tris = [], A = [cx, el.apex, cz], C = [cx, el.y, cz];
  for (let k = 0; k < n; k++) {
    const a = a0 + (a1 - a0) * k / n, b = a0 + (a1 - a0) * (k + 1) / n;
    const P = [cx + Math.cos(a) * el.R, el.y, cz + Math.sin(a) * el.R], Q = [cx + Math.cos(b) * el.R, el.y, cz + Math.sin(b) * el.R];
    tris.push(...P, ...Q, ...A, ...P, ...C, ...Q);
  }
  if (a1 - a0 < Math.PI * 2 - 1e-3) {
    const P = [cx + Math.cos(a0) * el.R, el.y, cz + Math.sin(a0) * el.R], Q = [cx + Math.cos(a1) * el.R, el.y, cz + Math.sin(a1) * el.R];
    tris.push(...P, ...A, ...C, ...Q, ...C, ...A);
  }
  bag.add(el.mat || 'lauze', fromTriangles(orientOutward(tris)));
}

/** A pyramid roof of `sides` faces { c [x, z], r (to the corners), y, apex, rot (deg), mat }. */
function pyramidRoof(el, { bag }) {
  const [cx, cz] = el.c, n = el.sides || 4, rot = (el.rot ?? 45) * D2R;
  const tris = [], A = [cx, el.apex, cz];
  for (let k = 0; k < n; k++) {
    const a = rot + 2 * Math.PI * k / n, b = rot + 2 * Math.PI * (k + 1) / n;
    const P = [cx + Math.cos(a) * el.r, el.y, cz + Math.sin(a) * el.r], Q = [cx + Math.cos(b) * el.r, el.y, cz + Math.sin(b) * el.r];
    tris.push(...P, ...Q, ...A, ...P, ...[cx, el.y, cz], ...Q);
  }
  bag.add(el.mat || 'lauze', fromTriangles(orientOutward(tris)));
}

// ── the portal ───────────────────────────────────────────────────────────────

/**
 * The tympanum of the Last Judgement over the west portal of Sainte-Foy (docs/buildings/sainte-foy-conques.md,
 * docs/settlements/conques.md §1a): a half-disc of some 6.7 × 3.6 m set back in the portal, carved in three
 * registers parted by inscribed bands and painted — blue on the side of Paradise (Christ's right, the
 * viewer's left), red on the side of Hell. { x (the face of the wall), zc, y (the lintel's underside), w, h }.
 * The figures face −x (west).
 *  - above: the cross held by two angels, the sun and moon, angels sounding horns;
 *  - in the middle: Christ in majesty in a starred mandorla; on his right the procession of the elect led by
 *    the Virgin and Saint Peter; on his left four angels and the torments of the damned;
 *  - below, under gabled roofs: Abraham among the just in the arcades of the heavenly Jerusalem and the
 *    gate of Paradise; the mouth of Hell, Satan enthroned among his demons; between the gables Saint
 *    Michael weighing a soul, the dead rising from their tombs and Sainte Foy kneeling to the hand of God;
 *  - round it the archivolts, with the little "curious" heads peering over the inner one.
 */
function tympanum(el, { bag }) {
  const { x, zc, y } = el, R = el.w / 2, lint = el.h - R, yb = y + lint, n = 32;
  const P = (u, v, d) => [x - d, yb + v, zc + u];
  // the field: the lintel and the half-disc, blue to the left of the axis and red to the right
  bag.add('limestone_yellow', box(x, y, zc - R, x + 0.5, yb, zc + R));
  for (const [t0, t1, mat] of [[Math.PI / 2, Math.PI, 'paint_blue'], [0, Math.PI / 2, 'wall_red']]) {
    const disc = [];
    for (let i = 0; i < n / 2; i++) {
      const a = t0 + (t1 - t0) * i / (n / 2), b = t0 + (t1 - t0) * (i + 1) / (n / 2);
      const Q = (r, t, xx) => [xx, yb + r * Math.sin(t), zc + r * Math.cos(t)];
      hexa(disc, [Q(0.001, a, x), Q(R, a, x), Q(R, b, x), Q(0.001, b, x)], [Q(0.001, a, x + 0.5), Q(R, a, x + 0.5), Q(R, b, x + 0.5), Q(0.001, b, x + 0.5)]);
    }
    bag.add(mat, fromTriangles(disc));
  }
  const lintelPaint = []; hexa(lintelPaint, [P(-R, -lint, -0.001), P(0, -lint, -0.001), P(0, 0, -0.001), P(-R, 0, -0.001)], [P(-R, -lint, 0.02), P(0, -lint, 0.02), P(0, 0, 0.02), P(-R, 0, 0.02)]); bag.add('paint_blue', fromTriangles(lintelPaint));
  const lintelRed = []; hexa(lintelRed, [P(0, -lint, -0.001), P(R, -lint, -0.001), P(R, 0, -0.001), P(0, 0, -0.001)], [P(0, -lint, 0.02), P(R, -lint, 0.02), P(R, 0, 0.02), P(0, 0, 0.02)]); bag.add('wall_red', fromTriangles(lintelRed));
  const halfAt = (v) => Math.sqrt(Math.max(0, R * R - v * v));
  // a bar in the field's plane between two points (u, v), width w, standing out d
  const bar = (out, a, b, w, d0, d1) => {
    const tu = b[0] - a[0], tv = b[1] - a[1], Ln = Math.hypot(tu, tv) || 1, pu = -tv / Ln * w / 2, pv = tu / Ln * w / 2;
    hexa(out, [P(a[0] - pu, a[1] - pv, d0), P(a[0] + pu, a[1] + pv, d0), P(b[0] + pu, b[1] + pv, d0), P(b[0] - pu, b[1] - pv, d0)], [P(a[0] - pu, a[1] - pv, d1), P(a[0] + pu, a[1] + pv, d1), P(b[0] + pu, b[1] + pv, d1), P(b[0] - pu, b[1] - pv, d1)]);
  };
  // a figure in high relief: a robe (flattened lathe) standing at (u, v), h tall, a head; a halo, wings, horns, a crown
  const place = (g, u, v, d, sx = 0.6) => { g.scale(sx, 1, 1); g.translate(x - d, yb + v, zc + u); return g; };
  const fig = (u, v, h, robe, o = {}) => {
    const r = 0.14 * h, d = o.d ?? 0.12;
    if (o.lying) {
      const g = lathe([[0.001, 0], [r * 0.9, 0.1 * h], [r, 0.6 * h], [r * 0.7, 0.8 * h], [0.001, 0.82 * h]], 8, null, 0, 0, 0);
      g.rotateX(o.lying * Math.PI / 2); bag.add(robe, place(g, u, v + r * 0.8, d + r * 0.3));
      bag.add('ivory', place(lathe([[0.001, 0], [0.065 * h, 0.03 * h], [0.065 * h, 0.12 * h], [0.001, 0.15 * h]], 8, null, 0, 0, 0), u + o.lying * 0.88 * h, v + r * 0.8 - 0.075 * h, d + r * 0.3));
      return;
    }
    if (o.seat) {
      bag.add(o.throne || 'paint_ochre', box(x - d - r * 0.8, yb + v, zc + u - r * 1.6, x - d + r * 0.8, yb + v + 0.32 * h, zc + u + r * 1.6));
      bag.add(robe, place(lathe([[r * 1.5, 0], [r * 1.45, 0.3 * h], [r * 1.05, 0.42 * h], [r * 0.95, 0.68 * h], [r * 0.6, 0.78 * h], [0.001, 0.8 * h]], 10, null, 0, 0, 0), u, v + 0.02 * h, d + r * 0.5));
    } else {
      bag.add(robe, place(lathe([[r * 1.05, 0], [r, 0.08 * h], [r * 0.82, 0.5 * h], [r * 0.95, 0.72 * h], [r * 0.6, 0.8 * h], [0.001, 0.81 * h]], 10, (t, i) => (i > 0 && i < 3 ? 1 + 0.06 * Math.cos(7 * t) : 1), 0, 0, 0), u, v, d));
    }
    const hy = v + 0.8 * h, skin = o.skin || 'ivory';
    bag.add(skin, place(lathe([[0.001, 0], [0.07 * h, 0.03 * h], [0.072 * h, 0.12 * h], [0.045 * h, 0.18 * h], [0.001, 0.19 * h]], 8, null, 0, 0, 0), u, hy, d + 0.01, 0.9));
    if (o.halo) { const g = lathe([[0.13 * h, 0], [0.13 * h, 0.025], [0.001, 0.025]], 16, null, 0, 0, 0); g.rotateZ(Math.PI / 2); g.translate(x - d + r * 0.62, yb + hy + 0.1 * h, zc + u); bag.add('gold', g); }
    if (o.crown) bag.add('gold', place(lathe([[0.075 * h, 0], [0.085 * h, 0.07 * h], [0.06 * h, 0.07 * h], [0.06 * h, 0.01]], 8, (t, i) => (i === 1 ? 1 + 0.2 * Math.max(0, Math.cos(4 * t)) : 1), 0, 0, 0), u, hy + 0.15 * h, d + 0.01, 0.9));
    if (o.horns) for (const s of [-1, 1]) bag.add(skin, place(lathe([[0.025 * h, 0], [0.001, 0.12 * h]], 5, null, 0, 0, 0).rotateX(s * 0.5), u + s * 0.05 * h, hy + 0.14 * h, d + 0.01, 1));
    if (o.wings) {
      const w = [];
      for (const s of [-1, 1]) { const a = [u + s * r * 0.5, v + 0.74 * h], b = [u + s * 0.34 * h, v + 1.02 * h], c = [u + s * 0.2 * h, v + 0.28 * h]; hexa(w, [P(...a, d - r * 0.35), P(...b, d - r * 0.35), P(...c, d - r * 0.35), P(...c, d - r * 0.35)], [P(...a, d - r * 0.35 - 0.04), P(...b, d - r * 0.35 - 0.04), P(...c, d - r * 0.35 - 0.04), P(...c, d - r * 0.35 - 0.04)]); }
      bag.add(o.wingMat || 'gold', fromTriangles(w));
    }
    if (o.staff) { const g = []; bar(g, [u + o.staff * r * 1.1, v + 0.1 * h], [u + o.staff * r * 1.25, v + 1.05 * h], 0.03, d + r * 0.3, d + r * 0.3 + 0.04); bag.add(o.staffMat || 'gold', fromTriangles(g)); }
  };

  // ── the bands: the gabled roofs of the lowest register, the ground of the middle one, the band under the top ──
  const bands = [], Vg = 0.95, Vr = 1.5, Vm = 2.32, hw0 = 0.2;
  for (const s of [-1, 1]) {
    const e = s * (R - 0.05), m = s * (R / 2 + hw0 / 2), i0 = s * hw0;
    bar(bands, [i0, Vg], [m, Vg + 0.5], 0.12, -0.03, 0.14); bar(bands, [m, Vg + 0.5], [e * 0.985, Vg], 0.12, -0.03, 0.14);   // the gable
    bar(bands, [i0, -lint + 0.02], [i0, Vg], 0.1, -0.03, 0.14);                                                           // the post by the gate
    bar(bands, [s * 0.92, Vr], [s * halfAt(Vr) * 0.99, Vr], 0.11, -0.03, 0.12);                                            // the ground of the middle register
    bar(bands, [s * 0.66, Vm], [s * halfAt(Vm) * 0.99, Vm], 0.12, -0.03, 0.12);                                            // the band under the top register
  }
  bag.add('paint_ochre', fromTriangles(bands));
  // the arcades of the heavenly Jerusalem (left), the towers of its wall; the gate of Paradise, its door ajar
  const arc = [];
  for (let k = 0; k <= 6; k++) { const u = -0.5 - k * 0.45; bar(arc, [u, -lint + 0.02], [u, 0.68], 0.06, -0.02, 0.1); }
  for (let k = 0; k < 6; k++) { const u0 = -0.5 - k * 0.45, uc = u0 - 0.225; for (let q = 0; q < 6; q++) { const a = Math.PI * q / 6, b = Math.PI * (q + 1) / 6; bar(arc, [uc + 0.225 * Math.cos(a), 0.68 + 0.18 * Math.sin(a)], [uc + 0.225 * Math.cos(b), 0.68 + 0.18 * Math.sin(b)], 0.05, -0.02, 0.1); } }
  bag.add('limestone_yellow', fromTriangles(arc));
  bag.add('paint_ochre', box(x - 0.16, yb - lint + 0.02, zc - 0.48, x - 0.02, yb + 0.6, zc - 0.36));            // the door of Paradise, open
  bag.add('iron', box(x - 0.19, yb + 0.15, zc - 0.47, x - 0.16, yb + 0.2, zc - 0.37));
  bag.add('iron', box(x - 0.19, yb + 0.42, zc - 0.47, x - 0.16, yb + 0.47, zc - 0.37));
  // Abraham enthroned with two souls on his lap, the just standing under the arches
  fig(-1.85, -lint + 0.04, 0.95, 'paint_ochre', { seat: true, halo: true, d: 0.16 });
  for (const s of [-0.12, 0.12]) fig(-1.85 + s, -lint + 0.42, 0.32, 'linen', { d: 0.3 });
  for (const u of [-0.72, -1.17, -2.52, -2.97]) fig(u, -lint + 0.04, 0.82, ['linen', 'paint_ochre', 'wall_red', 'linen'][Math.round(-u * 7) % 4], { halo: true, crown: u < -2.5 });
  // Hell (right): the mouth of Leviathan at the gate swallowing the damned; Satan enthroned; demons at their work
  const mouth = [];
  hexa(mouth, [P(0.24, 0.2, -0.02), P(0.24, 0.85, -0.02), P(0.95, 0.75, -0.02), P(0.95, 0.4, -0.02)], [P(0.24, 0.2, 0.3), P(0.24, 0.85, 0.3), P(0.95, 0.75, 0.22), P(0.95, 0.4, 0.22)]);       // the head
  hexa(mouth, [P(0.24, -lint + 0.02, -0.02), P(0.24, 0.12, -0.02), P(0.9, 0.3, -0.02), P(0.9, -lint + 0.02, -0.02)], [P(0.24, -lint + 0.02, 0.26), P(0.24, 0.12, 0.26), P(0.9, 0.3, 0.2), P(0.9, -lint + 0.02, 0.2)]);   // the lower jaw
  bag.add('pottery_dark', fromTriangles(mouth));
  bag.add('ivory', lathe([[0.001, 0], [0.06, 0.02], [0.06, 0.08], [0.001, 0.1]], 8, null, x - 0.32, yb + 0.6, zc + 0.62));   // the beast's eye
  const teeth = []; for (let k = 0; k < 4; k++) { const u = 0.32 + k * 0.15; bar(teeth, [u, 0.2], [u + 0.03, 0.08], 0.05, 0.02, 0.24); bar(teeth, [u, 0.12], [u + 0.03, 0.22], 0.05, 0.02, 0.22); } bag.add('ivory', fromTriangles(teeth));
  fig(0.42, 0.24, 0.36, 'linen', { lying: 1, d: 0.2 });
  fig(1.85, -lint + 0.04, 1.0, 'pottery_dark', { seat: true, horns: true, skin: 'pottery_dark', throne: 'pottery_dark', d: 0.17 });
  for (const [u, v, h, o] of [[1.2, -lint + 0.04, 0.78, { horns: true, skin: 'pottery_dark', staff: 1, staffMat: 'iron' }], [2.45, -lint + 0.04, 0.8, { horns: true, skin: 'pottery_dark', staff: -1, staffMat: 'iron' }], [2.95, -lint + 0.04, 0.62, { horns: true, skin: 'pottery_dark' }]]) fig(u, v, h, 'pottery_dark', o);
  for (const u of [1.52, 2.17, 2.7]) fig(u, -lint + 0.04, 0.5, 'ivory', { d: 0.26 });                                   // the damned, naked
  // between the gables: Saint Michael with the scales, a devil pulling at the other pan
  fig(-0.1, Vg + 0.02, 0.62, 'linen', { wings: true, halo: true, d: 0.14 });
  const sc = []; bar(sc, [-0.42, Vg + 0.52], [0.36, Vg + 0.52], 0.03, 0.18, 0.22); for (const s of [-0.42, 0.36]) { bar(sc, [s, Vg + 0.52], [s, Vg + 0.34], 0.015, 0.19, 0.21); bar(sc, [s - 0.09, Vg + 0.32], [s + 0.09, Vg + 0.32], 0.03, 0.16, 0.24); } bag.add('gold', fromTriangles(sc));
  fig(0.5, Vg + 0.02, 0.5, 'pottery_dark', { horns: true, skin: 'pottery_dark', d: 0.14 });
  // the dead rising from their tombs (left of the weighing), Sainte Foy before the hand of God at the far left
  for (const u of [-0.75, -1.25, -1.75]) {
    const lv = Vg + 0.5 * (1 - Math.abs(u + R / 2 + hw0 / 2) / (R / 2 - hw0 / 2)) + 0.08;
    bag.add('limestone_yellow', box(x - 0.24, yb + lv, zc + u - 0.2, x - 0.04, yb + lv + 0.12, zc + u + 0.2));
    fig(u, lv + 0.1, 0.34, 'linen', { d: 0.14 });
  }
  fig(-2.5, Vg + 0.08, 0.42, 'paint_ochre', { halo: true, d: 0.14 });
  bag.add('ivory', box(x - 0.16, yb + Vg + 0.5, zc - 2.25, x - 0.06, yb + Vg + 0.56, zc - 2.12));
  // ── the middle register: Christ in his mandorla, the elect on his right, the angels and the damned on his left ──
  const mc = 1.78, ma = 0.88, mb = 0.62, mand = [], stars = [];
  for (let i = 0; i < 28; i++) {
    const a = 2 * Math.PI * i / 28, b = 2 * Math.PI * (i + 1) / 28;
    const E = (t, k) => [mb * k * Math.cos(t), mc + ma * k * Math.sin(t)];
    bar(mand, E(a, 1), E(b, 1), 0.09, -0.02, 0.16);
    bar(mand, E(a, 0.9), E(b, 0.9), 0.04, -0.02, 0.12);
  }
  bag.add('gold', fromTriangles(mand));
  { const g = lathe([[1, 0], [1, 0.02], [0.001, 0.02]], 28, null, 0, 0, 0); g.rotateZ(Math.PI / 2); g.scale(1, ma * 0.9, mb * 0.9); g.translate(x - 0.008, yb + mc, zc); bag.add('paint_blue', g); }
  for (const [u, v] of [[-0.42, 2.1], [0.42, 2.1], [-0.46, 1.5], [0.46, 1.5], [-0.3, 2.45], [0.3, 2.45], [-0.32, 1.1], [0.32, 1.1]]) stars.push(...box(x - 0.05, yb + v - 0.035, zc + u - 0.035, x - 0.01, yb + v + 0.035, zc + u + 0.035).attributes.position.array);
  bag.add('gold', fromTriangles(stars));
  fig(0, mc - 0.62, 1.36, 'linen', { seat: true, halo: true, throne: 'gold', d: 0.18 });
  { const g = []; bar(g, [0.18, mc + 0.05], [0.24, mc + 0.42], 0.06, 0.32, 0.38); bar(g, [-0.18, mc - 0.05], [-0.26, mc - 0.32], 0.06, 0.32, 0.38); bag.add('ivory', fromTriangles(g)); }   // the raised and the lowered hand
  for (const s of [-1, 1]) fig(s * 0.34, Vg + 0.02, 0.3, 'linen', { wings: true, d: 0.2 });                                      // the angels with candles at his feet
  // the elect: the Virgin, Saint Peter with the keys, the hermit Dadon, the abbot leading Charlemagne, the saints
  const elect = [['paint_blue', { halo: true }], ['paint_ochre', { halo: true, staff: 1 }], ['pottery_dark', {}], ['linen', { staff: -1 }], ['wall_red', { crown: true }], ['paint_ochre', { halo: true }], ['linen', { halo: true }], ['wall_red', { halo: true }]];
  elect.forEach(([robe, o], k) => { const u = -0.95 - k * 0.24, h = Math.min(0.78, (halfAt(Vr + 0.8) > -u ? 0.78 : 0.6)); if (-u + 0.1 < halfAt(Vr + h)) fig(u, Vr + 0.04, h, robe, { ...o, d: 0.12 + (k % 2) * 0.08 }); });
  // the four angels by the throne (the book, the censer, the lance, the sword), then the damned and their devils
  [[0.95, 'linen'], [1.22, 'paint_blue'], [1.49, 'linen'], [1.76, 'paint_blue']].forEach(([u, robe], k) => fig(u, Vr + 0.04, 0.72, robe, { wings: true, halo: true, staff: k > 1 ? 1 : 0, staffMat: k === 3 ? 'iron' : 'gold', d: 0.13 + (k % 2) * 0.06 }));
  for (const [u, robe, o] of [[2.05, 'pottery_dark', { horns: true, skin: 'pottery_dark' }], [2.3, 'linen', {}], [2.52, 'pottery_dark', { horns: true, skin: 'pottery_dark', staff: -1, staffMat: 'iron' }]]) if (u + 0.1 < halfAt(Vr + 0.7)) fig(u, Vr + 0.04, 0.68, robe, { ...o, d: 0.14 });

  // ── the top register: the cross with the nails and the lance held by angels, the sun and moon, the horns of the Judgement ──
  const cr = []; bar(cr, [0, mc + ma + 0.02], [0, 3.22], 0.13, -0.02, 0.18); bar(cr, [-0.72, 2.98], [0.72, 2.98], 0.13, -0.02, 0.18); bag.add('gold', fromTriangles(cr));
  for (const s of [-1, 1]) {
    fig(s * 0.92, Vm + 0.04, 0.68, 'linen', { wings: true, halo: true, d: 0.14 });
    const disc = lathe([[0.13, 0], [0.13, 0.04], [0.001, 0.04]], 16, null, 0, 0, 0); disc.rotateZ(Math.PI / 2); disc.translate(x - 0.12, yb + 3.0, zc + s * 0.52); bag.add(s < 0 ? 'gold' : 'ivory', disc);
    const u0 = s * 1.55; if (Math.abs(u0) + 0.2 < halfAt(Vm + 0.6)) { fig(u0, Vm + 0.04, 0.6, 'paint_blue', { wings: true, d: 0.14 }); const g = []; bar(g, [u0 + s * 0.06, Vm + 0.5], [u0 + s * 0.42, Vm + 0.62], 0.05, 0.18, 0.24); bag.add('ivory', fromTriangles(g)); }
  }

  // ── the archivolts: three rings of voussoirs round the tympanum, stepping out; the curious heads over the inner one ──
  for (let k = 0; k < 3; k++) {
    const r0 = R + 0.05 + k * 0.32, r1 = r0 + 0.3, d0 = x - 0.25 - k * 0.35, d1 = x + 0.5;
    const out = [];
    for (let i = 0; i < 24; i++) {
      const a = Math.PI * i / 24, b = Math.PI * (i + 1) / 24;
      const Q = (r, t, xx) => [xx, yb + r * Math.sin(t), zc + r * Math.cos(t)];
      hexa(out, [Q(r0, a, d0), Q(r1, a, d0), Q(r1, b, d0), Q(r0, b, d0)], [Q(r0, a, d1), Q(r1, a, d1), Q(r1, b, d1), Q(r0, b, d1)]);
    }
    bag.add(k === 1 ? 'sandstone_red' : 'limestone_yellow', fromTriangles(out));
  }
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * (0.12 + 0.76 * i / 8), r = R + 0.12;
    bag.add('limestone_yellow', lathe([[0.001, 0], [0.075, 0.03], [0.08, 0.1], [0.05, 0.15], [0.001, 0.16]], 8, null, x - 0.3, yb + r * Math.sin(a) - 0.02, zc + r * Math.cos(a)));
  }
}

/** An iron grille between two points { a [x, z], b, y0, y1, step }: bars and rails. */
function grille(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), y0 = el.y0 ?? 0, y1 = el.y1 ?? 2.4;
  const ux = (bx - ax) / L, uz = (bz - az) / L, st = el.step ?? 0.16;
  const parts = [];
  for (let s = 0; s <= L; s += st) {
    const x = ax + ux * s, z = az + uz * s;
    parts.push(box(x - 0.015, y0, z - 0.015, x + 0.015, y1, z + 0.015));
  }
  for (const yy of [y0 + 0.1, (y0 + y1) / 2, y1 - 0.05]) {
    const g = lathe([[0.03, 0], [0.03, L]], 6, null, 0, 0, 0);
    g.rotateZ(-Math.PI / 2); g.rotateY(-Math.atan2(uz, ux)); g.translate(ax, yy, az);
    parts.push(g);
  }
  for (const p of parts) bag.add('iron', p);
  col.segment(el.a, el.b, 0.1, y0, y1);
}

// ── objects ──────────────────────────────────────────────────────────────────

/** The reliquary statue of Sainte Foy: a small seated figure in gold on a pillar { at, y }. */
function reliquary(el, { bag, col }) {
  const [x, z] = el.at, y = el.y;
  bag.add('limestone_yellow', box(x - 0.35, y, z - 0.35, x + 0.35, y + 1.2, z + 0.35));
  bag.add('gold', box(x - 0.22, y + 1.2, z - 0.2, x + 0.22, y + 1.55, z + 0.2));               // the throne
  bag.add('gold', lathe([[0.17, 0], [0.15, 0.35], [0.1, 0.45], [0.001, 0.46]], 10, null, x, y + 1.55, z));
  bag.add('gold', lathe([[0.001, 0], [0.09, 0.05], [0.1, 0.16], [0.07, 0.24], [0.001, 0.26]], 10, null, x, y + 2.0, z));
  col.rect([x - 0.35, z - 0.35, x + 0.35, z + 0.35], y, y + 2.3);
}

/** The cloister's basin of green serpentine, round, on a low step { at, y, d }. */
function basin(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, r = (el.d ?? 2.72) / 2;
  bag.add('limestone_yellow', lathe([[r + 0.5, 0], [r + 0.5, 0.18], [r + 0.2, 0.18], [r + 0.2, 0.2]], 24, null, x, y, z));
  bag.add('serpentine', lathe([[r * 0.25, 0.2], [r * 0.3, 0.35], [r * 0.95, 0.55], [r, 0.85], [r * 0.92, 0.85], [r * 0.9, 0.5], [r * 0.2, 0.42]], 24, null, x, y, z));
  bag.add('water', lathe([[r * 0.9, 0.72], [0.001, 0.72]], 24, null, x, y, z));
  col.circle(x, z, r, y, y + 0.85);
}

/**
 * west_gable: the gable of a west front { x0, x1 (its thickness along x), w (half its width in z), y0 (the
 * eave), y1 (the ridge), mat }: a stone triangle with a coping stepping out along both slopes, a cross at
 * the apex, and a corbel table (a row of small carved corbels under a moulding) along its foot.
 */
function westGable(el, { bag }) {
  const { x0, x1, w, y0, y1 } = el, m = el.mat || 'limestone_yellow';
  const tri = [];
  const P = (x, z, y) => [x, y, z];
  const A = [P(x0, -w, y0), P(x0, w, y0), P(x0, 0, y1)], B = [P(x1, -w, y0), P(x1, w, y0), P(x1, 0, y1)];
  tri.push(...A[0], ...A[2], ...A[1], ...B[0], ...B[1], ...B[2]);
  for (const [i, j] of [[0, 2], [2, 1], [1, 0]]) tri.push(...A[i], ...B[i], ...B[j], ...A[i], ...B[j], ...A[j]);
  bag.add(m, fromTriangles(orientOutward(tri)));
  // the coping: a slab along each slope, standing out a little
  const sl = Math.atan2(y1 - y0, w), c = [];
  for (const s of [-1, 1]) {
    const ox = 0.12, t = 0.28, nz = s * Math.sin(sl) * t, ny = Math.cos(sl) * t;
    const b0 = [x0 - ox, y0, s * w], b1 = [x0 - ox, y1, 0], b2 = [x1 + ox, y1, 0], b3 = [x1 + ox, y0, s * w];
    const up = (q) => [q[0], q[1] + ny, q[2] + nz];
    const bb = [b0, b1, b2, b3].map((q) => [q[0], q[1], q[2]]), tt = bb.map(up);
    const q = (a, b2_, cc, d) => c.push(...a, ...b2_, ...cc, ...a, ...cc, ...d);
    q(bb[0], bb[1], bb[2], bb[3]); q(tt[0], tt[3], tt[2], tt[1]); q(bb[0], tt[0], tt[1], bb[1]); q(bb[3], bb[2], tt[2], tt[3]); q(bb[0], bb[3], tt[3], tt[0]); q(bb[1], tt[1], tt[2], bb[2]);
  }
  bag.add(m, fromTriangles(orientOutward(c)));
  // the cross at the apex
  const xm = (x0 + x1) / 2;
  bag.add(m, box(xm - 0.15, y1 + 0.2, -0.12, xm + 0.15, y1 + 1.5, 0.12)); bag.add(m, box(xm - 0.15, y1 + 0.85, -0.5, xm + 0.15, y1 + 1.1, 0.5));
  // the corbel table along the foot: corbels, then a moulding over them
  const n = Math.max(6, Math.round(2 * w / 0.9));
  for (let k = 0; k <= n; k++) { const z = -w + 0.2 + k * (2 * w - 0.4) / n; bag.add(m, box(x0 - 0.35, y0 - 0.55, z - 0.13, x0, y0 - 0.2, z + 0.13)); bag.add(m, box(x0 - 0.28, y0 - 0.75, z - 0.1, x0, y0 - 0.55, z + 0.1)); }
  bag.add(m, box(x0 - 0.42, y0 - 0.2, -w - 0.3, x0, y0, w + 0.3));
}


/** bourdon: a pilgrim's staff held upright { at [x, z] (the foot), y, h }: an ash staff with an iron ferrule, a knob, a gourd for water tied below the knob. */
function bourdon(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 1.85;
  bag.add('iron', lathe([[0.022, 0], [0.024, 0.08], [0.02, 0.1]], 6, null, x, y, z));
  bag.add('timber', lathe([[0.02, 0], [0.018, h - 0.18]], 6, null, x, y + 0.1, z));
  bag.add('timber', lathe([[0.018, 0], [0.04, 0.05], [0.04, 0.12], [0.001, 0.16]], 8, null, x, y + h - 0.1, z));
  bag.add('wood_ochre', lathe([[0.001, 0], [0.06, 0.04], [0.065, 0.1], [0.035, 0.15], [0.045, 0.2], [0.025, 0.25], [0.001, 0.26]], 8, null, x + 0.05, y + h - 0.52, z));
}

registerStyle('romanesque', {
  column,
  trim: () => {},
  opening: () => {},
  elements: { ...byzantineElements, barrel, pier, gable_roof: gableRoof, lean_roof: leanRoof, cone_roof: coneRoof, pyramid_roof: pyramidRoof, tympanum, grille, west_gable: westGable, bourdon },
  objects: { doors, reliquary, basin },
});
