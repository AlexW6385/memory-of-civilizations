// The Piazza della Signoria about 1480 (docs/settlements/florence.md §4a): the Palazzo della
// Signoria — the block of rusticated pietraforte with its string courses and two storeys of
// two-light windows under round arches, the gallery carried on triple corbels and round arches
// with the painted arms of the commune between them, the square (Guelph) merlons under the
// gallery's roof, the lions at its corners; the tower standing on the front of the gallery, with
// its own gallery on corbels and pointed arches, the swallowtail (Ghibelline) merlons, the belfry
// of four columns and round arches, the crown and the lion of the weathervane; the ringhiera
// before the front. The Loggia of the Signoria: three round arches on compound piers with leaf
// capitals, one arch at the side, the four Virtues in quatrefoils over the arches, the cornice on
// brackets and the parapet of little arches. The Ponte Vecchio: three segmental arches on two
// piers with cutwaters, two rows of shops on it and their back shops hanging over the water on
// timber brackets, the open middle.

import { box, lathe, frustum, rod } from '../../core/geom.js';
import { Float32BufferAttribute } from '../../core/three.js';
import { faceFrame, Local, ext, archOutline, headPts, voussoirs, wrect, sheet } from './face.js';
import { ball, limb, T } from '../qing/carving.js';

const PF = 'limestone_yellow', M = 'marble', PINK = 'marble_pink', SER = 'pietra_serena', R = 'roof_tile', GB = 'gilt_bronze', W = 'wood_dark', O = 'opening';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/**
 * Lay rusticated courses from y0 to y1 along a face (u from a to b), leaving holes: [{ u0, u1, y0, y1, hw(y)? }].
 * Lc.put(u0, y0, d0, u1, y1, d1) places each block (into one merged collector: Florence has no mesh to spare
 * for an instanced shape).
 */
function rusticate(Lc, a, b, y0, y1, holes, proj, rand, course = 0.72) {
  const n = Math.max(1, Math.round((y1 - y0) / course)), ch = (y1 - y0) / n, J = 0.06;
  for (let i = 0; i < n; i++) {
    const ya = y0 + i * ch, yb = ya + ch - J;
    // the free stretches of this course
    let free = [[a, b]];
    for (const h of holes) {
      if (yb <= h.y0 || ya >= h.y1) continue;
      const hw = h.hw ? Math.max(h.hw(ya), h.hw(yb)) : (h.u1 - h.u0) / 2, uc = (h.u0 + h.u1) / 2;
      if (hw <= 0) continue;
      const c0 = uc - hw, c1 = uc + hw;
      free = free.flatMap(([p, q]) => (q <= c0 || p >= c1 ? [[p, q]] : [[p, c0], [c1, q]].filter(([s, t]) => t - s > 0.05)));
    }
    for (const [p, q] of free) {
      let u = p + ((i % 2) ? 0 : 0.5) * rand() * 0.6;
      if (u - p > 0.05) Lc.put(p, ya, -0.04, u - J, yb, proj);
      while (u < q - 0.02) {
        let len = 1.1 + rand() * 1.1;
        if (q - (u + len) < 0.5) len = q - u;
        Lc.put(u, ya, -0.04, Math.min(q, u + len) - J, yb, proj * (0.85 + rand() * 0.3));
        u += len;
      }
    }
  }
}

/** A box without its face toward [nx, nz] (the back of a block against its wall), and without its top if asked. */
function dropFace(g, [nx, nz], top = false) {
  if (g.index) g = g.toNonIndexed();
  const P = g.attributes.position.array, N = g.attributes.normal.array, keepP = [], keepN = [];
  for (let i = 0; i < P.length; i += 9) {
    if (N[i] * nx + N[i + 2] * nz > 0.99 || (top && N[i + 1] > 0.99)) continue;
    for (let k = 0; k < 9; k++) { keepP.push(P[i + k]); keepN.push(N[i + k]); }
  }
  g.setAttribute('position', new Float32BufferAttribute(keepP, 3)); g.setAttribute('normal', new Float32BufferAttribute(keepN, 3));
  return g;
}

/** A two-light window under a round arch, centred at uc with its sill at s (local face coordinates). */
function bifora(Lc, uc, s, { w = 2.6, hl = 3.2, vou = 0.75, proj = 0.34 } = {}) {
  const r = w / 2, ys = s + hl;
  Lc.add(O, ext(archOutline(uc, s, w, ys - 0.15, 'round', 8), [], -0.03, 0.01));              // the dark of the window
  // the tympanum of white marble with the two trefoil heads of the lights and an oculus cut through it
  const lw = 0.9, lc = 0.62;
  const holes = [archOutline(uc - lc, ys - 0.1, lw, ys, 'trefoil', 7), archOutline(uc + lc, ys - 0.1, lw, ys, 'trefoil', 7)];
  const oc = []; for (let i = 0; i < 10; i++) { const a = -i / 10 * Math.PI * 2; oc.push([uc + Math.cos(a) * 0.15, ys + 0.98 + Math.sin(a) * 0.15]); }
  holes.push(oc);
  Lc.add(M, ext(headPts(uc, ys - 0.15, w, 'round', 7), holes, 0.0, 0.1));
  // the jambs, the colonnette with its base and leaf capital, the sill
  for (const sg of [-1, 1]) Lc.box(M, uc + sg * r, s, 0, uc + sg * (lc + lw / 2), ys - 0.15, 0.1);
  Lc.add(M, rod([uc, s + 0.25, 0.08], [uc, ys - 0.42, 0.08], 0.085, 8));
  Lc.add(M, lathe([[0.15, 0], [0.15, 0.1], [0.1, 0.25]], 8, null, uc, s, 0.08));
  Lc.add(M, lathe([[0.09, 0], [0.12, 0.1], [0.19, 0.24], [0.2, 0.27]], 8, null, uc, ys - 0.42, 0.08));
  Lc.box(M, uc - 0.21, ys - 0.15, 0, uc + 0.21, ys - 0.12, 0.2);
  Lc.box(M, uc - r - 0.1, s - 0.12, -0.02, uc + r + 0.1, s, 0.22);
  // the rusticated voussoirs round the arch
  voussoirs(Lc, PF, uc, ys - 0.15, r, r + vou, -0.04, proj, 11, 0.06);
}

