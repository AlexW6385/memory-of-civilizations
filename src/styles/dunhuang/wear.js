// The wear of the ground (docs/settlements/dunhuang.md §6b): the packed earth of the street with its two ruts of
// cart wheels, patches of darker earth where water was thrown, straw and chaff blown against the house feet, dung of
// the beasts of the caravans, scattered stones; at the cliff foot the talus of fallen conglomerate along the apron.
// Thin pieces a few millimetres to centimetres high (no colliders), merged as detail.
import { box } from '../../core/geom.js';
import { rng, riverX, XF, ZEND, STREET, CROSS, LANE_W, TOWN, GATE } from '../../settlements/dunhuang/layout.js';

const dry = (x, z = 0, w = 0) => Math.abs(x - riverX(z)) > 5.6 + w;   // not over the stream's bed

/** dh_streetwear { x0, x1, seed }: the main street between x0 and x1 and the cross lanes within the town. */
function streetwear(el, { bag }) {
  const r = rng(el.seed || 5), [x0, x1] = [el.x0 ?? STREET.x0 + 8, el.x1 ?? GATE.x + 10];
  // two ruts along the street's axis, broken into lengths
  for (const zc of [-0.9, 0.9]) for (let x = x0; x < x1; x += 4 + r() * 6) { const L = 3 + r() * 5; if (dry(x, 0, 0) && dry(x + L, 0, 0)) bag.add('banco_smooth', box(x, 0.006, zc - 0.17, x + L, 0.011, zc + 0.17)); }
  // darker patches of earth (water thrown out, urine of the animals) and paler dust drifts
  for (let k = 0; k < 160; k++) {
    const x = x0 + r() * (x1 - x0), z = (r() - 0.5) * 11, w = 0.4 + r() * 1.4, d = 0.3 + r() * 0.9;
    if (!dry(x, z, w)) continue;
    bag.add(k % 3 ? 'banco_rough' : 'mud_plaster', box(x, 0.012 + (k % 3) * 0.004, z, x + w, 0.015 + (k % 3) * 0.004, z + d));
  }
  // straw and chaff along the house feet, dung, stones
  for (let k = 0; k < 260; k++) {
    const x = x0 + r() * (x1 - x0), side = r() < 0.5 ? -1 : 1, z = side * (4.6 + r() * 1.3) + (r() - 0.5) * 0.4, m = r();
    if (!dry(x, z, 0.8)) continue;
    if (m < 0.5) bag.add('thatch', box(x, 0.02, z, x + 0.15 + r() * 0.5, 0.026, z + 0.06 + r() * 0.12));
    else if (m < 0.72) bag.add('hide_brown', box(x, 0.02, z, x + 0.14 + r() * 0.1, 0.07, z + 0.14 + r() * 0.1));
    else bag.add('rubble', box(x, 0.0, z, x + 0.1 + r() * 0.22, 0.05 + r() * 0.1, z + 0.1 + r() * 0.18));
  }
  // the cross lanes: ruts and litter
  for (const c of CROSS) {
    for (let z = -TOWN[3] + 8; z < TOWN[3] - 8; z += 3 + r() * 4) { if (Math.abs(z) < 8) continue; bag.add('banco_smooth', box(c - 0.5, 0.006, z, c - 0.2, 0.011, z + 2.5 + r() * 3)); bag.add('banco_smooth', box(c + 0.35, 0.006, z, c + 0.65, 0.011, z + 2.5 + r() * 3)); }
    for (let k = 0; k < 40; k++) { const z = (r() - 0.5) * 2 * (TOWN[3] - 8); if (Math.abs(z) < 7) continue; bag.add(k % 2 ? 'thatch' : 'rubble', box(c + (r() - 0.5) * LANE_W * 0.8, 0.0, z, c + (r() - 0.5) * LANE_W * 0.8 + 0.25, 0.03 + (k % 2) * 0.05, z + 0.12)); }
  }
}

/** dh_talus: boulders and rubble of the fallen conglomerate along the apron's outer edge and in the lee of the stairs. */
function talus(el, { bag }) {
  const r = rng(el.seed || 11);
  for (let k = 0; k < 150; k++) {
    const z = -ZEND + 4 + r() * (2 * ZEND - 8);
    if (Math.abs(z) < 14) continue;
    const x = XF + 7.2 + r() * 2.6, s = 0.12 + r() * r() * 0.7;
    bag.add('rubble', box(x, 0.0, z, x + s * (0.8 + r() * 0.8), s * (0.5 + r() * 0.6), z + s * (0.8 + r() * 0.8)));
  }
  // sand drifted against the foot of the cliff, a pale band
  for (let z = -ZEND + 6; z < ZEND - 6; z += 3 + r() * 5) bag.add('banco_smooth', box(XF + 6.6, 0.0, z, XF + 7.3 + r() * 1.5, 0.1 + r() * 0.1, z + 3 + r() * 5));
}
export const WEAR_ELEMENTS = { dh_streetwear: streetwear, dh_talus: talus };
