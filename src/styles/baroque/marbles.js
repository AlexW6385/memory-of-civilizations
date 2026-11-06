// St Peter's inside: the coloured marbles and the sculpture of the 1640s–60s (docs/settlements/baroque-rome.md §4c).
// Bernini's decoration of the nave for Innocent X (begun 1645): the fluted Corinthian pilasters with
// gilt capitals, the piers' faces revetted in coloured marbles (giallo antico frames, red and green
// fields), on them the white medallions of the sainted popes on gilt grounds, borne by pairs of
// winged putti with the tiara and the keys, Innocent's dove with the olive branch below; the
// reclining Virtues on the arches; the niches between the pilasters; the pavement of coloured
// marbles in geometric figures with the porphyry disc by the door; the bronze St Peter on his
// marble chair; the tombs of Urban VIII (Bernini, 1628–47) and Paul III (Guglielmo della Porta)
// flanking the Cathedra. Everything goes into the caller's Local (merged per material).

import { Matrix4 } from '../../core/three.js';
import { box, lathe, rod } from '../../core/geom.js';
import { ext, archOutline, headPts } from '../renaissance/face.js';
import { human } from '../greek/sculpture.js';
import { ball, T } from '../qing/carving.js';

const PK = 'proconnesian', GI = 'giallo', AF = 'breccia_red', VA = 'verde_antico', WM = 'marble_smooth', GB = 'gilt_bronze', BR = 'bronze', ND = 'marble_dark', PO = 'porphyry', M = 'marble';

/** A frame on the plan line a → b at height y: u along it, d toward its left, y up. */
export function lineFrame(a, b, y) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  return { M: new Matrix4().set(ux, 0, -uz, a[0], 0, 1, 0, y, uz, 0, ux, a[1], 0, 0, 0, 1), L };
}
/** The frame on the line p0–p1 whose d points along the plan vector n. */
export function frameFacing(p0, p1, n, y) { const F = lineFrame(p0, p1, y), e = F.M.elements; return e[8] * n[0] + e[10] * n[1] >= 0 ? F : lineFrame(p1, p0, y); }
const put = (Lc, mat, g, F) => Lc.add(mat, g.applyMatrix4(F.M));
const circ = (cx, cy, r, n = 28) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
/** A disc (or ring, if r0) lying on the wall, from d0 to d1. */
const wallDisc = (uc, yc, r1, r0, d0, d1, n = 28) => ext(circ(uc, yc, r1, n), r0 ? [circ(uc, yc, r0, n).reverse()] : [], d0, d1, 1);

/** A fluted Corinthian pilaster of grey-white marble with its gilt capital: centred at u, w wide, from y0 to y1 (the architrave's foot), on the wall's plane d0. */
export function pilaster(Lc, F, u, y0, y1, w = 2, d0 = 0) {
  const hc = 1.8, yc = y1 - hc, u0 = u - w / 2, u1 = u + w / 2, nf = 8, fil = 0.07;
  put(Lc, PK, box(u0 - 0.25, y0, d0, u1 + 0.25, y0 + 1.4, d0 + 0.6), F);                // the pedestal
  put(Lc, PK, box(u0 - 0.15, y0 + 1.4, d0, u1 + 0.15, y0 + 1.62, d0 + 0.54), F);         // the base's plinth and torus
  put(Lc, PK, box(u0 - 0.07, y0 + 1.62, d0, u1 + 0.07, y0 + 1.8, d0 + 0.48), F);
  put(Lc, PK, box(u0, y0 + 1.8, d0, u1, yc, d0 + 0.3), F);                               // the shaft's core, the flutes' floor
  for (let k = 0; k <= nf; k++) { const a = u0 + (w - fil) * k / nf; put(Lc, PK, box(a, y0 + 2.1, d0 + 0.3, a + fil, yc - 0.3, d0 + 0.42), F); }
  for (const [ya, yb] of [[y0 + 1.8, y0 + 2.1], [yc - 0.3, yc]]) put(Lc, PK, box(u0, ya, d0 + 0.3, u1, yb, d0 + 0.42), F);
  // the capital: the bell, two rows of acanthus, the corner volutes and the flower, the abacus
  put(Lc, GB, box(u0, yc, d0, u1, yc + hc * 0.84, d0 + 0.45), F);
  for (let k = 0; k < 4; k++) put(Lc, GB, T(ball(w * 0.11, hc * 0.17, 0.11, 6, 3), u0 + (k + 0.5) * w / 4, yc + hc * 0.2, d0 + 0.47), F);
  for (let k = 0; k < 3; k++) put(Lc, GB, T(ball(w * 0.12, hc * 0.2, 0.12, 6, 3), u0 + (k + 1) * w / 4, yc + hc * 0.48, d0 + 0.47), F);
  for (const a of [u0 + 0.14, u1 - 0.14]) put(Lc, GB, T(ball(0.2, 0.2, 0.16, 7, 4), a, yc + hc * 0.74, d0 + 0.5), F);
  put(Lc, GB, T(ball(0.15, 0.15, 0.1, 6, 3), u, yc + hc * 0.74, d0 + 0.5), F);
  put(Lc, GB, box(u0 - 0.12, yc + hc * 0.84, d0, u1 + 0.12, y1, d0 + 0.6), F);
}

