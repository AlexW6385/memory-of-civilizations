// The court of the ancestral halls dressed (docs/settlements/shang-yinxu.md §4a): the diviners' braziers with their plastrons, two great
// dings on plinths before the hall's stair, standards with pennants, drums on stands, the chariots parked on the court's sides, rows of
// water jars and benches by the gate, posts with ropes along the court's edges, tripod lamps on the axis, a drain of stones.
import { box, lathe, rod } from '../../core/geom.js';
import { vessel, wheel } from './geo.js';
import { chariot } from './ritual.js';
import { AXIS, COURT, HALL } from '../../settlements/shang-yinxu/layout.js';

const tripod = (bag, x, z, h = 1.0) => { bag.add('bronze', lathe([[0.001, 0], [0.15, 0.02], [0.04, h * 0.5], [0.04, h * 0.9], [0.14, h], [0.001, h + 0.02]], 8, null, x, 0, z)); bag.add('flame', lathe([[0.001, 0], [0.07, 0.04], [0.001, 0.26]], 6, null, x, h + 0.15, z)); };
export function shangCourt(el, { bag, col }) {
  // the divination braziers in a row, a mat before each with its plastron and tongs
  for (let k = 0; k < 4; k++) { const x = 4 + k * 10.5, z = -30.9;
    bag.add('bronze', lathe([[0.001, 0.3], [0.3, 0.34], [0.34, 0.5], [0.001, 0.5]], 10, null, x, 0, z)); bag.add('flame', lathe([[0.001, 0], [0.1, 0.05], [0.001, 0.3]], 6, null, x, 0.5, z)); col.circle(x, z, 0.34, 0, 0.55);
    bag.add('reed_mat', box(x - 1.0, 0.01, z + 0.5, x + 1.0, 0.04, z + 2.2)); bag.add('ivory', box(x - 0.2, 0.04, z + 1.1, x + 0.2, 0.06, z + 1.6)); bag.add('bronze', rod([x + 0.5, 0.05, z + 1.0], [x + 0.2, 0.05, z + 1.5], 0.012, 4));
    for (let q = 0; q < 3; q++) bag.add('ivory', box(x - 0.9 + q * 0.18, 0.04, z - 0.9, x - 0.75 + q * 0.18, 0.1, z - 0.55)); }
  // the great dings on plinths of rammed earth before the stair, standards with pennants beyond them
  for (const s of [-1, 1]) { const x = AXIS + s * 9.5, z = -71.5;
    bag.add('earth_wall', box(x - 1.4, 0, z - 1.4, x + 1.4, 0.55, z + 1.4)); col.rect([x - 1.4, z - 1.4, x + 1.4, z + 1.4], 0, 0.55); vessel('ding', bag, x, 0.55, z, 2.3);
    const px = AXIS + s * 15.5; bag.add('timber', lathe([[0.16, 0], [0.12, 7.2]], 8, null, px, 0, z + 1)); col.circle(px, z + 1, 0.2, 0, 7.2);
    bag.add('timber', box(px - 0.9, 6.6, z + 0.95, px + 0.9, 6.7, z + 1.05)); for (const q of [-0.7, 0, 0.7]) bag.add(q ? 'cloth_red' : 'cloth_black', box(px + q - 0.2, 4.8, z + 0.97, px + q + 0.2, 6.6, z + 1.03));
    bag.add('bronze', lathe([[0.001, 7.2], [0.2, 7.3], [0.08, 7.6], [0.001, 7.8]], 8, null, px, 0, z + 1)); }
  // drums on stands at the court's flanks (the hide heads of crocodile skin), tripod lamps along the axis
  for (const [x, z] of [[-3, -64], [43, -64], [-3, 8], [43, 8]]) { bag.add('timber_red', lathe([[0.001, 0.4], [0.45, 0.5], [0.55, 0.9], [0.45, 1.3], [0.001, 1.35]], 12, null, x, 0, z)); bag.add('hide_tan', lathe([[0.001, 0], [0.5, 0]], 12, null, x, 1.35, z)); col.circle(x, z, 0.55, 0, 1.4);
    for (const a of [0.5, 2.6, 4.7]) bag.add('timber', rod([x + Math.cos(a) * 0.5, 0.4, z + Math.sin(a) * 0.5], [x + Math.cos(a) * 0.15, 0.1, z + Math.sin(a) * 0.15], 0.04, 4)); }
  for (const z of [-62, -20, 20, 38]) for (const s of [-1, 1]) tripod(bag, AXIS + s * 4.6, z);
  // the chariots parked on the court's sides, their teams beside (the beasts are in town.js)
  chariot(bag, col, 0.5, 14, 0); chariot(bag, col, 40, 18, 0);
  // water jars and benches by the gate, mats where the petitioners wait
  for (const s of [-1, 1]) { for (let k = 0; k < 4; k++) bag.add('pottery_dark', lathe([[0.001, 0], [0.2, 0.02], [0.3, 0.3], [0.22, 0.55], [0.12, 0.62], [0.001, 0.62]], 9, null, AXIS + s * 7 + k * 0.7 * s, 0, 37.4)); }
  for (const [x, z] of [[4, 40], [32, 40], [-2, -12], [42, -12]]) { bag.add('timber', box(x, 0.4, z, x + 2.4, 0.46, z + 0.4)); for (const a of [0.15, 2.1]) bag.add('timber', box(x + a, 0, z + 0.05, x + a + 0.1, 0.4, z + 0.35)); col.rect([x, z, x + 2.4, z + 0.4], 0, 0.46); bag.add('reed_mat', box(x - 0.3, 0.01, z + 0.6, x + 2.7, 0.04, z + 1.8)); }
  // posts with ropes along the court's edges (a hitching line for the beasts; a rope is no barrier)
  for (const x of [COURT[0] + 1.2, COURT[2] - 1.2]) for (let z = -20; z <= 36; z += 7) { bag.add('timber', box(x - 0.08, 0, z - 0.08, x + 0.08, 1.2, z + 0.08)); if (z < 36) bag.add('rope_fibre', rod([x, 1.0, z], [x, 1.0, z + 7], 0.012, 4)); }
  // a drain of stones across the court's southern end, a line of stone bases where the old colonnade stood
  bag.add('granite_grey', box(COURT[0] + 4, 0.0, 30, COURT[2] - 4, 0.05, 30.5));
  for (let k = 0; k < 9; k++) { const x = AXIS - 20 + k * 5; bag.add('granite_grey', lathe([[0.3, 0], [0.26, 0.12], [0.001, 0.14]], 8, null, x, 0, 26)); }
  // the offering tables before the stair: low tables of black lacquer with the bronze sets, a plinth of jars of grain wine beside each
  for (const s of [-1, 1]) { const x = AXIS + s * 5.2, z = -64.5;
    bag.add('lacquer_black', box(x - 1.3, 0.34, z - 0.5, x + 1.3, 0.4, z + 0.5)); for (const a of [-1.15, 1.15]) for (const b of [-0.35, 0.35]) bag.add('lacquer_black', box(x + a - 0.05, 0, z + b - 0.05, x + a + 0.05, 0.34, z + b + 0.05)); col.rect([x - 1.3, z - 0.5, x + 1.3, z + 0.5], 0, 0.4);
    vessel('ding', bag, x - 0.8, 0.4, z, 0.9); vessel('gui', bag, x - 0.1, 0.4, z + 0.1, 0.9); vessel('zun', bag, x + 0.55, 0.4, z, 1.1); vessel('jue', bag, x + 1.0, 0.4, z - 0.1, 1); vessel('gu', bag, x + 1.0, 0.4, z + 0.25, 1);
    bag.add('reed_mat', box(x - 1.7, 0.01, z + 0.7, x + 1.7, 0.04, z + 2.2));
    for (let k = 0; k < 5; k++) bag.add(k % 2 ? 'pottery_dark' : 'terracotta', lathe([[0.001, 0], [0.2, 0.02], [0.3, 0.3], [0.22, 0.55], [0.12, 0.62], [0.001, 0.62]], 9, null, x + s * 2.4 + (k % 3) * 0.7 * s, 0, z - 0.4 + Math.floor(k / 3) * 0.8)); }
  // the drying frames of the divination craft at the court's flanks: shells and scapulae hung to cure, a cleaning bench with a mortar and basket
  for (const [x, z, s] of [[-3.4, -46, 1], [43.4, -46, -1], [-3.4, -36, 1], [43.4, -36, -1]]) {
    for (const a of [0, 3.2]) bag.add('timber', box(x - 0.06, 0, z + a - 0.06, x + 0.06, 2.0, z + a + 0.06)); bag.add('timber', box(x - 0.06, 1.9, z, x + 0.06, 2.0, z + 3.2)); col.rect([x - 0.1, z - 0.1, x + 0.1, z + 3.3], 0, 2);
    for (let k = 0; k < 8; k++) { const zz = z + 0.2 + k * 0.38; bag.add('rope_fibre', rod([x, 1.9, zz], [x, 1.45, zz], 0.008, 3)); bag.add(k % 3 ? 'ivory' : 'hide_tan', box(x - 0.1 + s * 0.02, 1.0, zz - 0.14, x + 0.1 + s * 0.02, 1.45, zz + 0.14)); }
    bag.add('timber', box(x + s * 1.2, 0.5, z + 0.8, x + s * 2.6, 0.58, z + 1.6)); for (const a of [0.1, 1.3]) for (const b of [0.9, 1.5]) bag.add('timber', box(x + s * (1.2 + a), 0, z + b - 0.05, x + s * (1.2 + a) + 0.1, 0.5, z + b + 0.05));
    col.rect([x + Math.min(s * 1.2, s * 2.6), z + 0.8, x + Math.max(s * 1.2, s * 2.6), z + 1.6], 0, 0.58);
    for (let k = 0; k < 5; k++) bag.add('ivory', box(x + s * (1.4 + k * 0.22), 0.58, z + 1.0, x + s * (1.4 + k * 0.22) + 0.15, 0.62, z + 1.4));
    bag.add('granite_grey', lathe([[0.001, 0.58], [0.2, 0.58], [0.16, 0.76], [0.001, 0.76]], 8, null, x + s * 2.2, 0, z + 1.2)); bag.add('wicker', lathe([[0.001, 0], [0.3, 0.02], [0.34, 0.3], [0.001, 0.3]], 8, null, x + s * 1.2, 0, z + 2.4)); }
  // stacks of wood for the burnt offerings (liao), split billets in crossed layers, beside the pits' ends
  for (const [x, z] of [[-0.6, -57], [40.6, -57]]) for (let l = 0; l < 5; l++) bag.add(l % 2 ? 'bark_grey' : 'timber', l % 2 ? box(x - 0.9, 0.15 + l * 0.18, z - 0.7, x + 0.9, 0.3 + l * 0.18, z + 0.7) : box(x - 0.7, 0.15 + l * 0.18, z - 0.9, x + 0.7, 0.3 + l * 0.18, z + 0.9));
  // tether posts for the beasts led to the sacrifice, between the two rows of pits (the beasts are in town.js)
  for (const x of [6, 12.5, 27.5, 34]) { bag.add('timber', lathe([[0.1, 0], [0.08, 1.3]], 6, null, x, 0, -49)); bag.add('bronze', lathe([[0.001, 1.3], [0.1, 1.34], [0.001, 1.42]], 6, null, x, 0, -49)); col.circle(x, -49, 0.14, 0, 1.3); }
  void HALL; void wheel;
}
