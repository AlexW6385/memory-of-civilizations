// The Dome of the Rock's own pieces, on top of the early Islamic style (src/styles/islamic): the outer
// walls' articulation (marble panels and their fillets below, a blind arcade on pilasters in the mosaic
// above, framed windows with grilles, the cornices), the alternating light and dark voussoirs (ablaq) of
// the arcades, the drum's framed windows, and the wooden screen round the Rock. docs/buildings/dome-of-the-rock.md §4, §7, §8.

import '../../styles/islamic/index.js';
import { STYLES, registerStyle } from '../../core/build.js';
import { lathe, fromTriangles, box } from '../../core/geom.js';
import { hexa } from '../../styles/chinese/index.js';

const T22 = Math.tan(Math.PI / 8);

/** A frame on a wall: origin o (on the centre line), u along, n out. W(u, y, d) is a point d out from the centre line. */
const frame = (o, u, n) => (uu, y, d) => [o[0] + u[0] * uu + n[0] * d, y, o[1] + u[1] * uu + n[1] * d];
/** A box on the face: u0…u1, y0…y1, d0…d1 out from the centre line. */
function fbox(out, W, u0, u1, y0, y1, d0, d1) {
  hexa(out, [W(u0, y0, d0), W(u1, y0, d0), W(u1, y0, d1), W(u0, y0, d1)], [W(u0, y1, d0), W(u1, y1, d0), W(u1, y1, d1), W(u0, y1, d1)]);
}
/** A band along a side of the octagon, its ends mitred to meet the neighbouring sides. */
function band(out, W, L, y0, y1, d0, d1) {
  const P = (d, end, y) => W(end ? L + d * T22 : -d * T22, y, d);
  hexa(out, [P(d0, 0, y0), P(d0, 1, y0), P(d1, 1, y0), P(d1, 0, y0)], [P(d0, 0, y1), P(d0, 1, y1), P(d1, 1, y1), P(d1, 0, y1)]);
}
/** A semicircular ring (archivolt) at uc, springing at sp, radii r0…r1, depth d0…d1, in n voussoirs; odd ones to `alt`. */
function ring(out, alt, W, uc, sp, r0, r1, d0, d1, n = 9) {
  for (let i = 0; i < n; i++) {
    const a = Math.PI * (1 - i / n), b = Math.PI * (1 - (i + 1) / n);
    const P = (r, t, d) => W(uc + r * Math.cos(t), sp + r * Math.sin(t), d);
    hexa(i % 2 && alt ? alt : out, [P(r0, a, d0), P(r1, a, d0), P(r1, b, d0), P(r0, b, d0)], [P(r0, a, d1), P(r1, a, d1), P(r1, b, d1), P(r0, b, d1)]);
  }
}
/** A grille of crossing bars filling an opening (u0…u1, y0 to an arched head at sp, radius r) in the plane d. */
function grille(out, W, uc, r, y0, sp, d, cell = 0.22, bar = 0.035) {
  const top = (uu) => sp + Math.sqrt(Math.max(0, r * r - (uu - uc) ** 2));
  for (let uu = uc - r + cell / 2; uu < uc + r - 0.01; uu += cell) fbox(out, W, uu - bar, uu + bar, y0, top(uu) - 0.02, d - bar, d + bar);
  for (let y = y0 + cell; y < sp + r - 0.05; y += cell) {
    const hw = y <= sp ? r : Math.sqrt(Math.max(0, r * r - (y - sp) ** 2));
    if (hw > 0.06) fbox(out, W, uc - hw + 0.01, uc + hw - 0.01, y - bar, y + bar, d - bar * 0.9, d + bar * 0.9);
  }
}

/**
 * The articulation of one outer side { o, u, n, L, th, arches, marbleTop, top }: a dark plinth; marble panels framed by dark
 * fillets, two to a bay; a moulded string course at the top of the marble; above, in the mosaic, pilasters between the seven
 * bays carrying a blind arcade whose arches frame the windows; the windows' own marble frames and their grilles; gilt
 * roundels in the spandrels; a gilt frieze and a cornice under the top of the parapet. The door's frame of light and dark voussoirs.
 */
