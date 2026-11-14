// The Generalife about 1400 (docs/settlements/granada.md §10): the summer palace of the Nasrid
// sultans on the slope east of the Alhambra — Muhammad II's, remodelled and decorated by Isma'il I in
// 1319. The Patio de la Acequia, 48.7 × 12.8 m, its long channel of water on the axis between four
// sunken beds; the north pavilion (a portico of five arches, the larger in the middle, sebka over
// them; the gallery under a ceiling of octagonal coffers; the triple arch on columns into the Sala
// Regia; Isma'il's mirador tower beyond it over the Darro); the south pavilion (five arches on brick
// pillars and two columns); the tall windowless west wall with its little mirador in the middle; the
// entrance courts; the walled garden above (the Sultana); the water stairway climbing the hill with
// water running down channels along its parapets, round landings with low fountains between its
// flights; the orchards and vegetable gardens on their terraces (paratas); the sultan's passage
// between walls from the Alhambra across the ravine.

import { box, lathe, rod, disc, place, fromTriangles } from '../../core/geom.js';
import { subtractRects } from '../../core/build.js';
import { holedWall, face, dress, archHead, plankVault, hipRoof, tileFloor, floorFountain, archRun, nColumn, crenels, starCeiling, dbl, script } from './halls.js';
import { pairedWindow } from './partal.js';

const PL = 'plaster_white', SC = 'stucco_cream', SW = 'stucco_warm', MS = 'marble_smooth', RED = 'tuff_red', BP = 'brick_paving', LEAF = 'lotus_leaf';
const q4 = (out, a, b, c, d) => out.push(...a, ...b, ...c, ...a, ...c, ...d);
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** A six-faced solid from its four bottom and four top corners (each [x, y, z], in the same order round). */
function hexa(bag, mat, B, T) {
  const t = [];
  q4(t, B[0], B[1], B[2], B[3]); q4(t, T[3], T[2], T[1], T[0]);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; q4(t, B[i], B[j], T[j], T[i]); }
  bag.add(mat, dbl(t));
}
/** A plain wall box with col; r = [x0, z0, x1, z1]. */
function W(bag, col, mat, r, y0, y1) { bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); col.rect(r, y0, y1); }
/** Paving over r from y - d to y with holes; walkable. */
function pave(bag, col, mat, r, y, holes = [], d = 0.75) {
  for (const p of subtractRects(r, holes)) { bag.add(mat, box(p[0], y - d, p[1], p[2], y, p[3])); col.floor(p, y); }
}
/** A shrub: a clipped round mass of leaves on the ground at (x, y, z), r across, h tall. */
function shrub(bag, x, y, z, r, h, seg = 9) { const k = (x * 7.1 + z * 3.3) % 6.28; bag.add(LEAF, lathe([[0.001, 0], [r * 0.7, h * 0.06], [r * 0.97, h * 0.3], [r, h * 0.55], [r * 0.85, h * 0.8], [r * 0.5, h * 0.96], [0.001, h]], seg, (th) => 1 + 0.08 * Math.sin(th * 3 + k), x, y, z)); }
/** A clipped hedge of myrtle over r = [x0, z0, x1, z1] on the ground at y, h tall: a body and a rounded top. */
function hedge(bag, r, y, h) {
  const [x0, z0, x1, z1] = r, i = Math.min(0.08, (x1 - x0) / 4, (z1 - z0) / 4);
  bag.add(LEAF, box(x0, y, z0, x1, y + h - 0.1, z1));
  hexa(bag, LEAF, [[x0, y + h - 0.1, z0], [x1, y + h - 0.1, z0], [x1, y + h - 0.1, z1], [x0, y + h - 0.1, z1]], [[x0 + i, y + h, z0 + i], [x1 - i, y + h, z0 + i], [x1 - i, y + h, z1 - i], [x0 + i, y + h, z1 - i]]);
}
/**
 * A low Nasrid jet from the spout at (x, y, z): a column of water h tall breaking at its head into a
 * crown of falling threads that drop back into the basin, their ends at yw (the water's surface).
 */
function jet(bag, x, y, z, h, yw, R = 0.13) {
  bag.add('water_jet', rod([x, y, z], [x, y + h, z], 0.016, 5));
  bag.add('water_jet', lathe([[0.001, -0.03], [0.03, 0], [0.012, 0.04], [0.001, 0.05]], 6, null, x, y + h - 0.02, z));
  for (let k = 0; k < 7; k++) {
    const a = (k + 0.3) * Math.PI * 2 / 7, c = Math.cos(a), s = Math.sin(a), top = y + h;
    const P = (f, dy) => [x + c * R * f, top + dy, z + s * R * f];
    const fall = top - yw;
    const pts = [P(0, 0.01), P(0.35, 0.025), P(0.65, -fall * 0.2), P(0.88, -fall * 0.55), P(1, -fall + 0.005)];
    for (let i = 0; i + 1 < pts.length; i++) bag.add('water_jet', rod(pts[i], pts[i + 1], 0.007, 3));
  }
}
/** A small fruit tree (orange, pomegranate): a trunk, a few limbs, a round crown. */
function fruitTree(bag, x, y, z, s, rand) {
  const h = 1.3 * s, cr = 1.05 * s;
  bag.add('bark_olive', rod([x, y - 0.05, z], [x, y + h, z], 0.07 * s, 6));
  for (let k = 0; k < 3; k++) { const a = k * 2.1 + rand(), L = 0.55 * s; bag.add('bark_olive', rod([x, y + h - 0.1, z], [x + Math.cos(a) * L, y + h + 0.5 * s, z + Math.sin(a) * L], 0.035 * s, 5)); }
  bag.add(LEAF, lathe([[0.001, 0], [cr * 0.6, 0.08 * s], [cr * 0.9, 0.3 * s], [cr, 0.6 * s], [cr * 0.95, 0.9 * s], [cr * 0.8, 1.2 * s], [cr * 0.55, 1.45 * s], [0.001, 1.6 * s]], 14, ((p) => (th) => 1 + 0.09 * Math.sin(th * 3 + p) + 0.05 * Math.sin(th * 7 + p * 2))(rand() * 6), x, y + h - 0.25 * s, z));
  // the fruit among the leaves
  for (let k = 0; k < 7; k++) { const a = rand() * Math.PI * 2, v = 0.25 + rand() * 0.9, rr = cr * (0.95 - Math.abs(v - 0.6) * 0.4); bag.add('glaze_yellow', box(x + Math.cos(a) * rr - 0.04, y + h - 0.25 * s + v * s - 0.04, z + Math.sin(a) * rr - 0.04, x + Math.cos(a) * rr + 0.04, y + h - 0.25 * s + v * s + 0.04, z + Math.sin(a) * rr + 0.04)); }
}
/** A frieze of cursive script over a portico's arcade, on its faces ([face, top]), from u0 to u1. */
function arcadeFrieze(bag, faces, u0, u1, seed) {
  for (const [f, yt] of faces) {
    const b = f.R(0, 0.05, u0, u1); bag.add(SW, box(b[0], yt - 0.5, b[1], b[2], yt - 0.06, b[3]));
    for (const [ya, yb] of [[yt - 0.5, yt - 0.46], [yt - 0.1, yt - 0.06]]) { const m = f.R(0.05, 0.075, u0, u1); bag.add(SC, box(m[0], ya, m[1], m[2], yb, m[3])); }
    script(bag, SC, f, u0 + 0.08, u1 - 0.08, yt - 0.45, 0.33, 0.05, 0.068, seed);
  }
}
/** A cornice of mocárabe under a ceiling: two tiers of small stepped corbels along a face. */
function cornice(bag, f, u0, u1, y) {
  const n = Math.floor((u1 - u0) / 0.28);
  const band = f.R(0, 0.06, u0, u1); bag.add(SW, box(band[0], y - 0.5, band[1], band[2], y, band[3]));
  for (let i = 0; i < n; i++) {
    const u = u0 + (i + 0.5) * (u1 - u0) / n;
    const a = f.R(0.06, 0.16, u - 0.1, u + 0.1); bag.add(SC, box(a[0], y - 0.48, a[1], a[2], y - 0.26, a[3]));
    if (i + 1 < n) { const v = u + (u1 - u0) / n / 2, b = f.R(0.06, 0.27, v - 0.1, v + 0.1); bag.add(SC, box(b[0], y - 0.24, b[1], b[2], y - 0.02, b[3])); }
  }
}
/** A ceiling of octagonal coffers (r at y): cedar boards, a grid of timber ribs and an octagonal frame in each square. */
function cofferCeiling(bag, r, y, s = 0.9) {
  const [x0, z0, x1, z1] = r;
  bag.add('cedar', box(x0, y, z0, x1, y + 0.1, z1));
  const nx = Math.max(1, Math.round((x1 - x0) / s)), nz = Math.max(1, Math.round((z1 - z0) / s)), sx = (x1 - x0) / nx, sz = (z1 - z0) / nz;
  for (let i = 0; i <= nx; i++) bag.add('timber', box(x0 + i * sx - 0.04, y - 0.12, z0, x0 + i * sx + 0.04, y, z1));
  for (let j = 0; j <= nz; j++) bag.add('timber', box(x0, y - 0.12, z0 + j * sz - 0.04, x1, y, z0 + j * sz + 0.04));
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    const cx = x0 + (i + 0.5) * sx, cz = z0 + (j + 0.5) * sz, R = Math.min(sx, sz) * 0.36;
    for (let k = 0; k < 8; k++) { const a0 = (k + 0.5) * Math.PI / 4, a1 = (k + 1.5) * Math.PI / 4; bag.add('timber', rod([cx + Math.cos(a0) * R, y - 0.05, cz + Math.sin(a0) * R], [cx + Math.cos(a1) * R, y - 0.05, cz + Math.sin(a1) * R], 0.022, 4)); }
    bag.add('gilt_bronze', box(cx - 0.05, y - 0.06, cz - 0.05, cx + 0.05, y, cz + 0.05));
  }
}
/** A lean-to roof of tiles from (a, ya) at the wall to (b, yb) at the eaves, across x0..x1 (along x), its timber edge. */
function leanTo(bag, x0, x1, za, ya, zb, yb) {
  const sl = [], ed = [];
  q4(sl, [x0, ya, za], [x1, ya, za], [x1, yb, zb], [x0, yb, zb]);
  q4(ed, [x0, yb - 0.16, zb], [x1, yb - 0.16, zb], [x1, yb, zb], [x0, yb, zb]);
  q4(ed, [x0, ya - 0.16, za], [x1, ya - 0.16, za], [x1, yb - 0.16, zb], [x0, yb - 0.16, zb]);
  bag.add('roof_tile', dbl(sl)); bag.add('timber', dbl(ed));
}

