// The houses of Florence about 1480 (docs/settlements/florence.md §5): one builder, four kinds.
//   casa     — a narrow town house of three or four storeys, a door and small barred windows below, arched
//              windows with stone surrounds above, a wide eave on timber brackets under a low tiled roof,
//              now and then a jettied upper floor on corbels (sporto) or a roof loggia (altana);
//   bottega  — the same with its ground storey opened in wide round or pointed arches of pietraforte: a
//              shop, the shutter let down as a counter and propped up as an awning over it, the goods of its
//              trade on the counter and hung from the arch, a painted sign on an iron arm;
//   palazzo  — a rusticated palace of pietraforte: a portal with great voussoirs, small barred windows, the
//              stone bench, rings and a torch-holder, smooth ashlar above with paired windows under round
//              arches, a deep cornice on corbels;
//   torre    — a tower house of rough stone, six or seven storeys, narrow slit windows, the top floor jettied
//              out on corbels under a hipped roof.
// { rect, front, storeys, kind, trade, plaster, seed, exposed, y, foot, simple }

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { faceFrame, Local, ext, archOutline, archRise, voussoirs, wrect, dropBack } from './face.js';
import { rusticate } from './signoria.js';
import { openGround, openUpper, doorAt } from './casa-open.js';

const PF = 'limestone_yellow', SER = 'pietra_serena', W = 'wood_dark', O = 'opening', IR = 'iron', TM = 'timber', ROOF = 'roof_tile';
const WALLS = ['stucco_pale', 'stucco_siena', 'stucco_ochre', 'stucco_cream', 'stucco_warm', 'stucco_rome'];
const SHUT = ['shutter_brown', 'shutter_brown', 'wood_dark', 'shutter_grey'];
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const pick = (rand, l) => l[Math.floor(rand() * l.length)];

// ── the budget (DESIGN §8): what no one can see is not built. A dark opening is only its front face (the
// reveal is inside the wall's thickness and the stone ring round it); a stone ring has no back against the wall;
// a piece standing on the wall has no face toward it.
/** An outline as one flat face at depth d (the front cap of an extrusion). */
function fl(pts, d) {
  const g = ext(pts, [], d - 0.01, d), P = g.attributes.position.array, N = g.attributes.normal.array, kp = [], kn = [];
  for (let i = 0; i < P.length; i += 9) { if (N[i + 2] < 0.99 || N[i + 5] < 0.99 || N[i + 8] < 0.99) continue; for (let k = 0; k < 9; k++) { kp.push(P[i + k]); kn.push(N[i + k]); } }
  const m = new BufferGeometry();
  m.setAttribute('position', new Float32BufferAttribute(kp, 3)); m.setAttribute('normal', new Float32BufferAttribute(kn, 3));
  return m;
}
/** A rectangle u0..u1 × y0..y1 as a flat face at depth d. */
const flr = (u0, y0, u1, y1, d) => fl([[u0, y0], [u1, y0], [u1, y1], [u0, y1]], d);
/** An extrusion without its back cap (it ends against the wall). */
const xr = (pts, holes, d0, d1) => dropBack(ext(pts, holes, d0, d1));
/** A Local whose boxes lose the face toward the wall when they stand within a hand of it. */
class Fl extends Local {
  box(mat, u0, y0, d0, u1, y1, d1) {
    const a = Math.min(d0, d1), g = box(Math.min(u0, u1), Math.min(y0, y1), a, Math.max(u0, u1), Math.max(y0, y1), Math.max(d0, d1));
    const inside = this.L === undefined || (Math.min(u0, u1) >= -1e-6 && Math.max(u0, u1) <= this.L + 1e-6);
    return this.add(mat, this.noBack && inside && a >= -0.06 && a <= 0.12 ? dropBack(g) : g);
  }
}

/** A hipped roof over R from height ye, the slopes at `pitch` degrees, overhang o; returns its rise. */
function hip(bag, mat, R, ye, pitch, o) {
  const ex0 = R[0] - o, ez0 = R[1] - o, ex1 = R[2] + o, ez1 = R[3] + o, wx = ex1 - ex0, wz = ez1 - ez0, rise = Math.min(wx, wz) / 2 * Math.tan(pitch * Math.PI / 180), t = [];
  if (wx >= wz) {
    const r0 = [ex0 + wz / 2, ye + rise, (ez0 + ez1) / 2], r1 = [ex1 - wz / 2, ye + rise, (ez0 + ez1) / 2];
    t.push(ex0, ye, ez0, ...r0, ...r1, ex0, ye, ez0, ...r1, ex1, ye, ez0, ex1, ye, ez1, ...r1, ...r0, ex1, ye, ez1, ...r0, ex0, ye, ez1, ex0, ye, ez1, ...r0, ex0, ye, ez0, ex1, ye, ez0, ...r1, ex1, ye, ez1);
  } else {
    const r0 = [(ex0 + ex1) / 2, ye + rise, ez0 + wx / 2], r1 = [(ex0 + ex1) / 2, ye + rise, ez1 - wx / 2];
    t.push(ex1, ye, ez0, ...r0, ...r1, ex1, ye, ez0, ...r1, ex1, ye, ez1, ex0, ye, ez1, ...r1, ...r0, ex0, ye, ez1, ...r0, ex0, ye, ez0, ex0, ye, ez0, ...r0, ex1, ye, ez0, ex1, ye, ez1, ...r1, ex0, ye, ez1);
  }
  for (let i = 0; i < t.length; i += 9) { const ux = t[i + 3] - t[i], uz = t[i + 5] - t[i + 2], vx = t[i + 6] - t[i], vz = t[i + 8] - t[i + 2]; if (uz * vx - ux * vz < 0) for (let k = 0; k < 3; k++) { const q = t[i + 3 + k]; t[i + 3 + k] = t[i + 6 + k]; t[i + 6 + k] = q; } }
  bag.add(mat, fromTriangles(t));
  return rise;
}

