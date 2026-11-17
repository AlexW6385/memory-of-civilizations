// Çatalhöyük — more of the houses' programme (docs/settlements/catalhoyuk.md §12): the wall painting of vultures and small headless
// people, the painted "map" of a double-coned volcano over a honeycomb of houses, plaster breasts with a vulture's beak, a plinth of
// horn cores, and the plastered post that carried the roof. Painted shapes are flat polygons off the plaster (kit.flat), relief is lathed.
import { box, lathe, rod, place } from '../../core/geom.js';
import { PLS, RED, BLK, LOG, flat, ellipse, bucranium } from './kit.js';

const mir = (pts, s) => pts.map(([x, y]) => [x * s, y]);
const at = (pts, cx, cy, k) => pts.map(([x, y]) => [cx + x * k, cy + y * k]);

/**
 * A vulture painted with its wings spread, seen from the front (as the birds of the shrines are): the neck and small hooked head, the
 * wings opened with their feathers as notches, a short tail and two man-like legs; about 1.4 k across and 1.0 k high, centre (cx, cy).
 */
export function vulture(bag, F, cx, cy, k, mat = RED) {
  const wing = [[0.07, 0.1], [0.3, 0.3], [0.52, 0.34], [0.7, 0.24], [0.62, 0.15], [0.74, 0.08], [0.62, 0.0], [0.7, -0.08], [0.56, -0.14], [0.6, -0.24], [0.38, -0.16], [0.2, -0.12], [0.07, -0.08]];
  for (const s of [-1, 1]) flat(bag, mat, F, at(mir(wing, s), cx, cy, k), 0.012);
  flat(bag, mat, F, at(ellipse(0, 0, 0.12, 0.23, 12), cx, cy, k), 0.013);                          // the body
  flat(bag, mat, F, at([[-0.035, 0.18], [0.035, 0.18], [0.03, 0.34], [-0.03, 0.34]], cx, cy, k), 0.013);   // the neck
  flat(bag, mat, F, at(ellipse(0, 0.38, 0.055, 0.06, 8), cx, cy, k), 0.013);                        // the head
  flat(bag, mat, F, at([[0.03, 0.4], [0.13, 0.35], [0.04, 0.33]], cx, cy, k), 0.014);               // the beak
  flat(bag, mat, F, at([[-0.07, -0.18], [0.07, -0.18], [0.11, -0.44], [-0.11, -0.44]], cx, cy, k), 0.013);   // the tail
  for (const s of [-1, 1]) {
    flat(bag, mat, F, at([[s * 0.04, -0.2], [s * 0.09, -0.2], [s * 0.12, -0.55], [s * 0.07, -0.55]], cx, cy, k), 0.014);   // legs
    flat(bag, mat, F, at([[s * 0.06, -0.55], [s * 0.15, -0.55], [s * 0.18, -0.6], [s * 0.05, -0.6]], cx, cy, k), 0.014);   // feet
  }
}
/** A small figure with no head, the arms raised, painted black; `k` its height. */
export function headless(bag, F, cx, cy, k, mat = BLK) {
  flat(bag, mat, F, at([[-0.1, 0.38], [0.1, 0.38], [0.08, 0.0], [-0.08, 0.0]], cx, cy - k * 0.45, k), 0.013);                   // the body
  for (const s of [-1, 1]) {
    flat(bag, mat, F, at([[s * 0.09, 0.36], [s * 0.1, 0.3], [s * 0.34, 0.52], [s * 0.3, 0.57]], cx, cy - k * 0.45, k), 0.013);   // an arm up
    flat(bag, mat, F, at([[s * 0.02, 0.02], [s * 0.09, 0.02], [s * 0.17, -0.4], [s * 0.1, -0.4]], cx, cy - k * 0.45, k), 0.013);   // a leg
  }
}
/** The scene: vultures over small headless people, `n` birds across `w` m from a (on the wall's frame), the birds' centres at height y. */
export function vultureWall(bag, F, a, w, y, n, k) {
  for (let i = 0; i < n; i++) {
    const cx = a + (i + 0.5) * w / n, up = i % 2 ? -0.08 : 0.08;
    vulture(bag, F, cx, y + up, k * (i % 2 ? 0.85 : 1));
    for (const dx of [-0.42, 0.0, 0.42]) headless(bag, F, cx + dx * k * 1.1 + (i % 2 ? 0.1 : -0.1), y - 0.62 * k - 0.1 + (dx === 0 ? 0.04 : 0), k * 0.42);
  }
}

/**
 * The painted "map": a volcano with two cones, spotted, a few flecks above it, over a honeycomb of house fronts (rows of cells, each red
 * round a white inner; some filled with a diamond). Left edge a, base y0, width w, height h.
 */