/** gen_wall: { rect, y0, y1, mat, cope } — a plain wall (a terrace's retaining wall, a garden or lane wall), a coping of brick on it. */
function genWall(el, { bag, col }) {
  const r = el.rect, mat = el.mat ?? RED;
  W(bag, col, mat, r, el.y0, el.y1);
  if (el.cope !== false) bag.add('brick', box(r[0] - 0.04, el.y1, r[1] - 0.04, r[2] + 0.04, el.y1 + 0.09, r[3] + 0.04));
  if (el.top) col.floor(r, el.y1 + 0.09);
}
/** gen_risers: { list: [[x0, z0, x1, z1, y]] } — the brick edges of the steps of a stepped lane, the ground between them. */
function genRisers(el, { bag }) { for (const [x0, z0, x1, z1, y] of el.list) bag.add('brick', box(x0, y - 0.12, z0, x1, y + 0.06, z1)); }

/** gen_postern: { rect, y, h, z } — the gate tower at the Alhambra's east end: a passage along x under horseshoe arches, crenellated. */
function postern(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, h = el.h ?? 13, zc = el.z, hw = 1.3, hp = 3.6;
  holedWall(bag, col, RED, [x0, z0, x1, z1], y - 3, y + h, [[zc - hw, zc + hw, y - 3, y + hp]], false);
  col.floor([x0, z0, x1, z1], y + h);
  crenels(bag, [x0, z0, x1, z1], y + h);
  archHead(bag, face('x', x0, 1), zc - hw, zc + hw, y + 2.4, y + hp, x1 - x0, 'horseshoe', { mat: RED, both: true });
  pave(bag, col, BP, [x0, zc - hw, x1, zc + hw], y + 0.04, [], 0.5);
  // a door leaf folded back against the passage's wall, its studs
  bag.add('wood_dark', box(x0 + 0.6, y + 0.05, zc + hw - 0.1, x0 + 2.0, y + 2.9, zc + hw - 0.02));
  for (let k = 1; k < 5; k++) bag.add('timber', box(x0 + 0.6, y + k * 0.58, zc + hw - 0.12, x0 + 2.0, y + k * 0.58 + 0.04, zc + hw - 0.1));
  // arrow slits high on the faces
  for (const f of [face('z', z0, -1), face('z', z1, 1), face('x', x1, 1)]) { const m = f.ax === 'z' ? (x0 + x1) / 2 : zc, o = f.R(-0.02, 0.03, m - 0.12, m + 0.12); bag.add('opening', box(o[0], y + h - 4.2, o[1], o[2], y + h - 2.6, o[3])); }
}

/**
 * acequia: { court, y, base, west, wMirador, east, orchardY, seed } — the Patio de la Acequia: its
 * walks and the channel on the axis with a basin at each end and the fountain at the middle crossing;
 * the four beds sunk below the walks, planted with myrtle, roses and orange trees; the tall west wall
 * with its mirador; the east range.
 */