function dotrFace(el, { bag }) {
  const { L, th, arches = [], marbleTop = 5.6, top } = el, W = frame(el.o, el.u, el.n), F0 = th / 2 + 0.06;
  const dark = [], light = [], gold = [], bars = [];
  const door = arches.find((a) => a.sill === 0 && a.spring < 6);
  const inDoor = (uu, pad = 0) => door && Math.abs(uu - door.uc) < door.r + 0.5 + pad;
  // the plinth, the fillets of the marble zone, the string course
  band(dark, W, L, 0, 0.36, F0 - 0.02, F0 + 0.06);
  const bay = L / 7;
  for (let k = 0; k <= 14; k++) {
    const uu = Math.min(L - 0.3, Math.max(0.3, k * bay / 2));
    if (inDoor(uu, 0.2)) continue;
    fbox(dark, W, uu - 0.07, uu + 0.07, 0.36, marbleTop - 0.14, F0 - 0.01, F0 + 0.025);
  }
  for (const y of [2.95]) {
    const runs = door ? [[0.2, door.uc - door.r - 0.55], [door.uc + door.r + 0.55, L - 0.2]] : [[0.2, L - 0.2]];
    for (const [a, b] of runs) fbox(dark, W, a, b, y - 0.07, y + 0.07, F0 - 0.01, F0 + 0.025);
  }
  if (door) {
    // the door's jambs and its arch of alternating voussoirs, the string course broken round it
    for (const s of [-1, 1]) fbox(light, W, door.uc + s * door.r, door.uc + s * (door.r + 0.45), 0.36, door.spring, F0 - 0.01, F0 + 0.08);
    ring(light, dark, W, door.uc, door.spring, door.r, door.r + 0.45, F0 - 0.01, F0 + 0.08, 11);
    const a = door.uc - door.r - 0.5, b = door.uc + door.r + 0.5;
    const P = (d, end, y) => W(end ? L + d * T22 : -d * T22, y, d);
    hexa(light, [P(F0 - 0.02, 0, marbleTop - 0.14), W(a, marbleTop - 0.14, F0 - 0.02), W(a, marbleTop - 0.14, F0 + 0.14), P(F0 + 0.14, 0, marbleTop - 0.14)],
      [P(F0 - 0.02, 0, marbleTop + 0.12), W(a, marbleTop + 0.12, F0 - 0.02), W(a, marbleTop + 0.12, F0 + 0.14), P(F0 + 0.14, 0, marbleTop + 0.12)]);
    hexa(light, [W(b, marbleTop - 0.14, F0 - 0.02), P(F0 - 0.02, 1, marbleTop - 0.14), P(F0 + 0.14, 1, marbleTop - 0.14), W(b, marbleTop - 0.14, F0 + 0.14)],
      [W(b, marbleTop + 0.12, F0 - 0.02), P(F0 - 0.02, 1, marbleTop + 0.12), P(F0 + 0.14, 1, marbleTop + 0.12), W(b, marbleTop + 0.12, F0 + 0.14)]);
  } else band(light, W, L, marbleTop - 0.14, marbleTop + 0.12, F0 - 0.02, F0 + 0.14);
  // the upper zone: pilasters with capitals and bases between the bays, the blind arcade
  const sp = 7.9, rb = bay / 2 - 0.26;
  for (let k = 0; k <= 7; k++) {
    const uu = k === 0 ? 0.22 : k === 7 ? L - 0.22 : k * bay;
    const y0 = door && Math.abs(uu - door.uc) < door.r + 0.6 ? 6.4 : marbleTop + 0.12;
    fbox(light, W, uu - 0.2, uu + 0.2, y0, sp - 0.22, F0 - 0.01, F0 + 0.1);
    fbox(light, W, uu - 0.26, uu + 0.26, y0, y0 + 0.16, F0 - 0.01, F0 + 0.13);
    fbox(light, W, uu - 0.27, uu + 0.27, sp - 0.22, sp, F0 - 0.01, F0 + 0.14);
  }
  for (let b = 0; b < 7; b++) {
    const uc = (b + 0.5) * bay;
    ring(light, null, W, uc, sp, rb, rb + 0.2, F0 - 0.01, F0 + 0.09, 13);
  }
  // windows: an inner frame, the sill, a grille in the middle of the wall
  for (const a of arches) {
    if (a === door) continue;
    ring(light, null, W, a.uc, a.spring, a.r, a.r + 0.14, F0 - 0.01, F0 + 0.05, 9);
    for (const s of [-1, 1]) fbox(light, W, a.uc + s * a.r, a.uc + s * (a.r + 0.14), a.sill, a.spring, F0 - 0.01, F0 + 0.05);
    fbox(light, W, a.uc - a.r - 0.2, a.uc + a.r + 0.2, a.sill - 0.12, a.sill, F0 - 0.01, F0 + 0.12);
    grille(bars, W, a.uc, a.r, a.sill, a.spring, 0);
  }
  // the frieze and the cornice at the top of the parapet
  band(gold, W, L, top - 0.95, top - 0.6, F0 - 0.02, F0 + 0.03);
  band(light, W, L, top - 0.3, top - 0.1, F0 - 0.02, F0 + 0.12);
  band(light, W, L, top - 0.1, top + 0.06, F0 - 0.02, F0 + 0.22);
  // a gilt roundel in each spandrel, over the pilasters
  const G = [];
  for (let b = 1; b < 7; b++) {
    const p = W(b * bay, sp + rb + 0.85, F0 - 0.01);
    G.push(lathe([[0.001, 0], [0.3, 0], [0.32, 0.03], [0.22, 0.05], [0.001, 0.06]], 16).rotateX(Math.PI / 2).rotateY(Math.atan2(el.n[0], el.n[1])).translate(p[0], p[1], p[2]));
  }
  bag.add(el.darkMat || 'marble_dark', fromTriangles(dark));
  bag.add(el.lightMat || 'marble', fromTriangles(light));
  bag.add(el.goldMat || 'mosaic_gold', fromTriangles(gold));
  for (const g of G) bag.add(el.goldMat || 'mosaic_gold', g);
  bag.add('marble', fromTriangles(bars));
}
/** Light and dark voussoirs round the arches of an arcade { o, u, th, arches, ring (depth of the band), n }, on both faces. */
function ablaq(el, { bag }) {
  const n = [-el.u[1], el.u[0]], W = frame(el.o, el.u, n), light = [], dark = [];
  for (const a of el.arches) for (const s of [-1, 1]) {
    const d0 = s * (el.th / 2 - 0.01), d1 = s * (el.th / 2 + 0.03);
    ring(light, dark, W, a.uc, a.spring, a.r, a.r + (el.ring || 0.42), Math.min(d0, d1), Math.max(d0, d1), el.n || 11);
  }
  bag.add(el.lightMat || 'marble', fromTriangles(light));
  bag.add(el.darkMat || 'marble_dark', fromTriangles(dark));
}

