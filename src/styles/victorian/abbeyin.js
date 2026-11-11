// Westminster Abbey inside, about 1870 (docs/settlements/london.md §1.2a): the nave of arcade, triforium and clerestory under
// its rib vault, the aisles with their monuments, the crossing under the lantern, the transepts (Poets' Corner in the south one),
// the choir with its stalls behind the pulpitum and organ, the sacrarium with the Cosmati pavement, the high altar and Scott's
// reredos of 1867, the Lady Chapel's stalls and its fan vault; the west door under Hawksmoor's towers. Drawn on the walls that
// abbey.js leaves hollow: every wall a `wall` of rooms.js with its arches pierced, the windows glazed on the inner face.

import { box, lathe } from '../../core/geom.js';
import { prism, ngon, arch } from '../dutch/facade.js';
import { inner, poly, fb, wall, panels, bayVault, shaft, statue, ST, CV, OAK, G } from './rooms.js';
import { figure } from '../../objects/figures.js';

const FLOOR = 'flagstone', MARB = 'marble_floor', PU = 'marble_dark', TOMB = 'marble_smooth';
const pick = (a, i) => a[i % a.length];

/** the stained glass of a pointed window on the inner face F: glass in the head's strips, a mullion and two transoms, a stone sill */
function glazed(bag, F, uc, v0, wid, hh, lights = 2) {
  for (const q of arch(uc, v0, wid, hh, true)) bag.add('stained_glass', prism(F, 0, q, 0.0, 0.05));
  const vs = v0 + hh - wid * 0.866;
  for (let i = 1; i < lights; i++) { const m = uc - wid / 2 + i * wid / lights; fb(bag, F, ST, m - 0.06, m + 0.06, v0, vs + wid * 0.35, 0, 0.12); }
  for (const t of [0.4, 0.75]) fb(bag, F, ST, uc - wid / 2, uc + wid / 2, v0 + (vs - v0) * t - 0.04, v0 + (vs - v0) * t + 0.04, 0, 0.1);
  fb(bag, F, ST, uc - wid / 2 - 0.15, uc + wid / 2 + 0.15, v0 - 0.15, v0, 0, 0.3);
  for (const s of [-1, 1]) fb(bag, F, ST, uc + s * wid / 2 - 0.08, uc + s * wid / 2 + 0.08, v0, vs, 0, 0.14);
}
/** a marble monument against the wall F at u: a tablet on a sarcophagus, a mourning or standing figure, an urn */
function monument(ctx, F, u, v0, k, wide = 2.0) {
  const { bag, col } = ctx, [bx, bz] = F.at(u, 0.55), m = pick(['marble_smooth', 'marble', 'marble_pink'], k);
  fb(bag, F, TOMB, u - wide / 2, u + wide / 2, v0, v0 + 1.0, 0, 0.9); fb(bag, F, 'marble_dark', u - wide / 2 - 0.1, u + wide / 2 + 0.1, v0 + 1.0, v0 + 1.1, 0, 1.0);
  fb(bag, F, m, u - wide * 0.4, u + wide * 0.4, v0 + 1.1, v0 + 3.8, 0, 0.3);
  poly(bag, F, m, [[u - wide * 0.4, v0 + 3.8], [u + wide * 0.4, v0 + 3.8], [u, v0 + 4.6]], 0, 0.3);
  fb(bag, F, 'lacquer_black', u - wide * 0.25, u + wide * 0.25, v0 + 2.2, v0 + 3.2, 0.3, 0.33);
  for (let i = 0; i < 5; i++) fb(bag, F, 'gold', u - wide * 0.2, u + wide * 0.2 - (i % 2) * 0.3, v0 + 2.35 + i * 0.16, v0 + 2.4 + i * 0.16, 0.33, 0.345);
  const [fx, fz] = F.at(u + wide * 0.62, 0.55), rot = Math.atan2(F.at(u, 1)[0] - F.at(u, 0)[0], F.at(u, 1)[1] - F.at(u, 0)[1]) + Math.PI;
  statue(ctx, fx, fz, v0 + 1.1, rot, 40 + k, { m, h: 1.75 + (k % 3) * 0.1, over: k % 2 ? 'cloak' : 'cape', beard: k % 3 === 0 });
  col.rect([Math.min(bx, fx) - 0.7, Math.min(bz, fz) - 0.7, Math.max(bx, fx) + 0.7, Math.max(bz, fz) + 0.7], v0, v0 + 5);
}
/** a candlestick / gasolier: a brass crown of two rings hung from the vault on a chain */
function corona(bag, x, z, yTop, drop) {
  bag.add(G, lathe([[0.012, 0], [0.012, drop]], 4, null, x, yTop - drop, z));
  for (const [r, n] of [[1.0, 14], [0.6, 8]]) { bag.add(G, lathe([[r, 0], [r, 0.06], [r - 0.05, 0.06], [r - 0.05, 0]], 24, null, x, yTop - drop - 0.2, z)); for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2; bag.add('lamp_glass', lathe([[0.001, 0], [0.04, 0.05], [0.05, 0.14], [0.001, 0.2]], 6, null, x + Math.cos(a) * (r - 0.02), yTop - drop - 0.14, z + Math.sin(a) * (r - 0.02))); } }
}

