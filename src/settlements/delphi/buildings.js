// The buildings of the sanctuary as plan elements (docs/settlements/delphi.md §4): the Temple of Apollo, the treasuries, the
// Athenian Stoa, the Chians' altar, the terrace's walls. Pure data; each pushes onto the list it is given.
import { subtractRects } from '../../core/build.js';
import { STAIR, TT, TT_Y, TEMPLE, ALTAR, STOA, SPHINX, SERPENT, height, WALL_S, WALL_E, GATE, inRect } from './layout.js';

const PI = Math.PI;
/** A retaining wall along a→b on the downhill side: the polygonal masonry, segment by segment from below the ground to `top`. */
export function retain(E, a, b, top, face, seed, o = {}) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / 5)), ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
  for (let i = 0; i < n; i++) {
    const p = [a[0] + ux * L * i / n, a[1] + uz * L * i / n], q = [a[0] + ux * L * (i + 1) / n, a[1] + uz * L * (i + 1) / n];
    const nx = uz * face, nz = -ux * face;
    const gs = [0, 0.5, 1].flatMap((t) => [1.6, 2.6].map((off) => height(p[0] + (q[0] - p[0]) * t + nx * off, p[1] + (q[1] - p[1]) * t + nz * off)));
    const g = Math.min(...gs, height(p[0], p[1]), height(q[0], q[1]));
    if (top - g < 0.3) continue;
    E.push({ t: o.rough ? 'wall' : 'polygonal_wall', a: p, b: q, face, th: o.th ?? 1.6, y0: g - 0.6, y1: o.cap ? top + o.cap : top, mat: o.mat ?? 'limestone', seed: seed + i, ...(o.rough ? { } : {}) });
  }
}

/** The terrace's walls: the polygonal wall on its south side, plainer walls east and west; the precinct's south and east walls. */
export function terraceWalls(E) {
  const [x0, z0, x1, z1] = TT;
  retain(E, [x0, z1], [STAIR[0] - 0.6, z1], TT_Y, -1, 100);
  retain(E, [STAIR[2] + 0.6, z1], [x1, z1], TT_Y, -1, 150);
  retain(E, [x1, z1], [x1, z0], TT_Y, -1, 200, { rough: true, th: 1.4, cap: 0 });
  retain(E, [x0, z1], [x0, z0], TT_Y, 1, 300, { rough: true, th: 1.4 });
  // the precinct's south wall (with the gate) and east wall: a rubble wall 3 m high on its stone footing
  const PW = (a, b) => E.push({ t: 'wall', a, b, th: 1.0, y0: Math.min(height(a[0], a[1]), height(b[0], b[1])) - 0.8, y1: Math.max(height(a[0], a[1]), height(b[0], b[1])) + 2.8, mat: 'limestone' });
  const g0 = GATE.x - GATE.w / 2, g1 = GATE.x + GATE.w / 2;
  for (let x = -70; x < g0 - 1; x += 8) PW([x, WALL_S], [Math.min(x + 8, g0), WALL_S]);
  PW([g1, WALL_S], [WALL_E, WALL_S]);
  for (let z = WALL_S; z > -60; z -= 8) PW([WALL_E, z], [WALL_E, Math.max(z - 8, -60)]);
  // the gate: two piers and a lintel
  for (const s of [-1, 1]) E.push({ t: 'block', rect: [GATE.x + s * (GATE.w / 2 + 0.5) - 0.5, WALL_S - 0.7, GATE.x + s * (GATE.w / 2 + 0.5) + 0.5, WALL_S + 0.7], y0: height(GATE.x, WALL_S) - 0.6, y1: height(GATE.x, WALL_S) + 3.6, mat: 'marble' });
  E.push({ t: 'beam', a: [g0 - 0.4, WALL_S], b: [g1 + 0.4, WALL_S], y: height(GATE.x, WALL_S) + 3.2, w: 1.1, h: 0.55, mat: 'marble' });
}

