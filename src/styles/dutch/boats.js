// The lighters of the canals (docs/settlements/amsterdam.md §5.10): goods came off the ships in the IJ and went
// "by barge along the canal" to the merchants' warehouses. The praam: a flat-bottomed open boat of tarred planks,
// bluff and round at both ends, its sheer rising to them; a short deck forward and aft, a pair of leeboards
// (zwaarden) hung on the sides and lifted, a rudder with its tiller; the hold laden with casks, bales or peat.

import { box, lathe, rod, fromTriangles } from '../../core/geom.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** praam: { at: [x, z], y (the water), rot (its length along +z turned by rot), len, load ('casks' | 'bales' | 'peat' | 'empty'), seed }. */
export function praam(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0, a = el.rot ?? 0, L = el.len ?? 11, B = L * 0.27, D = 0.95, rand = rng(el.seed || 1);
  const c = Math.cos(a), s = Math.sin(a);
  const W = (p) => [x + p[0] * c + p[2] * s, y + p[1], z - p[0] * s + p[2] * c];
  const put = (m, g) => { g.rotateY(a); g.translate(x, y, z); bag.add(m, g); };
  // the hull: stations along its length, each a flat bottom turning up hard into near-upright sides; both faces
  const n = 18, m = 8, T = [];
  const half = (t) => B / 2 * Math.pow(Math.max(0, 1 - Math.abs(2 * t - 1) ** 3), 0.42);
  const sheer = (t) => 0.42 + 0.32 * (2 * t - 1) ** 2;
  const P = (i, j) => {
    const t = i / n, u = j / m * 2 - 1, h = half(t), lift = Math.pow(Math.abs(2 * t - 1), 5) * 0.6;
    const yb = -0.5 + lift, yy = yb + (sheer(t) - yb) * Math.pow(Math.abs(u), 5);
    return [h * u * (0.88 + 0.12 * Math.abs(u)), yy, -L / 2 + L * t];
  };
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
    const p = P(i, j), q = P(i + 1, j), r = P(i + 1, j + 1), d = P(i, j + 1);
    T.push(...p, ...q, ...r, ...p, ...r, ...d, ...p, ...r, ...q, ...p, ...d, ...r);
  }
  put('tar_wood', fromTriangles(T));
  // the rubbing strake and the gunwale along the sheer on both sides, painted; the stem and stern posts
  for (const j of [0, m]) for (let i = 1; i < n - 1; i++) {
    const p = W(P(i, j)), q = W(P(i + 1, j));
    bag.add('shutter_green', rod([p[0], p[1] + 0.02, p[2]], [q[0], q[1] + 0.02, q[2]], 0.045, 5));
    const pl = W(P(i, j === 0 ? 1 : m - 1)), ql = W(P(i + 1, j === 0 ? 1 : m - 1)), k = 0.55;
    bag.add('timber', rod([p[0] * k + pl[0] * (1 - k), p[1] - 0.2, p[2] * k + pl[2] * (1 - k)], [q[0] * k + ql[0] * (1 - k), q[1] - 0.2, q[2] * k + ql[2] * (1 - k)], 0.035, 4));
  }
  for (const e of [0, n]) { const t = W(P(e, m / 2)); bag.add('timber', rod([t[0], y - 0.3, t[2]], [t[0], t[1] + 0.25, t[2]], 0.07, 6)); }
  // the decks fore and aft, the floor boards of the hold between, a thwart amidships
  const dk = (z0, z1, yy) => { const hw = Math.min(half((z0 + L / 2) / L), half((z1 + L / 2) / L)) * 0.84; put('timber', box(-hw, yy - 0.05, z0, hw, yy, z1)); };
  dk(-L / 2 + 0.6, -L / 2 + 1.7, 0.42); dk(L / 2 - 2.0, L / 2 - 0.6, 0.42);
  put('planks_grey', box(-B * 0.36, -0.42, -L / 2 + 1.7, B * 0.36, -0.38, L / 2 - 2.0));
  put('timber', box(-B * 0.47, 0.3, -0.12, B * 0.47, 0.36, 0.12));
  // the leeboards, hung on a bolt at the gunwale amidships and lifted: fans of planks, broad at the foot
  for (const sd of [-1, 1]) {
    const xs = sd * (B / 2 + 0.06), z0 = -0.4, Tq = [];
    const fan = [[0, 0.5, z0], [0, -0.35, z0 - 0.45], [0, -0.55, z0 - 1.25], [0, -0.35, z0 - 1.6], [0, 0.5, z0 - 0.25]];
    const q = fan.map(([, yy, zz]) => [xs, yy, zz]), qb = fan.map(([, yy, zz]) => [xs + sd * 0.05, yy, zz]);
    for (let i = 1; i < q.length - 1; i++) Tq.push(...q[0], ...q[i], ...q[i + 1], ...q[0], ...q[i + 1], ...q[i], ...qb[0], ...qb[i], ...qb[i + 1], ...qb[0], ...qb[i + 1], ...qb[i]);
    for (let i = 0; i < q.length; i++) { const j = (i + 1) % q.length; Tq.push(...q[i], ...qb[i], ...qb[j], ...q[i], ...qb[j], ...q[j], ...q[i], ...qb[j], ...qb[i], ...q[i], ...q[j], ...qb[j]); }
    const g = fromTriangles(Tq); g.rotateX(-sd * 0.0); put('tar_wood', g);
    put('iron', box(xs - 0.02, 0.38, z0 - 0.18, xs + sd * 0.08, 0.46, z0 - 0.06));
  }
  // the rudder hung on the sternpost, its tiller running inboard over the after deck
  { const t = P(n, m / 2); put('tar_wood', box(-0.05, -0.45, t[2] + 0.05, 0.05, 0.55, t[2] + 0.75)); put('timber', box(-0.035, 0.62, t[2] - 1.6, 0.035, 0.7, t[2] + 0.4)); }
  // the load in the hold
  const load = el.load ?? 'casks', zA = -L / 2 + 1.9, zB = L / 2 - 2.2;
  if (load === 'casks') {
    for (let zz = zA + 0.45; zz < zB - 0.4; zz += 0.95) for (const xx of [-0.45, 0.45]) {
      if (rand() < 0.15) continue;
      const g = lathe([[0.27, -0.42], [0.33, -0.2], [0.35, 0], [0.33, 0.2], [0.27, 0.42], [0.001, 0.42]], 12); g.rotateZ(Math.PI / 2); g.translate(xx * B / 2.6, -0.38 + 0.35, zz); put('wood_painted', g);
      for (const k of [-0.3, 0.3]) { const h = lathe([[0.34 - Math.abs(k) * 0.15, -0.02], [0.345 - Math.abs(k) * 0.15, 0.02], [0.001, 0.02]], 12); h.rotateZ(Math.PI / 2); h.translate(xx * B / 2.6 + k, -0.03, zz); put('iron', h); }
    }
  } else if (load === 'bales') {
    for (let zz = zA + 0.5; zz < zB - 0.5; zz += 0.9) for (const [xx, yy] of [[-0.5, 0], [0.5, 0], [0, 0.55]]) { if (rand() < 0.2) continue; const g = box(-0.42, 0, -0.38, 0.42, 0.52, 0.38); g.rotateY((rand() - 0.5) * 0.2); g.translate(xx * B / 2.4, -0.38 + yy, zz); put('sacking', g); }
  } else if (load === 'peat') {
    for (let zz = zA + 0.2; zz < zB - 0.2; zz += 0.5) { const hh = 0.55 + rand() * 0.3; put('pottery_dark', box(-B * 0.33, -0.38, zz - 0.22, B * 0.33, -0.38 + hh, zz + 0.22)); }
  }
}
