// The Giparu of Ur and the small public chapels of its quarter (docs/settlements/ur.md §4.3, §5.3).
// `giparu`: Woolley's plan — a nearly square compound inside thick buttressed walls, a street through
// its middle between two blocks each with its own gateway; the Ningal temple on the south with two
// offset lobbies, a forecourt, the great court with its lustration tank, pillar and altar, the sanctuary
// range on the east (antechambers, the cella, bedchamber, treasury), a weaver's workroom, a kitchen
// court with a well; the northwest block with its wide court, a row of rooms (tablets, lustration) and
// its own cella. `ur_chapel`: Woolley's public chapel — a raised elaborate doorway guarded by terracotta
// demons, a lobby with an ablution alcove, a small open court with a brick altar between two pedestals,
// the cult room with its niche and platform, two side rooms.
// Everything is built hollow and walkable; walls stop 0.3 m under the roof slabs (no coplanar tops).

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import { buttresses, stairs } from './index.js';

const BB = 'brick_baked', MP = 'mud_plaster';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const JAR = [[0.001, 0], [0.1, 0], [0.13, 0.03], [0.24, 0.25], [0.25, 0.42], [0.18, 0.6], [0.09, 0.68], [0.11, 0.74], [0.08, 0.75], [0.07, 0.7], [0.001, 0.68]];
const BOWL = (r) => [[0.001, 0], [r * 0.45, 0.005], [r, r * 0.45], [r * 0.93, r * 0.47], [r * 0.4, r * 0.12], [0.001, r * 0.1]];

