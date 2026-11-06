// Early Indian Buddhist architecture (2nd–1st century BCE): the vocabulary of the stupas at
// Sanchi. A hemispherical dome (anda) on a circular terrace (medhi) with a walk and a railing; a
// double stairway; on the flattened top a square railing (harmika) round the shaft of a triple
// parasol (chattra); the ground railing (vedika) of posts, lens-shaped crossbars and a rounded
// coping — timber construction turned into stone; gateways (torana) of two square posts with
// animal capitals and three architraves with volute ends; Ashoka's polished pillar with its lion
// capital; a monastery of cells round a court.

import { registerStyle, orientedBox } from '../../core/build.js';
import { box, lathe, fromTriangles, rod, orientOutward, place } from '../../core/geom.js';
import { hexa, obox } from '../chinese/index.js';

const STONE = 'sandstone_dressed', RAIL = 'sandstone_rail', DOME = 'lime_plaster';

/**
 * A ring of railing { c, r, y, h, gaps: [angles in radians of openings], gap (half-width m), mat }:
 * octagonal posts, three crossbars, a rounded coping. Colliders follow each run of posts.
 */
function railRing(bag, col, c, r, y, h, gaps = [], gap = 1.8, mat = RAIL, walls = true) {
  const pitch = Math.max(0.7, h / 3.1), post = 0.3 * Math.max(0.45, h / 3.1);
  const N = Math.round(2 * Math.PI * r / pitch);
  const open = (a) => gaps.some((g) => { let d = Math.abs(((a - g) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI); return d * r < gap; });
  const posts = [], bars = [];
  const pt = (a, rr = r) => [c[0] + Math.cos(a) * rr, c[1] + Math.sin(a) * rr];
  for (let k = 0; k < N; k++) {
    const a = 2 * Math.PI * k / N, a1 = 2 * Math.PI * (k + 1) / N;
    if (open(a)) continue;
    const [px, pz] = pt(a);
    const u = [-Math.sin(a), Math.cos(a)], n = [Math.cos(a), Math.sin(a)];
    obox(posts, [px, pz], u, n, post, post, y, y + h - h * 0.19);
    if (open(a1)) continue;
    // three lens-shaped crossbars to the next post, and the coping over them
    const [qx, qz] = pt(a1), m = [(px + qx) / 2, (pz + qz) / 2], L = Math.hypot(qx - px, qz - pz) / 2;
    const uu = [(qx - px) / (2 * L), (qz - pz) / (2 * L)], nn = [-uu[1], uu[0]];
    for (let b = 0; b < 3; b++) { const yb = y + h * (0.2 + b * 0.22); obox(bars, m, uu, nn, L, post * 0.55, yb, yb + h * 0.14); }
    obox(bars, m, uu, nn, L + 0.02, post * 1.05, y + h * 0.81, y + h * 0.93);
    obox(bars, m, uu, nn, L + 0.02, post * 0.8, y + h * 0.93, y + h);
    if (walls && col) col.segment([px, pz], [qx, qz], post * 2, y, y + h);
  }
  bag.add(mat, fromTriangles(posts));
  bag.add(mat, fromTriangles(bars));
}

// Figures carved in the round, built facing +x with the feet at the origin, about life-size at
// scale 1; placed with fig(), which turns +x to face the direction (dx, dz).
const ell = (rx, ry, x, y, z, n = 10, mod = null) => lathe([[0.001, -ry], [rx * 0.6, -ry * 0.8], [rx * 0.92, -ry * 0.4], [rx, 0], [rx * 0.92, ry * 0.4], [rx * 0.6, ry * 0.8], [0.001, ry]], n, mod, x, y + ry, z);
/** A lion seated on its haunches, the mane in flame-like locks, forelegs straight, jaws open: 1.2 m. */
function lionFig() {
  const g = [];
  g.push(ell(0.24, 0.25, -0.1, 0, 0, 8));
  g.push(lathe([[0.001, 0], [0.2, 0.03], [0.25, 0.25], [0.24, 0.5], [0.001, 0.6]], 10, null, 0.07, 0.04, 0));
  g.push(lathe([[0.001, 0], [0.22, 0.03], [0.29, 0.2], [0.3, 0.38], [0.24, 0.5], [0.12, 0.58], [0.001, 0.6]], 18, (th, i) => (i >= 2 && i <= 4 ? 1 + 0.12 * Math.abs(Math.cos(th * 9)) : 1), 0.1, 0.42, 0));
  for (const z of [-0.1, 0.1]) { g.push(rod([0.3, 0.02, z], [0.22, 0.62, z], 0.06, 6)); g.push(box(0.25, 0, z - 0.06, 0.4, 0.06, z + 0.06)); }
  g.push(lathe([[0.001, 0], [0.13, 0.03], [0.15, 0.13], [0.12, 0.24], [0.001, 0.27]], 10, null, 0.3, 0.84, 0));
  g.push(box(0.38, 0.92, -0.07, 0.5, 1.02, 0.07));
  g.push(box(0.38, 0.84, -0.06, 0.47, 0.88, 0.06));
  for (const z of [-0.09, 0.09]) g.push(lathe([[0.001, 0], [0.04, 0.03], [0.001, 0.07]], 5, null, 0.27, 1.08, z));
  return g;
}
/** An elephant standing, its trunk curling down, ears spread: 1.0 m to the back. */
function elephantFig() {
  const g = [];
  const body = lathe([[0.001, -0.45], [0.22, -0.38], [0.3, -0.15], [0.31, 0.1], [0.27, 0.35], [0.001, 0.45]], 12, null, 0, 0, 0);
  body.rotateZ(-Math.PI / 2).translate(0, 0.66, 0); g.push(body);
  for (const [x, z] of [[0.24, 0.15], [0.24, -0.15], [-0.26, 0.15], [-0.26, -0.15]]) g.push(lathe([[0.1, 0], [0.09, 0.62], [0.001, 0.62]], 8, null, x, 0, z));
  g.push(lathe([[0.001, 0], [0.18, 0.05], [0.2, 0.2], [0.15, 0.36], [0.001, 0.4]], 10, null, 0.46, 0.62, 0));
  g.push(rod([0.6, 0.82, 0], [0.68, 0.52, 0], 0.065, 6)); g.push(rod([0.68, 0.52, 0], [0.66, 0.22, 0], 0.05, 6)); g.push(rod([0.66, 0.22, 0], [0.74, 0.1, 0], 0.04, 6));
  for (const sd of [-1, 1]) { g.push(box(0.4, 0.58, sd > 0 ? 0.16 : -0.36, 0.46, 0.96, sd > 0 ? 0.36 : -0.16)); g.push(rod([0.58, 0.7, sd * 0.08], [0.72, 0.62, sd * 0.1], 0.025, 5)); }
  return g;
}
/** A pot-bellied dwarf (yaksha) squatting, both arms raised to carry the load: 0.92 m. */
function dwarfFig() {
  const g = [];
  g.push(lathe([[0.001, 0], [0.26, 0.02], [0.27, 0.12], [0.2, 0.18], [0.001, 0.18]], 10, null, 0.02, 0, 0));
  g.push(lathe([[0.16, 0], [0.28, 0.12], [0.28, 0.3], [0.2, 0.44], [0.12, 0.5], [0.001, 0.5]], 12, null, 0.03, 0.12, 0));
  g.push(lathe([[0.001, 0], [0.12, 0.04], [0.13, 0.14], [0.08, 0.22], [0.001, 0.24]], 10, null, 0.06, 0.6, 0));
  for (const z of [-1, 1]) { g.push(rod([0.02, 0.52, z * 0.17], [0.04, 0.72, z * 0.24], 0.05, 6)); g.push(rod([0.04, 0.72, z * 0.24], [0.0, 0.9, z * 0.13], 0.045, 6)); }
  return g;
}
/** A woman (śālabhañjikā) standing in a triple bend, one leg crossed, an arm raised to a branch: 2.1 m to the hand. */
function yakshiFig() {
  const g = [];
  g.push(rod([0.02, 0, 0.08], [0.06, 0.48, 0.07], 0.06, 6)); g.push(rod([0.06, 0.48, 0.07], [0.05, 0.92, 0.07], 0.085, 6));
  g.push(rod([0.16, 0.04, -0.04], [0.1, 0.48, -0.06], 0.055, 6)); g.push(rod([0.1, 0.48, -0.06], [0.04, 0.92, -0.07], 0.085, 6));
  g.push(lathe([[0.12, 0], [0.2, 0.08], [0.2, 0.2], [0.13, 0.3], [0.001, 0.3]], 10, null, 0.06, 0.84, 0));
  g.push(lathe([[0.205, 0], [0.215, 0.03], [0.205, 0.06]], 12, null, 0.06, 0.98, 0));
  g.push(lathe([[0.11, 0], [0.12, 0.12], [0.16, 0.26], [0.13, 0.38], [0.06, 0.44], [0.001, 0.44]], 10, null, 0.02, 1.12, 0));
  for (const z of [-0.075, 0.075]) g.push(ell(0.07, 0.07, 0.11, 1.3, z, 8));
  g.push(lathe([[0.001, 0], [0.09, 0.04], [0.1, 0.14], [0.06, 0.22], [0.001, 0.24]], 10, null, 0.0, 1.58, 0));
  g.push(ell(0.07, 0.06, -0.06, 1.72, 0, 8));
  g.push(rod([0.0, 1.5, 0.14], [0.14, 1.78, 0.18], 0.04, 5)); g.push(rod([0.14, 1.78, 0.18], [0.28, 2.06, 0.1], 0.035, 5));
  g.push(rod([0.0, 1.5, -0.14], [-0.1, 1.28, -0.14], 0.04, 5)); g.push(rod([-0.1, 1.28, -0.14], [-0.2, 1.3, -0.02], 0.035, 5));
  return g;
}
/** Place a figure's parts: feet at (x, y, z), +x turned to (dx, dz), leaning outward by `lean`, scale s. */
function fig(bag, mat, parts, x, y, z, dx, dz, s = 1, lean = 0) {
  for (const g of parts) { if (lean) g.rotateZ(-lean); bag.add(mat, place(g, x, y, z, Math.atan2(-dz, dx), s)); }
}

// a beam along u through `at`, its ends rising (rise at the ends), section depth ±d in n, height h
function curvedBeam(out, at, u, n, half, d, y0, h, rise, segs = 12) {
  const P = (t, dn, dy) => { const yy = y0 + rise * t * t + dy; return [at[0] + u[0] * t * half + n[0] * dn, yy, at[1] + u[1] * t * half + n[1] * dn]; };
  const q = (A, B, C, D) => out.push(...A, ...B, ...C, ...A, ...C, ...D);
  for (let i = 0; i < segs; i++) {
    const t0 = -1 + 2 * i / segs, t1 = -1 + 2 * (i + 1) / segs;
    q(P(t0, d, 0), P(t1, d, 0), P(t1, d, h), P(t0, d, h));
    q(P(t1, -d, 0), P(t0, -d, 0), P(t0, -d, h), P(t1, -d, h));
    q(P(t0, -d, h), P(t0, d, h), P(t1, d, h), P(t1, -d, h));
    q(P(t0, d, 0), P(t0, -d, 0), P(t1, -d, 0), P(t1, d, 0));
  }
  for (const t of [-1, 1]) q(P(t, -d, 0), P(t, d, 0), P(t, d, h), P(t, -d, h));
}

/**
 * A gateway (torana) at { at, dir (outward), y, s (scale) }: two square posts carved in panels,
 * capitals of four elephants back to back, three architraves curving up to their spiral ends and
 * carved with processions on both faces, the bracket figures (yakshis) leaning out from the posts
 * under the lowest one, uprights and small figures between them, the wheel and triratnas above.
 */
function torana(bag, col, at, dir, y, s = 1, kind = 'elephant') {
  const u = [-dir[1], dir[0]], out = [], caps = [], carve = [];
  const W = 2.1 * s, P = 0.35 * s, H = 6.4 * s;
  const at2 = (k, d = 0) => [at[0] + u[0] * k + dir[0] * d, at[1] + u[1] * k + dir[1] * d];
  for (const k of [-1, 1]) {
    const c = at2(k * W);
    obox(out, c, u, dir, P, P, y, y + H);
    // the carved panels on the front and back faces of the post
    for (const f of [-1, 1]) for (const [p0, p1] of [[0.8, 2.4], [2.6, 4.2], [4.4, 6.0]]) {
      obox(carve, [c[0] + dir[0] * f * (P + 0.025 * s), c[1] + dir[1] * f * (P + 0.025 * s)], u, dir, P * 0.82, 0.025 * s, y + p0 * s, y + p1 * s);
      obox(carve, [c[0] + dir[0] * f * (P + 0.06 * s), c[1] + dir[1] * f * (P + 0.06 * s)], u, dir, P * 0.42, 0.02 * s, y + (p0 + 0.3) * s, y + (p1 - 0.3) * s);
    }
    // the capital: an abacus, four elephants standing back to back
    obox(caps, c, u, dir, P * 1.2, P * 1.2, y + H - 0.25 * s, y + H);
    obox(caps, c, u, dir, P * 1.9, P * 1.9, y + H, y + H + 0.18 * s);
    for (const ax of [u, [-u[0], -u[1]], dir, [-dir[0], -dir[1]]]) {
      // the capital's four beasts back to back: lions (the south gate), pot-bellied dwarfs (the west), elephants
      if (kind === 'lion') fig(bag, RAIL, lionFig(), c[0] + ax[0] * 0.2 * s, y + H + 0.18 * s, c[1] + ax[1] * 0.2 * s, ax[0], ax[1], 0.72 * s);
      else if (kind === 'dwarf') fig(bag, RAIL, dwarfFig(), c[0] + ax[0] * 0.3 * s, y + H + 0.18 * s, c[1] + ax[1] * 0.3 * s, ax[0], ax[1], 0.94 * s);
      else fig(bag, RAIL, elephantFig(), c[0] + ax[0] * 0.28 * s, y + H + 0.18 * s, c[1] + ax[1] * 0.28 * s, ax[0], ax[1], 0.9 * s);
    }
    obox(caps, c, u, dir, P * 1.7, P * 1.7, y + H + 1.05 * s, y + H + 1.2 * s);
    if (col) col.rect([c[0] - P, c[1] - P, c[0] + P, c[1] + P], y, y + H);
    // the bracket figure: a woman leaning out from the post under a tree, one arm up to its branch
    const foot = at2(k * (W + P + 0.06 * s));
    fig(bag, RAIL, yakshiFig(), foot[0], y + H - 1.6 * s, foot[1], u[0] * k, u[1] * k, 1.2 * s, 0.45);
    // the tree she clings to: its trunk springing from the post up to the crown under the architrave's end, the branch in her hand
    { const t0 = at2(k * (W + P - 0.05 * s)), t1 = at2(k * (W + P + 1.45 * s)), hd = at2(k * (W + P + 1.44 * s));
      bag.add(RAIL, rod([t0[0], y + H - 1.2 * s, t0[1]], [t1[0], y + H + 0.95 * s, t1[1]], 0.1 * s, 6));
      bag.add(RAIL, rod([hd[0], y + H + 0.45 * s, hd[1]], [t1[0], y + H + 1.0 * s, t1[1]], 0.05 * s, 5)); }
    // the tree's crown, filling the angle under the architrave's end
    const crown = at2(k * (W + P + 1.62 * s));
    bag.add(RAIL, lathe([[0.001, -0.3 * s], [0.45 * s, -0.18 * s], [0.5 * s, 0.05 * s], [0.3 * s, 0.25 * s], [0.001, 0.3 * s]], 10, (th) => 1 + 0.12 * Math.cos(th * 5), crown[0], y + H + 1.15 * s, crown[1]));
  }
  // the three architraves, curving up to the ends, a spiral at either end, a procession on each face
  for (let b = 0; b < 3; b++) {
    const yb = y + H + 1.2 * s + b * 1.5 * s, half = 4.3 * s, rise = 0.22 * s, d = 0.32 * s;
    const beam = []; curvedBeam(beam, at, u, dir, half, d, yb, 0.6 * s, rise); out.push(...orientOutward(beam));
    for (const f of [-1, 1]) for (let t = -0.88; t <= 0.89; t += 0.105) {
      if (Math.abs(Math.abs(t * half) - W) < 0.45 * s) continue;     // not where the posts and uprights cross
      const hgt = (Math.round(t * 20) % 2 ? 0.34 : 0.26) * s, yy = yb + rise * t * t + 0.12 * s;
      obox(carve, [at[0] + u[0] * t * half + dir[0] * f * (d + 0.03 * s), at[1] + u[1] * t * half + dir[1] * f * (d + 0.03 * s)], u, dir, 0.13 * s, 0.03 * s, yy, yy + hgt);
    }
    for (const k of [-1, 1]) {
      const e = at2(k * half), ye = yb + rise + 0.3 * s;
      for (const [r, th] of [[0.5, 0.36], [0.3, 0.42], [0.12, 0.46]]) {
        const vol = lathe([[0.001, -th * s], [r * s, -th * s], [r * s, th * s], [0.001, th * s]], 14, null, 0, 0, 0);
        vol.rotateX(Math.PI / 2).rotateY(Math.atan2(u[0], u[1]) + Math.PI / 2).translate(e[0], ye, e[1]);
        bag.add(STONE, vol);
      }
      // the scroll rolled up: a spiral in relief on both faces, two and a half turns inward
      for (const f of [-1, 1]) {
        const pts = [];
        for (let j = 0; j <= 30; j++) { const a = -k * j / 30 * 5 * Math.PI, r = (0.48 - 0.4 * j / 30) * s; const o = (r > 0.31 * s ? 0.37 : 0.43) * s; pts.push([e[0] - u[0] * k * Math.cos(a) * r + dir[0] * f * o, ye - Math.sin(a) * r * k, e[1] - u[1] * k * Math.cos(a) * r + dir[1] * f * o]); }
        for (let j = 0; j < 30; j++) bag.add(RAIL, rod(pts[j], pts[j + 1], 0.04 * s, 5));
      }
    }
    // short uprights and small figures between the architraves
    if (b < 2) for (const k of [-1, -0.33, 0.33, 1]) {
      const dd = k * W * (Math.abs(k) === 1 ? 1 : 1.3), tt = dd / half;
      obox(out, at2(dd), u, dir, 0.22 * s, 0.22 * s, yb + rise * tt * tt + 0.55 * s, yb + 1.55 * s);
    }
    if (b < 2) for (const k of [-0.66, 0, 0.66]) {
      const dd = k * W * 1.15, tt = dd / half;
      obox(carve, at2(dd), u, dir, 0.12 * s, 0.14 * s, yb + rise * tt * tt + 0.6 * s, yb + 1.35 * s);
      bag.add(RAIL, lathe([[0.001, -0.1 * s], [0.1 * s, 0], [0.001, 0.1 * s]], 8, null, ...((p) => [p[0], yb + 1.42 * s, p[1]])(at2(dd))));
    }
  }
  // the emblems on top: a wheel in the middle, a triratna over each post
  const top = y + H + 1.2 * s + 2 * 1.5 * s + 0.6 * s;
  for (const [r, th] of [[0.75, 0.1], [0.62, 0.13], [0.16, 0.18]]) {
    const wheel = lathe([[0.001, -th * s], [r * s, -th * s], [r * s, th * s], [0.001, th * s]], 20, null, 0, 0, 0);
    wheel.rotateX(Math.PI / 2).rotateY(Math.atan2(dir[0], dir[1])).translate(at[0], top + 0.85 * s, at[1]);
    bag.add(r === 0.62 ? RAIL : STONE, wheel);
  }
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6, p0 = [at[0] + u[0] * Math.cos(a) * 0.16 * s, top + 0.85 * s + Math.sin(a) * 0.16 * s, at[1] + u[1] * Math.cos(a) * 0.16 * s];
    const p1 = [at[0] + u[0] * Math.cos(a) * 0.62 * s, top + 0.85 * s + Math.sin(a) * 0.62 * s, at[1] + u[1] * Math.cos(a) * 0.62 * s];
    bag.add(STONE, rod(p0, p1, 0.035 * s, 5));
  }
  obox(caps, at, u, dir, 0.18 * s, 0.14 * s, top, top + 0.12 * s);
  for (const k of [-1, 1]) {
    const c = at2(k * W);
    obox(caps, c, u, dir, 0.4 * s, 0.12 * s, top, top + 0.9 * s);
    obox(caps, c, u, dir, 0.15 * s, 0.12 * s, top + 0.9 * s, top + 1.3 * s);
  }
  bag.add(STONE, fromTriangles(out));
  bag.add(RAIL, fromTriangles(caps));
  bag.add(RAIL, fromTriangles(carve));
}

