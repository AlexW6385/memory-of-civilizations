// The stone town (docs/settlements/kilwa.md §5).
import { RADIUS, lots, isOpen } from './layout.js';
import { trees, shore } from './life.js';
import { fronts } from './fronts.js';
import { yard } from './yard.js';
// the shops: the houses of the market block's first row (on the soko) and of the row on the mosque street
const isDuka = (l) => l.dh < 170 && !l.flip && (l.rect[1] === -78.4 || l.rect[1] === -23.9) && l.seed % 5 < 3;
export async function town() {
  const all = lots();
  return [{ id: 'kilwa-houses', style: 'swahili', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: all.map((l) => ({ t: 'swahili_house', ...l, open: isOpen(l), simple: l.dh > 138, duka: isDuka(l) })), rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-10, -30], facing: 's' } },
    { id: 'kilwa-trees', style: 'swahili', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: [...trees(), ...shore().S, ...yard().S], rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-10, -30], facing: 's' } },
    { id: 'kilwa-shore', style: 'life', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: [...shore().L, ...fronts(), ...yard().L], rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [-10, -30], facing: 's' } }];
}
