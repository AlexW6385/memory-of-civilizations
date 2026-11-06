// Mughal architecture of the Taj Mahal (1632–1653; docs/settlements/mughal-agra.md §4–§5): the
// mausoleum of white marble on its plinth, a square with chamfered corners, each face a great
// iwan (pishtaq: a pointed arch in a rectangular frame) flanked by two storeys of smaller arched
// niches; the bulbous double dome on its drum with a lotus crown and a finial, four domed kiosks
// (chhatri) round it; four minarets with balconies; the mosque and its twin of red sandstone with
// three white domes; the great gate; walls with octagonal towers; the charbagh garden with its
// raised channels and the central pool; the town of flat-roofed houses with balconies (jharokha).

import { Shape, Path, ExtrudeGeometry, Matrix4 } from '../../core/three.js';
import { registerStyle, STYLES, orientedBox } from '../../core/build.js';
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
 * line; (nx, nz) into the recess.
 */
function alcove(bag, col, at, ux, uz, nx, nz, ar, th, y, mat) {
  const w = ar.w, h = ar.h, sill = ar.sill ?? 0, d = ar.depth ?? 1.2, y0 = y + sill, oct = ar.alcove !== 'rect';
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
    const pa = Q(A[0] + off, A[1]), pb = Q(Bk[0] + off, Bk[1] + (ar.pass ? 0.2 : 0));
    bag.add(mat, orientedBox(pa, pb, sideT, y0, ys + 0.05, 0.12));
    if (col && sill < 0.5) col.segment(pa, pb, sideT, y0, ys);
  }
  if (!ar.pass) bag.add(mat, orientedBox(Q(-wb / 2 - 0.1, n1 + 0.15), Q(wb / 2 + 0.1, n1 + 0.15), 0.3, y0, ys + 0.05));
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
  bag.add(mat, fromTriangles(tris));
  // the net of ribs over it, standing a few centimetres proud toward the opening
  const inward = (p) => { const dx = tgt[0] - p[0], dy = ty - p[1], dz = tgt[1] - p[2], L = Math.hypot(dx, dy, dz) || 1; return [p[0] + dx / L * 0.035, p[1] + dy / L * 0.035, p[2] + dz / L * 0.035]; };
  const rb = Math.max(0.018, Math.min(0.035, w * 0.0025));
  for (let k = 0; k <= 8; k++) for (let j = 0; j < 4; j++) {
    const t0 = j / 4.4, t1 = (j + 1) / 4.4, u0 = k / 8;
    if (k < 8) { bag.add(mat, rod(inward(V(u0, t0)), inward(V(u0 + 1 / 8, t1)), rb, 4)); bag.add(mat, rod(inward(V(u0 + 1 / 8, t0)), inward(V(u0, t1)), rb, 4)); }
  }
  for (const t of [0.0, 0.45, 0.68, 0.9]) for (let i = 0; i < 16; i++) bag.add(mat, rod(inward(V(i / 16, t)), inward(V((i + 1) / 16, t)), rb, 4));
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
        bag.add(mat, orientedBox(p0, p1, prot, ya, yb));
        // the cell's hood: a smaller block stepping out under the next tier
        const q0 = Q(A[0] + ds * (c0 + 0.08) + ms * (o + prot * 0.35), A[1] + dn * (c0 + 0.08) + mn * (o + prot * 0.35)), q1 = Q(A[0] + ds * (c1 - 0.08) + ms * (o + prot * 0.35), A[1] + dn * (c1 - 0.08) + mn * (o + prot * 0.35));
        bag.add(mat, orientedBox(q0, q1, prot * 0.3, yb - (yb - ya) * 0.3, yb));
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
  if (!ar.pass) {
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
  if (oct && spring > 3) for (const sg of [-1, 1]) {
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
  const arches = [{ at: L / 2, w: iw.w, h: iw.h, depth: iw.depth ?? 4, door: !iw.pass && !iw.back, back: iw.back, pass: iw.pass, alcove: iw.alcove && (iw.pass ? 'rect' : iw.alcove) }];
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
    arcadeWall(bag, col, p0, p1, y, iw.h, 0.4, iw.backMat || mat, [{ at: iw.w / 2, w: dw, h: Math.min(iw.h * 0.5, dw * 1.6), pass: true }]);
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
        slab(['stucco_rose', 'stucco_saffron', 'stucco_sky'][j % 3], cs - fr, cs + fr, cv - fr, cv + fr, o, o + 0.015);
        if (along === 'v') slab('stucco_leaf', cs - fr * 0.5, cs + fr * 0.5, cv + fr, cv + 0.25, o, o + 0.012); else slab('stucco_leaf', cs + fr, cs + 0.25, cv - fr * 0.5, cv + fr * 0.5, o, o + 0.012);
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
  const FL = ['stucco_rose', 'stucco_saffron', 'stucco_rose', 'stucco_sky'];
  for (const sd of [-1, 1]) {
    const S = (x) => (sd < 0 ? x : L - x);
    let prev = null, nfl = 0;
    for (let j = 0; j <= 64; j++) {
      const x = sL + (w / 2) * j / 64, vv = arcV(x) + 0.45 + 0.1 * Math.sin(j * 0.5);
      if (vv > vTop - 0.15) break;
      if (prev) { const s0 = Math.min(S(prev[0]), S(x)), s1 = Math.max(S(prev[0]), S(x)); slab(DK, s0, s1 + 0.035, Math.min(prev[1], vv), Math.max(prev[1], vv) + 0.035, 0, 0.015); }
      if (j % 10 === 5) {
        const fx = S(x), m2 = FL[nfl++ % FL.length];
        for (let p2 = 0; p2 < 5; p2++) { const an = p2 / 5 * Math.PI * 2, px = fx + Math.cos(an) * 0.1, pv = vv + 0.16 + Math.sin(an) * 0.1; slab(m2, px - 0.045, px + 0.045, pv - 0.045, pv + 0.045, 0, 0.018); }
        slab('stucco_saffron', fx - 0.03, fx + 0.03, vv + 0.13, vv + 0.19, 0, 0.022);
        slab('stucco_leaf', fx + 0.06 * sd, fx + 0.2 * sd > fx ? fx + 0.2 : fx - 0.06, vv - 0.06, vv + 0.0, 0, 0.016);
      }
      prev = [x, vv];
    }
    // the rosette in the angle between the arch and the band
    const rx = S(sL + w * 0.12), rv = (arcV(sL + w * 0.12) + vTop) / 2 + 0.2, rr = Math.min(0.8, (vTop - arcV(sL + w * 0.12)) * 0.3);
    if (rr > 0.2) {
      for (let p2 = 0; p2 < 12; p2++) { const an = p2 / 12 * Math.PI * 2, px = rx + Math.cos(an) * rr * 0.7, pv = rv + Math.sin(an) * rr * 0.7; slab(p2 % 2 ? 'stucco_leaf' : 'stucco_rose', px - rr * 0.14, px + rr * 0.14, pv - rr * 0.14, pv + rr * 0.14, 0, 0.018); }
      slab('stucco_saffron', rx - rr * 0.22, rx + rr * 0.22, rv - rr * 0.22, rv + rr * 0.22, 0, 0.022);
      // a spray of stems from the rosette, each ending in a flower between two leaves
      for (let p2 = 0; p2 < 6; p2++) {
        const an = p2 / 6 * Math.PI * 2 + 0.3, x0 = rx + Math.cos(an) * rr * 0.9, v0 = rv + Math.sin(an) * rr * 0.9;
        for (let q2 = 1; q2 <= 6; q2++) { const rr2 = rr * (0.9 + q2 * 0.22), a2 = an + q2 * 0.08, px = rx + Math.cos(a2) * rr2, pv = rv + Math.sin(a2) * rr2; if (pv < arcV(Math.min(sR, Math.max(sL, sd < 0 ? px : L - px))) + 0.6 || pv > vTop - 0.1) break; slab(DK, px - 0.022, px + 0.022, pv - 0.022, pv + 0.022, 0, 0.014);
          if (q2 === 6) { slab(FL[p2 % 4], px - 0.07, px + 0.07, pv - 0.07, pv + 0.07, 0, 0.02); slab('stucco_leaf', px - 0.16, px - 0.08, pv - 0.03, pv + 0.03, 0, 0.016); slab('stucco_leaf', px + 0.08, px + 0.16, pv - 0.03, pv + 0.03, 0, 0.016); } }
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
        const m = ['stucco_rose', 'stucco_leaf', 'stucco_saffron', 'stucco_sky', 'stucco_rose'][j];
        const t = []; beamTris(t, [p[0] - ux * 0.05, yy, p[1] - uz * 0.05], [p[0] + ux * 0.05, yy, p[1] + uz * 0.05], 0.015, 0.14); bag.add(m, fromTriangles(t));
        const t2 = []; beamTris(t2, [p[0] - ux * 0.11, yy + 0.05, p[1] - uz * 0.11], [p[0] + ux * 0.11, yy + 0.05, p[1] + uz * 0.11], 0.015, 0.04); bag.add('stucco_leaf', fromTriangles(t2));
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
  // the screen: an octagon of three pierced panels a side between posts, one panel open on the south
  const sa = 3.6, sr = sa / Math.cos(Math.PI / 8), sh = 1.9;
  const sv = (k) => { const a = Math.PI / 8 + k * Math.PI / 4 - Math.PI / 2; return [cx + Math.cos(a) * sr, cz + Math.sin(a) * sr]; };
  for (let k = 0; k < 8; k++) {
    const a = sv(k), b = sv(k + 1), L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L, isS = (a[1] + b[1]) / 2 - cz > sa * 0.9;
    for (let j = 0; j <= 3; j++) { const p = [a[0] + ux * L * j / 3, a[1] + uz * L * j / 3]; bag.add(W, lathe([[0.12, 0], [0.12, 0.2], [0.08, 0.3], [0.08, sh - 0.15], [0.12, sh], [0.06, sh + 0.25], [0.001, sh + 0.4]], 8, null, p[0], y, p[1])); }
    for (let j = 0; j < 3; j++) {
      const s0 = L * j / 3 + 0.1, s1 = L * (j + 1) / 3 - 0.1, P2 = (s2) => [a[0] + ux * s2, a[1] + uz * s2];
      const rail = (ya, yb, m) => { const t = []; const p0 = P2(s0), p1 = P2(s1); beamTris(t, [p0[0], ya, p0[1]], [p1[0], ya, p1[1]], 0.06, yb - ya); bag.add(m, fromTriangles(t)); };
      rail(y, y + 0.22, W); rail(sh + y - 0.22, sh + y, W); rail(sh + y - 0.17, sh + y - 0.12, 'stucco_rose');
      if (isS && j === 1) { const p0 = P2(s0), p1 = P2(s1); col.segment(P2(0.05), p0, 0.12, y, y + sh); void p1; continue; }
      const p0 = P2(s0), p1 = P2(s1); col.segment(p0, p1, 0.12, y, y + sh);
      // the piercing: a lattice of small hexagons, here a fine grid of slender bars
      const nb = 9;
      for (let g = 1; g < nb; g++) { const q = P2(s0 + (s1 - s0) * g / nb), t = []; beamTris(t, [q[0] - ux * 0.02, y + 0.22, q[1] - uz * 0.02], [q[0] + ux * 0.02, y + 0.22, q[1] + uz * 0.02], 0.03, sh - 0.44); bag.add(W, fromTriangles(t)); }
      for (let g = 1; g < 8; g++) rail(y + 0.22 + g * (sh - 0.44) / 8 - 0.02, y + 0.22 + g * (sh - 0.44) / 8 + 0.02, W);
      for (const [dx, dy, m] of [[0.25, 0.5, 'stucco_leaf'], [0.5, 0.75, 'stucco_rose'], [0.75, 0.5, 'stucco_saffron']]) { const q = P2(s0 + (s1 - s0) * dx), t = []; beamTris(t, [q[0] - ux * 0.045, y + 0.22 + (sh - 0.44) * dy - 0.045, q[1] - uz * 0.045], [q[0] + ux * 0.045, y + 0.22 + (sh - 0.44) * dy - 0.045, q[1] + uz * 0.045], 0.04, 0.09); bag.add(m, fromTriangles(t)); }
    }
  }
  // the cenotaph of Mumtaz Mahal at the very centre, on its platform, inlaid with inscriptions and flowers
  bag.add(W, box(cx - 1.25, y, cz - 2.1, cx + 1.25, y + 0.35, cz + 2.1));
  bag.add('marble_dark', box(cx - 1.27, y + 0.2, cz - 2.12, cx + 1.27, y + 0.25, cz + 2.12));
  bag.add(W, box(cx - 0.85, y + 0.35, cz - 1.55, cx + 0.85, y + 0.75, cz + 1.55));
  bag.add(W, frustum([cx - 0.6, cz - 1.25, cx + 0.6, cz + 1.25], y + 0.75, y + 1.45, 0.1, 0.1, 0.1, 0.1));
  bag.add(W, frustum([cx - 0.5, cz - 1.15, cx + 0.5, cz + 1.15], y + 1.45, y + 1.65, 0.3, 0.3, 0.05, 0.05));
  for (const yy of [y + 0.5, y + 1.0]) for (const sg of [-1, 1]) { bag.add('marble_dark', box(cx + sg * (yy < y + 0.6 ? 0.86 : 0.57) - 0.01, yy, cz - (yy < y + 0.6 ? 1.4 : 1.1), cx + sg * (yy < y + 0.6 ? 0.86 : 0.57) + 0.01, yy + 0.06, cz + (yy < y + 0.6 ? 1.4 : 1.1))); }
  for (let j = 0; j < 7; j++) for (const sg of [-1, 1]) bag.add(['stucco_rose', 'stucco_leaf', 'stucco_saffron'][j % 3], box(cx + sg * 0.86 - 0.012, y + 0.6, cz - 1.2 + j * 0.4, cx + sg * 0.86 + 0.012, y + 0.68, cz - 1.12 + j * 0.4));
  col.rect([cx - 1.25, cz - 2.1, cx + 1.25, cz + 2.1], y, y + 1.65);
}

/** red_hall: the mosque or its twin (the jawab) { rect, y, h, front, domes: 3 }: a hall of red sandstone with arched openings, three white domes. */
function redHall(el, { bag, col }) {
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

/** great_gate: the gate { c, y, w, d, h, front ('n'|'s') }: a block of red sandstone, its faces with great iwans, a row of small chhatris along the top, towers with kiosks at its corners. */
function greatGate(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, w = el.w / 2, d = el.d / 2, h = el.h;
  for (const s of [-1, 1]) pishtaqFace(bag, col, [cx + w * s, cz + d * s], [cx - w * s, cz + d * s], y, h, { w: w * 0.6, h: h * 0.75, depth: d - 1.5, alcove: 'oct' }, R, true, [cx, cz]);
  bag.add(R, box(cx - w, y, cz - d + 1.2, cx - w * 0.3, y + h, cz + d - 1.2));
  bag.add(R, box(cx + w * 0.3, y, cz - d + 1.2, cx + w, y + h, cz + d - 1.2));
  bag.add(R, box(cx - w * 0.3, y + h * 0.78, cz - d + 1.2, cx + w * 0.3, y + h, cz + d - 1.2));
  col.rect([cx - w, cz - d, cx - w * 0.3, cz + d], y, y + h); col.rect([cx + w * 0.3, cz - d, cx + w, cz + d], y, y + h);
  for (let i = 0; i < 11; i++) chhatri(bag, null, cx - w * 0.75 + i * w * 1.5 / 10, y + h, cz + d - 1.2, 0.9, 1.6, 6, W, W);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    bag.add(R, lathe([[2.2, 0], [2, h + 2]], 8, null, cx + sx * w, y, cz + sz * d));
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

/** haveli: a town house { rect, storeys, seed }: plastered brick, flat roof with a parapet, a jharokha (a balcony on brackets with a little roof) over the door. */
function haveli(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, st = el.storeys ?? (rand() < 0.5 ? 2 : 3), H = st * 3.3;
  const mat = rand() < 0.5 ? 'stucco_warm' : (rand() < 0.5 ? 'lime_plaster' : 'sandstone_red');
  bag.add(mat, box(x0, 0, z0, x1, H, z1));
  bag.add(mat, box(x0 - 0.15, H, z0 - 0.15, x1 + 0.15, H + 0.9, z0 + 0.15)); bag.add(mat, box(x0 - 0.15, H, z1 - 0.15, x1 + 0.15, H + 0.9, z1 + 0.15));
  col.rect([x0, z0, x1, z1], 0, H); col.floor([x0, z0, x1, z1], H);
  const zf = z1 + 0.02, xc = (x0 + x1) / 2;
  bag.add('timber', box(xc - 0.8, 0, zf - 0.05, xc + 0.8, 2.4, zf + 0.05));
  if (st > 1) {
    bag.add('sandstone_red', box(xc - 1.4, 3.6, zf, xc + 1.4, 3.8, zf + 1.0));
    for (const s of [-1, 1]) bag.add('sandstone_red', box(xc + s * 1.3 - 0.1, 3.8, zf + 0.85, xc + s * 1.3 + 0.1, 5.6, zf + 1.0));
    bag.add('lacquer_black', box(xc - 1.1, 3.8, zf - 0.02, xc + 1.1, 5.4, zf));
    bag.add('sandstone_red', lathe([[1.6, 0], [1.2, 0.5], [0.001, 0.9]], 4, null, xc, 5.6, zf + 0.5));
  }
}

/** A fountain at (x, z): a lotus of marble rising from the water floor (y0) to just above the surface (y),
 *  a copper nozzle, the jet of water h high. */
function fountain(bag, x, z, y0, y, h = 1.6) {
  const hb = y - y0 + 0.1;
  bag.add('marble_smooth', lathe([[0.22, 0], [0.18, hb * 0.6], [0.3, hb * 0.85], [0.26, hb], [0.08, hb], [0.001, hb]], 16, (th, i) => (i === 2 || i === 3 ? 1 + 0.12 * Math.abs(Math.cos(th * 4)) : 1), x, y0, z));
  bag.add('bronze', lathe([[0.05, 0], [0.04, 0.1], [0.018, 0.16], [0.001, 0.16]], 8, null, x, y0 + hb, z));
  // the jet: a white column of broken water, spreading into a plume that falls back
  bag.add('paint_white', lathe([[0.045, 0], [0.035, h * 0.5], [0.025, h * 0.85], [0.07, h * 0.93], [0.11, h * 0.9], [0.05, h * 0.97], [0.001, h]], 8, null, x, y0 + hb + 0.14, z));
}
registerStyle('mughal', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: {
    ...STYLES.qing.elements,
    mausoleum,
    minaret: (el, { bag, col }) => minaret(bag, col, el.c[0], el.y, el.c[1], el.h, el.r),
    chhatri: (el, { bag, col }) => chhatri(bag, col, el.c[0], el.y, el.c[1], el.r, el.h, el.n ?? 8, el.mat ?? W, el.domeMat ?? W),
    fountains: (el, { bag }) => { for (const [x, z] of el.pts) fountain(bag, x, z, el.y0 ?? 0, el.y, el.h ?? 1.6); },
    red_hall: redHall, great_gate: greatGate, mughal_wall: mughalWall, octa_tower: octaTower, haveli,
  },
  objects: {},
});
void frustum;
export { onion, dome, archPath, arcadeWall, pishtaqFace, chhatri };
