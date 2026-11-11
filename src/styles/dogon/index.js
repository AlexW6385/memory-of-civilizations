// Dogon architecture of the Bandiagara Escarpment (docs/settlements/dogon.md §4): mud and straw walls with niched ginna
// facades, round granaries with straw hats, the toguna with its eight-layer roof on carved posts, the Tellem dwellings in the cliff.
import { registerStyle, STYLES } from '../../core/build.js';
import '../qing/index.js';
import { toguna } from './toguna.js';
import { compound, house, landmarkCompound } from './compound.js';
import { tellem, punulu, baobab, altarEl, milletPlot } from './place.js';

registerStyle('dogon', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.qing.elements, toguna, dogon_compound: compound, dogon_house: house, dogon_landmark: landmarkCompound, tellem, punulu, baobab, dogon_altar: altarEl, millet_plot: milletPlot },
  objects: {},
});
