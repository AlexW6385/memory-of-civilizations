// Baroque Rome — the dressing of the open ground and the fortress (docs/settlements/baroque-rome.md §5, §6):
// the lines of travertine that run in the piazza's pavement and the focal stones, the Vatican gardens' parterre of clipped box
// with its fountain and its lemon trees in pots, the Passetto di Borgo with its arcade, its small windows and
// its battlements, Castel Sant'Angelo's drum, bastions, papal apartments and its angel.

import { box, lathe, frustum } from '../../core/geom.js';
import { orientedBox } from '../../core/build.js';
import { faceFrame, Local, ext, archOutline } from '../renaissance/face.js';

const T = 'travertine';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

/**
 * piazza_lines: { c, ax, bz, rect (the piazza retta) } — the oval's pavement of dark setts is cut by rays of
 * travertine that run out from the obelisk and by elliptical bands; the retta is crossed by bands of travertine.
 */
export function piazzaLines(el, { bag }) {
  const [ox, oz] = el.c, ax = el.ax, bz = el.bz, y0 = 0.015, y1 = 0.045;
  const pt = (a, k) => [ox + Math.cos(a) * ax * k, oz + Math.sin(a) * bz * k];
  const N = 32;
  for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2; bag.add(T, orientedBox(pt(a, 0.2), pt(a, 0.95), 0.34, y0, y1)); }
  for (const [k, th, m] of [[0.15, 0.7, 'granite_grey'], [0.34, 0.32, T], [0.56, 0.32, T], [0.78, 0.32, T], [0.975, 0.5, 'granite_grey']]) {
    const n = 72;
    for (let i = 0; i < n; i++) bag.add(m, orientedBox(pt(i / n * Math.PI * 2, k), pt((i + 1) / n * Math.PI * 2, k), th, y0, m === T ? y1 : y1 + 0.02, 0.03));
  }
  // the two focal stones set in the pavement between the obelisk and the fountains, from which each colonnade's four rows of columns appear as one
  for (const sg of [-1, 1]) bag.add('marble_smooth', lathe([[0.45, 0], [0.45, 0.065], [0.001, 0.065]], 14, null, ox, y0, oz + sg * 21));
  if (el.rect) {
    const [x0, z0, x1, z1] = el.rect;
    for (let x = x0 + 4; x < x1 - 1; x += 6) bag.add(T, box(x, y0, z0 + 1.0, x + 0.3, y1, z1 - 1.0));
    bag.add(T, box(x0 + 0.5, y0, (z0 + z1) / 2 - 0.2, x1 - 2.5, y1, (z0 + z1) / 2 + 0.2));
    for (const z of [z0 + 0.4, z1 - 0.4]) bag.add('granite_grey', box(x0, y0, z - 0.3, x1, y1 + 0.02, z + 0.3));
  }
}

/** A clipped cone of box or cypress, a pot of lemon tree, a hedge: small things of the gardens. */
const cone = (bag, x, y, z, r, h, m = 'flax_leaf') => bag.add(m, lathe([[0.001, 0], [r, 0.05 * h], [r * 0.9, 0.35 * h], [r * 0.55, 0.7 * h], [0.001, h]], 8, null, x, y, z));
const lemon = (bag, x, z) => {
  bag.add('terracotta', lathe([[0.3, 0], [0.38, 0.1], [0.42, 0.55], [0.46, 0.62], [0.38, 0.6], [0.001, 0.58]], 10, null, x, 0, z));
  bag.add('bark_dark', lathe([[0.04, 0], [0.05, 0.9], [0.001, 0.9]], 5, null, x, 0.6, z));
  bag.add('lotus_leaf', lathe([[0.001, 0], [0.55, 0.12], [0.75, 0.5], [0.55, 0.92], [0.001, 1.05]], 8, null, x, 1.2, z));
  for (let k = 0; k < 5; k++) { const a = k * 1.26; bag.add('glaze_yellow', lathe([[0.001, 0], [0.07, 0.05], [0.001, 0.12]], 5, null, x + Math.cos(a) * 0.62, 1.55 + (k % 2) * 0.2, z + Math.sin(a) * 0.62)); }
};

