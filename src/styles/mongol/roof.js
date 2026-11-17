// The ornament of a Chinese-type glazed roof (docs/settlements/mongol-karakorum.md §14): round eave-end tiles (wadang) with a gilt dragon-face boss round the whole eave,
// a red-glazed border (jianbian) along the eaves, a crest of lotus-bud tiles on the ridge, the line of hip-ridge beasts (zoushou) at each corner, and the owl-tail
// dragons (chiwen) at the ridge ends. It reads the same surface as ming's rectRoof (kind 'xieshan': h = y + R·t^p + sweep·corner²) so everything sits on the tiles.
import { fromTriangles } from '../../core/geom.js';
import { tube, blob } from '../chinese/statues.js';
import { lathe } from './util.js';

const RED = 'lacquer_red', GILT = 'gilt_bronze';
const flip = (t) => { const o = []; for (let i = 0; i < t.length; i += 9) o.push(t[i], t[i + 1], t[i + 2], t[i + 6], t[i + 7], t[i + 8], t[i + 3], t[i + 4], t[i + 5]); return o; };

/** o: { c: [cx, cz], A, B, y (eave), R (rise), sweep, alongZ, L (half-length of the ridge), top (ridge crown y) }. */
export function roofOrnament(bag, o) {
  const [cx, cz] = o.c, A = o.A, B = o.B, y = o.y, R = o.R, sw = o.sweep ?? 1, p = 1.7, gAt = 0.42;
  const rot = (x, z) => (o.alongZ ? [cx - (z - cz), cz + (x - cx)] : [x, z]);
  const P = (x, z, off = 0) => {
    const ax = Math.abs(x - cx), az = Math.abs(z - cz), ts = Math.max(0, Math.min(1, (B - az) / B));
    let te = Math.max(0, (A - ax) / B); if (te > gAt) te = 9;
    const t = Math.min(ts, te), corner = Math.max(0, 1 - te / 0.5) * Math.max(0, 1 - ts / 0.5);
    const [rx, rz] = rot(x, z); return [rx, y + R * Math.pow(t, p) + sw * corner * corner + off, rz];
  };
  const vec = (a, b) => (o.alongZ ? [-b, a] : [a, b]);
  // the loop of the eave inset by d: nl steps on the long sides, ns on the short ones
  const nl = Math.round(2 * A / 0.5), ns = Math.round(2 * B / 0.5);
  const loop = (d) => {
    const X = A - d, Z = B - d, out = [];
    for (let i = 0; i < nl; i++) out.push([cx - X + 2 * X * i / nl, cz - Z]);
    for (let i = 0; i < ns; i++) out.push([cx + X, cz - Z + 2 * Z * i / ns]);
    for (let i = 0; i < nl; i++) out.push([cx + X - 2 * X * i / nl, cz + Z]);
    for (let i = 0; i < ns; i++) out.push([cx - X, cz + Z - 2 * Z * i / ns]);
    return out;
  };
  // the red border: a strip 1.1 m wide a hand's breadth proud of the tiles, skirts down to them; the same in both windings
  { const a = loop(0.14).map(([x, z]) => P(x, z, 0.06)), b = loop(1.25).map(([x, z]) => P(x, z, 0.06)), a0 = loop(0.14).map(([x, z]) => P(x, z, -0.02)), b0 = loop(1.25).map(([x, z]) => P(x, z, -0.02)), t = [], n = a.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      t.push(...a[i], ...a[j], ...b[j], ...a[i], ...b[j], ...b[i]);
      t.push(...a0[i], ...a0[j], ...a[j], ...a0[i], ...a[j], ...a[i]);
      t.push(...b[i], ...b[j], ...b0[j], ...b[i], ...b0[j], ...b0[i]);
    }
    bag.add(RED, fromTriangles(t.concat(flip(t)))); }
  // the eave-end tiles: a round disc on the face of the eave with a gilt boss and two horn tips (the dragon's face, abstracted), every 0.36 m
  { const J = (i) => 1 + ((i * 37) % 13) * 0.0009;       // a millimetre apart, so the tiles merge instead of being drawn as instances
    const sides = [[0, -1, nl, A * 2], [1, 0, ns, B * 2], [0, 1, nl, A * 2], [-1, 0, ns, B * 2]];
    const lp = loop(0); let idx = 0;
    sides.forEach(([ox, oz, n, len], si) => {
      const [wx, wz] = vec(ox, oz), ang = Math.atan2(wx, wz);
      for (let i = 0; i < n; i++, idx++) {
        const q = lp[idx], f = i / n; if (f < 0.04 || f > 0.96) continue;     // not on the corner's sweep
        const e = P(q[0], q[1]), nudge = 0.04 * (((i * 7 + si * 3) % 5) / 5 - 0.4);   // a millimetre apart: merged, not instanced
        const ra = 0.115 + (idx % 20) * 0.0011, hb = 0.095 + Math.floor(idx / 20) % 17 * 0.0011, disc = lathe([[ra, 0], [ra, 0.02], [0.001, 0.05]], 6), boss = lathe([[0.05, 0.045], [0.001, hb]], 5);
        for (const [g, m] of [[disc, RED], [boss, GILT]]) bag.add(m, g.rotateX(Math.PI / 2).rotateY(ang).translate(e[0] + wx * 0.015, e[1] - 0.11 + nudge * 0.02, e[2] + wz * 0.015));
      }
    }); }
  // the crest of the ridge: lotus-bud tiles every 0.5 m
  const L = o.L, T = o.top;
  for (let x = -L + 0.4, i = 0; x <= L - 0.4; x += 0.5, i++) { const w = rot(cx + x, cz); bag.add(RED, lathe([[0.1 + i * 0.0011, 0], [0.09, 0.08], [0.05, 0.17], [0.001, 0.3 + i * 0.0013]], 6, null, w[0], T + 0.1, w[1])); }
  // the beasts of the hip ridges: an immortal on a hen, then four beasts, facing up the ridge
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    for (let k = 0; k < 5; k++) {
      const d = 0.55 + k * 0.62, q = P(cx + sx * (A - d), cz + sz * (B - d), 0.14), r = P(cx + sx * (A - d - 0.3), cz + sz * (B - d - 0.3), 0.14), ang = Math.atan2(r[0] - q[0], r[2] - q[2]);
      const at = (g) => g.rotateY(ang).translate(q[0], q[1], q[2]);
      if (k === 0) { bag.add(GILT, at(lathe([[0.001, 0], [0.1, 0.02], [0.07, 0.3], [0.001, 0.4]], 6))); bag.add(GILT, at(blob([0, 0.08, 0.1], 0.07, 0.09, 0.14, 7, 4))); }
      else { const s = 1 - k * 0.07; bag.add(GILT, at(blob([0, 0.1 * s, 0], 0.07 * s, 0.09 * s, 0.17 * s, 7, 4))); bag.add(GILT, at(blob([0, 0.22 * s, 0.14 * s], 0.05 * s, 0.06 * s, 0.07 * s, 6, 4))); bag.add(GILT, at(tube([[0, 0.1 * s, -0.12 * s, 0.025], [0, 0.26 * s, -0.22 * s, 0.015]], 4))); }
    }
  }
  // the owl-tail dragons at the ridge's ends: head at the foot biting the ridge, the body rising in an S, the tail curling in over the roof
  for (const s of [-1, 1]) {
    const W = (u, yy, r) => { const w = rot(cx + s * (L + u), cz); return [w[0], T + yy, w[1], r]; };
    bag.add(GILT, tube([W(0.1, 0.05, 0.3), W(0.32, 0.55, 0.27), W(0.3, 1.1, 0.23), W(0.05, 1.55, 0.17), W(-0.35, 1.78, 0.11), W(-0.62, 1.62, 0.06)], 10, 1.5));
    const h = W(-0.15, 0.28, 0), hw = [h[0], h[1], h[2]], hd = s * (o.alongZ ? 1 : 1);
    void hd; bag.add(GILT, blob(hw, 0.3, 0.26, 0.3, 9, 6));
    for (const q of [-1, 1]) { const b = W(-0.35, 0.34, 0); bag.add(GILT, tube([[b[0] + q * 0.12, b[1] + 0.1, b[2], 0.05], [b[0] + q * 0.16, b[1] + 0.2, b[2] + (o.alongZ ? -s * 0.3 : 0), 0.03]], 4)); }
  }
}
