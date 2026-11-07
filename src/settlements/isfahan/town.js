// The town round the square (docs/settlements/isfahan.md §6, §16): courtyard houses of straw-mud plaster; the one
// facing the lane from the square's east gap open and furnished.
import { RADIUS, houses, OPEN_HOUSE } from './layout.js';
import { lifePlan } from './life.js';
const base = (id, elements) => ({ id, style: 'safavid', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -150], facing: 's' } });
export async function town() {
  const all = houses(), open = OPEN_HOUSE(), plans = [];
  const shut = all.filter((h) => h !== open);
  for (let i = 0; i < shut.length; i += 120) plans.push(base(`isfahan-houses-${i / 120}`, shut.slice(i, i + 120).map((h) => ({ t: 'khaneh', ...h }))));
  const [x0, z0, x1, z1] = open.rect;
  plans.push({ ...base('isfahan-open-house', [{ t: 'khaneh_open', rect: open.rect, entry: 'w', seed: open.seed }]), bounds: [x0 - 2, z0 - 2, x1 + 2, z1 + 2],
    rooms: [{ id: 'talar', rect: [x0 + 3.6, z0 + 0.6, x1 - 3.8, z0 + 4.35], y: 0.45, kind: 'hall' }, { id: 'house court', rect: [x0 + 3.6, z0 + 4.8, x1 - 3.8, z1 - 3.4], y: 0, kind: 'open' }] });
  return [...plans, lifePlan()];
}