/**
 * The drum's sixteen windows framed outside { c, r (outer face), wins: [angles°], w, y0, y1, base }: a colonnette either side
 * with a capital, an arch of light and dark voussoirs over the window, a grille in the opening; a moulding where the roof meets the drum.
 */
function drumFrames(el, { bag }) {
  const [cx, cz] = el.c, light = [], dark = [], bars = [], cols = [];
  for (const deg of el.wins) {
    const a = deg * Math.PI / 180, n = [Math.cos(a), Math.sin(a)], u = [-Math.sin(a), Math.cos(a)];
    const W = frame([cx, cz], u, n), hw = el.w / 2, r = el.r;
    ring(light, dark, W, 0, el.y1, hw + 0.04, hw + 0.32, r - 0.02, r + 0.08, 9);
    for (const s of [-1, 1]) {
      const p = W(s * (hw + 0.17), 0, r + 0.08);
      cols.push(lathe([[0.13, 0], [0.13, 0.08], [0.09, 0.14], [0.08, el.y1 - el.y0 - 0.3], [0.13, el.y1 - el.y0 - 0.08], [0.15, el.y1 - el.y0]], 10, null, p[0], el.y0 - 0.1, p[2]));
    }
    fbox(light, W, -hw - 0.35, hw + 0.35, el.y0 - 0.22, el.y0 - 0.08, r - 0.02, r + 0.2);
    grille(bars, W, 0, hw, el.y0, el.y1 - hw, r - 0.55, 0.2, 0.03);
  }
  bag.add('marble', fromTriangles(light));
  bag.add('marble_dark', fromTriangles(dark));
  bag.add('marble', fromTriangles(bars));
  for (const g of cols) bag.add('marble_column', g);
  // the moulding at the foot of the drum, over the lead roof
  bag.add('marble', lathe([[el.r + 0.02, 0], [el.r + 0.22, 0], [el.r + 0.22, 0.12], [el.r + 0.1, 0.24], [el.r + 0.02, 0.26]], 64, null, cx, el.base, cz));
}

