// Vernacular building: the ordinary houses around the monuments, made from type, not from a
// single example. Egyptian (Graeco-Roman) town houses: mud brick on a footing, plastered or
// bare, flat roofs of palm trunks and matting behind a parapet, small windows high up, a door
// with a timber lintel; tower houses of two or three storeys and courtyard houses.

import { registerStyle } from '../../core/build.js';
import { box, rod, fromTriangles, lathe } from '../../core/geom.js';
import { houseMamluk } from './house-mamluk.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/**
 * house_egypt: { rect [x0, z0, x1, z1], y (ground), storeys, court (rect inside, open), front ('n'|'s'|'e'|'w'),
 *               plaster (0…1), seed }
 */
function houseEgypt(el, { bag, col }) {
  const rand = rng(el.seed || 1);
  const [x0, z0, x1, z1] = el.rect, y = el.y;
  const storey = 3.1, H = el.storeys * storey + 0.2, par = 0.85, wall = 0.6;
  const mat = el.plaster > 0.5 ? 'plaster' : 'mudbrick';
  // footing, a little wider, of mud brick on the uneven ground
  bag.add('mudbrick', box(x0 - 0.12, y - 1.2, z0 - 0.12, x1 + 0.12, y + 0.35, z1 + 0.12));
  if (el.court) {
    // a court open to the sky: the house is a ring of rooms around it
    const [cx0, cz0, cx1, cz1] = el.court;
    const parts = [[x0, z0, x1, cz0], [x0, cz1, x1, z1], [x0, cz0, cx0, cz1], [cx1, cz0, x1, cz1]];
    for (const r of parts) if (r[2] - r[0] > 0.3 && r[3] - r[1] > 0.3) { bag.add(mat, box(r[0], y + 0.35, r[1], r[2], y + H, r[3])); col.rect(r, y - 1, y + H); }
    // the court's floor and a doorway from the street
    bag.add('mudbrick', box(cx0, y + 0.05, cz0, cx1, y + 0.12, cz1));
  } else {
    bag.add(mat, box(x0, y + 0.35, z0, x1, y + H, z1));
    col.rect([x0, z0, x1, z1], y - 1, y + H);
  }
  // parapet round the roof, with gaps where water runs off
  const t = 0.3;
  for (const r of [[x0, z0, x1, z0 + t], [x0, z1 - t, x1, z1], [x0, z0 + t, x0 + t, z1 - t], [x1 - t, z0 + t, x1, z1 - t]]) bag.add(mat, box(r[0], y + H, r[1], r[2], y + H + par, r[3]));
  // the ends of the palm-trunk roof beams showing on the façades under each roof
  const along = (x1 - x0) > (z1 - z0);
  for (let s = 1; s <= el.storeys; s++) {
    const yy = y + s * storey - 0.15;
    const n = Math.floor((along ? (z1 - z0) : (x1 - x0)) / 0.9);
    for (let k = 1; k < n; k++) {
      if (along) { const zz = z0 + k * 0.9; bag.add('palm_trunk', rod([x0 - 0.18, yy, zz], [x0 + 0.05, yy, zz], 0.1, 6)); bag.add('palm_trunk', rod([x1 - 0.05, yy, zz], [x1 + 0.18, yy, zz], 0.1, 6)); }
      else { const xx = x0 + k * 0.9; bag.add('palm_trunk', rod([xx, yy, z0 - 0.18], [xx, yy, z0 + 0.05], 0.1, 6)); bag.add('palm_trunk', rod([xx, yy, z1 - 0.05], [xx, yy, z1 + 0.18], 0.1, 6)); }
    }
  }
  // door with its timber lintel, and small windows high in each storey, on the street front
  const face = el.front || 's';
  const fx = face === 'e' ? x1 : face === 'w' ? x0 : null, fz = face === 's' ? z1 : face === 'n' ? z0 : null;
  // openings are dark panels set just proud of the façade (the walls are solid masses)
  const opening = (u, v0, w, h) => {
    const t2 = 0.03;
    if (face === 's') bag.add('opening', box(x0 + u, y + v0, z1, x0 + u + w, y + v0 + h, z1 + t2));
    else if (face === 'n') bag.add('opening', box(x0 + u, y + v0, z0 - t2, x0 + u + w, y + v0 + h, z0));
    else if (face === 'e') bag.add('opening', box(x1, y + v0, z0 + u, x1 + t2, y + v0 + h, z0 + u + w));
    else bag.add('opening', box(x0 - t2, y + v0, z0 + u, x0, y + v0 + h, z0 + u + w));
  };
  const L = fz !== null ? x1 - x0 : z1 - z0;
  const du = 0.6 + rand() * Math.max(0.1, L - 2.2);
  opening(du, 0.35, 1.0, 2.0);
  if (fz !== null) bag.add('cedar', box(x0 + du - 0.2, y + 2.35, fz - 0.1, x0 + du + 1.2, y + 2.55, fz + 0.12));
  else bag.add('cedar', box(fx - 0.1, y + 2.35, z0 + du - 0.2, fx + 0.12, y + 2.55, z0 + du + 1.2));
  for (let s = 0; s < el.storeys; s++) {
    const nw = Math.max(1, Math.floor(L / 3.2));
    for (let k = 0; k < nw; k++) {
      if (s === 0 && rand() < 0.6) continue;
      const u = (k + 0.5) * L / nw - 0.25;
      opening(Math.max(0.3, Math.min(L - 0.8, u)), s * storey + 2.0, 0.5, 0.45);
    }
  }
  // a light shelter of palm sticks on some roofs
  if (rand() < 0.4) {
    const sx = x0 + 0.5, sz = z0 + 0.5, ex = Math.min(x1 - 0.5, sx + 3), ez = Math.min(z1 - 0.5, sz + 2.6);
    for (const [px, pz] of [[sx, sz], [ex, sz], [sx, ez], [ex, ez]]) bag.add('palm_trunk', rod([px, y + H, pz], [px, y + H + 2.0, pz], 0.06, 5));
    bag.add('reed_mat', box(sx - 0.1, y + H + 2.0, sz - 0.1, ex + 0.1, y + H + 2.1, ez + 0.1));
  }
}

/**
 * house_tiled: a Byzantine town house (Constantinople, 6th century) — rubble and brick below,
 * plastered above, an upper storey jettied over the street on timber brackets (the maenianum),
 * a hipped roof of curved tiles. { rect, y (floor), foot (lowest ground), storeys, front, seed }
 */
