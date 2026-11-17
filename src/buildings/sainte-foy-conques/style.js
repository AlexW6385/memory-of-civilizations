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


/**
 * corbel_row / corbel_arc: a corbel table (modillons) under an eave (docs/settlements/conques.md §1k). Each modillon is a
 * wedge standing out from the wall, its underside rising to the wall, set at even spacing under a thin cap course.
 * corbel_row { a [x, z], b [x, z], n [nx, nz] (the way out from the wall), y (the modillons' feet), h, out, w, step, skip: [[s0, s1]] (distances along a→b) };
 * corbel_arc { c [x, z], r (the wall face), a0, a1 (degrees), y, h, out, w, step, skip: [[a0, a1]] }.
 */
function corbelCommon(el) { return { o: el.out ?? 0.4, w: el.w ?? 0.3, h: el.h ?? 0.3, y: el.y, mat: el.mat ?? 'limestone_yellow' }; }
function wedge(out, P, { o, w, h, y }) {
  hexa(out, [P(-w / 2, 0, y + h * 0.45), P(w / 2, 0, y + h * 0.45), P(w * 0.35, o, y), P(-w * 0.35, o, y)], [P(-w / 2, 0, y + h), P(w / 2, 0, y + h), P(w * 0.35, o, y + h), P(-w * 0.35, o, y + h)]);
}
function corbelRow(el, { bag }) {
  const k = corbelCommon(el), out = [], [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), t = [(bx - ax) / L, (bz - az) / L], n = el.n;
  const P = (s, d, yy) => [ax + t[0] * s + n[0] * d, yy, az + t[1] * s + n[1] * d];
  const cnt = Math.max(1, Math.floor(L / (el.step ?? 0.6)));
  for (let i = 0; i < cnt; i++) {
    const s = (i + 0.5) * L / cnt;
    if ((el.skip || []).some(([s0, s1]) => s > s0 - k.w / 2 && s < s1 + k.w / 2)) continue;
    wedge(out, (u, d, yy) => P(s + u, d, yy), k);
  }
  hexa(out, [P(0, -0.02, k.y + k.h), P(L, -0.02, k.y + k.h), P(L, k.o + 0.05, k.y + k.h), P(0, k.o + 0.05, k.y + k.h)], [P(0, -0.02, k.y + k.h + 0.07), P(L, -0.02, k.y + k.h + 0.07), P(L, k.o + 0.05, k.y + k.h + 0.07), P(0, k.o + 0.05, k.y + k.h + 0.07)]);
  bag.add(k.mat, fromTriangles(out));
}
function corbelArc(el, { bag }) {
  const k = corbelCommon(el), out = [], [cx, cz] = el.c, a0 = el.a0 * Math.PI / 180, a1 = el.a1 * Math.PI / 180, r = el.r;
  const cnt = Math.max(1, Math.floor(r * (a1 - a0) / (el.step ?? 0.6)));
  const at = (a, rr, yy) => [cx + Math.cos(a) * rr, yy, cz + Math.sin(a) * rr];
  for (let i = 0; i < cnt; i++) {
    const a = a0 + (a1 - a0) * (i + 0.5) / cnt, deg = a * 180 / Math.PI;
    if ((el.skip || []).some(([d0, d1]) => deg > d0 && deg < d1)) continue;
    const c = Math.cos(a), s = Math.sin(a);
    wedge(out, (u, d, yy) => [cx + c * (r + d) - s * u, yy, cz + s * (r + d) + c * u], k);
  }
  const seg = Math.max(2, Math.ceil(cnt / 2));
  for (let i = 0; i < seg; i++) {
    const a = a0 + (a1 - a0) * i / seg, b = a0 + (a1 - a0) * (i + 1) / seg, y1 = k.y + k.h, y2 = y1 + 0.07;
    hexa(out, [at(a, r - 0.02, y1), at(a, r + k.o + 0.05, y1), at(b, r + k.o + 0.05, y1), at(b, r - 0.02, y1)], [at(a, r - 0.02, y2), at(a, r + k.o + 0.05, y2), at(b, r + k.o + 0.05, y2), at(b, r - 0.02, y2)]);
  }
  bag.add(k.mat, fromTriangles(out));
}

