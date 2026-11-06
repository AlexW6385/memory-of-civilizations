// The Baptistery of San Giovanni as it stood about 1480 (docs/settlements/florence.md §4b): the
// octagon of white Carrara and green Prato marble in three registers — below, each face parted by
// green pilasters into three bays of framed panels; in the middle, three round blind arches on
// pilasters, each with an aedicule window under a pediment, triangular and round by turns; the
// attic with its striped pilasters and its small windows — the corner pilasters banded white and
// green from the ground to the cornice (Arnolfo's of 1293), the lion heads under the corners of the
// roof; the low octagonal pyramid of white marble and the lantern of about 1150; the rectangular
// scarsella on the west. The three bronze doors: on the east, toward the cathedral, Ghiberti's Gate
// of Paradise (1425–52), entirely gilt — ten square panels of Old Testament scenes in five rows,
// statuettes in the niches of the frame, heads between them, the outer frame of foliage and fruit;
// on the north Ghiberti's first door (1403–24) and on the south Andrea Pisano's (1330–36), each of
// 28 quatrefoils in seven rows of four on bronze, the figures and the heads at the crossings gilt.
// The groups over the doors are later (Sansovino 1502, Rustici 1506, Danti 1571) and not shown.
//
// The faces are built in their own frames (u along the face left to right seen from outside, y up,
// d outward) and merged per material: Florence has no mesh to spare for an instanced shape.

import { Matrix4 } from '../../core/three.js';
import { box, lathe, rod } from '../../core/geom.js';
import { Local, ext, archOutline, headPts } from './face.js';
import { ball, limb, T } from '../qing/carving.js';

const M = 'marble', G = 'verde_antico', GB = 'gilt_bronze', BR = 'bronze', O = 'opening', PINK = 'marble_pink';
const C8 = Math.cos(Math.PI / 8), T8 = Math.tan(Math.PI / 8);

/** The frame of face k (outward normal at angle k·45° from +x, toward +z) of an octagon of apothem a round (cx, cz). */
function octFace(cx, cz, a, k, y) {
  const th = k * Math.PI / 4, nx = Math.cos(th), nz = Math.sin(th), ux = nz, uz = -nx, L = 2 * a * T8;
  const ox = cx + nx * a - ux * L / 2, oz = cz + nz * a - uz * L / 2;
  const Mx = new Matrix4().set(ux, 0, nx, ox, 0, 1, 0, y, uz, 0, nz, oz, 0, 0, 0, 1);
  return { M: Mx, L };
}
/** An octagonal prism (faces toward the axes) of apothem a0 (outer) with an optional hole of apothem a1, y0..y1, round (cx, cz). */
function octRing(bag, mat, cx, cz, a0, a1, y0, y1) {
  const pts = (a) => { const r = a / C8, p = []; for (let k = 0; k < 8; k++) { const t = Math.PI / 8 + k * Math.PI / 4; p.push([cx + Math.cos(t) * r, -(cz + Math.sin(t) * r)]); } return p; };
  const g = ext(pts(a0), a1 > 0 ? [pts(a1).reverse()] : [], y0, y1, 1);
  g.rotateX(-Math.PI / 2);
  bag.add(mat, g);
}
/** A plan polygon [[x, z], …] extruded from y0 to y1. */
function plan(mat, pts, y0, y1) { const g = ext(pts.map(([x, z]) => [x, -z]), [], y0, y1, 1); g.rotateX(-Math.PI / 2); return g; }

/** A small relief figure, standing, h tall, facing +z, flattened to depth dz (cheap: body, head, arms). */
function reliefFigure(Lc, mat, x, y, z, h, dz, v) {
  const s = (v % 3) - 1, lean = s * 0.06 * h;
  const pieces = [
    limb([0, 0, 0], [lean, h * 0.78, 0], h * 0.17, h * 0.08, 5),
    T(ball(h * 0.075, h * 0.09, h * 0.075, 5, 3), lean * 1.1, h * 0.88, 0),
    v % 2 ? limb([lean + h * 0.08, h * 0.72, 0], [lean + h * (0.14 + 0.08 * s), h * 0.75, h * 0.04], h * 0.03, h * 0.025, 4)
      : limb([lean - h * 0.08, h * 0.72, 0], [lean - h * 0.13, h * 0.48, h * 0.03], h * 0.03, h * 0.025, 4),
  ];
  for (const g of pieces) { g.scale(1, 1, dz / (h * 0.34)); g.translate(x, y, z); Lc.add(mat, g); }
}
/** A head in a roundel (a bust at a crossing of the frame), facing +z. */
function head(Lc, mat, x, y, z, r) {
  Lc.add(mat, T(ball(r * 0.62, r * 0.75, r * 0.5, 5, 3), x, y + r * 0.1, z + r * 0.25));
  Lc.add(mat, lathe([[r, 0], [r * 0.85, r * 0.3], [0.001, r * 0.3]], 8, null, 0, 0, 0).rotateX(Math.PI / 2).translate(x, y, z));
}

