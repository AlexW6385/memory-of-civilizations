// What the visitor's walk meets in the street and the lanes beyond the shops (docs/settlements/lu-qufu.md §14): the earth-god's shrine (tudi miao), a little brick
// niche under a tiled roof with the god's tablet, a bowl of ash with burnt joss sticks and an offering, set at a well or at a gate; all in world coordinates
// ({ at, rot }); rot turns the element's +z (its front) about y, in quarter turns. [inferred: the tudi shrine at wells, crossings and gates is general to north China]
import { rectRoof } from '../ming/index.js';
import { frame, quant } from './dress.js';
import { rng } from './kit.js';

/** lu_tudi: { at: [x, z], rot, seed } — the earth-god's shrine: a stone plinth, a brick niche 0.9 m wide and 1.15 m high, a tiled gable roof, the red tablet within, a bowl of ash before it. */
export function tudi(el, ctx) {
  const rand = rng(el.seed ?? 5), rot = quant(el.rot ?? 0), F = frame(ctx, el.at, rot), { bag } = ctx;
  const hw = 0.55, hd = 0.42, side = Math.abs(Math.sin(rot)) > 0.5;
  F.B('granite_grey', -hw - 0.1, 0, -hd - 0.1, hw + 0.1, 0.22, hd + 0.35, true);
  F.B('brick_grey', -hw, 0.22, -hd, -hw + 0.14, 1.4, hd, true); F.B('brick_grey', hw - 0.14, 0.22, -hd, hw, 1.4, hd, true);
  F.B('brick_grey', -hw, 0.22, -hd, hw, 1.4, -hd + 0.14, true);
  F.B('brick_grey', -hw - 0.04, 1.4, -hd - 0.04, hw + 0.04, 1.5, hd + 0.04);
  const c = F.P(0, 0.04);
  rectRoof({ c, A: side ? hd + 0.28 : hw + 0.28, B: side ? hw + 0.28 : hd + 0.28, y: 1.5, rise: 0.38, kind: 'gable', sweep: 0.15, alongZ: side, mat: 'tile_grey', soffit: 'timber' }, bag);
  F.B('lacquer_red', -0.2, 0.22, -hd + 0.14, 0.2, 0.82, -hd + 0.2);                                  // the tablet of the god, red
  F.B('gilt_bronze', -0.12, 0.5, -hd + 0.2, 0.12, 0.72, -hd + 0.215);
  F.B('cloth_red', -hw + 0.14, 1.0, hd - 0.05, hw - 0.14, 1.3, hd - 0.03);                           // the red cloth hung across the niche's head
  F.L('pottery_dark', [[0.001, 0], [0.12, 0.02], [0.15, 0.12], [0.11, 0.16], [0.001, 0.16]], 8, 0, 0.22, hd + 0.2);   // the bowl of ash
  for (let k = 0; k < 5; k++) F.B('wood_ochre', -0.07 + k * 0.035, 0.38, hd + 0.19 + (k % 2) * 0.03, -0.055 + k * 0.035, 0.38 + 0.14 + rand() * 0.06, hd + 0.2 + (k % 2) * 0.03);
  F.L('cloth_ochre', [[0.001, 0], [0.07, 0.01], [0.08, 0.05], [0.001, 0.09]], 7, 0.32, 0.22, hd + 0.22);       // an offered fruit
}
