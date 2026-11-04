// The stone town (docs/settlements/kilwa.md §5).
import { RADIUS, lots } from './layout.js';
export async function town() {
  const all = lots();
  return [{ id: 'kilwa-houses', style: 'swahili', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: all.map((l) => ({ t: 'swahili_house', ...l })), rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-10, -30], facing: 's' } }];
}
