// Han style kit: small helpers shared by the elements (docs/settlements/han-changan.md §5).
import { box, lathe } from '../../core/geom.js';
import { fromTriangles } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';

export const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };
export const TAU = Math.PI * 2;
/** The Chinese roofs (read-only): hip_roof { c, A, B, y, rise, lift, pow, mat, soffit, rafters, noChiwei, alongZ }, gable_roof_c { c, A, B, y, rise, mat, alongZ }. */
export const roofs = () => STYLES.chinese.elements;

/** A frame on the ground: u runs along, v out from the origin o along V; all axis-aligned. b() builds boxes in it. */
export class Fr {
  constructor(ctx, o, U, V) { this.bag = ctx.bag; this.col = ctx.col; this.ctx = ctx; this.o = o; this.U = U; this.V = V; }
  pt(u, v) { return [this.o[0] + this.U[0] * u + this.V[0] * v, this.o[1] + this.U[1] * u + this.V[1] * v]; }
  R(u0, v0, u1, v1) { const a = this.pt(u0, v0), b = this.pt(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; }
  b(mat, u0, y0, v0, u1, y1, v1, solid = true) {
    const r = this.R(u0, v0, u1, v1);
    if (r[2] - r[0] < 1e-4 || r[3] - r[1] < 1e-4 || y1 - y0 < 1e-4) return;
    this.bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3]));
    if (solid) this.col.rect(r, y0, y1);
  }
  floor(u0, v0, u1, v1, y) { this.col.floor(this.R(u0, v0, u1, v1), y); }
  circle(u, v, r, y0, y1) { const p = this.pt(u, v); this.col.circle(p[0], p[1], r, y0, y1); }
  lathe(mat, prof, u, y, v, seg = 10) { const p = this.pt(u, v); this.bag.add(mat, lathe(prof, seg, null, p[0], y, p[1])); }
  alongU() { return this.U[0] !== 0; }
  /** A chinese roof centred at (u, v), half extents A along u and B along v. */
  roof(kind, u, v, A, B, y, rise, o = {}) {
    const c = this.pt(u, v), x = this.alongU(), Ex = x ? A : B, Ez = x ? B : A;
    const el = { c, y, rise, ...o };
    if (Ex >= Ez) { el.A = Ex; el.B = Ez; } else { el.A = Ez; el.B = Ex; el.alongZ = true; }
    (kind === 'hip_roof' ? hipLite : roofs()[kind])(el, this.ctx);
    return el;
  }
}
/** A house frame on a lot: u along the street from x0, v from the street (the front) into the lot. */
export function lotFrame(ctx, rect, front) {
  const [x0, z0, x1, z1] = rect, s = front === 's';
  const f = new Fr(ctx, [x0, s ? z1 : z0], [1, 0], [0, s ? -1 : 1]);
  f.W = x1 - x0; f.D = z1 - z0;
  return f;
}

/** A straight flight of steps over rect, rising from y0 to y1 toward dir ('n' = −z, 's', 'e', 'w'); solid down to `base`. */
export function steps(bag, col, rect, y0, y1, dir, mat = 'bluestone', riser = 0.18, base = null, mat2 = null) {
  const [x0, z0, x1, z1] = rect, rise = y1 - y0, n = Math.max(1, Math.round(Math.abs(rise) / riser)), b0 = (base ?? y0) - 0.02;
  for (let i = 0; i < n; i++) {
    const f1 = (i + 1) / n, f0 = i / n, yT = y0 + rise * f1;
    let r;
    if (dir === 'n') r = [x0, z1 - (z1 - z0) * f1, x1, z1];
    else if (dir === 's') r = [x0, z0, x1, z0 + (z1 - z0) * f1];
    else if (dir === 'e') r = [x0, z0, x0 + (x1 - x0) * f1, z1];
    else r = [x1 - (x1 - x0) * f1, z0, x1, z1];
    void f0;
    bag.add(mat2 && i % 2 ? mat2 : mat, box(r[0], b0, r[1], r[2], yT, r[3]));
  }
  col.ramp(rect, y0, y1, dir);
}

/** The round eave-tile ends (wadang) of a hipped roof's eave: the circles on the fascia all round the rectangle (cx, cz, A, B), eave height y with the corners' lift. */
export function eaveTiles(bag, cx, cz, A, B, y, lift = 0.5, step = 0.36, r = 0.12) {
  const out = [], up = [0, 1, 0];
  const yAt = (x, z) => { const ax = Math.abs(x - cx), az = Math.abs(z - cz), c = Math.max(0, 1 - (A - ax) / 5) * Math.max(0, 1 - (B - az) / 5); return y + lift * c * c - 0.15; };
  const disc = (x, z, nx, nz) => {
    const yy = yAt(x, z), px = x + nx * 0.04, pz = z + nz * 0.04, tx = -nz, tz = nx;
    const P = (k) => { const a = k / 6 * TAU; return [px + tx * Math.cos(a) * r, yy + Math.sin(a) * r, pz + tz * Math.cos(a) * r]; };
    for (let k = 0; k < 6; k++) { const a = P(k), b = P(k + 1); out.push(px, yy, pz, ...a, ...b, px, yy, pz, ...b, ...a); }
  };
  void up;
  for (let x = cx - A + step / 2; x < cx + A; x += step) { disc(x, cz - B, 0, -1); disc(x, cz + B, 0, 1); }
  for (let z = cz - B + step / 2; z < cz + B; z += step) { disc(cx - A, z, -1, 0); disc(cx + A, z, 1, 0); }
  bag.add('tile_dark', fromTriangles(out));
}
/** The eave-tile ends along the two long eaves of a gabled roof (ridge along x). */
export function eaveTilesGable(bag, cx, cz, A, B, y, step = 0.52, r = 0.14) {
  const out = [];
  for (const s of [-1, 1]) for (let x = cx - A + step / 2; x < cx + A; x += step) {
    const z = cz + s * (B + 0.04), yy = y - 0.1;
    for (let k = 0; k < 6; k++) { const a0 = k / 6 * TAU, a1 = (k + 1) / 6 * TAU, p = [x + Math.cos(a0) * r, yy + Math.sin(a0) * r, z], q = [x + Math.cos(a1) * r, yy + Math.sin(a1) * r, z]; out.push(x, yy, z, ...p, ...q, x, yy, z, ...q, ...p); }
  }
  bag.add('tile_dark', fromTriangles(out));
}

