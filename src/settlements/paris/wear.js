// What use has done to Paris's stone (docs/settlements/paris.md §6e): the palace gate's passage, where the carts of the palace and the
// street come through: two wheel-ruts and the hollow the feet and hooves have made between them, in the gate's paving. Thin boxes of
// the one material the plan already holds (`flagstone`), a hair over the ground.
import { STYLES } from '../../core/build.js';
import { box } from '../../core/geom.js';

/** { t: 'paris_wear', at: [x, z] (the passage's middle), y (ground), along: 'x', len, w }: ruts and a hollow along a passage running in x. */
function parisWear(el, ctx) {
  const { bag } = ctx, [x, z] = el.at, y = el.y + 0.004, h = el.len / 2, w = el.w / 2;
  for (const s of [-1, 1]) bag.add('flagstone', box(x - h, y, z + s * w * 0.62 - 0.14, x + h, y + 0.012, z + s * w * 0.62 + 0.14));
  bag.add('flagstone', box(x - h * 0.92, y, z - w * 0.26, x + h * 0.92, y + 0.016, z + w * 0.26));
}
STYLES.gothic.elements.paris_wear = parisWear;
