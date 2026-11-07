// Sanchi's other monuments, on top of the Great Stupa's style (src/buildings/sanchi-great-stupa/style.js):
// Stupa 2 down the west slope with its carved railing — a medallion and two half medallions on every post,
// four bent (L-shaped) entrances and no gateway — and Temple 40, the pillared hall of fifty columns on its high
// platform. docs/settlements/sanchi.md §10.

import '../../buildings/sanchi-great-stupa/style.js';
import { STYLES, registerStyle } from '../../core/build.js';
import { lathe, fromTriangles, orientOutward } from '../../core/geom.js';
import { hexa, obox } from '../../styles/chinese/index.js';
import { rite } from '../../styles/indian/rites.js';

const RAIL = 'sandstone_rail', STONE = 'sandstone_dressed';

/**
 * A run of railing (vedika) from a to b at y, height h { posts at `pitch` }: posts of lens section, three
 * lens-shaped crossbars in each bay, a coping rounded on top; on both faces of every post a lotus medallion in
 * the middle and a half medallion at the foot and at the head. `carved` posts (the entrances') carry panels of
 * relief from the foot to the head instead. Returns nothing; adds to the triangle lists.
 */
function vedikaRun(L, a, b, y, h, pitch, carvedEnds = [false, false], skipFirst = false) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]), u = [(b[0] - a[0]) / len, (b[1] - a[1]) / len], n = [-u[1], u[0]];
  const np = Math.max(1, Math.round(len / pitch)), pw = 0.16, pd = 0.13, yc = y + h * 0.84;
  const P = (t, d, yy) => [a[0] + u[0] * t + n[0] * d, yy, a[1] + u[1] * t + n[1] * d];
  for (let k = 0; k <= np; k++) {
    const t = len * k / np;
    if (k === 0 && skipFirst) { addBars(k, t); continue; }
    // the post: a lens (bevelled) section in two hexahedra
    const q = (yy, w, d) => [P(t - w, -d, yy), P(t + w, -d, yy), P(t + w, d, yy), P(t - w, d, yy)];
    hexa(L.post, q(y, pw, pd * 0.6), q(yc, pw, pd * 0.6));
    hexa(L.post, q(y, pw * 0.62, pd), q(yc, pw * 0.62, pd));
    const carved = (k === 0 && carvedEnds[0]) || (k === np && carvedEnds[1]);
    for (const side of [-1, 1]) {
      if (carved) {
        // four framed panels of relief one above another: a raised field with a figure-like boss in each
        for (let j = 0; j < 4; j++) {
          const y0 = y + 0.12 + j * (h * 0.8 - 0.12) / 4, y1 = y0 + (h * 0.8 - 0.12) / 4 - 0.06;
          hexa(L.relief, [P(t - pw * 0.55, side * pd, y0), P(t + pw * 0.55, side * pd, y0), P(t + pw * 0.55, side * (pd + 0.025), y0), P(t - pw * 0.55, side * (pd + 0.025), y0)],
            [P(t - pw * 0.55, side * pd, y1), P(t + pw * 0.55, side * pd, y1), P(t + pw * 0.55, side * (pd + 0.025), y1), P(t - pw * 0.55, side * (pd + 0.025), y1)]);
          const m = P(t, side * (pd + 0.025), (y0 + y1) / 2);
          L.boss.push(lathe([[0.001, -0.13], [0.05, -0.1], [0.06, 0.02], [0.04, 0.08], [0.05, 0.11], [0.001, 0.15]], 6, null, m[0], m[1], m[2]));
        }
        continue;
      }
      // the medallions: a lotus (a disc with a ring of petals and a seed-pod boss) facing out of the post
      for (const [yy, half] of [[y + h * 0.42, 0], [y + 0.02, 1], [yc - 0.02, -1]]) {
        const c = P(t, side * pd, yy), r = 0.13, petals = 8 + 4 * ((k + (half + 1)) % 3);
        const g = lathe([[r, 0], [r, 0.012], [r * 0.82, 0.028], [r * 0.45, 0.034], [r * 0.3, 0.045], [r * 0.18, 0.05], [0.001, 0.05]], 2 * petals,
          (th, i) => (i >= 1 && i <= 3 ? 0.88 + 0.12 * Math.abs(Math.cos(th * petals / 2)) : 1), 0, 0, 0);
        // turn the disc's axis (+y) to the face's normal, then keep only its upper or lower half for the half medallions
        g.rotateX(Math.PI / 2); g.rotateY(Math.atan2(n[0] * side, n[1] * side));
        const pos = g.attributes.position.array;
        if (half) for (let i = 1; i < pos.length; i += 3) pos[i] = half > 0 ? Math.max(0, pos[i]) : Math.min(0, pos[i]);
        g.translate(c[0], c[1], c[2]);
        L.medal.push(g);
      }
    }
    if (k === np) break;
    addBars(k, t);
  }
  function addBars(k, t) {
    // the crossbars to the next post
    const t0 = t + pw * 0.6, t1 = len * (k + 1) / np - pw * 0.6;
    for (let j = 0; j < 3; j++) {
      const y0 = y + h * (0.16 + j * 0.23), y1 = y0 + h * 0.15, ym = (y0 + y1) / 2, e = 0.07;
      hexa(L.bar, [P(t0, -e * 0.3, y0), P(t1, -e * 0.3, y0), P(t1, e * 0.3, y0), P(t0, e * 0.3, y0)], [P(t0, -e, ym), P(t1, -e, ym), P(t1, e, ym), P(t0, e, ym)]);
      hexa(L.bar, [P(t0, -e, ym), P(t1, -e, ym), P(t1, e, ym), P(t0, e, ym)], [P(t0, -e * 0.3, y1), P(t1, -e * 0.3, y1), P(t1, e * 0.3, y1), P(t0, e * 0.3, y1)]);
    }
  }
  // the coping over the whole run: a flat foot and a rounded top
  const cw = 0.22, ch = h - (yc - y);
  const prof = [[-cw, 0], [cw, 0], [cw, ch * 0.5], [cw * 0.7, ch * 0.85], [0, ch], [-cw * 0.7, ch * 0.85], [-cw, ch * 0.5]];
  const T = [];
  for (let i = 0; i < prof.length; i++) {
    const [d0, h0] = prof[i], [d1, h1] = prof[(i + 1) % prof.length];
    T.push(...P(-0.2, d0, yc + h0), ...P(len + 0.2, d0, yc + h0), ...P(len + 0.2, d1, yc + h1), ...P(-0.2, d0, yc + h0), ...P(len + 0.2, d1, yc + h1), ...P(-0.2, d1, yc + h1));
  }
  // its two ends closed
  for (const t of [-0.2, len + 0.2]) for (let i = 1; i < prof.length - 1; i++) T.push(...P(t, prof[0][0], yc + prof[0][1]), ...P(t, prof[i][0], yc + prof[i][1]), ...P(t, prof[i + 1][0], yc + prof[i + 1][1]));
  L.cope.push(...orientOutward(T));
}
/**
 * Stupa 2 { c, s, y, rv (the railing's radius), h (its height), stair }: the Great Stupa's dome, terrace, berm railing and
 * stairway at scale s, its plain ground railing replaced by the carved one: chords of vedika round the circle, opened at
 * the four quarters, each opening screened by an L-shaped wing of railing so that one turns to enter (all four the same
 * way round); the posts at the openings carved from foot to head.
 */
