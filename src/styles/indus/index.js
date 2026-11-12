// The architecture of Mohenjo-daro (docs/settlements/mohenjo-daro.md §5): baked and mud brick, flat mud roofs, plain street fronts, brick drains and wells.
import { registerStyle } from '../../core/build.js';
import { house } from './house.js';
import { mound, tower, wall, bath, granary, pillared, college } from './civic.js';
import { streets, market, quay, office, river } from './town.js';
import { drains, outfall, pwell, pipal, banner, bathdress, pshade, topdress } from './works.js';
import { streetwork, shed, fishery, weir, shade } from './street.js';

registerStyle('indus', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { indus_house: house, indus_mound: mound, indus_tower: tower, indus_wall: wall, indus_bath: bath, indus_granary: granary, indus_pillared: pillared, indus_college: college, indus_streets: streets, indus_market: market, indus_quay: quay, indus_office: office, indus_river: river, indus_streetwork: streetwork, indus_shed: shed, indus_fishery: fishery, indus_weir: weir, indus_shade: shade, indus_drains: drains, indus_outfall: outfall, indus_pwell: pwell, indus_pipal: pipal, indus_banner: banner, indus_bathdress: bathdress, indus_pshade: pshade, indus_topdress: topdress },
  objects: {},
});
