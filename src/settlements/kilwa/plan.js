// Kilwa about 1330 (docs/settlements/kilwa.md §2–§4): the Great Mosque, Husuni Kubwa and its pool, dhows on the beach.
import { MOSQUE, PALACE, POOL, height } from './layout.js';

const E = [];
E.push({ t: 'swahili_mosque', rect: MOSQUE, bay: 4.6, big: [6, 5], y: height(-10, 15) });
E.push({ t: 'husuni', rect: PALACE, pool: POOL, y: 10 });
for (let k = 0; k < 6; k++) { const x = -150 + k * 32; E.push({ t: 'boat', at: [x, -128 - 15 * Math.sin(x / 60) + 6], dir: [0.3, 1], len: 12 + (k % 3) * 2, y: -0.4 }); }
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