/**
 * A stupa { c, s (scale; 1 = the Great Stupa), y, gates: ['s','n','e','w'], stair }: drum, dome,
 * harmika and parasols, the terrace walk with its railing, the double stairway on the south, the
 * ground railing and the gateways.
 */
function stupa(el, { bag, col }) {
  const [cx, cz] = el.c, s = el.s ?? 1, y = el.y ?? 0;
  const RM = 18.3 * s, HM = 4.3 * s, RA = 16.5 * s, TOP = 16.46 * s, RT = 5 * s;
  // the drum, its moulded top edge
  bag.add(STONE, lathe([[RM + 0.15 * s, -0.2], [RM + 0.15 * s, 0.3 * s], [RM, 0.45 * s], [RM, HM - 0.25 * s], [RM + 0.12 * s, HM - 0.15 * s], [RM + 0.12 * s, HM], [RA, HM]], 72, null, cx, y, cz));
  col.circle(cx, cz, RM, y, y + HM);
  // the walk on the drum's top, as tiles over the ring
  const step = 0.5;
  for (let x = -RM; x < RM; x += step) for (let z = -RM; z < RM; z += step) {
    const d = Math.hypot(x + step / 2, z + step / 2);
    if (d > RA - 0.3 && d < RM) col.floor([cx + x, cz + z, cx + x + step, cz + z + step], y + HM);
  }
  // the dome: a sphere's zone from the walk's inner edge to the flattened top
  const yc = ((RT * RT + (TOP - HM) ** 2) - RA * RA) / (2 * (TOP - HM));       // centre above the walk
  const R = Math.hypot(RA, yc);
  const prof = [];
  for (let k = 0; k <= 24; k++) {
    const yy = (TOP - HM) * k / 24, rr = Math.sqrt(Math.max(0, R * R - (yy - yc) ** 2));
    prof.push([rr, HM + yy]);
  }
  prof.push([0.001, TOP]);
  bag.add(DOME, lathe(prof, 72, null, cx, y, cz));
  col.circle(cx, cz, RA, y + HM, y + TOP);
  // the harmika: a square railing on the top, the shaft and three parasols
  const hm = 2.3 * s;
  bag.add(RAIL, box(cx - hm, y + TOP, cz - hm, cx + hm, y + TOP + 0.3 * s, cz + hm));
  for (const [a, b] of [[[-1, -1], [1, -1]], [[1, -1], [1, 1]], [[1, 1], [-1, 1]], [[-1, 1], [-1, -1]]]) {
    const p = [cx + a[0] * hm, cz + a[1] * hm], q = [cx + b[0] * hm, cz + b[1] * hm], L = Math.hypot(q[0] - p[0], q[1] - p[1]) / 2;
    const uu = [(q[0] - p[0]) / (2 * L), (q[1] - p[1]) / (2 * L)], nn = [-uu[1], uu[0]], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], out = [];
    for (let k = 0; k <= 6; k++) obox(out, [p[0] + uu[0] * L * 2 * k / 6, p[1] + uu[1] * L * 2 * k / 6], uu, nn, 0.13 * s, 0.13 * s, y + TOP + 0.3 * s, y + TOP + 1.4 * s);
    for (const yb of [0.55, 0.85]) obox(out, m, uu, nn, L, 0.07 * s, y + TOP + yb * s, y + TOP + (yb + 0.14) * s);
    obox(out, m, uu, nn, L + 0.1 * s, 0.18 * s, y + TOP + 1.4 * s, y + TOP + 1.65 * s);
    bag.add(RAIL, fromTriangles(out));
  }
  bag.add(RAIL, lathe([[0.16 * s, 0], [0.13 * s, 5.0 * s], [0.001, 5.0 * s]], 8, null, cx, y + TOP, cz));
  for (const [d, h] of [[3.6, 2.6], [3.0, 3.6], [2.4, 4.5]]) {
    bag.add(STONE, lathe([[0.15 * s, h * s - 0.25 * s], [d / 2 * s, h * s - 0.12 * s], [d / 2 * s, h * s], [0.001, h * s + 0.18 * s]], 20, null, cx, y + TOP, cz));
  }
  // the railing on the terrace
  const gs = Math.PI / 2;                       // south (+z) in plan angles
  railRing(bag, col, [cx, cz], RM - 0.2 * s, y + HM, 1.3 * s, el.stair ? [gs] : [], 1.4 * s);
  // the double stairway on the south: two flights along the drum rising to a landing
  if (el.stair) {
    const zs0 = cz + RM - 0.1 * s, zs1 = cz + RM + 1.6 * s, xl = 1.6 * s, xr = 7.0 * s;
    bag.add(STONE, box(cx - xl, y, zs0 - 1.2 * s, cx + xl, y + HM, zs1));
    col.rect([cx - xl, cz + RM + 0.05, cx + xl, zs1], y, y + HM);
    col.floor([cx - xl, zs0 - 1.2 * s, cx + xl, zs1], y + HM);
    for (const k of [-1, 1]) {
      const x0 = Math.min(cx + k * xl, cx + k * xr), x1 = Math.max(cx + k * xl, cx + k * xr);
      const n = Math.round(HM / 0.18), dir = k > 0 ? 'w' : 'e';
      for (let i = 0; i < n; i++) {
        const t1 = (i + 1) / n, yTop = y + HM * t1;
        const xa = k > 0 ? cx + xr - (xr - xl) * t1 : x0, xb = k > 0 ? x1 : cx - xr + (xr - xl) * t1;
        bag.add(STONE, box(xa, y - 0.01, zs0 + 0.1 * s, xb, yTop, zs1));
      }
      col.ramp([x0, zs0 + 0.1 * s, x1, zs1], y, y + HM, dir);
      // the balustrade on the outer side
      const out = [];
      for (let i = 0; i <= 6; i++) {
        const t = i / 6, xx = cx + k * (xl + (xr - xl) * t), yy = y + HM * (1 - t);
        obox(out, [xx, zs1 - 0.15 * s], [1, 0], [0, 1], 0.14 * s, 0.14 * s, yy, yy + 1.2 * s);
      }
      hexa(out, [[cx + k * xl, y + HM + 1.0 * s, zs1 - 0.3 * s], [cx + k * xr, y + 1.0 * s, zs1 - 0.3 * s], [cx + k * xr, y + 1.0 * s, zs1], [cx + k * xl, y + HM + 1.0 * s, zs1]],
        [[cx + k * xl, y + HM + 1.3 * s, zs1 - 0.3 * s], [cx + k * xr, y + 1.3 * s, zs1 - 0.3 * s], [cx + k * xr, y + 1.3 * s, zs1], [cx + k * xl, y + HM + 1.3 * s, zs1]]);
      bag.add(RAIL, fromTriangles(out));
      col.segment([cx + k * xl, zs1 - 0.15 * s], [cx + k * xr, zs1 - 0.15 * s], 0.3 * s, y, y + HM + 1.3 * s);
    }
  }
  // the ground railing with its four (or fewer) openings, and the gateways before them
  const RV = 24 * s, ang = { e: 0, s: Math.PI / 2, w: Math.PI, n: -Math.PI / 2 };
  const gates = el.gates || [];
  railRing(bag, col, [cx, cz], RV, y, 3.1 * s, gates.map((g) => ang[g]), 2.0 * s);
  bag.add('sandstone_floor', lathe([[RV + 0.6 * s, 0.02], [RM + 0.15 * s, 0.02]], 72, null, cx, y, cz));
  for (const g of gates) {
    const a = ang[g], d = [Math.cos(a), Math.sin(a)];
    torana(bag, col, [cx + d[0] * (RV + 3 * s), cz + d[1] * (RV + 3 * s)], d, y, s, s >= 1 && g === 's' ? 'lion' : s >= 1 && g === 'w' ? 'dwarf' : 'elephant');
  }
}

