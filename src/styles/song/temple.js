// The Kaibao (Youguo) monastery's halls furnished and its court furnished (docs/settlements/song-kaifeng.md §11):
// the main hall's sumeru altar with its Buddha triad, bodhisattvas, disciples and guardian kings, the
// offering table, the inner posts with their tie beams and the caisson ceiling, banners and lanterns,
// luohan along the side walls; the Guanyin hall; the sutra hall with its revolving cabinet; the bell and the
// drum in their towers; the court's bronze censer, the stone sutra pillars, the steles on their tortoises,
// the stone lamps. Interiors are built in the hall's own frame (a across, d from the back wall toward the
// front, y up) and turned into place by `frame`.

import { box, lathe, rod, fromTriangles, clothBox, addCloth } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { Parts, tripod, tortoise } from '../qing/carving.js';
import { hexa } from './kaifeng.js';

/** The hall's frame: `pt(a, d)` → world [x, z]; `B(a0, a1, d0, d1, y0, y1)` an axis-aligned box; `v(da, dd)` a direction; `rc` the world rect. */
function frame(el) {
  const [x0, z0, x1, z1] = el.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, f = el.front || 's';
  const F = {
    s: { W: x1 - x0, D: z1 - z0, pt: (a, d) => [cx + a, z0 + d] },
    n: { W: x1 - x0, D: z1 - z0, pt: (a, d) => [cx - a, z1 - d] },
    e: { W: z1 - z0, D: x1 - x0, pt: (a, d) => [x0 + d, cz + a] },
    w: { W: z1 - z0, D: x1 - x0, pt: (a, d) => [x1 - d, cz - a] },
  }[f];
  F.rc = (a0, d0, a1, d1) => { const p = F.pt(a0, d0), q = F.pt(a1, d1); return [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])]; };
  F.B = (a0, a1, d0, d1, y0, y1) => { const r = F.rc(a0, d0, a1, d1); return box(r[0], y0, r[1], r[2], y1, r[3]); };
  F.v = (da, dd) => { const p = F.pt(da, dd), o = F.pt(0, 0); return [p[0] - o[0], p[1] - o[1]]; };
  return F;
}
const FLAME = 'flame';