/** A field of coloured marble in a giallo antico frame with a green fillet: u0..u1, y0..y1, standing on the plane d. */
export function revet(Lc, F, u0, u1, y0, y1, d = 0, field = AF) {
  const f = 0.24, s = 0.07;
  put(Lc, field, box(u0 + f - 0.02, y0 + f - 0.02, d, u1 - f + 0.02, y1 - f + 0.02, d + 0.04), F);
  put(Lc, GI, box(u0, y0, d, u0 + f, y1, d + s), F); put(Lc, GI, box(u1 - f, y0, d, u1, y1, d + s), F);
  put(Lc, GI, box(u0 + f, y0, d, u1 - f, y0 + f, d + s), F); put(Lc, GI, box(u0 + f, y1 - f, d, u1 - f, y1, d + s), F);
  const g = 0.2, t = 0.07;                                                                // the green fillet inside the frame
  put(Lc, VA, box(u0 + f + g, y0 + f + g, d + 0.04, u0 + f + g + t, y1 - f - g, d + 0.055), F); put(Lc, VA, box(u1 - f - g - t, y0 + f + g, d + 0.04, u1 - f - g, y1 - f - g, d + 0.055), F);
  put(Lc, VA, box(u0 + f + g + t, y0 + f + g, d + 0.04, u1 - f - g - t, y0 + f + g + t, d + 0.055), F); put(Lc, VA, box(u0 + f + g + t, y1 - f - g - t, d + 0.04, u1 - f - g - t, y1 - f - g, d + 0.055), F);
}

/** A winged putto (h tall) at the local point (x, y, z) of F, turned by yaw, its arms as given; white marble. */
function putto(Lc, F, x, y, z, h, mirror, arms, yaw = 0, mat = WM) {
  const f = human({ pose: 'stand', h, drape: 'nude', n: 4, mirror, arms, lean: mirror ? 8 : -8 });
  const m = new Matrix4().makeRotationY(yaw).setPosition(x, y, z);
  for (const g of [...f.stone, ...f.skin]) put(Lc, mat, g.applyMatrix4(m), F);
  for (const sg of [-1, 1]) { const w = ext([[0, 0], [sg * 0.28, 0.12], [sg * 0.46, 0.34], [sg * 0.4, 0.08], [sg * 0.3, -0.12], [sg * 0.12, -0.14]].map(([p, q]) => [p * h, q * h]), [], -0.025, 0.025); w.translate(0, 0.74 * h, -0.07 * h); put(Lc, mat, w.applyMatrix4(m), F); }
}

