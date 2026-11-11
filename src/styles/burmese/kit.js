// Burmese (Pagan) style kit (docs/settlements/bagan.md §5): frames, pointed-arch walls, corbelled vaults, miniature stupas.
import { box, lathe, fromTriangles } from '../../core/geom.js';

export const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); };
export const TAU = Math.PI * 2;

/** A frame on the ground: u runs lateral, v out from the origin o along V; all axis-aligned. */
export class Fr {
  constructor(ctx, o, U, V) { this.bag = ctx.bag; this.col = ctx.col; this.lights = ctx.lights; this.ctx = ctx; this.o = o; this.U = U; this.V = V; }
  pt(u, v) { return [this.o[0] + this.U[0] * u + this.V[0] * v, this.o[1] + this.U[1] * u + this.V[1] * v]; }
  R(u0, v0, u1, v1) { const a = this.pt(u0, v0), b = this.pt(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; }
  /** A box in the frame (u0, y0, v0, u1, y1, v1); solid adds an obstacle. */
  b(mat, u0, y0, v0, u1, y1, v1, solid = true) {
    const r = this.R(u0, v0, u1, v1);
    if (r[2] - r[0] < 1e-4 || r[3] - r[1] < 1e-4 || y1 - y0 < 1e-4) return;
    this.bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3]));
    if (solid) this.col.rect(r, y0, y1);
  }
  floor(u0, v0, u1, v1, y) { this.col.floor(this.R(u0, v0, u1, v1), y); }
  ramp(u0, v0, u1, v1, y0, y1, dirV) {
    // ascending toward +v (dirV 1) or −v, as a compass direction of the world
    const d = [this.V[0] * dirV, this.V[1] * dirV];
    const dir = d[0] > 0.5 ? 'e' : d[0] < -0.5 ? 'w' : d[1] > 0.5 ? 's' : 'n';
    this.col.ramp(this.R(u0, v0, u1, v1), y0, y1, dir);
  }
  circle(u, v, r, y0, y1) { const p = this.pt(u, v); this.col.circle(p[0], p[1], r, y0, y1); }
  lathe(mat, prof, u, y, v, seg = 12) { const p = this.pt(u, v); this.bag.add(mat, lathe(prof, seg, null, p[0], y, p[1])); }
  light(u, y, v, color = '#ffc98a', intensity = 5, distance = 14) { const p = this.pt(u, v); this.lights.push({ at: [p[0], y, p[1]], color, intensity, distance }); }
}
export const worldFrame = (ctx) => new Fr(ctx, [0, 0], [1, 0], [0, 1]);
/** The four sides' frames about (cx, cz): v runs outward; u runs clockwise seen from above. */
export const SIDES = { n: [[1, 0], [0, -1]], e: [[0, 1], [1, 0]], s: [[-1, 0], [0, 1]], w: [[0, -1], [-1, 0]] };
export const sideFrame = (ctx, c, side) => new Fr(ctx, c, SIDES[side][0], SIDES[side][1]);

/**
 * A wall run along u from u0 to u1, v0..v1 thick, y0..y1 high, pierced by pointed-arch openings: open: [{ c, w, top (crown, absolute), sill (a window's sill above y0) }].
 * The arch is cut in strips, so it reads as a true pointed arch; solid fill above it.
 */
