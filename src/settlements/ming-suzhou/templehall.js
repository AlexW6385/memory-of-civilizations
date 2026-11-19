// The temple's halls inside (docs/settlements/ming-suzhou.md §26): the main hall's altar with the three Buddhas, the disciples and arhats,
// the offerings, banners, canopy, cushions, drum and bell, the monks and worshippers at their acts; the side halls by their use; the
// gate's guardian kings. Everything is built in plan coordinates (x east, z south, the hall's front on the south), the figures
// each as one geometry per material (no instancing: each image differs), the small pieces by hash-of-place variations.

import { Parts, box, lathe, limb, T, ball, fromTriangles } from './props.js';
import { sumeru } from '../../styles/qing/carving.js';
import { figure } from '../../objects/figures.js';
import { hash } from './townwork.js';
import { Fig, buddha, throne, disciple, king, lohan, attendant } from './templefig.js';

const PI = Math.PI;
const put = (P, build, x, y, z, yaw = 0, s = 1) => { const Q = new Parts(); build(Q); Q.emit(P, x, y, z, yaw, s); };
const stat = (P, build, x, y, z, yaw, k, o) => { const F = new Fig(k), Q = new Parts(); build(F, o); F.into(Q); Q.emit(P, x, y, z, yaw); };

/** temple_figure { kind, at: [x, z], y, yaw, k, ...options }: one image, for looking at. */
export function templeFigure(el, { bag }) {
  const P = new Parts(), b = { buddha: (F, o) => { buddha(F, o); throne(F, 0.62, 0.6, o.lod ?? 0); }, disciple, king, lohan }[el.kind] ?? attendant;
  stat(P, b, el.at[0], el.y ?? 0, el.at[1], el.yaw ?? 0, el.k ?? 1, el);
  P.emit(bag);
}

// ── the vessels of the altar ─────────────────────────────────────────────────
/** A bronze incense burner (ding): three legs, a round bowl with two ears, a lid of open work; 0.62 m. */
function censer(P, s = 1) {
  P.add('bronze', lathe([[0.001, 0.12], [0.11, 0.12], [0.15, 0.2], [0.17, 0.3], [0.16, 0.36], [0.14, 0.36], [0.14, 0.3], [0.12, 0.2], [0.001, 0.16]], 14).scale(s, s, s));
  P.add('bronze', lathe([[0.15, 0.34], [0.18, 0.355], [0.18, 0.375], [0.15, 0.37]], 14).scale(s, s, s));
  for (let k = 0; k < 3; k++) { const a = k * 2.094 + 0.4; P.add('bronze', limb([Math.cos(a) * 0.1 * s, 0.14 * s, Math.sin(a) * 0.1 * s], [Math.cos(a) * 0.135 * s, 0, Math.sin(a) * 0.135 * s], 0.026 * s, 0.018 * s, 6)); }
  for (const x of [-1, 1]) { P.add('bronze', limb([x * 0.16 * s, 0.34 * s, 0], [x * 0.23 * s, 0.42 * s, 0], 0.012 * s, 0.012 * s, 5)); P.add('bronze', limb([x * 0.23 * s, 0.42 * s, 0], [x * 0.2 * s, 0.34 * s, 0], 0.012 * s, 0.012 * s, 5)); }
  P.add('iron', lathe([[0.001, 0.3 * s], [0.14 * s, 0.3 * s], [0.14 * s, 0.34 * s], [0.001, 0.34 * s]], 12));      // the ash
  for (let k = 0; k < 5; k++) P.add('lacquer_red', limb([(k - 2) * 0.03 * s, 0.34 * s, (k % 2 - 0.5) * 0.04 * s], [(k - 2) * 0.034 * s, 0.5 * s, (k % 2 - 0.5) * 0.05 * s], 0.003, 0.003, 3));   // the sticks, smouldering
  P.add('bronze', lathe([[0.001, 0.36 * s], [0.12 * s, 0.36 * s], [0.08 * s, 0.44 * s], [0.03 * s, 0.5 * s], [0.001, 0.54 * s]], 10));
}
/** A candlestick (a bronze pricket with a dish) with a red candle burning; h high. */
function candlestick(P, h = 0.42) {
  P.add('bronze', lathe([[0.001, 0], [0.07, 0], [0.07, 0.02], [0.03, 0.05], [0.022, 0.1], [0.032, 0.14], [0.022, 0.2], [0.02, h - 0.06], [0.06, h - 0.05], [0.06, h - 0.03], [0.001, h - 0.03]], 10));
  P.add('lacquer_red', lathe([[0.001, h - 0.03], [0.026, h - 0.03], [0.026, h + 0.2], [0.001, h + 0.2]], 8));
  P.add('flame', lathe([[0.001, h + 0.2], [0.015, h + 0.213], [0.001, h + 0.27]], 6));
}
/** A flower vase (gu) with lotus: a trumpet mouth over a waist and a swelling foot, two blossoms and a seed pod; h high. */
function vase(P, h = 0.46, seed = 1) {
  P.add('gilt_bronze', lathe([[0.001, 0], [0.085, 0], [0.09, 0.02], [0.06, 0.1], [0.032, 0.2], [0.03, 0.26], [0.05, 0.34], [0.09, h - 0.02], [0.1, h], [0.085, h], [0.04, h - 0.04], [0.001, h - 0.04]], 12));
  for (let k = 0; k < 3; k++) {
    const a = hash(seed, k, 3) * 6.28, lean = 0.05 + 0.06 * k, top = h + 0.25 + 0.12 * k;
    P.add('sod', limb([0, h - 0.04, 0], [Math.cos(a) * lean, top, Math.sin(a) * lean], 0.006, 0.005, 4));
    if (k < 2) for (let p = 0; p < 6; p++) { const b = p / 6 * 6.28; P.add(k ? 'cloth_red' : 'paint_white', T(ball(0.022, 0.05, 0.012, 6, 4), Math.cos(a) * lean + Math.cos(b) * 0.04, top + 0.03, Math.sin(a) * lean + Math.sin(b) * 0.04).rotateY(0)); }
    else P.add('sod', lathe([[0.001, 0], [0.03, 0], [0.03, 0.025], [0.001, 0.03]], 8, null, Math.cos(a) * lean, top, Math.sin(a) * lean));
  }
}
/** A dish of fruit (peaches and oranges piled): a white dish on a foot. */
function fruit(P, seed = 1) {
  P.add('glaze_white', lathe([[0.001, 0], [0.06, 0], [0.065, 0.03], [0.16, 0.06], [0.17, 0.075], [0.15, 0.065], [0.001, 0.04]], 12));
  for (let k = 0; k < 7; k++) { const a = k * 2.4 + seed, r = k < 4 ? 0.075 : 0.03, up = k < 4 ? 0 : 0.055; P.add(k % 3 ? 'cloth_red' : 'cloth_ochre', T(ball(0.04, 0.036, 0.04, 8, 5), Math.cos(a) * r, 0.1 + up, Math.sin(a) * r)); }
}
/** A round kneeling cushion (putuan) of yellow silk, a mat under it. */
function cushion(P, r, seed) {
  const j = 0.9 + 0.2 * hash(seed, 1, 1);
  P.add('reed_mat', box(-r * 1.25, 0, -r * 1.15 * j, r * 1.25, 0.012, r * 1.15 * j));
  P.add('cloth_ochre', lathe([[0.001, 0.012], [r, 0.014], [r * 1.05, 0.045], [r * 0.95, 0.085], [r * 0.5, 0.105], [0.001, 0.108]], 14).scale(1, 1, j));
  P.add('cloth_red', lathe([[r * 0.35, 0.1], [r * 0.35, 0.112], [0.001, 0.115]], 8));
}

