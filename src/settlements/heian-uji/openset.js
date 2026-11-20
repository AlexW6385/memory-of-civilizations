// The houses of Uji that can be entered (docs/settlements/heian-uji.md §17): wide and deep enough, within reach of the arrival or the village's middle; inns along the roads.
import { ARRIVALS } from '../../planet/arrivals.js';

/** The houses that can be entered: wide and deep enough, within 150 m of the arrival or the village's middle; inns along the roads. */
export function openSet(all) {
  const A = ARRIVALS['heian-uji'], pts = [[A[0], A[2]], [-40, 140], [-40, -150]];
  const ok = all.filter((l) => l.rect[2] - l.rect[0] >= 4.8 && l.rect[3] - l.rect[1] >= 5.2 && pts.some(([x, z]) => Math.hypot((l.rect[0] + l.rect[2]) / 2 - x, (l.rect[1] + l.rect[3]) / 2 - z) < 240));
  const d = (l) => Math.min(...pts.map(([x, z]) => Math.hypot((l.rect[0] + l.rect[2]) / 2 - x, (l.rect[1] + l.rect[3]) / 2 - z)));
  ok.sort((a, b) => d(a) - d(b)); ok.length = Math.min(ok.length, 260);
  const m = new Map();
  ok.forEach((l, i) => m.set(l, l.kind === 'road' && l.rect[2] - l.rect[0] > 8 && i % 3 === 0 ? 'inn' : 'home'));
  return m;
}
