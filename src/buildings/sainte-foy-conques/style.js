// Sainte-Foy's own pieces, on top of the Romanesque style (src/styles/romanesque): the Majesty of Sainte Foy — the
// reliquary statue of the saint enthroned, gold over a core of yew, about 85 cm high — on its pedestal.
// docs/buildings/sainte-foy-conques.md §8.

import '../../styles/greek/index.js';
import '../../styles/byzantine/index.js';
import '../../styles/romanesque/index.js';
import { STYLES, registerStyle } from '../../core/build.js';
import { lathe, fromTriangles, box } from '../../core/geom.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';
import { hexa } from '../../styles/chinese/index.js';

/**
 * The Majesty { at, y, yaw (the way she faces; default −x, toward the choir) }: a pedestal of yellow limestone (moulded
 * base, round shaft, a cap); on it the throne of gilt silver — a box seat with a cushion, posts at the four corners
 * ending in knobs, a low back, bands of ornament along its rails — and the saint seated frontally, stiffly upright: the
 * gold robe falling over the knees to the feet on a footstool, the forearms held forward with the large hands open, the
 * oversized head with its staring blue eyes, a crown of gold with a band of stones; gems studding the robe. [stated:
 * tourisme-conques — the gold head from a late antique bust on the yew statue, the 10th-century crown, the large blue
 * eyes, the large hands, the gilt silver throne with its bands; the arms were refashioned in the 16th century and their
 * first position is unknown, the rock-crystal balls on the throne are Gothic, so neither is shown in their present form]
 */
