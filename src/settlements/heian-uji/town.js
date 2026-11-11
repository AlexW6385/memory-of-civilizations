import { lodTiles } from '../lod.js';
import { ARRIVALS } from '../../planet/arrivals.js';
// The village of Uji (docs/settlements/heian-uji.md §11, §15): houses of the commoners — stone-weighted board roofs, thatch,
// cypress bark — in two levels of detail, with their yards, trades and eye-level dressing; every house within reach of the
// core can be entered (furnished by its trade), a few are inns (the road to Nara and Kyoto crosses at the bridge).
import { RADIUS, lots } from './layout.js';

/** The houses that can be entered: wide and deep enough, within 150 m of the arrival or the village's middle; inns along the roads. */
export function openSet(all) {
  const A = ARRIVALS['heian-uji'], pts = [[A[0], A[2]], [-40, 140], [-40, -150]];
  const ok = all.filter((l) => l.rect[2] - l.rect[0] >= 4.8 && l.rect[3] - l.rect[1] >= 5.2 && pts.some(([x, z]) => Math.hypot((l.rect[0] + l.rect[2]) / 2 - x, (l.rect[1] + l.rect[3]) / 2 - z) < 150));
  const d = (l) => Math.min(...pts.map(([x, z]) => Math.hypot((l.rect[0] + l.rect[2]) / 2 - x, (l.rect[1] + l.rect[3]) / 2 - z)));
  ok.sort((a, b) => d(a) - d(b)); ok.length = Math.min(ok.length, 90);
  const m = new Map();
  ok.forEach((l, i) => m.set(l, l.kind === 'road' && l.rect[2] - l.rect[0] > 8 && i % 3 === 0 ? 'inn' : 'home'));
  return m;
}
export async function houses() {
  const all = lots(), open = openSet(all);
  return lodTiles('heian-uji-houses', 'japanese', all.map((l) => ({ t: 'heian_house', ...l, ...(open.has(l) ? { open: open.get(l) } : {}) })), { near: 200, R: RADIUS + 100, entrance: { at: [-60, 72], facing: 'n' } });
}
