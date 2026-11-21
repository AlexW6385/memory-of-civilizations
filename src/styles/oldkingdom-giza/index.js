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
import { causewayCarved } from './carved.js';
import { khafreTemple } from './khafre.js';
import { khafre } from './statue.js';
import { Sculpt } from './anatomy.js';
import { haul } from './haulers.js';
import { roomThings, courtCraft } from './houses.js';
import { gizaHouse, gizaBakery } from './walkhouse.js';
import { rationStall } from './ration.js';

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
    ok_haul: haul,
    // one seated statue of Khafre standing alone { at: [x, z], y, face: 'e'|'s'|'w'|'n', lod } (for the showroom and for courts)
    ok_khafre_statue: (el, { bag }) => { const S = { g: new Sculpt(), m: new Sculpt() }; khafre(S, el.at[0], el.y ?? 0, el.at[1], el.face ?? 'e', el.lod ?? 0); bag.add('granite_black', S.g.geometry()); bag.add('marble_smooth', S.m.geometry()); },
    mastaba: (el, c) => {
      OK.elements.mastaba(el, c);
      {
        // the false door's panel: the owner modelled in low relief for the tombs near the arrival (full within 70 m, reduced to 110 m of it), the old boxes beyond
        const d = Math.hypot(el.c[0] + el.a - 242, el.c[1] - el.b + 2.6 + 50);
        northernNiche(c.bag, { c: el.c, a: el.a, b: el.b, h: el.h, cased: el.mat === 'tura_limestone', lod: d < 70 ? 0 : d < 110 ? 1 : undefined });
      }
    },
    ok_causeway_dress: (el, c) => {
      OK.elements.ok_causeway_dress(el, c);
      // the reliefs on the first reaches (the straight reach at the temple's door and the first 54 m of the level run) — the ones a visitor walks in
      if (el.ya === 0 && el.yb === 0 && el.a[0] >= 168 && el.a[0] <= 186) { const stop = causewayCarved(c.bag, el, 0, 40, [[177, -44], [200, -40]]); if (stop < 40) causewayReliefs(c.bag, el, stop, 40); }
    },
    ok_khafre_temple: (el, c) => {
      khafreTemple(el, c);
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
    bakery: gizaBakery,
    // the far form of a gallery: closed walls and a roof (the interior only within reach of the visitor)
    gallery_hall: (el, c) => {
      if (!el.simple) return OK.elements.gallery_hall(el, c);
      const [x0, z0, x1, z1] = el.rect, h = el.h ?? 3.4, th = 0.6;
      c.bag.add('mud_plaster', box(x0 - th / 2, 0, z0 - th / 2, x1 + th / 2, h, z0 + th / 2)); c.bag.add('mud_plaster', box(x0 - th / 2, 0, z1 - th / 2, x1 + th / 2, h, z1 + th / 2));
      c.bag.add('mud_plaster', box(x1 - th / 2, 0, z0 + th / 2, x1 + th / 2, h, z1 - th / 2));
      c.bag.add('mud_plaster', box(x0 - 0.2, h, z0 - 0.2, x1 + 0.2, h + 0.4, z1 + 0.2));
    },
    ok_ration: rationStall,
    mud_house: (el, c) => {
      gizaHouse(el, c);
      if (!el.furnish || el.simple) return;
      roomThings(c.bag, c.col, el); courtCraft(c.bag, c.col, el);
    },
  },
  objects: {},
});
