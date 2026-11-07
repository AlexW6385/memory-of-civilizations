// A Nabataean banqueting hall cut in a rock outcrop (docs/settlements/petra.md §14), after the triclinium opposite the
// Roman Soldier's Tomb in the Wadi Farasa: three doorways in the dressed front, a large window over each; inside,
// the walls articulated with engaged columns and niches, cornices over the niches, painted stucco; the three
// benches of the diners round the walls with their mattresses and cushions, the low table with the gold cups
// (Strabo: companies of thirteen, two musicians, eleven cups each, every one of gold), wine jars, lamps.

import { box, lathe, fromTriangles } from '../../core/geom.js';

const R = 'sandstone_rose', ST = 'stucco', RED = 'stucco_red';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/**
 * triclinium: { at: [x, z] (the middle of its front), y (the floor), w, d, h (the hall inside), seed } — its front faces
 * south (+z); the outcrop stands back from it, its rough top rising some metres over the hall.
 */
export function triclinium(el, { bag, col, lights }) {
  const [cx, fz] = el.at, y = el.y ?? 0, W = el.w ?? 11, D = el.d ?? 9, H = el.h ?? 5.6, t = 1.6, rand = rng(el.seed ?? 50);
  const x0 = cx - W / 2, x1 = cx + W / 2, z1 = fz - t, z0 = z1 - D;                          // the hall inside
  const solid = (r, y0, y1, mat = R) => { bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); col.rect(r, y0, y1); };
  const top = y + H + 3.2;
  // ---- the rock: back and side walls of living rock, the roof of rock over the hall, rough lumps on top and at the flanks
  const rt = y + H + 0.8;
  solid([x0 - t, z0 - t, x1 + t, z0], y - 3, rt); solid([x0 - t, z0, x0, z1], y - 3, rt); solid([x1, z0, x1 + t, z1], y - 3, rt);
  solid([x0, z0, x1, z1], y + H, rt);
  // the outcrop's rounded, weathered mass over and round the hall, cut off flat a little behind the dressed front
  { const sx = W / 2 + t + 6.4, sz = D + t + 7.9, Hd = H + 8.4, zc = fz - 0.3, prof = [];
    for (let i = 0; i <= 8; i++) { const f = i / 8; prof.push([Math.max(0.001, Math.cbrt(1 - f * f * f)), f]); }
    const g = lathe(prof, 40, (th, i) => 1 + (i < 8 ? 0.11 * Math.sin(th * 3 + 1.3) + 0.07 * Math.sin(th * 7 + i) + 0.04 * Math.cos(th * 11 - i * 2) : 0));
    const P = g.attributes.position, T = [];
    // (the cut face is left out where it lies wholly behind the dressed front: else it would close the doorways)
    const behind = (X, Yv, Z) => Z >= zc - 1e-6 && X > x0 - t && X < x1 + t && Yv < top;
    for (let i = 0; i < P.count; i += 3) {
      const V = [0, 1, 2].map((k) => [cx + P.getX(i + k) * sx, y - 1.2 + P.getY(i + k) * Hd, Math.min(zc, zc + P.getZ(i + k) * sz)]);
      if (V.every((v) => behind(...v))) continue;
      T.push(...V[0], ...V[1], ...V[2]);
    }
    bag.add(R, fromTriangles(T));
    for (const r of [[cx - sx * 0.85, zc - sz * 0.8, x0 - t, zc], [x1 + t, zc - sz * 0.8, cx + sx * 0.85, zc], [x0 - t, zc - sz * 0.85, x1 + t, z0 - t]]) col.rect(r, y - 1, y + Hd * 0.7);
    col.floor([cx - sx * 0.7, zc - sz * 0.7, cx + sx * 0.7, zc], y + Hd * 0.7); }
  // ---- the front: dressed, with three doorways and a large window over each, a plain fascia and cornice above ----------
  const dw = 1.7, dh = 3.3, ww = 1.3, wy0 = y + 3.9, wy1 = y + 5.0, xs = [cx - W / 4, cx, cx + W / 4];
  let p = x0 - t;
  for (const xc of xs) {
    solid([p, z1, xc - dw / 2, fz], y - 3, top);
    solid([xc - dw / 2, z1, xc + dw / 2, fz], y + dh, wy0); solid([xc - dw / 2, z1, xc + dw / 2, fz], wy1, top);
    // the window narrower than the door: its jambs
    for (const s of [-1, 1]) bag.add(R, box(s < 0 ? xc - dw / 2 : xc + ww / 2, wy0, z1, s < 0 ? xc - ww / 2 : xc + dw / 2, wy1, fz));
    // the door's frame: a raised architrave round it, a sill of stone
    for (const s of [-1, 1]) bag.add('sandstone_rose_ashlar', box(xc + s * dw / 2 - (s < 0 ? 0.28 : 0), y, fz, xc + s * dw / 2 + (s > 0 ? 0.28 : 0), y + dh + 0.28, fz + 0.06));
    bag.add('sandstone_rose_ashlar', box(xc - dw / 2 - 0.28, y + dh, fz, xc + dw / 2 + 0.28, y + dh + 0.28, fz + 0.06));
    bag.add('sandstone_rose_ashlar', box(xc - dw / 2, y - 0.2, z1, xc + dw / 2, y + 0.04, fz + 0.3));
    p = xc + dw / 2;
  }
  solid([p, z1, x1 + t, fz], y - 3, top);
  bag.add('sandstone_rose_ashlar', box(x0 - t, y + H + 1.0, fz, x1 + t, y + H + 1.35, fz + 0.12));         // the fascia
  bag.add('sandstone_rose_ashlar', box(x0 - t - 0.15, y + H + 1.35, fz, x1 + t + 0.15, y + H + 1.6, fz + 0.3));   // the cornice
  // ---- inside: the floor; the walls stuccoed white over a red dado, engaged columns and niches with cornices --------
  bag.add('sandstone_floor', box(x0, y - 0.2, z0, x1, y + 0.02, z1)); col.floor([x0, z0, x1, z1], y + 0.02);
  const bh = 0.85, bd = 1.9;                                                                              // the benches' height and depth
  for (const [ax, at, a0, a1, n] of [['z', z0, x0, x1, 1], ['x', x0, z0, z1, 1], ['x', x1, z0, z1, -1]]) {
    // the stucco skin and the red dado above the benches (on the wall face, inside)
    const P = (u, v, w) => (ax === 'z' ? [u, v, at + w] : [at + n * w, v, u]);
    const B = (mat, u0, v0, u1, v1, w0, w1) => { const a = P(u0, v0, w0), b = P(u1, v1, w1); bag.add(mat, box(Math.min(a[0], b[0]), a[1], Math.min(a[2], b[2]), Math.max(a[0], b[0]), b[1], Math.max(a[2], b[2]))); };
    const ua = a0, ub = a1;
    B(ST, ua, y + bh, ub, y + H, 0, 0.02); B(RED, ua, y + bh, ub, y + bh + 0.5, 0.02, 0.03);
    // engaged columns (half-drums) every 2.2 m, a niche with its cornice between each pair
    const L = ub - ua, m = Math.max(2, Math.round(L / 2.2)), sp = L / m;
    for (let i = 0; i <= m; i++) {
      const u = ua + i * sp, c = P(u, y + bh, 0), g = lathe([[0.2, 0], [0.18, H - bh - 0.6], [0.26, H - bh - 0.45], [0.26, H - bh - 0.3]], 12, null, c[0], c[1], c[2]);
      bag.add(ST, g);
    }
    for (let i = 0; i < m; i++) {
      const u = ua + (i + 0.5) * sp;
      B('paint_ochre', u - 0.35, y + bh + 1.0, u + 0.35, y + bh + 2.3, 0.03, 0.04);                       // the niche's painted back
      for (const s of [-1, 1]) B(ST, u + s * 0.35 - (s < 0 ? 0.1 : 0), y + bh + 1.0, u + s * 0.35 + (s > 0 ? 0.1 : 0), y + bh + 2.3, 0.02, 0.24);
      B(ST, u - 0.5, y + bh + 2.3, u + 0.5, y + bh + 2.48, 0.02, 0.32); B(ST, u - 0.45, y + bh + 0.92, u + 0.45, y + bh + 1.0, 0.02, 0.3);    // the cornice over it, the sill
    }
    B(ST, ua, y + H - 0.3, ub, y + H, 0.02, 0.22);                                                         // the cornice round the top
  }
  // ---- the three benches, their mattresses and cushions; the table, cups, jug and bowls; wine jars by the door; lamps --
  const benches = [[x0, z0, x1, z0 + bd], [x0, z0 + bd, x0 + bd, z1 - 0.9], [x1 - bd, z0 + bd, x1, z1 - 0.9]];
  for (const r of benches) { solid(r, y, y + bh); col.floor(r, y + bh); bag.add('sandstone_rose_ashlar', box(r[0] - 0.03, y + bh - 0.08, r[1] - 0.03, r[2] + 0.03, y + bh, r[3] + 0.03)); }
  const cushions = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_red', 'cloth_green'];
  benches.forEach((r, bi) => {
    const along = r[2] - r[0] > r[3] - r[1], L = along ? r[2] - r[0] : r[3] - r[1], n = Math.floor((L - 0.4) / 1.25);
    for (let k = 0; k < n; k++) {
      const u = (along ? r[0] : r[1]) + 0.3 + k * 1.25;
      const q = along ? [u, r[1] + 0.15, u + 1.15, r[3] - 0.15] : [r[0] + 0.15, u, r[2] - 0.15, u + 1.15];
      bag.add('linen', box(q[0], y + bh, q[1], q[2], y + bh + 0.1, q[3]));
      // the bolster against the wall
      const c = cushions[(k + bi) % cushions.length], wb = along ? [q[0] + 0.1, q[1], q[2] - 0.1, q[1] + 0.3] : bi === 1 ? [q[0], q[1] + 0.1, q[0] + 0.3, q[3] - 0.1] : [q[2] - 0.3, q[1] + 0.1, q[2], q[3] - 0.1];
      bag.add(c, box(wb[0], y + bh + 0.1, wb[1], wb[2], y + bh + 0.38, wb[3]));
    }
  });
  const tx = cx, tz = (z0 + bd + z1 - 0.9) / 2 - 0.4;
  bag.add('wood_dark', lathe([[0.001, 0.5], [0.75, 0.5], [0.75, 0.56], [0.001, 0.56]], 20, null, tx, y, tz));
  for (const a of [0, 2.1, 4.2]) bag.add('wood_dark', box(tx + Math.cos(a) * 0.5 - 0.04, y, tz + Math.sin(a) * 0.5 - 0.04, tx + Math.cos(a) * 0.5 + 0.04, y + 0.5, tz + Math.sin(a) * 0.5 + 0.04));
  col.circle(tx, tz, 0.75, y, y + 0.56);
  for (let k = 0; k < 11; k++) { const a = k / 11 * Math.PI * 2; bag.add('gold', lathe([[0.001, 0], [0.025, 0], [0.03, 0.02], [0.045, 0.08], [0.04, 0.085], [0.001, 0.03]], 10, null, tx + Math.cos(a) * 0.58, y + 0.56, tz + Math.sin(a) * 0.58)); }
  bag.add('bronze', lathe([[0.001, 0], [0.07, 0], [0.16, 0.12], [0.17, 0.22], [0.12, 0.3], [0.13, 0.33], [0.001, 0.31]], 14, null, tx, y + 0.56, tz));   // the mixing bowl
  for (const [dx, dz] of [[-0.3, 0.12], [0.28, -0.15]]) bag.add('terracotta', lathe([[0.001, 0], [0.05, 0], [0.13, 0.05], [0.12, 0.06], [0.04, 0.015], [0.001, 0.012]], 12, null, tx + dx, y + 0.56, tz + dz));
  for (const s of [-1, 1]) for (let k = 0; k < 2; k++) {
    const ax2 = cx + s * (W / 8) + (k - 0.5) * 0.55, az = z1 - 0.45;
    bag.add('terracotta', lathe([[0.04, 0], [0.09, 0.08], [0.2, 0.3], [0.21, 0.42], [0.12, 0.6], [0.06, 0.68], [0.07, 0.75], [0.001, 0.75]], 12, null, ax2, y + 0.02, az));
  }
  // lamps burning on the niches' sills of the back wall
  const nb = Math.max(2, Math.round(W / 2.2)), sp = W / nb;
  for (let i = 0; i < nb; i++) {
    if (i % 2) continue;
    const u = x0 + (i + 0.5) * sp, ly = y + bh + 1.0, lz = z0 + 0.18;
    bag.add('terracotta', lathe([[0.001, 0], [0.05, 0.005], [0.06, 0.025], [0.03, 0.04], [0.001, 0.035]], 10, null, u, ly, lz));
    bag.add('flame', box(u + 0.04, ly + 0.03, lz - 0.01, u + 0.06, ly + 0.07, lz + 0.01));
    lights.push({ at: [u, ly + 0.3, lz + 0.5], color: '#ffb46b', intensity: 2.5, distance: 7 });
  }
}
