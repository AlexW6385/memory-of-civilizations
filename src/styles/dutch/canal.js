// The canals' masonry (docs/settlements/amsterdam.md §6): brick quay walls with a sandstone coping and
// mooring posts along every canal, and the vaulted bridges — brick barrels under sandstone arch rings,
// high in the middle for the boats, with brick parapets — that carry the streets across.

import { sweep, box, lathe } from '../../core/geom.js';
import { prism, outline } from './facade.js';
import { jit } from './gables.js';

const ST = 'sandstone_dressed';
const rect = (u0, v0, u1, v1) => [[u0, v0], [u1, v0], [u1, v1], [u0, v1], [u0, v0]];

/** quay_wall: { path: [[x, z]…], y (top), bed } — the wall along a canal's edge, its coping, posts at intervals. */
export function quayWall(el, { bag, col }) {
  const p = el.path, y = el.y ?? 1, bed = el.bed ?? -3;
  bag.add('brick', sweep(rect(-0.25, bed - y, 0.25, 0.1), p, y, false));
  bag.add(ST, sweep(rect(-0.32, 0.1, 0.32, 0.28), p, y, false));
  // the wall's courses of dark, wet brick below the water line: a band of grey stone at the waterline
  bag.add('brick_grey', sweep(rect(-0.27, (el.water ?? -1) - y - 0.6, 0.27, (el.water ?? -1) - y + 0.25), p, y, false));
  let acc = 0;
  for (let i = 1; i < p.length; i++) {
    const [ax, az] = p[i - 1], [bx, bz] = p[i], L = Math.hypot(bx - ax, bz - az);
    col.segment(p[i - 1], p[i], 0.5, y - 4, y + 0.28);
    acc += L;
    if (acc > 9) { acc = 0; const nx = -(bz - az) / L, nz = (bx - ax) / L, side = el.side ?? 1;
      const px = bx + nx * 0.7 * side, pz = bz + nz * 0.7 * side;                        // a wooden mooring post on the quay
      bag.add('timber', lathe([[0.12, 0], [0.12, 0.8], [0.14, 0.85], [0.001, 0.95]], 8, null, px, y + 0.28 - 0.3, pz));
      const rx = bx - nx * 0.3 * side, rz = bz - nz * 0.3 * side;                         // an iron mooring ring on the water face
      bag.add('iron', box(rx - 0.06, y - 0.55, rz - 0.06, rx + 0.06, y - 0.25, rz + 0.06)); }
  }
}

/**
 * canal_bridge: { c: [x, z], dir: [dx, dz] (the way it crosses), L (length), w (width), y (the quays), water,
 * bed, arches: [[t0, t1, rise]…] along the crossing, rise (of the deck at its crown) }.
 */