/**
 * garth { rect [x0, z0, x1, z1] (the open garden inside the walks), y, seed }: the cloister garth as the St Gall plan has it —
 * four paths of flags from the middle of each walk to the basin at the centre, and in the four quarters beds of herbs edged with
 * boards: sage and mint, fennel and lovage, iris, roses and lilies (docs/settlements/conques.md §1k).
 */
function garth(el, { bag }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, [cx, cz] = el.c ?? [(x0 + x1) / 2, (z0 + z1) / 2], pw = 0.5;
  let s = (el.seed ?? 1) >>> 0 || 1;
  const rand = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
  // the four paths, from the walks to the basin's kerb
  bag.add('flagstone', box(x0, y - 0.05, cz - pw, cx - 1.5, y + 0.04, cz + pw));
  bag.add('flagstone', box(cx + 1.5, y - 0.05, cz - pw, x1, y + 0.04, cz + pw));
  bag.add('flagstone', box(cx - pw, y - 0.05, z0, cx + pw, y + 0.04, cz - 1.5));
  bag.add('flagstone', box(cx - pw, y - 0.05, cz + 1.5, cx + pw, y + 0.04, z1));
  const KIND = [['mound', 'flax_leaf', 'mound', 'palm_leaf', 'mound', 'cloth_green'], ['tall', 'cloth_ochre', 'tall', 'palm_leaf', 'tall', 'cloth_ochre'], ['iris', 'cloth_indigo', 'iris', 'cloth_indigo', 'iris', 'cloth_white'], ['rose', 'cloth_red', 'lily', 'cloth_white', 'rose', 'cloth_red']];
  const plant = (kind, mat, x, z) => {
    const h = 0.18 + rand() * 0.1;
    if (kind === 'mound') bag.add(mat, lathe([[0.001, 0], [0.17, 0.03], [0.2, h * 0.6], [0.1, h], [0.001, h + 0.02]], 7, null, x, y + 0.04, z));
    else if (kind === 'rose') {
      bag.add('palm_leaf', lathe([[0.001, 0], [0.22, 0.06], [0.2, 0.34], [0.09, 0.5], [0.001, 0.52]], 7, null, x, y + 0.04, z));
      for (let k = 0; k < 3; k++) { const a = rand() * 6.28, d = 0.1 + rand() * 0.07; bag.add(mat, lathe([[0.001, 0], [0.04, 0.02], [0.001, 0.07]], 5, null, x + Math.cos(a) * d, y + 0.3 + rand() * 0.2, z + Math.sin(a) * d)); }
    } else if (kind === 'tall') {
      const hh = 0.8 + rand() * 0.35;
      bag.add('palm_leaf', lathe([[0.001, 0], [0.012, 0.01], [0.012, hh]], 5, null, x, y + 0.04, z));
      bag.add('palm_leaf', lathe([[0.001, 0], [0.12, 0.02], [0.1, 0.3], [0.001, 0.4]], 6, null, x, y + 0.04, z));
      bag.add(mat, lathe([[0.001, 0], [0.11, 0.015], [0.1, 0.04], [0.001, 0.05]], 7, null, x, y + 0.04 + hh - 0.02, z));
    } else if (kind === 'iris') {
      for (let k = 0; k < 3; k++) { const a = k * 2.1 + rand(), d = 0.04; bag.add('flax_leaf', lathe([[0.03, 0], [0.012, 0.3], [0.001, 0.52 + rand() * 0.1]], 4, null, x + Math.cos(a) * d, y + 0.04, z + Math.sin(a) * d)); }
      bag.add(mat, lathe([[0.001, 0], [0.05, 0.03], [0.035, 0.09], [0.001, 0.1]], 6, null, x, y + 0.04 + 0.56, z));
    } else if (kind === 'lily') {
      bag.add('palm_leaf', lathe([[0.001, 0], [0.012, 0.01], [0.012, 0.75]], 5, null, x, y + 0.04, z));
      bag.add(mat, lathe([[0.001, 0], [0.025, 0.02], [0.06, 0.1], [0.05, 0.12], [0.001, 0.1]], 7, null, x, y + 0.04 + 0.72, z));
    }
  };
  const qx = [[x0 + 0.5, cx - pw - 0.45], [cx + pw + 0.45, x1 - 0.5]], qz = [[z0 + 0.5, cz - pw - 0.45], [cz + pw + 0.45, z1 - 0.5]];
  let qi = 0;
  for (const zz of qz) for (const xx of qx) {
    const kinds = KIND[qi++ % 4], wq = xx[1] - xx[0], nb = 3, bw = (wq - 0.55 * (nb - 1)) / nb;
    for (let b = 0; b < nb; b++) {
      const bx0 = xx[0] + b * (bw + 0.55), bx1 = bx0 + bw, bz0 = zz[0], bz1 = zz[1];
      // the board edging and the dark soil
      bag.add('wood_dark', box(bx0 - 0.04, y, bz0 - 0.04, bx1 + 0.04, y + 0.15, bz0 + 0.02)); bag.add('wood_dark', box(bx0 - 0.04, y, bz1 - 0.02, bx1 + 0.04, y + 0.15, bz1 + 0.04));
      bag.add('wood_dark', box(bx0 - 0.04, y, bz0 + 0.02, bx0 + 0.02, y + 0.15, bz1 - 0.02)); bag.add('wood_dark', box(bx1 - 0.02, y, bz0 + 0.02, bx1 + 0.04, y + 0.15, bz1 - 0.02));
      bag.add('earth_wall', box(bx0 + 0.02, y, bz0 + 0.02, bx1 - 0.02, y + 0.1, bz1 - 0.02));
      const kind = kinds[b * 2], mat = kinds[b * 2 + 1];
      const nz = Math.floor((bz1 - bz0 - 0.4) / 0.5), nr = bw > 1.2 ? 2 : 1;
      for (let i = 0; i <= nz; i++) for (let r = 0; r < nr; r++) plant(kind, mat, bx0 + bw * (r + 0.5) / nr + (rand() - 0.5) * 0.1, bz0 + 0.25 + i * (bz1 - bz0 - 0.5) / Math.max(1, nz) + (rand() - 0.5) * 0.1);
    }
  }
}


