// The architecture of Ajanta (docs/settlements/ajanta.md): the horseshoe cliff of rock-cut caves, the gorge floor and
// the workers' village. The life style's figures and beasts are used by the settlement's plans.
import { registerStyle } from '../../core/build.js';
import '../../objects/index.js';
import { cliff } from './cliff.js';
import { VILLAGE_ELEMENTS } from './village.js';
import { HOUSE_ELEMENTS } from './houses.js';
import { DRESS_ELEMENTS } from './dress.js';

registerStyle('ajanta', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { aj_cliff: cliff, ...VILLAGE_ELEMENTS, ...HOUSE_ELEMENTS, ...DRESS_ELEMENTS },
  objects: {},
});
