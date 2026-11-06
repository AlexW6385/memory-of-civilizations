// Babylon's temples and river (docs/settlements/babylon.md §4.5–4.8): Esagila, the house of Marduk, with its
// towered walls, its court and the god's cella clad in gold (the seated golden image is a figure placed by the
// settlement); the blue-glazed temple on Etemenanki's summit with the god's couch and golden table (Herodotus
// 1.181); the bridge over the Euphrates on its boat-shaped piers (Koldewey); the towered quay wall of the east
// bank; the round hide boats that came down the river (Herodotus 1.194).

import { STYLES } from '../../core/build.js';
import { box, lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { crenels } from './index.js';

const B = 'brick_baked', G = 'glaze_lapis', K = 'lacquer_black', AU = 'gold', CE = 'cedar', BZ = 'bronze', PL = 'plaster', BT = 'bitumen';

/** A solid of brick r = [x0, z0, x1, z1] from y0 to y1 that blocks the way (skipped when empty). */
function massOf(bag, col, r, y0, y1, m = B) {
  if (r[2] - r[0] < 1e-3 || r[3] - r[1] < 1e-3 || y1 - y0 < 1e-3) return;
  bag.add(m, box(r[0], y0, r[1], r[2], y1, r[3])); col.rect(r, y0, y1);
}
/** A plate on a face standing `t` proud of it: face 'x' (a plane x = at, out toward sign s) or 'z'; u0..u1 along, v0..v1 up. */
function plate(bag, mat, axis, at, s, u0, u1, v0, v1, t = 0.03) {
  if (u1 - u0 < 1e-3 || v1 - v0 < 1e-3) return;
  const a = Math.min(at, at + s * t), b = Math.max(at, at + s * t);
  bag.add(mat, axis === 'x' ? box(a, v0, u0, b, v1, u1) : box(u0, v0, a, u1, v1, b));
}
/** Gold sheets over a wall face, 1.5 m wide with narrow joints, leaving out the openings [[u0, u1, v1]] (from v0 up to v1). */
function sheets(bag, axis, at, s, u0, u1, v0, v1, holes = []) {
  const n = Math.max(1, Math.round((u1 - u0) / 1.5)), w = (u1 - u0) / n;
  for (let i = 0; i < n; i++) {
    const a = u0 + i * w + 0.012, b = u0 + (i + 1) * w - 0.012;
    // a sheet is cut round any opening it overlaps
    let cuts = [[a, b, v0]];
    for (const [h0, h1, hv] of holes) {
      const next = [];
      for (const [p, q, from] of cuts) {
        if (q <= h0 || p >= h1) { next.push([p, q, from]); continue; }
        if (p < h0) next.push([p, h0, from]);
        if (q > h1) next.push([h1, q, from]);
        next.push([Math.max(p, h0), Math.min(q, h1), Math.max(from, hv)]);
      }
      cuts = next;
    }
    for (const [p, q, from] of cuts) plate(bag, AU, axis, at, s, p, q, from, v1);
  }
}

/**
 * esagila: { rect, h } — Marduk's temple (Koldewey: almost square, 79.3 m on the north front and 85.8 m on the
 * west; a court 31.3 broad and 37.6 long; the principal cella, Marduk's, on the west of the court behind a
 * mighty-towered facade; the enclosing walls 6 m thick; every tower between two flanking towers in units of three;
 * exactly in the middle of each side a great gateway with massive projecting towers). Ours: the ranges of rooms
 * round the court built solid (their rooms left for later), the gates north, east and south passable, the west
 * gate's doors shut (behind it lies the cella); in the court the golden altar before the cella and the great
 * altar for full-grown sheep (Herodotus 1.183), censers for the frankincense; the antecella and the cella of Marduk,
 * its walls sheeted in bright gold (Nebuchadnezzar II 019 and 023: "I put bright gold on the walls of the cella"),
 * a ceiling of cedar beams, the dais in a niche of the back wall with the golden throne, footstool and table
 * (Herodotus) — the image itself is placed as a figure by the settlement (esagilaStatue gives where).
 */
export function esagila(el, { bag, col, lights }) {
  const [x0, z0, x1, z1] = el.rect, H = el.h ?? 12, zc = (z0 + z1) / 2, xm = (x0 + x1) / 2, T = 6;
  const C = [x0 + 32, zc - 18.8, x0 + 32 + 31.3, zc + 18.8];          // the court
  const pw = 5, ph = 7.5, M = (r, y0 = 0, y1 = H) => massOf(bag, col, r, y0, y1);
  // the north and south ranges with the gate passages through them; the east range likewise
  for (const [a, b] of [[z0, C[1]], [C[3], z1]]) { M([x0, a, xm - pw / 2, b]); M([xm + pw / 2, a, x1, b]); M([xm - pw / 2, a, xm + pw / 2, b], ph); }
  M([C[2], C[1], x1, zc - pw / 2]); M([C[2], zc + pw / 2, x1, C[3]]); M([C[2], zc - pw / 2, x1, zc + pw / 2], ph);
  // the west range: Marduk's cella behind its antecella, on the court's axis
  const cz0 = zc - 12, cz1 = zc + 12, xf = C[0] - 3, xa1 = xf, xa0 = xf - 6, xw1 = xa0, xw0 = xa0 - 2.5, xc0 = x0 + T, yR = H - 0.7;
  M([x0, C[1], C[0], cz0]); M([x0, cz1, C[0], C[3]]);
  // the back wall with the niche of the god (2 m deep, 6 wide, 8.5 high)
  const nz0 = zc - 3, nz1 = zc + 3, nx = xc0 - 2, nh = 8.5;
  M([x0, cz0, xc0, nz0]); M([x0, nz1, xc0, cz1]); M([x0, nz0, nx, nz1]); M([nx, nz0, xc0, nz1], nh);
  // the wall between antecella and cella (its door 3.4 × 6 m), the court facade (its door 4 × 7.5 m)
  const d1 = 1.7, dh1 = 6, d2 = 2, dh2 = ph;
  M([xw0, cz0, xw1, zc - d1], 0, yR); M([xw0, zc + d1, xw1, cz1], 0, yR); M([xw0, zc - d1, xw1, zc + d1], dh1, yR);
  M([xf, cz0, C[0], zc - d2]); M([xf, zc + d2, C[0], cz1]); M([xf, zc - d2, C[0], zc + d2], dh2);
  // the roof over antecella and cella: brick and earth over cedar boards on cedar beams spanning east–west
  bag.add(B, box(xc0, yR, cz0, xf, H, cz1)); col.floor([xc0, cz0, xf, cz1], H);
  bag.add(CE, box(xc0, yR - 0.06, cz0, xf, yR, cz1));
  for (const [a, b] of [[xc0, xw0], [xa0, xa1]]) for (let z = cz0 + 0.8; z < cz1 - 0.4; z += 1.2) bag.add(CE, box(a, yR - 0.5, z - 0.17, b, yR - 0.06, z + 0.17));
  // floors: the court in baked brick laid in bitumen; the rooms and passages brick
  bag.add(B, box(C[0], -0.3, C[1], C[2], 0.06, C[3])); col.floor(C, 0.06);
  bag.add(B, box(xc0, -0.3, cz0, xw0, 0.06, cz1)); bag.add(B, box(xa0, -0.3, cz0, xa1, 0.06, cz1)); col.floor([xc0, cz0, xa1, cz1], 0.06);
  bag.add(B, box(xw0, -0.3, zc - d1, xw1, 0.06, zc + d1)); bag.add(B, box(xf, -0.3, zc - d2, C[0], 0.06, zc + d2));
  for (const r of [[xm - pw / 2, z0 - 3, xm + pw / 2, C[1]], [xm - pw / 2, C[3], xm + pw / 2, z1 + 3], [C[2], zc - pw / 2, x1 + 3, zc + pw / 2], [x0 - 3, zc - pw / 2, x0, zc + pw / 2]]) { bag.add(B, box(r[0], -0.3, r[1], r[2], 0.06, r[3])); col.floor(r, 0.06); }
  // the court's parapet and the battlements round the outer walls
  for (const r of [[x0, z0, x1, z0 + 0.7], [x0, z1 - 0.7, x1, z1], [x0, z0 + 0.7, x0 + 0.7, z1 - 0.7], [x1 - 0.7, z0 + 0.7, x1, z1 - 0.7]]) crenels(bag, r, H, B, 1.1);
  for (const r of [[C[0], C[1] - 0.6, C[2], C[1]], [C[0], C[3], C[2], C[3] + 0.6], [C[2], C[1], C[2] + 0.6, C[3]], [C[0] - 0.6, C[1], C[0], cz0 - 0.5], [C[0] - 0.6, cz1 + 0.5, C[0], C[3]]]) crenels(bag, r, H, B, 1.1);
  // the outer faces: towers in units of three (a broad tower between two narrower ones), the gates in the middle
  // of each side between massive projecting towers, square towers at the corners
  const face = (f) => {
    const alongX = f === 'n' || f === 's', a = alongX ? x0 : z0, b = alongX ? x1 : z1, mid = (a + b) / 2, o = f === 'n' ? z0 : f === 's' ? z1 : f === 'w' ? x0 : x1, s = f === 'n' || f === 'w' ? -1 : 1;
    const tower = (u0, u1, p, hh) => {
      const q = alongX ? [u0, Math.min(o, o + s * p), u1, Math.max(o, o + s * p)] : [Math.min(o, o + s * p), u0, Math.max(o, o + s * p), u1];
      bag.add(B, box(q[0], -0.3, q[1], q[2], hh, q[3])); col.rect(q, 0, hh); crenels(bag, q, hh, B, 1.1);
    };
    // the corner towers
    const ex = alongX ? 1.5 : 0;
    tower(a - ex, a + 6, 1.5, H + 2.5); tower(b - 6, b + ex, 1.5, H + 2.5);
    // the gate towers, 7 m broad, projecting 3 m; the passage between them
    tower(mid - pw / 2 - 7, mid - pw / 2, 3, H + 4); tower(mid + pw / 2, mid + pw / 2 + 7, 3, H + 4);
    const gq = alongX ? [mid - pw / 2, Math.min(o, o + s * 3), mid + pw / 2, Math.max(o, o + s * 3)] : [Math.min(o, o + s * 3), mid - pw / 2, Math.max(o, o + s * 3), mid + pw / 2];
    bag.add(B, box(gq[0], ph, gq[1], gq[2], H + 1.5, gq[3])); crenels(bag, gq, H + 1.5, B, 1.1);
    // the doors: cedar leaves bound in bronze, open against the passage's sides (shut on the west, flush with the
    // wall's face: behind them lies the cella)
    const at = (u0, u1, w0, w1, y0, y1, m) => bag.add(m, alongX ? box(u0, y0, Math.min(w0, w1), u1, y1, Math.max(w0, w1)) : box(Math.min(w0, w1), y0, u0, Math.max(w0, w1), y1, u1));
    if (f === 'w') {
      at(mid - pw / 2, mid + pw / 2, o, o - 0.16, 0.06, ph, CE);
      for (const v of [0.6, ph / 2, ph - 0.7]) at(mid - pw / 2, mid + pw / 2, o - 0.16, o - 0.18, v - 0.08, v + 0.08, BZ);
      at(mid - 0.02, mid + 0.02, o - 0.16, o - 0.19, 0.06, ph, K);
      col.rect([o - 0.2, mid - pw / 2, o, mid + pw / 2], 0, ph);
    } else {
      const inward = -s;
      for (const sx of [-1, 1]) {
        const u0 = Math.min(mid + sx * pw / 2, mid + sx * (pw / 2 - 0.16)), u1 = Math.max(mid + sx * pw / 2, mid + sx * (pw / 2 - 0.16)), w0 = o + inward * 0.8, w1 = o + inward * (0.8 + pw / 2 - 0.1);
        at(u0, u1, w0, w1, 0.06, ph - 0.05, CE);
        const uf = sx < 0 ? u1 : u0 - 0.02;
        for (const v of [0.6, ph / 2, ph - 0.7]) at(uf, uf + 0.02, w0, w1, v - 0.08, v + 0.08, BZ);
        col.rect(alongX ? [u0, Math.min(w0, w1), u1, Math.max(w0, w1)] : [Math.min(w0, w1), u0, Math.max(w0, w1), u1], 0, ph);
      }
    }
    // the units of three between the corner and the gate towers
    for (const [ua, ub] of [[a + 6, mid - pw / 2 - 7], [mid + pw / 2 + 7, b - 6]]) {
      const L = ub - ua, n = Math.max(1, Math.round(L / 15));
      for (let i = 0; i < n; i++) {
        const c = ua + (i + 0.5) * L / n;
        tower(c - 2.25, c + 2.25, 1.4, H + 2); tower(c - 5.4, c - 3.1, 0.8, H + 1); tower(c + 3.1, c + 5.4, 0.8, H + 1);
      }
    }
  };
  for (const f of ['n', 's', 'e', 'w']) face(f);
  // the cella's facade on the court: two great towers flanking its door, rising over the roofs
  for (const sz of [-1, 1]) {
    const q = [C[0], Math.min(zc + sz * d2, zc + sz * (d2 + 5)), C[0] + 2.2, Math.max(zc + sz * d2, zc + sz * (d2 + 5))];
    bag.add(B, box(q[0], 0.06, q[1], q[2], H + 3.5, q[3])); col.rect(q, 0, H + 3.5); crenels(bag, q, H + 3.5, B, 1.1);
    const p = [C[0], Math.min(zc + sz * (d2 + 5.6), zc + sz * (d2 + 8.6)), C[0] + 1.1, Math.max(zc + sz * (d2 + 5.6), zc + sz * (d2 + 8.6))];
    bag.add(B, box(p[0], 0.06, p[1], p[2], H + 1.5, p[3])); col.rect(p, 0, H + 1.5); crenels(bag, p, H + 1.5, B, 1.1);
  }
  // over the cella door: a lintel course in the rebate, a band of blue glaze with white rosettes [inferred]
  bag.add(G, box(C[0] + 0.001, ph + 0.3, zc - d2 - 0.2, C[0] + 0.08, ph + 1.1, zc + d2 + 0.2));
  for (let k = 0; k < 6; k++) bag.add('glaze_white', lathe([[0.22, 0], [0.1, 0.04], [0.001, 0.05]], 16).rotateZ(-Math.PI / 2).translate(C[0] + 0.08, ph + 0.7, zc - d2 + 0.2 + k * (2 * d2 - 0.4) / 5));
  // the cella's doors: cedar leaves bound in bronze, open against the antecella's walls
  for (const sz of [-1, 1]) {
    const zA = zc + sz * d2, zB = zc + sz * (d2 + 2 - 0.05), q = [xf - 0.18, Math.min(zA, zB), xf - 0.02, Math.max(zA, zB)];
    bag.add(CE, box(q[0], 0.06, q[1], q[2], dh2 - 0.05, q[3]));
    for (const v of [0.6, dh2 / 2, dh2 - 0.7]) bag.add(BZ, box(q[0] - 0.02, v - 0.08, q[1], q[0], v + 0.08, q[3]));
    col.rect(q, 0, dh2);
  }

  // the golden altar for the sucklings before the cella door; the great altar for full-grown sheep in the court;
  // two bronze censers for the frankincense burnt at the god's festival
  const ax = C[0] + 6;
  bag.add(AU, box(ax - 0.6, 0.06, zc - 0.45, ax + 0.6, 0.85, zc + 0.45)); bag.add(AU, box(ax - 0.7, 0.85, zc - 0.55, ax + 0.7, 0.95, zc + 0.55));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bag.add(AU, box(ax + sx * 0.62 - 0.08, 0.95, zc + sz * 0.47 - 0.08, ax + sx * 0.62 + 0.08, 1.12, zc + sz * 0.47 + 0.08));
  col.rect([ax - 0.7, zc - 0.55, ax + 0.7, zc + 0.55], 0, 1.1);
  const gx = C[0] + 17, gr = [gx - 2.5, zc - 2, gx + 2.5, zc + 2];
  bag.add(B, box(gr[0], 0.06, gr[1], gr[2], 1.4, gr[3])); col.rect(gr, 0, 1.4); col.floor(gr, 1.4);
  bag.add(B, box(gr[0] - 0.15, 1.4, gr[1] - 0.15, gr[2] + 0.15, 1.55, gr[3] + 0.15));
  bag.add(BT, box(gr[0] + 0.4, 1.55, gr[1] + 0.4, gr[2] - 0.4, 1.6, gr[3] - 0.4));                         // the hearth, black with the fat of the offerings
  for (let k = 0; k < 4; k++) bag.add(B, box(gr[2], 0.06 + k * 0.35, zc - 1, gr[2] + 1.6 - k * 0.4, 0.41 + k * 0.35, zc + 1));     // the priests' steps up its east side
  col.ramp([gr[2], zc - 1, gr[2] + 1.6, zc + 1], 0.06, 1.4, 'w');
  for (const sz of [-1, 1]) {
    const cx = C[0] + 3.2, czz = zc + sz * 3.4;
    bag.add(BZ, lathe([[0.3, 0], [0.26, 0.06], [0.06, 0.16], [0.045, 0.3], [0.045, 1.05], [0.12, 1.12], [0.26, 1.2], [0.3, 1.34], [0.27, 1.36], [0.22, 1.24], [0.001, 1.22]], 14, null, cx, 0.06, czz));
    col.circle(cx, czz, 0.3, 0, 1.4);
    lights.push({ at: [cx, 1.6, czz], color: '#ffb46b', intensity: 2.5, distance: 6 });
  }

  // inside the cella: the walls sheeted in gold to the cedar ceiling, the niche of the god sheeted too
  const yT = yR - 0.5;
  sheets(bag, 'x', xc0, 1, cz0, nz0, 0.06, yT); sheets(bag, 'x', xc0, 1, nz1, cz1, 0.06, yT); sheets(bag, 'x', xc0, 1, nz0, nz1, nh, yT);
  sheets(bag, 'x', xw0, -1, cz0, cz1, 0.06, yT, [[zc - d1, zc + d1, dh1]]);
  sheets(bag, 'z', cz0, 1, xc0, xw0, 0.06, yT); sheets(bag, 'z', cz1, -1, xc0, xw0, 0.06, yT);
  sheets(bag, 'x', nx, 1, nz0, nz1, 0.06, nh); sheets(bag, 'z', nz0, 1, nx, xc0, 0.06, nh); sheets(bag, 'z', nz1, -1, nx, xc0, 0.06, nh);
  bag.add(AU, box(nx, nh - 0.03, nz0, xc0, nh, nz1));                                                     // the niche's soffit
  // the antecella plastered white, a dado of bitumen [inferred]
  for (const [ax0, s] of [[xa0, 1], [xa1, -1]]) {
    const holes = [[zc - (s > 0 ? d1 : d2), zc + (s > 0 ? d1 : d2), s > 0 ? dh1 : dh2]];
    plate(bag, PL, 'x', ax0, s, cz0, holes[0][0], 0.06, yT); plate(bag, PL, 'x', ax0, s, holes[0][1], cz1, 0.06, yT); plate(bag, PL, 'x', ax0, s, holes[0][0], holes[0][1], holes[0][2], yT);
  }
  plate(bag, PL, 'z', cz0, 1, xa0, xa1, 0.06, yT); plate(bag, PL, 'z', cz1, -1, xa0, xa1, 0.06, yT);
  // the dais: brick sheeted in gold, in the niche and out before it, two steps up at its front
  const yD = 1.1, dx0 = nx, dx1 = xc0 + 3.6, dz0 = zc - 2.9, dz1 = zc + 2.9;
  bag.add(B, box(dx0, 0.06, dz0, dx1, yD, dz1)); col.rect([dx0, dz0, dx1, dz1], 0, yD); col.floor([dx0, dz0, dx1, dz1], yD);
  plate(bag, AU, 'x', dx1, 1, dz0, dz1, 0.06, yD); plate(bag, AU, 'z', dz0, -1, xc0, dx1, 0.06, yD); plate(bag, AU, 'z', dz1, 1, xc0, dx1, 0.06, yD);
  for (let k = 0; k < 3; k++) { const h0 = 0.06 + k * (yD - 0.06) / 3, h1 = h0 + (yD - 0.06) / 3, w = 0.4 * (3 - k); bag.add(B, box(dx1, h0, zc - 1.6, dx1 + w, h1, zc + 1.6)); }
  col.ramp([dx1, zc - 1.6, dx1 + 1.2, zc + 1.6], 0.06, yD, 'w');
  // the golden footstool and throne of the god (a box throne, its sides panelled) — the seated image's place:
  // its feet on the stool at `sx`, its seat behind
  const s = 2, ax2 = xc0 - 0.9, yF = yD + 0.3, seat = yF + 0.49 * s;
  bag.add(AU, box(ax2 + 0.45, yD, zc - 0.55, ax2 + 1.3, yF, zc + 0.55));
  bag.add(AU, box(ax2 - 0.36, yD, zc - 0.62, ax2 + 0.6, seat, zc + 0.62));
  bag.add(AU, box(ax2 - 0.38, seat, zc - 0.66, ax2 + 0.64, seat + 0.06, zc + 0.66));
  bag.add(AU, box(ax2 - 0.58, yD, zc - 0.66, ax2 - 0.36, seat + 1.15, zc + 0.66));                        // the back
  for (const sz of [-1, 1]) for (const k of [0, 1]) {                                                       // the panels of its sides
    const zz = zc + sz * 0.62, u0 = ax2 - 0.28 + k * 0.45, u1 = u0 + 0.35;
    bag.add(AU, box(u0, yD + 0.15, Math.min(zz, zz + sz * 0.03), u1, seat - 0.15, Math.max(zz, zz + sz * 0.03)));
  }
  col.rect([ax2 - 0.6, zc - 0.7, ax2 + 1.3, zc + 0.7], yD, seat + 1.2);
  // the god's horned crown over the image's head: three pairs of horns wound round a tall cap, a crest of feathers
  {
    const hx = ax2 + 0.08, yc = yF + 2.48, rc = 0.225;
    bag.add(AU, lathe([[rc, 0], [rc + 0.01, 0.62], [rc + 0.05, 0.66], [rc + 0.07, 0.74], [rc - 0.01, 0.75], [0.001, 0.72]], 24, (th, i) => (i >= 2 ? 1 + 0.05 * Math.cos(th * 16) : 1), hx, yc, zc));
    for (let k = 0; k < 3; k++) bag.add(AU, lathe([[rc + 0.005, 0], [rc + 0.04, 0.04], [rc + 0.045, 0.08], [rc + 0.005, 0.12]], 24, null, hx, yc + 0.06 + k * 0.17, zc));
  }
  // the great golden table before the dais, its vessels of gold
  const tx = dx1 + 2.6, ty = 1.05;
  bag.add(AU, box(tx - 0.8, ty - 0.08, zc - 1.6, tx + 0.8, ty, zc + 1.6));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bag.add(AU, lathe([[0.09, 0], [0.06, 0.1], [0.05, ty - 0.2], [0.07, ty - 0.08]], 10, null, tx + sx * 0.68, 0.06, zc + sz * 1.45));
  for (const [dz, k] of [[-1.1, 0], [-0.4, 1], [0.35, 0], [1.1, 1]]) bag.add(AU, k ? lathe([[0.001, 0], [0.12, 0.01], [0.2, 0.08], [0.21, 0.1], [0.001, 0.03]], 14, null, tx, ty, zc + dz) : lathe([[0.06, 0], [0.11, 0.08], [0.12, 0.2], [0.07, 0.3], [0.08, 0.36], [0.001, 0.36]], 12, null, tx, ty, zc + dz));
  col.rect([tx - 0.8, zc - 1.6, tx + 0.8, zc + 1.6], 0, ty);
  // bronze lampstands either side, their light warm on the gold
  for (const sz of [-1, 1]) {
    const lx = dx1 + 1.2, lz = zc + sz * 4.2;
    bag.add(BZ, lathe([[0.25, 0], [0.22, 0.05], [0.05, 0.14], [0.035, 0.3], [0.035, 1.6], [0.08, 1.64], [0.2, 1.72], [0.18, 1.75]], 12, null, lx, 0.06, lz));
    col.circle(lx, lz, 0.25, 0, 1.8);
    lights.push({ at: [lx, 2.0, lz], color: '#ffb46b', intensity: 5, distance: 14 });
  }
  lights.push({ at: [xc0 + 2.5, 5, zc], color: '#ffc27a', intensity: 3, distance: 10 });
}

/**
 * etemenanki: the ziggurat (src/styles/sumerian) with the temple on its summit built of baked bricks in shining
 * blue glaze (Nebuchadnezzar II 023: "on their summits I resplendently built a holy shrine, a well-adorned bedroom,
 * using baked bricks coloured with shining blue glaze"); stepped battlements on its parapet; in its cella no image
 * but a great couch, well covered, and a golden table by it (Herodotus 1.181–182). The Ur shrine's emblem of Nanna
 * is left out.
 */
export function etemenanki(el, ctx) {
  const top = el.stages.reduce((s, t) => s + t.h, el.y ?? 0);
  const inner = {
    add(mat, g) {
      if (!g) return;
      g.computeBoundingBox();
      const b = g.boundingBox;
      if (b.min.y >= top - 0.01) {
        if (mat === 'mud_plaster') mat = G;
        else if (mat === 'gold') return;                                                     // Nanna's crescent
        else if (mat === 'bronze' && b.max.y - b.min.y > 1.5 && b.max.x - b.min.x < 0.2) return; // and its standard
      }
      ctx.bag.add(mat, g);
    },
  };
  STYLES.sumerian.elements.ziggurat(el, { ...ctx, bag: inner });
  const { bag, col } = ctx, [cx, c] = el.c, W = el.shrine.w, D = el.shrine.d, Hs = el.shrine.h, y = top;
  // positions on the north-fronted ziggurat, seen in the mirror when it fronts south
  const Z = el.front === 's' ? (z) => 2 * c - z : (z) => z, zr = (a, b) => [Math.min(Z(a), Z(b)), Math.max(Z(a), Z(b))];
  const sz = c + 1, x0 = cx - W / 2, x1 = cx + W / 2, zs0 = sz - D / 2, zs1 = sz + D / 2;
  // stepped battlements of blue glaze along the parapet
  for (const [a, b] of [zr(zs0, zs0 + 0.35), zr(zs1 - 0.35, zs1)]) crenels(bag, [x0, a, x1, b], y + Hs + 0.5, G, 1.0, { gap: 0.55 });
  { const [a, b] = zr(zs0 + 0.35, zs1 - 0.35); for (const r of [[x0, a, x0 + 0.35, b], [x1 - 0.35, a, x1, b]]) crenels(bag, r, y + Hs + 0.5, G, 1.0, { gap: 0.55 }); }
  // the couch along the cella's west end: a cedar frame on gold-shod feet, a mattress and a coverlet
  const t = 1.3, zA = zs0 + t + 3.0, zC = zA + 1.0, cz0 = zC + 0.9, cz1 = cz0 + 4.2, [ka, kb] = zr(cz0, cz1), kx0 = x0 + t + 0.75, kx1 = kx0 + 1.9;
  bag.add(CE, box(kx0, y + 0.55, ka, kx1, y + 0.75, kb));
  for (const fx of [kx0 + 0.12, kx1 - 0.12]) for (const fz of [ka + 0.15, kb - 0.15]) bag.add(AU, lathe([[0.1, 0], [0.12, 0.08], [0.07, 0.2], [0.06, 0.45], [0.09, 0.55]], 10, null, fx, y + 0.06, fz));
  bag.add('linen', box(kx0 + 0.05, y + 0.75, ka + 0.05, kx1 - 0.05, y + 0.98, kb - 0.05));
  bag.add('cloth_red', box(kx0 - 0.02, y + 0.98, ka + 0.6, kx1 + 0.02, y + 1.02, kb - 0.3));
  bag.add('cloth_red', box(kx1 + 0.02, y + 0.45, ka + 0.6, kx1 + 0.05, y + 1.02, kb - 0.3));               // the coverlet hanging over the side
  bag.add('linen', box(kx0 + 0.15, y + 0.98, (Z(cz1) > Z(cz0) ? kb - 0.75 : ka + 0.1), kx1 - 0.15, y + 1.16, (Z(cz1) > Z(cz0) ? kb - 0.1 : ka + 0.75)));
  col.rect([kx0, ka, kx1, kb], y, y + 1.1);
  // the golden table by it
  const gz = Z((cz0 + cz1) / 2), gx = kx1 + 1.0;
  bag.add(AU, box(gx - 0.45, y + 0.86, gz - 0.7, gx + 0.45, y + 0.92, gz + 0.7));
  for (const sx of [-1, 1]) for (const s2 of [-1, 1]) bag.add(AU, lathe([[0.06, 0], [0.04, 0.1], [0.035, 0.76], [0.05, 0.8]], 8, null, gx + sx * 0.36, y + 0.06, gz + s2 * 0.6));
  bag.add(AU, lathe([[0.001, 0], [0.1, 0.01], [0.17, 0.07], [0.18, 0.09], [0.001, 0.03]], 12, null, gx, y + 0.92, gz - 0.25));
  bag.add(AU, lathe([[0.05, 0], [0.09, 0.07], [0.1, 0.18], [0.05, 0.26], [0.06, 0.3], [0.001, 0.3]], 10, null, gx, y + 0.92, gz + 0.3));
  col.rect([gx - 0.45, gz - 0.7, gx + 0.45, gz + 0.7], y, y + 0.92);
}

/** A loft between two convex outlines (bottom P0 at y0, top P1 at y1, same count): sides and top. */
function loft(P0, y0, P1, y1, { top = true } = {}) {
  const T = [], n = P0.length;
  for (let i = 0; i < n; i++) {
    const a = P0[i], b = P0[(i + 1) % n], c = P1[(i + 1) % n], d = P1[i];
    T.push(a[0], y0, a[1], b[0], y0, b[1], c[0], y1, c[1], a[0], y0, a[1], c[0], y1, c[1], d[0], y1, d[1]);
  }
  if (top) { const cx = P1.reduce((s, p) => s + p[0], 0) / n, cz = P1.reduce((s, p) => s + p[1], 0) / n; for (let i = 0; i < n; i++) { const a = P1[i], b = P1[(i + 1) % n]; T.push(cx, y1, cz, a[0], y1, a[1], b[0], y1, b[1]); } }
  return fromTriangles(orientOutward(T));
}
/** The plan of a pier (Koldewey): its sides convex, meeting in a point upstream (−z); the downstream end square, its corners eased. */
function pierOutline(cx, cz, W, L) {
  const P = [], hw = W / 2, nose = L * 0.42;
  for (let i = 0; i <= 10; i++) { const t = i / 10, v = -L / 2 + nose * t; P.push([cx + hw * Math.sin(t * Math.PI / 2) ** 0.8, cz + v]); }
  P.push([cx + hw, cz + L / 2 - 0.6], [cx + hw - 0.6, cz + L / 2], [cx - hw + 0.6, cz + L / 2], [cx - hw, cz + L / 2 - 0.6]);
  for (let i = 10; i >= 1; i--) { const t = i / 10, v = -L / 2 + nose * t; P.push([cx - hw * Math.sin(t * Math.PI / 2) ** 0.8, cz + v]); }
  return P;
}
/**
 * bridge: { z (its axis), piers: [x centres], abut: [[x0, x1], [x0, x1]] (the bridgeheads on the banks), y (the
 * roadway's top), bed, waterY, W (9), L (21), road (9) } — the bridge over the Euphrates (Koldewey: seven piers
 * excavated, 9 m wide and 9 m apart, 21 m long, built with a very marked batter of small unstamped baked bricks,
 * their sides convex and meeting in a point toward the current on the north — the plan of a ship's water-line;
 * baulks of wood in the brickwork; probably roofed with stone, on which lay the rafters of the roadway; Diodorus:
 * 30 feet broad) and Herodotus 1.186 (the stones bound with iron and lead, squared timbers laid across them by day).
 * Ours: three piers in our narrower river; the stone caps; the squared beams along the bridge and the planks across
 * them; the bridgeheads of brick on both banks.
 */
export function bridge(el, { bag, col }) {
  const { z, y, bed } = el, W = el.W ?? 9, L = el.L ?? 21, road = el.road ?? 9, bat = 0.08, yP = y - 0.95;
  for (const px of el.piers) {
    const h = yP - bed, b = bat * h, P0 = pierOutline(px, z, W, L), P1 = pierOutline(px, z + b * 0.4, W - 2 * b, L - 2 * b);
    bag.add(B, loft(P0, bed, P1, yP));
    // the courses of timber baulks showing in the brickwork (Koldewey), above the water
    const yw = el.waterY ?? bed;
    for (let yy = Math.ceil((yw + 0.4) / 2) * 2; yy < yP - 0.5; yy += 2) {
      const f = (yy - bed) / h, hw = (W / 2 - b * f) + 0.02, l2 = L / 2 - b * f;
      bag.add('palm_trunk', box(px - hw, yy, z - L / 2 + L * 0.46, px + hw, yy + 0.18, z + l2 - 1.0));
    }
    // the stone cap
    const Pc = pierOutline(px, z + b * 0.4, W - 2 * b + 0.3, L - 2 * b + 0.3);
    bag.add('limestone', loft(Pc, yP, Pc, yP + 0.3));
    col.rect([px - W / 2, z - L / 2, px + W / 2, z + L / 2], bed, yP + 0.3);
  }
  // the bridgeheads
  for (const [a, b2] of el.abut) {
    const r = [a, z - road / 2 - 1.5, b2, z + road / 2 + 1.5];
    bag.add(B, box(r[0], bed, r[1], r[2], y, r[3])); col.rect(r, bed, y); col.floor(r, y);
    crenels(bag, [r[0], r[1], r[2], r[1] + 0.6], y, B, 0.9); crenels(bag, [r[0], r[3] - 0.6, r[2], r[3]], y, B, 0.9);
  }
  // the squared beams along the bridge from bridgehead to bridgehead, on the caps; the planks across them
  const xa = Math.min(...el.abut.map((q) => Math.max(q[0], q[1]))), xb = Math.max(...el.abut.map((q) => Math.min(q[0], q[1])));
  const xs0 = Math.min(xa, xb), xs1 = Math.max(xa, xb), nb = 9;
  for (let i = 0; i < nb; i++) { const zz = z - road / 2 + 0.3 + i * (road - 0.6) / (nb - 1); bag.add('timber', box(xs0 - 0.6, yP + 0.3, zz - 0.18, xs1 + 0.6, y - 0.12, zz + 0.18)); }
  { const n = Math.round((xs1 - xs0) / 0.32), w = (xs1 - xs0) / n; for (let i = 0; i < n; i++) bag.add('timber', box(xs0 + i * w + 0.008, y - 0.12, z - road / 2, xs0 + (i + 1) * w - 0.008, y, z + road / 2)); }
  col.floor([xs0, z - road / 2, xs1, z + road / 2], y);
}

/**
 * quay: { river (x of the river's middle as a function of z), z0, z1, d0, d1 (the wall's water face and back, from
 * the river's middle), y (its top), bed, skip: [[z0, z1]], towers: 19 } — the river wall of the east bank (Koldewey:
 * Nabonidus's wall on the bank, 7.67 m thick, in asphalt, with towers alternately broad and narrow, 7.3 and 6.3 m,
 * about 19 m apart; Nebuchadnezzar: "quay walls of burnt brick"). Ours: the wall following the bank, a parapet of
 * stepped merlons on its water edge, the towers standing out into the river.
 */
export function quay(el, { bag, col }) {
  const X = el.river, { z0, z1, d0, d1, y, bed } = el, skip = el.skip ?? [], step = 2;
  const free = (a, b) => skip.every(([s0, s1]) => b <= s0 || a >= s1);
  for (let za = z0; za < z1 - 1e-6; za += step) {
    const zb = Math.min(z1, za + step);
    if (!free(za, zb)) continue;
    const fa = X(za) + d0, fb = X(zb) + d0, ba = X(za) + d1, bb = X(zb) + d1, T = [];
    // the top, the water face, the back (a little proud of the bank), the ends where the wall stops
    T.push(fa, y, za, ba, y, za, bb, y, zb, fa, y, za, bb, y, zb, fb, y, zb);
    T.push(fa, bed, za, fa, y, za, fb, y, zb, fa, bed, za, fb, y, zb, fb, bed, zb);
    T.push(ba, y, za, ba, bed, za, bb, bed, zb, ba, y, za, bb, bed, zb, bb, y, zb);
    if (!free(za - step, za) || za === z0) T.push(fa, bed, za, ba, bed, za, ba, y, za, fa, bed, za, ba, y, za, fa, y, za);
    if (!free(zb, zb + step) || zb === z1) T.push(fb, bed, zb, fb, y, zb, bb, y, zb, fb, bed, zb, bb, y, zb, bb, bed, zb);
    bag.add(B, fromTriangles(orientOutward(T)));
    col.rect([Math.min(fa, fb), za, Math.max(ba, bb), zb], bed, y); col.floor([Math.min(fa, fb) + 0.8, za, Math.max(ba, bb), zb], y);
    col.segment([fa + 0.3, za], [fb + 0.3, zb], 0.6, y, y + 1.3);
    // a band of bitumen at the waterline [Koldewey: the wall in asphalt], facing the river
    if (el.waterY !== undefined) {
      const yl = el.waterY - 0.4, yh = el.waterY + 0.25, ga = fa - 0.02, gb = fb - 0.02;
      bag.add(BT, fromTriangles([ga, yl, za, gb, yl, zb, gb, yh, zb, ga, yl, za, gb, yh, zb, ga, yh, za]));
    }
  }
  // the parapet's merlons, each at the face where it stands
  for (let zz = z0 + 0.9; zz < z1 - 0.9; zz += 1.8) {
    if (!free(zz - 0.9, zz + 0.9)) continue;
    const f = X(zz) + d0;
    crenels(bag, [f, zz - 0.55, f + 0.6, zz + 0.55], y, B, 1.1);
  }
  // the towers out into the river, broad and narrow by turns
  let k = 0;
  for (let zz = z0 + 9.5; zz < z1 - 4; zz += el.towers ?? 19, k++) {
    const w = k % 2 ? 6.3 : 7.3;
    if (!free(zz - w / 2 - 1, zz + w / 2 + 1)) continue;
    const f = Math.min(X(zz - w / 2), X(zz + w / 2)) + d0, q = [f - 3, zz - w / 2, f + 1.2, zz + w / 2], hh = y + 2.6;
    bag.add(B, box(q[0], bed, q[1], q[2], hh, q[3])); col.rect(q, bed, hh); crenels(bag, q, hh, B, 1.1);
  }
}

/**
 * quffa: { at, y (the water), r, cargo ('casks' | 'reeds' | 'none') } — the round river boat of Babylonia (Herodotus
 * 1.194: round like a shield, of hides stretched on frames of willow cut in Armenia, filled with reeds, bringing down
 * mostly casks of palm wood full of wine; the largest carrying 5,000 talents and a live ass; two men standing steer
 * it with paddles). The boatmen and the ass are figures placed by the settlement; stand at y − 0.32.
 */
export function quffa(el, { bag }) {
  const [x, z] = el.at, y = el.y, r = el.r ?? 1.8, d = 0.5, t = 0.06;
  bag.add('hide_brown', lathe([[0.001, -d], [r * 0.55, -d + 0.02], [r * 0.86, -d * 0.62], [r, -0.05], [r * 0.99, 0.42], [r * 0.99 - t, 0.44], [r - t, -0.05], [r * 0.86 - t, -d * 0.62 + t * 0.6], [r * 0.55, -d + 0.02 + t], [0.001, -d + 0.02 + t]], 28, null, x, y, z));
  // the willow rim, bound round with withies
  bag.add('wicker', lathe(Array.from({ length: 9 }, (_, i) => { const a = Math.PI * 2 * i / 8; return [r * 0.99 - t / 2 + Math.cos(a) * 0.06, 0.44 + Math.sin(a) * 0.06]; }), 28, null, x, y, z));
  // the floor of reeds laid in it
  bag.add('reed_mat', lathe([[0.001, -0.33], [r * 0.82, -0.33], [r * 0.82, -0.31], [0.001, -0.31]], 20, null, x, y, z));
  if (el.cargo === 'casks') {
    const P = [[-0.5, -0.45], [0.15, -0.6], [0.7, -0.1], [0.3, 0.5], [-0.45, 0.35], [0.95, 0.55]].filter(([u, v]) => Math.hypot(u, v) < r - 0.55);
    for (const [u, v] of P) bag.add('palm_trunk', lathe([[0.001, 0], [0.2, 0.02], [0.27, 0.15], [0.29, 0.38], [0.27, 0.6], [0.2, 0.72], [0.001, 0.73]], 12, null, x + u * r * 0.55, y - 0.31, z + v * r * 0.55));
  } else if (el.cargo === 'reeds') {
    for (let i = 0; i < 4; i++) { const g = lathe([[0.18, 0], [0.18, r * 1.2]], 8); g.rotateZ(Math.PI / 2).translate(x + r * 0.6, y - 0.13, z - 0.6 + i * 0.4); bag.add('thatch', g); }
  }
}

/** Where the seated image of Marduk sits in esagila(el): { at, y, rot, h } for a figure (feet on the footstool). */
export function esagilaStatue(rect) {
  const [x0, z0, , z1] = rect;
  return { at: [x0 + 6 - 0.9, (z0 + z1) / 2], y: 1.1 + 0.3, rot: -Math.PI / 2, h: 3.3 };
}
