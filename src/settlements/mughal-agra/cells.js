// The forecourt's bazaar cells, opened for the visitor (docs/settlements/mughal-agra.md §17.1). Three elements of the style `mughal`:
//   agra_row     the row's shell, the shared bazaar row's own form (cells behind an arcaded verandah on Shah Jahani columns) with the doors of
//                the cells nearest the axis cut 1.7 m wide and left open (the walker's raster needs 1.5 m); the others stay as they were
//   agra_cells   (a near plan) what stands in the opened cells: the keeper's dais, the shelves with the trade's goods, a hanging lamp,
//                the keeper himself (built in, not placed as street life: a life figure reaches 170 m), the colliders
//   agra_plates  (a far plan) one dark board in each opened doorway, so that the cell reads closed from afar, as the others do
// Pure data (ROWS, cells, trades, routes) and the builders; registered in STYLES.mughal when imported (plan.js, town.js).

import { Shape, ExtrudeGeometry } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { box, lathe, rod } from '../../core/geom.js';
import { FORECOURT } from './layout.js';
import '../../styles/mughal/index.js';
import * as F from '../../styles/mughal/furnish.js';

const W = 'marble_smooth', R = 'sandstone_red', PY = 0.35;
export const BZ = 200, BW = 4.5;
export const OPEN_N = 8;                                   // cells opened at the axis end of each row
const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };

/** The four rows of the two bazaar streets: { id, sx, sz, x0, x1, z (verandah front), facing, s, n, bw, open: [k0, k1) }. */
export function rows() {
  const [fx0, , fx1] = FORECOURT, out = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x0 = sx < 0 ? fx0 + 4.2 : 48, x1 = sx < 0 ? -48 : fx1 - 4.2, n = Math.max(1, Math.round((x1 - x0) / 3.2)), s = sz < 0 ? 1 : -1;
    out.push({ id: `${sx < 0 ? 'w' : 'e'}${sz < 0 ? 'n' : 's'}`, sx, sz, x0, x1, z: BZ + sz * BW, facing: s > 0 ? 's' : 'n', s, n, bw: (x1 - x0) / n, open: sx > 0 ? [0, OPEN_N] : [n - OPEN_N, n] });
  }
  return out;
}
/** The opened cells of a row: [{ k, xc, zc (the door plane's inner face), zb (the back wall's inner face) }]. */
export function cells(r, V = 3, D = 4) {
  const out = [];
  for (let k = r.open[0]; k < r.open[1]; k++) out.push({ k, xc: r.x0 + (k + 0.5) * r.bw, zc: r.z - r.s * V, zb: r.z - r.s * (V + D) + r.s * 0.5 });
  return out;
}
/** The trades of the cells (the forecourt's cells "were used to sell goods", Wikipedia; the trades are ours): by the cell's own place. */
export const TRADES = ['cloth', 'carpets', 'brass', 'grain', 'pots', 'attar'];
/** A cell's trade, spread over the row so that no two neighbours are alike: by the row and the cell. */
export function trade(r, k) { return TRADES[(k * 5 + (r.sx > 0 ? 0 : 2) + (r.sz > 0 ? 1 : 0)) % TRADES.length]; }

/** The route into each opened cell: from the middle of the street, up the two steps, through the door and 2.4 m in. */
export function cellRoutes() {
  const out = [];
  for (const r of rows()) for (const c of cells(r)) {
    const street = r.z - r.s * -1.8, z = (d) => c.zc - r.s * d;
    const w = [[c.xc, street], [c.xc, r.z + r.s * 0.4], [c.xc, c.zc + r.s * 0.9], [c.xc, z(0.5)], [c.xc, z(1.6)], [c.xc, z(2.4)]];
    w.y0 = 0; out.push(w);
  }
  return out;
}