function houseTiled(el, { bag, col }) {
  const rand = rng(el.seed || 1);
  const [x0, z0, x1, z1] = el.rect, y = el.y, st = 3.2, H = el.storeys * st;
  bag.add('brick', box(x0 - 0.1, el.foot - 0.6, z0 - 0.1, x1 + 0.1, y + 0.4, z1 + 0.1));
  bag.add('brick', box(x0, y + 0.4, z0, x1, y + st, z1));
  bag.add(el.plaster ? 'stucco_warm' : 'brick', box(x0, y + st, z0, x1, y + H, z1));
  col.rect([x0, z0, x1, z1], el.foot - 0.6, y + H);
  // the jetty: the upper storeys project over the street on the front
  const f = el.front || 's', J = el.storeys > 1 && rand() < 0.65 ? 0.9 : 0;
  let R = [x0, z0, x1, z1];
  if (J) {
    const jr = f === 's' ? [x0, z1, x1, z1 + J] : f === 'n' ? [x0, z0 - J, x1, z0] : f === 'e' ? [x1, z0, x1 + J, z1] : [x0 - J, z0, x0, z1];
    bag.add('stucco_warm', box(jr[0], y + st + 0.25, jr[1], jr[2], y + H, jr[3]));
    bag.add('timber', box(jr[0], y + st, jr[1], jr[2], y + st + 0.25, jr[3]));
    const along = f === 's' || f === 'n';
    const L = along ? x1 - x0 : z1 - z0;
    for (let k = 0; k <= Math.floor(L / 1.6); k++) {
      const u = Math.min(L - 0.15, 0.15 + k * 1.6);
      const a = along ? [x0 + u, y + st - 0.6, f === 's' ? z1 : z0] : [f === 'e' ? x1 : x0, y + st - 0.6, z0 + u];
      const b = along ? [x0 + u, y + st, f === 's' ? z1 + J : z0 - J] : [f === 'e' ? x1 + J : x0 - J, y + st, z0 + u];
      bag.add('timber', rod(a, b, 0.08, 4));
    }
    R = [Math.min(x0, jr[0]), Math.min(z0, jr[1]), Math.max(x1, jr[2]), Math.max(z1, jr[3])];
  }
  // openings: a door below, small windows with timber lintels above, on the front and sides
  const opening = (side, u, v0, w, h) => {
    const t = 0.03;
    const len = side === 's' || side === 'n' ? R[2] - R[0] : R[3] - R[1];
    if (u + w > len - 0.3) return;
    if (side === 's') bag.add('opening', box(R[0] + u, y + v0, R[3], R[0] + u + w, y + v0 + h, R[3] + t));
    if (side === 'n') bag.add('opening', box(R[0] + u, y + v0, R[1] - t, R[0] + u + w, y + v0 + h, R[1]));
    if (side === 'e') bag.add('opening', box(R[2], y + v0, R[1] + u, R[2] + t, y + v0 + h, R[1] + u + w));
    if (side === 'w') bag.add('opening', box(R[0] - t, y + v0, R[1] + u, R[0], y + v0 + h, R[1] + u + w));
  };
  const Lf = f === 's' || f === 'n' ? R[2] - R[0] : R[3] - R[1];
  // the door is in the ground storey's wall, under the jetty
  const du = 0.8 + rand() * Math.max(0.2, Lf - 2.6);
  if (f === 's') bag.add('opening', box(x0 + du, y + 0.4, z1, x0 + du + 1.1, y + 2.6, z1 + 0.03));
  if (f === 'n') bag.add('opening', box(x0 + du, y + 0.4, z0 - 0.03, x0 + du + 1.1, y + 2.6, z0));
  if (f === 'e') bag.add('opening', box(x1, y + 0.4, z0 + du, x1 + 0.03, y + 2.6, z0 + du + 1.1));
  if (f === 'w') bag.add('opening', box(x0 - 0.03, y + 0.4, z0 + du, x0, y + 2.6, z0 + du + 1.1));
  for (let s = 1; s < el.storeys; s++) {
    const n = Math.max(1, Math.floor(Lf / 2.6));
    for (let k = 0; k < n; k++) opening(f, (k + 0.5) * Lf / n - 0.35, s * st + 1.0, 0.7, 1.1);
  }
  // the hipped roof
  const o = 0.45, ex0 = R[0] - o, ez0 = R[1] - o, ex1 = R[2] + o, ez1 = R[3] + o, ye = y + H;
  const wx = ex1 - ex0, wz = ez1 - ez0, rise = Math.min(wx, wz) / 2 * Math.tan(22 * Math.PI / 180);
  bag.add('timber', box(ex0, ye - 0.12, ez0, ex1, ye, ez1));
  const tris = [];
  if (wx >= wz) {
    const r0 = [ex0 + wz / 2, ye + rise, (ez0 + ez1) / 2], r1 = [ex1 - wz / 2, ye + rise, (ez0 + ez1) / 2];
    tris.push(ex0, ye, ez0, ...r0, ...r1, ex0, ye, ez0, ...r1, ex1, ye, ez0);           // north slope
    tris.push(ex1, ye, ez1, ...r1, ...r0, ex1, ye, ez1, ...r0, ex0, ye, ez1);           // south slope
    tris.push(ex0, ye, ez1, ...r0, ex0, ye, ez0);                                        // west hip
    tris.push(ex1, ye, ez0, ...r1, ex1, ye, ez1);                                        // east hip
  } else {
    const r0 = [(ex0 + ex1) / 2, ye + rise, ez0 + wx / 2], r1 = [(ex0 + ex1) / 2, ye + rise, ez1 - wx / 2];
    tris.push(ex1, ye, ez0, ...r0, ...r1, ex1, ye, ez0, ...r1, ex1, ye, ez1);
    tris.push(ex0, ye, ez1, ...r1, ...r0, ex0, ye, ez1, ...r0, ex0, ye, ez0);
    tris.push(ex0, ye, ez0, ...r0, ex1, ye, ez0);
    tris.push(ex1, ye, ez1, ...r1, ex0, ye, ez1);
  }
  // make every face point up
  for (let i = 0; i < tris.length; i += 9) {
    const ux = tris[i + 3] - tris[i], uz = tris[i + 5] - tris[i + 2];
    const vx = tris[i + 6] - tris[i], vz = tris[i + 8] - tris[i + 2];
    if (uz * vx - ux * vz < 0) for (let k = 0; k < 3; k++) { const t = tris[i + 3 + k]; tris[i + 3 + k] = tris[i + 6 + k]; tris[i + 6 + k] = t; }
  }
  bag.add('roof_tile', fromTriangles(tris));
}

/**
 * house_domed: a stone house of the Levant — rooms vaulted in stone, each vault showing on the
 * flat roof as a low dome; a parapet, small windows, a door with a stone lintel.
 * { rect, y (floor), foot (lowest ground), storeys, front, seed }
 */
function houseDomed(el, { bag, col }) {
  const rand = rng(el.seed || 1);
  const [x0, z0, x1, z1] = el.rect, y = el.y, st = 3.6, H = el.storeys * st;
  bag.add('limestone', box(x0 - 0.1, el.foot - 0.6, z0 - 0.1, x1 + 0.1, y + 0.3, z1 + 0.1));
  bag.add('limestone', box(x0, y + 0.3, z0, x1, y + H, z1));
  col.rect([x0, z0, x1, z1], el.foot - 0.6, y + H);
  const t = 0.35, par = 0.9;
  for (const r of [[x0, z0, x1, z0 + t], [x0, z1 - t, x1, z1], [x0, z0 + t, x0 + t, z1 - t], [x1 - t, z0 + t, x1, z1 - t]]) bag.add('limestone', box(r[0], y + H, r[1], r[2], y + H + par, r[3]));
  // one dome over each vaulted room: the roof is divided into bays of about 4–5 m
  const nx = Math.max(1, Math.round((x1 - x0) / 4.6)), nz = Math.max(1, Math.round((z1 - z0) / 4.6));
  const bw = (x1 - x0) / nx, bd = (z1 - z0) / nz;
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    if (rand() < 0.25) continue;
    const cx = x0 + (i + 0.5) * bw, cz = z0 + (j + 0.5) * bd, r = Math.min(bw, bd) * 0.42;
    bag.add('plaster', lathe([[r, 0], [r * 0.85, r * 0.32], [r * 0.5, r * 0.55], [0.001, r * 0.63]], 10, null, cx, y + H, cz));
  }
  // openings on the street front
  const f = el.front || 's';
  const L = f === 's' || f === 'n' ? x1 - x0 : z1 - z0;
  const open = (u, v0, w, h) => {
    if (u + w > L - 0.3) return;
    if (f === 's') bag.add('opening', box(x0 + u, y + v0, z1, x0 + u + w, y + v0 + h, z1 + 0.03));
    if (f === 'n') bag.add('opening', box(x0 + u, y + v0, z0 - 0.03, x0 + u + w, y + v0 + h, z0));
    if (f === 'e') bag.add('opening', box(x1, y + v0, z0 + u, x1 + 0.03, y + v0 + h, z0 + u + w));
    if (f === 'w') bag.add('opening', box(x0 - 0.03, y + v0, z0 + u, x0, y + v0 + h, z0 + u + w));
  };
  open(0.8 + rand() * Math.max(0.2, L - 2.6), 0.3, 1.1, 2.2);
  for (let s = 0; s < el.storeys; s++) {
    const n = Math.max(1, Math.floor(L / 3.4));
    for (let k = 0; k < n; k++) if (s > 0 || rand() < 0.4) open((k + 0.5) * L / n - 0.3, s * st + 2.0, 0.6, 0.9);
  }
}

/**
 * The ground floor of an open Paris house (DESIGN §4.3): stone walls with a wide door in the middle
 * of the front, a step, a floor of beaten earth and flags, the beams of the floor above; furnished by
 * el.use — 'workshop' (a joiner's: the bench with a vice and shavings, planks stacked, tools on the
 * wall, a trestle, a chest of tools, a half-made chest) or 'inn' (the tavern: trestle tables and
 * benches, the hearth with its pot, casks on a stand, jugs on a shelf).
 */
