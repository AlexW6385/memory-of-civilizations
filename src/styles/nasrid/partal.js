// The Partal and the Rauda about 1390 (docs/settlements/granada.md §4.5–§4.6): the oldest palace of
// the Alhambra (Muhammad III, 1302–1309) — its portico of five arches on brick pillars looking over the
// great pool, the Tower of the Ladies standing in the line of the north wall with the main room inside
// under a wooden star cupola and the mirador projecting beyond the wall with windows on three sides;
// and the royal cemetery (Rauda) by the Palace of the Lions — the mausoleum of a vestibule, a domed
// qubba and two side rooms, the marble prismatic tombstones over the graves, the walled garden of
// tombs to the south-east.

import { box, rod } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { holedWall, face, dress, archHead, starCeiling, plankVault, hipRoof, tileFloor, archRun, dbl } from './halls.js';

const PL = 'plaster_white', SC = 'stucco_cream', MS = 'marble_smooth', RED = 'tuff_red';
const q4 = (out, a, b, c, d) => out.push(...a, ...b, ...c, ...a, ...c, ...d);

/** A pair of arched windows divided by a marble colonnette in a wall face f (wall th thick) at u, from y0 to y1. */
export function pairedWindow(bag, f, u, y0, y1, th) {
  for (const [a, b] of [[u - 0.78, u - 0.08], [u + 0.08, u + 0.78]]) {
    archHead(bag, f, a, b, y1 - 0.42, y1, th, 'lobed', { both: true, alfiz: false });
    const r = f.R(th * 0.5 - 0.01, th * 0.5 + 0.01, a, b); bag.add('daylight', box(r[0], y0, r[1], r[2], y1 - 0.42, r[3]));
  }
  const sp = f.R(0, th, u - 0.08, u + 0.08); bag.add(SC, box(sp[0], y1 - 0.42, sp[1], sp[2], y1, sp[3]));
  const c = f.P(u, 0, th / 2); bag.add('marble', rod([c[0], y0, c[2]], [c[0], y1 - 0.5, c[2]], 0.06, 8)); bag.add(MS, box(c[0] - 0.1, y1 - 0.5, c[2] - 0.1, c[0] + 0.1, y1 - 0.42, c[2] + 0.1));
}

/**
 * partal: { tower: [x0, z0, x1, z1] (the Tower of the Ladies, square), y, pool: [x0, z0, x1, z1] } —
 * the portico before the tower on its south side, the mirador on its north, the pool before the portico.
 */
