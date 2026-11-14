// Mughal architecture of the Taj Mahal (1632–1653; docs/settlements/mughal-agra.md §4–§5): the
// mausoleum of white marble on its plinth, a square with chamfered corners, each face a great
// iwan (pishtaq: a pointed arch in a rectangular frame) flanked by two storeys of smaller arched
// niches; the bulbous double dome on its drum with a lotus crown and a finial, four domed kiosks
// (chhatri) round it; four minarets with balconies; the mosque and its twin of red sandstone with
// three white domes; the great gate; walls with octagonal towers; the charbagh garden with its
// raised channels and the central pool; the town of flat-roofed houses with balconies (jharokha).

import { Shape, Path, ExtrudeGeometry, Matrix4 } from '../../core/three.js';
import { registerStyle, STYLES, orientedBox } from '../../core/build.js';
import * as F from './furnish.js';
import { courtHouse } from './courthouse.js';
import { townHouse } from './townhouse.js';
import { inlayWorkshop } from './workshop.js';
import { gardenLodge } from './lodge.js';
import './fronts.js';
import { box, lathe, fromTriangles, frustum, disc, rod, orientOutward } from '../../core/geom.js';
import '../qing/index.js';
import { beamTris } from '../ming/index.js';

const W = 'marble_smooth', R = 'sandstone_red';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** The profile of a bulbous (onion) dome of radius r over its drum, height h, ending in a lotus and a finial. */
function onion(r, h) {
  const p = [];
  for (let i = 0; i <= 16; i++) {
    const t = i / 16, a = t * Math.PI;
    // swelling out a little past the drum, then drawing in to the neck
    const w = r * (1 + 0.12 * Math.sin(Math.min(1, t * 1.6) * Math.PI)) * Math.sin(Math.max(0.0001, Math.PI * 0.5 + a * 0.5)) ** 0.9;
    p.push([Math.max(0.001, w * (1 - t ** 3)), h * t]);
  }
  return p;
}
function dome(bag, mat, x, y, z, r, h, finial = true) {
  bag.add(mat, lathe(onion(r, h), 32, null, x, y, z));
  if (finial) {
    // (a neck from the dome's tip through the lotus to the spire: the crown is one piece with the dome)
    bag.add(mat, lathe([[r * 0.035, 0], [r * 0.03, r * 0.2]], 8, null, x, y + h * 0.97, z));
    bag.add(mat, lathe([[r * 0.18, 0], [r * 0.22, r * 0.06], [r * 0.1, r * 0.12], [0.001, r * 0.14]], 16, (t) => 1 + 0.25 * Math.max(0, Math.cos(t * 16)), x, y + h * 0.98, z));
    bag.add('gilt_bronze', lathe([[0.001, 0], [r * 0.03, 0], [r * 0.05, r * 0.15], [r * 0.025, r * 0.3], [r * 0.05, r * 0.42], [0.001, r * 0.6]], 8, null, x, y + h * 0.98 + r * 0.12, z));
  }
}

/** A pointed-arch shape (2D, in the u–v plane) of width w and height h (spring at h − w/2·0.9). */
function archPath(path, u0, w, h) {
  // a four-centred-looking pointed arch: two arcs of radius r, each centred on the far side
  const r = w * 0.8, rise = Math.sqrt(r * r - (r - w / 2) ** 2), spring = Math.max(0.3, h - rise);
  const cL = u0 + r, cR = u0 + w - r, N = 10;
  path.moveTo(u0, 0.04); path.lineTo(u0, spring);
  for (let i = 1; i <= N; i++) { const x = u0 + (w / 2) * i / N; path.lineTo(x, spring + Math.sqrt(Math.max(0, r * r - (x - cL) ** 2))); }
  for (let i = 1; i <= N; i++) { const x = u0 + w / 2 + (w / 2) * i / N; path.lineTo(x, spring + Math.sqrt(Math.max(0, r * r - (x - cR) ** 2))); }
  path.lineTo(u0 + w, 0.04); path.lineTo(u0, 0.04);
}

/**
 * A facade panel from a to b { y, h, th, mat } with arched openings cut into it, each with a recess
 * (a back wall `depth` behind the face): arches: [{ at, w, h, sill, depth }].
 */
function arcadeWall(bag, col, a, b, y, h, th, mat, arches = [], inside = null) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  const shape = new Shape();
  shape.moveTo(0, 0); shape.lineTo(L, 0); shape.lineTo(L, h); shape.lineTo(0, h); shape.lineTo(0, 0);
  for (const ar of arches) {
    const p = new Path(), sill = ar.sill ?? 0;
    archPath(p, ar.at - ar.w / 2, ar.w, ar.h);
    p.getPoints().length;
    const hole = new Path();
    const pts = p.getPoints().map((q) => [q.x, q.y + sill]);
    hole.moveTo(pts[0][0], pts[0][1]); for (const q of pts.slice(1)) hole.lineTo(q[0], q[1]);
    shape.holes.push(hole);
  }
  const g = new ExtrudeGeometry(shape, { depth: th, bevelEnabled: false, curveSegments: 6 });
  g.translate(0, 0, -th / 2);
  g.applyMatrix4(new Matrix4().makeBasis({ x: ux, y: 0, z: uz }, { x: 0, y: 1, z: 0 }, { x: -uz, y: 0, z: ux }).setPosition(a[0], y, a[1]));
  bag.add(mat, g);
  // the recesses' back walls (dark inside), the collision of the wall where no door opens
  // the recesses go back toward `inside` (the building's middle), else to the wall's left
  let nx = -uz, nz = ux;
  if (inside) { const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2; if ((inside[0] - mx) * nx + (inside[1] - mz) * nz < 0) { nx = -nx; nz = -nz; } }
  for (const ar of arches) {
    if (ar.alcove) { alcove(bag, col, [a[0] + ux * ar.at, a[1] + uz * ar.at], ux, uz, nx, nz, ar, th, y, mat); continue; }
    const d = ar.depth ?? 1.2, c = [a[0] + ux * ar.at + nx * (th / 2 + d), a[1] + uz * ar.at + nz * (th / 2 + d)], sill = ar.sill ?? 0;
    const t = [];
    beamTris(t, [c[0] - ux * ar.w / 2, y + sill, c[1] - uz * ar.w / 2], [c[0] + ux * ar.w / 2, y + sill, c[1] + uz * ar.w / 2], 0.1, ar.h);
    if (!ar.pass) bag.add(ar.door ? 'lacquer_black' : (ar.back || mat), fromTriangles(t));
  }
  // an arch with `pass` is open: no back wall, and one walks through it
  let u = 0;
  const P = (s) => [a[0] + ux * s, a[1] + uz * s];
  for (const ar of arches.filter((q) => q.pass).sort((p, q) => p.at - q.at)) {
    const s0 = ar.at - ar.w / 2, s1 = ar.at + ar.w / 2;
    if (s0 > u) col.segment(P(u), P(s0), th, y, y + h);
    col.segment(P(s0), P(s1), th, y + (ar.sill ?? 0) + ar.h, y + h);
    u = s1;
  }
  if (u < L) col.segment(P(u), P(L), th, y, y + h);
}

/**
 * The recess behind an arch with `alcove` (the iwans and niches of the tomb and the gate; docs/settlements/mughal-agra.md
 * §4): in plan half an octagon ('oct': the back narrower than the opening, the sides slanting) or a rectangle ('rect'),
 * its walls rising to the arch's springing, a band of muqarnas cells along the springing, the pointed half-dome
 * above meeting the arch at the face, a net of ribs on it; on the back wall a door below and a jali window above (or
 * only the jali in a raised niche); a blind arched panel on each side wall. at: the arch's centre on the wall's centre
 * line; (nx, nz) into the recess. Options for other styles (the Safavid court arcades): sideMat, backMat, domeMat,
 * ribMat, cellMat (the walls, the back, the half-dome, its ribs, the muqarnas cells; else mat); plain (no door, jali
 * or side panels); floor (a floor at the sill, for a niche raised above the ground).
 */
function alcove(bag, col, at, ux, uz, nx, nz, ar, th, y, mat) {
  const w = ar.w, h = ar.h, sill = ar.sill ?? 0, d = ar.depth ?? 1.2, y0 = y + sill, oct = ar.alcove !== 'rect';
  const SM = ar.sideMat ?? mat, DM = ar.domeMat ?? mat, RM = ar.ribMat ?? DM, CM = ar.cellMat ?? DM;
  const r = w * 0.8, rise = Math.sqrt(r * r - (r - w / 2) ** 2), spring = Math.max(0.3, h - rise), ys = y0 + spring;
  const n0 = th / 2 - 0.02, n1 = th / 2 + d, wb = oct ? Math.min(w * 0.46, w - 0.4) : w;
  const Q = (s, n) => [at[0] + ux * s + nx * n, at[1] + uz * s + nz * n];
  const per = [[-w / 2, n0], [-wb / 2, n1], [wb / 2, n1], [w / 2, n0]];
  const segL = [0, 1, 2].map((i) => Math.hypot(per[i + 1][0] - per[i][0], per[i + 1][1] - per[i][1])), tot = segL[0] + segL[1] + segL[2];
  const perim = (u) => { let l = u * tot; for (let i = 0; i < 3; i++) { if (l <= segL[i] || i === 2) { const f = Math.min(1, l / segL[i]); return [per[i][0] + (per[i + 1][0] - per[i][0]) * f, per[i][1] + (per[i + 1][1] - per[i][1]) * f]; } l -= segL[i]; } return per[3]; };
  const H = (t) => ys + Math.sqrt(Math.max(0, r * r - (w / 2 * t - r) ** 2));
  const V = (u, t) => { const p = perim(u), sn = [p[0] * (1 - t), p[1] + (n0 - p[1]) * t], q = Q(sn[0], sn[1]); return [q[0], H(t), q[1]]; };
  // the side walls and the back wall (none behind an arch one walks through: its own wall stands there)
  const sideT = 0.3;
  for (const sg of [-1, 1]) {
    const A = per[sg < 0 ? 0 : 3], Bk = per[sg < 0 ? 1 : 2], off = oct ? 0 : sg * sideT / 2;
    const pa = Q(A[0] + off, oct ? A[1] : th / 2), pb = Q(Bk[0] + off, Bk[1] + (ar.pass ? 0.2 : 0));
    // (`gap`: a door through each side, [t0, t1] along it from the opening: the gate's guard rooms open into the iwan)
    const lerp = (t) => [pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t], runs = ar.gap ? [[pa, lerp(ar.gap[0])], [lerp(ar.gap[1]), pb]] : [[pa, pb]];
    for (const [ra, rb] of runs) {
      bag.add(SM, orientedBox(ra, rb, sideT, y0, ys + 0.05, oct ? 0.12 : 0));         // a rect recess's sides meet the wall's back face, flush with the opening
      if (col && sill < 0.5) col.segment(ra, rb, sideT, y0, ys);
    }
    if (ar.gap) { const g0 = lerp(ar.gap[0]), g1 = lerp(ar.gap[1]); bag.add(SM, orientedBox(g0, g1, sideT, y0 + 3.7, ys + 0.05, oct ? 0.12 : 0)); if (col && sill < 0.5) col.segment(g0, g1, sideT, y0 + 3.7, ys); }
  }
  if (!ar.pass) bag.add(ar.backMat ?? SM, orientedBox(Q(-wb / 2 - 0.1, n1 + 0.15), Q(wb / 2 + 0.1, n1 + 0.15), 0.3, y0, ys + 0.05));
  // the floor of a raised niche, from the wall's back face to the back wall (the wall's own sill fills the opening)
  if (ar.floor && !oct) bag.add(SM, orientedBox(Q(-w / 2, (th / 2 + n1) / 2), Q(w / 2, (th / 2 + n1) / 2), n1 - th / 2, y0 - Math.min(sill, 0.5), y0));
  // the half-dome: rows from the springing up to the arch at the face, faced toward the opening
  const NU = 24, NT = 10, tris = [], tgt = Q(0, n0 - 4), ty = y0 + spring * 0.4;
  const push = (A, Bv, C) => {
    const ab = [A[0] - Bv[0], A[1] - Bv[1], A[2] - Bv[2]], cb = [C[0] - Bv[0], C[1] - Bv[1], C[2] - Bv[2]];
    const nrm = [cb[1] * ab[2] - cb[2] * ab[1], cb[2] * ab[0] - cb[0] * ab[2], cb[0] * ab[1] - cb[1] * ab[0]];
    const m = [(A[0] + Bv[0] + C[0]) / 3, (A[1] + Bv[1] + C[1]) / 3, (A[2] + Bv[2] + C[2]) / 3];
    const dot = nrm[0] * (tgt[0] - m[0]) + nrm[1] * (ty - m[1]) + nrm[2] * (tgt[1] - m[2]);
    if (dot >= 0) tris.push(...A, ...Bv, ...C); else tris.push(...A, ...C, ...Bv);
  };
  for (let i = 0; i < NU; i++) for (let j = 0; j < NT; j++) {
    const a1 = V(i / NU, j / NT), b1 = V((i + 1) / NU, j / NT), c1 = V((i + 1) / NU, (j + 1) / NT), d1 = V(i / NU, (j + 1) / NT);
    push(a1, b1, c1); if (j < NT - 1) push(a1, c1, d1);
  }
  bag.add(DM, fromTriangles(tris));
  // the net of ribs over it, standing a few centimetres proud toward the opening
  const ro = ar.ribOut ?? 0.035, inward = (p) => { const dx = tgt[0] - p[0], dy = ty - p[1], dz = tgt[1] - p[2], L = Math.hypot(dx, dy, dz) || 1; return [p[0] + dx / L * ro, p[1] + dy / L * ro, p[2] + dz / L * ro]; };
  const rb = Math.max(0.018, Math.min(0.035, w * 0.0025));
  for (let k = 0; k <= 8; k++) for (let j = 0; j < 4; j++) {
    const t0 = j / 4.4, t1 = (j + 1) / 4.4, u0 = k / 8;
    // each rib in ar.ribSeg pieces following the shell (one straight piece cuts in under it on a small hood)
    const ns = ar.ribSeg ?? 1, rib = (ua, ub) => { for (let q = 0; q < ns; q++) bag.add(RM, rod(inward(V(ua + (ub - ua) * q / ns, t0 + (t1 - t0) * q / ns)), inward(V(ua + (ub - ua) * (q + 1) / ns, t0 + (t1 - t0) * (q + 1) / ns)), rb, 4)); };
    if (k < 8) { rib(u0, u0 + 1 / 8); rib(u0 + 1 / 8, u0); }
  }
  for (const t of [0.0, 0.45, 0.68, 0.9]) for (let i = 0; i < 16; i++) bag.add(RM, rod(inward(V(i / 16, t)), inward(V((i + 1) / 16, t)), rb, 4));
  // muqarnas: two tiers of little corbelled cells along the springing, the upper set over the joints of the lower
  const cw = Math.max(0.35, Math.min(0.7, w * 0.07));
  for (let i = 0; i < 3; i++) {
    if (ar.pass && i === 1) continue;
    const A = per[i], Bk = per[i + 1], L = segL[i], ds = (Bk[0] - A[0]) / L, dn = (Bk[1] - A[1]) / L;
    let ms = -dn, mn = ds; if (ms * (0 - A[0]) + mn * ((n0 + n1) / 2 - A[1]) < 0) { ms = -ms; mn = -mn; }
    const n = Math.max(1, Math.floor(L / cw));
    for (const [tier, ya, yb, prot, shift] of [[0, ys - cw * 0.9, ys - cw * 0.1, cw * 0.28, 0], [1, ys - cw * 0.1, ys + cw * 0.7, cw * 0.5, 0.5]]) {
      for (let k = 0; k < n - tier; k++) {
        const c0 = (k + shift + 0.12) * L / n, c1 = (k + shift + 0.88) * L / n, o = prot / 2 + 0.1;
        const p0 = Q(A[0] + ds * c0 + ms * o, A[1] + dn * c0 + mn * o), p1 = Q(A[0] + ds * c1 + ms * o, A[1] + dn * c1 + mn * o);
        bag.add(CM, orientedBox(p0, p1, prot, ya, yb));
        // the cell's hood: a smaller block stepping out under the next tier
        const q0 = Q(A[0] + ds * (c0 + 0.08) + ms * (o + prot * 0.35), A[1] + dn * (c0 + 0.08) + mn * (o + prot * 0.35)), q1 = Q(A[0] + ds * (c1 - 0.08) + ms * (o + prot * 0.35), A[1] + dn * (c1 - 0.08) + mn * (o + prot * 0.35));
        bag.add(CM, orientedBox(q0, q1, prot * 0.3, yb - (yb - ya) * 0.3, yb));
      }
    }
  }
  // on the back wall: a door below and a jali above, framed in dark stone; or a jali alone in a raised niche
  const face = (s0, s1, v0, v1, o0, o1, m) => { const p0 = Q(s0, n1 - o1 + (o1 - o0) / 2), p1 = Q(s1, n1 - o1 + (o1 - o0) / 2); bag.add(m, orientedBox(p0, p1, o1 - o0, v0, v1)); };
  const frame = (s0, s1, v0, v1, fw, m) => { face(s0 - fw, s0, v0, v1 + fw, 0.01, 0.05, m); face(s1, s1 + fw, v0, v1 + fw, 0.01, 0.05, m); face(s0, s1, v1, v1 + fw, 0.01, 0.05, m); };
  const jali = (s0, s1, v0, v1) => {
    face(s0, s1, v0, v1, 0.012, 0.02, 'lacquer_black');
    const nb = Math.max(4, Math.round((s1 - s0) / 0.28)), nv = Math.max(4, Math.round((v1 - v0) / 0.28)), bw = 0.045;
    for (let g = 1; g < nb; g++) { const sg = s0 + (s1 - s0) * g / nb; face(sg - bw, sg + bw, v0, v1, 0.02, 0.08, W); }
    for (let g = 1; g < nv; g++) { const vg = v0 + (v1 - v0) * g / nv; face(s0, s1, vg - bw, vg + bw, 0.02, 0.08, W); }
    frame(s0, s1, v0, v1, 0.14, 'marble_dark');
  };
  if (!ar.pass && !ar.plain) {
    const jw = Math.min(wb * 0.62, 3.6);
    if (sill < 0.5 && spring > 4) {
      const dw = Math.min(wb * 0.5, 2.6), dh = Math.min(spring * 0.5, 4.2);
      face(-dw / 2, dw / 2, y0, y0 + dh, 0.012, 0.09, 'wood_dark');
      for (let k = 0; k < 5; k++) for (const sg of [-1, 1]) face(sg * dw / 4 - 0.05, sg * dw / 4 + 0.05, y0 + 0.5 + k * (dh - 1) / 4, y0 + 0.6 + k * (dh - 1) / 4, 0.09, 0.12, 'gilt_bronze');
      frame(-dw / 2, dw / 2, y0, y0 + dh, 0.18, 'marble_dark');
      const j0 = y0 + dh + 0.8, j1 = Math.min(ys - 0.3, j0 + jw * 1.4);
      if (j1 - j0 > 0.8) jali(-jw / 2, jw / 2, j0, j1);
    } else {
      const j0 = y0 + spring * 0.18, j1 = ys - Math.max(0.3, spring * 0.08);
      if (j1 - j0 > 0.6) jali(-jw / 2, jw / 2, j0, j1);
    }
  }
  // a blind arched panel framed in dark stone on each slanting side
  if (oct && spring > 3 && !ar.plain) for (const sg of [-1, 1]) {
    const A = per[sg < 0 ? 0 : 3], Bk = per[sg < 0 ? 1 : 2], L = Math.hypot(Bk[0] - A[0], Bk[1] - A[1]), ds = (Bk[0] - A[0]) / L, dn = (Bk[1] - A[1]) / L;
    let ms = -dn, mn = ds; if (ms * (0 - A[0]) + mn * ((n0 + n1) / 2 - A[1]) < 0) { ms = -ms; mn = -mn; }
    const o = sideT / 2 + 0.03, P2 = (c) => Q(A[0] + ds * c + ms * o, A[1] + dn * c + mn * o);
    const c0 = L * 0.18, c1 = L * 0.82, v0 = y0 + spring * 0.12, v1 = ys - spring * 0.12;
    for (const [p, q, va, vb] of [[c0, c0 + 0.1, v0, v1], [c1 - 0.1, c1, v0, v1], [c0, c1, v1 - 0.1, v1], [c0, c1, v0, v0 + 0.1]]) bag.add('marble_dark', orientedBox(P2(p), P2(q), 0.04, va, vb));
  }
}

