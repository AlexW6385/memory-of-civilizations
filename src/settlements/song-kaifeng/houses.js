// The houses of Northern Song Bianjing (docs/settlements/song-kaifeng.md §11): what the Qingming scroll and the
// Dongjing meng hua lu show of the commoners' buildings — shop fronts open between timber posts with a counter,
// two-storey shops and restaurants with a balcony (pingzuo) and lattice windows under deep eaves, mat awnings (liangpeng)
// and wine flags over the street, inns round a courtyard behind a gate bay, grain warehouses with wide doors, tiled
// houses with plastered fronts, thatched cottages of mud and wattle in the suburb and farmsteads in the country.
// Roofs of grey tile in a shallow concave profile (overhanging gables, bargeboards and the hanging fish, xuanyu),
// hipped for the larger ones; thatch thick and steep. Local frame: a along the front, b from the street (0) back.

import { box, fromTriangles, lathe, addCloth, clothBox } from '../../core/geom.js';
import { inLot } from './layout.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const pick = (r, a) => a[Math.floor(r() * a.length)];

/** Goods by trade: the colours of the things on the shelves (materials of the palette) and a kind of shelf. */
const GOODS = {
  cloth: { items: ['cloth_indigo', 'cloth_white', 'cloth_red', 'cloth_ochre', 'cloth_green'], shape: 'bolts' },
  grain: { items: ['sacking', 'sacking', 'wicker'], shape: 'sacks' },
  tea: { items: ['pottery_dark', 'glaze_green', 'pottery_dark'], shape: 'jars' },
  medicine: { items: ['wood_dark', 'lacquer_red', 'wood_dark'], shape: 'drawers' },
  pawn: { items: ['wood_dark', 'cloth_brown', 'cloth_grey'], shape: 'bolts' },
  books: { items: ['paint_white', 'cloth_indigo', 'paint_white'], shape: 'books' },
  incense: { items: ['wicker', 'cloth_red', 'reed_mat'], shape: 'sacks' },
  sweets: { items: ['wicker', 'glaze_white', 'terracotta'], shape: 'jars' },
  noodles: { items: ['iron', 'pottery_dark', 'wicker'], shape: 'jars' },
  pottery: { items: ['terracotta', 'pottery_dark', 'glaze_green', 'glaze_white'], shape: 'jars' },
  iron: { items: ['iron', 'iron', 'wood_dark'], shape: 'sacks' },
  oil: { items: ['pottery_dark', 'terracotta', 'pottery_dark'], shape: 'jars' },
  paper: { items: ['paint_white', 'lime_plaster', 'paint_white'], shape: 'books' },
  lanterns: { items: ['lamp_paper', 'cloth_red', 'lamp_paper'], shape: 'jars' },
  rope: { items: ['rope_fibre', 'wicker', 'rope_fibre'], shape: 'sacks' },
  bamboo: { items: ['bamboo_culm', 'bamboo_culm', 'wicker'], shape: 'sacks' },
  wine: { items: ['pottery_dark', 'terracotta', 'pottery_dark'], shape: 'jars' },
  rice: { items: ['sacking', 'sacking', 'wicker'], shape: 'sacks' },
  food: { items: ['iron', 'glaze_white', 'wicker'], shape: 'jars' },
  butcher: { items: ['cloth_red', 'wood_dark', 'cloth_white'], shape: 'bolts' },
  saddlery: { items: ['hide_brown', 'hide_black', 'iron'], shape: 'sacks' },
  lacquer: { items: ['lacquer_red', 'lacquer_black', 'glaze_white'], shape: 'jars' },
  inn: { items: ['pottery_dark', 'wicker', 'glaze_white'], shape: 'jars' },
};
/** The end of a shop's front at which its sign pole stands (shops.js): the house-frame position a (along the front, from its u-origin). */
export const poleA = (seed, L) => ((seed >> 2) & 1 ? 0.25 : L - 0.25);
const WALLS = ['plaster_white', 'plaster_white', 'plaster_grey', 'lime_plaster', 'plaster_damp'];
const FLAGS = ['cloth_indigo', 'cloth_white', 'cloth_indigo', 'cloth_red'];

/**
 * Where a lot's door is (the same draws as houseSong's, so the street's things can keep clear of it): the world point at the middle of the
 * door on the front line, and the door's clear half-width. Shops: the door bay (3 m or so); houses: the door (1.15 m).
 */
export function doorOf(l) {
  const [x0, z0, x1, z1] = l.foot, f = l.front, along = f === 'n' || f === 's', L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0;
  const ox = f === 's' ? x1 : f === 'n' ? x0 : f === 'e' ? x1 : x0, oz = f === 's' ? z1 : f === 'n' ? z0 : f === 'e' ? z0 : z1;
  const u = f === 's' ? [-1, 0] : f === 'n' ? [1, 0] : f === 'e' ? [0, 1] : [0, -1];
  const r = rng(l.seed || 1);
  r(); r();
  let a, hw;
  if (l.kind === 'house' || l.kind === 'thatch' || l.kind === 'farm') {
    const thatch = l.kind !== 'house';
    r(); if (thatch) r(); if (!(L >= D * 0.9)) r(); r();
    const nbays = Math.max(2, Math.round(L / 3.1));
    a = nbays % 2 ? L / 2 : L / 2 + (r() < 0.5 ? -1 : 1) * L * 0.2; hw = 0.6; void thatch;
  } else {
    const nb = Math.max(1, l.bays || Math.round(L / 3.3)), bw = L / nb;
    const db = nb === 1 ? 0 : (nb % 2 ? (nb - 1) / 2 : (r() < 0.5 ? nb / 2 - 1 : nb / 2));
    a = (db + 0.5) * bw; hw = Math.max(0.6, bw / 2 - 0.15);
  }
  return { at: [ox + u[0] * a, oz + u[1] * a], hw };
}

