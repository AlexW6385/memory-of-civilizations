// Ubirr about AD 1000 — wear on what is used (docs/settlements/kakadu.md §15.5): the ground round each hearth stained dark with charcoal and ash and trodden bare,
// an ash smear drawn out to one side by the feet, and the earth worn dark at the door of every walk-in shelter where the family goes in and out.
// Added from here to the style's `ka_fire` and `ka_house` (the style files stay as they were), in materials the plan already holds (no new draw); pure
// functions of the element's own place. Nothing is written anywhere: the people of Arnhem Land had no script and the dossier paints no sign (§15.5).
import '../../styles/kakadu/index.js';
import './nightlight.js';
import { lathe } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { HOUSE } from '../../styles/kakadu/house.js';
import { hashAt } from './nightlight.js';

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const E = STYLES.kakadu.elements, fire0 = E.ka_fire, house0 = E.ka_house;
  E.ka_fire = function worn(el, ctx) {
    const r = fire0.call(this, el, ctx);
    if (!ctx?.bag) return r;
    const [x, z] = el.at, y = el.y ?? 0, j = hashAt(x, z, 9), a = j * 6.28, k = 0.9 + 0.2 * hashAt(x, z, 2);
    // the stained and trodden ground round the ring of stones (an annulus: the ring and its ash are left as they were), its edge blending into the earth
    ctx.bag.add('pottery_dark', lathe([[0.56, 0.011], [0.75, 0.014], [1.35 * k, 0.013], [1.85 * k, 0.0]], 14, (t) => 1 + 0.16 * Math.sin(2 * t + a) + 0.08 * Math.sin(5 * t + 3 * a), x, y, z));
    // the ash and the ends of burnt sticks drawn out to one side by feet and by the wind
    ctx.bag.add('hide_grey', lathe([[0.2, 0.016], [0.5, 0.018], [0.9, 0.016], [1.2, 0.0]], 10, (t) => 1 + 0.5 * Math.cos(t - a * 0.3) ** 2, x + Math.cos(a) * 1.0, y, z + Math.sin(a) * 1.0));
    return r;
  };
  E.ka_house = function worn(el, ctx) {
    const r = house0.call(this, el, ctx);
    if (!ctx?.bag) return r;
    const [x, z] = el.at, y = el.y ?? 0, rot = el.rot ?? 0, s = Math.sin(rot), c = Math.cos(rot), B = HOUSE[el.kind ?? 'bark'], w = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
    // the earth before the door worn dark by feet, an oval along the way in and out
    const [dx, dz] = w(0, B.hd + 0.7), ph = hashAt(dx, dz, 4) * 6.28;
    ctx.bag.add('pottery_dark', lathe([[0.001, 0.012], [0.55, 0.013], [0.95, 0.0]], 12, (t) => 1.25 + 0.2 * Math.sin(2 * t + ph) + 0.15 * Math.cos(2 * (t - rot)), dx, y, dz));
    return r;
  };
}
registerWear();
