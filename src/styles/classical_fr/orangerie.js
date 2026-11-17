// The Orangerie of Versailles (docs/settlements/versailles.md §1i): Hardouin-Mansart's gallery of 1684–86 under the terrace south of the
// south parterre, with the sunken parterre before it and the two flights of the Cent Marches climbing from that court to the terrace.
//
// orangerie: { rect: [x0, z0, x1, z1] (the court with the gallery's footprint at its north end), gallery: [x0, z0, x1, z1] (its depth), floor (the court's
//   level), top (the terrace's level), walls: [x0, z0, x1, z1] (outer rect of the retaining walls) }
// The gallery stands on the court's level and its roof is the terrace (a gravel walk with a balustrade at its edge over the court); the court has
// four lawns with box borders round a round basin, gravel walks, the orange trees set out in their boxes against the walls (the summer), the flights
// at the gallery's two ends rising to the terrace, retaining walls with buttresses, a coping and a balustrade all round. Local to the world: metres.

import { box, lathe, rod, fromTriangles, orientOutward } from '../../core/geom.js';
import { planarWall } from '../byzantine/index.js';
import { orangeTrees } from './garden.js';
import { STYLES } from '../../core/build.js';

const S = 'sandstone_dressed', L = 'limestone';

/** A convex prism: the polygon (z, y) extruded along x from x0 to x1. */
export function prism(bag, mat, poly, x0, x1) {
  const t = [], n = poly.length, V = (x, i) => [x, poly[i][1], poly[i][0]];
  for (let i = 0; i < n; i++) { const j = (i + 1) % n, a = V(x0, i), b = V(x1, i), c = V(x1, j), d = V(x0, j); t.push(...a, ...b, ...c, ...a, ...c, ...d); }
  for (let i = 1; i < n - 1; i++) { t.push(...V(x0, 0), ...V(x0, i), ...V(x0, i + 1)); t.push(...V(x1, 0), ...V(x1, i + 1), ...V(x1, i)); }
  bag.add(mat, fromTriangles(orientOutward(t)));
}
/** A baluster railing along a straight run: a plinth, turned balusters, a top rail, a pier with a vase every `pier` metres. */
function balustrade(bag, col, [ax, az], [bx, bz], y, side = 0.0) {
  const len = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / len, uz = (bz - az) / len, px = -uz * side, pz = ux * side;
  const P = (u) => [ax + ux * u + px, az + uz * u + pz];
  const along = Math.abs(ux) > 0.5, R = (u0, u1, w, ya, yb) => { const p = P(u0), q = P(u1); bag.add(S, box(Math.min(p[0], q[0]) - (along ? 0 : w), ya, Math.min(p[1], q[1]) - (along ? w : 0), Math.max(p[0], q[0]) + (along ? 0 : w), yb, Math.max(p[1], q[1]) + (along ? w : 0))); };
  R(0, len, 0.22, y, y + 0.2); R(0, len, 0.2, y + 0.82, y + 0.95);                                // the plinth, the rail
  const npier = Math.max(1, Math.round(len / 7.43)), pitch = len / npier;
  for (let i = 0; i <= npier; i++) {
    const u = i * pitch, p = P(u);
    bag.add(S, box(p[0] - 0.26, y, p[1] - 0.26, p[0] + 0.26, y + 1.0, p[1] + 0.26)); bag.add(S, box(p[0] - 0.32, y + 1.0, p[1] - 0.32, p[0] + 0.32, y + 1.08, p[1] + 0.32));
    bag.add(S, lathe([[0.3, 0], [0.2, 0.1], [0.16, 0.22], [0.4, 0.55], [0.38, 0.8], [0.22, 0.9], [0.3, 0.98], [0.001, 1.0]], 10, null, p[0], y + 1.08, p[1]));     // a vase (pot-à-feu) on each pier
  }
  for (let u = 0.55; u < len - 0.3; u += 0.5) {
    if (Math.abs(((u + pitch / 2) % pitch) - pitch / 2) < 0.3) continue;
    const p = P(u); bag.add(S, lathe([[0.1, 0], [0.07, 0.1], [0.05, 0.2], [0.1, 0.5], [0.06, 0.62], [0.09, 0.7], [0.001, 0.72]], 6, null, p[0], y + 0.2, p[1]));
  }
  col.segment(P(0), P(len), 0.4, y, y + 1.1);
}

