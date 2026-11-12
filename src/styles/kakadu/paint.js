// The rock paintings of Ubirr (docs/settlements/kakadu.md §0, §2): generic motifs in the X-ray manner, drawn by us — never a copy of a
// particular panel, never an ancestral figure. Thin coloured pieces laid on a surface (a Panel) that follows it; layers lie one over
// another, the oldest faded dull red, the newest white and yellow over red.
import { fromTriangles } from '../../core/geom.js';
import { rng } from '../../settlements/kakadu/layout.js';

export const PAL = { old: 'clay_robe', red: 'paint_minoan_red', yellow: 'paint_ochre', white: 'paint_white', black: 'paint_minoan_black' };

/** A painted surface: surf(u, v) → { p: [x, y, z], n: [nx, ny, nz] } (n out of the rock toward the viewer). */
export class Panel {
  constructor(bag, surf) { this.bag = bag; this.surf = surf; this.buf = new Map(); }
  at(u, v, off) { const { p, n } = this.surf(u, v); return [p[0] + n[0] * off, p[1] + n[1] * off, p[2] + n[2] * off]; }
  /** A polygon (star-shaped about its centre) filled, its edges cut into pieces of at most 0.22 m, each point set on the surface. */
  poly(mat, pts, layer = 0) {
    const off = 0.012 + layer * 0.006, t = this.buf.get(mat) ?? [];
    const ring = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length], k = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.22));
      for (let j = 0; j < k; j++) ring.push([a[0] + (b[0] - a[0]) * j / k, a[1] + (b[1] - a[1]) * j / k]);
    }
    const cu = ring.reduce((s, q) => s + q[0], 0) / ring.length, cv = ring.reduce((s, q) => s + q[1], 0) / ring.length;
    const c = this.at(cu, cv, off), n = this.surf(cu, cv).n, P = ring.map(([u, v]) => this.at(u, v, off));
    for (let i = 0; i < P.length; i++) {
      const a = P[i], b = P[(i + 1) % P.length];
      const nx = (b[1] - c[1]) * (a[2] - c[2]) - (b[2] - c[2]) * (a[1] - c[1]), ny = (b[2] - c[2]) * (a[0] - c[0]) - (b[0] - c[0]) * (a[2] - c[2]), nz = (b[0] - c[0]) * (a[1] - c[1]) - (b[1] - c[1]) * (a[0] - c[0]);
      if (nx * n[0] + ny * n[1] + nz * n[2] >= 0) t.push(...c, ...a, ...b); else t.push(...c, ...b, ...a);
    }
    this.buf.set(mat, t);
  }
  ell(mat, u, v, ru, rv, layer = 0, n = 12, rot = 0) {
    const c = Math.cos(rot), s = Math.sin(rot);
    this.poly(mat, Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2, x = Math.cos(a) * ru, y = Math.sin(a) * rv; return [u + x * c - y * s, v + x * s + y * c]; }), layer);
  }
  disc(mat, u, v, r, layer = 0, n = 8) { this.ell(mat, u, v, r, r, layer, n); }
  line(mat, u0, v0, u1, v1, w, layer = 0) {
    const dx = u1 - u0, dy = v1 - v0, L = Math.hypot(dx, dy) || 1, nx = -dy / L * w / 2, ny = dx / L * w / 2;
    this.poly(mat, [[u0 + nx, v0 + ny], [u1 + nx, v1 + ny], [u1 - nx, v1 - ny], [u0 - nx, v0 - ny]], layer);
  }
  ribbon(mat, path, w, layer = 0, closed = false) { for (let i = 0; i < path.length - (closed ? 0 : 1); i++) { const a = path[i], b = path[(i + 1) % path.length]; this.line(mat, a[0], a[1], b[0], b[1], w, layer); } }
  flush() { for (const [m, t] of this.buf) if (t.length) this.bag.add(m, fromTriangles(t)); this.buf.clear(); }
}

const rot2 = (pts, a) => { const c = Math.cos(a), s = Math.sin(a); return pts.map(([x, y]) => [x * c - y * s, x * s + y * c]); };

/**
 * An X-ray fish (barramundi or catfish) of length L at (u, v), facing dir (±1): the body filled, outlined, with the backbone, swim
 * bladder, gut, ribs and bands of infill; fresh paint adds white and yellow under the red line. pal: { fill, line, fresh }.
 */