// ── the hall's large things ──────────────────────────────────────────────────
/** A drum on its stand (gu): a barrel of hide on lacquered staves, studded, between two posts on a base with a crossbar; 1.9 m high, facing +z. */
export function drum(P) {
  P.add('lacquer_chestnut', box(-0.75, 0, -0.45, 0.75, 0.1, 0.45));
  for (const s of [-1, 1]) { P.add('lacquer_red', box(s * 0.62 - 0.07, 0.1, -0.07, s * 0.62 + 0.07, 1.78, 0.07)); P.add('gilt_bronze', T(ball(0.1, 0.07, 0.1, 8, 5), s * 0.62, 1.82, 0)); P.add('lacquer_red', box(s * 0.62 - 0.1, 0.1, -0.35, s * 0.62 + 0.1, 0.18, 0.35)); }
  P.add('lacquer_red', box(-0.62, 0.38, -0.05, 0.62, 0.46, 0.05));
  P.add('lacquer_red', lathe([[0.001, -0.62], [0.55, -0.6], [0.66, -0.3], [0.7, 0], [0.66, 0.3], [0.55, 0.6], [0.001, 0.62]], 20).rotateZ(PI / 2).rotateX(PI / 2).translate(0, 1.0, 0));
  for (const z of [-1, 1]) { P.add('hide_tan', lathe([[0.001, 0], [0.58, 0], [0.6, 0.012], [0.58, 0.025], [0.001, 0.025]], 22).rotateX(z * PI / 2).translate(0, 1.0, z * 0.63)); }
  for (const z of [-1, 1]) for (let k = 0; k < 24; k++) { const a = k / 24 * 6.28; P.add('gilt_bronze', T(ball(0.02, 0.02, 0.012, 5, 3), Math.cos(a) * 0.58, 1.0 + Math.sin(a) * 0.58, z * 0.636)); }
  P.add('iron', limb([0.5, 0.52, 0.3], [0.52, 0.52, 0.5], 0.01, 0.01, 4));      // a stick
}
/** A bronze bell hung in its frame (zhong): two posts and a beam, the bell with its dragon loop, bands and bosses, a striking log on chains; 2.1 m, facing +z. */
export function bell(P) {
  for (const s of [-1, 1]) { P.add('lacquer_red', box(s * 0.7 - 0.08, 0, -0.08, s * 0.7 + 0.08, 2.1, 0.08)); P.add('lacquer_red', box(s * 0.7 - 0.12, 0, -0.4, s * 0.7 + 0.12, 0.12, 0.4)); P.add('lacquer_red', limb([s * 0.7, 0.4, 0.3], [s * 0.7, 1.4, 0.05], 0.045, 0.04, 5)); }
  P.add('lacquer_red', box(-0.82, 1.98, -0.1, 0.82, 2.1, 0.1));
  P.add('iron', limb([0, 1.98, 0], [0, 1.75, 0], 0.02, 0.02, 5));
  P.add('bronze', lathe([[0.001, 1.74], [0.07, 1.74], [0.1, 1.68], [0.3, 1.62], [0.33, 1.2], [0.37, 0.88], [0.4, 0.72], [0.38, 0.7], [0.31, 0.74], [0.28, 1.0], [0.001, 1.0]], 16));
  for (const y of [0.78, 1.15, 1.5]) P.add('bronze', lathe([[0.3 + (1.5 - y) * 0.06 - 0.02, y], [0.34 + (1.5 - y) * 0.06 + 0.03, y], [0.34 + (1.5 - y) * 0.06 + 0.03, y + 0.045], [0.3 + (1.5 - y) * 0.06 - 0.02, y + 0.045]], 16));
  for (let k = 0; k < 9; k++) { const a = k / 9 * 6.28; P.add('bronze', T(ball(0.035, 0.035, 0.035, 6, 4), Math.cos(a) * 0.34, 1.38, Math.sin(a) * 0.34)); }
  P.add('timber', limb([-0.5, 0.58, 0.9], [0.5, 0.58, 0.9], 0.07, 0.07, 6));
  for (const s of [-1, 1]) P.add('iron', limb([s * 0.4, 1.98, 0.1], [s * 0.4, 0.62, 0.9], 0.008, 0.008, 3));
}
/** The altar tables: a long table (qiaotou'an) w wide with its offerings: the censer in the middle, a candlestick and a vase either side, a dish of fruit; the five offerings. */
function altarTable(P, w, seed, five = true) {
  put(P, (Q) => {
    const h = 0.95; Q.add('lacquer_red', box(-w / 2, h - 0.06, -0.3, w / 2, h, 0.3));
    for (const s of [-1, 1]) {
      Q.add('lacquer_red', lathe([[0.001, 0], [0.045, 0], [0.045, 0.6], [0.001, 0.6]], 8).rotateX(PI / 2).translate(s * (w / 2 + 0.04), h + 0.05, -0.3));
      Q.add('lacquer_red', box(s * w / 2 - (s > 0 ? 0.12 : 0), h, -0.3, s * w / 2 + (s < 0 ? 0.12 : 0), h + 0.08, 0.3));
      const lx = s * (w / 2 - 0.2);
      for (const z of [-1, 1]) Q.add('lacquer_red', lathe([[0.04, 0], [0.032, h - 0.06], [0.001, h - 0.06]], 8, null, lx, 0, z * 0.24));
      Q.add('lacquer_red', box(lx - 0.018, 0.12, -0.26, lx + 0.018, h - 0.1, 0.26));
      Q.add('gilt_bronze', box(lx - 0.02, 0.2, -0.2, lx + 0.02, h - 0.2, 0.2));
    }
    Q.add('gilt_bronze', box(-w / 2 + 0.2, h - 0.1, 0.285, w / 2 - 0.2, h - 0.06, 0.295));
    Q.add('cloth_red', box(-w / 2 + 0.3, h - 0.9, 0.3, w / 2 - 0.3, h - 0.06, 0.312));                           // the altar cloth hung at the front
    Q.add('gilt_bronze', box(-w / 2 + 0.3, h - 0.9, 0.31, w / 2 - 0.3, h - 0.87, 0.318));
    for (let i = 0; i < 6; i++) Q.add('gilt_bronze', T(ball(0.04, 0.05, 0.012, 6, 4), (i - 2.5) * (w - 0.9) / 5, h - 0.45, 0.32));
    if (five) {
      put(Q, (R) => censer(R, 1), 0, h, 0);
      for (const s of [-1, 1]) { put(Q, (R) => candlestick(R, 0.42), s * 0.52, h, 0); put(Q, (R) => vase(R, 0.46, seed + s), s * 0.92, h, 0); }
      if (w > 2.4) for (const s of [-1, 1]) put(Q, (R) => fruit(R, seed + s * 3), s * 1.28, h, 0.02);
    } else put(Q, (R) => censer(R, 0.8), 0, h, 0);
  }, 0, 0, 0);
}
/** A hanging banner (fan): long cloth between two end rods, a border, a gilt top plate with a pendant, a tassel; w wide, L long, hanging from its top at y = 0 down. */
function banner(P, w, L, seed) {
  const cl = hash(seed, 1, 1) < 0.5 ? 'cloth_ochre' : 'cloth_red', bd = cl === 'cloth_ochre' ? 'cloth_red' : 'cloth_ochre', sw = (hash(seed, 2, 2) - 0.5) * 0.012;
  P.add('gilt_bronze', box(-w / 2 - 0.05, -0.12, -0.03, w / 2 + 0.05, 0, 0.03));
  P.add('gilt_bronze', T(ball(0.07, 0.09, 0.03, 6, 4), 0, 0.07, 0));
  P.add(cl, box(-w / 2, -L + 0.2, -0.006 + sw, w / 2, -0.12, 0.006 + sw));
  for (const s of [-1, 1]) P.add(bd, box(s * (w / 2 - 0.04) - 0.04, -L + 0.2, -0.008 + sw, s * (w / 2 - 0.04) + 0.04, -0.12, 0.008 + sw));
  for (const y of [-0.34, -0.6]) P.add('gilt_bronze', box(-w / 2 + 0.06, y, -0.009 + sw, w / 2 - 0.06, y + 0.025, 0.009 + sw));
  P.add('gilt_bronze', box(-w / 2 - 0.03, -L + 0.2, -0.02, w / 2 + 0.03, -L + 0.24, 0.02));
  for (let k = 0; k < 5; k++) P.add(bd, limb([(k - 2) * w / 5, -L + 0.2, 0], [(k - 2) * w / 5 * 1.1, -L - 0.12, 0], 0.01, 0.006, 3));
  P.add('gilt_bronze', T(ball(0.035, 0.035, 0.035, 6, 4), 0, -L - 0.14, 0));
}
/** The canopy over the altar (baozhang): a coffered ceiling lowered over the three images, edged with a gilt frieze and a valance of yellow silk with tassels. */
function canopy(P, x0, z0, x1, z1, y) {
  const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  P.add('lacquer_red', box(x0, y, z0, x1, y + 0.14, z1));
  const nx = Math.round(w / 1.0), nz = Math.round(d / 1.0);
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    const a = x0 + (i + 0.5) * w / nx, b = z0 + (j + 0.5) * d / nz, ww = w / nx / 2 - 0.06, dd = d / nz / 2 - 0.06;
    P.add('paint_caihua', box(a - ww, y - 0.018, b - dd, a + ww, y, b + dd));
    P.add('gilt_bronze', T(ball(0.1, 0.012, 0.1, 8, 3), a, y - 0.02, b));
  }
  for (const [ax, az, bx, bz] of [[x0, z0, x1, z0], [x0, z1, x1, z1], [x0, z0, x0, z1], [x1, z0, x1, z1]]) {
    P.add('gilt_bronze', box(Math.min(ax, bx) - 0.04, y - 0.1, Math.min(az, bz) - 0.04, Math.max(ax, bx) + 0.04, y + 0.02, Math.max(az, bz) + 0.04));
  }
  // the valance along the front and the two ends: scalloped drops of silk, each with a tassel
  const drops = (ax, az, bx, bz, nrm) => {
    const L = Math.hypot(bx - ax, bz - az), n = Math.round(L / 0.55);
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n, x = ax + (bx - ax) * t, z = az + (bz - az) * t, wd = L / n / 2 - 0.01, along = [Math.abs(bx - ax) > 0.01 ? 1 : 0, Math.abs(bz - az) > 0.01 ? 1 : 0];
      P.add(k % 2 ? 'cloth_ochre' : 'cloth_red', box(x - along[0] * wd, y - 0.62 + 0.04 * (k % 3), z - along[1] * wd, x + along[0] * wd + (along[1] ? 0.012 : 0), y - 0.1, z + along[1] * wd + (along[0] ? 0.012 : 0)).translate(nrm[0] * 0.03, 0, nrm[1] * 0.03));
      P.add('gilt_bronze', T(ball(0.03, 0.05, 0.03, 6, 4), x + nrm[0] * 0.04, y - 0.68 + 0.04 * (k % 3), z + nrm[1] * 0.04));
    }
  };
  drops(x0, z1, x1, z1, [0, 1]); drops(x0, z0, x0, z1, [-1, 0]); drops(x1, z0, x1, z1, [1, 0]);
  void cx; void cz;
}
/** A dais for arhats: a low platform of timber with a panelled front, facing +x (west wall) — built along z from 0 to L, 1.3 m deep. */
function lohanDais(P, L, h) {
  P.add('lacquer_chestnut', box(0, 0, 0, 1.3, h, L));
  P.add('lacquer_red', box(1.3, 0.05, -0.02, 1.34, h - 0.04, L + 0.02));
  P.add('gilt_bronze', box(1.3, h - 0.05, -0.03, 1.36, h - 0.02, L + 0.03));
  P.add('gilt_bronze', box(1.3, 0.03, -0.03, 1.36, 0.06, L + 0.03));
}

