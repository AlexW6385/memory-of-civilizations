// The covered market of the quarter (docs/settlements/ottoman-istanbul.md §11): an old bedesten after the Old Bedesten
// of the Grand Bazaar (43.3 × 29.5 m, three rows of five bays, each under a dome, on two rows of four stone piers; four
// gates; high windows; poor light) [stated: Wikipedia "Grand Bazaar, Istanbul"], and the vaulted lanes of shops that run
// to its gates, each lane a trade. Ours: lanes 4.6 m clear between rows of shops 2.4 m wide and 2.6 deep (the Grand
// Bazaar's stalls are smaller, the Süleymaniye's arasta shops bigger [stated]), the lane under a pointed barrel vault
// of lead over stucco with square light wells (lantern posts, daylight between them); where lanes cross, a groin vault;
// at free ends a gate of cut stone with its leaves folded back [inferred: the form; the vaulting of the lanes is the
// Süleymaniye arasta's; the Grand Bazaar's own streets were roofed later, after the fires of 1696 and 1700]. No lamps
// (no artificial light was allowed in the bazaar) [stated].

import { box, lathe, rod } from '../../core/geom.js';
import { dblT, bayDome, arcadeWall } from './index.js';

const S = 'limestone';
/** The height of the pointed vault's intrados over its springing at offset u from the axis (lane width w). */
// (the arch's left half is a circle centred at +cL, mirrored for the right half)
const arcY = (u, w) => { const r = w * 0.62, cL = -w / 2 + r, d = (u <= 0 ? u - cL : -u - cL); return Math.sqrt(Math.max(0, r * r - d * d)); };

const CLOTHS = ['cloth_red', 'cloth_indigo', 'cloth_ochre', 'cloth_white', 'cloth_green', 'cloth_maroon', 'cloth_blue'];

/** carsi: { y, w, sd, ys, bedesten: rect, lanes: [{ id, horiz, c, a, b, trade }] } */
export function carsi(el, ctx) {
  const { bag, col } = ctx, y = el.y ?? 0, w = el.w ?? 4.6, sd = el.sd ?? 2.6, ys = y + (el.ys ?? 3.7), hw = w / 2, T = 1.0;
  const lanes = el.lanes, bd = el.bedesten;
  const hz = lanes.filter((l) => l.horiz), vt = lanes.filter((l) => !l.horiz);
  const cross = []; for (const h of hz) for (const v of vt) if (v.c > h.a && v.c < h.b && h.c > v.a && h.c < v.b) cross.push({ x: v.c, z: h.c, h, v });
  // the bedesten
  bedesten(bag, col, bd, y);
  for (const L of lanes) {
    const cuts = cross.filter((q) => (L.horiz ? q.h === L : q.v === L)).map((q) => (L.horiz ? q.x : q.z)).sort((p, q) => p - q);
    const endA = L.a === bd[2] || L.a === bd[3], endB = L.b === bd[0] || L.b === bd[1];       // ends against the bedesten
    const sa = L.a + (endA ? 0 : T), sb = L.b - (endB ? 0 : T);
    const M = L.horiz ? (s, v, sd2) => [s, L.c + sd2 * v] : (s, v, sd2) => [L.c + sd2 * v, s];        // lane frame → plan
    const R = (s0, s1, v0, v1, sg) => { const p = M(s0, v0, sg), q = M(s1, v1, sg); return [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; };
    const Bx = (mat, s0, y0, v0, s1, y1, v1, sg = 1) => { const r = R(s0, s1, v0, v1, sg); bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); return r; };
    // paving
    const pave = R(sa - (endA ? 0 : T), sb + (endB ? 0 : T), -hw, hw, 1);
    bag.add('flagstone', box(pave[0], y - 0.25, pave[1], pave[2], y + 0.04, pave[3])); col.floor(pave, y + 0.04);
    // runs of vault between the crossings (the lane's clear width), and of shops (cut wider than the vault when the cross lane is the other trade's)
    const vcuts = cuts.flatMap((c) => [c - hw, c + hw]);
    const vruns = []; { let s = sa; for (let i = 0; i < vcuts.length; i += 2) { vruns.push([s, vcuts[i]]); s = vcuts[i + 1]; } vruns.push([s, sb]); }
    const rcut = L.horiz ? hw + sd : hw;
    const rruns = []; { let s = sa; for (const c of cuts) { rruns.push([s, c - rcut]); s = c + rcut; } rruns.push([s, sb]); }
    for (const [s0, s1] of vruns) vault(bag, L, s0, s1, y, ys, w);
    for (const [s0, s1] of rruns) for (const sg of [-1, 1]) row(bag, col, L, M, R, Bx, s0, s1, sg, y, ys, w, sd);
    // gates at the free ends
    for (const [end, free] of [[L.a, !endA], [L.b, !endB]]) if (free) {
      const dir = end === L.a ? 1 : -1, s0 = end, s1 = end + dir * T, half = hw + sd;
      const A = M(s0 + dir * T / 2, -half, 1), B2 = M(s0 + dir * T / 2, half, 1);
      arcadeWall(bag, A, B2, [[half - 1.9, half + 1.9]], y, y + 3.2, y + 7.2, T, S);
      for (const sg of [-1, 1]) {
        col.rect(R(s0, s1, 1.9, half, sg), y, y + 7);
        Bx('wood_dark', s0 + dir * T, y, 1.9, s0 + dir * (T + 0.08), y + 3.4, 2.3, sg);        // the leaves folded back against the wall
      }
      const r2 = R(s0 - dir * 0.3, s1 + dir * 0.3, -half - 0.2, half + 0.2, 1); bag.add('lead', box(r2[0], y + 7.2, r2[1], r2[2], y + 7.42, r2[3]));
    }
  }
  // the crossings: a groin vault, its light well
  for (const q of cross) groin(bag, q.x, q.z, y, ys, w);
}

