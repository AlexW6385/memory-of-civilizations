// Northern Song Bianjing as Zhang Zeduan painted it (docs/settlements/song-kaifeng.md §4, §5, §10):
// the Rainbow Bridge's woven timber arch, the grain boats with their bipod masts, the wine shops'
// colour gates (caimen huanmen) and blue-and-white wine flags, the sedan chairs, the vendors'
// parasols, the city gate with its timber-framed trapezoidal passage.

import { box, lathe, rod, fromTriangles, orientOutward } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';
import { LANDING_ELEMENTS } from './landing.js';

/** Push the triangles of a convex polygon (points in order), turned to face `n` (a direction). */
function face(out, pts, n) {
  const [a, b, c] = pts, ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const flip = (uy * vz - uz * vy) * n[0] + (uz * vx - ux * vz) * n[1] + (ux * vy - uy * vx) * n[2] < 0;
  for (let k = 1; k < pts.length - 1; k++) { const p = flip ? [pts[0], pts[k + 1], pts[k]] : [pts[0], pts[k], pts[k + 1]]; for (const q of p) out.push(...q); }
}
/** A six-faced convex solid from its eight corners (bottom four, then the top four, in the same order). */
export function hexa(out, c) {
  const t = [], q = (i, j, k, l) => t.push(...c[i], ...c[j], ...c[k], ...c[i], ...c[k], ...c[l]);
  q(0, 1, 2, 3); q(4, 5, 6, 7); q(0, 1, 5, 4); q(1, 2, 6, 5); q(2, 3, 7, 6); q(3, 0, 4, 7);
  for (const v of orientOutward(t)) out.push(v);
}
const ballG = (r, x, y, z, n = 8) => lathe(Array.from({ length: 7 }, (_, i) => { const t = i / 6 * Math.PI; return [Math.max(0.001, Math.sin(t) * r), r - Math.cos(t) * r]; }), n, null, x, y - r, z);

/**
 * rainbow_bridge: the woven timber arch over the Bian { at, across ('x' | 'z'), span (the clear span
 * between the abutments' faces), width, spring (the springing's height), crown (the arch's rise),
 * y0 (the abutments' top), bed, abut (how far the abutments reach back from the arch), deckEnd }.
 * Two systems of logs alternate across the width — 11 ribs of four members (two short, two long,
 * meeting at a crown beam), 10 of three (two inclined, one level) — locked by five transverse beams,
 * each system's logs passing under the other's beams; on the arch short posts carry cross-beams and
 * the deck of planks, railings on both sides; stone abutments; tall posts at the four corners.
 */
