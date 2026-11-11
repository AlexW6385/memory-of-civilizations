// The Qarawiyyin mosque about 1350 (docs/settlements/fez.md §5): the sahn and the fourteen naves of the hall, the minaret.
import { SITES, siteY } from './layout.js';

const q = SITES.qar, y = siteY('qar');
const room = (id, rect, yy, kind) => ({ id, rect, y: yy, kind });
const nw = (q[2] - q[0]) / 14;
export const qar = {
  id: 'fez-qarawiyyin',
  name: { en: 'al-Qarawiyyin', zh: '卡鲁万清真寺' },
  era: { en: 'Marinid Fez, about 1350', zh: '马林王朝非斯，约1350年' },
  style: 'marinid',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [q[0] - 3, -21], facing: 'e' },
  bounds: [q[0] - 4, q[1] - 4, q[2] + 4, q[3] + 4],
  view: q,
  viewY: y,
  bakeBounds: q,
  bakeTop: 30,
  elements: [{ t: 'fez_qarawiyyin', rect: q, y, seed: 17 }],
  rooms: [
    room('sahn', [q[0] + nw * 4, q[1] + 3.5, q[0] + nw * 10, q[1] + 23.5], y, 'open'),
    room('hall', [q[0] + 1.2, q[1] + 23.5, q[2] - 1.2, q[3] - 1.2], y, 'hall'),
    room('west naves', [q[0] + 1.2, q[1] + 1.2, q[0] + nw * 4, q[1] + 23.5], y, 'hall'),
    room('east naves', [q[0] + nw * 10, q[1] + 1.2, q[2] - 1.2, q[1] + 23.5], y, 'hall'),
  ],
  walks: [Object.assign([[q[0] - 3, -21], [q[0] + 8, -21], [q[0] + nw * 4 + 2, -21]], { y0: y })],
};
export default qar;