/** Drawing helpers in a frame: `W(u, v)` → world [x, z]; walls with doorways, roofs, lintels. */
function tools({ bag, col, lights }, W) {
  const R = (u0, v0, u1, v1) => { const a = W(u0, v0), b = W(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const B = (mat, u0, v0, u1, v1, y0, y1) => { const r = R(u0, v0, u1, v1); bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); return r; };
  const solid = (u0, v0, u1, v1, y0, y1, mat = MP) => { const r = B(mat, u0, v0, u1, v1, y0, y1); col.rect(r, y0, y1); };
  const L = (mat, prof, u, v, y, seg = 12) => { const [x, z] = W(u, v); bag.add(mat, lathe(prof, seg, null, x, y, z)); };
  const lintel = (u0, u1, v, h, th = 0.16) => { const a = W(u0 - 0.15, v), b = W(u1 + 0.15, v), T = []; beamTris(T, [a[0], h, a[1]], [b[0], h, b[1]], th * 0.6, th); bag.add('palm_trunk', fromTriangles(T)); };
  /** a wall (u0,v0)-(u1,v1) from -0.3 to h with doorways [{ a, b, h }] along it (a lintel of palm trunk over each when `lin`) */
  const wall = (u0, v0, u1, v1, holes = [], h = 5, lin = true, mat = MP) => {
    const alongU = u1 - u0 >= v1 - v0, A = alongU ? u0 : v0, Z = alongU ? u1 : v1, mid = alongU ? (v0 + v1) / 2 : (u0 + u1) / 2;
    const seg = (a, b, y0, y1) => { if (b - a < 1e-3 || y1 - y0 < 1e-3) return; const q = alongU ? [a, v0, b, v1] : [u0, a, u1, b]; solid(...q, y0, y1, mat); };
    let a = A;
    for (const o of [...holes].sort((p, q) => p.a - q.a)) { seg(a, o.a, -0.3, h); seg(o.a, o.b, o.h, h); if (lin) { if (alongU) lintel(o.a, o.b, mid, o.h - 0.1); else { const p = W(mid, o.a - 0.15), q = W(mid, o.b + 0.15), T = []; beamTris(T, [p[0], o.h - 0.1, p[1]], [q[0], o.h - 0.1, q[1]], 0.1, 0.16); bag.add('palm_trunk', fromTriangles(T)); } } a = o.b; }
    seg(a, Z, -0.3, h);
  };
  /** a flat roof slab: mud on reed mats over palm trunks (seen from under), its top at H */
  const roof = (u0, v0, u1, v1, H, beams = true) => {
    B(MP, u0, v0, u1, v1, H - 0.3, H); col.floor(R(u0, v0, u1, v1), H);
    if (beams && u1 - u0 < 12) for (let u = u0 + 0.4; u < u1 - 0.2; u += 0.7) { const a = W(u, v0), b = W(u, v1), T = []; beamTris(T, [a[0], H - 0.47, a[1]], [b[0], H - 0.47, b[1]], 0.07, 0.14); bag.add('palm_trunk', fromTriangles(T)); }
  };
  const jar = (u, v, s = 1, y = 0.06, mat = 'terracotta') => L(mat, JAR.map(([r, h]) => [r * s, h * s]), u, v, y);
  const bowl = (u, v, y, r = 0.12, mat = 'terracotta') => L(mat, BOWL(r), u, v, y);
  const lamp = (u, v, y) => { L('terracotta', [[0.001, 0], [0.05, 0.005], [0.06, 0.03], [0.03, 0.045], [0.001, 0.04]], u, v, y, 10); B('flame', u - 0.012, v - 0.012, u + 0.012, v + 0.012, y + 0.04, y + 0.08); };
  const light = (u, v, y, i = 2.5, d = 6) => { const [x, z] = W(u, v); lights.push({ at: [x, y, z], color: '#ffb46b', intensity: i, distance: d }); };
  const circ = (u, v, r, y0, y1) => { const [x, z] = W(u, v); col.circle(x, z, r, y0, y1); };
  const tomb = (u0, v0, u1, v1) => B(BB, u0, v0, u1, v1, 0.06, 0.075);   // a patch of relaid brick over a vault
  return { R, B, solid, L, lintel, wall, roof, jar, bowl, lamp, light, tomb, circ, bag, col, lights };
}

/** The Giparu: { rect, door: 'w' } — about 62 × 64 m (Woolley's was 79 × 76.5 m). Local u east, v south from the rect's north-west corner. */
export function giparu(el, ctx) {
  const [X0, Z0, X1, Z1] = el.rect, U = X1 - X0, V = Z1 - Z0;
  const T = tools(ctx, (u, v) => [X0 + u, Z0 + v]), { B, solid, L, wall, roof, jar, bowl, lamp, light, tomb, circ, bag, col } = T;
  const HW = 6.5, HR = 5.0, t = 2.4, GATE = 7.5;
  const cv = V / 2;                                              // the passage and the west gate on the middle line
  const gap = [cv - 1.6, cv + 1.6];
  // ---- the outer wall, buttressed, the gateway with its two towers and the cedar doors ----
  wall(0, 0, U, t, [], HW, false); wall(0, V - t, U, V, [], HW, false); wall(U - t, t, U, V - t, [], HW, false);
  wall(0, t, t, gap[0], [], HW, false); wall(0, gap[1], t, V - t, [], HW, false);
  solid(0, gap[0], t, gap[1], 4.2, HW);
  for (const s of [-1, 1]) {
    const [a, b] = s < 0 ? [gap[0] - 4.2, gap[0]] : [gap[1], gap[1] + 4.2];
    solid(-1.6, a, 0, b, -0.3, GATE + 0.5); col.floor(T.R(-1.6, a, 0, b), GATE + 0.5);
    solid(-1.6 + 0.25, a + 0.4, 0.3, b - 0.4, GATE + 0.5, GATE + 0.8);                       // the parapet's course over the tower
    for (const k of [0.3, 0.7]) B(MP, -1.9, a + k * 4.2 - 0.3, -1.6, a + k * 4.2 + 0.3, -0.3, GATE);
  }
  for (const s of [-1, 1]) { const y = s < 0 ? gap[0] : gap[1] - 0.1; B('cedar', 0.6, y, 2.1, y + 0.1, 0.1, 4.0); for (const v of [0.5, 2.0, 3.5]) B('bronze', 0.6, y - 0.01, 2.1, y + 0.11, v - 0.06, v + 0.06); }
  B(BB, -1.6, gap[0], t, gap[1], -0.3, 0.1);
  buttresses(bag, [X0, Z0, X1, Z1], 0, HW, 0, 3.5, (px, pz) => px <= X0 + 0.01 && Math.abs(pz - (Z0 + cv)) < 7.5);
  // ---- the floors: baked brick throughout (the courts), the street through the middle ----
  B(BB, t, t, U - t, V - t, -0.3, 0.06); col.floor(T.R(t, t, U - t, V - t), 0.06);
  // ---- the street through the middle (z 29.2…34.8 for V = 64) between the two blocks ----
  const pN = cv - 2.8, pS = cv + 2.8;                           // the passage's walls' faces
  const nwS = [pN - 1.2, pN], niS = [pS, pS + 1.4];             // the north block's south wall; the Ningal block's north wall
  wall(t, nwS[0], U - t, nwS[1], [{ a: 10, b: 13.2, h: 3.6 }], HW, true);
  wall(t, niS[0], U - t, niS[1], [{ a: 8, b: 11.2, h: 3.6 }], HW, true);
  // the two gateways' towers standing into the street, and cedar doors open against them
  for (const [a, f, z0, z1] of [[10, 13.2, nwS[1], nwS[1] + 1.2], [8, 11.2, niS[0] - 1.2, niS[0]]]) for (const [u0, u1] of [[a - 3.2, a], [f, f + 3.2]]) { solid(u0, z0, u1, z1, -0.3, 7.5); col.floor(T.R(u0, z0, u1, z1), 7.5); }
  // =================== the Ningal temple (the south block) ===================
  const Y0 = niS[1], Y1 = V - t;                                // its interior from Y0 to Y1
  const nr = [Y0, Y0 + 5.0], nrw = [nr[1], nr[1] + 1.0];        // the north range (lobbies, stores; 5 m deep) and its south wall
  // cross walls of the north range: lobby A | lobby B | treasury | weaver's | store
  const crossN = [[14.0, 14.9], [24.2, 25.4], [33.0, 33.9], [40.5, 41.4]];
  for (const [a, b] of crossN) { const holes = a === 14.0 ? [{ a: Y0 + 1.3, b: Y0 + 2.7, h: 2.6 }] : []; wall(a, nr[0], b, nr[1], holes, HR - 0.3); }
  wall(t, nrw[0], 46.0, nrw[1], [{ a: 17.0, b: 18.4, h: 3.2 }, { a: 29.0, b: 30.2, h: 2.6 }, { a: 36.6, b: 37.8, h: 2.6 }, { a: 43.0, b: 44.2, h: 2.6 }], HR - 0.3);
  roof(t, nr[0], 46.0, nrw[1], HR, false);
  // the forecourt F: u 2.4…24.2, v from the range's wall to the kitchen's; the wall between it and the great court C
  const Fv1 = nrw[1] + 9.8;                                      // the forecourt's south edge (the kitchen wall's north face)
  wall(24.2, nrw[1], 25.4, Y1, [{ a: nrw[1] + 4, b: nrw[1] + 6.4, h: 3.4 }], HR - 0.3);
  wall(t, Fv1, 24.2, Fv1 + 0.9, [{ a: 8, b: 9.2, h: 2.4 }, { a: 19, b: 20.2, h: 2.4 }], HR - 0.3);
  wall(15.0, Fv1 + 0.9, 15.9, Y1, [], HR - 0.3);
  roof(15.0, Fv1, 24.2, Y1, HR);                                // the storeroom: roof over wall and room
  roof(t, Fv1, 15.0, Fv1 + 0.9, HR, false);
  // the stair from the forecourt up to the north range's roof, along the range's south wall
  stairs({ rect: T.R(3.0, nrw[1], 13.0, nrw[1] + 0.9), y0: 0.06, y1: HR, dir: 'e', mat: BB }, { bag, col });
  // ---- the sanctuary range on the east of the great court: antechambers, cella, bedchamber, treasury ----
  const san = (uW, vT, vB, m1, m2, o) => {
    const uC = uW + 6.5, uE = U - t;                              // the cross wall's west face; the outer wall's inner face
    const rows = [[vT, m1 - 0.45], [m1 + 0.45, m2 - 0.45], [m2 + 0.45, vB]], mid = (r) => (r[0] + r[1]) / 2;
    wall(uW, vT, uW + 1.2, vB, rows.map((r, i) => ({ a: mid(r) - (i === 1 ? 1.3 : 0.6), b: mid(r) + (i === 1 ? 1.3 : 0.6), h: i === 1 ? 3.4 : 2.5 })), HR - 0.3);
    wall(uW + 1.2 + 5.3, vT, uC + 0.0 + 1.2 - 0.0, vB, rows.map((r, i) => ({ a: mid(r) - (i === 1 ? 1.0 : 0.6), b: mid(r) + (i === 1 ? 1.0 : 0.6), h: i === 1 ? 3.0 : 2.4 })), HR - 0.3);
    wall(uW + 1.2, m1 - 0.45, uE, m1 + 0.45, [], HR - 0.3); wall(uW + 1.2, m2 - 0.45, uE, m2 + 0.45, [], HR - 0.3);
    roof(uW, vT, uE, vB, HR);
    const [r1, r2, r3] = rows, cl = uC + 1.2, ce = uE;           // the cella's span (u cl…ce)
    return { r1, r2, r3, ante: [uW + 1.2, uW + 6.5], cella: [cl, ce], mid, uC };
  };
  const S = san(46.0, Y0, Y1, 45.0, 53.0);
  const cm = S.mid(S.r2), [ca, cb] = S.cella, [aa, ab] = S.ante;
  // the cella: the statue's podium on three steps against the east wall, the goddess's statue (a robed figure of limestone
  // with a gold crown), an offering table with bowls, the priestess's platform in a corner, lamps
  B(MP, cb - 1.6, cm - 1.5, cb, cm + 1.5, 0.06, 1.0); col.rect(T.R(cb - 1.6, cm - 1.5, cb, cm + 1.5), 0, 1.0); col.floor(T.R(cb - 1.6, cm - 1.5, cb, cm + 1.5), 1.0);
  for (let k = 0; k < 3; k++) { B(BB, cb - 1.6 - 0.32 * (3 - k), cm - 1.0, cb - 1.6, cm + 1.0, 0.06 + k * 0.31, 0.37 + k * 0.31); }
  L('limestone', [[0.001, 0], [0.34, 0], [0.3, 0.55], [0.22, 1.0], [0.26, 1.25], [0.15, 1.35], [0.14, 1.6], [0.17, 1.7], [0.15, 1.82], [0.001, 1.86]], cb - 0.8, cm, 1.0, 14);
  L('gold', [[0.17, 1.84], [0.2, 1.86], [0.2, 2.02], [0.17, 2.04]], cb - 0.8, cm, 1.0, 14);
  solid(cb - 0.12, cm - 1.5, cb, cm + 1.5, 1.0, 3.4, 'plaster_white');
  B(MP, ca + 1.0, cm - 0.5, ca + 1.9, cm + 0.5, 0.06, 0.8); col.rect(T.R(ca + 1.0, cm - 0.5, ca + 1.9, cm + 0.5), 0, 0.8);
  for (const dv of [-0.25, 0, 0.25]) bowl(ca + 1.45, cm + dv, 0.8, 0.1);
  B(BB, ca + 0.2, S.r2[0] + 0.2, ca + 2.2, S.r2[0] + 1.3, 0.06, 0.4); col.rect(T.R(ca + 0.2, S.r2[0] + 0.2, ca + 2.2, S.r2[0] + 1.3), 0, 0.4);   // the priestess's platform
  B('reed_mat', ca + 0.2, S.r2[0] + 0.2, ca + 2.2, S.r2[0] + 1.3, 0.4, 0.412);
  lamp(ca + 1.45, cm + 0.6, 0.8); lamp(cb - 1.9, cm - 1.15, 1.0); light(cb - 2.2, cm, 1.8, 3.2, 8);
  // the antechambers: shrines to lesser gods — a small brick altar and a niche with a figure each; a lamp
  for (const r of [S.r1, S.r2, S.r3]) {
    const m = S.mid(r);
    B(BB, aa + 0.2, m - 0.5, aa + 1.2, m + 0.5, 0.06, 0.6); col.rect(T.R(aa + 0.2, m - 0.5, aa + 1.2, m + 0.5), 0, 0.6);
    L('terracotta', [[0.001, 0], [0.04, 0], [0.05, 0.08], [0.03, 0.14], [0.035, 0.2], [0.02, 0.24], [0.001, 0.24]], aa + 0.7, m, 0.6, 8);
    bowl(aa + 0.7, m - 0.3, 0.6, 0.08); bowl(aa + 0.7, m + 0.3, 0.6, 0.08);
  }
  lamp(aa + 0.7, S.mid(S.r2) + 0.8, 0.6);
  // the bedchamber (north row, east): a couch, a chest, a jar; the treasury (south row): chests and jars
  { const m = S.mid(S.r1), cu0 = cb - 2.6, cv0 = m - 0.45;
    for (const [u, v] of [[cu0, cv0], [cu0 + 1.9, cv0], [cu0, cv0 + 0.9], [cu0 + 1.9, cv0 + 0.9]]) B('timber', u - 0.04, v - 0.04, u + 0.04, v + 0.04, 0.06, 0.45);
    B('timber', cu0 - 0.05, cv0 - 0.05, cu0 + 1.95, cv0 + 0.95, 0.4, 0.45); B('linen', cu0, cv0, cu0 + 1.9, cv0 + 0.9, 0.45, 0.52); B('cloth_red', cu0 + 0.5, cv0, cu0 + 1.9, cv0 + 0.9, 0.52, 0.535);
    col.rect(T.R(cu0 - 0.05, cv0 - 0.05, cu0 + 1.95, cv0 + 0.95), 0, 0.54);
    B('cedar', ca + 0.1, S.r1[0] + 0.2, ca + 0.9, S.r1[0] + 0.7, 0.06, 0.55); B('bronze', ca + 0.09, S.r1[0] + 0.19, ca + 0.91, S.r1[0] + 0.71, 0.5, 0.52);
    jar(cb - 0.45, S.r1[1] - 0.4, 1.1); lamp(ca + 0.5, S.r1[1] - 0.3, 0.06); light(ca + 1.2, m, 1.4, 2, 5); }
  { const rr = S.r3;
    for (const k of [0, 1, 2]) { B('cedar', ca + 0.15 + k * 1.1, rr[0] + 0.2, ca + 1.05 + k * 1.1, rr[0] + 0.75, 0.06, 0.55); B('bronze', ca + 0.14 + k * 1.1, rr[0] + 0.19, ca + 1.06 + k * 1.1, rr[0] + 0.76, 0.5, 0.52); col.rect(T.R(ca + 0.15 + k * 1.1, rr[0] + 0.2, ca + 1.05 + k * 1.1, rr[0] + 0.75), 0, 0.55); }
    for (let k = 0; k < 4; k++) { L('terracotta', [[0.15, 0], [0.3, 0.2], [0.32, 0.55], [0.24, 0.92], [0.15, 1.02], [0.17, 1.08], [0.001, 1.06]], ca + 0.5 + k * 0.7, rr[1] - 0.45, 0.06, 14); circ(ca + 0.5 + k * 0.7, rr[1] - 0.45, 0.3, 0, 1.1); }
    for (let k = 0; k < 6; k++) B('bronze', ca + 3.4 + (k % 3) * 0.3, rr[1] - 0.8 + Math.floor(k / 3) * 0.22, ca + 3.65 + (k % 3) * 0.3, rr[1] - 0.62 + Math.floor(k / 3) * 0.22, 0.06, 0.12);   // ingots
    lamp(ca + 0.4, rr[0] + 0.3, 0.55); }
  tomb(ca + 0.2, S.r3[0] + 1.2, ca + 1.6, S.r3[1] - 1.8);
  // ---- the great court C: the lustration tank lined with bitumen, the limestone pillar, a platform for a stela, the brick altar, votive platforms ----
  { const c0 = 25.4, c1 = 46.0, v0 = nrw[1], v1 = Y1, my = (v0 + v1) / 2;
    const tk = [c0 + 3.5, my - 6.5, c0 + 7.5, my - 4.4];        // the tank
    B('bitumen', ...tk, 0.0, 0.12); B(BB, tk[0] - 0.4, tk[1] - 0.4, tk[2] + 0.4, tk[1], 0.06, 0.4); B(BB, tk[0] - 0.4, tk[3], tk[2] + 0.4, tk[3] + 0.4, 0.06, 0.4); B(BB, tk[0] - 0.4, tk[1], tk[0], tk[3], 0.06, 0.4); B(BB, tk[2], tk[1], tk[2] + 0.4, tk[3], 0.06, 0.4);
    col.rect(T.R(tk[0] - 0.4, tk[1] - 0.4, tk[2] + 0.4, tk[3] + 0.4), 0, 0.4);
    B('water', tk[0], tk[1], tk[2], tk[3], 0.28, 0.285);
    B('limestone', c0 + 11.5, my - 2.6, c0 + 12.1, my - 2.0, 0.06, 2.6); col.rect(T.R(c0 + 11.5, my - 2.6, c0 + 12.1, my - 2.0), 0, 2.6);
    B(BB, c0 + 11.3, my - 2.8, c0 + 12.3, my - 1.8, 0.06, 0.2);
    B(BB, c0 + 5, my + 4.5, c0 + 7, my + 6.3, 0.06, 0.6); col.rect(T.R(c0 + 5, my + 4.5, c0 + 7, my + 6.3), 0, 0.6);   // the stela's platform
    B(BB, c1 - 4.2, my - 0.5, c1 - 2.65, my + 0.45, 0.06, 1.05); col.rect(T.R(c1 - 4.2, my - 0.5, c1 - 2.65, my + 0.45), 0, 1.05);   // the altar, 1.55 × 0.95 × 1.05
    for (const dv of [-1.1, 1.1]) { B(BB, c1 - 4.0, my + dv - 0.35, c1 - 3.3, my + dv + 0.35, 0.06, 0.55); col.rect(T.R(c1 - 4.0, my + dv - 0.35, c1 - 3.3, my + dv + 0.35), 0, 0.55); }
    B('bitumen', c1 - 3.9, my - 1.45, c1 - 3.4, my - 0.95, 0.5, 0.56);                // the hollow pedestal for libations
    lamp(c1 - 3.4, my, 1.05);
    for (const [u, v] of [[c0 + 2, v1 - 1.6], [c0 + 2.7, v1 - 1.2], [c1 - 1.4, v0 + 1.2]]) jar(u, v, 1.1);
    B('mud_plaster', c0 + 14, v1 - 1.4, c0 + 14.4, v1 - 1.0, 0.06, 0.14); }
  // ---- the north range's rooms: lobby A's bench and jar; the treasury C23's chests; the weaver's room C10 with a ground loom ----
  B(BB, 3.0, nr[0] + 0.3, 3.5, nr[1] - 0.3, 0.06, 0.45); jar(5.0, nr[1] - 0.4, 1.0); jar(12.7, nr[1] - 0.4, 0.9);
  for (const k of [0, 1]) { B('cedar', 26.0 + k * 1.2, nr[0] + 0.3, 27.0 + k * 1.2, nr[0] + 0.9, 0.06, 0.6); B('bronze', 25.99 + k * 1.2, nr[0] + 0.29, 27.01 + k * 1.2, nr[0] + 0.91, 0.55, 0.57); col.rect(T.R(26.0 + k * 1.2, nr[0] + 0.3, 27.0 + k * 1.2, nr[0] + 0.9), 0, 0.6); }
  for (let k = 0; k < 3; k++) jar(31.5, nr[0] + 0.5 + k * 0.7, 1.0);
  { const lu = 34.5, lv = nr[0] + 0.9, lw = 4.2;               // a horizontal ground loom: two beams pegged to the floor, the warp stretched between them
    B('timber', lu, lv, lu + lw, lv + 0.08, 0.1, 0.18); B('timber', lu, lv + 2.4, lu + lw, lv + 2.48, 0.1, 0.18);
    for (const du of [0.1, lw - 0.1]) for (const dv of [0, 2.4]) B('timber', lu + du - 0.03, lv + dv - 0.03, lu + du + 0.03, lv + dv + 0.11, 0.06, 0.2);
    for (let k = 0; k < 24; k++) B('linen', lu + 0.2 + k * (lw - 0.4) / 23, lv + 0.08, lu + 0.22 + k * (lw - 0.4) / 23, lv + 2.4, 0.15, 0.158);
    B('linen', lu + 0.2, lv + 0.08, lu + lw - 0.2, lv + 0.7, 0.158, 0.17);                       // the cloth woven so far
    L('wicker', [[0.001, 0], [0.2, 0.01], [0.24, 0.3], [0.22, 0.31], [0.18, 0.04], [0.001, 0.04]], lu + lw + 0.7, lv + 0.4, 0.06, 12);
    L('linen', [[0.001, 0], [0.18, 0.02], [0.2, 0.15], [0.12, 0.26], [0.001, 0.27]], lu + lw + 0.7, lv + 0.4, 0.3, 10); }
  jar(42.0, nr[0] + 0.5, 1.2); jar(42.7, nr[0] + 0.5, 1.0);
  // ---- the lobbies' walls bear the soot of lamps; the lobbies' lamps ----
  lamp(2.9, nr[0] + 0.1, 1.3);
  // ---- the kitchen court K (a well, a tank, hearths, the bread oven, quern) and the storeroom's great jars ----
  { const ku0 = t, ku1 = 15.0, kv0 = Fv1 + 0.9, kv1 = Y1;
    // the well: a kerb of baked brick with a jar beside it; the water tank lined with bitumen
    L(BB, [[0.9, 0], [0.9, 0.7], [0.55, 0.7], [0.55, 0]], 4.5, kv0 + 2.4, 0.06, 16); circ(4.5, kv0 + 2.4, 0.9, 0, 0.7);
    B('bitumen', 7.5, kv0 + 1.4, 10.0, kv0 + 3.0, 0.06, 0.5); B('water', 7.7, kv0 + 1.6, 9.8, kv0 + 2.8, 0.4, 0.405); col.rect(T.R(7.5, kv0 + 1.4, 10.0, kv0 + 3.0), 0, 0.5);
    B(BB, 12.5, kv1 - 1.0, 14.8, kv1 - 0.4, 0.06, 0.28); B('pottery_dark', 12.6, kv1 - 0.95, 14.7, kv1 - 0.45, 0.28, 0.3); col.rect(T.R(12.5, kv1 - 1.0, 14.8, kv1 - 0.4), 0, 0.3);   // the cooking range
    L('pottery_dark', [[0.001, 0], [0.16, 0.02], [0.22, 0.14], [0.2, 0.24], [0.15, 0.27], [0.001, 0.27]], 13.2, kv1 - 0.7, 0.3, 12);
    L('terracotta', [[0.38, 0], [0.37, 0.4], [0.28, 0.75], [0.16, 0.85], [0.15, 0.85], [0.26, 0.74], [0.34, 0.4], [0.35, 0.03]], 3.4, kv1 - 0.8, 0.06, 16); circ(3.4, kv1 - 0.8, 0.4, 0, 0.9);
    B(MP, 6.0, kv1 - 1.1, 6.7, kv1 - 0.4, 0.06, 0.5); B('basalt', 6.1, kv1 - 1.0, 6.6, kv1 - 0.5, 0.5, 0.6); col.rect(T.R(6.0, kv1 - 1.1, 6.7, kv1 - 0.4), 0, 0.6);
    light(13.2, kv1 - 1.0, 0.8, 3, 6); jar(2.9, kv0 + 0.5, 1.2); jar(3.6, kv0 + 0.5, 1.0); }
  for (let u = 16.8; u < 23.5; u += 0.75) { L('terracotta', [[0.15, 0], [0.3, 0.2], [0.32, 0.55], [0.24, 0.92], [0.15, 1.02], [0.17, 1.08], [0.001, 1.06]], u, Fv1 + 1.8, 0.06, 14); circ(u, Fv1 + 1.8, 0.3, 0, 1.1); }
  // the forecourt: a brick bench along the wall, a water jar by the lobby's door
  B(BB, 3.0, Fv1 - 0.6, 10.0, Fv1 - 0.1, 0.06, 0.45); col.rect(T.R(3.0, Fv1 - 0.6, 10.0, Fv1 - 0.1), 0, 0.45);
  // =================== the northwest block ===================
  const Wt = t, WS = nwS[0];                                    // its interior v from t to WS
  const nr2 = [Wt, Wt + 7.6], nrw2 = [nr2[1], nr2[1] + 0.9];
  const crossW = [12.0, 20.0, 30.0, 38.0];
  for (const c of crossW) wall(c - 0.45, nr2[0], c + 0.45, nr2[1], [], HR - 0.3);
  wall(t, nrw2[0], 46.0, nrw2[1], [{ a: 6.4, b: 7.6, h: 2.6 }, { a: 15.4, b: 16.6, h: 2.6 }, { a: 24.4, b: 25.6, h: 2.8 }, { a: 33.4, b: 34.6, h: 2.6 }, { a: 41.4, b: 42.6, h: 2.6 }], HR - 0.3);
  roof(t, nr2[0], 46.0, nrw2[1], HR, false);
  const S2 = san(46.0, Wt, WS, nrw2[0] + 0.45, nrw2[0] + 9.6 + 0.45 + 0.45 + 0.0);
  { const cm2 = S2.mid(S2.r2), [ca2, cb2] = S2.cella, [aa2] = S2.ante;
    // its cella: an altar and votive pedestals (A30); a lamp; a treasury and a room with a buried oil jar in the other rows
    B(BB, cb2 - 1.7, cm2 - 0.5, cb2 - 0.75, cm2 + 0.5, 0.06, 1.0); col.rect(T.R(cb2 - 1.7, cm2 - 0.5, cb2 - 0.75, cm2 + 0.5), 0, 1.0);
    for (const dv of [-1.6, 1.6]) { B(MP, cb2 - 0.9, cm2 + dv - 0.4, cb2 - 0.1, cm2 + dv + 0.4, 0.06, 0.55); col.rect(T.R(cb2 - 0.9, cm2 + dv - 0.4, cb2 - 0.1, cm2 + dv + 0.4), 0, 0.55); }
    bowl(cb2 - 1.2, cm2, 1.0, 0.1); lamp(cb2 - 1.0, cm2 - 0.3, 1.0); light(cb2 - 2.5, cm2, 1.6, 3, 7);
    L('terracotta', [[0.1, 0.0], [0.3, 0.2], [0.32, 0.55], [0.1, 0.9], [0.1, 0.95]], aa2 + 0.9, S2.mid(S2.r3), 0.0, 14);
    jar(ca2 + 0.6, S2.mid(S2.r1), 1.1); jar(ca2 + 1.3, S2.mid(S2.r1) + 0.5, 0.9);
    for (const r of [S2.r1, S2.r2, S2.r3]) { const m = S2.mid(r); B(BB, aa2 + 0.2, m - 0.45, aa2 + 1.1, m + 0.45, 0.06, 0.5); col.rect(T.R(aa2 + 0.2, m - 0.45, aa2 + 1.1, m + 0.45), 0, 0.5); bowl(aa2 + 0.65, m, 0.5, 0.1); } }
  // the north court: lustration tanks by the gate (three, lined with bitumen), the altar for sacrifices, jars
  for (let k = 0; k < 3; k++) { const a = 15.2 + k * 2.2; B('bitumen', a, WS - 1.6, a + 1.8, WS - 0.2, 0.0, 0.1); B(BB, a - 0.2, WS - 1.8, a + 2.0, WS - 1.6, 0.06, 0.4); B(BB, a - 0.2, WS - 0.2, a + 2.0, WS, 0.06, 0.4); B(BB, a - 0.2, WS - 1.6, a, WS - 0.2, 0.06, 0.4); B(BB, a + 1.8, WS - 1.6, a + 2.0, WS - 0.2, 0.06, 0.4); col.rect(T.R(a - 0.2, WS - 1.8, a + 2.0, WS), 0, 0.4); B('water', a, WS - 1.6, a + 1.8, WS - 0.2, 0.3, 0.305); }
  { const my = (nrw2[1] + WS) / 2; B(BB, 31, my - 0.6, 32.9, my + 0.6, 0.06, 1.0); col.rect(T.R(31, my - 0.6, 32.9, my + 0.6), 0, 1.0); bowl(31.9, my, 1.0, 0.14); lamp(31.5, my + 0.3, 1.0); lamp(32.3, my - 0.3, 1.0);
    for (const [u, v] of [[22, my - 3], [22.7, my - 2.5], [36, my + 4]]) jar(u, v, 1.1); }
  // the rooms of the north range: a lustration antechamber (A4) and a room with a platform in a niche (A5), the room of tablets (A17)
  B(BB, 3.0, nr2[0] + 0.4, 5.0, nr2[0] + 1.2, 0.06, 0.4); jar(10.6, nr2[1] - 0.4, 1.0);
  B(MP, 13.0, nr2[0] + 0.3, 14.8, nr2[0] + 1.3, 0.06, 0.55); col.rect(T.R(13.0, nr2[0] + 0.3, 14.8, nr2[0] + 1.3), 0, 0.55);
  { for (const [u0, u1] of [[21.0, 29.0]]) { B(MP, u0, nr2[0] + 0.3, u1, nr2[0] + 0.85, 0.06, 0.5); col.rect(T.R(u0, nr2[0] + 0.3, u1, nr2[0] + 0.85), 0, 0.5);
      for (let k = 0; k < 14; k++) B('mud_plaster', u0 + 0.2 + k * 0.55, nr2[0] + 0.4, u0 + 0.6 + k * 0.55, nr2[0] + 0.75, 0.5, 0.55); }
    for (let k = 0; k < 3; k++) L('wicker', [[0.001, 0], [0.2, 0.01], [0.24, 0.3], [0.22, 0.31], [0.18, 0.04], [0.001, 0.04]], 21.5 + k * 2.4, nr2[1] - 0.6, 0.06, 12);
    lamp(22.0, nr2[0] + 0.3, 0.5); light(25, nr2[0] + 3, 1.4, 2, 6); }
  jar(32.5, nr2[0] + 0.5, 1.1); jar(33.2, nr2[0] + 0.5, 1.0); jar(40.0, nr2[1] - 0.5, 1.2);
  tomb(40.5, nr2[0] + 1.5, 45.0, nr2[1] - 1.2);
  return { rooms: [], at: { cella: [X0 + cb, 1.0, Z0 + cm] } };
}

/**
 * ur_chapel: Woolley's public chapel at a street corner { rect, seed, door ('n'|'s'|'w'|'e': the street side) } — raised
 * a step above the lane, an elaborate doorway of stepped reveals with a terracotta demon either side, a lobby with the
 * ablution alcove and a storeroom, a small open court with the brick altar between two pedestals (one hollowed and lined
 * with bitumen for libations), the cult room opposite with a niche and a mud-brick platform for the statue, a heavy
 * wooden door and a reed screen; a robing room and a room for the cult's equipment on its sides.
 */
export function urChapel(el, ctx) {
  const rand = rng(el.seed || 5), [x0, z0, x1, z1] = el.rect, f = el.door ?? 's';
  const U = f === 'n' || f === 's' ? x1 - x0 : z1 - z0, V = f === 'n' || f === 's' ? z1 - z0 : x1 - x0;
  const W = (u, v) => (f === 'n' ? [x0 + u, z0 + v] : f === 's' ? [x1 - u, z1 - v] : f === 'w' ? [x0 + v, z1 - u] : [x1 - v, z0 + u]);
  const T = tools(ctx, W), { B, solid, L, wall, roof, jar, bowl, lamp, light, tomb, circ, col, bag } = T;
  const H = 3.6, t = 0.55, ti = 0.4, up = rand() < 0.5 ? 'limewash_white' : MP, foot = 1.0;
  const dF = 2.5, dB = Math.min(3.4, V * 0.3), vC0 = t + dF + ti, vC1 = V - t - dB - ti;
  // the outer walls on a footing of baked brick; the street door in the middle of the front, its reveals stepping in
  const dw = 1.3, dc = U / 2, door = { a: dc - dw / 2, b: dc + dw / 2, h: 2.5 };
  const outer = (u0, v0, u1, v1, holes = []) => {
    const alongU = u1 - u0 > v1 - v0, A = alongU ? u0 : v0, Z = alongU ? u1 : v1;
    const seg = (a, b, y0, y1) => { if (b - a < 1e-3 || y1 - y0 < 1e-3) return; const q = alongU ? [a, v0, b, v1] : [u0, a, u1, b]; if (y0 < foot) { solid(...q, y0, Math.min(foot, y1), BB); if (y1 > foot) solid(...q, foot, y1, up); } else solid(...q, y0, y1, up); };
    let a = A; for (const o of holes) { seg(a, o.a, -0.3, H - 0.3); seg(o.a, o.b, o.h, H - 0.3); a = o.b; } seg(a, Z, -0.3, H - 0.3);
  };
  outer(0, 0, U, t, [door]); outer(0, V - t, U, V); outer(0, t, t, V - t); outer(U - t, t, U, V - t);
  // the doorway: three stepped reveals (jambs pushed out of the wall's face), a palm-trunk lintel, the cedar door open, a raised threshold
  for (const [k, w0, w1] of [[0, 0, 0.22], [1, 0.22, 0.4]]) for (const s of [-1, 1]) { const a = s < 0 ? door.a - w1 : door.b + w0, b = s < 0 ? door.a - w0 : door.b + w1; solid(a, -0.2 - k * 0.1, b, 0.0, -0.3, door.h + 0.35 - k * 0.1, up); }
  B(up, door.a - 0.4, -0.3, door.b + 0.4, 0.0, door.h + 0.25, door.h + 0.6);
  T.lintel(door.a - 0.2, door.b + 0.2, -0.12, door.h + 0.02, 0.3);
  B(BB, door.a - 0.2, -0.45, door.b + 0.2, t, -0.3, 0.3);                                   // the step up: the chapel stands higher than the lane
  B('cedar', door.a + 0.02, t - 0.02, door.a + 0.08, t + 0.9, 0.3, door.h - 0.05);
  // the terracotta guardians either side of the door on little plinths: a tapering body, a broad head with horns
  for (const s of [-1, 1]) {
    const u = s < 0 ? door.a - 0.95 : door.b + 0.95;
    B(BB, u - 0.28, -0.4, u + 0.28, 0.02, -0.3, 0.4);
    L('terracotta', [[0.001, 0.4], [0.24, 0.4], [0.2, 0.9], [0.17, 1.3], [0.12, 1.45], [0.001, 1.45]], u, -0.19, 0.0, 10);
    B('terracotta', u - 0.13, -0.32, u + 0.13, -0.06, 1.45, 1.72);
    for (const d of [-1, 1]) B('terracotta', u + d * 0.12 - 0.025, -0.3, u + d * 0.12 + 0.025, -0.1, 1.72, 1.9);
    col.rect(T.R(u - 0.28, -0.4, u + 0.28, 0.02), 0, 0.4);
  }
  // ---- inside: floor of baked brick; the front range (lobby | alcove | storeroom), the court, the back range (robing | cult room | equipment) ----
  B(BB, t, t, U - t, V - t, -0.3, 0.06); col.floor(T.R(t, t, U - t, V - t), 0.06);
  const lobby = [t, t + 2.3], alc = [lobby[1] + ti, lobby[1] + ti + 1.4], sto = [alc[1] + ti, U - t];
  const dLob = { a: lobby[1] - 1.1, b: lobby[1] - 0.2, h: 2.2 }, dAlc = { a: alc[0] + 0.2, b: alc[1] - 0.2, h: 2.2 }, dSto = { a: sto[0] + 0.2, b: Math.min(sto[0] + 1.1, U - t - 0.3), h: 2.2 };
  wall(t, t + dF, U - t, t + dF + ti, [dLob, dAlc, dSto].filter((o) => o.b - o.a > 0.6), H - 0.3);
  for (const u of [lobby[1], alc[1]]) wall(u, t, u + ti, t + dF, [], H - 0.3);
  const rob = [t, t + 2.4], cult = [rob[1] + ti, U - t - 2.4 - ti], eq = [cult[1] + ti, U - t];
  const vb0 = V - t - dB - ti, vb1 = V - t - dB;
  const cdw = Math.min(1.5, cult[1] - cult[0] - 0.6);
  wall(t, vb0, U - t, vb1, [{ a: (rob[0] + rob[1]) / 2 - 0.5, b: (rob[0] + rob[1]) / 2 + 0.5, h: 2.1 }, { a: (cult[0] + cult[1]) / 2 - cdw / 2, b: (cult[0] + cult[1]) / 2 + cdw / 2, h: 2.6 }, { a: (eq[0] + eq[1]) / 2 - 0.5, b: (eq[0] + eq[1]) / 2 + 0.5, h: 2.1 }].filter((o) => o.b - o.a > 0.6), H - 0.3);
  wall(rob[1], vb1, cult[0], V - t, [], H - 0.3); wall(cult[1], vb1, eq[0], V - t, [], H - 0.3);
  roof(t, t, U - t, t + dF + ti, H, false); roof(t, vb0, U - t, V - t, H, false);
  B(up, 0, 0, U, t, H, H + 0.45); B(up, 0, V - t, U, V, H, H + 0.45); B(up, 0, t, t, V - t, H, H + 0.45); B(up, U - t, t, U, V - t, H, H + 0.45);   // the parapet
  // (the roof over the court's two side walls and the walls round it carry their own tops)
  B(MP, 0, t, t, V - t, H - 0.3, H); B(MP, U - t, t, U, V - t, H - 0.3, H); B(MP, 0, 0, U, t, H - 0.3, H); B(MP, 0, V - t, U, V, H - 0.3, H);
  // ---- the court: the altar before the cult room's door between two pedestals ----
  const cu = (cult[0] + cult[1]) / 2, cm = (vC0 + vC1) / 2;
  B(BB, cu - 0.55, vC1 - 1.2, cu + 0.55, vC1 - 0.4, 0.06, 0.8); col.rect(T.R(cu - 0.55, vC1 - 1.2, cu + 0.55, vC1 - 0.4), 0, 0.8);
  for (const s of [-1, 1]) { B(MP, cu + s * 1.15 - 0.22, vC1 - 1.0, cu + s * 1.15 + 0.22, vC1 - 0.6, 0.06, 0.6); col.rect(T.R(cu + s * 1.15 - 0.22, vC1 - 1.0, cu + s * 1.15 + 0.22, vC1 - 0.6), 0, 0.6); }
  B('bitumen', cu + 1.15 - 0.14, vC1 - 0.92, cu + 1.15 + 0.14, vC1 - 0.68, 0.6, 0.62);          // the hollowed pedestal, bitumen-lined, for libations
  bowl(cu, vC1 - 0.8, 0.8, 0.14); lamp(cu - 0.3, vC1 - 0.8, 0.8);
  B('opening', cu - 0.16, cm - 0.16, cu + 0.16, cm + 0.16, 0.06, 0.064);                      // the court's drain
  jar(t + 0.4, vC0 + 0.4, 1.1);
  // ---- the cult room: niche opposite the door with the statue's platform, a reed screen door, a lamp, offerings ----
  { const a = cult[0], b = cult[1], m = (a + b) / 2, va = V - t - 0.0, vb = V - t;
    B(MP, m - 1.0, vb - 1.1, m + 1.0, vb - 0.05, 0.06, 0.75); col.rect(T.R(m - 1.0, vb - 1.1, m + 1.0, vb - 0.05), 0, 0.75);
    for (const s of [-1, 1]) solid(m + s * 0.9 - (s > 0 ? 0 : 0.2), vb - 0.25, m + s * 0.9 + (s > 0 ? 0.2 : 0), vb, 0.75, 2.5);
    B(MP, m - 1.1, vb - 0.25, m + 1.1, vb, 2.5, 2.8); B('plaster_white', m - 0.9, vb - 0.27, m + 0.9, vb - 0.25, 0.75, 2.5);
    L('terracotta', [[0.001, 0], [0.16, 0], [0.2, 0.5], [0.17, 0.85], [0.1, 0.95], [0.1, 1.2], [0.001, 1.25]], m, vb - 0.55, 0.75, 12);    // the image
    bowl(m - 0.5, vb - 1.5, 0.06, 0.12); bowl(m + 0.5, vb - 1.5, 0.06, 0.12); lamp(m, vb - 1.5, 0.06); light(m, vb - 1.4, 1.3, 2.6, 5);
    B('reed_mat', cult[0] + 0.12, vb0 + 0.2, cult[0] + 0.18, vb0 + 1.0, 0.1, 2.3);                // the reed screen door, folded back beside the entrance
    tomb(a + 0.4, vb0 + 0.7, b - 0.4, vb - 1.6); }
  // ---- the side rooms: the robing room (a bench, a chest, hanging garments) and the store of the cult's equipment (jars, a stand) ----
  { const m = (rob[0] + rob[1]) / 2;
    B(BB, rob[0] + 0.2, V - t - 0.65, rob[1] - 0.2, V - t - 0.2, 0.06, 0.42); col.rect(T.R(rob[0] + 0.2, V - t - 0.65, rob[1] - 0.2, V - t - 0.2), 0, 0.42);
    B('cedar', rob[0] + 0.2, V - t - 2.3, rob[0] + 1.0, V - t - 1.8, 0.06, 0.55); col.rect(T.R(rob[0] + 0.2, V - t - 2.3, rob[0] + 1.0, V - t - 1.8), 0, 0.55);
    B('cloth_white', m + 0.7, V - t - 0.12, m + 1.5, V - t - 0.08, 1.0, 2.0); lamp(m, V - t - 0.2, 0.42); }
  { const m = (eq[0] + eq[1]) / 2; for (const dv of [0, 0.65]) jar(m - 0.4, V - t - 0.5 - dv, 1.0); jar(m + 0.6, V - t - 0.5, 0.9); bowl(m + 0.5, V - t - 1.4, 0.06, 0.15); }
  // ---- the lobby, alcove (a niche for ablutions: a sloped floor, a drain, a jar) and storeroom ----
  B(BB, lobby[0] + 0.1, t + 0.1, lobby[0] + 0.6, t + 1.6, 0.06, 0.45); col.rect(T.R(lobby[0] + 0.1, t + 0.1, lobby[0] + 0.6, t + 1.6), 0, 0.45);
  { const m = (alc[0] + alc[1]) / 2; B('terracotta', m - 0.4, t + 0.3, m + 0.4, t + 1.5, 0.06, 0.07); B('opening', m - 0.1, t + 0.6, m + 0.1, t + 1.0, 0.07, 0.075); jar(alc[1] - 0.3, t + 0.3, 0.9); }
  if (sto[1] - sto[0] > 1.0) for (let u = sto[0] + 0.4; u < sto[1] - 0.3; u += 0.6) { L('terracotta', JAR.map(([r, h]) => [r * 1.2, h * 1.2]), u, t + 0.45, 0.06, 12); circ(u, t + 0.45, 0.3, 0, 1.0); }
}
