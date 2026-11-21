// Han Chang'an, c. 100 BC — the ward altars (docs/settlements/han-changan.md §18): each li, the village-sized ward, kept its altar of the soil (she 社) at the street before its gate,
// a square mound of rammed earth with a stone post and the offering table, and the ward's people gathered there at the spring and autumn sacrifices [inferred from the
// she altars of Han villages known from texts and the li's ritual role; the form is ours]. Built in the wards' plan (`han_altar` elements, one per ward) outside the ward's west wall, 8 m from its first gate, in the street
// the walk follows (6 m off the walk's line). Pure geometry, no counters, no Math.random.
import { STYLES } from '../../core/build.js';
import { box, lathe } from '../../core/geom.js';
import { WARDS, WARD_WALL } from './layout.js';

/** han_altar: { at: [x, z] } — a mound of rammed earth 1.9 m square and 0.42 m high with a stepped stone kerb, a stone post (0.26 m square, 1.5 m), a bronze bowl of offerings on a stone table. */
function altar({ at }, { bag, col }) {
  const [x, z] = at, h = 0.95, k = 1.02;
  bag.add('bluestone', box(x - k, 0, z - k, x + k, 0.12, z + k));
  bag.add('earth_wall', box(x - h, 0.12, z - h, x + h, 0.42, z + h));
  col.rect([x - k, z - k, x + k, z + k], 0, 0.42);
  bag.add('granite_grey', box(x - 0.13, 0.42, z - 0.13, x + 0.13, 1.9, z + 0.13));
  bag.add('granite_grey', lathe([[0.001, 1.9], [0.2, 1.9], [0.16, 1.98], [0.001, 2.02]], 4, null, x, 0, z));
  col.rect([x - 0.13, z - 0.13, x + 0.13, z + 0.13], 0.42, 1.9);
  bag.add('bluestone', box(x - 0.5, 0.42, z + 0.4, x + 0.5, 0.78, z + 0.8));
  bag.add('bronze', lathe([[0.001, 0.78], [0.14, 0.78], [0.2, 0.9], [0.18, 0.96], [0.001, 0.92]], 8, null, x, 0, z + 0.6));
}
STYLES.han.elements.han_altar = altar;

/** The altars of the wards, outside the west wall by the first lane's gate. */
export function wardAltars() {
  return WARDS.map((w) => ({ t: 'han_altar', at: [w[0] - 5.5, w[1] + WARD_WALL + 24.55 - 8] }));
}