/** The goods of a shop on its counter and in its arch (local frame: u across, y up, d out into the street). */
function goods(Lc, trade, u0, u1, ys, rand, sign) {
  const w = u1 - u0, c = (u0 + u1) / 2, put = (mat, a, b, y0, y1, d0, d1) => Lc.box(mat, a, y0, d0, b, y1, d1);
  const cy = 1.02;                                                   // the counter's top
  if (trade === 'cloth') {
    // bolts of cloth folded in stacks on the counter, lengths hung over a rail from the arch
    const cl = ['cloth_red', 'cloth_blue', 'cloth_green', 'cloth_ochre', 'cloth_white', 'cloth_indigo'];
    for (let k = 0; k < 3; k++) { const u = u0 + 0.35 + k * (w - 0.7) / 2.6; for (let j = 0; j < 3 + (k % 2); j++) put(cl[(k * 2 + j) % cl.length], u - 0.28, u + 0.28, cy + j * 0.1, cy + j * 0.1 + 0.09, 0.15, 0.55); }
    put(IR, u0 + 0.1, u1 - 0.1, ys - 0.04, ys + 0.0, 0.3, 0.34);
    for (let k = 0; k < 4; k++) { const u = u0 + 0.3 + k * (w - 0.6) / 3; put(cl[(k + 2) % cl.length], u - 0.2, u + 0.2, ys - 1.05, ys - 0.04, 0.3, 0.34); }
  } else if (trade === 'wine') {
    // straw-covered flasks on the counter and a barrel inside the door
    for (let k = 0; k < 5; k++) { const u = u0 + 0.3 + k * (w - 0.6) / 4; Lc.add('wicker', lathe([[0.001, 0], [0.07, 0.02], [0.09, 0.12], [0.07, 0.26], [0.025, 0.32], [0.03, 0.36], [0.001, 0.36]], 6, null, u, cy, 0.3)); }
    Lc.add('timber', lathe([[0.34, 0], [0.4, 0.3], [0.34, 0.7], [0.001, 0.7]], 8, null, u0 + 0.5, 0, -0.3));
  } else if (trade === 'bread') {
    for (let k = 0; k < 7; k++) { const u = u0 + 0.3 + (k % 4) * (w - 0.6) / 3, d = 0.25 + Math.floor(k / 4) * 0.28; Lc.add('hide_tan', lathe([[0.001, 0], [0.13, 0.015], [0.15, 0.06], [0.1, 0.11], [0.001, 0.12]], 7, null, u, cy, d)); }
    put('wood_painted', u0 + 0.2, u1 - 0.2, cy + 0.01, cy + 0.04, 0.12, 0.62);
  } else if (trade === 'spice') {
    for (let k = 0; k < 4; k++) { const u = u0 + 0.35 + k * (w - 0.7) / 3; Lc.add('sacking', lathe([[0.001, 0], [0.2, 0.01], [0.22, 0.2], [0.13, 0.36], [0.001, 0.36]], 7, null, u, cy, 0.3)); }
    for (let k = 0; k < 5; k++) { const u = u0 + 0.3 + k * (w - 0.6) / 4; Lc.add('terracotta', lathe([[0.001, 0], [0.07, 0.01], [0.09, 0.1], [0.06, 0.18], [0.001, 0.18]], 6, null, u, cy + 0.38, 0.22)); }
  } else if (trade === 'leather') {
    for (let k = 0; k < 4; k++) { const u = u0 + 0.3 + k * (w - 0.6) / 3; put(k % 2 ? 'hide_brown' : 'hide_tan', u - 0.22, u + 0.22, ys - 1.7, ys - 0.04, 0.3, 0.33); }
    put('hide_black', u0 + 0.3, u0 + 0.9, cy, cy + 0.08, 0.2, 0.6);
  } else if (trade === 'smith') {
    for (let k = 0; k < 5; k++) { const u = u0 + 0.3 + k * (w - 0.6) / 4; Lc.add(IR, lathe([[0.001, 0], [0.12, 0.02], [0.14, 0.12], [0.1, 0.2], [0.001, 0.2]], 6, null, u, ys - 0.9 - (k % 2) * 0.3, 0.3)); put(IR, u - 0.01, u + 0.01, ys - 0.7 - (k % 2) * 0.3, ys - 0.04, 0.3, 0.32); }
    put(IR, c - 0.25, c + 0.25, cy, cy + 0.16, 0.2, 0.45);
  } else if (trade === 'goldsmith') {
    for (let k = 0; k < 4; k++) { const u = u0 + 0.35 + k * (w - 0.7) / 3; Lc.add('gilt_bronze', lathe([[0.001, 0], [0.06, 0.01], [0.04, 0.12], [0.07, 0.16], [0.001, 0.16]], 6, null, u, cy, 0.3)); }
    put('cloth_red', u0 + 0.2, u1 - 0.2, cy, cy + 0.02, 0.15, 0.55);
  } else if (trade === 'woodwork') {
    put('wood_painted', u0 + 0.3, u0 + 1.0, 0.03, 0.6, 0.1, 0.55); put('wood_dark', u0 + 0.3, u0 + 1.0, 0.6, 0.66, 0.08, 0.58);
    for (let k = 0; k < 3; k++) { const u = u1 - 0.35 - k * 0.3; put('timber', u - 0.09, u + 0.09, cy, cy + 0.34, 0.25, 0.43); }
  } else {
    // candles: bundles of wax tapers hung and tied, a tray of lamps on the counter
    for (let k = 0; k < 6; k++) { const u = u0 + 0.3 + k * (w - 0.6) / 5; put('plaster_white', u - 0.02, u + 0.02, ys - 0.75, ys - 0.04, 0.3, 0.34); put('plaster_white', u + 0.05, u + 0.09, ys - 0.7, ys - 0.04, 0.3, 0.34); }
    put('plaster_white', u0 + 0.3, u1 - 0.3, cy, cy + 0.05, 0.15, 0.5);
  }
  void rand; void sign;
}