// ── the main hall ────────────────────────────────────────────────────────────
/**
 * temple_main_in { rect, y (the floor), cx }: the main hall's inside. A dais of three tiers along the north wall with the three Buddhas on lotus thrones
 * (Sakyamuni between Amitabha and the Medicine Buddha) and the disciples Ananda and Kasyapa by the middle one; before it three altar tables with the
 * five offerings; a coffered canopy hung over the dais, banners from the beams; eighteen arhats on daises along the side walls; the drum and the bell
 * by the door; cushions in rows on a carpet; monks kneeling and a worshipper at their acts.
 */
export function templeMainIn(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y, cx = (x0 + x1) / 2, P = new Parts();
  const fl = y + 0.012, dH = 0.85, dy = y + dH;
  // the dais: three tiers of mouldings (a sumeru base), its top in red, the front's lotus panel
  const dz1 = z0 + 4.2, dx = 9.3;
  sumeru(P, 'granite_grey', cx - dx, z0 + 0.2, cx + dx, dz1, dH, y);
  P.add('lacquer_red', box(cx - dx + 0.14, dy - 0.01, z0 + 0.34, cx + dx - 0.14, dy + 0.02, dz1 - 0.14));
  col.rect([cx - dx, z0 + 0.2, cx + dx, dz1], y, dy + 0.1);
  // the three Buddhas on lotus thrones, their faces to the door (south)
  const zb = z0 + 2.15;
  const BU = [[0, 1.9, 'earth', 'clay_robe'], [-5.4, 1.65, 'dhyana', 'cloth_red'], [5.4, 1.65, 'medicine', 'clay_robe']];
  for (const [ox, k, mud, robe] of BU) stat(P, (F, o) => { buddha(F, o); throne(F, 0.62, 0.6, 0); }, cx + ox, dy + 0.012 + 0.6 * k, zb, 0, k, { mudra: mud, robe, lod: 0 });
  // the disciples, either side of the middle image, a little forward
  stat(P, disciple, cx - 3.0, dy, zb + 0.9, 0, 1.0, { age: 0.15, outer: 'cloth_red', ph: 1 });
  stat(P, disciple, cx + 3.0, dy, zb + 0.9, 0, 1.02, { age: 0.9, outer: 'cloth_ochre', ph: 2 });
  // the altar tables before the dais (the five offerings before the middle image, a censer each before the others)
  put(P, (Q) => altarTable(Q, 3.2, 3, true), cx, fl, dz1 + 0.75);
  for (const s of [-1, 1]) put(P, (Q) => altarTable(Q, 1.6, 7 + s, false), cx + s * 5.4, fl, dz1 + 0.75);
  col.rect([cx - 1.75, dz1 + 0.4, cx + 1.75, dz1 + 1.1], y, y + 1.0);
  for (const s of [-1, 1]) col.rect([cx + s * 5.4 - 0.95, dz1 + 0.4, cx + s * 5.4 + 0.95, dz1 + 1.1], y, y + 1.0);
  // the canopy over the dais, and a deep valance; the banners from the beams, in two rows
  const top = y + (el.H ?? 7.2);
  canopy(P, cx - dx + 0.6, z0 + 0.5, cx + dx - 0.6, dz1 + 0.3, top - 1.55);
  for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) {
    const bx = cx + (i - 2.5) * 3.1 + (r ? 0.3 : -0.3), bz = dz1 + 1.9 + r * 2.4, w = 0.5 + 0.06 * hash(bx, bz, 1), L = 3.7 + 0.5 * hash(bx, bz, 2);
    put(P, (Q) => banner(Q, w, L, Math.round(bx * 10 + bz)), bx, top - 0.62, bz, (hash(bx, bz, 3) - 0.5) * 0.06);
  }
  // the arhats: eighteen on daises along the side walls, nine each, facing across; the pose and the dress by the place
  const lz0 = z0 + 0.5, pitch = 0.79, nl = 9;
  for (const side of [-1, 1]) {
    const L = nl * pitch + 0.2, xe = side < 0 ? x0 + 0.16 : x1 - 0.16;
    put(P, (Q) => lohanDais(Q, L, 0.42), xe, y, side < 0 ? lz0 - 0.1 : lz0 - 0.1 + L, side < 0 ? 0 : PI);
    for (let i = 0; i < nl; i++) {
      const lx = xe - side * 0.65, lz = lz0 + (i + 0.5) * pitch;
      stat(P, lohan, lx, y + 0.42, lz, side < 0 ? PI / 2 : -PI / 2, 1.22, { v: (i + (side > 0 ? 3 : 0)) % 8, seed: i * 2 + (side > 0 ? 41 : 7), lod: 1 });
    }
    col.rect([side < 0 ? x0 : x1 - 1.55, lz0 - 0.1, side < 0 ? x0 + 1.55 : x1, lz0 + nl * pitch + 0.1], y, y + 1.9);
  }
  // the drum and the bell by the door, west and east
  const zd = z1 - 1.0;
  put(P, drum, x0 + 1.15, fl, zd - 0.0, PI / 2); put(P, bell, x1 - 1.15, fl, zd - 0.0, -PI / 2);
  col.rect([x0 + 0.5, zd - 0.8, x0 + 1.9, zd + 0.8], y, y + 1.9); col.rect([x1 - 1.9, zd - 0.8, x1 - 0.5, zd + 0.8], y, y + 1.9);
  // the carpet strip before the altar and two rows of cushions
  P.add('cloth_maroon', box(cx - 4.8, fl, dz1 + 1.5, cx + 4.8, fl + 0.012, dz1 + 4.6));
  for (const sx of [-1, 1]) P.add('cloth_ochre', box(cx + sx * 4.8 - 0.03, fl, dz1 + 1.5, cx + sx * 4.8 + 0.03, fl + 0.016, dz1 + 4.6));
  const rows = [dz1 + 2.2, dz1 + 3.5];
  for (const [ri, rz] of rows.entries()) for (let i = 0; i < 7; i++) {
    const rx = cx + (i - 3) * 1.25 + (ri ? 0.2 : 0);
    put(P, (Q) => cushion(Q, 0.26, Math.round(rx * 7 + rz)), rx, fl + 0.012, rz, (hash(rx, rz, 4) - 0.5) * 0.1);
  }
  put(P, (Q) => cushion(Q, 0.3, 91), cx, fl + 0.012, dz1 + 1.75);
  // a bowl-gong and a wooden fish by the abbot's cushion
  put(P, (Q) => {
    Q.add('lacquer_red', lathe([[0.001, 0], [0.09, 0], [0.1, 0.02], [0.001, 0.02]], 10));
    Q.add('bronze', lathe([[0.001, 0.02], [0.1, 0.04], [0.14, 0.1], [0.15, 0.14], [0.13, 0.14], [0.12, 0.1], [0.001, 0.07]], 12));
    Q.add('lacquer_red', T(ball(0.14, 0.11, 0.1, 10, 6), 0.45, 0.11, 0)); Q.add('lacquer_black', box(0.34, 0.1, -0.01, 0.4, 0.115, 0.01));
  }, cx + 1.2, fl + 0.012, dz1 + 1.9);
  P.emit(bag);
  // the people: an abbot and three monks kneeling before the altar, a lay worshipper and a woman nearer the door
  const nm = (id, x, z, o = {}) => figure({ at: [x, z], y: fl, rot: 0, seed: id, dress: 'robe', cloth: 'cloth_grey', cloth2: 'cloth_ochre', skin: 'skin_light', hair: 'shaven', over: 'cloak', pose: 'kneel', arms: 'pray', hairMat: 'hair_dark', ...o }, ctx);
  nm(1811, cx, dz1 + 1.75, { cloth: 'cloth_ochre', cloth2: 'cloth_red' });
  nm(1812, cx - 1.25 * 1, rows[0] + 0.0, {}); nm(1813, cx + 1.25 * 1 + 0.0, rows[0], {}); nm(1814, cx + 2.5, rows[0], {});
  nm(1815, cx - 1.25 * 2, rows[1] + 0.0, { cloth: 'cloth_brown', hair: 'netknot', hat: 'none' });
  nm(1816, cx + 1.25 * 3 + 0.2, rows[1], { cloth: 'cloth_indigo', hair: 'netknot', woman: true });
  for (const [xx, zz] of [[cx, dz1 + 1.75], [cx - 1.25, rows[0]], [cx + 1.25, rows[0]], [cx + 2.5, rows[0]], [cx - 2.5, rows[1] + 0.0], [cx + 3.95, rows[1]]]) col.circle(xx, zz, 0.3, y, y + 1.1);
}

