// The Albaicín about 1390 (docs/settlements/granada.md §5.1): houses turned inward round a patio — the
// main rooms behind a portico on the north side, a small pool in the middle, a bent way in from the
// lane, two storeys, a timber gallery over the portico, the roofs sloping in to the patio, now and then
// a mirador on the roof; and the neighbourhood's cisterns (aljibes), a brick front with a horseshoe
// arch over the water, a tiled roof over the vault.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { holedWall, face, archHead, dbl } from './halls.js';

const LW = 'limewash_white', q4 = (out, a, b, c, d) => out.push(...a, ...b, ...c, ...a, ...c, ...d);
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** Small dark windows on a face (axis 'x' | 'z' plane at `at`, outward n) at u's, from v0 to v1. */
function wins(bag, ax, at, n, us, v0, v1, w = 0.32) {
  for (const u of us) { const p = at - n * 0.01, q = at + n * 0.02; bag.add('opening', ax === 'z' ? box(u - w, v0, Math.min(p, q), u + w, v1, Math.max(p, q)) : box(Math.min(p, q), v0, u - w, Math.max(p, q), v1, u + w)); }
}

/**
 * patio_house: { rect, y, foot, front ('n' | 's'), seed } — a house of the Albaicín round its patio
 * (§5.1): ranges of rooms on four sides, two storeys, the roofs sloping in; on the patio's north side
 * a portico of two marble columns under a timber gallery; the pool; the way in from the lane through a
 * passage in the front range under a horseshoe arch.
 */
