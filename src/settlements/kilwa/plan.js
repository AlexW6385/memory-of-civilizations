// Kilwa about 1330 (docs/settlements/kilwa.md §2–§4): the Great Mosque, Husuni Kubwa and its pool, dhows on the beach.
import { MOSQUE, PALACE, POOL, height, inLot } from './layout.js';

const E = [];
E.push({ t: 'swahili_mosque', rect: MOSQUE, bay: 4.6, big: [6, 5], y: height(-10, 15) });
E.push({ t: 'husuni', rect: PALACE, pool: POOL, y: 10 });
// mtepe, the sewn boats of the coast, drawn up along the top of the beach above the tide line
// (the shore drops steeply below), clear of the houses
const shoreAt = (x) => -120 - 15 * Math.sin(x / 60);
for (let k = 0, x = -170; k < 7 && x < 60; x += 9) {
  for (let d = 9.5; d < 16; d += 0.5) {
    const z = shoreAt(x) + d, L = 11 + (k % 3) * 2, a = [x - L / 2 - 1, z], b = [x + L / 2 + 1, z];
    const hs = [a, [x, z], b, [x, z - 2.2], [x, z + 2.2], [a[0], z - 2], [b[0], z + 2]].map(([p, q]) => height(p, q));
    if (Math.max(...hs) - Math.min(...hs) > 0.25 || [a, [x, z], b].some(([p, q]) => inLot(p, q, 3.5))) continue;
    E.push({ t: 'mtepe', at: [x, z], dir: [k % 2 ? 1 : -1, 0.08 * (k % 3 - 1)], len: L, y: Math.min(...hs) - 0.05, seed: 40 + k });
    k++; x += L; break;
  }
}
const room = (id, rect, y, kind) => ({ id, rect, y, kind });
export const kilwa = {
  id: 'kilwa-mosque',
  name: { en: 'The Great Mosque of Kilwa', zh: '基尔瓦大清真寺' },
  era: { en: 'The Swahili coast, about 1330', zh: '斯瓦希里海岸，约1330年' },
  style: 'swahili',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [-10, -30], facing: 's' },
  bounds: [-160, -160, PALACE[2] + 2, 45],
  view: [MOSQUE[0] - 2, MOSQUE[1] - 2, MOSQUE[2] + 2, MOSQUE[3] + 2],
  bakeTop: 12,
  elements: E,
  rooms: [room('prayer hall', MOSQUE, 0, 'hall')],
  walks: Object.assign([[[-10, -30], [-10, -15]]], {}),
};
kilwa.walks[0].y0 = height(-10, -30);
export default kilwa;
