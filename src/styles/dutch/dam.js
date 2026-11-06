// The Dam about 1670 (docs/settlements/amsterdam.md §5.4–§5.6): the Weigh House (Waag, 1565) with its
// gateways, the great balances hung in them, the porch roofs over the bales and the city's arms; the
// paving of the square, setts between stone-edged gutters and brick before the houses; the fish
// market's benches by the Damrak; and the sledges on which Amsterdam drew its goods instead of carts.

import { box, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { faceFrame, prism, fbox, ngon, bar, slab4 } from './facade.js';
import { crossWindow } from './house.js';

const ST = 'sandstone_dressed', RL = 'sandstone_relief';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

const W3 = (F, y) => (u, d, v) => { const [x, z] = F.at(u, d); return [x, y + v, z]; };

// ---- the Weigh House ---------------------------------------------------------------------------

/** The city's arms on frame F centred at (u, v): the red shield with the black pale and three white saltires, crowned, two lions holding it, on a stone cartouche. */
function cityArms(bag, F, y, u, v, d0) {
  const P = (m, pts, a, b) => bag.add(m, prism(F, y, pts, d0 + a, d0 + b));
  P(ST, [[u - 1.15, v - 1.35], [u + 1.15, v - 1.35], [u + 1.3, v + 0.9], [u, v + 1.55], [u - 1.3, v + 0.9]], 0, 0.1);   // the cartouche
  const sh = [[u - 0.55, v + 0.75], [u + 0.55, v + 0.75], [u + 0.55, v - 0.25], [u + 0.3, v - 0.8], [u, v - 0.98], [u - 0.3, v - 0.8], [u - 0.55, v - 0.25]];
  P(ST, sh.map(([a, b]) => [u + (a - u) * 1.12, v + (b - v) * 1.1]), 0.1, 0.14);                                     // its moulded rim
  P('lacquer_red', sh, 0.14, 0.18);
  P('lacquer_black', [[u - 0.19, v + 0.75], [u + 0.19, v + 0.75], [u + 0.19, v - 0.94], [u - 0.19, v - 0.94]], 0.18, 0.2);
  for (const k of [0.42, -0.05, -0.52]) for (const [s, dd] of [[1, 0], [-1, 0.006]]) {                              // the three saltires on the pale
    const c = Math.SQRT1_2, L = 0.15, t = 0.035, a = [c * L, s * c * L], n = [-s * c * t, c * t];
    P('paint_white', [[u - a[0] - n[0], v + k - a[1] - n[1]], [u + a[0] - n[0], v + k + a[1] - n[1]], [u + a[0] + n[0], v + k + a[1] + n[1]], [u - a[0] + n[0], v + k - a[1] + n[1]]], 0.2 + dd, 0.215 + dd);
  }
  // the imperial crown (granted by Maximilian I) over the shield
  P('gilt_bronze', [[u - 0.42, v + 0.82], [u + 0.42, v + 0.82], [u + 0.42, v + 0.98], [u - 0.42, v + 0.98]], 0.14, 0.22);
  for (const k of [-0.32, 0, 0.32]) P('gilt_bronze', [[u + k - 0.09, v + 0.98], [u + k + 0.09, v + 0.98], [u + k, v + 1.26]], 0.14, 0.2);
  bag.add('gilt_bronze', prism(F, y, ngon(u, v + 1.34, 0.08, 8), d0 + 0.14, d0 + 0.22));
  // the two lions rampant, holding it: body, mane, head, the raised paws, tail
  for (const s of [-1, 1]) {
    const lu = u + s * 0.86;
    P(RL, [[lu - 0.17, v - 1.2], [lu + 0.17, v - 1.2], [lu + 0.2, v + 0.1], [lu, v + 0.3], [lu - 0.2, v + 0.1]], 0.1, 0.24);
    bag.add(RL, prism(F, y, ngon(lu - s * 0.02, v + 0.45, 0.22, 9), d0 + 0.1, d0 + 0.26));
    bag.add(RL, prism(F, y, ngon(lu - s * 0.08, v + 0.5, 0.13, 8), d0 + 0.26, d0 + 0.32));
    P(RL, [[lu - s * 0.05, v + 0.15], [lu - s * 0.36, v + 0.4], [lu - s * 0.42, v + 0.3], [lu - s * 0.1, v + 0.02]], 0.12, 0.22);
    P(RL, [[lu - s * 0.05, v - 0.35], [lu - s * 0.38, v - 0.2], [lu - s * 0.42, v - 0.3], [lu - s * 0.08, v - 0.5]], 0.12, 0.22);
    P(RL, [[lu + s * 0.12, v - 1.0], [lu + s * 0.34, v - 0.5], [lu + s * 0.3, v - 0.4], [lu + s * 0.08, v - 0.85]], 0.1, 0.18);
  }
}

/** A great balance hung from the ceiling: the iron beam on its hook rod, four chains to each wooden pan; goods on one, weights on the other. */
function balance(bag, P3, u, d, vTop, span, seed) {
  const rand = rng(seed), vb = vTop - 1.25, vp = 0.72;
  bag.add('iron', bar(P3(u, d, vTop), P3(u, d, vb + 0.08), 0.06));
  bag.add('iron', bar(P3(u - span / 2, d, vb), P3(u + span / 2, d, vb), 0.12, 0.16));                  // the beam
  bag.add('iron', bar(P3(u, d, vb + 0.08), P3(u, d, vb + 0.55), 0.04));                                // its pointer
  bag.add('iron', bar(P3(u - 0.12, d, vb + 0.2), P3(u + 0.12, d, vb + 0.2), 0.05));                    // the fork round the pointer
  for (const s of [-1, 1]) {
    const pu = u + s * span / 2, h = 0.5;
    for (const [a, b] of [[-h, -h], [h, -h], [h, h], [-h, h]]) bag.add('iron', bar(P3(pu, d, vb - 0.05), P3(pu + a * 0.92, d + b * 0.92, vp + 0.08), 0.025));
    bag.add('timber', box(...(() => { const p = P3(pu - h, d - h, vp), q = P3(pu + h, d + h, vp + 0.08); return [Math.min(p[0], q[0]), p[1], Math.min(p[2], q[2]), Math.max(p[0], q[0]), q[1], Math.max(p[2], q[2])]; })()));
    if (s < 0) { const r = rand(), p = P3(pu, d, vp + 0.08); if (r < 0.5) bag.add('sacking', box(p[0] - 0.38, p[1], p[2] - 0.3, p[0] + 0.38, p[1] + 0.55, p[2] + 0.3)); else bag.add('timber', lathe([[0.27, 0], [0.32, 0.3], [0.27, 0.62], [0.001, 0.62]], 12, null, p[0], p[1], p[2])); }
    else { const p = P3(pu, d, vp + 0.08); let yy = p[1]; for (const r of [0.2, 0.17, 0.14, 0.11]) { bag.add('iron', lathe([[r, 0], [r * 0.92, 0.1], [0.001, 0.1]], 10, null, p[0], yy, p[2])); yy += 0.1; } }
  }
}

/**
 * waag: { rect, y } — the Weigh House: a free-standing block of brick with sandstone bands and quoins,
 * round-arched gateways on all sides (three on the long sides, one at each end) in which the balances
 * hang, porch roofs on brackets over the long sides, cross-windows above a string course, a steep
 * hipped roof of slate with stone dormers, and the city's arms on the ends. docs §5.4.
 */
export function waag(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, T = 0.7, H1 = 5.4, H2 = 3.8, E = H1 + H2, rand = rng(el.seed ?? 1565);
  const long = (f) => (f === 's' || f === 'n') === (x1 - x0 >= z1 - z0);
  for (const f of ['s', 'n', 'e', 'w']) {
    const F = faceFrame(el.rect, f), w = F.w, P3 = W3(F, y), A = (m, ...r) => bag.add(m, fbox(F, y, ...r)), Pz = (m, q, d0, d1) => bag.add(m, prism(F, y, q, d0, d1));
    const L = long(f), ua = L ? 0 : T, ub = L ? w : w - T;                                     // the long fronts run the full length, the ends between them
    const ops = L ? [w / 2 - 6, w / 2, w / 2 + 6].map((u) => ({ u, r: 1.6 })) : [{ u: w / 2, r: 1.8 }], hs = 2.6;
    // the ground storey: piers between the gateways (their plinths, the sandstone bands across the brick), the walls over the arches
    let u = ua;
    for (const o of [...ops, { u: ub + 99, r: 0 }]) {
      const e = Math.min(ub, o.u - o.r);
      if (e > u + 0.01) {
        A('brick', u, e, 0.45, H1, -T, 0); A('bluestone', L && u < 0.01 ? -0.08 : u, L && e > w - 0.01 ? w + 0.08 : e, -0.3, 0.45, -T, 0.08);
        for (const v of [1.55, 2.6, 3.65]) A(ST, u, e, v - 0.12, v + 0.12, 0.0, 0.03);
        const p = F.at(u, -T), q = F.at(e, 0); col.rect([Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])], y - 0.3, y + E);
      }
      if (o.r === 0) break;
      const { r } = o, uc = o.u, N = 8;
      for (let i = 0; i < N; i++) {                                                            // the spandrels round the arch's head
        const t0 = i / N * Math.PI / 2, t1 = (i + 1) / N * Math.PI / 2, va = hs + r * Math.sin(t0), vb = hs + r * Math.sin(t1), ha = r * Math.cos(t0), hb = r * Math.cos(t1);
        for (const s of [-1, 1]) Pz('brick', s < 0 ? [[uc - r, va], [uc - ha, va], [uc - hb, vb], [uc - r, vb]] : [[uc + ha, va], [uc + r, va], [uc + r, vb], [uc + hb, vb]], -T, 0);
      }
      A('brick', uc - r, uc + r, hs + r, H1, -T, 0);
      for (let i = 0; i < 9; i++) {                                                            // the voussoirs, the keystone larger
        const t0 = i / 9 * Math.PI, t1 = (i + 1) / 9 * Math.PI, k = i === 4 ? 0.55 : 0.38, c = (t) => [uc + Math.cos(t) * r, hs + Math.sin(t) * r], C = (t) => [uc + Math.cos(t) * (r + k), hs + Math.sin(t) * (r + k)];
        Pz(i % 2 ? 'sandstone_dressed' : 'brick_baked', [c(t0), C(t0), C(t1), c(t1)].reverse(), 0, i === 4 ? 0.1 : 0.05);
      }
      for (const s of [-1, 1]) A(ST, uc + s * r - (s > 0 ? 0 : 0.3), uc + s * r + (s > 0 ? 0.3 : 0), hs - 0.25, hs, 0, 0.08);   // the imposts
      A('bluestone', uc - r, uc + r, -0.3, 0.15, -T, 0.08);                                    // the threshold
      // the balance hung inside the gateway, from the ceiling
      if (L) balance(bag, P3, uc, -T - 1.3, H1 - 0.15, 2.4, Math.floor(rand() * 1e6));
      u = uc + r;
    }
    // quoins at the corners of the long fronts
    if (L) for (let k = 0; k < 18; k++) { const v = 0.45 + k * 0.5; if (v > E - 0.3) break; for (const [a, b] of [[0, k % 2 ? 0.55 : 0.9], [w - (k % 2 ? 0.55 : 0.9), w]]) A(ST, a, b, v, v + 0.48, 0, 0.03); }
    // the string course, the upper storey with its cross-windows, the cornice at the eaves
    A(ST, L ? -0.16 : 0, L ? w + 0.16 : w, H1 - 0.05, H1 + 0.3, 0, 0.16);
    A('brick', ua, ub, H1, E, -T, 0);
    A(ST, L ? -0.24 : 0, L ? w + 0.24 : w, E - 0.35, E, 0, 0.24);
    const wins = L ? [w / 2 - 6.6, w / 2 - 2.2, w / 2 + 2.2, w / 2 + 6.6] : [w / 2 - 3.6, w / 2 + 3.6];
    for (const wu of wins) crossWindow(bag, F, y, wu, H1 + 0.6, 1.3, 2.4, { frame: 'wood_painted', shutter: 'shutter_green', shut: 'none' });
    for (const s of [-1, 1]) for (const wu of L ? [w / 2 + s * 4.4] : []) A(ST, wu - 0.25, wu + 0.25, H1 + 0.3, E - 0.35, 0, 0.05);  // pilaster strips between the pairs
    if (!L) cityArms(bag, F, y, w / 2, H1 + 1.95, 0);
    // the porch roof (luifel) over the gateways of the long sides, on timber brackets, a fascia at its edge
    if (L) {
      const d1 = 2.7, vw = 4.85, ve = 4.25, u0 = 0.4, u1 = w - 0.4;
      bag.add('lead', slab4([P3(u0, 0.02, vw), P3(u1, 0.02, vw), P3(u1, d1, ve), P3(u0, d1, ve)], 0.07));
      bag.add('planks_grey', slab4([P3(u0, 0.02, vw - 0.07), P3(u1, 0.02, vw - 0.07), P3(u1, d1, ve - 0.07), P3(u0, d1, ve - 0.07)], 0.03));
      A('wood_painted', u0, u1, ve - 0.38, ve - 0.05, d1 - 0.06, d1);
      for (const bu of [u0 + 0.15, ...ops.slice(0, -1).map((o, i) => (o.u + ops[i + 1].u) / 2), u1 - 0.15]) {
        A('timber', bu - 0.08, bu + 0.08, 3.1, vw - 0.1, -0.05, 0.16);
        bag.add('timber', bar(P3(bu, 0.12, 3.25), P3(bu, d1 - 0.25, ve - 0.12), 0.13));
        bag.add('timber', bar(P3(bu, 0.12, vw - 0.12), P3(bu, d1 - 0.05, ve - 0.12), 0.12));
      }
    }
    // dormers on the long sides: a brick front with a cross-window, a stone pediment, a lead roof running back into the slope
    if (L) for (const du of [w / 2 - 4.4, w / 2 + 4.4]) {
      const hw = 0.95, v0 = E, v1 = E + 2.3, vr = v1 + 0.75, back = -3.0;
      A('brick', du - hw, du + hw, v0 - 0.3, v1, -0.3, 0.0);
      for (const s of [-1, 1]) A(ST, du + s * hw - 0.12, du + s * hw + 0.12, v0, v1, 0, 0.06);
      crossWindow(bag, F, y, du, v0 + 0.35, 1.0, 1.45, { frame: 'wood_painted', shutter: 'shutter_green', shut: 'none' });
      Pz(ST, [[du - hw - 0.18, v1], [du + hw + 0.18, v1], [du, vr]], -0.35, 0.1);
      for (const s of [-1, 1]) A('brick', s < 0 ? du - hw : du + hw - 0.14, s < 0 ? du - hw + 0.14 : du + hw, v0 - 0.3, v1, back, -0.3);   // the cheeks, back into the slope
      for (const s of [-1, 1]) bag.add('lead', slab4([P3(du, 0.05, vr + 0.03), P3(du, back, vr + 0.03), P3(du + s * (hw + 0.25), back, v1 - 0.05), P3(du + s * (hw + 0.25), 0.05, v1 - 0.05)], 0.06));
      bag.add(ST, prism(F, y, ngon(du, vr + 0.18, 0.16, 8), -0.3, 0.05));
    }
  }
  // the interior: a flagged floor a step up, the timber ceiling on its beams
  const ix0 = x0 + T, iz0 = z0 + T, ix1 = x1 - T, iz1 = z1 - T;
  bag.add('bluestone', box(ix0, y - 0.3, iz0, ix1, y + 0.15, iz1)); col.floor([x0, z0, x1, z1], y + 0.15);
  bag.add('planks_grey', box(ix0, y + H1 - 0.2, iz0, ix1, y + H1 + 0.1, iz1));
  for (let k = 1; k < 6; k++) { const xb = ix0 + (ix1 - ix0) * k / 6; bag.add('timber', box(xb - 0.16, y + H1 - 0.55, iz0, xb + 0.16, y + H1 - 0.2, iz1)); }
  // weights stacked along the inner walls
  for (const [wx, wz] of [[ix0 + 0.5, iz0 + 0.5], [ix1 - 0.5, iz0 + 0.5], [ix0 + 0.5, iz1 - 0.5], [ix1 - 0.5, iz1 - 0.5]]) { let yy = y + 0.15; for (const r of [0.24, 0.2, 0.17, 0.14, 0.11]) { bag.add('iron', lathe([[r, 0], [r * 0.93, 0.11], [0.001, 0.11]], 10, null, wx, yy, wz)); yy += 0.11; } }
  // the roof: steep and hipped, slate, over a small overhang
  { const o = 0.35, X0 = x0 - o, Z0 = z0 - o, X1 = x1 + o, Z1 = z1 + o, ins = Math.min(X1 - X0, Z1 - Z0) / 2 - 0.1, rh = 7.2;
    bag.add('slate', frustumHip([X0, Z0, X1, Z1], y + E, y + E + rh, ins));
    bag.add('lead', box((X0 + X1) / 2 - ((X1 - X0) / 2 - ins) - 0.1, y + E + rh - 0.02, (Z0 + Z1) / 2 - 0.15, (X0 + X1) / 2 + ((X1 - X0) / 2 - ins) + 0.1, y + E + rh + 0.12, (Z0 + Z1) / 2 + 0.15));
    for (const s of [-1, 1]) { const xr = (X0 + X1) / 2 + s * ((X1 - X0) / 2 - ins); bag.add('lead', lathe([[0.1, 0], [0.1, 0.9], [0.22, 1.0], [0.001, 1.45]], 8, null, xr, y + E + rh + 0.1, (Z0 + Z1) / 2)); }
    col.rect(el.rect, y + H1, y + E + rh); }
}
/** A hipped roof: the frustum with the ridge along the longer side. */
function frustumHip(rect, y0, y1, ins) {
  const [x0, z0, x1, z1] = rect, alongX = x1 - x0 >= z1 - z0, t = [];
  const b = [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]];
  const r = alongX ? [[x0 + ins, y1, (z0 + z1) / 2], [x1 - ins, y1, (z0 + z1) / 2]] : [[(x0 + x1) / 2, y1, z0 + ins], [(x0 + x1) / 2, y1, z1 - ins]];
  const tri = (p, q, s) => t.push(...p, ...q, ...s);
  tri(b[0], b[2], b[1]); tri(b[0], b[3], b[2]);
  if (alongX) { tri(b[0], b[1], r[1]); tri(b[0], r[1], r[0]); tri(b[2], b[3], r[0]); tri(b[2], r[0], r[1]); tri(b[1], b[2], r[1]); tri(b[3], b[0], r[0]); }
  else { tri(b[1], b[2], r[1]); tri(b[1], r[1], r[0]); tri(b[3], b[0], r[0]); tri(b[3], r[0], r[1]); tri(b[0], b[1], r[0]); tri(b[2], b[3], r[1]); }
  return fromTriangles(orientOutward(t));
}