/** The Temple of Apollo, the fifth: Doric 6 × 15, marble in front, poros elsewhere; pronaos, cella with the hearth, the sunk adyton. Returns the rooms. */
export function temple(E) {
  const { cx, cz } = TEMPLE, y0 = TT_Y, RISE = 0.45, TR = 0.6, ST = y0 + 3 * RISE, FL = ST + 0.2, YA = y0 + RISE;   // the adyton's floor: the top of the lowest step
  const SBR = [-29.1, cz - 10.85, 29.1, cz + 10.85];
  const X = Array.from({ length: 15 }, (_, i) => -28 + i * 4), Z = Array.from({ length: 6 }, (_, i) => cz - 9.75 + i * 3.9);
  const COL_H = 7.6, COL_D = 1.35, ENT = ST + COL_H, ARCH = 1.0, FR = 1.05, GE = 0.5, FACE = 0.8, FT = ENT + ARCH + FR, TOP = FT + GE;
  // ── the steps: three, laid ring by ring so that the adyton's well can be cut through the two upper ones
  const ADY = [-23.9, cz - 5.2, -16.55, cz + 5.2];
  const stairCut = [SBR[2] - 0.1, cz - 2.7, SBR[2] + 3.2, cz + 2.7];
  for (let i = 0; i < 3; i++) {
    const o = (2 - i) * TR, r = [SBR[0] - o, SBR[1] - o, SBR[2] + o, SBR[3] + o], holes = i === 0 ? [stairCut] : [stairCut, ADY];
    for (const q of subtractRects(r, holes)) E.push({ t: 'block', rect: q, y0: i === 0 ? y0 - 0.6 : y0 + i * RISE, y1: y0 + (i + 1) * RISE, mat: 'marble', walk: true });
  }
  E.push({ t: 'stair', rect: [SBR[2], cz - 2.6, SBR[2] + 2.8, cz + 2.6], dir: 'w', y0, y1: ST, riser: 0.15, base: y0 - 0.3, mat: 'marble' });
  // ── the peristyle: 6 × 15, the front of Parian marble, the flanks and the back of poros
  for (const x of X) for (const z of [Z[0], Z[5]]) E.push({ t: 'column', at: [x, z], y: ST, h: COL_H, d: COL_D, mat: x === X[14] ? 'marble_column' : 'limestone' });
  for (const z of Z.slice(1, -1)) for (const x of [X[0], X[14]]) E.push({ t: 'column', at: [x, z], y: ST, h: COL_H, d: COL_D, mat: x === X[14] ? 'marble_column' : 'limestone' });
  const DE = { axes: { x: X, z: Z }, y: ENT, face: FACE, arch: ARCH, frieze: FR, geison: GE, tw: 0.6, overhang: 0.6 };
  E.push({ t: 'doric_entablature', ...DE, mat: 'marble', triglyphMat: 'egyptian_blue' });
  E.push({ t: 'metopes', ...DE, programme: { e: 'gigantomachy', w: 'amazonomachy' }, bg: 'wall_red', band: 'egyptian_blue' });
  const PR = [X[0] - FACE - 0.6, Z[0] - FACE - 0.6, X[14] + FACE + 0.6, Z[5] + FACE + 0.6];
  E.push({ t: 'pediment_roof', rect: PR, y: TOP, rise: 2.7, tympanumInset: 0.8, rakingGeison: 0.5, mat: 'marble', tileMat: 'roof_tile' });
  for (const s of [-1, 1]) E.push({ t: 'acroterion', at: [s * (PR[2] - 0.7), cz], y: TOP + 2.7 + 0.8, h: 2.2, yaw: PI / 2 });
  // the ceilings of the pteron: timber coffers from the colonnade to the cella's walls
  const CW0 = cz - 7.3, CW1 = cz + 5.3, XE = 22.6;
  for (const [za, zb] of [[Z[0] + 0.5, CW0], [CW1, Z[5] - 0.5]]) E.push({ t: 'coffers', rect: [X[0] + 0.5, za, X[14] - 0.5, zb], y: FT, depth: 0.3, cell: 1.0, beam: 0.22, mat: 'cedar' });
  E.push({ t: 'coffers', rect: [XE + 0.5, CW0, X[14] - 0.5, CW1], y: FT, depth: 0.3, cell: 1.0, beam: 0.22, mat: 'cedar' });
  E.push({ t: 'coffers', rect: [X[0] + 0.5, CW0, -25.1, CW1], y: FT, depth: 0.3, cell: 1.0, beam: 0.22, mat: 'cedar' });
  // ── the cella: its walls from the back (west) to the antae, the pronaos with two columns between them, the cross walls
  const WZ0 = cz - 6.75, WZ1 = cz + 4.75, W = (a, b, th, ops = [], y = FL - 0.1, m = 'limestone') => E.push({ t: 'wall', a, b, th, y0: y, y1: FT, mat: m, openings: ops });
  W([-25.1, WZ0], [XE, WZ0], 1.1);
  W([-25.1, WZ1], [XE, WZ1], 1.1);
  W([-24.5, WZ0 - 0.55], [-24.5, WZ1 + 0.55], 1.2);
  // the cross wall of the cella: the great door, 3.4 × 6.6
  W([19, WZ0 + 0.55], [19, WZ1 - 0.55], 1.0, [{ at: (WZ1 - WZ0 - 1.1) / 2, w: 3.4, h: 6.6, y0: FL, frameW: 0.4 }], FL - 0.1, 'marble');
  // the adyton's: a low door in the wall at its east end, the floor 1.1 m below the cella's
  W([-16.2, WZ0 + 0.55], [-16.2, WZ1 - 0.55], 0.7, [{ at: (WZ1 - WZ0 - 1.1) / 2, w: 2.2, h: 3.8, y0: FL, frameW: 0.3 }], YA);
  for (const z of [cz - 3.1, cz + 1.1]) E.push({ t: 'column', at: [XE + 0.2, z], y: FL, h: ENT - FL, d: 1.15, mat: 'marble_column' });
  E.push({ t: 'beam', a: [XE + 0.2, WZ0 - 0.55], b: [XE + 0.2, WZ1 + 0.55], y: ENT, w: 1.3, h: ARCH, mat: 'marble' });
  E.push({ t: 'beam', a: [XE + 0.2, WZ0 - 0.55], b: [XE + 0.2, WZ1 + 0.55], y: ENT + ARCH, w: 1.1, h: FT - ENT - ARCH, mat: 'marble' });
  // floors: the cella and pronaos of blue-grey limestone, the adyton's sunk
  E.push({ t: 'floor', rect: [-15.85, cz - 6.2, 24.0, cz + 4.2], y: FL, th: 0.3, mat: 'flagstone' });
  E.push({ t: 'floor', rect: [ADY[0], ADY[1], ADY[2], ADY[3]], y: YA, th: 0.3, mat: 'flagstone' });
  E.push({ t: 'stair', rect: [-18.9, cz - 1.1, -16.55, cz + 1.1], dir: 'e', y0: YA, y1: FL, riser: 0.138, base: YA - 0.3, mat: 'limestone' });
  E.push({ t: 'coffers', rect: [-15.8, WZ0 + 0.55, 18.5, WZ1 - 0.55], y: FT - 0.3, depth: 0.3, cell: 1.2, beam: 0.2, mat: 'cedar' });
  E.push({ t: 'coffers', rect: [ADY[0], ADY[1], ADY[2], ADY[3]], y: FT - 0.3, depth: 0.3, cell: 1.2, beam: 0.2, mat: 'cedar' });
  E.push({ t: 'coffers', rect: [19.5, WZ0 + 0.55, XE - 0.1, WZ1 - 0.55], y: FT - 0.3, depth: 0.3, cell: 1.2, beam: 0.2, mat: 'cedar' });
  E.push({ t: 'obj', kind: 'doors', at: [18.4, cz], y: FL, yaw: -PI / 2, w: 3.4, h: 6.6, th: 0.2, depth: 0 });
  // the maxims cut in the pronaos' face of the cross wall: three tablets in lines of lettering, the E in bronze over the door
  for (const [za, zb, k] of [[cz - 6.0, cz - 3.9, 0], [cz - 3.7, cz - 2.2, 1], [cz + 1.4, cz + 3.9, 2]]) {
    E.push({ t: 'block', rect: [19.5, za, 19.56, zb], y0: FL + 1.8, y1: FL + 4.1, mat: 'marble_smooth', collide: false });
    for (let i = 0; i < 9; i++) E.push({ t: 'block', rect: [19.56, za + 0.14, 19.585, zb - 0.14 - (i % 3 === 2 ? 0.45 : 0)], y0: FL + 1.95 + i * 0.22, y1: FL + 2.03 + i * 0.22, mat: 'marble_dark', collide: false });
    void k;
  }
  // the E of Delphi, in gilded bronze, on the frieze band over the door
  { const ye = ENT + ARCH + 0.12, xe = XE + 0.2 + 0.56;
    E.push({ t: 'block', rect: [xe, cz - 0.45, xe + 0.05, cz - 0.37], y0: ye, y1: ye + 0.8, mat: 'gilt_bronze', collide: false });
    for (const k of [0, 1, 2]) E.push({ t: 'block', rect: [xe, cz - 0.45, xe + 0.05, cz + 0.35], y0: ye + k * 0.36, y1: ye + k * 0.36 + 0.08, mat: 'gilt_bronze', collide: false }); }
  // ── the cella's furnishings: the hearth of Apollo under the lamps, the paintings of Aristokles on the long walls, offerings
  E.push({ t: 'hearth', c: [-2.5, cz], y: FL, r: 1.0 });
  E.push({ t: 'lamp', at: [-2.5, FL + 2.4, cz], color: '#ffb066', intensity: 9, distance: 16 });
  for (const x of [-11, 4.5, 12.5]) for (const s of [-1, 1]) E.push({ t: 'lamp', at: [x, FL + 3.2, cz + s * 3.6], stand: FL, color: '#ffc27a', intensity: 6, distance: 13 });
  ['wall_red', 'egyptian_blue', 'paint_ochre', 'wall_red', 'egyptian_blue'].forEach((m, i) => {
    for (const [zz, s] of [[WZ0 + 0.55, 1], [WZ1 - 0.55, -1]]) {
      const x = -12.5 + i * 6.2 + (s > 0 ? 0 : 3.0);
      const z0 = s > 0 ? zz : zz - 0.06, z1 = s > 0 ? zz + 0.06 : zz;
      E.push({ t: 'block', rect: [x - 1.4, z0, x + 1.4, z1], y0: FL + 1.6, y1: FL + 3.5, mat: 'cedar', collide: false });
      E.push({ t: 'block', rect: [x - 1.3, s > 0 ? z1 : z0 - 0.03, x + 1.3, s > 0 ? z1 + 0.03 : z0], y0: FL + 1.7, y1: FL + 3.4, mat: m, collide: false });
    }
  });
  E.push({ t: 'ex_voto', at: [8.5, cz - 4.5], yaw: PI, kind: 'man', h: 2.0, y: FL });
  E.push({ t: 'ex_voto', at: [8.5, cz + 2.5], yaw: 0, kind: 'man', h: 2.0, y: FL });
  E.push({ t: 'votive', kind: 'tripod', at: [-10.5, cz - 4.5], y: FL });
  E.push({ t: 'votive', kind: 'tripod', at: [-10.5, cz + 2.5], y: FL });
  // ── the adyton: the omphalos, the Pythia's tripod over the cleft, the gilded Apollo, the laurel, the fire; a lamp
  E.push({ t: 'adyton', c: [-20.0, cz - 0.1], y: YA });
  E.push({ t: 'lamp', at: [-20.0, YA + 2.6, cz - 0.1], color: '#ffa860', intensity: 7, distance: 11 });
  return {
    FL, ST, ENT, FT,
    rooms: [
      { id: 'pronaos', rect: [19.6, cz - 6.0, 23.8, cz + 4.0], y: FL, kind: 'open' },
      { id: 'cella', rect: [-15.4, cz - 6.0, 18.4, cz + 4.0], y: FL, kind: 'hall' },
      { id: 'adyton', rect: [-23.5, cz - 4.9, -17.4, cz + 4.7], y: YA, kind: 'inner' },
    ],
  };
}

