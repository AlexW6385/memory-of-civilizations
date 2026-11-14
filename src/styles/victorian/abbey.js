// Westminster Abbey as it stood about 1870 (docs/settlements/london.md §1.2): the high Gothic nave — the highest
// Gothic vault in England, nearly 102 ft — between low narrow aisles, held by flying buttresses; the
// transepts with their rose windows; the lantern over the crossing, roofed low, for its tower was never
// built; Hawksmoor's two west towers of Portland stone (finished 1745); Henry VII's Lady Chapel at the
// east end with its polygonal buttress turrets.

import { box, frustum, lathe } from '../../core/geom.js';
import { faceFrame, prism, fbox, arch, ngon } from '../dutch/facade.js';
import { archWindow } from '../dutch/landmarks.js';
import { vprism } from '../dutch/facade.js';
import { abbeyInterior } from './abbeyin.js';

const L = 'limestone', PO = 'limestone_yellow';

/** abbey: { rect (along x, the west front at x0), y } */
export function abbey(el, ctx) {
  const { bag, col } = ctx;
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, cz = (z0 + z1) / 2, H = 32, Ha = 14, nw = 12, aw = 7, td = 10;
  const xc = x0 + (x1 - x0) * 0.55, tw = 12, xe = x1 - 26;                   // the crossing; the choir's east end; the Lady Chapel beyond
  const S = (m, r, y0, y1) => { bag.add(m, box(r[0], y + y0, r[1], r[2], y + y1, r[3])); };
  const nave = [x0 + td, cz - nw / 2, xe, cz + nw / 2];
  // the nave, aisles and transept are hollow (abbeyin.js draws their walls); here the roofs over them
  for (const s of [-1, 1]) { const r = [x0 + td, s < 0 ? cz - nw / 2 - aw : cz + nw / 2, xe - 4, s < 0 ? cz - nw / 2 : cz + nw / 2 + aw]; bag.add('lead', frustum([r[0], r[1], r[2], r[3]], y + Ha, y + Ha + 2.4, 0, 0, s < 0 ? 0 : aw * 0.98, s < 0 ? aw * 0.98 : 0)); }
  bag.add('lead', frustum([nave[0], nave[1] - 0.4, nave[2], nave[3] + 0.4], y + H, y + H + nw * 0.45, 0, 0, nw / 2 + 0.35, nw / 2 + 0.35));
  const tr = [xc - tw / 2, z0, xc + tw / 2, z1];
  bag.add('lead', frustum([tr[0] - 0.4, tr[1] + 0.3, tr[2] + 0.4, tr[3] - 0.3], y + H, y + H + tw * 0.45, tw / 2 + 0.35, tw / 2 + 0.35, 0, 0));
  // the lantern over the crossing: a low square stage, its windows, a pyramid of lead
  S(L, [xc - 7, cz - 7, xc + 7, cz + 7], H, H + 7);
  for (const f of 'nsew') { const F = faceFrame([xc - 7, cz - 7, xc + 7, cz + 7], f); for (const u of [4, 10]) archWindow(bag, F, y, u, 1.2, 2.2, 4.4, true, 2, L); }
  bag.add('lead', frustum([xc - 7.3, cz - 7.3, xc + 7.3, cz + 7.3], y + H + 7, y + H + 10, 6.9, 6.9, 6.9, 6.9));
  // the bays (shared with the inside): the nave west of the crossing in ten, the choir east of it in four
  const lin = (a, b, k) => Array.from({ length: k + 1 }, (_, i) => a + (b - a) * i / k);
  const edgesW = lin(x0 + td + 1.2, tr[0], 10), edgesE = lin(tr[2], xe - 4, 4), edges = [...edgesW, ...edgesE];
  const pairs = [...edgesW.slice(1).map((e, i) => [edgesW[i], e]), ...edgesE.slice(1).map((e, i) => [edgesE[i], e])];
  // the nave's and transepts' walls: clerestory and aisle windows between buttresses; flying buttresses over the aisles
  for (const x of edges) {
    if (x > tr[0] - 1 && x < tr[2] + 1) continue;
    for (const s of [-1, 1]) {
      const ze = s < 0 ? cz - nw / 2 - aw : cz + nw / 2 + aw, zn = s < 0 ? cz - nw / 2 : cz + nw / 2;
      S(L, [x - 0.6, Math.min(ze, ze + s * 1.6), x + 0.6, Math.max(ze, ze + s * 1.6)], -0.5, Ha + 5);   // the buttress pier outside the aisle
      bag.add(L, lathe([[0.001, 0], [0.5, 0.01], [0.001, 3.2]], 4, null, x, y + Ha + 5, ze + s * 0.8));
      const F = { at: (u, d) => [x + d, u] };                                                              // the flyer, in the plane across the nave
      const za = ze + s * 0.6, zb = zn;
      bag.add(L, prism(F, y, s < 0 ? [[za, Ha + 3.4], [zb, H - 6], [zb, H - 4.6], [za, Ha + 5]] : [[zb, H - 6], [za, Ha + 3.4], [za, Ha + 5], [zb, H - 4.6]], -0.35, 0.35));
      S(L, [x - 0.45, Math.min(zn, zn + s * 0.7), x + 0.45, Math.max(zn, zn + s * 0.7)], Ha, H + 1.5);    // the clerestory's buttress
      bag.add(L, lathe([[0.001, 0], [0.4, 0.01], [0.001, 2.6]], 4, null, x, y + H + 1.5, zn + s * 0.35));
      col.rect([x - 0.6, Math.min(ze, ze + s * 1.6), x + 0.6, Math.max(ze, ze + s * 1.6)], y, y + Ha + 5);
    }
  }
  for (const [xa, xb] of pairs) {
    const m = (xa + xb) / 2;
    if (m > tr[0] - 1 && m < tr[2] + 1) continue;
    for (const f of ['n', 's']) {
      const Fn = faceFrame(nave, f), Fa = faceFrame([x0 + td, cz - nw / 2 - aw, xe - 4, cz + nw / 2 + aw], f);
      const un = f === 's' ? m - nave[0] : nave[2] - m, ua = f === 's' ? m - x0 - td : xe - 4 - m;
      archWindow(bag, Fn, y, un, Ha + 3, 2.8, H - Ha - 5, true, 2, L);
      archWindow(bag, Fa, y, ua, 2.5, 2.6, Ha - 4.5, true, 2, L);
    }
  }
  // the transepts' fronts: the rose over a row of lancets, a portal; buttress turrets either side; the gable
  for (const f of ['n', 's']) {
    const F = faceFrame(tr, f), uc = tw / 2;
    for (const u of [0.6, tw - 0.6]) { const [px, pz] = F.at(u, 0.4); bag.add(L, lathe([[1.1, 0], [1.1, H + 4], [0.9, H + 4.4]], 8, null, px, y - 0.5, pz)); bag.add(L, lathe([[0.95, 0], [0.001, 6]], 8, null, px, y + H + 4.4, pz)); }
    const rv = H - 9, rr = 4.2;
    bag.add(L, prism(F, y, ngon(uc, rv, rr + 0.5, 24), 0, 0.15)); bag.add('stained_glass', prism(F, y, ngon(uc, rv, rr, 24), 0.15, 0.2));
    for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; bag.add(L, prism(F, y, [[uc + Math.cos(a) * 0.6 - Math.sin(a) * 0.07, rv + Math.sin(a) * 0.6 + Math.cos(a) * 0.07], [uc + Math.cos(a) * rr, rv + Math.sin(a) * rr], [uc + Math.cos(a) * rr - Math.sin(a) * 0.14, rv + Math.sin(a) * rr + Math.cos(a) * 0.14], [uc + Math.cos(a) * 0.6 + Math.sin(a) * 0.07, rv + Math.sin(a) * 0.6 - Math.cos(a) * 0.07]], 0.2, 0.28)); }
    bag.add(L, prism(F, y, ngon(uc, rv, 0.75, 12), 0.2, 0.32));
    for (let k = 0; k < 5; k++) archWindow(bag, F, y, uc - 4 + k * 2, H - 18, 1.3, 4.6, true, 1, L);
    for (const q of arch(uc, 0, 3.4, 7.5, true, 0.8)) bag.add(L, prism(F, y, q, 0, 0.6));
    for (const q of arch(uc, 0, 3.4, 7.5, true)) bag.add('wood_dark', prism(F, y, q, 0.6, 0.66));
    bag.add(L, prism(F, y, [[-0.2, H], [tw + 0.2, H], [uc, H + tw * 0.45 + 0.4]], -0.6, 0.12));
    { const [px, pz] = F.at(uc, -0.2); bag.add(L, lathe([[0.3, 0], [0.001, 2.0]], 4, null, px, y + H + tw * 0.45 + 0.3, pz)); }
  }
  // the choir's east end, and Henry VII's chapel beyond: lower, its buttresses polygonal turrets with ogee caps
  // (the apse is the east half only: the choir's inside runs up to its springing)
  const half = (r, c) => Array.from({ length: 13 }, (_, i) => { const a = -Math.PI / 2 + Math.PI * i / 12; return [c + Math.cos(a) * r, cz + Math.sin(a) * r]; });
  bag.add(L, vprism(half(nw / 2 + aw, xe - 4), y - 0.5, y + Ha + 0.5));
  bag.add(L, vprism(half(nw / 2, xe), y - 0.5, y + H + 0.5));
  bag.add('lead', lathe([[nw / 2 + 0.4, 0], [0.001, nw * 0.45]], 14, null, xe, y + H, cz));
  for (let k = 0; k < 26; k++) { const dz0 = -(nw / 2 + aw) + k * (nw + 2 * aw) / 26, dz1 = dz0 + (nw + 2 * aw) / 26, ext = Math.sqrt(Math.max(0, (nw / 2 + aw) ** 2 - ((dz0 + dz1) / 2) ** 2)); col.rect([xe - 4, cz + dz0, xe - 4 + ext, cz + dz1], y - 0.5, y + H); }
  const lc = [xe + 2, cz - 8, x1, cz + 8], Hl = 21;
  bag.add('lead', frustum([lc[0], lc[1] + 0.6, lc[2] - 0.6, lc[3] - 0.6], y + Hl, y + Hl + 4.5, 0, 7.4, 7.4, 7.4));
  const nl = 5, lw = (lc[2] - lc[0]) / nl;
  for (let i = 0; i <= nl; i++) for (const s of [-1, 1]) {
    const x = lc[0] + i * lw, z = s < 0 ? lc[1] - 0.6 : lc[3] + 0.6;
    bag.add(L, lathe([[1.0, 0], [1.0, Hl + 1.5], [1.15, Hl + 1.8], [1.15, Hl + 2.1]], 8, null, x, y - 0.5, z));
    bag.add('lead', lathe([[1.0, 0], [1.05, 0.6], [0.6, 1.6], [0.2, 2.5], [0.001, 3.1]], 8, null, x, y + Hl + 1.6, z));
    bag.add('gilt_bronze', lathe([[0.001, 0], [0.12, 0.15], [0.001, 0.45]], 6, null, x, y + Hl + 4.7, z));
  }
  for (const f of ['n', 's']) { const F = faceFrame(lc, f); for (let i = 0; i < nl; i++) if (!(f === 'n' && i === 2)) archWindow(bag, F, y, (i + 0.5) * lw, 3.0, lw - 2.8, Hl - 6, true, 3, L); }
  { const F = faceFrame(lc, 'e'); archWindow(bag, F, y, 8, 3, 6, Hl - 6, true, 4, L); }
  // Hawksmoor's west towers, the west window and portal between them
  for (const s of [-1, 1]) towerH(bag, col, x0 + td / 2, s < 0 ? cz - nw / 2 - aw + td / 2 - 1.5 : cz + nw / 2 + aw - td / 2 + 1.5, td, 69, y, s < 0);
  const wf = [x0 + 1, cz - 4.7, x0 + td, cz + 4.7];
  { const F = faceFrame(wf, 'w'); archWindow(bag, F, y, 4.7, 12, 6.2, H - 15, true, 4, L); for (const q of arch(4.7, 0, 3.0, 7.4, true, 0.7)) bag.add(L, prism(F, y, q, 0, 0.7)); bag.add(L, prism(F, y, [[-0.3, H + 2], [9.7, H + 2], [4.7, H + 5.5]], -0.6, 0.1)); }
  abbeyInterior(ctx, { y, cz, H, Ha, x0, x1, z0, z1, td, xc, tw, xe, edgesW, edgesE, lc });
}

