// The village (docs/settlements/rapa-nui.md §5): boat-shaped houses with their paved forecourts and
// earth ovens, chicken houses and garden walls, each set on the ground where it stands.
import { RADIUS, village, height } from './layout.js';
export async function town() {
  const v = village(), E = [], y = (c) => height(c[0], c[1]);
  for (const h of v.houses) E.push({ t: 'hare_paenga', ...h, y: y(h.c) });
  for (const m of v.moa) E.push({ t: 'hare_moa', ...m, y: y(m.c), yaw: (m.c[0] * 0.37) % 1, len: 5 + Math.abs(m.c[1] * 0.13) % 3 });
  for (const g of v.gardens) E.push({ t: 'manavai', ...g, y: y(g.c) });
  return [{ id: 'rapa-nui-village', style: 'rapanui', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: E, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 40], facing: 's' } }];
}