/** A hanging paper lantern on its cord from height ytop: cap, ribbed body, base, tassel. */
function lantern(bag, x, z, ytop, drop = 0.9, mat = 'lamp_paper') {
  const yb = ytop - drop - 0.75;
  bag.add('lacquer_black', rod([x, ytop, z], [x, ytop - drop, z], 0.012, 4));
  bag.add('lacquer_black', lathe([[0.001, 0], [0.1, 0], [0.12, 0.04], [0.001, 0.05]], 8, null, x, yb + 0.72, z));
  bag.add(mat, lathe([[0.001, 0], [0.14, 0.03], [0.25, 0.22], [0.27, 0.36], [0.25, 0.5], [0.14, 0.68], [0.001, 0.72]], 12, null, x, yb, z));
  bag.add('lacquer_black', lathe([[0.001, 0], [0.12, 0], [0.12, 0.03], [0.001, 0.03]], 8, null, x, yb - 0.03, z));
  bag.add('cloth_red', lathe([[0.001, 0], [0.025, 0.04], [0.04, 0.3], [0.025, 0.4], [0.001, 0.42]].map(([r, h]) => [r, h]), 6, null, x, yb - 0.4, z));
}
/** A long vertical banner (fan) hung from a beam: cloth with a gilt edge, a lath at the head, two tails. */
function banner(F, bag, a, d, ytop, len, mat) {
  const w = 0.28, [x0, z0, x1, z1] = F.rc(a - w, d - 0.012, a + w, d + 0.012);
  addCloth(bag, mat, clothBox(x0, ytop - len, z0, x1, ytop - 0.1, z1), ytop - 0.1);
  const [g0, h0, g1, h1] = F.rc(a - w - 0.05, d - 0.03, a + w + 0.05, d + 0.03);
  bag.add('lacquer_black', box(g0, ytop - 0.1, h0, g1, ytop, h1));
  for (const s of [-1, 1]) { const [p0, q0, p1, q1] = F.rc(a + s * 0.1 - 0.07, d - 0.012, a + s * 0.1 + 0.07, d + 0.012); addCloth(bag, mat, clothBox(p0, ytop - len - 0.45, q0, p1, ytop - len, q1), ytop - 0.1); }
}
/** A post of the inner rows: stone base, the red shaft with its entasis; collides. */
function post(F, bag, col, a, d, y, top) {
  const [x, z] = F.pt(a, d);
  bag.add('granite_block', lathe([[0.001, 0], [0.5, 0], [0.5, 0.1], [0.42, 0.2], [0.001, 0.2]], 10, null, x, y, z));
  bag.add('lacquer_red', lathe([[0.3, 0], [0.32, 0.9], [0.29, top - y - 0.22], [0.001, top - y - 0.22]], 12, null, x, y + 0.2, z));
  col.circle(x, z, 0.36, y, top);
}
/** A cushion for kneeling (putuan). */
function cushion(bag, x, z, y, mat) { bag.add(mat, lathe([[0.001, 0.0], [0.3, 0.0], [0.33, 0.06], [0.3, 0.13], [0.001, 0.14]], 10, null, x, y, z)); }
/** The offering table (gongzhuo) with its censer, two candlesticks, two vases of flowers, two dishes of fruit; lit. */
function offering(F, bag, col, lights, a, d, y, w = 3.0) {
  const h = 0.95, dp = 0.9;
  bag.add('lacquer_red', F.B(a - w / 2, a + w / 2, d - dp / 2, d + dp / 2, y + h - 0.07, y + h));
  for (const [da, dd] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const [x, z] = F.pt(a + da * (w / 2 - 0.09), d + dd * (dp / 2 - 0.09)); bag.add('lacquer_red', lathe([[0.045, 0], [0.04, h - 0.07], [0.001, h - 0.07]], 8, null, x, y, z)); }
  bag.add('lacquer_red', F.B(a - w / 2 + 0.1, a + w / 2 - 0.1, d - dp / 2 + 0.05, d - dp / 2 + 0.09, y + h - 0.24, y + h - 0.07));
  bag.add('lacquer_red', F.B(a - w / 2 + 0.1, a + w / 2 - 0.1, d + dp / 2 - 0.09, d + dp / 2 - 0.05, y + h - 0.24, y + h - 0.07));
  const yt = y + h, [cx, cz] = F.pt(a, d);
  bag.add('bronze', lathe([[0.001, 0], [0.09, 0], [0.12, 0.05], [0.15, 0.13], [0.12, 0.2], [0.14, 0.22], [0.001, 0.22]], 12, null, cx, yt, cz));
  for (const s of [-1, 1]) {
    const [x, z] = F.pt(a + s * 0.75, d);
    bag.add('bronze', lathe([[0.001, 0], [0.07, 0], [0.05, 0.04], [0.016, 0.08], [0.014, 0.3], [0.05, 0.32], [0.05, 0.35], [0.001, 0.35]], 10, null, x, yt, z));
    bag.add('linen', lathe([[0.017, 0], [0.017, 0.16], [0.001, 0.17]], 8, null, x, yt + 0.35, z));
    bag.add(FLAME, lathe([[0.001, 0], [0.012, 0.025], [0.001, 0.08]], 6, null, x, yt + 0.52, z));
    if (lights) lights.push({ at: [x, yt + 0.6, z], color: '#ffb46b', intensity: 1.6, distance: 6 });
    const [vx, vz] = F.pt(a + s * 1.3, d);
    bag.add('glaze_white', lathe([[0.001, 0], [0.06, 0], [0.09, 0.1], [0.07, 0.2], [0.04, 0.28], [0.06, 0.34], [0.001, 0.34]], 10, null, vx, yt, vz));
    for (let k = 0; k < 4; k++) { const th = k * 1.7 + s; bag.add(k % 2 ? 'cloth_red' : 'cloth_ochre', lathe([[0.001, 0], [0.05, 0.03], [0.001, 0.07]], 6, null, vx + Math.cos(th) * 0.05, yt + 0.36 + (k % 2) * 0.1, vz + Math.sin(th) * 0.05)); bag.add('bamboo_culm', rod([vx, yt + 0.3, vz], [vx + Math.cos(th) * 0.05, yt + 0.4, vz + Math.sin(th) * 0.05], 0.007, 3)); }
    const [fx, fz] = F.pt(a + s * 0.38, d + 0.05);
    bag.add('glaze_white', lathe([[0.001, 0], [0.1, 0], [0.16, 0.05], [0.17, 0.065], [0.001, 0.065]], 10, null, fx, yt, fz));
    for (const [ox, oz, oy] of [[-0.05, 0, 0], [0.05, 0.02, 0], [0, -0.05, 0], [0, 0, 0.09]]) bag.add(oy ? 'cloth_ochre' : 'cloth_red', lathe(Array.from({ length: 6 }, (_, i) => { const t = i / 5 * Math.PI; return [Math.max(0.001, Math.sin(t) * 0.055), 0.055 - Math.cos(t) * 0.055]; }), 7, null, fx + ox, yt + 0.065 + oy, fz + oz));
  }
  col.rect(F.rc(a - w / 2, d - dp / 2, a + w / 2, d + dp / 2), y, y + h);
}
/** A sumeru altar: stone base, red waist with a gilt band, stone cap; collides. */
function altar(F, bag, col, a0, a1, d0, d1, y, h) {
  bag.add('granite_block', F.B(a0, a1, d0, d1, y, y + h * 0.28));
  bag.add('lacquer_red', F.B(a0 + 0.15, a1 - 0.15, d0 + 0.15, d1 - 0.15, y + h * 0.28, y + h * 0.78));
  bag.add('gilt_bronze', F.B(a0 + 0.13, a1 - 0.13, d0 + 0.13, d1 - 0.13, y + h * 0.45, y + h * 0.5));
  bag.add('gilt_bronze', F.B(a0 + 0.13, a1 - 0.13, d0 + 0.13, d1 - 0.13, y + h * 0.62, y + h * 0.66));
  bag.add('granite_block', F.B(a0 + 0.04, a1 - 0.04, d0 + 0.04, d1 - 0.04, y + h * 0.78, y + h));
  col.rect(F.rc(a0, d0, a1, d1), y, y + h);
}
/** The caisson ceiling (zaojing) panel over a rect: coffers framed in red, a painted ground. */
function caisson(F, bag, a0, a1, d0, d1, yb) {
  bag.add('ceiling_coffer', F.B(a0, a1, d0, d1, yb, yb + 0.06));
  const n = Math.round((a1 - a0) / 1.5), m = Math.max(1, Math.round((d1 - d0) / 1.5));
  for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; bag.add('lacquer_red', F.B(a - 0.06, a + 0.06, d0, d1, yb - 0.08, yb)); }
  for (let j = 0; j <= m; j++) { const d = d0 + (d1 - d0) * j / m; bag.add('lacquer_red', F.B(a0, a1, d - 0.06, d + 0.06, yb - 0.08, yb)); }
}
const statueAt = (F, bag, type, a, d, y, h, da, dd, robe, robe2) => { const [x, z] = F.pt(a, d); STYLES.chinese.objects.statue({ at: [x, z], y, h, dir: F.v(da, dd), type, robe, robe2 }, { bag }); };

/**
 * temple_interior { rect, y, front, H, kind }: furniture of a monastery hall (the shell is the hall's own element).
 * kind 'main' (Buddha hall), 'guanyin' (a side hall), 'sutra' (the sutra repository).
 */