/** A treasury on its pad: { id, rect: [x0, z0, x1, z1], kind ('doric' | 'ionic' | 'siphnian' | 'athenian'), mat, y }. Front south (z1). Returns its room. */
export function treasury(E, t) {
  const [x0, z0, x1, z1] = t.rect, y = t.y, mat = t.mat, ion = t.kind === 'ionic', sip = t.kind === 'siphnian', ath = t.kind === 'athenian';
  const KR = [x0 + 0.35, z0 + 0.35, x1 - 0.35, z1 - 0.35], yT = y + 0.44;
  E.push({ t: 'krepis', rect: KR, y0: y, steps: 2, rise: 0.22, tread: 0.35, mat });
  const xl = KR[0] + 0.45, xr = KR[2] - 0.45, zb = KR[1] + 0.45, zf = KR[3] - 0.35, zc = zf - 3.1, W = xr - xl, FLR = yT + 0.1;
  const h = ion || sip ? 3.9 : 4.4, ENT = yT + h, A = ion || sip ? 0.45 : 0.55, F = ion || sip ? 0.4 : 0.55, G = 0.26, FT = ENT + A + F;
  const cols = [xl + W * 0.34, xl + W * 0.66];
  E.push({ t: 'floor', rect: [xl - 0.3, zb - 0.3, xr + 0.3, zf + 0.3], y: FLR, th: 0.3, mat: 'flagstone' });
  const wall = (a, b, ops = []) => E.push({ t: 'wall', a, b, th: 0.55, y0: FLR, y1: FT, mat, openings: ops });
  wall([xl, zb - 0.27], [xl, zf]); wall([xr, zb - 0.27], [xr, zf]); wall([xl - 0.27, zb], [xr + 0.27, zb]);
  wall([xl - 0.27, zc], [xr + 0.27, zc], [{ at: W / 2 + 0.27, w: 1.35, h: 2.9, y0: FLR, frameW: 0.25 }]);
  if (sip) {
    for (const x of cols) { E.push({ t: 'block', rect: [x - 0.5, zf - 0.5, x + 0.5, zf + 0.5], y0: yT, y1: yT + 0.85, mat: 'marble' }); E.push({ t: 'kore', at: [x, zf], y: yT + 0.85, yaw: 0, h: 2.35, mat: 'marble_smooth' }); }
  } else for (const x of cols) E.push({ t: 'column', at: [x, zf], y: yT, h, d: ion ? 0.52 : 0.6, mat: mat === 'marble' ? 'marble_column' : 'limestone', ...(ion ? { order: 'ionic' } : {}) });
  const axes = { x: [xl, ...cols, xr], z: [zb, zf] };
  if (ion || sip) E.push({ t: 'ionic_entablature', axes, y: ENT, face: 0.4, arch: A, frieze: F, geison: G, overhang: 0.35, mat, friezeMat: sip ? 'egyptian_blue' : undefined });
  else {
    E.push({ t: 'doric_entablature', axes, y: ENT, face: 0.4, arch: A, frieze: F, geison: G, tw: 0.4, overhang: 0.32, mat, triglyphMat: 'egyptian_blue' });
    if (ath) E.push({ t: 'metopes', axes, y: ENT, face: 0.4, arch: A, frieze: F, geison: G, tw: 0.4, programme: { s: 'amazonomachy', n: 'centauromachy', e: 'amazonomachy', w: 'centauromachy' }, bg: 'wall_red', band: 'egyptian_blue' });
  }
  E.push({ t: 'pediment_roof', rect: [xl - 0.4 - 0.32, zb - 0.4 - 0.32, xr + 0.4 + 0.32, zf + 0.4 + 0.32], y: FT + G, rise: 1.05, tympanumInset: 0.35, rakingGeison: 0.25, mat, tileMat: 'roof_tile' });
  E.push({ t: 'slab', rect: [xl, zb, xr, zf], y0: FT - 0.2, y1: FT - 0.05, mat: 'cedar' });
  // the base's dedication cut along the front, the paintings and the offerings inside
  const cut = []; for (let i = 0; i < 9; i++) cut.push(KR[0] + 0.5 + i * (KR[2] - KR[0] - 1.0) / 9);
  for (const u of cut) E.push({ t: 'block', rect: [u, KR[3] + 0.3, u + (KR[2] - KR[0] - 1.0) / 13, KR[3] + 0.338], y0: y + 0.1, y1: y + 0.17, mat: 'marble_dark', collide: false });
  E.push({ t: 'ex_voto', at: [(xl + xr) / 2, zb + 1.1], yaw: PI, kind: 'man', h: 1.8, y: FLR });
  E.push({ t: 'lamp', at: [(xl + xr) / 2, FLR + 2.6, (zb + zc) / 2], color: '#ffc27a', intensity: 5, distance: 9 });
  if (ath) E.push({ t: 'block', rect: [xl + 0.4, zb + 0.3 + 1.2, xl + 0.46, zc - 0.5], y0: FLR + 1.4, y1: FLR + 2.9, mat: 'wall_red', collide: false });
  return { id: `treasury ${t.id}`, rect: [xl + 0.35, zb + 0.35, xr - 0.35, zc - 0.35], y: FLR, kind: 'inner' };
}