function acequia(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.court, y = el.y, cx = (x0 + x1) / 2, zm = (z0 + z1) / 2, rand = rng(el.seed ?? 1319);
  const bedY = y - 0.6, pw = 1.2, cw = 0.25, kerb = 0.2, walk = 1.0, cross = 1.4;
  const ch = [cx - cw - kerb, z0 - 1.6, cx + cw + kerb, z1 + 1.6];
  const beds = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const xa = sx < 0 ? x0 + pw : cx + cw + kerb + walk, xb = sx < 0 ? cx - cw - kerb - walk : x1 - pw;
    const za = sz < 0 ? z0 + 1.5 : zm + cross, zb = sz < 0 ? zm - cross : z1 - 1.5;
    beds.push([xa, za, xb, zb]);
  }
  const fz = [cx - 1.1, zm - 1.1, cx + 1.1, zm + 1.1];
  pave(bag, col, BP, [x0, z0, x1, z1], y, [...beds, [ch[0], z0, ch[2], z1], fz]);
  // the channel: marble kerbs flush with the walks, the water a hand below them; through the porticoes to the end basins
  for (const [a, b] of [[ch[1], fz[1]], [fz[3], ch[3]]]) {
    for (const s of [-1, 1]) bag.add(MS, box(s < 0 ? ch[0] : cx + cw, y - 0.42, a, s < 0 ? cx - cw : ch[2], y + 0.04, b));
    bag.add('marble_dark', box(cx - cw, y - 0.42, a, cx + cw, y - 0.36, b));
    bag.add('water', box(cx - cw, y - 0.36, a, cx + cw, y - 0.09, b));
    col.rect([ch[0], a, ch[2], b], y - 0.4, y + 0.04);
  }
  // the fountain at the middle crossing: a low round basin on a square of marble, brimming into the channel; a low jet
  bag.add(MS, box(fz[0], y - 0.75, fz[1], fz[2], y + 0.02, fz[3])); col.floor(fz, y + 0.02);
  bag.add(MS, lathe([[0.95, 0], [0.95, 0.16], [0.8, 0.16], [0.8, 0.04], [0.001, 0.04]], 20, null, cx, y + 0.02, zm));
  bag.add('water', disc(0.8, y + 0.13, 20, cx, zm));
  bag.add(MS, lathe([[0.08, 0], [0.05, 0.16], [0.001, 0.2]], 8, null, cx, y + 0.06, zm));
  jet(bag, cx, y + 0.24, zm, 0.3, y + 0.13, 0.22);
  col.circle(cx, zm, 0.95, y, y + 0.2);
  // the basins at the channel's ends, under the porticoes
  for (const bz of [ch[1] - 0.45, ch[3] + 0.45]) {
    bag.add(MS, lathe([[0.62, 0], [0.62, 0.3], [0.5, 0.3], [0.5, 0.08], [0.001, 0.08]], 18, null, cx, y, bz));
    bag.add('water', disc(0.5, y + 0.25, 18, cx, bz));
    bag.add(MS, lathe([[0.06, 0], [0.04, 0.1], [0.001, 0.12]], 8, null, cx, y + 0.08, bz));
    jet(bag, cx, y + 0.2, bz, 0.22, y + 0.25, 0.16);
    col.circle(cx, bz, 0.62, y, y + 0.3);
  }
  // the sunken beds: earth a little over half a metre below the walks; myrtle along their edges,
  // roses and low flowers in them, a row of orange trees down the middle, their crowns at the walkers' eyes
  for (const r of beds) {
    bag.add('ground', box(r[0], bedY - 0.25, r[1], r[2], bedY + 0.1, r[3])); col.floor(r, bedY + 0.1);
    const gy = bedY + 0.1, ux = (r[0] + r[2]) / 2;
    for (const x of [r[0] + 0.05, r[2] - 0.65]) for (const [za, zb] of [[r[1] + 0.05, (r[1] + r[3]) / 2 - 0.3], [(r[1] + r[3]) / 2 + 0.3, r[3] - 0.05]]) hedge(bag, [x, za, x + 0.6, zb], gy, 0.62);
    for (let z = r[1] + 1.4; z < r[3] - 1.2; z += 1.5) for (const x of [r[0] + 1.05, r[2] - 1.05]) {
      shrub(bag, x, gy, z, 0.3, 0.45 + rand() * 0.2);
      for (let k = 0; k < 3; k++) { const a = rand() * 6.28, rr = 0.2 + rand() * 0.08, fx = x + Math.cos(a) * rr, fzz = z + Math.sin(a) * rr, fy = gy + 0.3 + rand() * 0.2; bag.add(rand() < 0.6 ? 'glaze_red' : 'glaze_white', box(fx - 0.035, fy, fzz - 0.035, fx + 0.035, fy + 0.06, fzz + 0.035)); }
    }
    const L = r[3] - r[1], n = Math.max(2, Math.round(L / 5.2));
    for (let i = 0; i < n; i++) { const z = r[1] + (i + 0.5) * L / n; fruitTree(bag, ux, gy, z, 0.95 + rand() * 0.15, rand); col.circle(ux, z, 0.12, gy, gy + 1.4); }
  }
  // the west wall, tall and windowless, the arch of the mirador in its middle; the mirador beyond it
  const [w0, , w1] = el.west, [m0, mz0, m1, mz1] = el.wMirador, mzc = (mz0 + mz1) / 2, hw = 2.0, Hw = 5.6;
  const hole = [mzc - hw, mzc + hw, y - 0.6, y + 3.8];
  holedWall(bag, col, PL, [w0, z0, w1, z1], el.orchardY - 0.5, y + Hw, [hole], false);
  archHead(bag, face('x', w1, 1), mzc - hw, mzc + hw, y + 2.4, y + 3.8, w1 - w0, 'lobed', { both: true });
  // (the wall above the orchard terrace stands on the walks' level too: solid from there up, but for the mirador's opening)
  col.rect([w0, z0, w1, mzc - hw], y - 0.6, y + Hw); col.rect([w0, mzc + hw, w1, z1], y - 0.6, y + Hw); col.rect([w0, mzc - hw, w1, mzc + hw], y + 3.8, y + Hw);
  bag.add('brick', box(w0 - 0.04, y + Hw, z0, w1 + 0.04, y + Hw + 0.09, z1));
  tileFloor(bag, col, [m0 + 0.5, mz0 + 0.5, w1, mz1 - 0.5], y);
  bag.add(PL, box(m0, el.orchardY - 0.5, mz0, w0, y - 0.3, mz1)); col.rect([m0, mz0, w0, mz1], el.orchardY - 0.5, y - 0.3);
  // its three sides, three little arched windows low in each, to sit and look out over the orchards to the Alhambra
  const Hm = 3.6, win = (u0, u1) => { const out = [], n = 3, s = (u1 - u0) / n; for (let i = 0; i < n; i++) { const u = u0 + (i + 0.5) * s; out.push([u - 0.3, u + 0.3, y + 0.35, y + 1.95]); } return out; };
  const wW = win(mz0 + 0.5, mz1 - 0.5), wN = win(m0 + 0.5, w0), wS = wN;
  holedWall(bag, col, PL, [m0, mz0 + 0.5, m0 + 0.5, mz1 - 0.5], y - 0.3, y + Hm, wW, false);
  holedWall(bag, col, PL, [m0, mz0, w0, mz0 + 0.5], y - 0.3, y + Hm, wN, true);
  holedWall(bag, col, PL, [m0, mz1 - 0.5, w0, mz1], y - 0.3, y + Hm, wS, true);
  for (const h of wW) archHead(bag, face('x', m0, 1), h[0], h[1], h[3] - 0.32, h[3], 0.5, 'lobed', { both: true, alfiz: false });
  for (const [f, hs] of [[face('z', mz0, 1), wN], [face('z', mz1, -1), wS]]) for (const h of hs) archHead(bag, f, h[0], h[1], h[3] - 0.32, h[3], 0.5, 'lobed', { both: true, alfiz: false });
  dress(bag, face('x', m0 + 0.5, 1), mz0 + 0.5, mz1 - 0.5, y, y + Hm - 0.4, wW, { dado: 0.32, band: false, dadoScript: false });
  dress(bag, face('z', mz0 + 0.5, 1), m0 + 0.5, w0, y, y + Hm - 0.4, wN, { dado: 0.32, band: false, dadoScript: false });
  dress(bag, face('z', mz1 - 0.5, -1), m0 + 0.5, w0, y, y + Hm - 0.4, wS, { dado: 0.32, band: false, dadoScript: false });
  plankVault(bag, [m0 + 0.5, mz0 + 0.5, w0, mz1 - 0.5], y + Hm - 0.4, 0.5, 'cedar', 'timber', 'z');
  bag.add(PL, box(m0, y + Hm, mz0, w0, y + Hm + 0.15, mz1));
  hipRoof(bag, [m0, mz0, w0, mz1], y + Hm + 0.15, 1.3, 0.35);
  // the east range: rooms of two storeys under a tiled roof, their doors and windows on the court
  const [e0, ez0, e1, ez1] = el.east, He = 7.4;
  bag.add(PL, box(e0, y - 0.6, ez0, e1, y + He, ez1)); col.rect([e0, ez0, e1, ez1], y - 0.6, y + He);
  const fE = face('x', e0, -1);
  for (let z = ez0 + 5; z < ez1 - 3; z += 9.5) {
    const fr = fE.R(0, 0.08, z - 1.0, z + 1.0); bag.add(SC, box(fr[0], y, fr[1], fr[2], y + 3.1, fr[3]));
    const dr = fE.R(0, 0.1, z - 0.62, z + 0.62); bag.add('wood_dark', box(dr[0], y, dr[1], dr[2], y + 2.5, dr[3]));
    for (let k = 1; k < 4; k++) { const s = fE.R(0.1, 0.115, z - 0.56, z + 0.56); bag.add('timber', box(s[0], y + k * 0.62 - 0.03, s[1], s[2], y + k * 0.62 + 0.03, s[3])); }
    const sl = fE.R(0, 0.2, z - 0.7, z + 0.7); bag.add(MS, box(sl[0], y - 0.2, sl[1], sl[2], y + 0.06, sl[3]));
    for (const dz of [-2.6, 2.6, 0]) {
      const zz = z + dz, up = dz === 0, w0_ = fE.R(0, 0.06, zz - 0.45, zz + 0.45), o = fE.R(0.0, 0.07, zz - 0.32, zz + 0.32);
      const ya = up ? y + 4.3 : y + 1.4, yb = up ? y + 5.6 : y + 2.4;
      bag.add(SW, box(w0_[0], ya - 0.08, w0_[1], w0_[2], yb + 0.08, w0_[3])); bag.add('lattice', box(o[0], ya, o[1], o[2], yb, o[3]));
    }
  }
  const dd = fE.R(0, 0.03, ez0 + 0.1, ez1 - 0.1); bag.add(SW, box(dd[0], y, dd[1], dd[2], y + 0.9, dd[3]));
  hipRoof(bag, [e0, ez0, e1, ez1], y + He, 2.2, 0.5);
}

/**
 * gen_north: { rect (outer), y, mirador, passage, neBlock, court, sultanaY } — the north pavilion: the
 * portico of five arches on pillars across the court's end, the gallery behind under its coffered
 * ceiling, the triple arch on two columns into the Sala Regia, the hall dressed in tile and stucco under
 * a mocárabe cornice and a ceiling of cedar; the mirador tower of Isma'il I beyond it with paired
 * windows on three sides; the passage and stair from the gallery's east end up to the Sultana.
 */
