// Rooms of the Edo town (docs/settlements/edo-himeji.md §5.1): the merchant's machiya open as a shop — the front
// shop (mise) on its raised floor of mats behind the open front with its noren, the counter's lattice screen
// (chōba-gōshi), the earth-floored passage (tōri-niwa) running from the street to the back, the cooking range
// (kamado) at its rear under the open rafters; and the samurai house's reception room (zashiki) with its
// alcove (tokonoma), the staggered shelves, the armour on its chest, the sword rack and the paper lamp.

import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';

const PL = 'plaster_castle', WD = 'wood_dark', TL = 'tile_grey', MAT = 'reed_mat';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/** Mats (tatami) over [u0, u1] × [q0, q1] at height v, laid in 0.9 × 1.8 m with their dark cloth borders; B(m, u0, u1, v0, v1, q0, q1). */
function tatami(B, u0, u1, q0, q1, v) {
  B(MAT, u0, u1, v - 0.05, v, q0, q1);
  for (let u = u0 + 1.8; u < u1 - 0.3; u += 1.8) B('cloth_black', u - 0.025, u + 0.025, v, v + 0.004, q0, q1);
  for (let q = q0 + 0.9; q < q1 - 0.3; q += 0.9) B('cloth_black', u0, u1, v + 0.004, v + 0.006, q - 0.022, q + 0.022);
}

/**
 * machiyaShop(el, ctx, H) — the ground storey of an open machiya { rect, seed, front ('s'|'n') }, its shell, floors and
 * things; H = { r (the house's block), H1 (the ground storey), H2 (the upper), roof } — the caller adds the upper
 * storey's front, the pent roof and the main roof as for any machiya.
 */