function patioHouse(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, rand = rng(el.seed), H = 5.4 + rand() * 0.4, dN = 2.6, dS = 2.1, t = 1.25;
  const P = [x0 + t, z0 + dN, x1 - t, z1 - dS], pcx = (P[0] + P[2]) / 2, pcz = (P[1] + P[3]) / 2;
  bag.add(LW, box(x0, (el.foot ?? y) - 0.5, z0, x1, y, z1));
  // the ranges; the front one pierced by the passage in from the lane
  const front = el.front === 's' ? 's' : 'n', du = [P[0] + 0.25, P[0] + 1.35], dv = [y, y + 2.35];
  const R = { n: [x0, z0, x1, P[1]], s: [x0, P[3], x1, z1], w: [x0, P[1], P[0], P[3]], e: [P[2], P[1], x1, P[3]] };
  for (const [k, r] of Object.entries(R)) holedWall(bag, col, LW, r, y, y + H, k === front ? [[du[0], du[1], dv[0], dv[1]]] : [], k === 'n' || k === 's');
  const pr = R[front]; bag.add('brick_paving', box(du[0], y - 0.2, pr[1], du[1], y + 0.05, pr[3])); col.floor([du[0], pr[1], du[1], pr[3]], y + 0.05);
  // the plinth is solid but for the passage in
  for (const r of [[pr[0], pr[1], du[0], pr[3]], [du[1], pr[1], pr[2], pr[3]]]) col.rect(r, (el.foot ?? y) - 0.5, y);
  col.rect(front === 'n' ? [x0, P[1], x1, z1] : [x0, z0, x1, P[3]], (el.foot ?? y) - 0.5, y);
  // the arch's head through the passage, framed on the lane side; the leaf folded back against its side
  archHead(bag, front === 'n' ? face('z', z0, 1) : face('z', z1, -1), du[0], du[1], y + 1.75, y + 2.35, front === 'n' ? dN : dS, 'horseshoe', { alfiz: true });
  { const a = front === 'n' ? z0 + 0.25 : z1 - 1.25, b = a + 1.0; bag.add('wood_dark', box(du[1] - 0.06, y + 0.05, a, du[1] - 0.01, y + 1.7, b)); }
  // the patio: brick paving round the pool; the pool in a marble kerb, the water a hand below it
  const pw = Math.max(0.6, Math.min(2.4, P[2] - P[0] - 3.0)), ph = Math.max(0.5, Math.min(0.9, P[3] - P[1] - 2.6)), K = [pcx - pw / 2 - 0.15, pcz + 0.3 - ph / 2 - 0.15, pcx + pw / 2 + 0.15, pcz + 0.3 + ph / 2 + 0.15];
  for (const r of [[P[0], P[1], P[2], K[1]], [P[0], K[3], P[2], P[3]], [P[0], K[1], K[0], K[3]], [K[2], K[1], P[2], K[3]]]) bag.add('brick_paving', box(r[0], y - 0.2, r[1], r[2], y + 0.05, r[3]));
  col.floor(P, y + 0.05);
  for (const r of [[K[0], K[1], K[2], K[1] + 0.15], [K[0], K[3] - 0.15, K[2], K[3]], [K[0], K[1] + 0.15, K[0] + 0.15, K[3] - 0.15], [K[2] - 0.15, K[1] + 0.15, K[2], K[3] - 0.15]]) bag.add('marble_smooth', box(r[0], y - 0.45, r[1], r[2], y + 0.16, r[3]));
  bag.add('marble_smooth', box(K[0] + 0.15, y - 0.45, K[1] + 0.15, K[2] - 0.15, y - 0.4, K[3] - 0.15));
  bag.add('water', box(K[0] + 0.15, y - 0.4, K[1] + 0.15, K[2] - 0.15, y + 0.06, K[3] - 0.15));
  col.rect(K, y, y + 0.16);
  // the portico on the north side: two marble columns, a beam, the ceiling, the timber gallery above
  const zc = P[1] + 1.05, hc = 2.45, cxs = [P[0] + (P[2] - P[0]) / 3, P[0] + 2 * (P[2] - P[0]) / 3];
  for (const x of cxs) {
    bag.add('marble_smooth', lathe([[0.15, 0], [0.15, 0.08], [0.1, 0.12], [0.085, hc - 0.3], [0.11, hc - 0.26], [0.11, hc - 0.2], [0.001, hc - 0.2]], 10, null, x, y + 0.05, zc));
    bag.add('marble_smooth', box(x - 0.17, y + 0.05 + hc - 0.2, zc - 0.17, x + 0.17, y + 0.05 + hc, zc + 0.17)); col.circle(x, zc, 0.13, y, y + hc);
  }
  const yb = y + 0.05 + hc;
  bag.add('timber', box(P[0], yb, zc - 0.13, P[2], yb + 0.3, zc + 0.13));
  bag.add('timber', box(P[0], yb + 0.3, P[1], P[2], yb + 0.38, zc + 0.2));
  for (let x = P[0] + 0.3; x < P[2] - 0.2; x += 0.45) bag.add('timber', box(x - 0.05, yb + 0.2, P[1], x + 0.05, yb + 0.3, zc - 0.13));
  // the roofs: four slopes from the parapet of the outer walls down to the eaves over the patio
  const yo = y + H + 0.75, yi = y + H + 0.08, I = [P[0] + 0.3, zc + 0.25, P[2] - 0.3, P[3] - 0.3], O = [x0 + 0.25, z0 + 0.25, x1 - 0.25, z1 - 0.25];
  const tr = [], ed = [], ring = (A, yy) => [[A[0], yy, A[1]], [A[2], yy, A[1]], [A[2], yy, A[3]], [A[0], yy, A[3]]];
  const oo = ring(O, yo), ii = ring(I, yi);
  for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; q4(tr, oo[i], oo[j], ii[j], ii[i]); q4(ed, ii[i], ii[j], [ii[j][0], yi - 0.14, ii[j][2]], [ii[i][0], yi - 0.14, ii[i][2]]); }
  bag.add('roof_tile', dbl(tr)); bag.add('timber', dbl(ed));
  // the walls' heads: up to the roof's outer edge round the outside, a parapet a little above it
  for (const r of [[x0, z0, x1, z0 + 0.25], [x0, z1 - 0.25, x1, z1], [x0, z0 + 0.25, x0 + 0.25, z1 - 0.25], [x1 - 0.25, z0 + 0.25, x1, z1 - 0.25]]) bag.add(LW, box(r[0], y + H, r[1], r[2], yo + 0.18, r[3]));
  // the walls' faces over the patio up to the eaves, behind the slopes: the inner rims of the ranges
  // (the ranges stop at y + H; between H and the slope the roof's underside is closed by these)
  { const s = []; for (const [a, b] of [[[P[0], P[1]], [P[2], P[1]]], [[P[2], P[3]], [P[0], P[3]]], [[P[0], P[3]], [P[0], P[1]]], [[P[2], P[1]], [P[2], P[3]]]]) {
      const ya = yA(a), yB = yA(b); q4(s, [a[0], y + H, a[1]], [b[0], y + H, b[1]], [b[0], yB, b[1]], [a[0], ya, a[1]]); }
    bag.add(LW, dbl(s)); }
  function yA([x, z]) { // the roof's height over (x, z) on the slope nearest it
    const fx = Math.min((x - O[0]) / Math.max(0.01, I[0] - O[0]), (O[2] - x) / Math.max(0.01, O[2] - I[2])), fz = Math.min((z - O[1]) / Math.max(0.01, I[1] - O[1]), (O[3] - z) / Math.max(0.01, O[3] - I[3]));
    return yo + (yi - yo) * Math.max(0, Math.min(1, Math.min(fx, fz))) - 0.15;
  }
  // the gallery over the portico: posts on the beam up to the roof, a rail
  for (const x of [P[0] + 0.08, ...cxs, P[2] - 0.08]) { const top = yA([x, zc]); if (top > yb + 0.5) bag.add('timber', box(x - 0.06, yb + 0.38, zc - 0.06, x + 0.06, top, zc + 0.06)); }
  bag.add('timber', box(P[0] + 0.14, yb + 1.25, zc - 0.04, P[2] - 0.14, yb + 1.33, zc + 0.04));
  for (let x = P[0] + 0.35; x < P[2] - 0.25; x += 0.22) bag.add('timber', box(x - 0.015, yb + 0.38, zc - 0.015, x + 0.015, yb + 1.25, zc + 0.015));
  // doors and windows on the patio: the hall's door and two windows beside it, the upper rooms' doors on the gallery
  wins(bag, 'z', P[1], 1, [pcx], y + 0.05, y + 2.2, 0.5); wins(bag, 'z', P[1], 1, [P[0] + 0.6, P[2] - 0.6].filter((u) => Math.abs(u - pcx) > 1.1), y + 0.8, y + 1.8, 0.28);
  wins(bag, 'z', P[1], 1, [pcx], yb + 0.4, yb + 2.2, 0.42);
  wins(bag, 'z', P[3], -1, [pcx], y + 0.05, y + 2.1, 0.45); wins(bag, 'z', P[3], -1, [pcx], yb + 0.7, yb + 1.6, 0.3);
  for (const [at, n] of [[P[0], 1], [P[2], -1]]) wins(bag, 'x', at, n, [pcz + 0.3], y + 0.6, y + 1.8, 0.3);
  // the lane fronts: a few small windows high up, lattice-closed
  for (const [z, n] of [[z0, -1], [z1, 1]]) wins(bag, 'z', z, n, [x0 + (x1 - x0) * 0.7].concat(rand() < 0.5 ? [x0 + (x1 - x0) * 0.35] : []), y + H - 1.8, y + H - 1.0, 0.25);
  // a mirador on the north range now and then
  if (rand() < 0.3 && x1 - x0 > 8.6) {
    const m = [x1 - 3.0, z0 + 0.25, x1 - 0.4, P[1] - 0.1], ym = y + H + 2.6;
    bag.add(LW, box(m[0], y + H, m[1], m[2], ym, m[3])); col.rect(m, y + H, ym);
    for (const [ax, at, n, us] of [['z', m[1], -1, [m[0] + 0.85, m[2] - 0.85]], ['z', m[3], 1, [m[0] + 0.85, m[2] - 0.85]], ['x', m[0], -1, [(m[1] + m[3]) / 2]], ['x', m[2], 1, [(m[1] + m[3]) / 2]]]) wins(bag, ax, at, n, us, yo + 0.5, ym - 0.4, 0.22);
    const e = 0.25, c = [m[0] - e, m[1] - e, m[2] + e, m[3] + e], cx = (c[0] + c[2]) / 2, cz = (c[1] + c[3]) / 2, tp = [cx, ym + 0.9, cz], pts = [[c[0], c[1]], [c[2], c[1]], [c[2], c[3]], [c[0], c[3]]], tt = [];
    for (let i = 0; i < 4; i++) { const a = pts[i], b = pts[(i + 1) % 4]; tt.push(a[0], ym, a[1], ...tp, b[0], ym, b[1]); }
    bag.add('roof_tile', dbl(tt)); bag.add('timber', box(c[0], ym - 0.12, c[1], c[2], ym, c[3]));
  }
}