/** A seated lion (the Marzocco) facing +z, its right forepaw on a shield, about 1.6 m high. */
function marzocco(Lc, mat) {
  const B = (rx, ry, rz, x, y, z, n = 8) => Lc.add(mat, T(ball(rx, ry, rz, n), x, y, z));
  Lc.box(mat, -0.42, 0, -0.62, 0.42, 0.22, 0.62);                                           // the plinth
  B(0.34, 0.3, 0.42, 0, 0.5, -0.18, 10);                                                    // the haunches
  Lc.add(mat, limb([0, 0.5, -0.2], [0, 1.05, 0.18], 0.3, 0.27, 10));                       // the body sitting up
  B(0.33, 0.36, 0.3, 0, 1.12, 0.2, 10);                                                     // the mane
  B(0.2, 0.2, 0.22, 0, 1.18, 0.4);                                                          // the head
  B(0.11, 0.09, 0.12, 0, 1.12, 0.58);                                                       // the muzzle
  for (const sx of [-1, 1]) { B(0.07, 0.07, 0.05, sx * 0.13, 1.36, 0.36, 6); B(0.15, 0.2, 0.32, sx * 0.24, 0.42, -0.08); Lc.add(mat, limb([sx * 0.25, 0.3, 0.12], [sx * 0.26, 0.25, 0.4], 0.09, 0.08)); }
  Lc.add(mat, limb([-0.16, 0.95, 0.32], [-0.17, 0.27, 0.42], 0.1, 0.085)); B(0.1, 0.07, 0.13, -0.17, 0.27, 0.48, 6);
  Lc.add(mat, limb([0.16, 0.95, 0.32], [0.2, 0.78, 0.55], 0.1, 0.085));                    // the right paw raised on the shield
  Lc.add(mat, ext([[-0.24, 0.85], [0.24, 0.85], [0.24, 0.42], [0, 0.22], [-0.24, 0.42]], [], 0, 0.08).translate(0.22, -0.55, 0.58));
  Lc.add(mat, limb([0, 0.35, -0.55], [0.3, 0.27, -0.2], 0.05, 0.04));                      // the tail
}