// ── the row's shell ─────────────────────────────────────────────────────────────────────────────────────────
/** The intrados of a multi-cusped (engrailed) pointed arch from (s0, ys) to (s1, ys), as points [s, y] (the ends excluded): n lobes of `depth`. */
function cuspedArc(s0, s1, ys, n = 7, depth = 0.09) {
  const w = s1 - s0, r = w * 0.62, rise = Math.sqrt(r * r - (r - w / 2) ** 2), cL = s0 + r, cR = s1 - r, cs = (s0 + s1) / 2, cy = ys + rise * 0.35;
  const base = (t) => { const s = s0 + w * t; return [s, ys + Math.sqrt(Math.max(0, r * r - (s - (t <= 0.5 ? cL : cR)) ** 2))]; };
  const S = Array.from({ length: 121 }, (_, i) => base(i / 120)), D = [0];
  for (let i = 1; i < S.length; i++) D.push(D[i - 1] + Math.hypot(S[i][0] - S[i - 1][0], S[i][1] - S[i - 1][1]));
  const at = (d) => { let i = 1; while (i < D.length - 1 && D[i] < d) i++; const g = (d - D[i - 1]) / (D[i] - D[i - 1] || 1); return [S[i - 1][0] + (S[i][0] - S[i - 1][0]) * g, S[i - 1][1] + (S[i][1] - S[i - 1][1]) * g]; };
  const P = [], tot = D[D.length - 1];
  for (let k = 0; k < n; k++) for (let j = k ? 0 : 1; j <= 6; j++) {
    if (k === n - 1 && j === 6) break;
    const q = at(tot * (k + j / 6) / n), out = [q[0] - cs, q[1] - cy], ol = Math.hypot(...out) || 1, b = Math.sin(Math.PI * j / 6) * depth;
    P.push([q[0] + out[0] / ol * b, q[1] + out[1] / ol * b]);
  }
  return P;
}
/** A Shah Jahani column at (x, z) from y up to yc: a cusped square base, a faceted tapering shaft, a bell capital under an impost block. */
function shahColumn(bag, col, x, y, z, yc, r = 0.15, mat = R) {
  bag.add(mat, box(x - r * 1.7, y, z - r * 1.7, x + r * 1.7, y + 0.12, z + r * 1.7));
  bag.add(mat, lathe([[r * 1.55, 0], [r * 1.5, 0.08], [r * 1.15, 0.22], [r * 1.25, 0.3], [r * 1.0, 0.36]], 8, (th) => 1 + 0.12 * Math.abs(Math.cos(th * 2)), x, y + 0.12, z));
  const hs = yc - y - 0.86;
  bag.add(mat, lathe([[r, 0], [r * 0.82, hs]], 12, null, x, y + 0.48, z));
  for (const f of [0.33, 0.66]) bag.add(mat, lathe([[r * (1 - 0.18 * f) + 0.02, 0], [r * (1 - 0.18 * f) + 0.02, 0.06], [0.001, 0.06]], 12, null, x, y + 0.48 + hs * f, z));
  bag.add(mat, lathe([[r * 0.82, 0], [r * 0.95, 0.06], [r * 0.8, 0.12], [r * 1.25, 0.28], [r * 1.5, 0.32], [0.001, 0.32]], 12, (th) => 1 + 0.1 * Math.abs(Math.cos(th * 4)), x, y + 0.48 + hs, z));
  bag.add(mat, box(x - r * 1.6, yc - 0.06, z - r * 1.6, x + r * 1.6, yc, z + r * 1.6));
  if (col) col.circle(x, z, r * 1.3, y, yc);
}

/**
 * agra_row: the shared bazaar row ({ x0, x1, z, facing, cell, deep, ver, h }) with the cells `open: [k0, k1)` cut for the walker: their doors 1.7 m wide
 * (the others 1.4) and no dark board in them (agra_plates, a far plan, puts one there from afar).
 */
