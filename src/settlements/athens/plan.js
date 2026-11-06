// Classical Athens about 410 BC (docs/settlements/athens.md §2–§4): on the Acropolis, the Parthenon
// (the full building of the previous design, src/buildings/parthenon), the Propylaia, the Temple of
// Athena Nike on its bastion, the Erechtheion with its maiden porch, the Athena Promachos, the
// summit's wall; in the Agora, the Hephaisteion on its hill, the stoas, the Tholos.

import { ACRO, AGORA, KOLONOS, height } from './layout.js';
import parthenonPlan from '../../buildings/parthenon/plan.js';

const T = ACRO.top, E = [];
/** A peripteral or prostyle temple: { c, nx, nz (columns on the fronts and flanks; nz = 0: prostyle porches only), A (spacing), h, d, order, y, len, wid, front (+1: east) }. */
function temple({ c: [cx, cz], nx, nz, A, h, d, order = 'doric', y, prostyle = 0, cellaW, cellaL }) {
  const X = Array.from({ length: nz ? nz : 2 }, (_, k) => cx + (k - ((nz || 2) - 1) / 2) * A), Z = Array.from({ length: nx }, (_, k) => cz + (k - (nx - 1) / 2) * A);
  const hx = (X[X.length - 1] - X[0]) / 2 + d, hz = (Z[Z.length - 1] - Z[0]) / 2 + d, ST = 3 * 0.4;
  E.push({ t: 'krepis', rect: [cx - hx - 0.6, cz - hz - 0.6, cx + hx + 0.6, cz + hz + 0.6], y0: y, steps: 3, rise: 0.4, tread: 0.4, mat: 'marble' });
  const ring = [];
  if (nz) { for (const x of X) ring.push([x, Z[0]], [x, Z[Z.length - 1]]); for (const z of Z.slice(1, -1)) ring.push([X[0], z], [X[X.length - 1], z]); }
  else for (const z of Z) ring.push([X[0], z], [X[X.length - 1], z]);
  for (const [x, z] of ring) E.push({ t: 'column', at: [x, z], y: y + ST, h, d, mat: 'marble_column', order, yaw: order === 'ionic' ? Math.PI / 2 : 0 });
  const ENT = y + ST + h, arch = h * 0.13, frieze = h * 0.13, geison = h * 0.06;
  E.push({ t: 'doric_entablature', axes: { x: X, z: Z }, y: ENT, face: d * 0.45, arch, frieze, geison, tw: d * 0.45, overhang: d * 0.35, mat: 'marble' });
  const top = ENT + arch + frieze + geison, pad = d * 0.45 + d * 0.35;
  E.push({ t: 'pediment_roof', rect: [X[0] - pad, Z[0] - pad, X[X.length - 1] + pad, Z[Z.length - 1] + pad], y: top, rise: (hz * 2) * 0.12, tympanumInset: 0.5, rakingGeison: 0.4, mat: 'marble' });
  const cw = cellaW ?? (hz * 2 - A * 2.2), cl = cellaL ?? (hx * 2 - A * 3);
  if (cw > 2 && cl > 2) {
    const r = [cx - cl / 2, cz - cw / 2, cx + cl / 2, cz + cw / 2], wy = ENT + arch + frieze;
    E.push({ t: 'wall', a: [r[0], r[1]], b: [r[2], r[1]], th: 0.9, y0: y + ST, y1: wy, mat: 'marble' }, { t: 'wall', a: [r[0], r[3]], b: [r[2], r[3]], th: 0.9, y0: y + ST, y1: wy, mat: 'marble' });
    E.push({ t: 'wall', a: [r[0], r[1]], b: [r[0], r[3]], th: 0.9, y0: y + ST, y1: wy, mat: 'marble' });
    E.push({ t: 'wall', a: [r[2], r[1]], b: [r[2], r[3]], th: 0.9, y0: y + ST, y1: wy, mat: 'marble', openings: [{ at: cw / 2, w: Math.min(3.5, cw * 0.4), h: h * 0.7, y0: y + ST }] });
  }
}
// ── the Propylaia (Mnesikles, 437–432; docs/settlements/athens.md §4b) ──
// the central gate building: a west portico of six Doric columns with the wider central bay for the procession, the
// west hall with two rows of three Ionic columns along the roadway under a coffered ceiling of painted stars, the
// cross wall with its five doorways, the east portico of six; the roadway a ramp through the steps
{
  const y = T, K = 4 * 0.24, Z6 = [-9.075, -5.895, -2.715, 2.715, 5.895, 9.075], XW = -139, XE = -118.5;
  const XA = [XW, -135.6, -132.2, -128.8, -125.4, -122, XE];
  E.push({ t: 'krepis', rect: [XW - 0.95, -10.05, XW + 1.2, 10.05], y0: y, steps: 4, rise: 0.24, tread: 0.35, mat: 'marble', cut: [[XW - 2.5, -2.0, XW + 1.3, 2.0]] });
  E.push({ t: 'krepis', rect: [XE - 1.2, -10.05, XE + 0.95, 10.05], y0: y, steps: 4, rise: 0.24, tread: 0.35, mat: 'marble', cut: [[XE - 1.3, -2.0, XE + 2.5, 2.0]] });
  E.push({ t: 'stair', rect: [XW - 2.4, -2.0, XW + 1.25, 2.0], dir: 'e', y0: y, y1: y + K, riser: 0.12, base: y - 0.3, mat: 'marble' });
  E.push({ t: 'stair', rect: [XE - 1.25, -2.0, XE + 2.4, 2.0], dir: 'w', y0: y, y1: y + K, riser: 0.12, base: y - 0.3, mat: 'marble' });
  E.push({ t: 'floor', rect: [XW + 1.2, -10.05, XE - 1.2, 10.05], y: y + K, th: K + 0.3, mat: 'marble_floor' });
  for (const z of Z6) { E.push({ t: 'column', at: [XW, z], y: y + K, h: 8.81, d: 1.56, mat: 'marble_column' }); E.push({ t: 'column', at: [XE, z], y: y + K, h: 8.81, d: 1.56, mat: 'marble_column' }); }
  const ENT = y + K + 8.81, AR = 1.15, FR = 1.15, GE = 0.53;
  E.push({ t: 'doric_entablature', axes: { x: XA, z: Z6 }, y: ENT, face: 0.7, arch: AR, frieze: FR, geison: GE, tw: 0.7, overhang: 0.55, mat: 'marble', triglyphMat: 'paint_blue' });
  E.push({ t: 'pediment_roof', rect: [XW - 1.25, -10.33, XE + 1.25, 10.33], y: ENT + AR + FR + GE, rise: 2.5, tympanumInset: 0.6, rakingGeison: 0.45, mat: 'marble' });
  // the side walls, the cross wall with its five doorways (the widest in the middle, for the procession and the victims)
  for (const s of [-1, 1]) E.push({ t: 'wall', a: [XW + 0.9, s * 9.6], b: [XE - 0.9, s * 9.6], th: 0.9, y0: y + K, y1: ENT + AR + FR, mat: 'marble' });
  const D = (at, w, h) => ({ at, w, h, y0: y + K });
  E.push({ t: 'wall', a: [-125.5, -9.15], b: [-125.5, 9.15], th: 1.4, y0: y + K, y1: ENT + AR + FR, mat: 'marble', openings: [D(2.3, 1.5, 3.5), D(5.25, 2.9, 5.8), D(9.15, 4.18, 7.38), D(13.05, 2.9, 5.8), D(16.0, 1.5, 3.5)] });
  for (const x of [-135.8, -132.4, -129.0]) for (const z of [-2.9, 2.9]) E.push({ t: 'column', at: [x, z], y: y + K, h: 8.81 + AR, d: 1.0, mat: 'marble_column', order: 'ionic', yaw: Math.PI / 2 });
  for (const z of [-2.9, 2.9]) E.push({ t: 'beam', a: [XW + 0.7, z], b: [-126.2, z], y: ENT + AR, w: 1.0, h: FR, mat: 'marble' });
  E.push({ t: 'coffers', rect: [XW + 0.7, -9.15, -126.2, 9.15], y: ENT + AR + FR - 0.3, depth: 0.3, cell: 1.0, beam: 0.2, mat: 'marble', ceilMat: 'vault_stars' });
  E.push({ t: 'coffers', rect: [-124.8, -9.15, XE - 0.7, 9.15], y: ENT + AR + FR - 0.3, depth: 0.3, cell: 1.0, beam: 0.2, mat: 'marble', ceilMat: 'vault_stars' });
  // the north wing, the Pinakotheke: three Doric columns between antae facing the approach, the room of the paintings
  // behind on its terrace; the south wing's matching front beside the Nike bastion
  const wing = (zf, zb, room) => {
    const x0 = -151.5, x1 = -141.3, dir = Math.sign(zb - zf), zA = Math.min(zf, zb), zB = Math.max(zf, zb);
    E.push({ t: 'block', rect: [x0 - 0.6, zA - 0.6, x1 + 0.6, zB + 0.6], y0: y - 9, y1: y, mat: 'limestone', walk: true });
    for (const x of [-148.9, -146.4, -143.9]) E.push({ t: 'column', at: [x, zf], y, h: 5.85, d: 1.02, mat: 'marble_column' });
    const ent = y + 5.85, inner = zf + dir * 3.6;
    for (const x of [x0, x1]) E.push({ t: 'wall', a: [x, zA], b: [x, zB], th: 0.85, y0: y, y1: ent, mat: 'marble' });
    E.push({ t: 'wall', a: [x0, zb], b: [x1, zb], th: 0.85, y0: y, y1: ent, mat: 'marble' });
    if (room) E.push({ t: 'wall', a: [x0, inner], b: [x1, inner], th: 0.75, y0: y, y1: ent, mat: 'marble', openings: [{ at: 5.1, w: 1.6, h: 3.4, y0: y }, { at: 2.2, w: 0.9, h: 1.4, y0: y + 1.6 }, { at: 8.0, w: 0.9, h: 1.4, y0: y + 1.6 }] });
    E.push({ t: 'doric_entablature', axes: { x: [x0 + 0.3, -148.9, -146.4, -143.9, x1 - 0.3], z: [zA, zB] }, y: ent, face: 0.45, arch: 0.8, frieze: 0.8, geison: 0.38, tw: 0.5, overhang: 0.4, mat: 'marble', triglyphMat: 'paint_blue' });
    E.push({ t: 'pediment_roof', rect: [x0 - 0.15, zA - 0.85, x1 + 0.15, zB + 0.85], y: ent + 1.98, rise: 1.4, tympanumInset: 0.4, rakingGeison: 0.35, mat: 'marble' });
    if (room) E.push({ t: 'slab', rect: [x0 + 0.4, Math.min(inner, zb), x1 - 0.4, Math.max(inner, zb)], y0: ent - 0.25, y1: ent, mat: 'cedar' });
  };
  wing(-12.0, -26.0, true);
  // the paintings on panels round the walls of the room
  ['wall_red', 'paint_blue', 'paint_ochre'].forEach((m, i) => {
    const x = -149.4 + i * 3.0, z = -26.0 + 0.43;
    E.push({ t: 'block', rect: [x - 0.98, z, x + 0.98, z + 0.06], y0: y + 1.5, y1: y + 2.9, mat: 'cedar', collide: false });
    E.push({ t: 'block', rect: [x - 0.9, z + 0.06, x + 0.9, z + 0.09], y0: y + 1.58, y1: y + 2.82, mat: m, collide: false });
  });
  wing(12.0, 16.6, false);
}
// ── the Nike bastion and the little Ionic temple of Athena Nike (427–424): four columns at each end, the frieze, the
// parapet of about 410 round the bastion's edge with its Nikai in relief ──
E.push({ t: 'block', rect: [-150, 16.9, -128, 34], y0: T - 14, y1: T - 3, mat: 'limestone', walk: true });
{
  const y = T - 3, st = 0.75, h = 4.07, d = 0.53, X = [-142.4, -135.6], Z = [22.525, 24.175, 25.825, 27.475];
  E.push({ t: 'krepis', rect: [X[0] - 0.55, Z[0] - 0.55, X[1] + 0.55, Z[3] + 0.55], y0: y, steps: 3, rise: 0.25, tread: 0.3, mat: 'marble' });
  for (const x of X) for (const z of Z) E.push({ t: 'column', at: [x, z], y: y + st, h, d, mat: 'marble_column', order: 'ionic', yaw: Math.PI / 2 });
  for (const z of [23.0, 27.0]) E.push({ t: 'wall', a: [-141.1, z], b: [-136.9, z], th: 0.5, y0: y + st, y1: y + st + h, mat: 'marble' });
  E.push({ t: 'wall', a: [-141.1, 23.0], b: [-141.1, 27.0], th: 0.5, y0: y + st, y1: y + st + h, mat: 'marble' });
  E.push({ t: 'wall', a: [-136.9, 23.0], b: [-136.9, 27.0], th: 0.5, y0: y + st, y1: y + st + h, mat: 'marble', openings: [{ at: 2.0, w: 2.4, h: 3.0, y0: y + st, frame: false }] });
  const ENT = y + st + h, AR = 0.5, FR = 0.45, GE = 0.3;
  E.push({ t: 'ionic_entablature', axes: { x: X, z: [Z[0], Z[3]] }, y: ENT, face: 0.27, arch: AR, frieze: FR, geison: GE, overhang: 0.35, mat: 'marble' });
  const O = [X[0] - 0.27, Z[0] - 0.27, X[1] + 0.27, Z[3] + 0.27];
  E.push({ t: 'frieze_relief', y0: ENT + AR, h: FR - 0.08, d: 0.03, same: true, runs: [
    { a: [O[0], O[1]], b: [O[2], O[1]], o: [0, -1], seq: 'gathering', toward: 'b' }, { a: [O[0], O[3]], b: [O[2], O[3]], o: [0, 1], seq: 'gathering', toward: 'b' },
    { a: [O[2], O[3]], b: [O[2], O[1]], o: [1, 0], seq: 'gathering', toward: 'mid' }, { a: [O[0], O[3]], b: [O[0], O[1]], o: [-1, 0], seq: 'gathering', toward: 'mid' }] });
  E.push({ t: 'pediment_roof', rect: [O[0] - 0.35, O[1] - 0.35, O[2] + 0.35, O[3] + 0.35], y: ENT + AR + FR + GE, rise: 0.85, tympanumInset: 0.3, rakingGeison: 0.25, mat: 'marble' });
  // the parapet on the bastion's north, west and south edges, the winged Nikai on its outer face
  const py = T - 3, ph = 1.05, e = [-150, 16.9, -128, 34];
  for (const [a, b] of [[[e[0], e[1] + 0.15], [e[2], e[1] + 0.15]], [[e[0] + 0.15, e[1]], [e[0] + 0.15, e[3]]], [[e[0], e[3] - 0.15], [e[2], e[3] - 0.15]]]) E.push({ t: 'wall', a, b, th: 0.3, y0: py, y1: py + ph, mat: 'marble' });
  E.push({ t: 'frieze_relief', y0: py + 0.06, h: ph - 0.14, d: 0.035, runs: [
    { a: [e[0], e[1]], b: [e[2], e[1]], o: [0, -1], seq: 'nikai', toward: 'b' }, { a: [e[0], e[3]], b: [e[0], e[1]], o: [-1, 0], seq: 'nikai', toward: 'mid' },
    { a: [e[0], e[3]], b: [e[2], e[3]], o: [0, 1], seq: 'nikai', toward: 'b' }] });
}
// the Athena Promachos, the bronze of Pheidias, between the Propylaia and the Erechtheion
E.push({ t: 'promachos', c: [-80, -6], h: 7.4, y: T, yaw: -Math.PI / 2 });
// ── the Erechtheion (421–406): the Ionic east porch of six, the cella under one roof, the north porch with its great
// doorway, the porch of the maidens on the south; the frieze of dark Eleusinian stone with figures of white marble ──
{
  const y = T, st = 0.9, h = 6.6, d = 0.69, XC = [22.45, 45.2], ZC = [-51.75, -40.25];
  const PZ = [-51.75, -49.45, -47.15, -44.85, -42.55, -40.25];
  E.push({ t: 'krepis', rect: [21.6, -52.6, 46.05, -39.4], y0: y, steps: 3, rise: 0.3, tread: 0.3, mat: 'marble', cut: [[45.9, -48.0, 47.2, -44.0]] });
  E.push({ t: 'stair', rect: [46.05, -47.8, 47.0, -44.2], dir: 'w', y0: y, y1: y + st, riser: 0.15, base: y - 0.3, mat: 'marble' });
  for (const z of PZ) E.push({ t: 'column', at: [45.2, z], y: y + st, h, d, mat: 'marble_column', order: 'ionic', yaw: Math.PI / 2 });
  const W = (a, b, openings = []) => E.push({ t: 'wall', a, b, th: 0.9, y0: y + st, y1: y + st + h, mat: 'marble', openings });
  W([22.0, -51.75], [43.45, -51.75], [{ at: 7.0, w: 2.4, h: 4.9, y0: y + st }]);                 // north wall, the north door
  W([22.0, -40.25], [43.45, -40.25]);
  W([22.45, -51.3], [22.45, -40.7], [{ at: 3.0, w: 1.0, h: 1.5, y0: y + st + 3.6, frame: false }, { at: 5.3, w: 1.0, h: 1.5, y0: y + st + 3.6, frame: false }, { at: 7.6, w: 1.0, h: 1.5, y0: y + st + 3.6, frame: false }]);
  W([43.0, -51.3], [43.0, -40.7], [{ at: 5.3, w: 2.0, h: 4.6, y0: y + st }, { at: 1.9, w: 0.9, h: 1.7, y0: y + st + 2.9 }, { at: 8.7, w: 0.9, h: 1.7, y0: y + st + 2.9 }]);
  const ENT = y + st + h, AR = 0.86, FR = 0.8, GE = 0.42;
  E.push({ t: 'ionic_entablature', axes: { x: XC, z: ZC }, y: ENT, face: 0.45, arch: AR, frieze: FR, geison: GE, overhang: 0.5, mat: 'marble', friezeMat: 'marble_dark' });
  const O = [XC[0] - 0.45, ZC[0] - 0.45, XC[1] + 0.45, ZC[1] + 0.45];
  E.push({ t: 'frieze_relief', y0: ENT + AR + 0.03, h: FR - 0.12, d: 0.04, same: true, runs: [
    { a: [O[0], O[1]], b: [O[2], O[1]], o: [0, -1], seq: 'gathering', toward: 'b' }, { a: [O[0], O[3]], b: [O[2], O[3]], o: [0, 1], seq: 'gathering', toward: 'b' },
    { a: [O[2], O[3]], b: [O[2], O[1]], o: [1, 0], seq: 'gathering', toward: 'mid' }] });
  E.push({ t: 'pediment_roof', rect: [O[0] - 0.5, O[1] - 0.5, O[2] + 0.5, O[3] + 0.5], y: ENT + AR + FR + GE, rise: 1.6, tympanumInset: 0.5, rakingGeison: 0.4, mat: 'marble' });
  // the north porch: four columns in front and one behind each corner, its own pediment facing north
  const nh = 5.4, NX = [24.4, 27.4, 30.4, 33.4], NE = y + 0.6 + nh;
  E.push({ t: 'krepis', rect: [23.4, -59.9, 34.4, -52.2], y0: y, steps: 2, rise: 0.3, tread: 0.3, mat: 'marble' });
  for (const x of NX) E.push({ t: 'column', at: [x, -58.9], y: y + 0.6, h: nh, d: 0.72, mat: 'marble_column', order: 'ionic' });
  for (const x of [NX[0], NX[3]]) E.push({ t: 'column', at: [x, -55.9], y: y + 0.6, h: nh, d: 0.72, mat: 'marble_column', order: 'ionic' });
  E.push({ t: 'ionic_entablature', axes: { x: [NX[0], NX[3]], z: [-58.9, -52.55] }, y: NE, face: 0.35, arch: 0.7, frieze: 0.66, geison: 0.36, overhang: 0.4, mat: 'marble', friezeMat: 'marble_dark' });
  E.push({ t: 'pediment_roof', rect: [NX[0] - 0.75, -59.65, NX[3] + 0.75, -52.25], y: NE + 1.72, rise: 1.25, tympanumInset: 0.4, rakingGeison: 0.35, mat: 'marble', ridge: 'z' });
  E.push({ t: 'coffers', rect: [NX[0] - 0.05, -58.55, NX[3] + 0.05, -52.25], y: NE + 1.36 - 0.3, depth: 0.3, cell: 0.9, beam: 0.18, mat: 'marble', ceilMat: 'paint_blue' });
  // the porch of the maidens: six korai on the parapet, the three on the west resting on the right leg, the three on the
  // east on the left, carrying the architrave on their basket-capitals
  const CX = [23.75, 25.78, 27.82, 29.85];
  E.push({ t: 'caryatid_porch', rect: [23.1, -39.8, 30.5, -36.3], y, parapet: 1.77, h: 2.31,
    cols: [...CX.map((x, i) => [x, -36.85, i >= 2]), [CX[0], -38.75, false], [CX[3], -38.75, true]] });
}
// the summit's wall along the rim
for (let k = 0; k < 48; k++) {
  const a0 = k / 48 * Math.PI * 2, a1 = (k + 1) / 48 * Math.PI * 2, m = (a0 + a1) / 2;
  if (Math.cos(m) < -0.9) continue;                                            // open at the west end (the Propylaia)
  E.push({ t: 'wall', a: [ACRO.c[0] + Math.cos(a0) * ACRO.r[0], ACRO.c[1] + Math.sin(a0) * ACRO.r[1]], b: [ACRO.c[0] + Math.cos(a1) * ACRO.r[0], ACRO.c[1] + Math.sin(a1) * ACRO.r[1]], th: 1.6, y0: T - 6, y1: T + 1.6, mat: 'limestone' });
}
E.push({ t: 'floor', rect: [-108, -55, 128, 55], y: T + 0.04, th: 0.3, mat: 'limestone', walk: true });

