// The furnishing of the workers' houses of Giza by rule (docs/settlements/giza.md §16): the plan of a house from its lot and its
// seed (the same dice as the Old Kingdom's mud_house, so that the room and the court lie where it put them), the things
// of the room beyond the bench and the niche (storage jars, a chest, the low table on its mat), and the craft in the
// court's middle (the ground loom, the fish rack, the potter's turntable) where the court has the room.

import { box, lathe, fromTriangles } from '../../core/geom.js';
import { beamTris } from '../ming/index.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const TH = 0.45;

/** The plan of a house { rect, seed }: room, court, the door and the craft the court holds ('loom', 'fish', 'potter' or null) with its centre. */
export function housePlan(el) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, W = x1 - x0;
  rand();                                                                       // (the height)
  const court = rand() < 0.7, split = court ? x0 + W * (0.45 + rand() * 0.2) : x1;
  const xd = court ? (split + x1) / 2 : (x0 + split) / 2;
  const room = [x0 + TH / 2, z0 + TH / 2, split - TH / 2, z1 - TH / 2];
  const P = { court, split, xd, room, craft: null, at: null };
  if (!court) return P;
  const cx0 = split + TH / 2, cx1 = x1 - TH / 2, cz0 = z0 + TH / 2, cz1 = z1 - TH / 2;
  const bx0 = cx0 + 1.2, bx1 = cx1 - 1.0, bz0 = cz0 + 2.6, bz1 = cz1 - 1.9;       // the court's middle, clear of the oven, granary, quern, jars and the way from the door
  P.court = [cx0, cz0, cx1, cz1];
  if (bx1 - bx0 < 1.2 || bz1 - bz0 < 2.0) return P;
  const r = rng((el.seed || 1) * 3 + 17)();
  P.craft = r < 0.34 ? (bz1 - bz0 >= 3.0 ? 'loom' : 'potter') : r < 0.6 ? 'fish' : r < 0.86 ? 'potter' : null;
  if (P.craft === 'loom') P.at = [(bx0 + bx1) / 2, bz0 + 1.0];                   // the loom lies 2 m along z; the weaver kneels south of it
  else if (P.craft) P.at = [(bx0 + bx1) / 2, bz0 + (bz1 - bz0) / 2];
  return P;
}

const JAR = [[0.001, 0], [0.1, 0.02], [0.2, 0.2], [0.19, 0.38], [0.1, 0.5], [0.11, 0.55], [0.001, 0.55]];
const jar = (bag, x, y, z, s, mat = 'terracotta') => bag.add(mat, lathe(JAR.map(([r, h]) => [r * s, h * s]), 9, null, x, y, z));

/** The things of the room, on the west wall south of the sleeping niche and in the middle, in a furnished house. */
export function roomThings(bag, col, el) {
  const P = housePlan(el), [ix0, iz0, ix1, iz1] = P.room, rand = rng((el.seed || 1) * 5 + 9);
  // storage jars stoppered with mud, a chest, along the west wall
  let z = iz0 + 1.8;
  for (let k = 0; k < 3 && z < iz1 - 1.6; k++, z += 0.62) {
    jar(bag, ix0 + 0.42, 0, z, 1.25, rand() < 0.5 ? 'terracotta' : 'pottery_dark');
    bag.add('mud_plaster', lathe([[0.17, 0], [0.19, 0.05], [0.12, 0.12], [0.001, 0.14]], 9, null, ix0 + 0.42, 0.69, z));
    col.circle(ix0 + 0.42, z, 0.27, 0, 0.7);
  }
  z += 0.15;
  if (z < iz1 - 1.5) {
    bag.add('timber', box(ix0 + 0.1, 0.06, z, ix0 + 0.62, 0.52, z + 0.95));
    bag.add('wood_dark', box(ix0 + 0.08, 0.52, z - 0.02, ix0 + 0.64, 0.58, z + 0.97));
    bag.add('timber', box(ix0 + 0.1, 0, z + 0.04, ix0 + 0.16, 0.06, z + 0.12)); bag.add('timber', box(ix0 + 0.56, 0, z + 0.83, ix0 + 0.62, 0.06, z + 0.91));
    col.rect([ix0 + 0.08, z - 0.02, ix0 + 0.64, z + 0.97], 0, 0.58);
  }
  // the low table on its mat, loaves and a beer jar on it, the middle of the room
  const tx = (ix0 + ix1) / 2 + 0.35, tz = Math.min((iz0 + iz1) / 2 + 0.3, iz1 - 2.6);
  if (ix1 - ix0 > 3.2 && tz > iz0 + 1.6) {
    bag.add('reed_mat', box(tx - 0.85, 0.004, tz - 0.6, tx + 0.85, 0.02, tz + 0.6));
    bag.add('limestone_core', lathe([[0.001, 0], [0.3, 0], [0.12, 0.06], [0.1, 0.28], [0.34, 0.31], [0.34, 0.35], [0.001, 0.35]], 12, null, tx, 0.02, tz));
    for (let k = 0; k < 3; k++) bag.add('limewash_yellow', lathe([[0.001, 0], [0.08, 0.01], [0.09, 0.05], [0.05, 0.09], [0.001, 0.1]], 8, null, tx - 0.14 + k * 0.14, 0.37, tz + (k % 2) * 0.12 - 0.06));
    bag.add('terracotta', lathe([[0.04, 0], [0.1, 0.07], [0.14, 0.28], [0.11, 0.5], [0.06, 0.58], [0.001, 0.6]].map(([r, h]) => [r * 0.5, h * 0.5]), 8, null, tx + 0.52, 0.02, tz - 0.3));
    col.circle(tx, tz, 0.34, 0, 0.36);
  }
}