export function machiyaShop(el, { bag, col }, { r, H1, H2 }) {
  const rand = rng((el.seed || 1) * 3 + 7), f = el.front || 's', s = f === 's' ? 1 : -1, fz = f === 's' ? r[3] : r[1];
  const [x0, , x1] = r, dep = Math.abs(r[3] - r[1]), Z = (q) => fz - s * q;
  const B = (m, u0, u1, v0, v1, q0, q1) => bag.add(m, box(Math.min(u0, u1), Math.min(v0, v1), Math.min(Z(q0), Z(q1)), Math.max(u0, u1), Math.max(v0, v1), Math.max(Z(q0), Z(q1))));
  const C = (u0, u1, q0, q1, v0, v1) => col.rect([Math.min(u0, u1), Math.min(Z(q0), Z(q1)), Math.max(u0, u1), Math.max(Z(q0), Z(q1))], v0, v1);
  const F = (u0, u1, q0, q1, v) => col.floor([Math.min(u0, u1), Math.min(Z(q0), Z(q1)), Math.max(u0, u1), Math.max(Z(q0), Z(q1))], v);
  const lat = (m, prof, seg, u, v, q) => bag.add(m, lathe(prof, seg, null, u, v, Z(q)));
  const t = 0.15, ua = x0 + t, ub = x1 - t, qb = dep - t, dw = 1.55, du = ua + dw, fl = 0.45;
  // ---- the shell: the plastered side and back walls on a dark plinth, the upper storey solid over the ground storey's ceiling
  for (const [u0, u1] of [[x0, ua], [ub, x1]]) { B(PL, u0, u1, 0, H1, 0, dep); B('plaster_grey', u0 - 0.004, u1 + 0.004, 0, 0.5, 0.05, dep - 0.05); C(u0, u1, 0, dep, 0, H1); }
  B(PL, ua, ub, 0, H1, qb, dep); C(ua, ub, qb, dep, 0, H1);
  B(PL, x0, x1, H1, H1 + H2, 0, dep); C(x0, x1, 0, dep, H1, H1 + H2);
  // the ground storey's ceiling: the joists and the boards of the floor above
  B('timber', ua, ub, H1 - 0.04, H1, 0.12, qb);
  for (let q = 0.6; q < qb - 0.2; q += 0.9) B(WD, ua, ub, H1 - 0.16, H1 - 0.04, q - 0.05, q + 0.05);
  // the front's frame: the posts at the corners and between the passage and the shop, the head beam
  for (const u of [x0 + 0.08, du, x1 - 0.08]) { B(WD, u - 0.09, u + 0.09, 0, H1 - 0.25, 0.02, 0.2); C(u - 0.09, u + 0.09, 0.02, 0.2, 0, H1); }
  // ---- the passage (tōri-niwa): an earth floor from the street to the back; the shop's raised floor of mats beside it
  B('silt', ua, du, -0.05, 0.03, 0.02, qb); F(ua, du, 0.02, qb, 0.03);
  const qm = Math.min(4.6, dep * 0.45);                                                            // the shop's depth
  B(WD, du, ub, 0, fl - 0.05, 0.3, qb); B(WD, du, ub, fl - 0.12, fl - 0.05, 0.25, 0.32);           // its base and the edge beam along the street
  tatami(B, du + 0.02, ub, 0.32, qm, fl); B(WD, du + 0.02, ub, fl - 0.06, fl + 0.005, qm, qm + 0.05);
  tatami(B, du + 0.02, ub, qm + 0.05, qb, fl);
  B(WD, du, du + 0.06, fl - 0.12, fl + 0.005, 0.3, qb);                                              // the step's edge along the passage
  F(du, ub, 0.25, qb, fl); C(du, ub, 0.25, 0.3, 0, fl - 0.05);
  // the sliding doors (fusuma) between the shop and the room behind, two of them pushed aside
  { const n = Math.max(2, Math.round((ub - du) / 0.9)), w = (ub - du) / n;
    for (let k = 0; k < n; k++) { if (k === 1 || k === 2) continue; const t2 = []; beamTris(t2, [du + k * w + 0.02, fl, Z(qm + 0.025)], [du + (k + 1) * w - 0.02, fl, Z(qm + 0.025)], 0.02, H1 - fl - 0.35); bag.add('shoji', fromTriangles(t2)); }
    B(WD, du, ub, H1 - 0.35, H1 - 0.2, qm, qm + 0.05); C(du, du + w, qm, qm + 0.05, fl, H1); C(du + 3 * w, ub, qm, qm + 0.05, fl, H1); }
  // ---- the noren: a long curtain of indigo in three panels over the passage's mouth, a short one along the shop front
  const noren = (u0, u1, v0, v1, n) => { const w = (u1 - u0) / n; for (let k = 0; k < n; k++) { B('cloth_indigo', u0 + k * w + 0.012, u0 + (k + 1) * w - 0.012, v0, v1, -0.06, -0.05); B('cloth_white', u0 + (k + 0.5) * w - 0.09, u0 + (k + 0.5) * w + 0.09, v1 - 0.38, v1 - 0.2, -0.062, -0.06); } B(WD, u0 - 0.05, u1 + 0.05, v1, v1 + 0.04, -0.08, -0.03); };
  noren(ua + 0.08, du - 0.1, H1 - 1.45, H1 - 0.3, 3); noren(du + 0.12, ub - 0.1, H1 - 0.85, H1 - 0.3, Math.max(3, Math.round((ub - du) / 0.7)));
  // the sign board (kanban) on its post at the shop's corner, the trade written on it in black
  { const u = x1 - 0.32; B(WD, u - 0.04, u + 0.04, 0, 1.0, -0.42, -0.34); B('wood_painted', u - 0.17, u + 0.17, 0.95, 2.3, -0.42, -0.36); B(WD, u - 0.2, u + 0.2, 2.3, 2.38, -0.44, -0.34);
    for (let k = 0; k < 4; k++) B('lacquer_black', u - 0.09 + (k % 2) * 0.03, u + 0.09 - (k % 2) * 0.05, 2.12 - k * 0.27, 2.2 - k * 0.27, -0.445, -0.4205); C(u - 0.2, u + 0.2, -0.44, -0.34, 0, 2.38); }
  // ---- the trade: cloth on shelves, ceramics on stepped stands, or rice in straw bales
  const trade = ['cloth', 'pottery', 'rice'][Math.floor(rand() * 3)];
  if (trade === 'cloth') {
    const q0 = qm - 0.55;
    B(WD, du + 0.4, ub - 0.3, fl, fl + 1.8, q0, q0 + 0.45); C(du + 0.4, ub - 0.3, q0, q0 + 0.45, fl, fl + 1.8);
    const cols = ['cloth_indigo', 'cloth_red', 'linen', 'cloth_brown', 'cloth_indigo', 'cloth_green', 'cloth_white', 'cloth_ochre'];
    for (let sh = 0; sh < 4; sh++) { const v = fl + 0.05 + sh * 0.44; B('timber', du + 0.42, ub - 0.32, v - 0.02, v, q0 - 0.02, q0 + 0.02);
      for (let u = du + 0.48, k = 0; u < ub - 0.5; u += 0.3, k++) B(cols[(k + sh * 3) % cols.length], u, u + 0.26, v, v + 0.12 + (k % 3) * 0.06, q0 - 0.06 + (k % 2) * 0.02, q0 + 0.0); }
    for (let k = 0; k < 4; k++) B(cols[k * 2 % cols.length], du + 1.0 + k * 0.32, du + 1.28 + k * 0.32, fl, fl + 0.06, 1.0, 1.6);   // bolts unrolled before a customer
  } else if (trade === 'pottery') {
    for (let k = 0; k < 3; k++) { const q = 0.6 + k * 0.45, v = fl + k * 0.25; B(WD, du + 0.4, ub - 0.4, fl, v + 0.25, q, q + 0.4);
      for (let u = du + 0.6; u < ub - 0.5; u += 0.45) lat(k === 1 ? 'glaze_blue' : k ? 'glaze_white' : 'pottery_dark', k === 0 ? [[0.001, 0], [0.12, 0.02], [0.16, 0.16], [0.1, 0.28], [0.11, 0.31], [0.001, 0.31]] : [[0.001, 0], [0.05, 0.0], [0.12, 0.08], [0.13, 0.1], [0.001, 0.03]], 10, u, v + 0.25, q + 0.2); }
    C(du + 0.4, ub - 0.4, 0.6, 2.0, fl, fl + 1);
  } else {
    // tawara: rice in straw bales stacked in the passage and on the shop floor, a measure (masu) on the mats
    const bale = (u, v, q, len = 0.75) => { const g = lathe([[0.2, -len / 2], [0.25, -len / 2 + 0.06], [0.27, 0], [0.25, len / 2 - 0.06], [0.2, len / 2], [0.001, len / 2]], 10); g.rotateX(Math.PI / 2); g.translate(u, v, Z(q)); bag.add('thatch', g); };
    for (let k = 0; k < 3; k++) for (let j = 0; j < 2 - (k === 2 ? 1 : 0); j++) bale(du + 0.5 + j * 0.55 + (k === 2 ? 0.27 : 0), fl + 0.27 + k * 0.48, qm - 0.6);
    C(du + 0.2, du + 1.4, qm - 1.0, qm - 0.2, fl, fl + 1.3);
    B('timber', du + 1.8, du + 2.1, fl, fl + 0.12, 1.0, 1.3);
  }
  // the counter's corner: a low lattice screen round the master's desk, an abacus and a ledger on it, a brazier
  { const u0 = ub - 1.5, q0 = qm - 1.7, q1 = qm - 0.3;
    if (q0 > 1.6) {
      const t2 = []; beamTris(t2, [u0, fl, Z(q0)], [ub - 0.05, fl, Z(q0)], 0.02, 0.5); beamTris(t2, [u0, fl, Z(q0)], [u0, fl, Z(q1)], 0.02, 0.5); bag.add('koshi', fromTriangles(t2));
      B(WD, u0 + 0.35, u0 + 1.15, fl, fl + 0.3, q0 + 0.25, q0 + 0.65); B('linen', u0 + 0.45, u0 + 0.7, fl + 0.3, fl + 0.33, q0 + 0.3, q0 + 0.6);
      B(WD, u0 + 0.75, u0 + 1.08, fl + 0.3, fl + 0.32, q0 + 0.35, q0 + 0.5);
      for (let k = 0; k < 8; k++) B('wood_painted', u0 + 0.77 + k * 0.038, u0 + 0.79 + k * 0.038, fl + 0.32, fl + 0.34, q0 + 0.37, q0 + 0.48);
      lat('pottery_dark', [[0.001, 0], [0.16, 0.0], [0.18, 0.22], [0.15, 0.24], [0.001, 0.2]], 12, u0 + 0.2, fl, q0 + 1.0);
      C(u0, ub, q0, q0 + 0.05, fl, fl + 0.5);
    }
  }
  // ---- the rear of the passage under the open rafters: the cooking range, the water jar, a rack of things
  { const q1 = qb - 0.05, q0 = q1 - 1.8, u0 = ua + 0.02, u1 = du - 0.05;
    B('mud_plaster', u0, u0 + 0.75, 0, 0.62, q0, q1); B('plaster_white', u0 - 0.005, u0 + 0.755, 0.62, 0.66, q0 - 0.005, q1);
    for (const q of [q0 + 0.45, q0 + 1.3]) { lat('opening', [[0.001, 0], [0.17, 0.0], [0.17, 0.005], [0.001, 0.005]], 12, u0 + 0.38, 0.661, q); B('cloth_black', u0 + 0.75, u0 + 0.756, 0.15, 0.62, q - 0.2, q + 0.2); }
    lat('iron', [[0.001, 0], [0.18, 0.02], [0.2, 0.12], [0.16, 0.2], [0.17, 0.22], [0.001, 0.22]], 12, u0 + 0.38, 0.66, q0 + 0.45);
    lat('pottery_dark', [[0.001, 0], [0.16, 0.02], [0.18, 0.18], [0.12, 0.26], [0.001, 0.27]], 12, u0 + 0.38, 0.66, q0 + 1.3);
    lat('timber', [[0.001, 0], [0.14, 0.0], [0.14, 0.03], [0.001, 0.03]], 12, u0 + 0.38, 0.93, q0 + 1.3);
    C(u0, u0 + 0.75, q0, q1, 0, 0.66);
    lat('pottery_dark', [[0.001, 0], [0.18, 0.02], [0.3, 0.3], [0.28, 0.62], [0.22, 0.7], [0.23, 0.74], [0.001, 0.74]], 12, u1 - 0.32, 0.03, q0 - 0.45);
    lat('timber', [[0.001, 0], [0.24, 0.0], [0.24, 0.03], [0.001, 0.03]], 12, u1 - 0.32, 0.77, q0 - 0.45);
    C(u1 - 0.62, u1 - 0.02, q0 - 0.75, q0 - 0.15, 0, 0.8);
    for (const v of [1.45, 1.9]) { B('timber', ua, ua + 0.32, v - 0.03, v, q0 - 1.4, q0 - 0.2); for (let k = 0; k < 3; k++) lat(k % 2 ? 'glaze_white' : 'pottery_dark', [[0.001, 0], [0.06, 0.0], [0.08, 0.06], [0.001, 0.05]], 8, ua + 0.16, v, q0 - 1.2 + k * 0.35); }
  }
  return trade;
}

