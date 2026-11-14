// Cave 96: the Great Buddha's hall cut in the rock (the Maitreya, 35.5 m, seated, made in 695) and the
// Nine-Storey building of timber that stands against the cliff over its face (docs/settlements/dunhuang.md §4).
import { box, lathe, fromTriangles, quad, rod } from '../../core/geom.js';
import { subtractRects } from '../../core/build.js';
import { buddha } from '../chinese/index.js';
import { XF, FLOOR } from '../../settlements/dunhuang/layout.js';
import { Panel, wallPanel, PAL, tableauM, friezeM, apsaraM, lotusM, thousandM } from './paint.js';
import { oilLamp } from './caves.js';

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
  // the Buddha (h 34 on a throne of lotus petals); the chinese style's Buddha is built at 5.2 m and scaled
  const cx = XF - 14;
  buddha({ at: [cx, 0], y, h: 33.0, dir: [1, 0], robe: 'clay_robe' }, ctx);
  // (the lotus throne is round: a circle follows it, a rectangle left four corners of air)
  col.circle(cx, 0, 9.6, y, H);
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

/** A tiled eave round three sides of a storey's top: an inner flat deck, a sloping skirt out and down, a fascia, soffit, bells at the corners. */
function eave(ctx, x0, x1, z0, z1, y, out, drop) {
  const { bag } = ctx;
  const A = [x0, y, z0], B = [x0, y, z1], C = [x1, y, z1], D = [x1, y, z0];
  const up = [], dn = [];
  const A2 = [x0, y - drop, z0 - out], B2 = [x0, y - drop, z1 + out], C2 = [x1 + out, y - drop, z1 + out], D2 = [x1 + out, y - drop, z0 - out];
  const flip = (t, upward) => {
    const o = [];
    for (let i = 0; i < t.length; i += 9) {
      const ux = t[i + 3] - t[i], uz = t[i + 5] - t[i + 2], vx = t[i + 6] - t[i], vz = t[i + 8] - t[i + 2], ny = uz * vx - ux * vz;
      if ((ny >= 0) === upward) o.push(...t.slice(i, i + 9)); else o.push(...t.slice(i, i + 3), ...t.slice(i + 6, i + 9), ...t.slice(i + 3, i + 6));
    }
    return o;
  };
  const Q = (a, b, c, d) => { const t = []; quad(t, a, b, c, d); return t; };
  up.push(...Q(D, C, C2, D2), ...Q(A, D, D2, A2), ...Q(C, B, B2, C2), ...Q(A, D, C, B));
  const lower = (p) => [p[0], p[1] - 0.24, p[2]];
  dn.push(...Q(lower(D2), lower(C2), lower(C), lower(D)), ...Q(lower(A2), lower(D2), lower(D), lower(A)), ...Q(lower(C2), lower(B2), lower(B), lower(C)));
  bag.add('tile_grey', fromTriangles(flip(up, true)));
  bag.add('timber_red', fromTriangles(flip(dn, false)));
  // ridges along the three hips, the fascia round the rim
  bag.add('timber_red', box(D2[0] - 0.12, D2[1] - 0.34, D2[2], C2[0], D2[1] - 0.05, C2[2]));
  bag.add('timber_red', box(A2[0], A2[1] - 0.34, A2[2] - 0.12, D2[0], A2[1] - 0.05, A2[2]));
  bag.add('timber_red', box(B2[0], B2[1] - 0.34, B2[2], C2[0], B2[1] - 0.05, B2[2] + 0.12));
  for (const [p, q] of [[D2, C2], [A2, D2], [B2, C2]]) {
    const n = Math.max(2, Math.round(Math.hypot(q[0] - p[0], q[2] - p[2]) / 1.0));
    for (let k = 1; k < n; k++) { const f = k / n; bag.add('lacquer_black', box(p[0] + (q[0] - p[0]) * f - 0.05, p[1] - 0.06, p[2] + (q[2] - p[2]) * f - 0.05, p[0] + (q[0] - p[0]) * f + 0.05, p[1] + 0.02, p[2] + (q[2] - p[2]) * f + 0.05)); void 0; }
  }
  for (const p of [D2, C2, A2, B2]) if (p[0] > x0 + 1) bag.add('bronze', lathe([[0.001, 0], [0.09, 0.04], [0.1, 0.16], [0.001, 0.2]], 8, null, p[0] - 0.1, p[1] - 0.78, p[2] + Math.sign(p[2]) * -0.1));
}

