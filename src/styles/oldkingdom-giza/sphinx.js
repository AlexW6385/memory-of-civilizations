// The Great Sphinx, modelled (docs/settlements/giza.md §10, §18): a lion lying in its pit: the body with its ribs, shoulders and the
// haunches with the folded hind legs and their paws, the tail along the flank, the two forelegs 15 m long with elbows, wrists and
// paws with four toes and their claws; the king's head with the face (brow ridge, lidded eyes with the cosmetic lines, nose with
// its wings, lips, chin, cheeks, ears), the striped nemes with its wings and pleated lappets, the plaited beard, the gilded cobra.
// All in rounded, lofted volumes (the nabataean sculpting kit: one geometry per material). Element: ok_sphinx { x0 (the tail's end),
// z (the axis), floor (the pit's floor, y), len }; along +x, the face east.

import { box } from '../../core/geom.js';
import { Sculpt, blob, blobDir, tube, add, hash3 } from '../nabataean/sculpt.js';

const prof = (pts) => (s) => {
  if (s <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (s <= pts[i][0]) { const [a, va] = pts[i - 1], [b, vb] = pts[i], t = (s - a) / (b - a); return va + (vb - va) * t * t * (3 - 2 * t); }
  return pts[pts.length - 1][1];
};
const spow = (v, k) => Math.sign(v) * Math.pow(Math.abs(v), k);

export function sphinx(el, { bag, col }) {
  const x0 = el.x0, zc = el.z, F = el.floor, k73 = (el.len ?? 73) / 73, S = (s) => x0 + s * k73;
  const mk = () => new Sculpt();
  const O = { ochre: mk(), stone: mk(), skin: mk(), blue: mk(), gold: mk(), white: mk(), black: mk(), red: mk(), gilt: mk() };
  const MAT = { ochre: 'paint_ochre', stone: 'limestone_core', skin: 'paint_robe', blue: 'egyptian_blue', gold: 'paint_ochre', white: 'plaster_white', black: 'lacquer_black', red: 'lacquer_red', gilt: 'gilt_bronze' };
  const top = prof([[0, 2.2], [3, 6.5], [9, 11.4], [14, 11.6], [26, 10.4], [38, 10.1], [46, 11.2], [52, 12.6], [58, 14.0]]);
  const half = prof([[0, 1.4], [3, 6.2], [9, 9.4], [13, 9.5], [20, 8.2], [32, 6.2], [44, 5.5], [52, 5.0], [58, 4.3]]);
  const secs = (fn, s0, s1, n) => Array.from({ length: n + 1 }, (_, i) => fn(s0 + (s1 - s0) * i / n));
  // ── the body: a squared oval from the tail to the chest; the ribs' swell, the shoulders' rise, the spine's dip ───────
  const rowAt = (s) => {
    const T = top(s), W = half(s) * (1 + 0.035 * Math.sin(s * 1.3) * (s > 22 && s < 50 ? 1 : 0)), r = [], N = 30, yc = F + T / 2 - 0.15, hh = T / 2 + 0.15;
    const sho = Math.exp(-Math.pow((s - 46) / 4.5, 2)) * 0.5;
    for (let j = 0; j < N; j++) { const t = j / N * Math.PI * 2, c = Math.cos(t), sn = Math.sin(t); r.push([S(s), yc + hh * spow(sn, 0.8) + (sn > 0 ? sho * Math.abs(c) : 0), zc + W * spow(c, 0.72)]); }
    return r;
  };
  O.ochre.grid(secs(rowAt, 0, 58, 40), {});
  // the bedrock's ledges: the hard layers of the knoll standing out of the painted body in bands, the paint flaked from them
  const zsAt = (ys) => Math.pow(Math.max(0, 1 - Math.pow(Math.abs(ys), 2.5)), 0.36);
  for (const [ya, yb] of [[1.5, 1.95], [3.1, 3.5], [4.9, 5.4], [6.6, 7.0], [8.0, 8.3]]) {
    const ring = (s) => {
      const T = top(s), W = half(s), yc = F + T / 2 - 0.15, hh = T / 2 + 0.15, d = 0.16, r = [];
      if (yb + 1.2 > T) return null;
      const lv = [ya, (ya + yb) / 2, yb];
      for (const y of lv) { const ys = (F + y - yc) / hh; r.push([S(s), F + y, zc + (W * zsAt(ys) + d)]); }
      for (const y of lv.slice().reverse()) { const ys = (F + y - yc) / hh; r.push([S(s), F + y, zc - (W * zsAt(ys) + d)]); }
      return r;
    };
    const rs = secs((s) => s, 11, 51, 16).map(ring).filter(Boolean);
    if (rs.length > 3) O.stone.grid(rs, { wrap: false, face: [0, 0, 0] });
  }
  // the rock the body rises out of: a course or two of the knoll left unpainted at its foot
  for (const [s0, s1, w, h] of [[2, 30, 10.4, 1.3], [26, 52, 7.4, 1.0], [8, 20, 11.2, 0.55]]) O.stone.box(S(s0), F - 0.3, zc - w, S(s1), F + h, zc + w);
  // ── the haunches, the folded hind legs and their paws, the tail ────────────────────────────────────────────────────
  for (const sg of [-1, 1]) {
    const hz = zc + sg * 8.3;
    blobDir(O.ochre, [S(11), F + 5.2, hz], [1, 0.25, 0], 6.8, 5.2, 2.5, [0, 1, 0], 8, 16);                   // the thigh's great muscle
    blobDir(O.ochre, [S(9.5), F + 7.0, zc + sg * 7.2], [1, 0.4, 0], 4.2, 3.0, 2.2, [0, 1, 0], 5, 12);           // the rump, rising to the loin
    tube(O.ochre, [[S(9), F + 3.2, hz + sg * 0.9, 2.3, 2.0], [S(15), F + 2.3, hz + sg * 1.0, 1.7, 1.7], [S(19), F + 1.5, hz + sg * 0.8, 1.2, 1.3], [S(22.5), F + 1.15, hz + sg * 0.7, 1.15, 1.0]], { seg: 14, sub: 3, ref: [0, 0, 1] });   // shin and hock
    blobDir(O.ochre, [S(21.5), F + 0.55, hz + sg * 0.7], [1, 0, 0], 2.3, 0.85, 1.2, [0, 1, 0], 4, 12);             // the hind paw, lying
    for (let k = 0; k < 3; k++) blobDir(O.ochre, [S(24.1), F + 0.36, hz + sg * 0.7 + (k - 1) * 0.72], [1, 0, 0], 0.95, 0.4, 0.34, [0, 1, 0], 3, 8);   // its toes
  }
  {
    const path = [[1.2, 3.0, -0.4], [1.0, 4.2, -2.2], [2.0, 5.6, -4.4], [4.0, 5.4, -6.0], [7.0, 4.4, -7.4], [10.0, 3.6, -8.0], [12.5, 3.0, -8.4]];
    tube(O.ochre, path.map(([s, y, dz], i) => [S(s), F + y, zc + dz, 0.6 - i * 0.02, 0.6 - i * 0.02]), { seg: 12, sub: 3, ref: [0, 0, 1] });
    blob(O.ochre, [S(13.2), F + 2.85, zc - 8.5], [1.0, 0.6, 0.8], 4, 10);                                   // the tuft at its end
  }
  // ── the forelegs: shoulder, elbow, forearm, wrist, paw with four toes and their claws ───────────────────────────────
  for (const sg of [-1, 1]) {
    const lz = zc + sg * 2.5;
    tube(O.ochre, [[S(41), F + 5.5, lz, 2.0, 2.6], [S(46), F + 4.2, lz + sg * 0.1, 1.95, 2.55], [S(52), F + 3.4, lz, 1.75, 2.15], [S(58), F + 2.9, lz, 1.6, 1.75], [S(64), F + 2.0, lz, 1.55, 1.45], [S(67.5), F + 1.35, lz, 1.7, 1.2]], { seg: 16, sub: 4, ref: [0, 0, 1] });
    blob(O.ochre, [S(45.4), F + 3.4, lz + sg * 1.7], [1.7, 1.6, 0.9], 4, 12);                               // the elbow standing out
    blob(O.ochre, [S(62.4), F + 2.2, lz + sg * 1.0], [1.2, 1.0, 0.8], 3, 10);                               // the wrist's bone
    blobDir(O.ochre, [S(69.6), F + 0.85, lz], [1, 0, 0], 3.2, 0.9, 1.9, [0, 1, 0], 6, 14);                  // the paw's pad
    for (let k = 0; k < 4; k++) {
      const tz = lz + (k - 1.5) * 0.82, tl = k === 0 || k === 3 ? 2.3 : 2.7, tx = S(70.4 + tl / 2);
      blobDir(O.ochre, [tx, F + 0.55, tz], [1, -0.04, 0], tl / 2 + 0.2, 0.46, 0.5, [0, 1, 0], 5, 10);       // the toe, rounded
      blobDir(O.stone, [S(70.4 + tl + 0.1), F + 0.28, tz], [1, -0.2, 0], 0.32, 0.2, 0.24, [0, 1, 0], 2, 6);   // its claw
      if (k) tube(O.black, [[S(72), F + 0.5, tz - 0.41, 0.02], [S(69.4), F + 0.55, tz - 0.41, 0.02]], { seg: 4, sub: 1, capN: 1 });   // the groove between the toes
    }
  }
  // ── the head, built in its own frame: lat (across), y (up from the floor), w (forward, east) from the shoulder's line ─────
  const Hx = S(55.5);
  for (const s of Object.values(O)) s.xf = ([lx, ly, lw]) => [Hx + lw, F + ly, zc + lx];
  const wX = (s) => s;                                                                                         // (the frame is only borrowed for the head)
  void wX;
  const FY = 16.5, surf = (lat, y) => 1.0 + 2.4 * Math.sqrt(Math.max(0, 1 - Math.pow((y - FY) / 2.35, 2) - Math.pow(lat / 2.0, 2)));
  const Pt = (lat, y, d = 0, r = 0.1) => [lat, y, surf(lat, y) + d, r];
  // the neck and the shoulders' column, the face, the jaw, the cheekbones
  tube(O.ochre, [[0, 11.0, -0.6, 3.5, 3.5], [0, 13.0, -0.2, 3.1, 3.3], [0, 14.4, 0.4, 2.5, 2.7], [0, 15.2, 0.9, 2.0, 2.3]], { seg: 20, sub: 3, ref: [1, 0, 0] });
  blob(O.skin, [0, 16.5, 1.0], [2.0, 2.35, 2.4], 8, 22);
  blob(O.skin, [0, 15.35, 0.95], [1.72, 1.0, 2.05], 5, 16);
  blob(O.skin, [0, 14.75, 2.7], [0.7, 0.5, 0.55], 3, 10);                                                    // the chin
  for (const sg of [-1, 1]) {
    blob(O.skin, [sg * 1.25, 16.75, 2.35], [0.8, 0.6, 0.62], 4, 10);                                         // the cheekbone
    blob(O.skin, [sg * 0.95, 15.8, 2.6], [0.45, 0.42, 0.4], 3, 8);                                          // the cheek's fold beside the mouth
    // the ear, a curl of stone beneath the headcloth, its rim
    blob(O.skin, [sg * 2.1, 17.0, 0.5], [0.24, 0.92, 0.52], 4, 10);
    blob(O.red, [sg * 2.22, 17.0, 0.55], [0.1, 0.6, 0.32], 3, 8);
    // the brow ridge, the lids, the eyeball and its iris, the cosmetic line drawn to the temple
    const ex = sg * 0.95, ey = 17.45;
    tube(O.skin, [Pt(sg * 0.3, 17.95, 0.12, 0.2), Pt(sg * 0.9, 18.1, 0.13, 0.24), Pt(sg * 1.55, 17.9, 0.1, 0.18)], { seg: 8, sub: 3, capN: 1, ref: [0, 1, 0] });
    tube(O.black, [Pt(sg * 0.32, 18.06, 0.2, 0.07), Pt(sg * 0.9, 18.22, 0.22, 0.08), Pt(sg * 1.6, 18.0, 0.18, 0.06)], { seg: 6, sub: 3, capN: 1, ref: [0, 1, 0] });   // the painted brow
    blob(O.white, [ex, ey, surf(ex, ey) - 0.02], [0.43, 0.2, 0.16], 4, 10);                                  // the eye, an almond
    blob(O.black, [ex + sg * 0.02, ey - 0.01, surf(ex, ey) + 0.09], [0.15, 0.15, 0.06], 3, 8);               // the iris
    tube(O.skin, [Pt(ex - 0.5, ey + 0.1, 0.09, 0.05), Pt(ex, ey + 0.26, 0.1, 0.07), Pt(ex + 0.5, ey + 0.1, 0.09, 0.05)], { seg: 6, sub: 3, capN: 1, ref: [0, 1, 0] });       // the upper lid
    tube(O.skin, [Pt(ex - 0.45, ey - 0.07, 0.07, 0.04), Pt(ex, ey - 0.2, 0.08, 0.06), Pt(ex + 0.45, ey - 0.07, 0.07, 0.04)], { seg: 6, sub: 3, capN: 1, ref: [0, 1, 0] });    // the lower lid
    tube(O.blue, [Pt(ex + sg * 0.45, ey + 0.02, 0.12, 0.06), Pt(ex + sg * 1.0, ey - 0.06, 0.12, 0.06), Pt(ex + sg * 1.4, ey - 0.16, 0.1, 0.05)], { seg: 5, sub: 2, capN: 1, ref: [0, 1, 0] });   // the cosmetic line
    blob(O.skin, [sg * 0.5, 15.95, 3.5], [0.32, 0.22, 0.2], 2, 7);                                           // the nostril's wing
  }
  tube(O.skin, [[0, 17.7, surf(0, 17.7) + 0.05, 0.28, 0.3], [0, 16.9, surf(0, 16.9) + 0.35, 0.34, 0.34], [0, 16.2, 3.78, 0.4, 0.4]], { seg: 10, sub: 3, ref: [1, 0, 0] });   // the bridge
  blob(O.skin, [0, 16.0, 3.8], [0.5, 0.42, 0.46], 4, 10);                                                    // the nose's tip
  const lip = (y, half, th, dz, mat) => tube(O[mat], Array.from({ length: 7 }, (_, i) => { const t = -1 + i / 3, l = t * half; return [l, y - 0.12 * t * t, surf(l, y - 0.12 * t * t) + dz, th, th * 0.8]; }), { seg: 8, sub: 2, ref: [0, 1, 0] });
  lip(15.62, 0.98, 0.17, 0.1, 'red'); lip(15.27, 0.82, 0.19, 0.08, 'red');                                  // the upper and the lower lip
  tube(O.black, Array.from({ length: 7 }, (_, i) => { const t = -1 + i / 3, l = t * 1.0; return [l, 15.45 - 0.07 * t * t, surf(l, 15.45) + 0.08, 0.04]; }), { seg: 4, sub: 2, capN: 1 });   // the line of the mouth
  // the headcloth: the crown in stripes of blue and gold, the dome rounded, the fillet across the brow
  const CR = [[18.45, 0.3, 2.95, 2.9], [18.7, 0.28, 3.0, 3.0], [19.0, 0.22, 2.95, 2.95], [19.3, 0.15, 2.8, 2.8], [19.6, 0.05, 2.55, 2.42], [19.9, -0.05, 2.2, 2.08], [20.15, -0.1, 1.7, 1.6], [20.35, -0.1, 0.9, 0.85]];
  const ringAt = ([y, cx, a, b], sc = 1, n = 32) => Array.from({ length: n }, (_, j) => { const t = j / n * Math.PI * 2; return [b * sc * Math.sin(t), y, cx + a * sc * Math.cos(t)]; });
  for (let k = 0; k < CR.length - 1; k++) {
    const mid = CR[k].map((v, i) => (v + CR[k + 1][i]) / 2);
    (k % 2 ? O.gold : O.blue).grid([ringAt(CR[k], 1.0), ringAt(mid, 1.035), ringAt(CR[k + 1], 1.0)], {});
  }
  tube(O.blue, Array.from({ length: 9 }, (_, i) => { const l = -2.0 + i * 0.5; return [l, 18.62, surf(l, 18.62) + 0.1, 0.17, 0.26]; }), { seg: 8, sub: 2, ref: [0, 1, 0] });
  // the wings of the headcloth, flaring behind the ears, striped; their front edge sloping down to the shoulder
  for (const sg of [-1, 1]) {
    for (let k = 0; k < 20; k++) {
      const w = -3.1 + k * 0.32, tp = Math.max(13.8, 18.9 - Math.max(0, w - 0.1) * 0.95), lc = 2.45 + 0.04 * k + (w > 0.1 ? 0.04 * w : 0);
      tube(k % 2 ? O.gold : O.blue, [[sg * lc, 13.4, w, 0.52, 0.17], [sg * lc, (13.4 + tp) / 2, w, 0.52, 0.17], [sg * lc, tp, w, 0.5, 0.16]], { seg: 8, sub: 2, ref: [1, 0, 0], capN: 2 });
    }
    // the lappet over the breast: a panel in a blue frame, pleated in fine bands of gold and white
    const lz = sg * 2.6;
    O.blue.box(lz - 0.8, 8.8, 0.35, lz + 0.8, 14.0, 3.05);
    for (let k = 0; k < 25; k++) tube(k % 2 ? O.gold : O.white, [[lz, 9.1 + k * 0.195, 0.55, 0.095, 0.7], [lz, 9.1 + k * 0.195 + 0.008 * (k % 3), 1.8, 0.095, 0.7], [lz, 9.1 + k * 0.195, 3.15, 0.095, 0.68]], { seg: 6, sub: 1, ref: [0, 1, 0], capN: 1 });
  }
  // the ceremonial beard: plaited, tapering, its end curving forward; the straps up the cheeks
  tube(O.blue, Array.from({ length: 12 }, (_, i) => { const t = i / 11; return [0, 14.6 - t * 3.0, 3.0 + 0.9 * t, 0.27 - 0.06 * t, 0.22 - 0.05 * t]; }), { seg: 8, sub: 3, ref: [1, 0, 0], fold: (t) => 1 + 0.1 * Math.sin(t * 60) });
  for (const sg of [-1, 1]) tube(O.blue, [[sg * 1.5, 17.0, surf(sg * 1.5, 17.0) + 0.05, 0.1], [sg * 1.25, 15.4, surf(sg * 1.25, 15.4) + 0.05, 0.1], [sg * 0.5, 14.8, 3.05, 0.1]], { seg: 5, sub: 2, capN: 1 });
  // the uraeus: the cobra reared on the brow, its hood spread, the head above, two coils behind; gilded
  blobDir(O.gilt, [0, 19.45, 3.32], [0, 1, 0], 0.55, 0.38, 0.1, [1, 0, 0], 5, 12);
  blob(O.gilt, [0, 20.2, 3.42], [0.17, 0.2, 0.2], 3, 8);
  tube(O.gilt, [[0, 18.7, 3.3, 0.14, 0.12], [0, 19.0, 3.34, 0.13, 0.12]], { seg: 6, sub: 1, capN: 1 });
  for (let k = 0; k < 2; k++) tube(O.gilt, [[0, 19.2 + k * 0.45, 3.0, 0.11, 0.1], [0.35 * (k ? 1 : -1), 19.25 + k * 0.45, 2.4, 0.1, 0.1], [0, 19.3 + k * 0.45, 1.9, 0.1, 0.1]], { seg: 6, sub: 2, capN: 1 });
  for (const [k, g] of Object.entries(O)) if (g.triangles) bag.add(MAT[k], g.geometry());
  void add; void hash3; void box;
  // ── walking: the body's mass, in slices, and the paws ─────────────────────────────────────────────────────────
  for (let s = 0; s < 58; s += 4) { const hw = half(s + 2) * (s >= 52 ? 0.82 : 1); col.rect([S(s), zc - hw, S(s + 4), zc + hw], F - 0.5, F + top(s + 2) - 0.2); }
  col.rect([S(55.5) - 3.2, zc - 3.2, S(55.5) + 3.2, zc + 3.2], F, F + 20);
  for (const sg of [-1, 1]) col.rect([S(58), zc + sg * 2.5 - 1.9, S(70.5), zc + sg * 2.5 + 1.9], F - 0.5, F + 3.2);
}