function rainbowBridge(el, { bag, col }) {
  const [cx, cz] = el.at, alongZ = el.across === 'z';
  const P = (s, o, y) => (alongZ ? [cx + o, y, cz + s] : [cx + s, y, cz + o]);
  const S = el.span / 2, W = el.width / 2, ys = el.spring ?? -0.6, hc = el.crown ?? 4.0, d = 0.42, r = 0.19, rb = 0.22;
  const y0 = el.y0 ?? 0.06, E = el.deckEnd ?? S + 0.6, reach = el.abut ?? 5.6, bed = el.bed ?? -4;
  // the nodes: the four-member system's at ±a and the crown, the three-member system's at ±b;
  // each system's logs pass d under the other's beam (the weave), which fixes the heights
  const a = S * 0.62, b = a / 2, k = (S - a) / (S - b);
  const ha = (k * hc / 2 - k * d + d) / (1 - k / 2), hb = (ha + hc) / 2 - d;
  const A = [[-S, 0], [-a, ha], [0, hc], [a, ha], [S, 0]], B = [[-S, 0], [-b, hb], [b, hb], [S, 0]];
  const yOn = (poly, s) => { for (let i = 0; i + 1 < poly.length; i++) { const [s0, h0] = poly[i], [s1, h1] = poly[i + 1]; if (s >= s0 && s <= s1) return h0 + (h1 - h0) * (s - s0) / (s1 - s0); } return 0; };
  const ribs = 21, ro = (j) => -W + r + j * (2 * W - 2 * r) / (ribs - 1);
  for (let j = 0; j < ribs; j++) {
    const poly = j % 2 === 0 ? A : B, o = ro(j);
    for (let i = 0; i + 1 < poly.length; i++) {
      let [s0, h0] = poly[i], [s1, h1] = poly[i + 1];
      // the end members run on into the abutments' seats
      if (i === 0) { const L = Math.hypot(s1 - s0, h1 - h0); s0 -= (s1 - s0) / L * 0.5; h0 -= (h1 - h0) / L * 0.5; }
      if (i === poly.length - 2) { const L = Math.hypot(s1 - s0, h1 - h0); s1 += (s1 - s0) / L * 0.5; h1 += (h1 - h0) / L * 0.5; }
      bag.add('timber', rod(P(s0, o, ys + h0), P(s1, o, ys + h1), r, 8));
    }
  }
  // the five transverse beams, their ends standing out beyond the outer ribs; rope lashings at the crossings
  for (const [s, h] of [[-a, ha], [-b, hb], [0, hc], [b, hb], [a, ha]]) {
    bag.add('wood_dark', rod(P(s, -W - 0.35, ys + h), P(s, W + 0.35, ys + h), rb, 10));
    for (const o of [-W - 0.12, W + 0.12]) bag.add('sacking', rod(P(s, o - 0.09, ys + h), P(s, o + 0.09, ys + h), rb + 0.035, 10));
  }
  // the deck: its line from the abutments to the crown; the stations where cross-beams on posts carry it
  const yc = ys + hc + rb + 0.25 + 0.22 + 0.1;
  const deck = (s) => y0 + 0.06 + (yc - y0 - 0.06) * (1 - Math.min(1, Math.abs(s) / E) ** 1.3);
  const st = [0, b / 2, b, (a + b) / 2, a, (a + S) / 2, S + 0.25].flatMap((s) => (s ? [-s, s] : [0])).sort((p, q) => p - q);
  const cross = [], posts = [];
  for (const s of st) {
    const top = deck(s) - 0.1, bot = top - 0.22, ends = Math.abs(s) > S;
    hexa(cross, [P(s - 0.12, -W, bot), P(s + 0.12, -W, bot), P(s + 0.12, W, bot), P(s - 0.12, W, bot), P(s - 0.12, -W, top), P(s + 0.12, -W, top), P(s + 0.12, W, top), P(s - 0.12, W, top)]);
    if (ends) { bag.add('granite_block', box(...(alongZ ? [cx - W, y0 - 0.02, cz + s - 0.2, cx + W, bot + 0.01, cz + s + 0.2] : [cx + s - 0.2, y0 - 0.02, cz - W, cx + s + 0.2, bot + 0.01, cz + W]))); continue; }
    for (let j = 0; j < ribs; j += 2) {
      const o = ro(j), foot = ys + yOn(A, s) + r * 0.7;
      if (bot - foot > 0.08) posts.push(rod(P(s, o, foot), P(s, o, bot + 0.02), 0.09, 6));
    }
  }
  bag.add('wood_dark', fromTriangles(cross));
  for (const g of posts) bag.add('timber', g);
  // the planks across, a finger's gap between them
  const planks = [], n = Math.ceil(2 * E / 0.3);
  for (let i = 0; i < n; i++) {
    const s0 = -E + 2 * E * i / n + 0.008, s1 = -E + 2 * E * (i + 1) / n - 0.008;
    const t0 = deck(s0), t1 = deck(s1);
    hexa(planks, [P(s0, -W, t0 - 0.1), P(s1, -W, t1 - 0.1), P(s1, W, t1 - 0.1), P(s0, W, t0 - 0.1), P(s0, -W, t0), P(s1, -W, t1), P(s1, W, t1), P(s0, W, t0)]);
  }
  bag.add('planks_grey', fromTriangles(planks));
  // the railings: posts with capped heads, a top and a middle rail following the deck, balusters between
  const rail = [], heads = [], m = Math.round(2 * E / 1.35);
  for (const side of [-1, 1]) {
    const o = side * (W - 0.09);
    for (let i = 0; i <= m; i++) {
      const s = -E + 2 * E * i / m, y = deck(s), end = i === 0 || i === m;
      hexa(rail, [P(s - 0.07, o - 0.07, y - 0.05), P(s + 0.07, o - 0.07, y - 0.05), P(s + 0.07, o + 0.07, y - 0.05), P(s - 0.07, o + 0.07, y - 0.05), P(s - 0.07, o - 0.07, y + 1.12), P(s + 0.07, o - 0.07, y + 1.12), P(s + 0.07, o + 0.07, y + 1.12), P(s - 0.07, o + 0.07, y + 1.12)]);
      const hp = P(s, o, y + 1.12);
      heads.push(lathe([[0.1, 0], [0.11, 0.05], [0.06, 0.12], [0.08, 0.18], [0.001, 0.26]], 8, null, hp[0], hp[1], hp[2]));
      if (end) continue;
      const s1 = -E + 2 * E * (i + 1) / m;
      for (const [hgt, th] of [[1.0, 0.06], [0.42, 0.045]]) {
        const ya = deck(s) + hgt, yb = deck(s1) + hgt;
        hexa(rail, [P(s, o - 0.045, ya - th), P(s1, o - 0.045, yb - th), P(s1, o + 0.045, yb - th), P(s, o + 0.045, ya - th), P(s, o - 0.045, ya + th), P(s1, o - 0.045, yb + th), P(s1, o + 0.045, yb + th), P(s, o + 0.045, ya + th)]);
      }
      for (const f of [0.33, 0.67]) { const sb = s + (s1 - s) * f, yb = deck(sb); rail.push(...fromTri(rod(P(sb, o, yb + 0.47), P(sb, o, yb + 0.94), 0.025, 5))); }
    }
  }
  bag.add('timber_red', fromTriangles(rail));
  for (const g of heads) bag.add('timber_red', g);
  // the abutments: dressed stone from the bed, their tops level with the banks; the corner posts (biao) with crossed boards and a crane on top
  for (const sg of [-1, 1]) {
    const sA = sg * S, sB = sg * (S + reach), [p, q] = [P(Math.min(sA, sB), -W - 1.0, 0), P(Math.max(sA, sB), W + 1.0, 0)];
    const rect = [Math.min(p[0], q[0]), Math.min(p[2], q[2]), Math.max(p[0], q[0]), Math.max(p[2], q[2])];
    bag.add('granite_block', box(rect[0], bed, rect[1], rect[2], y0, rect[3]));
    col.rect(rect, bed, y0 - 0.02); col.floor(rect, y0);
    for (const os of [-1, 1]) {
      const s = sg * (E + 1.0), o = os * (W + 0.55), bp = P(s, o, y0);
      bag.add('granite_block', box(bp[0] - 0.4, y0 - 0.02, bp[2] - 0.4, bp[0] + 0.4, y0 + 0.5, bp[2] + 0.4));
      bag.add('timber', lathe([[0.16, 0], [0.14, 7.2], [0.12, 8.2], [0.001, 8.25]], 10, null, bp[0], y0 + 0.5, bp[2]));
      const cb = []; beamTris(cb, P(s - 0.6, o, y0 + 7.3), P(s + 0.6, o, y0 + 7.3), 0.03, 0.22); beamTris(cb, P(s, o - 0.6, y0 + 7.0), P(s, o + 0.6, y0 + 7.0), 0.03, 0.22);
      bag.add('wood_dark', fromTriangles(cb));
      // the crane: body, neck and head, the beak toward the river
      const tp = P(s, o, y0 + 8.75), bd = lathe([[0.001, -0.3], [0.13, -0.2], [0.16, 0], [0.12, 0.18], [0.001, 0.28]], 8);
      if (alongZ) bd.rotateX(Math.PI / 2); else bd.rotateZ(Math.PI / 2);
      bd.translate(tp[0], tp[1], tp[2]); bag.add('paint_white', bd);
      const nk = P(s - sg * 0.2, o, y0 + 8.85), hd = P(s - sg * 0.32, o, y0 + 9.35);
      bag.add('paint_white', rod(nk, hd, 0.045, 5));
      bag.add('lacquer_black', rod(hd, P(s - sg * 0.55, o, y0 + 9.3), 0.025, 4));
      bag.add('cloth_red', ballG(0.055, hd[0], hd[1] + 0.07, hd[2], 6));
      bag.add('wood_dark', rod(P(s, o, y0 + 8.25), tp, 0.03, 4));
      col.circle(bp[0], bp[2], 0.4, y0, y0 + 8.3);
    }
  }
  // walking: ramps up to the crown and down again; the railings stop one
  const K = 10;
  for (const sg of [-1, 1]) for (let i = 0; i < K; i++) {
    const s0 = sg * E * i / K, s1 = sg * E * (i + 1) / K, p = P(s0, -W + 0.2, 0), q = P(s1, W - 0.2, 0);
    const rect = [Math.min(p[0], q[0]), Math.min(p[2], q[2]), Math.max(p[0], q[0]), Math.max(p[2], q[2])];
    const dir = alongZ ? (sg > 0 ? 'n' : 's') : (sg > 0 ? 'w' : 'e');
    col.ramp(rect, deck(s1), deck(s0), dir);
  }
  for (const o of [-W + 0.09, W - 0.09]) { const p = P(-E, o, 0), q = P(E, o, 0); col.segment([p[0], p[2]], [q[0], q[2]], 0.2, y0 - 2, yc + 1.4); }
}
const fromTri = (g) => { const p = g.index ? g.toNonIndexed() : g; return Array.from(p.attributes.position.array); };