/**
 * G: { y, cz, H, Ha, x0, x1, z0, z1, td, xc, tw, xe, edgesW, edgesE, lc } (abbey.js geometry); draws the whole interior; returns nothing.
 * Its walls take the places of the solid boxes the outside once had (outer faces unchanged).
 */
export function abbeyInterior(ctx, G0) {
  const { bag, col } = ctx, { y, cz, H, Ha, x0, z0, z1, td, xc, tw, xe, edgesW, edgesE, lc } = G0;
  const Y = (h) => y + h, T = 1.4, TA = 1.2, nzN = cz - 6 + T, nzS = cz + 6 - T, azN = cz - 13 + TA, azS = cz + 13 - TA;       // the nave's and the aisles' clear sides
  const nw0 = x0 + td + TA, xw = xc - tw / 2, xE = xc + tw / 2, xend = xe - 4;                                                // the nave's west end; the crossing's edges; the sanctuary's east end (the apse's springing)
  const NRw = [nw0, nzN, xw, nzS], NRe = [xE, nzN, xend, nzS];
  const slab = (r, m, yy = y + 0.05) => { bag.add(m, box(r[0], y - 0.5, r[1], r[2], yy, r[3])); col.floor(r, yy); };
  // the floors: flags in the nave and aisles, marble across the crossing and the choir, the Cosmati pavement before the altar
  slab([nw0, azN - TA, xw, azS + TA], FLOOR); slab([xw, z0 + 1.4, xE, z1 - 1.4], MARB); slab([xE, azN - TA, xend - 1.2, azS + TA], MARB);
  slab([xend - 1.2, nzN, xend, nzS], MARB);
  bag.add('opus_sectile', box(xend - 13, y + 0.05, cz - 3.2, xend - 2, y + 0.075, cz + 3.2)); bag.add('opus_sectile', box(xc - 3, y + 0.05, cz - 3, xc + 3, y + 0.075, cz + 3));
  // ── the nave and the choir: arcades (arches to the floor), triforium panelling, clerestory glass, shafts, vaults ──
  const longWalls = (R, edges, f) => {
    const F = inner(R, f), U = (x) => (f === 'n' ? x - R[0] : R[2] - x);
    const holes = [];
    for (let i = 0; i + 1 < edges.length; i++) { const a = U(edges[i] + 0.75), b = U(edges[i + 1] - 0.75); holes.push({ u0: Math.min(a, b), u1: Math.max(a, b), v1: Y(7.8), rise: 3.2 }); }
    wall(bag, col, ST, F, y, Y(H), T, holes);
    for (let i = 0; i + 1 < edges.length; i++) {
      const u0 = Math.min(U(edges[i] + 0.75), U(edges[i + 1] - 0.75)), u1 = Math.max(U(edges[i] + 0.75), U(edges[i + 1] - 0.75)), uc = (u0 + u1) / 2;
      panels(bag, F, ST, u0 + 0.05, u1 - 0.05, Y(11.8), Y(16.6), { pw: 0.55, d: 0.1 });
      fb(bag, F, ST, u0 - 0.1, u1 + 0.1, Y(11.2), Y(11.45), 0, 0.2); fb(bag, F, ST, u0 - 0.1, u1 + 0.1, Y(16.9), Y(17.1), 0, 0.2);          // the string courses
      glazed(bag, F, uc, Y(17.4), 2.8, 11.2, 2);
      for (const e of [edges[i], edges[i + 1]]) { const [sx, sz] = F.at(U(e), 0.2); void sx; void sz; }
    }
    for (const e of edges) {
      const u = U(e), [px, pz] = F.at(u, 0.0), dir = f === 'n' ? [0, 1] : [0, -1];
      shaft(bag, 'limestone', px, pz + dir[1] * 0.22, Y(8.2), Y(21), 0.1, dir);                       // the vaulting shaft
      shaft(bag, PU, px, pz + dir[1] * 0.2, y + 0.05, Y(8.2), 0.15, dir);                              // the Purbeck shaft of the pier
      for (const s of [-1, 1]) { const [qx, qz] = F.at(u + s * 0.5, 0.1); bag.add(PU, lathe([[0.17, 0], [0.13, 0.3], [0.13, 7.4], [0.18, 7.7]], 8, null, qx, y + 0.05, qz + dir[1] * 0.1)); }
    }
  };
  for (const [R, E] of [[NRw, edgesW], [NRe, edgesE]]) for (const f of ['n', 's']) longWalls(R, E, f);
  // the vaults over every bay: the nave's and the choir's springing from 21 m, the crown at 30.5 (a lancet-pointed rib vault)
  for (const [E, [za, zb]] of [[edgesW, [nzN, nzS]], [edgesE, [nzN, nzS]]]) for (let i = 0; i + 1 < E.length; i++) bayVault(bag, [E[i], za, E[i + 1], zb], Y(21), 9.3, { along: 'x' });
  // the aisles: outer wall, glazed lancets, vault, the mass above, and the monuments along them
  let mk = 0;
  const aisle = (R, edges, f) => {
    const F = inner(R, f), U = (x) => (f === 'n' ? x - R[0] : R[2] - x);
    wall(bag, col, ST, F, y, Y(Ha), TA, []);
    for (let i = 0; i + 1 < edges.length; i++) {
      const uc = (U(edges[i]) + U(edges[i + 1])) / 2;
      glazed(bag, F, uc, Y(2.8), 2.4, 7.2, 2);
      if (i % 2 === 0 && i + 2 < edges.length) monument(ctx, F, U(edges[i + 1]), y + 0.05, mk++, 1.8);
    }
  };
  for (const [E, x1] of [[edgesW, xw], [edgesE, xend - 1.2]]) {
    const xa = E[0], xb = E[E.length - 1];
    for (const [za, zb, f] of [[azN, nzN - T, 'n'], [nzS + T, azS, 's']]) {
      aisle([xa, za, xb, zb], E, f);
      for (let i = 0; i + 1 < E.length; i++) bayVault(bag, [E[i], za, E[i + 1], zb], Y(7.4), 3.2, { along: 'x', cell: ST });
      bag.add('limestone', box(xa, Y(10.9), za, xb, Y(Ha), zb));
    }
    void x1;
  }
  // the aisles' end walls, the nave's west wall with the great doorway into the porch, the east wall of the sanctuary
  for (const [za, zb] of [[azN, nzN - T], [nzS + T, azS]]) { wall(bag, col, ST, inner([nw0, za, xw, zb], 'w'), y, Y(Ha), TA, []); wall(bag, col, ST, inner([xE, za, xend - 1.2, zb], 'e'), y, Y(Ha), TA, []); }
  { const F = inner(NRw, 'w'); wall(bag, col, ST, F, y, Y(H), TA, [{ u0: 2.8, u1: 6.4, v1: Y(5.6), rise: 3.1 }]);
    glazed(bag, F, 4.6, Y(11.5), 6.2, 18, 4); }
  { const F = inner(NRe, 'e'); wall(bag, col, ST, F, y, Y(H), T, []);
    // Scott's reredos of 1867: alabaster in three tiers of niches with the mosaic of the Last Supper over the altar, the figures in the niches
    const w = 8.4, u0 = (F.w - w) / 2;
    fb(bag, F, 'marble_smooth', u0, u0 + w, y, Y(10), 0, 0.6); fb(bag, F, 'mosaic_gold', u0 + 0.5, u0 + w - 0.5, Y(3.4), Y(6.2), 0.6, 0.64);
    for (let k = 0; k < 6; k++) fb(bag, F, 'cloth_red', u0 + 0.8 + k * 1.2, u0 + 1.6 + k * 1.2, Y(3.7), Y(5.9), 0.64, 0.66);
    panels(bag, F, 'marble_smooth', u0 + 0.2, u0 + w - 0.2, Y(6.5), Y(9.4), { pw: 0.9, d: 0.8 }); panels(bag, F, 'marble_smooth', u0 + 0.2, u0 + w - 0.2, Y(0.7), Y(3.1), { pw: 0.9, d: 0.8 });
    for (let k = 0; k < 7; k++) fb(bag, F, G, u0 + 0.2 + k * 1.2, u0 + 0.28 + k * 1.2, Y(9.4), Y(10.2), 0.5, 0.6);
    fb(bag, F, G, u0 + w / 2 - 0.1, u0 + w / 2 + 0.1, Y(10), Y(11.6), 0.2, 0.3); fb(bag, F, G, u0 + w / 2 - 0.5, u0 + w / 2 + 0.5, Y(10.8), Y(11.0), 0.2, 0.3);
    glazed(bag, F, F.w / 2 - 3.3, Y(16), 2.2, 11, 2); glazed(bag, F, F.w / 2 + 3.3, Y(16), 2.2, 11, 2); glazed(bag, F, F.w / 2, Y(12), 2.4, 14, 2); }
  // ── the crossing and the transepts ──
  const TRi = [xw + T, z0 + 1.4, xE - T, z1 - 1.4], bw = TRi[2] - TRi[0];
  { const F = inner(TRi, 'w'), Fe = inner(TRi, 'e'), zT = TRi[3];
    const holeAt = (zA, zB, rev, v1, rise) => { const a = rev ? zB : zA, b = rev ? zA : zB; return { u0: (rev ? zT - b : a - TRi[1]), u1: (rev ? zT - a : b - TRi[1]), v1, rise }; };
    const hs = (rev) => { const o = []; for (const [zA, zB, v1, rise] of [[nzN, nzS, Y(19.6), 4.6], [azN + 1.0, nzN - T - 1.0, Y(6.2), 2.4], [nzS + T + 1.0, azS - 1.0, Y(6.2), 2.4]]) { const a = rev ? zT - zB : zA - TRi[1], b = rev ? zT - zA : zB - TRi[1]; o.push({ u0: a, u1: b, v1, rise }); } return o; };
    void holeAt;
    wall(bag, col, ST, F, y, Y(H), T, hs(true)); wall(bag, col, ST, Fe, y, Y(H), T, hs(false));
    for (const FF of [F, Fe]) for (const zc of [(z0 + 1.4 + azN) / 2, (azS + z1 - 1.4) / 2]) { const u = FF === F ? zT - zc : zc - TRi[1]; glazed(bag, FF, u, Y(14), 1.6, 9, 1); }
  }
  for (const f of ['n', 's']) {
    const F = inner(TRi, f), uc = bw / 2;
    wall(bag, col, ST, F, y, Y(H), T, []);
    // the rose over the five lancets, the portal below
    poly(bag, F, ST, ngon(uc, Y(H - 9), 4.7, 24), 0, 0.12); poly(bag, F, 'stained_glass', ngon(uc, Y(H - 9), 4.2, 24), 0.12, 0.17);
    for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; poly(bag, F, ST, [[uc + Math.cos(a) * 0.6 - Math.sin(a) * 0.06, Y(H - 9) + Math.sin(a) * 0.6 + Math.cos(a) * 0.06], [uc + Math.cos(a) * 4.2, Y(H - 9) + Math.sin(a) * 4.2], [uc + Math.cos(a) * 4.2 - Math.sin(a) * 0.12, Y(H - 9) + Math.sin(a) * 4.2 + Math.cos(a) * 0.12], [uc + Math.cos(a) * 0.6 + Math.sin(a) * 0.06, Y(H - 9) + Math.sin(a) * 0.6 - Math.cos(a) * 0.06]], 0.17, 0.24); }
    for (let k = 0; k < 5; k++) glazed(bag, F, uc - 4 + k * 2, Y(H - 18), 1.3, 4.6, 1);
    panels(bag, F, ST, 0.6, bw - 0.6, y + 0.5, y + 9, { pw: 0.8, d: 0.12 });
  }
  { const E = [z0 + 1.4, azN + 1.0, nzN, nzS, azS - 1.0, z1 - 1.4];
    for (let i = 0; i + 1 < E.length; i++) bayVault(bag, [TRi[0], E[i], TRi[2], E[i + 1]], Y(21), 9.3, { along: 'z' }); }
  // ── Poets' Corner (south arm): Chaucer's tomb on the east side, busts on brackets, tablets, the monuments along the west wall ──
  { const Fe = inner(TRi, 'e'), zc = (azS + z1 - 1.4) / 2, u = zc - TRi[1];
    fb(bag, Fe, TOMB, u - 1.3, u + 1.3, y + 0.05, y + 1.5, 0, 1.0); fb(bag, Fe, 'marble_dark', u - 1.4, u + 1.4, y + 1.5, y + 1.65, 0, 1.1);
    for (const s of [-1, 1]) fb(bag, Fe, ST, u + s * 1.2 - 0.12, u + s * 1.2 + 0.12, y + 1.65, y + 3.6, 0.1, 0.4);
    for (const q of arch(u, y + 3.2, 3.0, 2.2, true)) poly(bag, Fe, ST, q.map(([a, b]) => [a, b]), 0.1, 0.4);
    { const a = Fe.at(u - 1.4, 0), b = Fe.at(u + 1.4, 1.2); col.rect([Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], y, y + 1.7); }
    for (let k = 0; k < 6; k++) {
      const uu = 3 + k * 1.15, [bx, bz] = Fe.at(uu, 0.25);
      if (Math.abs(uu - u) > 2) { fb(bag, Fe, 'marble_dark', uu - 0.15, uu + 0.15, y + 2.2 + (k % 2) * 0.5, y + 2.4 + (k % 2) * 0.5, 0, 0.3); bag.add(TOMB, lathe([[0.001, 0], [0.12, 0.05], [0.13, 0.2], [0.09, 0.32], [0.001, 0.36]], 8, null, bx, y + 2.4 + (k % 2) * 0.5, bz)); }
    }
    const Fw = inner(TRi, 'w');
    for (let k = 0; k < 4; k++) fb(bag, Fw, k % 2 ? TOMB : 'marble_pink', 2.3 + k * 1.6, 3.6 + k * 1.6, y + 1.6 + (k % 2) * 1.0, y + 3.0 + (k % 2) * 1.0, 0, 0.08);
    for (let k = 0; k < 3; k++) fb(bag, Fw, TOMB, 8 + k * 1.5, 9.2 + k * 1.5, y + 2.0, y + 3.3, 0, 0.08);
    monument(ctx, Fw, 14.5, y + 0.05, 21, 1.8); }
  // ── the pulpitum and its organ at the choir's west end, the choir stalls, the lectern, the altar ──
  { const px = xE + 0.4, F = inner([px, nzN, px + 1.0, nzS], 'w');
    wall(bag, col, ST, F, y, Y(5.2), 1.0, [{ u0: 3.4, u1: 5.8, v1: Y(2.2), rise: 1.4 }]);
    panels(bag, F, ST, 0.5, 2.9, y + 0.6, Y(4.6), { pw: 0.7, d: 0.14 }); panels(bag, F, ST, 6.3, 8.7, y + 0.6, Y(4.6), { pw: 0.7, d: 0.14 });
    fb(bag, F, ST, -0.1, 9.3, Y(5.2), Y(5.5), -1.0, 0.2);
    // the organ case over it: an oak case, three towers of gilt pipes
    fb(bag, F, OAK, 0.5, 8.7, Y(5.5), Y(9.5), -1.0, -0.2);
    for (const [uc, hh] of [[1.8, 4.4], [4.6, 5.6], [7.4, 4.4]]) { fb(bag, F, G, uc - 1.0, uc + 1.0, Y(9.5), Y(9.7 + hh * 0.2), -0.96, -0.2); for (let k = 0; k < 9; k++) { const u = uc - 0.9 + k * 0.225, ph = hh * (0.5 + 0.5 * Math.cos((k - 4) / 4 * 1.3)), [qx, qz] = F.at(u, -0.1); bag.add(G, lathe([[0.001, 0], [0.065, 0.02], [0.065, ph], [0.001, ph + 0.02]], 6, null, qx, Y(5.5), qz)); } }
  }
  for (const s of [-1, 1]) {
    const zWall = s < 0 ? nzN : nzS, zin = s < 0 ? 1 : -1;
    for (let k = 0; k < 10; k++) {
      const x = xE + 2.6 + k * 1.15, zb = zWall + zin * 0.45;
      if (x > xend - 8) break;
      bag.add(OAK, box(x - 0.5, y + 0.05, zb - 0.3, x + 0.5, y + 0.55, zb + 0.3)); bag.add(OAK, box(x - 0.5, y + 0.55, zb + zin * 0.28 - 0.04, x + 0.5, y + 2.6, zb + zin * 0.28 + 0.04));
      bag.add(OAK, box(x - 0.52, y + 2.6, zb - 0.3 - 0.05 * zin, x + 0.52, y + 2.75, zb + 0.3)); bag.add(OAK, lathe([[0.1, 0], [0.04, 0.5], [0.001, 0.8]], 4, null, x, y + 2.75, zb));
      const zf = zWall + zin * 1.5;
      bag.add(OAK, box(x - 0.5, y + 0.05, zf - 0.28, x + 0.5, y + 0.5, zf + 0.28)); bag.add(OAK, box(x - 0.5, y + 0.5, zf + zin * 0.28 - 0.03, x + 0.5, y + 1.3, zf + zin * 0.28 + 0.03));
      bag.add('cloth_red', box(x - 0.4, y + 0.5, zf - 0.22, x + 0.4, y + 0.56, zf + 0.22));
    }
    col.rect([xE + 2.0, Math.min(zWall, zWall + zin * 2.0), xend - 8, Math.max(zWall, zWall + zin * 2.0)], y, y + 2.8);
  }
  // the altar under its cloth with the cross and candlesticks, the rail before it, the sedilia
  { const ax = xend - 3.6;
    bag.add(TOMB, box(ax - 0.7, y + 0.05, cz - 1.3, ax + 0.7, y + 1.0, cz + 1.3)); bag.add('cloth_red', box(ax - 0.75, y + 1.0, cz - 1.4, ax + 0.75, y + 1.04, cz + 1.4)); col.rect([ax - 0.8, cz - 1.5, ax + 0.8, cz + 1.5], y, y + 1.1);
    bag.add(G, box(ax - 0.05, y + 1.04, cz - 0.04, ax + 0.05, y + 1.8, cz + 0.04)); bag.add(G, box(ax - 0.05, y + 1.5, cz - 0.3, ax + 0.05, y + 1.56, cz + 0.3));
    for (const s of [-1, 1]) { bag.add(G, lathe([[0.1, 0], [0.04, 0.05], [0.03, 0.5], [0.06, 0.55]], 8, null, ax, y + 1.04, cz + s * 1.0)); bag.add('flame', box(ax - 0.02, y + 1.6, cz + s * 1.0 - 0.02, ax + 0.02, y + 1.66, cz + s * 1.0 + 0.02)); }
    for (const [dx, dz0, dz1] of [[-2.2, -3.0, -0.8], [-2.2, 0.8, 3.0]]) { bag.add(G, box(ax + dx, y + 0.5, cz + dz0, ax + dx + 0.04, y + 0.9, cz + dz1)); for (let k = 0; k < 7; k++) { const z = cz + dz0 + k * (dz1 - dz0) / 6; bag.add(G, box(ax + dx - 0.01, y + 0.05, z - 0.02, ax + dx + 0.05, y + 0.5, z + 0.02)); } }
  }
  { const lx = xc - 1.5, lz = cz - 1.0;                                                         // the brass eagle lectern at the crossing
    bag.add(G, lathe([[0.3, 0], [0.12, 0.1], [0.06, 0.2], [0.06, 1.1], [0.2, 1.2]], 8, null, lx, y + 0.05, lz)); bag.add(G, box(lx - 0.25, y + 1.25, lz - 0.2, lx + 0.25, y + 1.5, lz + 0.2)); bag.add('linen', box(lx - 0.22, y + 1.5, lz - 0.17, lx + 0.22, y + 1.54, lz + 0.17)); col.circle(lx, lz, 0.35, y, y + 1.6); }
  // gasoliers hung in the nave, the crossing and the choir; rows of rush chairs in the nave
  for (const [gx, gz] of [[nw0 + 14, cz], [nw0 + 28, cz], [nw0 + 42, cz], [xc, cz], [xE + 8, cz], [xE + 16, cz]]) corona(bag, gx, gz, Y(24), 6);
  for (let r = 0; r < 8; r++) for (const s of [-1, 1]) for (let c = 0; c < 4; c++) { const x = nw0 + 10 + r * 1.0, z = cz + s * (0.9 + c * 0.55 + (c > 1 ? 0.5 : 0)); if (c === 0 && r > 6) continue; bag.add('wicker', box(x - 0.2, y + 0.4, z - 0.24, x + 0.2, y + 0.45, z + 0.24)); bag.add(OAK, box(x - 0.2, y + 0.05, z - 0.24, x - 0.16, y + 0.9, z + 0.24)); bag.add(OAK, box(x - 0.2, y + 0.05, z - 0.24, x + 0.2, y + 0.4, z - 0.2)); bag.add(OAK, box(x - 0.2, y + 0.05, z + 0.2, x + 0.2, y + 0.4, z + 0.24)); }
  col.rect([nw0 + 9.6, cz - 3.6, nw0 + 17.4, cz + 3.6], y, y + 0.9);
  // ── the porch under the west window, between Hawksmoor's towers ──
  { const vx0 = x0 + 1, vx1 = x0 + td, vz0 = cz - 4.7 + 1.2, vz1 = cz + 4.7 - 1.2, vest = [vx0 + 1.2, vz0, vx1, vz1];
    slab([vx0, vz0, vx1, vz1], FLOOR);
    const Fw = inner(vest, 'w');
    wall(bag, col, ST, Fw, y, Y(H + 2), 1.2, [{ u0: (vz1 - vz0) / 2 - 1.5, u1: (vz1 - vz0) / 2 + 1.5, v1: Y(4.8), rise: 2.6 }]);
    for (const [za, zb] of [[vz0 - 1.2, vz0], [vz1, vz1 + 1.2]]) { bag.add(ST, box(vx0, y - 0.5, za, vx1, Y(H + 2), zb)); col.rect([vx0, za, vx1, zb], y, Y(H + 2)); }
    bag.add(ST, box(vx0, Y(9.5), vz0, vx1, Y(H + 2), vz1)); col.rect([vx0, vz0, vx1, vz1], Y(9.5), Y(H + 2));
    bayVault(bag, [vx0 + 1.2, vz0, vx1, vz1], Y(5.8), 3.3, { along: 'x' });
    const Fn = inner(vest, 'n'); panels(bag, Fn, ST, 0.4, vest[2] - vest[0] - 0.4, y + 0.6, Y(4.8), { pw: 0.7, d: 0.1 });
    const Fs = inner(vest, 's'); panels(bag, Fs, ST, 0.4, vest[2] - vest[0] - 0.4, y + 0.6, Y(4.8), { pw: 0.7, d: 0.1 });
  }
  // ── Henry VII's chapel (the Lady Chapel): stalls of the Knights of the Bath under their banners, the fan vault, the tomb ──
  ladyChapel(ctx, G0, lc);
  // the people: a verger, visitors, a few at prayer, a clergyman in the choir
  const P = (x, z, rot, o) => figure({ t: 'figure', at: [x, z], y: y + 0.05, rot, h: 1.65, skin: 'skin_light', feet: 'shod', seed: Math.floor(x * 13 + z * 7), ...o }, ctx);
  const black = { dress: 'robe', cloth: 'cloth_black', cloth2: 'cloth_black', over: 'none' };
  P(nw0 + 6, cz + 1.6, Math.PI / 2, { ...black, hat: 'none', beard: true, carry: 'staff', pose: 'staff', len: 1.7 });
  P(nw0 + 20, cz - 2, -Math.PI / 2, { dress: 'trousers', cloth: 'cloth_black', cloth2: 'cloth_grey', hat: 'brim', hatMat: 'cloth_black', over: 'cloak', pose: 'talk' });
  P(nw0 + 20.9, cz - 2.3, Math.PI / 2 + 0.3, { dress: 'robe', cloth: 'cloth_maroon', cloth2: 'cloth_black', hat: 'brim', hatMat: 'cloth_black', over: 'cape', pose: 'talk' });
  P(nw0 + 13.5, cz + 2.2, Math.PI / 2, { dress: 'robe', cloth: 'cloth_indigo', cloth2: 'cloth_black', hat: 'brim', hatMat: 'cloth_black', over: 'shawl', pose: 'kneel', arms: 'pray' });
  P(xc + 2, cz + 4.4, Math.PI, { dress: 'trousers', cloth: 'cloth_black', cloth2: 'cloth_grey', hat: 'brim', hatMat: 'cloth_black', over: 'cloak', beard: true });
  P(xend - 6, cz - 4.1, Math.PI / 2, { ...black, over: 'none', hat: 'none', pose: 'sit' });
  P(xend - 6, cz + 4.1, -Math.PI / 2, { ...black, over: 'none', hat: 'none', pose: 'sit' });
  P(xc, z1 - 6, Math.PI, { dress: 'trousers', cloth: 'cloth_brown', cloth2: 'cloth_black', hat: 'brim', hatMat: 'cloth_black', over: 'cloak', pose: 'talk' });
}

