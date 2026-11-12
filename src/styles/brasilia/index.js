// Brasília, 1960s (docs/settlements/brasilia.md §4): Niemeyer's white concrete — the Congress's dome and bowl, the Cathedral's sixteen
// columns, the Alvorada columns of the palaces, glass-walled slabs — and Costa's superquadra: six floors on pilotis in a belt of trees.
import { registerStyle } from '../../core/build.js';
import { congress } from './congress.js';
import { cathedral } from './cathedral.js';
import { arcadePalace, praca } from './blocks.js';
import { ministry } from './ministry.js';
import { colonnadePalace } from './palace.js';
import { superblock } from './flats.js';
import { shopsRow } from './shops.js';
import { busShelter, kiosk, cart, parking, roadmarks, playground, pitch } from './street.js';
import { chapel, museu } from './civic.js';
import { car60, bus } from './vehicles.js';
import { apron, camp, lawnKit } from './dressing.js';

registerStyle('brasilia', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { congress, cathedral, ministry, arcade_palace: arcadePalace, colonnade_palace: colonnadePalace, praca, superblock, shops_row: shopsRow, car60, bus,
    bus_shelter: busShelter, kiosk, cart, parking, roadmarks, playground, pitch, chapel, museu, apron, camp, lawn_kit: lawnKit },
  objects: {},
});