/** Innocent X's medallion of a sainted pope (r the gilt ground's radius) at (uc, yc), on the plane d: white profile on gilt, two putti bearing it, the tiara and the keys above, the dove with the olive branch below. */
export function medallion(Lc, F, uc, yc, d = 0, r = 0.85) {
  put(Lc, GB, wallDisc(uc, yc, r, 0, d, d + 0.06), F);
  put(Lc, WM, wallDisc(uc, yc, r + 0.16, r, d, d + 0.16), F);
  put(Lc, WM, T(ball(r * 0.26, r * 0.34, 0.1, 7, 4), uc + r * 0.04, yc + r * 0.2, d + 0.08), F);              // the head in profile
  put(Lc, WM, T(ball(r * 0.1, r * 0.08, 0.06, 5, 3), uc + r * 0.3, yc + r * 0.16, d + 0.1), F);              // the nose and beard
  put(Lc, WM, T(ball(r * 0.52, r * 0.3, 0.08, 7, 4), uc - r * 0.02, yc - r * 0.5, d + 0.07), F);             // the shoulders in the cope
  // the putti, flying at the sides, a hand on the frame
  const h = r * 1.75, gx = r + h * 0.2;
  putto(Lc, F, uc - gx, yc - h * 0.62, d + 0.42, h, false, { r: [[0.16, 0.72, 0.04], [0.21, 0.86, 0.06]], l: [[-0.16, 0.82, 0.0], [-0.13, 0.98, 0.02]] }, 0.35);
  putto(Lc, F, uc + gx, yc - h * 0.62, d + 0.42, h, true, { r: [[0.16, 0.72, 0.04], [0.21, 0.86, 0.06]], l: [[-0.16, 0.82, 0.0], [-0.13, 0.98, 0.02]] }, -0.35);
  // the tiara of three crowns and the crossed keys behind it
  const ty = yc + r + 0.14;
  put(Lc, WM, lathe([[0.001, 0], [r * 0.28, 0], [r * 0.3, r * 0.12], [r * 0.26, r * 0.16], [r * 0.27, r * 0.3], [r * 0.22, r * 0.34], [r * 0.22, r * 0.47], [r * 0.12, r * 0.6], [0.001, r * 0.66]], 10, null, 0, 0, 0).scale(1, 1, 0.55).translate(uc, ty, d + 0.22), F);
  for (const yy of [0.12, 0.3, 0.46]) put(Lc, GB, lathe([[r * 0.3, 0], [r * 0.31, 0], [r * 0.31, r * 0.035], [r * 0.3, r * 0.035]], 10, null, 0, 0, 0).scale(1, 1, 0.58).translate(uc, ty + r * yy - 0.01, d + 0.22), F);
  put(Lc, GB, T(ball(r * 0.06, r * 0.06, r * 0.06, 5, 3), uc, ty + r * 0.7, d + 0.22), F);
  for (const sg of [-1, 1]) {
    const a = [uc - sg * r * 0.75, ty - r * 0.1, d + 0.1], b = [uc + sg * r * 0.55, ty + r * 0.85, d + 0.1];
    put(Lc, GB, rod(a, b, 0.035, 5), F);
    put(Lc, GB, T(ball(r * 0.11, r * 0.11, 0.03, 6, 3), b[0], b[1], b[2]), F);                                 // the bow
    put(Lc, GB, box(a[0] - 0.06, a[1] - 0.02, d + 0.08, a[0] + 0.06, a[1] + 0.12, d + 0.12), F);               // the bit
  }
  // the dove with the olive branch in its beak
  const dy = yc - r - 0.42;
  put(Lc, WM, T(ball(0.22, 0.11, 0.09, 7, 4), uc, dy, d + 0.16), F); put(Lc, WM, T(ball(0.07, 0.07, 0.06, 5, 3), uc + 0.22, dy + 0.07, d + 0.18), F);
  for (const sg of [-1, 1]) put(Lc, WM, ext([[uc - 0.05, dy + 0.02], [uc - 0.3, dy + 0.26 * sg + (sg < 0 ? 0.02 : 0.06)], [uc - 0.08, dy + 0.18 * sg + 0.02], [uc + 0.1, dy + 0.05]], [], d + 0.12, d + 0.16), F);
  put(Lc, WM, ext([[uc - 0.2, dy], [uc - 0.42, dy + 0.08], [uc - 0.42, dy - 0.06]], [], d + 0.13, d + 0.17), F);   // the tail
  put(Lc, VA, rod([uc + 0.28, dy + 0.06, d + 0.2], [uc + 0.52, dy - 0.04, d + 0.2], 0.012, 4), F);
  for (let k = 0; k < 4; k++) put(Lc, VA, T(ball(0.045, 0.02, 0.015, 5, 2), uc + 0.32 + k * 0.06, dy + 0.06 - k * 0.03 + (k % 2 ? 0.03 : -0.03), d + 0.2), F);
}