function majesty(el, { bag, col }) {
  const [x, z] = el.at, y0 = el.y ?? 0, yaw = el.yaw ?? Math.PI;
  const c = Math.cos(yaw), s = Math.sin(yaw);
  // local frame: f forward (the way she faces), l to her left, up y
  const P = (f, l, y) => [x + f * c - l * s, y, z + f * s + l * c];
  const bx = (out, f0, f1, l0, l1, ya, yb) => hexa(out, [P(f0, l0, ya), P(f1, l0, ya), P(f1, l1, ya), P(f0, l1, ya)], [P(f0, l0, yb), P(f1, l0, yb), P(f1, l1, yb), P(f0, l1, yb)]);
  /** a tapered block: bottom f0…f1 × l0…l1 at ya, top ff0…ff1 × ll0…ll1 at yb */
  const tb = (out, [f0, f1, l0, l1], [ff0, ff1, ll0, ll1], ya, yb) => hexa(out, [P(f0, l0, ya), P(f1, l0, ya), P(f1, l1, ya), P(f0, l1, ya)], [P(ff0, ll0, yb), P(ff1, ll0, yb), P(ff1, ll1, yb), P(ff0, ll1, yb)]);
  // the pedestal
  const st = 'limestone_yellow', H = 1.25;
  bag.add(st, lathe([[0.42, 0], [0.42, 0.14], [0.36, 0.2], [0.34, 0.28], [0.26, 0.34], [0.24, H - 0.2], [0.3, H - 0.14], [0.36, H - 0.06], [0.36, H], [0.001, H]], 20, null, x, y0, z));
  col.circle(x, z, 0.42, y0, y0 + H + 0.9);
  const y = y0 + H, sil = [], gold = [], gem = [], blue = [];
  /** a lathe solid g scaled sf along her forward axis and sl sideways, laid (tilt about her left axis) and set at p, y */
  const round = (g, sf, sl, p, yy, tilt, yw) => { if (tilt) g.rotateZ(-tilt); g.scale(sf, 1, sl); g.rotateY(-yw); g.translate(p[0], yy, p[2]); bag.add('gold', g); };
  const rod2 = (r, L) => lathe([[0.001, 0], [r * 0.8, 0.01], [r, 0.03], [r, L], [0.001, L]], 12).translate(0, 0, 0);
  // the throne: footstool, seat, cushion, corner posts with knobs, back, ornamental bands
  bx(sil, 0.16, 0.34, -0.17, 0.17, y, y + 0.08);
  bx(sil, -0.19, 0.17, -0.2, 0.2, y, y + 0.36);
  bx(gold, -0.18, 0.16, -0.18, 0.18, y + 0.36, y + 0.4);
  for (const [f, l] of [[0.17, -0.2], [0.17, 0.2], [-0.19, -0.2], [-0.19, 0.2]]) {
    const tall = f < 0 ? 0.62 : 0.46, p = P(f, l, 0);
    bag.add('silver', lathe([[0.03, 0], [0.03, tall - 0.06], [0.04, tall - 0.04], [0.001, tall]], 8, null, p[0], y, p[2]));
    bag.add('gold', lathe([[0.001, 0], [0.035, 0.012], [0.042, 0.04], [0.03, 0.07], [0.001, 0.08]], 10, null, p[0], y + tall - 0.01, p[2]));
  }
  bx(sil, -0.21, -0.17, -0.18, 0.18, y + 0.36, y + 0.58);                   // the back
  for (const yy of [y + 0.05, y + 0.31]) bx(gold, 0.165, 0.185, -0.2, 0.2, yy, yy + 0.035);   // the bands on the front rail
  for (const sd of [-1, 1]) for (const yy of [y + 0.05, y + 0.31]) bx(gold, -0.18, 0.16, sd * 0.2 - 0.01, sd * 0.2 + 0.01, yy, yy + 0.035);
  // the saint: shins and feet, lap, torso, shoulders, forearms and hands, neck, head, crown
  const ys = y + 0.4;
  tb(gold, [0.16, 0.24, -0.12, 0.12], [0.14, 0.24, -0.13, 0.13], y + 0.08, ys - 0.02);          // the robe over the shins
  for (const sd of [-1, 1]) bx(gold, 0.18, 0.31, sd * 0.065 - 0.045, sd * 0.065 + 0.045, y + 0.08, y + 0.13);   // the feet
  bx(gold, -0.13, 0.2, -0.13, 0.13, ys - 0.04, ys + 0.06);                                      // the lap
  // the knees, rounded, the robe drawn over them
  for (const sd of [-1, 1]) round(rod2(0.056, 0.13), 1, 1, P(0.1, sd * 0.062, 0), ys - 0.02, Math.PI / 2, yaw);
  // the torso and shoulders: an elliptic body, straight and frontal
  round(lathe([[0.125, 0], [0.118, 0.12], [0.122, 0.22], [0.14, 0.285], [0.12, 0.315], [0.06, 0.33], [0.001, 0.335]], 18), 0.68, 1, P(-0.05, 0, 0), ys + 0.04, 0, yaw);
  for (const sd of [-1, 1]) {
    tb(gold, [-0.08, 0.0, sd * 0.11, sd * 0.155], [-0.06, 0.02, sd * 0.115, sd * 0.155], ys + 0.34, ys + 0.18);  // upper arm
    bx(gold, -0.03, 0.17, sd * 0.1, sd * 0.155, ys + 0.13, ys + 0.19);                            // forearm, held forward
    bx(gold, 0.17, 0.25, sd * 0.09, sd * 0.165, ys + 0.12, ys + 0.21);                             // the large hand
    bx(gold, 0.2, 0.23, sd * 0.06, sd * 0.09, ys + 0.18, ys + 0.22);                               // the thumb, raised
  }
  bag.add('gold', lathe([[0.045, 0], [0.04, 0.05]], 10, null, ...(() => { const p = P(-0.055, 0, 0); return [p[0], ys + 0.36, p[2]]; })()));
  // the head: large, the chin held high; the crown with its band of stones
  const hc = P(-0.05, 0, 0), yh = ys + 0.41;
  round(lathe([[0.001, 0], [0.04, 0.005], [0.07, 0.03], [0.088, 0.07], [0.094, 0.11], [0.09, 0.15], [0.075, 0.185], [0.04, 0.205], [0.001, 0.21]], 18), 0.92, 1, hc, yh, 0, yaw);
  bag.add('gold', lathe([[0.092, 0], [0.096, 0.05], [0.102, 0.068], [0.096, 0.072], [0.084, 0.03], [0.084, 0.0]], 14, null, hc[0], yh + 0.15, hc[2]));
  for (let k = 0; k < 12; k++) {
    const a = 2 * Math.PI * k / 12, q = [hc[0] + Math.cos(a) * 0.094, hc[2] + Math.sin(a) * 0.094];
    bag.add(k % 2 ? 'inlay_carnelian' : 'inlay_lapis', lathe([[0.001, 0], [0.012, 0.004], [0.012, 0.016], [0.001, 0.02]], 6, null, q[0], yh + 0.172, q[1]));
  }
  // the eyes: wide, of blue enamel; a straight nose
  for (const sd of [-1, 1]) bx(blue, 0.028, 0.041, sd * 0.032 - 0.016, sd * 0.032 + 0.016, yh + 0.1, yh + 0.122);
  tb(gold, [0.03, 0.05, -0.008, 0.008], [0.03, 0.068, -0.013, 0.013], yh + 0.1, yh + 0.055);
  // stones on the robe: down the front of the torso, round the hem
  for (let k = 0; k < 5; k++) bx(gem, 0.025, 0.04, -0.015, 0.015, ys + 0.1 + k * 0.045, ys + 0.125 + k * 0.045);
  for (let k = -3; k <= 3; k++) bx(gem, 0.235, 0.25, k * 0.035 - 0.012, k * 0.035 + 0.012, y + 0.16, y + 0.185);
  bag.add('silver', fromTriangles(sil));
  bag.add('gold', fromTriangles(gold));
  bag.add('inlay_carnelian', fromTriangles(gem));
  bag.add('inlay_lapis', fromTriangles(blue));
}

