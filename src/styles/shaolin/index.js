// Shaolin style: the Ming monastery's halls (the Jiangnan hall builder with the red-and-grey monastery palette), the funerary
// stupas of the Pagoda Forest, steles, the training hall's worn floor, and the furnished halls (docs/settlements/shaolin.md).
import { STYLES, registerStyle } from '../../core/build.js';
import '../ming/index.js';
import '../chinese/index.js';
import '../../objects/index.js';
import { shaolinStupa, shaolinStele, practiceFloor, courtCenser, stoneLion, bellHung, pathEarth } from './stupa.js';
import { shaolinInterior } from './interiors.js';
import { shaolinRoom } from './rooms.js';
import { shaolinGear, shaolinWear } from './gear.js';
import { suzhouShop } from '../../settlements/ming-suzhou/shops.js';
import { hallFurniture } from '../../settlements/ming-suzhou/halls.js';
import { Parts, plaqueBuild } from '../../settlements/ming-suzhou/props.js';

/** The monastery palette: red timber and walls, grey tile, grey stone plinth. */
export const PAL = { wood: 'timber_red', column: 'timber_red', soffit: 'timber_red', base: 'granite_block', floor: 'bluestone', lattice: 'lattice_red', leaky: 'lattice_red', plaster: 'wall_red', plinth: 'granite_grey', roof: 'tile_grey' };
/** The village's palette: earth and grey brick under grey tile. */
export const PAL_HOUSE = { wood: 'lacquer_chestnut', column: 'lacquer_chestnut', soffit: 'lacquer_chestnut', base: 'granite_grey', floor: 'bluestone', lattice: 'lattice', leaky: 'lattice', plaster: 'earth_wall', plinth: 'brick_grey', roof: 'tile_grey' };

function plaque(el, { bag }) {
  const P = new Parts(); plaqueBuild(P, el);
  const [fx, fz] = el.facing ?? [0, 1];
  P.emit(bag, el.at[0], el.y, el.at[1], Math.atan2(fx, fz));
}
const base = STYLES.ming;
registerStyle('shaolin', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: {
    ...base.elements,
    shaolin_stupa: shaolinStupa, shaolin_stele: shaolinStele, practice_floor: practiceFloor, court_censer: courtCenser, stone_lion: stoneLion, bell_hung: bellHung, path_earth: pathEarth, shaolin_interior: shaolinInterior,
    hall_furniture: hallFurniture, plaque, shaolin_room: shaolinRoom, shaolin_gear: shaolinGear, shaolin_wear: shaolinWear,
  },
  objects: { ...STYLES.chinese.objects },
});

// the shop fronts' signs and goods are an element of the street life (shared with Suzhou's shops)
STYLES.life.elements.suzhou_shop ??= suzhouShop;