/** A pier's face of the nave arcade (the chapel's side, between the arch's opening and the chapel's back): w wide, up to y1, revetted, with two medallions. */
export function pierFace(Lc, F, w, y1) {
  put(Lc, VA, box(0.1, 0, 0, w - 0.1, 0.7, 0.09), F);                                       // the green dado
  put(Lc, ND, box(0.1, 0.7, 0, w - 0.1, 0.86, 0.11), F);
  revet(Lc, F, 0.15, w - 0.15, 0.86, y1, 0);
  for (const yc of [y1 * 0.33, y1 * 0.7]) medallion(Lc, F, w / 2, yc, 0.06, Math.min(0.9, w * 0.17));
}

/** A niche between two pilasters (u0..u1 the gap) from y0 to y1, lined with coloured marble: its frame, its arched head, the shell, the sill on consoles. */
export function niche(Lc, F, u0, u1, y0, y1, d = 0) {
  const uc = (u0 + u1) / 2, w = u1 - u0 - 0.36, ys = y1 - w / 2;
  put(Lc, VA, ext(archOutline(uc, y0, w, ys, 'round', 10), [], d, d + 0.03), F);
  put(Lc, AF, ext(archOutline(uc, ys - 0.05, w * 0.82, ys, 'round', 10), [], d + 0.03, d + 0.05), F);    // the shell's ground
  for (let k = 0; k < 7; k++) { const a = Math.PI * (k + 0.5) / 7; put(Lc, GB, rod([uc, ys, d + 0.06], [uc + Math.cos(a) * w * 0.38, ys + Math.sin(a) * w * 0.38, d + 0.06], 0.025, 4), F); }
  put(Lc, GI, ext(headPts(uc, ys, w + 0.36, 'round', 10).concat(headPts(uc, ys, w, 'round', 10).reverse()), [], d, d + 0.16), F);
  for (const sg of [-1, 1]) put(Lc, GI, box(uc + sg * w / 2 - (sg > 0 ? 0 : 0.18), y0, d, uc + sg * w / 2 + (sg > 0 ? 0.18 : 0), ys, d + 0.16), F);
  put(Lc, GI, box(u0 + 0.05, y0 - 0.22, d, u1 - 0.05, y0, d + 0.3), F);
  for (const sg of [-1, 1]) put(Lc, GI, box(uc + sg * w * 0.32 - 0.08, y0 - 0.6, d, uc + sg * w * 0.32 + 0.08, y0 - 0.22, d + 0.22), F);
}

/** A reclining Virtue on the arch's extrados: centred on the archivolt's point at angle a (rad from the horizontal) of the circle (uc, ys, R), lying along the tangent, head toward the crown. */
export function virtue(Lc, F, uc, ys, R, a, h, d = 0.3) {
  const left = Math.cos(a) < 0, px = uc + Math.cos(a) * R, py = ys + Math.sin(a) * R;
  const f = human({ pose: 'recline', h, drape: 'mantle', n: 5, mirror: left });
  // the pose is propped on an elbow: only a slight tilt toward the crown keeps it sitting on the curve; the pelvis on the archivolt
  const pel = [left ? -0.02 * h : 0.02 * h, 0.1 * h], tilt = (a - Math.PI / 2) * 0.45;
  const R2 = new Matrix4().makeRotationZ(tilt).setPosition(px, py, d).multiply(new Matrix4().makeTranslation(-pel[0], -pel[1] + 0.06 * h, 0));
  for (const g of [...f.stone, ...f.skin]) put(Lc, WM, g.applyMatrix4(R2), F);
}

/** The pavement's inlays: flat pieces of coloured marble a centimetre and a half above the floor. */
export class Inlay {
  constructor(Lc, y) { this.Lc = Lc; this.y0 = y + 0.05; this.y1 = y + 0.066; }
  poly(mat, pts, holes = []) { const g = ext(pts.map(([x, z]) => [x, -z]), holes.map((h) => h.map(([x, z]) => [x, -z])), this.y0, this.y1, 1); g.rotateX(-Math.PI / 2); this.Lc.add(mat, g); }
  rect(mat, x0, z0, x1, z1) { this.Lc.add(mat, box(x0, this.y0, z0, x1, this.y1, z1)); }
  ring(mat, cx, cz, r1, r0 = 0, n = 40) { this.poly(mat, circ(cx, cz, r1, n), r0 ? [circ(cx, cz, r0, n).reverse()] : []); }
  /** a rectangle of width w along the line a → b */
  band(mat, a, b, w) { const L = Math.hypot(b[0] - a[0], b[1] - a[1]), nx = -(b[1] - a[1]) / L * w / 2, nz = (b[0] - a[0]) / L * w / 2; this.poly(mat, [[a[0] + nx, a[1] + nz], [b[0] + nx, b[1] + nz], [b[0] - nx, b[1] - nz], [a[0] - nx, a[1] - nz]]); }
  /** the great roundel: a giallo rim, a red ring, the white between, a giallo ring and the green heart */
  roundel(cx, cz, r) { this.ring(GI, cx, cz, r, r * 0.92); this.ring(AF, cx, cz, r * 0.92, r * 0.66); this.ring(GI, cx, cz, r * 0.46, r * 0.38); this.ring(VA, cx, cz, r * 0.38, 0, 28); this.ring(PO, cx, cz, r * 0.14, 0, 16); }
}

