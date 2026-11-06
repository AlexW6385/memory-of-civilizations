// The landmarks of Amsterdam about 1670 (docs/settlements/amsterdam.md §1, §4): the Town Hall on the
// Dam, the Westerkerk and its tower, the Nieuwe Kerk. Built on the facade frames of ./facade.js.

import { box, frustum, lathe } from '../../core/geom.js';
import { faceFrame, prism, fbox, outline, ngon, arch } from './facade.js';

const ST = 'sandstone_dressed', RL = 'sandstone_relief';
const sq = (x, z, s) => [x - s / 2, z - s / 2, x + s / 2, z + s / 2];

/** An arched window on frame F: the stone surround, the glass, mullions and a transom of stone; a round light in the head. */
function archWindow(bag, F, y, u, v0, wid, hh, pointed, lights = 2) {
  for (const q of arch(u, v0, wid, hh, pointed, 0.18)) bag.add(ST, prism(F, y, q, -0.02, 0.06));
  for (const q of arch(u, v0, wid, hh, pointed)) bag.add('opening', prism(F, y, q, 0.06, 0.1));
  const vs = v0 + hh - (pointed ? wid * 0.866 : wid / 2);
  for (let i = 1; i < lights; i++) { const m = u - wid / 2 + i * wid / lights; bag.add(ST, fbox(F, y, m - 0.07, m + 0.07, v0, vs + 0.02, 0.1, 0.18)); }
  for (const t of [0.33, 0.66]) { const v = v0 + (vs - v0) * t; bag.add('lead', fbox(F, y, u - wid / 2, u + wid / 2, v - 0.025, v + 0.025, 0.1, 0.13)); }
  bag.add(ST, fbox(F, y, u - wid / 2, u + wid / 2, vs - 0.06, vs + 0.06, 0.1, 0.18));
  const rr = wid * (pointed ? 0.22 : 0.2), vc = vs + (pointed ? wid * 0.36 : wid * 0.24);
  const ring = ngon(u, vc, rr, 12); for (let i = 0; i < 12; i++) { const a = ring[i], b = ring[(i + 1) % 12], k = 0.07 / rr; bag.add(ST, prism(F, y, [a, b, [b[0] + (u - b[0]) * k, b[1] + (vc - b[1]) * k], [a[0] + (u - a[0]) * k, a[1] + (vc - a[1]) * k]], 0.1, 0.18)); }
}

/** A gable of tiers with scrolls at the shoulders and a pediment (Dutch Renaissance), or with crockets and a finial (Gothic). */
function churchGable(bag, F, y, uc, hw0, gh, mat, gothic) {
  const B = (q) => bag.add(mat, prism(F, y, q, -0.6, 0)), S = (q, d1 = 0.08) => bag.add(ST, prism(F, y, q, -0.65, d1));
  if (gothic) {
    const hw = (v) => Math.max(0.4, hw0 * (1 - v / gh) + 0.25);
    for (const q of outline(uc, hw, 0, gh, 6)) B(q);
    for (const q of outline(uc, hw, 0, gh, 6, 0.14)) S(q);
    for (let k = 1; k < 6; k++) { const v = gh * k / 6; for (const s of [-1, 1]) bag.add(ST, prism(F, y, ngon(uc + s * (hw(v) + 0.2), v + 0.15, 0.16, 6), -0.4, -0.05)); }
    bag.add(ST, fbox(F, y, uc - 0.3, uc + 0.3, gh - 0.2, gh + 1.2, -0.45, 0.0)); bag.add(ST, prism(F, y, [[uc - 0.35, gh + 1.2], [uc + 0.35, gh + 1.2], [uc, gh + 2.6]], -0.5, 0.05));
    return;
  }
  const tiers = 3, th = gh / tiers;
  for (let k = 0; k < tiers; k++) {
    const hw = Math.max(hw0 * (1 - k / tiers) + 0.3, 0.8), a = k * th, b = (k + 1) * th, hn = k < tiers - 1 ? Math.max(hw0 * (1 - (k + 1) / tiers) + 0.3, 0.8) : 0;
    B([[uc - hw, a], [uc + hw, a], [uc + hw, b], [uc - hw, b]]);
    S([[uc - hw - 0.15, b - 0.05], [uc + hw + 0.15, b - 0.05], [uc + hw + 0.15, b + 0.25], [uc - hw - 0.15, b + 0.25]], 0.16);     // the tier's cornice
    for (const s of [-1, 1]) {
      S([[uc + s * hw - 0.25, a], [uc + s * hw + 0.25, a], [uc + s * hw + 0.25, b - 0.05], [uc + s * hw - 0.25, b - 0.05]], 0.1);  // pilasters at its edges
      if (hn) { // a scroll filling the step: a quarter disc of stone with its eye
        const cu = uc + s * hn, R = Math.min(hw - hn, th) * 0.95;
        for (let i = 0; i < 6; i++) { const t0 = i / 6 * Math.PI / 2, t1 = (i + 1) / 6 * Math.PI / 2; S([[cu, b + 0.25], [cu + s * R * Math.cos(t0), b + 0.25 + R * Math.sin(t0)], [cu + s * R * Math.cos(t1), b + 0.25 + R * Math.sin(t1)]], 0.06); }
        bag.add(RL, prism(F, y, ngon(cu + s * R * 0.55, b + 0.25 + R * 0.3, R * 0.22, 8), 0.06, 0.12));
      }
    }
    if (k < tiers - 1) for (let i = 0; i < 2; i++) { const u = uc + (i ? 1 : -1) * hw * 0.45; for (const q of arch(u, a + th * 0.25, 0.7, th * 0.55, false, 0.12)) bag.add(ST, prism(F, y, q, 0, 0.05)); for (const q of arch(u, a + th * 0.25, 0.7, th * 0.55)) bag.add('opening', prism(F, y, q, 0.05, 0.08)); }
  }
  const hp = 1.0; S([[uc - 1.1, gh + 0.25], [uc + 1.1, gh + 0.25], [uc, gh + 0.25 + hp]], 0.14);
  bag.add(ST, prism(F, y, ngon(uc, gh + 0.25 + hp + 0.3, 0.3, 8), -0.4, 0.0));
}