/**
 * The wooden screen round the Rock between two supports { a, b, h }: posts at the ends, a plinth rail, a top rail with a
 * moulded cap, and between them a close row of turned balusters, a middle rail at two thirds. [inferred: a low barrier; the
 * later Crusader grille is not shown]
 */
function rockScreen(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, y = el.y ?? 0, h = el.h ?? 1.4;
  const L = Math.hypot(bx - ax, bz - az), u = [(bx - ax) / L, (bz - az) / L], n = [-u[1], u[0]], W = frame(el.a, u, n);
  const rails = [], bal = [];
  for (const uu of [0.06, L - 0.06]) fbox(rails, W, uu - 0.07, uu + 0.07, y, y + h + 0.1, -0.07, 0.07);
  fbox(rails, W, 0, L, y, y + 0.14, -0.06, 0.06);
  fbox(rails, W, 0, L, y + h - 0.1, y + h, -0.055, 0.055);
  fbox(rails, W, 0, L, y + h, y + h + 0.05, -0.08, 0.08);
  fbox(rails, W, 0, L, y + h * 0.66 - 0.04, y + h * 0.66 + 0.04, -0.05, 0.05);
  const nb = Math.max(2, Math.round((L - 0.2) / 0.13));
  const prof = (y0, hh) => [[0.022, y0], [0.03, y0 + hh * 0.12], [0.018, y0 + hh * 0.3], [0.032, y0 + hh * 0.5], [0.018, y0 + hh * 0.7], [0.03, y0 + hh * 0.88], [0.022, y0 + hh]];
  for (let i = 1; i < nb; i++) {
    const p = W(0.1 + (L - 0.2) * i / nb, 0, 0);
    bal.push(lathe(prof(y + 0.14, h * 0.66 - 0.18), 6, null, p[0], 0, p[2]));
    bal.push(lathe(prof(y + h * 0.66 + 0.04, h * 0.34 - 0.14), 6, null, p[0], 0, p[2]));
  }
  bag.add('cedar', fromTriangles(rails));
  for (const g of bal) bag.add('cedar', g);
  col.segment(el.a, el.b, 0.12, y, y + h);
}


// ── the mosaics of 691/92 (docs/settlements/jerusalem.md §1c) ───────────────────────────────────
// On the gold ground of the arcades and the drum: trees and acanthus scrolls rising from vases, in greens
// and blues, set with jewels — red stones and mother-of-pearl — and crowned; along the top of the octagonal
// arcade, on both faces, the inscription band of gold letters on a turquoise ground. Flat pieces a little proud
// of the walls, built in a face's frame W(u, y, d).

/** A flat polygon [[u, y] …] at depth d of a frame, both faces. */
function flat(T, W, pts, d) {
  for (let i = 1; i < pts.length - 1; i++) {
    const a = W(pts[0][0], pts[0][1], d), b = W(pts[i][0], pts[i][1], d), c = W(pts[i + 1][0], pts[i + 1][1], d);
    T.push(...a, ...b, ...c, ...a, ...c, ...b);
  }
}
/** A leaf: a pointed lozenge from p along angle a, length l, width w. */
const leaf = (T, W, [u, y], a, l, w, d) => { const c = Math.cos(a), s = Math.sin(a); flat(T, W, [[u, y], [u + c * l * 0.4 - s * w / 2, y + s * l * 0.4 + c * w / 2], [u + c * l, y + s * l], [u + c * l * 0.4 + s * w / 2, y + s * l * 0.4 - c * w / 2]], d); };
/** A disc of n sides, radius r. */
const disc = (T, W, [u, y], r, d, n = 8) => flat(T, W, Array.from({ length: n }, (_, k) => [u + Math.cos(k / n * 6.2832) * r, y + Math.sin(k / n * 6.2832) * r]), d);
/** A jewel: a red stone in a ring of pearls. */
function jewel(M, W, p, r, d) {
  disc(M.pearl, W, p, r * 1.5, d, 10); disc(M.red, W, p, r, d + 0.004, 8);
}
/**
 * A tree of the mosaics at uc from y0, h high, s its scale across: a vase on its foot, the stem rising from it, scrolls of
 * acanthus leaves curling out to both sides (in greens, the turned leaves in blue), a jewel at the heart of each scroll,
 * a crown of pearls and a red stone at the top.
 */
