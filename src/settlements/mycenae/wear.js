// Mycenae about 1250 BC — wear on what is entered (docs/settlements/mycenae.md §16.5): the hollow worn in the threshold stone of a house by the feet that cross it (the stone is
// darkened and polished in its middle, wider where the feet come and go, a second small patch by the jamb), and the soot of every hearth and lamp of a room on the ceiling over it.
// Wraps the style's `house` from here (the style file stays as it was); pure functions of the element's own numbers. Nothing is written anywhere: Linear B tablets were baked clay
// kept in the palace's archive, not written on walls, and the signs are not set here (§16.5).
import '../../styles/mycenaean/index.js';
import './nightlight.js';
import { box, fromTriangles, orientOutward } from '../../core/geom.js';
import { STYLES } from '../../core/build.js';
import { mapper } from '../../styles/mycenaean/furnish.js';
import { mergeG } from '../../styles/mycenaean/util.js';
import { hashAt } from './nightlight.js';
import { terrain } from './layout.js';

let done = false;
export function registerWear() {
  if (done) return; done = true;
  const base = STYLES.mycenaean.elements.house;
  STYLES.mycenaean.elements.house = function worn(el, ctx) {
    const n = ctx.lights ? ctx.lights.length : 0;
    const r = base.call(this, el, ctx);
    if (el.simple || !el.rect) return r;
    const y = el.y ?? 0, m = mapper(el.rect, el.face ?? 'n'), { bag } = ctx, du = el.du ?? m.W / 2, dw = el.dw ?? 1.05;
    // (one geometry of both patches: a piece under 0.4 m would be a fine detail mesh of its own per cell and material, a draw each)
    bag.add('plaster_damp', mergeG([m.B(du - Math.min(0.6, dw / 2 - 0.1), y + 0.02, -0.4, du + Math.min(0.6, dw / 2 - 0.1), y + 0.024, -0.04), m.B(du - dw / 2 + 0.05, y + 0.024, -0.34, du - dw / 2 + 0.3, y + 0.027, -0.1)]));
    // the soot of each light of the room (hearth, forge, lamp) on the roof beams' underside above it
    const SH = el.sh ?? 2.95;
    if (ctx.lights) for (const l of ctx.lights.slice(n)) if (l.at[1] > y + 0.5 && l.at[1] < y + 2.0) bag.add('pottery_dark', box(l.at[0] - 0.3, y + SH - 0.4 - 0.012, l.at[2] - 0.3, l.at[0] + 0.3, y + SH - 0.4 - 0.004, l.at[2] + 0.3));
    return r;
  };
  // ── the Cyclopean walls and the Lion Gate (docs §17.4): damp and lichen at the foot, soot over the torches. Only materials the citadel's plan already holds (plaster_damp, pottery_dark). ──
  const wall0 = STYLES.mycenaean.elements.wall_run;
  STYLES.mycenaean.elements.wall_run = function weathered(el, ctx) {
    const r = wall0.call(this, el, ctx);
    if (el.simple || el.ashlar || !el.a || !el.b) return r;
    const [ax, az] = el.a, [bx, bz] = el.b, L = Math.hypot(bx - ax, bz - az), dx = (bx - ax) / L, dz = (bz - az) / L, ext = el.ext ?? 0, th = el.th, silt = [], moss = [];
    // the outer face is on the local -z side, which is world (dz, -dx) times the distance out. At the foot, between the swelling boulders' lowest courses: a bank of silt and washed earth
    // two steps high with a cap of moss and lichen on its wall-side step (the earth is pottery_dark's brown, the moss plaster_damp's grey-green: both are in the plan already)
    const c = (uu, off) => [ax + dx * uu + dz * off, az + dz * uu - dx * off];
    // a talus bank against the foot: a wedge sloping from hh at the wall to the ground a metre out (convex solid, sunk into the ground below)
    const wedge = (u0, u1, ob, of, g, hh, taper, out, sy = -0.5, toe = -0.05) => {
      const V = (u, o, y) => { const [x, z] = c(u, o); return [x, g + y, z]; };
      const P = [V(u0, ob, hh), V(u1, ob, hh), V(u0, ob, sy), V(u1, ob, sy), V(u0 + taper, of, toe), V(u1 - taper, of, toe), V(u0 + taper, of, sy), V(u1 - taper, of, sy)], t = [];
      const q = (a, b, cc, d) => t.push(...P[a], ...P[b], ...P[cc], ...P[a], ...P[cc], ...P[d]);
      q(0, 1, 5, 4); q(4, 5, 7, 6); q(0, 4, 6, 2); q(1, 5, 7, 3); q(0, 1, 3, 2); q(2, 3, 7, 6);
      out.push(fromTriangles(orientOutward(t)));
    };
    for (let u = -ext + 0.5; u < L + ext - 3.5;) {
      const w = 1.6 + 1.8 * hashAt(ax + dx * u, az + dz * u, 61), x = ax + dx * (u + w / 2), z = az + dz * (u + w / 2), q = hashAt(x, z, 62);
      if (q > 0.4) {
        const ob = th / 2 - 0.15, of = th / 2 + 0.55 + 0.45 * hashAt(x, z, 63), g = terrain(x + dz * (th / 2 + 0.4), z - dx * (th / 2 + 0.4)), hh = 0.35 + 0.4 * hashAt(x, z, 64);
        wedge(u, u + w, ob, of, g, hh, 0.45, silt);
        // the moss and lichen on its shoulder (a cap a hand thick laid on the slope, both materials already in the plan)
        const k = (of - ob), oc = ob + k * 0.1, oe = ob + k * 0.6, yc = hh * 0.9, ye = hh * 0.4 - 0.05;
        wedge(u + 0.3, u + w - 0.3, oc, oe, g, yc + 0.03, 0.3, moss, ye - 0.3, ye + 0.0);
      }
      u += w + 0.6 * hashAt(x, z, 66);
    }
    if (silt.length) { ctx.bag.add('rubble', mergeG(silt)); ctx.bag.add('plaster_damp', mergeG(moss)); }
    return r;
  };
  const gate0 = STYLES.mycenaean.elements.lion_gate;
  STYLES.mycenaean.elements.lion_gate = function weatheredGate(el, ctx) {
    const r = gate0.call(this, el, ctx);
    if (el.simple) return r;
    const X = el.x, hw = el.w / 2, y = el.y, zE = el.zExt ?? 11, damp = [];
    // the face of the gate's wall (it looks west, down the road): a band of damp and lichen along its foot either side of the opening, and patches higher where the rain runs off the lintel
    for (const s of [-1, 1]) for (let u = hw + 1.0; u < zE - 0.6;) {
      const w = 0.7 + 1.1 * hashAt(X, s * u, 71), q = hashAt(X, s * (u + 5), 72), hh = 0.2 + 0.3 * hashAt(X + u, s, 73), z0 = s > 0 ? u : -u - w;
      if (q > 0.2) damp.push(box(X - 0.045, y - 0.1, z0, X + 0.02, y + hh + 0.25, z0 + w));
      if (q > 0.55 && u < 6) damp.push(box(X - 0.045, y + 1.4 + 1.6 * hashAt(X, s * u, 74), z0 + 0.1, X + 0.01, y + 1.7 + 1.9 * hashAt(X, s * u, 75), z0 + 0.1 + 0.5 * w));
      u += w + 0.5 * hashAt(X, s * u, 76);
    }
    ctx.bag.add('plaster_damp', mergeG(damp));
    return r;
  };
}
registerWear();
