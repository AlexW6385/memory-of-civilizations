// The tulou style: the earth fortresses of the Hakka of Fujian (docs/settlements/hakka-tulou.md §4).
import { registerStyle, STYLES } from '../../core/build.js';
import '../qing/index.js';
import '../../objects/index.js';
import { tulouRound } from './round.js';
import { tulouHall } from './hall.js';
import { hakkaHouse, earthShrine, noria, washSteps, vegPlot } from './houses.js';
import { tulouSquare, farmhouse, slabBridge, track } from './village.js';

registerStyle('tulou', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.life.elements, ...STYLES.qing.elements, tulou_ring: tulouRound, tulou_hall: tulouHall, tulou_enclosure: tulouSquare, farmhouse, slab_bridge: slabBridge, track, hakka_house: hakkaHouse, earth_shrine: earthShrine, noria, wash_steps: washSteps, veg_plot: vegPlot },
  objects: {},
});