function mosaicTree(M, W, uc, y0, h, s, d) {
  // the vase
  flat(M.green, W, [[uc - 0.09 * s, y0], [uc + 0.09 * s, y0], [uc + 0.06 * s, y0 + 0.06 * s], [uc - 0.06 * s, y0 + 0.06 * s]], d);
  flat(M.blue, W, [[uc - 0.06 * s, y0 + 0.06 * s], [uc + 0.06 * s, y0 + 0.06 * s], [uc + 0.2 * s, y0 + 0.2 * s], [uc + 0.16 * s, y0 + 0.34 * s], [uc - 0.16 * s, y0 + 0.34 * s], [uc - 0.2 * s, y0 + 0.2 * s]], d);
  flat(M.pearl, W, [[uc - 0.16 * s, y0 + 0.34 * s], [uc + 0.16 * s, y0 + 0.34 * s], [uc + 0.12 * s, y0 + 0.38 * s], [uc - 0.12 * s, y0 + 0.38 * s]], d + 0.003);
  flat(M.green, W, [[uc - 0.08 * s, y0 + 0.38 * s], [uc + 0.08 * s, y0 + 0.38 * s], [uc + 0.17 * s, y0 + 0.47 * s], [uc - 0.17 * s, y0 + 0.47 * s]], d);
  jewel(M, W, [uc, y0 + 0.2 * s], 0.04 * s, d + 0.004);
  // the stem
  const yS = y0 + 0.47 * s, yT = y0 + h;
  flat(M.green, W, [[uc - 0.035 * s, yS], [uc + 0.035 * s, yS], [uc + 0.025 * s, yT - 0.15 * s], [uc - 0.025 * s, yT - 0.15 * s]], d);
  // the scrolls, alternating side to side, smaller as they rise
  const n = Math.max(2, Math.round((yT - yS) / (0.36 * s)));
  for (let k = 0; k < n; k++) {
    const t = (k + 0.5) / n, yy = yS + (yT - yS - 0.2 * s) * t, side = k % 2 ? 1 : -1, R = (0.27 - 0.08 * t) * s, cxs = uc + side * (R + 0.04 * s);
    // the scroll: a ring of leaves curling in to its jewel, an outer fringe of acanthus lobes
    for (let j = 0; j < 9; j++) {
      const a = -Math.PI / 2 + side * (Math.PI - j * 0.72), rr = R * (1 - j * 0.07);
      leaf(j % 3 === 2 ? M.blue : M.green, W, [cxs + Math.cos(a) * rr, yy + Math.sin(a) * rr], a + side * Math.PI / 2, 0.2 * s * (1 - j * 0.05), 0.085 * s, d + 0.002);
    }
    for (let j = 0; j < 5; j++) { const a = side > 0 ? -0.9 + j * 0.45 : Math.PI + 0.9 - j * 0.45; leaf(j % 2 ? M.blue : M.green, W, [cxs + Math.cos(a) * R * 1.05, yy + Math.sin(a) * R * 1.05], a, 0.13 * s, 0.07 * s, d + 0.003); }
    jewel(M, W, [cxs, yy], 0.032 * s, d + 0.005);
    // the pair of leaves at the scroll's root on the stem
    leaf(M.green, W, [uc, yy - R * 0.6], Math.PI / 2 + side * 0.9, 0.16 * s, 0.065 * s, d + 0.002);
  }
  // the crown: a band with pearls, a red stone, three points
  const yc = yT - 0.15 * s;
  flat(M.pearl, W, [[uc - 0.1 * s, yc], [uc + 0.1 * s, yc], [uc + 0.1 * s, yc + 0.05 * s], [uc - 0.1 * s, yc + 0.05 * s]], d + 0.002);
  for (const k of [-1, 0, 1]) flat(M.green, W, [[uc + k * 0.07 * s - 0.03 * s, yc + 0.05 * s], [uc + k * 0.07 * s + 0.03 * s, yc + 0.05 * s], [uc + k * 0.07 * s, yc + 0.13 * s]], d + 0.002);
  jewel(M, W, [uc, yc + 0.025 * s], 0.018 * s, d + 0.006);
}
/** The inscription band from u0 to u1 between y0 and y1: the turquoise ground, gold letters in the manner of the early Kufic — a baseline, the tall shafts and the low letters, the bowls and the joins — in words. */
function inscription(M, W, u0, u1, y0, y1, d, seed) {
  let r = seed >>> 0 || 7; const rnd = () => ((r = (r * 1664525 + 1013904223) >>> 0) / 4294967296);
  flat(M.band, W, [[u0, y0], [u1, y0], [u1, y1], [u0, y1]], d);
  const h = y1 - y0, base = y0 + h * 0.25, sw = h * 0.07, D = d + 0.006;
  // thin gold rules along both edges of the band
  flat(M.gold, W, [[u0, y0 + h * 0.04], [u1, y0 + h * 0.04], [u1, y0 + h * 0.09], [u0, y0 + h * 0.09]], D);
  flat(M.gold, W, [[u0, y1 - h * 0.09], [u1, y1 - h * 0.09], [u1, y1 - h * 0.04], [u0, y1 - h * 0.04]], D);
  let u = u0 + h * 0.3;
  while (u < u1 - h * 0.6) {
    const word = 2 + Math.floor(rnd() * 4), w0 = u;
    for (let k = 0; k < word && u < u1 - h * 0.4; k++) {
      const kind = rnd(), H = kind < 0.35 ? 0.62 : kind < 0.6 ? 0.3 : 0.18;
      if (kind < 0.35) flat(M.gold, W, [[u, base], [u + sw, base], [u + sw, base + h * H], [u, base + h * H]], D);                 // alif, lam: the tall shaft
      else if (kind < 0.6) { flat(M.gold, W, [[u, base], [u + sw, base], [u + sw, base + h * H], [u, base + h * H]], D); flat(M.gold, W, [[u, base + h * H - sw], [u + h * 0.16, base + h * H - sw], [u + h * 0.16, base + h * H], [u, base + h * H]], D); }   // the low letters with their heads
      else if (kind < 0.8) { const c = [u + h * 0.09, base + h * 0.12]; flat(M.gold, W, Array.from({ length: 8 }, (_, j) => [c[0] + Math.cos(j / 8 * 6.28) * h * 0.1, c[1] + Math.sin(j / 8 * 6.28) * h * 0.1]), D); flat(M.band, W, Array.from({ length: 6 }, (_, j) => [c[0] + Math.cos(j / 6 * 6.28) * h * 0.045, c[1] + Math.sin(j / 6 * 6.28) * h * 0.045]), D + 0.003); }   // mim, waw: the bowls
      else flat(M.gold, W, [[u, base - h * 0.14], [u + sw, base - h * 0.14], [u + h * 0.12, base], [u + h * 0.12 - sw, base]], D);  // the tails below the line
      u += h * (0.18 + rnd() * 0.08);
    }
    flat(M.gold, W, [[w0 - sw * 0.5, base - sw], [u - h * 0.08, base - sw], [u - h * 0.08, base + sw * 0.3], [w0 - sw * 0.5, base + sw * 0.3]], D);  // the line joining the word
    u += h * 0.3;
  }
}
const MATS = { green: 'mosaic_green', blue: 'inlay_lapis', red: 'inlay_carnelian', pearl: 'glaze_white', gold: 'mosaic_gold', band: 'tile_turquoise' };
const newM = () => Object.fromEntries(Object.keys(MATS).map((k) => [k, []]));
function flush(bag, M) { for (const [k, T] of Object.entries(M)) if (T.length) bag.add(MATS[k], fromTriangles(T)); }
/**
 * dotr_mosaic: { o, u, L, th, arches, top, band: [y0, y1], faces: [1, -1] } — one side of an arcade: a tree in each
 * spandrel (between the arches and at the ends) on both faces, and the inscription band along the top.
 */
