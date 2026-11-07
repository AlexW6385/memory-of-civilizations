// The ground floor of an Amsterdam canal house about 1670, furnished (docs/settlements/amsterdam.md §5.9): the
// front hall (voorhuis) with its floor of black and white marble laid on the diagonal, the stair up, the linen
// cupboard (kast) with its Delftware, paintings and a wall map; behind the partition the living room (zaal or
// binnenhaard) with the hooded hearth and its painted chimneypiece, the box bed (bedstede) behind its curtains,
// the table under a Turkish carpet with its Spanish chairs, a mirror and more paintings; Delft tiles as the
// skirting of every wall, the beamed and boarded ceiling. Built in the house's front frame F (u along the front,
// d outward from it — the house lies at d < 0 — v up from y).

import { box, lathe, rod } from '../../core/geom.js';
import { fbox, vprism, sideprism } from './facade.js';

const ST = 'sandstone_dressed', OAK = 'wood_dark', PL = 'plaster_white';
/** Sutherland–Hodgman: the convex polygon pts ([[u, d]…]) clipped to the box [u0, u1] × [d0, d1]. */
function clip(pts, u0, u1, d0, d1) {
  const edges = [[(p) => p[0] - u0], [(p) => u1 - p[0]], [(p) => p[1] - d0], [(p) => d1 - p[1]]];
  let out = pts;
  for (const [f] of edges) {
    const inp = out; out = [];
    for (let i = 0; i < inp.length; i++) {
      const a = inp[i], b = inp[(i + 1) % inp.length], fa = f(a), fb = f(b);
      if (fa >= 0) out.push(a);
      if ((fa >= 0) !== (fb >= 0)) { const t = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    }
    if (out.length < 3) return [];
  }
  return out;
}

/**
 * canalInterior: o = { w, Dm (the main block's depth), base (the ground floor's level), g (its height), H (the
 * eaves), mat (the brick), du (the front door's u), dw (its half-width), dh (its height), wins (the ground floor's
 * window centres u), ww (their width), seed }. Builds the main block's walls, floors and ceiling round the
 * ground floor (the basement below and the upper floors above stay solid) and furnishes it.
 */
export function canalInterior(bag, col, F, y, o) {
  const { w, Dm, base: b, g, H, mat, du, dw, dh, wins, ww } = o;
  const T = 0.3, P = 0.22, top = b + g, fl = b + 0.03;
  const A = (m, u0, u1, v0, v1, d0, d1) => bag.add(m, fbox(F, y, Math.min(u0, u1), Math.max(u0, u1), Math.min(v0, v1), Math.max(v0, v1), Math.min(d0, d1), Math.max(d0, d1)));
  const C = (u0, u1, d0, d1, v0, v1) => { const p = F.at(u0, d0), q = F.at(u1, d1); col.rect([Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])], y + v0, y + v1); };
  const W = (m, u0, u1, v0, v1, d0, d1) => { A(m, u0, u1, v0, v1, d0, d1); C(Math.min(u0, u1), Math.max(u0, u1), Math.min(d0, d1), Math.max(d0, d1), v0, v1); };
  const at3 = (u, v, d) => { const [x, z] = F.at(u, d); return [x, y + v, z]; };
  const lat = (m, prof, seg, u, v, d) => { const [x, z] = F.at(u, d); bag.add(m, lathe(prof, seg, null, x, y + v, z)); };
  const left = du < w / 2, sU = (k) => (left ? P + k : w - P - k);          // u measured in from the door side's party wall
  const fU = (k) => (left ? w - P - k : P + k);                               // … and from the far one
  const iu0 = P, iu1 = w - P, dF = -T, dB = -Dm + T;
  const dP = -Math.max(3.4, Math.min(5.8, Dm * 0.47)), pT = 0.15;            // the partition between the hall and the room behind
  // ---- the shell: the basement and the upper floors solid, the party walls, the back wall, the front with its door and windows
  W(mat, 0, w, -0.6, b, -Dm, 0); col.floor((() => { const p = F.at(iu0, dF), q = F.at(iu1, dB); return [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; })(), y + fl);
  W(mat, 0, w, top, H, -Dm, 0);
  W(mat, 0, P, b, top, -Dm, 0); W(mat, w - P, w, b, top, -Dm, 0); W(mat, P, w - P, b, top, -Dm, dB);
  const holes = [{ u0: du - dw, u1: du + dw, v0: b, v1: b + dh, door: true }, ...wins.map((u) => ({ u0: u - ww / 2, u1: u + ww / 2, v0: b + 0.45, v1: b + 3.0 }))].sort((p, q) => p.u0 - q.u0);
  let cur = P;
  for (const h of holes) {
    if (h.u0 > cur + 1e-3) W(mat, cur, h.u0, b, top, dF, 0);
    if (h.v0 > b + 1e-3) W(mat, h.u0, h.u1, b, h.v0, dF, 0);
    W(mat, h.u0, h.u1, h.v1, top, dF, 0);
    if (!h.door) C(h.u0, h.u1, dF, 0, b, top);
    cur = h.u1;
  }
  if (cur < w - P - 1e-3) W(mat, cur, w - P, b, top, dF, 0);
  // the plastered inner faces (whitewashed), the front's round its openings
  const lin = 0.02;
  A(PL, iu0, iu0 + lin, fl, top - 0.03, dB, dF); A(PL, iu1 - lin, iu1, fl, top - 0.03, dB, dF); A(PL, iu0 + lin, iu1 - lin, fl, top - 0.03, dB, dB - lin);
  cur = iu0 + lin;
  for (const h of holes) {
    if (h.u0 > cur + 1e-3) A(PL, cur, h.u0, fl, top - 0.03, dF - lin, dF);
    if (h.v0 > fl + 1e-3) A(PL, h.u0, h.u1, fl, h.v0, dF - lin, dF);
    A(PL, h.u0, h.u1, h.v1, top - 0.03, dF - lin, dF);
    cur = h.u1;
  }
  A(PL, cur, iu1 - lin, fl, top - 0.03, dF - lin, dF);
  // the front door's two leaves standing open into the hall, their panels; the stone threshold
  for (const s of [-1, 1]) {
    const e = du + s * dw, t = 0.06;
    A(o.leaf ?? OAK, e, e - s * t, b + 0.04, b + dh - 0.02, dF - lin, dF - lin - dw + 0.04);
    for (const [v0, v1] of [[0.35, 1.1], [1.35, 2.2]]) A(OAK, e - s * t, e - s * (t + 0.02), b + v0, b + v1, dF - 0.14, dF - dw + 0.1);
  }
  A(ST, du - dw, du + dw, b - 0.06, b + 0.035, dF - lin, 0.02);

  // ---- the floors: the hall's marble on the diagonal, the room's broad boards; the partition with its door
  const zone = (d0, d1) => [Math.min(d0, d1), Math.max(d0, d1)];
  { const [d0, d1] = zone(dP, dF - lin), a = 0.42, R = Math.SQRT1_2;
    for (let i = -40; i < 40; i++) for (let j = -40; j < 40; j++) {
      const sq = [[i * a, j * a], [(i + 1) * a, j * a], [(i + 1) * a, (j + 1) * a], [i * a, (j + 1) * a]].map(([p, q]) => [(p + q) * R + iu0, (p - q) * R + dF]);
      if (sq.every(([u]) => u < iu0 + lin) || sq.every(([u]) => u > iu1 - lin) || sq.every(([, d]) => d < d0) || sq.every(([, d]) => d > d1)) continue;
      const cl = clip(sq, iu0 + lin, iu1 - lin, d0, d1);
      if (cl.length >= 3) bag.add((i + j) & 1 ? 'marble_dark' : 'marble_smooth', vprism(cl.map(([u, d]) => F.at(u, d)), y + b, y + fl));
    }
  }
  { const [d0, d1] = zone(dB + lin, dP - pT);
    for (let u = iu0 + lin, k = 0; u < iu1 - lin - 0.05; k++) { const u1 = Math.min(iu1 - lin, u + 0.27 + ((k * 7) % 3) * 0.02); A('timber', u, u1 - 0.006, b, fl, d0, d1); u = u1; } }
  const pdu = w / 2 + (left ? 0.25 : -0.25), pw = 0.46, ph = 2.15;
  W(PL, iu0 + lin, pdu - pw, b, top - 0.03, dP - pT, dP); W(PL, pdu + pw, iu1 - lin, b, top - 0.03, dP - pT, dP); A(PL, pdu - pw, pdu + pw, b + ph, top - 0.03, dP - pT, dP);
  A(OAK, pdu - pw - 0.1, pdu - pw, b, b + ph + 0.1, dP - pT - 0.03, dP + 0.03); A(OAK, pdu + pw, pdu + pw + 0.1, b, b + ph + 0.1, dP - pT - 0.03, dP + 0.03);
  A(OAK, pdu - pw - 0.1, pdu + pw + 0.1, b + ph, b + ph + 0.12, dP - pT - 0.03, dP + 0.03); A(OAK, pdu - pw, pdu + pw, b, fl + 0.01, dP - pT, dP);
  // its door leaf standing open against the room's side of the partition
  A(OAK, pdu + pw, pdu + pw + 0.04, fl + 0.01, b + ph - 0.02, dP - pT - 0.03, dP - pT - 0.03 - pw * 2 + 0.06);

  // ---- the ceiling: boards on the beams (moerbalken) that span from party wall to party wall; the stairwell open
  const stairD = [dP + 0.05, dP + 2.9], stairU = [sU(0.025), sU(0.86)];
  const boards = (d0, d1) => A('timber', iu0 + lin, iu1 - lin, top - 0.05, top, d0, d1);
  boards(dB + lin, dP - pT); boards(stairD[1], dF - lin);
  if (left) A('timber', stairU[1], iu1 - lin, top - 0.05, top, dP, stairD[1]); else A('timber', iu0 + lin, stairU[1], top - 0.05, top, dP, stairD[1]);
  A('opening', Math.min(...stairU), Math.max(...stairU), top - 0.04, top - 0.01, dP, stairD[1]);
  for (const [d0, d1] of [[dB + lin, dP - pT], [dP, dF - lin]]) {
    const n = Math.max(2, Math.round((d1 - d0) / 1.15));
    for (let k = 0; k < n; k++) { const d = d0 + (k + 0.5) * (d1 - d0) / n; A(OAK, iu0 + lin, iu1 - lin, top - 0.3, top - 0.05, d - 0.11, d + 0.11); }
  }

  // ---- Delft tiles along the foot of every wall (three rows, a blue figure on each), but where furniture stands
  const tile = 0.13, tv = fl + tile * 3;
  const tiles = (kind, c, a0, a1, sg) => {           // kind 'u': a wall of constant u = c (running along d); 'd': of constant d = c
    if (a1 - a0 < 0.1) return;
    if (kind === 'u') A('tile_white', c, c + sg * 0.012, fl, tv, a0, a1); else A('tile_white', a0, a1, fl, tv, c, c + sg * 0.012);
    const n = Math.floor((a1 - a0) / tile);
    for (let i = 0; i < n; i++) for (let r = 0; r < 3; r++) {
      const m = a0 + (i + 0.5) * (a1 - a0) / n, v = fl + (r + 0.5) * tile, h = 0.032;
      if (kind === 'u') A('glaze_blue', c + sg * 0.012, c + sg * 0.016, v - h, v + h, m - h, m + h); else A('glaze_blue', m - h, m + h, v - h, v + h, c + sg * 0.012, c + sg * 0.016);
    }
  };
  const hallD = zone(dP, dF - lin), roomD = zone(dB + lin, dP - pT);
  const hearthD = (roomD[0] + roomD[1]) / 2 + 0.2, bedL = Math.min(2.15, w - 2 * P - 2.4), bedD = 1.2;
  // the hall: the door side's party wall (behind the stair only its front part), the far wall, the partition
  tiles('u', left ? iu0 + lin : iu1 - lin, stairD[1] + 0.4, hallD[1], left ? 1 : -1);
  tiles('u', left ? iu1 - lin : iu0 + lin, hallD[0], hallD[1], left ? -1 : 1);
  tiles('d', dP, iu0 + lin + 0.012, pdu - pw - 0.1, 1); tiles('d', dP, pdu + pw + 0.1, iu1 - lin - 0.012, 1);
  // the room: the hearth's wall (not behind the hearth), the far wall (not behind the bed), the partition's back, the back wall (not behind the bed)
  tiles('u', left ? iu0 + lin : iu1 - lin, roomD[0], hearthD - 1.12, left ? 1 : -1); tiles('u', left ? iu0 + lin : iu1 - lin, hearthD + 1.12, roomD[1], left ? 1 : -1);
  tiles('u', left ? iu1 - lin : iu0 + lin, roomD[0] + bedD + 0.02, roomD[1], left ? -1 : 1);
  tiles('d', dP - pT, iu0 + lin + 0.012, pdu - pw - 0.1, -1); tiles('d', dP - pT, pdu + pw + 0.1, iu1 - lin - 0.012, -1);
  { const a = left ? iu0 + lin + 0.012 : iu0 + lin + bedL + 0.06, c = left ? iu1 - lin - bedL - 0.06 : iu1 - lin - 0.012; tiles('d', dB + lin, a, c, 1); }

  // ---- a painting in its black (ebony) frame on a wall: kind 'u' at u = c facing sg, centred at m along d; or 'd'
  const painting = (kind, c, sg, m, v, pw2, ph2, canvas = 'ceiling_painted') => {
    const fr = 0.07, e = (a, q) => (kind === 'u' ? [c + sg * a, c + sg * q] : null);
    if (kind === 'u') {
      const [a0, a1] = e(0.002, 0.05);
      A('lacquer_black', a0, a1, v - ph2 / 2, v + ph2 / 2, m - pw2 / 2, m - pw2 / 2 + fr); A('lacquer_black', a0, a1, v - ph2 / 2, v + ph2 / 2, m + pw2 / 2 - fr, m + pw2 / 2);
      A('lacquer_black', a0, a1, v - ph2 / 2, v - ph2 / 2 + fr, m - pw2 / 2 + fr, m + pw2 / 2 - fr); A('lacquer_black', a0, a1, v + ph2 / 2 - fr, v + ph2 / 2, m - pw2 / 2 + fr, m + pw2 / 2 - fr);
      A(canvas, c + sg * 0.002, c + sg * 0.03, v - ph2 / 2 + fr, v + ph2 / 2 - fr, m - pw2 / 2 + fr, m + pw2 / 2 - fr);
    } else {
      const d0 = c, d1 = c + sg * 0.05;
      A('lacquer_black', m - pw2 / 2, m - pw2 / 2 + fr, v - ph2 / 2, v + ph2 / 2, d0 + sg * 0.002, d1); A('lacquer_black', m + pw2 / 2 - fr, m + pw2 / 2, v - ph2 / 2, v + ph2 / 2, d0 + sg * 0.002, d1);
      A('lacquer_black', m - pw2 / 2 + fr, m + pw2 / 2 - fr, v - ph2 / 2, v - ph2 / 2 + fr, d0 + sg * 0.002, d1); A('lacquer_black', m - pw2 / 2 + fr, m + pw2 / 2 - fr, v + ph2 / 2 - fr, v + ph2 / 2, d0 + sg * 0.002, d1);
      A(canvas, m - pw2 / 2 + fr, m + pw2 / 2 - fr, v - ph2 / 2 + fr, v + ph2 / 2 - fr, d0 + sg * 0.002, d0 + sg * 0.03);
    }
  };

  // ---- the hall: the stair, the cupboard with its garniture of Delftware, paintings, a wall map, the brass chandelier
  { const n = 15, rise = (top - fl) / n, [d0, d1] = stairD, run = (d1 - d0) / n, [ua, ub] = [Math.min(...stairU), Math.max(...stairU)];
    for (let k = 0; k < n; k++) { const d = d1 - (k + 1) * run; A(OAK, ua + 0.05, ub - 0.05, fl + (k + 1) * rise - 0.04, fl + (k + 1) * rise, d - 0.03, d + run + 0.02); }
    for (const [u0, u1] of [[ua, ua + 0.05], [ub - 0.05, ub]]) bag.add(OAK, sideprism(F, y, [[d1, fl], [d1 + 0.25, fl], [d0 + 0.12, top - 0.05], [d0 - 0.12, top - 0.05]], u0, u1));
    const nu = left ? ub - 0.03 : ua + 0.03;
    lat(OAK, [[0.05, 0], [0.05, 0.95], [0.07, 1.0], [0.06, 1.08], [0.001, 1.12]], 8, nu, fl, d1 + 0.08);       // the newel post
    C(ua, ub, d0, d1 + 0.3, fl, top);
  }
  { const kd = (hallD[0] + hallD[1]) / 2 + 0.2, k0 = kd - 0.95, k1 = kd + 0.95, f0 = fU(0.045), f1 = fU(0.69), kv = fl + 0.15, kt = fl + 2.05;
    for (const d of [k0 + 0.12, k1 - 0.12]) for (const uu of [fU(0.12), fU(0.55)]) lat(OAK, [[0.001, 0], [0.07, 0.02], [0.085, 0.07], [0.06, 0.13], [0.001, kv - fl]], 8, uu, fl, d);
    A(OAK, f0, f1, kv, kv + 0.1, k0 - 0.03, k1 + 0.03); A(OAK, f0, f1 - (left ? -0.0 : 0), kv + 0.1, kt, k0, k1);
    A(OAK, f0, f1 + (left ? -0.06 : 0.06), kt, kt + 0.2, k0 - 0.06, k1 + 0.06);                                       // the cornice
    const fr = left ? -1 : 1;                                                                                            // out from the far wall
    for (const [a, c] of [[k0 + 0.08, kd - 0.03], [kd + 0.03, k1 - 0.08]]) for (const [v0, v1] of [[kv + 0.22, kv + 0.85], [kv + 1.0, kt - 0.15]]) A(OAK, f1, f1 + fr * 0.025, v0, v1, a + 0.06, c - 0.06);
    for (const d of [k0 + 0.03, kd, k1 - 0.03]) A(OAK, f1, f1 + fr * 0.04, kv + 0.1, kt, d - 0.04, d + 0.04);           // the pilasters of its front
    for (const [k, d] of [kd - 0.6, kd, kd + 0.6].entries()) lat(k === 1 ? 'glaze_blue' : 'glaze_white', k === 1 ? [[0.001, 0], [0.08, 0.01], [0.11, 0.12], [0.08, 0.26], [0.05, 0.3], [0.07, 0.36], [0.001, 0.36]] : [[0.001, 0], [0.06, 0.01], [0.08, 0.1], [0.05, 0.22], [0.06, 0.26], [0.001, 0.26]], 12, fU(0.33), kt + 0.2, d);
    C(Math.min(f0, f1), Math.max(f0, f1), k0, k1, fl, kt + 0.2);
    // two paintings over the cupboard, one either side of it on the far wall
    const fw = left ? iu1 - lin : iu0 + lin, fs = left ? -1 : 1;
    painting('u', fw, fs, kd, kt + 0.85, 1.25, 0.95);
    if (k0 - 0.75 > hallD[0] + 0.1) painting('u', fw, fs, k0 - 0.55, fl + 1.65, 0.6, 0.75);
    if (k1 + 0.75 < hallD[1] - 0.1) painting('u', fw, fs, k1 + 0.55, fl + 1.65, 0.6, 0.75);
    // on the door side's wall, between the stair and the front: a small painting
    const sw = left ? iu0 + lin : iu1 - lin;
    if (hallD[1] - stairD[1] > 1.4) painting('u', sw, -fs, (stairD[1] + hallD[1]) / 2 + 0.2, fl + 1.9, 0.55, 0.65);
  }
  // the wall map on the partition (the hall's side), hung from its black rods: land and sea in the manner of the Blaeu maps
  { const mu = left ? (pdu + pw + iu1) / 2 + 0.05 : (iu0 + pdu - pw) / 2 - 0.05, mv = fl + 1.85, mw = Math.min(1.3, Math.abs((left ? iu1 - pdu - pw : pdu - pw - iu0)) - 0.4), mh = 0.95, d = dP + 0.004;
    if (mw > 0.6) {
      A('paint_ochre', mu - mw / 2, mu + mw / 2, mv - mh / 2, mv + mh / 2, d, d + 0.008);
      for (const [u0, v0, u1, v1] of [[0.08, 0.12, 0.42, 0.55], [0.5, 0.3, 0.92, 0.85], [0.2, 0.62, 0.38, 0.9], [0.62, 0.05, 0.8, 0.22]]) A('fresco_green', mu - mw / 2 + u0 * mw, mu - mw / 2 + u1 * mw, mv - mh / 2 + v0 * mh, mv - mh / 2 + v1 * mh, d + 0.008, d + 0.011);
      for (const vv of [mv - mh / 2 - 0.02, mv + mh / 2 + 0.02]) A('lacquer_black', mu - mw / 2 - 0.05, mu + mw / 2 + 0.05, vv - 0.025, vv + 0.025, d, d + 0.05);
    }
  }
  // the chandelier of brass in the middle of the hall: a stem, a ball, six arms with their candles
  { const cu = w / 2, cd = (stairD[1] + hallD[1]) / 2, v0 = top - 1.25;
    const [x, z] = F.at(cu, cd);
    bag.add('bronze', rod([x, y + top - 0.3, z], [x, y + v0 + 0.25, z], 0.012, 6));
    bag.add('bronze', lathe([[0.001, 0], [0.09, 0.03], [0.12, 0.12], [0.09, 0.2], [0.03, 0.26], [0.001, 0.28]], 12, null, x, y + v0 - 0.05, z));
    for (let k = 0; k < 6; k++) {
      const a = k / 6 * Math.PI * 2, ex = x + Math.cos(a) * 0.42, ez = z + Math.sin(a) * 0.42;
      bag.add('bronze', rod([x + Math.cos(a) * 0.1, y + v0 + 0.1, z + Math.sin(a) * 0.1], [x + Math.cos(a) * 0.3, y + v0 - 0.02, z + Math.sin(a) * 0.3], 0.011, 5));
      bag.add('bronze', rod([x + Math.cos(a) * 0.3, y + v0 - 0.02, z + Math.sin(a) * 0.3], [ex, y + v0 + 0.1, ez], 0.011, 5));
      bag.add('bronze', lathe([[0.001, 0], [0.05, 0.005], [0.03, 0.03], [0.025, 0.05], [0.001, 0.05]], 8, null, ex, y + v0 + 0.08, ez));
      bag.add('linen', lathe([[0.012, 0], [0.012, 0.16], [0.001, 0.17]], 6, null, ex, y + v0 + 0.13, ez));
    }
  }

  // ---- the room: the hearth with its hood, the box bed, the table and chairs, the mirror and paintings
  { const hw = left ? iu0 + lin : iu1 - lin, hs = left ? 1 : -1, U = (k) => hw + hs * k, dc = hearthD;
    A('bluestone', U(0), U(0.9), fl, fl + 0.03, dc - 1.1, dc + 1.1);                                                   // the hearth stone
    for (const s of [-1, 1]) {
      const d = dc + s * 0.86;
      A('marble_dark', U(0), U(0.62), fl + 0.03, fl + 0.12, d - 0.13, d + 0.13);                                     // the jambs' bases
      lat('marble_dark', [[0.08, 0], [0.075, 1.2], [0.1, 1.25], [0.1, 1.3], [0.001, 1.3]], 10, U(0.5), fl + 0.12, d);   // the columns
      A('marble_dark', U(0), U(0.36), fl + 0.12, fl + 1.42, d - 0.1, d + 0.1);
    }
    A(OAK, U(0), U(0.72), fl + 1.42, fl + 1.56, dc - 1.08, dc + 1.08);                                                   // the mantel
    // its valance (schoorsteenkleed), hung in pleats under the mantel's front and round its ends
    for (let k = 0; k < 14; k++) { const d = dc - 1.06 + (k + 0.5) * 2.12 / 14; A('cloth_green', U(0.72), U(0.74 + (k & 1) * 0.015), fl + 1.2, fl + 1.42, d - 0.078, d + 0.078); }
    for (const s of [-1, 1]) A('cloth_green', U(0.36), U(0.74), fl + 1.2, fl + 1.42, dc + s * 1.08, dc + s * 1.095);
    // the hood: plastered, in two stages to the ceiling, its moulded stage; the chimneypiece's painting on its face
    A(PL, U(0), U(0.64), fl + 1.56, fl + 2.15, dc - 1.0, dc + 1.0);
    A(OAK, U(0), U(0.68), fl + 2.15, fl + 2.24, dc - 1.03, dc + 1.03);
    A(PL, U(0), U(0.46), fl + 2.24, top - 0.3, dc - 0.85, dc + 0.85);
    painting('u', U(0.46), hs, dc, (fl + 2.24 + top - 0.3) / 2, 1.1, Math.min(1.0, top - 0.3 - fl - 2.24 - 0.15));
    // the fireback: the tiled back of the hearth, an iron plate, the andirons and a fire of logs
    A('tile_white', U(0), U(0.012), fl + 0.03, fl + 1.42, dc - 0.74, dc + 0.74);
    for (let i = 0; i < 10; i++) for (let r = 0; r < 9; r++) { const d = dc - 0.74 + (i + 0.5) * 0.148, v = fl + 0.03 + (r + 0.5) * 1.39 / 9; if (Math.abs(d - dc) < 0.4 && v < fl + 0.9) continue; A('glaze_blue', U(0.012), U(0.016), v - 0.035, v + 0.035, d - 0.035, d + 0.035); }
    A('iron', U(0.012), U(0.035), fl + 0.03, fl + 0.85, dc - 0.38, dc + 0.38);
    for (const s of [-0.3, 0.3]) { A('iron', U(0.15), U(0.55), fl + 0.03, fl + 0.07, dc + s - 0.02, dc + s + 0.02); A('iron', U(0.5), U(0.54), fl + 0.03, fl + 0.32, dc + s - 0.02, dc + s + 0.02); }
    for (const [k, dd] of [-0.12, 0.1].entries()) { const p = at3(U(0.22 + k * 0.08), fl + 0.1 + k * 0.05, dc - 0.45 + dd), q = at3(U(0.3 + k * 0.05), fl + 0.1 + k * 0.05, dc + 0.45 + dd); bag.add('bark_dark', rod(p, q, 0.055, 7)); }
    lat('flame', [[0.001, 0], [0.12, 0.03], [0.09, 0.16], [0.03, 0.32], [0.001, 0.36]], 7, U(0.27), fl + 0.12, dc);
    // Delft plates on the mantel, set up on edge against the hood
    for (const s of [-0.6, 0, 0.6]) { const [x, z] = F.at(U(0.66), dc + s); const g = lathe([[0.001, 0], [0.13, 0.002], [0.14, 0.02], [0.001, 0.015]], 14); g.rotateZ(Math.PI / 2); g.rotateY(left ? 0 : Math.PI); g.translate(x, y + fl + 1.56 + 0.14, z); bag.add(s ? 'glaze_white' : 'glaze_blue', g); }
    C(Math.min(U(0), U(0.72)), Math.max(U(0), U(0.72)), dc - 1.1, dc + 1.1, fl, top);
  }
  { // the box bed in the back corner on the far side: its panelled front with the opening, the curtains drawn half across, the bedding
    const bu0 = fU(0.02), bu1 = fU(bedL + 0.02), [ua, ub] = [Math.min(bu0, bu1), Math.max(bu0, bu1)], d0 = roomD[0], d1 = d0 + bedD, dv0 = fl + 0.5, dv1 = fl + 1.95;
    const inner = left ? ua : ub, io = left ? 1 : -1;                                                                    // its open end (toward the room's middle) and its direction
    A(OAK, ua, ub, fl, dv0, d1 - 0.05, d1); A(OAK, ua, ub, dv1, top - 0.05, d1 - 0.05, d1);
    A(OAK, inner, inner + io * 0.22, dv0, dv1, d1 - 0.05, d1); A(OAK, (left ? ub : ua), (left ? ub : ua) - io * 0.12, dv0, dv1, d1 - 0.05, d1);
    A(OAK, inner, inner + io * 0.05, fl, top - 0.05, d0, d1);                                                             // its side cheek
    A(OAK, ua - 0.02, ub + 0.02, dv1 - 0.04, dv1 + 0.06, d1, d1 + 0.04); A(OAK, ua - 0.03, ub + 0.03, top - 0.35, top - 0.27, d1, d1 + 0.06);
    for (const [k, [v0, v1]] of [[0.12, 0.42]].entries()) void k, A(OAK, ua + 0.25, ub - 0.25, fl + v0, fl + v1, d1, d1 + 0.02);
    A(OAK, ua + 0.06, ub - 0.06, dv0 - 0.08, dv0, d0, d1 - 0.05);                                                         // the bed's bottom
    A('linen', ua + 0.08, ub - 0.08, dv0, dv0 + 0.22, d0 + 0.02, d1 - 0.08);                                            // the mattress
    A('cloth_red', ua + 0.08, ub - 0.6, dv0 + 0.22, dv0 + 0.27, d0 + 0.02, d1 - 0.06);                                   // the coverlet
    const pu = left ? ub - 0.35 : ua + 0.35;
    lat('linen', [[0.001, 0], [0.28, 0.01], [0.3, 0.09], [0.2, 0.17], [0.001, 0.19]], 10, pu, dv0 + 0.22, (d0 + d1) / 2 - 0.02);   // the bolster
    // the curtains (of serge) hung from a rod, gathered in folds: one drawn over the half by the wall, the other pushed back
    const cu0 = ua + 0.12, cu1 = ub - 0.12, span = cu1 - cu0;
    A('iron', cu0 - 0.04, cu1 + 0.04, dv1 - 0.1, dv1 - 0.08, d1 + 0.06, d1 + 0.08);
    for (const [c0, c1] of left ? [[cu0 + span * 0.5, cu1], [cu0, cu0 + 0.3]] : [[cu0, cu0 + span * 0.5], [cu1 - 0.3, cu1]]) {
      const n = Math.max(3, Math.round((c1 - c0) / 0.09));
      for (let k = 0; k < n; k++) { const a = c0 + k * (c1 - c0) / n, c = c0 + (k + 1) * (c1 - c0) / n; A('cloth_green', a, c, dv0 - 0.05, dv1 - 0.1, d1 + 0.02 + (k & 1) * 0.025, d1 + 0.045 + (k & 1) * 0.025); }
    }
    C(ua, ub, d0, d1 + 0.1, fl, top);
  }
  // the table under its Turkish carpet in the middle of the room, a pewter jug, a glass and a dish on it; two Spanish chairs
  { const tu = w / 2 + (left ? 0.25 : -0.25), td = Math.min((roomD[0] + bedD + roomD[1]) / 2, (roomD[0] + roomD[1]) / 2 + 0.3), hu = 0.62, hd = 0.42, tv = fl + 0.76;
    for (const su of [-1, 1]) for (const sd of [-1, 1]) lat(OAK, [[0.001, 0], [0.04, 0.0], [0.04, 0.06], [0.03, 0.08], [0.035, 0.3], [0.001, 0.3]], 8, tu + su * (hu - 0.08), fl, td + sd * (hd - 0.08));
    A(OAK, tu - hu, tu + hu, tv - 0.04, tv, td - hd, td + hd);
    const oc = 0.03;
    A('cloth_maroon', tu - hu - oc, tu + hu + oc, tv, tv + 0.012, td - hd - oc, td + hd + oc);
    for (const [a, c, e, f] of [[-hu - oc - 0.01, hu + oc + 0.01, -hd - oc - 0.01, -hd - oc], [-hu - oc - 0.01, hu + oc + 0.01, hd + oc, hd + oc + 0.01], [-hu - oc - 0.01, -hu - oc, -hd - oc, hd + oc], [hu + oc, hu + oc + 0.01, -hd - oc, hd + oc]]) {
      A('cloth_maroon', tu + a, tu + c, fl + 0.3, tv + 0.012, td + e, td + f);
      A('cloth_red', tu + a - 0.002, tu + c + 0.002, fl + 0.34, fl + 0.42, td + e - 0.002, td + f + 0.002);      // the carpet's border, near the hem
    }
    // the carpet's field: a medallion and its corner pieces
    A('paint_ochre', tu - 0.2, tu + 0.2, tv + 0.012, tv + 0.015, td - 0.12, td + 0.12); A('paint_blue', tu - 0.1, tu + 0.1, tv + 0.015, tv + 0.017, td - 0.06, td + 0.06);
    for (const su of [-1, 1]) for (const sd of [-1, 1]) A('paint_ochre', tu + su * (hu - 0.14) - 0.06, tu + su * (hu - 0.14) + 0.06, tv + 0.012, tv + 0.015, td + sd * (hd - 0.1) - 0.05, td + sd * (hd - 0.1) + 0.05);
    lat('lead', [[0.001, 0], [0.06, 0.0], [0.065, 0.03], [0.05, 0.12], [0.06, 0.2], [0.045, 0.24], [0.001, 0.25]], 10, tu - 0.25, tv + 0.012, td - 0.1);                      // the pewter jug
    lat('glass_lamp', [[0.001, 0], [0.04, 0.0], [0.025, 0.02], [0.02, 0.07], [0.045, 0.09], [0.05, 0.17], [0.001, 0.13]], 10, tu + 0.1, tv + 0.012, td + 0.12);           // a roemer
    lat('glaze_white', [[0.001, 0], [0.1, 0.0], [0.15, 0.025], [0.14, 0.03], [0.001, 0.012]], 14, tu + 0.25, tv + 0.012, td - 0.05);                                    // a dish
    C(tu - hu - oc, tu + hu + oc, td - hd - oc, td + hd + oc, fl, tv + 0.02);
    // the chairs at the table's ends, facing it, their seats and backs of leather on brass nails
    for (const su of [-1, 1]) {
      const cu = tu + su * (hu + 0.42), sv = fl + 0.46, cw = 0.23, cb = su;                                            // the back on the far side from the table
      for (const a of [-1, 1]) for (const c of [-1, 1]) A(OAK, cu + a * cw - 0.02, cu + a * cw + 0.02, fl, sv - 0.03, td + c * cw - 0.02, td + c * cw + 0.02);
      A(OAK, cu - cw, cu + cw, fl + 0.12, fl + 0.16, td - cw, td + cw);
      A('hide_brown', cu - cw - 0.02, cu + cw + 0.02, sv - 0.04, sv, td - cw - 0.02, td + cw + 0.02);
      for (const c of [-1, 1]) { const bu = cu + cb * cw; A(OAK, bu - 0.025, bu + 0.025, sv, sv + 0.6, td + c * cw - 0.025, td + c * cw + 0.025); lat('gilt_bronze', [[0.001, 0], [0.03, 0.01], [0.035, 0.04], [0.001, 0.08]], 8, bu, sv + 0.6, td + c * cw); }
      A('hide_brown', cu + cb * cw - 0.012, cu + cb * cw + 0.012, sv + 0.2, sv + 0.52, td - cw + 0.03, td + cw - 0.03);
      C(cu - cw - 0.03, cu + cw + 0.03, td - cw - 0.03, td + cw + 0.03, fl, sv + 0.6);
    }
  }
  // a mirror in its black frame and two paintings on the far wall, before the bed; paintings on the partition's back
  { const fw = left ? iu1 - lin : iu0 + lin, fs = left ? -1 : 1, d0 = roomD[0] + bedD + 0.15, d1 = roomD[1] - 0.15, mid = (d0 + d1) / 2;
    if (d1 - d0 > 0.9) {
      painting('u', fw, fs, mid, fl + 1.75, 0.55, 0.7, 'mirror_tin');
      if (d1 - d0 > 2.4) { painting('u', fw, fs, mid - 0.95, fl + 1.85, 0.7, 0.55); painting('u', fw, fs, mid + 0.95, fl + 1.85, 0.7, 0.55); }
    }
    const pa = left ? (iu0 + pdu - pw) / 2 : (pdu + pw + iu1) / 2;
    painting('d', dP - pT, -1, pa, fl + 1.8, Math.min(0.9, Math.abs(pdu - pw - (left ? iu0 : iu1)) - 0.45), 0.7);
  }
  void box;
}