/**
 * song_boat: a grain boat of the Bian { at, dir ([dx, dz], the bow), len, beam, y (the water), mast
 * (degrees from upright, laid back toward the stern; 90 lies on its crutch), sail (a batten lug sail,
 * hoisted), seed }: the flat-bottomed hull with its raised, square bow and stern, wales, the deck; the
 * long house of boards with lattice windows under a vaulted mat roof; the bipod mast in its tabernacle,
 * its stay; the great rudder and tiller, a sculling oar.
 */
function songBoat(el, { bag }) {
  const [x, z] = el.at, L = el.len ?? 18, Bm = (el.beam ?? L * 0.25) / 2, yw = el.y ?? 0, [dx0, dz0] = el.dir ?? [1, 0];
  const dl = Math.hypot(dx0, dz0) || 1, dx = dx0 / dl, dz = dz0 / dl, nx = -dz, nz = dx;
  const P = (s, o, yy) => [x + dx * s + nx * o, yy, z + dz * s + nz * o];
  const Ns = 16, H = L / 2;
  const w = (t) => Bm * (1 - (t > 0 ? 0.5 : 0.4) * Math.abs(t) ** 2.6);
  const sheer = (t) => yw + 0.95 + 0.35 * t * t + (t > 0 ? 0.7 : 0.45) * t ** 6;
  const chine = (t) => yw - 0.5 + (t > 0 ? 0.75 : 0.55) * Math.abs(t) ** 3.2;
  const deckY = (t) => sheer(t) - 0.3;
  const hull = [], wale = [], dk = [];
  for (let i = 0; i < Ns; i++) {
    const t0 = -1 + 2 * i / Ns, t1 = -1 + 2 * (i + 1) / Ns, s0 = t0 * H, s1 = t1 * H;
    for (const sg of [-1, 1]) {
      face(hull, [P(s0, sg * w(t0), sheer(t0)), P(s1, sg * w(t1), sheer(t1)), P(s1, sg * w(t1) * 0.82, chine(t1)), P(s0, sg * w(t0) * 0.82, chine(t0))], [nx * sg, 0, nz * sg]);
      // the inner face of the bulwark above the deck
      face(hull, [P(s0, sg * (w(t0) - 0.07), sheer(t0)), P(s1, sg * (w(t1) - 0.07), sheer(t1)), P(s1, sg * (w(t1) - 0.07), deckY(t1) - 0.02), P(s0, sg * (w(t0) - 0.07), deckY(t0) - 0.02)], [-nx * sg, 0, -nz * sg]);
      face(hull, [P(s0, sg * w(t0), sheer(t0)), P(s1, sg * w(t1), sheer(t1)), P(s1, sg * (w(t1) - 0.07), sheer(t1)), P(s0, sg * (w(t0) - 0.07), sheer(t0))], [0, 1, 0]);
      // two wales along the side
      for (const f of [0.18, 0.55]) {
        const ya = sheer(t0) + (chine(t0) - sheer(t0)) * f, yb = sheer(t1) + (chine(t1) - sheer(t1)) * f, oa = sg * (w(t0) - (w(t0) * 0.18) * f + 0.06), ob = sg * (w(t1) - (w(t1) * 0.18) * f + 0.06);
        hexa(wale, [P(s0, oa - 0.07, ya - 0.09), P(s1, ob - 0.07, yb - 0.09), P(s1, ob + 0.07, yb - 0.09), P(s0, oa + 0.07, ya - 0.09), P(s0, oa - 0.07, ya + 0.09), P(s1, ob - 0.07, yb + 0.09), P(s1, ob + 0.07, yb + 0.09), P(s0, oa + 0.07, ya + 0.09)]);
      }
    }
    face(hull, [P(s0, -w(t0) * 0.82, chine(t0)), P(s1, -w(t1) * 0.82, chine(t1)), P(s1, w(t1) * 0.82, chine(t1)), P(s0, w(t0) * 0.82, chine(t0))], [0, -1, 0]);
    face(dk, [P(s0, -w(t0) + 0.06, deckY(t0)), P(s1, -w(t1) + 0.06, deckY(t1)), P(s1, w(t1) - 0.06, deckY(t1)), P(s0, w(t0) - 0.06, deckY(t0))], [0, 1, 0]);
  }
  // the square bow and stern (transoms), the bow's thwart beam
  for (const t of [-1, 1]) face(hull, [P(t * H, -w(t), sheer(t)), P(t * H, w(t), sheer(t)), P(t * H, w(t) * 0.82, chine(t)), P(t * H, -w(t) * 0.82, chine(t))], [dx * t, 0, dz * t]);
  bag.add('timber', fromTriangles(hull)); bag.add('wood_dark', fromTriangles(wale)); bag.add('planks_grey', fromTriangles(dk));
  const bb = []; beamTris(bb, P(H - 0.5, -w(0.94) - 0.25, sheer(0.94) - 0.05), P(H - 0.5, w(0.94) + 0.25, sheer(0.94) - 0.05), 0.12, 0.22); bag.add('wood_dark', fromTriangles(bb));
  // the house: from a little aft of midships to the stern deck; board walls, lattice windows, the vaulted mat roof
  const tA = -0.62, tB = 0.12, sA = tA * H, sB = tB * H, hw = Math.min(w(tA), w(tB)) - 0.35, yd = deckY(0) + 0.02, wh = 1.9, arch = 0.4;
  const walls = [], win = [];
  hexa(walls, [P(sA, -hw, yd - 0.05), P(sB, -hw, yd - 0.05), P(sB, hw, yd - 0.05), P(sA, hw, yd - 0.05), P(sA, -hw, yd + wh), P(sB, -hw, yd + wh), P(sB, hw, yd + wh), P(sA, hw, yd + wh)]);
  const nWin = Math.max(2, Math.floor((sB - sA) / 1.6));
  for (let i = 0; i < nWin; i++) {
    const c = sA + (sB - sA) * (i + 0.5) / nWin;
    for (const sg of [-1, 1]) { const o = sg * (hw + 0.025); hexa(win, [P(c - 0.5, o - 0.025, yd + 0.85), P(c + 0.5, o - 0.025, yd + 0.85), P(c + 0.5, o + 0.025, yd + 0.85), P(c - 0.5, o + 0.025, yd + 0.85), P(c - 0.5, o - 0.025, yd + 1.6), P(c + 0.5, o - 0.025, yd + 1.6), P(c + 0.5, o + 0.025, yd + 1.6), P(c - 0.5, o + 0.025, yd + 1.6)]); }
  }
  for (const s of [sA - 0.025, sB + 0.025]) hexa(win, [P(s - 0.025, -0.45, yd), P(s + 0.025, -0.45, yd), P(s + 0.025, 0.45, yd), P(s - 0.025, 0.45, yd), P(s - 0.025, -0.45, yd + 1.75), P(s + 0.025, -0.45, yd + 1.75), P(s + 0.025, 0.45, yd + 1.75), P(s - 0.025, 0.45, yd + 1.75)]);
  bag.add('timber', fromTriangles(walls)); bag.add('lattice', fromTriangles(win));
  const roof = [], M = 10, ro = hw + 0.35, ra = sA - 0.4, rb2 = sB + 0.4;
  for (let i = 0; i < M; i++) {
    const o0 = -ro + 2 * ro * i / M, o1 = -ro + 2 * ro * (i + 1) / M, y0 = yd + wh + arch * Math.cos(o0 / ro * Math.PI / 2) - 0.08, y1 = yd + wh + arch * Math.cos(o1 / ro * Math.PI / 2) - 0.08;
    const q = [P(ra, o0, y0), P(rb2, o0, y0), P(rb2, o1, y1), P(ra, o1, y1)];
    face(roof, q, [0, 1, 0]); face(roof, q.map((v) => [v[0], v[1] - 0.04, v[2]]), [0, -1, 0]);
  }
  bag.add('reed_mat', fromTriangles(roof));
  // ribs of bamboo across the roof
  for (let i = 0; i <= 6; i++) { const s = ra + 0.15 + (rb2 - ra - 0.3) * i / 6, pts = []; for (let k = 0; k <= 8; k++) { const o = -ro + 2 * ro * k / 8; pts.push(P(s, o, yd + wh + arch * Math.cos(o / ro * Math.PI / 2) - 0.03)); } for (let k = 0; k < 8; k++) bag.add('bamboo_culm', rod(pts[k], pts[k + 1], 0.03, 4)); }
  // the bipod mast in its tabernacle, forward of the house; its stay to the bow
  const tm = 0.3, sm = tm * H, hp = yd + wh + arch + 0.55, mh = el.mastH ?? L * 0.62, th = Math.min(90, el.mast ?? 90) * Math.PI / 180;
  const pv = [-1, 1].map((sg) => sg * Math.min(w(tm) - 0.4, hw));
  const tab = [];
  for (const o of pv) for (const ds of [-0.22, 0.22]) hexa(tab, [P(sm + ds - 0.1, o - 0.1, yd - 0.05), P(sm + ds + 0.1, o - 0.1, yd - 0.05), P(sm + ds + 0.1, o + 0.1, yd - 0.05), P(sm + ds - 0.1, o + 0.1, yd - 0.05), P(sm + ds - 0.1, o - 0.1, hp + 0.25), P(sm + ds + 0.1, o - 0.1, hp + 0.25), P(sm + ds + 0.1, o + 0.1, hp + 0.25), P(sm + ds - 0.1, o + 0.1, hp + 0.25)]);
  bag.add('wood_dark', fromTriangles(tab));
  const apex = P(sm - Math.sin(th) * mh, 0, hp + Math.cos(th) * mh);
  const feet = pv.map((o) => P(sm, o, hp));
  for (const f of feet) bag.add('timber', rod([f[0] - (apex[0] - f[0]) * 0.03, f[1] - (apex[1] - f[1]) * 0.03, f[2] - (apex[2] - f[2]) * 0.03], apex, 0.13, 8));
  bag.add('iron', rod(P(sm, pv[0] - 0.15, hp), P(sm, pv[1] + 0.15, hp), 0.05, 6));
  if (!el.sail) for (const f of [0.3, 0.55]) { const a0 = feet[0].map((v, i) => v + (apex[i] - v) * f), a1 = feet[1].map((v, i) => v + (apex[i] - v) * f); bag.add('timber', rod(a0, a1, 0.06, 6)); }
  bag.add('wood_dark', ballG(0.2, apex[0], apex[1] + 0.2, apex[2], 8));
  const bow = P(H - 0.3, 0, sheer(1) + 0.3);
  bag.add('timber', rod(P(H - 0.3, 0, sheer(0.95) - 0.3), bow, 0.1, 6));
  if (th < 1.1) bag.add('sacking', rod(apex, bow, 0.022, 4));
  else {
    // laid back: its head on a crutch on the stern deck
    const cs = sm - Math.sin(th) * mh * 0.96, ct = cs / H;
    if (ct > -1) for (const sg of [-1, 1]) bag.add('timber', rod(P(cs, sg * 0.55, deckY(Math.max(-1, ct)) - 0.05), P(cs, -sg * 0.12, hp + Math.cos(th) * mh * 0.96 - 0.1), 0.07, 6));
  }
  if (el.sail && th < 0.2) {
    // the batten lug sail of matting, bamboo battens across it
    const sl = [], top = hp + mh * 0.93, bot = hp + 1.0, fw = 0.3, aft = Math.min(5, H * 0.75), nb = 8;
    for (let i = 0; i < nb; i++) {
      const y0 = bot + (top - bot) * i / nb, y1 = bot + (top - bot) * (i + 1) / nb, f0 = 1 - 0.25 * i / nb, f1 = 1 - 0.25 * (i + 1) / nb;
      const q = [P(sm + fw * f0, 0, y0), P(sm - aft * f0, 0, y0), P(sm - aft * f1, 0, y1), P(sm + fw * f1, 0, y1)];
      face(sl, q, [nx, 0, nz]); face(sl, q, [-nx, 0, -nz]);
      for (const so of [-0.04, 0.04]) bag.add('bamboo_culm', rod(P(sm + fw * f0 + 0.1, so, y0), P(sm - aft * f0 - 0.1, so, y0), 0.03, 4));
    }
    bag.add('reed_mat', fromTriangles(sl));
  }
  // the rudder hung over the stern, its tiller; a sculling oar on its pin
  const sr = -H - 0.35, rp = [];
  bag.add('wood_dark', rod(P(sr, 0, yw - 1.0), P(sr, 0, sheer(-1) + 0.7), 0.12, 8));
  hexa(rp, [P(sr - 1.5, -0.08, yw - 1.3), P(sr, -0.08, yw - 1.3), P(sr, 0.08, yw - 1.3), P(sr - 1.5, 0.08, yw - 1.3), P(sr - 1.1, -0.08, yw + 0.5), P(sr, -0.08, yw + 0.5), P(sr, 0.08, yw + 0.5), P(sr - 1.1, 0.08, yw + 0.5)]);
  bag.add('timber', fromTriangles(rp));
  bag.add('wood_dark', rod(P(sr, 0, sheer(-1) + 0.55), P(sr + 3.2, 0.2, sheer(-1) + 0.75), 0.06, 5));
  const so = w(-0.8) + 0.05;
  bag.add('timber', rod(P(-H * 0.8, so, sheer(-0.8) + 0.4), P(-H * 0.8 - 3.6, so + 1.6, yw - 0.5), 0.05, 5));
}

