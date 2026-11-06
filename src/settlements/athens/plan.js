// Classical Athens about 410 BC (docs/settlements/athens.md §2–§4): on the Acropolis, the Parthenon
// (the full building of the previous design, src/buildings/parthenon), the Propylaia, the Temple of
// Athena Nike on its bastion, the Erechtheion with its maiden porch, the Athena Promachos, the
// summit's wall; in the Agora, the Hephaisteion on its hill, the stoas, the Tholos.

import { ACRO, AGORA, KOLONOS, NCOURT, height, pathAt, WAY } from './layout.js';
import { subtractRects } from '../../core/build.js';
import parthenonPlan from '../../buildings/parthenon/plan.js';
import { southSlope, summitSanctuaries } from './slope.js';

const T = ACRO.top, E = [];
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
  E.push({ t: 'doric_entablature', axes: { x: XA, z: Z6 }, y: ENT, face: 0.7, arch: AR, frieze: FR, geison: GE, tw: 0.7, overhang: 0.55, mat: 'marble', triglyphMat: 'egyptian_blue' });
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
    E.push({ t: 'doric_entablature', axes: { x: [x0 + 0.3, -148.9, -146.4, -143.9, x1 - 0.3], z: [zA, zB] }, y: ent, face: 0.45, arch: 0.8, frieze: 0.8, geison: 0.38, tw: 0.5, overhang: 0.4, mat: 'marble', triglyphMat: 'egyptian_blue' });
    E.push({ t: 'pediment_roof', rect: [x0 - 0.15, zA - 0.85, x1 + 0.15, zB + 0.85], y: ent + 1.98, rise: 1.4, tympanumInset: 0.4, rakingGeison: 0.35, mat: 'marble' });
    if (room) E.push({ t: 'slab', rect: [x0 + 0.4, Math.min(inner, zb), x1 - 0.4, Math.max(inner, zb)], y0: ent - 0.25, y1: ent, mat: 'cedar' });
  };
  wing(-12.0, -26.0, true);
  // the paintings on panels round the walls of the room
  ['wall_red', 'egyptian_blue', 'paint_ochre'].forEach((m, i) => {
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
// doorway standing in the court 3 m below, the porch of the maidens on the south; the frieze of dark Eleusinian stone
// with figures of white marble ──
{
  const y = T, st = 0.9, h = 6.6, d = 0.69, XC = [22.45, 45.2], ZC = [-51.75, -40.25], yl = T - NCOURT.drop;
  const PZ = [-51.75, -49.45, -47.15, -44.85, -42.55, -40.25];
  // the krepis laid step by step, the north door's passage left through it; under its north side the foundation wall
  // that shows in the lower court
  const door = [27.6, -53.4, 30.4, -51.3];
  for (let i = 0; i < 3; i++) {
    const o = (2 - i) * 0.3, r = [21.6 - o, -52.6 - o, 46.05 + o, -39.4 + o];
    const cut = i === 0 ? [[45.9, -48.0, 47.2, -44.0]] : [];
    for (const q of subtractRects(r, [door, ...cut])) E.push({ t: 'block', rect: q, y0: i === 0 ? y - 0.6 : y + i * 0.3, y1: y + (i + 1) * 0.3, mat: 'marble', walk: true });
  }
  for (const q of subtractRects([21.0, -53.2, 46.65, -51.3], [door])) E.push({ t: 'block', rect: q, y0: yl - 0.6, y1: y - 0.6, mat: 'marble' });
  E.push({ t: 'stair', rect: [46.05, -47.8, 47.0, -44.2], dir: 'w', y0: y, y1: y + st, riser: 0.15, base: y - 0.3, mat: 'marble' });
  for (const z of PZ) E.push({ t: 'column', at: [45.2, z], y: y + st, h, d, mat: 'marble_column', order: 'ionic', yaw: Math.PI / 2 });
  const W = (a, b, openings = [], y0 = y + st) => E.push({ t: 'wall', a, b, th: 0.9, y0, y1: y + st + h, mat: 'marble', openings });
  // the north wall goes down to the court; the great door opens from the porch's floor
  W([22.0, -51.75], [43.45, -51.75], [{ at: 7.0, w: 2.4, h: 4.9, y0: yl + 0.6 }], yl + 0.6);
  W([22.0, -40.25], [43.45, -40.25]);
  W([22.45, -51.3], [22.45, -40.7], [{ at: 3.0, w: 1.0, h: 1.5, y0: y + st + 3.6, frame: false }, { at: 5.3, w: 1.0, h: 1.5, y0: y + st + 3.6, frame: false }, { at: 7.6, w: 1.0, h: 1.5, y0: y + st + 3.6, frame: false }]);
  W([43.0, -51.3], [43.0, -40.7], [{ at: 5.3, w: 2.0, h: 4.6, y0: y + st }, { at: 1.9, w: 0.9, h: 1.7, y0: y + st + 2.9 }, { at: 8.7, w: 0.9, h: 1.7, y0: y + st + 2.9 }]);
  // the door's leaves of wood, shut, with their bronze bosses; the moulded frame with its rosettes
  {
    const dy = yl + 0.6, zf = -52.25;
    E.push({ t: 'block', rect: [27.8, -51.65, 30.2, -51.5], y0: dy, y1: dy + 4.9, mat: 'cedar', collide: true });
    for (let k = 0; k < 4; k++) for (const x of [28.4, 29.6]) E.push({ t: 'block', rect: [x - 0.35, -51.68, x + 0.35, -51.65], y0: dy + 0.5 + k * 1.1, y1: dy + 1.3 + k * 1.1, mat: 'bronze', collide: false });
    for (const [x0, x1] of [[27.15, 27.6], [30.4, 30.85]]) E.push({ t: 'block', rect: [x0, zf - 0.12, x1, zf], y0: dy, y1: dy + 5.35, mat: 'marble_smooth', collide: false });
    E.push({ t: 'block', rect: [26.9, zf - 0.16, 31.1, zf], y0: dy + 4.9, y1: dy + 5.5, mat: 'marble_smooth', collide: false });
    E.push({ t: 'block', rect: [26.7, zf - 0.32, 31.3, zf], y0: dy + 5.5, y1: dy + 5.72, mat: 'marble_smooth', collide: false });
    for (let k = 0; k < 7; k++) { const x = 27.25 + k * 0.6; E.push({ t: 'block', rect: [x - 0.1, zf - 0.2, x + 0.1, zf - 0.16], y0: dy + 5.1, y1: dy + 5.3, mat: 'gilt_bronze', collide: false }); }
  }
  const ENT = y + st + h, AR = 0.86, FR = 0.8, GE = 0.42;
  E.push({ t: 'ionic_entablature', axes: { x: XC, z: ZC }, y: ENT, face: 0.45, arch: AR, frieze: FR, geison: GE, overhang: 0.5, mat: 'marble', friezeMat: 'marble_dark' });
  const O = [XC[0] - 0.45, ZC[0] - 0.45, XC[1] + 0.45, ZC[1] + 0.45];
  E.push({ t: 'frieze_relief', y0: ENT + AR + 0.03, h: FR - 0.12, d: 0.04, same: true, runs: [
    { a: [O[0], O[1]], b: [O[2], O[1]], o: [0, -1], seq: 'gathering', toward: 'b' }, { a: [O[0], O[3]], b: [O[2], O[3]], o: [0, 1], seq: 'gathering', toward: 'b' },
    { a: [O[2], O[3]], b: [O[2], O[1]], o: [1, 0], seq: 'gathering', toward: 'mid' }] });
  E.push({ t: 'pediment_roof', rect: [O[0] - 0.5, O[1] - 0.5, O[2] + 0.5, O[3] + 0.5], y: ENT + AR + FR + GE, rise: 1.6, tympanumInset: 0.5, rakingGeison: 0.4, mat: 'marble' });
  // the north porch on the court: four columns in front and one behind each corner, 7.6 m, the tallest of the
  // building; its own pediment facing north under the temple's eaves
  const nh = 7.63, NX = [24.4, 27.4, 30.4, 33.4], NE = yl + 0.6 + nh;
  E.push({ t: 'krepis', rect: [23.4, -59.9, 34.4, -52.2], y0: yl, steps: 2, rise: 0.3, tread: 0.3, mat: 'marble' });
  for (const x of NX) E.push({ t: 'column', at: [x, -58.9], y: yl + 0.6, h: nh, d: 0.82, mat: 'marble_column', order: 'ionic' });
  for (const x of [NX[0], NX[3]]) E.push({ t: 'column', at: [x, -55.9], y: yl + 0.6, h: nh, d: 0.82, mat: 'marble_column', order: 'ionic' });
  E.push({ t: 'ionic_entablature', axes: { x: [NX[0], NX[3]], z: [-58.9, -52.55] }, y: NE, face: 0.38, arch: 0.7, frieze: 0.66, geison: 0.36, overhang: 0.4, mat: 'marble', friezeMat: 'marble_dark' });
  E.push({ t: 'pediment_roof', rect: [NX[0] - 0.78, -59.68, NX[3] + 0.78, -52.25], y: NE + 1.72, rise: 1.25, tympanumInset: 0.4, rakingGeison: 0.35, mat: 'marble', ridge: 'z' });
  E.push({ t: 'coffers', rect: [NX[0] - 0.05, -58.52, NX[3] + 0.05, -52.25], y: NE + 1.36 - 0.3, depth: 0.3, cell: 0.9, beam: 0.18, mat: 'marble', ceilMat: 'egyptian_blue' });
  // the court: paved, walled where the summit stands above it, the stair up to the east
  const [cx0, , cx1] = NCOURT.rect;
  E.push({ t: 'block', rect: [cx0 + 0.4, -67.0, cx1 - 0.4, -53.2], y0: yl - 0.6, y1: yl, mat: 'limestone', walk: true });
  const RW = (a, b) => E.push({ t: 'wall', a, b, th: 0.8, y0: yl - 0.6, y1: y + 0.55, mat: 'limestone' });
  const ce = NCOURT.edge;
  RW([cx0, -71.6], [cx0, ce]); RW([cx1, -67.6], [cx1, -63.0]); RW([cx1, -58.5], [cx1, ce]);
  RW([cx0, ce], [21.0, ce]); RW([46.65, ce], [cx1, ce]);
  E.push({ t: 'stair', rect: [39.6, -63.0, cx1 - 0.4, -58.5], dir: 'e', y0: yl, y1: y, riser: 0.15, base: yl - 0.6, mat: 'limestone' });
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
// the summit's paving, round the lower court north of the Erechtheion
for (const r of [[-108, -55, NCOURT.rect[0], 55], [NCOURT.rect[2], -55, 128, 55], ...subtractRects([NCOURT.rect[0], NCOURT.edge, NCOURT.rect[2], 55], [[27.6, -53.4, 30.4, -51.3]])]) E.push({ t: 'floor', rect: r, y: T + 0.04, th: 0.3, mat: 'limestone', walk: true });

// ── the Agora (docs/settlements/athens.md §4d) ──
// the Hephaisteion on its hill (449–415): a Doric temple of 6 × 13 columns; pronaos and opisthodomos with two columns
// between the antae, the pronaos lined up with the third columns of the flanks; the ten metopes of the east front (the
// labours of Herakles) and the four easternmost of each flank (the deeds of Theseus) carved, the rest plain; continuous
// Ionic friezes over the porches (Theseus and the Pallantids, carried across the pteron; the Lapiths and centaurs); the
// pediments (the birth of Athena; the return of Hephaistos); inside, the two-storeyed colonnade round the bronze
// Hephaistos and Athena (421–415)
{
  const [cx, cz] = KOLONOS.c, y0 = KOLONOS.h - 0.2, RISE = 0.33, ST = y0 + 3 * RISE;
  const AX = 2.548, AZ = 2.51, X = Array.from({ length: 13 }, (_, k) => cx + (k - 6) * AX), Z = Array.from({ length: 6 }, (_, k) => cz + (k - 2.5) * AZ);
  E.push({ t: 'krepis', rect: [cx - 15.888, cz - 6.854, cx + 15.888, cz + 6.854], y0, steps: 3, rise: RISE, tread: 0.38, mat: 'marble', below: 1.2 });
  const H = 5.71, D = 1.02;
  for (const x of X) for (const z of [Z[0], Z[5]]) E.push({ t: 'column', at: [x, z], y: ST, h: H, d: D, mat: 'marble_column' });
  for (const z of Z.slice(1, -1)) for (const x of [X[0], X[12]]) E.push({ t: 'column', at: [x, z], y: ST, h: H, d: D, mat: 'marble_column' });
  const ENT = ST + H, AR = 0.75, FR = 0.75, GE = 0.34, FACE = 0.48, OH = 0.35, WT = ENT + AR + FR;
  const DE = { t: 'doric_entablature', axes: { x: X, z: Z }, y: ENT, face: FACE, arch: AR, frieze: FR, geison: GE, tw: 0.46, overhang: OH, mat: 'marble', triglyphMat: 'egyptian_blue' };
  E.push(DE);
  E.push({ ...DE, t: 'metopes', programme: { e: 'herakles', n: 'theseus', s: 'theseus' }, only: { n: [20, 21, 22, 23], s: [20, 21, 22, 23], w: [] }, bg: 'wall_red', band: 'egyptian_blue' });
  const PR = { t: 'pediment_roof', rect: [X[0] - FACE - OH, Z[0] - FACE - OH, X[12] + FACE + OH, Z[5] + FACE + OH], y: WT + GE, rise: 1.75, tympanumInset: 0.45, rakingGeison: 0.3, mat: 'marble' };
  E.push(PR);
  for (const dir of [1, -1]) {
    const [x0, z0, x1, z1] = PR.rect;
    E.push({ t: 'pediment_sculpture', x: (dir > 0 ? x1 : x0) - dir * PR.tympanumInset, dir, zc: cz, half: (z1 - z0) / 2, y: PR.y, rise: PR.rise, depth: PR.tympanumInset,
      apex: PR.y + PR.rise - PR.rakingGeison * 0.9, tz: (z1 - z0) / 2 - PR.tympanumInset * 0.6, programme: dir > 0 ? 'hephaisteion-east' : 'hephaisteion-west', paint: 'egyptian_blue' });
    E.push({ t: 'acroterion', at: [dir > 0 ? x1 - 0.35 : x0 + 0.35, cz], y: PR.y + PR.rise + PR.rakingGeison + 0.15, h: 1.4, yaw: Math.PI / 2 });
  }
  // the cella on its step: the long walls, the pronaos (east) and the opisthodomos (west) with two columns in antis each
  const FL = ST + 0.3, XP = X[10], XO = cx - 11.5, XD = cx + 6.0, XB = cx - 8.3, ZW = 3.85;
  E.push({ t: 'block', rect: [XO - 0.6, cz - ZW - 0.6, XP + 0.6, cz + ZW + 0.6], y0: ST - 0.2, y1: FL, mat: 'marble', walk: true, collide: false });
  for (const s of [-1, 1]) E.push({ t: 'wall', a: [XO, cz + s * ZW], b: [XP, cz + s * ZW], th: 0.8, y0: FL, y1: WT, mat: 'marble', trim: { crown: 0.16, projection: 0.06 } });
  E.push({ t: 'wall', a: [XD, cz - ZW + 0.4], b: [XD, cz + ZW - 0.4], th: 0.8, y0: FL, y1: WT, mat: 'marble', openings: [{ at: ZW - 0.4, w: 2.6, h: 4.3, y0: FL }] });
  E.push({ t: 'wall', a: [XB, cz - ZW + 0.4], b: [XB, cz + ZW - 0.4], th: 0.8, y0: FL, y1: WT, mat: 'marble' });
  for (const xa of [XP, XO]) {
    for (const s of [-1, 1]) E.push({ t: 'column', at: [xa, cz + s * 1.3], y: FL, h: ENT - FL, d: 0.88, mat: 'marble_column' });
    for (const s of [-1, 1]) E.push({ t: 'block', rect: [xa - 0.45, cz + s * ZW - 0.5, xa + 0.45, cz + s * ZW + 0.5], y0: ENT - 0.35, y1: ENT, mat: 'marble', collide: false });
  }
  // over the pronaos the architrave and the frieze run across the pteron to the peristyle; over the opisthodomos, the porch only
  const zi = Z[5] - FACE - cz;
  E.push({ t: 'beam', a: [XP, cz - zi], b: [XP, cz + zi], y: ENT, w: 0.9, h: AR, mat: 'marble' });
  E.push({ t: 'beam', a: [XP, cz - zi], b: [XP, cz + zi], y: ENT + AR, w: 0.8, h: FR, mat: 'marble' });
  E.push({ t: 'beam', a: [XO, cz - ZW - 0.4], b: [XO, cz + ZW + 0.4], y: ENT, w: 0.9, h: AR, mat: 'marble' });
  E.push({ t: 'beam', a: [XO, cz - ZW - 0.4], b: [XO, cz + ZW + 0.4], y: ENT + AR, w: 0.8, h: FR, mat: 'marble' });
  E.push({ t: 'frieze_relief', y0: ENT + AR + 0.04, h: FR - 0.1, bg: 'egyptian_blue', runs: [
    { a: [XP + 0.4, cz + zi], b: [XP + 0.4, cz - zi], o: [1, 0], seq: 'battle', toward: 'b' },
    { a: [XO - 0.4, cz - ZW - 0.4], b: [XO - 0.4, cz + ZW + 0.4], o: [-1, 0], seq: 'centaurs', toward: 'b' }] });
  // the marble coffers over the pteron and the porches
  const cy = WT - 0.3, cof = (r) => E.push({ t: 'coffers', rect: r, y: cy, depth: 0.3, cell: 0.82, beam: 0.16, mat: 'marble' });
  for (const s of [-1, 1]) cof([X[0] + FACE, Math.min(s * (zi), s * (ZW + 0.4)) + cz, X[12] - FACE, Math.max(s * zi, s * (ZW + 0.4)) + cz]);
  cof([XP + 0.4, cz - ZW - 0.4, X[12] - FACE, cz + ZW + 0.4]); cof([X[0] + FACE, cz - ZW - 0.4, XO - 0.45, cz + ZW + 0.4]);
  cof([XD + 0.4, cz - ZW + 0.4, XP - 0.45, cz + ZW - 0.4]); cof([XO + 0.45, cz - ZW + 0.4, XB - 0.4, cz + ZW - 0.4]);
  // the cella's colonnade in two storeys, five down each side and three across the back, its timber ceiling
  const LH = 3.25, UH = 2.05, IB = 0.4, IX = [cx - 6.6, cx - 4.0, cx - 1.4, cx + 1.2, cx + 3.8];
  const ring = [...IX.flatMap((x) => [[x, cz - 2.2], [x, cz + 2.2]]), [IX[0], cz]];
  for (const [x, z] of ring) {
    E.push({ t: 'column', at: [x, z], y: FL, h: LH, d: 0.56, mat: 'marble_column' });
    E.push({ t: 'column', at: [x, z], y: FL + LH + IB, h: UH, d: 0.43, mat: 'marble_column', abacus: 1.15 });
  }
  for (const s of [-1, 1]) for (const [yy, hh] of [[FL + LH, IB], [FL + LH + IB + UH, WT - 0.35 - (FL + LH + IB + UH)]]) E.push({ t: 'beam', a: [IX[0], cz + s * 2.2], b: [IX[4] + 0.3, cz + s * 2.2], y: yy, w: 0.5, h: hh, mat: 'marble' });
  for (const [yy, hh] of [[FL + LH, IB], [FL + LH + IB + UH, WT - 0.35 - (FL + LH + IB + UH)]]) E.push({ t: 'beam', a: [IX[0], cz - 2.2], b: [IX[0], cz + 2.2], y: yy, w: 0.5, h: hh, mat: 'marble' });
  E.push({ t: 'coffers', rect: [XB + 0.4, cz - ZW + 0.4, XD - 0.4, cz + ZW - 0.4], y: WT - 0.35, depth: 0.3, cell: 1.1, beam: 0.2, mat: 'cedar' });
  E.push({ t: 'obj', kind: 'doors', at: [XD - 0.4, cz], y: FL, yaw: -Math.PI / 2, w: 2.6, h: 4.3, th: 0.16, depth: 0 });
  E.push({ t: 'cult_pair', at: [cx - 5.0, cz], y: FL });
}
// the stoas: the Painted Stoa on the north (about 460: its panels of Marathon, the Amazons, Troy and Oinoe, the
// Spartan shields of 425), the Stoa of Zeus of Freedom on the west (about 425–410: Doric outside, Ionic inside, its two
// wings with Victories on their roofs, Zeus before it), South Stoa I (the late fifth century: a double colonnade of
// stuccoed poros before a row of dining rooms of mudbrick)
E.push({ t: 'stoa', rect: [-252, -237.6, -204, -225], front: 's', y: 0.62, h: 4.9, d: 0.8, sp: 1.998, flutes: 20, frieze: 0.718, tw: 0.384, arch: 0.66, inner: { d: 0.55, every: 2 }, paintings: ['marathon', 'amazons', 'troy', 'oinoe'], shields: true, mat: 'limestone', wall: 'limestone', triglyphMat: 'egyptian_blue' });
E.push({ t: 'stoa', rect: [-292, -195, -281.27, -151.44], front: 'e', y: 0.4, h: 5.0, d: 0.79, sp: 3.02, flutes: 20, inner: { d: 0.69, every: 2 }, wings: { depth: 5.86, width: 10.6, sp: 2.01 }, nikai: true, shields: true, mat: 'limestone', wall: 'limestone', triglyphMat: 'egyptian_blue' });
E.push({ t: 'zeus_statue', at: [-268.5, -173.2], y: 0, rot: Math.PI / 2 });
E.push({ t: 'stoa', rect: [-262, -124.89, -219, -110], front: 'n', y: 0.35, h: 3.6, d: 0.53, sp: 1.745, flutes: 0, inner: { d: 0.5, every: 2 }, rooms: { n: 8, depth: 5.9 }, mat: 'limestone', wall: 'mud_plaster', seed: 41 });
E.push({ t: 'tholos', c: [-280, -133], r: 9.16, h: 5.2, y: 0.1 });
E.push({ t: 'horos', at: [-267.5, -120.5], y: 0, rot: Math.PI / 2 });
E.push({ t: 'altar12', c: [-240, -208], y: 0 });
// the Herms at the north-west corner, where the Panathenaic Way comes in
const wayX = (z) => -260 + (z + 220) / 2;
for (const z of [-221, -218, -215, -212]) E.push({ t: 'herm', at: [wayX(z) + 7, z], y: height(wayX(z) + 7, z), rot: -Math.PI / 2 });
// the market: booths behind their wicker screens in rows, the aisles between them, east of the Way
{
  let seed = 101;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const kinds = ['pots', 'oil', 'fish', 'bread', 'myrtle', 'pots', 'oil', 'bank'];
  for (let j = 0; j < 5; j++) for (const [dz, front] of [[0, 's'], [6.4, 'n']]) {
    const z0 = -197 + j * 13 + dz;
    for (let x = Math.max(wayX(z0 + 1) + 9, -238); x < -179; x += 4.4) {
      if (rnd() < 0.42) continue;
      const jx = (rnd() - 0.5) * 0.9, jz = (rnd() - 0.5) * 0.8, r = [x + jx, z0 + jz, x + jx + 2.6 + rnd() * 0.8, z0 + jz + 2.2];
      if (pathAt(x + 1.5, z0 + 1.1, WAY)[0] < 9) continue;
      E.push({ t: 'booth', rect: r, front, kind: kinds[Math.floor(rnd() * kinds.length)], y: height(x + 1.5, z0 + 1.1), seed: Math.floor(rnd() * 1e6) });
    }
  }
}

// the summit's smaller sanctuaries and the south slope (docs/settlements/athens.md §4e–§4f)
E.push(...summitSanctuaries(T + 0.04), ...southSlope());

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
  bounds: [-330, -310, 180, 205],
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
    apex: PR.y + PR.rise - rg * 0.9, tz: (z1 - z0) / 2 - inset * 0.6, programme: dir > 0 ? 'parthenon-east' : 'parthenon-west', paint: 'egyptian_blue' };
};
const FX = 26.725, FZ = 10.85, FY = DE.y + DE.arch;                      // the frieze: the outer faces of the cella walls and the porch beams
const parthenonArt = [
  pediment(1), pediment(-1),
  { ...DE, t: 'metopes', programme: { e: 'gigantomachy', w: 'amazonomachy', n: 'troy', s: 'centauromachy' }, bg: 'wall_red', band: 'egyptian_blue' },
  { t: 'frieze_relief', y0: FY, h: 1.0, bg: 'egyptian_blue', runs: [
    { a: [-FX, -FZ], b: [FX, -FZ], o: [0, -1], seq: 'procession', toward: 'b' },
    { a: [-FX, FZ], b: [FX, FZ], o: [0, 1], seq: 'procession', toward: 'b' },
    { a: [-FX, FZ], b: [-FX, -FZ], o: [-1, 0], seq: 'cavalcade', toward: 'b' },
    { a: [FX, FZ], b: [FX, -FZ], o: [1, 0], seq: 'east', toward: 'mid' },
  ] },
  ...[1, -1].map((dir) => ({ t: 'acroterion', at: [dir * (PR.rect[2] - 0.6), 0], y: PR.y + PR.rise + PR.rakingGeison + 0.3, h: 2.6, yaw: Math.PI / 2 })),
];
export const parthenon = { ...parthenonPlan, elements: [...PE.map((e) => (e === DE ? { ...e, triglyphMat: 'egyptian_blue' } : e)), ...parthenonArt],
  origin: [18, 18], base: T, district: undefined, view: [18 - 35, 18 - 16, 18 + 35, 18 + 16], viewY: T };
export default acropolis;
