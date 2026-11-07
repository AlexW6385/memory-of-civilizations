// The central church of St Basil's (the Intercession) inside, as about 1600 (docs/settlements/muscovy.md §1,
// "St Basil's inside"): a tall octagon rising into the hollow of its tent — 46 m inside on a floor of only some
// 64 m² — its walls of bare red brick or brick painted on, with white ornament: the plinth, the bands under and
// over the windows, a frieze of little arches, the cornice at the tent's foot, the tent's ribs and belts; the
// windows' white surrounds; a low iconostasis across the east, a hanging candle-ring (horos) and candle stands.

import { box, lathe, rod } from '../../core/geom.js';
import { Shape, Path } from '../../core/three.js';
import { hexa, slab } from '../norse/index.js';
import { saint } from './dormition.js';

const BR = 'brick_kremlin', WS = 'limestone', G = 'gilt_bronze';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/**
 * The hollow octagon and tent at (cx, yb, cz), scale s: replaces the solid church. Outer circumradius Ro, the inner
 * Ri; the door in face `door` (face k spans the angles k·45° … (k+1)·45°, x = cos, z = sin). Returns nothing.
 */
export function intercession(bag, col, lights, cx, cz, yb, s, { Ro = 7.5 * s, Ri = 5.0 * s, door = 4 } = {}) {
  const V = (r, k) => [cx + Math.cos(k * Math.PI / 4) * r, cz + Math.sin(k * Math.PI / 4) * r];
  const lerp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  const H1 = 20 * s, H2 = 25 * s, rand = rng(1561);
  /** A piece of face k between the fractions t0..t1 along it, from y0 to y1, radii a (inner) to b (outer). */
  const piece = (m, k, t0, t1, y0, y1, a = Ri, b = Ro) => {
    const i0 = lerp(V(a, k), V(a, k + 1), t0), i1 = lerp(V(a, k), V(a, k + 1), t1), o0 = lerp(V(b, k), V(b, k + 1), t0), o1 = lerp(V(b, k), V(b, k + 1), t1);
    bag.add(m, hexa([[i0[0], y0, i0[1]], [i1[0], y0, i1[1]], [o1[0], y0, o1[1]], [o0[0], y0, o0[1]], [i0[0], y1, i0[1]], [i1[0], y1, i1[1]], [o1[0], y1, o1[1]], [o0[0], y1, o0[1]]]));
    if (m === BR) col.segment(lerp(i0, o0, 0.5), lerp(i1, o1, 0.5), (b - a) * 0.9, y0, y1);
  };
  const Li = 2 * Ri * Math.sin(Math.PI / 8), dw = 1.5 * s / Li, dh = 3.4 * s;
  for (let k = 0; k < 8; k++) {
    if (k === door) { piece(BR, k, 0, 0.5 - dw / 2, yb, yb + H1); piece(BR, k, 0.5 + dw / 2, 1, yb, yb + H1); piece(BR, k, 0.5 - dw / 2, 0.5 + dw / 2, yb + dh, yb + H1); }
    else piece(BR, k, 0, 1, yb, yb + H1);
    piece(BR, k, 0, 1, yb + H1, yb + H2, Ri, 7.29 * s);                                    // the drum of the kokoshnik tiers, closed over at its top
  }
  // the floor: brick laid in the octagon at the platform's level
  bag.add('brick_paving', lathe([[Ri + 0.01, 0], [Ri + 0.01, 0.03], [0.001, 0.03]], 8, null, cx, yb - 0.01, cz));
  // the door's white-stone portal outside: three receding orders round the splayed opening, and its oak leaves open
  { const oc = lerp(V(Ro, door), V(Ro, door + 1), 0.5), ang = (door + 0.5) * Math.PI / 4, nx = Math.cos(ang), nz = Math.sin(ang), tx = -nz, tz = nx;
    for (let q = 0; q < 3; q++) {
      const w = 1.15 * s + q * 0.28, h = dh + 0.25 + q * 0.28, out = 0.06 + q * 0.0, d = 0.12 + q * 0.1;
      const sh = new Shape(); sh.moveTo(-w, 0); sh.lineTo(w, 0); sh.lineTo(w, h); sh.absarc(0, h, w, 0, Math.PI, false); sh.lineTo(-w, 0);
      const hole = new Path(); const wi = w - 0.22; hole.moveTo(-wi, 0); hole.lineTo(-wi, h); hole.absarc(0, h, wi, Math.PI, 0, true); hole.lineTo(wi, 0); hole.lineTo(-wi, 0); sh.holes.push(hole);
      const c = [oc[0] + nx * (out + d / 2 - 0.02 * q), oc[1] + nz * (out + d / 2 - 0.02 * q)];
      bag.add(WS, slab(sh, d, c, [c[0] + tx, c[1] + tz], yb, 10));
    }
  }
  // the iconostasis across the east: a low screen of two tiers (the local row with the royal doors, the Deesis) facing west
  const xf = cx + 2.9 * s, zh = 3.75 * s, F = yb + 0.02;
  bag.add('wood_dark', box(xf, F, cz - zh, xf + 0.2, F + 5.4, cz + zh)); col.rect([xf - 0.1, cz - zh, xf + 0.2, cz + zh], F, F + 5.4);
  const icon = (zc, v0, ih, iw) => {
    bag.add(G, box(xf - 0.07, v0 - 0.05, zc - iw / 2 - 0.05, xf, v0 + ih + 0.05, zc + iw / 2 + 0.05));
    bag.add('mosaic_gold', box(xf - 0.09, v0, zc - iw / 2, xf - 0.07, v0 + ih, zc + iw / 2));
    saint(bag, (u, v, d) => [xf - 0.09 - d, v0 + ih * 0.06 + v, zc - u], [-1, 0, 0], ih * 0.86, 0.002, rand, 'gold');
  };
  for (const [ti, [v0, ih, iw]] of [[F + 0.5, 1.9, 1.0], [F + 3.0, 1.6, 0.85]].entries()) {
    const span = 2 * zh - 0.4, n = Math.floor(span / (iw + 0.16)), step = span / n;
    bag.add(G, box(xf - 0.14, v0 + ih + 0.07, cz - zh, xf, v0 + ih + 0.25, cz + zh));
    for (let q = 0; q < n; q++) { const zc = cz - zh + 0.2 + (q + 0.5) * step; if (ti === 0 && Math.abs(zc - cz) < 0.9) continue; icon(zc, v0, ih, iw); }
  }
  bag.add(G, box(xf - 0.14, F, cz - zh, xf, F + 0.45, cz + zh));
  { const sh = new Shape(), w = 1.5, h = 2.1; sh.moveTo(0, 0); sh.lineTo(w, 0); sh.lineTo(w, h); sh.absarc(w / 2, h, w / 2, 0, Math.PI, false); sh.lineTo(0, 0);
    bag.add(G, slab(sh, 0.08, [xf - 0.1, cz - w / 2], [xf - 0.1, cz + w / 2], F + 0.45, 10));
    for (const e of [-1, 1]) bag.add('mosaic_gold', box(xf - 0.155, F + 0.85, cz + (e < 0 ? -0.66 : 0.06), xf - 0.14, F + 2.3, cz + (e < 0 ? -0.06 : 0.66))); }
  bag.add(G, box(xf + 0.05, F + 5.4, cz - 0.06, xf + 0.17, F + 7.2, cz + 0.06)); bag.add(G, box(xf + 0.05, F + 6.4, cz - 0.55, xf + 0.17, F + 6.52, cz + 0.55));
  // ---- the painted ornament in white on the brick: the plinth, belts, the frieze of little arches, the cornice
  const band = (k, y0, y1, r0, out, t0 = 0, t1 = 1) => piece(WS, k, t0, t1, y0, y1, r0 - out, r0);
  for (let k = 0; k < 8; k++) {
    const dd = k === door ? [[0, 0.5 - dw / 2 - 0.02], [0.5 + dw / 2 + 0.02, 1]] : [[0, 1]];
    for (const [t0, t1] of dd) band(k, yb + 0.02, yb + 0.45, Ri, 0.06, t0, t1);
    for (const yy of [8.3, 14.6]) band(k, yb + yy * s, yb + yy * s + 0.3, Ri, 0.05);
    band(k, yb + H1 - 0.5, yb + H1, Ri, 0.12); band(k, yb + H2 - 0.35, yb + H2, Ri, 0.16);
    // the frieze of little blind arches under the cornice: a white band with its arches cut out, the brick showing in them
    const a = lerp(V(Ri - 0.035, k), V(Ri - 0.035, k + 1), 0.0), b = lerp(V(Ri - 0.035, k), V(Ri - 0.035, k + 1), 1), L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = 5, bw = L / n;
    const sh = new Shape(); sh.moveTo(0.04, 0); sh.lineTo(L - 0.04, 0); sh.lineTo(L - 0.04, 1.1); sh.lineTo(0.04, 1.1); sh.lineTo(0.04, 0);
    for (let q = 0; q < n; q++) { const c = (q + 0.5) * bw, r = bw * 0.36, p = new Path(); p.moveTo(c - r, 0.12); p.lineTo(c + r, 0.12); p.lineTo(c + r, 0.62); p.absarc(c, 0.62, r, 0, Math.PI, false); p.lineTo(c - r, 0.12); sh.holes.push(p); }
    bag.add(WS, slab(sh, 0.05, a, b, yb + H1 - 1.75, 6));
    // the window in each face but the door's and the east two (behind the iconostasis): its splayed white surround, the pane
    if (k !== door) {
      const c0 = lerp(V(Ri, k), V(Ri, k + 1), 0.5), ang = (k + 0.5) * Math.PI / 4, nx = Math.cos(ang), nz = Math.sin(ang), tx = -nz, tz = nx, w = 0.55 * s;
      const P = (u, v, d) => [c0[0] + tx * u - nx * d, v, c0[1] + tz * u - nz * d];
      bag.add('glass_lamp', hexa([P(-w, yb + 9 * s, 0.005), P(w, yb + 9 * s, 0.005), P(w, yb + 9 * s, 0.02), P(-w, yb + 9 * s, 0.02), P(-w, yb + 13.5 * s, 0.005), P(w, yb + 13.5 * s, 0.005), P(w, yb + 13.5 * s, 0.02), P(-w, yb + 13.5 * s, 0.02)]));
      for (const [u0, u1, v0, v1] of [[-w - 0.25, -w, 8.75, 13.75], [w, w + 0.25, 8.75, 13.75], [-w - 0.25, w + 0.25, 13.5, 13.75], [-w - 0.25, w + 0.25, 8.75, 9]])
        bag.add(WS, hexa([P(u0, yb + v0 * s, 0.005), P(u1, yb + v0 * s, 0.005), P(u1, yb + v0 * s, 0.045), P(u0, yb + v0 * s, 0.045), P(u0, yb + v1 * s, 0.005), P(u1, yb + v1 * s, 0.005), P(u1, yb + v1 * s, 0.045), P(u0, yb + v1 * s, 0.045)]));
    }
  }
  // ---- the tent inside: eight brick faces narrowing to its top, white ribs on its edges and three white belts
  const rT = (y) => Ri + (0.95 - Ri) * (y - (yb + H2)) / (17.6 * s), yT = yb + H2 + 17.6 * s;
  for (let k = 0; k < 8; k++) {
    const Q = (r, kk, yy) => { const p = V(r, kk); return [p[0], yy, p[1]]; }, y0 = yb + H2, y1 = yT, t = 0.14;
    bag.add(BR, hexa([Q(rT(y0), k, y0), Q(rT(y0), k + 1, y0), Q(rT(y0) + t, k + 1, y0), Q(rT(y0) + t, k, y0), Q(rT(y1), k, y1), Q(rT(y1), k + 1, y1), Q(rT(y1) + t, k + 1, y1), Q(rT(y1) + t, k, y1)]));
    bag.add(WS, rod(Q(rT(y0) - 0.02, k, y0), Q(rT(y1) - 0.02, k, y1), 0.09, 5));
    for (const f of [0.28, 0.55, 0.8]) { const ya = y0 + (y1 - y0) * f, yb2 = ya + 0.3; bag.add(WS, hexa([Q(rT(ya) - 0.04, k, ya), Q(rT(ya) - 0.04, k + 1, ya), Q(rT(ya) + 0.01, k + 1, ya), Q(rT(ya) + 0.01, k, ya), Q(rT(yb2) - 0.04, k, yb2), Q(rT(yb2) - 0.04, k + 1, yb2), Q(rT(yb2) + 0.01, k + 1, yb2), Q(rT(yb2) + 0.01, k, yb2)])); }
  }
  bag.add(BR, lathe([[1.15, 0], [1.15, 0.14], [0.001, 0.14]], 8, null, cx, yT, cz));
  // ---- the horos: a candle-ring hung on a chain from the tent, and two candle stands before the iconostasis
  { const ly = yb + 6.5 * s; bag.add('iron', rod([cx, yT, cz], [cx, ly + 0.5, cz], 0.02, 5));
    for (let q = 0; q < 4; q++) { const a = q * Math.PI / 2; bag.add('iron', rod([cx, ly + 0.5, cz], [cx + Math.cos(a) * 1.6, ly, cz + Math.sin(a) * 1.6], 0.012, 4)); }
    bag.add('bronze', lathe([[1.57, 0], [1.63, 0], [1.63, 0.08], [1.57, 0.08], [1.57, 0]], 24, null, cx, ly, cz));
    for (let q = 0; q < 16; q++) { const a = q / 16 * Math.PI * 2, x = cx + Math.cos(a) * 1.6, z = cz + Math.sin(a) * 1.6; bag.add('linen', lathe([[0.014, 0], [0.014, 0.2], [0.003, 0.21]], 6, null, x, ly + 0.08, z)); bag.add('flame', lathe([[0.001, 0], [0.012, 0.015], [0.001, 0.05]], 5, null, x, ly + 0.29, z)); }
    lights?.push({ at: [cx, ly + 0.3, cz], color: '#ffb46b', intensity: 5, distance: 14 });
    for (const zc of [cz - 1.7, cz + 1.7]) {
      const sx = xf - 1.6;
      bag.add('bronze', lathe([[0.26, 0], [0.24, 0.05], [0.05, 0.18], [0.045, 1.0], [0.24, 1.05], [0.26, 1.1], [0.001, 1.1]], 12, null, sx, F, zc));
      for (let q = 0; q < 5; q++) { const a = q / 5 * Math.PI * 2, r = q ? 0.16 : 0; bag.add('linen', lathe([[0.011, 0], [0.011, 0.2], [0.003, 0.21]], 6, null, sx + Math.cos(a) * r, F + 1.1, zc + Math.sin(a) * r)); bag.add('flame', lathe([[0.001, 0], [0.01, 0.012], [0.001, 0.04]], 5, null, sx + Math.cos(a) * r, F + 1.31, zc + Math.sin(a) * r)); }
      col.circle(sx, zc, 0.26, F, F + 1.2);
    }
  }
}
