// Inside the Temple of the Warriors and the rites at the Sacred Cenote (docs/settlements/chichen-itza.md §12):
// the temple's front hall roofed on square pillars carved with warriors, its walls painted with a procession of
// warriors and captives above a red dado, the floor painted red; a partition wall with its doorway into the
// sanctuary, where small Atlantean figures with raised arms carry the altar table; and at the cenote's rim the
// priests' offerings — a censer burning copal, balls of copal painted blue, baskets of jade beads.

import { box, lathe } from '../../core/geom.js';
import { Kit, carved } from './meso.js';

const L = 'limestone_maya', RD = 'stucco_red', BL = 'maya_blue', GR = 'stucco_leaf', BK = 'paint_minoan_black', OC = 'paint_ochre';

/** An Atlantean: a small warrior, arms raised over his head to carry the slab; 0.8 m; faces +z. */
export const atlanteanKit = () => carved('atlantean', (k) => {
  for (const s of [-1, 1]) { k.bx(L, s * 0.07 - 0.045, s * 0.07 + 0.045, 0, 0.05, -0.04, 0.07); k.seg(L, [s * 0.07, 0.04, 0], [s * 0.075, 0.33, 0], 0.04, 0.045); }
  k.fy(RD, [-0.12, 0.12, -0.08, 0.09], [-0.12, 0.12, -0.08, 0.09], 0.3, 0.38);                       // the loincloth
  k.fy(L, [-0.12, 0.12, -0.08, 0.08], [-0.14, 0.14, -0.08, 0.08], 0.38, 0.58);                       // the body
  k.fy(BL, [-0.13, 0.13, 0.08, 0.1], [-0.11, 0.11, 0.08, 0.1], 0.46, 0.56);                          // the butterfly pectoral
  for (const s of [-1, 1]) { k.seg(L, [s * 0.14, 0.56, 0], [s * 0.17, 0.68, 0.01], 0.035, 0.035); k.seg(L, [s * 0.17, 0.68, 0.01], [s * 0.1, 0.8, 0.01], 0.032, 0.032); }   // the arms raised
  k.fy(L, [-0.065, 0.065, -0.06, 0.07], [-0.06, 0.06, -0.055, 0.075], 0.58, 0.7);                   // the head
  k.bx(BK, -0.04, 0.04, 0.64, 0.66, 0.072, 0.08);                                                     // the eyes' line
  k.fy(GR, [-0.08, 0.08, -0.07, 0.08], [-0.07, 0.07, -0.07, 0.06], 0.7, 0.76);                       // the feathered cap
  for (const s of [-1, 1]) k.discAt(OC, s * 0.068, 0.64, 0, 0.025, 0.012, s * Math.PI / 2);         // the ear spools
});

/**
 * A 2.4 m length of the painted procession, facing +z, its foot at y 0, 1.5 m high: on a pale blue ground
 * over a band of earth, three warriors with spears and round shields in their plumes, leading a bound captive.
 */
export const processionKit = () => carved('warriors-procession', (k) => {
  k.bx('stucco_sky', -1.2, 1.2, 0.12, 1.5, 0, 0.01);
  k.bx(OC, -1.2, 1.2, 0, 0.12, 0, 0.015);
  k.bx(BK, -1.2, 1.2, 1.44, 1.5, 0, 0.015);
  const man = (x, cap) => {
    k.bx(cap ? 'skin_dark' : RD, x - 0.03, x - 0.005, 0.12, 0.45, 0.01, 0.02); k.bx(cap ? 'skin_dark' : RD, x + 0.01, x + 0.035, 0.12, 0.45, 0.01, 0.02);   // the legs
    k.bx(cap ? 'cloth_white' : BL, x - 0.06, x + 0.06, 0.45, 0.82, 0.01, 0.022);                      // the body, the quilted cotton armour
    k.bx(cap ? 'skin_dark' : RD, x - 0.04, x + 0.04, 0.82, 0.94, 0.01, 0.022);                        // the head
    if (cap) { k.bx('rope_fibre', x - 0.08, x + 0.08, 0.6, 0.63, 0.022, 0.026); return; }              // the captive's bound arms
    for (let j = 0; j < 4; j++) k.bx(j % 2 ? GR : 'inlay_jade', x - 0.12 + j * 0.03, x - 0.1 + j * 0.03, 0.94, 1.18 - j * 0.03, 0.01, 0.02);   // the plumes
    k.disc(OC, x + 0.1, 0.62, 0.022, 0.09, 0.008, 12);                                                // the shield
    k.bx('timber', x + 0.16, x + 0.175, 0.15, 1.25, 0.01, 0.02); k.bx(BK, x + 0.155, x + 0.18, 1.25, 1.33, 0.01, 0.02);   // the spear, its flint
  };
  man(-0.9); man(-0.3); man(0.3); man(0.85, true);
});

