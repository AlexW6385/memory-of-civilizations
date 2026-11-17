// The Great Sphinx, as Giza draws it (docs/settlements/giza.md §10, §17): the body in the lion's ochre with the bedrock's
// ledges left standing out of it in bands; the forepaws laid up of blocks, as they were; the king's head with a modelled
// face (brows, lidded eyes, nose, lips, chin, ears), the headcloth in a dome of stripes with the wings flaring behind and
// the lappets pleated on the breast, the plaited beard and the gilded cobra on the brow. Replaces the Old Kingdom style's
// version for Giza. Element: ok_sphinx { x0 (the tail's end), z (the axis), floor (the pit's floor, y), len }; along +x, face east.

import { box } from '../../core/geom.js';
import { loft } from '../egyptian/objects.js';

const prof = (pts) => (s) => {
  if (s <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (s <= pts[i][0]) { const [a, va] = pts[i - 1], [b, vb] = pts[i], t = (s - a) / (b - a); return va + (vb - va) * t * t * (3 - 2 * t); }
  return pts[pts.length - 1][1];
};
const spow = (v, k) => Math.sign(v) * Math.pow(Math.abs(v), k);

export function sphinx(el, { bag, col }) {
  const x0 = el.x0, zc = el.z, F = el.floor, k73 = (el.len ?? 73) / 73, S = (s) => x0 + s * k73;
  const top = prof([[0, 2.2], [3, 6.5], [9, 11.4], [14, 11.6], [26, 10.4], [38, 10.1], [46, 11.2], [52, 12.6], [58, 14.0]]);
  const half = prof([[0, 1.4], [3, 6.2], [9, 9.4], [13, 9.5], [20, 8.2], [32, 6.2], [44, 5.5], [52, 5.0], [58, 4.3]]);
  const secs = (fn, s0, s1, n) => Array.from({ length: n + 1 }, (_, i) => fn(s0 + (s1 - s0) * i / n));
  // ── the body: a squared oval from the tail to the chest ─────────────────────────────────────────────────────────
  const body = secs((s) => {
    const T = top(s), W = half(s), r = [], N = 24, yc = F + T / 2 - 0.15, hh = T / 2 + 0.15;
    for (let j = 0; j < N; j++) { const t = j / N * Math.PI * 2; r.push([S(s), yc + hh * spow(Math.sin(t), 0.8), zc + W * spow(Math.cos(t), 0.72)]); }
    return r;
  }, 0, 58, 28);
  bag.add('paint_ochre', loft(body));
  // the bedrock's ledges: the hard layers of the knoll standing out of the painted body in bands, the paint flaked from them
  const zsAt = (ys) => Math.pow(Math.max(0, 1 - Math.pow(Math.abs(ys), 2.5)), 0.36);
  for (const [ya, yb] of [[1.5, 1.95], [3.1, 3.5], [4.9, 5.4], [6.6, 7.0], [8.0, 8.3]]) {
    const ring = (s) => {
      const T = top(s), W = half(s), yc = F + T / 2 - 0.15, hh = T / 2 + 0.15, d = 0.13, r = [];
      if (yb + 1.2 > T) return null;
      const lv = [ya, (ya + yb) / 2, yb];
      for (const y of lv) { const ys = (F + y - yc) / hh; r.push([S(s), F + y, zc + (W * zsAt(ys) + d)]); }
      for (const y of lv.slice().reverse()) { const ys = (F + y - yc) / hh; r.push([S(s), F + y, zc - (W * zsAt(ys) + d)]); }
      return r;
    };
    const rs = secs((s) => s, 11, 51, 14).map(ring).filter(Boolean);
    if (rs.length > 3) bag.add('limestone_core', loft(rs));
  }
  // the rock the body rises out of: a course or two of the knoll left unpainted at its foot
  for (const [s0, s1, w, h] of [[2, 30, 10.4, 1.3], [26, 52, 7.4, 1.0], [8, 20, 11.2, 0.55]]) bag.add('limestone_core', box(S(s0), F - 0.3, zc - w, S(s1), F + h, zc + w));
  // the lion's haunches and the tail curled round the right one
  for (const sg of [-1, 1]) {
    const thigh = secs((s) => {
      const u = (s - 4) / 14, hx = 3.4 * Math.sqrt(Math.max(0, 1 - u * u)), r = [];
      for (let j = 0; j < 16; j++) { const t = j / 16 * Math.PI * 2; r.push([S(s), F + 4.4 + 4.4 * Math.sin(t) * (hx / 3.4) * 0.9 + 0.01, zc + sg * (8.6 + 0.9 * Math.cos(t) * hx / 3.4)]); }
      return r;
    }, 4, 18, 10);
    bag.add('paint_ochre', loft(thigh));
  }
  {
    // the tail: a rope of stone laid from the rump along the right flank, tufted at its end
    const path = [[1.2, 3.0, -0.4], [1.0, 4.2, -2.2], [2.0, 5.6, -4.4], [4.0, 5.4, -6.0], [7.0, 4.4, -7.4], [10.0, 3.6, -8.0]];
    const rings = path.map(([s, y, dz]) => { const r = [], rad = 0.55; for (let j = 0; j < 10; j++) { const t = j / 10 * Math.PI * 2; r.push([S(s) + Math.cos(t) * rad, F + y + Math.sin(t) * rad, zc + dz]); } return r; });
    bag.add('paint_ochre', loft(rings));
  }
  // ── the forepaws: laid up of blocks, courses 1.05 m high, the joints staggered, the toes cut on the end ─────────
  for (const sg of [-1, 1]) {
    const lz = zc + sg * 2.5;
    for (let c = 0; c < 5; c++) {
      const y0 = F + c * 1.05;
      for (let s = 44 + ((c * 0.9) % 1.9) - 1.9, i = 0; s < 70; s += 1.9, i++) {
        const sa = Math.max(44, s), sb = Math.min(70, s + 1.9 - 0.05);
        if (sb <= sa + 0.2) continue;
        const hgt = (sa + sb) / 2 < 58 ? 5.2 - ((sa + sb) / 2 - 44) * 0.14 : 3.1;
        if (y0 - F >= hgt - 0.05) continue;
        const y1 = Math.min(y0 + 1.0, F + hgt);
        for (const k of [-1, 1]) bag.add((i + c + (k > 0 ? 1 : 0)) % 3 === 0 ? 'paint_ochre' : 'limestone_core', box(S(sa), y0 - (c ? 0 : 0.3), lz + (k > 0 ? 0.03 : -1.9), S(sb), y1, lz + (k > 0 ? 1.9 : -0.03)));
      }
    }
    // the toes: four, rounded, the claws' grooves between them
    for (let k = 0; k < 4; k++) {
      const tz = lz + (k - 1.5) * 0.9;
      bag.add('paint_ochre', loft(secs((s) => { const r = [], hh = 1.0 * Math.sqrt(Math.max(0, 1 - Math.pow((s - 70.6) / 2.4, 2))); for (let j = 0; j < 8; j++) { const t = j / 8 * Math.PI * 2; r.push([S(s), F + 0.7 + 0.7 * Math.sin(t) * hh, tz + 0.4 * Math.cos(t) * Math.max(0.2, hh)]); } return r; }, 68.3, 72.9, 6)));
    }
  }
  // ── the head ────────────────────────────────────────────────────────────────────────────────────────────────────
  const sh = 55.5, Hx = S(sh);
  const ellipse = (y, cx, a, b, n = 28) => { const r = []; for (let j = 0; j < n; j++) { const t = j / n * Math.PI * 2; r.push([Hx + cx + a * Math.cos(t), F + y, zc + b * Math.sin(t)]); } return r; };
  const head = (rows, mat, n = 28) => bag.add(mat, loft(rows.map(([y, cx, a, b]) => ellipse(y, cx, a, b, n))));
  head([[12.6, 0, 3.4, 3.0], [14.0, 0.1, 2.9, 2.5], [14.7, 0.5, 2.5, 2.1]], 'paint_ochre');
  const FR = [[14.4, 0.75, 1.3, 1.2], [14.9, 0.9, 1.75, 1.55], [15.6, 1.0, 2.1, 1.85], [16.4, 1.05, 2.3, 2.0], [17.2, 1.0, 2.38, 2.05], [18.0, 0.9, 2.4, 2.08], [18.8, 0.75, 2.3, 2.05], [19.1, 0.6, 2.0, 1.9]];
  head(FR, 'paint_robe');
  const lerpRow = (y) => { for (let i = 1; i < FR.length; i++) if (y <= FR[i][0] || i === FR.length - 1) { const [y0, ...p] = FR[i - 1], [y1, ...q] = FR[i], t = Math.max(0, Math.min(1, (y - y0) / (y1 - y0))); return p.map((v, k) => v + (q[k] - v) * t); } };
  /** x of the face's surface at height y (above the floor) and z off the axis */
  const faceX = (y, z) => { const [cx, a, b] = lerpRow(y); return Hx + cx + a * Math.sqrt(Math.max(0, 1 - (z / b) * (z / b))); };
  // a lofted bar along z: rings in the (x, y) plane at each z in zs; fn(z) → [x centre, y centre, half depth, half height]
  const alongZ = (zs, fn, mat, n = 8) => bag.add(mat, loft(zs.map((z) => { const [x, y, dx, dy] = fn(z), r = []; for (let j = 0; j < n; j++) { const t = j / n * Math.PI * 2; r.push([x + dx * Math.cos(t), F + y + dy * Math.sin(t), zc + z]); } return r; })));
  const Z9 = (a, b) => Array.from({ length: 9 }, (_, i) => a + (b - a) * i / 8);
  // the headcloth: the crown over the brow, eight stripes of blue and gold, the dome rounded
  const CR = [[18.45, 0.3, 2.95, 2.9], [18.7, 0.28, 3.0, 3.0], [19.0, 0.22, 2.95, 2.95], [19.3, 0.15, 2.8, 2.8], [19.6, 0.05, 2.55, 2.42], [19.9, -0.05, 2.2, 2.08], [20.15, -0.1, 1.7, 1.6], [20.3, -0.1, 1.0, 0.95]];
  for (let k = 0; k < CR.length - 1; k++) head([CR[k], CR[k + 1]].map(([y, cx, a, b]) => [y + (k ? 0 : 0), cx, a + 0.015, b + 0.015]), k % 2 ? 'paint_ochre' : 'egyptian_blue', 28);
  // the band across the brow, a plain fillet, and the painted brows and the cosmetic lines
  alongZ(Z9(-2.1, 2.1), (z) => [faceX(18.65, z) + 0.12, 18.65, 0.28, 0.17], 'egyptian_blue', 8);
  for (const sg of [-1, 1]) {
    alongZ(Z9(sg > 0 ? 0.35 : -1.95, sg > 0 ? 1.95 : -0.35), (z) => [faceX(18.0, z) + 0.05, 18.05 + 0.1 * (Math.abs(z) / 2), 0.2, 0.13], 'lacquer_black', 8);                  // the brow
    // the eye: a raised lidded almond, the white, the pupil, the paint drawn out toward the ear
    const ez = sg * 0.98;
    alongZ(Z9(ez - 0.46, ez + 0.46), (z) => { const q = 1 - Math.pow((z - ez) / 0.5, 2); return [faceX(17.55, z) + 0.04, 17.55 + 0.03 * (z - ez) * sg, 0.12 + 0.05 * q, 0.2 * Math.sqrt(Math.max(0.05, q))]; }, 'paint_robe', 8);
    alongZ(Z9(ez - 0.36, ez + 0.36), (z) => { const q = 1 - Math.pow((z - ez) / 0.4, 2); return [faceX(17.55, z) + 0.13, 17.55 + 0.03 * (z - ez) * sg, 0.04, 0.135 * Math.sqrt(Math.max(0.05, q))]; }, 'plaster_white', 8);
    alongZ(Z9(ez - 0.11, ez + 0.11), () => [faceX(17.55, ez) + 0.18, 17.55, 0.03, 0.11], 'lacquer_black', 8);
    alongZ(Z9(sg > 0 ? ez + 0.4 : ez - 1.0, sg > 0 ? ez + 1.0 : ez - 0.4), (z) => [faceX(17.6, z) + 0.06, 17.62, 0.05, 0.05], 'egyptian_blue', 6);
    // the cheek, full under the eye, and the nasolabial fold's rise to the lip
    alongZ(Z9(sg * 0.7 - 0.5, sg * 0.7 + 0.5), (z) => [faceX(16.6, z) + 0.0, 16.6, 0.2, 0.42], 'paint_robe', 8);
    // the ear, a curl of stone standing out beneath the headcloth, its rim and hollow
    for (const [dz, rx, ry, m] of [[0, 0.38, 0.85, 'paint_robe'], [0.07, 0.24, 0.62, 'lacquer_red']]) bag.add(m, loft([0.0, 0.25, 0.5].map((q, i) => { const r = []; for (let j = 0; j < 10; j++) { const t = j / 10 * Math.PI * 2; r.push([Hx + 0.3 + rx * Math.cos(t) * (1 - i * 0.12), F + 17.2 + ry * Math.sin(t) * (1 - i * 0.1), zc + sg * (2.05 + q + dz * i)]); } return r; })));
  }
  // the nose: a wedge from the brow to a rounded tip, the nostrils' flare at its base
  bag.add('paint_robe', loft([[17.8, 0.2, 0.45, 0.28], [17.2, 0.55, 0.7, 0.34], [16.7, 0.8, 0.85, 0.42], [16.35, 0.95, 0.95, 0.55], [16.1, 0.85, 0.8, 0.58]].map(([y, tip, a, b]) => ellipse(y, faceX(y, 0) - Hx + tip - a, a, b, 14))));
  // the lips: the upper full, the lower beneath it, the paint red, a groove between
  alongZ(Z9(-0.95, 0.95), (z) => [faceX(15.85, z) + 0.02 - 0.15 * Math.pow(z / 0.95, 2), 15.88, 0.2, 0.17], 'lacquer_red', 8);
  alongZ(Z9(-0.8, 0.8), (z) => [faceX(15.52, z) + 0.0 - 0.12 * Math.pow(z / 0.8, 2), 15.5, 0.2, 0.15], 'lacquer_red', 8);
  alongZ(Z9(-0.95, 0.95), (z) => [faceX(15.68, z) - 0.05, 15.68, 0.1, 0.035], 'lacquer_black', 6);
  // the chin, round, under the lower lip
  alongZ(Z9(-0.7, 0.7), (z) => [faceX(15.0, z) - 0.08, 15.0, 0.25, 0.3 * Math.sqrt(Math.max(0.1, 1 - Math.pow(z / 0.75, 2)))], 'paint_robe', 8);
  // the wings of the headcloth, flaring behind the ears, striped; the front edge sloping down to the shoulder
  for (const sg of [-1, 1]) {
    // (prisms of the section's rectangle, joined x to x: the top edge slopes without steps)
    const wing = (k) => { const x = Hx - 3.1 + k * 0.32, tp = Math.max(13.8, 18.9 - Math.max(0, x - (Hx + 0.1)) * 0.95), zo = 2.95 + 0.07 * k + (x > Hx + 0.1 ? 0.04 * (x - Hx) : 0); return [[F + 13.4, zc + sg * 1.95], [F + tp, zc + sg * 1.95], [F + tp, zc + sg * zo], [F + 13.4, zc + sg * zo]].map(([y, z]) => [x, y, z]); };
    for (let k = 0; k < 19; k++) bag.add(k % 2 ? 'paint_ochre' : 'egyptian_blue', loft([wing(k), wing(k + 1)]));
    // the lappet over the breast: a panel in a blue frame, pleated in fine bands, its lower end rounded off by the last bands
    const lz = zc + sg * 2.6;
    bag.add('egyptian_blue', box(Hx + 0.4, F + 8.9, lz - 0.72, Hx + 2.95, F + 14.0, lz + 0.72));
    for (let k = 0; k < 24; k++) bag.add(k % 2 ? 'paint_ochre' : 'plaster_white', box(Hx + 0.5, F + 9.1 + k * 0.2, lz - 0.6 + (k < 2 ? 0.2 * (2 - k) : 0), Hx + 3.0, F + 9.1 + k * 0.2 + 0.18, lz + 0.6 - (k < 2 ? 0.2 * (2 - k) : 0)));
  }
  // the ceremonial beard: plaited, tapering, its end curving forward, blue and gold; the straps up the cheeks
  {
    const rings = []; const N = 18;
    for (let i = 0; i <= N; i++) {
      const t = i / N, y = 14.8 - t * 3.1, x = Hx + 3.0 + 0.9 * t, w = 0.42 - 0.08 * t, d = 0.34 - 0.06 * t, k = 1 + (i % 2 ? 0.12 : -0.05), r = [];
      for (let j = 0; j < 8; j++) { const a = j / 8 * Math.PI * 2; r.push([x + d * k * Math.cos(a), F + y, zc + w * k * Math.sin(a)]); }
      rings.push(r);
    }
    bag.add('egyptian_blue', loft(rings));
    for (const sg of [-1, 1]) alongZ(Z9(0, 0), () => [0, 0, 0.001, 0.001], 'egyptian_blue', 4);
  }
  // the uraeus: the cobra reared on the brow, its hood spread, the head above, a coil behind; gilded
  {
    const fx = faceX(18.65, 0) + 0.15, hood = [[18.85, 0.1, 0.12, 0.2], [19.1, 0.0, 0.16, 0.34], [19.4, -0.05, 0.17, 0.4], [19.75, -0.12, 0.15, 0.3], [20.05, -0.2, 0.13, 0.16], [20.25, -0.3, 0.11, 0.12], [20.35, -0.42, 0.1, 0.11]];
    bag.add('gilt_bronze', loft(hood.map(([y, dx, a, b]) => ellipse(y, 0, 0.001, 0.001, 10).map((p, j) => { const t = j / 10 * Math.PI * 2; return [fx + dx + a * Math.cos(t), p[1], zc + b * Math.sin(t)]; }))));
    for (let k = 0; k < 2; k++) bag.add('gilt_bronze', loft([0, 0.35, 0.7, 1.0].map((q) => { const r = []; for (let j = 0; j < 8; j++) { const t = j / 8 * Math.PI * 2; r.push([fx - 0.5 - q * 0.9 + 0.1 * Math.cos(t), F + 19.2 + k * 0.45 - 0.2 * q + 0.1 * Math.sin(t), zc + (k ? 0.3 : -0.3) * Math.sin(q * 3)]); } return r; })));
  }
  // ── walking: the body's mass, in slices, and the paws ─────────────────────────────────────────────────────────
  for (let s = 0; s < 58; s += 4) { const hw = half(s + 2) * (s >= 52 ? 0.82 : 1); col.rect([S(s), zc - hw, S(s + 4), zc + hw], F - 0.5, F + top(s + 2) - 0.2); }
  col.rect([S(55.5) - 3.2, zc - 3.2, S(55.5) + 3.2, zc + 3.2], F, F + 20);
  for (const sg of [-1, 1]) col.rect([S(58), zc + sg * 2.5 - 1.9, S(70.5), zc + sg * 2.5 + 1.9], F - 0.5, F + 3.2);
}