// ---- the paving ----------------------------------------------------------------------------------

/**
 * dam_paving: { fields: [{ rect, mat, kerb ('nsew': the sides with a kerb) }], gz: [z…], gx: [x…], y } — the
 * square's setts in fields edged with bluestone kerbs, crossed by gutters: a channel of bluestone between
 * two edging stones, a little below the setts, carrying the rain to the canals.
 */
export function damPaving(el, { bag, col }) {
  const y = el.y ?? 0, top = y + 0.05, K = 0.3, G = 0.6, C = 0.3;
  for (const fd of el.fields) {
    let [x0, z0, x1, z1] = fd.rect; const kb = fd.kerb ?? 'nsew', mat = fd.mat ?? 'brick_paving';
    col.floor(fd.rect, top);
    // the kerbs: those along z (n, s) whole, those along x between them
    if (kb.includes('n')) { bag.add('bluestone', box(x0, y - 0.2, z0, x1, top + 0.02, z0 + K)); z0 += K; }
    if (kb.includes('s')) { bag.add('bluestone', box(x0, y - 0.2, z1 - K, x1, top + 0.02, z1)); z1 -= K; }
    if (kb.includes('w')) { bag.add('bluestone', box(x0, y - 0.2, z0, x0 + K, top + 0.02, z1)); x0 += K; }
    if (kb.includes('e')) { bag.add('bluestone', box(x1 - K, y - 0.2, z0, x1, top + 0.02, z1)); x1 -= K; }
    const gz = (el.gz ?? []).filter((z) => z - G / 2 > z0 + 0.5 && z + G / 2 < z1 - 0.5).sort((a, b) => a - b);
    const gx = (el.gx ?? []).filter((x) => x - G / 2 > x0 + 0.5 && x + G / 2 < x1 - 0.5).sort((a, b) => a - b);
    const gutter = (r, alongX) => {                                                          // two edging stones and the channel between
      const [a0, b0, a1, b1] = r, e = (G - C) / 2;
      if (alongX) { bag.add('granite_block', box(a0, y - 0.2, b0, a1, top + 0.005, b0 + e)); bag.add('granite_block', box(a0, y - 0.2, b1 - e, a1, top + 0.005, b1)); bag.add('bluestone', box(a0, y - 0.25, b0 + e, a1, top - 0.045, b1 - e)); }
      else { bag.add('granite_block', box(a0, y - 0.2, b0, a0 + e, top + 0.005, b1)); bag.add('granite_block', box(a1 - e, y - 0.2, b0, a1, top + 0.005, b1)); bag.add('bluestone', box(a0 + e, y - 0.25, b0, a1 - e, top - 0.045, b1)); }
    };
    for (const z of gz) gutter([x0, z - G / 2, x1, z + G / 2], true);
    const zs = [z0, ...gz.flatMap((z) => [z - G / 2, z + G / 2]), z1];
    for (let i = 0; i < zs.length; i += 2) {
      const za = zs[i], zb = zs[i + 1], xs = [x0, ...gx.flatMap((x) => [x - G / 2, x + G / 2]), x1];
      for (const x of gx) gutter([x - G / 2, za, x + G / 2, zb], false);
      for (let j = 0; j < xs.length; j += 2) if (xs[j + 1] > xs[j] + 0.01 && zb > za + 0.01) bag.add(mat, box(xs[j], y - 0.15, za, xs[j + 1], top, zb));
    }
  }
}