/** The Athenian Stoa: seven monolithic Ionic columns before the polygonal wall, the trophies of the sea battles on the wall. */
export function stoa(E) {
  const [x0, z0, x1, z1] = STOA, y = STOA.y, yF = y + 0.5, h = 3.9, ENT = yF + h;
  E.push({ t: 'krepis', rect: [x0, z0, x1, z1 - 0.9], y0: y - 0.1, steps: 2, rise: 0.25, tread: 0.3, mat: 'marble' });
  const zc = z1 - 1.5, step = (x1 - x0 - 1.6) / 6;
  const xs = Array.from({ length: 7 }, (_, i) => x0 + 0.8 + i * step);
  for (const x of xs) E.push({ t: 'column', at: [x, zc], y: yF, h, d: 0.66, mat: 'marble_column', order: 'ionic' });
  E.push({ t: 'beam', a: [x0, zc], b: [x1, zc], y: ENT, w: 0.9, h: 0.55, mat: 'marble' });
  E.push({ t: 'beam', a: [x0, zc], b: [x1, zc], y: ENT + 0.55, w: 0.8, h: 0.5, mat: 'marble_dark' });
  E.push({ t: 'beam', a: [x0 - 0.2, zc + 0.1], b: [x1 + 0.2, zc + 0.1], y: ENT + 1.05, w: 1.35, h: 0.3, mat: 'marble' });
  E.push({ t: 'slab', rect: [x0 - 0.2, z0 - 0.3, x1 + 0.2, zc + 0.75], y0: ENT + 0.9, y1: ENT + 1.2, mat: 'roof_tile' });
  E.push({ t: 'slab', rect: [x0, z0, x1, zc], y0: ENT + 0.5, y1: ENT + 0.9, mat: 'cedar' });
  E.push({ t: 'floor', rect: [x0, z0 + 0.1, x1, zc + 0.4], y: yF, th: 0.3, mat: 'flagstone' });
  // the end walls
  for (const x of [x0 + 0.15, x1 - 0.15]) E.push({ t: 'wall', a: [x, z0 + 0.1], b: [x, zc], th: 0.4, y0: yF, y1: ENT + 0.5, mat: 'limestone' });
  E.push({ t: 'armoury', rect: [x0 + 1.0, z0 + 0.3, x1 - 1.0, z0 + 0.9], y: yF, seed: 31 });
  E.push({ t: 'ex_voto', at: [(x0 + x1) / 2 - 4, (z0 + zc) / 2 + 0.3], yaw: PI, kind: 'man', h: 1.9, y: yF });
  return { id: 'Athenian stoa', rect: [x0 + 0.4, z0 + 0.3, x1 - 0.4, zc - 0.4], y: yF, kind: 'inner' };
}

