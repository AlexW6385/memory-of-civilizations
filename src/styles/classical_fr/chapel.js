// The Royal Chapel of Versailles (docs/settlements/versailles.md §1e): Hardouin-Mansart's and Robert de Cotte's
// chapel of 1699–1710, 42 m long and 24 m wide on a squat base, 40 m to the ridge — a tall box of pale stone with an
// apse, the arcaded ground storey for the court, the first storey on the level of the royal apartments with
// Corinthian pilasters outside and a colonnade of free-standing Corinthian columns inside, a stone balustrade
// crowned with statues, a steep lead roof dressed in gilt, and one segmental vault painted by Coypel (God the
// Father in glory), La Fosse (the Resurrection, in the apse's half-dome) and Jouvenet; the marble floor with the
// crowned double L at the altar steps, the organ of Clicquot above the altar, the royal tribune facing it.
//
// chapel: { rect (outer: 24 wide, apse at the north end), y (ground), fy (the tribune's floor) }

import { box, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { planarWall } from '../byzantine/index.js';
import { frame, hexa, painting, chandelier, marbleFloor, frenchCapital, GB, GD, AG, MS, WM, RM, DM } from './rooms.js';

const S = 'sandstone_dressed', LD = 'lead', PW = 'plaster_white', WD = 'wood_dark';
const W = 24, T = 1.6, HW = 10.4, BAY = 3.55, NB = 8, CH = 24.0, GAL = 4.9;       // outer width, wall, inner half-width, bay, bays, cornice height, the nave's half-width at the colonnade
const RS = 12, FAC = 6;                                                          // the apse's outer radius and its facets

/** the plan point at angle a (0 east, π/2 north) and radius r about the apse's centre */
const pt = (c, a, r) => [c[0] + Math.cos(a) * r, c[1] - Math.sin(a) * r];
/** a ring sector (a prism) between radii r0 and r1, angles a0…a1, heights y0…y1 */
function sector(bag, mat, c, r0, r1, y0, y1, a0, a1, n) {
  const out = [];
  for (let k = 0; k < n; k++) {
    const s0 = a0 + (a1 - a0) * k / n, s1 = a0 + (a1 - a0) * (k + 1) / n;
    const Q = (r, s, y) => { const p = pt(c, s, r); return [p[0], y, p[1]]; };
    hexa(out, [Q(r0, s0, y0), Q(r1, s0, y0), Q(r1, s1, y0), Q(r0, s1, y0)], [Q(r0, s0, y1), Q(r1, s0, y1), Q(r1, s1, y1), Q(r0, s1, y1)]);
  }
  bag.add(mat, fromTriangles(out));
}
/** a Corinthian column (free-standing) with base, shaft, capital and the gilt acanthus ring */
function column(bag, col, x, z, y, h, r = 0.42) {
  bag.add(MS, lathe([[r * 1.45, 0], [r * 1.45, 0.12], [r * 1.2, 0.2], [r * 1.12, 0.3], [r, 0.38], [r * 0.93, h - 1.0], [r * 0.9, h - 0.82], [r * 1.0, h - 0.8], [r * 1.12, h - 0.55], [r * 1.5, h - 0.2], [r * 1.65, h - 0.1], [r * 1.65, h], [0.001, h]], 14, null, x, y, z));
  bag.add(GB, lathe([[r * 1.0, h - 0.8], [r * 1.18, h - 0.72], [r * 1.42, h - 0.45], [r * 1.5, h - 0.4], [r * 1.3, h - 0.55], [r * 1.05, h - 0.78]], 12, null, x, y, z));
  col.circle(x, z, r * 1.2, y, y + h);
}
/** a statue on its pedestal, standing at (x, z) on y: a robed figure with a raised arm, or a seated one */
function statue(bag, x, y, z, s, k) {
  bag.add(S, box(x - 0.55 * s, y, z - 0.55 * s, x + 0.55 * s, y + 0.18, z + 0.55 * s));
  bag.add(S, box(x - 0.42 * s, y + 0.18, z - 0.42 * s, x + 0.42 * s, y + 1.05 * s, z + 0.42 * s));
  bag.add(S, box(x - 0.5 * s, y + 1.05 * s, z - 0.5 * s, x + 0.5 * s, y + 1.2 * s, z + 0.5 * s));
  const y0 = y + 1.2 * s, M = 'marble_smooth';
  bag.add(M, lathe([[0.45 * s, 0], [0.4 * s, 0.35 * s], [0.3 * s, 1.2 * s], [0.24 * s, 1.7 * s], [0.3 * s, 2.0 * s], [0.16 * s, 2.15 * s], [0.001, 2.2 * s]], 10, (t, i) => (i > 0 && i < 4 ? 1 + 0.12 * Math.cos(5 * t + k) : 1), x, y0, z));
  bag.add(M, lathe([[0.001, 0], [0.11 * s, 0.03 * s], [0.12 * s, 0.17 * s], [0.07 * s, 0.27 * s], [0.001, 0.29 * s]], 8, null, x, y0 + 2.15 * s, z));
  // the raised arm holding an attribute (a palm, a book, a cross), the drapery blowing out
  const g = lathe([[0.07 * s, 0], [0.05 * s, 0.8 * s], [0.001, 0.85 * s]], 6, null, 0, 0, 0);
  g.rotateZ(0.5 * (k % 2 ? 1 : -1)); g.translate(x + 0.22 * s * (k % 2 ? 1 : -1), y0 + 1.5 * s, z); bag.add(M, g);
  bag.add(M, lathe([[0.2 * s, 0], [0.34 * s, 0.5 * s], [0.001, 0.9 * s]], 6, null, x - 0.3 * s, y0 + 0.9 * s, z + 0.1 * s));
}
/** a hip roof (closed) over the straight part of the nave: base rect r at y0, ridge from (cx, za) to (cx, zb) at y1 */
function hipped(bag, mat, r, y0, y1, za, zb) {
  const cx = (r[0] + r[2]) / 2, t = [];
  const A = [r[0], y0, r[1]], B = [r[2], y0, r[1]], C = [r[2], y0, r[3]], D = [r[0], y0, r[3]], R0 = [cx, y1, za], R1 = [cx, y1, zb];
  t.push(...A, ...D, ...R1, ...A, ...R1, ...R0, ...B, ...R0, ...R1, ...B, ...R1, ...C, ...D, ...C, ...R1, ...A, ...B, ...C, ...A, ...C, ...D);
  bag.add(mat, fromTriangles(orientOutward(t)));
}

export function chapel(el, ctx) {
  const { bag, col, lights } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, G = el.fy ?? y + 8.3;
  const cx = (x0 + x1) / 2, zs = z1, C = [cx, z0 + RS], zc = C[1], TOP = y + 40, EAVE = y + 25.4, SP = y + 19.0, CR = y + 26.0;
  const zi = zs - T;                                                       // the south wall's inner face
  const zb = (j) => zi - BAY * j;                                          // the bays' lines (j = 0 … 8; 8 is the apse's springing, zc)
  const xe = cx + GAL, xw = cx - GAL;
  const win = (j) => (zb(j) + zb(j + 1)) / 2;                              // the bays' centres
  const SL = y - 0.5;

  // ── the straight walls (east and west): masonry with the lower round-headed windows and the tall upper ones
  const mid = (zs + zc) / 2, L = (zs - zc) / 2;
  for (const sg of [-1, 1]) {
    const xm = cx + sg * (W / 2 - T / 2), inner = cx + sg * HW;
    const arches = [];
    for (let j = 0; j < NB; j++) { const u = win(j) - mid; arches.push({ uc: u, r: 1.1, spring: y + 5.3, sill: y + 1.1 }, { uc: u, r: 1.5, spring: y + 17.2, sill: y + 10.4 }); }
    const opt = { o: [xm, mid], u: [0, 1], th: T, u0: -L, u1: L, y0: SL, y1: y + CH, arches };
    bag.add(S, planarWall(opt));
    // the inner skin, in plaster, the same openings
    bag.add(PW, planarWall({ ...opt, o: [inner - sg * 0.03, mid], th: 0.06, y0: y, y1: y + CH - 0.3 }));
    col.rect([Math.min(xm, inner) - T / 2, zc, Math.max(xm, inner) + T / 2, zs], SL, y + CH);
  }
  // ── the south wall, with the door of the court and the great window of the royal tribune
  { const o = { o: [cx, zs - T / 2], u: [1, 0], th: T, u0: -W / 2, u1: W / 2, y0: SL, y1: y + CH, arches: [{ uc: 0, r: 1.35, spring: y + 3.9, sill: y }, { uc: 0, r: 2.0, spring: y + 16.6, sill: y + 10.6 }, ...[-1, 1].flatMap((s) => [{ uc: s * 6.6, r: 1.1, spring: y + 5.3, sill: y + 1.1 }, { uc: s * 6.6, r: 1.5, spring: y + 17.2, sill: y + 10.4 }])] };
    bag.add(S, planarWall(o)); bag.add(PW, planarWall({ ...o, o: [cx, zi + 0.03], th: 0.06, y0: y, y1: y + CH - 0.3 }));
    for (const [a, b] of [[x0, cx - 1.35], [cx + 1.35, x1]]) col.rect([a, zi, b, zs], SL, y + CH);
    col.rect([cx - 1.35, zi, cx + 1.35, zs], y + 3.9, y + CH);
    bag.add(MS, box(cx - 1.5, y - 0.02, zs - 0.1, cx + 1.5, y + 0.1, zs + 0.8)); col.floor([cx - 1.5, zs - 0.1, cx + 1.5, zs + 0.8], y + 0.1);
    // the doors: two leaves of dark wood standing open against the reveals
    for (const s of [-1, 1]) bag.add(WD, box(cx + s * 1.3 - 0.04, y + 0.1, zs - 1.55, cx + s * 1.3 + 0.04, y + 3.7, zs - 0.25));
  }
  // ── the apse: six facets of masonry, a window on each storey
  const fc = [];                                                            // facet data: the outer midpoint, its outward normal, the half chord
  for (let k = 0; k < FAC; k++) {
    const a0 = Math.PI * k / FAC, a1 = Math.PI * (k + 1) / FAC, am = (a0 + a1) / 2, ap = RS * Math.cos(Math.PI / (2 * FAC)), api = HW * Math.cos(Math.PI / (2 * FAC));
    const mp = pt(C, am, (ap + api) / 2), tg = [-Math.sin(am) * -1, 0]; void tg;
    const dir = [-Math.sin(am), -Math.cos(am)];                              // along the facet (the tangent in plan)
    const half = RS * Math.sin(Math.PI / FAC) + 0.5;
    const o = { o: mp, u: dir, th: T - 0.05, u0: -half, u1: half, y0: SL, y1: y + CH, arches: [{ uc: 0, r: 1.15, spring: y + 5.3, sill: y + 1.1 }, { uc: 0, r: 1.55, spring: y + 17.2, sill: y + 10.4 }] };
    bag.add(S, planarWall(o));
    const nrm = [Math.cos(am), -Math.sin(am)];
    bag.add(PW, planarWall({ ...o, o: [mp[0] - nrm[0] * (T / 2 - 0.0), mp[1] - nrm[1] * (T / 2 - 0.0)], th: 0.06, u0: -half + 0.5, u1: half - 0.5, y0: y, y1: y + CH - 0.3 }));
    const p0 = pt(C, a0, RS - 0.8), p1 = pt(C, a1, RS - 0.8);
    col.segment(p0, p1, T + 0.2, SL, y + CH);
    fc.push({ mp, nrm, a: am, ap });
  }
  void fc;

  // ── the floor of the nave: white and black marble, the crowned double L at the altar steps
  marbleFloor(bag, col, [x0 + T, zc, x1 - T, zi], y, 1.5);
  { const t = []; for (let k = 0; k < 24; k++) { const a = Math.PI * k / 24, b = Math.PI * (k + 1) / 24, P = (s, r) => { const p = pt(C, s, r); return [p[0], y, p[1]]; }; t.push(...P(a, 0), ...P(b, HW), ...P(a, HW), ...P(a, 0), ...P(b, 0), ...P(b, HW)); }
    const up = []; for (let i = 0; i < t.length; i += 9) { const ux = t[i + 3] - t[i], uz = t[i + 5] - t[i + 2], vx = t[i + 6] - t[i], vz = t[i + 8] - t[i + 2]; up.push(...(uz * vx - ux * vz < 0 ? [t[i], t[i + 1], t[i + 2], t[i + 6], t[i + 7], t[i + 8], t[i + 3], t[i + 4], t[i + 5]] : t.slice(i, i + 9))); }
    bag.add('marble_floor', fromTriangles(up)); col.floor([cx - HW, zc - HW, cx + HW, zc], y); }
  // the altar: three steps in coloured marble, the table with its gilt frontal, the tabernacle, the cross and candlesticks
  const AZ = zc - 5.2;
  for (let k = 0; k < 3; k++) { const rr = 4.2 - k * 0.55; bag.add(RM, lathe([[rr, 0], [rr, 0.16], [0.001, 0.16]], 24, null, cx, y + k * 0.16, AZ + 0.3)); }
  col.circle(cx, AZ, 2.6, y, y + 1.1);
  bag.add(MS, box(cx - 1.7, y + 0.48, AZ - 0.7, cx + 1.7, y + 1.25, AZ + 0.7)); bag.add(GB, box(cx - 1.55, y + 0.55, AZ + 0.7, cx + 1.55, y + 1.15, AZ + 0.74));
  bag.add(GB, box(cx - 0.35, y + 1.25, AZ - 0.35, cx + 0.35, y + 1.9, AZ + 0.35)); bag.add(GB, lathe([[0.3, 0], [0.12, 0.05], [0.08, 0.7], [0.001, 0.8]], 6, null, cx, y + 1.9, AZ));
  for (const s of [-1, 1]) for (const dd of [0.9, 1.25]) bag.add(GB, lathe([[0.1, 0], [0.04, 0.12], [0.03, 0.5], [0.06, 0.58], [0.001, 0.6]], 8, null, cx + s * dd * 1.0, y + 1.25, AZ));
  // the communion rail across the sanctuary, its gate open
  for (const s of [-1, 1]) { const a = s < 0 ? cx - 6.6 : cx + 1.2, b = s < 0 ? cx - 1.2 : cx + 6.6; bag.add(MS, box(a, y + 0.95, zc - 0.05, b, y + 1.05, zc + 0.12)); bag.add(MS, box(a, y, zc - 0.03, b, y + 0.25, zc + 0.1)); for (let u = a + 0.15; u < b; u += 0.32) bag.add(MS, lathe([[0.04, 0], [0.06, 0.2], [0.04, 0.5], [0.07, 0.7], [0.001, 0.72]], 6, null, u, y + 0.25, zc + 0.03)); col.segment([a, zc + 0.03], [b, zc + 0.03], 0.15, y, y + 1.05); }

  // ── the arcade under the tribune (piers and round arches), the colonnade above it, the gallery's slab
  const G0 = G - 0.5;
  for (const sg of [-1, 1]) {
    const xa = cx + sg * GAL;
    // the arcade's wall: piers between the arches, open arches under the slab
    bag.add(S, planarWall({ o: [xa, (zb(0) + zb(NB)) / 2], u: [0, 1], th: 1.0, u0: -BAY * NB / 2, u1: BAY * NB / 2, y0: y, y1: G0, arcade: true, arches: Array.from({ length: NB }, (_, j) => ({ uc: win(j) - (zb(0) + zb(NB)) / 2, r: 1.5, spring: y + 5.2, sill: y })) }));
    for (let j = 0; j <= NB; j++) { if (j === 0) continue; col.rect([xa - 0.5, zb(j) - 0.28, xa + 0.5, zb(j) + 0.28], y, G0); }
  }
  // the apse's piers, and the gallery's slab all round: along the aisles, across the south, round the apse
  for (let k = 1; k < FAC; k++) { const [px, pz] = pt(C, Math.PI * k / FAC, GAL); bag.add(S, lathe([[0.55, 0], [0.5, 0.3], [0.5, G0 - y - 0.3], [0.6, G0 - y]], 10, null, px, y, pz)); col.circle(px, pz, 0.55, y, G0); }
  sector(bag, PW, C, GAL, HW, G0, G - 0.03, 0, Math.PI, 18); sector(bag, 'marble_floor', C, GAL, HW, G - 0.03, G, 0, Math.PI, 18);
  const slab = (r) => { bag.add(PW, box(r[0], G0, r[1], r[2], G - 0.03, r[3])); bag.add('marble_floor', box(r[0], G - 0.03, r[1], r[2], G, r[3])); col.floor(r, G); };
  slab([xw - 0.0 - (xw - (x0 + T)), zc, xw, zi]);                                // the west aisle's gallery (the whole length)
  slab([xe, zc, x1 - T, zb(6.8)]);                                                // the east aisle's, from the stair's head north
  slab([xw, zb(2.4), xe, zi]);                                                    // the royal tribune across the south end
  // the apse's half-circle meets the aisles at zc; the straight slabs end there
  // the stair up in the east aisle, from the south: forty treads along the wall, a balustrade on the open side
  { const xs0 = xe + 0.5, xs1 = x1 - T - 0.0, za = zb(0.4), zz = zb(6.8), n = 46, rs = (G - y) / n, tr = (za - zz) / n;
    for (let k = 0; k < n; k++) bag.add(MS, box(xs0, y, za - (k + 1) * tr, xs1, y + rs * (k + 1), za - k * tr));
    col.ramp([xs0, zz, xs1, za], y, G, 'n');
    for (let k = 0; k <= n; k += 3) bag.add(MS, lathe([[0.06, 0], [0.04, 0.3], [0.07, 0.6], [0.001, 0.9]], 6, null, xs0 - 0.04, y + rs * k, za - k * tr));
    bag.add(MS, box(xs0 - 0.09, y + 0.9 + 0.01, zz, xs0 + 0.01, y + 1.0, za)); }
  // the colonnade: free-standing Corinthian columns on the gallery, an entablature over them, a balustrade between
  const colH = 7.2;
  const colPos = [];
  for (const sg of [-1, 1]) for (let j = 1; j <= NB; j++) colPos.push([cx + sg * GAL, zb(j), sg, j]);
  for (let k = 1; k < FAC; k++) colPos.push([...pt(C, Math.PI * k / FAC, GAL), 0, 100 + k]);
  for (const [px, pz] of colPos) column(bag, col, px, pz, G, colH);
  // entablature along the aisles and round the apse
  for (const sg of [-1, 1]) {
    const xa = cx + sg * GAL;
    bag.add(PW, box(xa - 0.55, G + colH, zb(NB), xa + 0.55, G + colH + 0.5, zb(0)));
    bag.add(PW, box(xa - 0.5, G + colH + 0.5, zb(NB), xa + 0.5, G + colH + 0.95, zb(0))); bag.add(GB, box(xa - 0.56, G + colH + 0.95, zb(NB), xa + 0.56, G + colH + 1.0, zb(0)));
    bag.add(MS, box(xa - 0.7, G + colH + 1.0, zb(NB), xa + 0.7, G + colH + 1.25, zb(0)));
    // the balustrade of the gallery between the columns (not across the stair's well)
    for (let j = 0; j < NB; j++) {
      const a = zb(j + 1) + 0.5, b = zb(j) - 0.5;
      if (sg > 0 && zb(j) > zb(6.8)) continue;
      bag.add(MS, box(xa - 0.1, G + 0.95, a, xa + 0.1, G + 1.05, b)); bag.add(MS, box(xa - 0.12, G, a, xa + 0.12, G + 0.14, b));
      for (let z = a + 0.1; z < b; z += 0.3) bag.add(MS, lathe([[0.05, 0], [0.07, 0.18], [0.04, 0.45], [0.07, 0.7], [0.001, 0.8]], 6, null, xa, G + 0.14, z));
      col.segment([xa, a], [xa, b], 0.2, G, G + 1.05);
    }
  }
  sector(bag, PW, C, GAL - 0.55, GAL + 0.55, G + colH, G + colH + 0.5, 0, Math.PI, 18); sector(bag, PW, C, GAL - 0.5, GAL + 0.5, G + colH + 0.5, G + colH + 0.95, 0, Math.PI, 18); sector(bag, GB, C, GAL - 0.56, GAL + 0.56, G + colH + 0.95, G + colH + 1.0, 0, Math.PI, 18); sector(bag, MS, C, GAL - 0.7, GAL + 0.7, G + colH + 1.0, G + colH + 1.25, 0, Math.PI, 18);
  for (let k = 0; k < FAC * 2; k++) { const a0 = Math.PI * k / (FAC * 2), a1 = Math.PI * (k + 1) / (FAC * 2); if (k % 2 === 0) continue; sector(bag, MS, C, GAL - 0.1, GAL + 0.1, G + 0.14, G + 1.05, a0 + 0.04, a1 - 0.04, 2); }
  // the royal tribune's front: a gilt-topped rail across the south end, the royal pew with its cushions
  bag.add(MS, box(xw, G + 0.95, zb(2.4) - 0.1, xe, G + 1.05, zb(2.4) + 0.1)); bag.add(GB, box(xw, G + 1.05, zb(2.4) - 0.12, xe, G + 1.1, zb(2.4) + 0.12)); col.segment([xw, zb(2.4)], [xe, zb(2.4)], 0.2, G, G + 1.1);
  for (let x = xw + 0.2; x < xe; x += 0.3) bag.add(MS, lathe([[0.05, 0], [0.07, 0.18], [0.04, 0.45], [0.07, 0.7], [0.001, 0.8]], 6, null, x, G + 0.14, zb(2.4)));
  bag.add('cloth_red', box(cx - 1.6, G + 1.05, zb(2.4) + 0.12, cx + 1.6, G + 1.14, zb(2.4) + 0.62)); bag.add(GB, box(cx - 1.6, G + 0.5, zb(2.4) + 0.12, cx + 1.6, G + 1.05, zb(2.4) + 0.62));
  for (const s of [-1, 1]) bag.add('cloth_red', box(cx + s * 1.0 - 0.45, G, zb(1.3) - 0.5, cx + s * 1.0 + 0.45, G + 0.5, zb(1.3) + 0.5));

  // ── the wall order inside: Corinthian pilasters between the upper windows, the entablature, the cornice at the vault's springing
  for (const sg of [-1, 1]) {
    const F = frame(bag, [cx + sg * HW, sg > 0 ? zc : zi], [-sg, 0]);          // u runs along the wall (from the north on the east, from the south on the west); d into the nave
    const Lw = zi - zc;
    for (let j = 0; j <= NB; j++) { const u = BAY * j; if (u < 0.3 || u > Lw - 0.1) continue; F.box(PW, u - 0.4, u + 0.4, G, G + 8.6, 0.06, 0.3); frenchCapital(F, u, G + 8.6, 0.3, 0.8, 0.8); }
    F.box(PW, 0, Lw, y + 8.0, y + 8.12, 0.06, 0.12);                           // the string at the gallery's floor
    F.box(PW, 0, Lw, G + 9.4, G + 9.9, 0.06, 0.38); F.box(GB, 0, Lw, G + 9.9, G + 9.96, 0.06, 0.4); F.box(PW, 0, Lw, G + 9.96, G + 10.3, 0.06, 0.55);
    for (let j = 0; j < NB; j++) {                                              // the windows' mouldings and glazing bars
      const uc = BAY * (j + 0.5);
      F.ring(WM, uc, y + 17.2, 1.5, 1.72, 0.06, 0.16, 0, Math.PI, 14); F.box(WM, uc - 1.72, uc - 1.5, y + 10.4, y + 17.2, 0.06, 0.16); F.box(WM, uc + 1.5, uc + 1.72, y + 10.4, y + 17.2, 0.06, 0.16);
      F.box(PW, uc - 0.03, uc + 0.03, y + 10.4, y + 18.7, -0.02, 0.0); for (const v of [11.7, 13.0, 14.3, 15.6, 16.9]) F.box(PW, uc - 1.5, uc + 1.5, y + v, y + v + 0.05, -0.02, 0.0);
      F.ring(WM, uc, y + 5.3, 1.1, 1.26, 0.06, 0.14, 0, Math.PI, 12); F.box(WM, uc - 1.26, uc - 1.1, y + 1.1, y + 5.3, 0.06, 0.14); F.box(WM, uc + 1.1, uc + 1.26, y + 1.1, y + 5.3, 0.06, 0.14);
      F.box(PW, uc - 0.03, uc + 0.03, y + 1.1, y + 6.4, -0.02, 0.0);
      // a gilt trophy over each lower window and a framed picture between the tall windows, at the level of the entablature's frieze
      F.box(GB, uc - 0.5, uc + 0.5, y + 7.0, y + 7.1, 0.06, 0.1);
    }
  }
  // the apse's inner order: a pilaster at each facet's corner under the half-dome, the altarpiece's space left open
  for (let k = 0; k <= FAC; k++) { const a = Math.PI * k / FAC; if (k === 0 || k === FAC) continue; const p = pt(C, a, HW - 0.15), F = frame(bag, p, [-Math.cos(a), Math.sin(a)]); F.box(PW, -0.4, 0.4, G, G + 8.6, 0, 0.3); frenchCapital(F, 0, G + 8.6, 0.3, 0.8, 0.8); }
  // the end wall's entablature on the south, with the great window's moulding
  { const F = frame(bag, [x0 + T, zi], [0, -1]); void F; }
  { const F = frame(bag, [cx + HW, zi], [0, -1]);                              // u runs west across the south wall
    const uc = HW; F.ring(WM, uc, y + 16.6, 2.0, 2.24, 0.06, 0.18, 0, Math.PI, 16); F.box(WM, uc - 2.24, uc - 2.0, y + 10.6, y + 16.6, 0.06, 0.18); F.box(WM, uc + 2.0, uc + 2.24, y + 10.6, y + 16.6, 0.06, 0.18);
    F.ring(GB, uc, y + 3.9, 1.35, 1.5, 0.06, 0.16, 0, Math.PI, 12);
    F.box(PW, 0, 2 * HW, G + 9.4, G + 9.9, 0.06, 0.38); F.box(GB, 0, 2 * HW, G + 9.9, G + 9.96, 0.06, 0.4); F.box(PW, 0, 2 * HW, G + 9.96, G + 10.3, 0.06, 0.55);
    for (let v = 11.9; v < 16.4; v += 1.1) F.box(PW, uc - 2.0, uc + 2.0, y + v, y + v + 0.05, -0.02, 0.0); F.box(PW, uc - 0.03, uc + 0.03, y + 10.6, y + 18.6, -0.02, 0.0); }

  // ── the vault: one segmental barrel over the whole nave and the half-dome over the apse, Coypel's God the Father in
  // Glory down the nave in a gilt frame, La Fosse's Resurrection in the half-dome, Jouvenet's Pentecost over the royal tribune
  const rise = CR - SP, RV = (HW * HW + rise * rise) / (2 * rise), yc = CR - RV, tm = Math.asin(HW / RV), SEG = 26, TH = 0.45;
  const vy = (x) => yc + Math.sqrt(RV * RV - (x - cx) ** 2);
  { const out = [];
    for (let i = 0; i < SEG; i++) {
      const a = -tm + 2 * tm * i / SEG, b = -tm + 2 * tm * (i + 1) / SEG, Q = (th, rr, z) => [cx + rr * Math.sin(th), yc + rr * Math.cos(th), z];
      hexa(out, [Q(a, RV, zi), Q(b, RV, zi), Q(b, RV, zc), Q(a, RV, zc)], [Q(a, RV + TH, zi), Q(b, RV + TH, zi), Q(b, RV + TH, zc), Q(a, RV + TH, zc)]);
    }
    bag.add(PW, fromTriangles(out));
    // the half-dome: a quarter sphere of the same radius about the apse's axis
    const dome = [], NR = 8;
    for (let k = 0; k < 20; k++) for (let r = 0; r < NR; r++) {
      const a0 = Math.PI * k / 20, a1 = Math.PI * (k + 1) / 20, t0 = tm * r / NR, t1 = tm * (r + 1) / NR;
      const Q = (a, t, rr) => { const p = pt(C, a, rr * Math.sin(t)); return [p[0], yc + rr * Math.cos(t), p[1]]; };
      hexa(dome, [Q(a0, t0, RV), Q(a1, t0, RV), Q(a1, t1, RV), Q(a0, t1, RV)], [Q(a0, t0, RV + TH), Q(a1, t0, RV + TH), Q(a1, t1, RV + TH), Q(a0, t1, RV + TH)]);
    }
    bag.add(PW, fromTriangles(dome)); }
  const vmap = (s, t, off) => { const th = s / RV; return [cx + (RV - off) * Math.sin(th), yc + (RV - off) * Math.cos(th), t]; };
  const mapDome = (s, t, off) => { const rr = RV - off, h = Math.min(Math.hypot(s, t), rr * 0.9998); const k = h === 0 ? 0 : 1; void k; return [cx + s, yc + Math.sqrt(Math.max(0, rr * rr - h * h)), zc - t]; };
  painting(bag, vmap, { s: 0, t: (zi + zc) / 2 + 3, ws: 10.5, wt: 17.5, kind: 'sky', seed: 1708, frame: 0.2 });
  painting(bag, vmap, { s: 0, t: zi - 3.2, ws: 8, wt: 4.6, oval: true, kind: 'sky', seed: 1709, frame: 0.16 });
  for (const sg of [-1, 1]) for (let j = 0; j < NB; j++) painting(bag, vmap, { s: sg * 8.0, t: win(j), ws: 2.0, wt: 2.6, oval: true, kind: 'gold', seed: 1700 + j * 2 + sg, frame: 0.1 });
  painting(bag, mapDome, { s: 0, t: 4.4, ws: 12, wt: 9, oval: true, kind: 'sky', seed: 1710, frame: 0.18 });
  // gilt ribs across the barrel, and the half-dome's ribs
  { const smax = tm * RV, tris = [];
    const gi = (s0, s1, z0, z1) => { const ns = Math.ceil((s1 - s0) / 0.4); for (let i = 0; i < ns; i++) { const a = s0 + (s1 - s0) * i / ns, b = s0 + (s1 - s0) * (i + 1) / ns; tris.push(...vmap(a, z0, 0.02), ...vmap(b, z1, 0.02), ...vmap(b, z0, 0.02), ...vmap(a, z0, 0.02), ...vmap(a, z1, 0.02), ...vmap(b, z1, 0.02)); } };
    for (let j = 0; j <= NB; j++) gi(-smax, smax, zb(j) - 0.13, zb(j) + 0.13);
    for (const s of [-5.6, 5.6, -smax + 0.3, smax - 0.3]) gi(s - 0.1, s + 0.1, zc, zi);
    bag.add(GD, fromTriangles(tris));
    const rib = []; for (let k = 1; k < FAC; k++) { const a = Math.PI * k / FAC; for (let r = 0; r < 10; r++) { const t0 = tm * r / 10, t1 = tm * (r + 1) / 10, w = 0.1, Q = (aa, tt) => { const p = pt(C, aa, (RV - 0.02) * Math.sin(tt)); return [p[0], yc + (RV - 0.02) * Math.cos(tt), p[1]]; }; const A0 = Q(a - w / 8, t0), A1 = Q(a + w / 8, t0), B0 = Q(a - w / 8, t1), B1 = Q(a + w / 8, t1); rib.push(...A0, ...A1, ...B1, ...A0, ...B1, ...B0); } }
    bag.add(GD, fromTriangles(rib)); }
  // the cornice at the vault's springing round the nave and the apse
  for (const sg of [-1, 1]) { const xa = cx + sg * (HW - 0.2); bag.add(GB, box(Math.min(xa, xa + sg * -0.4) , SP - 0.12, zc, Math.max(xa, xa - sg * 0.4), SP - 0.06, zi)); }

  // ── the organ above the altar: Clicquot's case with its flats of pipes and David on the crown; the benches of the nave
  { const oz = zc - HW + 1.0, oy = G + 1.2;
    bag.add(WD, box(cx - 4.2, G, oz - 0.2, cx + 4.2, oy + 0.4, oz + 1.8));
    for (let k = 0; k < 5; k++) { const ux = cx - 3.3 + k * 1.65, big = k % 2 === 0, hgt = big ? 8.2 : 6.2, np = big ? 7 : 5;
      for (let q = 0; q < np; q++) { const px = ux + (q - (np - 1) / 2) * 0.22, hh = hgt * (1 - Math.abs(q - (np - 1) / 2) * 0.07); bag.add(AG, lathe([[0.001, 0], [0.09, 0.02], [0.09, hh], [0.001, hh + 0.08]], 8, null, px, oy + 0.4, oz + 0.45)); }
      bag.add(WD, box(ux - np * 0.11 - 0.05, oy + 0.4, oz + 0.3, ux + np * 0.11 + 0.05, oy + 0.55, oz + 0.62)); bag.add(GB, box(ux - np * 0.11 - 0.05, oy + hgt * 0.62, oz + 0.32, ux + np * 0.11 + 0.05, oy + hgt * 0.62 + 0.05, oz + 0.6));
      bag.add(GB, lathe([[0.2, 0], [0.12, 0.2], [0.001, 0.5]], 6, null, ux, oy + 0.4 + hgt, oz + 0.45)); }
    bag.add(GB, box(cx - 0.6, oy + 8.8, oz + 0.3, cx + 0.6, oy + 9.5, oz + 0.7)); bag.add(GB, lathe([[0.18, 0], [0.12, 0.5], [0.001, 0.9]], 6, null, cx, oy + 9.5, oz + 0.5));
    col.rect([cx - 4.2, oz - 0.2, cx + 4.2, oz + 1.8], G, G + 2); }
  for (let r = 0; r < 7; r++) for (const sx of [-1, 1]) {
    const bz = zb(1.8) - r * 2.1 - 1.2, a = sx < 0 ? cx - 3.8 : cx + 0.6, b = sx < 0 ? cx - 0.6 : cx + 3.8;
    bag.add(WD, box(a, y + 0.42, bz, b, y + 0.48, bz + 0.45)); bag.add(WD, box(a, y + 0.9, bz + 0.4, b, y + 0.96, bz + 0.46)); for (const e of [a + 0.05, b - 0.05]) bag.add(WD, box(e - 0.04, y, bz, e + 0.04, y + 0.96, bz + 0.46)); col.rect([a, bz, b, bz + 0.46], y, y + 0.96);
  }
  for (let j = 1; j < NB; j += 2) for (const dx of [0]) chandelier(bag, lights, cx + dx, y + 18.2, zb(j) - BAY / 2, vy(cx) - 0.02, { arms: 12, R: 0.8, s: 1.05 });

  // ── the outside: the plinth, the string at the first floor, Corinthian pilasters on the upper storey, window mouldings, the cornice with its modillions, the balustrade with its statues
  const faces = [[[x1, zs], [1, 0], zs - zc, (j) => (zs - zi) + BAY * j], [[x0, zc], [-1, 0], zs - zc, (j) => zi - zc - BAY * j]];
  for (const [o, n, len, upos] of faces) {
    const F = frame(bag, o, n), Lf = len;
    F.box(S, 0, Lf, SL, y + 0.9, 0, 0.3); F.box(S, 0, Lf, y + 8.1, y + 8.55, 0, 0.12); F.box(S, 0, Lf, y + 8.55, y + 8.65, 0, 0.18);
    F.box(S, 0, Lf, CH - 1.3 + y, CH - 0.85 + y, 0, 0.3); F.box(S, 0, Lf, y + CH - 0.85, y + CH - 0.4, 0, 0.55); F.box(S, 0, Lf, y + CH - 0.4, y + CH, 0, 0.9);
    for (let u = 0.3; u < Lf; u += 0.55) F.box(S, u - 0.07, u + 0.07, y + CH - 0.85, y + CH - 0.4, 0.1, 0.5);
    // balustrade: a rail, balusters, piers with statues over the pilasters
    F.box(S, 0, Lf, y + CH, y + CH + 0.25, 0.05, 0.85); F.box(S, 0, Lf, y + CH + 1.25, y + CH + 1.45, 0.05, 0.85);
    for (let u = 0.2; u < Lf; u += 0.4) F.lathe(S, [[0.1, 0], [0.13, 0.25], [0.08, 0.6], [0.14, 0.9], [0.001, 1.0]], u, 0.45, y + CH + 0.25, 6);
    for (let j = 0; j <= NB; j++) {
      const u = upos(j);
      if (u > Lf - 0.2) continue;
      F.box(S, u - 0.5, u + 0.5, y + 8.65, y + CH - 1.3, 0.0, 0.34);                         // the pilaster's shaft
      F.box(S, u - 0.56, u + 0.56, y + 8.65, y + 8.95, 0.0, 0.38); F.box(S, u - 0.6, u + 0.6, y + CH - 2.2, y + CH - 1.3, 0.0, 0.4);
      F.box(GB, u - 0.46, u + 0.46, y + CH - 2.0, y + CH - 1.9, 0.34, 0.4);
      F.box(S, u - 0.4, u + 0.4, y + CH + 0.25, y + CH + 1.25, 0.18, 0.72);
      F.lathe(S, [[0.001, 0], [0.12, 0.03]], u, 0.45, y + CH + 1.25, 4);
      // (statues placed below by position)
    }
    for (let j = 0; j < NB; j++) {
      const uc = (upos(j) + upos(j + 1)) / 2;
      F.ring(S, uc, y + 17.2, 1.5, 1.8, 0.0, 0.14, 0, Math.PI, 14); F.box(S, uc - 1.8, uc - 1.5, y + 10.4, y + 17.2, 0.0, 0.14); F.box(S, uc + 1.5, uc + 1.8, y + 10.4, y + 17.2, 0.0, 0.14);
      F.box(S, uc - 1.8, uc + 1.8, y + 10.1, y + 10.4, 0.0, 0.3);
      F.ring(S, uc, y + 5.3, 1.1, 1.3, 0.0, 0.1, 0, Math.PI, 12);
      F.box('glass_outer', uc - 1.5, uc + 1.5, y + 10.4, y + 17.2, -0.5, -0.46);                // the glazing seen from outside: dark glass set back
      F.box(S, uc - 1.3, uc + 1.3, y + 0.9, y + 1.1, 0, 0.14);
    }
  }
  // statues on the balustrade's piers: east, west, the apse
  let k = 0;
  for (const sg of [-1, 1]) for (let j = 1; j <= NB; j += 1) { if (j % 2) continue; statue(bag, cx + sg * (W / 2 - 0.4), y + CH + 0.25, zb(j) + 0.0, 0.9, k++); }
  for (let f = 0; f <= FAC; f++) { const a = Math.PI * f / FAC, p = pt(C, a, RS - 0.5); if (f === 0 || f === FAC) continue; statue(bag, p[0], y + CH + 0.25, p[1], 0.9, k++); }
  // the apse's outer cornice and balustrade, the apse's plinth
  sector(bag, S, C, 0.001, RS + 0.01, y + CH - 0.4, y + CH, 0, Math.PI, 24);
  sector(bag, S, C, RS - 0.1, RS + 0.5, y + CH - 0.4, y + CH, 0, Math.PI, 24);
  sector(bag, S, C, RS - 0.8, RS + 0.1, y + CH, y + CH + 0.25, 0, Math.PI, 24); sector(bag, S, C, RS - 0.8, RS + 0.1, y + CH + 1.25, y + CH + 1.4, 0, Math.PI, 24);
  sector(bag, S, C, RS - 0.5, RS - 0.1, y + CH + 0.25, y + CH + 1.25, 0.04, Math.PI - 0.04, 24);
  sector(bag, S, C, RS - 0.05, RS + 0.35, SL, y + 0.9, 0, Math.PI, 24); sector(bag, S, C, RS - 0.05, RS + 0.2, y + 8.1, y + 8.65, 0, Math.PI, 24);
  // the south front: the pilasters, the pediment with its group, the portal
  { const F = frame(bag, [x0, zs], [0, 1]);                                      // u runs east across the face
    F.box(S, 0, W, SL, y + 0.9, 0, 0.3); F.box(S, 0, W, y + 8.1, y + 8.55, 0, 0.12); F.box(S, 0, W, y + 8.55, y + 8.65, 0, 0.18);
    F.box(S, 0, W, y + CH - 1.3, y + CH - 0.85, 0, 0.3); F.box(S, 0, W, y + CH - 0.85, y + CH - 0.4, 0, 0.55); F.box(S, 0, W, y + CH - 0.4, y + CH, 0, 0.9);
    for (const u of [0.6, 4.4, 8.0, 16.0, 19.6, 23.4]) { F.box(S, u - 0.5, u + 0.5, y + 8.65, y + CH - 1.3, 0, 0.34); F.box(S, u - 0.56, u + 0.56, y + 8.65, y + 8.95, 0, 0.38); F.box(S, u - 0.6, u + 0.6, y + CH - 2.2, y + CH - 1.3, 0, 0.4); }
    for (const u of [5.4, 18.6]) { F.ring(S, u, y + 17.2, 1.5, 1.8, 0, 0.14, 0, Math.PI, 14); F.box(S, u - 1.8, u - 1.5, y + 10.4, y + 17.2, 0, 0.14); F.box(S, u + 1.5, u + 1.8, y + 10.4, y + 17.2, 0, 0.14); F.ring(S, u, y + 5.3, 1.1, 1.3, 0, 0.1, 0, Math.PI, 12); F.box('glass_outer', u - 1.5, u + 1.5, y + 10.4, y + 17.2, -0.5, -0.46); }
    F.ring(S, 12, y + 16.6, 2.0, 2.4, 0, 0.16, 0, Math.PI, 16); F.box(S, 12 - 2.4, 12 - 2.0, y + 10.6, y + 16.6, 0, 0.16); F.box(S, 12 + 2.0, 12 + 2.4, y + 10.6, y + 16.6, 0, 0.16); F.box('glass_outer', 12 - 2.0, 12 + 2.0, y + 10.6, y + 16.6, -0.5, -0.46);
    // the portal: two columns, an entablature, a segmental pediment, the door's arch
    F.ring(S, 12, y + 3.9, 1.35, 1.7, 0, 0.16, 0, Math.PI, 12); F.box(S, 12 - 1.7, 12 - 1.35, y, y + 3.9, 0, 0.16); F.box(S, 12 + 1.35, 12 + 1.7, y, y + 3.9, 0, 0.16);
    F.box(S, 12 - 2.8, 12 + 2.8, y + 5.9, y + 6.3, 0, 0.8); F.box(S, 12 - 3.0, 12 + 3.0, y + 6.3, y + 6.55, 0, 0.9);
    for (const s of [-1, 1]) { const [px, pz] = F.P(12 + s * 2.3, 0.55); void pz; column(bag, col, px, pz, y + 0.1, 5.8, 0.32); }
    // the great pediment over the front: the royal arms in a gilt cartouche between two figures
    const pts = [[W / 2 - 8.0, 0], [W / 2 + 8.0, 0], [W / 2, 3.4]];
    bag.add(S, fromTriangles(orientOutward((() => { const t = [], P = (u, v, d) => { const [a, b] = F.P(u, d); return [a, y + CH + v, b]; }; const f = pts.map(([u, v]) => P(u, v, 0.9)), bk = pts.map(([u, v]) => P(u, v, 0.1)); t.push(...f[0], ...f[1], ...f[2], ...bk[0], ...bk[2], ...bk[1]); for (let i = 0; i < 3; i++) { const j = (i + 1) % 3; t.push(...f[i], ...bk[i], ...bk[j], ...f[i], ...bk[j], ...f[j]); } return t; })())));
    { const [px, pz] = F.P(12, 1.0); bag.add(GB, lathe([[0.7, 0], [0.7, 0.1], [0.5, 0.9], [0.001, 1.2]], 10, null, px, y + CH + 0.5, pz)); }
    for (const u of [4.4, 19.6]) { const [px, pz] = F.P(u, 0.5); statue(bag, px, y + CH + 0.25, pz, 1.0, 40 + Math.floor(u)); }
    { const [px, pz] = F.P(12, 0.5); statue(bag, px, y + CH + 3.2, pz, 1.1, 51); } }
  // ── the roof: lead, steep, over the nave (hipped on the south) and a half cone over the apse, the ridge and ribs gilt
  const ro = [x0 - 0.35, zc, x1 + 0.35, zs + 0.35];
  hipped(bag, LD, ro, EAVE - 0.4, TOP, zc, zs + 0.35 - (W / 2 + 0.35));
  bag.add(LD, lathe([[RS + 0.35, 0], [0.001, TOP - EAVE + 0.4]], 28, null, C[0], EAVE - 0.4, C[1]));
  // the gilt ridge roll and the ribs down the hips; the finial at the apse's top
  { const zr = zs + 0.35 - (W / 2 + 0.35); bag.add(GB, box(cx - 0.12, TOP - 0.1, zc, cx + 0.12, TOP + 0.2, zr));
    for (let z = zc + 0.4; z < zr; z += 1.4) bag.add(GB, lathe([[0.1, 0], [0.07, 0.2], [0.16, 0.5], [0.001, 0.8]], 6, null, cx, TOP + 0.2, z)); }
  bag.add(GB, lathe([[0.3, 0], [0.18, 0.5], [0.4, 1.4], [0.22, 2.0], [0.05, 2.6], [0.04, 4.4], [0.001, 4.5]], 10, null, C[0], TOP - 0.1, C[1]));
  for (let q = 0; q <= 6; q++) { const a = Math.PI * q / 6, p0 = pt(C, a, RS + 0.3), p1 = pt(C, a, 0.3); const dx = p1[0] - p0[0], dz = p1[1] - p0[1], dy = TOP - EAVE + 0.4, len = Math.hypot(dx, dy, dz); const g = lathe([[0.1, 0], [0.1, len]], 4, null, 0, 0, 0); g.rotateX(Math.acos(dy / len)); g.rotateY(Math.atan2(dx, dz)); g.translate(p0[0], EAVE - 0.4, p0[1]); bag.add(GB, g); }
  col.rect([x0, zc - 0.0, x1, zs], y + CH, TOP);
  col.floor([x0 + T, zc - HW, x1 - T, zi], y);
}
