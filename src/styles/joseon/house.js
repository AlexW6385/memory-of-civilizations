// A yangban house of 1880s Hanyang you can walk into (docs/settlements/joseon-seoul.md §13):
// the women's range (anchae) along the north of its walled lot — kitchen (bueok) with its stove below
// the floor, the head woman's room (anbang), the board-floored hall (daecheong), a side room — and the
// men's range (sarangchae) along the west, facing the yard — the sarangbang where guests are received,
// a raised open floor (maru), a second room. Rooms on stone bases with ondol floors of oiled paper,
// papered walls and ceilings, lattice doors with one leaf slid open, a veranda (toenmaru) before them
// under the eaves, a step stone along the front; furnished: bandaji and two-tier chests, folded
// bedding, a folding screen, low desk with the scholar's four friends, soban tables, sitting cushions,
// a brazier, a paper lantern; the crock terrace and the gate of the lot's wall.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { rectRoof, beamTris, latticeBay } from '../ming/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const H = 2.4, C = 2.9, V = 1.0, FL = 0.5;              // wall height over the floor, the rooms' depth, the veranda's depth, the floor's height over the yard

/** One range { org [x, z] (its back's left end), face ('s' | 'e'), L, kinds: [[kind, bays]...], seed }. */
function range(bag, col, o) {
  const { org: [ox, oz], face, L, kinds, seed } = o, rand = rng(seed), along = face === 's';
  const P = (a, b) => (along ? [ox + a, oz + b] : [ox + b, oz + a]);
  const R = (a0, b0, a1, b1) => { const p = P(a0, b0), q = P(a1, b1); return [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; };
  const B = (m, a0, b0, a1, b1, ya, yb, c = false) => { const r = R(a0, b0, a1, b1); bag.add(m, box(r[0], ya, r[1], r[2], yb, r[3])); if (c) col.rect(r, ya, yb); };
  const nb = kinds.reduce((s, k) => s + k[1], 0), bw = L / nb;
  const spans = []; let a = 0;
  for (const [kind, n] of kinds) { spans.push({ kind, a0: a, a1: a + n * bw }); a += n * bw; }
  const kit = spans.find((s) => s.kind === 'kitchen');
  const aS = kit ? kit.a1 : 0;                                         // the raised part starts after the kitchen
  // ── the stone base, the veranda, the step ──
  B('granite_korea', aS - 0.15, -0.3, L + 0.3, C + V + 0.3, -0.25, FL);
  col.floor(R(aS - 0.15, -0.3, L + 0.3, C + V + 0.3), FL);
  B('granite_korea', aS, C + V + 0.3, L, C + V + 0.9, -0.25, 0.25);
  col.floor(R(aS, C + V + 0.3, L, C + V + 0.9), 0.25);
  if (kit) { B('granite_korea', 0, -0.3, kit.a1, C + 0.1, -0.2, 0.02); col.floor(R(0, -0.3, kit.a1, C + 0.1), 0.02); }
  // veranda boards
  B('timber', aS, C, L, C + V, FL, FL + 0.03);
  // ── the back wall and the ends: white papered plaster over a damp-greyed foot ──
  for (const s of spans) {
    const y0 = s.kind === 'kitchen' ? 0 : FL, top = FL + H;
    B('plaster_white', s.a0, 0, s.a1, 0.22, y0, top, true);
    B('plaster_damp', s.a0, -0.012, s.a1, 0.0, y0, y0 + 0.45);
    B('timber', s.a0, -0.03, s.a1, 0.0, top - 0.3, top - 0.12);
    // ceiling (papered), a hair under the roof's soffit
    if (s.kind !== 'daecheong') B('paint_white', s.a0, 0.02, s.a1, C, top - 0.06, top - 0.03);
  }
  for (const [ae, sg] of [[0, 1], [L, -1]]) {
    const y0 = ae === 0 && kit ? 0 : FL;
    B('plaster_white', ae - 0.1, 0, ae + 0.1, C, y0, FL + H, true);
    B('plaster_damp', ae - 0.11, 0, ae + 0.11, 0.0, y0, y0 + 0.45);
    void sg;
  }
  // ── the partitions between the rooms, a doorway through those that lead on ──
  for (let i = 1; i < spans.length; i++) {
    const A0 = spans[i - 1], A1 = spans[i], x = A1.a0, lead = A0.kind !== 'kitchen' && A1.kind !== 'kitchen';
    const y0 = A0.kind === 'kitchen' ? 0 : FL;
    if (!lead) { B('plaster_white', x - 0.1, 0, x + 0.1, C, y0, FL + H, true); continue; }
    B('plaster_white', x - 0.1, 0, x + 0.1, C - 1.5, FL, FL + H, true);
    B('plaster_white', x - 0.1, C - 0.55, x + 0.1, C, FL, FL + H, true);
    B('plaster_white', x - 0.1, C - 1.5, x + 0.1, C - 0.55, FL + 1.78, FL + H);
    for (const bb of [C - 1.5, C - 0.55]) B('timber', x - 0.12, bb - 0.03, x + 0.12, bb + 0.03, FL, FL + 1.78);
    B('timber', x - 0.12, C - 1.55, x + 0.12, C - 0.5, FL + 1.74, FL + 1.8);
  }
  // ── the front: posts on the veranda's edge, the lattice doors on the room line ──
  for (let k = 0; k <= nb; k++) {
    const ak = k * bw, kk = spans.find((s) => ak >= s.a0 - 1e-6 && ak <= s.a1 + 1e-6 && s.kind === 'kitchen' && ak > 0);
    const yb = kit && ak <= kit.a1 + 1e-6 ? 0 : FL;
    B('timber', ak - 0.1, C + V - 0.22, ak + 0.1, C + V - 0.02, yb, FL + H, true);
    if (!kk || true) B('timber', ak - 0.09, C - 0.09, ak + 0.09, C + 0.09, yb, FL + H);
  }
  B('timber', 0, C + V - 0.24, L, C + V, FL + H - 0.3, FL + H - 0.02);          // the head beam on the posts
  B('timber', 0, C - 0.08, L, C + 0.08, FL + H - 0.34, FL + H - 0.1);
  for (const s of spans) {
    const n = Math.round((s.a1 - s.a0) / bw);
    for (let j = 0; j < n; j++) {
      const ta = s.a0 + j * bw + 0.1, tb = s.a0 + (j + 1) * bw - 0.1;
      if (s.kind === 'kitchen') {
        // the kitchen is open to the yard, its floor the earth's: a stove against the room wall (below), a plank door hooked back
        continue;
      }
      if (s.kind === 'daecheong') {
        // open to the veranda: only the dark of the hall behind (the back wall's doors are shown on the room line)
        if (j === 0 || j === n - 1) continue;
        continue;
      }
      const pa = P(ta, C), pb = P(tb, C);
      if (j === 0 && n >= 1) {
        // one leaf closed, the other slid aside: a doorway 1.05 m wide through the middle
        const tm = (ta + tb) / 2 - 0.1, tg = (ta + tb) / 2 + 0.55;
        latticeBay(bag, null, pa, P(tm, C), FL + 0.05, H - 0.4, 'door', 0.04);
        col.rect(R(ta, C - 0.05, tm, C + 0.05), FL, FL + H);
        latticeBay(bag, null, P(tg, C), pb, FL + 0.05, H - 0.4, 'door', 0.04);
        col.rect(R(tg, C - 0.05, tb, C + 0.05), FL, FL + H);
        B('timber', tm, C - 0.07, tg, C + 0.07, FL + H - 0.42, FL + H - 0.3);      // the lintel over the doorway
      } else {
        latticeBay(bag, null, pa, pb, FL + 0.05, H - 0.4, rand() < 0.5 ? 'window' : 'door', 0.04);
        col.rect(R(ta, C - 0.05, tb, C + 0.05), FL, FL + H);
      }
    }
  }
  // the daecheong's back wall: plank doors to the veranda-less back, plain plaster here; its floor of boards
  for (const s of spans) if (s.kind === 'daecheong') B('wood_dark', s.a0 + 0.05, 0.22, s.a1 - 0.05, C, FL, FL + 0.03);
  // ── the roof ──
  const r = R(-0.0, -0.0, L, C + V), thatch = !!o.thatch;
  const w = r[2] - r[0] + 1.8, d = r[3] - r[1] + 1.8;
  rectRoof({ c: [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2], A: (along ? w : d) / 2, B: (along ? d : w) / 2, y: FL + H - 0.05, rise: Math.min(w, d) * 0.42, kind: 'xieshan', sweep: 0.6, p: 1.5, alongZ: !along, mat: thatch ? 'thatch' : 'tile_grey', soffit: 'timber', curl: false }, bag);
  // ── what is in the rooms ──
  const ctx = { bag, col, P, R, B, rand };
  for (const s of spans) {
    if (s.kind === 'kitchen') kitchen(ctx, s);
    else if (s.kind === 'anbang') anbang(ctx, s);
    else if (s.kind === 'sarangbang') sarangbang(ctx, s);
    else if (s.kind === 'daecheong') hall(ctx, s);
    else if (s.kind === 'room') sideRoom(ctx, s);
  }
  return { P, R, spans };
}

// ── the furniture ────────────────────────────────────────────────────────────
/** A bandaji (front-opening chest): a dark chest with its brass lock plate and straps, on a low base. */
function bandaji(ctx, a, b, w = 0.9, dpt = 0.42, h = 0.78, y = FL) {
  const { B } = ctx;
  B('wood_dark', a - w / 2, b, a + w / 2, b + dpt, y, y + 0.06);
  B('timber', a - w / 2, b, a + w / 2, b + dpt, y + 0.06, y + h, true);
  B('wood_dark', a - w / 2 - 0.02, b - 0.02, a + w / 2 + 0.02, b + dpt + 0.02, y + h, y + h + 0.04);
  B('gilt_bronze', a - 0.07, b - 0.02, a + 0.07, b + 0.0, y + h * 0.5, y + h * 0.5 + 0.14);        // the lock plate (front is at lower b; face toward −b? see callers)
  for (const dx of [-w / 2 + 0.12, w / 2 - 0.12]) B('gilt_bronze', a + dx - 0.02, b - 0.015, a + dx + 0.02, b + 0.0, y + h * 0.35, y + h - 0.1);
}
/** A two-tier chest (ichungjang): two stacked boxes, a lacquered black with inlaid mother-of-pearl bands. */
function twoTier(ctx, a, b, w = 0.95, dpt = 0.46) {
  const { B } = ctx;
  B('wood_dark', a - w / 2, b, a + w / 2, b + dpt, FL, FL + 0.1);
  B('lacquer_black', a - w / 2, b, a + w / 2, b + dpt, FL + 0.1, FL + 0.72, true);
  B('lacquer_black', a - w / 2 + 0.03, b + 0.02, a + w / 2 - 0.03, b + dpt - 0.02, FL + 0.74, FL + 1.28, true);
  B('shell_inlay', a - w / 2 + 0.05, b - 0.012, a + w / 2 - 0.05, b, FL + 0.18, FL + 0.24);
  B('shell_inlay', a - w / 2 + 0.05, b - 0.012, a + w / 2 - 0.05, b, FL + 0.56, FL + 0.62);
  B('shell_inlay', a - w / 2 + 0.08, b - 0.012, a + w / 2 - 0.08, b, FL + 0.84, FL + 0.88);
  B('shell_inlay', a - w / 2 + 0.08, b - 0.012, a + w / 2 - 0.08, b, FL + 1.18, FL + 1.22);
  for (const dx of [-0.18, 0.18]) B('gilt_bronze', a + dx - 0.04, b - 0.02, a + dx + 0.04, b, FL + 0.38, FL + 0.46);
}
/** Folded bedding (iburi) on a chest or the floor: quilts of red, blue and ochre silk, a pillow. */
function bedding(ctx, a, b, y, w = 0.9, dpt = 0.45) {
  const { B } = ctx;
  B('cloth_red', a - w / 2, b, a + w / 2, b + dpt, y, y + 0.16);
  B('cloth_blue', a - w / 2 + 0.02, b + 0.02, a + w / 2 - 0.02, b + dpt - 0.02, y + 0.16, y + 0.3);
  B('cloth_ochre', a - w / 2 + 0.04, b + 0.04, a + w / 2 - 0.04, b + dpt - 0.04, y + 0.3, y + 0.4);
}
/** A folding screen (byeongpung) of 6 panels along the wall (a0..a1 at depth b), painted: blue hills over a warm ground. */
function screen(ctx, a0, a1, b, hgt = 1.55, y = FL) {
  const { bag, P } = ctx, n = 6, pw = (a1 - a0) / n;
  for (let k = 0; k < n; k++) {
    const p0 = P(a0 + k * pw, b + (k % 2 ? 0.14 : 0)), p1 = P(a0 + (k + 1) * pw, b + (k % 2 ? 0 : 0.14));
    const t = [], f = [], g = [];
    beamTris(t, [p0[0], y + 0.05, p0[1]], [p1[0], y + 0.05, p1[1]], 0.02, hgt);
    bag.add('timber', fromTriangles(t));
    const q0 = [p0[0], p0[1]], q1 = [p1[0], p1[1]];
    beamTris(f, [q0[0], y + 0.12, q0[1]], [q1[0], y + 0.12, q1[1]], 0.026, hgt * 0.44);
    beamTris(g, [q0[0], y + 0.12 + hgt * 0.44, q0[1]], [q1[0], y + 0.12 + hgt * 0.44, q1[1]], 0.026, hgt * 0.8 - hgt * 0.44);
    bag.add('paint_blue', fromTriangles(f)); bag.add('paint_ochre', fromTriangles(g));
  }
}
/** A low desk (seoan) with the scholar's four friends — inkstone, brush stand with brushes, a sheet of paper, a water dropper — and a book pile. */
function desk(ctx, a, b, w = 0.9, dpt = 0.46) {
  const { B, bag, P } = ctx;
  B('timber', a - w / 2, b, a + w / 2, b + dpt, FL + 0.28, FL + 0.32);
  for (const [dx, dz] of [[-1, 0.1], [1, 0.1], [-1, dpt - 0.1], [1, dpt - 0.1]]) B('timber', a + dx * (w / 2 - 0.06) - 0.03, b + dz - 0.03, a + dx * (w / 2 - 0.06) + 0.03, b + dz + 0.03, FL, FL + 0.28);
  B('paint_white', a - 0.2, b + 0.1, a + 0.12, b + 0.34, FL + 0.32, FL + 0.325);
  B('lacquer_black', a + 0.2, b + 0.08, a + 0.34, b + 0.2, FL + 0.32, FL + 0.36);             // inkstone
  const [bx, bz] = P(a + 0.3, b + 0.34);
  bag.add('bamboo_culm', lathe([[0.001, 0], [0.04, 0], [0.04, 0.12], [0.001, 0.12]], 8, null, bx, FL + 0.32, bz));
  for (const dx of [-0.015, 0.012, 0.03]) bag.add('wood_dark', lathe([[0.004, 0], [0.004, 0.2], [0.001, 0.22]], 4, null, bx + dx, FL + 0.44, bz));
  B('paint_white', a - 0.38, b + 0.06, a - 0.22, b + 0.24, FL + 0.32, FL + 0.46);
  B('cloth_indigo', a - 0.38, b + 0.06, a - 0.22, b + 0.24, FL + 0.46, FL + 0.48);
}
/** A cushion (bangseok) of silk on a woven mat. */
function cushion(ctx, a, b, w = 0.78, mat = true) {
  const { B } = ctx;
  if (mat) B('reed_mat', a - w * 0.8, b - w * 0.8, a + w * 0.8, b + w * 0.8, FL + 0.02, FL + 0.035);
  B('cloth_red', a - w / 2, b - w / 2, a + w / 2, b + w / 2, FL + 0.035, FL + 0.1);
  B('cloth_ochre', a - w / 2 + 0.02, b - w / 2 + 0.02, a + w / 2 - 0.02, b + w / 2 - 0.02, FL + 0.1, FL + 0.11);
}
/** A small dining table (soban) with bowls and a lidded dish. */
function soban(ctx, a, b, w = 0.5, dpt = 0.4) {
  const { B, bag, P } = ctx;
  B('lacquer_red', a - w / 2, b, a + w / 2, b + dpt, FL + 0.27, FL + 0.3);
  for (const dx of [-1, 1]) for (const dz of [0.06, dpt - 0.06]) B('lacquer_red', a + dx * (w / 2 - 0.05) - 0.025, b + dz - 0.025, a + dx * (w / 2 - 0.05) + 0.025, b + dz + 0.025, FL, FL + 0.27);
  for (const [dx, dz] of [[-0.12, 0.1], [0.0, 0.12], [0.12, 0.1], [-0.08, 0.28], [0.08, 0.28]]) {
    const [x, z] = P(a + dx, b + dz);
    bag.add(dx < 0 ? 'glaze_white' : 'pottery_dark', lathe([[0.001, 0], [0.03, 0], [0.065, 0.045], [0.07, 0.07], [0.06, 0.07], [0.001, 0.015]], 10, null, x, FL + 0.3, z));
  }
}
/** The brazier (hwaro): a bronze bowl on three feet with white ash, a pair of tongs. */
function brazier(ctx, a, b) {
  const { bag, P } = ctx, [x, z] = P(a, b);
  bag.add('bronze', lathe([[0.001, 0.08], [0.14, 0.08], [0.2, 0.2], [0.21, 0.26], [0.18, 0.26], [0.17, 0.2], [0.001, 0.16]], 14, null, x, FL, z));
  bag.add('plaster_white', lathe([[0.001, 0.2], [0.17, 0.2], [0.001, 0.205]], 12, null, x, FL, z));
  for (let k = 0; k < 3; k++) { const th = k * 2.094 + 0.3; bag.add('bronze', lathe([[0.001, 0], [0.03, 0], [0.025, 0.09], [0.001, 0.09]], 6, null, x + Math.cos(th) * 0.13, FL, z + Math.sin(th) * 0.13)); }
}
/** A paper lantern on a stand (chorongdae): a wooden pole on a cross foot, a glowing paper box on top. */
function lantern(ctx, a, b) {
  const { bag, B, P } = ctx, [x, z] = P(a, b);
  B('timber', a - 0.2, b - 0.03, a + 0.2, b + 0.03, FL, FL + 0.05); B('timber', a - 0.03, b - 0.2, a + 0.03, b + 0.2, FL, FL + 0.05);
  bag.add('timber', lathe([[0.001, 0], [0.018, 0], [0.018, 1.1], [0.001, 1.1]], 6, null, x, FL + 0.05, z));
  B('lamp_paper', a - 0.1, b - 0.1, a + 0.1, b + 0.1, FL + 1.15, FL + 1.4);
  B('timber', a - 0.115, b - 0.115, a + 0.115, b + 0.115, FL + 1.4, FL + 1.43); B('timber', a - 0.115, b - 0.115, a + 0.115, b + 0.115, FL + 1.12, FL + 1.15);
}
/** A book chest (chaekjang) with volumes in its open compartments: indigo-bound books in stacks. */
function bookcase(ctx, a, b, w = 1.0, dpt = 0.34, rows = 3) {
  const { B, rand } = ctx, hh = 0.42;
  B('timber', a - w / 2, b, a + w / 2, b + dpt, FL, FL + 0.05);
  for (let r = 0; r < rows; r++) {
    const y = FL + 0.05 + r * hh;
    B('timber', a - w / 2, b, a - w / 2 + 0.03, b + dpt, y, y + hh); B('timber', a + w / 2 - 0.03, b, a + w / 2, b + dpt, y, y + hh);
    B('timber', a - w / 2, b, a + w / 2, b + dpt, y + hh - 0.03, y + hh);
    let x = a - w / 2 + 0.05;
    while (x < a + w / 2 - 0.2) { const n = 2 + Math.floor(rand() * 3), th = 0.035; B(rand() < 0.7 ? 'cloth_indigo' : 'paint_white', x, b + 0.05, x + 0.2, b + dpt - 0.05, y + 0.0, y + n * th); x += 0.24 + rand() * 0.06; }
  }
  B('timber', a - w / 2, b, a + w / 2, b + dpt, FL + 0.05 + rows * hh, FL + 0.08 + rows * hh);
}

// ── the rooms ────────────────────────────────────────────────────────────────
function kitchen({ bag, col, P, R, B }, s) {
  // the stove (agungi) against the wall of the anbang, its fire mouth toward the room's yard side; two iron pots set in clay, a wooden lid
  const a = s.a1 - 0.8, b = 0.6;
  B('mud_plaster', a - 0.7, b - 0.1, s.a1 - 0.1, b + 1.1, 0, 0.62, true);
  for (const dx of [-0.35, 0.2]) { const [x, z] = P(a + dx + 0.05, b + 0.45); bag.add('iron', lathe([[0.001, 0.0], [0.17, 0.0], [0.27, 0.12], [0.28, 0.2], [0.24, 0.2], [0.001, 0.02]], 12, null, x, 0.62, z)); bag.add('wood_dark', lathe([[0.001, 0.22], [0.26, 0.2], [0.27, 0.185], [0.001, 0.185]], 12, null, x, 0.62, z)); }
  B('mud_plaster', a - 0.5, b + 1.1, a + 0.5, b + 1.18, 0, 0.5);            // the firing mouth's low arch (dark opening)
  B('opening', a - 0.3, b + 1.1, a + 0.3, b + 1.16, 0.08, 0.42);
  // water jar and firewood
  const [jx, jz] = P(s.a0 + 0.6, 0.8);
  bag.add('pottery_dark', lathe([[0.2, 0], [0.34, 0.2], [0.38, 0.42], [0.3, 0.7], [0.24, 0.78], [0.001, 0.78]], 12, null, jx, 0, jz)); col.circle(jx, jz, 0.34, 0, 0.8);
  for (let k = 0; k < 6; k++) B('timber', s.a0 + 0.1 + (k % 3) * 0.12, 1.9 + (k > 2 ? 0 : 0), s.a0 + 0.22 + (k % 3) * 0.12, 2.7, k > 2 ? 0.12 : 0, k > 2 ? 0.24 : 0.12);
  void R;
}
function anbang(ctx, s) {
  const { B, rand } = ctx, w = s.a1 - s.a0, c = (s.a0 + s.a1) / 2;
  B('wood_ochre', s.a0 + 0.1, 0.22, s.a1 - 0.1, C, FL, FL + 0.02, true);                    // the oiled-paper floor (yellow), the walkable floor stands under it
  ctx.col.floor(ctx.R(s.a0 + 0.1, 0.22, s.a1 - 0.1, C), FL + 0.02);
  // along the back wall: the two-tier chest, a bandaji with bedding folded on it
  twoTier(ctx, s.a0 + 0.75, 0.22);
  bandaji(ctx, s.a0 + 1.9, 0.26, 0.9, 0.42, 0.78); bedding(ctx, s.a0 + 1.9, 0.28, FL + 0.78, 0.84, 0.38);
  if (w > 4.5) { bookcase(ctx, s.a1 - 1.1, 0.24, 1.0, 0.34, 2); }
  // a cushion for the head of the household, the brazier by it, a sewing basket
  cushion(ctx, c - 0.1, 1.45);
  brazier(ctx, c + 0.9, 1.5);
  B('wicker', c - 1.0, 1.9, c - 0.7, 2.2, FL, FL + 0.14);
  void rand;
}
function sarangbang(ctx, s) {
  const { B } = ctx, w = s.a1 - s.a0, c = (s.a0 + s.a1) / 2;
  B('wood_ochre', s.a0 + 0.1, 0.22, s.a1 - 0.1, C, FL, FL + 0.02, true);
  ctx.col.floor(ctx.R(s.a0 + 0.1, 0.22, s.a1 - 0.1, C), FL + 0.02);
  screen(ctx, c - 1.3, c + 1.3, 0.3);                                                        // the folding screen behind the guest's seat
  cushion(ctx, c, 1.15, 0.8);
  // an arm rest (ango) and a back cushion (botyo) at the seat's back
  B('cloth_indigo', c - 0.35, 0.78, c + 0.35, 0.9, FL + 0.04, FL + 0.44); B('wood_dark', c + 0.5, 1.05, c + 0.9, 1.15, FL + 0.04, FL + 0.28);
  desk(ctx, s.a0 + 0.9, 1.45, 0.9, 0.46);
  bookcase(ctx, s.a1 - 1.0, 0.24, 1.0, 0.34, 3);
  lantern(ctx, s.a1 - 0.5, 2.2);
  soban(ctx, c + 1.0, 1.6);
  brazier(ctx, c - 1.0, 2.0);
  void w;
}
function hall(ctx, s) {
  const { B, bag, P } = ctx, c = (s.a0 + s.a1) / 2;
  // a rice chest (ssalttwigi) and a table, jars of the pantry; the board floor is the base
  B('timber', c - 0.6, 0.35, c + 0.6, 0.8, FL + 0.03, FL + 0.72, true);
  B('wood_dark', c - 0.65, 0.3, c + 0.65, 0.85, FL + 0.72, FL + 0.76);
  for (const [dx, r] of [[-0.9, 0.2], [0.95, 0.24]]) { const [x, z] = P(c + dx, 0.6); bag.add('pottery_dark', lathe([[r * 0.55, 0], [r * 1.0, 0.2], [r, 0.38], [r * 0.7, 0.55], [r * 0.5, 0.58], [0.001, 0.58]], 10, null, x, FL + 0.03, z)); }
  soban(ctx, c - 0.4, 1.6, 0.6, 0.42); soban(ctx, c + 0.5, 1.7, 0.6, 0.42);
  // a lamp bracket on the wall: a paper lantern
  B('lamp_paper', c - 0.08, 0.22, c + 0.08, 0.32, FL + 1.5, FL + 1.8);
}
function sideRoom(ctx, s) {
  const { B } = ctx, c = (s.a0 + s.a1) / 2;
  B('wood_ochre', s.a0 + 0.1, 0.22, s.a1 - 0.1, C, FL, FL + 0.02, true);
  ctx.col.floor(ctx.R(s.a0 + 0.1, 0.22, s.a1 - 0.1, C), FL + 0.02);
  bandaji(ctx, c - 0.5, 0.26, 0.85, 0.4, 0.74); bedding(ctx, c - 0.5, 0.28, FL + 0.74, 0.8, 0.36);
  bookcase(ctx, c + 0.65, 0.24, 0.8, 0.34, 2);
  cushion(ctx, c, 1.7, 0.7);
}

/**
 * yangban_house { rect [x0, z0, x1, z1] (about 23 × 22), seed, thatch }: the lot with its two ranges, the
 * yard, the crock terrace, the walls and the gate on the south.
 */
export function yangbanHouse(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, W = x1 - x0, D = z1 - z0, rand = rng(el.seed ?? 7);
  // the women's range along the north: kitchen 1 bay, anbang 2, daecheong 1, side room 1 (+ more bays if the lot is wide)
  const nA = Math.max(5, Math.min(6, Math.floor((W - 6.5) / 2.9))), bwA = 2.75, LA = nA * bwA;
  const kindsA = [['kitchen', 1], ['anbang', 2], ['daecheong', nA - 4], ['room', 1]];
  range(bag, col, { org: [x0 + 5.5, z0 + 1.6], face: 's', L: LA, kinds: kindsA, seed: 11, thatch: el.thatch });
  // the men's range along the west, facing the yard: sarangbang 2 bays, maru 1, a second room 1
  const zS = z0 + 1.6 + C + V + 2.2;
  range(bag, col, { org: [x0 + 1.4, zS], face: 'e', L: 4 * 2.6, kinds: [['sarangbang', 2], ['daecheong', 1], ['room', 1]], seed: 23, thatch: el.thatch });
  // the crock terrace in the yard's south-east corner: a stone step, jars of three sizes in rows
  const jx = x1 - 4.2, jz = z1 - 3.0;
  bag.add('granite_korea', box(jx - 1.8, 0, jz - 1.0, jx + 1.8, 0.28, jz + 1.0));
  col.rect([jx - 1.8, jz - 1.0, jx + 1.8, jz + 1.0], 0, 0.95);
  for (let a = 0; a < 4; a++) for (let b = 0; b < 2; b++) {
    if (rand() < 0.15) continue;
    const big = (a + b) % 2 === 0, rr = big ? 0.32 : 0.22, hh = big ? 0.72 : 0.5, x = jx - 1.3 + a * 0.85 + (rand() - 0.5) * 0.06, z = jz - 0.45 + b * 0.9;
    bag.add('pottery_dark', lathe([[rr * 0.55, 0], [rr * 0.95, hh * 0.35], [rr, hh * 0.55], [rr * 0.7, hh * 0.9], [rr * 0.55, hh], [0.001, hh]], 10, null, x, 0.28, z));
    bag.add('pottery_dark', lathe([[rr * 0.62, 0], [rr * 0.58, 0.05], [0.001, 0.09]], 10, null, x, 0.28 + hh, z));
  }
  // the lot's wall (fieldstone below, plaster above, a tiled coping) and the gate on the south
  const xc = x0 + W * 0.62, gate = 1.25, mat = el.thatch ? 'thatch' : 'tile_grey';
  for (const [a, b] of [[[x0, z0], [x1, z0]], [[x0, z0], [x0, z1]], [[x1, z0], [x1, z1]], [[x0, z1], [xc - gate, z1]], [[xc + gate, z1], [x1, z1]]]) {
    const t = []; beamTris(t, [a[0], 0, a[1]], [b[0], 0, b[1]], 0.27, 0.95); bag.add('schist_rubble', fromTriangles(t));
    const u = []; beamTris(u, [a[0], 0.95, a[1]], [b[0], 0.95, b[1]], 0.25, 0.95); bag.add('plaster_grey', fromTriangles(u));
    const c = []; beamTris(c, [a[0], 1.9, a[1]], [b[0], 1.9, b[1]], 0.4, 0.25); bag.add(mat, fromTriangles(c));
    col.segment(a, b, 0.5, 0, 2.1);
  }
  for (const sx of [-1, 1]) bag.add('timber', box(xc + sx * gate - 0.12, 0, z1 - 0.12, xc + sx * gate + 0.12, 2.8, z1 + 0.12));
  bag.add('timber', box(xc - gate - 0.2, 2.55, z1 - 0.14, xc + gate + 0.2, 2.8, z1 + 0.14));
  rectRoof({ c: [xc, z1], A: gate + 0.9, B: 1.0, y: 2.78, rise: 0.8, kind: 'xieshan', sweep: 0.5, p: 1.5, alongZ: false, mat, soffit: 'timber', curl: false }, bag);
  // paving of the yard: flagstones along the way from the gate to the steps
  bag.add('granite_korea', box(xc - 0.8, 0, z0 + 1.6 + C + V + 1.0, xc + 0.8, 0.03, z1));
}