/** The painted board of a shop on its iron arm, hanging at the arch's side. */
function sign(Lc, u, ys, trade, rand) {
  const col = { cloth: 'cloth_red', wine: 'cloth_green', bread: 'cloth_ochre', spice: 'cloth_ochre', leather: 'cloth_brown', smith: 'iron', goldsmith: 'gilt_bronze', woodwork: 'cloth_blue', candles: 'cloth_white' }[trade] ?? 'cloth_red';
  Lc.box(IR, u - 0.02, ys + 0.5, 0.0, u + 0.02, ys + 0.54, 0.95);
  Lc.box(IR, u - 0.015, ys + 0.1, 0.9, u + 0.015, ys + 0.5, 0.93);
  Lc.box(col, u - 0.03, ys - 0.45, 0.85, u + 0.03, ys + 0.1, 1.12);
  // the emblem painted on both faces: the trade's tool or ware in a contrasting colour
  for (const sg of [-1, 1]) {
    const a = sg < 0 ? u - 0.045 : u + 0.03, b = sg < 0 ? u - 0.03 : u + 0.045, e = (m, y0, y1, d0, d1) => Lc.box(m, a, ys - 0.45 + y0, 0.85 + d0, b, ys - 0.45 + y1, 0.85 + d1);
    if (trade === 'cloth') { e('cloth_white', 0.12, 0.45, 0.1, 0.12); e('cloth_white', 0.12, 0.45, 0.15, 0.17); e('cloth_white', 0.25, 0.3, 0.04, 0.23); }
    else if (trade === 'wine') { e('cloth_green', 0.15, 0.45, 0.07, 0.2); e('cloth_white', 0.45, 0.5, 0.12, 0.16); }
    else if (trade === 'bread') { e('hide_tan', 0.2, 0.34, 0.05, 0.22); e('hide_tan', 0.3, 0.4, 0.08, 0.19); }
    else if (trade === 'spice') { e('terracotta', 0.12, 0.3, 0.08, 0.19); e('plaster_white', 0.3, 0.46, 0.05, 0.22); }
    else if (trade === 'leather') { e('hide_black', 0.1, 0.46, 0.06, 0.21); e('hide_tan', 0.15, 0.4, 0.09, 0.18); }
    else if (trade === 'smith') { e('cloth_black', 0.12, 0.3, 0.04, 0.23); e('cloth_black', 0.3, 0.38, 0.0, 0.27); e('cloth_black', 0.38, 0.46, 0.04, 0.12); }
    else if (trade === 'goldsmith') { e('gilt_bronze', 0.1, 0.16, 0.08, 0.2); e('gilt_bronze', 0.16, 0.3, 0.12, 0.16); e('gilt_bronze', 0.3, 0.46, 0.05, 0.23); }
    else if (trade === 'woodwork') { e('plaster_white', 0.25, 0.32, 0.02, 0.26); for (let k = 0; k < 5; k++) e('plaster_white', 0.18, 0.25, 0.03 + k * 0.05, 0.045 + k * 0.05); }
    else { e('plaster_white', 0.1, 0.42, 0.11, 0.15); e('cloth_ochre', 0.42, 0.5, 0.11, 0.15); }
  }
  void rand;
}

