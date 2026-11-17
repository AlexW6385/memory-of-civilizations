// Ur of the Third Dynasty — the town style (docs/settlements/ur.md §5.8–§5.11): the Sumerian vocabulary (src/styles/sumerian,
// shared with Babylon and left as it is) with the ordinary house's front varied by class, the houses that can be entered
// given the class's outer features, and the elements only Ur has: the brickyard, the royal mausoleum, the city rampart and
// its gates.

import { registerStyle, STYLES } from '../../core/build.js';
import '../sumerian/index.js';
import { urHouseOpen } from '../sumerian/house.js';
import { lotPoint } from '../sumerian/house.js';
import { urHouse, frontClass, frontOuter } from './house.js';
import { brickyard } from './brickyard.js';
import { rampart } from './rampart.js';
import { mausoleum } from './mausoleum.js';

function house(el, ctx) {
  if (!el.open) return urHouse(el, ctx);
  urHouseOpen(el, ctx);
  // the front of its class outside the wall of an entered house: the street door's middle on the front face
  const f = el.door ?? 's', [px, pz] = lotPoint(el, 1.275, 0), uc = f === 'n' || f === 's' ? px : pz;
  frontOuter(ctx, { rect: el.rect, f, uc, H: 3.4, cls: Math.min(2, frontClass(el.rect, el.seed)), seed: el.seed, flat: true, near: (el.lod ?? 2) > 1 });
}

const S = STYLES.sumerian;
registerStyle('sumerian-ur', { ...S, elements: { ...S.elements, ur_house: house, brickyard, rampart, ur_mausoleum: mausoleum } });