function genNorth(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y, [cx0, , cx1] = el.court, cx = (cx0 + cx1) / 2, t = 0.8;
  const zp = z1, zg = z1 - 3.0, zb = zg - t, zs = z0 + t, hc = 3.4, top = 6.2, Hs = 7.0, Ht = 10.2;
  // the portico: five arches on pillars, the middle one wider; sebka over them; the gallery's floor
  const us = [0.3, 2.55, 4.8, 8.0, 10.25, 12.5];
  for (const u of us) { const x = cx0 + u; bag.add('brick', box(x - 0.3, y, zp - 0.25, x + 0.3, y + hc - 0.14, zp + 0.25)); col.rect([x - 0.3, zp - 0.25, x + 0.3, zp + 0.25], y, y + hc); }
  archRun(bag, [cx0, zp], [cx1, zp], us.map((u) => ({ u, w: 0.3 })), y, hc, top, { sebka: true });
  arcadeFrieze(bag, [[face('z', zp + 0.25, 1), y + top], [face('z', zp - 0.25, -1), y + top - 0.44]], cx0, cx1, 11);
  for (const [a, b] of [[x0, cx0], [cx1, x1]]) if (b - a > 0.05) { bag.add(PL, box(a, y - 0.6, zp - 0.25, b, y + top, zp + 0.25)); col.rect([a, zp - 0.25, b, zp + 0.25], y, y + top); }
  tileFloor(bag, col, [cx0, zg, cx1 + (el.passage ? 0 : 0), zp - 0.25], y);
  bag.add(MS, box(cx0, y - 0.3, zp - 0.25, cx1, y + 0.05, zp + 0.25)); col.floor([cx0, zp - 0.25, cx1, zp + 0.25], y + 0.05);
  // the gallery: its west end wall, the back wall with the triple arch; the ceiling of octagonal coffers
  W(bag, col, PL, [x0, zg, cx0, zp - 0.25], y - 0.6, y + top);
  dress(bag, face('x', cx0, 1), zg, zp - 0.25, y, y + top - 0.3, [], { band: false });
  const tw = 2.3, tri = [cx - tw, cx + tw, y, y + 4.6];
  const back = [x0, zb, el.passage ? el.passage[2] : x1, zg];
  holedWall(bag, col, PL, back, y - 0.6, y + Hs, [tri], true);
  dress(bag, face('z', zg, 1), cx0, cx1, y, y + top - 0.3, [tri]);
  archRun(bag, [cx - tw, zb + t / 2], [cx + tw, zb + t / 2], [{ u: 0, w: 0.02 }, { u: 1.45, w: 0.15 }, { u: 3.15, w: 0.15 }, { u: 4.6, w: 0.02 }], y, 3.1, 4.6, { lobed: true, sebka: true });
  for (const u of [1.45, 3.15]) nColumn(bag, col, cx - tw + u, zb + t / 2, y, 3.1);
  bag.add(MS, box(tri[0], y - 0.3, zb, tri[1], y + 0.05, zg)); col.floor([tri[0], zb, tri[1], zg], y + 0.05);
  cofferCeiling(bag, [cx0, zg, cx1, zp - 0.25], y + top - 0.3);
  // the Sala Regia
  const S = [cx0, zs, cx1, zb];
  W(bag, col, PL, [x0, zs, cx0, zb], y - 0.6, y + Hs); W(bag, col, PL, [cx1, zs, x1, zb], y - 0.6, y + Hs);
  const [mx0, mz0, mx1] = el.mirador, mc = (mx0 + mx1) / 2, mh = [mc - 1.25, mc + 1.25, y, y + 3.7];
  holedWall(bag, col, PL, [x0, z0, x1, zs], y - 0.6, y + Hs, [mh], true);
  tileFloor(bag, col, S, y);
  bag.add(MS, box(mh[0], y - 0.3, z0, mh[1], y + 0.05, zs)); col.floor([mh[0], z0, mh[1], zs], y + 0.05);
  archHead(bag, face('z', zs, 1), mh[0], mh[1], y + 2.5, y + 3.7, t, 'lobed', { both: true });
  dress(bag, face('z', zb, -1), S[0], S[2], y, y + 5.9, [tri]);
  dress(bag, face('z', zs, 1), S[0], S[2], y, y + 5.9, [mh]);
  dress(bag, face('x', S[0], 1), zs, zb, y, y + 5.9); dress(bag, face('x', S[2], -1), zs, zb, y, y + 5.9);
  // niches (taqas) either side of the triple arch, as in the halls of the Alhambra
  for (const s of [-1, 1]) { const u = cx + s * (tw + 0.75), f = face('z', zb, -1), r = f.R(0, 0.06, u - 0.28, u + 0.28); bag.add(SW, box(r[0], y + 0.9, r[1], r[2], y + 1.9, r[3])); archHead(bag, f, u - 0.28, u + 0.28, y + 1.6, y + 1.9, 0.06, 'lobed', { alfiz: false, frame: false, mat: SC }); }
  for (const [f, a, b] of [[face('z', zb, -1), S[0], S[2]], [face('z', zs, 1), S[0], S[2]], [face('x', S[0], 1), zs, zb], [face('x', S[2], -1), zs, zb]]) cornice(bag, f, a, b, y + 6.4);
  plankVault(bag, S, y + 6.4, 0.9, 'cedar', 'timber', 'x');
  bag.add(PL, box(x0, y + Hs, z0, x1, y + Hs + 0.2, zb));
  hipRoof(bag, [x0, z0, x1, zb], y + Hs + 0.2, 2.6, 0.5);
  // the portico's roof, from the wall over the gallery down to the eaves over the arches
  bag.add(PL, box(x0, y + top, zg - 0.01, x1, y + top + 1.1, zg + 0.3));
  leanTo(bag, x0 - 0.3, x1 + 0.3, zg, y + top + 1.3, zp + 0.7, y + top + 0.3);
  for (const xe of [x0, x1]) { const g = []; q4(g, [xe, y + top, zg + 0.3], [xe, y + top, zp + 0.25], [xe, y + top + 0.3, zp + 0.25], [xe, y + top + 1.1, zg + 0.3]); bag.add(PL, dbl(g)); }
  // the mirador tower: its foot down the north slope, the room with paired windows on three sides, a star ceiling of cedar
  const [, , , mz1] = el.mirador, M = el.mirador, mt = 0.7, R = [M[0] + mt, M[1] + mt, M[2] - mt, mz1];
  bag.add(PL, box(M[0], y - 14, M[1], M[2], y - 0.3, mz1));
  const wy0 = y + 0.75, wy1 = y + 2.9, zc = (R[1] + R[3]) / 2, wN = [[mc - 0.78, mc + 0.78, wy0, wy1]], wS = [[zc - 0.78, zc + 0.78, wy0, wy1]];
  holedWall(bag, col, PL, [M[0], M[1], M[2], R[1]], y - 0.3, y + Ht, wN, true);
  holedWall(bag, col, PL, [M[0], R[1], R[0], mz1], y - 0.3, y + Ht, wS, false);
  holedWall(bag, col, PL, [R[2], R[1], M[2], mz1], y - 0.3, y + Ht, wS, false);
  pairedWindow(bag, face('z', M[1], 1), mc, wy0, wy1, mt);
  for (const xa of [M[0], R[2]]) pairedWindow(bag, face('x', xa, 1), zc, wy0, wy1, mt);
  tileFloor(bag, col, R, y);
  dress(bag, face('z', R[1], 1), R[0], R[2], y, y + 5.2, wN); dress(bag, face('x', R[0], 1), R[1], R[3], y, y + 5.2, wS); dress(bag, face('x', R[2], -1), R[1], R[3], y, y + 5.2, wS);
  starCeiling(bag, R, y + 5.2);
  for (const f of [face('z', M[1], -1), face('x', M[0], -1), face('x', M[2], 1)]) for (const d of [-1.3, 0, 1.3]) { const m = (f.ax === 'z' ? mc : zc) + d, o = f.R(-0.02, 0.03, m - 0.22, m + 0.22); bag.add('opening', box(o[0], y + Ht - 2.2, o[1], o[2], y + Ht - 1.5, o[3])); }
  hipRoof(bag, M, y + Ht, 2.2, 0.45);
  // the passage from the gallery's east end, its stair up to the Sultana's garden
  if (el.passage) {
    const [p0, pz0, p1, pz1] = el.passage, sy = el.sultanaY, s0 = p0 + 2.0, s1 = p1 - 0.3, Hp = sy - y + 3.2;
    tileFloor(bag, col, [cx1, zg, s0, zp - 0.25], y);
    bag.add(PL, box(cx1, y - 0.6, zp - 0.25, p1, y + Hp, zp + 0.25)); col.rect([cx1, zp - 0.25, p1, zp + 0.25], y, y + Hp);
    const n = Math.round((sy - y) / 0.16), L = s1 - s0;
    for (let k = 0; k < n; k++) bag.add('brick', box(s0 + L * k / n, y - 0.3, zg, s0 + L * (k + 1) / n, y + (sy - y) * (k + 1) / n, zp - 0.25));
    for (let k = 0; k < n; k++) bag.add(MS, box(s0 + L * k / n - 0.02, y + (sy - y) * (k + 1) / n - 0.03, zg, s0 + L * k / n + 0.05, y + (sy - y) * (k + 1) / n + 0.01, zp - 0.25));
    col.ramp([s0, zg, s1, zp - 0.25], y, sy, 'e');
    bag.add(BP, box(s1, sy - 0.4, zg, p1, sy, zp - 0.25)); col.floor([s1, zg, p1, zp - 0.25], sy);
    plankVault(bag, [cx1, zg, p1, zp - 0.25], y + Hp - 0.9, 0.6, 'cedar', 'timber', 'x');
    bag.add(PL, box(cx1, y + Hp - 0.9, zg, p1, y + Hp, zg + 0.02));
    bag.add(PL, box(cx1, y + Hp, zb, p1, y + Hp + 0.15, zp + 0.25));
    const [n0, nz0, n1, nz1] = el.neBlock;
    bag.add(PL, box(n0, y - 0.6, nz0, n1, sy + 4.2, nz1)); col.rect(el.neBlock, y - 0.6, sy + 4.2);
    hipRoof(bag, el.neBlock, sy + 4.2, 1.8, 0.4);
    for (const z of [nz0 + 3, nz0 + 8, nz0 + 12]) { const f = face('x', n1, 1), o = f.R(-0.02, 0.03, z - 0.35, z + 0.35); bag.add('lattice', box(o[0], sy + 1.6, o[1], o[2], sy + 2.8, o[3])); }
  }
}

