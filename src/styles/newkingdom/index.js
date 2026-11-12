// The New Kingdom architectural vocabulary (docs/settlements/thebes.md §5): the pylon with its flagstaffs and banners, the
// papyrus-bundle columns of the hypostyle hall painted in registers, the obelisks, the ram sphinxes, the great mudbrick wall,
// the mudbrick houses of the town with their roof terraces and the workshops of its street. The egyptian vocabulary
// (trim, the pylon tower, the reliefs, the astronomical ceilings) is used read-only.
import { registerStyle } from '../../core/build.js';
import { egyptian } from '../egyptian/index.js';
import { nkColumn } from './columns.js';
import { ram, colossus, obelisk, flagstaff } from './monuments.js';
import { nkPylon } from './pylon.js';
import { nkHall } from './hall.js';
import { rowHouse, courtHouse, villa, granary, garden } from './houses.js';
import { props } from './dress.js';
import { workshop } from './workshops.js';
import { quay, lake, enclosure, magazines, festival, sanctuary } from './scenery.js';

registerStyle('newkingdom', {
  trim: egyptian.trim, opening: egyptian.opening, column: egyptian.column,
  elements: {
    ...egyptian.elements,
    nk_column: nkColumn, nk_ram: ram, nk_colossus: colossus, nk_obelisk: obelisk, nk_flagstaff: flagstaff, nk_pylon: nkPylon, nk_hall: nkHall,
    nk_row_house: rowHouse, nk_court_house: courtHouse, nk_villa: villa, nk_granary: granary, nk_garden: garden, nk_workshop: workshop, nk_props: props,
    nk_quay: quay, nk_lake: lake, nk_enclosure: enclosure, nk_magazines: magazines, nk_festival: festival, nk_sanctuary: sanctuary,
  },
  objects: { ...egyptian.objects },
});
