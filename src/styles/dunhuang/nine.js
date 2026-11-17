// Cave 96: the Great Buddha's hall cut in the rock (the Maitreya, 35.5 m, seated, made in 695) and the
// Nine-Storey building of timber that stands against the cliff over its face (docs/settlements/dunhuang.md §4).
import { box, lathe, fromTriangles, quad, rod } from '../../core/geom.js';
import { subtractRects } from '../../core/build.js';
import { buddha } from '../chinese/index.js';
import { XF, FLOOR } from '../../settlements/dunhuang/layout.js';
import { Panel, wallPanel, PAL, tableauM, friezeM, apsaraM, lotusM, thousandM } from './paint.js';
import { oilLamp } from './caves.js';
import { Acc, trisOf, jit, skirtRolls, tileRoll, corbel, balustrade, windowBars, chiwen } from './roofwork.js';

/** The hall inside the rock: the lining, the paintings on its long walls, the Buddha on his throne, lamps before him. */
export function greatCave(ctx, c) {
  const { bag, col } = ctx, y = FLOOR[0], x0 = XF - 26, x1 = XF - 1, z0 = -11.5, z1 = 11.5, H = 39, t = 0.06;
  bag.add('brick_grey', box(x0, y - 0.12, z0, x1, y, z1)); bag.add('brick_grey', box(x1, y - 0.12, -7, XF, y, 7));
  col.floor([x0, z0, x1, z1], y); col.floor([x1, -7, XF, 7], y);
  bag.add('lime_plaster', box(x0, y, z0, x1, H, z0 + t)); bag.add('lime_plaster', box(x0, y, z1 - t, x1, H, z1)); bag.add('lime_plaster', box(x0, y, z0, x0 + t, H, z1));
  // (the walls are the rock's own faces here, plastered: the same boxes drawn thin)
  const ceil = new Panel(bag, [x0, H, z1], [1, 0, 0], [0, 0, -1], [0, -1, 0]);
  ceil.rect(PAL.green2, 0, 0, x1 - x0, 23, 0); ceil.rect(PAL.red, 0, 0, x1 - x0, 0.5, 1); ceil.rect(PAL.red, 0, 22.5, x1 - x0, 23, 1); ceil.flush();
  // the long walls: paintings in three bands, apsaras high up; the back wall behind the Buddha is covered by him
  for (const [a, b, n] of [[[x0, z0], [x1, z0], [0, 1]], [[x1, z1], [x0, z1], [0, -1]]]) {
    const P = wallPanel(bag, a, b, y, n, 0.06), L = P.len;
    P.rect(PAL.black, 0, 0, L, 1.0, 1);
    friezeM(P, 0, L, 1.0, 1.4, 1, 0);
    tableauM(P, 2.0, 1.8, L - 2.0, 11.6, 31 + Math.round(a[0]), 2);
    friezeM(P, 0, L, 12.0, 12.6, 1, 1);
    thousandM(P, 0.4, 13, L - 0.4, 28, 2, 61 + Math.round(a[0]), 0.9);
    for (let k = 0; k < 5; k++) apsaraM(P, 3 + k * 4.6, 31.5 + (k % 2) * 1.8, 2.2, k % 2 ? 1 : -1, { scarf: k % 2 ? PAL.red : PAL.white }, 3);
    friezeM(P, 0, L, 36, 36.8, 1, 2);
    P.flush();
  }
  // the Maitreya: seated with the feet down, the chinese style's pendant-legged Buddha built at 5.2 and scaled to 33
  // (square sumeru seat 11.4 m across, the thighs forward, shins and lotus footrests on the floor). Set back so that the
  // lobby between the footrests (cx + 10.9) and the doorway stays clear.
  const cx = XF - 17.5;
  buddha({ at: [cx, 0], y, h: 33.0, dir: [1, 0], robe: 'clay_robe', pendant: true }, ctx);
  // collision follows the seat, the shins (z ±2.7…2.9, x cx + 6.9…7.4, r ≈ 1.4) and the footrests (cx + 8.1, z ±2.9, r 2.7)
  col.rect([cx - 5.8, -5.8, cx + 5.8, 5.8], y, H);
  col.rect([cx + 5.7, -3.4, cx + 7.6, 3.4], y, y + 13);
  for (const k of [-1, 1]) { col.circle(cx + 7.1 * 1.0, k * 2.8, 1.6, y, y + 13); col.circle(cx + 8.1, k * 2.9, 2.7, y, y + 2.4); }
  // before him: a bronze censer on a stone stand between two offering tables, the oil lamps behind them
  const ix = XF - 4.6;
  bag.add('granite_grey', lathe([[0.001, 0], [0.62, 0], [0.6, 0.16], [0.46, 0.22], [0.42, 0.7], [0.5, 0.78], [0.001, 0.8]], 12, null, ix, y, 0));
  bag.add('bronze', lathe([[0.001, 0.8], [0.34, 0.82], [0.46, 1.0], [0.44, 1.28], [0.3, 1.36], [0.34, 1.42], [0.001, 1.42]], 14, (th) => 1 + 0.04 * Math.abs(Math.cos(th * 4)), ix, y, 0));
  for (const k of [0, 1, 2]) { const a = k * 2.094 + 0.5; bag.add('bronze', rod([ix + Math.cos(a) * 0.4, y + 1.2, Math.sin(a) * 0.4], [ix + Math.cos(a) * 0.5, y + 0.82, Math.sin(a) * 0.5], 0.05, 6)); }
  col.circle(ix, 0, 0.62, y, y + 1.4);
  for (const z of [-3.6, 3.6]) {
    bag.add('timber_red', box(ix - 0.4, y + 0.74, z - 0.9, ix + 0.4, y + 0.82, z + 0.9));
    for (const [dx, dz] of [[-0.34, -0.84], [0.34, -0.84], [-0.34, 0.84], [0.34, 0.84]]) bag.add('timber_red', box(ix + dx - 0.05, y, z + dz - 0.05, ix + dx + 0.05, y + 0.74, z + dz + 0.05));
    bag.add('lacquer_red', box(ix - 0.42, y + 0.62, z - 0.92, ix + 0.42, y + 0.74, z + 0.92));
    col.rect([ix - 0.42, z - 0.92, ix + 0.42, z + 0.92], y, y + 0.82);
    for (let j = -2; j <= 2; j++) { bag.add('clay_gilt', lathe([[0.001, 0], [0.1, 0.02], [0.12, 0.08], [0.06, 0.13], [0.001, 0.13]], 8, null, ix, y + 0.82, z + j * 0.34)); }
  }
  // (the lotus throne is replaced by the sumeru seat above)
  // the front wall of the rock hall: plastered round the great doorway and the high window
  for (const [zA, zB, yA, yB] of [[-11.5, -7, y, H], [7, 11.5, y, H], [-7, 7, 20, 27], [-7, -3.2, 27, H], [3.2, 7, 27, H], [-7, 7, 37, H]]) bag.add('lime_plaster', box(XF - 1.0 - t, yA, zA, XF - 1.0, yB, zB));
  // lamps in the lobby between the doorway and the throne: a row of stands, and a few hanging high
  for (const z of [-5.5, -2.8, 0, 2.8, 5.5]) oilLamp(ctx, XF - 3.2, y, z, 1.1, 3.0, 11);
  for (const [x, yy, z] of [[XF - 6, 10, -6], [XF - 6, 10, 6], [XF - 7, 22, 0], [XF - 8, 31, 0], [XF - 6, 30, -4], [XF - 6, 30, 4]]) ctx.lights?.push({ at: [x, yy, z], color: '#ffd2a0', intensity: 5, distance: 18 });
  void c; void lotusM; void quad; void fromTriangles; void lathe; void rod;
}

