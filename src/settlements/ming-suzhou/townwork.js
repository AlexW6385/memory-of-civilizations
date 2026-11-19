// The wear and the small furniture of the canal quarter (docs/settlements/ming-suzhou.md §20): what the
// style's houses, canal walls, landing steps, bridges and boats (src/styles/ming, shared, read-only) lack
// and the streets and quays need to look lived in. Each element here wraps the shared one of the same
// name (style `suzhou-quarter`): it builds that, then adds its own fine pieces, gathered per material
// into one geometry per element (no shared prototype, so nothing is instanced and no draw is added).
// Every variation comes from a hash of the piece's own position: the same plan builds the same geometry.

import { fromTriangles, orientOutward, lathe } from '../../core/geom.js';
import { STYLES, registerStyle } from '../../core/build.js';
import '../../styles/ming/index.js';
import './style.js';

export const hash = (a, b = 0, c = 0) => {
  let h = (Math.imul(Math.round(a * 997) | 0, 374761393) + Math.imul(Math.round(b * 997) | 0, 668265263) + Math.imul(Math.round(c * 997) | 0, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

/** Triangles gathered by material. */
export class Acc {
  constructor() { this.m = new Map(); }
  arr(mat) { let a = this.m.get(mat); if (!a) this.m.set(mat, (a = [])); return a; }
  tri(mat, a, b, c) { this.arr(mat).push(...a, ...b, ...c); }
  quad(mat, a, b, c, d, both = false) { this.tri(mat, a, b, c); this.tri(mat, a, c, d); if (both) { this.tri(mat, a, c, b); this.tri(mat, a, d, c); } }
  /** A quad of a convex solid about the point `ctr`, its two triangles wound to face away from it (one-sided: it was drawn twice, once each way). */
  quadOut(mat, a, b, c, d, ctr) {
    for (const t of [[a, b, c], [a, c, d]]) {
      const [p, q, r] = t, ux = q[0] - p[0], uy = q[1] - p[1], uz = q[2] - p[2], vx = r[0] - p[0], vy = r[1] - p[1], vz = r[2] - p[2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const mx = (p[0] + q[0] + r[0]) / 3 - ctr[0], my = (p[1] + q[1] + r[1]) / 3 - ctr[1], mz = (p[2] + q[2] + r[2]) / 3 - ctr[2];
      if (nx * mx + ny * my + nz * mz >= 0) this.tri(mat, p, q, r); else this.tri(mat, p, r, q);
    }
  }
  box(mat, x0, y0, z0, x1, y1, z1) {
    if (x1 - x0 < 1e-5 || y1 - y0 < 1e-5 || z1 - z0 < 1e-5) return;
    const p = [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], q = [];
    const f = (a, b, c, d) => q.push(...p[a], ...p[b], ...p[c], ...p[a], ...p[c], ...p[d]);
    f(4, 7, 6, 5); f(0, 1, 2, 3); f(0, 4, 5, 1); f(2, 6, 7, 3); f(1, 5, 6, 2); f(3, 7, 4, 0);
    this.arr(mat).push(...orientOutward(q));
  }
  /** A lathe piece (profile [r, y]) standing at (x, y, z). */
  lathe(mat, profile, seg, x, y, z) {
    const g = lathe(profile, seg, null, x, y, z), A = g.attributes.position.array, o = this.arr(mat);
    for (let i = 0; i < A.length; i++) o.push(A[i]);
  }
  /** One geometry per material. Every corner moves by up to 1.2 mm by a hash of its own place (the same corner always moves the same, so nothing tears), so that the same
   *  overlay on twelve identical houses is twelve shapes and the bag does not turn them into an instanced draw. */
  flush(bag) {
    for (const [mat, a] of this.m) {
      if (!a.length) continue;
      for (let i = 0; i < a.length; i += 3) { const x = a[i], y = a[i + 1], z = a[i + 2]; a[i] = x + (hash(x, z, y) - 0.5) * 0.0024; a[i + 1] = y + (hash(y, x, z + 0.37) - 0.5) * 0.0024; a[i + 2] = z + (hash(z, y, x + 0.71) - 0.5) * 0.0024; }
      bag.add(mat, fromTriangles(a));
    }
    this.m.clear();
  }
}

/** A point frame at c = [x, z] looking out along n (a unit axis vector): local (a along, o out) → world [x, z]. */
export function frame(c, n) {
  const u = [-n[1], n[0]];
  return {
    u, n,
    at: (a, o) => [c[0] + u[0] * a + n[0] * o, c[1] + u[1] * a + n[1] * o],
    /** a box in local terms (a0…a1 along, o0…o1 out, y0…y1) as a world-aligned box */
    box(acc, mat, a0, a1, o0, o1, y0, y1) {
      const p = [c[0] + u[0] * a0 + n[0] * o0, c[1] + u[1] * a0 + n[1] * o0], q = [c[0] + u[0] * a1 + n[0] * o1, c[1] + u[1] * a1 + n[1] * o1];
      acc.box(mat, Math.min(p[0], q[0]), y0, Math.min(p[1], q[1]), Math.max(p[0], q[0]), y1, Math.max(p[1], q[1]));
    },
    /** a flat polygon (list of [a, y]) on the plane o, facing out */
    poly(acc, mat, pts, o) {
      const w = pts.map(([a, y]) => { const [x, z] = [c[0] + u[0] * a + n[0] * o, c[1] + u[1] * a + n[1] * o]; return [x, y, z]; });
      for (let i = 1; i < w.length - 1; i++) {
        const t = [w[0], w[i], w[i + 1]], e1 = [t[1][0] - t[0][0], t[1][1] - t[0][1], t[1][2] - t[0][2]], e2 = [t[2][0] - t[0][0], t[2][1] - t[0][1], t[2][2] - t[0][2]];
        const nx = e1[1] * e2[2] - e1[2] * e2[1], nz = e1[0] * e2[1] - e1[1] * e2[0];
        if (nx * n[0] + nz * n[1] >= 0) acc.tri(mat, t[0], t[1], t[2]); else acc.tri(mat, t[0], t[2], t[1]);
      }
    },
  };
}
/** A ring (torus-like: n segments of a square section) in the plane facing out, centre (a, y), radius R, section r. */
function ringAt(acc, F, mat, a, y, o, R, r, n = 8) {
  for (let k = 0; k < n; k++) {
    const t0 = k / n * Math.PI * 2, t1 = (k + 1) / n * Math.PI * 2;
    const P = (t, d, e) => [a + Math.cos(t) * (R + d), y + Math.sin(t) * (R + d), o + e];
    const A0 = P(t0, -r, 0), A1 = P(t1, -r, 0), B0 = P(t0, r, 0), B1 = P(t1, r, 0), C0 = P(t0, 0, r), C1 = P(t1, 0, r), D0 = P(t0, 0, -r), D1 = P(t1, 0, -r);
    const ctr = [0, 0, 0];
    for (const [aa, yy, oo] of [A0, A1, B0, B1, C0, C1, D0, D1]) { const [x, z] = F.at(aa, oo); ctr[0] += x / 8; ctr[1] += yy / 8; ctr[2] += z / 8; }
    for (const [p, q, p2, q2] of [[A0, A1, C0, C1], [C0, C1, B0, B1], [B0, B1, D0, D1], [D0, D1, A0, A1]]) {
      const w = [p, q, q2, p2].map(([aa, yy, oo]) => { const [x, z] = F.at(aa, oo); return [x, yy, z]; });
      acc.quadOut(mat, w[0], w[1], w[2], w[3], ctr);
    }
  }
}
/** A disc (n-gon) in the plane facing out, centre (a, y), radius R, standing out from o0 to o1. */
function bossAt(acc, F, mat, a, y, o0, o1, R, n = 8) {
  const pts = []; for (let k = 0; k < n; k++) pts.push([a + Math.cos(k / n * Math.PI * 2) * R, y + Math.sin(k / n * Math.PI * 2) * R]);
  F.poly(acc, mat, pts, o1);
  const [cx, cz] = F.at(a, (o0 + o1) / 2), ctr = [cx, y, cz];
  for (let k = 0; k < n; k++) {
    const p = pts[k], q = pts[(k + 1) % n], w = [[p, o0], [q, o0], [q, o1], [p, o1]].map(([[aa, yy], oo]) => { const [x, z] = F.at(aa, oo); return [x, yy, z]; });
    acc.quadOut(mat, w[0], w[1], w[2], w[3], ctr);
  }
}

// ── houses ───────────────────────────────────────────────────────────────────────────────────────────────────
const OUT = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };
const bounds = (g) => { g.computeBoundingBox(); return g.boundingBox; };

/** The lane door of a house: threshold board, strap hinges, ring knockers on bosses, door-lintel pegs, and by the door's own hash door gods and couplets. */
function doorWork(acc, n, leaf, wallO) {
  const bb = leaf, alongX = Math.abs(n[0]) < 0.5, w = alongX ? bb.max.x - bb.min.x : bb.max.z - bb.min.z;
  const cx = (bb.min.x + bb.max.x) / 2, cz = (bb.min.z + bb.max.z) / 2;
  const fo = n[0] > 0.5 ? bb.max.x : n[0] < -0.5 ? bb.min.x : n[1] > 0.5 ? bb.max.z : bb.min.z;
  const c = alongX ? [cx, fo] : [fo, cz], F = frame(c, n), yb = bb.min.y, hw = w / 2, hs = hash(cx, cz, 3);
  // the seam between the leaves, the strap hinges and the nail rows
  F.box(acc, 'lacquer_black', -0.006, 0.006, 0, 0.004, yb, yb + 2.3);
  for (const s of [-1, 1]) for (const yy of [0.32, 1.86]) F.box(acc, 'iron', s * 0.05 - (s > 0 ? 0 : 0.37), s * 0.05 + (s > 0 ? 0.37 : 0), 0, 0.012, yb + yy, yb + yy + 0.06);
  // the knockers: a boss on each leaf and a ring hung from it (the lion-head's face reduced to the boss)
  for (const s of [-1, 1]) { bossAt(acc, F, 'gilt_bronze', s * 0.13, yb + 1.12, 0.0, 0.03, 0.045, 6); ringAt(acc, F, 'gilt_bronze', s * 0.13, yb + 1.04, 0.03, 0.05, 0.008, 6); }
  // the threshold: a board across the doorway, high at its ends and worn down in the middle where feet cross it
  F.box(acc, 'timber', -hw, -hw + 0.26, -0.05, 0.03, yb, yb + 0.16); F.box(acc, 'timber', hw - 0.26, hw, -0.05, 0.03, yb, yb + 0.16);
  F.box(acc, 'wood_dark', -hw + 0.26, hw - 0.26, -0.05, 0.03, yb, yb + 0.1);
  // the lintel's two pegs (men zan), round heads on the granite lintel
  for (const s of [-1, 1]) bossAt(acc, F, 'lacquer_red', s * 0.2, yb + 2.4, 0.07, 0.095, 0.065, 6);
  // door gods (men shen): on about a third of the doors, a printed pair on the leaves
  if (hs < 0.36) {
    for (const s of [-1, 1]) {
      const a = s * 0.25;
      F.box(acc, 'lacquer_red', a - 0.17, a + 0.17, 0, 0.007, yb + 0.6, yb + 1.46);
      F.box(acc, 'gilt_bronze', a - 0.075, a + 0.075, 0.007, 0.011, yb + 1.18, yb + 1.4);                 // the armour
      F.box(acc, 'lacquer_black', a - 0.06, a + 0.06, 0.007, 0.011, yb + 1.4, yb + 1.45);                  // the helmet
      F.box(acc, 'lacquer_black', a - 0.1, a + 0.1, 0.007, 0.011, yb + 0.88, yb + 1.18);                   // the robe
      F.box(acc, 'gilt_bronze', a - 0.1, a + 0.1, 0.007, 0.011, yb + 0.66, yb + 0.88);
      F.box(acc, 'iron', a + s * 0.13 - 0.008, a + s * 0.13 + 0.008, 0.007, 0.012, yb + 0.7, yb + 1.44);     // the mace or halberd
    }
  }
  // the couplet (dui lian): two red strips either side of the door, a short one over the lintel, black strokes on them
  if (hash(cx, cz, 5) < 0.58) {
    for (const s of [-1, 1]) {
      const a0 = s * (hw + 0.16), x0 = a0 - 0.075, x1 = a0 + 0.075;
      F.box(acc, 'lacquer_red', x0, x1, wallO, wallO + 0.006, yb + 0.55, yb + 1.95);
      for (let k = 0; k < 6; k++) { const jt = (hash(cx + s, k) - 0.5) * 0.03; F.box(acc, 'wood_dark', a0 - 0.04 + jt, a0 + 0.04 + jt, wallO + 0.006, wallO + 0.009, yb + 0.66 + k * 0.215, yb + 0.66 + k * 0.215 + 0.12); }
    }
    F.box(acc, 'lacquer_red', -0.4, 0.4, wallO, wallO + 0.006, yb + 2.56, yb + 2.7);
    for (let k = 0; k < 4; k++) F.box(acc, 'wood_dark', -0.3 + k * 0.17, -0.2 + k * 0.17, wallO + 0.006, wallO + 0.009, yb + 2.6, yb + 2.66);
  }
}

/** Rain-streaks under a window's sill, and the damp's moss at the wall's foot, from the pieces the house builder added. */
function houseWear(el, ctx, rec, acc) {
  const n = OUT[el.front || 's'], y = el.y ?? 0;
  let leaf = null;
  for (const [mat, g] of rec) {
    const bb = bounds(g), dx = bb.max.x - bb.min.x, dy = bb.max.y - bb.min.y, dz = bb.max.z - bb.min.z;
    if (mat === 'lacquer_chestnut' && Math.abs(dy - 2.3) < 0.02 && !leaf) {
      const a = Math.max(dx, dz), t = Math.min(dx, dz);
      if (Math.abs(a - 0.95) < 0.02 && Math.abs(t - 0.13) < 0.02) leaf = bb.clone();
    }
    if (mat === 'granite_grey' && Math.abs(dy - 0.15) < 0.01 && Math.abs(Math.max(dx, dz) - 1.0) < 0.1 && Math.abs(Math.min(dx, dz) - 0.14) < 0.01) {
      // a window sill: the stain below it, from its ends down the wall (the wall face lies 0.1 behind the sill's outer face)
      const alongX = Math.abs(n[0]) < 0.5, cx = (bb.min.x + bb.max.x) / 2, cz = (bb.min.z + bb.max.z) / 2;
      const fo = n[0] > 0.5 ? bb.max.x : n[0] < -0.5 ? bb.min.x : n[1] > 0.5 ? bb.max.z : bb.min.z;
      const F = frame(alongX ? [cx, fo] : [fo, cz], n), len = 0.55 + hash(cx, cz, 2) * 0.55, wid = Math.max(dx, dz);
      // (above the damp band and its tongues, which reach 1.9 m: where they meet the stain is the shared house's own)
      const lo = Math.max(bb.min.y - len, y + 1.95), lo2 = Math.max(bb.min.y - len - 0.35, y + 1.95);
      if (bb.min.y - lo > 0.15) F.box(acc, 'plaster_streak', -wid * 0.42, wid * 0.42, -0.0955, -0.0905, lo, bb.min.y);
      if (bb.min.y - lo2 > 0.15) for (const s of [-1, 1]) F.box(acc, 'plaster_streak', s * wid * 0.47 - 0.03, s * wid * 0.47 + 0.03, -0.0955, -0.0905, lo2, bb.min.y);
    }
  }
  if (leaf) doorWork(acc, n, leaf, -0.032);
  void ctx; void y;
}

function house(el, ctx) {
  const base = STYLES['suzhou-town'].elements.house_jiangnan || STYLES.ming.elements.house_jiangnan;
  if (el.open || el.simple || el.kind === 'yard' || (el.detail ?? 2) < 1) { base(el, ctx); return; }
  const rec = [], spy = Object.create(ctx.bag);
  spy.add = (mat, g) => { if ((mat === 'lacquer_chestnut' || mat === 'granite_grey') && g.attributes.position.count <= 36) rec.push([mat, g]); return ctx.bag.add(mat, g); };
  base(el, { ...ctx, bag: spy });
  const acc = new Acc();
  houseWear(el, ctx, rec, acc);
  acc.flush(ctx.bag);
}

registerStyle('suzhou-quarter', { ...STYLES['suzhou-town'], elements: { ...STYLES['suzhou-town'].elements, house_jiangnan: house } });
