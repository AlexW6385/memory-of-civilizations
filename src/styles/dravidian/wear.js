// The wear of the four great gates (docs/settlements/madurai.md §22): where feet, hands and lamp smoke have been. Geometry only, in materials the
// temple plan already holds (granite_tamil, opening): the lane of pilgrims' feet through each gopuram's passage polished in pale dished plates,
// and the soot of the lamp niches streaked up the passage's piers (wood_dark). Every variation is a hash of the piece's own place.
import { box, fromTriangles } from '../../core/geom.js';

const hash = (x, z, s = 0) => { let h = (Math.round(x * 16) * 73856093) ^ (Math.round(z * 16) * 19349663) ^ Math.imul(s + 1, 83492791); h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };

/** A plate x0..x1, z0..z1 from yb whose top is dished: heights [h00, h10, h11, h01]. */
function plate(x0, z0, x1, z1, yb, t) {
  const out = [], A = [x0, t[0], z0], B = [x1, t[1], z0], C = [x1, t[2], z1], D = [x0, t[3], z1], a = [x0, yb, z0], b = [x1, yb, z0], c = [x1, yb, z1], d = [x0, yb, z1];
  const q = (p0, p1, p2, p3) => out.push(...p0, ...p1, ...p2, ...p0, ...p2, ...p3);
  q(A, D, C, B); q(a, b, c, d); q(a, A, B, b); q(b, B, C, c); q(c, C, D, d); q(d, D, A, a);
  return fromTriangles(out);
}

/** mdu_wear { c, dir ('ns' | 'ew'), w, d, y }: the wear of one gopuram's passage and approach (the gopuram's own numbers). */
function wear(el, { bag }) {
  const [cx, cz] = el.c, y = el.y ?? 0, alongX = el.dir === 'ew', pw = Math.min(5, el.w * 0.18), D = el.d;
  const R = (u0, v0, u1, v1) => alongX ? [cx + v0, cz + u0, cx + v1, cz + u1] : [cx + u0, cz + v0, cx + u1, cz + v1];
  // the lane of feet: plates of paler granite along the passage's middle, from 8 m before the gate to 8 m past it, wider and more worn at the sill
  for (let v = -D / 2 - 8; v < D / 2 + 8; v += 0.95) {
    const [px, pz] = alongX ? [cx + v, cz] : [cx, cz + v];
    for (let k = 0; k < 2; k++) {
      const h = hash(px, pz, 3 + k), wd = 0.7 + 0.35 * hash(px, pz, 5 + k), dp = 0.55 + 0.3 * hash(px, pz, 7 + k);
      const u0 = (k ? 0.05 : -0.05 - wd) + (hash(px, pz, 9 + k) - 0.5) * 0.5 - (k ? 0 : 0), v0 = v + (hash(px, pz, 11 + k) - 0.5) * 0.25;
      if (hash(px, pz, 13 + k) < 0.12) continue;
      const r = R(Math.max(-pw / 2 + 0.1, u0), v0, Math.min(pw / 2 - 0.1, u0 + wd), v0 + dp);
      const x0 = Math.min(r[0], r[2]), x1 = Math.max(r[0], r[2]), z0 = Math.min(r[1], r[3]), z1 = Math.max(r[1], r[3]);
      if (x1 - x0 < 0.2 || z1 - z0 < 0.2) continue;
      const sill = Math.abs(v) < D / 2 ? 1 : 0, top = y + 0.032 + 0.01 * h, sink = (0.008 + 0.014 * sill) * hash(px, pz, 15 + k);
      bag.add('granite_tamil', plate(x0, z0, x1, z1, y - 0.01, [top - sink, top, top - sink * 0.5, top]));
    }
  }
  // the soot of the lamp niches: dark streaks fading upward on each pier's passage face, near the mouth on the outer side
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
    const v = D / 2 - 3.2 - i * 6.5, [px, pz] = alongX ? [cx + v, cz + s * pw / 2] : [cx + s * pw / 2, cz + v];
    for (let k = 0; k < 3; k++) {
      const wd = 0.3 - k * 0.07 + 0.06 * hash(px, pz, 20 + k), y0 = y + 1.9 + k * 0.9, y1 = y0 + 0.85 - k * 0.1, t = 0.012;
      const f = s * pw / 2, f0 = s > 0 ? f - t : f, f1 = s > 0 ? f : f + t;      // on the pier's face, standing out 1.2 cm into the passage
      const r = alongX ? [cx + v - wd / 2, cz + f0, cx + v + wd / 2, cz + f1] : [cx + f0, cz + v - wd / 2, cx + f1, cz + v + wd / 2];
      bag.add('wood_dark', box(r[0], y0, r[1], r[2], y1, r[3]));
    }
  }
}
export const wearElements = { mdu_wear: wear };