/** The nave's pavement from x0 (the crossing) to x1 (the inner front), nb bays, half-width hw about cz; the porphyry disc by the door. */
export function naveFloor(Lc, { x0, x1, cz, y, nb, hw }) {
  const I = new Inlay(Lc, y), bay = (x1 - x0) / nb, e = hw - 1.6;
  for (const s of [-1, 1]) I.rect(VA, x0 + 0.4, cz + s * e - (s > 0 ? 0 : 0.6), x1 - 0.4, cz + s * e + (s > 0 ? 0.6 : 0));
  for (let i = 0; i < nb; i++) {
    const xc = x0 + (i + 0.5) * bay;
    I.roundel(xc, cz, 5.2);
    for (const s of [-1, 1]) { I.ring(PO, xc, cz + s * 8.6, 0.8, 0, 20); I.ring(GI, xc, cz + s * 8.6, 1.05, 0.8, 20); }
    if (i > 0) {
      const xb = x0 + i * bay, q = 1.8;
      I.poly(VA, [[xb - q, cz], [xb, cz - q], [xb + q, cz], [xb, cz + q]]);
      I.poly(AF, [[xb - q * 0.5, cz], [xb, cz - q * 0.5], [xb + q * 0.5, cz], [xb, cz + q * 0.5]].map(([a, b]) => [a, b]));
      for (const s of [-1, 1]) I.rect(GI, xb - 0.25, s < 0 ? cz - e : cz + q, xb + 0.25, s < 0 ? cz - q : cz + e);
    }
  }
  // the great disc of red porphyry from the old basilica, inside the middle door (Charlemagne knelt on it, 800)
  I.ring(PO, x1 - 2.4, cz, 1.3, 0, 40); I.ring(GI, x1 - 2.4, cz, 1.5, 1.3, 40);
}
/** The crossing's pavement round the baldacchino: rings, and sixteen rays between them. */
export function crossingFloor(Lc, { cx, cz, y }) {
  const I = new Inlay(Lc, y);
  I.ring(GI, cx, cz, 7.6, 7.0, 64); I.ring(AF, cx, cz, 11.0, 9.6, 64); I.ring(GI, cx, cz, 11.4, 11.0, 64); I.ring(VA, cx, cz, 17.6, 17.0, 72);
  for (let k = 0; k < 16; k++) { const a = (k + 0.5) / 16 * Math.PI * 2, c = Math.cos(a), s = Math.sin(a); I.band(k % 2 ? GI : AF, [cx + c * 11.5, cz + s * 11.5], [cx + c * 16.9, cz + s * 16.9], 0.5); }
}
/** An arm's pavement (a transept or the west arm): green borders and a roundel in the middle. rect [x0, z0, x1, z1]. */
export function armFloor(Lc, { rect, y }) {
  const I = new Inlay(Lc, y), [x0, z0, x1, z1] = rect, w = x1 - x0, d = z1 - z0, r = Math.min(w, d) / 2 - 1.6;
  I.roundel((x0 + x1) / 2, (z0 + z1) / 2, r);
  if (w > d) for (const z of [z0 + 1.0, z1 - 1.6]) I.rect(VA, x0 + 0.3, z, x1 - 0.3, z + 0.6);
  else for (const x of [x0 + 1.0, x1 - 1.6]) I.rect(VA, x, z0 + 0.3, x + 0.6, z1 - 0.3);
}