function agraRow(el, { bag, col }) {
  const { x0, x1, z } = el, s = el.facing === 's' ? 1 : -1, cw = el.cell ?? 3.2, D = el.deep ?? 4, V = el.ver ?? 3, H = el.h ?? 5.0, py = PY;
  const n = Math.max(1, Math.round((x1 - x0) / cw)), bw = (x1 - x0) / n, zf = z, zc = z - s * V, zb = z - s * (V + D), [o0, o1] = el.open ?? [0, 0];
  const zr = (a, b) => [Math.min(a, b), Math.max(a, b)];
  const bx = (xa, xb, za, zb2, ya, yb, m) => { const [p, q] = zr(za, zb2); bag.add(m, box(xa, ya, p, xb, yb, q)); };
  bx(x0, x1, zf + s * 0.05, zb, 0, py, R); { const [p, q] = zr(zf + s * 0.05, zb); col.floor([x0, p, x1, q], py); }
  for (let i = 0; i < 2; i++) bx(x0 + 0.02, x1 - 0.02, zf + s * (0.05 + 0.3 * (i + 1)), zf + s * (0.05 + 0.3 * i), 0, py * (2 - i) / 3, R);
  bx(x0, x1, zb, zb + s * 0.5, py, H, R); { const [p, q] = zr(zb, zb + s * 0.5); col.rect([x0, p, x1, q], py, H); }
  const dh = 2.5;
  for (let k = 0; k <= n; k++) {
    const xp = x0 + k * bw;
    bx(Math.max(x0, xp - 0.18), Math.min(x1, xp + 0.18), zb + s * 0.5, zc, py, H, R); { const [p, q] = zr(zb, zc); col.rect([Math.max(x0, xp - 0.18), p, Math.min(x1, xp + 0.18), q], py, H); }
    if (k === n) break;
    const xc = xp + bw / 2, open = k >= o0 && k < o1, dw = open ? 1.7 : 1.4;
    for (const [a, b] of [[xp + 0.18, xc - dw / 2], [xc + dw / 2, xp + bw - 0.18]]) { bx(a, b, zc, zc + s * 0.45, py, H, 'lime_plaster'); const [p, q] = zr(zc, zc + s * 0.45); col.rect([a, p, b, q], py, H); }
    bx(xc - dw / 2, xc + dw / 2, zc, zc + s * 0.45, py + dh, H, 'lime_plaster');
    bx(xc - dw / 2 - 0.12, xc + dw / 2 + 0.12, zc + s * 0.45, zc + s * 0.5, py + dh, py + dh + 0.14, R);
    if (!open) bx(xc - dw / 2, xc + dw / 2, zb + s * 0.52, zb + s * 0.56, py, py + dh, 'lacquer_black');
    for (const sg of [-1, 1]) {
      // (the leaves of an opened door fold back against the reveal, clear of the doorway: 0.22 wide, not the 0.58 of a shut one's)
      const a = xc + sg * (dw / 2 + 0.04), b = xc + sg * (dw / 2 + (open ? 0.5 : 0.62));
      bx(Math.min(a, b), Math.max(a, b), zc + s * 0.45, zc + s * 0.51, py + 0.02, py + dh - 0.05, 'wood_dark');
    }
  }
  bx(x0, x1, zb, zf, H, H + 0.4, R);
  bx(x0 - 0.3, x1 + 0.3, zf - s * 0.2, zf + s * 0.7, H - 0.1, H + 0.04, R);
  for (let k = 0; k <= n; k++) { const xp = x0 + k * bw; bx(xp - 0.08, xp + 0.08, zf, zf + s * 0.6, H - 0.45, H - 0.1, R); }
  bx(x0, x1, zf - s * 0.1, zf + s * 0.15, H + 0.4, H + 0.85, R);
  for (let xx = x0 + 0.4; xx < x1 - 0.2; xx += 0.8) bx(xx - 0.22, xx + 0.22, zf - s * 0.08, zf + s * 0.13, H + 0.85, H + 1.2, R);
  const yc = py + 2.4, ys = yc;
  for (let k = 0; k <= n; k++) shahColumn(bag, col, x0 + k * bw, py, zf - s * 0.2, yc);
  for (let k = 0; k < n; k++) {
    const xa = x0 + k * bw, xb = xa + bw, ci = 0.25, sh = new Shape();
    sh.moveTo(xa, ys); sh.lineTo(xa + ci, ys);
    for (const [u, v] of cuspedArc(xa + ci, xb - ci, ys, 7, 0.08)) sh.lineTo(u, v);
    sh.lineTo(xb - ci, ys); sh.lineTo(xb, ys); sh.lineTo(xb, H); sh.lineTo(xa, H); sh.lineTo(xa, ys);
    const g = new ExtrudeGeometry(sh, { depth: 0.34, bevelEnabled: false, curveSegments: 4 });
    g.translate(0, 0, zf - s * 0.2 - 0.17);
    bag.add(R, g);
    const zz = zf - s * 0.2 + s * 0.17;
    for (const [xr, yr] of [[xa + bw * 0.16, H - 0.42], [xb - bw * 0.16, H - 0.42]]) bx(xr - 0.11, xr + 0.11, zz, zz + s * 0.02, yr - 0.11, yr + 0.11, W);
    bx(xa + 0.1, xb - 0.1, zz, zz + s * 0.02, H - 0.14, H - 0.08, W);
  }
}

