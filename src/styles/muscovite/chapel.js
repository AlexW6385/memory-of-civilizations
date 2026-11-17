// The eight side chapels of St Basil's about 1600 (docs/settlements/muscovy.md §5.4): each a faceted drum of red
// brick on its white-stone plinth, the corners ruled with white pilasters, a white belt and a cornice, in each face
// a tall window in a white surround under a keel-shaped hood, a frieze of little blind arches under the cornice;
// the four great chapels on the axes hollow and entered from the platform through a portal of receding orders,
// their inside a brick octagon with white belts, a vault painted with stars, a low iconostasis opposite the
// door, a lamp and a candle stand. The four small ones on the diagonals are solid. Tops (kokoshniks, drum, dome)
// are added by the caller.

import { box, lathe, rod, fromTriangles, orientOutward } from '../../core/geom.js';
import { orientedBox } from '../../core/build.js';
import { Shape, Path } from '../../core/three.js';
import { hexa, slab } from '../norse/index.js';
import { kokoshnikShape } from './index.js';
import { saint } from './dormition.js';

const BR = 'brick_kremlin', WS = 'limestone', G = 'gilt_bronze';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** A convex prism on a regular n-gon (circumradius rad, vertex 0 at angle ph) from y0 to y1, closed, normals outward. */
export function ngon(bag, m, cx, cz, rad, n, ph, y0, y1) {
  const t = [], V = (i, y) => [cx + Math.cos(ph + i * 2 * Math.PI / n) * rad, y, cz + Math.sin(ph + i * 2 * Math.PI / n) * rad];
  for (let i = 0; i < n; i++) {
    const a = V(i, y0), b = V(i + 1, y0), c = V(i + 1, y1), d = V(i, y1), o0 = [cx, y0, cz], o1 = [cx, y1, cz];
    t.push(...a, ...b, ...c, ...a, ...c, ...d, ...o0, ...a, ...b, ...o1, ...c, ...d);
  }
  bag.add(m, fromTriangles(orientOutward(t)));
}

/**
 * o = { x, z (the centre), yb (the platform), r (the circumradius of the body), h (its height), n (faces), a0 (the angle of face 0's
 * middle: the way out), hollow (a great chapel: entered by face 0), seed }.
 */