/** the Lady Chapel: hollow box [xe+2…x1] × [cz−8…cz+8] to 21 m, a door in its north side, five bays of fan vault, stalls along both walls, the tomb */
function ladyChapel(ctx, G0, lc) {
  const { bag, col } = ctx, { y, x1 } = G0, Hl = 21, Y = (h) => y + h, T = 1.2;
  const R = [lc[0] + T, lc[1] + T, lc[2] - T, lc[3] - T], w = R[3] - R[1];
  bag.add(MARB, box(lc[0], y - 0.5, lc[1], lc[2], y + 0.05, lc[3])); col.floor(lc, y + 0.05);
  bag.add('opus_sectile', box(R[0] + 4, y + 0.05, R[1] + 3, R[2] - 4, y + 0.075, R[3] - 3));
  const n = 5, bays = Array.from({ length: n + 1 }, (_, i) => R[0] + (R[2] - R[0]) * i / n);
  // the north wall with the door the visitor comes by (the way in from the aisle's side is a stair we do not draw); south wall plain; the east end with the glass
  const Fn = inner(R, 'n'), Fs = inner(R, 's'), Fe = inner(R, 'e'), Fw = inner(R, 'w');
  const dc = 2.5 * ((lc[2] - lc[0]) / 5) - T;
  wall(bag, col, ST, Fn, y, Y(Hl), T, [{ u0: dc - 1.1, u1: dc + 1.1, v1: Y(3.4), rise: 2.0 }]);
  wall(bag, col, ST, Fs, y, Y(Hl), T, []); wall(bag, col, ST, Fe, y, Y(Hl), T, []); wall(bag, col, ST, Fw, y, Y(Hl), T, []);
  for (const [F, u0s] of [[Fn, bays.map((b) => b - R[0])], [Fs, bays.map((b) => R[2] - b).reverse()]]) for (let i = 0; i + 1 < u0s.length; i++) { const a = u0s[i], b = u0s[i + 1]; if (F === Fn && Math.abs((a + b) / 2 - dc) < 2.2) continue; glazed(bag, F, (a + b) / 2, Y(4), Math.min(2.6, b - a - 1.2), 11, 2); panels(bag, F, ST, a + 0.3, b - 0.3, Y(16.5), Y(19), { pw: 0.6, d: 0.1 }); }
  glazed(bag, Fe, w / 2, Y(4), 6.0, 14, 4); for (let k = 0; k < 4; k++) fb(bag, Fe, ST, 0.4 + k * (w - 0.8) / 3 - 0.12, 0.4 + k * (w - 0.8) / 3 + 0.12, y, Y(4), 0, 0.3);
  // the fan vault: each bay a pointed barrel with fans of ribs from the corbels — the cell and the ribs by bayVault (tiercerons, bosses), a pendant at the centre
  for (let i = 0; i < n; i++) { bayVault(bag, [bays[i], R[1], bays[i + 1], R[3]], Y(14), 5.8, { along: 'x', ribW: 0.2, N: 10 }); const [px, pz] = [(bays[i] + bays[i + 1]) / 2, (R[1] + R[3]) / 2]; bag.add(G, lathe([[0.4, 0], [0.3, -0.5], [0.18, -1.1], [0.001, -1.5]], 8, null, px, y + 19.5, pz)); }
  bag.add('limestone', box(lc[0], Y(19.9), lc[1], lc[2], Y(Hl), lc[3]));
  // the stalls of the Order of the Bath along both long walls, each with its banner above, the crests on the stall backs
  for (const s of [-1, 1]) {
    const zWall = s < 0 ? R[1] : R[3], zin = s < 0 ? 1 : -1;
    for (let k = 0; k < Math.floor((R[2] - R[0] - 5) / 1.0); k++) {
      const x = R[0] + 2.5 + k * 1.0, zb = zWall + zin * 0.45;
      bag.add(OAK, box(x - 0.45, y + 0.05, zb - 0.3, x + 0.45, y + 0.55, zb + 0.3)); bag.add(OAK, box(x - 0.45, y + 0.55, zb + zin * 0.28 - 0.04, x + 0.45, y + 3.0, zb + zin * 0.28 + 0.04));
      bag.add(OAK, box(x - 0.47, y + 3.0, zb - 0.3 - 0.05 * zin, x + 0.47, y + 3.15, zb + 0.3)); bag.add(OAK, lathe([[0.09, 0], [0.03, 0.5], [0.001, 0.9]], 4, null, x, y + 3.15, zb));
      bag.add(pick(['cloth_red', 'cloth_blue', 'cloth_maroon', 'cloth_ochre'], k), box(x - 0.2, y + 3.9, zb + zin * 0.28 - 0.015, x + 0.2, y + 5.4, zb + zin * 0.28 + 0.015)); bag.add(G, box(x - 0.2, y + 3.88, zb + zin * 0.28 - 0.02, x + 0.2, y + 3.92, zb + zin * 0.28 + 0.02));
    }
    col.rect([R[0] + 2, Math.min(zWall, zWall + zin * 1.2), R[2] - 2.5, Math.max(zWall, zWall + zin * 1.2)], y, y + 3.2);
  }
  // the tomb of Henry VII and Elizabeth of York behind its bronze grille: a black marble tomb chest with the gilt effigies, the screen of gilt bronze round it
  { const tx = (R[0] + R[2]) / 2 + 2, tz = (R[1] + R[3]) / 2;
    bag.add('granite_black', box(tx - 1.7, y + 0.05, tz - 0.9, tx + 1.7, y + 1.3, tz + 0.9)); bag.add('marble_dark', box(tx - 1.8, y + 1.3, tz - 1.0, tx + 1.8, y + 1.4, tz + 1.0));
    for (const s of [-1, 1]) { bag.add(G, box(tx - 1.2, y + 1.4, tz + s * 0.4 - 0.2, tx + 1.2, y + 1.55, tz + s * 0.4 + 0.2)); bag.add('gilt_bronze', lathe([[0.001, 0], [0.12, 0.02], [0.14, 0.1], [0.001, 0.14]], 8, null, tx - 1.1, y + 1.55, tz + s * 0.4)); }
    for (let k = 0; k <= 22; k++) { const t = k / 22; bag.add(G, box(tx - 2.6 + t * 5.2 - 0.015, y + 0.05, tz - 1.6 - 0.015, tx - 2.6 + t * 5.2 + 0.015, y + 2.2, tz - 1.6 + 0.015)); bag.add(G, box(tx - 2.6 + t * 5.2 - 0.015, y + 0.05, tz + 1.6 - 0.015, tx - 2.6 + t * 5.2 + 0.015, y + 2.2, tz + 1.6 + 0.015)); }
    for (let k = 0; k <= 8; k++) { const t = k / 8; bag.add(G, box(tx - 2.6 - 0.015, y + 0.05, tz - 1.6 + t * 3.2 - 0.015, tx - 2.6 + 0.015, y + 2.2, tz - 1.6 + t * 3.2 + 0.015)); bag.add(G, box(tx + 2.6 - 0.015, y + 0.05, tz - 1.6 + t * 3.2 - 0.015, tx + 2.6 + 0.015, y + 2.2, tz - 1.6 + t * 3.2 + 0.015)); }
    bag.add(G, box(tx - 2.62, y + 2.2, tz - 1.62, tx + 2.62, y + 2.26, tz - 1.58)); bag.add(G, box(tx - 2.62, y + 2.2, tz + 1.58, tx + 2.62, y + 2.26, tz + 1.62));
    col.rect([tx - 2.7, tz - 1.7, tx + 2.7, tz + 1.7], y, y + 2.3); }
  void x1; void CV;
}
