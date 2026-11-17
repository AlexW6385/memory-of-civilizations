// Ming–Qing Beijing — the rooms of the courtyard houses that are walked into (docs/settlements/qing-beijing.md §24, §35).
// Each enterable house (houses.js: hutong_house with `enter`) has its rooms furnished here, fitted to its shell through
// houseParts(): the main house's hall (by rule one of three: the family hall, the ancestors' hall, the reception hall) with the
// partitions and doorways to its side rooms; the two side houses, each by rule a bedroom, a kitchen, a school room or a store.
// Everything is built in the room's own frame (a across, centred; b from the back wall's outer face; y up) and turned into place.
// Walking rules: the doorway of each room is at a = 0 on its front wall; the strip of floor before the front wall and the band
// from the door to the middle stay clear, so that the furniture is walked round (a colliding block for each large piece).

import { box, lathe } from '../../core/geom.js';
import { Parts, ball, limb } from '../../styles/qing/carving.js';
import { houseParts } from './houses.js';
import { table, chair, stool, bench, cabinet, kang, stove, vat, frame } from './interiors.js';

const W = 'wood_dark', RED = 'lacquer_red';
function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const M = 0.5;                                       // the walls' thickness and the first strip of floor

// ── small objects, local frame, facing −z, standing at the origin ──
function oilLamp(Q, x, y, z) {
  Q.add('glaze_white', lathe([[0.001, 0], [0.05, 0], [0.068, 0.025], [0.05, 0.045], [0.001, 0.045]], 10, null, x, y, z));
  Q.add('bronze', lathe([[0.012, 0.045], [0.014, 0.17]], 6, null, x, y, z));
  Q.add('bronze', lathe([[0.001, 0.16], [0.05, 0.175], [0.056, 0.2], [0.001, 0.195]], 10, null, x, y, z));
}
function censer(Q, x, y, z, s = 1) {
  Q.add('bronze', lathe([[0.001, 0], [0.06 * s, 0], [0.085 * s, 0.03 * s], [0.095 * s, 0.09 * s], [0.08 * s, 0.115 * s], [0.001, 0.115 * s]], 12, null, x, y, z));
  for (const sx of [-1, 1]) Q.add('bronze', box(x + sx * 0.1 * s - 0.01, y + 0.09 * s, z - 0.02, x + sx * 0.1 * s + 0.01, y + 0.15 * s, z + 0.02));
}
function candlestick(Q, x, y, z) {
  Q.add('bronze', lathe([[0.001, 0], [0.05, 0], [0.02, 0.05], [0.015, 0.2], [0.04, 0.22], [0.001, 0.22]], 8, null, x, y, z));
  Q.add('cloth_red', lathe([[0.001, 0.22], [0.018, 0.22], [0.018, 0.4], [0.001, 0.4]], 6, null, x, y, z));
}
function plate(Q, x, y, z, fruit = 'cloth_red', n = 3) {
  Q.add('glaze_white', lathe([[0.001, 0], [0.08, 0], [0.13, 0.03], [0.001, 0.02]], 10, null, x, y, z));
  for (let i = 0; i < n; i++) { const a = i / n * 6.28; Q.add(fruit, ball(0.036, 0.034, 0.036, 8, 5).translate(x + Math.cos(a) * (n > 1 ? 0.045 : 0), y + 0.06, z + Math.sin(a) * (n > 1 ? 0.045 : 0))); }
}
function tablet(Q, x, y, z, h = 0.3) {                // a spirit tablet on its stand
  Q.add(W, box(x - 0.055, y, z - 0.035, x + 0.055, y + 0.03, z + 0.035));
  Q.add('lacquer_black', box(x - 0.04, y + 0.03, z - 0.012, x + 0.04, y + 0.03 + h, z + 0.012));
  Q.add('gilt_bronze', box(x - 0.012, y + 0.07, z - 0.0135, x + 0.012, y + 0.03 + h - 0.05, z - 0.012));
  Q.add('gilt_bronze', box(x - 0.045, y + 0.03 + h, z - 0.016, x + 0.045, y + 0.04 + h, z + 0.016));
}
function teapot(Q, x, y, z) {
  Q.add('glaze_white', lathe([[0.001, 0], [0.06, 0.005], [0.075, 0.07], [0.04, 0.13], [0.02, 0.14], [0.001, 0.14]], 10, null, x, y, z));
  Q.add('glaze_white', limb([x + 0.07, y + 0.06, z], [x + 0.13, y + 0.1, z], 0.012, 0.012, 4));
  for (const dx of [-0.16, 0.16]) Q.add('glaze_white', lathe([[0.001, 0], [0.03, 0], [0.042, 0.05], [0.001, 0.05]], 8, null, x + dx, y, z + 0.1));
}
/** A hanging picture on a mount between its two scrolls: a landscape, flowers or calligraphy. */
function picture(Q, kind, a, y0, h, w = 0.84) {
  const z = M + 0.03;
  Q.add('cloth_indigo', box(a - w / 2, y0, z - 0.035, a + w / 2, y0 + h, z - 0.025));
  Q.add('paint_white', box(a - w / 2 + 0.08, y0 + 0.13, z - 0.025, a + w / 2 - 0.08, y0 + h - 0.13, z - 0.017));
  if (kind === 'landscape') {
    for (const [dx, hh, ww] of [[-0.18, 0.5, 0.2], [0.05, 0.7, 0.26], [0.22, 0.4, 0.18]]) Q.add('slate', box(a + dx - ww / 2, y0 + 0.2, z - 0.017, a + dx + ww / 2, y0 + 0.2 + hh * h / 1.4, z - 0.013));
    Q.add('glaze_green', box(a - 0.28, y0 + 0.2, z - 0.017, a - 0.22, y0 + 0.55, z - 0.013));
  } else if (kind === 'flowers') {
    for (const [dx, dy] of [[-0.12, 0.62], [0.1, 0.8], [0.02, 0.44]]) Q.add('cloth_red', ball(0.09, 0.08, 0.01, 8, 5).translate(a + dx, y0 + h * dy, z - 0.012));
    Q.add('glaze_green', limb([a, y0 + 0.2, z - 0.014], [a + 0.04, y0 + h * 0.85, z - 0.014], 0.012, 0.008, 4));
  } else for (let k = 0; k < 4; k++) Q.add('lacquer_black', box(a - w / 2 + 0.16, y0 + h - 0.28 - k * 0.22 * h / 1.5, z - 0.017, a + w / 2 - 0.16 - (k === 3 ? 0.25 : 0), y0 + h - 0.28 - k * 0.22 * h / 1.5 + 0.1 * h / 1.5, z - 0.013));
  for (const s of [-1, 1]) {                       // the couplet either side: red paper, black strokes
    Q.add('cloth_red', box(a + s * 0.7 - 0.12, y0 - 0.05, z - 0.035, a + s * 0.7 + 0.12, y0 + h + 0.05, z - 0.025));
    for (let k = 0; k < 5; k++) Q.add('lacquer_black', box(a + s * 0.7 - 0.07, y0 + 0.2 + k * (h - 0.3) / 5, z - 0.025, a + s * 0.7 + 0.07, y0 + 0.2 + k * (h - 0.3) / 5 + 0.1, z - 0.021));
  }
}
function brazier(Q) {
  Q.add('iron', lathe([[0.001, 0], [0.18, 0.02], [0.22, 0.22], [0.001, 0.22]], 12)); Q.add('flame', lathe([[0.001, 0.2], [0.17, 0.2], [0.001, 0.21]], 10));
  for (const a of [0, 2.1, 4.2]) Q.add('iron', limb([Math.cos(a) * 0.12, 0.05, Math.sin(a) * 0.12], [Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2], 0.018, 0.016, 4));
}
function jar(Q, x, z, r = 0.24, h = 0.55, lid = 'slate') {
  Q.add('pottery_dark', lathe([[0.001, 0], [r * 0.7, 0.01], [r, h * 0.45], [r * 0.9, h * 0.9], [r * 0.7, h], [0.001, h]], 12, null, x, 0, z));
  Q.add(lid, lathe([[0.001, h], [r * 0.8, h], [r * 0.8, h + 0.03], [0.001, h + 0.06]], 12, null, x, 0, z));
}
function sack(Q, x, y, z, r = 0.3) { Q.add('sacking', lathe([[0.001, 0], [r, 0.02], [r * 1.15, r * 0.6], [r * 0.9, r * 1.3], [r * 0.4, r * 1.55], [0.001, r * 1.6]], 9, null, x, y, z)); }