// ── the Agora ──
const ky = KOLONOS.h;
temple({ c: [KOLONOS.c[0], KOLONOS.c[1]], nx: 6, nz: 13, A: 2.6, h: 5.7, d: 1.0, y: ky - 0.2, cellaW: 7.5, cellaL: 17 });
E.push({ t: 'stoa', rect: [AGORA[0] + 30, AGORA[1] - 2, AGORA[2] - 10, AGORA[1] + 12], h: 6, front: 's', y: height(AGORA[0] + 60, AGORA[1] + 5) });  // the Stoa Poikile
E.push({ t: 'stoa', rect: [AGORA[0] - 6, AGORA[1] + 20, AGORA[0] + 8, AGORA[1] + 70], h: 6, front: 'e', y: height(AGORA[0], AGORA[1] + 45) });  // the Stoa of Zeus
E.push({ t: 'stoa', rect: [AGORA[0] + 20, AGORA[3] - 12, AGORA[2], AGORA[3] + 2], h: 5.5, front: 'n', y: height(AGORA[0] + 60, AGORA[3]) });  // the South Stoa
E.push({ t: 'tholos', c: [AGORA[0] + 4, AGORA[3] - 22], r: 9, h: 5, y: height(AGORA[0] + 4, AGORA[3] - 22) });

