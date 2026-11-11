// Marinid architecture (14th c.; docs/settlements/fez.md §4): zellij tilework, carved stucco and cedar, green-tiled roofs;
// madrasas round marble courts, courtyard houses with blank outer walls, covered souks, funduqs, tanneries.
import { registerStyle } from '../../core/build.js';
import '../qing/index.js';
import { bouInania } from './madrasa.js';
import { house, mass } from './house.js';
import { souk, square } from './souk.js';
import { tannery } from './tannery.js';
import { qarawiyyin } from './qarawiyyin.js';
import { river, bridge, wall, gate, darMagana, sabat, fountain, funduq, mosque } from './civic.js';

registerStyle('marinid', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { bou_inania: bouInania, fez_house: house, fez_mass: mass, fez_souk: souk, fez_square: square, fez_tannery: tannery, fez_river: river, fez_bridge: bridge, fez_wall: wall, fez_gate: gate, fez_darmagana: darMagana, fez_sabat: sabat, fez_fountain: fountain, fez_funduq: funduq, fez_mosque: mosque, fez_qarawiyyin: qarawiyyin },
  objects: {},
});