function stupa2(el, ctx) {
  const { bag, col } = ctx, s = el.s, y = el.y ?? 0, [cx, cz] = el.c, RV0 = 24 * s, H0 = 3.1 * s;
  const skipRail = (b) => b.min.y <= y + 0.01 && b.max.y >= y + H0 - 0.01 && b.max.y <= y + H0 + 0.05 && b.max.x - b.min.x > 2 * RV0 - 2;
  const keep = { add(mat, g) { g.computeBoundingBox(); if (mat === RAIL && skipRail(g.boundingBox)) return; bag.add(mat, g); } };
  const kcol = Object.create(col);
  kcol.segment = (a, b, th, y0, y1) => { if (Math.abs(y0 - y) < 0.01 && Math.abs(y1 - y - H0) < 0.01) return; col.segment(a, b, th, y0, y1); };
  STYLES['indian-sanchi'].elements.stupa({ ...el, gates: [], stair: el.stair ?? true }, { ...ctx, bag: keep, col: kcol });
  const R = el.rv ?? 11.5, h = el.h ?? 2.4, gap = 1.3, wing = 2.4, L = { post: [], bar: [], cope: [], medal: [], relief: [], boss: [] };
  const N = 40, pt = (a, r = R) => [cx + Math.cos(a) * r, cz + Math.sin(a) * r];
  const wall = (a, b) => col.segment(a, b, 0.4, y, y + h);
  for (let q = 0; q < 4; q++) {
    // the quarter's arc, from one opening to the next (the openings at the cardinal points, half-width `gap`)
    const a0 = q * Math.PI / 2 + gap / R, a1 = (q + 1) * Math.PI / 2 - gap / R, m = Math.round(N / 4);
    for (let i = 0; i < m; i++) {
      const p = pt(a0 + (a1 - a0) * i / m), r2 = pt(a0 + (a1 - a0) * (i + 1) / m);
      vedikaRun(L, p, r2, y, h, 0.95, [i === 0, i === m - 1], i > 0); wall(p, r2);
    }
    // the wing: out from the opening's leading side, then across in front of it, open at its far end
    const ac = (q + 1) * Math.PI / 2, d = [Math.cos(ac), Math.sin(ac)], t = [-d[1], d[0]];
    const base = [cx + d[0] * R + t[0] * -gap, cz + d[1] * R + t[1] * -gap];
    const corner = [base[0] + d[0] * wing, base[1] + d[1] * wing], end = [corner[0] + t[0] * (2 * gap + 1.8), corner[1] + t[1] * (2 * gap + 1.8)];
    const b0 = [base[0] + d[0] * 0.32, base[1] + d[1] * 0.32];
    vedikaRun(L, b0, corner, y, h, 0.95, [false, false]); wall(b0, corner);
    const c1 = [corner[0] + t[0] * 0.3, corner[1] + t[1] * 0.3];
    vedikaRun(L, c1, end, y, h, 0.95, [false, true]); wall(c1, end);
  }
  bag.add(RAIL, fromTriangles(L.post)); bag.add(RAIL, fromTriangles(L.bar)); bag.add(RAIL, fromTriangles(L.cope));
  bag.add('sandstone_relief', fromTriangles(L.relief));
  for (const g of L.medal) bag.add(RAIL, g);
  for (const g of L.boss) bag.add('sandstone_relief', g);
  // the paving of the processional path inside the railing
  bag.add('sandstone_floor', lathe([[R + 0.3, 0.02], [18.3 * s + 0.15, 0.02]], 64, null, cx, y, cz));
}

