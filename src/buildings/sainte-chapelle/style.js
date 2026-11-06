// The Sainte-Chapelle's own pieces, on top of the Gothic style (src/styles/gothic): the west stair turrets —
// octagonal, in storeys with blind lancets and stair slits, a ring of gablets and a crocketed spirelet; the
// portals' moulded archivolts, jamb shafts and tympana (the upper one with the Last Judgement: Christ between
// the Virgin and St John, angels with the cross and the crown of thorns, St Michael weighing souls on the
// lintel); the openwork balustrade at the foot of the gable; gablets and pinnacles over the porch.
// docs/buildings/sainte-chapelle.md §4, §8.

import '../../styles/gothic/index.js';
import { STYLES, registerStyle } from '../../core/build.js';
import { lathe, fromTriangles } from '../../core/geom.js';
import { archRise, archHalf, planarWall } from '../../styles/byzantine/index.js';
import '../../styles/gothic/palace.js';
import { hexa, ellipsoid } from '../../styles/chinese/index.js';
import { box, rod } from '../../core/geom.js';
import { prism, bars, pinnacle as ndPinnacle, figure as ndFigure, pointedPts, ringPts } from '../../styles/gothic/notre-dame.js';

const frame = (o, u, n) => (uu, y, d) => [o[0] + u[0] * uu + n[0] * d, y, o[1] + u[1] * uu + n[1] * d];
function fbox(out, W, u0, u1, y0, y1, d0, d1) {
  hexa(out, [W(u0, y0, d0), W(u1, y0, d0), W(u1, y0, d1), W(u0, y0, d1)], [W(u0, y1, d0), W(u1, y1, d0), W(u1, y1, d1), W(u0, y1, d1)]);
}
/** A band following a pointed arch { uc, r, spring, pointed } from radius offset e0 to e1 outside the intrados, depth d0…d1. */
function archBand(out, W, a, e0, e1, d0, d1, n = 12) {
  const R = a.pointed * 2 * a.r, H = archRise(a);
  // each half: an arc of radius R about the opposite side's centre
  for (const s of [-1, 1]) {
    const cu = a.uc - s * (R - a.r), t1 = Math.asin(H / R);
    for (let i = 0; i < n; i++) {
      const ta = t1 * i / n, tb = t1 * (i + 1) / n;
      const P = (e, t, d) => W(cu + s * (R + e) * Math.cos(t), a.spring + (R + e) * Math.sin(t), d);
      hexa(out, [P(e0, ta, d0), P(e1, ta, d0), P(e1, tb, d0), P(e0, tb, d0)], [P(e0, ta, d1), P(e1, ta, d1), P(e1, tb, d1), P(e0, tb, d1)]);
    }
  }
}
/** A filled pointed head (tympanum) of an arch above y = a.spring + lift, depth d0…d1, in horizontal strips. */
function tympanum(out, W, a, y0, d0, d1) {
  const top = a.spring + archRise(a), N = 14;
  for (let i = 0; i < N; i++) {
    const ya = y0 + (top - y0) * i / N, yb = y0 + (top - y0) * (i + 1) / N;
    const ha = archHalf(a, ya - a.spring), hb = archHalf(a, yb - a.spring);
    hexa(out, [W(a.uc - ha, ya, d0), W(a.uc + ha, ya, d0), W(a.uc + ha, ya, d1), W(a.uc - ha, ya, d1)], [W(a.uc - hb, yb, d0), W(a.uc + hb, yb, d0), W(a.uc + hb, yb, d1), W(a.uc - hb, yb, d1)]);
  }
}

/**
 * A stair turret { at, y, r, h, spire }: an octagonal shaft (r to the corners) in storeys parted by string courses; on each face
 * of each storey a blind lancet with a raised frame, slits for the winding stair on the outer faces; a corbelled cornice, a ring
 * of eight gablets with finials, an octagonal spirelet with crockets on its edges and a finial.
 */
function turret(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, r = el.r, h = el.h, sp = el.spire || 7;
  const stone = [], dark = [], lead = [];
  const ap = r * Math.cos(Math.PI / 8), side = 2 * r * Math.sin(Math.PI / 8);
  bag.add('limestone', lathe([[r + 0.25, 0], [r + 0.25, 0.8], [r, 1.0], [r, h], [0.001, h]], 8, null, x, y, z).rotateY(0));
  const storeys = [1.0, 7.6, 14.0, 20.4, 27.0, h - 0.6];
  for (let k = 0; k < 8; k++) {
    const th = (k + 0.5) * Math.PI / 4, n = [Math.cos(th), Math.sin(th)], u = [-Math.sin(th), Math.cos(th)];
    const W = frame([x + n[0] * 0, z + n[1] * 0], u, n);
    for (let s = 0; s < storeys.length - 1; s++) {
      const y0 = y + storeys[s], y1 = y + storeys[s + 1];
      // string course
      fbox(stone, W, -side / 2 - 0.08, side / 2 + 0.08, y1 - 0.18, y1, ap - 0.02, ap + 0.14);
      // a blind lancet: two jambs and its pointed head, raised on the face
      const a = { uc: 0, r: side / 2 - 0.14, spring: y1 - 0.6 - (side / 2 - 0.14) * 1.4, pointed: 0.85 };
      for (const sd of [-1, 1]) fbox(stone, W, sd * (a.r) - 0.05, sd * (a.r) + 0.05, y0 + 0.3, a.spring, ap - 0.01, ap + 0.07);
      archBand(stone, W, a, -0.05, 0.05, ap - 0.01, ap + 0.07, 6);
      // the stair's slit on four faces, alternating up the storeys
      if ((k + s) % 2 === 0) fbox(dark, W, -0.06, 0.06, (y0 + a.spring) / 2 - 0.5, (y0 + a.spring) / 2 + 0.5, ap - 0.03, ap + 0.005);
    }
    // the cornice on corbels, a gablet on each face with a finial
    const yt = y + h;
    fbox(stone, W, -side / 2 - 0.1, side / 2 + 0.1, yt - 0.25, yt, ap - 0.02, ap + 0.25);
    for (const cu of [-side / 3, 0, side / 3]) fbox(stone, W, cu - 0.06, cu + 0.06, yt - 0.55, yt - 0.25, ap - 0.02, ap + 0.18);
    const gh = 1.6, P = (uu, yy, d) => W(uu, yy, d);
    const L = -side / 2, R2 = side / 2, d0 = ap + 0.02, d1 = ap + 0.2;
    hexa(stone, [P(L, yt, d0), P(R2, yt, d0), P(R2, yt, d1), P(L, yt, d1)], [P(-0.02, yt + gh, d0), P(0.02, yt + gh, d0), P(0.02, yt + gh, d1), P(-0.02, yt + gh, d1)]);
    const tip = W(0, yt + gh, ap + 0.11);
    bag.add('limestone', lathe([[0.07, 0], [0.12, 0.15], [0.001, 0.42]], 6, null, tip[0], tip[1], tip[2]));
    // crockets up the spirelet's edge at this corner
    const ca = k * Math.PI / 4;
    for (let j = 1; j < 7; j++) {
      const t = j / 7.5, rr = r * 0.95 * (1 - t);
      bag.add('limestone', ellipsoid([x + Math.cos(ca) * (rr + 0.06), y + h + 0.3 + sp * t, z + Math.sin(ca) * (rr + 0.06)], 0.11, 0.09, 0.11, 6, 3));
    }
  }
  // the spirelet: an octagonal pyramid of stone, its finial
  bag.add('limestone', lathe([[r * 0.95, 0], [0.04, sp], [0.001, sp + 0.05]], 8, null, x, y + h + 0.3, z));
  bag.add('limestone', lathe([[r, 0], [r * 0.95, 0.3]], 8, null, x, y + h, z));
  bag.add('limestone', lathe([[0.001, 0], [0.18, 0.15], [0.12, 0.45], [0.22, 0.6], [0.001, 1.2]], 8, null, x, y + h + 0.3 + sp, z));
  bag.add('limestone', fromTriangles(stone));
  bag.add('opening', fromTriangles(dark));
  if (lead.length) bag.add('lead', fromTriangles(lead));
  col.circle(x, z, r + 0.25, y, y + h);
}