/**
 * parterre: { rect, cols, rows, seed } — a formal garden of the Vatican: gravel paths between compartments of
 * lawn edged in clipped box with a cone at the middle and balls at the corners, a fountain in the middle of the
 * crossing, lemon trees in pots along the paths, clipped cypresses round the edge, a low wall.
 */
export function parterre(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, cols = el.cols ?? 4, rows = el.rows ?? 2, P = 2.4, rand = rng(el.seed ?? 5);
  bag.add('pebbles', box(x0, -0.1, z0, x1, 0.03, z1));
  const cw = (x1 - x0 - P * (cols + 1)) / cols, cd = (z1 - z0 - P * (rows + 1)) / rows;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const a = x0 + P + i * (cw + P), b = z0 + P + j * (cd + P);
    bag.add('sod', box(a, 0, b, a + cw, 0.08, b + cd));
    for (const [p, q, r, s] of [[a, b, a + cw, b + 0.5], [a, b + cd - 0.5, a + cw, b + cd], [a, b + 0.5, a + 0.5, b + cd - 0.5], [a + cw - 0.5, b + 0.5, a + cw, b + cd - 0.5]]) bag.add('flax_leaf', box(p, 0, q, r, 0.6, s));
    // the pattern in the lawn: a lozenge of gravel round a clipped cone, and a bed of red earth at each corner
    const cx = a + cw / 2, cz = b + cd / 2;
    bag.add('pebbles', box(cx - 2.2, 0.08, cz - 0.3, cx + 2.2, 0.095, cz + 0.3)); bag.add('pebbles', box(cx - 0.3, 0.08, cz - 2.2, cx + 0.3, 0.095, cz + 2.2));
    cone(bag, cx, 0.08, cz, 0.7, 2.0);
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bag.add('flax_leaf', lathe([[0.001, 0], [0.35, 0.15], [0.4, 0.4], [0.3, 0.7], [0.001, 0.78]], 8, null, cx + dx * (cw / 2 - 1.1), 0.08, cz + dz * (cd / 2 - 1.1)));
  }
  // the fountain where the paths cross (rows even: at the middle of the garden)
  const fx = (x0 + x1) / 2, fz = (z0 + z1) / 2, fr = 2.2;
  bag.add(T, lathe([[fr, 0], [fr, 0.55], [fr - 0.25, 0.6], [0.001, 0.6]], 16, null, fx, 0, fz)); bag.add('water', lathe([[fr - 0.3, 0.5], [0.001, 0.5]], 16, null, fx, 0, fz));
  bag.add(T, lathe([[0.5, 0.5], [0.45, 0.9], [0.15, 1.1], [0.15, 1.7], [0.7, 1.8], [0.75, 2.0], [0.001, 2.0]], 12, null, fx, 0, fz)); bag.add('water_jet', box(fx - 0.04, 2.0, fz - 0.04, fx + 0.04, 3.1, fz + 0.04));
  col.circle(fx, fz, fr, 0, 1.0);
  // lemon trees in their pots along the long axis, cypresses round the edge, the low wall
  for (let x = x0 + 4; x < x1 - 3; x += 5) for (const z of [fz - 1.2, fz + 1.2]) if (Math.abs(x - fx) > fr + 1.5) lemon(bag, x, z);
  for (let x = x0 + 1.5; x < x1; x += 6.5) for (const z of [z0 + 0.9, z1 - 0.9]) cone(bag, x + rand() * 0.4, 0, z, 0.95, 6.5 + rand() * 1.5, 'flax_leaf');
  for (let z = z0 + 5; z < z1 - 3; z += 6.5) for (const x of [x0 + 0.9, x1 - 0.9]) cone(bag, x, 0, z + rand() * 0.4, 0.95, 6.5 + rand() * 1.5);
  for (const r of [[x0 - 0.4, z0 - 0.4, x1 + 0.4, z0], [x0 - 0.4, z1, x1 + 0.4, z1 + 0.4], [x0 - 0.4, z0, x0, z1], [x1, z0, x1 + 0.4, z1]]) { bag.add('rubble', box(r[0], 0, r[1], r[2], 0.9, r[3])); bag.add(T, box(r[0] - 0.05, 0.9, r[1] - 0.05, r[2] + 0.05, 1.0, r[3] + 0.05)); col.rect(r, 0, 1.0); }
}

