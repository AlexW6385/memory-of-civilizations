// The Great Sphinx as Khafre's workmen left it (docs/settlements/giza.md §10): a lion 73 m long and 20 m high, cut from the
// quarry's left-over knoll of soft limestone, its king's head in the striped headcloth (nemes) with the uraeus on the brow
// and the ceremonial beard, all painted — the face red-brown, the cloth in bands of blue and yellow, the body the lion's
// ochre — lying in the pit its own quarrying made, looking east to the valley temple.
// Element: ok_sphinx { x0 (the tail's end), z (the axis), floor (the pit's floor, y), len }; built along +x, the face to the east.

import { box } from '../../core/geom.js';
import { loft } from '../egyptian/objects.js';

/** A smooth piecewise-linear profile through [s, v] pairs. */
const prof = (pts) => (s) => {
  if (s <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (s <= pts[i][0]) { const [a, va] = pts[i - 1], [b, vb] = pts[i], t = (s - a) / (b - a); return va + (vb - va) * t * t * (3 - 2 * t); }
  return pts[pts.length - 1][1];
};
const spow = (v, k) => Math.sign(v) * Math.pow(Math.abs(v), k);

export function sphinx(el, { bag, col }) {
  const x0 = el.x0, zc = el.z, F = el.floor, S = (s) => x0 + s * (el.len ?? 73) / 73;
  // ── the body: cross-sections (a squared oval, flat on the floor) from the tail to the chest ───────────────────
  const top = prof([[0, 2.2], [3, 6.5], [9, 11.4], [14, 11.6], [26, 10.4], [38, 10.1], [46, 11.2], [52, 12.6], [58, 14.0]]);
  const half = prof([[0, 1.4], [3, 6.2], [9, 9.4], [13, 9.5], [20, 8.2], [32, 6.2], [44, 5.5], [52, 5.0], [58, 4.3]]);
  const secs = (fn, s0, s1, n) => Array.from({ length: n + 1 }, (_, i) => fn(s0 + (s1 - s0) * i / n));
  const body = secs((s) => {
    const T = top(s), W = half(s), r = [], N = 22, yc = F + T / 2 - 0.15, hh = T / 2 + 0.15;
    for (let j = 0; j < N; j++) { const t = j / N * Math.PI * 2; r.push([S(s), yc + hh * spow(Math.sin(t), 0.8), zc + W * spow(Math.cos(t), 0.72)]); }
    return r;
  }, 0, 58, 26);
  bag.add('paint_ochre', loft(body));
  // the rock the body rises out of: the bedrock's strata at its foot, a course or two of the knoll left unpainted
  for (const [s0, s1, w, h] of [[2, 30, 10.4, 1.3], [26, 52, 7.4, 1.0], [8, 20, 11.2, 0.55]]) bag.add('limestone_core', box(S(s0), F - 0.3, zc - w, S(s1), F + h, zc + w));
  // the lion's haunches: the thighs standing out of the flanks, the tail curled along the right side
  for (const sg of [-1, 1]) {
    const thigh = secs((s) => {
      const u = (s - 4) / 14, hx = 3.4 * Math.sqrt(Math.max(0, 1 - u * u)), r = [];
      for (let j = 0; j < 14; j++) { const t = j / 14 * Math.PI * 2; r.push([S(s), F + 4.4 + 4.4 * Math.sin(t) * (hx / 3.4) * 0.9 + 0.01, zc + sg * (8.6 + 0.9 * Math.cos(t) * hx / 3.4)]); }
      return r;
    }, 4, 18, 8);
    bag.add('paint_ochre', loft(thigh));
  }
  // ── the forelegs and paws, laid forward from the chest ─────────────────────────────────────────────────────────
  for (const sg of [-1, 1]) {
    const lz = zc + sg * 2.5;
    const paw = secs((s) => {
      const hgt = s < 58 ? 5.2 - (s - 44) * 0.14 : 3.1 - (s - 58) * 0.06, w = s < 58 ? 1.9 : 1.45 + (73 - s) * 0.003, r = [], N = 14;
      for (let j = 0; j < N; j++) { const t = j / N * Math.PI * 2; r.push([S(s), F + hgt / 2 - 0.1 + (hgt / 2 + 0.1) * spow(Math.sin(t), 0.8), lz + w * spow(Math.cos(t), 0.8)]); }
      return r;
    }, 44, 72.4, 14);
    bag.add('paint_ochre', loft(paw));
    // the toes: four rounded, the claws as grooves between them
    for (let k = 0; k < 4; k++) {
      const tz = lz + (k - 1.5) * 0.7;
      bag.add('paint_ochre', loft(secs((s) => { const r = [], hh = 0.95 * Math.sqrt(Math.max(0, 1 - Math.pow((s - 70.4) / 2.2, 2))); for (let j = 0; j < 8; j++) { const t = j / 8 * Math.PI * 2; r.push([S(s), F + 0.65 + 0.65 * Math.sin(t) * hh / 0.95, tz + 0.32 * Math.cos(t) * Math.max(0.2, hh / 0.95)]); } return r; }, 68.6, 72.6, 5)));
      bag.add('limestone_core', box(S(72.1), F, tz + 0.3, S(72.9), F + 0.34, tz + 0.5));   // the groove between the claws (bare stone)
    }
  }
  // ── the head and the neck ───────────────────────────────────────────────────────────────────────────────────────
  const sh = 55.5, Hx = S(sh);
  const head = (rows, mat, n = 20) => bag.add(mat, loft(rows.map(([y, cx, a, b]) => { const r = []; for (let j = 0; j < n; j++) { const t = j / n * Math.PI * 2; r.push([Hx + cx + a * Math.cos(t), F + y, zc + b * Math.sin(t)]); } return r; })));
  head([[12.6, 0, 3.4, 3.0], [14.0, 0.1, 2.9, 2.5], [14.7, 0.5, 2.5, 2.1]], 'paint_ochre');                  // the neck, in the lion's colour to the collar
  head([[14.6, 0.55, 2.0, 1.9], [15.3, 0.95, 2.0, 1.95], [16.4, 1.05, 2.25, 2.0], [17.6, 0.95, 2.35, 2.05], [18.6, 0.8, 2.4, 2.05], [19.0, 0.6, 2.3, 2.0]], 'paint_robe', 24);   // the face, red-brown
  // the headcloth: the crown over the brow in bands of blue and yellow, the wings falling at either side to the chest
  const CAP = [[18.5, 0.3, 2.9, 2.75], [19.0, 0.3, 3.0, 2.85], [19.6, 0.15, 2.8, 2.7], [20.0, 0.0, 2.2, 2.1]];
  for (let k = 0; k < 3; k++) head([CAP[k], CAP[k + 1]].map(([y, cx, a, b]) => [y, cx, a + 0.01, b + 0.01]), k % 2 ? 'paint_ochre' : 'egyptian_blue', 24);
  bag.add('egyptian_blue', box(Hx - 0.35, F + 18.62, zc - 2.12, Hx + 3.35, F + 18.85, zc + 2.12));          // the band across the brow
  for (const sg of [-1, 1]) {
    // the wing: a slab behind the face and down past the shoulder, striped in vertical bands (seen from the front)
    const z0 = zc + sg * 2.02, z1 = zc + sg * 3.05;
    for (let k = 0; k < 11; k++) {
      const x = Hx - 2.7 + k * 0.36, top = 18.7 - Math.max(0, x - (Hx + 0.4)) * 0.9;           // the wing's front edge slopes down toward the shoulder
      bag.add(k % 2 ? 'paint_ochre' : 'egyptian_blue', box(x, F + 13.4, Math.min(z0, z1), x + 0.36, F + top, Math.max(z0, z1)));
    }
    // the lappet falling over the breast in front of the shoulder: a flat panel of stripes, the front edge cut square
    for (let k = 0; k < 9; k++) bag.add(k % 2 ? 'paint_ochre' : 'egyptian_blue', box(Hx + 0.5, F + 9.3 + k * 0.5, zc + sg * 2.6 - 0.6, Hx + 2.8, F + 9.8 + k * 0.5, zc + sg * 2.6 + 0.6));
    // the ear, a small red-brown curl above the cheek in front of the wing
    bag.add('paint_robe', box(Hx - 0.2, F + 17.2, zc + sg * 2.1, Hx + 0.4, F + 18.5, zc + sg * 2.3 + sg * 0.15));
  }
  // the face's features, from the front (east): the brows and eyes' paint, the nose, the lips, the chin, the beard
  const FX = Hx + 3.25;
  for (const sg of [-1, 1]) {
    bag.add('egyptian_blue', box(FX - 0.55, F + 18.0, zc + sg * 0.55 - 0.45, FX - 0.1, F + 18.18, zc + sg * 1.45 + 0.45));        // the painted brow, a long line to the temple
    bag.add('plaster_white', box(FX - 0.5, F + 17.55, zc + sg * 0.95 - 0.28, FX - 0.15, F + 17.82, zc + sg * 0.95 + 0.28));          // the white of the eye
    bag.add('lacquer_black', box(FX - 0.4, F + 17.62, zc + sg * 0.95 - 0.15, FX - 0.1, F + 17.76, zc + sg * 0.95 + 0.15));
    bag.add('paint_robe', box(FX - 0.7, F + 16.0, zc + sg * 0.6 - 0.35, FX - 0.15, F + 16.3, zc + sg * 1.2 + 0.2));                // the cheek's fullness
  }
  bag.add('paint_robe', box(FX - 0.7, F + 16.3, zc - 0.42, FX + 0.35, F + 17.55, zc + 0.42));                                  // the nose
  bag.add('paint_robe', box(FX - 0.7, F + 15.75, zc - 1.05, FX - 0.05, F + 16.1, zc + 1.05));                                  // the upper lip
  bag.add('lacquer_red', box(FX - 0.55, F + 15.45, zc - 0.9, FX + 0.05, F + 15.7, zc + 0.9));                                  // the lips' paint
  bag.add('paint_robe', box(FX - 0.9, F + 14.95, zc - 0.85, FX - 0.25, F + 15.4, zc + 0.85));                                  // the chin
  // the ceremonial beard: a plaited, curving strap under the chin, painted blue
  for (let k = 0; k < 6; k++) bag.add('egyptian_blue', box(FX - 0.9 + k * 0.16, F + 13.4 - k * 0.2 + 0.0, zc - 0.28, FX - 0.55 + k * 0.16 + 0.2, F + 15.0 - k * 0.2, zc + 0.28));
  // the uraeus rearing on the brow, gilded
  bag.add('gilt_bronze', box(FX - 0.8, F + 18.9, zc - 0.17, FX - 0.45, F + 19.9, zc + 0.17));
  bag.add('gilt_bronze', box(FX - 1.1, F + 19.55, zc - 0.22, FX - 0.45, F + 19.85, zc + 0.22));
  // ── walking: the body's mass, in slices, and the paws ─────────────────────────────────────────────────────────
  // (a squared oval narrows toward the floor: its width at the height of the body is about four fifths of the profile's, where no rock lies at the foot)
  for (let s = 0; s < 58; s += 4) { const hw = half(s + 2) * (s >= 52 ? 0.82 : 1); col.rect([S(s), zc - hw, S(s + 4), zc + hw], F - 0.5, F + top(s + 2) - 0.2); }
  col.rect([S(55.5) - 3.2, zc - 3.2, S(55.5) + 3.2, zc + 3.2], F, F + 20);
  for (const sg of [-1, 1]) col.rect([S(58), zc + sg * 2.5 - 1.6, S(72.6), zc + sg * 2.5 + 1.6], F - 0.5, F + 3.2);
}