/**
 * A lighter hipped roof (the same profile as the Chinese hip_roof, a coarser grid): { c, A, B, y (eave edge), rise, lift, pow, mat, soffit, alongZ }.
 * The ridge runs along the longer side; with alongZ it runs along z.
 */
export function hipLite(el, ctx) {
  const { bag } = ctx, [cx, cz] = el.c, a = Math.max(el.A, el.B), b = Math.min(el.A, el.B), R = el.rise, U = el.lift ?? 0.5, PW = el.pow ?? 1.2, y0 = el.y;
  const alongZ = el.alongZ ?? (el.B > el.A);
  const h = (u, v) => { const au = Math.abs(u), av = Math.abs(v), t = Math.max(0, Math.min(1, Math.min((b - av) / b, (a - au) / b))), c = Math.max(0, 1 - (a - au) / 5) * Math.max(0, 1 - (b - av) / 5); return y0 + R * Math.pow(t, PW) + U * c * c; };
  const W = (u, v, yy) => (alongZ ? [cx + v, yy, cz + u] : [cx + u, yy, cz + v]);
  const N = Math.max(4, Math.min(30, Math.round(a * 2 / 2.2))), M = Math.max(4, Math.min(20, Math.round(b * 2 / 1.8)));
  const top = [], under = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
    const u0 = -a + 2 * a * i / N, u1 = -a + 2 * a * (i + 1) / N, v0 = -b + 2 * b * j / M, v1 = -b + 2 * b * (j + 1) / M;
    const P = (u, v, o) => W(u, v, h(u, v) + o);
    const p00 = P(u0, v0, 0), p10 = P(u1, v0, 0), p11 = P(u1, v1, 0), p01 = P(u0, v1, 0);
    top.push(...p00, ...p11, ...p10, ...p00, ...p01, ...p11);
    const q00 = P(u0, v0, -0.32), q10 = P(u1, v0, -0.32), q11 = P(u1, v1, -0.32), q01 = P(u0, v1, -0.32);
    under.push(...q00, ...q10, ...q11, ...q00, ...q11, ...q01);
  }
  bag.add(el.mat || 'tile_grey', fromTriangles(top));
  bag.add(el.soffit || 'timber_red', fromTriangles(under));
  // the fascia round the eave, the ridge, the hip ridges
  const fas = [], E = 24;
  const ring = (k) => { const per = 4 * (a + b), d = per * k / E; if (d < 2 * a) return [-a + d, -b]; if (d < 2 * a + 2 * b) return [a, -b + (d - 2 * a)]; if (d < 4 * a + 2 * b) return [a - (d - 2 * a - 2 * b), b]; return [-a, b - (d - 4 * a - 2 * b)]; };
  for (let k = 0; k < E; k++) {
    const [u, v] = ring(k), [u2, v2] = ring(k + 1), P = W(u, v, h(u, v) + 0.02), Q = W(u2, v2, h(u2, v2) + 0.02), P2 = W(u, v, h(u, v) - 0.34), Q2 = W(u2, v2, h(u2, v2) - 0.34);
    fas.push(...P, ...Q, ...Q2, ...P, ...Q2, ...P2, ...P, ...Q2, ...Q, ...P, ...P2, ...Q2);
  }
  bag.add(el.soffit || 'timber_red', fromTriangles(fas));
  const L = a - b, top0 = y0 + R, rg = alongZ ? box(cx - 0.3, top0 - 0.1, cz - L - 0.1, cx + 0.3, top0 + 0.7, cz + L + 0.1) : box(cx - L - 0.1, top0 - 0.1, cz - 0.3, cx + L + 0.1, top0 + 0.7, cz + 0.3);
  bag.add(el.ridgeMat || 'tile_grey', rg);
  for (const su of [-1, 1]) for (const sv of [-1, 1]) {
    const pts = []; for (let k = 0; k <= 6; k++) { const t = k / 6, u = su * (L + b * t), v = sv * b * t; pts.push(W(u, v, h(u, v) + 0.22)); }
    const hr = [];
    for (let k = 0; k < 6; k++) { const p = pts[k], q = pts[k + 1]; for (const [o, w] of [[0.2, 0.2], [-0.05, 0.2]]) void o, void w; hr.push(p[0] - 0.18, p[1] + 0.2, p[2] - 0.18, q[0] - 0.18, q[1] + 0.2, q[2] - 0.18, q[0] + 0.18, q[1] + 0.2, q[2] + 0.18, p[0] - 0.18, p[1] + 0.2, p[2] - 0.18, q[0] + 0.18, q[1] + 0.2, q[2] + 0.18, p[0] + 0.18, p[1] + 0.2, p[2] + 0.18); }
    bag.add(el.ridgeMat || 'tile_grey', fromTriangles(hr));
  }
}