function openTimber(bag, col, el, st, rand) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, f = el.front || 's', T = 0.45, fy = y + 0.25;
  const along = f === 's' || f === 'n', L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0;
  const P = (u, v) => (f === 's' ? [x1 - u, z1 - v] : f === 'n' ? [x0 + u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);
  const rect = (u0, v0, u1, v1) => { const a = P(u0, v0), b = P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const B = (m, u0, v0, u1, v1, ya, yb, c = false) => { const r = rect(u0, v0, u1, v1); bag.add(m, box(r[0], ya, r[1], r[2], yb, r[3])); if (c) col.rect(r, ya - 0.3, yb); };
  const pot = (m, u, v, r, h, ya = 0) => { const p = P(u, v); bag.add(m, lathe([[r * 0.6, 0], [r, h * 0.45], [r * 0.75, h * 0.85], [r * 0.55, h], [0.001, h]], 10, null, p[0], fy + ya, p[1])); };
  const du = L / 2, dw = 1.6;
  bag.add('limestone', box(x0 - 0.1, el.foot - 0.6, z0 - 0.1, x1 + 0.1, fy, z1 + 0.1)); col.rect([x0, z0, x1, z1], el.foot - 0.6, fy - 0.3);
  B('limestone', 0, D - T, L, D, fy, y + st, true); B('limestone', 0, T, T, D - T, fy, y + st, true); B('limestone', L - T, T, L, D - T, fy, y + st, true);
  B('limestone', 0, 0, du - dw / 2, T, fy, y + st, true); B('limestone', du + dw / 2, 0, L, T, fy, y + st, true); B('limestone', du - dw / 2, 0, du + dw / 2, T, fy + 2.4, y + st);
  B('timber', du - dw / 2 - 0.1, -0.02, du + dw / 2 + 0.1, T + 0.02, fy + 2.4, fy + 2.6);
  B('wood_dark', du - dw / 2 - 0.02, T, du - dw / 2 + 0.06, T + dw / 2, fy, fy + 2.35); B('wood_dark', du + dw / 2 - 0.06, T, du + dw / 2 + 0.02, T + dw / 2, fy, fy + 2.35);
  { const r = rect(0, 0, L, D); col.floor(r, fy); col.rect(r, y + st - 0.1, y + st + 0.3); }
  B('flagstone', T, T, L - T, D - T, fy - 0.12, fy + 0.012);
  B('timber', T, T, L - T, D - T, y + st - 0.06, y + st - 0.02); for (let u = T + 0.5; u < L - T; u += 0.75) B('wood_dark', u - 0.09, T, u + 0.09, D - T, y + st - 0.28, y + st - 0.06);
  if (el.use === 'inn') {
    for (const v of [D * 0.35, D * 0.62]) { if (v > D - 1.6) continue; const u = L / 2 - 0.2; B('timber', u - 1.0, v - 0.35, u + 1.0, v + 0.35, fy + 0.74, fy + 0.8, true); for (const a of [-0.85, 0.8]) { B('wood_dark', u + a, v - 0.3, u + a + 0.06, v + 0.3, fy, fy + 0.74); } for (const sg of [-1, 1]) { B('timber', u - 1.0, v + sg * 0.6 - 0.12, u + 1.0, v + sg * 0.6 + 0.12, fy + 0.42, fy + 0.46, true); for (const a of [-0.9, 0.85]) B('wood_dark', u + a, v + sg * 0.6 - 0.1, u + a + 0.05, v + sg * 0.6 + 0.1, fy, fy + 0.42); } pot('terracotta', u - 0.4, v, 0.08, 0.26, 0.8); pot('pottery_dark', u + 0.3, v - 0.1, 0.06, 0.14, 0.8); }
    B('limestone', L - T - 1.3, D - T - 0.7, L - T - 0.1, D - T, fy, fy + 0.35, true); pot('iron', L - T - 0.7, D - T - 0.35, 0.22, 0.28, 0.35); B('limestone', L - T - 1.4, D - T - 0.8, L - T, D - T, fy + 1.6, fy + 1.9); for (const sg of [-1, 1]) B('limestone', L - T - 0.7 + sg * 0.6 - 0.1, D - T - 0.7, L - T - 0.7 + sg * 0.6 + 0.1, D - T, fy + 0.35, fy + 1.6);
    B('wood_dark', T + 0.1, D - T - 1.0, T + 0.9, D - T - 0.1, fy, fy + 0.5, true); for (let k = 0; k < 2; k++) { const p = P(T + 0.5, D - T - 0.75 + k * 0.0 + (k ? -0.0 : 0)); const g = lathe([[0.3, 0], [0.36, 0.4], [0.3, 0.8], [0.001, 0.8]], 12, null, 0, 0, 0); g.rotateZ(Math.PI / 2); g.translate(p[0] + (k ? 0 : 0), fy + 0.85 + k * 0.62, p[1]); bag.add('timber', g); }
    B('wood_dark', T + 0.05, T + 0.8, T + 0.35, D - T - 1.4, fy + 1.5, fy + 1.54); for (let v = T + 1.0; v < D - T - 1.5; v += 0.35) pot(rand() < 0.5 ? 'terracotta' : 'pottery_dark', T + 0.2, v, 0.07, 0.24, 1.54);
  } else {
    // the joiner's bench along the side wall with its vice and shavings, a half-made chest, planks, tools on the wall
    const bu = T + 0.4;
    B('timber', bu - 0.35, T + 1.0, bu + 0.35, T + 3.0, fy + 0.8, fy + 0.9, true); for (const v of [T + 1.1, T + 2.85]) for (const a of [-0.3, 0.25]) B('wood_dark', bu + a, v, bu + a + 0.06, v + 0.06, fy, fy + 0.8);
    B('wood_dark', bu - 0.4, T + 1.0, bu - 0.3, T + 1.2, fy + 0.6, fy + 1.0); for (let k = 0; k < 12; k++) { const a = bu - 0.2 + rand() * 0.37, b = T + 1.2 + rand() * 1.55; B('timber', a, b, a + 0.03 + rand() * 0.04, b + 0.03 + rand() * 0.05, fy + 0.9, fy + 0.915); }
    for (let k = 0; k < 24; k++) { const a = T + 0.5 + rand() * 1.2, b = T + 1.0 + rand() * 2.2; B('timber', a, b, a + 0.03 + rand() * 0.05, b + 0.03 + rand() * 0.06, fy + 0.012, fy + 0.02); }
    for (let k = 0; k < 6; k++) B('timber', L - T - 0.5, T + 0.6, L - T - 0.05, D - T - 0.8, fy + k * 0.05, fy + k * 0.05 + 0.04);
    B('wood_dark', L / 2 - 0.45, D / 2 - 0.3, L / 2 + 0.45, D / 2 + 0.3, fy, fy + 0.5, true); B('timber', L / 2 - 0.45, D / 2 - 0.3, L / 2 - 0.3, D / 2 + 0.3, fy + 0.5, fy + 0.55);
    for (const a of [-0.4, 0.4]) { B('timber', L / 2 + a - 0.05, D / 2 + 0.9, L / 2 + a + 0.05, D / 2 + 1.0, fy, fy + 0.6); } B('timber', L / 2 - 0.5, D / 2 + 0.88, L / 2 + 0.5, D / 2 + 1.02, fy + 0.6, fy + 0.68, true);
    const wv = D - T - 0.03; B('wood_dark', T + 0.6, wv - 0.04, L - T - 0.6, wv, fy + 1.4, fy + 1.48); for (let u = T + 0.9; u < L - T - 0.8; u += 0.35) { B('timber', u - 0.02, wv - 0.06, u + 0.02, wv - 0.02, fy + 0.95, fy + 1.4); B('iron', u - 0.06, wv - 0.07, u + 0.06, wv - 0.03, fy + 0.95, fy + 1.05); }
    B('wood_dark', T + 0.1, D - T - 0.8, T + 1.0, D - T - 0.15, fy, fy + 0.55, true);
  }
}

/**
 * house_timber: a town house of medieval Paris — a stone ground floor, timber-framed upper
 * storeys jettied over the street, plastered between the timbers, a steep gabled roof whose gable
 * faces the street. { rect, y, foot, storeys, front, seed }
 */
function houseTimber(el, { bag, col }) {
  const rand = rng(el.seed || 1);
  const [x0, z0, x1, z1] = el.rect, y = el.y, st = 3.0, H = el.storeys * st;
  const f = el.front || 's', along = f === 's' || f === 'n';
  const OPEN = !!el.open && !el.simple;
  if (!OPEN) { bag.add('limestone', box(x0 - 0.1, el.foot - 0.6, z0 - 0.1, x1 + 0.1, y + st, z1 + 0.1)); col.rect([x0, z0, x1, z1], el.foot - 0.6, y + H); }
  else openTimber(bag, col, el, st, rng((el.seed || 1) + 3));
  // each upper storey steps out 0.4 m over the street
  let R = [x0, z0, x1, z1];
  for (let s = 1; s < el.storeys; s++) {
    const J = 0.4 * s;
    R = f === 's' ? [x0, z0, x1, z1 + J] : f === 'n' ? [x0, z0 - J, x1, z1] : f === 'e' ? [x0, z0, x1 + J, z1] : [x0 - J, z0, x1, z1];
    bag.add('half_timber', box(R[0], y + s * st, R[1], R[2], y + (s + 1) * st, R[3]));
    bag.add('timber', box(R[0] - 0.05, y + s * st - 0.12, R[1] - 0.05, R[2] + 0.05, y + s * st + 0.08, R[3] + 0.05));
  }
  // windows and the door on the street front
  const L = along ? x1 - x0 : z1 - z0;
  const open = (u, v0, w, h) => {
    if (u + w > L - 0.25) return;
    if (f === 's') bag.add('opening', box(x0 + u, y + v0, R[3], x0 + u + w, y + v0 + h, R[3] + 0.03));
    if (f === 'n') bag.add('opening', box(x0 + u, y + v0, R[1] - 0.03, x0 + u + w, y + v0 + h, R[1]));
    if (f === 'e') bag.add('opening', box(R[2], y + v0, z0 + u, R[2] + 0.03, y + v0 + h, z0 + u + w));
    if (f === 'w') bag.add('opening', box(R[0] - 0.03, y + v0, z0 + u, R[0], y + v0 + h, z0 + u + w));
  };
  const du = 0.6 + rand() * Math.max(0.2, L - 2.4);
  if (OPEN) { /* the way in is cut in openTimber */ } else
  if (f === 's') bag.add('opening', box(x0 + du, y + 0.2, z1, x0 + du + 1.2, y + 2.5, z1 + 0.03));
  if (f === 'n') bag.add('opening', box(x0 + du, y + 0.2, z0 - 0.03, x0 + du + 1.2, y + 2.5, z0));
  if (f === 'e') bag.add('opening', box(x1, y + 0.2, z0 + du, x1 + 0.03, y + 2.5, z0 + du + 1.2));
  if (f === 'w') bag.add('opening', box(x0 - 0.03, y + 0.2, z0 + du, x0, y + 2.5, z0 + du + 1.2));
  for (let s = 1; s < el.storeys; s++) { const n = Math.max(1, Math.floor(L / 2.2)); for (let k = 0; k < n; k++) open((k + 0.5) * L / n - 0.35, s * st + 0.9, 0.7, 1.2); }
  // the steep roof: the ridge runs back from the street, so the gable faces it
  const ye = y + H, o = 0.35;
  const tris = [];
  if (along) {
    const xm = (R[0] + R[2]) / 2, rise = (R[2] - R[0]) / 2 * 1.5;
    const a = [R[0] - o, ye, R[1] - o], b = [R[2] + o, ye, R[1] - o], c = [R[2] + o, ye, R[3] + o], d = [R[0] - o, ye, R[3] + o];
    const t0 = [xm, ye + rise, R[1] - o], t1 = [xm, ye + rise, R[3] + o];
    tris.push(...a, ...t0, ...t1, ...a, ...t1, ...d, ...b, ...c, ...t1, ...b, ...t1, ...t0);
    bag.add('half_timber', fromTriangles([R[0], ye, R[1], R[2], ye, R[1], xm, ye + rise - 0.3, R[1], R[0], ye, R[3], xm, ye + rise - 0.3, R[3], R[2], ye, R[3]]));
  } else {
    const zm = (R[1] + R[3]) / 2, rise = (R[3] - R[1]) / 2 * 1.5;
    const a = [R[0] - o, ye, R[1] - o], b = [R[2] + o, ye, R[1] - o], c = [R[2] + o, ye, R[3] + o], d = [R[0] - o, ye, R[3] + o];
    const t0 = [R[0] - o, ye + rise, zm], t1 = [R[2] + o, ye + rise, zm];
    tris.push(...a, ...b, ...t1, ...a, ...t1, ...t0, ...d, ...t0, ...t1, ...d, ...t1, ...c);
    bag.add('half_timber', fromTriangles([R[0], ye, R[1], R[0], ye + rise - 0.3, zm, R[0], ye, R[3], R[2], ye, R[1], R[2], ye, R[3], R[2], ye + rise - 0.3, zm]));
  }
  for (let i = 0; i < tris.length; i += 9) {
    const ux = tris[i + 3] - tris[i], uz = tris[i + 5] - tris[i + 2], vx = tris[i + 6] - tris[i], vz = tris[i + 8] - tris[i + 2];
    if (uz * vx - ux * vz < 0) for (let k = 0; k < 3; k++) { const t = tris[i + 3 + k]; tris[i + 3 + k] = tris[i + 6 + k]; tris[i + 6 + k] = t; }
  }
  bag.add(rand() < 0.5 ? 'slate' : 'roof_tile', fromTriangles(tris));
}

/**
 * house_china: a house of a north China village — earth or grey-brick walls, a gabled roof of grey
 * tiles with a ridge, small latticed windows and a door on the courtyard side. { rect, y, foot, front, seed }
 */
function houseChina(el, ctx) {
  gabledHouse(el, ctx, { H: 3.2, foot: 'brick_grey', walls: ['brick_grey', 'earth_wall'], roof: 'tile_grey', soffit: 'timber', o: 0.5, pitch: 0.62, door: 'timber_red', window: 'timber_red', infill: 'lattice', sill: 'brick_grey', frame: 'brick', chimney: true, horns: true, inside: 'china' });
}

/**
 * house_japan: a house of a Heian village by Uji — a timber frame on stones, walls of planks or
 * white plaster between dark posts, deep eaves, a gabled roof of cypress bark or thatch.
 */
function houseJapan(el, ctx) {
  const rand = rng((el.seed || 1) + 7);
  const thatch = rand() >= 0.5;
  gabledHouse(el, ctx, { H: 2.9, foot: 'limestone', walls: ['timber', 'plaster_white'], roof: thatch ? 'thatch' : 'roof_bark', boards: !thatch, soffit: 'timber', o: 0.9, pitch: thatch ? 1.0 : 0.8, door: 'timber', window: 'timber', frameMat: 'wood_dark', infill: 'koshi', frame: 'posts', gableVent: 'koshi', horns: false, inside: 'japan' });
}

/**
 * house_india: a village house of central India — walls of mud plastered and limewashed, or of
 * brick, a low-pitched roof of half-round clay tiles over a verandah front. { rect, y, foot, front, seed }
 */
function houseIndia(el, ctx) {
  gabledHouse(el, ctx, { H: 3.3, foot: 'mudbrick', walls: ['plaster', 'earth_wall'], roof: 'roof_tile', soffit: 'timber', o: 0.6, pitch: 0.45, door: 'timber', window: 'wood_dark', frameMat: 'timber', infill: 'bars', winW: 0.8, winH: 0.85, verandah: true, horns: false, inside: 'india' });
}

/**
 * house_rouergue: a village house of the Rouergue about 1100 — walls of grey schist rubble or of
 * yellow stone, small windows, a steep roof of schist slabs (lauzes). { rect, y, foot, front, seed }
 */
function houseRouergue(el, ctx) {
  gabledHouse(el, ctx, { H: 3.0, foot: 'schist_rubble', walls: ['schist_rubble', 'limestone_yellow'], roof: 'lauze', soffit: 'timber', o: 0.4, pitch: 1.0, door: 'timber', window: 'timber', frameMat: 'limestone_yellow', lintel: 'limestone_yellow', sill: 'limestone_yellow', infill: 'shutter', winW: 0.6, winH: 0.75, winY: 1.4, frame: 'quoins', horns: false });
}

/**
 * The inside of an open gabled village house (DESIGN §4.3): four walls with the door's way cut in
 * the front's middle (the leaf open inside), a step, the floor, a ceiling of boards on beams under
 * the roof; furnished by region (O.inside): 'china' — the kang (the heated brick bed) with its mat
 * and low table, the stove and its pot, water jars, a chest; 'japan' — a raised board floor, the
 * sunken hearth with its kettle, straw mats, a low table, a chest, a hanging shelf; 'india' — the
 * clay stove (chulha), water pots, two string beds (charpai), a grain bin; 'europe' — the hearth,
 * a table, a bench, a chest, a bed of boards with straw.
 */
function openGabled(bag, col, el, O, mat, { L, f, H, nb }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, T = 0.3, fy = y + 0.45, D = (f === 's' || f === 'n') ? z1 - z0 : x1 - x0;
  const P = (u, v) => (f === 's' ? [x1 - u, z1 - v] : f === 'n' ? [x0 + u, z0 + v] : f === 'e' ? [x1 - v, z0 + u] : [x0 + v, z1 - u]);
  const rect = (u0, v0, u1, v1) => { const a = P(u0, v0), b = P(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const B = (m, u0, v0, u1, v1, ya, yb, c = false) => { const r = rect(u0, v0, u1, v1); bag.add(m, box(r[0], ya, r[1], r[2], yb, r[3])); if (c) col.rect(r, ya - 0.45, yb); };
  const pot = (m, u, v, r, h, ya = 0) => { const p = P(u, v); bag.add(m, lathe([[r * 0.6, 0], [r, h * 0.45], [r * 0.75, h * 0.85], [r * 0.55, h], [0.001, h]], 10, null, p[0], fy + ya, p[1])); };
  // the door: in the middle bay of the front, as the closed house has it
  const k = Math.floor(nb / 2), du = (k + 0.5) * L / nb, dw = 1.1;
  // the walls, the floor, the ceiling (as the closed house's solid, but hollow)
  B(mat, 0, D - T, L, D, fy, y + H, true); B(mat, 0, T, T, D - T, fy, y + H, true); B(mat, L - T, T, L, D - T, fy, y + H, true);
  B(mat, 0, 0, du - dw / 2, T, fy, y + H, true); B(mat, du + dw / 2, 0, L, T, fy, y + H, true); B(mat, du - dw / 2, 0, du + dw / 2, T, fy + 2.1, y + H);
  B(O.door, du - dw / 2 - 0.02, T, du - dw / 2 + 0.05, T + dw, fy, fy + 2.05);
  { const r = rect(0, 0, L, D); col.floor(r, fy); col.rect(r, y + H - 0.1, y + H + 0.3); }
  B(O.foot, du - 0.7, -0.5, du + 0.7, 0, fy - 0.25, fy - 0.02); col.floor(rect(du - 0.7, -0.5, du + 0.7, 0), fy - 0.25);
  const kind = O.inside ?? 'europe';
  B(kind === 'japan' ? 'timber' : kind === 'china' ? 'brick_grey' : kind === 'india' ? 'earth_wall' : 'flagstone', T, T, L - T, D - T, fy - 0.12, fy + 0.012);
  B('timber', T, T, L - T, D - T, y + H - 0.06, y + H - 0.02);
  for (let u = T + 0.6; u < L - T; u += 1.0) B('wood_dark', u - 0.08, T, u + 0.08, D - T, y + H - 0.24, y + H - 0.06);
  if (kind === 'china') {
    // the kang along the back wall, its mat and the low table on it; the stove at one end feeding it; water jars; a chest
    B('brick_grey', T, D - T - 1.8, L - T - 1.2, D - T, fy, fy + 0.6, true); B('reed_mat', T + 0.05, D - T - 1.75, L - T - 1.25, D - T - 0.05, fy + 0.6, fy + 0.62);
    B('lacquer_chestnut', L / 2 - 0.6, D - T - 1.2, L / 2 + 0.2, D - T - 0.6, fy + 0.85, fy + 0.9); for (const [a, b] of [[-0.55, -1.15], [0.15, -1.15], [-0.55, -0.65], [0.15, -0.65]]) B('lacquer_chestnut', L / 2 + a, D - T + b, L / 2 + a + 0.04, D - T + b + 0.04, fy + 0.62, fy + 0.85);
    B('cloth_indigo', T + 0.1, D - T - 0.6, T + 1.4, D - T - 0.1, fy + 0.62, fy + 0.8);
    B('brick_grey', L - T - 1.15, D - T - 1.2, L - T, D - T, fy, fy + 0.8, true); pot('iron', L - T - 0.6, D - T - 0.6, 0.35, 0.25, 0.8);
    B('brick_grey', L - T - 0.6, D - T - 0.4, L - T - 0.25, D - T - 0.05, fy + 0.8, y + H);
    for (const u of [L - T - 0.5, L - T - 1.2]) pot('glaze_green', u, T + 0.5, 0.3, 0.8);
    B('lacquer_chestnut', T + 0.1, T + 0.2, T + 1.0, T + 0.7, fy, fy + 0.7, true);
  } else if (kind === 'japan') {
    // the raised floor, the sunken hearth with its kettle on a hook, mats, a low table, a chest, a hanging shelf
    B('timber', T, T + 1.2, L - T, D - T, fy, fy + 0.4, true); col.floor(rect(T, T + 1.2, L - T, D - T), fy + 0.4);
    const hu = L / 2, hv = (T + 1.2 + D - T) / 2;
    B('wood_dark', hu - 0.6, hv - 0.6, hu + 0.6, hv + 0.6, fy + 0.4, fy + 0.43); B('pottery_dark', hu - 0.45, hv - 0.45, hu + 0.45, hv + 0.45, fy + 0.43, fy + 0.44);
    pot('iron', hu, hv, 0.2, 0.22, 0.6); B('bamboo_culm', hu - 0.02, hv - 0.02, hu + 0.02, hv + 0.02, fy + 0.85, y + H - 0.06);
    for (const [u0, v0] of [[T + 0.1, D - T - 1.1], [L - T - 2.0, D - T - 1.1]]) if (u0 + 1.8 < L - T) B('reed_mat', u0, v0, u0 + 1.8, v0 + 0.9, fy + 0.4, fy + 0.43);
    B('wood_dark', T + 0.2, T + 1.4, T + 0.9, T + 1.8, fy + 0.4, fy + 0.7, true);
    B('lacquer_black', L - T - 0.8, T + 1.3, L - T - 0.1, T + 1.9, fy + 0.4, fy + 1.0, true);
    B('wood_dark', T + 0.05, D - T - 0.35, L - T - 0.05, D - T - 0.05, fy + 1.8, fy + 1.84); for (let u = T + 0.4; u < L - T - 0.3; u += 0.6) pot('pottery_dark', u, D - T - 0.2, 0.08, 0.16, 1.84);
  } else if (kind === 'india') {
    // the clay stove by the back wall, water pots on a stand, two string beds, a grain bin of clay
    B('earth_wall', L - T - 1.0, D - T - 0.6, L - T - 0.1, D - T - 0.05, fy, fy + 0.35, true); pot('pottery_dark', L - T - 0.55, D - T - 0.33, 0.18, 0.2, 0.35);
    for (const u of [T + 0.4, T + 0.85]) pot('terracotta', u, D - T - 0.4, 0.22, 0.45);
    for (const v of [T + 0.6, T + 1.8]) { if (v + 0.9 > D - T - 0.8) continue; const u0 = L - T - 2.0; B('timber', u0, v, u0 + 1.9, v + 0.05, fy + 0.4, fy + 0.46); B('timber', u0, v + 0.85, u0 + 1.9, v + 0.9, fy + 0.4, fy + 0.46); B('timber', u0, v, u0 + 0.05, v + 0.9, fy + 0.4, fy + 0.46); B('timber', u0 + 1.85, v, u0 + 1.9, v + 0.9, fy + 0.4, fy + 0.46); B('cloth_white', u0 + 0.05, v + 0.05, u0 + 1.85, v + 0.85, fy + 0.42, fy + 0.44); for (const [a, b] of [[0, 0], [1.85, 0], [0, 0.85], [1.85, 0.85]]) B('timber', u0 + a, v + b, u0 + a + 0.05, v + b + 0.05, fy, fy + 0.46); { const r = rect(u0, v, u0 + 1.9, v + 0.9); col.rect(r, fy, fy + 0.46); } }
    pot('earth_wall', T + 0.5, T + 0.7, 0.35, 1.0);
  } else {
    // the hearth against the end wall, a table and bench, a chest, the bed of boards with straw
    B(O.foot, L - T - 1.2, D / 2 - 0.7, L - T, D / 2 + 0.7, fy, fy + 0.3, true); pot('iron', L - T - 0.6, D / 2, 0.22, 0.28, 0.3);
    B(O.foot, L - T - 0.7, D / 2 - 0.5, L - T, D / 2 + 0.5, fy + 1.4, y + H);
    B('timber', L / 2 - 0.8, D / 2 - 0.4, L / 2 + 0.6, D / 2 + 0.4, fy + 0.74, fy + 0.8, true); for (const [a, b] of [[-0.75, -0.35], [0.5, -0.35], [-0.75, 0.3], [0.5, 0.3]]) B('timber', L / 2 + a, D / 2 + b, L / 2 + a + 0.06, D / 2 + b + 0.06, fy, fy + 0.74);
    B('timber', L / 2 - 0.8, D / 2 - 0.85, L / 2 + 0.6, D / 2 - 0.6, fy + 0.4, fy + 0.45, true);
    B('wood_dark', T + 0.1, T + 0.2, T + 1.0, T + 0.7, fy, fy + 0.6, true);
    if (D > 4) { B('timber', T + 0.05, D - T - 2.0, T + 1.3, D - T - 0.05, fy, fy + 0.4, true); B('thatch', T + 0.1, D - T - 1.95, T + 1.25, D - T - 0.1, fy + 0.4, fy + 0.5); B('cloth_brown', T + 0.15, D - T - 1.3, T + 1.2, D - T - 0.1, fy + 0.5, fy + 0.53); }
  }
}

/** Orient each triangle of `t` away from the point c (for convex pieces); returns t. */
function orientFrom(t, c) {
  for (let i = 0; i < t.length; i += 9) {
    const ux = t[i + 3] - t[i], uy = t[i + 4] - t[i + 1], uz = t[i + 5] - t[i + 2], vx = t[i + 6] - t[i], vy = t[i + 7] - t[i + 1], vz = t[i + 8] - t[i + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const mx = (t[i] + t[i + 3] + t[i + 6]) / 3 - c[0], my = (t[i + 1] + t[i + 4] + t[i + 7]) / 3 - c[1], mz = (t[i + 2] + t[i + 5] + t[i + 8]) / 3 - c[2];
    if (nx * mx + ny * my + nz * mz < 0) for (let k = 0; k < 3; k++) { const q = t[i + 3 + k]; t[i + 3 + k] = t[i + 6 + k]; t[i + 6 + k] = q; }
  }
  return t;
}
/**
 * A sloping slab of roof between the four top corners q (in order round it), th thick: its top in
 * `top`, its underside and edges (the eave board, the verges) in `under`.
 */
function roofSlab(bag, top, under, q, th, skipEdge = -1) {
  const b = q.map((p) => [p[0], p[1] - th, p[2]]), c = [0, 0, 0];
  for (const p of [...q, ...b]) for (let k = 0; k < 3; k++) c[k] += p[k] / 8;
  const T = [], U = [];
  T.push(...q[0], ...q[1], ...q[2], ...q[0], ...q[2], ...q[3]);
  U.push(...b[0], ...b[2], ...b[1], ...b[0], ...b[3], ...b[2]);
  for (let i = 0; i < 4; i++) { if (i === skipEdge) continue; const j = (i + 1) % 4; U.push(...q[i], ...q[j], ...b[j], ...q[i], ...b[j], ...b[i]); }
  bag.add(top, fromTriangles(orientFrom(T, c)));
  bag.add(under, fromTriangles(orientFrom(U, c)));
}

/**
 * The village house with a gabled roof (china, japan, india, rouergue): a footing, the walls (or the
 * open house's hollow walls, openGabled), framed windows and a framed plank door, the region's wall
 * frame (O.frame: 'posts' — the Japanese timber frame of posts, sill and head beams; 'brick' — grey
 * brick piers and dado round earth walls; 'quoins' — dressed corner stones in rubble walls), a roof of
 * real thickness — the slopes with their boards seen under the eaves, the verges, the ridge — and the
 * region's extras (the kang's chimney, the thatch ridge's crossed poles, a board roof held by poles
 * and stones, the verandah).
 */
function gabledHouse(el, { bag, col }, O) {
  const rand = rng(el.seed || 1);
  const [x0, z0, x1, z1] = el.rect, y = el.y, H = O.H;
  const mat = O.walls[rand() < 0.5 ? 0 : 1];
  bag.add(O.foot, box(x0 - 0.1, el.foot - 0.6, z0 - 0.1, x1 + 0.1, y + 0.45, z1 + 0.1));
  const f = el.front || 's', along = f === 's' || f === 'n';
  const L = along ? x1 - x0 : z1 - z0;
  const OPEN = !!el.open && !el.simple;
  const n = Math.max(2, Math.floor(L / 3.2));
  if (!OPEN) { bag.add(mat, box(x0, y + 0.45, z0, x1, y + H, z1)); col.rect([x0, z0, x1, z1], el.foot - 0.6, y + H); }
  else openGabled(bag, col, el, O, mat, { L, f, H, nb: n });
  // a frame on each face: u along it from its low corner, d out from it, heights above y
  const len = (fc) => (fc === 'n' || fc === 's' ? x1 - x0 : z1 - z0);
  const put = (fc, m, u0, u1, ya, yb, d0, d1) => {
    const al = fc === 'n' || fc === 's', a0 = al ? x0 : z0, fp = fc === 'n' ? z0 : fc === 's' ? z1 : fc === 'w' ? x0 : x1, sg = fc === 'n' || fc === 'w' ? -1 : 1;
    const p0 = fp + sg * d0, p1 = fp + sg * d1, lo = Math.min(p0, p1), hi = Math.max(p0, p1);
    bag.add(m, al ? box(a0 + u0, y + ya, lo, a0 + u1, y + yb, hi) : box(lo, y + ya, a0 + u0, hi, y + yb, a0 + u1));
  };
  const back = { n: 's', s: 'n', e: 'w', w: 'e' }[f], sides = along ? ['w', 'e'] : ['n', 's'];
  const fm = O.frameMat ?? O.window;
  // a window: the dark opening, the frame and sill, and the region's filling (lattice, bars, shutters)
  const win = (fc, u, v0, w, h) => {
    const Lf = len(fc), a = u - w / 2, b = u + w / 2, fr = 0.09;
    if (a - fr < 0.3 || b + fr > Lf - 0.3) return;
    put(fc, 'opening', a, b, v0, v0 + h, 0, 0.012);
    put(fc, fm, a - fr, a, v0, v0 + h + fr, 0, 0.07); put(fc, fm, b, b + fr, v0, v0 + h + fr, 0, 0.07); put(fc, fm, a, b, v0 + h, v0 + h + fr, 0, 0.07);
    put(fc, O.sill ?? fm, a - fr - 0.04, b + fr + 0.04, v0 - 0.08, v0, 0, 0.12);
    if (O.infill === 'bars') for (let k = 1; k < 5; k++) put(fc, O.window, a + k * w / 5 - 0.02, a + k * w / 5 + 0.02, v0, v0 + h, 0.012, 0.05);
    else if (O.infill === 'shutter') {
      if (rand() < 0.35) put(fc, O.window, a, b, v0, v0 + h, 0.012, 0.05);
      else for (const [s0, s1] of [[a - fr - w / 2, a - fr], [b + fr, b + fr + w / 2]]) if (s0 > 0.05 && s1 < Lf - 0.05) put(fc, O.window, s0, s1, v0, v0 + h, 0, 0.04);
    } else put(fc, O.infill ?? O.window, a, b, v0, v0 + h, 0.012, 0.035);
  };
  // the closed house's door: a leaf of boards in its frame, a lintel, a step down to the ground
  const door = (u) => {
    const w = 1.0, h = 2.05, v0 = 0.45, a = u - w / 2, b = u + w / 2, fr = 0.1;
    put(f, O.door, a, b, v0, v0 + h, 0, 0.03);
    for (let k = 1; k < 5; k++) put(f, 'wood_dark', a + k * w / 5 - 0.008, a + k * w / 5 + 0.008, v0 + 0.02, v0 + h - 0.02, 0.03, 0.036);
    put(f, fm, a - fr, a, v0, v0 + h, 0, 0.08); put(f, fm, b, b + fr, v0, v0 + h, 0, 0.08);
    put(f, O.lintel ?? fm, a - fr - 0.12, b + fr + 0.12, v0 + h, v0 + h + 0.18, 0, 0.1);
    put(f, O.sill ?? O.foot, a - 0.25, b + 0.25, el.foot - y - 0.3, 0.22, 0.1, 0.5);
  };
  // the door's bay (the open house's way in is cut by openGabled, whose frame runs the other way on
  // the south and west fronts)
  const dU0 = (Math.floor(n / 2) + 0.5) * L / n, doorU = OPEN && (f === 's' || f === 'w') ? L - dU0 : dU0;
  for (let k = 0; k < n; k++) {
    const u = (k + 0.5) * L / n;
    if (Math.abs(u - doorU) < 0.1) { if (!OPEN) door(u); }
    else win(f, u, O.winY ?? 1.2, (O.winW ?? 1.0) * (1 + rand() * 0.25), O.winH ?? 1.0);
  }
  // fewer, smaller windows at the back
  for (let k = 0; k < n; k++) if (rand() < 0.45) win(back, (k + 0.5) * L / n, 1.5, 0.7, 0.7);
  // the region's wall frame
  if (O.frame === 'posts') {
    // posts at the corners and between the bays, the sill beam on the stones and the head beam
    for (const fc of [f, back, ...sides]) {
      const Lf = len(fc), nb = fc === f || fc === back ? n : Math.max(1, Math.round(Lf / 2.4));
      for (let k = 1; k < nb; k++) { const u = k * Lf / nb; put(fc, 'wood_dark', u - 0.08, u + 0.08, 0.45, H, 0, 0.05); }
      put(fc, 'wood_dark', 0, Lf, 0.45, 0.62, 0, 0.06); put(fc, 'wood_dark', 0, Lf, H - 0.42, H - 0.26, 0, 0.06);
    }
    for (const [cx, cz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) bag.add('wood_dark', box(cx - 0.11, y + 0.45, cz - 0.11, cx + 0.11, y + H, cz + 0.11));
  } else if (O.frame === 'brick' && mat === 'earth_wall') {
    // the grey brick frame of an earth-walled house: a dado, piers at the corners, a band under the eaves
    for (const fc of [f, back, ...sides]) {
      const Lf = len(fc);
      if (fc === f) { put(fc, 'brick_grey', 0, doorU - 0.72, 0.45, 1.25, 0, 0.04); put(fc, 'brick_grey', doorU + 0.72, Lf, 0.45, 1.25, 0, 0.04); }
      else put(fc, 'brick_grey', 0, Lf, 0.45, 1.25, 0, 0.04);
      put(fc, 'brick_grey', 0, Lf, H - 0.35, H, 0, 0.04);
    }
    for (const [cx, cz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) bag.add('brick_grey', box(cx - 0.32, y + 1.25, cz - 0.32, cx + 0.32, y + H - 0.35, cz + 0.32));
  } else if (O.frame === 'quoins' && mat === 'schist_rubble') {
    // dressed corner stones, long and short in turn, in the rubble walls
    let k = 0;
    for (let v = 0.45; v + 0.3 <= H; v += 0.32, k++) {
      for (const [cx, sx] of [[x0, 1], [x1, -1]]) for (const [cz, sz] of [[z0, 1], [z1, -1]]) {
        const lx = k % 2 ? 0.55 : 0.3, lz = k % 2 ? 0.3 : 0.55;
        const xa = Math.min(cx - sx * 0.03, cx + sx * lx), xb = Math.max(cx - sx * 0.03, cx + sx * lx), za = Math.min(cz - sz * 0.03, cz + sz * lz), zb = Math.max(cz - sz * 0.03, cz + sz * lz);
        bag.add('limestone_yellow', box(xa, y + v, za, xb, y + v + 0.3, zb));
      }
    }
  }
  // the verandah (India): a lean-to of tiles on posts over a raised mud platform along the front
  let frontO = null;
  if (O.verandah) {
    const vd = 1.45, yv = H - 0.3, pv = 0.26, Lf = len(f);
    put(f, O.foot, 0, Lf, el.foot - y - 0.6, 0.45, 0.1, vd + 0.15);
    { const al = along, fp = f === 'n' ? z0 : f === 's' ? z1 : f === 'w' ? x0 : x1, sg = f === 'n' || f === 'w' ? -1 : 1, p0 = fp, p1 = fp + sg * (vd + 0.15);
      col.floor(al ? [x0, Math.min(p0, p1), x1, Math.max(p0, p1)] : [Math.min(p0, p1), z0, Math.max(p0, p1), z1], y + 0.45); }
    const np = Math.max(2, Math.round(Lf / 2.4) + 1);
    for (let k = 0; k < np; k++) { const u = 0.25 + k * (Lf - 0.5) / (np - 1); put(f, 'timber', u - 0.08, u + 0.08, 0.45, yv - vd * pv - 0.14, vd - 0.2, vd - 0.04); }
    put(f, 'timber', 0.1, Lf - 0.1, yv - vd * pv - 0.3, yv - (vd - 0.2) * pv - 0.13, vd - 0.24, vd);
    const W = (u, d, h) => { const fp = f === 'n' ? z0 : f === 's' ? z1 : f === 'w' ? x0 : x1, sg = f === 'n' || f === 'w' ? -1 : 1; return along ? [x0 + u, y + h, fp + sg * d] : [fp + sg * d, y + h, z0 + u]; };
    roofSlab(bag, O.roof, O.soffit, [W(-0.15, 0, yv), W(Lf + 0.15, 0, yv), W(Lf + 0.15, vd + 0.2, yv - (vd + 0.2) * pv), W(-0.15, vd + 0.2, yv - (vd + 0.2) * pv)], 0.1, 0);
    frontO = 0.3;
  }
  // the roof: two slabs from the eaves to the ridge, the gables walled up under them
  const o = O.o * (0.9 + rand() * 0.2), p = O.pitch * (0.92 + rand() * 0.16), th = 0.16, ye = y + H;
  const ridgeX = (x1 - x0) >= (z1 - z0);
  const s0 = (ridgeX ? x0 : z0) - o, s1 = (ridgeX ? x1 : z1) + o, t0 = ridgeX ? z0 : x0, t1 = ridgeX ? z1 : x1, tm = (t0 + t1) / 2, hw = (t1 - t0) / 2, yr = ye + hw * p;
  const Wr = (s, t, h) => (ridgeX ? [s, h, t] : [t, h, s]);
  // which roof side faces the front (for the verandah's short front eave)
  const frontSide = ridgeX ? (f === 's' ? 1 : f === 'n' ? -1 : 0) : (f === 'e' ? 1 : f === 'w' ? -1 : 0);
  const shingle = O.boards && rand() < 0.4;
  const roofMat = shingle ? 'planks_grey' : O.roof;
  for (const side of [-1, 1]) {
    const oo = frontO !== null && side === frontSide ? frontO : o, te = side < 0 ? t0 - oo : t1 + oo, ee = ye - oo * p;
    roofSlab(bag, roofMat, O.soffit, [Wr(s0, te, ee), Wr(s1, te, ee), Wr(s1, tm, yr), Wr(s0, tm, yr)], th, 2);
  }
  for (const [sw, sg] of [[ridgeX ? x0 : z0, -1], [ridgeX ? x1 : z1, 1]]) {
    const tr = [...Wr(sw, t0, ye), ...Wr(sw, tm, yr - th), ...Wr(sw, t1, ye)];
    bag.add(mat, fromTriangles(orientFrom(tr, Wr(sw - sg, tm, ye))));
    // a vent high in the gable (Japan: the smoke's way out under the ridge)
    if (O.gableVent) { const g = (yr - ye) * 0.55; const q = ridgeX ? box(sw - (sg < 0 ? 0.04 : 0), ye + g - 0.25, tm - 0.4, sw + (sg > 0 ? 0.04 : 0), ye + g + 0.25, tm + 0.4) : box(tm - 0.4, ye + g - 0.25, sw - (sg < 0 ? 0.04 : 0), tm + 0.4, ye + g + 0.25, sw + (sg > 0 ? 0.04 : 0)); bag.add(O.gableVent, q); }
  }
  // the ridge, and the region's crown on it
  const thick = O.roof === 'thatch' && !shingle;
  const rw = thick ? 0.3 : 0.18, rh = thick ? 0.38 : 0.3;
  bag.add(O.roof === 'tile_grey' ? 'tile_grey' : thick ? 'roof_bark' : 'roof_ridge', ridgeX ? box(s0 - 0.05, yr - 0.08, tm - rw, s1 + 0.05, yr + rh, tm + rw) : box(tm - rw, yr - 0.08, s0 - 0.05, tm + rw, yr + rh, s1 + 0.05));
  if (O.horns) for (const ss of [s0, s1]) bag.add('tile_grey', ridgeX ? box(ss - 0.25, yr, tm - 0.2, ss + 0.25, yr + 0.75, tm + 0.2) : box(tm - 0.2, yr, ss - 0.25, tm + 0.2, yr + 0.75, ss + 0.25));
  if (thick) {
    // the thatch ridge's crossed poles (karasu-odori), pairs along it
    const nk = Math.max(3, Math.round((s1 - s0) / 1.3));
    for (let k = 0; k < nk; k++) {
      const ss = s0 + 0.5 + k * (s1 - s0 - 1.0) / (nk - 1);
      bag.add('wood_dark', rod(Wr(ss, tm - 0.42, yr + 0.05), Wr(ss, tm + 0.18, yr + 0.62), 0.045, 5));
      bag.add('wood_dark', rod(Wr(ss, tm + 0.42, yr + 0.05), Wr(ss, tm - 0.18, yr + 0.62), 0.045, 5));
    }
  }
  if (shingle) {
    // boards held down by poles laid along the slopes and stones on them
    for (const side of [-1, 1]) for (const fr of [0.3, 0.65]) {
      const t = tm + side * fr * hw, h = yr - fr * hw * p + 0.06;
      bag.add('wood_dark', rod(Wr(s0 + 0.1, t, h), Wr(s1 - 0.1, t, h), 0.06, 6));
      for (let ss = s0 + 0.5 + rand() * 0.4; ss < s1 - 0.4; ss += 0.9 + rand() * 0.5) { const q = Wr(ss, t, h + 0.04); bag.add('rock_boulder', lathe([[0.17, 0], [0.19, 0.08], [0.12, 0.17], [0.001, 0.2]], 6, null, q[0], q[1], q[2])); }
    }
  }
  if (O.chimney && rand() < 0.7) {
    // the kang's flue rising at one gable end
    const ss = rand() < 0.5 ? s0 + o + 0.35 : s1 - o - 0.35, t = tm + (rand() < 0.5 ? -1 : 1) * hw * 0.45, c = Wr(ss, t, 0);
    const top = yr + 0.5;
    bag.add('brick_grey', box(c[0] - 0.28, ye - 0.2, c[2] - 0.28, c[0] + 0.28, top, c[2] + 0.28));
    bag.add('tile_grey', box(c[0] - 0.36, top, c[2] - 0.36, c[0] + 0.36, top + 0.1, c[2] + 0.36));
  }
}

/**
 * bridge_stone: a bridge of stone carrying a road over a river { rect (the deck, running east–west),
 * y (deck level), ramps: [[rect, y0, y1, dir]], bed (river bed level) }: a deck on piers, parapets,
 * ramps down to the banks.
 */
function bridgeStone(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, bed = el.bed ?? -4;
  bag.add('limestone', box(x0, y - 0.7, z0, x1, y, z1));
  col.floor(el.rect, y);
  // piers every 14 m or so, with cutwaters upstream and down
  const n = Math.max(2, Math.round((x1 - x0) / 14));
  for (let k = 1; k < n; k++) {
    const x = x0 + (x1 - x0) * k / n;
    bag.add('limestone', box(x - 1.1, bed, z0 + 0.3, x + 1.1, y - 0.7, z1 - 0.3));
    bag.add('limestone', fromTriangles(prism([[x - 1.1, z0 + 0.3], [x + 1.1, z0 + 0.3], [x, z0 - 1.2]], bed, y - 1.6)));
    bag.add('limestone', fromTriangles(prism([[x + 1.1, z1 - 0.3], [x - 1.1, z1 - 0.3], [x, z1 + 1.2]], bed, y - 1.6)));
  }
  // the parapets along the deck and the ramps
  const par = (ax, bx, ya, yb, z) => {
    const t = [], h = 0.9, th = 0.4, zz0 = z - th / 2, zz1 = z + th / 2;
    const q = [[ax, ya, zz0], [bx, yb, zz0], [bx, yb, zz1], [ax, ya, zz1]];
    const u = q.map(([px, py, pz]) => [px, py + h, pz]);
    quadT(t, q[0], q[1], u[1], u[0]); quadT(t, q[2], q[3], u[3], u[2]); quadT(t, u[0], u[1], u[2], u[3]);
    quadT(t, q[3], q[0], u[0], u[3]); quadT(t, q[1], q[2], u[2], u[1]);
    bag.add('limestone', fromTriangles(t));
    col.segment([ax, z], [bx, z], th, Math.min(ya, yb) - 0.5, Math.max(ya, yb) + h);
  };
  for (const z of [z0 + 0.2, z1 - 0.2]) par(x0, x1, y, y, z);
  for (const [r, ya, yb, dir] of el.ramps) {
    const [rx0, rz0, rx1, rz1] = r;
    const y0 = dir === 'e' ? ya : yb, y1 = dir === 'e' ? yb : ya;          // heights at rx0 and rx1
    const t = [];
    quadT(t, [rx0, y0, rz0], [rx0, y0, rz1], [rx1, y1, rz1], [rx1, y1, rz0]);
    quadT(t, [rx0, y0, rz0], [rx1, y1, rz0], [rx1, Math.min(y0, y1) - 1.5, rz0], [rx0, Math.min(y0, y1) - 1.5, rz0]);
    quadT(t, [rx0, y0, rz1], [rx0, Math.min(y0, y1) - 1.5, rz1], [rx1, Math.min(y0, y1) - 1.5, rz1], [rx1, y1, rz1]);
    bag.add('limestone', fromTriangles(t));
    col.ramp(r, Math.min(ya, yb), Math.max(ya, yb), dir);
    for (const z of [rz0 + 0.2, rz1 - 0.2]) par(rx0, rx1, y0, y1, z);
  }
}
function quadT(t, a, b, c, d) { t.push(...a, ...b, ...c, ...a, ...c, ...d, ...a, ...c, ...b, ...a, ...d, ...c); }   // both faces
function prism(poly, y0, y1) {
  const t = [];
  for (let i = 0; i < poly.length; i++) { const [ax, az] = poly[i], [bx, bz] = poly[(i + 1) % poly.length]; quadT(t, [ax, y0, az], [bx, y0, bz], [bx, y1, bz], [ax, y1, az]); }
  t.push(poly[0][0], y1, poly[0][1], poly[2][0], y1, poly[2][1], poly[1][0], y1, poly[1][1], poly[0][0], y1, poly[0][1], poly[1][0], y1, poly[1][1], poly[2][0], y1, poly[2][1]);
  return t;
}

/**
 * A well in a square: a round curb of stone (or brick), two posts and a beam with a pulley, a
 * bucket on the rim. { at [x, z], y, mat (curb), timber }
 */
function well(el, { bag, col }) {
  const [x, z] = el.at, y = el.y, mat = el.mat || 'limestone', tim = el.timber || 'timber';
  bag.add(mat, lathe([[0.95, -0.4], [0.95, 0.85], [0.7, 0.85], [0.7, 0.1], [0.001, 0.1]], 20, null, x, y, z));
  bag.add('water', lathe([[0.69, 0.05], [0.001, 0.05]], 20, null, x, y, z));
  for (const s of [-1, 1]) bag.add(tim, box(x + s * 0.85 - 0.08, y + 0.85, z - 0.08, x + s * 0.85 + 0.08, y + 2.5, z + 0.08));
  bag.add(tim, box(x - 1.0, y + 2.4, z - 0.07, x + 1.0, y + 2.55, z + 0.07));
  bag.add('timber', lathe([[0.14, 0], [0.16, 0.28], [0.001, 0.28]], 10, null, x + 0.55, y + 0.85, z + 0.55));
  col.circle(x, z, 0.95, y - 0.4, y + 0.85);
}

/** A low mud-brick wall (garden, animal pen). */
function wallLow(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect;
  bag.add('mudbrick', box(x0, el.y - 0.5, z0, x1, el.y + el.h, z1));
  col.rect(el.rect, el.y - 0.5, el.y + el.h);
}

registerStyle('vernacular', { trim: () => {}, opening: () => {}, column: () => {}, elements: { house_egypt: houseEgypt, house_mamluk: houseMamluk, house_tiled: houseTiled, house_domed: houseDomed, house_timber: houseTimber, house_china: houseChina, house_japan: houseJapan, house_india: houseIndia, house_rouergue: houseRouergue, well, bridge_stone: bridgeStone, wall_low: wallLow }, objects: {} });
