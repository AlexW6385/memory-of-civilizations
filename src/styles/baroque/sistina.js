// The Sistine Chapel about 1670 (docs/settlements/baroque-rome.md §4d): the plain brick hall with its buttresses and
// gabled roof outside; inside, at the dimensions of the Temple of Solomon (40.9 × 13.4 × 20.7 m), the three tiers of
// the walls (painted curtains, the stories of Moses and of Christ, the popes between the windows), the barrel vault
// of Michelangelo's ceiling (the nine scenes, the ignudi, the prophets and sibyls, the lunettes), the Last Judgment on
// the altar wall, the marble screen with the cantoria, the benches, the papal throne, the altar, the Cosmati pavement.
// Built in world coordinates; the chapel's axis runs along x, the altar at the west end, the door at the east.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { Local, ext, archOutline, sheet } from '../renaissance/face.js';

const HL = 20.45, HW = 6.7, TW = 2.2, HT = 17.2, SPRING = 15.2, CROWN = 20.7, RIDGE = 22.6;
const R = (HW * HW + (CROWN - SPRING) ** 2) / (2 * (CROWN - SPRING)), CY = CROWN - R, PHI = Math.asin(HW / R);
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const vaultY = (z) => CY + Math.sqrt(R * R - z * z);

/** The window positions along the long walls (offsets from the west inner face). */
export const WINDOWS = [0, 1, 2, 3, 4, 5].map((i) => 4.0 + i * (2 * HL - 8) / 5);
/** The outer rectangle of a chapel centred at c. */
export const sistinaRect = (c) => [c[0] - HL - TW, c[1] - HW - TW, c[0] + HL + TW, c[1] + HW + TW];
/** The inner (floor) rectangle. */
export const sistinaInner = (c) => [c[0] - HL, c[1] - HW, c[0] + HL, c[1] + HW];