/** The altar of the Chians (black marble on a white base and cornice), the Serpent Column, the Naxian sphinx, the monuments on the terrace. */
export function terraceMonuments(E) {
  const [ax, az] = ALTAR.c, w = ALTAR.w / 2, d = ALTAR.d / 2, y = TT_Y;
  E.push({ t: 'block', rect: [ax - w - 1.6, az - d - 1.6, ax + w + 1.6, az + d + 1.6], y0: y - 0.6, y1: y + 0.25, mat: 'marble', walk: true });
  E.push({ t: 'block', rect: [ax - w - 0.8, az - d - 0.8, ax + w + 0.8, az + d + 0.8], y0: y + 0.25, y1: y + 0.5, mat: 'marble', walk: true });
  E.push({ t: 'block', rect: [ax - w - 0.25, az - d - 0.25, ax + w + 0.25, az + d + 0.25], y0: y + 0.5, y1: y + 0.95, mat: 'marble' });
  E.push({ t: 'block', rect: [ax - w, az - d, ax + w, az + d], y0: y + 0.95, y1: y + 2.55, mat: 'marble_dark' });
  E.push({ t: 'block', rect: [ax - w - 0.3, az - d - 0.3, ax + w + 0.3, az + d + 0.3], y0: y + 2.55, y1: y + 2.8, mat: 'marble' });
  E.push({ t: 'lamp', at: [ax, y + 3.1, az], color: '#ff9a50', intensity: 6, distance: 12 });
  E.push({ t: 'serpent_column', at: SERPENT, y });
  E.push({ t: 'sphinx_column', at: SPHINX, y });
  // offerings along the terrace: the bull of Corcyra, bronzes on their bases, tripods and decrees
  E.push({ t: 'ex_voto', at: [36, -12], yaw: -PI / 2, kind: 'bull', y });
  E.push({ t: 'ex_voto', at: [38, 8], yaw: -PI / 2, kind: 'group', y });
  E.push({ t: 'ex_voto', at: [58, 7], yaw: PI, kind: 'man', h: 2.1, y });
  E.push({ t: 'ex_voto', at: [64, -9], yaw: PI / 2, kind: 'group', y });
  E.push({ t: 'votive', kind: 'tripod', at: [54, 13], y });
  E.push({ t: 'votive', kind: 'tripod', at: [32, -16], y });
  for (const [x, z, h] of [[-10, -17, 2.4], [8, -17.5, 1.9], [26, -17, 2.8], [47, -16.5, 2.2]]) E.push({ t: 'votive', kind: 'stele', at: [x, z], y, yaw: Math.PI, h, w: 0.62 });
  // the Sibyl's rock, between the Athenian treasury and the stoa: a boulder with a low bench
  E.push({ t: 'cyclopean', a: [74, 33], b: [74, 39], th: 2.6, y0: height(74, 36) - 0.5, y1: height(74, 36) + 2.2, seed: 11 });
}
void inRect;
