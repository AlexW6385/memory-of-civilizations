// The Dome of the Rock's own pieces, on top of the early Islamic style (src/styles/islamic): the outer
// walls' articulation (marble panels and their fillets below, a blind arcade on pilasters in the mosaic
// above, framed windows with grilles, the cornices), the alternating light and dark voussoirs (ablaq) of
// the arcades, the drum's framed windows, and the wooden screen round the Rock. docs/buildings/dome-of-the-rock.md §4, §7, §8.

import '../../styles/islamic/index.js';
import { STYLES, registerStyle } from '../../core/build.js';
import { lathe, fromTriangles } from '../../core/geom.js';
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

const base = STYLES.islamic;
registerStyle('islamic-dotr', {
  ...base,
  elements: { ...base.elements, dotr_face: dotrFace, ablaq, drum_frames: drumFrames },
  objects: { ...base.objects, rock_screen: rockScreen },
});
