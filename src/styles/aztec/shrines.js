// The insides of the twin shrines on the Templo Mayor (docs/settlements/tenochtitlan.md §13): each a
// hall under a ceiling of vigas, its walls sooted above a painted dado; against the back wall a
// stepped dais and on it the god — Huitzilopochtli standing, his limbs blue, the hummingbird helmet
// with its plumes, the shield with five down balls and darts, the turquoise fire serpent in his right
// hand, a gold breastplate and jade beads, behind a cotton curtain drawn aside; Tlaloc in his niche
// of carved wood, half man and half lizard, his body studded with seeds, goggled and fanged, the
// lightning staff and a maize stalk in his hands. Copal braziers and offerings before each; the
// huehuetl drum at the summit. Each image is a carving (meso.js) about 3.6 m tall, built facing +z.

import { box, lathe } from '../../core/geom.js';
import { Kit, carved } from '../maya/meso.js';

const W = 'plaster_white', R = 'stucco_red', B = 'maya_blue', BK = 'paint_minoan_black', G = 'gold', J = 'inlay_jade', GG = 'glaze_green', OC = 'paint_ochre';

/** Huitzilopochtli: 3.7 m from his soles to the tips of his plumes; faces +z. */
export const huitzilopochtliKit = () => carved('huitzilopochtli', (k) => {
  for (const s of [-1, 1]) {
    k.bx(B, s * 0.3 - 0.16, s * 0.3 + 0.16, 0, 0.16, -0.18, 0.3);                                // the feet, blue
    k.seg(B, [s * 0.3, 0.12, 0.02], [s * 0.33, 1.32, 0], 0.15, 0.17, 0.18, 0.2);                  // the legs, blue
    k.bx(G, s * 0.3 - 0.19, s * 0.3 + 0.19, 0.3, 0.42, -0.21, 0.23);                               // the gold bands at the ankles (the bells)
  }
  k.fy('cloth_white', [-0.5, 0.5, -0.36, 0.4], [-0.56, 0.56, -0.4, 0.44], 1.1, 1.5);               // the loincloth's knot and apron
  k.fy('cloth_red', [-0.58, 0.58, -0.42, 0.46], [-0.52, 0.52, -0.36, 0.4], 1.45, 2.5);             // the body, heavy, dressed in red cloth
  k.fy(G, [-0.62, 0.62, -0.46, 0.5], [-0.62, 0.62, -0.46, 0.5], 1.5, 1.64);                        // the girdle of gold
  k.disc(G, 0, 2.0, 0.4, 0.24, 0.05, 16);                                                            // the gold breastplate (anahuatl)
  for (let i = 0; i < 11; i++) { const a = Math.PI * (0.15 + 0.7 * i / 10); k.disc(J, Math.cos(a) * 0.4, 2.42 - Math.sin(a) * 0.26, 0.38, 0.05, 0.05, 8); }   // the necklace of jade beads
  k.fy('cloth_white', [-0.6, 0.6, -0.44, 0.1], [-0.55, 0.55, -0.4, 0.05], 2.3, 2.52);               // the cape knotted over the shoulders
  // the left arm forward with the shield and the darts
  k.seg(B, [-0.6, 2.38, 0], [-0.74, 1.92, 0.16], 0.12, 0.13);
  k.seg(B, [-0.74, 1.92, 0.16], [-0.62, 1.78, 0.52], 0.11, 0.11);
  k.disc(OC, -0.62, 1.86, 0.6, 0.56, 0.07, 20);                                                     // the shield of yellow feathers
  k.disc(G, -0.62, 1.86, 0.6, 0.6, 0.05, 20, 0.54);                                                 // its gold rim
  for (const [u, v] of [[0, 0], [0.26, 0.26], [-0.26, 0.26], [0.26, -0.26], [-0.26, -0.26]]) k.disc(W, -0.62 + u, 1.86 + v, 0.67, 0.08, 0.07, 8);   // the five balls of down in a quincunx
  for (let i = 0; i < 4; i++) { const x = -1.0 + i * 0.1; k.seg('timber', [x, 1.1, 0.48], [x + 0.06, 2.6, 0.5], 0.015, 0.015); k.seg(BK, [x + 0.06, 2.6, 0.5], [x + 0.07, 2.74, 0.5], 0.03, 0.01, 0.002, 0.005); k.seg(W, [x, 1.1, 0.48], [x - 0.01, 1.28, 0.48], 0.035, 0.008); }   // the darts behind it, obsidian-tipped, fletched
  // the right arm holding the fire serpent upright, its body bent in steps, its head at the top
  k.seg(B, [0.6, 2.38, 0], [0.74, 1.92, 0.14], 0.12, 0.13);
  k.seg(B, [0.74, 1.92, 0.14], [0.72, 1.86, 0.5], 0.11, 0.11);
  const zz = [[0.78, 0.2], [0.68, 0.55], [0.86, 0.9], [0.68, 1.25], [0.86, 1.6], [0.7, 1.95], [0.86, 2.3], [0.74, 2.65], [0.8, 2.95]];
  for (let i = 0; i + 1 < zz.length; i++) k.seg(B, [zz[i][0], zz[i][1], 0.52], [zz[i + 1][0], zz[i + 1][1], 0.52], 0.07, 0.06);
  k.fz(B, [0.7, 0.92, 2.9, 3.12], [0.73, 0.9, 2.96, 3.1], 0.42, 0.82);                             // the serpent's head, its snout
  k.seg(B, [0.81, 3.1, 0.75], [0.81, 3.32, 0.86], 0.05, 0.04, 0.02, 0.02);                          // the snout turned up (the stars of its nose)
  for (let i = 0; i < 4; i++) k.seg(OC, [0.79, 2.92 - i * 0.03, 0.82 - i * 0.12], [0.79, 2.78 - i * 0.03, 0.8 - i * 0.12], 0.012, 0.012, 0.002, 0.002);   // its fangs
  // the head: the face black, banded across with yellow and blue; shell eyes with obsidian; gold ear spools
  k.fy(BK, [-0.2, 0.2, -0.18, 0.2], [-0.2, 0.2, -0.18, 0.2], 2.5, 2.62);                           // the neck
  k.fy(BK, [-0.32, 0.32, -0.3, 0.3], [-0.3, 0.3, -0.28, 0.33], 2.6, 3.2);
  k.bx(OC, -0.29, 0.29, 2.92, 3.0, 0.33, 0.36); k.bx(B, -0.29, 0.29, 2.72, 2.8, 0.33, 0.36);
  for (const s of [-1, 1]) {
    k.bx(W, s * 0.14 - 0.08, s * 0.14 + 0.08, 2.82, 2.9, 0.33, 0.37); k.bx('obsidian', s * 0.14 - 0.03, s * 0.14 + 0.03, 2.83, 2.89, 0.37, 0.38);
    k.discAt(G, s * 0.32, 2.85, 0, 0.12, 0.05, s * Math.PI / 2);
  }
  k.fz(BK, [-0.05, 0.05, 2.74, 2.86], [-0.04, 0.04, 2.74, 2.8], 0.33, 0.4);                        // the nose
  // the hummingbird helmet: the bird's head over his, its long beak forward, its plumes rising behind in a fan
  k.fy(GG, [-0.36, 0.36, -0.34, 0.34], [-0.28, 0.28, -0.3, 0.24], 3.15, 3.5);
  k.seg(BK, [0, 3.36, 0.3], [0, 3.22, 0.92], 0.035, 0.03, 0.008, 0.008);
  for (const s of [-1, 1]) k.discAt(W, s * 0.2, 3.38, 0.15, 0.06, 0.03, s * Math.PI / 2 * 0.4);
  for (let i = 0; i < 11; i++) {
    const a = -1.0 + i * 0.2, L2 = 0.6 + 0.15 * Math.cos(a * 1.6), base = [Math.sin(a) * 0.15, 3.45, -0.12];
    k.seg(i % 2 ? J : GG, base, [base[0] + Math.sin(a) * L2, 3.45 + Math.cos(a) * L2 * 1.1, -0.38], 0.055, 0.015, 0.035, 0.01);
  }
});

