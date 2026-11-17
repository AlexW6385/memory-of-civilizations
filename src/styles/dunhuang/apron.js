// Standing things of the apron (docs/settlements/dunhuang.md §13): the stele of 698 on its tortoise (the record of the
// shrines of Mogao, first year of Shengli) and a bronze incense burner on a stone stand, both before the cliff.
import { box, lathe, rod } from '../../core/geom.js';

/** dh_stele { at: [x, z], y }: a rectangular slab under a round cap on a tortoise (bixi), the face and the inscription to the east (+x). */
function stele(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.at, y = el.y ?? 0;
  // the tortoise: a domed shell 2.5 m × 1.5 m (stretched along x), a head and neck to the east, four splayed feet, a tail
  const shell = lathe([[0.001, 0], [1.0, 0], [1.02, 0.14], [0.95, 0.3], [0.8, 0.42], [0.5, 0.5], [0.001, 0.52]], 18, (th) => 1 + 0.025 * Math.cos(th * 6));
  shell.scale(1.2, 1, 0.68); shell.translate(x, y + 0.18, z); bag.add('granite_grey', shell);
  bag.add('granite_grey', lathe([[0.001, 0], [0.18, 0.08], [0.24, 0.3], [0.2, 0.5], [0.001, 0.55]], 12).rotateZ(-Math.PI / 2).translate(x + 1.75, y + 0.5, z));     // the head, its axis east
  bag.add('granite_grey', rod([x + 1.15, y + 0.55, z], [x + 1.75, y + 0.62, z], 0.2, 8));                                                          // the neck
  for (const s of [-1, 1]) { bag.add('lacquer_black', box(x + 2.0, y + 0.58, z + s * 0.19 - 0.03, x + 2.07, y + 0.64, z + s * 0.19 + 0.03)); }      // the eyes
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bag.add('granite_grey', rod([x + sx * 0.85, y + 0.3, z + sz * 0.5], [x + sx * 0.95, y, z + sz * 0.78], 0.16, 7));
  bag.add('granite_grey', rod([x - 1.2, y + 0.4, z], [x - 1.7, y + 0.18, z], 0.09, 6));
  bag.add('granite_grey', box(x - 1.3, y + 0.0, z - 0.85, x + 1.3, y + 0.18, z + 0.85));                                                        // the plinth under it
  // the slab in its notch on the shell's back: 0.9 m wide, 0.3 m thick, 2.3 m high, the face east
  const sy = y + 0.78, sh = 2.3, sw = 0.55;
  bag.add('granite_grey', box(x - 0.4, y + 0.6, z - 0.62, x + 0.4, sy + 0.02, z + 0.62));                                                      // the saddle on the shell
  bag.add('limestone', box(x - 0.15, sy, z - sw, x + 0.15, sy + sh, z + sw));
  bag.add('limestone', lathe([[0.001, 0], [0.57, 0], [0.57, 0.3], [0.001, 0.3]], 18).rotateZ(Math.PI / 2).translate(x + 0.15, sy + sh, z));          // the round cap, axis along x
  bag.add('sandstone_carved', box(x - 0.12, sy + sh + 0.5, z - 0.1, x + 0.12, sy + sh + 0.62, z + 0.1));
  // the cap's two knotted dragons: a pair of ridged bands on its face, and a title panel
  for (const s of [-1, 1]) for (let k = 0; k < 4; k++) bag.add('sandstone_carved', box(x + 0.15, sy + sh + 0.12 + k * 0.1, z + s * (0.1 + k * 0.07) - 0.04, x + 0.19, sy + sh + 0.2 + k * 0.1, z + s * (0.1 + k * 0.07) + 0.04));
  bag.add('lacquer_black', box(x + 0.15, sy + sh - 0.42, z - 0.2, x + 0.17, sy + sh - 0.1, z + 0.2));                                              // the title, a dark panel
  // the inscription: twelve columns of broken strokes down the face
  for (let c = 0; c < 12; c++) for (let q = 0; q < 14; q++) {
    if ((c * 7 + q * 3) % 5 === 0) continue;
    const zz = z - sw + 0.09 + c * (2 * sw - 0.18) / 11, yy = sy + 0.15 + q * 0.12;
    bag.add('lacquer_black', box(x + 0.15, yy, zz - 0.02, x + 0.158, yy + 0.07 + 0.02 * ((c + q) % 3), zz + 0.02));
  }
  bag.add('granite_grey', box(x + 1.0, y, z - 0.4, x + 2.1, y + 0.18, z + 0.4));                                                              // the plinth under the head
  col.rect([x - 1.3, z - 0.85, x + 1.3, z + 0.85], y, y + 0.84); col.rect([x + 1.3, z - 0.3, x + 2.1, z + 0.3], y, y + 0.8); col.rect([x - 0.15, z - sw, x + 0.15, z + sw], y, sy + sh); 
}

/** dh_censer { at, y }: a bronze tripod burner on a stone stand with a lid of pierced work, ash and standing joss sticks. */
function censer(el, ctx) {
  const { bag, col } = ctx, [x, z] = el.at, y = el.y ?? 0;
  bag.add('granite_grey', lathe([[0.001, 0], [0.7, 0], [0.7, 0.18], [0.52, 0.26], [0.46, 0.8], [0.58, 0.9], [0.001, 0.92]], 12, null, x, y, z));
  bag.add('bronze', lathe([[0.001, 0.92], [0.42, 0.94], [0.58, 1.14], [0.56, 1.5], [0.4, 1.6], [0.46, 1.68], [0.001, 1.68]], 14, (th) => 1 + 0.035 * Math.abs(Math.cos(th * 4)), x, y, z));
  bag.add('bronze', lathe([[0.001, 0], [0.32, 0], [0.26, 0.22], [0.12, 0.42], [0.04, 0.55], [0.001, 0.62]], 10, null, x, y + 1.68, z));          // the lid
  for (const a of [0.4, 2.5, 4.6]) bag.add('bronze', rod([x + Math.cos(a) * 0.55, y + 1.48, z + Math.sin(a) * 0.55], [x + Math.cos(a) * 0.65, y + 1.62, z + Math.sin(a) * 0.65], 0.045, 6));   // the ears
  for (let k = 0; k < 7; k++) { const a = k * 0.9; bag.add('wood_dark', rod([x + Math.cos(a) * 0.35, y + 0.94, z + Math.sin(a) * 0.35], [x + Math.cos(a) * 0.4, y + 1.35 + 0.05 * (k % 3), z + Math.sin(a) * 0.4], 0.01, 4)); }
  col.circle(x, z, 0.72, y, y + 1.8);
}

export const APRON_ELEMENTS = { dh_stele: stele, dh_censer: censer };