/**
 * pishtaq_face: one face of the mausoleum or a gate { a, b, y, h, iwan: { w, h }, niches (the two
 * storeys of niches either side), mat, trim }: the face with the great arch in its middle, the
 * niches beside it, a parapet with a frieze along the top.
 */
function pishtaqFace(bag, col, a, b, y, h, iw, mat, niches = true, inside = null, trim = 'marble_dark') {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const arches = [{ at: L / 2, w: iw.w, h: iw.h, depth: iw.depth ?? 4, door: !iw.pass && !iw.back, back: iw.back, pass: iw.pass, alcove: iw.alcove && (iw.pass ? 'rect' : iw.alcove), gap: iw.gap }];
  if (niches) for (const s of [-1, 1]) {
    const c = L / 2 + s * (iw.w / 2 + (L - iw.w) / 4);
    const nw = Math.min((L - iw.w) / 2 - 2, iw.w * 0.45);
    arches.push({ at: c, w: nw, h: iw.h * 0.42, sill: 0.6, depth: 1.5, alcove: iw.alcove && 'oct' }, { at: c, w: nw, h: iw.h * 0.38, sill: iw.h * 0.52, depth: 1.5, alcove: iw.alcove && 'oct' });
  }
  arcadeWall(bag, col, a, b, y, h, 2.4, mat, arches, inside);
  if (iw.pass) {
    // an open iwan: its back wall has a door one walks through
    const L0 = L, ux0 = (b[0] - a[0]) / L0, uz0 = (b[1] - a[1]) / L0;
    let mx = -uz0, mz = ux0;
    if (inside) { if ((inside[0] - (a[0] + b[0]) / 2) * mx + (inside[1] - (a[1] + b[1]) / 2) * mz < 0) { mx = -mx; mz = -mz; } }
    const off = 1.2 + (iw.depth ?? 4) + 0.2, c0 = [a[0] + ux0 * L0 / 2 + mx * off, a[1] + uz0 * L0 / 2 + mz * off];
    const p0 = [c0[0] - ux0 * iw.w / 2, c0[1] - uz0 * iw.w / 2], p1 = [c0[0] + ux0 * iw.w / 2, c0[1] + uz0 * iw.w / 2];
    const dw = Math.min(5, iw.w * 0.45);
    arcadeWall(bag, col, p0, p1, y, iw.h, 0.4, iw.backMat || mat, [{ at: iw.w / 2, w: dw, h: iw.doorH ?? Math.min(iw.h * 0.5, dw * 1.6), pass: true }]);
  }
  faceDecor(bag, a, b, y, h, iw, mat, niches, inside);
}

/**
 * The inlay and carving of a pishtaq face (docs/settlements/mughal-agra.md §4): the inscription band
 * framing the great arch — black letters on white, larger the higher they stand; the spandrels'
 * flowering vines of inlaid stones round a rosette; the dado of flowering plants carved in relief in
 * panels framed in dark stone.
 */
function faceDecor(bag, a, b, y, h, iw, mat, niches, inside, opt = {}) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  let nx = -uz, nz = ux;
  if (inside && (inside[0] - (a[0] + b[0]) / 2) * nx + (inside[1] - (a[1] + b[1]) / 2) * nz > 0) { nx = -nx; nz = -nz; }
  const F = opt.F ?? 1.2, buckets = new Map(), rnd = rng(Math.round(Math.abs(a[0] * 7 + a[1] * 13)) + 1);
  const P = (s2, v, o) => [a[0] + ux * s2 + nx * (F + o), y + v, a[1] + uz * s2 + nz * (F + o)];
  const slab = (m, s0, s1, v0, v1, o0, o1) => {
    if (!buckets.has(m)) buckets.set(m, []);
    if (o0 === 0 && m.startsWith('inlay_')) o0 = -0.02;                  // the stones set into the marble, not laid on it
    const t = [], q = (p1, p2, p3, p4) => t.push(...p1, ...p2, ...p3, ...p1, ...p3, ...p4);
    const c = [P(s0, v0, o0), P(s1, v0, o0), P(s1, v1, o0), P(s0, v1, o0), P(s0, v0, o1), P(s1, v0, o1), P(s1, v1, o1), P(s0, v1, o1)];
    q(c[0], c[1], c[2], c[3]); q(c[4], c[7], c[6], c[5]); q(c[0], c[4], c[5], c[1]); q(c[1], c[5], c[6], c[2]); q(c[2], c[6], c[7], c[3]); q(c[3], c[7], c[4], c[0]);
    buckets.get(m).push(...orientOutward(t));
  };
  const DK = 'marble_dark', field = mat === W ? null : W;
  const sL = L / 2 - iw.w / 2, sR = L / 2 + iw.w / 2, gap = 0.35, bw = Math.min(1.5, iw.w * 0.09), vTop = Math.min(iw.h + 0.5, h - bw - 0.4);
  // the inscription band: field, borders, letters running along it
  const band = (s0, s1, v0, v1, along) => {
    if (field) slab(field, s0, s1, v0, v1, 0, 0.03);
    const o = 0.03;
    if (along === 'v') { slab(DK, s0, s0 + 0.06, v0, v1, o, o + 0.02); slab(DK, s1 - 0.06, s1, v0, v1, o, o + 0.02); }
    else { slab(DK, s0, s1, v0, v0 + 0.06, o, o + 0.02); slab(DK, s0, s1, v1 - 0.06, v1, o, o + 0.02); }
    const len = along === 'v' ? v1 - v0 : s1 - s0, cw = (along === 'v' ? s1 - s0 : v1 - v0) - 0.2;
    if (opt.flowers) {
      // a running scroll of flowers in place of the inscription (the jawab)
      for (let t = 0.3, j = 0; t < len - 0.3; t += 0.5, j++) {
        const cs = along === 'v' ? (s0 + s1) / 2 : s0 + t, cv = along === 'v' ? v0 + t : (v0 + v1) / 2, fr = Math.min(0.12, cw * 0.18);
        slab(['inlay_carnelian', 'inlay_yellow', 'inlay_lapis'][j % 3], cs - fr, cs + fr, cv - fr, cv + fr, o, o + 0.015);
        if (along === 'v') slab('inlay_jade', cs - fr * 0.5, cs + fr * 0.5, cv + fr, cv + 0.25, o, o + 0.012); else slab('inlay_jade', cs + fr, cs + 0.25, cv - fr * 0.5, cv + fr * 0.5, o, o + 0.012);
      }
      return;
    }
    for (let t = 0.15; t < len - 0.15;) {
      const vv = along === 'v' ? v0 + t : (v0 + v1) / 2, k = (1 + 0.45 * (vv / h)) * Math.max(0.6, bw / 1.2), cell = 0.2 * k;
      const S2 = (tt, c0, c1, w2) => (along === 'v' ? slab(DK, s0 + 0.1 + c0 * cw, s0 + 0.1 + c1 * cw, v0 + tt, v0 + tt + w2, o, o + 0.012) : slab(DK, s0 + tt, s0 + tt + w2, v0 + 0.1 + c0 * cw, v0 + 0.1 + c1 * cw, o, o + 0.012));
      S2(t, 0.25, 0.32, cell);                                     // the baseline
      const r = rnd();
      if (r < 0.4) S2(t + cell * 0.2, 0.25, 0.25 + 0.55 * Math.min(1, k * 0.8), 0.035 * k);     // a tall upright (alif, lam)
      else if (r < 0.7) { S2(t + cell * 0.1, 0.3, 0.5, 0.03 * k); S2(t + cell * 0.1, 0.48, 0.52, cell * 0.6); }
      else S2(t + cell * 0.4, 0.6, 0.66, 0.05 * k);                // a dot
      t += cell + 0.03;
    }
  };
  const e0 = sL - gap - bw, e1 = sR + gap + bw;
  band(e0, sL - gap, 0.2, vTop, 'v'); band(sR + gap, e1, 0.2, vTop, 'v'); band(e0, e1, vTop, vTop + bw, 's');
  // the spandrels: a vine of inlaid stones along the arch, flowers on it, a rosette in the angle
  const w = iw.w, r = w * 0.8, rise = Math.sqrt(r * r - (r - w / 2) ** 2), spring = Math.max(0.3, iw.h - rise), cLs = sL + r;
  const arcV = (x) => spring + Math.sqrt(Math.max(0, r * r - (x - cLs) ** 2));
  const FL = ['inlay_carnelian', 'inlay_yellow', 'inlay_carnelian', 'inlay_lapis'];
  for (const sd of [-1, 1]) {
    const S = (x) => (sd < 0 ? x : L - x);
    let prev = null, nfl = 0;
    for (let j = 0; j <= 64; j++) {
      const x = sL + (w / 2) * j / 64, vv = arcV(x) + 0.45 + 0.1 * Math.sin(j * 0.5);
      if (vv > vTop - 0.15) break;
      if (prev) { const s0 = Math.min(S(prev[0]), S(x)), s1 = Math.max(S(prev[0]), S(x)); slab(DK, s0, s1 + 0.035, Math.min(prev[1], vv), Math.max(prev[1], vv) + 0.035, 0, 0.015); }
      if (j % 10 === 5 && vv + 0.3 < vTop) {
        const fx = S(x), m2 = FL[nfl++ % FL.length];
        for (let p2 = 0; p2 < 5; p2++) { const an = p2 / 5 * Math.PI * 2, px = fx + Math.cos(an) * 0.1, pv = vv + 0.16 + Math.sin(an) * 0.1; slab(m2, px - 0.045, px + 0.045, pv - 0.045, pv + 0.045, 0, 0.03); }   // standing clear of the vine where it crosses
        slab('inlay_yellow', fx - 0.03, fx + 0.03, vv + 0.13, vv + 0.19, 0, 0.036);
        slab('inlay_jade', fx + 0.06 * sd, fx + 0.2 * sd > fx ? fx + 0.2 : fx - 0.06, vv - 0.06, vv + 0.0, 0, 0.016);
      }
      prev = [x, vv];
    }
    // the rosette in the angle between the arch and the band
    const rx = S(sL + w * 0.12), rv = (arcV(sL + w * 0.12) + vTop) / 2 + 0.2, rr = Math.min(0.8, (vTop - arcV(sL + w * 0.12)) * 0.3);
    if (rr > 0.2) {
      for (let p2 = 0; p2 < 12; p2++) { const an = p2 / 12 * Math.PI * 2, px = rx + Math.cos(an) * rr * 0.7, pv = rv + Math.sin(an) * rr * 0.7; slab(p2 % 2 ? 'inlay_jade' : 'inlay_carnelian', px - rr * 0.14, px + rr * 0.14, pv - rr * 0.14, pv + rr * 0.14, 0, 0.018); }
      slab('inlay_yellow', rx - rr * 0.22, rx + rr * 0.22, rv - rr * 0.22, rv + rr * 0.22, 0, 0.022);
      // a spray of stems from the rosette, each ending in a flower between two leaves
      for (let p2 = 0; p2 < 6; p2++) {
        const an = p2 / 6 * Math.PI * 2 + 0.3, x0 = rx + Math.cos(an) * rr * 0.9, v0 = rv + Math.sin(an) * rr * 0.9;
        for (let q2 = 1; q2 <= 6; q2++) { const rr2 = rr * (0.9 + q2 * 0.22), a2 = an + q2 * 0.08, px = rx + Math.cos(a2) * rr2, pv = rv + Math.sin(a2) * rr2; if (pv < arcV(Math.min(sR, Math.max(sL, sd < 0 ? px : L - px))) + 0.6 || pv > vTop - 0.1) break; if (q2 < 6) slab(DK, px - 0.022, px + 0.022, pv - 0.022, pv + 0.022, 0, 0.014);
          if (q2 === 6) { slab(FL[p2 % 4], px - 0.07, px + 0.07, pv - 0.07, pv + 0.07, 0, 0.02); slab('inlay_jade', px - 0.16, px - 0.08, pv - 0.03, pv + 0.03, 0, 0.016); slab('inlay_jade', px + 0.08, px + 0.16, pv - 0.03, pv + 0.03, 0, 0.016); } }
        void x0; void v0;
      }
    }
  }
  // the dado: panels framed in dark stone, a flowering plant carved in each, between the openings
  const holes = [[sL - gap - bw - 0.1, sR + gap + bw + 0.1], ...(opt.holes || [])];
  if (niches) for (const sd of [-1, 1]) { const c = L / 2 + sd * (iw.w / 2 + (L - iw.w) / 4), nw = Math.min((L - iw.w) / 2 - 2, iw.w * 0.45); holes.push([c - nw / 2 - 0.15, c + nw / 2 + 0.15]); }
  const DH = 1.5;
  let s0 = 0.4;
  const runs = [];
  for (const [h0, h1] of holes.sort((p, q) => p[0] - q[0])) { if (h0 > s0 + 0.8) runs.push([s0, h0]); s0 = Math.max(s0, h1); }
  if (L - 0.4 > s0 + 0.8) runs.push([s0, L - 0.4]);
  for (const [r0, r1] of runs) {
    const np = Math.max(1, Math.round((r1 - r0) / 1.5)), pw = (r1 - r0) / np;
    slab(DK, r0, r1, DH, DH + 0.08, 0, 0.04);
    for (let k = 0; k < np; k++) {
      const p0 = r0 + k * pw, p1 = p0 + pw, pc = (p0 + p1) / 2;
      slab(DK, p0, p0 + 0.05, 0.25, DH, 0, 0.02); slab(DK, p1 - 0.05, p1, 0.25, DH, 0, 0.02); slab(DK, p0, p1, 0.25, 0.3, 0, 0.02);
      const R2 = W;
      slab(R2, pc - 0.025, pc + 0.025, 0.32, 1.25, 0, 0.05);
      for (const [dv, ds] of [[0.5, -1], [0.62, 1], [0.8, -1], [0.92, 1]]) slab(R2, Math.min(pc, pc + ds * 0.22), Math.max(pc, pc + ds * 0.22), dv, dv + 0.06, 0, 0.04);
      for (const [fs, fv] of [[0, 1.3], [-0.22, 1.06], [0.22, 1.14]]) { slab(R2, pc + fs - 0.08, pc + fs + 0.08, fv - 0.06, fv + 0.06, 0, 0.07); slab(R2, pc + fs - 0.05, pc + fs + 0.05, fv + 0.06, fv + 0.14, 0, 0.06); }
    }
  }
  for (const [m, t] of buckets) bag.add(m, fromTriangles(t));
}

