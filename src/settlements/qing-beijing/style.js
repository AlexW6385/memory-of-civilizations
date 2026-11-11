// Ming–Qing Beijing's life elements, on top of the street life (style 'life'): the shop booths and
// the interiors (shops.js, interiors.js). Imported by life.js.
import { STYLES } from '../../core/build.js';
import '../../objects/index.js';
import { bjBooth } from './shops.js';
import { bjShopgoods, bjBarber, bjTeastall, bjWatercart, bjSedan, bjLane, bjPet } from './streetlife.js';
import { pekingCart, camelString } from '../../styles/qing/street.js';
import { bjRooms, bjTeahouse, bjPharmacy } from './interiors.js';

STYLES.life.elements.bj_booth = bjBooth;
STYLES.life.elements.bj_rooms = bjRooms;
STYLES.life.elements.bj_teahouse = bjTeahouse;
STYLES.life.elements.bj_pharmacy = bjPharmacy;
STYLES.life.elements.bj_shopgoods = bjShopgoods;
STYLES.life.elements.bj_barber = bjBarber;
STYLES.life.elements.bj_teastall = bjTeastall;
STYLES.life.elements.bj_watercart = bjWatercart;
STYLES.life.elements.bj_sedan = bjSedan;
STYLES.life.elements.bj_lane = bjLane;
STYLES.life.elements.bj_pet = bjPet;
STYLES.life.elements.peking_cart = pekingCart;
STYLES.life.elements.camel_string = camelString;
