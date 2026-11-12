// The architecture of Han Chang'an (docs/settlements/han-changan.md §5): the stepped rammed-earth terrace and the timber hall of the
// Weiyang Palace, the que gate towers, the rammed-earth city, palace and ward walls, the city gate of three passages, the courtyard
// houses of the wards, the markets with their tower and shop rows, the Kunming Lake, the pond, the corridors. The Chinese roofs
// (src/styles/chinese: hip_roof, gable_roof_c) are used read-only.
import { registerStyle } from '../../core/build.js';
import '../chinese/index.js';
import { terrace, hall } from './hall.js';
import { wall, pavilion, que, gate, ward } from './walls.js';
import { house, office } from './houses.js';
import { shopRow, market } from './market.js';
import { lake, ship, pond, corridor, bridge, pondIsland } from './scenery.js';
import { court, crown } from './court.js';

registerStyle('han', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: {
    han_terrace: terrace, han_hall: hall, han_wall: wall, han_pavilion: pavilion, han_que: que, han_gate: gate, han_ward: ward,
    han_house: house, han_office: office, han_shop_row: shopRow, han_market: market, han_lake: lake, han_ship: ship, han_pond: pond, han_corridor: corridor, han_court: court, han_crown: crown, han_bridge: bridge, han_island: pondIsland,
  },
  objects: {},
});