/**
 * zashiki(B, C, F, o) — the reception room of a samurai house, built in a frame (u across its front, q in from
 * the veranda's edge, v up from the ground): o = { u0, u1, q0 (the front), q1 (the back), fl (the floor), h (the
 * room's height), seed }. The front's paper doors stand open to the veranda; plastered side walls and the back
 * with the alcove and the shelves.
 */
export function zashiki(bag, B, C, lat, at, o) {
  const { u0, u1, q0, q1, fl, h } = o, rand = rng(o.seed || 1), W = u1 - u0;
  const top = fl + h;
  tatami(B, u0 + 0.06, u1 - 0.06, q0 + 0.02, q1 - 0.06, fl + 0.05);
  B('timber', u0, u1, top - 0.03, top, q0, q1);                                              // the ceiling of boards
  for (let u = u0 + 0.45; u < u1 - 0.2; u += 0.45) B(WD, u - 0.02, u + 0.02, top - 0.06, top - 0.03, q0, q1);
  B(WD, u0, u1, top - 0.45, top - 0.35, q0, q0 + 0.12);                                      // the lintel (kamoi) over the front
  // the back: the alcove (tokonoma) with its raised floor, the post (tokobashira), the hanging scroll and a vase with a branch
  const tw = Math.min(1.8, W * 0.32), tu0 = u0 + W * 0.5 - tw - 0.05, tu1 = tu0 + tw, td = 0.75;
  B(PL, u0, tu0, fl, top, q1 - 0.06, q1); B(PL, tu1 + 0.12, u1, fl, top, q1 - 0.06, q1);
  B(PL, tu0, tu1, fl, top, q1 - 0.06 + td, q1 + td - 0.06 + 0.06);                           // the alcove's back wall
  B(PL, tu0 - 0.06, tu0, fl, top, q1 - 0.06, q1 + td); B(PL, tu1 + 0.06, tu1 + 0.12, fl, top, q1 - 0.06, q1 + td);
  B('lacquer_black', tu0, tu1 + 0.06, fl + 0.05, fl + 0.18, q1 - 0.06, q1 - 0.02);           // the alcove's lacquered front edge
  B('timber', tu0, tu1 + 0.06, fl + 0.05, fl + 0.18, q1 - 0.02, q1 + td - 0.06);              // its raised floor
  B(PL, tu0, tu1 + 0.06, top - 0.5, top, q1 - 0.06, q1 - 0.01);                              // the lintel wall over it
  lat('cedar', [[0.06, 0], [0.06, h], [0.001, h]], 8, tu1 + 0.06, fl, q1 - 0.03);             // the alcove post, of natural wood
  { const su = (tu0 + tu1) / 2, sq = q1 + td - 0.07;
    B('linen', su - 0.28, su + 0.28, fl + 0.65, fl + 2.15, sq - 0.012, sq); B('cloth_indigo', su - 0.32, su + 0.32, fl + 0.55, fl + 2.3, sq - 0.008, sq - 0.001);
    for (let k = 0; k < 5; k++) B('lacquer_black', su - 0.02 - (k % 2) * 0.05, su + 0.03 + (k % 3) * 0.04, fl + 1.85 - k * 0.22, fl + 1.95 - k * 0.22, sq - 0.016, sq - 0.012);
    B(WD, su - 0.36, su + 0.36, fl + 0.52, fl + 0.56, sq - 0.03, sq);
    lat('bronze', [[0.001, 0], [0.09, 0.0], [0.07, 0.1], [0.05, 0.25], [0.08, 0.32], [0.001, 0.3]], 10, su + 0.3, fl + 0.18, q1 + td * 0.45);
    bag.add('bark_dark', rod(at(su + 0.3, fl + 0.45, q1 + td * 0.45), at(su + 0.05, fl + 0.95, q1 + td * 0.5), 0.012, 4));
    bag.add('cloth_green', lathe([[0.001, -0.08], [0.14, 0.0], [0.08, 0.1], [0.001, 0.12]], 7, null, ...at(su + 0.05, fl + 0.95, q1 + td * 0.5))); }
  // the staggered shelves (chigaidana) in the bay beside the alcove
  { const a = tu1 + 0.12, b = Math.min(a + 1.6, u1 - 0.1);
    B(PL, a, b, fl, top, q1 + td - 0.12, q1 + td - 0.06); B(PL, b, b + 0.06, fl, top, q1 - 0.06, q1 + td);
    B(WD, a, (a + b) / 2 + 0.1, fl + 1.1, fl + 1.14, q1, q1 + td - 0.12); B(WD, (a + b) / 2 - 0.1, b, fl + 1.35, fl + 1.39, q1, q1 + td - 0.12);
    B(WD, a, b, fl + 0.05, fl + 0.5, q1, q1 + td - 0.12); B('lacquer_black', a + 0.1, a + 0.5, fl + 1.39, fl + 1.55, q1 + 0.1, q1 + 0.4);
    B(WD, a, b, top - 0.75, top - 0.5, q1, q1 + td - 0.12); }
  // the side walls plastered over a dark skirting
  for (const [a, b] of [[u0, u0 + 0.06], [u1 - 0.06, u1]]) { B(PL, a, b, fl, top, q0 + 0.12, q1); C(a, b, q0 + 0.12, q1, fl, top); }
  // the armour on its chest (yoroi-bitsu) in the corner: the cuirass laced in red, the skirt of plates, the helmet and its crest
  { const au = u0 + 0.7, aq = q1 - 0.6, P = (u, v, q) => at(u, v, q);
    B('lacquer_black', au - 0.35, au + 0.35, fl + 0.05, fl + 0.55, aq - 0.25, aq + 0.25);
    bag.add('lacquer_black', lathe([[0.18, 0], [0.2, 0.1], [0.22, 0.32], [0.2, 0.45], [0.12, 0.52], [0.001, 0.52]], 10, null, ...P(au, fl + 0.85, aq)).scale(1, 1, 1));
    for (let k = 0; k < 4; k++) bag.add('cloth_red', lathe([[0.215, 0], [0.225, 0.015], [0.215, 0.03], [0.001, 0.03]], 10, null, ...P(au, fl + 0.92 + k * 0.1, aq)));
    for (let k = 0; k < 5; k++) { const a = (k - 2) * 0.55; const p = P(au + Math.sin(a) * 0.2, fl + 0.58, aq + Math.cos(a) * 0.2 * (o.facing ?? 1)); bag.add('lacquer_black', box(p[0] - 0.08, p[1], p[2] - 0.08, p[0] + 0.08, p[1] + 0.3, p[2] + 0.08)); }
    bag.add('iron', lathe([[0.001, 0], [0.15, 0.0], [0.17, 0.06], [0.14, 0.17], [0.07, 0.22], [0.001, 0.23]], 12, null, ...P(au, fl + 1.38, aq)));
    bag.add('lacquer_black', lathe([[0.22, 0], [0.25, 0.03], [0.17, 0.06], [0.001, 0.06]], 12, null, ...P(au, fl + 1.36, aq)));
    bag.add('gold', box(...(() => { const p = P(au, fl + 1.6, aq); return [p[0] - 0.12, p[1], p[2] - 0.01, p[0] + 0.12, p[1] + 0.18, p[2] + 0.01]; })()));
    C(au - 0.35, au + 0.35, aq - 0.3, aq + 0.3, fl, fl + 1.8); }
  // the sword rack (katana-kake) on the mats by the alcove: the long and the short sword laid on it
  { const ku = tu0 - 0.6, kq = q1 - 0.45;
    for (const du of [-0.28, 0.28]) B('lacquer_black', ku + du - 0.03, ku + du + 0.03, fl + 0.05, fl + 0.5, kq - 0.08, kq + 0.08);
    B('lacquer_black', ku - 0.34, ku + 0.34, fl + 0.05, fl + 0.08, kq - 0.1, kq + 0.1);
    for (const [v, L] of [[fl + 0.44, 1.0], [fl + 0.3, 0.7]]) { bag.add('lacquer_black', rod(at(ku - L / 2, v, kq), at(ku + L / 2 - 0.25, v + 0.03, kq), 0.018, 6)); bag.add('cloth_white', rod(at(ku + L / 2 - 0.25, v + 0.03, kq), at(ku + L / 2, v + 0.04, kq), 0.016, 6)); bag.add('gilt_bronze', lathe([[0.001, -0.005], [0.04, -0.005], [0.04, 0.005], [0.001, 0.005]], 10).rotateZ(Math.PI / 2).translate(...at(ku + L / 2 - 0.25, v + 0.03, kq))); }
    C(ku - 0.6, ku + 0.6, kq - 0.12, kq + 0.12, fl, fl + 0.5); }
  // the standing paper lamp (andon), a cushion and an armrest, a tobacco tray
  { const lu = u1 - 0.7, lq = q0 + 1.2;
    B(WD, lu - 0.16, lu + 0.16, fl + 0.05, fl + 0.08, lq - 0.16, lq + 0.16);
    for (const [a, c] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) B(WD, lu + a * 0.14 - 0.015, lu + a * 0.14 + 0.015, fl + 0.08, fl + 0.85, lq + c * 0.14 - 0.015, lq + c * 0.14 + 0.015);
    B('lamp_white', lu - 0.13, lu + 0.13, fl + 0.35, fl + 0.82, lq - 0.13, lq + 0.13);
    C(lu - 0.17, lu + 0.17, lq - 0.17, lq + 0.17, fl, fl + 0.85);
    const cu = (u0 + u1) / 2 + 0.3, cq = q1 - 1.6;
    B('cloth_maroon', cu - 0.28, cu + 0.28, fl + 0.05, fl + 0.12, cq - 0.28, cq + 0.28);
    B(WD, cu + 0.45, cu + 0.55, fl + 0.05, fl + 0.32, cq - 0.25, cq + 0.25);
    B('lacquer_black', cu - 0.75, cu - 0.45, fl + 0.05, fl + 0.18, cq - 0.12, cq + 0.12); }
  void rand;
}

