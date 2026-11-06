// The Piazza San Marco about 1500 (docs/settlements/venice.md §4c–§4e): the Clock Tower of
// 1496–99 at the entrance to the Merceria, still without its wings (they came by 1506) — the
// archway two storeys high, the great blue and gold dial in its ring of marble with the 24 hours,
// the zodiac and the sun pointer; the semicircular gallery with the Virgin and Child in gilt copper
// and the doors of the Magi; the winged lion on blue with gold stars and Doge Agostino Barbarigo
// kneeling before it (removed in 1797; not shown); the terrace with the bell of 1497 and the two bronze giants that strike it,
// then gilt. The old Procuratie as Gentile Bellini painted them in 1496 — two storeys, shops behind
// a long arcade of stilted round arches on columns, the apartments above lit by a row of arched
// windows twice as many, the crenellated top. The two columns of the Piazzetta: the winged lion
// of St Mark in bronze, St Theodore on his dragon in marble, on Veneto-Byzantine capitals over
// stepped bases.

import { box, lathe, frustum, rod, disc } from '../../core/geom.js';
import { faceFrame, Local, ext, archOutline, headPts, wrect } from '../renaissance/face.js';
import { human, blob, limb as slimb } from '../greek/sculpture.js';
import { ball, limb, T } from '../qing/carving.js';

const M = 'marble', I = 'limestone', O = 'opening', GB = 'gilt_bronze', BLUE = 'paint_blue', PL = 'plaster_white', R = 'roof_tile', CV = 'limestone_carved';

/** A flat round boss of radius r and thickness t facing +z (a lens: round in its face, thin in depth). */
const flat = (r, t, n, x, y, z) => ball(r, t, r, n, 3).rotateX(Math.PI / 2).translate(x, y, z);

/** The winged lion of St Mark, standing (passant) toward +x, a forepaw on the open book; length ~ s × 3 m. Pieces into Lc as mat. */
export function lionOfStMark(Lc, mat, s = 1, book = true) {
  const B = (rx, ry, rz, x, y, z, n = 8) => Lc.add(mat, T(ball(rx * s, ry * s, rz * s, n, 5), x * s, y * s, z * s));
  const Lm = (a, b, r0, r1, n = 7) => Lc.add(mat, limb(a.map((v) => v * s), b.map((v) => v * s), r0 * s, r1 * s, n));
  Lm([-0.85, 1.0, 0], [0.55, 1.12, 0], 0.4, 0.47, 10);                              // the body
  B(0.42, 0.5, 0.42, 0.75, 1.3, 0, 10);                                              // the mane
  B(0.26, 0.27, 0.25, 1.05, 1.42, 0);                                                // the head
  B(0.15, 0.12, 0.15, 1.27, 1.34, 0, 6);                                             // the muzzle
  for (const z of [-0.12, 0.12]) B(0.06, 0.06, 0.05, 1.0, 1.66, z, 5);               // the ears
  // the legs: the right fore raised onto the book, the others planted
  for (const [hx, z, fx, fy, up] of [[0.55, 0.2, 0.62, 0.0, 0], [0.55, -0.2, 1.0, 0.45, 1], [-0.75, 0.2, -0.85, 0.0, 0], [-0.75, -0.2, -0.6, 0.0, 0]]) {
    const kx = (hx + fx) / 2 + (up ? 0.15 : 0.03), ky = up ? 0.75 : 0.5;
    Lm([hx, 0.95, z], [kx, ky, z], 0.21, 0.14); Lm([kx, ky, z], [fx, fy + 0.05, z], 0.14, 0.11); B(0.15, 0.08, 0.13, fx + 0.06, fy + 0.07, z, 6);
  }
  Lm([-0.9, 1.05, 0], [-1.35, 0.7, 0], 0.07, 0.05); Lm([-1.35, 0.7, 0], [-1.2, 0.25, 0.05], 0.05, 0.04); B(0.09, 0.12, 0.08, -1.2, 0.2, 0.05, 5);   // the tail
  // the wings: broad feathered blades raised from the shoulders, a little apart
  for (const sg of [-1, 1]) {
    const pts = [[0, 0], [-0.25, 0.25], [-0.55, 0.75], [-0.75, 1.35], [-0.55, 1.15], [-0.6, 1.3], [-0.38, 1.0], [-0.42, 1.12], [-0.2, 0.75], [0.15, 0.25]];
    const w = ext(pts.map(([a, b]) => [a * s, b * s]), [], -0.03 * s, 0.03 * s);
    w.rotateX(sg * 0.18); w.translate(0.3 * s, 1.3 * s, sg * 0.34 * s); Lc.add(mat, w);
  }
  if (book) { const bk = box(0.82 * s, 0.32 * s, -0.42 * s, 1.32 * s, 0.42 * s, 0.12 * s); bk.rotateZ(-0.25); bk.translate(0.15 * s, 0.05 * s, 0); Lc.add(mat, bk); }
}

