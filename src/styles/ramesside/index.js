// The Ramesside style: the rock-cut temples of Ramesses II at Abu Simbel (Great and Small), the shore of the Nile below them (quay, ramp,
// the terrace and its mudbrick walls), the cliff, the camp of the priests and workmen. Built on the Egyptian vocabulary (../egyptian) and
// the Old Kingdom's mudbrick houses (../oldkingdom).
import { registerStyle, STYLES } from '../../core/build.js';
import '../oldkingdom/index.js';
import '../egyptian/index.js';
import { greatTemple } from './great.js';
import { smallTemple } from './small.js';
import { cliff, rampWay, bollards, granaries, sunAltar, stoneGate } from './shore.js';
import { ramHouse, ramShop } from './shops.js';
import { terraceDress, talus, cliffWear, wayDress, laneDress, quayDress, masonsYard, shaduf, templeFurnish } from './dress.js';

registerStyle('ramesside', {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { great_temple: greatTemple, small_temple: smallTemple, cliff, ramp_way: rampWay, bollards, granaries, sun_altar: sunAltar, stone_gate: stoneGate,
    // the houses and bakeries of the workmen's quarter are the Old Kingdom's mudbrick ones (a courtyard house, furnished, and the bakery)
    mud_house: (el, c) => STYLES.oldkingdom.elements.mud_house(el, c), bakery: (el, c) => STYLES.oldkingdom.elements.bakery(el, c),
    // the lanes' houses turned to either lane, the shops of the market street, and the dressing of terrace, lanes, quay, masons' yard, bank and halls
    ram_house: ramHouse, ram_shop: ramShop, terrace_dress: terraceDress, talus, cliff_wear: cliffWear, way_dress: wayDress, cliffWear, wayDress, lane_dress: laneDress, quay_dress: quayDress, masons_yard: masonsYard, shaduf, temple_furnish: templeFurnish },
  objects: {},
});