/** palazzo: { rect, h, front ('w'), tower: { u (along the front), s, h }, ringhiera } — the Palazzo della Signoria. */
export function palazzo(el, { bag, col }) {
  const rect = el.rect, [x0, z0, x1, z1] = rect, h = el.h ?? 30, y = el.y ?? 0, front = el.front ?? 'w', rand = rng(1299);
  const P = 1.5, yc = h - 0.5, yc0 = yc - 2.1, cs = 2.4, sills = [12.0, 21.4];
  bag.add(PF, box(x0, y - 0.5, z0, x1, y + h + 6.2, z1)); col.rect(rect, y, y + h + 6.2); col.floor(rect, y + h + 6.2);
  const RU = new Local(), tw = el.tower ? el.tower.s ?? 7 : 0, tu = el.tower ? el.tower.u ?? 13 : -99;
  for (const f of 'nsew') {
    const { M: FM, L } = faceFrame(rect, f, y), Lc = new Local(), isFront = f === front;
    Lc.noBack = true; Lc.L = L;
    const nb = f === 'w' ? [1, 0] : f === 'e' ? [-1, 0] : f === 'n' ? [0, 1] : [0, -1];       // the inward normal: the blocks' backs, never seen
    // above the eye the blocks' tops are never seen from the street either (a few centimetres of ledge seen from the air)
    Lc.put = (u0, y0, d0, u1, y1, d1) => { const r = wrect(FM, u0, d0, u1, d1); RU.add(PF, dropFace(box(r[0], y + y0, r[1], r[2], y + y1, r[3]), nb, y0 > 2.5)); };
    const nWin = Math.max(2, Math.round(L / 8)), wu = (i) => (i + 0.5) * L / nWin;
    // the string courses under the windows and the cornice under the corbels
    for (const ys of sills) Lc.box(PF, -0.45, ys - 0.4, -0.04, L + 0.45, ys, 0.45);
    Lc.box(PF, -0.45, yc0 - 0.35, -0.04, L + 0.45, yc0, 0.42);
    Lc.box(PF, -0.3, -0.5, -0.04, L + 0.3, 0.45, 0.5);                                     // the plinth course (the stone bench)
    // the holes left in the rustication: windows, the door, the small windows of the ground floor
    const holes = [];
    for (const s of sills) for (let i = 0; i < nWin; i++) { const uc = wu(i), ys = s - 0.15 + 3.2, ro = 1.3 + 0.75; holes.push({ u0: uc - 1.36, u1: uc + 1.36, y0: s - 0.02, y1: ys + ro + 0.02, hw: (yy) => (yy <= ys ? 1.36 : Math.sqrt(Math.max(0, ro * ro - (yy - ys) ** 2)) + 0.02) }); bifora(Lc, uc, s); }
    const door = isFront ? tu + 0.5 : -99, dw = 3.4, dys = 5.4;
    if (isFront) {
      holes.push({ u0: door - dw / 2 - 0.9, u1: door + dw / 2 + 0.9, y0: 0.4, y1: dys + dw / 2 + 0.95, hw: (yy) => (yy <= dys ? dw / 2 + 0.06 : Math.sqrt(Math.max(0, (dw / 2 + 0.9) ** 2 - (yy - dys) ** 2)) + 0.02) });
      Lc.add(O, ext(archOutline(door, 0.45, dw, dys, 'round', 8), [], -0.03, 0.01));
      for (const sg of [-1, 1]) Lc.box(W, door + sg * 0.02, 0.45, 0.0, door + sg * dw / 2, dys - 0.05, 0.12);       // the two leaves, shut
      voussoirs(Lc, PF, door, dys, dw / 2, dw / 2 + 0.9, -0.04, 0.4, 13, 0.06);
    }
    for (let i = 0; i < nWin; i++) { const uc = wu(i); if (Math.abs(uc - door) < 4) continue; holes.push({ u0: uc - 0.55, u1: uc + 0.55, y0: 6.5, y1: 8.4 }); Lc.add(O, ext([[uc - 0.5, 6.55], [uc + 0.5, 6.55], [uc + 0.5, 8.35], [uc - 0.5, 8.35]], [], -0.03, 0.01)); Lc.box(PF, uc - 0.62, 6.35, -0.04, uc + 0.62, 6.55, 0.3); }
    const bands = [[0.45, sills[0] - 0.4, 0.26], [sills[0], sills[1] - 0.4, 0.18], [sills[1], yc0 - 0.35, 0.15]];
    for (const [a, b, pr] of bands) rusticate(Lc, 0, L, a, b, holes, pr, rand);
    // the gallery: triple corbels, round arches between them, the painted arms on the wall
    const n = Math.round((L + 2 * P) / cs), sp = (L + 2 * P) / n, cu = (k) => -P + (k + 0.5) * sp;
    for (let k = 0; k < n; k++) {
      const u = cu(k);
      for (let st = 0; st < 3; st++) Lc.box(PF, u - 0.37, yc0 + st * 0.7, -0.04, u + 0.37, yc0 + st * 0.7 + 0.64, 0.5 * (st + 1));
      if (k + 1 < n) {
        const a = u + 0.37, b = cu(k + 1) - 0.37, m = (a + b) / 2, ra = (b - a) / 2, spring = yc - 0.15 - ra;
        const arc = []; for (let i = 0; i <= 10; i++) { const t = Math.PI * i / 10; arc.push([m + Math.cos(t) * ra, spring + Math.sin(t) * ra]); }
        Lc.add(PF, ext([[b, yc], [a, yc], [a, spring], ...arc.reverse()], [], P - 0.45, P));
        // the shield: the lily, the cross, parted, the keys — in turn
        const sh = [[m - 0.34, yc0 + 1.55], [m + 0.34, yc0 + 1.55], [m + 0.34, yc0 + 0.85], [m, yc0 + 0.45], [m - 0.34, yc0 + 0.85]], kind = k % 4;
        Lc.add(kind === 3 ? PINK : M, ext(sh, [], -0.04, 0.03));
        if (kind === 0) { Lc.box(PINK, m - 0.04, yc0 + 0.7, 0.03, m + 0.04, yc0 + 1.4, 0.05); for (const sg of [-1, 1]) Lc.add(PINK, ext([[m, yc0 + 1.0], [m + sg * 0.22, yc0 + 1.42], [m + sg * 0.12, yc0 + 1.0]], [], 0.03, 0.05)); Lc.box(PINK, m - 0.16, yc0 + 0.95, 0.03, m + 0.16, yc0 + 1.02, 0.05); }
        else if (kind === 1) { Lc.box(PINK, m - 0.05, yc0 + 0.6, 0.03, m + 0.05, yc0 + 1.5, 0.05); Lc.box(PINK, m - 0.3, yc0 + 1.1, 0.03, m + 0.3, yc0 + 1.2, 0.05); }
        else if (kind === 2) Lc.add(PINK, ext([[m, yc0 + 1.55], [m + 0.34, yc0 + 1.55], [m + 0.34, yc0 + 0.85], [m, yc0 + 0.45]], [], 0.03, 0.05));
        else for (const sg of [-1, 1]) { const g = box(-0.035, -0.32, 0.03, 0.035, 0.32, 0.05); g.rotateZ(sg * 0.6); g.translate(m, yc0 + 1.05, 0); Lc.add(GB, g); }
      }
    }
    // the gallery floor (the slots of the machicolations between it and the parapet), the parapet, the merlons, the roof over them
    const tA = isFront ? tu - tw / 2 : 1e9, tB = isFront ? tu + tw / 2 : -1e9;
    const spans = isFront ? [[-P, tA], [tB, L + P]] : [[-P, L + P]];
    for (const [a, b] of spans) {
      Lc.box(PF, a, yc, -0.04, b, yc + 0.28, P - 0.8);
      Lc.box(PF, a, yc, P - 0.45, b, h + 3.0, P);
      Lc.box(PF, a, h + 2.75, P - 0.55, b, h + 3.0, P + 0.12);
      const roof = box(a - 0.25, -0.12, -0.3, b + 0.25, 0.12, P + 0.45), ang = Math.atan2(1.3, P + 0.45);
      roof.rotateX(ang); roof.translate(0, h + 5.92, 0); Lc.add(R, roof);
    }
    const nm = Math.round((L + 2 * P) / 2.0), ms = (L + 2 * P) / nm;
    for (let k = 0; k < nm; k++) { const u = -P + (k + 0.5) * ms; if (u + 0.55 > tA - 0.2 && u - 0.55 < tB + 0.2) continue; Lc.box(PF, u - 0.52, h + 3.0, P - 0.45, u + 0.52, h + 4.75, P); }
    Lc.emit(bag, FM);
  }
  // the four lions in the corners of the gallery, each looking out across its corner
  for (const [cx, cz, yaw] of [[x0 - P + 0.75, z0 - P + 0.75, -Math.PI * 0.75], [x1 + P - 0.75, z0 - P + 0.75, Math.PI * 0.75], [x0 - P + 0.75, z1 + P - 0.75, -Math.PI * 0.25], [x1 + P - 0.75, z1 + P - 0.75, Math.PI * 0.25]]) {
    const Lc = new Local(); marzocco(Lc, PF);
    for (const list of Lc.m.values()) for (const p of list) { p.scale(0.85, 0.85, 0.85); p.rotateY(yaw); p.translate(cx, y + h + 3.0, cz); }
    Lc.emit(bag);
  }
  bag.add(R, frustum([x0 + 0.3, z0 + 0.3, x1 - 0.3, z1 - 0.3], y + h + 6.2, y + h + 9.4, (x1 - x0) / 2 - 1, (x1 - x0) / 2 - 1, (z1 - z0) / 2 - 1, (z1 - z0) / 2 - 1));
  if (el.tower) tower(el, { bag, col }, rect, front, tu, tw, P, yc, y, RU);
  RU.emit(bag);
  if (el.ringhiera !== false) ringhiera(bag, col, rect, front, y);
}