function templeInterior(el, { bag, col, lights }) {
  const F = frame(el), y = el.y, H = el.H ?? 5.0, kind = el.kind || 'main', W = F.W, D = F.D, fv = F.v(0, 1);
  const cols = ['cloth_ochre', 'cloth_red', 'cloth_indigo', 'cloth_white'];
  if (kind === 'main') {
    const bw = W / 7, top = y + H - 0.62, yb = y + H - 0.95;
    // the altar across the three middle bays, Buddha triad on it, attendants, the kings on their rocks
    const hAlt = 1.1, aa = bw * 1.5 + 0.2, dA = 3.7;
    altar(F, bag, col, -aa, aa, 1.2, 6.2, y, hAlt);
    const yA = y + hAlt;
    for (const [a, h] of [[0, 3.8], [-bw * 0.95, 3.3], [bw * 0.95, 3.3]]) { const [x, z] = F.pt(a, dA); STYLES.chinese.objects.buddha({ at: [x, z], y: yA, h, dir: fv }, { bag }); col.circle(x, z, 0.9, yA, yA + h * 0.6); }
    for (const s of [-1, 1]) {
      statueAt(F, bag, 'bodhisattva', s * bw * 0.48, dA - 0.2, yA, 2.6, 0, 1, 'clay_robe', 'clay_green');
      statueAt(F, bag, 'disciple', s * (aa - 0.8), dA, yA, 2.2, -s, 0.4, 'clay_robe', 'clay_green');
      statueAt(F, bag, 'king', s * (aa + 1.6), 2.0, y, 3.4, -s, 1, 'clay_green', 'clay_robe');
      col.circle(...F.pt(s * (aa + 1.6), 2.0), 0.8, y, y + 3.4);
    }
    // the table, the cushions before it, the great floor candle stands
    offering(F, bag, col, lights, 0, 7.5, y);
    for (let r = 0; r < 2; r++) for (let k = -2; k <= 2; k++) { const [x, z] = F.pt(k * 1.1, 9.1 + r * 1.2); cushion(bag, x, z, y, (k + r) % 2 ? 'cloth_red' : 'cloth_ochre'); }
    // the inner posts: two rows, tie beams along them, moon beams across, the caisson over the altar
    const rows = [D * 0.33, D * 0.62], as = [];
    for (let j = 0; j < 3; j++) as.push((0.5 + j) * bw);
    for (const d of rows) {
      for (const s of [-1, 1]) for (const a of as) post(F, bag, col, s * a, d, y, top);
      bag.add('lacquer_red', F.B(-W / 2 + 0.55, W / 2 - 0.55, d - 0.17, d + 0.17, yb, yb + 0.5));
      bag.add('paint_ochre', F.B(-W / 2 + 0.55, W / 2 - 0.55, d - 0.18, d + 0.18, yb + 0.2, yb + 0.26));
    }
    for (const s of [-1, 1]) for (const a of as) { bag.add('wood_dark', F.B(s * a - 0.13, s * a + 0.13, rows[0] + 0.17, rows[1] - 0.17, yb + 0.05, yb + 0.46)); bag.add('wood_dark', F.B(s * a - 0.13, s * a + 0.13, rows[0] - 6.4, rows[0] - 0.17, yb + 0.05, yb + 0.46)); }
    caisson(F, bag, -aa - 1, aa + 1, 0.5, rows[0] - 0.17, y + H - 0.9);
    // banners hung from the beams, lanterns in the aisles
    for (const [i, a] of [-1.5 * bw, -0.5 * bw, 0.5 * bw, 1.5 * bw, -2.5 * bw, 2.5 * bw].entries()) { banner(F, bag, a, rows[1] - 0.45, yb, 2.5, cols[i % 4]); }
    for (const a of [-2.5 * bw, 2.5 * bw]) banner(F, bag, a, rows[0] - 0.45, yb, 2.5, 'cloth_red');
    for (const d of [rows[1] + 2.5, rows[0] + 3.2]) for (const k of [-2, -1, 1, 2]) { const [x, z] = F.pt(k * bw, d); lantern(bag, x, z, y + H - 0.4, 0.9); }
    // luohan on a low bench along each side wall, turned inward
    for (const s of [-1, 1]) {
      const a0 = s * (W / 2 - 2.1), a1 = s * (W / 2 - 0.7);
      bag.add('granite_block', F.B(Math.min(a0, a1), Math.max(a0, a1), 2.2, D - 2.4, y, y + 0.5));
      col.rect(F.rc(Math.min(a0, a1), 2.2, Math.max(a0, a1), D - 2.4), y, y + 0.5);
      for (let k = 0; k < 6; k++) { const d = 3.2 + k * (D - 7.0) / 5; statueAt(F, bag, 'disciple', s * (W / 2 - 1.4), d, y + 0.5, 1.55, -s, 0, k % 2 ? 'clay_robe' : 'clay_green', 'clay_robe'); }
    }
    // the drum and the bell by the door
    const dz = D - 2.2;
    for (const s of [-1, 1]) {
      const [x, z] = F.pt(s * (bw * 2.5), dz), along = F.pt(1, 0)[0] !== F.pt(0, 0)[0];   // true when `a` runs along world x
      if (s > 0) {
        // the great bell hung from a beam on two posts
        for (const t of [-1, 1]) { const o = along ? [t * 0.9, 0] : [0, t * 0.9]; bag.add('lacquer_red', rod([x + o[0], y, z + o[1]], [x + o[0], y + 2.5, z + o[1]], 0.1, 8)); col.circle(x + o[0], z + o[1], 0.12, y, y + 2.5); }
        bag.add('lacquer_red', rod(along ? [x - 1.0, y + 2.5, z] : [x, y + 2.5, z - 1.0], along ? [x + 1.0, y + 2.5, z] : [x, y + 2.5, z + 1.0], 0.1, 8));
        bag.add('bronze', lathe([[0.001, 0], [0.12, 0], [0.2, 0.1], [0.34, 0.5], [0.4, 0.9], [0.42, 1.0], [0.36, 1.02], [0.001, 1.0]].map(([r, h]) => [r, h]), 12, null, x, y + 1.25, z));
        bag.add('bronze', rod([x, y + 2.25, z], [x, y + 2.5, z], 0.03, 5));
      } else {
        // the drum on its stand, the head toward the hall's middle
        const dr = lathe([[0.001, -0.5], [0.38, -0.46], [0.5, -0.2], [0.55, 0], [0.5, 0.2], [0.38, 0.46], [0.001, 0.5]], 14);
        if (along) dr.rotateZ(Math.PI / 2); else dr.rotateX(Math.PI / 2);
        dr.translate(x, y + 1.2, z); bag.add('lacquer_red', dr);
        for (const t of [-1, 1]) { const o = along ? [0, t * 0.5] : [t * 0.5, 0]; bag.add('wood_dark', rod([x + o[0] * 1.1, y, z + o[1] * 1.1], [x + o[0] * 0.2, y + 1.05, z + o[1] * 0.2], 0.05, 6)); }
        col.circle(x, z, 0.7, y, y + 1.8);
      }
    }
    return;
  }
  if (kind === 'guanyin') {
    altar(F, bag, col, -3.2, 3.2, 0.8, 3.6, y, 0.85);
    const yA = y + 0.85;
    statueAt(F, bag, 'bodhisattva', 0, 2.1, yA, 3.3, 0, 1, 'clay_robe', 'clay_green');
    col.circle(...F.pt(0, 2.1), 0.8, yA, yA + 2);
    for (const s of [-1, 1]) { statueAt(F, bag, 'kneel', s * 2.3, 2.5, yA, 1.2, 0, 1, 'clay_robe', 'clay_green'); statueAt(F, bag, 'disciple', s * 7, 1.6, y, 1.9, -s, 1, 'clay_robe', 'clay_green'); }
    offering(F, bag, col, lights, 0, 5.2, y, 2.6);
    for (const k of [-1, 0, 1]) { const [x, z] = F.pt(k * 1.1, 6.6); cushion(bag, x, z, y, k ? 'cloth_red' : 'cloth_ochre'); }
    for (const a of [-9, -4.5, 4.5, 9, -13, 13]) { const [x, z] = F.pt(a, D * 0.55); lantern(bag, x, z, y + H - 0.4, 0.7); }
    for (const [i, a] of [-4.5, -7.5, -10.5, 4.5, 7.5, 10.5].entries()) banner(F, bag, a, 1.0, y + H - 0.9, 2.6, cols[i % 4]);
    return;
  }
  // the sutra hall: shelves along the back wall; the revolving cabinet; reading tables; lamps
  const n = Math.floor((W - 3) / 2.2), a00 = -n * 1.1;
  for (let i = 0; i < n; i++) {
    const a = a00 + i * 2.2 + 1.1, a0 = a - 1.0, a1 = a + 1.0;
    bag.add('wood_dark', F.B(a0, a0 + 0.06, 0.15, 0.7, y, y + 2.5)); bag.add('wood_dark', F.B(a1 - 0.06, a1, 0.15, 0.7, y, y + 2.5));
    bag.add('wood_dark', F.B(a0, a1, 0.15, 0.7, y + 2.5, y + 2.58));
    for (let r = 0; r < 5; r++) {
      const yy = y + 0.1 + r * 0.48;
      bag.add('wood_dark', F.B(a0, a1, 0.15, 0.7, yy, yy + 0.04));
      let u = a0 + 0.1;
      for (let k = 0; u < a1 - 0.25; k++) { const wd = 0.14 + ((i * 7 + r * 3 + k * 5) % 4) * 0.03; bag.add(k % 3 ? 'linen' : 'cloth_ochre', F.B(u, u + wd, 0.22, 0.62, yy + 0.04, yy + 0.4)); if (k % 4 === 0) bag.add('cloth_red', F.B(u + 0.02, u + wd - 0.02, 0.62, 0.64, yy + 0.2, yy + 0.38)); u += wd + 0.015; }
    }
    col.rect(F.rc(a0, 0.15, a1, 0.7), y, y + 2.6);
  }
  // the revolving cabinet (zhuanlun zang) of the Song: an octagonal case of small drawers on a post, its pagoda-like roof
  {
    const [cx, cz] = F.pt(0, D * 0.42), R = 1.45, N = 8;
    bag.add('granite_block', lathe([[0.001, 0], [1.9, 0], [1.9, 0.15], [1.7, 0.25], [0.001, 0.25]], 8, null, cx, y, cz));
    const ring = (r0, y0, y1, mat) => { const t = []; for (let k = 0; k < N; k++) { const a0 = (k + 0.5) / N * Math.PI * 2, a1 = (k + 1.5) / N * Math.PI * 2, P = (r, a, yy) => [cx + Math.cos(a) * r, yy, cz + Math.sin(a) * r]; hexa(t, [P(r0 - 0.001, a0, y0), P(r0 - 0.001, a1, y0), P(0.2, a1, y0), P(0.2, a0, y0), P(r0, a0, y1), P(r0, a1, y1), P(0.2, a1, y1), P(0.2, a0, y1)]); } bag.add(mat, fromTriangles(t)); };
    ring(R, y + 0.25, y + 2.7, 'lacquer_red');
    for (let r = 0; r < 6; r++) for (let k = 0; k < N; k++) for (let q = 0; q < 3; q++) {
      const am = (k + 1) / N * Math.PI * 2 + (q - 1) * (Math.PI / N) * 0.6, yy = y + 0.45 + r * 0.38, p = [cx + Math.cos(am) * (R * 0.93 + 0.04), cz + Math.sin(am) * (R * 0.93 + 0.04)];
      bag.add('wood_dark', box(p[0] - 0.07, yy, p[1] - 0.07, p[0] + 0.07, yy + 0.27, p[1] + 0.07)); bag.add('bronze', box(p[0] - 0.02, yy + 0.12, p[1] - 0.02, p[0] + 0.02, yy + 0.15, p[1] + 0.02));
    }
    bag.add('gilt_bronze', lathe([[R + 0.06, 0], [R + 0.06, 0.06], [R - 0.06, 0.06], [R - 0.06, 0]], 8, null, cx, y + 2.7, cz));
    bag.add('tile_dark', lathe([[R + 0.35, 0], [R * 0.6, 0.5], [0.3, 0.9], [0.001, 1.2]], 8, null, cx, y + 2.76, cz));
    bag.add('gilt_bronze', lathe([[0.04, 0], [0.04, 0.4], [0.1, 0.45], [0.001, 0.6]], 6, null, cx, y + 3.9, cz));
    col.circle(cx, cz, 1.9, y, y + 3.0);
  }
  for (const s of [-1, 1]) {
    const a = s * (W * 0.3), d = D * 0.72, [x, z] = F.pt(a, d);
    bag.add('wood_dark', F.B(a - 1.0, a + 1.0, d - 0.4, d + 0.4, y + 0.74, y + 0.8)); col.rect(F.rc(a - 1.0, d - 0.4, a + 1.0, d + 0.4), y, y + 0.8);
    for (const [da, dd] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bag.add('wood_dark', F.B(a + da * 0.92 - 0.04, a + da * 0.92 + 0.04, d + dd * 0.32 - 0.04, d + dd * 0.32 + 0.04, y, y + 0.74));
    for (let k = 0; k < 3; k++) { bag.add(k ? 'linen' : 'cloth_ochre', F.B(a - 0.7 + k * 0.5, a - 0.4 + k * 0.5, d - 0.15, d + 0.15, y + 0.8, y + 0.86)); }
    for (const t of [-1, 1]) { const [bx, bz] = F.pt(a + t * 0.5, d + 0.65); bag.add('wood_dark', box(bx - 0.4, y + 0.42, bz - 0.12, bx + 0.4, y + 0.46, bz + 0.12)); void bx; }
    bag.add('bronze', lathe([[0.001, 0], [0.06, 0], [0.04, 0.05], [0.015, 0.1], [0.015, 0.2], [0.05, 0.22], [0.001, 0.22]], 8, null, x, y + 0.8, z));
    bag.add(FLAME, lathe([[0.001, 0], [0.012, 0.025], [0.001, 0.08]], 6, null, x, y + 1.03, z));
    if (lights) lights.push({ at: [x, y + 1.1, z], color: '#ffb46b', intensity: 1.4, distance: 6 });
  }
  for (const a of [-W * 0.3, W * 0.3, -W * 0.12, W * 0.12]) { const [x, z] = F.pt(a, D * 0.62); lantern(bag, x, z, y + H - 0.4, 0.7); }
  void fv;
}

/** incense_ding { at, y, s }: a great bronze censer before a hall, on a stone sumeru pedestal. */
function incenseDing(el, { bag, col }) {
  const P = new Parts(); tripod(P, 'bronze', 'granite_block');
  const [x, z] = el.at, s = el.s ?? 1.4;
  P.emit(bag, x, el.y ?? 0, z, 0, s); col.circle(x, z, 0.95 * s, el.y ?? 0, (el.y ?? 0) + 3.2 * s);
}
/** stele { at, y, face }: an inscribed stone stele on its bixi tortoise, the head toward `face`, a carved cap of twined dragons. */
export function stele(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, f = el.face ?? [0, 1], yaw = Math.atan2(f[0], f[1]), c = Math.cos(yaw), s = Math.sin(yaw);
  const P = new Parts(); tortoise(P, 'granite_black', 'granite_block'); P.emit(bag, x, y, z, yaw, 1);
  const L = (u, v) => [x + u * c + v * s, z - u * s + v * c];
  const B = (u0, u1, v0, v1, y0, y1, m) => { const p = L(u0, v0), q = L(u1, v1); bag.add(m, box(Math.min(p[0], q[0]), y + y0, Math.min(p[1], q[1]), Math.max(p[0], q[0]), y + y1, Math.max(p[1], q[1]))); };
  void s;
  // (the slab's faces are along the world axes only for the four compass facings; the stele is turned by its own frame)
  const axis = Math.abs(Math.round(yaw / (Math.PI / 2)) * (Math.PI / 2) - yaw) < 1e-3;
  if (axis) {
    B(-0.5, 0.5, -0.17, 0.17, 1.3, 3.55, 'granite_grey');
    B(-0.56, 0.56, -0.2, 0.2, 3.55, 3.95, 'granite_block'); B(-0.42, 0.42, -0.19, 0.19, 3.95, 4.25, 'granite_block'); B(-0.22, 0.22, -0.18, 0.18, 4.25, 4.45, 'granite_block');
    for (let r = 0; r < 12; r++) for (const v of [-0.172, 0.172]) { const uu = [[-0.36, 0.36]]; const lines = 3 + (r % 2); for (let k = 0; k < lines; k++) { const u0 = -0.38 + (k + 0.3) * 0.76 / lines; B(u0, u0 + 0.06, v - (v > 0 ? 0 : 0.006), v + (v > 0 ? 0.006 : 0), 1.55 + r * 0.16, 1.55 + r * 0.16 + 0.1, 'lacquer_black'); } void uu; }
  }
  col.rect([x - 0.9, z - 1.1, x + 0.9, z + 1.1], y, y + 4.4);
}
/** sutra_pillar { at, y, h }: an octagonal stone pillar of the Song, a sumeru base, carved shaft, a lotus cap and a little roof. */
function sutraPillar(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, h = el.h ?? 4.6;
  bag.add('granite_block', lathe([[0.001, 0], [0.9, 0], [0.9, 0.18], [0.78, 0.3], [0.62, 0.4], [0.001, 0.4]], 8, null, x, y, z));
  bag.add('granite_grey', lathe([[0.4, 0], [0.4, h - 1.1], [0.46, h - 1.0], [0.46, h - 0.8], [0.001, h - 0.8]], 8, null, x, y + 0.4, z));
  bag.add('granite_block', lathe([[0.5, 0], [0.62, 0.1], [0.58, 0.22], [0.001, 0.28]], 8, null, x, y + h - 0.4, z));
  bag.add('tile_dark', lathe([[0.75, 0], [0.5, 0.18], [0.3, 0.34], [0.001, 0.42]], 8, null, x, y + h - 0.12, z));
  bag.add('granite_block', lathe([[0.001, 0], [0.12, 0.06], [0.05, 0.2], [0.001, 0.32]], 8, null, x, y + h + 0.3, z));
  for (let k = 0; k < 8; k++) { const a = (k + 0.5) / 8 * Math.PI * 2 + Math.PI / 8; bag.add('lacquer_black', box(x + Math.cos(a) * 0.395 - 0.04, y + 0.9 + (k % 2) * 0.2, z + Math.sin(a) * 0.395 - 0.04, x + Math.cos(a) * 0.395 + 0.04, y + 2.7, z + Math.sin(a) * 0.395 + 0.04)); }
  col.circle(x, z, 0.8, y, y + h);
}
/** stone_lamp { at, y }: a stone lantern on a post, its fire chamber with four openings, a hipped cap. */
function stoneLamp(el, { bag, col, lights }) {
  const [x, z] = el.at, y = el.y ?? 0;
  bag.add('granite_grey', lathe([[0.001, 0], [0.4, 0], [0.4, 0.14], [0.2, 0.22], [0.14, 0.3], [0.14, 1.1], [0.3, 1.2], [0.3, 1.3], [0.001, 1.3]], 8, null, x, y, z));
  for (const [dx, dz, w, d] of [[0, 0, 0.26, 0.26]]) bag.add('granite_grey', box(x - w, y + 1.3, z - d, x + w, y + 1.38, z + d));
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) bag.add('granite_grey', box(x + sx * 0.22 - 0.04, y + 1.38, z + sz * 0.22 - 0.04, x + sx * 0.22 + 0.04, y + 1.85, z + sz * 0.22 + 0.04));
  bag.add('lamp_paper', box(x - 0.18, y + 1.4, z - 0.18, x + 0.18, y + 1.83, z + 0.18));
  bag.add('granite_grey', lathe([[0.55, 0], [0.4, 0.08], [0.2, 0.22], [0.001, 0.3]], 4, null, x, y + 1.85, z));
  if (lights && el.lit !== false) lights.push({ at: [x, y + 1.6, z], color: '#ffb46b', intensity: 1.2, distance: 6 });
  col.circle(x, z, 0.42, y, y + 2.2);
}
/** hung_bell { at, y, H, axis }: the monastery's great bell on a frame, or its drum (kind 'drum'), inside a tower's lower storey. */
function hungBell(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, H = el.H ?? 4.2, along = el.axis !== 'z', u = (t) => (along ? [x + t, z] : [x, z + t]);
  if (el.kind === 'drum') {
    const dr = lathe([[0.001, -0.8], [0.6, -0.76], [0.82, -0.3], [0.9, 0], [0.82, 0.3], [0.6, 0.76], [0.001, 0.8]], 16);
    if (along) dr.rotateZ(Math.PI / 2); else dr.rotateX(Math.PI / 2);
    dr.translate(x, y + 1.6, z); bag.add('lacquer_red', dr);
    for (const t of [-1, 1]) { const a = u(t * 0.9), b = u(t * 0.2); bag.add('wood_dark', rod([a[0], y, a[1]], [b[0], y + 1.45, b[1]], 0.07, 6)); }
    for (let k = 0; k < 14; k++) { const th = k / 14 * Math.PI * 2, p = u(0); bag.add('bronze', along ? lathe([[0.001, 0], [0.03, 0], [0.001, 0.03]], 5, null, p[0] + 0.0, y + 1.6 + Math.sin(th) * 0.88, p[1] + Math.cos(th) * 0.88) : lathe([[0.001, 0], [0.03, 0], [0.001, 0.03]], 5, null, p[0] + Math.sin(th) * 0.88, y + 1.6 + Math.cos(th) * 0.88, p[1])); }
    col.circle(x, z, 1.1, y, y + 2.6); return;
  }
  const top = y + H - 0.7;
  for (const t of [-1, 1]) { const p = u(t * 1.4); bag.add('lacquer_red', rod([p[0], y, p[1]], [p[0], top, p[1]], 0.12, 8)); bag.add('granite_block', lathe([[0.001, 0], [0.26, 0], [0.26, 0.1], [0.001, 0.12]], 8, null, p[0], y, p[1])); col.circle(p[0], p[1], 0.14, y, top); }
  const a = u(-1.5), b = u(1.5);
  bag.add('lacquer_red', rod([a[0], top, a[1]], [b[0], top, b[1]], 0.12, 8));
  bag.add('bronze', rod([x, top, z], [x, top - 0.35, z], 0.04, 5));
  bag.add('bronze', lathe([[0.001, 0], [0.14, 0], [0.22, 0.12], [0.38, 0.6], [0.46, 1.1], [0.48, 1.3], [0.42, 1.34], [0.001, 1.3]], 14, null, x, top - 1.69, z));
  // the striker, a log slung on two cords
  const s0 = along ? [x, top - 0.1, z - 1.2] : [x - 1.2, top - 0.1, z], s1 = along ? [x, top - 0.1, z + 1.2] : [x + 1.2, top - 0.1, z];
  void s0; void s1;
  bag.add('wood_dark', rod(along ? [x, top - 1.35, z - 1.1] : [x - 1.1, top - 1.35, z], along ? [x, top - 1.35, z + 0.9] : [x + 0.9, top - 1.35, z], 0.09, 6));
  for (const t of [-0.5, 0.4]) { const p = along ? [x, z + t] : [x + t, z]; bag.add('rope_fibre', rod([p[0], top, p[1]], [p[0], top - 1.3, p[1]], 0.012, 3)); }
  col.circle(x, z, 0.5, y, y + 1.4);
}


