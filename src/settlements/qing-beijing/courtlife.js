// Ming–Qing Beijing — the dressing of the great court (docs/settlements/qing-beijing.md §32): the rank
// markers (pinji shan) of the Hall of Supreme Harmony's court, two files of small stone posts with a bronze
// tablet each, at which the civil and military officials stood in their order of rank at the great audiences
// [stated: Palace Museum; 18 on each side, ranks 1–9, 'zheng' and 'cong']. Elements of the style 'life'
// (registered by style.js). Local frame: x along the file (z = 0 its line, the tablets face +z), y up.
import { box } from '../../core/geom.js';
import { Parts } from '../../styles/qing/carving.js';

/**
 * bj_rankstones: { at, y, rot, n, step } — a file of n markers, 'step' apart along x: a marble foot, a stone post with a
 * dressed head and a bronze tablet on its face; the number of the rank is shown by the notches (a few ridges) on the tablet.
 */
export function bjRankstones(el, { bag }) {
  const P = new Parts(), n = el.n ?? 9, step = el.step ?? 3;
  for (let i = 0; i < n; i++) {
    const x = (i - (n - 1) / 2) * step, rank = Math.floor(i / 2) + 1;
    P.add('marble', box(x - 0.34, 0, -0.34, x + 0.34, 0.16, 0.34));
    P.add('marble_smooth', box(x - 0.2, 0.16, -0.2, x + 0.2, 1.05, 0.2));
    P.add('marble', box(x - 0.25, 1.05, -0.25, x + 0.25, 1.15, 0.25));
    P.add('bronze', box(x - 0.15, 0.42, 0.2, x + 0.15, 0.86, 0.225));
    for (let k = 0; k < Math.min(rank, 5); k++) P.add('gilt_bronze', box(x - 0.11, 0.48 + k * 0.07, 0.225, x + 0.11, 0.5 + k * 0.07, 0.235));
  }
  P.emit(bag, el.at[0], el.y ?? 0.03, el.at[1], el.rot ?? 0);
}
