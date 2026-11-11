// An Ur house that can be entered, furnished (docs/settlements/ur.md §5.1): Woolley's courtyard house —
// the street door into a lobby, the brick-paved court open to the sky with its drain and the stair to
// the roof, round it the reception room, the domestic chapel with its niche and altar, the kitchen
// with its hearth and bread oven, a storeroom and a lavatory; flat roofs of mud on reed mats over
// palm trunks. Built in a frame turned to its front (the side of the street door).

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import { stairs } from './index.js';

const BB = 'brick_baked', MP = 'mud_plaster';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/**
 * ur_house_open: { rect, seed, door ('n'|'s'|'w'|'e': the street side), white } — rooms on three sides of the court
 * (the front range, the back range, one side range); walls of plastered mud brick on a footing of baked brick.
 */
export function urHouseOpen(el, { bag, col, lights }) {
  const rand = rng(el.seed || 7), [x0, z0, x1, z1] = el.rect, f = el.door ?? 's';
  const U = f === 'n' || f === 's' ? x1 - x0 : z1 - z0, V = f === 'n' || f === 's' ? z1 - z0 : x1 - x0;
  // the local frame: u along the front, v in from it
  const W = (u, v) => (f === 'n' ? [x0 + u, z0 + v] : f === 's' ? [x1 - u, z1 - v] : f === 'w' ? [x0 + v, z1 - u] : [x1 - v, z0 + u]);
  const R = (u0, v0, u1, v1) => { const a = W(u0, v0), b = W(u1, v1); return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])]; };
  const B = (mat, u0, v0, u1, v1, y0, y1) => { const r = R(u0, v0, u1, v1); bag.add(mat, box(r[0], y0, r[1], r[2], y1, r[3])); return r; };
  const LP = (u, v, y) => { const [x, z] = W(u, v); return [x, y, z]; };
  // a stain of soot on a wall at u (facing −u), centred on v, its half-width hw0 at y0 narrowing to hw1 at y1 (both faces)
  const soot = (u, v, hw0, hw1, y0, y1) => { const a = LP(u, v - hw0, y0), b = LP(u, v + hw0, y0), c = LP(u, v + hw1, y1), d = LP(u, v - hw1, y1); bag.add('pottery_dark', fromTriangles([...a, ...b, ...c, ...a, ...c, ...d, ...a, ...c, ...b, ...a, ...d, ...c])); };
  // a round thing (a lathe about the vertical) at (u, v, y)
  const L = (mat, prof, u, v, y, seg = 12) => { const [x, z] = W(u, v); bag.add(mat, lathe(prof, seg, null, x, y, z)); };
  const H = 3.4, t = 0.55, ti = 0.4, foot = 0.9 + Math.round(rand() * 2) * 0.15, up = el.white ? 'limewash_white' : MP;
  const cl = (a, lo, hi) => Math.max(lo, Math.min(hi, a)), dF = cl(V * 0.18, 1.9, 2.4), dB = cl(V * 0.26, 2.7, 3.4), dS = 2.6;                                  // the depths of the front, back and side ranges
  const vC0 = t + dF + ti, vC1 = V - t - dB - ti, uC0 = t, uC1 = U - t - dS - ti;   // the court
  // a wall from (u0, v0) to (u1, v1), full height, with doorways [{ a, b (along it), h }] cut in it
  const wall = (u0, v0, u1, v1, holes = [], h = H, outer = false) => {
    const alongU = u1 - u0 > v1 - v0, A = alongU ? u0 : v0, Bn = alongU ? u1 : v1;
    const seg = (a, b, y0, y1) => {
      if (b - a < 1e-3 || y1 - y0 < 1e-3) return;
      const q = alongU ? [a, v0, b, v1] : [u0, a, u1, b];
      if (outer && y0 < foot) { B(BB, ...q, y0, Math.min(foot, y1)); if (y1 > foot) B(up, ...q, foot, y1); } else B(outer ? up : MP, ...q, y0, y1);
      col.rect(R(...q), y0, y1);
    };
    let a = A;
    for (const o of [...holes].sort((p, q) => p.a - q.a)) { seg(a, o.a, -0.3, h); seg(o.a, o.b, o.h, h); a = o.b; }
    seg(a, Bn, -0.3, h);
  };
  // the doorways: the street door near the lobby's far end, the lobby's door into the court at its other end
  const lobby = [t, t + 2.0], dStreet = { a: t + 0.25, b: t + 1.2, h: 2.1 }, dLobby = { a: lobby[1] - 1.05, b: lobby[1] - 0.15, h: 2.0 };
  const lav = [lobby[1] + ti, lobby[1] + ti + 1.2], store = [lav[1] + ti, U - t];
  const dLav = { a: lav[0] + 0.2, b: lav[0] + 1.0, h: 2.0 }, sa = Math.max(store[0] + 0.1, Math.min(store[0] + 0.5, uC1 - 1.0)), dStore = { a: sa, b: Math.min(sa + 0.9, uC1 - 0.15), h: 2.0 };
  const recep = [t, Math.min(Math.max(t + 3.2, (U - t) * 0.6), uC1 - 1.4)], chapel = [recep[1] + ti, U - t];
  const dRec = { a: (recep[0] + Math.min(recep[1], uC1)) / 2 - 0.65, b: (recep[0] + Math.min(recep[1], uC1)) / 2 + 0.65, h: 2.3 };
  const ca = Math.max(chapel[0] + 0.1, Math.min(chapel[0] + 0.5, uC1 - 1.0)), dCh = { a: ca, b: Math.min(ca + 0.9, uC1 - 0.1), h: 2.0 };
  const kitchen = [vC0, vC1], dKit = { a: (vC0 + vC1) / 2 - 0.5, b: (vC0 + vC1) / 2 + 0.5, h: 2.0 };
  // the outer walls
  wall(0, 0, U, t, [dStreet], H, true); wall(0, V - t, U, V, [], H, true); wall(0, t, t, V - t, [], H, true); wall(U - t, t, U, V - t, [], H, true);
  // the inner walls round the court and between the rooms
  const ok = (o) => o.b - o.a > 0.6 && o.b <= uC1 + 0.01;
  wall(t, t + dF, U - t, t + dF + ti, [dLobby, dLav, dStore].filter(ok));
  wall(t, V - t - dB - ti, U - t, V - t - dB, [dRec, dCh].filter(ok));
  wall(uC1, vC0, uC1 + ti, vC1, [dKit]);
  wall(lobby[1], t, lav[0], t + dF); wall(lav[1], t, store[0], t + dF);
  wall(recep[1], V - t - dB, chapel[0], V - t);
  // lintels of palm trunk over the doorways, on the court side; the street door of cedar, open, and its threshold
  const lintel = (u0, u1, v, h) => { const a = W(u0 - 0.15, v), b = W(u1 + 0.15, v), T = []; beamTris(T, [a[0], h, a[1]], [b[0], h, b[1]], 0.1, 0.16); bag.add('palm_trunk', fromTriangles(T)); };
  lintel(dStreet.a, dStreet.b, -0.06, dStreet.h); B(BB, dStreet.a, -0.25, dStreet.b, t, -0.3, 0.1);
  B('cedar', dStreet.a + 0.02, t - 0.02, dStreet.a + 0.07, t + 0.88, 0.1, dStreet.h - 0.05);
  for (const o of [dLobby, dLav, dStore]) if (ok(o)) lintel(o.a, o.b, t + dF + ti + 0.06, o.h);
  for (const o of [dRec, dCh]) if (ok(o)) lintel(o.a, o.b, V - t - dB - ti - 0.06, o.h);
  { const a = W(uC1 - 0.06, dKit.a - 0.15), b = W(uC1 - 0.06, dKit.b + 0.15), T = []; beamTris(T, [a[0], dKit.h, a[1]], [b[0], dKit.h, b[1]], 0.1, 0.16); bag.add('palm_trunk', fromTriangles(T)); }
  // the reception room's door: two cedar leaves standing open into the room
  for (const [u, s] of [[dRec.a, 1], [dRec.b, -1]]) B('cedar', Math.min(u, u + s * 0.06), V - t - dB + 0.02, Math.max(u, u + s * 0.06), V - t - dB + 0.64, 0.08, dRec.h - 0.05);
  // the floors: baked brick in the court (sloping to its drain), the lavatory and the chapel; beaten earth under
  // reed mats elsewhere (brick here too, laid flat)
  B(BB, t, t, U - t, V - t, -0.3, 0.06); col.floor(R(0, 0, U, V), 0.06);
  const cu = (uC0 + uC1) / 2, cv = (vC0 + vC1) / 2;
  B('opening', cu - 0.16, cv - 0.16, cu + 0.16, cv + 0.16, 0.06, 0.064);
  // the roofs: mud over reed mats over palm trunks spanning each range; a parapet round the outside and the court
  const roof = (u0, v0, u1, v1, spanU) => {
    B(MP, u0, v0, u1, v1, H - 0.28, H); col.floor(R(u0, v0, u1, v1), H);
    B('reed_mat', u0, v0, u1, v1, H - 0.33, H - 0.28);
    if (spanU) for (let v = v0 + 0.35; v < v1 - 0.15; v += 0.6) { const a = W(u0, v), b = W(u1, v), T = []; beamTris(T, [a[0], H - 0.47, a[1]], [b[0], H - 0.47, b[1]], 0.07, 0.14); bag.add('palm_trunk', fromTriangles(T)); }
    else for (let u = u0 + 0.35; u < u1 - 0.15; u += 0.6) { const a = W(u, v0), b = W(u, v1), T = []; beamTris(T, [a[0], H - 0.47, a[1]], [b[0], H - 0.47, b[1]], 0.07, 0.14); bag.add('palm_trunk', fromTriangles(T)); }
  };
  roof(t, t, U - t, t + dF, false); roof(t, V - t - dB, U - t, V - t, false); roof(uC1 + ti, vC0, U - t, vC1, true);
  // (the roofs over the inner walls)
  B(MP, t, t + dF, U - t, vC0, H - 0.28, H); B(MP, t, vC1, U - t, V - t - dB, H - 0.28, H); B(MP, uC1, vC0, uC1 + ti, vC1, H - 0.28, H);
  for (const q of [[0, 0, U, 0.3], [0, V - 0.3, U, V], [0, 0.3, 0.3, V - 0.3], [U - 0.3, 0.3, U, V - 0.3]]) B(up, ...q, H, H + 0.5);
  for (const q of [[uC0 + 0.3, vC0 - 0.25, uC1, vC0], [uC0 + 0.95, vC1, uC1, vC1 + 0.25], [uC1, vC0 - 0.25, uC1 + 0.25, vC1 + 0.25]]) { B(MP, ...q, H, H + 0.4); col.rect(R(...q), H, H + 0.4); }
  // gutters: clay spouts through the parapet over the street and into the court
  for (const [u, v0, v1] of [[U * 0.7, -0.5, 0.3], [(uC0 + uC1) / 2, vC0 - 0.25, vC0 + 0.4]]) B('terracotta', u - 0.08, v0, u + 0.08, v1, H + 0.04, H + 0.16);

  // ---- the court: the stair to the roof along the left wall, jars, a water jar by the lobby door --------
  const run = vC1 - vC0;
  if (run >= 3.4) {
    const sa = W(uC0, vC0 + 0.2), sb = W(uC0 + 0.85, vC1);
    const dir = f === 'n' ? 's' : f === 's' ? 'n' : f === 'w' ? 'e' : 'w';
    stairs({ rect: [Math.min(sa[0], sb[0]), Math.min(sa[1], sb[1]), Math.max(sa[0], sb[0]), Math.max(sa[1], sb[1])], y0: 0.06, y1: H, dir, mat: BB }, { bag, col });
  }
  const jar = (u, v, s = 1, y = 0.06, mat = 'terracotta') => L(mat, [[0.001, 0], [0.1 * s, 0], [0.13 * s, 0.03], [0.24 * s, 0.25 * s], [0.25 * s, 0.42 * s], [0.18 * s, 0.6 * s], [0.09 * s, 0.68 * s], [0.11 * s, 0.74 * s], [0.08 * s, 0.75 * s], [0.07 * s, 0.7 * s], [0.001, 0.68 * s]], u, v, y);
  const bowl = (u, v, y, r = 0.12, mat = 'terracotta') => L(mat, [[0.001, 0], [r * 0.45, 0.005], [r, r * 0.45], [r * 0.93, r * 0.47], [r * 0.4, r * 0.12], [0.001, r * 0.1]], u, v, y, 12);
  jar(uC1 - 0.35, vC0 + 0.4, 1.1); jar(uC1 - 0.35, vC0 + 0.95, 0.9); bowl(uC1 - 0.8, vC0 + 0.35, 0.06, 0.15);
  // ---- the lobby: a brick bench, the jar for washing --------------------------------------------------
  B(BB, lobby[0] + 1.3, t + 0.05, lobby[1], t + 0.45, 0.06, 0.45); col.rect(R(lobby[0] + 1.3, t + 0.05, lobby[1], t + 0.45), 0, 0.45);
  jar(lobby[0] + 0.35, t + dF - 0.35, 1.0);
  // ---- the lavatory: brick footrests either side of a pottery drain, a jar of water -------------------
  { const c = (lav[0] + lav[1]) / 2, v = t + 0.9;
    B(BB, c - 0.42, v - 0.3, c - 0.12, v + 0.3, 0.06, 0.2); B(BB, c + 0.12, v - 0.3, c + 0.42, v + 0.3, 0.06, 0.2);
    B('opening', c - 0.1, v - 0.25, c + 0.1, v + 0.25, 0.06, 0.065); B('terracotta', c - 0.12, v - 0.27, c + 0.12, v + 0.27, 0.06, 0.062);
    jar(lav[1] - 0.3, t + dF - 0.3, 0.8); }
  // ---- the storeroom: great jars in a row, sacks of barley, baskets of dates ---------------------------
  if (store[1] - store[0] > 1.2) {
    for (let u = store[0] + 0.45; u < store[1] - 0.35; u += 0.62) { L('terracotta', [[0.15, 0], [0.3, 0.2], [0.32, 0.55], [0.24, 0.92], [0.15, 1.02], [0.17, 1.08], [0.001, 1.06]], u, t + 0.45, 0.06, 14); col.circle(...W(u, t + 0.45), 0.3, 0, 1.1); }
    for (let k = 0; k < 2; k++) { const u = store[0] + 0.5 + k * 0.65, v = t + dF - 0.45; L('sacking', [[0.001, 0], [0.22, 0.02], [0.26, 0.25], [0.22, 0.5], [0.08, 0.6], [0.001, 0.6]], u, v, 0.06, 10); }
    L('wicker', [[0.001, 0], [0.2, 0.01], [0.24, 0.3], [0.22, 0.31], [0.18, 0.04], [0.001, 0.04]], store[1] - 0.4, t + dF - 0.4, 0.06, 12);
    for (const [du, dv] of [[0, 0], [0.08, 0.06], [-0.07, 0.05], [0.02, -0.07]]) L('cedar', [[0.001, 0], [0.035, 0.03], [0.04, 0.07], [0.001, 0.1]], store[1] - 0.4 + du, t + dF - 0.4 + dv, 0.3, 6);   // dates
  }
  // ---- the kitchen (the side range): the hearth against the outer wall, the bread oven, the quern on its
  // bench, the water jar, fuel, pots; soot over the hearth -------------------------------------------------
  { const ua = uC1 + ti, ub = U - t, vk = (vC0 + vC1) / 2, h0 = 0.06;
    // the hearth: a kerb of brick open toward the room, ash and embers
    B(BB, ub - 0.75, vk - 0.6, ub, vk - 0.45, h0, 0.3); B(BB, ub - 0.75, vk + 0.45, ub, vk + 0.6, h0, 0.3);
    B('pottery_dark', ub - 0.75, vk - 0.45, ub, vk + 0.45, h0, 0.09);
    L('pottery_dark', [[0.001, 0], [0.16, 0.02], [0.22, 0.14], [0.2, 0.24], [0.15, 0.27], [0.001, 0.27]], ub - 0.38, vk, 0.3, 12);
    soot(ub - 0.012, vk, 0.55, 0.3, 0.9, 2.6);                                                                          // soot on the wall over it
    // the oven (tannur): a clay dome open at the top, in the corner by the court
    L('terracotta', [[0.38, 0], [0.37, 0.4], [0.28, 0.75], [0.16, 0.85], [0.15, 0.85], [0.26, 0.74], [0.34, 0.4], [0.35, 0.03]], ua + 0.5, vC1 - 0.5, h0, 16); col.circle(...W(ua + 0.5, vC1 - 0.5), 0.4, 0, 0.9);
    // the quern: a saddle stone of basalt on a mud bench, the rubbing stone on it, a bowl of grain
    B(MP, ua + 0.05, vC0 + 0.1, ua + 0.75, vC0 + 1.05, h0, 0.5); col.rect(R(ua + 0.05, vC0 + 0.1, ua + 0.75, vC0 + 1.05), 0, 0.5);
    B('basalt', ua + 0.2, vC0 + 0.25, ua + 0.6, vC0 + 0.9, 0.5, 0.6); B('basalt', ua + 0.25, vC0 + 0.5, ua + 0.55, vC0 + 0.62, 0.6, 0.68);
    bowl(ua + 0.4, vC0 + 1.4, h0, 0.17);
    jar(ub - 0.35, vC1 - 0.35, 1.15); bowl(ub - 0.35, vC1 - 0.35, 0.06 + 0.86, 0.1);
    // dried dung cakes and palm ribs for fuel
    for (let k = 0; k < 5; k++) L('pottery_dark', [[0.001, 0], [0.13, 0.005], [0.14, 0.035], [0.001, 0.04]], ub - 0.35, vC0 + 0.35, h0 + k * 0.04, 10);
    for (let k = 0; k < 4; k++) { const a = W(ua + 0.9 + k * 0.08, vC0 + 0.12), b = W(ua + 0.98 + k * 0.08, vC0 + 1.1), T = []; beamTris(T, [a[0], h0, a[1]], [b[0], h0 + 0.05, b[1]], 0.025, 0.04); bag.add('palm_trunk', fromTriangles(T)); }
    lights.push({ at: LP(ub - 0.4, vk, 0.45), color: '#ff9a4a', intensity: 3, distance: 5 }); }
  // ---- the reception room: reed mats, the couch, stools, a low table with a jug and cups, a lamp in a niche
  if (!el.school) { const ra = recep[0], rb = recep[1], va = V - t - dB, vb = V - t, h0 = 0.06;
    B('reed_mat', ra + 0.25, va + 0.25, rb - 0.25, vb - 0.25, h0, h0 + 0.012);
    // the couch: a timber frame on four legs, a webbing of cord, a linen mattress and a red coverlet, along the back wall
    const cu0 = ra + 0.4, cu1 = cu0 + 1.9, cv1 = vb - 0.08, cv0 = cv1 - 0.85, ch = 0.45;
    for (const [u, v] of [[cu0, cv0], [cu1, cv0], [cu0, cv1], [cu1, cv1]]) B('timber', u - 0.04, v - 0.04, u + 0.04, v + 0.04, h0 + 0.012, ch);
    for (const q of [[cu0 - 0.05, cv0 - 0.05, cu1 + 0.05, cv0 + 0.02], [cu0 - 0.05, cv1 - 0.02, cu1 + 0.05, cv1 + 0.05], [cu0 - 0.05, cv0 + 0.02, cu0 + 0.02, cv1 - 0.02], [cu1 - 0.02, cv0 + 0.02, cu1 + 0.05, cv1 - 0.02]]) B('timber', ...q, ch - 0.06, ch);
    B('linen', cu0 + 0.02, cv0 + 0.02, cu1 - 0.02, cv1 - 0.02, ch - 0.05, ch + 0.07); col.rect(R(cu0, cv0, cu1, cv1), 0, ch + 0.07);
    B('cloth_red', cu0 + 0.5, cv0 - 0.01, cu1 - 0.1, cv1 - 0.01, ch + 0.07, ch + 0.085); B('cloth_red', cu0 + 0.5, cv0 - 0.025, cu1 - 0.1, cv0 - 0.01, ch - 0.25, ch + 0.085);
    L('linen', [[0.001, 0], [0.09, 0.0], [0.1, 0.06], [0.09, 0.12], [0.001, 0.12]], cu0 + 0.2, (cv0 + cv1) / 2, ch + 0.07, 8);
    // the low table with a spouted jug and three cups; two stools
    const tu = (cu0 + cu1) / 2, tv = cv0 - 0.75;
    B('timber', tu - 0.4, tv - 0.25, tu + 0.4, tv + 0.25, 0.42, 0.46); for (const [du, dv] of [[-0.34, -0.19], [0.34, -0.19], [-0.34, 0.19], [0.34, 0.19]]) B('timber', tu + du - 0.03, tv + dv - 0.03, tu + du + 0.03, tv + dv + 0.03, h0 + 0.012, 0.42);
    col.rect(R(tu - 0.4, tv - 0.25, tu + 0.4, tv + 0.25), 0, 0.46);
    L('terracotta', [[0.001, 0], [0.06, 0.01], [0.1, 0.1], [0.09, 0.17], [0.04, 0.22], [0.045, 0.26], [0.001, 0.25]], tu - 0.18, tv, 0.46, 10);
    for (const du of [0.05, 0.18, 0.3]) bowl(tu + du, tv + (du > 0.15 ? 0.1 : -0.08), 0.46, 0.05);
    for (const du of [-0.75, 0.75]) { const su = tu + du; B('timber', su - 0.18, tv - 0.15, su + 0.18, tv + 0.15, 0.36, 0.4); for (const [a, b] of [[-0.14, -0.11], [0.14, -0.11], [-0.14, 0.11], [0.14, 0.11]]) B('timber', su + a - 0.02, tv + b - 0.02, su + a + 0.02, tv + b + 0.02, h0 + 0.012, 0.36); }
    // a lamp-niche in the end wall, the clay lamp burning in it; a chest; a basket
    const nv = (va + vb) / 2; soot(ra + 0.012, nv, 0.14, 0.05, 1.3, 1.95);                                       // soot over the lamp
    L('terracotta', [[0.001, 0], [0.05, 0.005], [0.06, 0.03], [0.03, 0.045], [0.001, 0.04]], ra + 0.12, nv, 1.25, 10); B(MP, ra, nv - 0.15, ra + 0.24, nv + 0.15, 1.12, 1.25);
    B('flame', ra + 0.17, nv - 0.012, ra + 0.19, nv + 0.012, 1.29, 1.33);
    lights.push({ at: LP(ra + 0.35, nv, 1.45), color: '#ffb46b', intensity: 2.5, distance: 6 });
    B('cedar', rb - 0.95, vb - 0.6, rb - 0.15, vb - 0.1, h0 + 0.012, 0.55); B('bronze', rb - 0.96, vb - 0.61, rb - 0.14, vb - 0.09, 0.5, 0.52); col.rect(R(rb - 0.95, vb - 0.6, rb - 0.15, vb - 0.1), 0, 0.55);
    L('wicker', [[0.001, 0], [0.16, 0.01], [0.2, 0.28], [0.18, 0.29], [0.14, 0.04], [0.001, 0.04]], rb - 0.5, va + 0.45, h0 + 0.012, 12);
  }
  // ---- the school (edubba) in place of the reception room (el.school): rows of low mud-brick benches facing the master's
  // seat, tablets drying on them, baskets of finished tablets, clay bins and a basin of water in the court for the clay ----
  if (el.school) {
    const ra = recep[0], rb = recep[1], va = V - t - dB, vb = V - t, h0 = 0.06, mid = (va + vb) / 2;
    B('reed_mat', ra + 0.2, va + 0.2, rb - 0.2, vb - 0.2, h0, h0 + 0.012);
    for (const [v0, v1] of [[va + 0.35, va + 0.8], [va + 1.25, va + 1.7]]) {
      B(MP, ra + 0.9, v0, rb - 0.35, v1, h0, 0.42); col.rect(R(ra + 0.9, v0, rb - 0.35, v1), 0, 0.42);                   // a bench of mud brick, the pupils sitting on its far side
      for (let u = ra + 1.1; u < rb - 0.7; u += 0.5) B('mud_plaster', u, v0 + 0.1, u + 0.3, v1 - 0.1, 0.42, 0.455);          // the tablets they are copying
    }
    B('timber', ra + 0.25, mid - 0.2, ra + 0.65, mid + 0.2, h0 + 0.012, 0.4); col.rect(R(ra + 0.25, mid - 0.2, ra + 0.65, mid + 0.2), 0, 0.4);   // the master's stool
    L('wicker', [[0.001, 0], [0.2, 0.01], [0.24, 0.3], [0.22, 0.31], [0.18, 0.04], [0.001, 0.04]], rb - 0.5, vb - 0.4, h0 + 0.012, 12);
    for (let k = 0; k < 5; k++) B('mud_plaster', rb - 0.62 + (k % 2) * 0.06, vb - 0.46, rb - 0.4 + (k % 2) * 0.06, vb - 0.34, h0 + 0.2 + k * 0.03, h0 + 0.23 + k * 0.03);
    soot(ra + 0.012, mid, 0.14, 0.05, 1.3, 1.95);
    L('terracotta', [[0.001, 0], [0.05, 0.005], [0.06, 0.03], [0.03, 0.045], [0.001, 0.04]], ra + 0.12, mid, 1.25, 10); B(MP, ra, mid - 0.15, ra + 0.24, mid + 0.15, 1.12, 1.25);
    B('flame', ra + 0.17, mid - 0.012, ra + 0.19, mid + 0.012, 1.29, 1.33);
    lights.push({ at: LP(ra + 0.35, mid, 1.45), color: '#ffb46b', intensity: 2.5, distance: 6 });
    // the court: two clay-lined bins sunk in a corner (the clay is soaked and reused) and a basin of water
    const bu = uC0 + 1.2, bv = vC1 - 0.9;
    for (const du of [0, 1.2]) { B(MP, bu + du, bv, bu + du + 0.95, bv + 0.7, 0.06, 0.4); B('bitumen', bu + du + 0.1, bv + 0.1, bu + du + 0.85, bv + 0.6, 0.38, 0.41); col.rect(R(bu + du, bv, bu + du + 0.95, bv + 0.7), 0, 0.4); }
    L('terracotta', [[0.001, 0], [0.2, 0.0], [0.34, 0.14], [0.36, 0.2], [0.3, 0.21], [0.001, 0.15]], bu + 3.0, bv + 0.35, 0.06, 14);
  }
  // ---- the chapel: the niche in the end wall and the altar of brickwork before it, offering bowls, a clay
  // figurine, a lamp; the family's dead lie under its pavement ---------------------------------------------
  if (chapel[1] - chapel[0] > 1.4) {
    const ua = chapel[0], ub = chapel[1], va = V - t - dB, vb = V - t, nv = (va + vb) / 2;
    // the niche: jambs and a lintel standing out from the wall, its back whitened
    for (const s of [-1, 1]) B(MP, ub - 0.22, nv + s * 0.4 - (s > 0 ? 0 : 0.15), ub, nv + s * 0.4 + (s > 0 ? 0.15 : 0), 0.06, 2.4);
    B(MP, ub - 0.22, nv - 0.4, ub, nv + 0.4, 2.1, 2.4); B('plaster_white', ub - 0.012, nv - 0.4, ub, nv + 0.4, 0.9, 2.1);
    B(BB, ub - 1.0, nv - 0.5, ub - 0.18, nv + 0.5, 0.06, 0.85); col.rect(R(ub - 1.0, nv - 0.5, ub - 0.18, nv + 0.5), 0, 0.85);
    B(MP, ub - 1.02, nv - 0.52, ub - 0.18, nv + 0.52, 0.85, 0.9);
    L('terracotta', [[0.001, 0], [0.04, 0.0], [0.05, 0.08], [0.03, 0.14], [0.035, 0.2], [0.02, 0.24], [0.001, 0.24]], ub - 0.35, nv, 0.9, 8);   // the figurine
    for (const dv of [-0.3, 0.3]) bowl(ub - 0.6, nv + dv, 0.9, 0.1);
    L('terracotta', [[0.001, 0], [0.05, 0.005], [0.06, 0.03], [0.03, 0.045], [0.001, 0.04]], ub - 0.8, nv, 0.9, 10); B('flame', ub - 0.76, nv - 0.012, ub - 0.74, nv + 0.012, 0.94, 0.98);
    lights.push({ at: LP(ub - 1.1, nv, 1.2), color: '#ffb46b', intensity: 2, distance: 5 });
    // the vaulted tomb under the floor shows as a patch of relaid bricks
    B(BB, ua + 0.3, va + 0.6, ub - 1.3, vb - 0.6, 0.06, 0.075);
  }
}