/**
 * terrace_rail { rect (the platform's outer rect), y (its top), inset, gaps: [[side 's'|'n'|'e'|'w', centre, half-width]…] } — the stone balustrade of a hall's terrace as the Song
 * built it (Yingzao fashi, the xunzhang lan'gan): posts every ~2.3 m with a lotus-bud cap, a round top rail (xunzhang) on them, a wide lower board (ebo) and a footing,
 * between them the vase balusters (jingping) every 0.3 m; at the corners and at the ends by the stairs the posts are taller and a drum stone (baogushi) flanks the stairs;
 * a dragon-head spout (chishou) under each corner post. Gaps (the stairs) have a post at either end. [inferred: the Song form; the proportions after the fashi's norms, not measured]
 */
function terraceRail(el, { bag, col }) {
  const [X0, Z0, X1, Z1] = el.rect, y = el.y, ins = el.inset ?? 0.2, gaps = el.gaps ?? [];
  const x0 = X0 + ins, z0 = Z0 + ins, x1 = X1 - ins, z1 = Z1 - ins, HP = 1.12;
  const vase = [[0.001, 0], [0.045, 0.0], [0.055, 0.03], [0.04, 0.09], [0.07, 0.2], [0.075, 0.26], [0.04, 0.33], [0.05, 0.38], [0.001, 0.4]];
  const post = (x, z, tall) => {
    bag.add('granite_grey', box(x - 0.11, y, z - 0.11, x + 0.11, y + HP + (tall ? 0.18 : 0), z + 0.11));
    bag.add('granite_block', lathe([[0.001, 0], [0.15, 0], [0.15, 0.04], [0.1, 0.07], [0.12, 0.14], [0.07, 0.24], [0.001, 0.32]], 8, null, x, y + HP + (tall ? 0.18 : 0), z));
    col.circle(x, z, 0.14, y, y + HP);
  };
  const run = (a, b, ns, c, side) => {            // a straight run from a to b along an axis (ns: along x at z = c)
    const L = b - a; if (L < 0.3) return;
    const n = Math.max(1, Math.round(L / 2.3)), seg = L / n;
    const P = (u, v) => (ns ? [u, v] : [v, u]);
    const B = (u0, v0, u1, v1, ya, yb, m) => { const p = P(u0, v0), q = P(u1, v1); bag.add(m, box(Math.min(p[0], q[0]), ya, Math.min(p[1], q[1]), Math.max(p[0], q[0]), yb, Math.max(p[1], q[1]))); };
    B(a, c - 0.09, b, c + 0.09, y, y + 0.16, 'granite_block');                    // the footing
    B(a, c - 0.06, b, c + 0.06, y + 0.16, y + 0.3, 'granite_grey');               // the lower board (ebo)
    B(a, c - 0.05, b, c + 0.05, y + HP - 0.2, y + HP - 0.1, 'granite_grey');      // the top rail (xunzhang)
    for (let k = 0; k < n; k++) {
      const u0 = a + k * seg, u1 = u0 + seg;
      const m = Math.max(2, Math.round((seg - 0.3) / 0.3));
      for (let j = 0; j < m; j++) { const u = u0 + 0.15 + (seg - 0.3) * (j + 0.5) / m, p = P(u, c); bag.add('granite_block', lathe(vase, 6, null, p[0], y + 0.3, p[1])); }
      void u1;
    }
    for (let k = 0; k <= n; k++) { const q = P(a + k * seg, c); post(q[0], q[1], k === 0 || k === n); }
    col.rect(ns ? [a, c - 0.1, b, c + 0.1] : [c - 0.1, a, c + 0.1, b], y, y + HP);
    void side;
  };
  const sideRuns = (side) => {
    const ns = side === 's' || side === 'n', a0 = ns ? x0 : z0, a1 = ns ? x1 : z1, c = side === 's' ? z1 : side === 'n' ? z0 : side === 'e' ? x1 : x0;
    const cuts = gaps.filter((g) => g[0] === side).map((g) => [g[1] - g[2], g[1] + g[2]]).sort((p, q) => p[0] - q[0]);
    let a = a0;
    for (const [g0, g1] of cuts) { run(a, g0, ns, c, side); a = g1; }
    run(a, a1, ns, c, side);
    // the drum stones either side of a gap
    for (const [g0, g1] of cuts) for (const e of [g0, g1]) { const p = ns ? [e + (e === g0 ? -0.5 : 0.5), c + (side === 's' ? -0.18 : 0.18)] : [c + (side === 'e' ? -0.18 : 0.18), e + (e === g0 ? -0.5 : 0.5)]; bag.add('granite_block', lathe([[0.001, 0], [0.3, 0], [0.32, 0.08], [0.29, 0.16], [0.32, 0.5], [0.27, 0.58], [0.24, 0.6], [0.001, 0.6]], 12, null, p[0], y, p[1])); col.circle(p[0], p[1], 0.32, y, y + 0.6); }
  };
  for (const side of ['s', 'n', 'e', 'w']) sideRuns(side);
  // the dragon-head spouts under the corner posts, jutting from the platform's face
  for (const [cx, cz, dx, dz] of [[X0, Z0, -1, -1], [X1, Z0, 1, -1], [X0, Z1, -1, 1], [X1, Z1, 1, 1]]) for (const [ex, ez] of [[dx, 0], [0, dz]]) {
    const px = ex ? cx - ex * 0.1 : cx - dx * 0.4, pz = ez ? cz - ez * 0.1 : cz - dz * 0.4;
    bag.add('granite_grey', box(Math.min(px, px + ex * 0.4) - (ex ? 0 : 0.11), y - 0.62, Math.min(pz, pz + ez * 0.4) - (ez ? 0 : 0.11), Math.max(px, px + ex * 0.4) + (ex ? 0 : 0.11), y - 0.4, Math.max(pz, pz + ez * 0.4) + (ez ? 0 : 0.11)));
  }
}