// ── what stands in an opened cell ───────────────────────────────────────────────────────────────────────────
// (the large pieces of a cell — dais, boards, rugs, bolts, sacks — use seven materials only, so that the near plans add few draws: DESIGN §8)
const CLOTH = ['cloth_red', 'cloth_white', 'cloth_red'];
/** A grain sack, mouth rolled down, the grain showing (a lathe in the palette's cloth and terracotta). */
function sack(bag, x, y, z, k = 1) {
  bag.add('cloth_white', lathe([[0.001, 0], [0.17 * k, 0], [0.2 * k, 0.08 * k], [0.2 * k, 0.3 * k], [0.23 * k, 0.34 * k], [0.22 * k, 0.38 * k], [0.17 * k, 0.36 * k], [0.001, 0.36 * k]], 10, null, x, y, z));
  bag.add('terracotta', lathe([[0.17 * k, 0], [0.12 * k, 0.05 * k], [0.001, 0.08 * k]], 10, null, x, y + 0.35 * k, z));
}
/** A phial of attar (itr): a small glass bottle with a long neck and a stopper, in the glazes the palette has. */
function phial(bag, x, y, z, k = 1, mat = 'glaze_blue') {
  bag.add(mat, lathe([[0.001, 0], [0.035 * k, 0], [0.05 * k, 0.04 * k], [0.045 * k, 0.09 * k], [0.018 * k, 0.12 * k], [0.016 * k, 0.2 * k], [0.022 * k, 0.21 * k], [0.001, 0.21 * k]], 8, null, x, y, z));
  bag.add('bronze', lathe([[0.001, 0], [0.016 * k, 0], [0.012 * k, 0.04 * k], [0.001, 0.05 * k]], 6, null, x, y + 0.21 * k, z));
}
/** The keeper of a cell: a man in the jama and a turban seated cross-legged on his dais, facing the street (a figure spec for STYLES.life.elements.figure). */
function keeperOf(seed, at, y, rot) {
  const r = rng(seed), pick = (a) => a[Math.floor(r() * a.length)];
  return { t: 'figure', at, y, rot, seed: Math.floor(r() * 1e9), skin: r() < 0.7 ? 'skin_medium' : 'skin_dark', dress: 'robe', cloth: pick(['cloth_white', 'cloth_white', 'cloth_ochre', 'cloth_indigo']), cloth2: pick(['cloth_red', 'cloth_green', 'cloth_ochre', 'cloth_white']),
    over: 'sash', hat: 'turban', hatMat: pick(['cloth_white', 'cloth_red', 'cloth_ochre']), hair: 'short', beard: r() < 0.7, pose: 'cross' };
}
/**
 * agra_cells: { row: { x0, x1, z, facing, ... }, open: [k0, k1), cell, deep, ver, h }. Each opened cell: the platform's dhurrie, the keeper on his dais (a white sheet,
 * a bolster, a ledger on its rahle, a hookah), shelves on both partitions (boards on posts, the trade's goods on them), the trade's goods on the floor under them,
 * beams under the ceiling with a brass lamp hung from the middle one. The lane from the door is 1.7 m wide and clear to the dais.
 */
