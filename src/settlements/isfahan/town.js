// The town round the square (docs/settlements/isfahan.md §6, §16): courtyard houses of straw-mud plaster; the one
// facing the lane from the square's east gap open and furnished.
import { RADIUS, houses, OPEN_HOUSE, TEAHOUSE, CHAHAR, CHAHAR_X } from './layout.js';
import { lifePlan } from './life.js';
const base = (id, elements) => ({ id, style: 'safavid', origin: [0, 0], base: 0, yaw: 0, feature: true, elements, rooms: [], bounds: [-RADIUS, -RADIUS, RADIUS, RADIUS], entrance: { at: [0, -150], facing: 's' } });
export async function town() {
  const all = houses(), open = OPEN_HOUSE(), plans = [];
  const shut = all.filter((h) => h !== open);
  for (let i = 0; i < shut.length; i += 120) plans.push(base(`isfahan-houses-${i / 120}`, shut.slice(i, i + 120).map((h) => ({ t: 'khaneh', ...h }))));
  const [x0, z0, x1, z1] = open.rect;
  plans.push({ ...base('isfahan-open-house', [{ t: 'khaneh_open', rect: open.rect, entry: 'w', seed: open.seed }]), bounds: [x0 - 2, z0 - 2, x1 + 2, z1 + 2],
    rooms: [{ id: 'talar', rect: [x0 + 3.6, z0 + 0.6, x1 - 3.8, z0 + 4.35], y: 0.45, kind: 'hall' }, { id: 'house court', rect: [x0 + 3.6, z0 + 4.8, x1 - 3.8, z1 - 3.4], y: 0, kind: 'open' }] });
  plans.push(...quarter());
  return [...plans, lifePlan()];
}

/** The coffeehouse and the Chahar Bagh avenue (docs/settlements/isfahan.md §18, §19). */
function quarter() {
  const E = [], [ax0, az0, ax1, az1] = CHAHAR, cx = CHAHAR_X;
  const tea = { id: 'isfahan-teahouse', style: 'safavid', origin: [0, 0], base: 0, yaw: 0, feature: true, entrance: { at: [0, -150], facing: 's' },
    elements: [{ t: 'qahveh_khaneh', rect: TEAHOUSE }, { t: 'lane', rect: [TEAHOUSE[0] - 6.3, TEAHOUSE[1] - 2, TEAHOUSE[0], TEAHOUSE[3] + 2], y: 0.04, mat: 'brick_paving' }],
    rooms: [{ id: 'teahouse', rect: [TEAHOUSE[0] + 1, TEAHOUSE[1] + 1, TEAHOUSE[2] - 1, TEAHOUSE[3] - 1], y: 0, kind: 'hall' }], bounds: [TEAHOUSE[0] - 8, TEAHOUSE[1] - 4, TEAHOUSE[2] + 3, TEAHOUSE[3] + 4] };
  // the avenue: paved walks either side of the stone channel that carries the water down the middle, from terrace to
  // terrace, a square basin on it every 44 m, the channel running on between them
  E.push({ t: 'lane', rect: [ax0, az0, ax1, az1], y: 0.04, mat: 'brick_paving' });
  const basins = [-88, -44, 0, 44, 88];
  let z = az0;
  for (const b of [...basins.map((q) => q - 3), az1 + 6]) {
    if (b > z) {
      E.push({ t: 'water_rect', rect: [cx - 1, z, cx + 1, b], y: 0.22 });
      for (const r of [[cx - 1.4, z, cx - 1, b], [cx + 1, z, cx + 1.4, b]]) E.push({ t: 'block', walk: true, rect: r, y0: 0, y1: 0.35, mat: 'limestone' });
    }
    z = b + 6;
  }
  for (const q of basins) {
    E.push({ t: 'block', walk: true, rect: [cx - 3, q - 3, cx + 3, q + 3], y0: 0, y1: 0.6, mat: 'limestone' });
    E.push({ t: 'water_rect', rect: [cx - 2.5, q - 2.5, cx + 2.5, q + 2.5], y: 0.5 });
  }
  // a low stone footbridge over the channel between the basins at every second gap
  for (const q of [-66, 22, 66]) {
    E.push({ t: 'block', walk: true, rect: [cx - 1.4, q - 1.2, cx + 1.4, q + 1.2], y0: 0.3, y1: 0.42, mat: 'limestone' });
  }
  return [tea, { id: 'isfahan-avenue', style: 'safavid', origin: [0, 0], base: 0, yaw: 0, feature: true, elements: E, rooms: [], bounds: [ax0 - 4, az0 - 4, ax1 + 4, az1 + 4], entrance: { at: [0, -150], facing: 's' } }];
}