// ── the capitals (docs/settlements/conques.md §1c) ─────────────────────────────────────
/** Concatenate non-indexed geometries (position, normal) into one. */
function merge(gs) {
  const P = [], N = [];
  for (const g of gs) { P.push(...g.attributes.position.array); N.push(...g.attributes.normal.array); }
  const m = new BufferGeometry(); m.setAttribute('position', new Float32BufferAttribute(P, 3)); m.setAttribute('normal', new Float32BufferAttribute(N, 3)); return m;
}
/** A leaf of the capital's foliage at angle t round the bell (radius rb at its foot), rising h, its tip curling out by c. */
function leaf(t, rb, y0, h, w, c, fat = 0.35) {
  const g = lathe([[0.001, 0], [w * 0.8, h * 0.12], [w, h * 0.45], [w * 0.75, h * 0.8], [w * 0.3, h * 0.97], [0.001, h]], 6);
  g.scale(1, 1, fat); g.rotateX(c * 0.55);                       // flattened against the bell, its upper part leaning out (+z)
  g.translate(0, y0, rb); g.rotateY(-t + Math.PI / 2);
  return g;
}
/** A small seated or standing figure carved on a capital's face: robe, shoulders, head (all in the capital's stone). */
function capFigure(t, rb, y0, h) {
  const body = lathe([[0.001, 0], [h * 0.2, 0], [h * 0.19, h * 0.15], [h * 0.14, h * 0.55], [h * 0.12, h * 0.7], [h * 0.05, h * 0.74], [0.001, h * 0.75]], 8);
  const head = lathe([[0.001, 0], [h * 0.08, h * 0.03], [h * 0.1, h * 0.11], [h * 0.07, h * 0.2], [0.001, h * 0.22]], 8).translate(0, h * 0.74, 0);
  const g = merge([body, head]); g.scale(1, 1, 0.6); g.translate(0, y0, rb + h * 0.06); g.rotateY(-t + Math.PI / 2);
  return g;
}
const CAPS = new Map();
/**
 * A carved capital of Conques, built once per size and kind and moved into place (so that the renderer draws repeats as
 * instances): the astragal, the bell, the square abacus with its chamfer, and on the bell either foliage — a lower and an
 * upper tier of leaves with volutes curling at the corners under the abacus (`kind` 0–2, three patterns of leaf) — or
 * figures (`kind` 3–4): a carved figure in the middle of each face between leaves at the corners, the "picture books"
 * of the nave. [stated: 212 columns with decorated capitals, of palm leaves, symbols, biblical monsters and scenes;
 * inferred: the composition of each]
 */