/** clock_tower: { rect, h (to the terrace), y, front ('s') } — the tower of 1496–99, the archway through it to the Merceria. */
export function clockTower(el, { bag, col }) {
  const rect = el.rect, [x0, z0, x1, z1] = rect, y = el.y ?? 0, h = el.h ?? 24, front = el.front ?? 's';
  const { M: FM, L } = faceFrame(rect, front, y), D = front === 'n' || front === 's' ? z1 - z0 : x1 - x0;
  const Lc = new Local(), aw = 4.6, ay = 7.6, yA = 11.2, yC = 17.2, yG = 20.3, yL = h;
  // the body: two side piers round the passage up to the archway's top, solid above; the passage's vault
  const pw = (L - aw) / 2;
  Lc.box(I, 0, -0.5, -D, pw, yA, 0); Lc.box(I, L - pw, -0.5, -D, L, yA, 0); Lc.box(M, 0, yA, -D, L, yL, 0);
  // the archway: its round arch with moulded voussoirs, the pilasters on the piers, the entablature over it
  Lc.add(M, ext(headPts(L / 2, ay, aw + 0.9, 'round', 12).concat(headPts(L / 2, ay, aw, 'round', 12).reverse()), [], 0, 0.22));
  Lc.add(I, ext(headPts(L / 2, ay, aw, 'round', 12).concat([[L / 2 - aw / 2, yA], [L / 2 + aw / 2, yA]]), [], -D, -0.001));   // the barrel vault of the passage
  for (const u of [pw / 2 - 0.15, L - pw / 2 + 0.15]) {
    Lc.box(M, u - 0.75, -0.3, 0, u + 0.75, 0.6, 0.45);
    for (const du of [-0.42, 0.42]) { Lc.add(M, lathe([[0.26, 0], [0.22, 0.25], [0.2, yA - 1.9], [0.3, yA - 1.4], [0.32, yA - 1.2]], 10, null, u + du, 0.6, 0.28)); }
    Lc.box(M, u - 0.8, yA - 1.2 + 0.6, 0, u + 0.8, yA, 0.45);
  }
  Lc.box(M, -0.15, yA, 0, L + 0.15, yA + 0.55, 0.55);
  // the dial: the marble ring of the 24 hours, the blue field with the zodiac's gold, the sun pointer, the earth and moon at the centre
  const cu = L / 2, cy = (yA + 0.55 + yC) / 2, rO = 2.5;
  const ringG = lathe([[rO, 0], [rO, 0.2], [rO - 0.55, 0.22], [rO - 0.55, 0.0]], 40); ringG.rotateX(Math.PI / 2); ringG.translate(cu, cy, 0.0); Lc.add(M, ringG);
  for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; Lc.box(GB, cu + Math.cos(a) * (rO - 0.28) - 0.05, cy + Math.sin(a) * (rO - 0.28) - 0.12, 0.2, cu + Math.cos(a) * (rO - 0.28) + 0.05, cy + Math.sin(a) * (rO - 0.28) + 0.12, 0.24); }
  const field = disc(rO - 0.55, 0, 40); field.rotateX(Math.PI / 2); field.translate(cu, cy, 0.06); Lc.add(BLUE, field);
  for (let k = 0; k < 12; k++) { const a = (k + 0.5) / 12 * Math.PI * 2, r = rO - 1.0; Lc.add(GB, flat(0.2, 0.04, 8, cu + Math.cos(a) * r, cy + Math.sin(a) * r, 0.08)); }
  const zring = lathe([[rO - 1.3, 0], [rO - 1.25, 0.05], [rO - 0.7, 0.05], [rO - 0.65, 0]], 32); zring.rotateX(Math.PI / 2); zring.translate(cu, cy, 0.06); Lc.add(GB, zring);
  Lc.add(BLUE, flat(0.85, 0.12, 20, cu, cy, 0.08)); Lc.add('silver', flat(0.3, 0.1, 12, cu + 0.45, cy + 0.22, 0.16));
  { const p = rod([cu, cy, 0.24], [cu + Math.cos(1.1) * (rO - 0.35), cy + Math.sin(1.1) * (rO - 0.35), 0.24], 0.06, 5); Lc.add(GB, p); Lc.add(GB, flat(0.22, 0.06, 12, cu + Math.cos(1.1) * (rO - 0.35), cy + Math.sin(1.1) * (rO - 0.35), 0.26)); }
  // the spandrels round the dial in coloured marble, the cornice over it
  for (const sg of [-1, 1]) for (const sv of [-1, 1]) Lc.add('marble_pink', ext([[cu + sg * (rO + 0.05), cy + sv * (rO + 0.05)], [cu + sg * (L / 2 - 0.5), cy + sv * (rO + 0.05)], [cu + sg * (L / 2 - 0.5), cy + sv * 0.4]].map(([a, b]) => [a, b]), [], 0, 0.04).translate(0, 0, 0));
  for (const u of [0.35, L - 0.35]) Lc.box(M, u - 0.35, yA + 0.55, 0, u + 0.35, yC, 0.3);
  Lc.box(M, -0.15, yC, 0, L + 0.15, yC + 0.5, 0.6);
  // the gallery: a half-round balcony, the niche with the Virgin and Child, the two doors of the Magi
  const gu = L / 2, gy = yC + 0.5;
  const bal = lathe([[1.7, 0], [1.75, 0.15], [1.6, 0.3], [0.001, 0.3]], 16); bal.scale(1, 1, 0.75); Lc.add(M, bal.translate(gu, gy - 0.3, 0));
  for (let k = 0; k <= 12; k++) { const a = Math.PI * k / 12; Lc.add(M, lathe([[0.06, 0], [0.09, 0.3], [0.05, 0.65], [0.07, 0.85]], 6, null, gu + Math.cos(a) * 1.55, gy, Math.sin(a) * 1.55 * 0.75)); }
  { const rail = lathe([[1.62, 0], [1.62, 0.08], [1.48, 0.08], [1.48, 0]], 16, null, 0, 0, 0); rail.scale(1, 1, 0.75); Lc.add(M, rail.translate(gu, gy + 0.85, 0)); }
  Lc.add(BLUE, ext(archOutline(gu, gy, 1.5, gy + 1.5, 'round', 8), [], -0.02, 0.02));
  Lc.add(M, ext(headPts(gu, gy + 1.5, 1.9, 'round', 8).concat(headPts(gu, gy + 1.5, 1.5, 'round', 8).reverse()), [], 0, 0.15));
  { const v = human({ pose: 'seat', h: 1.5, drape: 'peplos', n: 5, arms: { l: [[-0.14, 0.45, 0.06], [-0.04, 0.48, 0.15]] } }); for (const g of [...v.stone, ...v.skin]) { g.translate(gu, gy + 0.05, 0.25); Lc.add(GB, g); } Lc.add(GB, T(ball(0.1, 0.12, 0.1, 6, 4), gu - 0.05, gy + 0.92, 0.42)); Lc.add(GB, slimb([gu - 0.12, gy + 0.62, 0.4], [gu + 0.05, gy + 0.8, 0.42], 0.07, 0.06, 5)); }
  for (const sg of [-1, 1]) {
    const du = gu + sg * 2.35;
    Lc.box('wood_dark', du - 0.45, gy, -0.02, du + 0.45, gy + 1.9, 0.03);
    Lc.add(M, ext(headPts(du, gy + 1.9, 1.15, 'round', 6).concat(headPts(du, gy + 1.9, 0.9, 'round', 6).reverse()), [], 0, 0.12));
    Lc.box('wood_dark', du - 0.45, gy + 1.9, -0.02, du + 0.45, gy + 2.35, 0.03);
    for (const s2 of [-1, 1]) Lc.box(M, du + s2 * 0.45 - (s2 > 0 ? 0 : 0.125), gy, 0, du + s2 * 0.45 + (s2 > 0 ? 0.125 : 0), gy + 1.9, 0.12);
  }
  Lc.box(M, -0.15, yG, 0, L + 0.15, yG + 0.45, 0.55);
  // the lion of St Mark on blue with gold stars, the doge kneeling before him
  const ly = yG + 0.45;
  Lc.box(BLUE, 0.8, ly + 0.15, 0, L - 0.8, yL - 0.35, 0.03);
  for (let i = 0; i < 26; i++) { const su = 1.0 + ((i * 0.618) % 1) * (L - 2.0), sv = ly + 0.3 + ((i * 0.382 + 0.17) % 1) * (yL - ly - 0.9); Lc.add(GB, flat(0.08, 0.02, 5, su, sv, 0.04)); }
  for (const u of [0.4, L - 0.4]) Lc.box(M, u - 0.4, ly, 0, u + 0.4, yL - 0.35, 0.3);
  const lion = new Local(); lionOfStMark(lion, GB, 0.95);
  for (const list of lion.m.values()) for (const g of list) { g.translate(L / 2 - 0.4, ly + 0.25, 0.4); Lc.add(GB, g); }
  Lc.box(M, -0.2, yL - 0.35, 0, L + 0.2, yL, 0.6);
  // the terrace: the balustrade, the bell on its frame, the two giants with their hammers
  Lc.box(M, -0.2, yL, -D, L + 0.2, yL + 0.3, 0.3);
  for (const [a, b, c2, d2] of [[0, 0.1, L, 0.3], [0, -D, L, -D + 0.2], [0, -D, 0.2, 0.3], [L - 0.2, -D, L, 0.3]]) {
    Lc.box(M, a, yL + 0.3, b, c2, yL + 0.42, d2); Lc.box(M, a, yL + 1.05, b, c2, yL + 1.17, d2);
  }
  for (let u = 0.35; u < L - 0.2; u += 0.4) Lc.add(M, lathe([[0.06, 0], [0.09, 0.25], [0.05, 0.5], [0.07, 0.63]], 6, null, u, yL + 0.42, 0.2));
  const bu = L / 2, bz = -D / 2;
  for (const sg of [-1, 1]) Lc.add('iron', rod([bu + sg * 1.6, yL + 0.3, bz], [bu + sg * 0.15, yL + 4.6, bz], 0.07, 6));
  Lc.add('iron', rod([bu - 0.4, yL + 4.6, bz], [bu + 0.4, yL + 4.6, bz], 0.06, 6));
  Lc.add('bronze', lathe([[0.001, 0], [1.05, 0], [1.0, 0.15], [0.82, 0.55], [0.66, 1.15], [0.6, 1.45], [0.35, 1.62], [0.001, 1.65]], 18, null, bu, yL + 2.85, bz));
  for (const sg of [-1, 1]) {
    const g = human({ pose: 'stride', h: 2.6, drape: 'nude', n: 5, mirror: sg > 0 });
    for (const p of g.stone.concat(g.skin)) { p.translate(bu + sg * 2.0, yL + 0.3, bz); Lc.add(GB, p); }
    Lc.add(GB, rod([bu + sg * 2.0, yL + 0.3 + 2.68, bz], [bu + sg * 0.8, yL + 4.05, bz], 0.035, 5));
    Lc.add(GB, box(bu + sg * 0.8 - 0.12, yL + 3.95, bz - 0.08, bu + sg * 0.8 + 0.12, yL + 4.15, bz + 0.08));
  }
  Lc.emit(bag, FM);
  // obstacles: the two piers; the passage is open
  col.rect(wrect(FM, 0, -D, pw, 0.45), y, y + yL); col.rect(wrect(FM, L - pw, -D, L, 0.45), y, y + yL);
  col.floor(wrect(FM, 0, -D, L, 0.3), y + yL + 0.3);
}