/** A seated or standing figure in relief on a plane: centre at W(uu, y, d), height hh, seated or not. */
function figure(G, W, uu, y, d, hh, seated, wings) {
  const s = hh / 1.0;
  if (seated) G.push(ellipsoid(W(uu, y + 0.18 * s, d + 0.06 * s), 0.2 * s, 0.14 * s, 0.12 * s, 10, 5));
  else G.push(ellipsoid(W(uu, y + 0.3 * s, d + 0.04 * s), 0.13 * s, 0.32 * s, 0.07 * s, 10, 5));
  G.push(ellipsoid(W(uu, y + (seated ? 0.45 : 0.68) * s, d + 0.05 * s), 0.13 * s, 0.18 * s, 0.08 * s, 10, 5));
  G.push(ellipsoid(W(uu, y + (seated ? 0.72 : 0.94) * s, d + 0.05 * s), 0.065 * s, 0.08 * s, 0.06 * s, 8, 4));
  if (wings) for (const sd of [-1, 1]) G.push(ellipsoid(W(uu + sd * 0.16 * s, y + 0.7 * s, d + 0.02 * s), 0.07 * s, 0.25 * s, 0.03 * s, 8, 4));
}

/**
 * A portal's sculpture { o, u, th, arch: { uc, r, spring, pointed }, doorTop, kind: 'judgement' | 'virgin' }: three moulded
 * archivolts, a shaft in each jamb with a capital, the lintel and the tympanum with its figures.
 */
function portal(el, { bag }) {
  const n = el.out || [-el.u[1], el.u[0]], W = frame(el.o, el.u, n), a = el.arch, F = el.th / 2;
  const S = [], G = [];
  for (const [e0, e1, d1] of [[0.0, 0.16, 0.12], [0.22, 0.38, 0.1], [0.44, 0.58, 0.08]]) archBand(S, W, a, e0, e1, F - 0.01, F + d1, 14);
  for (const sd of [-1, 1]) for (const [e, rr] of [[0.08, 0.07], [0.3, 0.07], [0.51, 0.06]]) {
    const p = W(a.uc + sd * (a.r + e), 0, F + 0.06);
    bag.add('limestone', lathe([[rr * 1.6, 0], [rr * 1.6, 0.2], [rr, 0.3], [rr, a.spring - el.base - 0.6], [rr * 1.8, a.spring - el.base - 0.25], [rr * 2, a.spring - el.base]], 8, null, p[0], el.base, p[2]));
  }
  // the lintel across the door's head, and the tympanum over it
  const yL = el.doorTop;
  fbox(S, W, a.uc - a.r, a.uc + a.r, yL, yL + 0.36, F - 0.12, F + 0.02);
  tympanum(S, W, a, yL + 0.36, F - 0.12, F - 0.04);
  if (el.kind === 'judgement') {
    // the lintel: St Michael with the scales in the middle, the saved and the damned to either side
    figure(G, W, a.uc, yL + 0.02, F, 0.34, false, true);
    for (let i = 1; i <= 4; i++) for (const sd of [-1, 1]) figure(G, W, a.uc + sd * i * 0.27, yL + 0.02, F - 0.02, 0.3, false, false);
    // the tympanum: Christ seated, the Virgin and St John kneeling, two angels behind with the cross and the crown
    const yT = yL + 0.4, top = a.spring + archRise(a);
    figure(G, W, a.uc, yT + 0.05, F - 0.04, Math.min(1.0, (top - yT) * 0.62), true, false);
    for (const sd of [-1, 1]) figure(G, W, a.uc + sd * 0.62, yT, F - 0.04, 0.55, false, false);
    for (const sd of [-1, 1]) figure(G, W, a.uc + sd * 0.42, yT + 0.6, F - 0.06, 0.42, false, true);
    fbox(S, W, a.uc - 0.38 - 0.015, a.uc - 0.38 + 0.015, yT + 0.75, yT + 1.25, F - 0.04, F);
    fbox(S, W, a.uc - 0.48, a.uc - 0.28, yT + 1.12, yT + 1.15, F - 0.04, F);
  } else {
    // the Virgin crowned, between two angels with censers
    const yT = yL + 0.4;
    figure(G, W, a.uc, yT, F - 0.04, 0.9, false, false);
    for (const sd of [-1, 1]) figure(G, W, a.uc + sd * 0.55, yT + 0.1, F - 0.04, 0.5, false, true);
  }
  bag.add('limestone', fromTriangles(S));
  for (const g of G) bag.add(el.figMat || 'limestone', g);
}

