// Inside a Muscovite izba about 1600 (docs/settlements/muscovy.md §5.1): one room open to the roof, for there were
// no ceilings yet and the smoke of the chimneyless stove gathered under the roof and blackened the logs above a
// line round the walls; the great clay stove in a back corner, its mouth to the front; the "beautiful" (krasny)
// corner diagonally across from it, with the icons on their shelf, the lamp and the table beneath; benches fixed
// along the walls, the sleeping platform (polati) over the back of the room, shelves at the soot line.

import { box, lathe, rod, fromTriangles } from '../../core/geom.js';

/**
 * o = { B (a box in the front's frame: u along the face, v up, w out from the face), at (u, v, w) → [x, y, z],
 * u0, u1, D (the depth), fl (the floor), y, top (the walls' top), yr (the ridge's underside), door: [wa, wb] (its
 * span in w, on the u0 side), dh, wins (the front windows' u), wy, col: collision box in the frame }.
 */
export function izbaInside(bag, o) {
  const { B, at, u0, u1, D, fl, top, yr, door, dh, wins, wy, C } = o;
  const T = 0.28, A = (m, a0, a1, v0, v1, w0, w1) => bag.add(m, B(Math.min(a0, a1), Math.max(a0, a1), Math.min(v0, v1), Math.max(v0, v1), Math.min(w0, w1), Math.max(w0, w1)));
  const iu0 = u0 + T, iu1 = u1 - T, iwF = -T, iwB = -D + T, soot = fl + 1.05, lin = 0.015;
  const lat = (m, prof, seg, u, v, w) => { const p = at(u, v, w); bag.add(m, lathe(prof, seg, null, p[0], p[1], p[2])); };
  // ---- the walls' inner faces: the clean logs below the soot line, blackened above it; the course lines
  const face = (m, v0, v1) => {
    A(m, iu0, iu0 + lin, v0, v1, iwB, iwF); A(m, iu1 - lin, iu1, v0, v1, iwB, iwF);
    A(m, iu0 + lin, iu1 - lin, v0, v1, iwF - lin, iwF); A(m, iu0 + lin, iu1 - lin, v0, v1, iwB, iwB + lin);
  };
  face('log_pine', fl, soot); face('tar_wood', soot, top);
  for (let v = fl + 0.27; v < top - 0.05; v += 0.27) {                         // the seams between the courses, as dark lines
    const m = v < soot ? 'wood_dark' : 'cloth_black', h = 0.012;
    A(m, iu0 + lin, iu0 + lin + 0.004, v - h, v + h, iwB + lin, iwF - lin); A(m, iu1 - lin - 0.004, iu1 - lin, v - h, v + h, iwB + lin, iwF - lin);
    A(m, iu0 + lin + 0.004, iu1 - lin - 0.004, v - h, v + h, iwF - lin - 0.004, iwF - lin); A(m, iu0 + lin + 0.004, iu1 - lin - 0.004, v - h, v + h, iwB + lin, iwB + lin + 0.004);
  }
  // the gable ends inside, sooted, up to the ridge; the roof's underside, black with smoke
  const um = (u0 + u1) / 2, Tg = [];
  const tri = (w) => { const a = at(iu0, top, w), b = at(iu1, top, w), c = at(um, yr - 0.05, w); Tg.push(...a, ...b, ...c, ...a, ...c, ...b); };
  tri(iwF - lin - 0.002); tri(iwB + lin + 0.002);
  bag.add('tar_wood', fromTriangles(Tg));
  { const Tr = [], q = (p1, p2, p3, p4) => Tr.push(...p1, ...p2, ...p3, ...p1, ...p3, ...p4, ...p1, ...p3, ...p2, ...p1, ...p4, ...p3);
    for (const [ue] of [[iu0 - 0.02], [iu1 + 0.02]]) q(at(ue, top - 0.01, iwF), at(ue, top - 0.01, iwB), at(um, yr - 0.03, iwB), at(um, yr - 0.03, iwF));
    bag.add('tar_wood', fromTriangles(Tr)); }
  // the windows from inside: little openings in the front, their mica panes dim
  for (const c of wins) A('glass_lamp', c - 0.26, c + 0.26, wy + 0.06, wy + 0.64, iwF - lin - 0.01, iwF - lin);
  // the floor of broad boards
  for (let u = iu0 + lin, k = 0; u < iu1 - lin - 0.05; k++) { const u2 = Math.min(iu1 - lin, u + 0.3 + (k % 3) * 0.03); A('planks_grey', u, u2 - 0.008, fl - 0.04, fl, iwB + lin, iwF - lin); u = u2; }

  // ---- the stove in the back corner on the u1 side, its mouth to the front: clay over a timber frame on a log base
  const sw = Math.min(1.75, (iu1 - iu0) * 0.38), sd = 1.9, s0 = iu1 - lin - sw, sb = iwB + lin, sf = sb + sd, sv = fl + 1.55;
  A('timber', s0 - 0.04, iu1 - lin, fl, fl + 0.5, sb, sf + 0.04);                                                   // the log frame it stands on
  A('mud_plaster', s0, iu1 - lin, fl + 0.5, sv, sb, sf);
  A('mud_plaster', s0 + 0.12, iu1 - lin, sv, sv + 0.15, sb, sf - 0.15);                                             // its rounded top, for sleeping on
  A('mud_plaster', s0 - 0.02, iu1 - lin, fl + 0.85, fl + 0.92, sf, sf + 0.42);                                      // the hearth ledge (shestok) before the mouth
  const mu = s0 + sw / 2;
  A('opening', mu - 0.3, mu + 0.3, fl + 0.92, fl + 1.3, sf - 0.002, sf + 0.001);                                    // the mouth
  A('cloth_black', mu - 0.42, mu + 0.42, fl + 1.3, sv + 0.15, sf + 0.001, sf + 0.004);                              // the soot over it
  A('cloth_black', s0 - 0.004, s0, fl + 0.92, sv, sf - 0.6, sf);
  for (const [k, du] of [-0.3, 0.05, 0.32].entries()) lat('pottery_dark', [[0.001, 0], [0.08, 0.01], [0.13, 0.1], [0.11, 0.2], [0.09, 0.23], [0.001, 0.23]], 10, mu + du, fl + 0.92, sf + 0.2 - (k & 1) * 0.06);
  { const p = at(s0 - 0.2, fl, sf + 0.3), q = at(s0 - 0.05, fl + 1.7, sf + 0.05); bag.add('timber', rod(p, q, 0.02, 5)); bag.add('iron', rod(q, at(s0 - 0.03, fl + 1.85, sf + 0.02), 0.03, 5)); }   // the oven fork (ukhvat)
  C(s0 - 0.04, iu1, sb, sf + 0.42, fl, sv + 0.15);
  // the sleeping platform (polati) over the back of the room, from the stove across to the other wall, on its beam
  const pv = sv + 0.38, pf = sf - 0.25;
  A('planks_grey', iu0 + lin, s0, pv, pv + 0.05, sb, pf); A('timber', iu0 + lin, s0, pv - 0.14, pv, pf - 0.12, pf);
  { const pu = iu0 + lin + 0.35; A('timber', pu - 0.07, pu + 0.07, fl, pv - 0.14, pf - 0.12, pf + 0.02); C(pu - 0.07, pu + 0.07, pf - 0.12, pf + 0.02, fl, pv); }
  for (const [k, uu] of [iu0 + 0.5, iu0 + 1.4].entries()) A(k ? 'cloth_red' : 'sacking', uu, uu + 0.8, pv + 0.05, pv + 0.14, sb + 0.15, pf - 0.2);          // bedding rolled out on it
  C(iu0, s0, sb, pf, pv - 0.14, pv + 0.05);
  // ---- the benches fixed along the front wall and along the u0 side from the front to the door
  const bv = fl + 0.45, bd = 0.42;
  const bench = (a0, a1, w0, w1) => { A('timber', a0, a1, bv - 0.06, bv, w0, w1); C(Math.min(a0, a1), Math.max(a0, a1), Math.min(w0, w1), Math.max(w0, w1), fl, bv); };
  bench(iu0 + lin, iu1 - lin, iwF - lin - bd, iwF - lin);
  bench(iu0 + lin, iu0 + lin + bd, Math.max(door[1], sf) + 0.1, iwF - lin - bd);
  for (let u = iu0 + 0.6; u < iu1 - 0.3; u += 1.4) A('timber', u - 0.05, u + 0.05, fl, bv - 0.06, iwF - lin - bd + 0.05, iwF - lin - bd + 0.15);
  // the voronets: the shelf along the side walls at the soot line, pots and bowls on it
  for (const [a0, a1] of [[iu0 + lin, iu0 + lin + 0.3]]) A('timber', a0, a1, soot + 0.6, soot + 0.65, door[1] + 0.2, iwF - lin - 0.2);
  for (let w = door[1] + 0.5; w < iwF - 0.5; w += 0.55) lat(((w * 10) | 0) & 1 ? 'pottery_dark' : 'wood_painted', [[0.001, 0], [0.07, 0.0], [0.1, 0.07], [0.08, 0.12], [0.001, 0.12]], 8, iu0 + lin + 0.15, soot + 0.65, w);
  // ---- the beautiful corner: the front corner on the u0 side — the icon shelf across the corner, two icons, the lamp, an embroidered towel
  const cu = iu0 + lin, cw = iwF - lin, ic = (a, w0, w1, v0, v1) => { A('timber', a, a + 0.035, v0 - 0.04, v1 + 0.04, w0 - 0.04, w1 + 0.04); A('mosaic_gold', a + 0.035, a + 0.045, v0, v1, w0, w1); A('paint_robe', a + 0.045, a + 0.05, v0 + 0.05, v1 - 0.12, (w0 + w1) / 2 - 0.06, (w0 + w1) / 2 + 0.06); };
  { const Tq = [], v = fl + 1.75, a = at(cu, v, cw), b = at(cu + 0.55, v, cw), c = at(cu, v, cw - 0.55);
    for (const dy of [0, 0.04]) { const [p, q, r] = [a, b, c].map((P) => [P[0], P[1] + dy, P[2]]); Tq.push(...p, ...q, ...r, ...p, ...r, ...q); }
    bag.add('timber', fromTriangles(Tq));
    ic(cu, cw - 0.5, cw - 0.12, v + 0.06, v + 0.42);
    A('timber', cu + 0.14, cu + 0.48, v + 0.06, v + 0.42, cw - 0.035, cw); A('mosaic_gold', cu + 0.16, cu + 0.46, v + 0.08, v + 0.4, cw - 0.045, cw - 0.035);
    A('paint_robe', cu + 0.26, cu + 0.36, v + 0.12, v + 0.28, cw - 0.05, cw - 0.045);
    A('linen', cu + 0.5, cu + 0.56, v - 0.55, v + 0.5, cw - 0.022, cw - 0.015); A('cloth_red', cu + 0.495, cu + 0.565, v - 0.5, v - 0.42, cw - 0.052, cw - 0.04);
    const lp = at(cu + 0.3, v + 0.75, cw - 0.3);
    bag.add('bronze', rod([lp[0], lp[1] + 0.25, lp[2]], lp, 0.004, 4));
    bag.add('glass_topaz', lathe([[0.001, -0.08], [0.04, -0.07], [0.05, -0.02], [0.045, 0], [0.001, 0]], 10, null, lp[0], lp[1], lp[2]));
    bag.add('flame', lathe([[0.001, 0], [0.012, 0.01], [0.001, 0.04]], 6, null, lp[0], lp[1], lp[2])); }
  // the table under the icons, along the front bench: a board on trestles, a cloth, a loaf and a wooden bowl
  { const tu0 = cu + bd + 0.2, tu1 = Math.min(tu0 + 1.5, iu1 - 0.6), tw1 = cw - bd - 0.05, tw0 = tw1 - 0.8, tv = fl + 0.75;
    for (const u of [tu0 + 0.15, tu1 - 0.15]) A('timber', u - 0.05, u + 0.05, fl, tv - 0.05, tw0 + 0.1, tw1 - 0.1);
    A('timber', tu0, tu1, tv - 0.05, tv, tw0, tw1); A('linen', tu0 + 0.1, tu1 - 0.1, tv, tv + 0.006, tw0 + 0.05, tw1 - 0.05);
    lat('wood_painted', [[0.001, 0], [0.08, 0.0], [0.13, 0.06], [0.12, 0.07], [0.001, 0.02]], 10, (tu0 + tu1) / 2 - 0.2, tv + 0.006, (tw0 + tw1) / 2);
    lat('bark_birch', [[0.001, 0], [0.12, 0.0], [0.13, 0.05], [0.08, 0.1], [0.001, 0.11]], 10, (tu0 + tu1) / 2 + 0.25, tv + 0.006, (tw0 + tw1) / 2 - 0.05);
    C(tu0, tu1, tw0, tw1, fl, tv); }
  // a water tub and its dipper by the door, a spinning distaff (pryalka) by the bench
  { const w = door[0] - 0.4; lat('timber', [[0.001, 0], [0.24, 0.0], [0.27, 0.45], [0.25, 0.46], [0.001, 0.4]], 12, iu0 + 0.4, fl, w); C(iu0 + 0.15, iu0 + 0.65, w - 0.25, w + 0.25, fl, fl + 0.46); }
  { const pu = iu0 + 0.9, pw = iwF - bd - 0.9; A('timber', pu - 0.12, pu + 0.12, fl, fl + 0.05, pw - 0.35, pw + 0.05); A('wood_painted', pu - 0.06, pu + 0.06, fl + 0.05, fl + 0.85, pw - 0.03, pw); A('wood_painted', pu - 0.12, pu + 0.12, fl + 0.85, fl + 1.05, pw - 0.03, pw); }
  // by the seed, what else the house kept on the free wall between the front bench and the stove (the u1 side): a chest, a loom, a cradle on its pole
  { const k = (o.seed ?? 0) % 4, wa = sf + 0.55, wz = iwF - bd - 0.25, ua = iu1 - lin;
    if (wz - wa > 1.0 && k === 0) {          // the painted chest (sunduk) with iron bands, a folded cloth on it
      A('wood_painted', ua - 0.55, ua, fl, fl + 0.6, wa, wa + 1.1); A('iron', ua - 0.56, ua + 0.001, fl + 0.18, fl + 0.22, wa, wa + 1.1); A('iron', ua - 0.56, ua + 0.001, fl + 0.42, fl + 0.46, wa, wa + 1.1); A('cloth_red', ua - 0.45, ua - 0.1, fl + 0.6, fl + 0.66, wa + 0.2, wa + 0.9); C(ua - 0.56, ua, wa, wa + 1.1, fl, fl + 0.66);
    } else if (wz - wa > 1.3 && k === 1) {   // the upright loom (stan): two posts, beams, the warp strung, a half-woven cloth, the weaver's bench
      A('timber', ua - 0.8, ua - 0.7, fl, fl + 1.5, wa + 0.1, wa + 0.18); A('timber', ua - 0.8, ua - 0.7, fl, fl + 1.5, wa + 1.0, wa + 1.08); A('timber', ua - 0.82, ua - 0.68, fl + 1.38, fl + 1.46, wa + 0.1, wa + 1.08); A('timber', ua - 0.82, ua - 0.68, fl + 0.3, fl + 0.38, wa + 0.1, wa + 1.08);
      A('linen', ua - 0.77, ua - 0.74, fl + 0.38, fl + 1.38, wa + 0.2, wa + 0.98); A('cloth_indigo', ua - 0.775, ua - 0.735, fl + 0.38, fl + 0.7, wa + 0.2, wa + 0.98); A('timber', ua - 0.5, ua - 0.1, fl + 0.4, fl + 0.46, wa + 0.2, wa + 0.9); C(ua - 0.85, ua, wa + 0.05, wa + 1.1, fl, fl + 1.5);
    } else if (wz - wa > 0.9 && k === 2) {   // the cradle (ochep): a wicker basket hung by cords from a springy pole run through the ceiling beam
      const cwm = wa + 0.55, h0 = fl + 0.55; A('timber', ua - 0.04, ua, fl + 0.05, top - 0.1, cwm - 0.04, cwm + 0.04);
      A('wicker', ua - 0.7, ua - 0.2, h0, h0 + 0.28, cwm - 0.35, cwm + 0.35); A('linen', ua - 0.65, ua - 0.25, h0 + 0.18, h0 + 0.3, cwm - 0.3, cwm + 0.3);
      for (const du of [-0.7, -0.2]) for (const dw of [-0.35, 0.35]) A('rope_fibre', ua + du - 0.006, ua + du + 0.006, h0 + 0.28, top - 0.4, cwm + dw - 0.006, cwm + dw + 0.006);
      A('timber', ua - 0.72, ua - 0.18, top - 0.42, top - 0.38, cwm - 0.37, cwm + 0.37);
    }
  }
  void dh; void box;
}
