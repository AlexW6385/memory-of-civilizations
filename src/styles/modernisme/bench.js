// Pere Falqués's bench-lamps on the Passeig de Gràcia (1906; docs/settlements/barcelona.md §5c): a bench built
// onto the foot of each of the avenue's lamp posts, clad in white trencadís (broken glazed tile) — two seats back
// to back along a serpentine plan, their fronts rolled, the back between them rising to a pedestal in the middle
// from which the wrought-iron post goes up, ringed and moulded, to a head of scrolled arms with their lanterns.

import { fromTriangles, lathe, rod } from '../../core/geom.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** banc_fanal: { at: [x, z], y, rot (0: the long axis along z), seed } */
export function bancFanal(el, { bag, col }) {
  const [cx, cz] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, c = Math.cos(rot), s = Math.sin(rot), rand = rng(el.seed ?? 7);
  const W = (lx, ly, lz) => [cx + lx * c + lz * s, y + ly, cz - lx * s + lz * c];
  const HL = 2.1;                                                     // half the length
  // the cross-section at u (−1 … 1 along the bench): [w, h] points round from one seat's foot over the back to the other's
  const sec = (u) => {
    const a = Math.abs(u), end = Math.max(0, (a - 0.82) / 0.18), sw = 0.62 * Math.sqrt(Math.max(0, 1 - end * end * 0.75));
    const off = 0.14 * Math.sin(Math.PI * u), sh = 0.44 + 0.18 * end * end, bh = Math.max(sh + 0.05, 0.86 + 0.62 * Math.max(0, 1 - a / 0.3) ** 2 - 0.3 * end);
    const bw = 0.16 + 0.08 * Math.max(0, 1 - a / 0.3);
    const P = [[-sw, -0.05], [-sw, sh - 0.1], [-sw + 0.03, sh - 0.03], [-sw + 0.1, sh], [-bw - 0.06, sh], [-bw, sh + 0.08], [-bw, bh - 0.08], [-bw + 0.07, bh], [bw - 0.07, bh], [bw, bh - 0.08], [bw, sh + 0.08], [bw + 0.06, sh], [sw - 0.1, sh], [sw - 0.03, sh - 0.03], [sw, sh - 0.1], [sw, -0.05]];
    return P.map(([w, h]) => [w + off, h]);
  };
  // resample a section to pieces of about a tile's size, so that the surface breaks into shards
  // (each piece of the outline cut into the same number of shards on every section, from the middle one's lengths)
  const S0 = sec(0), cuts = S0.slice(1).map((p, i) => Math.max(1, Math.round(Math.hypot(p[0] - S0[i][0], p[1] - S0[i][1]) / 0.11)));
  const fine = (P) => { const out = [P[0]]; for (let i = 1; i < P.length; i++) { const n = cuts[i - 1]; for (let k = 1; k <= n; k++) out.push([P[i - 1][0] + (P[i][0] - P[i - 1][0]) * k / n, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * k / n]); } return out; };
  const NU = 34, rings = [];
  for (let i = 0; i <= NU; i++) { const u = -1 + 2 * i / NU; rings.push(fine(sec(u)).map(([w, h]) => [w, h, u * HL])); }
  const m = rings[0].length;
  // the shards: every vertex nudged a few millimetres, each quad split in two and dealt to one of two glazes
  const J = rings.map((R) => R.map(([w, h, z]) => W(w + (rand() - 0.5) * 0.012, h + (h > 0 ? (rand() - 0.5) * 0.012 : 0), z + (rand() - 0.5) * 0.012)));
  const A = [], B = [];
  for (let i = 0; i < NU; i++) for (let k = 0; k + 1 < m; k++) {
    const p = J[i][k], q = J[i + 1][k], r = J[i + 1][k + 1], t = J[i][k + 1];
    (rand() < 0.5 ? A : B).push(...p, ...q, ...r); (rand() < 0.5 ? A : B).push(...p, ...r, ...t);
  }
  // the ends closed (the section's own outline, fanned from its middle)
  for (const i of [0, NU]) {
    const R = J[i], mid = W(rings[i].reduce((a, v) => a + v[0], 0) / m, 0.3, rings[i][0][2]);
    for (let k = 0; k < m; k++) { const a = R[k], b = R[(k + 1) % m]; (rand() < 0.5 ? A : B).push(...mid, ...a, ...b, ...mid, ...b, ...a); }   // (both faces, the foot's edge too)
  }
  bag.add('tile_white', fromTriangles(A));
  bag.add('glaze_white', fromTriangles(B));
  const xs = rings.flatMap((R) => R.map(([w, , z]) => W(w, 0, z))), bx = xs.map((p) => p[0]), bz = xs.map((p) => p[2]);
  col.rect([Math.min(...bx), Math.min(...bz), Math.max(...bx), Math.max(...bz)], y, y + 0.48);
  // the lamp post from the pedestal: a moulded foot, the shaft with its rings, a leafy collar, the head
  const top = sec(0), py = Math.max(...top.map((p) => p[1])), [px, , pz] = W(0, 0, 0);
  bag.add('iron', lathe([[0.2, 0], [0.2, 0.06], [0.15, 0.1], [0.15, 0.22], [0.11, 0.3], [0.1, 0.6], [0.13, 0.66], [0.13, 0.72], [0.085, 0.8], [0.075, 2.6], [0.11, 2.66], [0.11, 2.74], [0.07, 2.82], [0.065, 4.4], [0.1, 4.46], [0.1, 4.54], [0.055, 4.6], [0.05, 5.0], [0.08, 5.06], [0.001, 5.12]], 12, null, px, y + py - 0.02, pz));
  col.circle(px, pz, 0.2, y, y + py + 5);
  // the collar of leaves at the shaft's middle: eight blades curling out and down
  for (let k = 0; k < 8; k++) {
    const a = k / 8 * Math.PI * 2, d = [Math.cos(a), Math.sin(a)], y0 = y + py + 2.72;
    const p0 = [px + d[0] * 0.08, y0, pz + d[1] * 0.08], p1 = [px + d[0] * 0.22, y0 + 0.16, pz + d[1] * 0.22], p2 = [px + d[0] * 0.3, y0 + 0.02, pz + d[1] * 0.3];
    bag.add('iron', rod(p0, p1, 0.028, 4)); bag.add('iron', rod(p1, p2, 0.022, 4));
  }
  // the head: four scrolled arms out from the top, each ending in a hanging lantern; a lantern crowning the post
  const hy = y + py + 4.5;
  for (let k = 0; k < 4; k++) {
    const a = rot + Math.PI / 4 + k * Math.PI / 2, d = [Math.sin(a), Math.cos(a)];
    const pts = [];
    for (let j = 0; j <= 10; j++) { const t = j / 10, r = 0.06 + 0.72 * t, h = 0.38 * Math.sin(Math.PI * t * 0.9) + 0.12 * t; pts.push([px + d[0] * r, hy + h, pz + d[1] * r]); }
    for (let j = 0; j < 10; j++) bag.add('iron', rod(pts[j], pts[j + 1], 0.03, 5));
    // the scroll under the arm: a curl back toward the post
    const sc = [];
    for (let j = 0; j <= 10; j++) { const t = j / 10, ang = Math.PI * 1.6 * t, rr = 0.16 * (1 - 0.6 * t); sc.push([px + d[0] * (0.42 - Math.sin(ang) * rr), hy + 0.16 - (1 - Math.cos(ang)) * rr * 0.9, pz + d[1] * (0.42 - Math.sin(ang) * rr)]); }
    for (let j = 0; j < 10; j++) bag.add('iron', rod(sc[j], sc[j + 1], 0.018, 4));
    bag.add('iron', rod([px + d[0] * 0.1, hy - 0.02, pz + d[1] * 0.1], [px + d[0] * 0.42, hy + 0.16, pz + d[1] * 0.42], 0.02, 4));
    // the lantern hanging from the arm's end: its hook, a crown, the glass, the foot and finial
    const e = pts[10], ly = e[1] - 0.12;
    bag.add('iron', rod(e, [e[0], ly, e[2]], 0.012, 4));
    bag.add('iron', lathe([[0.001, 0.2], [0.16, 0.08], [0.18, 0.04], [0.15, 0]], 8, null, e[0], ly - 0.2, e[2]));
    bag.add('lamp_glass', lathe([[0.15, 0], [0.17, -0.18], [0.12, -0.42], [0.06, -0.48]], 8, null, e[0], ly - 0.2, e[2]));
    bag.add('iron', lathe([[0.065, 0], [0.07, -0.04], [0.02, -0.1], [0.001, -0.16]], 8, null, e[0], ly - 0.68, e[2]));
  }
  bag.add('lamp_glass', lathe([[0.001, 0], [0.13, 0.05], [0.17, 0.25], [0.13, 0.48], [0.001, 0.5]], 10, null, px, y + py + 5.1, pz));
  bag.add('iron', lathe([[0.15, 0], [0.19, 0.04], [0.001, 0.2], [0.03, 0.32], [0.001, 0.4]], 10, null, px, y + py + 5.58, pz));
}