export function chapel(bag, col, lights, o) {
  const { x, z, yb, r, h, n, a0, hollow = false } = o, rand = rng(o.seed ?? 1561), step = 2 * Math.PI / n, cs = Math.cos(step / 2);
  const th = (j) => a0 + (j - 0.5) * step;                                            // the angle of vertex j; face j runs from vertex j to j + 1, its middle at a0 + j·step
  const V = (rad, j) => [x + Math.cos(th(j)) * rad, z + Math.sin(th(j)) * rad];
  const lerp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
  const ri = r - 1.4, ra = r * cs, ria = ri * cs, Li = 2 * ri * Math.sin(step / 2);
  const dwf = 1.2 / Li, dh = 2.65, ow = dwf * 2 * r * Math.sin(step / 2) / 2;       // the door: 1.2 m on the inside, splayed to the outside
  /** A piece of face j between the fractions t0..t1 along it, y0..y1, circumradii a (inner) to b (outer). */
  const piece = (m, j, t0, t1, y0, y1, a, b, walls = false) => {
    const i0 = lerp(V(a, j), V(a, j + 1), t0), i1 = lerp(V(a, j), V(a, j + 1), t1), o0 = lerp(V(b, j), V(b, j + 1), t0), o1 = lerp(V(b, j), V(b, j + 1), t1);
    bag.add(m, hexa([[i0[0], y0, i0[1]], [i1[0], y0, i1[1]], [o1[0], y0, o1[1]], [o0[0], y0, o0[1]], [i0[0], y1, i0[1]], [i1[0], y1, i1[1]], [o1[0], y1, o1[1]], [o0[0], y1, o0[1]]]));
    if (walls) col.segment(lerp(i0, o0, 0.5), lerp(i1, o1, 0.5), (b - a) * 0.9, y0, y1);
  };
  /** A box on face j: u along it from its middle (+ to the left looking at it), the distances d0..d1 out from the apothem plane at radius `rad`. */
  const fbox = (m, j, u0, u1, y0, y1, d0, d1, rad = ra) => {
    const am = a0 + j * step, nx = Math.cos(am), nz = Math.sin(am), tx = -nz, tz = nx, cx = x + nx * (rad + (d0 + d1) / 2), cz = z + nz * (rad + (d0 + d1) / 2);
    bag.add(m, orientedBox([cx + tx * u0, cz + tz * u0], [cx + tx * u1, cz + tz * u1], d1 - d0, y0, y1));
  };
  /** A slab shape on face j, its x from the left end (u0) to the right (u1), at distance d from the plane, thickness t. */
  const fslab = (m, j, shape, u0, u1, y, d, t, rad = ra) => {
    const am = a0 + j * step, nx = Math.cos(am), nz = Math.sin(am), tx = -nz, tz = nx, px = x + nx * (rad + d), pz = z + nz * (rad + d);
    bag.add(m, slab(shape, t, [px + tx * u0, pz + tz * u0], [px + tx * u1, pz + tz * u1], y, 8));
  };

  // ---- the walls
  if (hollow) {
    for (let j = 0; j < n; j++) {
      if (j === 0) { piece(BR, j, 0, 0.5 - dwf / 2, yb, yb + h, ri, r, true); piece(BR, j, 0.5 + dwf / 2, 1, yb, yb + h, ri, r, true); piece(BR, j, 0.5 - dwf / 2, 0.5 + dwf / 2, yb + dh, yb + h, ri, r); }
      else piece(BR, j, 0, 1, yb, yb + h, ri, r, true);
    }
  } else { ngon(bag, BR, x, z, r, n, th(0), yb, yb + h); col.circle(x, z, r, yb, yb + h); }
  // the roof deck over the drum and its ledge, from which the neck rises
  ngon(bag, BR, x, z, r - 0.15, n, th(0), yb + h - 0.2, yb + h + 0.15);

  // ---- the outside: plinth, belt, cornice, pilasters on the corners
  for (let j = 0; j < n; j++) {
    const dd = hollow && j === 0 ? [[0, 0.5 - dwf / 2 - 0.02], [0.5 + dwf / 2 + 0.02, 1]] : [[0, 1]];
    for (const [t0, t1] of dd) piece(WS, j, t0, t1, yb, yb + 0.7, r - 0.2, r + 0.18);
    piece(WS, j, 0, 1, yb + 0.7, yb + 0.82, r - 0.2, r + 0.1);                                 // the plinth's cap
    piece(WS, j, 0, 1, yb + h * 0.34, yb + h * 0.34 + 0.22, r - 0.2, r + 0.07);                // the belt under the windows
    piece(WS, j, 0, 1, yb + h - 0.45, yb + h - 0.15, r - 0.2, r + 0.26); piece(WS, j, 0, 1, yb + h - 0.15, yb + h, r - 0.2, r + 0.4);   // the cornice, two steps
    const vo = V(r + 0.12, j), vi = V(r - 0.25, j), p0 = vi, p1 = vo, vh = yb + h - 0.45;
    bag.add(WS, orientedBox(p0, p1, 0.4, yb + 0.82, vh));                                       // the pilaster on vertex j
    bag.add(WS, orientedBox(vi, V(r + 0.2, j), 0.52, vh - 0.22, vh));                           // its capital
    bag.add(WS, orientedBox(vi, V(r + 0.2, j), 0.52, yb + 0.82, yb + 1.02));                    // its base
    // the window of the face (not the door's): the opening, the white surround, the sill, the keel-shaped hood above it
    if (!(hollow && j === 0)) {
      const wa = hollow ? 0.45 : 0.34, y0 = yb + h * 0.42, y1 = yb + h * 0.72;
      fbox('opening', j, -wa, wa, y0, y1, 0, 0.02);
      fbox(WS, j, wa, wa + 0.2, y0 - 0.1, y1 + 0.1, 0, 0.09); fbox(WS, j, -wa - 0.2, -wa, y0 - 0.1, y1 + 0.1, 0, 0.09);
      fbox(WS, j, -wa - 0.3, wa + 0.3, y0 - 0.2, y0 - 0.02, 0, 0.16);
      fbox(WS, j, -wa - 0.2, wa + 0.2, y1, y1 + 0.16, 0, 0.1);
      const hw = wa + 0.45; fslab(WS, j, kokoshnikShape(2 * hw, 0.05, 0.75), -hw, hw, y1 + 0.16, 0.05, 0.1);
    }
    // the frieze of little blind arches under the cornice: a white band with its arches cut out, the brick showing in them
    { const L = 2 * r * Math.sin(step / 2) - 0.7, na = Math.max(2, Math.round(L / 1.05)), bw = L / na, sh = new Shape();
      sh.moveTo(0, 0); sh.lineTo(L, 0); sh.lineTo(L, 0.95); sh.lineTo(0, 0.95); sh.lineTo(0, 0);
      for (let q = 0; q < na; q++) { const c = (q + 0.5) * bw, rr = bw * 0.36, p = new Path(); p.moveTo(c - rr, 0.1); p.lineTo(c + rr, 0.1); p.lineTo(c + rr, 0.5); p.absarc(c, 0.5, rr, 0, Math.PI, false); p.lineTo(c - rr, 0.1); sh.holes.push(p); }
      fslab(WS, j, sh, -L / 2, L / 2, yb + h - 1.75, 0.03, 0.05); }
  }
  if (!hollow) return;

  // ---- the door's portal outside: three receding orders of white stone round the splayed opening, the oak leaves open
  { const am = a0, nx = Math.cos(am), nz = Math.sin(am), tx = -nz, tz = nx, hq = dh - ow;
    [[0.46, 0.26], [0.30, 0.14], [0.14, 0]].forEach(([wo, wi], q) => {
      const w = ow + wo, hi = ow + wi, sh = new Shape(); sh.moveTo(-w, 0); sh.lineTo(w, 0); sh.lineTo(w, hq); sh.absarc(0, hq, w, 0, Math.PI, false); sh.lineTo(-w, 0);
      const hole = new Path(); hole.moveTo(-hi, 0); hole.lineTo(-hi, hq); hole.absarc(0, hq, hi, Math.PI, 0, true); hole.lineTo(hi, 0); hole.lineTo(-hi, 0); sh.holes.push(hole);
      const d = 0.1 + (2 - q) * 0.02, off = ra + 0.04 + q * 0.12 + d / 2, c = [x + nx * off, z + nz * off];
      bag.add(WS, slab(sh, d, c, [c[0] + tx, c[1] + tz], yb, 10));
    });
    for (const e of [-1, 1]) { const c = [x + nx * (ra + 0.3) + tx * e * (ow + 0.18), z + nz * (ra + 0.3) + tz * e * (ow + 0.18)]; bag.add('wood_dark', orientedBox([c[0] - nx * 0.45, c[1] - nz * 0.45], [c[0] + nx * 0.45, c[1] + nz * 0.45], 0.07, yb, yb + dh - 0.1)); }   // the leaves, swung back against the splay
  }

  // ---- inside: the floor, the white belts, the panes, the vault painted with stars, the iconostasis opposite the door
  const ph = th(0), ceil = yb + h * 0.78, ey = (u, w) => [x + Math.cos(a0) * w - Math.sin(a0) * u, z + Math.sin(a0) * w + Math.cos(a0) * u];
  ngon(bag, 'brick_paving', x, z, ri * 1.001, n, ph, yb - 0.01, yb + 0.03);
  for (let j = 0; j < n; j++) {
    const dd = j === 0 ? [[0, 0.5 - dwf / 2 - 0.02], [0.5 + dwf / 2 + 0.02, 1]] : [[0, 1]];
    for (const [t0, t1] of dd) piece(WS, j, t0, t1, yb + 0.03, yb + 0.45, ri - 0.06, ri);
    for (const yy of [yb + h * 0.34, ceil - 0.4]) piece(WS, j, 0, 1, yy, yy + 0.25, ri - 0.05, ri);
    if (j !== 0) {
      const am = a0 + j * step, nx = Math.cos(am), nz = Math.sin(am), tx = -nz, tz = nx, c0 = [x + nx * ria, z + nz * ria], w = 0.45, P = (u, v, d) => [c0[0] + tx * u - nx * d, v, c0[1] + tz * u - nz * d];
      for (const [y0, y1] of [[yb + h * 0.42, yb + h * 0.72]]) bag.add('glass_lamp', hexa([P(-w, y0, 0.005), P(w, y0, 0.005), P(w, y0, 0.02), P(-w, y0, 0.02), P(-w, y1, 0.005), P(w, y1, 0.005), P(w, y1, 0.02), P(-w, y1, 0.02)]));
      for (const [u0, u1, y0, y1] of [[-w - 0.18, -w, yb + h * 0.42 - 0.1, yb + h * 0.72 + 0.1], [w, w + 0.18, yb + h * 0.42 - 0.1, yb + h * 0.72 + 0.1], [-w - 0.18, w + 0.18, yb + h * 0.72, yb + h * 0.72 + 0.14], [-w - 0.18, w + 0.18, yb + h * 0.42 - 0.12, yb + h * 0.42]])
        bag.add(WS, hexa([P(u0, y0, 0.005), P(u1, y0, 0.005), P(u1, y0, 0.045), P(u0, y0, 0.045), P(u0, y1, 0.005), P(u1, y1, 0.005), P(u1, y1, 0.045), P(u0, y1, 0.045)]));
    }
  }
  // the vault: a shallow pyramid of eight facets (twelve-faced like the room) over the room, its underside painted with stars
  { const t = [], ap = [x, ceil + 1.7, z], C = (j) => { const p = V(ri * 1.01, j); return [p[0], ceil, p[1]]; };
    for (let j = 0; j < n; j++) { const a = ap, b = C(j), c = C(j + 1); t.push(...a, ...c, ...b); }                       // wound to face down, into the room
    bag.add('vault_stars', fromTriangles(t));
    ngon(bag, 'plaster_white', x, z, ri * 1.01, n, ph, ceil + 1.7, ceil + 1.76);                                             // the top of the vault, closed
    bag.add(G, lathe([[0.3, 0], [0.12, 0.1], [0.001, 0.14]], 10, null, x, ceil + 1.62, z)); }                                // a boss at its crown
  // the iconostasis opposite the door: a screen of one tier and a deesis row under a cornice, the royal doors in its middle
  { const wI = -(ria - 1.5), uh = 1.55, sh = 3.6, F = yb + 0.03;                   // its face looks to the door
    const E = (m, u0, u1, v0, v1, w0, w1) => { const a = ey(u0, (w0 + w1) / 2), b = ey(u1, (w0 + w1) / 2); bag.add(m, orientedBox(a, b, w1 - w0, v0, v1)); };
    E('wood_dark', -uh, uh, F, F + sh, wI - 0.07, wI + 0.07);
    col.segment(ey(-uh, wI), ey(uh, wI), 0.16, F, F + sh);
    E(G, -uh, uh, F, F + 0.4, wI + 0.07, wI + 0.12);                                                                       // the gilt dado
    E(G, -uh, uh, F + sh - 0.25, F + sh, wI + 0.07, wI + 0.15);                                                            // the cornice
    for (const [ti, [v0, ih]] of [[F + 0.55, 1.5], [F + 2.2, 1.1]].entries()) {
      const n2 = ti === 0 ? 4 : 5, iw = ti === 0 ? 0.52 : 0.4, gap = (2 * uh - 0.3 - n2 * iw) / (n2 + 1);
      for (let q = 0; q < n2; q++) {
        const uc = -uh + 0.15 + gap * (q + 1) + iw * (q + 0.5);
        if (ti === 0 && q === 2) continue;
        E(G, uc - iw / 2 - 0.04, uc + iw / 2 + 0.04, v0 - 0.04, v0 + ih + 0.04, wI + 0.07, wI + 0.1);
        E('mosaic_gold', uc - iw / 2, uc + iw / 2, v0, v0 + ih, wI + 0.1, wI + 0.115);
        saint(bag, (u, v, d) => { const p = ey(uc - u, wI + 0.115 + d); return [p[0], v0 + ih * 0.06 + v, p[1]]; }, [Math.cos(a0), 0, Math.sin(a0)], ih * 0.86, 0.002, rand, 'gold');
      }
    }
    E(G, -0.38, 0.38, F + 0.4, F + 1.95, wI + 0.07, wI + 0.14);                                                            // the royal doors, gilt, a little proud
    E('mosaic_gold', -0.3, 0.3, F + 0.5, F + 1.85, wI + 0.14, wI + 0.155);
    E(G, -0.03, 0.03, F + sh, F + sh + 0.9, wI - 0.03, wI + 0.03);                                                         // the cross over it
    E(G, -0.26, 0.26, F + sh + 0.5, F + sh + 0.56, wI - 0.03, wI + 0.03);
    // the lamp before the royal doors, a candle stand beside, a lectern
    const lp = ey(0, wI + 1.1), lx = lp[0], lz = lp[1], ly = yb + 3.4;
    bag.add('bronze', rod([lx, ly + 2.6, lz], [lx, ly + 0.1, lz], 0.006, 4));
    bag.add('glass_topaz', lathe([[0.001, -0.1], [0.05, -0.08], [0.07, -0.02], [0.06, 0], [0.001, 0]], 10, null, lx, ly, lz));
    bag.add('flame', lathe([[0.001, 0], [0.012, 0.012], [0.001, 0.05]], 6, null, lx, ly + 0.01, lz));
    lights?.push({ at: [lx, ly + 0.2, lz], color: '#ffb46b', intensity: 3.5, distance: 9 });
    const cu = ey(1.5, wI + 1.0), cx2 = cu[0], cz2 = cu[1];
    bag.add('bronze', lathe([[0.22, 0], [0.2, 0.05], [0.045, 0.16], [0.04, 0.9], [0.2, 0.95], [0.22, 1.0], [0.001, 1.0]], 12, null, cx2, F, cz2));
    for (let q = 0; q < 5; q++) { const a = q / 5 * Math.PI * 2, rr = q ? 0.14 : 0; bag.add('linen', lathe([[0.011, 0], [0.011, 0.19], [0.003, 0.2]], 6, null, cx2 + Math.cos(a) * rr, F + 1.0, cz2 + Math.sin(a) * rr)); bag.add('flame', lathe([[0.001, 0], [0.01, 0.012], [0.001, 0.04]], 5, null, cx2 + Math.cos(a) * rr, F + 1.2, cz2 + Math.sin(a) * rr)); }
    col.circle(cx2, cz2, 0.24, F, F + 1.1);
    const lc = ey(-1.5, wI + 1.0);
    bag.add('wood_dark', lathe([[0.2, 0], [0.16, 0.05], [0.06, 0.12], [0.05, 0.95], [0.001, 0.95]], 8, null, lc[0], F, lc[1]));
    bag.add('wood_dark', box(lc[0] - 0.3, F + 0.95, lc[1] - 0.3, lc[0] + 0.3, F + 1.0, lc[1] + 0.3)); col.circle(lc[0], lc[1], 0.3, F, F + 1.05);
  }
}