function carvedCapital(r, h, kind) {
  const key = `${r.toFixed(3)}|${h.toFixed(3)}|${kind}`;
  if (CAPS.has(key)) return CAPS.get(key);
  const gs = [], sq = r * 1.35, ab = h * 0.18, yb = h - ab;
  gs.push(lathe([[r * 1.04, 0], [r * 1.1, h * 0.04], [r * 1.04, h * 0.09], [r, h * 0.1]], 14));                  // the astragal
  gs.push(lathe([[r * 0.98, h * 0.08], [r * 1.0, h * 0.4], [r * 1.12, yb * 0.85], [r * 1.25, yb], [0.001, yb]], 14));   // the bell
  // the abacus: a square slab, chamfered below
  gs.push(box(-sq, yb + ab * 0.35, -sq, sq, h, sq));
  gs.push(lathe([[r * 1.25, 0], [sq * 1.38, ab * 0.35]], 4).rotateY(Math.PI / 4).translate(0, yb, 0));
  const fig = kind >= 3, n = 8;
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n * Math.PI * 2, corner = i % 2 === 1;
    if (fig && !corner) continue;
    const lw = r * (kind === 1 ? 0.5 : 0.44);
    gs.push(leaf(t, r * 0.97, h * 0.08, yb * (kind === 2 ? 0.48 : 0.42), lw, kind === 2 ? 0.5 : 0.35));
  }
  for (let i = 0; i < 4; i++) {
    const t = i / 4 * Math.PI * 2 + Math.PI / 4;
    // the upper tier at the corners rising to the volutes; between them (foliage) a smaller leaf or (figures) the figure
    gs.push(leaf(t, r * 1.0, yb * 0.3, yb * 0.62, r * 0.46, 0.55, 0.4));
    const vol = lathe([[0.001, -r * 0.09], [r * 0.12, -r * 0.08], [r * 0.15, 0], [r * 0.12, r * 0.08], [0.001, r * 0.09]], 8).rotateZ(Math.PI / 2);
    vol.scale(1.5, 1.5, 1.5); vol.translate(0, yb * 0.88, r * 1.24); vol.rotateY(-t + Math.PI / 2); gs.push(vol);
    const tm = t + Math.PI / 4;
    if (fig) gs.push(capFigure(tm, r * 1.0, h * 0.1, yb * (kind === 3 ? 0.78 : 0.7)));
    else gs.push(leaf(tm, r * 1.02, yb * 0.36, yb * 0.46, r * 0.36, kind === 0 ? 0.45 : 0.8, 0.38));
    if (!fig && kind === 1) gs.push(lathe([[0.001, 0], [r * 0.09, r * 0.02], [r * 0.09, r * 0.1], [0.001, r * 0.12]], 6).translate(0, yb * 0.86, r * 1.3).rotateY(-tm + Math.PI / 2));   // the rosette on the abacus
  }
  const g = merge(gs);
  CAPS.set(key, g);
  return g;
}
const capKind = (x, z, k = 0) => { const v = Math.abs(Math.floor(Math.sin(x * 12.9898 + z * 78.233 + k * 3.1) * 43758.5453)) % 5; return v; };
/** The pier of the base style with carved capitals on its half-columns. */
function pier(el, { bag, col }) {
  const [x, z] = el.at, s = el.s, hr = el.hr ?? 0.22, y0 = el.y0 ?? 0, cap = el.cap, y1 = el.y1 ?? cap;
  const mat = el.mat || 'limestone_yellow';
  bag.add(el.baseMat || mat, box(x - s - 0.12, y0, z - s - 0.12, x + s + 0.12, y0 + 0.4, z + s + 0.12));
  bag.add(mat, box(x - s, y0 + 0.4, z - s, x + s, y1, z + s));
  const faces = el.faces || 'nesw', capH = Math.min(0.75, hr * 3.2);
  const at = { n: [x, z - s], s: [x, z + s], e: [x + s, z], w: [x - s, z] };
  for (const f of faces) {
    const [hx, hz] = at[f];
    bag.add(mat, lathe([[hr * 1.25, 0], [hr * 1.15, 0.25], [hr, 0.35], [hr, cap - capH - y0 - 0.4]], 12, null, hx, y0 + 0.4, hz));
    bag.add(el.capMat || mat, carvedCapital(hr, capH, capKind(hx, hz)).clone().translate(hx, cap - capH, hz));
  }
  col.rect([x - s - hr, z - s - hr, x + s + hr, z + s + hr], y0, y1);
}
/** The column of the base style with a carved capital. */
function column(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, d = el.d, r = d / 2, h = el.h;
  const mat = el.mat || el.shaftMat || 'limestone_yellow', capMat = el.capMat || mat;
  const baseH = 0.5 * d, capH = 0.85 * d;
  bag.add(mat, box(x - r * 1.3, y, z - r * 1.3, x + r * 1.3, y + baseH * 0.35, z + r * 1.3));
  bag.add(mat, lathe([[r * 1.25, 0], [r * 1.22, baseH * 0.3], [r * 1.05, baseH * 0.45], [r * 1.0, baseH * 0.6], [r * 1.0, baseH * 0.65]], 16, null, x, y + baseH * 0.35, z));
  bag.add(mat, lathe([[r, 0], [r * 0.96, h - baseH - capH]], 16, null, x, y + baseH, z));
  bag.add(capMat, carvedCapital(r, capH, capKind(x, z, 1)).clone().translate(x, y + h - capH, z));
  if (el.collide !== false) col.circle(x, z, r * 1.1, y, y + h);
}