/**
 * passetto: { rect, h } — the raised wall-walk to Castel Sant'Angelo: a plastered rubble wall with buttresses, a blind
 * arcade of round arches in the lower storey, a string course, the gallery's small windows, corbels under the
 * parapet, merlons.
 */
export function passetto(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, H = el.h ?? 8, y = el.y ?? 0, simple = !!el.simple;
  bag.add('rubble', box(x0, y - 0.4, z0, x1, y + H - 1.0, z1)); col.rect(el.rect, y, y + H);
  // the parapet's walk behind the merlons: a slab a little wider, then the merlons themselves
  bag.add('rubble', box(x0 - 0.15, y + H - 1.0, z0 - 0.15, x1 + 0.15, y + H, z1 + 0.15));
  if (simple) return;
  for (const f of ['n', 's']) {
    const { M, L: LEN } = faceFrame(el.rect, f, y), rand = rng(f === 'n' ? 11 : 12), F = new Local(); F.noBack = false;
    const bay = 5.6, nb = Math.floor(LEN / bay), b0 = (LEN - nb * bay) / 2;
    F.box('brick', 0, 0, -0.02, LEN, 0.5, 0.12);                                                  // the plinth
    for (let k = 0; k <= nb; k++) { const u = b0 + k * bay; F.box(T, u - 0.3, 0, -0.02, u + 0.3, H - 1.3, 0.55); F.box(T, u - 0.38, H - 1.3, -0.02, u + 0.38, H - 1.15, 0.6); }   // the buttresses, each with its cap
    for (let k = 0; k < nb; k++) {
      const uc = b0 + (k + 0.5) * bay, w = 3.6;
      F.add('plaster_damp', ext(archOutline(uc, 0.5, w, 3.7, 'round', 8), [], -0.02, 0.03, 8));    // the blind arch, the wall's face set back
      if (rand() < 0.4) F.box('plaster_streak', uc - 0.9 + rand() * 1.4, 0.5, 0, uc - 0.5 + rand() * 1.4, 2.0 + rand() * 1.2, 0.05);
      // the gallery above: a small window in each bay, with its sill and frame
      const wy = H - 3.3;
      F.box('opening', uc - 0.28, wy, -0.02, uc + 0.28, wy + 0.95, 0.03); F.box(T, uc - 0.38, wy - 0.1, -0.02, uc + 0.38, wy, 0.18); F.box(T, uc - 0.38, wy + 0.95, -0.02, uc + 0.38, wy + 1.05, 0.12);
    }
    F.box(T, 0, H - 4.6, -0.02, LEN, H - 4.45, 0.2);                                                // the string course
    for (let u = 0.35; u < LEN - 0.3; u += 0.8) F.box('brick', u - 0.12, H - 1.55, 0, u + 0.12, H - 1.0, 0.3);   // the corbels under the parapet
    for (let u = 0.2; u < LEN - 1.0; u += 2.2) F.box(T, u, H, -0.05, u + 1.2, H + 1.0, 0.45);      // the merlons
    F.emit(bag, M);
  }
}

/** A statue of the angel: a robed body, two wings raised, the sword held up. */
function angel(bag, x, y, z, s = 1) {
  bag.add('gilt_bronze', lathe([[0.001, 0], [0.5 * s, 0.1 * s], [0.4 * s, 0.9 * s], [0.25 * s, 1.5 * s], [0.12 * s, 1.9 * s], [0.001, 2.0 * s]], 10, null, x, y, z));
  bag.add('gilt_bronze', lathe([[0.001, 0], [0.18 * s, 0.05 * s], [0.18 * s, 0.35 * s], [0.001, 0.4 * s]], 8, null, x, y + 1.9 * s, z));
  for (const sg of [-1, 1]) { const w = box(0, 0, -0.05 * s, 2.4 * s, 0.05 * s, 0.05 * s); w.rotateZ(sg * 0.0); const g = box(0, 0, -0.04 * s, 0.07 * s, 1.9 * s, 0.04 * s); g.rotateZ(-sg * 0.7); g.translate(x + sg * 0.15 * s, y + 1.3 * s, z + 0.15 * s); bag.add('gilt_bronze', g); const g2 = box(0, 0, -0.03 * s, 0.07 * s, 1.5 * s, 0.03 * s); g2.rotateZ(-sg * 0.35); g2.translate(x + sg * 0.1 * s, y + 1.4 * s, z + 0.15 * s); bag.add('gilt_bronze', g2); }
  bag.add('iron', box(x + 0.35 * s, y + 1.4 * s, z - 0.02, x + 0.38 * s, y + 3.3 * s, z + 0.02)); bag.add('iron', box(x + 0.2 * s, y + 1.9 * s, z - 0.02, x + 0.53 * s, y + 1.94 * s, z + 0.02));
}

