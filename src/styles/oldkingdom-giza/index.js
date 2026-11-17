// The Old Kingdom style, as Giza dresses it (docs/settlements/giza.md §16): the Old Kingdom's elements, with the pyramid's
// casing ruled in courses, the great temple's false door, and the houses furnished by rule. A style of Giza's own: the
// Old Kingdom's (../oldkingdom) is shared with Abu Simbel's workmen's quarter and stays as it was.

import { box } from '../../core/geom.js';
import { registerStyle, STYLES } from '../../core/build.js';
import '../oldkingdom/index.js';
import { courseRibs } from './courses.js';
import { falseDoor, northernNiche } from './sanctuary.js';
import { sphinx } from './sphinx.js';
import { causewayReliefs, slabFloor } from './reliefs.js';
import { roomThings, courtCraft } from './houses.js';

const OK = STYLES.oldkingdom;
/** Khafre's valley temple's alabaster floor in slabs over the halls and rooms (docs §17): a grey joint layer, the slabs on it. */
function khafreFloor(bag, el) {
  const [rx0, rz0] = el.rect, y0 = el.y ?? 0;
  for (const [u0, v0, u1, v1] of [[29, 4, 38, 38], [8, 15, 29, 27], [8, 6, 26, 13], [8, 29, 26, 36]]) {
    bag.add('granite_grey', box(rx0 + u0, y0 + 0.1, rz0 + v0, rx0 + u1, y0 + 0.106, rz0 + v1));
    slabFloor(bag, { x0: rx0 + u0, z0: rz0 + v0, x1: rx0 + u1, z1: rz0 + v1, y: y0 + 0.106, mats: ['marble_smooth', 'marble_smooth'], seed: 7 + u0 });
  }
}
registerStyle('oldkingdom-giza', {
  trim: OK.trim, opening: OK.opening, column: OK.column,
  elements: {
    ...OK.elements,
    ok_pyramid: (el, c) => { OK.elements.ok_pyramid(el, c); courseRibs(c.bag, el); },
    ok_sphinx: sphinx,
    mastaba: (el, c) => {
      OK.elements.mastaba(el, c);
      northernNiche(c.bag, { c: el.c, a: el.a, b: el.b, h: el.h, cased: el.mat === 'tura_limestone' });
    },
    ok_causeway_dress: (el, c) => {
      OK.elements.ok_causeway_dress(el, c);
      // the reliefs on the first reaches (the straight reach at the temple's door and the first 54 m of the level run) — the ones a visitor walks in
      if (el.ya === 0 && el.yb === 0 && el.a[0] >= 168 && el.a[0] <= 186) causewayReliefs(c.bag, el, 0, 40);
    },
    ok_khafre_temple: (el, c) => {
      OK.elements.ok_khafre_temple(el, c);
      khafreFloor(c.bag, el);
    },
    ok_temple: (el, c) => {
      OK.elements.ok_temple(el, c);
      // the great temple's west wall: a false door of granite beside the doorway to the pyramid's court, for the king's cult
      if (el.court[2] - el.court[0] > 20) {
        // the pavement "plastered with irregular slabs of basalt": the slabs laid in rows, each a hair off level, a hairline joint between
        const [x0, z0, x1, z1] = el.rect, o = 1.15;
        c.bag.add('granite_grey', box(x0 + o, 0.12, z0 + o, x1 - o, 0.126, z1 - o));
        slabFloor(c.bag, { x0: x0 + o, z0: z0 + o, x1: x1 - o, z1: z1 - o, y: 0.126, mats: ['basalt', 'basalt'], seed: 11 });
      }
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
