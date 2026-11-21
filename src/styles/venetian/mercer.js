// The Merceria's two rows of houses (docs/settlements/venice.md §5h): the street 5.4 m between them, a shop at the foot of every house (the rooms are
// shops.js's `shopShell` with the front wall on the street, P = 0; what stands in them is `ven_shopfit` with the same P), the mezzanine's small windows,
// two floors of windows over it, the cornice, the pitched roof with its funnel chimneys. The windows' shutters stand open or shut by a hash of the window's
// own place; the open ones are lit at night (halo material, night only): the Merceria's tall fronts glow by the lamps of the rooms behind them.
// ven_mercer { y, rows: [{ rect, front ('e' | 'w'), shops: [{ i, trade, seed }] }] }. Local frame as faceFrame: u along the front, y up, d out of it.

import { lathe } from '../../core/geom.js';
import { Local, faceFrame, wrect, ext, archOutline } from '../renaissance/face.js';
import { shopShell, shopSlots, YA } from './shops.js';
import { Halo, hashAt } from './halo.js';
import { BufferGeometry, Float32BufferAttribute } from '../../core/three.js';

const PL = 'plaster_white', I = 'limestone', STUCCO = ['stucco_venice', 'stucco_rose', 'limewash_red', 'stucco_ochre', 'stucco_cream', 'stucco_siena'];
const F1 = 5.6, F2 = 9.0, TOP = 12.4, HMAX = 13.4;

/** A prism whose section (d, y) is the roof's triangle, run along u from 0 to L (ridge along u), normals out. */
function ridgeRoof(L, d0, d1, y0, rise) {
  const dm = (d0 + d1) / 2, A = [d1, y0], B = [dm, y0 + rise], C = [d0, y0], t = [];
  const v = (p, u) => [u, p[1], p[0]];
  // slopes (front: toward +d; rear), the two gable ends, the underside
  t.push(...v(A, 0), ...v(B, 0), ...v(B, L), ...v(A, 0), ...v(B, L), ...v(A, L));
  t.push(...v(B, 0), ...v(C, 0), ...v(C, L), ...v(B, 0), ...v(C, L), ...v(B, L));
  t.push(...v(A, 0), ...v(A, L), ...v(B, 0), ...v(B, 0), ...v(A, L), ...v(B, L));        // (replaced below: ends)
  t.length = 36;
  t.push(...v(A, 0), ...v(C, 0), ...v(B, 0), ...v(A, L), ...v(B, L), ...v(C, L));
  t.push(...v(A, 0), ...v(A, L), ...v(C, L), ...v(A, 0), ...v(C, L), ...v(C, 0));
  // orient every triangle away from the section's middle
  const cx = L / 2, cy = y0 + rise / 3, cz = dm;
  for (let i = 0; i < t.length; i += 9) {
    const ax = t[i + 3] - t[i], ay = t[i + 4] - t[i + 1], az = t[i + 5] - t[i + 2], bx = t[i + 6] - t[i], by = t[i + 7] - t[i + 1], bz = t[i + 8] - t[i + 2];
    const nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
    const mx = (t[i] + t[i + 3] + t[i + 6]) / 3 - cx, my = (t[i + 1] + t[i + 4] + t[i + 7]) / 3 - cy, mz = (t[i + 2] + t[i + 5] + t[i + 8]) / 3 - cz;
    if (nx * mx + ny * my + nz * mz < 0) for (let k = 0; k < 3; k++) { const q = t[i + 3 + k]; t[i + 3 + k] = t[i + 6 + k]; t[i + 6 + k] = q; }
  }
  const pos = new Float32Array(t), nor = new Float32Array(t.length);
  for (let i = 0; i < t.length; i += 9) {
    const ax = t[i + 3] - t[i], ay = t[i + 4] - t[i + 1], az = t[i + 5] - t[i + 2], bx = t[i + 6] - t[i], by = t[i + 7] - t[i + 1], bz = t[i + 8] - t[i + 2];
    let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    for (let k = 0; k < 3; k++) { nor[i + 3 * k] = nx; nor[i + 3 * k + 1] = ny; nor[i + 3 * k + 2] = nz; }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new Float32BufferAttribute(nor, 3));
  return g;
}