export function fish(P, u, v, L, dir = 1, pal = {}, layer = 1, rand = Math.random) {
  const line = pal.line ?? PAL.red, fill = pal.fill ?? PAL.white, N = 14, w = Math.max(0.012, L * 0.011);
  const half = (t) => L * 0.17 * Math.sin(Math.PI * Math.min(1, t * 1.0) ** 0.75) * (1 - 0.3 * t);
  const X = (t) => u + dir * L * (t - 0.5), up = [], dn = [];
  for (let i = 0; i <= N; i++) { const t = i / N * 0.82; up.push([X(t), v + half(t) * 1.05]); dn.push([X(t), v - half(t) * 0.9]); }
  const tail = [[X(0.82), v + half(0.82)], [X(1.0), v + L * 0.17], [X(0.95), v], [X(1.0), v - L * 0.15], [X(0.82), v - half(0.82) * 0.9]];
  const outline = [...up, ...tail.slice(1, 4), ...tail.slice(3), ...dn.slice().reverse()];
  const body = [...up, [X(1.0), v + L * 0.17], [X(0.95), v], [X(1.0), v - L * 0.15], ...dn.slice().reverse()];
  if (pal.fresh) P.poly(fill, body, layer);
  if (pal.fresh && pal.band) for (let k = 0; k < 6; k++) { const t = 0.2 + k * 0.095; P.line(pal.band, X(t), v - half(t) * 0.8, X(t + 0.03), v + half(t) * 0.9, L * 0.022, layer + 1); }
  P.ribbon(line, [...body, body[0]], w, layer + 1);
  P.line(line, X(0.06), v + 0.01 * L, X(0.84), v + 0.005 * L, w * 0.9, layer + 1);                  // the backbone
  for (let k = 0; k < 7; k++) { const t = 0.28 + k * 0.08; P.line(line, X(t), v + 0.004 * L, X(t + 0.01), v - half(t) * (0.42 + 0.1 * Math.sin(k)), w * 0.7, layer + 1); }   // ribs
  P.ell(line, X(0.4), v + half(0.4) * 0.45, L * 0.1, L * 0.032, layer + 1, 10);                    // the swim bladder
  P.ell(pal.fresh ? PAL.yellow : line, X(0.46), v + half(0.4) * 0.45, L * 0.07, L * 0.02, layer + 2, 8);
  P.ribbon(line, [[X(0.3), v - half(0.3) * 0.5], [X(0.38), v - half(0.38) * 0.2], [X(0.46), v - half(0.46) * 0.55], [X(0.55), v - half(0.55) * 0.25]], w, layer + 1);   // the gut
  P.poly(line, [[X(0.3), v + half(0.3) * 1.05], [X(0.4), v + L * 0.2], [X(0.55), v + half(0.55) * 1.0]], layer + 1);                     // the dorsal fin
  P.disc(PAL.white, X(0.05), v + half(0.05) * 0.2, L * 0.022, layer + 2, 8);
  P.disc(PAL.black, X(0.05), v + half(0.05) * 0.2, L * 0.011, layer + 3, 6);
}
/** A long-necked turtle seen from above (X-ray): shell with its plates and the inner organs, four flippers, a long neck and head. */
export function turtle(P, u, v, s, dir = 1, pal = {}, layer = 1) {
  const line = pal.line ?? PAL.red, w = Math.max(0.012, s * 0.02);
  if (pal.fresh) { P.ell(pal.fill ?? PAL.white, u, v, 0.34 * s, 0.26 * s, layer, 14); }
  for (const [a, b, ang] of [[0.28, 0.27, 0.7], [0.28, -0.27, -0.7], [-0.27, 0.25, -0.5], [-0.27, -0.25, 0.5]]) P.ell(line, u + dir * a * s, v + b * s, 0.13 * s, 0.045 * s, layer, 8, dir * ang);
  P.ribbon(line, Array.from({ length: 16 }, (_, k) => { const a = k / 16 * Math.PI * 2; return [u + Math.cos(a) * 0.34 * s, v + Math.sin(a) * 0.26 * s]; }), w, layer + 1, true);
  P.ribbon(line, [[u + dir * 0.34 * s, v], [u + dir * 0.55 * s, v + 0.06 * s], [u + dir * 0.74 * s, v + 0.03 * s], [u + dir * 0.85 * s, v - 0.03 * s]], w * 1.5, layer + 1);   // the neck
  P.disc(line, u + dir * 0.9 * s, v - 0.04 * s, 0.045 * s, layer + 1, 8);
  P.line(line, u - dir * 0.3 * s, v, u + dir * 0.3 * s, v, w, layer + 1);                       // the backbone
  for (let k = -2; k <= 2; k++) P.line(line, u + k * 0.1 * s, v - 0.23 * s, u + k * 0.1 * s, v + 0.23 * s, w * 0.7, layer + 1);       // the plates
  P.ell(pal.fresh ? PAL.yellow : line, u + dir * 0.08 * s, v + 0.05 * s, 0.09 * s, 0.06 * s, layer + 2, 8);    // heart and gut
}
/** A wallaby bounding (side view, X-ray: heart, gut, backbone). */
export function wallaby(P, u, v, s, dir = 1, pal = {}, layer = 1) {
  const line = pal.line ?? PAL.red, w = Math.max(0.012, s * 0.02), X = (x, y) => [u + dir * x * s, v + y * s];
  const body = [X(-0.25, 0.1), X(-0.05, 0.28), X(0.22, 0.34), X(0.34, 0.2), X(0.2, 0.0), X(-0.12, -0.02)];
  if (pal.fresh) P.poly(pal.fill ?? PAL.white, body, layer);
  P.ribbon(line, [...body, body[0]], w, layer + 1);
  P.ell(line, ...X(0.38, 0.42), 0.075 * s, 0.05 * s, layer + 1, 8, dir * 0.5);                  // the head
  P.poly(line, [X(0.42, 0.45), X(0.47, 0.6), X(0.4, 0.5)], layer + 1);                             // an ear
  P.ribbon(line, [X(-0.25, 0.1), X(-0.55, 0.0), X(-0.85, -0.12)], w * 2.2, layer + 1);            // the tail
  P.poly(line, [X(-0.22, 0.12), X(-0.06, -0.3), X(-0.04, -0.46), X(0.1, -0.46), X(0.06, -0.3), X(0.04, 0.0)], layer + 1);  // the hind leg
  P.line(line, ...X(0.26, 0.12), ...X(0.36, -0.02), w, layer + 1);                                  // the forearm
  P.line(line, ...X(-0.2, 0.14), ...X(0.3, 0.3), w * 0.9, layer + 1);                               // the backbone
  P.disc(pal.fresh ? PAL.yellow : line, ...X(0.14, 0.18), 0.045 * s, layer + 2, 7);               // the heart
  P.ell(line, ...X(-0.02, 0.15), 0.1 * s, 0.05 * s, layer + 1, 8);                                  // the gut
}
/** A goanna: a long body in a curve, four bent legs, a long tail. */
export function goanna(P, u, v, s, dir = 1, pal = {}, layer = 1) {
  const line = pal.line ?? PAL.red, w = Math.max(0.014, s * 0.03), X = (x, y) => [u + dir * x * s, v + y * s];
  P.ribbon(line, [X(-0.5, -0.02), X(-0.3, 0.04), X(-0.1, 0.0), X(0.1, 0.03), X(0.28, 0.0), X(0.38, 0.03)], w * 2.6, layer);
  P.ribbon(line, [X(0.28, 0.0), X(0.46, 0.02), X(0.52, 0.06)], w * 1.4, layer);
  for (const [x, sg] of [[0.22, 1], [0.22, -1], [-0.1, 1], [-0.1, -1]]) P.ribbon(line, [X(x, 0.0), X(x + 0.06, sg * 0.1), X(x - 0.02, sg * 0.16)], w, layer);
  P.line(pal.fresh ? PAL.white : line, ...X(-0.35, 0.0), ...X(0.35, 0.02), w * 0.5, layer + 1);
}
/** A person (hunter or woman) in the thin long manner, with a goose spear or a bag; X-ray: the backbone and heart. */
export function person(P, u, v, s, dir = 1, pal = {}, layer = 1, o = {}) {
  const line = pal.line ?? PAL.red, w = Math.max(0.012, s * 0.03), X = (x, y) => [u + dir * x * s, v + y * s];
  P.disc(line, ...X(0, 0.92), 0.05 * s, layer, 8);
  P.poly(line, [X(-0.07, 0.86), X(0.07, 0.86), X(0.045, 0.45), X(-0.045, 0.45)], layer);
  P.poly(line, [X(-0.045, 0.46), X(0.045, 0.46), X(0.1, 0.0), X(0.04, 0.0)], layer);
  P.poly(line, [X(-0.045, 0.46), X(0.045, 0.46), X(-0.02, 0.0), X(-0.09, 0.0)], layer);
  if (o.spear) { P.line(line, ...X(0.08, 0.76), ...X(0.4, 0.8), w, layer); P.line(line, ...X(0.3, 1.6), ...X(0.3, 0.1), w * 0.8, layer); }
  else { P.line(line, ...X(0.07, 0.78), ...X(0.16, 0.55), w, layer); P.line(line, ...X(-0.07, 0.78), ...X(-0.16, 0.55), w, layer); }
  if (o.bag) P.ell(pal.fresh ? PAL.yellow : line, ...X(0.2, 0.5), 0.07 * s, 0.09 * s, layer + 1, 8);
  if (o.fan) P.ell(PAL.white, ...X(0.22, 0.72), 0.06 * s, 0.1 * s, layer + 1, 8, 0.3);
  if (pal.fresh) { P.line(PAL.white, ...X(-0.05, 0.78), ...X(0.05, 0.78), w * 1.3, layer + 1); P.line(PAL.white, ...X(-0.045, 0.64), ...X(0.045, 0.64), w * 1.3, layer + 1); }
  P.line(PAL.white, ...X(0, 0.84), ...X(0, 0.5), w * 0.5, layer + 2);                              // the backbone
}
/** A magpie goose: long neck, plump body, short legs (as painted for the goose time). */
export function goose(P, u, v, s, dir = 1, pal = {}, layer = 1) {
  const line = pal.line ?? PAL.red, w = Math.max(0.012, s * 0.03), X = (x, y) => [u + dir * x * s, v + y * s];
  if (pal.fresh) P.ell(pal.fill ?? PAL.white, ...X(0, 0.2), 0.3 * s, 0.17 * s, layer, 12, dir * 0.15);
  P.ribbon(line, Array.from({ length: 14 }, (_, k) => { const a = k / 14 * Math.PI * 2; return [...X(Math.cos(a) * 0.3, 0.2 + Math.sin(a) * 0.17)]; }), w, layer + 1, true);
  P.ribbon(line, [X(0.25, 0.28), X(0.38, 0.5), X(0.36, 0.7), X(0.44, 0.84)], w * 2, layer + 1);
  P.disc(line, ...X(0.47, 0.86), 0.04 * s, layer + 1, 7);
  P.line(line, ...X(0.5, 0.86), ...X(0.62, 0.82), w * 1.2, layer + 1);
  P.line(line, ...X(0.0, 0.03), ...X(-0.02, -0.2), w, layer + 1); P.line(line, ...X(0.1, 0.03), ...X(0.12, -0.2), w, layer + 1);
  P.poly(line, [X(-0.28, 0.25), X(-0.5, 0.22), X(-0.3, 0.12)], layer + 1);
}
/** A hand stencil: pigment blown round a hand, so the hand stands out bare in a cloud of speckle. */
export function stencil(P, u, v, s, rot, mat, layer = 0, rand = Math.random) {
  const fingers = [[-0.045, 0.1, 0.075, 0.1], [-0.015, 0.125, 0.082, 0.1], [0.015, 0.125, 0.082, 0.1], [0.045, 0.1, 0.07, 0.1], [0.085, 0.04, 0.06, -0.8]];   // [x, y, length, tilt]
  const inHand = (x, y) => {
    if ((x / 0.058) ** 2 + ((y - 0.03) / 0.065) ** 2 < 1) return true;
    for (const [fx, fy, fl, tilt] of fingers) { const c = Math.cos(tilt), sn = Math.sin(tilt), dx = x - fx, dy = y - fy, a = dx * c + dy * sn, b = -dx * sn + dy * c; if (Math.abs(b) < 0.0115 && a > -0.02 && a < fl) return true; }
    return false;
  };
  const c = Math.cos(rot), sn = Math.sin(rot);
  let k = 0;
  for (let i = 0; i < 400 && k < 130; i++) {
    const a = rand() * Math.PI * 2, d = Math.sqrt(rand()) * 0.2, x = Math.cos(a) * d, y = 0.06 + Math.sin(a) * d * 1.1;
    if (inHand(x, y) || inHand(x * 0.93, (y - 0.02) * 0.93 + 0.02) ) continue;
    k++;
    P.disc(mat, u + (x * c - y * sn) * s, v + (x * sn + y * c) * s, (0.005 + rand() * 0.006) * s, layer, 5);
  }
}