export function nineStorey(ctx) {
  const { bag, col } = ctx;
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
      if (i === 0 || b % 2 === 0) col.circle(x1 - 0.3, z, 0.28, y, top);
      if (i > 0 || b === 0 || b === bays) bag.add('timber_red', box(x0, y, z - 0.25, x1 - 0.3, top, z + 0.25));     // the side walls' frames
    }
    bag.add('timber_red', box(x1 - 0.55, top - 0.6, z0 - 0.3, x1 + 0.05, top, z1 + 0.3));
    // brackets: on every column two arms and a block
    for (let b = 0; b <= bays; b++) { const z = z0 + b * bw; for (let k = 0; k < 2; k++) bag.add('timber_red', box(x1 - 0.5 + k * 0.4, top - 0.9 + k * 0.1, z - 0.13, x1 + 0.55 + k * 0.35, top - 0.72 + k * 0.1, z + 0.13)); }
    if (i > 0) {
      for (let b = 0; b < bays; b++) {
        const za = z0 + b * bw + 0.3, zb = z0 + (b + 1) * bw - 0.3, mid = (za + zb) / 2;
        bag.add('lime_plaster', box(x1 - 0.5, y + 0.0, za, x1 - 0.3, y + 1.0, zb));
        bag.add('lattice', box(x1 - 0.5, y + 1.0, mid - 0.9, x1 - 0.42, top - 0.7, mid + 0.9));
        bag.add('lime_plaster', box(x1 - 0.5, y + 1.0, za, x1 - 0.3, top - 0.7, mid - 0.9));
        bag.add('lime_plaster', box(x1 - 0.5, y + 1.0, mid + 0.9, x1 - 0.3, top - 0.7, zb));
        bag.add('lime_plaster', box(x1 - 0.5, top - 0.7, za, x1 - 0.3, top - 0.6, zb));
      }
      // the deck's rail
      bag.add('timber_red', box(x1 + 0.6, y + 0.9, z0 - 0.5, x1 + 0.7, y + 1.0, z1 + 0.5));
    } else {
      // the lowest storey: the doorway into the hall, a great painted lintel; blind side bays of plaster
      bag.add('lacquer_red', box(x0, y + s.h - 1.6, z0, x0 + 0.5, top, z1));
      bag.add('lime_plaster', box(x0, y, z0, x0 + 0.5, y + s.h - 1.6, -7.5)); bag.add('lime_plaster', box(x0, y, 7.5, x0 + 0.5, y + s.h - 1.6, z1));
      col.rect([x0, z0, x0 + 0.5, -7.5], y, top); col.rect([x0, 7.5, x0 + 0.5, z1], y, top);
    }
    eave(ctx, x0, x1 + 0.2, z0, z1, top, 2.2, 0.95);
    // the deck over the eave: the next storey's platform (tile) — drawn by the next level
  });
  // the crowning roof: a hipped cap and a gilt finial
  const s = LV[8], yc = s.y + s.h + 0.0;
  bag.add('tile_grey', box(XF, yc + 0.0, -s.w + 0.4, XF + s.d - 0.4, yc + 0.5, s.w - 0.4));
  bag.add('gilt_bronze', lathe([[0.001, 0], [0.5, 0], [0.3, 0.4], [0.5, 0.9], [0.1, 1.9], [0.001, 2.4]], 10, null, XF + s.d / 2, yc + 0.5, 0));
  // painted cloth banners and a lamp at the porch
  for (const z of [-9, 9]) { bag.add('cloth_red', box(XF + 9.9, FLOOR[0] + 4.5, z - 0.35, XF + 9.95, FLOOR[0] + 7.5, z + 0.35)); }
}