/** gen_south: { rect, y, court } — the south pavilion: five arches on brick pillars with two columns at the middle, the hall behind, the room above; the door to the Patio de Polo. */
function genSouth(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y, [cx0, , cx1] = el.court, cx = (cx0 + cx1) / 2, t = 0.8, hc = 3.2, top = 5.6;
  const zp = z0, zw = z0 + 2.8, zh = zw + t, H = 8.6;
  const st = [[0.3, 'p'], [2.55, 'p'], [5.1, 'c'], [7.7, 'c'], [10.25, 'p'], [12.5, 'p']];
  for (const [u, k] of st) { const x = cx0 + u; if (k === 'p') { bag.add('brick', box(x - 0.3, y, zp - 0.25, x + 0.3, y + hc - 0.14, zp + 0.25)); col.rect([x - 0.3, zp - 0.25, x + 0.3, zp + 0.25], y, y + hc); } else nColumn(bag, col, x, zp, y, hc); }
  archRun(bag, [cx0, zp], [cx1, zp], st.map(([u, k]) => ({ u, w: k === 'p' ? 0.3 : 0.16 })), y, hc, top, { sebka: true });
  arcadeFrieze(bag, [[face('z', zp - 0.25, -1), y + top], [face('z', zp + 0.25, 1), y + top - 0.28]], cx0, cx1, 23);
  for (const [a, b] of [[x0, cx0], [cx1, x1]]) { bag.add(PL, box(a, y - 0.6, zp - 0.25, b, y + top, zp + 0.25)); col.rect([a, zp - 0.25, b, zp + 0.25], y, y + top); }
  for (const [a, b] of [[x0, cx0], [cx1, x1]]) W(bag, col, PL, [a, zp + 0.25, b, zw], y - 0.6, y + top);
  tileFloor(bag, col, [cx0, zp + 0.25, cx1, zw], y);
  bag.add(MS, box(cx0, y - 0.3, zp - 0.25, cx1, y + 0.05, zp + 0.25)); col.floor([cx0, zp - 0.25, cx1, zp + 0.25], y + 0.05);
  bag.add('cedar', box(cx0, y + top - 0.12, zp + 0.25, cx1, y + top, zw));
  for (let x = cx0 + 0.3; x < cx1; x += 0.6) bag.add('timber', box(x - 0.05, y + top - 0.26, zp + 0.25, x + 0.05, y + top - 0.12, zw));
  // the hall: its door from the portico and its door to the Patio de Polo, the dado and stucco, a plank ceiling; the room above with windows on the court
  const d1 = [cx - 0.85, cx + 0.85, y, y + 3.0];
  holedWall(bag, col, PL, [x0, zw, x1, zh], y - 0.6, y + H, [d1], true);
  archHead(bag, face('z', zw, 1), d1[0], d1[1], y + 2.1, y + 3.0, t, 'horseshoe', { both: true });
  bag.add(MS, box(d1[0], y - 0.3, zw, d1[1], y + 0.05, zh)); col.floor([d1[0], zw, d1[1], zh], y + 0.05);
  dress(bag, face('z', zw, -1), cx0, cx1, y, y + top - 0.12, [d1], { band: false });
  const d2 = [cx - 0.8, cx + 0.8, y, y + 2.9];
  holedWall(bag, col, PL, [x0, z1 - t, x1, z1], y - 0.6, y + H, [d2], true);
  archHead(bag, face('z', z1 - t, 1), d2[0], d2[1], y + 2.0, y + 2.9, t, 'horseshoe', { both: true });
  bag.add(MS, box(d2[0], y - 0.3, z1 - t, d2[1], y + 0.05, z1)); col.floor([d2[0], z1 - t, d2[1], z1], y + 0.05);
  W(bag, col, PL, [x0, zh, cx0, z1 - t], y - 0.6, y + H); W(bag, col, PL, [cx1, zh, x1, z1 - t], y - 0.6, y + H);
  const hall = [cx0, zh, cx1, z1 - t];
  tileFloor(bag, col, hall, y);
  dress(bag, face('z', zh, 1), cx0, cx1, y, y + 4.2, [d1]); dress(bag, face('z', z1 - t, -1), cx0, cx1, y, y + 4.2, [d2]);
  dress(bag, face('x', cx0, 1), zh, z1 - t, y, y + 4.2); dress(bag, face('x', cx1, -1), zh, z1 - t, y, y + 4.2);
  bag.add('cedar', box(cx0, y + 4.2, zh, cx1, y + 4.32, z1 - t));
  for (let x = cx0 + 0.35; x < cx1; x += 0.7) bag.add('timber', box(x - 0.06, y + 4.04, zh, x + 0.06, y + 4.2, z1 - t));
  bag.add(PL, box(cx0, y + 4.32, zh, cx1, y + H, z1 - t));
  for (const u of [cx - 3.2, cx, cx + 3.2]) pairedWindow(bag, face('z', zw, 1), u, y + 6.6, y + 8.0, t);
  bag.add(PL, box(x0, y + H, zw, x1, y + H + 0.15, z1));
  hipRoof(bag, [x0, zw, x1, z1], y + H + 0.15, 2.0, 0.45);
  leanTo(bag, x0 - 0.3, x1 + 0.3, zw, y + top + 1.0, zp - 0.7, y + top + 0.2);
  bag.add(PL, box(x0, y + top, zw - 0.3, x1, y + top + 0.8, zw));
  for (const xe of [x0, x1]) { const g = []; q4(g, [xe, y + top, zw - 0.3], [xe, y + top, zp - 0.25], [xe, y + top + 0.2, zp - 0.25], [xe, y + top + 0.8, zw - 0.3]); bag.add(PL, dbl(g)); }
}

/**
 * gen_courts: { polo, dismount, y, dy, block, seed } — the Patio de Polo (paved, a gallery of arches on its
 * east side) and below it the Patio del Descabalgamiento: its gate from the lane, the mounting blocks and
 * benches along its walls, the two buildings of the stables, the stair up to the Polo.
 */