/**
 * An openwork balustrade along a line { o, u, u0, u1, y, h, d (out from o) }: a plinth, a top rail, and between them a row of
 * trefoil-headed openings parted by small posts. [inferred: the Rayonnant balustrade of the roof's foot]
 */
function balustrade(el, { bag }) {
  const n = [-el.u[1], el.u[0]], W = frame(el.o, el.u, n), S = [], d = el.d || 0, t = 0.11, h = el.h || 0.9;
  fbox(S, W, el.u0, el.u1, el.y, el.y + 0.14, d - t - 0.03, d + t + 0.03);
  fbox(S, W, el.u0, el.u1, el.y + h - 0.12, el.y + h, d - t - 0.04, d + t + 0.04);
  const L = el.u1 - el.u0, nb = Math.max(2, Math.round(L / 0.55)), bw = L / nb;
  for (let i = 0; i <= nb; i++) fbox(S, W, el.u0 + i * bw - 0.05, el.u0 + i * bw + 0.05, el.y + 0.14, el.y + h - 0.12, d - t, d + t);
  for (let i = 0; i < nb; i++) {
    const a = { uc: el.u0 + (i + 0.5) * bw, r: bw / 2 - 0.05, spring: el.y + h - 0.12 - (bw / 2 - 0.05) * 1.25, pointed: 0.8 };
    archBand(S, W, a, 0, 0.04, d - t * 0.7, d + t * 0.7, 5);
    // the cusps: a small trefoil, three lobes as tiny rings
    for (const [du, dy] of [[-0.09, 0], [0.09, 0], [0, 0.1]]) fbox(S, W, a.uc + du - 0.035, a.uc + du + 0.035, a.spring + dy - 0.03, a.spring + dy + 0.03, d - t * 0.6, d + t * 0.6);
  }
  bag.add('limestone', fromTriangles(S));
}

/** A gablet over an arch { o, u, uc, w, y0, h, d }: a crocketed triangle with a finial; a pinnacle each side { pinnacles }. */
function gablet(el, { bag }) {
  const n = [-el.u[1], el.u[0]], W = frame(el.o, el.u, n), S = [], d = el.d || 0, t = 0.12;
  const L = el.uc - el.w / 2, R = el.uc + el.w / 2, y0 = el.y0, H = el.h;
  hexa(S, [W(L, y0, d - t), W(R, y0, d - t), W(R, y0, d + t), W(L, y0, d + t)], [W(el.uc - 0.03, y0 + H, d - t), W(el.uc + 0.03, y0 + H, d - t), W(el.uc + 0.03, y0 + H, d + t), W(el.uc - 0.03, y0 + H, d + t)]);
  for (let j = 1; j < 6; j++) for (const s of [-1, 1]) {
    const f = j / 6, p = W(el.uc + s * (el.w / 2) * (1 - f) + s * 0.06, y0 + H * f + 0.05, d);
    bag.add('limestone', ellipsoid(p, 0.09, 0.08, 0.09, 6, 3));
  }
  const tip = W(el.uc, y0 + H, d);
  bag.add('limestone', lathe([[0.08, 0], [0.13, 0.15], [0.07, 0.35], [0.14, 0.45], [0.001, 0.8]], 6, null, tip[0], tip[1], tip[2]));
  for (const pu of el.pinnacles || []) {
    const p = W(pu, 0, d);
    bag.add('limestone', lathe([[0.2, 0], [0.2, el.pinH || 1.2], [0.24, (el.pinH || 1.2) + 0.1], [0.001, (el.pinH || 1.2) + 1.3]], 4, null, p[0], y0 - 0.4, p[2]));
  }
  bag.add('limestone', fromTriangles(S));
}


/**
 * The gable's and the rose's frames { o, u, uc, eave, gh (gable height), th, rose: { yc, r } }: a moulded ring round the rose;
 * on the gable a blind pointed arch with an oculus in its head ("a pointed arch with an oculus at the top" — §8).
 */
function frontFrames(el, { bag }) {
  const n = [-el.u[1], el.u[0]], W = frame(el.o, el.u, n), S = [], F = el.th / 2;
  const ringAt = (yc, r0, r1, d0, d1, N = 48) => {
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2, b = ((i + 1) / N) * Math.PI * 2;
      const P = (r, t, d) => W(el.uc + Math.cos(t) * r, yc + Math.sin(t) * r, d);
      hexa(S, [P(r0, a, d0), P(r1, a, d0), P(r1, b, d0), P(r0, b, d0)], [P(r0, a, d1), P(r1, a, d1), P(r1, b, d1), P(r0, b, d1)]);
    }
  };
  ringAt(el.rose.yc, el.rose.r, el.rose.r + 0.3, F - 0.01, F + 0.16);
  ringAt(el.rose.yc, el.rose.r + 0.36, el.rose.r + 0.5, F - 0.01, F + 0.1);
  const half = el.gw / 2, a = { uc: el.uc, r: half * 0.62, spring: el.eave + 1.3, pointed: 0.75 };
  for (const sd of [-1, 1]) fbox(S, W, el.uc + sd * a.r - 0.09, el.uc + sd * a.r + 0.09, el.eave + 0.9, a.spring, F - 0.01, F + 0.12);
  archBand(S, W, a, -0.09, 0.09, F - 0.01, F + 0.12, 14);
  const oc = a.spring + archRise(a) * 0.48;
  ringAt(oc, 1.0, 1.2, F - 0.01, F + 0.12, 32);
  // trefoil cusps inside the oculus
  for (let k = 0; k < 3; k++) { const t = Math.PI / 2 + k * 2 * Math.PI / 3, c = [el.uc + Math.cos(t) * 0.45, oc + Math.sin(t) * 0.45]; for (let i = 0; i < 16; i++) { const aa = (i / 16) * Math.PI * 2, bb = ((i + 1) / 16) * Math.PI * 2, P = (r, tt, d) => W(c[0] + Math.cos(tt) * r, c[1] + Math.sin(tt) * r, d); hexa(S, [P(0.4, aa, F - 0.01), P(0.48, aa, F - 0.01), P(0.48, bb, F - 0.01), P(0.4, bb, F - 0.01)], [P(0.4, aa, F + 0.08), P(0.48, aa, F + 0.08), P(0.48, bb, F + 0.08), P(0.4, bb, F + 0.08)]); } }
  bag.add('limestone', fromTriangles(S));
}