/**
 * dutch_church: { rect (the nave, long along z), h (walls), transepts: [[z0, z1]…], tw (how far they stand
 * out each side), gothic, turret, gables: faces of the nave that end in a gable, roof }.
 */
export function dutchChurch(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 15, tw = el.tw ?? 4, gothic = !!el.gothic, roof = el.roof ?? 'slate', mat = el.mat ?? 'brick';
  const W = x1 - x0, cx = (x0 + x1) / 2, rh = W / 2 * (gothic ? 1.25 : 1.0);
  bag.add(mat, box(x0, y - 0.5, z0, x1, y + h, z1)); col.rect(el.rect, y - 0.5, y + h + rh);
  const tr = (el.transepts ?? []).map(([a, b]) => [x0 - tw, a, x1 + tw, b]);
  for (const r of tr) { bag.add(mat, box(r[0], y - 0.5, r[1], r[2], y + h, r[3])); col.rect(r, y - 0.5, y + h); }
  // plinth and eaves cornice round everything
  for (const r of [el.rect, ...tr]) { bag.add(ST, box(r[0] - 0.25, y - 0.5, r[1] - 0.25, r[2] + 0.25, y + 1.2, r[3] + 0.25)); bag.add(ST, box(r[0] - 0.35, y + h - 0.5, r[1] - 0.35, r[2] + 0.35, y + h, r[3] + 0.35)); }
  // the long walls in bays: buttresses (Gothic) or stone pilasters (Renaissance), a tall window in each bay
  for (const f of ['e', 'w']) {
    const F = faceFrame(el.rect, f), bays = Math.max(1, Math.round((z1 - z0) / 5.6)), bw = (z1 - z0) / bays;
    for (let i = 0; i <= bays; i++) {
      const u = i * bw;
      if (gothic) { bag.add(mat, fbox(F, y, u - 0.45, u + 0.45, 0, h - 1.5, 0, 1.0)); bag.add(ST, fbox(F, y, u - 0.5, u + 0.5, h * 0.45, h * 0.45 + 0.25, 0, 1.08)); bag.add(ST, prism(F, y, [[u - 0.5, h - 1.5], [u + 0.5, h - 1.5], [u + 0.5, h - 1.0], [u - 0.5, h - 1.0]], 0, 1.05)); }
      else bag.add(ST, fbox(F, y, u - 0.4, u + 0.4, 1.2, h - 0.5, 0, 0.18));
      if (i === bays) continue;
      const m = u + bw / 2, zc = f === 'e' ? z1 - m : z0 + m;
      if (tr.some((r) => zc > r[1] - 1 && zc < r[3] + 1)) continue;
      archWindow(bag, F, y, m, 2.6, Math.min(2.6, bw - 1.6), h - 4.2, gothic, gothic ? 3 : 2);
    }
  }
  // the transepts' ends: a great window and the gable
  for (const r of tr) for (const f of ['e', 'w']) {
    const F = faceFrame(r, f), L = r[3] - r[1];
    archWindow(bag, F, y, L / 2, 2.6, Math.min(4.2, L * 0.38), h - 3.6, gothic, gothic ? 4 : 3);
    for (const u of [0.5, L - 0.5]) bag.add(ST, fbox(F, y, u - 0.5, u + 0.5, 1.2, h, 0, 0.3));
    churchGable(bag, F, y + h, L / 2, L / 2, L / 2 * (gothic ? 1.25 : 1.0), mat, gothic);
    // the transept roof, from this end to the nave's ridge
  }
  for (const r of tr) { const L = r[3] - r[1]; bag.add(roof, frustum([r[0] + 0.2, r[1] - 0.3, r[2] - 0.2, r[3] + 0.3], y + h, y + h + L / 2 * (gothic ? 1.25 : 1.0), 0, 0, L / 2 + 0.25, L / 2 + 0.25)); }
  // the nave's ends and roof
  for (const f of el.gables ?? ['n', 's']) {
    const F = faceFrame(el.rect, f);
    churchGable(bag, F, y + h, W / 2, W / 2, rh, mat, gothic);
    if (f === (el.door ?? 's')) { for (const q of arch(W / 2, 1.2, 2.4, 4.4, gothic, 0.35)) bag.add(ST, prism(F, y, q, 0, 0.2)); for (const q of arch(W / 2, 1.2, 2.4, 4.4, gothic)) bag.add('wood_dark', prism(F, y, q, 0.2, 0.26)); archWindow(bag, F, y, W / 2, 7.4, Math.min(5, W * 0.3), h - 8.4, gothic, gothic ? 4 : 3); }
    else archWindow(bag, F, y, W / 2, 3.0, Math.min(5, W * 0.3), h - 4.4, gothic, gothic ? 4 : 3);
  }
  bag.add(roof, frustum([x0 - 0.3, z0 + 0.2, x1 + 0.3, z1 - 0.2], y + h, y + h + rh, W / 2 + 0.25, W / 2 + 0.25, 0, 0));
  bag.add('lead', box(cx - 0.12, y + h + rh - 0.05, z0 + 0.2, cx + 0.12, y + h + rh + 0.12, z1 - 0.2));
  // the ridge turret over the crossing: an octagonal lantern of lead with its spire
  if (el.turret && tr.length) {
    const zc = (tr[0][1] + tr[0][3]) / 2, yb = y + h + rh * 0.55, r = Math.min(2.2, W * 0.1);
    bag.add('lead', box(cx - r, yb, zc - r, cx + r, y + h + rh + 1.2, zc + r));
    bag.add('lead', lathe([[r, 0], [r, 3.2], [r * 1.15, 3.4], [r * 1.15, 3.6]], 8, null, cx, y + h + rh + 1.2, zc));
    for (let k = 0; k < 8; k++) { const a = (k + 0.5) * Math.PI / 4; bag.add('opening', box(cx + Math.cos(a) * r * 0.96 - 0.2, y + h + rh + 1.6, zc + Math.sin(a) * r * 0.96 - 0.2, cx + Math.cos(a) * r * 0.96 + 0.2, y + h + rh + 3.8, zc + Math.sin(a) * r * 0.96 + 0.2)); }
    bag.add('lead', lathe([[r * 1.1, 0], [r * 0.6, 1.4], [r * 0.35, 2.2], [0.25, 6], [0.001, 9]], 8, null, cx, y + h + rh + 4.8, zc));
    bag.add('gilt_bronze', lathe([[0.001, 0], [0.3, 0.3], [0.001, 0.6]], 8, null, cx, y + h + rh + 13.8, zc));
  }
}

