// The canals' masonry (docs/settlements/amsterdam.md §6): brick quay walls with a sandstone coping and
// mooring posts along every canal, and the vaulted bridges — brick barrels under sandstone arch rings,
// high in the middle for the boats, with brick parapets — that carry the streets across.

import { sweep, box, lathe } from '../../core/geom.js';
import { prism, outline } from './facade.js';

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
  const L = el.L ?? 30, w = el.w ?? 6, y = el.y ?? 1, water = el.water ?? -1, bed = el.bed ?? -3, R = el.rise ?? 1.8;
  const F = { at: (u, d) => [cx + ux * u + vx * d, cz + uz * u + vz * d] };
  const deck = (t) => R * (1 - Math.abs(t) / (L / 2));                    // above y
  const arches = (el.arches ?? [[-3.5, 3.5, 2.4], [-9.2, -4.7, 1.4], [4.7, 9.2, 1.4]]).map(([a, b, r]) => { const S = b - a, Rr = (S * S / 4 + r * r) / (2 * r); return { a, b, r, Rr, m: (a + b) / 2 }; });
  const spring = water + 0.25 - y;
  const soffit = (t) => { for (const A of arches) if (t > A.a - 1e-6 && t < A.b + 1e-6) return spring + Math.sqrt(Math.max(0, A.Rr * A.Rr - (t - A.m) ** 2)) - (A.Rr - A.r); return null; };
  // the cuts along the crossing: every arch's ends, the crown, steps in between
  const ts = new Set([-L / 2, L / 2, 0]);
  for (const A of arches) for (let k = 0; k <= 8; k++) ts.add(A.a + (A.b - A.a) * k / 8);
  for (let t = -L / 2; t < L / 2; t += 1.5) ts.add(t);
  const T = [...ts].sort((a, b) => a - b);
  for (let i = 0; i < T.length - 1; i++) {
    const a = T[i], b = T[i + 1], m = (a + b) / 2, s = soffit(m);
    const ba = s === null ? bed - y : soffit(a) ?? spring, bb = s === null ? bed - y : soffit(b) ?? spring;
    const q = [[a, ba], [b, bb], [b, deck(b)], [a, deck(a)]];
    bag.add('brick', prism(F, y, q, -w / 2, w / 2));
    if (s !== null) for (const sd of [-1, 1]) bag.add(ST, prism(F, y, [[a, ba], [b, bb], [b, bb + 0.42], [a, ba + 0.42]], sd < 0 ? -w / 2 - 0.05 : w / 2 - 0.3, sd < 0 ? -w / 2 + 0.3 : w / 2 + 0.05));
    // the parapets: brick, a sandstone coping; walkers kept on the deck
    for (const sd of [-1, 1]) {
      const d0 = sd < 0 ? -w / 2 : w / 2 - 0.35, d1 = sd < 0 ? -w / 2 + 0.35 : w / 2;
      bag.add('brick', prism(F, y, [[a, deck(a) - 0.05], [b, deck(b) - 0.05], [b, deck(b) + 0.75], [a, deck(a) + 0.75]], d0, d1));
      bag.add(ST, prism(F, y, [[a, deck(a) + 0.75], [b, deck(b) + 0.75], [b, deck(b) + 0.9], [a, deck(a) + 0.9]], d0 - 0.05, d1 + 0.05));
      col.segment(F.at(a, sd * (w / 2 - 0.17)), F.at(b, sd * (w / 2 - 0.17)), 0.35, y + Math.min(deck(a), deck(b)), y + Math.max(deck(a), deck(b)) + 0.9);
    }
  }
  // the deck's paving: brick on edge, laid in a slightly proud strip
  for (let i = 0; i < T.length - 1; i++) { const a = T[i], b = T[i + 1]; bag.add('brick_paving', prism(F, y, [[a, deck(a)], [b, deck(b)], [b, deck(b) + 0.06], [a, deck(a) + 0.06]], -w / 2 + 0.35, w / 2 - 0.35)); }
  // walkable: the deck rastered in metre cells, each a floor at the deck's height there
  const step = 1.0;
  for (let t = -L / 2 + step / 2; t < L / 2; t += step) for (let d = -w / 2 + 0.6; d < w / 2 - 0.3; d += step) {
    const [x, z] = F.at(t, d); col.floor([x - 0.55, z - 0.55, x + 0.55, z + 0.55], y + deck(t) + 0.06);
  }
}
