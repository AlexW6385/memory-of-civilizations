// The architecture of Qin Xianyang, c. 210 BC (docs/settlements/qin-xianyang.md §5): rammed earth in layers, timber halls on high
// terraces under grey-tiled hipped roofs (the chinese hip-roof builder is used read-only), black and vermilion; the pit of the
// terracotta army with its painted soldiers; the walled market with the standard weights; rammed-earth houses; the figure-makers'
// workshops; the imperial road. Generic elements (floor, stair, wall) come from the core.
import '../../objects/index.js';
import { registerStyle } from '../../core/build.js';
import { qinPit, qinArmy } from './pit.js';
import { qinTerrace, qinHall, qinQue } from './palace.js';
import { rowHouse, courtHouse, official, granary, garden } from './houses.js';
import { qinMarket, qinScale, qinStandards, qinWorkshop, qinRoad, qinPavilion } from './scenery.js';

registerStyle('qin', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: {
    qin_pit: qinPit, qin_army: qinArmy, qin_terrace: qinTerrace, qin_hall: qinHall, qin_que: qinQue,
    qin_row_house: rowHouse, qin_court_house: courtHouse, qin_official: official, qin_granary: granary, qin_garden: garden,
    qin_market: qinMarket, qin_scale: qinScale, qin_standards: qinStandards, qin_workshop: qinWorkshop, qin_road: qinRoad, qin_pavilion: qinPavilion,
  },
  objects: {},
});