/** A local frame at `at` turned by rot (as a figure is: rot 0 faces −z): P(lx, y, lz) → world. */
function frame(el) {
  const [X, Z] = el.at, Y = el.y ?? 0, c = Math.cos(el.rot ?? 0), s = Math.sin(el.rot ?? 0);
  return (lx, y, lz) => [X + lx * c + lz * s, Y + y, Z - lx * s + lz * c];
}
/** A box in a turned frame (its eight corners turned, faces both ways not needed: a closed convex solid). */
function tbox(P, x0, y0, z0, x1, y1, z1) {
  const g = box(x0, y0, z0, x1, y1, z1), A = g.attributes.position, Nn = g.attributes.normal, o = P(0, 0, 0);
  for (let i = 0; i < A.count; i++) {
    const w = P(A.getX(i), A.getY(i), A.getZ(i)); A.setXYZ(i, w[0], w[1], w[2]);
    const n = P(Nn.getX(i), 0, Nn.getZ(i)); Nn.setXYZ(i, n[0] - o[0], Nn.getY(i), n[2] - o[2]);
  }
  return g;
}
const at = (P, g, lx, y, lz) => { const w = P(lx, y, lz); return g.translate(w[0], w[1], w[2]); };

/**
 * scribe_kit: { at, y, rot, scroll } — where a scribe sits cross-legged (the figure is placed apart): his reed mat, before
 * him tablets of unbaked clay drying in a row and the one he writes, a lump of clay wrapped in a damp cloth, a bowl
 * of water, a basket holding finished tablets, a jar of styluses of reed; with `scroll` the Aramaic scribe's leather
 * scroll on its board, an ink pot and a pen as well.
 */