function dotrMosaic(el, { bag }) {
  const n = [-el.u[1], el.u[0]], M = newM(), A = el.arches, ring = el.ring ?? 0.42, W0 = frame(el.o, el.u, n);
  for (const f of el.faces ?? [1, -1]) {
    const W = (uu, y, dd) => W0(uu, y, f * dd), d = el.th / 2 + 0.03;
    if (el.band) inscription(M, W, 0.15, el.L - 0.15, el.band[0], el.band[1], d - 0.01, (el.seed ?? 1) * 7 + (f > 0 ? 3 : 0));
    // the spandrels: between neighbouring arches, and at the ends beyond the first and last
    if (el.single) { const q = A[0]; mosaicTree(M, W, 0.12, q.spring + q.r * 0.78, el.top - 0.2 - q.spring - q.r * 0.78, 0.8, d + 0.005); continue; }
    for (let i = 0; i <= A.length; i++) {
      const a = A[i - 1], b = A[i];
      const uc = a && b ? (a.uc + a.r + b.uc - b.r) / 2 : a ? Math.min(el.L - 0.25, a.uc + a.r + ring + 0.3) : Math.max(0.25, b.uc - b.r - ring - 0.3);
      const q = a ?? b, top = el.band ? el.band[0] - 0.1 : el.top - 0.2, y0 = q.spring + q.r * (a && b ? 0.55 : 0.8), s = a && b ? 1.0 : 0.6;
      if (top - y0 > 0.8) mosaicTree(M, W, uc, y0, top - y0, s, d + 0.005);
    }
  }
  flush(bag, M);
}
/** drum_mosaic: { c, r (inner face), wins: [angles°], w, y0, y1 (the windows), base, top } — the drum's inside: a tree between each two windows, and below them, over the arcade, a frieze of scrolls. */
function drumMosaic(el, { bag }) {
  const M = newM(), [cx, cz] = el.c, R = el.r - 0.04, ws = el.wins;
  for (let k = 0; k < ws.length; k++) {
    const a = ((ws[k] + ws[(k + 1) % ws.length] + (k === ws.length - 1 ? 360 : 0)) / 2) * Math.PI / 180;
    const n = [-Math.cos(a), -Math.sin(a)], u = [-Math.sin(a), Math.cos(a)], o = [cx - n[0] * R, cz - n[1] * R];
    const W = frame(o, u, n);
    // between the windows: a tall tree; below: a tree on the lower zone, a jewelled vase between
    mosaicTree(M, W, 0, el.y0 - 0.3, el.y1 + 1.1 - el.y0, 1.55, 0.02);
    mosaicTree(M, W, 0, el.base + 0.5, el.y0 - el.base - 1.3, 1.65, 0.02);
    const am = ws[k] * Math.PI / 180, n2 = [-Math.cos(am), -Math.sin(am)], u2 = [-Math.sin(am), Math.cos(am)], o2 = [cx - n2[0] * R, cz - n2[1] * R];
    mosaicTree(M, frame(o2, u2, n2), 0, el.base + 0.7, el.y0 - el.base - 1.5, 1.6, 0.02);
  }
  flush(bag, M);
}