/** Tlaloc: half man and half lizard, his body studded with seeds; 3.3 m; faces +z. */
export const tlalocKit = () => carved('tlaloc', (k) => {
  for (const s of [-1, 1]) {
    k.bx(B, s * 0.3 - 0.16, s * 0.3 + 0.16, 0, 0.14, -0.16, 0.3);
    for (let i = 0; i < 3; i++) k.fz(W, [s * 0.3 - 0.13 + i * 0.1, s * 0.3 - 0.07 + i * 0.1, 0, 0.06], [s * 0.3 - 0.12 + i * 0.1, s * 0.3 - 0.08 + i * 0.1, 0, 0.03], 0.3, 0.38);   // the lizard's claws
    k.seg(B, [s * 0.3, 0.1, 0], [s * 0.34, 1.2, 0], 0.16, 0.18, 0.19, 0.2);
  }
  k.fy(B, [-0.56, 0.56, -0.42, 0.44], [-0.5, 0.5, -0.36, 0.38], 1.1, 2.3);                          // the body
  k.fy('cloth_white', [-0.6, 0.6, -0.46, 0.48], [-0.6, 0.6, -0.46, 0.48], 1.1, 1.3);                  // the loincloth
  // the seeds studding the body: maize yellow, beans dark, amaranth red, squash white
  const seed = [OC, 'pottery_dark', R, W];
  for (let j = 0; j < 6; j++) for (let i = 0; i < 7; i++) {
    const y = 1.38 + j * 0.15, x = -0.45 + i * 0.15 + (j % 2) * 0.07, z = 0.44 - (y - 1.1) / 1.2 * 0.06;
    if (Math.abs(x) > 0.5 - (y - 1.1) * 0.05) continue;
    k.bx(seed[(i + j * 3) % 4], x - 0.035, x + 0.035, y - 0.045, y + 0.045, z, z + 0.04);
  }
  for (const s of [-1, 1]) for (let j = 0; j < 5; j++) { const y = 1.4 + j * 0.18, x = s * (0.58 - (y - 1.1) * 0.05); k.bx(seed[j % 4], x - 0.03, x + 0.03, y - 0.04, y + 0.04, -0.2, 0.15); }
  // the lizard's tail, curling down behind him to the dais
  const tail = [[0, 1.2, -0.4], [0, 0.85, -0.75], [0.15, 0.45, -0.95], [0.4, 0.12, -0.9], [0.6, 0.08, -0.6]];
  for (let i = 0; i + 1 < tail.length; i++) k.seg(B, tail[i], tail[i + 1], 0.2 - i * 0.04, 0.16 - i * 0.03, 0.16 - i * 0.04, 0.13 - i * 0.03);
  for (let j = 0; j < 7; j++) k.fy('stucco_leaf', [-0.05, 0.05, -0.43, -0.37], [-0.01, 0.01, -0.46, -0.44], 1.3 + j * 0.15, 1.42 + j * 0.15);   // the crest along his back
  // the arms: the lightning staff in the right hand, a maize stalk in the left
  for (const s of [-1, 1]) { k.seg(B, [s * 0.56, 2.2, 0], [s * 0.7, 1.75, 0.15], 0.11, 0.12); k.seg(B, [s * 0.7, 1.75, 0.15], [s * 0.62, 1.66, 0.5], 0.1, 0.1); }
  const zz = [[0.66, 0.4], [0.82, 0.8], [0.6, 1.2], [0.84, 1.6], [0.62, 2.0], [0.84, 2.4], [0.7, 2.75]];
  for (let i = 0; i + 1 < zz.length; i++) k.seg(G, [zz[i][0], zz[i][1], 0.52], [zz[i + 1][0], zz[i + 1][1], 0.52], 0.04, 0.04);
  k.seg('stucco_leaf', [-0.64, 0.5, 0.52], [-0.62, 2.7, 0.55], 0.03, 0.03, 0.02, 0.02);
  for (let i = 0; i < 4; i++) { const y = 1.0 + i * 0.4, s = i % 2 ? 1 : -1; k.seg('stucco_leaf', [-0.63, y, 0.53], [-0.63 + s * 0.35, y + 0.45, 0.55], 0.06, 0.008, 0.01, 0.006); }
  k.seg(OC, [-0.6, 2.2, 0.56], [-0.58, 2.55, 0.58], 0.06, 0.06, 0.04, 0.04);                          // the ear of maize
  // the head: blue-black, the goggles, the curled lip and the fangs, jade ear spools, the crown of heron plumes and the paper fan
  k.fy(B, [-0.18, 0.18, -0.16, 0.18], [-0.18, 0.18, -0.16, 0.18], 2.28, 2.4);
  k.fy(BK, [-0.32, 0.32, -0.3, 0.3], [-0.3, 0.3, -0.28, 0.32], 2.38, 2.98);
  for (const s of [-1, 1]) {
    k.disc(W, s * 0.14, 2.78, 0.32, 0.13, 0.05, 14, 0.07); k.disc('obsidian', s * 0.14, 2.78, 0.3, 0.07, 0.06, 10);
    k.discAt(J, s * 0.32, 2.7, 0, 0.13, 0.05, s * Math.PI / 2);
    k.seg(W, [s * 0.02, 2.58, 0.36], [s * 0.2, 2.62, 0.38], 0.04, 0.03); k.seg(W, [s * 0.2, 2.62, 0.38], [s * 0.26, 2.52, 0.36], 0.035, 0.03);   // the lip curled up at the corners
    k.fy(W, [s * 0.1 - 0.035, s * 0.1 + 0.035, 0.33, 0.37], [s * 0.1 - 0.008, s * 0.1 + 0.008, 0.34, 0.36], 2.56, 2.36);   // the fangs
  }
  k.fy(W, [-0.022, 0.022, 0.32, 0.36], [-0.004, 0.004, 0.33, 0.35], 2.56, 2.4);                      // the middle fang
  k.fy('cloth_white', [-0.34, 0.34, -0.32, 0.3], [-0.3, 0.3, -0.3, 0.26], 2.95, 3.12);                // the headband of paper
  k.fz('cloth_white', [-0.5, 0.5, 2.9, 3.45], [-0.46, 0.46, 2.95, 3.4], -0.4, -0.34);                 // the pleated paper fan behind the head
  for (let i = 0; i < 7; i++) { const a = -0.75 + i * 0.25; k.seg(W, [Math.sin(a) * 0.15, 3.1, 0.05], [Math.sin(a) * 0.5, 3.1 + Math.cos(a) * 0.38, -0.05], 0.05, 0.012, 0.03, 0.008); }   // the heron plumes
});

