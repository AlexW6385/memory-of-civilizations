// The village (docs/settlements/rapa-nui.md §5): boat-shaped houses, chicken houses, garden walls.
import { RADIUS, village, height } from './layout.js';
export async function town() {
  const v = village(), E = [];
  for (const h of v.houses) E.push({ t: 'hare_paenga', ...h });
  for (const m of v.moa) E.push({ t: 'hare_moa', ...m });
  for (const g of v.gardens) E.push({ t: 'manavai', ...g });
  return [{ id: 'rapa-nui-village', style: 'rapanui', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: E, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 40], facing: 's' } }];
}
