// The architecture of Shang Yinxu, c. 1200 BC (docs/settlements/shang-yinxu.md §4–§5): rammed-earth platforms, timber posts on stone
// bases, plastered wattle walls under hipped and gabled thatch; bronze vessels; pit houses; the foundry; the Huan river.
import '../../objects/index.js';
import { registerStyle } from '../../core/build.js';
import { shangHall, shangGate } from './hall.js';
import { shangPits, shangTomb, shangArchive, shangRiver, shangBridge } from './ritual.js';
import { shangFoundry } from './foundry.js';
import { shangCourt } from './court.js';
import { courtHouse, pitYard, rowHouse, workshop } from './houses.js';

registerStyle('shang', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: {
    shang_hall: shangHall, shang_gate: shangGate, shang_pits: shangPits, shang_tomb: shangTomb, shang_archive: shangArchive,
    shang_river: shangRiver, shang_bridge: shangBridge, shang_foundry: shangFoundry, shang_court: shangCourt,
    shang_court_house: courtHouse, shang_pit_yard: pitYard, shang_row_house: rowHouse, shang_workshop: workshop,
  },
  objects: {},
});