// ---- the fish market ------------------------------------------------------------------------------

/** A fish, lying along x: a body of revolution flattened at the sides, the tail fin. */
function fish(len) {
  const g = lathe([[0.001, 0], [len * 0.09, len * 0.12], [len * 0.11, len * 0.4], [len * 0.07, len * 0.75], [len * 0.025, len * 0.9], [0.001, len * 0.92]], 7);
  g.scale(0.55, 1, 1); g.rotateZ(-Math.PI / 2);
  return g;
}
/**
 * fish_bench: { at, rot, len, seed, y } — a fishmonger's bench at the Damrak: a plank table on trestles,
 * the catch laid on it (round fish and flatfish), a tub of live fish in water before it, baskets beneath;
 * the seller's side behind (−z), the buyers' in front (+z).
 */
export function fishBench(el, { bag, col }) {
  const [cx, cz] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, L = el.len ?? 2.4, D = 0.8, rand = rng(el.seed ?? 3), c = Math.cos(rot), s = Math.sin(rot);
  const P = (x, yy, z) => [cx + x * c + z * s, y + yy, cz - x * s + z * c];
  const B = (m, x0, y0, z0, x1, y1, z1) => bag.add(m, slab4([P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)], y1 - y0));
  const Lt = (m, prof, seg, x, yy, z) => { const p = P(x, yy, z); bag.add(m, lathe(prof, seg, null, p[0], p[1], p[2])); };
  B('planks_grey', -L / 2, 0.78, -D / 2, L / 2, 0.84, D / 2);
  for (const x of [-L / 2 + 0.3, L / 2 - 0.3]) for (const z of [-D / 2 + 0.08, D / 2 - 0.08]) B('timber', x - 0.04, 0, z - 0.04, x + 0.04, 0.78, z + 0.04);
  for (const x of [-L / 2 + 0.3, L / 2 - 0.3]) B('timber', x - 0.035, 0.25, -D / 2 + 0.08, x + 0.035, 0.31, D / 2 - 0.08);
  // the catch: round fish in rows, flatfish laid flat, one fish split open on a board
  const nR = Math.floor(L / 0.36);
  for (let i = 0; i < nR; i++) {
    const x = -L / 2 + 0.25 + i * (L - 0.5) / Math.max(1, nR - 1), z = (rand() - 0.5) * 0.12 + (i % 2 ? 0.12 : -0.05), len = 0.32 + rand() * 0.22, a = rot + Math.PI / 2 + (rand() - 0.5) * 0.4, p = P(x, 0.87, z);
    const g = fish(len); g.translate(-len * 0.46, 0, 0); g.rotateY(a); g.translate(p[0], p[1], p[2]);
    bag.add(rand() < 0.75 ? 'silver' : 'lead', g);
  }
  for (let i = 0; i < 3; i++) { const x = -L / 2 + 0.4 + i * 0.55 + rand() * 0.1, p = P(x, 0.845, 0.26); const g = lathe([[0.17, 0], [0.16, 0.02], [0.001, 0.035]], 10); g.scale(1, 1, 0.72); g.translate(p[0], p[1], p[2]); bag.add('hide_tan', g); }
  B('timber', L / 2 - 0.65, 0.842, -0.3, L / 2 - 0.15, 0.87, -0.02);
  // the tub of live fish before the bench, the baskets beneath it
  { const x = (rand() - 0.5) * L * 0.5; Lt('timber', [[0.36, 0], [0.42, 0.34], [0.38, 0.34], [0.33, 0.05], [0.001, 0.05]], 14, x, 0, D / 2 + 0.55); Lt('water', [[0.37, 0], [0.001, 0]], 12, x, 0.26, D / 2 + 0.55);
    Lt('iron', [[0.405, 0], [0.41, 0.04], [0.001, 0.04]], 14, x, 0.24, D / 2 + 0.55); }
  for (let i = 0; i < 2; i++) Lt('wicker', [[0.2, 0], [0.26, 0.28], [0.23, 0.28], [0.18, 0.03], [0.001, 0.03]], 10, -L / 2 + 0.5 + i * (L - 1), 0, -D / 2 - 0.35);
  const a = P(-L / 2 - 0.1, 0, -D / 2 - 0.1), b = P(L / 2 + 0.1, 0, D / 2 + 1);
  col.circle((a[0] + b[0]) / 2, (a[2] + b[2]) / 2, Math.min(L, D) / 2 + 0.2, y, y + 0.9);
}

