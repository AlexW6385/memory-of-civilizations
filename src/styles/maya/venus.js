// The Platform of Venus, Chichén Itzá (docs/settlements/chichen-itza.md §13): a square base more than 25 m a
// side, 4 m high, four stairs whose balustrades end in a cube with a serpent's head; on its outer panels Venus
// as a Year Bundle in bas-relief, and in sunken panels Kukulcán or Venus emerging from a serpent's jaws; on the
// cornice a feathered serpent with fish among its undulations (mayanpeninsula, "Venus Temple").

import { carved, Kit } from './meso.js';

const L = 'limestone_maya', RD = 'stucco_red', BL = 'maya_blue', OC = 'paint_ochre';

/** A flat strip in the carving's frame (x across, y up) from a to b, half-width w, from z0 out to z1. */
function strip(k, mat, a, b, w, z0, z1) {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l * w, ny = dx / l * w;
  return k.hex(mat, [[a[0] + nx, a[1] + ny, z0], [b[0] + nx, b[1] + ny, z0], [b[0] - nx, b[1] - ny, z0], [a[0] - nx, a[1] - ny, z0], [a[0] + nx, a[1] + ny, z1], [b[0] + nx, b[1] + ny, z1], [b[0] - nx, b[1] - ny, z1], [a[0] - nx, a[1] - ny, z1]]);
}
/** The frame of a panel w × h, its foot at y 0, facing +z, d deep. */
function frame(k, w, h, d, mat = L) {
  const t = 0.09; k.bx(mat, -w / 2, w / 2, 0, t, 0, d); k.bx(mat, -w / 2, w / 2, h - t, h, 0, d); k.bx(mat, -w / 2, -w / 2 + t, t, h - t, 0, d); k.bx(mat, w / 2 - t, w / 2, t, h - t, 0, d);
}

/**
 * Venus as a Year Bundle, a panel 2.2 × 1.1 m: on the left the Venus sign — a ringed eye with four rays, a
 * half-star — and on the right the bundle of years, sticks bound by two cords with knots; the ground painted
 * blue, the reliefs left in the stone with red in their hollows. Faces +z, its foot at y 0.
 */
export const venusPanelKit = () => carved('venus-panel', (k) => {
  const w = 2.2, h = 1.1, d = 0.07;
  frame(k, w, h, d);
  k.bx(BL, -w / 2 + 0.09, w / 2 - 0.09, 0.09, h - 0.09, 0, 0.012);                         // the ground
  // the Venus sign, its centre at x −0.5
  const cx = -0.5, cy = 0.55;
  k.disc(L, cx, cy, 0, 0.22, d, 18, 0.15); k.disc(L, cx, cy, 0, 0.07, d * 1.1, 10);
  k.disc(RD, cx, cy, 0.012, 0.15, 0.01, 16);
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + i * Math.PI / 2, p0 = [cx + Math.cos(a) * 0.2, cy + Math.sin(a) * 0.2], p1 = [cx + Math.cos(a) * 0.42, cy + Math.sin(a) * 0.42];
    k.hex(L, [[p0[0] - Math.sin(a) * 0.08, p0[1] + Math.cos(a) * 0.08, 0], [p1[0], p1[1], 0], [p1[0], p1[1], 0], [p0[0] + Math.sin(a) * 0.08, p0[1] - Math.cos(a) * 0.08, 0],
      [p0[0] - Math.sin(a) * 0.08, p0[1] + Math.cos(a) * 0.08, d], [p1[0], p1[1], d * 0.6], [p1[0], p1[1], d * 0.6], [p0[0] + Math.sin(a) * 0.08, p0[1] - Math.cos(a) * 0.08, d]]);
  }
  // the year bundle, its middle at x 0.45: six sticks lying across, two cords round them, each with a knot and its ends
  for (let i = 0; i < 6; i++) { const y = 0.3 + i * 0.1; k.seg(L, [0.05, y, d * 0.5], [0.85, y + 0.01, d * 0.5], 0.04, d * 0.5); }
  for (const x of [0.25, 0.65]) {
    k.bx(OC, x - 0.04, x + 0.04, 0.22, 0.88, d * 0.6, d * 1.15);
    k.disc(OC, x, 0.92, d * 0.6, 0.06, d * 0.5, 10);
    strip(k, OC, [x, 0.92], [x - 0.12, 1.0], 0.02, d * 0.6, d * 1.0); strip(k, OC, [x, 0.92], [x + 0.12, 1.0], 0.02, d * 0.6, d * 1.0);
  }
});

/**
 * The sunken panel: a feathered serpent's head in profile, its jaws wide, and between them the face of the god
 * emerging, a headdress of plumes over it; 2.2 × 1.1 m, the panel sunk behind its frame. Faces +z.
 */
