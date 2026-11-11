// Tang architecture (7th–9th c.; docs/settlements/tang-changan.md §4): timber halls on platforms of rammed earth with massive
// bracket sets, red columns, white walls and broad, low roofs ending in owl tails; rammed-earth ward walls and gates; courtyard
// houses, rows of open-fronted shops; the Big Wild Goose Pagoda in brick. Over the shared styles: the chinese vocabulary
// (Tang bracket sets, lamps, statues: Foguang), the song temple furnishings (temple_interior, bells, steles) and the qing/ming
// generic pieces (paving, canals, hawkers, parasols).
import { registerStyle, STYLES } from '../../core/build.js';
import '../chinese/index.js';
import '../song/index.js';
import { WARD_ELEMENTS } from './ward.js';
import { HOUSE_ELEMENTS } from './house.js';
import { PAGODA_ELEMENTS } from './pagoda.js';
import { INTERIOR_ELEMENTS } from './interior.js';
import { tangHall } from './hall.js';

registerStyle('tang', {
  column: STYLES.chinese.column, trim: STYLES.chinese.trim, opening: STYLES.chinese.opening,
  elements: { ...STYLES.chinese.elements, ...STYLES.song.elements, tang_hall: tangHall, ...WARD_ELEMENTS, ...HOUSE_ELEMENTS, ...PAGODA_ELEMENTS, ...INTERIOR_ELEMENTS },
  objects: STYLES.chinese.objects,
});
