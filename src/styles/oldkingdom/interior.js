// The Great Pyramid's upper passages and chambers (docs/settlements/giza.md §4.6), as at the king's burial: the
// entrance in the north face, the descending passage, the ascending passage, the Grand Gallery with its corbelled
// walls, its benches with their slots and its ratchet roof, the three granite plugs stored in it on their beam, the
// Great Step, the antechamber with its portcullis slabs held up, and the King's Chamber of red granite with the
// sarcophagus and its lid.
//
// ok_pyramid_interior { c: [x, z] (the pyramid's centre), a (half the base), h }: true sizes and places from the
// survey figures; the two sloping passages and the short level ones are given a walker's headroom (2.1 m measured
// square to the floor, against the real 0.96–1.2 m), everything else is at its size.

import { box, lathe, fromTriangles } from '../../core/geom.js';

const DEG = Math.PI / 180;
/** The interior's figures, in metres from the pyramid's centre (X east, Z south, Y up from the base). */
export function pyramidGeometry(a = 115.15, h = 146.6) {
  const tanT = h / a, al = 26.52 * DEG, be = 26.04 * DEG, X = 7.29, W = 1.04, H = 2.1;
  const E = { Z: -a + 16.98 / tanT, Y: 16.98 };
  const J = { Z: E.Z + 28.2 * Math.cos(al), Y: E.Y - 28.2 * Math.sin(al) };
  const A = { Z: J.Z + 39.3 * Math.cos(be), Y: J.Y + 39.3 * Math.sin(be) };
  const G = { Z: A.Z + 46.68 * Math.cos(be), Y: A.Y + 46.68 * Math.sin(be) };
  const F = G.Y + 0.9;                                       // the floor of the Great Step, the antechamber, the chamber
  const step = [G.Z, G.Z + 1.55], ante = [step[1] + 1.3, step[1] + 4.27], room = [ante[1] + 2.54, ante[1] + 2.54 + 5.234];
  const hd = H / Math.cos(al), ha = H / Math.cos(be);           // the sloping passages' headroom, vertically
  // the hole the descending passage makes in the face: from its floor at the entrance up to where its roof meets the face
  const holeTop = E.Y + hd / (tanT + Math.tan(al)) * tanT;
  return { tanT, al, be, X, W, H, E, J, A, G, F, step, ante, room, roomX: [-2.3, 8.17], hd, ha, hole: [X - W / 2, E.Y, X + W / 2, holeTop] };
}

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A convex six-faced solid from its eight corners (bottom 0–3, top 4–7, in the same order), each face wound to
 *  face out from the solid's middle; `skip` names faces to leave open ('n' the end at corners 0,1 — see below). */
function hexa(T, P, skip = '') {
  const c = [0, 1, 2].map((k) => P.reduce((s, p) => s + p[k], 0) / 8);
  const faces = { b: [0, 1, 2, 3], t: [4, 5, 6, 7], n: [0, 1, 5, 4], e: [1, 2, 6, 5], s: [2, 3, 7, 6], w: [3, 0, 4, 7] };
  for (const [k, f] of Object.entries(faces)) {
    if (skip.includes(k)) continue;
    let [p, q, r, s] = f.map((i) => P[i]);
    const u = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], v = [r[0] - p[0], r[1] - p[1], r[2] - p[2]];
    const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
    const m = [(p[0] + r[0]) / 2 - c[0], (p[1] + r[1]) / 2 - c[1], (p[2] + r[2]) / 2 - c[2]];
    if (n[0] * m[0] + n[1] * m[1] + n[2] * m[2] < 0) [q, s] = [s, q];
    T.push(...p, ...q, ...r, ...p, ...r, ...s);
  }
}
/** A slab along a sloping line: x from x0 to x1, z from z0 to z1 (z0 < z1), between heights lo and hi measured up from
 *  the line y(z); `clip(z, off)` (optional) moves the north end's corners onto a plane (the pyramid's face). */
