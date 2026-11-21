// Tikal c. 750 — wear on what is entered (docs/settlements/maya-tikal.md §20): the hollow worn in the plaster of a doorway by the feet that cross it, the soot of the
// hearth over the door of a kitchen house and of the room lamps on the vaulted rooms' back walls. Wraps the style's `k_house` and `k_range` from here (the style file stays as it
// was); pure functions of the element's own numbers, no counters, no Math.random. Nothing is written anywhere: the Maya script cannot be written here to the standard the
// stelae's glyph blocks ask for (a sign wrong in one detail is a different word), so the glyph panels stay the unreadable blocks of §14, and the dossier says so.
import '../../styles/tikal/index.js';
import './nightlight.js';
import { STYLES } from '../../core/build.js';
import { fromTriangles } from '../../core/geom.js';
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

// ── the worn middle of the great stairs (docs §21): the feet of two centuries of processions darken and polish the treads along the stair's middle ──
const DIRS = { w: [1, 0], e: [-1, 0], n: [0, 1], s: [0, -1] };
/** The flight a k_pyramid builds (styles/tikal/index.js pyramid): { foot, dir, w, H, Lr, steps, y0 }. */
export function pyramidStair(P) {
  const dir = DIRS[P.face], [cx, cz] = P.c, head = dir[0] ? cx - dir[0] * P.top[0] : cz - dir[1] * P.top[1];
  const Lr = P.foot !== undefined ? Math.abs(head - P.foot) : P.H / 1.72, foot = dir[0] ? [head - dir[0] * Lr, cz] : [cx, head - dir[1] * Lr];
  return { foot, dir, w: P.stairW, H: P.H, Lr, steps: Math.round(P.H / 0.3), y0: P.y0 ?? 0 };
}
/** The flight a k_platform builds for one of its `stairs` entries. */
export function platformStair(rect, H, s, y0 = 0, batter = 0.8) {
  const [x0, z0, x1, z1] = rect, dir = DIRS[s.face], Lr = s.run ?? H * 1.6, edge = dir[0] > 0 ? x0 : dir[0] < 0 ? x1 : dir[1] > 0 ? z0 : z1;
  return { foot: dir[0] ? [edge - dir[0] * (Lr - batter), s.at] : [s.at, edge - dir[1] * (Lr - batter)], dir, w: s.w, H, Lr, steps: Math.max(2, Math.round(H / 0.3)), y0 };
}
/** mt_stairwear: a stair's flight { foot, dir, w, H, Lr, steps, y0, spread }: a band of worn tread down its middle, wavering a little (the line the feet take), widest where they gather. */
function stairWear(el, { bag }) {
  const { foot, dir: [dx, dz], H, Lr, steps, y0 = 0, w } = el, nx = -dz, nz = dx, sp = el.spread ?? 1, q = hashAt(foot[0], foot[1], 21) * 6.28, t = [];
  const P = (d, off, y) => [foot[0] + dx * d + nx * off, y0 + y, foot[1] + dz * d + nz * off];
  for (let i = 0; i < steps; i++) {
    const d0 = Lr * i / steps, d1 = Lr * (i + 1) / steps, y = H * (i + 1) / steps + 0.008, f = i / steps;
    const c = 0.28 * sp * Math.sin(i * 0.19 + q), hw = Math.min(w / 2 - 0.3, sp * (0.55 + 0.35 * (1 - f) + 0.2 * Math.sin(i * 0.43 + q * 2) + 0.12 * Math.sin(i * 1.3)));
    const a = P(d0, c - hw, y), b = P(d0, c + hw, y), e = P(d1, c + hw, y), g = P(d1, c - hw, y);
    // up-facing: wind so that the normal has y > 0 whichever way the stair runs
    const cross = (b[2] - a[2]) * (e[0] - a[0]) - (b[0] - a[0]) * (e[2] - a[2]);
    if (cross > 0) t.push(...a, ...b, ...e, ...a, ...e, ...g); else t.push(...a, ...e, ...b, ...a, ...g, ...e);
  }
  bag.add('plaster_damp', fromTriangles(t));
}
STYLES.tikal.elements.mt_stairwear = stairWear;
registerWear();