function partal(el, ctx) {
  const { bag, col } = ctx, [t0, u0, t1, u1] = el.tower, y = el.y ?? 0, th = 1.4, I = [t0 + th, u0 + th, t1 - th, u1 - th], cx = (t0 + t1) / 2;
  const Hr = 6.0, Ht = Hr + 5.6;
  const W = (r, y0, y1, holes = [], mat = RED) => holedWall(bag, col, mat, r, y0, y1, holes);
  // the tower: its foot down the slope, the walls with their doors and windows, the room dressed inside under the star cupola
  bag.add(RED, box(t0, y - 8, u0, t1, y - 0.5, u1));
  const dS = [cx - 1.2, cx + 1.2, y, y + 3.7], dN = [cx - 1.0, cx + 1.0, y, y + 3.3];
  const zw = (I[1] + I[3]) / 2, wE = [[zw - 0.78, zw + 0.78, y + 1.0, y + 3.0]];
  W([t0, I[3], t1, u1], y - 0.5, y + Ht, [dS]); W([t0, u0, t1, I[1]], y - 0.5, y + Ht, [dN]);
  W([t0, I[1], I[0], I[3]], y - 0.5, y + Ht, wE); W([I[2], I[1], t1, I[3]], y - 0.5, y + Ht, wE);
  archHead(bag, face('z', I[3], 1), dS[0], dS[1], y + 2.6, y + 3.7, th, 'lobed', { both: true });
  archHead(bag, face('z', u0, 1), dN[0], dN[1], y + 2.3, y + 3.3, th, 'round', { both: true });
  for (const [xa, n] of [[t0, 1], [I[2], 1]]) pairedWindow(bag, face('x', xa, n), zw, y + 1.0, y + 3.0, th);
  dress(bag, face('z', I[3], -1), I[0], I[2], y, y + Hr, [dS]); dress(bag, face('z', I[1], 1), I[0], I[2], y, y + Hr, [dN]);
  dress(bag, face('x', I[0], 1), I[1], I[3], y, y + Hr, wE); dress(bag, face('x', I[2], -1), I[1], I[3], y, y + Hr, wE);
  tileFloor(bag, col, [I[0], I[1], I[2], I[3]], y);
  bag.add(MS, box(dS[0], y - 0.3, I[3], dS[1], y + 0.05, u1)); col.floor([dS[0], I[3], dS[1], u1], y + 0.05);
  bag.add(MS, box(dN[0], y - 0.3, u0, dN[1], y + 0.05, I[1])); col.floor([dN[0], u0, dN[1], I[1]], y + 0.05);
  starCeiling(bag, I, y + Hr);
  // small windows high in the tower outside, the roof of tiles
  for (const f of [face('z', u0, -1), face('x', t0, -1), face('x', t1, 1)]) for (const d of [-2.2, 0, 2.2]) {
    const m = (f.ax === 'z' ? cx : zw) + d, o = f.R(-0.02, 0.03, m - 0.28, m + 0.28); bag.add('opening', box(o[0], y + Ht - 2.4, o[1], o[2], y + Ht - 1.5, o[3]));
  }
  hipRoof(bag, [t0, u0, t1, u1], y + Ht, 3.2, 0.6);
  // the mirador beyond the wall: on its own foot, paired windows on three sides, a little tiled roof
  const mw = 2.6, M = [cx - mw, u0 - 3.4, cx + mw, u0], mt = 0.5, Hm = 4.2;
  bag.add(RED, box(M[0], y - 9, M[1], M[2], y - 0.5, M[3]));
  const zm = (M[1] + mt + M[3]) / 2, wN = [[cx - 0.78, cx + 0.78, y + 0.9, y + 3.0]], wS = [[zm - 0.78, zm + 0.78, y + 0.9, y + 3.0]];
  W([M[0], M[1], M[2], M[1] + mt], y - 0.5, y + Hm, wN, PL); W([M[0], M[1] + mt, M[0] + mt, M[3]], y - 0.5, y + Hm, wS, PL); W([M[2] - mt, M[1] + mt, M[2], M[3]], y - 0.5, y + Hm, wS, PL);
  pairedWindow(bag, face('z', M[1], 1), cx, y + 0.9, y + 3.0, mt);
  for (const [xa] of [[M[0]], [M[2] - mt]]) pairedWindow(bag, face('x', xa, 1), (M[1] + mt + M[3]) / 2, y + 0.9, y + 3.0, mt);
  dress(bag, face('z', M[1] + mt, 1), M[0] + mt, M[2] - mt, y, y + Hm, wN, { band: false });
  dress(bag, face('x', M[0] + mt, 1), M[1] + mt, M[3], y, y + Hm, wS, { band: false }); dress(bag, face('x', M[2] - mt, -1), M[1] + mt, M[3], y, y + Hm, wS, { band: false });
  tileFloor(bag, col, [M[0] + mt, M[1] + mt, M[2] - mt, M[3]], y);
  plankVault(bag, [M[0] + mt, M[1] + mt, M[2] - mt, M[3]], y + Hm - 0.6, 0.55, 'cedar', 'timber', 'x');
  bag.add(PL, box(M[0], y + Hm, M[1], M[2], y + Hm + 0.15, M[3]));
  hipRoof(bag, M, y + Hm + 0.15, 1.3, 0.4);
  // the portico: five arches on brick pillars, the middle one wider, the sebka over them; its ends, its back wall, the ceiling and the roof
  const P0 = el.portico ?? [t0 - 3, u1, t1 + 3, u1 + 3.4], [p0, q0, p1, q1] = P0, hc = 3.3, top = 5.2;
  const us = [0, 3.1, 6.2, 9.8, 12.9, 16.0].map((u) => u * (p1 - p0) / 16);
  for (const u of us) { const x = p0 + u; bag.add('brick', box(x - 0.3, y, q1 - 0.55, x + 0.3, y + hc - 0.14, q1 + 0.05)); col.rect([x - 0.3, q1 - 0.55, x + 0.3, q1 + 0.05], y, y + hc); }
  archRun(bag, [p0, q1 - 0.25], [p1, q1 - 0.25], us.map((u) => ({ u, w: 0.3 })), y, hc, top, { sebka: true });
  for (const [a, b] of [[p0 - 0.5, p0 - 0.3], [p1 + 0.3, p1 + 0.5]]) W([a, q0, b, q1 + 0.05], y - 0.5, y + top + 0.3, [], PL);
  W([p0 - 0.3, q0 - 0.6, t0, q0], y - 0.5, y + top + 1.2, [], PL); W([t1, q0 - 0.6, p1 + 0.3, q0], y - 0.5, y + top + 1.2, [], PL);
  dress(bag, face('z', u1, 1), t0, t1, y, y + top, [dS], { band: false });
  dress(bag, face('z', q0, 1), p0 - 0.3, t0, y, y + top, [], { band: false }); dress(bag, face('z', q0, 1), t1, p1 + 0.3, y, y + top, [], { band: false });
  bag.add('cedar', box(p0 - 0.3, y + top, q0, p1 + 0.3, y + top + 0.12, q1 - 0.5));
  for (let x = p0; x <= p1; x += 0.6) bag.add('timber', box(x - 0.05, y + top - 0.14, q0, x + 0.05, y + top, q1 - 0.5));
  const sl = [], ed = [], ya = y + top + 1.1, yb = y + top + 0.35, za = q0, zb = q1 + 0.4;
  q4(sl, [p0 - 0.6, ya, za], [p1 + 0.6, ya, za], [p1 + 0.6, yb, zb], [p0 - 0.6, yb, zb]);
  q4(ed, [p0 - 0.6, yb - 0.16, zb], [p1 + 0.6, yb - 0.16, zb], [p1 + 0.6, yb, zb], [p0 - 0.6, yb, zb]);
  q4(ed, [p0 - 0.6, ya - 0.16, za], [p1 + 0.6, ya - 0.16, za], [p1 + 0.6, yb - 0.16, zb], [p0 - 0.6, yb - 0.16, zb]);
  bag.add('roof_tile', dbl(sl)); bag.add('timber', dbl(ed));
  for (const xe of [p0 - 0.5, p1 + 0.5]) { const g = []; q4(g, [xe, y + top + 0.12, za], [xe, y + top + 0.12, q1 + 0.05], [xe, yb - 0.1, q1 + 0.05], [xe, ya - 0.1, za]); bag.add(PL, dbl(g)); }
  // the wall over the portico's roof up to the tower: closes the space between them
  bag.add(PL, box(p0 - 0.5, y + top + 0.12, q1 - 0.5, p1 + 0.5, yb - 0.1 + (ya - yb) * 0.0, q1 + 0.05));
  bag.add(MS, box(p0 - 0.3, y - 0.3, q0, p1 + 0.3, y + 0.06, q1 + 0.05)); col.floor([p0 - 0.3, q0, p1 + 0.3, q1 + 0.05], y + 0.06);
  // the paving of brick round the pool, the pool with its marble kerb brimming
  const [g0, h0, g1, h1] = el.pool, pave = [p0 - 2, q1 + 0.05, p1 + 2, h1 + 3];
  bag.add('brick_paving', box(pave[0], y - 0.3, pave[1], pave[2], y + 0.04, pave[3])); col.floor(pave, y + 0.04);
  for (const r of [[g0 - 0.45, h0 - 0.45, g1 + 0.45, h0], [g0 - 0.45, h1, g1 + 0.45, h1 + 0.45], [g0 - 0.45, h0, g0, h1], [g1, h0, g1 + 0.45, h1]]) bag.add(MS, box(r[0], y, r[1], r[2], y + 0.24, r[3]));
  bag.add('marble_dark', box(g0, y - 0.6, h0, g1, y - 0.55, h1));
  STYLES.qing.elements.water_rect({ rect: [g0, h0, g1, h1], y: y + 0.16 }, ctx);
  col.rect([g0 - 0.45, h0 - 0.45, g1 + 0.45, h1 + 0.45], y, y + 0.4);
  // its little jets at the south end, where the water enters
  for (const dx of [-1.6, 0, 1.6]) { const x = (g0 + g1) / 2 + dx; bag.add(MS, box(x - 0.18, y + 0.24, h1 + 0.05, x + 0.18, y + 0.42, h1 + 0.4)); bag.add('water_jet', rod([x, y + 0.42, h1 + 0.2], [x, y + 0.75, h1 - 0.25], 0.012, 4)); }
}

