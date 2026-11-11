// The tulou style: the earth fortresses of the Hakka of Fujian (docs/settlements/hakka-tulou.md §4).
import { registerStyle, STYLES } from '../../core/build.js';
import '../qing/index.js';
import '../../objects/index.js';
import { tulouRound } from './round.js';
import { tulouHall } from './hall.js';
import { tulouSquare, farmhouse, slabBridge } from './village.js';

registerStyle('tulou', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { ...STYLES.life.elements, ...STYLES.qing.elements, tulou_round: tulouRound, tulou_hall: tulouHall, tulou_square: tulouSquare, farmhouse, slab_bridge: slabBridge },
  objects: {},
});