/** A round tower of the palace { at, y, r, h, roof }: a battered foot, slit windows, a corbel table, a crenellated parapet, the cone behind it. */
function keep(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, r = el.r, h = el.h, S = [], D = [];
  bag.add('limestone', lathe([[r + 0.5, 0], [r + 0.15, 2.2], [r, 2.4], [r, h], [0.001, h]], 32, null, x, y, z));
  bag.add('limestone', lathe([[r + 0.05, h - 0.9], [r + 0.45, h - 0.15], [r + 0.45, h], [0.001, h]], 32, null, x, y, z));
  const N = Math.round(2 * Math.PI * r / 0.9);
  for (let k = 0; k < N; k++) {
    const a = (k / N) * Math.PI * 2, n = [Math.cos(a), Math.sin(a)], u = [-n[1], n[0]], W = frame([x, z], u, n);
    fbox(S, W, -0.14, 0.14, y + h - 1.3, y + h - 0.15, r - 0.05, r + 0.42);              // corbels
    if (k % 2 === 0) fbox(S, W, -0.36, 0.36, y + h, y + h + 1.6, r - 0.05, r + 0.45);   // merlons
    else fbox(S, W, -0.36, 0.36, y + h, y + h + 0.9, r - 0.05, r + 0.45);               // crenel sill
    if (k % Math.round(N / 4) === 0) for (const yy of [h * 0.35, h * 0.62]) fbox(D, W, -0.07, 0.07, y + yy, y + yy + 1.1, r - 0.04, r + 0.005);
  }
  bag.add('limestone', fromTriangles(S));
  bag.add('opening', fromTriangles(D));
  bag.add(el.roofMat || 'slate', lathe([[r - 0.2, 0], [0.05, el.roof], [0.001, el.roof + 0.1]], 32, null, x, y + h + 0.2, z));
  col.circle(x, z, r + 0.5, y, y + h);
}

// ── the flanks and the roof (docs/buildings/sainte-chapelle.md §4, "The flanks and the roof") ──────────────

const CARV = 'limestone_carved';
/** σ: +1 when the outward normal n is the left normal of u ([-u1, u0]) that bars() offsets along, −1 otherwise. */
const side = (u, n) => (n[0] * -u[1] + n[1] * u[0] >= 0 ? 1 : -1);

/**
 * A crocketed gable (gâble) over a window { o, u, n (outward), uc, w, y0, h, d (its mid-plane out from o) }: a field of
 * stone, moulded rakes and a base, a blind trefoil in a ring in the field, crockets up both rakes, a fleuron at the apex.
 */
function wgable(el, { bag }) {
  const { o, u, n, uc, w, y0, h } = el, d = el.d || 0, W = frame(o, u, n), sg = side(u, n), S = [], C = [];
  const ap = [uc, y0 + h];
  // the field
  prism(S, [W(uc - w / 2 + 0.12, y0 + 0.05, d - 0.12), W(uc + w / 2 - 0.12, y0 + 0.05, d - 0.12), W(uc, y0 + h - 0.2, d - 0.12)], [n[0] * 0.24, 0, n[1] * 0.24]);
  // the rakes and the base
  bars(S, o, u, [[uc - w / 2, y0 + 0.12], ap, [uc + w / 2, y0 + 0.12]], 0.32, 0.4, sg * d);
  bars(S, o, u, [[uc - w / 2 + 0.1, y0 + 0.13], [uc + w / 2 - 0.1, y0 + 0.13]], 0.26, 0.36, sg * d);
  // the trefoil in its ring
  const rr = Math.min(w * 0.19, h * 0.21), yc = y0 + h * 0.36;
  bars(S, o, u, ringPts(uc, yc, rr, 28), 0.14, 0.3, sg * d);
  for (let k = 0; k < 3; k++) {
    const a = Math.PI / 2 + k * 2 * Math.PI / 3;
    bars(S, o, u, ringPts(uc + Math.cos(a) * rr * 0.42, yc + Math.sin(a) * rr * 0.42, rr * 0.5, 16), 0.08, 0.26, sg * d);
  }
  // crockets: curled leaves up the rakes, standing out from them
  const L = Math.hypot(w / 2, h), nu = (h / L), ny = (w / 2) / L;
  for (const s of [-1, 1]) for (let j = 1; j <= 6; j++) {
    const f = j / 7.2, p = W(uc + s * (w / 2) * (1 - f) + s * nu * 0.2, y0 + 0.12 + (h - 0.12) * f + ny * 0.2, d);
    C.push(ellipsoid(p, 0.17, 0.13, 0.17, 6, 3));
  }
  // the fleuron: a stem, four leaves in a cross, a bud
  const t = W(uc, y0 + h, d);
  C.push(lathe([[0.1, -0.1], [0.12, 0.25], [0.07, 0.45], [0.001, 0.46]], 6, null, t[0], t[1], t[2]));
  C.push(box(t[0] - 0.3, t[1] + 0.42, t[2] - 0.06, t[0] + 0.3, t[1] + 0.56, t[2] + 0.06), box(t[0] - 0.06, t[1] + 0.42, t[2] - 0.3, t[0] + 0.06, t[1] + 0.56, t[2] + 0.3));
  C.push(lathe([[0.001, 0.5], [0.13, 0.62], [0.1, 0.85], [0.001, 1.0]], 6, null, t[0], t[1], t[2]));
  bag.add('limestone', fromTriangles(S));
  for (const g of C) bag.add(CARV, g);
}

/** A crocketed pinnacle on a buttress { at [x, z], y, w, h } — the shaft with a gablet on each face, the crocketed spirelet, the finial. */
function scPinnacle(el, { bag }) { ndPinnacle(bag, el.at[0], el.y, el.at[1], el.w, el.h, 'limestone'); }

/**
 * The cornice at the foot of the roof { o, u, n, u0, u1, y (its top), d0 (the wall's face) , p (projection) }: three
 * stepped mouldings, the lowest with a frieze of foliage; the walk of the gutter on it.
 */