/** A prismatic marble tombstone (maqabriyya) over a grave: L long, along x when ax = 'x'; its sloping faces carved with bands of script. */
function tombstone(bag, x, z, y, L = 1.7, ax = 'x', w = 0.55) {
  const hl = L / 2, hw = w / 2, P = (a, h, b) => ax === 'x' ? [x + a, y + h, z + b] : [x + b, y + h, z + a];
  const r0 = ax === 'x' ? [x - hl - 0.08, z - hw - 0.08, x + hl + 0.08, z + hw + 0.08] : [x - hw - 0.08, z - hl - 0.08, x + hw + 0.08, z + hl + 0.08];
  bag.add(MS, box(r0[0], y, r0[1], r0[2], y + 0.14, r0[3]));
  const t = [];
  q4(t, P(-hl, 0.14, -hw), P(hl, 0.14, -hw), P(hl, 0.52, -0.03), P(-hl, 0.52, -0.03)); q4(t, P(hl, 0.14, hw), P(-hl, 0.14, hw), P(-hl, 0.52, 0.03), P(hl, 0.52, 0.03));
  q4(t, P(-hl, 0.52, -0.03), P(hl, 0.52, -0.03), P(hl, 0.52, 0.03), P(-hl, 0.52, 0.03));
  for (const a of [-hl, hl]) q4(t, P(a, 0.14, -hw), P(a, 0.52, -0.03), P(a, 0.52, 0.03), P(a, 0.14, hw));
  bag.add(MS, dbl(t));
  // the script: strokes standing on each sloping face
  const n = Math.floor(L / 0.075), k = (hw - 0.03) / 0.38;
  for (const s of [-1, 1]) for (let i = 1; i < n; i++) { const a = -hl + i * L / n, tall = (i * 5) % 3 === 0 ? 0.6 : (i % 2 ? 0.35 : 0.2); const v0 = 0.2, v1 = 0.2 + 0.26 * tall; bag.add('marble_dark', rod(P(a, v0, s * (hw - (v0 - 0.14) * k) + s * 0.012), P(a, v1, s * (hw - (v1 - 0.14) * k) + s * 0.012), 0.012, 3)); }
}