// ── the dressing of the stone: the portal's shafts and mouldings, the west front, the towers, the chevet ──────
// (docs/settlements/conques.md §1l). Every repeated piece is varied by a millimetre so the renderer merges it.
let SEQ = 0;
const jit = () => (SEQ++ % 13) * 0.0009;
/** A frame in a vertical plane: P(u, v, d) = the point u along the tangent t, v up, d out along the normal n. */
const frame = (o, t, n) => (u, v, d) => [o[0] + t[0] * u + n[0] * d, v, o[1] + t[1] * u + n[1] * d];
const fb = (out, P, u0, u1, v0, v1, d0, d1) => hexa(out, [P(u0, v0, d0), P(u1, v0, d0), P(u1, v0, d1), P(u0, v0, d1)], [P(u0, v1, d0), P(u1, v1, d0), P(u1, v1, d1), P(u0, v1, d1)]);
/** A bar between two (u, v) points, width w, from depth d0 to d1. */
function barB(out, P, a, b, w, d0, d1) {
  const tu = b[0] - a[0], tv = b[1] - a[1], L = Math.hypot(tu, tv) || 1, pu = -tv / L * w / 2, pv = tu / L * w / 2;
  hexa(out, [P(a[0] - pu, a[1] - pv, d0), P(a[0] + pu, a[1] + pv, d0), P(b[0] + pu, b[1] + pv, d0), P(b[0] - pu, b[1] - pv, d0)],
    [P(a[0] - pu, a[1] - pv, d1), P(a[0] + pu, a[1] + pv, d1), P(b[0] + pu, b[1] + pv, d1), P(b[0] - pu, b[1] - pv, d1)]);
}
/** A ring of voussoirs (an arch band) of radii r0…r1 about (uc, yc), angles a0…a1. */
function ringB(out, P, uc, yc, r0, r1, d0, d1, n = 18, a0 = 0, a1 = Math.PI) {
  const Q = (r, t, d) => P(uc + r * Math.cos(t), yc + r * Math.sin(t), d);
  for (let i = 0; i < n; i++) {
    const a = a0 + (a1 - a0) * i / n, b = a0 + (a1 - a0) * (i + 1) / n;
    hexa(out, [Q(r0, a, d0), Q(r1, a, d0), Q(r1, b, d0), Q(r0, b, d0)], [Q(r0, a, d1), Q(r1, a, d1), Q(r1, b, d1), Q(r0, b, d1)]);
  }
}
/** A billet moulding: short blocks with gaps along an arc of radius r, radial width 2·rw. */
function billetsB(out, P, uc, yc, r, rw, d0, d1, count, a0 = 0, a1 = Math.PI) {
  for (let k = 0; k < count; k++) {
    const t = a0 + (a1 - a0) * (k + 0.5) / count, hl = r * (a1 - a0) / count * 0.27, c = Math.cos(t), s = Math.sin(t), cu = uc + r * c, cv = yc + r * s;
    const Q = (rr, tt, d) => P(cu + c * rr - s * tt, cv + s * rr + c * tt, d);
    hexa(out, [Q(-rw, -hl, d0), Q(rw, -hl, d0), Q(rw, hl, d0), Q(-rw, hl, d0)], [Q(-rw, -hl, d1), Q(rw, -hl, d1), Q(rw, hl, d1), Q(-rw, hl, d1)]);
  }
}
/** A zigzag (chevron) band along an arc between radii r0 and r1. */
function chevronB(out, P, uc, yc, r0, r1, d0, d1, count, a0 = 0, a1 = Math.PI, w = 0.05) {
  const pt = (i) => { const t = a0 + (a1 - a0) * i / (2 * count), r = i % 2 ? r1 : r0; return [uc + r * Math.cos(t), yc + r * Math.sin(t)]; };
  for (let i = 0; i < 2 * count; i++) barB(out, P, pt(i), pt(i + 1), w, d0, d1);
}
/** A shaft on a base with a carved capital, standing at world (x, z) from y0 to y1. */
function colonnette(bag, x, z, y0, y1, r, kind = 0, mat = 'limestone_yellow') {
  const rr = r + jit(), ch = Math.max(0.16, r * 3.0 + jit()), by = 0.14 + jit();
  bag.add(mat, lathe([[rr * 1.5, 0], [rr * 1.5, 0.05], [rr * 1.22, 0.1], [rr, by]], 10, null, x, y0, z));
  bag.add(mat, lathe([[rr, 0], [rr * 0.94, y1 - y0 - ch - by]], 10, null, x, y0 + by, z));
  bag.add(mat, carvedCapital(rr, ch, kind).clone().translate(x, y1 - ch, z));
}
const flush = (bag, acc) => { for (const m of Object.keys(acc)) if (acc[m].length) bag.add(m, fromTriangles(acc[m])); };
/** A blind arcade of n arches across u0…u1 on a face: shafts' strips, a ring over each, springing at ys, from yb. */
function blindArcade(L, P, u0, u1, n, yb, ys, d0, d1) {
  const st = (u1 - u0) / n, r = st / 2 - 0.06;
  for (let k = 0; k <= n; k++) fb(L, P, u0 + k * st - 0.06 - (k === 0 ? 0 : 0), u0 + k * st + 0.06, yb, ys, d0, d1);
  for (let k = 0; k < n; k++) ringB(L, P, u0 + (k + 0.5) * st, ys, r - 0.02, r + 0.07, d0, d1, 10);
}