// ── the altar and the treasure (docs/settlements/conques.md §1d) ───────────────────────
/** A candlestick of gilt bronze on three feet with its wax candle and flame, standing at (x, y, z), h high. */
function candlestick(bag, x, y, z, h = 0.45) {
  bag.add('gilt_bronze', lathe([[0.09, 0], [0.07, 0.02], [0.02, 0.05], [0.018, h * 0.45], [0.035, h * 0.5], [0.016, h * 0.55], [0.014, h * 0.92], [0.05, h * 0.95], [0.05, h], [0.001, h]], 8, null, x, y, z));
  bag.add('cloth_white', lathe([[0.017, 0], [0.017, 0.22], [0.001, 0.23]], 8, null, x, y + h, z));
  bag.add('flame', lathe([[0.008, 0], [0.012, 0.02], [0.001, 0.06]], 6, null, x, y + h + 0.23, z));
}
/**
 * foy_treasure: { altar [x0, z0, x1, z1] (the high altar's block), y (its top), stands: [[x, z] …] (two stands by the
 * Majesty), floor } — the high altar dressed: a linen cloth over the top falling at the ends, a red frontal, Bégon's
 * portable altar in the middle (a porphyry plaque in a silver frame engraved and nielloed, on low feet), a gilt cross and
 * two candlesticks; on the two cloth-covered stands either side of the Majesty the other treasures of the abbey: the
 * "A of Charlemagne" (the letter in gold filigree on its foot), the "shrine of Pepin" (a little house-shaped casket of
 * gold with enamels and stones), Bégon's "lantern" (a hexagonal reliquary like a little mausoleum with its pointed roof),
 * the hexagonal reliquary and the reliquary of Pascal II (a casket with the Crucifixion), candles before them.
 */