/**
 * kago: a palanquin of the road (docs §5.2) { at, y, rot (its pole along z turned by rot), h (the bearers' shoulder) }:
 * a basket seat about 0.9 m long hung from bamboo uprights under one great pole carried on the shoulders, a light
 * roof over it, a reed blind rolled up on its side. Its bearers are figures placed by the town.
 */
export function kago(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, a = el.rot ?? 0, ph = el.h ?? 1.44, L = 3.6;
  const put = (m, g) => { g.rotateY(a); g.translate(x, y, z); bag.add(m, g); };
  { const g = lathe([[0.06, -L / 2], [0.07, -L / 2 + 0.3], [0.075, 0], [0.07, L / 2 - 0.3], [0.06, L / 2], [0.001, L / 2]], 8); g.rotateX(Math.PI / 2); g.translate(0.15, ph + 0.05, 0); put('lacquer_black', g); }
  const ys = 0.42, yr = ph - 0.12;
  put('wicker', box(-0.32, ys, -0.45, 0.62, ys + 0.12, 0.45));                                    // the seat
  put('wicker', box(-0.32, ys, 0.38, 0.62, ys + 0.62, 0.45));                                     // its back
  for (const sx of [-0.32, 0.62]) put('wicker', box(sx - 0.03, ys, -0.45, sx + 0.03, ys + 0.32, 0.45));
  for (const [sx, sz] of [[-0.3, -0.42], [0.6, -0.42], [-0.3, 0.42], [0.6, 0.42]]) { const g = lathe([[0.022, 0], [0.022, yr - ys], [0.001, yr - ys]], 6); g.translate(sx, ys, sz); put('bamboo_culm', g); }
  for (const sz of [-0.42, 0.42]) put('bamboo_culm', box(0.13, yr, sz - 0.03, 0.17, ph + 0.05, sz + 0.03));
  put('reed_mat', box(-0.42, yr, -0.6, 0.72, yr + 0.04, 0.6));                                  // the roof
  put('reed_mat', box(-0.36, yr - 0.22, -0.46, -0.32, yr, 0.46));                                 // the blind rolled up
  col.rect((() => { const c = Math.abs(Math.cos(a)), s = Math.abs(Math.sin(a)), hx = 0.6 * c + 0.6 * s, hz = 0.6 * s + 0.6 * c; return [x - hx, z - hz, x + hx, z + hz]; })(), y, y + ph);
}
/**
 * daisho: the long and the short sword thrust through a samurai's sash at his left hip (docs §5.2) { at, y, rot, h (the
 * figure's height) } — black scabbards, the hilts bound in white, forward and a little up, the scabbards slanting back.
 */
export function daisho(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0, a = el.rot ?? 0, k = (el.h ?? 1.65) / 1.65;
  const put = (m, g) => { g.scale(k, k, k); g.rotateY(a); g.translate(x, y, z); bag.add(m, g); };
  for (const [xx, yy, len, hilt] of [[-0.255, 0.98, 0.78, 0.26], [-0.215, 1.0, 0.5, 0.18]]) {
    const dir = [0, -0.36, 0.93], P = (t) => [xx, yy + dir[1] * t, -0.02 + dir[2] * t];
    put('lacquer_black', rod(P(-0.02), P(len), 0.016, 6));
    put('cloth_white', rod(P(-0.04), P(-0.04 - hilt), 0.015, 6));
    const g = lathe([[0.001, -0.004], [0.035, -0.004], [0.035, 0.004], [0.001, 0.004]], 10); g.rotateX(Math.PI / 2 + Math.atan2(-dir[1], dir[2])); g.translate(...P(-0.03)); put('gilt_bronze', g);
  }
}
