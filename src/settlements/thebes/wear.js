// Where feet went in Thebes (docs/settlements/thebes.md §16): the processional way of the avenue and the forecourt is worn smooth along its middle,
// in patches that follow the paving, the threshold of the gateway dipped. Made of boxes 1 cm proud of the floor in `sandstone_dressed`, a material
// the avenue's plan already holds (the lamp stands), so it costs no draw. No collision (1 cm). Position-hashed, no counters.
import { STYLES } from '../../core/build.js';
import { box as boxGeo } from '../../core/geom.js';
import { AVENUE, ENCL, ENCL_TH, PYLON2 } from './layout.js';

const hash = (x, k) => { const s = Math.sin(x * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s); };

/** thebes_wear: { y } — the worn strips along the axis, from the quay end of the avenue to the second pylon's foot. */
function wearEl(el, { bag }) {
  const y0 = el.y ?? 0.02, y1 = y0 + 0.012;
  // two foot tracks side by side, each broken where the feet missed the slab, rather than one slab-wide mat
  const strip = (xa, xb, step, wBase, wVar) => {
    for (let x = xa; x < xb - 0.5; x += step) for (const sd of [-1, 1]) {
      const h = hash(x, 1 + sd), g = hash(x, 2 + sd * 5);
      if (g < 0.3) continue;
      const w = wBase * (0.3 + 0.22 * h) + wVar * 0.1, c = sd * (0.55 + 0.55 * hash(x, 3 + sd)) * wBase * 0.6, len = step * (0.45 + 0.5 * hash(x, 4 + sd));
      bag.add('sandstone_dressed', boxGeo(x + hash(x, 6 + sd) * step * 0.4, y0, c - w / 2, x + hash(x, 6 + sd) * step * 0.4 + len, y1, c + w / 2));
    }
  };
  strip(AVENUE.x0 + 1, ENCL[0] - 0.4, AVENUE.spacing / 2, 1.6, 2.0);   // the avenue: the broad way between the rows of rams
  // the gateway: the threshold worn across the passage, deepest on the axis
  const gx0 = ENCL[0], gx1 = ENCL[0] + ENCL_TH;
  bag.add('sandstone_dressed', boxGeo(gx0 + 0.3, y0, -2.6, gx1 - 0.3, y1, 2.6));
  bag.add('sandstone_dressed', boxGeo(gx0 + 1.2, y1, -1.4, gx1 - 1.2, y1 + 0.008, 1.4));
  strip(gx1 + 1, PYLON2.x0 - 1, 3.1, 1.8, 1.6);                   // the forecourt: one way up to the second pylon's door
}

let done = false;
export function registerWear() {
  if (done) return; done = true;
  STYLES.newkingdom.elements.thebes_wear = wearEl;
}