/**
 * portal_dress { x (the tympanum's face), R (its radius), yb (its springing) }: the three orders of the west portal as at Conques:
 * jamb shafts with carved capitals under each of the archivolts and the inner reveal, a billet moulding on the first ring,
 * a row of rosettes on the second, a chevron on the third, and a hood moulding with billets round the whole opening
 * (docs/settlements/conques.md §1l). [stated: three archivolts, "curious" heads; inferred: the mouldings after the Romanesque
 * portals of the Rouergue and Auvergne]
 */
function portalDress(el, { bag }) {
  const x = el.x ?? 1.0, R = el.R ?? 3.35, yb = el.yb ?? 4.85, P = (u, v, xx) => [xx, v, u], L = [], Y = [];
  const fx = (k) => x - 0.25 - 0.35 * k;
  // the rings' faces
  { const r0 = R + 0.05, r1 = r0 + 0.3; billetsB(Y, P, 0, yb, (r0 + r1) / 2, 0.065, fx(0) - 0.06, fx(0), 46, 0.08, Math.PI - 0.08); }
  { const r0 = R + 0.05 + 0.64, r1 = r0 + 0.3; chevronB(Y, P, 0, yb, r0 + 0.02, r1 - 0.02, fx(2) - 0.05, fx(2), 22, 0.04, Math.PI - 0.04, 0.045); }
  // rosettes in the middle of the red ring (small discs, each a little different)
  for (let i = 0; i < 20; i++) {
    const a = Math.PI * (i + 0.5) / 20, rr = R + 0.05 + 0.32 + 0.15;
    const g = lathe([[0.001, 0], [0.065 + jit(), 0.004], [0.06 + jit(), 0.03], [0.03, 0.05], [0.001, 0.055]], 8);
    g.rotateZ(Math.PI / 2); g.translate(fx(1), yb + rr * Math.sin(a), rr * Math.cos(a));
    bag.add('limestone_yellow', g);
  }
  // the hood: a moulded band round the opening on the face of the wall, with billets
  ringB(L, P, 0, yb, 4.42, 4.62, -0.12, 0.0, 26);
  billetsB(Y, P, 0, yb, 4.72, 0.05, -0.12, -0.02, 54, 0.06, Math.PI - 0.06);
  ringB(L, P, 0, yb, 4.62, 4.78, -0.07, 0.0, 26);
  // the shafts: two on the inner reveal, three under the archivolts, each side
  for (const s of [-1, 1]) {
    for (const [z, xc, k] of [[2.55, 0.8, 0], [2.95, 0.8, 1], [3.55, 0.25, 2], [3.87, 0.25, 3], [4.19, 0.25, 4]]) {
      colonnette(bag, xc, s * z, 0.0, yb - 0.02, 0.1, k, 'limestone_yellow');
    }
  }
  // the hood's feet: two small corbel heads at its springing
  for (const s of [-1, 1]) bag.add('limestone_yellow', lathe([[0.001, 0], [0.09, 0.03], [0.1, 0.11], [0.07, 0.18], [0.001, 0.2]], 8).rotateZ(Math.PI / 2).translate(0, yb - 0.1 + jit(), s * 4.95));
  bag.add('limestone_yellow', fromTriangles(L));
  bag.add('limestone_yellow', fromTriangles(Y));
}

