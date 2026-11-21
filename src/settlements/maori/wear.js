// The pā's wear (docs/settlements/maori.md §4l): what use and the damp, mild climate of Rotorua leave on a house and a cooking place. At every ordinary house's door the
// smoke of the hearth, which has no chimney and leaves by the door and the thatch, stains the wall above the lintel in a tongue; the earth before the sill is trodden dark
// by bare feet; round each cooking place's fire the ground is blackened by ash and char. Added from here to the style's `whare` and `hangi` (the style files stay as they
// were), in a material the plan already holds (bark_dark: no new draw); each a pure function of the house's own numbers. Nothing is written anywhere: Māori of the 1770s
// had no script (their carving and weaving carried the record, drawn in the style already), so there are no inscriptions or signs to add.
import '../../styles/maori/index.js';
import './nightlight.js';
import { box, lathe } from '../../core/geom.js';
import { Matrix4 } from '../../core/three.js';
import { STYLES } from '../../core/build.js';
import { hashAt } from './nightlight.js';

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const E = STYLES.maori.elements, baseWhare = E.whare, baseHangi = E.hangi;
  E.whare = function worn(el, ctx) {
    const r = baseWhare.call(this, el, ctx);
    const { bag } = ctx;
    if (!bag || el.w < 3 || (el.rank ?? 0) > 1) return r;
    const [cx, cz] = el.c, w = el.w ?? 4, l = el.l ?? 6, h = el.h ?? 1.2, y0 = el.y ?? 0, zf = -l / 2 + (el.porch ?? 1.6);
    const dl = -w * 0.18 - 0.32, dr = dl + 0.95, dh = Math.min(1.15, h - 0.08), dx = (dl + dr) / 2;
    const M = new Matrix4().makeRotationY(el.yaw ?? 0).setPosition(cx, y0, cz), put = (g) => { g.applyMatrix4(M); bag.add('bark_dark', g); };
    const j = (hashAt(cx, cz, 4) - 0.5) * 0.14;
    // the earth before the sill trodden dark by the feet of the household (a patch in the porch, wider by the door, ragged at its edge)
    put(box(dx - 0.55 + j, 0.012, zf - 1.1, dx + 0.55 + j, 0.017, zf - 0.04));
    put(box(dx - 0.3, 0.012, zf - 1.5, dx + 0.3 + j, 0.017, zf - 1.1));
    // the smoke leaking from under the lintel, a tongue of soot up the front wall above the door (the wall's face at z = zf; the piece above the door is dh…h)
    if (h - dh > 0.12) put(box(dx - 0.42 + j, dh + 0.005, zf - 0.012, dx + 0.42 + j, Math.min(dh + 0.1, h - 0.02), zf - 0.004));
    if (h - dh > 0.2) put(box(dx - 0.14 + j, dh + 0.1, zf - 0.012, dx + 0.14 + j, Math.min(dh + 0.26, h - 0.02), zf - 0.004));
    return r;
  };
  E.hangi = function worn(el, ctx) {
    const r = baseHangi.call(this, el, ctx);
    const { bag } = ctx;
    if (!bag) return r;
    const y = el.y ?? 0, yaw = el.yaw ?? 0, c = Math.cos(yaw), s = Math.sin(yaw), px = el.c[0] - 1.4 * c, pz = el.c[1] + 1.4 * s;     // the open pit at local (−1.4, 0)
    // the ground round the pit blackened by ash and char, ragged
    bag.add('bark_dark', lathe([[2.0, 0], [1.2, 0.0]], 14, (t, i) => 1 + 0.18 * Math.sin(t * 3 + 2 * hashAt(px, pz, 1)) + 0.1 * Math.sin(t * 7 + i), px, y + 0.015, pz));
    return r;
  };
}
registerWear();