function cornice(el, { bag }) {
  const W = frame(el.o, el.u, el.n), S = [], d0 = el.d0, p = el.p ?? 0.85, y = el.y;
  fbox(S, W, el.u0, el.u1, y - 0.55, y - 0.32, d0 - 0.02, d0 + 0.28);
  fbox(S, W, el.u0, el.u1, y - 0.32, y - 0.14, d0 - 0.02, d0 + p * 0.6);
  fbox(S, W, el.u0, el.u1, y - 0.14, y, d0 - 0.02, d0 + p);
  bag.add('limestone', fromTriangles(S));
  const n = Math.floor((el.u1 - el.u0) / 0.55);
  for (let i = 0; i < n; i++) bag.add(CARV, ellipsoid(W(el.u0 + (i + 0.5) * (el.u1 - el.u0) / n, y - 0.4, d0 + 0.33), 0.2, 0.12, 0.1, 6, 3));
}

/**
 * A window's outer frame { o, u, n, d0 (face), arch: { uc, r, spring, pointed }, sill }: two moulded orders round the head,
 * the outer one a hood; a colonnette in each jamb with its base and crocket capital.
 */
function windowFrame(el, { bag }) {
  const W = frame(el.o, el.u, el.n), a = el.arch, d0 = el.d0, S = [];
  archBand(S, W, a, 0.02, 0.2, d0 - 0.01, d0 + 0.1, 14);
  archBand(S, W, a, 0.26, 0.4, d0 - 0.01, d0 + 0.17, 14);
  bag.add('limestone', fromTriangles(S));
  for (const sd of [-1, 1]) {
    const p = W(a.uc + sd * (a.r + 0.11), 0, d0 + 0.02), H = a.spring - el.sill;
    bag.add('limestone', lathe([[0.15, 0], [0.15, 0.18], [0.09, 0.28], [0.08, H - 0.45], [0.13, H - 0.2], [0.17, H]], 8, null, p[0], el.sill, p[2]));
  }
}

/**
 * The roof's dress { x0, x1, z0, z1, e (the slopes' foot), ridge, apse: { c, R, y, sides, a0, a1 }, angel }: the rolls of the lead
 * sheets down both slopes and the apse's facets; the gilt cresting of fleurs-de-lis along the ridge; the archangel Michael at the
 * ridge's east end.
 */
function roofDress(el, { bag }) {
  const { x0, x1, z0, z1, e, ridge } = el, zm = (z0 + z1) / 2, R = [];
  // the slopes: rolls every 0.75 m from the eave to just under the ridge, standing 0.04 proud of the lead
  for (const [za, sg] of [[z0, -1], [z1, 1]]) {
    const dz = zm - za, dy = ridge - e, Ln = Math.hypot(dz, dy), nz = sg * dy / Ln, ny = Math.abs(dz) / Ln;
    const P = (x, f) => [x, e + dy * f + ny * 0.03, za + dz * f + nz * 0.03];
    for (let x = x0 + 0.45; x < x1 - 0.2; x += 0.75) R.push(rod(P(x, 0.01), P(x, 0.97), 0.045, 4));
  }
  if (el.apse) {
    const { c, R: AR, y, sides, a0, a1 } = el.apse, apex = [c[0], ridge, c[1]];
    for (let k = 0; k < sides; k++) {
      const aa = (a0 + (a1 - a0) * k / sides) * Math.PI / 180, bb = (a0 + (a1 - a0) * (k + 1) / sides) * Math.PI / 180;
      const A = [c[0] + Math.cos(aa) * AR, y, c[1] + Math.sin(aa) * AR], B = [c[0] + Math.cos(bb) * AR, y, c[1] + Math.sin(bb) * AR];
      // the facet's outward normal
      const u1 = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], v1 = [apex[0] - A[0], apex[1] - A[1], apex[2] - A[2]];
      let nn = [u1[1] * v1[2] - u1[2] * v1[1], u1[2] * v1[0] - u1[0] * v1[2], u1[0] * v1[1] - u1[1] * v1[0]];
      if (nn[1] < 0) nn = nn.map((q) => -q);
      const nl = Math.hypot(...nn); nn = nn.map((q) => q / nl * 0.03);
      for (const t of [0.25, 0.5, 0.75]) {
        const F = [A[0] + u1[0] * t, y, A[2] + u1[2] * t], at = (f) => [F[0] + (apex[0] - F[0]) * f + nn[0], F[1] + (apex[1] - F[1]) * f + nn[1], F[2] + (apex[2] - F[2]) * f + nn[2]];
        R.push(rod(at(0.01), at(t === 0.5 ? 0.8 : 0.62), 0.045, 4));
      }
    }
  }
  for (const g of R) bag.add('lead', g);
  // the cresting: a rail on the ridge, and on it fleurs-de-lis every 0.62 m
  const xe = el.crestEnd ?? x1;
  bag.add('gold', box(x0 - 0.05, ridge - 0.1, zm - 0.12, xe + 0.05, ridge + 0.18, zm + 0.12));
  const G = [];
  for (let x = x0 + 0.4; x < xe - 0.2; x += 0.62) {
    const b = ridge + 0.18;
    G.push(lathe([[0.001, 0], [0.07, 0.08], [0.11, 0.32], [0.05, 0.56], [0.001, 0.7]], 6, null, x, b, zm));
    for (const s of [-1, 1]) {
      G.push(rod([x + s * 0.04, b + 0.3, zm], [x + s * 0.2, b + 0.48, zm], 0.035, 4));
      G.push(rod([x + s * 0.2, b + 0.48, zm], [x + s * 0.26, b + 0.36, zm], 0.035, 4));
      G.push(rod([x + s * 0.04, b + 0.24, zm], [x + s * 0.16, b + 0.02, zm], 0.03, 4));
    }
    G.push(box(x - 0.15, b + 0.24, zm - 0.04, x + 0.15, b + 0.31, zm + 0.04));
  }
  for (const g of G) bag.add('gold', g);
  // the archangel on a pedestal at the end of the ridge, facing east
  if (el.angel) {
    const [ax, az] = el.angel;
    bag.add('gold', lathe([[0.32, 0], [0.32, 0.25], [0.22, 0.35], [0.22, 0.6], [0.34, 0.7], [0.34, 0.8]], 8, null, ax, ridge - 0.2, az));
    ndFigure(bag, ax, ridge + 0.6, az, 2.3, { wings: true, mat: 'gold', face: [1, 0] });
  }
}

/**
 * The flèche over the roof { at [x, z], y (its foot inside the roof), ridge, h, r }: of oak sheathed in lead — an octagonal
 * plinth, an open lantern of eight pointed bays under gablets with pinnacles at its corners, a second, narrower lantern, the
 * needle with crockets up its arrises, a gilt finial and cross.
 */