export function venMercer(el, { bag, col }) {
  const y = el.y ?? 0, H = new Halo();
  for (const row of el.rows) {
    const rect = row.rect, [x0, z0, x1, z1] = rect, { M: FM, L } = faceFrame(rect, row.front, y), D = row.front === 'n' || row.front === 's' ? z1 - z0 : x1 - x0;
    const n = Math.max(2, Math.round(L / 3.1)), bay = L / n, slots = shopSlots(L, n, row.shops), opened = new Set(slots.flatMap((s) => [s.i, s.i + 1]));
    const e = FM.elements, ux = e[0], uz = e[2], nd = [e[8], e[10]];
    const Wp = (u, yy, d) => [e[12] + e[0] * u + e[4] * yy + e[8] * d, e[13] + e[1] * u + e[5] * yy + e[9] * d, e[14] + e[2] * u + e[6] * yy + e[10] * d];
    // the rooms of the shops (the ground storey and its mezzanine's floor), the walls round them
    const Sh = new Local(); shopShell(Sh, col, FM, y, L, D, HMAX, slots, 0); Sh.emit(bag, FM);
    const Lc = new Local();
    // the body over the mezzanine: one block, the street face dressed in a stucco of its own for each house (a house = two bays)
    Lc.box(PL, 0, YA, -D, L, TOP, 0);
    const nh = Math.floor(n / 2);
    for (let k = 0; k < nh; k++) {
      const a = 2 * k * bay, b = k === nh - 1 ? L : (2 * k + 2) * bay, wx = Wp((a + b) / 2, 0, 0);
      Lc.box(STUCCO[Math.floor(hashAt(wx[0], wx[2], 31) * STUCCO.length)], a, YA, 0.02, b, TOP, 0.07);
    }
    // the string course over the mezzanine, the floors' courses, the cornice
    Lc.box(I, -0.04, YA - 0.1, 0, L + 0.04, YA + 0.16, 0.16);
    Lc.box(I, -0.02, F2 - 0.12, 0, L + 0.02, F2 + 0.04, 0.1);
    Lc.box(I, -0.06, TOP - 0.4, 0, L + 0.06, TOP + 0.04, 0.34);
    // the mezzanine: a small square window over each shop's bays, the house door of the bay that is no shop
    for (let i = 0; i < n; i++) {
      const uc = (i + 0.5) * bay, w = Wp(uc, 0, 0), h1 = hashAt(w[0], w[2], 41);
      Lc.box(I, uc - 0.42, 4.0, 0, uc + 0.42, 4.08, 0.14);
      Lc.box('glass_outer', uc - 0.3, 4.1, 0.0, uc + 0.3, 4.75, 0.085);
      for (const sg of [-1, 1]) Lc.box(I, uc + sg * 0.34 - 0.04, 4.08, 0, uc + sg * 0.34 + 0.04, 4.8, 0.1);
      Lc.box(I, uc - 0.4, 4.78, 0, uc + 0.4, 4.88, 0.1);
      if (h1 < 0.4) { const p = Wp(uc, 4.45, 0.07); H.quad(Wp(uc - 0.3, 4.1, 0.07), Wp(uc + 0.3, 4.1, 0.07), Wp(uc + 0.3, 4.75, 0.07), Wp(uc - 0.3, 4.75, 0.07), nd, 0.4); void p; }
      if (!opened.has(i)) {
        Lc.box('wood_dark', uc - 0.6, 0.05, 0, uc + 0.6, 2.45, 0.06); Lc.box(I, uc - 0.74, 0, 0, uc - 0.6, 2.6, 0.12); Lc.box(I, uc + 0.6, 0, 0, uc + 0.74, 2.6, 0.12); Lc.box(I, uc - 0.74, 2.45, 0, uc + 0.74, 2.62, 0.14);
        Lc.box(I, uc - 0.8, -0.02, 0, uc + 0.8, 0.06, 0.34);
      }
    }
    // the windows of the two floors, one in each bay; the shutter open at the side or shut across it; the open ones lit at night
    const ropes = [[F1, 1.0, 2.1, 0.58], [F2, 0.9, 1.8, 0.45]];
    for (let f = 0; f < 2; f++) for (let i = 0; i < n; i++) {
      const [fy, ww, wh, lit] = ropes[f], uc = (i + 0.5) * bay, wy = fy + 0.75, w = Wp(uc, wy, 0), hs = hashAt(w[0], w[2], 50 + f), round = f === 0 && hs < 0.35;
      const yTop = round ? wy + wh - ww / 2 : wy + wh;
      if (round) Lc.add('glass_outer', ext(archOutline(uc, wy, ww, yTop, 'round', 4), [], 0.03, 0.085));
      else Lc.box('glass_outer', uc - ww / 2, wy, 0.0, uc + ww / 2, wy + wh, 0.085);
      for (const sg of [-1, 1]) Lc.box(I, uc + sg * (ww / 2 + 0.05) - 0.07, wy - 0.02, 0, uc + sg * (ww / 2 + 0.05) + 0.07, wy + wh, 0.1);
      if (round) Lc.add(I, ext(archOutline(uc, wy + wh - ww / 2 - 0.1, ww + 0.28, wy + wh - ww / 2 - 0.1, 'round', 4).slice(2), [], 0.0, 0.1));
      else Lc.box(I, uc - ww / 2 - 0.15, wy + wh, 0, uc + ww / 2 + 0.15, wy + wh + 0.14, 0.12);
      Lc.box(I, uc - ww / 2 - 0.2, wy - 0.12, 0, uc + ww / 2 + 0.2, wy - 0.02, 0.2);
      const st = hashAt(w[0], w[2], 60 + f), mid = Lc.box('wood_dark', uc - 0.015, wy, 0.085, uc + 0.015, wy + wh * (round ? 0.8 : 1), 0.1);   // (the casement's bar)
      void mid;
      if (st < lit) {                                                  // open shutters at the sides, the room lit behind the glass
        for (const sg of [-1, 1]) Lc.box('shutter_green', uc + sg * (ww / 2 + 0.2) - 0.22, wy, 0.1, uc + sg * (ww / 2 + 0.2) + 0.22, wy + wh * (round ? 0.82 : 1), 0.14);
        const q = round ? 0.82 : 1, p = (u, v, d) => Wp(u, v, d);
        H.quad(p(uc - ww / 2, wy, 0.1), p(uc + ww / 2, wy, 0.1), p(uc + ww / 2, wy + wh * q, 0.1), p(uc - ww / 2, wy + wh * q, 0.1), nd, 0.5);
        H.disc(p(uc, wy + wh / 2, 0.14), [ux, 0, uz], [0, 1, 0], 1.25, 1.35, nd, 8, [0.42, 0], [0, 1]);
      } else if (st < 0.8) {
        for (const sg of [-1, 1]) Lc.box('shutter_green', uc + sg * (ww / 2 + 0.2) - 0.22, wy, 0.1, uc + sg * (ww / 2 + 0.2) + 0.22, wy + wh * (round ? 0.82 : 1), 0.14);
      } else Lc.box('shutter_green', uc - ww / 2 - 0.02, wy, 0.1, uc + ww / 2 + 0.02, wy + wh * (round ? 0.82 : 1), 0.14);
    }
    // the roof: a ridge along the street, the eaves over the cornice, a funnel chimney to each house
    const rise = (D / 2 + 0.35) * Math.tan(23 * Math.PI / 180), g = ridgeRoof(L, -D - 0.1, 0.4, TOP + 0.05, rise);
    Lc.add('roof_tile', g);
    for (let k = 0; k < nh; k++) {
      const uc = (2 * k + 1.3) * bay, dc = -D * 0.55, base = TOP + 0.05 + rise * 0.7;
      Lc.add(PL, lathe([[0.34, 0], [0.34, 1.0], [0.52, 1.45], [0.52, 1.6], [0.001, 1.6]], 8, null, uc, base, dc));
    }
    Lc.emit(bag, FM);
    void wrect;
  }
  H.flush(bag);
}