export function scribeKit(el, { bag }) {
  const P = frame(el);
  bag.add('reed_mat', tbox(P, -0.7, 0, -1.05, 0.7, 0.012, 0.55));
  for (let k = 0; k < 6; k++) { const x = -0.45 + k * 0.17, z = -0.85; bag.add('mud_plaster', tbox(P, x - 0.05, 0.012, z - 0.07, x + 0.05, 0.035, z + 0.07)); }
  if (!el.scroll) bag.add('mud_plaster', tbox(P, -0.09, 0.012, -0.5, 0.09, 0.04, -0.38));
  bag.add('linen', at(P, lathe([[0.001, 0], [0.11, 0.0], [0.12, 0.05], [0.07, 0.1], [0.001, 0.11]], 8), 0.45, 0.012, -0.45));
  bag.add('terracotta', at(P, lathe([[0.001, 0], [0.05, 0.0], [0.11, 0.05], [0.1, 0.055], [0.04, 0.012], [0.001, 0.01]], 12), -0.48, 0.012, -0.45));
  bag.add('wicker', at(P, lathe([[0.001, 0], [0.16, 0.0], [0.2, 0.22], [0.18, 0.23], [0.14, 0.03], [0.001, 0.03]], 12), 0.55, 0.012, 0.15));
  for (let k = 0; k < 4; k++) bag.add('mud_plaster', at(P, box(-0.05, 0, -0.07, 0.05, 0.03, 0.07), 0.55 + (k % 2 ? 0.04 : -0.05), 0.04 + k * 0.03 + 0.012, 0.15 + (k % 2 ? -0.03 : 0.04)));
  if (el.scroll) {
    // the Aramaic scribe's leather scroll unrolled on a board across his knees' place, its rolled ends, the ink pot and the pen
    bag.add('timber', tbox(P, -0.32, 0.012, -0.52, 0.32, 0.03, -0.3));
    bag.add('hide_tan', tbox(P, -0.24, 0.03, -0.5, 0.24, 0.034, -0.32));
    for (const x of [-0.27, 0.27]) { const a = P(x, 0.055, -0.5), b = P(x, 0.055, -0.32), T = []; beamTris(T, [a[0], a[1] - 0.025, a[2]], [b[0], b[1] - 0.025, b[2]], 0.025, 0.05); bag.add('hide_tan', fromTriangles(T)); }
    bag.add('pottery_dark', at(P, lathe([[0.001, 0], [0.035, 0], [0.04, 0.05], [0.015, 0.06], [0.001, 0.06]], 8), 0.36, 0.012, -0.4));
    { const a = P(0.05, 0.036, -0.42), b = P(0.2, 0.04, -0.36), T = []; beamTris(T, a, b, 0.004, 0.005); bag.add('reed_mat', fromTriangles(T)); }
  }
  bag.add('terracotta', at(P, lathe([[0.001, 0], [0.04, 0], [0.05, 0.1], [0.035, 0.16], [0.04, 0.18], [0.001, 0.17]], 10), -0.55, 0.012, 0.1));
  for (const dx of [-0.01, 0.012]) { const a = P(-0.55 + dx, 0.16, 0.1), b = P(-0.55 + dx * 3, 0.36, 0.1 + dx * 2), T = []; beamTris(T, a, b, 0.005, 0.006); bag.add('reed_mat', fromTriangles(T)); }
}
/**
 * quay_goods: { at, y, rot, kind ('jars' | 'reeds' | 'net') } — a load landed on the quay: jars of oil and grain
 * standing in rows with two laid on their sides; bundles of reeds stacked; a fisherman's net heaped beside him.
 */