export function archWall(F, mat, u0, u1, v0, v1, y0, y1, open = [], faceMat = null) {
  const list = [...open].sort((a, b) => a.c - b.c);
  let u = u0;
  const solid = (a, b) => { if (b - a > 1e-3) F.b(mat, a, y0, v0, b, y1, v1); };
  for (const o of list) {
    const a = o.w / 2, base = y0 + (o.sill ?? 0);
    solid(u, o.c - a);
    if (o.sill) F.b(mat, o.c - a, y0, v0, o.c + a, base, v1);
    const R = Math.min(1.4 * a, o.top - base - 0.4), s = o.top - R, n = Math.max(6, Math.round(a * 4));
    for (const sd of [-1, 1]) for (let j = 0; j < n; j++) {
      const t0 = j / n, t1 = (j + 1) / n, tc = (t0 + t1) / 2, ya = s + R * Math.pow(1 - tc, 0.7);
      const ua = o.c + sd * a * t0, ub = o.c + sd * a * t1;
      F.b(mat, Math.min(ua, ub), ya, v0, Math.max(ua, ub), y1, v1, false);
    }
    // the obstacle above the opening starts at the spring (above any head)
    F.col.rect(F.R(o.c - a, v0, o.c + a, v1), s, y1);
    if (faceMat) { /* a moulded frame round the arch: a slightly proud band down each jamb */
      for (const sd of [-1, 1]) F.b(faceMat, o.c + sd * (a + 0.12) - 0.12, base, v0 - 0.04, o.c + sd * (a + 0.12) + 0.12, s, v1 + 0.04, false);
    }
    u = o.c + a;
  }
  solid(u, u1);
}

/**
 * A corbelled pointed vault over a run: along 'v' (lateral centre c, half width a, from l0 to l1 in v) or along 'u'. The haunches rise from ySpring in n courses
 * to the crown (rise); the middle left open. Visual only (above any head).
 */
export function vault(F, axis, c, a, l0, l1, ySpring, rise, n, mat) {
  const h = rise / n;
  for (let k = 0; k < n; k++) {
    const w = a * Math.pow(1 - (k + 0.5) / n, 0.75), y0 = ySpring + k * h, y1 = y0 + h + 0.02;
    for (const sd of [-1, 1]) {
      const p = sd < 0 ? [c - a - 0.01, c - w] : [c + w, c + a + 0.01];
      if (axis === 'v') F.b(mat, p[0], y0, l0, p[1], y1, l1, false); else F.b(mat, l0, y0, p[0], l1, y1, p[1], false);
    }
  }
}

/** A miniature bell stupa (a corner stupa): base, bell, bands, bud, spire; h in metres. mat the body, gilt optional. */
export function miniStupa(bag, x, y, z, h, body = 'limewash_white', gilt = false, seg = 8) {
  const s = h / 6;
  bag.add(body, lathe([[1.0 * s, 0], [1.0 * s, 0.7 * s], [0.8 * s, 0.75 * s], [0.8 * s, 1.0 * s], [0.62 * s, 1.1 * s], [0.62 * s, 1.5 * s]], seg, null, x, y, z));
  bag.add(body, lathe([[0.6 * s, 1.5 * s], [0.9 * s, 1.9 * s], [0.95 * s, 2.5 * s], [0.75 * s, 3.4 * s], [0.45 * s, 4.1 * s], [0.3 * s, 4.4 * s], [0.4 * s, 4.55 * s], [0.25 * s, 4.7 * s]], seg, null, x, y, z));
  bag.add(gilt ? 'gilt_bronze' : body, lathe([[0.25 * s, 4.7 * s], [0.22 * s, 5.1 * s], [0.12 * s, 5.4 * s], [0.04 * s, 6 * s], [0.001, 6 * s]], seg, null, x, y, z));
}

/** A lathe-built tapering finial: the gilded hti (umbrella) — rings stacked on a rod, from y0 up h. */
export function hti(bag, x, y0, z, h, r = 1.0) {
  const prof = [[0.08 * r, 0], [0.08 * r, h * 0.3]];
  const tiers = 4;
  for (let k = 0; k < tiers; k++) {
    const yy = h * (0.3 + 0.16 * k), rr = r * (1 - k * 0.2);
    prof.push([rr, yy], [rr * 0.55, yy + h * 0.045], [0.08 * r, yy + h * 0.06]);
  }
  prof.push([0.05 * r, h * 0.98], [0.001, h]);
  bag.add('gilt_bronze', lathe(prof, 10, null, x, y0, z));
}
export { fromTriangles };
