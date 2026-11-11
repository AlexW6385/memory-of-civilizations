// The architecture of Dunhuang (docs/settlements/dunhuang.md): the Mogao cliff and its caves, the Nine-Storey
// building, and the oasis town of rammed earth (town.js). The chinese style's elements (hip roofs, brackets,
// the clay figures) are available too; the life style's figures and beasts are used by the town's plans.
import { registerStyle, STYLES } from '../../core/build.js';
import '../chinese/index.js';
import '../../objects/index.js';
import { cliff } from './cliff.js';
import { TOWN_ELEMENTS } from './town.js';

registerStyle('dunhuang', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.chinese.elements, dh_cliff: cliff, ...TOWN_ELEMENTS },
  objects: {},
});