function fleche(el, { bag }) {
  const [sx, sz] = el.at, y = el.y, rg = el.ridge, R8 = el.r, top = y + el.h, LD = 'lead';
  const stage = (yb, r, hb, gab) => {
    // posts and rails of the stage as an octagonal shell, the pointed bays dark in each face
    bag.add(LD, lathe([[r + 0.12, 0], [r + 0.12, 0.3], [r, 0.38], [r, hb], [r + 0.14, hb + 0.1], [r + 0.14, hb + 0.35]], 8, null, sx, yb, sz));
    for (let k = 0; k < 8; k++) {
      const a = (k + 0.5) * Math.PI / 4, d = [Math.cos(a), Math.sin(a)], t = [-d[1], d[0]], rf = r * Math.cos(Math.PI / 8) + 0.02, hw = r * Math.sin(Math.PI / 8) * 0.6;
      const c = [sx + d[0] * rf, sz + d[1] * rf], op = [];
      const ys = yb + 0.5, yh = yb + hb - hw * 2.2;
      const pts = pointedPts(0, hw, yh, 0.8, 6);
      for (let i = 0; i < pts.length - 1; i++) {
        const [ua, ya] = pts[i], [ub, yb2] = pts[i + 1];
        op.push(c[0] + t[0] * ua, ya, c[1] + t[1] * ua, c[0] + t[0] * ub, yb2, c[1] + t[1] * ub, c[0], yh, c[1]);
      }
      op.push(c[0] - t[0] * hw, ys, c[1] - t[1] * hw, c[0] + t[0] * hw, ys, c[1] + t[1] * hw, c[0] + t[0] * hw, yh, c[1] + t[1] * hw);
      op.push(c[0] - t[0] * hw, ys, c[1] - t[1] * hw, c[0] + t[0] * hw, yh, c[1] + t[1] * hw, c[0] - t[0] * hw, yh, c[1] - t[1] * hw);
      for (let i = 0; i < op.length; i += 9) { const ux = op[i + 3] - op[i], uy = op[i + 4] - op[i + 1], uz = op[i + 5] - op[i + 2], vx = op[i + 6] - op[i], vy = op[i + 7] - op[i + 1], vz = op[i + 8] - op[i + 2]; const nx = uy * vz - uz * vy, nz = ux * vy - uy * vx; if (nx * d[0] + nz * d[1] < 0) for (let q = 0; q < 3; q++) { const tt = op[i + 3 + q]; op[i + 3 + q] = op[i + 6 + q]; op[i + 6 + q] = tt; } }
      bag.add('opening', fromTriangles(op));
      // tracery in the bay: a mullion and the arch's bars, standing on the face
      const fb = [], o2 = [c[0], c[1]];
      bars(fb, o2, t, [[0, ys], [0, yh + hw * 0.4]], 0.06, 0.08, side(t, d) * 0.03);
      bars(fb, o2, t, pointedPts(0, hw, yh, 0.8, 6), 0.08, 0.08, side(t, d) * 0.03);
      bag.add(LD, fromTriangles(fb));
      if (gab) {
        const gb = [], gw = r * Math.sin(Math.PI / 8) * 0.95, gy = yb + hb + 0.35;
        prism(gb, [[c[0] - t[0] * gw, gy, c[1] - t[1] * gw], [c[0] + t[0] * gw, gy, c[1] + t[1] * gw], [c[0], gy + gw * 2.4, c[1]]], [-d[0] * 0.3, 0, -d[1] * 0.3]);
        bag.add(LD, fromTriangles(gb));
        const tip = [c[0] - d[0] * 0.15, gy + gw * 2.4, c[1] - d[1] * 0.15];
        bag.add('gold', lathe([[0.05, 0], [0.09, 0.12], [0.001, 0.3]], 6, null, tip[0], tip[1], tip[2]));
        const ca = k * Math.PI / 4, pr = r + 0.06;
        bag.add(LD, lathe([[0.16, 0], [0.16, 0.9], [0.001, 2.6]], 4, null, sx + Math.cos(ca) * pr, gy - 0.6, sz + Math.sin(ca) * pr));
      }
    }
  };
  // the plinth from inside the roof up to over the ridge, with a moulded cap
  bag.add(LD, lathe([[R8 + 0.2, 0], [R8 + 0.2, rg - y + 0.6], [R8 + 0.32, rg - y + 0.75], [R8 + 0.32, rg - y + 0.95]], 8, null, sx, y, sz));
  const y1 = rg + 0.95, h1 = 5.2;
  stage(y1, R8, h1, true);
  const y2 = y1 + h1 + 0.35, r2 = R8 * 0.72, h2 = 3.2;
  stage(y2, r2, h2, false);
  const yn = y2 + h2 + 0.35, prof = [[r2 * 1.05, 0], [r2 * 0.7, 2.5], [0.3, (top - yn) * 0.82], [0.05, top - yn]];
  bag.add(LD, lathe(prof, 8, null, sx, yn, sz));
  for (let k = 1; k <= 8; k++) {
    const hh = (top - yn) * k / 9.5;
    let rr = 0.05; for (let q = 0; q < prof.length - 1; q++) if (hh >= prof[q][1] && hh <= prof[q + 1][1]) rr = prof[q][0] + (prof[q + 1][0] - prof[q][0]) * (hh - prof[q][1]) / (prof[q + 1][1] - prof[q][1]);
    rr -= 0.03;
    for (let q = 0; q < 8; q++) { const a = q * Math.PI / 4; bag.add(LD, box(sx + Math.cos(a) * rr - 0.09, yn + hh, sz + Math.sin(a) * rr - 0.09, sx + Math.cos(a) * rr + 0.09, yn + hh + 0.22, sz + Math.sin(a) * rr + 0.09)); }
  }
  bag.add('gold', lathe([[0.06, 0], [0.16, 0.2], [0.05, 0.45], [0.05, 1.8], [0.001, 1.85]], 6, null, sx, top, sz));
  bag.add('gold', box(sx - 0.04, top + 1.2, sz - 0.42, sx + 0.04, top + 1.31, sz + 0.42));
  bag.add('gold', box(sx - 0.04, top + 1.2, sz - 0.04, sx + 0.04, top + 2.0, sz + 0.04));
}

