// Carved pieces of Chichén Itzá's detail pass (docs/settlements/chichen-itza.md §17): the skull of the Tzompantli's rows
// and rack, the eagle and the jaguar of the Platform of the Eagles and Jaguars' panels, the backstrap loom of a weaver's
// house. Built in the Kit's frame (x across, y up, z out of the wall) from closed solids, cached by key.

import { lathe } from '../../core/geom.js';
import { carved, Kit } from '../../styles/maya/meso.js';

const L = 'limestone_maya', DARK = 'paint_minoan_black', BL = 'maya_blue', RD = 'stucco_red', OC = 'paint_ochre';

/** A flat strip in the carving's plane from a to b, half-width w, from z0 out to z1 (a limb, a feather, a tail). */
export function strip(k, mat, a, b, w, z0, z1) {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l * w, ny = dx / l * w;
  return k.hex(mat, [[a[0] + nx, a[1] + ny, z0], [b[0] + nx, b[1] + ny, z0], [b[0] - nx, b[1] - ny, z0], [a[0] - nx, a[1] - ny, z0], [a[0] + nx, a[1] + ny, z1], [b[0] + nx, b[1] + ny, z1], [b[0] - nx, b[1] - ny, z1], [a[0] - nx, a[1] - ny, z1]]);
}

/**
 * A skull in high relief on a wall, facing +z, its middle at the origin (the cranium's plane on the wall): the domed cranium
 * 0.31 m across and 0.42 high with the jaw, two dark sockets, the nasal hole and the row of teeth; 0.125 m deep.
 */
export const skullKit = () => carved('cz-skull', (k) => {
  const dome = lathe([[0.17, 0], [0.166, 0.03], [0.15, 0.07], [0.105, 0.108], [0.001, 0.125]], 8);
  dome.rotateX(Math.PI / 2); dome.scale(0.92, 1.12, 1);
  k.geo('plaster_white', dome);
  k.bx('plaster_white', -0.085, 0.085, -0.215, -0.12, 0, 0.07);                                     // the jaw
  for (const sx of [-1, 1]) k.disc(DARK, sx * 0.07, 0.03, 0.1, 0.045, 0.02, 8);                      // the sockets
  k.fz(DARK, [-0.014, 0.014, -0.07, -0.02], [-0.02, 0.02, -0.075, -0.02], 0.1, 0.123);               // the nose
  k.bx(DARK, -0.07, 0.07, -0.165, -0.15, 0.07, 0.081);                                               // the teeth
});

/** The loom: an upright post, the warp stretched from a stick at the post to the weaver's belt, a strip of banded cotton on it. Faces +z (the weaver kneels at +z). */
export const loomKit = () => carved('cz-loom', (k) => {
  k.bx('log_pine', -0.05, 0.05, 0, 1.3, -0.05, 0.05);
  k.bx('timber', -0.35, 0.35, 0.78, 0.82, -0.06, -0.02); k.bx('timber', -0.35, 0.35, 0.46, 0.5, 0.88, 0.92);
  const bands = ['cloth_white', 'cloth_red', 'cloth_white', 'cloth_indigo', 'cloth_white', 'cloth_red', 'cloth_white'];
  bands.forEach((m, i) => { const x = -0.3 + i * 0.1; k.seg(m, [x, 0.8, -0.04], [x, 0.48, 0.9], 0.045, 0.006); });
  k.bx('rope_fibre', -0.3, 0.3, 0.44, 0.47, 0.9, 1.0);
});

