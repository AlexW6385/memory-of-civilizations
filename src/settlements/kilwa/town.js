// The stone town (docs/settlements/kilwa.md §5).
import { RADIUS, SIMPLE_FROM, lots, isOpen, isDuka, upSet } from './layout.js';
import { trees, shore } from './life.js';
import { fronts } from './fronts.js';
import { yard } from './yard.js';
export async function town() {
  const all = lots();
  return [{ id: 'kilwa-houses', style: 'swahili', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: all.map((l) => ({ t: 'swahili_house', ...l, open: isOpen(l), simple: l.dh > SIMPLE_FROM, duka: isDuka(l), up: upSet().has(l) })), rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-10, -30], facing: 's' } },
    { id: 'kilwa-trees', style: 'swahili', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: [...trees(), ...shore().S, ...yard().S], rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-10, -30], facing: 's' } },
    { id: 'kilwa-shore', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: [...shore().L, ...fronts(), ...yard().L], rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-10, -30], facing: 's' } }];
}
