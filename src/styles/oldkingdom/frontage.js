// The outsides of Giza's stone buildings at eye level (docs/settlements/giza.md §14): the pyramid temples' plinths, the roll
// and cavetto cornice on the wall tops, the lintels over the doorways, the torus roll up each corner; the causeway's plinth,
// its cornice along the roof's edge and the painted night sky under its roof. Elements (laid over ok_temple / causeway with
// the same arguments): ok_temple_dress { rect, h, door, backDoor, th }, ok_causeway_dress { a, b, w, h, ya, yb, gap }.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';

/** The temple's outside: plinth of core stone, cornice and torus on the wall tops, a lintel over each doorway. */
export function templeDress(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, h = el.h ?? 7, th = el.th ?? 2.2, o = th / 2, dh = Math.min(4.7, h - 1.2);
  const doorSide = { n: 0, e: 1, s: 2, w: 3 }[el.door || 'e'], back = (doorSide + 2) % 4;
  // each wall: its end points, its outward direction, and the doorway on it (along the wall, from–to) or none
  const zc = (z0 + z1) / 2, xc = (x0 + x1) / 2;
  const W = [
    { a: [x0, z0], b: [x1, z0], n: [0, -1], gap: null },
    { a: [x1, z0], b: [x1, z1], n: [1, 0], gap: null },
    { a: [x1, z1], b: [x0, z1], n: [0, 1], gap: null },
    { a: [x0, z1], b: [x0, z0], n: [-1, 0], gap: null },
  ];
  W[doorSide].gap = true; if (el.backDoor) W[back].gap = true;
  const gapRange = (i) => (i === 0 || i === 2 ? [xc - 2, xc + 2] : [zc - 2, zc + 2]);
  const strip = (mat, i, from, to, d0, d1, y0, y1) => {
    // a box along wall i (from..to as plan coordinates along the wall's axis), d0..d1 out from the wall's axis
    const horiz = i === 0 || i === 2, s = W[i].n[horiz ? 1 : 0];
    const e0 = s * d0, e1 = s * d1, lo = Math.min(e0, e1), hi = Math.max(e0, e1), c = horiz ? W[i].a[1] : W[i].a[0];
    bag.add(mat, horiz ? box(from, y0, c + lo, to, y1, c + hi) : box(c + lo, y0, from, c + hi, y1, to));
  };
  W.forEach((w, i) => {
    const horiz = i === 0 || i === 2, a0 = horiz ? Math.min(w.a[0], w.b[0]) : Math.min(w.a[1], w.b[1]), a1 = horiz ? Math.max(w.a[0], w.b[0]) : Math.max(w.a[1], w.b[1]);
    const spans = w.gap ? [[a0 - o - 0.3, gapRange(i)[0]], [gapRange(i)[1], a1 + o + 0.3]] : [[a0 - o - 0.3, a1 + o + 0.3]];
    for (const [s0, s1] of spans) {
      strip('limestone_core', i, s0, s1, o, o + 0.28, 0, 0.5);                 // the plinth, a course of the dark core stone, a little proud
      strip('limestone_core', i, s0, s1, o + 0.1, o + 0.3, 0.5, 0.62);          // its chamfered top
      strip('tura_limestone', i, s0 + 0.0, s1, -o - 0.05, o + 0.32, h, h + 0.36);   // the cavetto of the cornice, overhanging the wall
      strip('tura_limestone', i, s0 + 0.1, s1 - 0.1, o + 0.02, o + 0.4, h + 0.36, h + 0.58);   // and the roll above it
    }
    if (w.gap) {
      // the lintel over the doorway, its cornice above, the jambs of a finer stone
      const [g0, g1] = gapRange(i);
      strip('tura_limestone', i, g0 - 0.1, g1 + 0.1, -o, o, dh, h);
      strip('limestone_carved', i, g0 - 0.1, g1 + 0.1, o, o + 0.03, dh, dh + 0.9);   // the panel on it (the king's name carved)
      strip('tura_limestone', i, g0 - 0.2, g1 + 0.2, -o - 0.05, o + 0.32, h, h + 0.36);
      strip('tura_limestone', i, g0 - 0.1, g1 + 0.1, o + 0.02, o + 0.4, h + 0.36, h + 0.58);
      strip('limestone_carved', i, g0 - 0.05, g0 + 0.2, -o, o, 0, dh); strip('limestone_carved', i, g1 - 0.2, g1 + 0.05, -o, o, 0, dh);   // the jambs
      const lo = horiz ? [g0 - 0.1, w.a[1] - o, g1 + 0.1, w.a[1] + o] : [w.a[0] - o, g0 - 0.1, w.a[0] + o, g1 + 0.1];
      col.rect(lo, dh, h);
    }
  });
  // the torus roll up each outer corner
  for (const [x, z] of [[x0 - o, z0 - o], [x1 + o, z0 - o], [x1 + o, z1 + o], [x0 - o, z1 + o]]) bag.add('tura_limestone', lathe([[0.001, 0], [0.22, 0], [0.22, h + 0.5], [0.001, h + 0.5]], 7, null, x, 0, z));
}

/** The causeway's outside: a plinth along both walls, the cornice along the roof's edge, the night sky painted under the roof. */
export function causewayDress(el, { bag }) {
  const [ax, az] = el.a, [bx, bz] = el.b, w = (el.w ?? 4.6) / 2, h = el.h ?? 5, ya = el.ya ?? 0, yb = el.yb ?? 0;
  const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux, n = Math.ceil(L / 6);
  const P = [], C = [], S = [];
  for (let k = 0; k < n; k++) {
    const s0 = k / n, s1 = (k + 1) / n, y0 = ya + (yb - ya) * s0, y1 = ya + (yb - ya) * s1, top = Math.max(y0, y1) + h, lo = Math.min(y0, y1);
    const p0 = [ax + (bx - ax) * s0, az + (bz - az) * s0], p1 = [ax + (bx - ax) * s1, az + (bz - az) * s1];
    for (const s of [-1, 1]) {
      const open = el.gap && s === el.gap.side && k >= el.gap.from && k < el.gap.to;
      const off = (d) => [[p0[0] + nx * d * s, p0[1] + nz * d * s], [p1[0] + nx * d * s, p1[1] + nz * d * s]];
      if (!open) {
        // the plinth, proud of the wall's outer face (at w + 1.4)
        const [q0, q1] = off(w + 1.4 + 0.15);
        beamTris(P, [q0[0], lo - 0.4, q0[1]], [q1[0], lo - 0.4, q1[1]], 0.15, 0.95 + (y1 > y0 ? 0 : 0));
      }
      // the roof's outer edge: a cornice course on the slabs, running over the doorway as a lintel
      const [r0, r1] = off(w + 1.4 + 0.12);
      beamTris(C, [r0[0], top + 0.6, r0[1]], [r1[0], top + 0.6, r1[1]], 0.2, 0.3);
    }
    // the sky under the roof: a thin painted sheet between the walls (the walls' inner faces at w)
    beamTris(S, [p0[0], top - 0.03, p0[1]], [p1[0], top - 0.03, p1[1]], w, 0.03);
  }
  bag.add('limestone_core', fromTriangles(P));
  bag.add('tura_limestone', fromTriangles(C));
  bag.add('vault_stars', fromTriangles(S));
}
