// The Manueline style (Lisbon about 1520; docs/settlements/manueline-lisbon.md): late Gothic turned to the sea — carved rope,
// armillary spheres, the cross of the Order of Christ, round arches and net vaults in golden lioz limestone — with the plastered
// tile-roofed houses of Lisbon, the ships of the Tagus and the shipyard. New style; the gothic and ptolemaic helpers are used read-only.
import { registerStyle } from '../../core/build.js';
import { HARBOUR } from '../ptolemaic/harbour.js';
import { jeronChurch } from './church.js';
import { cloister } from './cloister.js';
import { belem } from './belem.js';
import { manuHouse } from './houses.js';
import { ship } from './ships.js';
import { palace, se, castle, range, pelourinho, fountain, hullOnStocks, timberStack, ropeWalk, crane } from './civic.js';

export const manueline = {
  trim: () => {}, opening: () => {}, column: () => {},
  elements: { jeron_church: jeronChurch, cloister, belem_tower: belem, manu_house: manuHouse, ship, quay: HARBOUR.quay, palace, se, castle, range, pelourinho, fountain, hull_stocks: hullOnStocks, timber_stack: timberStack, rope_walk: ropeWalk, crane },
  objects: {},
};
registerStyle('manueline', manueline);
