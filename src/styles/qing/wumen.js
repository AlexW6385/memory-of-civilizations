// The Meridian Gate's great hall inside (docs/settlements/qing-beijing.md §31): the emperor's seat on a low dais at the south
// side facing the forecourt, a great drum on its stand at the west end and a hanging bell in a frame at the east end.
import { box, lathe } from '../../core/geom.js';
import { Parts, limb } from './carving.js';

/** wumen_fittings: { rect: [x0, z0, x1, z1] (the hall's footprint), y (its floor) } — the hall faces south. */
export function wumenFittings(el, { bag, col }) {
  const [x0, z0, x1, z1] = el.rect, y = el.y + 0.04, cx = (x0 + x1) / 2, P = new Parts();
  const zs = z1 - 1.1;                                         // the dais against the south front
  // the dais: a red-lacquered base between marble mouldings, two steps on the north side, the seat, the screen behind
  P.add('marble_smooth', box(cx - 4.2, 0, zs - 3.6, cx + 4.2, 0.12, zs + 0.2));
  P.add('lacquer_red', box(cx - 4.0, 0.12, zs - 3.4, cx + 4.0, 0.62, zs));
  P.add('marble_smooth', box(cx - 4.1, 0.62, zs - 3.5, cx + 4.1, 0.7, zs + 0.1));
  P.add('marble_smooth', box(cx - 1.6, 0, zs - 4.2, cx + 1.6, 0.2, zs - 3.6)); P.add('marble_smooth', box(cx - 1.6, 0.2, zs - 3.9, cx + 1.6, 0.42, zs - 3.4));
  const sy = 0.7, sz = zs - 1.6;
  P.add('gilt_bronze', box(cx - 0.65, sy + 0.1, sz - 0.4, cx + 0.65, sy + 0.5, sz + 0.4));
  P.add('gilt_bronze', box(cx - 0.65, sy + 0.5, sz + 0.34, cx + 0.65, sy + 1.45, sz + 0.44));
  for (const s of [-1, 1]) P.add('gilt_bronze', box(cx + s * 0.62 - 0.04, sy + 0.5, sz - 0.4, cx + s * 0.62 + 0.04, sy + 0.9, sz + 0.4));
  for (const s of [-1, 1]) P.add('lacquer_red', box(cx + s * 0.9 - 0.1, sy + 0.1, sz + 0.4, cx + s * 0.9 + 0.1, sy + 0.1 + 0.01, sz + 0.5));
  for (let i = -2; i <= 2; i++) {                              // the screen: five leaves, each with a gilt roundel
    const x = cx + i * 0.95;
    P.add('lacquer_red', box(x - 0.46, sy, zs - 0.5, x + 0.46, sy + 2.9, zs - 0.42));
    P.add('gilt_bronze', lathe([[0.001, 0], [0.3, 0], [0.3, 0.02], [0.001, 0.02]], 10).rotateX(Math.PI / 2).translate(x, sy + 1.9, zs - 0.4));
    P.add('gilt_bronze', box(x - 0.46, sy + 2.9, zs - 0.52, x + 0.46, sy + 3.0, zs - 0.4));
  }
  col.rect([cx - 4.2, zs - 4.2, cx + 4.2, zs + 0.2], y, y + 0.72);
  // the drum (gu): a barrel of red lacquer with hide heads and a ring of gilt studs, on a stand, at the west end
  const dx = x0 + 4.5, dz = (z0 + z1) / 2, dy = 0.9;
  P.add('lacquer_red', box(dx - 0.9, 0, dz - 0.55, dx + 0.9, 0.12, dz + 0.55)); P.add('lacquer_red', box(dx - 0.7, 0.12, dz - 0.5, dx - 0.5, dy, dz + 0.5)); P.add('lacquer_red', box(dx + 0.5, 0.12, dz - 0.5, dx + 0.7, dy, dz + 0.5));
  P.add('lacquer_red', lathe([[0.5, -0.8], [0.7, -0.4], [0.75, 0], [0.7, 0.4], [0.5, 0.8]], 14).rotateZ(Math.PI / 2).translate(dx, dy + 0.75, dz));
  for (const s of [-1, 1]) P.add('hide_tan', lathe([[0.001, 0], [0.48, 0], [0.5, 0.03], [0.001, 0.03]], 14).rotateZ(Math.PI / 2).translate(dx + s * 0.8 - (s > 0 ? 0 : 0.03), dy + 0.75, dz));
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; P.add('gilt_bronze', lathe([[0.001, 0], [0.025, 0], [0.001, 0.03]], 5, null, dx - 0.2 + 0.0, dy + 0.75 + Math.cos(a) * 0.73, dz + Math.sin(a) * 0.73)); }
  col.rect([dx - 0.9, dz - 0.6, dx + 0.9, dz + 0.6], y, y + 1.8);
  // the bell: a bronze bell hung from the beam of a red frame, at the east end
  const bx = x1 - 4.5, bz = (z0 + z1) / 2;
  for (const s of [-1, 1]) { P.add('lacquer_red', box(bx - 1.0, 0, bz + s * 1.0 - 0.12, bx + 1.0, 0.18, bz + s * 1.0 + 0.12)); P.add('lacquer_red', limb([bx, 0.18, bz + s * 1.0], [bx, 3.0, bz + s * 0.12], 0.1, 0.07, 6)); }
  P.add('lacquer_red', limb([bx, 3.0, bz - 0.2], [bx, 3.0, bz + 0.2], 0.1, 0.1, 6)); P.add('lacquer_red', box(bx - 0.12, 2.9, bz - 1.0, bx + 0.12, 3.05, bz + 1.0));
  P.add('gilt_bronze', limb([bx, 2.9, bz], [bx, 2.4, bz], 0.04, 0.04, 5));
  P.add('bronze', lathe([[0.25, 0], [0.4, 0.12], [0.5, 0.6], [0.58, 1.0], [0.4, 1.04], [0.25, 1.0]], 12, null, bx, 1.4, bz));
  col.rect([bx - 1.0, bz - 1.2, bx + 1.0, bz + 1.2], y, y + 3.0);
  P.emit(bag, 0, y, 0);
}