/** The tower on the front of the gallery. */
function tower(el, { bag, col }, rect, front, tu, s, P, yc, y, RU) {
  const { M: FM } = faceFrame(rect, front, y), th = el.tower.h ?? 94;
  // the tower's footprint: its front flush with the parapet's face, its back over the roof
  const tr = wrect(FM, tu - s / 2, P - s, tu + s / 2, P);
  const yS = y + 61.5, yG = yS + 2.1, yB = yG + 2.6;
  bag.add(PF, box(tr[0], y + yc, tr[1], tr[2], yS, tr[3])); col.rect(tr, y + yc, yS);
  const rand = rng(1310);
  for (const f of 'nsew') {
    const { M: TM, L } = faceFrame(tr, f, 0), Lc = new Local();
    Lc.noBack = true; Lc.L = L;
    const nb = f === 'w' ? [1, 0] : f === 'e' ? [-1, 0] : f === 'n' ? [0, 1] : [0, -1];
    Lc.put = (u0, y0, d0, u1, y1, d1) => { const r = wrect(TM, u0, d0, u1, d1); RU.add(PF, dropFace(box(r[0], y0, r[1], r[2], y1, r[3]), nb, true)); };
    // the shaft: rough courses, small windows, two string bands
    const holes = [];
    for (const wy of [y + 40, y + 50]) { holes.push({ u0: L / 2 - 0.55, u1: L / 2 + 0.55, y0: wy - 0.1, y1: wy + 2.3 }); Lc.add(O, ext(archOutline(L / 2, wy, 0.9, wy + 1.6, 'round', 6), [], -0.03, 0.01)); Lc.box(PF, L / 2 - 0.6, wy - 0.2, -0.04, L / 2 + 0.6, wy, 0.25); voussoirs(Lc, PF, L / 2, wy + 1.6, 0.45, 0.85, -0.04, 0.16, 7, 0.05); }
    rusticate(Lc, 0, L, y + (el.h ?? 30) + 6.0, yS - 0.4, holes, 0.1, rand, 0.6);
    Lc.box(PF, -0.2, yS - 0.4, -0.04, L + 0.2, yS, 0.35);
    // the tower's gallery: corbels with pointed arches between, the parapet, the swallowtail merlons
    const Pt = 1.0, n = Math.max(3, Math.round((L + 2 * Pt) / 1.6)), sp = (L + 2 * Pt) / n, cu = (k) => -Pt + (k + 0.5) * sp;
    for (let k = 0; k < n; k++) {
      const u = cu(k);
      for (let st = 0; st < 3; st++) Lc.box(PF, u - 0.28, yS + st * 0.7, -0.04, u + 0.28, yS + st * 0.7 + 0.66, Pt * (st + 1) / 3);
      if (k + 1 < n) { const a = u + 0.28, b = cu(k + 1) - 0.28, w = b - a, ys = yG - 0.1 - w * Math.sin(Math.PI / 3); const pts = archOutline((a + b) / 2, ys, w, ys + 0.001, 'pointed', 6).slice(2, -1); Lc.add(PF, ext([[b, yG], [a, yG], ...pts.reverse()].reverse(), [], Pt - 0.35, Pt)); }
    }
    Lc.box(PF, -Pt, yG, -0.04, L + Pt, yG + 0.25, Pt - 0.5);
    Lc.box(PF, -Pt, yG, Pt - 0.35, L + Pt, yB, Pt);
    const sw = (u0, yb, d0, d1, wm = 0.8, hm = 1.5) => Lc.add(PF, ext([[u0 - wm / 2, yb], [u0 + wm / 2, yb], [u0 + wm / 2 + 0.05, yb + hm], [u0, yb + hm - 0.45], [u0 - wm / 2 - 0.05, yb + hm]], [], d0, d1));
    const nm = Math.round((L + 2 * Pt) / 1.45), ms = (L + 2 * Pt) / nm;
    for (let k = 0; k < nm; k++) sw(-Pt + (k + 0.5) * ms, yB, Pt - 0.35, Pt);
    // the belfry: four massive columns, round arches, the cornice, its own small swallowtail crown
    const yA = yB, cr = 0.85, ya = yA + 6.2, yE = ya + (L - 2 * cr) / 2 + 0.9;
    if (f === 'n' || f === 's') for (const u of [cr, L - cr]) Lc.add(PF, lathe([[cr + 0.15, 0], [cr + 0.15, 0.4], [cr, 0.6], [cr * 0.92, 6.0], [cr + 0.2, 6.2], [cr + 0.2, 6.5]], 10, null, u, yA, -cr));
    const wa = L - 4 * cr, yo = ya + 0.3, head = archOutline(L / 2, yo, wa, yo, 'round', 10).slice(3, -1);
    Lc.add(PF, ext([[L + 0.45, yE], [-0.45, yE], [-0.45, yo], [2 * cr, yo], ...head.reverse(), [L - 2 * cr, yo], [L + 0.45, yo]], [], -0.04, 0.45));
    voussoirs(Lc, PF, L / 2, ya + 0.3, wa / 2, wa / 2 + 0.55, 0.4, 0.62, 11, 0.05);
    Lc.box(PF, -0.35, yE, -0.04, L + 0.35, yE + 0.6, 0.75);
    Lc.box(PF, -0.15, yE + 0.6, -0.04, L + 0.15, yE + 1.1, 0.4);
    const nm2 = 4, ms2 = (L + 0.3) / nm2;
    for (let k = 0; k < nm2; k++) sw(-0.15 + (k + 0.5) * ms2, yE + 1.1, 0.0, 0.4, 0.7, 1.2);
    Lc.emit(bag, TM);
  }
  // inside the belfry: the floor, the bell on its beam; above, the cap and the lion with the lily on its pole
  const [tx, tz] = [(tr[0] + tr[2]) / 2, (tr[1] + tr[3]) / 2], ya = yB + 6.2, yE = ya + (s - 3.4) / 2 + 0.9;
  bag.add(PF, box(tr[0] + 0.3, yB - 0.3, tr[1] + 0.3, tr[2] - 0.3, yB, tr[3] - 0.3));
  bag.add(W, box(tr[0] + 1.6, ya - 0.2, tz - 0.2, tr[2] - 1.6, ya + 0.2, tz + 0.2));
  bag.add(GB, lathe([[0.001, -2.6], [1.05, -2.6], [0.95, -2.2], [0.68, -1.4], [0.6, -0.4], [0.35, -0.05], [0.001, 0]], 14, null, tx, ya - 0.2, tz));
  bag.add(PF, box(tr[0], yE - 0.05, tr[1], tr[2], yE + 1.1, tr[3]));
  bag.add(SER, frustum([tr[0] + 0.6, tr[1] + 0.6, tr[2] - 0.6, tr[3] - 0.6], yE + 1.1, yE + 6.4, s / 2 - 1.1, s / 2 - 1.1, s / 2 - 1.1, s / 2 - 1.1));
  const top = yE + 6.4;
  bag.add(GB, rod([tx, top - 0.2, tz], [tx, y + th - 1.2, tz], 0.07, 6));
  bag.add(GB, lathe([[0.001, -0.3], [0.3, 0], [0.001, 0.3]], 8, null, tx, top + 0.4, tz));
  // the lion rampant of the vane, holding the pole with the lily
  const vy = y + th - 4.2, Lc = new Local();
  const B = (rx, ry, rz, x, yy, z) => Lc.add(GB, T(ball(rx, ry, rz, 7), x, yy, z));
  B(0.22, 0.45, 0.14, 0.3, 0.9, 0); B(0.24, 0.24, 0.16, 0.36, 1.45, 0); B(0.13, 0.11, 0.1, 0.55, 1.5, 0);
  Lc.add(GB, limb([0.3, 0.55, 0], [0.18, 0.0, 0], 0.08, 0.06)); Lc.add(GB, limb([0.32, 0.55, 0.06], [0.48, 0.05, 0.06], 0.08, 0.06));
  Lc.add(GB, limb([0.38, 1.25, 0], [0.05, 1.35, 0], 0.06, 0.05)); Lc.add(GB, limb([0.15, 0.6, 0], [-0.2, 1.0, 0], 0.04, 0.03));
  Lc.add(GB, ext([[0, 2.2], [0.25, 2.65], [0.06, 2.5], [0, 2.95], [-0.06, 2.5], [-0.25, 2.65]], [], -0.03, 0.03));
  for (const [, list] of Lc.m) for (const p of list) p.translate(tx, vy, tz);
  Lc.emit(bag);
}

