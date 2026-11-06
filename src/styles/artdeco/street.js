// The street and the yard in 1931 (docs/settlements/new-york.md §1d): washing on lines strung on pulleys from the
// tenements' back windows to a tall pole in the yard; the newsstand at the corner, a wooden booth under a sloping
// roof, the day's papers stacked on its counter and magazines pegged up its sides.

import { box, rod, lathe } from '../../core/geom.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const WASH = ['cloth_white', 'linen', 'cloth_white', 'cloth_indigo', 'cloth_red', 'cloth_grey', 'linen', 'cloth_ochre'];

/** laundry: { pole: [x, z], y (ground), h (pole height), lines: [[x, y, z]] (the window ends), seed } — each line from its window to a pulley on the pole, sagging, washing pegged along it. */
export function laundry(el, { bag, col }) {
  const [px, pz] = el.pole, y = el.y ?? 0, H = el.h ?? 14, rand = rng(el.seed || 7);
  bag.add('timber', lathe([[0.13, 0], [0.12, H * 0.6], [0.09, H], [0.001, H + 0.05]], 8, null, px, y - 0.3, pz)); col.circle(px, pz, 0.15, y, y + H);
  for (const [wx, wy, wz] of el.lines) {
    const py = Math.min(wy + 1.5, y + H - 0.4), A = [wx, wy, wz], B = [px, py, pz], L = Math.hypot(B[0] - A[0], B[2] - A[2]), sag = 0.04 * L;
    bag.add('iron', box(px - 0.18, py - 0.06, pz - 0.06, px + 0.18, py + 0.06, pz + 0.06));            // the pulley's arm
    bag.add('iron', lathe([[0.001, -0.08], [0.09, -0.06], [0.09, 0.06], [0.001, 0.08]], 8, null, wx, wy, wz));   // the window pulley
    const P = (t) => [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t - sag * 4 * t * (1 - t), A[2] + (B[2] - A[2]) * t];
    for (const off of [0, -0.12]) for (let k = 0; k < 8; k++) { const a = P(k / 8), b = P((k + 1) / 8); bag.add('linen', rod([a[0], a[1] + off, a[2]], [b[0], b[1] + off, b[2]], 0.008, 3)); }
    // the washing: sheets, shirts and smaller things, hanging square to the line
    const dx = (B[0] - A[0]) / L, dz = (B[2] - A[2]) / L;
    for (let t = 0.08; t < 0.92;) {
      const w = 0.3 + rand() * (rand() < 0.2 ? 1.1 : 0.45), hh = w > 0.9 ? 1.1 + rand() * 0.5 : 0.4 + rand() * 0.45, dt = w / L, c = P(t + dt / 2);
      if (t + dt > 0.92) break;
      const g = box(-w / 2, -hh, -0.012, w / 2, 0, 0.012);
      g.rotateY(-Math.atan2(dz, dx)); g.translate(c[0], c[1], c[2]);
      bag.add(WASH[Math.floor(rand() * WASH.length)], g);
      t += dt + 0.02 + rand() * 0.06;
    }
  }
}
/** newsstand: { at: [x, z], y, rot (the counter faces +z turned by rot) } */
export function newsstand(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, parts = [], rand = rng(el.seed || 3);
  const B = (m, x0, y0, z0, x1, y1, z1) => parts.push([m, box(x0, y0, z0, x1, y1, z1)]);
  B('shutter_green', -1.2, 0, -0.6, 1.2, 0.95, 0.5);                         // the counter's base
  B('shutter_green', -1.2, 0, -0.6, 1.2, 2.3, -0.5);                         // the back wall
  for (const s of [-1, 1]) B('shutter_green', s * 1.2 - 0.05, 0, -0.6, s * 1.2 + 0.05, 2.3, 0.5);
  B('timber', -1.3, 0.95, -0.55, 1.3, 1.0, 0.65);                            // the counter
  B('tar_wood', -1.45, 2.3, -0.75, 1.45, 2.38, 0.95);                        // the roof
  B('shutter_green', -1.45, 2.18, 0.85, 1.45, 2.3, 0.95);                    // its fascia
  // the papers, stacked in piles on the counter, and the magazines pegged up the back and the sides
  for (let i = 0; i < 6; i++) { const u = -1.05 + i * 0.42, hh = 0.04 + rand() * 0.12; B(rand() < 0.7 ? 'paint_white' : 'linen', u - 0.17, 1.0, -0.1, u + 0.17, 1.0 + hh, 0.42); }
  for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) { const u = -1.0 + i * 0.33; B(['car_red', 'cloth_ochre', 'paint_white', 'cloth_indigo', 'cloth_green'][Math.floor(rand() * 5)], u - 0.13, 1.2 + r * 0.34, -0.5, u + 0.13, 1.5 + r * 0.34, -0.48); }
  for (const s of [-1, 1]) for (let r = 0; r < 3; r++) B(['car_red', 'paint_white', 'cloth_ochre'][Math.floor(rand() * 3)], s * 1.27 - 0.01, 1.2 + r * 0.34, -0.2, s * 1.27 + 0.01, 1.5 + r * 0.34, 0.15);
  const c = Math.cos(rot), sn = Math.sin(rot);
  for (const [m, g] of parts) { g.rotateY(rot); g.translate(x, y, z); bag.add(m, g); }
  void c; void sn;
  col.circle(x, z, 1.3, y, y + 2.4);
}
