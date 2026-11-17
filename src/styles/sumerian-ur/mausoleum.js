// The royal mausoleum of Shulgi (docs/settlements/ur.md §5.11), after Woolley's mausolea of the Ur III kings: a walled
// court with a forecourt, a court of offerings and a block of cult rooms — the incense room with its hearths and
// altar, the room of the foundation deposit, the room of the stepped entrance — and under them the vaulted tomb
// chambers of baked brick laid in bitumen, reached by a stair down from the stepped room. The whole stands on made
// ground 3 m high (the ground here cannot be cut: the chambers lie at the town's level, "below" the court's pavement).
// ur_mausoleum: { rect [60 × 62 m], seed }, entered from the north by a stair from the lane.

import { box, lathe, fromTriangles, frustum } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import { stairs, buttresses } from '../sumerian/index.js';
import { rng, cutRects } from './util.js';

const BB = 'brick_baked', MP = 'mud_plaster', T = 3.0, R = 2.4, H = 3.4;

export function mausoleum(el, { bag, col, lights }) {
  const [X0, Z0, X1, Z1] = el.rect, rand = rng(el.seed || 3);
  const X = (u) => X0 + u, Z = (v) => Z0 + v;                       // local (u east, v south) → world
  const B = (mat, u0, v0, u1, v1, y0, y1) => bag.add(mat, box(X(u0), y0, Z(v0), X(u1), y1, Z(v1)));
  const C = (u0, v0, u1, v1, y0, y1) => col.rect([X(u0), Z(v0), X(u1), Z(v1)], y0, y1);
  const F = (u0, v0, u1, v1, y) => col.floor([X(u0), Z(v0), X(u1), Z(v1)], y);
  const beam = (mat, a, b, w, h) => { const t = []; beamTris(t, a, b, w, h); bag.add(mat, fromTriangles(t)); };
  const L = (mat, prof, u, v, y, seg = 12) => bag.add(mat, lathe(prof, seg, null, X(u), y, Z(v)));
  const lamp = (u, v, y, i = 3) => { L('terracotta', [[0.001, 0], [0.05, 0.005], [0.06, 0.03], [0.03, 0.05], [0.001, 0.045]], u, v, y, 10); lights.push({ at: [X(u), y + 0.35, Z(v)], color: '#ffb46b', intensity: i, distance: 7 }); bag.add('flame', box(X(u) - 0.02, y + 0.05, Z(v) - 0.02, X(u) + 0.02, y + 0.11, Z(v) + 0.02)); };
  const jar = (u, v, y, s = 1, mat = 'terracotta') => L(mat, [[0.001, 0], [0.1 * s, 0], [0.13 * s, 0.03], [0.24 * s, 0.25 * s], [0.25 * s, 0.42 * s], [0.18 * s, 0.6 * s], [0.09 * s, 0.68 * s], [0.11 * s, 0.74 * s], [0.08 * s, 0.75 * s], [0.001, 0.7 * s]], u, v, y);
  const bowl = (u, v, y, r = 0.12, mat = 'terracotta') => L(mat, [[0.001, 0], [r * 0.45, 0.005], [r, r * 0.45], [r * 0.93, r * 0.47], [r * 0.4, r * 0.12], [0.001, r * 0.1]], u, v, y);
  const [W, D] = [X1 - X0, Z1 - Z0];                                 // 60 × 62

  // ---- the made ground: a battered ring of mud brick, the core of baked brick laid in layers with the tomb's voids cut in
  const ring = (u0, v0, u1, v1, ins) => { bag.add('mudbrick', frustum([X(u0), Z(v0), X(u1), Z(v1)], 0, T, ...ins)); C(u0, v0, u1, v1, 0, T); };
  const G = [26, 34];                                                // the stair's gap in the north strip
  ring(0, 0, G[0], R, [0.5, 0, 0.5, 0]); ring(G[1], 0, W, R, [0, 0.5, 0.5, 0]); ring(0, D - R, W, D, [0.5, 0.5, 0, 0.5]); ring(0, R, R, D - R, [0.5, 0, 0, 0]); ring(W - R, R, W, D - R, [0, 0.5, 0, 0]);
  // the voids: the stair's trench (open from the court of the stepped room to the foot), the passage, two chambers and the door between them
  const cz0 = 54.2, cz1 = 58.6, mz = (cz0 + cz1) / 2;
  const trench = [47, 55.0, 55, 57.8], passage = [43, mz - 0.8, 47, mz + 0.8], ch1 = [33, cz0, 43, cz1], link = [31, mz - 0.7, 33, mz + 0.7], ch2 = [21, cz0, 31, cz1];
  const grow = (r, k) => [r[0], r[1] + 0.3 * k, r[2], r[3] - 0.3 * k];     // a chamber's width at the k-th course of its corbelled vault
  const layers = [[0, 1.4, [trench, passage, ch1, link, ch2]]];
  for (let k = 1; k <= 6; k++) layers.push([1.4 + 0.2 * (k - 1), 1.4 + 0.2 * k, [trench, ...(k <= 4 ? [passage] : []), grow(ch1, k), ...(k <= 3 ? [link] : []), grow(ch2, k)]]);
  layers.push([2.6, T, [trench]]);
  const fillBase = [[R, R, W - R, D - R], [G[0], 0, G[1], R]];
  for (const [y0, y1, voids] of layers) for (const base of fillBase) for (const r of cutRects(base, voids)) B(BB, r[0], r[1], r[2], r[3], y0, y1);
  // the solid of it for the walker, and the roof of each void
  for (const base of fillBase) for (const r of cutRects(base, [trench, passage, ch1, link, ch2])) C(r[0], r[1], r[2], r[3], 0, T);
  for (const r of [ch1, ch2]) C(r[0], r[1], r[2], r[3], 2.6, T);
  C(passage[0], passage[1], passage[2], passage[3], 2.2, T); C(link[0], link[1], link[2], link[3], 2.0, T);
  for (const base of fillBase) for (const r of cutRects(base, [trench])) F(r[0], r[1], r[2], r[3], T);            // the court's pavement
  // (the chambers' floors: baked brick laid in bitumen)
  for (const r of [ch1, link, ch2, passage]) { B(BB, r[0], r[1], r[2], r[3], -0.3, 0.04); F(r[0], r[1], r[2], r[3], 0.04); }
  B('bitumen', ch1[0] + 0.3, mz - 0.9, ch1[2] - 0.3, mz + 0.9, 0.04, 0.045); B('bitumen', ch2[0] + 0.3, mz - 0.9, ch2[2] - 0.3, mz + 0.9, 0.04, 0.045);
  // the stair down, climbing eastward to the stepped room's floor
  stairs({ rect: [X(trench[0]), Z(trench[1]), X(trench[2]), Z(trench[3])], y0: 0.04, y1: T, dir: 'e', mat: BB }, { bag, col });
  // the stair up from the lane to the court
  stairs({ rect: [X(G[0]), Z(-5.7), X(G[1]), Z(0.0)], y0: 0, y1: T, dir: 's', mat: BB }, { bag, col });
  B('mudbrick', G[0] - 0.5, -5.7, G[0], 0.0, 0, 1.0); B('mudbrick', G[1], -5.7, G[1] + 0.5, 0.0, 0, 1.0); C(G[0] - 0.5, -5.7, G[0], 0, 0, 1.0); C(G[1], -5.7, G[1] + 0.5, 0, 0, 1.0);

  // ---- the walls on the top: plastered mud brick on a baked footing, the court's gate between two towers, the doorways of the rooms
  const lintel = (a, b, h) => beam('palm_trunk', a, b, 0.1, 0.16);
  const wall = (u0, v0, u1, v1, holes = [], h = H, y0 = T) => {                    // along u if wider than deep
    const alongU = u1 - u0 > v1 - v0, A = alongU ? u0 : v0, Bn = alongU ? u1 : v1;
    const seg = (a, b, yb, yt) => {
      if (b - a < 1e-3 || yt - yb < 1e-3) return;
      const q = alongU ? [a, v0, b, v1] : [u0, a, u1, b];
      if (yb < y0 + 0.9) { B(BB, ...q, yb, Math.min(y0 + 0.9, yt)); if (yt > y0 + 0.9) B(MP, ...q, y0 + 0.9, yt); } else B(MP, ...q, yb, yt);
      C(...q, yb, yt);
    };
    let a = A;
    for (const o of [...holes].sort((p, q) => p.a - q.a)) { seg(a, o.a, y0, y0 + h); seg(o.a, o.b, y0 + o.h, y0 + h); a = o.b; }
    seg(a, Bn, y0, y0 + h);
  };
  const HH = H + 0.2, gate = { a: 27.5, b: 32.5, h: 3.4 }, door = (c, w, h = 2.7) => ({ a: c - w / 2, b: c + w / 2, h });
  // the enclosure: north (with the gate), south, west, east
  wall(1.2, 1.2, 27.5, 2.6, [], HH); wall(32.5, 1.2, W - 1.2, 2.6, [], HH); wall(1.2, D - 2.6, W - 1.2, D - 1.2, [], H); wall(1.2, 2.6, 2.6, D - 2.6, [], HH); wall(W - 2.6, 2.6, W - 1.2, D - 2.6, [], HH);
  B(MP, 27.5, 1.2, 32.5, 2.6, T + gate.h, T + HH); C(27.5, 1.2, 32.5, 2.6, T + gate.h, T + HH);
  for (const [a, b, c] of [[23.5, 27.5, 0], [32.5, 36.5, 0]]) { B(MP, a, 0.4, b, 3.4, T, T + 5.6); C(a, 0.4, b, 3.4, T, T + 5.6); B('brick_buff', a - 0.1, 0.3, b + 0.1, 3.5, T + 5.6, T + 5.8); void c; }   // the towers of the gate
  for (const s of [-1, 1]) B('cedar', s < 0 ? 27.55 : 31.95, 1.9, s < 0 ? 28.05 : 32.45, 2.5 + 0.0, T + 0.05, T + 3.3);
  B('cedar', 27.6, 0.95, 27.8, 1.75, T + 0.05, T + 3.3); B('cedar', 32.2, 0.95, 32.4, 1.75, T + 0.05, T + 3.3);
  // buttresses along the outer faces, the gate left clear
  buttresses(bag, [X(1.2), Z(1.2), X(W - 1.2), Z(D - 1.2)], T, H, 0, 3.6, (px, pz) => Math.abs(px - X(30)) < 4.6 && pz < Z(3), MP, 0.5, 0.3, col);
  // the inner partition before the court of offerings (a doorway between the forecourt and the court) and the front wall of the cult rooms
  wall(2.6, 17, W - 2.6, 18.2, [door(30, 3.6)], H);
  const rooms = { r4: [2.6, 53.6, 12.6, D - 2.6], r5: [13.8, 53.6, 43.2, D - 2.6], r6: [44.4, 53.6, W - 2.6, D - 2.6] };
  wall(2.6, 52.4, W - 2.6, 53.6, [door(7.6, 2.6, 2.6), door(28.5, 3.4, 2.9), door(51.5, 2.6, 2.6)], H);
  wall(12.6, 53.6, 13.8, D - 2.6, [{ a: 55.6, b: 57.1, h: 2.4 }], H); wall(43.2, 53.6, 44.4, D - 2.6, [{ a: 55.6, b: 57.2, h: 2.5 }], H);
  // lintels of palm trunk over the doorways (on the court side)
  for (const [c, w, v] of [[30, 3.6, 17 - 0.06], [7.6, 2.6, 52.4 - 0.06], [28.5, 3.4, 52.4 - 0.06], [51.5, 2.6, 52.4 - 0.06]]) lintel([X(c - w / 2 - 0.15), T + 2.7, Z(v)], [X(c + w / 2 + 0.15), T + 2.7, Z(v)]);
  // the two leaves of the incense room's door, open against the jambs; the others stand open too
  for (const [u, s] of [[28.5 - 1.7, 1], [28.5 + 1.7, -1]]) { B('cedar', Math.min(u, u + s * 0.06), 52.5, Math.max(u, u + s * 0.06), 53.3, T + 0.05, T + 2.85); B('bronze', Math.min(u, u + s * 0.06) - 0.005, 52.5, Math.max(u, u + s * 0.06) + 0.005, 53.3, T + 1.0, T + 1.14); }
  // the roofs of the three rooms: mud on reed mats on palm trunks, spanning the room's depth; a parapet round the block
  for (const r of Object.values(rooms)) {
    B(MP, r[0], r[1], r[2], r[3], T + H - 0.28, T + H); B('reed_mat', r[0], r[1], r[2], r[3], T + H - 0.33, T + H - 0.28); F(r[0], r[1], r[2], r[3], T + H);
    for (let u = r[0] + 0.35; u < r[2] - 0.15; u += 0.6) beam('palm_trunk', [X(u), T + H - 0.47, Z(r[1])], [X(u), T + H - 0.47, Z(r[3])], 0.07, 0.14);
    for (const c of cutRects(r, [trench])) F(c[0], c[1], c[2], c[3], T);            // the floor of the room (not across the stair's opening)
  }
  for (const q of [[1.2, 52.4, W - 1.2, 52.7], [1.2, D - 1.2 - 0.3, W - 1.2, D - 1.2], [1.2, 52.7, 1.5, D - 1.5], [W - 1.5, 52.7, W - 1.2, D - 1.5]]) { B(MP, ...q, T + H, T + H + 0.45); C(...q, T + H, T + H + 0.45); }
  for (const [u0, u1] of [[12.6, 13.8], [43.2, 44.4]]) B(MP, u0, 53.6, u1, D - 2.6, T + H - 0.28, T + H);

  // ---- the incense room (Room 5): the altar of baked brick with its steps against the back wall, the two hearths of incense, the pedestal and its stela, benches, lamps
  { const a0 = 24.5, a1 = 33.5;
    B(BB, a0, 57.2, a1, D - 2.6, T, T + 1.0); B(BB, a0 - 0.5, 56.7, a1 + 0.5, 57.2, T, T + 0.6); B(BB, a0 - 1.0, 56.2, a1 + 1.0, 56.7, T, T + 0.3); C(a0 - 1.0, 56.2, a1 + 1.0, D - 2.6, T, T + 1.0);
    B('pottery_dark', a0 + 0.8, 57.4, a1 - 0.8, 58.8, T + 1.0, T + 1.02);                  // the blackened top
    for (const u of [a0 + 0.2, a1 - 0.2]) B(BB, u - 0.2, D - 2.6 - 0.5, u + 0.2, D - 2.6 - 0.1, T + 1.0, T + 1.35);            // its horns
    for (const u of [16.5, 40.5]) { B(BB, u - 0.55, 56.0, u + 0.55, 57.1, T, T + 0.35); B('pottery_dark', u - 0.4, 56.15, u + 0.4, 56.95, T + 0.35, T + 0.37); B('flame', u - 0.1, 56.4, u + 0.1, 56.7, T + 0.37, T + 0.62); C(u - 0.55, 56.0, u + 0.55, 57.1, T, T + 0.35); lights.push({ at: [X(u), T + 0.9, Z(56.5)], color: '#ff9a4a', intensity: 4, distance: 9 }); }
    // the pedestal of limestone with the king's stela standing on it, before the east end
    B('limestone', 36.2, 57.4, 38.6, 58.6, T, T + 0.7); B('limestone_carved', 36.9, 57.7, 37.9, 58.2, T + 0.7, T + 2.6); C(36.2, 57.4, 38.6, 58.6, T, T + 0.7); lamp(35.4, 58.3, T + 0.0, 3);
    // the table of offerings with bowls and loaves, benches along the walls
    B('cedar', 18.5, 55.0, 21.5, 55.7, T + 0.7, T + 0.76); for (const [u, v] of [[18.8, 55.2], [19.6, 55.5], [20.4, 55.3], [21.2, 55.5]]) B('cedar', u - 0.04, v - 0.04, u + 0.04, v + 0.04, T, T + 0.7);
    for (const [u, v] of [[19.0, 55.35], [20.0, 55.35]]) bowl(u, v, T + 0.76, 0.14); for (const u of [20.9]) L('wicker', [[0.001, 0], [0.2, 0.01], [0.24, 0.12], [0.001, 0.12]], u, 55.35, T + 0.76);
    C(18.5, 55.0, 21.5, 55.7, T, T + 0.76);
    for (const [u0, u1] of [[14.2, 21.5], [36.5, 42.8]]) { B(BB, u0, D - 2.6 - 0.55, u1, D - 2.6, T, T + 0.45); C(u0, D - 2.6 - 0.55, u1, D - 2.6, T, T + 0.45); }
    for (const u of [15, 22.5, 35.5, 42]) lamp(u, 54.1, T + 0.9 > 0 ? T + 0.0 : T, 2.5);
    for (const u of [16.5, 40.5]) jar(u + 1.1, 55.3, T, 0.9);
    B('reed_mat', 22, 54.2, 36, 56.0, T + 0.01, T + 0.03);                                // a mat of reeds before the altar
  }
  // ---- the room of the foundation deposit (Room 4): a cist of baked brick, the copper foundation figure, the tablet, jars
  { B(BB, 4.4, 55.6, 6.6, 57.0, T, T + 0.55); C(4.4, 55.6, 6.6, 57.0, T, T + 0.55); B('brick', 4.6, 55.8, 6.4, 56.8, T + 0.55, T + 0.6);
    L('bronze', [[0.001, 0.6], [0.1, 0.6], [0.1, 0.62], [0.001, 0.66]], 5.5, 56.3, T, 10);
    L('bronze', [[0.001, 0.58], [0.06, 0.6], [0.07, 0.95], [0.1, 1.0], [0.09, 1.18], [0.001, 1.2]], 5.5, 56.3, T, 10);              // the foundation figure with its peg
    B('limestone', 8.2, 56.0, 8.9, 56.5, T, T + 0.05); for (const [u, v] of [[10.8, 55.0], [11.4, 55.4], [10.9, 58.2]]) jar(u, v, T, 0.9);
    lamp(3.2, 54.2, T, 2); }
  // ---- the stepped room (Room 6): the head of the stair down, a brick parapet round its opening, the lamp at the stair's head, a jar of water, benches
  { const o = [trench[0] - 0.2, trench[1] - 0.2, trench[2], trench[3] + 0.2];
    B(BB, o[0], o[1], o[2], trench[1], T, T + 0.5); B(BB, o[0], trench[3], o[2], o[3], T, T + 0.5); C(o[0], o[1], o[2], trench[1], T, T + 0.5); C(o[0], trench[3], o[2], o[3], T, T + 0.5);
    B(BB, o[0], trench[1], trench[0], trench[3], T, T + 0.5); C(o[0], trench[1], trench[0], trench[3], T, T + 0.5);
    lamp(trench[2] + 0.8, trench[1] - 0.2, T, 2.5); jar(55.9, 54.2, T, 1.0); B(BB, 45.0, 58.2, 47.5, 59.0, T, T + 0.45); C(45, 58.2, 47.5, 59, T, T + 0.45);
    B(BB, 45, 54.0, 45.6, 55.5, T, T + 0.45); }
  // ---- the tomb chambers: the lamp in a niche, the brick biers along the walls with the vessels of the offerings, the traces of gold leaf that the robbers left
  for (const [i, r] of [[0, ch1], [1, ch2]]) {
    const mid = (r[0] + r[2]) / 2;
    for (const s of [-1, 1]) { B(BB, r[0] + 0.5, s < 0 ? r[1] + 0.05 : r[3] - 0.85, r[2] - 0.5, s < 0 ? r[1] + 0.85 : r[3] - 0.05, 0.04, 0.5); C(r[0] + 0.5, s < 0 ? r[1] + 0.05 : r[3] - 0.85, r[2] - 0.5, s < 0 ? r[1] + 0.85 : r[3] - 0.05, 0, 0.5); B('reed_mat', r[0] + 0.7, s < 0 ? r[1] + 0.15 : r[3] - 0.75, r[2] - 0.7, s < 0 ? r[1] + 0.75 : r[3] - 0.15, 0.5, 0.52); }
    for (let k = 0; k < 6; k++) { const u = r[0] + 1.3 + k * 1.5 + rand() * 0.3, v = mz + (k % 2 ? 0.95 : -0.95); jar(u, v, 0.04, 0.8 + 0.2 * (k % 3) / 2); col.circle(X(u), Z(v), 0.26, 0.04, 0.8); }
    lamp(mid, r[1] + 0.2, 1.1, 3.5); B(MP, mid - 0.25, r[1], mid + 0.25, r[1] + 0.12, 1.0, 1.1);
    B('gold', r[0] + 2.2 + i, r[1] + 0.2, r[0] + 2.45 + i, r[1] + 0.42, 0.52, 0.525);
    for (const dx of [0.3, 1.2]) B('bronze', mid + dx - 0.12, mz - 0.1, mid + dx + 0.12, mz + 0.12, 0.04, 0.1);
  }
  lamp(trench[0] + 1.2, trench[1] + 0.2, 0.5, 3);                                    // at the stair's foot
  // ---- the court of offerings: the altar of libation with its drain, two basins, benches, jars and palms in pits; the forecourt: benches and two palms
  { const cu = 30; B(BB, cu - 1.4, 33, cu + 1.4, 34.6, T, T + 0.8); B('pottery_dark', cu - 1.0, 33.2, cu + 1.0, 34.4, T + 0.8, T + 0.82); B('bitumen', cu - 0.5, 33.6, cu + 0.5, 34.0, T + 0.82, T + 0.84); C(cu - 1.4, 33, cu + 1.4, 34.6, T, T + 0.8);
    for (const u of [cu - 6, cu + 6]) { B(BB, u - 1.0, 34.0, u + 1.0, 35.8, T, T + 0.75); B('bitumen', u - 0.8, 34.2, u + 0.8, 35.6, T + 0.75, T + 0.77); B('water', u - 0.7, 34.3, u + 0.7, 35.5, T + 0.77, T + 0.775); C(u - 1, 34.0, u + 1, 35.8, T, T + 0.75); jar(u + 1.5, 34.4, T, 1.0); }
    for (const [u0, u1] of [[3.4, 12.4], [47.6, 56.6]]) for (const [v0, v1] of [[24, 24.6], [40, 40.6]]) { B(BB, u0, v0, u1, v1, T, T + 0.45); C(u0, v0, u1, v1, T, T + 0.45); }
    for (const [u, v] of [[5, 20.5], [55, 20.5], [5, 44], [55, 44], [8, 8], [52, 8]]) { B(BB, u - 0.9, v - 0.9, u + 0.9, v + 0.9, T, T + 0.3); B('silt', u - 0.7, v - 0.7, u + 0.7, v + 0.7, T + 0.3, T + 0.32); C(u - 0.9, v - 0.9, u + 0.9, v + 0.9, T, T + 0.3); }
  }
}