function genCourts(el, ctx) {
  const { bag, col } = ctx, y = el.y, dy = el.dy, [p0, pz0, p1, pz1] = el.polo, [d0, dz0, d1, dz1] = el.dismount, t = 0.7, Hp = 4.6, Hd = 4.4;
  const sx0 = 286.2 - 0.0, st = [el.stairX - 1.3, el.stairX + 1.3];
  // the Polo: walls west, east and south; paving; the gallery on the east side
  W(bag, col, PL, [p0, pz0, p0 + 0.8, pz1], y - 3, y + Hp);
  W(bag, col, PL, [p1 - t, pz0, p1, pz1 - 1], y - 3, y + Hp);
  holedWall(bag, col, PL, [p0, pz1 - 1, p1, pz1], dy - 0.5, y + Hp, [[st[0], st[1], dy - 0.5, y + 2.6]], true);
  archHead(bag, face('z', pz1 - 1, 1), st[0], st[1], y + 1.6, y + 2.6, 1.0, 'horseshoe', { both: true });
  if (el.block) { const b = el.block; bag.add(PL, box(b[0], y - 0.6, b[1], b[2], y + 7.2, b[3])); col.rect(b, y - 0.6, y + 7.2); hipRoof(bag, b, y + 7.2, 1.6, 0.4); }
  const ga = p1 - t - 2.6;
  pave(bag, col, BP, [p0 + 0.8, pz0, p1 - t, pz1 - 1], y);
  const gst = []; for (let z = pz0 + 1.6; z <= pz1 - 2.2; z += 2.55) gst.push(z);
  for (const z of gst) { bag.add('brick', box(ga - 0.28, y, z - 0.28, ga + 0.28, y + 2.86, z + 0.28)); col.rect([ga - 0.28, z - 0.28, ga + 0.28, z + 0.28], y, y + 3.0); }
  archRun(bag, [ga, gst[0]], [ga, gst[gst.length - 1]], gst.map((z) => ({ u: z - gst[0], w: 0.28 })), y, 3.0, 4.6, { sebka: false });
  bag.add('cedar', box(ga + 0.25, y + 4.48, gst[0] - 0.3, p1 - t, y + 4.6, gst[gst.length - 1] + 0.3));
  { const sl = [], ed = [], za = gst[0] - 0.6, zb = gst[gst.length - 1] + 0.6; q4(sl, [p1 - t, y + 5.6, za], [p1 - t, y + 5.6, zb], [ga - 0.6, y + 4.75, zb], [ga - 0.6, y + 4.75, za]); q4(ed, [ga - 0.6, y + 4.6, za], [ga - 0.6, y + 4.6, zb], [ga - 0.6, y + 4.75, zb], [ga - 0.6, y + 4.75, za]); bag.add('roof_tile', dbl(sl)); bag.add('timber', dbl(ed)); }
  for (const z of [gst[0] - 0.28, gst[gst.length - 1] + 0.28]) { const g = []; q4(g, [ga + 0.25, y + 4.6, z], [p1 - t, y + 4.6, z], [p1 - t, y + 5.6, z], [ga + 0.25, y + 4.75, z]); bag.add(PL, dbl(g)); }
  // the stair from the Dismount court up to the Polo through the wall between them, its cheek walls
  const sz0 = pz1 - 1, sz1 = dz0 + 1.3 + 3.6, n = Math.round((y - dy) / 0.16);
  for (let k = 0; k < n; k++) { const za = sz1 - (sz1 - sz0) * (k + 1) / n, zb = sz1 - (sz1 - sz0) * k / n; bag.add('brick', box(st[0], dy - 0.3, za, st[1], dy + (y - dy) * (k + 1) / n, zb)); bag.add(MS, box(st[0], dy + (y - dy) * (k + 1) / n - 0.03, zb - 0.05, st[1], dy + (y - dy) * (k + 1) / n + 0.01, zb + 0.02)); }
  col.ramp([st[0], sz0, st[1], sz1], dy, y, 'n');
  for (const [a, b] of [[st[0] - 0.4, st[0]], [st[1], st[1] + 0.4]]) for (let k = 0; k < 4; k++) { const za = dz0 + 1.3 + k * 0.9, zb = za + 0.9, yt = y + 0.9 - (y - dy) * (za - sz0 - 0.0) / (sz1 - sz0); if (za >= sz1) continue; W(bag, col, PL, [a, za, b, Math.min(zb, sz1)], dy - 0.3, Math.max(dy + 0.9, yt)); }
  // the Dismount court: its walls (the gate on the west from the lane), the paving, benches and mounting blocks, the stables
  const gz = el.gateZ, gw = 1.4;
  holedWall(bag, col, PL, [d0, dz0, d1, dz0 + 1.3], dy - 0.5, dy + Hd, [[st[0], st[1], dy - 0.5, dy + 6], [el.orchardDoor - 0.6, el.orchardDoor + 0.6, dy - 1.2, dy + 2.4]], true);
  archHead(bag, face('z', dz0 + 1.3, -1), el.orchardDoor - 0.6, el.orchardDoor + 0.6, dy + 1.6, dy + 2.4, 1.3, 'round', { both: true });
  holedWall(bag, col, PL, [d0, dz0 + 1.3, d0 + 0.8, dz1], dy - 1.5, dy + Hd, [[gz - gw, gz + gw, dy - 1.5, dy + 3.4]], false);
  archHead(bag, face('x', d0, 1), gz - gw, gz + gw, dy + 2.3, dy + 3.4, 0.8, 'horseshoe', { both: true });
  W(bag, col, PL, [d0 + 0.8, dz1 - 0.8, d1, dz1], dy - 1.5, dy + Hd);
  W(bag, col, PL, [d1 - 0.8, dz0 + 1.3, d1, dz1 - 0.8], dy - 1.5, dy + Hd);
  for (const r of [[d0, gz - gw, d0 + 0.8, gz + gw]]) { bag.add(BP, box(r[0], dy - 0.5, r[1], r[2], dy + 0.04, r[3])); col.floor(r, dy + 0.04); }
  const court = [d0 + 0.8, dz0 + 1.3, d1 - 0.8, dz1 - 0.8];
  pave(bag, col, BP, court, dy + 0.04, [[st[0] - 0.4, dz0 + 1.3, st[1] + 0.4, sz1]], 0.6);
  // the benches along the north wall and the mounting blocks of two steps beside the gate
  for (const [a, b] of [[court[0] + 1.2, st[0] - 1.4], [st[1] + 1.4, court[2] - 1.2]]) { bag.add('brick', box(a, dy + 0.04, court[1], b, dy + 0.46, court[1] + 0.5)); bag.add(MS, box(a - 0.03, dy + 0.46, court[1], b + 0.03, dy + 0.52, court[1] + 0.54)); col.rect([a, court[1], b, court[1] + 0.5], dy, dy + 0.52); }
  for (const zz of [gz - gw - 1.6, gz + gw + 0.6]) { bag.add('brick', box(court[0], dy + 0.04, zz, court[0] + 1.0, dy + 0.4, zz + 1.0)); bag.add('brick', box(court[0], dy + 0.4, zz, court[0] + 0.5, dy + 0.76, zz + 1.0)); col.rect([court[0], zz, court[0] + 1.0, zz + 1.0], dy, dy + 0.76); }
  // the stables: two low buildings on the south side, their doors and a manger trough before them
  for (const [a, b] of el.stables) {
    const r = [a, dz1 - 0.8 - 5.0, b, dz1 - 0.8], fz = r[1];
    bag.add(PL, box(r[0], dy - 0.3, r[1], r[2], dy + 3.4, r[3])); col.rect(r, dy - 0.3, dy + 3.4);
    hipRoof(bag, r, dy + 3.4, 1.3, 0.45);
    for (let x = a + 1.8; x < b - 1; x += 3.6) {
      const d = face('z', fz, -1), dr = d.R(0, 0.06, x - 0.7, x + 0.7); bag.add('opening', box(dr[0], dy + 0.04, dr[1], dr[2], dy + 2.3, dr[3]));
      const lt = d.R(0, 0.1, x - 0.85, x + 0.85); bag.add('timber', box(lt[0], dy + 2.3, lt[1], lt[2], dy + 2.45, lt[3]));
    }
    bag.add('timber', box(a + 0.6, dy + 0.04, fz - 1.0, a + 2.6, dy + 0.55, fz - 0.6)); col.rect([a + 0.6, fz - 1.0, a + 2.6, fz - 0.6], dy, dy + 0.55);
    bag.add('ground', box(a + 0.68, dy + 0.45, fz - 0.93, a + 2.52, dy + 0.5, fz - 0.67));
  }
}

/** sultana: { rect, y, gateZ, gateW, seed } — the walled garden above the Acequia: walls, paths in a cross, myrtle-edged beds, a small pool with a fountain in the middle. */
function sultana(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y, t = 0.6, H = 3.6, rand = rng(el.seed ?? 7);
  W(bag, col, PL, [x0, z0, x1, z0 + t], y - 0.6, y + H);
  W(bag, col, PL, [x0, z1 - t, x1, z1], y - 0.6, y + H);
  const g = [el.gateZ - el.gateW / 2, el.gateZ + el.gateW / 2, y - 0.6, y + 2.9];
  holedWall(bag, col, PL, [x1 - t, z0 + t, x1, z1 - t], y - 0.6, y + H, [g], false);
  archHead(bag, face('x', x1 - t, 1), g[0], g[1], y + 1.6, y + 2.9, t, 'round', { both: true });
  for (const r of [[x0, z0, x1, z0 + t], [x0, z1 - t, x1, z1], [x1 - t, z0 + t, x1, z1 - t]]) bag.add('brick', box(r[0] - 0.03, y + H, r[1] - 0.03, r[2] + 0.03, y + H + 0.09, r[3] + 0.03));
  const I = [x0, z0 + t, x1 - t, z1 - t], cx = (I[0] + I[2]) / 2, cz = (I[1] + I[3]) / 2, pw = 0.7;
  const beds = [];
  for (const [a, b] of [[I[0] + 1.0, cx - pw], [cx + pw, I[2] - 1.0]]) for (const [c, d] of [[I[1] + 1.0, cz - pw], [cz + pw, I[3] - 1.0]]) beds.push([a, c, b, d]);
  const pool = [cx - 1.6, cz - 1.6, cx + 1.6, cz + 1.6];
  pave(bag, col, BP, I, y + 0.08, [...beds, pool], 0.4);
  bag.add(MS, box(pool[0], y - 0.3, pool[1], pool[2], y + 0.12, pool[3])); col.floor(pool, y + 0.12);
  bag.add(MS, lathe([[1.1, 0], [1.1, 0.14], [0.95, 0.14], [0.95, 0.03], [0.001, 0.03]], 20, null, cx, y + 0.12, cz));
  bag.add('water', disc(0.95, y + 0.22, 20, cx, cz));
  bag.add(MS, lathe([[0.07, 0], [0.045, 0.1], [0.001, 0.13]], 8, null, cx, y + 0.12, cz));
  jet(bag, cx, y + 0.25, cz, 0.24, y + 0.22, 0.2);
  col.circle(cx, cz, 1.1, y, y + 0.26);
  for (const r of beds) {
    bag.add('ground', box(r[0], y - 0.2, r[1], r[2], y + 0.04, r[3])); col.floor(r, y + 0.04);
    hedge(bag, [r[0], r[1], r[2], r[1] + 0.55], y + 0.04, 0.7); hedge(bag, [r[0], r[3] - 0.55, r[2], r[3]], y + 0.04, 0.7);
    hedge(bag, [r[0], r[1] + 0.6, r[0] + 0.55, r[3] - 0.6], y + 0.04, 0.7); hedge(bag, [r[2] - 0.55, r[1] + 0.6, r[2], r[3] - 0.6], y + 0.04, 0.7);
    for (let x = r[0] + 1.0; x < r[2] - 0.8; x += 1.1) for (let z = r[1] + 1.0; z < r[3] - 0.8; z += 1.1) if (Math.hypot(x - (r[0] + r[2]) / 2, z - (r[1] + r[3]) / 2) > 1.3) { shrub(bag, x, y + 0.04, z, 0.25, 0.4 + rand() * 0.2); if (rand() < 0.5) { const fy = y + 0.38; bag.add(rand() < 0.5 ? 'glaze_red' : 'glaze_white', box(x - 0.04, fy, z - 0.04, x + 0.04, fy + 0.06, z + 0.04)); } }
    const ux = (r[0] + r[2]) / 2, uz = (r[1] + r[3]) / 2;
    fruitTree(bag, ux, y + 0.04, uz, 1.1, rand); col.circle(ux, uz, 0.12, y, y + 1.4);
  }
}

