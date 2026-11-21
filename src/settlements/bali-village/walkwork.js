// A Balinese temple village — what the visitor's walk adds to the street (docs/settlements/bali-village.md §13.1): the pancuran, the bathing and washing place where the
// subak's water is let out of a split bamboo pipe through spouts into a stone trough at the channel's edge, women's bathing place on the one side of the street. Added to the
// balinese style from here (the style files stay as they were). Pure geometry from the element's own place.
import '../../styles/balinese/index.js';
import { STYLES } from '../../core/build.js';
import { box, lathe, rod } from '../../core/geom.js';
import { bx, canang } from '../../styles/balinese/kit.js';

/**
 * bali_pancuran: { at: [x, z] (the trough's middle), y, turn: 1 | -1 (the side of the water: the pipe stands on the channel's side) } — a standpipe of stone
 * (the water box of the channel), three bamboo spouts out of a split bamboo pipe, the trough of carved stone under them with its water, a stone to stand on, and a
 * canang on the box's top. The street side is clear: the trough is 0.5 m wide.
 */
function pancuran({ at, y = 0, turn = -1 }, ctx) {
  const [x, z] = at, s = turn;
  bx(ctx, 'andesite', x + s * 0.28 - 0.3, y, z - 0.8, x + s * 0.28 + 0.3, y + 1.15, z + 0.8, true);                  // the water box, the channel's edge
  bx(ctx, 'tuff_hewn', x + s * 0.28 - 0.35, y + 1.15, z - 0.85, x + s * 0.28 + 0.35, y + 1.25, z + 0.85);          // its coping
  for (const k of [-0.5, 0, 0.5]) {
    const sx = x + s * 0.28 - s * 0.3;
    ctx.bag.add('bamboo_culm', rod([sx, y + 0.95, z + k], [sx - s * 0.32, y + 0.9, z + k], 0.035, 6));           // a spout of split bamboo
    ctx.bag.add('water', box(sx - s * 0.32 - 0.012, y + 0.4, z + k - 0.012, sx - s * 0.32 + 0.012, y + 0.9, z + k + 0.012));      // the thread of water
  }
  bx(ctx, 'tuff_hewn', x - s * 0.18 - 0.28, y, z - 0.85, x - s * 0.18 + 0.28, y + 0.42, z + 0.85, true);          // the trough
  bx(ctx, 'water', x - s * 0.18 - 0.2, y + 0.3, z - 0.77, x - s * 0.18 + 0.2, y + 0.38, z + 0.77);                  // the water in it
  canang(ctx, x + s * 0.28, y + 1.25, z, 1);
}

let done = false;
export function registerWalkwork() {
  if (done) return; done = true;
  STYLES.balinese.elements.bali_pancuran = pancuran;
}
registerWalkwork();
void lathe;
