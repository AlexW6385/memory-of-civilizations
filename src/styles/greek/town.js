// The Greek town (Classical Athens; docs/settlements/athens.md §4–§5): courtyard houses of mudbrick
// on stone socles under tiled roofs; a bronze statue on its base; the
// Acropolis wall (the stoas, the Tholos and the market are in agora.js). Registered into the `greek` style beside the temple vocabulary.

import { STYLES } from '../../core/build.js';
import { box, frustum, lathe } from '../../core/geom.js';
import './index.js';
import './agora.js';
import './slope.js';

function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
/** greek_house: { rect, seed, y } — rooms round a court, plastered mudbrick on a stone socle, pent roofs of tile. */
function house(el, { bag, col }) {
  const rand = rng(el.seed || 1), [x0, z0, x1, z1] = el.rect, y = el.y ?? 0, h = 3.2 + (rand() < 0.3 ? 2.8 : 0), d = Math.min(4, (z1 - z0) * 0.38);
  const wings = [[x0, z0, x1, z0 + d], [x0, z0 + d, x0 + d * 0.9, z1], [x1 - d * 0.9, z0 + d, x1, z1]];
  if (rand() < 0.5) wings.push([x0 + d * 0.9, z1 - 1.2, x1 - d * 0.9, z1]);
  wings.forEach((r, i) => {
    const hh = i === 0 ? h : 3.2;
    bag.add('rubble', box(r[0], y - 0.6, r[1], r[2], y + 0.7, r[3]));
    bag.add('mud_plaster', box(r[0] + 0.02, y + 0.7, r[1] + 0.02, r[2] - 0.02, y + hh, r[3] - 0.02));
    col.rect(r, y - 0.6, y + hh);
    if (i < 3) {                                   // the tiled roofs, kept even in the simple (far) houses: they are cheap and they are the town
      const along = r[2] - r[0] > r[3] - r[1], rise = (along ? r[3] - r[1] : r[2] - r[0]) * 0.3;
      bag.add('roof_tile', frustum([r[0] - 0.3, r[1] - 0.3, r[2] + 0.3, r[3] + 0.3], y + hh, y + hh + rise, along ? 0 : (r[2] - r[0]) / 2 + 0.25, along ? 0 : (r[2] - r[0]) / 2 + 0.25, along ? (r[3] - r[1]) / 2 + 0.25 : 0, along ? (r[3] - r[1]) / 2 + 0.25 : 0));
    }
  });
}
/** statue: a bronze on a stepped base { c, h, y } (the Athena Promachos stands about 9 m). */
function statue(el, { bag, col }) {
  const [x, z] = el.c, h = el.h ?? 9, y = el.y ?? 0, b = h * 0.18;
  bag.add('marble', box(x - 2.2, y, z - 2.2, x + 2.2, y + b, z + 2.2)); col.rect([x - 2.2, z - 2.2, x + 2.2, z + 2.2], y, y + b);
  bag.add('bronze', lathe([[0.9, 0], [0.75, h * 0.45], [0.55, h * 0.7], [0.32, h * 0.78], [0.38, h * 0.86], [0.001, h * 0.92]], 10, null, x, y + b, z));
  bag.add('bronze', lathe([[0.06, 0], [0.06, h]], 6, null, x + 0.9, y + b, z));
  bag.add('bronze', lathe([[0.75, 0], [0.75, 0.08]], 14, null, x - 0.7, y + b + h * 0.5, z));
}
Object.assign(STYLES.greek.elements, { greek_house: house, statue });