/** escalera: { flights: [[x0, x1, y0, y1]], landings: [[xc, y]], z, D, sides: [z0, z1] } — the water stairway. */
function escalera(el, ctx) {
  const { bag, col } = ctx, z = el.z, hw = 0.9, pt = 0.45, ph = 0.85, r = el.D / 2, F = el.flights, L = el.landings;
  // a stretch of parapet along x from xa (top ya) to xb (top yb), its foot at yf: whitewashed, the channel of tiles in its top, water running in it
  const parapet = (xa, xb, ya, yb, yf) => {
    for (const s of [-1, 1]) {
      const zi = z + s * hw, zo = z + s * (hw + pt), zl = Math.min(zi, zo), zh = Math.max(zi, zo);
      hexa(bag, PL, [[xa, yf, zl], [xb, yf, zl], [xb, yf, zh], [xa, yf, zh]], [[xa, ya + ph - 0.1, zl], [xb, yb + ph - 0.1, zl], [xb, yb + ph - 0.1, zh], [xa, ya + ph - 0.1, zh]]);
      for (const [c0, c1] of [[0, 0.145], [pt - 0.145, pt]]) { const a = z + s * (hw + c0), b = z + s * (hw + c1), lo = Math.min(a, b), hi = Math.max(a, b); hexa(bag, PL, [[xa, ya + ph - 0.1, lo], [xb, yb + ph - 0.1, lo], [xb, yb + ph - 0.1, hi], [xa, ya + ph - 0.1, hi]], [[xa, ya + ph, lo], [xb, yb + ph, lo], [xb, yb + ph, hi], [xa, ya + ph, hi]]); }
      const a = z + s * (hw + 0.145), b = z + s * (hw + pt - 0.145), lo = Math.min(a, b), hi = Math.max(a, b);
      hexa(bag, 'terracotta', [[xa, ya + ph - 0.1, lo], [xb, yb + ph - 0.1, lo], [xb, yb + ph - 0.1, hi], [xa, ya + ph - 0.1, hi]], [[xa, ya + ph - 0.085, lo], [xb, yb + ph - 0.085, lo], [xb, yb + ph - 0.085, hi], [xa, ya + ph - 0.085, hi]]);
      hexa(bag, 'water', [[xa, ya + ph - 0.085, lo], [xb, yb + ph - 0.085, lo], [xb, yb + ph - 0.085, hi], [xa, ya + ph - 0.085, hi]], [[xa, ya + ph - 0.035, lo], [xb, yb + ph - 0.035, lo], [xb, yb + ph - 0.035, hi], [xa, ya + ph - 0.035, hi]]);
      col.rect([xa, zl, xb, zh], yf, Math.max(ya, yb) + ph);
    }
  };
  const xin = Math.sqrt(r * r - hw * hw);
  for (let k = 0; k < F.length; k++) {
    const [a, b, y0, y1] = F[k], n = Math.round((y1 - y0) / 0.16), foot = y0 - 0.4;
    for (let i = 0; i < n; i++) {
      const xa = a + (b - a) * i / n, xb = a + (b - a) * (i + 1) / n, yy = y0 + (y1 - y0) * (i + 1) / n;
      bag.add('brick', box(xa, foot, z - hw, xb, yy - 0.04, z + hw));
      bag.add(BP, box(xa - 0.03, yy - 0.04, z - hw, xb, yy, z + hw));
    }
    col.ramp([a, z - hw, b, z + hw], y0, y1, 'e');
    const xs = k > 0 ? L[k - 1][0] + xin : a, xe = k < L.length ? L[k][0] - xin : b;
    if (xs < a - 0.01) parapet(xs, a, y0, y0, foot);
    parapet(a, b, y0, y1, foot);
    if (xe > b + 0.01) parapet(b, xe, y1, y1, foot);
  }
  // the round landings: the floor, the parapet round it with its channel, the low fountain in the middle
  for (const [xc, yl] of L) {
    const foot = yl - 0.4 - 1.8;
    bag.add('brick', lathe([[r, 0], [r, 1.8 + 0.36], [0.001, 1.8 + 0.36]], 24, null, xc, foot, z));
    bag.add(BP, lathe([[r, 0], [r, 0.04], [0.001, 0.04]], 24, null, xc, yl - 0.04, z));
    col.floor([xc - r * 0.92, z - r * 0.92, xc + r * 0.92, z + r * 0.92], yl);
    col.floor([xc - r, z - hw, xc + r, z + hw], yl);
    const N = 24, seg = [];
    for (let i = 0; i < N; i++) { const t0 = i / N * Math.PI * 2, t1 = (i + 1) / N * Math.PI * 2, tm = (t0 + t1) / 2; if (Math.abs(Math.sin(tm)) < hw / r + 0.04) continue; seg.push([t0, t1]); }
    for (const [t0, t1] of seg) {
      const P = (rr, t, yy) => [xc + Math.cos(t) * rr, yy, z + Math.sin(t) * rr], R0 = r, R1 = r + pt;
      hexa(bag, PL, [P(R0, t0, foot), P(R1, t0, foot), P(R1, t1, foot), P(R0, t1, foot)], [P(R0, t0, yl + ph - 0.1), P(R1, t0, yl + ph - 0.1), P(R1, t1, yl + ph - 0.1), P(R0, t1, yl + ph - 0.1)]);
      for (const [c0, c1] of [[0, 0.145], [pt - 0.145, pt]]) hexa(bag, PL, [P(R0 + c0, t0, yl + ph - 0.1), P(R0 + c1, t0, yl + ph - 0.1), P(R0 + c1, t1, yl + ph - 0.1), P(R0 + c0, t1, yl + ph - 0.1)], [P(R0 + c0, t0, yl + ph), P(R0 + c1, t0, yl + ph), P(R0 + c1, t1, yl + ph), P(R0 + c0, t1, yl + ph)]);
      const c0 = 0.145, c1 = pt - 0.145;
      hexa(bag, 'terracotta', [P(R0 + c0, t0, yl + ph - 0.1), P(R0 + c1, t0, yl + ph - 0.1), P(R0 + c1, t1, yl + ph - 0.1), P(R0 + c0, t1, yl + ph - 0.1)], [P(R0 + c0, t0, yl + ph - 0.085), P(R0 + c1, t0, yl + ph - 0.085), P(R0 + c1, t1, yl + ph - 0.085), P(R0 + c0, t1, yl + ph - 0.085)]);
      hexa(bag, 'water', [P(R0 + c0, t0, yl + ph - 0.085), P(R0 + c1, t0, yl + ph - 0.085), P(R0 + c1, t1, yl + ph - 0.085), P(R0 + c0, t1, yl + ph - 0.085)], [P(R0 + c0, t0, yl + ph - 0.035), P(R0 + c1, t0, yl + ph - 0.035), P(R0 + c1, t1, yl + ph - 0.035), P(R0 + c0, t1, yl + ph - 0.035)]);
      const m = (t0 + t1) / 2; col.circle(xc + Math.cos(m) * (r + pt / 2), z + Math.sin(m) * (r + pt / 2), pt * 0.6, foot, yl + ph);
    }
    bag.add(MS, lathe([[0.5, 0], [0.5, 0.22], [0.4, 0.22], [0.4, 0.08], [0.001, 0.08]], 16, null, xc, yl, z));
    bag.add('water', disc(0.4, yl + 0.18, 16, xc, z));
    bag.add(MS, lathe([[0.05, 0], [0.035, 0.12], [0.001, 0.15]], 8, null, xc, yl + 0.08, z));
    jet(bag, xc, yl + 0.23, z, 0.16, yl + 0.18, 0.12);
    col.circle(xc, z, 0.5, yl, yl + 0.22);
  }
  // the low walls between the terraces beside the stair, on the upper terrace's edge
  for (const [x, yu, yd] of el.steps || []) for (const [za, zb] of [[el.sides[0], z - hw - pt + 0.02], [z + hw + pt - 0.02, el.sides[1]]]) {
    const near = Math.abs(za - z) < 3 ? 0 : 0;
    void near; W(bag, col, PL, [x, za, x + 0.5, zb], yd - 0.4, yu + 0.45); bag.add('brick', box(x - 0.03, yu + 0.45, za, x + 0.53, yu + 0.53, zb));
  }
}