/** chhatri: a domed kiosk { c, y, r, h, n (columns), mat } on a little platform. */
function chhatri(bag, col, x, y, z, r, h, n = 8, mat = W, domeMat = W) {
  bag.add(mat, lathe([[r * 1.15, 0], [r * 1.15, 0.4], [0.001, 0.4]], n, null, x, y, z));
  for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2 + Math.PI / n; bag.add(mat, lathe([[r * 0.09, 0], [r * 0.07, h], [r * 0.1, h + 0.1]], 8, null, x + Math.cos(a) * r, y + 0.4, z + Math.sin(a) * r)); }
  bag.add(mat, lathe([[r * 1.25, 0], [r * 1.25, 0.25], [r * 1.05, 0.5], [0.001, 0.5]], n, null, x, y + 0.4 + h, z));       // the chhajja (eave)
  dome(bag, domeMat, x, y + 0.9 + h, z, r * 0.95, r * 1.4);
  if (col) col.circle(x, z, r * 1.15, y, y + h + 1);
}

/** minaret: a tapering round tower { c, y, h, r } on an octagonal base, in three stages divided by balconies
 *  on brackets with railings; the marble blocks outlined by thin dark joints (rings and verticals); a kiosk on top. */
function minaret(bag, col, x, y, z, h, r) {
  bag.add(W, lathe([[r * 1.45, 0], [r * 1.45, 2.2], [r * 1.3, 2.5], [0.001, 2.5]], 8, null, x, y, z));
  bag.add('marble_dark', lathe([[r * 1.47, 2.0], [r * 1.47, 2.12], [r * 1.44, 2.12], [r * 1.44, 2.0]], 8, null, x, y, z));
  const rad = (yy) => r * (1.08 - 0.26 * Math.max(0, yy - 2.5) / (h - 2.5));
  bag.add(W, lathe([[rad(2.5), 2.5], [rad(h), h], [0.001, h]], 24, null, x, y, z));
  // the joints: rings every 2 m, eight verticals
  for (let yy = 4; yy < h - 0.5; yy += 2) bag.add('marble_dark', lathe([[rad(yy) + 0.012, yy], [rad(yy) + 0.012, yy + 0.06], [rad(yy) - 0.01, yy + 0.06], [rad(yy) - 0.01, yy]], 24, null, x, y, z));
  for (let k = 0; k < 8; k++) { const a = (k + 0.5) / 8 * Math.PI * 2; bag.add('marble_dark', rod([x + Math.cos(a) * (rad(2.6) + 0.01), y + 2.6, z + Math.sin(a) * (rad(2.6) + 0.01)], [x + Math.cos(a) * (rad(h - 0.2) + 0.01), y + h - 0.2, z + Math.sin(a) * (rad(h - 0.2) + 0.01)], 0.03, 3)); }
  for (const f of [0.34, 0.64, 0.92]) {
    const yb = y + h * f - 1.2, rr = rad(h * f - 1.2), R = rr * 1.6;
    bag.add(W, lathe([[rr, 0], [R * 0.98, 0.7], [R, 1.1], [R * 0.94, 1.15], [0.001, 1.15]], 24, null, x, yb, z));
    for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; bag.add(W, rod([x + Math.cos(a) * rr, yb - 0.6, z + Math.sin(a) * rr], [x + Math.cos(a) * R * 0.9, yb + 0.8, z + Math.sin(a) * R * 0.9], 0.09, 4)); }
    // the railing: posts and a rail round the balcony's edge
    for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; bag.add(W, box(x + Math.cos(a) * R * 0.95 - 0.05, yb + 1.15, z + Math.sin(a) * R * 0.95 - 0.05, x + Math.cos(a) * R * 0.95 + 0.05, yb + 1.95, z + Math.sin(a) * R * 0.95 + 0.05)); }
    bag.add(W, lathe([[R, 0], [R, 0.12], [R * 0.9, 0.12], [R * 0.9, 0]], 24, null, x, yb + 1.95, z));
    bag.add('marble_dark', lathe([[rr + 0.02, -0.2], [rr + 0.02, -0.05], [rr - 0.01, -0.05], [rr - 0.01, -0.2]], 24, null, x, yb, z));
  }
  chhatri(bag, null, x, y + h + 0.3, z, r * 0.95, 3.4, 8);
  col.circle(x, z, r * 1.45, y, y + h);
}

/**
 * mausoleum: the tomb { c, y (the plinth's top), a (half-width of the square), chamfer, h (the
 * walls' height), dome: { r, h, drum } }: four faces with their iwans, four chamfered corners with
 * smaller iwans, the drum and the onion dome, the four chhatris.
 */
function mausoleum(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y, A = el.a, C = el.chamfer, H = el.h;
  const P = [[-A + C, -A], [A - C, -A], [A, -A + C], [A, A - C], [A - C, A], [-A + C, A], [-A, A - C], [-A, -A + C]].map(([x, z]) => [cx + x, cz + z]);
  for (let k = 0; k < 8; k++) {
    const a = P[k], b = P[(k + 1) % 8], main = k % 2 === 0;
    pishtaqFace(bag, col, a, b, y, H, main ? { w: (A - C) * 2 * 0.42, h: H * 0.82, depth: 5, pass: el.interior && k === 4, alcove: 'oct' } : { w: C * 1.4 * 0.5, h: H * 0.42, alcove: 'oct', depth: 2.2 }, W, main, [cx, cz]);
  }
  if (el.interior) tombChamber(bag, col, cx, cz, y, A);
  bag.add(W, box(cx - A + 2, y + H - 0.8, cz - A + 2, cx + A - 2, y + H, cz + A - 2));
  col.floor([cx - A, cz - A, cx + A, cz + A], y + H);
  // the drum and the dome
  const dr = el.dome.r, dh = el.dome.h, drum = el.dome.drum;
  bag.add(W, lathe([[dr * 1.02, 0], [dr * 1.02, drum], [dr * 1.08, drum + 0.6], [dr, drum + 0.8]], 32, null, cx, y + H, cz));
  dome(bag, W, cx, y + H + drum + 0.8, cz, dr, dh);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) chhatri(bag, null, cx + sx * (A - C) * 0.75, y + H, cz + sz * (A - C) * 0.75, 3.4, 4.6, 8);
  // pinnacles at the corners of the chamfers
  for (const p of P) bag.add(W, lathe([[0.7, 0], [0.55, H + 4 - y + y], [0.001, H + 5.5]], 8, null, p[0], y, p[1]));
}

/**
 * The tomb chamber (docs/settlements/mughal-agra.md §4): an octagon of 7.3 m sides, each face with
 * two storeys of arched niches, those on the axes opening through jali screens to the light (the
 * south one the way in, by a vestibule from the great iwan); a ring closing the octagon to the inner
 * dome with its sun at the crown; a dado of carved panels, inlay of coloured stones in the
 * spandrels; at the centre the octagonal marble screen (1643), three panels a side, one open, round
 * the cenotaph of Mumtaz Mahal on its platform. (Shah Jahan's cenotaph came only in 1666.)
 */
