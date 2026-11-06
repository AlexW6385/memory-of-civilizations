// The Sainte-Chapelle's own pieces, on top of the Gothic style (src/styles/gothic): the west stair turrets —
// octagonal, in storeys with blind lancets and stair slits, a ring of gablets and a crocketed spirelet; the
// portals' moulded archivolts, jamb shafts and tympana (the upper one with the Last Judgement: Christ between
// the Virgin and St John, angels with the cross and the crown of thorns, St Michael weighing souls on the
// lintel); the openwork balustrade at the foot of the gable; gablets and pinnacles over the porch.
// docs/buildings/sainte-chapelle.md §4, §8.

import '../../styles/gothic/index.js';
import { STYLES, registerStyle } from '../../core/build.js';
import { lathe, fromTriangles } from '../../core/geom.js';
import { archRise, archHalf } from '../../styles/byzantine/index.js';
import { hexa, ellipsoid } from '../../styles/chinese/index.js';

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

const base = STYLES.gothic;
registerStyle('gothic-chapelle', {
  ...base,
  elements: { ...base.elements, sc_turret: turret, sc_portal: portal, sc_balustrade: balustrade, sc_gablet: gablet, sc_front: frontFrames, sc_keep: keep },
});