export const jawsPanelKit = () => carved('venus-jaws', (k) => {
  const w = 2.2, h = 1.1, d = 0.1;
  frame(k, w, h, d);
  k.bx(RD, -w / 2 + 0.09, w / 2 - 0.09, 0.09, h - 0.09, 0, 0.012);
  // the serpent's head facing +x: the skull, the upper jaw curling up at the snout, the lower jaw, fangs, the eye under its brow, plumes behind
  k.fz(L, [-0.95, -0.35, 0.35, 0.95], [-0.92, -0.38, 0.38, 0.92], 0, d * 0.8);
  strip(k, L, [-0.4, 0.85], [0.35, 0.92], 0.07, 0, d * 0.8); strip(k, L, [0.35, 0.92], [0.5, 0.78], 0.06, 0, d * 0.8);
  strip(k, L, [-0.4, 0.28], [0.3, 0.2], 0.06, 0, d * 0.8); strip(k, L, [0.3, 0.2], [0.42, 0.3], 0.05, 0, d * 0.8);
  for (const x of [0.15, 0.3]) { strip(k, 'plaster_white', [x, 0.84], [x + 0.02, 0.72], 0.02, 0.02, d * 0.9); strip(k, 'plaster_white', [x - 0.05, 0.26], [x - 0.03, 0.36], 0.02, 0.02, d * 0.9); }
  k.disc('paint_minoan_black', -0.6, 0.72, d * 0.8, 0.06, 0.02, 10); k.bx(L, -0.78, -0.42, 0.8, 0.86, d * 0.8, d * 1.1);
  for (let i = 0; i < 4; i++) strip(k, i % 2 ? 'stucco_leaf' : L, [-0.92, 0.45 + i * 0.13], [-1.02, 0.5 + i * 0.15], 0.04, 0, d * 0.7);
  // the god's face between the jaws: the face, its eye and mouth, the ear spool, the plumed headdress
  k.fz('stucco_ochre', [-0.2, 0.12, 0.38, 0.72], [-0.18, 0.1, 0.4, 0.7], 0, d * 1.1);
  k.bx('paint_minoan_black', -0.02, 0.06, 0.6, 0.63, d * 1.1, d * 1.2); k.bx(RD, -0.02, 0.08, 0.46, 0.49, d * 1.1, d * 1.2);
  k.disc(BL, -0.17, 0.55, d * 1.1, 0.05, 0.02, 10);
  for (let i = 0; i < 3; i++) strip(k, 'stucco_leaf', [-0.15 + i * 0.1, 0.72], [-0.1 + i * 0.14, 0.86], 0.035, d * 0.6, d * 1.0);
});

/**
 * The cornice's serpent: a length of the feathered serpent's body undulating along the cornice, banded with
 * feathers, a fish in each trough; `len` m long, h high, facing +z, its foot at y 0.
 */
export function cornice(len, h) {
  return carved(`venus-cornice:${len.toFixed(2)}:${h.toFixed(2)}`, (k) => {
    const d = 0.05, amp = h * 0.22, lam = 3.0, yc = h / 2, n = Math.max(2, Math.round(len / 0.3));
    for (let i = 0; i < n; i++) {
      const x0 = -len / 2 + i * len / n, x1 = x0 + len / n, y0 = yc + amp * Math.sin(x0 * 2 * Math.PI / lam), y1 = yc + amp * Math.sin(x1 * 2 * Math.PI / lam);
      strip(k, L, [x0, y0], [x1 + 0.02, y1], h * 0.13, 0, d);
      if (i % 2 === 0) strip(k, i % 4 ? BL : 'stucco_leaf', [x0 + 0.05, y0 + h * 0.13], [x0 + 0.02, y0 + h * 0.25], 0.035, 0, d * 0.8);   // the feathers along its back
    }
    // the fish, one in each trough below the body, swimming along
    for (let x = -len / 2 + lam * 0.75; x < len / 2 - 0.4; x += lam) {
      const y = yc - amp - h * 0.14;
      if (y < 0.08) continue;
      k.fz(L, [x - 0.18, x + 0.12, y - 0.05, y + 0.05], [x - 0.16, x + 0.1, y - 0.04, y + 0.04], 0, d * 0.9);
      k.hex(L, [[x - 0.18, y, 0], [x - 0.3, y - 0.07, 0], [x - 0.3, y + 0.07, 0], [x - 0.18, y, 0], [x - 0.18, y, d * 0.7], [x - 0.3, y - 0.07, d * 0.7], [x - 0.3, y + 0.07, d * 0.7], [x - 0.18, y, d * 0.7]]);
    }
  });
}