/** The craft in the court's middle (housePlan(el).craft at .at). */
export function courtCraft(bag, col, el) {
  const P = housePlan(el);
  if (!P.craft) return;
  const [x, z] = P.at;
  if (P.craft === 'loom') {
    // a horizontal ground loom: four pegs, two beams 1.9 m apart, the warp of linen stretched between them, the cloth woven
    // up from the south beam, a shed stick and a heddle bar raised on little forks, a basket of spindles by it
    for (const dx of [-0.34, 0.34]) for (const dz of [-0.98, 0.98]) bag.add('palm_trunk', lathe([[0.03, 0], [0.025, 0.2], [0.001, 0.2]], 6, null, x + dx, 0, z + dz));
    for (const dz of [-0.98, 0.98]) bag.add('timber', box(x - 0.4, 0.17, z + dz - 0.03, x + 0.4, 0.23, z + dz + 0.03));
    bag.add('linen', box(x - 0.31, 0.195, z - 0.95, x + 0.31, 0.205, z + 0.2));
    bag.add('cloth_white', box(x - 0.3, 0.195, z + 0.2, x + 0.3, 0.207, z + 0.95));
    for (const dz of [-0.35, 0.05]) { bag.add('timber', box(x - 0.36, 0.26, z + dz - 0.015, x + 0.36, 0.29, z + dz + 0.015)); for (const dx of [-0.34, 0.34]) bag.add('palm_trunk', lathe([[0.02, 0.2], [0.001, 0.27]], 5, null, x + dx, 0, z + dz)); }
    bag.add('wicker', lathe([[0.2, 0], [0.25, 0.14], [0.24, 0.2], [0.001, 0.2]], 8, null, x + 0.75, 0, z - 0.4));
    for (let k = 0; k < 3; k++) { const t = []; beamTris(t, [x + 0.7 + k * 0.05, 0.2, z - 0.4 - 0.1], [x + 0.78 + k * 0.05, 0.42, z - 0.4 + 0.08], 0.012, 0.012); bag.add('timber', fromTriangles(t)); }
    col.rect([x - 0.42, z - 1.02, x + 0.42, z + 1.02], 0, 0.3);
  } else if (P.craft === 'fish') {
    // a drying rack: two posts with forks, a pole across, split fish hung on it, a hearth of three stones under it with ash
    for (const dz of [-0.75, 0.75]) bag.add('palm_trunk', lathe([[0.045, 0], [0.04, 1.5], [0.001, 1.52]], 6, null, x, 0, z + dz));
    { const t = []; beamTris(t, [x, 1.42, z - 0.85], [x, 1.42, z + 0.85], 0.03, 0.03); bag.add('timber', fromTriangles(t)); }
    for (let k = 0; k < 7; k++) {
      const zz = z - 0.6 + k * 0.2, L = 0.3 + (k % 3) * 0.05;
      bag.add('hide_tan', box(x - 0.012, 1.4 - L, zz - 0.045, x + 0.012, 1.4, zz + 0.045));
      bag.add('hide_brown', box(x - 0.012, 1.4 - L - 0.07, zz - 0.04, x + 0.012, 1.4 - L, zz + 0.04));
    }
    bag.add('plaster_grey', lathe([[0.45, 0], [0.45, 0.02], [0.001, 0.02]], 12, null, x, 0, z));
    for (let k = 0; k < 3; k++) { const t = k * 2.1 + 0.4; bag.add('limestone_core', lathe([[0.001, 0], [0.1, 0.01], [0.11, 0.13], [0.001, 0.15]], 6, null, x + Math.cos(t) * 0.3, 0, z + Math.sin(t) * 0.3)); }
    col.rect([x - 0.12, z - 0.8, x + 0.12, z + 0.8], 0, 1.5);
  } else {
    // the potter's turntable: a stand of mud on a stub, the disc, a pot half raised on it, a heap of clay, finished pots drying on a mat
    bag.add('mudbrick', lathe([[0.3, 0], [0.26, 0.12], [0.1, 0.2], [0.001, 0.22]], 10, null, x - 0.3, 0, z - 0.2));
    bag.add('limestone_core', lathe([[0.001, 0.22], [0.28, 0.22], [0.28, 0.26], [0.001, 0.26]], 12, null, x - 0.3, 0, z - 0.2));
    bag.add('terracotta', lathe([[0.001, 0.26], [0.12, 0.26], [0.17, 0.36], [0.15, 0.46], [0.09, 0.5], [0.001, 0.5]], 10, null, x - 0.3, 0, z - 0.2));
    bag.add('banco_rough', lathe([[0.4, 0], [0.34, 0.14], [0.18, 0.24], [0.001, 0.27]], 9, null, x + 0.6, 0, z - 0.4));
    bag.add('reed_mat', box(x - 0.1, 0.004, z + 0.25, x + 1.0, 0.02, z + 0.8));
    for (let k = 0; k < 4; k++) jar(bag, x + 0.12 + (k % 2) * 0.5, 0.02, z + 0.42 + Math.floor(k / 2) * 0.3, 0.7 + (k % 3) * 0.08);
    col.circle(x - 0.3, z - 0.2, 0.3, 0, 0.5); col.circle(x + 0.6, z - 0.4, 0.38, 0, 0.27);
  }
}