/** The bronze St Peter (13th c.) blessing, the keys at his breast, on his marble chair and a pedestal of coloured marble: at the local point (u, d) of F, facing +d. */
export function bronzePeter(Lc, F, u, d) {
  const ph = 1.75;
  put(Lc, M, box(u - 1.1, 0, d - 0.85, u + 1.1, 0.3, d + 0.85), F);
  put(Lc, AF, box(u - 0.95, 0.3, d - 0.7, u + 0.95, ph - 0.25, d + 0.7), F);
  for (const s of [-1, 1]) put(Lc, GI, box(u - 0.6, 0.55, d + s * 0.7 - (s > 0 ? 0 : 0.03), u + 0.6, ph - 0.5, d + s * 0.7 + (s > 0 ? 0.03 : 0)), F);
  put(Lc, GI, box(u - 0.98 - 0.03, 0.55, d - 0.4, u - 0.95, ph - 0.5, d + 0.4), F); put(Lc, GI, box(u + 0.95, 0.55, d - 0.4, u + 0.98 + 0.03, ph - 0.5, d + 0.4), F);
  put(Lc, M, box(u - 1.05, ph - 0.25, d - 0.8, u + 1.05, ph, d + 0.8), F);
  // the chair: the seat, the high back with its gable, the arms
  const H = 1.9, sy = ph;
  put(Lc, WM, box(u - 0.48, sy, d - 0.45, u + 0.48, sy + 0.5, d + 0.32), F);
  put(Lc, WM, box(u - 0.52, sy, d - 0.62, u + 0.52, sy + 1.95, d - 0.45), F);
  put(Lc, WM, ext([[u - 0.56, sy + 1.95], [u + 0.56, sy + 1.95], [u, sy + 2.25]], [], d - 0.62, d - 0.45), F);
  for (const s of [-1, 1]) put(Lc, WM, box(u + s * 0.48 - 0.06, sy + 0.5, d - 0.45, u + s * 0.48 + 0.06, sy + 0.82, d + 0.3), F);
  const f = human({ pose: 'seat', noSeat: true, h: H, drape: 'mantle', n: 6, arms: { r: [[0.17, 0.5, 0.1], [0.15, 0.68, 0.14]], l: [[-0.15, 0.43, 0.07], [-0.04, 0.47, 0.13]] } });
  for (const g of [...f.stone, ...f.skin]) put(Lc, BR, g.translate(u, sy + 0.5 - 0.3 * H + 0.02, d - 0.1), F);
  for (const dx of [0, 0.05]) put(Lc, BR, rod([u - 0.06 + dx, sy + 0.5 + 0.47 * H - 0.3 * H - 0.25, d + 0.12], [u - 0.02 + dx, sy + 0.5 + 0.47 * H - 0.3 * H + 0.22, d + 0.16], 0.025, 4), F);   // the keys
}