/** parasol: a vendor's great parasol on its pole { at, y, h, r, cloth }: the pole, ribs, the cloth cone, a knob. */
function parasol(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 2.5, R = el.r ?? 1.5, c = el.cloth ?? 'cloth_white';
  bag.add('bamboo_culm', rod([x, y, z], [x, y + h + 0.5, z], 0.03, 5));
  bag.add(c, lathe([[R, h], [R * 0.6, h + 0.32], [0.05, h + 0.5], [0.001, h + 0.52], [0.05, h + 0.47], [R * 0.6, h + 0.28], [R - 0.01, h - 0.02]], 12, null, x, y, z));
  for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; bag.add('bamboo_culm', rod([x, y + h - 0.6, z], [x + Math.cos(a) * R * 0.55, y + h + 0.22, z + Math.sin(a) * R * 0.55], 0.012, 3)); }
  bag.add('wood_dark', ballG(0.05, x, y + h + 0.62, z, 6));
}

/**
 * caimen: a wine shop's colour gate { a, b (the shop front's ends), out ([nx, nz]), y, h, seed, flag,
 * boxes }: a scaffold of poles bound with coloured silk standing before the front — four posts on
 * the street side and four against the house, tied by rails at three levels, crossed bracing, the
 * pointed lintel over the door (the "welcome gate"), a crest of pointed frames with poles and
 * pennants, festoons of red and green silk with coloured balls, an S-necked crane at the crest; the
 * blue-and-white wine flag on its pole, lantern boxes before the door.
 */