function tombChamber(bag, col, cx, cz, y, A) {
  const side = 7.3, ap = side / 2 / Math.tan(Math.PI / 8), th = 1.5, Hw = 20, rc = ap / Math.cos(Math.PI / 8);
  const vtx = (k, r) => { const a = Math.PI / 8 + k * Math.PI / 4 - Math.PI / 2; return [cx + Math.cos(a) * r, cz + Math.sin(a) * r]; };
  const rw = (ap + th / 2) / Math.cos(Math.PI / 8);
  for (let k = 0; k < 8; k++) {
    const a = vtx(k, rw), b = vtx(k + 1, rw), mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2, out = [cx + (mx - cx) * 3, cz + (mz - cz) * 3];
    const axis = k % 2 === 1, south = mz - cz > ap * 0.9 && Math.abs(mx - cx) < 1, L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    arcadeWall(bag, col, a, b, y, Hw, th, W, [
      { at: L / 2, w: axis ? 5 : 4.2, h: 9, depth: 0.7, pass: south, back: axis ? 'daylight' : W },
      { at: L / 2, w: 4.2, h: 6, sill: 11, depth: 0.7, back: axis ? 'daylight' : W },
    ], out);
    // the inner face: a dado of carved panels, the niches' frames and their spandrels inlaid
    const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, nx = (cx - mx) / Math.hypot(cx - mx, cz - mz), nz = (cz - mz) / Math.hypot(cx - mx, cz - mz);
    const Q = (s2, o) => [a[0] + ux * s2 + nx * (th / 2 + o), a[1] + uz * s2 + nz * (th / 2 + o)];
    const slab = (s0, s1, ya, yb, o0, o1, m) => { const t = [], p = Q((s0 + s1) / 2, (o0 + o1) / 2); beamTris(t, [p[0] - ux * (s1 - s0) / 2, ya, p[1] - uz * (s1 - s0) / 2], [p[0] + ux * (s1 - s0) / 2, ya, p[1] + uz * (s1 - s0) / 2], (o1 - o0) / 2, yb - ya); bag.add(m, fromTriangles(t)); };
    const nw = axis ? 5 : 4.2;
    for (const [s0, s1] of [[0.25, L / 2 - nw / 2 - 0.35], [L / 2 + nw / 2 + 0.35, L - 0.25]]) {
      if (s1 - s0 < 0.3) continue;
      slab(s0, s1, y, y + 1.6, 0, 0.05, 'marble_dark');
      slab(s0 + 0.08, s1 - 0.08, y + 0.08, y + 1.52, 0.05, 0.09, W);
      const fc = (s0 + s1) / 2; for (const [dy, r2] of [[0.8, 0.22], [0.45, 0.12], [1.15, 0.12]]) { const p = Q(fc, 0.1); bag.add('marble_column', lathe([[0.001, 0], [r2, 0.04], [r2 * 0.7, 0.09], [0.001, 0.1]], 8, null, p[0], y + dy - 0.05, p[1])); }
      slab(s0, s1, y + 1.6, y + 1.72, 0, 0.1, 'marble_dark');
    }
    // the frames round both niches; the spandrels' inlay (red, green, gold and blue stones)
    for (const [ya, hh] of [[y, 9], [y + 11, 6]]) {
      for (const sg of [-1, 1]) slab(L / 2 + sg * (nw / 2 + 0.3) - 0.05, L / 2 + sg * (nw / 2 + 0.3) + 0.05, ya, ya + hh + 0.85, 0, 0.05, 'marble_dark');
      slab(L / 2 - nw / 2 - 0.35, L / 2 + nw / 2 + 0.35, ya + hh + 0.75, ya + hh + 0.85, 0, 0.05, 'marble_dark');
      for (const sg of [-1, 1]) for (let j = 0; j < 5; j++) {
        const p = Q(L / 2 + sg * (nw / 2 - 0.2 - j * 0.12), 0.06), yy = ya + hh - 0.6 + (j % 2) * 0.25 - j * 0.05;
        const m = ['inlay_carnelian', 'inlay_jade', 'inlay_yellow', 'inlay_lapis', 'inlay_carnelian'][j];
        const t = []; beamTris(t, [p[0] - ux * 0.05, yy, p[1] - uz * 0.05], [p[0] + ux * 0.05, yy, p[1] + uz * 0.05], 0.015, 0.14); bag.add(m, fromTriangles(t));
        const t2 = []; beamTris(t2, [p[0] - ux * 0.11, yy + 0.05, p[1] - uz * 0.11], [p[0] + ux * 0.11, yy + 0.05, p[1] + uz * 0.11], 0.015, 0.04); bag.add('inlay_jade', fromTriangles(t2));
      }
    }
    // the jali in the axial niches: a lattice of marble over the light
    if (axis) for (const [ya, hh, ww] of [[y, 9, 5], [y + 11, 6, 4.2]]) {
      if (south && ya === y) continue;
      const bk = (s0, s1, yb0, yb1) => { const p = Q((s0 + s1) / 2, -(th + 0.7) + 0.12), t = []; beamTris(t, [p[0] - ux * (s1 - s0) / 2, yb0, p[1] - uz * (s1 - s0) / 2], [p[0] + ux * (s1 - s0) / 2, yb0, p[1] + uz * (s1 - s0) / 2], 0.05, yb1 - yb0); bag.add(W, fromTriangles(t)); };
      const top = ya + hh - ww * 0.5;
      for (let g = 0; g <= 12; g++) bk(L / 2 - ww / 2 + g * ww / 12 - 0.04, L / 2 - ww / 2 + g * ww / 12 + 0.04, ya, top);
      for (let g = 0; g <= Math.floor((top - ya) / 0.42); g++) bk(L / 2 - ww / 2, L / 2 + ww / 2, ya + g * 0.42 - 0.04, ya + g * 0.42 + 0.04);
    }
  }
  // the ring from the octagon to the dome's circle, the inner dome with its sun
  const yr = y + Hw - 0.02;
  bag.add(W, lathe([[rc + th * 1.2, 0], [ap * 0.995, 0]], 32, null, cx, yr, cz));
  bag.add(W, lathe([[ap * 0.995, 0.02], [rc + th * 1.2, 0.02]], 32, null, cx, yr, cz));
  const inner = [[0.001, ap * 0.62], [ap * 0.45, ap * 0.56], [ap * 0.75, ap * 0.4], [ap * 0.92, ap * 0.2], [ap * 0.99, 0], [ap * 0.99, -0.6]];
  bag.add(W, lathe(inner, 32, null, cx, y + Hw, cz));
  bag.add('marble_dark', lathe([[ap * 0.99, -0.62], [ap * 0.99, -0.02], [ap * 0.985, -0.02], [ap * 0.985, -0.62]], 32, null, cx, y + Hw, cz));
  const ys = y + Hw + ap * 0.62 - 0.03;
  bag.add('gilt_bronze', disc(0.9, ys, 24, cx, cz, false));
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2, r0 = 0.9, r1 = k % 2 ? 2.2 : 3.0; const p0 = [cx + Math.cos(a) * r0, cz + Math.sin(a) * r0], p1 = [cx + Math.cos(a) * r1, cz + Math.sin(a) * r1], yy = (r) => y + Hw + ap * 0.62 - 0.05 - (r / ap) ** 2 * ap * 0.5; bag.add(k % 2 ? 'stucco_saffron' : 'gilt_bronze', rod([p0[0], yy(r0), p0[1]], [p1[0], yy(r1), p1[1]], 0.07, 4)); }
  // the floor: an octagon of white in dark borders
  bag.add('marble_dark', disc(rc, 0, 8).rotateY(Math.PI / 8).translate(cx, y + 0.03, cz));
  bag.add('marble_floor', disc(rc * (ap - 0.45) / ap, 0, 8).rotateY(Math.PI / 8).translate(cx, y + 0.05, cz));
  // the vestibule from the great iwan's door to the chamber
  const z0 = cz + ap + th, z1 = cz + A - 6.4 - 0.2;
  for (const sg of [-1, 1]) { bag.add(W, box(cx + sg * 2.5 - (sg > 0 ? 0 : 0.6), y, z0, cx + sg * 2.5 + (sg > 0 ? 0.6 : 0), y + 9.4, z1)); col.rect([Math.min(cx + sg * 2.5, cx + sg * 3.1), z0, Math.max(cx + sg * 2.5, cx + sg * 3.1), z1], y, y + 9.4); }
  bag.add(W, box(cx - 2.5, y + 9, z0, cx + 2.5, y + 9.4, z1));
  for (let zz = z0 + 1; zz < z1 - 0.5; zz += 1.8) bag.add('marble_dark', box(cx - 2.5, y + 8.85, zz - 0.1, cx + 2.5, y + 9, zz + 0.1));
  for (const sg of [-1, 1]) for (let zz = z0 + 0.6; zz < z1 - 1; zz += 2.6) { bag.add('marble_dark', box(cx + sg * 2.5 - (sg > 0 ? 0.06 : 0), y, zz, cx + sg * 2.5 + (sg < 0 ? 0.06 : 0), y + 1.6, zz + 2.2)); bag.add(W, box(cx + sg * 2.5 - (sg > 0 ? 0.1 : 0), y + 0.08, zz + 0.08, cx + sg * 2.5 + (sg < 0 ? 0.1 : 0), y + 1.52, zz + 2.12)); }
  // the screen (tajmahal.gov.in): octagonal, each side divided in three by marble frames filled with jalis pierced in
  // plant arabesques, flowers inlaid in the frames, posts at the corners ending in kalasha finials, a cresting of
  // kanguras; the entrance arch in the middle of the south side rising above it, a closed twin on the north
  const sa = 3.6, sr = sa / Math.cos(Math.PI / 8), sh = 1.9, ST = 0.08, FL = ['inlay_carnelian', 'inlay_jade', 'inlay_lapis', 'inlay_yellow'];
  const sv = (k) => { const a = Math.PI / 8 + k * Math.PI / 4 - Math.PI / 2; return [cx + Math.cos(a) * sr, cz + Math.sin(a) * sr]; };
  // a flat shape (outline [u, v], holes) set on the plane through p0 along (ux, uz), d thick, centred on it
  const onPlane = (outline, holes, p0, ux, uz, y0, d, m) => {
    const sh2 = new Shape(); sh2.moveTo(outline[0][0], outline[0][1]); for (const q of outline.slice(1)) sh2.lineTo(q[0], q[1]);
    for (const h of holes) { const hp = new Path(); hp.moveTo(h[0][0], h[0][1]); for (const q of h.slice(1)) hp.lineTo(q[0], q[1]); sh2.holes.push(hp); }
    const g = new ExtrudeGeometry(sh2, { depth: d, bevelEnabled: false, curveSegments: 3 }), nx = -uz, nz = ux;
    g.applyMatrix4(new Matrix4().makeBasis({ x: ux, y: 0, z: uz }, { x: 0, y: 1, z: 0 }, { x: nx, y: 0, z: nz }).setPosition(p0[0] - nx * d / 2, y0, p0[1] - nz * d / 2));
    bag.add(m, g);
  };
  // the jali of a panel pw × ph: a net of stems left between almond-shaped piercings in staggered rows, a leaf between
  const jaliHoles = (pw, ph) => {
    const H2 = [], m = 0.06, cols = Math.max(2, Math.round((pw - 2 * m) / 0.27)), px = (pw - 2 * m) / cols, rows = Math.max(3, Math.round((ph - 2 * m) / 0.27)), py = (ph - 2 * m) / rows;
    const almond = (u, v, w, h) => { const P = []; for (let i = 0; i < 12; i++) { const t = i / 12 * Math.PI * 2, c = Math.cos(t), s = Math.sin(t); P.push([u + Math.sign(c) * Math.abs(c) ** 1.4 * w / 2, v + s * h / 2]); } return P; };
    for (let r = 0; r < rows; r++) for (let c = 0; c <= cols; c++) {
      const odd = r % 2, u = m + (c + (odd ? 0 : 0.5)) * px, v = m + (r + 0.5) * py;
      if (u - px * 0.36 < m * 0.9 || u + px * 0.36 > pw - m * 0.9) continue;
      H2.push(almond(u, v, px * 0.6, py * 0.78));
    }
    for (let r = 0; r < rows - 1; r++) for (let c = 0; c <= cols; c++) {
      const odd = r % 2, u = m + (c + (odd ? 0.5 : 0)) * px, v = m + (r + 1) * py;
      if (u - 0.05 < m || u + 0.05 > pw - m) continue;
      H2.push([[u, v - py * 0.16], [u + px * 0.1, v], [u, v + py * 0.16], [u - px * 0.1, v]]);
    }
    return H2;
  };
  for (let k = 0; k < 8; k++) {
    const a = sv(k), b = sv(k + 1), L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, isS = (a[1] + b[1]) / 2 - cz > sa * 0.9, isN = (a[1] + b[1]) / 2 - cz < -sa * 0.9;
    const P2 = (s2) => [a[0] + ux * s2, a[1] + uz * s2], nx = -uz, nz = ux;
    const bx = (s0, s1, ya, yb, th, m, off = 0) => { const p0 = P2(s0), p1 = P2(s1), t = []; beamTris(t, [p0[0] + nx * off, ya, p0[1] + nz * off], [p1[0] + nx * off, ya, p1[1] + nz * off], th / 2, yb - ya); bag.add(m, fromTriangles(t)); };
    // the corner post with its kalasha, the two stiles between the panels
    bag.add(W, lathe([[0.13, 0], [0.13, 0.22], [0.1, 0.3], [0.1, sh - 0.1], [0.13, sh], [0.13, sh + 0.06], [0.11, sh + 0.1], [0.16, sh + 0.22], [0.14, sh + 0.32], [0.06, sh + 0.38], [0.08, sh + 0.42], [0.04, sh + 0.5], [0.001, sh + 0.58]], 8, null, a[0], y, a[1]));
    bag.add('inlay_carnelian', lathe([[0.102, 0.9], [0.102, 0.98], [0.001, 0.98]], 8, null, a[0], y, a[1]));
    for (const j of [1, 2]) bx(L * j / 3 - ST / 2, L * j / 3 + ST / 2, y, y + sh, 0.1, W);
    // the rails: a plinth below, a top rail with a band of inlaid flowers on both faces
    for (let j = 0; j < 3; j++) {
      const s0 = L * j / 3 + (j ? ST / 2 : 0.1), s1 = L * (j + 1) / 3 - (j < 2 ? ST / 2 : 0.1), open = isS && j === 1;
      if (open) bx(s0, s1, y, y + 0.02, 0.12, W);
      else { bx(s0, s1, y, y + 0.22, 0.12, W); bx(s0, s1, y + sh - 0.2, y + sh, 0.1, W); }
      if (!open) for (const side of [-1, 1]) for (let s2 = s0 + 0.08, q = 0; s2 < s1 - 0.05; s2 += 0.13, q++) { bx(s2 - 0.025, s2 + 0.025, y + sh - 0.125, y + sh - 0.075, 0.012, FL[q % 4], side * 0.052); if (q % 2) bx(s2 + 0.03, s2 + 0.09, y + sh - 0.11, y + sh - 0.09, 0.01, 'inlay_jade', side * 0.051); }
      if (!open) for (const side of [-1, 1]) for (let s2 = s0 + 0.1, q = 0; s2 < s1 - 0.05; s2 += 0.2, q++) bx(s2 - 0.03, s2 + 0.03, y + 0.09, y + 0.15, 0.012, FL[(q + 2) % 4], side * 0.062);
      if (open) { col.segment(P2(0.05), P2(s0), 0.12, y, y + sh); col.segment(P2(s1), P2(L - 0.05), 0.12, y, y + sh); }
      else {
        col.segment(P2(s0), P2(s1), 0.12, y, y + sh);
        const pw = s1 - s0, ph = sh - 0.42;
        onPlane([[0, 0], [pw, 0], [pw, ph], [0, ph]], jaliHoles(pw, ph), P2(s0), ux, uz, y + 0.22, 0.05, W);
      }
      // the entrance arch (south) and its closed twin (north): tall stiles, a cusped arch panel rising over the screen
      if ((isS || isN) && j === 1) {
        const spring = y + sh - 0.1, top = y + sh + 0.75, ci = 0.06;
        for (const sg of [-1, 1]) bx(sg < 0 ? s0 - ST - 0.01 : s1 - 0.01, sg < 0 ? s0 + 0.01 : s1 + ST + 0.01, y, top, 0.14, W);
        const pw = s1 - s0, out = [[0, 0], [ci, 0], ...cuspedArc(ci, pw - ci, 0, 7, 0.035).map(([u, v]) => [u, v]), [pw - ci, 0], [pw, 0], [pw, top - spring], [0, top - spring]];
        onPlane(out, [], P2(s0), ux, uz, spring, 0.12, W);
        for (const side of [-1, 1]) for (const [dx, m] of [[0.12, 'inlay_carnelian'], [pw - 0.12, 'inlay_lapis']]) bx(s0 + dx - 0.035, s0 + dx + 0.035, top - 0.17, top - 0.1, 0.01, m, side * 0.065);
        { const c = P2(s0 + pw / 2); bag.add(W, lathe([[0.07, 0], [0.09, 0.08], [0.03, 0.16], [0.05, 0.2], [0.001, 0.28]], 8, null, c[0], top, c[1])); }
      }
    }
    // the cresting: a row of kanguras (vase-shaped merlons) along the top rail
    for (let s2 = 0.3; s2 < L - 0.2; s2 += 0.21) {
      if ((isS || isN) && Math.abs(s2 - L / 2) < L / 6 + 0.1) continue;
      onPlane([[-0.07, 0], [-0.085, 0.05], [-0.05, 0.1], [-0.02, 0.13], [-0.035, 0.17], [0, 0.23], [0.035, 0.17], [0.02, 0.13], [0.05, 0.1], [0.085, 0.05], [0.07, 0]].map(([u, v]) => [u + s2, v]), [], P2(0), ux, uz, y + sh, 0.04, W);
    }
  }
  // the cenotaph of Mumtaz Mahal at the very centre (tajmahal.gov.in): a single block shaped like a sarcophagus on a
  // stepped plinth, the plinth on a wider platform whose top has a framed flowery scroll; Quranic verses in thuluth on
  // the top and sides of the block; hardstone inlay of flowers
  bag.add(W, box(cx - 1.35, y, cz - 2.25, cx + 1.35, y + 0.2, cz + 2.25));
  for (const [x0, z0, x1, z1] of [[-1.25, -2.15, 1.25, -2.1], [-1.25, 2.1, 1.25, 2.15], [-1.25, -2.1, -1.2, 2.1], [1.2, -2.1, 1.25, 2.1]]) bag.add('marble_dark', box(cx + x0, y + 0.2, cz + z0, cx + x1, y + 0.212, cz + z1));
  for (let i = 0; i < 26; i++) {
    // the scroll: flowers round the platform's frame, between the plinth and the frame
    const t = i / 26, per = 2 * (2.3 + 4.1), d = t * per, [px, pz] = d < 2.3 ? [-1.15 + d, -2.05] : d < 6.4 ? [1.15, -2.05 + (d - 2.3)] : d < 8.7 ? [1.15 - (d - 6.4), 2.05] : [-1.15, 2.05 - (d - 8.7)];
    bag.add(FL[i % 4], box(cx + px - 0.035, y + 0.2, cz + pz - 0.035, cx + px + 0.035, y + 0.214, cz + pz + 0.035));
    bag.add('inlay_jade', box(cx + px - 0.08, y + 0.2, cz + pz - 0.012, cx + px - 0.04, y + 0.21, cz + pz + 0.012));
  }
  const steps = [[1.0, 1.8, 0.2, 0.38], [0.86, 1.62, 0.38, 0.54], [0.74, 1.46, 0.54, 0.68]];
  // a little flower spray inlaid in a face normal to x (ax 'x') or z at (fx, fy, fz): four petals round a yellow heart, two leaves
  const spray = (ax, fx, fy, fz, m) => {
    const B2 = (du, dv, hu, hv, mm) => { const t = 0.006; bag.add(mm, ax === 'x' ? box(fx - t, fy + dv - hv, fz + du - hu, fx + t, fy + dv + hv, fz + du + hu) : box(fx + du - hu, fy + dv - hv, fz - t, fx + du + hu, fy + dv + hv, fz + t)); };
    for (const [du, dv] of [[0.022, 0.01], [-0.022, 0.01], [0, 0.032], [0, -0.012]]) B2(du, dv, 0.013, 0.013, m);
    B2(0, 0.01, 0.009, 0.009, 'inlay_yellow'); B2(0.04, -0.03, 0.02, 0.006, 'inlay_jade'); B2(-0.04, -0.03, 0.02, 0.006, 'inlay_jade'); B2(0, -0.035, 0.004, 0.022, 'inlay_jade');
  };
  for (const [hx, hz, ya, yb] of steps) {
    bag.add(W, box(cx - hx, y + ya, cz - hz, cx + hx, y + yb, cz + hz));
    const ym = y + (ya + yb) / 2;
    for (const sx of [-1, 1]) for (let zz = -hz + 0.2, q = 0; zz < hz - 0.1; zz += 0.3, q++) spray('x', cx + sx * hx, ym, cz + zz, FL[q % 3 === 2 ? 0 : q % 3]);
    for (const sz of [-1, 1]) for (let xx = -hx + 0.2, q = 0; xx < hx - 0.1; xx += 0.3, q++) spray('z', cx + xx, ym, cz + sz * hz, FL[q % 3 === 2 ? 0 : q % 3]);
  }
  // the block: a foot, sides swelling a little then drawing in, a flat top with a raised tablet
  const y3 = y + 0.68;
  bag.add(W, frustum([cx - 0.62, cz - 1.36, cx + 0.62, cz + 1.36], y3, y3 + 0.08, -0.03, -0.03, -0.03, -0.03));
  bag.add(W, frustum([cx - 0.65, cz - 1.39, cx + 0.65, cz + 1.39], y3 + 0.08, y3 + 0.5, 0.1, 0.1, 0.1, 0.1));
  bag.add(W, frustum([cx - 0.55, cz - 1.29, cx + 0.55, cz + 1.29], y3 + 0.5, y3 + 0.6, 0.06, 0.06, 0.06, 0.06));
  bag.add(W, box(cx - 0.3, y3 + 0.6, cz - 1.0, cx + 0.3, y3 + 0.66, cz + 1.0));
  // the inscriptions: rows of black letters on the sides and the top, in frames
  {
    // on each sloping side: a framed band of letters, laid on the slope a hair proud of it
    const LT = [], quad = (p0, p1, p2, p3) => LT.push(...p0, ...p1, ...p2, ...p0, ...p2, ...p3);
    for (const sx of [-1, 1]) {
      const X = (v) => cx + sx * (0.65 - 0.1 * v / 0.42 + 0.004), Y = (v) => y3 + 0.08 + v;
      const strip = (z0, z1, v0, v1) => quad([X(v0), Y(v0), cz + z0], [X(v0), Y(v0), cz + z1], [X(v1), Y(v1), cz + z1], [X(v1), Y(v1), cz + z0]);
      let i = 0;
      for (let zz = -1.15; zz < 1.15; zz += 0.07, i++) { const tall = i % 4 !== 1; strip(zz - 0.011, zz + 0.011, 0.13, tall ? 0.33 : 0.2); if (i % 3 === 0) strip(zz - 0.03, zz + 0.03, 0.13, 0.15); if (i % 5 === 2) strip(zz + 0.02, zz + 0.04, 0.24, 0.26); }
      strip(-1.25, 1.25, 0.08, 0.1); strip(-1.25, 1.25, 0.36, 0.38); strip(-1.25, -1.23, 0.08, 0.38); strip(1.23, 1.25, 0.08, 0.38);
    }
    bag.add('marble_dark', fromTriangles(orientOutward(LT.length ? LT : [])));
  }
  for (let zz = -0.9, i = 0; zz < 0.9; zz += 0.08, i++) bag.add('marble_dark', box(cx - (i % 3 === 1 ? 0.08 : 0.2), y3 + 0.66, cz + zz - 0.012, cx + (i % 3 === 1 ? 0.08 : 0.2), y3 + 0.667, cz + zz + 0.012));
  for (const [x0, z0, x1, z1] of [[-0.3, -1.0, 0.3, -0.97], [-0.3, 0.97, 0.3, 1.0], [-0.3, -1.0, -0.27, 1.0], [0.27, -1.0, 0.3, 1.0]]) bag.add('marble_dark', box(cx + x0, y3 + 0.66, cz + z0, cx + x1, y3 + 0.668, cz + z1));
  col.rect([cx - 1.35, cz - 2.25, cx + 1.35, cz + 2.25], y, y + 1.4);
}