/** Ashoka's pillar { at, y }: a polished tapering shaft of a single stone; the bell capital of lotus
 *  petals hanging down, a roped torus; the round abacus carved with pairs of geese alternating with
 *  honeysuckle; four lions seated back to back. */
function ashokaPillar(el, { bag, col }) {
  const [x, z] = el.at, y = el.y, PS = 'polished_sandstone', hs = 9.5;
  bag.add(PS, lathe([[0.4, 0], [0.31, hs], [0.001, hs]], 20, null, x, y, z));
  // the bell: sixteen petals turned down, narrowing to the neck
  const yb = y + hs;
  bag.add(PS, lathe([[0.3, 0], [0.56, 0.04], [0.6, 0.12], [0.55, 0.35], [0.45, 0.6], [0.34, 0.8], [0.3, 0.86], [0.001, 0.86]], 32, (th, i) => (i >= 2 && i <= 5 ? 1 + 0.06 * Math.abs(Math.cos(th * 8)) : 1), x, yb, z));
  bag.add(PS, lathe([[0.3, 0], [0.36, 0.05], [0.36, 0.13], [0.3, 0.18], [0.001, 0.18]], 20, (th, i) => (i === 1 || i === 2 ? 1 + 0.04 * Math.cos(th * 18) : 1), x, yb + 0.86, z));
  // the abacus, its frieze of geese and honeysuckle in relief
  const ya = yb + 1.04, ra = 0.52, ha = 0.3;
  bag.add(PS, lathe([[ra, 0], [ra, ha], [0.001, ha]], 32, null, x, ya, z));
  for (let k = 0; k < 8; k++) {
    const a = k / 8 * Math.PI * 2 + Math.PI / 8, dx = Math.cos(a), dz = Math.sin(a), tx = -dz, tz = dx, px = x + dx * ra, pz = z + dz * ra;
    if (k % 2 === 0) for (const sd of [-1, 1]) {
      // a goose pecking: the body, the neck bowed to the ground
      const gx = px + tx * sd * 0.09, gz = pz + tz * sd * 0.09;
      bag.add(PS, lathe([[0.001, 0], [0.035, 0.02], [0.04, 0.06], [0.001, 0.09]], 6, null, gx, ya + 0.08, gz));
      bag.add(PS, rod([gx + tx * sd * 0.02, ya + 0.15, gz + tz * sd * 0.02], [gx - tx * sd * 0.07, ya + 0.07, gz - tz * sd * 0.07], 0.012, 4));
    } else for (let j = -2; j <= 2; j++) {
      // the honeysuckle (palmette): a fan of petals from a little volute
      const ang = j * 0.32;
      bag.add(PS, rod([px, ya + 0.06, pz], [px + tx * Math.sin(ang) * 0.12, ya + 0.06 + Math.cos(ang) * 0.17, pz + tz * Math.sin(ang) * 0.12], 0.014, 4));
    }
  }
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4, d = [Math.cos(a), Math.sin(a)]; fig(bag, PS, lionFig(), x + d[0] * 0.2, ya + ha, z + d[1] * 0.2, d[0], d[1], 1.0); }
  col.circle(x, z, 0.45, y, y + hs);
}

