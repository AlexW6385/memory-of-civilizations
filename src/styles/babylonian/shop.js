// The shops and workshops of Babylon's lanes, and the yards between the houses (docs/settlements/babylon.md §13).
// babylon_shop: one-storey house of the lane with a shop room open to the street through a counter window and a door,
// a back door to a walled work yard; seven trades (potter, baker, weaver, brewer, smith, grocer, carpenter), each with
// the tools and goods of its craft in the room and the yard. babylon_yard: a walled garden with a shaduf, a sheep pen,
// a brickyard, a potter's kiln where no house stands.  Built in a frame turned to the street side, as urHouseOpen.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import { hexa } from './house.js';

const BB = 'brick_baked', MP = 'mud_plaster', MB = 'mudbrick';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const JAR = [[0.001, 0], [0.1, 0], [0.16, 0.06], [0.24, 0.26], [0.25, 0.42], [0.17, 0.6], [0.09, 0.68], [0.11, 0.74], [0.08, 0.75], [0.07, 0.7], [0.001, 0.68]];
const POT = [[0.001, 0], [0.06, 0], [0.12, 0.04], [0.17, 0.16], [0.11, 0.3], [0.08, 0.34], [0.1, 0.37], [0.07, 0.36], [0.001, 0.33]];
const BOWL = [[0.001, 0], [0.06, 0.005], [0.14, 0.06], [0.13, 0.065], [0.001, 0.02]];
const BASKET = [[0.001, 0], [0.2, 0], [0.24, 0.2], [0.22, 0.22], [0.18, 0.04], [0.001, 0.04]];
const sc = (p, s) => p.map(([r, y]) => [r * s, y * s]);