/** The Gate of Paradise in face frame Lc, centred at uc, from y0; the leaves 2 × w0 by hh. Everything gilt. */
function gateOfParadise(Lc, uc, y0, w0, hh) {
  const W = 2 * w0, rows = 5, bar = 0.17, side = 0.2, ph = (hh - (rows + 1) * bar) / rows;
  // the outer frame of foliage and fruit, its heads at the corners
  const fw = 0.3, fo = 0.06;
  Lc.box(GB, uc - W / 2 - fw, y0, fo, uc - W / 2, y0 + hh + fw, 0.16);
  Lc.box(GB, uc + W / 2, y0, fo, uc + W / 2 + fw, y0 + hh + fw, 0.16);
  Lc.box(GB, uc - W / 2, y0 + hh, fo, uc + W / 2, y0 + hh + fw, 0.16);
  const leafy = (x, y, k) => Lc.add(GB, T(ball(0.1 + 0.02 * (k % 2), 0.13, 0.05, 4, 3), x, y, 0.18));
  for (let yy = y0 + 0.12, k = 0; yy < y0 + hh + fw - 0.05; yy += 0.25, k++) { leafy(uc - W / 2 - fw / 2, yy, k); leafy(uc + W / 2 + fw / 2, yy, k + 1); }
  for (let uu = uc - W / 2 + 0.05, k = 0; uu < uc + W / 2; uu += 0.25, k++) leafy(uu + 0.03, y0 + hh + fw / 2, k);
  for (const leaf of [0, 1]) {
    const u0 = uc - W / 2 + leaf * w0, u1 = u0 + w0;
    Lc.box(GB, u0, y0, 0, u1, y0 + hh, 0.06);                                              // the ground of the leaf
    Lc.box(GB, u0, y0, 0.06, u0 + side, y0 + hh, 0.14); Lc.box(GB, u1 - side, y0, 0.06, u1, y0 + hh, 0.14);
    for (let r = 0; r <= rows; r++) { const yb = y0 + r * (ph + bar); Lc.box(GB, u0 + side, yb, 0.06, u1 - side, yb + bar, 0.13); }
    for (let r = 0; r < rows; r++) {
      const yb = y0 + bar + r * (ph + bar), pu0 = u0 + side + 0.03, pu1 = u1 - side - 0.03, k = (rows - 1 - r) * 2 + leaf;   // read left to right, top to bottom
      // the niches of the frame with their prophets and sibyls, both sides of the leaf
      for (const su of [u0 + side / 2, u1 - side / 2]) {
        Lc.add(GB, ext(archOutline(su, yb + 0.12, 0.13, yb + ph - 0.2, 'round', 5), [], 0.14, 0.145));
        reliefFigure(Lc, GB, su, yb + 0.16, 0.15, ph * 0.62, 0.05, k + (su > uc ? 1 : 0));
      }
      // the panel: the scene in perspective, the far things flattest — a building, a hill, the figures before them
      const pc = (pu0 + pu1) / 2, pw = pu1 - pu0;
      if (k % 3 !== 1) {
        const bw = pw * (0.35 + 0.1 * (k % 2)), bu = pc + (k % 2 ? -1 : 1) * pw * 0.2;
        Lc.box(GB, bu - bw / 2, yb + ph * 0.3, 0.06, bu + bw / 2, yb + ph * 0.82, 0.085);
        for (let i = 0; i < 3; i++) { const au = bu - bw / 2 + (i + 0.5) * bw / 3; Lc.add(GB, ext(archOutline(au, yb + ph * 0.34, bw / 3 - 0.04, yb + ph * 0.62, 'round', 4), [], 0.085, 0.1)); }
        Lc.add(GB, ext([[bu - bw / 2 - 0.02, yb + ph * 0.82], [bu + bw / 2 + 0.02, yb + ph * 0.82], [bu, yb + ph * 0.95]], [], 0.06, 0.09));
      } else {
        Lc.add(GB, T(ball(pw * 0.34, ph * 0.3, 0.03, 8, 4), pc - pw * 0.12, yb + ph * 0.45, 0.07));
        Lc.add(GB, T(ball(pw * 0.26, ph * 0.22, 0.03, 8, 4), pc + pw * 0.2, yb + ph * 0.4, 0.075));
      }
      const nf = 2 + (k % 3);
      for (let i = 0; i < nf; i++) reliefFigure(Lc, GB, pu0 + (i + 0.7) * pw / (nf + 0.4), yb + ph * 0.08, 0.085, ph * (0.5 - 0.04 * (i % 2)), 0.06, k + i);
      Lc.box(GB, pu0, yb, 0.06, pu1, yb + ph * 0.08, 0.1);                                  // the ground the figures stand on
    }
    // the heads at the crossings of the frame
    for (let r = 0; r <= rows; r++) for (const su of [u0 + side / 2, u1 - side / 2]) head(Lc, GB, su, y0 + r * (ph + bar) + bar / 2, 0.14, 0.085);
  }
}
/** A bronze door of 28 quatrefoils (seven rows of four over two leaves), the figures and heads gilt, centred at uc, from y0. */
function quatrefoilDoor(Lc, uc, y0, w0, hh, seed) {
  const W = 2 * w0, rows = 7, cols = 2, bar = 0.1, cw = (w0 - (cols + 1) * bar) / cols, ch = (hh - (rows + 1) * bar) / rows;
  Lc.box(BR, uc - W / 2 - 0.22, y0, 0.06, uc - W / 2, y0 + hh + 0.22, 0.15);
  Lc.box(BR, uc + W / 2, y0, 0.06, uc + W / 2 + 0.22, y0 + hh + 0.22, 0.15);
  Lc.box(BR, uc - W / 2, y0 + hh, 0.06, uc + W / 2, y0 + hh + 0.22, 0.15);
  for (const leaf of [0, 1]) {
    const u0 = uc - W / 2 + leaf * w0;
    Lc.box(BR, u0, y0, 0, u0 + w0, y0 + hh, 0.06);
    for (let c = 0; c <= cols; c++) Lc.box(BR, u0 + c * (cw + bar), y0, 0.06, u0 + c * (cw + bar) + bar, y0 + hh, 0.12);
    for (let r = 0; r <= rows; r++) Lc.box(BR, u0 + bar, y0 + r * (ch + bar), 0.06, u0 + w0 - bar, y0 + r * (ch + bar) + bar, 0.11);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const pu = u0 + bar + c * (cw + bar) + cw / 2, py = y0 + bar + r * (ch + bar) + ch / 2, s = Math.min(cw, ch) * 0.47, k = seed + r * 4 + leaf * 2 + c;
      // the Gothic compass: a quatrefoil in a lozenge, the frame gilt, the figures on the bronze within
      const out = [], inn = [];
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, rr = s * (0.72 + 0.28 * Math.abs(Math.cos(2 * a))); out.push([pu + Math.cos(a) * rr, py + Math.sin(a) * rr]); inn.push([pu + Math.cos(a) * rr * 0.84, py + Math.sin(a) * rr * 0.84]); }
      Lc.add(GB, ext(out, [inn.slice().reverse()], 0.06, 0.1));
      const lz = [[pu, py - s * 1.02], [pu + s * 1.02, py], [pu, py + s * 1.02], [pu - s * 1.02, py]], lz2 = lz.map(([a, b]) => [pu + (a - pu) * 0.9, py + (b - py) * 0.9]);
      Lc.add(BR, ext(lz, [lz2.reverse()], 0.06, 0.085));
      const nf = 1;
      for (let i = 0; i < nf; i++) reliefFigure(Lc, GB, pu + (nf === 1 ? 0 : (i - 0.5) * s * 0.7), py - s * 0.62, 0.07, s * (nf === 1 ? 1.2 : 1.05), 0.05, k + i);
    }
    for (let r = 1; r < rows; r++) for (let c = 1; c < cols; c++) head(Lc, GB, u0 + c * (cw + bar) + bar / 2, y0 + r * (ch + bar) + bar / 2, 0.11, 0.07);
  }
}