export function canalBridge(el, { bag, col }) {
  const [cx, cz] = el.c, n = Math.hypot(...el.dir), ux = el.dir[0] / n, uz = el.dir[1] / n, vx = -uz, vz = ux;
  const L = el.L ?? 30, w = el.w ?? 6, y = el.y ?? 1, water = el.water ?? -1, bed = el.bed ?? -3, R = el.rise ?? (el.draw ? 1.2 : 1.8), draw = !!el.draw, LF = 3.5;     // a drawbridge: the vaults at the sides, a timber leaf over the middle
  const F = { at: (u, d) => [cx + ux * u + vx * d, cz + uz * u + vz * d] };
  const deck = (t) => R * (1 - (draw ? Math.max(Math.abs(t), 4.7) : Math.abs(t)) / (L / 2));                    // above y
  const arches = (el.arches ?? (draw ? [[-9.2, -4.7, 1.4], [4.7, 9.2, 1.4]] : [[-3.5, 3.5, 2.4], [-9.2, -4.7, 1.4], [4.7, 9.2, 1.4]])).map(([a, b, r]) => { const S = b - a, Rr = (S * S / 4 + r * r) / (2 * r); return { a, b, r, Rr, m: (a + b) / 2 }; });
  const spring = water + 0.25 - y;
  const soffit = (t) => { for (const A of arches) if (t > A.a - 1e-6 && t < A.b + 1e-6) return spring + Math.sqrt(Math.max(0, A.Rr * A.Rr - (t - A.m) ** 2)) - (A.Rr - A.r); return null; };
  // the cuts along the crossing: every arch's ends, the crown, steps in between
  const ts = new Set([-L / 2, L / 2, 0]); if (draw) { ts.add(-LF); ts.add(LF); }
  for (const A of arches) for (let k = 0; k <= 8; k++) ts.add(A.a + (A.b - A.a) * k / 8);
  for (let t = -L / 2; t < L / 2; t += 1.5) ts.add(t);
  const T = [...ts].sort((a, b) => a - b);
  for (let i = 0; i < T.length - 1; i++) {
    const a = T[i], b = T[i + 1], m = (a + b) / 2, s = soffit(m);
    if (draw && m > -LF && m < LF) {                                          // the leaf: beams under planking, a timber balustrade
      bag.add('timber', prism(F, y, [[a, deck(a) - 0.42], [b, deck(b) - 0.42], [b, deck(b) - 0.06], [a, deck(a) - 0.06]], -w / 2, w / 2));
      bag.add('planks_grey', prism(F, y, [[a, deck(a) - 0.06], [b, deck(b) - 0.06], [b, deck(b) + 0.05], [a, deck(a) + 0.05]], -w / 2 + 0.3, w / 2 - 0.3));
      for (const sd of [-1, 1]) {
        const d0 = sd < 0 ? -w / 2 : w / 2 - 0.3, d1 = sd < 0 ? -w / 2 + 0.3 : w / 2;
        bag.add('timber', prism(F, y, [[a, deck(a) - 0.06], [b, deck(b) - 0.06], [b, deck(b) + 0.05], [a, deck(a) + 0.05]], d0, d1));
        for (const [v0, v1] of [[0.9, 1.02], [0.45, 0.53]]) bag.add('wood_dark', prism(F, y, [[a, deck(a) + v0], [b, deck(b) + v0], [b, deck(b) + v1], [a, deck(a) + v1]], d0 + 0.08, d1 - 0.08));
        bag.add('wood_dark', prism(F, y, [[a, deck(a) + 0.05], [a + 0.1, deck(a) + 0.05], [a + 0.1, deck(a) + 1.02], [a, deck(a) + 1.02]], d0 + 0.08, d1 - 0.08));
        col.segment(F.at(a, sd * (w / 2 - 0.15)), F.at(b, sd * (w / 2 - 0.15)), 0.2, y + Math.min(deck(a), deck(b)), y + Math.max(deck(a), deck(b)) + 1.02);
      }
      continue;
    }
    const ba = s === null ? bed - y : soffit(a) ?? spring, bb = s === null ? bed - y : soffit(b) ?? spring;
    const q = [[a, ba], [b, bb], [b, deck(b)], [a, deck(a)]];
    bag.add('brick', prism(F, y, q, -w / 2, w / 2));
    if (s !== null) for (const sd of [-1, 1]) bag.add(ST, prism(F, y, [[a, ba], [b, bb], [b, bb + 0.42], [a, ba + 0.42]], sd < 0 ? -w / 2 - 0.05 : w / 2 - 0.3, sd < 0 ? -w / 2 + 0.3 : w / 2 + 0.05));
    // the arch ring in dressed voussoirs, every second one standing proud, and a string course under the parapet (docs §5.19)
    if (s !== null) for (const sd of [-1, 1]) {
      const o0 = sd < 0 ? -w / 2 - 0.11 : w / 2 + 0.05, o1 = sd < 0 ? -w / 2 - 0.05 : w / 2 + 0.11;
      if (i % 2) bag.add(ST, prism(F, y, [[a + 0.03, ba - 0.02], [b - 0.03, bb - 0.02], [b - 0.03, bb + 0.58], [a + 0.03, ba + 0.58]], o0, o1));
    }
    for (const sd of [-1, 1]) bag.add(ST, prism(F, y, [[a, deck(a) - 0.22], [b, deck(b) - 0.22], [b, deck(b) - 0.05], [a, deck(a) - 0.05]], sd < 0 ? -w / 2 - 0.07 : w / 2 - 0.3, sd < 0 ? -w / 2 + 0.3 : w / 2 + 0.07));
    // the parapets: brick, a sandstone coping; walkers kept on the deck
    for (const sd of [-1, 1]) {
      const d0 = sd < 0 ? -w / 2 : w / 2 - 0.35, d1 = sd < 0 ? -w / 2 + 0.35 : w / 2;
      bag.add('brick', prism(F, y, [[a, deck(a) - 0.05], [b, deck(b) - 0.05], [b, deck(b) + 0.75], [a, deck(a) + 0.75]], d0, d1));
      bag.add(ST, prism(F, y, [[a, deck(a) + 0.75], [b, deck(b) + 0.75], [b, deck(b) + 0.9], [a, deck(a) + 0.9]], d0 - 0.05, d1 + 0.05));
      col.segment(F.at(a, sd * (w / 2 - 0.17)), F.at(b, sd * (w / 2 - 0.17)), 0.35, y + Math.min(deck(a), deck(b)), y + Math.max(deck(a), deck(b)) + 0.9);
    }
  }
  // the keystone of each vault, and at the four ends of the parapets the stone piers with their pyramid caps and balls
  for (const A of arches) for (const sd of [-1, 1]) { const o0 = sd < 0 ? -w / 2 - 0.18 : w / 2 + 0.05, o1 = sd < 0 ? -w / 2 - 0.05 : w / 2 + 0.18, k = Math.min(0.32, A.Rr * 0.12);
    bag.add(ST, prism(F, y, [[A.m - k, spring + A.r - 0.02], [A.m + k, spring + A.r - 0.02], [A.m + k * 1.25, spring + A.r + 0.78], [A.m - k * 1.25, spring + A.r + 0.78]], o0, o1)); }
  for (const t of [-L / 2, L / 2]) for (const sd of [-1, 1]) {
    const dk = deck(t), t0 = t < 0 ? t : t - 0.6, d0 = sd < 0 ? -w / 2 - 0.05 : w / 2 - 0.55, d1 = sd < 0 ? -w / 2 + 0.55 : w / 2 + 0.05, tc = t0 + 0.3, dc = (d0 + d1) / 2;
    bag.add(ST, prism(F, y, [[t0, dk - 0.3], [t0 + 0.6, dk - 0.3], [t0 + 0.6, dk + 0.3], [t0, dk + 0.3]], d0 - 0.04, d1 + 0.04));
    bag.add(ST, prism(F, y, [[t0 + 0.04, dk + 0.3], [t0 + 0.56, dk + 0.3], [t0 + 0.56, dk + 1.25], [t0 + 0.04, dk + 1.25]], d0, d1));
    bag.add(ST, prism(F, y, [[t0 - 0.05, dk + 1.25], [t0 + 0.65, dk + 1.25], [t0 + 0.6, dk + 1.35], [t0, dk + 1.35]], d0 - 0.05, d1 + 0.05));
    const [bx, bz] = F.at(tc, dc); bag.add(ST, lathe([[0.2 + jit(), 0], [0.12, 0.05], [0.16, 0.1], [0.19, 0.22], [0.12, 0.34], [0.001, 0.4 + jit()]], 8, null, bx, y + dk + 1.35, bz));
  }
  // the deck's paving: brick on edge, laid in a slightly proud strip
  for (let i = 0; i < T.length - 1; i++) { const a = T[i], b = T[i + 1]; if (draw && (a + b) / 2 > -LF && (a + b) / 2 < LF) continue; bag.add('brick_paving', prism(F, y, [[a, deck(a)], [b, deck(b)], [b, deck(b) + 0.06], [a, deck(a) + 0.06]], -w / 2 + 0.35, w / 2 - 0.35)); }
  // walkable: the deck rastered in metre cells, each a floor at the deck's height there
  const step = 1.0;
  for (let t = -L / 2 + step / 2; t < L / 2; t += step) for (let d = -w / 2 + 0.6; d < w / 2 - 0.3; d += step) {
    const [x, z] = F.at(t, d); col.floor([x - 0.55, z - 0.55, x + 0.55, z + 0.55], y + deck(t) + 0.06);
  }
  if (draw) {
    // the lifting gear: a pair of posts on the pier (the staanders), a balance beam over each with its lead counterweight at the
    // tail and a chain from its nose down to the leaf's end, a cross-tie between the posts over the roadway
    const tp = -4.1, dk = deck(tp), top = dk + 4.6, ct = [-3.0, 3.2];
    for (const sd of [-1, 1]) {
      const d0 = sd < 0 ? -w / 2 + 0.02 : w / 2 - 0.32, d1 = sd < 0 ? -w / 2 + 0.32 : w / 2 - 0.02;
      bag.add('timber', prism(F, y, [[tp - 0.15, dk - 0.05], [tp + 0.15, dk - 0.05], [tp + 0.15, top], [tp - 0.15, top]], d0, d1));
      bag.add('timber', prism(F, y, [[-6.4, top - 0.22], [ct[1], top - 0.22], [ct[1], top + 0.02], [-6.4, top + 0.02]], d0 + 0.05, d1 - 0.05));
      bag.add('lead', prism(F, y, [[-6.7, top - 0.95], [-5.9, top - 0.95], [-5.9, top - 0.22], [-6.7, top - 0.22]], d0 + 0.02, d1 - 0.02));
      bag.add('iron', prism(F, y, [[ct[1] - 0.025, deck(LF) + 0.05], [ct[1] + 0.025, deck(LF) + 0.05], [ct[1] + 0.025, top - 0.22], [ct[1] - 0.025, top - 0.22]], (d0 + d1) / 2 - 0.025, (d0 + d1) / 2 + 0.025));
      bag.add('iron', prism(F, y, [[tp - 0.2, top - 0.3], [tp + 0.2, top - 0.3], [tp + 0.2, top - 0.25], [tp - 0.2, top - 0.25]], d0 - 0.02, d1 + 0.02));
      const p = F.at(tp - 0.15, d0), q = F.at(tp + 0.15, d1); col.rect([Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])], y + dk, y + top);
    }
    bag.add('timber', prism(F, y, [[tp - 0.1, top - 0.6], [tp + 0.1, top - 0.6], [tp + 0.1, top - 0.35], [tp - 0.1, top - 0.35]], -w / 2 + 0.3, w / 2 - 0.3));
  }
}
