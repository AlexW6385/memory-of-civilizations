// Ming–Qing Beijing's life elements, on top of the street life (style 'life'): the shop booths and
// the interiors (shops.js, interiors.js). Imported by life.js.
import { STYLES } from '../../core/build.js';
import '../../objects/index.js';
import { bjBooth } from './shops.js';
import { bjRooms, bjTeahouse, bjPharmacy } from './interiors.js';

STYLES.life.elements.bj_booth = bjBooth;
STYLES.life.elements.bj_rooms = bjRooms;
STYLES.life.elements.bj_teahouse = bjTeahouse;
STYLES.life.elements.bj_pharmacy = bjPharmacy;