/** A monastery { rect, y, cell, door }: brick cells round a square court, a verandah of posts, one entrance. */
function vihara(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, D = el.cell || 3.4, H = 3.2;
  const wall = (p, q, th, y0 = y - 0.1, y1 = y + H) => {
    if (Math.hypot(q[0] - p[0], q[1] - p[1]) < 0.05) return;
    bag.add('brick', orientedBox(p, q, th, y0, y1, th / 2));
    col.segment(p, q, th, y0, y1);
  };
  // a wall a → b with doorways of width w centred at the given distances from a
  const run = (a, b, th, doors, w) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), u = [(b[0] - a[0]) / L, (b[1] - a[1]) / L], P = (d) => [a[0] + u[0] * d, a[1] + u[1] * d];
    let s0 = 0;
    for (const d of doors) { wall(P(s0), P(d - w / 2), th); bag.add('brick', orientedBox(P(d - w / 2), P(d + w / 2), th, y + 2.3, y + H)); s0 = d + w / 2; }
    wall(P(s0), P(L), th);
  };
  const midz = (z0 + z1) / 2;
  // the outer walls; the entrance in the middle of the west side
  run([x0, z0], [x1, z0], 0.6, [], 0); run([x1, z0], [x1, z1], 0.6, [], 0); run([x1, z1], [x0, z1], 0.6, [], 0);
  run([x0, z1], [x0, z0], 0.6, [(z1 - z0) / 2], 2.2);
  // the cells' inner wall, a doorway into each cell, the passage on the west
  const ix0 = x0 + D, iz0 = z0 + D, ix1 = x1 - D, iz1 = z1 - D;
  const cells = (a, b, skip = null) => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / 3.4)), doors = [];
    for (let k = 0; k < n; k++) { const d = (k + 0.5) * L / n; if (skip === null || Math.abs(d - skip) > 1.8) doors.push(d); }
    if (skip !== null) doors.push(skip);
    doors.sort((p, q) => p - q);
    run(a, b, 0.4, doors, skip !== null ? 1.0 : 1.0);
  };
  cells([ix0, iz0], [ix1, iz0]); cells([ix1, iz0], [ix1, iz1]); cells([ix1, iz1], [ix0, iz1]);
  cells([ix0, iz1], [ix0, iz0], iz1 - midz);
  // partitions between the cells, and the passage from the entrance
  for (const [a, b, n] of [[[ix0, iz0], [ix1, iz0], 'n'], [[ix0, iz1], [ix1, iz1], 's']]) {
    const L = ix1 - ix0, k = Math.max(1, Math.round(L / 3.4));
    for (let i = 1; i < k; i++) { const x = ix0 + i * L / k; wall([x, n === 'n' ? z0 + 0.3 : iz1 + 0.2], [x, n === 'n' ? iz0 - 0.2 : z1 - 0.3], 0.3); }
    void a; void b;
  }
  for (const zz of [midz - 1.1, midz + 1.1]) wall([x0 + 0.3, zz], [ix0 - 0.2, zz], 0.3);
  // the roof over the cells, the verandah's posts and its roof round the court
  const v = 2.0;
  for (const r of [[x0, z0, x1, iz0], [x0, iz1, x1, z1], [x0, iz0, ix0, iz1], [ix1, iz0, x1, iz1]]) bag.add('brick', box(r[0], y + H, r[1], r[2], y + H + 0.35, r[3]));
  const ring = [[ix0 + v, iz0 + v], [ix1 - v, iz0 + v], [ix1 - v, iz1 - v], [ix0 + v, iz1 - v]];
  for (let i = 0; i < 4; i++) {
    const a = ring[i], b = ring[(i + 1) % 4], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / 3.2));
    for (let k = 0; k < n; k++) {
      const px = a[0] + (b[0] - a[0]) * k / n, pz = a[1] + (b[1] - a[1]) * k / n;
      if (i === 3 && Math.abs(pz - midz) < 1.6) continue;
      bag.add(STONE, box(px - 0.15, y, pz - 0.15, px + 0.15, y + 2.7, pz + 0.15)); col.circle(px, pz, 0.18, y, y + 2.7);
    }
  }
  for (const r of [[ix0, iz0, ix1, iz0 + v + 0.2], [ix0, iz1 - v - 0.2, ix1, iz1], [ix0, iz0, ix0 + v + 0.2, iz1], [ix1 - v - 0.2, iz0, ix1, iz1]]) bag.add('timber', box(r[0], y + 2.7, r[1], r[2], y + 2.85, r[3]));
  bag.add('sandstone_floor', box(x0, y - 0.3, z0, x1, y + 0.02, z1));
  col.floor(el.rect, y + 0.02);
}

registerStyle('indian', {
  column: () => {},
  trim: () => {},
  opening: () => {},
  elements: { stupa },
  objects: { ashoka_pillar: ashokaPillar, vihara },
});