function caimen(el, { bag, col }) {
  const [ax, az] = el.a, [bx, bz] = el.b, [nx, nz] = el.out, y = el.y ?? 0, H = el.h ?? 7.2;
  const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L;
  const P = (u, n, yy) => [ax + ux * u + nx * n, y + yy, az + uz * u + nz * n];
  const us = [0, L * 0.3, L * 0.7, L], back = 0.25, front = 1.15;
  const poles = [], ties = [];
  for (const u of us) for (const n of [back, front]) { poles.push(rod(P(u, n, 0), P(u, n, H), 0.075, 6)); }
  for (const u of us) for (const n of [back, front]) col.circle(...[P(u, n, 0)].map((p) => [p[0], p[2]])[0], 0.12, y, y + H);
  for (const lv of [3.4, 4.9, 6.3]) for (const n of [back, front]) ties.push(rod(P(-0.12, n, lv), P(L + 0.12, n, lv), 0.05, 5));
  for (const lv of [3.4, 4.9, 6.3]) for (const u of us) ties.push(rod(P(u, back, lv), P(u, front, lv), 0.045, 5));
  // the crossed bracing of the bays between the middle and upper rails
  for (let i = 0; i < 3; i++) { const u0 = us[i], u1 = us[i + 1]; ties.push(rod(P(u0, front, 4.9), P(u1, front, 6.3), 0.035, 4), rod(P(u1, front, 4.9), P(u0, front, 6.3), 0.035, 4)); }
  // the pointed lintel over the door, and the side bays' lower rails
  ties.push(rod(P(us[1], front, 2.7), P(L / 2, front, 3.35), 0.05, 5), rod(P(L / 2, front, 3.35), P(us[2], front, 2.7), 0.05, 5));
  ties.push(rod(P(0, front, 2.4), P(us[1], front, 2.4), 0.045, 5), rod(P(us[2], front, 2.4), P(L, front, 2.4), 0.045, 5));
  // the crest: a pointed frame over each bay, poles above the posts with pennants
  for (let i = 0; i < 3; i++) { const u0 = us[i], u1 = us[i + 1], um = (u0 + u1) / 2; ties.push(rod(P(u0, front, H), P(um, front, H + 1.0), 0.04, 4), rod(P(um, front, H + 1.0), P(u1, front, H), 0.04, 4), rod(P(um, front, 6.3), P(um, front, H + 1.0), 0.035, 4)); }
  for (const u of us) poles.push(rod(P(u, front, H), P(u, front, H + 1.4), 0.035, 4));
  for (const g of poles) bag.add('timber', g);
  for (const g of ties) bag.add('bamboo_culm', g);
  const silk = { red: [], green: [], white: [], ochre: [] }, colors = ['red', 'green', 'red', 'ochre'];
  // pennants
  us.forEach((u, i) => { const p0 = P(u, front, H + 1.38), t = []; face(t, [p0, [p0[0], p0[1] - 0.5, p0[2]], [p0[0] + ux * 0.7, p0[1] - 0.35, p0[2] + uz * 0.7]], [nx, 0, nz]); face(t, [p0, [p0[0], p0[1] - 0.5, p0[2]], [p0[0] + ux * 0.7, p0[1] - 0.35, p0[2] + uz * 0.7]], [-nx, 0, -nz]); silk[i % 2 ? 'green' : 'red'].push(...t); });
  // festoons: silk swagged between the posts on the street side at two levels, the balls at their low points
  const balls = [];
  for (const [lv, sag] of [[3.4, 0.55], [4.9, 0.45], [6.3, 0.4]]) for (let i = 0; i < 3; i++) {
    const u0 = us[i], u1 = us[i + 1], cName = colors[(i + Math.round(lv)) % 4], N = 8;
    for (let k = 0; k < N; k++) {
      const f0 = k / N, f1 = (k + 1) / N, y0 = lv - sag * 4 * f0 * (1 - f0), y1 = lv - sag * 4 * f1 * (1 - f1);
      const t = []; beamTris(t, P(u0 + (u1 - u0) * f0, front + 0.1, y0 - 0.22), P(u0 + (u1 - u0) * f1, front + 0.1, y1 - 0.22), 0.018, 0.24); silk[cName].push(...t);
    }
    if (lv < 6) { const bp = P((u0 + u1) / 2, front + 0.1, lv - sag - 0.3); balls.push([bp, i]); }
  }
  // hanging silk down the posts, either side of the door
  for (const u of [us[1], us[2]]) { const t = []; beamTris(t, P(u - 0.22, front + 0.1, 2.5), P(u + 0.22, front + 0.1, 2.5), 0.018, 0.85); silk.white.push(...t); }
  for (const [cName, t] of Object.entries(silk)) if (t.length) bag.add(`cloth_${cName}`, fromTriangles(t));
  for (const [bp, i] of balls) { bag.add(i % 2 ? 'cloth_green' : 'cloth_red', ballG(0.17, bp[0], bp[1], bp[2], 8)); bag.add('cloth_red', rod([bp[0], bp[1], bp[2]], [bp[0], bp[1] - 0.45, bp[2]], 0.02, 3)); }
  // the crane on the crest, its neck in an S
  { const c = P(L / 2, front, H + 1.0), bd = lathe([[0.001, -0.32], [0.14, -0.2], [0.17, 0], [0.12, 0.2], [0.001, 0.3]], 8); bd.rotateZ(Math.PI / 2); bd.rotateY(-Math.atan2(uz, ux)); bd.translate(c[0], c[1] + 0.2, c[2]); bag.add('paint_white', bd);
    let p = [c[0] + ux * 0.25, c[1] + 0.3, c[2] + uz * 0.25];
    for (const [du, dy] of [[0.15, 0.25], [-0.12, 0.25], [0.1, 0.22]]) { const q = [p[0] + ux * du, p[1] + dy, p[2] + uz * du]; bag.add('paint_white', rod(p, q, 0.04, 5)); p = q; }
    bag.add('cloth_red', ballG(0.06, p[0], p[1] + 0.08, p[2], 6)); bag.add('lacquer_black', rod(p, [p[0] + ux * 0.25, p[1] - 0.02, p[2] + uz * 0.25], 0.02, 3)); }
  // the wine flag: a pole beside the gate, a cross-arm, breadths of blue and of white cloth side by side
  if (el.flag !== false) {
    const fp = P(L + 0.7, front + 0.4, 0), fh = H + 2.6;
    bag.add('timber', lathe([[0.09, 0], [0.07, fh], [0.001, fh + 0.05]], 8, null, fp[0], fp[1], fp[2]));
    const arm = P(L + 0.7, front + 0.4, fh - 0.3), armEnd = [arm[0] + nx * 1.8, arm[1], arm[2] + nz * 1.8];
    bag.add('timber', rod(arm, armEnd, 0.04, 5));
    const blue = [], white = [];
    for (let k = 0; k < 4; k++) { const n0 = 0.2 + k * 0.38, t = []; beamTris(t, [arm[0] + nx * n0, arm[1] - 3.1, arm[2] + nz * n0], [arm[0] + nx * (n0 + 0.36), arm[1] - 3.1, arm[2] + nz * (n0 + 0.36)], 0.012, 3.05); (k % 2 ? white : blue).push(...t); }
    bag.add('cloth_indigo', fromTriangles(blue)); bag.add('cloth_white', fromTriangles(white));
    col.circle(fp[0], fp[2], 0.12, y, y + fh);
  }
  // the red gardenia lamps (zhizi deng) hung from the door's lintel, either side of the way in
  if (el.lamps) for (const u of [us[1] + 0.35, us[2] - 0.35]) {
    const h0 = P(u, front, 2.7 + 0.65 * 0.35 / (L / 2 - us[1]));
    zhizi(bag, h0[0], h0[1] - 0.05, h0[2]);
  }
  // the lantern boxes before the door: a stand, paper sides, a little roof, characters in black
  const nb = el.boxes ?? 2;
  for (let i = 0; i < nb; i++) {
    const u = nb === 1 ? L / 2 - 1.4 : nb === 3 ? [(us[0] + us[1]) / 2, us[1] + 0.6, us[2] - 0.6][i] : (i ? us[2] - 0.6 : us[1] + 0.6), c = P(u, front + 0.9, 0), s = 0.33;
    bag.add('wood_dark', box(c[0] - s - 0.04, y, c[2] - s - 0.04, c[0] + s + 0.04, y + 0.5, c[2] + s + 0.04));
    bag.add('lamp_paper', box(c[0] - s, y + 0.5, c[2] - s, c[0] + s, y + 1.75, c[2] + s));
    bag.add('wood_dark', box(c[0] - s - 0.06, y + 1.75, c[2] - s - 0.06, c[0] + s + 0.06, y + 1.83, c[2] + s + 0.06));
    bag.add('wood_dark', lathe([[0.001, 0], [0.5, 0], [0.001, 0.32]], 4).rotateY(Math.PI / 4).translate(c[0], y + 1.83, c[2]));
    const ink = [];
    for (const [fx, fz] of [[nx, nz], [-nx, -nz]]) for (let k = 0; k < 2; k++) { const yy = y + 1.15 + (1 - k) * 0.38 - 0.1, cxx = c[0] + fx * (s + 0.012), czz = c[2] + fz * (s + 0.012); ink.push(...fromTri(box(cxx - Math.abs(fz) * 0.15 - Math.abs(fx) * 0.01, yy, czz - Math.abs(fx) * 0.15 - Math.abs(fz) * 0.01, cxx + Math.abs(fz) * 0.15 + Math.abs(fx) * 0.01, yy + 0.3, czz + Math.abs(fx) * 0.15 + Math.abs(fz) * 0.01))); }
    bag.add('lacquer_black', fromTriangles(ink));
    col.circle(c[0], c[2], 0.45, y, y + 2);
  }
}