/**
 * front_dress: the flat of the west front given its courses: the sill course and the cornice with billets, the two upper windows
 * with their hoods and shafts, the blind arcade between the towers (docs/settlements/conques.md §1l). [inferred: after the
 * western fronts of the Rouergue's Romanesque churches]
 */
function frontDress(el, { bag }) {
  const P = (u, v, xx) => [xx, v, u], L = [], Y = [], zs = el.zs ?? 3.5, y0 = el.y0 ?? 15.5;
  // the sill course under the windows, with a billet row
  fb(L, P, -4.85, 4.85, 11.45, 11.68, -0.13, 0);
  for (let k = 0; k < 40; k++) { const u = -4.7 + k * 9.4 / 39; fb(Y, P, u - 0.07, u + 0.07, 11.3, 11.45, -0.1, -0.0); }
  // the two windows: a hood with a billet row and a shaft each side
  for (const s of [-1, 1]) {
    const uc = s * 1.1;
    ringB(L, P, uc, 14.2, 0.55, 0.72, -0.12, 0, 14);
    billetsB(Y, P, uc, 14.2, 0.8, 0.04, -0.1, -0.02, 14, 0.1, Math.PI - 0.1);
    for (const e of [-1, 1]) colonnette(bag, -0.07, uc + e * 0.635, 12.2, 14.2, 0.065, (s + e + 3) % 3);
    fb(L, P, uc - 0.78, uc + 0.78, 12.12, 12.2, -0.1, 0);
  }
  // the courses above: under the towers' foot and under the gable
  fb(L, P, -3.55, 3.55, y0 - 0.02, y0 + 0.16, -0.14, 0);
  fb(L, P, -3.55, 3.55, 19.5, 19.7, -0.14, 0);
  for (let k = 0; k < 30; k++) { const u = -3.4 + k * 6.8 / 29; fb(Y, P, u - 0.07, u + 0.07, 19.35, 19.5, -0.1, 0); }
  // the blind arcade between the towers
  blindArcade(L, P, -3.5, 3.5, 5, y0 + 0.3, 17.8, -0.09, 0);
  for (let k = 0; k <= 5; k++) { const u = -3.5 + k * 1.4; bag.add('limestone_yellow', carvedCapital(0.06 + jit(), 0.2, k % 5).clone().translate(-0.03, 17.8 - 0.2, u)); }
  bag.add('limestone_yellow', fromTriangles(L));
  bag.add('limestone_yellow', fromTriangles(Y));
}