// ── the Rock and its cave ──────────────────────────────────────────────────────────────────────
/** The cave under the Rock's south-east (≈ 4.5 m square) and the steps down to it from the south. */
export const CAVE = { rect: [0.4, 0.9, 4.9, 5.4], floor: -1.6, roof: 0.45, stair: [2.0, 5.4, 3.2, 8.1] };
const inR = (r, x, z, m = 0) => x > r[0] - m && x < r[2] + m && z > r[1] - m && z < r[3] + m;
/**
 * sakhra: { at, rx, rz, h } — the Rock: an outcrop of grey limestone ≈ 17.7 × 13.5 m rising ≈ 1.5 m, highest toward the
 * north-west; its surface broken and pitted, with flat-cut stretches; a low clean-cut scarp along its west and north
 * edges; on the south a ledge, under which the steps go down into the cave (CAVE), cut away over the steps.
 */
function sakhra(el, { bag, col, lights }) {
  const [x, z] = el.at, rx = el.rx, rz = el.rz, H = el.h, n = 112, m = 30;
  const wob = (a) => 1 + 0.1 * Math.sin(a * 3 + 1) + 0.06 * Math.sin(a * 7) + 0.03 * Math.sin(a * 13 + 2);
  const ht = (u, v, px, pz) => {
    const r = Math.hypot(u, v);
    if (r >= 0.999) return -0.15;
    if (inR(CAVE.stair, px, pz, 0.35)) return -0.15;
    let h = H * Math.pow(1 - r * r, 0.45) * (0.82 + 0.18 * Math.sin(u * 7.1 + 1.3) * Math.cos(v * 5.3 + 0.4) + 0.08 * Math.sin(u * 17 + v * 11) + 0.04 * Math.sin(u * 41 - v * 29));
    h *= 1 - 0.28 * Math.max(0, u) - 0.15 * Math.max(0, v);                            // lower to the south-east
    if (u < -0.82 || v < -0.85) h = Math.max(h, 0.55 + 0.1 * Math.sin(u * 23));        // the scarp on the west and north
    if (Math.abs(u + 0.15) < 0.22 && Math.abs(v + 0.1) < 0.3) h = H * 0.86;             // a flat-cut stretch
    return Math.max(h, inR(CAVE.rect, px, pz, 0.25) ? CAVE.roof + 0.45 : -0.15);
  };
  const P = (a, r) => { const px = x + Math.cos(a) * r * wob(a) * rx, pz = z + Math.sin(a) * r * wob(a) * rz; return [px, (el.y ?? 0) + ht(Math.cos(a) * r, Math.sin(a) * r, px, pz), pz]; };
  const T = [];
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
    const a0 = 2 * Math.PI * i / n, a1 = 2 * Math.PI * (i + 1) / n, r0 = Math.pow(j / m, 0.8), r1 = Math.pow((j + 1) / m, 0.8);
    const A = P(a0, r0), B = P(a1, r0), C = P(a1, r1), D = P(a0, r1);
    T.push(...A, ...D, ...C, ...A, ...C, ...B, ...A, ...C, ...D, ...A, ...B, ...C);
  }
  bag.add('rock_boulder', fromTriangles(T));
  col.circle(x, z, Math.min(rx, rz) * 0.85, CAVE.roof, H + 0.3);
  // the cave: its floor of rock, walls of the rock, the roof (the Rock's underside), the steps down from the south
  const [c0, d0, c1, d1] = CAVE.rect, F = CAVE.floor;
  const bx = (m2, a, b, c, d, y0, y1) => bag.add(m2, box(a, y0, b, c, y1, d));
  bx('rock_boulder', c0, d0, c1, d1, F - 0.3, F);
  bx('rock_boulder', c0 - 0.4, d0 - 0.4, c1 + 0.4, d0, F - 0.3, CAVE.roof + 0.15);
  bx('rock_boulder', c0 - 0.4, d0, c0, d1 + 0.4, F - 0.3, CAVE.roof + 0.15);
  bx('rock_boulder', c1, d0, c1 + 0.4, d1 + 0.4, F - 0.3, CAVE.roof + 0.15);
  const [s0, , s1, t1] = CAVE.stair;
  bx('rock_boulder', c0, d1, s0, d1 + 0.4, F - 0.3, CAVE.roof + 0.15);
  bx('rock_boulder', s1, d1, c1, d1 + 0.4, F - 0.3, CAVE.roof + 0.15);
  bx('rock_boulder', c0, d0, c1, d1, CAVE.roof, CAVE.roof + 0.2);
  col.floor([c0, d0, c1, d1], F);
  col.rect([c0 - 0.4, d0 - 0.4, c1 + 0.4, d0], F, CAVE.roof); col.rect([c0 - 0.4, d0, c0, d1 + 0.4], F, CAVE.roof); col.rect([c1, d0, c1 + 0.4, d1 + 0.4], F, CAVE.roof);
  col.rect([c0, d1, s0, d1 + 0.4], F, CAVE.roof); col.rect([s1, d1, c1, d1 + 0.4], F, CAVE.roof);
  // the steps, cut in the rock, and their side walls down to the cave
  const nst = Math.round(-F / 0.18), L2 = t1 - d1;
  for (let k = 0; k < nst; k++) { const za = d1 + L2 * k / nst; bx('limestone', s0, za, s1, t1, F - 0.2, F + (-F) * (k + 1) / nst); }
  for (const [a, b] of [[s0 - 0.3, s0], [s1, s1 + 0.3]]) { bx('rock_boulder', a, d1, b, t1, F - 0.3, 0.02); col.rect([a, d1, b, t1], F, 0.6); }
  col.ramp([s0, d1, s1, t1], F, 0, 's');
  // an oil lamp in a niche of the cave's north wall
  bx('opening', c0 + 1.9, d0 + 0.005, c0 + 2.4, d0 + 0.02, F + 1.2, F + 1.6);
  bag.add('terracotta', lathe([[0.001, 0], [0.05, 0.01], [0.06, 0.03], [0.03, 0.045], [0.001, 0.05]], 10, null, c0 + 2.15, F + 1.2, d0 + 0.12));
  bx('limestone', c0 + 1.85, d0, c0 + 2.45, d0 + 0.2, F + 1.15, F + 1.2);
  lights?.push({ at: [c0 + 2.15, F + 1.35, d0 + 0.35], color: '#ffae5e', intensity: 1.6, distance: 5 });
}

const base = STYLES.islamic;
registerStyle('islamic-dotr', {
  ...base,
  elements: { ...base.elements, dotr_face: dotrFace, ablaq, drum_frames: drumFrames, dotr_mosaic: dotrMosaic, drum_mosaic: drumMosaic },
  objects: { ...base.objects, rock_screen: rockScreen, sakhra },
});