/** A gardenia lamp hanging from (x, y, z): the cord, a cap, the lamp of red silk on ribs swelling like the gardenia's fruit, a tassel. */
export function zhizi(bag, x, y, z) {
  bag.add('cloth_red', rod([x, y, z], [x, y - 0.3, z], 0.008, 3));
  bag.add('lacquer_black', lathe([[0.001, 0], [0.07, 0], [0.06, 0.05], [0.001, 0.06]], 8, null, x, y - 0.36, z));
  const prof = [[0.001, 0], [0.08, 0.02], [0.17, 0.12], [0.2, 0.26], [0.17, 0.4], [0.09, 0.48], [0.001, 0.5]];
  bag.add('cloth_red', lathe(prof, 12, (th) => 1 + 0.07 * Math.cos(th * 6), x, y - 0.86, z));
  bag.add('lacquer_black', lathe([[0.001, 0], [0.05, 0], [0.05, 0.04], [0.001, 0.04]], 8, null, x, y - 0.9, z));
  bag.add('cloth_red', lathe([[0.001, -0.3], [0.04, -0.28], [0.02, 0], [0.001, 0]], 6, null, x, y - 0.9, z));
}

/**
 * sedan: a sedan chair { at, y, rot (its front toward −z turned by rot) }: the cabin of dark boards
 * on its frame, curtained door and windows, the arched roof, the two long carrying poles at the
 * bearers' shoulders.
 */