function agraCells(el, { bag, col }) {
  const r = el.row, s = r.s, V = el.ver ?? 3, D = el.deep ?? 4, H = el.h ?? 5.0, y0 = PY, hw = r.bw / 2 - 0.18, keepers = [];
  for (const c of cells(r, V, D)) {
    const T = trade(r, c.k), at = (u, v) => [c.xc + u, c.zc - s * v], rc = rng(Math.imul(c.k + 1, 7919) ^ Math.imul(r.sx * 31 + r.sz * 17, 104729));
    // yaw 0 turns a piece's own +x along +x; `back` turns one to face the door
    const back = s > 0 ? Math.PI : 0;
    // the keeper's dais across the back: a low platform with a white sheet, the bolster at the wall
    const dv0 = D - 0.5 - 1.05, dv1 = D - 0.5 - 0.05, dw = 1.9;
    const rect = (u0, v0, u1, v1) => { const a = at(u0, v0), b = at(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
    const ob = (u0, v0, u1, v1, ya, yb, m) => { const q = rect(u0, v0, u1, v1); bag.add(m, box(q[0], ya, q[1], q[2], yb, q[3])); return q; };
    const dq = ob(-dw / 2, dv0, dw / 2, dv1, y0, y0 + 0.17, 'wood_dark'); col.rect(dq, y0, y0 + 0.17);
    ob(-dw / 2 + 0.03, dv0 + 0.03, dw / 2 - 0.03, dv1 - 0.03, y0 + 0.17, y0 + 0.182, 'cloth_white');
    { const [bx, bz] = at(0.1, dv1 - 0.2); F.bolster(bag, bx, y0 + 0.182, bz, 1.5, 0.12, 0, 'cloth_red', 'cloth_red'); }
    { const [rx, rz] = at(0.75, dv0 + 0.35); F.rahle(bag, rx, y0 + 0.182, rz, back); }
    { const [hx, hz] = at(-0.78, dv0 + 0.3); F.hookah(bag, hx, y0 + 0.182, hz, back); }
    { const [kx, kz] = at(0.1, dv0 + 0.5); keepers.push(keeperOf(Math.imul(c.k + 5, 6700417) ^ (r.sx * 977 + r.sz * 113 + 1), [kx, kz], y0 + 0.182, back)); }
    // a niche in the back wall with an oil lamp, over the dais's corner
    { const [nx, nz] = at(-0.9, D - 0.5 - 0.02); ob(-1.2, D - 0.5 - 0.3, -0.62, D - 0.5, y0 + 1.5, y0 + 1.56, 'wood_dark'); F.oilLamp(bag, null, nx, y0 + 1.56, at(-0.9, D - 0.5 - 0.17)[1], 'terracotta', 0); }
    // the dhurrie on the floor between the door and the dais (not in the lane's middle: the lane is a 1.7 m way, the rug is on it, flat)
    { const [dx, dz] = at(0, 1.2); F.kilim(bag, dx, y0, dz, 1.6, 2.0, 0, [CLOTH[c.k % 2], 'cloth_white', CLOTH[(c.k + 1) % 2], 'cloth_white']); }
    // the shelves on the two partitions: three boards on posts, 0.3 deep, from 0.5 to 2.2 m in; collider as a thin wall
    for (const sg of [-1, 1]) {
      const u0 = sg * hw, u1 = sg * (hw - 0.3), v0 = 0.5, v1 = 2.3, ub = Math.min(u0, u1), uc = Math.max(u0, u1);
      for (const hh of [0.62, 1.18, 1.74]) ob(ub, v0, uc, v1, y0 + hh, y0 + hh + 0.035, 'wood_dark');
      for (const v of [v0 + 0.03, v1 - 0.06]) ob(ub, v, uc, v + 0.04, y0, y0 + 1.78, 'wood_dark');
      col.rect(rect(ub, v0, uc, v1), y0, y0 + 1.8);
      // the goods on the boards, by the trade; the floor under the lowest board
      const gu = sg * (hw - 0.16), yaw = sg > 0 ? Math.PI / 2 : -Math.PI / 2;
      const along = (v) => at(gu, v);
      for (let i = 0; i < 3; i++) {
        const hh = [0.655, 1.215, 1.775][i], v = 1.4 + (i % 2) * 0.05, [gx, gz] = along(v);
        if (T === 'cloth') { F.bolts(bag, gx, y0 + hh, gz, 4 + (i + c.k) % 2, yaw + (s > 0 ? Math.PI : 0), CLOTH, 0.5); const [hx, hz] = along(v - 0.62); F.bolts(bag, hx, y0 + hh, hz, 3, yaw, CLOTH.slice().reverse(), 0.5); }
        else if (T === 'carpets') { const [hx, hz] = along(v); F.bolts(bag, hx, y0 + hh, hz, 4, yaw, ['cloth_red', 'cloth_white', 'cloth_red'], 0.5); }
        else if (T === 'brass') F.copperware(bag, gx, y0 + hh, gz, yaw, c.k * 7 + i + sg + 5, 4);
        else if (T === 'grain') { for (const dv of [-0.5, 0.5]) { const [hx, hz] = along(v + dv); bag.add('bronze', lathe([[0.001, 0], [0.06, 0], [0.08, 0.1], [0.075, 0.11], [0.001, 0.03]], 8, null, hx, y0 + hh, hz)); bag.add(['terracotta', 'cloth_red'][(i + c.k) % 2], lathe([[0.075, 0.05], [0.05, 0.12], [0.001, 0.14]], 8, null, hx, y0 + hh, hz)); } }
        else if (T === 'pots') F.pots(bag, gx, y0 + hh, gz, yaw, 5, ['terracotta', 'glaze_blue', 'glaze_green', 'terracotta', 'glaze_white']);
        else for (let j = 0; j < 5; j++) { const [hx, hz] = along(v - 0.6 + j * 0.3); phial(bag, hx, y0 + hh, hz, 1, ['glaze_blue', 'glaze_green', 'glaze_white', 'glaze_blue', 'glaze_green'][(i + j + c.k) % 5]); }
      }
      // on the floor under the shelf
      const [fx, fz] = at(sg * (hw - 0.22), 1.4);
      if (T === 'grain') for (let q = 0; q < 4; q++) { const [sx2, sz2] = at(sg * (hw - 0.22), 0.95 + q * 0.4); sack(bag, sx2, y0, sz2, 1); }
      else if (T === 'pots') F.waterJar(bag, fx, y0, fz, 0.7);
      else if (T === 'carpets') F.rolledCarpets(bag, fx, y0, fz, 3, 1.1, yaw, ['cloth_red', 'cloth_white', 'cloth_red', 'cloth_white']);
      else if (T === 'brass') { const [qx, qz] = at(sg * (hw - 0.22), 1.1); bag.add('bronze', lathe([[0.001, 0], [0.12, 0], [0.19, 0.08], [0.2, 0.2], [0.17, 0.26], [0.19, 0.28], [0.17, 0.285], [0.15, 0.27], [0.001, 0.25]], 14, null, qx, y0, qz)); }
      else F.cushion(bag, fx, y0, fz, 0.9, 0.5, 0.45, yaw, 'cloth_white');   // a bale of cloth
    }
    // beams under the ceiling, and from the middle one a brass lamp on a chain
    for (const v of [0.7, 1.85, 2.95]) ob(-hw, v - 0.07, hw, v + 0.07, y0 + H - PY - 0.3, y0 + H - PY - 0.12, 'wood_dark');
    { const [lx, lz] = at(0, 1.85); const top = y0 + H - PY - 0.3;
      bag.add('wood_dark', rod([lx, top, lz], [lx, top - 1.72, lz], 0.006, 3));
      bag.add('bronze', lathe([[0.001, 0], [0.07, 0], [0.11, 0.05], [0.12, 0.09], [0.09, 0.1], [0.001, 0.04]], 10, null, lx, top - 1.87, lz));
      bag.add('lamp_white', lathe([[0.012, 0], [0.018, 0.025], [0.01, 0.07], [0.001, 0.09]], 6, null, lx, top - 1.8, lz)); }
  }
  // the keepers, built in (a life figure's reach is 170 m): after the cells, as each cell recorded its own
  if (STYLES.life?.elements?.figure) for (const k of keepers) STYLES.life.elements.figure({ ...k }, { bag, col });
}

/** agra_plates: the far form of the opened cells: one dark board in each doorway. */
function agraPlates(el, { bag }) {
  const r = el.row, s = r.s, V = el.ver ?? 3, D = el.deep ?? 4;
  for (const c of cells(r, V, D)) {
    const za = c.zc - s * 0.6, a = Math.min(za, za - s * 0.04), b = Math.max(za, za - s * 0.04);
    bag.add('lacquer_black', box(c.xc - 0.85, PY, a, c.xc + 0.85, PY + 2.5, b));
  }
}

STYLES.mughal.elements.agra_row = agraRow;
STYLES.mughal.elements.agra_cells = agraCells;
STYLES.mughal.elements.agra_plates = agraPlates;
export { agraRow, agraCells, agraPlates };