// ── the building ──
export const LV = (() => {
  const L = []; let y = FLOOR[0];
  const hs = [8.2, 5.2, 4.3, 4.2, 4.1, 4.0, 3.9, 3.8, 3.7];
  for (let k = 0; k < 9; k++) L.push({ k, y, h: hs[k], w: 13 - 1.0 * k, d: 9.5 - 0.75 * k }), y += hs[k] + 0.12;
  return L;
})();
/** The stair from storey k−1 to k: a strip along the front inside the columns, rising along z (odd k: from the north end, even k: from the south end). */
export function nineStair(k) {
  const a = LV[k - 1], b = LV[k], rise = b.y - a.y, L = Math.min(rise * 1.7, 2 * a.w - 3), dir = k % 2 ? 1 : -1;
  const x1 = XF + b.d - 0.7, x0 = x1 - 1.5, zS = dir > 0 ? -a.w + 1.0 : a.w - 1.0, zT = zS + dir * L;
  const hole = dir > 0 ? [x0, zT - 2.2 * L / rise, x1, zT] : [x0, zT, x1, zT - 2.2 * L / rise * -1];
  return { x0, x1, zS, zT, dir, rise, L, y0: a.y, y1: b.y, hole: [hole[0], Math.min(hole[1], hole[3]), hole[2], Math.max(hole[1], hole[3])] };
}
export const NINE_TOP = LV[8].y + LV[8].h + 2.5;