function sedan(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, c = Math.cos(el.rot ?? 0), sn = Math.sin(el.rot ?? 0);
  const P = (lx, ly, lz) => [x + lx * c + lz * sn, y + ly, z - lx * sn + lz * c];
  const cab = [], cur = [], roof = [];
  const hx = 0.42, hz = 0.5, y0 = 0.45, y1 = 1.75;
  hexa(cab, [P(-hx, y0, -hz), P(hx, y0, -hz), P(hx, y0, hz), P(-hx, y0, hz), P(-hx, y1, -hz), P(hx, y1, -hz), P(hx, y1, hz), P(-hx, y1, hz)]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) cab.push(...fromTri(rod(P(sx * (hx - 0.04), 0, sz * (hz - 0.04)), P(sx * (hx - 0.04), y0, sz * (hz - 0.04)), 0.035, 4)));
  // the door curtain and the side windows' curtains, standing proud of the boards
  hexa(cur, [P(-0.3, 0.6, -hz - 0.03), P(0.3, 0.6, -hz - 0.03), P(0.3, 0.6, -hz), P(-0.3, 0.6, -hz), P(-0.3, 1.6, -hz - 0.03), P(0.3, 1.6, -hz - 0.03), P(0.3, 1.6, -hz), P(-0.3, 1.6, -hz)]);
  for (const sx of [-1, 1]) hexa(cur, [P(sx * hx, 1.05, -0.25), P(sx * (hx + 0.03), 1.05, -0.25), P(sx * (hx + 0.03), 1.05, 0.25), P(sx * hx, 1.05, 0.25), P(sx * hx, 1.5, -0.25), P(sx * (hx + 0.03), 1.5, -0.25), P(sx * (hx + 0.03), 1.5, 0.25), P(sx * hx, 1.5, 0.25)]);
  const M = 8, rx = hx + 0.14, rz = hz + 0.16;
  for (let i = 0; i < M; i++) {
    const a0 = -rx + 2 * rx * i / M, a1 = -rx + 2 * rx * (i + 1) / M, h0 = y1 + 0.28 * Math.cos(a0 / rx * Math.PI / 2) - 0.03, h1 = y1 + 0.28 * Math.cos(a1 / rx * Math.PI / 2) - 0.03;
    hexa(roof, [P(a0, h0 - 0.05, -rz), P(a1, h1 - 0.05, -rz), P(a1, h1 - 0.05, rz), P(a0, h0 - 0.05, rz), P(a0, h0, -rz), P(a1, h1, -rz), P(a1, h1, rz), P(a0, h0, rz)]);
  }
  bag.add('wood_dark', fromTriangles(cab)); bag.add('cloth_indigo', fromTriangles(cur)); bag.add('lacquer_black', fromTriangles(roof));
  { const k = P(0, y1 + 0.38, 0); bag.add('gilt_bronze', ballG(0.07, k[0], k[1], k[2], 6)); }
  for (const sx of [-1, 1]) bag.add('wood_dark', rod(P(sx * (hx + 0.06), 1.32, -2.2), P(sx * (hx + 0.06), 1.32, 2.2), 0.045, 6));
  col.circle(x, z, 0.6, y, y + 2);
}