/** gen_oratory: { rect, y, door ('w') } — the small oratory at the head of the stairway: whitewashed, the mihrab in its east wall, a star ceiling of cedar. */
function oratory(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y, t = 0.6, H = 4.4, I = [x0 + t, z0 + t, x1 - t, z1 - t], zc = (z0 + z1) / 2;
  const door = [zc - 0.65, zc + 0.65, y, y + 2.6], mih = [zc - 0.45, zc + 0.45, y + 0.3, y + 2.2], win = [[(x0 + x1) / 2 - 0.3, (x0 + x1) / 2 + 0.3, y + 1.6, y + 2.6]];
  holedWall(bag, col, PL, [x0, z0, x0 + t, z1], y - 0.6, y + H, [door], false);
  holedWall(bag, col, PL, [x1 - t, z0, x1, z1], y - 0.6, y + H, [mih], false);
  holedWall(bag, col, PL, [x0 + t, z0, x1 - t, z0 + t], y - 0.6, y + H, win, true);
  holedWall(bag, col, PL, [x0 + t, z1 - t, x1 - t, z1], y - 0.6, y + H, win, true);
  archHead(bag, face('x', x0, 1), door[0], door[1], y + 1.8, y + 2.6, t, 'horseshoe', { both: true });
  // the mihrab: a niche through the wall closed behind by its projecting back, a horseshoe arch in an alfiz
  bag.add(PL, box(x1, y - 0.6, mih[0] - 0.3, x1 + 0.5, y + 3.0, mih[1] + 0.3)); col.rect([x1, mih[0] - 0.3, x1 + 0.5, mih[1] + 0.3], y - 0.6, y + 3.0);
  bag.add(SW, box(x1 - 0.02, mih[2], mih[0], x1 + 0.02, mih[3], mih[1]));
  archHead(bag, face('x', I[2], 1), mih[0], mih[1], y + 1.6, y + 2.2, t, 'horseshoe', { side: 'near' });
  for (const f of [face('z', z0 + t, 1), face('z', z1 - t, -1)]) { const o = f.R(t * 0.5 - 0.01, t * 0.5 + 0.01, win[0][0], win[0][1]); bag.add('lattice', box(o[0], win[0][2], o[1], o[2], win[0][3], o[3])); }
  tileFloor(bag, col, I, y);
  bag.add(MS, box(x0, y - 0.3, door[0], x0 + t, y + 0.05, door[1])); col.floor([x0, door[0], x0 + t, door[1]], y + 0.05);
  dress(bag, face('x', I[0], 1), I[1], I[3], y, y + 3.4, [door], { band: false }); dress(bag, face('x', I[2], -1), I[1], I[3], y, y + 3.4, [mih], { band: false });
  dress(bag, face('z', I[1], 1), I[0], I[2], y, y + 3.4, win, { band: false }); dress(bag, face('z', I[3], -1), I[0], I[2], y, y + 3.4, win, { band: false });
  starCeiling(bag, I, y + 3.4);
  bag.add(PL, box(x0, y + H, z0, x1, y + H + 0.12, z1));
  hipRoof(bag, [x0, z0, x1, z1], y + H + 0.12, 2.0, 0.35);
  // a reed mat before the mihrab
  bag.add('reed_mat', box(I[0] + 0.6, y + 0.05, I[1] + 0.5, I[2] - 0.15, y + 0.07, I[3] - 0.5));
}

/**
 * paratas: { terraces: [{ r, y }], walls: [[rect, y0, y1]], stairs: [{ rect, y0, y1, dir }], veg: [rect at y], channels: [[x0, z0, x1, z1, y]], seed } —
 * the orchard and kitchen-garden terraces: their retaining walls of rammed earth, the stairs between them,
 * the beds of vegetables in ridges watered by a runnel along the terrace, the little channels.
 */
function paratas(el, ctx) {
  const { bag, col } = ctx, rand = rng(el.seed ?? 3);
  for (const [r, y0, y1] of el.walls) { W(bag, col, RED, r, y0, y1); bag.add('brick', box(r[0] - 0.04, y1, r[1] - 0.04, r[2] + 0.04, y1 + 0.09, r[3] + 0.04)); }
  for (const s of el.stairs) {
    const [x0, z0, x1, z1] = s.rect, n = Math.round((s.y1 - s.y0) / 0.17), alongX = s.dir === 'e' || s.dir === 'w', L = alongX ? x1 - x0 : z1 - z0;
    for (let k = 0; k < n; k++) {
      const f0 = k / n, f1 = (k + 1) / n, yy = s.y0 + (s.y1 - s.y0) * f1;
      const q = s.dir === 'e' ? [x0 + L * f0, z0, x0 + L * f1, z1] : s.dir === 'w' ? [x1 - L * f1, z0, x1 - L * f0, z1] : s.dir === 's' ? [x0, z0 + L * f0, x1, z0 + L * f1] : [x0, z1 - L * f1, x1, z1 - L * f0];
      bag.add('brick', box(q[0], s.y0 - 0.4, q[1], q[2], yy, q[3]));
    }
    col.ramp(s.rect, s.y0, s.y1, s.dir);
  }
  // the kitchen beds: ridges of earth with a row of leafy plants on each, a furrow of water between some
  for (const v of el.veg) {
    const [x0, z0, x1, z1] = v.r, y = v.y, along = v.along ?? 'x';
    const n = Math.floor(((along === 'x' ? z1 - z0 : x1 - x0)) / 0.9);
    for (let i = 0; i < n; i++) {
      const c = (along === 'x' ? z0 : x0) + (i + 0.5) * 0.9;
      const rr = along === 'x' ? [x0, c - 0.26, x1, c + 0.26] : [c - 0.26, z0, c + 0.26, z1];
      hexa(bag, 'ground', [[rr[0], y - 0.08, rr[1]], [rr[2], y - 0.08, rr[1]], [rr[2], y - 0.08, rr[3]], [rr[0], y - 0.08, rr[3]]],
        along === 'x' ? [[rr[0], y + 0.16, rr[1] + 0.12], [rr[2], y + 0.16, rr[1] + 0.12], [rr[2], y + 0.16, rr[3] - 0.12], [rr[0], y + 0.16, rr[3] - 0.12]] : [[rr[0] + 0.12, y + 0.16, rr[1]], [rr[2] - 0.12, y + 0.16, rr[1]], [rr[2] - 0.12, y + 0.16, rr[3]], [rr[0] + 0.12, y + 0.16, rr[3]]]);
      const kind = (i + (v.seed ?? 0)) % 4, step = kind === 1 ? 0.9 : 0.55;
      const len = along === 'x' ? x1 - x0 : z1 - z0;
      for (let u = 0.35; u < len - 0.25; u += step) {
        const px = along === 'x' ? x0 + u : c, pz = along === 'x' ? c : z0 + u;
        if (kind === 1) {
          // artichokes: a big grey-green clump
          bag.add(LEAF, lathe([[0.001, 0], [0.32, 0.08], [0.42, 0.3], [0.3, 0.55], [0.001, 0.62]], 7, (th) => 1 + 0.2 * Math.sin(th * 5), px, y + 0.14, pz));
        } else if (kind === 3) {
          // beans on canes
          bag.add('timber', rod([px, y + 0.1, pz], [px, y + 1.5, pz], 0.012, 3));
          bag.add(LEAF, lathe([[0.001, 0], [0.13, 0.2], [0.11, 0.9], [0.001, 1.25]], 5, null, px, y + 0.15, pz));
        } else {
          // chard and cabbages: low rosettes
          const h = kind === 0 ? 0.32 : 0.24, w = kind === 0 ? 0.2 : 0.24;
          bag.add(LEAF, lathe([[0.001, 0], [w * 0.8, h * 0.3], [w, h * 0.7], [w * 0.4, h], [0.001, h * 0.9]], 6, null, px + (rand() - 0.5) * 0.06, y + 0.14, pz));
        }
      }
    }
  }
  for (const [x0, z0, x1, z1, y] of el.channels) {
    bag.add('brick', box(x0, y - 0.35, z0, x1, y + 0.05, z1));
    const alongX = x1 - x0 > z1 - z0, w = alongX ? [x0, (z0 + z1) / 2 - 0.12, x1, (z0 + z1) / 2 + 0.12] : [(x0 + x1) / 2 - 0.12, z0, (x0 + x1) / 2 + 0.12, z1];
    bag.add('water', box(w[0], y - 0.12, w[1], w[2], y + 0.07, w[3]));
    col.rect([x0, z0, x1, z1], y - 0.35, y + 0.05);
  }
  for (const [x, z, y] of el.baskets || []) {
    bag.add('wicker', lathe([[0.001, 0], [0.2, 0.01], [0.24, 0.26], [0.26, 0.3], [0.23, 0.3], [0.21, 0.04], [0.001, 0.04]], 10, null, x, y, z));
    for (let k = 0; k < 6; k++) { const a = rand() * 6.28, rr = rand() * 0.14; bag.add(LEAF, box(x + Math.cos(a) * rr - 0.06, y + 0.2, z + Math.sin(a) * rr - 0.06, x + Math.cos(a) * rr + 0.06, y + 0.31, z + Math.sin(a) * rr + 0.06)); }
  }
}

export const GENERALIFE = { gen_wall: genWall, gen_risers: genRisers, gen_postern: postern, acequia, gen_north: genNorth, gen_south: genSouth, gen_courts: genCourts, sultana, escalera, gen_oratory: oratory, paratas };