/** A tomb's niche: the arched recess lined with coloured marble in a frame, w wide, springing at ys. */
function tombNiche(Lc, F, uc, w, ys) {
  put(Lc, AF, ext(archOutline(uc, 0, w, ys, 'round', 14), [], 0, 0.04), F);
  put(Lc, GI, ext(headPts(uc, ys, w + 0.6, 'round', 14).concat(headPts(uc, ys, w, 'round', 14).reverse()), [], 0, 0.22), F);
  for (const sg of [-1, 1]) put(Lc, GI, box(uc + sg * w / 2 - (sg > 0 ? 0 : 0.3), 0, 0, uc + sg * w / 2 + (sg > 0 ? 0.3 : 0), ys, 0.22), F);
  put(Lc, GB, T(ball(0.5, 0.6, 0.15, 8, 4), uc, ys + w / 2 + 0.3, 0.25), F);                       // the cartouche at the crown
}
/** A seated bronze pope blessing, with his tiara: at the local point (u, y, d) of F. */
function seatedPope(Lc, F, u, y, d, H, mat) {
  const f = human({ pose: 'seat', h: H, drape: 'mantle', n: 6, arms: { r: [[0.18, 0.5, 0.12], [0.2, 0.72, 0.22]], l: [[-0.16, 0.44, 0.05], [-0.12, 0.34, 0.18]] } });
  for (const g of [...f.stone, ...f.skin]) put(Lc, mat, g.translate(u, y, d), F);
  const hy = y + 0.685 * H + 0.06 * H;
  put(Lc, mat, lathe([[0.001, 0], [0.1 * H * 0.6, 0], [0.11 * H * 0.6, 0.12 * H], [0.07 * H * 0.6, 0.2 * H], [0.001, 0.22 * H]], 10, null, u, hy, d - 0.03 * H), F);
  for (const k of [0.04, 0.09, 0.14]) put(Lc, GB, lathe([[0.105 * H * 0.6, 0], [0.11 * H * 0.6, 0], [0.11 * H * 0.6, 0.015 * H], [0.105 * H * 0.6, 0.015 * H]], 10, null, u, hy + k * H, d - 0.03 * H), F);
  // the cope's broad hem falling over the throne
  put(Lc, mat, ext([[u - 0.2 * H, y + 0.1 * H], [u + 0.2 * H, y + 0.1 * H], [u + 0.15 * H, y + 0.6 * H], [u - 0.15 * H, y + 0.6 * H]], [], d - 0.12 * H, d + 0.0), F);
}
/** A standing allegory in white marble (h tall) at (u, y, d), with an attribute: 'charity' (a child at her side, another at her breast), 'justice' (the sword and the scales), 'prudence' (the mirror). */
function allegory(Lc, F, u, y, d, h, kind, mirror, pose = 'ease') {
  const f = human({ pose, h, drape: 'peplos', n: 6, mirror, arms: kind === 'justice' ? { r: [[0.16, 0.66, 0.06], [0.2, 0.8, 0.2]], l: [[-0.15, 0.64, 0.04], [-0.18, 0.5, 0.1]] } : undefined });
  for (const g of [...f.stone, ...f.skin]) put(Lc, WM, g.translate(u, y, d), F);
  const sg = mirror ? -1 : 1;
  if (kind === 'charity') {
    const c = human({ pose: 'stand', h: h * 0.38, drape: 'nude', n: 4, mirror: !mirror, arms: { r: [[0.15, 0.75, 0.05], [0.12, 0.95, 0.1]] } });
    for (const g of [...c.stone, ...c.skin]) put(Lc, WM, g.translate(u + sg * h * 0.22, y, d + h * 0.08), F);
    put(Lc, WM, T(ball(h * 0.06, h * 0.09, h * 0.06, 6, 4), u - sg * h * 0.04, y + h * 0.72, d + h * 0.1), F);
  } else if (kind === 'justice') {
    const hand = [u + sg * 0.2 * h, y + 0.8 * h, d + 0.2 * h];
    put(Lc, GB, rod(hand, [hand[0], hand[1] - 0.12 * h, hand[2]], 0.012, 4), F);
    put(Lc, GB, rod([hand[0] - 0.08 * h, hand[1] - 0.12 * h, hand[2]], [hand[0] + 0.08 * h, hand[1] - 0.12 * h, hand[2]], 0.012, 4), F);
    for (const s of [-1, 1]) put(Lc, GB, lathe([[0.001, 0], [0.035 * h, 0.01], [0.04 * h, 0.03]], 8, null, hand[0] + s * 0.08 * h, hand[1] - 0.22 * h, hand[2]), F);
    put(Lc, WM, rod([u - sg * 0.18 * h, y + 0.5 * h, d + 0.1 * h], [u - sg * 0.24 * h, y + 0.95 * h, d + 0.06 * h], 0.02 * h, 4), F);   // the sword
  } else if (kind === 'prudence') {
    put(Lc, GB, wallDisc(0, 0, 0.06 * h, 0, -0.005, 0.005, 12).translate(u + sg * 0.12 * h, y + 0.35 * h, d + 0.22 * h), F);
  }
}

