// The stone town (docs/settlements/kilwa.md §5).
import { RADIUS, lots } from './layout.js';
import { trees, shore } from './life.js';
export async function town() {
  const all = lots();
  return [{ id: 'kilwa-houses', style: 'swahili', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: all.map((l) => ({ t: 'swahili_house', ...l, open: Math.hypot((l.rect[0] + l.rect[2]) / 2 + 10, (l.rect[1] + l.rect[3]) / 2 - 15) < 85 || l.seed % 4 === 0 })), rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-10, -30], facing: 's' } },
    { id: 'kilwa-trees', style: 'swahili', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: [...trees(), ...shore().S], rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-10, -30], facing: 's' } },
    { id: 'kilwa-shore', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: shore().L, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-10, -30], facing: 's' } }];
}