/**
 * The inside of the Temple of the Warriors { cx, cz, w, d (half-sizes to the walls' lines), y (the floor), H
 * (to the ceiling), wt (the walls' thickness) }, the door on the west (−x): see the file's head.
 */
export function warriorsInterior(bag, col, { cx, cz, w, d, y, H, wt }, pillar) {
  const x0 = cx - w + wt / 2, x1 = cx + w - wt / 2, z0 = cz - d + wt / 2, z1 = cz + d - wt / 2, px = cx + 2.4, pt = 0.6, e = 0.02;
  bag.add(RD, box(x0, y, z0, x1, y + 0.03, z1));                                                      // the floor painted red
  // the front hall: its roof on a row of four carved pillars; the walls' red dado and the procession above it
  for (const z of [-6, -2, 2, 6]) pillar(bag, col, cx - 4.2, cz + z * (d - wt / 2) / 8, y + 0.03, H - 0.03);
  for (const [z, s] of [[z0, 1], [z1, -1]]) {
    bag.add(RD, box(x0, y, s > 0 ? z : z - e, px - pt / 2, y + 0.9, s > 0 ? z + e : z));
    for (let x = x0 + 1.4; x < px - pt / 2 - 1.2; x += 2.4) processionKit().emit(bag, x, y + 1.15, z + s * e, 0, s);
  }
  bag.add(RD, box(px - pt / 2 - e, y, z0, px - pt / 2, y + 0.9, cz - 1.2)); bag.add(RD, box(px - pt / 2 - e, y, cz + 1.2, px - pt / 2, y + 0.9, z1));
  // the partition wall and its doorway into the sanctuary
  for (const r of [[px - pt / 2, z0, px + pt / 2, cz - 1.2], [px - pt / 2, cz + 1.2, px + pt / 2, z1]]) { bag.add('stucco', box(r[0], y, r[1], r[2], y + H, r[3])); col.rect(r, y, y + H); }
  bag.add('timber', box(px - pt / 2 - 0.05, y + 2.6, cz - 1.4, px + pt / 2 + 0.05, y + 2.85, cz + 1.4));
  bag.add('stucco', box(px - pt / 2, y + 2.85, cz - 1.2, px + pt / 2, y + H, cz + 1.2));
  // the sanctuary: the altar table on its Atlanteans against the back wall, offerings on it
  const ax0 = x1 - 2.6, ax1 = x1 - 0.3, az0 = cz - 2.6, az1 = cz + 2.6, top = y + 0.03 + 0.8;
  for (const x of [ax0 + 0.4, ax1 - 0.4]) for (let i = 0; i < 6; i++) atlanteanKit().emit(bag, x, y + 0.03, az0 + 0.35 + i * (az1 - az0 - 0.7) / 5, -1, 0, 1);
  bag.add(L, box(ax0, top, az0, ax1, top + 0.22, az1));
  bag.add(RD, box(ax0 - 0.06, top + 0.22, az0 - 0.06, ax1 + 0.06, top + 0.32, az1 + 0.06));
  col.rect([ax0, az0, ax1, az1], y, top + 0.32);
  for (let i = 0; i < 4; i++) {
    const z = az0 + 0.8 + i * (az1 - az0 - 1.6) / 3;
    bag.add(i % 2 ? 'terracotta' : 'pottery_dark', lathe([[0.001, 0], [0.13, 0.01], [0.2, 0.12], [0.19, 0.13], [0.001, 0.05]], 10, null, (ax0 + ax1) / 2, top + 0.32, z));
    bag.add(i % 2 ? BL : OC, lathe([[0.001, 0.05], [0.12, 0.08], [0.07, 0.17], [0.001, 0.18]], 8, null, (ax0 + ax1) / 2, top + 0.32, z));
  }
  for (const [z, s] of [[z0, 1], [z1, -1]]) bag.add(RD, box(px + pt / 2, y, s > 0 ? z : z - e, x1, y + 0.9, s > 0 ? z + e : z));
  bag.add(RD, box(x1 - e, y, z0, x1, y + 0.9, z1));
}