/**
 * castel: { c, r, h } — Castel Sant'Angelo: the square base of brick with a battered foot, string courses, arrow
 * slits and a parapet with machicolations and merlons, four round bastions with their own; the great drum of
 * brick with its travertine cornice and its pilasters; the papal apartments above with framed windows under a
 * hipped roof; the angel on the top.
 */
export function castel(el, { bag, col }) {
  const [x, z] = el.c, r = el.r ?? 22, h = el.h ?? 20, y = el.y ?? 0, s = r * 1.5, simple = !!el.simple, rand = rng(171);
  const BH = 8;
  // the base, its foot battered, with the parapet: a ring of merlons over corbels on each side
  bag.add('brick', frustum([x - s, z - s, x + s, z + s], y - 0.5, y + BH, 0.9, 0.9, 0.9, 0.9)); col.rect([x - s, z - s, x + s, z + s], y, y + BH); col.floor([x - s, z - s, x + s, z + s], y + BH);
  bag.add('rubble', box(x - s - 1.2, y - 0.5, z - s - 1.2, x + s + 1.2, y + 1.6, z + s + 1.2));
  bag.add(T, box(x - s + 0.8, y + BH, z - s + 0.8, x + s - 0.8, y + BH + 0.3, z - s + 1.4));
  if (!simple) {
    for (const sg of [-1, 1]) {
      for (let u = x - s + 2; u < x + s - 2; u += 1.9) { bag.add(T, box(u, y + BH + 0.3, z + sg * (s - 1.0) - 0.3, u + 1.1, y + BH + 1.6, z + sg * (s - 1.0) + 0.3)); bag.add('brick', box(u + 0.15, y + BH - 0.8, z + sg * (s - 0.8) - 0.25, u + 0.5, y + BH, z + sg * (s - 0.55) + 0.25)); }
      for (let v = z - s + 2; v < z + s - 2; v += 1.9) { bag.add(T, box(x + sg * (s - 1.0) - 0.3, y + BH + 0.3, v, x + sg * (s - 1.0) + 0.3, y + BH + 1.6, v + 1.1)); bag.add('brick', box(x + sg * (s - 0.8) - 0.25, y + BH - 0.8, v + 0.15, x + sg * (s - 0.55) + 0.25, y + BH, v + 0.5)); }
      // arrow slits along each side, and the string course
      for (let u = x - s + 5; u < x + s - 4; u += 6.5) bag.add('opening', box(u - 0.12, y + 3.4, z + sg * (s - 0.9) + sg * 0.0 - 0.0, u + 0.12, y + 4.8, z + sg * (s - 0.9) + sg * 0.2));
    }
    bag.add(T, box(x - s + 0.1, y + BH - 1.0, z - s + 0.1, x + s - 0.1, y + BH - 0.9, z - s + 0.35));
  }
  // the bastions: round, brick, a travertine cornice, merlons all round
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const bx = x + dx * s, bz = z + dz * s;
    bag.add('brick', lathe([[8.8, 0], [8, 3], [8, 10.4], [8.6, 10.6], [8.6, 11], [7.4, 11.2], [0.001, 11.2]], 16, null, bx, y - 0.5, bz)); col.circle(bx, bz, 8.4, y, y + 10.5);
    if (!simple) for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; bag.add(T, orientedBox([bx + Math.cos(a) * 7.7 - Math.sin(a) * 0.6, bz + Math.sin(a) * 7.7 + Math.cos(a) * 0.6], [bx + Math.cos(a) * 7.7 + Math.sin(a) * 0.6, bz + Math.sin(a) * 7.7 - Math.cos(a) * 0.6], 0.6, y + 10.7, y + 11.9)); }
  }
  // the drum, with its pilasters and string courses
  const dy = y + BH;
  bag.add('brick', lathe([[r, 0], [r, h], [r + 0.8, h + 0.3], [r + 1.4, h + 0.7], [r + 1.4, h + 1.4], [0.001, h + 1.4]], 40, null, x, dy, z)); col.circle(x, z, r, y, dy + h);
  if (!simple) {
    for (let k = 0; k < 36; k++) { const a = k / 36 * Math.PI * 2; bag.add(T, orientedBox([x + Math.cos(a) * (r + 0.15) - Math.sin(a) * 0.35, z + Math.sin(a) * (r + 0.15) + Math.cos(a) * 0.35], [x + Math.cos(a) * (r + 0.15) + Math.sin(a) * 0.35, z + Math.sin(a) * (r + 0.15) - Math.cos(a) * 0.35], 0.5, dy + 0.6, dy + h - 0.3)); }
    for (const yy of [2.2, h * 0.55]) bag.add(T, lathe([[r + 0.45, 0], [r + 0.45, 0.28], [r, 0.28], [r, 0]], 40, null, x, dy + yy, z));
    for (let k = 0; k < 18; k++) { const a = (k + 0.5) / 18 * Math.PI * 2; const wx = x + Math.cos(a) * (r + 0.05), wz = z + Math.sin(a) * (r + 0.05); bag.add('opening', orientedBox([wx - Math.sin(a) * 0.4, wz + Math.cos(a) * 0.4], [wx + Math.sin(a) * 0.4, wz - Math.cos(a) * 0.4], 0.5, dy + h * 0.72, dy + h * 0.72 + 1.6)); }
  }
  // the papal apartments on the drum: stuccoed, with framed windows, a cornice and a hipped roof
  const ay = dy + h + 1.4, aw = r * 0.5, ad = r * 0.42, ah = 12;
  bag.add('stucco_ochre', box(x - aw, ay, z - ad, x + aw, ay + ah, z + ad)); col.rect([x - aw, z - ad, x + aw, z + ad], dy + h, ay + ah);
  bag.add(T, box(x - aw - 0.3, ay + ah, z - ad - 0.3, x + aw + 0.3, ay + ah + 0.4, z + ad + 0.3));
  bag.add('roof_tile', frustum([x - aw - 0.6, z - ad - 0.6, x + aw + 0.6, z + ad + 0.6], ay + ah + 0.4, ay + ah + 3.4, aw * 0.55, aw * 0.55, 1.5, 1.5));
  if (!simple) for (const sg of [-1, 1]) {
    for (const yy of [2.0, 7.2]) for (let k = -2; k <= 2; k++) {
      const wx = x + k * aw * 0.38, wz = z + sg * ad;
      bag.add('opening', box(wx - 0.5, ay + yy, wz + (sg > 0 ? -0.0 : -0.1), wx + 0.5, ay + yy + 2.0, wz + (sg > 0 ? 0.1 : 0.0)));
      bag.add(T, box(wx - 0.65, ay + yy - 0.1, wz + (sg > 0 ? 0 : -0.2), wx + 0.65, ay + yy, wz + (sg > 0 ? 0.2 : 0)));
      bag.add(T, box(wx - 0.65, ay + yy + 2.0, wz + (sg > 0 ? 0 : -0.15), wx + 0.65, ay + yy + 2.2, wz + (sg > 0 ? 0.15 : 0)));
    }
    for (let k = -1; k <= 1; k++) { const wz = z + k * ad * 0.55, wx = x + sg * aw; bag.add('opening', box(wx + (sg > 0 ? 0 : -0.1), ay + 2.0, wz - 0.5, wx + (sg > 0 ? 0.1 : 0), ay + 4.0, wz + 0.5)); }
  }
  // the little bastion-top and the angel on a plinth over the roof
  bag.add(T, box(x - 1.3, ay + ah + 3.4, z - 1.3, x + 1.3, ay + ah + 4.6, z + 1.3));
  angel(bag, x, ay + ah + 4.6, z, 1.3);
  void rand;
}