/**
 * The god's chamber inside a shrine, its inner rect [x0, z0, x1, z1] (the door on the west, x0), floor y, ceiling
 * at y + h: the dado and the sooted walls, the vigas, the dais with the god, the curtain, braziers, offerings.
 */
export function shrineInterior(bag, col, [i0, j0, i1, j1], y, h, god) {
  const tl = god === 'tlaloc', zc = (j0 + j1) / 2, e = 0.03;
  // the floor of stucco, a reed mat laid before the god
  bag.add('stucco_pale', box(i0, y, j0, i1, y + 0.05, j1));
  // the walls inside: sooted by the braziers' smoke above a dado painted in the god's colour
  for (const [a, b] of [[[i0, j0], [i1, j0 + e]], [[i0, j1 - e], [i1, j1]], [[i1 - e, j0], [i1, j1]]]) {
    bag.add(tl ? B : R, box(a[0], y + 0.05, a[1], b[0], y + 1.2, b[1]));
    bag.add('plaster_damp', box(a[0], y + 1.2, a[1], b[0], y + h, b[1]));
  }
  for (const [za, zb] of [[j0, zc - 1.3], [zc + 1.3, j1]]) { bag.add(tl ? B : R, box(i0, y + 0.05, za, i0 + e, y + 1.2, zb)); bag.add('plaster_damp', box(i0, y + 1.2, za, i0 + e, y + h, zb)); }
  // the ceiling's vigas, spanning north–south, their ends in the walls
  for (let x = i0 + 0.6; x < i1 - 0.3; x += 0.9) bag.add('viga', box(x - 0.13, y + h - 0.28, j0 - 0.1, x + 0.13, y + h + 0.05, j1 + 0.1));
  // the dais against the back wall: two steps up to its top, painted
  const dd = 3.6, dw = 3.2, dh = 0.9, dx0 = i1 - dd;
  bag.add(tl ? B : R, box(dx0, y + 0.05, zc - dw, i1, y + dh, zc + dw));
  bag.add(W, box(dx0 - 0.04, y + dh - 0.12, zc - dw - 0.04, i1, y + dh + 0.02, zc + dw + 0.04));
  for (let s = 0; s < 3; s++) bag.add(W, box(dx0 - 0.4 * (3 - s), y + 0.05, zc - 1.4, dx0, y + 0.05 + dh * (s + 1) / 4, zc + 1.4));
  col.rect([dx0, zc - dw, i1, zc + dw], y, y + dh); col.floor([dx0, zc - dw, i1, zc + dw], y + dh + 0.02);
  col.ramp([dx0 - 1.2, zc - 1.4, dx0, zc + 1.4], y + 0.05, y + dh + 0.02, 'e');
  const gx = i1 - 1.8, gy = y + dh + 0.02;
  if (tl) {
    // the niche of carved wood: a back panel, posts and a lintel with bosses, a canopy
    const nw = 1.5, nd = 1.7, nh = 4.25;
    bag.add('wood_painted', box(i1 - 0.15, gy, zc - nw, i1, gy + nh, zc + nw));
    for (const s of [-1, 1]) { bag.add('timber', box(i1 - nd, gy, zc + s * nw - 0.14, i1 - 0.15, gy + nh, zc + s * nw + 0.14)); for (let yy = gy + 0.5; yy < gy + nh - 0.4; yy += 0.6) bag.add('wood_ochre', box(i1 - nd - 0.04, yy, zc + s * nw - 0.1, i1 - nd + 0.2, yy + 0.2, zc + s * nw + 0.1)); }
    bag.add('timber', box(i1 - nd - 0.1, gy + nh, zc - nw - 0.24, i1, gy + nh + 0.45, zc + nw + 0.24));
    for (let z = zc - nw; z <= zc + nw + 0.01; z += 0.47) bag.add(B, lathe([[0.001, 0], [0.12, 0], [0.12, 0.05], [0.001, 0.07]], 10).rotateZ(Math.PI / 2).translate(i1 - nd - 0.1, gy + nh + 0.22, z));
    tlalocKit().emit(bag, gx + 0.25, gy, zc, -1, 0, 1.2);
  } else {
    huitzilopochtliKit().emit(bag, gx, gy, zc, -1, 0, 1.2);
    // the curtain he stood behind, drawn to either side of the dais under a valance hung on a pole
    const cx = dx0 - 0.25, ch = y + h - 0.35;
    bag.add('timber', box(cx - 0.06, ch - 0.12, zc - dw - 0.2, cx + 0.06, ch, zc + dw + 0.2));
    bag.add('cloth_white', box(cx - 0.09, ch - 0.4, zc - dw, cx - 0.06, ch - 0.12, zc + dw));
    bag.add(R, box(cx - 0.1, ch - 0.4, zc - dw, cx - 0.09, ch - 0.3, zc + dw));
    for (const s of [-1, 1]) bag.add('cloth_white', lathe([[0.35, 0], [0.2, 0.7], [0.3, 1.3], [0.24, ch - 0.4 - y - 0.05], [0.001, ch - 0.4 - y - 0.05]], 10, (a) => 0.9 + 0.1 * Math.cos(a * 7), cx, y + 0.05, zc + s * (dw - 0.4)));
    col.circle(cx, zc - dw + 0.4, 0.35, y, y + 3); col.circle(cx, zc + dw - 0.4, 0.35, y, y + 3);
  }
  col.rect([gx - 0.7, zc - 1.2, gx + 1.0, zc + 1.2], gy, gy + 4.4);
  // the reed mat, the copal braziers either side of it, the offerings: bowls of food, flowers, a bundle of plumes
  bag.add('reed_mat', box(dx0 - 4.2, y + 0.05, zc - 1.2, dx0 - 1.3, y + 0.07, zc + 1.2));
  for (const s of [-1, 1]) {
    const bx = dx0 - 2.2, bz = zc + s * 2.2;
    bag.add('terracotta', lathe([[0.18, 0], [0.22, 0.45], [0.42, 0.62], [0.46, 0.8], [0.38, 0.8], [0.001, 0.68]], 14, null, bx, y + 0.05, bz));
    bag.add('pottery_dark', lathe([[0.001, 0.7], [0.36, 0.72], [0.2, 0.84], [0.001, 0.86]], 10, null, bx, y + 0.05, bz));
    bag.add('flame', lathe([[0.18, 0.82], [0.1, 1.0], [0.001, 1.15]], 8, null, bx, y + 0.05, bz));
    col.circle(bx, bz, 0.45, y, y + 1);
  }
  for (let i = 0; i < 5; i++) {
    const oz = zc - 0.9 + i * 0.45, ox = dx0 - 1.0;
    bag.add(i % 2 ? 'terracotta' : 'pottery_dark', lathe([[0.001, 0], [0.12, 0.01], [0.18, 0.1], [0.17, 0.11], [0.001, 0.04]], 10, null, ox, y + 0.05, oz));
    bag.add(i % 2 ? OC : (tl ? 'stucco_leaf' : R), lathe([[0.001, 0.04], [0.13, 0.08], [0.08, 0.15], [0.001, 0.16]], 8, null, ox, y + 0.05, oz));
  }
}

/** The huehuetl: the upright drum of a hollowed log on three feet cut from it, a jaguar-skin head; about 1.2 m. */
export function huehuetl(bag, x, y, z) {
  bag.add('timber', lathe([[0.3, 0.25], [0.32, 0.3], [0.34, 1.1], [0.36, 1.15], [0.001, 1.15]], 14, null, x, y, z));
  for (let i = 0; i < 3; i++) { const a = i * 2.094; bag.add('timber', box(x + Math.cos(a) * 0.24 - 0.07, y, z + Math.sin(a) * 0.24 - 0.07, x + Math.cos(a) * 0.24 + 0.07, y + 0.26, z + Math.sin(a) * 0.24 + 0.07)); }
  bag.add('hide_tan', lathe([[0.001, 1.15], [0.37, 1.15], [0.37, 1.18], [0.001, 1.19]], 14, null, x, y, z));
  bag.add(R, lathe([[0.345, 0.55], [0.35, 0.55], [0.35, 0.75], [0.345, 0.75]], 14, null, x, y, z));
}