/** procuratie: { rect, h, y, front } — the old Procuratie: an arcade of stilted round arches on columns before the shops, a row of arched windows above, the crenellated top. */
export function procuratieOld(el, { bag, col }) {
  const rect = el.rect, [x0, z0, x1, z1] = rect, y = el.y ?? 0, h = el.h ?? 11, f = el.front ?? 's';
  const { M: FM, L } = faceFrame(rect, f, y), D = f === 'n' || f === 's' ? z1 - z0 : x1 - x0, P = 4.2;
  const yA = 5.6, n = Math.max(2, Math.round(L / 3.1)), bay = L / n;
  // the block behind the portico, the upper storey over all, the roof
  const core = wrect(FM, 0, -D, L, -P);
  bag.add(PL, box(core[0], y - 0.5, core[1], core[2], y + yA, core[3])); col.rect(core, y, y + h);
  const Lc = new Local(); Lc.noBack = true; Lc.L = L;
  Lc.box(PL, 0, yA, -D, L, h, 0);
  // the arcade: columns with leaf capitals and impost blocks; the stilted arches; the ceiling of the portico
  const ys = 3.5, r = (bay - 0.55) / 2;
  // the spandrels over the capitals: the arches notched out of the bottom of one plate, stilted 0.4 m
  const sp = [[0, ys]];
  for (let i = 0; i < n; i++) { const a = i * bay + 0.3, b = (i + 1) * bay - 0.3; sp.push([a, ys], ...headPts((a + b) / 2, ys + 0.4, b - a, 'round', 6).reverse(), [b, ys]); }
  sp.push([L, ys], [L, yA], [0, yA]);
  Lc.add(I, ext(sp, [], -0.55, 0));
  for (let i = 0; i <= n; i++) {
    const u = Math.min(L - 0.3, Math.max(0.3, i * bay));
    Lc.add(M, lathe([[0.26, 0], [0.18, 0.3], [0.16, ys - 0.45], [0.28, ys - 0.1], [0.3, ys]], 8, (th, j) => (j === 3 ? 1 + 0.1 * Math.cos(th * 4) : 1), u, 0, -0.28));
    col.circle(...toXZ(FM, u, -0.28), 0.25, y, y + yA);
  }
  for (let i = 0; i < n; i++) Lc.add(I, ext(headPts((i + 0.5) * bay, ys + 0.4, 2 * r + 0.3, 'round', 6).concat(headPts((i + 0.5) * bay, ys + 0.4, 2 * r, 'round', 6).reverse()), [], 0, 0.08));
  Lc.box(I, 0, yA - 0.35, -P, L, yA - 0.05, -0.55);                                         // the portico's ceiling
  Lc.box('brick_paving', 0, -0.3, -P, L, 0.05, 0); col.floor(wrect(FM, 0, -P, L, 0), y + 0.05);
  // the shops at the back of the portico: a door and a window in each bay, the shutters propped
  for (let i = 0; i < n; i++) {
    const uc = (i + 0.5) * bay;
    Lc.box(O, uc - 0.55, 0.05, -P - 0.02, uc + 0.55, 2.4, -P + 0.01);
    Lc.box('wood_dark', uc - 0.6, 2.4, -P, uc + 0.6, 2.55, -P + 0.08);
    Lc.box(O, uc + 0.75, 0.9, -P - 0.02, uc + 1.25, 2.1, -P + 0.01);
    Lc.box('wood_dark', uc + 0.72, 0.8, -P, uc + 1.28, 0.88, -P + 0.35);
  }
  // the string course; the windows of the apartments, two to each bay, round-headed in white stone
  Lc.box(I, -0.1, yA - 0.05, 0, L + 0.1, yA + 0.25, 0.25);
  const ww = 0.85, wy = yA + 1.1, wh = 2.0;
  for (let i = 0; i < 2 * n; i++) {
    const uc = (i + 0.5) * bay / 2;
    Lc.add(O, ext(archOutline(uc, wy, ww, wy + wh, 'round', 4), [], -0.02, 0.01));
    Lc.add(I, ext(headPts(uc, wy + wh, ww + 0.3, 'round', 4).concat(headPts(uc, wy + wh, ww, 'round', 4).reverse()), [], 0, 0.1));
    for (const sg of [-1, 1]) Lc.box(I, uc + sg * ww / 2 - (sg > 0 ? 0 : 0.15), wy, 0, uc + sg * ww / 2 + (sg > 0 ? 0.15 : 0), wy + wh, 0.1);
    Lc.box(I, uc - ww / 2 - 0.2, wy - 0.15, 0, uc + ww / 2 + 0.2, wy, 0.18);
  }
  // the cornice and the crenellation: square merlons with their white copings
  Lc.box(I, -0.1, h - 0.35, 0, L + 0.1, h, 0.3);
  const nm = Math.round(L / 1.25), ms = L / nm;
  for (let k = 0; k < nm; k++) { const u = (k + 0.5) * ms; Lc.box(PL, u - 0.32, h, -0.3, u + 0.32, h + 1.0, 0); Lc.add(I, frustum([u - 0.36, -0.34, u + 0.36, 0.04], h + 1.0, h + 1.25, 0.32, 0.32, 0.15, 0.15)); }
  Lc.emit(bag, FM);
  // the roof behind the merlons
  bag.add(R, frustum([x0 + 0.4, z0 + 0.4, x1 - 0.4, z1 - 0.4], y + h, y + h + 2.6, f === 'e' || f === 'w' ? (x1 - x0) / 2 - 0.4 : 0, f === 'e' || f === 'w' ? (x1 - x0) / 2 - 0.4 : 0, f === 'n' || f === 's' ? (z1 - z0) / 2 - 0.4 : 0, f === 'n' || f === 's' ? (z1 - z0) / 2 - 0.4 : 0));
}
const toXZ = (FM, u, d) => { const e = FM.elements; return [e[12] + e[0] * u + e[8] * d, e[14] + e[2] * u + e[10] * d]; };

