// The Mogao cliff (docs/settlements/dunhuang.md §2–§5): the rock with its caves in four tiers, the Great Buddha's
// hall and the Nine-Storey building at the middle, the apron, the stair and the gallery of the second tier; at the
// foot the stream with its timber bridge and the monks' halls on the east bank.
import { LV } from '../../styles/dunhuang/nine.js';
import { XF, ROCK, ZEND, FLOOR, CAVES, RIVER, riverX, STAIR, GALLERY } from './layout.js';

const E = [];
E.push({ t: 'dh_cliff' });
E.push({ t: 'dh_stream' }); E.push({ t: 'dh_talus' });
E.push({ t: 'dh_bridge', z: 0, w: 4.4 });
// the monks' halls and cells at the foot, facing the cliff over the apron: tiled halls and earth cells
const mk = (rect, tiled, seed, extra = {}) => E.push({ t: 'dh_house', rect, front: 'w', seed, tiled, ...extra });
mk([-61, 28, -50, 41], true, 71); mk([-61, 50, -50, 62], false, 72); mk([-61, 72, -50, 86], true, 73);
mk([-61, -88, -50, -75], false, 74); mk([-61, -106, -50, -93], true, 75); mk([-61, -124, -50, -112], false, 76);
// the painters' scaffold against a cave front, with ladders: tier 0 of the cliff south of the cell
E.push({ t: 'dh_scaffold', at: [XF + 0.6, -70], w: 8, h: 7.5, levels: 3 });

const room = (id, rect, y, kind, sealed) => ({ id, rect, y, kind, ...(sealed ? { sealed } : {}) });
const hall = CAVES.find((c) => c.id === 'hall'), pil = CAVES.find((c) => c.id === 'pillar'), cell = CAVES.find((c) => c.id === 'cell');
const rooms = [
  room('great', [XF - 26, -11.5, XF, 11.5], FLOOR[0], 'hall'),
  room('hall-cave', [XF - 7.8, hall.z - 3, XF, hall.z + 3], FLOOR[0], 'hall', true),
  room('pillar-cave', [XF - 10, pil.z - 3.5, XF, pil.z + 3.5], FLOOR[0], 'hall', true),
  room('cell', [XF - 5, cell.z - 1.6, XF, cell.z + 1.6], FLOOR[0], 'hall', true),
  ...CAVES.filter((c) => !['great', 'recess'].includes(c.kind) && !['hall', 'pillar', 'cell'].includes(c.id)).map((c) => {
    const d = c.kind === 'hall' ? [7.8, 3] : c.kind === 'pillar' ? [10, 3.5] : [5, 1.6];
    return room(c.id + '-cave', [XF - d[0], c.z - d[1], XF, c.z + d[1]], FLOOR[c.tier], 'hall', true);
  }),
  ...[1, 2, 3, 4, 6, 8].map((k) => room('nine-' + k, k <= 3 ? [XF + 3.7, 3.2, XF + 4.3, 4.2] : [XF + 0.7, 3.2, XF + 1.3, 4.2], LV[k].y, 'open')),
  room('forecourt', [XF - 2, -ZEND, XF + 24, ZEND], 0, 'open'),
];
// from the bridge over the apron to the two caves and the great hall, back, then up the stair to the gallery
const walks = [[[-40, 0], [-56, 0], [-66, 0], [-74, 0], [-66, 0], [-66, -30], [-74, -30], [-76, -26.5], [-81, -26.8], [-81, -30], [-81, -26.8], [-76, -26.5], [-66, -30], [-66, -52], [-74, -52], [-76.5, -52], [-66, -52], [-66, 45], [-73.5, 45], [-74.2, 46.2]]];
walks[0].y0 = 0;

export const mogao = {
  id: 'dunhuang-mogao',
  name: { en: 'The Mogao caves', zh: '莫高窟' },
  era: { en: 'Late Tang, c. 850', zh: '晚唐，约850年' },
  style: 'dunhuang',
  origin: [0, 0], base: 0, yaw: 0,
  entrance: { at: [-40, 0], facing: 'w' },
  bounds: [XF - ROCK, -ZEND - 4, -30, ZEND + 4],
  bakeBounds: [XF - 12, -60, XF + 8, -20],
  view: [XF, -14, XF + 12, 14],
  bakeTop: 14,
  elements: E,
  rooms,
  walks,
};
void RIVER; void riverX; void STAIR; void GALLERY;
export default mogao;