/** An old slender figure of the faded first layer (dynamic stick figures, generic): long thin limbs, a head-dress, one arm out. Always old red. */
export function slender(P, u, v, s, dir = 1, pal = {}, layer = 1) {
  const line = pal.line ?? PAL.old, w = Math.max(0.01, s * 0.018), X = (x, y) => [u + dir * x * s, v + y * s];
  P.ribbon(line, [X(0, 0.55), X(0.02, 0.8), X(0, 0.95)], w * 1.8, layer);                      // the body
  P.disc(line, ...X(0.0, 1.0), 0.035 * s, layer, 7);
  P.ribbon(line, [X(0, 1.04), X(-0.03, 1.14), X(0.0, 1.2), X(0.04, 1.13)], w, layer);            // the head-dress
  P.ribbon(line, [X(0, 0.55), X(0.12, 0.28), X(0.08, 0.0)], w * 1.3, layer);                     // the legs, mid-stride
  P.ribbon(line, [X(0, 0.55), X(-0.16, 0.38), X(-0.3, 0.2)], w * 1.3, layer);
  P.ribbon(line, [X(0.01, 0.88), X(0.2, 0.92), X(0.34, 0.84)], w, layer);                         // the arms
  P.ribbon(line, [X(0.01, 0.88), X(-0.14, 0.78), X(-0.2, 0.66)], w, layer);
}
/** A long yam (the food plant): a tapering tuber with its vine, and a smaller one beside. */
export function yam(P, u, v, s, dir = 1, pal = {}, layer = 1) {
  const line = pal.line ?? PAL.red, w = Math.max(0.012, s * 0.025), X = (x, y) => [u + dir * x * s, v + y * s];
  const body = [X(-0.5, 0.02), X(-0.3, 0.07), X(0.0, 0.08), X(0.3, 0.05), X(0.52, 0.0), X(0.3, -0.04), X(0.0, -0.05), X(-0.3, -0.03)];
  if (pal.fresh) P.poly(pal.fill ?? PAL.white, body, layer);
  P.ribbon(line, [...body, body[0]], w, layer + 1);
  P.ribbon(line, [X(-0.5, 0.02), X(-0.62, 0.14), X(-0.55, 0.3), X(-0.66, 0.42)], w, layer + 1);
  for (let k = 0; k < 4; k++) P.line(line, X(-0.3 + k * 0.2, 0.0)[0], X(-0.3 + k * 0.2, 0.0)[1], X(-0.27 + k * 0.2, 0.06)[0], X(-0.27 + k * 0.2, 0.06)[1], w * 0.6, layer + 1);
}
/** An echidna seen from the side: a domed body of spines, a long snout. */
export function echidna(P, u, v, s, dir = 1, pal = {}, layer = 1) {
  const line = pal.line ?? PAL.red, w = Math.max(0.012, s * 0.025), X = (x, y) => [u + dir * x * s, v + y * s];
  if (pal.fresh) P.ell(pal.fill ?? PAL.white, ...X(0, 0.12), 0.3 * s, 0.14 * s, layer, 12);
  P.ribbon(line, Array.from({ length: 14 }, (_, k) => { const a = k / 14 * Math.PI * 2; return X(Math.cos(a) * 0.3, 0.12 + Math.sin(a) * 0.14); }), w, layer + 1, true);
  for (let k = 0; k < 9; k++) { const x = -0.22 + k * 0.055; P.line(line, ...X(x, 0.2), ...X(x - 0.03, 0.34 + 0.02 * Math.sin(k * 2)), w * 0.7, layer + 1); }
  P.line(line, ...X(0.3, 0.14), ...X(0.52, 0.12), w * 1.3, layer + 1);
  P.line(line, ...X(0.1, -0.02), ...X(0.12, -0.14), w, layer + 1); P.line(line, ...X(-0.15, -0.02), ...X(-0.17, -0.14), w, layer + 1);
  P.ell(pal.fresh ? PAL.yellow : line, ...X(0.0, 0.1), 0.08 * s, 0.04 * s, layer + 2, 7);
}
/** Rows of tally dots and short strokes (counted, or only made). */
export function tally(P, u, v, s, dir = 1, pal = {}, layer = 1, rand = Math.random) {
  const m = pal.fresh ? PAL.white : pal.line ?? PAL.red;
  for (let row = 0; row < 3; row++) for (let k = 0; k < 6 + Math.floor(rand() * 4); k++) P.disc(m, u + dir * k * 0.09 * s, v - row * 0.1 * s + (rand() - 0.5) * 0.015, 0.018 * s, layer, 5);
}
/** Flaked rock: patches where the surface has scaled off and taken the paint with it (the wall's own colour, laid over). */
export function flake(P, u, v, s, mat, layer = 14, rand = Math.random) {
  const n = 7 + Math.floor(rand() * 3), pts = [];
  for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2, r = (0.5 + rand() * 0.6) * s; pts.push([u + Math.cos(a) * r * 1.3, v + Math.sin(a) * r * 0.7]); }
  P.poly(mat, pts, layer);
}
export { rng, rot2 };