export function orangerie(el, ctx) {
  const { bag, col } = ctx, [lx0, lz0, lx1, lz1] = el.rect, [gx0, gz0, gx1, gz1] = el.gallery, [wx0, wz0, wx1, wz1] = el.walls, FL = el.floor, TOP = el.top, F = FL + 0.04;
  const CX = (lx0 + lx1) / 2;
  const T0 = gz0 + 2.5, T1 = gz1 - 2.0;                             // the gallery's back wall, the front wall's inner face
  const BODY = TOP - 0.54;                                          // the walls' top (under the roof slab)
  // ── the retaining walls: west, east and south, a solid stone mass with a buttress on its court face at every bay, a coping, a balustrade ─────
  const wall = (r, face) => {
    bag.add(S, box(r[0], FL - 0.5, r[1], r[2], TOP - 0.1, r[3])); bag.add(L, box(r[0] - 0.05, TOP - 0.1, r[1] - 0.05, r[2] + 0.05, TOP, r[3] + 0.05));
    col.rect(r, FL - 0.5, TOP); col.floor(r, TOP);
    void face;
  };
  wall([wx0, wz0, lx0, wz1], 'e'); wall([lx1, wz0, wx1, wz1], 'w'); wall([lx0, lz1, lx1, wz1], 'n');
  // the court faces: a plinth course and a string at the springing level; buttresses every 7.43 m, a niche between them on the south wall
  const BAY = 7.43;
  for (const [x, dir] of [[lx0, 1], [lx1, -1]]) {
    bag.add(L, box(Math.min(x - dir * 0.05, x + dir * 0.18), FL + 0.4, gz1 + 0.0, Math.max(x - dir * 0.05, x + dir * 0.18), FL + 0.6, lz1 - 0.05));
  }
  bag.add(L, box(lx0, FL + 0.4, lz1 - 0.18, lx1, FL + 0.6, lz1 + 0.05));
  for (let x = lx0 + 3.7; x < lx1 - 6; x += BAY) {
    bag.add(S, box(x - 0.5, FL + 0.5, lz1 - 0.4, x + 0.5, TOP - 0.5, lz1)); bag.add(L, box(x - 0.6, TOP - 0.5, lz1 - 0.5, x + 0.6, TOP - 0.3, lz1)); col.rect([x - 0.5, lz1 - 0.4, x + 0.5, lz1], FL, TOP - 0.5);
    const xm = x + BAY / 2; if (xm > lx1 - 3) continue;
    // a round-headed niche between the buttresses, with a stone bench in it (the gardeners' seat)
    bag.add('plaster_white', planarWall({ o: [xm, lz1 - 0.02], u: [1, 0], th: 0.06, u0: -1.2, u1: 1.2, y0: FL + 0.6, y1: FL + 4.1, outline: { uc: 0, r: 1.2, spring: FL + 2.9 } }));
    bag.add(S, box(xm - 1.2, F, lz1 - 0.7, xm + 1.2, FL + 0.9, lz1 - 0.3)); bag.add(S, box(xm - 1.28, FL + 0.9, lz1 - 0.74, xm + 1.28, FL + 1.0, lz1 - 0.02));
    col.rect([xm - 1.28, lz1 - 0.74, xm + 1.28, lz1], FL, FL + 3);
  }
  // the balustrades along the tops, on the court side
  balustrade(bag, col, [lx0 - 3.7, lz1 + 0.3], [lx1 + 3.7, lz1 + 0.3], TOP, 0);
  balustrade(bag, col, [lx0 - 0.3, lz1 + 0.3], [lx0 - 0.3, gz1 + 0.0], TOP, 0);
  balustrade(bag, col, [lx1 + 0.3, lz1 + 0.3], [lx1 + 0.3, gz1 + 0.0], TOP, 0);

  // ── the court: gravel, the lawns with their box borders, the basin, the walks ──────────────────────────────────────────────────────────
  const cr = [lx0, gz1, lx1, lz1];
  const zst = gz1 + 50 * 0.34;                                       // the flights' feet
  bag.add('pebbles', box(cr[0], FL - 0.3, cr[1], cr[2], F, cr[3]));
  col.floor([lx0 + 4, gz1, lx1 - 4, lz1], F); col.floor([lx0, zst, lx0 + 4, lz1], F); col.floor([lx1 - 4, zst, lx1, lz1], F);
  const bw = 19, bd = 16, gapx = 3, cxs = [[CX - gapx - bw, CX - gapx], [CX + gapx, CX + gapx + bw]], zs = [[gz1 + 8, gz1 + 8 + bd], [lz1 - 6 - bd, lz1 - 6]];
  for (const [xa, xb] of cxs) for (const [za, zb] of zs) {
    bag.add('terrain', box(xa, FL - 0.1, za, xb, F + 0.1, zb));
    for (const q of [[xa, za, xb, za + 0.35], [xa, zb - 0.35, xb, zb], [xa, za, xa + 0.35, zb], [xb - 0.35, za, xb, zb]]) bag.add('lotus_leaf', box(q[0], F, q[1], q[2], F + 0.25, q[3]));
    // an inner border and a scroll of box in the middle of each lawn (a plain parterre of cut-work), a yew cone at the corners
    const mx = (xa + xb) / 2, mz = (za + zb) / 2;
    bag.add('lotus_leaf', lathe([[4.2, 0], [4.2, 0.2], [3.9, 0.2], [3.9, 0]], 28, null, mx, F + 0.1, mz));
    bag.add('lotus_leaf', lathe([[1.6, 0], [1.6, 0.2], [1.3, 0.2], [1.3, 0]], 18, null, mx, F + 0.1, mz));
    for (const [px, pz] of [[xa + 0.9, za + 0.9], [xb - 0.9, za + 0.9], [xa + 0.9, zb - 0.9], [xb - 0.9, zb - 0.9]]) {
      bag.add('bark_dark', lathe([[0.1, 0], [0.08, 0.4]], 6, null, px, F + 0.1, pz));
      bag.add('lotus_leaf', lathe([[0.001, 0.3], [0.62, 0.4], [0.5, 0.95], [0.3, 1.7], [0.001, 2.4]], 9, (th, i) => 1 + 0.04 * Math.sin(th * 5 + i), px, F + 0.1, pz)); col.circle(px, pz, 0.55, F, F + 2.5);
    }
  }
  // the basin in the crossing of the walks: a stone kerb, the water, a jet's bronze stem
  { const bx = CX, bz = (zs[0][1] + zs[1][0]) / 2, r = 5.5;
    STYLES.classical_fr.elements.fountain({ c: [bx, bz], r, y: FL, kind: 'plain' }, ctx); }
  // a path of the court's gravel edged in stone from the stairs' feet to the middle of the façade, a mounting of kerbs
  for (const x of [lx0 + 0.0, lx1 - 0.0]) void x;

  // ── the gallery ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
  const NB = 7, x0 = lx0 + 4, x1 = lx1 - 4, bay = (x1 - x0) / NB, rA = 2.3, yS = FL + 3.5, yO = FL + 0.04;
  const front = gz1 - 0.9, bayX = (k) => x0 + (k + 0.5) * bay;
  // the roof: the terrace's gravel at the level of the parterre, flush with it on the north; a slab under it
  bag.add(S, box(gx0, BODY, gz0, gx1, TOP - 0.04, gz1)); bag.add('pebbles', box(gx0, TOP - 0.04, gz0, gx1, TOP, gz1));
  col.rect([gx0, gz0, gx1, gz1], BODY, TOP - 0.1); col.floor([gx0, gz0, gx1, gz1], TOP);
  // the walls: the back, the two ends
  bag.add(S, box(gx0, FL - 0.5, gz0, gx1, BODY, T0)); bag.add(S, box(gx0, FL - 0.5, T0, gx0 + 2.0, BODY, gz1)); bag.add(S, box(gx1 - 2.0, FL - 0.5, T0, gx1, BODY, gz1));
  col.rect([gx0, gz0, gx1, T0], FL - 0.5, BODY); col.rect([gx0, T0, gx0 + 2.0, gz1], FL - 0.5, BODY); col.rect([gx1 - 2.0, T0, gx1, gz1], FL - 0.5, BODY);
  // the plaster of the inside, a floor of stone flags, the cornice at the springing
  const ix0 = gx0 + 2.0, ix1 = gx1 - 2.0;
  bag.add('plaster_white', box(ix0, yO, T0 - 0.02, ix1, yS, T0 + 0.03)); bag.add('plaster_white', box(ix0 - 0.02, yO, T0, ix0 + 0.03, yS, T1)); bag.add('plaster_white', box(ix1 - 0.03, yO, T0, ix1 + 0.02, yS, T1));
  bag.add('flagstone', box(ix0, FL - 0.3, T0, ix1, yO, T1)); col.floor([ix0, T0, ix1, T1], yO);
  for (const z of [T0 + 0.05, T1 - 0.05]) bag.add(S, box(ix0, yS - 0.12, z - 0.18, ix1, yS + 0.1, z + 0.18));
  // the vault: a segmental barrel of twelve facets over the width, with a transverse rib at every bay; its haunches rise to the slab
  { const hw = (T1 - T0) / 2, zc = (T0 + T1) / 2, f = 1.45, Rv = (hw * hw + f * f) / (2 * f), yo = yS + f - Rv, N = 12;
    const arc = (t, d = 0) => yo + Math.sqrt(Math.max(0.01, (Rv - d) * (Rv - d) - t * t));
    for (let k = 0; k < N; k++) {
      const t0 = -hw + k * 2 * hw / N, t1 = -hw + (k + 1) * 2 * hw / N;
      prism(bag, 'plaster_white', [[zc + t0, arc(t0)], [zc + t1, arc(t1)], [zc + t1, BODY], [zc + t0, BODY]], ix0, ix1);
      for (let b = 0; b <= NB; b++) { const xr = x0 + b * bay; prism(bag, S, [[zc + t0, arc(t0, 0.14)], [zc + t1, arc(t1, 0.14)], [zc + t1, arc(t1)], [zc + t0, arc(t0)]], Math.max(ix0, xr - 0.3), Math.min(ix1, xr + 0.3)); }
    } }
  // the front wall toward the court: seven round-headed bays between rusticated piers, the middle one the door, a Tuscan entablature, the glazing
  const fz = (T1 + gz1) / 2, th = gz1 - T1, xc = (x0 + x1) / 2;
  bag.add(S, planarWall({ o: [(gx0 + gx1) / 2, fz], u: [1, 0], th, u0: -(gx1 - gx0) / 2, u1: (gx1 - gx0) / 2, y0: FL - 0.5, y1: BODY, arches: Array.from({ length: NB }, (_, k) => ({ uc: bayX(k) - (gx0 + gx1) / 2, r: rA, spring: yS, sill: yO })) }));
  for (let k = 0; k < NB; k++) {
    const xk = bayX(k);
    col.rect([k === 0 ? gx0 + 2.0 : bayX(k - 1) + rA, T1, xk - rA, gz1], FL - 0.5, BODY); col.rect([xk - rA, T1, xk + rA, gz1], FL + 3.6, BODY);
    if (k === NB - 1) col.rect([xk + rA, T1, gx1 - 2.0, gz1], FL - 0.5, BODY);
    if (k !== (NB - 1) / 2) col.rect([xk - rA, T1 + 0.3, xk + rA, T1 + 0.7], FL - 0.5, BODY);
    // the glazing: panes in the arch's shape, set in the reveal's inner third, with mullions and transoms of wood; the middle bay's two leaves stand open against the jambs
    if (k !== (NB - 1) / 2) {
      bag.add('opening', planarWall({ o: [xk, T1 + 0.5], u: [1, 0], th: 0.05, u0: -rA + 0.1, u1: rA - 0.1, y0: yO + 0.5, y1: yS + rA, outline: { uc: 0, r: rA - 0.1, spring: yS } }));
      for (const dx of [-0.77, 0.77]) bag.add('wood_dark', box(xk + dx - 0.04, yO + 0.5, T1 + 0.44, xk + dx + 0.04, yS + 1.4, T1 + 0.56));
      for (const yy of [yO + 0.5, yO + 1.9, yO + 3.1]) bag.add('wood_dark', box(xk - rA + 0.08, yy, T1 + 0.44, xk + rA - 0.08, yy + 0.07, T1 + 0.56));
      bag.add('wood_dark', box(xk - rA + 0.08, yO + 0.5, T1 + 0.44, xk - rA + 0.16, yS, T1 + 0.56)); bag.add('wood_dark', box(xk + rA - 0.16, yO + 0.5, T1 + 0.44, xk + rA - 0.08, yS, T1 + 0.56));
      // a window's shutter-board below, the sill of dressed stone
      bag.add(S, box(xk - rA - 0.1, yO + 0.45, gz1 - 0.5, xk + rA + 0.1, yO + 0.52, gz1));
    } else {
      for (const sx of [-1, 1]) { bag.add('wood_dark', box(xk + sx * (rA - 0.1) - 0.05, yO, T1 + 0.05, xk + sx * (rA - 0.1) + 0.05, yS + 0.9, T1 + 1.25)); bag.add('iron', box(xk + sx * (rA - 0.1) - 0.06, yO + 1.0, T1 + 0.05, xk + sx * (rA - 0.1) + 0.06, yO + 1.12, T1 + 1.25)); }
      bag.add(S, box(xk - rA - 0.5, FL - 0.5, gz1, xk + rA + 0.5, yO, gz1 + 1.4)); bag.add(S, box(xk - rA - 0.8, FL - 0.5, gz1 + 1.4, xk + rA + 0.8, yO - 0.1 - 0.0, gz1 + 2.2));   // the threshold and its step
    }
    // the archivolt's moulding and its keystone, on the face
    bag.add(S, planarWall({ o: [xk, gz1 + 0.06], u: [1, 0], th: 0.12, u0: -rA - 0.4, u1: rA + 0.4, y0: yS - 0.0, y1: yS + rA + 0.4, arches: [{ uc: 0, r: rA, spring: yS, sill: yS - 0.01 }], outline: { uc: 0, r: rA + 0.4, spring: yS } }));
    bag.add(S, box(xk - 0.28, yS + rA - 0.05, gz1 - 0.02, xk + 0.28, yS + rA + 0.55, gz1 + 0.26));
  }
  // the Tuscan order between the bays: a pilaster on each pier, rusticated by its courses, a base and a capital
  for (let k = 0; k <= NB; k++) {
    const xp = x0 + k * bay, w = 0.55;
    if (k === 0 || k === NB) continue;
    bag.add(S, box(xp - w, yO + 0.3, gz1 - 0.02, xp + w, yS + 0.4, gz1 + 0.35)); bag.add(L, box(xp - w - 0.1, yO, gz1 - 0.02, xp + w + 0.1, yO + 0.3, gz1 + 0.4)); bag.add(L, box(xp - w - 0.12, yS + 0.4, gz1 + 0.0, xp + w + 0.12, yS + 0.7, gz1 + 0.42));
    for (let yy = yO + 0.6; yy < yS; yy += 0.7) bag.add(L, box(xp - w - 0.02, yy, gz1 + 0.35, xp + w + 0.02, yy + 0.04, gz1 + 0.38));
  }
  // the ends of the front: the blank returns at the head of each flight, with an arched niche
  // the entablature (architrave, frieze, a cornice with modillions) and the roof's edge
  bag.add(S, box(gx0, BODY - 1.5, gz1 - 0.0, gx1, BODY - 1.1, gz1 + 0.3)); bag.add(L, box(gx0 + 0.02, BODY - 1.12, gz1 + 0.02, gx1 - 0.02, BODY - 0.48, gz1 + 0.24)); bag.add(S, box(gx0, BODY - 0.5, gz1 - 0.0, gx1, BODY, gz1 + 0.6));
  for (let x = gx0 + 0.4; x < gx1 - 0.2; x += 0.8) bag.add(L, box(x, BODY - 0.9, gz1 + 0.3, x + 0.25, BODY - 0.5, gz1 + 0.6));
  balustrade(bag, col, [x0 - bay / 2 - 0.2 + 0.0, gz1 - 0.25], [x1 + bay / 2 + 0.2, gz1 - 0.25], TOP, 0);

  // ── the Cent Marches: a hundred steps in all (fifty to each flight), 3.5 m wide, from the court's level to the terrace's, a cheek wall on the court side
  const n = 50, tread = 0.34, rise = (TOP - F) / n, zb = gz1 + n * tread;
  for (const [xa, xb, cheek] of [[lx0, lx0 + 3.5, [lx0 + 3.5, lx0 + 4.0]], [lx1 - 3.5, lx1, [lx1 - 4.0, lx1 - 3.5]]]) {
    for (let k = 0; k < n; k++) bag.add(S, box(xa, FL - 0.5, zb - (k + 1) * tread, xb, F + rise * (k + 1), zb - k * tread));
    col.ramp([xa, gz1, xb, zb], F, TOP, 'n');
    prism(bag, S, [[zb, FL - 0.5], [gz1, FL - 0.5], [gz1, TOP + 0.3], [zb, F + 0.7]], cheek[0], cheek[1]);
    col.rect([cheek[0], gz1, cheek[1], zb], FL - 0.5, TOP + 0.3);
    // the handrail on the cheek: balusters in a rake and a stone rail
    const xr = (cheek[0] + cheek[1]) / 2, a = [xr, F + 0.7 + 0.95, zb], b = [xr, TOP + 0.3 + 0.95 - 0.3, gz1 + 0.3];
    bag.add(S, rod(a, b, 0.09, 6));
    for (let k = 0; k < n; k += 3) bag.add(S, lathe([[0.07, 0], [0.05, 0.4], [0.07, 0.8], [0.001, 0.9]], 6, null, xr, F + 0.7 + (TOP + 0.3 - F - 0.7) * (k / n) * 0.9 + 0.1, zb - k * tread));
  }
  // the gallery's end wall at the head of each flight, and the stone of the flights' backs against the walls is the retaining walls themselves
  // ── the gallery's furniture: the orange trees wintering in their boxes, two rows with an aisle between, the great stove, benches of the gardeners' hall
  const rows = [], zr = [T0 + 2.3, T1 - 2.3];
  for (const z of zr) for (let x = x0 + 2; x <= x1 - 2; x += 6) rows.push([x, z]);
  orangeTrees({ at: rows, y: yO, seed: 1688 }, ctx);
  // iron stoves with their pipes at the back wall, a cast-iron kind for the winter
  for (const k of [1, 3, 5]) { const x = bayX(k) + bay / 2 - 0.0; if (x > ix1 - 2) continue; bag.add('iron', box(x - 0.4, yO, T0 + 0.1, x + 0.4, yO + 1.0, T0 + 0.8)); bag.add('iron', lathe([[0.1, 0], [0.1, 3.5]], 8, null, x, yO + 1.0, T0 + 0.45)); col.rect([x - 0.4, T0, x + 0.4, T0 + 0.8], yO, yO + 1.0); }
  // ── the summer: orange trees in their boxes along the walls of the court, every 6 m, with a bench or two
  const sum = [];
  for (let x = lx0 + 7; x <= lx1 - 7; x += 6) sum.push([x, lz1 - 2.0]);
  for (let z = gz1 + 20; z <= lz1 - 6; z += 6) { sum.push([lx0 + 2.4, z]); sum.push([lx1 - 2.4, z]); }
  orangeTrees({ at: sum, y: F, seed: 1686 }, ctx);
}
