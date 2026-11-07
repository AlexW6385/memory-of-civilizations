// The dais (shumidan) under the Amida of the Phoenix Hall (docs/settlements/heian-uji.md §10): a
// sumeru dais of black lacquer — a plinth, a recessed waist, a cap stepping out again — its waist
// divided by posts into panels, each framed by a cusped kōzama outline in gilt and holding a rosette
// of the imaginary flower (hōsōge) inlaid in mother-of-pearl; gilt bands along the mouldings and gilt
// plates over the corners.

import { box, lathe, fromTriangles } from '../../core/geom.js';

/** byodo_dais { rect: [x0, z0, x1, z1], y, h (1.0) } */
export function byodoDais(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, k = (el.h ?? 1.0) / 1.0, Y = (v) => y + v * k, L = 'lacquer_black', G = 'gilt_bronze', S = 'shell_inlay';
  const tier = (inset, v0, v1, mat = L) => bag.add(mat, box(x0 + inset, Y(v0), z0 + inset, x1 - inset, Y(v1), z1 - inset));
  tier(0, 0, 0.13); tier(0.05, 0.13, 0.19); tier(0.15, 0.19, 0.75); tier(0.05, 0.75, 0.81); tier(0, 0.81, 0.93); tier(-0.04, 0.93, 1.0);
  // gilt bands round the plinth's top and the cap's middle, a little proud of the lacquer
  for (const [inset, v0, v1] of [[-0.006, 0.085, 0.105], [-0.006, 0.855, 0.875], [-0.046, 0.965, 0.98]]) {
    const r = [x0 + inset, z0 + inset, x1 - inset, z1 - inset];
    for (const [a, b] of [[[r[0], r[1]], [r[2], r[1] + 0.012]], [[r[0], r[3] - 0.012], [r[2], r[3]]], [[r[0], r[1] + 0.012], [r[0] + 0.012, r[3] - 0.012]], [[r[2] - 0.012, r[1] + 0.012], [r[2], r[3] - 0.012]]]) bag.add(G, box(a[0], Y(v0), a[1], b[0], Y(v1), b[1]));
  }
  // the corner plates: bent sheets of gilt bronze over the cap's and the plinth's corners
  for (const [cx, cz, sx, sz] of [[x0, z0, 1, 1], [x1, z0, -1, 1], [x0, z1, 1, -1], [x1, z1, -1, -1]]) {
    for (const [v0, v1, o] of [[0.015, 0.115, 0.0], [0.825, 0.915, 0.0]]) {
      const ox = cx - sx * (o + 0.006), oz = cz - sz * (o + 0.006);
      bag.add(G, box(Math.min(ox, ox + sx * 0.2), Y(v0 + 0.01), Math.min(oz, oz + sz * 0.012), Math.max(ox, ox + sx * 0.2), Y(v1 - 0.01), Math.max(oz, oz + sz * 0.012)));
      bag.add(G, box(Math.min(ox, ox + sx * 0.012), Y(v0 + 0.012), Math.min(oz + sz * 0.012, oz + sz * 0.2), Math.max(ox, ox + sx * 0.012), Y(v1 - 0.012), Math.max(oz + sz * 0.012, oz + sz * 0.2)));
    }
  }
  // the waist's faces: posts dividing panels, in each a kōzama outline and a rosette
  const faces = [
    { a: [x0 + 0.15, z1 - 0.15], b: [x1 - 0.15, z1 - 0.15], n: [0, 1] }, { a: [x1 - 0.15, z0 + 0.15], b: [x0 + 0.15, z0 + 0.15], n: [0, -1] },
    { a: [x1 - 0.15, z1 - 0.15], b: [x1 - 0.15, z0 + 0.15], n: [1, 0] }, { a: [x0 + 0.15, z0 + 0.15], b: [x0 + 0.15, z1 - 0.15], n: [-1, 0] },
  ];
  const tris = new Map(), push = (m, ...p) => { const t = tris.get(m) ?? []; tris.set(m, t); t.push(...p.flat()); };
  for (const f of faces) {
    const len = Math.hypot(f.b[0] - f.a[0], f.b[1] - f.a[1]), u = [(f.b[0] - f.a[0]) / len, (f.b[1] - f.a[1]) / len], N = f.n;
    const P = (s, v, d) => [f.a[0] + u[0] * s + N[0] * d, Y(v), f.a[1] + u[1] * s + N[1] * d];
    // a quad seen from outside (the face's normal): s0→s1 along, v0→v1 up
    const quad = (m, s0, v0, s1, v1, d) => push(m, P(s0, v0, d), P(s1, v0, d), P(s1, v1, d), P(s0, v0, d), P(s1, v1, d), P(s0, v1, d));
    const n = Math.max(1, Math.round(len / 0.62)), w = len / n;
    for (let i = 0; i <= n; i++) {                                     // the posts, standing 2 cm proud
      const s = Math.min(len - 0.035, Math.max(0.035, i * w)), g = box(-0.035, Y(0.19) + 0.002, -0.01, 0.035, Y(0.75) - 0.002, 0.02);
      g.rotateY(Math.atan2(N[0], N[1])); const c = P(s, 0, 0); g.translate(c[0], 0, c[2]); bag.add(L, g);
    }
    for (let i = 0; i < n; i++) {
      const sa = i * w + 0.09, sb = (i + 1) * w - 0.09, sm = (sa + sb) / 2, hw = (sb - sa) / 2;
      // the kōzama: a flat foot, straight sides, the head in three cusps rising to a point; drawn as a gilt line
      const outline = [[sa, 0.25], [sb, 0.25], [sb, 0.56]];
      for (let j = 0; j <= 12; j++) { const t = j / 12, s = sb - t * (sb - sa), cusp = Math.abs(Math.sin(t * Math.PI * 3)) * 0.035; outline.push([s, 0.56 + 0.1 * Math.sin(t * Math.PI) + cusp]); }
      outline.push([sa, 0.25]);
      for (let j = 0; j < outline.length - 1; j++) {
        const [s0, v0] = outline[j], [s1, v1] = outline[j + 1], l = Math.hypot(s1 - s0, (v1 - v0) * k) || 1, ns = -(v1 - v0) * k / l * 0.008, nv = (s1 - s0) / l * 0.008 / k;
        push(G, P(s0 + ns, v0 + nv, 0.014), P(s1 + ns, v1 + nv, 0.014), P(s1 - ns, v1 - nv, 0.014), P(s0 + ns, v0 + nv, 0.014), P(s1 - ns, v1 - nv, 0.014), P(s0 - ns, v0 - nv, 0.014));
      }
      // the rosette: eight petals of shell round a gilt heart, four small leaves between
      const vc = 0.47, R = Math.min(hw * 0.55, 0.11);
      for (let p = 0; p < 8; p++) {
        const a = p / 8 * Math.PI * 2, c = [sm + Math.cos(a) * R * 0.55, vc + Math.sin(a) * R * 0.55 / k], ca = Math.cos(a), sa2 = Math.sin(a);
        const tip = [sm + ca * R, vc + sa2 * R / k], l1 = [c[0] - sa2 * R * 0.22, c[1] + ca * R * 0.22 / k], r1 = [c[0] + sa2 * R * 0.22, c[1] - ca * R * 0.22 / k], base = [sm + ca * R * 0.15, vc + sa2 * R * 0.15 / k];
        push(S, P(base[0], base[1], 0.003), P(r1[0], r1[1], 0.003), P(tip[0], tip[1], 0.003), P(base[0], base[1], 0.003), P(tip[0], tip[1], 0.003), P(l1[0], l1[1], 0.003));
        if (p % 2) { const a2 = a + Math.PI / 8, lt = [sm + Math.cos(a2) * R * 1.25, vc + Math.sin(a2) * R * 1.25 / k], lb = [sm + Math.cos(a2) * R * 0.8, vc + Math.sin(a2) * R * 0.8 / k], lw = 0.025; push(S, P(lb[0] - lw, lb[1], 0.003), P(lb[0] + lw, lb[1], 0.003), P(lt[0], lt[1], 0.003)); }
      }
      const hc = 0.028;
      for (let p = 0; p < 8; p++) { const a = p / 8 * Math.PI * 2, b = (p + 1) / 8 * Math.PI * 2; push(G, P(sm, vc, 0.014), P(sm + Math.cos(a) * hc, vc + Math.sin(a) * hc / k, 0.014), P(sm + Math.cos(b) * hc, vc + Math.sin(b) * hc / k, 0.014)); }
    }
  }
  // the triangles were wound by eye: make each face its face's way (toward its own normal by the centre's side)
  for (const [m, t] of tris) {
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    for (let i = 0; i < t.length; i += 9) {
      const e1 = [t[i + 3] - t[i], t[i + 4] - t[i + 1], t[i + 5] - t[i + 2]], e2 = [t[i + 6] - t[i], t[i + 7] - t[i + 1], t[i + 8] - t[i + 2]];
      const nx = e1[1] * e2[2] - e1[2] * e2[1], nz = e1[0] * e2[1] - e1[1] * e2[0];
      if (nx * (t[i] - cx) + nz * (t[i + 2] - cz) < 0) for (let q = 0; q < 3; q++) { const tmp = t[i + 3 + q]; t[i + 3 + q] = t[i + 6 + q]; t[i + 6 + q] = tmp; }
    }
    bag.add(m, fromTriangles(t));
  }
  col.rect(el.rect, y, Y(1.0));
}