/** A banded corner pilaster round the corner at angle t (rad) of an octagon of apothem a, w along each face, projecting p, from y0 to y1 in bands of bh. */
function cornerPilaster(bag, cx, cz, a, t, w, p, y0, y1, bh) {
  // a point on face k's line (offset off outward) at distance s from the corner t; corner t is at the −U end of the
  // face before it (kA, whose normal is t − π/8) and at the +U end of the face after it (kB)
  const onFace = (k, off, s, before) => {
    const th = k * Math.PI / 4, nx = Math.cos(th), nz = Math.sin(th), ux = nz, uz = -nx, half = (a + off) * T8;
    const u = before ? -half + s : half - s;
    return [cx + nx * (a + off) + ux * u, cz + nz * (a + off) + uz * u];
  };
  const kA = Math.round((t - Math.PI / 8) / (Math.PI / 4)), kB = kA + 1;
  const R = (off) => (a + off) / C8, cp = (off) => [cx + Math.cos(t) * R(off), cz + Math.sin(t) * R(off)];
  const poly = [onFace(kA, -0.05, w, true), onFace(kA, p, w, true), cp(p), onFace(kB, p, w, false), onFace(kB, -0.05, w, false), cp(-0.05)];
  const n = Math.max(1, Math.round((y1 - y0) / bh));
  for (let i = 0; i < n; i++) bag.add(i % 2 ? G : M, plan(M, poly, y0 + i * (y1 - y0) / n, y0 + (i + 1) * (y1 - y0) / n));
}