// ── the side halls ───────────────────────────────────────────────────────────
/** A shelf of compartments (a sutra cabinet) w wide, H high, 0.42 deep, open toward +z (turned by the caller); bundles of sutra in the compartments. */
function sutraCabinet(P, w, H, seed) {
  const tiers = Math.max(3, Math.round(H / 0.4)), th = (H - 0.12) / tiers, cols = Math.max(2, Math.round(w / 0.45)), cw = w / cols;
  P.add('lacquer_chestnut', box(-w / 2, 0, -0.21, w / 2, 0.12, 0.21));
  P.add('lacquer_chestnut', box(-w / 2, 0.12, -0.21, w / 2, H, -0.18));
  for (let i = 0; i <= cols; i++) P.add('lacquer_chestnut', box(-w / 2 + i * cw - 0.014, 0.12, -0.21, -w / 2 + i * cw + 0.014, H, 0.2));
  for (let j = 0; j <= tiers; j++) P.add('lacquer_chestnut', box(-w / 2, 0.12 + j * th - 0.014, -0.21, w / 2, 0.12 + j * th + 0.014, 0.2));
  const cl = ['cloth_ochre', 'cloth_indigo', 'cloth_red', 'paint_white', 'cloth_ochre', 'cloth_brown'];
  for (let j = 0; j < tiers; j++) for (let i = 0; i < cols; i++) {
    const n = 2 + Math.floor(hash(seed, i, j) * 3), x0 = -w / 2 + i * cw + 0.03;
    if (hash(seed, i, j + 9) < 0.12) continue;
    for (let b = 0; b < n; b++) {
      const bw = (cw - 0.07) / n, hh = th * (0.55 + 0.35 * hash(seed + b, i, j)), z1 = 0.17 - 0.03 * hash(seed, b, i + j);
      P.add(cl[Math.floor(hash(seed + 5, i + b, j) * cl.length)], box(x0 + b * bw + 0.004, 0.12 + j * th + 0.016, -0.12, x0 + (b + 1) * bw - 0.004, 0.12 + j * th + 0.016 + hh, z1));
      P.add('paint_white', box(x0 + b * bw + bw * 0.3, 0.12 + j * th + 0.016 + hh * 0.5, z1, x0 + b * bw + bw * 0.7, 0.12 + j * th + 0.016 + hh * 0.9, z1 + 0.004));
    }
  }
}
/** The revolving sutra case (zhuanlunzang): an octagonal case of red lacquer turning on a post, drawers with brass pulls, gilt bands and a tiled cap; r wide, H high. */
function revolvingCase(P, r, H) {
  P.add('granite_grey', lathe([[0.001, 0], [r * 1.15, 0], [r * 1.1, 0.12], [0.001, 0.14]], 8, null));
  P.add('lacquer_red', lathe([[0.001, 0.4], [r, 0.4], [r * 0.97, H - 0.35], [r * 1.05, H - 0.3], [r * 1.05, H - 0.2], [0.001, H - 0.2]], 8).rotateY(PI / 8));
  for (const y of [0.55, H * 0.5, H - 0.55]) P.add('gilt_bronze', lathe([[r * 1.0, y], [r * 1.045, y], [r * 1.045, y + 0.05], [r * 1.0, y + 0.05]], 8).rotateY(PI / 8));
  for (let k = 0; k < 8; k++) for (let row = 0; row < 3; row++) {
    const a = k / 8 * 2 * PI, ca = Math.cos(a), sa = Math.sin(a), y = 0.75 + row * ((H - 1.6) / 2.4);
    P.add('lacquer_chestnut', box(-0.17, 0, 0, 0.17, 0.2, 0.035).rotateY(0).translate(0, y, r * 0.93).rotateY(a));
    P.add('gilt_bronze', T(ball(0.022, 0.022, 0.014, 6, 3), 0, y + 0.1, r * 0.93 + 0.04).rotateY(a));
    void ca; void sa;
  }
  P.add('tile_dark', lathe([[0.001, H + 0.5], [r * 0.4, H + 0.15], [r * 1.3, H - 0.2], [r * 1.3, H - 0.26], [0.001, H - 0.26]], 8).rotateY(PI / 8));
  P.add('gilt_bronze', lathe([[0.001, H + 0.5], [0.05, H + 0.5], [0.04, H + 0.66], [0.001, H + 0.76]], 8));
}
/** temple_sutra_in { rect, y, H }: the sutra store: cabinets of sutra bundles along the west and north walls, a revolving case, two reading desks with a monk at one. */
export function templeSutraIn(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y, fl = y + 0.012, P = new Parts();
  const wallW = x0 + 0.34, wallN = z0 + 0.36, nW = 7, nN = 3;
  for (let i = 0; i < nW; i++) { const w = (z1 - z0 - 0.8) / nW; put(P, (Q) => sutraCabinet(Q, w - 0.02, 2.6, 17 + i), wallW, fl, z0 + 0.4 + (i + 0.5) * w, PI / 2); }
  for (let i = 0; i < nN; i++) { const w = (x1 - x0 - 1.9) / nN; put(P, (Q) => sutraCabinet(Q, w - 0.02, 2.6, 31 + i), x0 + 0.95 + 0.3 + (i + 0.5) * w, fl, wallN, 0); }
  col.rect([x0 + 0.14, z0 + 0.14, x0 + 0.62, z1 - 0.14], y, y + 2.7); col.rect([x0 + 0.62, z0 + 0.14, x1 - 0.14, z0 + 0.6], y, y + 2.7);
  // the revolving case at the middle, its post running up to the beam
  const rcx = (x0 + x1) / 2 - 0.4, rcz = (z0 + z1) / 2 - 0.5;
  put(P, (Q) => revolvingCase(Q, 0.85, 2.0), rcx, fl, rcz, 0.2);
  P.add('lacquer_red', lathe([[0.07, 0], [0.07, (el.H ?? 4.4) - 2.4]], 8, null, rcx, fl + 2.7, rcz));
  col.circle(rcx, rcz, 1.0, y, y + 2.8);
  // reading desks: a long low table with an open sutra, a brush rest and an inkstone, a bench
  for (const [dx, dz, yaw, seed] of [[x1 - 2.2, z0 + 1.9, 0, 4], [x1 - 2.2, z1 - 4.0, PI, 5]]) {
    put(P, (Q) => {
      const h = 0.78; Q.add('lacquer_chestnut', box(-0.9, h - 0.05, -0.4, 0.9, h, 0.4));
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) Q.add('lacquer_chestnut', lathe([[0.03, 0], [0.025, h - 0.05], [0.001, h - 0.05]], 8, null, sx * 0.82, 0, sz * 0.32));
      Q.add('paint_white', box(-0.34, h, -0.2, 0.0, h + 0.012, 0.2)); Q.add('paint_white', box(0.0, h, -0.2, 0.34, h + 0.012, 0.2));
      for (let l = 0; l < 7; l++) Q.add('lacquer_black', box(-0.3 + l * 0.085, h + 0.012, -0.17, -0.3 + l * 0.085 + 0.008, h + 0.0125, 0.17));
      Q.add('lacquer_black', box(0.46, h, -0.06, 0.64, h + 0.03, 0.06)); Q.add('lacquer_red', limb([0.5, h + 0.07, 0.25], [0.72, h + 0.025, 0.28], 0.007, 0.007, 4));
      Q.add('lacquer_chestnut', box(-0.9, 0.0, 0.62, 0.9, 0.44, 0.9).translate(0, 0, 0)); Q.add('lacquer_chestnut', box(-0.9, 0.4, 0.6, 0.9, 0.46, 0.92));
      void seed;
    }, dx, fl, dz + (yaw ? 0 : 0), yaw);
    col.rect([dx - 0.95, dz - 0.45, dx + 0.95, dz + 0.95], y, y + 0.9);
  }
  P.emit(bag);
  figure({ at: [x1 - 2.2, z0 + 2.9 + 0.12], y: fl, rot: 0, seed: 2201, dress: 'robe', cloth: 'cloth_grey', cloth2: 'cloth_ochre', skin: 'skin_light', hair: 'shaven', pose: 'sit', hairMat: 'hair_dark' }, ctx);
  figure({ at: [x1 - 2.2, z1 - 5.0], y: fl, rot: PI, seed: 2202, dress: 'robe', cloth: 'cloth_brown', cloth2: 'cloth_ochre', skin: 'skin_medium', hair: 'shaven', pose: 'sit', hairMat: 'hair_dark' }, ctx);
}