/**
 * tower_dress { zc (the tower's axis), sz (the side), h (half the width), y0, y1 }: the face of a west tower — corner buttress
 * strips to the top, string courses, a blind arcade, and the belfry's openings with shafts, hoods and the pier's shaft between
 * the pair. Built on the west face and on the outer side; the other two faces are hidden by the roofs.
 */
function towerDress(el, { bag }) {
  const zc = el.zc, sz = el.sz, h = el.h ?? 3.0, y0 = el.y0 ?? 15.5, y1 = el.y1 ?? 30.0, L = [], Y = [];
  const zo = zc + sz * h, zi = zc - sz * h;
  const sorted = (a, b) => (a < b ? [a, b] : [b, a]);
  const [oa, ob] = sorted(zo - sz * 0.5, zo + sz * 0.25), [ia, ib] = sorted(zi + sz * 0.5, zi - sz * 0.25);
  const W = (u, v, xx) => [xx, v, u];
  fb(L, W, oa, ob, y0, y1 - 0.2, -0.25, 0.5);
  fb(L, W, ia, ib, y0, y1 - 0.2, -0.25, 0.5);
  fb(L, W, oa - 0.04, ob + 0.04, y1 - 0.2, y1 - 0.1, -0.3, 0.5);
  for (const [a, b] of [[oa, ob], [ia, ib]]) { fb(L, W, a, b, y0 - 0.4, y0, -0.12, 0.5); fb(L, W, a, b, y0 - 0.8, y0 - 0.4, -0.05, 0.5); }
  fb(L, frame([0, zo], [1, 0], [0, sz]), 5.5, 6.25, y0 - 0.4, y0, -0.5, 0.12);
  fb(L, W, ia - 0.04, ib + 0.04, y1 - 0.2, y1 - 0.1, -0.3, 0.5);
  // the side face: u runs along x, the normal points out along sz
  const S = frame([0, zo], [1, 0], [0, sz]);
  fb(L, S, 5.5, 6.25, y0, y1 - 0.2, -0.5, 0.25);
  fb(L, S, 5.45, 6.3, y1 - 0.2, y1 - 0.1, -0.5, 0.3);
  const faces = [[W, zc - h + 0.5, zc + h - 0.5, 0], [S, 0.5, 2 * h - 0.5, 1]];
  for (const [Pf, u0, u1, kind] of faces) {
    const lo = kind ? u0 : Math.min(zc - h + 0.5, zc + h - 0.5) , hi = kind ? u1 : Math.max(zc - h + 0.5, zc + h - 0.5), mid = (lo + hi) / 2, wid = hi - lo, d1 = kind ? 0 : 0, dd = kind ? 1 : -1;
    // dd: for the west face the outward way is −x, so depths are given as x (negative = outward); for the side face as d (positive = outward)
    const o0 = kind ? 0 : 0.0, a = kind ? -0.1 : 0.0, b = kind ? 0.12 : -0.12;
    // string courses
    for (const yy of [19.0, 24.4]) fb(L, Pf, lo - 0.1, hi + 0.1, yy, yy + 0.2, kind ? 0 : 0.0, kind ? 0.13 : -0.13);
    for (const yy of [19.0, 24.4]) for (let k = 0; k < Math.round(wid / 0.2); k++) { const u = lo + 0.1 + k * (wid - 0.2) / Math.round(wid / 0.2); fb(Y, Pf, u - 0.06, u + 0.06, yy - 0.1, yy, kind ? 0 : 0.0, kind ? 0.1 : -0.1); }
    // the blind arcade
    const n = Math.round(wid);
    blindArcade(L, Pf, lo, hi, n, 19.3, 22.4, kind ? 0 : 0, kind ? 0.08 : -0.08);
    // the belfry's pair of openings, with hoods and shafts
    for (const uc of [mid - 0.75, mid + 0.75]) {
      ringB(L, Pf, uc, 26.6, 0.55, 0.7, kind ? 0 : 0, kind ? 0.1 : -0.1, 12);
      billetsB(Y, Pf, uc, 26.6, 0.77, 0.04, kind ? 0 : 0, kind ? 0.08 : -0.08, 12, 0.1, Math.PI - 0.1);
    }
    for (const u of [mid - 0.75 - 0.6, mid, mid + 0.75 + 0.6]) {
      const p = Pf(u, 0, kind ? 0.06 : -0.06);
      colonnette(bag, p[0], p[2], 25.0, 26.6, 0.075, Math.abs(Math.round(u * 3)) % 5);
    }
    fb(L, Pf, mid - 1.5, mid + 1.5, 24.88, 25.0, kind ? 0 : 0, kind ? 0.1 : -0.1);
  }
  bag.add('limestone_yellow', fromTriangles(L));
  bag.add('limestone_yellow', fromTriangles(Y));
}

