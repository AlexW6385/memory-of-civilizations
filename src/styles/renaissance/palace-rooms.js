// The rooms of the two great palaces that can be entered (docs/settlements/florence.md §4): the Palazzo
// Medici's ground-floor sala on the west of the court and the writing room (studio) on the north, both off the
// court's portico; the Palazzo della Signoria's passage from the great door and Michelozzo's court of 1453
// with a stone basin in the middle. World coordinates, no frame.

import { box, lathe } from '../../core/geom.js';

const PF = 'limestone_yellow', SER = 'pietra_serena', W = 'wood_dark', TM = 'timber', IR = 'iron', PL = 'plaster_white';
const CL = ['cloth_red', 'cloth_blue', 'cloth_green', 'cloth_ochre', 'cloth_indigo', 'cloth_brown', 'cloth_white'];

function kit(bag, col, y) {
  const B = (mat, x0, z0, x1, z1, ya, yb, c = false) => { bag.add(mat, box(x0, y + ya, z0, x1, y + yb, z1)); if (c) col.rect([x0, z0, x1, z1], y + ya, y + yb); };
  const pot = (mat, x, z, r, ht, ya = 0) => bag.add(mat, lathe([[r * 0.6, 0], [r, ht * 0.4], [r * 0.7, ht * 0.85], [r * 0.4, ht], [0.001, ht]], 8, null, x, y + ya, z));
  const lamp = (x, z, top) => { bag.add('lamp_glass', lathe([[0.001, 0], [0.16, 0.08], [0.2, 0.3], [0.001, 0.42]], 8, null, x, y + top - 1.3, z)); B(IR, x - 0.01, z - 0.01, x + 0.01, z + 0.01, top - 0.9, top); };
  const table = (x0, z0, x1, z1, ht, mat = W) => { B(mat, x0, z0, x1, z1, ht - 0.08, ht, true); for (const [a, b] of [[x0 + 0.1, z0 + 0.1], [x1 - 0.18, z0 + 0.1], [x0 + 0.1, z1 - 0.18], [x1 - 0.18, z1 - 0.18]]) B(mat, a, b, a + 0.08, b + 0.08, 0, ht - 0.08); };
  return { B, pot, lamp, table };
}

