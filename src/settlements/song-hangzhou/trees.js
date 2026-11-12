// Southern Song Lin'an — the trees in the courts of the great houses (docs/settlements/song-hangzhou.md §25): over the Imperial Way's
// courtyard houses (kind 'court', deep lots) one old tree stands in the middle of the court, as Lin'an's rich houses planted their
// courts with flowering trees and old camphors [inferred: the Song house's court garden; "flower racks with rare pines and junipers" at the tea houses, §10, hint at the taste].
import { lots, LEVEL } from './layout.js';

/** hz_tree elements (style 'song'): one for each court house of the core with a deep lot. */
export function courtTrees() {
  const E = [];
  for (const l of lots()) {
    if (l.kind !== 'court' || l.detail < 2 || l.simple) continue;
    const [x0, z0, x1, z1] = l.rect, f = l.front, along = f === 'n' || f === 's', D = along ? z1 - z0 : x1 - x0, L = along ? x1 - x0 : z1 - z0;
    if (D < 16 || L < 6) continue;
    const v = D / 2 + 1.2, a = 0.5 + ((l.seed >> 3) % 5 - 2) * 0.04;
    const p = f === 'e' ? [x1 - v, z0 + L * a] : f === 'w' ? [x0 + v, z0 + L * a] : f === 's' ? [x0 + L * a, z1 - v] : [x0 + L * a, z0 + v];
    const kind = ['camphor', 'ginkgo', 'peach', 'camphor'][l.seed % 4];
    E.push({ t: 'hz_tree', at: p, y: LEVEL.street - 0.38, kind, h: kind === 'peach' ? 4.0 : 6.5 + (l.seed % 5) * 0.5, seed: l.seed % 100000 + 1 });
  }
  return E;
}