/** A band round an arc in plan (world frame): radii r0…r1, angles a0…a1 (deg), y0…y1. */
function arcBand(out, c, r0, r1, a0, a1, y0, y1, seg) {
  const D = Math.PI / 180, Q = (r, t, y) => [c[0] + Math.cos(t * D) * r, y, c[1] + Math.sin(t * D) * r];
  for (let i = 0; i < seg; i++) {
    const a = a0 + (a1 - a0) * i / seg, b = a0 + (a1 - a0) * (i + 1) / seg;
    hexa(out, [Q(r0, a, y0), Q(r1, a, y0), Q(r1, b, y0), Q(r0, b, y0)], [Q(r0, a, y1), Q(r1, a, y1), Q(r1, b, y1), Q(r0, b, y1)]);
  }
}
/** A string course of billets round an arc (world frame). */
function arcBillets(out, c, r, a0, a1, y0, y1, count, rw = 0.06, skip = []) {
  const D = Math.PI / 180;
  for (let k = 0; k < count; k++) {
    const t = a0 + (a1 - a0) * (k + 0.5) / count;
    if (skip.some(([s0, s1]) => t > s0 && t < s1)) continue;
    const hl = r * (a1 - a0) * D / count * 0.27, c0 = Math.cos(t * D), s0 = Math.sin(t * D), cx = c[0] + c0 * r, cz = c[1] + s0 * r;
    const Q = (rr, tt, y) => [cx + c0 * rr - s0 * tt, y, cz + s0 * rr + c0 * tt];
    hexa(out, [Q(-rw, -hl, y0), Q(rw, -hl, y0), Q(rw, hl, y0), Q(-rw, hl, y0)], [Q(-rw, -hl, y1), Q(rw, -hl, y1), Q(rw, hl, y1), Q(-rw, hl, y1)]);
  }
}
/**
 * chevet_dress { c (the hemicycle's centre), rAmb (the ambulatory wall's outer radius), rd (the drum's), chapels: [{ c, a, r }] }: the
 * east end given its pilaster strips between the bays, hoods and shafts at its windows, and string courses with billets round the
 * ambulatory and the radiating chapels (docs/settlements/conques.md §1l). [inferred: the type of the pilgrimage churches' chevets]
 */