/** The pointed barrel vault over the lane from s0 to s1: stucco within, lead outside, a square light well every 7 m. */
function vault(bag, L, s0, s1, y, ys, w) {
  const len = s1 - s0; if (len < 0.5) return;
  const n = Math.max(1, Math.floor(len / 7)), hole = [];
  for (let i = 0; i < n; i++) hole.push(s0 + len * (i + 0.5) / n);
  const us = [-w / 2, -w / 2 * 0.74, -w / 2 * 0.48, -0.6, 0, 0.6, w / 2 * 0.48, w / 2 * 0.74, w / 2];
  const ss = [s0]; for (const h of hole) ss.push(h - 0.6, h + 0.6); ss.push(s1);
  const P = (s, u, up) => (L.horiz ? [s, ys + arcY(u, w) + up, L.c + u] : [L.c + u, ys + arcY(u, w) + up, s]);
  const inner = [], outer = [];
  for (let k = 0; k + 1 < ss.length; k++) for (let i = 0; i + 1 < us.length; i++) {
    if (k % 2 === 1 && us[i] >= -0.6 && us[i + 1] <= 0.6 && hole.length) continue;       // the light well's opening
    for (const [t, up] of [[inner, 0], [outer, 0.3]]) { const a = P(ss[k], us[i], up), b = P(ss[k + 1], us[i], up), c = P(ss[k + 1], us[i + 1], up), d = P(ss[k], us[i + 1], up); t.push(...a, ...b, ...c, ...a, ...c, ...d); }
  }
  bag.add('stucco', dblT(inner)); bag.add('lead', dblT(outer));
  for (const h of hole) { const top = ys + arcY(0, w) + 0.3; lantern(bag, L.horiz ? h : L.c, L.horiz ? L.c : h, top, 0.6); }
}