/** The Westertoren { c, s, h, y }: a brick shaft banded in sandstone, a sandstone stage with the clocks, two
 * wooden stages clad in lead — square, then octagonal — a lantern, and the imperial crown of Maximilian. */
export function westerTower(el, { bag, col }) {
  const [x, z] = el.c, s = el.s ?? 9, H = el.h ?? 87, y = el.y ?? 0, k = H / 87;
  const hb = 33 * k;
  bag.add('brick', box(x - s / 2, y - 0.5, z - s / 2, x + s / 2, y + hb, z + s / 2)); col.rect(sq(x, z, s), y - 0.5, y + hb);
  // the shaft: sandstone quoins at the corners, bands every few metres, round-arched windows and niches
  for (let v = 1.5; v < hb - 1; v += 0.9) { const big = Math.round(v / 0.9) % 2 === 0; for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const ax = big ? 0.75 : 0.45, az = big ? 0.45 : 0.75; bag.add(ST, box(x + dx * s / 2 - (dx > 0 ? ax : 0.04) , y + v, z + dz * s / 2 - (dz > 0 ? az : 0.04), x + dx * s / 2 + (dx < 0 ? ax : 0.04), y + v + 0.45, z + dz * s / 2 + (dz < 0 ? az : 0.04))); } }
  for (const v of [6, 13, 20, 27]) bag.add(ST, box(x - s / 2 - 0.05, y + v * k, z - s / 2 - 0.05, x + s / 2 + 0.05, y + v * k + 0.35, z + s / 2 + 0.05));
  for (const f of 'nsew') {
    const F = faceFrame(sq(x, z, s), f);
    archWindow(bag, F, y, s / 2, 7.2 * k, 1.6, 4.8 * k, false, 2);
    archWindow(bag, F, y, s / 2, 14.2 * k, 1.8, 5.4 * k, false, 2);
    archWindow(bag, F, y, s / 2, 21.4 * k, 2.0, 5.2 * k, false, 2);
    archWindow(bag, F, y, s / 2, 27.6 * k, 2.2, 4.8 * k, false, 2);
  }
  bag.add(ST, box(x - s / 2 - 0.35, y + hb - 0.6, z - s / 2 - 0.35, x + s / 2 + 0.35, y + hb, z + s / 2 + 0.35));
  // the sandstone stage: paired pilasters at the corners, the belfry arch with louvres, the clock above, a balustrade
  const s2 = s * 0.86, h2 = 13 * k, y2 = y + hb;
  bag.add(ST, box(x - s2 / 2, y2, z - s2 / 2, x + s2 / 2, y2 + h2, z + s2 / 2));
  for (const f of 'nsew') {
    const F = faceFrame(sq(x, z, s2), f);
    for (const u of [0.35, 1.0, s2 - 1.0, s2 - 0.35]) bag.add(ST, fbox(F, y2, u - 0.22, u + 0.22, 0, h2 - 1.2, 0, 0.25));
    for (const q of arch(s2 / 2, 1.2, 2.6, 5.8 * k, false, 0.2)) bag.add(ST, prism(F, y2, q, 0, 0.1));
    for (const q of arch(s2 / 2, 1.2, 2.6, 5.8 * k)) bag.add('opening', prism(F, y2, q, 0.1, 0.14));
    for (let l = 0; l < 8; l++) bag.add('lead', fbox(F, y2, s2 / 2 - 1.3, s2 / 2 + 1.3, 1.6 + l * 0.5, 1.7 + l * 0.5, 0.14, 0.22));
    const vc = 9.4 * k, R = 1.45;                                                    // the clock: a blue dial, gilt ring and hours, hands
    bag.add('gilt_bronze', prism(F, y2, ngon(s2 / 2, vc, R + 0.12, 24), 0.1, 0.18));
    bag.add('paint_blue', prism(F, y2, ngon(s2 / 2, vc, R, 24), 0.18, 0.22));
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6, u = s2 / 2 + Math.cos(a) * R * 0.82, v = vc + Math.sin(a) * R * 0.82; bag.add('gilt_bronze', fbox(F, y2, u - 0.07, u + 0.07, v - 0.07, v + 0.07, 0.22, 0.25)); }
    bag.add('gilt_bronze', fbox(F, y2, s2 / 2 - 0.05, s2 / 2 + 0.05, vc, vc + R * 0.6, 0.25, 0.28)); bag.add('gilt_bronze', fbox(F, y2, s2 / 2 - 0.05, s2 / 2 + R * 0.75, vc - 0.05, vc + 0.05, 0.28, 0.31));
  }
  const yb = y2 + h2;
  bag.add(ST, box(x - s2 / 2 - 0.3, yb - 1.0, z - s2 / 2 - 0.3, x + s2 / 2 + 0.3, yb - 0.4, z + s2 / 2 + 0.3));
  balustrade(bag, x, z, s2 + 0.4, yb - 0.4, 1.0);
  // the square wooden stage, clad in lead: a column at each corner, an arched opening each face
  const s3 = s * 0.66, h3 = 10 * k, y3 = yb - 0.4;
  bag.add('lead', box(x - s3 / 2, y3, z - s3 / 2, x + s3 / 2, y3 + h3, z + s3 / 2));
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bag.add(ST, lathe([[0.3, 0], [0.24, 0.3], [0.22, h3 - 1.3], [0.32, h3 - 1.0], [0.32, h3 - 0.8]], 10, null, x + dx * (s3 / 2 + 0.2), y3, z + dz * (s3 / 2 + 0.2)));
  for (const f of 'nsew') { const F = faceFrame(sq(x, z, s3), f); for (const q of arch(s3 / 2, 1.0, 2.2, h3 - 2.6)) bag.add('opening', prism(F, y3, q, 0, 0.06)); for (const q of arch(s3 / 2, 1.0, 2.2, h3 - 2.6, false, 0.18)) bag.add(ST, prism(F, y3, q, -0.02, 0.03)); }
  bag.add(ST, box(x - s3 / 2 - 0.55, y3 + h3 - 0.8, z - s3 / 2 - 0.55, x + s3 / 2 + 0.55, y3 + h3 - 0.2, z + s3 / 2 + 0.55));
  balustrade(bag, x, z, s3 + 0.9, y3 + h3 - 0.2, 0.9);
  // the octagon: columns at its corners, arched openings, a cornice; the smaller octagonal lantern over it
  const r4 = s * 0.3, h4 = 9 * k, y4 = y3 + h3 - 0.2;
  bag.add('lead', lathe([[r4, 0], [r4, h4]], 8, null, x, y4, z));
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4, b = a + Math.PI / 8;
    bag.add(ST, lathe([[0.2, 0], [0.16, 0.2], [0.15, h4 - 1.1], [0.22, h4 - 0.8]], 8, null, x + Math.cos(a) * (r4 + 0.12), y4, z + Math.sin(a) * (r4 + 0.12)));
    const ox = x + Math.cos(b) * r4 * 0.93, oz = z + Math.sin(b) * r4 * 0.93, t = [-Math.sin(b), Math.cos(b)], hw = r4 * 0.24;
    const OF = { at: (u, d) => [ox + t[0] * (u - hw) + Math.cos(b) * d, oz + t[1] * (u - hw) + Math.sin(b) * d] };
    for (const q of arch(hw, 1.0, hw * 2, h4 - 2.4)) bag.add('opening', prism(OF, y4, q, 0, 0.06));
  }
  bag.add(ST, lathe([[r4 + 0.4, 0], [r4 + 0.4, 0.5], [r4 + 0.1, 0.7]], 8, null, x, y4 + h4 - 0.6, z));
  const r5 = r4 * 0.68, h5 = 6 * k, y5 = y4 + h4 + 0.1;
  bag.add('lead', lathe([[r5, 0], [r5, h5], [r5 * 1.2, h5 + 0.3], [r5 * 1.2, h5 + 0.5]], 8, null, x, y5, z));
  for (let i = 0; i < 8; i++) { const b = (i + 0.5) * Math.PI / 4; bag.add('opening', box(x + Math.cos(b) * r5 * 0.95 - 0.18, y5 + 1.0, z + Math.sin(b) * r5 * 0.95 - 0.18, x + Math.cos(b) * r5 * 0.95 + 0.18, y5 + h5 - 1.0, z + Math.sin(b) * r5 * 0.95 + 0.18)); }
  // the ogee cap, and on it the imperial crown: blue, with gilt bands and pearls, its arches and the orb and cross
  const y6 = y5 + h5 + 0.5;
  bag.add('lead', lathe([[r5 * 1.15, 0], [r5 * 1.0, 0.8], [r5 * 0.55, 2.0], [0.6, 3.0]], 8, null, x, y6, z));
  const yc = y6 + 3.0, rc = 1.5;
  bag.add('paint_blue', lathe([[0.6, 0], [rc, 0.4], [rc, 2.0], [rc * 1.08, 2.2]], 16, null, x, yc, z));
  bag.add('gilt_bronze', lathe([[rc + 0.06, 0.25], [rc + 0.08, 0.5], [rc + 0.06, 0.6]], 16, null, x, yc, z));
  bag.add('gilt_bronze', lathe([[rc * 1.1, 1.95], [rc * 1.12, 2.25], [rc * 1.02, 2.35]], 16, null, x, yc, z));
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; bag.add('gilt_bronze', lathe([[0.001, 0], [0.22, 0.2], [0.001, 0.55]], 6, null, x + Math.cos(a) * rc, yc + 2.3, z + Math.sin(a) * rc)); }
  for (const a of [0, Math.PI / 2]) for (let i = 0; i < 8; i++) {                                // the two arches over the crown
    const t0 = i / 8 * Math.PI, t1 = (i + 1) / 8 * Math.PI, ca = Math.cos(a), sa = Math.sin(a);
    const p0 = [-Math.cos(t0) * rc, Math.sin(t0) * 1.6], p1 = [-Math.cos(t1) * rc, Math.sin(t1) * 1.6];
    bag.add('gilt_bronze', prism({ at: (u, d) => [x + ca * u - sa * d, z + sa * u + ca * d] }, yc + 2.3, [[p0[0], p0[1] - 0.12], [p1[0], p1[1] - 0.12], [p1[0], p1[1] + 0.12], [p0[0], p0[1] + 0.12]], -0.1, 0.1));
  }
  bag.add('gilt_bronze', lathe([[0.001, 0], [0.4, 0.15], [0.5, 0.5], [0.4, 0.85], [0.001, 1.0]], 12, null, x, yc + 3.85, z));
  bag.add('gilt_bronze', box(x - 0.07, yc + 4.8, z - 0.07, x + 0.07, y + H - 1.2, z + 0.07));
  bag.add('gilt_bronze', box(x - 0.35, yc + 5.6, z - 0.06, x + 0.35, yc + 5.75, z + 0.06));
  bag.add('gilt_bronze', box(x - 0.03, y + H - 2.4, z - 0.03, x + 0.9, y + H - 1.7, z + 0.03));       // the weathervane
}