function chevetDress(el, { bag }) {
  const D = Math.PI / 180, c = el.c, L = [], R = [], Y = [];
  const polar = (cc, r, adeg) => { const a = adeg * D; return frame([cc[0] + Math.cos(a) * r, cc[1] + Math.sin(a) * r], [-Math.sin(a), Math.cos(a)], [Math.cos(a), Math.sin(a)]); };
  const gaps = (el.chapels || []).map((k) => [k.a - 9.5, k.a + 9.5]);
  // the ambulatory: pilaster strips between the bays, the cap-course, the string course at the springing of the vault
  for (const a of [-75, -45, -15, 15, 45, 75]) {
    const P = polar(c, el.rAmb, a);
    fb(R, P, -0.3, 0.3, 0, 7.6, -0.15, 0.3); fb(L, P, -0.3, 0.3, 7.6, 10.9, -0.15, 0.3); fb(L, P, -0.36, 0.36, 10.9, 11.1, -0.15, 0.36);
    fb(L, P, -0.36, 0.36, 7.4, 7.6, -0.15, 0.36);
  }
  arcBand(L, c, el.rAmb - 0.1, el.rAmb + 0.1, -90, 90, 7.45, 7.6, 40);
  arcBillets(Y, c, el.rAmb + 0.1, -90, 90, 7.6, 7.72, 100, 0.05, gaps);
  for (const a of [-30, 30]) {            // the windows: a hood and two shafts
    const P = polar(c, el.rAmb, a);
    ringB(L, P, 0, 4.75, 0.45, 0.62, -0.05, 0.12, 12);
    for (const e of [-1, 1]) { const q = P(e * 0.51, 0, 0.1); colonnette(bag, q[0], q[2], 3.4, 4.75, 0.06, 0); }
    fb(L, P, -0.68, 0.68, 3.3, 3.4, -0.05, 0.18);
  }
  // the radiating chapels: a string course with billets, hoods at the three windows, a pilaster between each
  for (const k of el.chapels || []) {
    arcBand(L, k.c, k.r - 0.08, k.r + 0.08, k.a - 82, k.a + 82, 4.35, 4.5, 24);
    arcBillets(Y, k.c, k.r + 0.08, k.a - 82, k.a + 82, 4.5, 4.62, 36, 0.045);
    for (const d of [-50, 0, 50]) {
      const P = polar(k.c, k.r, k.a + d);
      ringB(L, P, 0, 3.9, 0.3, 0.46, -0.05, 0.1, 10);
      for (const e of [-1, 1]) { const q = P(e * 0.35, 0, 0.08); colonnette(bag, q[0], q[2], 2.6, 3.9, 0.045, 1); }
    }
    for (const d of [-25, 25, -75, 75]) { const P = polar(k.c, k.r, k.a + d); fb(R, P, -0.22, 0.22, 0, 6.0, -0.15, 0.2); fb(L, P, -0.28, 0.28, 6.0, 6.15, -0.15, 0.26); }
  }
  // the drum of the hemicycle: pilaster strips and hoods at the clerestory
  for (const a of [-60, -30, 0, 30, 60]) { const P = polar(c, el.rd, a); fb(L, P, -0.3, 0.3, 13.2, 22.9, -0.15, 0.25); fb(L, P, -0.36, 0.36, 22.9, 23.1, -0.15, 0.3); }
  for (const a of [-45, -15, 15, 45]) {
    const P = polar(c, el.rd, a);
    ringB(L, P, 0, 16.15, 0.45, 0.62, -0.05, 0.1, 12);
    for (const e of [-1, 1]) { const q = P(e * 0.5, 0, 0.08); colonnette(bag, q[0], q[2], 14.4, 16.15, 0.06, 2); }
    fb(L, P, -0.68, 0.68, 14.3, 14.4, -0.05, 0.14);
  }
  arcBand(L, c, el.rd - 0.05, el.rd + 0.1, -90, 90, 19.0, 19.15, 40);
  arcBillets(Y, c, el.rd + 0.1, -90, 90, 19.15, 19.27, 70, 0.05);
  bag.add('sandstone_red', fromTriangles(R));
  bag.add('limestone_yellow', fromTriangles(L));
  bag.add('limestone_yellow', fromTriangles(Y));
}

const base = STYLES.romanesque;
registerStyle('romanesque-foy', {
  ...base,
  column,
  elements: { ...base.elements, pier, foy_treasure: treasure, worn_sill: wornSill, corbel_row: corbelRow, corbel_arc: corbelArc, garth, portal_dress: portalDress, front_dress: frontDress, tower_dress: towerDress, chevet_dress: chevetDress },
  objects: { ...base.objects, reliquary: majesty },
});
