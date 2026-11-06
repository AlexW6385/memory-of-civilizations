// The Grand Canal's eastern reach (docs/settlements/versailles.md §1a): its stone edges with their coping, the head
// toward the Apollo basin, and — where the compressed settlement ends — a landing: a flight of steps going down into
// the water across the canal's width between two piers with vases, a paved quay behind, mooring posts with their
// rings. The canal itself runs on, beyond the settlement's edge, 1.67 km to the west.
//
// canal_quay: { x0 (the head), x1 (the landing's top step), w (width), y (the ground), water (its level), floor (the bed) }

import { box, lathe } from '../../core/geom.js';

const ST = 'limestone', CP = 'sandstone_dressed';

export function canalQuay(el, { bag, col }) {
  const { x0, x1, w, y = 0, water = -1, floor = -2.2 } = el, hw = w / 2 - 1.5;    // the walls stand 1.5 m inside the dug edge, hiding the bank
  // the side walls and their coping, and the head wall toward the Apollo basin
  for (const s of [-1, 1]) {
    const za = s * hw, zb = s * (hw + 2.2);
    bag.add(ST, box(x1, floor - 0.2, Math.min(za, zb), x0 + 0.7, y - 0.12, Math.max(za, zb)));
    bag.add(CP, box(x1 - 0.1, y - 0.12, Math.min(s * (hw - 0.12), zb), x0 + 0.8, y + 0.12, Math.max(s * (hw - 0.12), zb)));
    col.rect([x1 - 0.1, Math.min(s * (hw - 0.12), zb), x0 + 0.8, Math.max(s * (hw - 0.12), zb)], floor, y + 0.12);
  }
  bag.add(ST, box(x0 - 1.5, floor - 0.2, -hw, x0 + 0.7, y - 0.12, hw)); bag.add(CP, box(x0 - 1.62, y - 0.12, -hw - 2.2, x0 + 0.8, y + 0.12, hw + 2.2));
  col.rect([x0 - 1.62, -hw, x0 + 0.8, hw], floor, y + 0.12);
  // the landing: steps from the quay down under the water, a tread of 0.42, a rise of 0.17
  const n = Math.ceil((y + 0.12 - (water - 0.6)) / 0.17);
  for (let i = 0; i < n; i++) {
    const top = y + 0.12 - (i + 1) * 0.17, xa = x1 + i * 0.42;
    bag.add(CP, box(xa, floor - 0.2, -hw, xa + 0.42, top, hw));
  }
  col.ramp([x1, -hw, x1 + n * 0.42, hw], water - 0.5, y + 0.12, 'w');
  // the quay behind, paved, with its kerb; the piers with their vases at the steps' ends; mooring posts with rings
  bag.add('flagstone', box(x1 - 9, y - 0.3, -hw - 6, x1, y + 0.12, hw + 6)); col.floor([x1 - 9, -hw - 6, x1, hw + 6], y + 0.12);
  for (const s of [-1, 1]) {
    const zc = s * (hw + 0.35);
    bag.add(CP, box(x1 - 0.9, y + 0.12, zc - 0.55, x1 + 0.2, y + 1.3, zc + 0.55)); bag.add(CP, box(x1 - 1.0, y + 1.3, zc - 0.65, x1 + 0.3, y + 1.45, zc + 0.65));
    bag.add(CP, lathe([[0.3, 0], [0.2, 0.12], [0.16, 0.25], [0.42, 0.6], [0.4, 0.9], [0.24, 1.0], [0.3, 1.08], [0.001, 1.1]], 14, null, x1 - 0.35, y + 1.45, zc));
    col.rect([x1 - 1.0, zc - 0.65, x1 + 0.3, zc + 0.65], y, y + 2.6);
    for (const zz of [s * hw * 0.55, s * hw * 0.2]) {
      bag.add('timber', lathe([[0.13, 0], [0.12, 1.0], [0.14, 1.05], [0.001, 1.15]], 8, null, x1 - 0.6, y + 0.12, zz));
      bag.add('iron', lathe([[0.08, 0], [0.1, 0.02], [0.08, 0.04]], 10, null, x1 - 0.6, y + 0.6, zz));
      col.circle(x1 - 0.6, zz, 0.15, y, y + 1.2);
    }
  }
}