/** A stone balustrade round a square of side s at height v: rail, plinth, balusters. */
function balustrade(bag, x, z, s, v, hh) {
  for (const f of 'nsew') {
    const F = faceFrame(sq(x, z, s), f);
    bag.add(ST, fbox(F, v, 0, s, 0, 0.18, -0.3, 0)); bag.add(ST, fbox(F, v, 0, s, hh - 0.16, hh, -0.32, 0.02));
    const n = Math.floor(s / 0.42);
    for (let i = 0; i < n; i++) { const u = (i + 0.5) * s / n; bag.add(ST, fbox(F, v, u - 0.07, u + 0.07, 0.18, hh - 0.16, -0.22, -0.08)); }
  }
}

/**
 * town_hall: { rect, h, y, front ('e') } — Van Campen's Town Hall in Bentheim sandstone: a plinth, two orders of
 * pilasters with their windows and mezzanines, the corner pavilions and the centre projecting on both long
 * fronts under a pediment full of relief with statues on it; seven arches in front on the Dam; the lead
 * roof; the cupola — a round colonnade, a dome and the gilt cog ship on top.
 */
export function townHall(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 33, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, front = el.front ?? 'e';
  bag.add(ST, box(x0, y - 0.5, z0, x1, y + h, z1)); col.rect(el.rect, y - 0.5, y + h); col.floor(el.rect, y + h);
  const e1 = 15.4, e2 = h - 1.6;                                           // the two entablatures
  for (const f of 'nsew') {
    const F = faceFrame(el.rect, f), L = F.w, long = f === 'e' || f === 'w', A = (m, ...r) => bag.add(m, fbox(F, y, ...r));
    const n = Math.round(L / 3.6), bw = L / n, pav = long ? 3 : 2, ctr = long ? 7 : 0;           // bays; corner pavilions; the centre
    const c0 = Math.floor((n - ctr) / 2), proj = (i) => (ctr && i >= c0 && i < c0 + ctr ? 1.4 : i < pav || i >= n - pav ? 0.7 : 0);
    A(ST, -0.6, L + 0.6, -0.5, 1.6, 0, 0.6);                                                           // the plinth
    for (let i = 0; i < n; i++) {
      const u0 = i * bw, u1 = u0 + bw, um = (u0 + u1) / 2, p = proj(i);
      if (p) A(ST, u0, u1, 1.6, h, 0, p);
      // the giant pilasters of the two orders, their capitals and the entablatures over them
      for (const ue of [u0, u1]) { A(ST, ue - 0.4, ue + 0.4, 1.6, e1 - 1.0, p, p + 0.28); A(ST, ue - 0.52, ue + 0.52, e1 - 1.1, e1 - 0.55, p, p + 0.38); A(ST, ue - 0.4, ue + 0.4, e1 + 0.6, e2 - 1.0, p, p + 0.28); A(ST, ue - 0.52, ue + 0.52, e2 - 1.1, e2 - 0.55, p, p + 0.38); }
      for (const [v0, v1] of [[e1 - 0.55, e1 + 0.6], [e2 - 0.55, e2 + 0.4]]) A(ST, u0 - 0.02, u1 + 0.02, v0, v1, p, p + 0.42);
      A(ST, u0 - 0.03, u1 + 0.03, h - 0.6, h, p, p + 0.55);                                            // the crowning cornice
      // a festoon of fruit and sea creatures under each upper window
      A(RL, um - 0.8, um + 0.8, e1 + 1.2, e1 + 1.6, p, p + 0.12);
      const entry = long && f === front && ctr && i >= c0 && i < c0 + ctr;
      const rows = [[2.4, 7.4, 0.85], [9.6, 12.4, 0.6], [e1 + 1.9, e1 + 7.6, 0.85], [e1 + 9.6, e1 + 12.2, 0.6]];
      for (const [k, [v0, v1, ww]] of rows.entries()) {
        if (entry && k === 0) continue;
        A(ST, um - ww - 0.2, um + ww + 0.2, v0 - 0.2, v1 + 0.2, p, p + 0.12); A('opening', um - ww, um + ww, v0, v1, p + 0.08, p + 0.14);
        A('wood_dark', um - 0.05, um + 0.05, v0, v1, p + 0.14, p + 0.17); A('wood_dark', um - ww, um + ww, v0 + (v1 - v0) * 0.66 - 0.05, v0 + (v1 - v0) * 0.66 + 0.05, p + 0.14, p + 0.17);
        if (k === 0 || k === 2) A(ST, um - ww - 0.35, um + ww + 0.35, v1 + 0.2, v1 + 0.5, p, p + 0.3);           // the cornice over the main windows
      }
      if (entry) { for (const q of arch(um, 1.6, 2.0, 5.2, false, 0.3)) bag.add(ST, prism(F, y, q, p, p + 0.16)); for (const q of arch(um, 1.6, 2.0, 5.2)) bag.add('opening', prism(F, y, q, p + 0.16, p + 0.2)); }
    }
    if (long && ctr) {
      // the pediment over the centre: a raking cornice round the tympanum and its relief, statues on its apex and ends
      const ua = c0 * bw, ub = (c0 + ctr) * bw, um = (ua + ub) / 2, ph = (ub - ua) * 0.2;
      bag.add(ST, prism(F, y, [[ua - 0.4, h], [ub + 0.4, h], [um, h + ph + 0.5]], -1.5, 1.9));
      bag.add(RL, prism(F, y, [[ua + 1.2, h + 0.3], [ub - 1.2, h + 0.3], [um, h + ph - 0.5]], 1.9, 2.05));
      // the relief: a central figure group and the sea's bounty, as rounded masses in the tympanum
      for (const [du, dv, r] of [[0, 1.8, 1.0], [-2.6, 1.0, 0.75], [2.6, 1.0, 0.75], [-5.2, 0.6, 0.55], [5.2, 0.6, 0.55], [-7.4, 0.45, 0.4], [7.4, 0.45, 0.4]]) bag.add(RL, prism(F, y, ngon(um + du, h + 0.3 + dv, r, 10), 2.05, 2.35));
      for (const [u, v, sc] of [[um, h + ph + 0.5, 1.25], [ua, h + 0.2, 1], [ub, h + 0.2, 1]]) statue(bag, F, y, u, v, sc, f === front ? 'peace' : (u === um ? 'atlas' : 'virtue'));
    }
  }
  // the lead roof, the cupola's square base, the round colonnade, the dome, the lantern and the cog ship
  bag.add('lead', frustum([x0 + 1, z0 + 1, x1 - 1, z1 - 1], y + h, y + h + 5, 6, 6, 6, 6));
  bag.add(ST, box(cx - 5.5, y + h + 3, cz - 5.5, cx + 5.5, y + h + 7.5, cz + 5.5));
  bag.add(ST, box(cx - 6, y + h + 7.5, cz - 6, cx + 6, y + h + 8.1, cz + 6));
  const yc = y + h + 8.1, rc = 4.4, hc = 7;
  bag.add(ST, lathe([[rc - 1.2, 0], [rc - 1.2, hc]], 16, null, cx, yc, cz));                          // the drum within the colonnade
  for (let i = 0; i < 16; i++) { const a = (i + 0.5) * Math.PI / 8; bag.add('opening', box(cx + Math.cos(a) * (rc - 1.18) - 0.35, yc + 1.2, cz + Math.sin(a) * (rc - 1.18) - 0.35, cx + Math.cos(a) * (rc - 1.18) + 0.35, yc + 4.8, cz + Math.sin(a) * (rc - 1.18) + 0.35)); }
  bag.add(ST, lathe([[rc + 0.3, 0], [rc + 0.3, 0.5], [rc, 0.6]], 24, null, cx, yc, cz));
  for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8; bag.add(ST, lathe([[0.3, 0], [0.26, 0.3], [0.22, hc - 1.4], [0.34, hc - 1.0], [0.34, hc - 0.7]], 10, null, cx + Math.cos(a) * rc, yc + 0.6, cz + Math.sin(a) * rc)); }
  bag.add(ST, lathe([[rc + 0.45, 0], [rc + 0.45, 0.9], [rc + 0.7, 1.2], [rc - 1.2, 1.25]], 24, null, cx, yc + hc - 0.1, cz));
  const yd = yc + hc + 1.15;
  bag.add('lead', lathe([[rc - 0.4, 0], [rc - 0.6, 1.4], [rc - 1.5, 3.0], [1.4, 4.1], [0.9, 4.4]], 24, null, cx, yd, cz));
  bag.add('lead', lathe([[0.9, 0], [0.9, 2.2], [1.15, 2.4], [0.5, 3.3], [0.12, 4.2], [0.001, 4.6]], 8, null, cx, yd + 4.4, cz));
  for (let i = 0; i < 8; i++) { const a = (i + 0.5) * Math.PI / 4; bag.add('opening', box(cx + Math.cos(a) * 0.88 - 0.14, yd + 4.8, cz + Math.sin(a) * 0.88 - 0.14, cx + Math.cos(a) * 0.88 + 0.14, yd + 6.2, cz + Math.sin(a) * 0.88 + 0.14)); }
  const ys = yd + 9.0;                                                                                  // the cog ship, gilt, as the vane
  bag.add('gilt_bronze', box(cx - 0.03, ys - 0.2, cz - 0.03, cx + 0.03, ys + 0.3, cz + 0.03));
  bag.add('gilt_bronze', prism({ at: (u, d) => [cx + u, cz + d] }, ys + 0.3, [[-0.9, 0.25], [-0.6, 0], [0.6, 0], [0.9, 0.25], [0.9, 0.45], [-0.9, 0.45]], -0.18, 0.18));
  bag.add('gilt_bronze', box(cx - 0.03, ys + 0.75, cz - 0.03, cx + 0.03, ys + 2.0, cz + 0.03));
  bag.add('gilt_bronze', box(cx - 0.02, ys + 1.0, cz - 0.4, cx + 0.02, ys + 1.75, cz + 0.4));
}

