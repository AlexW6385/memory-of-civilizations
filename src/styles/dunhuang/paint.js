// Wall painting of the Mogao caves (docs/settlements/dunhuang.md §3), built as thin coloured pieces laid on a
// plaster surface (a Panel: origin, two axes, the room-side normal). The palette is the nearest existing
// materials: malachite green, azurite blue, vermilion, ochre, lead white, soot black, gold.
import { fromTriangles } from '../../core/geom.js';

export function rngOf(seed) { let s = (seed >>> 0) || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export const PAL = { green: 'clay_green', green2: 'fresco_green', blue: 'paint_blue', blue2: 'egyptian_blue', red: 'lacquer_red', red2: 'clay_robe', ochre: 'paint_ochre', white: 'paint_white', black: 'lacquer_black', gold: 'clay_gilt', skin: 'skin_light', turq: 'tile_turquoise' };

/** A painted surface: P(u, v, off) = o + U·u + V·v + N·off (N out of the wall into the room). */
export class Panel {
  constructor(bag, o, U, V, N) { this.bag = bag; this.o = o; this.U = U; this.V = V; this.N = N; this.layer = 0; this.buf = new Map(); }
  P(u, v, off = 0.012) {
    const { o, U, V, N } = this;
    return [o[0] + U[0] * u + V[0] * v + N[0] * off, o[1] + U[1] * u + V[1] * v + N[1] * off, o[2] + U[2] * u + V[2] * v + N[2] * off];
  }
  /** A convex polygon [[u, v]…] in a material, a little off the surface (off grows with the layer so that overlaps do not fight). */
  poly(mat, pts, layer = 0) {
    const off = 0.006 + layer * 0.016, t = this.buf.get(mat) ?? [];
    const P = pts.map(([u, v]) => this.P(u, v, off));
    const { N } = this;
    for (let k = 1; k < P.length - 1; k++) {
      const a = P[0], b = P[k], c = P[k + 1];
      const nx = (b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]), ny = (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]), nz = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
      if (nx * N[0] + ny * N[1] + nz * N[2] >= 0) t.push(...a, ...b, ...c); else t.push(...a, ...c, ...b);
    }
    this.buf.set(mat, t);
  }
  rect(mat, u0, v0, u1, v1, layer = 0) { this.poly(mat, [[u0, v0], [u1, v0], [u1, v1], [u0, v1]], layer); }
  disc(mat, u, v, r, layer = 0, n = 10) { this.ell(mat, u, v, r, r, layer, n); }
  ell(mat, u, v, ru, rv, layer = 0, n = 10, rot = 0) {
    const c = Math.cos(rot), s = Math.sin(rot);
    this.poly(mat, Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2, x = Math.cos(a) * ru, y = Math.sin(a) * rv; return [u + x * c - y * s, v + x * s + y * c]; }), layer);
  }
  line(mat, u0, v0, u1, v1, w, layer = 0) {
    const dx = u1 - u0, dy = v1 - v0, L = Math.hypot(dx, dy) || 1, nx = -dy / L * w / 2, ny = dx / L * w / 2;
    this.poly(mat, [[u0 + nx, v0 + ny], [u1 + nx, v1 + ny], [u1 - nx, v1 - ny], [u0 - nx, v0 - ny]], layer);
  }
  /** A band that follows a path [[u, v]…] with width w. */
  ribbon(mat, path, w, layer = 0) { for (let i = 0; i < path.length - 1; i++) this.line(mat, path[i][0], path[i][1], path[i + 1][0], path[i + 1][1], w, layer); }
  flush() { for (const [m, t] of this.buf) if (t.length) this.bag.add(m, fromTriangles(t)); this.buf.clear(); }
}

/** A wall's panel from the room: base point a [x, z] and b [x, z] (u runs from a to b as one faces the wall), floor y. */
export function wallPanel(bag, a, b, y, n, inset = 0.04) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  return Object.assign(new Panel(bag, [a[0] + n[0] * inset, y, a[1] + n[1] * inset], [(b[0] - a[0]) / L, 0, (b[1] - a[1]) / L], [0, 1, 0], [n[0], 0, n[1]]), { len: L });
}

