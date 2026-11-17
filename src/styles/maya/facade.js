// Facade carving of the Maya–Toltec buildings of Chichén Itzá (docs/settlements/chichen-itza.md §18): the framed panels of
// the pyramids' terraces, each with a stepped-fret (xicalcoliuhqui) relief on a painted field, and the stepped merlons of
// the temples' roofs. Built in the Kit's frame (x across, y up, z out of the wall) from closed boxes that only abut.

import { carved } from './meso.js';

const L = 'limestone_maya';

/** The stepped meander of a fret in a square of side s at (x0, y0): its path on a 4-unit grid, the stroke 1/3 unit; horizontals take the corners, verticals stop short. */
function fret(k, mat, x0, y0, s, z0, z1, flip = 1) {
  const u = s / 4, t = u / 3, P = [[0, 0], [0, 4], [4, 4], [4, 1], [1, 1], [1, 3], [3, 3], [3, 2], [2, 2]];
  const X = (a) => (flip > 0 ? x0 + a * u : x0 + s - a * u), Y = (b) => y0 + b * u;
  for (let i = 0; i + 1 < P.length; i++) {
    const [a, b] = P[i], [c, d] = P[i + 1];
    if (b === d) { const xa = X(Math.min(a, c) * 1) - (flip > 0 ? t / 2 : -t / 2), xb = X(Math.max(a, c)) + (flip > 0 ? t / 2 : -t / 2); k.bx(mat, Math.min(xa, xb), Math.max(xa, xb), Y(b) - t / 2, Y(b) + t / 2, z0, z1); }
    else { const xa = X(a) - t / 2, xb = X(a) + t / 2; k.bx(mat, Math.min(xa, xb), Math.max(xa, xb), Y(Math.min(b, d)) + t / 2, Y(Math.max(b, d)) - t / 2, z0, z1); }
  }
}

/**
 * A terrace panel w × h, its foot at y 0, facing +z: a stepped frame of two mouldings round a painted field carrying a pair
 * of mirrored frets (the fret is dropped when the field is too small for it).
 */
export function terracePanelKit(w, h) {
  return carved(`cz-panel:${w.toFixed(2)}:${h.toFixed(2)}`, (k) => {
    const t = 0.16, t2 = 0.1;
    k.bx(L, -w / 2, w / 2, 0, t, 0, 0.2); k.bx(L, -w / 2, w / 2, h - t, h, 0, 0.2);
    k.bx(L, -w / 2, -w / 2 + t, t, h - t, 0, 0.2); k.bx(L, w / 2 - t, w / 2, t, h - t, 0, 0.2);
    const i0 = t, iw = w / 2 - t, ih = h - t;
    k.bx(L, -iw, iw, i0, i0 + t2, 0, 0.1); k.bx(L, -iw, iw, ih - t2, ih, 0, 0.1);
    k.bx(L, -iw, -iw + t2, i0 + t2, ih - t2, 0, 0.1); k.bx(L, iw - t2, iw, i0 + t2, ih - t2, 0, 0.1);
    const fx = iw - t2, fy0 = i0 + t2, fy1 = ih - t2;
    k.bx('stucco_red', -fx, fx, fy0, fy1, 0, 0.03);
    const s = Math.min(fy1 - fy0 - 0.12, 0.8), rows = Math.max(1, Math.floor((fy1 - fy0 - 0.1) / (s + 0.12)));
    if (s > 0.3) {
      const n = Math.max(1, Math.floor((2 * fx) / (s * 1.5))), gy = (fy1 - fy0 - rows * s) / (rows + 1);
      for (let r = 0; r < rows; r++) for (let i = 0; i < n; i++) { const cx = -fx + (i + 0.5) * (2 * fx) / n; fret(k, L, cx - s / 2, fy0 + gy + r * (s + gy), s, 0.03, 0.09, (i + r) % 2 ? -1 : 1); }
    }
  });
}

/** A frieze panel for the temples (a deeper frame, a fret pair on a blue field), w × h. */
export function friezePanelKit(w, h) {
  return carved(`cz-frieze:${w.toFixed(2)}:${h.toFixed(2)}`, (k) => {
    const t = 0.14;
    k.bx(L, -w / 2, w / 2, 0, t, 0, 0.26); k.bx(L, -w / 2, w / 2, h - t, h, 0, 0.26);
    k.bx(L, -w / 2, -w / 2 + t, t, h - t, 0, 0.26); k.bx(L, w / 2 - t, w / 2, t, h - t, 0, 0.26);
    const fx = w / 2 - t, fy0 = t, fy1 = h - t;
    k.bx('maya_blue', -fx, fx, fy0, fy1, 0, 0.04);
    const s = fy1 - fy0 - 0.16;
    for (const sx of [-1, 1]) fret(k, L, sx * (fx * 0.5) - s / 2, fy0 + 0.08, s, 0.04, 0.12, sx);
  });
}

/** The cap of a temple's roof wall: a stepped merlon 0.64 wide, 1.1 high, 0.4 deep, centred at the origin, its foot at y 0 (facing +z). */
export function merlonKit() {
  return carved('cz-merlon', (k) => {
    k.bx('stucco', -0.32, 0.32, 0, 0.36, -0.2, 0.2); k.bx('stucco', -0.24, 0.24, 0.36, 0.72, -0.2, 0.2); k.bx('stucco', -0.14, 0.14, 0.72, 1.1, -0.2, 0.2);
  });
}