/** The ringhiera: the raised platform with its steps before the front. */
function ringhiera(bag, col, rect, front, y) {
  const { M: FM, L } = faceFrame(rect, front, y), Lc = new Local(), D = 4.2, Hh = 1.05, a = 1.0, b = L - 1.0;
  Lc.box(PF, a, -0.5, -0.04, b, Hh, D);
  Lc.box(PF, a - 0.1, Hh - 0.12, -0.04, b + 0.1, Hh + 0.02, D + 0.12);
  for (let i = 0; i < 3; i++) Lc.box(PF, a + 0.6, -0.5, D, b - 0.6, Hh - (i + 1) * Hh / 4, D + 0.4 * (i + 1));
  for (const u of [a, b - 0.5]) Lc.box(PF, u, Hh, 0.0, u + 0.5, Hh + 0.9, D);                // the low walls at its ends
  Lc.emit(bag, FM);
  const r = (u0, d0, u1, d1) => wrect(FM, u0, d0, u1, d1);
  col.floor(r(a + 0.5, 0, b - 0.5, D), y + Hh);
  const dir = { w: 'e', e: 'w', n: 's', s: 'n' }[front];
  col.ramp(r(a + 0.6, D, b - 0.6, D + 1.2), y, y + Hh, dir);
  for (const u of [a, b - 0.5]) col.rect(r(u, 0, u + 0.5, D), y, y + Hh + 0.9);
}