/** red_hall: the mosque or its twin (the jawab) { rect, y, h, front, domes: 3 }: a hall of red sandstone with arched openings, three white domes. */
function redHall(el, ctx) {
  const { bag, col } = ctx;
  if (el.interior) return hollowHall(el, ctx);
  const [x0, z0, x1, z1] = el.rect, y = el.y, h = el.h ?? 12, f = el.front || 'e';
  // the hall's mass stands back behind the arcade so the arches open into their bays (dark doors at the back);
  // the roof and the end walls close the gap
  const bx0 = f === 'e' ? x0 : x0 + 3.15, bx1 = f === 'e' ? x1 - 3.15 : x1, gx0 = f === 'e' ? x1 - 3.2 : x0 + 0.5, gx1 = f === 'e' ? x1 - 0.5 : x0 + 3.2;
  bag.add(R, box(bx0, y, z0, bx1, y + h, z1));
  bag.add(R, box(gx0, y + h - 1.0, z0, gx1, y + h, z1));
  for (const zz of [[z0, z0 + 0.8], [z1 - 0.8, z1]]) bag.add(R, box(gx0, y, zz[0], gx1, y + h - 1.0, zz[1]));
  col.rect([x0, z0, x1, z1], y, y + h);
  const [a, b] = f === 'e' ? [[x1 + 0.05, z0], [x1 + 0.05, z1]] : [[x0 - 0.05, z1], [x0 - 0.05, z0]];
  const L = z1 - z0, arches = [];
  for (let i = 0; i < 5; i++) { const c = L * (i + 0.5) / 5, big = i === 2; arches.push({ at: c, w: big ? 7 : 4.2, h: big ? h * 0.85 : h * 0.55, depth: 2.5, door: true }); }
  arcadeWall(bag, col, a, b, y, h, 1.2, R, arches, [(x0 + x1) / 2, (z0 + z1) / 2]);
  if (el.decor) {
    // the facade's inlay: the central arch framed by an inscription (the mosque) or a flower scroll (the
    // jawab) in white marble, the spandrels' inlay, the dado; white marble outlines round the side arches
    faceDecor(bag, a, b, y, h, { w: 7, h: h * 0.85 }, R, false, [(x0 + x1) / 2, (z0 + z1) / 2], { F: 0.6, flowers: el.decor === 'flowers', holes: arches.filter((q) => q.w < 7).map((q) => [q.at - q.w / 2 - 0.35, q.at + q.w / 2 + 0.35]) });
    const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, ox = f === 'e' ? 1 : -1;
    for (const q of arches.filter((q2) => q2.w < 7)) {
      // a white frame round the arch: two jambs and the head
      const P2 = (s2) => [a[0] + ux * s2, a[1] + uz * s2];
      for (const [s0, s1, v0, v1] of [[q.at - q.w / 2 - 0.3, q.at - q.w / 2 - 0.1, 0, q.h + 0.3], [q.at + q.w / 2 + 0.1, q.at + q.w / 2 + 0.3, 0, q.h + 0.3], [q.at - q.w / 2 - 0.3, q.at + q.w / 2 + 0.3, q.h + 0.3, q.h + 0.5]]) {
        const p0 = P2(s0), p1 = P2(s1), xx = a[0] + ox * 0.6;
        bag.add(W, box(Math.min(xx, xx + ox * 0.03), y + v0, Math.min(p0[1], p1[1]), Math.max(xx, xx + ox * 0.03), y + v1, Math.max(p0[1], p1[1])));
      }
    }
    // the parapet: a white band and a row of little merlons along the top
    { const xx = a[0] + ox * 0.6; bag.add(W, box(Math.min(xx, xx + ox * 0.05), y + h - 0.9, z0, Math.max(xx, xx + ox * 0.05), y + h - 0.6, z1)); }
  }
  for (let i = 0; i < 3; i++) {
    const z = z0 + L * (i + 0.5) / 3, r = i === 1 ? 6.2 : 4.6, x = (x0 + x1) / 2;
    bag.add(R, lathe([[r * 1.04, 0], [r * 1.04, 2]], 24, null, x, y + h, z));
    dome(bag, W, x, y + h + 2, z, r, r * 1.5);
  }
  for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) chhatri(bag, null, x, y + h, z, 1.6, 2.6, 8, R, W);
}


/**
 * A hall of the red sandstone, opened (docs/settlements/mughal-agra.md §14): the arcade's arches pass through into a hall
 * under a ceiling; the mosque (`interior: 'mosque'`, qibla on the back, west, wall) with its mihrab and minbar, the
 * floor of white marble set with the outlines of the prayer rugs, three inner domes over the bays, lamps on chains,
 * Qur'an stands; the jawab (`'jawab'`) the same without the mihrab; the garden's pavilions (`'pavilion'`) a flat
 * painted ceiling, a divan along the back, a carpet.
 */