/** temple_refectory_in { rect, y, H }: the monks' dining hall: two long tables with benches and bowls, a serving table with the rice tub, a brick stove with two woks and a chimney, shelves of bowls and pickle jars, the wooden fish at the door; monks eating. */
export function templeRefectoryIn(el, ctx) {
  const { bag, col } = ctx, [x0, z0, x1, z1] = el.rect, y = el.y, fl = y + 0.012, P = new Parts(), H = el.H ?? 4.4;
  const tbl = (Q, L) => {
    Q.add('lacquer_chestnut', box(-0.4, 0.73, -L / 2, 0.4, 0.78, L / 2));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) Q.add('lacquer_chestnut', lathe([[0.03, 0], [0.025, 0.73], [0.001, 0.73]], 8, null, sx * 0.34, 0, sz * (L / 2 - 0.1)));
    Q.add('lacquer_chestnut', box(-0.34, 0.2, -L / 2 + 0.1, 0.34, 0.23, L / 2 - 0.1));
    for (let i = 0; i < Math.floor(L / 0.9); i++) for (const sx of [-1, 1]) {
      const z = -L / 2 + 0.45 + i * 0.9, j = hash(sx, i, L);
      Q.add('glaze_white', lathe([[0.001, 0], [0.04, 0], [0.065, 0.04], [0.075, 0.075], [0.07, 0.075], [0.06, 0.045], [0.001, 0.015]], 10, null, sx * 0.22, 0.78, z));
      Q.add('lacquer_black', limb([sx * 0.3, 0.784, z - 0.09 + j * 0.02], [sx * 0.3, 0.784, z + 0.11], 0.004, 0.004, 3));
      Q.add('lacquer_black', limb([sx * 0.3 + 0.014, 0.784, z - 0.09], [sx * 0.3 + 0.014, 0.784, z + 0.11 - j * 0.01], 0.004, 0.004, 3));
    }
    for (const sx of [-1, 1]) { Q.add('lacquer_chestnut', box(sx * 0.82 - 0.14, 0.4, -L / 2 + 0.1, sx * 0.82 + 0.14, 0.45, L / 2 - 0.1)); for (const sz of [-1, 1]) Q.add('lacquer_chestnut', box(sx * 0.82 - 0.12, 0, sz * (L / 2 - 0.2) - 0.03, sx * 0.82 + 0.12, 0.4, sz * (L / 2 - 0.2) + 0.03)); }
  };
  const tx = [x0 + 3.1, x0 + 6.1], tz = (z0 + z1) / 2 + 0.2, L = 5.2;
  for (const x of tx) { put(P, (Q) => tbl(Q, L), x, fl, tz, 0); col.rect([x - 1.0, tz - L / 2, x + 1.0, tz + L / 2], y, y + 0.85); }
  // the serving table by the north wall with the rice tub, a tea kettle and a stack of bowls
  put(P, (Q) => {
    Q.add('lacquer_chestnut', box(-1.1, 0.8, -0.35, 1.1, 0.85, 0.35));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) Q.add('lacquer_chestnut', lathe([[0.04, 0], [0.032, 0.8], [0.001, 0.8]], 8, null, sx * 1.0, 0, sz * 0.28));
    Q.add('timber', lathe([[0.001, 0.85], [0.3, 0.85], [0.33, 0.9], [0.34, 1.2], [0.31, 1.22], [0.001, 1.22]], 14, null, -0.5, 0, 0));
    for (const yy of [0.95, 1.1]) Q.add('iron', lathe([[0.335, yy], [0.352, yy], [0.352, yy + 0.025], [0.335, yy + 0.025]], 14, null, -0.5, 0, 0));
    Q.add('timber', lathe([[0.001, 1.22], [0.28, 1.22], [0.3, 1.25], [0.001, 1.26]], 14, null, -0.5, 0, 0));
    Q.add('bronze', lathe([[0.001, 0.85], [0.13, 0.85], [0.16, 0.95], [0.12, 1.08], [0.06, 1.1], [0.001, 1.1]], 10, null, 0.2, 0, 0.0));
    for (let i = 0; i < 6; i++) Q.add('glaze_white', lathe([[0.001, 0], [0.04, 0], [0.065, 0.03], [0.075, 0.06], [0.001, 0.02]], 10, null, 0.7 + (i % 2) * 0.01, 0.85 + i * 0.045, 0.0));
  }, (x0 + x1) / 2 + 0.6, fl, z0 + 0.6, 0);
  col.rect([(x0 + x1) / 2 - 0.6, z0 + 0.2, (x0 + x1) / 2 + 1.8, z0 + 1.0], y, y + 1.3);
  // the stove: a brick range in the north-east corner with two woks under wooden lids and the chimney; stacked firewood beside
  const sx0 = x1 - 2.8, sz0 = z0 + 0.2;
  P.add('brick_grey', box(sx0, fl, sz0, x1 - 0.2, fl + 0.95, sz0 + 1.3));
  P.add('granite_grey', box(sx0 - 0.04, fl + 0.95, sz0 - 0.04, x1 - 0.16, fl + 1.0, sz0 + 1.34));
  P.add('iron', lathe([[0.001, 0], [0.2, 0.015], [0.4, 0.1], [0.46, 0.16], [0.44, 0.16], [0.001, 0.02]], 14, null, sx0 + 0.7, fl + 0.95, sz0 + 0.65));
  P.add('timber', lathe([[0.001, 0.22], [0.2, 0.17], [0.45, 0.14], [0.45, 0.16], [0.001, 0.24]], 14, null, sx0 + 1.9, fl + 0.95, sz0 + 0.65));
  P.add('brick_grey', box(x1 - 1.0, fl + 1.0, sz0 + 0.5, x1 - 0.4, (y + H - 0.2), sz0 + 1.1));
  P.add('tile_dark', box(x1 - 1.1, (y + H - 0.55), sz0 + 0.4, x1 - 0.3, (y + H - 0.2), sz0 + 1.2));
  P.add('iron', box(sx0 + 0.15, fl + 0.2, sz0 + 1.3, sx0 + 0.55, fl + 0.5, sz0 + 1.32));
  col.rect([sx0, sz0, x1 - 0.2, sz0 + 1.3], y, y + 3.5);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) P.add('timber', lathe([[0.001, 0], [0.07, 0], [0.07, 0.5], [0.001, 0.5]], 6).rotateZ(PI / 2).translate(-0.25 + c * 0.0, 0, 0).translate(x1 - 0.5 - c * 0.14 + 0.0, fl + 0.07 + r * 0.14, sz0 + 1.7 + 0.02 * hash(r, c, 2)));
  // shelves of bowls and jars along the west wall; a water vat
  for (let i = 0; i < 2; i++) {
    P.add('lacquer_chestnut', box(x0 + 0.16, fl + 1.1 + i * 0.7, z0 + 0.6, x0 + 0.5, fl + 1.14 + i * 0.7, z1 - 2.6));
    for (let b = 0; b < 12; b++) P.add(b % 3 ? 'glaze_white' : 'pottery_dark', lathe([[0.001, 0], [0.04, 0], [0.065, 0.03], [0.075, 0.06], [0.001, 0.02]], 9, null, x0 + 0.34, fl + 1.14 + i * 0.7 + (b % 4) * 0.045, z0 + 0.8 + Math.floor(b / 4) * 0.7 + (b % 4) * 0.0 + hash(b, i, 3) * 0.2));
  }
  col.rect([x0 + 0.14, z0 + 0.5, x0 + 0.55, z1 - 2.6], y + 1.1, y + 2.0);
  for (let k = 0; k < 4; k++) put(P, (Q) => Q.add('pottery_dark', lathe([[0.001, 0], [0.17, 0], [0.24, 0.2], [0.26, 0.42], [0.2, 0.55], [0.15, 0.58], [0.15, 0.62], [0.17, 0.64], [0.001, 0.64]], 10)), x0 + 0.5, fl, z1 - 2.2 + k * 0.5, 0);
  col.rect([x0 + 0.15, z1 - 2.5, x0 + 0.85, z1 - 0.15], y, y + 0.7);
  put(P, (Q) => {
    Q.add('pottery_dark', lathe([[0.001, 0], [0.36, 0], [0.5, 0.3], [0.52, 0.7], [0.45, 0.9], [0.4, 0.92], [0.4, 0.96], [0.001, 0.96]], 14));
    Q.add('water', lathe([[0.001, 0.86], [0.4, 0.86]], 14));
    Q.add('timber', lathe([[0.001, 0.0], [0.04, 0], [0.04, 0.5], [0.001, 0.5]], 6).rotateZ(1.2).translate(0.25, 0.95, 0));
  }, x1 - 0.9, fl, z1 - 0.9, 0);
  col.circle(x1 - 0.9, z1 - 0.9, 0.55, y, y + 1.0);
  // the wooden fish (bang) hung by the doorway from a beam, carved with scales
  put(P, (Q) => {
    Q.add('lacquer_red', T(ball(0.9, 0.34, 0.3, 14, 8), 0, 0, 0));
    for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) Q.add('gilt_bronze', T(ball(0.05, 0.05, 0.012, 6, 3), -0.5 + c * 0.14 + (r % 2) * 0.07, -0.15 + r * 0.1, 0.285 - Math.abs(r - 1.5) * 0.03));
    Q.add('lacquer_red', T(ball(0.2, 0.2, 0.28, 8, 6), 0.96, 0.05, 0));
    Q.add('lacquer_black', T(ball(0.04, 0.04, 0.02, 5, 3), 1.03, 0.1, 0.27));
    Q.add('lacquer_black', box(0.1, -0.02, -0.34, 0.5, 0.0, 0.34));
    for (const s of [-0.3, 0.5]) Q.add('iron', limb([s, 0.3, 0], [s * 0.7, 1.4, 0], 0.006, 0.006, 3));
  }, (x1 + x0) / 2 + 1.0, fl + y + H - 1.2 - fl + 0.0, z1 - 0.7, 0, 0.65);
  P.emit(bag);
  // monks at the meal
  const eat = (id, x, z, rot, o = {}) => figure({ at: [x, z], y: fl, rot, seed: id, dress: 'robe', cloth: 'cloth_grey', cloth2: 'cloth_ochre', skin: 'skin_light', hair: 'shaven', pose: 'sit', hairMat: 'hair_dark', ...o }, ctx);
  eat(2301, tx[0] - 0.82 - 0.2, tz - 1.4, PI / 2, {}); eat(2302, tx[0] + 0.82 + 0.2, tz + 0.5, -PI / 2, { cloth: 'cloth_brown' });
  eat(2303, tx[1] - 0.82 - 0.2, tz + 1.5, PI / 2, {}); eat(2304, tx[1] + 0.82 + 0.2, tz - 0.5, -PI / 2, { cloth: 'cloth_ochre', cloth2: 'cloth_red', skin: 'skin_medium' });
  eat(2305, (x0 + x1) / 2 + 0.6, z0 + 1.5, PI, { pose: 'stand', cloth: 'cloth_brown', carry: 'none' });
  col.circle(tx[0] - 1.0, tz - 1.4, 0.3, y, y + 1.2);
}