/** A standing statue on frame F at (u, v), scale sc: a draped figure; Atlas bears a bronze globe. */
function statue(bag, F, y, u, v, sc, who) {
  const [x, z] = F.at(u, 0.6), s = sc;
  bag.add(ST, box(x - 0.5 * s, y + v - 0.6 * s, z - 0.5 * s, x + 0.5 * s, y + v + 0.5 * s, z + 0.5 * s));
  bag.add(ST, lathe([[0.42 * s, 0], [0.38 * s, 0.6 * s], [0.3 * s, 1.5 * s], [0.26 * s, 2.0 * s], [0.3 * s, 2.3 * s], [0.12 * s, 2.45 * s], [0.001, 2.46 * s]], 10, null, x, y + v + 0.5 * s, z));
  bag.add(ST, lathe([[0.001, 0], [0.13 * s, 0.05 * s], [0.14 * s, 0.22 * s], [0.08 * s, 0.34 * s], [0.001, 0.36 * s]], 10, null, x, y + v + 2.95 * s, z));
  if (who === 'atlas') bag.add('bronze', lathe(Array.from({ length: 9 }, (_, i) => [Math.max(0.001, Math.sin(i / 8 * Math.PI) * 0.9 * s), (1 - Math.cos(i / 8 * Math.PI)) * 0.9 * s]), 14, null, x, y + v + 3.25 * s, z));
  else bag.add(ST, box(x + 0.25 * s, y + v + 2.2 * s, z - 0.05 * s, x + 0.35 * s, y + v + 3.3 * s, z + 0.05 * s));   // a staff or branch held up
}