function slope(T, y, x0, x1, z0, z1, lo, hi, skip = '', clip = null) {
  // in pieces no longer than 2 m (the top field takes a triangle's points with a tolerance proportional to its size)
  const n = Math.ceil((z1 - z0) / 2 - 1e-9);
  if (n > 1) {
    for (let i = 0; i < n; i++) {
      const a = z0 + (z1 - z0) * i / n, b = z0 + (z1 - z0) * (i + 1) / n;
      slope(T, y, x0, x1, a, b, lo, hi, (i ? 'n' : skip.includes('n') ? 'n' : '') + (i < n - 1 ? 's' : skip.includes('s') ? 's' : ''), i ? null : clip);
    }
    return;
  }
  const zN = (off) => (clip ? clip(off) : z0);
  const P = [[x0, z0, lo], [x1, z0, lo], [x1, z1, lo], [x0, z1, lo], [x0, z0, hi], [x1, z0, hi], [x1, z1, hi], [x0, z1, hi]]
    .map(([x, z, off]) => { const zz = z === z0 ? zN(off) : z; return [x, y(zz) + off, zz]; });
  hexa(T, P, skip);
}

/**
 * ok_pyramid_interior: see the head of this file. Coordinates in the plan: the pyramid's centre `c`.
 */
export function pyramidInterior(el, { bag, col, lights }) {
  const [cx, cz] = el.c, g = pyramidGeometry(el.a, el.h), { X, W, H, E, J, A, G, F, al, be, tanT } = g;
  const x = cx + X, w = W / 2, Z = (v) => cz + v, rand = rng(2566);
  const lime = [], core = [], gran = [], wood = [], dark = [];
  const yD = (z) => E.Y - (z - Z(E.Z)) * Math.tan(al);                     // the descending passage's floor at z
  const yA = (z) => J.Y + (z - Z(J.Z)) * Math.tan(be);                     // the ascending passage's and the gallery's floor
  const seg = (a, b, th, y0, y1) => col.segment(a, b, th, y0, y1);
  // walls of a sloping passage for the walker: chunks along it, each from under its floor to over its roof
  const sideWalls = (y, z0, z1, hv, xin) => {
    for (let z = z0; z < z1 - 1e-6; z += 1.2) {
      const zb = Math.min(z1, z + 1.2), ylo = Math.min(y(z), y(zb)) - 0.4, yhi = Math.max(y(z), y(zb)) + hv;
      for (const s of [-1, 1]) seg([x + s * (xin + 0.15), z], [x + s * (xin + 0.15), zb], 0.3, ylo, yhi);
    }
  };

  // ── the descending passage, from the face down past the ascending passage's mouth (it goes on into the rock to the
  // unfinished chamber below; here it ends in the dark 60 m in), lined with fine limestone
  const zE = Z(E.Z), zJ = Z(J.Z), zDend = zE + 60 * Math.cos(al), hd = g.hd, ha = g.ha;
  const onFace = (off) => zE + off / (tanT + Math.tan(al));                // the north end of a slab on the face's plane
  // where the ascending floor rises through the descending roof (the mouth), and where the two roofs cross
  const zC = zJ + hd / (Math.tan(al) + Math.tan(be)), zP = zJ + Math.max(0, (hd - ha) / (Math.tan(al) + Math.tan(be)));
  slope(lime, yD, x - w, x + w, zE, zDend, -0.4, 0, 'n', onFace);                                     // the floor
  for (const s of [-1, 1]) slope(lime, yD, s < 0 ? x - w - 0.4 : x + w, s < 0 ? x - w : x + w + 0.4, zE, zDend, -0.4, hd, 'n', onFace);   // the sides
  // the roof, to the mouth (thin where it meets the face: no top field between its underside and its top out there)
  slope(lime, yD, x - w, x + w, zE, zE + 2, hd, hd + 0.08, "n", onFace);
  slope(lime, yD, x - w, x + w, zE + 2, zP, hd, hd + 0.4, '');
  slope(lime, yD, x - w, x + w, zC, zDend, hd, hd + 0.4);                                              // and beyond it
  lime.push(...flat(box(x - w - 0.4, yD(zDend) - 0.4, zDend, x + w + 0.4, yD(zDend) + hd + 0.4, zDend + 0.4)));
  col.ramp([x - w, zE, x + w, zJ + 0.05], yD(zJ + 0.05), E.Y, 'n');
  sideWalls(yD, zE, zJ + 1, hd, w);

  // ── the ascending passage, cut through the core masonry, from the mouth up to the gallery
  const zA = Z(A.Z);
  slope(core, yA, x - w, x + w, zJ, zA, -0.4, 0, 'n');                                                 // the floor (its underside the mouth's roof)
  for (const s of [-1, 1]) {
    // the sides: from the floor, and over the mouth from the descending passage's roof (no face lies in another's plane)
    const x0 = s < 0 ? x - w - 0.4 : x + w, x1 = s < 0 ? x - w : x + w + 0.4, r = (z) => yD(z) + hd, t = (z) => yA(z) + ha;
    hexa(core, [[x0, r(zP), zP], [x1, r(zP), zP], [x1, r(zC), zC], [x0, r(zC), zC], [x0, t(zP), zP], [x1, t(zP), zP], [x1, t(zC), zC], [x0, t(zC), zC]]);
    slope(core, yA, x0, x1, zC, zA, 0, ha, 's');
  }
  slope(core, yA, x - w, x + w, zP, zA, ha, ha + 0.4, 's');                                            // the roof
  col.ramp([x - w, zJ - 0.05, x + w, zA], yA(zJ - 0.05), A.Y, 's');
  sideWalls(yA, zJ + 1, zA, ha, w);

  // ── the Grand Gallery: 46.68 m long, 8.6 m high, 2.06 m wide over the benches; the walls rise 2.29 m and then step in
  // 7.6 cm a side in each of seven courses to 1.04 m under the roof, whose slabs are each laid a little steeper than
  // the floor, each resting in its own notch in the top of the walls, like the teeth of a ratchet
  const zG = Z(G.Z), zS0 = zG, zS1 = Z(g.step[1]), GH = 8.6, BW = 0.51, BH = 0.53, L2z = zS1;
  slope(lime, yA, x - w, x + w, zA, zG, -0.4, 0, '');                                                  // the channel's floor
  // the benches, with their slots (27 a side), each cut where a beam can lie across the channel
  const L = 46.68, slots = []; for (let i = 0; i < 27; i++) slots.push(zA + (1.0 + i * (L - 2.6) / 26) * Math.cos(be));
  for (const s of [-1, 1]) {
    const xi = s < 0 ? x - w - BW : x + w, xo = s < 0 ? x - w : x + w + BW, xm = (xi + xo) / 2;
    let z = zA;
    for (const sz of slots) {
      slope(lime, yA, xi, xo, z, sz - 0.12, -0.4, BH);
      // the slot: the bench's inner half at full height, its outer half (by the wall) cut down 0.2 m
      const [ci, co] = s < 0 ? [xm, xo] : [xi, xm], [wi, wo] = s < 0 ? [xi, xm] : [xm, xo];
      slope(lime, yA, ci, co, sz - 0.12, sz + 0.12, -0.4, BH);
      slope(lime, yA, wi, wo, sz - 0.12, sz + 0.12, -0.4, BH - 0.2);
      z = sz + 0.12;
    }
    slope(lime, yA, xi, xo, z, zG, -0.4, BH);
  }
  // the walls in their courses (the lowest from the floor; seven corbels over it), running on over the Great Step
  const courses = [[0, 2.29, 1.03]]; for (let k = 1; k <= 7; k++) courses.push([2.29 + (k - 1) * (GH - 2.29) / 7, 2.29 + k * (GH - 2.29) / 7, 1.03 - 0.076 * k]);
  for (const [lo, hi, xo] of courses) for (const s of [-1, 1]) slope(lime, yA, s < 0 ? x - xo - 0.5 : x + xo, s < 0 ? x - xo : x + xo + 0.5, zA, L2z, lo - (lo ? 0 : 0.4), hi);
  // the roof: slabs 1.2 m along, each underside rising 0.12 m over its length more than the floor does
  {
    const n = Math.ceil((L2z - zA) / (1.2 * Math.cos(be)));
    for (let i = 0; i < n; i++) {
      const z0 = zA + (L2z - zA) * i / n, z1 = zA + (L2z - zA) * (i + 1) / n;
      const xr = 1.03 - 0.076 * 7 + 0.1, P = [];
      const lo0 = yA(z0) + GH, lo1 = yA(z1) + GH + 0.12, hi0 = lo0 + 0.7, hi1 = lo1 + 0.58;
      P.push([x - xr, lo0, z0], [x + xr, lo0, z0], [x + xr, lo1, z1], [x - xr, lo1, z1], [x - xr, hi0, z0], [x + xr, hi0, z0], [x + xr, hi1, z1], [x - xr, hi1, z1]);
      hexa(lime, P);
    }
  }
  // the north end wall over the ascending passage's mouth, stepped to the corbels; the south end wall over the step
  for (const [lo, hi, xo] of courses) {
    const y0 = lo === 0 ? A.Y + ha : A.Y + lo;
    if (lo === 0) for (const s of [-1, 1]) lime.push(...flat(box(s < 0 ? x - xo : x + w, A.Y - 0.4, zA - 0.4, s < 0 ? x - w : x + xo, A.Y + ha, zA)));
    lime.push(...flat(box(x - xo, y0, zA - 0.4, x + xo, A.Y + hi, zA)));
  }
  lime.push(...flat(box(x - 0.6, A.Y + GH, zA - 0.4, x + 0.6, A.Y + GH + 0.7, zA)));
  // the Great Step, 0.9 m, across the gallery's upper end; over it the south wall with the low passage's mouth
  lime.push(...flat(box(x - 1.03, yA(zG) - 0.4, zG, x + 1.03, F, zS1)));
  const yTopS = yA(zS1) + GH + 0.7;
  for (const [lo, hi, xo] of courses) {
    const y0 = lo === 0 ? F + H : yA(zS1) + lo;
    if (lo === 0) for (const s of [-1, 1]) lime.push(...flat(box(s < 0 ? x - xo : x + w, F, zS1, s < 0 ? x - w : x + xo, F + H, zS1 + 0.4)));
    lime.push(...flat(box(x - xo, Math.max(y0, F), zS1, x + xo, yA(zS1) + hi, zS1 + 0.4)));
  }
  lime.push(...flat(box(x - 0.6, yA(zS1) + GH, zS1, x + 0.6, yTopS, zS1 + 0.4)));
  col.ramp([x - w, zA - 0.05, x + w, zG], yA(zA - 0.05), G.Y, 's');
  for (let z = zA; z < zS1 - 1e-6; z += 1.5) {
    const zb = Math.min(zS1, z + 1.5);
    for (const s of [-1, 1]) seg([x + s * (w + 0.15), z], [x + s * (w + 0.15), zb], 0.3, yA(z) - 0.4, yA(zb) + GH);
  }
  // the Great Step to be climbed: timber blocks stacked before it, as the burial party would have set one
  col.floor([x - 1.03, zG, x + 1.03, zS1], F);
  for (const [z0, z1, top] of [[zG - 0.75, zG - 0.5, G.Y + 0.23], [zG - 0.5, zG - 0.25, G.Y + 0.45], [zG - 0.25, zG, G.Y + 0.68]]) {
    wood.push(...flat(box(x - 0.48, yA(z0) - 0.1, z0, x + 0.48, top, z1 + (z1 === zG ? 0 : 0.0))));
    col.rect([x - 0.48, z0, x + 0.48, z1], yA(z0) + 0.02, top);
  }

  // ── the three granite plugs, stored on the channel's floor at the gallery's foot, held by a cedar beam across the
  // slots before them, to be slid down into the ascending passage when the king lies in his chamber; a timber stair
  // over them for those who still had to go up and down
  {
    const k = slots.findIndex((sz) => sz > zA + 3.2), sb = slots[k], pz0 = sb + 0.2, PL = 1.5 * Math.cos(be), PHv = 1.2 / Math.cos(be);
    // the beam lies in the slot pair across the channel, its top a little over the benches
    wood.push(...flat(box(x - w - BW + 0.06, yA(sb) + BH - 0.2, sb - 0.11, x + w + BW - 0.06, yA(sb) + BH + 0.12, sb + 0.11)));
    for (let i = 0; i < 3; i++) {
      const z0 = pz0 + i * (PL + 0.02), z1 = z0 + PL;
      slope(gran, yA, x - w + 0.01, x + w - 0.01, z0, z1, 0, PHv);
      // for the walker: strips with flat tops (the top's height at the strip's upper end)
      for (let zz = z0; zz < z1 - 1e-6; zz += 0.3) { const zb = Math.min(z1, zz + 0.3); col.rect([x - w, zz, x + w, zb], yA(zz) + 0.02, yA(zb) + PHv); }
    }
    // the stair: two stringers on the channel's floor, treads rising to the first plug's top
    const sTop = yA(pz0) + PHv, s0 = sb - 2.8, n = Math.ceil((sTop - yA(s0)) / 0.24);
    for (let i = 0; i < n; i++) {
      const za = s0 + (sb + 0.25 - s0) * i / n, zb = za + (sb + 0.25 - s0) / n + 0.06, ty = yA(s0) + (sTop - yA(s0)) * (i + 1) / n;
      wood.push(...flat(box(x - 0.45, yA(za) - 0.05, za, x + 0.45, ty, zb)));
      col.rect([x - 0.45, za, x + 0.45, Math.min(zb, pz0)], yA(za) + 0.02, ty);
    }
    // a plank from the stair's head over the beam onto the first plug
    wood.push(...flat(box(x - 0.4, sTop - 0.05, sb + 0.2, x + 0.4, sTop, pz0 + 0.3)));
  }

  // ── the low passage, the antechamber, the low passage, the King's Chamber: all on one level
  const [a0, a1] = g.ante, [r0, r1] = g.room, [rx0, rx1] = g.roomX;
  const za0 = Z(a0), za1 = Z(a1), zr0 = Z(r0), zr1 = Z(r1), xr0 = cx + rx0, xr1 = cx + rx1;
  const level = (list, xa, xb, z0, z1, hh) => {                      // a level passage: floor, sides, roof
    list.push(...flat(box(xa, F - 0.4, z0, xb, F, z1)), ...flat(box(xa, F + hh, z0, xb, F + hh + 0.4, z1)));
    list.push(...flat(box(xa - 0.4, F - 0.4, z0, xa, F + hh + 0.4, z1)), ...flat(box(xb, F - 0.4, z0, xb + 0.4, F + hh + 0.4, z1)));
    col.floor([xa, z0, xb, z1], F); seg([xa - 0.15, z0], [xa - 0.15, z1], 0.3, F - 0.4, F + hh); seg([xb + 0.15, z0], [xb + 0.15, z1], 0.3, F - 0.4, F + hh);
  };
  level(lime, x - w, x + w, zS1 + 0.4, za0, H);
  level(gran, x - w, x + w, za1, zr0, H);
  // the antechamber: 2.97 m long, 3.78 m high; granite wainscots east and west with the grooves of the portcullises;
  // the granite leaf in its groove at the north end and the three slabs, all held up on ropes over cedar logs lying in
  // the half-round hollows at the tops of the wainscots (lowered after the burial, they sealed the chamber)
  {
    const AW = 1.17 / 2, AH = 3.78, xa = x - AW, xb = x + AW;
    gran.push(...flat(box(xa, F - 0.4, za0, xb, F, za1)), ...flat(box(xa - 0.4, F + AH, za0, xb + 0.4, F + AH + 0.5, za1)));
    // the walls between the grooves (the grooves are the gaps where the slabs' ends go into the walls)
    const grooves = [[za0 + 0.33, za0 + 0.33 + 0.4], [za0 + 1.05, za0 + 1.58], [za0 + 1.62, za0 + 2.15], [za0 + 2.2, za0 + 2.73]];
    for (const s of [-1, 1]) {
      const xi = s < 0 ? xa : xb, xo = xi + s * 0.4, xg = xi + s * 0.12;
      let z = za0;
      for (const [g0, g1] of grooves) { gran.push(...flat(box(Math.min(xi, xo), F - 0.4, z, Math.max(xi, xo), F + AH, g0))); gran.push(...flat(box(Math.min(xg, xo), F - 0.4, g0, Math.max(xg, xo), F + AH, g1))); z = g1; }
      gran.push(...flat(box(Math.min(xi, xo), F - 0.4, z, Math.max(xi, xo), F + AH, za1)));
      seg([xi + s * 0.15, za0], [xi + s * 0.15, za1], 0.3, F - 0.4, F + AH);
    }
    // the end walls round the low passages' mouths
    for (const zz of [za0 - 0.4, za1]) {
      gran.push(...flat(box(xa, F + H, zz, xb, F + AH, zz + 0.4)));
      for (const s of [-1, 1]) gran.push(...flat(box(s < 0 ? xa : x + w, F, zz, s < 0 ? x - w : xb, F + H, zz + 0.4)));
    }
    col.floor([xa, za0, xb, za1], F);
    // the leaf (two slabs one over the other, a boss on its north face) and the three portcullis slabs, raised
    grooves.forEach(([g0, g1], i) => {
      const lo = F + H + 0.05 + (i ? 0 : 0.0), hi = i ? F + AH - 0.45 : F + AH - 0.05;
      gran.push(...flat(box(xa - 0.1, lo, g0 + 0.02, xb + 0.1, i ? hi : (lo + hi) / 2 - 0.01, g1 - 0.02)));
      if (!i) {
        gran.push(...flat(box(xa - 0.1, (lo + hi) / 2 + 0.01, g0 + 0.02, xb + 0.1, hi, g1 - 0.02)));
        gran.push(...flat(box(x - 0.11, lo + 0.25, g0 - 0.06, x + 0.11, lo + 0.43, g0 + 0.02)));   // the boss
      } else {
        // the log over it in the wainscots' hollows, the ropes down to the slab
        wood.push(...flat(lathe([[0.13, 0], [0.13, AW * 2 + 0.24]], 12).rotateZ(Math.PI / 2).translate(x + AW + 0.12, F + AH - 0.2, (g0 + g1) / 2)));
        for (const dx of [-0.32, -0.11, 0.11, 0.32]) wood.push(...flat(box(x + dx - 0.015, hi, (g0 + g1) / 2 + 0.12, x + dx + 0.015, F + AH - 0.2, (g0 + g1) / 2 + 0.15)));
      }
    });
  }
  // the King's Chamber: 10.47 × 5.234 m, 5.974 m high, walls of red granite in five courses, a floor of granite, the
  // flat roof of nine granite beams; the two shafts' mouths 0.91 m up in the north and south walls; the sarcophagus by
  // the west wall, its long axis north–south; its lid laid ready on timbers beside it
  {
    const RH = 5.974;
    gran.push(...flat(box(xr0, F - 0.4, zr0, xr1, F, zr1)));
    for (let i = 0; i < 9; i++) { const xa = xr0 + (xr1 - xr0) * i / 9, xb = xr0 + (xr1 - xr0) * (i + 1) / 9; gran.push(...flat(box(xa + (i ? 0.004 : 0), F + RH, zr0 - 0.6, xb - (i < 8 ? 0.004 : 0), F + RH + 1.6, zr1 + 0.6))); }
    // the walls: courses of blocks, each face a few millimetres proud or back of its neighbour's, joints showing
    const shaftX = cx + 2.9, sh = 0.21;
    const wallFace = (u0, u1, along, fixed, inward, holes) => {         // along 'x' or 'z'; the room-side face at `fixed`
      for (let k = 0; k < 5; k++) {
        const y0 = F + k * RH / 5, y1 = F + (k + 1) * RH / 5;
        let u = u0;
        while (u < u1 - 1e-6) {
          const len = Math.min(u1 - u, 1.3 + rand() * 1.4), d = rand() * 0.012, ub = u1 - (u + len) < 0.6 ? u1 : u + len;
          const parts = [[u, ub, y0, y1]];
          for (const [hu, hy] of holes) if (hy > y0 && hy < y1 && hu > u && hu < ub) { parts.splice(0, 1, [u, hu - sh / 2, y0, y1], [hu + sh / 2, ub, y0, y1], [hu - sh / 2, hu + sh / 2, y0, hy - sh / 2], [hu - sh / 2, hu + sh / 2, hy + sh / 2, y1]); }
          for (const [pa, pb, ya, yb] of parts) {
            if (pb - pa < 1e-3 || yb - ya < 1e-3) continue;
            const f0 = fixed - inward * (0.0 + d), f1 = fixed + inward * 0.5;
            const j = 0.004;                                                          // the joint
            gran.push(...flat(along === 'x' ? box(pa + j, ya + j, Math.min(f0, f1), pb - j, yb - j, Math.max(f0, f1)) : box(Math.min(f0, f1), ya + j, pa + j, Math.max(f0, f1), yb - j, pb - j)));
          }
          u = ub;
        }
      }
      // behind the joints, the bedding
      const b0 = fixed + inward * 0.02, b1 = fixed + inward * 0.5;
      dark.push(...flat(along === 'x' ? box(u0, F, Math.min(b0, b1), u1, F + RH, Math.max(b0, b1)) : box(Math.min(b0, b1), F, u0, Math.max(b0, b1), F + RH, u1)));
    };
    wallFace(xr0, x - w, 'x', zr0, -1, [[shaftX, F + 0.91 + sh / 2]]);
    wallFace(x + w, xr1, 'x', zr0, -1, []);
    gran.push(...flat(box(x - w, F + H, zr0 - 0.5, x + w, F + RH, zr0)));                  // over the passage's mouth
    wallFace(xr0, xr1, 'x', zr1, 1, [[shaftX, F + 0.91 + sh / 2]]);
    wallFace(zr0, zr1, 'z', xr0, -1, []);
    wallFace(zr0, zr1, 'z', xr1, 1, []);
    // the shafts behind their mouths, running in and out of sight
    for (const [zw, s] of [[zr0, -1], [zr1, 1]]) {
      const y0 = F + 0.91, zb = zw + s * 2.5;
      for (const p of [box(shaftX - sh / 2 - 0.1, y0 - 0.1, Math.min(zw, zb), shaftX + sh / 2 + 0.1, y0, Math.max(zw, zb)), box(shaftX - sh / 2 - 0.1, y0 + sh, Math.min(zw, zb), shaftX + sh / 2 + 0.1, y0 + sh + 0.1, Math.max(zw, zb)),
        box(shaftX - sh / 2 - 0.1, y0, Math.min(zw, zb), shaftX - sh / 2, y0 + sh, Math.max(zw, zb)), box(shaftX + sh / 2, y0, Math.min(zw, zb), shaftX + sh / 2 + 0.1, y0 + sh, Math.max(zw, zb)),
        box(shaftX - sh / 2, y0, s < 0 ? zb - 0.1 : zb, shaftX + sh / 2, y0 + sh, s < 0 ? zb : zb + 0.1)]) dark.push(...flat(p));
    }
    col.floor([xr0, zr0, xr1, zr1], F);
    for (const [p, q] of [[[xr0, zr0], [x - w, zr0]], [[x + w, zr0], [xr1, zr0]], [[xr0, zr1], [xr1, zr1]], [[xr0, zr0], [xr0, zr1]], [[xr1, zr0], [xr1, zr1]]]) {
      const off = p[1] === q[1] ? [0, p[1] === zr0 ? -0.15 : 0.15] : [p[0] === xr0 ? -0.15 : 0.15, 0];
      seg([p[0] + off[0], p[1] + off[1]], [q[0] + off[0], q[1] + off[1]], 0.3, F - 0.4, F + RH);
    }
    // the sarcophagus: a chest cut from one block of granite, 2.28 × 0.98 m and 1.05 m high, hollowed to 1.98 × 0.68 m and
    // 0.87 m deep, the inner lip of its rim cut back for the sliding lid
    const sx = xr0 + 0.9 + 0.49, sz = (zr0 + zr1) / 2, SL = 2.276 / 2, SW = 0.978 / 2, SH = 1.05, IL = 1.98 / 2, IW = 0.68 / 2;
    gran.push(...flat(box(sx - SW, F, sz - SL, sx + SW, F + SH - 0.87, sz + SL)));
    gran.push(...flat(box(sx - SW, F + SH - 0.87, sz - SL, sx - IW, F + SH, sz + SL)), ...flat(box(sx + IW, F + SH - 0.87, sz - SL, sx + SW, F + SH, sz + SL)));
    gran.push(...flat(box(sx - IW, F + SH - 0.87, sz - SL, sx + IW, F + SH - 0.04, sz - IL)), ...flat(box(sx - IW, F + SH - 0.87, sz + IL, sx + IW, F + SH - 0.04, sz + SL)));
    gran.push(...flat(box(sx - IW, F + SH - 0.04, sz - SL, sx + IW, F + SH, sz - IL - 0.04)), ...flat(box(sx - IW, F + SH - 0.04, sz + IL + 0.04, sx + IW, F + SH, sz + SL)));
    col.rect([sx - SW, sz - SL, sx + SW, sz + SL], F, F + SH);
    // the lid on two timbers, east of the chest; on its upper face the bosses it was handled by
    const lx = sx + SW + 1.1;
    for (const dz of [-0.7, 0.7]) wood.push(...flat(box(lx - 0.6, F, sz + dz - 0.1, lx + 0.6, F + 0.18, sz + dz + 0.1)));
    gran.push(...flat(box(lx - SW, F + 0.18, sz - SL, lx + SW, F + 0.18 + 0.21, sz + SL)));
    for (const dz of [-0.8, 0, 0.8]) gran.push(...flat(box(lx - 0.06, F + 0.39, sz + dz - 0.08, lx + 0.06, F + 0.45, sz + dz + 0.08)));
    col.rect([lx - 0.6, sz - SL, lx + 0.6, sz + SL], F, F + 0.45);
    // oil lamps for the burial party: on the floor by the sarcophagus and the door, in the antechamber, in the gallery
    for (const [lxp, lzp, ly, st] of [[sx + 1.5, zr0 + 0.5, F + 1.3, F], [x - 0.9, zr0 + 0.45, F + 1.3, F], [x + 1.2, zr1 - 0.5, F + 1.3, F]]) { lights.push({ at: [lxp, ly, lzp], color: '#ffb46b', intensity: 4, distance: 8 }); lampStand(bag, lxp, st, lzp, ly); col.circle(lxp, lzp, 0.2, st, ly); }
  }
  // lamps along the gallery's benches (a stand stood on each bench's top would not fit: small clay lamps on them)
  for (const t of [0.15, 0.45, 0.75]) for (const s of [-1, 1]) {
    const z = zA + (zG - zA) * t + s * 0.6, xx = x + s * (w + BW / 2), yy = yA(z) + BH;
    bag.add('terracotta', lathe([[0.001, 0], [0.06, 0.005], [0.075, 0.03], [0.05, 0.045], [0.001, 0.04]], 10, null, xx, yy, z));
    lights.push({ at: [xx, yy + 0.08, z], color: '#ffb46b', intensity: 3, distance: 7 });
  }

  for (const [list, mat] of [[lime, 'tura_limestone'], [core, 'limestone_core'], [gran, 'granite_red'], [wood, 'timber'], [dark, 'basalt']]) if (list.length) bag.add(mat, fromTriangles(list));
}
/** A box's triangles, flat (x, y, z per vertex). */
function flat(g) { const n = g.index ? g.toNonIndexed() : g; return Array.from(n.attributes.position.array); }
/** A bronze lamp stand on the floor at y0, its bowl at y. */
function lampStand(bag, x, y0, z, y) {
  bag.add('bronze', lathe([[0.2, 0], [0.18, 0.04], [0.05, 0.12], [0.035, 0.3], [0.035, y - y0 - 0.2], [0.07, y - y0 - 0.16], [0.16, y - y0 - 0.08], [0.14, y - y0 - 0.06]], 12, null, x, y0, z));
}