// ── the guardian kings at the gate ───────────────────────────────────────────
/**
 * temple_kings { gate: [x, z of the gate on the wall's line], y, w (the gate's width) }: inside the gate, along the wall's inner face, two open lean-to
 * porches (posts, a beam, a tiled slope from the wall) either side of the way, two kings of the four in each, on rocks, facing the court:
 * Chiguo (white, the lute) and Zengzhang (blue, the sword) on the east, Guangmu (red, the dragon) and Duowen (green, the umbrella) on the west.
 */
export function templeKings(el, ctx) {
  const { bag, col } = ctx, [cx, zg] = el.gate, y = el.y ?? 0.04, W = el.w ?? 3.2, P = new Parts(), zi = zg - 0.225, D = 2.4, hw = 4.2 + 0.0;
  const KINGS = [
    [1, 1.6, { skin: 'paint_white', arm: 'pipa', cloth: 'cloth_blue', ph: 0 }], [1, 4.6, { skin: 'paint_blue', arm: 'sword', cloth: 'clay_green', ph: 1 }],
    [-1, 1.6, { skin: 'clay_robe', arm: 'snake', cloth: 'cloth_ochre', ph: 2 }], [-1, 4.6, { skin: 'clay_green', arm: 'umbrella', cloth: 'cloth_red', ph: 3 }],
  ];
  for (const s of [-1, 1]) {
    const xa = cx + s * (W / 2 + 2.1), xb = cx + s * (W / 2 + 2.1 + 6.4), xl = Math.min(xa, xb), xr = Math.max(xa, xb);
    P.add('granite_block', box(xl, y, zi - D, xr, y + 0.16, zi));
    P.add('granite_grey', box(xl - 0.05, y + 0.16, zi - D - 0.05, xr + 0.05, y + 0.2, zi - D + 0.02));
    // the posts at the front and the ends, a beam, the slope of the roof
    const px = [xl + 0.3, (xl + xr) / 2, xr - 0.3];
    for (const x of px) { P.add('lacquer_red', lathe([[0.2, 0], [0.18, 3.2], [0.001, 3.2]], 8, null, x, y + 0.2, zi - D + 0.25)); P.add('granite_grey', lathe([[0.001, 0], [0.3, 0], [0.26, 0.22], [0.001, 0.22]], 8, null, x, y + 0.2, zi - D + 0.25)); col.circle(x, zi - D + 0.25, 0.22, y, y + 3.4); }
    P.add('lacquer_red', box(xl, y + 3.2, zi - D + 0.1, xr, y + 3.62, zi - D + 0.42));
    P.add('lacquer_chestnut', box(xl, y + 3.06, zi - D + 0.12, xr, y + 3.2, zi - D + 0.4));
    const t = [], u = [], hi = y + 4.55, lo = y + 3.7;
    const q = (a, b, c, d, out) => out.push(...a, ...b, ...c, ...a, ...c, ...d);
    q([xl - 0.2, hi, zi], [xr + 0.2, hi, zi], [xr + 0.2, lo, zi - D - 0.5], [xl - 0.2, lo, zi - D - 0.5], t);
    q([xl - 0.2, hi - 0.16, zi], [xl - 0.2, lo - 0.16, zi - D - 0.5], [xr + 0.2, lo - 0.16, zi - D - 0.5], [xr + 0.2, hi - 0.16, zi], u);
    P.add('tile_dark', fromTriangles(t)); P.add('timber', fromTriangles(u));
    P.add('tile_dark', box(xl - 0.2, lo - 0.1, zi - D - 0.55, xr + 0.2, lo + 0.03, zi - D - 0.4));
    for (let x = xl; x <= xr; x += 0.42) P.add('timber_red', limb([x, hi - 0.2, zi], [x, lo - 0.2, zi - D - 0.45], 0.04, 0.04, 4));   // the rafters
    col.rect([xl, zi - D, xr, zi - D + 0.5], y, y + 3.6);
  }
  for (const [s, off, o] of KINGS) {
    const x = cx + s * (W / 2 + 2.1 + off + 0.6), z = zi - 1.25;
    stat(P, king, x, y + 0.16, z, PI, 1.15, { ...o, lod: 0 });
    col.circle(x, z, 0.8, y, y + 2.6);
  }
  P.emit(bag);
}