/** A west tower of Hawksmoor's: square, buttressed with octagonal corner turrets, the belfry stage with tall
 * pointed openings, a clock on the north one, a pierced parapet with a gablet on each face, pinnacles. */
function towerH(bag, col, x, z, s, T, y, clock) {
  const r = [x - s / 2, z - s / 2, x + s / 2, z + s / 2], Tb = T - 8;
  bag.add(PO, box(r[0], y - 0.5, r[1], r[2], y + Tb, r[3])); col.rect([r[0] - 0.4, r[1] - 0.4, r[2] + 0.4, r[3] + 0.4], y - 0.5, y + Tb);
  for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const tx = x + dx * (s / 2 - 0.3), tz = z + dz * (s / 2 - 0.3);
    bag.add(PO, lathe([[1.0, 0], [1.0, Tb + 2.5]], 8, null, tx, y - 0.5, tz));
    col.circle(tx, tz, 1.1, y - 0.5, y + Tb);
    for (const v of [12, 26, 38, 48]) bag.add(PO, lathe([[1.12, 0], [1.12, 0.35]], 8, null, tx, y + v, tz));
    bag.add(PO, lathe([[1.05, 0], [0.8, 0.6], [0.8, 2.4], [0.001, 7.5]], 8, null, tx, y + Tb + 2, tz));
    bag.add('gilt_bronze', lathe([[0.001, 0], [0.12, 0.15], [0.001, 0.5]], 6, null, tx, y + Tb + 9.5, tz));
  }
  for (const f of 'nsew') {
    const F = faceFrame(r, f);
    archWindow(bag, F, y, s / 2, Tb - 13, 3.0, 10, true, 2, PO);                                       // the belfry
    for (let l = 0; l < 7; l++) bag.add('lead', fbox(F, y, s / 2 - 1.4, s / 2 + 1.4, Tb - 12.2 + l * 1.0, Tb - 12.0 + l * 1.0, 0.18, 0.26));
    archWindow(bag, F, y, s / 2, Tb - 30, 1.6, 7, true, 1, PO);
    if (clock && (f === 'n' || f === 'w')) { bag.add('gilt_bronze', prism(F, y, ngon(s / 2, Tb - 18, 1.7, 24), 0, 0.12)); bag.add('paint_blue', prism(F, y, ngon(s / 2, Tb - 18, 1.5, 24), 0.12, 0.16)); for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; bag.add('gilt_bronze', fbox(F, y, s / 2 + Math.cos(a) * 1.25 - 0.07, s / 2 + Math.cos(a) * 1.25 + 0.07, Tb - 18 + Math.sin(a) * 1.25 - 0.07, Tb - 18 + Math.sin(a) * 1.25 + 0.07, 0.16, 0.2)); } bag.add('gilt_bronze', fbox(F, y, s / 2 - 0.05, s / 2 + 0.05, Tb - 18, Tb - 17.1, 0.2, 0.23)); bag.add('gilt_bronze', fbox(F, y, s / 2 - 0.05, s / 2 + 1.1, Tb - 18.05, Tb - 17.95, 0.23, 0.26)); }
    for (const v of [12, 26, 38]) bag.add(PO, fbox(F, y, 0.5, s - 0.5, v, v + 0.35, 0, 0.25));
    bag.add(PO, fbox(F, y, 0.5, s - 0.5, Tb, Tb + 1.8, -0.4, 0.15));                                   // the parapet, pierced
    for (let k = 0; k < 4; k++) bag.add('opening', prism(F, y, ngon(1.6 + k * (s - 3.2) / 3, Tb + 0.9, 0.35, 4), 0.15, 0.17));
    bag.add(PO, prism(F, y, [[s / 2 - 2, Tb + 1.8], [s / 2 + 2, Tb + 1.8], [s / 2, Tb + 4.2]], -0.4, 0.15));
  }
  bag.add('lead', frustum([r[0] + 0.5, r[1] + 0.5, r[2] - 0.5, r[3] - 0.5], y + Tb, y + Tb + 1.2, s / 2 - 1, s / 2 - 1, s / 2 - 1, s / 2 - 1));
}