function hollowHall(el, ctx) {
  const { bag, col, lights } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y, h = el.h ?? 12, f = el.front || 'e', kind = el.interior, east = f === 'e';
  const TB = 1.6, TE = 1.4, ox = east ? 1 : -1;
  const X0 = east ? x0 + TB : x0 + 0.55, X1 = east ? x1 - 0.55 : x1 - TB, xa = east ? x1 + 0.05 : x0 - 0.05, Z0 = z0 + TE, Z1 = z1 - TE, L = z1 - z0, xm = (X0 + X1) / 2, zm = (z0 + z1) / 2;
  const mosque = kind === 'mosque' || kind === 'jawab';
  // the walls: back, the two ends; the roof slab over the ceiling's voids
  const back = east ? [x0, z0, x0 + TB, z1] : [x1 - TB, z0, x1, z1];
  bag.add(R, box(back[0], y, back[1], back[2], y + h, back[3])); col.rect(back, y, y + h);
  for (const [a, b] of [[z0, Z0], [Z1, z1]]) { bag.add(R, box(x0, y, a, x1 - (east ? 0.55 : 0), y + h, b)); col.rect([x0, a, x1, b], y, y + h); }
  bag.add(R, box(x0, y + h - 0.3, z0, x1, y + h, z1)); col.floor([x0, z0, x1, z1], y + h);
  // the arcade: five arches, all open
  const a = east ? [xa, z0] : [xa, z1], b = east ? [xa, z1] : [xa, z0];
  const arches = []; for (let i = 0; i < 5; i++) { const c = L * (i + 0.5) / 5, big = i === 2; arches.push({ at: c, w: big ? 7 : 4.2, h: big ? h * 0.85 : h * 0.55, pass: true }); }
  arcadeWall(bag, col, a, b, y, h, 1.2, R, arches, [xm, zm]);
  if (el.decor) {
    const [fa, fb] = east ? [[x1 + 0.05, z0], [x1 + 0.05, z1]] : [[x0 - 0.05, z1], [x0 - 0.05, z0]];
    faceDecor(bag, fa, fb, y, h, { w: 7, h: h * 0.85 }, R, false, [xm, zm], { F: 0.6, flowers: el.decor === 'flowers', holes: arches.filter((q) => q.w < 7).map((q) => [q.at - q.w / 2 - 0.35, q.at + q.w / 2 + 0.35]) });
  }
  // the outer domes, kiosks as before (the domes stand on the roof)
  const nd = mosque ? 3 : 0;
  for (let i = 0; i < nd; i++) { const z = z0 + L * (i + 0.5) / 3, r = i === 1 ? 6.2 : 4.6; bag.add(R, lathe([[r * 1.04, 0], [r * 1.04, 2]], 24, null, (x0 + x1) / 2, y + h, z)); dome(bag, W, (x0 + x1) / 2, y + h + 2, z, r, r * 1.5); }
  if (!mosque) for (let i = 0; i < 2; i++) { const z = z0 + L * (i + 0.5) / 2, r = 3.2; bag.add(R, lathe([[r * 1.04, 0], [r * 1.04, 1.5]], 20, null, (x0 + x1) / 2, y + h, z)); dome(bag, W, (x0 + x1) / 2, y + h + 1.5, z, r, r * 1.5); }
  for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) chhatri(bag, null, x, y + h, z, 1.6, 2.6, 8, R, W);
  // the inside: plaster on the walls above a dado of red stone, the ceiling
  const ci = (east ? back[2] : back[0]);
  bag.add('lime_plaster', box(Math.min(ci, ci + ox * 0.03), y + 1.4, Z0, Math.max(ci, ci + ox * 0.03), y + h - 1.0, Z1));
  for (const [zq, sg] of [[Z0, 1], [Z1, -1]]) bag.add('lime_plaster', box(X0, y + 1.4, Math.min(zq, zq + sg * 0.03), X1, y + h - 1.0, Math.max(zq, zq + sg * 0.03)));
  // the floor: white marble with a border of black
  const fl = y + 0.05;
  bag.add('marble_dark', box(X0, y, Z0, X1, y + 0.03, Z1)); bag.add('marble_floor', box(X0 + 0.35, y, Z0 + 0.35, X1 - 0.35, fl, Z1 - 0.35));
  if (mosque) {
    const hc = 5.3 * 0.62, yc = y + h - 0.4 - hc - 0.1;              // the ceiling's level, the dome springing from it
    const holes = [0, 1, 2].map((i) => [z0 + L * (i + 0.5) / 3, i === 1 ? 5.3 : 3.9]);
    const sh = new Shape(); sh.moveTo(X0, Z0); sh.lineTo(X1, Z0); sh.lineTo(X1, Z1); sh.lineTo(X0, Z1); sh.lineTo(X0, Z0);
    for (const [zc, r] of holes) { const hp = new Path(); for (let k = 0; k <= 24; k++) { const t = k / 24 * Math.PI * 2; const px = xm + Math.cos(t) * r * 0.995, pz = zc + Math.sin(t) * r * 0.995; if (k) hp.lineTo(px, pz); else hp.moveTo(px, pz); } sh.holes.push(hp); }
    const g = new ExtrudeGeometry(sh, { depth: 0.3, bevelEnabled: false, curveSegments: 4 }); g.rotateX(Math.PI / 2); g.translate(0, yc + 0.3, 0);
    bag.add('ceiling_painted', g);
    for (const [zc, r] of holes) {
      const k = r, inner = [[0.001, k * 0.62], [k * 0.45, k * 0.56], [k * 0.75, k * 0.4], [k * 0.92, k * 0.2], [k * 0.995, 0]];
      bag.add(W, lathe(inner, 28, null, xm, yc, zc));
      bag.add('gilt_bronze', disc(0.6, yc + k * 0.62 - 0.03, 16, xm, zc, false));
      for (let q = 0; q < 12; q++) { const t = q / 12 * Math.PI * 2; bag.add('marble_dark', box(xm + Math.cos(t) * k * 0.995 - 0.05, yc - 0.5, zc + Math.sin(t) * k * 0.995 - 0.05, xm + Math.cos(t) * k * 0.995 + 0.05, yc, zc + Math.sin(t) * k * 0.995 + 0.05)); }
    }
    // the rugs' outlines on the floor, each a pointed arch of black marble toward the qibla (mosque), rows across the hall
    if (kind === 'mosque') {
      const mw = 0.86, ml = 1.9, rows = Math.floor((X1 - X0 - 1.5) / (ml + 0.05)), cols = Math.floor((Z1 - Z0 - 1.0) / (mw + 0.05));
      for (let r = 0; r < Math.min(rows, 9); r++) for (let c = 0; c < cols; c++) {
        const mx = X0 + 0.9 + r * (ml + 0.05), mz = Z0 + 0.5 + c * (mw + 0.05), t = 0.025, H2 = fl + 0.022;
        bag.add('marble_dark', box(mx, fl, mz, mx + ml - 0.12, H2, mz + t)); bag.add('marble_dark', box(mx, fl, mz + mw - t, mx + ml - 0.12, H2, mz + mw)); bag.add('marble_dark', box(mx + ml - 0.12, fl, mz, mx + ml, H2, mz + mw));
      }
    }
    // lamps on chains from the ceiling, the Qur'an stands in a row along the back
    for (const [zc, r] of holes) for (const dxl of [-2.4, 2.4]) {
      // (each chain ends on the inside of the dome over the hole, where the dome's profile is over the lamp)
      const prof = [[0, 0.62], [0.45, 0.56], [0.75, 0.4], [0.92, 0.2], [0.995, 0]], rho = Math.abs(dxl * 1.2) / r;
      let hy = 0.62; for (let q = 0; q + 1 < prof.length; q++) if (rho >= prof[q][0] && rho <= prof[q + 1][0]) hy = prof[q][1] + (prof[q + 1][1] - prof[q][1]) * (rho - prof[q][0]) / (prof[q + 1][0] - prof[q][0]);
      F.mosqueLamp(bag, lights, xm + dxl * 1.2, yc - 3.0, zc, yc + hy * r + 0.02, { k: 1.2, glow: 1.5, reach: 9 });
    }
    for (let i = 0; i < 6; i++) F.rahle(bag, ci + ox * 1.6, fl, Z0 + 3 + i * ((Z1 - Z0 - 6) / 5), east ? Math.PI / 2 : -Math.PI / 2);
    if (kind === 'mosque') {
      // the mihrab on the qibla wall: an arched niche of marble inlaid with black, and the minbar of three steps at its right
      const archSlab = (w, hh, d0, d1, mat) => {
        const p = new Path(); archPath(p, -w / 2, w, hh); const sp = new Shape(); const pts = p.getPoints(); sp.moveTo(pts[0].x, pts[0].y); for (const q of pts.slice(1)) sp.lineTo(q.x, q.y);
        const gg = new ExtrudeGeometry(sp, { depth: d1 - d0, bevelEnabled: false, curveSegments: 4 });
        gg.translate(0, 0, d0); gg.rotateY(east ? Math.PI / 2 : -Math.PI / 2);
        gg.translate(ci, y + 0.05, zm); bag.add(mat, gg);
      };
      archSlab(5.2, 9.0, 0.0, 0.14, W); archSlab(4.2, 8.0, 0.14, 0.2, 'marble_dark'); archSlab(3.4, 7.2, 0.2, 0.26, W);
      for (const dz of [-1.5, 1.5]) bag.add(W, lathe([[0.2, 0], [0.14, 0.2], [0.12, 5.6], [0.17, 5.9]], 10, null, ci + ox * 0.5, y + 0.05, zm + dz));
      const mz = zm - 4.6;
      for (let i = 0; i < 3; i++) { const e0 = ci + ox * 0.3, e1 = ci + ox * (0.3 + 1.8 - i * 0.5); bag.add(W, box(Math.min(e0, e1), fl, mz - 0.55, Math.max(e0, e1), fl + 0.4 * (i + 1), mz + 0.55)); }
      col.rect([Math.min(ci, ci + ox * 2.1), mz - 0.55, Math.max(ci, ci + ox * 2.1), mz + 0.55], y, y + 1.3);
      bag.add(W, box(ci + ox * 0.3 - 0.0, fl + 1.2, mz - 0.45, ci + ox * 0.3 + ox * 0.5, fl + 1.3, mz + 0.45));
    }
  } else {
    // the pavilion: a flat ceiling of painted beams, a divan along the back, a carpet in the middle
    bag.add('ceiling_painted', box(X0, y + h - 1.0, Z0, X1, y + h - 0.7, Z1));
    for (let z = Z0 + 1.5; z < Z1; z += 3) bag.add('wood_dark', box(X0, y + h - 1.25, z - 0.12, X1, y + h - 1.0, z + 0.12));
    F.divan(bag, col, [ci + ox * 0.6, Z0 + 1.0], [ci + ox * 0.6, Z1 - 1.0], fl, [xm, zm], { h: 0.38, depth: 1.0 });
    F.carpet(bag, xm, fl + 0.015, zm, Math.min(6.0, X1 - X0 - 2.5), 12, 0, 'persian');
  }
}

/** One of the gate's side blocks hollowed to a guard room (chowki, docs/settlements/mughal-agra.md §14): the door on the passage, a charpoy for each watchman, spears racked and shields on the walls, water jars, a hookah, the ceiling of painted beams. sg: −1 west, +1 east. */
function guardRoom(bag, col, cx, cz, y, w, d, h, sg) {
  const bx0 = sg < 0 ? cx - w : cx + w * 0.3, bx1 = sg < 0 ? cx - w * 0.3 : cx + w, bz0 = cz - d + 1.2, bz1 = cz + d - 1.2, T = 1.2, CH = 5.4;
  const ix0 = bx0 + T, ix1 = bx1 - T, iz0 = bz0 + T, iz1 = bz1 - T, door = sg < 0 ? ix1 : ix0, pass = sg < 0 ? bx1 : bx0;   // the passage side wall at [ix1, bx1] (west block) or [bx0, ix0]
  const wall = (r, y0, y1) => { bag.add(R, box(r[0], y0, r[1], r[2], y1, r[3])); col.rect(r, y0, y1); };
  wall([bx0, bz0, bx1, iz0], y, y + h); wall([bx0, iz1, bx1, bz1], y, y + h);                   // the walls toward the faces
  wall(sg < 0 ? [bx0, iz0, ix0, iz1] : [ix1, iz0, bx1, iz1], y, y + h);                         // the outer wall
  const pw = sg < 0 ? [ix1, iz0, bx1, iz1] : [bx0, iz0, ix0, iz1], zc = cz + d - (1.18 + 1.2 + d - 1.5) / 2, dw = 1.3;   // the door opposite the gap in the iwan's side wall (half-way along it)
  wall([pw[0], pw[1], pw[2], zc - dw], y, y + CH); wall([pw[0], zc + dw, pw[2], pw[3]], y, y + CH);   // the passage wall with the door gap
  bag.add(R, box(pw[0], y + 3.7, zc - dw, pw[2], y + CH, zc + dw)); col.rect([pw[0], zc - dw, pw[2], zc + dw], y + 3.7, y + CH);
  // door frame: marble jambs, a lintel, an arch-shaped dark panel above
  const jx = sg < 0 ? pw[2] + 0.02 : pw[0] - 0.02;
  for (const s2 of [-1, 1]) bag.add('marble_smooth', box(Math.min(jx, jx + sg * 0.08), y, zc + s2 * dw - (s2 > 0 ? 0 : 0.18), Math.max(jx, jx + sg * 0.08), 3.7 + y, zc + s2 * dw + (s2 > 0 ? 0.18 : 0)));
  bag.add('wood_dark', box(Math.min(jx, jx + sg * 0.05), y + 3.7, zc - dw, Math.max(jx, jx + sg * 0.05), y + CH - 0.4, zc + dw));
  // the ceiling and the solid mass over it
  bag.add('ceiling_painted', box(ix0, y + CH - 0.25, iz0, ix1, y + CH, iz1));
  for (let z = iz0 + 1.2; z < iz1; z += 2.4) bag.add('wood_dark', box(ix0, y + CH - 0.5, z - 0.12, ix1, y + CH - 0.25, z + 0.12));
  bag.add(R, box(bx0, y + CH, bz0, bx1, y + h, bz1)); col.rect([bx0, bz0, bx1, bz1], y + CH, y + h);
  bag.add('sandstone_floor', box(ix0, y, iz0, ix1, y + 0.04, iz1));
  // the furnishing: three charpoys along the outer wall, jars and the hookah by the door, spears and shields on the walls
  const ow = sg < 0 ? ix0 : ix1, ox2 = sg < 0 ? 1 : -1;
  for (let k = 0; k < 3; k++) F.charpoy(bag, col, ow + ox2 * 1.0, y + 0.04, iz0 + 1.7 + k * ((iz1 - iz0 - 3.4) / 2), Math.PI / 2, { quilt: ['cloth_red', 'cloth_indigo', 'cloth_green'][k] });
  F.kilim(bag, (ix0 + ix1) / 2 + ox2 * 0.8, y + 0.06, zc, 3.6, 3.0, 0, ['cloth_red', 'cloth_white', 'cloth_indigo', 'cloth_ochre']);
  F.hookah(bag, (ix0 + ix1) / 2 + ox2 * 0.8, y + 0.07, zc + 0.3, 0.4);
  F.waterJar(bag, door - ox2 * 0.5, y + 0.04, iz0 + 0.6, 0.9, 'terracotta'); F.waterJar(bag, door - ox2 * 0.5, y + 0.04, iz1 - 0.6, 0.9, 'terracotta');
  for (const zz of [iz0 + 0.5, iz1 - 0.5]) for (let i = 0; i < 4; i++) bag.add('wood_dark', rod([ow + ox2 * (0.3 + i * 0.12), y + 0.04, zz], [ow + ox2 * (0.3 + i * 0.12), y + 2.3, zz], 0.018, 5));
  for (const zz of [iz0 + 4.2, iz1 - 4.2]) bag.add('hide_brown', lathe([[0.4, 0], [0.38, 0.03], [0.05, 0.1], [0.001, 0.12]], 14, null, 0, 0, 0).rotateZ(Math.PI / 2 * (sg < 0 ? -1 : 1)).translate(ow + ox2 * 0.06, y + 1.7, zz));
}

/** great_gate: the gate { c, y, w, d, h, front ('n'|'s') }: a block of red sandstone, its faces with great iwans, a row of small chhatris along the top, towers with kiosks at its corners. */
function greatGate(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, w = el.w / 2, d = el.d / 2, h = el.h;
  for (const s of [-1, 1]) pishtaqFace(bag, col, [cx + w * s, cz + d * s], [cx - w * s, cz + d * s], y, h, { w: w * 0.6, h: h * 0.75, depth: d - 1.5, alcove: 'oct', pass: !!el.rooms, gap: el.rooms && s > 0 ? [0.38, 0.62] : undefined }, R, true, [cx, cz]);
  if (el.rooms) for (const sg of [-1, 1]) guardRoom(bag, col, cx, cz, y, w, d, h, sg);
  else {
    bag.add(R, box(cx - w, y, cz - d + 1.2, cx - w * 0.3, y + h, cz + d - 1.2));
    bag.add(R, box(cx + w * 0.3, y, cz - d + 1.2, cx + w, y + h, cz + d - 1.2));
    col.rect([cx - w, cz - d, cx - w * 0.3, cz + d], y, y + h); col.rect([cx + w * 0.3, cz - d, cx + w, cz + d], y, y + h);
  }
  bag.add(R, box(cx - w * 0.3, y + h * 0.78, cz - d + 1.2, cx + w * 0.3, y + h, cz + d - 1.2));
  for (let i = 0; i < 11; i++) chhatri(bag, null, cx - w * 0.75 + i * w * 1.5 / 10, y + h, cz + d - 1.2, 0.9, 1.6, 6, W, W);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    bag.add(R, lathe([[2.2, 0], [2, h + 2]], 8, null, cx + sx * w, y, cz + sz * d)); col.circle(cx + sx * w, cz + sz * d, 2.2, y, y + h + 2);
    chhatri(bag, null, cx + sx * w, y + h + 2, cz + sz * d, 1.8, 2.8, 8, R, W);
  }
}

/** mughal_wall: a crenellated red sandstone wall { a, b, h } with an arcade of blind arches. */
function mughalWall(el, { bag, col }) {
  const L = Math.hypot(el.b[0] - el.a[0], el.b[1] - el.a[1]), n = Math.max(1, Math.round(L / 6)), arches = [];
  for (let i = 0; i < n; i++) arches.push({ at: (i + 0.5) * L / n, w: 3.2, h: el.h * 0.55, sill: 0.5, depth: 0.3 });
  arcadeWall(bag, col, el.a, el.b, el.y ?? 0, el.h, 1.6, R, arches, el.inside || [0, 0]);
  const ux = (el.b[0] - el.a[0]) / L, uz = (el.b[1] - el.a[1]) / L;
  for (let i = 0; i < Math.floor(L / 1.6); i++) { const s = (i + 0.5) * 1.6, x = el.a[0] + ux * s, z = el.a[1] + uz * s; bag.add(R, box(x - 0.4, el.h + (el.y ?? 0), z - 0.4, x + 0.4, el.h + (el.y ?? 0) + 0.9, z + 0.4)); }
}