/** The turned frame of a lot: u along the front, v in from it; W → plan point, R → rect, LP → [x, y, z]. */
export function frameOf(rect, f) {
  const [x0, z0, x1, z1] = rect;
  const U = f === 'n' || f === 's' ? x1 - x0 : z1 - z0, V = f === 'n' || f === 's' ? z1 - z0 : x1 - x0;
  const W = (u, v) => (f === 'n' ? [x0 + u, z0 + v] : f === 's' ? [x1 - u, z1 - v] : f === 'w' ? [x0 + v, z1 - u] : [x1 - v, z0 + u]);
  const R = (u0, v0, u1, v1) => { const a = W(u0, v0), b = W(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  return { U, V, W, R, LP: (u, v, y) => { const [x, z] = W(u, v); return [x, y, z]; } };
}

export function babylonShop(el, { bag, col, lights }) {
  const rand = rng(el.seed || 5), f = el.door ?? 's', { U, V, W, R, LP } = frameOf(el.rect, f);
  const B = (mat, u0, v0, u1, v1, y0, y1) => { const r = R(u0, v0, u1, v1); bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); return r; };
  const Bc = (mat, u0, v0, u1, v1, y0, y1) => { const r = B(mat, u0, v0, u1, v1, y0, y1); col.rect(r, y0, y1); };
  const L = (mat, prof, u, v, y, seg = 10) => { const [x, z] = W(u, v); bag.add(mat, lathe(prof, seg, null, x, y, z)); };
  const beam = (mat, a, b, w, h) => { const T = []; beamTris(T, a, b, w, h); bag.add(mat, fromTriangles(T)); };
  const H = 3.4, t = 0.5, foot = 0.9 + Math.round(rand() * 2) * 0.15, up = el.white ? 'limewash_white' : MP, rd = 5.6, ti = 0.4;
  const room = [t, t + rd], yard0 = t + rd + ti, yardV1 = V - t, trade = el.trade || 'potter';
  const wall = (u0, v0, u1, v1, holes = [], h = H, outer = false) => {
    const alongU = u1 - u0 > v1 - v0, A = alongU ? u0 : v0, Bn = alongU ? u1 : v1;
    const seg = (a, b, y0, y1) => {
      if (b - a < 1e-3 || y1 - y0 < 1e-3) return;
      const q = alongU ? [a, v0, b, v1] : [u0, a, u1, b];
      if (outer && y0 < foot) { B(BB, ...q, y0, Math.min(foot, y1)); if (y1 > foot) B(up, ...q, foot, y1); } else B(outer ? up : MP, ...q, y0, y1);
      col.rect(R(...q), y0, y1);
    };
    let a = A;
    for (const o of [...holes].sort((p, q) => p.a - q.a)) { seg(a, o.a, -0.3, h); if (o.y0 > 0) seg(o.a, o.b, -0.3, o.y0); seg(o.a, o.b, o.y1, h); a = o.b; }
    seg(a, Bn, -0.3, h);
  };
  // the front: a door and the counter window
  const door = { a: 0.55, b: 1.75, y0: 0, y1: 2.2 }, win = { a: 3.0, b: U - 1.0, y0: 0.95, y1: 2.45 };
  wall(0, 0, U, t, [door, win], H, true);
  wall(0, V - t, U, V, [], H, true); wall(0, t, t, V - t, [], H, true); wall(U - t, t, U, V - t, [], H, true);
  // the partition between the room and the yard, with the door
  const dm = U * 0.5, back = { a: dm - 0.6, b: dm + 0.6, y0: 0, y1: 2.1 };
  wall(t, room[1], U - t, yard0, [back]);
  beam('palm_trunk', LP(door.a - 0.15, 0.0, door.y1), LP(door.b + 0.15, 0.0, door.y1), 0.1, 0.18);
  beam('palm_trunk', LP(win.a - 0.15, 0.0, win.y1), LP(win.b + 0.15, 0.0, win.y1), 0.1, 0.18);
  beam('palm_trunk', LP(dm - 0.75, room[1] + 0.05, back.y1), LP(dm + 0.75, room[1] + 0.05, back.y1), 0.1, 0.16);
  B('cedar', door.a + 0.02, t - 0.02, door.a + 0.07, t + 0.88, 0.05, door.y1 - 0.05);
  B(BB, door.a, -0.25, door.b, t, -0.3, 0.1);
  // the floors, the roof of the room (mud over reeds over palm trunks), the parapet
  B(BB, t, t, U - t, room[1], -0.3, 0.06); B('silt', t, yard0, U - t, yardV1, -0.3, 0.05); col.floor(R(0, 0, U, V), 0.06);
  B(MP, t, t, U - t, yard0, H - 0.28, H); B('reed_mat', t, t, U - t, yard0, H - 0.33, H - 0.28); col.floor(R(t, t, U - t, yard0), H);
  for (let v = t + 0.4; v < room[1]; v += 0.6) beam('palm_trunk', LP(t, v, H - 0.47), LP(U - t, v, H - 0.47), 0.07, 0.14);
  for (const q of [[0, 0, U, 0.3], [0, 0.3, 0.3, yard0], [U - 0.3, 0.3, U, yard0], [0, yard0 - 0.3, U, yard0 + 0.1]]) B(up, ...q, H, H + 0.5);
  for (const q of [[0, V - 0.3, U, V], [0, yard0, 0.3, V - 0.3], [U - 0.3, yard0, U, V - 0.3]]) B(up, ...q, H, H + 0.2);
  // outside: the counter under the window, its reed shade on posts, the sign, the foot tarred
  Bc(BB, win.a - 0.2, -0.55, win.b + 0.2, 0.0, 0, 0.92); B(MP, win.a - 0.25, -0.6, win.b + 0.25, 0.02, 0.92, 0.97);
  { const u0 = win.a - 0.2, u1 = win.b + 0.2, o = -1.2, hi = 2.75, lo = 2.35, P = (u, vv, y) => LP(u, -vv, y);
    for (const u of [u0 + 0.1, u1 - 0.1]) { const [x, z] = W(u, o + 0.1); bag.add('palm_trunk', box(x - 0.07, 0, z - 0.07, x + 0.07, lo, z + 0.07)); col.circle(x, z, 0.1, 0, lo); }
    bag.add('reed_mat', hexa([P(u0, 0.02, hi - 0.06), P(u1, 0.02, hi - 0.06), P(u1, -o, lo - 0.06), P(u0, -o, lo - 0.06), P(u0, 0.02, hi), P(u1, 0.02, hi), P(u1, -o, lo), P(u0, -o, lo)]));
    beam('palm_trunk', LP(u0, o, lo - 0.1), LP(u1, o, lo - 0.1), 0.06, 0.1); }
  B('bitumen', 0.1, -0.035, door.a - 0.1, 0, 0, 0.32); B('bitumen', door.b + 0.1, -0.035, win.a - 0.3, 0, 0, 0.32);
  // the sign: the craft's mark on a short pole over the door
  { const sgn = { potter: [POT, 'terracotta'], baker: [sc(BOWL, 2.4), 'hide_tan'], weaver: [null, 'cloth_indigo'], brewer: [sc(JAR, 0.8), 'terracotta'], smith: [null, 'iron'], grocer: [BASKET, 'wicker'], carpenter: [null, 'palm_trunk'] }[trade], u = (door.a + door.b) / 2;
    beam('palm_trunk', LP(u, 0, 2.55), LP(u, -0.75, 2.6), 0.04, 0.05);
    if (sgn[0]) L(sgn[1], sgn[0], u, -0.6, 2.2, 10); else B(sgn[1], u - 0.12, -0.7, u + 0.12, -0.5, 2.1, 2.55); }
  // the light of the room
  lights.push({ at: LP(U * 0.5, room[0] + rd * 0.5, 2.5), color: trade === 'smith' ? '#ff8a3a' : '#ffb46b', intensity: trade === 'smith' ? 4 : 3, distance: 9 });
  const bv = room[1] - 0.12, ru = (a, b) => a + (b - a) * rand();
  const shelf = (u0, u1, v, y, rows = 2) => { for (let k = 0; k < rows; k++) B('timber', u0, v - 0.4, u1, v, y + k * 0.7, y + k * 0.7 + 0.05); for (const u of [u0, u1 - 0.06]) B('timber', u, v - 0.4, u + 0.06, v, y, y + (rows - 1) * 0.7 + 0.05); };
  const potsRow = (u0, u1, v, y, mat, s = 1) => { for (let u = u0 + 0.2; u < u1 - 0.1; u += 0.34 * s) L(rand() < 0.3 ? 'pottery_dark' : mat, sc(rand() < 0.5 ? POT : JAR, s * 0.9), u, v, y, 8); };
  const sacks = (u, v, n) => { for (let i = 0; i < n; i++) L('sacking', [[0.001, 0], [0.22, 0.02], [0.26, 0.25], [0.22, 0.5], [0.08, 0.6], [0.001, 0.6]], u + (i % 2) * 0.46, v + Math.floor(i / 2) * 0.1, 0.06 + (i > 1 ? 0.5 : 0), 8); };
  const stack = (u, v, n, len) => { for (let i = 0; i < n; i++) { const a = LP(u, v + i * 0.22, 0.12), b = LP(u + len, v + i * 0.22, 0.12); beam('palm_trunk', a, b, 0.1, 0.2); } };
  const yv = (a, b) => ru(yard0 + a, Math.min(yardV1 - 0.4, yard0 + b));
  // ---- the trades -----------------------------------------------------------------------------------------------
  if (trade === 'potter') {
    shelf(0.7, U - 0.7, bv, 0.5, 3); for (let k = 0; k < 3; k++) potsRow(0.7, U - 0.7, bv - 0.2, 0.55 + k * 0.7, 'terracotta');
    // the wheel: a stone turntable on a post, a lump of clay on it, a bench beside
    { const u = 2.2, v = 3.2; L('mudbrick', [[0.001, 0], [0.22, 0], [0.2, 0.55], [0.001, 0.55]], u, v, 0.06, 10); L('limestone', [[0.001, 0.55], [0.4, 0.55], [0.4, 0.6], [0.001, 0.6]], u, v, 0.06, 14); L('terracotta', sc(POT, 0.7), u, v, 0.66, 8);
      col.circle(...W(u, v), 0.42, 0, 0.62); Bc('mudbrick', u + 0.5, v - 0.25, u + 1.3, v + 0.25, 0.06, 0.4); }
    for (let k = 0; k < 4; k++) L('terracotta', sc(POT, 0.8), U - 2 + (k % 2) * 0.4, 1.3 + Math.floor(k / 2) * 0.4, 0.06, 8);
    // the yard: the kiln, unfired pots in rows, a clay pit lined with bitumen, firewood
    const ku = U * 0.3, kv = yard0 + 2.0;
    L('terracotta', [[1.3, 0], [1.3, 0.4], [1.15, 0.9], [0.8, 1.35], [0.4, 1.6], [0.001, 1.68]], ku, kv, 0.05, 16); col.circle(...W(ku, kv), 1.3, 0, 1.7);
    { const r = R(ku - 0.3, kv - 1.4, ku + 0.3, kv - 1.2); bag.add('opening', box(r[0], 0.05, r[1], r[2], 0.75, r[3])); const sr = R(ku - 0.7, kv - 1.31, ku + 0.7, kv - 1.29); bag.add('pottery_dark', box(sr[0], 0.1, sr[1], sr[2], 1.5, sr[3])); }
    for (let k = 0; k < 10; k++) L('terracotta', sc(POT, 0.8), U * 0.62 + (k % 5) * 0.55, yv(0.6, 1.0) + Math.floor(k / 5) * 0.55, 0.05, 8);
    B(MB, U - 3.2, yardV1 - 1.7, U - 0.7, yardV1 - 0.5, 0.05, 0.4); B('bitumen', U - 3.0, yardV1 - 1.5, U - 0.9, yardV1 - 0.7, 0.38, 0.41); col.rect(R(U - 3.2, yardV1 - 1.7, U - 0.7, yardV1 - 0.5), 0, 0.4);
    stack(0.8, yardV1 - 1.2, 4, 2.2);
  } else if (trade === 'baker') {
    B('timber', 0.7, bv - 0.4, U - 0.7, bv, 0.6, 0.65); B('timber', 0.7, bv - 0.4, 0.76, bv, 0.05, 0.65); B('timber', U - 0.76, bv - 0.4, U - 0.7, bv, 0.05, 0.65);
    for (let u = 1.0; u < U - 1.0; u += 0.42) L('hide_tan', [[0.001, 0.65], [0.17, 0.65], [0.17, 0.69], [0.001, 0.7]], u, bv - 0.2, 0, 10);
    // loaves heaped on the counter outside the window and in baskets
    for (let i = 0; i < 6; i++) L('hide_tan', [[0.001, 0], [0.1, 0], [0.12, 0.04], [0.09, 0.07], [0.001, 0.08]], win.a + 0.5 + i * 0.55, -0.28, 0.97, 8);
    for (let i = 0; i < 3; i++) L('wicker', BASKET, win.a + 0.9 + i * 1.3, -0.28 + (i % 2) * 0.06, 0.97, 10);
    // the trough where the dough is kneaded, the flour sacks, a quern
    Bc('timber', 1.0, 2.8, 2.3, 3.5, 0.06, 0.55); B('linen', 1.1, 2.9, 2.2, 3.4, 0.5, 0.62);
    sacks(U - 1.7, 1.2, 4);
    Bc(MP, U - 3.2, 3.0, U - 2.4, 3.9, 0.06, 0.5); B('basalt', U - 3.1, 3.1, U - 2.5, 3.8, 0.5, 0.6);
    // the yard: two clay ovens, fuel, a bin of water
    for (const [fu, fv] of [[U * 0.3, yard0 + 1.7], [U * 0.3 + 1.7, yard0 + 1.7]]) {
      L('terracotta', [[0.62, 0], [0.6, 0.4], [0.46, 0.8], [0.26, 1.0], [0.3, 1.02], [0.5, 0.82], [0.62, 0.4], [0.64, 0]], fu, fv, 0.05, 16); col.circle(...W(fu, fv), 0.62, 0, 1.0);
      const o = LP(fu, fv - 0.58, 0.3); bag.add('flame', box(o[0] - 0.05, o[1], o[2] - 0.05, o[0] + 0.05, o[1] + 0.12, o[2] + 0.05)); }
    for (let k = 0; k < 8; k++) L('pottery_dark', [[0.001, 0], [0.13, 0.005], [0.14, 0.035], [0.001, 0.04]], U - 1.0, yv(0.4, 0.9), 0.05 + k * 0.04, 8);
    stack(0.8, yardV1 - 1.2, 5, 2.6); L('terracotta', JAR, U - 1.2, yardV1 - 0.9, 0.05, 10);
    lights.push({ at: LP(U * 0.3 + 0.8, yard0 + 1.5, 0.5), color: '#ff7a2a', intensity: 3, distance: 6 });
  } else if (trade === 'weaver') {
    // the warp-weighted loom: two posts, the beam, the warp hanging in threads weighted with clay rings, the cloth on top
    { const u0 = 1.0, w = 1.9, v = 3.4;
      for (const u of [u0, u0 + w]) Bc('timber', u - 0.07, v - 0.07, u + 0.07, v + 0.07, 0.06, 2.0);
      B('timber', u0 - 0.1, v - 0.06, u0 + w + 0.1, v + 0.06, 1.9, 2.0);
      for (let k = 0; k < 14; k++) { const u = u0 + 0.12 + k * (w - 0.24) / 13; B('linen', u - 0.008, v - 0.008, u + 0.008, v + 0.008, 0.45, 1.9); if (k % 2 === 0) L('terracotta', [[0.001, 0.0], [0.05, 0.0], [0.05, 0.1], [0.001, 0.1]], u, v, 0.35, 6); }
      B(['cloth_red', 'cloth_indigo', 'cloth_ochre'][Math.floor(rand() * 3)], u0 + 0.08, v - 0.02, u0 + w - 0.08, v + 0.02, 1.35, 1.88);
      B('cloth_white', u0 + 0.08, v - 0.024, u0 + w - 0.08, v + 0.024, 1.3, 1.36); }
    shelf(U - 3.6, U - 0.7, bv, 0.5, 3);
    for (let k = 0; k < 9; k++) B(['cloth_ochre', 'cloth_indigo', 'cloth_red', 'cloth_white', 'cloth_brown', 'cloth_green'][k % 6], U - 3.5 + (k % 5) * 0.55, bv - 0.38, U - 3.1 + (k % 5) * 0.55, bv - 0.04, 0.55 + Math.floor(k / 5) * 0.7, 0.55 + Math.floor(k / 5) * 0.7 + 0.28);
    for (let i = 0; i < 3; i++) { L('wicker', sc(BASKET, 1.1), U - 1.4 + i * 0.5, 1.2, 0.06, 10); L('hide_white', [[0.001, 0], [0.2, 0], [0.18, 0.14], [0.001, 0.18]], U - 1.4 + i * 0.5, 1.2, 0.2, 8); }
    for (let k = 0; k < 6; k++) B(['cloth_ochre', 'cloth_red'][k % 2], win.a + 0.4 + k * 0.5, -0.45, win.a + 0.8 + k * 0.5, -0.1, 0.97, 1.1 + (k % 2) * 0.06);
    // the yard: three dye vats and washed cloth hung to dry on poles
    for (let k = 0; k < 3; k++) { const u = 1.4 + k * 1.2, v = yard0 + 1.2; L('terracotta', sc(JAR, 1.5), u, v, 0.05, 12); col.circle(...W(u, v), 0.38, 0, 1.0); L(['cloth_indigo', 'cloth_red', 'cloth_ochre'][k], [[0.001, 0.97], [0.26, 0.97], [0.001, 0.98]], u, v, 0.05, 10); }
    for (const v of [yv(2.4, 3.0)]) { for (const u of [1.0, U - 1.0]) { const [x, z] = W(u, v); bag.add('palm_trunk', box(x - 0.05, 0.05, z - 0.05, x + 0.05, 2.1, z + 0.05)); col.circle(x, z, 0.06, 0, 2.1); }
      beam('palm_trunk', LP(0.95, v, 2.05), LP(U - 0.95, v, 2.05), 0.05, 0.06);
      for (let u = 1.3; u < U - 1.5; u += 0.75) B(['cloth_ochre', 'cloth_indigo', 'cloth_red', 'cloth_white'][Math.floor(rand() * 4)], u, v - 0.02, u + 0.5, v + 0.02, 1.2, 2.04); }
  } else if (trade === 'brewer') {
    // the beer house: mats and low tables along the walls, a great vat with reed straws, bowls, barley sacks
    for (const u of [1.2, U - 3.2]) { B('reed_mat', u - 0.3, 3.1, u + 2.0, 5.0, 0.06, 0.075); Bc('timber', u + 0.4, 3.8, u + 1.3, 4.3, 0.06, 0.4); for (let k = 0; k < 3; k++) L('terracotta', sc(BOWL, 1.1), u + 0.55 + k * 0.28, 4.05, 0.4, 8); }
    { const u = U * 0.5, v = bv - 0.7; L('terracotta', sc(JAR, 2.2), u, v, 0.06, 14); col.circle(...W(u, v), 0.55, 0, 1.5);
      for (const dx of [-0.08, 0.1]) beam('reed_mat', LP(u + dx, v + 0.1, 1.45), LP(u + dx * 6, v - 0.55, 1.95), 0.012, 0.012); }
    sacks(0.9, 0.9, 4); sacks(U - 2.0, 0.9, 2);
    for (let k = 0; k < 4; k++) L('terracotta', sc(BOWL, 1.2), win.a + 0.5 + k * 0.7, -0.28, 0.97, 8);
    // the yard: jars of fermenting mash let into the ground in a row, malted grain spread on the floor to dry
    for (let k = 0; k < 5; k++) { const u = 1.0 + k * 0.85, v = yard0 + 1.0; L('terracotta', sc(JAR, 1.6), u, v, 0.0, 12); col.circle(...W(u, v), 0.38, 0, 0.8); }
    B('hide_tan', 1.0, yard0 + 2.4, U - 1.4, yardV1 - 0.9, 0.05, 0.09);
  } else if (trade === 'smith') {
    // the forge: a brick hearth in the corner under a hood black with soot, a pair of bellows, anvil on a log, quench trough, tools, ingots
    { const u = U - 2.4, v = bv - 0.9; Bc(BB, u - 0.9, v - 0.7, u + 0.9, v + 0.7, 0.06, 0.62); B('pottery_dark', u - 0.6, v - 0.5, u + 0.6, v + 0.5, 0.62, 0.66);
      B('flame', u - 0.2, v - 0.15, u + 0.2, v + 0.15, 0.66, 0.74); B('pottery_dark', u - 1.0, bv + 0.1 - 0.05, u + 1.0, bv + 0.12, 0.7, 2.6);
      B('pottery_dark', u - 0.7, v - 0.6, u + 0.7, bv + 0.12, 2.3, 2.45);
      for (const du of [-0.45, 0.45]) { B('hide_brown', u + du - 0.2, v - 1.4, u + du + 0.2, v - 0.8, 0.4, 0.55); beam('terracotta', LP(u + du, v - 0.8, 0.5), LP(u + du * 0.3, v - 0.4, 0.6), 0.04, 0.04); } }
    { const u = 2.0, v = 3.2; L('palm_trunk', [[0.001, 0], [0.3, 0], [0.3, 0.55], [0.001, 0.55]], u, v, 0.06, 10); col.circle(...W(u, v), 0.3, 0, 0.9); B('basalt', u - 0.2, v - 0.14, u + 0.2, v + 0.14, 0.61, 0.82); }
    Bc('timber', 3.2, 3.0, 4.3, 3.5, 0.06, 0.45); B('bitumen', 3.3, 3.1, 4.2, 3.4, 0.43, 0.46);
    for (let k = 0; k < 7; k++) B('iron', 0.8 + k * 0.28, bv - 0.04, 0.9 + k * 0.28, bv, 1.2, 1.75 - (k % 3) * 0.12);
    for (let k = 0; k < 6; k++) B('bronze', 0.8 + (k % 3) * 0.36, bv - 0.3, 1.1 + (k % 3) * 0.36, bv - 0.1, 0.5 + Math.floor(k / 3) * 0.1, 0.6 + Math.floor(k / 3) * 0.1);
    for (let k = 0; k < 4; k++) B('iron', win.a + 0.5 + k * 0.7, -0.4, win.a + 0.9 + k * 0.7, -0.15, 0.97, 1.02);
    for (let i = 0; i < 2; i++) L('wicker', BASKET, U - 4.5 + i * 0.5, 1.2, 0.06, 10);
    // the yard: charcoal, a heap of scrap, a grindstone
    B('pottery_dark', 1.0, yard0 + 0.6, 2.8, yard0 + 1.8, 0.05, 0.45); L('limestone', [[0.001, 0], [0.4, 0], [0.4, 0.1], [0.001, 0.1]], U - 2.0, yard0 + 1.5, 0.45, 12);
    Bc('timber', U - 2.3, yard0 + 1.4, U - 1.7, yard0 + 1.6, 0.05, 0.45); for (let k = 0; k < 5; k++) B('iron', 3.2 + k * 0.1, yv(1.6, 2.4), 3.4 + k * 0.1, yv(1.6, 2.4) + 0.3, 0.05 + (k % 2) * 0.05, 0.2);
    lights.push({ at: LP(U - 2.4, bv - 1.2, 1.0), color: '#ff6a1a', intensity: 4, distance: 6 });
  } else if (trade === 'grocer') {
    shelf(0.7, U - 0.7, bv, 0.5, 3); for (let k = 0; k < 3; k++) potsRow(0.7, U - 0.7, bv - 0.2, 0.55 + k * 0.7, k === 1 ? 'terracotta' : 'pottery_dark', 0.8);
    for (let i = 0; i < 7; i++) L(i % 2 ? 'wicker' : 'sacking', i % 2 ? BASKET : [[0.001, 0], [0.22, 0.02], [0.26, 0.25], [0.22, 0.5], [0.08, 0.6], [0.001, 0.6]], 1.0 + i * 0.5, 1.4, 0.06, 8);
    // strings of onions and dried fish hanging from the roof beams
    for (let k = 0; k < 6; k++) { const u = 1.4 + k * 1.2, v = 2.5 + (k % 2) * 1.5; B(k % 2 ? 'hide_tan' : 'cloth_ochre', u - 0.05, v - 0.05, u + 0.05, v + 0.05, 1.5, 2.9); for (let j = 0; j < 4; j++) L(k % 2 ? 'hide_grey' : 'cloth_brown', [[0.001, 0], [0.09, 0.02], [0.1, 0.1], [0.001, 0.16]], u, v, 1.5 + j * 0.3, 7); }
    // the balance on the counter, the dates in baskets, jars of oil
    { const u = win.a + 1.0; B('palm_trunk', u - 0.01, -0.3, u + 0.01, -0.27, 0.97, 1.5); B('bronze', u - 0.45, -0.3, u + 0.45, -0.27, 1.5, 1.52); for (const du of [-0.45, 0.45]) L('bronze', [[0.001, 0], [0.12, 0.0], [0.14, 0.02], [0.001, 0.015]], u + du, -0.28, 1.1, 10); }
    for (let i = 0; i < 4; i++) L('wicker', BASKET, win.a + 2.0 + i * 0.6, -0.28, 0.97, 10), L('cloth_brown', [[0.001, 0.2], [0.17, 0.2], [0.001, 0.25]], win.a + 2.0 + i * 0.6, -0.28, 0.97, 8);
    for (let k = 0; k < 4; k++) L('terracotta', sc(JAR, 1.5), 1.0 + k * 0.7, yard0 + 0.9, 0.05, 10);
    for (let k = 0; k < 10; k++) L('wicker', BASKET, U * 0.5 + (k % 5) * 0.5, yv(0.5, 1.0) + Math.floor(k / 5) * 0.5, 0.05 + (k > 4 ? 0.22 : 0), 8);
    sacks(U - 2.0, yardV1 - 1.0, 4);
  } else {   // carpenter
    Bc('timber', 1.0, 2.6, 3.4, 3.4, 0.06, 0.82); B('timber', 1.1, 2.7, 3.3, 3.3, 0.82, 0.88);
    for (let k = 0; k < 4; k++) beam('palm_trunk', LP(U - 3.5, bv - 0.4 - k * 0.3, 0.1), LP(U - 0.8, bv - 0.4 - k * 0.3, 0.1), 0.1, 0.18);
    for (let k = 0; k < 3; k++) beam('palm_trunk', LP(U - 3.3, bv - 0.55 - k * 0.3, 0.3), LP(U - 1.0, bv - 0.55 - k * 0.3, 0.3), 0.1, 0.18);
    for (let k = 0; k < 5; k++) B('cedar', 0.8 + k * 0.1, bv - 0.1 - k * 0.04, 2.4, bv - 0.06 - k * 0.04, 0.06, 2.0);
    for (const [a, b2] of [[1.4, 1.6], [2.1, 2.3], [2.7, 2.9]]) B('iron', a, bv - 0.04, b2, bv, 1.5, 2.05);
    Bc('cedar', U - 3.3, 1.0, U - 2.0, 1.9, 0.06, 0.62); B('bronze', U - 3.32, 0.98, U - 1.98, 1.92, 0.58, 0.62);
    for (let k = 0; k < 14; k++) B('hide_tan', 1.4 + rand() * 2, 3.5 + rand() * 0.8, 1.6 + rand() * 2, 3.7 + rand() * 0.8, 0.06, 0.08);
    for (let k = 0; k < 4; k++) B('cedar', win.a + 0.5 + k * 0.7, -0.4, win.a + 1.0 + k * 0.7, -0.15, 0.97, 1.12);
    // the yard: palm trunks and cedar planks seasoning in stacks and on trestles
    for (let r = 0; r < 4; r++) for (let k = 0; k < 4 - (r > 1 ? 1 : 0); k++) beam('palm_trunk', LP(0.9 + (r > 1 ? 0.2 : 0), yard0 + 0.5 + k * 0.28, 0.2 + r * 0.22), LP(U - 1.0, yard0 + 0.5 + k * 0.28, 0.2 + r * 0.22), 0.1, 0.2);
    for (let k = 0; k < 6; k++) B('cedar', 1.0, yardV1 - 0.4 - k * 0.1, U - 2.5, yardV1 - 0.34 - k * 0.1, 0.06 + k * 0.06, 0.12 + k * 0.06);
    col.rect(R(0.8, yard0 + 0.4, U - 0.9, yard0 + 1.8), 0, 0.9);
  }
  // water jar in the yard's corner, a wicker basket by the back door (every trade)
  L('terracotta', sc(JAR, 1.3), U - 0.9, yardV1 - 0.45, 0.05, 10);
}

/**
 * babylon_yard: { rect, door, kind ('garden' | 'pen' | 'brickyard' | 'kiln'), seed } — a plot walled on three sides and
 * the lane's, 2.4 m high of mud brick, an entrance 2 m wide in the lane wall.
 */
export function babylonYard(el, { bag, col }) {
  const rand = rng(el.seed || 3), f = el.door, { U, V, W, R, LP } = frameOf(el.rect, f);
  const B = (mat, u0, v0, u1, v1, y0, y1) => { const r = R(u0, v0, u1, v1); bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); return r; };
  const Bc = (mat, u0, v0, u1, v1, y0, y1) => { const r = B(mat, u0, v0, u1, v1, y0, y1); col.rect(r, y0, y1); };
  const L = (mat, prof, u, v, y, seg = 10) => { const [x, z] = W(u, v); bag.add(mat, lathe(prof, seg, null, x, y, z)); };
  const beam = (mat, a, b, w, h) => { const T = []; beamTris(T, a, b, w, h); bag.add(mat, fromTriangles(T)); };
  const t = 0.45, h = 2.4, ge = [U * 0.5 - 1.0, U * 0.5 + 1.0], gh = el.kind === 'pen' ? 1.5 : h;
  // the walls: three of full height, the lane side broken by the gate, copings of mud
  for (const q of [[0, V - t, U, V], [0, 0, t, V], [U - t, 0, U, V]]) { Bc(MB, ...q, 0, h); B(MP, q[0] - 0.05, q[1] - 0.05, q[2] + 0.05, q[3] + 0.05, h, h + 0.12); }
  for (const [a, b] of [[0, ge[0]], [ge[1], U]]) { Bc(MB, a, 0, b, t, 0, gh); B(MP, a - 0.05, -0.05, b + 0.05, t + 0.05, gh, gh + 0.12); }
  B('bitumen', 0, -0.03, ge[0], 0, 0, 0.3); B('bitumen', ge[1], -0.03, U, 0, 0, 0.3);
  B(BB, ge[0] - 0.3, -0.2, ge[1] + 0.3, t, 0, 0.08);
  B('silt', t, t, U - t, V - t, 0, 0.04);
  const u = (a, b) => a + (b - a) * rand();
  if (el.kind === 'garden') {
    // a brick-lined channel along the middle taking the water drawn by the shaduf, beds of earth banked with mud, the shaduf at the back
    B(BB, 1.0, 2.0, U - 1.0, 2.6, 0.04, 0.2); B('bitumen', 1.1, 2.1, U - 1.1, 2.5, 0.19, 0.2);
    for (const [a, b] of [[1.0, U * 0.5 - 0.6], [U * 0.5 + 0.6, U - 1.0]]) { B(MP, a, 3.4, b, 3.7, 0.04, 0.25); B(MP, a, V - 3.0, b, V - 2.7, 0.04, 0.25); }
    const su = 2.0, sv = V - 1.6;
    for (const du of [-0.5, 0.5]) Bc(MB, su + du - 0.2, sv - 0.2, su + du + 0.2, sv + 0.2, 0.04, 2.3);
    beam('palm_trunk', LP(su - 1.6, sv, 2.25), LP(su + 0.9, sv, 2.4), 0.07, 0.09);        // the lever: the long arm toward the channel
    L('mudbrick', [[0.001, 0], [0.26, 0.05], [0.28, 0.3], [0.2, 0.52], [0.001, 0.55]], su + 1.0, sv, 1.95, 8);   // the counterweight of clay
    beam('palm_trunk', LP(su - 1.6, sv, 2.25), LP(su - 1.6, sv, 1.1), 0.015, 0.015);      // the rope
    L('hide_brown', [[0.001, 0], [0.16, 0.04], [0.19, 0.3], [0.001, 0.3]], su - 1.6, sv, 0.8, 8);   // the leather bucket
    B(BB, U - 3.2, 3.9, U - 1.4, 4.7, 0.04, 0.22);
  } else if (el.kind === 'pen') {
    // trough, a heap of fodder, a mud floor: the animals are people-plan figures
    Bc('timber', 1.0, V - 1.6, 3.4, V - 1.1, 0.04, 0.45); B('bitumen', 1.1, V - 1.5, 3.3, V - 1.2, 0.43, 0.46);
    L('reed_mat', [[0.001, 0], [1.2, 0], [0.9, 0.5], [0.4, 0.9], [0.001, 1.0]], U - 2.2, V - 2.2, 0.04, 12); col.circle(...W(U - 2.2, V - 2.2), 1.0, 0, 0.8);
    for (let k = 0; k < 6; k++) { const [x, z] = W(u(0.8, U - 0.8), u(2, V - 2)); bag.add('pottery_dark', box(x - 0.1, 0.04, z - 0.1, x + 0.1, 0.07, z + 0.1)); }
    B('palm_trunk', 0.5, V - 0.5, U - 0.5, V - 0.45, 1.6, 1.7);
  } else if (el.kind === 'brickyard') {
    // bricks of the mould drying in rows on edge, then stacked in hacks; a pit of clay with bitumen's colour; straw; the clamp where they are burnt
    for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) {
      const a = 0.9 + k * 0.62, v = 1.2 + r * 0.55;
      if (a > U - 4.6 || v > V - 3.4) continue;
      for (let j = 0; j < 4; j++) B(MB, a, v + j * 0.1, a + 0.4, v + j * 0.1 + 0.08, 0.04, 0.3);
    }
    for (let k = 0; k < 3; k++) { Bc(MB, U - 4.0 + k * 1.2, 1.0, U - 3.0 + k * 1.2, 2.2, 0.04, 1.2); for (let j = 0; j < 4; j++) B(BB, U - 4.0 + k * 1.2, 1.0 + j * 0.3, U - 3.0 + k * 1.2, 1.12 + j * 0.3, 1.2, 1.26); }
    Bc(MP, 0.9, V - 3.0, 3.6, V - 1.2, 0.04, 0.35); B('mud_plaster', 1.0, V - 2.9, 3.5, V - 1.3, 0.34, 0.37);
    L('reed_mat', [[0.001, 0], [0.8, 0], [0.5, 0.4], [0.001, 0.55]], 5.0, V - 1.8, 0.04, 10);
    { const c = [U * 0.55, V - 2.4]; Bc(BB, c[0] - 1.5, c[1] - 1.1, c[0] + 1.5, c[1] + 1.1, 0.04, 1.9); B('pottery_dark', c[0] - 1.3, c[1] - 0.9, c[0] + 1.3, c[1] + 0.9, 1.9, 1.96);
      for (let k = 0; k < 3; k++) { const q = R(c[0] - 0.9 + k * 0.9, c[1] - 1.1, c[0] - 0.5 + k * 0.9, c[1] - 1.0); bag.add('opening', box(q[0], 0.1, q[1], q[2], 0.6, q[3])); } }
  } else {   // kiln: a pair of lime or pottery kilns, firewood, a heap of potsherds
    for (const [ku, kv, s] of [[U * 0.3, V * 0.5, 1.0], [U * 0.68, V * 0.62, 0.85]]) {
      L('terracotta', [[1.4 * s, 0], [1.4 * s, 0.45], [1.2 * s, 1.0], [0.8 * s, 1.5], [0.4 * s, 1.8], [0.001, 1.9]], ku, kv, 0.04, 16); col.circle(...W(ku, kv), 1.4 * s, 0, 1.9);
      const q = R(ku - 0.35, kv - 1.55 * s, ku + 0.35, kv - 1.3 * s); bag.add('opening', box(q[0], 0.04, q[1], q[2], 0.8, q[3]));
      B('pottery_dark', ku - 0.9, kv - 1.46 * s, ku + 0.9, kv - 1.44 * s, 0.1, 1.6);
    }
    for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) beam('palm_trunk', LP(0.9, V - 1.0 - k * 0.3, 0.15 + r * 0.22), LP(3.4, V - 1.0 - k * 0.3, 0.15 + r * 0.22), 0.1, 0.2);
    for (let k = 0; k < 9; k++) L(rand() < 0.5 ? 'terracotta' : 'pottery_dark', [[0.001, 0], [0.2, 0], [0.18, 0.1], [0.001, 0.16]], U - 2.0 + rand() * 1.2, 1.4 + rand() * 1.0, 0.04, 6);
  }
}
