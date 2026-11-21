// The she, the earth altar of the market (docs/settlements/qin-xianyang.md §16): a low square mound of beaten earth in three tiers with a stone pillar (shezhu) at its
// middle, a table of offerings before it (a bronze tripod, pottery jars, a bowl of millet) and a pole with red streamers beside; the market's people made their offerings here.
import { box, rod, lathe } from '../../core/geom.js';

/** qin_she: { at [x, z] } — about 5.6 m square; its offering table on the south face. */
export function qinShe(el, { bag, col }) {
  const [x, z] = el.at;
  // the mound: three tiers of rammed earth over a brick kerb, each tier a ramming course deeper in
  bag.add('brick_grey', box(x - 2.8, 0, z - 2.8, x + 2.8, 0.1, z + 2.8));
  [[2.6, 0.1, 0.42], [1.9, 0.42, 0.72], [1.2, 0.72, 0.95]].forEach(([h, y0, y1]) => bag.add('earth_wall', box(x - h, y0, z - h, x + h, y1, z + h)));
  for (let y = 0.2; y < 0.95; y += 0.17) for (const [h, lim] of [[2.62, 0.42], [1.92, 0.72], [1.22, 0.95]]) if (y < lim - 0.04 && y > lim - 0.34) bag.add('mud_plaster', box(x - h, y, z - h, x + h, y + 0.025, z + h));
  col.rect([x - 2.8, z - 2.8, x + 2.8, z + 2.8], 0, 0.95);
  // the stone pillar, squared, with a rounded head, on a stone footing
  bag.add('granite_grey', box(x - 0.34, 0.95, z - 0.34, x + 0.34, 1.05, z + 0.34));
  bag.add('granite_grey', box(x - 0.2, 1.05, z - 0.2, x + 0.2, 2.2, z + 0.2));
  bag.add('granite_grey', lathe([[0.001, 0], [0.2, 0.01], [0.17, 0.12], [0.001, 0.2]], 8, null, x, 2.2, z));
  // the offerings' table, south of the mound, off the mound's edge
  const tz = z + 3.5;
  bag.add('timber', box(x - 0.9, 0.62, tz - 0.4, x + 0.9, 0.68, tz + 0.4));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bag.add('timber', box(x + sx * 0.82 - 0.04, 0, tz + sz * 0.32 - 0.04, x + sx * 0.82 + 0.04, 0.62, tz + sz * 0.32 + 0.04));
  col.rect([x - 0.95, tz - 0.45, x + 0.95, tz + 0.45], 0, 0.7);
  bag.add('bronze', lathe([[0.001, 0.12], [0.12, 0.1], [0.19, 0.2], [0.2, 0.3], [0.001, 0.3]], 10, null, x - 0.4, 0.68, tz));
  for (const dz of [-0.07, 0.07]) for (const dx of [-0.13, 0.13]) bag.add('bronze', rod([x - 0.4 + dx, 0.68, tz + dz * 1.4], [x - 0.4 + dx, 0.72, tz + dz * 1.4], 0.025, 5));
  for (const [dx, r] of [[0.2, 0.13], [0.55, 0.1]]) bag.add('terracotta', lathe([[0.001, 0], [r * 0.7, 0.01], [r, 0.13], [r * 0.6, 0.26], [r * 0.7, 0.3], [0.001, 0.3]], 10, null, x + dx, 0.68, tz));
  bag.add('terracotta', lathe([[0.001, 0], [0.12, 0.01], [0.15, 0.06], [0.001, 0.07]], 10, null, x + 0.05, 0.68, tz + 0.2));
  bag.add('paint_ochre', lathe([[0.001, 0.05], [0.1, 0.06], [0.001, 0.09]], 10, null, x + 0.05, 0.68, tz + 0.2));
  // the pole by the table's west end, with three red streamers
  bag.add('timber', rod([x - 1.6, 0, tz], [x - 1.6, 3.2, tz], 0.05, 6)); col.circle(x - 1.6, tz, 0.1, 0, 3.2);
  for (const [dy, len] of [[3.1, 0.8], [2.85, 0.65], [2.6, 0.5]]) bag.add('cloth_red', box(x - 1.6, dy - 0.12, tz - 0.01, x - 1.6 + len, dy, tz + 0.01));
}