/** A window under a round arch: its dark, the stone ring round it, the sill, the shutters open on either side (or shut). */
function win(Lc, uc, s, w, hs, rand, shut, lite, shape = 'round') {
  const ys = s + hs, n = lite ? 3 : 4;
  if (shape === 'rect') {
    // a plain rectangular window in a stone architrave under a flat lintel (the later quattrocento houses)
    Lc.add(O, flr(uc - w / 2, s, uc + w / 2, ys, 0.02));
    for (const sg of [-1, 1]) Lc.box(SER, uc + sg * (w / 2 + 0.09) - 0.09, s - 0.1, -0.03, uc + sg * (w / 2 + 0.09) + 0.09, ys + 0.12, 0.1);
    Lc.box(SER, uc - w / 2 - 0.2, ys, -0.03, uc + w / 2 + 0.2, ys + 0.2, 0.14); Lc.box(SER, uc - w / 2 - 0.2, s - 0.2, -0.03, uc + w / 2 + 0.2, s - 0.1, 0.2);
  } else {
    // a round arch or, in the older Gothic houses, a pointed one
    Lc.add(O, flr(uc - w / 2, s, uc + w / 2, ys, 0.02));
    Lc.add(SER, xr(archOutline(uc, s - 0.12, w + 0.34, ys, shape, 2), [archOutline(uc, s - 0.12 + 0.0, w, ys, shape, 2)], -0.03, 0.1));
  }
  if (shape !== 'rect') Lc.box(SER, uc - w / 2 - 0.22, s - 0.2, -0.03, uc + w / 2 + 0.22, s - 0.1, 0.2);
  if (rand() < 0.28) { Lc.box(shut, uc - w / 2, s, 0.03, uc + w / 2, ys, 0.07); return; }               // the shutters closed
  if (!lite) {
    Lc.add(W, flr(uc - 0.025, s, uc + 0.025, ys + 0.1, 0.06)); Lc.add(W, flr(uc - w / 2, s + hs * 0.62, uc + w / 2, s + hs * 0.62 + 0.05, 0.06));      // the casement's mullion and transom
    for (const sg of [-1, 1]) Lc.add(shut, flr(uc + sg * (w / 2 + 0.17), s, uc + sg * (w / 2 + 0.17 + 0.42), ys - 0.1, 0.075));
  }
}
/** A pair of windows under one round arch (a bifora), the colonnette between: for the palace. */
function bif(Lc, uc, s, w, hs, lite) {
  const ys = s + hs, n = lite ? 3 : 4, lw = (w - 0.3) / 2;
  Lc.add(O, fl(archOutline(uc, s, w, ys, 'round', n), 0.02));
  Lc.add(SER, xr(archOutline(uc, s - 0.12, w + 0.44, ys + 0.12, 'round', n), [archOutline(uc, s - 0.12, w, ys, 'round', n)], -0.03, 0.14));
  void lw;
  Lc.box(SER, uc - 0.06, s, 0.0, uc + 0.06, ys - 0.45, 0.14);
  Lc.box(SER, uc - w / 2 - 0.25, s - 0.2, -0.03, uc + w / 2 + 0.25, s - 0.1, 0.3);
  if (!lite) { Lc.box(W, uc - 0.02, s, 0.0, uc + 0.02, ys - 0.5, 0.04); }
}