/** The tomb of Urban VIII (Bernini, 1628–47) in its niche: the black sarcophagus with gilt bronze, Death writing the name, the bronze pope on a tall white pedestal, Charity and Justice. Centred at uc on F's wall, facing +d. Returns the footprint [u0, d0, u1, d1]. */
export function tombUrban(Lc, F, uc) {
  tombNiche(Lc, F, uc, 4.0, 10.4);
  put(Lc, M, box(uc - 2.3, 0, 0, uc + 2.3, 0.45, 2.6), F);
  put(Lc, WM, box(uc - 0.75, 0.45, 0.05, uc + 0.75, 5.0, 1.15), F);                                // the pedestal
  put(Lc, WM, box(uc - 0.85, 5.0, 0.05, uc + 0.85, 5.25, 1.25), F); put(Lc, WM, box(uc - 0.85, 0.45, 0.05, uc + 0.85, 0.75, 1.25), F);
  put(Lc, GB, T(ball(0.22, 0.18, 0.06, 7, 3), uc - 0.3, 3.2, 1.17), F); put(Lc, GB, T(ball(0.22, 0.18, 0.06, 7, 3), uc + 0.3, 2.7, 1.17), F); put(Lc, GB, T(ball(0.22, 0.18, 0.06, 7, 3), uc - 0.15, 2.2, 1.17), F);   // the Barberini bees
  // the sarcophagus of black marble, bellied, on lion's feet, its lid, the gilt shells
  put(Lc, ND, ext([[uc - 1.35, 0.85], [uc + 1.35, 0.85], [uc + 1.55, 1.3], [uc + 1.45, 1.75], [uc - 1.45, 1.75], [uc - 1.55, 1.3]], [], 1.15, 2.25), F);
  put(Lc, ND, box(uc - 1.6, 1.75, 1.1, uc + 1.6, 1.95, 2.3), F);
  for (const s of [-1, 1]) put(Lc, GB, T(ball(0.16, 0.2, 0.16, 6, 4), uc + s * 1.2, 0.65, 2.0), F);
  put(Lc, GB, T(ball(0.25, 0.2, 0.05, 8, 3), uc, 1.3, 2.26), F);
  // Death, half risen from the sarcophagus, writing on the gilt scroll
  const dth = human({ pose: 'stand', h: 1.5, drape: 'nude', upper: true, n: 4, arms: { r: [[0.14, 0.7, 0.12], [0.08, 0.66, 0.26]] } });
  for (const g of [...dth.stone, ...dth.skin]) put(Lc, BR, g.translate(uc, 1.95 - 0.5 * 1.5 + 0.02, 1.6), F);
  put(Lc, GB, box(uc - 0.35, 1.95, 1.95, uc + 0.15, 2.65, 1.98), F);
  // the pope blessing, bronze partly gilt; Charity at the left, Justice at the right
  seatedPope(Lc, F, uc, 5.25, 0.6, 3.5, BR);
  allegory(Lc, F, uc - 1.7, 0.45, 1.8, 3.0, 'charity', false);
  allegory(Lc, F, uc + 1.7, 0.45, 1.8, 3.0, 'justice', true);
  return [uc - 2.3, 0, uc + 2.3, 2.6];
}
/** The tomb of Paul III (Guglielmo della Porta) in its niche: the base of africano, the mask of giallo and black, Justice and Prudence reclining, the bronze pope seated above. Returns the footprint. */
export function tombPaul(Lc, F, uc) {
  tombNiche(Lc, F, uc, 4.0, 10.4);
  put(Lc, M, box(uc - 2.3, 0, 0, uc + 2.3, 0.4, 2.5), F);
  put(Lc, AF, box(uc - 2.0, 0.4, 0.1, uc + 2.0, 1.7, 2.1), F);                                    // the base of africano
  put(Lc, M, box(uc - 2.1, 1.7, 0.05, uc + 2.1, 1.9, 2.2), F);
  put(Lc, GI, box(uc - 0.8, 1.9, 0.1, uc + 0.8, 4.5, 1.25), F);                                   // the pedestal with the mask
  put(Lc, ND, ext(circ(uc, 3.2, 0.42, 16), [], 1.25, 1.3), F);
  put(Lc, GI, T(ball(0.26, 0.32, 0.1, 7, 4), uc, 3.2, 1.32), F);
  put(Lc, M, box(uc - 0.9, 4.5, 0.05, uc + 0.9, 4.7, 1.35), F);
  // Justice (left) and Prudence (right) reclining on the base, their heads toward the middle
  for (const [s, kind] of [[-1, 'justice'], [1, 'prudence']]) {
    const f = human({ pose: 'recline', h: 2.3, drape: 'mantle', n: 6, mirror: s < 0 });
    for (const g of [...f.stone, ...f.skin]) put(Lc, WM, g.translate(uc + s * 1.25, 1.9, 1.75), F);
    if (kind === 'prudence') put(Lc, GB, wallDisc(0, 0, 0.12, 0, -0.01, 0.01, 12).translate(uc + 0.55, 2.55, 1.9), F);
  }
  seatedPope(Lc, F, uc, 4.7, 0.6, 3.4, BR);
  return [uc - 2.3, 0, uc + 2.3, 2.5];
}
