// Where the door of a lot is (docs/settlements/thebes.md §15a): the same draws as houses.js makes, so the walk, the props and the sound map find a
// house's door without building it. The doors of an entered house are DOOR_OPEN wide (the walker's body is 0.6 m; the real doorways were narrower).
import { rng } from './kit.js';

export const DOOR_OPEN = 1.5;
/** { u, w, kind }: the door's middle along the lot's front (from rect[0]) and its width, for a lot { kind, rect, seed, open }; null for lots with none. */
export function doorSite(l) {
  const r = rng(l.seed), W = l.rect[2] - l.rect[0], open = !!l.open;
  if (l.kind === 'row') { r(); r(); return { u: W * (0.3 + r() * 0.4), w: open ? DOOR_OPEN : 0.9 }; }
  if (l.kind === 'court') { r(); r(); r(); return { u: W * (0.25 + r() * 0.5), w: open ? DOOR_OPEN : 1.0 }; }
  if (l.kind === 'villa') return { u: W / 2, w: 1.5 };
  if (l.kind === 'workshop') return { u: W / 2, w: 2.4 };
  return null;
}
/** The point of a lot's front wall at the door, and the unit step into the lot: { x, z, sg } (sg +1 when the front is on the north side, z grows into the lot). */
export function doorPoint(l) {
  const d = doorSite(l);
  if (!d) return null;
  const sg = l.front === 's' ? -1 : 1;
  return { x: l.rect[0] + d.u, z: l.front === 's' ? l.rect[3] : l.rect[1], sg, w: d.w };
}

/**
 * What lights an entered house at night, in the lot's frame (u along the front from rect[0], v into the lot, y up): the clay lamps (`lamps`: the foot's u, y, v, the stand's height h and the
 * light's intensity as houses.js's `lamp()` is called) and the window slits (`windows`: u, y, w, h). Mirrors the calls of houses.js (tests/thebes-night.test.mjs checks it
 * against them), so that the night's halo can be one plan of its own and no house needs the glow in its near tile (one draw, not one for each).
 */
export function litSpots(l) {
  if (!l.open) return null;
  const r = rng(l.seed), W = l.rect[2] - l.rect[0], th = 0.4;
  if (l.kind === 'row') {
    const H = 3.1 + r() * 0.3; r(); const uD = W * (0.3 + r() * 0.4);
    return { lamps: [{ u: W - th - 0.5, y: 0.5, v: 5.9, h: 0, i: 2.6 }], windows: [{ u: W * 0.5 + (uD < W / 2 ? 1.2 : -1.2), y: 2.45, w: 0.5, h: 0.32 }, { u: uD, y: H - 0.5, w: 0.5, h: 0.26 }] };
  }
  if (l.kind === 'court') {
    r(); r(); const cv = 5.5 + r() * 1.5;
    return { lamps: [{ u: W - th - 0.25, y: 0.42, v: cv + 1.4, h: 0, i: 2.6 }], windows: [{ u: W / 2, y: 2.5, w: 0.45, h: 0.3 }] };
  }
  if (l.kind === 'villa') {
    const hv = 6.2, cv = hv + 4.4;
    return { lamps: [{ u: W / 2 + 1.0, y: 0.03, v: hv + 2.5, h: 1.0, i: 2.6 }, { u: W / 2 - 1.0, y: 0.03, v: cv + 0.7, h: 1.0, i: 2.2 }], windows: [] };
  }
  return null;
}