export function houseSong(el, { bag, col }) {
  const rand = rng(el.seed || 1);
  const [x0, z0, x1, z1] = el.foot, f = el.front || 's', kind = el.kind || 'house', det = el.det ?? 2;
  const along = f === 'n' || f === 's';
  const L = along ? x1 - x0 : z1 - z0, D = along ? z1 - z0 : x1 - x0;
  const ox = f === 's' ? x1 : f === 'n' ? x0 : f === 'e' ? x1 : x0, oz = f === 's' ? z1 : f === 'n' ? z0 : f === 'e' ? z0 : z1;
  const u = f === 's' ? [-1, 0] : f === 'n' ? [1, 0] : f === 'e' ? [0, 1] : [0, -1];
  const v = [-u[1], u[0]];
  const W = (a, b, y) => [ox + u[0] * a + v[0] * b, y, oz + u[1] * a + v[1] * b];
  const acc = new Map();
  const arr = (mat) => { let A = acc.get(mat); if (!A) acc.set(mat, A = []); return A; };
  /** A box in local coordinates (axis-aligned in the world as the fronts are). noB: leave out the bottom face. */
  const B = (mat, a0, b0, a1, b1, ya, yb, noB = true) => {
    const p = W(a0, b0, 0), q = W(a1, b1, 0), X0 = Math.min(p[0], q[0]), X1 = Math.max(p[0], q[0]), Z0 = Math.min(p[2], q[2]), Z1 = Math.max(p[2], q[2]);
    const A = arr(mat);
    const quad = (a, b, c, d) => A.push(...a, ...b, ...c, ...a, ...c, ...d);
    quad([X0, yb, Z0], [X0, yb, Z1], [X1, yb, Z1], [X1, yb, Z0]);
    // (a thing hung above head height gets its underside: without one the walker's collision field takes it for a solid mass down to the ground and one cannot walk under it)
    if (!noB || (ya > 1.2 && yb - ya < 1.6)) quad([X0, ya, Z0], [X1, ya, Z0], [X1, ya, Z1], [X0, ya, Z1]);
    quad([X0, ya, Z0], [X0, yb, Z0], [X1, yb, Z0], [X1, ya, Z0]);
    quad([X1, ya, Z0], [X1, yb, Z0], [X1, yb, Z1], [X1, ya, Z1]);
    quad([X1, ya, Z1], [X1, yb, Z1], [X0, yb, Z1], [X0, ya, Z1]);
    quad([X0, ya, Z1], [X0, yb, Z1], [X0, yb, Z0], [X0, ya, Z0]);
  };
  /** A polygon (world points) oriented to face `hint`. */
  const surf = (mat, pts, hint) => {
    const A = arr(mat);
    for (let i = 1; i + 1 < pts.length; i++) {
      let a = pts[0], b = pts[i], c = pts[i + 1];
      const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      if (nx * hint[0] + ny * hint[1] + nz * hint[2] < 0) { const t = b; b = c; c = t; }
      A.push(...a, ...b, ...c);
    }
  };
  const dirV = (s) => [s * v[0], 0, s * v[1]], dirU = (s) => [s * u[0], 0, s * u[1]];
  const UP = [0, 1, 0], DN = [0, -1, 0];
  // ---- colliders (world rectangles from local ones)
  const cRect = (a0, b0, a1, b1, ya, yb) => { const p = W(a0, b0, 0), q = W(a1, b1, 0); col.rect([Math.min(p[0], q[0]), Math.min(p[2], q[2]), Math.max(p[0], q[0]), Math.max(p[2], q[2])], ya, yb); };
  const cCircle = (a, b, r, ya, yb) => { const p = W(a, b, 0); col.circle(p[0], p[2], r, ya, yb); };
  /** A walkable floor at height y over a local rectangle (the room's floor, the plinth's top). */
  const cFloor = (a0, b0, a1, b1, y) => { const p = W(a0, b0, 0), q = W(a1, b1, 0); col.floor([Math.min(p[0], q[0]), Math.min(p[2], q[2]), Math.max(p[0], q[0]), Math.max(p[2], q[2])], y); };
  /** The room's ceiling: a slab of boards with its underside at yc, with joists across it (a0..a1 along the front, b0..b1 inward). */
  const ceiling = (a0, b0, a1, b1, yc) => {
    B('timber', a0, b0, a1, b1, yc, yc + 0.1, false);
    const n = Math.max(2, Math.round((a1 - a0) / 1.1));
    for (let k = 0; k <= n; k++) { const a = a0 + 0.12 + (a1 - a0 - 0.24) * k / n; B('wood_dark', a - 0.07, b0, a + 0.07, b1, yc - 0.16, yc, false); }
    B('wood_dark', a0, b0, a1, b0 + 0.14, yc - 0.2, yc, false);
  };

  // ---- a roof over an eave rectangle (s0..s1 along the ridge, t0..t1 across it), mapped by M(s, t, y)
  /** opts: yE (eave height), rise, p (profile exponent: >1 concave), th (thickness), mat, soffit, hip (ridge shortened by `hip` m at each end),
   *  w: the wall rectangle under it [s0, t0, s1, t1] (for the soffit and the gable ends), gableMat, fish, ridge ('tile'|'thatch'), n (rings) */
  const roof = (M, s0, s1, t0, t1, o) => {
    const tm = (t0 + t1) / 2, hb = (t1 - t0) / 2, yE = o.yE, rise = o.rise, p = o.p ?? 1.3, th = o.th ?? 0.16, mat = o.mat, N = o.n ?? (det >= 2 ? 5 : det === 1 ? 4 : 2);
    const prof = (t) => yE + rise * Math.pow(Math.max(0, 1 - Math.abs(t - tm) / hb), p);
    const hipI = o.hip || 0;
    const nrm = (hint) => hint;
    const up = UP;
    const P = (s, t, y) => M(s, t, y);
    if (!hipI) {
      for (const sg of [-1, 1]) {
        for (let i = 0; i < N; i++) {
          const ta = tm + sg * hb * (1 - i / N), tb = tm + sg * hb * (1 - (i + 1) / N);
          surf(mat, [P(s0, ta, prof(ta)), P(s1, ta, prof(ta)), P(s1, tb, prof(tb)), P(s0, tb, prof(tb))], up);
        }
        // the eave's fascia (the tile ends and the board under them)
        const te = tm + sg * hb;
        surf(mat, [P(s0, te, yE - th), P(s1, te, yE - th), P(s1, te, yE), P(s0, te, yE)], M(0, sg, 0).map((q, k) => q - M(0, 0, 0)[k]));
        // the rake's fascia: along the slope at both gable ends
        for (const [s, ss] of [[s0, -1], [s1, 1]]) for (let i = 0; i < N; i++) {
          const ta = tm + sg * hb * (1 - i / N), tb = tm + sg * hb * (1 - (i + 1) / N);
          surf(mat, [P(s, ta, prof(ta) - th), P(s, tb, prof(tb) - th), P(s, tb, prof(tb)), P(s, ta, prof(ta))], M(ss, 0, 0).map((q, k) => q - M(0, 0, 0)[k]));
          // under the overhang of the rake: the soffit sloping with the roof (from the gable wall's outer face to the rake)
          if (o.w) {
            const sw = ss < 0 ? o.w[0] : o.w[2];
            if (Math.abs(sw - s) > 0.05) surf(o.soffit || 'timber', [P(s, ta, prof(ta) - th), P(s, tb, prof(tb) - th), P(sw, tb, prof(tb) - th), P(sw, ta, prof(ta) - th)], DN);
          }
        }
        // under the eaves: a flat soffit from the eave to the wall line
        if (o.w) {
          const tw = sg < 0 ? o.w[1] : o.w[3];
          surf(o.soffit || 'timber', [P(s0, te, yE - th), P(s1, te, yE - th), P(s1, tw, yE - th), P(s0, tw, yE - th)], DN);
        }
      }
      // the ridge: a cap of half-round tiles, its ends turned up
      const yR = prof(tm);
      if (det >= 1) {
        const rw = o.ridge === 'thatch' ? 0.34 : 0.17, rh = o.ridge === 'thatch' ? 0.34 : 0.26;
        ridgeBox(M, o.ridgeMat || mat, s0 - 0.05, s1 + 0.05, tm - rw, tm + rw, yR - 0.02, yR + rh);
        if (det >= 2 && o.ridge !== 'thatch') for (const [s, ss] of [[s0 - 0.05, -1], [s1 + 0.05, 1]]) ridgeBox(M, o.ridgeMat || mat, s - (ss > 0 ? -0.0 : 0.0) + ss * 0.0, s + ss * 0.22, tm - 0.1, tm + 0.1, yR + rh - 0.02, yR + rh + 0.28);
      }
    } else {
      // hipped: the ridge from s0 + hip to s1 - hip; four panels from the eaves to it
      const r0 = s0 + hipI, r1 = s1 - hipI, yR = yE + rise;
      const E = [[s0, t0], [s1, t0], [s1, t1], [s0, t1]], Rg = [[r0, tm], [r1, tm], [r1, tm], [r0, tm]];
      const panels = [[E[0], E[1], Rg[1], Rg[0]], [E[1], E[2], Rg[1], Rg[1]], [E[2], E[3], Rg[3], Rg[2]], [E[3], E[0], Rg[3], Rg[3]]];
      for (const [e0, e1, q1, q0] of panels) {
        const hh = (k) => yE + rise * Math.pow(k, p);
        for (let i = 0; i < N; i++) {
          const k0 = i / N, k1 = (i + 1) / N, L2 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
          const a0 = L2(e0, q0, k0), a1 = L2(e1, q1, k0), b1 = L2(e1, q1, k1), b0 = L2(e0, q0, k1);
          const pts = [P(a0[0], a0[1], hh(k0)), P(a1[0], a1[1], hh(k0)), P(b1[0], b1[1], hh(k1))];
          if (Math.hypot(b1[0] - b0[0], b1[1] - b0[1]) > 0.01) pts.push(P(b0[0], b0[1], hh(k1)));
          surf(mat, pts, up);
        }
        // the fascia along the eave edge
        const out = (() => { const mx = (e0[0] + e1[0]) / 2 - (s0 + s1) / 2, mt = (e0[1] + e1[1]) / 2 - tm; return Math.abs(mx) * 0.2 > Math.abs(mt) ? [Math.sign(mx), 0] : [0, Math.sign(mt)]; })();
        surf(mat, [P(e0[0], e0[1], yE - th), P(e1[0], e1[1], yE - th), P(e1[0], e1[1], yE), P(e0[0], e0[1], yE)], (() => { const a = M(0, 0, 0), b = M(out[0], out[1], 0); return [b[0] - a[0], 0, b[2] - a[2]]; })());
      }
      if (o.w) {
        // a flat soffit under the eaves, the ring between the eave and the wall
        const [ws0, wt0, ws1, wt1] = o.w, y = yE - th, A = o.soffit || 'timber';
        surf(A, [P(s0, t0, y), P(s1, t0, y), P(s1, wt0, y), P(s0, wt0, y)], DN);
        surf(A, [P(s0, wt1, y), P(s1, wt1, y), P(s1, t1, y), P(s0, t1, y)], DN);
        surf(A, [P(s0, wt0, y), P(ws0, wt0, y), P(ws0, wt1, y), P(s0, wt1, y)], DN);
        surf(A, [P(ws1, wt0, y), P(s1, wt0, y), P(s1, wt1, y), P(ws1, wt1, y)], DN);
      }
      if (det >= 1) {
        const rw = o.ridge === 'thatch' ? 0.3 : 0.16;
        ridgeBox(M, o.ridgeMat || mat, r0 - 0.05, r1 + 0.05, tm - rw, tm + rw, yR - 0.03, yR + (o.ridge === 'thatch' ? 0.3 : 0.22));
        // the hip ridges
        if (det >= 2) for (const [ea, ra] of [[E[0], [r0, tm]], [E[3], [r0, tm]], [E[1], [r1, tm]], [E[2], [r1, tm]]]) hipRidge(M, o.ridgeMat || mat, ea, ra, yE, yR, p);
      }
    }
  };
  /** A box in a roof's frame (s along the ridge, t across): through M's corners. */
  const ridgeBox = (M, mat, s0, s1, t0, t1, ya, yb) => {
    const p = M(s0, t0, 0), q = M(s1, t1, 0), X0 = Math.min(p[0], q[0]), X1 = Math.max(p[0], q[0]), Z0 = Math.min(p[2], q[2]), Z1 = Math.max(p[2], q[2]);
    const A = arr(mat), quad = (a, b, c, d) => A.push(...a, ...b, ...c, ...a, ...c, ...d);
    quad([X0, yb, Z0], [X0, yb, Z1], [X1, yb, Z1], [X1, yb, Z0]);
    quad([X0, ya, Z0], [X0, yb, Z0], [X1, yb, Z0], [X1, ya, Z0]); quad([X1, ya, Z0], [X1, yb, Z0], [X1, yb, Z1], [X1, ya, Z1]);
    quad([X1, ya, Z1], [X1, yb, Z1], [X0, yb, Z1], [X0, ya, Z1]); quad([X0, ya, Z1], [X0, yb, Z1], [X0, yb, Z0], [X0, ya, Z0]);
  };
  /** A hip ridge: a thin ridge of tiles from the eave's corner up to the ridge's end. */
  const hipRidge = (M, mat, e, r, yE, yR, p) => {
    const n = 4, A = arr(mat);
    for (let i = 0; i < n; i++) {
      const k0 = i / n, k1 = (i + 1) / n, a = [e[0] + (r[0] - e[0]) * k0, e[1] + (r[1] - e[1]) * k0], b = [e[0] + (r[0] - e[0]) * k1, e[1] + (r[1] - e[1]) * k1];
      const pa = M(a[0], a[1], yE + (yR - yE) * Math.pow(k0, p) + 0.02), pb = M(b[0], b[1], yE + (yR - yE) * Math.pow(k1, p) + 0.02);
      // a thin box along the hip, 0.12 across, 0.14 high
      const dx = pb[0] - pa[0], dz = pb[2] - pa[2], l = Math.hypot(dx, dz) || 1, nx = -dz / l * 0.06, nz = dx / l * 0.06;
      const c = [[pa[0] + nx, pa[1], pa[2] + nz], [pa[0] - nx, pa[1], pa[2] - nz], [pb[0] - nx, pb[1], pb[2] - nz], [pb[0] + nx, pb[1], pb[2] + nz]];
      const t = c.map((q, k) => [q[0], q[1] + 0.14, q[2]]);
      const quad = (a1, b1, c1, d1) => A.push(...a1, ...b1, ...c1, ...a1, ...c1, ...d1);
      quad(t[0], t[1], t[2], t[3]); quad(c[0], t[0], t[3], c[3]); quad(c[1], c[2], t[2], t[1]); quad(c[0], c[1], t[1], t[0]); quad(c[3], t[3], t[2], c[2]);
    }
  };
  // map of a roof whose ridge runs along the front (s = a, t = b) or across it (s = b, t = a)
  const MA = (s, t, y) => W(s, t, y), MB = (s, t, y) => W(t, s, y);

  /** The wall's tone and the roof's tile. */
  const wall = pick(rand, WALLS), tile = rand() < 0.7 ? 'tile_grey' : 'tile_dark';
  const frame = det >= 2 ? 'timber' : 'wood_dark';
  const posts = (ys, yt, bb, step, mat = 'timber', w = 0.11) => {
    const n = Math.round(L / step);
    for (let k = 0; k <= n; k++) { const a = k === 0 ? w + 0.02 : k === n ? L - w - 0.02 : L * k / n; B(mat, a - w, bb - w, a + w, bb + w, ys, yt); }
  };

  // ---------------------------------------------------------------- the kinds
  const P0 = kind === 'thatch' || kind === 'farm' ? 0.14 : 0.28;     // the plinth's height
  const topY = [0];
  /**
   * Weathering of the plastered walls (docs/settlements/song-kaifeng.md §12): the darker foot of the wall where the rain splashes and the damp rises,
   * rain streaks hanging from the eaves, and a patch or two where the plaster has fallen to show the brick. Thin boxes 1-2 cm proud of the wall.
   * withFront: the front wall is plastered too (houses; the shops' fronts are open timber); avoid: [a0, a1] ranges of the front taken by door and window.
   */
  const weather = (yw, withFront, avoid = []) => {
    if (det < 1) return;
    const e = 0.012, dado = 0.5 + rand() * 0.45, dm = 'plaster_damp', st = 'plaster_streak';
    const ok = (a0, a1) => !avoid.some(([q0, q1]) => a1 > q0 && a0 < q1);
    B(dm, -e, 0.02, 0, D - 0.02, P0, P0 + dado); B(dm, L, 0.02, L + e, D - 0.02, P0, P0 + dado); B(dm, 0, D, L, D + e, P0, P0 + dado);
    if (withFront) for (const [a0, a1] of [[0.0, L]]) { const cuts = [...avoid].sort((p, q) => p[0] - q[0]); let c = a0; for (const [q0, q1] of cuts) { if (q0 - c > 0.2) B(dm, c, -e, q0, 0, P0, P0 + Math.min(dado, 0.9)); c = Math.max(c, q1); } if (a1 - c > 0.2) B(dm, c, -e, a1, 0, P0, P0 + Math.min(dado, 0.9)); }
    // rain streaks from the eave: the sides and the back always, the front where free
    const ns = 2 + Math.floor(rand() * 3);
    for (let k = 0; k < ns; k++) {
      const len = 0.8 + rand() * 1.5, w = 0.08 + rand() * 0.1, a = 0.3 + rand() * (L - 0.6), side = rand();
      if (side < 0.5 || !withFront) { if (ok(a - w, a + w) || !withFront) B(st, a - w, D - 0.02, a + w, D + 0.026, Math.max(P0 + 1.0, yw - 0.1 - len), yw - 0.1); }
      else if (ok(a - w - 0.1, a + w + 0.1)) B(st, a - w, -0.026, a + w, 0.02, Math.max(P0 + 1.05, yw - 0.1 - len), yw - 0.1);
    }
    for (const sa of [0, L]) if (rand() < 0.7) { const b = 0.6 + rand() * (D - 1.2), len = 0.8 + rand() * 1.4, w = 0.1 + rand() * 0.1; B(st, sa === 0 ? -0.026 : sa - 0.02, b - w, sa === 0 ? 0.02 : sa + 0.026, b + w, Math.max(P0 + 1.0, yw - 0.1 - len), yw - 0.1); }
    // a patch where the plaster has come off: brick under a rim of damp
    const np = rand() < 0.65 ? 1 + (rand() < 0.4 ? 1 : 0) : 0;
    for (let k = 0; k < np; k++) {
      const pw = 0.35 + rand() * 0.45, ph = 0.3 + rand() * 0.4, y0 = P0 + 0.3 + rand() * 0.8;
      const onFront = withFront && rand() < 0.4, a = 0.5 + rand() * (L - 1.0 - pw);
      if (onFront) { if (!ok(a - 0.1, a + pw + 0.1)) continue; B(dm, a - 0.06, -e, a + pw + 0.06, 0, y0 - 0.06, y0 + ph + 0.06); B('brick_grey', a, -0.04, a + pw, -e, y0, y0 + ph); }
      else { const b = 0.5 + rand() * (D - 1.0 - pw); const sa = rand() < 0.5 ? 0 : L; B(dm, sa === 0 ? -e : sa, b - 0.06, sa === 0 ? 0 : sa + e, b + pw + 0.06, y0 - 0.06, y0 + ph + 0.06); B('brick_grey', sa === 0 ? -0.04 : sa + e, b, sa === 0 ? -e : sa + 0.04, b + pw, y0, y0 + ph); }
    }
  };
  const fascia = (mat, a0, a1, y0, y1, b) => B(mat, a0, b - 0.05, a1, b + 0.05, y0, y1);
  /** The gable end's wall up to the roof and its hanging fish: gables = the roof is along the front (ridge on u) so the ends are at a = 0 and a = L. */
  const gableInfill = (mat, M, sw0, sw1, tw0, tw1, yWall, prof, yRoof) => { void M; void sw0; void sw1; void tw0; void tw1; void yWall; void prof; void yRoof; };

  if (kind === 'shop' || kind === 'wine' || kind === 'tea' || kind === 'inn' || kind === 'warehouse') {
    const two = el.storeys === 2 || kind === 'wine' || kind === 'inn', wide = kind === 'wine' || kind === 'inn';
    const H1 = kind === 'warehouse' ? 4.3 : wide ? 3.5 : two ? 3.25 : 3.0, H2 = two ? (wide ? 3.3 : 2.9) : 0;
    const yF = P0 + H1, yTop = yF + H2;
    const oh = wide ? 1.7 : two ? 1.45 : 1.25, soh = 0.55, th = 0.17;
    const bayW = L / Math.max(1, el.bays || Math.round(L / 3.3));
    const nb = Math.max(1, Math.round(L / bayW));
    const doorBay = nb === 1 ? 0 : (nb % 2 ? (nb - 1) / 2 : (rand() < 0.5 ? nb / 2 - 1 : nb / 2));
    const roofB = D / 2 + oh * 0.6;
    const rise = (D / 2 + (oh - 0.3) / 2) * (kind === 'warehouse' ? 0.24 : 0.28 + rand() * 0.06);
    const hip = (kind === 'wine' || (kind === 'inn')) && L > D + 2 ? 0 : 0;
    // the roof sits so that its soffit meets the wall top
    const tw0 = 0, tw1 = D, t0 = -oh, t1 = D + 0.9, tmid = (t0 + t1) / 2, hb = (t1 - t0) / 2;
    const ph = (t) => Math.pow(Math.max(0, 1 - Math.abs(t - tmid) / hb), 1.3);
    const yE = yTop - th + 0.05 - rise * ph(0) + th;      // the roof's underside at the front wall line is yTop
    const wallTop = yTop;
    void roofB; void hip; void tw0; void tw1;
    // the foundation: a plinth of dressed stone, with the floor of the shop
    B('granite_block', -0.05, -0.05, L + 0.05, D + 0.05, -0.4, P0, false);
    const inn = kind === 'inn';
    const enter = !!el.furnished && (kind === 'shop' || kind === 'wine') && nb > 1;
    const frontD = inn ? 7.6 : D;           // the inn: the front range only is two storeys
    // ---- the walls: back, sides, plastered over a timber frame
    const wm = kind === 'warehouse' ? 'plaster_grey' : wall;
    if (!inn) {
      B(wm, 0, D - 0.3, L, D, P0, wallTop);
      B(wm, 0, 0, 0.3, D, P0, wallTop); B(wm, L - 0.3, 0, L, D, P0, wallTop);
      if (det >= 1) { for (const a of [0.15, L - 0.15]) B(frame, a - 0.17, 0, a + 0.17, 0.05, P0, wallTop); B(frame, 0, D - 0.33, L, D - 0.3, P0 + 0.0, P0 + 0.1); }
    }
    // ---- the front: open between posts, a counter at the door bay's sides; two storeys: the balcony and the lattice windows above
    const fb = 0.25;
    const bayA = (k) => k * L / nb;
    if (kind === 'warehouse') {
      // timber posts on stone bases, the wall between them plastered, wide doors standing open at two bays
      for (let k = 0; k <= nb; k++) { const a = Math.min(L - 0.14, Math.max(0.14, bayA(k))); B('granite_block', a - 0.2, fb - 0.2, a + 0.2, fb + 0.2, P0, P0 + 0.3); B('timber', a - 0.13, fb - 0.13, a + 0.13, fb + 0.13, P0 + 0.3, yTop - 0.35); }
      B('timber', 0, fb - 0.1, L, fb + 0.1, yTop - 0.35, yTop);
      for (let k = 0; k < nb; k++) {
        const a0 = bayA(k) + 0.14, a1 = bayA(k + 1) - 0.14, open = k === nb >> 1 || (nb > 3 && k === (nb >> 1) - 1);
        if (open) { B('wood_dark', a0, 1.0, a1, 1.1, P0, yTop - 0.35); B('timber', a0, fb - 0.04, a0 + 0.1, fb + 0.9, P0 + 0.4, yTop - 0.4); }
        else { B(wm, a0, fb - 0.08, a1, fb + 0.1, P0, P0 + 1.05); B('wood_dark', a0, fb - 0.06, a1, fb + 0.08, P0 + 1.05, yTop - 0.35); }
      }
      cRect(0, 1.0, L, D, 0, yTop);
      if (det >= 2) for (let k = 0; k < nb; k++) if (k === nb >> 1) { B('sacking', bayA(k) + 0.5, 1.2, bayA(k) + 1.9, 2.1, P0, P0 + 0.9); B('sacking', bayA(k) + 0.9, 1.4, bayA(k) + 1.8, 2.0, P0 + 0.9, P0 + 1.6); }
      posts; // (no more)
    } else if (!inn) {
      const rowsGoods = det >= 2;
      // ground-floor front
      const trade = el.trade || (kind === 'tea' ? 'tea' : 'cloth'), gd = GOODS[trade] || GOODS.cloth;
      for (let k = 0; k <= nb; k++) {
        const a = Math.min(L - 0.13, Math.max(0.13, bayA(k)));
        const cap = det >= 1;
        B('granite_block', a - 0.19, fb - 0.19, a + 0.19, fb + 0.19, P0, P0 + 0.2);
        B('timber', a - 0.12, fb - 0.12, a + 0.12, fb + 0.12, P0 + 0.2, yF - 0.3);
        if (cap && det >= 2) { B('timber', a - 0.22, fb - 0.2, a + 0.22, fb + 0.2, yF - 0.3, yF - 0.18); B('timber', a - 0.08, fb - 0.5, a + 0.08, fb + 0.1, yF - 0.18, yF - 0.04); }   // the bracket block and the arm under the eave
        cCircle(a, fb, 0.14, P0, yF);
      }
      B('timber', 0, fb - 0.12, L, fb + 0.12, yF - 0.3, yF);                // the lintel beam (the architrave) over the whole front
      // the counters, in every bay but the door's
      for (let k = 0; k < nb; k++) {
        const a0 = bayA(k) + 0.15, a1 = bayA(k + 1) - 0.15;
        if (k === doorBay && nb > 1) {
          // the door bay: the stored shutters (men ban) leaning in the corner; the threshold stone
          B('wood_dark', a1 - 0.18, fb - 0.04, a1 - 0.04, fb + 0.1, P0, P0 + 2.4);
          B('granite_block', a0, fb - 0.3, a1, fb + 0.35, P0 - 0.04, P0 + 0.06);
        } else {
          B('wood_dark', a0, fb + 0.55, a1, fb + 1.05, P0, P0 + 0.9); B('timber', a0 - 0.05, fb + 0.5, a1 + 0.05, fb + 1.1, P0 + 0.9, P0 + 0.96);
          if (rowsGoods && det >= 2) {
            // goods on the counter: baskets, jars, bolts by the trade
            const m = pick(rand, gd.items), m2 = pick(rand, gd.items);
            if (gd.shape === 'bolts') for (let j = 0; j < 3; j++) B(j % 2 ? m : m2, a0 + 0.1 + j * 0.3, fb + 0.62, a0 + 0.36 + j * 0.3, fb + 0.95, P0 + 0.96, P0 + 1.2 + j * 0.05);
            else if (gd.shape === 'books') for (let j = 0; j < 2; j++) B(j ? m2 : m, a0 + 0.1 + j * 0.5, fb + 0.65, a0 + 0.5 + j * 0.5, fb + 0.95, P0 + 0.96, P0 + 1.12);
            else { const g = lathe([[0.001, 0], [0.17, 0.0], [0.22, 0.2], [0.17, 0.4], [0.1, 0.46], [0.001, 0.46]], 8); const q = W(a0 + 0.35, fb + 0.8, P0 + 0.96); g.translate(q[0], q[1], q[2]); bag.add(m, g); }
          }
        }
      }
      if (enter) {
        // a shop you can walk into: the back and side walls solid, the counters in every bay but the door's, the room's floor and ceiling
        cRect(0, D - 0.3, L, D, 0, yTop); cRect(0, 0, 0.3, D, 0, yTop); cRect(L - 0.3, 0, L, D, 0, yTop);
        for (let k = 0; k < nb; k++) if (k !== doorBay) cRect(bayA(k) + 0.1, fb + 0.45, bayA(k + 1) - 0.1, fb + 1.15, 0, P0 + 1.0);
        cFloor(0.3, fb + 0.0, L - 0.3, D - 0.3, P0); cFloor(bayA(doorBay) + 0.15, -0.35, bayA(doorBay + 1) - 0.15, fb + 0.1, P0);
        ceiling(0.3, fb + 0.12, L - 0.3, D - 0.3, P0 + (kind === 'wine' ? 3.2 : two ? 2.95 : 2.7) - 0.0);
      } else cRect(0, fb + 0.45, L, D, 0, yTop);
      // the shop's inside, seen through the open front: the back wall's shelves with goods
      if (det >= 2 && !el.furnished) {
        const bk = D - 0.3;
        B('wood_dark', 0.35, bk - 0.42, L - 0.35, bk, P0, P0 + 2.1); B('timber', 0.3, bk - 0.47, L - 0.3, bk - 0.42, P0 + 2.1, P0 + 2.18);
        const nbx = Math.floor((L - 0.7) / 0.5);
        for (let r = 0; r < 3; r++) for (let j = 0; j < nbx; j++) if (rand() < 0.82) {
          const m = gd.items[(r + j) % gd.items.length], a = 0.4 + j * 0.5;
          B(m, a, bk - 0.46, a + 0.38, bk - 0.42 + 0.02, P0 + 0.12 + r * 0.66, P0 + 0.5 + r * 0.66);
        }
      }
      // the front's variety: some bays boarded up (the shutters, men ban, in their grooves), a hanging board on a bracket at the post opposite the sign pole
      if (det >= 2) {
        for (let k = 0; k < nb; k++) if (k !== doorBay && nb > 2 && rand() < 0.18) {
          const a0 = bayA(k) + 0.14, a1 = bayA(k + 1) - 0.14;
          B('wood_dark', a0, fb - 0.09, a1, fb - 0.02, P0 + 0.95, yF - 0.32);
          for (const y of [P0 + 1.25, P0 + 2.0]) B('timber', a0, fb - 0.115, a1, fb - 0.09, y, y + 0.1);
        }
        const sa2 = poleA(el.seed || 1, L) < L / 2 ? L - 0.13 : 0.13, bm = pick(rand, ['wood_dark', 'lacquer_chestnut', 'timber_red']);
        B('timber', sa2 - 0.03, -0.62, sa2 + 0.03, fb - 0.12, yF - 0.66, yF - 0.58);
        B('iron', sa2 - 0.015, -0.62, sa2 + 0.015, -0.56, yF - 0.58, yF - 0.5);
        B(bm, sa2 - 0.21, -0.6, sa2 + 0.21, -0.54, yF - 1.18, yF - 0.58, false); B('paint_ochre', sa2 - 0.06, -0.615, sa2 + 0.06, -0.6, yF - 1.1, yF - 0.7);
        // the rafters' ends under the front eave
        const ne = Math.round((L + 2 * soh) / 0.42);
        for (let k = 0; k <= ne; k++) { const a = -soh + 0.1 + (L + 2 * soh - 0.2) * k / ne; B('timber', a - 0.04, t0 + 0.02, a + 0.04, t0 + 0.45, yE - th - 0.1, yE - th - 0.005); }
      }
      // (the trade's sign — the wine flag, the gourd, the measure — stands on its pole in the street: shops.js)
      // the mat awning over the street in front of the door bays
      const pa0 = poleA(el.seed || 1, L);
      if (det >= 1 && !two && rand() < 0.55 || (det >= 1 && two && rand() < 0.25)) {
        const aa0 = rand() < 0.5 ? 0.0 : bayA(Math.max(0, doorBay - 1)), aa1 = Math.min(L, aa0 + (rand() < 0.5 ? L : 2 * bayW)), yA = Math.min(yF - 0.35, 3.0), reach = 2.4;
        const aw0 = Math.max(0, aa0), aw1 = Math.max(aw0 + 2.2, aa1);
        const a1 = Math.min(L, aw1), y1 = yA - 0.55;
        if (!(pa0 > aw0 - 0.9 && pa0 < a1 + 0.9)) {
        surf('reed_mat', [W(aw0, -0.15, yA), W(a1, -0.15, yA), W(a1, -reach, y1), W(aw0, -reach, y1)], [0, 1, 0]);
        surf('reed_mat', [W(aw0, -0.15, yA - 0.05), W(aw0, -reach, y1 - 0.05), W(a1, -reach, y1 - 0.05), W(a1, -0.15, yA - 0.05)], [0, -1, 0]);
        const vc = pick(rand, ['cloth_white', 'cloth_indigo', 'cloth_ochre']);
        const pa = W(aw0, -reach, 0), pb = W(a1, -reach, 0);
        addCloth(bag, vc, clothBox(Math.min(pa[0], pb[0]), y1 - 0.42, Math.min(pa[2], pb[2]) - 0.015, Math.max(pa[0], pb[0]), y1 - 0.04, Math.max(pa[2], pb[2]) + 0.015, 0.21), y1 - 0.04);
        const dcA = (doorBay + 0.5) * bayW, awFree = (a) => !(enter || el.furnished) || Math.abs(a - dcA) > 1.05;     // (a post never stands before the way in)
        for (const a of [aw0 + 0.1, a1 - 0.1]) { if (!awFree(a)) continue; B('bamboo_culm', a - 0.04, -reach - 0.04, a + 0.04, -reach + 0.04, 0, y1 - 0.04); cCircle(a, -reach, 0.1, 0, y1); }
        if (a1 - aw0 > 6 && awFree((aw0 + a1) / 2)) { const am = (aw0 + a1) / 2; B('bamboo_culm', am - 0.04, -reach - 0.04, am + 0.04, -reach + 0.04, 0, y1 - 0.04); cCircle(am, -reach, 0.1, 0, y1); }
        }
      }
    }
    // ---- the upper storey: the balcony, posts, lattice windows between them
    if (two) {
      const b0 = -0.95;
      // the floor beams run out over the street on the posts; the balcony deck on them
      for (let k = 0; k <= nb; k++) { const a = Math.min(L - 0.13, Math.max(0.13, bayA(k))); if (!inn) B('timber', a - 0.09, b0, a + 0.09, fb + 0.12, yF - 0.32, yF - 0.12); }
      if (!inn) {
        B('timber', 0.0, b0, L, fb, yF - 0.12, yF + 0.04);
        if (det >= 1) {
          // the rail: posts every 0.9 m, a top rail and a lower one
          const nr = Math.max(2, Math.round(L / 0.95));
          for (let k = 0; k <= nr; k++) { const a = Math.min(L - 0.05, Math.max(0.05, L * k / nr)); B('lacquer_chestnut', a - 0.04, b0 + 0.02, a + 0.04, b0 + 0.1, yF + 0.04, yF + 0.98); }
          B('lacquer_chestnut', 0, b0 + 0.0, L, b0 + 0.14, yF + 0.94, yF + 1.02); B('lacquer_chestnut', 0, b0 + 0.04, L, b0 + 0.1, yF + 0.45, yF + 0.5);
          B('lacquer_chestnut', 0, b0, 0.1, fb, yF + 0.04, yF + 1.02, true); B('lacquer_chestnut', L - 0.1, b0, L, fb, yF + 0.04, yF + 1.02, true);
        }
        // upper front: posts, and between them in each bay a window, a shuttered panel or an open bay with the room's dark inside
        const open = kind === 'wine' || kind === 'tea' || (rand() < 0.3);
        for (let k = 0; k <= nb; k++) { const a = Math.min(L - 0.13, Math.max(0.13, bayA(k))); B('timber', a - 0.11, fb - 0.11, a + 0.11, fb + 0.11, yF, yTop - 0.3); }
        B('timber', 0, fb - 0.12, L, fb + 0.12, yTop - 0.3, yTop);
        for (let k = 0; k < nb; k++) {
          const a0 = bayA(k) + 0.14, a1 = bayA(k + 1) - 0.14, q = rand();
          if (open && q < 0.6) { B('wood_dark', a0, fb + 0.4, a1, fb + 0.48, yF, yTop - 0.3); if (det >= 2) B('timber', a0 + 0.2, fb + 0.9, a0 + 0.8, fb + 1.5, yF, yF + 0.78); }
          else if (q < 0.75) {
            B(wall, a0, fb - 0.05, a1, fb + 0.08, yF, yF + 0.85);
            if (det >= 1) { B('plaster_damp', a0, fb - 0.062, a1, fb - 0.05, yF, yF + 0.22); for (const f of [0.2, 0.75]) if (rand() < 0.8) B('plaster_streak', a0 + (a1 - a0) * f, fb - 0.07, a0 + (a1 - a0) * f + 0.1 + rand() * 0.06, fb - 0.05, yF + 0.25, yF + 0.85); }
            B('lattice', a0 + 0.05, fb - 0.045, a1 - 0.05, fb + 0.02, yF + 0.85, yTop - 0.5); B('timber', a0, fb - 0.06, a1, fb + 0.06, yF + 0.82, yF + 0.88); B('timber', a0, fb - 0.06, a1, fb + 0.06, yTop - 0.52, yTop - 0.46);
            B(wall, a0, fb - 0.05, a1, fb + 0.08, yTop - 0.46, yTop - 0.3);
          } else if (q < 0.88) { B('shutter_brown', a0, fb - 0.05, a1, fb + 0.07, yF, yTop - 0.3); }
          else { B(wall, a0, fb - 0.05, a1, fb + 0.08, yF, yTop - 0.3); if (det >= 1) { B('plaster_damp', a0, fb - 0.062, a1, fb - 0.05, yF, yF + 0.3); for (const f of [0.15, 0.5, 0.82]) if (rand() < 0.75) { const sa = a0 + (a1 - a0) * f; B('plaster_streak', sa, fb - 0.068, sa + 0.08 + rand() * 0.07, fb - 0.05, yTop - 0.3 - (0.7 + rand() * 1.1), yTop - 0.3); } } B('lattice_ice', a0 + (a1 - a0) / 2 - 0.4, fb - 0.04, a0 + (a1 - a0) / 2 + 0.4, fb + 0.03, yF + 0.9, yF + 1.9); }
        }
        if (det >= 2) {
          // the eave's brackets: a block over each post and an arm out under the eave
          for (let k = 0; k <= nb; k++) { const a = Math.min(L - 0.13, Math.max(0.13, bayA(k))); B('timber', a - 0.2, fb - 0.2, a + 0.2, fb + 0.2, yTop - 0.3, yTop - 0.16); B('timber', a - 0.07, fb - 0.9, a + 0.07, fb + 0.1, yTop - 0.16, yTop - 0.02); }
        }
      }
      // ---- what the scroll shows at the upper storey's eye level: goods and plants on the balcony, wash over the rail, hanging blinds of bamboo, the board on the rail's
      // face, the string course and a window in the side walls, streaks under the eaves
      if (!inn && det >= 1) {
        const yb = yF + 0.04, CL = ['cloth_indigo', 'cloth_white', 'cloth_red', 'cloth_ochre', 'cloth_green', 'cloth_white'];
        const nItems = Math.min(5, 1 + Math.floor(L / 2.2));
        let aPrev = -9;
        for (let k = 0; k < nItems; k++) {
          const a = 0.5 + rand() * (L - 1.0), kd = rand(); if (Math.abs(a - aPrev) < 0.9) continue; aPrev = a;
          if (kd < 0.28) { B('terracotta', a - 0.14, b0 + 0.22, a + 0.14, b0 + 0.5, yb, yb + 0.3); B('cloth_green', a - 0.22, b0 + 0.16, a + 0.22, b0 + 0.56, yb + 0.3, yb + 0.66); B('cloth_green', a - 0.12, b0 + 0.24, a + 0.12, b0 + 0.48, yb + 0.66, yb + 0.82); }
          else if (kd < 0.55) { const cw = 0.35 + rand() * 0.3, cm = pick(rand, CL); B(cm, a - cw, b0 - 0.035, a + cw, b0 + 0.0, yF + 0.5, yF + 1.0); B(cm, a - cw, b0 - 0.03, a + cw, b0 + 0.17, yF + 0.97, yF + 1.0 + 0.04); }
          else if (kd < 0.72) { B('wicker', a - 0.25, b0 + 0.2, a + 0.25, b0 + 0.62, yb, yb + 0.34); B(pick(rand, ['cloth_white', 'cloth_ochre', 'cloth_brown']), a - 0.2, b0 + 0.24, a + 0.2, b0 + 0.58, yb + 0.34, yb + 0.42); }
          else if (kd < 0.88) { for (const dd of [-0.17, 0.17]) { B('pottery_dark', a + dd - 0.12, b0 + 0.22, a + dd + 0.12, b0 + 0.46, yb, yb + 0.42); B('terracotta', a + dd - 0.07, b0 + 0.27, a + dd + 0.07, b0 + 0.41, yb + 0.42, yb + 0.48); } }
          else { B('wood_dark', a - 0.4, b0 + 0.25, a + 0.4, b0 + 0.5, yb, yb + 0.12); for (let j = 0; j < 3; j++) B('paint_white', a - 0.34 + j * 0.24, b0 + 0.27, a - 0.14 + j * 0.24, b0 + 0.47, yb + 0.12, yb + 0.22); }
        }
        // blinds of split bamboo (lian) hung from the eave in front of the rail, drawn up to a roll or let half down; a cord at each end
        for (let k = 0; k < nb; k++) {
          if (rand() > (kind === 'wine' || kind === 'tea' ? 0.55 : 0.32)) continue;
          const a0 = bayA(k) + 0.2, a1 = bayA(k + 1) - 0.2, len = 0.7 + rand() * 1.3, yt = yTop - 0.36, bb = b0 - 0.2;
          if (a1 - a0 < 0.8) continue;
          B('bamboo_culm', a0 - 0.04, bb - 0.07, a1 + 0.04, bb + 0.05, yt, yt + 0.12);
          B('reed_mat', a0, bb - 0.012, a1, bb + 0.012, yt - len, yt, false);     // (with its underside: a thing hung over the street is not a solid mass to the walker's collision field)
          for (let y = yt - 0.14; y > yt - len; y -= 0.2) B('wood_dark', a0, bb - 0.019, a1, bb - 0.012, y, y + 0.014);
          B('wood_dark', a0, bb - 0.03, a1, bb + 0.02, yt - len - 0.03, yt - len);
          for (const a of [a0 + 0.04, a1 - 0.04]) B('rope_fibre', a - 0.012, bb - 0.03, a + 0.012, bb - 0.012, yt - len, yt);
        }
        // the board on the rail's face, a shop's name in painted characters (abstract strokes): black lacquer with a red rim, white strokes
        if (rand() < (kind === 'wine' || kind === 'tea' ? 0.9 : 0.5) && L > 3.4) {
          const bw = Math.min(L - 1.2, 1.4 + rand() * 1.6), am = L * (0.3 + rand() * 0.4), ya = yF + 0.12, yb2 = yF + 0.8, bf = b0 - 0.02, a0 = Math.max(0.4, am - bw / 2), a1 = Math.min(L - 0.4, am + bw / 2);
          B('lacquer_red', a0 - 0.05, bf - 0.045, a1 + 0.05, bf + 0.02, ya - 0.05, yb2 + 0.05);
          B('lacquer_black', a0, bf - 0.065, a1, bf + 0.02, ya, yb2);
          const nc = Math.max(2, Math.min(6, Math.floor((a1 - a0 - 0.2) / 0.4)));
          for (let c = 0; c < nc; c++) {
            const cx = a0 + (a1 - a0) * (c + 0.5) / nc, h = 0.42;
            B('paint_white', cx - 0.12, bf - 0.075, cx + 0.12, bf - 0.065, yF + 0.46 - h / 2, yF + 0.46 - h / 2 + 0.05);
            B('paint_white', cx - 0.02, bf - 0.075, cx + 0.02, bf - 0.065, yF + 0.46 - h / 2, yF + 0.46 + h / 2);
            if (rand() < 0.6) B('paint_white', cx - 0.12, bf - 0.075, cx + 0.12, bf - 0.065, yF + 0.46 + h / 2 - 0.05, yF + 0.46 + h / 2);
            if (rand() < 0.5) B('paint_white', cx - 0.1, bf - 0.075, cx - 0.06, bf - 0.065, yF + 0.46 - h / 2, yF + 0.46 + h / 2);
            if (rand() < 0.5) B('paint_white', cx + 0.06, bf - 0.075, cx + 0.1, bf - 0.065, yF + 0.46 - h / 2, yF + 0.46 + h / 2);
          }
        }
        // the side walls: a string course at the floor, a small lattice window upstairs, damp and streaks under the sill
        for (const [sa, sg] of [[0, -1], [L, 1]]) {
          B('timber', sa - (sg < 0 ? 0.05 : 0), 0, sa + (sg > 0 ? 0.05 : 0), D, yF - 0.14, yF - 0.02);
          if (D > 6 && rand() < 0.95) {
            const bw = Math.min(D - 2, 2.2 + rand() * (D - 4.2)), pr = 0.045 * sg;
            B('timber', sa + (sg < 0 ? -0.05 : 0), bw - 0.55, sa + (sg > 0 ? 0.05 : 0), bw + 0.55, yF + 0.7, yF + 1.9);
            B('lattice', sa + (sg < 0 ? -0.06 : 0), bw - 0.45, sa + (sg > 0 ? 0.06 : 0), bw + 0.45, yF + 0.8, yF + 1.8);
            for (const f of [-0.35, 0.2]) if (rand() < 0.8) B('plaster_streak', sa + (sg < 0 ? -0.03 : 0), bw + f, sa + (sg > 0 ? 0.03 : 0), bw + f + 0.1, yF + 0.15, yF + 0.7);
            void pr;
          }
          B('plaster_damp', sa + (sg < 0 ? -0.034 : 0), 0.02, sa + (sg > 0 ? 0.034 : 0), D - 0.02, yF - 0.7, yF - 0.14);
          // the ground floor of the side wall (what the lane sees): a side door with its step, a barred window, a patch of fallen plaster, a second upstairs window,
          // and in the free yard beside it a lean-to shed with firewood and jars against the wall (not where a neighbour or a way's edge is within reach)
          {
            const S = (m, b0_, b1_, ya, yb, pr) => B(m, sa + (sg < 0 ? -pr : 0), b0_, sa + (sg > 0 ? pr : 0), b1_, ya, yb);
            let bd = -9;
            if (D > 6.5 && rand() < 0.6) {
              bd = 1.3 + rand() * (D - 3.2);
              S('timber', bd - 0.58, bd + 0.58, P0, P0 + 2.28, 0.07); S('wood_dark', bd - 0.46, bd + 0.46, P0, P0 + 2.12, 0.1);
              for (const dd of [-0.23, 0.23]) { S('timber', bd + dd - 0.015, bd + dd + 0.015, P0 + 0.1, P0 + 2.1, 0.115); }
              S('timber', bd - 0.46, bd + 0.46, P0 + 1.0, P0 + 1.06, 0.115); S('iron', bd - 0.04, bd + 0.04, P0 + 0.95, P0 + 1.1, 0.14);
              B('granite_block', sa + (sg < 0 ? -0.45 : 0), bd - 0.65, sa + (sg > 0 ? 0.45 : 0), bd + 0.65, 0, P0 + 0.06);
            }
            if (D > 5 && rand() < 0.7) {
              const bw2 = (bd > 0 ? (bd > D / 2 ? bd - 2.4 : bd + 2.4) : 1.6 + rand() * (D - 3.2));
              if (bw2 > 0.9 && bw2 < D - 0.9) {
                S('timber', bw2 - 0.45, bw2 + 0.45, P0 + 1.3, P0 + 2.3, 0.07); S('lattice', bw2 - 0.36, bw2 + 0.36, P0 + 1.4, P0 + 2.2, 0.09);
                S('timber', bw2 - 0.5, bw2 + 0.5, P0 + 1.22, P0 + 1.3, 0.1);
              }
            }
            { const bf = 0.6 + rand() * (D - 1.8); S('brick_grey', bf, bf + 0.6 + rand() * 0.5, P0 + 0.28 + rand() * 0.2, P0 + 1.0, 0.04); }
            if (D > 8.5 && rand() < 0.65) {
              const bw3 = D * (0.3 + rand() * 0.4), bw4 = bw3 + (bw3 > D / 2 ? -1 : 1) * (2.6 + rand() * 0.8);
              if (bw4 > 0.9 && bw4 < D - 0.9 && Math.abs(bw3 - bw4) > 2.2) { S('timber', bw4 - 0.45, bw4 + 0.45, yF + 0.75, yF + 1.85, 0.07); S('lattice', bw4 - 0.36, bw4 + 0.36, yF + 0.85, yF + 1.75, 0.09); }
            }
            const q = W(sa + sg * 1.4, D * 0.5, 0);
            if (D > 7 && rand() < 0.6 && (bd < 0 || Math.abs(bd - D * 0.5) > 3.2) && !inLot(q[0], q[2], 0.35) && !inLot(W(sa + sg * 2.6, D * 0.5, 0)[0], W(sa + sg * 2.6, D * 0.5, 0)[2], 0.2)) {
              const bl = D * 0.5, l0 = bl - 1.1, l1 = bl + 1.1, dp = 0.95, ya = P0 + 2.55, yb2 = P0 + 2.15;
              for (const bb of [l0, l1]) { const pc = sa + sg * (dp - 0.08); B('timber', pc - 0.05, bb - 0.05, pc + 0.05, bb + 0.05, 0, yb2 - 0.04); }
              const T = (aa, bb, y) => W(aa, bb, y);
              surf(tile, [T(sa, l0 - 0.1, ya), T(sa, l1 + 0.1, ya), T(sa + sg * dp, l1 + 0.1, yb2), T(sa + sg * dp, l0 - 0.1, yb2)], UP);
              surf(tile, [T(sa, l0 - 0.1, ya - 0.07), T(sa + sg * dp, l0 - 0.1, yb2 - 0.07), T(sa + sg * dp, l1 + 0.1, yb2 - 0.07), T(sa, l1 + 0.1, ya - 0.07)], DN);
              surf(tile, [T(sa, l0 - 0.1, ya - 0.07), T(sa, l0 - 0.1, ya), T(sa + sg * dp, l0 - 0.1, yb2), T(sa + sg * dp, l0 - 0.1, yb2 - 0.07)], dirV(-1));
              surf(tile, [T(sa, l1 + 0.1, ya - 0.07), T(sa + sg * dp, l1 + 0.1, yb2 - 0.07), T(sa + sg * dp, l1 + 0.1, yb2), T(sa, l1 + 0.1, ya)], dirV(1));
              surf(tile, [T(sa + sg * dp, l0 - 0.1, yb2 - 0.07), T(sa + sg * dp, l1 + 0.1, yb2 - 0.07), T(sa + sg * dp, l1 + 0.1, yb2), T(sa + sg * dp, l0 - 0.1, yb2)], dirU(sg));
              // under it: a stack of split firewood against the wall, two jars, a chopping block
              for (let r = 0; r < 4; r++) B(r % 2 ? 'timber' : 'wood_dark', sa + (sg < 0 ? -0.5 : 0.02), l0 + 0.05, sa + (sg > 0 ? 0.5 : -0.02), l0 + 0.95, 0.04 + r * 0.17, 0.2 + r * 0.17);
              for (const [bj, hj] of [[l1 - 0.7, 0.62], [l1 - 0.25, 0.48]]) { const cx = sa + sg * 0.4; B('pottery_dark', cx - 0.2, bj - 0.17, cx + 0.2, bj + 0.17, 0, hj * 0.7); B('pottery_dark', cx - 0.14, bj - 0.12, cx + 0.14, bj + 0.12, hj * 0.7, hj); }
              B('timber', sa + sg * 0.75 - 0.17, bl - 0.17, sa + sg * 0.75 + 0.17, bl + 0.17, 0, 0.4);
              cRect(sa, l0 - 0.1, sa + sg * dp, l1 + 0.1, 0, 1.6);
            }
          }
        }
      }
      // the wine shops: the dark bay above the door and its curtain of cloth
    }
    if (!inn) weather(wallTop, false);
    if (!inn && det >= 2 && (wide || kind === 'tea' || two) && L > 3.2) {
      // the ridge ornament: a base with a tiered finial (a gourd or a ball on a stem), and on the wide houses a cresting of upright tiles along the ridge
      const yR = yE + rise, tmm = (t0 + t1) / 2, g = rand() < 0.5;
      ridgeBox(MA, tile, L / 2 - 0.22, L / 2 + 0.22, tmm - 0.2, tmm + 0.2, yR + 0.24, yR + 0.4); ridgeBox(MA, tile, L / 2 - 0.12, L / 2 + 0.12, tmm - 0.12, tmm + 0.12, yR + 0.4, yR + 0.72);
      if (g) { ridgeBox(MA, tile, L / 2 - 0.17, L / 2 + 0.17, tmm - 0.17, tmm + 0.17, yR + 0.72, yR + 0.98); ridgeBox(MA, tile, L / 2 - 0.07, L / 2 + 0.07, tmm - 0.07, tmm + 0.07, yR + 0.98, yR + 1.14); }
      else { ridgeBox(MA, tile, L / 2 - 0.05, L / 2 + 0.05, tmm - 0.05, tmm + 0.05, yR + 0.72, yR + 1.0); ridgeBox(MA, tile, L / 2 - 0.15, L / 2 + 0.15, tmm - 0.15, tmm + 0.15, yR + 1.0, yR + 1.22); }
      if (wide || kind === 'tea' || L > 6.5) for (let s2 = 0.9; s2 < L - 0.5; s2 += 0.62) if (Math.abs(s2 - L / 2) > 0.9) ridgeBox(MA, tile, s2 - 0.05, s2 + 0.05, tmm - 0.07, tmm + 0.07, yR + 0.24, yR + 0.46 + ((s2 * 10) % 2 < 1 ? 0.0 : 0.06));
    }
    // ---- the inn: the front range with the gate bay, the court, the rear hall and the wings
    if (inn) innBuild();
    // ---- the roof (the ridge along the front; the inn's front range has its own)
    if (!inn) {
      roof(MA, -soh, L + soh, t0, t1, { yE, rise, p: 1.3, th, mat: tile, soffit: 'timber', w: [0, 0, L, D], ridgeMat: tile });
      // the gable ends: the wall rises to the roof's underside; the hanging fish and a bargeboard
      gableEnds(yTop, t0, t1, rise, yE, th, soh, wm);
      topY[0] = yE + rise + 0.3;
    }
    function gableEnds(yw, tt0, tt1, rs, yEv, thv, sh, wmat) {
      const tmd = (tt0 + tt1) / 2, hbv = (tt1 - tt0) / 2, prof = (t) => yEv + rs * Math.pow(Math.max(0, 1 - Math.abs(t - tmd) / hbv), 1.3);
      const n = 6;
      for (const [a, s] of [[0, -1], [L - 0.3, 1]]) {
        const aa = s < 0 ? 0 : L;
        for (let i = 0; i < n; i++) for (const [ta, tb] of [[0 + (tmd - 0) * i / n, (tmd - 0) * (i + 1) / n], [D - (D - tmd) * i / n, D - (D - tmd) * (i + 1) / n]]) {
          if (Math.abs(tb - ta) < 1e-4) continue;
          surf(wmat, [W(aa, ta, yw - 0.02), W(aa, tb, yw - 0.02), W(aa, tb, prof(tb) - thv), W(aa, ta, prof(ta) - thv)], dirU(s));
        }
        void a;
        if (det >= 2 && kind !== 'warehouse') {
          // the hanging fish: a board hung from the ridge end, in front of the gable
          const yR = prof(tmd) - thv;
          B('timber', aa + (s < 0 ? -0.12 : 0.0) - 0.0, tmd - 0.1, aa + (s < 0 ? 0.0 : 0.12), tmd + 0.1, yR - 1.05, yR);
          B('timber', aa + (s < 0 ? -0.14 : 0.0), tmd - 0.25, aa + (s < 0 ? 0.0 : 0.14), tmd + 0.25, yR - 0.55, yR - 0.4);
        }
      }
      void sh;
    }
    function innBuild() {
      // the front range (two storeys, depth frontD) with a gate bay in the middle
      const gA = L / 2 - 1.8, gB = L / 2 + 1.8, fh = frontD;
      B(wall, 0, 0.0, gA, fh, P0, yTop - 0.3); B(wall, gB, 0, L, fh, P0, yTop - 0.3);
      B('timber', gA - 0.25, 0, gA, 0.3, P0, yTop - 0.3); B('timber', gB, 0, gB + 0.25, 0.3, P0, yTop - 0.3);
      B('timber', gA - 0.25, 0, gB + 0.25, 0.4, yF - 0.8, yF - 0.2);                 // the lintel of the gate passage
      B(wall, gA, 0.0, gB, fh, yF - 0.2, yTop - 0.3);                                  // the room over the passage
      cRect(0, 0.0, gA, fh, 0, yTop); cRect(gB, 0.0, L, fh, 0, yTop);
      // the front's openings: lattice windows upstairs, a balcony on a beam
      const nbx = Math.max(2, Math.round(L / 3.4));
      for (let k = 0; k < nbx; k++) {
        const a = (k + 0.5) * L / nbx;
        if (a > gA - 0.5 && a < gB + 0.5) continue;
        B('lattice', a - 0.8, -0.04, a + 0.8, 0.02, yF + 0.9, yF + 2.2); B('timber', a - 0.9, -0.06, a + 0.9, 0.04, yF + 0.85, yF + 0.92); B('timber', a - 0.9, -0.06, a + 0.9, 0.04, yF + 2.2, yF + 2.28);
        B('shutter_brown', a - 0.55, -0.04, a + 0.55, 0.02, P0 + 0.8, P0 + 2.0);
      }
      B('timber', 0, -0.9, L, 0.0, yF - 0.12, yF + 0.04);
      if (det >= 1) { const nr = Math.round(L / 0.95); for (let k = 0; k <= nr; k++) { const a = Math.min(L - 0.05, Math.max(0.05, L * k / nr)); B('lacquer_chestnut', a - 0.04, -0.88, a + 0.04, -0.8, yF + 0.04, yF + 0.98); } B('lacquer_chestnut', 0, -0.9, L, -0.76, yF + 0.94, yF + 1.02); }
      // the front range's roof (hipped at the ends, the passage's gable)
      const t0f = -oh, t1f = fh + 0.9, rf = (fh / 2 + oh * 0.5) * 0.3, tm2 = (t0f + t1f) / 2, hb2 = (t1f - t0f) / 2, ph2 = Math.pow(Math.max(0, 1 - Math.abs(0 - tm2) / hb2), 1.3);
      const yEf = yTop - th - rf * ph2 + th;
      roof(MA, -soh, L + soh, t0f, t1f, { yE: yEf, rise: rf, p: 1.3, th, mat: tile, soffit: 'timber', w: [0, 0, L, fh], ridgeMat: tile });
      const prof2 = (t) => yEf + rf * Math.pow(Math.max(0, 1 - Math.abs(t - tm2) / hb2), 1.3);
      for (const aa of [0, L]) for (let i = 0; i < 5; i++) for (const [ta, tb] of [[tm2 * 0 + 0 + (tm2 - 0) * i / 5, (tm2 - 0) * (i + 1) / 5], [fh - (fh - tm2) * i / 5, fh - (fh - tm2) * (i + 1) / 5]]) if (Math.abs(tb - ta) > 1e-4) surf(wall, [W(aa, ta, yTop - 0.32), W(aa, tb, yTop - 0.32), W(aa, tb, prof2(tb) - th), W(aa, ta, prof2(ta) - th)], dirU(aa === 0 ? -1 : 1));
      // the court: flagstones, the rear hall, the side galleries (low walls with a tiled coping)
      const cb0 = fh, cb1 = D - 6.6;
      B('flagstone', 0.4, cb0, L - 0.4, cb1, 0.0, 0.05, false);
      const rh = 3.2, yh = P0 + rh;
      B('granite_block', 0.0, cb1, L, D, -0.4, P0, false);
      B(wall, 0, D - 0.3, L, D, P0, yh); B(wall, 0, cb1, 0.3, D, P0, yh); B(wall, L - 0.3, cb1, L, D, P0, yh);
      for (let k = 0; k <= 5; k++) { const a = Math.min(L - 0.13, Math.max(0.13, L * k / 5)); B('timber', a - 0.12, cb1 + 0.2 - 0.12, a + 0.12, cb1 + 0.2 + 0.12, P0, yh - 0.3); cCircle(a, cb1 + 0.2, 0.14, 0, yh); }
      B('timber', 0, cb1 + 0.08, L, cb1 + 0.32, yh - 0.3, yh);
      for (let k = 0; k < 5; k++) { const a0 = k * L / 5 + 0.14, a1 = (k + 1) * L / 5 - 0.14; if (k === 2) B('wood_dark', a0, cb1 + 0.6, a1, cb1 + 0.7, P0, yh - 0.3); else { B(wall, a0, cb1 + 0.08, a1, cb1 + 0.22, P0, P0 + 0.9); B('lattice', a0, cb1 + 0.1, a1, cb1 + 0.2, P0 + 0.9, yh - 0.35); } }
      cRect(0, cb1 + 0.5, L, D, 0, yh);
      const th2 = (D - cb1) / 2 + oh * 0.4, rr = th2 * 0.3, t0r = cb1 - 1.0, t1r = D + 0.8, tmr = (t0r + t1r) / 2, hbr = (t1r - t0r) / 2, phr = Math.pow(Math.max(0, 1 - Math.abs(cb1 - tmr) / hbr), 1.3);
      roof(MA, -soh, L + soh, t0r, t1r, { yE: yh - th - rr * phr + th, rise: rr, p: 1.3, th, mat: tile, soffit: 'timber', w: [0, cb1, L, D], ridgeMat: tile });
      // the side walls enclosing the court
      for (const [a0, a1] of [[0, 0.35], [L - 0.35, L]]) { B(wall, a0, cb0, a1, cb1, P0, P0 + 2.6); B(tile, a0 - 0.1, cb0, a1 + 0.1, cb1, P0 + 2.6, P0 + 2.78); }
      cRect(0, cb0, 0.35, cb1, 0, 3); cRect(L - 0.35, cb0, L, cb1, 0, 3);
      // the stable and the well in the court
      if (det >= 2) { B('wood_dark', 1.2, cb0 + 1.2, 3.6, cb0 + 2.2, 0, 1.0); const g = lathe([[0.001, 0], [0.5, 0], [0.55, 0.5], [0.4, 0.55], [0.4, 0.1], [0.001, 0.1]], 10); const q = W(L - 3, cb0 + 3, 0); g.translate(q[0], q[1], q[2]); bag.add('granite_grey', g); cCircle(L - 3, cb0 + 3, 0.58, 0, 0.6); }
      topY[0] = Math.max(yEf + rf + 0.3, yh + 1.4);
    }
    cleanUp(topY[0]);
    return;
  }

  if (kind === 'house' || kind === 'thatch' || kind === 'farm') {
    const enter = !!el.furnished && kind === 'house';
    const th = kind === 'house' ? 0.15 : 0.36, thatch = kind !== 'house', Hw = thatch ? 2.1 + rand() * 0.25 : 2.9 + rand() * 0.3;
    const wm = thatch ? (rand() < 0.6 ? 'mud_plaster' : 'earth_wall') : wall;
    const oh = thatch ? 0.7 : 1.15, soh = thatch ? 0.5 : 0.5;
    const alongRidge = L >= D * 0.9 || rand() < 0.7;        // the ridge along the front for the broad ones, over the depth for the narrow
    // the roof spans (the eave rectangle in the ridge's frame)
    const M = alongRidge ? MA : MB;
    const s0 = alongRidge ? -soh : -oh, s1 = alongRidge ? L + soh : D + 0.9;
    const t0 = alongRidge ? -oh : -soh, t1 = alongRidge ? D + 0.9 : L + soh;
    const tm = (t0 + t1) / 2, hb = (t1 - t0) / 2;
    const rise = thatch ? hb * (0.78 + rand() * 0.12) : (hb - 0.2) * (0.3 + rand() * 0.08), p = thatch ? 0.95 : 1.3;
    // the wall line meets the roof's underside: at the wall's outer line t = (alongRidge ? 0 : 0)
    const tWall = alongRidge ? 0 : 0;
    const ph = (t) => Math.pow(Math.max(0, 1 - Math.abs(t - tm) / hb), p);
    const wallEdge = alongRidge ? 0 : 0;
    void wallEdge; void tWall;
    // the underside at the wall's front face (across t) decides yE; the ends at s = 0 and L (or D)
    const tFace = alongRidge ? 0 : 0;
    const yE = P0 + Hw - rise * ph(tFace) + (thatch ? 0 : 0);
    B(thatch ? 'granite_grey' : 'granite_block', -0.04, -0.04, L + 0.04, D + 0.04, -0.4, P0, false);
    // the walls: the front with its door and window, plain back and sides
    const dA = (nbx) => (nbx % 2 ? L / 2 : L / 2 + (rand() < 0.5 ? -1 : 1) * L * 0.2);
    const nbays = Math.max(2, Math.round(L / 3.1)), dc = dA(nbays), dw = 1.15;
    const yw = P0 + Hw;
    B(wm, 0, D - 0.3, L, D, P0, yw); B(wm, 0, 0.3, 0.3, D - 0.3, P0, yw); B(wm, L - 0.3, 0.3, L, D - 0.3, P0, yw);
    B(wm, 0, 0, dc - dw / 2, 0.3, P0, yw); B(wm, dc + dw / 2, 0, L, 0.3, P0, yw);
    const dh = 2.1; B(wm, dc - dw / 2, 0, dc + dw / 2, 0.3, P0 + dh, yw);
    if (enter) for (const sg of [-1, 1]) { const j = dc + sg * (dw / 2 - 0.1); B('wood_dark', j - 0.03, 0.3, j + 0.03, 0.3 + dw / 2 - 0.08, P0, P0 + dh - 0.04); B('timber', j - 0.045, 0.3 + 0.1, j + 0.045, 0.3 + 0.2, P0 + 0.35, P0 + 0.48); B('timber', j - 0.045, 0.3 + 0.1, j + 0.045, 0.3 + 0.2, P0 + 1.5, P0 + 1.63); B('iron', j - 0.05, 0.3 + dw / 2 - 0.22, j + 0.05, 0.3 + dw / 2 - 0.16, P0 + 1.0, P0 + 1.07); }   // the two leaves folded open inward against the jambs
    else B('wood_dark', dc - dw / 2 + 0.06, 0.1, dc + dw / 2 - 0.06, 0.2, P0, P0 + dh - 0.04);     // the door leaf, a little back
    B('timber', dc - dw / 2, 0.0, dc - dw / 2 + 0.09, 0.32, P0, P0 + dh + 0.08); B('timber', dc + dw / 2 - 0.09, 0.0, dc + dw / 2, 0.32, P0, P0 + dh + 0.08); B('timber', dc - dw / 2, 0.0, dc + dw / 2, 0.32, P0 + dh, P0 + dh + 0.1);
    B('granite_block', dc - dw / 2 - 0.1, -0.5, dc + dw / 2 + 0.1, 0.3, P0 - 0.05, P0 + 0.05);          // the step
    // the door of boards (banmen): battens across the leaf, an iron ring on each side of the meeting stile, the stile a dark line
    if (!enter) { for (const y of [0.35, 1.0, 1.75]) B('timber', dc - dw / 2 + 0.07, 0.07, dc + dw / 2 - 0.07, 0.1, P0 + y, P0 + y + 0.13);
    B('iron', dc - 0.01, 0.07, dc + 0.01, 0.1, P0 + 0.05, P0 + dh - 0.1);
    for (const a of [dc - 0.12, dc + 0.12]) B('iron', a - 0.035, 0.05, a + 0.035, 0.1, P0 + 1.0, P0 + 1.07); }
    B('granite_grey', dc - dw / 2 + 0.02, -0.14, dc + dw / 2 - 0.02, 0.3, P0 + 0.05, P0 + 0.09);          // the worn threshold, a grey slab
    // windows: lattice in a frame, either side of the door, in the front of the better houses
    if (!thatch || det >= 1) for (const a of [dc < L / 2 ? dc + dw / 2 + (L - dc - dw / 2) / 2 : dc / 2 - dw / 4]) if (a > 0.6 && a < L - 0.6) {
      const wv = thatch ? 0.5 : 0.85, wy = P0 + (thatch ? 1.0 : 1.05);
      B(thatch ? 'wood_dark' : 'lattice', a - wv / 2, -0.04, a + wv / 2, 0.02, wy, wy + (thatch ? 0.5 : 0.8));
      if (!thatch) { B('timber', a - wv / 2 - 0.06, -0.05, a + wv / 2 + 0.06, 0.03, wy - 0.06, wy); B('timber', a - wv / 2 - 0.06, -0.05, a + wv / 2 + 0.06, 0.03, wy + 0.8, wy + 0.86); }
    }
    // open shutter leaves hooked back against the wall beside the lattice window
    const wa = dc < L / 2 ? dc + dw / 2 + (L - dc - dw / 2) / 2 : dc / 2 - dw / 4, wvv = thatch ? 0.5 : 0.85;
    if (!thatch && wa > 0.6 && wa < L - 0.6 && rand() < 0.7) for (const sg of [-1, 1]) { const a0 = wa + sg * (wvv / 2 + 0.07) + (sg < 0 ? -0.36 : 0), a1 = a0 + 0.36; if (a0 > 0.1 && a1 < L - 0.1 && (a1 < dc - dw / 2 - 0.05 || a0 > dc + dw / 2 + 0.05)) B('shutter_brown', a0, -0.075, a1, -0.04, P0 + 0.98, P0 + 1.9); }
    weather(P0 + Hw, !thatch, [[dc - dw / 2 - 0.1, dc + dw / 2 + 0.1], [wa - wvv / 2 - 0.5, wa + wvv / 2 + 0.5]]);
    if (det >= 2 && !thatch) {
      // a door hood (menzhao): a little pent of tile over the door on two brackets
      const hw = dw + 0.6;
      surf(tile, [W(dc - hw / 2, -0.5, P0 + dh + 0.55), W(dc + hw / 2, -0.5, P0 + dh + 0.55), W(dc + hw / 2, 0.0, P0 + dh + 0.95), W(dc - hw / 2, 0.0, P0 + dh + 0.95)], [0, 1, 0]);
      surf('timber', [W(dc - hw / 2, -0.5, P0 + dh + 0.55 - 0.1), W(dc - hw / 2, 0, P0 + dh + 0.95 - 0.1), W(dc + hw / 2, 0, P0 + dh + 0.95 - 0.1), W(dc + hw / 2, -0.5, P0 + dh + 0.55 - 0.1)], [0, -1, 0]);
      surf(tile, [W(dc - hw / 2, -0.5, P0 + dh + 0.45), W(dc + hw / 2, -0.5, P0 + dh + 0.45), W(dc + hw / 2, -0.5, P0 + dh + 0.55), W(dc - hw / 2, -0.5, P0 + dh + 0.55)], dirV(-1));
      for (const a of [dc - hw / 2 + 0.06, dc + hw / 2 - 0.06]) B('timber', a - 0.05, -0.5, a + 0.05, -0.4, P0 + dh - 0.1, P0 + dh + 0.55);
    }
    if (thatch && det >= 1) {
      // wattle-and-daub: the timber of the frame showing at the corners, a stack of firewood under the eave
      for (const a of [0.0, L - 0.1]) B('timber', a, -0.0, a + 0.1, 0.1, P0, yw);
      const sa = dc > L / 2 ? 0.4 : L - 1.9;
      for (let r = 0; r < 4; r++) for (let j = 0; j < 5 - (r > 2 ? 1 : 0); j++) B('timber', sa + j * 0.28, 0.35, sa + j * 0.28 + 0.22, 0.58, P0 + r * 0.22, P0 + r * 0.22 + 0.2);
    }
    if (enter) {
      // a house you can walk into: walls solid but for the door, the room's floor, a dark ceiling of joisted boards
      cRect(0, D - 0.3, L, D, 0, yw + 1); cRect(0, 0, 0.3, D, 0, yw + 1); cRect(L - 0.3, 0, L, D, 0, yw + 1);
      cRect(0, 0, dc - dw / 2, 0.3, 0, yw + 1); cRect(dc + dw / 2, 0, L, 0.3, 0, yw + 1);
      cFloor(0.3, 0.3, L - 0.3, D - 0.3, P0); cFloor(dc - dw / 2 + 0.05, -0.45, dc + dw / 2 - 0.05, 0.35, P0);
      ceiling(0.3, 0.3, L - 0.3, D - 0.3, P0 + 2.7);
    } else cRect(0, 0.0, L, D, 0, yw + 1);
    roof(M, s0, s1, t0, t1, { yE, rise, p, th, mat: thatch ? 'thatch' : tile, soffit: thatch ? 'thatch' : 'timber', w: alongRidge ? [0, 0, L, D] : [0, 0, D, L], ridge: thatch ? 'thatch' : 'tile', hip: thatch ? (alongRidge ? Math.min((t1 - t0) / 2 - 0.2, (s1 - s0) / 2 - 0.3) : Math.min((t1 - t0) / 2 - 0.2, (s1 - s0) / 2 - 0.3)) : 0, ridgeMat: thatch ? 'thatch' : tile });
    // the gable ends of the tiled house: plaster to the roof, the hanging fish
    if (!thatch) {
      const prof = (t) => yE + rise * Math.pow(Math.max(0, 1 - Math.abs(t - tm) / hb), p);
      const n = 5;
      if (alongRidge) {
        for (const [aa, s] of [[0, -1], [L, 1]]) for (let i = 0; i < n; i++) for (const [ta, tb] of [[tm * i / n, tm * (i + 1) / n], [D - (D - tm) * i / n, D - (D - tm) * (i + 1) / n]]) if (Math.abs(tb - ta) > 1e-4) surf(wm, [W(aa, ta, yw - 0.02), W(aa, tb, yw - 0.02), W(aa, tb, prof(tb) - th), W(aa, ta, prof(ta) - th)], dirU(s));
      } else {
        // the ridge across: the gable faces the street and the back; the walls rise to the roof's underside
        for (const [bb, s] of [[0, -1], [D, 1]]) for (let i = 0; i < n; i++) for (const [ta, tb] of [[L * 0 + tm * i / n, tm * (i + 1) / n], [L - (L - tm) * i / n, L - (L - tm) * (i + 1) / n]]) if (Math.abs(tb - ta) > 1e-4) surf(wm, [W(ta, bb, yw - 0.02), W(tb, bb, yw - 0.02), W(tb, bb, prof(tb) - th), W(ta, bb, prof(ta) - th)], dirV(s));
      }
      if (det >= 2) { const yR = prof(tm) - th; if (alongRidge) for (const [aa, s] of [[0, -1], [L, 1]]) B('timber', aa + (s < 0 ? -0.12 : 0), tm - 0.09, aa + (s < 0 ? 0 : 0.12), tm + 0.09, yR - 0.9, yR); else B('timber', tm - 0.09, -0.12, tm + 0.09, 0, yR - 0.9, yR); }
    } else if (!alongRidge) { /* hipped thatch closes itself */ }
    topY[0] = yE + rise + 0.3;
    // a lean-to at the back or the side (the kitchen, the shed)
    if (det >= 1 && rand() < 0.55) {
      const aw = Math.min(3.2, L * 0.55), a0 = rand() < 0.5 ? 0.3 : L - aw - 0.3, hs = 2.1;
      B(thatch ? 'mud_plaster' : wall, a0, D, a0 + aw, D + 2.6, P0, P0 + hs - 0.1);
      B('wood_dark', a0 + aw / 2 - 0.4, D + 2.58, a0 + aw / 2 + 0.4, D + 2.62, P0, P0 + 1.7);
      const sm = thatch ? 'thatch' : 'tile_dark';
      surf(sm, [W(a0 - 0.3, D - 0.05, P0 + hs + 0.9), W(a0 + aw + 0.3, D - 0.05, P0 + hs + 0.9), W(a0 + aw + 0.3, D + 3.0, P0 + hs - 0.1), W(a0 - 0.3, D + 3.0, P0 + hs - 0.1)], UP);
      surf('timber', [W(a0 - 0.3, D + 3.0, P0 + hs - 0.3), W(a0 + aw + 0.3, D + 3.0, P0 + hs - 0.3), W(a0 + aw + 0.3, D + 3.0, P0 + hs - 0.1), W(a0 - 0.3, D + 3.0, P0 + hs - 0.1)], dirV(1));
      surf('timber', [W(a0 - 0.3, D - 0.05, P0 + hs + 0.9 - 0.15), W(a0 - 0.3, D + 3.0, P0 + hs - 0.3), W(a0 + aw + 0.3, D + 3.0, P0 + hs - 0.3), W(a0 + aw + 0.3, D - 0.05, P0 + hs + 0.9 - 0.15)], DN);
      for (const [aa, s] of [[a0 - 0.3, -1], [a0 + aw + 0.3, 1]]) surf(sm, [W(aa, D - 0.05, P0 + hs + 0.9 - 0.15), W(aa, D + 3.0, P0 + hs - 0.3), W(aa, D + 3.0, P0 + hs - 0.1), W(aa, D - 0.05, P0 + hs + 0.9)], dirU(s));
      cRect(a0, D, a0 + aw, D + 2.6, 0, P0 + hs);
    }
    if (kind === 'farm') farmstead();
    cleanUp(topY[0]);
    return;
  }

  function farmstead() {
    // the barn beside the house, a straw stack, a wattle fence round the yard, a trough
    const bw = 4.6, bd = 4.2, a0 = L + 1.2;
    B('granite_grey', a0, 0.2, a0 + bw, 0.2 + bd, -0.3, 0.14, false);
    B('mud_plaster', a0, 0.2, a0 + bw, 0.5, 0.14, 2.0); B('mud_plaster', a0, 0.2 + bd - 0.3, a0 + bw, 0.2 + bd, 0.14, 2.0); B('mud_plaster', a0 + bw - 0.3, 0.2, a0 + bw, 0.2 + bd, 0.14, 2.0);
    B('wood_dark', a0, 0.5, a0 + 0.2, 0.2 + bd - 0.3, 0.14, 1.9);
    cRect(a0, 0.2, a0 + bw, 0.2 + bd, 0, 2.6);
    surf('thatch', [W(a0 - 0.5, -0.4, 1.7), W(a0 + bw + 0.5, -0.4, 1.7), W(a0 + bw + 0.5, 0.2 + bd / 2, 3.0), W(a0 - 0.5, 0.2 + bd / 2, 3.0)], UP);
    surf('thatch', [W(a0 - 0.5, 0.2 + bd + 0.4, 1.7), W(a0 + bw + 0.5, 0.2 + bd + 0.4, 1.7), W(a0 + bw + 0.5, 0.2 + bd / 2, 3.0), W(a0 - 0.5, 0.2 + bd / 2, 3.0)], UP);
    for (const [aa, s] of [[a0 - 0.5, -1], [a0 + bw + 0.5, 1]]) { surf('thatch', [W(aa, -0.4, 1.7), W(aa, 0.2 + bd / 2, 3.0), W(aa, 0.2 + bd + 0.4, 1.7)], dirU(s)); }
    // the straw stack
    const g = lathe([[0.001, 0], [1.5, 0], [1.55, 0.3], [1.3, 1.3], [0.7, 2.3], [0.2, 2.9], [0.001, 3.1]], 10), q = W(a0 + bw + 3.2, 3.4, 0); g.translate(q[0], q[1], q[2]); bag.add('thatch', g); cCircle(a0 + bw + 3.2, 3.4, 1.5, 0, 3);
    B('wood_dark', a0 + 0.8, 5.2, a0 + 2.6, 5.7, 0.0, 0.5); B('wood_dark', a0 + 0.8, 5.2, a0 + 0.85, 5.7, 0.5, 0.9);   // a trough
  }
  function cleanUp(top) {
    void top;
    for (const [mat, A] of acc) if (A.length) bag.add(mat, fromTriangles(A));
    // the yard's wattle fence, the well
    if (det >= 1 && (kind === 'house' || kind === 'thatch' || kind === 'farm')) yardFence();
    if (el.well) wellAt(el.well);
  }
  function yardFence() {
    const [rx0, rz0, rx1, rz1] = el.rect, A = arr('wicker'), Q = arr('timber');
    // the lot's side and back lines behind the building (outside it): posts every 2.2 m and woven panels 1.15 m high
    const fenceLine = (p, q, h = 1.15) => {
      const l = Math.hypot(q[0] - p[0], q[1] - p[1]), n = Math.max(1, Math.round(l / 2.2));
      for (let k = 0; k < n; k++) {
        const a = [p[0] + (q[0] - p[0]) * k / n, p[1] + (q[1] - p[1]) * k / n], b = [p[0] + (q[0] - p[0]) * (k + 1) / n, p[1] + (q[1] - p[1]) * (k + 1) / n];
        if (kind === 'farm' && k === Math.floor(n / 2) && l > 6) { fp(a, 0.07, h + 0.2); fp(b, 0.07, h + 0.2); continue; }     // a gap: the gate
        const g = box(Math.min(a[0], b[0]) - 0.04, 0.1, Math.min(a[1], b[1]) - 0.04, Math.max(a[0], b[0]) + 0.04, h, Math.max(a[1], b[1]) + 0.04);
        for (const x of g.attributes.position.array) A.push(x);
        fp(a, 0.06, h + 0.12);
        col.segment(a, b, 0.1, 0, h);
      }
      fp(q, 0.06, h + 0.12);
    };
    const fp = (p, r, h) => { const g = box(p[0] - r, 0, p[1] - r, p[0] + r, h, p[1] + r); for (const x of g.attributes.position.array) Q.push(x); };
    const ins = 0.25;
    if (f === 's') { fenceLine([rx0 + ins, z0], [rx0 + ins, rz0 + ins]); fenceLine([rx0 + ins, rz0 + ins], [rx1 - ins, rz0 + ins]); fenceLine([rx1 - ins, rz0 + ins], [rx1 - ins, z0]); }
    else if (f === 'n') { fenceLine([rx0 + ins, z1], [rx0 + ins, rz1 - ins]); fenceLine([rx0 + ins, rz1 - ins], [rx1 - ins, rz1 - ins]); fenceLine([rx1 - ins, rz1 - ins], [rx1 - ins, z1]); }
    else if (f === 'e') { fenceLine([x0, rz0 + ins], [rx0 + ins, rz0 + ins]); fenceLine([rx0 + ins, rz0 + ins], [rx0 + ins, rz1 - ins]); fenceLine([rx0 + ins, rz1 - ins], [x0, rz1 - ins]); }
    else { fenceLine([x1, rz0 + ins], [rx1 - ins, rz0 + ins]); fenceLine([rx1 - ins, rz0 + ins], [rx1 - ins, rz1 - ins]); fenceLine([rx1 - ins, rz1 - ins], [x1, rz1 - ins]); }
    bag.add('wicker', fromTriangles(A)); bag.add('timber', fromTriangles(Q));
  }
  function wellAt([wx, wz]) {
    // a well with a stone coping, two posts and a crossbar with the bucket's rope (a sweep, jiegao, was also common in the north)
    const ring = lathe([[0.4, 0], [0.62, 0], [0.62, 0.55], [0.46, 0.55], [0.46, 0.2], [0.4, 0.2]], 10);
    ring.translate(wx, 0, wz); bag.add('granite_grey', ring);
    const T = [], b = (x0_, y0_, z0_, x1_, y1_, z1_) => { for (const q of box(x0_, y0_, z0_, x1_, y1_, z1_).attributes.position.array) T.push(q); };
    b(wx - 0.55, 0.55, wz - 0.05, wx - 0.45, 1.9, wz + 0.05); b(wx + 0.45, 0.55, wz - 0.05, wx + 0.55, 1.9, wz + 0.05); b(wx - 0.6, 1.8, wz - 0.04, wx + 0.6, 1.9, wz + 0.04);
    b(wx - 0.28, 0.9, wz - 0.03, wx - 0.24, 1.8, wz + 0.03); b(wx - 0.36, 0.7, wz - 0.12, wx - 0.12, 0.92, wz + 0.12);
    bag.add('timber', fromTriangles(T));
    col.circle(wx, wz, 0.66, 0, 0.6);
  }
  void gableInfill; void posts; void fascia; void dirV; void dirU; void DN; void UP;
}