function treasure(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.altar, y = el.y, xm = (x0 + x1) / 2, zm = (z0 + z1) / 2;
  // the cloth and the frontal
  bag.add('linen', box(x0 - 0.04, y, z0 - 0.06, x1 + 0.04, y + 0.012, z1 + 0.06));
  for (const z of [z0 - 0.06, z1 + 0.05]) bag.add('linen', box(x0 - 0.04, y - 0.55, z, x1 + 0.04, y, z + 0.01));
  bag.add('cloth_red', box(x0 - 0.035, el.floor + 0.04, z0 + 0.05, x0 - 0.02, y - 0.06, z1 - 0.05));
  for (const [zz, w] of [[zm, 0.06], [z0 + 0.2, 0.04], [z1 - 0.2, 0.04]]) bag.add('gold', box(x0 - 0.04, el.floor + 0.04, zz - w, x0 - 0.034, y - 0.06, zz + w));
  bag.add('gold', box(x0 - 0.04, y - 0.16, z0 + 0.05, x0 - 0.034, y - 0.1, z1 - 0.05));
  // Bégon's portable altar: porphyry 0.26 × 0.16 in its silver frame, on four little feet
  const ty = y + 0.012;
  for (const [dx, dz] of [[-0.12, -0.17], [0.12, -0.17], [-0.12, 0.17], [0.12, 0.17]]) bag.add('silver', box(xm + dx - 0.015, ty, zm + dz - 0.015, xm + dx + 0.015, ty + 0.025, zm + dz + 0.015));
  bag.add('silver', box(xm - 0.15, ty + 0.025, zm - 0.2, xm + 0.15, ty + 0.06, zm + 0.2));
  bag.add('porphyry', box(xm - 0.08, ty + 0.06, zm - 0.13, xm + 0.08, ty + 0.064, zm + 0.13));
  for (let k = -3; k <= 3; k++) bag.add('bitumen', box(xm + 0.135, ty + 0.03, zm + k * 0.05 - 0.015, xm + 0.151, ty + 0.055, zm + k * 0.05 + 0.015));   // the nielloed busts along the side
  // the cross and the candlesticks toward the back of the altar
  const cx = x1 - 0.18;
  bag.add('gilt_bronze', lathe([[0.08, 0], [0.06, 0.04], [0.025, 0.08], [0.02, 0.12], [0.001, 0.12]], 8, null, cx, ty, zm));
  bag.add('gilt_bronze', box(cx - 0.015, ty + 0.12, zm - 0.015, cx + 0.015, ty + 0.62, zm + 0.015));
  bag.add('gilt_bronze', box(cx - 0.015, ty + 0.45, zm - 0.14, cx + 0.015, ty + 0.48, zm + 0.14));
  for (const [dz, gem] of [[0, 'inlay_lapis'], [-0.13, 'inlay_carnelian'], [0.13, 'inlay_carnelian']]) bag.add(gem, box(cx - 0.02, ty + 0.455, zm + dz - 0.012, cx - 0.014, ty + 0.475, zm + dz + 0.012));
  for (const dz of [-0.6, 0.6]) candlestick(bag, cx, ty, zm + dz);
  // the two stands by the Majesty
  for (const [k, [sx, sz]] of el.stands.entries()) {
    const fy = el.floor, h = 0.95;
    bag.add('timber', box(sx - 0.35, fy, sz - 0.3, sx + 0.35, fy + h, sz + 0.3));
    bag.add('cloth_red', box(sx - 0.38, fy + h, sz - 0.33, sx + 0.38, fy + h + 0.01, sz + 0.33));
    for (const zz of [sz - 0.34, sz + 0.33]) bag.add('cloth_red', box(sx - 0.38, fy + h - 0.3, zz, sx + 0.38, fy + h + 0.01, zz + 0.01));
    col.rect([sx - 0.38, sz - 0.33, sx + 0.38, sz + 0.33], fy, fy + h);
    const t = fy + h + 0.01;
    if (k === 0) {
      // the A of Charlemagne, 0.42 m: two legs of gold leaning together, the cross-bar, on a foot; stones on it, the carnelian
      // with its winged Victory at the top
      const ax = sx - 0.1, az = sz;
      bag.add('gold', box(ax - 0.07, t, az - 0.07, ax + 0.07, t + 0.035, az + 0.07));
      for (const sd of [-1, 1]) {
        const g = box(-0.018, 0, -0.012, 0.018, 0.4, 0.012); g.rotateX(sd * 0.25); g.translate(ax, t + 0.035, az + sd * 0.1);
        bag.add('gold', g);
      }
      bag.add('gold', box(ax - 0.018, t + 0.16, az - 0.075, ax + 0.018, t + 0.19, az + 0.075));
      bag.add('inlay_carnelian', lathe([[0.001, 0], [0.025, 0.004], [0.025, 0.016], [0.001, 0.02]], 8).rotateZ(Math.PI / 2).translate(ax - 0.02, t + 0.41, az));
      for (const dy of [0.08, 0.24, 0.32]) for (const sd of [-1, 1]) bag.add(sd > 0 ? 'inlay_lapis' : 'inlay_jade', box(ax - 0.022, t + dy, az + sd * (0.1 - dy * 0.24) - 0.008, ax - 0.016, t + dy + 0.016, az + sd * (0.1 - dy * 0.24) + 0.008));
      // Bégon's lantern, 0.4 m: a hexagonal body of arcades on a moulded base under a pointed roof with a knob
      const lx = sx + 0.15, lz = sz - 0.12;
      bag.add('silver', lathe([[0.1, 0], [0.1, 0.03], [0.085, 0.045], [0.085, 0.2], [0.1, 0.215], [0.1, 0.23]], 6, null, lx, t, lz));
      bag.add('gilt_bronze', lathe([[0.105, 0], [0.04, 0.13], [0.025, 0.14], [0.03, 0.16], [0.001, 0.18]], 6, null, lx, t + 0.23, lz));
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + Math.PI / 6; bag.add('gilt_bronze', box(-0.01, 0, -0.03, 0.01, 0.1, 0.03).rotateY(-a).translate(lx + Math.cos(a) * 0.084, t + 0.07, lz + Math.sin(a) * 0.084)); }
      // the hexagonal reliquary: gold plates and cabochons on a six-sided box with a lid
      const hx = sx + 0.15, hz = sz + 0.15;
      bag.add('gold', lathe([[0.09, 0], [0.09, 0.12], [0.07, 0.15], [0.03, 0.17], [0.001, 0.17]], 6, null, hx, t, hz));
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + Math.PI / 6; bag.add(i % 2 ? 'inlay_carnelian' : 'inlay_lapis', lathe([[0.001, 0], [0.014, 0.004], [0.001, 0.012]], 6).rotateZ(Math.PI / 2).rotateY(-a).translate(hx + Math.cos(a) * 0.08, t + 0.03, hz + Math.sin(a) * 0.08)); }
    } else {
      // the shrine of Pepin, 0.19 m: a little house-shaped casket of gold on four feet, its roof set with stones and enamels
      const px = sx - 0.05, pz = sz - 0.1;
      for (const [dx, dz] of [[-0.06, -0.08], [0.06, -0.08], [-0.06, 0.08], [0.06, 0.08]]) bag.add('gold', box(px + dx - 0.01, t, pz + dz - 0.01, px + dx + 0.01, t + 0.02, pz + dz + 0.01));
      bag.add('gold', box(px - 0.07, t + 0.02, pz - 0.095, px + 0.07, t + 0.12, pz + 0.095));
      const roof = [], q = (a, b, c, d) => roof.push(...a, ...b, ...c, ...a, ...c, ...d);
      const ry = t + 0.12, rt = t + 0.19;
      q([px - 0.075, ry, pz - 0.1], [px, rt, pz - 0.1], [px, rt, pz + 0.1], [px - 0.075, ry, pz + 0.1]);
      q([px + 0.075, ry, pz + 0.1], [px, rt, pz + 0.1], [px, rt, pz - 0.1], [px + 0.075, ry, pz - 0.1]);
      q([px - 0.075, ry, pz - 0.1], [px + 0.075, ry, pz - 0.1], [px, rt, pz - 0.1], [px, rt, pz - 0.1]);
      q([px + 0.075, ry, pz + 0.1], [px - 0.075, ry, pz + 0.1], [px, rt, pz + 0.1], [px, rt, pz + 0.1]);
      bag.add('gold', fromTriangles(roof));
      for (let i = -2; i <= 2; i++) bag.add(i % 2 ? 'inlay_jade' : 'inlay_carnelian', box(px - 0.074, t + 0.05, pz + i * 0.035 - 0.012, px - 0.07, t + 0.09, pz + i * 0.035 + 0.012));
      // the reliquary of Pascal II: a casket with a gabled lid, the Crucifixion on its front
      const rx = sx + 0.12, rz = sz + 0.13;
      bag.add('silver', box(rx - 0.06, t, rz - 0.1, rx + 0.06, t + 0.1, rz + 0.1));
      bag.add('gilt_bronze', box(rx - 0.065, t + 0.1, rz - 0.105, rx + 0.065, t + 0.125, rz + 0.105));
      bag.add('gold', box(rx - 0.066, t + 0.02, rz - 0.004, rx - 0.06, t + 0.09, rz + 0.004));
      bag.add('gold', box(rx - 0.066, t + 0.06, rz - 0.03, rx - 0.06, t + 0.07, rz + 0.03));
    }
    candlestick(bag, sx - 0.3, t, sz + (k === 0 ? 0.24 : -0.24), 0.3);
  }
}