/** loggia: { rect, h (floor to the springing), n (arches along the front), y, front ('n') } — the Loggia of the Signoria. */
export function loggia(el, { bag, col }) {
  const rect = el.rect, [x0, z0, x1, z1] = rect, y = el.y ?? 0, n = el.n ?? 3, pier = 2.2, Hs = el.h ?? 11;
  // the floor raised on its steps toward the piazza (north)
  const yF = y + 1.2;
  bag.add(SER, box(x0, y - 0.3, z0, x1, yF, z1));                                       // the floor of pietra serena flags col.floor([x0, z0, x1, z1], yF);
  for (let i = 0; i < 4; i++) bag.add(PF, box(x0, y - 0.3, z0 - 0.42 * (i + 1), x1, yF - (i + 1) * 0.3, z0 - 0.42 * i));
  col.ramp([x0, z0 - 1.7, x1, z0], y, yF, 's');
  const Lf = x1 - x0, Ls = z1 - z0, rF = (Lf - (n + 1) * pier) / n / 2, rS = (Ls - 2 * pier) / 2, ys = yF + Hs, yC = ys + Math.max(rF, rS) + 1.4;
  // the back wall, the vaults' ceiling over the bays, the roof behind the parapet
  bag.add(PF, box(x0, yF - 0.1, z1 - 1.0, x1, yC + 0.85, z1)); col.rect([x0, z1 - 1.0, x1, z1], y, yC);
  bag.add('stucco', box(x0 + 0.3, yC - 0.9, z0 + 0.3, x1 - 0.3, yC - 0.6, z1 - 0.9));
  bag.add(PF, box(x0, yC - 0.6, z0, x1, yC + 0.85, z1 - 0.9));
  bag.add(R, frustum([x0 + 0.7, z0 + 0.7, x1 - 0.7, z1 - 0.7], yC + 0.85, yC + 2.2, 0, 0, (Ls - 1.4) / 2, (Ls - 1.4) / 2));
  for (const f of ['n', 'e', 'w']) {
    const { M: FM, L } = faceFrame(rect, f, 0), Lc = new Local(), front = f === 'n', k = front ? n : 1, r = front ? rF : rS;
    // the piers: the front's four; on the sides only the back one (the front corners are the front's)
    const back = f === 'e' ? 0 : L;                                                        // the back end of a side face
    const pcs = front ? Array.from({ length: n + 1 }, (_, i) => pier / 2 + i * (2 * r + pier)) : [back ? L - pier / 2 : pier / 2];
    for (const c of pcs) {
      Lc.box(PF, c - pier / 2, yF, -pier, c + pier / 2, ys, 0);
      // half-columns on its faces, their bases, their capitals of leaves, the impost block
      for (const [du, dd] of [[-pier / 2, -pier / 2], [pier / 2, -pier / 2], [0, 0], [0, -pier]]) {
        Lc.add(SER, lathe([[0.4, 0], [0.4, 0.3], [0.31, 0.5], [0.28, Hs - 1.35], [0.34, Hs - 1.2], [0.48, Hs - 0.55], [0.58, Hs - 0.3], [0.58, Hs - 0.25]], 12, (th, j) => (j === 5 || j === 6 ? 1 + 0.12 * Math.cos(th * 8) : 1), c + du, yF, dd));
      }
      Lc.box(SER, c - pier / 2 - 0.45, ys - 0.25, -pier - 0.45, c + pier / 2 + 0.45, ys, 0.45);
      col.rect(wrect(FM, c - pier / 2 - 0.4, -pier - 0.4, c + pier / 2 + 0.4, 0.4), yF, ys);
    }
    // the arches: the spandrel wall over them, the white moulded archivolt, the grey outer roll
    const a0 = front ? 0 : pier, a1 = front ? L : L - pier;
    for (let i = 0; i < k; i++) {
      const uc = front ? pcs[i] + pier / 2 + r : (a0 + a1) / 2, a = uc - r, b = uc + r;
      const head = archOutline(uc, ys, 2 * r, ys, 'round', 12).slice(3, -1).reverse();
      const ua = front ? (i === 0 ? 0 : a - pier / 2) : (back ? pier : 0), ub = front ? (i === k - 1 ? L : b + pier / 2) : (back ? L : L - pier);
      Lc.add(PF, ext([[ub, yC - 0.6], [ua, yC - 0.6], [ua, ys], [a, ys], ...head, [b, ys], [ub, ys]], [], -pier, 0));
      voussoirs(Lc, M, uc, ys, r - 0.01, r + 0.45, 0, 0.1, 19, 0.0);
      voussoirs(Lc, SER, uc, ys, r + 0.45, r + 0.62, 0, 0.18, 19, 0.0);
    }
    // the four Virtues of the front in quatrefoils over the piers
    if (front) for (const c of pcs) quatrefoil(Lc, Math.min(L - 1.15, Math.max(1.15, c)), ys + rF * 0.62 + 0.4, 1.05);
    else quatrefoil(Lc, back ? pier / 2 : L - pier / 2, ys + rS * 0.6, 0.95);
    // the cornice on its brackets, the parapet of little trefoil arches, its coping
    Lc.box(PF, -0.3, yC - 0.6, -0.3, L + 0.3, yC - 0.35, 0.28);
    for (let u = 0.45; u < L - 0.2; u += 0.9) Lc.box(SER, u - 0.14, yC - 0.35, -0.04, u + 0.14, yC + 0.05, 0.32);
    Lc.box(PF, -0.45, yC + 0.05, -0.3, L + 0.45, yC + 0.4, 0.5);
    Lc.box(PF, -0.3, yC + 0.4, -0.6, L + 0.3, yC + 1.75, 0.0);
    const np = Math.round(L / 1.2), ps = L / np;
    for (let j = 0; j < np; j++) { const uc = (j + 0.5) * ps; Lc.add(M, ext(archOutline(uc, yC + 0.55, ps - 0.35, yC + 1.05, 'trefoil', 5), [], -0.02, 0.05)); }
    Lc.box(PF, -0.45, yC + 1.75, -0.7, L + 0.45, yC + 2.0, 0.12);
    Lc.emit(bag, FM);
  }
}
/** A quatrefoil medallion centred at (u, y), radius s: the frame in green marble, the deep ground, a seated Virtue in white with her attribute. */
function quatrefoil(Lc, u, y, s) {
  const pts = [], inner = [];
  for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2, rr = s * (0.66 + 0.34 * Math.abs(Math.cos(2 * a))); pts.push([u + Math.cos(a) * rr, y + Math.sin(a) * rr]); inner.push([u + Math.cos(a) * rr * 0.82, y + Math.sin(a) * rr * 0.82]); }
  Lc.add('verde_antico', ext(pts, [inner], 0, 0.1));
  Lc.add(O, ext(inner, [], 0, 0.03));                                                     // the deep ground (blue enamel in the original)
  Lc.add(M, ext([[u - 0.3, y - 0.6], [u + 0.3, y - 0.6], [u + 0.22, y - 0.08], [u + 0.13, y + 0.26], [u - 0.13, y + 0.26], [u - 0.22, y - 0.08]], [], 0.03, 0.12));
  Lc.add(M, T(ball(0.11, 0.13, 0.06, 8), u, y + 0.4, 0.1));
  Lc.add(GB, ext([[u - 0.44, y - 0.05], [u - 0.36, y - 0.05], [u - 0.32, y + 0.55], [u - 0.4, y + 0.55]], [], 0.03, 0.1));
}

