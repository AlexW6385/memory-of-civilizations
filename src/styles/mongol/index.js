// The architecture of Karakorum, c. 1254 (docs/settlements/mongol-karakorum.md §4–§6): the ger on the ground and on its wagon, the Chinese-type
// timber halls on rammed-earth podiums (Möngke's palace, the Great Hall, temples, gates), the rammed-earth town wall, courtyard houses of sun-dried brick,
// mosques and the Nestorian church, the silver tree.
import { registerStyle, STYLES } from '../../core/build.js';
import '../ming/index.js';
import '../chinese/index.js';
import '../qing/index.js';
import { ger } from './ger.js';
import { palaceHall, tileHall, greatHall } from './hall.js';
import { silverTree, tug, tortoise, kiln, tileStack, forge, pen, cofferCart } from './craft.js';
import { earthWall, townGate, cornerTower, brickWall, gateHall, mosque, church } from './walls.js';
import { mudCompound } from './house.js';
import { shopRow } from './shops.js';
import { courtPath, hitch, cellar, shed } from './court.js';

registerStyle('mongol', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: {
    ...STYLES.qing.elements,
    ger, palace_hall: palaceHall, tile_hall: tileHall, great_hall: greatHall, silver_tree: silverTree, tug, tortoise, kiln, tile_stack: tileStack, forge, pen, coffer_cart: cofferCart,
    earth_wall: earthWall, town_gate: townGate, corner_tower: cornerTower, brick_wall: brickWall, gate_hall: gateHall, mud_compound: mudCompound, mosque, church, shop_row: shopRow, court_path: courtPath, hitch, cellar, shed,
  },
  objects: {},
});