/** baptistery: { c, a (apothem), h (to the top of the attic), y } — doors on the east, north and south, the scarsella on the west. */
export function baptistery(el, { bag, col }) {
  const [cx, cz] = el.c, a = el.a ?? (el.r ?? 13.5) * C8, h = el.h ?? 26, y = el.y ?? 0, L = 2 * a * T8;
  const y1 = y + h * 0.36, y2 = y + h * 0.72, cw = 0.75, pp = 0.22;
  const B = new Local();                                                                   // pieces in world coordinates
  // the core and its plinth, the cornices between the registers and at the top
  octRing(B, M, cx, cz, a, 0, y - 0.5, y + h);
  col.circle(cx, cz, a / C8 - 0.3, y, y + h);
  octRing(B, G, cx, cz, a + 0.3, a - 0.1, y - 0.3, y + 0.15);
  octRing(B, M, cx, cz, a + 0.36, a - 0.1, y + 0.15, y + 0.55);
  octRing(B, G, cx, cz, a + 0.12, a - 0.1, y1 - 0.75, y1 - 0.35);                          // the frieze over the lower register
  octRing(B, M, cx, cz, a + 0.42, a - 0.1, y1 - 0.35, y1);                                  // its cornice
  octRing(B, G, cx, cz, a + 0.12, a - 0.1, y2 - 0.6, y2 - 0.3);
  octRing(B, M, cx, cz, a + 0.4, a - 0.1, y2 - 0.3, y2);
  octRing(B, M, cx, cz, a + 0.5, a - 0.1, y + h - 0.45, y + h + 0.1);                       // the crowning cornice
  octRing(B, M, cx, cz, a + 0.62, a - 0.1, y + h + 0.1, y + h + 0.32);
  for (let k = 0; k < 8; k++) {
    const t = Math.PI / 8 + k * Math.PI / 4;
    cornerPilaster(B, cx, cz, a, t, cw, pp, y + 0.55, y + h - 0.45, 0.85);
    // the lion's head under the corner of the roof (the early Marzocco)
    const R = (a + 0.6) / C8, lx = cx + Math.cos(t) * R, lz = cz + Math.sin(t) * R;
    const lh = new Local();
    lh.add(M, T(ball(0.3, 0.32, 0.26, 8, 5), 0, 0, 0)); lh.add(M, T(ball(0.2, 0.2, 0.22, 7, 4), 0, -0.02, 0.2)); lh.add(M, T(ball(0.1, 0.08, 0.1, 6, 3), 0, -0.06, 0.38));
    for (const sx of [-1, 1]) lh.add(M, T(ball(0.07, 0.07, 0.05, 5, 3), sx * 0.14, 0.18, 0.15));
    for (const list of lh.m.values()) for (const g of list) { g.rotateY(Math.PI / 2 - t); g.translate(lx, y + h - 0.65, lz); B.add(M, g); }
    // modillions under the crowning cornice
    const { M: FM } = octFace(cx, cz, a, k, y), Lc = new Local();
    for (let u = cw + 0.3; u < L - cw - 0.2; u += 0.55) Lc.box(M, u - 0.1, h - 0.75, 0, u + 0.1, h - 0.45, 0.45);
    Lc.emit(bag, FM);
  }
  for (let k = 0; k < 8; k++) {
    const { M: FM } = octFace(cx, cz, a, k, y), Lc = new Local();
    const door = k === 0 ? 'paradise' : k === 2 ? 'pisano' : k === 6 ? 'ghiberti' : null, west = k === 4;
    const i0 = cw, i1 = L - cw, bw = (i1 - i0) / 3, pw = 0.55;
    // ── the lower register: two green pilasters on the face, three bays of framed panels (the door in the middle one)
    const yl0 = 0.55, yl1 = h * 0.36 - 0.75;
    for (const u of [i0 + bw, i0 + 2 * bw]) {
      Lc.box(G, u - pw / 2, yl0, 0, u + pw / 2, yl1 - 0.45, 0.14);
      Lc.box(M, u - pw / 2 - 0.08, yl0, 0, u + pw / 2 + 0.08, yl0 + 0.35, 0.2);
      Lc.box(M, u - pw / 2 - 0.1, yl1 - 0.45, 0, u + pw / 2 + 0.1, yl1, 0.22);
      for (let j = 0; j < 3; j++) Lc.box(M, u - pw / 2 + 0.05 + j * 0.16, yl1 - 0.42, 0.18, u - pw / 2 + 0.13 + j * 0.16, yl1 - 0.12, 0.25);   // the leaves of the capital
    }
    for (let b = 0; b < 3; b++) {
      const u0 = i0 + b * bw + (b ? pw / 2 : 0) + 0.15, u1 = i0 + (b + 1) * bw - (b < 2 ? pw / 2 : 0) - 0.15;
      if (b === 1 && door) continue;
      if (b === 1 && west) continue;
      const fr = (v0, v1, w0, w1, mat, d) => { Lc.box(mat, w0, v0, 0, w1, v0 + 0.14, d); Lc.box(mat, w0, v1 - 0.14, 0, w1, v1, d); Lc.box(mat, w0, v0 + 0.14, 0, w0 + 0.14, v1 - 0.14, d); Lc.box(mat, w1 - 0.14, v0 + 0.14, 0, w1, v1 - 0.14, d); };
      fr(yl0 + 0.6, yl1 - 0.6, u0, u1, G, 0.05);
      fr(yl0 + 1.1, yl1 - 1.1, u0 + 0.45, u1 - 0.45, G, 0.04);
      Lc.box(G, (u0 + u1) / 2 - 0.35, (yl0 + yl1) / 2 - 0.35, 0, (u0 + u1) / 2 + 0.35, (yl0 + yl1) / 2 + 0.35, 0.035);
    }
    // ── the middle register: three round blind arches on pilasters, an aedicule window in each
    const ym0 = h * 0.36, ym1 = h * 0.72 - 0.6, ys = ym0 + (ym1 - ym0) * 0.58;
    for (const u of [i0, i0 + bw, i0 + 2 * bw, i1]) {
      const edge = u === i0 ? 1 : u === i1 ? -1 : 0, u0 = edge === 1 ? u : u - pw / 2, u1 = edge === -1 ? u : u + pw / 2;
      Lc.box(G, u0, ym0, 0, u1, ys - 0.3, 0.12);
      Lc.box(M, u0 - (edge === 1 ? 0 : 0.08), ys - 0.3, 0, u1 + (edge === -1 ? 0 : 0.08), ys, 0.18);
    }
    for (let b = 0; b < 3; b++) {
      const uc = i0 + (b + 0.5) * bw, r = (bw - pw) / 2;
      Lc.add(G, ext(headPts(uc, ys, 2 * r + 0.5, 'round', 7).concat(headPts(uc, ys, 2 * r, 'round', 7).reverse()), [], 0, 0.1));
      Lc.add(M, ext(headPts(uc, ys, 2 * r + 0.75, 'round', 7).concat(headPts(uc, ys, 2 * r + 0.5, 'round', 7).reverse()), [], 0, 0.06));
      // the aedicule: the window, its frame, two colonnettes, the pediment (triangular and round by turns)
      const ww = 0.85, wy0 = ym0 + 1.9, wy1 = wy0 + 2.0, tri = (b + k) % 2 === 0;
      Lc.box(O, uc - ww / 2, wy0, 0.0, uc + ww / 2, wy1, 0.03);
      Lc.box(M, uc - ww / 2 - 0.2, wy0 - 0.2, 0, uc - ww / 2, wy1, 0.1); Lc.box(M, uc + ww / 2, wy0 - 0.2, 0, uc + ww / 2 + 0.2, wy1, 0.1);
      Lc.box(M, uc - ww / 2 - 0.35, wy0 - 0.35, 0, uc + ww / 2 + 0.35, wy0 - 0.2, 0.2);
      for (const sg of [-1, 1]) Lc.add(G, rod([uc + sg * (ww / 2 + 0.32), wy0 - 0.2, 0.14], [uc + sg * (ww / 2 + 0.32), wy1, 0.14], 0.07, 6));
      Lc.box(M, uc - ww / 2 - 0.45, wy1, 0, uc + ww / 2 + 0.45, wy1 + 0.18, 0.22);
      if (tri) { Lc.add(M, ext([[uc - ww / 2 - 0.5, wy1 + 0.18], [uc + ww / 2 + 0.5, wy1 + 0.18], [uc, wy1 + 0.8]], [], 0, 0.18)); Lc.add(G, ext([[uc - ww / 2 - 0.15, wy1 + 0.3], [uc + ww / 2 + 0.15, wy1 + 0.3], [uc, wy1 + 0.6]], [], 0.18, 0.2)); }
      else { Lc.add(M, ext(headPts(uc, wy1 + 0.18, ww + 1.0, 'round', 6), [], 0, 0.18)); Lc.add(G, ext(headPts(uc, wy1 + 0.3, ww + 0.4, 'round', 5), [], 0.18, 0.2)); }
      // below the window, the little blind arch in green
      Lc.add(G, ext(archOutline(uc, ym0 + 0.3, 1.1, ym0 + 1.0, 'round', 6), [archOutline(uc, ym0 + 0.3, 0.8, ym0 + 1.0, 'round', 6)], 0, 0.04));
    }
    // ── the attic: striped pilasters at the thirds, framed panels, a small window in the middle one
    const ya0 = h * 0.72, ya1 = h - 0.75;
    for (const u of [i0 + bw, i0 + 2 * bw]) { const n = 5; for (let j = 0; j < n; j++) Lc.box(j % 2 ? M : G, u - 0.25, ya0 + j * (ya1 - ya0) / n, 0, u + 0.25, ya0 + (j + 1) * (ya1 - ya0) / n, 0.12); }
    for (let b = 0; b < 3; b++) {
      const u0 = i0 + b * bw + (b ? 0.25 : 0) + 0.25, u1 = i0 + (b + 1) * bw - (b < 2 ? 0.25 : 0) - 0.25;
      Lc.box(G, u0, ya0 + 0.4, 0, u1, ya0 + 0.54, 0.05); Lc.box(G, u0, ya1 - 0.54, 0, u1, ya1 - 0.4, 0.05);
      Lc.box(G, u0, ya0 + 0.54, 0, u0 + 0.14, ya1 - 0.54, 0.05); Lc.box(G, u1 - 0.14, ya0 + 0.54, 0, u1, ya1 - 0.54, 0.05);
      if (b === 1) { const wc = (u0 + u1) / 2, wy = (ya0 + ya1) / 2; Lc.box(O, wc - 0.35, wy - 0.55, 0, wc + 0.35, wy + 0.55, 0.03); Lc.box(M, wc - 0.5, wy - 0.7, 0, wc + 0.5, wy - 0.55, 0.1); Lc.box(M, wc - 0.5, wy + 0.55, 0, wc + 0.5, wy + 0.7, 0.1); for (const sg of [-1, 1]) Lc.box(M, wc + sg * 0.35 - (sg > 0 ? 0 : 0.15), wy - 0.55, 0, wc + sg * 0.35 + (sg > 0 ? 0.15 : 0), wy + 0.55, 0.1); }
      else { const pc = (u0 + u1) / 2, pv = (ya0 + ya1) / 2; Lc.add(PINK, ext([[pc, pv - 0.8], [pc + 0.6, pv], [pc, pv + 0.8], [pc - 0.6, pv]], [], 0, 0.04)); }
    }
    // ── the doors in their marble portals
    if (door) {
      const uc = L / 2, w0 = 1.5, hh = 5.0, dy = 0.3;
      Lc.box(M, uc - w0 - 0.8, -0.1, 0, uc + w0 + 0.8, dy, 1.0);                             // the threshold step
      Lc.box(M, uc - w0 - 0.75, dy, 0, uc - w0 - (door === 'paradise' ? 0.3 : 0.22), dy + hh + 0.9, 0.42);
      Lc.box(M, uc + w0 + (door === 'paradise' ? 0.3 : 0.22), dy, 0, uc + w0 + 0.75, dy + hh + 0.9, 0.42);
      Lc.box(M, uc - w0 - 0.75, dy + hh + 0.3 + (door === 'paradise' ? 0 : -0.08), 0, uc + w0 + 0.75, dy + hh + 0.9, 0.42);
      Lc.box(G, uc - w0 - 0.95, dy + hh + 0.9, 0, uc + w0 + 0.95, dy + hh + 1.15, 0.5);
      Lc.box(M, uc - w0 - 1.1, dy + hh + 1.15, 0, uc + w0 + 1.1, dy + hh + 1.45, 0.6);
      if (door === 'paradise') gateOfParadise(Lc, uc, dy, w0, hh);
      else quatrefoilDoor(Lc, uc, dy, w0, hh, door === 'pisano' ? 0 : 3);
      col.floor(octRectOf(FM, uc - w0 - 0.8, 0, uc + w0 + 0.8, 1.0), y + dy);
    }
    Lc.emit(bag, FM);
    // the scarsella: the rectangular apse on the west, in the same marble skin
    if (west) {
      const sw = 7.6, sd = 5.4, sh = h * 0.55, S = new Local(), u0 = (L - sw) / 2, u1 = (L + sw) / 2;
      S.box(M, u0, -0.5, -0.4, u1, sh, sd);
      S.box(G, u0 - 0.2, -0.3, -0.2, u1 + 0.2, 0.15, sd + 0.2); S.box(M, u0 - 0.25, sh - 0.4, -0.2, u1 + 0.25, sh + 0.2, sd + 0.25);
      for (let j = 0; j < Math.round(sh / 0.62); j++) for (const uu of [u0, u1 - 0.55]) S.box(j % 2 ? G : M, uu - 0.05, 0.15 + j * (sh - 0.55) / Math.round(sh / 0.62), sd - 0.5, uu + 0.6, 0.15 + (j + 1) * (sh - 0.55) / Math.round(sh / 0.62), sd + 0.1);
      // its back and sides: green-framed panels in two storeys, a round window high in the back
      for (const [v0, v1] of [[0.6, sh * 0.48], [sh * 0.52, sh - 0.6]]) {
        for (let b2 = 0; b2 < 3; b2++) { const w0 = u0 + 0.7 + b2 * (sw - 1.4) / 3 + 0.15, w1 = u0 + 0.7 + (b2 + 1) * (sw - 1.4) / 3 - 0.15; S.box(G, w0, v0, sd, w1, v0 + 0.14, sd + 0.05); S.box(G, w0, v1 - 0.14, sd, w1, v1, sd + 0.05); S.box(G, w0, v0, sd, w0 + 0.14, v1, sd + 0.05); S.box(G, w1 - 0.14, v0, sd, w1, v1, sd + 0.05); }
        for (const [s0, s1] of [[0.4, sd / 2 - 0.15], [sd / 2 + 0.15, sd - 0.7]]) for (const uu of [u0, u1]) { const o = uu === u0 ? -0.05 : 0; S.box(G, uu + o, v0, s0, uu + o + 0.05, v0 + 0.14, s1); S.box(G, uu + o, v1 - 0.14, s0, uu + o + 0.05, v1, s1); }
      }
      const ring = []; for (let i = 0; i < 16; i++) { const t = -i / 16 * Math.PI * 2; ring.push([L / 2 + Math.cos(t) * 0.7, sh * 0.72 + Math.sin(t) * 0.7]); }
      S.add(O, ext(ring, [], sd, sd + 0.03)); S.add(M, ext(ring.map(([p, q]) => [L / 2 + (p - L / 2) * 1.4, sh * 0.72 + (q - sh * 0.72) * 1.4]).reverse(), [ring], sd, sd + 0.12));
      S.box('roof_tile', u0 - 0.1, sh + 0.2, -0.3, u1 + 0.1, sh + 0.45, sd + 0.15);
      S.emit(bag, FM);
      col.rect(octRectOf(FM, u0, -0.4, u1, sd), y, y + sh);
    }
  }
  // the roof: the low pyramid of white marble in courses, its hip ribs; the lantern on columns, its little roof, the ball and cross
  const yr = y + h + 0.32, Rr = (a + 0.45) / C8, rise = a * 0.42, rl = 2.6 / C8;
  const roof = lathe([[Rr, 0], [rl, rise], [0.001, rise]], 8, null, 0, 0, 0); roof.rotateY(Math.PI / 8); roof.translate(cx, yr, cz); B.add(M, roof);
  for (let j = 1; j < 6; j++) { const t = j / 6, rr = Rr + (rl - Rr) * t, yy = yr + rise * t; const g = lathe([[rr + 0.06, -0.12], [rr + 0.06, 0], [rr - 0.25, 0.04]], 8, null, 0, 0, 0); g.rotateY(Math.PI / 8); g.translate(cx, yy, cz); B.add(M, g); }
  for (let k = 0; k < 8; k++) { const t = Math.PI / 8 + k * Math.PI / 4; B.add(M, rod([cx + Math.cos(t) * Rr, yr + 0.1, cz + Math.sin(t) * Rr], [cx + Math.cos(t) * rl, yr + rise + 0.1, cz + Math.sin(t) * rl], 0.16, 5)); }
  const yl = yr + rise;
  octRing(B, M, cx, cz, 2.7, 0, yl, yl + 0.6);
  octRing(B, M, cx, cz, 1.6, 0, yl + 0.6, yl + 4.2);
  for (let k = 0; k < 8; k++) {
    const t = Math.PI / 8 + k * Math.PI / 4, R = 2.25 / C8, px = cx + Math.cos(t) * R, pz = cz + Math.sin(t) * R;
    B.add(M, lathe([[0.2, 0], [0.2, 0.15], [0.14, 0.3], [0.12, 3.0], [0.2, 3.2], [0.22, 3.6]], 8, null, px, yl + 0.6, pz));
  }
  octRing(B, M, cx, cz, 2.6, 0, yl + 4.2, yl + 4.75);
  const lr = lathe([[2.5 / C8, 0], [0.5, 2.2], [0.001, 2.2]], 8, null, 0, 0, 0); lr.rotateY(Math.PI / 8); lr.translate(cx, yl + 4.75, cz); B.add(M, lr);
  B.add(GB, T(ball(0.42, 0.42, 0.42, 10, 6), cx, yl + 7.2, cz));
  B.add(GB, box(cx - 0.06, yl + 7.5, cz - 0.06, cx + 0.06, yl + 9.0, cz + 0.06)); B.add(GB, box(cx - 0.45, yl + 8.35, cz - 0.06, cx + 0.45, yl + 8.47, cz + 0.06));
  B.emit(bag);
}
/** The world plan rectangle of the local rectangle u0..u1 × d0..d1 of an octagon face frame (its axis-aligned bound). */
function octRectOf(FM, u0, d0, u1, d1) {
  const e = FM.elements, P = (u, d) => [e[12] + e[0] * u + e[8] * d, e[14] + e[2] * u + e[10] * d];
  const ps = [P(u0, d0), P(u1, d0), P(u0, d1), P(u1, d1)];
  return [Math.min(...ps.map((p) => p[0])), Math.min(...ps.map((p) => p[1])), Math.max(...ps.map((p) => p[0])), Math.max(...ps.map((p) => p[1]))];
}
