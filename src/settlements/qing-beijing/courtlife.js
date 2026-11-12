// Ming–Qing Beijing — the dressing of the great court (docs/settlements/qing-beijing.md §32): the rank
// markers (pinji shan) of the Hall of Supreme Harmony's court, two files of small stone posts with a bronze
// tablet each, at which the civil and military officials stood in their order of rank at the great audiences
// [stated: Palace Museum; 18 on each side, ranks 1–9, 'zheng' and 'cong']. Elements of the style 'life'
// (registered by style.js). Local frame: x along the file (z = 0 its line, the tablets face +z), y up.
import { box, lathe } from '../../core/geom.js';
import { limb, ball, T } from '../../styles/qing/carving.js';
import { shape, put } from './proto.js';

/** A point of the row (local x along the row, z = 0) in the plan's frame: the row turned by rot about its middle `at`. */
const along = (el, lx) => [el.at[0] + lx * Math.cos(el.rot ?? 0), el.at[1] - lx * Math.sin(el.rot ?? 0)];

/** One rank marker (built once for each count of notches): a marble foot, a stone post with a dressed head, a bronze tablet on its face. */
const marker = (notches) => shape(`rankstone|${notches}`, (P) => {
  P.add('marble', box(-0.34, 0, -0.34, 0.34, 0.16, 0.34));
  P.add('marble_smooth', box(-0.2, 0.16, -0.2, 0.2, 1.05, 0.2));
  P.add('marble', box(-0.25, 1.05, -0.25, 0.25, 1.15, 0.25));
  P.add('bronze', box(-0.15, 0.42, 0.2, 0.15, 0.86, 0.225));
  for (let k = 0; k < notches; k++) P.add('gilt_bronze', box(-0.11, 0.48 + k * 0.07, 0.225, 0.11, 0.5 + k * 0.07, 0.235));
});

/**
 * bj_rankstones: { at, y, rot, n, step } — a file of n markers, 'step' apart along x: a marble foot, a stone post with a dressed head and a bronze
 * tablet on its face; the number of the rank is shown by the notches (a few ridges) on the tablet. Each is an instance of one of five shapes
 * (the notches 1–5), drawn within 160 m.
 */
export function bjRankstones(el, { bag }) {
  const n = el.n ?? 9, step = el.step ?? 3;
  for (let i = 0; i < n; i++) {
    const lx = (i - (n - 1) / 2) * step, rank = Math.floor(i / 2) + 1, [x, z] = along(el, lx);
    put(bag, marker(Math.min(rank, 5)), x, el.y ?? 0.03, z, el.rot ?? 0, 160);
  }
}

/** The three standards of the guard of honour (parasol, banner, fan of feathers), each on its pole, built once. */
const standard = (k) => shape(`lubu|${k}`, (P) => {
  const H = 3.5 + (k === 1 ? 0.3 : 0);
  P.add('lacquer_red', limb([0, 0, 0], [0, H, 0], 0.045, 0.035, 6));
  P.add('gilt_bronze', ball(0.06, 0.08, 0.06, 6, 4).translate(0, H + 0.04, 0));
  if (k === 0) {
    // the parasol: three tiers of cloth, the lowest a skirt
    P.add('cloth_ochre', lathe([[0.001, H - 0.1], [0.55, H - 0.55], [0.6, H - 0.7], [0.001, H - 0.68]], 10));
    P.add('cloth_red', lathe([[0.62, H - 0.7], [0.6, H - 0.92], [0.55, H - 0.92], [0.57, H - 0.7]], 10));
  } else if (k === 1) {
    P.add('cloth_red', box(-0.34, H - 1.5, -0.01, 0.34, H - 0.2, 0.01));
    P.add('cloth_ochre', box(-0.34, H - 0.28, -0.012, 0.34, H - 0.2, 0.012));
    P.add('gilt_bronze', box(-0.08, H - 1.0, 0.011, 0.08, H - 0.7, 0.014));
  } else {
    P.add('cloth_ochre', T(ball(0.42, 0.55, 0.04, 8, 5), 0, H - 0.6, 0));
    P.add('gilt_bronze', T(ball(0.18, 0.24, 0.05, 6, 4), 0, H - 0.6, 0.01));
  }
});

/**
 * bj_lubu: { at, y, rot, n, step } — the standards of the emperor's guard of honour (lubu) set out before the hall on the days of the great audiences:
 * on each pole, in turn, a yellow silk parasol (huanggai: a shallow cone with a fringe), a banner of red and a fan of feathers (a tall oval on its stalk), gilt finials
 * [stated: Palace Museum, the ceremonial sets of the Qing court; the numbers and order inferred]. A row along local x, the faces to +z.
 * Instances of three shapes, drawn within 170 m.
 */
export function bjLubu(el, { bag }) {
  const n = el.n ?? 6, step = el.step ?? 3.4;
  for (let i = 0; i < n; i++) {
    const [x, z] = along(el, (i - (n - 1) / 2) * step);
    put(bag, standard(i % 3), x, el.y ?? 0, z, el.rot ?? 0, 170);
  }
}
