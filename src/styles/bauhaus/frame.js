// A building's local frame for the town's houses (docs/settlements/bauhaus-dessau.md §4): `u` runs along the street front, `v` from the front
// face into the building (negative: out into the street), `y` up. Every box, pane, collider and light of a house is written in this frame and
// laid on the plan by the front's side ('n' | 's' | 'e' | 'w'), so one design serves all four ways a lot can face.
import { frustum } from '../../core/geom.js';
import { S } from './kit.js';

export class Fr {
  /** sk: the style kit; rect: [x0, z0, x1, z1]; front: the street side; mirror: flip u (the mirrored half of a double house). */
  constructor(sk, rect, front, mirror = false) {
    this.sk = sk; this.rect = rect; this.f = front; this.mirror = mirror;
    const [x0, z0, x1, z1] = rect;
    this.alongX = front === 'n' || front === 's';
    this.W = this.alongX ? x1 - x0 : z1 - z0;
    this.D = this.alongX ? z1 - z0 : x1 - x0;
    this.out = front === 'n' || front === 'w' ? -1 : 1;     // the sign of the outward normal on its world axis
  }
  /** local (u, v) → world [x, z]. */
  at(u, v) {
    const [x0, z0, x1, z1] = this.rect, uu = this.mirror ? this.W - u : u;
    switch (this.f) { case 'n': return [x0 + uu, z0 + v]; case 's': return [x0 + uu, z1 - v]; case 'w': return [x0 + v, z0 + uu]; default: return [x1 - v, z0 + uu]; }
  }
  _r(u0, u1, v0, v1) { const a = this.at(u0, v0), b = this.at(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; }
  /** A box. */
  b(mat, u0, u1, y0, y1, v0, v1) { if (u1 - u0 < 1e-4 || v1 - v0 < 1e-4 || y1 - y0 < 1e-4) return; const r = this._r(u0, u1, v0, v1); this.sk.b(mat, r[0], y0, r[1], r[2], y1, r[3]); }
  /** A solid box (drawn and blocking). */
  s(mat, u0, u1, y0, y1, v0, v1) { if (u1 - u0 < 1e-4 || v1 - v0 < 1e-4 || y1 - y0 < 1e-4) return; const r = this._r(u0, u1, v0, v1); this.sk.s(mat, r[0], y0, r[1], r[2], y1, r[3]); }
  /** A blocking volume only. */
  k(u0, u1, y0, y1, v0, v1) { const r = this._r(u0, u1, v0, v1); this.sk.k(r[0], y0, r[1], r[2], y1, r[3]); }
  floor(u0, u1, v0, v1, y) { this.sk.fl(this._r(u0, u1, v0, v1), y); }
  /** A single-sided pane across u0..u1, y0..y1 at depth v; dir +1 faces the street, −1 faces into the house. */
  pane(mat, u0, u1, y0, y1, v, dir = 1) {
    const a = this.at(u0, v), b = this.at(u1, v), ax = this.alongX, c = ax ? a[1] : a[0], p = ax ? a[0] : a[1], q = ax ? b[0] : b[1];
    this.sk.pane(mat, { alongX: ax, x: c, z: c, u0: Math.min(p, q), u1: Math.max(p, q), y0, y1, n: this.out * dir });
  }
  /** A cylinder standing at (u, v). */
  cyl(mat, u, y, v, r, h, seg = 10) { const p = this.at(u, v); this.sk.cyl(mat, p[0], y, p[1], r, h, seg); }
  rod(mat, u0, y0, v0, u1, y1, v1, r = 0.02, seg = 4) { const a = this.at(u0, v0), b = this.at(u1, v1); this.sk.rod(mat, [a[0], y0, a[1]], [b[0], y1, b[1]], r, seg); }
  light(u, y, v, color = '#ffe2b0', intensity = 2.0, dist = 8) { const p = this.at(u, v); this.sk.light(p[0], y, p[1], color, intensity, dist); }
  lathe(mat, prof, u, y, v, seg = 10) { const p = this.at(u, v); this.sk.lathe(mat, prof, p[0], y, p[1], seg); }
  /**
   * A wall across u0..u1 at depth v..v+th, y0..y1, with openings [{ u0, u1, y0?, y1, glass?, frame?, solid? }]: a door has no y0 (it starts at the
   * wall's foot), a window carries its pane (both sides) and a frame. `solid` makes the pieces block.
   */
  wall(o) {
    const { u0, u1, v, th, y0, y1, mat, solid = true } = o, ops = (o.ops || []).map((p) => ({ ...p })).sort((p, q) => p.u0 - q.u0);
    const piece = (a, ya, bb, yb) => { if (bb - a > 1e-3 && yb - ya > 1e-3) (solid ? this.s : this.b).call(this, mat, a, bb, ya, yb, v, v + th); };
    const cuts = [...new Set([u0, u1, ...ops.flatMap((p) => [p.u0, p.u1])])].filter((x) => x >= u0 - 1e-6 && x <= u1 + 1e-6).sort((p, q) => p - q);
    for (let i = 0; i + 1 < cuts.length; i++) {
      const a = cuts[i], bb = cuts[i + 1], m = (a + bb) / 2, op = ops.filter((p) => m > p.u0 && m < p.u1);
      if (!op.length) { piece(a, y0, bb, y1); continue; }
      const lo = Math.max(...op.map((p) => p.y0 ?? y0)), hi = Math.min(...op.map((p) => p.y1));
      piece(a, y0, bb, lo); piece(a, hi, bb, y1);
    }
    for (const p of ops) {
      if (!p.glass) continue;
      const wy0 = p.y0, wy1 = p.y1, vm = v + th * 0.45, fr = p.frame ?? 'paint_white', t = 0.05;
      this.pane(p.glass, p.u0, p.u1, wy0, wy1, vm, 1); this.pane(p.glass, p.u0, p.u1, wy0, wy1, vm, -1);
      const e = 0.02;
      this.b(fr, p.u0 + e, p.u1 - e, wy0 + e, wy0 + t, vm - 0.04, vm + 0.04); this.b(fr, p.u0 + e, p.u1 - e, wy1 - t, wy1 - e, vm - 0.04, vm + 0.04);
      this.b(fr, p.u0 + e, p.u0 + t, wy0 + e, wy1 - e, vm - 0.04, vm + 0.04); this.b(fr, p.u1 - t, p.u1 - e, wy0 + e, wy1 - e, vm - 0.04, vm + 0.04);
      const w = p.u1 - p.u0, nm = Math.max(0, Math.round(w / 0.7) - 1);
      for (let q = 1; q <= nm; q++) { const uu = p.u0 + w * q / (nm + 1); this.b(fr, uu - 0.02, uu + 0.02, wy0, wy1, vm - 0.03, vm + 0.03); }
      if (wy1 - wy0 > 1.5) this.b(fr, p.u0, p.u1, (wy0 + wy1) / 2 - 0.02, (wy0 + wy1) / 2 + 0.02, vm - 0.03, vm + 0.03);
    }
  }
}

/** The tiled hip roof over a world rectangle (the ridge along the longer side), from y. */
export function hip(sk, rect, y, mat = 'roof_tile', rise = 0.9, over = 0.35) {
  const [x0, z0, x1, z1] = rect, w = x1 - x0, d = z1 - z0, m = Math.min(w, d) / 2 - 0.1;
  sk.bag.add(mat, frustum([x0 - over, z0 - over, x1 + over, z1 + over], y, y + (m + over) * rise, m + over, m + over, m + over, m + over, { noBottom: true }));
  return y + (m + over) * rise;
}
export { S };