/**
 * song_gate: the city gate's platform with its passage { rect [x0, z0, x1, z1] (the platform), along
 * ('x' | 'z': the way through), w (the passage's width at the foot), h (to the springing of the
 * slopes), top (the passage's top), H (the platform's height), mat }: a trapezoidal passage, its sides
 * lined with timber posts (paicha zhu) on sills, struts up the slopes, lintels across the top.
 */
function songGate(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, alongX = el.along === 'x', mat = el.mat ?? 'brick_grey', Hh = el.H ?? 9, y = el.y ?? 0;
  const w = el.w ?? 5.2, h = el.h ?? 4.2, top = el.top ?? 5.8, tw = el.tw ?? 3.2;
  const c = alongX ? (z0 + z1) / 2 : (x0 + x1) / 2, a0 = alongX ? x0 : z0, a1 = alongX ? x1 : z1;
  // P(a: along the passage, o: across from its centre line, yy)
  const P = (a, o, yy) => (alongX ? [a, y + yy, c + o] : [c + o, y + yy, a]);
  const R = (aa0, oo0, aa1, oo1) => { const p = P(aa0, oo0, 0), q = P(aa1, oo1, 0); return [Math.min(p[0], q[0]), Math.min(p[2], q[2]), Math.max(p[0], q[0]), Math.max(p[2], q[2])]; };
  const lo = alongX ? z0 - c : x0 - c, hi = alongX ? z1 - c : x1 - c;
  const sides = [R(a0, lo, a1, -w / 2), R(a0, w / 2, a1, hi)], over = R(a0, -w / 2, a1, w / 2);
  for (const r of sides) { bag.add(mat, box(r[0], y - 0.3, r[1], r[2], y + Hh, r[3])); col.rect(r, y - 0.3, y + Hh); }
  bag.add(mat, box(over[0], y + top, over[1], over[2], y + Hh, over[3])); col.rect(over, y + top, y + Hh);
  col.floor([Math.min(x0, x1), Math.min(z0, z1), Math.max(x0, x1), Math.max(z0, z1)], y + Hh);
  // the slopes from the sides up to the top
  const wedge = [];
  for (const sg of [-1, 1]) {
    const e0 = a0 + 0.01, e1 = a1 - 0.01, wo = w / 2 + 0.02, ho = h - 0.02 * (top - h) / ((w - tw) / 2);
    const p = [P(e0, sg * wo, ho), P(e1, sg * wo, ho), P(e1, sg * wo, top + 0.01), P(e0, sg * wo, top + 0.01), P(e0, sg * tw / 2, top + 0.01), P(e1, sg * tw / 2, top + 0.01)];
    const t = [];
    face(t, [p[0], p[1], p[2], p[3]], alongX ? [0, 0, -sg] : [-sg, 0, 0]);
    face(t, [p[0], p[1], p[5], p[4]], [0, -1, 0]);
    face(t, [p[0], p[3], p[4]], alongX ? [-1, 0, 0] : [0, 0, -1]); face(t, [p[1], p[2], p[5]], alongX ? [1, 0, 0] : [0, 0, 1]);
    wedge.push(...t);
  }
  bag.add(mat, fromTriangles(wedge));
  // the timber lining: posts on sills along both sides, struts up the slopes, lintels across
  const tim = [], n = Math.max(3, Math.round((a1 - a0) / 1.0));
  for (const sg of [-1, 1]) { const s = []; beamTris(s, P(a0 + 0.05, sg * (w / 2 - 0.19), -0.02), P(a1 - 0.05, sg * (w / 2 - 0.19), -0.02), 0.2, 0.3); tim.push(...s); }
  for (let i = 0; i <= n; i++) {
    const a = a0 + 0.2 + (a1 - a0 - 0.4) * i / n;
    for (const sg of [-1, 1]) {
      tim.push(...fromTri(rod(P(a, sg * (w / 2 - 0.12), 0.26), P(a, sg * (w / 2 - 0.12), h + 0.05), 0.13, 6)));
      tim.push(...fromTri(rod(P(a, sg * (w / 2 - 0.12), h), P(a, sg * (tw / 2 - 0.03), top - 0.12), 0.11, 6)));
    }
    const l = []; beamTris(l, P(a, -tw / 2 - 0.05, top - 0.26), P(a, tw / 2 + 0.05, top - 0.26), 0.13, 0.28); tim.push(...l);
  }
  bag.add('timber', fromTriangles(tim));
}

export const KAIFENG_ELEMENTS = { rainbow_bridge: rainbowBridge, song_boat: songBoat, parasol, caimen, sedan, song_gate: songGate, ...LANDING_ELEMENTS };
