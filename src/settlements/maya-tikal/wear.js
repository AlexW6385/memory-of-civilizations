// Tikal c. 750 — wear on what is entered (docs/settlements/maya-tikal.md §20): the hollow worn in the plaster of a doorway by the feet that cross it, the soot of the
// hearth over the door of a kitchen house and of the room lamps on the vaulted rooms' back walls. Wraps the style's `k_house` and `k_range` from here (the style file stays as it
// was); pure functions of the element's own numbers, no counters, no Math.random. Nothing is written anywhere: the Maya script cannot be written here to the standard the
// stelae's glyph blocks ask for (a sign wrong in one detail is a different word), so the glyph panels stay the unreadable blocks of §14, and the dossier says so.
import '../../styles/tikal/index.js';
import './nightlight.js';
import { STYLES } from '../../core/build.js';
import { patch, soot } from '../../styles/maya/household.js';
import { houseFrame, rangeRooms, PLATFORM, hashAt } from './walk.js';

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const E = STYLES.tikal.elements, house = E.k_house, range = E.k_range;
  E.k_house = function worn(el, ctx) {
    const r = house.call(this, el, ctx);
    if (el.lite) return r;
    const { F } = houseFrame(el), { bag } = ctx, ns = el.door === 'n' || el.door === 's', s = el.seed ?? 1;
    // the doorway's hollow: a darker patch in the plaster across the threshold, wider outside where the feet turn in, a smaller one by the jamb the hand pushes
    const c = F.P(-0.2, 0), j = F.P(-0.3, 0.55 * (hashAt(c[0], c[1], 3) < 0.5 ? 1 : -1));
    patch(bag, 'plaster_damp', [c[0], PLATFORM, c[1]], [0, 1, 0], ns ? 1.3 : 0.8, ns ? 0.8 : 1.3, s + 11, 0.009);
    patch(bag, 'plaster_damp', [j[0], PLATFORM, j[1]], [0, 1, 0], ns ? 0.4 : 0.3, ns ? 0.3 : 0.4, s + 12, 0.014);
    // the smoke of the hearth over the door of a kitchen house, on the wall's outer face
    if (el.kitchen) { const q = F.P(-0.045, 0.1); soot(bag, [q[0], PLATFORM + 2.3, q[1]], [-F.U[0], 0, -F.U[1]], 0.95, 0.4, s + 13); }
    return r;
  };
  E.k_range = function worn(el, ctx) {
    const n = ctx.lights ? ctx.lights.length : 0, r = range.call(this, el, ctx);
    if (!el.furn) return r;
    const y = el.y ?? 0, { bag } = ctx, rooms = rangeRooms(el);
    // the hollow at each doorway, in the passage through the thick front wall
    for (const rm of rooms) { const p = rm.F.P(0.6, rm.vc), ns = el.face === 'n' || el.face === 's'; patch(bag, 'plaster_damp', [p[0], y, p[1]], [0, 1, 0], ns ? 1.0 : 0.7, ns ? 0.7 : 1.0, Math.round(rm.vc * 10) + 17, 0.009); }
    // the soot of each room's lamp on the back wall above it
    if (ctx.lights) for (const l of ctx.lights.slice(n)) {
      const F = rooms[0].F, w = [l.at[0] + F.U[0] * 0.5, l.at[2] + F.U[1] * 0.5];
      soot(bag, [w[0] - F.U[0] * 0.005, y + 2.4, w[1] - F.U[1] * 0.005], [-F.U[0], 0, -F.U[1]], 0.85, 0.7, Math.round(l.at[0] * 7 + l.at[2] * 3) + 19);
    }
    return r;
  };
}
registerWear();
