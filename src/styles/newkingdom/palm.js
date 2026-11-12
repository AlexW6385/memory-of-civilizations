// A date palm in three levels of detail for the town's gardens and courts (docs/settlements/thebes.md §6): the same palm as the
// egyptian vocabulary's (a ringed trunk, a spiral crown of arched fronds with their leaflets, dead fronds under the crown) at a
// fraction of its triangles — 2000 each at full detail was the largest part of the town's geometry (about 600 palms in its gardens).
import { lathe, place, fromTriangles } from '../../core/geom.js';
import { rng } from './kit.js';

/** detail 1: 12 fronds of 9 leaflets (about 300 triangles); 2: 18 fronds of 16 leaflets (about 700). */
export function nkPalm(el, { bag, col }, detail = 1) {
  const [x, z] = el.at, y = el.y ?? 0, r = rng(el.seed ?? 7), h = el.h ?? 10, lean = el.lean ?? 0, yaw = r() * Math.PI * 2;
  const nf = detail >= 2 ? 18 : 12, NL = detail >= 2 ? 16 : 9, K = detail >= 2 ? 8 : 5;
  const prof = [], n = Math.max(4, Math.round(h / (detail >= 2 ? 0.45 : 0.9)));
  for (let i = 0; i <= n; i++) { const t = i / n; prof.push([i === 0 ? 0.36 : 0.26 - 0.06 * t + (i % 2 ? 0.025 : 0), t * h]); }
  const trunk = lathe(prof, detail >= 2 ? 8 : 6);
  const pos = trunk.attributes.position;
  for (let i = 0; i < pos.count; i++) { const yy = pos.getY(i); pos.setX(i, pos.getX(i) + lean * yy * yy / h); }
  place(trunk, x, y, z, yaw);
  bag.add('palm_trunk', trunk);
  const top = [x + Math.cos(-yaw) * lean * h, y + h, z + Math.sin(-yaw) * lean * h], live = [], dead = [];
  for (let f = 0; f < nf; f++) {
    const az = (f / nf) * Math.PI * 2 * 2.618 + r() * 0.4, age = f / nf, isDead = age > 0.86;
    const up = isDead ? -1.25 + r() * 0.2 : 1.15 - age * 1.5 + r() * 0.15, len = (isDead ? 2.6 : 3.2) + r() * 1.1, pts = [];
    for (let k = 0; k <= K; k++) { const t = k / K, d = t * len, yy = Math.sin(up) * d - (isDead ? 0.05 : 0.5) * d * d / len; pts.push([top[0] + Math.cos(az) * Math.cos(up) * d, top[1] - 0.15 + yy, top[2] + Math.sin(az) * Math.cos(up) * d]); }
    const sx = -Math.sin(az), sz = Math.cos(az), out = isDead ? dead : live;
    for (let k = 0; k < K; k++) { const p = pts[k], q = pts[k + 1]; out.push(p[0] + sx * 0.03, p[1], p[2] + sz * 0.03, q[0], q[1], q[2], p[0] - sx * 0.03, p[1], p[2] - sz * 0.03); }
    const nl = isDead ? Math.ceil(NL / 2) : NL;
    for (let l = 1; l < nl; l++) {
      const t = l / nl, kf = t * K, k0 = Math.min(K - 1, Math.floor(kf)), fr = kf - k0;
      const p = [0, 1, 2].map((c) => pts[k0][c] * (1 - fr) + pts[k0 + 1][c] * fr), q = pts[Math.min(K, k0 + 1)];
      const fx = q[0] - p[0], fy = q[1] - p[1], fz = q[2] - p[2], fl = Math.hypot(fx, fy, fz) || 1;
      const ll = (0.3 + 0.7 * Math.sin(Math.PI * Math.min(1, t * 1.15))) * (isDead ? 0.7 : 1) * (28 / (nl * 2 + 4)) ** 0.35;
      for (const side of [-1, 1]) {
        const tip = [p[0] + side * sx * ll + fx / fl * ll * 0.55, p[1] + ll * (0.22 + (r() - 0.5) * 0.25) * (isDead ? -1 : 1) + fy / fl * ll * 0.55, p[2] + side * sz * ll + fz / fl * ll * 0.55];
        out.push(...p, p[0] + fx / fl * 0.12, p[1] + fy / fl * 0.12, p[2] + fz / fl * 0.12, ...tip);
      }
    }
  }
  bag.add('palm_leaf', fromTriangles(live));
  if (dead.length) bag.add('palm_trunk', fromTriangles(dead));
  col.circle(x, z, 0.4, y, y + h);
}