export function townMap(bag, F, a, y0, w, h) {
  const X = (t) => a + t * w, Y = (t) => y0 + t * h;
  const cols = 9, rows = 3, cw = w * 0.96 / cols, ch = h * 0.15;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x0 = a + w * 0.02 + c * cw, yy = y0 + 0.02 * h + r * (ch + 0.015 * h);
    flat(bag, RED, F, [[x0 + 0.01, yy], [x0 + cw - 0.01, yy], [x0 + cw - 0.01, yy + ch], [x0 + 0.01, yy + ch]], 0.011);
    flat(bag, PLS, F, [[x0 + 0.04 * cw + 0.01, yy + 0.18 * ch], [x0 + cw - 0.04 * cw - 0.01, yy + 0.18 * ch], [x0 + cw - 0.04 * cw - 0.01, yy + 0.82 * ch], [x0 + 0.04 * cw + 0.01, yy + 0.82 * ch]], 0.013);
    if ((c + r * 2) % 3 === 0) flat(bag, BLK, F, [[x0 + cw / 2, yy + 0.28 * ch], [x0 + cw * 0.68, yy + ch / 2], [x0 + cw / 2, yy + 0.72 * ch], [x0 + cw * 0.32, yy + ch / 2]], 0.015);
  }
  flat(bag, RED, F, [[X(0.3), Y(0.58)], [X(0.46), Y(0.64)], [X(0.52), Y(0.9)], [X(0.575), Y(0.8)], [X(0.64), Y(0.94)], [X(0.7), Y(0.7)], [X(0.88), Y(0.58)]], 0.011);   // the two cones
  flat(bag, BLK, F, [[X(0.3), Y(0.58)], [X(0.88), Y(0.58)], [X(0.88), Y(0.595)], [X(0.3), Y(0.595)]], 0.013);                                                             // its foot
  for (const [t, u] of [[0.42, 0.66], [0.5, 0.71], [0.55, 0.64], [0.62, 0.72], [0.67, 0.65], [0.74, 0.62], [0.8, 0.6], [0.58, 0.85], [0.46, 0.7], [0.7, 0.78]]) flat(bag, BLK, F, ellipse(X(t), Y(u), h * 0.022, h * 0.022, 6), 0.013);
  for (const [t, u] of [[0.5, 0.97], [0.57, 0.99], [0.64, 1.0], [0.7, 0.96]]) flat(bag, RED, F, [[X(t) - 0.02, Y(u)], [X(t) + 0.02, Y(u)], [X(t), Y(u) + 0.09 * h]], 0.012);
}

/**
 * A breast in plaster, the nipple a small boss and, through it, the beak of a vulture's skull set inside (the bird's head modelled in clay
 * over a real skull); on a wall whose normal into the room is `yaw` (+z local), centre (x, y, z), radius 0.17 k.
 */
export function breast(bag, x, y, z, yaw, k = 1, beak = true) {
  const P = (g) => place(g, x, y, z, yaw);
  bag.add(PLS, P(lathe([[0.001, 0], [0.17 * k, 0], [0.16 * k, 0.04 * k], [0.12 * k, 0.1 * k], [0.06 * k, 0.135 * k], [0.001, 0.14 * k]], 12).rotateX(Math.PI / 2)));
  bag.add(PLS, P(lathe([[0.001, 0.13 * k], [0.04 * k, 0.135 * k], [0.035 * k, 0.17 * k], [0.001, 0.18 * k]], 8).rotateX(Math.PI / 2)));
  if (beak) bag.add('chalk', P(lathe([[0.001, 0.0], [0.03 * k, 0.0], [0.022 * k, 0.12 * k], [0.001, 0.19 * k]], 7).rotateX(Math.PI / 2).translate(0, 0.012 * k, 0.12 * k)));
}

/** A plinth of plaster (0.55 square, 0.32 m high) with a pair of horn cores set in it: the bull's horns without the skull. */
export function hornPlinth(bag, col, x, y, z, yaw = 0, k = 0.55) {
  const P = (g) => place(g, x, y, z, yaw);
  bag.add(PLS, P(box(-0.27, 0, -0.27, 0.27, 0.32, 0.27)));
  bucranium(bag, x, y + 0.32 + 0.1 * k, z, yaw, k, false);
  col.rect([x - 0.27, z - 0.27, x + 0.27, z + 0.27], y, y + 0.9);
}

/**
 * A post of the room: a trunk of juniper in a coat of plaster to the beam, a red band at the height of the eye, a cap-block under the roof
 * beams (across them along x), the foot on `y0`. Blocks the walker (a circle).
 */
export function post(bag, col, x, y0, z, y1, r = 0.13) {
  bag.add(LOG, rod([x, y0, z], [x, y1, z], r - 0.02, 8));
  bag.add(PLS, lathe([[r + 0.04, 0], [r + 0.04, 0.12], [r + 0.015, 0.14], [r + 0.015, y1 - y0 - 0.18], [r + 0.035, y1 - y0 - 0.16], [0.001, y1 - y0 - 0.16]], 12, null, x, y0, z));
  bag.add(RED, lathe([[r + 0.05, 1.05 - y0], [r + 0.05, 1.18 - y0], [r + 0.045, 1.18 - y0], [r + 0.045, 1.05 - y0]], 12, null, x, y0, z));
  bag.add(LOG, box(x - 0.24, y1 - 0.12, z - 0.1, x + 0.24, y1, z + 0.1));
  col.circle(x, z, r + 0.05, y0, y1);
}