/**
 * m_offering { at [x, z], y, dir [dx, dz] (toward the water) }: the priests' offerings at the cenote's edge — a
 * ladle censer on a stone, its copal burning; balls of copal painted blue in a basket; jade beads and a gold disc
 * on a mat; a bundle of reed darts.
 */
export function mOffering(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, [dx, dz] = el.dir ?? [0, -1], nx = -dz, nz = dx;
  const P = (a, b) => [x + dx * a + nx * b, z + dz * a + nz * b];
  // the censer on a stone
  { const [cx, cz] = P(0.2, -1.2); bag.add(L, box(cx - 0.3, y - 0.25, cz - 0.3, cx + 0.3, y + 0.45, cz + 0.3)); bag.add('terracotta', lathe([[0.001, 0], [0.22, 0.02], [0.3, 0.2], [0.27, 0.22], [0.001, 0.1]], 12, null, cx, y + 0.45, cz)); bag.add('pottery_dark', lathe([[0.001, 0.12], [0.24, 0.14], [0.12, 0.24], [0.001, 0.25]], 10, null, cx, y + 0.45, cz)); bag.add('flame', lathe([[0.001, 0.22], [0.1, 0.22], [0.05, 0.36], [0.001, 0.46]], 8, null, cx, y + 0.45, cz)); col.rect([cx - 0.3, cz - 0.3, cx + 0.3, cz + 0.3], y, y + 0.9); }
  // the mat with the offerings
  { const [cx, cz] = P(-0.2, 0.4); bag.add('reed_mat', box(cx - 0.8, y - 0.04, cz - 0.6, cx + 0.8, y + 0.02, cz + 0.6));   // its foot sunk a little where the ground is uneven
    bag.add('wicker', lathe([[0.001, 0], [0.24, 0.02], [0.3, 0.26], [0.28, 0.27], [0.001, 0.05]], 12, null, cx - 0.4, y + 0.02, cz));
    for (let i = 0; i < 7; i++) bag.add(BL, lathe([[0.001, 0], [0.07, 0.03], [0.07, 0.09], [0.001, 0.13]], 8, null, cx - 0.4 + Math.cos(i * 0.9) * 0.13 * (i ? 1 : 0), y + (i ? 0.16 : 0.08), cz + Math.sin(i * 0.9) * 0.13 * (i ? 1 : 0)));
    for (let i = 0; i < 12; i++) bag.add('inlay_jade', lathe([[0.001, 0], [0.025, 0.01], [0.025, 0.03], [0.001, 0.04]], 6, null, cx + 0.2 + (i % 4) * 0.07, y + 0.02, cz - 0.15 + Math.floor(i / 4) * 0.08));
    bag.add('gold', lathe([[0.001, 0], [0.16, 0], [0.16, 0.012], [0.001, 0.014]], 16, null, cx + 0.45, y + 0.02, cz + 0.3)); }
  // the darts bound in a bundle, laid down
  { const [cx, cz] = P(-0.6, 1.3), g = lathe([[0.001, 0], [0.04, 0], [0.04, 1.4], [0.001, 1.45]], 8); g.rotateZ(Math.PI / 2); g.rotateY(Math.atan2(dx, dz)); bag.add('timber', g.translate(cx, y, cz)); }   // on the ground, settled a little into it
}