/**
 * nave_dress: { c (the crossing), y (the floor), b (the arms' half-width) } — what stood inside in use: the
 * Confessio before the papal altar with its balustrade and the ninety-five gilt lamps that burn day and night
 * [stated: the lamps, Wikipedia "Papal Tomb of St. Peter" / stpetersbasilica.info]; wooden confessionals against
 * the sides of the arms with their curtains; stands of votive candles; kneeling benches before the altars.
 */
export function naveDress(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y, b = el.b ?? 13.75;
  // the Confessio: a rail round a sunk floor of dark marble, the lamps on the rail's top
  const r = [cx + 5.8, cz - 4.2, cx + 13, cz + 4.2];
  bag.add('marble_dark', box(r[0], y + 0.05, r[1], r[2], y + 0.07, r[3]));
  const sides = [[[r[0], r[1]], [r[2], r[1]]], [[r[2], r[1]], [r[2], r[3]]], [[r[2], r[3]], [r[0], r[3]]], [[r[0], r[3]], [r[0], r[1]]]];
  for (const [p, q] of sides) { bag.add('marble_pink', orientedBox(p, q, 0.5, y, y + 0.85, 0.25)); bag.add('marble', orientedBox(p, q, 0.62, y + 0.85, y + 0.95, 0.31)); col.segment(p, q, 0.6, y, y + 1.0); }
  let n = 0; const per = 2 * ((r[2] - r[0]) + (r[3] - r[1]));
  for (let k = 0; k < 95; k++) {
    let d = k / 95 * per, px, pz;
    if (d < r[2] - r[0]) { px = r[0] + d; pz = r[1]; } else if ((d -= r[2] - r[0]) < r[3] - r[1]) { px = r[2]; pz = r[1] + d; } else if ((d -= r[3] - r[1]) < r[2] - r[0]) { px = r[2] - d; pz = r[3]; } else { d -= r[2] - r[0]; px = r[0]; pz = r[3] - d; }
    bag.add('gilt_bronze', lathe([[0.001, 0], [0.07, 0.02], [0.03, 0.12], [0.05, 0.3], [0.09, 0.38], [0.001, 0.4]], 7, null, px, y + 0.95, pz));
    bag.add('flame', box(px - 0.02, y + 1.36, pz - 0.02, px + 0.02, y + 1.46, pz + 0.02)); n++;
  }
  // the confessionals: a booth with a pedimented top, the priest's seat in the middle behind a curtain, a grille at each side, a kneeling board on each side
  const booth = (x, z, face) => {
    const dx = face, W = 2.6, D = 1.1;
    bag.add('wood_dark', box(x - D / 2, y, z - W / 2, x + D / 2, y + 2.6, z + W / 2)); col.rect([x - D / 2, z - W / 2, x + D / 2, z + W / 2], y, y + 2.6);
    bag.add('wood_dark', box(x - D / 2 - 0.08, y + 2.6, z - W / 2 - 0.08, x + D / 2 + 0.08, y + 2.72, z + W / 2 + 0.08));
    bag.add('wood_painted', box(x + dx * (D / 2) - (dx > 0 ? 0 : 0.02), y + 0.2, z - 0.4, x + dx * (D / 2) + (dx > 0 ? 0.02 : 0), y + 2.2, z + 0.4));
    bag.add('cloth_maroon', box(x + dx * (D / 2) + (dx > 0 ? 0.02 : -0.05), y + 0.2, z - 0.38, x + dx * (D / 2) + (dx > 0 ? 0.05 : -0.02), y + 2.1, z + 0.38));
    for (const s of [-1, 1]) { bag.add('opening', box(x + dx * (D / 2) + (dx > 0 ? 0.0 : -0.03), y + 1.3, z + s * 0.95 - 0.2, x + dx * (D / 2) + (dx > 0 ? 0.03 : 0), y + 1.8, z + s * 0.95 + 0.2)); bag.add('wood_dark', box(x + dx * (D / 2 + 0.45) - 0.25, y, z + s * 1.0 - 0.3, x + dx * (D / 2 + 0.45) + 0.25, y + 0.28, z + s * 1.0 + 0.3)); }
    bag.add('gilt_bronze', box(x - 0.02 + dx * 0.0, y + 2.72, z - 0.03, x + 0.02, y + 3.1, z + 0.03));
  };
  for (const s of [-1, 1]) for (const [z, face] of [[-41, 1], [-34, 1], [-27, 1], [27, 1], [34, 1], [41, 1]]) booth(cx + s * (b - 0.7), cz + z, s > 0 ? -1 : 1);
  // stands of votive candles with their drip-pans, and kneeling benches before the altars of the arms' ends
  const stand = (x, z) => { bag.add('iron', box(x - 0.45, y, z - 0.3, x + 0.45, y + 0.05, z + 0.3)); bag.add('iron', box(x - 0.45, y + 0.05, z - 0.3, x - 0.4, y + 0.9, z - 0.25)); bag.add('iron', box(x + 0.4, y + 0.05, z - 0.3, x + 0.45, y + 0.9, z - 0.25)); bag.add('iron', box(x - 0.45, y + 0.85, z - 0.3, x + 0.45, y + 0.9, z + 0.3)); for (let k = 0; k < 9; k++) { const cx2 = x - 0.36 + (k % 5) * 0.18, cz2 = z - 0.18 + Math.floor(k / 5) * 0.3; bag.add('paint_white', box(cx2 - 0.02, y + 0.9, cz2 - 0.02, cx2 + 0.02, y + 1.05, cz2 + 0.02)); if (k % 3 !== 2) bag.add('flame', box(cx2 - 0.015, y + 1.05, cz2 - 0.015, cx2 + 0.015, y + 1.1, cz2 + 0.015)); } col.rect([x - 0.45, z - 0.3, x + 0.45, z + 0.3], y, y + 0.9); };
  for (const s of [-1, 1]) for (const [dx, dz] of [[-4, 24], [4, 24], [-3, 46]]) stand(cx + s * dx, cz + s * dz);
  for (const s of [-1, 1]) for (const dx of [-4, 0, 4]) { const x = cx + dx, z = cz + s * 50.5; bag.add('wood_dark', box(x - 0.6, y, z - 0.35, x + 0.6, y + 0.32, z + 0.35)); bag.add('cloth_red', box(x - 0.58, y + 0.32, z - 0.33, x + 0.58, y + 0.38, z + 0.33)); bag.add('wood_dark', box(x - 0.6, y + 0.32, z + (s > 0 ? 0.35 : -0.5), x + 0.6, y + 0.95, z + (s > 0 ? 0.5 : -0.35))); }
  void n;
}

