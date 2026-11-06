// Nara-period architecture (8th c.; docs/settlements/nara.md §4): Tang-style halls of the qing/ming
// vocabulary with a Nara palette — vermilion columns and brackets, white plaster, grey tiles, stone
// platforms; corridors round the temple courts; pagodas of seven storeys. A palette, not new forms.

import { registerStyle, STYLES } from '../../core/build.js';
import { withPal } from '../ming/index.js';
import '../qing/index.js';
import '../song/index.js';
import { pagodaJp } from './pagoda.js';
import { hakkakuToro } from './lantern.js';
import { daibutsu } from './daibutsu.js';

export const NPAL = { wood: 'timber_red', column: 'timber_red', soffit: 'plaster_white', base: 'granite_block', floor: 'granite_block', lattice: 'lattice_red', leaky: 'lattice_red', plaster: 'plaster_white', plinth: 'granite_block', roof: 'tile_grey', doors: 'plank' };
const withN = (fn) => (el, ctx) => fn({ ...el, pal: { ...NPAL, ...(el.pal || {}) } }, ctx);

registerStyle('nara', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: {
    ...STYLES.qing.elements,
    ...Object.fromEntries(['ming_hall', 'qing_hall', 'ming_gallery', 'palace_wall', 'terrace', 'stairs', 'ming_pavilion', 'corner_tower'].filter((k) => STYLES.qing.elements[k]).map((k) => [k, withN(STYLES.qing.elements[k])])),
    pagoda_oct: STYLES.song.elements.pagoda_oct,
    pagoda_jp: withPal(pagodaJp),
  },
  objects: { hakkaku_toro: hakkakuToro, daibutsu },
});
