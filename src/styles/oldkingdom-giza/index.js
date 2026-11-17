// The Old Kingdom style, as Giza dresses it (docs/settlements/giza.md §16): the Old Kingdom's elements, with the pyramid's
// casing ruled in courses, the great temple's false door, and the houses furnished by rule. A style of Giza's own: the
// Old Kingdom's (../oldkingdom) is shared with Abu Simbel's workmen's quarter and stays as it was.

import { registerStyle, STYLES } from '../../core/build.js';
import '../oldkingdom/index.js';
import { courseRibs } from './courses.js';
import { falseDoor } from './sanctuary.js';
import { roomThings, courtCraft } from './houses.js';

const OK = STYLES.oldkingdom;
registerStyle('oldkingdom-giza', {
  trim: OK.trim, opening: OK.opening, column: OK.column,
  elements: {
    ...OK.elements,
    ok_pyramid: (el, c) => { OK.elements.ok_pyramid(el, c); courseRibs(c.bag, el); },
    ok_temple: (el, c) => {
      OK.elements.ok_temple(el, c);
      // the great temple's west wall: a false door of granite beside the doorway to the pyramid's court, for the king's cult
      if (el.backDoor && el.court[2] - el.court[0] > 20 && el.door === 'e') falseDoor(c.bag, c.col, { rect: el.rect, th: 2.2, s: (el.rect[3] - el.rect[1]) / 2 - 7 });
    },
    mud_house: (el, c) => {
      OK.elements.mud_house(el, c);
      if (!el.furnish) return;
      roomThings(c.bag, c.col, el); courtCraft(c.bag, c.col, el);
    },
  },
  objects: {},
});
