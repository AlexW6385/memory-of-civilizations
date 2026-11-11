// The Ptolemaic style (Alexandria about 250 BC; docs/settlements/alexandria.md): the Greek orders and the Greek courtyard house
// (the `greek` style, read-only) with Egyptian forms beside them — the cavetto cornice, the pylon, the sphinx, the mudbrick house
// of Rhakotis — and the things of a great harbour: ships, quays, the lighthouse, the library. Built on `greek`: its columns,
// entablatures, stoa, booths, gymnasium and shop interiors are used as they are.

import { registerStyle, STYLES } from '../../core/build.js';
import '../greek/town.js';
import '../greek/house-interior.js';
import '../greek/quarter.js';
import '../greek/gymnasium.js';
import { HARBOUR } from './harbour.js';
import { PHAROS_EL } from './pharos.js';
import { MUSEION_EL } from './museion.js';
import { HOUSES } from './house.js';
import { SERAPEUM } from './serapeum.js';

const g = STYLES.greek;
export const ptolemaic = { ...g, elements: { ...g.elements, ...HARBOUR, ...PHAROS_EL, ...MUSEION_EL, ...HOUSES, ...SERAPEUM } };
registerStyle('ptolemaic', ptolemaic);