export function quayGoods(el, { bag, col }) {
  const P = frame(el), jarP = [[0.001, 0], [0.1, 0], [0.16, 0.06], [0.22, 0.3], [0.2, 0.52], [0.1, 0.64], [0.11, 0.7], [0.001, 0.69]];
  if (el.kind === 'jars') {
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) bag.add(i + j === 3 ? 'pottery_dark' : 'terracotta', at(P, lathe(jarP, 12), -0.75 + i * 0.48, 0, -0.25 + j * 0.48));
    for (let i = 0; i < 2; i++) { const g = lathe(jarP, 12).rotateX(Math.PI / 2).translate(0, 0.21, -0.35); bag.add('terracotta', at(P, g.rotateY(0.3 * i), 1.3, 0, -0.3 + i * 0.6)); }
    col.circle(el.at[0], el.at[1], 1.1, el.y ?? 0, (el.y ?? 0) + 0.7);
  } else if (el.kind === 'reeds') {
    for (let k = 0; k < 7; k++) { const row = k < 4 ? 0 : 1, i = row ? k - 4 : k, x = -0.5 + i * 0.32 + row * 0.16, y = 0.14 + row * 0.25, a = P(x, y, -1.4), b = P(x + 0.02, y, 1.4), T = []; beamTris(T, [a[0], a[1] - 0.14, a[2]], [b[0], b[1] - 0.14, b[2]], 0.15, 0.27); bag.add('reed_mat', fromTriangles(T)); }
    col.circle(el.at[0], el.at[1], 1.2, el.y ?? 0, (el.y ?? 0) + 0.6);
  } else {
    bag.add('rope_fibre', at(P, lathe([[0.001, 0], [0.45, 0.0], [0.38, 0.12], [0.2, 0.2], [0.001, 0.22]], 14), 0.6, 0, 0));
    bag.add('rope_fibre', tbox(P, -0.5, 0, -0.6, 0.25, 0.02, 0.4));
    for (let k = 0; k < 6; k++) bag.add('palm_trunk', at(P, lathe([[0.03, 0], [0.03, 0.05], [0.001, 0.05]], 6), -0.45 + k * 0.14, 0.02, -0.6));   // the floats
  }
}
