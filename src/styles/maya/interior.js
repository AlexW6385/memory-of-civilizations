// Inside the Castillo's summit temple (docs/settlements/chichen-itza.md §15): the floor and a dado painted red, the
// battle procession on the east and west walls, the jaguar throne and the chacmool in the middle, censers at the corners.
// The real inner temple (the Red Jaguar throne with its jade spots, found inside the earlier pyramid) is shown here in the
// summit chamber, since the stair into the pyramid's core is not built.

import { box, lathe } from '../../core/geom.js';
import { carved } from './meso.js';
import { chacmoolKit } from './meso.js';
import { jaguarThroneKit } from './ballcourt.js';
import { processionKit } from './sanctuary.js';

const RD = 'stucco_red', e = 0.02;
const brazier = () => carved('brazier', (k) => {
  k.geo('terracotta', lathe([[0.001, 0], [0.22, 0], [0.26, 0.3], [0.34, 0.5], [0.3, 0.55], [0.001, 0.45]], 12));
  k.geo('flame', lathe([[0.001, 0.46], [0.26, 0.5], [0.001, 0.62]], 8));
});
export function castilloInterior(bag, col, { cx, cz, w, d, y, H, wt }) {
  const x0 = cx - w + wt / 2, x1 = cx + w - wt / 2, z0 = cz - d + wt / 2, z1 = cz + d - wt / 2;
  bag.add(RD, box(x0, y, z0, x1, y + 0.03, z1));
  // the dado, broken at the side doorways (2.4 m) and the front's wide opening
  for (const [xa, xb, za, zb] of [[x0, x0 + e, z0, cz - 1.2], [x0, x0 + e, cz + 1.2, z1], [x1 - e, x1, z0, cz - 1.2], [x1 - e, x1, cz + 1.2, z1], [x0, cx - 1.2, z1 - e, z1]]) bag.add(RD, box(xa, y, za, xb, y + 0.9, zb));
  bag.add(RD, box(cx + 1.2, y, z1 - e, x1, y + 0.9, z1)); bag.add(RD, box(x0, y, z0, x0 + 1.2, y + 0.9, z0 + e)); bag.add(RD, box(x1 - 1.2, y, z0, x1, y + 0.9, z0 + e));
  bag.add('maya_blue', box(x0, y + 0.9, z0 + 1.2, x0 + e, y + 1.0, z1)); bag.add('maya_blue', box(x1 - e, y + 0.9, z0 + 1.2, x1, y + 1.0, z1));
  // the procession, in four lengths either side of each side doorway
  for (const zz of [-3.6, 3.6]) for (const s of [-1, 1]) processionKit().emit(bag, s < 0 ? x0 + e : x1 - e, y + 1.15, cz + zz, -s, 0, 1);
  // the throne and the chacmool on the middle line
  jaguarThroneKit(RD).emit(bag, cx, y, cz + 1.2, 0, -1, 1.3); col.rect([cx - 1.1, cz + 0.2, cx + 1.1, cz + 2.2], y, y + 1.4);
  chacmoolKit().emit(bag, cx, y, cz - 1.8, 0, -1, 1); col.rect([cx - 0.9, cz - 2.2, cx + 0.9, cz - 1.4], y, y + 1);
  for (const [bx, bz] of [[x0 + 1.0, z0 + 1.0], [x1 - 1.0, z0 + 1.0], [x0 + 1.0, z1 - 1.0], [x1 - 1.0, z1 - 1.0]]) {
    const g = brazier(); g.emit(bag, bx, y, bz, 0, 1, 1); col.circle(bx, bz, 0.35, y, y + 0.6);
  }
  void H;
}
