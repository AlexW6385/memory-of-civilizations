// The architecture of Pagan (docs/settlements/bagan.md §5): brick temples whitewashed and gilded, stupas, the city wall and its gate, timber halls under tiered roofs, stilt houses of bamboo and thatch.
import { registerStyle } from '../../core/build.js';
import { ananda, tower, cella, stupa, shwezigon } from './temple.js';
import { wall, gate } from './walls.js';
import { house, stall, zayat, kyaung, okkyaung } from './houses.js';
import { shop, library } from './shops.js';
import { propAt } from './detail.js';
import { river, ghat, boat, tank, kiln } from './scenery.js';

registerStyle('burmese', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: {
    bgn_ananda: ananda, bgn_tower: tower, bgn_cella: cella, bgn_stupa: stupa, bgn_shwezigon: shwezigon,
    bgn_wall: wall, bgn_gate: gate,
    bgn_house: house, bgn_stall: stall, bgn_zayat: zayat, bgn_kyaung: kyaung, bgn_okkyaung: okkyaung, bgn_shop: shop, bgn_library: library,
    bgn_props: (el, ctx) => { for (const it of el.items) propAt(ctx, it); },
    bgn_river: river, bgn_ghat: ghat, bgn_boat: boat, bgn_tank: tank, bgn_kiln: kiln,
  },
  objects: {},
});