/** The groin vault over a crossing: the higher of the two barrels at each point. */
function groin(bag, cx, cz, y, ys, w) {
  const N = 12, hw = w / 2, inner = [], outer = [], H = (i, j) => { const u = -hw + w * i / N, v = -hw + w * j / N; return Math.max(arcY(u, w), arcY(v, w)); };
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    if ((i === 5 || i === 6) && (j === 5 || j === 6)) continue;
    for (const [t, up] of [[inner, 0], [outer, 0.3]]) {
      const p = (a, b) => [cx - hw + w * a / N, ys + H(a, b) + up, cz - hw + w * b / N];
      t.push(...p(i, j), ...p(i + 1, j), ...p(i + 1, j + 1), ...p(i, j), ...p(i + 1, j + 1), ...p(i, j + 1));
    }
  }
  bag.add('stucco', dblT(inner)); bag.add('lead', dblT(outer));
  lantern(bag, cx, cz, ys + arcY(0, w) + 0.3, 0.6);
}
/** A light well's lantern: four stone cheeks round the opening (half-side q), daylight between, a lead cap. */
function lantern(bag, cx, cz, top, q) {
  bag.add(S, box(cx - q - 0.12, top - 0.4, cz - q - 0.12, cx - q, top + 0.5, cz + q + 0.12)); bag.add(S, box(cx + q, top - 0.4, cz - q - 0.12, cx + q + 0.12, top + 0.5, cz + q + 0.12));
  bag.add(S, box(cx - q, top - 0.4, cz - q - 0.12, cx + q, top + 0.5, cz - q)); bag.add(S, box(cx - q, top - 0.4, cz + q, cx + q, top + 0.5, cz + q + 0.12));
  bag.add('daylight', box(cx - q + 0.02, top + 0.2, cz - q + 0.02, cx + q - 0.02, top + 0.22, cz + q - 0.02));
  bag.add('lead', box(cx - q - 0.3, top + 0.5, cz - q - 0.3, cx + q + 0.3, top + 0.6, cz + q + 0.3));
}

/** One side's row of shops from s0 to s1 (side sg): the front arches, partitions, back wall, flat lead roof, the goods of the lane's trade. */
function row(bag, col, L, M, R, Bx, s0, s1, sg, y, ys, w, sd) {
  const len = s1 - s0; if (len < 2.4) return;
  const k = Math.floor(len / 2.4), sw = len / k, hw = w / 2, v0 = hw, v1 = hw + sd, yt = ys;
  const spans = []; for (let i = 0; i < k; i++) spans.push([i * sw + 0.35, (i + 1) * sw - 0.35]);
  const A = M(s0, hw + 0.25, sg), B2 = M(s1, hw + 0.25, sg);
  arcadeWall(bag, A, B2, L.horiz ? spans : sg > 0 ? spans : spans, y, y + 2.3, yt, 0.5, S);
  Bx(S, s0, y, v1 - 0.3, s1, yt, v1, sg);                                  // the back wall
  Bx(S, s0 - 0.1, yt, v0 - 0.1, s1 + 0.1, yt + 0.3, v1 + 0.05, sg);       // the roof slab and its coping
  Bx('lead', s0 - 0.05, yt + 0.3, v0 - 0.05, s1 + 0.05, yt + 0.36, v1, sg);
  Bx('brick', s0 - 0.12, yt + 0.3, v1 - 0.1, s1 + 0.12, yt + 0.55, v1 + 0.07, sg);
  const rr = R(s0, s1, v0 - 0.45, v1, sg); col.rect(rr, y, yt + 0.3);
  for (let i = 0; i <= k; i++) { const s = s0 + i * sw; Bx(S, s - 0.15, y, v0 + 0.5, s + 0.15, yt, v1 - 0.3, sg); }     // the partitions
  for (let i = 0; i < k; i++) {
    const sa = s0 + i * sw + 0.35, sb = s0 + (i + 1) * sw - 0.35, sm = (sa + sb) / 2, seed = (i * 7 + Math.abs(Math.floor(s0))) % 11;
    Bx(S, sa, y, v0 + 0.5, sb, y + 0.5, v1 - 0.3, sg); Bx('timber', sa, y + 0.5, v0 + 0.5, sb, y + 0.54, v1 - 0.3, sg);          // the bench inside
    Bx('wood_dark', sa, y + 0.76, v0 - 0.4, sb, y + 0.82, v0 + 0.02, sg);                                                          // the shutter let down as a counter
    for (const q of [sa + 0.1, sb - 0.1]) Bx('wood_dark', q - 0.03, y + 0.2, v0 - 0.34, q + 0.03, y + 0.76, v0 - 0.3, sg);
    Bx('wood_dark', sa, y + 2.3, v0 + 0.5, sb, y + 2.4, v0 + 0.62, sg);                                                           // the beam behind the arch
    goods(bag, Bx, L.trade, sa, sb, sm, y, v0, v1, sg, seed, M, yt);
  }
}