// ── the rooms ──
export function bjRooms(el, { bag, col, lights }) {
  const P = houseParts({ ...el, enter: true }), r = rng((el.seed || 3) * 5 + 1), w = el.wealth ?? 0.4;
  const hallKind = w > 0.62 ? (r() < 0.6 ? 'ancestors' : 'reception') : w > 0.4 ? ['family', 'ancestors', 'reception'][Math.floor(r() * 3)] : (r() < 0.7 ? 'family' : 'ancestors');
  const sideKinds = w > 0.55 ? ['bedroom', r() < 0.5 ? 'study' : 'bedroom'] : w > 0.38 ? [r() < 0.7 ? 'bedroom' : 'study', r() < 0.5 ? 'kitchen' : 'store'] : [r() < 0.5 ? 'kitchen' : 'store', 'bedroom'];
  const rooms = [{ rect: [P.main[0], P.main[1], P.main[2], P.main[1] + P.dN - 1.1 + M], front: 's', y: P.mainY, kind: 'main', nb: P.mb, H: 3.45 }];
  P.wings.forEach((wg, i) => {
    const [xa, za, xb, zb] = wg.rect, inner = wg.ww - 0.8 + M;
    rooms.push({ ...(wg.side === 'w' ? { rect: [xb - inner, za, xb, zb], front: 'w' } : { rect: [xa, za, xa + inner, zb], front: 'e' }), y: P.wingY, kind: sideKinds[i], H: 3.05 });
  });
  for (const rm of rooms) {
    const F = frame(rm.rect, rm.front), S = new Parts(), put = (Q, a, b, yw = 0, up = 0) => Q.emit(S, a, up, b, yw);
    const blk = (a0, b0, a1, b1, h) => { const p = F.WC(a0, b0), q = F.WC(a1, b1); col.rect([Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])], rm.y, rm.y + h); };
    const ceil = rm.H - 0.36, bF = F.Dp - M, Wd = F.Wd, hw = Wd / 2 - M;            // the ceiling's height, the front wall's plane, the half width of the floor
    const light = (a, b, up) => { const c = F.WC(a, b); lights?.push({ at: [c[0], rm.y + 0.04 + up, c[1]], color: '#ffb46b', intensity: 2.4, distance: 7 }); };
    if (rm.kind === 'main') {
      const bw = Wd / rm.nb;
      // ── the hall (the middle bay) ──
      const longTable = (Q, ww = Math.min(2.3, bw - 0.5)) => { table(Q, ww, 0.45, 0.92); for (const s of [-1, 1]) { Q.add('glaze_blue', lathe([[0.06, 0], [0.11, 0.06], [0.12, 0.2], [0.06, 0.36], [0.045, 0.46], [0.001, 0.5]], 12, null, s * (ww / 2 - 0.3), 0.92, 0)); Q.add('timber', lathe([[0.012, 0], [0.012, 0.42], [0.001, 0.42]], 5, null, s * (ww / 2 - 0.3), 1.38, 0)); } };
      if (hallKind === 'family') {
        { const Q = new Parts(); longTable(Q); censer(Q, 0, 0.92, 0, 1); oilLamp(Q, 0.5, 0.92, 0); put(Q, 0, M + 0.25); blk(-1.2, M, 1.2, M + 0.5, 1.0); light(0.5, M + 0.25, 0.92 + 0.19); }
        { const Q = new Parts(); picture(Q, ['landscape', 'flowers', 'calligraphy'][Math.floor(r() * 3)], 0, 1.25, 1.5); put(Q, 0, 0); }
        { const Q = new Parts(); table(Q, 0.95, 0.95, 0.86); teapot(Q, 0, 0.86, 0); put(Q, 0, M + 1.6); for (const s of [-1, 1]) { const C = new Parts(); chair(C); put(C, s * 0.95, M + 1.6, s > 0 ? Math.PI / 2 : -Math.PI / 2); } blk(-1.3, M + 1.0, 1.3, M + 2.2, 0.9); }
      } else if (hallKind === 'ancestors') {
        // the ancestors' hall: the altar table against the back wall under the red hanging of the ancestors, the tablets in a row, the censer, two candles, the offerings; a square offering table and two kneeling cushions before it
        { const Q = new Parts(), ww = Math.min(2.6, bw - 0.4); table(Q, ww, 0.5, 1.05, W); const n = 5;
          for (let i = 0; i < n; i++) tablet(Q, (i - (n - 1) / 2) * 0.17, 1.05, 0.1, 0.26 + (i === 2 ? 0.08 : 0));
          censer(Q, 0, 1.05, -0.12, 1.2); candlestick(Q, -ww / 2 + 0.3, 1.05, -0.1); candlestick(Q, ww / 2 - 0.3, 1.05, -0.1); plate(Q, -ww / 2 + 0.6, 1.05, -0.12); plate(Q, ww / 2 - 0.6, 1.05, -0.12, 'cloth_ochre', 4);
          oilLamp(Q, ww / 2 - 0.3, 1.05, 0.14); light(ww / 2 - 0.3, M + 0.3, 1.05 + 0.19);
          put(Q, 0, M + 0.3); blk(-ww / 2, M, ww / 2, M + 0.55, 1.1); }
        { const Q = new Parts(); Q.add('cloth_red', box(-0.75, 1.3, -0.005, 0.75, 2.7, 0.005)); Q.add('cloth_ochre', box(-0.62, 1.42, 0.005, 0.62, 1.5, 0.011)); for (let k = 0; k < 3; k++) Q.add('cloth_ochre', box(-0.5 + k * 0.4, 1.62, 0.005, -0.36 + k * 0.4, 2.55, 0.011)); put(Q, 0, M + 0.03); }
        { const Q = new Parts(); table(Q, 0.85, 0.65, 0.8, RED); plate(Q, -0.2, 0.8, 0); plate(Q, 0.2, 0.8, 0, 'cloth_ochre', 2); put(Q, 0, M + 1.7); blk(-0.5, M + 1.3, 0.5, M + 2.1, 0.85); }
        for (const s of [-1, 1]) { const Q = new Parts(); Q.add('cloth_red', lathe([[0.001, 0], [0.19, 0], [0.19, 0.05], [0.001, 0.06]], 10)); put(Q, s * 0.5, M + 2.55); }
        for (const s of [-1, 1]) { const C = new Parts(); chair(C); put(C, s * (bw / 2 - 0.45), M + 1.7, s > 0 ? Math.PI / 2 : -Math.PI / 2); }
      } else {
        // the reception hall: the long table and its picture at the back; on each side two armchairs with a tea table between them, turned to the middle
        { const Q = new Parts(); longTable(Q); oilLamp(Q, -0.55, 0.92, 0); put(Q, 0, M + 0.25); blk(-1.2, M, 1.2, M + 0.5, 1.0); light(-0.55, M + 0.25, 0.92 + 0.19); }
        { const Q = new Parts(); picture(Q, ['landscape', 'flowers'][Math.floor(r() * 2)], 0, 1.25, 1.5); put(Q, 0, 0); }
        for (const s of [-1, 1]) {
          const ax = s * Math.min(1.5, bw / 2 - 0.65), yw = s > 0 ? Math.PI / 2 : -Math.PI / 2;
          for (const b of [M + 1.4, M + 3.0]) { const C = new Parts(); chair(C); put(C, ax, b, yw); }
          { const Q = new Parts(); table(Q, 0.42, 0.42, 0.7); teapot(Q, 0, 0.7, 0); put(Q, ax, M + 2.2); }
          blk(ax - 0.3, M + 1.1, ax + 0.3, M + 3.3, 0.95);
        }
      }
      // ── the partitions between the hall and the rooms either side (plastered walls with an open doorway at mid-depth, framed in red) ──
      const gap0 = M + 1.3, gap1 = M + 2.6;
      const part = (a) => {
        const Q = new Parts(), th = 0.12;
        Q.add('plaster_white', box(a - th / 2, 0, M, a + th / 2, ceil, gap0)); Q.add('plaster_white', box(a - th / 2, 0, gap1, a + th / 2, ceil, bF - 0.05));
        Q.add('plaster_white', box(a - th / 2, 2.15, gap0, a + th / 2, ceil, gap1));
        for (const g of [gap0, gap1]) Q.add(RED, box(a - th / 2 - 0.02, 0, g - 0.05, a + th / 2 + 0.02, 2.15, g + 0.05));
        Q.add(RED, box(a - th / 2 - 0.02, 2.1, gap0 - 0.05, a + th / 2 + 0.02, 2.2, gap1 + 0.05));
        Q.add(W, box(a - th / 2 - 0.01, 0, M, a + th / 2 + 0.01, 0.12, gap0)); Q.add(W, box(a - th / 2 - 0.01, 0, gap1, a + th / 2 + 0.01, 0.12, bF - 0.05));    // the skirting
        put(Q, 0, 0);
        blk(a - 0.1, M, a + 0.1, gap0, ceil); blk(a - 0.1, gap1, a + 0.1, bF, ceil);
      };
      for (let k = 0; k <= (rm.nb - 1) / 2 - 0; k++) if (k < (rm.nb + 1) / 2 - 0 && k * bw + bw / 2 < Wd / 2 - M) for (const s of [-1, 1]) part(s * (k * bw + bw / 2));
      // ── the rooms either side ──
      for (let k = 1; k <= (rm.nb - 1) / 2; k++) {
        const ae = k * bw, aw = -k * bw, kw = Math.min(bw - 0.7, 2.6);
        // east: the elders' room, the kang under the window, the clothes cabinet, a chest, a brazier (k = 1); a second bedroom's kang (k = 2)
        { const Q = new Parts(); kang(Q, kw, 1.75, k === 1); put(Q, ae, bF - 0.95 - 0.05); blk(ae - kw / 2, bF - 1.85, ae + kw / 2, bF - 0.05, 0.6); }
        if (k === 1) {
          { const Q = new Parts(); cabinet(Q, 1.0, 1.8); put(Q, ae - bw * 0.3, M + 0.3, Math.PI); blk(ae - bw * 0.3 - 0.5, M, ae - bw * 0.3 + 0.5, M + 0.6, 1.8); }
          { const Q = new Parts(); Q.add(RED, box(-0.35, 0, -0.25, 0.35, 0.55, 0.25)); Q.add('gilt_bronze', box(-0.06, 0.35, -0.26, 0.06, 0.42, -0.25)); put(Q, ae + bw * 0.25, M + 0.3); blk(ae + bw * 0.25 - 0.36, M + 0.05, ae + bw * 0.25 + 0.36, M + 0.55, 0.55); }
          { const Q = new Parts(); brazier(Q); put(Q, ae - 0.2 * bw, M + 2.0); }
        } else { const Q = new Parts(); Q.add(RED, box(-0.5, 0, -0.28, 0.5, 0.6, 0.28)); put(Q, ae + bw * 0.2, M + 0.4); blk(ae + bw * 0.2 - 0.5, M + 0.1, ae + bw * 0.2 + 0.5, M + 0.7, 0.6); }
        // west: by lot, a desk room or a second bedroom (k = 1); the wardrobes (k = 2)
        const west = k === 1 ? (r() < 0.5 ? 'desk' : 'bed') : (r() < 0.5 ? 'wardrobes' : 'sewing');
        if (west === 'desk') {
          { const Q = new Parts(); table(Q, 1.3, 0.62, 0.78); Q.add('slate', box(-0.5, 0.78, -0.1, -0.3, 0.81, 0.1)); for (let i = 0; i < 4; i++) Q.add(['cloth_white', 'cloth_indigo', 'cloth_brown', 'cloth_white'][i], box(0.25, 0.78 + i * 0.02, -0.12, 0.55, 0.8 + i * 0.02, 0.12));
            Q.add('bamboo_culm', lathe([[0.04, 0], [0.04, 0.12]], 8, null, 0.0, 0.78, 0)); for (let i = 0; i < 3; i++) Q.add('timber', limb([-0.01 + i * 0.02, 0.9, 0], [i * 0.03 - 0.03, 1.08, 0.02], 0.004, 0.003, 3));
            put(Q, aw, M + 1.0); blk(aw - 0.7, M + 0.6, aw + 0.7, M + 1.4, 0.8); }
          { const C = new Parts(); chair(C); put(C, aw, M + 1.95, Math.PI); }
          { const Q = new Parts(); bookcase(Q, 1.1, 1.9); put(Q, aw - bw * 0.3, M + 3.0 + 0.0, 0); }
        } else if (west === 'bed') {
          { const Q = new Parts(); kang(Q, kw, 1.75, false); put(Q, aw, bF - 0.95 - 0.05); blk(aw - kw / 2, bF - 1.85, aw + kw / 2, bF - 0.05, 0.6); }
          { const Q = new Parts(); cabinet(Q, 1.1, 1.9, 0.4); put(Q, aw - bw * 0.3, M + 0.25, Math.PI); blk(aw - bw * 0.3 - 0.55, M, aw - bw * 0.3 + 0.55, M + 0.5, 1.9); }
        } else {
          for (const s of [-1, 1]) { const Q = new Parts(); cabinet(Q, 0.95, 1.95); put(Q, aw + s * 0.55, M + 0.3, Math.PI); }
          blk(aw - 1.1, M, aw + 1.1, M + 0.6, 1.95);
          if (west === 'sewing') { const Q = new Parts(); table(Q, 0.9, 0.5, 0.7, W, true); Q.add('wicker', lathe([[0.001, 0], [0.16, 0], [0.2, 0.14], [0.001, 0.14]], 9, null, 0.1, 0.7, 0)); Q.add('cloth_indigo', box(-0.35, 0.7, -0.15, -0.05, 0.74, 0.15)); put(Q, aw, M + 2.6); blk(aw - 0.5, M + 2.3, aw + 0.5, M + 2.9, 0.75); }
        }
      }
    } else if (rm.kind === 'bedroom') {
      // a side house: the kang along the back wall in the left corner with the folded quilts at its head, a pair of wardrobes against the right of the back wall, a chest and the dressing stand with its bronze mirror in the front corners
      const kw = Math.min(Wd - 1.5, 2.8), ka = -Wd / 2 + M + kw / 2;
      { const Q = new Parts(); kang(Q, kw, 1.15, true); put(Q, ka, M + 0.58); blk(ka - kw / 2, M, ka + kw / 2, M + 1.15, 0.6); }
      for (let i = 0; i < 2; i++) { const Q = new Parts(); cabinet(Q, 0.9, 1.7, 0.45); put(Q, Wd / 2 - M - 0.5 - i * 1.0, M + 0.25, Math.PI); }
      blk(Wd / 2 - M - 1.95, M, Wd / 2 - M, M + 0.5, 1.7);
      { const Q = new Parts(); Q.add(RED, box(-0.4, 0, -0.25, 0.4, 0.55, 0.25)); Q.add('gilt_bronze', box(-0.06, 0.35, 0.25, 0.06, 0.42, 0.26)); put(Q, -Wd / 2 + M + 0.5, bF - 0.35); }
      { const Q = new Parts(); table(Q, 0.6, 0.4, 0.75, W, true); Q.add('bronze', lathe([[0.001, 0], [0.12, 0], [0.12, 0.012], [0.001, 0.012]], 14).rotateX(-1.2).translate(0, 1.0, -0.08)); Q.add(W, box(-0.02, 0.75, -0.1, 0.02, 0.96, -0.06)); Q.add('glaze_white', lathe([[0.001, 0], [0.06, 0.01], [0.07, 0.1], [0.001, 0.11]], 8, null, 0.2, 0.75, 0.0)); put(Q, Wd / 2 - M - 0.4, bF - 0.35, Math.PI); }
      if (r() < 0.5) { const Q = new Parts(); Q.add('wood_painted', box(-0.3, 0.12, -0.45, 0.3, 0.2, 0.45)); for (const sz of [-1, 1]) Q.add('wood_painted', box(-0.3, 0.12, sz * 0.45 - 0.02, 0.3, 0.55, sz * 0.45 + 0.02)); for (const sx of [-1, 1]) Q.add('wood_painted', box(sx * 0.3 - 0.02, 0.12, -0.45, sx * 0.3 + 0.02, 0.5, 0.45)); Q.add('cloth_red', box(-0.26, 0.2, -0.4, 0.26, 0.26, 0.4)); put(Q, ka + kw / 2 + 0.7, M + 0.7); blk(ka + kw / 2 + 0.4, M + 0.2, ka + kw / 2 + 1.0, M + 1.2, 0.55); }     // a child's cradle
      light(-Wd / 2 + M + 0.5, M + 1.7, 0.0);
    } else if (rm.kind === 'kitchen') {
      // the kitchen: the range at the back in the left corner with the Kitchen God's print over it, the water vat at the right, the firewood and coal balls along the sides, the cupboard, the dough table
      { const Q = new Parts(); stove(Q); put(Q, -Wd / 2 + M + 0.9, M + 0.55, Math.PI); blk(-Wd / 2 + M, M + 0.05, -Wd / 2 + M + 1.8, M + 1.05, 0.9); }
      { const Q = new Parts(); Q.add('cloth_red', box(-0.2, 1.5, -0.005, 0.2, 2.1, 0.005)); Q.add('cloth_ochre', box(-0.14, 1.6, 0.005, 0.14, 1.95, 0.011)); Q.add('lacquer_black', box(-0.06, 1.8, 0.011, 0.06, 1.92, 0.015)); put(Q, -Wd / 2 + M + 0.9, M + 0.03); }
      { const Q = new Parts(); vat(Q); put(Q, Wd / 2 - M - 0.55, M + 0.55); blk(Wd / 2 - M - 1.0, M + 0.1, Wd / 2 - M - 0.1, M + 1.0, 0.9); }
      { const Q = new Parts(); for (let i = 0; i < 14; i++) Q.add('timber', limb([-0.5 + (i % 5) * 0.2, 0.08 + Math.floor(i / 5) * 0.12, -0.2], [-0.5 + (i % 5) * 0.2, 0.08 + Math.floor(i / 5) * 0.12, 0.2], 0.05, 0.05, 5)); put(Q, -Wd / 2 + M + 0.7, M + 2.0, Math.PI / 2); }
      { const Q = new Parts(); for (let i = 0; i < 12; i++) Q.add('slate', limb([(i % 4) * 0.2 - 0.3, Math.floor(i / 4) * 0.13, 0], [(i % 4) * 0.2 - 0.3, Math.floor(i / 4) * 0.13 + 0.12, 0], 0.085, 0.085, 8)); put(Q, Wd / 2 - M - 0.7, M + 1.9); }
      { const Q = new Parts(); cabinet(Q, 0.9, 1.5, 0.45); put(Q, Wd / 2 - M - 0.3, M + 2.55, -Math.PI / 2); }
      { const Q = new Parts(); table(Q, 1.1, 0.6, 0.8); Q.add('timber', box(-0.3, 0.8, -0.2, 0.3, 0.84, 0.2)); Q.add('timber', limb([0.2, 0.84, 0.0], [0.6, 0.84, 0.0], 0.02, 0.02, 5)); put(Q, 0.1, M + 1.0); blk(-0.55, M + 0.7, 0.75, M + 1.3, 0.85); }
      { const Q = new Parts(); jar(Q, 0, 0, 0.17, 0.4, 'cloth_red'); put(Q, 0.5, M + 1.0); }
      light(-Wd / 2 + M + 0.9, M + 1.3, 0.9);
    } else if (rm.kind === 'study') {
      // the school room: the teacher's desk on the back wall with the writing things, a bookcase at the left, two low desks with stools for the pupils, a scroll rack
      { const Q = new Parts(); table(Q, 1.6, 0.65, 0.78, W); Q.add('slate', box(-0.6, 0.78, -0.12, -0.35, 0.81, 0.12)); for (let i = 0; i < 5; i++) Q.add(['cloth_white', 'cloth_indigo', 'cloth_brown', 'cloth_white', 'cloth_indigo'][i], box(0.3, 0.78 + i * 0.02, -0.14, 0.65, 0.8 + i * 0.02, 0.14)); Q.add('bamboo_culm', lathe([[0.04, 0], [0.04, 0.12]], 8, null, 0.0, 0.78, 0)); for (let i = 0; i < 4; i++) Q.add('timber', limb([-0.02 + i * 0.015, 0.9, 0], [i * 0.04 - 0.06, 1.1, 0.02], 0.004, 0.003, 3)); oilLamp(Q, -0.85, 0.78, 0); put(Q, 0.4, M + 0.55); blk(-0.4, M + 0.2, 1.2, M + 0.9, 0.8); light(0.4 - 0.85, M + 0.55, 0.78 + 0.19); }
      { const C = new Parts(); chair(C); put(C, 0.4, M + 1.35, Math.PI); }
      { const Q = new Parts(); bookcase(Q, Math.min(1.5, Wd * 0.3), 1.9); put(Q, -Wd / 2 + M + 0.9, M + 0.25, Math.PI); blk(-Wd / 2 + M + 0.1, M, -Wd / 2 + M + 1.7, M + 0.5, 1.9); }
      for (const s of [-1, 1]) { const Q = new Parts(); table(Q, 0.75, 0.45, 0.5, W, true); Q.add('paint_white', box(-0.2, 0.5, -0.1, 0.1, 0.505, 0.12)); put(Q, 0.4 + s * 1.2, M + 2.3, Math.PI); const St = new Parts(); stool(St, 0.3, 0.28); put(St, 0.4 + s * 1.2, M + 2.85); blk(0.4 + s * 1.2 - 0.4, M + 2.05, 0.4 + s * 1.2 + 0.4, M + 2.55, 0.5); }
      { const Q = new Parts(); Q.add(W, box(-0.03, 0, -0.2, 0.03, 1.4, 0.2)); for (let i = 0; i < 4; i++) Q.add(i % 2 ? 'cloth_red' : 'paint_white', limb([0, 0.3 + i * 0.2, -0.15], [0, 0.3 + i * 0.2, 0.15], 0.03, 0.03, 6)); put(Q, Wd / 2 - M - 0.4, M + 0.5); }
    } else {
      // the store: pickle jars under their stone lids along the back wall, sacks of grain, baskets, a stack of winter cabbages, a ladder and strings of garlic and chilies hung from the beam
      for (let i = 0; i < 4; i++) { const Q = new Parts(); jar(Q, 0, 0, 0.26 + (i % 2) * 0.04, 0.62, 'slate'); put(Q, -Wd / 2 + M + 0.5 + i * 0.62, M + 0.4); }
      blk(-Wd / 2 + M, M + 0.05, -Wd / 2 + M + 2.5, M + 0.8, 0.7);
      { const Q = new Parts(); for (let i = 0; i < 6; i++) sack(Q, (i % 3) * 0.55, Math.floor(i / 3) * 0.4, (i % 2) * 0.1, 0.3); put(Q, Wd / 2 - M - 1.3, M + 0.6); blk(Wd / 2 - M - 1.7, M + 0.2, Wd / 2 - M - 0.1, M + 1.1, 1.1); }
      { const Q = new Parts(); for (let i = 0; i < 3; i++) Q.add('wicker', lathe([[0.001, 0], [0.26, 0], [0.32, 0.28], [0.001, 0.28]], 9, null, i * 0.6, 0, 0)); put(Q, Wd / 2 - M - 1.0, M + 1.9); blk(Wd / 2 - M - 1.7, M + 1.5, Wd / 2 - M - 0.1, M + 2.3, 0.3); }
      { const Q = new Parts(); for (let i = 0; i < 12; i++) Q.add('flax_leaf', ball(0.17, 0.12, 0.17, 7, 4).translate((i % 4) * 0.3 - 0.45, 0.12 + Math.floor(i / 4) * 0.2, (Math.floor(i / 4) % 2) * 0.1)); put(Q, -Wd / 2 + M + 0.7, M + 2.3); blk(-Wd / 2 + M + 0.05, M + 1.9, -Wd / 2 + M + 1.45, M + 2.6, 0.7); }
      { const Q = new Parts(); for (const sx of [-1, 1]) Q.add('timber', box(sx * 0.2 - 0.025, 0, -0.03, sx * 0.2 + 0.025, 2.2, 0.03)); for (let i = 0; i < 8; i++) Q.add('timber', box(-0.2, 0.2 + i * 0.27, -0.025, 0.2, 0.24 + i * 0.27, 0.025)); put(Q, 0.9, M + 0.04); }
      for (let i = 0; i < 4; i++) { const Q = new Parts(), h = ceil - 0.2; Q.add('rope_fibre', limb([0, h + 0.3, 0], [0, h - 0.5, 0], 0.01, 0.01, 3)); for (let k = 0; k < 4; k++) Q.add(i % 2 ? 'cloth_red' : 'paint_white', ball(0.05, 0.07, 0.05, 6, 4).translate((k % 2) * 0.06 - 0.03, h - 0.2 - k * 0.1, (k % 2) * 0.03)); put(Q, -0.6 + i * 0.4, M + 1.2 + (i % 2) * 0.6); }
      light(0, M + 1.5, 1.4);
    }
    S.emit(bag, F.origin[0], rm.y + 0.04, F.origin[1], F.yaw);
  }
}
function bookcase(P, w, h) {
  P.add(W, box(-w / 2, 0, -0.18, w / 2, h, 0.18));
  for (let r = 0; r < 5; r++) { const y = 0.14 + r * (h - 0.2) / 5, hh = (h - 0.2) / 5 - 0.05; P.add('cloth_brown', box(-w / 2 + 0.04, y, -0.2, w / 2 - 0.04, y + hh, -0.18));
    for (let k = 0; k < Math.floor(w / 0.12); k++) P.add(['cloth_white', 'cloth_indigo', 'cloth_brown', 'cloth_grey'][(r + k) % 4], box(-w / 2 + 0.06 + k * 0.12, y + 0.01, -0.205, -w / 2 + 0.06 + k * 0.12 + 0.09, y + hh * (0.7 + 0.3 * ((k * 7) % 3) / 2), -0.185)); }
}