// ── motifs ────────────────────────────────────────────────────────────────────────────────────────────
/** A seated Buddha of the paintings, s the scale (1 ≈ 0.9 m): lotus, robe, head, halo and mandorla. */
export function buddhaM(P, u, v, s, pal = {}, L = 1) {
  const r = pal.robe ?? PAL.red2, h = pal.halo ?? PAL.gold;
  P.ell(pal.mand ?? PAL.green2, u, v + 0.52 * s, 0.34 * s, 0.5 * s, L, 12);
  P.disc(h, u, v + 0.66 * s, 0.17 * s, L + 1, 10);
  P.poly(r, [[u - 0.11 * s, v + 0.2 * s], [u + 0.11 * s, v + 0.2 * s], [u + 0.15 * s, v + 0.5 * s], [u + 0.05 * s, v + 0.58 * s], [u - 0.05 * s, v + 0.58 * s], [u - 0.15 * s, v + 0.5 * s]], L + 2);
  P.poly(r, [[u - 0.27 * s, v + 0.07 * s], [u + 0.27 * s, v + 0.07 * s], [u + 0.2 * s, v + 0.24 * s], [u - 0.2 * s, v + 0.24 * s]], L + 2);
  P.disc(PAL.skin, u, v + 0.66 * s, 0.062 * s, L + 3, 8);
  P.ell(PAL.black, u, v + 0.715 * s, 0.05 * s, 0.025 * s, L + 4, 6);
  P.ell(pal.lotus ?? PAL.green, u, v + 0.035 * s, 0.3 * s, 0.045 * s, L + 1, 8);
}
/** A standing bodhisattva: halo, head, jewelled chest, a long skirt, a scarf. */
export function bodhiM(P, u, v, s, pal = {}, L = 1) {
  P.disc(pal.halo ?? PAL.green, u, v + 0.97 * s, 0.14 * s, L, 9);
  P.poly(pal.skirt ?? PAL.red, [[u - 0.09 * s, v], [u + 0.09 * s, v], [u + 0.08 * s, v + 0.55 * s], [u - 0.08 * s, v + 0.55 * s]], L + 1);
  P.poly(PAL.skin, [[u - 0.065 * s, v + 0.55 * s], [u + 0.065 * s, v + 0.55 * s], [u + 0.05 * s, v + 0.85 * s], [u - 0.05 * s, v + 0.85 * s]], L + 1);
  P.disc(PAL.skin, u, v + 0.95 * s, 0.045 * s, L + 2, 7);
  P.rect(PAL.gold, u - 0.05 * s, v + 0.6 * s, u + 0.05 * s, v + 0.68 * s, L + 2);
  P.ribbon(pal.scarf ?? PAL.blue, [[u + 0.06 * s, v + 0.8 * s], [u + 0.16 * s, v + 0.55 * s], [u + 0.08 * s, v + 0.3 * s]], 0.025 * s, L + 2);
}
/** A flying apsara: a slender body in a swoop, long scarves streaming behind, a halo. */
export function apsaraM(P, u, v, s, dir = 1, pal = {}, L = 1) {
  const c = pal.scarf ?? PAL.blue;
  P.disc(PAL.gold, u, v + 0.12 * s, 0.075 * s, L, 7);
  P.disc(PAL.skin, u, v + 0.12 * s, 0.04 * s, L + 1, 6);
  P.line(pal.dress ?? PAL.red, u, v + 0.07 * s, u - dir * 0.25 * s, v - 0.1 * s, 0.07 * s, L + 1);
  P.line(PAL.skin, u, v + 0.05 * s, u + dir * 0.12 * s, v + 0.0, 0.025 * s, L + 1);
  P.ribbon(c, [[u - dir * 0.2 * s, v - 0.08 * s], [u - dir * 0.5 * s, v + 0.02 * s], [u - dir * 0.8 * s, v - 0.1 * s], [u - dir * 1.1 * s, v + 0.0 * s]], 0.03 * s, L);
  P.ribbon(PAL.green2, [[u + dir * 0.02 * s, v + 0.2 * s], [u - dir * 0.3 * s, v + 0.3 * s], [u - dir * 0.7 * s, v + 0.2 * s], [u - dir * 1.0 * s, v + 0.3 * s]], 0.025 * s, L);
}
/** A lotus seen from the front: rings of petals on a disc. */
export function lotusM(P, u, v, r, L = 1, pal = {}) {
  P.disc(pal.back ?? PAL.green, u, v, r, L, 12);
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; P.ell(pal.petal ?? PAL.red, u + Math.cos(a) * r * 0.62, v + Math.sin(a) * r * 0.62, r * 0.3, r * 0.13, L + 1, 6, a); }
  P.disc(PAL.white, u, v, r * 0.4, L + 2, 10);
  for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; P.ell(pal.petal2 ?? PAL.blue, u + Math.cos(a) * r * 0.22, v + Math.sin(a) * r * 0.22, r * 0.11, r * 0.05, L + 3, 5, a); }
  P.disc(PAL.gold, u, v, r * 0.1, L + 4, 6);
}
/** A band of repeated lozenges and half-palmettes (u0…u1, v0…v1). */
export function friezeM(P, u0, u1, v0, v1, L = 1, k = 0) {
  const h = v1 - v0, cols = [PAL.red, PAL.blue, PAL.green, PAL.ochre];
  P.rect(PAL.black, u0, v0, u1, v1, L);
  P.rect(PAL.white, u0, v0 + h * 0.08, u1, v1 - h * 0.08, L + 1);
  const step = h * 1.1, n = Math.floor((u1 - u0) / step);
  for (let i = 0; i < n; i++) {
    const u = u0 + (i + 0.5) * step, m = v0 + h / 2, c = cols[(i + k) % 4];
    P.poly(c, [[u - step * 0.45, m], [u, m + h * 0.38], [u + step * 0.45, m], [u, m - h * 0.38]], L + 2);
    P.disc(PAL.gold, u, m, h * 0.1, L + 3, 5);
  }
}
/** Rows of small seated Buddhas (the "thousand Buddhas"): a grid with alternating robe colours. */
export function thousandM(P, u0, v0, u1, v1, L = 1, seed = 1, step = 0.3) {
  const rand = rngOf(seed), robes = [PAL.red2, PAL.blue, PAL.ochre, PAL.green];
  P.rect(PAL.white, u0, v0, u1, v1, L - 1 < 0 ? 0 : L);
  const nu = Math.floor((u1 - u0) / step), nv = Math.floor((v1 - v0) / (step * 1.15));
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    const u = u0 + (i + 0.5 + (j % 2) * 0.0) * (u1 - u0) / nu, v = v0 + j * (v1 - v0) / nv + 0.03;
    buddhaM(P, u, v, step * 1.0, { robe: robes[(i + j * 2 + (rand() < 0.15 ? 1 : 0)) % 4], mand: (i + j) % 2 ? PAL.green2 : PAL.blue2, halo: PAL.gold }, L + 1);
  }
}
/** A line of donors (standing figures in long robes, hats, holding offerings) along the foot of a wall. */
export function donorsM(P, u0, u1, v, s = 1, L = 1, seed = 1) {
  const rand = rngOf(seed), n = Math.max(2, Math.floor((u1 - u0) / (0.42 * s))), robes = [PAL.red2, PAL.blue, PAL.green, PAL.ochre, PAL.white];
  for (let i = 0; i < n; i++) {
    const u = u0 + (i + 0.5) * (u1 - u0) / n, c = robes[Math.floor(rand() * robes.length)];
    P.poly(c, [[u - 0.1 * s, v], [u + 0.1 * s, v], [u + 0.07 * s, v + 0.62 * s], [u - 0.07 * s, v + 0.62 * s]], L);
    P.disc(PAL.skin, u, v + 0.69 * s, 0.05 * s, L + 1, 7);
    P.rect(PAL.black, u - 0.055 * s, v + 0.71 * s, u + 0.055 * s, v + 0.78 * s, L + 1);
    P.rect(PAL.gold, u + 0.05 * s, v + 0.3 * s, u + 0.11 * s, v + 0.36 * s, L + 1);
  }
}
/** The Pure Land tableau in a frame: a central Buddha in his pavilion with attendants, a lotus pond with birds and musicians, apsaras above. */
export function tableauM(P, u0, v0, u1, v1, seed = 1, L = 1) {
  const W = u1 - u0, H = v1 - v0, cu = (u0 + u1) / 2, rand = rngOf(seed);
  P.rect(PAL.red, u0, v0, u1, v1, L);
  P.rect(PAL.green2, u0 + 0.06, v0 + 0.06, u1 - 0.06, v1 - 0.06, L + 1);
  P.rect(PAL.blue2, u0 + 0.06, v0 + H * 0.72, u1 - 0.06, v1 - 0.06, L + 2);                  // the sky
  P.rect(PAL.blue, u0 + 0.06, v0 + 0.06, u1 - 0.06, v0 + H * 0.2, L + 2);                      // the pond
  for (let k = 0; k < 7; k++) P.line(PAL.white, u0 + 0.2 + rand() * (W - 0.4), v0 + 0.1 + rand() * H * 0.08, u0 + 0.5 + rand() * (W - 0.4), v0 + 0.1 + rand() * H * 0.08, 0.012, L + 3);
  // the terrace and pavilion
  P.rect(PAL.ochre, u0 + W * 0.1, v0 + H * 0.2, u1 - W * 0.1, v0 + H * 0.27, L + 3);
  P.rect(PAL.red2, u0 + W * 0.12, v0 + H * 0.27, u1 - W * 0.12, v0 + H * 0.31, L + 3);
  P.poly(PAL.black, [[cu - W * 0.28, v0 + H * 0.64], [cu + W * 0.28, v0 + H * 0.64], [cu + W * 0.2, v0 + H * 0.7], [cu - W * 0.2, v0 + H * 0.7]], L + 3);
  P.rect(PAL.red, cu - W * 0.25, v0 + H * 0.58, cu + W * 0.25, v0 + H * 0.64, L + 3);
  for (const s of [-1, 1]) P.rect(PAL.red, cu + s * W * 0.25 - 0.03, v0 + H * 0.31, cu + s * W * 0.25 + 0.03, v0 + H * 0.58, L + 3);
  buddhaM(P, cu, v0 + H * 0.28, H * 0.72, { robe: PAL.red2, mand: PAL.blue2 }, L + 4);
  for (const s of [-1, 1]) {
    bodhiM(P, cu + s * W * 0.2, v0 + H * 0.28, H * 0.5, { skirt: s > 0 ? PAL.blue : PAL.red }, L + 4);
    bodhiM(P, cu + s * W * 0.32, v0 + H * 0.27, H * 0.38, { skirt: s > 0 ? PAL.ochre : PAL.green }, L + 4);
    P.poly(PAL.green, [[cu + s * W * 0.4, v0 + H * 0.3], [cu + s * W * 0.46, v0 + H * 0.3], [cu + s * W * 0.43, v0 + H * 0.56]], L + 3);
  }
  // musicians and dancer on the terrace, lotus in the pond
  for (let k = 0; k < 5; k++) { const u = cu - W * 0.3 + k * W * 0.15; P.rect(k % 2 ? PAL.blue : PAL.red2, u - 0.05, v0 + H * 0.12, u + 0.05, v0 + H * 0.19, L + 4); P.disc(PAL.skin, u, v0 + H * 0.205, 0.035, L + 5, 6); }
  for (let k = 0; k < 6; k++) lotusM(P, u0 + W * (0.12 + rand() * 0.76), v0 + H * (0.07 + rand() * 0.08), 0.07 + rand() * 0.04, L + 3);
  for (let k = 0; k < 3; k++) apsaraM(P, u0 + W * (0.25 + k * 0.25), v0 + H * (0.8 + (k % 2) * 0.06), H * 0.22, k % 2 ? -1 : 1, { scarf: k % 2 ? PAL.red : PAL.white }, L + 3);
  P.rect(PAL.gold, u0 + 0.06, v0 + H * 0.715, u1 - 0.06, v0 + H * 0.725, L + 3);
}