/** octa_tower: an octagonal corner tower with a kiosk { c, h, r }. */
function octaTower(el, { bag, col }) {
  const [x, z] = el.c;
  bag.add(R, lathe([[el.r, 0], [el.r * 0.92, el.h]], 8, null, x, el.y ?? 0, z));
  chhatri(bag, col, x, (el.y ?? 0) + el.h, z, el.r * 0.85, el.r * 1.3, 8, R, W);
  col.circle(x, z, el.r, el.y ?? 0, (el.y ?? 0) + el.h);
}

/** The intrados of a multi-cusped (engrailed) pointed arch from (s0, ys) to (s1, ys): n lobes bulging out between cusps, as points [s, y] (the ends excluded). */
function cuspedArc(s0, s1, ys, n = 7, depth = 0.09) {
  const w = s1 - s0, r = w * 0.62, rise = Math.sqrt(r * r - (r - w / 2) ** 2), cL = s0 + r, cR = s1 - r, cs = (s0 + s1) / 2, cy = ys + rise * 0.35;
  const base = (t) => { const s = s0 + w * t; return [s, ys + Math.sqrt(Math.max(0, r * r - (s - (t <= 0.5 ? cL : cR)) ** 2))]; };
  // arc-length samples of the base arch, the cusps at equal steps
  const S = Array.from({ length: 121 }, (_, i) => base(i / 120)), D = [0];
  for (let i = 1; i < S.length; i++) D.push(D[i - 1] + Math.hypot(S[i][0] - S[i - 1][0], S[i][1] - S[i - 1][1]));
  const at = (d) => { let i = 1; while (i < D.length - 1 && D[i] < d) i++; const g = (d - D[i - 1]) / (D[i] - D[i - 1] || 1); return [S[i - 1][0] + (S[i][0] - S[i - 1][0]) * g, S[i - 1][1] + (S[i][1] - S[i - 1][1]) * g]; };
  const P = [], tot = D[D.length - 1];
  for (let k = 0; k < n; k++) for (let j = k ? 0 : 1; j <= 6; j++) {
    if (k === n - 1 && j === 6) break;
    const q = at(tot * (k + j / 6) / n), out = [q[0] - cs, q[1] - cy], ol = Math.hypot(...out) || 1, b = Math.sin(Math.PI * j / 6) * depth;
    P.push([q[0] + out[0] / ol * b, q[1] + out[1] / ol * b]);
  }
  return P;
}

/** A Shah Jahani column at (x, z) from y up to yc: a cusped square base, a faceted tapering shaft, a bell capital under an impost block. */
function shahColumn(bag, col, x, y, z, yc, r = 0.15, mat = R) {
  bag.add(mat, box(x - r * 1.7, y, z - r * 1.7, x + r * 1.7, y + 0.12, z + r * 1.7));
  bag.add(mat, lathe([[r * 1.55, 0], [r * 1.5, 0.08], [r * 1.15, 0.22], [r * 1.25, 0.3], [r * 1.0, 0.36]], 8, (th) => 1 + 0.12 * Math.abs(Math.cos(th * 2)), x, y + 0.12, z));
  const hs = yc - y - 0.86;
  bag.add(mat, lathe([[r, 0], [r * 0.82, hs]], 12, null, x, y + 0.48, z));
  for (const f of [0.33, 0.66]) bag.add(mat, lathe([[r * (1 - 0.18 * f) + 0.02, 0], [r * (1 - 0.18 * f) + 0.02, 0.06], [0.001, 0.06]], 12, null, x, y + 0.48 + hs * f, z));
  bag.add(mat, lathe([[r * 0.82, 0], [r * 0.95, 0.06], [r * 0.8, 0.12], [r * 1.25, 0.28], [r * 1.5, 0.32], [0.001, 0.32]], 12, (th) => 1 + 0.1 * Math.abs(Math.cos(th * 4)), x, y + 0.48 + hs, z));
  bag.add(mat, box(x - r * 1.6, yc - 0.06, z - r * 1.6, x + r * 1.6, yc, z + r * 1.6));
  if (col) col.circle(x, z, r * 1.3, y, yc);
}

/**
 * bazaar_row: a row of shops along a bazaar street of the forecourt (docs/settlements/mughal-agra.md §5) { x0, x1, z
 * (the verandah's front edge), facing ('n' | 's', toward the street), cell (width), deep (the cells), ver (the
 * verandah), h }: small windowless cells side by side, each with its door, fronted by an arcaded verandah of multi-
 * cusped arches on Shah Jahani columns, on a plinth; a flat roof with a chhajja and a crenellated parapet.
 */
function bazaarRow(el, { bag, col }) {
  const { x0, x1, z } = el, s = el.facing === 's' ? 1 : -1, cw = el.cell ?? 3.2, D = el.deep ?? 4, V = el.ver ?? 3, H = el.h ?? 5.0, py = 0.35;
  const n = Math.max(1, Math.round((x1 - x0) / cw)), bw = (x1 - x0) / n, zf = z, zc = z - s * V, zb = z - s * (V + D);
  const zr = (a, b) => [Math.min(a, b), Math.max(a, b)];
  const bx = (xa, xb, za, zb2, ya, yb, m) => { const [p, q] = zr(za, zb2); bag.add(m, box(xa, ya, p, xb, yb, q)); };
  // the plinth, the back wall, the cells' front wall with their doors, the partitions
  bx(x0, x1, zf + s * 0.05, zb, 0, py, R); { const [p, q] = zr(zf + s * 0.05, zb); col.floor([x0, p, x1, q], py); }
  for (let i = 0; i < 2; i++) bx(x0 + 0.02, x1 - 0.02, zf + s * (0.05 + 0.3 * (i + 1)), zf + s * (0.05 + 0.3 * i), 0, py * (2 - i) / 3, R);   // two steps down to the street
  bx(x0, x1, zb, zb + s * 0.5, py, H, R); { const [p, q] = zr(zb, zb + s * 0.5); col.rect([x0, p, x1, q], py, H); }
  const dw = 1.4, dh = 2.5;
  for (let k = 0; k <= n; k++) {
    const xp = x0 + k * bw;
    bx(Math.max(x0, xp - 0.18), Math.min(x1, xp + 0.18), zb + s * 0.5, zc, py, H, R); { const [p, q] = zr(zb, zc); col.rect([Math.max(x0, xp - 0.18), p, Math.min(x1, xp + 0.18), q], py, H); }
    if (k === n) break;
    const xc = xp + bw / 2;
    for (const [a, b] of [[xp + 0.18, xc - dw / 2], [xc + dw / 2, xp + bw - 0.18]]) { bx(a, b, zc, zc + s * 0.45, py, H, 'lime_plaster'); const [p, q] = zr(zc, zc + s * 0.45); col.rect([a, p, b, q], py, H); }
    bx(xc - dw / 2, xc + dw / 2, zc, zc + s * 0.45, py + dh, H, 'lime_plaster');
    bx(xc - dw / 2 - 0.12, xc + dw / 2 + 0.12, zc + s * 0.45, zc + s * 0.5, py + dh, py + dh + 0.14, 'sandstone_red');
    // the dark inside, the door's two leaves folded back
    if (!(el.lit ?? []).includes(k)) bx(xc - dw / 2, xc + dw / 2, zb + s * 0.52, zb + s * 0.56, py, py + dh, 'lacquer_black');
    for (const sg of [-1, 1]) bx(Math.min(xc + sg * (dw / 2 + 0.04), xc + sg * (dw / 2 + 0.62)), Math.max(xc + sg * (dw / 2 + 0.04), xc + sg * (dw / 2 + 0.62)), zc + s * 0.45, zc + s * 0.51, py + 0.02, py + dh - 0.05, 'wood_dark');   // folded back flat against the front
  }
  // the roof over cells and verandah, the chhajja on brackets, the parapet with merlons
  bx(x0, x1, zb, zf, H, H + 0.4, R);
  bx(x0 - 0.3, x1 + 0.3, zf - s * 0.2, zf + s * 0.7, H - 0.1, H + 0.04, R);
  for (let k = 0; k <= n; k++) { const xp = x0 + k * bw; bx(xp - 0.08, xp + 0.08, zf, zf + s * 0.6, H - 0.45, H - 0.1, R); }
  bx(x0, x1, zf - s * 0.1, zf + s * 0.15, H + 0.4, H + 0.85, R);
  for (let xx = x0 + 0.4; xx < x1 - 0.2; xx += 0.8) bx(xx - 0.22, xx + 0.22, zf - s * 0.08, zf + s * 0.13, H + 0.85, H + 1.2, R);
  // the arcade: a column at every partition, a cusped arch over each bay in a panel up to the roof
  const yc = py + 2.4, ys = yc;
  for (let k = 0; k <= n; k++) shahColumn(bag, col, x0 + k * bw, py, zf - s * 0.2, yc);
  for (let k = 0; k < n; k++) {
    const xa = x0 + k * bw, xb = xa + bw, ci = 0.25, sh = new Shape();
    sh.moveTo(xa, ys); sh.lineTo(xa + ci, ys);
    for (const [u, v] of cuspedArc(xa + ci, xb - ci, ys, 7, 0.08)) sh.lineTo(u, v);
    sh.lineTo(xb - ci, ys); sh.lineTo(xb, ys); sh.lineTo(xb, H); sh.lineTo(xa, H); sh.lineTo(xa, ys);
    const g = new ExtrudeGeometry(sh, { depth: 0.34, bevelEnabled: false, curveSegments: 4 });
    g.translate(0, 0, zf - s * 0.2 - 0.17);
    bag.add(R, g);
    // a white marble line framing the arch's crown, a rosette in each spandrel
    const zz = zf - s * 0.2 + s * 0.17;
    for (const [xr, yr] of [[xa + bw * 0.16, H - 0.42], [xb - bw * 0.16, H - 0.42]]) bx(xr - 0.11, xr + 0.11, zz, zz + s * 0.02, yr - 0.11, yr + 0.11, W);
    bx(xa + 0.1, xb - 0.1, zz, zz + s * 0.02, H - 0.14, H - 0.08, W);
  }
}

/**
 * bazaar_gate: a gate of red sandstone at the end of a bazaar street or in the forecourt's south wall { c, axis ('x'
 * | 'z': the way through), w (across), d (through), h }: on each face a pointed arch one walks through, framed by a
 * scroll of inlaid flowers in white marble, the passage vaulted between solid piers, a crenellated parapet with a
 * domed kiosk at each corner.
 */
