// The Abbasid style (Baghdad about 800; docs/settlements/abbasid-baghdad.md §3): baked and mud brick, plaster and Samarra stucco,
// pointed arches and barrel vaults, domes, iwans, wooden columns carrying flat roofs. Everything here is reconstruction: nothing of
// the Round City stands; Samarra (836–892) and al-Ukhaidir (c. 775) are the built evidence.

import { registerStyle } from '../../core/build.js';
import { fortifyElements } from './fortify.js';
import { palaceElements } from './palace.js';
import { libraryElements } from './library.js';
import { houseElements } from './house.js';
import { marketElements } from './market.js';
import { riverElements } from './river.js';

registerStyle('abbasid', {
  column: () => {},
  trim: () => {},
  opening: () => {},
  elements: { ...fortifyElements, ...palaceElements, ...libraryElements, ...houseElements, ...marketElements, ...riverElements },
  objects: {},
});