/** ponte_vecchio: { span (between the abutments), w (the street), y (the street's level), bed, water } — along x, centred at the origin. */
export function ponteVecchio(el, { bag, col }) {
  const B = new Local();                                                                   // merged: the bridge is a plan of its own, every instanced shape would be a mesh more
  const S = el.span ?? 72, Wr = el.w ?? 10, y = el.y ?? 0.5, bed = el.bed ?? -7, wl = el.water ?? -4;
  const half = S / 2, pierW = 4.2, side = (S - 2 * pierW) * 0.31, mid = S - 2 * pierW - 2 * side, BW = Wr + 8, deck = y - 0.6;
  const piers = [-half + side, half - side - pierW];
  const yS = wl + 0.5, crown = deck - 0.9;                                                 // the springing just above the water
  const spans = [[-half, piers[0]], [piers[0] + pierW, piers[1]], [piers[1] + pierW, half]].map(([a, b]) => { const c = (a + b) / 2, hw = (b - a) / 2, rise = crown - yS, R0 = (hw * hw + rise * rise) / (2 * rise); return { a, b, c, R0, cy: crown - R0 }; });
  const arcY = (sp, u) => sp.cy + Math.sqrt(Math.max(0, sp.R0 * sp.R0 - (u - sp.c) ** 2));
  // the two faces: one wall from the deck down to the arches and the piers, the voussoirs, the string course
  for (const sz of [-1, 1]) {
    const Lc = new Local(), bottom = [[half + 6, deck], [half + 6, bed]];
    for (let j = spans.length - 1; j >= 0; j--) {
      const sp = spans[j];
      bottom.push([sp.b, bed], [sp.b, yS]);
      for (let i = 23; i >= 1; i--) { const u = sp.a + (sp.b - sp.a) * i / 24; bottom.push([u, arcY(sp, u)]); }
      bottom.push([sp.a, yS], [sp.a, bed]);
    }
    bottom.push([-half - 6, bed], [-half - 6, deck]);
    Lc.add(PF, ext(bottom, [], -0.9, 0));
    for (const sp of spans) for (let i = 0; i < 20; i++) {
      const u0 = sp.a + (sp.b - sp.a) * i / 20, u1 = sp.a + (sp.b - sp.a) * (i + 1) / 20, um = (u0 + u1) / 2, ym = arcY(sp, um), ang = Math.atan2(ym - sp.cy, um - sp.c), t = (sp.b - sp.a) / 20 * 0.47;
      const g = box(0, -t, 0, 1.15, t, 0.14); g.rotateZ(ang); g.translate(um, ym, 0); Lc.add(PF, g);
    }
    Lc.box(PF, -half - 6, deck - 0.3, -0.9, half + 6, deck + 0.05, 0.3);
    for (const list of Lc.m.values()) for (const g of list) { if (sz < 0) g.rotateY(Math.PI); g.translate(0, 0, sz * BW / 2); }
    Lc.emit(B);
  }
  // the soffits of the three vaults, the piers between the faces and their cutwaters up and down stream
  for (const sp of spans) { const rows = []; for (const z of [-BW / 2 + 0.85, BW / 2 - 0.85]) { const row = []; for (let i = 0; i <= 24; i++) { const u = sp.a + (sp.b - sp.a) * i / 24; row.push([u, arcY(sp, u), z]); } rows.push(row); } B.add(PF, sheet(rows)); }
  for (const p of piers) {
    B.add(PF, box(p, bed, -BW / 2 + 0.85, p + pierW, yS, BW / 2 - 0.85));
    for (const sz of [-1, 1]) {
      const zb = sz * BW / 2, tip = sz * (BW / 2 + 3.4), pts = [[p, -zb], [p + pierW, -zb], [p + pierW / 2, -tip]];
      const g = ext(pts, [], 0, wl + 1.6 - bed); g.rotateX(-Math.PI / 2); g.translate(0, bed, 0); B.add(PF, g);
      const cap = ext([[p - 0.15, -(zb - sz * 0.1)], [p + pierW + 0.15, -(zb - sz * 0.1)], [p + pierW / 2, -(tip + sz * 0.25)]], [], 0, 0.3); cap.rotateX(-Math.PI / 2); cap.translate(0, wl + 1.6, 0); B.add(PF, cap);
    }
  }
  // the street and its paving
  B.add(PF, box(-half - 6, deck, -Wr / 2, half + 6, y, Wr / 2)); col.floor([-half - 6, -Wr / 2, half + 6, Wr / 2], y);
  B.add(PF, box(-half - 6, deck, -BW / 2, half + 6, y - 0.02, -Wr / 2)); B.add(PF, box(-half - 6, deck, Wr / 2, half + 6, y - 0.02, BW / 2));
  // the shops: two rows, each a stone-framed front with its counter and shutters on the street, the
  // back shop hanging over the river on timber brackets, a tiled roof falling to the river; the
  // middle of the bridge left open over the central arch
  const midA = piers[0] + pierW + mid * 0.3, midB = piers[1] - mid * 0.3, rand = rng(1442);
  for (const sz of [-1, 1]) for (const [a, b] of [[-half - 4, midA], [midB, half + 4]]) {
    const nS = Math.max(1, Math.round((b - a) / 3.8)), sw = (b - a) / nS;
    for (let i = 0; i < nS; i++) {
      const u0 = a + i * sw, u1 = u0 + sw, zr = sz * Wr / 2, zb = sz * BW / 2, over = Math.abs(u0 + sw / 2) < half - 1;
      // the shop and its back shop; some with a storey over the shop
      const zo = over ? sz * (BW / 2 + 1.4 + rand() * 0.9) : zb, upper = rand() < 0.4, Hs = 4.4 + (upper ? 2.6 : 0);
      const zA = Math.min(zr, zo), zB = Math.max(zr, zo), dep = zB - zA, eave = Hs - 1.1, top = PF;
      B.add(PF, box(u0, y, Math.min(zr, zb), u1, y + (upper ? 4.4 : eave), Math.max(zr, zb)));
      if (over) B.add(PF, box(u0, y, Math.min(zb, zo), u1, y + (upper ? 4.4 : eave), Math.max(zb, zo)));
      if (upper) { B.add(PF, box(u0, y + 4.4, zA, u1, y + eave, zB)); B.add(W, box(u0 - 0.05, y + 4.3, zA - 0.05, u1 + 0.05, y + 4.5, zB + 0.05)); }
      B.add(top, frustum([u0, zA, u1, zB], y + eave, y + Hs, 0, 0, sz > 0 ? 0 : dep, sz > 0 ? dep : 0));
      col.rect([u0, Math.min(zr, zb), u1, Math.max(zr, zb)], y, y + Hs);
      // the front: stone jambs and lintel, the dark of the shop, the counter, the upper shutter propped as an awning
      const Z = (d0, d1) => [Math.min(zr - sz * d0, zr - sz * d1), Math.max(zr - sz * d0, zr - sz * d1)];
      let q = Z(-0.02, 0.04); B.add(W, box(u0 + 0.5, y + 0.9, q[0], u1 - 0.5, y + 3.3, q[1]));
      q = Z(-0.02, 0.28); B.add(PF, box(u0 + 0.06, y, q[0], u0 + 0.5, y + 3.7, q[1])); B.add(PF, box(u1 - 0.5, y, q[0], u1 - 0.06, y + 3.7, q[1])); B.add(PF, box(u0 + 0.06, y + 3.3, q[0], u1 - 0.06, y + 3.7, q[1]));
      q = Z(-0.02, 0.55); B.add(W, box(u0 + 0.55, y, q[0], u1 - 0.55, y + 0.85, q[1]));
      q = Z(-0.02, 0.7); B.add(W, box(u0 + 0.5, y + 0.85, q[0], u1 - 0.5, y + 0.95, q[1]));
      const aw = box(u0 + 0.5, -0.04, 0, u1 - 0.5, 0.04, 1.1); aw.rotateX(-0.45); if (sz > 0) { aw.rotateY(Math.PI); aw.translate(u0 + u1, 0, 0); } aw.translate(0, y + 3.3, zr - sz * 0.29); B.add(W, aw);
      // the brackets under the back shop, its floor, a small window to the river
      if (over) {
        for (const uu of [u0 + 0.45, u1 - 0.45]) { B.add(W, rod([uu, deck - 2.6, zb], [uu, deck - 0.3, (zb + zo) / 2 + sz * 0.5], 0.12, 6)); B.add(W, box(uu - 0.12, deck - 0.3, Math.min(zb, zo) - 0.3, uu + 0.12, deck, Math.max(zb, zo) + 0.3)); }
        B.add(W, box(u0, deck, Math.min(zb, zo), u1, y, Math.max(zb, zo)));
        const zw = zo + sz * 0.06; B.add(W, box(u0 + sw / 2 - 0.4, y + 1.4, Math.min(zo, zw), u0 + sw / 2 + 0.4, y + 2.4, Math.max(zo, zw)));
      }
      // the roof, falling to the river
      const roof = box(u0 - 0.03, 0, -0.45, u1 + 0.03, 0.18, dep + 0.5); roof.rotateX(Math.atan2(1.1, dep));
      if (sz < 0) { roof.rotateY(Math.PI); roof.translate(u0 + u1, 0, 0); }
      roof.translate(0, y + Hs + 0.02, zr); B.add(R, roof);
    }
  }
  // the open middle: a parapet on each side over the river
  for (const sz of [-1, 1]) { const za = sz * (BW / 2 - 0.6), zz = sz * BW / 2, r = [midA, Math.min(za, zz), midB, Math.max(za, zz)]; B.add(PF, box(r[0], deck, r[1], r[2], y + 1.0, r[3])); col.rect(r, y, y + 1.0); }
  B.emit(bag);
}