function goods(bag, Bx, trade, sa, sb, sm, y, v0, v1, sg, seed, M, yt) {
  const wd = sb - sa, cl = CLOTHS;
  const at = (s, v) => M(s, v, sg);
  if (trade === 'cloth') {
    for (let g = 0; g < 4; g++) Bx(cl[(seed + g) % 7], sa + 0.1 + g * (wd - 0.2) / 4, y + 0.82, v0 - 0.3, sa + 0.1 + (g + 1) * (wd - 0.2) / 4 - 0.04, y + 0.82 + 0.12 + 0.05 * ((g + seed) % 3), v0 + 0.0, sg);
    for (let r = 0; r < 3; r++) for (let g = 0; g < 4; g++) Bx(cl[(seed + r + g * 2) % 7], sa + 0.05 + g * wd / 4, y + 1.0 + r * 0.42, v0 + 0.7, sa + (g + 1) * wd / 4 - 0.05, y + 1.0 + r * 0.42 + 0.34, v1 - 0.35, sg);
  } else if (trade === 'brass') {
    for (let g = 0; g < 4; g++) { const p = at(sa + 0.25 + g * (wd - 0.5) / 3, v0 + 0.2 + (g % 2) * 0.5), sc = 0.7 + ((seed + g) % 3) * 0.2; bag.add('bronze', lathe([[0.001, 0], [0.16 * sc, 0.01], [0.24 * sc, 0.15 * sc], [0.2 * sc, 0.32 * sc], [0.11 * sc, 0.4 * sc], [0.13 * sc, 0.47 * sc]], 10, null, p[0], y + 0.82, p[1])); }
    for (let g = 0; g < 3; g++) { const p = at(sa + 0.3 + g * (wd - 0.6) / 2, v0 + 0.62); bag.add('bronze', rod([p[0], y + 2.3, p[1]], [p[0], y + 1.55, p[1]], 0.01, 3)); bag.add('bronze', lathe([[0.001, 0], [0.22, 0.02], [0.24, 0.1], [0.001, 0.06]], 10, null, p[0], y + 1.45, p[1])); }
  } else if (trade === 'books') {
    for (let g = 0; g < 3; g++) Bx(['cloth_brown', 'cloth_maroon', 'ivory'][(seed + g) % 3], sa + 0.15 + g * (wd - 0.3) / 3, y + 0.82, v0 - 0.25, sa + 0.15 + (g + 1) * (wd - 0.3) / 3 - 0.06, y + 0.82 + 0.1 + 0.07 * ((seed + g) % 3), v0 + 0.0, sg);
    for (let r = 0; r < 3; r++) for (let g = 0; g < 6; g++) Bx(['cloth_brown', 'cloth_maroon', 'cloth_green', 'ivory', 'cloth_indigo'][(seed + g + r) % 5], sa + 0.06 + g * (wd - 0.12) / 6, y + 1.0 + r * 0.42, v0 + 0.8, sa + 0.06 + (g + 1) * (wd - 0.12) / 6 - 0.03, y + 1.0 + r * 0.42 + 0.3 + 0.04 * (g % 2), v0 + 1.35, sg);
  } else if (trade === 'caps') {
    for (let g = 0; g < 5; g++) { const p = at(sa + 0.2 + g * (wd - 0.4) / 4, v0 + 0.15); const m = ['cloth_white', 'cloth_red', 'cloth_white', 'cloth_ochre', 'cloth_indigo'][(seed + g) % 5]; bag.add('wood_dark', rod([p[0], y + 0.82, p[1]], [p[0], y + 1.02, p[1]], 0.02, 4)); bag.add(m, lathe([[0.15, 0], [0.14, 0.1], [0.09, 0.2], [0.001, 0.22]], 10, null, p[0], y + 1.0, p[1])); }
    for (let g = 0; g < 5; g++) { const p = at(sa + 0.2 + g * (wd - 0.4) / 4, v0 + 0.9); bag.add(['cloth_white', 'cloth_red', 'cloth_white'][(seed + g) % 3], lathe([[0.16, 0], [0.15, 0.1], [0.1, 0.22], [0.001, 0.25]], 10, null, p[0], y + 1.4 + (g % 2) * 0.5, p[1])); }
  } else if (trade === 'shoes') {
    for (let r = 0; r < 4; r++) for (let g = 0; g < 4; g++) Bx(['cloth_red', 'cloth_ochre', 'hide_black', 'cloth_blue', 'hide_tan'][(seed + g + r) % 5], sa + 0.08 + g * wd / 4, y + 0.82 + (r === 0 ? 0 : 0.35 + r * 0.32), v0 + (r === 0 ? 0.0 : 0.65), sa + (g + 1) * wd / 4 - 0.1, y + 0.82 + (r === 0 ? 0 : 0.35 + r * 0.32) + 0.08, v0 + (r === 0 ? 0.35 : 1.0), sg);
  } else {
    for (let g = 0; g < 3; g++) { const p = at(sa + 0.25 + g * (wd - 0.5) / 2, v0 + 0.25); bag.add('sacking', lathe([[0.001, 0], [0.2, 0.01], [0.24, 0.2], [0.18, 0.38], [0.001, 0.4]], 8, null, p[0], y + 0.82, p[1])); bag.add(['cloth_ochre', 'cloth_red', 'cloth_green'][(seed + g) % 3], lathe([[0.001, 0], [0.17, 0.0], [0.001, 0.12]], 8, null, p[0], y + 1.2, p[1])); }
    for (let g = 0; g < 4; g++) { const p = at(sa + 0.2 + g * (wd - 0.4) / 3, v0 + 0.9 + (g % 2) * 0.3); bag.add('pottery_dark', lathe([[0.001, 0], [0.1, 0.01], [0.15, 0.14], [0.09, 0.26], [0.08, 0.3]], 8, null, p[0], y + 0.54, p[1])); }
  }
  void yt; void sm;
}

