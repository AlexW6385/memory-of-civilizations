// The apartment compounds of Teotihuacan (docs/settlements/teotihuacan.md §5).
import { RADIUS, compounds } from './layout.js';
const base = (id, elements) => ({ id, style: 'teotihuacano', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -80], facing: 'e' } });
export async function town() {
  const all = compounds(), plans = [];
  for (let i = 0; i < all.length; i += 40) plans.push(base(`teotihuacan-compounds-${i / 40}`, all.slice(i, i + 40).map((c) => ({ t: 'compound', ...c }))));
  return plans;
}