/**
 * worn_sill: { rect [x0, z0, x1, z1] (across the doorway along z), y, h (at its ends), dip (worn away in the middle) } —
 * the threshold stone of the portal hollowed by the feet of the pilgrims: its top a shallow trough across the middle
 * of the way, deepest on the line most walked, its arrises rounded off.
 */
function wornSill(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = el.h ?? 0.04, dip = el.dip ?? 0.025, M = 16, K = 4, T = [];
  const top = (x, z) => { const u = (z - z0) / (z1 - z0) * 2 - 1, v = (x - x0) / (x1 - x0) * 2 - 1; return y + h - dip * Math.max(0, 1 - u * u * 1.3) * (1 - 0.6 * v * v) - (Math.abs(v) > 0.85 ? (Math.abs(v) - 0.85) * 0.06 : 0); };
  const P = (i, k) => { const z = z0 + (z1 - z0) * i / M, x = x0 + (x1 - x0) * k / K; return [x, top(x, z), z]; };
  const q = (a, b, c, d) => T.push(...a, ...b, ...c, ...a, ...c, ...d);
  for (let i = 0; i < M; i++) for (let k = 0; k < K; k++) q(P(i, k), P(i, k + 1), P(i + 1, k + 1), P(i + 1, k));
  for (let i = 0; i < M; i++) for (const k of [0, K]) { const a = P(i, k), b = P(i + 1, k); const A = [a[0], y - 0.05, a[2]], B = [b[0], y - 0.05, b[2]]; if (k === 0) q(A, B, b, a); else q(A, a, b, B); }
  for (const i of [0, M]) for (let k = 0; k < K; k++) { const a = P(i, k), b = P(i, k + 1); const A = [a[0], y - 0.05, a[2]], B = [b[0], y - 0.05, b[2]]; if (i === 0) q(A, a, b, B); else q(A, B, b, a); }
  bag.add(el.mat || 'limestone_yellow', fromTriangles(orientUp(T)));
}
/** Wind each triangle of a slab outward (from its middle; tops up). */
function orientUp(T) {
  let cx = 0, cy = 0, cz = 0; const n = T.length / 3;
  for (let i = 0; i < T.length; i += 3) { cx += T[i] / n; cy += T[i + 1] / n; cz += T[i + 2] / n; }
  for (let i = 0; i < T.length; i += 9) {
    const ux = T[i + 3] - T[i], uy = T[i + 4] - T[i + 1], uz = T[i + 5] - T[i + 2], vx = T[i + 6] - T[i], vy = T[i + 7] - T[i + 1], vz = T[i + 8] - T[i + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const mx = (T[i] + T[i + 3] + T[i + 6]) / 3 - cx, my = (T[i + 1] + T[i + 4] + T[i + 7]) / 3 - cy, mz = (T[i + 2] + T[i + 5] + T[i + 8]) / 3 - cz;
    const flat = Math.abs(ny) > 0.7 * Math.hypot(nx, ny, nz);
    if ((flat ? ny * my : nx * mx + nz * mz) < 0) for (let k = 0; k < 3; k++) { const t = T[i + 3 + k]; T[i + 3 + k] = T[i + 6 + k]; T[i + 6 + k] = t; }
  }
  return T;
}

const base = STYLES.romanesque;
registerStyle('romanesque-foy', {
  ...base,
  column,
  elements: { ...base.elements, pier, foy_treasure: treasure, worn_sill: wornSill },
  objects: { ...base.objects, reliquary: majesty },
});