/**
 * hall_dress { rect, y, H, front, plaque: { w, chars }, lanterns: n } — the front of a monastery hall as it was dressed: over the middle bay's door the hall's name board (bian'e):
 * black lacquer in a gilt frame with gilt characters (abstract strokes: no lettering in the world), set into the opening under the frieze; under the eave a hooked
 * bracket at each bay's middle and a red paper lantern from it; on either side of the door a pair of gilt door studs' rows on the jambs. [inferred: after the Song halls' plaques
 * and the lanterns of the scroll's temple gates; the board's size by the bay]
 */
function hallDress(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y, H = el.H ?? 4.6, f = el.front ?? 's', ns = f === 's' || f === 'n';
  const L = ns ? x1 - x0 : z1 - z0, out = f === 's' || f === 'e' ? 1 : -1;
  const c = f === 's' ? z1 : f === 'n' ? z0 : f === 'e' ? x1 : x0;
  const rc = (a0, d0, a1, d1) => { const A = [Math.min(a0, a1), Math.max(a0, a1)], D = [c + out * Math.min(d0, d1), c + out * Math.max(d0, d1)].sort((p, q) => p - q); return ns ? [x0 + A[0], D[0], x0 + A[1], D[1]] : [D[0], z0 + A[0], D[1], z0 + A[1]]; };
  const B = (m, a0, d0, a1, d1, ya, yb) => { const [p, q, r, t] = rc(a0, d0, a1, d1); bag.add(m, box(p, ya, q, r, yb, t)); };
  const nb = el.bays ?? Math.max(1, 2 * Math.round((L / 3.6 - 1) / 2) + 1), mid = L / 2, pw = el.plaque?.w ?? Math.min(2.6, L / nb * 0.6);
  if (el.plaque) {
    const yb = y + H - 0.62, ya = yb - 0.85;
    B('lacquer_black', mid - pw / 2, -0.02, mid + pw / 2, 0.2, ya, yb);
    B('gilt_bronze', mid - pw / 2 - 0.07, 0.17, mid + pw / 2 + 0.07, 0.23, ya - 0.07, ya); B('gilt_bronze', mid - pw / 2 - 0.07, 0.17, mid + pw / 2 + 0.07, 0.23, yb, yb + 0.07);
    B('gilt_bronze', mid - pw / 2 - 0.07, 0.17, mid - pw / 2, 0.23, ya, yb); B('gilt_bronze', mid + pw / 2, 0.17, mid + pw / 2 + 0.07, 0.23, ya, yb);
    const n = el.plaque.chars ?? 4, cw = (pw - 0.3) / n;
    for (let k = 0; k < n; k++) {
      const cx = mid - pw / 2 + 0.15 + cw * (k + 0.5), h = 0.5, yc = (ya + yb) / 2, w2 = Math.min(0.2, cw * 0.42);
      B('gilt_bronze', cx - w2, 0.2, cx + w2, 0.215, yc - h / 2, yc - h / 2 + 0.06); B('gilt_bronze', cx - 0.025, 0.2, cx + 0.025, 0.215, yc - h / 2, yc + h / 2);
      if (k % 2 === 0) B('gilt_bronze', cx - w2, 0.2, cx + w2, 0.215, yc + h / 2 - 0.06, yc + h / 2);
      B('gilt_bronze', cx - w2, 0.2, cx - w2 + 0.05, 0.215, yc - h / 2 + 0.1, yc + h / 2 - (k % 2 ? 0.2 : 0.1));
      if (k % 3 !== 1) B('gilt_bronze', cx + w2 - 0.05, 0.2, cx + w2, 0.215, yc - h / 2 + 0.1, yc + h / 2 - 0.1);
    }
  }
  // the doors of the middle bay: two pairs of leaves, each pair folded open against its jamb (the outer leaf in the opening's plane, the inner leaf folded out over it); each leaf is
  // framed, its upper third a lattice, its lower field panelled with a gilt medallion in a frame and rows of gilt studs, an iron ring on the leading stile [inferred: Song temple
  // doors, the lattice-and-panel leaves of the Yingzao fashi's door types and the studded leaves of Song temple depictions]
  {
    const bw0 = L / nb, mb = (nb - 1) / 2, a0 = bw0 * mb + 0.3, a1 = bw0 * (mb + 1) - 0.3, lw = Math.min(1.25, (a1 - a0) / 2.05), yf = y + 0.14;
    const yt = el.plaque ? y + H - 0.62 - 0.85 - 0.06 : y + Math.min(H - 1.0, 3.6), dh = yt - yf, ysp = yf + dh * 0.62;
    for (const sd of [-1, 1]) for (const layer of [0, 1]) {
      const h0 = sd < 0 ? a0 : a1 - lw, h1 = h0 + lw, d0 = layer ? 0.03 : -0.07, d1 = d0 + 0.07, um = (h0 + h1) / 2;
      B('lacquer_red', h0, d0, h1, d1, yf, yt);
      for (const [u0, u1] of [[h0, h0 + 0.1], [h1 - 0.1, h1], [um - 0.04, um + 0.04]]) B('lacquer_red', u0, d1, u1, d1 + 0.02, yf, yt);
      for (const [v0, v1] of [[yf, yf + 0.14], [ysp - 0.07, ysp + 0.07], [yt - 0.12, yt]]) B('lacquer_red', h0, d1, h1, d1 + 0.025, v0, v1);
      B('wood_dark', h0 + 0.1, d1, h1 - 0.1, d1 + 0.012, ysp + 0.07, yt - 0.12);
      for (let k = 1; k < 5; k++) { const u = h0 + 0.1 + (lw - 0.2) * k / 5; B('lacquer_red', u - 0.012, d1, u + 0.012, d1 + 0.03, ysp + 0.07, yt - 0.12); }
      for (let k = 1; k < 4; k++) { const v = ysp + 0.07 + (yt - 0.12 - ysp - 0.07) * k / 4; B('lacquer_red', h0 + 0.1, d1, h1 - 0.1, d1 + 0.03, v - 0.012, v + 0.012); }
      B('wood_dark', h0 + 0.14, d1, h1 - 0.14, d1 + 0.012, yf + 0.18, ysp - 0.11);
      const vm = (yf + 0.18 + ysp - 0.11) / 2;
      for (const [a, b, c, e] of [[-0.17, -0.17, 0.17, -0.14], [-0.17, 0.14, 0.17, 0.17], [-0.17, -0.14, -0.14, 0.14], [0.14, -0.14, 0.17, 0.14]]) B('gilt_bronze', um + a, d1, um + c, d1 + 0.03, vm + b, vm + e);
      B('lacquer_red', um - 0.12, d1, um + 0.12, d1 + 0.022, vm - 0.12, vm + 0.12); B('gilt_bronze', um - 0.045, d1, um + 0.045, d1 + 0.04, vm - 0.045, vm + 0.045);
      for (const dv of [-0.42, 0.42]) for (const u of [h0 + 0.3, um, h1 - 0.3]) B('gilt_bronze', u - 0.03, d1, u + 0.03, d1 + 0.035, vm + dv - 0.03, vm + dv + 0.03);
      const edge = sd < 0 ? h1 - 0.17 : h0 + 0.17; B('iron', edge - 0.05, d1 + 0.01, edge + 0.05, d1 + 0.04, ysp - 0.5 - 0.05, ysp - 0.5 + 0.05);
    }
  }
  // the lanterns: a bracket arm from the frieze beam at the middle of every bay but the middle one, the lantern hung from its end
  const bw = L / nb;
  for (let k = 0; k < nb; k++) {
    if (k === (nb - 1) / 2 && el.plaque) continue;
    const a = bw * (k + 0.5), yt = y + H - 0.58;
    B('wood_dark', a - 0.05, 0.0, a + 0.05, 0.62, yt, yt + 0.09);
    const [px, pz] = (() => { const [p, q, r, t] = rc(a, 0.58, a, 0.58); return [(p + r) / 2, (q + t) / 2]; })();
    lantern(bag, px, pz, yt, 0.3, 'lamp_paper');
  }
}

export const TEMPLE_ELEMENTS = { hall_dress: hallDress, terrace_rail: terraceRail, temple_interior: templeInterior, incense_ding: incenseDing, stele, sutra_pillar: sutraPillar, stone_lamp: stoneLamp, hung_bell: hungBell };
