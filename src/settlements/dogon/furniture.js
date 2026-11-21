// A Dogon village, c. 1930 — street furniture of the place that the style does not hold (docs/settlements/dogon.md §16.1): the stone-curbed
// wells of the place, and the bird-scarer's cord of dry gourds. Registered into the style's element table from here; nothing in src/styles is edited.
import { box, lathe, rod, place } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import '../../styles/dogon/index.js';

const hv = (x, z, k = 0) => { let h = Math.imul(Math.floor(x * 131.07) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(Math.floor(z * 97.31) + 0x7f4a7c15 + k, 0xc2b2ae35); h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; return (h >>> 0) / 4294967296; };
export { hv };

/**
 * dg_well: { at: [x, z], y, seed }: a dug well with a curb of fieldstones laid dry (about 1.3 m across, 0.5 m high), two forked posts of wood
 * either side with a cross-pole, a cord over it with a leather bucket and a calabash dipper at the curb, a clay trough for the goats on the
 * east side with a wet dark patch of beaten earth round it and a few flat stones to stand on. [inferred: the dry-country dug well; the
 * village's water is scarce, dossier §9]. Collides as one disc; the curb is the only solid.
 */
function well(el, { bag, col }) {
  const [x, z] = el.at, y = el.y ?? 0, s = el.seed ?? 1;
  const R = 0.72, H = 0.52;
  // the curb: two courses of rubble stones round the shaft, each different (by hash of its own place)
  for (let course = 0; course < 2; course++) for (let k = 0; k < 11; k++) {
    const a = (k + course * 0.5) / 11 * Math.PI * 2 + 0.2 * hv(x, z, k), r = R + 0.04 * hv(x, z, k + 20), sz = 0.2 + 0.08 * hv(x + k, z, course + 3);
    bag.add('schist_rubble', lathe([[sz, 0], [sz * 0.9, 0.16], [sz * 0.5, 0.26], [0.001, 0.28]], 6, null, x + Math.cos(a) * r, y + course * 0.24, z + Math.sin(a) * r));
  }
  bag.add('mud_plaster', lathe([[R + 0.3, 0], [R + 0.28, 0.04], [R - 0.05, 0.05]], 14, null, x, y + 0.02, z));          // mud mortared between and over, the lip smoothed
  bag.add('opening', lathe([[0.001, H + 0.03], [R - 0.18, H + 0.03]], 12, null, x, y, z));                              // the dark of the shaft
  // two forked posts and the pole over the mouth
  const px = [x - 0.95, x + 0.95];
  for (const [i, p] of px.entries()) {
    bag.add('wood_dark', rod([p, y - 0.05, z], [p, y + 1.65, z], 0.075, 6));
    for (const d of [-1, 1]) bag.add('wood_dark', rod([p, y + 1.5, z], [p + d * 0.12, y + 1.82, z + 0.03 * d], 0.04, 5));
    bag.add('schist_rubble', lathe([[0.25, 0], [0.2, 0.12], [0.001, 0.16]], 6, null, p + (i ? 0.2 : -0.2), y, z + 0.1));      // a stone wedged at the foot
  }
  bag.add('wood_dark', rod([px[0] - 0.12, y + 1.78, z], [px[1] + 0.12, y + 1.79, z], 0.05, 6));
  // the cord over the pole: two runs down, one to a leather bucket at the curb's lip, the other to a hand's end
  bag.add('rope_fibre', rod([x - 0.08, y + 1.76, z], [x - 0.12, y + 0.95, z], 0.012, 4));
  bag.add('rope_fibre', rod([x + 0.08, y + 1.76, z], [x + 0.35, y + 1.0, z - 0.05], 0.012, 4));
  const bx = x + 0.55, bz = z + 0.9;
  bag.add('hide_brown', lathe([[0.001, 0], [0.16, 0.02], [0.19, 0.2], [0.2, 0.3], [0.17, 0.3]], 8, null, bx, y, bz));        // the bucket of hide, set down
  bag.add('rope_fibre', rod([bx - 0.19, y + 0.3, bz], [bx + 0.19, y + 0.3, bz], 0.012, 4));
  bag.add('wood_ochre', lathe([[0.001, 0], [0.09, 0.03], [0.12, 0.1], [0.08, 0.2], [0.04, 0.26], [0.03, 0.32]], 8, null, x - 0.6, y + H, z + 0.55));   // the calabash dipper on the curb
  // the trough: a hollowed log on two stones, east of the well, and the wet earth round it
  const tx = x + 2.1, tz = z + 0.3;
  bag.add('wood_dark', box(tx - 0.85, y + 0.16, tz - 0.22, tx + 0.85, y + 0.4, tz + 0.22));
  bag.add('water', box(tx - 0.75, y + 0.37, tz - 0.14, tx + 0.75, y + 0.385, tz + 0.14));
  for (const d of [-0.6, 0.6]) bag.add('schist_rubble', lathe([[0.22, 0], [0.18, 0.1], [0.001, 0.16]], 6, null, tx + d, y, tz));
  bag.add('pottery_dark', lathe([[0.001, 0], [2.6 + 0.2 * hv(x, z, 40), 0]], 14, null, x + 0.9, y + 0.006, z + 0.5));    // wet, trodden dark
  for (let k = 0; k < 4; k++) bag.add('granite_rough', lathe([[0.3, 0], [0.26, 0.04], [0.001, 0.05]], 6, null, x - 0.9 + k * 0.75, y + 0.006, z + 1.6 + 0.3 * hv(x + k, z, 50)));
  col.circle(x, z, R + 0.3, y - 0.1, y + H);
  void s;
}

/** dg_scare: { at: [x, z], y, seed }: a pole with a cord of dry gourds across the millet that clatter in the wind (the bird-scarer; dossier §13's watchmen's platforms). */
function scare(el, { bag }) {
  const [x, z] = el.at, y = el.y ?? 0;
  bag.add('wood_dark', rod([x, y, z], [x + 0.05, y + 2.4, z], 0.04, 5));
  bag.add('wood_dark', rod([x + 2.4, y, z + 0.6], [x + 2.35, y + 2.2, z + 0.6], 0.04, 5));
  bag.add('rope_fibre', rod([x + 0.05, y + 2.35, z], [x + 2.35, y + 2.15, z + 0.6], 0.008, 4));
  for (let k = 1; k < 6; k++) { const t = k / 6, gx = x + 0.05 + 2.3 * t, gy = y + 2.35 - 0.2 * t - 0.25 - 0.08 * hv(gx, z, k), gz = z + 0.6 * t; bag.add('wood_ochre', lathe([[0.001, 0], [0.06, 0.03], [0.08, 0.09], [0.05, 0.17], [0.03, 0.2]], 6, null, gx, gy, gz)); bag.add('rope_fibre', rod([gx, gy + 0.2, gz], [gx, y + 2.35 - 0.2 * t, gz], 0.006, 3)); }
}
let done = false;
export function registerFurniture() {
  if (done) return; done = true;
  const E = STYLES.dogon.elements;
  E.dg_well = well; E.dg_scare = scare;
}
registerFurniture();
void place;