function bazaarGate(el, { bag, col }) {
  const [cx, cz] = el.c, w = el.w ?? 20, d = el.d ?? 8, h = el.h ?? 11, aw = el.aw ?? 6, ahh = el.ah ?? 8.5, X = el.axis === 'x';
  const P = (t, c) => (X ? [cx + t, cz + c] : [cx + c, cz + t]);              // t along the way through, c across
  for (const sg of [-1, 1]) {
    const a = P(sg * (d / 2 - 0.6), -sg * w / 2), b = P(sg * (d / 2 - 0.6), sg * w / 2);
    arcadeWall(bag, col, a, b, 0, h, 1.2, R, [{ at: w / 2, w: aw, h: ahh, pass: true }], [cx, cz]);
    faceDecor(bag, a, b, 0, h, { w: aw, h: ahh }, R, false, [cx, cz], { F: 0.6, flowers: true });
  }
  const r2 = (t0, c0, t1, c1) => { const p = P(t0, c0), q = P(t1, c1); return [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; };
  for (const sg of [-1, 1]) { const r = r2(-d / 2 + 1.2, sg * aw / 2, d / 2 - 1.2, sg * w / 2); bag.add(R, box(r[0], 0, r[1], r[2], h, r[3])); col.rect(r, 0, h); }
  { const r = r2(-d / 2 + 1.2, -aw / 2, d / 2 - 1.2, aw / 2); bag.add(R, box(r[0], ahh, r[1], r[2], h, r[3])); bag.add('lime_plaster', box(r[0], ahh - 0.25, r[1], r[2], ahh, r[3])); }
  { const r = r2(-d / 2 + 1.2, -aw / 2, d / 2 - 1.2, aw / 2); bag.add('sandstone_red', box(r[0], 0.0, r[1], r[2], 0.04, r[3])); }
  const rt = r2(-d / 2, -w / 2, d / 2, w / 2);
  bag.add(R, box(rt[0], h, rt[1], rt[2], h + 0.4, rt[3]));
  for (let c = -w / 2 + 0.5; c < w / 2 - 0.3; c += 1.0) for (const sg of [-1, 1]) { const p = P(sg * (d / 2 - 0.2), c); bag.add(R, box(p[0] - 0.25, h + 0.4, p[1] - 0.25, p[0] + 0.25, h + 1.1, p[1] + 0.25)); }
  for (const [st, sc] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const p = P(st * (d / 2 - 1), sc * (w / 2 - 1)); chhatri(bag, null, p[0], h + 0.4, p[1], 0.9, 1.8, 6, R, W); }
}

/**
 * haveli_open: a town house of the Taj Ganj one can walk into, furnished (docs/settlements/mughal-agra.md §11) { rect,
 * entry }: plastered walls on a plinth line of red sandstone; the street door into a vestibule with its inner door set
 * aside; the court (chauk) paved in sandstone with a raised platform (chabutra) and a water pot on its stand; on the
 * north the dalan, a hall open to the court by three arches, its floor spread with a dhurrie and a carpet, a takht (a
 * low wooden platform) with its bolster (gao takiya) and cushions, a hookah, brass vessels, lamps in the niches; on
 * the east a room with the charpoys, a chest and the bedding; the rest closed (kitchen, stores).
 */
function haveliOpen(el, ctx) {
  const { bag, col, lights } = ctx;
  const M = { out: 'stucco_warm', in: 'lime_plaster', floor: 'sandstone_red', court: 'sandstone_red', ceiling: 'ceiling_painted', beam: 'wood_dark', leaf: 'wood_dark', lattice: 'lattice', base: 'earth_wall', trim: 'sandstone_red' };
  const H = courtHouse(bag, col, {
    rect: el.rect, y: 0, th: 0.55, ti: 0.45, fh: 0.45, H: 5.4, d: { n: 4.6, s: 3.4, w: 3.4, e: 3.8 }, mats: M,
    entry: { side: el.entry ?? 'w', span: [0.25, 0.7], at: 0.3, inner: 0.78, w: 1.25 },
    wings: { n: { kind: 'open', h: 6.4, arches: [0.2, 0.5, 0.8].map((at) => ({ at, w: 2.0, h: 3.4 })) }, e: { kind: 'room', h: 5.4, arches: [{ at: 0.5, w: 1.1, h: 2.4 }], windows: [{ at: 0.2, w: 0.9, h: 1.3 }, { at: 0.8, w: 0.9, h: 1.3 }] }, s: { kind: 'solid', h: 5.4 }, w: { kind: 'solid', h: 5.4 } },
  });
  const c = H.court, cx = (c[0] + c[2]) / 2, cz = (c[1] + c[3]) / 2;
  // the court: the chabutra, a pot stand with the matkas, a charpoy set out
  bag.add('sandstone_red', box(cx - 1.4, 0.04, cz - 1.4, cx + 1.4, 0.5, cz + 1.4)); col.rect([cx - 1.4, cz - 1.4, cx + 1.4, cz + 1.4], 0, 0.5); col.floor([cx - 1.4, cz - 1.4, cx + 1.4, cz + 1.4], 0.5);
  bag.add('lime_plaster', box(cx - 1.3, 0.5, cz - 1.3, cx + 1.3, 0.52, cz + 1.3));
  F.waterJar(bag, c[0] + 0.6, 0.04, c[3] - 0.6, 0.8); F.waterJar(bag, c[0] + 1.35, 0.04, c[3] - 0.6, 0.7);
  F.charpoy(bag, col, c[2] - 1.0, 0.04, cz + 0.5, Math.PI / 2, { made: false });
  // the dalan's face on the court: each arch in a frame of red sandstone with a white marble rosette in each spandrel,
  // a chhajja (a sloping stone eave on brackets) over the three, a crenellated parapet
  { const zf = H.n.room[3] + 0.45, ytop = 6.4;
    for (const a of H.n.arches) {
      const ax = a.p[0], hw = a.w / 2;
      for (const sg of [-1, 1]) bag.add('sandstone_red', box(ax + sg * hw - (sg > 0 ? 0 : 0.22), 0.04, zf, ax + sg * hw + (sg > 0 ? 0.22 : 0), 4.15, zf + 0.08));
      bag.add('sandstone_red', box(ax - hw - 0.22, 3.93, zf, ax + hw + 0.22, 4.15, zf + 0.08));
      for (const sg of [-1, 1]) { bag.add('marble_smooth', lathe([[0.001, 0], [0.13, 0], [0.13, 0.02], [0.001, 0.02]], 12).rotateX(Math.PI / 2).translate(ax + sg * (hw - 0.28), 3.6, zf + 0.1)); }
    }
    const xa = H.n.room[0] - 0.1, xb = H.n.room[2] + 0.1;
    const g = box(xa, -0.05, 0, xb, 0.05, 0.75); g.rotateX(0.3); g.translate(0, 4.6, zf); bag.add('sandstone_red', g);
    for (let x = xa + 0.3; x < xb; x += 1.1) { bag.add('sandstone_red', box(x - 0.07, 4.25, zf, x + 0.07, 4.62, zf + 0.5)); }
    bag.add('stucco_warm', box(xa, ytop, zf - 0.25, xb, ytop + 0.35, zf)); for (let x = xa + 0.35; x < xb - 0.2; x += 0.7) bag.add('stucco_warm', box(x - 0.18, ytop + 0.35, zf - 0.23, x + 0.18, ytop + 0.72, zf - 0.02)); }
  // the dalan: the dhurrie and carpet, the takht with its bolster and cushions, the hookah, brass, lamps in niches
  const t = H.n.room, ty = H.n.y, tx = (t[0] + t[2]) / 2, tz = (t[1] + t[3]) / 2, tw = t[2] - t[0];
  F.kilim(bag, tx, ty, tz + 0.2, tw - 0.6, t[3] - t[1] - 0.6, 0, ['cloth_white', 'cloth_indigo', 'cloth_indigo', 'cloth_white']);
  bag.add('wood_dark', box(tx - 1.6, ty, t[1] + 0.1, tx + 1.6, ty + 0.4, t[1] + 1.9)); col.rect([tx - 1.6, t[1] + 0.1, tx + 1.6, t[1] + 1.9], ty, ty + 0.4);
  F.carpet(bag, tx, ty + 0.4, t[1] + 1.0, 3.1, 1.7, 0, 'mughal');
  F.bolster(bag, tx, ty + 0.42, t[1] + 0.32, 1.8, 0.17, 0, 'cloth_red', 'cloth_ochre');
  for (const s of [-1, 1]) F.cushion(bag, tx + s * 1.25, ty + 0.42, t[1] + 1.0, 0.5, 0.5, 0.1, 0, 'cloth_green');
  F.hookah(bag, tx + 0.6, ty + 0.012, t[1] + 2.4, 0.4);
  F.trayTable(bag, tx - 0.9, ty + 0.012, t[1] + 2.5, { r: 0.3, h: 0.22, seed: 5 });
  for (const u of [-tw / 2 + 0.7, tw / 2 - 0.7]) { bag.add('sandstone_red', box(tx + u - 0.3, ty + 1.3, t[1] + 0.03, tx + u + 0.3, ty + 1.36, t[1] + 0.22)); F.oilLamp(bag, lights, tx + u, ty + 1.36, t[1] + 0.12, 'bronze', 1.2); F.ewer(bag, tx + u + 0.18, ty + 1.36, t[1] + 0.12, 0.5); }
  // the room on the east: two charpoys, a chest, the bedding rolled on it
  const e = H.e.room, ey = H.e.y;
  F.charpoy(bag, col, (e[0] + e[2]) / 2 + 0.3, ey, e[1] + 1.4, 0, { quilt: 'cloth_red' });
  F.charpoy(bag, col, (e[0] + e[2]) / 2 + 0.3, ey, e[3] - 1.4, 0, { quilt: 'cloth_indigo' });
  F.chest(bag, e[2] - 0.4, ey, (e[1] + e[3]) / 2, 0.5, 1.0, 0.5, Math.PI / 2);
  for (let k = 0; k < 3; k++) F.cushion(bag, e[2] - 0.4, ey + 0.55 + k * 0.1, (e[1] + e[3]) / 2, 0.45, 0.9, 0.095, 0, ['cloth_white', 'cloth_ochre', 'cloth_red'][k]);
}

/**
 * katra: a caravanserai of the Taj Ganj (docs/settlements/mughal-agra.md §11) { rect, gate ('w' | 'e'), lit (the
 * index of the north row's cell that is furnished) }: the Taj Ganj was "a square divided by two cross axial streets
 * with gates to the four cardinal points", bazaars along the streets and a caravanserai in each corner square —
 * Katra Omar Khan (north-west), Katra Fulel, the perfume market (north-east), Katra Resham, the silk market, and
 * Katra Jogidas [stated: Wikipedia, Origins and architecture of the Taj Mahal]; a sarai of the same years, Amanat Khan's
 * (1640–41), has a gateway in the middle of a side, rooms about 3.5 m square under vaults, a well and a three-domed
 * mosque in its court [stated: Wikipedia, Sarai Amanat Khan]. Ours: rows of vaulted cells behind arcaded verandahs
 * on the north and south (the bazaar row's cells), the walls east and west, the gate in the middle of the west (or
 * east) wall, a well and a trough in the court (the mosque is left out); one cell furnished as a merchant's lodging.
 */
function katra(el, ctx) {
  const { bag, col, lights } = ctx, [x0, z0, x1, z1] = el.rect, zc = (z0 + z1) / 2, T = 1.6, gw = 12, D = 4, V = 3, cw = 3.6;
  const gx = el.gate === 'e' ? x1 : x0, mx = el.gate === 'e' ? x0 : x1;
  const rx0 = x0 + T, rx1 = x1 - T;
  bazaarRow({ x0: rx0, x1: rx1, z: z0 + D + V + 0.5, facing: 's', cell: cw, deep: D, ver: V, h: 5, lit: [el.lit ?? 2] }, ctx);
  bazaarRow({ x0: rx0, x1: rx1, z: z1 - D - V - 0.5, facing: 'n', cell: cw, deep: D, ver: V, h: 5 }, ctx);
  // the side walls (the gate's gap in one), the gate, the mosque against the other
  mughalWall({ a: [gx, z0], b: [gx, zc - gw / 2], h: 6, inside: [(x0 + x1) / 2, zc] }, ctx);
  mughalWall({ a: [gx, zc + gw / 2], b: [gx, z1], h: 6, inside: [(x0 + x1) / 2, zc] }, ctx);
  mughalWall({ a: [mx, z0], b: [mx, z1], h: 6, inside: [(x0 + x1) / 2, zc] }, ctx);
  bazaarGate({ c: [gx, zc], axis: 'x', w: gw, d: 8, h: 9.5, aw: 4.4, ah: 6.4 }, ctx);
  const s = el.gate === 'e' ? 1 : -1;
  // the court: beaten earth, a well with its parapet and pulley posts, troughs of stone
  const cx = (x0 + x1) / 2, wx = cx + s * 3, wz = zc;
  bag.add(R, lathe([[1.0, 0], [1.0, 0.7], [1.1, 0.75], [1.1, 0.85], [0.8, 0.85], [0.8, 0.2], [0.001, 0.2]], 12, null, wx, 0, wz)); col.circle(wx, wz, 1.1, 0, 0.85);
  bag.add('water', disc(0.8, 0.45, 12, wx, wz));
  for (const sg of [-1, 1]) bag.add(R, box(wx + sg * 1.05 - 0.12, 0.85, wz - 0.12, wx + sg * 1.05 + 0.12, 2.5, wz + 0.12));
  bag.add('timber', box(wx - 1.2, 2.4, wz - 0.06, wx + 1.2, 2.52, wz + 0.06));
  bag.add('timber', lathe([[0.001, -0.06], [0.14, -0.05], [0.14, 0.05], [0.001, 0.06]], 10).rotateZ(Math.PI / 2).translate(wx, 2.25, wz));
  bag.add('hide_tan', rod([wx, 2.2, wz + 0.14], [wx, 1.0, wz + 0.14], 0.008, 3));
  bag.add('limestone', box(wx + 1.8, 0, wz - 0.4, wx + 4.2, 0.55, wz + 0.4)); bag.add('water', box(wx + 1.9, 0.1, wz - 0.3, wx + 4.1, 0.48, wz + 0.3)); col.rect([wx + 1.8, wz - 0.4, wx + 4.2, wz + 0.4], 0, 0.55);
  // goods in the court: bales stacked by the south verandah, a charpoy under the north one
  for (let k = 0; k < 4; k++) F.bale(bag, rx0 + 6 + k * 0.95, 0, z1 - D - V - 1.6, 0.85, 0.55, 0.6, 0.1 * k, k % 2 ? 'sacking' : 'cloth_white');
  F.bale(bag, rx0 + 6.5, 0.55, z1 - D - V - 1.6, 0.85, 0.5, 0.6, 0.2, 'cloth_indigo');
  F.charpoy(bag, col, rx1 - 5, 0.35, z0 + D + V - 1.2, 0, { made: false });
  // the furnished cell: plastered inside, a dhurrie on the floor, the charpoy with its quilt, saddlebags and bales
  // along the back, a hookah, the water pot on its stand, a brass lota, a lamp in the niche by the door
  const k = el.lit ?? 2, n = Math.max(1, Math.round((rx1 - rx0) / cw)), bw = (rx1 - rx0) / n, ca = rx0 + k * bw + 0.18, cb = rx0 + (k + 1) * bw - 0.18, za = z0 + 1.0, zb = z0 + D + 0.5, fy = 0.35;
  for (const r of [[ca, za, cb, za + 0.03], [ca, za + 0.03, ca + 0.03, zb], [cb - 0.03, za + 0.03, cb, zb]]) bag.add('lime_plaster', box(r[0], fy, r[1], r[2], 4.95, r[3]));
  bag.add('lime_plaster', box(ca, 4.6, za, cb, 4.62, zb));
  const mxm = (ca + cb) / 2;
  F.kilim(bag, mxm, fy, (za + zb) / 2 + 0.2, cb - ca - 0.4, zb - za - 1.0, 0, ['cloth_indigo', 'cloth_white', 'cloth_red', 'cloth_white']);
  F.charpoy(bag, col, ca + 0.55, fy, (za + zb) / 2 - 0.1, Math.PI / 2, { L: 1.85, W: 0.85, quilt: 'cloth_red' });
  F.saddlebag(bag, cb - 0.6, fy, za + 0.45, 0.1); F.bale(bag, cb - 0.55, fy, za + 1.2, 0.7, 0.45, 0.5, 0.0, 'cloth_white'); F.bale(bag, cb - 0.55, fy + 0.45, za + 1.2, 0.65, 0.4, 0.45, 0.2, 'sacking');
  F.hookah(bag, cb - 0.8, fy + 0.012, zb - 1.2, Math.PI);
  F.waterJar(bag, cb - 0.4, fy, zb - 0.45, 0.7, 'terracotta');
  F.ewer(bag, cb - 0.85, fy + 0.012, zb - 0.45, 0.6, 1);
  bag.add(R, box(ca + 0.03, fy + 1.4, zb - 0.32, ca + 0.3, fy + 1.45, zb - 0.02));
  F.oilLamp(bag, lights, ca + 0.15, fy + 1.45, zb - 0.17, 'terracotta', 1.0);
}

/** A fountain at (x, z): a lotus of marble rising from the water floor (y0) to just above the surface (y),
 *  a copper nozzle, the jet of water h high. */
function fountain(bag, x, z, y0, y, h = 1.6) {
  const hb = y - y0 + 0.1;
  bag.add('marble_smooth', lathe([[0.22, 0], [0.18, hb * 0.6], [0.3, hb * 0.85], [0.26, hb], [0.08, hb], [0.001, hb]], 16, (th, i) => (i === 2 || i === 3 ? 1 + 0.12 * Math.abs(Math.cos(th * 4)) : 1), x, y0, z));
  bag.add('bronze', lathe([[0.05, 0], [0.04, 0.1], [0.018, 0.16], [0.001, 0.16]], 8, null, x, y0 + hb, z));
  // the jet: a white column of broken water, spreading into a plume that falls back
  bag.add('water_jet', lathe([[0.045, 0], [0.035, h * 0.5], [0.025, h * 0.85], [0.07, h * 0.93], [0.11, h * 0.9], [0.05, h * 0.97], [0.001, h]], 8, null, x, y0 + hb + 0.14, z));
}
registerStyle('mughal', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: {
    ...STYLES.qing.elements,
    mausoleum,
    minaret: (el, { bag, col }) => minaret(bag, col, el.c[0], el.y, el.c[1], el.h, el.r),
    chhatri: (el, { bag, col }) => chhatri(bag, col, el.c[0], el.y, el.c[1], el.r, el.h, el.n ?? 8, el.mat ?? W, el.domeMat ?? W),
    fountains: (el, { bag }) => { for (const [x, z] of el.pts) fountain(bag, x, z, el.y0 ?? 0, el.y, el.h ?? 1.6); },
    red_hall: redHall, great_gate: greatGate, bazaar_row: bazaarRow, bazaar_gate: bazaarGate, mughal_wall: mughalWall, octa_tower: octaTower, haveli: townHouse, inlay_workshop: inlayWorkshop, katra, haveli_open: haveliOpen, garden_lodge: gardenLodge,
  },
  objects: {},
});
void frustum;
export { onion, dome, archPath, arcadeWall, pishtaqFace, chhatri };