// ---- the sledge --------------------------------------------------------------------------------

/**
 * sledge: { at, rot, load ('casks' | 'bales' | 'empty'), seed, y } — the goods sledge (slede) of the Amsterdam
 * carters: two runners turned up at the front, a plank bed on cross-bars, stakes at the corners, the
 * shafts running forward (−z) to the horse's shoulders; the little keg at the front that dripped water
 * under the runners; a load of casks lying or of bales. docs §5.6.
 */
export function sledge(el, { bag, col }) {
  const [cx, cz] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, rand = rng(el.seed ?? 5), c = Math.cos(rot), s = Math.sin(rot);
  const P = (x, yy, z) => [cx + x * c + z * s, y + yy, cz - x * s + z * c];
  const B = (m, x0, y0, z0, x1, y1, z1) => bag.add(m, slab4([P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)], y1 - y0));
  const load = el.load ?? ['casks', 'bales', 'casks', 'empty'][Math.floor(rand() * 4)];
  for (const x of [-0.48, 0.48]) {
    B('timber', x - 0.06, 0.0, -0.95, x + 0.06, 0.16, 1.4);
    bag.add('timber', bar(P(x, 0.08, -0.95), P(x, 0.42, -1.32), 0.12, 0.14));                  // the runner's upturned nose
    bag.add('iron', bar(P(x, 0.012, -0.95), P(x, 0.012, 1.4), 0.1, 0.024));                     // its iron shoe
    bag.add('timber', bar(P(x, 0.16, -0.7), P(x, 0.92, -3.05), 0.08));                          // the shaft
  }
  for (const z of [-0.8, 0.2, 1.2]) B('timber', -0.6, 0.16, z - 0.06, 0.6, 0.27, z + 0.06);
  B('planks_grey', -0.62, 0.27, -0.95, 0.62, 0.32, 1.38);
  for (const x of [-0.56, 0.56]) for (const z of [-0.88, 1.31]) B('timber', x - 0.04, 0.32, z - 0.04, x + 0.04, 0.85, z + 0.04);
  for (const x of [-0.56, 0.56]) B('timber', x - 0.03, 0.62, -0.88, x + 0.03, 0.68, 1.31);
  { const p = P(0, 0.32, -0.72); bag.add('timber', lathe([[0.12, 0], [0.15, 0.12], [0.12, 0.26], [0.001, 0.26]], 10, null, p[0], p[1], p[2])); }
  if (load === 'casks') for (const x of [-0.27, 0.27]) {
    const g = lathe([[0.25, -0.55], [0.3, -0.3], [0.31, 0], [0.3, 0.3], [0.25, 0.55], [0.001, 0.55]], 12); g.rotateX(Math.PI / 2); g.rotateY(rot); const p = P(x, 0.32 + 0.31, 0.25); g.translate(p[0], p[1], p[2]); bag.add('timber', g);
    for (const zz of [-0.42, 0.42]) { const h = lathe([[0.295, -0.03], [0.295, 0.03], [0.001, 0.03]], 12); h.rotateX(Math.PI / 2); h.rotateY(rot); const q = P(x, 0.32 + 0.31, 0.25 + zz); h.translate(q[0], q[1], q[2]); bag.add('iron', h); }
  } else if (load === 'bales') { B('sacking', -0.5, 0.32, -0.55, 0.5, 0.86, 0.45); B('sacking', -0.45, 0.32, 0.5, 0.45, 0.8, 1.25); B('sacking', -0.4, 0.86, -0.4, 0.42, 1.25, 0.3); for (const z of [-0.2, 0.9]) B('cloth_brown', -0.52, 0.322, z - 0.03, 0.52, z < 0 ? 0.88 : 0.82, z + 0.03); }
  const a = P(0, 0, 0.2); col.circle(a[0], a[2], 0.8, y, y + 1.1);
}