export function casa(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, foot = el.foot ?? y - 0.3;
  const kind = el.kind ?? 'casa', simple = !!el.simple, f = el.front || 's', n = Math.max(2, el.storeys ?? 3);
  const pal = kind === 'palazzo', tow = kind === 'torre', open = !!el.open && !simple && !pal && !tow, shop = kind === 'bottega' && !open;
  // the storeys' heights
  const hs = [];
  for (let i = 0; i < n; i++) hs.push(pal ? [6.4, 5.4, 4.5][Math.min(i, 2)] : tow ? (i === 0 ? 4.6 : 3.3 + rand() * 0.3) : i === 0 ? (shop ? 4.5 : 4.1) : 3.5 + rand() * 0.4);
  const ys = [0]; for (const h of hs) ys.push(ys[ys.length - 1] + h);
  const H = ys[n], wall = pal || tow || !el.plaster ? PF : pick(rand, WALLS), shut = pick(rand, SHUT);
  const jet = !pal && !tow && !el.open && n >= 3 && rand() < 0.28 ? 0.7 : 0;
  // the house's manner: old Gothic (pointed windows), quattrocento (round, a bifora on the piano nobile), plain (rectangular architraves);
  // quoins at the corners and a painted frieze under the eave on some
  const wr = rand(), manner = wr < 0.3 ? 'gothic' : wr < 0.62 ? 'quatt' : wr < 0.85 ? 'round' : 'rect', quoins = el.plaster && rand() < 0.4, frieze = !pal && !tow && rand() < 0.16;
  const R = [x0, z0, x1, z1];                                                      // the upper floors' rectangle
  if (jet) { if (f === 's') R[3] += jet; else if (f === 'n') R[1] -= jet; else if (f === 'e') R[2] += jet; else R[0] -= jet; }
  const top = tow ? n - 1 : n;                                                     // a tower's last floor juts out on corbels
  const TJ = tow ? 0.55 : 0, RT = [x0 - TJ, z0 - TJ, x1 + TJ, z1 + TJ];
  // the body: the stone ground storey and the wall above
  const gh = ys[1];
  if (open) {
    const stairs = n >= 2 && !jet;
    openGround(bag, col, { ...el, use: el.use ?? (kind === 'bottega' ? el.trade : 'home') }, { wall: PF, y, gh, f, rand, foot, stairs });
    if (stairs) {
      openUpper(bag, col, el, { y, gh, top2: ys[2], f, rand });
      if (el.plaster) { const t = 0.4, [a0, b0, a1, b1] = R, m = wall; for (const r of [[a0, b0, a1, b0 + t], [a0, b1 - t, a1, b1], [a0, b0, a0 + t, b1], [a1 - t, b0, a1, b1]]) bag.add(m, box(r[0] - 0.01, y + gh, r[1] - 0.01, r[2] + 0.01, y + ys[2], r[3] + 0.01)); }
      if (n > 2) bag.add(el.plaster ? wall : PF, box(R[0], y + ys[2] - 0.02, R[1], R[2], y + H, R[3]));
      else bag.add(el.plaster ? wall : PF, box(R[0], y + H - 0.02, R[1], R[2], y + H, R[3]));
    } else bag.add(el.plaster ? wall : PF, box(R[0], y + gh - 0.02, R[1], R[2], y + H, R[3]));
  } else if (pal || tow || !el.plaster) bag.add(PF, box(x0, foot - 0.6, z0, x1, y + (tow ? ys[top] : H), z1));
  else { bag.add(PF, box(x0 - 0.04, foot - 0.6, z0 - 0.04, x1 + 0.04, y + gh, z1 + 0.04)); bag.add(wall, box(R[0], y + (jet ? gh : gh - 0.02), R[1], R[2], y + H, R[3])); }
  if (tow) bag.add(PF, box(RT[0], y + ys[top], RT[1], RT[2], y + H, RT[3]));
  if (!open) col.rect(el.rect, foot - 0.6, y + H);
  else col.rect(R, y + gh, y + H);
  const wallTop = y + H;

  // ── the faces
  const faces = simple ? [] : (el.exposed ?? [f]);
  for (const face of faces) {
    const main = face === f;
    const Rg = el.rect, Ru = jet && !tow ? R : el.rect;
    const { M: FMg, L: Lg } = faceFrame(Rg, face, y), { M: FMu, L: Lu } = faceFrame(Ru, face, y);
    const Lc = new Fl(); Lc.noBack = true; Lc.L = Lg;
    Lc.put = (u0, y0, d0, u1, y1, d1) => Lc.box(PF, u0, y0, d0, u1, y1, d1);
    const Lu2 = new Fl(); Lu2.noBack = true; Lu2.L = Lu;
    // upper floors: windows on every exposed face
    const nbU = Math.max(0, Math.round((Lu - 0.8) / (pal ? 4.4 : tow ? 4 : 3.1)));
    const bu = (i) => (i + 0.5) * Lu / nbU;
    for (let s = 1; s < top && nbU > 0; s++) {
      if (!main && rand() < 0.2) continue;
      for (let i = 0; i < nbU; i++) {
        if (tow) { if (rand() < 0.45) continue; const u = bu(i); Lu2.add(O, fl(archOutline(u, ys[s] + 1.2, 0.34, ys[s] + 2.3, 'round', 3), 0.02)); Lu2.box(PF, u - 0.3, ys[s] + 1.1, -0.03, u + 0.3, ys[s] + 1.2, 0.12); continue; }
        if (pal) { bif(Lu2, bu(i), ys[s] + 1.0, 2.0, s === 1 ? 2.4 : 1.9, simple); continue; }
        const wdt = s === 1 ? 1.05 : 0.95, sill = ys[s] + (s === 1 ? 0.95 : 0.9), hsw = s === 1 ? 1.55 : 1.35;
        if (manner === 'quatt' && s === 1 && Lu > 4.5 && !simple) { bif(Lu2, bu(i), ys[s] + 0.9, 1.75, 1.95, false); continue; }
        win(Lu2, bu(i), sill, wdt, hsw, rand, shut, false, manner === 'gothic' ? 'pointed' : manner === 'rect' ? 'rect' : 'round');
      }
    }
    // the tower's top floor: windows (shuttered) between the corbels
    if (tow) { for (let i = 0; i < nbU; i++) { const u = bu(i); Lu2.box('wood_dark', u - 0.4, ys[top] + 0.9, -0.03 - TJ, u + 0.4, ys[top] + 2.2, 0.02 - TJ); } }
    if (quoins) for (let s = 1; s < top; s++) for (let k = 0, yy = ys[s]; yy < ys[s + 1] - 0.4; k++, yy += 0.5) { const wq = k % 2 ? 0.7 : 0.45; Lu2.box(SER, 0, yy, -0.03, wq, yy + 0.44, 0.07); Lu2.box(SER, Lu - (k % 2 ? 0.45 : 0.7), yy, -0.03, Lu, yy + 0.44, 0.07); }
    if (frieze) { Lu2.box('plaster_ochre', 0, H - 1.05, -0.03, Lu, H - 0.62, 0.03); for (let u = 0.4; u < Lu - 0.3; u += 0.8) Lu2.box(wall, u, H - 1.0, 0.03, u + 0.4, H - 0.67, 0.045); }
    // string courses at the floors, the plinth, the eave
    if (!pal) for (let s = 1; s < top; s++) Lu2.box(SER, -0.05, ys[s] - 0.1, -0.03, Lu + 0.05, ys[s] + 0.06, 0.12);
    if (main && jet) { for (let u = 0.4; u < Lg - 0.2; u += 0.9) { Lc.box(W, u - 0.09, gh - 0.55, -0.02, u + 0.09, gh, 0.5 + 0.0); Lc.box(TM, u - 0.1, gh - 0.55 + 0.45, -0.02, u + 0.1, gh, jet); } }
    if (tow && main) for (let u = 0.3; u < Lu - 0.2; u += 0.8) { Lu2.box(PF, u - 0.12, ys[top] - 0.5, -0.03, u + 0.12, ys[top], TJ); }

    // ground storey: only the street front
    if (main) {
      const L = Lg, holes = [];
      if (pal) {
        // the portal with its voussoirs, the barred windows high in the wall, the bench, the rings and the torch-holder
        const pw = 3.0, pu = L * (0.3 + rand() * 0.4), pys = 3.6;
        holes.push({ u0: pu - pw / 2 - 0.85, u1: pu + pw / 2 + 0.85, y0: 0.2, y1: pys + pw / 2 + 0.87, hw: (yy) => (yy <= pys ? pw / 2 + 0.04 : Math.sqrt(Math.max(0, (pw / 2 + 0.85) ** 2 - (yy - pys) ** 2)) + 0.02) });
        Lc.add(O, fl(archOutline(pu, 0.15, pw, pys, 'round', 5), 0.01));
        for (const sg of [-1, 1]) Lc.box(W, pu + sg * 0.02, 0.15, 0, pu + sg * pw / 2 + (sg < 0 ? 0.04 : -0.04), pys - 0.1, 0.1);
        voussoirs(Lc, PF, pu, pys, pw / 2, pw / 2 + 0.85, -0.04, 0.34, 9, 0.06);
        Lc.box(PF, pu - pw / 2 - 1.0, -0.1, 0.1, pu + pw / 2 + 1.0, 0.12, 1.0); col.rect(wrect(FMg, pu - pw / 2 - 1.0, 0.1, pu + pw / 2 + 1.0, 1.0), y, y + 0.12);
        const nw = Math.max(2, Math.round(L / 4.4));
        for (let i = 0; i < nw; i++) {
          const u = (i + 0.5) * L / nw; if (Math.abs(u - pu) < pw / 2 + 1.6) continue;
          holes.push({ u0: u - 0.55, u1: u + 0.55, y0: 2.3, y1: 3.5 });
          Lc.add(O, fl([[u - 0.5, 2.35], [u + 0.5, 2.35], [u + 0.5, 3.45], [u - 0.5, 3.45]], 0.01));
          Lc.box(PF, u - 0.62, 2.15, -0.04, u + 0.62, 2.35, 0.3);
          for (let k = -1; k <= 1; k++) Lc.box(IR, u + k * 0.3 - 0.02, 2.35, 0.02, u + k * 0.3 + 0.02, 3.45, 0.06);
          // the stone bench under it
          Lc.box(PF, u - 1.4 > 0 ? u - 1.4 : 0.1, -0.2, 0.3, Math.min(L - 0.1, u + 1.4), 0.48, 0.8); col.rect(wrect(FMg, Math.max(0.1, u - 1.4), 0.3, Math.min(L - 0.1, u + 1.4), 0.8), y, y + 0.48);
        }
        if (!simple) { for (const sg of [-1, 1]) Lc.add(IR, lathe([[0.1, 0], [0.12, 0.02], [0.001, 0.02]], 6, null, 0, 0, 0).rotateX(Math.PI / 2).translate(pu + sg * (pw / 2 + 1.3), 2.0, 0.05)); }
        Lc.box(IR, 0.28, 3.0, 0.0, 0.32, 3.8, 0.9); Lc.box(IR, 0.28, 3.76, 0.0, 0.34, 3.82, 0.95); Lc.add('lamp_glass', lathe([[0.001, 0], [0.12, 0.05], [0.14, 0.25], [0.001, 0.3]], 6, null, 0.3, 3.5, 0.82));   // the torch-holder at the corner
        rusticate(Lc, 0, L, 0.15, ys[1] - 0.45, holes, 0.2, rand, 0.8);
        Lc.box(PF, -0.2, ys[1] - 0.45, -0.04, L + 0.2, ys[1] + 0.1, 0.24);
        // upper floors' ashlar: courses scored by a string course under the cornice and the piano nobile's sills
        Lu2.box(PF, -0.2, ys[2] - 0.35, -0.04, Lu + 0.2, ys[2] - 0.05, 0.22);
      } else if (shop) {
        // the arches of the shop, the door at one end
        const aw0 = 2.7 + rand() * 0.5, doorW = 1.35, pt = rand() < 0.4 ? 'pointed' : 'round';
        let nb = Math.max(1, Math.floor((L - doorW - 0.9) / (aw0 + 0.95)));
        let aw = Math.min(aw0, (L - doorW - 0.8 * (nb + 1)) / nb);
        if (aw < 1.8 && nb > 1) { nb--; aw = Math.min(aw0, (L - doorW - 0.8 * (nb + 1)) / nb); }
        const pier = (L - doorW - nb * aw) / (nb + 1), doorFirst = rand() < 0.5;
        let u = pier;
        const items = Array.from({ length: nb + 1 }, (_, i) => (i === (doorFirst ? 0 : nb) ? 'door' : 'arch'));
        const rise = archRise(aw, pt), ysp = Math.min(2.25, gh - 0.55 - rise);
        for (const it of items) {
          if (it === 'door') {
            const c = u + doorW / 2, dh = 2.2;
            Lc.add(O, fl(archOutline(c, 0.15, doorW, dh, 'round', 4), 0.01));
            Lc.add(SER, xr(archOutline(c, 0.0, doorW + 0.4, dh, 'round', 4), [archOutline(c, 0.15, doorW, dh, 'round', 4)], -0.03, 0.12));
            Lc.box(W, c - doorW / 2, 0.15, 0.0, c - doorW / 2 + 0.06, dh, 0.7 * doorW); Lc.box(SER, c - doorW / 2 - 0.3, -0.08, 0.1, c + doorW / 2 + 0.3, 0.1, 0.7);
            u += doorW + pier; continue;
          }
          const c = u + aw / 2, bot = 0.1;
          Lc.add(O, fl(archOutline(c, bot, aw, ysp, pt, 5), 0.01));
          // the arch's stone ring, its two jambs, the counter (the shutter let down) on its legs, the awning (the other shutter propped up)
          Lc.add(PF, xr(archOutline(c, 0.0, aw + 0.5, ysp, pt, 5), [archOutline(c, bot, aw, ysp, pt, 5)], -0.03, 0.2));
          Lc.box(W, c - aw / 2, 0.92, -0.03, c + aw / 2, 1.0, 0.7); Lc.box(W, c - aw / 2 + 0.05, 0.0, 0.5, c - aw / 2 + 0.1, 0.92, 0.55); Lc.box(W, c + aw / 2 - 0.1, 0.0, 0.5, c + aw / 2 - 0.05, 0.92, 0.55);
          Lc.box(W, c - aw / 2, 0.1, -0.02, c + aw / 2, 0.92, 0.04);
          col.rect(wrect(FMg, c - aw / 2, 0, c + aw / 2, 0.7), y, y + 1.0);
          const aw2 = box(c - aw / 2 + 0.06, -0.03, 0, c + aw / 2 - 0.06, 0.03, 1.0); aw2.rotateX(-0.45); aw2.translate(0, ysp - 0.3, 0.1); Lc.add(W, aw2);
          Lc.box(IR, c - aw / 2 + 0.06, ysp - 0.34, 0.08, c - aw / 2 + 0.08, ysp - 0.3, 0.1);
          if (!simple) goods(Lc, el.trade, c - aw / 2 + 0.05, c + aw / 2 - 0.05, ysp, rand, pt);
          if (!simple && it === 'arch' && (nb === 1 || rand() < 0.8)) sign(Lc, c + aw / 2 + pier * 0.4, ysp, el.trade, rand);
          u += aw + pier;
        }
      } else {
        // a house: the door, a small barred window or two, sometimes the stone bench
        const doorW = 1.35, du0 = L * (0.2 + rand() * 0.6), du = open ? doorAt(L) : du0, dh = 2.25;
        if (!open) Lc.add(O, fl(archOutline(du, 0.15, doorW, dh, 'round', 4), 0.01));
        Lc.add(SER, xr(archOutline(du, 0.0, doorW + 0.4, dh, 'round', 4), [archOutline(du, 0.15, doorW, dh, 'round', 4)], -0.03, 0.12));
        if (!open) Lc.box(W, du - doorW / 2, 0.15, 0.0, du - doorW / 2 + 0.06, dh, 0.7 * doorW); Lc.box(SER, du - doorW / 2 - 0.3, -0.08, 0.1, du + doorW / 2 + 0.3, 0.1, 0.7);
        const nw = Math.max(0, Math.round((L - 3) / 3.1));
        for (let i = 0; i < nw; i++) {
          const u = (i + 0.5) * L / nw; if (Math.abs(u - du) < 1.6) continue;
          Lc.add(O, fl([[u - 0.35, 1.6], [u + 0.35, 1.6], [u + 0.35, 2.5], [u - 0.35, 2.5]], 0.01)); Lc.box(SER, u - 0.45, 1.45, -0.03, u + 0.45, 1.6, 0.16);
          for (let k = -1; k <= 1; k++) Lc.box(IR, u + k * 0.22 - 0.015, 1.6, 0.02, u + k * 0.22 + 0.015, 2.5, 0.05);
          if (rand() < 0.35) { Lc.box(PF, u - 1.0 > 0 ? u - 1.0 : 0.1, -0.2, 0.3, Math.min(L - 0.1, u + 1.0), 0.45, 0.75); col.rect(wrect(FMg, Math.max(0.1, u - 1.0), 0.3, Math.min(L - 0.1, u + 1.0), 0.75), y, y + 0.45); }
        }
        if (open && kind === 'bottega' && !simple) {
          // the trade shows at the door: a trestle board with its goods and the painted sign
          const ua = Math.min(L - 0.3, du + 1.0), ub2 = Math.min(L - 0.1, ua + 2.0);
          if (ub2 - ua > 1.0) { Lc.box(W, ua, 0.0, 0.3, ub2, 1.0, 0.9); goods(Lc, el.trade, ua, ub2, 2.3, rand); }
          sign(Lc, Math.max(0.4, du - 1.2), 2.6, el.trade, rand);
        }
      }
    }
    // eye-level dressing and weathering of the street front: the family's arms over the door, an iron lantern bracket at
    // the corner, a street-corner shrine of the Madonna, damp rising from the pavement, rain streaks under the eave
    if (main && !simple) {
      const L = Lg, wet = !pal && !tow;
      if (wet) {
        for (let k = 0, n = 2 + Math.floor(L / 3); k < n; k++) { const u = rand() * (L - 1.5), w = 0.8 + rand() * 1.6; Lc.add('plaster_damp', flr(u, 0.0, Math.min(L, u + w), 0.5 + rand() * 0.7, 0.025)); }
        if (el.plaster) for (let k = 0, n = 1 + Math.floor(L / 2.5); k < n; k++) { const u = 0.3 + rand() * (L - 0.9), h0 = ys[Math.min(top, 2)] - rand() * 2.5; Lu2.add('plaster_streak', flr(u, h0 - 1.2 - rand() * 1.5, u + 0.2 + rand() * 0.3, h0, 0.022)); }
      }
      if (!pal && !tow && rand() < 0.38) { const u = Math.min(L - 0.5, Math.max(0.5, L / 2 + (rand() < 0.5 ? -1 : 1) * (0.2 + rand()))); Lc.box(SER, u - 0.28, gh - 0.95, 0.0, u + 0.28, gh - 0.35, 0.09); Lc.box(['cloth_red', 'cloth_blue', 'cloth_ochre', 'cloth_green'][Math.floor(rand() * 4)], u - 0.2, gh - 0.88, 0.09, u + 0.2, gh - 0.5, 0.11); Lc.box('cloth_white', u - 0.2, gh - 0.73, 0.1, u + 0.2, gh - 0.65, 0.12); }
      if (!tow && rand() < 0.3) { const u = rand() < 0.5 ? 0.35 : L - 0.35; Lc.box(IR, u - 0.02, 3.3, 0.0, u + 0.02, 3.5, 0.75); Lc.box(IR, u - 0.015, 3.5, 0.7, u + 0.015, 4.0, 0.74); Lc.add('lamp_glass', lathe([[0.001, 0], [0.1, 0.05], [0.12, 0.2], [0.001, 0.28]], 6, null, u, 3.1, 0.72)); }
      if (!pal && !tow && !shop && rand() < 0.12) {
        // the tabernacolo: a niche with a gabled stone frame, a blue-robed Madonna, a lamp below
        const u = L - 0.9; Lu2.box(PF, u - 0.5, ys[1] + 0.9, 0.0, u + 0.5, ys[1] + 2.6, 0.18); Lu2.box(O, u - 0.3, ys[1] + 1.1, 0.18, u + 0.3, ys[1] + 2.2, 0.2); Lu2.box('cloth_blue', u - 0.12, ys[1] + 1.15, 0.14, u + 0.12, ys[1] + 1.8, 0.2); Lu2.box('gilt_bronze', u - 0.07, ys[1] + 1.8, 0.14, u + 0.07, ys[1] + 1.98, 0.2);
        Lu2.box(SER, u - 0.6, ys[1] + 2.6, 0.0, u + 0.6, ys[1] + 2.72, 0.26); Lu2.box(IR, u - 0.01, ys[1] + 0.95, 0.15, u + 0.01, ys[1] + 1.1, 0.3); Lu2.add('lamp_glass', lathe([[0.001, 0], [0.07, 0.04], [0.08, 0.14], [0.001, 0.2]], 6, null, u, ys[1] + 0.75, 0.3));
      }
    }
    // the cornice / eave: on the upper rectangle (its brackets along the front and sides)
    if (!pal) {
      for (let u = 0.3; u < Lu - 0.2; u += 1.25) Lu2.box(W, u, H - 0.5, -0.03, u + 0.11, H - 0.1, 0.8 + (tow ? 0 : 0.0));
    } else {
      const long = face === 'e' || face === 'w', ring = (a, b, d) => Lu2.box(PF, long ? -d : 0, H + a, -0.04, long ? Lu + d : Lu, H + b, d);
      ring(-0.55, 0, 0.3); ring(0, 0.2, 0.55);
      for (let u = 0.3; u < Lu - 0.2; u += 0.9) { Lu2.box(PF, u - 0.14, H + 0.2, 0, u + 0.14, H + 0.5, 0.9); Lu2.box(PF, u - 0.12, H + 0.5, 0, u + 0.12, H + 0.65, 1.25); }
      ring(0.65, 1.0, 1.4);
    }
    Lc.emit(bag, FMg); Lu2.emit(bag, FMu);
  }
  if (simple) {
    // the far view: the shop arches and the windows as dark rectangles
    const { M, L } = faceFrame(el.rect, f, y), Ls = new Fl(); Ls.noBack = true; Ls.L = L;
    const nb = Math.max(1, Math.round(L / 3.4));
    for (let i = 0; i < nb; i++) { const u = (i + 0.5) * L / nb; if (shop || pal) Ls.box(O, u - 1.0, 0.1, -0.03, u + 1.0, Math.min(3.4, gh - 0.8), 0.02); for (let s = 1; s < top; s++) Ls.box(O, u - 0.5, ys[s] + 0.9, -0.03, u + 0.5, ys[s] + 2.4, 0.02); }
    Ls.emit(bag, M);
  }
  // the roof
  if (tow) {
    hip(bag, ROOF, RT, y + H, 17, 0.5);
    bag.add(TM, box(RT[0] - 0.5, y + H - 0.2, RT[1] - 0.5, RT[2] + 0.5, y + H, RT[3] + 0.5));
    return;
  }
  const o = pal ? 0.4 : 1.0;
  if (!pal) bag.add(TM, box(R[0] - o, wallTop - 0.22, R[1] - o, R[2] + o, wallTop, R[3] + o));
  const rise = hip(bag, ROOF, pal ? [R[0] + 0.3, R[1] + 0.3, R[2] - 0.3, R[3] - 0.3] : R, wallTop, pal ? 11 : 17 + (rand() - 0.5) * 4, pal ? 0.2 : o);
  if (rand() < (pal ? 0.7 : 0.45)) {
    const cx = R[0] + 1 + rand() * (R[2] - R[0] - 2), cz = R[1] + 1 + rand() * (R[3] - R[1] - 2);
    bag.add('brick', box(cx - 0.3, wallTop, cz - 0.3, cx + 0.3, wallTop + rise + 1.0, cz + 0.3)); bag.add('brick', box(cx - 0.4, wallTop + rise + 1.0, cz - 0.4, cx + 0.4, wallTop + rise + 1.12, cz + 0.4));
  }
  // the altana: a roof loggia on posts under its own small hipped roof (a good share of the town's houses)
  if (!simple && !pal && rand() < 0.2 && Math.min(R[2] - R[0], R[3] - R[1]) > 6) {
    const ax = (R[0] + R[2]) / 2, az = (R[1] + R[3]) / 2, ay = wallTop + rise * 0.55;
    bag.add(TM, box(ax - 1.4, ay, az - 1.2, ax + 1.4, ay + 0.12, az + 1.2));
    for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bag.add(TM, box(ax + dx * 1.3 - 0.05, ay + 0.12, az + dz * 1.1 - 0.05, ax + dx * 1.3 + 0.05, ay + 2.2, az + dz * 1.1 + 0.05));
    hip(bag, ROOF, [ax - 1.4, az - 1.2, ax + 1.4, az + 1.2], ay + 2.2, 14, 0.3);
  }
}