/**
 * ship_mill: { at, rot, y (the water), seed } — one of the floating mills of the Tiber: two long hulls side by side with the
 * paddle wheel turning between them, a plank hut with a tiled roof on the hulls, moored by a post to the bank
 * [stated: the Tiber's ship-mills, in use until the late 19th century; Wikipedia "Ship mill"].
 */
export function shipMill(el, { bag, col }) {
  const [x, z] = el.at, y = el.y, rot = el.rot ?? 0, rand = rng(el.seed ?? 3);
  const c = Math.cos(rot), s = Math.sin(rot);
  const P = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];   // lx along the hulls
  const rotG = (g, lx, ly, lz) => { g.rotateY(rot); const p = P(lx, lz); g.translate(p[0] - lx * 0 - 0, y + ly, p[1]); return g; };
  void rotG;
  const seg = (a, b, w, y0, y1, m) => bag.add(m, orientedBox(P(a[0], a[1]), P(b[0], b[1]), w, y + y0, y + y1));
  for (const sz of [-1, 1]) { seg([-5.5, sz * 2.1], [5.5, sz * 2.1], 1.3, -0.4, 0.95, 'timber'); seg([-5.5, sz * 2.1], [5.5, sz * 2.1], 1.38, 0.55, 0.62, 'wood_dark'); col.segment(P(-5.5, sz * 2.1), P(5.5, sz * 2.1), 1.3, y - 0.4, y + 0.95); }
  for (const lx of [-4.5, 2.6, 4.5]) seg([lx, -2.1], [lx, 2.1], 0.25, 0.7, 0.95, 'wood_dark');          // the cross beams
  seg([0.8, -2.1], [5.0, -2.1], 1.0, 0.95, 3.2, 'planks_grey'); seg([0.8, 2.1], [5.0, 2.1], 1.0, 0.95, 3.2, 'planks_grey');   // the hut's two sides over the hulls
  seg([0.8, -1.7], [0.8, 1.7], 0.15, 0.95, 3.2, 'planks_grey'); seg([5.0, -1.7], [5.0, 1.7], 0.15, 0.95, 3.2, 'planks_grey');
  seg([0.8, 0], [5.0, 0], 4.5, 3.2, 3.3, 'wood_dark');
  for (const k of [-1, 1]) seg([0.8, k * 1.0], [5.0, k * 1.0], 0.12, 3.3, 4.3, 'roof_tile');
  seg([0.8, 0], [5.0, 0], 0.2, 3.9, 4.35, 'roof_tile');
  // the wheel between the hulls: an axle, two rims, the paddle boards round
  const [wx, wz] = P(-1.6, 0), axisX = -s, axisZ = -c;                                                   // (the axle lies across the hulls)
  void axisX; void axisZ;
  seg([-1.6, -2.1], [-1.6, 2.1], 0.22, 0.2, 0.44, 'wood_dark');
  for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2, ry = 1.8 + Math.cos(a) * 1.45, lx = -1.6 + Math.sin(a) * 1.45; if (ry > -5) seg([lx, -1.35], [lx, 1.35], 0.45, Math.max(-0.45, ry - 1.5 - 0.15), Math.max(-0.3, ry - 1.5 + 0.15), 'timber'); }
  void wx; void wz;
  seg([-5.4, 0], [-3.0, 0], 0.6, 0.95, 1.2, 'rope_fibre');                                              // a coil of mooring rope on the bow
  // sacks of grain and flour on the deck
  for (let k = 0; k < 4; k++) { const [px, pz] = P(-4.8 + (k % 2) * 0.7, -0.6 + Math.floor(k / 2) * 0.8); bag.add('sacking', lathe([[0.2, 0], [0.26, 0.3], [0.2, 0.55], [0.001, 0.6]], 8, null, px, y + 0.95, pz)); }
  void rand;
}

