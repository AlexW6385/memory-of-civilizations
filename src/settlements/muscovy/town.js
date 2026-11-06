// The log houses (izby) of the boyars' courts and the posad (docs/settlements/muscovy.md §5).
import { RADIUS, lots } from './layout.js';
const base = (id, elements) => ({ id, style: 'muscovite', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [40, 20], facing: 's' } });
// the gable end of each house turned to the nearer street (the streets of layout.js: x = 42 − 420 + 84k, z = 35 − 420 + 70k)
function front([x0, z0, x1, z1]) {
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  if (x1 - x0 >= z1 - z0) { const sx = Math.round((cx + 378) / 84) * 84 - 378; return sx < cx ? 'x0' : 'x1'; }
  const sz = Math.round((cz + 385) / 70) * 70 - 385; return sz < cz ? 'z0' : 'z1';
}
export async function houses() {
  const all = lots(), plans = [];
  for (let i = 0; i < all.length; i += 200) plans.push(base(`muscovy-houses-${i / 200}`, all.slice(i, i + 200).map((l) => ({ t: 'izba', ...l, front: front(l.rect) }))));
  return plans;
}