/** An eagle with a heart, in relief on a panel 2.3 × 1.0 m (frame, blue ground), facing +x (f = 1) or −x (f = −1), its foot at y 0, facing +z. */
export const eaglePanelKit = (f = 1) => carved(`cz-eagle:${f}`, (k) => {
  const W = 2.3, H = 1.0, d = 0.06, z0 = 0.012, X = (x) => x * f, P = (x, y) => [X(x), y];
  frame(k, W, H, 0.09);
  k.bx(BL, -W / 2 + 0.09, W / 2 - 0.09, 0.09, H - 0.09, 0, z0);                                         // the ground
  const S = (m, a, b, w, hz = d) => strip(k, m, P(...a), P(...b), w, z0 * 0.5, hz);
  S(L, [-0.35, 0.42], [0.15, 0.56], 0.13);                                                              // the body
  S(L, [0.15, 0.56], [0.3, 0.72], 0.085);                                                               // the breast and neck
  k.bx(L, Math.min(X(0.3), X(0.47)), Math.max(X(0.3), X(0.47)), 0.72, 0.86, z0 * 0.5, d);              // the head
  S(OC, [0.47, 0.79], [0.64, 0.73], 0.035, d * 1.1);                                                    // the beak, hooked
  S(OC, [0.64, 0.73], [0.62, 0.63], 0.03, d * 1.1);
  k.disc(DARK, X(0.41), 0.8, d, 0.018, 0.012, 8);                                                       // the eye
  for (const [x, y] of [[-0.55, 0.96], [-0.66, 0.82], [-0.7, 0.66], [-0.6, 0.52]]) S(L, [-0.03, 0.58], [x, y], 0.05, d * 1.15);   // the folded wing's feathers
  S(OC, [-0.3, 0.6], [-0.5, 0.84], 0.03, d * 1.3);                                                      // the coverts' band
  for (const [x, y] of [[-0.78, 0.3], [-0.84, 0.4], [-0.74, 0.2]]) S(L, [-0.33, 0.42], [x, y], 0.04, d * 1.1);                  // the tail
  S(L, [0.05, 0.42], [0.2, 0.2], 0.035);                                                                // the leg
  S(L, [0.2, 0.2], [0.34, 0.15], 0.02, d * 1.1); S(L, [0.2, 0.2], [0.3, 0.1], 0.02, d * 1.1);          // the talons
  // the heart in the talons: two lobes and the point, red
  S(RD, [0.37, 0.17], [0.4, 0.09], 0.045, d * 1.2); S(RD, [0.43, 0.17], [0.4, 0.09], 0.045, d * 1.2);
  S(RD, [0.37, 0.17], [0.43, 0.17], 0.04, d * 1.2);
});

/** A spotted jaguar with a heart, in relief on a deep-framed panel 2.3 × 1.0 m (the sunken panel), facing +x (f = 1) or −x (f = −1). */
export const jaguarPanelKit = (f = 1) => carved(`cz-jaguar:${f}`, (k) => {
  const W = 2.3, H = 1.0, d = 0.06, z0 = 0.012, X = (x) => x * f, P = (x, y) => [X(x), y];
  frame(k, W, H, 0.13);
  k.bx(BL, -W / 2 + 0.09, W / 2 - 0.09, 0.09, H - 0.09, 0, z0);
  const S = (m, a, b, w, hz = d) => strip(k, m, P(...a), P(...b), w, z0 * 0.5, hz);
  S(OC, [-0.5, 0.5], [0.2, 0.52], 0.13);                                                                // the body
  S(OC, [-0.5, 0.5], [-0.46, 0.3], 0.1);                                                                // the haunch
  for (const [x, y, x2] of [[-0.46, 0.3, -0.4], [-0.3, 0.42, -0.26], [0.1, 0.42, 0.14], [0.2, 0.46, 0.3]]) S(OC, [x, y], [x2, 0.12], 0.04);   // the four legs
  S(OC, [0.2, 0.52], [0.34, 0.62], 0.09);                                                               // the neck
  k.bx(OC, Math.min(X(0.3), X(0.5)), Math.max(X(0.3), X(0.5)), 0.5, 0.7, z0 * 0.5, d);                  // the head
  S(OC, [0.5, 0.6], [0.58, 0.56], 0.05);                                                                // the muzzle
  S(DARK, [0.52, 0.55], [0.6, 0.53], 0.012, d * 1.2);                                                   // the open mouth
  for (const x of [0.34, 0.45]) k.bx(OC, Math.min(X(x), X(x + 0.05)), Math.max(X(x), X(x + 0.05)), 0.7, 0.76, z0 * 0.5, d * 0.9);   // the ears
  k.disc(DARK, X(0.43), 0.63, d, 0.016, 0.012, 8);                                                      // the eye
  S(OC, [-0.55, 0.52], [-0.74, 0.6], 0.03); S(OC, [-0.74, 0.6], [-0.8, 0.78], 0.03);                    // the tail curling up
  for (const [x, y] of [[-0.35, 0.58], [-0.2, 0.46], [-0.05, 0.58], [0.1, 0.46], [-0.42, 0.4], [-0.28, 0.6], [0.0, 0.46], [0.15, 0.6], [-0.15, 0.36]]) k.disc(DARK, X(x), y, d, 0.025, 0.012, 8);   // the spots
  S(RD, [0.55, 0.15], [0.6, 0.07], 0.04, d * 1.2); S(RD, [0.65, 0.15], [0.6, 0.07], 0.04, d * 1.2); S(RD, [0.55, 0.15], [0.65, 0.15], 0.035, d * 1.2);   // the heart under the paw
});

/** The frame of a panel w × h, its foot at y 0, facing +z, d deep. */
function frame(k, w, h, d) {
  const t = 0.09; k.bx(L, -w / 2, w / 2, 0, t, 0, d); k.bx(L, -w / 2, w / 2, h - t, h, 0, d); k.bx(L, -w / 2, -w / 2 + t, t, h - t, 0, d); k.bx(L, w / 2 - t, w / 2, t, h - t, 0, d);
}

export { Kit };