const smoothS = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
/**
 * A tiled eave round three sides of a storey's top (dossier §13): an inner flat deck at y, a sloping skirt out and down
 * to a rim that rises about half a metre at the two front corners and at the wings' outer ends (the flying corners of the
 * Tang eave), a fascia board and a row of round rafter heads along the rim, hip ridges to a finial at each corner, a bell
 * on each lifted tip. The rim is sampled every ~0.8 m so that the skirt is a warped surface, not three flat quads.
 */
function eave(ctx, x0, x1, z0, z1, y, out, drop, lift = 0.5, acc = null) {
  const { bag } = ctx;
  // three runs: north wing (A→D along +x), front (D→C along +z), south wing (C→B along −x); inner points on the wall line, outer on the rim
  const runs = [
    { I: [x0, z0], I2: [x1, z0], O: [x0, z0 - out], O2: [x1 + out, z0 - out], c1: true },
    { I: [x1, z0], I2: [x1, z1], O: [x1 + out, z0 - out], O2: [x1 + out, z1 + out], c0: true, c1: true },
    { I: [x1, z1], I2: [x0, z1], O: [x1 + out, z1 + out], O2: [x0, z1 + out], c0: true },
  ];
  const rimY = (e) => y - drop + lift * (1 - smoothS(0, 3.2, e));         // e: distance along the rim from the nearest lifted corner
  const up = [], dn = [], rim = [], rimP = [], lw = (p) => [p[0], p[1] - 0.24, p[2]];
  for (const R of runs) {
    const L = Math.hypot(R.O2[0] - R.O[0], R.O2[1] - R.O[1]), n = Math.max(2, Math.round(L / 0.8)), P = [], Q = [];
    for (let k = 0; k <= n; k++) {
      const t = k / n, e = Math.min(R.c0 ? t * L : 1e9, R.c1 ? (1 - t) * L : 1e9);
      P.push([R.I[0] + (R.I2[0] - R.I[0]) * t, y, R.I[1] + (R.I2[1] - R.I[1]) * t]);
      Q.push([R.O[0] + (R.O2[0] - R.O[0]) * t, e > 1e8 ? y - drop : rimY(e), R.O[1] + (R.O2[1] - R.O[1]) * t]);
    }
    for (let k = 0; k < n; k++) { quad(up, P[k], P[k + 1], Q[k + 1], Q[k]); quad(dn, lw(Q[k]), lw(Q[k + 1]), lw(P[k + 1]), lw(P[k])); }
    rim.push(Q); rimP.push(P);
  }
  quad(up, [x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]);              // the inner deck
  const flip = (t, upward) => {
    const o = [];
    for (let i = 0; i < t.length; i += 9) {
      const ux = t[i + 3] - t[i], uz = t[i + 5] - t[i + 2], vx = t[i + 6] - t[i], vz = t[i + 8] - t[i + 2], ny = uz * vx - ux * vz;
      if ((ny >= 0) === upward) o.push(...t.slice(i, i + 9)); else o.push(...t.slice(i, i + 3), ...t.slice(i + 6, i + 9), ...t.slice(i + 3, i + 6));
    }
    return o;
  };
  bag.add('tile_grey', fromTriangles(flip(up, true)));
  bag.add('timber_red', fromTriangles(flip(dn, false)));
  // fascia (a board 0.34 high along the rim, both faces) and the round rafter heads below it
  const fas = [];
  for (const Q of rim) for (let k = 0; k < Q.length - 1; k++) {
    const a = Q[k], b = Q[k + 1], a0 = [a[0], a[1] - 0.34, a[2]], b0 = [b[0], b[1] - 0.34, b[2]], a1 = [a[0], a[1] + 0.04, a[2]], b1 = [b[0], b[1] + 0.04, b[2]];
    quad(fas, a0, b0, b1, a1); quad(fas, a1, b1, b0, a0);
  }
  bag.add('lacquer_red', fromTriangles(fas));
  // the rafter heads: square-ended beams standing out 0.14 m from the fascia, two to a sample
  rim.forEach((Q, ri) => {
    const o = ri === 0 ? [0, -1] : ri === 1 ? [1, 0] : [0, 1];
    for (let k = 0; k < Q.length - 1; k++) for (const f of [0.25, 0.75]) {
      const a = Q[k], b = Q[k + 1], px = a[0] + (b[0] - a[0]) * f, pz = a[2] + (b[2] - a[2]) * f, py = a[1] + (b[1] - a[1]) * f - 0.17;
      const qx = px + o[0] * 0.14, qz = pz + o[1] * 0.14;
      bag.add('lacquer_black', box(Math.min(px, qx) - (o[0] ? 0 : 0.045), py - 0.045, Math.min(pz, qz) - (o[1] ? 0 : 0.045), Math.max(px, qx) + (o[0] ? 0 : 0.045), py + 0.045, Math.max(pz, qz) + (o[1] ? 0 : 0.045)));
    }
  });
  // cover-tile rolls down the skirt with a round end disc each (dossier §14)
  rimP.forEach((P, ri) => skirtRolls(acc, P, rim[ri], ri === 0 ? [0, -1] : ri === 1 ? [1, 0] : [0, 1]));
  // hip ridges from the inner corners to the lifted tips, a finial on each tip and its bell below
  const corners = [[[x1, z0], rim[0][rim[0].length - 1]], [[x1, z1], rim[2][0]]];
  for (const [I, T] of corners) {
    bag.add('tile_grey', rod([I[0], y + 0.07, I[1]], [T[0], T[1] + 0.07, T[2]], 0.1, 6));
    bag.add('gilt_bronze', lathe([[0.001, 0], [0.11, 0.0], [0.07, 0.14], [0.1, 0.26], [0.001, 0.4]], 8, null, T[0], T[1] + 0.02, T[2]));
    bag.add('bronze', lathe([[0.001, 0], [0.09, 0.04], [0.1, 0.16], [0.001, 0.2]], 8, null, T[0] - 0.1, T[1] - 0.78, T[2] + Math.sign(T[2]) * -0.1));
  }
}
/** A stepped bracket set (dougong) on the column at (xc, zc), its foot at yb, scaled by k: a block, then two tiers of arms along x and z, each tier reaching further. */
export function bracketSet(ctx, xc, zc, yb, k = 1) {
  const { bag } = ctx, B = (m, ax, ay, az, bx, by, bz) => bag.add(m, box(xc + ax * k, yb + ay * k, zc + az * k, xc + bx * k, yb + by * k, zc + bz * k));
  B('timber_red', -0.22, 0, -0.22, 0.22, 0.28, 0.22);                              // the block on the column
  B('timber_red', -0.25, 0.28, -0.09, 0.55, 0.48, 0.09);                           // tier 1, forward
  B('timber_red', -0.1, 0.28, -0.6, 0.1, 0.48, 0.6);                               // tier 1, across
  B('timber_red', -0.1, 0.48, -0.09, 0.95, 0.68, 0.09);                            // tier 2, forward
  B('timber_red', -0.1, 0.48, -0.85, 0.1, 0.68, 0.85);                             // tier 2, across
  for (const sgn of [-1, 1]) B('paint_ochre', -0.1, 0.48, sgn * 0.5 - 0.1, 0.1, 0.68, sgn * 0.5 + 0.1);   // the small blocks on the arm ends
  B('paint_ochre', 0.5, 0.48, -0.1, 0.7, 0.68, 0.1);
}

