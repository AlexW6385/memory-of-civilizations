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