/**
 * rauda: { rect: [x0, z0, x1, z1] (the mausoleum, long along x, its door north), garden: [x0, z0, x1, z1] (south of it), y } —
 * the vestibule behind the scalloped horseshoe arch, the qubba under its star cupola, the side rooms through double arches.
 */
function rauda(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, t = 0.8, cx = (x0 + x1) / 2, H = 5.0, q = 3.0;
  const W = (r, y0, y1, holes = [], mat = PL) => holedWall(bag, col, mat, r, y0, y1, holes);
  const Q = [cx - q, z1 - t - 2 * q, cx + q, z1 - t], V = [cx - 2.4, z0 + t, cx + 2.4, Q[1] - 0.6], Hq = H + 1.0;
  const SW = [x0 + t, Q[1], Q[0] - 0.6, Q[3]], SE = [Q[2] + 0.6, Q[1], x1 - t, Q[3]];
  // the outer walls, the solid corners by the vestibule, the partitions with their arches
  const door = [cx - 0.8, cx + 0.8, y, y + 2.9];
  W([x0, z0, x1, z0 + t], y - 0.5, y + H, [door]); W([x0, z1 - t, x1, z1], y - 0.5, y + H);
  W([x0, z0 + t, x0 + t, z1 - t], y - 0.5, y + H); W([x1 - t, z0 + t, x1, z1 - t], y - 0.5, y + H);
  W([x0 + t, z0 + t, V[0], Q[1]], y - 0.5, y + H); W([V[2], z0 + t, x1 - t, Q[1]], y - 0.5, y + H);
  const dQ = [cx - 0.9, cx + 0.9, y, y + 3.0];
  W([V[0], V[3], V[2], Q[1]], y - 0.5, y + Hq, [dQ]);
  const sideA = [(Q[1] + Q[3]) / 2 - 1.5, (Q[1] + Q[3]) / 2 + 1.5, y, y + 3.2];
  W([Q[0] - 0.6, Q[1], Q[0], Q[3]], y - 0.5, y + Hq, [sideA]); W([Q[2], Q[1], Q[2] + 0.6, Q[3]], y - 0.5, y + Hq, [sideA]);
  // the qubba's walls rise above the rest, under the cupola's roof
  W([Q[0] - 0.6, Q[1] - 0.6, V[0], Q[1]], y + H, y + Hq); W([V[2], Q[1] - 0.6, Q[2] + 0.6, Q[1]], y + H, y + Hq); W([Q[0] - 0.6, Q[3], Q[2] + 0.6, Q[3] + 0.6], y + H, y + Hq);
  W([Q[0] - 0.6, Q[1] - 0.6, Q[2] + 0.6, Q[1]], y + Hq, y + Hq + 4.9); W([Q[0] - 0.6, Q[3], Q[2] + 0.6, Q[3] + 0.6], y + Hq, y + Hq + 4.9);
  W([Q[0] - 0.6, Q[1], Q[0], Q[3]], y + Hq, y + Hq + 4.9); W([Q[2], Q[1], Q[2] + 0.6, Q[3]], y + Hq, y + Hq + 4.9);
  archHead(bag, face('z', z0, 1), door[0], door[1], y + 2.1, y + 2.9, t, 'horseshoe', { both: true });
  archHead(bag, face('z', V[3], 1), dQ[0], dQ[1], y + 2.2, y + 3.0, 0.6, 'lobed', { both: true });
  for (const xa of [Q[0] - 0.6, Q[2]]) {
    // a double arch on a marble column into each side room
    const zm = (Q[1] + Q[3]) / 2, f = face('x', xa, 1);
    archHead(bag, f, sideA[0], zm - 0.12, y + 2.5, y + 3.2, 0.6, 'lobed', { both: true, alfiz: false }); archHead(bag, f, zm + 0.12, sideA[1], y + 2.5, y + 3.2, 0.6, 'lobed', { both: true, alfiz: false });
    bag.add(MS, box(xa, y + 2.36, zm - 0.12, xa + 0.6, y + 2.5, zm + 0.12)); bag.add(SC, box(xa, y + 2.5, zm - 0.12, xa + 0.6, y + 3.2, zm + 0.12));
    bag.add('marble', rod([xa + 0.3, y, zm], [xa + 0.3, y + 2.36, zm], 0.09, 8)); col.circle(xa + 0.3, zm, 0.1, y, y + 2.4);
  }
  // inside: the dado, stucco and script; the floors; the cupola of the qubba, the plank vaults of the side rooms and the vestibule
  dress(bag, face('z', Q[1], 1), Q[0], Q[2], y, y + Hq, [dQ]); dress(bag, face('z', Q[3], -1), Q[0], Q[2], y, y + Hq);
  dress(bag, face('x', Q[0], 1), Q[1], Q[3], y, y + Hq, [sideA]); dress(bag, face('x', Q[2], -1), Q[1], Q[3], y, y + Hq, [sideA]);
  starCeiling(bag, Q, y + Hq);
  for (const r of [SW, SE]) {
    dress(bag, face('z', r[1], 1), r[0], r[2], y, y + H - 0.8, [], { band: false }); dress(bag, face('z', r[3], -1), r[0], r[2], y, y + H - 0.8, [], { band: false });
    const outer = r === SW ? face('x', r[0], 1) : face('x', r[2], -1), inner = r === SW ? face('x', r[2], -1) : face('x', r[0], 1);
    dress(bag, outer, r[1], r[3], y, y + H - 0.8, [], { band: false }); dress(bag, inner, r[1], r[3], y, y + H - 0.8, [sideA], { band: false });
    plankVault(bag, r, y + H - 0.8, 0.7, 'cedar', 'timber', 'z');
    tileFloor(bag, col, r, y);
  }
  dress(bag, face('x', V[0], 1), V[1], V[3], y, y + H - 0.8, [], { band: false }); dress(bag, face('x', V[2], -1), V[1], V[3], y, y + H - 0.8, [], { band: false });
  dress(bag, face('z', V[1], 1), V[0], V[2], y, y + H - 0.8, [door], { band: false }); dress(bag, face('z', V[3], -1), V[0], V[2], y, y + H - 0.8, [dQ], { band: false });
  plankVault(bag, V, y + H - 0.8, 0.7, 'cedar', 'timber', 'x');
  tileFloor(bag, col, V, y); tileFloor(bag, col, Q, y);
  bag.add(MS, box(door[0], y - 0.3, z0, door[1], y + 0.05, z0 + t)); bag.add(MS, box(dQ[0], y - 0.3, V[3], dQ[1], y + 0.05, Q[1]));
  for (const xa of [Q[0] - 0.6, Q[2]]) bag.add(MS, box(xa, y - 0.3, sideA[0], xa + 0.6, y + 0.05, sideA[1]));
  // the tombstones: two in the qubba, one in each side room, over the graves below the floor
  tombstone(bag, cx - 1.1, (Q[1] + Q[3]) / 2 + 0.6, y + 0.05, 1.7, 'z'); tombstone(bag, cx + 1.1, (Q[1] + Q[3]) / 2 + 0.6, y + 0.05, 1.7, 'z');
  for (const r of [SW, SE]) tombstone(bag, (r[0] + r[2]) / 2, (r[1] + r[3]) / 2, y + 0.05, 1.7, 'z');
  col.rect([cx - 1.5, (Q[1] + Q[3]) / 2 - 0.4, cx + 1.5, (Q[1] + Q[3]) / 2 + 1.6], y, y + 0.6);
  bag.add('glass_lamp', rod([cx, y + Hq - 0.4, (Q[1] + Q[3]) / 2], [cx, y + Hq - 0.1, (Q[1] + Q[3]) / 2], 0.12, 8));
  // the qubba's small windows above the lower roofs, seen from outside
  for (const f of [face('z', Q[1] - 0.6, -1), face('z', Q[3] + 0.6, 1), face('x', Q[0] - 0.6, -1), face('x', Q[2] + 0.6, 1)]) for (const d of [-1.6, 0, 1.6]) {
    const m = (f.ax === 'z' ? cx : (Q[1] + Q[3]) / 2) + d, o = f.R(-0.02, 0.03, m - 0.3, m + 0.3), fr = f.R(0, 0.07, m - 0.42, m + 0.42);
    bag.add('opening', box(o[0], y + Hq + 1.6, o[1], o[2], y + Hq + 2.6, o[3])); bag.add(SC, box(fr[0], y + Hq + 2.6, fr[1], fr[2], y + Hq + 2.72, fr[3])); bag.add(SC, box(fr[0], y + Hq + 1.48, fr[1], fr[2], y + Hq + 1.6, fr[3]));
  }
  // the roofs: the cupola's pyramid over the qubba, tiled roofs over the rest
  hipRoof(bag, [Q[0] - 0.6, Q[1] - 0.6, Q[2] + 0.6, Q[3] + 0.6], y + Hq + 4.9, 2.6, 0.4);
  hipRoof(bag, [x0, z0, Q[0] - 0.6, z1], y + H, 1.6, 0.4); hipRoof(bag, [Q[2] + 0.6, z0, x1, z1], y + H, 1.6, 0.4);
  bag.add(PL, box(Q[0] - 0.2, y + H, z0, Q[2] + 0.2, y + H + 0.3, Q[1] - 0.6));
  // the garden of tombs to the south-east: its low wall and gate, the graves in rows under their stones, beds of myrtle
  if (el.garden) {
    const [g0, h0, g1, h1] = el.garden, gt = 0.6, gate = [h0 + 2.0, h0 + 3.5, y, y + 2.2];
    W([g0, h0, g1, h0 + gt], y - 0.5, y + 2.6); W([g0, h1 - gt, g1, h1], y - 0.5, y + 2.6);
    W([g0, h0 + gt, g0 + gt, h1 - gt], y - 0.5, y + 2.6, [gate]); archHead(bag, face('x', g0, 1), gate[0], gate[1], y + 1.6, y + 2.2, gt, 'horseshoe', { both: true, alfiz: false }); W([g1 - gt, h0 + gt, g1, h1 - gt], y - 0.5, y + 2.6);
    for (const r of [[g0, h0, g1, h0 + gt], [g0, h1 - gt, g1, h1], [g0, h0, g0 + gt, h1], [g1 - gt, h0, g1, h1]]) bag.add('roof_tile', box(r[0] - 0.08, y + 2.6, r[1] - 0.08, r[2] + 0.08, y + 2.75, r[3] + 0.08));
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const x = g0 + 2.4 + i * (g1 - g0 - 4.8) / 3, z = h0 + 3.0 + j * (h1 - h0 - 6) / 2; tombstone(bag, x, z, y, 1.6, 'z', 0.48); col.rect([x - 0.4, z - 0.9, x + 0.4, z + 0.9], y, y + 0.6); }
    for (const z of [h0 + 1.6, h1 - 1.6]) bag.add('lotus_leaf', box(g0 + 4.0, y, z - 0.4, g1 - 1.2, y + 0.7, z + 0.4));
    bag.add('ground', box(g0 + gt, y - 0.2, h0 + gt, g1 - gt, y + 0.03, h1 - gt));
  }
}

export const PARTAL = { partal, rauda };
