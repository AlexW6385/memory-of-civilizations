// Street furniture of the Passeig de Gràcia about 1910 (docs/settlements/barcelona.md §6): the café's terrace (a round marble table on an
// iron foot with a pair of bentwood chairs) and the newspaper kiosk (an octagon of cast iron and glass on a stone plinth, a dome
// roof with its finial, posters on the panels, the papers on show).
import { lathe, rod, box } from '../../core/geom.js';

/** terrace_set: { at: [x, z], y, seed } — a table with a chair to its north and one to its south (the chairs face it). */
export function terraceSet(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0;
  bag.add('marble', lathe([[0.001, 0.72], [0.34, 0.72], [0.35, 0.735], [0.32, 0.755], [0.001, 0.755]], 14, null, x, y, z));
  bag.add('iron', lathe([[0.15, 0], [0.04, 0.03], [0.03, 0.6], [0.06, 0.7], [0.001, 0.72]], 8, null, x, y, z));
  for (let k = 0; k < 3; k++) { const th = k * 2.094 + 0.4; bag.add('iron', rod([x, y + 0.03, z], [x + Math.cos(th) * 0.24, y + 0.01, z + Math.sin(th) * 0.24], 0.013, 5)); }
  col.circle(x, z, 0.36, y, y + 0.8);
  for (const sg of [-1, 1]) {
    const cz = z + sg * 0.55, sy = y + 0.46, o = 0.17;
    bag.add('wood_dark', lathe([[0.001, 0], [0.2, 0], [0.205, 0.03], [0.2, 0.05], [0.001, 0.05]], 10, null, x, sy - 0.05, cz));
    for (const [a, b] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) bag.add('wood_dark', rod([x + a * o, y, cz + b * o], [x + a * o * 0.9, sy - 0.04, cz + b * o * 0.9], 0.013, 5));
    const rz = cz + sg * o * 1.05;
    for (const s of [-1, 1]) bag.add('wood_dark', rod([x + s * 0.15, sy, rz], [x + s * 0.15, sy + 0.45, rz], 0.012, 5));
    bag.add('wood_dark', rod([x - 0.17, sy + 0.44, rz], [x + 0.17, sy + 0.44, rz], 0.014, 5));
    bag.add('wood_dark', rod([x - 0.16, sy + 0.24, rz], [x + 0.16, sy + 0.24, rz], 0.01, 5));
  }
}

/** kiosk: { at: [x, z], y, rot, seed } — an octagon 1.5 m across. */
export function kiosk(el, { bag, col }) {
  const [cx, cz] = el.at, y = el.y ?? 0, R = 0.76, rot = el.rot ?? 0;
  const P = (k, r = R) => { const a = rot + (k + 0.5) * Math.PI / 4; return [cx + Math.cos(a) * r, cz + Math.sin(a) * r]; };
  bag.add('granite_grey', lathe([[0.001, 0.0], [R + 0.12, 0.0], [R + 0.12, 0.2], [R + 0.04, 0.24], [0.001, 0.24]], 8, (th) => 1 / Math.cos(((th - rot - Math.PI / 8) % (Math.PI / 4) + Math.PI / 4) % (Math.PI / 4) - Math.PI / 8) * Math.cos(Math.PI / 8), cx, y, cz));
  const POSTER = ['cloth_red', 'paint_white', 'cloth_ochre', 'cloth_green'];
  for (let k = 0; k < 8; k++) {
    const A = P(k - 1), B = P(k), mid = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
    bag.add('iron', rod([B[0], y + 0.24, B[1]], [B[0], y + 2.3, B[1]], 0.03, 6));
    const face = (m, h0, h1, inset) => { const ux = B[0] - A[0], uz = B[1] - A[1], L = Math.hypot(ux, uz), nx = -uz / L, nz = ux / L; const p = (s, hh) => [A[0] + ux * s + nx * inset, y + hh, A[1] + uz * s + nz * inset]; void p; };
    void face;
    // the panel as a thin box along the side
    const ang = Math.atan2(B[1] - A[1], B[0] - A[0]), L = Math.hypot(B[0] - A[0], B[1] - A[1]);
    const place = (g) => g.rotateY(-ang).translate(mid[0], 0, mid[1]);
    bag.add('wood_painted', place(box(-L / 2 + 0.03, y + 0.24, -0.025, L / 2 - 0.03, y + 1.0, 0.025)));
    if (k === 3) { bag.add('glass_outer', place(box(-L / 2 + 0.03, y + 1.0, -0.01, L / 2 - 0.03, y + 2.25, 0.01))); bag.add('wood_painted', place(box(-L / 2 + 0.03, y + 0.98, -0.12, L / 2 - 0.03, y + 1.04, 0.1))); bag.add('paint_white', place(box(-0.3, y + 1.04, -0.08, 0.3, y + 1.22, 0.05))); }
    else {
      const pm = POSTER[(k * 3 + (el.seed ?? 0)) % 4];
      bag.add(pm, place(box(-L / 2 + 0.07, y + 1.05, 0.026, L / 2 - 0.07, y + 2.15, 0.034))); bag.add(pm, place(box(-L / 2 + 0.07, y + 1.05, -0.034, L / 2 - 0.07, y + 2.15, -0.026)));
      bag.add('wood_painted', place(box(-L / 2 + 0.03, y + 1.0, -0.02, L / 2 - 0.03, y + 2.25, 0.02)));
    }
    bag.add('wood_painted', place(box(-L / 2 + 0.03, y + 2.25, -0.04, L / 2 - 0.03, y + 2.34, 0.04)));
  }
  bag.add('iron', lathe([[0.001, 2.34], [R + 0.18, 2.34], [R + 0.2, 2.4], [R * 0.7, 2.75], [R * 0.3, 3.05], [0.05, 3.2], [0.001, 3.5]], 16, null, cx, y, cz));
  bag.add('gilt_bronze', lathe([[0.001, 3.2], [0.09, 3.3], [0.001, 3.55]], 8, null, cx, y, cz));
  col.circle(cx, cz, R + 0.12, y, y + 3.2);
}
export const FURNITURE = { terrace_set: terraceSet, kiosk };