/** The old bedesten (§11): 5 × 3 domed bays on eight piers inside walls with a gate in the middle of each side. */
function bedesten(bag, col, r, y) {
  const [x0, z0, x1, z1] = r, T = 1.5, Hw = 7.6, Hs = 7.2, nx = 5, nz = 3, ix0 = x0 + T, ix1 = x1 - T, iz0 = z0 + T, iz1 = z1 - T, bx = (ix1 - ix0) / nx, bz = (iz1 - iz0) / nz, ph = 0.9;
  bag.add('flagstone', box(x0, y - 0.25, z0, x1, y + 0.05, z1)); col.floor([x0, z0, x1, z1], y + 0.05);
  // the walls, a gate in the middle of each (Sahaflar north, Takkeciler south, Kuyumcular east, Zenneciler west)
  const zc = (z1 - z0) / 2, xc = (x1 - x0) / 2;
  arcadeWall(bag, [x0 + T / 2, z0], [x0 + T / 2, z1], [[zc - 1.9, zc + 1.9]], y - 0.3, y + 3.9, y + Hw, T, S);
  arcadeWall(bag, [x1 - T / 2, z0], [x1 - T / 2, z1], [[zc - 1.9, zc + 1.9]], y - 0.3, y + 3.9, y + Hw, T, S);
  arcadeWall(bag, [x0, z0 + T / 2], [x1, z0 + T / 2], [[xc - 1.9, xc + 1.9]], y - 0.3, y + 3.9, y + Hw, T, S);
  arcadeWall(bag, [x0, z1 - T / 2], [x1, z1 - T / 2], [[xc - 1.9, xc + 1.9]], y - 0.3, y + 3.9, y + Hw, T, S);
  col.rect([x0, z0, x0 + T, z0 + zc - 1.9], y, y + Hw); col.rect([x0, z0 + zc + 1.9, x0 + T, z1], y, y + Hw);
  col.rect([x1 - T, z0, x1, z0 + zc - 1.9], y, y + Hw); col.rect([x1 - T, z0 + zc + 1.9, x1, z1], y, y + Hw);
  col.rect([x0, z0, x0 + xc - 1.9, z0 + T], y, y + Hw); col.rect([x0 + xc + 1.9, z0, x1, z0 + T], y, y + Hw);
  col.rect([x0, z1 - T, x0 + xc - 1.9, z1], y, y + Hw); col.rect([x0 + xc + 1.9, z1 - T, x1, z1], y, y + Hw);
  // the cornice of brick and the lead of the wall tops
  for (const q of [[x0 - 0.15, z0 - 0.15, x1 + 0.15, z0 + T], [x0 - 0.15, z1 - T, x1 + 0.15, z1 + 0.15], [x0 - 0.15, z0, x0 + T, z1], [x1 - T, z0, x1 + 0.15, z1]]) { bag.add('brick', box(q[0], y + Hw, q[1], q[2], y + Hw + 0.3, q[3])); }
  // the high windows (dark outside, daylight within), the only light but the gates'
  for (let i = 1; i < nx * 2; i++) {
    const u = x0 + T + i * (x1 - x0 - 2 * T) / (nx * 2); if (Math.abs(u - (x0 + xc)) < 2.6) continue;
    bag.add('opening', box(u - 0.5, y + 5.6, z0 - 0.06, u + 0.5, y + 6.9, z0 + 0.02)); bag.add('daylight', box(u - 0.5, y + 5.6, z0 + T - 0.02, u + 0.5, y + 6.9, z0 + T + 0.02));
    bag.add('opening', box(u - 0.5, y + 5.6, z1 - 0.02, u + 0.5, y + 6.9, z1 + 0.06)); bag.add('daylight', box(u - 0.5, y + 5.6, z1 - T - 0.02, u + 0.5, y + 6.9, z1 - T + 0.02));
  }
  for (let j = 1; j < nz * 2; j++) { const u = z0 + T + j * (z1 - z0 - 2 * T) / (nz * 2); if (Math.abs(u - (z0 + zc)) < 2.6) continue; bag.add('opening', box(x0 - 0.06, y + 5.6, u - 0.5, x0 + 0.02, y + 6.9, u + 0.5)); bag.add('daylight', box(x0 + T - 0.02, y + 5.6, u - 0.5, x0 + T + 0.02, y + 6.9, u + 0.5)); bag.add('opening', box(x1 - 0.02, y + 5.6, u - 0.5, x1 + 0.06, y + 6.9, u + 0.5)); bag.add('daylight', box(x1 - T - 0.02, y + 5.6, u - 0.5, x1 - T + 0.02, y + 6.9, u + 0.5)); }
  // the arcades between the piers (the walls' pilasters and eight piers) and the fifteen domes
  for (let j = 1; j < nz; j++) {
    const z = iz0 + j * bz, sp = []; for (let i = 0; i < nx; i++) sp.push([i * bx + ph, (i + 1) * bx - ph]);
    arcadeWall(bag, [ix0, z], [ix1, z], sp, y, y + 2.6, y + Hs, 2 * ph, S);
  }
  for (let i = 1; i < nx; i++) {
    const x = ix0 + i * bx, sp = []; for (let j = 0; j < nz; j++) sp.push([j * bz + ph, (j + 1) * bz - ph]);
    arcadeWall(bag, [x, iz0], [x, iz1], sp, y, y + 2.6, y + Hs + 0.04, 2 * ph, S);
  }
  for (let j = 1; j < nz; j++) for (let i = 1; i < nx; i++) { const px = ix0 + i * bx, pz = iz0 + j * bz; col.circle(px, pz, ph * 1.05, y, y + Hs); bag.add('marble_smooth', box(px - ph - 0.12, y, pz - ph - 0.12, px + ph + 0.12, y + 0.4, pz + ph + 0.12)); }
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const cx = ix0 + (i + 0.5) * bx, cz = iz0 + (j + 0.5) * bz;
    const hx = bx / 2 - ph, hz = bz / 2 - ph, rr = Math.min(hx, hz) * 0.92;
    bayDome(bag, cx, y + Hs, cz, hx, hz);
    // the strips between the dome's circle and the bay's sides, closed by flat plates
    bag.add('stucco', box(cx + rr, y + Hs - 0.25, cz - hz, cx + hx, y + Hs - 0.03, cz + hz)); bag.add('stucco', box(cx - hx, y + Hs - 0.25, cz - hz, cx - rr, y + Hs - 0.03, cz + hz));
    if (hz > rr + 0.01) { bag.add('stucco', box(cx - rr, y + Hs - 0.26, cz + rr, cx + rr, y + Hs - 0.04, cz + hz)); bag.add('stucco', box(cx - rr, y + Hs - 0.26, cz - hz, cx + rr, y + Hs - 0.04, cz - rr)); }
  }
  // the dealers' counters and chests round the inner walls, cloth and metal wares, and a carpet in the middle bay
  for (let i = 0; i < nx; i++) for (const [side, zz] of [[0, iz0 + 0.1], [1, iz1 - 0.1 - 0.7]]) {
    const cx = ix0 + (i + 0.5) * bx; if (i === 2) continue;
    bag.add('wood_dark', box(cx - 1.6, y + 0.05, zz, cx + 1.6, y + 0.9, zz + 0.7)); col.rect([cx - 1.6, zz, cx + 1.6, zz + 0.7], y, y + 0.9);
    for (let g = 0; g < 5; g++) bag.add(CLOTHS[(i * 3 + g + side) % 7], box(cx - 1.5 + g * 0.6, y + 0.9, zz + 0.08, cx - 1.5 + g * 0.6 + 0.5, y + 0.9 + 0.12 + 0.05 * ((g + i) % 3), zz + 0.6));
    if ((i + side) % 2) for (let g = 0; g < 3; g++) bag.add('gilt_bronze', lathe([[0.001, 0], [0.1, 0.02], [0.04, 0.14], [0.09, 0.2], [0.14, 0.26]], 8, null, cx - 0.8 + g * 0.8, y + 1.55, zz + 0.35));
  }
  const mc = [ix0 + 2.5 * bx, iz0 + 1.5 * bz];
  bag.add('cloth_red', box(mc[0] - 3, y + 0.05, mc[1] - 2.2, mc[0] + 3, y + 0.075, mc[1] + 2.2)); bag.add('cloth_indigo', box(mc[0] - 2.5, y + 0.075, mc[1] - 1.7, mc[0] + 2.5, y + 0.095, mc[1] + 1.7)); bag.add('cloth_ochre', box(mc[0] - 1.6, y + 0.095, mc[1] - 0.9, mc[0] + 1.6, y + 0.115, mc[1] + 0.9));
}