/** The Medici's two ground-floor rooms: returns { holes (rects to leave out of the mass), done } and builds them. */
export function mediciRooms(bag, col, { rect, K, yP, y }) {
  const [x0, z0, x1, z1] = rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, { B, pot, lamp, table } = kit(bag, col, y);
  const hall = [x0 + 1.2, z0 + 9.8, K[0] - 1.2, z1 - 9.8], studio = [cx - 9, z0 + 1.2, cx + 9, K[1] - 1.2];
  const doorW = [hall[2] - 0.01, cz - 1.1, K[0] + 0.05, cz + 1.1], doorS = [cx - 1.1, studio[3] - 0.01, cx + 1.1, K[1] + 0.05];
  // floors, ceilings (plastered, on beams), lintels over the doors
  for (const r of [hall, studio, doorW, doorS]) { bag.add('cotto_floor', box(r[0], y - 0.3, r[1], r[2], y + 0.04, r[3])); col.floor(r, y + 0.04); }
  for (const r of [hall, studio]) { B(PL, r[0], r[1], r[2], r[3], yP - 0.08, yP, false); for (let k = r[0] + 1; k < r[2]; k += 1.8) B(W, k, r[1], k + 0.28, r[3], yP - 0.45, yP - 0.08); }
  for (const r of [doorW, doorS]) { B(PF, r[0], r[1], r[2], r[3], 4.0, yP); col.rect(r, y + 4.0, y + yP); }
  // the sala: a long table, chairs, a hearth, cassoni, a credenza with plate, hangings
  const hx = (hall[0] + hall[2]) / 2, hz = (hall[1] + hall[3]) / 2;
  table(hx - 1.0, hz - 3.5, hx + 1.0, hz + 3.5, 0.82); B('cloth_red', hx - 0.95, hz - 3.3, hx + 0.95, hz + 3.3, 0.82, 0.85);
  for (let k = 0; k < 4; k++) for (const s of [-1, 1]) { const zz = hz - 2.8 + k * 1.9; B(W, hx + s * 1.5 - 0.25, zz - 0.25, hx + s * 1.5 + 0.25, zz + 0.25, 0.45, 0.5, true); B(W, hx + s * 1.5 + s * 0.2, zz - 0.25, hx + s * 1.5 + s * 0.27, zz + 0.25, 0.5, 1.2); for (const [a, b] of [[-1, -1], [1, 1]]) B(W, hx + s * 1.5 + a * 0.2 - 0.025, zz + b * 0.2 - 0.025, hx + s * 1.5 + a * 0.2 + 0.025, zz + b * 0.2 + 0.025, 0, 0.45); }
  for (let k = 0; k < 5; k++) pot(k % 2 ? 'gilt_bronze' : 'glaze_white', hx + (k - 2) * 0.28, hz + (k % 2 - 0.5) * 0.5, 0.08, 0.22, 0.85);
  B('brick', hall[0] + 0.1, hz - 1.6, hall[0] + 1.3, hz + 1.6, 0, 3.3, true); B('brick', hall[0] + 0.1, hz - 1.2, hall[0] + 1.35, hz + 1.2, 3.3, 4.2); B(PF, hall[0] + 0.1, hz - 1.9, hall[0] + 1.5, hz + 1.9, 3.15, 3.3); B('opening', hall[0] + 1.3, hz - 1.0, hall[0] + 1.32, hz + 1.0, 0.3, 2.3);
  for (let k = 0; k < 3; k++) { const zz = hall[1] + 2.5 + k * (hall[3] - hall[1] - 5) / 2; B('wood_painted', hall[2] - 0.9, zz - 0.9, hall[2] - 0.1, zz + 0.9, 0, 0.7, true); B('gilt_bronze', hall[2] - 0.92, zz - 0.8, hall[2] - 0.89, zz + 0.8, 0.3, 0.5); }
  B(W, hall[0] + 0.1, hall[1] + 0.3, hall[0] + 0.7, hall[1] + 3.0, 0, 1.3, true); for (let k = 0; k < 5; k++) pot(k % 2 ? 'gilt_bronze' : 'glaze_white', hall[0] + 0.4, hall[1] + 0.7 + k * 0.5, 0.09, 0.2, 1.3);
  for (let k = 0; k < 4; k++) { const zz = hall[1] + 2.0 + k * (hall[3] - hall[1] - 4) / 3; B(CL[k % CL.length], hall[2] - 0.1, zz - 0.9, hall[2] - 0.05, zz + 0.9, 2.2, 5.6); B('gilt_bronze', hall[2] - 0.1, zz - 0.95, hall[2] - 0.05, zz + 0.95, 5.6, 5.7); }
  lamp(hx, hz - 2.5, yP); lamp(hx, hz + 2.5, yP);
  // the studio: lecterns and desks, book chests, a globe, an armillary sphere on a stand
  const sx = (studio[0] + studio[2]) / 2, sz = (studio[1] + studio[3]) / 2;
  for (let k = 0; k < 4; k++) { const xx = studio[0] + 2.0 + k * 4.2; B(W, xx - 0.6, studio[1] + 0.2, xx + 0.6, studio[1] + 0.8, 0, 0.95, true); B('wood_dark', xx - 0.6, studio[1] + 0.2, xx + 0.6, studio[1] + 0.7, 0.95, 1.05); const th = box(xx - 0.5, 0, 0, xx + 0.5, 0.05, 0.6); th.rotateX(-0.4); th.translate(0, y + 1.1, studio[1] + 0.2); bag.add(W, th); B(CL[(k + 2) % 7], xx - 0.3, studio[1] + 0.25, xx + 0.3, studio[1] + 0.5, 1.05, 1.12); }
  for (const [a, b] of [[studio[0] + 0.1, studio[3] - 0.5], [studio[2] - 3.1, studio[3] - 0.5]]) { B(W, a, b - 0.4, a + 3.0, b + 0.4, 0, 2.4, true); for (let r = 0; r < 5; r++) { B(TM, a, b - 0.4, a + 3.0, b + 0.4, 0.4 + r * 0.45, 0.44 + r * 0.45); for (let u = a + 0.1; u < a + 2.9; u += 0.18) B(CL[Math.floor(Math.abs(u * 7 + r)) % 7], u, b - 0.3, u + 0.14, b + 0.2, 0.44 + r * 0.45, 0.82 + r * 0.45); } }
  table(sx - 1.5, sz - 0.5, sx + 1.5, sz + 0.5, 0.8); B('cloth_green', sx - 1.4, sz - 0.45, sx + 1.4, sz + 0.45, 0.8, 0.83);
  bag.add('gilt_bronze', lathe([[0.001, 0], [0.2, 0.2], [0.22, 0.36], [0.2, 0.52], [0.001, 0.72]], 10, null, sx, y + 0.83, sz)); B(IR, sx - 0.01, sz - 0.01, sx + 0.01, sz + 0.01, 0.83, 0.88);
  for (let k = 0; k < 8; k++) B(CL[k % 7], sx - 1.2 + k * 0.3, sz - 0.4, sx - 0.95 + k * 0.3, sz - 0.2, 0.83, 0.92 + (k % 3) * 0.04);
  B(W, sx - 0.3, studio[3] - 1.0, sx + 0.3, studio[3] - 0.4, 0, 0.5, true);
  lamp(sx - 4, sz, yP); lamp(sx + 4, sz, yP);
  return [hall, studio, doorW, doorS];
}