/**
 * tiber_landing: { x, z, h (bank height over the water) } — a stair of travertine from the top of the bank to the water with a
 * timber jetty at its foot, two mooring posts and a ring in the wall (the river's banks were not embanked until after 1870, so
 * the landings were rough ones cut into the slope).
 */
export function tiberLanding(el, { bag, col }) {
  const { x, z } = el, dir = el.dir ?? 1, y0 = el.level;
  const n = 11, run = 1.3;
  for (let k = 0; k < n; k++) {
    const top = el.top - (k + 1) * (el.top - y0 - 0.15) / n, xx = x + dir * k * run;
    bag.add(T, box(Math.min(xx, xx + dir * run), top - 1.2, z - 1.4, Math.max(xx, xx + dir * run), top, z + 1.4)); col.floor([Math.min(xx, xx + dir * run), z - 1.4, Math.max(xx, xx + dir * run), z + 1.4], top);
  }
  const jx = x + dir * n * run;
  bag.add('timber', box(Math.min(jx, jx + dir * 5), y0 + 0.1, z - 1.2, Math.max(jx, jx + dir * 5), y0 + 0.28, z + 1.2)); col.floor([Math.min(jx, jx + dir * 5), z - 1.2, Math.max(jx, jx + dir * 5), z + 1.2], y0 + 0.28);
  for (const sz of [-1, 1]) for (const k of [0, 1, 2, 3]) bag.add('wood_dark', box(jx + dir * (0.6 + k * 1.5) - 0.07, y0 - 1.2, z + sz * 1.15 - 0.07, jx + dir * (0.6 + k * 1.5) + 0.07, y0 + 0.8, z + sz * 1.15 + 0.07));
  for (const sz of [-1, 1]) bag.add('wood_dark', lathe([[0.16, 0], [0.16, 1.1], [0.2, 1.15], [0.001, 1.2]], 8, null, jx + dir * 4.6, y0 + 0.28, z + sz * 1.9));
}