/** column_statue: { c, h, y, statue ('lion' | 'theodore'), granite } — a column of the Piazzetta with its patron on top. */
export function columnStatue(el, { bag, col }) {
  const [x, z] = el.c, h = el.h ?? 12.5, y = el.y ?? 0, Lc = new Local();
  // the stepped base (three steps, its faces once carved with the trades), the plinth
  for (let k = 0; k < 3; k++) { const s = 2.4 - k * 0.45; Lc.box(I, x - s, y - 0.3 + k * 0.38, z - s, x + s, y + 0.08 + k * 0.38, z + s); }
  const yb = y + 0.84;
  Lc.add(I, lathe([[1.15, 0], [1.15, 0.5], [1.0, 0.65], [0.92, 0.75], [0.001, 0.75]], 8).rotateY(Math.PI / 8).translate(x, yb, z));
  // the shaft of granite, its torus, the Veneto-Byzantine capital (a basket of stiff leaves), the abacus
  const ys = yb + 0.75, sh = h;
  Lc.add(el.granite ?? 'granite_grey', lathe([[0.78, 0], [0.74, 0.3], [0.7, sh * 0.5], [0.62, sh]], 16, null, x, ys, z));
  Lc.add(I, lathe([[0.82, 0], [0.86, 0.12], [0.78, 0.25]], 16, null, x, ys, z));
  Lc.add(M, lathe([[0.62, 0], [0.7, 0.4], [0.95, 1.1], [1.15, 1.55], [1.2, 1.7]], 12, (th, j) => (j === 2 || j === 3 ? 1 + 0.1 * Math.cos(th * 8) : 1), x, ys + sh, z));
  Lc.box(M, x - 1.3, ys + sh + 1.7, z - 1.3, x + 1.3, ys + sh + 2.05, z + 1.3);
  const yt = ys + sh + 2.05;
  if (el.statue === 'lion') {
    const lion = new Local(); lionOfStMark(lion, 'bronze', 1.1);
    for (const list of lion.m.values()) for (const g of list) { g.rotateY(-Math.PI / 2); g.translate(x - 0.1, yt, z); Lc.add('bronze', g); }
  } else {
    // St Theodore with spear and shield on the dragon (the crocodile) at his feet
    Lc.box(M, x - 0.75, yt, z - 0.75, x + 0.75, yt + 0.3, z + 0.75);
    Lc.add(CV, slimb([x - 0.6, yt + 0.42, z + 0.1], [x + 0.55, yt + 0.4, z - 0.15], 0.2, 0.12, 7));
    Lc.add(CV, T(ball(0.16, 0.12, 0.28, 7, 4), x - 0.7, yt + 0.42, z + 0.3));
    Lc.add(CV, slimb([x + 0.5, yt + 0.4, z - 0.15], [x + 0.6, yt + 0.35, z + 0.55], 0.1, 0.04, 6));
    const f = human({ pose: 'ease', h: 2.6, drape: 'chiton', helmet: true, shield: 'l', spear: 'r', spearDir: [0.05, 1, 0], n: 5 });
    for (const g of [...f.stone, ...f.metal, ...f.skin]) { g.translate(x, yt + 0.3, z); Lc.add(CV, g); }
  }
  Lc.emit(bag);
  col.circle(x, z, 2.4, y, y + 0.84);
}