/**
 * aljibe: { at, y, rot (0: the front to the south) } — a neighbourhood cistern (§5.1): the vault
 * under the lane, its head standing as a little house of brick with a tiled roof; on the front a
 * horseshoe arch in an alfiz over the water, a stone curb across it.
 */
function aljibe(el, { bag, col }) {
  const [cx, cz] = el.at, y = el.y, w = 3.0, d = 2.6, h = 3.1, south = (el.rot ?? 0) === 0;
  const r = [cx - w / 2, cz - d / 2, cx + w / 2, cz + d / 2], fz = south ? r[3] : r[1], n = south ? 1 : -1;
  const hole = [cx - 0.6, cx + 0.6, y + 0.55, y + 2.2];
  holedWall(bag, col, 'brick', [r[0], south ? r[3] - 0.45 : r[1], r[2], south ? r[3] : r[1] + 0.45], y - 1.2, y + h, [hole], true);
  const back = south ? [r[0], r[1], r[2], r[3] - 0.45] : [r[0], r[1] + 0.45, r[2], r[3]];
  bag.add('brick', box(back[0], y - 1.2, back[1], back[2], y + h, back[3])); col.rect(back, y - 1.2, y + h);
  archHead(bag, face('z', fz, -n), hole[0], hole[1], y + 1.65, y + 2.2, 0.45, 'horseshoe', { alfizUp: 0.3 });
  // in the arch: the dark well of the cistern, the water down in it, a stone curb across the mouth
  const zi = south ? r[3] - 0.45 : r[1] + 0.45, zo = fz;
  bag.add('opening', box(hole[0], y + 0.55, Math.min(zi, zi - n * 0.02), hole[1], y + 2.2, Math.max(zi, zi - n * 0.02)));
  bag.add('water', box(hole[0], y + 0.5, Math.min(zi, zo), hole[1], y + 0.56, Math.max(zi, zo)));
  bag.add('limestone', box(hole[0] - 0.1, y + 0.56, Math.min(zo, zo - n * 0.12), hole[1] + 0.1, y + 0.72, Math.max(zo, zo + n * 0.12)));
  bag.add('limestone', box(r[0] - 0.08, y - 0.3, r[1] - 0.08, r[2] + 0.08, y + 0.08, r[3] + 0.08)); col.rect(r, y, y + 0.08);
  // the tiled roof, a low gable along the vault
  const e = 0.25, t = [], a = r[0] - e, b = r[2] + e, za = r[1] - e, zb = r[3] + e, yr = y + h, top = yr + 0.75, zm = cz;
  q4(t, [a, yr, za], [b, yr, za], [b, top, zm], [a, top, zm]); q4(t, [b, yr, zb], [a, yr, zb], [a, top, zm], [b, top, zm]);
  bag.add('roof_tile', dbl(t));
  const g = []; for (const x of [r[0], r[2]]) g.push(x, yr, r[1], x, yr, r[3], x, top - 0.1, zm); bag.add('brick', dbl(g));
  bag.add('timber', box(a, yr - 0.1, za, b, yr, zb));
}

export const ALBAICIN = { patio_house: patioHouse, aljibe };