/**
 * A window of the lower chapel in a wall plane { o, u, uc, yc, r, inSide }: a spherical triangle (three arcs, each centred on
 * the opposite corner) in the round hole the wall leaves, the stone round it, the glass in it, three cusped rings in it.
 */
function triWindow(el, { bag }) {
  const { o, u, uc, yc, r } = el, inS = el.inSide ?? 1, n = [-u[1], u[0]], W = frame(o, u, n), rv = r * 0.97;
  const V = [0, 1, 2].map((k) => { const a = Math.PI / 2 + k * 2 * Math.PI / 3; return [uc + Math.cos(a) * rv, yc + Math.sin(a) * rv]; });
  const s = rv * Math.sqrt(3), B = [];
  for (let k = 0; k < 3; k++) {
    const A = V[k], C = V[(k + 1) % 3], O = V[(k + 2) % 3];
    const ta = Math.atan2(A[1] - O[1], A[0] - O[0]), tc = Math.atan2(C[1] - O[1], C[0] - O[0]);
    let dt = tc - ta; if (dt > Math.PI) dt -= 2 * Math.PI; if (dt < -Math.PI) dt += 2 * Math.PI;
    for (let i = 0; i < 8; i++) { const t = ta + dt * i / 8; B.push([O[0] + Math.cos(t) * s, O[1] + Math.sin(t) * s]); }
  }
  // the stone between the round hole and the triangle
  const S = [], th = 0.13;
  for (let i = 0; i < B.length; i++) {
    const p = B[i], q = B[(i + 1) % B.length];
    const ang = (P) => Math.atan2(P[1] - yc, P[0] - uc), cp = [uc + Math.cos(ang(p)) * (r + 0.02), yc + Math.sin(ang(p)) * (r + 0.02)], cq = [uc + Math.cos(ang(q)) * (r + 0.02), yc + Math.sin(ang(q)) * (r + 0.02)];
    hexa(S, [W(p[0], p[1], -th), W(cp[0], cp[1], -th), W(cq[0], cq[1], -th), W(q[0], q[1], -th)], [W(p[0], p[1], th), W(cp[0], cp[1], th), W(cq[0], cq[1], th), W(q[0], q[1], th)]);
  }
  bag.add('limestone', fromTriangles(S));
  // the glass, two layers as in the upper windows
  for (const [off, mat] of [[inS * 0.015, 'stained_glass'], [-inS * 0.015, 'glass_outer']]) {
    const g = [];
    for (let i = 0; i < B.length; i++) { const p = B[i], q = B[(i + 1) % B.length]; g.push(...W(uc, yc, off), ...W(p[0], p[1], off), ...W(q[0], q[1], off), ...W(uc, yc, off), ...W(q[0], q[1], off), ...W(p[0], p[1], off)); }
    bag.add(mat, fromTriangles(g));
  }
  // the tracery: the triangle's frame, three rings with cusps, a small ring at the centre
  const T = [];
  bars(T, o, u, [...B, B[0]], 0.12, 0.3, 0);
  for (let k = 0; k < 3; k++) {
    const a = Math.PI / 2 + k * 2 * Math.PI / 3, cx = uc + Math.cos(a) * rv * 0.36, cy = yc + Math.sin(a) * rv * 0.36;
    bars(T, o, u, ringPts(cx, cy, rv * 0.27, 12), 0.08, 0.26, 0);
    for (let j = 0; j < 3; j++) { const b = a + j * 2 * Math.PI / 3; bars(T, o, u, ringPts(cx + Math.cos(b) * rv * 0.11, cy + Math.sin(b) * rv * 0.11, rv * 0.12, 8), 0.05, 0.22, 0); }
  }
  bars(T, o, u, ringPts(uc, yc, rv * 0.1, 12), 0.06, 0.24, 0);
  bag.add('limestone', fromTriangles(T));
}


// ── the galerie des Merciers and the stair (docs/buildings/sainte-chapelle.md §4, "The king's gallery") ─────────────────────

/**
 * The king's gallery { rect [x0, z0, x1, z1] (along z; z1 the chapel's end, open to the upper porch's landing), y, fl (its floor,
 * the upper chapel's), h (its walls over the floor) }: an open arcade of pointed arches below, its timber ceiling; above, the
 * gallery itself, lit by windows of two lights between buttresses, under a steep slate roof with a gable at the far end.
 */