export function nineStorey(ctx) {
  const { bag, col } = ctx, acc = new Acc();
  LV.forEach((s, i) => {
    const x0 = XF, x1 = XF + s.d, z0 = -s.w, z1 = s.w, y = s.y, top = y + s.h;
    const bays = Math.max(3, Math.round((2 * s.w) / 3.6) | 1), bw = (2 * s.w) / bays;
    // the platform (floor) and the front's columns, a beam under the eave, the infill: plastered panels with lattice windows
    if (i >= 1) {
      const holes = [nineStair(i).hole], pieces = [];
      if (i <= 3) pieces.push([x0 + 3.5, z0, x1, z1], [x0, z0, x0 + 3.5, -6.8], [x0, 6.8, x0 + 3.5, z1]); else pieces.push([x0, z0, x1, z1]);
      for (const pc of pieces) for (const r of subtractRects(pc, holes)) { bag.add('timber', box(r[0], y - 0.12, r[1], r[2], y, r[3])); col.floor(r, y); }
      // the stair up from this storey to the next: treads on a pair of strings, a rail on the open side
      if (i < 8) {
        const st = nineStair(i + 1), n = Math.round(st.L / 0.3);
        for (let q = 0; q < n; q++) { const za = st.zS + st.dir * q * st.L / n, zb = st.zS + st.dir * (q + 1) * st.L / n, h = st.y0 + st.rise * (q + 1) / n; bag.add('timber', box(st.x0, h - 0.06, Math.min(za, zb), st.x1, h, Math.max(za, zb))); }
        col.ramp([st.x0, Math.min(st.zS, st.zT), st.x1, Math.max(st.zS, st.zT)], st.y0 + 0.05, st.y1, st.dir > 0 ? 's' : 'n');
        for (const xr of [st.x0 - 0.04, st.x1 + 0.04]) bag.add('timber_red', rod([xr, st.y0 + 1.0, st.zS], [xr, st.y1 + 1.0, st.zT], 0.04, 5));
      }
    }
    if (i === 0) {
      { const st = nineStair(1), n = Math.round(st.L / 0.3); for (let q = 0; q < n; q++) { const za = st.zS + st.dir * q * st.L / n, zb = st.zS + st.dir * (q + 1) * st.L / n, h = st.y0 + st.rise * (q + 1) / n; bag.add('timber', box(st.x0, h - 0.06, Math.min(za, zb), st.x1, h, Math.max(za, zb))); } col.ramp([st.x0, Math.min(st.zS, st.zT), st.x1, Math.max(st.zS, st.zT)], st.y0 + 0.05, st.y1, st.dir > 0 ? 's' : 'n'); for (const xr of [st.x0 - 0.04, st.x1 + 0.04]) bag.add('timber_red', rod([xr, st.y0 + 1.0, st.zS], [xr, st.y1 + 1.0, st.zT], 0.04, 5)); }
      bag.add('flagstone', box(x0, y - 0.3, z0 + 0.5, x1 + 0.6, y, z1 - 0.5));
      col.floor([x0, z0 + 0.5, x1 + 0.6, z1 - 0.5], y);
    }
    for (let b = 0; b <= bays; b++) {
      const z = z0 + b * bw;
      bag.add('timber_red', lathe([[0.3, 0], [0.3, 0.12], [0.25, 0.2], [0.23, s.h - 0.5], [0.26, s.h]], 10, null, x1 - 0.3, y, z));
      if (i === 0) bag.add('granite_grey', lathe([[0.001, 0], [0.52 * jit(), 0], [0.52, 0.1], [0.46, 0.16], [0.5, 0.24], [0.4, 0.3], [0.33, 0.34], [0.001, 0.34]], 12, null, x1 - 0.3, y, z));     // the lotus plinth
      if (i > 0 || b % 2 === 0) { corbel(acc, x1 - 0.3, top - 0.6, z, 1); corbel(acc, x1 - 0.3, top - 0.6, z, -1); }
      if (i === 0 || b % 2 === 0) col.circle(x1 - 0.3, z, 0.28, y, top);
      if (i > 0 || b === 0 || b === bays) bag.add('timber_red', box(x0, y, z - 0.25, x1 - 0.3, top, z + 0.25));     // the side walls' frames
    }
    bag.add('timber_red', box(x1 - 0.55, top - 0.6, z0 - 0.3, x1 + 0.05, top, z1 + 0.3));
    // brackets: a stepped set on every column and a "human-shaped" brace and a painted band on every bay's beam
    for (let b = 0; b <= bays; b++) bracketSet(ctx, x1 - 0.3, z0 + b * bw, top - 1.28);
    for (let b = 0; b < bays; b++) {
      const zm = z0 + (b + 0.5) * bw, za = z0 + b * bw, zb = za + bw;
      for (const k of [-1, 1]) bag.add('timber_red', rod([x1 + 0.09, top - 0.62, zm + k * 0.5], [x1 + 0.09, top - 0.12, zm], 0.05, 5));
      bag.add('paint_blue', box(x1 + 0.05, top - 0.5, za + 0.3, x1 + 0.075, top - 0.14, za + 0.8)); bag.add('clay_green', box(x1 + 0.05, top - 0.5, zb - 0.8, x1 + 0.075, top - 0.14, zb - 0.3));
    }
    bag.add('paint_ochre', box(x1 + 0.05, top - 0.57, z0 - 0.3, x1 + 0.075, top - 0.53, z1 + 0.3)); bag.add('paint_ochre', box(x1 + 0.05, top - 0.1, z0 - 0.3, x1 + 0.075, top - 0.06, z1 + 0.3));
    if (i > 0) {
      const fields = [];
      for (let b = 0; b < bays; b++) {
        const za = z0 + b * bw + 0.3, zb = z0 + (b + 1) * bw - 0.3, mid = (za + zb) / 2;
        bag.add('lime_plaster', box(x1 - 0.5, y + 0.0, za, x1 - 0.3, y + 1.0, zb));
        bag.add('lattice', box(x1 - 0.5, y + 1.0, mid - 0.9, x1 - 0.42, top - 0.7, mid + 0.9));
        bag.add('lime_plaster', box(x1 - 0.5, y + 1.0, za, x1 - 0.3, top - 0.7, mid - 0.9));
        bag.add('lime_plaster', box(x1 - 0.5, y + 1.0, mid + 0.9, x1 - 0.3, top - 0.7, zb));
        bag.add('lime_plaster', box(x1 - 0.5, top - 0.7, za, x1 - 0.3, top - 0.6, zb));
        windowBars(acc, x1 - 0.39, mid, 0.9, y + 1.0, top - 0.7);
        // the apron panel: a red frame on the plaster with a green field
        bag.add('lacquer_red', box(x1 - 0.31, y + 0.08, za + 0.12, x1 - 0.29, y + 0.14, zb - 0.12)); bag.add('lacquer_red', box(x1 - 0.31, y + 0.86, za + 0.12, x1 - 0.29, y + 0.92, zb - 0.12));
        bag.add('lacquer_red', box(x1 - 0.31, y + 0.14, za + 0.12, x1 - 0.29, y + 0.86, za + 0.18)); bag.add('lacquer_red', box(x1 - 0.31, y + 0.14, zb - 0.18, x1 - 0.29, y + 0.86, zb - 0.12));
        fields.push(...trisOf(box(x1 - 0.31, y + 0.14, za + 0.18, x1 - 0.295, y + 0.86, zb - 0.18)));      }
      bag.add('clay_green', fromTriangles(fields));
      // the deck's rail
      balustrade(acc, x1 + 0.65, y - 0.12, z0 - 0.5, z1 + 0.5);
    } else {
      // the lowest storey: the doorway into the hall, a great painted lintel; blind side bays of plaster
      bag.add('lacquer_red', box(x0, y + s.h - 1.6, z0, x0 + 0.5, top, z1));
      bag.add('lime_plaster', box(x0, y, z0, x0 + 0.5, y + s.h - 1.6, -7.5)); bag.add('lime_plaster', box(x0, y, 7.5, x0 + 0.5, y + s.h - 1.6, z1));
      col.rect([x0, z0, x0 + 0.5, -7.5], y, top); col.rect([x0, 7.5, x0 + 0.5, z1], y, top);
    }
    eave(ctx, x0, x1 + 0.2, z0, z1, top, 2.2, 0.95, 0.5, acc);
    // the deck over the eave: the next storey's platform (tile) — drawn by the next level
  });
  // the crowning roof: a hip over the top storey with a ridge along z, hip ridges, end finials and the gilt finial on the ridge
  const s = LV[8], yc = s.y + s.h, xb = XF + s.d + 0.2, zw = s.w, rise = 2.2, xr = XF + 1.3, zr = zw - 2.2, yr = yc + rise;
  {
    const t = [], A = [XF, yc, -zw], D = [xb, yc, -zw], C = [xb, yc, zw], B = [XF, yc, zw], R0 = [xr, yr, -zr], R1 = [xr, yr, zr];
    const tri = (a, b, c) => t.push(...a, ...b, ...c);
    // each face wound to look outward: front, back, north hip, south hip (and their reverse so that no side is culled)
    for (const [p, q, r2] of [[D, C, R1], [D, R1, R0], [A, R0, R1], [A, R1, B], [A, D, R0], [C, B, R1]]) { tri(p, q, r2); tri(p, r2, q); }
    bag.add('tile_grey', fromTriangles(t));
    bag.add('roof_ridge', box(xr - 0.18, yr - 0.02, -zr - 0.1, xr + 0.18, yr + 0.3, zr + 0.1));
    for (const [I, T] of [[D, R0], [A, R0], [C, R1], [B, R1]]) bag.add('roof_ridge', rod([I[0], I[1] + 0.05, I[2]], [T[0], T[1] + 0.12, T[2]], 0.11, 6));
    const mix = (a, b, f) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
    for (let k = 0; k <= 15; k++) { const f = (k + 0.5) / 16; tileRoll(acc, mix(R0, R1, f), mix(D, C, f), [1, 0]); }
    for (const [E0, E1, Rt, dir] of [[A, D, R0, [0, -1]], [B, C, R1, [0, 1]]]) for (let k = 0; k < 5; k++) { const f = (k + 0.5) / 5; tileRoll(acc, mix(Rt, E0, 0.04), mix(E0, E1, f * 0.97), [dir[0] * 0.3 + (E1[0] - E0[0]) * 0, dir[1]]); }
    for (const z of [-zr, zr]) { chiwen(acc, xr, yr + 0.3, z, Math.sign(z), 1.0); }   // the owl-tail ridge ends
    bag.add('gilt_bronze', lathe([[0.001, 0], [0.4, 0], [0.25, 0.3], [0.4, 0.6], [0.08, 1.1], [0.001, 1.4]], 10, null, xr, yr + 0.3, 0));
  }
  acc.flush(bag);
  // painted cloth banners and a lamp at the porch
  for (const z of [-9, 9]) { bag.add('cloth_red', box(XF + 9.9, FLOOR[0] + 4.5, z - 0.35, XF + 9.95, FLOOR[0] + 7.5, z + 0.35)); }
}
