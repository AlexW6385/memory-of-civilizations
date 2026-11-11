// Stalls on the Rainbow Bridge's deck (docs/settlements/song-kaifeng.md §11, Bridge stalls): in the scroll the
// hawkers crowd the bridge's deck, their booths of poles and mats leaning on the railings, goods on boards
// before them, wares hung from the awnings. Built along the deck's rise, so each stall stands on the deck.

import { box, lathe, rod, fromTriangles } from '../../core/geom.js';
import { hexa } from './kaifeng.js';

/**
 * bridge_stalls { at, span, width, spring, crown, y0, side (+1 east, -1 west), stalls: [{ s0, s1, kind ('cloth' | 'food' | 'sundry') }] }:
 * each a booth between railing and walkway — four bamboo poles, a sloping mat awning with a cloth
 * valance, a counter board on legs, the goods of its kind; the deck line is the bridge's (layout.js bridgeDeck).
 */
function bridgeStalls(el, { bag, col }) {
  const [cx, cz] = el.at, S = el.span / 2, E = S + 0.6, W = el.width / 2, sd = el.side ?? 1, y0 = el.y0 ?? 0.06;
  const yc = (el.spring ?? -0.6) + (el.crown ?? 4) + 0.79;
  const deck = (s) => y0 + 0.06 + (yc - y0 - 0.06) * (1 - Math.min(1, Math.abs(s) / E) ** 1.3);
  const P = (s, o, y) => [cx + sd * o, y, cz + s];
  const oB = W - 0.24, oF = W - 1.75;
  (el.stalls || []).forEach((st, i) => {
    const { s0, s1 } = st, sm = (s0 + s1) / 2, ya = deck(s0), yb = deck(s1);
    const dk = (s, o) => deck(s) + 0.0 * o;
    // the poles: low at the front, tall at the back
    for (const [s, o, h] of [[s0 + 0.08, oF, 2.15], [s1 - 0.08, oF, 2.15], [s0 + 0.08, oB, 2.7], [s1 - 0.08, oB, 2.7]]) bag.add('bamboo_culm', rod(P(s, o, dk(s, o) - 0.02), P(s, o, dk(s, o) + h), 0.04, 6));
    // the awning: mats on a slope from the back pole's head to the front, overhanging; the valance
    const t = (s, o, h) => P(s, o, dk(s, o) + h);
    const o0 = oF - 0.35, h0 = 2.0, h1 = 2.72;
    const q = (s, o) => h0 + (h1 - h0) * (o - o0) / (oB + 0.05 - o0);
    const A = [t(s0 - 0.12, o0, q(0, o0) - 0.05), t(s1 + 0.12, o0, q(0, o0) - 0.05), t(s1 + 0.12, oB + 0.05, q(0, oB + 0.05) - 0.05), t(s0 - 0.12, oB + 0.05, q(0, oB + 0.05) - 0.05)];
    const Bt = A.map((p, k) => [p[0], p[1] + 0.05, p[2]]);
    const ya0 = A[0][1], yb0 = A[1][1];
    void ya0; void yb0;
    const tb = [];
    // (the corners follow the deck, so the slab's near edge is lower toward the bridge's ends)
    hexa(tb, [A[0], A[1], A[2], A[3], Bt[0], Bt[1], Bt[2], Bt[3]]);
    bag.add('reed_mat', fromTriangles(tb));
    const cl = ['cloth_indigo', 'cloth_ochre', 'cloth_red', 'cloth_white'][(i + (st.kind === 'food' ? 1 : 0)) % 4], vt = [];
    hexa(vt, [t(s0 - 0.12, o0 - 0.02, q(0, o0) - 0.4), t(s1 + 0.12, o0 - 0.02, q(0, o0) - 0.4), t(s1 + 0.12, o0, q(0, o0) - 0.4), t(s0 - 0.12, o0, q(0, o0) - 0.4), t(s0 - 0.12, o0 - 0.02, q(0, o0) - 0.04), t(s1 + 0.12, o0 - 0.02, q(0, o0) - 0.04), t(s1 + 0.12, o0, q(0, o0) - 0.04), t(s0 - 0.12, o0, q(0, o0) - 0.04)]);
    bag.add(cl, fromTriangles(vt));
    // the counter: a board on trestle legs, its front at the walkway's side
    const cb = [], cf = oF + 0.12, cd = oF + 0.62;
    hexa(cb, [t(s0 + 0.02, cf, 0.78), t(s1 - 0.02, cf, 0.78), t(s1 - 0.02, cd, 0.78), t(s0 + 0.02, cd, 0.78), t(s0 + 0.02, cf, 0.85), t(s1 - 0.02, cf, 0.85), t(s1 - 0.02, cd, 0.85), t(s0 + 0.02, cd, 0.85)]);
    bag.add('timber', fromTriangles(cb));
    for (const s of [s0 + 0.12, s1 - 0.12]) for (const o of [cf + 0.06, cd - 0.06]) bag.add('wood_dark', rod(P(s, o, dk(s, o)), P(s, o, dk(s, o) + 0.78), 0.035, 5));
    const hs = (s) => dk(s, 0) + 0.85;
    // the goods on the board and on a shelf behind
    const on = (s, o) => P(s, o, hs(s));
    if (st.kind === 'cloth') {
      let s = s0 + 0.2;
      ['cloth_red', 'cloth_indigo', 'cloth_white', 'cloth_ochre', 'cloth_green'].forEach((m, k) => {
        const [h, w] = [0.18 + (k % 3) * 0.05, 0.34]; if (s + w > s1 - 0.1) return;
        const [a, b] = [on(s, cf + 0.08), on(s + w, cd - 0.08)];
        bag.add(m, box(Math.min(a[0], b[0]), hs(s + w / 2), Math.min(a[2], b[2]), Math.max(a[0], b[0]), hs(s + w / 2) + h, Math.max(a[2], b[2])));
        s += w + 0.05;
      });
      for (let k = 0; k < 3; k++) { const s = s0 + 0.35 + k * 0.5, a = P(s, oB - 0.05, 0); bag.add(['cloth_red', 'cloth_indigo', 'cloth_ochre'][(k + i) % 3], box(a[0] - 0.02, dk(s, 0) + 1.15, a[2] - 0.17, a[0] + 0.02, dk(s, 0) + 2.3, a[2] + 0.17)); }
    } else if (st.kind === 'food') {
      // a steamer stack of bamboo baskets with a brazier, buns on a dish, a stack of bowls
      const [x, , z] = on(sm, cf + 0.32);
      bag.add('wood_dark', lathe([[0.001, 0], [0.3, 0], [0.32, 0.22], [0.25, 0.3], [0.001, 0.3]], 10, null, x, hs(sm), z));
      for (let k = 0; k < 3; k++) bag.add('wicker', lathe([[0.27, 0], [0.29, 0.05], [0.29, 0.15], [0.27, 0.17], [0.001, 0.17]], 10, null, x, hs(sm) + 0.3 + k * 0.17, z));
      bag.add('bamboo_culm', lathe([[0.3, 0], [0.22, 0.06], [0.001, 0.1]], 10, null, x, hs(sm) + 0.81, z));
      const [d1x, , d1z] = on(s1 - 0.4, cf + 0.32);
      bag.add('glaze_white', lathe([[0.001, 0], [0.12, 0], [0.2, 0.05], [0.2, 0.065], [0.001, 0.065]], 10, null, d1x, hs(s1 - 0.4), d1z));
      for (const [ox, oz] of [[-0.06, 0], [0.07, 0.03], [0, -0.07]]) bag.add('plaster_white', lathe(Array.from({ length: 6 }, (_, k) => { const tt = k / 5 * Math.PI; return [Math.max(0.001, Math.sin(tt) * 0.06), 0.045 - Math.cos(tt) * 0.045]; }), 7, null, d1x + ox, hs(s1 - 0.4) + 0.065, d1z + oz));
      const [bx, , bz] = on(s0 + 0.35, cf + 0.32);
      for (let k = 0; k < 5; k++) bag.add('glaze_white', lathe([[0.001, 0], [0.06, 0], [0.1, 0.07], [0.09, 0.075], [0.001, 0.02]], 8, null, bx, hs(s0 + 0.35) + k * 0.045, bz));
      for (const s of [s0 + 0.3, s1 - 0.3]) { const p = P(s, oF - 0.1, dk(s, 0) + 1.9); bag.add('rope_fibre', rod(p, [p[0], p[1] - 0.25, p[2]], 0.01, 3)); bag.add('lamp_paper', lathe([[0.001, 0], [0.1, 0.03], [0.13, 0.12], [0.1, 0.22], [0.001, 0.25]], 8, null, p[0], p[1] - 0.5, p[2])); }
    } else {
      // sundries: jars, a basket of fruit, a bundle of fans, wares hung from the awning's front rail
      const [jx, , jz] = on(s0 + 0.35, cf + 0.28);
      bag.add('pottery_dark', lathe([[0.001, 0], [0.1, 0], [0.16, 0.12], [0.17, 0.24], [0.1, 0.32], [0.08, 0.36], [0.11, 0.38], [0.001, 0.38]], 10, null, jx, hs(s0 + 0.35), jz));
      const [kx, , kz] = on(sm + 0.1, cf + 0.28);
      bag.add('wicker', lathe([[0.001, 0], [0.2, 0], [0.26, 0.14], [0.25, 0.16], [0.001, 0.16]], 10, null, kx, hs(sm + 0.1), kz));
      for (let k = 0; k < 5; k++) { const th = k * 1.26; bag.add(k % 2 ? 'cloth_red' : 'cloth_ochre', lathe(Array.from({ length: 6 }, (_, u) => { const tt = u / 5 * Math.PI; return [Math.max(0.001, Math.sin(tt) * 0.07), 0.07 - Math.cos(tt) * 0.07]; }), 7, null, kx + Math.cos(th) * 0.1, hs(sm + 0.1) + 0.12, kz + Math.sin(th) * 0.1)); }
      for (let k = 0; k < 4; k++) { const s = s0 + 0.3 + k * (s1 - s0 - 0.6) / 3, p = P(s, oF - 0.12, dk(s, 0) + 1.95); bag.add('bamboo_culm', rod(p, [p[0], p[1] - 0.55 - (k % 2) * 0.2, p[2]], 0.012, 3)); bag.add(k % 2 ? 'cloth_red' : 'paint_white', lathe([[0.001, 0], [0.12, 0.02], [0.14, 0.18], [0.001, 0.2]], 8, null, p[0], p[1] - 0.75 - (k % 2) * 0.2, p[2])); }
    }
    // collision: the booth's footprint to the awning
    const r = [Math.min(P(s0, oF + 0.1, 0)[0], P(s0, oB, 0)[0]), Math.min(cz + s0, cz + s1), Math.max(P(s0, oF + 0.1, 0)[0], P(s0, oB, 0)[0]), Math.max(cz + s0, cz + s1)];
    col.rect(r, Math.min(ya, yb) - 0.3, Math.max(ya, yb) + 1.9);
  });
}
export const BRIDGE_ELEMENTS = { bridge_stalls: bridgeStalls };
