// Nara-period architecture (8th c.; docs/settlements/nara.md §4): Tang-style halls of the qing/ming
// vocabulary with a Nara palette — vermilion columns and brackets, white plaster, grey tiles, stone
// platforms; corridors round the temple courts; pagodas of seven storeys. A palette, not new forms.

import { registerStyle, STYLES } from '../../core/build.js';
import { withPal } from '../ming/index.js';
import '../qing/index.js';
import '../song/index.js';
import { pagodaJp } from './pagoda.js';
import { hakkakuToro, hakkakuToroFigures } from './lantern.js';
import { daibutsu } from './daibutsu.js';
import { buddhaLevel } from './buddha.js';
import { bosatsu, bosatsuMid } from './bosatsu.js';
import { nio, nioMid } from './nio.js';
import { shika } from './shika.js';
import { naraAltarSet } from './altar.js';
import { bugakuStage } from './stage.js';
import { naraHall } from './hall.js';
import { naraTsuiji } from './tsuiji.js';
import { yardElements } from './yard.js';
import { houseElements } from './house.js';

export const NPAL = { wood: 'timber_red', column: 'timber_red', soffit: 'plaster_white', base: 'granite_block', floor: 'granite_block', lattice: 'lattice_red', leaky: 'lattice_red', plaster: 'plaster_white', plinth: 'granite_block', roof: 'tile_grey', doors: 'plank' };
const withN = (fn) => (el, ctx) => fn({ ...el, pal: { ...NPAL, ...(el.pal || {}) } }, ctx);

/** An old (reduced) form drawn in other materials (el.remap: { from: to, '*': to }): the distance forms of the figures share the town's far materials, so that they add no draws. */
const remapped = (fn) => (el, ctx) => (el.remap ? fn(el, { ...ctx, bag: { add: (m, g) => ctx.bag.add(el.remap[m] ?? el.remap['*'] ?? m, g) } }) : fn(el, ctx));

registerStyle('nara', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: {
    ...STYLES.qing.elements,
    ...Object.fromEntries(['ming_hall', 'qing_hall', 'ming_gallery', 'palace_wall', 'terrace', 'stairs', 'ming_pavilion', 'corner_tower'].filter((k) => STYLES.qing.elements[k]).map((k) => [k, withN(STYLES.qing.elements[k])])),
    pagoda_oct: STYLES.song.elements.pagoda_oct,
    pagoda_jp: withPal(pagodaJp),
    nara_altar_set: naraAltarSet,
    bugaku_stage: bugakuStage,
    nara_hall: naraHall,
    nara_tsuiji: naraTsuiji,
    ...yardElements,
    ...houseElements,
    door_clear: () => {},               // (nothing built: the street life's pass reads its rectangle as a footprint, so none of its things stands in a doorway's lane)
  },
  objects: { hakkaku_toro: hakkakuToro, daibutsu: remapped(daibutsu), daibutsu_mid: buddhaLevel('mid'), daibutsu_fine: buddhaLevel('fine'), bosatsu_mid: bosatsuMid, nio_mid: nioMid, hakkaku_toro_figs: hakkakuToroFigures, bosatsu: remapped(bosatsu), nio: remapped(nio), shika },
});