/**
 * Temple 40 { c, y }: the platform enlarged to 41.76 × 27.74 m, 3.35 m high, faced with dressed stone, with flights up
 * its east and west ends; on it the hall of fifty pillars in five rows of ten — square shafts turning octagonal, with
 * a block capital — carrying timber beams and a barrel roof of thatch on curved rafters, closed at its ends by gables
 * of the horseshoe (caitya) outline seen in Sanchi's reliefs.
 */
function temple40(el, { bag, col }) {
  const [cx, cz] = el.c, y = el.y ?? 0, HX = 41.76 / 2, HZ = 27.74 / 2, PH = 3.35, top = y + PH;
  const S = [], C = [], B = [], T = [], G = [];
  // the platform: a moulded plinth, the face, a coping course
  hexa(S, ...rect(cx, cz, HX + 0.25, HZ + 0.25, y - 0.3, y + 0.35));
  hexa(S, ...rect(cx, cz, HX, HZ, y + 0.35, top - 0.25));
  hexa(S, ...rect(cx, cz, HX + 0.12, HZ + 0.12, top - 0.25, top - 0.02));
  col.rect([cx - HX, cz - HZ, cx + HX, cz + HZ], y, top);
  bag.add('sandstone_floor', fromTriangles(rectTop(cx, cz, HX + 0.12, HZ + 0.12, top)));
  col.floor([cx - HX, cz - HZ, cx + HX, cz + HZ], top);
  // the flights at the east and west ends, between cheek walls
  for (const sx of [-1, 1]) {
    const x0 = cx + sx * HX, run = 6.4, n = Math.round(PH / 0.17), w = 2.4;
    for (let i = 0; i < n; i++) {
      const f0 = i / n, f1 = (i + 1) / n, xa = x0 + sx * run * (1 - f0), xb = x0;
      hexa(S, ...boxPts(Math.min(xa, xb), cz - w, Math.max(xa, xb), cz + w, y - 0.02, y + PH * f1));
      void f1;
    }
    for (const sz of [-1, 1]) hexa(S, ...cheek(x0, cz + sz * (w + 0.3), sx * run, y, PH));
    col.ramp([Math.min(x0, x0 + sx * run), cz - w, Math.max(x0, x0 + sx * run), cz + w], y, top, sx > 0 ? 'w' : 'e');
    for (const sz of [-1, 1]) col.rect([Math.min(x0, x0 + sx * run), cz + sz * (w + 0.3) - 0.3, Math.max(x0, x0 + sx * run), cz + sz * (w + 0.3) + 0.3], y, top + 0.6);
  }
  // the pillars, five rows of ten
  const XS = [], ZS = [], dx = 3.6, dz = 3.6;
  for (let i = 0; i < 10; i++) XS.push(cx + (i - 4.5) * dx);
  for (let j = 0; j < 5; j++) ZS.push(cz + (j - 2) * dz);
  const ph = 4.6;
  for (const x of XS) for (const z of ZS) {
    hexa(C, ...boxPts(x - 0.36, z - 0.36, x + 0.36, z + 0.36, top - 0.02, top + 0.18));                 // the base slab
    hexa(C, ...boxPts(x - 0.24, z - 0.24, x + 0.24, z + 0.24, top + 0.18, top + 1.6));                  // the square lower shaft
    C.push(...orientOutward(oct(x, z, 0.24, 0.2, top + 1.6, top + ph - 0.45)));                                      // the octagonal upper shaft
    hexa(C, ...boxPts(x - 0.28, z - 0.28, x + 0.28, z + 0.28, top + ph - 0.45, top + ph - 0.3));       // a collar
    hexa(C, ...boxPts(x - 0.34, z - 0.42, x + 0.34, z + 0.42, top + ph - 0.3, top + ph));               // the block capital
    col.rect([x - 0.26, z - 0.26, x + 0.26, z + 0.26], top, top + ph);
  }
  // the beams: along each row over the capitals, then across over those
  const yb = top + ph, x0 = XS[0] - 1.2, x1 = XS[9] + 1.2;
  for (const z of ZS) hexa(B, ...boxPts(x0, z - 0.2, x1, z + 0.2, yb, yb + 0.42));
  for (const x of XS) hexa(B, ...boxPts(x - 0.17, ZS[0] - 1.6, x + 0.17, ZS[4] + 1.6, yb + 0.42, yb + 0.78));
  // the barrel roof: thatch over curved rafters on the cross beams; its section a pointed horseshoe
  const half = (ZS[4] - ZS[0]) / 2 + 1.6, rise = 5.2, yr = yb + 0.78;
  const sec = (k, K) => { const a = Math.PI * k / K; return [Math.cos(a) * half * (1 - 0.06 * Math.sin(a)), yr + Math.sin(a) * rise * (0.92 + 0.08 * Math.sin(a))]; };
  const K = 18, X0 = x0 - 0.8, X1 = x1 + 0.8;
  const RT = [], RS = [];
  for (let k = 0; k < K; k++) {
    const a0 = Math.PI * k / K, a1 = Math.PI * (k + 1) / K, [z0, h0] = sec(k, K), [z1, h1] = sec(k + 1, K);
    for (const [off, dst] of [[0.3, RT], [0, RS]]) {
      const P0 = [h0 + off * Math.sin(a0), cz + z0 + off * Math.cos(a0)], P1 = [h1 + off * Math.sin(a1), cz + z1 + off * Math.cos(a1)];
      dst.push(X0, P0[0], P0[1], X1, P0[0], P0[1], X1, P1[0], P1[1], X0, P0[0], P0[1], X1, P1[0], P1[1], X0, P1[0], P1[1]);
    }
  }
  // the thatch faces out of the barrel's axis, the soffit into it
  const axis = (L, sign) => { for (let i = 0; i < L.length; i += 9) {
    const ux = L[i + 3] - L[i], uy = L[i + 4] - L[i + 1], uz = L[i + 5] - L[i + 2], vx = L[i + 6] - L[i], vy = L[i + 7] - L[i + 1], vz = L[i + 8] - L[i + 2];
    const ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, my = (L[i + 1] + L[i + 4] + L[i + 7]) / 3 - yr, mz = (L[i + 2] + L[i + 5] + L[i + 8]) / 3 - cz;
    if ((ny * my + nz * mz) * sign < 0) for (let c = 0; c < 3; c++) { const t = L[i + 3 + c]; L[i + 3 + c] = L[i + 6 + c]; L[i + 6 + c] = t; }
  } return L; };
  T.push(...axis(RT, 1)); B.push(...axis(RS, -1));
  // the ridge of thatch, and the curved rafters showing under the eaves every bay
  hexa(T, ...boxPts(X0, cz - 0.35, X1, cz + 0.35, yr + rise - 0.1, yr + rise + 0.45));
  for (let i = 0; i <= 20; i++) {
    const x = X0 + 0.3 + (X1 - X0 - 0.6) * i / 20;
    for (let k = 0; k < K; k++) { const [z0, h0] = sec(k, K), [z1, h1] = sec(k + 1, K); hexa(B, [[x - 0.08, h0 - 0.18, cz + z0], [x + 0.08, h0 - 0.18, cz + z0], [x + 0.08, h1 - 0.18, cz + z1], [x - 0.08, h1 - 0.18, cz + z1]], [[x - 0.08, h0 + 0.01, cz + z0], [x + 0.08, h0 + 0.01, cz + z0], [x + 0.08, h1 + 0.01, cz + z1], [x - 0.08, h1 + 0.01, cz + z1]]); }
  }
  // the gable ends: a timber frame of the horseshoe outline, its tympanum boarded, with a lattice window
  for (const xg of [X0 + 0.5, X1 - 0.5]) {
    for (let k = 0; k < K; k++) {
      const [z0, h0] = sec(k, K), [z1, h1] = sec(k + 1, K);
      hexa(G, [[xg - 0.12, h0 - 0.35, cz + z0 * 0.97], [xg + 0.12, h0 - 0.35, cz + z0 * 0.97], [xg + 0.12, h1 - 0.35, cz + z1 * 0.97], [xg - 0.12, h1 - 0.35, cz + z1 * 0.97]], [[xg - 0.12, h0, cz + z0], [xg + 0.12, h0, cz + z0], [xg + 0.12, h1, cz + z1], [xg - 0.12, h1, cz + z1]]);
      // the tympanum: a fan of boards from the beam's middle up to the outline, held back from the frame
      const xt = xg - Math.sign(xg - cx) * 0.06;
      if (k % 1 === 0) { const g = [xt, yr, cz, xt, h0 - 0.3, cz + z0 * 0.95, xt, h1 - 0.3, cz + z1 * 0.95]; G.push(...g, ...[xt, yr, cz, xt, h1 - 0.3, cz + z1 * 0.95, xt, h0 - 0.3, cz + z0 * 0.95]); }
    }
    hexa(G, ...boxPts(xg - 0.15, cz - half, xg + 0.15, cz + half, yr - 0.3, yr));
    for (let j = -4; j <= 4; j++) hexa(G, ...boxPts(xg - Math.sign(xg - cx) * 0.02 - 0.05, cz + j * 0.3 - 0.04, xg - Math.sign(xg - cx) * 0.02 + 0.05, cz + j * 0.3 + 0.04, yr + 0.6, yr + 3.2 - Math.abs(j) * 0.25));
  }
  bag.add(STONE, fromTriangles(S)); bag.add(STONE, fromTriangles(C));
  bag.add('timber', fromTriangles(B)); bag.add('timber', fromTriangles(G));
  bag.add('thatch', fromTriangles(T));
}
const rect = (cx, cz, hx, hz, y0, y1) => boxPts(cx - hx, cz - hz, cx + hx, cz + hz, y0, y1);
function boxPts(x0, z0, x1, z1, y0, y1) { const c = (y) => [[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]]; return [c(y0), c(y1)]; }
function rectTop(cx, cz, hx, hz, y) { return [cx - hx, y + 0.005, cz - hz, cx - hx, y + 0.005, cz + hz, cx + hx, y + 0.005, cz + hz, cx - hx, y + 0.005, cz - hz, cx + hx, y + 0.005, cz + hz, cx + hx, y + 0.005, cz - hz]; }
/** A sloping cheek wall beside a flight: from the platform's edge x0 out by `run` (signed), full height at the platform. */
function cheek(x0, z, run, y, H) {
  const w = 0.3, xa = x0 + run;
  return [[[x0, y - 0.02, z - w], [xa, y - 0.02, z - w], [xa, y - 0.02, z + w], [x0, y - 0.02, z + w]], [[x0, y + H + 0.6, z - w], [xa, y + 0.6, z - w], [xa, y + 0.6, z + w], [x0, y + H + 0.6, z + w]]];
}
/** An octagonal shaft from radius r0 at y0 to r1 at y1. */
function oct(x, z, r0, r1, y0, y1) {
  const out = [];
  for (let k = 0; k < 8; k++) {
    const a = (k + 0.5) * Math.PI / 4, b = (k + 1.5) * Math.PI / 4, k0 = r0 / Math.cos(Math.PI / 8), k1 = r1 / Math.cos(Math.PI / 8);
    const A = [x + Math.cos(a) * k0, y0, z + Math.sin(a) * k0], B2 = [x + Math.cos(b) * k0, y0, z + Math.sin(b) * k0], C2 = [x + Math.cos(b) * k1, y1, z + Math.sin(b) * k1], D = [x + Math.cos(a) * k1, y1, z + Math.sin(a) * k1];
    out.push(...A, ...C2, ...B2, ...A, ...D, ...C2);
    out.push(x, y1, z, ...C2, ...D);
  }
  return out;
}
void obox;

const base = STYLES['indian-sanchi'];
registerStyle('sanchi-site', { ...base, elements: { ...base.elements, stupa2, temple40, rite } });
