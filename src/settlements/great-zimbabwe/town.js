// The daga houses and homesteads (docs/settlements/great-zimbabwe.md §5, §15): walled compounds, each with its
// houses round a yard, a granary raised on stones, firewood and seats; a few houses stand free in the Great Enclosure.
import { RADIUS, compounds, huts, height } from './layout.js';
import { people } from './life.js';
export async function town() {
  const E = [];
  for (const k of compounds()) {
    E.push({ t: 'compound', c: k.c, r: k.r, gap: k.gap, yAt: height, seed: k.seed });
    const [gx, gz] = k.granary;
    E.push({ t: 'granary', c: [gx, gz], y: height(gx, gz), rot: Math.atan2(k.c[1] - gz, k.c[0] - gx), seed: k.seed });
  }
  for (const h of huts()) E.push({ t: 'daga_hut', ...h });
  const frame = { origin: [0, 0], base: 0, yaw: 0, feature: true, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, 0], facing: 's' } };
  return [{ id: 'great-zimbabwe-huts', style: 'zimbabwe', ...frame, elements: E },
    { id: 'great-zimbabwe-life', style: 'life', ...frame, elements: people() }];
}