export function sistina(el, { bag, col, lights }) {
  const [cx, cz] = el.c, y = el.y ?? 0, X0 = cx - HL, X1 = cx + HL, Z0 = cz - HW, Z1 = cz + HW, XO0 = X0 - TW, XO1 = X1 + TW, ZO0 = Z0 - TW, ZO1 = Z1 + TW;
  const rand = rng(1475), L = new Local(), S = new Local();
  const xs = X1 - 13.8;                                       // the marble screen: a third of the length from the door
  const wx = WINDOWS.map((o) => X0 + o);
  // ── the shell: long walls with their six arched windows, the end walls (the east one with the door), plain brick
  const winHole = (u) => archOutline(u, y + 8.9, 2.0, y + 13.4, 'round', 8);
  for (const [za, zb] of [[ZO0, Z0], [Z1, ZO1]]) {
    bag.add('brick', ext([[XO0, y - 0.5], [XO1, y - 0.5], [XO1, y + HT], [XO0, y + HT]], wx.map(winHole), za, zb, 1));
    for (const u of wx) bag.add('daylight', ext(archOutline(u, y + 8.9, 2.0, y + 13.4, 'round', 8), [], (za + zb) / 2 - 0.02, (za + zb) / 2 + 0.02, 1));
  }
  col.rect([XO0, ZO0, XO1, Z0], y, y + HT); col.rect([XO0, Z1, XO1, ZO1], y, y + HT);
  // end walls: a panel in the (z, y) plane with the gable, extruded along x (rotated so that its depth runs along −x)
  const gable = (zo) => [[-zo, y - 0.5], [zo, y - 0.5], [zo, y + HT + 0.06], [0, y + RIDGE], [-zo, y + HT + 0.06]];
  const endWall = (xa, xb, holes) => { const g = ext(gable(ZO1).map(([u, v]) => [u, v]), holes, -xb, -xa, 1); g.rotateY(-Math.PI / 2); g.translate(0, 0, cz); return g; };
  bag.add('brick', endWall(XO0, X0, []));
  const dh = 1.3;                                              // half the door's width
  bag.add('brick', endWall(X1, XO1, [[[-dh, y], [dh, y], [dh, y + 4.5], [-dh, y + 4.5]]]));
  col.rect([XO0, Z0, X0, Z1], y, y + HT);
  col.rect([X1, ZO0 + TW, XO1, cz - dh], y, y + HT); col.rect([X1, cz + dh, XO1, ZO1 - TW], y, y + HT); col.rect([X1, cz - dh, XO1, cz + dh], y + 4.5, y + HT);
  // the roof of terracotta tiles, a flat course of brick under the eaves, the buttresses, a travertine door frame outside
  const eave = y + HT - 0.3;
  for (const s of [-1, 1]) bag.add('roof_tile', sheet([[[XO0 - 0.35, eave, cz + s * (HW + TW + 0.6)], [XO1 + 0.35, eave, cz + s * (HW + TW + 0.6)]], [[XO0 - 0.35, y + RIDGE, cz], [XO1 + 0.35, y + RIDGE, cz]]]));
  bag.add('roof_ridge', box(XO0 - 0.35, y + RIDGE - 0.1, cz - 0.3, XO1 + 0.35, y + RIDGE + 0.28, cz + 0.3));
  for (const s of [-1, 1]) { bag.add('travertine', box(XO0 - 0.1, y + HT - 1.3, s < 0 ? ZO0 - 0.4 : ZO1, XO1 + 0.1, y + HT - 0.3, s < 0 ? ZO0 : ZO1 + 0.4)); }
  for (const s of [-1, 1]) for (let i = 0; i <= 6; i++) {
    const u = i === 0 ? XO0 + 0.6 : i === 6 ? XO1 - 0.6 : X0 + 4 + (i - 0.5) * (2 * HL - 8) / 5;      // (between the windows, and the corners)
    const z0 = s < 0 ? ZO0 : ZO1, dz = s < 0 ? -1 : 1, w = i === 0 || i === 6 ? 1.2 : 0.8;
    bag.add('brick', box(u - w, y - 0.5, Math.min(z0, z0 + dz * 1.7), u + w, y + 10.5, Math.max(z0, z0 + dz * 1.7)));
    bag.add('brick', box(u - w * 0.75, y + 10.5, Math.min(z0, z0 + dz * 1.1), u + w * 0.75, y + 14.5, Math.max(z0, z0 + dz * 1.1)));
    bag.add('travertine', box(u - w - 0.08, y + 10.5, Math.min(z0, z0 + dz * 1.8), u + w + 0.08, y + 10.7, Math.max(z0, z0 + dz * 1.8)));
    col.rect([u - w, Math.min(z0, z0 + dz * 1.7), u + w, Math.max(z0, z0 + dz * 1.7)], y, y + 10.5);
  }
  for (const sg of [-1, 1]) bag.add('travertine', box(XO1, y, sg < 0 ? cz - dh - 0.3 : cz + dh, XO1 + 0.15, y + 4.85, sg < 0 ? cz - dh : cz + dh + 0.3));
  bag.add('travertine', box(XO1, y + 4.5, cz - dh - 0.3, XO1 + 0.18, y + 4.85, cz + dh + 0.3));
  bag.add('travertine', box(X1 - 0.1, y - 0.3, cz - dh - 0.4, XO1 + 0.9, y + 0.1, cz + dh + 0.4)); col.floor([X1, cz - dh, XO1 + 0.9, cz + dh], y + 0.1);
  // the leaves of the door stand open against the inner face
  for (const s of [-1, 1]) L.box('wood_dark', X1 - 0.16, y, s < 0 ? cz - dh - 1.35 : cz + dh, X1 - 0.06, y + 4.4, s < 0 ? cz - dh : cz + dh + 1.35);
  // ── the floor: Cosmati work of porphyry, serpentine and giallo in a white field, with the long band and the roundels
  bag.add('marble_floor', box(X0, y - 0.3, Z0, X1, y + 0.05, Z1)); col.floor([X0, Z0, X1, Z1], y + 0.05);
  const fl = (mat, a, b, c, d, h = 0.02) => S.box(mat, a, y + 0.05, b, c, y + 0.05 + h, d);
  fl('opus_sectile', X0 + 1.0, cz - 0.9, X1 - 1.0, cz + 0.9);
  for (const z of [Z0 + 0.5, Z1 - 0.9]) fl('serpentine', X0 + 0.5, z, X1 - 0.5, z + 0.4);
  for (const x of [X0 + 0.5, X1 - 0.9]) fl('serpentine', x, Z0 + 0.5, x + 0.4, Z1 - 0.5);
  for (const z of [Z0 + 1.1, Z1 - 1.3]) fl('giallo', X0 + 1.0, z, X1 - 1.0, z + 0.2);
  const roundel = (x, z, r) => {
    S.add('giallo', lathe([[r, -0.04], [r * 1.35, -0.04], [r * 1.35, 0.025], [r, 0.025], [r, -0.04]], 28, null, x, y + 0.05, z));
    S.add('porphyry', lathe([[0.001, -0.04], [r, -0.04], [r, 0.04], [0.001, 0.04]], 28, null, x, y + 0.05, z));
    S.add('serpentine', lathe([[0.001, 0.04], [r * 0.45, 0.04], [r * 0.45, 0.06], [0.001, 0.06]], 20, null, x, y + 0.05, z));
  };
  for (const [u, r] of [[2.6, 0.95], [8.0, 0.95], [14.0, 1.1], [20.5, 1.1], [27.0, 1.1], [33.0, 0.95], [38.0, 0.85]]) roundel(X0 + u, cz, r);
  for (let k = 0; k < 8; k++) for (const s of [-1, 1]) { const x = X0 + 2.8 + k * 4.9; fl('pavonazzetto', x - 0.5, cz + s * 3.5 - 0.5, x + 0.5, cz + s * 3.5 + 0.5); fl('porphyry', x - 0.25, cz + s * 3.5 - 0.25, x + 0.25, cz + s * 3.5 + 0.25, 0.04); }
  // ── the cornices of the three tiers, and the pilaster strips of the stories, along the long walls
  const wall = (side) => {
    const fz = (d) => (side < 0 ? Z0 + d : Z1 - d), W = (mat, u0, y0, d0, u1, y1, d1) => L.box(mat, u0, y + y0, Math.min(fz(d0), fz(d1)), u1, y + y1, Math.max(fz(d0), fz(d1)));
    const fig = (mat, u, y0, d, h, r = 0.14) => L.add(mat, lathe([[0.001, 0], [r, 0], [r * 1.05, h * 0.42], [r * 0.6, h * 0.78], [r * 0.5, h * 0.84], [0.001, h * 0.86]], 7, null, u, y + y0, fz(d)));
    const head = (u, y0, d, r = 0.07) => L.add('skin_light', lathe([[0.001, 0], [r, r * 0.4], [r, r * 1.4], [r * 0.5, r * 2.1], [0.001, r * 2.2]], 6, null, u, y + y0, fz(d)));
    const r2 = rng(Math.floor(side * 91 + 7));
    // (curtains) the painted drapes: ochre fields with red folds, a gold fringe under the cornice
    for (let u = X0 + 0.02; u < X1 - 0.5; u += 1.15) { W(Math.floor((u - X0) / 1.15) % 2 ? 'paint_ochre' : 'cloth_ochre', u, 0.12, 0.012, Math.min(u + 1.1, X1 - 0.02), 2.85, 0.03); W('cloth_red', u + 0.52, 0.12, 0.03, u + 0.6, 2.85, 0.045); }
    W('travertine', X0, 2.85, 0, X1, 3.2, 0.16); W('gilt_bronze', X0, 3.2, 0.0, X1, 3.26, 0.17);
    // (stories) six scenes of Moses (south) or of Christ (north) between painted pilasters, framed in gold: sky, land, groups of figures
    const bay = 2 * HL / 6, rob = ['cloth_red', 'cloth_blue', 'cloth_white', 'cloth_ochre', 'cloth_green', 'cloth_maroon', 'cloth_indigo'];
    for (let i = 0; i < 6; i++) {
      const a = X0 + i * bay, b = a + bay;
      W('plaster_white', a, 3.26, 0, a + 0.2, 7.3, 0.05); W('plaster_white', b - 0.2, 3.26, 0, b, 7.3, 0.05);
      W('gilt_bronze', a + 0.2, 3.26, 0.01, b - 0.2, 3.36, 0.06); W('gilt_bronze', a + 0.2, 7.2, 0.01, b - 0.2, 7.3, 0.06);
      W('paint_blue', a + 0.2, 5.4, 0.015, b - 0.2, 7.2, 0.03); W('fresco_green', a + 0.2, 3.36, 0.015, b - 0.2, 4.5, 0.03); W('paint_ochre', a + 0.2, 4.5, 0.015, b - 0.2, 5.4, 0.03);
      const hill = a + 0.9 + r2() * (bay - 3.2); W('fresco_green', hill, 4.5, 0.03, hill + 1.8, 5.1, 0.045);
      const n = 5 + Math.floor(r2() * 4);
      for (let k = 0; k < n; k++) { const u = a + 0.7 + (bay - 1.4) * (k + r2() * 0.6) / n; fig(rob[Math.floor(r2() * 7)], u, 3.5 + r2() * 0.5, 0.07 + (k % 2) * 0.01, 0.95 + r2() * 0.25); head(u, 3.5 + 0.8 + r2() * 0.05, 0.07 + (k % 2) * 0.01); }
      for (const [dx, h] of [[-1.2, 1.1], [1.4, 0.9]]) { const u = a + bay / 2 + dx; W('shutter_green', u - 0.35, 4.5, 0.05, u + 0.35, 4.5 + h, 0.075); }   // trees, a rock
    }
    // (tituli and the first cornice, the walkway of the second)
    W('lime_plaster', X0, 7.3, 0, X1, 8.1, 0.04); W('travertine', X0, 8.1, 0, X1, 8.55, 0.28); W('gilt_bronze', X0, 8.55, 0, X1, 8.62, 0.3);
    for (let u = X0 + 1.0; u < X1 - 1.5; u += 0.34 + r2() * 0.2) W('iron', u, 7.55, 0.045, u + 0.18, 7.85, 0.05);     // the lettering of the titles
    // (popes) two between every pair of windows and one beside each end: a pope in white and gold in a painted niche
    const pw = (u0) => { const u = u0; W('plaster_white', u - 0.72, 9.0, 0, u - 0.64, 12.9, 0.06); W('plaster_white', u + 0.64, 9.0, 0, u + 0.72, 12.9, 0.06); W('plaster_white', u - 0.72, 12.9, 0, u + 0.72, 13.05, 0.08);
      W('paint_ochre', u - 0.64, 9.0, 0.012, u + 0.64, 12.9, 0.03); fig('cloth_white', u, 9.1, 0.045, 2.2, 0.28); head(u, 9.1 + 1.85, 0.045, 0.1); L.add('gilt_bronze', lathe([[0.001, 0], [0.12, 0.02], [0.1, 0.34], [0.001, 0.44]], 8, null, u, y + 9.1 + 2.05, fz(0.045))); L.add('gold', lathe([[0.18, 0], [0.19, 0.02], [0.18, 0.04], [0.001, 0.04]], 10, null, u, y + 9.1 + 1.98, fz(0.012))); };
    for (const w of wx) { pw(w - 1.95); pw(w + 1.95); }
    W('travertine', X0, 14.6, 0, X1, 15.2, 0.3); W('gilt_bronze', X0, 15.2, 0, X1, 15.26, 0.32);
    // the sconce brackets at the windows' sides
    // (the wooden bench round the sanctuary, on its step, its panelled back, a cushion's strip)
    // (the wooden bench round the sanctuary, on its step, its panelled back, a cushion's strip; broken for the throne and the cantoria)
    const tx = X0 + 6.5, bx1 = xs - 0.6, runs = side > 0 ? [[X0 + 0.25, tx - 1.8], [tx + 1.8, bx1]] : [[X0 + 0.25, xs - 5.2]];
    for (const [r0, r1] of runs) {
      W('wood_dark', r0, 0, 0.2, r1, 0.2, 0.95); W('timber', r0, 0.2, 0.2, r1, 0.5, 0.95); W('wood_dark', r0, 0.5, 0.2, r1, 0.56, 0.95); W('cloth_red', r0 + 0.05, 0.56, 0.4, r1 - 0.05, 0.6, 0.92);
      W('timber', r0, 0.56, 0.2, r1, 1.6, 0.3); W('wood_dark', r0, 1.6, 0.14, r1, 1.72, 0.36);
      for (let u = r0 + 0.7; u < r1 - 0.4; u += 1.25) W('wood_dark', u, 0.62, 0.22, u + 0.04, 1.54, 0.26);
      col.rect(side < 0 ? [r0, Z0, r1, Z0 + 0.95] : [r0, Z1 - 0.95, r1, Z1], y, y + 1.7);
    }
  };
  wall(-1); wall(1);
  // the sconces and the candle-stands: iron brackets with a candle at the windows' jambs
  for (const w of wx) for (const sd of [-1, 1]) { const zz = sd < 0 ? Z0 + 0.12 : Z1 - 0.12; L.add('iron', lathe([[0.001, 0], [0.05, 0], [0.03, 0.18], [0.001, 0.2]], 6, null, w, y + 6.6, zz)); L.add('flame', lathe([[0.03, 0], [0.02, 0.1], [0.001, 0.16]], 5, null, w, y + 6.8, zz)); }
  // ── the end walls: the Last Judgment on the west (blue field; Christ in the mandorla, Mary, the saints in rings, the trumpeters, Charon's boat), the east's two painted stories and the door
  const vp = (z) => vaultY(z) - 0.04;
  const gz = (z0, z1) => { const pts = [[z0, y + 14.6], [z1, y + 14.6]]; for (let i = 0; i <= 12; i++) { const z = z1 - (z1 - z0) * i / 12; pts.push([z, y + vp(Math.abs(z))]); } return pts; };
  const lunW = (g, xa) => { g.rotateY(-Math.PI / 2); g.translate(xa, 0, cz); return g; };
  const endPatch = (xa, z0, z1, y0, y1, mat, dir = 1) => L.box(mat, dir > 0 ? xa : xa - 0.03, y + y0, cz + z0, dir > 0 ? xa + 0.03 : xa, y + y1, cz + z1);
  endPatch(X0 + 0.0, -6.5, 6.5, 2.9, 14.5, 'paint_blue');
  endPatch(X0 + 0.0, -6.7, 6.7, 14.6, 14.7, 'gilt_bronze'); endPatch(X0, -6.7, 6.7, 2.85, 2.92, 'gilt_bronze');
  bag.add('paint_blue', lunW(ext(gz(-HW, HW), [], -0.03, -0.012, 1), X0));
  const r3 = rng(1536), cx0 = X0 + 0.04;
  const fg = (z, yy, s, mat) => { // a figure group on the wall: a body and a head, as blocks on the wall
    L.box(mat, cx0, y + yy, cz + z - 0.22 * s, cx0 + 0.07 * s, y + yy + 0.8 * s, cz + z + 0.22 * s); L.box('skin_medium', cx0, y + yy + 0.8 * s, cz + z - 0.1 * s, cx0 + 0.07 * s, y + yy + 1.02 * s, cz + z + 0.1 * s);
  };
  const cols = ['skin_medium', 'skin_light', 'cloth_white', 'cloth_ochre', 'skin_light', 'cloth_red', 'skin_medium', 'cloth_grey'];
  for (const [rr, n] of [[2.4, 10], [4.0, 16], [5.4, 22]]) for (let i = 0; i < n; i++) {
    const a = i / n * Math.PI * 2 + rr * 0.3, z = Math.cos(a) * rr * 1.15, yy = 9.4 + Math.sin(a) * rr * 0.82;
    if (Math.abs(z) > 6.0 || yy < 4.6 || yy > 13.4) continue;
    fg(z, yy - 0.5, 0.95 + r3() * 0.25, cols[Math.floor(r3() * cols.length)]);
  }
  L.box('cloth_white', cx0, y + 7.9, cz - 0.7, cx0 + 0.09, y + 10.6, cz + 0.7); L.box('skin_medium', cx0, y + 10.6, cz - 0.3, cx0 + 0.09, y + 11.3, cz + 0.3); L.box('gold', cx0 - 0.01, y + 8.3, cz - 1.7, cx0 + 0.015, y + 12.2, cz + 1.7);   // Christ in his mandorla (gold behind)
  L.box('cloth_blue', cx0, y + 7.7, cz + 0.9, cx0 + 0.08, y + 9.4, cz + 1.7); L.box('skin_light', cx0, y + 9.4, cz + 1.1, cx0 + 0.08, y + 9.9, cz + 1.5);   // the Virgin at his side
  for (let i = 0; i < 7; i++) { const z = -2.8 + i * 0.95; fg(z, 5.5 + (i % 2) * 0.3, 0.9, i % 3 ? 'cloth_white' : 'cloth_green'); L.box('gilt_bronze', cx0, y + 6.7 + (i % 2) * 0.3, cz + z + 0.05, cx0 + 0.08, y + 6.78 + (i % 2) * 0.3, cz + z + 0.65); }   // the trumpeting angels
  L.box('wood_dark', cx0, y + 3.1, cz + 2.7, cx0 + 0.1, y + 3.55, cz + 5.6); L.box('skin_medium', cx0, y + 3.55, cz + 3.2, cx0 + 0.1, y + 4.3, cz + 3.5); L.box('cloth_black', cx0, y + 3.55, cz + 4.3, cx0 + 0.1, y + 4.6, cz + 4.7);   // Charon's boat with the damned
  L.box('rubble', cx0 - 0.015, y + 3.0, cz - 6.2, cx0 + 0.08, y + 4.3, cz - 3.2);                          // the rising dead
  for (let i = 0; i < 9; i++) fg(-6.0 + i * 0.35 + (i % 3) * 0.1, 3.0 + (i % 3) * 0.25, 0.85, i % 2 ? 'skin_medium' : 'skin_light');
  // the east wall inside: plain plaster with the two painted stories over the door, the blue lunette
  const xe = X1 - 0.02;
  L.box('lime_plaster', xe - 0.03, y + 4.75, cz - 6.6, xe, y + 14.4, cz + 6.6);
  for (const [a, b] of [[-6.6, -dh], [dh, 6.6]]) { L.box('lime_plaster', xe - 0.03, y + 2.95, cz + a, xe, y + 4.75, cz + b); L.box('paint_ochre', xe - 0.045, y + 0.1, cz + a, xe - 0.03, y + 2.85, cz + b); }
  L.box('paint_blue', xe - 0.045, y + 5.0, cz - 6.4, xe - 0.03, y + 8.0, cz - 1.7); L.box('paint_blue', xe - 0.045, y + 5.0, cz + 1.7, xe - 0.03, y + 8.0, cz + 6.4);
  L.box('fresco_green', xe - 0.045, y + 4.8, cz - 6.4, xe - 0.03, y + 5.0, cz - 1.7); L.box('fresco_green', xe - 0.045, y + 4.8, cz + 1.7, xe - 0.03, y + 5.0, cz + 6.4);
  for (let i = 0; i < 12; i++) { const z = (i < 6 ? -6 + i * 0.7 : 2 + (i - 6) * 0.7); L.box(['cloth_red', 'cloth_blue', 'cloth_ochre', 'cloth_white'][i % 4], xe - 0.07, y + 5.0, cz + z, xe - 0.045, y + 6.0, cz + z + 0.3); }
  bag.add('lime_plaster', lunW(ext(gz(-HW, HW), [], 0.005, 0.03, 1), X1));
  L.box('wood_dark', X1 - 0.16, y + 4.5, cz - dh, X1 - 0.02, y + 4.75, cz + dh);
  // ── the vault: Michelangelo's ceiling in patches that tile the surface (no overlap): the nine scenes, the ignudi, the prophets and sibyls on their thrones, the spandrels and lunettes
  const patch = (mat, xa, xb, s0, s1, side) => {
    const n = Math.max(2, Math.ceil(Math.abs(s1 - s0) * 10)), rows = [];
    for (let i = 0; i <= n; i++) { const ph = side * (s0 + (s1 - s0) * i / n) * PHI; rows.push([[xa, y + CY + R * Math.cos(ph), cz + R * Math.sin(ph)], [xb, y + CY + R * Math.cos(ph), cz + R * Math.sin(ph)]]); }
    bag.add(mat, sheet(rows));
  };
  const both = (fn) => { for (const side of [-1, 1]) fn(side); };
  // the central strip: nine scenes, large and small by turns, ignudi on the corners of the small ones, the bands between
  const scW = [2.6, 4.8, 2.6, 4.8, 2.6, 4.8, 2.6, 4.8, 2.6], gap = 0.8;
  let xa = X0 + 0.35; const scenes = [];
  scW.forEach((w, i) => { scenes.push([xa, xa + w, i]); xa += w + gap; });
  const SC = 0.27, CORN = 0.31, bay = 2 * HL / 6, rb = ['cloth_red', 'cloth_blue', 'cloth_green', 'cloth_ochre', 'cloth_maroon', 'cloth_indigo'];
  for (const [a, b, i] of scenes) {
    const sky = i % 3 === 1 ? 'fresco_green' : 'paint_blue';
    both((sd) => { patch(sky, a, b, 0, SC * 0.62, sd); patch(i % 2 ? 'cloth_ochre' : 'cloth_white', a, b, SC * 0.62, SC, sd); });
  }
  // the bands between the scenes: plaster, with a pair of ignudi seated at each corner (the end gaps plain)
  both((sd) => {
    patch('plaster_white', X0, scenes[0][0], 0, SC, sd); patch('plaster_white', scenes[8][1], X1, 0, SC, sd);
    for (let i = 0; i < 8; i++) { const a = scenes[i][1], b = scenes[i + 1][0]; patch('plaster_white', a, b, 0, SC * 0.15, sd); patch(i % 2 ? 'skin_medium' : 'skin_light', a + 0.1, b - 0.1, SC * 0.15, SC * 0.9, sd); patch('plaster_white', a, a + 0.1, SC * 0.15, SC * 0.9, sd); patch('plaster_white', b - 0.1, b, SC * 0.15, SC * 0.9, sd); patch('plaster_white', a, b, SC * 0.9, SC, sd); }
    patch('plaster_white', X0, X1, SC, CORN, sd); patch('gilt_bronze', X0, X1, CORN, CORN + 0.03, sd);
    // the thrones: a prophet or a sibyl in a robe in each bay between painted pilasters, ochre between
    for (let i = 0; i < 6; i++) {
      const a = X0 + i * bay, u = a + bay / 2, s0 = CORN + 0.03, s1 = 0.66;
      patch('paint_ochre', a, u - 1.6, s0, s1, sd); patch('paint_ochre', u + 1.6, a + bay, s0, s1, sd);
      patch('plaster_white', u - 1.6, u - 0.7, s0, s1, sd); patch('plaster_white', u + 0.7, u + 1.6, s0, s1, sd);
      patch('plaster_white', u - 0.7, u + 0.7, s0, 0.38, sd); patch('skin_light', u - 0.25, u + 0.25, 0.38, 0.5, sd); patch('paint_ochre', u - 0.7, u - 0.25, 0.38, 0.5, sd); patch('paint_ochre', u + 0.25, u + 0.7, 0.38, 0.5, sd);
      patch(rb[(i + (sd < 0 ? 3 : 0)) % 6], u - 0.7, u + 0.7, 0.5, 0.62, sd); patch('plaster_white', u - 0.7, u + 0.7, 0.62, s1, sd);
    }
    patch('plaster_white', X0, X1, 0.66, 0.69, sd);
    // the spandrels with the ancestors of Christ and the lunettes over the windows
    let prev = X0;
    wx.forEach((w, k) => {
      patch('stucco_rome', prev, w - 1.6, 0.69, 1, sd); prev = w + 1.6;
      patch('stucco_rome', w - 1.6, w + 1.6, 0.69, 0.74, sd); patch('lime_plaster', w - 1.6, w - 0.8, 0.74, 1, sd); patch('lime_plaster', w + 0.8, w + 1.6, 0.74, 1, sd);
      patch('lime_plaster', w - 0.8, w + 0.8, 0.74, 0.8, sd); patch(rb[(k * 2 + (sd < 0 ? 1 : 0)) % 6], w - 0.8, w + 0.8, 0.8, 0.98, sd); patch('lime_plaster', w - 0.8, w + 0.8, 0.98, 1, sd);
    });
    patch('stucco_rome', prev, X1, 0.69, 1, sd);
  });
  // the vault's ends (against the end walls) are the wall's own lunettes (above); the tied rod across the vault
  for (let k = 0; k < 4; k++) { const x = X0 + 5 + k * 10.2; L.box('iron', x - 0.03, y + CY + R * Math.cos(PHI * 0.7) - 0.35, cz - HW, x + 0.03, y + CY + R * Math.cos(PHI * 0.7) - 0.29, cz + HW); }
  // ── the marble screen across the chapel at xs, with its gate, and the cantoria against it
  const gate = 1.3, post = (z) => { S.box('marble', xs - 0.2, y, z - 0.2, xs + 0.2, y + 2.3, z + 0.2); S.add('gilt_bronze', lathe([[0.001, 0], [0.1, 0], [0.08, 0.15], [0.12, 0.3], [0.001, 0.5]], 8, null, xs, y + 2.3, z)); };
  const run = (za, zb) => {
    if (zb - za < 0.1) return;
    S.box('marble', xs - 0.2, y, za, xs + 0.2, y + 1.05, zb); S.box('giallo', xs - 0.22, y + 0.2, za + 0.15, xs - 0.2, y + 0.9, zb - 0.15); S.box('giallo', xs + 0.2, y + 0.2, za + 0.15, xs + 0.22, y + 0.9, zb - 0.15);
    S.box('marble', xs - 0.22, y + 1.05, za, xs + 0.22, y + 1.15, zb); S.box('marble', xs - 0.22, y + 2.0, za, xs + 0.22, y + 2.18, zb);
    for (let z = za + 0.12; z < zb - 0.08; z += 0.2) S.add('marble', lathe([[0.05, 0], [0.09, 0.2], [0.06, 0.45], [0.09, 0.7], [0.07, 0.85], [0.001, 0.85]], 6, null, xs, y + 1.15, z));
    col.rect([xs - 0.25, za, xs + 0.25, zb], y, y + 2.2);
  };
  run(Z0, cz - gate); run(cz + gate, Z1);
  for (const z of [Z0 + 0.2, cz - gate, cz + gate, Z1 - 0.2]) post(z);
  for (const z of [Z0 + (cz - gate - Z0) / 2, cz + gate + (Z1 - cz - gate) / 2]) post(z);
  // the cantoria: a marble tribune on the sanctuary side, at the north end, a panelled parapet and the choir's bench behind
  const kx1 = xs - 0.25, kx0 = kx1 - 4.4;
  S.box('marble', kx0, y, Z0 + 0.05, kx1, y + 1.3, Z0 + 1.9); S.box('giallo', kx0 + 0.2, y + 0.3, Z0 + 1.9, kx1 - 0.2, y + 1.1, Z0 + 1.93); S.box('marble', kx0 - 0.1, y + 1.3, Z0 + 0.05, kx1, y + 1.42, Z0 + 2.0);
  S.box('marble', kx0, y + 1.42, Z0 + 1.7, kx1, y + 2.1, Z0 + 1.9); S.box('marble', kx0 - 0.05, y + 2.1, Z0 + 1.65, kx1, y + 2.22, Z0 + 1.95);
  for (let x = kx0 + 0.4; x < kx1 - 0.3; x += 0.7) S.box('giallo', x, y + 1.55, Z0 + 1.9, x + 0.5, y + 2.0, Z0 + 1.93);
  S.box('wood_dark', kx0 + 0.1, y + 1.42, Z0 + 0.1, kx1 - 0.1, y + 1.9, Z0 + 0.6);
  col.rect([kx0 - 0.1, Z0 + 0.05, kx1, Z0 + 2.0], y, y + 2.2);
  // ── the papal throne on the south side before the altar, under its canopy and hanging of red velvet; the altar with its steps
  const tx = X0 + 6.5, tz = Z1;
  S.box('wood_dark', tx - 1.7, y, tz - 2.3, tx + 1.7, y + 0.28, tz); S.box('cloth_red', tx - 1.6, y + 0.28, tz - 2.2, tx + 1.6, y + 0.3, tz - 0.05);
  S.box('cloth_red', tx - 1.4, y + 0.3, tz - 0.12, tx + 1.4, y + 4.6, tz - 0.06); S.box('gilt_bronze', tx - 1.5, y + 4.6, tz - 0.3, tx + 1.5, y + 4.75, tz - 0.04);
  S.box('cloth_red', tx - 1.45, y + 3.8, tz - 1.6, tx + 1.45, y + 4.0, tz - 0.14); for (let k = 0; k < 14; k++) S.box('gold', tx - 1.45 + k * 0.2, y + 3.55, tz - 1.6, tx - 1.45 + k * 0.2 + 0.05, y + 3.8, tz - 1.58);
  S.box('wood_dark', tx - 0.4, y + 0.3, tz - 1.0, tx + 0.4, y + 0.78, tz - 0.3); S.box('cloth_red', tx - 0.38, y + 0.78, tz - 0.98, tx + 0.38, y + 0.86, tz - 0.32); S.box('wood_dark', tx - 0.4, y + 0.86, tz - 0.4, tx + 0.4, y + 1.9, tz - 0.3); S.box('cloth_red', tx - 0.34, y + 0.9, tz - 0.42, tx + 0.34, y + 1.86, tz - 0.4);
  for (const s of [-1, 1]) { S.box('gilt_bronze', tx + s * 1.5 - 0.06, y + 0.3, tz - 1.65, tx + s * 1.5 + 0.06, y + 3.8, tz - 1.55); S.box('gilt_bronze', tx + s * 0.5 - 0.35, y + 0.3, tz - 1.0, tx + s * 0.5 + 0.35 * 0, y + 0.3, tz - 0.3); }
  col.floor([tx - 1.7, tz - 2.3, tx + 1.7, tz], y + 0.28); col.rect([tx - 0.5, tz - 1.1, tx + 0.5, tz], y + 0.28, y + 2.0); col.rect([tx - 1.5, tz - 0.25, tx + 1.5, tz], y + 0.28, y + 4.8);
  const ax = X0 + 2.6;
  S.box('marble', ax - 1.1, y, cz - 2.0, ax + 1.1, y + 0.26, cz + 2.0); S.box('marble', ax - 0.55, y + 0.26, cz - 1.5, ax + 0.55, y + 1.02, cz + 1.5); S.box('cloth_white', ax - 0.6, y + 1.02, cz - 1.55, ax + 0.6, y + 1.04, cz + 1.55); S.box('cloth_white', ax + 0.55, y + 0.5, cz - 1.5, ax + 0.6, y + 1.04, cz + 1.5); S.box('cloth_red', ax + 0.6, y + 0.52, cz - 1.0, ax + 0.63, y + 1.0, cz + 1.0); S.box('gold', ax + 0.62, y + 0.9, cz - 1.0, ax + 0.64, y + 0.98, cz + 1.0);
  for (let k = -2; k <= 2; k++) { if (k === 0) continue; const z = cz + k * 0.62, h = 0.78 - Math.abs(k) * 0.08; S.add('gilt_bronze', lathe([[0.001, 0], [0.09, 0], [0.04, 0.12], [0.05, 0.4], [0.07, 0.5], [0.04, 0.55], [0.001, h]], 8, null, ax, y + 1.04, z)); S.add('flame', lathe([[0.03, 0], [0.02, 0.1], [0.001, 0.2]], 5, null, ax, y + 1.04 + h, z)); }
  S.add('gilt_bronze', lathe([[0.1, 0], [0.1, 0.1], [0.04, 0.15], [0.04, 0.9], [0.001, 0.92]], 8, null, ax, y + 1.04, cz)); S.box('gilt_bronze', ax - 0.025, y + 1.7, cz - 0.3, ax + 0.025, y + 1.78, cz + 0.3); S.box('gilt_bronze', ax - 0.025, y + 1.5, cz - 0.03, ax + 0.025, y + 2.2, cz + 0.03);
  col.rect([ax - 1.1, cz - 2.0, ax + 1.1, cz + 2.0], y, y + 2.3);
  L.emit(bag); S.emit(bag);
  // the light: candles on the altar, two cressets by the screen, and the window light falls from above
  if (lights) { lights.push({ at: [ax + 0.2, y + 2.2, cz], color: '#ffc27a', intensity: 2.2, distance: 9 }, { at: [xs - 1.2, y + 3.0, cz], color: '#ffd9a0', intensity: 1.6, distance: 11 }, { at: [X1 - 6, y + 3.0, cz], color: '#ffd9a0', intensity: 1.2, distance: 10 }); }
}