function gallery(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, fl = el.fl, h = el.h ?? 5.6, T = 0.6, Ln = z1 - z0;
  const nb = Math.max(2, Math.round(Ln / 4.6)), bl = Ln / nb, E = fl + h;
  for (const [xf, inS] of [[x0 + T / 2, -1], [x1 - T / 2, 1]]) {
    const r = bl / 2 - 0.5, a = { r, pointed: 0.8 }, sp = fl - 1.0 - archRise(a);
    bag.add('limestone', planarWall({ o: [xf, z0], u: [0, 1], th: T, u0: 0, u1: Ln, y0: y, y1: fl - 0.45, arches: Array.from({ length: nb }, (_, k) => ({ uc: (k + 0.5) * bl, r, spring: sp, sill: y, pointed: 0.8 })) }));
    for (let k = 0; k <= nb; k++) col.rect([xf - T / 2, z0 + k * bl - 0.5, xf + T / 2, z0 + k * bl + 0.5], y, fl);
    const ups = Array.from({ length: nb }, (_, k) => ({ uc: (k + 0.5) * bl, r: 0.78, spring: E - 1.7, sill: fl + 1.0, pointed: 0.8 }));
    bag.add('limestone', planarWall({ o: [xf, z0], u: [0, 1], th: T, u0: 0, u1: Ln, y0: fl - 0.45, y1: E, arches: ups }));
    for (const a2 of ups) STYLES.gothic.elements.gothic_window({ o: [xf, z0], u: [0, 1], uc: a2.uc, w: 1.56, sill: a2.sill, spring: a2.spring, f: 0.8, lancets: 2, inSide: inS, bar: 0.09 }, ctx);
    col.rect([xf - T / 2, z0, xf + T / 2, z1], fl, E);
    // buttresses between the bays, a string course, the cornice
    for (let k = 1; k < nb; k++) STYLES.gothic.elements.buttress({ at: [xf - inS * T / 2, z0 + k * bl], dir: [-inS, 0], w: 0.8, d: 0.9, y0: y, y1: E - 0.6, steps: 2, pinnacle: 0 }, ctx);
    const W = frame([xf, z0], [0, 1], [-inS, 0]), S = [];
    fbox(S, W, 0, Ln, fl - 0.6, fl - 0.4, T / 2 - 0.02, T / 2 + 0.16);
    fbox(S, W, 0, Ln, E - 0.3, E, T / 2 - 0.02, T / 2 + 0.32);
    bag.add('limestone', fromTriangles(S));
  }
  // the floor over the arcade, its beams below; the far end wall
  bag.add('limestone', box(x0 + T, fl - 0.45, z0 + T, x1 - T, fl - 0.12, z1));
  bag.add('flagstone', box(x0 + T, fl - 0.12, z0 + T, x1 - T, fl, z1));
  for (let zz = z0 + T + 0.6; zz < z1 - 0.3; zz += 1.2) bag.add('timber', box(x0 + T, fl - 0.7, zz - 0.12, x1 - T, fl - 0.45, zz + 0.12));
  col.floor([x0 + T, z0 + T, x1 - T, z1], fl);
  bag.add('limestone', box(x0, y, z0, x1, E, z0 + T));
  col.rect([x0, z0, x1, z0 + T], y, E);
  // the roof and its far gable
  const xc = (x0 + x1) / 2, rg = E + (x1 - x0) * 0.75, R = [], Gb = [];
  prism(R, [[x0 - 0.35, E + 0.02, z0 - 0.3], [x1 + 0.35, E + 0.02, z0 - 0.3], [xc, rg, z0 - 0.3]], [0, 0, Ln + 0.3 - 0.05]);
  bag.add('slate', fromTriangles(R));
  prism(Gb, [[x0, E - 0.01, z0 - 0.4], [x1, E - 0.01, z0 - 0.4], [xc, rg + 0.3, z0 - 0.4]], [0, 0, T + 0.4]);
  bag.add('limestone', fromTriangles(Gb));
  bag.add('lead', rod([xc, rg + 0.02, z0], [xc, rg + 0.02, z1 - 0.05], 0.1, 6));
  bag.add(CARV, lathe([[0.15, 0], [0.2, 0.25], [0.1, 0.5], [0.18, 0.65], [0.001, 1.1]], 6, null, xc, rg + 0.25, z0 - 0.1));
}

/** A parapet along a stair's flight { a [x, y, z] (its foot), b [x, y, z] (its head), h, t }: a sloping wall with its coping, a pinnacle-post at each end. */
function stairRail(el, { bag, col }) {
  const [ax, ay, az] = el.a, [bx, by, bz] = el.b, h = el.h ?? 1.0, t = (el.th ?? 0.3) / 2;
  const Ln = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / Ln, (bz - az) / Ln], n = [-u[1], u[0]];
  const P = (s, yy, d) => [ax + u[0] * s + n[0] * d, yy, az + u[1] * s + n[1] * d], Y = (s) => ay + (by - ay) * s / Ln, S = [];
  hexa(S, [P(0, ay - 0.6, -t), P(Ln, by - 0.6, -t), P(Ln, by - 0.6, t), P(0, ay - 0.6, t)], [P(0, Y(0) + h, -t), P(Ln, Y(Ln) + h, -t), P(Ln, Y(Ln) + h, t), P(0, Y(0) + h, t)]);
  hexa(S, [P(-0.05, Y(0) + h, -t - 0.07), P(Ln + 0.05, Y(Ln) + h, -t - 0.07), P(Ln + 0.05, Y(Ln) + h, t + 0.07), P(-0.05, Y(0) + h, t + 0.07)], [P(-0.05, Y(0) + h + 0.14, -t - 0.07), P(Ln + 0.05, Y(Ln) + h + 0.14, -t - 0.07), P(Ln + 0.05, Y(Ln) + h + 0.14, t + 0.07), P(-0.05, Y(0) + h + 0.14, t + 0.07)]);
  bag.add('limestone', fromTriangles(S));
  for (const [s, yy] of [[0, ay], [Ln, by]]) { const p = P(s, 0, 0); ndPinnacle(bag, p[0], Math.max(yy, ay) - 0.6, p[2], 0.5, h + 2.2, 'limestone'); }
  col.segment([ax, az], [bx, bz], t * 2, ay - 0.6, by + h);
}

/**
 * Blind arcading on a stair's side { o [x, z], u, n (outward), u0, u1, y0 (the ground), ya, yb (the flight's top at u0 and u1), d0 (the face) }:
 * pointed arches on shafts stepping up under the slope.
 */
function stairArcade(el, { bag }) {
  const { o, u, n, u0, u1, y0, ya, yb } = el, sg = side(u, n), S = [], nbays = Math.max(1, Math.round((u1 - u0) / 2.2)), bw = (u1 - u0) / nbays;
  const slope = (uu) => ya + (yb - ya) * (uu - u0) / (u1 - u0);
  for (let i = 0; i < nbays; i++) {
    const uc = u0 + (i + 0.5) * bw, r = bw / 2 - 0.3, H = archRise({ r, pointed: 0.8 }), sp = slope(uc - r) - 0.55 - H;
    if (sp < y0 + 0.9) continue;
    bars(S, o, u, pointedPts(uc, r, sp, 0.8, 8), 0.16, 0.12, sg * el.d0);
    for (const sd of [-1, 1]) bars(S, o, u, [[uc + sd * r, y0 + 0.25], [uc + sd * r, sp]], 0.18, 0.12, sg * el.d0);
    bars(S, o, u, [[uc - r - 0.15, y0 + 0.15], [uc + r + 0.15, y0 + 0.15]], 0.3, 0.14, sg * el.d0);
  }
  bag.add('limestone', fromTriangles(S));
}

const base = STYLES.gothic;
registerStyle('gothic-chapelle', {
  ...base,
  elements: { ...base.elements, sc_turret: turret, sc_portal: portal, sc_balustrade: balustrade, sc_gablet: gablet, sc_front: frontFrames, sc_keep: keep, sc_gable: wgable, sc_pinnacle: scPinnacle, sc_cornice: cornice, sc_window_frame: windowFrame, sc_roof_dress: roofDress, sc_fleche: fleche, sc_tri_window: triWindow, sc_gallery: gallery, sc_stair_rail: stairRail, sc_stair_arcade: stairArcade },
});