const room = (id, rect, y, kind) => ({ id, rect, y, kind });
const rooms = [room('acropolis', [-108, -55, 128, 55], T + 0.04, 'open'), room('agora', AGORA, 0, 'open')];
const walks = [[[-300, 70], [-235, 45], [-175, 18], [-150, 2], [-136, 0], [-100, 0]]];
walks[0].y0 = height(-300, 70);

export const acropolis = {
  id: 'athens-acropolis',
  name: { en: 'The Acropolis and the Agora', zh: '雅典卫城与广场' },
  era: { en: 'Classical Athens, about 410 BC', zh: '古典雅典，约公元前410年' },
  style: 'greek',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [-300, 70], facing: 'e' },
  bounds: [-330, -310, 145, 80],
  view: [-150, -20, -100, 30],
  viewY: T,
  bakeTop: 90,
  elements: E,
  rooms,
  walks,
};
// the Parthenon itself: the previous design's full building, set on the summit, with its sculpture and paint
// (docs/settlements/athens.md §4a): the pediment groups on their blue tympana, the 92 metopes in high relief on a
// red ground under a blue band, the triglyphs painted dark blue, the Ionic frieze of the procession on its blue
// ground round the top of the cella, a floral acroterion over each pediment
const PE = parthenonPlan.elements, DE = PE.find((e) => e.t === 'doric_entablature'), PR = PE.find((e) => e.t === 'pediment_roof');
const pediment = (dir) => {
  const [x0, z0, x1, z1] = PR.rect, inset = PR.tympanumInset, rg = PR.rakingGeison;
  return { t: 'pediment_sculpture', x: (dir > 0 ? x1 : x0) - dir * inset, dir, zc: (z0 + z1) / 2, half: (z1 - z0) / 2, y: PR.y, rise: PR.rise, depth: inset,
    apex: PR.y + PR.rise - rg * 0.9, tz: (z1 - z0) / 2 - inset * 0.6, programme: dir > 0 ? 'parthenon-east' : 'parthenon-west', paint: 'paint_blue' };
};
const FX = 26.725, FZ = 10.85, FY = DE.y + DE.arch;                      // the frieze: the outer faces of the cella walls and the porch beams
const parthenonArt = [
  pediment(1), pediment(-1),
  { ...DE, t: 'metopes', programme: { e: 'gigantomachy', w: 'amazonomachy', n: 'troy', s: 'centauromachy' }, bg: 'wall_red', band: 'paint_blue' },
  { t: 'frieze_relief', y0: FY, h: 1.0, bg: 'paint_blue', runs: [
    { a: [-FX, -FZ], b: [FX, -FZ], o: [0, -1], seq: 'procession', toward: 'b' },
    { a: [-FX, FZ], b: [FX, FZ], o: [0, 1], seq: 'procession', toward: 'b' },
    { a: [-FX, FZ], b: [-FX, -FZ], o: [-1, 0], seq: 'cavalcade', toward: 'b' },
    { a: [FX, FZ], b: [FX, -FZ], o: [1, 0], seq: 'east', toward: 'mid' },
  ] },
  ...[1, -1].map((dir) => ({ t: 'acroterion', at: [dir * (PR.rect[2] - 0.6), 0], y: PR.y + PR.rise + PR.rakingGeison + 0.3, h: 2.6, yaw: Math.PI / 2 })),
];
export const parthenon = { ...parthenonPlan, elements: [...PE.map((e) => (e === DE ? { ...e, triglyphMat: 'paint_blue' } : e)), ...parthenonArt],
  origin: [18, 18], base: T, district: undefined, view: [18 - 35, 18 - 16, 18 + 35, 18 + 16], viewY: T };
export default acropolis;