/** The Signoria's court and the passage from its door; returns the rects left out of the ground storey and of the whole block. */
export function signoriaCourt(bag, col, { rect, y, door, hg }) {
  const [x0, z0, x1, z1] = rect, { B, pot, lamp } = kit(bag, col, y);
  const court = [x0 + 12, z0 + 8, x1 - 12, z1 - 8], cx = (court[0] + court[2]) / 2, cz = (court[1] + court[3]) / 2, pass = [x0, door - 1.5, court[0] + 0.05, door + 1.5];
  for (const r of [court, pass]) { bag.add('flagstone', box(r[0], y - 0.3, r[1], r[2], y + 0.04, r[3])); col.floor(r, y + 0.04); }
  B(PF, pass[0], pass[1], pass[2], pass[3], 6.2, hg, false); col.rect(pass, y + 6.2, y + hg);
  for (let k = pass[0] + 1; k < pass[2]; k += 1.6) B(W, k, pass[1], k + 0.3, pass[3], 5.7, 6.2);
  lamp((pass[0] + pass[2]) / 2, door, 6.2);
  // the arcade round the court: slender columns of pietra serena with a plastered ceiling and an architrave
  const a = 2.6, ring = [court[0] + a, court[1] + a, court[2] - a, court[3] - a], yc = 5.2;
  for (const r of [[court[0], court[1], court[2], ring[1]], [court[0], ring[3], court[2], court[3]], [court[0], ring[1], ring[0], ring[3]], [ring[2], ring[1], court[2], ring[3]]]) { B(PL, r[0], r[1], r[2], r[3], yc, yc + 0.2); B(SER, r[0], r[1], r[2], r[3], yc - 0.5, yc); }
  const cols = [];
  for (let u = ring[0]; u <= ring[2] + 0.01; u += (ring[2] - ring[0]) / 3) for (const zz of [ring[1], ring[3]]) cols.push([u, zz]);
  for (let v = ring[1] + (ring[3] - ring[1]) / 3; v < ring[3] - 0.1; v += (ring[3] - ring[1]) / 3) for (const xx of [ring[0], ring[2]]) cols.push([xx, v]);
  for (const [px, pz] of cols) { bag.add(SER, lathe([[0.3, 0], [0.3, 0.3], [0.2, 0.4], [0.2, yc - 0.65], [0.3, yc - 0.55], [0.3, yc - 0.5]], 10, null, px, y, pz)); col.circle?.(px, pz, 0.3, y, y + yc); }
  // the walls of the court: a string course and the family arms' roundels
  B(PF, court[0], court[1], court[2], court[1] + 0.2, 8.3, 8.6); 
  // a stone basin with a well-head in the middle (Verrocchio's putto with the dolphin came to the court only later)
  bag.add('marble_smooth', lathe([[0.001, 0], [1.4, 0.0], [1.5, 0.3], [1.35, 0.55], [1.2, 0.55], [1.25, 0.32], [0.001, 0.3]], 14, null, cx, y + 0.04, cz)); col.circle?.(cx, cz, 1.5, y, y + 0.6);
  bag.add('marble_smooth', lathe([[0.001, 0], [0.45, 0.0], [0.3, 0.3], [0.22, 0.9], [0.4, 1.1], [0.001, 1.15]], 10, null, cx, y + 0.3, cz));
  lamp(cx - 3.5, ring[1] + 0.5, yc + 0.2);
  return { court, pass };
}
